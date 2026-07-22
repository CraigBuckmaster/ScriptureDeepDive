/**
 * useChapterScroll — Scroll ref, progress tracking, and index-based
 * auto-scroll behaviors for the FlashList reader.
 *
 * Extracted from ChapterScreen (#970); rewritten for virtualization in
 * D3 (#1873): all anchor jumps go through scrollToIndex against the
 * ChapterListItem model (#1871) instead of accumulated onLayout y-maps,
 * which report cell-relative coordinates under FlashList (#1872).
 *
 * Verse precision: verseIndexMap targets the verse's verseBlock item
 * (a section's verse run). For verses deeper in a block we refine with
 * the verse's cell-relative offset captured by handleVerseLayout — a
 * two-phase jump when the block isn't mounted yet (scrollToIndex mounts
 * it, the verse's onLayout then triggers the precise follow-up).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import type { ReaderScrollable } from '../../components/ChapterVerseList';
import type { ChapterListItem } from '../../utils/chapterItems';
import { useReaderStore } from '../../stores';
import { completePlanDay } from '../../db/user';

/** Gap between the viewport top and an anchored verse/panel row. */
const ANCHOR_TOP_OFFSET = 80;

interface UseChapterScrollOptions {
  bookId: string;
  chapterNum: number;
  initialVerseNum?: number;
  isLoading: boolean;
  versesLength: number;
  planId?: string;
  planDayNum?: number;
  /** Flat reader items (#1871) — drives index lookup for anchor jumps. */
  items: ChapterListItem[];
  /** verse_num → index of its verseBlock item, from buildChapterItems. */
  verseIndexMap: Map<number, number>;
}

export function useChapterScroll({
  bookId,
  chapterNum,
  initialVerseNum,
  isLoading,
  versesLength,
  planId,
  planDayNum,
  items,
  verseIndexMap,
}: UseChapterScrollOptions) {
  const activePanel = useReaderStore((s) => s.activePanel);
  const clearActivePanel = useReaderStore((s) => s.clearActivePanel);

  const scrollRef = useRef<ReaderScrollable>(null);
  /** verse_num → y within its verseBlock cell (cell-relative, #1872). */
  const verseCellOffsets = useRef<Record<number, number>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const planDayCompletedRef = useRef(false);

  /** sectionId → index of the section's panelRow item. */
  const panelRowIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, index) => {
      if (item.type === 'panelRow') map.set(item.sectionId, index);
    });
    return map;
  }, [items]);

  // Track pending scroll timers so they can be cleared on chapter change /
  // unmount, preventing scrollToIndex from firing against a stale chapter.
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
  }, []);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  // Mark plan day complete when scrolled past 80%
  useEffect(() => {
    if (planId && planDayNum && scrollProgress >= 0.8 && !planDayCompletedRef.current) {
      planDayCompletedRef.current = true;
      completePlanDay(planId, planDayNum);
    }
  }, [planId, planDayNum, scrollProgress]);

  // Reset on chapter change
  useEffect(() => {
    clearTimers();
    planDayCompletedRef.current = false;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    clearActivePanel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollProgress(0);
    verseCellOffsets.current = {};
  }, [bookId, chapterNum, clearActivePanel, clearTimers]);

  // Scroll progress tracking
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, contentOffset.y / maxScroll)));
    }
  }, []);

  /**
   * Anchor a verse near the top of the viewport. Uses the verse's
   * verseBlock index plus its cell-relative offset when the block has
   * laid out (0 until then — i.e. the block's top).
   */
  const scrollToVerse = useCallback(
    (verseNum: number, topOffset: number = ANCHOR_TOP_OFFSET, animated: boolean = true) => {
      const index = verseIndexMap.get(verseNum);
      if (index == null) return;
      const cellOffset = verseCellOffsets.current[verseNum] ?? 0;
      // FlatList/FlashList semantics: final offset = itemOffset - viewOffset,
      // so viewOffset = topOffset - cellOffset lands the verse at topOffset.
      scrollRef.current?.scrollToIndex({
        index,
        viewOffset: topOffset - cellOffset,
        animated,
      });
    },
    [verseIndexMap],
  );

  // Auto-scroll to the section's button row when a panel opens
  useEffect(() => {
    if (activePanel && activePanel.sectionId !== '__chapter__') {
      const index = panelRowIndexMap.get(activePanel.sectionId);
      if (index != null) {
        schedule(() => {
          scrollRef.current?.scrollToIndex({
            index,
            viewOffset: ANCHOR_TOP_OFFSET,
            animated: true,
          });
        }, 100);
      }
    }
  }, [activePanel, panelRowIndexMap, schedule]);

  // Auto-scroll to a specific verse when navigated with verseNum param
  // (deep links, note/highlight anchors, plan days).
  //
  // Two-phase under virtualization: the first jump targets the verse's
  // block (scrollToIndex estimates offsets for unmounted cells and mounts
  // the block); once the verse's own onLayout reports its cell-relative
  // offset, a second jump lands it exactly. Verses at a block's top need
  // no refinement — phase one is already exact.
  const scrolledToInitialVerse = useRef(false);
  const refinePending = useRef(false);
  useEffect(() => {
    scrolledToInitialVerse.current = false;
    refinePending.current = false;
  }, [bookId, chapterNum]);

  useEffect(() => {
    if (!initialVerseNum || scrolledToInitialVerse.current || isLoading) return;
    if (!verseIndexMap.has(initialVerseNum)) return;
    scrolledToInitialVerse.current = true;
    refinePending.current = verseCellOffsets.current[initialVerseNum] == null;
    // 50ms delay lets the first layout pass settle before jumping.
    schedule(() => scrollToVerse(initialVerseNum, ANCHOR_TOP_OFFSET, true), 50);
  }, [initialVerseNum, isLoading, versesLength, verseIndexMap, schedule, scrollToVerse]);

  // Layout callbacks — wired from the item renderers (#1872).
  // Section/button-row positions are no longer used for scroll math
  // (indices replaced them); the callbacks remain in the context contract
  // until the D5 (#1875) cleanup pass.
  const handleSectionLayout = useCallback((_sectionId: string, _y: number) => {}, []);

  const handleVerseLayout = useCallback((verseNum: number, y: number, _sectionId: string) => {
    verseCellOffsets.current[verseNum] = y;

    // Phase-two refinement: the deep-link target just laid out inside its
    // block — re-anchor with the now-known offset (no-op when y === 0).
    if (verseNum === initialVerseNum && refinePending.current) {
      refinePending.current = false;
      if (y !== 0) {
        schedule(() => scrollToVerse(verseNum, ANCHOR_TOP_OFFSET, true), 50);
      }
    }
  }, [initialVerseNum, schedule, scrollToVerse]);

  const handleBtnRowLayout = useCallback((_sectionId: string, _sectionY: number, _rowY: number) => {}, []);

  return {
    scrollRef,
    scrollProgress,
    handleScroll,
    handleSectionLayout,
    handleVerseLayout,
    handleBtnRowLayout,
    scrollToVerse,
  };
}
