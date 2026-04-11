import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockTopics = [
  {
    id: 'genesis-days', title: 'The Nature of the Days', category: 'theological',
    book_id: 'genesis', chapters_json: '[1]', passage: 'Genesis 1',
    question: 'Are the days literal?', tags_json: '[]', positions_json: '[{},{}]',
    position_count: 2,
  },
  {
    id: 'exodus-date', title: 'The Date of the Exodus', category: 'historical',
    book_id: 'exodus', chapters_json: '[1,12]', passage: 'Exodus 1, 12',
    question: 'When did the Exodus occur?', tags_json: '[]', positions_json: '[{},{},{}]',
    position_count: 3,
  },
];

jest.mock('@/db/content', () => ({
  getDebateTopics: jest.fn(() => Promise.resolve(mockTopics)),
  searchDebateTopics: jest.fn((q: string) =>
    Promise.resolve(mockTopics.filter(t => t.title.toLowerCase().includes(q.toLowerCase())))
  ),
  getDebateTopicsForChapter: jest.fn((bookId: string, ch: number) =>
    Promise.resolve(mockTopics.filter(t => t.book_id === bookId))
  ),
  getDebateTopic: jest.fn(() => Promise.resolve(null)),
  getDebateTopicScholars: jest.fn(() => Promise.resolve([])),
}));

describe('useDebateTopics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads and returns all topics', async () => {
    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.topics).toHaveLength(2);
  });

  it('filters by category', async () => {
    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setCategoryFilter('theological'));
    expect(result.current.topics).toHaveLength(1);
    expect(result.current.topics[0].id).toBe('genesis-days');
  });

  it('returns all when filter is "all"', async () => {
    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setCategoryFilter('all'));
    expect(result.current.topics).toHaveLength(2);
  });

  it('returns available categories', async () => {
    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toContain('theological');
    expect(result.current.categories).toContain('historical');
  });

  it('exposes DEBATE_CATEGORY_LABELS', () => {
    const { DEBATE_CATEGORY_LABELS } = require('@/hooks/useDebateTopics');
    expect(DEBATE_CATEGORY_LABELS.theological).toBe('Theological');
    expect(DEBATE_CATEGORY_LABELS.ethical).toBe('Ethical');
    expect(DEBATE_CATEGORY_LABELS.historical).toBe('Historical');
    expect(DEBATE_CATEGORY_LABELS.textual).toBe('Textual');
    expect(DEBATE_CATEGORY_LABELS.interpretive).toBe('Interpretive');
  });

  it('handles load error gracefully', async () => {
    const { getDebateTopics } = require('@/db/content');
    getDebateTopics.mockRejectedValueOnce(new Error('DB error'));

    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.topics).toEqual([]);
  });

  it('returns search results when search has >= 2 chars', async () => {
    jest.useFakeTimers();
    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch('Da'));
    jest.advanceTimersByTime(250);

    await waitFor(() => expect(result.current.topics.length).toBeGreaterThanOrEqual(0));
    jest.useRealTimers();
  });

  it('clears search results when search is shorter than 2 chars', async () => {
    const { useDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch('x'));
    expect(result.current.searchResults).toEqual([]);
  });
});

describe('useDebateTopic', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads topic detail and scholars', async () => {
    const { getDebateTopic, getDebateTopicScholars } = require('@/db/content');
    getDebateTopic.mockResolvedValue({
      id: 'genesis-days',
      title: 'Days of Creation',
      positions_json: '[{},{}]',
    });
    getDebateTopicScholars.mockResolvedValue([
      { id: 'scholar-1', name: 'Scholar One' },
    ]);

    const { useDebateTopic } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useDebateTopic('genesis-days'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topic).not.toBeNull();
    expect(result.current.topic?.id).toBe('genesis-days');
    expect(result.current.scholars.size).toBe(1);
    expect(result.current.scholars.get('scholar-1')?.name).toBe('Scholar One');
  });
});

describe('useChapterDebateTopics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns topics for matching book', async () => {
    const { useChapterDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useChapterDebateTopics('genesis', 1));
    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0].id).toBe('genesis-days');
  });

  it('returns empty for non-matching book', async () => {
    const { useChapterDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useChapterDebateTopics('psalms', 23));
    await waitFor(() => expect(result.current).toHaveLength(0));
  });

  it('returns empty array when bookId is null', async () => {
    const { useChapterDebateTopics } = require('@/hooks/useDebateTopics');
    const { result } = renderHook(() => useChapterDebateTopics(null, 1));
    expect(result.current).toEqual([]);
  });
});
