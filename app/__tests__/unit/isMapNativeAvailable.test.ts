/**
 * Unit test for the native-module guard.
 *
 * The probe uses `require('@maplibre/maplibre-react-native')` + a check
 * for the `Map` named export as evidence that MapLibre v11's native
 * side is linked into this binary. We toggle the mocked module's shape
 * per case via `jest.isolateModules` — it creates a fresh registry
 * (including fresh mock-factory resolution) scoped to the callback, so
 * per-test `jest.doMock` overrides both the global jest.setup mock AND
 * any file-level hoisted mock. Plain `jest.resetModules()` +
 * `jest.doMock()` outside of an isolate block proved unreliable under
 * `--coverage` (the hoisted setup factory kept winning).
 */

describe('isMapNativeAvailable', () => {
  it('returns true when MapLibre package loads with Map export (linked build)', () => {
    jest.isolateModules(() => {
      jest.doMock('@maplibre/maplibre-react-native', () => ({
        __esModule: true,
        Map: () => null,
        NetworkManager: { setConnected: jest.fn() },
      }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns false when MapLibre package is missing (Expo Go)', () => {
    jest.isolateModules(() => {
      jest.doMock('@maplibre/maplibre-react-native', () => {
        throw new Error("Cannot find module '@maplibre/maplibre-react-native'");
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        isMapNativeAvailable,
        getMapUnavailableReason,
      } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(false);
      expect(getMapUnavailableReason()).toMatch(/Cannot find module/);
    });
  });

  it('returns false when MapLibre package loads but Map export is absent (v10 residue)', () => {
    jest.isolateModules(() => {
      jest.doMock('@maplibre/maplibre-react-native', () => ({
        __esModule: true,
        // No `Map` export — simulates v10-era package or a partial install
        MapView: () => null,
        NetworkManager: { setConnected: jest.fn() },
      }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        isMapNativeAvailable,
        getMapUnavailableReason,
      } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(false);
      expect(getMapUnavailableReason()).toMatch(/"Map" export missing/);
    });
  });

  it('survives a throw from NetworkManager.setConnected (iOS path)', () => {
    jest.isolateModules(() => {
      jest.doMock('@maplibre/maplibre-react-native', () => ({
        __esModule: true,
        Map: () => null,
        NetworkManager: {
          setConnected: jest.fn(() => {
            throw new Error('iOS native method unavailable');
          }),
        },
      }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(true);
    });
  });
});
