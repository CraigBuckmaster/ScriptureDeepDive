import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getBooks: jest.fn().mockResolvedValue([
    { id: 'genesis', name: 'Genesis', testament: 'ot', total_chapters: 50, book_order: 1, is_live: true },
    { id: 'exodus', name: 'Exodus', testament: 'ot', total_chapters: 40, book_order: 2, is_live: true },
  ]),
  getLiveBooks: jest.fn().mockResolvedValue([
    { id: 'genesis', name: 'Genesis', testament: 'ot', total_chapters: 50, book_order: 1, is_live: true },
    { id: 'exodus', name: 'Exodus', testament: 'ot', total_chapters: 40, book_order: 2, is_live: true },
  ]),
}));

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
  }),
}));

import { useBooks } from '@/hooks/useBooks';

describe('useBooks', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useBooks());
    expect(result.current.isLoading).toBe(true);
  });

  it('loads books with progress', async () => {
    const { result } = renderHook(() => useBooks());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.books).toHaveLength(2);
    expect(result.current.books[0].chaptersRead).toBe(0);
    expect(result.current.liveBooks).toHaveLength(2);
  });
});
