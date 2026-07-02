/**
 * #1833 — one-decision plan adoption (services/study/adoption).
 * Covers the card's required unit test (picker default-mode
 * resolution) plus startStudyPlan and the session-completion wiring.
 */
const mockGetPreference = jest.fn();
const mockCreateStudyPlan = jest.fn();
const mockLinkSessionToPlanItem = jest.fn().mockResolvedValue(undefined);
const mockCompleteStudyPlanItem = jest.fn().mockResolvedValue(undefined);
const mockGetStudyPlanItems = jest.fn();

jest.mock('@/db/userQueries', () => ({
  getPreference: (...args: unknown[]) => mockGetPreference(...args),
  getStudyPlanItems: (...args: unknown[]) => mockGetStudyPlanItems(...args),
  getGuidedStudySession: jest.fn(),
  getStudyPlans: jest.fn(),
}));

jest.mock('@/db/userMutations', () => ({
  createStudyPlan: (...args: unknown[]) => mockCreateStudyPlan(...args),
  linkSessionToPlanItem: (...args: unknown[]) => mockLinkSessionToPlanItem(...args),
  completeStudyPlanItem: (...args: unknown[]) => mockCompleteStudyPlanItem(...args),
}));

const mockGetBook = jest.fn();
jest.mock('@/db/content', () => ({
  getBook: (...args: unknown[]) => mockGetBook(...args),
}));
jest.mock('@/db/content/features', () => ({
  getJourneyStops: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/db/content/reference', () => ({
  getTopic: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  completePlanItemForSession,
  getDefaultStudyMode,
  resolveDefaultMode,
  startStudyPlan,
} from '@/services/study';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPreference.mockResolvedValue(null);
  mockCreateStudyPlan.mockResolvedValue('plan-xyz');
});

describe('resolveDefaultMode (#1833 acceptance: picker default-mode resolution)', () => {
  it('accepts every valid guided study mode', () => {
    expect(resolveDefaultMode('quick')).toBe('quick');
    expect(resolveDefaultMode('deep')).toBe('deep');
    expect(resolveDefaultMode('teaching')).toBe('teaching');
    expect(resolveDefaultMode('devotional')).toBe('devotional');
  });

  it("falls back to 'deep' for null, empty, and junk values", () => {
    expect(resolveDefaultMode(null)).toBe('deep');
    expect(resolveDefaultMode(undefined)).toBe('deep');
    expect(resolveDefaultMode('')).toBe('deep');
    expect(resolveDefaultMode('warp-speed')).toBe('deep');
  });
});

describe('getDefaultStudyMode', () => {
  it('reads the guided_study_last_mode preference', async () => {
    mockGetPreference.mockResolvedValue('quick');
    await expect(getDefaultStudyMode()).resolves.toBe('quick');
    expect(mockGetPreference).toHaveBeenCalledWith('guided_study_last_mode');
  });

  it("falls back to 'deep' when unset or the read throws", async () => {
    mockGetPreference.mockResolvedValue(null);
    await expect(getDefaultStudyMode()).resolves.toBe('deep');
    mockGetPreference.mockRejectedValue(new Error('db closed'));
    await expect(getDefaultStudyMode()).resolves.toBe('deep');
  });
});

describe('startStudyPlan', () => {
  it('creates a book plan with template items and the remembered mode', async () => {
    mockGetPreference.mockResolvedValue('devotional');
    mockGetBook.mockResolvedValue({ id: 'romans', total_chapters: 16 });

    const started = await startStudyPlan({
      planType: 'book',
      sourceId: 'romans',
      title: 'Romans',
    });

    expect(mockCreateStudyPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: 'book',
        sourceId: 'romans',
        title: 'Romans',
        defaultMode: 'devotional',
      }),
    );
    expect(mockCreateStudyPlan.mock.calls[0][0].items).toHaveLength(16);
    expect(started).toEqual({
      planId: 'plan-xyz',
      mode: 'devotional',
      firstRef: { bookId: 'romans', chapterNum: 1 },
    });
  });

  it('returns null (and creates nothing) when the source has no items', async () => {
    mockGetBook.mockResolvedValue(null);
    const started = await startStudyPlan({
      planType: 'book',
      sourceId: 'atlantis',
      title: 'Atlantis',
    });
    expect(started).toBeNull();
    expect(mockCreateStudyPlan).not.toHaveBeenCalled();
  });
});

describe('completePlanItemForSession', () => {
  const items = (completedFirst: boolean) => [
    {
      plan_id: 'p',
      item_num: 1,
      kind: 'session',
      ref_json: JSON.stringify({ bookId: 'romans', chapterNum: 1 }),
      session_id: null,
      completed_at: completedFirst ? 'x' : null,
    },
    {
      plan_id: 'p',
      item_num: 2,
      kind: 'session',
      ref_json: JSON.stringify({ bookId: 'romans', chapterNum: 2 }),
      session_id: null,
      completed_at: null,
    },
  ];

  it('links and completes the next item when the chapter matches', async () => {
    mockGetStudyPlanItems.mockResolvedValue(items(true)); // next = item 2
    await completePlanItemForSession('p', 'romans', 2, 42);
    expect(mockLinkSessionToPlanItem).toHaveBeenCalledWith('p', 2, 42);
    expect(mockCompleteStudyPlanItem).toHaveBeenCalledWith('p', 2);
  });

  it('does nothing when the session chapter is not the next item', async () => {
    mockGetStudyPlanItems.mockResolvedValue(items(false)); // next = item 1 (romans 1)
    await completePlanItemForSession('p', 'romans', 9, 42);
    expect(mockLinkSessionToPlanItem).not.toHaveBeenCalled();
    expect(mockCompleteStudyPlanItem).not.toHaveBeenCalled();
  });

  it('does nothing when the plan is already complete', async () => {
    mockGetStudyPlanItems.mockResolvedValue([]);
    await completePlanItemForSession('p', 'romans', 1, 42);
    expect(mockLinkSessionToPlanItem).not.toHaveBeenCalled();
  });
});
