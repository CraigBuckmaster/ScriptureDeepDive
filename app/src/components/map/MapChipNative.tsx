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
import { Map, Camera, type InitialViewState } from '@maplibre/maplibre-react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { STYLE_ANCIENT } from '../../constants/mapStyles';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { MapStory, Place } from '../../types';
import { safeParse } from '../../utils/logger';
import { ensureMapLibreInit } from '../../utils/isMapNativeAvailable';
import { StoryOverlays } from './StoryOverlays';

// The MapChip dispatcher gates on isMapNativeAvailable() before loading
// this module. Ensure the SDK is initialized before rendering.
ensureMapLibreInit();

/**
 * v11 `InitialViewState` is a discriminated union: either a `center`
 * variant or a `bounds` variant, never both. We alias the library type
 * here and build each variant explicitly in `defaultCameraForStory`.
 */
type ChipInitialViewState = InitialViewState;

interface Props {
  story: MapStory;
  places: Place[];
  /** Fires when the reader taps "Expand ↗"; pass navigation in the parent. */
  onExpand: () => void;
}

const CHIP_HEIGHT = 88;

/**
 * Compute an `initialViewState` block that frames all of the story's
 * places inside the 88px chip with a little breathing room.
 *
 * v11 accepts bounds as `[west, south, east, north]` (LngLatBounds) and
 * padding as `{top, right, bottom, left}`.
 */
function defaultCameraForStory(
  story: MapStory,
  places: Place[],
): ChipInitialViewState {
  const placeIds = safeParse<string[]>(story.places_json, []);
  const storyPlaces = placeIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean) as Place[];

  if (storyPlaces.length === 0) {
    // Fall back to a wide biblical-region view.
    return { center: [38, 30], zoom: 3 };
  }

  if (storyPlaces.length === 1) {
    const p = storyPlaces[0];
    return { center: [p.longitude, p.latitude], zoom: 6 };
  }

  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const p of storyPlaces) {
    if (p.longitude < minLon) minLon = p.longitude;
    if (p.longitude > maxLon) maxLon = p.longitude;
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
  }
  return {
    bounds: [minLon, minLat, maxLon, maxLat] as [number, number, number, number],
    padding: { top: 14, right: 18, bottom: 14, left: 18 },
  };
}

// The dispatcher in `./MapChip` already gates on isMapNativeAvailable()
// and short-circuits to null — so at this point MapLibre is guaranteed
// to be linked.
function MapChipNative({ story, places, onExpand }: Props) {
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
        <Map
          testID="map-chip-view"
          style={StyleSheet.absoluteFill}
          mapStyle={STYLE_ANCIENT}
          dragPan={false}
          touchZoom={false}
          doubleTapZoom={false}
          doubleTapHoldZoom={false}
          touchRotate={false}
          touchPitch={false}
          attribution={false}
          logo={false}
        >
          <Camera initialViewState={cameraSettings} />
          <StoryOverlays story={story} />
        </Map>
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

export default MapChipNative;
