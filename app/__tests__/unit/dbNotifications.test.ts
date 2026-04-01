/**
 * Unit tests for services/notifications.ts — push notification scheduling.
 *
 * expo-notifications is already mocked in jest.setup.js.
 * We mock getDb() to control verse query results.
 */

// Extend the expo-notifications mock with enums the source code references
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import * as Notifications from 'expo-notifications';
import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  requestPermission,
  scheduleDailyVerse,
  cancelAllNotifications,
} from '@/services/notifications';

const mockDb = getMockDb();

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
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
  it('cancels existing notifications and schedules a new one with correct trigger', async () => {
    const fakeVerse = {
      book_id: 'psalms',
      chapter_num: 23,
      verse_num: 1,
      text: 'The Lord is my shepherd; I shall not want.',
    };
    mockDb.getFirstAsync.mockResolvedValueOnce(fakeVerse);

    await scheduleDailyVerse(8, 30);

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Verse of the Day',
          body: expect.stringContaining('The Lord is my shepherd'),
        }),
        trigger: expect.objectContaining({
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 30,
        }),
      }),
    );
  });

  it('does not schedule when no verse is found', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);

    await scheduleDailyVerse(9, 0);

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('truncates long verse text to 150 characters', async () => {
    const longText = 'A'.repeat(200);
    mockDb.getFirstAsync.mockResolvedValueOnce({
      book_id: 'genesis',
      chapter_num: 1,
      verse_num: 1,
      text: longText,
    });

    await scheduleDailyVerse(7, 0);

    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    // Body should start with truncated text (147 chars + '...')
    expect(call.content.body).toContain('...');
    expect(call.content.body.split('\n')[0].length).toBeLessThanOrEqual(150);
  });
});

describe('cancelAllNotifications', () => {
  it('calls cancelAllScheduledNotificationsAsync', async () => {
    await cancelAllNotifications();

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
