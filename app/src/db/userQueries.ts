/**
 * db/userQueries.ts — Read-only user data queries.
 *
 * Split from db/user.ts for maintainability. All queries target user.db
 * via getUserDb().
 */

import { chapterPrefix, formatVerseRef } from '../utils/verseRef';
import { escapeLike } from '../utils/escapeLike';
import type { UserNote, ReadingProgress, Bookmark, RecentChapter, StudyCollection, StudySession, StudySessionEvent } from '../types';
import { getDb } from './database';
import { getUserDb } from './userDatabase';

// ── Shared interfaces ─────────────────────────────────────────────

export interface VerseHighlight {
  id: number;
  verse_ref: string;
  color: string;
  created_at: string;
  collection_id: string | null;
  note: string | null;
}

export interface HighlightCollection {
  id: string;
  name: string;
  color: string;
  created_at: string;
  sort_order: number;
}

export interface AuthProfile {
  supabase_uid: string;
  email: string;
  display_name: string;
  avatar_url: string;
  provider: string;
}

// ── Notes (read) ───────────────────────────────────────────────────

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

export async function getAllNotes(): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes ORDER BY verse_ref, updated_at DESC"
  );
}

export async function searchNotes(query: string): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE note_text LIKE ? ESCAPE '\\' OR verse_ref LIKE ? ESCAPE '\\' ORDER BY verse_ref",
    [`%${escapeLike(query)}%`, `%${escapeLike(query)}%`]
  );
}

// ── Reading Progress (read) ────────────────────────────────────────

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

  // Step 2: Batch-enrich with book/chapter names from content.db (scripture.db)
  const placeholders = rows.map(() => '(?, ?)').join(', ');
  const params = rows.flatMap((rp) => [rp.book_id, rp.chapter_num]);

  const infos = await getDb().getAllAsync<{ book_id: string; chapter_num: number; title: string | null; book_name: string }>(
    `SELECT c.book_id, c.chapter_num, c.title, b.name as book_name
     FROM chapters c
     JOIN books b ON b.id = c.book_id
     WHERE (c.book_id, c.chapter_num) IN (VALUES ${placeholders})`,
    params
  );

  const infoMap = new Map(infos.map((i) => [`${i.book_id}:${i.chapter_num}`, i]));

  const enriched: RecentChapter[] = rows.map((rp) => {
    const info = infoMap.get(`${rp.book_id}:${rp.chapter_num}`);
    return {
      ...rp,
      title: info?.title ?? null,
      book_name: info?.book_name ?? rp.book_id,
    };
  });

  return enriched;
}

export async function getProgressForBook(bookId: string): Promise<ReadingProgress[]> {
  return getUserDb().getAllAsync<ReadingProgress>(
    "SELECT * FROM reading_progress WHERE book_id = ? ORDER BY chapter_num",
    [bookId]
  );
}

// ── Bookmarks (read) ──────────────────────────────────────────────

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

// ── Preferences (read) ────────────────────────────────────────────

export async function getPreference(key: string): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ value: string }>(
    "SELECT value FROM user_preferences WHERE key = ?", [key]
  );
  return row?.value ?? null;
}

// ── Highlights (read) ─────────────────────────────────────────────

export async function getHighlightsForChapter(bookId: string, ch: number): Promise<VerseHighlight[]> {
  return getUserDb().getAllAsync<VerseHighlight>(
    "SELECT * FROM verse_highlights WHERE verse_ref LIKE ?",
    [`${chapterPrefix(bookId, ch)}%`]
  );
}

export async function getAllHighlights(): Promise<VerseHighlight[]> {
  return getUserDb().getAllAsync<VerseHighlight>(
    "SELECT * FROM verse_highlights ORDER BY created_at DESC"
  );
}

// ── Highlight Collections (read) ──────────────────────────────────

export async function getHighlightCollections(): Promise<HighlightCollection[]> {
  return getUserDb().getAllAsync<HighlightCollection>(
    "SELECT * FROM highlight_collections ORDER BY sort_order, name"
  );
}

// ── Reading Plans (read) ──────────────────────────────────────────

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

export async function getPlanProgress(planId: string): Promise<PlanProgress[]> {
  return getUserDb().getAllAsync<PlanProgress>(
    "SELECT * FROM plan_progress WHERE plan_id = ? ORDER BY day_num",
    [planId]
  );
}

export async function getActivePlanId(): Promise<string | null> {
  const id = await getPreference('active_plan');
  return id && id.length > 0 ? id : null;
}

// ── Reading Stats ─────────────────────────────────────────────────

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

// ── Testament Progress ───────────────────────────────────────────

export interface TestamentProgress {
  testament: string;
  chaptersRead: number;
  totalChapters: number;
}

/**
 * Get reading progress broken down by testament (OT/NT).
 * Joins reading_progress with the content DB's books table.
 */
export async function getTestamentProgress(): Promise<TestamentProgress[]> {
  const otChapters = 929;
  const ntChapters = 260;

  const rows = await getUserDb().getAllAsync<{ book_id: string; cnt: number }>(
    `SELECT book_id, COUNT(DISTINCT chapter_num) as cnt FROM reading_progress GROUP BY book_id`,
  );

  // Known NT book IDs
  const ntBookIds = new Set([
    'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
    '1_corinthians', '2_corinthians', 'galatians', 'ephesians',
    'philippians', 'colossians', '1_thessalonians', '2_thessalonians',
    '1_timothy', '2_timothy', 'titus', 'philemon', 'hebrews',
    'james', '1_peter', '2_peter', '1_john', '2_john', '3_john',
    'jude', 'revelation',
  ]);

  let otRead = 0;
  let ntRead = 0;
  for (const row of rows) {
    if (ntBookIds.has(row.book_id)) {
      ntRead += row.cnt;
    } else {
      otRead += row.cnt;
    }
  }

  return [
    { testament: 'Old Testament', chaptersRead: otRead, totalChapters: otChapters },
    { testament: 'New Testament', chaptersRead: ntRead, totalChapters: ntChapters },
  ];
}

// ── Study Collections (read) ─────────────────────────────────────

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

// ── Tags (read) ──────────────────────────────────────────────────

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

export async function getNotesByTag(tag: string): Promise<UserNote[]> {
  // Use JSON LIKE search — fine for small datasets
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE tags_json LIKE ? ESCAPE '\\' ORDER BY verse_ref",
    [`%"${escapeLike(tag)}"%`]
  );
}

// ── Study Sessions (read) ───────────────────────────────────────

export async function getStudySessions(limit?: number): Promise<StudySession[]> {
  return getUserDb().getAllAsync<StudySession>(
    `SELECT * FROM study_sessions ORDER BY started_at DESC${limit ? ' LIMIT ?' : ''}`,
    limit ? [limit] : []
  );
}

export async function getStudySession(id: number): Promise<StudySession | null> {
  return getUserDb().getFirstAsync<StudySession>(
    'SELECT * FROM study_sessions WHERE id = ?',
    [id]
  );
}

export async function getSessionEvents(sessionId: number): Promise<StudySessionEvent[]> {
  return getUserDb().getAllAsync<StudySessionEvent>(
    'SELECT * FROM study_session_events WHERE session_id = ? ORDER BY timestamp_ms',
    [sessionId]
  );
}

export async function getStudySessionsForChapter(chapterId: string): Promise<StudySession[]> {
  return getUserDb().getAllAsync<StudySession>(
    'SELECT * FROM study_sessions WHERE chapter_id = ? ORDER BY started_at DESC',
    [chapterId]
  );
}

// ── Note Links (read) ─────────────────────────────────────────────

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

// ── FTS Search ───────────────────────────────────────────────────

/**
 * Full-text search across all notes.
 * Returns notes matching the query, ranked by relevance.
 */
export async function searchNotesFTS(query: string): Promise<UserNote[]> {
  // Sanitize: wrap each word in quotes for phrase matching
  const sanitized = query
    .replace(/["*(){}[\]^~:]/g, '')
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

// ── Auth Profile (read) ──────────────────────────────────────────

export async function getAuthProfile(): Promise<AuthProfile | null> {
  return getUserDb().getFirstAsync<AuthProfile>(
    'SELECT supabase_uid, email, display_name, avatar_url, provider FROM auth_profiles LIMIT 1',
  );
}

// ── Flagged Content (read) ──────────────────────────────────────

/**
 * Check whether a piece of content has been flagged by the current user.
 */
export async function isFlagged(contentId: string): Promise<boolean> {
  const row = await getUserDb().getFirstAsync<{ id: number }>(
    'SELECT id FROM flagged_content WHERE content_id = ? LIMIT 1',
    [contentId],
  );
  return row != null;
}

// ── Bookmarked Topics (read) ────────────────────────────────────────

export interface BookmarkedTopic {
  id: number;
  topic_id: string;
  topic_type: string;
  bookmarked_at: string;
  cached_title: string | null;
  cached_summary: string | null;
}

export async function getBookmarkedTopics(): Promise<BookmarkedTopic[]> {
  return getUserDb().getAllAsync<BookmarkedTopic>(
    'SELECT * FROM bookmarked_topics ORDER BY bookmarked_at DESC',
  );
}

export async function isTopicBookmarked(topicId: string): Promise<boolean> {
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarked_topics WHERE topic_id = ?',
    [topicId],
  );
  return (row?.count ?? 0) > 0;
}
