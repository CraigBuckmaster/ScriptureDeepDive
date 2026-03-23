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
  const prefix = `${bookId} ${ch}:`;
  return getDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE verse_ref LIKE ? ORDER BY verse_ref",
    [`${prefix}%`]
  );
}

export async function getNoteCount(bookId: string, ch: number): Promise<number> {
  const prefix = `${bookId} ${ch}:`;
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
