/**
 * Unit test for the native-module guard.
 *
 * The probe now calls `TurboModuleRegistry.get('MLRNNetworkModule')`
 * directly (see the long comment in `isMapNativeAvailable.ts` for why
 * require() was removed). We toggle the mocked `get` per case via
 * `jest.isolateModules` — it creates a fresh registry scoped to the
 * callback, so per-test `jest.doMock` overrides both the global
 * `react-native` mock from jest-expo AND any earlier doMock override.
 * Plain `jest.resetModules()` + `jest.doMock()` outside of an isolate
 * block proved unreliable under `--coverage` (the hoisted preset
 * factory kept winning).
 *
 * Each test uses `jest.requireActual('react-native')` to inherit the
 * jest-expo preset's full react-native surface, then overrides just
 * `TurboModuleRegistry.get`. That way we don't have to manually stub
 * out the dozens of other exports the module graph reaches into during
 * module load.
 */

describe('isMapNativeAvailable', () => {
  it('returns true when MLRNNetworkModule TurboModule is registered', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => {
        const actual = jest.requireActual('react-native');
        return {
          ...actual,
          TurboModuleRegistry: {
            ...actual.TurboModuleRegistry,
            get: jest.fn().mockReturnValue({
              setConnected: jest.fn(),
            }),
          },
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns false when TurboModule is not registered (Expo Go / plugin not linked)', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => {
        const actual = jest.requireActual('react-native');
        return {
          ...actual,
          TurboModuleRegistry: {
            ...actual.TurboModuleRegistry,
            get: jest.fn().mockReturnValue(null),
          },
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        isMapNativeAvailable,
        getMapUnavailableReason,
      } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(false);
      expect(getMapUnavailableReason()).toMatch(/MLRNNetworkModule/);
      expect(getMapUnavailableReason()).toMatch(/not registered/);
    });
  });

  it('returns true when setConnected throws (iOS no-op path / future spec drift)', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => {
        const actual = jest.requireActual('react-native');
        return {
          ...actual,
          TurboModuleRegistry: {
            ...actual.TurboModuleRegistry,
            get: jest.fn().mockReturnValue({
              setConnected: jest.fn(() => {
                throw new Error('iOS native method unavailable');
              }),
            }),
          },
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      // Degrades gracefully — TurboModule presence is the real signal;
      // setConnected failure just gets logged.
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns true when TurboModule is registered without setConnected (method absent)', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => {
        const actual = jest.requireActual('react-native');
        return {
          ...actual,
          TurboModuleRegistry: {
            ...actual.TurboModuleRegistry,
            get: jest.fn().mockReturnValue({
              // No setConnected — e.g., if MapLibre renames the method in
              // a future spec version. We should still succeed on the
              // presence signal.
            }),
          },
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns false with error reason when TurboModuleRegistry.get itself throws', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => {
        const actual = jest.requireActual('react-native');
        return {
          ...actual,
          TurboModuleRegistry: {
            ...actual.TurboModuleRegistry,
            get: jest.fn(() => {
              throw new Error('registry subsystem offline');
            }),
          },
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        isMapNativeAvailable,
        getMapUnavailableReason,
      } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(false);
      expect(getMapUnavailableReason()).toMatch(/registry subsystem offline/);
    });
  });
});
