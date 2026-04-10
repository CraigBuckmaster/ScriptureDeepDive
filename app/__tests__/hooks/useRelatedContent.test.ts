/**
 * Hook tests for useRelatedContent.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content/images', () => ({
  getFeaturedImages: jest.fn().mockResolvedValue([]),
}));

import { useRelatedContent } from '@/hooks/useRelatedContent';

beforeEach(() => jest.clearAllMocks());

// Stable references to avoid infinite re-render loops in useMemo
const emptyPanels: any[] = [];

const nullChapter = null;

const simpleChapter = {
  id: 'genesis_1',
  book_id: 'genesis',
  chapter_num: 1,
  timeline_link_event: null,
  timeline_link_text: null,
  map_story_link_id: null,
  map_story_link_text: null,
};

const chapterWithTimeline = {
  id: 'genesis_1',
  book_id: 'genesis',
  chapter_num: 1,
  timeline_link_event: 'creation',
  timeline_link_text: 'Creation event',
  map_story_link_id: null,
  map_story_link_text: null,
};

describe('useRelatedContent', () => {
  it('returns empty array when chapter is null', () => {
    const { result } = renderHook(() => useRelatedContent(nullChapter, emptyPanels));
    expect(result.current).toEqual([]);
  });

  it('returns empty array when no relevant metadata', async () => {
    const { result } = renderHook(() => useRelatedContent(simpleChapter, emptyPanels));
    await waitFor(() => expect(result.current).toEqual([]));
  });

  it('extracts timeline card from chapter metadata', async () => {
    const { result } = renderHook(() => useRelatedContent(chapterWithTimeline, emptyPanels));
    await waitFor(() => expect(result.current.length).toBeGreaterThan(0));
    expect(result.current[0].type).toBe('timeline');
    expect(result.current[0].title).toBe('Timeline Event');
  });
});
