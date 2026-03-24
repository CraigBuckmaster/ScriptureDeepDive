/**
 * services/notifications.ts — Push notification scheduling.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDb } from '../db/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('scripture-deep-dive', {
      name: 'Scripture Deep Dive',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

export async function scheduleDailyVerse(hour: number, minute: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  try {
    const verse = await getDb().getFirstAsync<{ book_id: string; chapter_num: number; verse_num: number; text: string }>(
      "SELECT * FROM verses WHERE translation='niv' ORDER BY RANDOM() LIMIT 1"
    );
    if (!verse) return;
    const body = verse.text.length > 150 ? verse.text.slice(0, 147) + '...' : verse.text;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Verse of the Day',
        body: `${body}\n— ${verse.book_id} ${verse.chapter_num}:${verse.verse_num}`,
        data: { type: 'daily_verse', bookId: verse.book_id, chapterNum: verse.chapter_num },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  } catch {}
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
