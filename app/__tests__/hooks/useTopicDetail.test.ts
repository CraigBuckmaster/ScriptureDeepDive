import { renderHook, waitFor } from '@testing-library/react-native';

const mockTopic = {
  id: 'forgiveness', title: 'Forgiveness', category: 'living',
  description: 'Release of offense',
  tags_json: '["forgiveness","pardon"]',
  subtopics_json: JSON.stringify([
    { label: "God's Forgiveness", verses: [{ ref: 'Psalm 103:12', text: 'As far as the east...' }] },
  ]),
  related_concept_ids_json: '["mercy-grace"]',
  related_thread_ids_json: '["judgment-mercy"]',
  related_prophecy_ids_json: '[]',
  relevant_chapters_json: '["genesis_22","isaiah_53"]',
};

jest.mock('@/db/content', () => ({
  getTopic: jest.fn(() => Promise.resolve(mockTopic)),
  getConcept: jest.fn((id: string) => Promise.resolve(
    id === 'mercy-grace' ? { id: 'mercy-grace', name: 'Mercy & Grace' } : null
  )),
  getCrossRefThread: jest.fn((id: string) => Promise.resolve(
    id === 'judgment-mercy' ? { id: 'judgment-mercy', theme: 'Judgment and Mercy' } : null
  )),
  getProphecyChain: jest.fn(() => Promise.resolve(null)),
}));

describe('useTopicDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads topic and resolves cross-links', async () => {
    const { useTopicDetail } = require('@/hooks/useTopicDetail');
    const { result } = renderHook(() => useTopicDetail('forgiveness'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.topic?.id).toBe('forgiveness');
    expect(result.current.relatedConcepts).toHaveLength(1);
    expect(result.current.relatedConcepts[0].title).toBe('Mercy & Grace');
    expect(result.current.relatedThreads).toHaveLength(1);
    expect(result.current.relatedProphecyChains).toHaveLength(0);
  });
});
