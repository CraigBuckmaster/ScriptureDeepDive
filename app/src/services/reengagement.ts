/**
 * services/reengagement.ts — Win-back notifications for lapsed users.
 *
 * After 3 days of no chapter reads, schedules a "Continue your study"
 * notification. Uses a specific identifier to coexist with daily verse.
 */

import * as Notifications from 'expo-notifications';
import { getPreference, setPreference } from '../db/user';
import { logger } from '../utils/logger';

const REENGAGEMENT_ID = 'reengagement-nudge';
const LAPSE_THRESHOLD_DAYS = 3;

/**
 * Call after every chapter read to reset the lapse timer.
 */
export async function updateLastActive(): Promise<void> {
  await setPreference('last_active_date', new Date().toISOString().slice(0, 10));
}

/**
 * Check if the user has been inactive and schedule a nudge if so.
 * Call on app foreground (AppState 'active').
 */
export async function checkAndScheduleReengagement(): Promise<void> {
  try {
    const enabled = await getPreference('reengagement_enabled');
    if (enabled === '0') return;

    const lastActive = await getPreference('last_active_date');
    if (!lastActive) return; // Never read a chapter — don't nag

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSince < LAPSE_THRESHOLD_DAYS) return;

    // Cancel any existing re-engagement notification first
    await cancelReengagement();

    // Schedule for tomorrow morning at 9am
    await Notifications.scheduleNotificationAsync({
      identifier: REENGAGEMENT_ID,
      content: {
        title: 'Continue your study',
        body: 'Pick up where you left off — your reading is waiting.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 12, // 12 hours from now
      },
    });

    logger.info('reengagement', `Scheduled nudge (${daysSince} days inactive)`);
  } catch (err) {
    logger.warn('reengagement', 'Failed to schedule', err);
  }
}

/**
 * Cancel the re-engagement notification (e.g., when user reads a chapter).
 */
export async function cancelReengagement(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REENGAGEMENT_ID);
  } catch {
    // Notification may not exist — that's fine
  }
}
