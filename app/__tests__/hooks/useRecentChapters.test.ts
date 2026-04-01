import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetRecentChapters = jest.fn();

jest.mock('@/db/user', () => ({
  getRecentChapters: (...args: any[]) => mockGetRecentChapters(...args),
}));

import { useRecentChapters } from '@/hooks/useRecentChapters';

describe('useRecentChapters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns recent chapters list after loading', async () => {
    const mockData = [
      { book_id: 'genesis', chapter_num: 1, book_name: 'Genesis', title: 'Creation' },
      { book_id: 'genesis', chapter_num: 2, book_name: 'Genesis', title: 'Eden' },
    ];
    mockGetRecentChapters.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRecentChapters(10));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recent).toEqual(mockData);
    expect(result.current.recent).toHaveLength(2);
  });

  it('returns empty list when no history', async () => {
    mockGetRecentChapters.mockResolvedValue([]);

    const { result } = renderHook(() => useRecentChapters(10));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recent).toEqual([]);
  });

  it('starts in loading state', () => {
    mockGetRecentChapters.mockResolvedValue([]);
    const { result } = renderHook(() => useRecentChapters());
    expect(result.current.isLoading).toBe(true);
  });
});
