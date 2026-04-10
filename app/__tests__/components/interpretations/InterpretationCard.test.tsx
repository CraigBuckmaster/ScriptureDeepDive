import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { InterpretationCard } from '@/components/interpretations/InterpretationCard';

describe('InterpretationCard', () => {
  const mockInterpretation = {
    id: 'i-1',
    era: 'patristic',
    era_label: 'Patristic Era',
    author: 'Augustine',
    author_dates: '354-430 AD',
    interpretation: 'A deep theological insight.',
    source_title: 'City of God',
    source_date: '426 AD',
    verse_ref: 'Genesis 1:1',
    context: 'Written during the fall of Rome',
  };

  it('renders author name and interpretation', () => {
    const { getByText } = renderWithProviders(
      <InterpretationCard interpretation={mockInterpretation as any} />,
    );
    expect(getByText('Augustine')).toBeTruthy();
    expect(getByText('A deep theological insight.')).toBeTruthy();
  });

  it('renders era label and source', () => {
    const { getByText } = renderWithProviders(
      <InterpretationCard interpretation={mockInterpretation as any} />,
    );
    expect(getByText('Patristic Era')).toBeTruthy();
    expect(getByText('City of God (426 AD)')).toBeTruthy();
  });
});
