/**
 * Unit test for the native-module guard.
 *
 * The probe uses `require('@maplibre/maplibre-react-native')` + a check
 * for the `Map` named export as evidence that MapLibre v11's native
 * side is linked into this binary. We toggle the jest-mocked module's
 * shape between cases to exercise each branch.
 */

import {
  isMapNativeAvailable,
  getMapUnavailableReason,
  __resetMapNativeProbeForTests,
} from '@/utils/isMapNativeAvailable';

// Mock the MapLibre package so we can mutate its shape per case. The
// default shape (has `Map` export) is what a working v11-linked build
// looks like. Individual tests override with doMock for failure cases.
jest.mock('@maplibre/maplibre-react-native', () => ({
  __esModule: true,
  Map: () => null,
  NetworkManager: { setConnected: jest.fn() },
}), { virtual: true });

describe('isMapNativeAvailable', () => {
  beforeEach(() => {
    // Probe memoises per-process; clear between cases.
    __resetMapNativeProbeForTests();
    jest.resetModules();
  });

  it('returns true when MapLibre package loads with Map export (linked build)', () => {
    jest.doMock('@maplibre/maplibre-react-native', () => ({
      __esModule: true,
      Map: () => null,
      NetworkManager: { setConnected: jest.fn() },
    }), { virtual: true });
    // Re-import so the fresh doMock takes effect.
    const { isMapNativeAvailable: freshProbe } = require('@/utils/isMapNativeAvailable');
    expect(freshProbe()).toBe(true);
  });

  it('returns false when MapLibre package is missing (Expo Go)', () => {
    jest.doMock('@maplibre/maplibre-react-native', () => {
      throw new Error('Cannot find module \'@maplibre/maplibre-react-native\'');
    }, { virtual: true });
    const {
      isMapNativeAvailable: freshProbe,
      getMapUnavailableReason: freshReason,
    } = require('@/utils/isMapNativeAvailable');
    expect(freshProbe()).toBe(false);
    expect(freshReason()).toMatch(/Cannot find module/);
  });

  it('returns false when MapLibre package loads but Map export is absent (v10 residue)', () => {
    jest.doMock('@maplibre/maplibre-react-native', () => ({
      __esModule: true,
      // No `Map` export — simulates v10-era package or a partial install
      MapView: () => null,
      NetworkManager: { setConnected: jest.fn() },
    }), { virtual: true });
    const {
      isMapNativeAvailable: freshProbe,
      getMapUnavailableReason: freshReason,
    } = require('@/utils/isMapNativeAvailable');
    expect(freshProbe()).toBe(false);
    expect(freshReason()).toMatch(/"Map" export missing/);
  });

  it('survives a throw from NetworkManager.setConnected (iOS path)', () => {
    jest.doMock('@maplibre/maplibre-react-native', () => ({
      __esModule: true,
      Map: () => null,
      NetworkManager: {
        setConnected: jest.fn(() => { throw new Error('iOS native method unavailable'); }),
      },
    }), { virtual: true });
    const { isMapNativeAvailable: freshProbe } = require('@/utils/isMapNativeAvailable');
    expect(freshProbe()).toBe(true);
  });
});
