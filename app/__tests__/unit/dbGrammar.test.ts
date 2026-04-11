/**
 * Database layer tests for db/content/grammar.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getGrammarArticle,
  getGrammarArticles,
  searchGrammarArticles,
} from '@/db/content/grammar';

beforeEach(() => resetMockDb());

describe('getGrammarArticle', () => {
  it('returns an article by id', async () => {
    const article = { id: 'qal', title: 'Qal Stem', language: 'hebrew' };
    getMockDb().getFirstAsync.mockResolvedValue(article);
    const result = await getGrammarArticle('qal');
    expect(result).toEqual(article);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('grammar_articles WHERE id = ?'),
      ['qal'],
    );
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    expect(await getGrammarArticle('nope')).toBeNull();
  });
});

describe('getGrammarArticles', () => {
  it('returns all articles when no filters', async () => {
    const articles = [{ id: 'qal' }, { id: 'niphal' }];
    getMockDb().getAllAsync.mockResolvedValue(articles);
    const result = await getGrammarArticles();
    expect(result).toEqual(articles);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY display_order'),
    );
  });

  it('filters by language', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getGrammarArticles('hebrew');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('language = ?'),
      ['hebrew'],
    );
  });

  it('filters by language and category', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getGrammarArticles('hebrew', 'verb');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('language = ? AND category = ?'),
      ['hebrew', 'verb'],
    );
  });
});

describe('searchGrammarArticles', () => {
  it('searches title, summary, body with LIKE', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await searchGrammarArticles('qal');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIKE'),
      ['%qal%', '%qal%', '%qal%'],
    );
  });
});
