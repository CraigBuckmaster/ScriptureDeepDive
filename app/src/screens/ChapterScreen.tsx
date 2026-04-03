/**
 * ChapterScreen — The main reading experience (90% of user time).
 *
 * Layout: ChapterNavBar (sticky top) → ScrollView (ChapterHeader →
 * sections.map(SectionBlock) → ScholarlyBlock). QnavOverlay via modal.
 *
 * Data: useChapterData loads everything. readerStore manages panel state.
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager, StyleSheet, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp, OpenPanelParam } from '../navigation/types';
import type { Book, CoachingTip } from '../types';

import { useChapterData } from '../hooks/useChapterData';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { useNotedVerses } from '../hooks/useNotedVerses';
import { useReaderStore, useSettingsStore } from '../stores';
import { recordVisit } from '../db/user';
import { GenreBanner } from '../components/GenreBanner';
import { StudyCoachCard } from '../components/StudyCoachCard';
import { useStudyDepth } from '../hooks/useStudyDepth';
import { useTranslationSwitch } from '../hooks/useTranslationSwitch';
import { useStoreReview } from '../hooks/useStoreReview';
import { logEvent } from '../services/analytics';
import { updateLastActive, cancelReengagement } from '../services/reengagement';
import { getBook } from '../db/content';

import { useRedLetter } from '../hooks/useRedLetter';
import { LexiconSheet } from '../components/LexiconSheet';
import { ChapterNavBar } from '../components/ChapterNavBar';
import { CompareBar } from '../components/CompareBar';
import { ChapterHeader } from '../components/ChapterHeader';
import { SectionBlock } from '../components/SectionBlock';
import { ButtonRow } from '../components/ButtonRow';
import { PanelContainer } from '../components/PanelContainer';
import { ScholarlyBlock } from '../components/ScholarlyBlock';
import { QnavOverlay } from '../components/QnavOverlay';
import { NotesOverlay } from '../components/notes';
import { ChapterSkeleton } from '../components/ChapterSkeleton';
import { VerseLongPressMenu } from '../components/VerseLongPressMenu';
import { HighlightColorPicker, HIGHLIGHT_COLORS } from '../components/HighlightColorPicker';
import { setHighlight, removeHighlight, getHighlightsForChapter, type VerseHighlight } from '../db/user';
import { InterlinearSheet } from '../components/InterlinearSheet';
import { TTSControls } from '../components/TTSControls';
import { useTTS } from '../hooks/useTTS';
import { useBookmarkedVerses } from '../hooks/useBookmarkedVerses';

import { TRANSLATION_MAP } from '../db/translationRegistry';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useChapterFingerprint } from '../hooks/useChapterFingerprint';
import { ChapterFingerprint } from '../components/ChapterFingerprint';
import { usePremium } from '../hooks/usePremium';
import { UpgradePrompt } from '../components/UpgradePrompt';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChapterScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Read', 'Chapter'>>();
  const route = useRoute<ScreenRouteProp<'Read', 'Chapter'>>();
  const { bookId, chapterNum, openPanel } = route.params ?? {};

  const fontSize = useSettingsStore((s) => s.fontSize);
  const translation = useSettingsStore((s) => s.translation);
  const comparisonTranslation = useSettingsStore((s) => s.comparisonTranslation);
  const setComparisonTranslation = useSettingsStore((s) => s.setComparisonTranslation);
  const { switchTranslation } = useTranslationSwitch();
  const { checkAndPrompt } = useStoreReview();
  const studyCoachEnabled = useSettingsStore((s) => s.studyCoachEnabled);
  const activePanel = useReaderStore((s) => s.activePanel);
  const setActivePanel = useReaderStore((s) => s.setActivePanel);
  const clearActivePanel = useReaderStore((s) => s.clearActivePanel);
  const qnavOpen = useReaderStore((s) => s.qnavOpen);
  const toggleQnav = useReaderStore((s) => s.toggleQnav);
  const notesOverlayOpen = useReaderStore((s) => s.notesOverlayOpen);
  const toggleNotes = useReaderStore((s) => s.toggleNotesOverlay);
  const [noteVerseNum, setNoteVerseNum] = useState<number | null>(null);
  const [longPress, setLongPress] = useState<{ verseNum: number; text: string } | null>(null);
  const [interlinearVerse, setInterlinearVerse] = useState<number | null>(null);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const handleInterlinearPress = useCallback((verseNum: number) => {
    if (!isPremium) {
      showUpgrade('feature', 'Interlinear Hebrew & Greek');
      return;
    }
    setInterlinearVerse(verseNum);
  }, [isPremium, showUpgrade]);
  const [lexiconStrongs, setLexiconStrongs] = useState<string | null>(null);
  const [lexiconWordStudyId, setLexiconWordStudyId] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);

  const {
    chapter, sections, verses, comparisonVerses, vhlGroups,
    chapterPanels, noteCount, isLoading,
  } = useChapterData(bookId, chapterNum);

  const sectionPanelsForFingerprint = useMemo(
    () => sections.map((s) => s.panels),
    [sections],
  );
  const fingerprintScores = useChapterFingerprint(
    sectionPanelsForFingerprint,
    chapterPanels,
    !!chapter?.timeline_link_event,
    !!chapter?.map_story_link_id,
  );

  const redLetterVerses = useRedLetter(bookId, chapterNum);

  const ttsVoice = useSettingsStore((s) => s.ttsVoice);
  const tts = useTTS(verses, ttsVoice || undefined);
  const [ttsActive, setTtsActive] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sectionYMap = useRef<Record<string, number>>({});
  const verseYMap = useRef<Record<number, number>>({});
  const btnRowYMap = useRef<Record<string, number>>({});
  const [bookData, setBookData] = React.useState<Book | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dismissedTips, setDismissedTips] = useState<Set<number>>(new Set());

  // Parse coaching tips from chapter data
  const coachingTips = useMemo<CoachingTip[]>(() => {
    if (!chapter?.coaching_json) return [];
    try {
      return JSON.parse(chapter.coaching_json);
    } catch {
      return [];
    }
  }, [chapter?.coaching_json]);

  // Reset dismissed tips when chapter changes
  useEffect(() => {
    setDismissedTips(new Set());
  }, [bookId, chapterNum]);

  // Scroll progress tracking
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, contentOffset.y / maxScroll)));
    }
  }, []);

  // Auto-scroll to button row when a panel opens
  useEffect(() => {
    if (activePanel && activePanel.sectionId !== '__chapter__') {
      // Prefer button row Y (puts buttons + panel in view), fall back to section top
      const btnY = btnRowYMap.current[activePanel.sectionId];
      const secY = sectionYMap.current[activePanel.sectionId];
      const y = btnY ?? secY;
      if (y !== undefined) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
        }, 100);
      }
    }
  }, [activePanel]);

  // Load book data for nav
  useEffect(() => {
    if (bookId) getBook(bookId).then(setBookData);
  }, [bookId]);

  // Record visit
  useEffect(() => {
    if (bookId && chapterNum) {
      recordVisit(bookId, chapterNum);
      logEvent('chapter_open', { bookId, chapterNum });
      updateLastActive();
      cancelReengagement();
      checkAndPrompt();
    }
  }, [bookId, chapterNum, checkAndPrompt]);

  // Load highlights
  const loadHighlights = useCallback(() => {
    if (bookId) getHighlightsForChapter(bookId, chapterNum).then(setHighlights);
  }, [bookId, chapterNum]);
  useEffect(() => { loadHighlights(); }, [loadHighlights]);

  // Breadcrumb state — show when openPanel is present, hide on chapter swipe
  const [showBreadcrumb, setShowBreadcrumb] = useState(!!openPanel);

  // Auto-scroll to active verse during TTS playback
  useEffect(() => {
    if (!ttsActive || verses.length === 0) return;
    const verseNum = verses[tts.currentVerse]?.verse_num;
    if (verseNum == null) return;

    // Use measured verse Y position (populated via onLayout in VerseBlock)
    const verseY = verseYMap.current[verseNum];
    if (verseY != null) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, verseY - 120),
        animated: true,
      });
      return;
    }

    // Fallback: estimate position if layout hasn't fired yet
    const sec = sections.find(
      (s) => verseNum >= s.verse_start && verseNum <= s.verse_end
    );
    if (!sec) return;
    const sectionY = sectionYMap.current[sec.id];
    if (sectionY == null) return;
    const verseIndex = verseNum - sec.verse_start;
    const estimatedVerseHeight = (fontSize * 1.6) + 16;
    const verseOffsetY = 52 + verseIndex * estimatedVerseHeight;

    scrollRef.current?.scrollTo({
      y: Math.max(0, sectionY + verseOffsetY - 120),
      animated: true,
    });
  }, [ttsActive, tts.currentVerse, verses, sections, fontSize]);

  // Scroll to top on chapter change + reset progress + stop TTS
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    clearActivePanel();
    setScrollProgress(0);
    setShowBreadcrumb(false);
    verseYMap.current = {};
    tts.stop();
    setTtsActive(false);
  }, [bookId, chapterNum]);

  const totalChapters = bookData?.total_chapters ?? 1;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < totalChapters;

  const goPrev = useCallback(() => {
    if (hasPrev) navigation.setParams({ chapterNum: chapterNum - 1 });
  }, [hasPrev, chapterNum, navigation]);

  const goNext = useCallback(() => {
    if (hasNext) navigation.setParams({ chapterNum: chapterNum + 1 });
  }, [hasNext, chapterNum, navigation]);

  // Swipe-to-navigate
  const { onTouchStart, onTouchEnd } = useSwipeNavigation(
    hasPrev ? goPrev : undefined,
    hasNext ? goNext : undefined,
  );

  // Study depth tracking
  const sectionPanelMap = useMemo(() => {
    const map = new Map<string, typeof sections[0]['panels']>();
    for (const sec of sections) {
      map.set(sec.id, sec.panels);
    }
    return map;
  }, [sections]);

  const { depthMap, recordOpen } = useStudyDepth(chapter?.id, sectionPanelMap);

  // Panel toggle — single-open policy with animation
  const handleSectionPanelToggle = useCallback(
    (sectionId: string, panelType: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActivePanel(sectionId, panelType);
      recordOpen(sectionId, panelType);
    },
    [setActivePanel, recordOpen]
  );

  const handleChapterPanelToggle = useCallback(
    (panelType: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActivePanel('__chapter__', panelType);
    },
    [setActivePanel]
  );

  // Auto-open panel from deep-link (Content Library)
  const [openPanelApplied, setOpenPanelApplied] = useState(false);
  useEffect(() => {
    if (!openPanel || openPanelApplied || isLoading || !chapter) return;
    if (openPanel.sectionNum != null) {
      const sec = sections.find((s) => s.section_num === openPanel.sectionNum);
      if (sec) {
        handleSectionPanelToggle(sec.id, openPanel.panelType);
      }
    } else {
      handleChapterPanelToggle(openPanel.panelType);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
    setOpenPanelApplied(true);
  }, [openPanel, openPanelApplied, isLoading, chapter, sections, handleSectionPanelToggle, handleChapterPanelToggle]);

  // Reset openPanel applied state on chapter change
  useEffect(() => {
    setOpenPanelApplied(false);
  }, [bookId, chapterNum]);

  const activeSectionPanelType =
    activePanel && activePanel.sectionId !== '__chapter__'
      ? activePanel
      : null;

  const activeChapterPanelType =
    activePanel?.sectionId === '__chapter__'
      ? activePanel.panelType
      : null;

  const handleVerseLongPress = useCallback((verseNum: number, text: string) => {
    setLongPress({ verseNum, text });
  }, []);

  // Noted verses for note indicators
  const notedVerses = useNotedVerses(bookId, chapterNum);

  // Bookmarked verses
  const { bookmarked, toggleBookmark } = useBookmarkedVerses(bookId, chapterNum);

  // All VHL group names active by default
  const activeVhlGroups = useMemo(
    () => vhlGroups.map((g) => g.group_name),
    [vhlGroups]
  );

  if (isLoading) {
    return <ChapterSkeleton />;
  }

  if (!chapter) {
    return <ChapterSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <ChapterNavBar
        bookName={bookData?.name ?? bookId}
        chapterNum={chapterNum}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goPrev}
        onNext={goNext}
        onQnav={toggleQnav}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        onIntroPress={() => navigation.navigate('BookIntro', { bookId })}
        onTTSPress={() => {
          if (ttsActive) { tts.stop(); setTtsActive(false); }
          else { setTtsActive(true); tts.play(); }
        }}
        ttsActive={ttsActive}
        translation={translation}
        onTranslationChange={switchTranslation}
        comparisonTranslation={comparisonTranslation}
        onCompareStart={setComparisonTranslation}
        onCompareEnd={() => setComparisonTranslation(null)}
      />

      {/* Breadcrumb pill — visible when navigated from Content Library */}
      {showBreadcrumb && openPanel && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.breadcrumb, { backgroundColor: base.gold + '18', borderColor: base.gold + '40' }]}
        >
          <Text style={[styles.breadcrumbText, { color: base.gold }]}>← Content Library</Text>
        </TouchableOpacity>
      )}

      {/* Compare bar — shown when parallel translation is active */}
      {comparisonTranslation && (
        <CompareBar
          primaryLabel={TRANSLATION_MAP.get(translation)?.label ?? translation.toUpperCase()}
          comparisonLabel={TRANSLATION_MAP.get(comparisonTranslation)?.label ?? comparisonTranslation.toUpperCase()}
          onDismiss={() => setComparisonTranslation(null)}
        />
      )}

      {/* Reading progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: base.border }]}>
        <View style={[styles.progressFill, { width: `${scrollProgress * 100}%`, backgroundColor: base.gold }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ChapterHeader
          chapter={chapter}
          noteCount={noteCount}
          onNotesPress={toggleNotes}
          onTimelinePress={chapter.timeline_link_event
            ? () => (navigation as any).navigate('ExploreTab', {
                screen: 'Timeline', params: { eventId: chapter.timeline_link_event },
              })
            : undefined}
          onMapPress={chapter.map_story_link_id
            ? () => (navigation as any).navigate('ExploreTab', {
                screen: 'Map', params: { storyId: chapter.map_story_link_id },
              })
            : undefined}
        />

        {fingerprintScores && <ChapterFingerprint scores={fingerprintScores} />}

        {bookData?.genre_label && bookData?.genre_guidance ? (
          <GenreBanner
            genreLabel={bookData.genre_label}
            genreGuidance={bookData.genre_guidance}
          />
        ) : null}

        {/* Sections (with coaching cards interleaved) */}
        {sections.flatMap((sec) => {
          const elements: React.ReactNode[] = [
            <View
              key={sec.id}
              onLayout={(e) => {
                sectionYMap.current[sec.id] = e.nativeEvent.layout.y;
              }}
            >
            <SectionBlock
              section={sec}
              panels={sec.panels}
              verses={verses}
              vhlGroups={vhlGroups}
              activeVhlGroups={activeVhlGroups}
              notedVerses={notedVerses}
              activePanel={activeSectionPanelType}
              fontSize={fontSize}
              onPanelToggle={handleSectionPanelToggle}
              onNotePress={(v) => { setNoteVerseNum(v); toggleNotes(); }}
              onVerseLongPress={handleVerseLongPress}
              onVerseNumPress={handleInterlinearPress}
              activeVerseNum={ttsActive ? verses[tts.currentVerse]?.verse_num : undefined}
              depthExplored={depthMap.get(sec.id)?.explored}
              depthTotal={depthMap.get(sec.id)?.total}
              onDepthRecord={recordOpen}
              comparisonVerses={comparisonTranslation ? comparisonVerses : undefined}
              comparisonLabel={comparisonTranslation ? (TRANSLATION_MAP.get(comparisonTranslation)?.label ?? comparisonTranslation.toUpperCase()) : undefined}
              primaryLabel={comparisonTranslation ? (TRANSLATION_MAP.get(translation)?.label ?? translation.toUpperCase()) : undefined}
              redLetterVerses={redLetterVerses}
              onVerseLayout={(verseNum, y, sectionId) => {
                const sectionY = sectionYMap.current[sectionId] ?? 0;
                verseYMap.current[verseNum] = sectionY + y;
              }}
              renderButtonRow={(panels, sectionId) => (
                <View onLayout={(e) => {
                  const sectionY = sectionYMap.current[sectionId] ?? 0;
                  btnRowYMap.current[sectionId] = sectionY + e.nativeEvent.layout.y;
                }}>
                  <ButtonRow
                    panels={panels}
                    activePanel={
                      activeSectionPanelType?.sectionId === sectionId
                        ? activeSectionPanelType.panelType
                        : null
                    }
                    onToggle={(type) => handleSectionPanelToggle(sectionId, type)}
                  />
                </View>
              )}
              renderPanel={(panel) => (
                <PanelContainer
                  panelType={panel.panel_type}
                  contentJson={panel.content_json}
                  isOpen
                  onClose={clearActivePanel}
                  onRefPress={(ref) => {
                    navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
                  }}
                  defaultTab={
                    openPanel?.tabKey && openPanel.panelType === panel.panel_type
                      ? openPanel.tabKey
                      : undefined
                  }
                />
              )}
            />
            </View>,
          ];

          // Inject coaching card after this section if applicable
          if (studyCoachEnabled && coachingTips.length > 0) {
            const tip = coachingTips.find((t) => t.after_section === sec.section_num);
            if (tip && !dismissedTips.has(tip.after_section)) {
              elements.push(
                <StudyCoachCard
                  key={`coach-${tip.after_section}`}
                  tip={tip.tip}
                  onDismiss={() => setDismissedTips((prev) => new Set(prev).add(tip.after_section))}
                />,
              );
            }
          }

          return elements;
        })}

        {/* Chapter-level scholarly block */}
        <ScholarlyBlock
          chapterPanels={chapterPanels}
          activePanel={activeChapterPanelType}
          onToggle={handleChapterPanelToggle}
          onClose={clearActivePanel}
          onRefPress={(ref) => {
            navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
          }}
          defaultTab={
            openPanel && !openPanel.sectionNum && openPanel.tabKey
              ? openPanel.tabKey
              : undefined
          }
        />

        {/* Scholar disclaimer */}
        <Text style={[styles.scholarDisclaimer, { color: base.textMuted }]}>
          Scholar commentary panels present paraphrased summaries of positions found in published works and are not direct quotations. For exact wording, consult the original sources cited.
        </Text>
      </ScrollView>

      {ttsActive && (
        <TTSControls
          isPlaying={tts.isPlaying}
          currentVerse={tts.currentVerse}
          totalVerses={verses.length}
          speed={tts.speed}
          onPlay={tts.play}
          onPause={tts.pause}
          onStop={() => { tts.stop(); setTtsActive(false); }}
          onSkipNext={tts.skipNext}
          onSkipPrev={tts.skipPrev}
          onSetSpeed={tts.setSpeed}
        />
      )}

      <QnavOverlay
        visible={qnavOpen}
        currentBookId={bookId}
        currentChapter={chapterNum}
        onClose={toggleQnav}
        onSelectChapter={(bId, ch) => {
          if (bId === bookId) {
            navigation.setParams({ chapterNum: ch });
          } else {
            navigation.push('Chapter', { bookId: bId, chapterNum: ch });
          }
        }}
      />

      <NotesOverlay
        visible={notesOverlayOpen}
        onClose={() => { setNoteVerseNum(null); toggleNotes(); }}
        bookId={bookId}
        bookName={bookData?.name ?? bookId}
        chapterNum={chapterNum}
        initialVerseNum={noteVerseNum}
      />

      <InterlinearSheet
        visible={interlinearVerse !== null}
        bookId={bookId}
        chapter={chapterNum}
        verse={interlinearVerse ?? 1}
        verseRef={interlinearVerse ? `${bookData?.name ?? bookId} ${chapterNum}:${interlinearVerse}` : ''}
        onClose={() => setInterlinearVerse(null)}
        onWordStudyPress={(wsId) => {
          setInterlinearVerse(null);
          (navigation as any).navigate('ExploreTab', { screen: 'WordStudyDetail', params: { wordId: wsId } });
        }}
        onConcordancePress={(params) => {
          setInterlinearVerse(null);
          (navigation as any).navigate('ExploreTab', { screen: 'Concordance', params });
        }}
        onLexiconPress={(strongs, wsId) => {
          setInterlinearVerse(null);
          setLexiconStrongs(strongs);
          setLexiconWordStudyId(wsId);
        }}
      />

      <LexiconSheet
        visible={lexiconStrongs !== null}
        strongs={lexiconStrongs}
        wordStudyId={lexiconWordStudyId}
        onClose={() => { setLexiconStrongs(null); setLexiconWordStudyId(null); }}
        onWordStudyPress={(wsId) => {
          setLexiconStrongs(null);
          setLexiconWordStudyId(null);
          (navigation as any).navigate('ExploreTab', { screen: 'WordStudyDetail', params: { wordId: wsId } });
        }}
        onConcordancePress={(params) => {
          setLexiconStrongs(null);
          setLexiconWordStudyId(null);
          (navigation as any).navigate('ExploreTab', { screen: 'Concordance', params });
        }}
      />

      <VerseLongPressMenu
        visible={longPress !== null}
        verseText={longPress?.text ?? ''}
        verseRef={longPress ? `${bookData?.name ?? bookId} ${chapterNum}:${longPress.verseNum}` : ''}
        onClose={() => setLongPress(null)}
        onAddNote={longPress ? () => {
          setNoteVerseNum(longPress.verseNum);
          toggleNotes();
        } : undefined}
        onHighlight={() => setColorPickerOpen(true)}
        highlightColor={longPress
          ? HIGHLIGHT_COLORS.find((c) => c.name === highlights.find(
              (h) => h.verse_ref === `${bookId}_${chapterNum}:${longPress.verseNum}`
            )?.color)?.hex ?? null
          : null}
        onBookmark={longPress ? () => toggleBookmark(longPress.verseNum) : undefined}
        isBookmarked={longPress ? bookmarked.has(longPress.verseNum) : false}
      />

      <HighlightColorPicker
        visible={colorPickerOpen}
        currentColor={longPress
          ? highlights.find(
              (h) => h.verse_ref === `${bookId}_${chapterNum}:${longPress.verseNum}`
            )?.color ?? null
          : null}
        onSelect={async (color) => {
          if (!longPress) return;
          const ref = `${bookId}_${chapterNum}:${longPress.verseNum}`;
          if (color) {
            await setHighlight(ref, color);
          } else {
            await removeHighlight(ref);
          }
          loadHighlights();
          setLongPress(null);
        }}
        onClose={() => setColorPickerOpen(false)}
      />

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  breadcrumb: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  breadcrumbText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  progressTrack: {
    height: 2,
  },
  progressFill: {
    height: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  scholarDisclaimer: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
