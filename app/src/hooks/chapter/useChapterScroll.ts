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
    setScrollProgress(0);
    verseYMap.current = {};
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

  // Auto-scroll to a specific verse when navigated with verseNum param
  const scrolledToInitialVerse = useRef(false);
  useEffect(() => {
    scrolledToInitialVerse.current = false;
  }, [bookId, chapterNum]);

  useEffect(() => {
    if (!initialVerseNum || scrolledToInitialVerse.current || isLoading) return;
    const y = verseYMap.current[initialVerseNum];
    if (y != null) {
      scrolledToInitialVerse.current = true;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
      }, 150);
    }
  }, [initialVerseNum, isLoading, versesLength]);

  // Layout callbacks
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
