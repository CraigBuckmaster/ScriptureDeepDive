import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { OnboardingDemo } from '@/components/OnboardingDemo';
import type { ThemePalette } from '@/theme';

const mockBase: ThemePalette['base'] = {
  bg: '#000',
  bgElevated: '#111',
  bgSurface: '#0a0a0a',
  bg3: '#050505',
  text: '#fff',
  textDim: '#ccc',
  textMuted: '#888',
  gold: '#c9a227',
  goldDim: '#8a6e1a',
  goldBright: '#d4b868',
  border: '#333',
  borderLight: '#222',
  verseNum: '#9a8a6a',
  navText: '#d8ccb0',
  danger: '#e05a6a',
  success: '#81C784',
  redLetter: '#d4847a',
  tintWarm: '#1a1508',
  tintEmber: '#1f1410',
  tintParchment: '#1e1a12',
  tintDusk: '#141824',
};

describe('OnboardingDemo', () => {
  it('renders verse text', () => {
    const { getByText } = renderWithProviders(
      <OnboardingDemo base={mockBase} />,
    );
    expect(getByText(/In the beginning God created/)).toBeTruthy();
  });

  it('renders panel buttons', () => {
    const { getByText } = renderWithProviders(
      <OnboardingDemo base={mockBase} />,
    );
    expect(getByText('Hebrew')).toBeTruthy();
    expect(getByText('History')).toBeTruthy();
    expect(getByText('Sarna')).toBeTruthy();
  });
});
