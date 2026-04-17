/**
 * services/amicus/profile/signals.ts — Pull engagement signals from user.db.
 *
 * All queries are deterministic so the same database state produces the same
 * hash. Signals cover reading progress, scholar opens, tradition/genre
 * distribution, journey state, and current study focus.
 */
import type {
  CurrentFocus,
  RawSignals,
  RecentChapter,
  ScholarEngagement,
} from './types';
import { getUserDb } from '@/db/userDatabase';
import { getDb } from '@/db/database';
import { logger } from '@/utils/logger';

const RECENT_WINDOW_DAYS = 30;
const CURRENT_FOCUS_WINDOW_DAYS = 14;
const CURRENT_FOCUS_MIN_CHAPTERS = 3;
const TOP_SCHOLARS_LIMIT = 5;
const SCHOLAR_ENGAGEMENT_FLOOR = 10;

export async function collectSignals(): Promise<RawSignals> {
  const [totals, recent30, scholars, traditions, genres, journeys, recentChapters, focus] =
    await Promise.all([
      getTotalChaptersRead(),
      getChaptersReadInLastDays(RECENT_WINDOW_DAYS),
      getTopScholarsOpened(TOP_SCHOLARS_LIMIT),
      getTraditionDistribution(),
      getGenreDistribution(),
      getJourneyState(),
      getRecentChapters(10),
      getCurrentFocus(),
    ]);

  return {
    total_chapters_read: totals,
    last_30_day_chapters: recent30,
    top_scholars_opened: scholars,
    tradition_distribution: traditions,
    genre_distribution: genres,
    completed_journeys: journeys.completed,
    active_journey: journeys.active,
    recent_chapters: recentChapters,
    current_focus: focus,
  };
}

export async function getTotalChaptersRead(): Promise<number> {
  const row = await getUserDb().getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM reading_progress WHERE completed_at IS NOT NULL',
  );
  return row?.n ?? 0;
}

export async function getChaptersReadInLastDays(days: number): Promise<number> {
  const row = await getUserDb().getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM reading_progress
     WHERE completed_at IS NOT NULL
       AND completed_at >= datetime('now', ?)`,
    [`-${days} days`],
  );
  return row?.n ?? 0;
}

export async function getTopScholarsOpened(limit: number): Promise<ScholarEngagement[]> {
  try {
    const rows = await getUserDb().getAllAsync<ScholarEngagement>(
      `SELECT scholar_id, COUNT(*) AS open_count
       FROM scholar_opens
       GROUP BY scholar_id
       ORDER BY open_count DESC
       LIMIT ?`,
      [limit],
    );
    return rows;
  } catch (err) {
    // scholar_opens is a future engagement table — return empty until it exists.
    logger.info('AmicusProfile', `scholar_opens unavailable: ${(err as Error).message}`);
    return [];
  }
}

export async function getTraditionDistribution(): Promise<Record<string, number>> {
  const scholars = await getTopScholarsOpened(100);
  if (scholars.length === 0) return {};

  const ids = scholars.map((s) => s.scholar_id);
  const placeholders = ids.map(() => '?').join(',');
  const rows = await getDb().getAllAsync<{ tradition: string | null; id: string }>(
    `SELECT id, tradition FROM scholars WHERE id IN (${placeholders})`,
    ids,
  );
  const traditionById = new Map(rows.map((r) => [r.id, r.tradition]));

  const totals = new Map<string, number>();
  let grand = 0;
  for (const s of scholars) {
    const t = traditionById.get(s.scholar_id);
    if (!t) continue;
    totals.set(t, (totals.get(t) ?? 0) + s.open_count);
    grand += s.open_count;
  }
  if (grand === 0) return {};

  const result: Record<string, number> = {};
  for (const [k, v] of totals) result[k] = v / grand;
  return result;
}

export async function getGenreDistribution(): Promise<Record<string, number>> {
  const rows = await getDb().getAllAsync<{ genre: string | null; n: number }>(
    `SELECT b.genre AS genre, COUNT(*) AS n
     FROM books b
     JOIN reading_progress rp ON rp.book_id = b.id
     WHERE rp.completed_at IS NOT NULL
     GROUP BY b.genre`,
  );
  const totals: Record<string, number> = {};
  let grand = 0;
  for (const r of rows) {
    if (!r.genre) continue;
    totals[r.genre] = (totals[r.genre] ?? 0) + r.n;
    grand += r.n;
  }
  if (grand === 0) return {};
  for (const k of Object.keys(totals)) totals[k] = (totals[k] ?? 0) / grand;
  return totals;
}

export async function getJourneyState(): Promise<{
  completed: string[];
  active: string | null;
}> {
  try {
    const completedRows = await getUserDb().getAllAsync<{ journey_id: string }>(
      'SELECT journey_id FROM journey_progress WHERE completed_at IS NOT NULL ORDER BY completed_at',
    );
    const activeRow = await getUserDb().getFirstAsync<{ journey_id: string }>(
      `SELECT journey_id FROM journey_progress
       WHERE completed_at IS NULL
       ORDER BY updated_at DESC
       LIMIT 1`,
    );
    return {
      completed: completedRows.map((r) => r.journey_id),
      active: activeRow?.journey_id ?? null,
    };
  } catch (err) {
    // journey_progress not yet populated for this user — safe to skip.
    logger.info('AmicusProfile', `journey_progress unavailable: ${(err as Error).message}`);
    return { completed: [], active: null };
  }
}

export async function getRecentChapters(limit: number): Promise<RecentChapter[]> {
  const rows = await getUserDb().getAllAsync<RecentChapter>(
    `SELECT book_id, chapter_num, completed_at AS last_visit
     FROM reading_progress
     WHERE completed_at IS NOT NULL
     ORDER BY completed_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows;
}

/**
 * A "current focus" is detected when the user has read ≥N chapters of a single
 * book in the last M days. Gives the profile a useful hook like "recently
 * focused on Romans" without requiring explicit user declaration.
 */
export async function getCurrentFocus(): Promise<CurrentFocus | null> {
  const rows = await getUserDb().getAllAsync<{
    book_id: string;
    n: number;
    first: string;
  }>(
    `SELECT book_id, COUNT(*) AS n, MIN(completed_at) AS first
     FROM reading_progress
     WHERE completed_at IS NOT NULL
       AND completed_at >= datetime('now', ?)
     GROUP BY book_id
     ORDER BY n DESC
     LIMIT 1`,
    [`-${CURRENT_FOCUS_WINDOW_DAYS} days`],
  );
  const top = rows[0];
  if (!top || top.n < CURRENT_FOCUS_MIN_CHAPTERS) return null;
  return {
    book_id: top.book_id,
    chapters_in_range: top.n,
    days_in_range: CURRENT_FOCUS_WINDOW_DAYS,
  };
}

export { SCHOLAR_ENGAGEMENT_FLOOR };
