import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { WeeklySummary } from '@/components/WeeklySummary';

describe('WeeklySummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when chapters is 0', () => {
    const { toJSON } = renderWithProviders(
      <WeeklySummary chapters={0} bookNames={[]} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders summary for a single chapter', () => {
    const { getByText } = renderWithProviders(
      <WeeklySummary chapters={1} bookNames={['Genesis']} />,
    );
    expect(getByText('This week: 1 chapter · Genesis')).toBeTruthy();
  });

  it('renders summary for multiple chapters and books', () => {
    const { getByText } = renderWithProviders(
      <WeeklySummary chapters={5} bookNames={['Genesis', 'Exodus']} />,
    );
    expect(getByText('This week: 5 chapters · Genesis, Exodus')).toBeTruthy();
  });

  it('truncates book list beyond 3 and shows +N', () => {
    const { getByText } = renderWithProviders(
      <WeeklySummary chapters={10} bookNames={['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']} />,
    );
    expect(getByText('This week: 10 chapters · Genesis, Exodus, Leviticus +2')).toBeTruthy();
  });
});
