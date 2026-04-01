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
});
