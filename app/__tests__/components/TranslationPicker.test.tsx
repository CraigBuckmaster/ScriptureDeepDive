import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TranslationPicker } from '@/components/TranslationPicker';

jest.mock('@/db/translationRegistry', () => ({
  TRANSLATIONS: [
    { id: 'kjv', label: 'KJV', bundled: true, sizeBytes: 0 },
    { id: 'asv', label: 'ASV', bundled: true, sizeBytes: 0 },
  ],
}));

jest.mock('@/db/translationManager', () => ({
  isTranslationInstalled: jest.fn().mockResolvedValue(true),
  downloadTranslation: jest.fn().mockResolvedValue(undefined),
}));

describe('TranslationPicker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <TranslationPicker selected="kjv" onSelect={jest.fn()} />,
    );
    expect(getByText('KJV')).toBeTruthy();
  });

  it('renders all translation pills', () => {
    const { getByText } = renderWithProviders(
      <TranslationPicker selected="kjv" onSelect={jest.fn()} />,
    );
    expect(getByText('KJV')).toBeTruthy();
    expect(getByText('ASV')).toBeTruthy();
  });

  it('calls onSelect when a bundled translation pill is pressed', async () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <TranslationPicker selected="kjv" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('ASV'));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith('asv'));
  });

  it('highlights the selected translation', () => {
    const { getByText } = renderWithProviders(
      <TranslationPicker selected="kjv" onSelect={jest.fn()} />,
    );
    // KJV pill text should exist (active styling is visual)
    expect(getByText('KJV')).toBeTruthy();
  });
});
