/**
 * CrossRefPanel.test.tsx — Tests for the cross-reference panel.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { CrossRefPanel } from '@/components/panels/CrossRefPanel';
import type { CrossRefEntry } from '@/types';

// Mock verseResolver used by TappableReference
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

const entries: CrossRefEntry[] = [
  { ref: 'Gen 1:1', note: 'In the beginning God created.' },
  { ref: 'Ps 33:6', note: 'By the word of the LORD the heavens were made.' },
  { ref: 'John 1:1', note: 'In the beginning was the Word.' },
];

describe('CrossRefPanel', () => {
  it('renders all entry refs', () => {
    const { getByText } = renderWithProviders(<CrossRefPanel entries={entries} />);
    expect(getByText('Gen 1:1')).toBeTruthy();
    expect(getByText('Ps 33:6')).toBeTruthy();
    expect(getByText('John 1:1')).toBeTruthy();
  });

  it('renders entry notes', () => {
    const { getByText } = renderWithProviders(<CrossRefPanel entries={entries} />);
    expect(getByText(/In the beginning God created/)).toBeTruthy();
  });

  it('pressing a ref calls onRefPress with parsed reference', () => {
    const onRefPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <CrossRefPanel entries={entries} onRefPress={onRefPress} />,
    );
    fireEvent.press(getByLabelText('Reference: Gen 1:1'));
    expect(onRefPress).toHaveBeenCalledWith(
      expect.objectContaining({ bookId: 'gen' }),
    );
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(<CrossRefPanel entries={[]} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders accessibility role link on ref touchable', () => {
    const { getByLabelText } = renderWithProviders(<CrossRefPanel entries={entries} />);
    const link = getByLabelText('Reference: Gen 1:1');
    expect(link).toBeTruthy();
  });
});
