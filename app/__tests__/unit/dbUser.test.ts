/**
 * Unit tests for db/user.ts — user data queries.
 *
 * Mocks getUserDb() so no real SQLite connection is needed.
 */

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => mockUserDb,
}));

jest.mock('@/db/database', () => ({
  getDb: () => mockContentDb,
}));

const mockUserDb = {
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
  execAsync: jest.fn().mockResolvedValue(undefined),
};

const mockContentDb = {
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
};

import {
  getNotesForChapter,
  saveNote,
  updateNote,
  deleteNote,
  addBookmark,
  removeBookmark,
  getBookmarks,
  isBookmarked,
  setHighlight,
  removeHighlight,
  getHighlightsForChapter,
  getPreference,
  setPreference,
  recordVisit,
  getRecentChapters,
  getReadingStats,
  createCollection,
  getCollections,
  getCollectionNoteCounts,
  updateNoteTags,
  getAllTags,
  getNotesByTag,
  linkNotes,
  unlinkNotes,
  getLinkedNotes,
} from '@/db/user';

beforeEach(() => {
  jest.clearAllMocks();
  mockUserDb.getAllAsync.mockResolvedValue([]);
  mockUserDb.getFirstAsync.mockResolvedValue(null);
  mockUserDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
  mockContentDb.getFirstAsync.mockResolvedValue(null);
});

// ── Notes ───────────────────────────────────────────────────────────────

describe('Notes', () => {
  it('getNotesForChapter returns notes filtered by book and chapter', async () => {
    const fakeNotes = [
      { id: 1, verse_ref: 'genesis 1:3', note_text: 'Light' },
      { id: 2, verse_ref: 'genesis 1:5', note_text: 'Day and night' },
    ];
    mockUserDb.getAllAsync.mockResolvedValueOnce(fakeNotes);

    const result = await getNotesForChapter('genesis', 1);

    expect(result).toEqual(fakeNotes);
    expect(mockUserDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM user_notes'),
      ['genesis 1:%', 'genesis 1'],
    );
  });

  it('saveNote inserts note and syncs FTS, returns ID', async () => {
    mockUserDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 42 });
    mockUserDb.runAsync.mockResolvedValueOnce({ changes: 1 });

    const id = await saveNote('genesis 1:1', 'In the beginning');

    expect(id).toBe(42);
    expect(mockUserDb.runAsync).toHaveBeenCalledTimes(2);
    // First call: insert into user_notes
    expect(mockUserDb.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO user_notes'),
      ['genesis 1:1', 'In the beginning'],
    );
    // Second call: insert into FTS
    expect(mockUserDb.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO notes_fts'),
      [42, 'In the beginning'],
    );
  });

  it('updateNote updates text and syncs FTS', async () => {
    await updateNote(5, 'Updated text');

    expect(mockUserDb.runAsync).toHaveBeenCalledTimes(2);
    expect(mockUserDb.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE user_notes'),
      ['Updated text', 5],
    );
    expect(mockUserDb.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE notes_fts'),
      ['Updated text', 5],
    );
  });

  it('deleteNote removes note and FTS entry', async () => {
    await deleteNote(7);

    expect(mockUserDb.runAsync).toHaveBeenCalledTimes(2);
    expect(mockUserDb.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('DELETE FROM user_notes'),
      [7],
    );
    expect(mockUserDb.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('DELETE FROM notes_fts'),
      [7],
    );
  });
});

// ── Bookmarks ───────────────────────────────────────────────────────────

describe('Bookmarks', () => {
  it('addBookmark inserts and returns the new ID', async () => {
    mockUserDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 10 });

    const id = await addBookmark('john 3:16', 'Favorite');

    expect(id).toBe(10);
    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bookmarks'),
      ['john 3:16', 'Favorite'],
    );
  });

  it('removeBookmark deletes by ID', async () => {
    await removeBookmark(10);

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM bookmarks'),
      [10],
    );
  });

  it('getBookmarks returns all bookmarks ordered by date', async () => {
    const fakeBookmarks = [{ id: 1, verse_ref: 'john 3:16', label: null }];
    mockUserDb.getAllAsync.mockResolvedValueOnce(fakeBookmarks);

    const result = await getBookmarks();

    expect(result).toEqual(fakeBookmarks);
    expect(mockUserDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM bookmarks'),
    );
  });

  it('isBookmarked returns true when count > 0', async () => {
    mockUserDb.getFirstAsync.mockResolvedValueOnce({ count: 1 });

    const result = await isBookmarked('john 3:16');

    expect(result).toBe(true);
    expect(mockUserDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(*)'),
      ['john 3:16'],
    );
  });

  it('isBookmarked returns false when count is 0', async () => {
    mockUserDb.getFirstAsync.mockResolvedValueOnce({ count: 0 });

    expect(await isBookmarked('john 3:16')).toBe(false);
  });
});

// ── Highlights ──────────────────────────────────────────────────────────

describe('Highlights', () => {
  it('setHighlight upserts a highlight with color', async () => {
    await setHighlight('romans 8:28', '#ff0000');

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO verse_highlights'),
      ['romans 8:28', '#ff0000', null, null, '#ff0000', null, null],
    );
  });

  it('removeHighlight deletes by verse ref', async () => {
    await removeHighlight('romans 8:28');

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM verse_highlights'),
      ['romans 8:28'],
    );
  });

  it('getHighlightsForChapter returns highlights matching chapter prefix', async () => {
    const fakeHighlights = [{ id: 1, verse_ref: 'romans 8:28', color: '#ff0000' }];
    mockUserDb.getAllAsync.mockResolvedValueOnce(fakeHighlights);

    const result = await getHighlightsForChapter('romans', 8);

    expect(result).toEqual(fakeHighlights);
    expect(mockUserDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM verse_highlights'),
      ['romans 8:%'],
    );
  });
});

// ── Preferences ─────────────────────────────────────────────────────────

describe('Preferences', () => {
  it('getPreference returns value when found', async () => {
    mockUserDb.getFirstAsync.mockResolvedValueOnce({ value: 'dark' });

    const val = await getPreference('theme');

    expect(val).toBe('dark');
    expect(mockUserDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT value FROM user_preferences'),
      ['theme'],
    );
  });

  it('getPreference returns null when key not found', async () => {
    mockUserDb.getFirstAsync.mockResolvedValueOnce(null);

    expect(await getPreference('nonexistent')).toBeNull();
  });

  it('setPreference upserts a key-value pair', async () => {
    await setPreference('font_size', '18');

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_preferences'),
      ['font_size', '18', '18'],
    );
  });
});

// ── Reading ─────────────────────────────────────────────────────────────

describe('Reading', () => {
  it('recordVisit upserts reading progress', async () => {
    await recordVisit('genesis', 1);

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO reading_progress'),
      ['genesis', 1],
    );
  });

  it('getRecentChapters returns enriched chapters from both DBs', async () => {
    const progressRows = [
      { book_id: 'genesis', chapter_num: 1, completed_at: '2026-01-01' },
    ];
    mockUserDb.getAllAsync.mockResolvedValueOnce(progressRows);
    mockContentDb.getAllAsync.mockResolvedValueOnce([{
      book_id: 'genesis',
      chapter_num: 1,
      title: 'Creation',
      book_name: 'Genesis',
    }]);

    const result = await getRecentChapters(5);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      book_id: 'genesis',
      chapter_num: 1,
      title: 'Creation',
      book_name: 'Genesis',
    });
  });

  it('getRecentChapters returns empty array when no progress', async () => {
    mockUserDb.getAllAsync.mockResolvedValueOnce([]);

    const result = await getRecentChapters();

    expect(result).toEqual([]);
  });

  it('getReadingStats returns stats with totals and streaks', async () => {
    mockUserDb.getFirstAsync
      .mockResolvedValueOnce({ count: 15 })   // totalChapters
      .mockResolvedValueOnce({ book_id: 'psalms' }); // favourite book
    mockUserDb.getAllAsync.mockResolvedValueOnce([]); // streak days

    const stats = await getReadingStats();

    expect(stats).toMatchObject({
      totalChapters: 15,
      favouriteBook: 'psalms',
      currentStreak: 0,
      longestStreak: 0,
    });
  });
});

// ── Collections ─────────────────────────────────────────────────────────

describe('Collections', () => {
  it('createCollection inserts and returns new ID', async () => {
    mockUserDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 3 });

    const id = await createCollection('Study Group');

    expect(id).toBe(3);
    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO study_collections'),
      ['Study Group', '', '#bfa050'],
    );
  });

  it('getCollections returns all collections', async () => {
    const fakeCollections = [{ id: 1, name: 'Favorites' }];
    mockUserDb.getAllAsync.mockResolvedValueOnce(fakeCollections);

    const result = await getCollections();

    expect(result).toEqual(fakeCollections);
    expect(mockUserDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM study_collections'),
    );
  });

  it('getCollectionNoteCounts returns a map of collection IDs to counts', async () => {
    mockUserDb.getAllAsync.mockResolvedValueOnce([
      { collection_id: 1, count: 5 },
      { collection_id: 2, count: 3 },
    ]);

    const counts = await getCollectionNoteCounts();

    expect(counts).toEqual({ 1: 5, 2: 3 });
  });
});

// ── Tags ────────────────────────────────────────────────────────────────

describe('Tags', () => {
  it('updateNoteTags sets tags JSON on a note', async () => {
    await updateNoteTags(1, ['prayer', 'faith']);

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_notes SET tags_json'),
      ['["prayer","faith"]', 1],
    );
  });

  it('getAllTags returns unique sorted tags from all notes', async () => {
    mockUserDb.getAllAsync.mockResolvedValueOnce([
      { tags_json: '["faith","hope"]' },
      { tags_json: '["charity","faith"]' },
    ]);

    const tags = await getAllTags();

    expect(tags).toEqual(['charity', 'faith', 'hope']);
  });

  it('getNotesByTag queries with LIKE pattern', async () => {
    const fakeNotes = [{ id: 1, verse_ref: 'john 3:16', tags_json: '["faith"]' }];
    mockUserDb.getAllAsync.mockResolvedValueOnce(fakeNotes);

    const result = await getNotesByTag('faith');

    expect(result).toEqual(fakeNotes);
    expect(mockUserDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM user_notes WHERE tags_json LIKE'),
      ['%"faith"%'],
    );
  });
});

// ── Note Links ──────────────────────────────────────────────────────────

describe('Note Links', () => {
  it('linkNotes inserts a link between two notes', async () => {
    await linkNotes(1, 2);

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO note_links'),
      [1, 2],
    );
  });

  it('unlinkNotes removes a link between two notes', async () => {
    await unlinkNotes(1, 2);

    expect(mockUserDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM note_links'),
      [1, 2],
    );
  });

  it('getLinkedNotes returns notes linked from a given note', async () => {
    const linked = [{ id: 2, verse_ref: 'romans 8:28', note_text: 'Connected' }];
    mockUserDb.getAllAsync.mockResolvedValueOnce(linked);

    const result = await getLinkedNotes(1);

    expect(result).toEqual(linked);
    expect(mockUserDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('JOIN note_links'),
      [1],
    );
  });
});
