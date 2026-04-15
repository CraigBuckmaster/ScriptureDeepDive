/**
 * Unit test for the native-module guard.
 *
 * React Native's NativeModules lookup table varies by environment —
 * Expo Go returns `undefined` for `MLRNModule`, dev builds return the
 * registered bridge object. We want the guard to be truthy only in
 * the latter case.
 */

import { NativeModules } from 'react-native';
import { isMapNativeAvailable } from '@/utils/isMapNativeAvailable';

describe('isMapNativeAvailable', () => {
  const originalModule = (NativeModules as any).MLRNModule;

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
