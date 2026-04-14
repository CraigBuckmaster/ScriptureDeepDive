/**
 * PlaceMarkerList — Renders all place markers on the map as a single
 * MapLibre ShapeSource + CircleLayer + SymbolLayer.
 *
 * One GeoJSON FeatureCollection per full `places` list (memoised). Layer
 * expressions drive priority-based visibility, active-place highlighting,
 * and ancient/modern name toggling — no React re-renders on map motion.
 *
 * Migrated from a per-marker React component tree in #1315/#1318.
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

export const PlaceMarkerList = memo(function PlaceMarkerList({
  places,
  showModern,
  activeStory,
  activePlaceId,
  onPlacePress,
}: Props) {
  const fc = useMemo(() => placesToFeatureCollection(places), [places]);

  // Set of ids belonging to the active story — used to pin them visible
  // regardless of zoom-priority gating.
  const storyPlaceIds = useMemo<string[]>(() => {
    if (!activeStory?.places_json) return [];
    return safeParse<string[]>(activeStory.places_json, []);
  }, [activeStory?.places_json]);

  // Priority-gated min-zoom per feature.
  //  Priority 1 → zoom ≥ 3
  //  Priority 2 → zoom ≥ 5
  //  Priority 3 → zoom ≥ 7
  //  Priority 4 → zoom ≥ 8
  // Story places always visible (min-zoom 0) regardless of priority.
  const minZoomExpr: any = [
    'case',
    ['in', ['get', 'id'], ['literal', storyPlaceIds]],
    0,
    ['match',
      ['get', 'priority'],
      1, 3,
      2, 5,
      3, 7,
      4, 8,
      8, // default fallback
    ],
  ];

  // Circle radius — priority gives base size; active place gets a bump.
  const circleRadiusExpr: any = [
    'case',
    ['==', ['get', 'id'], activePlaceId ?? ''], 6,
    ['match', ['get', 'priority'], 1, 5, 2, 4, 3, 3, 4, 2.5, 3],
  ];

  const onPress = useCallback(
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
      shape={fc as any}
      onPress={onPress}
      hitbox={{ width: 20, height: 20 }}
    >
      {/* Dot marker */}
      <CircleLayer
        id="places-dot"
        style={{
          circleRadius: circleRadiusExpr,
          circleColor: '#bfa050',
          circleStrokeColor: '#1a1610',
          circleStrokeWidth: 1,
          circleOpacity: ['step', ['zoom'], 0, minZoomExpr, 1] as any,
        }}
      />
      {/* Gold italic Garamond label */}
      <SymbolLayer
        id="places-label"
        style={{
          textField: ['get', showModern ? 'modern' : 'ancient'] as any,
          // OpenFreeMap's glyph server ships the Noto family. Italic reads
          // as the parchment aesthetic even though the glyph itself is Noto.
          textFont: ['Noto Sans Italic'],
          textSize: ['match', ['get', 'priority'], 1, 13, 2, 12, 3, 11, 4, 10, 11] as any,
          textColor: '#bfa050',
          textHaloColor: '#1a1610',
          textHaloWidth: 1.5,
          textOffset: [0, 1.1],
          textAnchor: 'top',
          textOptional: true,
          textOpacity: ['step', ['zoom'], 0, minZoomExpr, 1] as any,
          textAllowOverlap: false,
          textIgnorePlacement: false,
        }}
      />
    </ShapeSource>
  );
});
