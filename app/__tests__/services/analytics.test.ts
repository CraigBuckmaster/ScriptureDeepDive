jest.unmock('@/services/analytics');

const mockRunAsync = jest.fn();
const mockGetAllAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    runAsync: mockRunAsync,
    getAllAsync: mockGetAllAsync,
  }),
}));

import { logEvent, pruneEvents, getEventCounts } from '@/services/analytics';

describe('analytics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunAsync.mockResolvedValue({ changes: 0 });
    mockGetAllAsync.mockResolvedValue([]);
  });

  describe('logEvent', () => {
    it('inserts event into the database', () => {
      logEvent('chapter_read', { book: 'genesis', chapter: '1' });

      expect(mockRunAsync).toHaveBeenCalledWith(
        'INSERT INTO analytics_events (event_name, params_json) VALUES (?, ?)',
        ['chapter_read', JSON.stringify({ book: 'genesis', chapter: '1' })],
      );
    });

    it('inserts null params_json when no params provided', () => {
      logEvent('app_open');

      expect(mockRunAsync).toHaveBeenCalledWith(
        'INSERT INTO analytics_events (event_name, params_json) VALUES (?, ?)',
        ['app_open', null],
      );
    });
  });

  describe('pruneEvents', () => {
    it('deletes events older than the specified number of days', async () => {
      mockRunAsync.mockResolvedValue({ changes: 5 });

      await pruneEvents(30);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM analytics_events'),
        [30],
      );
    });

    it('defaults to 90 days when no argument given', async () => {
      mockRunAsync.mockResolvedValue({ changes: 0 });

      await pruneEvents();

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM analytics_events'),
        [90],
      );
    });
  });

  describe('getEventCounts', () => {
    it('returns events grouped by name since given date', async () => {
      mockGetAllAsync.mockResolvedValue([
        { event_name: 'screen_view', count: 15 },
        { event_name: 'chapter_read', count: 8 },
      ]);

      const result = await getEventCounts('2026-01-01');

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY event_name'),
        ['2026-01-01'],
      );
      expect(result).toEqual([
        { event_name: 'screen_view', count: 15 },
        { event_name: 'chapter_read', count: 8 },
      ]);
    });
  });
});
