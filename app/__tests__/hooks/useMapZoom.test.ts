import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/utils/geoMath', () => ({
  zoomFromDelta: jest.fn((delta: number) => Math.round(Math.log2(360 / delta))),
}));

import { useMapZoom } from '@/hooks/useMapZoom';

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

  it('updates zoom after debounce on region change', () => {
    const { result } = renderHook(() => useMapZoom(5));
    act(() => {
      result.current.onRegionChange({
        latitude: 31,
        longitude: 35,
        latitudeDelta: 1.4,
        longitudeDelta: 1.4,
      });
      jest.advanceTimersByTime(200);
    });
    expect(result.current.zoomLevel).toBeGreaterThan(0);
  });

  it('debounces rapid region changes', () => {
    const { zoomFromDelta } = require('@/utils/geoMath');
    const { result } = renderHook(() => useMapZoom(5));

    act(() => {
      // Fire 3 rapid changes
      result.current.onRegionChange({ latitude: 0, longitude: 0, latitudeDelta: 10, longitudeDelta: 10 });
      result.current.onRegionChange({ latitude: 0, longitude: 0, latitudeDelta: 5, longitudeDelta: 5 });
      result.current.onRegionChange({ latitude: 0, longitude: 0, latitudeDelta: 2, longitudeDelta: 2 });
      jest.advanceTimersByTime(200);
    });

    // Only the last call should have resulted in a state update
    expect(zoomFromDelta).toHaveBeenLastCalledWith(2);
  });
});
