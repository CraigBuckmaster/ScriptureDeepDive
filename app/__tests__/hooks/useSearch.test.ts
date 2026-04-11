import { renderHook, waitFor } from '@testing-library/react-native';

const mockSearchVerses = jest.fn().mockResolvedValue([]);
const mockSearchPeople = jest.fn().mockResolvedValue([]);
const mockGetLiveBooks = jest.fn().mockResolvedValue([]);
const mockGetAllConcepts = jest.fn().mockResolvedValue([]);
const mockGetMapStories = jest.fn().mockResolvedValue([]);
const mockGetAllTimelineEntries = jest.fn().mockResolvedValue([]);
const mockGetAllDifficultPassages = jest.fn().mockResolvedValue([]);
const mockSearchLifeTopics = jest.fn().mockResolvedValue([]);

jest.mock('@/db/content', () => ({
  searchVerses: (...args: any[]) => mockSearchVerses(...args),
  searchPeople: (...args: any[]) => mockSearchPeople(...args),
  getLiveBooks: (...args: any[]) => mockGetLiveBooks(...args),
  getAllConcepts: (...args: any[]) => mockGetAllConcepts(...args),
  getMapStories: (...args: any[]) => mockGetMapStories(...args),
  getAllTimelineEntries: (...args: any[]) => mockGetAllTimelineEntries(...args),
  getAllDifficultPassages: (...args: any[]) => mockGetAllDifficultPassages(...args),
  searchLifeTopics: (...args: any[]) => mockSearchLifeTopics(...args),
}));

jest.mock('@/utils/verseResolver', () => ({
  getBookByName: (name: string) => {
    const books: Record<string, any> = {
      genesis: { id: 'genesis', name: 'Genesis', short: 'Gen', chapters: 50, testament: 'ot', aliases: [] },
      gen: { id: 'genesis', name: 'Genesis', short: 'Gen', chapters: 50, testament: 'ot', aliases: [] },
      romans: { id: 'romans', name: 'Romans', short: 'Rom', chapters: 16, testament: 'nt', aliases: [] },
      rom: { id: 'romans', name: 'Romans', short: 'Rom', chapters: 16, testament: 'nt', aliases: [] },
      psalms: { id: 'psalms', name: 'Psalms', short: 'Ps', chapters: 150, testament: 'ot', aliases: [] },
      psalm: { id: 'psalms', name: 'Psalms', short: 'Ps', chapters: 150, testament: 'ot', aliases: [] },
    };
    return books[name.toLowerCase().trim()] ?? null;
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { useSearch, buildOrderedGroups } from '@/hooks/useSearch';
import type { UniversalSearchResults } from '@/hooks/useSearch';

describe('useSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockSearchVerses.mockResolvedValue([]);
    mockSearchPeople.mockResolvedValue([]);
    mockGetLiveBooks.mockResolvedValue([]);
    mockGetAllConcepts.mockResolvedValue([]);
    mockGetMapStories.mockResolvedValue([]);
    mockGetAllTimelineEntries.mockResolvedValue([]);
    mockGetAllDifficultPassages.mockResolvedValue([]);
    mockSearchLifeTopics.mockResolvedValue([]);
  });

  afterEach(() => jest.useRealTimers());

  it('returns empty results for short query', () => {
    const { result } = renderHook(() => useSearch('a'));
    expect(result.current.results.verses).toEqual([]);
    expect(result.current.results.people).toEqual([]);
    expect(result.current.results.reference).toBeNull();
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

  it('parses "Gen 3:15" as a reference', async () => {
    const { result } = renderHook(() => useSearch('Gen 3:15'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.reference).not.toBeNull();
    expect(result.current.results.reference!.bookId).toBe('genesis');
    expect(result.current.results.reference!.chapter).toBe(3);
    expect(result.current.results.reference!.verse).toBe(15);
    expect(result.current.results.reference!.display).toBe('Genesis 3:15');
  });

  it('parses chapter-only reference "Psalm 23"', async () => {
    const { result } = renderHook(() => useSearch('Psalm 23'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.reference).not.toBeNull();
    expect(result.current.results.reference!.bookId).toBe('psalms');
    expect(result.current.results.reference!.chapter).toBe(23);
    expect(result.current.results.reference!.verse).toBeUndefined();
  });

  it('parses lowercase reference "romans 8"', async () => {
    const { result } = renderHook(() => useSearch('romans 8'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.reference).not.toBeNull();
    expect(result.current.results.reference!.bookId).toBe('romans');
    expect(result.current.results.reference!.chapter).toBe(8);
  });

  it('returns null reference for invalid chapter', async () => {
    const { result } = renderHook(() => useSearch('Gen 999'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.reference).toBeNull();
  });

  it('returns null reference for non-reference text', async () => {
    const { result } = renderHook(() => useSearch('love'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.reference).toBeNull();
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

  it('filters books from cache by name', async () => {
    mockGetLiveBooks.mockResolvedValue([
      { id: 'genesis', name: 'Genesis', testament: 'ot', total_chapters: 50 },
      { id: 'exodus', name: 'Exodus', testament: 'ot', total_chapters: 40 },
    ]);

    const { result } = renderHook(() => useSearch('genesis'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.books).toHaveLength(1);
    expect(result.current.results.books[0].name).toBe('Genesis');
  });

  it('filters concepts by name', async () => {
    mockGetAllConcepts.mockResolvedValue([
      { id: 'covenant', name: 'Covenant', description: 'Divine agreement' },
      { id: 'atonement', name: 'Atonement', description: 'Covering for sin' },
    ]);

    const { result } = renderHook(() => useSearch('covenant'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.concepts).toHaveLength(1);
    expect(result.current.results.concepts[0].name).toBe('Covenant');
  });

  it('reuses static caches on subsequent searches', async () => {
    mockGetLiveBooks.mockResolvedValue([]);
    mockGetAllConcepts.mockResolvedValue([]);
    mockGetMapStories.mockResolvedValue([]);
    mockGetAllTimelineEntries.mockResolvedValue([]);
    mockGetAllDifficultPassages.mockResolvedValue([]);

    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q),
      { initialProps: { q: 'first' } },
    );
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ q: 'second' });
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Static cache loaders should only be called once
    expect(mockGetLiveBooks).toHaveBeenCalledTimes(1);
    expect(mockGetAllConcepts).toHaveBeenCalledTimes(1);
  });

  it('handles search errors gracefully', async () => {
    mockSearchVerses.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useSearch('creation'));
    jest.advanceTimersByTime(350);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results.verses).toEqual([]);
  });

  it('cancels previous debounced search on new query', async () => {
    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q),
      { initialProps: { q: 'genesis' } },
    );

    jest.advanceTimersByTime(100);
    rerender({ q: 'exodus' });
    jest.advanceTimersByTime(350);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockSearchVerses).toHaveBeenCalledWith('exodus', 50);
  });
});

describe('buildOrderedGroups', () => {
  const base: UniversalSearchResults = {
    reference: null,
    verses: [], people: [], books: [], concepts: [],
    mapStories: [], timelineEvents: [], lifeTopics: [], difficultPassages: [],
  };

  it('returns empty array when no results', () => {
    expect(buildOrderedGroups(base, 'test')).toEqual([]);
  });

  it('puts exact name match group first', () => {
    const results: UniversalSearchResults = {
      ...base,
      people: [{ name: 'Moses' } as any],
      books: [{ name: 'Exodus' } as any],
      concepts: [{ name: 'Moses' } as any], // not the query
    };
    const groups = buildOrderedGroups(results, 'Moses');
    expect(groups[0].key).toBe('people');
  });

  it('skips empty groups', () => {
    const results: UniversalSearchResults = { ...base, books: [{ name: 'Genesis' } as any] };
    const groups = buildOrderedGroups(results, 'gen');
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('books');
  });
});
