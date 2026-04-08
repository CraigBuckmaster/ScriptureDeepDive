/**
 * theme/breakpoints.ts — Responsive breakpoint constants and hook.
 *
 * Three device tiers:
 *   phone   — 0–767 px
 *   tablet  — 768–1023 px
 *   desktop — 1024+ px
 */

import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export interface BreakpointInfo {
  breakpoint: Breakpoint;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Returns the current device breakpoint tier based on window width.
 * Re-renders automatically on dimension changes (rotation, split-screen).
 */
export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= BREAKPOINTS.desktop
      ? 'desktop'
      : width >= BREAKPOINTS.tablet
        ? 'tablet'
        : 'phone';

  return {
    breakpoint,
    isPhone: breakpoint === 'phone',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    width,
    height,
  };
}
