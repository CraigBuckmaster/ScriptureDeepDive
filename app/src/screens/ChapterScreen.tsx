/**
 * ChapterScreen — The main reading experience (90% of user time).
 *
 * Layout: ChapterNavBar (sticky top) → ScrollView (ChapterHeader →
 * sections.map(SectionBlock) → ScholarlyBlock). QnavOverlay via modal.
 *
 * Data: useChapterData loads everything. readerStore manages panel state.
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useChapterData } from '../hooks/useChapterData';
import { useNotedVerses } from '../hooks/useNotedVerses';
import { useChapterCache } from '../hooks/useChapterCache';
import { useReaderStore, useSettingsStore } from '../stores';
import { recordVisit } from '../db/user';
import { getBook } from '../db/content';

import { ChapterNavBar } from '../components/ChapterNavBar';
import { ChapterHeader } from '../components/ChapterHeader';
import { SectionBlock } from '../components/SectionBlock';
import { ButtonRow } from '../components/ButtonRow';
import { PanelContainer } from '../components/PanelContainer';
import { ScholarlyBlock } from '../components/ScholarlyBlock';
import { QnavOverlay } from '../components/QnavOverlay';
import { NotesOverlay } from '../components/NotesOverlay';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

import { base, spacing } from '../theme';

export default function ChapterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId, chapterNum } = route.params ?? {};

  const fontSize = useSettingsStore((s) => s.fontSize);
  const activePanel = useReaderStore((s) => s.activePanel);
  const setActivePanel = useReaderStore((s) => s.setActivePanel);
  const clearActivePanel = useReaderStore((s) => s.clearActivePanel);
  const qnavOpen = useReaderStore((s) => s.qnavOpen);
  const toggleQnav = useReaderStore((s) => s.toggleQnav);
  const notesOverlayOpen = useReaderStore((s) => s.notesOverlayOpen);
  const toggleNotes = useReaderStore((s) => s.toggleNotesOverlay);

  const {
    chapter, sections, verses, vhlGroups,
    chapterPanels, noteCount, isLoading,
  } = useChapterData(bookId, chapterNum);

  const scrollRef = useRef<ScrollView>(null);
  const sectionYMap = useRef<Record<string, number>>({});
  const btnRowYMap = useRef<Record<string, number>>({});
  const [bookData, setBookData] = React.useState<any>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    if (bookId && chapterNum) recordVisit(bookId, chapterNum);
  }, [bookId, chapterNum]);

  // Scroll to top on chapter change + reset progress
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    clearActivePanel();
    setScrollProgress(0);
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

  // Horizontal swipe gesture for prev/next chapter
  const swipeGesture = useMemo(() =>
    Gesture.Pan()
      .activeOffsetX([-40, 40])     // must move 40px horizontally to activate
      .failOffsetY([-20, 20])       // cancel if vertical movement > 20px
      .onEnd((e) => {
        if (e.translationX > 60 && hasPrev) {
          goPrev();
        } else if (e.translationX < -60 && hasNext) {
          goNext();
        }
      }),
    [hasPrev, hasNext, goPrev, goNext]
  );

  // Panel toggle — single-open policy
  const handleSectionPanelToggle = useCallback(
    (sectionId: string, panelType: string) => {
      setActivePanel(sectionId, panelType);
    },
    [setActivePanel]
  );

  const handleChapterPanelToggle = useCallback(
    (panelType: string) => {
      setActivePanel('__chapter__', panelType);
    },
    [setActivePanel]
  );

  const activeSectionPanelType =
    activePanel && activePanel.sectionId !== '__chapter__'
      ? activePanel
      : null;

  const activeChapterPanelType =
    activePanel?.sectionId === '__chapter__'
      ? activePanel.panelType
      : null;

  // Noted verses for note indicators
  const notedVerses = useNotedVerses(bookId, chapterNum);

  // Pre-fetch adjacent chapters
  useChapterCache(bookId, chapterNum, totalChapters);

  // All VHL group names active by default
  const activeVhlGroups = useMemo(
    () => vhlGroups.map((g) => g.group_name),
    [vhlGroups]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSkeleton lines={8} height={18} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.emptyContainer}>
        <LoadingSkeleton lines={3} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChapterNavBar
        bookName={bookData?.name ?? bookId}
        chapterNum={chapterNum}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goPrev}
        onNext={goNext}
        onQnav={toggleQnav}
      />

      {/* Reading progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${scrollProgress * 100}%` }]} />
      </View>

      <GestureDetector gesture={swipeGesture}>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        <ChapterHeader
          chapter={chapter}
          noteCount={noteCount}
          onNotesPress={toggleNotes}
          onIntroPress={() => navigation.navigate('BookIntro', { bookId })}
          onTimelinePress={chapter.timeline_link_event
            ? () => navigation.navigate('ExploreTab', {
                screen: 'Timeline', params: { eventId: chapter.timeline_link_event },
              })
            : undefined}
          onMapPress={chapter.map_story_link_id
            ? () => navigation.navigate('ExploreTab', {
                screen: 'Map', params: { storyId: chapter.map_story_link_id },
              })
            : undefined}
        />

        {/* Sections */}
        {sections.map((sec) => (
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
            onNotePress={(v) => toggleNotes()}
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
                  // Navigate to referenced chapter
                  navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
                }}
              />
            )}
          />
          </View>
        ))}

        {/* Chapter-level scholarly block */}
        <ScholarlyBlock
          chapterPanels={chapterPanels}
          activePanel={activeChapterPanelType}
          onToggle={handleChapterPanelToggle}
          onClose={clearActivePanel}
          onRefPress={(ref) => {
            navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
          }}
        />
      </ScrollView>
      </GestureDetector>

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
        onClose={toggleNotes}
        bookId={bookId}
        bookName={bookData?.name ?? bookId}
        chapterNum={chapterNum}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: base.bg,
    padding: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: base.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 2,
    backgroundColor: base.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: base.gold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
});
