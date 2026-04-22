/**
 * Focused tests for the "future table" silencing in
 * `services/amicus/profile/signals.ts`.
 *
 * The getTopScholarsOpened / getJourneyState catch blocks used to
 * unconditionally call `logger.info` when the underlying table didn't
 * exist yet. Those tables are expected to be absent until their
 * migrations land, so the log fired on every `collectSignals()` call —
 * drowning real errors in expected noise on dev terminals and in
 * Sentry breadcrumbs. This test locks in the current behaviour:
 *
 *   - "no such table" errors: silent, return empty/default
 *   - any other SQL error: still surfaces via logger.info
 */

import { logger } from '@/utils/logger';
import { getTopScholarsOpened, getJourneyState } from '@/services/amicus/profile/signals';

// Mock the user-db accessor so we can throw from the getAllAsync/getFirstAsync
// calls that signals.ts makes — no real SQLite involved.
const mockGetAllAsync = jest.fn();
const mockGetFirstAsync = jest.fn();
jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
  }),
}));

describe('signals.ts — future-table silencing', () => {
  let infoSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGetAllAsync.mockReset();
    mockGetFirstAsync.mockReset();
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    infoSpy.mockRestore();
  });

  describe('getTopScholarsOpened (scholar_opens table)', () => {
    it('returns [] without logging when table does not exist', async () => {
      mockGetAllAsync.mockRejectedValueOnce(
        new Error("no such table: scholar_opens"),
      );
      const result = await getTopScholarsOpened(5);
      expect(result).toEqual([]);
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('still logs (and returns []) for unexpected errors', async () => {
      mockGetAllAsync.mockRejectedValueOnce(
        new Error('disk I/O error'),
      );
      const result = await getTopScholarsOpened(5);
      expect(result).toEqual([]);
      expect(infoSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = infoSpy.mock.calls[0] as [string, string];
      expect(tag).toBe('AmicusProfile');
      expect(msg).toMatch(/scholar_opens unavailable/);
      expect(msg).toMatch(/disk I\/O error/);
    });

    it('returns the real rows when the query succeeds', async () => {
      mockGetAllAsync.mockResolvedValueOnce([
        { scholar_id: 'wright', open_count: 7 },
        { scholar_id: 'sarna', open_count: 4 },
      ]);
      const result = await getTopScholarsOpened(5);
      expect(result).toEqual([
        { scholar_id: 'wright', open_count: 7 },
        { scholar_id: 'sarna', open_count: 4 },
      ]);
      expect(infoSpy).not.toHaveBeenCalled();
    });
  });

  describe('getJourneyState (journey_progress table)', () => {
    it('returns empty state without logging when table does not exist', async () => {
      // Failure mode in practice: getAllAsync throws; getFirstAsync
      // never gets a chance to run. Match that.
      mockGetAllAsync.mockRejectedValueOnce(
        new Error("no such table: journey_progress"),
      );
      const result = await getJourneyState();
      expect(result).toEqual({ completed: [], active: null });
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('still logs (and returns empty state) for unexpected errors', async () => {
      mockGetAllAsync.mockRejectedValueOnce(new Error('database is locked'));
      const result = await getJourneyState();
      expect(result).toEqual({ completed: [], active: null });
      expect(infoSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = infoSpy.mock.calls[0] as [string, string];
      expect(tag).toBe('AmicusProfile');
      expect(msg).toMatch(/journey_progress unavailable/);
      expect(msg).toMatch(/database is locked/);
    });

    it('returns the real state when both queries succeed', async () => {
      mockGetAllAsync.mockResolvedValueOnce([
        { journey_id: 'exodus-story' },
        { journey_id: 'psalms-week' },
      ]);
      mockGetFirstAsync.mockResolvedValueOnce({ journey_id: 'kings-arc' });
      const result = await getJourneyState();
      expect(result).toEqual({
        completed: ['exodus-story', 'psalms-week'],
        active: 'kings-arc',
      });
      expect(infoSpy).not.toHaveBeenCalled();
    });
  });

  it('matches the case-insensitive SQLite error message variant', async () => {
    // SQLite's exact message is lowercase ("no such table: X") but some
    // wrappers capitalise it. Sanity-check the regex is case-insensitive.
    mockGetAllAsync.mockRejectedValueOnce(
      new Error('No Such Table: scholar_opens'),
    );
    const result = await getTopScholarsOpened(5);
    expect(result).toEqual([]);
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
