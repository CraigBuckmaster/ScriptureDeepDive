import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { EraTimeline } from '@/components/interpretations/EraTimeline';

describe('EraTimeline', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the "All Eras" chip', () => {
    const { getByText } = renderWithProviders(
      <EraTimeline activeEra="all" onSelect={mockOnSelect} />,
    );
    expect(getByText('All Eras')).toBeTruthy();
  });

  it('pressing a chip calls onSelect', () => {
    const { getByText } = renderWithProviders(
      <EraTimeline activeEra="all" onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByText('All Eras'));
    expect(mockOnSelect).toHaveBeenCalledWith('all');
  });
});
