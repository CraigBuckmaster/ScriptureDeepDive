import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockDiscoveries = [
  {
    id: 'dead-sea-scrolls', name: 'Dead Sea Scrolls', category: 'manuscripts',
    significance: 'Oldest known biblical manuscripts', description: 'Found in Qumran caves',
    display_order: 1,
  },
  {
    id: 'rosetta-stone', name: 'Rosetta Stone', category: 'inscriptions',
    significance: 'Key to deciphering hieroglyphs', description: 'Found in Egypt',
    display_order: 2,
  },
  {
    id: 'tel-dan-stele', name: 'Tel Dan Stele', category: 'inscriptions',
    significance: 'First mention of House of David', description: 'Found in northern Israel',
    display_order: 3,
  },
];

const mockVerseLinks = [
  { id: 1, discovery_id: 'dead-sea-scrolls', verse_ref: 'Isaiah 53:1', relevance: 'Contains full text' },
];

const mockImages = [
  { id: 1, discovery_id: 'dead-sea-scrolls', url: 'https://example.com/dss.jpg', caption: 'Scroll fragment', credit: 'Museum', display_order: 0 },
];

jest.mock('@/db/content/archaeology', () => ({
  getAllDiscoveries: jest.fn(() => Promise.resolve(mockDiscoveries)),
  getDiscoveriesByCategory: jest.fn((cat: string) =>
    Promise.resolve(mockDiscoveries.filter((d) => d.category === cat)),
  ),
  searchDiscoveries: jest.fn((q: string) =>
    Promise.resolve(mockDiscoveries.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))),
  ),
  getDiscovery: jest.fn((id: string) =>
    Promise.resolve(mockDiscoveries.find((d) => d.id === id) ?? null),
  ),
  getDiscoveryVerseLinks: jest.fn(() => Promise.resolve(mockVerseLinks)),
  getDiscoveryImages: jest.fn(() => Promise.resolve(mockImages)),
}));

const {
  getAllDiscoveries,
  getDiscoveriesByCategory,
  searchDiscoveries,
  getDiscovery,
  getDiscoveryVerseLinks,
  getDiscoveryImages,
} = require('@/db/content/archaeology');

describe('useArchaeologyBrowse', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state with empty data', () => {
    const { useArchaeologyBrowse } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyBrowse());
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('loads all discoveries when no category is provided', async () => {
    const { useArchaeologyBrowse } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyBrowse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAllDiscoveries).toHaveBeenCalled();
    expect(result.current.data).toHaveLength(3);
  });

  it('loads discoveries filtered by category', async () => {
    const { useArchaeologyBrowse } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyBrowse('inscriptions'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getDiscoveriesByCategory).toHaveBeenCalledWith('inscriptions');
    expect(result.current.data).toHaveLength(2);
  });

  it('re-fetches when category changes', async () => {
    const { useArchaeologyBrowse } = require('@/hooks/useArchaeology');
    const { result, rerender } = renderHook(
      ({ category }: { category?: string }) => useArchaeologyBrowse(category),
      { initialProps: { category: undefined } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAllDiscoveries).toHaveBeenCalled();

    rerender({ category: 'manuscripts' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getDiscoveriesByCategory).toHaveBeenCalledWith('manuscripts');
  });

  it('exposes error on fetch failure', async () => {
    getAllDiscoveries.mockRejectedValueOnce(new Error('DB error'));
    const { useArchaeologyBrowse } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyBrowse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toEqual([]);
  });
});

describe('useArchaeologySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('returns empty results initially', () => {
    const { useArchaeologySearch } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologySearch());
    expect(result.current.search).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.searching).toBe(false);
  });

  it('does not search when query is less than 2 characters', async () => {
    const { useArchaeologySearch } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologySearch());

    act(() => result.current.setSearch('D'));
    act(() => jest.advanceTimersByTime(300));

    expect(searchDiscoveries).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('searches after debounce when query is >= 2 chars', async () => {
    const { useArchaeologySearch } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologySearch());

    act(() => result.current.setSearch('Dead'));
    expect(result.current.searching).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(searchDiscoveries).toHaveBeenCalledWith('Dead');
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].id).toBe('dead-sea-scrolls');
  });

  it('clears results when search is cleared', async () => {
    const { useArchaeologySearch } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologySearch());

    act(() => result.current.setSearch('Tel'));
    await act(async () => jest.advanceTimersByTime(200));
    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(result.current.results).toHaveLength(1);

    act(() => result.current.setSearch(''));
    expect(result.current.results).toEqual([]);
  });

  it('handles search error gracefully', async () => {
    searchDiscoveries.mockRejectedValueOnce(new Error('search failed'));
    const { useArchaeologySearch } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologySearch());

    act(() => result.current.setSearch('fail'));
    await act(async () => jest.advanceTimersByTime(200));
    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(result.current.results).toEqual([]);
  });
});

describe('useArchaeologyDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { useArchaeologyDetail } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyDetail('dead-sea-scrolls'));
    expect(result.current.loading).toBe(true);
    expect(result.current.discovery).toBeNull();
  });

  it('loads discovery, verse links, and images', async () => {
    const { useArchaeologyDetail } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyDetail('dead-sea-scrolls'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.discovery).toBeDefined();
    expect(result.current.discovery!.id).toBe('dead-sea-scrolls');
    expect(result.current.verseLinks).toHaveLength(1);
    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].url).toBe('https://example.com/dss.jpg');
  });

  it('falls back to inline images_json when images table is empty', async () => {
    getDiscoveryImages.mockResolvedValueOnce([]);
    getDiscovery.mockResolvedValueOnce({
      id: 'inline-test', name: 'Inline Test', category: 'test',
      significance: 'test', description: 'test', display_order: 1,
      images_json: JSON.stringify([
        { url: 'https://example.com/inline.jpg', caption: 'Inline' },
      ]),
    });

    const { useArchaeologyDetail } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyDetail('inline-test'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].url).toBe('https://example.com/inline.jpg');
    expect(result.current.images[0].caption).toBe('Inline');
  });

  it('handles invalid images_json gracefully', async () => {
    getDiscoveryImages.mockResolvedValueOnce([]);
    getDiscovery.mockResolvedValueOnce({
      id: 'bad-json', name: 'Bad JSON', category: 'test',
      significance: 'test', description: 'test', display_order: 1,
      images_json: 'not valid json',
    });

    const { useArchaeologyDetail } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyDetail('bad-json'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.images).toEqual([]);
  });

  it('handles fetch error gracefully', async () => {
    getDiscovery.mockRejectedValueOnce(new Error('not found'));
    const { useArchaeologyDetail } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyDetail('nonexistent'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.discovery).toBeNull();
  });

  it('handles verse link and image fetch failures gracefully', async () => {
    getDiscoveryVerseLinks.mockRejectedValueOnce(new Error('link err'));
    getDiscoveryImages.mockRejectedValueOnce(new Error('img err'));
    const { useArchaeologyDetail } = require('@/hooks/useArchaeology');
    const { result } = renderHook(() => useArchaeologyDetail('dead-sea-scrolls'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verse links and images catch individually and return []
    expect(result.current.verseLinks).toEqual([]);
    expect(result.current.images).toEqual([]);
    expect(result.current.discovery).toBeDefined();
  });
});
