import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PlanProgressBar } from '@/components/PlanProgressBar';

describe('PlanProgressBar', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<PlanProgressBar completed={5} total={30} />);
    expect(toJSON()).not.toBeNull();
  });

  it('displays correct percentage and day count', () => {
    const { getByText } = renderWithProviders(<PlanProgressBar completed={10} total={40} />);
    expect(getByText('25% · Day 10 of 40')).toBeTruthy();
  });

  it('shows 0% when total is 0', () => {
    const { getByText } = renderWithProviders(<PlanProgressBar completed={0} total={0} />);
    expect(getByText('0% · Day 0 of 0')).toBeTruthy();
  });

  it('shows 100% when completed equals total', () => {
    const { getByText } = renderWithProviders(<PlanProgressBar completed={30} total={30} />);
    expect(getByText('100% · Day 30 of 30')).toBeTruthy();
  });

  it('rounds percentage to nearest integer', () => {
    const { getByText } = renderWithProviders(<PlanProgressBar completed={1} total={3} />);
    expect(getByText('33% · Day 1 of 3')).toBeTruthy();
  });
});
