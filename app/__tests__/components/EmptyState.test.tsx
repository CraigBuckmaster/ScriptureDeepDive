import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import EmptyState from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders title text', () => {
    const { getByText } = renderWithProviders(
      <EmptyState title="No results found" />,
    );
    expect(getByText('No results found')).toBeTruthy();
  });

  it('renders action button when action prop is provided', () => {
    const mockAction = jest.fn();
    const { getByText } = renderWithProviders(
      <EmptyState
        title="Nothing here"
        variant="error"
        action={{ label: 'Retry', onPress: mockAction }}
      />,
    );
    expect(getByText('Retry')).toBeTruthy();
    fireEvent.press(getByText('Retry'));
    expect(mockAction).toHaveBeenCalled();
  });
});
