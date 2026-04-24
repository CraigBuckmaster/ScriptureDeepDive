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
  createOrResumeGuidedStudySession,
  setGuidedStudyStep,
  completeGuidedStudySession,
  upsertGuidedStudyResponse,
  upsertGuidedStudySynthesis,
  createGuidedReviewItems,
  completeGuidedReviewItem,
  recordConceptEncounter,
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

// ── Guided Study (write) ──────────────────────────────────────────

describe('createOrResumeGuidedStudySession', () => {
  it('returns the existing active session id when one is found', async () => {
    mockGetFirstAsync.mockResolvedValueOnce({ id: 42 });
    const id = await createOrResumeGuidedStudySession('genesis_1');
    expect(id).toBe(42);
    expect(mockGetFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE chapter_id = ? AND status = 'active'"),
      ['genesis_1'],
    );
    // Should NOT insert a new row when one already exists.
    expect(mockRunAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO guided_study_sessions'),
      expect.anything(),
    );
  });

  it('inserts a new active session when none exists', async () => {
    mockGetFirstAsync.mockResolvedValueOnce(null);
    mockRunAsync.mockResolvedValueOnce({ lastInsertRowId: 77, changes: 1 });
    const id = await createOrResumeGuidedStudySession('exodus_3');
    expect(id).toBe(77);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO guided_study_sessions'),
      ['exodus_3'],
    );
  });
});

describe('createGuidedReviewItems', () => {
  it('inserts each item inside a transaction with the correct interval offset', async () => {
    await createGuidedReviewItems(1, 'genesis_1', 'Chapter Title', [
      { prompt: 'A?', answer: 'a', intervalDays: 1 },
      { prompt: 'B?', answer: 'b', intervalDays: 1 },
    ]);
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO guided_review_items'),
      [1, 'genesis_1', 'Chapter Title', 'A?', 'a', '+1 days'],
    );
  });
});

describe('completeGuidedReviewItem', () => {
  it('marks the row completed and schedules the next-interval row', async () => {
    mockGetFirstAsync.mockResolvedValueOnce({
      source_session_id: 5,
      chapter_id: 'genesis_1',
      title: 'Title',
      prompt: 'P?',
      answer: 'A',
      interval_days: 1,
      review_count: 0,
    });
    await completeGuidedReviewItem(10);
    // Inside the transaction: one UPDATE to complete the row, one INSERT for the next interval
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    const calls = mockRunAsync.mock.calls;
    expect(calls[0][0]).toEqual(expect.stringContaining("status = 'completed'"));
    expect(calls[0][1]).toEqual([10]);
    expect(calls[1][0]).toEqual(expect.stringContaining('INSERT INTO guided_review_items'));
    // Next interval after 1 is 3
    expect(calls[1][1]).toEqual([5, 'genesis_1', 'Title', 'P?', 'A', '+3 days', 3, 1]);
  });

  it('terminates the chain after the final interval (30 days)', async () => {
    mockGetFirstAsync.mockResolvedValueOnce({
      source_session_id: 5,
      chapter_id: 'genesis_1',
      title: 'Title',
      prompt: 'P?',
      answer: 'A',
      interval_days: 30,
      review_count: 3,
    });
    await completeGuidedReviewItem(10);
    // Only the UPDATE runs — no next row inserted after the last interval
    expect(mockRunAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync.mock.calls[0][0]).toEqual(expect.stringContaining("status = 'completed'"));
  });

  it('no-ops if the row does not exist', async () => {
    mockGetFirstAsync.mockResolvedValueOnce(null);
    await completeGuidedReviewItem(999);
    // Transaction was opened but no writes happened
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).not.toHaveBeenCalled();
  });
});

describe('setGuidedStudyStep', () => {
  it('updates current_step and updated_at', async () => {
    await setGuidedStudyStep(5, 'observe');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE guided_study_sessions SET current_step'),
      ['observe', 5],
    );
  });
});

describe('completeGuidedStudySession', () => {
  it("sets status to completed and current_step to review", async () => {
    await completeGuidedStudySession(5);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining("status = 'completed'"),
      [5],
    );
    expect(mockRunAsync.mock.calls[0][0]).toEqual(
      expect.stringContaining("current_step = 'review'"),
    );
  });
});

describe('upsertGuidedStudyResponse', () => {
  it('inserts (or updates) a response and bumps session updated_at', async () => {
    await upsertGuidedStudyResponse(5, 'key1', 'prompt text', 'response text');
    // Two queries: INSERT ... ON CONFLICT DO UPDATE, then session updated_at
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync.mock.calls[0][0]).toEqual(
      expect.stringContaining('INSERT INTO guided_study_responses'),
    );
    expect(mockRunAsync.mock.calls[0][1]).toEqual([5, 'key1', 'prompt text', 'response text']);
    expect(mockRunAsync.mock.calls[1][0]).toEqual(
      expect.stringContaining('UPDATE guided_study_sessions SET updated_at'),
    );
  });
});

describe('upsertGuidedStudySynthesis', () => {
  it('inserts (or updates) synthesis and bumps session updated_at', async () => {
    await upsertGuidedStudySynthesis(5, {
      takeaway: 'T',
      open_question: 'Q',
      key_connection: 'C',
    });
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync.mock.calls[0][0]).toEqual(
      expect.stringContaining('INSERT INTO guided_study_synthesis'),
    );
    expect(mockRunAsync.mock.calls[0][1]).toEqual([5, 'T', 'Q', 'C']);
  });
});

describe('recordConceptEncounter', () => {
  it('inserts or updates a concept encounter by (concept_id, chapter_id)', async () => {
    await recordConceptEncounter('creation', 'Creation', 'genesis_1');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO concept_encounters'),
      ['creation', 'Creation', 'genesis_1'],
    );
    expect(mockRunAsync.mock.calls[0][0]).toEqual(
      expect.stringContaining('ON CONFLICT(concept_id, chapter_id)'),
    );
  });
});
