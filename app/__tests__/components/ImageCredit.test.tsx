import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ImageCredit } from '@/components/ImageCredit';

describe('ImageCredit', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ImageCredit />);
    }).not.toThrow();
  });

  it('shows default credit when no credit provided', () => {
    const { getByText } = renderWithProviders(<ImageCredit />);
    expect(getByText(/Public domain via Wikimedia Commons/)).toBeTruthy();
  });

  it('shows custom credit when provided', () => {
    const { getByText } = renderWithProviders(<ImageCredit credit="Photo by John" />);
    expect(getByText(/Photo by John/)).toBeTruthy();
  });

  it('shows "Image:" prefix', () => {
    const { getByText } = renderWithProviders(<ImageCredit credit="Museum" />);
    expect(getByText(/Image:/)).toBeTruthy();
  });
});
