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
 */

import { useEffect, useRef } from 'react';
import { OfflineManager } from '@maplibre/maplibre-react-native';
import { isMapNativeAvailable } from '../utils/isMapNativeAvailable';
import { logger } from '../utils/logger';

/** 75 MB ambient tile cache budget — see issue #1321. */
const AMBIENT_CACHE_BYTES = 75 * 1024 * 1024;

/** Biblical region — bbox covers Israel through Turkey, Egypt, Iraq. */
const BIBLICAL_BOUNDS = {
  ne: [55, 45] as [number, number],
  sw: [25, 20] as [number, number],
};

const PACK_NAME = 'biblical-region-base';
const PACK_MIN_ZOOM = 0;
const PACK_MAX_ZOOM = 7;

/**
 * Run once per app lifetime. Idempotent: creating the same pack twice
 * is a no-op (`getPack` short-circuits), and the ambient cache call is
 * cheap.
 */
export function useMapTileCache(styleURL: string) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    // MapLibre's OfflineManager has no effect (and throws) when the
    // native module isn't linked. Skip silently in Expo Go.
    if (!isMapNativeAvailable()) return;

    (async () => {
      try {
        await OfflineManager.setMaximumAmbientCacheSize(AMBIENT_CACHE_BYTES);
      } catch (err) {
        logger.warn('useMapTileCache', 'Failed to set ambient cache size', err);
      }

      try {
        const existing = await OfflineManager.getPack(PACK_NAME);
        if (existing) return;

        await OfflineManager.createPack(
          {
            name: PACK_NAME,
            styleURL,
            minZoom: PACK_MIN_ZOOM,
            maxZoom: PACK_MAX_ZOOM,
            bounds: [BIBLICAL_BOUNDS.ne, BIBLICAL_BOUNDS.sw],
          },
          // Progress and error listeners are required by the v10 API but
          // we don't surface either to the user — the download runs in
          // the background. Log errors for diagnosis only.
          () => undefined,
          (_pack, err) => {
            logger.warn('useMapTileCache', 'Offline pack error', err);
          },
        );
      } catch (err) {
        logger.warn('useMapTileCache', 'Failed to create offline pack', err);
      }
    })();
  }, [styleURL]);
}
