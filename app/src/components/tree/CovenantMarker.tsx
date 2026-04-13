/**
 * CovenantMarker — Diamond marker + theological annotation card.
 *
 * Renders as a React Native component (not SVG) so it can be overlaid
 * on top of the tree canvas at an absolute position. Caller supplies
 * the (x, y) position to stamp and the waypoint data.
 *
 * Part of Card #1267 (Genealogy Phase 2).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily, radii, spacing } from '../../theme';
import type { CovenantWaypoint } from '../../utils/covenantWaypoints';

export interface CovenantMarkerProps {
  waypoint: CovenantWaypoint;
  /** Pixel x position along the spine (left edge of the diamond). */
  x: number;
  /** Pixel y position along the spine. */
  y: number;
  /** Only render when zoomLevel exceeds this threshold. Defaults to 0.4. */
  zoomLevel?: number;
  minZoom?: number;
  onPress?: (ref: string) => void;
}

const DIAMOND_SIZE = 10;
const CARD_WIDTH = 140;

export function CovenantMarker({
  waypoint,
  x,
  y,
  zoomLevel,
  minZoom = 0.4,
  onPress,
}: CovenantMarkerProps) {
  const { base } = useTheme();

  if (zoomLevel != null && zoomLevel < minZoom) return null;

  return (
    <View
      accessibilityLabel={`Covenant waypoint: ${waypoint.text}`}
      style={[styles.wrapper, { left: x, top: y }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.diamond,
          { backgroundColor: base.gold + '80', borderColor: base.gold },
        ]}
      />
      <TouchableOpacity
        onPress={() => onPress?.(waypoint.ref)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${waypoint.ref}`}
        style={[
          styles.card,
          { backgroundColor: base.gold + '0D', borderColor: base.gold + '1A' },
        ]}
      >
        <Text style={[styles.text, { color: base.textDim }]} numberOfLines={2}>
          {waypoint.text}
        </Text>
        <Text style={[styles.ref, { color: base.gold }]}>{waypoint.ref}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  diamond: {
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    borderWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
  card: {
    maxWidth: CARD_WIDTH,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 9,
    lineHeight: 13,
  },
  ref: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 8,
    marginTop: 1,
  },
});
