import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockIsTopicBookmarked = jest.fn();
const mockBookmarkTopic = jest.fn();
const mockUnbookmarkTopic = jest.fn();

jest.mock('@/db/userQueries', () => ({
  isTopicBookmarked: (...args: any[]) => mockIsTopicBookmarked(...args),
}));

jest.mock('@/db/userMutations', () => ({
  bookmarkTopic: (...args: any[]) => mockBookmarkTopic(...args),
  unbookmarkTopic: (...args: any[]) => mockUnbookmarkTopic(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useTopicBookmark } from '@/hooks/useTopicBookmark';

describe('useTopicBookmark', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookmarkTopic.mockResolvedValue(undefined);
    mockUnbookmarkTopic.mockResolvedValue(undefined);
  });

  it('starts with isBookmarked false', () => {
    mockIsTopicBookmarked.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTopicBookmark('topic-1'));
    expect(result.current.isBookmarked).toBe(false);
  });

  it('loads bookmarked status as true', async () => {
    mockIsTopicBookmarked.mockResolvedValue(true);

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });

    expect(mockIsTopicBookmarked).toHaveBeenCalledWith('topic-1');
  });

  it('loads bookmarked status as false', async () => {
    mockIsTopicBookmarked.mockResolvedValue(false);

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(mockIsTopicBookmarked).toHaveBeenCalled();
    });

    expect(result.current.isBookmarked).toBe(false);
  });

  it('handles load failure gracefully', async () => {
    mockIsTopicBookmarked.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    // Wait for the async call to complete
    await waitFor(() => {
      expect(mockIsTopicBookmarked).toHaveBeenCalled();
    });

    expect(result.current.isBookmarked).toBe(false);
  });

  it('toggle bookmarks a topic that is not bookmarked', async () => {
    mockIsTopicBookmarked.mockResolvedValue(false);

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(mockIsTopicBookmarked).toHaveBeenCalled();
    });

    act(() => {
      result.current.toggle('official', 'My Topic', 'Summary text');
    });

    // Optimistic: should flip immediately
    expect(result.current.isBookmarked).toBe(true);

    await waitFor(() => {
      expect(mockBookmarkTopic).toHaveBeenCalledWith('topic-1', 'official', 'My Topic', 'Summary text');
    });
  });

  it('toggle uses default type when none provided', async () => {
    mockIsTopicBookmarked.mockResolvedValue(false);

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(mockIsTopicBookmarked).toHaveBeenCalled();
    });

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(mockBookmarkTopic).toHaveBeenCalledWith('topic-1', 'official', undefined, undefined);
    });
  });

  it('toggle unbookmarks a topic that is already bookmarked', async () => {
    mockIsTopicBookmarked.mockResolvedValue(true);

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistic: should flip immediately
    expect(result.current.isBookmarked).toBe(false);

    await waitFor(() => {
      expect(mockUnbookmarkTopic).toHaveBeenCalledWith('topic-1');
    });
  });

  it('reverts optimistic update on bookmark failure', async () => {
    mockIsTopicBookmarked.mockResolvedValue(false);
    mockBookmarkTopic.mockRejectedValue(new Error('DB write error'));

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(mockIsTopicBookmarked).toHaveBeenCalled();
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistically set to true
    expect(result.current.isBookmarked).toBe(true);

    // After the async error, it should revert
    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(false);
    });
  });

  it('reverts optimistic update on unbookmark failure', async () => {
    mockIsTopicBookmarked.mockResolvedValue(true);
    mockUnbookmarkTopic.mockRejectedValue(new Error('DB write error'));

    const { result } = renderHook(() => useTopicBookmark('topic-1'));

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });

    act(() => {
      result.current.toggle();
    });

    // Optimistically set to false
    expect(result.current.isBookmarked).toBe(false);

    // After the async error, it should revert
    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });
  });

  it('reloads bookmark status when topicId changes', async () => {
    mockIsTopicBookmarked.mockResolvedValue(false);

    const { result, rerender } = renderHook(
      ({ topicId }: { topicId: string }) => useTopicBookmark(topicId),
      { initialProps: { topicId: 'topic-1' } },
    );

    await waitFor(() => {
      expect(mockIsTopicBookmarked).toHaveBeenCalledWith('topic-1');
    });

    mockIsTopicBookmarked.mockResolvedValue(true);

    rerender({ topicId: 'topic-2' });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });

    expect(mockIsTopicBookmarked).toHaveBeenCalledWith('topic-2');
  });

  it('cancels in-flight check on unmount', async () => {
    let resolvePromise: (v: boolean) => void;
    mockIsTopicBookmarked.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { unmount } = renderHook(() => useTopicBookmark('topic-1'));

    unmount();

    // Resolve after unmount — should not cause errors
    await act(async () => {
      resolvePromise!(true);
    });
  });
});
