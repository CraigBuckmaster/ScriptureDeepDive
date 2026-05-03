/**
 * TimelineSpine — Vertical spine + dots + connecting line for one event row.
 *
 * Renders a 32px-wide left gutter with a 2px vertical line and an era-coloured
 * dot centred on the event row. Events with images get a larger, glowing dot;
 * events without get a smaller, semi-transparent dot.
 *
 * World variant (#1809): outline-ring dot + recessive line — world history is
 * context, not narrative.
 *
 * Part of Card #1264 (Timeline Phase 1).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export const SPINE_GUTTER_WIDTH = 32;

export type TimelineSpineVariant = 'default' | 'world';

export interface TimelineSpineProps {
  /** Era hex — spine and dot inherit this colour. */
  eraColor: string;
  /** Whether the event has an attached image (affects dot size/glow). */
  hasImage: boolean;
  /** When true, the event is focused — dot gets extra emphasis. */
  isActive?: boolean;
  /** When true, this is the first row in the list — top half of the line is suppressed. */
  isFirst?: boolean;
  /** When true, this is the last row — bottom half of the line is suppressed. */
  isLast?: boolean;
  /** Row height, so the spine takes up exactly the same vertical space as the card. */
  rowHeight?: number;
  /** Visual variant. `'world'` = outline-ring dot + faint line for world history events. */
  variant?: TimelineSpineVariant;
}

export function TimelineSpine({
  eraColor,
  hasImage,
  isActive = false,
  isFirst = false,
  isLast = false,
  rowHeight,
  variant = 'default',
}: TimelineSpineProps) {
  const isWorld = variant === 'world';

  const dotSize = isWorld ? 6 : hasImage ? 10 : 7;
  const dotOpacity = isWorld || hasImage ? 1 : 0.5;
  const lineColor = eraColor + '30';
  const lineOpacity = isWorld ? 0.3 : 1;

  return (
    <View
      style={[styles.gutter, rowHeight != null ? { minHeight: rowHeight } : null]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Top half of the spine line */}
      <View
        style={[
          styles.lineHalf,
          {
            backgroundColor: isFirst ? 'transparent' : lineColor,
            opacity: lineOpacity,
          },
        ]}
      />
      {/* Dot */}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: isWorld ? 'transparent' : eraColor,
            opacity: dotOpacity,
            borderWidth: isWorld ? 1.5 : hasImage ? 2 : 0,
            borderColor: eraColor,
            // Soft halo for image-bearing (or active) events via shadow.
            shadowColor: eraColor, // intentional override-color
            shadowOpacity: !isWorld && (hasImage || isActive) ? 0.6 : 0,
            shadowRadius: !isWorld && (hasImage || isActive) ? 4 : 0,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />
      {/* Bottom half of the spine line */}
      <View
        style={[
          styles.lineHalf,
          {
            backgroundColor: isLast ? 'transparent' : lineColor,
            opacity: lineOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gutter: {
    width: SPINE_GUTTER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineHalf: {
    flex: 1,
    width: 2,
  },
  dot: {
    marginVertical: 2,
  },
});
