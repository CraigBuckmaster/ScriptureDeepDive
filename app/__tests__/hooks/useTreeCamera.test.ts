import { renderHook, act } from '@testing-library/react-native';

// react-native-reanimated's runOnJS is a passthrough in tests so the hook
// logic runs synchronously.
jest.mock('react-native-reanimated', () => ({
  runOnJS: (fn: any) => fn,
}));

// Gesture-handler needs a tiny stand-in for Gesture.Pan / Gesture.Pinch
// that captures the callbacks so tests can trigger them manually.
jest.mock('react-native-gesture-handler', () => {
  const builder = () => {
    const handlers: Record<string, any> = {};
    const g: any = {
      __handlers: handlers,
      minDistance: () => g,
      onBegin: (cb: any) => { handlers.onBegin = cb; return g; },
      onUpdate: (cb: any) => { handlers.onUpdate = cb; return g; },
      onEnd: (cb: any) => { handlers.onEnd = cb; return g; },
    };
    return g;
  };
  return {
    Gesture: {
      Pan: builder,
      Pinch: builder,
      Simultaneous: (...gs: any[]) => ({ _simultaneous: gs }),
    },
  };
});

import { useTreeCamera } from '@/hooks/useTreeCamera';

describe('useTreeCamera', () => {
  it('starts with the mobile initial zoom and a zeroed camera', () => {
    const { result } = renderHook(() => useTreeCamera());
    expect(result.current.camera.x).toBe(0);
    expect(result.current.camera.y).toBe(0);
    // On the default jsdom screen (<768 px) we expect the mobile zoom.
    expect(result.current.camera.zoom).toBeGreaterThan(0);
    expect(result.current.camera.zoom).toBeLessThanOrEqual(1);
  });

  it('derives viewBox from camera state and screen size', () => {
    const { result } = renderHook(() => useTreeCamera());
    const parts = result.current.viewBox.split(' ').map(Number);
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe(result.current.camera.x);
    expect(parts[1]).toBe(result.current.camera.y);
    expect(parts[2]).toBeCloseTo(result.current.viewW, 5);
    expect(parts[3]).toBeCloseTo(result.current.viewH, 5);
  });

  it('centreOnNode places the world point in the middle of the viewport', () => {
    const { result } = renderHook(() => useTreeCamera());
    const beforeZoom = result.current.camera.zoom;
    const vW = result.current.viewW;
    const vH = result.current.viewH;
    act(() => {
      result.current.centreOnNode(500, 700);
    });
    // x = worldX - vW/2, y = worldY - vH/2 (at the SAME zoom).
    expect(result.current.camera.zoom).toBe(beforeZoom);
    expect(result.current.camera.x).toBeCloseTo(500 - vW / 2, 3);
    expect(result.current.camera.y).toBeCloseTo(700 - vH / 2, 3);
  });

  it('centreOnNodeTop places the world point near the top of the viewport', () => {
    const { result } = renderHook(() => useTreeCamera());
    const vW = result.current.viewW;
    const vH = result.current.viewH;
    act(() => {
      result.current.centreOnNodeTop(300, 200);
    });
    expect(result.current.camera.x).toBeCloseTo(300 - vW / 2, 3);
    expect(result.current.camera.y).toBeCloseTo(200 - vH * 0.15, 3);
  });

  it('centreOnNodeAbovePanel places the world point above a bottom sidebar', () => {
    const { result } = renderHook(() => useTreeCamera());
    const vH = result.current.viewH;
    act(() => {
      result.current.centreOnNodeAbovePanel(400, 600);
    });
    expect(result.current.camera.y).toBeCloseTo(600 - vH * 0.25, 3);
  });
});
