/**
 * utils/haptics.ts — Haptic feedback helpers.
 *
 * Light impact: panel toggle
 * Medium impact: bookmark toggle
 * Selection: translation toggle
 * Silently no-ops on Android or when haptics unavailable.
 */

import { Platform } from 'react-native';
import { logger } from './logger';

let Haptics: any = null;

async function loadHaptics() {
  if (Platform.OS !== 'ios') return;
  try {
    Haptics = await import('expo-haptics' as any);
  } catch (err) { logger.warn('haptics', 'Operation failed', err); }
}

loadHaptics();

export function lightImpact() {
  if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch((err: unknown) => { logger.warn('haptics', 'Light impact failed', err); });
}

export function mediumImpact() {
  if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((err: unknown) => { logger.warn('haptics', 'Medium impact failed', err); });
}

export function selectionFeedback() {
  if (Haptics) Haptics.selectionAsync().catch((err: unknown) => { logger.warn('haptics', 'Selection feedback failed', err); });
}
