import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { PersonFilterBar } from '@/components/timeline/PersonFilterBar';

describe('PersonFilterBar', () => {
  it('renders the count and person name (plural)', () => {
    const { getByText } = renderWithProviders(
      <PersonFilterBar personName="Abraham" matchCount={9} onDismiss={jest.fn()} />,
    );
    expect(getByText(/Showing 9 events for/)).toBeTruthy();
    expect(getByText('Abraham')).toBeTruthy();
  });

  it('handles the singular case', () => {
    const { getByText } = renderWithProviders(
      <PersonFilterBar personName="Eve" matchCount={1} onDismiss={jest.fn()} />,
    );
    expect(getByText(/Showing 1 event for/)).toBeTruthy();
  });

  it('calls onDismiss when the close button is tapped', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PersonFilterBar personName="Paul" matchCount={5} onDismiss={onDismiss} />,
    );
    fireEvent.press(getByLabelText('Clear person filter'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('exposes a composite accessibility label', () => {
    const { getByLabelText } = renderWithProviders(
      <PersonFilterBar personName="Moses" matchCount={12} onDismiss={jest.fn()} />,
    );
    expect(getByLabelText('Showing 12 events for Moses')).toBeTruthy();
  });
});
