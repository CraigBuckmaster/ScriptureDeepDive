import { renderHook, waitFor, act } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getContentLibraryCounts: jest.fn().mockResolvedValue({
    manuscripts: 10, discourse: 57, echoes: 0, ane: 0, chiasms: 0,
  }),
  getContentLibrary: jest.fn().mockResolvedValue([{
    id: 1, category: 'discourse', title: 'Test Entry', preview: 'Preview',
    book_id: 'genesis', book_name: 'Genesis', chapter_num: 1, section_num: null,
    panel_type: 'discourse', tab_key: null, testament: 'ot', sort_order: 1,
  }]),
  searchContentLibrary: jest.fn().mockResolvedValue([]),
}));

import { useContentLibrary } from '@/hooks/useContentLibrary';

describe('useContentLibrary', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useContentLibrary());
    expect(result.current.isLoading).toBe(true);
  });

  it('loads counts and auto-selects first available category', async () => {
    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeCategory).toBe('manuscripts');
    expect(result.current.availableCategories).toEqual(['manuscripts', 'discourse']);
  });

  it('allows changing category', async () => {
    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => { result.current.setActiveCategory('discourse'); });
    expect(result.current.activeCategory).toBe('discourse');
  });

  it('allows setting testament filter', async () => {
    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => { result.current.setTestament('ot'); });
    expect(result.current.testament).toBe('ot');
  });

  it('allows setting search query', async () => {
    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => { result.current.setSearchQuery('test'); });
    expect(result.current.searchQuery).toBe('test');
  });

  it('uses searchContentLibrary when searchQuery is non-empty', async () => {
    const { searchContentLibrary } = require('@/db/content');
    searchContentLibrary.mockResolvedValue([]);

    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setSearchQuery('discourse'); });

    await waitFor(() => expect(searchContentLibrary).toHaveBeenCalled());
  });

  it('filters categories to only those with entries > 0', async () => {
    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.availableCategories).not.toContain('echoes');
    expect(result.current.availableCategories).not.toContain('ane');
    expect(result.current.availableCategories).not.toContain('chiasms');
  });

  it('returns empty entries when no activeCategory', async () => {
    const { getContentLibraryCounts } = require('@/db/content');
    getContentLibraryCounts.mockResolvedValue({}); // all zero counts

    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeCategory).toBeNull();
    expect(result.current.entries).toEqual([]);
  });

  it('handles error in loading counts', async () => {
    const { getContentLibraryCounts } = require('@/db/content');
    getContentLibraryCounts.mockRejectedValueOnce(new Error('DB error'));

    const { result } = renderHook(() => useContentLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.counts).toEqual({});
  });
});
