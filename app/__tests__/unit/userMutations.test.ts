/**
 * Database layer tests for db/userMutations.ts
 *
 * Verifies SQL queries and parameters for all user mutation functions.
 */
const mockRunAsync = jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockGetFirstAsync = jest.fn().mockResolvedValue(null);
const mockWithTransactionAsync = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb());

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    runAsync: mockRunAsync,
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
    withTransactionAsync: mockWithTransactionAsync,
  }),
}));

jest.mock('@/db/userQueries', () => ({
  getPreference: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  saveNote,
  updateNote,
  deleteNote,
  recordVisit,
  addBookmark,
  removeBookmark,
  setPreference,
  setHighlight,
  removeHighlight,
  createHighlightCollection,
  deleteHighlightCollection,
  startPlan,
  completePlanDay,
  abandonPlan,
  upsertAuthProfile,
  clearAuthProfile,
  startStudySession,
  endStudySession,
  recordSessionEvent,
  flagContent,
  bookmarkTopic,
  unbookmarkTopic,
  updateNoteTags,
  setNoteCollection,
  linkNotes,
  unlinkNotes,
  resetToNewUser,
  createCollection,
  updateCollection,
  deleteCollection,
} from '@/db/userMutations';

beforeEach(() => {
  jest.clearAllMocks();
  mockRunAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
  mockGetFirstAsync.mockResolvedValue(null);
});

// ── Notes ───────────────────────────────────────────────────────

describe('saveNote', () => {
  it('inserts a note and syncs FTS', async () => {
    const id = await saveNote('gen 1:1', 'My note');
    expect(id).toBe(1);
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO user_notes'),
      ['gen 1:1', 'My note'],
    );
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO notes_fts'),
      [1, 'My note'],
    );
  });
});

describe('updateNote', () => {
  it('updates note text and syncs FTS', async () => {
    await updateNote(5, 'Updated text');
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE user_notes'),
      ['Updated text', 5],
    );
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE notes_fts'),
      ['Updated text', 5],
    );
  });
});

describe('deleteNote', () => {
  it('deletes note and FTS entry', async () => {
    await deleteNote(3);
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('DELETE FROM user_notes'),
      [3],
    );
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('DELETE FROM notes_fts'),
      [3],
    );
  });
});

// ── Reading Progress ────────────────────────────────────────────

describe('recordVisit', () => {
  it('upserts reading progress with ON CONFLICT', async () => {
    await recordVisit('genesis', 3);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO reading_progress'),
      ['genesis', 3],
    );
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT'),
      expect.any(Array),
    );
  });
});

// ── Bookmarks ───────────────────────────────────────────────────

describe('addBookmark', () => {
  it('inserts a bookmark and returns its id', async () => {
    const id = await addBookmark('gen 1:1', 'My label');
    expect(id).toBe(1);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bookmarks'),
      ['gen 1:1', 'My label'],
    );
  });

  it('uses null when no label provided', async () => {
    await addBookmark('gen 1:1');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bookmarks'),
      ['gen 1:1', null],
    );
  });
});

describe('removeBookmark', () => {
  it('deletes the bookmark by id', async () => {
    await removeBookmark(7);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM bookmarks'),
      [7],
    );
  });
});

// ── Preferences ─────────────────────────────────────────────────

describe('setPreference', () => {
  it('upserts a preference with ON CONFLICT', async () => {
    await setPreference('theme', 'dark');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_preferences'),
      ['theme', 'dark', 'dark'],
    );
  });
});

// ── Highlights ──────────────────────────────────────────────────

describe('setHighlight', () => {
  it('upserts a highlight with color and optional fields', async () => {
    await setHighlight('gen 1:1', '#ff0', 'col1', 'a note');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO verse_highlights'),
      ['gen 1:1', '#ff0', 'col1', 'a note', '#ff0', 'col1', 'a note'],
    );
  });

  it('uses null for optional params', async () => {
    await setHighlight('gen 1:1', '#ff0');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO verse_highlights'),
      ['gen 1:1', '#ff0', null, null, '#ff0', null, null],
    );
  });
});

describe('removeHighlight', () => {
  it('deletes by verse_ref', async () => {
    await removeHighlight('gen 1:1');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM verse_highlights'),
      ['gen 1:1'],
    );
  });
});

// ── Highlight Collections ───────────────────────────────────────

describe('createHighlightCollection', () => {
  it('inserts a new collection', async () => {
    await createHighlightCollection('col1', 'My Collection', '#abc');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO highlight_collections'),
      ['col1', 'My Collection', '#abc'],
    );
  });
});

describe('deleteHighlightCollection', () => {
  it('clears collection_id from highlights then deletes collection', async () => {
    await deleteHighlightCollection('col1');
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE verse_highlights'),
      ['col1'],
    );
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('DELETE FROM highlight_collections'),
      ['col1'],
    );
  });
});

// ── Reading Plans ───────────────────────────────────────────────

describe('startPlan', () => {
  it('returns early if plan not found', async () => {
    mockGetFirstAsync.mockResolvedValue(null);
    await startPlan('missing');
    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
  });

  it('creates plan progress rows in a transaction', async () => {
    mockGetFirstAsync.mockResolvedValue({ id: 'plan1', total_days: 3 });
    await startPlan('plan1');
    expect(mockWithTransactionAsync).toHaveBeenCalled();
    // Should delete existing progress, insert rows, set prefs
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM plan_progress'),
      ['plan1'],
    );
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO plan_progress'),
      expect.arrayContaining(['plan1', 1]),
    );
  });
});

describe('completePlanDay', () => {
  it('updates completed_at for a plan day', async () => {
    await completePlanDay('plan1', 5);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE plan_progress'),
      ['plan1', 5],
    );
  });
});

describe('abandonPlan', () => {
  it('deletes progress and clears active_plan in a transaction', async () => {
    await abandonPlan('plan1');
    expect(mockWithTransactionAsync).toHaveBeenCalled();
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM plan_progress'),
      ['plan1'],
    );
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('active_plan'),
    );
  });
});

// ── Auth Profile ────────────────────────────────────────────────

describe('upsertAuthProfile', () => {
  it('inserts or updates an auth profile', async () => {
    await upsertAuthProfile('uid1', 'a@b.com', 'Name', 'http://avatar', 'email');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO auth_profiles'),
      ['uid1', 'a@b.com', 'Name', 'http://avatar', 'email'],
    );
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT(supabase_uid)'),
      expect.any(Array),
    );
  });
});

describe('clearAuthProfile', () => {
  it('deletes all auth profiles', async () => {
    await clearAuthProfile();
    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM auth_profiles');
  });
});

// ── Study Sessions ──────────────────────────────────────────────

describe('startStudySession', () => {
  it('inserts a session and returns the id', async () => {
    const id = await startStudySession('genesis_1');
    expect(id).toBe(1);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO study_sessions'),
      ['genesis_1'],
    );
  });
});

describe('endStudySession', () => {
  it('updates ended_at and duration_ms', async () => {
    await endStudySession(10, 30000);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE study_sessions'),
      [30000, 10],
    );
  });
});

describe('recordSessionEvent', () => {
  it('inserts a session event with all fields', async () => {
    await recordSessionEvent(1, {
      event_type: 'panel_open',
      panel_type: 'themes',
      scholar_id: 'wright',
      section_id: 'sec1',
      timestamp_ms: 5000,
      metadata_json: '{}',
    });
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO study_session_events'),
      [1, 'panel_open', 'themes', 'wright', 'sec1', 5000, '{}'],
    );
  });
});

// ── Flagged Content ─────────────────────────────────────────────

describe('flagContent', () => {
  it('inserts or replaces a content flag', async () => {
    await flagContent('item1', 'comment', 'offensive', 'details here');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO flagged_content'),
      ['item1', 'comment', 'offensive', 'details here'],
    );
  });
});

// ── Bookmarked Topics ───────────────────────────────────────────

describe('bookmarkTopic', () => {
  it('inserts or updates a topic bookmark', async () => {
    const id = await bookmarkTopic('topic1', 'official', 'Title', 'Summary');
    expect(id).toBe(1);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bookmarked_topics'),
      ['topic1', 'official', 'Title', 'Summary'],
    );
  });
});

describe('unbookmarkTopic', () => {
  it('deletes topic bookmark by topic_id', async () => {
    await unbookmarkTopic('topic1');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM bookmarked_topics'),
      ['topic1'],
    );
  });
});

// ── Tags / Collections / Links ──────────────────────────────────

describe('updateNoteTags', () => {
  it('updates tags_json on a note', async () => {
    await updateNoteTags(1, ['tag1', 'tag2']);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_notes SET tags_json'),
      ['["tag1","tag2"]', 1],
    );
  });
});

describe('setNoteCollection', () => {
  it('assigns a collection to a note', async () => {
    await setNoteCollection(1, 5);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_notes SET collection_id'),
      [5, 1],
    );
  });
});

describe('linkNotes', () => {
  it('inserts a note link', async () => {
    await linkNotes(1, 2);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO note_links'),
      [1, 2],
    );
  });
});

describe('unlinkNotes', () => {
  it('deletes a note link', async () => {
    await unlinkNotes(1, 2);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM note_links'),
      [1, 2],
    );
  });
});

// ── Study Collections ───────────────────────────────────────────

describe('createCollection', () => {
  it('inserts a study collection', async () => {
    const id = await createCollection('MyCol', 'Desc', '#abc');
    expect(id).toBe(1);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO study_collections'),
      ['MyCol', 'Desc', '#abc'],
    );
  });
});

describe('updateCollection', () => {
  it('updates a study collection', async () => {
    await updateCollection(2, 'New Name', 'New Desc', '#def');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE study_collections'),
      ['New Name', 'New Desc', '#def', 2],
    );
  });
});

describe('deleteCollection', () => {
  it('deletes a study collection', async () => {
    await deleteCollection(3);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM study_collections'),
      [3],
    );
  });
});

// ── Reset ───────────────────────────────────────────────────────

describe('resetToNewUser', () => {
  it('clears reading data and selected preferences', async () => {
    await resetToNewUser();
    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM reading_progress');
    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM study_session_events');
    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM study_sessions');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM user_preferences'),
    );
    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM plan_progress');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE reading_plans'),
    );
  });
});
