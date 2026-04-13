/**
 * StoryOverlays — Renders region polygons, journey polylines, and
 * directional arrows for the active map story.
 *
 * COORDINATE FLIP: Data stores [lon, lat]. react-native-maps uses {latitude, longitude}.
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polygon, Polyline, Marker } from 'react-native-maps';
import {
  toLatLng,
  computeBearing,
  midpoint,
  pathDistance,
} from '../../utils/geoMath';
import { useTheme, eras, fontFamily, radii } from '../../theme';
import type { MapStory } from '../../types';
import { safeParse } from '../../utils/logger';

/** Min zoom at which path-distance labels render to avoid clutter. */
export const DISTANCE_LABEL_MIN_ZOOM = 5;

interface Props {
  story: MapStory;
  zoomLevel: number;
}

export const StoryOverlays = memo(function StoryOverlays({ story, zoomLevel }: Props) {
  const { base } = useTheme();
  const eraColor = eras[story.era] ?? '#bfa050'; // data-color: intentional (fallback)

  // Parse regions
  const regions = useMemo(() => {
    if (!story.regions_json) return [];
    return safeParse<{ coords: number[][]; color: string; label: string }[]>(story.regions_json, []);
  }, [story.regions_json]);

  // Parse paths
  const paths = useMemo(() => {
    if (!story.paths_json) return [];
    return safeParse<{ coords: number[][]; dashed?: boolean; label?: string }[]>(story.paths_json, []);
  }, [story.paths_json]);

  const borderWidth = Math.max(1, Math.min(4, (zoomLevel - 3) * 0.4));
  const lineWidth = Math.max(1.5, Math.min(6, 1 + (zoomLevel - 3) * 0.55));

  return (
    <>
      {/* Region polygons */}
      {regions.map((region, i) => (
        <Polygon
          key={`r-${i}`}
          coordinates={region.coords.map(toLatLng)}
          strokeColor={region.color ?? eraColor}
          strokeWidth={borderWidth}
          fillColor={(region.color ?? eraColor) + '33'}
          lineDashPattern={[6, 4]}
        />
      ))}

      {/* Journey polylines */}
      {paths.map((path, i) => {
        const coords = path.coords.map(toLatLng);
        const dashLen = Math.max(3, Math.min(12, zoomLevel));
        const showDistance =
          coords.length >= 2 && zoomLevel >= DISTANCE_LABEL_MIN_ZOOM;
        const distanceMiles = showDistance ? Math.round(pathDistance(coords)) : 0;
        const labelCoord = showDistance
          ? midpoint(coords[0], coords[coords.length - 1])
          : null;

        return (
          <React.Fragment key={`p-${i}`}>
            <Polyline
              coordinates={coords}
              strokeColor={eraColor}
              strokeWidth={lineWidth}
              lineDashPattern={path.dashed ? [dashLen * 3, dashLen * 2] : undefined}
              lineCap="round"
              lineJoin="round"
            />
            {/* Directional arrow at endpoint */}
            {coords.length >= 2 && (
              <Marker
                coordinate={coords[coords.length - 1]}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <ArrowTriangle
                  color={eraColor}
                  angle={computeBearing(
                    coords[coords.length - 2],
                    coords[coords.length - 1]
                  )}
                />
              </Marker>
            )}
            {/* Distance label at the path midpoint — only shown above min zoom */}
            {labelCoord && distanceMiles > 0 && (
              <Marker
                coordinate={labelCoord}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <View
                  style={[
                    styles.distanceBadge,
                    { backgroundColor: base.bg + 'CC', borderColor: base.border },
                  ]}
                  accessibilityLabel={`Distance: about ${distanceMiles} miles`}
                >
                  <Text style={[styles.distanceLabel, { color: base.textDim }]}>
                    ~{distanceMiles} mi
                  </Text>
                </View>
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});

/** Small directional arrow triangle */
function ArrowTriangle({ color, angle }: { color: string; angle: number }) {
  return (
    <View style={[
      styles.arrowTriangle,
      {
        transform: [{ rotate: `${angle}deg` }],
        borderBottomColor: color,
      },
    ]} />
  );
}

const styles = StyleSheet.create({
  arrowTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  distanceBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanceLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
  },
});
