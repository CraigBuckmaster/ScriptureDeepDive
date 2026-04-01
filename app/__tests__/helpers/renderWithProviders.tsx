/**
 * Test helper — wraps components in the providers needed for rendering.
 *
 * Provides: NavigationContainer + ThemeContext (dark palette).
 */

import React from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeContext } from '@/theme/ThemeContext';
import { buildPalette } from '@/theme/palettes';

const darkPalette = buildPalette('dark');

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={darkPalette}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
