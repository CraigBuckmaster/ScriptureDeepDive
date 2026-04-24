/**
 * theme/index.ts — Unified theme re-exports and helper functions.
 *
 * Usage:
 *   import { useTheme, panels, getPanelColors, getScholarColor } from '@/theme';
 *   const { base } = useTheme();  // theme-aware colors
 */

export { panels, scholars, eras, eraNames, eraPillLabels, categoryColors, categories, severity, families, prophecyCategories, roles, testament, timelineSvg, churchEras, churchEraLabels } from './colors';
export type { PanelColors } from './colors';
export { fontFamily, typography, scaledTypography, buildTypography } from './typography';
export type { TypographyPreset, TypographyMap, BuiltTypography } from './typography';
export { useTypography } from './useTypography';
export { useOsFontScale } from './useOsFontScale';
export {
  READING_SCALE_DEFAULT,
  READING_SCALE_MIN,
  READING_SCALE_MAX,
  MAX_CONTENT_SCALE,
  MAX_CHROME_SCALE,
  clampReadingScale,
} from './scale';
export { spacing, radii, MIN_TOUCH_TARGET } from './spacing';
export { BREAKPOINTS, useBreakpoint } from './breakpoints';
export type { Breakpoint, BreakpointInfo } from './breakpoints';
export { FONT_MAP } from './fonts';

export { useTheme } from './ThemeContext';
export { ThemeProvider } from './ThemeProvider';
export type { ThemePalette, ThemeMode } from './palettes';

import { panels, scholars } from './colors';
import type { PanelColors } from './colors';

// ── Helpers ─────────────────────────────────────────────────────────

/** Default panel colors for unknown/scholar panel types. */
const FALLBACK_PANEL: PanelColors = panels.com;

/**
 * Get the {bg, border, accent} colors for any panel type.
 * Scholar commentary panels (mac, calvin, sarna, etc.) fall back to 'com' colors.
 */
export function getPanelColors(panelType: string): PanelColors {
  return panels[panelType] ?? FALLBACK_PANEL;
}

/**
 * Get the identity color for a scholar by ID.
 * Returns gold-dim as fallback for unknown scholars.
 */
export function getScholarColor(scholarId: string): string {
  return scholars[scholarId] ?? '#8a6e1a';
}
