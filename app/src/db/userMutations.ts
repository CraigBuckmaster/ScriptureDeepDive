/**
 * db/userMutations.ts — Write/mutation user data operations.
 *
 * Split from db/user.ts for maintainability. All mutations target user.db
 * via getUserDb().
 */

import type { UserNote } from '../types';
import { logger } from '../utils/logger';
import { getUserDb } from './userDatabase';
import { getPreference } from './userQueries';

// ── Notes (write) ─────────────────────────────────────────────────

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

// ── Reading Progress (write) ──────────────────────────────────────

export async function recordVisit(bookId: string, ch: number): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO reading_progress (book_id, chapter_num, completed_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(book_id, chapter_num) DO UPDATE SET completed_at = datetime('now')`,
    [bookId, ch]
  );
}

// ── Bookmarks (write) ─────────────────────────────────────────────

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

// ── Preferences (write) ──────────────────────────────────────────

export async function setPreference(key: string, value: string): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO user_preferences (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`,
    [key, value, value]
  );
}

// ── Highlights (write) ───────────────────────────────────────────

export async function setHighlight(
  verseRef: string,
  color: string,
  collectionId?: string | null,
  note?: string | null,
): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO verse_highlights (verse_ref, color, collection_id, note) VALUES (?, ?, ?, ?)
     ON CONFLICT(verse_ref) DO UPDATE SET color = ?, collection_id = ?, note = ?, created_at = datetime('now')`,
    [verseRef, color, collectionId ?? null, note ?? null, color, collectionId ?? null, note ?? null]
  );
}

export async function removeHighlight(verseRef: string): Promise<void> {
  await getUserDb().runAsync("DELETE FROM verse_highlights WHERE verse_ref = ?", [verseRef]);
}

// ── Highlight Collections (write) ────────────────────────────────

export async function createHighlightCollection(
  id: string, name: string, color: string
): Promise<void> {
  await getUserDb().runAsync(
    "INSERT INTO highlight_collections (id, name, color) VALUES (?, ?, ?)",
    [id, name, color]
  );
}

export async function deleteHighlightCollection(id: string): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE verse_highlights SET collection_id = NULL WHERE collection_id = ?",
    [id]
  );
  await getUserDb().runAsync("DELETE FROM highlight_collections WHERE id = ?", [id]);
}

// ── Reading Plans (write) ────────────────────────────────────────

import type { ReadingPlan } from './userQueries';

export async function startPlan(planId: string): Promise<void> {
  const plan = await getUserDb().getFirstAsync<ReadingPlan>(
    "SELECT * FROM reading_plans WHERE id = ?", [planId]
  );
  if (!plan) return;

  await getUserDb().withTransactionAsync(async () => {
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
  });
}

export async function completePlanDay(planId: string, dayNum: number): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE plan_progress SET completed_at = datetime('now') WHERE plan_id = ? AND day_num = ?",
    [planId, dayNum]
  );
}

export async function abandonPlan(planId: string): Promise<void> {
  await getUserDb().withTransactionAsync(async () => {
    await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', '')"
    );
  });
}

// ── Study Collections (write) ────────────────────────────────────

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

// ── Tags (write) ─────────────────────────────────────────────────

export async function updateNoteTags(noteId: number, tags: string[]): Promise<void> {
  const tagsJson = JSON.stringify(tags);
  await getUserDb().runAsync(
    "UPDATE user_notes SET tags_json = ?, updated_at = datetime('now') WHERE id = ?",
    [tagsJson, noteId]
  );
}

export async function setNoteCollection(noteId: number, collectionId: number | null): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE user_notes SET collection_id = ?, updated_at = datetime('now') WHERE id = ?",
    [collectionId, noteId]
  );
}

// ── Note Links (write) ──────────────────────────────────────────

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

// ── Auth Profile (write) ────────────────────────────────────────

export async function upsertAuthProfile(
  uid: string,
  email: string,
  displayName: string,
  avatarUrl: string,
  provider: string,
): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO auth_profiles (supabase_uid, email, display_name, avatar_url, provider, last_sign_in)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(supabase_uid) DO UPDATE SET
       email = excluded.email,
       display_name = excluded.display_name,
       avatar_url = excluded.avatar_url,
       provider = excluded.provider,
       last_sign_in = datetime('now')`,
    [uid, email, displayName, avatarUrl, provider],
  );
}

export async function clearAuthProfile(): Promise<void> {
  await getUserDb().runAsync('DELETE FROM auth_profiles');
}

// ── Study Sessions (write) ─────────────────────────────────────

export async function startStudySession(chapterId: string): Promise<number> {
  const result = await getUserDb().runAsync(
    "INSERT INTO study_sessions (chapter_id) VALUES (?)",
    [chapterId]
  );
  return result.lastInsertRowId;
}

export async function endStudySession(sessionId: number, durationMs: number): Promise<void> {
  await getUserDb().runAsync(
    "UPDATE study_sessions SET ended_at = datetime('now'), duration_ms = ? WHERE id = ?",
    [durationMs, sessionId]
  );
}

export async function recordSessionEvent(
  sessionId: number,
  event: {
    event_type: string;
    panel_type?: string;
    scholar_id?: string;
    section_id?: string;
    timestamp_ms: number;
    metadata_json?: string;
  }
): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO study_session_events (session_id, event_type, panel_type, scholar_id, section_id, timestamp_ms, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      event.event_type,
      event.panel_type ?? null,
      event.scholar_id ?? null,
      event.section_id ?? null,
      event.timestamp_ms,
      event.metadata_json ?? null,
    ]
  );
}

// ── Flagged Content (write) ──────────────────────────────────────

/**
 * Flag a piece of content for moderation review.
 * Uses INSERT OR REPLACE so re-flagging the same content updates the reason.
 */
export async function flagContent(
  contentId: string,
  contentType: string,
  reason: string,
  details?: string,
): Promise<void> {
  try {
    await getUserDb().runAsync(
      `INSERT OR REPLACE INTO flagged_content (content_id, content_type, reason, details, flagged_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [contentId, contentType, reason, details ?? null],
    );
  } catch (err) {
    logger.warn('flagContent', 'Failed to store flag locally', err);
  }
}

// ── Bookmarked Topics (write) ──────────────────────────────────────

export async function bookmarkTopic(
  topicId: string,
  type: string = 'official',
  title?: string,
  summary?: string,
): Promise<number> {
  const result = await getUserDb().runAsync(
    `INSERT INTO bookmarked_topics (topic_id, topic_type, cached_title, cached_summary)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(topic_id, topic_type) DO UPDATE SET
       cached_title = COALESCE(excluded.cached_title, cached_title),
       cached_summary = COALESCE(excluded.cached_summary, cached_summary)`,
    [topicId, type, title ?? null, summary ?? null],
  );
  return result.lastInsertRowId;
}

export async function unbookmarkTopic(topicId: string): Promise<void> {
  await getUserDb().runAsync(
    'DELETE FROM bookmarked_topics WHERE topic_id = ?',
    [topicId],
  );
}

/**
 * DEV TOOL: Reset app to new-user state for testing onboarding,
 * getting-started flows, and first-launch UX. Clears reading history,
 * onboarding flag, study sessions, and streaks. Does NOT clear notes,
 * bookmarks, highlights, or collections (personal data the user created).
 */
export async function resetToNewUser(): Promise<void> {
  const db = getUserDb();
  await db.runAsync('DELETE FROM reading_progress');
  await db.runAsync('DELETE FROM study_session_events');
  await db.runAsync('DELETE FROM study_sessions');
  await db.runAsync("DELETE FROM user_preferences WHERE key IN ('onboarding_complete', 'focusMode', 'getting_started', 'startHereDismissed', 'lastStreakDate', 'currentStreak', 'longestStreak', 'studyMaturityOverride', 'panelOpenSet', 'lastSeenLevel')");
  await db.runAsync('DELETE FROM plan_progress');
  await db.runAsync("UPDATE reading_plans SET started_at = NULL, completed_at = NULL, abandoned_at = NULL WHERE started_at IS NOT NULL");
}
