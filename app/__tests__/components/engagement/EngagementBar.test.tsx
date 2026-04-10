import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { EngagementBar } from '@/components/engagement/EngagementBar';

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'user-1' } })),
}));

describe('EngagementBar', () => {
  const defaultProps = {
    upvoteCount: 10,
    isUpvoted: false,
    onUpvoteToggle: jest.fn(),
    rating: 3,
    onRate: jest.fn(),
    shareTitle: 'Share Title',
    shareBody: 'Share Body',
  };

  it('renders without crashing', () => {
    const { getByLabelText } = renderWithProviders(
      <EngagementBar {...defaultProps} />,
    );
    expect(getByLabelText('Share')).toBeTruthy();
  });

  it('shows upvote count', () => {
    const { getByText } = renderWithProviders(
      <EngagementBar {...defaultProps} />,
    );
    expect(getByText('10')).toBeTruthy();
  });
});
