import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { OnboardingDemo } from '@/components/OnboardingDemo';

const mockBase = {
  bg: '#000',
  bgElevated: '#111',
  text: '#fff',
  textDim: '#ccc',
  textMuted: '#888',
  gold: '#c9a227',
  border: '#333',
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
