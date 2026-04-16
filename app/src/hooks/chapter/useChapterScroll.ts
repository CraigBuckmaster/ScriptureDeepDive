/**
 * useChapterScroll — Scroll refs, progress tracking, layout callbacks,
 * and auto-scroll to panel/verse behaviors.
 *
 * Extracted from ChapterScreen (#970).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useReaderStore } from '../../stores';
import { completePlanDay } from '../../db/user';

interface UseChapterScrollOptions {
  bookId: string;
  chapterNum: number;
  initialVerseNum?: number;
  isLoading: boolean;
  versesLength: number;
  planId?: string;
  planDayNum?: number;
}

export function useChapterScroll({
  bookId,
  chapterNum,
  initialVerseNum,
  isLoading,
  versesLength,
  planId,
  planDayNum,
}: UseChapterScrollOptions) {
  const activePanel = useReaderStore((s) => s.activePanel);
  const clearActivePanel = useReaderStore((s) => s.clearActivePanel);

  const scrollRef = useRef<ScrollView>(null);
  const sectionYMap = useRef<Record<string, number>>({});
  const verseYMap = useRef<Record<number, number>>({});
  const btnRowYMap = useRef<Record<string, number>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const planDayCompletedRef = useRef(false);

  // Mark plan day complete when scrolled past 80%
  useEffect(() => {
    if (planId && planDayNum && scrollProgress >= 0.8 && !planDayCompletedRef.current) {
      planDayCompletedRef.current = true;
      completePlanDay(planId, planDayNum);
    }
  }, [planId, planDayNum, scrollProgress]);

  // Reset on chapter change
  useEffect(() => {
    planDayCompletedRef.current = false;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    clearActivePanel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollProgress(0);
    verseYMap.current = {};
  }, [bookId, chapterNum, clearActivePanel]);

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

  // Auto-scroll to a specific verse when navigated with verseNum param.
  //
  // RACE NOTES:
  //   1. The previous version only scrolled via an effect that ran when
  //      isLoading flipped to false. At that moment, React Native's onLayout
  //      callbacks haven't fired yet, so verseYMap is empty and the scroll
  //      was silently dropped. Layout callbacks don't trigger a re-render,
  //      so the effect never retried.
  //   2. onLayout order across nested views is not guaranteed — a verse's
  //      onLayout can fire before its enclosing section's onLayout. If we
  //      scrolled immediately using sectionY + verseY, sectionY might still
  //      be 0 and the computed target would be wrong.
  //
  // Fix: track scroll as *pending* when the target is set. Attempt to flush
  // from both handleVerseLayout and handleSectionLayout — whichever completes
  // the picture last triggers the actual scroll. We require a non-zero
  // sectionY to flush (scrolling to y=0 is what a zero-offset target looks
  // like, and would be indistinguishable from an uninitialised section at
  // the very top; we treat the top-of-chapter case as already-scrolled so
  // flushing it is a no-op anyway).
  const scrolledToInitialVerse = useRef(false);
  useEffect(() => {
    scrolledToInitialVerse.current = false;
  }, [bookId, chapterNum]);

  const tryFlushInitialScroll = useCallback((sectionId: string) => {
    if (!initialVerseNum || scrolledToInitialVerse.current) return;
    const sectionY = sectionYMap.current[sectionId];
    const verseY = verseYMap.current[initialVerseNum];
    // Need both pieces. verseYMap values are stored as (sectionY + verseRelative),
    // so if section wasn't known at store time, verseY here is effectively just
    // verseRelative. We re-derive from the refs rather than trusting a stale sum.
    if (sectionY == null || verseY == null) return;
    scrolledToInitialVerse.current = true;
    const targetY = Math.max(0, verseY - 80);
    // 50ms delay lets any remaining sibling layouts settle before animating.
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 50);
  }, [initialVerseNum]);

  // Fast-path: if layout already happened (e.g. cached chapter), scroll now.
  useEffect(() => {
    if (!initialVerseNum || scrolledToInitialVerse.current || isLoading) return;
    // We don't know which section the verse is in; iterate and try each.
    // Ref map is small (one key per section), so this is cheap.
    for (const sectionId of Object.keys(sectionYMap.current)) {
      tryFlushInitialScroll(sectionId);
      if (scrolledToInitialVerse.current) break;
    }
  }, [initialVerseNum, isLoading, versesLength, tryFlushInitialScroll]);

  // Layout callbacks
  const handleSectionLayout = useCallback((sectionId: string, y: number) => {
    sectionYMap.current[sectionId] = y;
    // A section's position became known — if we were waiting on it for
    // the initial verse scroll, try to flush now.
    tryFlushInitialScroll(sectionId);
  }, [tryFlushInitialScroll]);

  const handleVerseLayout = useCallback((verseNum: number, y: number, sectionId: string) => {
    const sectionY = sectionYMap.current[sectionId] ?? 0;
    verseYMap.current[verseNum] = sectionY + y;

    // The target verse just laid out — try to flush.
    if (initialVerseNum === verseNum) {
      tryFlushInitialScroll(sectionId);
    }
  }, [initialVerseNum, tryFlushInitialScroll]);

  const handleBtnRowLayout = useCallback((sectionId: string, _sectionY: number, rowY: number) => {
    const secY = sectionYMap.current[sectionId] ?? 0;
    btnRowYMap.current[sectionId] = secY + rowY;
  }, []);

  return {
    scrollRef,
    sectionYMap,
    verseYMap,
    scrollProgress,
    handleScroll,
    handleSectionLayout,
    handleVerseLayout,
    handleBtnRowLayout,
  };
}
