import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useSearch } from '@/hooks/useSearch';

jest.mock('@/db/content', () => ({
  searchVerses: jest.fn().mockResolvedValue([]),
  searchPeople: jest.fn().mockResolvedValue([]),
  getAllWordStudies: jest.fn().mockResolvedValue([]),
}));

describe('useSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns empty results for short query', () => {
    const { result } = renderHook(() => useSearch('a'));
    expect(result.current.results.verses).toEqual([]);
    expect(result.current.results.people).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets loading state for valid query', () => {
    const { result } = renderHook(() => useSearch('genesis'));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns results after debounce', async () => {
    const { result } = renderHook(() => useSearch('creation'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results).toBeDefined();
  });
});
