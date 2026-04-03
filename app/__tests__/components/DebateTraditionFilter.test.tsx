import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DebateTraditionFilter } from '@/components/DebateTraditionFilter';

describe('DebateTraditionFilter', () => {
  const traditions = ['evangelical', 'reformed', 'critical'];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "All" pill', () => {
    const { getByText } = renderWithProviders(
      <DebateTraditionFilter
        traditions={traditions}
        activeFilter="all"
        onSelect={mockOnSelect}
      />,
    );
    expect(getByText('All')).toBeTruthy();
  });

  it('renders tradition pills with capitalized labels', () => {
    const { getByText } = renderWithProviders(
      <DebateTraditionFilter
        traditions={traditions}
        activeFilter="all"
        onSelect={mockOnSelect}
      />,
    );
    expect(getByText('Evangelical')).toBeTruthy();
    expect(getByText('Reformed')).toBeTruthy();
    expect(getByText('Critical')).toBeTruthy();
  });

  it('calls onSelect with "all" when All pill is pressed', () => {
    const { getByText } = renderWithProviders(
      <DebateTraditionFilter
        traditions={traditions}
        activeFilter="evangelical"
        onSelect={mockOnSelect}
      />,
    );
    fireEvent.press(getByText('All'));
    expect(mockOnSelect).toHaveBeenCalledWith('all');
  });

  it('calls onSelect with tradition key when tradition pill is pressed', () => {
    const { getByText } = renderWithProviders(
      <DebateTraditionFilter
        traditions={traditions}
        activeFilter="all"
        onSelect={mockOnSelect}
      />,
    );
    fireEvent.press(getByText('Evangelical'));
    expect(mockOnSelect).toHaveBeenCalledWith('evangelical');
  });
});
