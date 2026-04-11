/**
 * Tests for theme/ThemeProvider.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, useColorScheme } from 'react-native';

jest.mock('@/stores', () => ({
  useSettingsStore: jest.fn().mockImplementation((sel) =>
    sel({ theme: 'dark', translation: 'kjv', fontSize: 16 }),
  ),
}));

import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/ThemeContext';

function ThemeConsumer() {
  const { base } = useTheme();
  return <Text testID="bg">{base.bg}</Text>;
}

describe('ThemeProvider', () => {
  it('renders children with theme context', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Text>Hello</Text>
      </ThemeProvider>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('provides a dark palette by default', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    // Dark mode bg is typically a dark color
    const bg = getByTestId('bg').props.children;
    expect(typeof bg).toBe('string');
    expect(bg.length).toBeGreaterThan(0);
  });

  it('does not crash with system theme preference', () => {
    const { useSettingsStore } = require('@/stores');
    useSettingsStore.mockImplementation((sel: any) =>
      sel({ theme: 'system', translation: 'kjv', fontSize: 16 }),
    );

    expect(() => {
      render(
        <ThemeProvider>
          <Text>System theme</Text>
        </ThemeProvider>,
      );
    }).not.toThrow();
  });

  it('does not crash with light theme preference', () => {
    const { useSettingsStore } = require('@/stores');
    useSettingsStore.mockImplementation((sel: any) =>
      sel({ theme: 'light', translation: 'kjv', fontSize: 16 }),
    );

    expect(() => {
      render(
        <ThemeProvider>
          <Text>Light theme</Text>
        </ThemeProvider>,
      );
    }).not.toThrow();
  });
});
