import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { UpvoteButton } from '@/components/engagement/UpvoteButton';

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'user-1' } })),
}));

describe('UpvoteButton', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByRole } = renderWithProviders(
      <UpvoteButton count={5} isUpvoted={false} onToggle={mockOnToggle} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('shows the upvote count when count > 0', () => {
    const { getByText } = renderWithProviders(
      <UpvoteButton count={42} isUpvoted={false} onToggle={mockOnToggle} />,
    );
    expect(getByText('42')).toBeTruthy();
  });

  it('does not show count when count is 0', () => {
    const { queryByText } = renderWithProviders(
      <UpvoteButton count={0} isUpvoted={false} onToggle={mockOnToggle} />,
    );
    expect(queryByText('0')).toBeNull();
  });

  it('handles press with debounced onToggle', () => {
    jest.useFakeTimers();
    const { getByRole } = renderWithProviders(
      <UpvoteButton count={5} isUpvoted={false} onToggle={mockOnToggle} />,
    );
    fireEvent.press(getByRole('button'));
    jest.advanceTimersByTime(300);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
