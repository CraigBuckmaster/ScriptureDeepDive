import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import TypeSelector from '@/components/submission/TypeSelector';

describe('TypeSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders all three type options', () => {
    const { getByText } = renderWithProviders(
      <TypeSelector selected={null} onSelect={mockOnSelect} />,
    );
    expect(getByText('Verse Collection')).toBeTruthy();
    expect(getByText('Personal Reflection')).toBeTruthy();
    expect(getByText('Topical Study')).toBeTruthy();
  });

  it('shows descriptions for each type', () => {
    const { getByText } = renderWithProviders(
      <TypeSelector selected={null} onSelect={mockOnSelect} />,
    );
    expect(getByText('Curate a set of verses around a theme')).toBeTruthy();
  });

  it('calls onSelect when a type card is pressed', () => {
    const { getByText } = renderWithProviders(
      <TypeSelector selected={null} onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByText('Verse Collection'));
    expect(mockOnSelect).toHaveBeenCalledWith('verse_collection');
  });
});
