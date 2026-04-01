/**
 * hooks/useStoreReview.ts — Prompt for App Store review after engagement threshold.
 *
 * Triggers after 3+ chapters read, once per app version.
 * Uses expo-store-review which is already bundled with Expo SDK 54.
 */

import { useCallback } from 'react';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import { getPreference, setPreference } from '../db/user';
import { getReadingStats } from '../db/user';
import { logger } from '../utils/logger';

const MIN_CHAPTERS = 3;

export function useStoreReview() {
  const checkAndPrompt = useCallback(async () => {
    try {
      const available = await StoreReview.isAvailableAsync();
      if (!available) return;

      const stats = await getReadingStats();
      if ((stats?.totalChapters ?? 0) < MIN_CHAPTERS) return;

      const currentVersion = Constants.expoConfig?.version ?? '1.0.0';
      const lastPrompted = await getPreference('store_review_last_version');
      if (lastPrompted === currentVersion) return;

      // Delay to not interrupt the reading experience
      setTimeout(async () => {
        try {
          await StoreReview.requestReview();
          await setPreference('store_review_last_version', currentVersion);
          logger.info('StoreReview', `Prompted for version ${currentVersion}`);
        } catch (err) {
          logger.warn('StoreReview', 'requestReview failed', err);
        }
      }, 2000);
    } catch (err) {
      logger.warn('StoreReview', 'checkAndPrompt failed', err);
    }
  }, []);

  return { checkAndPrompt };
}
