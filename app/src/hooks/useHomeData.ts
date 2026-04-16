/**
 * useHomeData — Consolidated data hook for the HomeScreen.
 *
 * Loads content stats, recent chapters, reading stats, and verse of the day
 * in a single hook with unified loading state.
 *
 * Verse-of-the-day + holiday logic lives in utils/verseOfDay so the
 * notification scheduler can share the exact same selection algorithm.
 */

import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getContentStats, type ContentStats } from '../db/content';
import { getRecentChapters, getReadingStats, type ReadingStats } from '../db/user';
import type { RecentChapter } from '../types';
import { logger } from '../utils/logger';
import {
  getVerseOfDay,
  getHolidayForDate,
  getEncouragementForDate,
  type VerseOfDay,
} from '../utils/verseOfDay';

// ── Time-aware greeting ────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ── Personal subtitle ──────────────────────────────────────────────

function getSubtitle(readingStats: ReadingStats | null): string {
  if (!readingStats || readingStats.totalChapters === 0) {
    return 'Learn to read the Bible the way it was written';
  }
  // Holiday takes precedence; otherwise rotate through the encouragement pool.
  const holiday = getHolidayForDate();
  if (holiday) return holiday.encouragement;
  return getEncouragementForDate();
}

// ── Hook ───────────────────────────────────────────────────────────

export interface HomeData {
  greeting: string;
  subtitle: string;
  stats: ContentStats | null;
  verse: VerseOfDay;
  recentChapters: RecentChapter[];
  readingStats: ReadingStats | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useHomeData(): HomeData {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [recentChapters, setRecentChapters] = useState<RecentChapter[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, recent, rs] = await Promise.all([
        getContentStats(),
        getRecentChapters(3),
        getReadingStats(),
      ]);
      setStats(s);
      setRecentChapters(recent);
      setReadingStats(rs);
    } catch (err) {
      logger.warn('useHomeData', 'Load error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return {
    greeting: getGreeting(),
    subtitle: getSubtitle(readingStats),
    stats,
    verse: getVerseOfDay(),
    recentChapters,
    readingStats,
    isLoading,
    refresh: load,
  };
}
