/**
 * Tests for Amicus read queries (#1457).
 */
import { getMockUserDb, resetMockUserDb } from '../../helpers/mockUserDb';

jest.mock('@/db/userDatabase', () =>
  require('../../helpers/mockUserDb').mockUserDatabaseModule(),
);
jest.mock('@/db/database', () =>
  require('../../helpers/mockDb').mockDatabaseModule(),
);

import {
  getAmicusThread,
  getAmicusUsageThisMonth,
  getAmicusUsageToday,
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
        created_at: '2026-04-17',
        last_message_at: '2026-04-17',
      },
      {
        thread_id: 'normal',
        title: 'Normal thread',
        chapter_ref: 'romans:9',
        pinned: 0,
        created_at: '2026-04-16',
        last_message_at: '2026-04-16',
      },
    ]);
    const threads = await listAmicusThreads();
    expect(threads).toHaveLength(2);
    expect(threads[0]!.pinned).toBe(true);
    expect(threads[1]!.pinned).toBe(false);
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
      created_at: 'x',
      last_message_at: 'x',
    });
    const t = await getAmicusThread('t1');
    expect(t?.pinned).toBe(true);
  });
});

describe('listAmicusMessages', () => {
  it('hydrates citations + follow-ups JSON', async () => {
    const citations = [
      { chunk_id: 'c:1', source_type: 'section_panel', display_label: 'Calvin' },
    ];
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
