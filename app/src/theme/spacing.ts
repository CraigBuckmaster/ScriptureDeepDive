/**
 * spacing.ts — Layout spacing, border radii, and accessibility constants.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/** Minimum touch target size per WCAG / Apple HIG (44pt). */
export const MIN_TOUCH_TARGET = 44;
