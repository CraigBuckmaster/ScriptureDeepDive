/**
 * Tests for db/content/chapters.ts
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
import { getMockDb, resetMockDb } from '../../helpers/mockDb';

import {
  getChapter,
  getChapterById,
  getDifficultyForBook,
  getSections,
  getSectionPanels,
  getSectionPanelsByType,
  getChapterPanels,
  getChapterPanelByType,
  getVerses,
  getVerse,
  getInterlinearWords,
  getConcordanceResults,
  getConcordanceCount,
  getVHLGroups,
  getRedLetterVerses,
} from '@/db/content/chapters';

describe('db/content/chapters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('getChapter', () => {
    it('returns chapter by bookId and chapter number', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'genesis_1', book_id: 'genesis', chapter_num: 1 });
      const result = await getChapter('genesis', 1);
      expect(result?.id).toBe('genesis_1');
    });
  });

  describe('getChapterById', () => {
    it('returns chapter by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'genesis_1' });
      expect((await getChapterById('genesis_1'))?.id).toBe('genesis_1');
    });
  });

  describe('getDifficultyForBook', () => {
    it('returns a Map of chapter_num -> difficulty', async () => {
      getMockDb().getAllAsync.mockResolvedValue([
        { chapter_num: 1, difficulty: 3 },
        { chapter_num: 2, difficulty: 5 },
      ]);
      const result = await getDifficultyForBook('genesis');
      expect(result.get(1)).toBe(3);
      expect(result.get(2)).toBe(5);
    });
  });

  describe('getSections', () => {
    it('queries sections for chapter', async () => {
      await getSections('genesis_1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('sections'),
        ['genesis_1'],
      );
    });
  });

  describe('getSectionPanels', () => {
    it('queries section_panels for section', async () => {
      await getSectionPanels('sec-1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('section_panels'),
        ['sec-1'],
      );
    });
  });

  describe('getSectionPanelsByType', () => {
    it('queries by section and panel type', async () => {
      await getSectionPanelsByType('sec-1', 'heb');
      expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('panel_type'),
        ['sec-1', 'heb'],
      );
    });
  });

  describe('getChapterPanels', () => {
    it('queries chapter_panels', async () => {
      await getChapterPanels('genesis_1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('chapter_panels'),
        ['genesis_1'],
      );
    });
  });

  describe('getChapterPanelByType', () => {
    it('queries by chapter and type', async () => {
      await getChapterPanelByType('genesis_1', 'themes');
      expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('panel_type'),
        ['genesis_1', 'themes'],
      );
    });
  });

  describe('getVerses', () => {
    it('queries verses with default translation', async () => {
      const { getVerseDb } = require('@/db/database');
      const mockDb = { getAllAsync: jest.fn().mockResolvedValue([]) };
      getVerseDb.mockResolvedValue(mockDb);

      await getVerses('genesis', 1);
      expect(getVerseDb).toHaveBeenCalledWith('kjv');
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('verses'),
        ['genesis', 1, 'kjv'],
      );
    });

    it('queries with specified translation', async () => {
      const { getVerseDb } = require('@/db/database');
      const mockDb = { getAllAsync: jest.fn().mockResolvedValue([]) };
      getVerseDb.mockResolvedValue(mockDb);

      await getVerses('genesis', 1, 'asv');
      expect(getVerseDb).toHaveBeenCalledWith('asv');
    });
  });

  describe('getVerse', () => {
    it('returns single verse', async () => {
      const { getVerseDb } = require('@/db/database');
      const mockDb = { getFirstAsync: jest.fn().mockResolvedValue({ id: 'v1' }) };
      getVerseDb.mockResolvedValue(mockDb);

      const result = await getVerse('genesis', 1, 1);
      expect(result?.id).toBe('v1');
    });
  });

  describe('getConcordanceCount', () => {
    it('returns count for strongs number', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ cnt: 42 });
      const count = await getConcordanceCount('G5485');
      expect(count).toBe(42);
    });

    it('returns 0 when no matches', async () => {
      getMockDb().getFirstAsync.mockResolvedValue(null);
      expect(await getConcordanceCount('XXXX')).toBe(0);
    });
  });

  describe('getRedLetterVerses', () => {
    it('returns verse numbers', async () => {
      getMockDb().getAllAsync.mockResolvedValue([
        { verse_num: 3 },
        { verse_num: 5 },
      ]);
      const result = await getRedLetterVerses('matthew', 5);
      expect(result).toEqual([3, 5]);
    });

    it('returns empty array when no red letters', async () => {
      expect(await getRedLetterVerses('genesis', 1)).toEqual([]);
    });
  });
});
