import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ComparisonVerse } from '@/components/ComparisonVerse';

describe('ComparisonVerse', () => {
  it('renders verse text and translation label', () => {
    const { getByText } = renderWithProviders(
      <ComparisonVerse text="In the beginning God created" translationLabel="ASV" />,
    );
    expect(getByText('In the beginning God created')).toBeTruthy();
    expect(getByText('ASV')).toBeTruthy();
  });

  it('renders dash when text is null (missing verse)', () => {
    const { getByText } = renderWithProviders(
      <ComparisonVerse text={null} translationLabel="ASV" />,
    );
    expect(getByText('—')).toBeTruthy();
  });

  it('does not render label when text is null', () => {
    const { queryByText } = renderWithProviders(
      <ComparisonVerse text={null} translationLabel="ASV" />,
    );
    expect(queryByText('ASV')).toBeNull();
  });
});
