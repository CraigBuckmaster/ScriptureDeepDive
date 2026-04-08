import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockCategories = [
  { id: 'cat1', name: 'Relationships', display_order: 1 },
  { id: 'cat2', name: 'Purpose', display_order: 2 },
];

const mockTopics = [
  { id: 'forgiveness', title: 'Forgiveness', category_id: 'cat1', summary: 'About forgiving others' },
  { id: 'patience', title: 'Patience', category_id: 'cat1', summary: 'About being patient' },
  { id: 'calling', title: 'Calling', category_id: 'cat2', summary: 'Finding your calling' },
];

const mockVerses = [{ id: 1, topic_id: 'forgiveness', verse_ref: 'Matt 6:14', text: 'For if you forgive...' }];
const mockScholars = [{ id: 's1', name: 'C.S. Lewis', contribution: 'Commentary on forgiveness' }];
const mockRelated = [mockTopics[1]];

jest.mock('@/db/content/lifeTopics', () => ({
  getLifeTopicCategories: jest.fn(() => Promise.resolve(mockCategories)),
  getLifeTopics: jest.fn((categoryId?: string) =>
    Promise.resolve(categoryId ? mockTopics.filter((t) => t.category_id === categoryId) : mockTopics),
  ),
  getLifeTopic: jest.fn((id: string) =>
    Promise.resolve(mockTopics.find((t) => t.id === id) ?? null),
  ),
  searchLifeTopics: jest.fn((q: string) =>
    Promise.resolve(mockTopics.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))),
  ),
  getLifeTopicVerses: jest.fn(() => Promise.resolve(mockVerses)),
  getLifeTopicScholars: jest.fn(() => Promise.resolve(mockScholars)),
  getRelatedLifeTopics: jest.fn(() => Promise.resolve(mockRelated)),
}));

const {
  getLifeTopicCategories,
  getLifeTopics,
  getLifeTopic,
  searchLifeTopics,
  getLifeTopicVerses,
  getLifeTopicScholars,
  getRelatedLifeTopics,
} = require('@/db/content/lifeTopics');

describe('useLifeTopicCategories', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { useLifeTopicCategories } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicCategories());
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('loads all categories', async () => {
    const { useLifeTopicCategories } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('Relationships');
  });

  it('exposes error on failure', async () => {
    getLifeTopicCategories.mockRejectedValueOnce(new Error('DB error'));
    const { useLifeTopicCategories } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});

describe('useLifeTopics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads all topics when no categoryId', async () => {
    const { useLifeTopics } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(3);
  });

  it('loads topics filtered by categoryId', async () => {
    const { useLifeTopics } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopics('cat2'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getLifeTopics).toHaveBeenCalledWith('cat2');
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('calling');
  });

  it('re-fetches when categoryId changes', async () => {
    const { useLifeTopics } = require('@/hooks/useLifeTopics');
    const { result, rerender } = renderHook(
      ({ categoryId }: { categoryId?: string }) => useLifeTopics(categoryId),
      { initialProps: { categoryId: undefined } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(3);

    rerender({ categoryId: 'cat1' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getLifeTopics).toHaveBeenCalledWith('cat1');
    expect(result.current.data).toHaveLength(2);
  });
});

describe('useLifeTopicSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('returns empty results initially', () => {
    const { useLifeTopicSearch } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicSearch());
    expect(result.current.search).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.searching).toBe(false);
  });

  it('does not search when query is less than 2 characters', () => {
    const { useLifeTopicSearch } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicSearch());
    act(() => result.current.setSearch('F'));
    act(() => jest.advanceTimersByTime(300));
    expect(searchLifeTopics).not.toHaveBeenCalled();
  });

  it('searches after debounce with 2+ chars', async () => {
    const { useLifeTopicSearch } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicSearch());

    act(() => result.current.setSearch('For'));
    expect(result.current.searching).toBe(true);

    await act(async () => jest.advanceTimersByTime(200));
    await waitFor(() => expect(result.current.searching).toBe(false));

    expect(searchLifeTopics).toHaveBeenCalledWith('For');
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].id).toBe('forgiveness');
  });

  it('clears results when query drops below 2 chars', async () => {
    const { useLifeTopicSearch } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicSearch());

    act(() => result.current.setSearch('Cal'));
    await act(async () => jest.advanceTimersByTime(200));
    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(result.current.results).toHaveLength(1);

    act(() => result.current.setSearch(''));
    expect(result.current.results).toEqual([]);
    expect(result.current.searching).toBe(false);
  });

  it('handles search errors gracefully', async () => {
    searchLifeTopics.mockRejectedValueOnce(new Error('search failed'));
    const { useLifeTopicSearch } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicSearch());

    act(() => result.current.setSearch('fail'));
    await act(async () => jest.advanceTimersByTime(200));
    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(result.current.results).toEqual([]);
  });
});

describe('useLifeTopicDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { useLifeTopicDetail } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicDetail('forgiveness'));
    expect(result.current.loading).toBe(true);
    expect(result.current.topic).toBeNull();
  });

  it('loads topic, verses, scholars, and related topics', async () => {
    const { useLifeTopicDetail } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicDetail('forgiveness'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topic).toBeDefined();
    expect(result.current.topic!.id).toBe('forgiveness');
    expect(result.current.verses).toHaveLength(1);
    expect(result.current.scholars).toHaveLength(1);
    expect(result.current.related).toHaveLength(1);
  });

  it('re-fetches when topicId changes', async () => {
    const { useLifeTopicDetail } = require('@/hooks/useLifeTopics');
    const { result, rerender } = renderHook(
      ({ topicId }: { topicId: string }) => useLifeTopicDetail(topicId),
      { initialProps: { topicId: 'forgiveness' } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getLifeTopic).toHaveBeenCalledWith('forgiveness');

    rerender({ topicId: 'patience' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getLifeTopic).toHaveBeenCalledWith('patience');
  });

  it('handles fetch error gracefully', async () => {
    getLifeTopic.mockRejectedValueOnce(new Error('not found'));
    const { useLifeTopicDetail } = require('@/hooks/useLifeTopics');
    const { result } = renderHook(() => useLifeTopicDetail('nonexistent'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.topic).toBeNull();
    expect(result.current.verses).toEqual([]);
  });
});
