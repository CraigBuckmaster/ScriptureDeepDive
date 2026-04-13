import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { MessianicLegend } from '@/components/tree/MessianicLegend';

describe('MessianicLegend', () => {
  it('renders the default explanation text', () => {
    const { getByText } = renderWithProviders(<MessianicLegend />);
    expect(getByText(/Golden thread = messianic lineage to Jesus/)).toBeTruthy();
  });

  it('honors a custom label prop', () => {
    const { getByText } = renderWithProviders(<MessianicLegend label="Custom text" />);
    expect(getByText('Custom text')).toBeTruthy();
  });

  it('exposes the label as an accessibility label', () => {
    const { getByLabelText } = renderWithProviders(<MessianicLegend label="Alt label" />);
    expect(getByLabelText('Alt label')).toBeTruthy();
  });
});
