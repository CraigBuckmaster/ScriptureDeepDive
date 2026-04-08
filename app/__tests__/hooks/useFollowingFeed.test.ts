import { renderHook, waitFor } from '@testing-library/react-native';

const mockUser = { id: 'user-123', email: 'test@test.com' };

const mockFollowing = [
  { id: 'f1', target_id: 'topic-a', target_type: 'topic' },
  { id: 'f2', target_id: 'topic-b', target_type: 'topic' },
];

const mockFeedData = [
  {
    id: 's1', title: 'Great insight', body: 'Content here',
    target_id: 'topic-a', target_type: 'topic',
    author_name: 'John', created_at: '2025-01-01',
  },
  {
    id: 's2', title: 'Another post', body: 'More content',
    target_id: 'topic-b', target_type: 'topic',
    author_name: 'Jane', created_at: '2025-01-02',
  },
];

let mockUserValue: any = mockUser;

jest.mock('@/stores', () => ({
  useAuthStore: (selector: any) => selector({ user: mockUserValue }),
}));

const mockGetFollowing = jest.fn();
jest.mock('@/services/socialApi', () => ({
  getFollowing: (...args: any[]) => mockGetFollowing(...args),
}));

const mockSupabaseFrom = jest.fn();
jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => ({
    from: (...args: any[]) => mockSupabaseFrom(...args),
  })),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const { getSupabase } = require('@/lib/supabase');

function setupSupabaseChain(data: any[] | null, error: any = null) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data, error }),
  };
  mockSupabaseFrom.mockReturnValue(chain);
  return chain;
}

describe('useFollowingFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserValue = mockUser;
    mockGetFollowing.mockResolvedValue(mockFollowing);
    setupSupabaseChain(mockFeedData);
  });

  it('loads feed items for authenticated user', async () => {
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feed).toHaveLength(2);
    expect(result.current.followedIds).toEqual(['topic-a', 'topic-b']);
    expect(result.current.hasFollows).toBe(true);
  });

  it('returns empty feed when user is null', async () => {
    mockUserValue = null;
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feed).toEqual([]);
    expect(result.current.followedIds).toEqual([]);
    expect(result.current.hasFollows).toBe(false);
    expect(mockGetFollowing).not.toHaveBeenCalled();
  });

  it('returns empty feed when user follows nothing', async () => {
    mockGetFollowing.mockResolvedValueOnce([]);
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feed).toEqual([]);
    expect(result.current.followedIds).toEqual([]);
    expect(result.current.hasFollows).toBe(false);
  });

  it('returns empty feed when supabase is null', async () => {
    getSupabase.mockReturnValueOnce(null);
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feed).toEqual([]);
  });

  it('handles supabase query error', async () => {
    setupSupabaseChain(null, { message: 'query failed' });
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feed).toEqual([]);
  });

  it('handles getFollowing error gracefully', async () => {
    mockGetFollowing.mockRejectedValueOnce(new Error('network error'));
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feed).toEqual([]);
  });

  it('exposes a refresh callback', async () => {
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refresh).toBe('function');
  });

  it('starts in loading state', () => {
    const { useFollowingFeed } = require('@/hooks/useFollowingFeed');
    const { result } = renderHook(() => useFollowingFeed());
    expect(result.current.loading).toBe(true);
  });
});
