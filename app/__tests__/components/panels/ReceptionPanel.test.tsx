/**
 * ReceptionPanel.test.tsx — Tests for the reception history panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ReceptionPanel } from '@/components/panels/ReceptionPanel';
import type { RecEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const entries: RecEntry[] = [
  { title: 'Augustine', quote: 'God created all things simultaneously.', note: 'See De Genesi ad Litteram.' },
  { title: 'Basil of Caesarea', quote: 'The creation account teaches order and purpose.', note: '' },
];

describe('ReceptionPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders entry headings', () => {
    const { getByText } = renderWithProviders(
      <ReceptionPanel entries={entries} />,
    );
    expect(getByText('Augustine')).toBeTruthy();
    expect(getByText('Basil of Caesarea')).toBeTruthy();
  });

  it('renders entry quotes', () => {
    const { getByText } = renderWithProviders(
      <ReceptionPanel entries={entries} />,
    );
    expect(getByText(/God created all things simultaneously/)).toBeTruthy();
  });

  it('shows empty state when entries are empty', () => {
    const { getByText } = renderWithProviders(
      <ReceptionPanel entries={[]} />,
    );
    expect(getByText('No reception history available.')).toBeTruthy();
  });

  it('renders with null entries without crashing', () => {
    const { getByText } = renderWithProviders(
      <ReceptionPanel entries={null as any} />,
    );
    expect(getByText('No reception history available.')).toBeTruthy();
  });
});
