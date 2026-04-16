/**
 * services/notifications.ts — Daily Verse push notification scheduling.
 *
 * Why this is shaped the way it is:
 *
 *   iOS freezes scheduled local-notification content at the moment you schedule
 *   it. A single DAILY trigger would show the *same* verse forever until the
 *   user happened to reschedule. To keep the notification aligned with the
 *   homepage Verse of the Day (which is deterministic per calendar date), we
 *   pre-schedule a rolling window of N calendar-triggered notifications, each
 *   with the correct verse for its date baked in.
 *
 *   iOS caps scheduled local notifications at 64 per app. We schedule up to
 *   60 to leave headroom for the re-engagement nudge and any future slots.
 *
 * Cancellation is SCOPED to our own identifiers (`votd-YYYY-MM-DD`) so we
 * do not wipe the reengagement-nudge notification managed elsewhere.
 *
 * Rescheduling is cheap on steady-state: the app calls rescheduleIfStale()
 * on foreground, which no-ops unless the last schedule was more than a day
 * ago (or settings changed).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getPreference, setPreference } from '../db/user';
import { getVerseForDate, type VerseOfDay } from '../utils/verseOfDay';
import { logger } from '../utils/logger';

// ── Tuning constants ──────────────────────────────────────────────

/**
 * Number of future days to pre-schedule. iOS allows 64 pending local
 * notifications per app; we leave headroom for reengagement (1 slot) and
 * any future scheduled features.
 */
const SCHEDULE_DAYS = 60;

/** Max body length before we ellipsize. Conservative for cross-platform. */
const MAX_BODY_LENGTH = 150;

/** Prefix used for every VOTD notification identifier: `votd-YYYY-MM-DD`. */
const VOTD_ID_PREFIX = 'votd-';

// ── Preference keys (single place, not scattered string literals) ──

const PREF_GRANTED = 'notifications_granted';
const PREF_ENABLED = 'daily_verse_enabled';
const PREF_HOUR = 'notification_hour';
const PREF_MINUTE = 'notification_minute';
const PREF_LAST_SCHEDULED = 'votd_last_scheduled_date';   // YYYY-MM-DD of last schedule run

// ── Notification handler (foreground presentation) ─────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any),
});

// ── Permissions ────────────────────────────────────────────────────

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('companion-study', {
      name: 'Companion Study',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

// ── Helpers ────────────────────────────────────────────────────────

/** ISO date key for a Date (local), used in identifiers + last-scheduled pref. */
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function idForDate(date: Date): string {
  return `${VOTD_ID_PREFIX}${dateKey(date)}`;
}

/** Strip leading/trailing whitespace + ellipsize for the notification body. */
function buildBody(verse: VerseOfDay): string {
  const clean = verse.text.trim();
  if (clean.length <= MAX_BODY_LENGTH) return clean;
  return clean.slice(0, MAX_BODY_LENGTH - 3).trimEnd() + '...';
}

/**
 * Cancel every pending notification whose identifier starts with our prefix.
 * Scoped so it does not touch reengagement-nudge or any future unrelated IDs.
 */
async function cancelScheduledVotd(): Promise<void> {
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pending
        .filter((n) => typeof n.identifier === 'string' && n.identifier.startsWith(VOTD_ID_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch (err) {
    logger.warn('notifications', 'Failed to cancel scoped VOTD notifications', err);
  }
}

/**
 * Produce the trigger Date for day `offset` from today at the user's chosen
 * (hour, minute). Offset 0 = today if that time hasn't yet passed, else skipped
 * (caller handles the skip).
 */
function triggerDate(now: Date, offsetDays: number, hour: number, minute: number): Date {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, hour, minute, 0, 0);
  return t;
}

// ── Core scheduler ─────────────────────────────────────────────────

/**
 * Pre-schedule a rolling window of daily verse notifications, each containing
 * the correct verse for its date per `getVerseForDate`.
 *
 * Idempotent: cancels our existing VOTD slots and re-creates them.
 */
export async function scheduleDailyVerse(hour: number, minute: number): Promise<void> {
  try {
    // Persist the user's choice — NotificationSettings already does this, but
    // keep scheduleDailyVerse safe to call in isolation (e.g. foreground reschedule).
    await setPreference(PREF_HOUR, String(hour));
    await setPreference(PREF_MINUTE, String(minute));

    await cancelScheduledVotd();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const iconAsset = require('../../assets/images/icon-192.png');
    const now = new Date();

    let scheduledCount = 0;
    for (let offset = 0; offset < SCHEDULE_DAYS; offset++) {
      const fireAt = triggerDate(now, offset, hour, minute);

      // Skip any target in the past (e.g. it's 8am, user picked 7am → today is already gone).
      if (fireAt.getTime() <= now.getTime()) continue;

      const verse = getVerseForDate(fireAt);
      const body = `${buildBody(verse)}\n— ${verse.ref}`;

      await Notifications.scheduleNotificationAsync({
        identifier: idForDate(fireAt),
        content: {
          title: 'Verse of the Day',
          body,
          data: {
            type: 'daily_verse',
            bookId: verse.bookId,
            chapterNum: verse.chapter,
            verseNum: verse.verseNum,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(Platform.OS === 'android' ? { icon: iconAsset } : {}) as any,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          year: fireAt.getFullYear(),
          month: fireAt.getMonth() + 1, // CALENDAR trigger uses 1-indexed months
          day: fireAt.getDate(),
          hour: fireAt.getHours(),
          minute: fireAt.getMinutes(),
          second: 0,
          repeats: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });

      scheduledCount++;
    }

    await setPreference(PREF_LAST_SCHEDULED, dateKey(now));
    logger.info('notifications', `Scheduled ${scheduledCount} daily verse notifications`);
  } catch (err) {
    logger.warn('notifications', 'scheduleDailyVerse failed', err);
  }
}

/**
 * Foreground hook — call from AppState 'active'. If the user has daily
 * verses enabled and our last schedule run is stale (different calendar day),
 * re-run scheduleDailyVerse so the rolling window always covers the next
 * ~60 days and always reflects today's selection algorithm.
 */
export async function rescheduleIfStale(): Promise<void> {
  try {
    const enabled = await getPreference(PREF_ENABLED);
    const granted = await getPreference(PREF_GRANTED);
    if (enabled !== '1' || granted !== '1') return;

    const last = await getPreference(PREF_LAST_SCHEDULED);
    const today = dateKey(new Date());
    if (last === today) return; // already rescheduled today

    const hour = parseInt((await getPreference(PREF_HOUR)) ?? '7', 10);
    const minute = parseInt((await getPreference(PREF_MINUTE)) ?? '0', 10);
    const safeHour = isNaN(hour) || hour < 0 || hour > 23 ? 7 : hour;
    const safeMinute = isNaN(minute) || minute < 0 || minute > 59 ? 0 : minute;

    await scheduleDailyVerse(safeHour, safeMinute);
  } catch (err) {
    logger.warn('notifications', 'rescheduleIfStale failed', err);
  }
}

/**
 * Cancel ALL daily verse notifications (scoped — reengagement untouched).
 * Called when the user toggles the Daily Verse setting off.
 */
export async function cancelAllNotifications(): Promise<void> {
  await cancelScheduledVotd();
  await setPreference(PREF_LAST_SCHEDULED, '');
}
