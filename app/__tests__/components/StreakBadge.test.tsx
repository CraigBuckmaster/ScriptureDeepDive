import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { StreakBadge } from '@/components/StreakBadge';

describe('StreakBadge', () => {
  it('renders streak text when streak > 0', () => {
    const { getByText } = renderWithProviders(<StreakBadge streak={5} />);
    expect(getByText('5-day streak')).toBeTruthy();
  });

  it('returns null when streak is 0', () => {
    const { toJSON } = renderWithProviders(<StreakBadge streak={0} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when streak is negative', () => {
    const { toJSON } = renderWithProviders(<StreakBadge streak={-1} />);
    expect(toJSON()).toBeNull();
  });

  it('renders correct day count for streak of 1', () => {
    const { getByText } = renderWithProviders(<StreakBadge streak={1} />);
    expect(getByText('1-day streak')).toBeTruthy();
  });
});
