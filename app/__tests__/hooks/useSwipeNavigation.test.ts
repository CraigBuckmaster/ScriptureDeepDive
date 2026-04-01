import { renderHook, act } from '@testing-library/react-native';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

function makeTouchEvent(pageX: number, pageY: number) {
  return { nativeEvent: { pageX, pageY } } as any;
}

describe('useSwipeNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns onTouchStart and onTouchEnd functions', () => {
    const { result } = renderHook(() => useSwipeNavigation(jest.fn(), jest.fn()));
    expect(typeof result.current.onTouchStart).toBe('function');
    expect(typeof result.current.onTouchEnd).toBe('function');
  });

  it('fires onSwipeRight for a right swipe with sufficient distance and speed', () => {
    const onSwipeRight = jest.fn();
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() => useSwipeNavigation(onSwipeRight, onSwipeLeft));

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)  // touchStart
      .mockReturnValueOnce(1200); // touchEnd (200ms < 500ms)

    act(() => {
      result.current.onTouchStart(makeTouchEvent(50, 200));
    });
    act(() => {
      result.current.onTouchEnd(makeTouchEvent(200, 210)); // dx=150 > 80, dy=10, ratio OK
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('fires onSwipeLeft for a left swipe with sufficient distance and speed', () => {
    const onSwipeRight = jest.fn();
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() => useSwipeNavigation(onSwipeRight, onSwipeLeft));

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1200);

    act(() => {
      result.current.onTouchStart(makeTouchEvent(250, 200));
    });
    act(() => {
      result.current.onTouchEnd(makeTouchEvent(100, 210)); // dx=-150, left swipe
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('ignores swipe with insufficient distance', () => {
    const onSwipeRight = jest.fn();
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() => useSwipeNavigation(onSwipeRight, onSwipeLeft));

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1200);

    act(() => {
      result.current.onTouchStart(makeTouchEvent(100, 200));
    });
    act(() => {
      result.current.onTouchEnd(makeTouchEvent(140, 200)); // dx=40 < 80
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('ignores vertical motion (non-horizontal swipe)', () => {
    const onSwipeRight = jest.fn();
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() => useSwipeNavigation(onSwipeRight, onSwipeLeft));

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1200);

    act(() => {
      result.current.onTouchStart(makeTouchEvent(100, 100));
    });
    act(() => {
      result.current.onTouchEnd(makeTouchEvent(200, 250)); // dx=100, dy=150, not 2:1 ratio
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('ignores slow swipes (> 500ms)', () => {
    const onSwipeRight = jest.fn();
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() => useSwipeNavigation(onSwipeRight, onSwipeLeft));

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1600); // 600ms > 500ms

    act(() => {
      result.current.onTouchStart(makeTouchEvent(50, 200));
    });
    act(() => {
      result.current.onTouchEnd(makeTouchEvent(200, 200));
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });
});
