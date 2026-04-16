/**
 * isMapNativeAvailable — True when MapLibre's native module is linked
 * into the current app binary.
 *
 * Returns `false` in Expo Go and in dev/preview builds that were created
 * before the `@maplibre/maplibre-react-native` Expo plugin was added. The
 * library itself logs a noisy console.error when the native module is
 * missing; rendering any MapLibre component in that state throws
 * "Element type is invalid" because `requireNativeComponent('MLRNMapView')`
 * resolves to undefined.
 *
 * Consumers should branch on this check and render a friendly fallback
 * rather than letting the map tree crash.
 */

import { NativeModules } from 'react-native';

export function isMapNativeAvailable(): boolean {
  // `MLRNModule` is the singleton MapLibre registers at bridge init. If
  // it's null, no MapLibre native code is loaded and we must bail before
  // any MapView / ShapeSource / Camera renders.
  return NativeModules?.MLRNModule != null;
}

/**
 * One-time MapLibre module init. Call before the first <MapView> render.
 *
 * `setConnected(true)` tells the SDK it can make network requests for
 * tiles and style JSON. Without this call, MapView may throw or render
 * a blank canvas on first mount.
 *
 * Safe to call multiple times — the flag is idempotent and the dynamic
 * require only evaluates once.
 */
let _mapLibreInitDone = false;
export function ensureMapLibreInit(): void {
  if (_mapLibreInitDone) return;
  if (!isMapNativeAvailable()) return;
  try {
    // Dynamic require so the native module isn't pulled into Expo Go builds
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MapLibreGL = require('@maplibre/maplibre-react-native').default;
    MapLibreGL.setConnected(true);
    _mapLibreInitDone = true;
  } catch {
    // Swallow — if the module isn't available, isMapNativeAvailable()
    // will gate rendering downstream.
  }
}
