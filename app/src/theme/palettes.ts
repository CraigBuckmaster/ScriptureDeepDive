/**
 * palettes.ts — Theme palette definitions and builder.
 *
 * Dark palette imports directly from colors.ts (no duplication).
 * Sepia and Light base values are hand-tuned for readability.
 * Panel, scholar, and era colors are generated via transforms.ts.
 */

import { panels, scholars, eras, categoryColors, categories, severity, families, prophecyCategories, roles, testament, timelineSvg } from './colors';
import type { PanelColors } from './colors';
import { transformPanelColors, transformAccentColor } from './transforms';

export type ThemeMode = 'dark' | 'sepia' | 'light';

/** Widened base color type — same keys as `base` from colors.ts but with `string` values. */
export interface BaseColors {
  bg: string;
  bgElevated: string;
  bgSurface: string;
  bg3: string;
  text: string;
  textDim: string;
  textMuted: string;
  gold: string;
  goldDim: string;
  goldBright: string;
  border: string;
  borderLight: string;
  verseNum: string;
  navText: string;
  danger: string;
  success: string;
  redLetter: string;
  // ── Subtle section tints (Explore redesign) ───────────────────────
  tintWarm: string;
  tintEmber: string;
  tintParchment: string;
  tintDusk: string;
}

export interface ThemePalette {
  mode: ThemeMode;
  base: BaseColors;
  panels: Record<string, PanelColors>;
  scholars: Record<string, string>;
  eras: Record<string, string>;
  categoryColors: { event: string; book: string; person: string; world: string };
  categories: Record<string, string>;
  severity: Record<string, string>;
  families: Record<string, string>;
  prophecyCategories: Record<string, string>;
  roles: Record<string, string>;
  testament: Record<string, string>;
  timelineSvg: Record<string, string>;
  statusBarStyle: 'light-content' | 'dark-content';
}

// ── Base palettes ────────────────────────────────────────────────────

/** Dark palette — values extracted from the PWA CSS variables. */
const darkBase: BaseColors = {
  bg: '#0c0a07',
  bgElevated: '#252015',
  bgSurface: '#1f1b14',
  bg3: '#1a1508',
  text: '#f0e8d8',
  textDim: '#b8a888',
  textMuted: '#a09888',
  gold: '#bfa050',
  goldDim: '#8a6e1a',
  goldBright: '#d4b868',
  border: '#3a2e18',
  borderLight: '#2a2010',
  verseNum: '#9a8a6a',
  navText: '#d8ccb0',
  danger: '#e05a6a',
  success: '#81C784',
  redLetter: '#d4847a',
  tintWarm: 'rgba(191,160,80,0.04)',
  tintEmber: 'rgba(160,100,50,0.05)',
  tintParchment: 'rgba(180,160,120,0.04)',
  tintDusk: 'rgba(120,100,80,0.06)',
};

const sepiaBase: BaseColors = {
  bg: '#f0e8d8',
  bgElevated: '#e8dcc4',
  bgSurface: '#ece2d0',
  bg3: '#e4d8c0',
  text: '#2c2418',
  textDim: '#5a4e3c',
  textMuted: '#6a5e4c',        // WCAG AA: 5.2:1 on bg, 4.7:1 on bgElevated
  gold: '#886818',             // WCAG AA: 4.3:1 on bg, 3.8:1 on bgElevated
  goldDim: '#7a5e14',
  goldBright: '#b89030',
  border: '#c8b898',
  borderLight: '#d8ccb0',
  verseNum: '#8a7a5a',
  navText: '#4a3e2c',
  danger: '#c04848',
  success: '#4a8a4a',
  redLetter: '#9a3a2a',        // WCAG AA: 5.7:1 on bg
  tintWarm: 'rgba(136,104,24,0.04)',
  tintEmber: 'rgba(120,80,40,0.05)',
  tintParchment: 'rgba(140,120,80,0.04)',
  tintDusk: 'rgba(100,80,60,0.06)',
};

const lightBase: BaseColors = {
  bg: '#fafafa',
  bgElevated: '#ffffff',
  bgSurface: '#f5f5f5',
  bg3: '#eeeeee',
  text: '#1a1a1a',
  textDim: '#555555',
  textMuted: '#888888',
  gold: '#8a6a18',
  goldDim: '#6a5010',
  goldBright: '#a07820',
  border: '#e0e0e0',
  borderLight: '#eeeeee',
  verseNum: '#999999',
  navText: '#333333',
  danger: '#d04040',
  success: '#388e38',
  redLetter: '#9e3a30',
  tintWarm: 'rgba(138,106,24,0.03)',
  tintEmber: 'rgba(120,80,40,0.04)',
  tintParchment: 'rgba(140,120,80,0.03)',
  tintDusk: 'rgba(100,80,60,0.04)',
};

// ── Palette builder ───────────────────────────────────────────────────

function transformRecord(
  record: Record<string, string>,
  mode: ThemeMode,
): Record<string, string> {
  if (mode === 'dark') return record;
  const result: Record<string, string> = {};
  for (const key in record) {
    result[key] = transformAccentColor(record[key], mode);
  }
  return result;
}

function transformPanels(
  panelMap: Record<string, PanelColors>,
  mode: ThemeMode,
): Record<string, PanelColors> {
  if (mode === 'dark') return panelMap;
  const result: Record<string, PanelColors> = {};
  for (const key in panelMap) {
    result[key] = transformPanelColors(panelMap[key], mode);
  }
  return result;
}

function getBaseForMode(mode: ThemeMode): BaseColors {
  switch (mode) {
    case 'dark': return darkBase;
    case 'sepia': return sepiaBase;
    case 'light': return lightBase;
  }
}

/**
 * Build a complete theme palette for a given mode.
 * Called once on theme change, memoized by the provider.
 */
export function buildPalette(mode: ThemeMode): ThemePalette {
  const modeBase = getBaseForMode(mode);

  return {
    mode,
    base: modeBase,
    panels: transformPanels(panels, mode),
    scholars: transformRecord(scholars, mode),
    eras: transformRecord(eras, mode),
    categoryColors: {
      event: modeBase.gold,
      book: transformAccentColor(categoryColors.book, mode),
      person: transformAccentColor(categoryColors.person, mode),
      world: transformAccentColor(categoryColors.world, mode),
    },
    categories: transformRecord(categories as unknown as Record<string, string>, mode),
    severity: transformRecord(severity as unknown as Record<string, string>, mode),
    families: transformRecord(families as unknown as Record<string, string>, mode),
    prophecyCategories: transformRecord(prophecyCategories as unknown as Record<string, string>, mode),
    roles: transformRecord(roles as unknown as Record<string, string>, mode),
    testament: transformRecord(testament as unknown as Record<string, string>, mode),
    timelineSvg: transformRecord(timelineSvg as unknown as Record<string, string>, mode),
    statusBarStyle: mode === 'dark' ? 'light-content' : 'dark-content',
  };
}
