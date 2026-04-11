import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useHighlightsForChapter } from '@/hooks/useHighlights';

const mockSetHighlight = jest.fn().mockResolvedValue(undefined);
const mockRemoveHighlight = jest.fn().mockResolvedValue(undefined);
const mockGetHighlights = jest.fn().mockResolvedValue([]);

jest.mock('@/db/user', () => ({
  getHighlightsForChapter: (...args: any[]) => mockGetHighlights(...args),
  setHighlight: (...args: any[]) => mockSetHighlight(...args),
  removeHighlight: (...args: any[]) => mockRemoveHighlight(...args),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

describe('useHighlightsForChapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHighlights.mockResolvedValue([]);
  });

  it('returns empty highlights initially', async () => {
    const { result } = renderHook(() => useHighlightsForChapter('genesis', 1));
    await waitFor(() => expect(mockGetHighlights).toHaveBeenCalled());
    expect(result.current.highlights.size).toBe(0);
  });

  it('loads highlights from DB', async () => {
    mockGetHighlights.mockResolvedValue([
      { verse_ref: 'genesis 1:1', color: 'yellow' },
      { verse_ref: 'genesis 1:3', color: 'blue' },
    ]);
    const { result } = renderHook(() => useHighlightsForChapter('genesis', 1));
    await waitFor(() => expect(result.current.highlights.size).toBe(2));
    expect(result.current.highlights.get(1)).toBe('yellow');
    expect(result.current.highlights.get(3)).toBe('blue');
  });

  it('does nothing when bookId is null', () => {
    const { result } = renderHook(() => useHighlightsForChapter(null, 1));
    expect(result.current.highlights.size).toBe(0);
    expect(mockGetHighlights).not.toHaveBeenCalled();
  });

  it('toggleHighlight sets a highlight with color', async () => {
    mockGetHighlights.mockResolvedValue([]);
    const { result } = renderHook(() => useHighlightsForChapter('genesis', 1));
    await waitFor(() => expect(mockGetHighlights).toHaveBeenCalled());

    await act(async () => {
      await result.current.toggleHighlight(5, 'yellow');
    });

    expect(mockSetHighlight).toHaveBeenCalledWith('genesis 1:5', 'yellow');
  });

  it('toggleHighlight removes a highlight when color is null', async () => {
    mockGetHighlights.mockResolvedValue([]);
    const { result } = renderHook(() => useHighlightsForChapter('genesis', 1));
    await waitFor(() => expect(mockGetHighlights).toHaveBeenCalled());

    await act(async () => {
      await result.current.toggleHighlight(5, null);
    });

    expect(mockRemoveHighlight).toHaveBeenCalledWith('genesis 1:5');
  });

  it('toggleHighlight does nothing when bookId is null', async () => {
    const { result } = renderHook(() => useHighlightsForChapter(null, 1));

    await act(async () => {
      await result.current.toggleHighlight(5, 'yellow');
    });

    expect(mockSetHighlight).not.toHaveBeenCalled();
    expect(mockRemoveHighlight).not.toHaveBeenCalled();
  });

  it('toggleHighlight reloads highlights after setting', async () => {
    mockGetHighlights.mockResolvedValue([]);
    const { result } = renderHook(() => useHighlightsForChapter('genesis', 1));
    await waitFor(() => expect(mockGetHighlights).toHaveBeenCalled());

    const callCountBefore = mockGetHighlights.mock.calls.length;

    mockGetHighlights.mockResolvedValue([
      { verse_ref: 'genesis 1:5', color: 'yellow' },
    ]);

    await act(async () => {
      await result.current.toggleHighlight(5, 'yellow');
    });

    // Should have been called again for reload
    expect(mockGetHighlights.mock.calls.length).toBeGreaterThan(callCountBefore);
  });

  it('skips verse refs where verse number cannot be extracted', async () => {
    mockGetHighlights.mockResolvedValue([
      { verse_ref: 'genesis 1:3', color: 'blue' },
      { verse_ref: 'invalid-ref', color: 'yellow' },
    ]);

    const { result } = renderHook(() => useHighlightsForChapter('genesis', 1));
    await waitFor(() => expect(result.current.highlights.size).toBe(1));
    expect(result.current.highlights.get(3)).toBe('blue');
  });

  it('reloads when chapter changes', async () => {
    mockGetHighlights.mockResolvedValue([
      { verse_ref: 'genesis 1:1', color: 'yellow' },
    ]);

    const { result, rerender } = renderHook(
      ({ ch }: { ch: number }) => useHighlightsForChapter('genesis', ch),
      { initialProps: { ch: 1 } },
    );
    await waitFor(() => expect(result.current.highlights.size).toBe(1));

    mockGetHighlights.mockResolvedValue([
      { verse_ref: 'genesis 2:1', color: 'blue' },
    ]);

    rerender({ ch: 2 });
    await waitFor(() => expect(result.current.highlights.get(1)).toBe('blue'));
  });
});
