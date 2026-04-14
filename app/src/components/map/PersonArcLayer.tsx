/**
 * PersonArcLayer — Renders a person's geographic life arc as a single
 * GeoJSON LineString + numbered stop markers + event labels.
 *
 * Visually distinct from story paths: amber `#e09050` line vs. the
 * gold `#bfa050` used for story journeys, so both can coexist on the
 * map without blending (up to 3 people supported per #1324 spec).
 *
 * Feature for epic #1314 / issue #1324. `stops` must already be sorted
 * by `order` — usePersonArc does that.
 */

import React, { memo, useMemo } from 'react';
import { ShapeSource, LineLayer, SymbolLayer, CircleLayer } from '@maplibre/maplibre-react-native';
import type { PersonArcStop } from '../../hooks/usePersonArc';

interface Props {
  stops: PersonArcStop[];
  /** Override color for rendering multiple simultaneous people. */
  color?: string;
}

/** Amber, distinct from story-path gold (#bfa050). */
const ARC_COLOR = '#e09050';

function arcLineFeatureCollection(stops: PersonArcStop[]): GeoJSON.FeatureCollection {
  if (stops.length < 2) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: stops.map((s) => [s.place.longitude, s.place.latitude]),
        },
        properties: {},
      },
    ],
  };
}

function arcStopsFeatureCollection(stops: PersonArcStop[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stops.map((s) => ({
      type: 'Feature',
      id: s.place_id,
      geometry: {
        type: 'Point',
        coordinates: [s.place.longitude, s.place.latitude],
      },
      properties: {
        order: s.order,
        label: String(s.order),
        event: s.event,
      },
    })),
  };
}

export const PersonArcLayer = memo(function PersonArcLayer({
  stops,
  color = ARC_COLOR,
}: Props) {
  const lineFC = useMemo(() => arcLineFeatureCollection(stops), [stops]);
  const stopsFC = useMemo(() => arcStopsFeatureCollection(stops), [stops]);

  if (stops.length === 0) return null;

  return (
    <>
      <ShapeSource id="person-arc-line" shape={lineFC as any}>
        <LineLayer
          id="person-arc-line-layer"
          style={{
            lineColor: color,
            lineWidth: 2.5,
            lineCap: 'round',
            lineJoin: 'round',
            lineDasharray: [1, 1.5],
            lineOpacity: 0.85,
          }}
        />
      </ShapeSource>

      <ShapeSource id="person-arc-stops" shape={stopsFC as any}>
        <CircleLayer
          id="person-arc-stops-circle"
          style={{
            circleRadius: 10,
            circleColor: color,
            circleStrokeColor: '#1a1610',
            circleStrokeWidth: 1.5,
          }}
        />
        <SymbolLayer
          id="person-arc-stops-number"
          style={{
            textField: ['get', 'label'] as any,
            textFont: ['Noto Sans Regular'],
            textSize: 11,
            textColor: '#1a1610',
            textAllowOverlap: true,
            textIgnorePlacement: true,
          }}
        />
        {/* Event label — visible only at closer zooms to avoid clutter */}
        <SymbolLayer
          id="person-arc-stops-event"
          minZoomLevel={8}
          style={{
            textField: ['get', 'event'] as any,
            textFont: ['Noto Sans Italic'],
            textSize: 11,
            textColor: color,
            textHaloColor: '#1a1610',
            textHaloWidth: 1.3,
            textOffset: [0, 1.4],
            textAnchor: 'top',
            textOptional: true,
            textMaxWidth: 10,
          }}
        />
      </ShapeSource>
    </>
  );
});
