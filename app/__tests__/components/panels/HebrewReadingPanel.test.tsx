/**
 * HebrewReadingPanel.test.tsx — Tests for the Hebrew reading/text panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { HebrewReadingPanel } from '@/components/panels/HebrewReadingPanel';
import type { HebTextEntry } from '@/types';

const entries: HebTextEntry[] = [
  { word: 'בָּרָא', tlit: 'bara', gloss: 'he created', note: 'Qal perfect 3ms.' },
  { word: 'שָׁמַיִם', tlit: 'shamayim', gloss: 'heavens', note: '' },
];

describe('HebrewReadingPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders word entries with transliteration and gloss', () => {
    const { getByText } = renderWithProviders(
      <HebrewReadingPanel entries={entries} />,
    );
    expect(getByText('בָּרָא')).toBeTruthy();
    expect(getByText('bara')).toBeTruthy();
    expect(getByText(/he created/)).toBeTruthy();
  });

  it('renders note text when present', () => {
    const { getByText } = renderWithProviders(
      <HebrewReadingPanel entries={entries} />,
    );
    expect(getByText('Qal perfect 3ms.')).toBeTruthy();
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(
      <HebrewReadingPanel entries={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
