/**
 * Tests for db/content/search.ts — FTS search across verses and people.
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
jest.mock('@/db/translationRegistry', () => ({
  isBundled: jest.fn((id: string) => id === 'kjv' || id === 'asv'),
}));

import { getMockDb, resetMockDb } from '../../helpers/mockDb';
import { searchVerses, searchPeople } from '@/db/content/search';

describe('db/content/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('searchVerses', () => {
    it('returns empty array for empty query', async () => {
      const result = await searchVerses('');
      expect(result).toEqual([]);
    });

    it('returns empty for single-character words only', async () => {
      const result = await searchVerses('a b c');
      expect(result).toEqual([]);
    });

    it('sanitizes and queries FTS', async () => {
      await searchVerses('in the beginning', 10);
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        expect.arrayContaining(['"in" "the" "beginning"']),
      );
    });

    it('applies testament filter when provided', async () => {
      await searchVerses('love', 20, 'nt');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('testament'),
        expect.arrayContaining(['"love"', 'nt']),
      );
    });

    it('applies bookId filter when provided', async () => {
      await searchVerses('love', 20, null, 'genesis');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('book_id'),
        expect.arrayContaining(['"love"', 'genesis']),
      );
    });

    it('uses supplemental DB for non-bundled translations', async () => {
      const { getVerseDb } = require('@/db/database');
      const mockSupDb = { getAllAsync: jest.fn().mockResolvedValue([]) };
      getVerseDb.mockResolvedValue(mockSupDb);

      await searchVerses('love', 20, null, null, 'esv');
      expect(getVerseDb).toHaveBeenCalledWith('esv');
      expect(mockSupDb.getAllAsync).toHaveBeenCalled();
    });

    it('applies bookId filter for supplemental translations', async () => {
      const { getVerseDb } = require('@/db/database');
      const mockSupDb = { getAllAsync: jest.fn().mockResolvedValue([]) };
      getVerseDb.mockResolvedValue(mockSupDb);

      await searchVerses('love', 20, null, 'genesis', 'esv');
      expect(mockSupDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('book_id'),
        expect.arrayContaining(['genesis']),
      );
    });

    it('strips special characters from query', async () => {
      await searchVerses('"grace*" (test)', 10);
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        expect.arrayContaining(['"grace" "test"']),
      );
    });
  });

  describe('searchPeople', () => {
    it('returns empty array for empty query', async () => {
      const result = await searchPeople('');
      expect(result).toEqual([]);
    });

    it('returns empty for short words only', async () => {
      const result = await searchPeople('a b');
      expect(result).toEqual([]);
    });

    it('queries people FTS', async () => {
      getMockDb().getAllAsync.mockResolvedValue([{ id: 'p1', name: 'Abraham' }]);
      const result = await searchPeople('Abraham');
      expect(result).toHaveLength(1);
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('people_fts'),
        ['"Abraham"'],
      );
    });
  });
});
