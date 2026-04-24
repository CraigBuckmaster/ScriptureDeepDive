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
  EvidenceTrailRow,
  PanelRecommendationRow,
  StudyModeSelector,
  StudySessionStepper,
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
import { useGuidedStudySession, usePremium } from '../hooks';
import { buildGuidedStudyPlan, type GuidedStudyMode, type GuidedStudyStep } from '../services/guidedStudy';
import { useSettingsStore } from '../stores';
import { fontFamily, radii, spacing, useTheme } from '../theme';
import type { Book, Chapter, ChapterPanel, ParsedBookIntro, Section, SectionPanel, Verse } from '../types';
import { safeParse } from '../utils/logger';

interface RouteParams {
  bookId: string;
  chapterNum: number;
  initialStep?: GuidedStudyStep;
  verseNum?: number;
}

function StudySessionScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<{ StudySession: RouteParams }, 'StudySession'>>();
  const { bookId, chapterNum, initialStep } = route.params;
  const translation = useSettingsStore((s) => s.translation);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

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

  // When the screen is opened with an `initialStep` route param (from
  // ChapterScreen's StudySessionCTA), we want to jump the session to
  // that step ONCE at load time. A naive effect that fires on every
  // `currentStep` change would fight the user: each time they tap a
  // different step pill, `currentStep` flips, the effect re-runs,
  // and it snaps them back to `initialStep` forever. Guard with a ref
  // keyed on `sessionId` so the sync runs exactly once per session
  // load and never re-fires when the user navigates between steps.
  const appliedInitialStepForSessionRef = useRef<number | null>(null);
  useEffect(() => {
    if (sessionId == null || !initialStep) return;
    if (appliedInitialStepForSessionRef.current === sessionId) return;
    appliedInitialStepForSessionRef.current = sessionId;
    if (currentStep !== initialStep) {
      void setSessionStep(initialStep);
    }
  }, [currentStep, initialStep, sessionId, setSessionStep]);

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
    });
  }, [book, chapter, sections, chapterPanels, verses, bookIntro, studyMode]);

  const savePromptDrafts = useCallback(async () => {
    if (!plan) return;
    await Promise.all(
      plan.prompts.map((prompt) =>
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

  const askAmicus = useCallback(async () => {
    if (!isPremium) {
      showUpgrade('feature', 'Guided Study Review');
      return;
    }
    await session.saveSynthesis(synthesisDraft);
    const ref = `${book?.name ?? bookId} ${chapterNum}`;
    const clip = (s: string, n = 200) => (s.length > n ? `${s.slice(0, n - 3).trimEnd()}...` : s);
    const seedQuery =
      `Help me refine my study synthesis for ${ref}. ` +
      `Takeaway: ${clip(synthesisDraft.takeaway)}. ` +
      `Open question: ${clip(synthesisDraft.open_question)}. ` +
      `Key connection: ${clip(synthesisDraft.key_connection)}.`;
    navigation.getParent()?.navigate('AmicusTab', {
      screen: 'NewThread',
      params: {
        seedQuery,
        seedChapterRef: `${bookId}:${chapterNum}`,
      },
    });
  }, [book?.name, bookId, chapterNum, isPremium, navigation, session, showUpgrade, synthesisDraft]);

  const saveToMyStudy = useCallback(async () => {
    if (!plan) return;
    if (!isPremium) {
      showUpgrade('feature', 'Guided Study Review');
      return;
    }
    await savePromptDrafts();
    await session.saveSynthesis(synthesisDraft);
    await session.savePremiumReview(plan.title, plan.conceptChips);
    setReviewSaved(true);
    await session.setCurrentStep('review');
  }, [isPremium, plan, savePromptDrafts, session, showUpgrade, synthesisDraft]);

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
        <Text style={[styles.navTitle, { color: base.text }]}>Study {book?.name ?? bookId} {chapterNum}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <StudySessionStepper activeStep={session.currentStep} onSelect={goStep} />
        <StudyModeSelector value={studyMode} onChange={setStudyMode} />

        {session.currentStep === 'scene' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Set the Scene</Text>
            {plan.sceneRows.map((row) => (
              <View
                key={row.label}
                style={[styles.sceneRow, { borderBottomColor: `${base.border}55` }]}
              >
                <Text style={[styles.sceneLabel, { color: base.gold }]}>{row.label}</Text>
                <Text style={[styles.sceneValue, { color: base.textDim }]}>{row.value}</Text>
              </View>
            ))}
            <PrimaryButton label="Begin observing" onPress={() => goStep('observe')} />
          </View>
        )}

        {session.currentStep === 'observe' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Observe</Text>
            {plan.prompts.map((prompt) => (
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
            <PrimaryButton label="Explore study panels" onPress={() => goStep('explore')} />
          </View>
        )}

        {session.currentStep === 'explore' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Evidence Trail</Text>
            <Text style={[styles.sectionIntro, { color: base.textDim }]}>Open the panels in this order to build context before conclusions.</Text>
            {plan.evidenceTrail.length > 0 ? (
              <View style={styles.trailList}>
                {plan.evidenceTrail.map((item, index) => (
                  <EvidenceTrailRow
                    key={item.key}
                    item={item}
                    index={index}
                    onPress={() => openRecommendation(item.panelType, item.sectionNum)}
                  />
                ))}
              </View>
            ) : (
              <View
                style={[styles.list, { borderColor: base.border, backgroundColor: base.bgElevated }]}
              >
                {plan.recommendations.map((rec) => (
                  <PanelRecommendationRow
                    key={rec.key}
                    recommendation={rec}
                    onPress={() => openRecommendation(rec.panelType, rec.sectionNum)}
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
              <Text style={[styles.questionText, { color: base.text }]}>{plan.betterQuestionPrompt}</Text>
            </View>
            <PrimaryButton label="Synthesize what you saw" onPress={() => goStep('synthesize')} />
          </View>
        )}

        {session.currentStep === 'synthesize' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Synthesize</Text>
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
              <Text style={[styles.amicusText, { color: base.text }]}>Help me refine</Text>
            </TouchableOpacity>
            <PrimaryButton label="Save to My Study" onPress={saveToMyStudy} />
          </View>
        )}

        {session.currentStep === 'review' && (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: base.text }]}>Review</Text>
            <Text style={[styles.body, { color: base.textDim }]}>
              {reviewSaved
                ? 'Saved. Your review prompts and concept vocabulary are ready in My Study.'
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
          </View>
        )}
      </ScrollView>

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
