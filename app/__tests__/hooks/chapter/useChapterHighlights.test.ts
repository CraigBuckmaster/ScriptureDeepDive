import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetHighlightsForChapter = jest.fn().mockResolvedValue([]);

jest.mock('@/db/user', () => ({
  getHighlightsForChapter: (...args: any[]) => mockGetHighlightsForChapter(...args),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

jest.mock('@/components/HighlightColorPicker', () => ({
  HIGHLIGHT_COLORS: [
    { name: 'gold', hex: '#bfa050', label: 'Key verses' },
    { name: 'blue', hex: '#5b8fb9', label: 'Commands' },
    { name: 'green', hex: '#5fa87a', label: 'Prayers' },
    { name: 'purple', hex: '#8b7cb8', label: 'Study later' },
    { name: 'coral', hex: '#c47a6a', label: 'Prophecy' },
    { name: 'teal', hex: '#5ba8a0', label: 'Themes' },
  ],
}));

import { useChapterHighlights } from '@/hooks/chapter/useChapterHighlights';

describe('useChapterHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHighlightsForChapter.mockResolvedValue([]);
  });

  it('returns empty map initially', async () => {
    const { result } = renderHook(() => useChapterHighlights('genesis', 1));
    await waitFor(() => {
      expect(mockGetHighlightsForChapter).toHaveBeenCalledWith('genesis', 1);
    });
    expect(result.current.highlightMap.size).toBe(0);
    expect(result.current.highlights).toEqual([]);
  });

  it('builds correct highlightMap from highlight data', async () => {
    mockGetHighlightsForChapter.mockResolvedValue([
      { id: 1, verse_ref: 'genesis 1:1', color: 'gold', created_at: '', collection_id: null, note: null },
      { id: 2, verse_ref: 'genesis 1:5', color: 'blue', created_at: '', collection_id: null, note: null },
      { id: 3, verse_ref: 'genesis 1:10', color: 'green', created_at: '', collection_id: null, note: null },
    ]);

    const { result } = renderHook(() => useChapterHighlights('genesis', 1));

    await waitFor(() => {
      expect(result.current.highlightMap.size).toBe(3);
    });

    expect(result.current.highlightMap.get(1)).toBe('#bfa050');
    expect(result.current.highlightMap.get(5)).toBe('#5b8fb9');
    expect(result.current.highlightMap.get(10)).toBe('#5fa87a');
  });

  it('skips highlights with unrecognized color names', async () => {
    mockGetHighlightsForChapter.mockResolvedValue([
      { id: 1, verse_ref: 'genesis 1:1', color: 'gold', created_at: '', collection_id: null, note: null },
      { id: 2, verse_ref: 'genesis 1:3', color: 'unknown_color', created_at: '', collection_id: null, note: null },
    ]);

    const { result } = renderHook(() => useChapterHighlights('genesis', 1));

    await waitFor(() => {
      expect(result.current.highlightMap.size).toBe(1);
    });

    expect(result.current.highlightMap.get(1)).toBe('#bfa050');
    expect(result.current.highlightMap.has(3)).toBe(false);
  });

  it('skips highlights with invalid verse_ref (no colon)', async () => {
    mockGetHighlightsForChapter.mockResolvedValue([
      { id: 1, verse_ref: 'genesis 1', color: 'gold', created_at: '', collection_id: null, note: null },
    ]);

    const { result } = renderHook(() => useChapterHighlights('genesis', 1));

    await waitFor(() => {
      expect(mockGetHighlightsForChapter).toHaveBeenCalled();
    });

    expect(result.current.highlightMap.size).toBe(0);
  });

  it('does not call getHighlightsForChapter when bookId is empty', () => {
    renderHook(() => useChapterHighlights('', 1));
    expect(mockGetHighlightsForChapter).not.toHaveBeenCalled();
  });

  it('reloads highlights when chapter changes', async () => {
    mockGetHighlightsForChapter.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ bookId, chapterNum }) => useChapterHighlights(bookId, chapterNum),
      { initialProps: { bookId: 'genesis', chapterNum: 1 } },
    );

    await waitFor(() => {
      expect(mockGetHighlightsForChapter).toHaveBeenCalledWith('genesis', 1);
    });

    rerender({ bookId: 'genesis', chapterNum: 2 });

    await waitFor(() => {
      expect(mockGetHighlightsForChapter).toHaveBeenCalledWith('genesis', 2);
    });
  });

  it('exposes loadHighlights for manual refresh', async () => {
    const { result } = renderHook(() => useChapterHighlights('genesis', 1));

    await waitFor(() => {
      expect(mockGetHighlightsForChapter).toHaveBeenCalledTimes(1);
    });

    result.current.loadHighlights();

    await waitFor(() => {
      expect(mockGetHighlightsForChapter).toHaveBeenCalledTimes(2);
    });
  });
});
