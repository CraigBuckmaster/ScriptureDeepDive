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

const chapterWithMap = {
  id: 'genesis_1',
  book_id: 'genesis',
  chapter_num: 1,
  timeline_link_event: null,
  timeline_link_text: null,
  map_story_link_id: 'abrahams-journey',
  map_story_link_text: 'Abraham journey',
};

const chapterWithBoth = {
  id: 'genesis_1',
  book_id: 'genesis',
  chapter_num: 1,
  timeline_link_event: 'creation',
  timeline_link_text: 'Creation event',
  map_story_link_id: 'abrahams-journey',
  map_story_link_text: 'Abraham journey',
};

const peoplePanels: any[] = [
  {
    panel_type: 'ppl',
    content_json: JSON.stringify({
      people: [
        { id: 'abraham', name: 'Abraham', role: 'patriarch' },
        { id: 'sarah', name: 'Sarah', role: 'matriarch' },
        { id: 'lot', name: 'Lot', role: 'nephew' },
      ],
    }),
  },
];

const debatePanels: any[] = [
  {
    panel_type: 'debate',
    content_json: JSON.stringify({
      id: 'debate-1',
      title: 'A very long debate title that should be truncated for display purposes here',
    }),
  },
];

const themesPanels: any[] = [
  {
    panel_type: 'themes',
    content_json: JSON.stringify({
      themes: [{ name: 'Grace', key: 'grace' }],
    }),
  },
];

const invalidPanels: any[] = [
  { panel_type: 'ppl', content_json: 'INVALID JSON' },
];

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

  it('extracts map card from chapter metadata', async () => {
    const { result } = renderHook(() => useRelatedContent(chapterWithMap, emptyPanels));
    await waitFor(() => expect(result.current.length).toBeGreaterThan(0));
    expect(result.current[0].type).toBe('map');
    expect(result.current[0].title).toBe('Map Journey');
    expect(result.current[0].params.storyId).toBe('abrahams-journey');
  });

  it('extracts both timeline and map cards', async () => {
    const { result } = renderHook(() => useRelatedContent(chapterWithBoth, emptyPanels));
    await waitFor(() => expect(result.current.length).toBe(2));
    expect(result.current.map((c: any) => c.type)).toContain('timeline');
    expect(result.current.map((c: any) => c.type)).toContain('map');
  });

  it('extracts people cards from ppl panel (max 2)', async () => {
    const { result } = renderHook(() => useRelatedContent(simpleChapter, peoplePanels));
    await waitFor(() => expect(result.current.length).toBe(2));
    expect(result.current[0].type).toBe('people');
    expect(result.current[0].title).toBe('Abraham');
    expect(result.current[1].title).toBe('Sarah');
  });

  it('extracts debate card with truncated title', async () => {
    const { result } = renderHook(() => useRelatedContent(simpleChapter, debatePanels));
    await waitFor(() => expect(result.current.length).toBe(1));
    expect(result.current[0].type).toBe('debate');
    // Title should be truncated at 37 chars + ellipsis
    expect(result.current[0].title.length).toBeLessThanOrEqual(40);
  });

  it('extracts concept card from themes panel', async () => {
    const { result } = renderHook(() => useRelatedContent(simpleChapter, themesPanels));
    await waitFor(() => expect(result.current.length).toBe(1));
    expect(result.current[0].type).toBe('concept');
    expect(result.current[0].title).toBe('Grace');
  });

  it('handles invalid JSON in panels gracefully', async () => {
    const { result } = renderHook(() => useRelatedContent(simpleChapter, invalidPanels));
    await waitFor(() => expect(result.current).toEqual([]));
  });

  it('limits to MAX_CARDS (8) total cards', async () => {
    const manyPanels = [
      ...peoplePanels, // 2 cards
      ...debatePanels, // 1 card
      ...themesPanels, // 1 card
    ];
    const chapterFull = {
      ...chapterWithBoth, // 2 cards (timeline + map)
    };
    // Total should be 6, well under 8
    const { result } = renderHook(() => useRelatedContent(chapterFull, manyPanels));
    await waitFor(() => expect(result.current.length).toBeLessThanOrEqual(8));
  });
});
