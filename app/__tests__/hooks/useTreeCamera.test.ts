import { renderHook, act } from '@testing-library/react-native';

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
      runOnJS: () => g,
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

  // ── Gesture throttling ───────────────────────────────────────────

  /** Grab the pan gesture's captured onUpdate handler from the mock.
   *  The Simultaneous() mock wraps [pinch, pan] in that order. */
  function getPanHandlers(result: any) {
    const pan = result.current.gesture._simultaneous[1];
    return pan.__handlers;
  }

  function getPinchHandlers(result: any) {
    const pinch = result.current.gesture._simultaneous[0];
    return pinch.__handlers;
  }

  it('throttles rapid pan updates to ~35fps', () => {
    const { result } = renderHook(() => useTreeCamera());
    const pan = getPanHandlers(result);
    const nowSpy = jest.spyOn(Date, 'now');

    try {
      // Simulate gesture begin — resets throttle so the first update fires.
      nowSpy.mockReturnValue(1000);
      act(() => { pan.onBegin(); });

      // First update at t=1000 — throttle sees 1000 - 0 = 1000 ≥ 28 → fires.
      nowSpy.mockReturnValue(1000);
      act(() => { pan.onUpdate({ translationX: 10, translationY: 0 }); });
      const afterFirst = result.current.camera.x;

      // Second update 10ms later — throttle sees 10 < 28 → DROPPED.
      nowSpy.mockReturnValue(1010);
      act(() => { pan.onUpdate({ translationX: 50, translationY: 0 }); });
      expect(result.current.camera.x).toBe(afterFirst);

      // Third update 35ms after the first — throttle sees 35 ≥ 28 → fires.
      nowSpy.mockReturnValue(1035);
      act(() => { pan.onUpdate({ translationX: 100, translationY: 0 }); });
      expect(result.current.camera.x).not.toBe(afterFirst);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('throttles rapid pinch updates to ~35fps', () => {
    const { result } = renderHook(() => useTreeCamera());
    const pinch = getPinchHandlers(result);
    const nowSpy = jest.spyOn(Date, 'now');

    try {
      nowSpy.mockReturnValue(1000);
      act(() => { pinch.onBegin({ focalX: 100, focalY: 100 }); });

      nowSpy.mockReturnValue(1000);
      act(() => { pinch.onUpdate({ scale: 1.1, focalX: 100, focalY: 100 }); });
      const afterFirstZoom = result.current.camera.zoom;

      // Within the throttle window → camera zoom unchanged.
      nowSpy.mockReturnValue(1010);
      act(() => { pinch.onUpdate({ scale: 1.5, focalX: 100, focalY: 100 }); });
      expect(result.current.camera.zoom).toBe(afterFirstZoom);

      // Past the throttle window → camera zoom updates.
      nowSpy.mockReturnValue(1040);
      act(() => { pinch.onUpdate({ scale: 2.0, focalX: 100, focalY: 100 }); });
      expect(result.current.camera.zoom).not.toBe(afterFirstZoom);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('always fires the first frame of a new pan gesture (throttle reset)', () => {
    const { result } = renderHook(() => useTreeCamera());
    const pan = getPanHandlers(result);
    const nowSpy = jest.spyOn(Date, 'now');

    try {
      // First gesture: an update fills lastPanTime = 5000.
      nowSpy.mockReturnValue(5000);
      act(() => { pan.onBegin(); });
      nowSpy.mockReturnValue(5000);
      act(() => { pan.onUpdate({ translationX: 10, translationY: 0 }); });

      // New gesture 10ms later — without the reset, this first update
      // would be throttled. onBegin resets lastPanTime to 0 so now - 0
      // is always large enough to pass.
      nowSpy.mockReturnValue(5010);
      act(() => { pan.onBegin(); });
      const beforeFirstUpdate = result.current.camera.x;
      nowSpy.mockReturnValue(5010);
      act(() => { pan.onUpdate({ translationX: 100, translationY: 0 }); });
      expect(result.current.camera.x).not.toBe(beforeFirstUpdate);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
