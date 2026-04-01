import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getChapter: jest.fn().mockResolvedValue({
    id: 'gen-1', book_id: 'genesis', chapter_num: 1, title: 'Creation',
    subtitle: null, timeline_link_event: null, timeline_link_text: null,
    map_story_link_id: null, map_story_link_text: null, coaching_json: null,
  }),
  getSections: jest.fn().mockResolvedValue([{
    id: 's1', chapter_id: 'gen-1', section_num: 1, header: 'The Beginning',
    verse_start: 1, verse_end: 5,
  }]),
  getSectionPanels: jest.fn().mockResolvedValue([]),
  getChapterPanels: jest.fn().mockResolvedValue([]),
  getVerses: jest.fn().mockResolvedValue([]),
  getVHLGroups: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/db/user', () => ({
  getNoteCount: jest.fn().mockResolvedValue(0),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (selector: any) => selector({ translation: 'niv' }),
  useReaderStore: (selector: any) => selector({ currentBook: null, currentChapter: 1, activePanel: null }),
}));

import { useChapterData } from '@/hooks/useChapterData';

describe('useChapterData', () => {
  it('returns loading initially', () => {
    const { result } = renderHook(() => useChapterData('genesis', 1));
    expect(result.current.isLoading).toBe(true);
  });

  it('loads chapter data', async () => {
    const { result } = renderHook(() => useChapterData('genesis', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.chapter).toBeTruthy();
    expect(result.current.chapter?.id).toBe('gen-1');
  });

  it('returns null chapter when bookId is null', () => {
    const { result } = renderHook(() => useChapterData(null, 1));
    expect(result.current.chapter).toBeNull();
  });
});
