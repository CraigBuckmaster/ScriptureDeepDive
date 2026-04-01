import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchInput } from '@/components/SearchInput';

describe('SearchInput', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders a text input', () => {
    const { getByPlaceholderText } = render(
      <SearchInput value="" onChangeText={mockOnChangeText} placeholder="Search..." />,
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const { getByPlaceholderText } = render(
      <SearchInput value="" onChangeText={mockOnChangeText} placeholder="Search..." />,
    );
    fireEvent.changeText(getByPlaceholderText('Search...'), 'hello');
    expect(mockOnChangeText).toHaveBeenCalledWith('hello');
  });

  it('shows clear button when value is non-empty', () => {
    const { getByLabelText } = render(
      <SearchInput value="test" onChangeText={mockOnChangeText} />,
    );
    expect(getByLabelText('Clear search')).toBeTruthy();
  });

  it('clears input when clear button is pressed', () => {
    const { getByLabelText } = render(
      <SearchInput value="test" onChangeText={mockOnChangeText} />,
    );
    fireEvent.press(getByLabelText('Clear search'));
    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('hides clear button when value is empty', () => {
    const { queryByLabelText } = render(
      <SearchInput value="" onChangeText={mockOnChangeText} />,
    );
    expect(queryByLabelText('Clear search')).toBeNull();
  });
});
