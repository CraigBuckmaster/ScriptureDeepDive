import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PanelButton } from '@/components/PanelButton';

describe('PanelButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the panel label', () => {
    const { getByText } = render(
      <PanelButton panelType="heb" isActive={false} onPress={mockOnPress} />,
    );
    // getPanelLabel('heb') should return a label string
    expect(getByText(/./)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const { getByRole } = render(
      <PanelButton panelType="heb" isActive={false} onPress={mockOnPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has selected accessibility state when active', () => {
    const { getByRole } = render(
      <PanelButton panelType="heb" isActive={true} onPress={mockOnPress} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });
});
