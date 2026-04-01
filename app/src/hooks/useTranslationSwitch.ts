/**
 * hooks/useTranslationSwitch.ts — Handle translation changes with auto-download.
 *
 * When switching to a non-bundled translation that isn't installed yet,
 * this hook triggers a download first, then applies the change. If the
 * download fails it reverts to the previous translation.
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSettingsStore } from '../stores';
import { isBundled } from '../db/translationRegistry';
import { isTranslationInstalled, downloadTranslation } from '../db/translationManager';

export function useTranslationSwitch() {
  const setTranslation = useSettingsStore((s) => s.setTranslation);
  const [downloading, setDownloading] = useState(false);

  const switchTranslation = useCallback(async (translationId: string) => {
    // Bundled translations switch instantly
    if (isBundled(translationId)) {
      setTranslation(translationId);
      return;
    }

    // Check if already installed
    const installed = await isTranslationInstalled(translationId);
    if (installed) {
      setTranslation(translationId);
      return;
    }

    // Download first
    setDownloading(true);
    try {
      await downloadTranslation(translationId);
      setTranslation(translationId);
    } catch {
      Alert.alert('Download Failed', 'Could not download this translation. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [setTranslation]);

  return { switchTranslation, downloading };
}
