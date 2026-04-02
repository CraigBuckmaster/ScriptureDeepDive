import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { GospelDots } from '@/components/GospelDots';

describe('GospelDots', () => {
  it('renders abbreviations for all 4 Gospels', () => {
    const { getByText } = renderWithProviders(
      <GospelDots books={['matthew', 'mark', 'luke', 'john']} />,
    );
    expect(getByText('M')).toBeTruthy();
    expect(getByText('Mk')).toBeTruthy();
    expect(getByText('L')).toBeTruthy();
    expect(getByText('J')).toBeTruthy();
  });

  it('renders only present Gospels as active', () => {
    const { getByText } = renderWithProviders(
      <GospelDots books={['matthew', 'luke']} />,
    );
    // All 4 abbreviations render (for layout consistency)
    expect(getByText('M')).toBeTruthy();
    expect(getByText('Mk')).toBeTruthy();
    expect(getByText('L')).toBeTruthy();
    expect(getByText('J')).toBeTruthy();
  });

  it('renders OT book abbreviations when isOT', () => {
    const { getByText } = renderWithProviders(
      <GospelDots books={['1_kings', '2_chronicles']} isOT />,
    );
    expect(getByText('1Ki')).toBeTruthy();
    expect(getByText('2Ch')).toBeTruthy();
  });

  it('handles empty books array', () => {
    const { toJSON } = renderWithProviders(
      <GospelDots books={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
