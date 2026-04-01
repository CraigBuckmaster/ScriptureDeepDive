/**
 * CompositeConnectionsPanel.test.tsx — Tests for the tabbed connections hub panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { CompositeConnectionsPanel } from '@/components/panels/CompositeConnectionsPanel';
import type { CompositeConnectionsData } from '@/types';

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn((ref: string) => ({
    bookId: 'gen',
    bookName: 'Genesis',
    chapter: 1,
    verseStart: 1,
    verseEnd: null,
  })),
}));

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const data: CompositeConnectionsData = {
  refs: [
    { ref: 'Ps 33:6', note: 'By the word of the LORD the heavens were made.' },
    { ref: 'Heb 11:3', note: 'The universe was formed at God\'s command.' },
  ],
  echoes: [
    {
      source_ref: 'Gen 1:1',
      target_ref: 'John 1:1',
      type: 'direct_quote',
      source_context: 'In the beginning',
      connection: 'Both begin with the same phrase',
      significance: 'Establishes divine Christology',
    },
  ],
};

describe('CompositeConnectionsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<CompositeConnectionsPanel data={data} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders tab labels when both refs and echoes have data', () => {
    const { getByText } = renderWithProviders(<CompositeConnectionsPanel data={data} />);
    expect(getByText('Cross-References')).toBeTruthy();
    expect(getByText('Echoes & Allusions')).toBeTruthy();
  });

  it('renders with only refs (single tab, no tab bar)', () => {
    const refsOnly: CompositeConnectionsData = {
      refs: [{ ref: 'Ps 33:6', note: 'A note.' }],
    };
    const { toJSON } = renderWithProviders(<CompositeConnectionsPanel data={refsOnly} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with empty refs and no echoes without crashing', () => {
    const emptyData: CompositeConnectionsData = { refs: [] };
    const { toJSON } = renderWithProviders(<CompositeConnectionsPanel data={emptyData} />);
    // No tabs have data, should render null
    expect(toJSON()).toBeNull();
  });
});
