import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
} from '@react-navigation/native';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import {
  CarriedForwardBanner,
  EncounterCallout,
  EvidencePanelSheet,
  selectEncounterCallout,
  type EncounterCalloutData,
  EvidenceTrailRow,
  NextChapterNudge,
  type EvidenceSheetItem,
  ObservationChips,
  PanelRecommendationRow,
  ResumeBeat,
  SavedIndicator,
  SessionReader,
  StudyModeSelector,
  StudySessionStepper,
  SynthesisFreeRecap,
  SynthesisPremiumDraft,
  TimeBudgetSelector,
} from '../components/guidedStudy';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import {
  getBook,
  getBookIntro,
  getChapter,
  getChapterPanels,
  getSections,
  getSectionPanels,
  getVerses,
} from '../db/content';
import {
  getCapturedInputs,
  getConceptEncounterHistory,
  getGuidedStudyQuestionForSession,
} from '../db/userQueries';
import { setCapturedInputs, setGuidedDeferredTrail, setPreference } from '../db/userMutations';
import {
  completePlanItemForSession,
  getPriorDeferredTrail,
  LAST_MODE_PREF_KEY,
} from '../services/study';
import { useBooks, useGuidedStudySession, usePremium } from '../hooks';
import { completeGuidedStudySession } from '../db/userMutations';
import {
  buildCarryForwardItems,
  buildGuidedStudyPlan,
  completionPayoffCopy,
  formatChapterRef,
  getPromptBinding,
  prependDeferredKinds,
  setCapturedText,
  stepsWithCarryForward,
  type CapturedTextRef,
  type GuidedStudyMode,
  type GuidedStudyStep,
  type SceneInputKey,
} from '../services/guidedStudy';
import { chooseStrategy } from '../services/guidedStudy/synthesis/strategy';
import { recapTitleFor } from '../services/guidedStudy/synthesis/freeStrategy';
import type {
  SynthesisOutputBlock,
  SynthesisRunResult,
} from '../services/guidedStudy/synthesis/strategy';
import { markSoftPromptSeen, shouldShowSoftPrompt } from '../services/guidedStudy/softPrompt';
import { isFlagEnabled } from '../config/featureFlags';
import { useAmicusAccess } from '../hooks/useAmicusAccess';
import type { CapturedInputs } from '../services/guidedStudy/capturedInputs';
import { launchAmicusStudyThread } from '../services/amicus';
import { useSettingsStore } from '../stores';
import { fontFamily, radii, spacing, useTheme } from '../theme';
import type {
  Book,
  Chapter,
  ChapterPanel,
  ParsedBookIntro,
  Section,
  SectionPanel,
  Verse,
} from '../types';
import { logger, safeParse } from '../utils/logger';

interface RouteParams {
  bookId: string;
  chapterNum: number;
  initialStep?: GuidedStudyStep;
  verseNum?: number;
  /** Unified study plan this session belongs to (#1833). */
  planId?: string;
}

function StudySessionScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<{ StudySession: RouteParams }, 'StudySession'>>();
  const { bookId, chapterNum, initialStep, planId } = route.params;
  const translation = useSettingsStore((s) => s.translation);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const { liveBooks } = useBooks();
  const amicusAccess = useAmicusAccess();

  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [sections, setSections] = useState<Array<Section & { panels: SectionPanel[] }>>([]);
  const [chapterPanels, setChapterPanels] = useState<ChapterPanel[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bookIntro, setBookIntro] = useState<ParsedBookIntro | null>(null);
  const [loading, setLoading] = useState(true);

  const session = useGuidedStudySession(chapter?.id);
  const sessionId = session.sessionId;
  const currentStep = session.currentStep;
  const setSessionStep = session.setCurrentStep;
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});
  const [synthesisDraft, setSynthesisDraft] = useState(session.synthesis);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [studyMode, setStudyMode] = useState<GuidedStudyMode>('deep');
  // Reader expand preference (#1834) — per-session component state
  // only; survives step switches because the screen owns it.
  const [readerExpanded, setReaderExpanded] = useState(false);
  // Saved indicator (#1836): bumped ONLY after a capture persist
  // resolves — never optimistically.
  const [captureSavedTick, setCaptureSavedTick] = useState(0);
  // Resume beat (#1836): step to announce when resuming mid-session.
  const [resumeBeatStep, setResumeBeatStep] = useState<GuidedStudyStep | null>(null);
  // Time budget (#1842): null = Full (today's behavior, default).
  const [timeBudgetMin, setTimeBudgetMin] = useState<number | null>(null);
  // Trail kinds the plan's previous session deferred (#1842).
  const [priorDeferredKeys, setPriorDeferredKeys] = useState<string[]>([]);
  // Concept encounter callout (#1843): one per session, dismissible in
  // component state only.
  const [encounterCallout, setEncounterCallout] = useState<EncounterCalloutData | null>(null);
  const [encounterDismissed, setEncounterDismissed] = useState(false);
  const [capturedInputs, setCapturedInputsState] = useState<CapturedInputs>({});
  const captureSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const [bookRow, chapterRow, introRow, verseRows] = await Promise.all([
        getBook(bookId),
        getChapter(bookId, chapterNum),
        getBookIntro(bookId),
        getVerses(bookId, chapterNum, translation),
      ]);
      if (!chapterRow) {
        if (!cancelled) setLoading(false);
        return;
      }
      const sectionRows = await getSections(chapterRow.id);
      const panelsBySection = await Promise.all(
        sectionRows.map(async (section) => ({
          ...section,
          panels: await getSectionPanels(section.id),
        })),
      );
      const chapterPanelRows = await getChapterPanels(chapterRow.id);
      if (cancelled) return;
      setBook(bookRow);
      setChapter(chapterRow);
      setBookIntro(introRow ? safeParse<ParsedBookIntro | null>(introRow.intro_json, null) : null);
      setVerses(verseRows);
      setSections(panelsBySection);
      setChapterPanels(chapterPanelRows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, chapterNum, translation]);

  useEffect(() => {
    setResponseDrafts(
      Object.fromEntries(
        Object.entries(session.responses).map(([key, row]) => [key, row.response_text]),
      ),
    );
  }, [session.responses]);

  useEffect(() => {
    setSynthesisDraft(session.synthesis);
  }, [session.synthesis]);

  // Load persisted CapturedInputs once per session so scene input rows
  // (#1734) rehydrate after the user reopens the chapter.
  useEffect(() => {
    if (sessionId == null) {
      setCapturedInputsState({});
      return;
    }
    let cancelled = false;
    void (async () => {
      const loaded = await getCapturedInputs(sessionId);
      if (!cancelled) setCapturedInputsState(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Flush any pending debounced save when leaving the screen.
  useEffect(() => {
    return () => {
      if (captureSaveTimerRef.current) {
        clearTimeout(captureSaveTimerRef.current);
      }
    };
  }, []);

  const updateCapturedField = useCallback(
    (ref: CapturedTextRef, value: string) => {
      const sid = sessionId;
      setCapturedInputsState((prev) => {
        const next = setCapturedText(prev, ref, value);
        if (sid != null) {
          if (captureSaveTimerRef.current) clearTimeout(captureSaveTimerRef.current);
          captureSaveTimerRef.current = setTimeout(() => {
            // Saved indicator (#1836) bumps only when the persist
            // actually resolved — a failed write shows nothing.
            void setCapturedInputs(sid, next)
              .then(() => setCaptureSavedTick((tick) => tick + 1))
              .catch((err) =>
                logger.warn('StudySessionScreen', 'Failed to persist captured inputs', err),
              );
          }, 500);
        }
        return next;
      });
    },
    [sessionId],
  );

  const updateSceneInput = useCallback(
    (key: SceneInputKey, value: string) => updateCapturedField({ step: 'scene', key }, value),
    [updateCapturedField],
  );

  // Observation chips (#1839): toggle a chip label in/out of
  // observeSelections with the same debounced persist + saved tick the
  // text captures use.
  const toggleObserveSelection = useCallback(
    (label: string) => {
      const sid = sessionId;
      setCapturedInputsState((prev) => {
        const current = prev.observeSelections ?? [];
        const next: CapturedInputs = {
          ...prev,
          observeSelections: current.includes(label)
            ? current.filter((l) => l !== label)
            : [...current, label],
        };
        if (sid != null) {
          if (captureSaveTimerRef.current) clearTimeout(captureSaveTimerRef.current);
          captureSaveTimerRef.current = setTimeout(() => {
            void setCapturedInputs(sid, next)
              .then(() => setCaptureSavedTick((tick) => tick + 1))
              .catch((err) =>
                logger.warn('StudySessionScreen', 'Failed to persist observation chips', err),
              );
          }, 500);
        }
        return next;
      });
    },
    [sessionId],
  );

  // Remember the chosen mode so the one-decision plan picker (#1833)
  // can default to it without ever asking.
  const handleModeChange = useCallback((mode: GuidedStudyMode) => {
    setStudyMode(mode);
    void setPreference(LAST_MODE_PREF_KEY, mode).catch((err) =>
      logger.warn('StudySessionScreen', 'Failed to persist last study mode', err),
    );
  }, []);

  // Preserves #1654. The codex branch (codex/amicus-auth-access-hardening)
  // was cut before #1654 merged and reverts this guard. Do NOT remove it
  // without the bounce-back bug returning: a naive effect that fires on
  // every `currentStep` change will snap the user back to `initialStep`
  // every time they tap a stepper pill, making the whole phase tab row
  // appear inert. Guard with a ref keyed on `sessionId` so the sync runs
  // exactly once per session load and never re-fires when the user
  // navigates between steps.
  const appliedInitialStepForSessionRef = useRef<number | null>(null);
  useEffect(() => {
    if (sessionId == null || !initialStep) return;
    if (appliedInitialStepForSessionRef.current === sessionId) return;
    appliedInitialStepForSessionRef.current = sessionId;
    if (currentStep !== initialStep) {
      void setSessionStep(initialStep);
    }
  }, [currentStep, initialStep, sessionId, setSessionStep]);

  // Resume beat (#1836): once per session load, when the session comes
  // back past the scene step with existing responses, surface one
  // dismissible "picking up where you left off" line. Ref-guarded like
  // the initialStep sync so step taps never re-trigger it.
  const resumeBeatShownForSessionRef = useRef<number | null>(null);
  useEffect(() => {
    if (sessionId == null || session.isLoading) return;
    if (resumeBeatShownForSessionRef.current === sessionId) return;
    resumeBeatShownForSessionRef.current = sessionId;
    if (currentStep !== 'scene' && Object.keys(session.responses).length > 0) {
      setResumeBeatStep(currentStep);
    }
  }, [currentStep, session.isLoading, session.responses, sessionId]);

  // Soft "after 3 sessions" upgrade nudge (#1742). Fires once per device
  // for free users who reach the review step with >= 3 completed sessions.
  // markSoftPromptSeen runs before the modal so re-entering the review step
  // can't double-fire.
  useEffect(() => {
    if (currentStep !== 'review') return;
    let cancelled = false;
    void shouldShowSoftPrompt({ isPremium }).then((show) => {
      if (cancelled || !show) return;
      void markSoftPromptSeen();
      showUpgrade('feature', 'Companion Study Partner');
    });
    return () => {
      cancelled = true;
    };
  }, [currentStep, isPremium, showUpgrade]);

  const plan = useMemo(() => {
    if (!chapter) return null;
    return buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels,
      verses,
      bookIntro,
      mode: studyMode,
      ...(timeBudgetMin != null ? { timeBudgetMin } : {}),
    });
  }, [book, chapter, sections, chapterPanels, verses, bookIntro, studyMode, timeBudgetMin]);

  // Persist this session's deferred trail keys (#1842) so the plan's
  // next session can front-load them. An empty list clears the column.
  useEffect(() => {
    if (sessionId == null || !plan) return;
    void setGuidedDeferredTrail(
      sessionId,
      plan.deferredTrail.map((item) => item.key),
    ).catch((err) =>
      logger.warn('StudySessionScreen', 'Failed to persist deferred trail', err),
    );
  }, [sessionId, plan]);

  // Load the previous plan session's deferrals once per session (#1842).
  useEffect(() => {
    if (!planId || sessionId == null) return;
    let cancelled = false;
    void getPriorDeferredTrail(planId, sessionId)
      .then((keys) => {
        if (!cancelled) setPriorDeferredKeys(keys);
      })
      .catch((err) =>
        logger.warn('StudySessionScreen', 'Failed to load prior deferred trail', err),
      );
    return () => {
      cancelled = true;
    };
  }, [planId, sessionId]);

  // Longitudinal study memory (#1843): when this plan's concept chips
  // intersect prior encounters (total >= 2, with a prior chapter to
  // point back to), surface at most one callout — highest count wins.
  useEffect(() => {
    if (!plan || !chapter) return;
    const conceptIds = plan.conceptChips.map((chip) => chip.id);
    if (conceptIds.length === 0) return;
    let cancelled = false;
    void getConceptEncounterHistory(conceptIds)
      .then((rows) => {
        if (!cancelled) setEncounterCallout(selectEncounterCallout(rows, chapter.id));
      })
      .catch((err) =>
        logger.warn('StudySessionScreen', 'Failed to load concept encounter history', err),
      );
    return () => {
      cancelled = true;
    };
  }, [plan, chapter]);

  const openEncounterChapter = useCallback(
    (chapterId: string) => {
      const match = chapterId.match(/^(.+)_(\d+)$/);
      if (!match) return;
      navigation.navigate('Chapter', {
        bookId: match[1],
        chapterNum: parseInt(match[2], 10),
      });
    },
    [navigation],
  );

  // Deferred kinds from last time lead today's trail (#1842).
  const displayTrail = useMemo(
    () => (plan ? prependDeferredKinds(plan.evidenceTrail, priorDeferredKeys) : []),
    [plan, priorDeferredKeys],
  );

  const synthesisStrategy = useMemo(
    () =>
      chooseStrategy({
        isPremium,
        amicusFlagEnabled: isFlagEnabled('GUIDED_STUDY_AMICUS_SYNTHESIS'),
        amicusCanUse: amicusAccess.canUse,
      }),
    [isPremium, amicusAccess.canUse],
  );

  const [synthesisResult, setSynthesisResult] = useState<SynthesisRunResult | null>(null);
  // premium_amicus streaming UI state — only used when strategy.kind ===
  // 'premium_amicus'. Tokens accumulate in amicusStreamingText; the
  // strategy completes (or errors) into setSynthesisResult.
  const [amicusStreamingText, setAmicusStreamingText] = useState('');
  const [amicusIsStreaming, setAmicusIsStreaming] = useState(false);
  const [amicusError, setAmicusError] = useState<Error | null>(null);

  // Free + premium_structured: both resolve synchronously, run on
  // capturedInputs change so the recap reflects the latest writes.
  useEffect(() => {
    if (!plan || synthesisStrategy.kind === 'premium_amicus') {
      setSynthesisResult(null);
      return;
    }
    let cancelled = false;
    void synthesisStrategy
      .run({
        plan,
        captured: capturedInputs,
        sessionId,
        bookId,
        chapterNum,
      })
      .then((r) => {
        if (!cancelled) setSynthesisResult(r);
      })
      .catch((err) => logger.warn('StudySessionScreen', 'synthesis run failed', err));
    return () => {
      cancelled = true;
    };
  }, [synthesisStrategy, plan, capturedInputs, sessionId, bookId, chapterNum]);

  // premium_amicus: stream once when the user lands on the synthesize
  // step. Re-runs only if the strategy itself changes (e.g. cap was
  // exhausted mid-session and chooseStrategy now returns structured).
  useEffect(() => {
    if (!plan || synthesisStrategy.kind !== 'premium_amicus') {
      setAmicusStreamingText('');
      setAmicusIsStreaming(false);
      setAmicusError(null);
      return;
    }
    if (currentStep !== 'synthesize') return;
    let cancelled = false;
    setAmicusStreamingText('');
    setAmicusError(null);
    setAmicusIsStreaming(true);
    setSynthesisResult(null);
    void synthesisStrategy
      .run(
        { plan, captured: capturedInputs, sessionId, bookId, chapterNum },
        {
          onAmicusDelta: (token) => {
            if (cancelled) return;
            setAmicusStreamingText((prev) => prev + token);
          },
          onAmicusComplete: () => {
            if (cancelled) return;
            setAmicusIsStreaming(false);
          },
          onError: (err) => {
            if (cancelled) return;
            setAmicusError(err);
            setAmicusIsStreaming(false);
          },
        },
      )
      .then((r) => {
        if (cancelled) return;
        setSynthesisResult(r);
        setAmicusIsStreaming(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setAmicusIsStreaming(false);
        logger.warn('StudySessionScreen', 'amicus synthesis run failed', err);
      });
    return () => {
      cancelled = true;
    };
    // capturedInputs / sessionId intentionally omitted from deps so
    // the stream doesn't restart on every keystroke once it's running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synthesisStrategy, plan, currentStep]);

  const synthesisBlocks: SynthesisOutputBlock[] = synthesisResult?.output ?? [];

  const savePromptDrafts = useCallback(async () => {
    if (!plan) return;
    await Promise.all(
      plan.legacyPrompts.map((prompt) =>
        session.saveResponse(prompt.key, prompt.text, responseDrafts[prompt.key] ?? ''),
      ),
    );
  }, [plan, responseDrafts, session]);

  const goStep = useCallback(
    async (step: GuidedStudyStep) => {
      await savePromptDrafts();
      await session.saveSynthesis(synthesisDraft);
      await session.setCurrentStep(step);
    },
    [savePromptDrafts, session, synthesisDraft],
  );

  const openRecommendation = useCallback(
    (panelType: string, sectionNum?: number) => {
      navigation.navigate('Chapter', {
        bookId,
        chapterNum,
        openPanel: { panelType, ...(sectionNum ? { sectionNum } : {}) },
      });
    },
    [bookId, chapterNum, navigation],
  );

  // Evidence panel sheet (#1835): evidence opens in place; the only way
  // out of the session is the sheet's explicit "Open full chapter" link.
  const [sheetItem, setSheetItem] = useState<EvidenceSheetItem | null>(null);

  const findPanelContent = useCallback(
    (panelType: string, sectionNum?: number): string | null => {
      if (sectionNum != null) {
        const section = sections.find((s) => s.section_num === sectionNum);
        return section?.panels.find((p) => p.panel_type === panelType)?.content_json ?? null;
      }
      return chapterPanels.find((p) => p.panel_type === panelType)?.content_json ?? null;
    },
    [sections, chapterPanels],
  );

  const openEvidence = useCallback(
    (item: EvidenceSheetItem) => {
      setSheetItem(item);
      session.markTrailItemVisited(item.key);
    },
    [session],
  );

  const closeEvidenceSheet = useCallback(() => setSheetItem(null), []);

  const openSheetItemFullChapter = useCallback(() => {
    const item = sheetItem;
    setSheetItem(null);
    if (item) openRecommendation(item.panelType, item.sectionNum);
  }, [openRecommendation, sheetItem]);

  const askAmicus = useCallback(async () => {
    if (!isPremium) {
      showUpgrade('feature', 'Companion Study Partner');
      return;
    }
    await session.saveSynthesis(synthesisDraft);
    const clip = (s: string, n = 220) => (s.length > n ? `${s.slice(0, n - 3).trimEnd()}...` : s);
    const linkedQuestion =
      sessionId != null ? await getGuidedStudyQuestionForSession(sessionId) : null;

    const fallbackQuestion = synthesisDraft.open_question.trim();
    const takeaway = synthesisDraft.takeaway.trim();
    const keyConnection = synthesisDraft.key_connection.trim();
    const chapterLabel = formatChapterRef(`${bookId}_${chapterNum}`);

    const seedQuery = linkedQuestion?.question_text
      ? `Help me investigate this study question in ${chapterLabel}: ${clip(linkedQuestion.question_text)}`
      : fallbackQuestion
        ? `Help me investigate this study question in ${chapterLabel}: ${clip(fallbackQuestion)}`
        : `Help me refine my study synthesis for ${chapterLabel}. Takeaway: ${clip(takeaway)}. Key connection: ${clip(keyConnection)}.`;

    await launchAmicusStudyThread(navigation, {
      entryPoint: 'guided_study',
      chapterId: `${bookId}_${chapterNum}`,
      sessionId,
      guidedStudyStep: 'synthesize',
      openQuestionId: linkedQuestion?.id ?? null,
      openQuestionText: linkedQuestion?.question_text ?? fallbackQuestion,
      takeaway,
      keyConnection,
      seedQuery,
    });
  }, [bookId, chapterNum, isPremium, navigation, session, sessionId, showUpgrade, synthesisDraft]);

  const saveToMyStudy = useCallback(async () => {
    if (!plan) return;
    if (!isPremium) {
      showUpgrade('feature', 'Companion Study Partner');
      return;
    }
    await savePromptDrafts();
    await session.saveSynthesis(synthesisDraft);
    await session.savePremiumReview(plan.title, plan.conceptChips);
    setReviewSaved(true);
    await session.setCurrentStep('review');
  }, [isPremium, plan, savePromptDrafts, session, showUpgrade, synthesisDraft]);

  const amicusLabel = synthesisDraft.open_question.trim()
    ? 'Investigate this question'
    : synthesisDraft.key_connection.trim()
      ? 'Trace this connection'
      : 'Help me refine';

  if (loading || session.isLoading || !plan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ActivityIndicator color={base.gold} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={[styles.nav, { borderBottomColor: base.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <ArrowLeft size={20} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: base.text }]}>
          Study {book?.name ?? bookId} {chapterNum}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <StudySessionStepper
          activeStep={session.currentStep}
          onSelect={goStep}
          carryForwardSteps={stepsWithCarryForward(plan.mode, capturedInputs)}
        />
        <StudyModeSelector value={studyMode} onChange={handleModeChange} />
        {resumeBeatStep && (
          <ResumeBeat step={resumeBeatStep} onDismiss={() => setResumeBeatStep(null)} />
        )}
        <SavedIndicator savedTick={captureSavedTick} />

        {session.currentStep === 'scene' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Set the Scene</Text>
            {Object.keys(session.responses).length === 0 && (
              <TimeBudgetSelector value={timeBudgetMin} onChange={setTimeBudgetMin} />
            )}
            {encounterCallout && !encounterDismissed && (
              <EncounterCallout
                callout={encounterCallout}
                onOpenChapter={openEncounterChapter}
                onDismiss={() => setEncounterDismissed(true)}
              />
            )}
            <SessionReader
              verses={verses}
              initiallyExpanded={readerExpanded}
              onToggle={setReaderExpanded}
            />
            <StepBanner step="scene" />
            <ModePromptList step="scene" />
            {plan.sceneRows.map((row) => (
              <View
                key={row.label}
                style={[styles.sceneRow, { borderBottomColor: `${base.border}55` }]}
              >
                <Text style={[styles.sceneLabel, { color: base.gold }]}>{row.label}</Text>
                {row.kind === 'display' ? (
                  <Text style={[styles.sceneValue, { color: base.textDim }]}>{row.value}</Text>
                ) : (
                  <TextInput
                    value={capturedInputs.scene?.[row.capturedKey] ?? ''}
                    onChangeText={(text) => updateSceneInput(row.capturedKey, text)}
                    placeholder={row.placeholder}
                    placeholderTextColor={base.textMuted}
                    style={[
                      styles.sceneInput,
                      {
                        color: base.text,
                        borderColor: base.border,
                        backgroundColor: base.bgSurface,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
            <PrimaryButton label="Begin observing" onPress={() => goStep('observe')} />
          </View>
        )}

        {session.currentStep === 'observe' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Observe</Text>
            <SessionReader
              verses={verses}
              initiallyExpanded={readerExpanded}
              onToggle={setReaderExpanded}
            />
            <StepBanner step="observe" />
            <ModePromptList step="observe" />
            {plan.legacyPrompts.map((prompt) => (
              <View key={prompt.key} style={styles.promptBlock}>
                <Text style={[styles.promptText, { color: base.text }]}>{prompt.text}</Text>
                <TextInput
                  value={responseDrafts[prompt.key] ?? ''}
                  onChangeText={(text) =>
                    setResponseDrafts((prev) => ({ ...prev, [prompt.key]: text }))
                  }
                  placeholder="Write a short observation..."
                  placeholderTextColor={base.textMuted}
                  multiline
                  style={[
                    styles.input,
                    { color: base.text, borderColor: base.border, backgroundColor: base.bgSurface },
                  ]}
                />
              </View>
            ))}
            <ObservationChips
              chips={plan.observationChips}
              selected={capturedInputs.observeSelections ?? []}
              onToggle={toggleObserveSelection}
            />
            <PrimaryButton label="Explore study panels" onPress={() => goStep('explore')} />
          </View>
        )}

        {session.currentStep === 'explore' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Evidence Trail</Text>
            <StepBanner step="explore" />
            <ModePromptList step="explore" />
            <Text style={[styles.sectionIntro, { color: base.textDim }]}>
              Open the panels in this order to build context before conclusions.
            </Text>
            {displayTrail.length > 0 ? (
              <>
                <View style={styles.trailList}>
                  {displayTrail.map((item, index) => (
                    <EvidenceTrailRow
                      key={item.key}
                      item={item}
                      index={index}
                      visited={session.visitedTrail.includes(item.key)}
                      onPress={() => openEvidence(item)}
                    />
                  ))}
                </View>
                <Text style={[styles.trailProgress, { color: base.textMuted }]}>
                  {
                    displayTrail.filter((item) => session.visitedTrail.includes(item.key))
                      .length
                  }{' '}
                  of {displayTrail.length} opened
                </Text>
              </>
            ) : (
              <View
                style={[
                  styles.list,
                  { borderColor: base.border, backgroundColor: base.bgElevated },
                ]}
              >
                {plan.recommendations.map((rec) => (
                  <PanelRecommendationRow
                    key={rec.key}
                    recommendation={rec}
                    onPress={() => openEvidence(rec)}
                  />
                ))}
              </View>
            )}
            <View
              style={[
                styles.questionCard,
                { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` },
              ]}
            >
              <Text style={[styles.questionLabel, { color: base.gold }]}>Better question</Text>
              <Text style={[styles.questionText, { color: base.text }]}>
                {plan.betterQuestionPrompt}
              </Text>
            </View>
            <PrimaryButton label="Synthesize what you saw" onPress={() => goStep('synthesize')} />
          </View>
        )}

        {session.currentStep === 'synthesize' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Synthesize</Text>
            <StepBanner step="synthesize" />
            <ModePromptList step="synthesize" />
            <SynthesisInput
              label="My takeaway"
              value={synthesisDraft.takeaway}
              onChangeText={(text) => setSynthesisDraft((prev) => ({ ...prev, takeaway: text }))}
            />
            <SynthesisInput
              label="Open question"
              value={synthesisDraft.open_question}
              onChangeText={(text) =>
                setSynthesisDraft((prev) => ({ ...prev, open_question: text }))
              }
            />
            <SynthesisInput
              label="Key connection"
              value={synthesisDraft.key_connection}
              onChangeText={(text) =>
                setSynthesisDraft((prev) => ({ ...prev, key_connection: text }))
              }
            />
            <TouchableOpacity
              onPress={askAmicus}
              style={[
                styles.amicusRow,
                { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` },
              ]}
            >
              <View style={[styles.amicusStripe, { backgroundColor: base.gold }]} />
              <MessageSquare size={16} color={base.gold} />
              <Text style={[styles.amicusText, { color: base.text }]}>{amicusLabel}</Text>
            </TouchableOpacity>
            <PrimaryButton label="Save to My Study" onPress={saveToMyStudy} />
            {synthesisStrategy.kind === 'premium_amicus' ? (
              <SynthesisPremiumDraft
                title={recapTitleFor(plan.mode)}
                streamingText={amicusStreamingText}
                isStreaming={amicusIsStreaming}
                artifact={synthesisResult?.artifact ?? null}
                error={amicusError}
                onOpenInAmicus={askAmicus}
                onViewMyStudy={() =>
                  navigation.getParent()?.navigate('MoreTab', { screen: 'MyStudy' })
                }
              />
            ) : (
              <SynthesisFreeRecap
                title={recapTitleFor(plan.mode)}
                chapterTitle={plan.title}
                blocks={synthesisBlocks}
                onUpgradeNudgePress={() =>
                  showUpgrade('feature', 'Companion Study Partner')
                }
                onViewMyStudy={() =>
                  navigation.getParent()?.navigate('MoreTab', { screen: 'MyStudy' })
                }
              />
            )}
          </View>
        )}

        {session.currentStep === 'review' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Review</Text>
            <StepBanner step="review" />
            <ModePromptList step="review" />
            <Text style={[styles.body, { color: base.textDim }]}>
              {reviewSaved
                ? completionPayoffCopy()
                : isPremium
                  ? 'Save your synthesis to create spaced review prompts for this chapter.'
                  : 'Review prompts and concept vocabulary are included with Companion+.'}
            </Text>
            <View style={styles.chipRow}>
              {plan.conceptChips.map((chip) => (
                <View key={chip.id} style={[styles.chip, { borderColor: `${base.gold}35` }]}>
                  <Text style={[styles.chipText, { color: base.gold }]}>{chip.label}</Text>
                </View>
              ))}
            </View>
            <PrimaryButton
              label="Open My Study"
              onPress={() => navigation.getParent()?.navigate('MoreTab', { screen: 'MyStudy' })}
            />
            <NextChapterNudge
              bookId={bookId}
              chapterNum={chapterNum}
              books={liveBooks}
              onOpenNext={(next) =>
                navigation.navigate('Chapter', {
                  bookId: next.bookId,
                  chapterNum: next.chapterNum,
                })
              }
              onMarkComplete={() => {
                if (sessionId != null) {
                  void completeGuidedStudySession(sessionId);
                  // Plan wiring (#1833): completing a plan-launched
                  // session also completes/links the matching item.
                  if (planId) {
                    void completePlanItemForSession(planId, bookId, chapterNum, sessionId).catch(
                      (err) =>
                        logger.warn('StudySessionScreen', 'Failed to complete plan item', err),
                    );
                  }
                }
                navigation.goBack();
              }}
              onRestart={() =>
                navigation.navigate('Chapter', { bookId: 'genesis', chapterNum: 1 })
              }
            />
          </View>
        )}
      </ScrollView>

      <EvidencePanelSheet
        visible={sheetItem != null}
        item={sheetItem}
        contentJson={sheetItem ? findPanelContent(sheetItem.panelType, sheetItem.sectionNum) : null}
        onClose={closeEvidenceSheet}
        onOpenFullChapter={openSheetItemFullChapter}
      />

      {upgradeRequest && (
        <UpgradePrompt
          visible
          onClose={dismissUpgrade}
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
        />
      )}
    </SafeAreaView>
  );

  function SynthesisInput({
    label,
    value,
    onChangeText,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
  }) {
    return (
      <View style={styles.promptBlock}>
        <Text style={[styles.promptText, { color: base.gold }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Write a short synthesis..."
          placeholderTextColor={base.textMuted}
          multiline
          style={[
            styles.input,
            { color: base.text, borderColor: base.border, backgroundColor: base.bgSurface },
          ]}
        />
      </View>
    );
  }

  function StepBanner({ step }: { step: GuidedStudyStep }) {
    if (!plan) return null;
    const items = buildCarryForwardItems(plan.mode, step, capturedInputs);
    return <CarriedForwardBanner items={items} />;
  }

  function ModePromptList({ step }: { step: GuidedStudyStep }) {
    if (!plan) return null;
    const prompts = plan.stepPrompts[step] ?? [];
    if (prompts.length === 0) return null;
    return (
      <>
        {prompts.map((prompt) => {
          const binding = getPromptBinding(prompt.key);
          if (!binding) {
            return (
              <View key={prompt.key} style={styles.promptBlock}>
                <Text style={[styles.modePromptText, { color: base.textDim }]}>
                  {prompt.text}
                </Text>
              </View>
            );
          }
          const value =
            (capturedInputs[binding.step] as Record<string, unknown> | undefined)?.[binding.key];
          return (
            <View key={prompt.key} style={styles.promptBlock}>
              <Text style={[styles.modePromptText, { color: base.text }]}>{prompt.text}</Text>
              <TextInput
                value={typeof value === 'string' ? value : ''}
                onChangeText={(text) => updateCapturedField(binding, text)}
                placeholder="Capture your thinking..."
                placeholderTextColor={base.textMuted}
                multiline
                style={[
                  styles.input,
                  { color: base.text, borderColor: base.border, backgroundColor: base.bgSurface },
                ]}
              />
            </View>
          );
        })}
      </>
    );
  }

  function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.primaryButton, { backgroundColor: base.gold }]}
      >
        <Text style={styles.primaryText}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  nav: {
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  navTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
  },
  content: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    paddingHorizontal: spacing.md,
  },
  heading: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.md,
  },
  sectionIntro: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  sceneRow: {
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  sceneLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  sceneInput: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: 4,
  },
  sceneValue: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
  },
  promptBlock: {
    marginBottom: spacing.md,
  },
  promptText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  modePromptText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    minHeight: 92,
    padding: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  list: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  trailProgress: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    textAlign: 'center',
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  trailList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  questionText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryText: {
    color: '#111111',
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  amicusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    minHeight: 46,
    overflow: 'hidden',
    paddingRight: spacing.md,
    marginBottom: spacing.sm,
  },
  amicusStripe: {
    width: 3,
    alignSelf: 'stretch',
  },
  amicusText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});

export default withErrorBoundary(StudySessionScreen);
