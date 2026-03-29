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
import { chapterPrefix, formatVerseRef } from '../utils/verseRef';
import type { UserNote, ReadingProgress, Bookmark, RecentChapter, StudyCollection, NoteLink } from '../types';

// ── Notes ───────────────────────────────────────────────────────────

export async function getNotesForChapter(bookId: string, ch: number): Promise<UserNote[]> {
  // Match both verse-level refs ("genesis 1:3") and chapter-level refs ("genesis 1")
  const prefix = chapterPrefix(bookId, ch);
  const chapterRef = formatVerseRef(bookId, ch);
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE verse_ref LIKE ? OR verse_ref = ? ORDER BY verse_ref",
    [`${prefix}%`, chapterRef]
  );
}

export async function getNoteCount(bookId: string, ch: number): Promise<number> {
  const prefix = chapterPrefix(bookId, ch);
  const chapterRef = formatVerseRef(bookId, ch);
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_notes WHERE verse_ref LIKE ? OR verse_ref = ?",
    [`${prefix}%`, chapterRef]
  );
  return row?.count ?? 0;
}

export async function saveNote(verseRef: string, text: string): Promise<number> {
  const result = await getUserDb().runAsync(
    "INSERT INTO user_notes (verse_ref, note_text) VALUES (?, ?)",
    [verseRef, text]
  );
  const noteId = result.lastInsertRowId;
  // Sync FTS
  await getUserDb().runAsync(
    "INSERT INTO notes_fts(rowid, note_text) VALUES (?, ?)",
    [noteId, text]
  );
  return noteId;
}

export async function updateNote(id: number, text: string): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE user_notes SET note_text = ?, updated_at = datetime('now') WHERE id = ?",
    [text, id]
  );
  // Sync FTS
  await getUserDb().runAsync(
    "UPDATE notes_fts SET note_text = ? WHERE rowid = ?",
    [text, id]
  );
}

export async function deleteNote(id: number): Promise<void> {
  await getUserDb().runAsync("DELETE FROM user_notes WHERE id = ?", [id]);
  // Sync FTS
  await getUserDb().runAsync("DELETE FROM notes_fts WHERE rowid = ?", [id]);
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

  await getUserDb().execAsync('BEGIN TRANSACTION');
  try {
    await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);

    // Batch insert — single statement instead of N individual inserts
    const BATCH_SIZE = 100;
    for (let start = 1; start <= plan.total_days; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, plan.total_days);
      const placeholders: string[] = [];
      const values: (string | number)[] = [];
      for (let day = start; day <= end; day++) {
        placeholders.push('(?, ?)');
        values.push(planId, day);
      }
      await getUserDb().runAsync(
        `INSERT INTO plan_progress (plan_id, day_num) VALUES ${placeholders.join(',')}`,
        values
      );
    }

    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', ?)",
      [planId]
    );
    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('plan_start_date', ?)",
      [new Date().toISOString().slice(0, 10)]
    );
    await getUserDb().execAsync('COMMIT');
  } catch (err) {
    await getUserDb().execAsync('ROLLBACK');
    throw err;
  }
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
  await getUserDb().execAsync('BEGIN TRANSACTION');
  try {
    await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', '')"
    );
    await getUserDb().execAsync('COMMIT');
  } catch (err) {
    await getUserDb().execAsync('ROLLBACK');
    throw err;
  }
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

// ── Study Collections ──────────────────────────────────────────────

export async function getCollections(): Promise<StudyCollection[]> {
  return getUserDb().getAllAsync<StudyCollection>(
    "SELECT * FROM study_collections ORDER BY updated_at DESC"
  );
}

export async function getCollection(id: number): Promise<StudyCollection | null> {
  return getUserDb().getFirstAsync<StudyCollection>(
    "SELECT * FROM study_collections WHERE id = ?",
    [id]
  );
}

export async function createCollection(
  name: string,
  description: string = '',
  color: string = '#bfa050'
): Promise<number> {
  const result = await getUserDb().runAsync(
    "INSERT INTO study_collections (name, description, color) VALUES (?, ?, ?)",
    [name, description, color]
  );
  return result.lastInsertRowId;
}

export async function updateCollection(
  id: number,
  name: string,
  description: string,
  color: string
): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE study_collections SET name = ?, description = ?, color = ?, updated_at = datetime('now') WHERE id = ?",
    [name, description, color, id]
  );
}

export async function deleteCollection(id: number): Promise<void> {
  // Notes in this collection will have collection_id set to NULL (ON DELETE SET NULL)
  await getUserDb().runAsync("DELETE FROM study_collections WHERE id = ?", [id]);
}

export async function getNotesInCollection(collectionId: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE collection_id = ? ORDER BY verse_ref, updated_at DESC",
    [collectionId]
  );
}

export async function getCollectionNoteCounts(): Promise<Record<number, number>> {
  const rows = await getUserDb().getAllAsync<{ collection_id: number; count: number }>(
    "SELECT collection_id, COUNT(*) as count FROM user_notes WHERE collection_id IS NOT NULL GROUP BY collection_id"
  );
  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.collection_id] = row.count;
  }
  return counts;
}

// ── Tags ────────────────────────────────────────────────────────────

/**
 * Get all unique tags across all notes.
 */
export async function getAllTags(): Promise<string[]> {
  const notes = await getUserDb().getAllAsync<{ tags_json: string }>(
    "SELECT tags_json FROM user_notes WHERE tags_json IS NOT NULL AND tags_json != '[]'"
  );
  const tagSet = new Set<string>();
  for (const note of notes) {
    try {
      const tags: string[] = JSON.parse(note.tags_json);
      tags.forEach((t) => tagSet.add(t));
    } catch {
      // Skip malformed JSON
    }
  }
  return Array.from(tagSet).sort();
}

export async function updateNoteTags(noteId: number, tags: string[]): Promise<void> {
  const tagsJson = JSON.stringify(tags);
  await getUserDb().runAsync(
    "UPDATE user_notes SET tags_json = ?, updated_at = datetime('now') WHERE id = ?",
    [tagsJson, noteId]
  );
}

export async function getNotesByTag(tag: string): Promise<UserNote[]> {
  // Use JSON LIKE search — fine for small datasets
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE tags_json LIKE ? ORDER BY verse_ref",
    [`%"${tag}"%`]
  );
}

export async function setNoteCollection(noteId: number, collectionId: number | null): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE user_notes SET collection_id = ?, updated_at = datetime('now') WHERE id = ?",
    [collectionId, noteId]
  );
}

// ── Note Links ──────────────────────────────────────────────────────

export async function linkNotes(fromId: number, toId: number): Promise<void> {
  await getUserDb().runAsync(
    "INSERT OR IGNORE INTO note_links (from_note_id, to_note_id) VALUES (?, ?)",
    [fromId, toId]
  );
}

export async function unlinkNotes(fromId: number, toId: number): Promise<void> {
  await getUserDb().runAsync(
    "DELETE FROM note_links WHERE from_note_id = ? AND to_note_id = ?",
    [fromId, toId]
  );
}

/**
 * Get notes that this note links TO.
 */
export async function getLinkedNotes(noteId: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    `SELECT n.* FROM user_notes n
     JOIN note_links l ON l.to_note_id = n.id
     WHERE l.from_note_id = ?
     ORDER BY n.verse_ref`,
    [noteId]
  );
}

/**
 * Get notes that link TO this note (backlinks).
 */
export async function getReferencingNotes(noteId: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    `SELECT n.* FROM user_notes n
     JOIN note_links l ON l.from_note_id = n.id
     WHERE l.to_note_id = ?
     ORDER BY n.verse_ref`,
    [noteId]
  );
}

// ── FTS Search ──────────────────────────────────────────────────────

/**
 * Full-text search across all notes.
 * Returns notes matching the query, ranked by relevance.
 */
export async function searchNotesFTS(query: string): Promise<UserNote[]> {
  // Sanitize: wrap each word in quotes for phrase matching
  const sanitized = query
    .replace(/["\*\(\)\{\}\[\]^~:]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => `"${w}"`)
    .join(' ');

  if (!sanitized) return [];

  return getUserDb().getAllAsync<UserNote>(
    `SELECT n.* FROM notes_fts f
     JOIN user_notes n ON n.id = f.rowid
     WHERE f.note_text MATCH ?
     ORDER BY rank`,
    [sanitized]
  );
}
