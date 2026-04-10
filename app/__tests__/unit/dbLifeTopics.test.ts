/**
 * Database layer tests for db/content/lifeTopics.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getLifeTopicCategories,
  getLifeTopics,
  getLifeTopic,
  searchLifeTopics,
  getLifeTopicVerses,
} from '@/db/content/lifeTopics';

beforeEach(() => resetMockDb());

describe('getLifeTopicCategories', () => {
  it('returns categories ordered by display_order', async () => {
    const cats = [{ id: 'cat1', name: 'Relationships', display_order: 1 }];
    getMockDb().getAllAsync.mockResolvedValue(cats);
    const result = await getLifeTopicCategories();
    expect(result).toEqual(cats);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('life_topic_categories ORDER BY display_order'),
    );
  });
});

describe('getLifeTopics', () => {
  it('returns all topics when no categoryId', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getLifeTopics();
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('life_topics_official ORDER BY display_order'),
    );
  });

  it('filters by category_id', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getLifeTopics('cat1');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('category_id = ?'),
      ['cat1'],
    );
  });
});

describe('getLifeTopic', () => {
  it('returns a topic by id', async () => {
    const topic = { id: 'forgiveness', title: 'Forgiveness' };
    getMockDb().getFirstAsync.mockResolvedValue(topic);
    const result = await getLifeTopic('forgiveness');
    expect(result).toEqual(topic);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('life_topics_official WHERE id = ?'),
      ['forgiveness'],
    );
  });
});

describe('searchLifeTopics', () => {
  it('searches via FTS MATCH', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await searchLifeTopics('forgive');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('life_topics_fts'),
      ['forgive'],
    );
  });
});

describe('getLifeTopicVerses', () => {
  it('returns verses for a topic', async () => {
    const verses = [{ topic_id: 't1', verse_ref: 'gen 1:1', verse_order: 1 }];
    getMockDb().getAllAsync.mockResolvedValue(verses);
    const result = await getLifeTopicVerses('t1');
    expect(result).toEqual(verses);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('life_topic_verses'),
      ['t1'],
    );
  });
});
