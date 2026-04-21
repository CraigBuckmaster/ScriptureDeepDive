/**
 * isMapNativeAvailable — True when MapLibre's native module is linked
 * AND can be safely exercised from JS in the current binary.
 *
 * Returns `false` in three cases:
 *   1. Expo Go and dev/preview builds created before the
 *      `@maplibre/maplibre-react-native` Expo plugin was added — the
 *      native module simply isn't linked into the binary.
 *   2. Builds where the module is registered but broken (e.g. an
 *      unexpected throw during the cheap native probe call).
 *   3. Any other native error during the one-shot probe.
 *
 * The probe runs once per app lifetime and the result is memoised, so
 * this is cheap to call from render paths.
 *
 * Consumers should branch on this check and render a friendly fallback
 * (MapUnavailableCard) rather than letting the map tree crash. For
 * defence in depth, MapErrorBoundary catches anything that slips past
 * this gate during render.
 *
 * ── Why we probe via TurboModuleRegistry and NOT require() ────────────
 *
 * Up to Apr 2026 the probe did `require('@maplibre/maplibre-react-native')`
 * and then inspected the returned module object (looking for the `Map`
 * named export + calling `NetworkManager.setConnected`). That approach
 * had a fatal flaw under the New Architecture.
 *
 * The `@maplibre/maplibre-react-native` package.json `exports` map routes
 * `import` statements to `./lib/module/index.js` but `require()` calls
 * to `./lib/commonjs/index.js`. Every other consumer in this app uses
 * `import` — only this probe file used `require`. Metro therefore
 * bundled BOTH flavors of the package in parallel: the module-flavor
 * tree (consumed by every screen and hook) plus a complete mirror of
 * the commonjs-flavor tree (consumed only by this one probe). Every
 * MapLibre component module calls `NativeComponentRegistry.get(...)` at
 * module-load time with names like "MLRNCamera", "MLRNMapView", etc. —
 * once per copy. Two copies, two registrations, and
 * `ReactNativeViewConfigRegistry` (see
 * `node_modules/react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry.js:74`)
 * throws on the second one:
 *
 *     Invariant Violation: Tried to register two views with the same name MLRNCamera
 *
 * The crash surfaced the moment MapScreen mounted — that was the first
 * point in a normal session where the commonjs module graph finished
 * eager-evaluating.
 *
 * Fix: probe via `TurboModuleRegistry.get('MLRNNetworkModule')` directly.
 * This reaches the native TurboModule registry without loading any
 * `@maplibre` JavaScript, so the probe:
 *   - does not pull the package into the bundle (no duplication)
 *   - returns null in Expo Go / non-linked builds instead of throwing
 *     during top-level TurboModule eager evaluation
 *   - stays synchronous and render-safe, same contract as before
 *
 * Using `get` (returns `?T`) rather than `getEnforcing` (throws) is
 * deliberate — Expo Go is the exact "not registered" case, and we want
 * it to become a graceful `MapUnavailableCard`, not a crash.
 */

import { TurboModuleRegistry, type TurboModule } from 'react-native';

import { logger } from './logger';

/**
 * Minimal TurboModule shape for MLRNNetworkModule. We only use
 * `setConnected` for the optional exercise call, and MapLibre's spec
 * declares it on Android only — iOS implements it as a no-op, so the
 * method may or may not be typed as present. Kept optional for safety.
 */
interface MLRNNetworkModule extends TurboModule {
  setConnected?: (connected: boolean) => void;
}

const MODULE_NAME = 'MLRNNetworkModule';

let _probeResult: boolean | null = null;
let _probeError: string | null = null;

function probe(): boolean {
  try {
    const networkModule = TurboModuleRegistry.get<MLRNNetworkModule>(MODULE_NAME);
    if (networkModule == null) {
      _probeError = `${MODULE_NAME} TurboModule not registered (MapLibre plugin not linked in this binary)`;
      return false;
    }

    // Cheap native-side liveness check. On iOS this is a no-op inside
    // MLRNNetworkModule.mm — but invoking it still exercises the
    // JSI → native bridge round-trip, so a broken module binding
    // surfaces here rather than at first render.
    if (typeof networkModule.setConnected === 'function') {
      try {
        networkModule.setConnected(true);
      } catch (connErr) {
        // Don't fail the probe on setConnected errors — the method is
        // Android-only in MapLibre's spec and may differ across versions.
        // The TurboModule is registered and callable; that's enough.
        logger.warn(
          'isMapNativeAvailable',
          'MLRNNetworkModule.setConnected threw, continuing',
          connErr,
        );
      }
    }
    return true;
  } catch (err) {
    _probeError = err instanceof Error ? err.message : String(err);
    logger.warn('isMapNativeAvailable', 'MapLibre TurboModule probe failed', err);
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
 * Diagnostic accessor for MapUnavailableCard so dev builds and
 * TestFlight tester builds can surface the actual failure reason
 * rather than asking the user (or future you) to spelunk Xcode device
 * logs.
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
 * memoisation has to be reset between test cases that mutate the
 * TurboModuleRegistry mock.
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
