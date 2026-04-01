import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TranslationDropdown } from '@/components/TranslationDropdown';

jest.mock('@/db/translationRegistry', () => ({
  TRANSLATIONS: [
    { id: 'kjv', label: 'KJV', bundled: true, sizeBytes: 0 },
    { id: 'asv', label: 'ASV', bundled: true, sizeBytes: 0 },
  ],
}));

jest.mock('@/utils/haptics', () => ({
  lightImpact: jest.fn(),
  mediumImpact: jest.fn(),
  selectionFeedback: jest.fn(),
}));

describe('TranslationDropdown', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <TranslationDropdown active="kjv" onSelect={jest.fn()} />,
    );
    expect(getByText('KJV')).toBeTruthy();
  });

  it('shows the active translation label on the pill', () => {
    const { getByText } = renderWithProviders(
      <TranslationDropdown active="asv" onSelect={jest.fn()} />,
    );
    expect(getByText('ASV')).toBeTruthy();
  });

  it('has an accessible button trigger', () => {
    const { getByLabelText } = renderWithProviders(
      <TranslationDropdown active="kjv" onSelect={jest.fn()} />,
    );
    expect(getByLabelText('KJV, tap to change')).toBeTruthy();
  });
});
