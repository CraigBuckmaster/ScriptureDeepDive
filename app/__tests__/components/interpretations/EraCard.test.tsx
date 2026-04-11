import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { EraCard } from '@/components/interpretations/EraCard';

describe('EraCard', () => {
  const era = {
    id: 'patristic',
    name: 'Patristic Era',
    date_range: '100-500 AD',
    description: 'The period of the Church Fathers who shaped early Christian theology.',
    display_order: 1,
  };

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<EraCard era={era} />);
    }).not.toThrow();
  });

  it('shows era name', () => {
    const { getByText } = renderWithProviders(<EraCard era={era} />);
    expect(getByText('Patristic Era')).toBeTruthy();
  });

  it('shows date range', () => {
    const { getByText } = renderWithProviders(<EraCard era={era} />);
    expect(getByText('100-500 AD')).toBeTruthy();
  });

  it('shows description', () => {
    const { getByText } = renderWithProviders(<EraCard era={era} />);
    expect(getByText(/Church Fathers/)).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = renderWithProviders(<EraCard era={era} />);
    expect(getByLabelText('Patristic Era, 100-500 AD')).toBeTruthy();
  });
});
