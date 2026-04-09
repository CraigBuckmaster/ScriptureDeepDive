/**
 * ChapterScreen — The main reading experience (90% of user time).
 *
 * Layout: ChapterNavBar (sticky top) → ScrollView (ChapterHeader →
 * sections.map(SectionBlock) → ScholarlyBlock). QnavOverlay via modal.
 *
 * Data: useChapterData loads everything. readerStore manages panel state.
 *
 * Decomposed (#970): TTS, highlights, coaching, scroll, and panel logic
 * extracted into hooks/chapter/*.
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, UIManager, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import type { Book } from '../types';

import { useChapterData } from '../hooks/useChapterData';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { useNotedVerses } from '../hooks/useNotedVerses';
import { useSettingsStore, useReaderStore } from '../stores';
import { recordVisit } from '../db/user';
import { GenreBanner } from '../components/GenreBanner';
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
import { TTSControls } from '../components/TTSControls';
import { useBookmarkedVerses } from '../hooks/useBookmarkedVerses';
import { useAvailableLenses, useChapterLensContent } from '../hooks/useHermeneuticLens';
import { LensToggleBar } from '../components/LensToggleBar';

import { TRANSLATION_MAP } from '../db/translationRegistry';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { usePremium } from '../hooks/usePremium';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

import { ChapterVerseList } from '../components/ChapterVerseList';
import { ChapterReaderProvider } from '../components/ChapterReaderContext';
import { ChapterPanelSheet } from '../components/ChapterPanelSheet';

import { useChapterTTS } from '../hooks/chapter/useChapterTTS';
import { useChapterHighlights } from '../hooks/chapter/useChapterHighlights';
import { useChapterCoaching } from '../hooks/chapter/useChapterCoaching';
import { useChapterScroll } from '../hooks/chapter/useChapterScroll';
import { useChapterPanels } from '../hooks/chapter/useChapterPanels';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ChapterScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Read', 'Chapter'>>();
  const route = useRoute<ScreenRouteProp<'Read', 'Chapter'>>();
  const { bookId, chapterNum, openPanel, planId, planDayNum, verseNum: initialVerseNum } = route.params ?? {};

  const fontSize = useSettingsStore((s) => s.fontSize);
  const translation = useSettingsStore((s) => s.translation);
  const comparisonTranslation = useSettingsStore((s) => s.comparisonTranslation);
  const setComparisonTranslation = useSettingsStore((s) => s.setComparisonTranslation);
  const { switchTranslation } = useTranslationSwitch();
  const { checkAndPrompt } = useStoreReview();
  const studyCoachEnabled = useSettingsStore((s) => s.studyCoachEnabled);
  const vhlEnabled = useSettingsStore((s) => s.vhlEnabled);
  const focusMode = useSettingsStore((s) => s.focusMode);
  const toggleFocusMode = useSettingsStore((s) => s.toggleFocusMode);
  const qnavOpen = useReaderStore((s) => s.qnavOpen);
  const toggleQnav = useReaderStore((s) => s.toggleQnav);
  const notesOverlayOpen = useReaderStore((s) => s.notesOverlayOpen);
  const toggleNotes = useReaderStore((s) => s.toggleNotesOverlay);
  const [noteVerseNum, setNoteVerseNum] = useState<number | null>(null);
  const [longPress, setLongPress] = useState<{ verseNum: number; text: string } | null>(null);
  const [interlinearVerse, setInterlinearVerse] = useState<number | null>(null);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const [activeLens, setActiveLens] = useState<string | null>(null);
  const [bookData, setBookData] = useState<Book | null>(null);
  const [showBreadcrumb, setShowBreadcrumb] = useState(!!openPanel);

  const {
    chapter, sections, verses, comparisonVerses, vhlGroups,
    chapterPanels, noteCount, isLoading,
  } = useChapterData(bookId, chapterNum);

  // ─��� Extracted hooks ──
  const scroll = useChapterScroll({
    bookId, chapterNum, initialVerseNum, isLoading,
    versesLength: verses.length, planId, planDayNum,
  });

  const ttsHook = useChapterTTS({
    verses, sections, bookId, chapterNum,
    scrollRef: scroll.scrollRef,
    sectionYMap: scroll.sectionYMap,
    verseYMap: scroll.verseYMap,
  });

  const { highlights, highlightMap, loadHighlights } = useChapterHighlights(bookId, chapterNum);

  const { coachingTips, chapterCoaching, dismissedTips, handleDismissTip } =
    useChapterCoaching(chapter?.coaching_json, bookId, chapterNum);

  const panels = useChapterPanels({
    chapterId: chapter?.id, sections, isPremium, bookId, chapterNum,
    openPanel, isLoading, scrollRef: scroll.scrollRef,
  });

  // ── Remaining screen-level logic ──
  const { data: availableLenses } = useAvailableLenses(chapter?.id);
  const { data: lensContent } = useChapterLensContent(chapter?.id, activeLens);
  const redLetterVerses = useRedLetter(bookId, chapterNum);
  const notedVerses = useNotedVerses(bookId, chapterNum);
  const { bookmarked, toggleBookmark } = useBookmarkedVerses(bookId, chapterNum);

  const handleInterlinearPress = useCallback((verseNum: number) => {
    if (!isPremium) { showUpgrade('feature', 'Interlinear Hebrew & Greek'); return; }
    setInterlinearVerse(verseNum);
  }, [isPremium, showUpgrade]);

  const handleLensSelect = useCallback((lensId: string | null) => {
    if (lensId !== null && !isPremium) { showUpgrade('feature', 'Hermeneutic Lenses'); return; }
    setActiveLens(lensId);
  }, [isPremium, showUpgrade]);

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

  // Clear active panels when focus mode is enabled
  useEffect(() => {
    if (focusMode) panels.clearActivePanel();
  }, [focusMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset breadcrumb + lens on chapter change
  useEffect(() => {
    setShowBreadcrumb(false);
    setActiveLens(null);
  }, [bookId, chapterNum]);

  // Navigation
  const totalChapters = bookData?.total_chapters ?? 1;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < totalChapters;
  const goPrev = useCallback(() => {
    if (hasPrev) navigation.setParams({ chapterNum: chapterNum - 1 });
  }, [hasPrev, chapterNum, navigation]);
  const goNext = useCallback(() => {
    if (hasNext) navigation.setParams({ chapterNum: chapterNum + 1 });
  }, [hasNext, chapterNum, navigation]);
  const { onTouchStart, onTouchEnd } = useSwipeNavigation(
    hasPrev ? goPrev : undefined,
    hasNext ? goNext : undefined,
  );

  // VHL highlights — controlled by Settings toggle; disabled in focus mode
  const activeVhlGroups = useMemo(
    () => (vhlEnabled && !focusMode ? vhlGroups.map((g) => g.group_name) : []),
    [vhlGroups, vhlEnabled, focusMode],
  );

  // Callbacks
  const handleNotePress = useCallback((v: number) => { setNoteVerseNum(v); toggleNotes(); }, [toggleNotes]);
  const handleVerseLongPress = useCallback((verseNum: number, text: string) => { setLongPress({ verseNum, text }); }, []);
  const handleRefPress = useCallback((ref: { bookId: string; chapter: number }) => { navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter }); }, [navigation]);
  const handleAddNote = useCallback((verseNum: number) => { setNoteVerseNum(verseNum); toggleNotes(); }, [toggleNotes]);
  const handleWordStudyPress = useCallback((wsId: string) => { (navigation as any).navigate('ExploreTab', { screen: 'WordStudyDetail', params: { wordId: wsId } }); }, [navigation]);
  const handleConcordancePress = useCallback((params: any) => { (navigation as any).navigate('ExploreTab', { screen: 'Concordance', params }); }, [navigation]);

  // Comparison labels
  const comparisonLabel = comparisonTranslation
    ? (TRANSLATION_MAP.get(comparisonTranslation)?.label ?? comparisonTranslation.toUpperCase())
    : undefined;
  const primaryLabel = comparisonTranslation
    ? (TRANSLATION_MAP.get(translation)?.label ?? translation.toUpperCase())
    : undefined;

  if (isLoading || !chapter) return <ChapterSkeleton />;

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
        onTTSPress={ttsHook.toggleTTS}
        ttsActive={ttsHook.ttsActive}
        translation={translation}
        onTranslationChange={switchTranslation}
        comparisonTranslation={comparisonTranslation}
        onCompareStart={setComparisonTranslation}
        onCompareEnd={() => setComparisonTranslation(null)}
        focusMode={focusMode}
        onFocusToggle={toggleFocusMode}
      />

      {showBreadcrumb && openPanel && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.breadcrumb, { backgroundColor: base.gold + '18', borderColor: base.gold + '40' }]}
        >
          <Text style={[styles.breadcrumbText, { color: base.gold }]}>{'← Content Library'}</Text>
        </TouchableOpacity>
      )}

      {!focusMode && availableLenses.length > 0 && (
        <LensToggleBar lenses={availableLenses} activeLensId={activeLens} onSelect={handleLensSelect} />
      )}

      {!focusMode && comparisonTranslation && (
        <CompareBar
          primaryLabel={TRANSLATION_MAP.get(translation)?.label ?? translation.toUpperCase()}
          comparisonLabel={TRANSLATION_MAP.get(comparisonTranslation)?.label ?? comparisonTranslation.toUpperCase()}
          onDismiss={() => setComparisonTranslation(null)}
        />
      )}

      <View style={[styles.progressTrack, { backgroundColor: base.border }]}>
        <View style={[styles.progressFill, { width: `${scroll.scrollProgress * 100}%`, backgroundColor: base.gold }]} />
      </View>

      <ScrollView
        ref={scroll.scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={scroll.handleScroll}
        scrollEventThrottle={32}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {activeLens && lensContent?.guidance ? (
          <View style={[styles.lensGuidance, { backgroundColor: base.gold + '10', borderColor: base.gold + '30' }]}>
            <Text style={[styles.lensGuidanceLabel, { color: base.gold }]}>
              {availableLenses.find((l) => l.id === activeLens)?.name ?? 'Lens'} Guidance
            </Text>
            <Text style={[styles.lensGuidanceText, { color: base.textDim }]}>{lensContent.guidance}</Text>
          </View>
        ) : null}

        <ChapterHeader
          chapter={chapter}
          noteCount={noteCount}
          onNotesPress={toggleNotes}
          onTimelinePress={chapter.timeline_link_event
            ? () => (navigation as any).navigate('ExploreTab', { screen: 'Timeline', params: { eventId: chapter.timeline_link_event } })
            : undefined}
          onMapPress={chapter.map_story_link_id
            ? () => (navigation as any).navigate('ExploreTab', { screen: 'Map', params: { storyId: chapter.map_story_link_id } })
            : undefined}
        />

        {!focusMode && bookData?.genre_label && bookData?.genre_guidance ? (
          <GenreBanner genreLabel={bookData.genre_label} genreGuidance={bookData.genre_guidance} />
        ) : null}

        <ChapterReaderProvider
          verse={{
            verses, vhlGroups, activeVhlGroups, notedVerses, fontSize,
            redLetterVerses, highlightMap, activeVerseNum: ttsHook.activeVerseNum,
            comparisonVerses: comparisonTranslation ? comparisonVerses : undefined,
            comparisonLabel, primaryLabel,
          }}
          panel={{
            activeSectionPanel: panels.activeSectionPanelType,
            activeChapterPanelType: panels.activeChapterPanelType,
            depthMap: panels.depthMap, openPanel,
          }}
          callbacks={{
            handleSectionPanelToggle: panels.handleSectionPanelToggle,
            handleChapterPanelToggle: panels.handleChapterPanelToggle,
            clearActivePanel: panels.clearActivePanel,
            recordOpen: panels.recordOpen,
            onNotePress: handleNotePress,
            onVerseLongPress: handleVerseLongPress,
            onInterlinearPress: handleInterlinearPress,
            onRefPress: handleRefPress,
          }}
          layout={{
            onSectionLayout: scroll.handleSectionLayout,
            onVerseLayout: scroll.handleVerseLayout,
            onBtnRowLayout: scroll.handleBtnRowLayout,
          }}
          coaching={{
            studyCoachEnabled, coachingTips, chapterCoaching,
            dismissedTips, onDismissTip: handleDismissTip,
          }}
          display={{ focusMode }}
        >
          <ChapterVerseList
            sections={sections}
            chapterPanels={chapterPanels}
            prayerPrompt={chapter?.prayer_prompt}
          />
        </ChapterReaderProvider>
      </ScrollView>

      {ttsHook.ttsActive && (
        <TTSControls
          isPlaying={ttsHook.tts.isPlaying}
          currentVerse={ttsHook.tts.currentVerse}
          totalVerses={verses.length}
          speed={ttsHook.tts.speed}
          onPlay={ttsHook.tts.play}
          onPause={ttsHook.tts.pause}
          onStop={ttsHook.stopTTS}
          onSkipNext={ttsHook.tts.skipNext}
          onSkipPrev={ttsHook.tts.skipPrev}
          onSetSpeed={ttsHook.tts.setSpeed}
        />
      )}

      <QnavOverlay
        visible={qnavOpen}
        currentBookId={bookId}
        currentChapter={chapterNum}
        onClose={toggleQnav}
        onSelectChapter={(bId, ch) => {
          if (bId === bookId) navigation.setParams({ chapterNum: ch });
          else navigation.push('Chapter', { bookId: bId, chapterNum: ch });
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
  container: { flex: 1 },
  breadcrumb: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  breadcrumbText: { fontFamily: fontFamily.uiMedium, fontSize: 11 },
  progressTrack: { height: 2 },
  progressFill: { height: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
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
  lensGuidanceText: { fontFamily: fontFamily.ui, fontSize: 13, lineHeight: 20 },
});

export default withErrorBoundary(ChapterScreen);
