/**
 * hooks/usePushNotifications.ts — Registers for push notifications on mount.
 *
 * Returns the current push token and registration status.
 */

import { useState, useEffect } from 'react';
import {
  registerForPushNotifications,
  getStoredPushToken,
} from '../services/pushNotifications';
import { logger } from '../utils/logger';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      try {
        // Check if we already have a stored token
        const existing = await getStoredPushToken();
        if (existing && !cancelled) {
          setToken(existing);
          setIsRegistered(true);
          return;
        }

        // Register for push notifications
        const newToken = await registerForPushNotifications();
        if (cancelled) return;

        if (newToken) {
          setToken(newToken);
          setIsRegistered(true);
        }
      } catch (err) {
        logger.warn('usePushNotifications', 'Registration failed', err);
      }
    }

    register();
    return () => { cancelled = true; };
  }, []);

  return { token, isRegistered };
}
