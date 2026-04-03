import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetNotesForChapter = jest.fn();

jest.mock('@/db/user', () => ({
  getNotesForChapter: (...args: any[]) => mockGetNotesForChapter(...args),
}));

jest.mock('@/utils/verseRef', () => ({
  extractVerseNum: (ref: string) => {
    const m = ref.match(/:(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
  },
}));

import { useNotedVerses } from '@/hooks/useNotedVerses';

describe('useNotedVerses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a Set of verse numbers that have notes', async () => {
    mockGetNotesForChapter.mockResolvedValue([
      { verse_ref: 'genesis 1:3', note_text: 'Light' },
      { verse_ref: 'genesis 1:7', note_text: 'Firmament' },
    ]);

    const { result } = renderHook(() => useNotedVerses('genesis', 1));
    await waitFor(() => {
      expect(result.current.size).toBe(2);
    });

    expect(result.current.has(3)).toBe(true);
    expect(result.current.has(7)).toBe(true);
  });

  it('returns empty set when no notes exist', async () => {
    mockGetNotesForChapter.mockResolvedValue([]);

    const { result } = renderHook(() => useNotedVerses('genesis', 1));
    await waitFor(() => {
      expect(mockGetNotesForChapter).toHaveBeenCalled();
    });

    expect(result.current.size).toBe(0);
  });

  it('returns empty set when bookId is null', () => {
    const { result } = renderHook(() => useNotedVerses(null, 1));
    expect(result.current.size).toBe(0);
    expect(mockGetNotesForChapter).not.toHaveBeenCalled();
  });

  it('updates when bookId or chapterNum change', async () => {
    mockGetNotesForChapter
      .mockResolvedValueOnce([{ verse_ref: 'genesis 1:1', note_text: 'Start' }])
      .mockResolvedValueOnce([{ verse_ref: 'genesis 2:5', note_text: 'Day' }]);

    const { result, rerender } = renderHook(
      ({ bookId, ch }: { bookId: string; ch: number }) => useNotedVerses(bookId, ch),
      { initialProps: { bookId: 'genesis', ch: 1 } }
    );

    await waitFor(() => {
      expect(result.current.has(1)).toBe(true);
    });

    rerender({ bookId: 'genesis', ch: 2 });

    await waitFor(() => {
      expect(result.current.has(5)).toBe(true);
    });

    expect(mockGetNotesForChapter).toHaveBeenCalledTimes(2);
  });
});
