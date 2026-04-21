/**
 * Unit test for the native-module guard.
 *
 * The probe calls `TurboModuleRegistry.get('MLRNNetworkModule')` — see
 * the long comment in `isMapNativeAvailable.ts` for why require() was
 * removed. `jest.setup.js` installs a global `jest.spyOn` on
 * `TurboModuleRegistry.get` that returns a setConnected-capable stub
 * for `'MLRNNetworkModule'` and falls through for other names, so the
 * default in every test suite is "MapLibre native available".
 *
 * Per-test overrides here do NOT replace the react-native module
 * wholesale — spreading `jest.requireActual('react-native')` eagerly
 * evaluates VirtualizedList and other internals that blow up in
 * jest-expo context. Instead we mutate the existing spy's
 * implementation for each test, then reset it in `afterEach` so the
 * default survives for downstream suites.
 *
 * `jest.isolateModules` gives each test a fresh module registry so the
 * probe's memoised `_probeResult` doesn't leak between cases.
 */

import { TurboModuleRegistry } from 'react-native';

const getSpy = TurboModuleRegistry.get as unknown as jest.Mock;

/** Default implementation mirroring the one installed by jest.setup.js. */
function installDefaultMock(): void {
  getSpy.mockReset();
  getSpy.mockImplementation((name: string) => {
    if (name === 'MLRNNetworkModule') {
      return { setConnected: jest.fn() };
    }
    return undefined;
  });
}

describe('isMapNativeAvailable', () => {
  afterEach(() => {
    // Restore the global setup default so subsequent test suites see
    // the expected "MapLibre native available" behaviour. We reset
    // rather than restore, because restoreAllMocks would also kill the
    // jest.setup.js spy entirely.
    installDefaultMock();
  });

  it('returns true when MLRNNetworkModule TurboModule is registered', () => {
    // Uses the jest.setup default — no per-test override needed.
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns false when TurboModule is not registered (Expo Go / plugin not linked)', () => {
    getSpy.mockImplementation(() => null);
    jest.isolateModules(() => {
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
    getSpy.mockImplementation((name: string) => {
      if (name === 'MLRNNetworkModule') {
        return {
          setConnected: jest.fn(() => {
            throw new Error('iOS native method unavailable');
          }),
        };
      }
      return undefined;
    });
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      // Degrades gracefully — TurboModule presence is the real signal;
      // setConnected failure just gets logged.
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns true when TurboModule is registered without setConnected (method absent)', () => {
    getSpy.mockImplementation((name: string) => {
      if (name === 'MLRNNetworkModule') {
        // No setConnected — e.g. if MapLibre renames the method in a
        // future spec version. We should still succeed on the presence
        // signal alone.
        return {};
      }
      return undefined;
    });
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isMapNativeAvailable } = require('@/utils/isMapNativeAvailable');
      expect(isMapNativeAvailable()).toBe(true);
    });
  });

  it('returns false with error reason when TurboModuleRegistry.get itself throws', () => {
    getSpy.mockImplementation(() => {
      throw new Error('registry subsystem offline');
    });
    jest.isolateModules(() => {
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
