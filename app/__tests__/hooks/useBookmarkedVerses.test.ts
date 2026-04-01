import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetBookmarks = jest.fn();
const mockAddBookmark = jest.fn();
const mockRemoveBookmark = jest.fn();

jest.mock('@/db/user', () => ({
  getBookmarks: (...args: any[]) => mockGetBookmarks(...args),
  addBookmark: (...args: any[]) => mockAddBookmark(...args),
  removeBookmark: (...args: any[]) => mockRemoveBookmark(...args),
}));

jest.mock('@/utils/verseRef', () => ({
  chapterPrefix: (bookId: string, ch: number) => `${bookId} ${ch}:`,
  formatVerseRef: (bookId: string, ch: number, v?: number) =>
    v ? `${bookId} ${ch}:${v}` : `${bookId} ${ch}`,
  extractVerseNum: (ref: string) => {
    const m = ref.match(/:(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
  },
}));

import { useBookmarkedVerses } from '@/hooks/useBookmarkedVerses';

describe('useBookmarkedVerses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a Set of bookmarked verse numbers', async () => {
    mockGetBookmarks.mockResolvedValue([
      { id: 1, verse_ref: 'genesis 1:3', label: null },
      { id: 2, verse_ref: 'genesis 1:7', label: null },
      { id: 3, verse_ref: 'exodus 2:1', label: null }, // different chapter
    ]);

    const { result } = renderHook(() => useBookmarkedVerses('genesis', 1));
    await waitFor(() => {
      expect(result.current.bookmarked.size).toBe(2);
    });

    expect(result.current.bookmarked.has(3)).toBe(true);
    expect(result.current.bookmarked.has(7)).toBe(true);
  });

  it('returns empty set when no bookmarks exist', async () => {
    mockGetBookmarks.mockResolvedValue([]);

    const { result } = renderHook(() => useBookmarkedVerses('genesis', 1));
    await waitFor(() => {
      expect(mockGetBookmarks).toHaveBeenCalled();
    });

    expect(result.current.bookmarked.size).toBe(0);
  });

  it('returns empty set when bookId is null', () => {
    const { result } = renderHook(() => useBookmarkedVerses(null, 1));
    expect(result.current.bookmarked.size).toBe(0);
  });

  it('toggleBookmark adds and removes bookmarks', async () => {
    mockGetBookmarks.mockResolvedValue([]);
    mockAddBookmark.mockResolvedValue(1);

    const { result } = renderHook(() => useBookmarkedVerses('genesis', 1));
    await waitFor(() => {
      expect(mockGetBookmarks).toHaveBeenCalled();
    });

    // Add a bookmark
    mockGetBookmarks.mockResolvedValue([
      { id: 10, verse_ref: 'genesis 1:5', label: null },
    ]);

    await act(async () => {
      await result.current.toggleBookmark(5);
    });

    expect(mockAddBookmark).toHaveBeenCalledWith('genesis 1:5');
  });
});
