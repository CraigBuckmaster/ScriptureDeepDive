import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookmarkButton } from '@/components/BookmarkButton';

describe('BookmarkButton', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders filled star when bookmarked', () => {
    const { getByText } = render(
      <BookmarkButton isBookmarked={true} onToggle={mockOnToggle} verseNum={1} />,
    );
    expect(getByText('★')).toBeTruthy();
  });

  it('renders empty star when not bookmarked', () => {
    const { getByText } = render(
      <BookmarkButton isBookmarked={false} onToggle={mockOnToggle} verseNum={1} />,
    );
    expect(getByText('☆')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const { getByRole } = render(
      <BookmarkButton isBookmarked={false} onToggle={mockOnToggle} verseNum={3} />,
    );
    fireEvent.press(getByRole('button'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label for bookmarked state', () => {
    const { getByLabelText } = render(
      <BookmarkButton isBookmarked={true} onToggle={mockOnToggle} verseNum={5} />,
    );
    expect(getByLabelText('Remove bookmark for verse 5')).toBeTruthy();
  });

  it('has correct accessibility label for unbookmarked state', () => {
    const { getByLabelText } = render(
      <BookmarkButton isBookmarked={false} onToggle={mockOnToggle} verseNum={5} />,
    );
    expect(getByLabelText('Add bookmark for verse 5')).toBeTruthy();
  });
});
