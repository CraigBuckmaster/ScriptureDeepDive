/**
 * #1835 — visited-trail persistence (markGuidedTrailItemVisited).
 * Exercises the real mutation against an in-memory fake of the
 * guided_study_sessions row so the acceptance criterion "visited
 * checks survive app kill + session resume" is backed by the actual
 * read-append-write path.
 */
interface FakeSessionRow {
  visited_trail_json: string | null;
}

let mockRow: FakeSessionRow | null;
const mockGetFirstAsync = jest.fn(async () => mockRow);
const mockRunAsync = jest.fn(async (_sql: string, params: unknown[]) => {
  if (mockRow) mockRow.visited_trail_json = params[0] as string;
  return { changes: 1 };
});
const mockWithTransactionAsync = jest
  .fn()
  .mockImplementation(async (cb: () => Promise<void>) => cb());

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getFirstAsync: mockGetFirstAsync,
    runAsync: mockRunAsync,
    withTransactionAsync: mockWithTransactionAsync,
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { markGuidedTrailItemVisited } from '@/db/userMutations';

beforeEach(() => {
  jest.clearAllMocks();
  mockRow = { visited_trail_json: null };
});

describe('markGuidedTrailItemVisited (#1835)', () => {
  it('appends the first key to an empty column', async () => {
    await markGuidedTrailItemVisited(7, 'trail-hist-1');
    expect(mockRow?.visited_trail_json).toBe(JSON.stringify(['trail-hist-1']));
  });

  it('accumulates keys across separate calls (persisted, not in-memory)', async () => {
    await markGuidedTrailItemVisited(7, 'a');
    await markGuidedTrailItemVisited(7, 'b');
    await markGuidedTrailItemVisited(7, 'c');
    expect(mockRow?.visited_trail_json).toBe(JSON.stringify(['a', 'b', 'c']));
  });

  it('is idempotent for an already-visited key', async () => {
    await markGuidedTrailItemVisited(7, 'a');
    const writesAfterFirst = mockRunAsync.mock.calls.length;
    await markGuidedTrailItemVisited(7, 'a');
    expect(mockRunAsync.mock.calls.length).toBe(writesAfterFirst);
    expect(mockRow?.visited_trail_json).toBe(JSON.stringify(['a']));
  });

  it('recovers from corrupted JSON by starting a fresh set', async () => {
    mockRow = { visited_trail_json: '{not-json' };
    await markGuidedTrailItemVisited(7, 'a');
    expect(mockRow.visited_trail_json).toBe(JSON.stringify(['a']));
  });

  it('does nothing when the session row is missing', async () => {
    mockRow = null;
    await markGuidedTrailItemVisited(999, 'a');
    expect(mockRunAsync).not.toHaveBeenCalled();
  });
});
