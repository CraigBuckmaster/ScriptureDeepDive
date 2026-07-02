/**
 * #1842 — deferred-trail persistence: write/clear the v26 column and
 * read the prior plan session's deferrals through the progression
 * service.
 */
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 1 });
let mockDeferredRow: { deferred_trail_json: string | null } | null = null;
const mockGetFirstAsync = jest.fn(async () => mockDeferredRow);

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    runAsync: mockRunAsync,
    getFirstAsync: mockGetFirstAsync,
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { setGuidedDeferredTrail } from '@/db/userMutations';
import { getPriorDeferredTrail } from '@/services/study';

beforeEach(() => {
  jest.clearAllMocks();
  mockDeferredRow = null;
});

describe('setGuidedDeferredTrail (#1842)', () => {
  it('writes the keys as JSON', async () => {
    await setGuidedDeferredTrail(7, ['language:a', 'debate:b']);
    const [sql, params] = mockRunAsync.mock.calls[0];
    expect(sql).toContain('deferred_trail_json');
    expect(params).toEqual([JSON.stringify(['language:a', 'debate:b']), 7]);
  });

  it('clears the column when the list is empty (back to Full)', async () => {
    await setGuidedDeferredTrail(7, []);
    expect(mockRunAsync.mock.calls[0][1]).toEqual([null, 7]);
  });
});

describe('getPriorDeferredTrail (#1842)', () => {
  it('parses the most recent other session’s deferred keys', async () => {
    mockDeferredRow = { deferred_trail_json: JSON.stringify(['scripture:x']) };
    await expect(getPriorDeferredTrail('plan-1', 9)).resolves.toEqual(['scripture:x']);
    const [sql, params] = mockGetFirstAsync.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('plan_id = ? AND id != ?');
    expect(params).toEqual(['plan-1', 9]);
  });

  it('returns [] when nothing was deferred or the JSON is unreadable', async () => {
    await expect(getPriorDeferredTrail('plan-1', 9)).resolves.toEqual([]);
    mockDeferredRow = { deferred_trail_json: '{broken' };
    await expect(getPriorDeferredTrail('plan-1', 9)).resolves.toEqual([]);
  });
});
