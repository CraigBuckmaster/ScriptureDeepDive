/**
 * db/user.ts — User data queries (read + write).
 *
 * These operate on the user_* tables which are local-only
 * and never overwritten by OTA content updates.
 */

import { getDb } from './database';
import type { UserNote, ReadingProgress, Bookmark, RecentChapter } from '../types';

// ── Notes ───────────────────────────────────────────────────────────

export async function getNotesForChapter(bookId: string, ch: number): Promise<UserNote[]> {
  const prefix = `${bookId}:${ch}`;
  return getDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE verse_ref LIKE ? ORDER BY verse_ref",
    [`${prefix}%`]
  );
}

export async function getNoteCount(bookId: string, ch: number): Promise<number> {
  const prefix = `${bookId}:${ch}`;
  const row = await getDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_notes WHERE verse_ref LIKE ?",
    [`${prefix}%`]
  );
  return row?.count ?? 0;
}

export async function saveNote(verseRef: string, text: string): Promise<number> {
  const result = await getDb().runAsync(
    "INSERT INTO user_notes (verse_ref, note_text) VALUES (?, ?)",
    [verseRef, text]
  );
  return result.lastInsertRowId;
}

export async function updateNote(id: number, text: string): Promise<void> {
  await getDb().runAsync(
    "UPDATE user_notes SET note_text = ?, updated_at = datetime('now') WHERE id = ?",
    [text, id]
  );
}

export async function deleteNote(id: number): Promise<void> {
  await getDb().runAsync("DELETE FROM user_notes WHERE id = ?", [id]);
}

export async function getAllNotes(): Promise<UserNote[]> {
  return getDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes ORDER BY verse_ref, updated_at DESC"
  );
}

export async function searchNotes(query: string): Promise<UserNote[]> {
  return getDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE note_text LIKE ? OR verse_ref LIKE ? ORDER BY verse_ref",
    [`%${query}%`, `%${query}%`]
  );
}

// ── Reading Progress ────────────────────────────────────────────────

export async function recordVisit(bookId: string, ch: number): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO reading_progress (book_id, chapter_num, completed_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(book_id, chapter_num) DO UPDATE SET completed_at = datetime('now')`,
    [bookId, ch]
  );
}

export async function getRecentChapters(limit: number = 10): Promise<RecentChapter[]> {
  return getDb().getAllAsync<RecentChapter>(
    `SELECT rp.*, c.title, b.name as book_name
     FROM reading_progress rp
     JOIN chapters c ON c.book_id = rp.book_id AND c.chapter_num = rp.chapter_num
     JOIN books b ON b.id = rp.book_id
     ORDER BY rp.completed_at DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getProgressForBook(bookId: string): Promise<ReadingProgress[]> {
  return getDb().getAllAsync<ReadingProgress>(
    "SELECT * FROM reading_progress WHERE book_id = ? ORDER BY chapter_num",
    [bookId]
  );
}

// ── Bookmarks ───────────────────────────────────────────────────────

export async function addBookmark(verseRef: string, label?: string): Promise<number> {
  const result = await getDb().runAsync(
    "INSERT INTO bookmarks (verse_ref, label) VALUES (?, ?)",
    [verseRef, label ?? null]
  );
  return result.lastInsertRowId;
}

export async function removeBookmark(id: number): Promise<void> {
  await getDb().runAsync("DELETE FROM bookmarks WHERE id = ?", [id]);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return getDb().getAllAsync<Bookmark>(
    "SELECT * FROM bookmarks ORDER BY created_at DESC"
  );
}

export async function isBookmarked(verseRef: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM bookmarks WHERE verse_ref = ?",
    [verseRef]
  );
  return (row?.count ?? 0) > 0;
}

// ── Preferences ─────────────────────────────────────────────────────

export async function getPreference(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ value: string }>(
    "SELECT value FROM user_preferences WHERE key = ?", [key]
  );
  return row?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  await getDb().runAsync(
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
  await getDb().runAsync(
    `INSERT INTO verse_highlights (verse_ref, color) VALUES (?, ?)
     ON CONFLICT(verse_ref) DO UPDATE SET color = ?, created_at = datetime('now')`,
    [verseRef, color, color]
  );
}

export async function removeHighlight(verseRef: string): Promise<void> {
  await getDb().runAsync("DELETE FROM verse_highlights WHERE verse_ref = ?", [verseRef]);
}

export async function getHighlightsForChapter(bookId: string, ch: number): Promise<VerseHighlight[]> {
  const prefix = `${bookId} ${ch}:`;
  return getDb().getAllAsync<VerseHighlight>(
    "SELECT * FROM verse_highlights WHERE verse_ref LIKE ?",
    [`${prefix}%`]
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
  return getDb().getAllAsync<ReadingPlan>("SELECT * FROM reading_plans ORDER BY total_days");
}

export async function startPlan(planId: string): Promise<void> {
  const plan = await getDb().getFirstAsync<ReadingPlan>(
    "SELECT * FROM reading_plans WHERE id = ?", [planId]
  );
  if (!plan) return;
  // Clear any existing progress
  await getDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
  // Insert rows for each day
  for (let day = 1; day <= plan.total_days; day++) {
    await getDb().runAsync(
      "INSERT INTO plan_progress (plan_id, day_num) VALUES (?, ?)",
      [planId, day]
    );
  }
  await setPreference('active_plan', planId);
  await setPreference('plan_start_date', new Date().toISOString().slice(0, 10));
}

export async function completePlanDay(planId: string, dayNum: number): Promise<void> {
  await getDb().runAsync(
    "UPDATE plan_progress SET completed_at = datetime('now') WHERE plan_id = ? AND day_num = ?",
    [planId, dayNum]
  );
}

export async function getPlanProgress(planId: string): Promise<PlanProgress[]> {
  return getDb().getAllAsync<PlanProgress>(
    "SELECT * FROM plan_progress WHERE plan_id = ? ORDER BY day_num",
    [planId]
  );
}

export async function abandonPlan(planId: string): Promise<void> {
  await getDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
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
  const totalRow = await getDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM reading_progress"
  );
  const total = totalRow?.count ?? 0;

  // Favourite book
  const favRow = await getDb().getFirstAsync<{ book_id: string }>(
    "SELECT book_id, COUNT(*) as c FROM reading_progress GROUP BY book_id ORDER BY c DESC LIMIT 1"
  );

  // Streak calculation: count consecutive days backwards from today
  const days = await getDb().getAllAsync<{ day: string }>(
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
