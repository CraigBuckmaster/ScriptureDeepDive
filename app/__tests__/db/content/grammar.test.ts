/**
 * Tests for db/content/grammar.ts
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
import { getMockDb, resetMockDb } from '../../helpers/mockDb';

import {
  getGrammarArticle,
  getGrammarArticles,
  searchGrammarArticles,
} from '@/db/content/grammar';

describe('db/content/grammar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('getGrammarArticle', () => {
    it('returns article by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'ga-1', title: 'Verbs' });
      expect((await getGrammarArticle('ga-1'))?.title).toBe('Verbs');
    });

    it('returns null when not found', async () => {
      expect(await getGrammarArticle('missing')).toBeNull();
    });
  });

  describe('getGrammarArticles', () => {
    it('returns all articles when no filters', async () => {
      await getGrammarArticles();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('grammar_articles'),
      );
    });

    it('filters by language only', async () => {
      await getGrammarArticles('hebrew');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('language'),
        ['hebrew'],
      );
    });

    it('filters by category only', async () => {
      await getGrammarArticles(undefined, 'verbs');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        ['verbs'],
      );
    });

    it('filters by both language and category', async () => {
      await getGrammarArticles('greek', 'nouns');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('language'),
        ['greek', 'nouns'],
      );
    });
  });

  describe('searchGrammarArticles', () => {
    it('searches across title, summary, and body', async () => {
      await searchGrammarArticles('verb');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        ['%verb%', '%verb%', '%verb%'],
      );
    });
  });
});
