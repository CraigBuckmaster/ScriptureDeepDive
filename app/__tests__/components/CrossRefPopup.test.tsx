/**
 * CrossRefPopup.test.tsx — Tests for the cross-reference popup modal.
 */

import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { CrossRefPopup } from '@/components/CrossRefPopup';

// Mock resolveVerseText to return sample text
jest.mock('@/utils/verseResolver', () => ({
  resolveVerseText: jest.fn().mockResolvedValue(['In the beginning God created the heavens and the earth.']),
  parseReference: jest.fn(),
}));

// Mock settingsStore
jest.mock('@/stores', () => ({
  useSettingsStore: (selector: any) => selector({ translation: 'esv' }),
  useReaderStore: (selector: any) => selector({}),
}));

const mockRef = {
  bookId: 'gen',
  bookName: 'Genesis',
  chapter: 1,
  verseStart: 1,
  verseEnd: 1,
};

describe('CrossRefPopup', () => {
  it('renders the reference label', async () => {
    const { findByText } = renderWithProviders(
      <CrossRefPopup visible onClose={jest.fn()} reference={mockRef} />,
    );
    expect(await findByText('Genesis 1:1')).toBeTruthy();
  });

  it('renders resolved verse text', async () => {
    const { findByText } = renderWithProviders(
      <CrossRefPopup visible onClose={jest.fn()} reference={mockRef} />,
    );
    expect(await findByText(/In the beginning/)).toBeTruthy();
  });

  it('returns null when reference is null', () => {
    const { toJSON } = renderWithProviders(
      <CrossRefPopup visible onClose={jest.fn()} reference={null} />,
    );
    expect(toJSON()).toBeNull();
  });
});
