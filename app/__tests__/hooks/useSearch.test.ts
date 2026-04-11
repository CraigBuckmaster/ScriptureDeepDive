import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockSearchVerses = jest.fn().mockResolvedValue([]);
const mockSearchPeople = jest.fn().mockResolvedValue([]);
const mockGetAllWordStudies = jest.fn().mockResolvedValue([]);
const mockSearchDiscoveries = jest.fn().mockResolvedValue([]);

jest.mock('@/db/content', () => ({
  searchVerses: (...args: any[]) => mockSearchVerses(...args),
  searchPeople: (...args: any[]) => mockSearchPeople(...args),
  getAllWordStudies: (...args: any[]) => mockGetAllWordStudies(...args),
  searchDiscoveries: (...args: any[]) => mockSearchDiscoveries(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { useSearch } from '@/hooks/useSearch';

describe('useSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockSearchVerses.mockResolvedValue([]);
    mockSearchPeople.mockResolvedValue([]);
    mockGetAllWordStudies.mockResolvedValue([]);
    mockSearchDiscoveries.mockResolvedValue([]);
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

  it('resets results when query is cleared', async () => {
    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q),
      { initialProps: { q: 'creation' } },
    );

    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ q: '' });
    expect(result.current.results.verses).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('passes testament filter to searchVerses', async () => {
    const { result } = renderHook(() => useSearch('love', 'nt'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockSearchVerses).toHaveBeenCalledWith('love', 20, 'nt', undefined);
  });

  it('passes bookId filter to searchVerses', async () => {
    const { result } = renderHook(() => useSearch('love', null, 'genesis'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockSearchVerses).toHaveBeenCalledWith('love', 20, null, 'genesis');
  });

  it('sorts people by relevance — exact match first', async () => {
    mockSearchPeople.mockResolvedValue([
      { name: 'Abraham', role: 'patriarch' },
      { name: 'adam', role: 'first man' },
    ]);

    const { result } = renderHook(() => useSearch('adam'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.people[0].name).toBe('adam');
  });

  it('filters word studies from cache', async () => {
    mockGetAllWordStudies.mockResolvedValue([
      { id: 'charis', transliteration: 'charis', original: 'χάρις' },
      { id: 'agape', transliteration: 'agape', original: 'ἀγάπη' },
    ]);

    const { result } = renderHook(() => useSearch('charis'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.wordStudies).toHaveLength(1);
    expect(result.current.results.wordStudies[0].id).toBe('charis');
  });

  it('reuses word study cache on subsequent searches', async () => {
    mockGetAllWordStudies.mockResolvedValue([
      { id: 'charis', transliteration: 'charis', original: 'χάρις' },
    ]);

    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q),
      { initialProps: { q: 'charis' } },
    );
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Second search should reuse cache
    rerender({ q: 'agape' });
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // getAllWordStudies should only be called once
    expect(mockGetAllWordStudies).toHaveBeenCalledTimes(1);
  });

  it('returns discoveries in results', async () => {
    mockSearchDiscoveries.mockResolvedValue([{ id: 'dss', title: 'Dead Sea Scrolls' }]);

    const { result } = renderHook(() => useSearch('Dead Sea'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.discoveries).toHaveLength(1);
  });

  it('handles search errors gracefully', async () => {
    mockSearchVerses.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useSearch('creation'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should return empty results, not throw
    expect(result.current.results.verses).toEqual([]);
  });

  it('cancels previous debounced search on new query', async () => {
    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q),
      { initialProps: { q: 'genesis' } },
    );

    // Before debounce fires, change query
    jest.advanceTimersByTime(100);
    rerender({ q: 'exodus' });
    jest.advanceTimersByTime(350);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // searchVerses should have been called with 'exodus', not 'genesis'
    expect(mockSearchVerses).toHaveBeenCalledWith('exodus', 20, undefined, undefined);
  });

  it('trims whitespace from query', async () => {
    const { result } = renderHook(() => useSearch('  love  '));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockSearchVerses).toHaveBeenCalledWith('love', 20, undefined, undefined);
  });
});
