import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { CompareBar } from '@/components/CompareBar';

describe('CompareBar', () => {
  it('renders primary and comparison labels', () => {
    const { getByText } = renderWithProviders(
      <CompareBar primaryLabel="KJV" comparisonLabel="ASV" onDismiss={jest.fn()} />,
    );
    expect(getByText('Comparing KJV and ASV')).toBeTruthy();
  });

  it('calls onDismiss when X is pressed', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <CompareBar primaryLabel="KJV" comparisonLabel="ASV" onDismiss={onDismiss} />,
    );
    fireEvent.press(getByLabelText('Exit translation comparison'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = renderWithProviders(
      <CompareBar primaryLabel="KJV" comparisonLabel="ASV" onDismiss={jest.fn()} />,
    );
    expect(getByLabelText(/Comparing KJV and ASV/)).toBeTruthy();
  });
});
