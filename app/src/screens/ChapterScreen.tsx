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
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import type { Book, CoachingTip } from '../types';

import { useChapterData } from '../hooks/useChapterData';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { useNotedVerses } from '../hooks/useNotedVerses';
import { useReaderStore, useSettingsStore } from '../stores';
import { recordVisit, completePlanDay } from '../db/user';
import { GenreBanner } from '../components/GenreBanner';
import { useStudyDepth } from '../hooks/useStudyDepth';
import { useStudyRecorder } from '../hooks/useStudyRecorder';
import { useTranslationSwitch } from '../hooks/useTranslationSwitch';
import { useStoreReview } from '../hooks/useStoreReview';
import { logEvent } from '../services/analytics';
import { updateLastActive, cancelReengagement } from '../services/reengagement';
import { getBook } from '../db/content';

import { useRedLetter } from '../hooks/useRedLetter';
import { ChapterNavBar } from '../components/ChapterNavBar';
import { CompareBar } from '../components/CompareBar';
import { ChapterHeader } from '../components/ChapterHeader';
import { QnavOverlay } from '../components/QnavOverlay';
import { NotesOverlay } from '../components/notes';
import { ChapterSkeleton } from '../components/ChapterSkeleton';
import { HIGHLIGHT_COLORS } from '../components/HighlightColorPicker';
import { getHighlightsForChapter, type VerseHighlight } from '../db/user';
import { TTSControls } from '../components/TTSControls';
import { useTTS } from '../hooks/useTTS';
import { useBookmarkedVerses } from '../hooks/useBookmarkedVerses';
import { useAvailableLenses, useChapterLensContent } from '../hooks/useHermeneuticLens';
import { LensToggleBar } from '../components/LensToggleBar';

import { TRANSLATION_MAP } from '../db/translationRegistry';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useChapterFingerprint } from '../hooks/useChapterFingerprint';
import { ChapterFingerprint } from '../components/ChapterFingerprint';
import { usePremium } from '../hooks/usePremium';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

import { ChapterVerseList } from '../components/ChapterVerseList';
import { ChapterPanelSheet } from '../components/ChapterPanelSheet';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ChapterScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Read', 'Chapter'>>();
  const route = useRoute<ScreenRouteProp<'Read', 'Chapter'>>();
  const { bookId, chapterNum, openPanel, planId, planDayNum } = route.params ?? {};

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
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [activeLens, setActiveLens] = useState<string | null>(null);

  const {
    chapter, sections, verses, comparisonVerses, vhlGroups,
    chapterPanels, noteCount, isLoading,
  } = useChapterData(bookId, chapterNum);

  const { data: availableLenses } = useAvailableLenses(chapter?.id);
  const { data: lensContent } = useChapterLensContent(chapter?.id, activeLens);

  const handleLensSelect = useCallback((lensId: string | null) => {
    if (lensId !== null && !isPremium) {
      showUpgrade('feature', 'Hermeneutic Lenses');
      return;
    }
    setActiveLens(lensId);
  }, [isPremium, showUpgrade]);

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
  const planDayCompletedRef = useRef(false);

  // Mark plan day complete when scrolled past 80%
  useEffect(() => {
    if (planId && planDayNum && scrollProgress >= 0.80 && !planDayCompletedRef.current) {
      planDayCompletedRef.current = true;
      completePlanDay(planId, planDayNum);
    }
  }, [planId, planDayNum, scrollProgress]);

  // Reset plan completion tracking when chapter changes
  useEffect(() => {
    planDayCompletedRef.current = false;
  }, [bookId, chapterNum]);

  // Parse coaching data — supports both old array format and new CoachingData format
  const { coachingTips, chapterCoaching } = useMemo(() => {
    if (!chapter?.coaching_json) return { coachingTips: [] as CoachingTip[], chapterCoaching: null };
    try {
      const parsed = JSON.parse(chapter.coaching_json);
      // New format: { section_tips, chapter_coaching, genre_tag }
      if (parsed && !Array.isArray(parsed) && (parsed.section_tips || parsed.chapter_coaching)) {
        return {
          coachingTips: (parsed.section_tips ?? []) as CoachingTip[],
          chapterCoaching: parsed.chapter_coaching ?? null,
        };
      }
      // Legacy format: CoachingTip[]
      return { coachingTips: Array.isArray(parsed) ? parsed as CoachingTip[] : [], chapterCoaching: null };
    } catch {
      return { coachingTips: [] as CoachingTip[], chapterCoaching: null };
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

  // Build verseNum → highlight hex color map for rendering
  const highlightMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of highlights) {
      const parts = h.verse_ref.split(':');
      const num = parts[1] ? parseInt(parts[1], 10) : NaN;
      if (!isNaN(num)) {
        const entry = HIGHLIGHT_COLORS.find((c) => c.name === h.color);
        if (entry) map.set(num, entry.hex);
      }
    }
    return map;
  }, [highlights]);

  // Breadcrumb state — show when openPanel is present, hide on chapter swipe
  const [showBreadcrumb, setShowBreadcrumb] = useState(!!openPanel);

  // Auto-scroll to active verse during TTS playback
  useEffect(() => {
    if (!ttsActive || verses.length === 0) return;
    const verseNum = verses[tts.currentVerse]?.verse_num;
    if (verseNum == null) return;

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
    setActiveLens(null);
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

  // Study session recording (premium only)
  const { recordEvent } = useStudyRecorder(chapter?.id, isPremium);

  // Panel toggle — single-open policy with animation
  const handleSectionPanelToggle = useCallback(
    (sectionId: string, panelType: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const isOpen = activePanel?.sectionId === sectionId && activePanel?.panelType === panelType;
      setActivePanel(sectionId, panelType);
      recordOpen(sectionId, panelType);
      recordEvent(isOpen ? 'panel_close' : 'panel_open', { section_id: sectionId, panel_type: panelType });
    },
    [setActivePanel, recordOpen, activePanel, recordEvent]
  );

  const handleChapterPanelToggle = useCallback(
    (panelType: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const isOpen = activePanel?.sectionId === '__chapter__' && activePanel?.panelType === panelType;
      setActivePanel('__chapter__', panelType);
      recordEvent(isOpen ? 'panel_close' : 'panel_open', { section_id: '__chapter__', panel_type: panelType });
    },
    [setActivePanel, activePanel, recordEvent]
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

  // Layout callbacks for ChapterVerseList
  const handleSectionLayout = useCallback((sectionId: string, y: number) => {
    sectionYMap.current[sectionId] = y;
  }, []);

  const handleVerseLayout = useCallback((verseNum: number, y: number, sectionId: string) => {
    const sectionY = sectionYMap.current[sectionId] ?? 0;
    verseYMap.current[verseNum] = sectionY + y;
  }, []);

  const handleBtnRowLayout = useCallback((sectionId: string, _sectionY: number, rowY: number) => {
    const secY = sectionYMap.current[sectionId] ?? 0;
    btnRowYMap.current[sectionId] = secY + rowY;
  }, []);

  const handleNotePress = useCallback((v: number) => {
    setNoteVerseNum(v);
    toggleNotes();
  }, [toggleNotes]);

  const handleDismissTip = useCallback((afterSection: number) => {
    setDismissedTips((prev) => new Set(prev).add(afterSection));
  }, []);

  const handleRefPress = useCallback((ref: { bookId: string; chapter: number }) => {
    navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
  }, [navigation]);

  // Comparison labels
  const comparisonLabel = comparisonTranslation
    ? (TRANSLATION_MAP.get(comparisonTranslation)?.label ?? comparisonTranslation.toUpperCase())
    : undefined;
  const primaryLabel = comparisonTranslation
    ? (TRANSLATION_MAP.get(translation)?.label ?? translation.toUpperCase())
    : undefined;

  // Panel sheet callbacks
  const handleWordStudyPress = useCallback((wsId: string) => {
    (navigation as any).navigate('ExploreTab', { screen: 'WordStudyDetail', params: { wordId: wsId } });
  }, [navigation]);

  const handleConcordancePress = useCallback((params: any) => {
    (navigation as any).navigate('ExploreTab', { screen: 'Concordance', params });
  }, [navigation]);

  const handleAddNote = useCallback((verseNum: number) => {
    setNoteVerseNum(verseNum);
    toggleNotes();
  }, [toggleNotes]);

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

      {/* Hermeneutic lens toggle — shown when lenses are available */}
      {availableLenses.length > 0 && (
        <LensToggleBar
          lenses={availableLenses}
          activeLensId={activeLens}
          onSelect={handleLensSelect}
        />
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
        {/* Lens guidance — shown when a hermeneutic lens is active */}
        {activeLens && lensContent?.guidance ? (
          <View style={[styles.lensGuidance, { backgroundColor: base.gold + '10', borderColor: base.gold + '30' }]}>
            <Text style={[styles.lensGuidanceLabel, { color: base.gold }]}>
              {availableLenses.find(l => l.id === activeLens)?.name ?? 'Lens'} Guidance
            </Text>
            <Text style={[styles.lensGuidanceText, { color: base.textDim }]}>
              {lensContent.guidance}
            </Text>
          </View>
        ) : null}

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

        <ChapterVerseList
          sections={sections}
          verses={verses}
          vhlGroups={vhlGroups}
          activeVhlGroups={activeVhlGroups}
          notedVerses={notedVerses}
          activeSectionPanel={activeSectionPanelType}
          fontSize={fontSize}
          handleSectionPanelToggle={handleSectionPanelToggle}
          onNotePress={handleNotePress}
          onVerseLongPress={handleVerseLongPress}
          onInterlinearPress={handleInterlinearPress}
          activeVerseNum={ttsActive ? verses[tts.currentVerse]?.verse_num : undefined}
          depthMap={depthMap}
          recordOpen={recordOpen}
          comparisonVerses={comparisonTranslation ? comparisonVerses : undefined}
          comparisonLabel={comparisonLabel}
          primaryLabel={primaryLabel}
          redLetterVerses={redLetterVerses}
          highlightMap={highlightMap}
          clearActivePanel={clearActivePanel}
          onRefPress={handleRefPress}
          openPanel={openPanel}
          onSectionLayout={handleSectionLayout}
          onVerseLayout={handleVerseLayout}
          onBtnRowLayout={handleBtnRowLayout}
          studyCoachEnabled={studyCoachEnabled}
          coachingTips={coachingTips}
          chapterCoaching={chapterCoaching}
          dismissedTips={dismissedTips}
          onDismissTip={handleDismissTip}
          chapterPanels={chapterPanels}
          activeChapterPanelType={activeChapterPanelType}
          handleChapterPanelToggle={handleChapterPanelToggle}
          prayerPrompt={chapter?.prayer_prompt}
        />
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

      <ChapterPanelSheet
        bookId={bookId}
        chapterNum={chapterNum}
        bookName={bookData?.name ?? bookId}
        longPress={longPress}
        setLongPress={setLongPress}
        interlinearVerse={interlinearVerse}
        setInterlinearVerse={setInterlinearVerse}
        onWordStudyPress={handleWordStudyPress}
        onConcordancePress={handleConcordancePress}
        onAddNote={handleAddNote}
        toggleBookmark={toggleBookmark}
        bookmarked={bookmarked}
        highlights={highlights}
        loadHighlights={loadHighlights}
        upgradeRequest={upgradeRequest}
        dismissUpgrade={dismissUpgrade}
      />
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
  lensGuidance: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  lensGuidanceLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  lensGuidanceText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default withErrorBoundary(ChapterScreen);
