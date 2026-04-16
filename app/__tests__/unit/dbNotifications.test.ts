/**
 * Unit tests for services/notifications.ts — daily verse notification scheduling.
 *
 * expo-notifications is mocked with the functions the rewritten service uses
 * (CALENDAR triggers, scoped cancellation, getAllScheduled).
 * The verse source is now getVerseForDate (pure, no DB), so we mock that.
 */

// Extend the expo-notifications mock with enums + scoped-cancellation APIs
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily', CALENDAR: 'calendar' },
  AndroidImportance: { DEFAULT: 3 },
}));

// Mock user preferences DB layer (setPreference / getPreference)
jest.mock('@/db/user', () => ({
  setPreference: jest.fn().mockResolvedValue(undefined),
  getPreference: jest.fn().mockResolvedValue(null),
}));

// Mock the verse-of-day module so we control what verse is returned
jest.mock('@/utils/verseOfDay', () => ({
  getVerseForDate: jest.fn(),
}));

import * as Notifications from 'expo-notifications';
import {
  requestPermission,
  scheduleDailyVerse,
  cancelAllNotifications,
} from '@/services/notifications';
import { setPreference } from '@/db/user';
import { getVerseForDate } from '@/utils/verseOfDay';

const sampleVerse = {
  ref: 'Psalm 23:1',
  bookId: 'psalms',
  chapter: 23,
  verseNum: 1,
  text: 'The Lord is my shepherd; I shall not want.',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  // Set a deterministic "now": 2026-01-15 at 00:00 local time
  jest.setSystemTime(new Date(2026, 0, 15, 0, 0, 0));
  (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
  (getVerseForDate as jest.Mock).mockReturnValue(sampleVerse);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('requestPermission', () => {
  it('returns true when permission status is granted', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });

    const result = await requestPermission();

    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('returns false when permission status is denied', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    const result = await requestPermission();

    expect(result).toBe(false);
  });
});

describe('scheduleDailyVerse', () => {
  it('cancels existing VOTD notifications and schedules with CALENDAR triggers', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      { identifier: 'votd-2026-01-10' },
      { identifier: 'reengagement-nudge' },
    ]);

    await scheduleDailyVerse(8, 30);

    // Scoped cancel: only votd-* identifiers
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('votd-2026-01-10');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('reengagement-nudge');

    // Should have scheduled notifications with CALENDAR triggers
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    const firstCall = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(firstCall.content).toMatchObject({
      title: 'Verse of the Day',
      body: expect.stringContaining('The Lord is my shepherd'),
    });
    expect(firstCall.trigger).toMatchObject({
      hour: 8,
      minute: 30,
    });
  });

  it('includes verseNum in notification data payload', async () => {
    await scheduleDailyVerse(9, 0);

    const firstCall = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(firstCall.content.data).toMatchObject({
      type: 'daily_verse',
      bookId: 'psalms',
      chapterNum: 23,
      verseNum: 1,
    });
  });

  it('truncates long verse text to 150 characters', async () => {
    const longText = 'A'.repeat(200);
    (getVerseForDate as jest.Mock).mockReturnValue({
      ...sampleVerse,
      text: longText,
    });

    await scheduleDailyVerse(7, 0);

    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    const bodyFirstLine = call.content.body.split('\n')[0];
    // buildBody: slice(0, 150-3) + '...' = 147 A's + '...' = 150 chars
    expect(call.content.body).toContain('...');
    expect(bodyFirstLine.length).toBeLessThanOrEqual(150);
  });
});

describe('cancelAllNotifications', () => {
  it('cancels scoped VOTD notifications and clears preference', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      { identifier: 'votd-2026-01-15' },
    ]);

    await cancelAllNotifications();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('votd-2026-01-15');
    expect(setPreference).toHaveBeenCalledWith('votd_last_scheduled_date', '');
  });
});
