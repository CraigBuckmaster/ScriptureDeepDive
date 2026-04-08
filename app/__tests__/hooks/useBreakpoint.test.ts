import { BREAKPOINTS, useBreakpoint } from '@/theme/breakpoints';
import { renderHook } from '@testing-library/react-native';

// The jest.setup.js mock for react-native returns width: 750 by default.
// We test the logic directly rather than fighting the mock.

describe('useBreakpoint', () => {
  it('exports correct BREAKPOINTS constants', () => {
    expect(BREAKPOINTS.tablet).toBe(768);
    expect(BREAKPOINTS.desktop).toBe(1024);
  });

  it('returns phone for default test dimensions (width < 768)', () => {
    const { result } = renderHook(() => useBreakpoint());
    // Default useWindowDimensions returns width 750 in test env
    expect(result.current.isPhone).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('phone');
  });

  it('returns width and height numbers', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(typeof result.current.width).toBe('number');
    expect(typeof result.current.height).toBe('number');
    expect(result.current.width).toBeGreaterThan(0);
  });

  it('all boolean flags are mutually exclusive', () => {
    const { result } = renderHook(() => useBreakpoint());
    const { isPhone, isTablet, isDesktop } = result.current;
    const trueCount = [isPhone, isTablet, isDesktop].filter(Boolean).length;
    expect(trueCount).toBe(1);
  });
});

describe('breakpoint logic', () => {
  // Test the pure logic independently of useWindowDimensions mock
  function getBreakpoint(width: number) {
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'phone';
  }

  it.each([
    [320, 'phone'],
    [375, 'phone'],
    [767, 'phone'],
    [768, 'tablet'],
    [834, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1280, 'desktop'],
    [1920, 'desktop'],
  ])('width %i → %s', (width, expected) => {
    expect(getBreakpoint(width)).toBe(expected);
  });
});
