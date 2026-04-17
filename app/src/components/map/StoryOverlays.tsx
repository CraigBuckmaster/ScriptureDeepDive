/**
 * StoryOverlays — Renders a story's region polygons and journey paths
 * as MapLibre GeoJSON layers.
 *
 * Uses a single `GeoJSONSource` per channel (regions / paths / path-arrows)
 * so the map interpolates smoothly between stories when `story` changes,
 * rather than flickering as React-rendered primitives unmount and remount.
 *
 * Coordinate convention: JSON stores `[lon, lat]` (GeoJSON order); no
 * flip is needed here — MapLibre is natively GeoJSON-based.
 *
 * Issues: #1315 (MapLibre dep swap), #1319 (dashed paths + arrows +
 * animated transitions).
 */

import React, { memo, useMemo } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { eras } from '../../theme';
import type { MapStory } from '../../types';
import { safeParse } from '../../utils/logger';

interface Props {
  story: MapStory;
  zoomLevel?: number;
}

interface RawRegion {
  coords: number[][]; // [[lon,lat], ...] closed ring
  color?: string;
  label?: string;
}

interface RawPath {
  coords: number[][]; // [[lon,lat], ...]
  dashed?: boolean;
  label?: string;
}

/** Bearing (0–360°, 0=north, clockwise) from `from` to `to`. */
export function bearingDeg(from: [number, number], to: [number, number]): number {
  const [lon1, lat1] = [(from[0] * Math.PI) / 180, (from[1] * Math.PI) / 180];
  const [lon2, lat2] = [(to[0] * Math.PI) / 180, (to[1] * Math.PI) / 180];
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Regions → Polygon FeatureCollection. */
export function regionsToFeatureCollection(
  regions: RawRegion[],
  fallbackColor: string,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: regions
      .filter((r) => r.coords?.length >= 3)
      .map((r, i) => ({
        type: 'Feature',
        id: i,
        geometry: {
          type: 'Polygon',
          coordinates: [closeRing(r.coords)],
        },
        properties: {
          color: r.color ?? fallbackColor,
          label: r.label ?? '',
        },
      })),
  };
}

/** Paths → LineString FeatureCollection with `dashed` + `label` props. */
export function pathsToFeatureCollection(
  paths: RawPath[],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: paths
      .filter((p) => p.coords?.length >= 2)
      .map((p, i) => ({
        type: 'Feature',
        id: i,
        geometry: {
          type: 'LineString',
          coordinates: p.coords,
        },
        properties: {
          dashed: !!p.dashed,
          label: p.label ?? '',
        },
      })),
  };
}

/**
 * Path endpoints → Point FeatureCollection with a `bearing` property so
 * a symbol Layer can render a direction arrow rotated along the final
 * segment of each journey.
 */
export function arrowsFromPaths(paths: RawPath[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (let i = 0; i < paths.length; i++) {
    const coords = paths[i].coords;
    if (!coords || coords.length < 2) continue;
    const a = coords[coords.length - 2] as [number, number];
    const b = coords[coords.length - 1] as [number, number];
    features.push({
      type: 'Feature',
      id: i,
      geometry: { type: 'Point', coordinates: b },
      properties: { bearing: bearingDeg(a, b) },
    });
  }
  return { type: 'FeatureCollection', features };
}

/** Make sure a polygon ring closes on itself. */
function closeRing(coords: number[][]): number[][] {
  if (coords.length < 2) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coords;
  return [...coords, first];
}

export const StoryOverlays = memo(function StoryOverlays({ story }: Props) {
  const eraColor = eras[story.era] ?? '#bfa050'; // data-color: intentional (gold fallback for unknown era — MapLibre GL)

  const regionsFC = useMemo(() => {
    const regions = safeParse<RawRegion[]>(story.regions_json, []);
    return regionsToFeatureCollection(regions, eraColor);
  }, [story.regions_json, eraColor]);

  const rawPaths = useMemo(
    () => safeParse<RawPath[]>(story.paths_json, []),
    [story.paths_json],
  );

  const pathsFC = useMemo(() => pathsToFeatureCollection(rawPaths), [rawPaths]);
  const arrowsFC = useMemo(() => arrowsFromPaths(rawPaths), [rawPaths]);

  return (
    <>
      {/* Region polygons — fill + outline */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GeoJSONSource id="story-regions" shape={regionsFC as any}>
        <Layer
          id="story-regions-fill"
          type="fill"
          style={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fillColor: ['get', 'color'] as any,
            fillOpacity: 0.15,
          }}
        />
        <Layer
          id="story-regions-stroke"
          type="line"
          style={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lineColor: ['get', 'color'] as any,
            lineOpacity: 0.7,
            lineWidth: 1.5,
          }}
        />
      </GeoJSONSource>

      {/* Journey paths — solid + dashed variants driven by a filter.
          MapLibre interpolates coordinates between source updates so
          swapping the active story animates the path draw rather than
          snapping. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GeoJSONSource id="story-paths" shape={pathsFC as any}>
        <Layer
          id="story-paths-solid"
          type="line"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter={['!', ['get', 'dashed']] as any}
          style={{
            lineColor: '#bfa050', // data-color: intentional (gold story path — MapLibre GL)
            lineWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <Layer
          id="story-paths-dashed"
          type="line"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter={['get', 'dashed'] as any}
          style={{
            lineColor: '#bfa050', // data-color: intentional (gold dashed path — MapLibre GL)
            lineWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            lineDasharray: [3, 2],
          }}
        />
      </GeoJSONSource>

      {/* Directional arrowheads at each path's endpoint, rotated along
          the final segment's bearing. Uses a unicode ► glyph — no image
          asset required — kept legible across zoom levels. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GeoJSONSource id="story-path-arrows" shape={arrowsFC as any}>
        <Layer
          id="story-path-arrows-layer"
          type="symbol"
          style={{
            textField: '\u25B6',
            textFont: ['Noto Sans Regular'],
            textSize: 14,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            textRotate: ['get', 'bearing'] as any,
            textRotationAlignment: 'map',
            textPitchAlignment: 'map',
            textColor: '#bfa050',   // data-color: intentional (gold arrowhead — MapLibre GL)
            textHaloColor: '#1a1610', // data-color: intentional (dark halo against map bg — MapLibre GL)
            textHaloWidth: 1.5,
            textAllowOverlap: true,
            textIgnorePlacement: true,
            textOffset: [0.4, 0],
          }}
        />
      </GeoJSONSource>
    </>
  );
});
