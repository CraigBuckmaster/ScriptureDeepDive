/**
 * useStreakData — Computes reading streak, weekly summary, and milestone state.
 *
 * Data sources: reading_progress table (user.db).
 * Milestone state persisted via user_preferences key 'seen_milestones'.
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserDb } from '../db/userDatabase';
import { getReadingStats, getPreference, setPreference } from '../db/user';
import { logger } from '../utils/logger';

// ── Milestone definitions ──────────────────────────────────────────

const CHAPTER_MILESTONES: { id: string; threshold: number; message: string }[] = [
  { id: 'ch_10', threshold: 10, message: "You've read 10 chapters." },
  { id: 'ch_50', threshold: 50, message: "You've read 50 chapters." },
  { id: 'ch_100', threshold: 100, message: '100 chapters read.' },
  { id: 'ch_250', threshold: 250, message: 'A quarter of Scripture — 250 chapters.' },
  { id: 'ch_500', threshold: 500, message: '500 chapters read.' },
];

const STREAK_MILESTONES: { id: string; threshold: number; message: string }[] = [
  { id: 'str_7', threshold: 7, message: 'Seven days in a row.' },
  { id: 'str_30', threshold: 30, message: '30-day reading streak.' },
  { id: 'str_100', threshold: 100, message: '100-day streak.' },
];

const PREFS_KEY = 'seen_milestones';

function getMondayISO(): string {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday
  const offset = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - offset);
  return monday.toISOString().slice(0, 10);
}

function formatBookId(id: string): string {
  return id
    .split('_')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// ── Hook ───────────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  totalChapters: number;
  weeklyChapters: number;
  weeklyBookNames: string[];
  pendingMilestone: string | null;
  markMilestoneSeen: () => Promise<void>;
}

export function useStreakData(): StreakData {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [weeklyChapters, setWeeklyChapters] = useState(0);
  const [weeklyBookNames, setWeeklyBookNames] = useState<string[]>([]);
  const [pendingMilestone, setPendingMilestone] = useState<string | null>(null);
  const [pendingMilestoneId, setPendingMilestoneId] = useState<string | null>(null);

  const markMilestoneSeen = useCallback(async () => {
    if (!pendingMilestoneId) return;
    try {
      const raw = await getPreference(PREFS_KEY);
      const seen: string[] = raw ? JSON.parse(raw) : [];
      seen.push(pendingMilestoneId);
      await setPreference(PREFS_KEY, JSON.stringify(seen));
      setPendingMilestone(null);
      setPendingMilestoneId(null);
    } catch (err) {
      logger.warn('useStreakData', 'markMilestoneSeen failed', err);
    }
  }, [pendingMilestoneId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const db = getUserDb();
        const mondayISO = getMondayISO();

        const [stats, weekRows, seenRaw] = await Promise.all([
          getReadingStats(),
          db.getAllAsync<{ book_id: string; chapters: number }>(
            `SELECT book_id, COUNT(*) as chapters
             FROM reading_progress
             WHERE completed_at IS NOT NULL AND date(completed_at) >= ?
             GROUP BY book_id`,
            [mondayISO]
          ),
          getPreference(PREFS_KEY),
        ]);

        if (cancelled) return;

        const seen: string[] = seenRaw ? JSON.parse(seenRaw) : [];
        const seenSet = new Set(seen);

        const totalWeekly = weekRows.reduce((sum, r) => sum + r.chapters, 0);
        const bookNames = weekRows.map((r) => formatBookId(r.book_id));

        setCurrentStreak(stats.currentStreak);
        setTotalChapters(stats.totalChapters);
        setWeeklyChapters(totalWeekly);
        setWeeklyBookNames(bookNames);

        // Find first unseen milestone
        let milestone: { id: string; message: string } | null = null;

        for (const m of CHAPTER_MILESTONES) {
          if (stats.totalChapters >= m.threshold && !seenSet.has(m.id)) {
            milestone = m;
            break;
          }
        }
        if (!milestone) {
          for (const m of STREAK_MILESTONES) {
            if (stats.currentStreak >= m.threshold && !seenSet.has(m.id)) {
              milestone = m;
              break;
            }
          }
        }

        setPendingMilestone(milestone?.message ?? null);
        setPendingMilestoneId(milestone?.id ?? null);
      } catch (err) {
        logger.warn('useStreakData', 'Load failed', err);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return {
    currentStreak,
    totalChapters,
    weeklyChapters,
    weeklyBookNames,
    pendingMilestone,
    markMilestoneSeen,
  };
}
