/**
 * hooks/useAvailableVoices.ts — List available TTS voices on the device.
 *
 * Uses expo-speech to enumerate system voices. On iOS this includes
 * enhanced/premium voices the user has downloaded in Settings > Accessibility.
 * On Android it uses Google TTS or Samsung TTS voices.
 */

import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
  quality: string;
}

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
          quality: (v as any).quality ?? 'Default',
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setVoices(english);
    }).catch(() => {});
  }, []);

  return voices;
}
