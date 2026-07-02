/**
 * services/study/rhythm.ts — Weekly study rhythm (#1831).
 *
 * Derived entirely from `guided_study_sessions` (completed sessions)
 * and `guided_review_items` (completed reviews) — no new table, no
 * streak math. "Rhythm" is a per-ISO-week count the hub can render as
 * a gentle cadence strip, not a gamified streak.
 */
import { getUserDb } from '../../db/userDatabase';

export interface WeeklyRhythm {
  /** ISO week key, e.g. "2026-W27". */
  week: string;
  /** Monday of the week, as YYYY-MM-DD (UTC). */
  weekStart: string;
  sessions: number;
  reviews: number;
}

/**
 * Parse a SQLite `datetime('now')` timestamp ("YYYY-MM-DD HH:MM:SS",
 * stored UTC) into a Date. Also tolerates ISO-8601 strings.
 */
export function parseSqliteUtc(value: string): Date | null {
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Monday 00:00 UTC of the ISO week containing `date`. */
export function isoWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d;
}

/** ISO 8601 week key ("2026-W27") — the week belongs to the year of its Thursday. */
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // shift to Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Completed guided sessions and completed review items per ISO week,
 * for the trailing `weeks` weeks (default 8, oldest first, zero-filled
 * so the hub always renders a full strip).
 */
export async function getWeeklyRhythm(weeks = 8, now: Date = new Date()): Promise<WeeklyRhythm[]> {
  const db = getUserDb();

  // Zero-filled buckets for the trailing window, oldest → newest.
  const buckets = new Map<string, WeeklyRhythm>();
  const currentWeekStart = isoWeekStart(now);
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setUTCDate(start.getUTCDate() - i * 7);
    buckets.set(isoWeekKey(start), {
      week: isoWeekKey(start),
      weekStart: start.toISOString().slice(0, 10),
      sessions: 0,
      reviews: 0,
    });
  }

  // +7 days of slack so week boundaries never clip the oldest bucket.
  const sinceModifier = `-${weeks * 7 + 7} days`;

  const sessionRows = await db.getAllAsync<{ completed_at: string }>(
    `SELECT completed_at FROM guided_study_sessions
     WHERE status = 'completed' AND completed_at IS NOT NULL
       AND completed_at >= datetime('now', ?)`,
    [sinceModifier],
  );
  const reviewRows = await db.getAllAsync<{ updated_at: string }>(
    `SELECT updated_at FROM guided_review_items
     WHERE status = 'completed' AND updated_at >= datetime('now', ?)`,
    [sinceModifier],
  );

  for (const row of sessionRows) {
    const date = parseSqliteUtc(row.completed_at);
    if (!date) continue;
    const bucket = buckets.get(isoWeekKey(date));
    if (bucket) bucket.sessions++;
  }
  for (const row of reviewRows) {
    const date = parseSqliteUtc(row.updated_at);
    if (!date) continue;
    const bucket = buckets.get(isoWeekKey(date));
    if (bucket) bucket.reviews++;
  }

  return Array.from(buckets.values());
}
