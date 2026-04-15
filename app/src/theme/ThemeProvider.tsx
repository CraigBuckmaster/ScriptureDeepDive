/**
 * ThemeProvider.tsx — Wraps the app tree in theme context.
 *
 * Resolves the user's theme preference (including 'system' auto-detect)
 * into a concrete palette and provides it via React context.
 */

import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores';
import { ThemeContext } from './ThemeContext';
import { buildPalette, type ThemeMode } from './palettes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themePref = useSettingsStore(s => s.theme);

  const resolvedMode: ThemeMode = themePref === 'system'
    ? (systemScheme === 'light' ? 'light' : 'dark')
    : themePref;

  const palette = useMemo(() => buildPalette(resolvedMode), [resolvedMode]);

  return (
    <ThemeContext.Provider value={palette}>
      {children}
    </ThemeContext.Provider>
  );
}
