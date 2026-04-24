/**
 * Tests for Amicus write mutations (#1457).
 */
import { getMockUserDb, resetMockUserDb } from '../../helpers/mockUserDb';

jest.mock('@/db/userDatabase', () => require('../../helpers/mockUserDb').mockUserDatabaseModule());

import {
  appendAmicusMessage,
  clearAllAmicusData,
  createAmicusThread,
  deleteAmicusThread,
  incrementAmicusUsage,
  toggleThreadPin,
  updateThreadTitle,
  upsertAmicusThreadContext,
  upsertAmicusThreadSummary,
} from '@/db/userMutations';

beforeEach(() => {
  resetMockUserDb();
});

describe('createAmicusThread', () => {
  it('inserts with provided id + title + optional chapter_ref', async () => {
    await createAmicusThread({
      threadId: 't-1',
      title: 'First',
      chapterRef: 'romans:9',
    });
    const mock = getMockUserDb();
    const [sql, bindings] = mock.runAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/INSERT INTO amicus_threads/);
    expect(bindings).toEqual(['t-1', 'First', 'romans/9']);
  });

  it('defaults chapterRef to null', async () => {
    await createAmicusThread({ threadId: 't-2', title: 'No chapter' });
    const [, bindings] = getMockUserDb().runAsync.mock.calls[0]!;
    expect(bindings[2]).toBeNull();
  });
});

describe('appendAmicusMessage', () => {
  it('inserts message + updates parent thread in a transaction', async () => {
    await appendAmicusMessage({
      messageId: 'm1',
      threadId: 't1',
      role: 'user',
      content: 'hi',
    });
    const mock = getMockUserDb();
    expect(mock.withTransactionAsync).toHaveBeenCalledTimes(1);
    // Two runAsync calls inside the tx: insert + update
    expect(mock.runAsync.mock.calls.length).toBe(2);
    expect(String(mock.runAsync.mock.calls[0]![0])).toMatch(/INSERT INTO amicus_messages/);
    expect(String(mock.runAsync.mock.calls[1]![0])).toMatch(/UPDATE amicus_threads/);
  });

  it('serializes citations and follow-ups to JSON', async () => {
    await appendAmicusMessage({
      messageId: 'm2',
      threadId: 't1',
      role: 'assistant',
      content: 'answer',
      citations: [{ chunk_id: 'c:1', source_type: 'section_panel', display_label: 'Calvin' }],
      followUps: ['follow-up 1'],
    });
    const [, bindings] = getMockUserDb().runAsync.mock.calls[0]!;
    expect(JSON.parse(bindings[4] as string)).toHaveLength(1);
    expect(JSON.parse(bindings[5] as string)).toEqual(['follow-up 1']);
  });
});

describe('updateThreadTitle', () => {
  it('issues UPDATE with the new title', async () => {
    await updateThreadTitle('t1', 'New title');
    const [sql, bindings] = getMockUserDb().runAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/UPDATE amicus_threads/);
    expect(bindings).toEqual(['New title', 't1']);
  });
});

describe('upsertAmicusThreadSummary', () => {
  it('upserts summary text and last user intent', async () => {
    await upsertAmicusThreadSummary({
      threadId: 't1',
      summaryText: 'Overview of Genesis 1.',
      lastUserIntent: 'Explain this chapter',
    });
    const [sql, bindings] = getMockUserDb().runAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/INSERT INTO amicus_thread_summaries/);
    expect(String(sql)).toMatch(/ON CONFLICT\(thread_id\) DO UPDATE/);
    expect(bindings).toEqual(['t1', 'Overview of Genesis 1.', 'Explain this chapter']);
  });
});

describe('upsertAmicusThreadContext', () => {
  it('upserts guided study context for a thread', async () => {
    await upsertAmicusThreadContext({
      threadId: 't1',
      entryPoint: 'guided_study',
      guidedSessionId: 14,
      guidedStep: 'synthesize',
      openQuestionId: 9,
      takeaway: 'Creation is ordered.',
      keyConnection: 'John 1',
    });
    const [sql, bindings] = getMockUserDb().runAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/INSERT INTO amicus_thread_context/);
    expect(String(sql)).toMatch(/ON CONFLICT\(thread_id\) DO UPDATE/);
    expect(bindings).toEqual([
      't1',
      'guided_study',
      14,
      'synthesize',
      9,
      'Creation is ordered.',
      'John 1',
    ]);
  });
});

describe('toggleThreadPin', () => {
  it('flips 0 → 1 and returns true', async () => {
    const mock = getMockUserDb();
    mock.getFirstAsync.mockResolvedValueOnce({ pinned: 0 });
    const result = await toggleThreadPin('t1');
    expect(result).toBe(true);
    const [sql, bindings] = mock.runAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/SET pinned = \?/);
    expect(bindings[0]).toBe(1);
  });

  it('flips 1 → 0 and returns false', async () => {
    const mock = getMockUserDb();
    mock.getFirstAsync.mockResolvedValueOnce({ pinned: 1 });
    const result = await toggleThreadPin('t1');
    expect(result).toBe(false);
  });

  it('returns false when the thread does not exist', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce(null);
    expect(await toggleThreadPin('missing')).toBe(false);
  });
});

describe('deleteAmicusThread', () => {
  it('clears thread context before deleting the thread', async () => {
    await deleteAmicusThread('t1');
    const sqls = getMockUserDb().runAsync.mock.calls.map((call: unknown[]) => String(call[0]));
    expect(sqls[0]).toMatch(/DELETE FROM amicus_thread_context/);
    expect(sqls[1]).toMatch(/DELETE FROM amicus_threads/);
  });
});

describe('clearAllAmicusData', () => {
  it('runs DELETE for all three tables inside a transaction', async () => {
    await clearAllAmicusData();
    const mock = getMockUserDb();
    expect(mock.withTransactionAsync).toHaveBeenCalledTimes(1);
    const sqls = mock.runAsync.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(sqls).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/DELETE FROM amicus_messages/),
        expect.stringMatching(/DELETE FROM amicus_thread_context/),
        expect.stringMatching(/DELETE FROM amicus_threads/),
        expect.stringMatching(/DELETE FROM amicus_usage/),
      ]),
    );
  });
});

describe('incrementAmicusUsage', () => {
  it('upserts today row', async () => {
    await incrementAmicusUsage();
    const [sql] = getMockUserDb().runAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/INSERT INTO amicus_usage/);
    expect(String(sql)).toMatch(/ON CONFLICT\(day\) DO UPDATE/);
  });
});
