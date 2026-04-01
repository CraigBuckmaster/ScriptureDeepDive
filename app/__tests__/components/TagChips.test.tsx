import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TagChips } from '@/components/TagChips';

describe('TagChips', () => {
  const mockOnTagsChange = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders existing tags with # prefix', () => {
    const { getByText } = renderWithProviders(
      <TagChips tags={['prayer', 'faith']} onTagsChange={mockOnTagsChange} />,
    );
    expect(getByText('#prayer')).toBeTruthy();
    expect(getByText('#faith')).toBeTruthy();
  });

  it('shows X icon on each tag when editable', () => {
    const { getAllByTestId } = renderWithProviders(
      <TagChips tags={['prayer', 'faith']} onTagsChange={mockOnTagsChange} editable />,
    );
    // Each tag gets an X icon (lucide mock renders testID="icon-X")
    expect(getAllByTestId('icon-X')).toHaveLength(2);
  });

  it('does not show X icon when not editable', () => {
    const { queryByTestId } = renderWithProviders(
      <TagChips tags={['prayer']} onTagsChange={mockOnTagsChange} editable={false} />,
    );
    expect(queryByTestId('icon-X')).toBeNull();
  });

  it('calls onTagsChange without the removed tag when X is pressed', () => {
    const { getAllByTestId } = renderWithProviders(
      <TagChips tags={['prayer', 'faith']} onTagsChange={mockOnTagsChange} />,
    );
    // Press first X icon to remove "prayer"
    fireEvent.press(getAllByTestId('icon-X')[0]);
    expect(mockOnTagsChange).toHaveBeenCalledWith(['faith']);
  });

  it('shows add button with "tag" text when editable', () => {
    const { getByText } = renderWithProviders(
      <TagChips tags={[]} onTagsChange={mockOnTagsChange} editable />,
    );
    expect(getByText('tag')).toBeTruthy();
  });

  it('shows text input when "+" add button is pressed', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <TagChips tags={[]} onTagsChange={mockOnTagsChange} editable />,
    );
    fireEvent.press(getByText('tag'));
    expect(getByPlaceholderText('tag name')).toBeTruthy();
  });

  it('submitting input adds a new tag', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <TagChips tags={['existing']} onTagsChange={mockOnTagsChange} editable />,
    );
    fireEvent.press(getByText('tag'));
    const input = getByPlaceholderText('tag name');
    fireEvent.changeText(input, 'new tag');
    fireEvent(input, 'submitEditing');
    expect(mockOnTagsChange).toHaveBeenCalledWith(['existing', 'new-tag']);
  });

  it('does not add duplicate tags', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <TagChips tags={['prayer']} onTagsChange={mockOnTagsChange} editable />,
    );
    fireEvent.press(getByText('tag'));
    const input = getByPlaceholderText('tag name');
    fireEvent.changeText(input, 'prayer');
    fireEvent(input, 'submitEditing');
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });
});
