/**
 * Unit test for the native-module guard.
 *
 * React Native's NativeModules lookup table varies by environment —
 * Expo Go returns `undefined` for `MLRNModule`, dev builds return the
 * registered bridge object. We want the guard to be truthy only in
 * the latter case.
 */

import { NativeModules } from 'react-native';
import {
  isMapNativeAvailable,
  __resetMapNativeProbeForTests,
} from '@/utils/isMapNativeAvailable';

describe('isMapNativeAvailable', () => {
  const originalModule = (NativeModules as any).MLRNModule;

  beforeEach(() => {
    // The probe memoises its result for production efficiency. Tests
    // that mutate NativeModules.MLRNModule per case must clear that
    // memoisation between cases or they'll see whichever result the
    // first case produced.
    __resetMapNativeProbeForTests();
  });

  afterEach(() => {
    (NativeModules as any).MLRNModule = originalModule;
  });

  it('returns false when MLRNModule is undefined (Expo Go)', () => {
    (NativeModules as any).MLRNModule = undefined;
    expect(isMapNativeAvailable()).toBe(false);
  });

  it('returns false when MLRNModule is null', () => {
    (NativeModules as any).MLRNModule = null;
    expect(isMapNativeAvailable()).toBe(false);
  });

  it('returns true when MLRNModule is registered (dev build)', () => {
    (NativeModules as any).MLRNModule = { someMethod: jest.fn() };
    expect(isMapNativeAvailable()).toBe(true);
  });
});
