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
 * Per-test overrides here mutate the spy's implementation directly,
 * then `afterEach` reinstates the setup default so downstream test
 * suites see the expected behaviour. `__resetMapNativeProbeForTests()`
 * clears the probe's memoised result between cases.
 *
 * An earlier draft of this file used `jest.isolateModules` + a fresh
 * `require` to bypass the probe's memoisation, but that gave the
 * re-required probe a DIFFERENT `react-native` module instance than
 * the one we held a reference to at the top of this file — per-test
 * spy overrides never reached the probe. Explicit reset + shared
 * module instance is simpler and avoids that trap.
 */

import { TurboModuleRegistry } from 'react-native';

import {
  isMapNativeAvailable,
  getMapUnavailableReason,
  __resetMapNativeProbeForTests,
} from '@/utils/isMapNativeAvailable';

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
  beforeEach(() => {
    __resetMapNativeProbeForTests();
  });

  afterEach(() => {
    // Restore the setup default so subsequent test suites see the
    // expected "MapLibre native available" behaviour. We reset rather
    // than restore, because restoreAllMocks would kill the jest.setup.js
    // spy entirely.
    installDefaultMock();
    __resetMapNativeProbeForTests();
  });

  it('returns true when MLRNNetworkModule TurboModule is registered', () => {
    // Uses the jest.setup default — no per-test override needed.
    expect(isMapNativeAvailable()).toBe(true);
  });

  it('returns false when TurboModule is not registered (Expo Go / plugin not linked)', () => {
    getSpy.mockImplementation(() => null);
    expect(isMapNativeAvailable()).toBe(false);
    expect(getMapUnavailableReason()).toMatch(/MLRNNetworkModule/);
    expect(getMapUnavailableReason()).toMatch(/not registered/);
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
    // Degrades gracefully — TurboModule presence is the real signal;
    // setConnected failure just gets logged.
    expect(isMapNativeAvailable()).toBe(true);
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
    expect(isMapNativeAvailable()).toBe(true);
  });

  it('returns false with error reason when TurboModuleRegistry.get itself throws', () => {
    getSpy.mockImplementation(() => {
      throw new Error('registry subsystem offline');
    });
    expect(isMapNativeAvailable()).toBe(false);
    expect(getMapUnavailableReason()).toMatch(/registry subsystem offline/);
  });
});
