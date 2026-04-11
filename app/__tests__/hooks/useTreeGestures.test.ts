import { renderHook, act } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return { ...actual, useSharedValue: (init: any) => ({ value: init }), useAnimatedStyle: (fn: any) => fn(), withTiming: (val: any) => val, runOnJS: (fn: any) => fn };
});

jest.mock('react-native-gesture-handler', () => {
  const gesture = {
    onBegin: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    minDistance: jest.fn().mockReturnThis(),
  };
  return {
    Gesture: {
      Pinch: () => gesture,
      Pan: () => gesture,
      Simultaneous: (...args: any[]) => args,
    },
  };
});

jest.mock('@/utils/treeBuilder', () => ({
  TREE_CONSTANTS: {
    initialScaleMobile: 0.45,
    initialScaleTablet: 0.75,
    minZoom: 0.15,
    maxZoom: 3,
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { useTreeGestures } from '@/hooks/useTreeGestures';

describe('useTreeGestures', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns initial base transform values', () => {
    const { result } = renderHook(() => useTreeGestures());
    const style = result.current.baseStyle;
    expect(style.transform).toBeDefined();
    const transforms = style.transform as any[];
    const scaleT = transforms.find((t: any) => 'scale' in t);
    // Default mobile scale (useWindowDimensions defaults to 750 in tests < 768)
    expect(scaleT.scale).toBeCloseTo(0.45, 2);
  });

  it('returns gesture style with identity transform', () => {
    const { result } = renderHook(() => useTreeGestures());
    const gs = result.current.gestureStyle;
    // gestureStyle returned from useAnimatedStyle mock (fn()) yields the transform object
    expect(gs.transform).toBeDefined();
    const transforms = gs.transform as any[];
    expect(transforms).toEqual(
      expect.arrayContaining([
        { translateX: 0 },
        { translateY: 0 },
        { scale: 1 },
      ]),
    );
  });

  it('provides a gesture object', () => {
    const { result } = renderHook(() => useTreeGestures());
    expect(result.current.gesture).toBeDefined();
  });

  it('provides centreOnNode functions', () => {
    const { result } = renderHook(() => useTreeGestures());
    expect(typeof result.current.centreOnNode).toBe('function');
    expect(typeof result.current.centreOnNodeTop).toBe('function');
    expect(typeof result.current.centreOnNodeAbovePanel).toBe('function');
  });

  it('centreOnNode updates base style', () => {
    const { result } = renderHook(() => useTreeGestures());
    act(() => {
      result.current.centreOnNode(100, 200);
    });
    const transforms = result.current.baseStyle.transform as any[];
    const txT = transforms.find((t: any) => 'translateX' in t);
    const tyT = transforms.find((t: any) => 'translateY' in t);
    // After centring, translation values should have changed from 0
    expect(txT.translateX).not.toBe(0);
    expect(tyT.translateY).not.toBe(0);
  });

  it('centreOnNodeTop updates base style with top offset', () => {
    const { result } = renderHook(() => useTreeGestures());
    act(() => {
      result.current.centreOnNodeTop(100, 200);
    });
    const transforms = result.current.baseStyle.transform as any[];
    const txT = transforms.find((t: any) => 'translateX' in t);
    const tyT = transforms.find((t: any) => 'translateY' in t);
    expect(txT.translateX).not.toBe(0);
    expect(tyT.translateY).not.toBe(0);
  });

  it('centreOnNodeAbovePanel updates base style with panel offset', () => {
    const { result } = renderHook(() => useTreeGestures());
    act(() => {
      result.current.centreOnNodeAbovePanel(100, 200);
    });
    const transforms = result.current.baseStyle.transform as any[];
    const txT = transforms.find((t: any) => 'translateX' in t);
    const tyT = transforms.find((t: any) => 'translateY' in t);
    expect(txT.translateX).not.toBe(0);
    expect(tyT.translateY).not.toBe(0);
  });

  it('centreOnNode and centreOnNodeTop produce different Y offsets', () => {
    const { result } = renderHook(() => useTreeGestures());

    act(() => { result.current.centreOnNode(100, 200); });
    const centerY = (result.current.baseStyle.transform as any[]).find((t: any) => 'translateY' in t).translateY;

    act(() => { result.current.centreOnNodeTop(100, 200); });
    const topY = (result.current.baseStyle.transform as any[]).find((t: any) => 'translateY' in t).translateY;

    expect(centerY).not.toBe(topY);
  });

  it('baseStyle scale is clamped within minZoom and maxZoom bounds', () => {
    const { result } = renderHook(() => useTreeGestures());
    const transforms = result.current.baseStyle.transform as any[];
    const scale = transforms.find((t: any) => 'scale' in t).scale;
    expect(scale).toBeGreaterThanOrEqual(0.15);
    expect(scale).toBeLessThanOrEqual(3);
  });

  it('multiple centreOnNode calls update base style correctly', () => {
    const { result } = renderHook(() => useTreeGestures());

    act(() => { result.current.centreOnNode(50, 50); });
    const transforms1 = result.current.baseStyle.transform as any[];
    const tx1 = transforms1.find((t: any) => 'translateX' in t).translateX;

    act(() => { result.current.centreOnNode(200, 300); });
    const transforms2 = result.current.baseStyle.transform as any[];
    const tx2 = transforms2.find((t: any) => 'translateX' in t).translateX;

    expect(tx1).not.toBe(tx2);
  });
});
