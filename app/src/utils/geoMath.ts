/**
 * utils/geoMath.ts — Geographic coordinate utilities.
 *
 * CRITICAL: PWA stores [lon, lat] (GeoJSON). react-native-maps uses {latitude, longitude}.
 */

export function toLatLng([lon, lat]: number[]): { latitude: number; longitude: number } {
  return { latitude: lat, longitude: lon };
}

export function computeBearing(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function computeBounds(coords: { latitude: number; longitude: number }[]) {
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const c of coords) {
    if (c.latitude < minLat) minLat = c.latitude;
    if (c.latitude > maxLat) maxLat = c.latitude;
    if (c.longitude < minLon) minLon = c.longitude;
    if (c.longitude > maxLon) maxLon = c.longitude;
  }
  return {
    ne: { latitude: maxLat, longitude: maxLon },
    sw: { latitude: minLat, longitude: minLon },
  };
}

export function midpoint(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  return { latitude: (a.latitude + b.latitude) / 2, longitude: (a.longitude + b.longitude) / 2 };
}

/** Compute zoom level from latitudeDelta */
export function zoomFromDelta(latDelta: number): number {
  return Math.max(3, Math.min(16, Math.round(Math.log2(360 / latDelta))));
}

/** Max place priority visible at a given zoom level */
export function maxPriorityForZoom(zoom: number): number {
  if (zoom < 5) return 1;
  if (zoom < 7) return 2;
  if (zoom < 9) return 3;
  return 4;
}

/** Zoom-responsive label scale */
export function labelScale(zoom: number): number {
  return Math.max(0.7, Math.min(2.4, 0.55 + (zoom - 3) * 0.19));
}

/** Label offset in pixels from place.label_dir */
export function labelOffset(dir: string, size: number): { x: number; y: number } {
  const d = size + 4;
  const offsets: Record<string, { x: number; y: number }> = {
    n: { x: 0, y: -d },
    s: { x: 0, y: d },
    e: { x: d, y: 0 },
    w: { x: -d, y: 0 },
    ne: { x: d * 0.7, y: -d * 0.7 },
    nw: { x: -d * 0.7, y: -d * 0.7 },
    se: { x: d * 0.7, y: d * 0.7 },
    sw: { x: -d * 0.7, y: d * 0.7 },
  };
  return offsets[dir] ?? { x: d, y: 0 };
}
