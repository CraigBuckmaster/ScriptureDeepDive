/**
 * #1831 — weekly rhythm (services/study/rhythm). Derived only:
 * counts come straight from guided_study_sessions / guided_review_items.
 */
const mockGetAllAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({ getAllAsync: mockGetAllAsync }),
}));

import { getWeeklyRhythm, isoWeekKey, isoWeekStart, parseSqliteUtc } from '@/services/study';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isoWeekKey', () => {
  it('follows ISO-8601 week-year boundaries', () => {
    // 2026-01-01 is a Thursday → W01 of 2026.
    expect(isoWeekKey(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-W01');
    // 2025-12-29 (Mon) belongs to the same ISO week → 2026-W01.
    expect(isoWeekKey(new Date(Date.UTC(2025, 11, 29)))).toBe('2026-W01');
    // 2027-01-01 is a Friday whose week's Thursday is 2026-12-31 → 2026-W53.
    expect(isoWeekKey(new Date(Date.UTC(2027, 0, 1)))).toBe('2026-W53');
    expect(isoWeekKey(new Date(Date.UTC(2026, 6, 2)))).toBe('2026-W27');
  });
});

describe('isoWeekStart', () => {
  it('returns the Monday of the containing ISO week', () => {
    // 2026-07-02 is a Thursday; its week starts Monday 2026-06-29.
    expect(isoWeekStart(new Date(Date.UTC(2026, 6, 2))).toISOString().slice(0, 10)).toBe(
      '2026-06-29',
    );
    // A Monday maps to itself; a Sunday maps back six days.
    expect(isoWeekStart(new Date(Date.UTC(2026, 5, 29))).toISOString().slice(0, 10)).toBe(
      '2026-06-29',
    );
    expect(isoWeekStart(new Date(Date.UTC(2026, 6, 5))).toISOString().slice(0, 10)).toBe(
      '2026-06-29',
    );
  });
});

describe('parseSqliteUtc', () => {
  it('parses SQLite datetime strings as UTC and rejects garbage', () => {
    const parsed = parseSqliteUtc('2026-07-02 08:30:00');
    expect(parsed?.toISOString()).toBe('2026-07-02T08:30:00.000Z');
    expect(parseSqliteUtc('not a date')).toBeNull();
  });
});

describe('getWeeklyRhythm', () => {
  const NOW = new Date(Date.UTC(2026, 6, 2, 12, 0, 0)); // Thu 2026-07-02, week 2026-W27

  it('zero-fills the trailing window and buckets completions per ISO week', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce([
        // sessions
        { completed_at: '2026-07-01 09:00:00' }, // W27
        { completed_at: '2026-06-24 21:00:00' }, // W26
        { completed_at: '2026-06-23 07:15:00' }, // W26
      ])
      .mockResolvedValueOnce([
        // reviews
        { updated_at: '2026-06-29 06:00:00' }, // W27
        { updated_at: '2026-05-20 06:00:00' }, // W21 — inside a 8-week window
      ]);

    const rhythm = await getWeeklyRhythm(8, NOW);

    expect(rhythm).toHaveLength(8);
    expect(rhythm[0].week).toBe('2026-W20'); // oldest first
    expect(rhythm[7]).toEqual({
      week: '2026-W27',
      weekStart: '2026-06-29',
      sessions: 1,
      reviews: 1,
    });
    const w26 = rhythm.find((r) => r.week === '2026-W26');
    expect(w26).toMatchObject({ sessions: 2, reviews: 0 });
    const w21 = rhythm.find((r) => r.week === '2026-W21');
    expect(w21).toMatchObject({ sessions: 0, reviews: 1 });
    // Untouched weeks stay zero-filled.
    expect(rhythm.find((r) => r.week === '2026-W24')).toMatchObject({ sessions: 0, reviews: 0 });
  });

  it('ignores rows outside the window and unparseable timestamps', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce([
        { completed_at: '2020-01-01 00:00:00' }, // ancient — no bucket
        { completed_at: 'garbage' },
      ])
      .mockResolvedValueOnce([]);

    const rhythm = await getWeeklyRhythm(4, NOW);

    expect(rhythm).toHaveLength(4);
    expect(rhythm.every((r) => r.sessions === 0 && r.reviews === 0)).toBe(true);
  });

  it('queries only completed sessions and completed reviews', async () => {
    mockGetAllAsync.mockResolvedValue([]);
    await getWeeklyRhythm(8, NOW);

    const [sessionSql] = mockGetAllAsync.mock.calls[0];
    const [reviewSql] = mockGetAllAsync.mock.calls[1];
    expect(sessionSql).toContain('FROM guided_study_sessions');
    expect(sessionSql).toContain("status = 'completed'");
    expect(reviewSql).toContain('FROM guided_review_items');
    expect(reviewSql).toContain("status = 'completed'");
  });
});
