import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ArchaeologyBadge } from '@/components/ArchaeologyBadge';

describe('ArchaeologyBadge', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ArchaeologyBadge />);
    }).not.toThrow();
  });

  it('shows "Evidence" label in default size', () => {
    const { getByText } = renderWithProviders(<ArchaeologyBadge />);
    expect(getByText('Evidence')).toBeTruthy();
  });

  it('hides label in small size', () => {
    const { queryByText } = renderWithProviders(<ArchaeologyBadge size="small" />);
    expect(queryByText('Evidence')).toBeNull();
  });

  it('shows the icon', () => {
    const { getByText } = renderWithProviders(<ArchaeologyBadge />);
    expect(getByText('🏛')).toBeTruthy();
  });
});
