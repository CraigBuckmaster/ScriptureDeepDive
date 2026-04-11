import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import ScholarQuoteCard from '@/components/lifetopics/ScholarQuoteCard';

describe('ScholarQuoteCard', () => {
  it('renders quote and scholar name', () => {
    const { getByText } = renderWithProviders(
      <ScholarQuoteCard
        quote="God is love"
        scholarName="N.T. Wright"
      />,
    );
    expect(getByText(/God is love/)).toBeTruthy();
    expect(getByText('N.T. Wright')).toBeTruthy();
  });

  it('shows tradition when provided', () => {
    const { getByText } = renderWithProviders(
      <ScholarQuoteCard
        quote="A profound insight"
        scholarName="Sarna"
        tradition="Jewish Academic"
      />,
    );
    expect(getByText(/Jewish Academic/)).toBeTruthy();
  });
});
