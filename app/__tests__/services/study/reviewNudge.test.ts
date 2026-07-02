/**
 * #1841 — review-due nudge dedupe: at most one per calendar day, none
 * when the queue is empty, rhythm-tone copy.
 */
let mockExistingToday: { id: string } | null = null;
const mockGetFirstAsync = jest.fn(async () => mockExistingToday);
jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({ getFirstAsync: mockGetFirstAsync }),
}));

const mockInsertAppNotification = jest.fn().mockResolvedValue(undefined);
jest.mock('@/db/userMutations', () => ({
  insertAppNotification: (...args: unknown[]) => mockInsertAppNotification(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { maybeInsertReviewNudge, reviewNudgeBody } from '@/services/study';

beforeEach(() => {
  jest.clearAllMocks();
  mockExistingToday = null;
});

describe('reviewNudgeBody (#1841)', () => {
  it('uses the card copy with grammatical singular, no urgency words', () => {
    expect(reviewNudgeBody(3)).toBe('3 review prompts are ready when you are.');
    expect(reviewNudgeBody(1)).toBe('1 review prompt is ready when you are.');
    expect(reviewNudgeBody(3)).not.toMatch(/miss|overdue|streak|now!|hurry/i);
  });
});

describe('maybeInsertReviewNudge (#1841)', () => {
  it('inserts exactly one nudge with a deterministic per-day id', async () => {
    const inserted = await maybeInsertReviewNudge(3);
    expect(inserted).toBe(true);
    expect(mockInsertAppNotification).toHaveBeenCalledTimes(1);
    const args = mockInsertAppNotification.mock.calls[0][0];
    expect(args.type).toBe('review_due');
    expect(args.targetType).toBe('study_hub');
    expect(args.body).toBe('3 review prompts are ready when you are.');
    expect(args.id).toMatch(/^review_due_\d{4}-\d{2}-\d{2}$/);
  });

  it('does nothing when the queue is empty', async () => {
    expect(await maybeInsertReviewNudge(0)).toBe(false);
    expect(mockGetFirstAsync).not.toHaveBeenCalled();
    expect(mockInsertAppNotification).not.toHaveBeenCalled();
  });

  it('dedupes: a nudge already created today blocks a second one', async () => {
    mockExistingToday = { id: 'review_due_2026-07-02' };
    expect(await maybeInsertReviewNudge(5)).toBe(false);
    expect(mockInsertAppNotification).not.toHaveBeenCalled();
  });

  it('queries by type and calendar day before inserting', async () => {
    await maybeInsertReviewNudge(2);
    const [sql, params] = mockGetFirstAsync.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain("date(created_at) = date('now')");
    expect(params).toEqual(['review_due']);
  });

  it('swallows storage failures without throwing', async () => {
    mockGetFirstAsync.mockRejectedValueOnce(new Error('db closed'));
    await expect(maybeInsertReviewNudge(2)).resolves.toBe(false);
  });
});
