/**
 * SourcesPanel.test.tsx — Tests for the sources panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { SourcesPanel } from '@/components/panels/SourcesPanel';
import type { SourceEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const entries: SourceEntry[] = [
  { title: 'JEDP Hypothesis', quote: 'The Priestly source (P) is responsible for Gen 1.', note: 'Wellhausen, Prolegomena.' },
  { title: 'Documentary Sources', quote: 'Multiple literary strata are evident.', note: 'See Friedman, Who Wrote the Bible.' },
];

describe('SourcesPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders entry titles', () => {
    const { getByText } = renderWithProviders(
      <SourcesPanel entries={entries} />,
    );
    expect(getByText('JEDP Hypothesis')).toBeTruthy();
    expect(getByText('Documentary Sources')).toBeTruthy();
  });

  it('renders entry quotes', () => {
    const { getByText } = renderWithProviders(
      <SourcesPanel entries={entries} />,
    );
    expect(getByText(/Priestly source/)).toBeTruthy();
  });

  it('renders note text via TappableReference', () => {
    const { getByText } = renderWithProviders(
      <SourcesPanel entries={entries} />,
    );
    expect(getByText(/Wellhausen/)).toBeTruthy();
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SourcesPanel entries={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
