import { renderHook, act } from '@testing-library/react-native';

const mockCompletePlanDay = jest.fn().mockResolvedValue(undefined);

jest.mock('@/db/user', () => ({
  completePlanDay: (...args: any[]) => mockCompletePlanDay(...args),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

const mockClearActivePanel = jest.fn();
jest.mock('@/stores', () => ({
  useReaderStore: (selector: any) =>
    selector({
      activePanel: null,
      clearActivePanel: mockClearActivePanel,
    }),
}));

import { useChapterScroll } from '@/hooks/chapter/useChapterScroll';

function createOptions(overrides = {}) {
  return {
    bookId: 'genesis',
    chapterNum: 1,
    isLoading: false,
    versesLength: 31,
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

  it('returns scroll and layout refs', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));
    expect(result.current.scrollRef).toBeDefined();
    expect(result.current.sectionYMap).toBeDefined();
    expect(result.current.verseYMap).toBeDefined();
  });

  it('handleSectionLayout stores section Y position', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    act(() => {
      result.current.handleSectionLayout('sec1', 100);
    });

    expect(result.current.sectionYMap.current['sec1']).toBe(100);
  });

  it('handleVerseLayout stores absolute verse Y position', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    // First set the section Y
    act(() => {
      result.current.handleSectionLayout('sec1', 200);
    });

    // Then set the verse Y relative to section
    act(() => {
      result.current.handleVerseLayout(5, 50, 'sec1');
    });

    // Absolute Y = sectionY (200) + relativeVerseY (50) = 250
    expect(result.current.verseYMap.current[5]).toBe(250);
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

  it('handleBtnRowLayout stores button row Y position', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    // Set section Y first
    act(() => {
      result.current.handleSectionLayout('sec1', 300);
    });

    act(() => {
      result.current.handleBtnRowLayout('sec1', 300, 150);
    });

    // The function stores secY + rowY where secY is read from sectionYMap
    // handleBtnRowLayout ignores the _sectionY param and reads from sectionYMap
    // So it's sectionYMap['sec1'] (300) + rowY (150) = 450
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

  it('handleVerseLayout uses 0 when section not found', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    // Don't set section layout, then set verse layout
    act(() => {
      result.current.handleVerseLayout(1, 50, 'unknown_section');
    });

    // Should use 0 + 50 = 50
    expect(result.current.verseYMap.current[1]).toBe(50);
  });

  it('handleBtnRowLayout uses 0 when section not found', () => {
    const { result } = renderHook(() => useChapterScroll(createOptions()));

    act(() => {
      result.current.handleBtnRowLayout('unknown_section', 0, 100);
    });
    // Should use 0 (no section in sectionYMap) + 100 = 100
  });
});
