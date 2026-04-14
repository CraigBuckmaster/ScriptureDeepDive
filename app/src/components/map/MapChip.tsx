/**
 * MapChip — Inline non-interactive MapLibre view for the chapter reader.
 *
 * Renders the parchment ancient style at 88px height, pre-fit to the
 * story's place bounds, with that story's region + path overlays drawn
 * on top. Tapping the expand button navigates to the full map at the
 * same story.
 *
 * Scroll / zoom / pitch / rotate are all disabled — the chip is purely
 * visual, a spatial anchor for the passage the reader is on.
 *
 * Feature for epic #1314 / issue #1322.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import {
  MapView,
  Camera,
  type CameraStop,
} from '@maplibre/maplibre-react-native';
import { StoryOverlays } from './StoryOverlays';
import { STYLE_ANCIENT } from '../../screens/MapScreen';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { MapStory, Place } from '../../types';
import { safeParse } from '../../utils/logger';

interface Props {
  story: MapStory;
  places: Place[];
  /** Fires when the reader taps "Expand ↗"; pass navigation in the parent. */
  onExpand: () => void;
}

const CHIP_HEIGHT = 88;

/**
 * Compute a Camera default settings block that frames all of the story's
 * places inside the 88px chip with a little breathing room.
 */
function defaultCameraForStory(
  story: MapStory,
  places: Place[],
): CameraStop {
  const placeIds = safeParse<string[]>(story.places_json, []);
  const storyPlaces = placeIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean) as Place[];

  if (storyPlaces.length === 0) {
    // Fall back to a wide biblical-region view.
    return { centerCoordinate: [38, 30], zoomLevel: 3 };
  }

  if (storyPlaces.length === 1) {
    const p = storyPlaces[0];
    return { centerCoordinate: [p.longitude, p.latitude], zoomLevel: 6 };
  }

  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const p of storyPlaces) {
    if (p.longitude < minLon) minLon = p.longitude;
    if (p.longitude > maxLon) maxLon = p.longitude;
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
  }
  return {
    bounds: {
      ne: [maxLon, maxLat],
      sw: [minLon, minLat],
      paddingLeft: 18,
      paddingRight: 18,
      paddingTop: 14,
      paddingBottom: 14,
    },
  };
}

export function MapChip({ story, places, onExpand }: Props) {
  const { base } = useTheme();
  const cameraSettings = useMemo(
    () => defaultCameraForStory(story, places),
    [story, places],
  );

  return (
    <Pressable
      onPress={onExpand}
      accessibilityRole="button"
      accessibilityLabel={`Open full map for ${story.name}`}
      style={[
        styles.card,
        { backgroundColor: base.bgElevated, borderColor: base.gold + '55' },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[styles.eyebrow, { color: base.textMuted }]}
          numberOfLines={1}
        >
          MAP · {story.name}
        </Text>
        <TouchableOpacity
          onPress={onExpand}
          accessibilityLabel="Expand to full map"
          accessibilityRole="button"
          style={styles.expandBtn}
          hitSlop={8}
        >
          <Text style={[styles.expandText, { color: base.gold }]}>Expand</Text>
          <ArrowUpRight size={12} color={base.gold} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapFrame} pointerEvents="none">
        <MapView
          testID="map-chip-view"
          style={StyleSheet.absoluteFill}
          mapStyle={STYLE_ANCIENT}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          attributionEnabled={false}
          logoEnabled={false}
        >
          <Camera defaultSettings={cameraSettings} />
          <StoryOverlays story={story} />
        </MapView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  eyebrow: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
    flex: 1,
    marginRight: spacing.sm,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mapFrame: {
    height: CHIP_HEIGHT,
    width: '100%',
  },
});
