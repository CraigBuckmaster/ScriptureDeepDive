/**
 * __tests__/services/notifications.test.ts
 *
 * Tests for the notifications service: permission requests,
 * daily verse scheduling (rolling CALENDAR-triggered window),
 * and scoped cancellation.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Mock the user-preferences DB layer (replaces old getDb mock)
jest.mock('@/db/user', () => ({
  setPreference: jest.fn().mockResolvedValue(undefined),
  getPreference: jest.fn().mockResolvedValue(null),
}));

// Mock the verse-of-day module so we control what verse is returned
jest.mock('@/utils/verseOfDay', () => ({
  getVerseForDate: jest.fn(),
}));

// Mock the icon asset require (used inside scheduleDailyVerse)
jest.mock('../../assets/images/icon-192.png', () => 'mock-icon');

import {
  requestPermission,
  scheduleDailyVerse,
  cancelAllNotifications,
} from '@/services/notifications';
import { setPreference } from '@/db/user';
import { getVerseForDate } from '@/utils/verseOfDay';

const sampleVerse = {
  ref: 'Genesis 1:1',
  bookId: 'genesis',
  chapter: 1,
  verseNum: 1,
  text: 'In the beginning God created the heavens and the earth.',
};

describe('notifications service', () => {
  const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
  const mockSetChannel = Notifications.setNotificationChannelAsync as jest.Mock;
  const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
  const mockGetAll = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
  const mockCancelOne = Notifications.cancelScheduledNotificationAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Set a deterministic "now": 2026-01-15 at 00:00 local time
    jest.setSystemTime(new Date(2026, 0, 15, 0, 0, 0));
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetAll.mockResolvedValue([]);
    (getVerseForDate as jest.Mock).mockReturnValue(sampleVerse);
    (Platform as any).OS = 'ios';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── requestPermission ──────────────────────────────────────────

  describe('requestPermission', () => {
    it('returns true when status is granted', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' });
      const result = await requestPermission();
      expect(result).toBe(true);
    });

    it('returns false when status is denied', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'denied' });
      const result = await requestPermission();
      expect(result).toBe(false);
    });

    it('sets Android notification channel on Android', async () => {
      (Platform as any).OS = 'android';
      mockRequestPermissions.mockResolvedValue({ status: 'granted' });
      await requestPermission();
      expect(mockSetChannel).toHaveBeenCalledWith('companion-study', {
        name: 'Companion Study',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    });

    it('does not set notification channel on iOS', async () => {
      (Platform as any).OS = 'ios';
      mockRequestPermissions.mockResolvedValue({ status: 'granted' });
      await requestPermission();
      expect(mockSetChannel).not.toHaveBeenCalled();
    });
  });

  // ── scheduleDailyVerse ─────────────────────────────────────────

  describe('scheduleDailyVerse', () => {
    it('cancels existing VOTD notifications before scheduling', async () => {
      mockGetAll.mockResolvedValue([
        { identifier: 'votd-2026-01-10' },
        { identifier: 'reengagement-nudge' },
        { identifier: 'votd-2026-01-11' },
      ]);
      await scheduleDailyVerse(8, 0);

      // Only the votd-* notifications should be cancelled
      expect(mockCancelOne).toHaveBeenCalledWith('votd-2026-01-10');
      expect(mockCancelOne).toHaveBeenCalledWith('votd-2026-01-11');
      expect(mockCancelOne).not.toHaveBeenCalledWith('reengagement-nudge');
    });

    it('schedules with correct hour and minute', async () => {
      await scheduleDailyVerse(9, 30);

      expect(mockSchedule).toHaveBeenCalled();
      const firstCall = mockSchedule.mock.calls[0][0];
      expect(firstCall.trigger).toMatchObject({
        hour: 9,
        minute: 30,
        second: 0,
        repeats: false,
      });
    });

    it('truncates long verse text at 147 chars with ellipsis', async () => {
      const longText = 'A'.repeat(200);
      (getVerseForDate as jest.Mock).mockReturnValue({ ...sampleVerse, text: longText });

      await scheduleDailyVerse(8, 0);

      const call = mockSchedule.mock.calls[0][0];
      const bodyFirstLine: string = call.content.body.split('\n')[0];
      // buildBody: slice(0, 150-3) + '...' = 147 A's + '...' = 150 chars
      expect(bodyFirstLine).toBe('A'.repeat(147) + '...');
    });

    it('does not truncate short verse text', async () => {
      await scheduleDailyVerse(8, 0);

      const call = mockSchedule.mock.calls[0][0];
      expect(call.content.body).toContain(sampleVerse.text);
    });

    it('includes verseNum in notification data payload', async () => {
      await scheduleDailyVerse(8, 0);

      const call = mockSchedule.mock.calls[0][0];
      expect(call.content.data).toMatchObject({
        type: 'daily_verse',
        bookId: 'genesis',
        chapterNum: 1,
        verseNum: 1,
      });
    });
  });

  // ── cancelAllNotifications ─────────────────────────────────────

  describe('cancelAllNotifications', () => {
    it('cancels scoped VOTD notifications and clears last-scheduled preference', async () => {
      mockGetAll.mockResolvedValue([
        { identifier: 'votd-2026-01-15' },
        { identifier: 'reengagement-nudge' },
      ]);
      await cancelAllNotifications();

      expect(mockCancelOne).toHaveBeenCalledWith('votd-2026-01-15');
      expect(mockCancelOne).not.toHaveBeenCalledWith('reengagement-nudge');
      expect(setPreference).toHaveBeenCalledWith('votd_last_scheduled_date', '');
    });
  });
});
