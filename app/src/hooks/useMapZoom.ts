/**
 * useMapZoom — Tracks current zoom level from the MapLibre `Map` component.
 *
 * MapLibre RN v11 replaced the region-change GeoJSON feature payload with a
 * structured `ViewStateChangeEvent` carrying `{ center, zoom, bearing, pitch,
 * bounds }` under `event.nativeEvent`. We debounce updates to avoid
 * re-rendering on every drag frame.
 *
 * Wire into <Map onRegionDidChange={onRegionDidChange}> to keep the returned
 * `zoomLevel` in sync with the visible camera.
 */

import { useState, useCallback, useRef } from 'react';

/** Subset of the v11 view-state event we care about. */
interface ViewStateEventLike {
  nativeEvent?: { zoom?: number };
  // Backwards-compat shape from v10 in case any caller still passes the old
  // GeoJSON feature during the migration. Kept until the map bundle is
  // validated end-to-end under v11.
  properties?: { zoomLevel?: number };
}

export function useMapZoom(initialZoom: number = 5) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRegionDidChange = useCallback((event: ViewStateEventLike) => {
    const zoom = event?.nativeEvent?.zoom ?? event?.properties?.zoomLevel;
    if (typeof zoom !== 'number') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setZoomLevel(Math.max(0, Math.min(22, zoom)));
    }, 150);
  }, []);

  return { zoomLevel, onRegionDidChange };
}
