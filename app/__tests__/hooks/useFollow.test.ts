import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetFollowing = jest.fn();
const mockGetFollowers = jest.fn();
const mockFollowTarget = jest.fn();
const mockUnfollowTarget = jest.fn();

jest.mock('@/stores', () => ({
  useAuthStore: (sel: any) =>
    sel({
      user: { id: 'user-1', email: 'test@test.com' },
    }),
}));

jest.mock('@/services/socialApi', () => ({
  getFollowing: (...args: any[]) => mockGetFollowing(...args),
  getFollowers: (...args: any[]) => mockGetFollowers(...args),
  followTarget: (...args: any[]) => mockFollowTarget(...args),
  unfollowTarget: (...args: any[]) => mockUnfollowTarget(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useFollow } from '@/hooks/useFollow';

describe('useFollow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFollowing.mockResolvedValue([]);
    mockGetFollowers.mockResolvedValue(0);
    mockFollowTarget.mockResolvedValue(true);
    mockUnfollowTarget.mockResolvedValue(true);
  });

  it('starts in loading state', () => {
    mockGetFollowing.mockReturnValue(new Promise(() => {}));
    mockGetFollowers.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFollow('target-1', 'topic'));
    expect(result.current.loading).toBe(true);
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(0);
  });

  it('loads initial follow state (not following)', async () => {
    mockGetFollowing.mockResolvedValue([]);
    mockGetFollowers.mockResolvedValue(42);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(42);
    expect(mockGetFollowing).toHaveBeenCalledWith('user-1');
    expect(mockGetFollowers).toHaveBeenCalledWith('target-1');
  });

  it('detects when user is already following the target', async () => {
    mockGetFollowing.mockResolvedValue([
      { target_id: 'target-1', target_type: 'topic', followed_at: '2026-01-01' },
      { target_id: 'other', target_type: 'user', followed_at: '2026-01-01' },
    ]);
    mockGetFollowers.mockResolvedValue(10);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followerCount).toBe(10);
  });

  it('does not match follow records with different target_type', async () => {
    mockGetFollowing.mockResolvedValue([
      { target_id: 'target-1', target_type: 'user', followed_at: '2026-01-01' },
    ]);
    mockGetFollowers.mockResolvedValue(5);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFollowing).toBe(false);
  });

  it('handles load failure gracefully', async () => {
    mockGetFollowing.mockRejectedValue(new Error('network error'));
    mockGetFollowers.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(0);
  });

  it('toggle follows when not currently following', async () => {
    mockGetFollowing.mockResolvedValue([]);
    mockGetFollowers.mockResolvedValue(10);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistic update happens synchronously
    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followerCount).toBe(11);

    await waitFor(() => {
      expect(mockFollowTarget).toHaveBeenCalledWith('target-1', 'topic', 'user-1');
    });
  });

  it('toggle unfollows when currently following', async () => {
    mockGetFollowing.mockResolvedValue([
      { target_id: 'target-1', target_type: 'topic', followed_at: '2026-01-01' },
    ]);
    mockGetFollowers.mockResolvedValue(10);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistic update happens synchronously
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(9);

    await waitFor(() => {
      expect(mockUnfollowTarget).toHaveBeenCalledWith('target-1', 'topic', 'user-1');
    });
  });

  it('reverts optimistic update on follow failure', async () => {
    mockGetFollowing.mockResolvedValue([]);
    mockGetFollowers.mockResolvedValue(10);
    mockFollowTarget.mockResolvedValue(false);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistic: flipped
    expect(result.current.isFollowing).toBe(true);

    // After the API returns false, it should revert
    await waitFor(() => {
      expect(result.current.isFollowing).toBe(false);
    });

    expect(result.current.followerCount).toBe(10);
  });

  it('reverts optimistic update on unfollow failure', async () => {
    mockGetFollowing.mockResolvedValue([
      { target_id: 'target-1', target_type: 'topic', followed_at: '2026-01-01' },
    ]);
    mockGetFollowers.mockResolvedValue(10);
    mockUnfollowTarget.mockResolvedValue(false);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistic: flipped
    expect(result.current.isFollowing).toBe(false);

    // After the API returns false, it should revert
    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });

    expect(result.current.followerCount).toBe(10);
  });

  it('followerCount does not go below zero on unfollow', async () => {
    mockGetFollowing.mockResolvedValue([
      { target_id: 'target-1', target_type: 'topic', followed_at: '2026-01-01' },
    ]);
    mockGetFollowers.mockResolvedValue(0);

    const { result } = renderHook(() => useFollow('target-1', 'topic'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(mockUnfollowTarget).toHaveBeenCalled();
    });

    expect(result.current.followerCount).toBe(0);
  });
});
