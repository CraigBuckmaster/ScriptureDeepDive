import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ConfidenceBadge } from '@/components/guidedStudy/ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('renders the human label for each confidence level', () => {
    const { getByText, rerender } = renderWithProviders(<ConfidenceBadge level="consensus" />);
    expect(getByText('Consensus')).toBeTruthy();

    rerender(<ConfidenceBadge level="majority" />);
    expect(getByText('Majority')).toBeTruthy();

    rerender(<ConfidenceBadge level="debated" />);
    expect(getByText('Debated')).toBeTruthy();

    rerender(<ConfidenceBadge level="minority" />);
    expect(getByText('Minority')).toBeTruthy();
  });

  it('renders nothing when level is undefined', () => {
    const { toJSON } = renderWithProviders(<ConfidenceBadge />);
    expect(toJSON()).toBeNull();
  });
});
