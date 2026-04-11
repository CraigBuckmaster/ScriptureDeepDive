/**
 * __tests__/services/notifications.test.ts
 *
 * Tests for the notifications service: permission requests,
 * daily verse scheduling, and cancellation.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Mock the database module
const mockGetFirstAsync = jest.fn();
jest.mock('@/db/database', () => ({
  getDb: () => ({ getFirstAsync: mockGetFirstAsync }),
}));

// Mock the icon asset require (used inside scheduleDailyVerse)
jest.mock('../../assets/images/icon-192.png', () => 'mock-icon');

import {
  requestPermission,
  scheduleDailyVerse,
  cancelAllNotifications,
} from '@/services/notifications';

describe('notifications service', () => {
  const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
  const mockSetChannel = Notifications.setNotificationChannelAsync as jest.Mock;
  const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
  const mockCancelAll = Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    (Platform as any).OS = 'ios';
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
    const sampleVerse = {
      book_id: 'GEN',
      chapter_num: 1,
      verse_num: 1,
      text: 'In the beginning God created the heaven and the earth.',
    };

    it('cancels existing notifications first', async () => {
      mockGetFirstAsync.mockResolvedValue(sampleVerse);
      await scheduleDailyVerse(8, 0);
      expect(mockCancelAll).toHaveBeenCalled();
    });

    it('schedules with correct hour and minute', async () => {
      mockGetFirstAsync.mockResolvedValue(sampleVerse);
      await scheduleDailyVerse(9, 30);
      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({ hour: 9, minute: 30 }),
        }),
      );
    });

    it('truncates long verse text at 147 chars with ellipsis', async () => {
      const longText = 'A'.repeat(200);
      mockGetFirstAsync.mockResolvedValue({
        ...sampleVerse,
        text: longText,
      });
      await scheduleDailyVerse(8, 0);

      const call = mockSchedule.mock.calls[0][0];
      const bodyText: string = call.content.body;
      // Body starts with truncated text (147 chars + '...')
      expect(bodyText.startsWith('A'.repeat(147) + '...')).toBe(true);
    });

    it('does not truncate short verse text', async () => {
      mockGetFirstAsync.mockResolvedValue(sampleVerse);
      await scheduleDailyVerse(8, 0);

      const call = mockSchedule.mock.calls[0][0];
      const bodyText: string = call.content.body;
      expect(bodyText).toContain(sampleVerse.text);
    });

    it('returns early when no verse found', async () => {
      mockGetFirstAsync.mockResolvedValue(null);
      await scheduleDailyVerse(8, 0);
      expect(mockSchedule).not.toHaveBeenCalled();
    });
  });

  // ── cancelAllNotifications ─────────────────────────────────────

  describe('cancelAllNotifications', () => {
    it('calls cancelAllScheduledNotificationsAsync', async () => {
      await cancelAllNotifications();
      expect(mockCancelAll).toHaveBeenCalled();
    });
  });
});
