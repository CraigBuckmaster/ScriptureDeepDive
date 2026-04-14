/**
 * StoryOverlays — Renders a story's region polygons and journey paths
 * as MapLibre GeoJSON layers.
 *
 * Uses a single `ShapeSource` per channel (regions / paths) so the map
 * interpolates smoothly between stories when `story` changes, rather
 * than flickering as React-rendered primitives unmount and remount.
 *
 * Coordinate convention: JSON stores `[lon, lat]` (GeoJSON order); no
 * flip is needed here — MapLibre is natively GeoJSON-based.
 *
 * Migrated from react-native-maps primitives in #1315/#1319.
 */

import React, { memo, useMemo } from 'react';
import { ShapeSource, FillLayer, LineLayer } from '@maplibre/maplibre-react-native';
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

/** Make sure a polygon ring closes on itself. */
function closeRing(coords: number[][]): number[][] {
  if (coords.length < 2) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coords;
  return [...coords, first];
}

export const StoryOverlays = memo(function StoryOverlays({ story }: Props) {
  const eraColor = eras[story.era] ?? '#bfa050';

  const regionsFC = useMemo(() => {
    const regions = safeParse<RawRegion[]>(story.regions_json, []);
    return regionsToFeatureCollection(regions, eraColor);
  }, [story.regions_json, eraColor]);

  const pathsFC = useMemo(() => {
    const paths = safeParse<RawPath[]>(story.paths_json, []);
    return pathsToFeatureCollection(paths);
  }, [story.paths_json]);

  return (
    <>
      {/* Region polygons — fill + outline */}
      <ShapeSource id="story-regions" shape={regionsFC as any}>
        <FillLayer
          id="story-regions-fill"
          style={{
            fillColor: ['get', 'color'] as any,
            fillOpacity: 0.15,
          }}
        />
        <LineLayer
          id="story-regions-stroke"
          style={{
            lineColor: ['get', 'color'] as any,
            lineOpacity: 0.7,
            lineWidth: 1.5,
          }}
        />
      </ShapeSource>

      {/* Journey paths — solid + dashed variants driven by a filter */}
      <ShapeSource id="story-paths" shape={pathsFC as any}>
        <LineLayer
          id="story-paths-solid"
          filter={['!', ['get', 'dashed']] as any}
          style={{
            lineColor: '#bfa050',
            lineWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <LineLayer
          id="story-paths-dashed"
          filter={['get', 'dashed'] as any}
          style={{
            lineColor: '#bfa050',
            lineWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            lineDasharray: [3, 2],
          }}
        />
      </ShapeSource>
    </>
  );
});
