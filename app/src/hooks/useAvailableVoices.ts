/**
 * hooks/useAvailableVoices.ts — List available TTS voices on the device.
 *
 * Uses expo-speech to enumerate system voices. On iOS this includes
 * enhanced/premium voices the user has downloaded in Settings > Accessibility.
 * On Android it uses Google TTS or Samsung TTS voices.
 */

import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { logger } from '../utils/logger';

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
  quality: string;
  recommended?: boolean;
}

/** Voices we recommend for scripture reading (if available on device). */
const RECOMMENDED_VOICES = new Set([
  'com.apple.voice.enhanced.en-US.Nathan',
  'com.apple.voice.enhanced.en-GB.Daniel',
  'com.apple.voice.enhanced.en-US.Samantha',
  'com.apple.voice.enhanced.en-US.Aaron',
]);

export function useAvailableVoices() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((raw) => {
      const english = raw
        .filter((v) => v.language.startsWith('en'))
        .map((v) => ({
          identifier: v.identifier,
          name: v.name ?? v.identifier,
          language: v.language,
          quality: (v as { quality?: string }).quality ?? 'Default',
          recommended: RECOMMENDED_VOICES.has(v.identifier),
        }))
        // Sort: recommended first, then alphabetical
        .sort((a, b) => {
          if (a.recommended && !b.recommended) return -1;
          if (!a.recommended && b.recommended) return 1;
          return a.name.localeCompare(b.name);
        });
      setVoices(english);
    }).catch((err) => { logger.warn('useAvailableVoices', 'Failed to load voices', err); });
  }, []);

  return voices;
}
