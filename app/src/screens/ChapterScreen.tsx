/**
 * ChapterScreen — The main reading experience (90% of user time).
 *
 * Layout: ChapterNavBar (sticky top) → ScrollView (ChapterHeader →
 * sections.map(SectionBlock) → ScholarlyBlock). QnavOverlay via modal.
 *
 * Data: useChapterData loads everything. readerStore manages panel state.
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

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
  const toggleNotes = useReaderStore((s) => s.toggleNotesOverlay);

  const {
    chapter, sections, verses, vhlGroups,
    chapterPanels, noteCount, isLoading,
  } = useChapterData(bookId, chapterNum);

  const scrollRef = useRef<ScrollView>(null);
  const [bookData, setBookData] = React.useState<any>(null);

  // Load book data for nav
  useEffect(() => {
    if (bookId) getBook(bookId).then(setBookData);
  }, [bookId]);

  // Record visit
  useEffect(() => {
    if (bookId && chapterNum) recordVisit(bookId, chapterNum);
  }, [bookId, chapterNum]);

  // Scroll to top on chapter change
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    clearActivePanel();
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
        onBack={() => navigation.goBack()}
        onPrev={goPrev}
        onNext={goNext}
        onQnav={toggleQnav}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <ChapterHeader
          chapter={chapter}
          noteCount={noteCount}
          onNotesPress={toggleNotes}
          onIntroPress={() => navigation.navigate('BookIntro', { bookId })}
          onTimelinePress={chapter.timeline_link_event
            ? () => navigation.navigate('Timeline', { eventId: chapter.timeline_link_event })
            : undefined}
          onMapPress={chapter.map_story_link_id
            ? () => navigation.navigate('Map', { storyId: chapter.map_story_link_id })
            : undefined}
        />

        {/* Sections */}
        {sections.map((sec) => (
          <SectionBlock
            key={sec.id}
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
              <ButtonRow
                panels={panels}
                activePanel={
                  activeSectionPanelType?.sectionId === sectionId
                    ? activeSectionPanelType.panelType
                    : null
                }
                onToggle={(type) => handleSectionPanelToggle(sectionId, type)}
              />
            )}
            renderPanel={(panel) => (
              <PanelContainer
                panelType={panel.panel_type}
                contentJson={panel.content_json}
                isOpen
                onRefPress={(ref) => {
                  // Navigate to referenced chapter
                  navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
                }}
              />
            )}
          />
        ))}

        {/* Chapter-level scholarly block */}
        <ScholarlyBlock
          chapterPanels={chapterPanels}
          activePanel={activeChapterPanelType}
          onToggle={handleChapterPanelToggle}
          onRefPress={(ref) => {
            navigation.push('Chapter', { bookId: ref.bookId, chapterNum: ref.chapter });
          }}
        />
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
