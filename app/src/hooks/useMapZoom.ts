/**
 * useMapZoom — Tracks current zoom level from MapView.
 * Debounced to avoid re-renders on every drag frame.
 */

import { useState, useCallback, useRef } from 'react';
import { zoomFromDelta } from '../utils/geoMath';
import type { Region } from 'react-native-maps';

export function useMapZoom(initialZoom: number = 5) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRegionChange = useCallback((region: Region) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setZoomLevel(zoomFromDelta(region.latitudeDelta));
    }, 150);
  }, []);

  return { zoomLevel, onRegionChange };
}
