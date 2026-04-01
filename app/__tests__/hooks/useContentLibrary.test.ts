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
});
