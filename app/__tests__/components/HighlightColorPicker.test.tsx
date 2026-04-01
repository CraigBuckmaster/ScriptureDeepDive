import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { HighlightColorPicker, HIGHLIGHT_COLORS } from '@/components/HighlightColorPicker';

jest.mock('@/utils/haptics', () => ({
  lightImpact: jest.fn(),
  mediumImpact: jest.fn(),
  selectionFeedback: jest.fn(),
}));

describe('HighlightColorPicker', () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders all 6 color options', () => {
    const { getAllByLabelText } = renderWithProviders(
      <HighlightColorPicker visible={true} currentColor={null} onSelect={mockOnSelect} onClose={mockOnClose} />,
    );
    HIGHLIGHT_COLORS.forEach((c) => {
      expect(getAllByLabelText(new RegExp(c.name)).length).toBeGreaterThan(0);
    });
  });

  it('renders HIGHLIGHT COLOR label', () => {
    const { getByText } = renderWithProviders(
      <HighlightColorPicker visible={true} currentColor={null} onSelect={mockOnSelect} onClose={mockOnClose} />,
    );
    expect(getByText('HIGHLIGHT COLOR')).toBeTruthy();
  });

  it('shows checkmark for active color', () => {
    const { getByText } = renderWithProviders(
      <HighlightColorPicker visible={true} currentColor="gold" onSelect={mockOnSelect} onClose={mockOnClose} />,
    );
    // The active color circle renders a checkmark text node
    expect(getByText('\u2713')).toBeTruthy();
  });

  it('calls onSelect with color name when a circle is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <HighlightColorPicker visible={true} currentColor={null} onSelect={mockOnSelect} onClose={mockOnClose} />,
    );
    fireEvent.press(getByLabelText('Commands (blue)'));
    expect(mockOnSelect).toHaveBeenCalledWith('blue');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows remove option when a color is currently set', () => {
    const { getByText } = renderWithProviders(
      <HighlightColorPicker visible={true} currentColor="gold" onSelect={mockOnSelect} onClose={mockOnClose} />,
    );
    expect(getByText('Remove highlight')).toBeTruthy();
  });

  it('calls onSelect with null when remove is pressed', () => {
    const { getByText } = renderWithProviders(
      <HighlightColorPicker visible={true} currentColor="gold" onSelect={mockOnSelect} onClose={mockOnClose} />,
    );
    fireEvent.press(getByText('Remove highlight'));
    expect(mockOnSelect).toHaveBeenCalledWith(null);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
