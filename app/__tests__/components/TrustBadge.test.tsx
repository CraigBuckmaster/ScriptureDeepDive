import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import TrustBadge from '@/components/TrustBadge';

describe('TrustBadge', () => {
  it('renders "New" for level 0', () => {
    const { getByText } = renderWithProviders(<TrustBadge level={0} />);
    expect(getByText('New')).toBeTruthy();
  });

  it('renders custom label when provided', () => {
    const { getByText } = renderWithProviders(
      <TrustBadge level={2} label="Expert" />,
    );
    expect(getByText('Expert')).toBeTruthy();
  });
});
