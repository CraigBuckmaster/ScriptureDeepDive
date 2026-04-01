/**
 * EchoesView.test.tsx — Tests for the echoes/allusion entries component.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { EchoesView } from '@/components/panels/EchoesView';
import type { EchoEntry } from '@/types';

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

const entries: EchoEntry[] = [
  {
    source_ref: 'Gen 1:1',
    target_ref: 'John 1:1',
    type: 'direct_quote',
    source_context: 'In the beginning God created',
    connection: 'Both open with "In the beginning"',
    significance: 'Establishes Jesus as the pre-existent Word',
  },
  {
    source_ref: 'Isa 53:7',
    target_ref: 'Acts 8:32',
    type: 'allusion',
    source_context: 'He was led like a lamb to the slaughter',
    connection: 'Philip quotes Isaiah to the Ethiopian eunuch',
    significance: 'Identifies Jesus as the suffering servant',
  },
];

describe('EchoesView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<EchoesView entries={entries} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders type badges', () => {
    const { getByText } = renderWithProviders(<EchoesView entries={entries} />);
    expect(getByText('Direct Quote')).toBeTruthy();
    expect(getByText('Allusion')).toBeTruthy();
  });

  it('renders source and target references', () => {
    const { getByText } = renderWithProviders(<EchoesView entries={entries} />);
    expect(getByText('Gen 1:1')).toBeTruthy();
    expect(getByText('John 1:1')).toBeTruthy();
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(<EchoesView entries={[]} />);
    expect(toJSON()).toBeTruthy();
  });
});
