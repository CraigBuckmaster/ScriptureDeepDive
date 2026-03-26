/**
 * db/user.ts — User data queries (read + write).
 *
 * All queries target user.db via getUserDb(). This database is never
 * replaced by content updates — only migrated in-place.
 *
 * For queries that need to join user data with content data (e.g.
 * enriching reading progress with book/chapter names), we query
 * both databases separately and join in application code.
 */

import { getUserDb } from './userDatabase';
import { getDb } from './database';
import { chapterPrefix } from '../utils/verseRef';
import type { UserNote, ReadingProgress, Bookmark, RecentChapter } from '../types';

// ── Notes ───────────────────────────────────────────────────────────

export async function getNotesForChapter(bookId: string, ch: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE verse_ref LIKE ? ORDER BY verse_ref",
    [`${chapterPrefix(bookId, ch)}%`]
  );
}

export async function getNoteCount(bookId: string, ch: number): Promise<number> {
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_notes WHERE verse_ref LIKE ?",
    [`${chapterPrefix(bookId, ch)}%`]
  );
  return row?.count ?? 0;
}

export async function saveNote(verseRef: string, text: string): Promise<number> {
  const result = await getUserDb().runAsync(
    "INSERT INTO user_notes (verse_ref, note_text) VALUES (?, ?)",
    [verseRef, text]
  );
  return result.lastInsertRowId;
}

export async function updateNote(id: number, text: string): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE user_notes SET note_text = ?, updated_at = datetime('now') WHERE id = ?",
    [text, id]
  );
}

export async function deleteNote(id: number): Promise<void> {
  await getUserDb().runAsync("DELETE FROM user_notes WHERE id = ?", [id]);
}

export async function getAllNotes(): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes ORDER BY verse_ref, updated_at DESC"
  );
}

export async function searchNotes(query: string): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE note_text LIKE ? OR verse_ref LIKE ? ORDER BY verse_ref",
    [`%${query}%`, `%${query}%`]
  );
}

// ── Reading Progress ────────────────────────────────────────────────

export async function recordVisit(bookId: string, ch: number): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO reading_progress (book_id, chapter_num, completed_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(book_id, chapter_num) DO UPDATE SET completed_at = datetime('now')`,
    [bookId, ch]
  );
}

/**
 * Get recent chapters with book/chapter names.
 *
 * Since reading_progress lives in user.db and chapters/books live in
 * scripture.db, we query user.db first, then enrich from content.db.
 */
export async function getRecentChapters(limit: number = 10): Promise<RecentChapter[]> {
  // Step 1: Get raw progress from user.db
  const rows = await getUserDb().getAllAsync<ReadingProgress>(
    "SELECT * FROM reading_progress WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT ?",
    [limit]
  );

  if (rows.length === 0) return [];

  // Step 2: Enrich with book/chapter names from content.db (scripture.db)
  const enriched: RecentChapter[] = [];
  for (const rp of rows) {
    const info = await getDb().getFirstAsync<{ title: string | null; book_name: string }>(
      `SELECT c.title, b.name as book_name
       FROM chapters c
       JOIN books b ON b.id = c.book_id
       WHERE c.book_id = ? AND c.chapter_num = ?`,
      [rp.book_id, rp.chapter_num]
    );

    enriched.push({
      ...rp,
      title: info?.title ?? null,
      book_name: info?.book_name ?? rp.book_id,
    });
  }

  return enriched;
}

export async function getProgressForBook(bookId: string): Promise<ReadingProgress[]> {
  return getUserDb().getAllAsync<ReadingProgress>(
    "SELECT * FROM reading_progress WHERE book_id = ? ORDER BY chapter_num",
    [bookId]
  );
}

// ── Bookmarks ───────────────────────────────────────────────────────

export async function addBookmark(verseRef: string, label?: string): Promise<number> {
  const result = await getUserDb().runAsync(
    "INSERT INTO bookmarks (verse_ref, label) VALUES (?, ?)",
    [verseRef, label ?? null]
  );
  return result.lastInsertRowId;
}

export async function removeBookmark(id: number): Promise<void> {
  await getUserDb().runAsync("DELETE FROM bookmarks WHERE id = ?", [id]);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return getUserDb().getAllAsync<Bookmark>(
    "SELECT * FROM bookmarks ORDER BY created_at DESC"
  );
}

export async function isBookmarked(verseRef: string): Promise<boolean> {
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM bookmarks WHERE verse_ref = ?",
    [verseRef]
  );
  return (row?.count ?? 0) > 0;
}

// ── Preferences ─────────────────────────────────────────────────────

export async function getPreference(key: string): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ value: string }>(
    "SELECT value FROM user_preferences WHERE key = ?", [key]
  );
  return row?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO user_preferences (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`,
    [key, value, value]
  );
}

// ── Highlights ──────────────────────────────────────────────────────

export interface VerseHighlight {
  id: number;
  verse_ref: string;
  color: string;
  created_at: string;
}

export async function setHighlight(verseRef: string, color: string): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO verse_highlights (verse_ref, color) VALUES (?, ?)
     ON CONFLICT(verse_ref) DO UPDATE SET color = ?, created_at = datetime('now')`,
    [verseRef, color, color]
  );
}

export async function removeHighlight(verseRef: string): Promise<void> {
  await getUserDb().runAsync("DELETE FROM verse_highlights WHERE verse_ref = ?", [verseRef]);
}

export async function getHighlightsForChapter(bookId: string, ch: number): Promise<VerseHighlight[]> {
  return getUserDb().getAllAsync<VerseHighlight>(
    "SELECT * FROM verse_highlights WHERE verse_ref LIKE ?",
    [`${chapterPrefix(bookId, ch)}%`]
  );
}

// ── Reading Plans ───────────────────────────────────────────────────

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  total_days: number;
  chapters_json: string;
}

export interface PlanProgress {
  plan_id: string;
  day_num: number;
  completed_at: string | null;
}

export async function getPlans(): Promise<ReadingPlan[]> {
  return getUserDb().getAllAsync<ReadingPlan>("SELECT * FROM reading_plans ORDER BY total_days");
}

export async function startPlan(planId: string): Promise<void> {
  const plan = await getUserDb().getFirstAsync<ReadingPlan>(
    "SELECT * FROM reading_plans WHERE id = ?", [planId]
  );
  if (!plan) return;
  // Clear any existing progress
  await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
  // Insert rows for each day
  for (let day = 1; day <= plan.total_days; day++) {
    await getUserDb().runAsync(
      "INSERT INTO plan_progress (plan_id, day_num) VALUES (?, ?)",
      [planId, day]
    );
  }
  await setPreference('active_plan', planId);
  await setPreference('plan_start_date', new Date().toISOString().slice(0, 10));
}

export async function completePlanDay(planId: string, dayNum: number): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE plan_progress SET completed_at = datetime('now') WHERE plan_id = ? AND day_num = ?",
    [planId, dayNum]
  );
}

export async function getPlanProgress(planId: string): Promise<PlanProgress[]> {
  return getUserDb().getAllAsync<PlanProgress>(
    "SELECT * FROM plan_progress WHERE plan_id = ? ORDER BY day_num",
    [planId]
  );
}

export async function abandonPlan(planId: string): Promise<void> {
  await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
  await setPreference('active_plan', '');
}

export async function getActivePlanId(): Promise<string | null> {
  const id = await getPreference('active_plan');
  return id && id.length > 0 ? id : null;
}

// ── Reading Stats ───────────────────────────────────────────────────

export interface ReadingStats {
  totalChapters: number;
  currentStreak: number;
  longestStreak: number;
  favouriteBook: string | null;
}

export async function getReadingStats(): Promise<ReadingStats> {
  const totalRow = await getUserDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM reading_progress"
  );
  const total = totalRow?.count ?? 0;

  // Favourite book
  const favRow = await getUserDb().getFirstAsync<{ book_id: string }>(
    "SELECT book_id, COUNT(*) as c FROM reading_progress GROUP BY book_id ORDER BY c DESC LIMIT 1"
  );

  // Streak calculation: count consecutive days backwards from today
  const days = await getUserDb().getAllAsync<{ day: string }>(
    "SELECT DISTINCT date(completed_at) as day FROM reading_progress WHERE completed_at IS NOT NULL ORDER BY day DESC"
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (days[i]?.day === expectedStr) {
      streak++;
      if (i === 0 || streak > 0) currentStreak = streak;
    } else {
      if (streak > longestStreak) longestStreak = streak;
      if (i === 0) currentStreak = 0;
      break;
    }
  }
  if (streak > longestStreak) longestStreak = streak;

  return {
    totalChapters: total,
    currentStreak,
    longestStreak,
    favouriteBook: favRow?.book_id ?? null,
  };
}
