import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ScholarTag } from '@/components/ScholarTag';

jest.mock('@/utils/panelLabels', () => ({
  getPanelLabel: (id: string) => id === 'heb' ? 'Hebrew' : id.toUpperCase(),
}));

describe('ScholarTag', () => {
  it('renders the scholar label from getPanelLabel', () => {
    const { getByText } = renderWithProviders(
      <ScholarTag scholarId="heb" />,
    );
    expect(getByText('Hebrew')).toBeTruthy();
  });

  it('has accessible label with scholar name', () => {
    const { getByLabelText } = renderWithProviders(
      <ScholarTag scholarId="heb" />,
    );
    expect(getByLabelText('Scholar: Hebrew')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const mockPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <ScholarTag scholarId="heb" onPress={mockPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
