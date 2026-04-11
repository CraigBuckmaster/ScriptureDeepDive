import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import VerseCard from '@/components/lifetopics/VerseCard';

describe('VerseCard', () => {
  const mockOnPress = jest.fn();

  it('renders verse reference', () => {
    const { getByText } = renderWithProviders(
      <VerseCard verseRef="John 3:16" onPress={mockOnPress} />,
    );
    expect(getByText('John 3:16')).toBeTruthy();
  });

  it('shows "Key" badge when isPrimary is true', () => {
    const { getByText } = renderWithProviders(
      <VerseCard verseRef="Genesis 1:1" isPrimary onPress={mockOnPress} />,
    );
    expect(getByText('Key')).toBeTruthy();
  });
});
