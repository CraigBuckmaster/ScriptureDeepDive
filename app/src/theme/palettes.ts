/**
 * palettes.ts — Theme palette definitions and builder.
 *
 * Dark palette imports directly from colors.ts (no duplication).
 * Sepia and Light base values are hand-tuned for readability.
 * Panel, scholar, and era colors are generated via transforms.ts.
 */

import { base, panels, scholars, eras, categoryColors } from './colors';
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
}

export interface ThemePalette {
  mode: ThemeMode;
  base: BaseColors;
  panels: Record<string, PanelColors>;
  scholars: Record<string, string>;
  eras: Record<string, string>;
  categoryColors: { event: string; book: string; person: string; world: string };
  statusBarStyle: 'light-content' | 'dark-content';
}

// ── Hand-tuned base palettes for sepia and light ──────────────────────

const sepiaBase: BaseColors = {
  bg: '#f0e8d8',
  bgElevated: '#e8dcc4',
  bgSurface: '#ece2d0',
  bg3: '#e4d8c0',
  text: '#2c2418',
  textDim: '#5a4e3c',
  textMuted: '#7a6e5c',
  gold: '#9a7a28',
  goldDim: '#7a5e14',
  goldBright: '#b89030',
  border: '#c8b898',
  borderLight: '#d8ccb0',
  verseNum: '#8a7a5a',
  navText: '#4a3e2c',
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
    case 'dark': return base;
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
    statusBarStyle: mode === 'dark' ? 'light-content' : 'dark-content',
  };
}
