import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { FollowButton } from '@/components/social/FollowButton';

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'user-1' } })),
}));

describe('FollowButton', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByRole } = renderWithProviders(
      <FollowButton targetId="t-1" targetType="topic" isFollowing={false} onToggle={mockOnToggle} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('shows "Follow" when not following', () => {
    const { getByText } = renderWithProviders(
      <FollowButton targetId="t-1" targetType="topic" isFollowing={false} onToggle={mockOnToggle} />,
    );
    expect(getByText('Follow')).toBeTruthy();
  });

  it('shows "Following" when following', () => {
    const { getByText } = renderWithProviders(
      <FollowButton targetId="t-1" targetType="topic" isFollowing={true} onToggle={mockOnToggle} />,
    );
    expect(getByText('Following')).toBeTruthy();
  });
});
