/**
 * PlaceLabel — Custom marker child with type-specific symbol and label.
 *
 * Zoom-responsive sizing. Priority-based visibility.
 * Label offset direction from place.label_dir.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { maxPriorityForZoom, labelScale, labelOffset } from '../../utils/geoMath';
import type { Place } from '../../types';

// Label colors by place type
const TYPE_COLORS: Record<string, string> = {
  city: '#d4b483',
  mountain: '#d4b483',
  site: '#d4b483',
  water: '#90c8d8',
  region: '#b8a070',
};

// Type symbols
const TYPE_SYMBOLS: Record<string, string> = {
  city: '●',
  mountain: '△',
  site: '◆',
};

interface Props {
  place: Place;
  showModern: boolean;
  zoomLevel: number;
}

export const PlaceLabel = memo(function PlaceLabel({ place, showModern, zoomLevel }: Props) {
  // Priority visibility check
  if (place.priority > maxPriorityForZoom(zoomLevel)) return null;

  const scale = labelScale(zoomLevel);
  const baseFontPx = place.type === 'water' || place.type === 'region' ? 10 : 8.5;
  const fontSize = Math.round(baseFontPx * scale);
  const color = TYPE_COLORS[place.type] ?? '#d4b483';
  const symbol = TYPE_SYMBOLS[place.type];
  const isItalic = place.type === 'water' || place.type === 'region';
  const name = showModern && place.modern_name ? place.modern_name : place.ancient_name;
  const offset = labelOffset(place.label_dir, fontSize);

  return (
    <View style={{
      alignItems: 'center',
      transform: [{ translateX: offset.x }, { translateY: offset.y }],
    }}>
      {symbol && (
        <Text style={{
          color,
          fontSize: Math.max(4, fontSize * 0.6),
          opacity: 0.8,
        }}>
          {symbol}
        </Text>
      )}
      <Text style={{
        color,
        fontFamily: 'Cinzel_400Regular',
        fontSize,
        fontStyle: isItalic ? 'italic' : 'normal',
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}>
        {name}
      </Text>
    </View>
  );
});
