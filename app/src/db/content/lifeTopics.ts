/**
 * db/content/lifeTopics.ts — Life Topics query functions.
 *
 * Queries for curated topical guides with scholar quotes and verse references.
 */
import { getDb } from '../database';
import { logger } from '../../utils/logger';
import type { LifeTopicCategory, LifeTopic } from '../../types';

export async function getLifeTopicCategories(): Promise<LifeTopicCategory[]> {
  const rows = await getDb().getAllAsync<LifeTopicCategory>(
    'SELECT * FROM life_topic_categories ORDER BY display_order'
  );
  logger.info('lifeTopics', `getLifeTopicCategories: ${rows.length} rows`);
  return rows;
}

export async function getLifeTopics(categoryId?: string): Promise<LifeTopic[]> {
  if (categoryId) {
    const rows = await getDb().getAllAsync<LifeTopic>(
      'SELECT * FROM life_topics_official WHERE category_id = ? ORDER BY display_order',
      [categoryId]
    );
    logger.info('lifeTopics', `getLifeTopics(${categoryId}): ${rows.length} rows`);
    return rows;
  }
  const rows = await getDb().getAllAsync<LifeTopic>(
    'SELECT * FROM life_topics_official ORDER BY display_order'
  );
  logger.info('lifeTopics', `getLifeTopics(all): ${rows.length} rows`);
  return rows;
}

export async function getLifeTopic(id: string): Promise<LifeTopic | null> {
  return getDb().getFirstAsync<LifeTopic>(
    'SELECT * FROM life_topics_official WHERE id = ?',
    [id]
  );
}

export async function searchLifeTopics(query: string): Promise<LifeTopic[]> {
  return getDb().getAllAsync<LifeTopic>(
    `SELECT lt.* FROM life_topics_fts fts
     JOIN life_topics_official lt ON lt.id = fts.rowid
     WHERE fts MATCH ?
     ORDER BY rank
     LIMIT 30`,
    [query]
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
