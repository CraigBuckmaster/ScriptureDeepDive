import { renderHook, act } from '@testing-library/react-native';

import { useMapZoom } from '@/hooks/useMapZoom';

/** Build a synthetic MapLibre v11 onRegionDidChange event. */
function event(zoom: number) {
  return {
    nativeEvent: {
      zoom,
      bearing: 0,
      pitch: 0,
      animated: false,
      userInteraction: true,
    },
  };
}

describe('useMapZoom', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with initial zoom level', () => {
    const { result } = renderHook(() => useMapZoom(7));
    expect(result.current.zoomLevel).toBe(7);
  });

  it('defaults to zoom level 5', () => {
    const { result } = renderHook(() => useMapZoom());
    expect(result.current.zoomLevel).toBe(5);
  });

  it('reads zoom directly from the camera-changed event after debounce', () => {
    const { result } = renderHook(() => useMapZoom(5));
    act(() => {
      result.current.onRegionDidChange(event(8.3));
      jest.advanceTimersByTime(200);
    });
    expect(result.current.zoomLevel).toBeCloseTo(8.3, 1);
  });

  it('debounces rapid camera changes to the final value', () => {
    const { result } = renderHook(() => useMapZoom(5));

    act(() => {
      result.current.onRegionDidChange(event(3));
      result.current.onRegionDidChange(event(5));
      result.current.onRegionDidChange(event(7));
      jest.advanceTimersByTime(200);
    });

    expect(result.current.zoomLevel).toBe(7);
  });

  it('ignores events missing a zoom property', () => {
    const { result } = renderHook(() => useMapZoom(5));
    act(() => {
      result.current.onRegionDidChange({} as any);
      jest.advanceTimersByTime(200);
    });
    expect(result.current.zoomLevel).toBe(5);
  });

  it('clamps zoom values to the MapLibre range [0, 22]', () => {
    const { result } = renderHook(() => useMapZoom(5));
    act(() => {
      result.current.onRegionDidChange(event(-3));
      jest.advanceTimersByTime(200);
    });
    expect(result.current.zoomLevel).toBe(0);

    act(() => {
      result.current.onRegionDidChange(event(99));
      jest.advanceTimersByTime(200);
    });
    expect(result.current.zoomLevel).toBe(22);
  });

  it('still accepts the v10 feature-shape event during migration', () => {
    const { result } = renderHook(() => useMapZoom(5));
    act(() => {
      result.current.onRegionDidChange({ properties: { zoomLevel: 6.5 } });
      jest.advanceTimersByTime(200);
    });
    expect(result.current.zoomLevel).toBeCloseTo(6.5, 1);
  });
});
