/**
 * utils/haptics.ts — Haptic feedback helpers.
 *
 * Light impact: panel toggle
 * Medium impact: bookmark toggle
 * Selection: translation toggle
 * Silently no-ops on Android or when haptics unavailable.
 */

import { Platform } from 'react-native';

let Haptics: typeof import('expo-haptics') | null = null;

async function loadHaptics() {
  if (Platform.OS !== 'ios') return;
  try {
    Haptics = await import('expo-haptics');
  } catch {}
}

loadHaptics();

export function lightImpact() {
  Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function mediumImpact() {
  Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function selectionFeedback() {
  Haptics?.selectionAsync().catch(() => {});
}
