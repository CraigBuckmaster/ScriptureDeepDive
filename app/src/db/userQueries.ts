/**
 * db/userQueries.ts — Read-only user data queries.
 *
 * Split from db/user.ts for maintainability. All queries target user.db
 * via getUserDb().
 */

import { chapterPrefix, formatVerseRef } from '../utils/verseRef';
import { escapeLike } from '../utils/escapeLike';
import { logger } from '../utils/logger';
import type {
  UserNote,
  ReadingProgress,
  Bookmark,
  RecentChapter,
  StudyCollection,
  StudySession,
  StudySessionEvent,
  AmicusThread,
  AmicusMessage,
  AmicusCitation,
  AmicusThreadContextRecord,
  ConceptEncounter,
  GuidedReviewItem,
  GuidedStudyQuestion,
  GuidedStudyResponse,
  GuidedStudySession,
  GuidedStudySynthesis,
  GuidedStudyTakeawaySummary,
} from '../types';
import {
  emptyCapturedInputs,
  safeParseCapturedInputs,
  type CapturedInputs,
  type SynthesisStrategyKind,
} from '../services/guidedStudy/capturedInputs';
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
    'SELECT * FROM user_notes WHERE verse_ref LIKE ? OR verse_ref = ? ORDER BY verse_ref',
    [`${prefix}%`, chapterRef],
  );
}

export async function getNoteCount(bookId: string, ch: number): Promise<number> {
  const prefix = chapterPrefix(bookId, ch);
  const chapterRef = formatVerseRef(bookId, ch);
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_notes WHERE verse_ref LIKE ? OR verse_ref = ?',
    [`${prefix}%`, chapterRef],
  );
  return row?.count ?? 0;
}

export async function getAllNotes(): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    'SELECT * FROM user_notes ORDER BY verse_ref, updated_at DESC',
  );
}

export async function searchNotes(query: string): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE note_text LIKE ? ESCAPE '\\' OR verse_ref LIKE ? ESCAPE '\\' ORDER BY verse_ref",
    [`%${escapeLike(query)}%`, `%${escapeLike(query)}%`],
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
    'SELECT * FROM reading_progress WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT ?',
    [limit],
  );

  if (rows.length === 0) return [];

  // Step 2: Batch-enrich with book/chapter names from content.db (scripture.db)
  const placeholders = rows.map(() => '(?, ?)').join(', ');
  const params = rows.flatMap((rp) => [rp.book_id, rp.chapter_num]);

  const infos = await getDb().getAllAsync<{
    book_id: string;
    chapter_num: number;
    title: string | null;
    book_name: string;
  }>(
    `SELECT c.book_id, c.chapter_num, c.title, b.name as book_name
     FROM chapters c
     JOIN books b ON b.id = c.book_id
     WHERE (c.book_id, c.chapter_num) IN (VALUES ${placeholders})`,
    params,
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
    'SELECT * FROM reading_progress WHERE book_id = ? ORDER BY chapter_num',
    [bookId],
  );
}

// ── Bookmarks (read) ──────────────────────────────────────────────

export async function getBookmarks(): Promise<Bookmark[]> {
  return getUserDb().getAllAsync<Bookmark>('SELECT * FROM bookmarks ORDER BY created_at DESC');
}

export async function isBookmarked(verseRef: string): Promise<boolean> {
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE verse_ref = ?',
    [verseRef],
  );
  return (row?.count ?? 0) > 0;
}

// ── Preferences (read) ────────────────────────────────────────────

export async function getPreference(key: string): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ value: string }>(
    'SELECT value FROM user_preferences WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

// ── Highlights (read) ─────────────────────────────────────────────

export async function getHighlightsForChapter(
  bookId: string,
  ch: number,
): Promise<VerseHighlight[]> {
  return getUserDb().getAllAsync<VerseHighlight>(
    'SELECT * FROM verse_highlights WHERE verse_ref LIKE ?',
    [`${chapterPrefix(bookId, ch)}%`],
  );
}

export async function getAllHighlights(): Promise<VerseHighlight[]> {
  return getUserDb().getAllAsync<VerseHighlight>(
    'SELECT * FROM verse_highlights ORDER BY created_at DESC',
  );
}

// ── Highlight Collections (read) ──────────────────────────────────

export async function getHighlightCollections(): Promise<HighlightCollection[]> {
  return getUserDb().getAllAsync<HighlightCollection>(
    'SELECT * FROM highlight_collections ORDER BY sort_order, name',
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
  return getUserDb().getAllAsync<ReadingPlan>('SELECT * FROM reading_plans ORDER BY total_days');
}

export async function getPlanProgress(planId: string): Promise<PlanProgress[]> {
  return getUserDb().getAllAsync<PlanProgress>(
    'SELECT * FROM plan_progress WHERE plan_id = ? ORDER BY day_num',
    [planId],
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
    'SELECT COUNT(*) as count FROM reading_progress',
  );
  const total = totalRow?.count ?? 0;

  // Favourite book
  const favRow = await getUserDb().getFirstAsync<{ book_id: string }>(
    'SELECT book_id, COUNT(*) as c FROM reading_progress GROUP BY book_id ORDER BY c DESC LIMIT 1',
  );

  // Streak calculation: count consecutive days backwards from today
  const days = await getUserDb().getAllAsync<{ day: string }>(
    'SELECT DISTINCT date(completed_at) as day FROM reading_progress WHERE completed_at IS NOT NULL ORDER BY day DESC',
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
    'matthew',
    'mark',
    'luke',
    'john',
    'acts',
    'romans',
    '1_corinthians',
    '2_corinthians',
    'galatians',
    'ephesians',
    'philippians',
    'colossians',
    '1_thessalonians',
    '2_thessalonians',
    '1_timothy',
    '2_timothy',
    'titus',
    'philemon',
    'hebrews',
    'james',
    '1_peter',
    '2_peter',
    '1_john',
    '2_john',
    '3_john',
    'jude',
    'revelation',
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
    'SELECT * FROM study_collections ORDER BY updated_at DESC',
  );
}

export async function getCollection(id: number): Promise<StudyCollection | null> {
  return getUserDb().getFirstAsync<StudyCollection>(
    'SELECT * FROM study_collections WHERE id = ?',
    [id],
  );
}

export async function getNotesInCollection(collectionId: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    'SELECT * FROM user_notes WHERE collection_id = ? ORDER BY verse_ref, updated_at DESC',
    [collectionId],
  );
}

export async function getCollectionNoteCounts(): Promise<Record<number, number>> {
  const rows = await getUserDb().getAllAsync<{ collection_id: number; count: number }>(
    'SELECT collection_id, COUNT(*) as count FROM user_notes WHERE collection_id IS NOT NULL GROUP BY collection_id',
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
    "SELECT tags_json FROM user_notes WHERE tags_json IS NOT NULL AND tags_json != '[]'",
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
    [`%"${escapeLike(tag)}"%`],
  );
}

// ── Study Sessions (read) ───────────────────────────────────────

export async function getStudySessions(limit?: number): Promise<StudySession[]> {
  return getUserDb().getAllAsync<StudySession>(
    `SELECT * FROM study_sessions ORDER BY started_at DESC${limit ? ' LIMIT ?' : ''}`,
    limit ? [limit] : [],
  );
}

export async function getStudySession(id: number): Promise<StudySession | null> {
  return getUserDb().getFirstAsync<StudySession>('SELECT * FROM study_sessions WHERE id = ?', [id]);
}

export async function getSessionEvents(sessionId: number): Promise<StudySessionEvent[]> {
  return getUserDb().getAllAsync<StudySessionEvent>(
    'SELECT * FROM study_session_events WHERE session_id = ? ORDER BY timestamp_ms',
    [sessionId],
  );
}

export async function getStudySessionsForChapter(chapterId: string): Promise<StudySession[]> {
  return getUserDb().getAllAsync<StudySession>(
    'SELECT * FROM study_sessions WHERE chapter_id = ? ORDER BY started_at DESC',
    [chapterId],
  );
}

// ── Note Links (read) ─────────────────────────────────────────────

/**
 * Get notes that this note links TO.
 */
// Guided Study V1 (read)

export async function getActiveGuidedStudySession(
  chapterId: string,
): Promise<GuidedStudySession | null> {
  return getUserDb().getFirstAsync<GuidedStudySession>(
    `SELECT * FROM guided_study_sessions
     WHERE chapter_id = ? AND status = 'active'
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`,
    [chapterId],
  );
}

export async function getGuidedStudySession(sessionId: number): Promise<GuidedStudySession | null> {
  return getUserDb().getFirstAsync<GuidedStudySession>(
    'SELECT * FROM guided_study_sessions WHERE id = ?',
    [sessionId],
  );
}

export async function getGuidedStudyResponses(sessionId: number): Promise<GuidedStudyResponse[]> {
  return getUserDb().getAllAsync<GuidedStudyResponse>(
    'SELECT * FROM guided_study_responses WHERE session_id = ? ORDER BY id',
    [sessionId],
  );
}

export async function getGuidedStudySynthesis(
  sessionId: number,
): Promise<GuidedStudySynthesis | null> {
  return getUserDb().getFirstAsync<GuidedStudySynthesis>(
    'SELECT * FROM guided_study_synthesis WHERE session_id = ?',
    [sessionId],
  );
}

export async function getCapturedInputs(sessionId: number): Promise<CapturedInputs> {
  const row = await getUserDb().getFirstAsync<{ captured_inputs_json: string | null }>(
    'SELECT captured_inputs_json FROM guided_study_sessions WHERE id = ?',
    [sessionId],
  );
  if (!row) return emptyCapturedInputs();
  return safeParseCapturedInputs(row.captured_inputs_json);
}

export async function getModeArtifact(sessionId: number): Promise<unknown> {
  const row = await getUserDb().getFirstAsync<{ mode_artifact_json: string | null }>(
    'SELECT mode_artifact_json FROM guided_study_sessions WHERE id = ?',
    [sessionId],
  );
  if (!row || row.mode_artifact_json == null) return null;
  try {
    return JSON.parse(row.mode_artifact_json) as unknown;
  } catch (err) {
    logger.warn('GuidedStudy', 'modeArtifact JSON parse failed', err);
    return null;
  }
}

export async function getSynthesisStrategy(
  sessionId: number,
): Promise<SynthesisStrategyKind | null> {
  const row = await getUserDb().getFirstAsync<{ synthesis_strategy: string | null }>(
    'SELECT synthesis_strategy FROM guided_study_sessions WHERE id = ?',
    [sessionId],
  );
  const value = row?.synthesis_strategy;
  if (value === 'free' || value === 'premium_structured' || value === 'premium_amicus') {
    return value;
  }
  return null;
}

export async function getDueGuidedReviewItems(limit: number = 20): Promise<GuidedReviewItem[]> {
  return getUserDb().getAllAsync<GuidedReviewItem>(
    `SELECT * FROM guided_review_items
     WHERE status = 'due' AND due_date <= date('now')
     ORDER BY due_date ASC, id ASC
     LIMIT ?`,
    [limit],
  );
}

export async function getAllGuidedReviewItems(limit: number = 50): Promise<GuidedReviewItem[]> {
  return getUserDb().getAllAsync<GuidedReviewItem>(
    `SELECT * FROM guided_review_items
     ORDER BY due_date ASC, id ASC
     LIMIT ?`,
    [limit],
  );
}

export async function getDueGuidedReviewItemCountForChapter(chapterId: string): Promise<number> {
  const row = await getUserDb().getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM guided_review_items
     WHERE chapter_id = ? AND status = 'due' AND due_date <= date('now')`,
    [chapterId],
  );
  return row?.count ?? 0;
}

export async function getActiveGuidedStudySessions(
  limit: number = 5,
): Promise<GuidedStudySession[]> {
  return getUserDb().getAllAsync<GuidedStudySession>(
    `SELECT * FROM guided_study_sessions
     WHERE status = 'active'
     ORDER BY updated_at DESC, id DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getOpenGuidedStudyQuestions(
  limit: number = 10,
): Promise<GuidedStudyQuestion[]> {
  return getUserDb().getAllAsync<GuidedStudyQuestion>(
    `SELECT * FROM guided_study_questions
     WHERE status = 'open'
     ORDER BY updated_at DESC, id DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getGuidedStudyQuestionForSession(
  sessionId: number,
): Promise<GuidedStudyQuestion | null> {
  return getUserDb().getFirstAsync<GuidedStudyQuestion>(
    `SELECT * FROM guided_study_questions
     WHERE session_id = ?
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`,
    [sessionId],
  );
}

export async function getRecentGuidedStudyTakeaways(
  limit: number = 10,
): Promise<GuidedStudyTakeawaySummary[]> {
  return getUserDb().getAllAsync<GuidedStudyTakeawaySummary>(
    `SELECT
        synthesis.session_id,
        sessions.chapter_id,
        synthesis.takeaway,
        synthesis.updated_at
      FROM guided_study_synthesis synthesis
      JOIN guided_study_sessions sessions ON sessions.id = synthesis.session_id
      WHERE trim(synthesis.takeaway) != ''
      ORDER BY synthesis.updated_at DESC, synthesis.id DESC
      LIMIT ?`,
    [limit],
  );
}

export async function getConceptEncounters(limit: number = 30): Promise<ConceptEncounter[]> {
  return getUserDb().getAllAsync<ConceptEncounter>(
    `SELECT * FROM concept_encounters
     ORDER BY last_seen_at DESC, encounter_count DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getLinkedNotes(noteId: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    `SELECT n.* FROM user_notes n
     JOIN note_links l ON l.to_note_id = n.id
     WHERE l.from_note_id = ?
     ORDER BY n.verse_ref`,
    [noteId],
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
    [noteId],
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
    [sanitized],
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

// ── Amicus threads + messages + usage (#1457) ───────────────────────

interface AmicusThreadRow {
  thread_id: string;
  title: string;
  chapter_ref: string | null;
  pinned: number;
  summary_text: string | null;
  last_user_intent: string | null;
  guided_step: GuidedStudySession['current_step'] | null;
  open_question_id: number | null;
  guided_question_status: GuidedStudyQuestion['status'] | null;
  takeaway: string | null;
  key_connection: string | null;
  created_at: string;
  last_message_at: string;
}

interface AmicusThreadContextRow {
  thread_id: string;
  entry_point: AmicusThreadContextRecord['entry_point'];
  guided_session_id: number | null;
  guided_step: GuidedStudySession['current_step'] | null;
  open_question_id: number | null;
  takeaway: string | null;
  key_connection: string | null;
  created_at: string;
  updated_at: string;
}

interface AmicusMessageRow {
  message_id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations_json: string | null;
  follow_ups_json: string | null;
  created_at: string;
}

function hydrateThread(row: AmicusThreadRow): AmicusThread {
  return {
    thread_id: row.thread_id,
    title: row.title,
    chapter_ref: row.chapter_ref,
    pinned: row.pinned === 1,
    summary_text: row.summary_text,
    last_user_intent: row.last_user_intent,
    guided_step: row.guided_step,
    open_question_id: row.open_question_id,
    guided_question_status: row.guided_question_status,
    takeaway: row.takeaway,
    key_connection: row.key_connection,
    created_at: row.created_at,
    last_message_at: row.last_message_at,
  };
}

function hydrateThreadContext(row: AmicusThreadContextRow): AmicusThreadContextRecord {
  return {
    thread_id: row.thread_id,
    entry_point: row.entry_point,
    guided_session_id: row.guided_session_id,
    guided_step: row.guided_step,
    open_question_id: row.open_question_id,
    takeaway: row.takeaway,
    key_connection: row.key_connection,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function hydrateMessage(row: AmicusMessageRow): AmicusMessage {
  let citations: AmicusCitation[] = [];
  let follow_ups: string[] = [];
  if (row.citations_json) {
    try {
      const parsed = JSON.parse(row.citations_json);
      if (Array.isArray(parsed)) citations = parsed as AmicusCitation[];
    } catch {
      /* ignore */
    }
  }
  if (row.follow_ups_json) {
    try {
      const parsed = JSON.parse(row.follow_ups_json);
      if (Array.isArray(parsed)) follow_ups = parsed as string[];
    } catch {
      /* ignore */
    }
  }
  return {
    message_id: row.message_id,
    thread_id: row.thread_id,
    role: row.role,
    content: row.content,
    citations,
    follow_ups,
    created_at: row.created_at,
  };
}

export async function listAmicusThreads(limit = 50, offset = 0): Promise<AmicusThread[]> {
  const rows = await getUserDb().getAllAsync<AmicusThreadRow>(
    `SELECT t.thread_id, t.title, t.chapter_ref, t.pinned,
            s.summary_text, s.last_user_intent,
            c.guided_step, c.open_question_id, q.status AS guided_question_status,
            c.takeaway, c.key_connection,
            t.created_at, t.last_message_at
       FROM amicus_threads t
       LEFT JOIN amicus_thread_summaries s ON s.thread_id = t.thread_id
       LEFT JOIN amicus_thread_context c ON c.thread_id = t.thread_id
       LEFT JOIN guided_study_questions q ON q.id = c.open_question_id
      ORDER BY pinned DESC, last_message_at DESC
      LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows.map(hydrateThread);
}

export async function getAmicusThread(threadId: string): Promise<AmicusThread | null> {
  const row = await getUserDb().getFirstAsync<AmicusThreadRow>(
    `SELECT t.thread_id, t.title, t.chapter_ref, t.pinned,
            s.summary_text, s.last_user_intent,
            c.guided_step, c.open_question_id, q.status AS guided_question_status,
            c.takeaway, c.key_connection,
            t.created_at, t.last_message_at
       FROM amicus_threads t
       LEFT JOIN amicus_thread_summaries s ON s.thread_id = t.thread_id
       LEFT JOIN amicus_thread_context c ON c.thread_id = t.thread_id
       LEFT JOIN guided_study_questions q ON q.id = c.open_question_id
      WHERE t.thread_id = ?`,
    [threadId],
  );
  return row ? hydrateThread(row) : null;
}

export async function getAmicusThreadContext(
  threadId: string,
): Promise<AmicusThreadContextRecord | null> {
  const row = await getUserDb().getFirstAsync<AmicusThreadContextRow>(
    `SELECT thread_id, entry_point, guided_session_id, guided_step,
            open_question_id, takeaway, key_connection, created_at, updated_at
       FROM amicus_thread_context
      WHERE thread_id = ?`,
    [threadId],
  );
  return row ? hydrateThreadContext(row) : null;
}

export async function getLinkedGuidedStudyQuestionForThread(
  threadId: string,
): Promise<GuidedStudyQuestion | null> {
  return getUserDb().getFirstAsync<GuidedStudyQuestion>(
    `SELECT q.*
       FROM guided_study_questions q
       JOIN amicus_thread_context c ON c.open_question_id = q.id
      WHERE c.thread_id = ?
      LIMIT 1`,
    [threadId],
  );
}

export async function getAmicusThreadIdForGuidedQuestion(
  questionId: number,
): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ thread_id: string }>(
    `SELECT thread_id
       FROM amicus_thread_context
      WHERE open_question_id = ?
      LIMIT 1`,
    [questionId],
  );
  return row?.thread_id ?? null;
}

export async function getAmicusThreadIdForGuidedSession(
  sessionId: number,
  guidedStep?: GuidedStudySession['current_step'] | null,
): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ thread_id: string }>(
    guidedStep
      ? `SELECT thread_id
           FROM amicus_thread_context
          WHERE guided_session_id = ? AND guided_step = ?
          ORDER BY updated_at DESC
          LIMIT 1`
      : `SELECT thread_id
           FROM amicus_thread_context
          WHERE guided_session_id = ?
          ORDER BY updated_at DESC
          LIMIT 1`,
    guidedStep ? [sessionId, guidedStep] : [sessionId],
  );
  return row?.thread_id ?? null;
}

export async function getLatestAmicusThreadIdForChapterContext(
  chapterRef: string,
  entryPoint?: AmicusThreadContextRecord['entry_point'] | null,
): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ thread_id: string }>(
    entryPoint
      ? `SELECT t.thread_id
           FROM amicus_threads t
           LEFT JOIN amicus_thread_context c ON c.thread_id = t.thread_id
          WHERE t.chapter_ref = ? AND c.entry_point = ?
          ORDER BY COALESCE(c.updated_at, t.last_message_at) DESC
          LIMIT 1`
      : `SELECT thread_id
           FROM amicus_threads
          WHERE chapter_ref = ?
          ORDER BY last_message_at DESC
          LIMIT 1`,
    entryPoint ? [chapterRef, entryPoint] : [chapterRef],
  );
  return row?.thread_id ?? null;
}

export async function getLatestStudyAmicusThreadIdForChapter(
  chapterRef: string,
): Promise<string | null> {
  const row = await getUserDb().getFirstAsync<{ thread_id: string }>(
    `SELECT t.thread_id
       FROM amicus_threads t
       LEFT JOIN amicus_thread_context c ON c.thread_id = t.thread_id
      WHERE t.chapter_ref = ?
        AND (
          c.entry_point IN ('guided_study', 'my_study')
          OR c.guided_session_id IS NOT NULL
          OR c.open_question_id IS NOT NULL
          OR trim(COALESCE(c.takeaway, '')) != ''
          OR trim(COALESCE(c.key_connection, '')) != ''
        )
      ORDER BY COALESCE(c.updated_at, t.last_message_at) DESC
      LIMIT 1`,
    [chapterRef],
  );
  return row?.thread_id ?? null;
}

export async function listAmicusMessages(threadId: string): Promise<AmicusMessage[]> {
  const rows = await getUserDb().getAllAsync<AmicusMessageRow>(
    `SELECT message_id, thread_id, role, content, citations_json, follow_ups_json, created_at
       FROM amicus_messages WHERE thread_id = ? ORDER BY created_at ASC`,
    [threadId],
  );
  return rows.map(hydrateMessage);
}

export async function getAmicusUsageToday(): Promise<number> {
  const row = await getUserDb().getFirstAsync<{ query_count: number }>(
    "SELECT query_count FROM amicus_usage WHERE day = strftime('%Y-%m-%d', 'now')",
  );
  return row?.query_count ?? 0;
}

export async function getAmicusUsageThisMonth(): Promise<number> {
  const row = await getUserDb().getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(query_count), 0) AS total
       FROM amicus_usage
      WHERE day >= strftime('%Y-%m-01', 'now')
        AND day <  strftime('%Y-%m-01', 'now', '+1 month')`,
  );
  return row?.total ?? 0;
}

// ── Amicus daily prompt cache (#1465) ───────────────────────────────

export interface CachedDailyPrompt {
  date: string;
  profile_hash: string;
  prompt_text: string;
  seed_query: string;
  generated_at: string;
}

export async function getCachedDailyPrompt(): Promise<CachedDailyPrompt | null> {
  const row = await getUserDb().getFirstAsync<CachedDailyPrompt>(
    `SELECT date, profile_hash, prompt_text, seed_query, generated_at
       FROM amicus_daily_prompt_cache
      WHERE id = 1`,
  );
  return row ?? null;
}
