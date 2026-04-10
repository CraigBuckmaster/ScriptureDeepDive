/**
 * Tests for db/content/lifeTopics.ts
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
import { getMockDb, resetMockDb } from '../../helpers/mockDb';

import {
  getLifeTopicCategories,
  getLifeTopics,
  getLifeTopic,
  searchLifeTopics,
  getLifeTopicVerses,
  getLifeTopicScholars,
  getRelatedLifeTopics,
} from '@/db/content/lifeTopics';

describe('db/content/lifeTopics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('getLifeTopicCategories', () => {
    it('queries categories ordered by display_order', async () => {
      await getLifeTopicCategories();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('life_topic_categories'),
      );
    });
  });

  describe('getLifeTopics', () => {
    it('returns all topics when no categoryId', async () => {
      await getLifeTopics();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('life_topics_official'),
      );
    });

    it('filters by categoryId when provided', async () => {
      await getLifeTopics('cat-1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('category_id'),
        ['cat-1'],
      );
    });
  });

  describe('getLifeTopic', () => {
    it('returns topic by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'lt-1', title: 'Prayer' });
      expect((await getLifeTopic('lt-1'))?.title).toBe('Prayer');
    });
  });

  describe('searchLifeTopics', () => {
    it('uses FTS MATCH', async () => {
      await searchLifeTopics('prayer');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['prayer'],
      );
    });
  });

  describe('getLifeTopicVerses', () => {
    it('queries verses ordered by verse_order', async () => {
      await getLifeTopicVerses('lt-1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('life_topic_verses'),
        ['lt-1'],
      );
    });
  });

  describe('getLifeTopicScholars', () => {
    it('joins with scholars table', async () => {
      await getLifeTopicScholars('lt-1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('scholars'),
        ['lt-1'],
      );
    });
  });

  describe('getRelatedLifeTopics', () => {
    it('joins with life_topic_related', async () => {
      await getRelatedLifeTopics('lt-1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('life_topic_related'),
        ['lt-1'],
      );
    });
  });
});
