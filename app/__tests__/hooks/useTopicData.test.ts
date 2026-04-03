import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockTopics = [
  { id: 'atonement', title: 'Atonement', category: 'theology',
    description: 'Reconciliation through sacrifice', tags_json: '["atonement"]',
    subtopics_json: '[]', related_concept_ids_json: '[]',
    related_thread_ids_json: '[]', related_prophecy_ids_json: '[]',
    relevant_chapters_json: '[]' },
  { id: 'courage', title: 'Courage', category: 'character',
    description: 'Boldness in danger', tags_json: '["courage"]',
    subtopics_json: '[]', related_concept_ids_json: '[]',
    related_thread_ids_json: '[]', related_prophecy_ids_json: '[]',
    relevant_chapters_json: '[]' },
  { id: 'forgiveness', title: 'Forgiveness', category: 'living',
    description: 'Release of offense', tags_json: '["forgiveness"]',
    subtopics_json: '[]', related_concept_ids_json: '["mercy-grace"]',
    related_thread_ids_json: '[]', related_prophecy_ids_json: '[]',
    relevant_chapters_json: '[]' },
];

jest.mock('@/db/content', () => ({
  getTopics: jest.fn(() => Promise.resolve(mockTopics)),
  searchTopics: jest.fn((q: string) =>
    Promise.resolve(mockTopics.filter(t => t.title.toLowerCase().includes(q.toLowerCase())))
  ),
}));

describe('useTopicData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('groups topics by category', async () => {
    const { useTopicData } = require('@/hooks/useTopicData');
    const { result } = renderHook(() => useTopicData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sections).toHaveLength(3);
    expect(result.current.sections.map((s: any) => s.category)).toEqual(
      expect.arrayContaining(['theology', 'character', 'living'])
    );
  });

  it('filters by category', async () => {
    const { useTopicData } = require('@/hooks/useTopicData');
    const { result } = renderHook(() => useTopicData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setCategoryFilter('theology'));
    expect(result.current.sections).toHaveLength(1);
    expect(result.current.sections[0].data).toHaveLength(1);
  });

  it('returns all categories when filter is "all"', async () => {
    const { useTopicData } = require('@/hooks/useTopicData');
    const { result } = renderHook(() => useTopicData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setCategoryFilter('all'));
    expect(result.current.sections).toHaveLength(3);
  });
});
