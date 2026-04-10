/**
 * Tests for db/userQueries.ts — all read-only user data queries.
 */

const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockGetFirstAsync = jest.fn().mockResolvedValue(null);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
    runAsync: mockRunAsync,
  }),
}));

jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

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
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllAsync.mockResolvedValue([]);
    mockGetFirstAsync.mockResolvedValue(null);
  });

  // ── Notes ─────────────────────────────────────────────────
  describe('getNotesForChapter', () => {
    it('queries with chapter prefix and chapter ref', async () => {
      await getNotesForChapter('genesis', 1);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('user_notes'),
        expect.arrayContaining(['genesis 1:%', 'genesis 1']),
      );
    });

    it('returns notes from db', async () => {
      const notes = [{ id: 1, verse_ref: 'genesis 1:1', note_text: 'Test' }];
      mockGetAllAsync.mockResolvedValue(notes);
      const result = await getNotesForChapter('genesis', 1);
      expect(result).toEqual(notes);
    });
  });

  describe('getNoteCount', () => {
    it('returns count from db', async () => {
      mockGetFirstAsync.mockResolvedValue({ count: 5 });
      const count = await getNoteCount('genesis', 1);
      expect(count).toBe(5);
    });

    it('returns 0 when no row', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      const count = await getNoteCount('genesis', 1);
      expect(count).toBe(0);
    });
  });

  describe('getAllNotes', () => {
    it('returns all notes', async () => {
      const notes = [{ id: 1 }, { id: 2 }];
      mockGetAllAsync.mockResolvedValue(notes);
      const result = await getAllNotes();
      expect(result).toHaveLength(2);
    });
  });

  describe('searchNotes', () => {
    it('escapes LIKE wildcards in query', async () => {
      await searchNotes('test%query');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.any(Array),
      );
    });
  });

  // ── Reading Progress ──────────────────────────────────────
  describe('getRecentChapters', () => {
    it('returns empty array when no rows', async () => {
      mockGetAllAsync.mockResolvedValue([]);
      const result = await getRecentChapters();
      expect(result).toEqual([]);
    });

    it('enriches reading progress with book names from content db', async () => {
      const progress = [
        { book_id: 'genesis', chapter_num: 1, completed_at: '2025-01-01' },
      ];
      mockGetAllAsync.mockResolvedValueOnce(progress);
      getMockDb().getAllAsync.mockResolvedValueOnce([
        { book_id: 'genesis', chapter_num: 1, title: 'Creation', book_name: 'Genesis' },
      ]);

      const result = await getRecentChapters(10);
      expect(result).toHaveLength(1);
      expect(result[0].book_name).toBe('Genesis');
      expect(result[0].title).toBe('Creation');
    });

    it('falls back to book_id when content db has no match', async () => {
      const progress = [
        { book_id: 'genesis', chapter_num: 1, completed_at: '2025-01-01' },
      ];
      mockGetAllAsync.mockResolvedValueOnce(progress);
      getMockDb().getAllAsync.mockResolvedValueOnce([]);

      const result = await getRecentChapters(10);
      expect(result).toHaveLength(1);
      expect(result[0].book_name).toBe('genesis');
      expect(result[0].title).toBeNull();
    });
  });

  describe('getProgressForBook', () => {
    it('queries with book id', async () => {
      await getProgressForBook('genesis');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('reading_progress'),
        ['genesis'],
      );
    });
  });

  // ── Bookmarks ─────────────────────────────────────────────
  describe('getBookmarks', () => {
    it('returns bookmarks ordered by created_at DESC', async () => {
      const bookmarks = [{ id: 1, verse_ref: 'genesis 1:1' }];
      mockGetAllAsync.mockResolvedValue(bookmarks);
      const result = await getBookmarks();
      expect(result).toEqual(bookmarks);
    });
  });

  describe('isBookmarked', () => {
    it('returns true when count > 0', async () => {
      mockGetFirstAsync.mockResolvedValue({ count: 1 });
      expect(await isBookmarked('genesis 1:1')).toBe(true);
    });

    it('returns false when count is 0', async () => {
      mockGetFirstAsync.mockResolvedValue({ count: 0 });
      expect(await isBookmarked('genesis 1:1')).toBe(false);
    });

    it('returns false when row is null', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      expect(await isBookmarked('genesis 1:1')).toBe(false);
    });
  });

  // ── Preferences ───────────────────────────────────────────
  describe('getPreference', () => {
    it('returns value when found', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'kjv' });
      const result = await getPreference('translation');
      expect(result).toBe('kjv');
    });

    it('returns null when not found', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      const result = await getPreference('nonexistent');
      expect(result).toBeNull();
    });
  });

  // ── Highlights ────────────────────────────────────────────
  describe('getHighlightsForChapter', () => {
    it('queries with chapter prefix', async () => {
      await getHighlightsForChapter('genesis', 1);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('verse_highlights'),
        expect.arrayContaining(['genesis 1:%']),
      );
    });
  });

  describe('getAllHighlights', () => {
    it('returns all highlights', async () => {
      const hl = [{ id: 1, verse_ref: 'genesis 1:1', color: 'yellow' }];
      mockGetAllAsync.mockResolvedValue(hl);
      expect(await getAllHighlights()).toEqual(hl);
    });
  });

  describe('getHighlightCollections', () => {
    it('returns collections', async () => {
      mockGetAllAsync.mockResolvedValue([{ id: '1', name: 'Test' }]);
      const result = await getHighlightCollections();
      expect(result).toHaveLength(1);
    });
  });

  // ── Reading Plans ─────────────────────────────────────────
  describe('getPlans', () => {
    it('returns reading plans', async () => {
      mockGetAllAsync.mockResolvedValue([{ id: 'plan1', name: 'Test Plan' }]);
      expect(await getPlans()).toHaveLength(1);
    });
  });

  describe('getPlanProgress', () => {
    it('queries with plan id', async () => {
      await getPlanProgress('plan1');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('plan_progress'),
        ['plan1'],
      );
    });
  });

  describe('getActivePlanId', () => {
    it('returns plan id when set', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'plan1' });
      expect(await getActivePlanId()).toBe('plan1');
    });

    it('returns null when empty string', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: '' });
      expect(await getActivePlanId()).toBeNull();
    });

    it('returns null when preference missing', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      expect(await getActivePlanId()).toBeNull();
    });
  });

  // ── Reading Stats ─────────────────────────────────────────
  describe('getReadingStats', () => {
    it('computes stats with streak', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ count: 10 }) // total
        .mockResolvedValueOnce({ book_id: 'genesis' }); // fav book

      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      mockGetAllAsync.mockResolvedValueOnce([
        { day: today },
        { day: yesterday },
      ]);

      const stats = await getReadingStats();
      expect(stats.totalChapters).toBe(10);
      expect(stats.favouriteBook).toBe('genesis');
      expect(stats.currentStreak).toBe(2);
      expect(stats.longestStreak).toBe(2);
    });

    it('returns zero streak when no days', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce(null);
      mockGetAllAsync.mockResolvedValueOnce([]);

      const stats = await getReadingStats();
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.favouriteBook).toBeNull();
    });

    it('returns 0 for total when row is null', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce(null) // count
        .mockResolvedValueOnce(null); // fav
      mockGetAllAsync.mockResolvedValueOnce([]);

      const stats = await getReadingStats();
      expect(stats.totalChapters).toBe(0);
    });

    it('breaks streak when a day is missed', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ count: 5 })
        .mockResolvedValueOnce({ book_id: 'exodus' });

      const today = new Date().toISOString().slice(0, 10);
      // Skip yesterday, have day before
      const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      mockGetAllAsync.mockResolvedValueOnce([
        { day: today },
        { day: dayBefore }, // not yesterday => breaks streak
      ]);

      const stats = await getReadingStats();
      expect(stats.currentStreak).toBe(1);
    });
  });

  // ── Testament Progress ────────────────────────────────────
  describe('getTestamentProgress', () => {
    it('categorizes OT and NT books correctly', async () => {
      mockGetAllAsync.mockResolvedValue([
        { book_id: 'genesis', cnt: 5 },
        { book_id: 'matthew', cnt: 3 },
        { book_id: 'revelation', cnt: 2 },
      ]);

      const result = await getTestamentProgress();
      expect(result).toHaveLength(2);
      expect(result[0].testament).toBe('Old Testament');
      expect(result[0].chaptersRead).toBe(5);
      expect(result[0].totalChapters).toBe(929);
      expect(result[1].testament).toBe('New Testament');
      expect(result[1].chaptersRead).toBe(5); // 3 + 2
      expect(result[1].totalChapters).toBe(260);
    });

    it('returns zero counts when no reading', async () => {
      mockGetAllAsync.mockResolvedValue([]);
      const result = await getTestamentProgress();
      expect(result[0].chaptersRead).toBe(0);
      expect(result[1].chaptersRead).toBe(0);
    });
  });

  // ── Study Collections ─────────────────────────────────────
  describe('getCollections', () => {
    it('returns collections', async () => {
      mockGetAllAsync.mockResolvedValue([{ id: 1, name: 'Test' }]);
      expect(await getCollections()).toHaveLength(1);
    });
  });

  describe('getCollection', () => {
    it('returns single collection', async () => {
      mockGetFirstAsync.mockResolvedValue({ id: 1, name: 'Test' });
      const result = await getCollection(1);
      expect(result?.name).toBe('Test');
    });

    it('returns null for non-existent id', async () => {
      expect(await getCollection(999)).toBeNull();
    });
  });

  describe('getNotesInCollection', () => {
    it('queries with collection id', async () => {
      await getNotesInCollection(1);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('collection_id'),
        [1],
      );
    });
  });

  describe('getCollectionNoteCounts', () => {
    it('returns count map', async () => {
      mockGetAllAsync.mockResolvedValue([
        { collection_id: 1, count: 5 },
        { collection_id: 2, count: 3 },
      ]);
      const result = await getCollectionNoteCounts();
      expect(result[1]).toBe(5);
      expect(result[2]).toBe(3);
    });

    it('returns empty map when no notes', async () => {
      const result = await getCollectionNoteCounts();
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  // ── Tags ──────────────────────────────────────────────────
  describe('getAllTags', () => {
    it('extracts unique tags from JSON', async () => {
      mockGetAllAsync.mockResolvedValue([
        { tags_json: '["faith","hope"]' },
        { tags_json: '["hope","love"]' },
      ]);
      const result = await getAllTags();
      expect(result).toEqual(['faith', 'hope', 'love']); // sorted
    });

    it('skips malformed JSON', async () => {
      mockGetAllAsync.mockResolvedValue([
        { tags_json: 'NOT JSON' },
        { tags_json: '["valid"]' },
      ]);
      const result = await getAllTags();
      expect(result).toEqual(['valid']);
    });

    it('returns empty array when no tagged notes', async () => {
      const result = await getAllTags();
      expect(result).toEqual([]);
    });
  });

  describe('getNotesByTag', () => {
    it('queries with escaped tag', async () => {
      await getNotesByTag('test');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('tags_json LIKE'),
        expect.any(Array),
      );
    });
  });

  // ── Study Sessions ────────────────────────────────────────
  describe('getStudySessions', () => {
    it('queries with limit when provided', async () => {
      await getStudySessions(5);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        [5],
      );
    });

    it('queries without limit when omitted', async () => {
      await getStudySessions();
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.not.stringContaining('LIMIT'),
        [],
      );
    });
  });

  describe('getStudySession', () => {
    it('returns session by id', async () => {
      mockGetFirstAsync.mockResolvedValue({ id: 1, chapter_id: 'gen_1' });
      const result = await getStudySession(1);
      expect(result?.chapter_id).toBe('gen_1');
    });
  });

  describe('getSessionEvents', () => {
    it('queries events for session', async () => {
      await getSessionEvents(1);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('session_id'),
        [1],
      );
    });
  });

  describe('getStudySessionsForChapter', () => {
    it('queries sessions for chapter', async () => {
      await getStudySessionsForChapter('genesis_1');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('chapter_id'),
        ['genesis_1'],
      );
    });
  });

  // ── Note Links ────────────────────────────────────────────
  describe('getLinkedNotes', () => {
    it('queries linked notes', async () => {
      await getLinkedNotes(1);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('from_note_id'),
        [1],
      );
    });
  });

  describe('getReferencingNotes', () => {
    it('queries backlinks', async () => {
      await getReferencingNotes(1);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('to_note_id'),
        [1],
      );
    });
  });

  // ── FTS Search ────────────────────────────────────────────
  describe('searchNotesFTS', () => {
    it('returns empty for empty query', async () => {
      const result = await searchNotesFTS('');
      expect(result).toEqual([]);
    });

    it('returns empty for single-character words', async () => {
      const result = await searchNotesFTS('a b c');
      expect(result).toEqual([]);
    });

    it('sanitizes and wraps terms in quotes', async () => {
      await searchNotesFTS('grace mercy');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['"grace" "mercy"'],
      );
    });

    it('strips special characters', async () => {
      await searchNotesFTS('grace* "test" (query)');
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['"grace" "test" "query"'],
      );
    });
  });

  // ── Auth Profile ──────────────────────────────────────────
  describe('getAuthProfile', () => {
    it('returns profile when exists', async () => {
      mockGetFirstAsync.mockResolvedValue({
        supabase_uid: 'uid-1',
        email: 'test@test.com',
        display_name: 'Test',
        avatar_url: '',
        provider: 'email',
      });
      const profile = await getAuthProfile();
      expect(profile?.email).toBe('test@test.com');
    });

    it('returns null when no profile', async () => {
      expect(await getAuthProfile()).toBeNull();
    });
  });

  // ── Flagged Content ───────────────────────────────────────
  describe('isFlagged', () => {
    it('returns true when flagged', async () => {
      mockGetFirstAsync.mockResolvedValue({ id: 1 });
      expect(await isFlagged('content-1')).toBe(true);
    });

    it('returns false when not flagged', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      expect(await isFlagged('content-1')).toBe(false);
    });
  });

  // ── Bookmarked Topics ────────────────────────────────────
  describe('getBookmarkedTopics', () => {
    it('returns bookmarked topics', async () => {
      mockGetAllAsync.mockResolvedValue([{ id: 1, topic_id: 't1' }]);
      expect(await getBookmarkedTopics()).toHaveLength(1);
    });
  });

  describe('isTopicBookmarked', () => {
    it('returns true when count > 0', async () => {
      mockGetFirstAsync.mockResolvedValue({ count: 1 });
      expect(await isTopicBookmarked('topic-1')).toBe(true);
    });

    it('returns false when count is 0', async () => {
      mockGetFirstAsync.mockResolvedValue({ count: 0 });
      expect(await isTopicBookmarked('topic-1')).toBe(false);
    });

    it('returns false when row is null', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      expect(await isTopicBookmarked('topic-1')).toBe(false);
    });
  });
});
