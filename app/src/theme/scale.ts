/**
 * theme/scale.ts — Typography scaling constants and helpers.
 *
 * The app separates user-controlled reading scale (applied to verse text
 * and commentary bodies) from OS-only chrome scale (applied to buttons,
 * chips, tab labels). See epic #1639 for the architecture.
 */

export const READING_SCALE_DEFAULT = 1.0;
export const READING_SCALE_MIN = 0.85;
export const READING_SCALE_MAX = 1.60;

/** Combined (os × reading) content cap — prevents layouts from breaking. */
export const MAX_CONTENT_SCALE = 2.2;
/** OS-only chrome cap — keeps buttons/chips/tab labels usable. */
export const MAX_CHROME_SCALE = 1.8;

/**
 * Clamp an arbitrary number to the valid reading-scale range. Non-finite
 * inputs (NaN, Infinity) fall back to the default (1.0).
 */
export function clampReadingScale(n: number): number {
  if (!Number.isFinite(n)) return READING_SCALE_DEFAULT;
  return Math.min(READING_SCALE_MAX, Math.max(READING_SCALE_MIN, n));
}
