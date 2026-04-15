/**
 * AncientBorderLayer — Renders ancient political borders for the active
 * era (tribal allotments, Roman provinces, Divided Kingdom, etc.) as a
 * single MapLibre ShapeSource with Fill + Line layers.
 *
 * Hidden in Modern mode — the modern.json style already layers OSM
 * country borders for that variant. Suppressed at the ancient era's
 * default (era === 'all') since no single era's borders apply.
 *
 * Scaffold for epic #1314 / issue #1317. Renders an empty ShapeSource
 * gracefully until the AWMC/hand-authored polygons land in a follow-up
 * Chat session.
 */

import React, { memo } from 'react';
import { ShapeSource, FillLayer, LineLayer } from '@maplibre/maplibre-react-native';
import { useAncientBorders } from '../../hooks/useAncientBorders';
import { eras } from '../../theme';

interface Props {
  /** Currently-selected era id — 'all' or null disables the layer. */
  era: string | null | undefined;
  /** True when the user has flipped the map to Modern mode. */
  showModern: boolean;
}

export const AncientBorderLayer = memo(function AncientBorderLayer({
  era,
  showModern,
}: Props) {
  const { borders } = useAncientBorders(era);
  if (showModern) return null;
  if (!era || era === 'all') return null;

  const eraColor = (era && eras[era]) || '#bfa050'; // data-color: intentional (gold fallback for unknown era — MapLibre GL)

  return (
    <ShapeSource id="ancient-borders" shape={borders as any}>
      <FillLayer
        id="ancient-borders-fill"
        style={{
          fillColor: eraColor,
          fillOpacity: 0.08,
        }}
      />
      <LineLayer
        id="ancient-borders-stroke"
        style={{
          lineColor: eraColor,
          lineOpacity: 0.55,
          lineWidth: 1.2,
          lineDasharray: [2, 2],
        }}
      />
    </ShapeSource>
  );
});
