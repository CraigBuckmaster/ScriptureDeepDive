/**
 * PlaceMarkerList — Renders all place markers on the map as a single
 * MapLibre GeoJSONSource + circle Layer + symbol Layer.
 *
 * One GeoJSON FeatureCollection per full `places` list (memoised). Layer
 * expressions drive priority-based visibility, active-place highlighting,
 * and ancient/modern name toggling — no React re-renders on map motion.
 *
 * Issues: #1315 (MapLibre dep swap), #1318 (priority visibility +
 * feature-state selection + click forwarding).
 */

import React, { memo, useMemo, useCallback } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
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
 * Build the per-feature, zoom-gated opacity expression for the places layer.
 *
 * ⚠️ DO NOT REFACTOR INTO THE OBVIOUS-LOOKING SHAPE.
 *
 * The natural-feeling form crashes the iOS MapLibre SDK at runtime:
 *
 *     ['step', ['zoom'], 0, perFeatureMinZoomExpr, 1]
 *
 * MapLibre's style spec requires the stop INPUTS of a `step` expression to
 * be literal numeric constants. A `case`/`match` sub-expression as a stop
 * input is a spec violation; the iOS SDK throws an uncaught NSException
 * from -[MLRNStyle setCircleOpacity:withReactStyleValue:]
 * (MLRNStyle.m:1216), Sentry's CPP terminate handler converts it to
 * SIGABRT, and the app hard-crashes the moment a place layer is added to
 * the map. There is no JS error boundary that catches this. See PR #1567
 * / the crash report at commit 1b9183bb for the full stack.
 *
 * The valid structure is the inverse: `step` on `["zoom"]` with literal
 * breakpoints, and `case` expressions as the OUTPUTS at each zoom band.
 * Yes it's verbose. Leave it that way.
 *
 * Visibility ladder (matches the old PRIORITY_MIN_ZOOM table):
 *   zoom < 3  — story places only
 *   zoom 3+   — story + priority 1
 *   zoom 5+   — story + priority 1-2
 *   zoom 7+   — story + priority 1-3
 *   zoom 8+   — everything (also handles unknown priority values,
 *               which previously got the fallback min-zoom 8)
 *
 * Exported for unit testing — the regression test in
 * `__tests__/components/PlaceMarkerList.test.tsx` asserts that all stop-
 * input positions in the returned `step` expression are numeric literals,
 * which is the spec invariant whose violation caused the crash.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildPlaceVisibilityExpr(storyPlaceIds: string[]): any[] {
  const isStoryPlace = ['in', ['get', 'id'], ['literal', storyPlaceIds]];
  const visibleThroughPriority = (maxPriority: number) => [
    'case',
    ['any', isStoryPlace, ['<=', ['get', 'priority'], maxPriority]],
    1,
    0,
  ];

  return [
    'step',
    ['zoom'],
    ['case', isStoryPlace, 1, 0],
    3, visibleThroughPriority(1),
    5, visibleThroughPriority(2),
    7, visibleThroughPriority(3),
    8, 1,
  ];
}

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

  // Per-feature, zoom-gated visibility expression. The expression is built
  // by `buildPlaceVisibilityExpr` above — see its doc comment for the
  // (substantial) constraints. Memoised so identity is stable when
  // `storyPlaceIds` doesn't change, avoiding native style re-applies.
  const visibilityOpacityExpr = useMemo(
    () => buildPlaceVisibilityExpr(storyPlaceIds),
    [storyPlaceIds],
  );

  // Radius / color / stroke for the active-place spotlight.
  // Uses a direct id comparison (effectively a poor-man's feature-state —
  // MapLibre RN v11 still doesn't expose setFeatureState imperatively, so
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
    <GeoJSONSource
      id="places-source"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data={fc as any}
      onPress={onPress}
      // v11: hitbox is a ViewPadding (top/right/bottom/left), not width/height.
      // 22px in each direction matches the v10 22x22 box.
      hitbox={{ top: 11, right: 11, bottom: 11, left: 11 }}
    >
      <Layer
        id="places-dot"
        type="circle"
        style={{
          circleRadius: circleRadiusExpr,
          circleColor: circleColorExpr,
          circleStrokeColor: circleStrokeColorExpr,
          circleStrokeWidth: circleStrokeWidthExpr,
          circleOpacity: visibilityOpacityExpr,
        }}
      />
      <Layer
        id="places-label"
        type="symbol"
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
          textOpacity: visibilityOpacityExpr,
          textAllowOverlap: false,
          textIgnorePlacement: false,
        }}
      />
    </GeoJSONSource>
  );
});
