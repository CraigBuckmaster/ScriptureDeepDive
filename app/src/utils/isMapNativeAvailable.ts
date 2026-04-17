/**
 * isMapNativeAvailable — True when MapLibre's native module is linked
 * AND can be safely exercised from JS in the current binary.
 *
 * Returns `false` in three cases:
 *   1. Expo Go and dev/preview builds created before the
 *      `@maplibre/maplibre-react-native` Expo plugin was added — the
 *      MLRNModule singleton simply doesn't exist.
 *   2. Builds where the module is registered but broken (e.g. MapLibre
 *      v10 under the React Native New Architecture, where MLRNModule
 *      passes the presence check but MLRNMapView throws at fabric
 *      component instantiation). Just probing `NativeModules?.MLRNModule`
 *      isn't enough — we have to *use* the module to find out.
 *   3. Any other native error during the one-shot probe.
 *
 * The probe runs once per app lifetime and the result is memoised, so
 * this is cheap to call from render paths.
 *
 * Consumers should branch on this check and render a friendly fallback
 * (MapUnavailableCard) rather than letting the map tree crash. For
 * defence in depth, MapErrorBoundary catches anything that slips past
 * this gate during render.
 */

import { NativeModules } from 'react-native';
import { logger } from './logger';

let _probeResult: boolean | null = null;
let _probeError: string | null = null;

function probe(): boolean {
  // Cheap presence check first — saves us from even trying to require()
  // the JS module in Expo Go.
  if (NativeModules?.MLRNModule == null) {
    _probeError = 'MLRNModule native module not registered';
    return false;
  }

  try {
    // Dynamic require so the native module isn't pulled into Expo Go
    // builds via the static import graph. We exercise a cheap no-throw
    // API — if that throws, the native side is broken in some way we
    // can't render around.
    //
    // MapLibre RN v11 removed the package's `default` export and moved
    // the top-level `setConnected` helper under `NetworkManager`. If
    // either the module or the manager is missing (older versions or
    // test mocks) we treat that as success: the presence of MLRNModule
    // is sufficient evidence that the native side is wired up.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MapLibreGL = require('@maplibre/maplibre-react-native');
    if (typeof MapLibreGL?.NetworkManager?.setConnected === 'function') {
      MapLibreGL.NetworkManager.setConnected(true);
    }
    return true;
  } catch (err) {
    _probeError = err instanceof Error ? err.message : String(err);
    logger.warn('isMapNativeAvailable', 'MapLibre probe failed', err);
    return false;
  }
}

export function isMapNativeAvailable(): boolean {
  if (_probeResult === null) {
    _probeResult = probe();
  }
  return _probeResult;
}

/**
 * Diagnostic accessor for MapUnavailableCard so the dev build can surface
 * the actual failure reason rather than asking the user (or future you)
 * to spelunk Xcode device logs.
 */
export function getMapUnavailableReason(): string | null {
  // Force the probe to run if it hasn't yet so callers don't get a stale
  // null when the component mounts before the gate is checked.
  isMapNativeAvailable();
  return _probeError;
}

/**
 * Test-only helper to clear the memoised probe state between cases.
 * The probe deliberately memoises so production callers can hit it from
 * render paths without paying for a re-probe each time, but that
 * memoisation has to be reset between test cases that mutate
 * NativeModules.MLRNModule.
 *
 * Guarded against accidental production use — calling this in a non-test
 * environment is a no-op.
 */
export function __resetMapNativeProbeForTests(): void {
  if (process.env.NODE_ENV !== 'test') return;
  _probeResult = null;
  _probeError = null;
}

/**
 * One-time MapLibre module init. Now a no-op preserved for backwards
 * compatibility — the probe in `isMapNativeAvailable` already calls
 * `setConnected(true)` on the success path. Kept exported so existing
 * `ensureMapLibreInit()` call sites continue to compile.
 */
export function ensureMapLibreInit(): void {
  // Probe is the init. Calling it is idempotent.
  isMapNativeAvailable();
}
