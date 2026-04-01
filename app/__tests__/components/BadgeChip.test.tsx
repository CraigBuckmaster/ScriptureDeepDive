import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BadgeChip } from '@/components/BadgeChip';

describe('BadgeChip', () => {
  it('renders the label', () => {
    const { getByText } = render(<BadgeChip label="Prophecy" />);
    expect(getByText('Prophecy')).toBeTruthy();
  });

  it('is pressable when onPress is provided', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(<BadgeChip label="Tap me" onPress={mockOnPress} />);
    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is not pressable when onPress is omitted', () => {
    const { queryByRole } = render(<BadgeChip label="Static" />);
    expect(queryByRole('button')).toBeNull();
  });
});
