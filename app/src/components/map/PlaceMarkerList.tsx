/**
 * PlaceMarkerList — Renders all place markers on the map.
 *
 * Filters by zoom priority and optionally by active story's places.
 */

import React, { memo, useMemo } from 'react';
import { Marker } from 'react-native-maps';
import { PlaceLabel } from './PlaceLabel';
import { maxPriorityForZoom } from '../../utils/geoMath';
import type { Place, MapStory } from '../../types';
import { logger } from '../../utils/logger';

interface Props {
  places: Place[];
  showModern: boolean;
  zoomLevel: number;
  activeStory?: MapStory | null;
}

export const PlaceMarkerList = memo(function PlaceMarkerList({
  places, showModern, zoomLevel, activeStory,
}: Props) {
  const visiblePlaces = useMemo(() => {
    const maxPriority = maxPriorityForZoom(zoomLevel);

    if (activeStory?.places_json) {
      try {
        const storyPlaceIds = new Set<string>(JSON.parse(activeStory.places_json));
        // Show story places regardless of priority + other places by priority
        return places.filter((p) =>
          storyPlaceIds.has(p.id) || p.priority <= maxPriority
        );
      } catch (err) { logger.warn('PlaceMarkerList', 'Operation failed', err); }
    }

    return places.filter((p) => p.priority <= maxPriority);
  }, [places, zoomLevel, activeStory]);

  return (
    <>
      {visiblePlaces.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.latitude, longitude: place.longitude }}
          tracksViewChanges={false}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <PlaceLabel place={place} showModern={showModern} zoomLevel={zoomLevel} />
        </Marker>
      ))}
    </>
  );
});
