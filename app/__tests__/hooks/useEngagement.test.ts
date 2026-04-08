import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetEngagementCounts = jest.fn();
const mockToggleUpvote = jest.fn();
const mockSetStarRating = jest.fn();

jest.mock('@/services/engagementApi', () => ({
  getEngagementCounts: (...args: any[]) => mockGetEngagementCounts(...args),
  toggleUpvote: (...args: any[]) => mockToggleUpvote(...args),
  setStarRating: (...args: any[]) => mockSetStarRating(...args),
}));

import { useEngagement } from '@/hooks/useEngagement';

describe('useEngagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToggleUpvote.mockResolvedValue(undefined);
    mockSetStarRating.mockResolvedValue(undefined);
  });

  it('starts in loading state with default counts', () => {
    mockGetEngagementCounts.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useEngagement('topic-1', 'user-1'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.counts).toEqual({ upvotes: 0, stars_avg: 0, bookmarks: 0 });
    expect(result.current.isUpvoted).toBe(false);
    expect(result.current.rating).toBe(0);
  });

  it('loads engagement counts for the given topic', async () => {
    mockGetEngagementCounts.mockResolvedValue({
      upvotes: 10,
      stars_avg: 4.5,
      bookmarks: 3,
    });

    const { result } = renderHook(() => useEngagement('topic-1', 'user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetEngagementCounts).toHaveBeenCalledWith('topic-1');
    expect(result.current.counts).toEqual({ upvotes: 10, stars_avg: 4.5, bookmarks: 3 });
  });

  it('refetches when topicId changes', async () => {
    mockGetEngagementCounts.mockResolvedValue({ upvotes: 5, stars_avg: 3, bookmarks: 1 });

    const { result, rerender } = renderHook(
      ({ topicId }: { topicId: string }) => useEngagement(topicId, 'user-1'),
      { initialProps: { topicId: 'topic-1' } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetEngagementCounts.mockResolvedValue({ upvotes: 20, stars_avg: 5, bookmarks: 7 });

    rerender({ topicId: 'topic-2' });

    await waitFor(() => {
      expect(result.current.counts.upvotes).toBe(20);
    });

    expect(mockGetEngagementCounts).toHaveBeenCalledWith('topic-2');
  });

  it('toggleUpvote optimistically increments upvotes', async () => {
    mockGetEngagementCounts.mockResolvedValue({ upvotes: 10, stars_avg: 0, bookmarks: 0 });

    const { result } = renderHook(() => useEngagement('topic-1', 'user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleUpvote();
    });

    expect(result.current.isUpvoted).toBe(true);
    expect(result.current.counts.upvotes).toBe(11);
    expect(mockToggleUpvote).toHaveBeenCalledWith('topic-1', 'user-1');
  });

  it('toggleUpvote twice returns to original state', async () => {
    mockGetEngagementCounts.mockResolvedValue({ upvotes: 10, stars_avg: 0, bookmarks: 0 });

    const { result } = renderHook(() => useEngagement('topic-1', 'user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleUpvote();
    });

    expect(result.current.isUpvoted).toBe(true);
    expect(result.current.counts.upvotes).toBe(11);

    act(() => {
      result.current.toggleUpvote();
    });

    expect(result.current.isUpvoted).toBe(false);
    expect(result.current.counts.upvotes).toBe(10);
  });

  it('toggleUpvote does not call API when userId is undefined', async () => {
    mockGetEngagementCounts.mockResolvedValue({ upvotes: 5, stars_avg: 0, bookmarks: 0 });

    const { result } = renderHook(() => useEngagement('topic-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleUpvote();
    });

    // Optimistic update still happens
    expect(result.current.isUpvoted).toBe(true);
    expect(result.current.counts.upvotes).toBe(6);
    // But no API call
    expect(mockToggleUpvote).not.toHaveBeenCalled();
  });

  it('setRating updates rating optimistically and calls API', async () => {
    mockGetEngagementCounts.mockResolvedValue({ upvotes: 0, stars_avg: 0, bookmarks: 0 });

    const { result } = renderHook(() => useEngagement('topic-1', 'user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setRating(4);
    });

    expect(result.current.rating).toBe(4);
    expect(mockSetStarRating).toHaveBeenCalledWith('topic-1', 'user-1', 4);
  });

  it('setRating does not call API when userId is undefined', async () => {
    mockGetEngagementCounts.mockResolvedValue({ upvotes: 0, stars_avg: 0, bookmarks: 0 });

    const { result } = renderHook(() => useEngagement('topic-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setRating(3);
    });

    expect(result.current.rating).toBe(3);
    expect(mockSetStarRating).not.toHaveBeenCalled();
  });

  it('cancels in-flight fetch on unmount', async () => {
    let resolvePromise: (v: any) => void;
    mockGetEngagementCounts.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { unmount } = renderHook(() => useEngagement('topic-1', 'user-1'));

    unmount();

    // Resolve after unmount — should not cause errors
    await act(async () => {
      resolvePromise!({ upvotes: 99, stars_avg: 5, bookmarks: 10 });
    });
  });
});
