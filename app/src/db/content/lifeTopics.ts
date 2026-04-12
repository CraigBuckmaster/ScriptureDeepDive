/**
 * db/content/lifeTopics.ts — Life Topics query functions.
 *
 * Queries for curated topical guides with scholar quotes and verse references.
 */
import { getDb } from '../database';
import type { LifeTopicCategory, LifeTopic } from '../../types';

export async function getLifeTopicCategories(): Promise<LifeTopicCategory[]> {
  return getDb().getAllAsync<LifeTopicCategory>(
    'SELECT * FROM life_topic_categories ORDER BY display_order'
  );
}

export async function getLifeTopics(categoryId?: string): Promise<LifeTopic[]> {
  if (categoryId) {
    return getDb().getAllAsync<LifeTopic>(
      'SELECT * FROM life_topics_official WHERE category_id = ? ORDER BY display_order',
      [categoryId]
    );
  }
  return getDb().getAllAsync<LifeTopic>(
    'SELECT * FROM life_topics_official ORDER BY display_order'
  );
}

export async function getLifeTopic(id: string): Promise<LifeTopic | null> {
  return getDb().getFirstAsync<LifeTopic>(
    'SELECT * FROM life_topics_official WHERE id = ?',
    [id]
  );
}

/**
 * Sanitize user input for FTS5 MATCH queries.
 * Strips special characters, wraps each term in quotes, drops single-char terms.
 */
function sanitizeFtsQuery(query: string): string {
  return query
    .replace(/["*(){}[\]^~:]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => `"${w}"`)
    .join(' ');
}

export async function searchLifeTopics(query: string): Promise<LifeTopic[]> {
  const ftsQuery = sanitizeFtsQuery(query);
  if (!ftsQuery) return [];
  return getDb().getAllAsync<LifeTopic>(
    `SELECT lt.* FROM life_topics_fts
     JOIN life_topics_official lt ON lt.rowid = life_topics_fts.rowid
     WHERE life_topics_fts MATCH ?
     ORDER BY rank
     LIMIT 30`,
    [ftsQuery]
  );
}

export async function getLifeTopicVerses(topicId: string) {
  return getDb().getAllAsync(
    'SELECT * FROM life_topic_verses WHERE topic_id = ? ORDER BY verse_order',
    [topicId]
  );
}

export async function getLifeTopicScholars(topicId: string) {
  return getDb().getAllAsync(
    `SELECT lts.*, s.name as scholar_name, s.tradition
     FROM life_topic_scholars lts
     JOIN scholars s ON s.id = lts.scholar_id
     WHERE lts.topic_id = ?
     ORDER BY lts.display_order`,
    [topicId]
  );
}

export async function getRelatedLifeTopics(topicId: string): Promise<LifeTopic[]> {
  return getDb().getAllAsync<LifeTopic>(
    `SELECT lt.* FROM life_topic_related ltr
     JOIN life_topics_official lt ON lt.id = ltr.related_id
     WHERE ltr.topic_id = ?
     ORDER BY lt.display_order`,
    [topicId]
  );
}
