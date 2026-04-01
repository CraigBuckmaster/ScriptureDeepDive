/**
 * Database layer tests for db/content/search.ts
 *
 * Note: searchWordStudies does not exist in the codebase.
 * We test searchVerses and searchPeople, including the internal
 * sanitizeFtsQuery behavior (short/empty queries return []).
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { searchVerses, searchPeople } from '@/db/content/search';

beforeEach(() => resetMockDb());

describe('searchVerses', () => {
  it('returns matching verses from FTS query', async () => {
    const verses = [
      { id: 'v1', book_id: 'gen', chapter_num: 1, verse_num: 1, text: 'In the beginning God created...', book_name: 'Genesis' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(verses);

    const result = await searchVerses('beginning God');
    expect(result).toEqual(verses);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('MATCH'),
      expect.arrayContaining([expect.stringContaining('"beginning"')]),
    );
  });

  it('returns empty array for single-character query (sanitized away)', async () => {
    const result = await searchVerses('a');
    expect(result).toEqual([]);
    // getAllAsync should not have been called since query was empty after sanitization
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });

  it('filters by bookId when provided', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await searchVerses('faith', 50, null, 'rom');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('book_id'),
      expect.arrayContaining(['"faith"', 'rom', 50]),
    );
  });

  it('filters by testament when provided', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await searchVerses('love', 50, 'nt');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('testament'),
      expect.arrayContaining(['"love"', 'nt', 50]),
    );
  });
});

describe('searchPeople', () => {
  it('returns matching people from FTS query', async () => {
    const people = [{ id: 'p1', name: 'Abraham' }];
    getMockDb().getAllAsync.mockResolvedValue(people);

    const result = await searchPeople('Abraham');
    expect(result).toEqual(people);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('people_fts'),
      ['"Abraham"'],
    );
  });

  it('returns empty array for empty query', async () => {
    const result = await searchPeople('');
    expect(result).toEqual([]);
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });
});
