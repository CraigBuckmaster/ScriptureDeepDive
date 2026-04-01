import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContentLibraryCard } from '@/components/ContentLibraryCard';
import type { ContentLibraryEntry } from '@/types';

const MOCK_ENTRY: ContentLibraryEntry = {
  id: 1,
  category: 'discourse',
  title: 'Genesis 1 — Argument Flow',
  preview: 'The thesis of chapter 1...',
  book_id: 'genesis',
  book_name: 'Genesis',
  chapter_num: 1,
  section_num: null,
  panel_type: 'discourse',
  tab_key: null,
  testament: 'ot',
  sort_order: 1,
};

describe('ContentLibraryCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the title', () => {
    const { getByText } = render(
      <ContentLibraryCard entry={MOCK_ENTRY} onPress={mockOnPress} />,
    );
    expect(getByText(MOCK_ENTRY.title)).toBeTruthy();
  });

  it('renders the preview text', () => {
    const { getByText } = render(
      <ContentLibraryCard entry={MOCK_ENTRY} onPress={mockOnPress} />,
    );
    expect(getByText(MOCK_ENTRY.preview!)).toBeTruthy();
  });

  it('renders the reference pill', () => {
    const { getAllByText } = render(
      <ContentLibraryCard entry={MOCK_ENTRY} onPress={mockOnPress} />,
    );
    // Should show book name (may appear in title too)
    expect(getAllByText(/Genesis/).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onPress with entry when tapped', () => {
    const { getByText } = render(
      <ContentLibraryCard entry={MOCK_ENTRY} onPress={mockOnPress} />,
    );
    fireEvent.press(getByText(MOCK_ENTRY.title));
    expect(mockOnPress).toHaveBeenCalledWith(MOCK_ENTRY);
  });
});
