/**
 * ThemeContext.ts — React context and useTheme() hook for theme-aware components.
 *
 * Default context value is the dark palette, matching current app behavior.
 * Components call useTheme() to get the active palette plus helper functions.
 */

import { createContext, useContext } from 'react';
import type { ThemePalette } from './palettes';
import { buildPalette } from './palettes';
import type { PanelColors } from './colors';

const darkPalette = buildPalette('dark');

export const ThemeContext = createContext<ThemePalette>(darkPalette);

export function useTheme(): ThemePalette & {
  getPanelColors: (panelType: string) => PanelColors;
  getScholarColor: (scholarId: string) => string;
} {
  const palette = useContext(ThemeContext);
  return {
    ...palette,
    getPanelColors: (type: string) => palette.panels[type] ?? palette.panels.com,
    getScholarColor: (id: string) => palette.scholars[id] ?? palette.base.goldDim,
  };
}
