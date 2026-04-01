/**
 * theme/index.ts — Unified theme re-exports and helper functions.
 *
 * Usage:
 *   import { base, panels, getPanelColors, getScholarColor } from '@/theme';
 */

export { base, panels, scholars, eras, eraNames, eraPillLabels, categoryColors, categories, severity, families, prophecyCategories, roles, testament, timelineSvg } from './colors';
export type { PanelColors } from './colors';
export { fontFamily, typography, scaledTypography } from './typography';
export type { TypographyPreset } from './typography';
export { spacing, radii, MIN_TOUCH_TARGET } from './spacing';
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
