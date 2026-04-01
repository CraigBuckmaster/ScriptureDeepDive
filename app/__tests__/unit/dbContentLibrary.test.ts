/**
 * Database layer tests for db/content/contentLibrary.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getContentLibraryCounts,
  getContentLibrary,
  searchContentLibrary,
} from '@/db/content/contentLibrary';

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
});

describe('getContentLibraryCounts', () => {
  it('returns a record of category counts', async () => {
    getMockDb().getAllAsync.mockResolvedValue([
      { category: 'articles', cnt: 5 },
      { category: 'maps', cnt: 3 },
    ]);

    const result = await getContentLibraryCounts();
    expect(result).toEqual({ articles: 5, maps: 3 });
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('GROUP BY category'),
    );
  });

  it('returns an empty object when no rows exist', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    const result = await getContentLibraryCounts();
    expect(result).toEqual({});
  });
});

describe('getContentLibrary', () => {
  it('returns entries for a category without testament filter', async () => {
    const entries = [{ id: 'cl1', category: 'articles', title: 'Entry 1' }];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await getContentLibrary('articles');
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('category'),
      ['articles'],
    );
  });

  it('filters by testament when provided', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await getContentLibrary('articles', 'ot');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('testament'),
      ['articles', 'ot'],
    );
  });
});

describe('searchContentLibrary', () => {
  it('searches by title and preview with LIKE pattern', async () => {
    const entries = [{ id: 'cl2', category: 'articles', title: 'Creation' }];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await searchContentLibrary('creat', 'articles');
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIKE'),
      ['articles', '%creat%', '%creat%'],
    );
  });
});
