import { renderHook, act } from '@testing-library/react-native';

const mockPlay = jest.fn();
const mockStop = jest.fn();
const mockTTSState = { currentVerse: 0, isPlaying: false };

jest.mock('@/hooks/useTTS', () => ({
  useTTS: jest.fn(() => ({
    play: mockPlay,
    stop: mockStop,
    currentVerse: mockTTSState.currentVerse,
    isPlaying: mockTTSState.isPlaying,
    speed: 1.0,
  })),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (selector: any) => selector({ ttsVoice: '', fontSize: 16 }),
  useReaderStore: (selector: any) => selector({ activePanel: null }),
}));

import { useChapterTTS } from '@/hooks/chapter/useChapterTTS';

const mockVerses = [
  { id: 1, book_id: 'genesis', chapter_num: 1, verse_num: 1, translation: 'esv', text: 'In the beginning' },
  { id: 2, book_id: 'genesis', chapter_num: 1, verse_num: 2, translation: 'esv', text: 'And the earth' },
  { id: 3, book_id: 'genesis', chapter_num: 1, verse_num: 3, translation: 'esv', text: 'Let there be light' },
];

const mockScrollToVerse = jest.fn();

function createOptions(overrides = {}) {
  return {
    verses: mockVerses as any,
    scrollToVerse: mockScrollToVerse,
    bookId: 'genesis',
    chapterNum: 1,
    ...overrides,
  };
}

describe('useChapterTTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTTSState.currentVerse = 0;
    mockTTSState.isPlaying = false;
  });

  it('auto-follows the active verse via scrollToVerse while playing (#1873)', () => {
    const { result } = renderHook(() => useChapterTTS(createOptions()));

    act(() => {
      result.current.toggleTTS();
    });

    // currentVerse 0 → verse_num 1, anchored 120px from the top.
    expect(mockScrollToVerse).toHaveBeenCalledWith(1, 120, true);
  });

  it('does not auto-scroll when TTS is inactive', () => {
    renderHook(() => useChapterTTS(createOptions()));
    expect(mockScrollToVerse).not.toHaveBeenCalled();
  });

  it('starts with ttsActive false and no activeVerseNum', () => {
    const { result } = renderHook(() => useChapterTTS(createOptions()));
    expect(result.current.ttsActive).toBe(false);
    expect(result.current.activeVerseNum).toBeUndefined();
  });

  it('toggleTTS activates TTS and calls play', () => {
    const { result } = renderHook(() => useChapterTTS(createOptions()));

    act(() => {
      result.current.toggleTTS();
    });

    expect(result.current.ttsActive).toBe(true);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('toggleTTS again deactivates TTS and calls stop', () => {
    const { result } = renderHook(() => useChapterTTS(createOptions()));

    // Activate
    act(() => {
      result.current.toggleTTS();
    });
    expect(result.current.ttsActive).toBe(true);

    // Deactivate
    act(() => {
      result.current.toggleTTS();
    });
    expect(result.current.ttsActive).toBe(false);
    expect(mockStop).toHaveBeenCalled();
  });

  it('stopTTS deactivates TTS and calls stop', () => {
    const { result } = renderHook(() => useChapterTTS(createOptions()));

    act(() => {
      result.current.toggleTTS();
    });
    expect(result.current.ttsActive).toBe(true);

    act(() => {
      result.current.stopTTS();
    });
    expect(result.current.ttsActive).toBe(false);
    expect(mockStop).toHaveBeenCalled();
  });

  it('exposes tts object from useTTS', () => {
    const { result } = renderHook(() => useChapterTTS(createOptions()));
    expect(result.current.tts).toBeDefined();
    expect(result.current.tts.play).toBeDefined();
    expect(result.current.tts.stop).toBeDefined();
  });

  it('stops TTS on chapter change', () => {
    const { rerender } = renderHook(
      ({ bookId, chapterNum }: { bookId: string; chapterNum: number }) =>
        useChapterTTS(createOptions({ bookId, chapterNum })),
      { initialProps: { bookId: 'genesis', chapterNum: 1 } },
    );

    rerender({ bookId: 'genesis', chapterNum: 2 });
    expect(mockStop).toHaveBeenCalled();
  });
});
