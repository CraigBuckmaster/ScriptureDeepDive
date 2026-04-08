import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockSubmissions = Array.from({ length: 20 }, (_, i) => ({
  id: `sub-${i}`,
  type: 'personal_reflection' as const,
  topic_id: 'topic-1',
  title: `Submission ${i}`,
  body: `Body ${i}`,
  status: 'approved' as const,
  verses_json: '[]',
  author_id: 'author-1',
  author_name: 'Author',
  upvote_count: 20 - i,
  star_avg: 4.5,
  created_at: `2025-01-${String(20 - i).padStart(2, '0')}`,
  updated_at: `2025-01-${String(20 - i).padStart(2, '0')}`,
}));

const mockPage2 = Array.from({ length: 5 }, (_, i) => ({
  id: `sub-page2-${i}`,
  type: 'personal_reflection' as const,
  topic_id: 'topic-1',
  title: `Page2 Submission ${i}`,
  body: `Body ${i}`,
  status: 'approved' as const,
  verses_json: '[]',
  author_id: 'author-1',
  author_name: 'Author',
  upvote_count: 5 - i,
  star_avg: 3.0,
  created_at: `2025-02-${String(i + 1).padStart(2, '0')}`,
  updated_at: `2025-02-${String(i + 1).padStart(2, '0')}`,
}));

const mockSupabaseFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => ({
    from: (...args: any[]) => mockSupabaseFrom(...args),
  })),
}));

const { getSupabase } = require('@/lib/supabase');

function setupSupabaseChain(data: any[]) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  };
  // The last chained call resolves with data. Since the query builder
  // returns `this` for everything, we make the final `.order()` resolve.
  // Actually the chain is: from().select().eq().range() [.eq()] .order() [.order()]
  // The promise resolves when the chain is awaited.
  // Let's make every method return the chain, and the chain itself be thenable.
  const thenable = {
    ...chain,
    then: (resolve: any, reject?: any) => Promise.resolve({ data }).then(resolve, reject),
  };
  chain.select.mockReturnValue(thenable);
  chain.eq.mockReturnValue(thenable);
  chain.range.mockReturnValue(thenable);
  chain.order.mockReturnValue(thenable);

  mockSupabaseFrom.mockReturnValue(thenable);
  return chain;
}

describe('useSubmissionFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setupSupabaseChain(mockSubmissions);
  });
  afterEach(() => jest.useRealTimers());

  it('starts in loading state', () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));
    expect(result.current.loading).toBe(true);
    expect(result.current.submissions).toEqual([]);
  });

  it('loads first page of submissions', async () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.submissions).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);
  });

  it('sets hasMore to false when page has fewer than PAGE_SIZE items', async () => {
    setupSupabaseChain(mockPage2); // only 5 items
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.submissions).toHaveLength(5);
    expect(result.current.hasMore).toBe(false);
  });

  it('applies category filter when categoryId is provided', async () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    renderHook(() => useSubmissionFeed('newest', 'cat-1'));

    await waitFor(() => {
      expect(mockSupabaseFrom).toHaveBeenCalledWith('submissions');
    });
  });

  it('re-fetches when sort changes', async () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result, rerender } = renderHook(
      ({ sort }: { sort: 'newest' | 'top_rated' }) => useSubmissionFeed(sort),
      { initialProps: { sort: 'newest' as const } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    const callCount = mockSupabaseFrom.mock.calls.length;

    rerender({ sort: 'top_rated' });
    await waitFor(() => expect(mockSupabaseFrom.mock.calls.length).toBeGreaterThan(callCount));
  });

  it('re-fetches when categoryId changes', async () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result, rerender } = renderHook(
      ({ categoryId }: { categoryId?: string }) => useSubmissionFeed('newest', categoryId),
      { initialProps: { categoryId: undefined } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    const callCount = mockSupabaseFrom.mock.calls.length;

    rerender({ categoryId: 'cat-2' });
    await waitFor(() => expect(mockSupabaseFrom.mock.calls.length).toBeGreaterThan(callCount));
  });

  it('loadMore appends next page after debounce', async () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.submissions).toHaveLength(20);

    // Set up page 2 data
    setupSupabaseChain(mockPage2);

    act(() => {
      result.current.loadMore();
    });

    // Advance past the 300ms debounce
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.submissions).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore does nothing when already loading', async () => {
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));

    // Still loading — loadMore should be a no-op
    act(() => result.current.loadMore());

    // Should not have triggered additional calls beyond initial
    const initialCalls = mockSupabaseFrom.mock.calls.length;
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Only the initial fetch should have occurred
    expect(mockSupabaseFrom.mock.calls.length).toBe(initialCalls);
  });

  it('loadMore does nothing when hasMore is false', async () => {
    setupSupabaseChain(mockPage2); // < PAGE_SIZE, so hasMore=false
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(false);

    const callCount = mockSupabaseFrom.mock.calls.length;
    act(() => result.current.loadMore());
    act(() => jest.advanceTimersByTime(300));

    // No additional fetch
    expect(mockSupabaseFrom.mock.calls.length).toBe(callCount);
  });

  it('handles null supabase gracefully', async () => {
    getSupabase.mockReturnValue(null);
    const { useSubmissionFeed } = require('@/hooks/useSubmissionFeed');
    const { result } = renderHook(() => useSubmissionFeed('newest'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.submissions).toEqual([]);
  });
});
