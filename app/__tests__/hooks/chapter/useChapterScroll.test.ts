import { renderHook, act } from '@testing-library/react-native';

const mockCompletePlanDay = jest.fn().mockResolvedValue(undefined);

jest.mock('@/db/user', () => ({
  completePlanDay: (...args: any[]) => mockCompletePlanDay(...args),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

const mockClearActivePanel = jest.fn();
const mockActivePanel: { value: { sectionId: string; panelType: string } | null } = { value: null };
jest.mock('@/stores', () => ({
  useReaderStore: (selector: any) =>
    selector({
      activePanel: mockActivePanel.value,
      clearActivePanel: mockClearActivePanel,
    }),
}));

import { useChapterScroll } from '@/hooks/chapter/useChapterScroll';
import type { ChapterListItem } from '@/utils/chapterItems';
import type { ReaderScrollable } from '@/components/ChapterVerseList';

// Two sections: verses 1-5 (items[1]=header, items[2]=verseBlock,
// items[3]=panelRow) and 6-10 (items[4..6]); footer last.
const ITEMS: ChapterListItem[] = [
  { type: 'chapterHeader', key: 'chapterHeader:0:0' },
  { type: 'sectionHeader', key: 'sectionHeader:1:1', sectionId: 'sec1', sectionNum: 1, header: 'One', showSeparator: false },
  { type: 'verseBlock', key: 'verseBlock:1:1', sectionId: 'sec1', sectionNum: 1, verseStart: 1, verseEnd: 5 },
  { type: 'panelRow', key: 'panelRow:1:1', sectionId: 'sec1', sectionNum: 1, panelKeys: ['heb'] },
  { type: 'sectionHeader', key: 'sectionHeader:2:6', sectionId: 'sec2', sectionNum: 2, header: 'Two', showSeparator: true },
  { type: 'verseBlock', key: 'verseBlock:2:6', sectionId: 'sec2', sectionNum: 2, verseStart: 6, verseEnd: 10 },
  { type: 'panelRow', key: 'panelRow:2:6', sectionId: 'sec2', sectionNum: 2, panelKeys: [] },
  { type: 'footer', key: 'footer:0:0' },
];

const VERSE_INDEX_MAP = new Map<number, number>([
  [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
  [6, 5], [7, 5], [8, 5], [9, 5], [10, 5],
]);

function mockScrollable() {
  return {
    scrollTo: jest.fn(),
    scrollToEnd: jest.fn(),
    scrollToIndex: jest.fn(),
  } satisfies ReaderScrollable;
}

function createOptions(overrides = {}) {
  return {
    bookId: 'genesis',
    chapterNum: 1,
    isLoading: false,
    versesLength: 31,
    items: ITEMS,
    verseIndexMap: VERSE_INDEX_MAP,
    ...overrides,
  };
}

describe('useChapterScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial scrollProgress of 0', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    expect(result.current.scrollProgress).toBe(0);
  });

  it('returns the scroll ref and scrollToVerse', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    expect(result.current.scrollRef).toBeDefined();
    expect(result.current.scrollToVerse).toBeDefined();
  });

  it('scrollToVerse targets the verse block index (#1873)', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    const scrollable = mockScrollable();
    result.current.scrollRef.current = scrollable;

    act(() => {
      result.current.scrollToVerse(7);
    });

    // Verse 7 lives in the second verseBlock (index 5); no cell offset
    // captured yet → anchored at the block top, 80px from viewport top.
    expect(scrollable.scrollToIndex).toHaveBeenCalledWith({
      index: 5,
      viewOffset: 80,
      animated: true,
    });
  });

  it('scrollToVerse refines with the cell-relative offset once laid out', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    const scrollable = mockScrollable();
    result.current.scrollRef.current = scrollable;

    // Verse 7 laid out 150px into its block cell.
    act(() => {
      result.current.handleVerseLayout(7, 150, 'sec2');
    });
    act(() => {
      result.current.scrollToVerse(7);
    });

    // viewOffset = topOffset (80) - cellOffset (150) = -70:
    // final offset = blockTop + 150 - 80.
    expect(scrollable.scrollToIndex).toHaveBeenCalledWith({
      index: 5,
      viewOffset: -70,
      animated: true,
    });
  });

  it('scrollToVerse is a no-op for verses outside the map', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    const scrollable = mockScrollable();
    result.current.scrollRef.current = scrollable;

    act(() => {
      result.current.scrollToVerse(999);
    });

    expect(scrollable.scrollToIndex).not.toHaveBeenCalled();
  });

  it('initialVerseNum triggers the deep-link jump once loaded', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useChapterScroll(createOptions({ initialVerseNum: 6 })),
    );
    const scrollable = mockScrollable();
    result.current.scrollRef.current = scrollable;

    act(() => {
      jest.advanceTimersByTime(60);
    });

    expect(scrollable.scrollToIndex).toHaveBeenCalledWith({
      index: 5,
      viewOffset: 80,
      animated: true,
    });
    jest.useRealTimers();
  });

  it('handleScroll updates scrollProgress', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 500 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    // maxScroll = 2000 - 800 = 1200, progress = 500 / 1200 ~= 0.4167
    expect(result.current.scrollProgress).toBeCloseTo(0.4167, 3);
  });

  it('scrollProgress is clamped to [0, 1]', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    // Scroll past end
    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 2000 },
        contentSize: { height: 1500 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    expect(result.current.scrollProgress).toBe(1);
  });

  it('resets scrollProgress on chapter change', () => {
    const { result, rerender } = renderHook(
      ({ bookId, chapterNum }: { bookId: string; chapterNum: number }) =>
        useChapterScroll(createOptions({ bookId, chapterNum })),
      { initialProps: { bookId: 'genesis', chapterNum: 1 } },
    );

    // Simulate scrolling
    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 500 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 800 },
      },
    } as any;
    act(() => {
      result.current.handleScroll(scrollEvent);
    });
    expect(result.current.scrollProgress).toBeGreaterThan(0);

    // Change chapter
    rerender({ bookId: 'genesis', chapterNum: 2 });
    expect(result.current.scrollProgress).toBe(0);
  });

  it('completes plan day when scrollProgress reaches 80%', () => {
    const { result } = renderHook(() =>
      useChapterScroll(createOptions({ planId: 'plan-1', planDayNum: 3 })),
    );

    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    // progress = 1000 / 1200 ~= 0.833, which is >= 0.8
    expect(mockCompletePlanDay).toHaveBeenCalledWith('plan-1', 3);
  });

  it('does not complete plan day when no planId', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    expect(mockCompletePlanDay).not.toHaveBeenCalled();
  });

  it('layout callbacks are safe no-ops for section/button-row (D5 removes them)', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    act(() => {
      result.current.handleSectionLayout('sec1', 300);
      result.current.handleBtnRowLayout('sec1', 300, 150);
    });
  });

  it('does not complete plan day when already completed for that chapter', () => {
    const { result } = renderHook(() =>
      useChapterScroll(createOptions({ planId: 'plan-1', planDayNum: 3 })),
    );

    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent);
    });
    expect(mockCompletePlanDay).toHaveBeenCalledTimes(1);

    // Scroll more — should NOT call completePlanDay again
    const scrollEvent2 = {
      nativeEvent: {
        contentOffset: { y: 1200 },
        contentSize: { height: 2000 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent2);
    });
    expect(mockCompletePlanDay).toHaveBeenCalledTimes(1);
  });

  it('scrollProgress stays at 0 when maxScroll is 0', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    // Content fits within layout = maxScroll is 0
    const scrollEvent = {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 800 },
        layoutMeasurement: { height: 800 },
      },
    } as any;

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    expect(result.current.scrollProgress).toBe(0);
  });

  it('clearActivePanel is called on chapter change', () => {
    const { rerender } = renderHook(
      ({ bookId, chapterNum }: { bookId: string; chapterNum: number }) =>
        useChapterScroll(createOptions({ bookId, chapterNum })),
      { initialProps: { bookId: 'genesis', chapterNum: 1 } },
    );

    rerender({ bookId: 'genesis', chapterNum: 2 });
    expect(mockClearActivePanel).toHaveBeenCalled();
  });

  it('opens panel → scrolls to the section panelRow index', () => {
    jest.useFakeTimers();
    mockActivePanel.value = { sectionId: 'sec2', panelType: 'heb' };
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    const scrollable = mockScrollable();
    result.current.scrollRef.current = scrollable;

    act(() => {
      jest.advanceTimersByTime(120);
    });

    // sec2's panelRow item sits at index 6.
    expect(scrollable.scrollToIndex).toHaveBeenCalledWith({
      index: 6,
      viewOffset: 80,
      animated: true,
    });
    mockActivePanel.value = null;
    jest.useRealTimers();
  });
});
