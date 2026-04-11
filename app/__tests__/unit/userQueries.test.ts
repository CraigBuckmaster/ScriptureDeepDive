/**
 * Tests for db/userQueries.ts — covers read-only user data queries.
 */

jest.mock('@/db/userDatabase', () => require('../helpers/mockUserDb').mockUserDatabaseModule());
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

jest.mock('@/utils/verseRef', () => ({
  chapterPrefix: (bookId: string, ch: number) => `${bookId} ${ch}:`,
  formatVerseRef: (bookId: string, ch: number) => `${bookId} ${ch}`,
}));

jest.mock('@/utils/escapeLike', () => ({
  escapeLike: (s: string) => s.replace(/%/g, '\\%').replace(/_/g, '\\_'),
}));

import { getMockUserDb, resetMockUserDb } from '../helpers/mockUserDb';
import { getMockDb } from '../helpers/mockDb';

import {
  getNotesForChapter,
  getNoteCount,
  getAllNotes,
  searchNotes,
  getRecentChapters,
  getProgressForBook,
  getBookmarks,
  isBookmarked,
  getPreference,
  getHighlightsForChapter,
  getAllHighlights,
  getHighlightCollections,
  getPlans,
  getPlanProgress,
  getActivePlanId,
  getReadingStats,
  getTestamentProgress,
  getCollections,
  getCollection,
  getNotesInCollection,
  getCollectionNoteCounts,
  getAllTags,
  getNotesByTag,
  getStudySessions,
  getStudySession,
  getSessionEvents,
  getStudySessionsForChapter,
  getLinkedNotes,
  getReferencingNotes,
  searchNotesFTS,
  getAuthProfile,
  isFlagged,
  getBookmarkedTopics,
  isTopicBookmarked,
} from '@/db/userQueries';

describe('userQueries', () => {
  const userDb = getMockUserDb();
  const contentDb = getMockDb();

  beforeEach(() => {
    resetMockUserDb();
    jest.clearAllMocks();
    userDb.getAllAsync.mockResolvedValue([]);
    userDb.getFirstAsync.mockResolvedValue(null);
  });

  describe('notes queries', () => {
    it('getNotesForChapter queries with LIKE and exact match', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1, verse_ref: 'genesis 1:1', note_text: 'test' }]);
      const result = await getNotesForChapter('genesis', 1);
      expect(result).toHaveLength(1);
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.arrayContaining(['genesis 1:%', 'genesis 1']),
      );
    });

    it('getNoteCount returns count', async () => {
      userDb.getFirstAsync.mockResolvedValue({ count: 5 });
      const result = await getNoteCount('genesis', 1);
      expect(result).toBe(5);
    });

    it('getNoteCount returns 0 when no rows', async () => {
      userDb.getFirstAsync.mockResolvedValue(null);
      const result = await getNoteCount('genesis', 1);
      expect(result).toBe(0);
    });

    it('getAllNotes returns all notes', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await getAllNotes();
      expect(result).toHaveLength(2);
    });

    it('searchNotes searches by text and ref', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await searchNotes('test');
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.any(Array),
      );
    });
  });

  describe('reading progress', () => {
    it('getRecentChapters returns enriched results', async () => {
      const rows = [{ book_id: 'genesis', chapter_num: 1, completed_at: '2025-01-01' }];
      userDb.getAllAsync.mockResolvedValueOnce(rows);
      contentDb.getAllAsync.mockResolvedValueOnce([
        { book_id: 'genesis', chapter_num: 1, title: 'Creation', book_name: 'Genesis' },
      ]);

      const result = await getRecentChapters(10);
      expect(result).toHaveLength(1);
      expect(result[0].book_name).toBe('Genesis');
      expect(result[0].title).toBe('Creation');
    });

    it('getRecentChapters returns empty for no rows', async () => {
      userDb.getAllAsync.mockResolvedValueOnce([]);
      const result = await getRecentChapters();
      expect(result).toEqual([]);
    });

    it('getRecentChapters handles missing content info', async () => {
      const rows = [{ book_id: 'genesis', chapter_num: 1, completed_at: '2025-01-01' }];
      userDb.getAllAsync.mockResolvedValueOnce(rows);
      contentDb.getAllAsync.mockResolvedValueOnce([]); // no matching content info

      const result = await getRecentChapters(10);
      expect(result).toHaveLength(1);
      expect(result[0].book_name).toBe('genesis');
      expect(result[0].title).toBeNull();
    });

    it('getProgressForBook queries correct book', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await getProgressForBook('genesis');
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('book_id'),
        ['genesis'],
      );
    });
  });

  describe('bookmarks', () => {
    it('getBookmarks returns all bookmarks', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1 }]);
      const result = await getBookmarks();
      expect(result).toHaveLength(1);
    });

    it('isBookmarked returns true when count > 0', async () => {
      userDb.getFirstAsync.mockResolvedValue({ count: 1 });
      const result = await isBookmarked('gen 1:1');
      expect(result).toBe(true);
    });

    it('isBookmarked returns false when count is 0', async () => {
      userDb.getFirstAsync.mockResolvedValue({ count: 0 });
      const result = await isBookmarked('gen 1:1');
      expect(result).toBe(false);
    });

    it('isBookmarked returns false when null', async () => {
      userDb.getFirstAsync.mockResolvedValue(null);
      const result = await isBookmarked('gen 1:1');
      expect(result).toBe(false);
    });
  });

  describe('preferences', () => {
    it('getPreference returns value', async () => {
      userDb.getFirstAsync.mockResolvedValue({ value: 'dark' });
      const result = await getPreference('theme');
      expect(result).toBe('dark');
    });

    it('getPreference returns null when not found', async () => {
      userDb.getFirstAsync.mockResolvedValue(null);
      const result = await getPreference('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('highlights', () => {
    it('getHighlightsForChapter queries with chapter prefix', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await getHighlightsForChapter('genesis', 1);
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        ['genesis 1:%'],
      );
    });

    it('getAllHighlights returns all', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1 }]);
      const result = await getAllHighlights();
      expect(result).toHaveLength(1);
    });

    it('getHighlightCollections returns sorted collections', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 'col1' }]);
      const result = await getHighlightCollections();
      expect(result).toHaveLength(1);
    });
  });

  describe('reading plans', () => {
    it('getPlans returns all plans', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 'plan1' }]);
      const result = await getPlans();
      expect(result).toHaveLength(1);
    });

    it('getPlanProgress returns progress for plan', async () => {
      userDb.getAllAsync.mockResolvedValue([{ plan_id: 'p1', day_num: 1 }]);
      const result = await getPlanProgress('p1');
      expect(result).toHaveLength(1);
    });

    it('getActivePlanId returns plan ID from preference', async () => {
      userDb.getFirstAsync.mockResolvedValue({ value: 'my_plan' });
      const result = await getActivePlanId();
      expect(result).toBe('my_plan');
    });

    it('getActivePlanId returns null for empty value', async () => {
      userDb.getFirstAsync.mockResolvedValue({ value: '' });
      const result = await getActivePlanId();
      expect(result).toBeNull();
    });

    it('getActivePlanId returns null when not set', async () => {
      userDb.getFirstAsync.mockResolvedValue(null);
      const result = await getActivePlanId();
      expect(result).toBeNull();
    });
  });

  describe('reading stats', () => {
    it('getReadingStats computes stats correctly', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      userDb.getFirstAsync
        .mockResolvedValueOnce({ count: 50 })  // total
        .mockResolvedValueOnce({ book_id: 'genesis' }); // favourite
      userDb.getAllAsync.mockResolvedValueOnce([
        { day: today },
        { day: yesterday },
      ]);

      const result = await getReadingStats();
      expect(result.totalChapters).toBe(50);
      expect(result.favouriteBook).toBe('genesis');
      expect(result.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it('getReadingStats handles empty database', async () => {
      userDb.getFirstAsync
        .mockResolvedValueOnce(null)  // total
        .mockResolvedValueOnce(null); // favourite
      userDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await getReadingStats();
      expect(result.totalChapters).toBe(0);
      expect(result.favouriteBook).toBeNull();
      expect(result.currentStreak).toBe(0);
    });

    it('getReadingStats handles streak break', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

      userDb.getFirstAsync
        .mockResolvedValueOnce({ count: 10 })
        .mockResolvedValueOnce({ book_id: 'psalms' });
      userDb.getAllAsync.mockResolvedValueOnce([
        { day: threeDaysAgo },
      ]);

      const result = await getReadingStats();
      expect(result.currentStreak).toBe(0);
    });
  });

  describe('testament progress', () => {
    it('getTestamentProgress separates OT and NT', async () => {
      userDb.getAllAsync.mockResolvedValueOnce([
        { book_id: 'genesis', cnt: 50 },
        { book_id: 'matthew', cnt: 28 },
        { book_id: 'romans', cnt: 16 },
      ]);

      const result = await getTestamentProgress();
      expect(result).toHaveLength(2);
      expect(result[0].testament).toBe('Old Testament');
      expect(result[0].chaptersRead).toBe(50);
      expect(result[1].testament).toBe('New Testament');
      expect(result[1].chaptersRead).toBe(44); // 28 + 16
    });

    it('getTestamentProgress handles empty data', async () => {
      userDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await getTestamentProgress();
      expect(result[0].chaptersRead).toBe(0);
      expect(result[1].chaptersRead).toBe(0);
    });
  });

  describe('collections', () => {
    it('getCollections returns all', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1 }]);
      const result = await getCollections();
      expect(result).toHaveLength(1);
    });

    it('getCollection returns single or null', async () => {
      userDb.getFirstAsync.mockResolvedValue({ id: 1, name: 'Test' });
      const result = await getCollection(1);
      expect(result?.name).toBe('Test');
    });

    it('getNotesInCollection returns notes for collection', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1, collection_id: 5 }]);
      const result = await getNotesInCollection(5);
      expect(result).toHaveLength(1);
    });

    it('getCollectionNoteCounts returns counts map', async () => {
      userDb.getAllAsync.mockResolvedValue([
        { collection_id: 1, count: 5 },
        { collection_id: 2, count: 3 },
      ]);
      const result = await getCollectionNoteCounts();
      expect(result[1]).toBe(5);
      expect(result[2]).toBe(3);
    });
  });

  describe('tags', () => {
    it('getAllTags extracts unique tags from notes', async () => {
      userDb.getAllAsync.mockResolvedValue([
        { tags_json: '["creation","theology"]' },
        { tags_json: '["creation","faith"]' },
      ]);
      const result = await getAllTags();
      expect(result).toContain('creation');
      expect(result).toContain('theology');
      expect(result).toContain('faith');
      expect(result).toHaveLength(3);
    });

    it('getAllTags handles malformed JSON gracefully', async () => {
      userDb.getAllAsync.mockResolvedValue([
        { tags_json: '["valid"]' },
        { tags_json: 'not json' },
      ]);
      const result = await getAllTags();
      expect(result).toEqual(['valid']);
    });

    it('getNotesByTag searches with LIKE', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await getNotesByTag('creation');
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.any(Array),
      );
    });
  });

  describe('study sessions', () => {
    it('getStudySessions with limit', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await getStudySessions(5);
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        [5],
      );
    });

    it('getStudySessions without limit', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await getStudySessions();
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.not.stringContaining('LIMIT'),
        [],
      );
    });

    it('getStudySession returns one', async () => {
      userDb.getFirstAsync.mockResolvedValue({ id: 1 });
      const result = await getStudySession(1);
      expect(result?.id).toBe(1);
    });

    it('getSessionEvents returns events', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1, session_id: 1 }]);
      const result = await getSessionEvents(1);
      expect(result).toHaveLength(1);
    });

    it('getStudySessionsForChapter returns sessions', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await getStudySessionsForChapter('gen_1');
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('chapter_id'),
        ['gen_1'],
      );
    });
  });

  describe('note links', () => {
    it('getLinkedNotes returns linked notes', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 2 }]);
      const result = await getLinkedNotes(1);
      expect(result).toHaveLength(1);
    });

    it('getReferencingNotes returns backlinks', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 3 }]);
      const result = await getReferencingNotes(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('FTS search', () => {
    it('searchNotesFTS sanitizes query and runs MATCH', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await searchNotesFTS('test query');
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        expect.any(Array),
      );
    });

    it('searchNotesFTS returns empty for empty sanitized query', async () => {
      const result = await searchNotesFTS('');
      expect(result).toEqual([]);
    });

    it('searchNotesFTS strips special characters', async () => {
      userDb.getAllAsync.mockResolvedValue([]);
      await searchNotesFTS('test"*(){}[]');
      expect(userDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['"test"'],
      );
    });

    it('searchNotesFTS ignores single-char words', async () => {
      const result = await searchNotesFTS('a b');
      expect(result).toEqual([]);
    });
  });

  describe('auth profile', () => {
    it('getAuthProfile returns profile or null', async () => {
      userDb.getFirstAsync.mockResolvedValue({ supabase_uid: 'uid', email: 'test@test.com' });
      const result = await getAuthProfile();
      expect(result?.email).toBe('test@test.com');
    });
  });

  describe('flagged content', () => {
    it('isFlagged returns true when row exists', async () => {
      userDb.getFirstAsync.mockResolvedValue({ id: 1 });
      const result = await isFlagged('content_123');
      expect(result).toBe(true);
    });

    it('isFlagged returns false when no row', async () => {
      userDb.getFirstAsync.mockResolvedValue(null);
      const result = await isFlagged('content_123');
      expect(result).toBe(false);
    });
  });

  describe('bookmarked topics', () => {
    it('getBookmarkedTopics returns all', async () => {
      userDb.getAllAsync.mockResolvedValue([{ id: 1, topic_id: 't1' }]);
      const result = await getBookmarkedTopics();
      expect(result).toHaveLength(1);
    });

    it('isTopicBookmarked returns true when count > 0', async () => {
      userDb.getFirstAsync.mockResolvedValue({ count: 1 });
      const result = await isTopicBookmarked('topic_1');
      expect(result).toBe(true);
    });

    it('isTopicBookmarked returns false when count is 0', async () => {
      userDb.getFirstAsync.mockResolvedValue({ count: 0 });
      const result = await isTopicBookmarked('topic_1');
      expect(result).toBe(false);
    });
  });
});
