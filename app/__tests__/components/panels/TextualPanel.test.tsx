/**
 * TextualPanel.test.tsx — Tests for the textual criticism panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TextualPanel } from '@/components/panels/TextualPanel';
import type { TextualEntry } from '@/types';

const entries: TextualEntry[] = [
  { ref: 'v. 1', title: 'Masoretic vs LXX', content: 'The MT reads bereshit while LXX has en arche.', note: 'Minor semantic difference.' },
  { ref: 'v. 2', title: 'Dead Sea Scrolls', content: 'Fragment 4Q supports MT reading.' },
];

describe('TextualPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders entry refs and titles', () => {
    const { getByText } = renderWithProviders(
      <TextualPanel entries={entries} />,
    );
    expect(getByText('v. 1')).toBeTruthy();
    expect(getByText('Masoretic vs LXX')).toBeTruthy();
    expect(getByText('v. 2')).toBeTruthy();
    expect(getByText('Dead Sea Scrolls')).toBeTruthy();
  });

  it('renders entry content', () => {
    const { getByText } = renderWithProviders(
      <TextualPanel entries={entries} />,
    );
    expect(getByText(/MT reads bereshit/)).toBeTruthy();
  });

  it('renders note when present', () => {
    const { getByText } = renderWithProviders(
      <TextualPanel entries={entries} />,
    );
    expect(getByText('Minor semantic difference.')).toBeTruthy();
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(
      <TextualPanel entries={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
