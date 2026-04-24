/**
 * Tests for Amicus read queries (#1457).
 */
import { getMockUserDb, resetMockUserDb } from '../../helpers/mockUserDb';

jest.mock('@/db/userDatabase', () => require('../../helpers/mockUserDb').mockUserDatabaseModule());
jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());

import {
  getAmicusThreadContext,
  getLatestAmicusThreadIdForChapterContext,
  getAmicusThreadIdForGuidedQuestion,
  getAmicusThreadIdForGuidedSession,
  getAmicusThread,
  getAmicusUsageThisMonth,
  getAmicusUsageToday,
  getGuidedStudyQuestionForSession,
  getLinkedGuidedStudyQuestionForThread,
  listAmicusMessages,
  listAmicusThreads,
} from '@/db/userQueries';

beforeEach(() => {
  resetMockUserDb();
});

describe('listAmicusThreads', () => {
  it('hydrates pinned boolean and orders pinned-first', async () => {
    const userDb = getMockUserDb();
    userDb.getAllAsync.mockResolvedValueOnce([
      {
        thread_id: 'pinned',
        title: 'Pinned thread',
        chapter_ref: null,
        pinned: 1,
        summary_text: 'Overview of Genesis 1.',
        last_user_intent: 'Explain this chapter',
        guided_step: 'synthesize',
        open_question_id: 4,
        guided_question_status: 'open',
        takeaway: null,
        key_connection: null,
        created_at: '2026-04-17',
        last_message_at: '2026-04-17',
      },
      {
        thread_id: 'normal',
        title: 'Normal thread',
        chapter_ref: 'romans/9',
        pinned: 0,
        summary_text: 'What does Romans 9 say about mercy?',
        last_user_intent: null,
        guided_step: null,
        open_question_id: null,
        guided_question_status: null,
        takeaway: null,
        key_connection: null,
        created_at: '2026-04-16',
        last_message_at: '2026-04-16',
      },
    ]);
    const threads = await listAmicusThreads();
    expect(threads).toHaveLength(2);
    expect(threads[0]!.pinned).toBe(true);
    expect(threads[0]!.summary_text).toBe('Overview of Genesis 1.');
    expect(threads[1]!.pinned).toBe(false);
    expect(threads[1]!.chapter_ref).toBe('romans/9');
    // Verify we called with DESC ordering in SQL
    const [sql] = userDb.getAllAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/pinned DESC/);
    expect(String(sql)).toMatch(/last_message_at DESC/);
  });
});

describe('getAmicusThread', () => {
  it('returns null when missing', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce(null);
    expect(await getAmicusThread('missing')).toBeNull();
  });

  it('hydrates pinned correctly', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      thread_id: 't1',
      title: 'T1',
      chapter_ref: null,
      pinned: 1,
      summary_text: 'Intro summary',
      last_user_intent: null,
      guided_step: null,
      open_question_id: null,
      guided_question_status: null,
      takeaway: null,
      key_connection: null,
      created_at: 'x',
      last_message_at: 'x',
    });
    const t = await getAmicusThread('t1');
    expect(t?.pinned).toBe(true);
    expect(t?.summary_text).toBe('Intro summary');
  });
});

describe('guided study thread queries', () => {
  it('loads persisted thread context', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      thread_id: 't1',
      entry_point: 'guided_study',
      guided_session_id: 7,
      guided_step: 'synthesize',
      open_question_id: 4,
      takeaway: 'Creation is ordered.',
      key_connection: 'John 1',
      created_at: 'x',
      updated_at: 'x',
    });
    const context = await getAmicusThreadContext('t1');
    expect(context?.entry_point).toBe('guided_study');
    expect(context?.guided_session_id).toBe(7);
    expect(context?.open_question_id).toBe(4);
  });

  it('looks up a linked guided-study question for a thread', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      id: 4,
      session_id: 7,
      chapter_id: 'genesis_1',
      question_text: 'Why is there repetition?',
      status: 'open',
      created_at: 'x',
      resolved_at: null,
      updated_at: 'x',
    });
    const question = await getLinkedGuidedStudyQuestionForThread('t1');
    expect(question?.question_text).toBe('Why is there repetition?');
  });

  it('finds an existing thread id for a guided question', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ thread_id: 't-linked' });
    await expect(getAmicusThreadIdForGuidedQuestion(9)).resolves.toBe('t-linked');
  });

  it('finds an existing thread id for a guided session', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ thread_id: 't-session' });
    await expect(getAmicusThreadIdForGuidedSession(12, 'synthesize')).resolves.toBe('t-session');
  });

  it('finds the latest thread id for a chapter context', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ thread_id: 't-chapter' });
    await expect(
      getLatestAmicusThreadIdForChapterContext('genesis/1', 'guided_study'),
    ).resolves.toBe('t-chapter');
  });

  it('loads a guided-study question by session id', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      id: 4,
      session_id: 7,
      chapter_id: 'genesis_1',
      question_text: 'Why is there repetition?',
      status: 'open',
      created_at: 'x',
      resolved_at: null,
      updated_at: 'x',
    });
    const question = await getGuidedStudyQuestionForSession(7);
    expect(question?.id).toBe(4);
  });
});

describe('listAmicusMessages', () => {
  it('hydrates citations + follow-ups JSON', async () => {
    const citations = [{ chunk_id: 'c:1', source_type: 'section_panel', display_label: 'Calvin' }];
    const followUps = ['What about faith?', 'Why Romans 9?'];
    getMockUserDb().getAllAsync.mockResolvedValueOnce([
      {
        message_id: 'm1',
        thread_id: 't1',
        role: 'assistant',
        content: 'Hello',
        citations_json: JSON.stringify(citations),
        follow_ups_json: JSON.stringify(followUps),
        created_at: 'x',
      },
    ]);
    const msgs = await listAmicusMessages('t1');
    expect(msgs[0]!.citations).toEqual(citations);
    expect(msgs[0]!.follow_ups).toEqual(followUps);
  });

  it('tolerates null/invalid JSON', async () => {
    getMockUserDb().getAllAsync.mockResolvedValueOnce([
      {
        message_id: 'm2',
        thread_id: 't1',
        role: 'user',
        content: 'Q?',
        citations_json: null,
        follow_ups_json: 'not-json',
        created_at: 'x',
      },
    ]);
    const msgs = await listAmicusMessages('t1');
    expect(msgs[0]!.citations).toEqual([]);
    expect(msgs[0]!.follow_ups).toEqual([]);
  });
});

describe('usage queries', () => {
  it('getAmicusUsageToday returns 0 when no row', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce(null);
    expect(await getAmicusUsageToday()).toBe(0);
  });

  it('getAmicusUsageToday returns the count', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ query_count: 17 });
    expect(await getAmicusUsageToday()).toBe(17);
  });

  it('getAmicusUsageThisMonth sums via SQL', async () => {
    const mock = getMockUserDb();
    mock.getFirstAsync.mockResolvedValueOnce({ total: 42 });
    expect(await getAmicusUsageThisMonth()).toBe(42);
    const [sql] = mock.getFirstAsync.mock.calls[0]!;
    expect(String(sql)).toMatch(/SUM\(query_count\)/);
    expect(String(sql)).toMatch(/strftime\('%Y-%m-01', 'now'\)/);
  });
});
