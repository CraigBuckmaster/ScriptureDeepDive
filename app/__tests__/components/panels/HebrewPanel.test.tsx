/**
 * HebrewPanel.test.tsx — Tests for the Hebrew/Greek word study panel.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { HebrewPanel } from '@/components/panels/HebrewPanel';
import type { HebEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const entries: HebEntry[] = [
  { word: 'בְּרֵאשִׁית', transliteration: 'bereshit', gloss: 'in the beginning', paragraph: 'The opening word of the Torah.' },
  { word: 'אֱלֹהִים', transliteration: 'elohim', gloss: 'God', paragraph: 'Plural of majesty.' },
];

describe('HebrewPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders word entries with gloss', () => {
    const { getByText } = renderWithProviders(
      <HebrewPanel entries={entries} />,
    );
    expect(getByText('בְּרֵאשִׁית')).toBeTruthy();
    expect(getByText(/in the beginning/)).toBeTruthy();
    expect(getByText('אֱלֹהִים')).toBeTruthy();
  });

  it('renders transliteration text', () => {
    const { getByText } = renderWithProviders(
      <HebrewPanel entries={entries} />,
    );
    expect(getByText('bereshit')).toBeTruthy();
    expect(getByText('elohim')).toBeTruthy();
  });

  it('calls onWordStudyPress when a word is tapped', () => {
    const onWordStudyPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <HebrewPanel entries={entries} onWordStudyPress={onWordStudyPress} />,
    );
    fireEvent.press(getByLabelText('Word study: בְּרֵאשִׁית'));
    expect(onWordStudyPress).toHaveBeenCalledWith('בְּרֵאשִׁית');
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(
      <HebrewPanel entries={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
