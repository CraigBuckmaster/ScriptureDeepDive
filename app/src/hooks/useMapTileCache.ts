/**
 * useMapTileCache — MapLibre ambient cache + biblical-region pre-cache.
 *
 * Issue #1321.
 *
 * On the first mount we:
 *   1. Set the ambient tile cache budget to 75 MB (MapLibre disk cache,
 *      shared across both the ancient and modern style).
 *   2. Pre-cache the biblical region (≈ Israel → Turkey → Egypt → Iraq)
 *      at zoom 0–7 using an offline pack, so terrain + water + coastlines
 *      render with no network. About 12 MB on disk.
 *
 * Both operations run in the background and swallow errors — a tile cache
 * failure must not block the user from opening the map. At zoom 8+ or
 * outside the biblical region, tiles load online as normal and degrade
 * to blank if the network is unavailable (acceptable per spec).
 *
 * v11 note: packs no longer accept a user-provided `name`; each pack
 * gets an auto-generated UUID. We tag ours via `metadata.name` and
 * look it up by scanning `getPacks()` rather than `getPack(name)`.
 * Option names also shifted: `styleURL` → `mapStyle`; bounds are flat
 * `[west, south, east, north]` instead of `[ne, sw]` nested tuples.
 */

import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { OfflineManager } from '@maplibre/maplibre-react-native';
import { isMapNativeAvailable } from '../utils/isMapNativeAvailable';
import { logger } from '../utils/logger';

/** 75 MB ambient tile cache budget — see issue #1321. */
const AMBIENT_CACHE_BYTES = 75 * 1024 * 1024;

/**
 * Biblical region as MapLibre RN v11 `LngLatBounds`:
 * `[west, south, east, north]`. Covers Israel through Turkey, Egypt, Iraq.
 */
const BIBLICAL_BOUNDS: [number, number, number, number] = [25, 20, 55, 45];

const PACK_NAME = 'biblical-region-base';
const PACK_MIN_ZOOM = 0;
const PACK_MAX_ZOOM = 7;

/**
 * Run once per app lifetime. Idempotent: an existing pack with the same
 * metadata.name short-circuits, and the ambient cache call is cheap.
 */
export function useMapTileCache(styleURL: string) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    // MapLibre's OfflineManager has no effect (and throws) when the
    // native module isn't linked. Skip silently in Expo Go.
    if (!isMapNativeAvailable()) return;

    // Defer cache work until after the MapView has finished its initial
    // mount + interaction frame. The native side serialises offline-pack
    // creation and view registration poorly on first launch — running
    // them on the same tick has been observed to crash the map subtree
    // on iOS. runAfterInteractions queues onto the JS interaction
    // manager so the work happens after navigation and first paint.
    const handle = InteractionManager.runAfterInteractions(() => {
      (async () => {
        try {
          await OfflineManager.setMaximumAmbientCacheSize(AMBIENT_CACHE_BYTES);
        } catch (err) {
          logger.warn('useMapTileCache', 'Failed to set ambient cache size', err);
        }

        try {
          // v11 has no `getPack(name)` — packs are UUID-keyed. Scan the
          // list and match our tag in `metadata.name`.
          const existing = await OfflineManager.getPacks();
          const alreadyCached = existing.some(
            (p) => p?.metadata?.name === PACK_NAME,
          );
          if (alreadyCached) return;

          await OfflineManager.createPack(
            {
              mapStyle: styleURL,
              minZoom: PACK_MIN_ZOOM,
              maxZoom: PACK_MAX_ZOOM,
              bounds: BIBLICAL_BOUNDS,
              metadata: { name: PACK_NAME },
            },
            // Progress and error listeners are required by the API but we
            // don't surface either to the user — the download runs in the
            // background. Log errors for diagnosis only.
            () => undefined,
            (_pack, err) => {
              logger.warn('useMapTileCache', 'Offline pack error', err);
            },
          );
        } catch (err) {
          logger.warn('useMapTileCache', 'Failed to create offline pack', err);
        }
      })();
    });

    return () => {
      // Cancel the deferred work if the screen unmounts before it ran.
      handle.cancel();
    };
  }, [styleURL]);
}
