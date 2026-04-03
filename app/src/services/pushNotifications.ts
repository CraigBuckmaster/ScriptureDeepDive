/**
 * services/pushNotifications.ts — Expo push notification registration.
 *
 * Requests push permissions, obtains an Expo push token, stores it
 * locally, and syncs to Supabase when available. Uses patterns from
 * the existing notifications.ts service.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSupabase } from '../lib/supabase';
import { setPreference, getPreference } from '../db/user';
import { logger } from '../utils/logger';

const PUSH_TOKEN_KEY = 'push_token';

/**
 * Register for push notifications. Returns the Expo push token string
 * or null if registration failed or permissions were denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.info('PushNotifications', 'Permission not granted');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Store locally
    await savePushTokenLocally(token);

    // Sync to Supabase (fire-and-forget)
    savePushToken(token).catch((err) => {
      logger.warn('PushNotifications', 'Failed to sync token to Supabase', err);
    });

    return token;
  } catch (err) {
    logger.warn('PushNotifications', 'Registration failed', err);
    return null;
  }
}

/**
 * Save the push token to the local user.db preferences.
 */
async function savePushTokenLocally(token: string): Promise<void> {
  await setPreference(PUSH_TOKEN_KEY, token);
}

/**
 * Sync push token to Supabase. Graceful if Supabase is unavailable.
 */
export async function savePushToken(token: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: user.id,
        token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' },
    );

    if (error) {
      logger.warn('PushNotifications', 'Failed to save token to Supabase', error);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get the locally stored push token, if any.
 */
export async function getStoredPushToken(): Promise<string | null> {
  return await getPreference(PUSH_TOKEN_KEY);
}
