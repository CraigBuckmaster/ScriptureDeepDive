/**
 * MapScreen — Biblical world map with 71 places, 28 stories.
 *
 * react-native-maps terrain tiles + custom place labels + story overlays
 * (region polygons, journey polylines, directional arrows).
 * Era filtering, ancient/modern toggle, story panel bottom sheet.
 * Deep-link: storyId or placeId route params.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

import { usePlaces } from '../hooks/usePlaces';
import { useMapStories } from '../hooks/useMapStories';
import { useMapZoom } from '../hooks/useMapZoom';

import { EraFilterBar } from '../components/tree/EraFilterBar';
import { PlaceMarkerList } from '../components/map/PlaceMarkerList';
import { StoryOverlays } from '../components/map/StoryOverlays';
import { StoryPicker } from '../components/map/StoryPicker';
import { StoryPanel } from '../components/map/StoryPanel';
import { FloatingControls } from '../components/map/FloatingControls';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

import { base, spacing } from '../theme';
import type { MapStory, Place } from '../types';

const INITIAL_REGION = {
  latitude: 30,
  longitude: 38,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export default function MapScreen({ route, navigation }: any) {
  const initialStoryId = route?.params?.storyId;
  const initialPlaceId = route?.params?.placeId;

  const { places, isLoading: placesLoading } = usePlaces();
  const { stories, isLoading: storiesLoading } = useMapStories();
  const { zoomLevel, onRegionChange } = useMapZoom();
  const mapRef = useRef<MapView>(null);

  const [activeEra, setActiveEra] = useState<string>('all');
  const [activeStory, setActiveStory] = useState<MapStory | null>(null);
  const [showModern, setShowModern] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  // Filter stories by era
  const filteredStories = useMemo(() =>
    activeEra === 'all' ? stories : stories.filter((s) => s.era === activeEra),
    [stories, activeEra]
  );

  // Select a story → show overlays, fit map bounds, open panel
  const selectStory = useCallback((story: MapStory) => {
    setActiveStory(story);
    setShowPanel(true);

    try {
      const placeIds: string[] = JSON.parse(story.places_json ?? '[]');
      const storyPlaces = placeIds
        .map((id) => places.find((p) => p.id === id))
        .filter(Boolean) as Place[];

      if (storyPlaces.length && mapRef.current) {
        mapRef.current.fitToCoordinates(
          storyPlaces.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
          { edgePadding: { top: 80, right: 40, bottom: 300, left: 40 }, animated: true }
        );
      }
    } catch {}
  }, [places]);

  // Pan to a specific place
  const panToPlace = useCallback((place: Place) => {
    mapRef.current?.animateToRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 2,
      longitudeDelta: 2,
    }, 500);
  }, []);

  // Deep-link handling
  useEffect(() => {
    if (initialStoryId && stories.length) {
      const story = stories.find((s) => s.id === initialStoryId);
      if (story) selectStory(story);
    } else if (initialPlaceId && places.length) {
      const place = places.find((p) => p.id === initialPlaceId);
      if (place) panToPlace(place);
    }
  }, [initialStoryId, initialPlaceId, stories.length, places.length]);

  // Handle chapter link navigation
  const handleChapterPress = useCallback((story: MapStory) => {
    if (!story.chapter_link) return;
    const match = story.chapter_link.match(/(\w+)\/(\w+)_(\d+)\.html/);
    if (match) {
      navigation.navigate('ReadTab', {
        screen: 'Chapter',
        params: { bookId: match[2].toLowerCase(), chapterNum: parseInt(match[3], 10) },
      });
    }
  }, [navigation]);

  // Era filter change
  const handleEraChange = useCallback((era: string) => {
    setActiveEra(era);
    if (activeStory && era !== 'all' && activeStory.era !== era) {
      setActiveStory(null);
      setShowPanel(false);
    }
  }, [activeStory]);

  if (placesLoading || storiesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingPad}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Era filter */}
      <EraFilterBar activeEra={activeEra} onSelect={handleEraChange} />

      {/* Map */}
      <View style={styles.mapWrap} accessible accessibilityLabel="Biblical world map" accessibilityHint="Pinch to zoom, drag to pan">
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="terrain"
          initialRegion={INITIAL_REGION}
          onRegionChangeComplete={onRegionChange}
        >
          <PlaceMarkerList
            places={places}
            showModern={showModern}
            zoomLevel={zoomLevel}
            activeStory={activeStory}
          />
          {activeStory && (
            <StoryOverlays story={activeStory} zoomLevel={zoomLevel} />
          )}
        </MapView>

        {/* Floating controls */}
        <FloatingControls
          showModern={showModern}
          onToggleNames={() => setShowModern((v) => !v)}
          onCentre={() => {
            if (activeStory) selectStory(activeStory);
            else mapRef.current?.animateToRegion(INITIAL_REGION, 500);
          }}
        />
      </View>

      {/* Story picker */}
      <StoryPicker
        stories={filteredStories}
        activeStoryId={activeStory?.id ?? null}
        onSelect={(id) => {
          const story = stories.find((s) => s.id === id);
          if (story) {
            if (activeStory?.id === id) {
              setActiveStory(null);
              setShowPanel(false);
            } else {
              selectStory(story);
            }
          }
        }}
      />

      {/* Story panel */}
      {showPanel && activeStory && (
        <View style={styles.storyPanelWrap}>
          <StoryPanel
            story={activeStory}
            places={places}
            showModern={showModern}
            onPlaceTap={(placeId) => {
              const p = places.find((x) => x.id === placeId);
              if (p) panToPlace(p);
            }}
            onChapterPress={() => handleChapterPress(activeStory)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  mapWrap: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  storyPanelWrap: {
    backgroundColor: base.bgElevated,
    borderTopWidth: 1,
    borderTopColor: base.border,
    maxHeight: '40%',
  },
});
