import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetAllAsync = jest.fn();
const mockGetFirstAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useRecommendations } from '@/hooks/useRecommendations';

describe('useRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array initially when no reading history', async () => {
    mockGetFirstAsync.mockResolvedValue({ count: 0 });
    mockGetAllAsync.mockResolvedValue([]);

    const { result } = renderHook(() => useRecommendations());
    await waitFor(() => {
      // Even with no data, the hook resolves
      expect(result.current).toEqual([]);
    });
  });

  it('returns recommendations array based on reading history', async () => {
    // Total chapters: 5+
    mockGetFirstAsync
      .mockResolvedValueOnce({ count: 15 })  // totalChapters
      .mockResolvedValueOnce({ count: 2 })   // study_depth count
      .mockResolvedValueOnce({ count: 0 });  // heb opens

    // Books read: genesis with 4 chapters
    mockGetAllAsync.mockResolvedValue([
      { book_id: 'genesis', count: 4 },
    ]);

    const { result } = renderHook(() => useRecommendations());
    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    // Should include covenant recommendation (genesis >= 3)
    const ids = result.current.map((r) => r.id);
    expect(ids).toContain('covenant-concept');
  });

  it('uses journeyId param in covenant recommendation', async () => {
    mockGetFirstAsync
      .mockResolvedValueOnce({ count: 5 })
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 0 });

    mockGetAllAsync.mockResolvedValue([
      { book_id: 'genesis', count: 5 },
    ]);

    const { result } = renderHook(() => useRecommendations());
    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const covenant = result.current.find((r) => r.id === 'covenant-concept');
    expect(covenant).toBeDefined();
    expect((covenant!.params as any).params.journeyId).toBe('covenant');
  });

  it('sorts recommendations by priority descending', async () => {
    mockGetFirstAsync
      .mockResolvedValueOnce({ count: 20 })  // total chapters
      .mockResolvedValueOnce({ count: 1 })   // study_depth
      .mockResolvedValueOnce({ count: 0 });  // heb opens

    mockGetAllAsync.mockResolvedValue([
      { book_id: 'genesis', count: 5 },
      { book_id: 'isaiah', count: 2 },
    ]);

    const { result } = renderHook(() => useRecommendations());
    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(1);
    });

    // Verify sorted by priority descending
    for (let i = 1; i < result.current.length; i++) {
      expect(result.current[i - 1].priority).toBeGreaterThanOrEqual(
        result.current[i].priority
      );
    }
  });

  it('returns at most 4 recommendations', async () => {
    mockGetFirstAsync
      .mockResolvedValueOnce({ count: 20 })
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 6 });

    mockGetAllAsync.mockResolvedValue([
      { book_id: 'genesis', count: 5 },
      { book_id: 'isaiah', count: 3 },
      { book_id: 'matthew', count: 11 },
      { book_id: 'mark', count: 2 },
      { book_id: 'luke', count: 2 },
    ]);

    const { result } = renderHook(() => useRecommendations());
    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    expect(result.current.length).toBeLessThanOrEqual(4);
  });
});
