/**
 * db/content/debates.ts — Data access layer for Scholar Debate Mode.
 */

import { getDb } from '../database';
import type { DebateTopicRow, DebateTopicSummary, DebateTopic, DebatePosition, Scholar } from '../../types';
import { escapeLike } from '../../utils/escapeLike';

// ── Browse: all topics with summary info ──────────────────────

export async function getDebateTopics(): Promise<DebateTopicSummary[]> {
  return getDb().getAllAsync<DebateTopicSummary>(
    `SELECT id, title, category, book_id, chapters_json, passage,
            question, tags_json, positions_json,
            json_array_length(positions_json) as position_count
     FROM debate_topics
     ORDER BY book_id, CAST(json_extract(chapters_json, '$[0]') AS INTEGER)`
  );
}

// ── Detail: full topic with positions ─────────────────────────

export async function getDebateTopic(id: string): Promise<DebateTopic | null> {
  const row = await getDb().getFirstAsync<DebateTopicRow>(
    'SELECT * FROM debate_topics WHERE id = ?', [id]
  );
  if (!row) return null;
  return {
    ...row,
    category: row.category as DebateTopic['category'],
    passage: row.passage ?? '',
    context: row.context ?? '',
    synthesis: row.synthesis ?? '',
    chapters: safeParseArray(row.chapters_json),
    positions: safeParseArray(row.positions_json),
    related_passages: safeParseArray(row.related_passages_json),
    tags: safeParseArray(row.tags_json),
  };
}

// ── Filter: topics for a specific chapter ─────────────────────

export async function getDebateTopicsForChapter(
  bookId: string, chapterNum: number,
): Promise<DebateTopicSummary[]> {
  return getDb().getAllAsync<DebateTopicSummary>(
    `SELECT id, title, category, passage, question, positions_json,
            json_array_length(positions_json) as position_count
     FROM debate_topics
     WHERE book_id = ? AND chapters_json LIKE ? ESCAPE '\\'`,
    [bookId, `%${escapeLike(String(chapterNum))}%`]
  );
}

// ── Search across topics ──────────────────────────────────────

export async function searchDebateTopics(query: string): Promise<DebateTopicSummary[]> {
  const q = `%${escapeLike(query)}%`;
  return getDb().getAllAsync<DebateTopicSummary>(
    `SELECT id, title, category, book_id, passage, question, positions_json,
            json_array_length(positions_json) as position_count
     FROM debate_topics
     WHERE title LIKE ? ESCAPE '\\' OR question LIKE ? ESCAPE '\\' OR tags_json LIKE ? ESCAPE '\\'
     ORDER BY book_id
     LIMIT 30`,
    [q, q, q]
  );
}

// ── Scholars linked to a topic ────────────────────────────────

export async function getDebateTopicScholars(topicId: string): Promise<Scholar[]> {
  return getDb().getAllAsync<Scholar>(
    `SELECT s.* FROM scholars s
     JOIN debate_topic_scholars dts ON dts.scholar_id = s.id
     WHERE dts.topic_id = ?`,
    [topicId]
  );
}

// ── Helpers ───────────────────────────────────────────────────

function safeParseArray<T>(json: string | null): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
