/**
 * #1831 — progression helpers (services/study/progression).
 */
import type { StudyPlan, StudyPlanItem } from '@/types';

const mockGetStudyPlans = jest.fn();
const mockGetStudyPlanItems = jest.fn();
const mockGetGuidedStudySession = jest.fn();

jest.mock('@/db/userQueries', () => ({
  getStudyPlans: (...args: unknown[]) => mockGetStudyPlans(...args),
  getStudyPlanItems: (...args: unknown[]) => mockGetStudyPlanItems(...args),
  getGuidedStudySession: (...args: unknown[]) => mockGetGuidedStudySession(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { getActivePlan, getNextItem, percentComplete, resumeTarget } from '@/services/study';

function makePlan(id: string): StudyPlan {
  return {
    id,
    plan_type: 'book',
    source_id: 'genesis',
    title: 'Genesis',
    default_mode: 'quick',
    created_at: '2026-06-01 00:00:00',
    archived_at: null,
  };
}

function makeItem(
  planId: string,
  itemNum: number,
  overrides: Partial<StudyPlanItem> = {},
): StudyPlanItem {
  return {
    plan_id: planId,
    item_num: itemNum,
    kind: 'session',
    ref_json: JSON.stringify({ bookId: 'genesis', chapterNum: itemNum }),
    session_id: null,
    completed_at: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getActivePlan', () => {
  it('returns the newest plan that still has an incomplete item', async () => {
    mockGetStudyPlans.mockResolvedValue([makePlan('newest'), makePlan('older')]);
    mockGetStudyPlanItems.mockImplementation(async (planId: string) =>
      planId === 'newest'
        ? [makeItem('newest', 1, { completed_at: '2026-06-02 08:00:00' })] // fully done
        : [makeItem('older', 1)],
    );

    const active = await getActivePlan();
    expect(active?.id).toBe('older');
  });

  it('returns null when every plan is complete or there are no plans', async () => {
    mockGetStudyPlans.mockResolvedValue([makePlan('done')]);
    mockGetStudyPlanItems.mockResolvedValue([
      makeItem('done', 1, { completed_at: '2026-06-02 08:00:00' }),
    ]);
    expect(await getActivePlan()).toBeNull();

    mockGetStudyPlans.mockResolvedValue([]);
    expect(await getActivePlan()).toBeNull();
  });
});

describe('getNextItem', () => {
  it('returns the first incomplete item', async () => {
    mockGetStudyPlanItems.mockResolvedValue([
      makeItem('p', 1, { completed_at: '2026-06-02 08:00:00' }),
      makeItem('p', 2),
      makeItem('p', 3),
    ]);
    const next = await getNextItem('p');
    expect(next?.item_num).toBe(2);
  });

  it('returns null when the plan is complete or empty', async () => {
    mockGetStudyPlanItems.mockResolvedValue([
      makeItem('p', 1, { completed_at: '2026-06-02 08:00:00' }),
    ]);
    expect(await getNextItem('p')).toBeNull();

    mockGetStudyPlanItems.mockResolvedValue([]);
    expect(await getNextItem('p')).toBeNull();
  });
});

describe('percentComplete', () => {
  it('rounds to a whole percentage', async () => {
    mockGetStudyPlanItems.mockResolvedValue([
      makeItem('p', 1, { completed_at: 'x' }),
      makeItem('p', 2),
      makeItem('p', 3),
    ]);
    expect(await percentComplete('p')).toBe(33);
  });

  it('reads empty plans as 0 and finished plans as 100', async () => {
    mockGetStudyPlanItems.mockResolvedValue([]);
    expect(await percentComplete('p')).toBe(0);

    mockGetStudyPlanItems.mockResolvedValue([makeItem('p', 1, { completed_at: 'x' })]);
    expect(await percentComplete('p')).toBe(100);
  });
});

describe('resumeTarget', () => {
  it('returns the next item’s chapter without a step when no session is attached', async () => {
    mockGetStudyPlanItems.mockResolvedValue([makeItem('p', 5)]);
    expect(await resumeTarget('p')).toEqual({ bookId: 'genesis', chapterNum: 5 });
    expect(mockGetGuidedStudySession).not.toHaveBeenCalled();
  });

  it('includes the current step when the linked session is still active', async () => {
    mockGetStudyPlanItems.mockResolvedValue([makeItem('p', 2, { session_id: '42' })]);
    mockGetGuidedStudySession.mockResolvedValue({ id: 42, status: 'active', current_step: 'explore' });

    expect(await resumeTarget('p')).toEqual({
      bookId: 'genesis',
      chapterNum: 2,
      step: 'explore',
    });
    expect(mockGetGuidedStudySession).toHaveBeenCalledWith(42);
  });

  it('omits the step when the linked session is completed', async () => {
    mockGetStudyPlanItems.mockResolvedValue([makeItem('p', 2, { session_id: '42' })]);
    mockGetGuidedStudySession.mockResolvedValue({
      id: 42,
      status: 'completed',
      current_step: 'review',
    });
    expect(await resumeTarget('p')).toEqual({ bookId: 'genesis', chapterNum: 2 });
  });

  it('returns null for a finished plan or an unparseable ref', async () => {
    mockGetStudyPlanItems.mockResolvedValue([makeItem('p', 1, { completed_at: 'x' })]);
    expect(await resumeTarget('p')).toBeNull();

    mockGetStudyPlanItems.mockResolvedValue([makeItem('p', 1, { ref_json: '{broken' })]);
    expect(await resumeTarget('p')).toBeNull();
  });
});
