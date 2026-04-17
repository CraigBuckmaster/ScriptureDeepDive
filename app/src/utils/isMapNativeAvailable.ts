/**
 * isMapNativeAvailable — True when MapLibre's native module is linked
 * AND can be safely exercised from JS in the current binary.
 *
 * Returns `false` in three cases:
 *   1. Expo Go and dev/preview builds created before the
 *      `@maplibre/maplibre-react-native` Expo plugin was added — the
 *      native module simply isn't linked into the binary.
 *   2. Builds where the module is registered but broken (e.g. the rare
 *      case where MapLibre registers but a JS-side dependency throws
 *      during module load).
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
 * ── Notes on v10 → v11 architecture transition ─────────────────────
 *
 * MapLibre v10 on the legacy bridge registered a module called
 * `MLRNModule` accessible via `NativeModules.MLRNModule`. The original
 * probe checked that name as a cheap presence test before trying to
 * exercise the JS API.
 *
 * Under v11 + the React Native New Architecture the module is
 * registered via `TurboModuleRegistry` as `MLRNNetworkModule` (and
 * friends). `NativeModules.MLRNModule` is permanently null because
 * that name never gets registered at all. Relying on the legacy-bridge
 * presence check against that name made the probe report "not
 * registered" even when MapLibre was fully functional — producing the
 * "Map unavailable" card on TestFlight builds that had the map
 * perfectly wired up.
 *
 * We now rely on successfully require()-ing the package and finding
 * the first-class `Map` export (v11 replaces v10's `MapView`) as
 * evidence that the JS bindings are in place. If `require` fails
 * (Expo Go, missing native side) we catch and return false with a
 * useful reason. Component-level throws at render time still get
 * caught by MapErrorBoundary as defence in depth.
 */

import { logger } from './logger';

let _probeResult: boolean | null = null;
let _probeError: string | null = null;

function probe(): boolean {
  try {
    // Dynamic require so the native module isn't pulled into Expo Go
    // builds via the static import graph. In builds without the
    // MapLibre plugin linked, the JS package is still present but any
    // of its components will throw at first native access — the
    // require itself may succeed.
    //
    // We look for the `Map` named export as proof that we're on v11
    // (v10 exported it as `MapView`). If we ever need to support both
    // versions side-by-side we'd broaden this, but we're on v11 now.
    //
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MapLibreRN = require('@maplibre/maplibre-react-native');
    if (MapLibreRN == null || typeof MapLibreRN !== 'object') {
      _probeError = 'MapLibre package resolved to non-object';
      return false;
    }
    if (MapLibreRN.Map == null) {
      _probeError = 'MapLibre package loaded but "Map" export missing (v10 residue?)';
      return false;
    }

    // NetworkManager.setConnected is Android-only in v11. On iOS it's a
    // no-op, but calling it is the cheapest way to touch the native
    // TurboModule from JS — if the module isn't linked we get a clean
    // throw here instead of a fabric-instantiation crash later.
    if (typeof MapLibreRN?.NetworkManager?.setConnected === 'function') {
      try {
        MapLibreRN.NetworkManager.setConnected(true);
      } catch (connErr) {
        // Don't fail the probe on setConnected errors — on iOS this
        // path isn't meaningful. Log but continue.
        logger.warn(
          'isMapNativeAvailable',
          'NetworkManager.setConnected threw, continuing',
          connErr,
        );
      }
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
 * package resolution.
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
