/**
 * StoryOverlays — Renders region polygons, journey polylines, and
 * directional arrows for the active map story.
 *
 * COORDINATE FLIP: Data stores [lon, lat]. react-native-maps uses {latitude, longitude}.
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Polygon, Polyline, Marker } from 'react-native-maps';
import { toLatLng, computeBearing } from '../../utils/geoMath';
import { eras } from '../../theme';
import type { MapStory } from '../../types';
import { logger } from '../../utils/logger';

interface Props {
  story: MapStory;
  zoomLevel: number;
}

export const StoryOverlays = memo(function StoryOverlays({ story, zoomLevel }: Props) {
  const eraColor = eras[story.era] ?? '#bfa050';

  // Parse regions
  const regions = useMemo(() => {
    if (!story.regions_json) return [];
    try {
      return JSON.parse(story.regions_json) as {
        coords: number[][]; color: string; label: string;
      }[];
    } catch (err) { return []; }
  }, [story.regions_json]);

  // Parse paths
  const paths = useMemo(() => {
    if (!story.paths_json) return [];
    try {
      return JSON.parse(story.paths_json) as {
        coords: number[][]; dashed?: boolean; label?: string;
      }[];
    } catch (err) { return []; }
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
});
