/**
 * useMapZoom — Tracks current zoom level from a MapLibre MapView.
 *
 * MapLibre exposes zoom directly on the region-did-change event
 * (no delta arithmetic required). Debounced to avoid re-renders on
 * every drag frame.
 *
 * Wire into <MapView onRegionDidChange={onRegionDidChange}> to keep
 * the returned `zoomLevel` in sync with the visible camera.
 */

import { useState, useCallback, useRef } from 'react';

/** Subset of the MapLibre region-change feature we care about. */
interface RegionFeature {
  properties?: {
    zoomLevel?: number;
    heading?: number;
    pitch?: number;
    isUserInteraction?: boolean;
  };
}

export function useMapZoom(initialZoom: number = 5) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRegionDidChange = useCallback((feature: RegionFeature) => {
    const zoom = feature?.properties?.zoomLevel;
    if (typeof zoom !== 'number') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setZoomLevel(Math.max(0, Math.min(22, zoom)));
    }, 150);
  }, []);

  return { zoomLevel, onRegionDidChange };
}
