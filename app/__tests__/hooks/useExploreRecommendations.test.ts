/**
 * Hook tests for useExploreRecommendations.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetRecentChapters = jest.fn();
const mockGetBook = jest.fn();

jest.mock('@/db/user', () => ({
  getRecentChapters: (...args: any[]) => mockGetRecentChapters(...args),
}));

jest.mock('@/db/content', () => ({
  getBook: (...args: any[]) => mockGetBook(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { useExploreRecommendations } from '@/hooks/useExploreRecommendations';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetRecentChapters.mockResolvedValue([]);
  mockGetBook.mockResolvedValue(null);
});

describe('useExploreRecommendations', () => {
  it('returns empty when no recent reading', async () => {
    const { result } = renderHook(() => useExploreRecommendations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recommendations).toEqual([]);
    expect(result.current.bookName).toBeNull();
  });

  it('returns per-book recs for genesis', async () => {
    mockGetRecentChapters.mockResolvedValue([{ book_id: 'genesis', chapter_num: 1 }]);
    mockGetBook.mockResolvedValue({ id: 'genesis', name: 'Genesis', genre_label: 'Theological Narrative' });
    const { result } = renderHook(() => useExploreRecommendations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bookName).toBe('Genesis');
    expect(result.current.recommendations.length).toBeGreaterThan(0);
  });

  it('falls back to genre recs for unknown book', async () => {
    mockGetRecentChapters.mockResolvedValue([{ book_id: 'leviticus', chapter_num: 1 }]);
    mockGetBook.mockResolvedValue({ id: 'leviticus', name: 'Leviticus', genre_label: 'Ritual Law' });
    const { result } = renderHook(() => useExploreRecommendations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bookName).toBe('Leviticus');
    expect(result.current.recommendations.length).toBeGreaterThan(0);
  });
});
