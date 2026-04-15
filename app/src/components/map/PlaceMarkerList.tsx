/**
 * PlaceMarkerList — Renders all place markers on the map as a single
 * MapLibre ShapeSource + CircleLayer + SymbolLayer.
 *
 * One GeoJSON FeatureCollection per full `places` list (memoised). Layer
 * expressions drive priority-based visibility, active-place highlighting,
 * and ancient/modern name toggling — no React re-renders on map motion.
 *
 * Issues: #1315 (MapLibre dep swap), #1318 (priority visibility +
 * feature-state selection + click forwarding).
 */

import React, { memo, useMemo, useCallback } from 'react';
import { ShapeSource, CircleLayer, SymbolLayer } from '@maplibre/maplibre-react-native';
import type { Place, MapStory } from '../../types';
import { safeParse } from '../../utils/logger';

interface Props {
  places: Place[];
  showModern: boolean;
  zoomLevel?: number;
  activeStory?: MapStory | null;
  /** ID of the currently-selected place, if any. Highlighted via expressions. */
  activePlaceId?: string | null;
  onPlacePress?: (place: Place) => void;
}

/** Convert the app's `Place[]` into a GeoJSON FeatureCollection. */
export function placesToFeatureCollection(places: Place[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        ancient: p.ancient_name,
        modern: p.modern_name ?? p.ancient_name,
        type: p.type,
        priority: p.priority,
      },
    })),
  };
}

/**
 * Min-zoom per priority — mirrors the old `maxPriorityForZoom` thresholds
 * from geoMath.ts but expressed as a MapLibre `match` expression so the
 * GPU renders/hides per-feature without JS involvement.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRIORITY_MIN_ZOOM: any = ['match',
  ['get', 'priority'],
  1, 3,
  2, 5,
  3, 7,
  4, 8,
  8, // fallback
];

export const PlaceMarkerList = memo(function PlaceMarkerList({
  places,
  showModern,
  activeStory,
  activePlaceId,
  onPlacePress,
}: Props) {
  const fc = useMemo(() => placesToFeatureCollection(places), [places]);

  // IDs belonging to the active story — pinned visible regardless of priority.
  const storyPlaceIds = useMemo<string[]>(() => {
    if (!activeStory?.places_json) return [];
    return safeParse<string[]>(activeStory.places_json, []);
  }, [activeStory]);

  // Full visibility expression: story places are always visible (min-zoom 0),
  // other places hidden below their priority's min-zoom threshold.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const minZoomExpr: any = useMemo(
    () => [
      'case',
      ['in', ['get', 'id'], ['literal', storyPlaceIds]],
      0,
      PRIORITY_MIN_ZOOM,
    ],
    [storyPlaceIds],
  );

  // Radius / color / stroke for the active-place spotlight.
  // Uses a direct id comparison (effectively a poor-man's feature-state —
  // MapLibre RN v10 doesn't yet expose setFeatureState imperatively, so
  // we drive highlight state through the expression instead).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive: any = activePlaceId
    ? ['==', ['get', 'id'], activePlaceId]
    : false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRadiusExpr: any = [
    'case',
    isActive,
    ['match', ['get', 'priority'], 1, 7, 2, 6, 3, 5, 4, 4.5, 5],
    ['match', ['get', 'priority'], 1, 5, 2, 4, 3, 3, 4, 2.5, 3],
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleColorExpr: any = [
    'case',
    isActive, '#f5e6b8', // data-color: intentional (warm highlight — active place marker, MapLibre GL)
    '#bfa050',           // data-color: intentional (gold — default place marker, MapLibre GL)
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleStrokeColorExpr: any = [
    'case',
    isActive, '#bfa050', // data-color: intentional (gold stroke on active — MapLibre GL)
    '#1a1610',           // data-color: intentional (dark stroke on inactive — MapLibre GL)
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleStrokeWidthExpr: any = [
    'case',
    isActive, 2,
    1,
  ];

  const onPress = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      const feature = e?.features?.[0];
      const id = feature?.properties?.id as string | undefined;
      if (!id || !onPlacePress) return;
      const place = places.find((p) => p.id === id);
      if (place) onPlacePress(place);
    },
    [places, onPlacePress],
  );

  return (
    <ShapeSource
      id="places-source"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shape={fc as any}
      onPress={onPress}
      hitbox={{ width: 22, height: 22 }}
    >
      <CircleLayer
        id="places-dot"
        style={{
          circleRadius: circleRadiusExpr,
          circleColor: circleColorExpr,
          circleStrokeColor: circleStrokeColorExpr,
          circleStrokeWidth: circleStrokeWidthExpr,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          circleOpacity: ['step', ['zoom'], 0, minZoomExpr, 1] as any,
        }}
      />
      <SymbolLayer
        id="places-label"
        style={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          textField: ['get', showModern ? 'modern' : 'ancient'] as any,
          // OpenFreeMap's glyph server ships the Noto family. Italic reads
          // as the parchment aesthetic even though the glyph itself is Noto.
          textFont: ['Noto Sans Italic'],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          textSize: ['match', ['get', 'priority'], 1, 13, 2, 12, 3, 11, 4, 10, 11] as any,
          textColor: [
            'case',
            isActive, '#f5e6b8', // data-color: intentional (warm highlight label — active, MapLibre GL)
            '#bfa050',           // data-color: intentional (gold label — default, MapLibre GL)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any,
          textHaloColor: '#1a1610', // data-color: intentional (dark halo against map bg — MapLibre GL)
          textHaloWidth: 1.5,
          textOffset: [0, 1.1],
          textAnchor: 'top',
          textOptional: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          textOpacity: ['step', ['zoom'], 0, minZoomExpr, 1] as any,
          textAllowOverlap: false,
          textIgnorePlacement: false,
        }}
      />
    </ShapeSource>
  );
});
