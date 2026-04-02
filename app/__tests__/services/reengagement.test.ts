jest.unmock('@/services/reengagement');

const mockGetPreference = jest.fn();
const mockSetPreference = jest.fn();

jest.mock('@/db/user', () => ({
  getPreference: (...args: any[]) => mockGetPreference(...args),
  setPreference: (...args: any[]) => mockSetPreference(...args),
}));

const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: (...args: any[]) => mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: any[]) => mockCancelScheduledNotificationAsync(...args),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

import {
  updateLastActive,
  checkAndScheduleReengagement,
  cancelReengagement,
} from '@/services/reengagement';

describe('reengagement service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPreference.mockResolvedValue(null);
    mockSetPreference.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue(undefined);
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  describe('updateLastActive', () => {
    it('saves today\'s date as last_active_date', async () => {
      await updateLastActive();

      expect(mockSetPreference).toHaveBeenCalledWith(
        'last_active_date',
        new Date().toISOString().slice(0, 10),
      );
    });
  });

  describe('checkAndScheduleReengagement', () => {
    it('skips scheduling when reengagement_enabled is "0"', async () => {
      mockGetPreference.mockImplementation((key: string) => {
        if (key === 'reengagement_enabled') return Promise.resolve('0');
        return Promise.resolve(null);
      });

      await checkAndScheduleReengagement();

      expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('does not schedule when user has never read a chapter', async () => {
      mockGetPreference.mockImplementation((key: string) => {
        if (key === 'reengagement_enabled') return Promise.resolve(null);
        if (key === 'last_active_date') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      await checkAndScheduleReengagement();

      expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('schedules notification when user has been inactive 3+ days', async () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      mockGetPreference.mockImplementation((key: string) => {
        if (key === 'reengagement_enabled') return Promise.resolve(null);
        if (key === 'last_active_date') return Promise.resolve(fourDaysAgo);
        return Promise.resolve(null);
      });

      await checkAndScheduleReengagement();

      expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('reengagement-nudge');
      expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'reengagement-nudge',
          content: expect.objectContaining({
            title: 'Continue your study',
          }),
        }),
      );
    });

    it('does not schedule when user was active recently', async () => {
      const today = new Date().toISOString().slice(0, 10);

      mockGetPreference.mockImplementation((key: string) => {
        if (key === 'reengagement_enabled') return Promise.resolve(null);
        if (key === 'last_active_date') return Promise.resolve(today);
        return Promise.resolve(null);
      });

      await checkAndScheduleReengagement();

      expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('cancelReengagement', () => {
    it('cancels the reengagement notification by identifier', async () => {
      await cancelReengagement();

      expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('reengagement-nudge');
    });
  });
});
