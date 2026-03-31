/**
 * MapScreen — Biblical world map with 71 places, 28 stories.
 *
 * react-native-maps terrain tiles + custom place labels + story overlays
 * (region polygons, journey polylines, directional arrows).
 * Era filtering, ancient/modern toggle, story panel bottom sheet.
 * Deep-link: storyId or placeId route params.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

import { usePlaces } from '../hooks/usePlaces';
import { useMapStories } from '../hooks/useMapStories';
import { useMapZoom } from '../hooks/useMapZoom';
import { useLandscapeUnlock } from '../hooks/useLandscapeUnlock';
import { ancientMapStyle, modernMapStyle } from '../utils/mapStyles';

/**
 * Google Maps is only available in custom dev builds, never in Expo Go.
 * Set this to true once you have a working dev build with react-native-maps
 * linked to the Google Maps SDK. Until then, Apple Maps + POI suppression.
 */
const USE_GOOGLE_MAPS = false;

import { EraFilterBar } from '../components/tree/EraFilterBar';
import { PlaceMarkerList } from '../components/map/PlaceMarkerList';
import { StoryOverlays } from '../components/map/StoryOverlays';
import { StoryPicker } from '../components/map/StoryPicker';
import { StoryPanel } from '../components/map/StoryPanel';
import { FloatingControls } from '../components/map/FloatingControls';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

import { useTheme, spacing } from '../theme';
import type { MapStory, Place } from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';

const INITIAL_REGION = {
  latitude: 30,
  longitude: 38,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export default function MapScreen({ route, navigation }: {
  route: ScreenRouteProp<'Explore', 'Map'>;
  navigation: ScreenNavProp<'Explore', 'Map'>;
}) {
  const { base } = useTheme();
  useLandscapeUnlock();
  const initialStoryId = route?.params?.storyId;
  const initialPlaceId = route?.params?.placeId;

  const { places, isLoading: placesLoading } = usePlaces();
  const { stories, isLoading: storiesLoading } = useMapStories();
  const { zoomLevel, onRegionChange } = useMapZoom();
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

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
        // Story panel takes ~40% of screen; centre places in the visible area above it
        const panelHeight = Math.round(screenHeight * 0.4);
        const topPad = insets.top + 50; // status bar + era filter
        mapRef.current.fitToCoordinates(
          storyPlaces.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
          { edgePadding: { top: topPad, right: 40, bottom: panelHeight + 20, left: 40 }, animated: true }
        );
      }
    } catch (err) { logger.warn('MapScreen', 'Operation failed', err); }
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

  // Deep-link handling — process once after data loads
  const deepLinkProcessed = useRef(false);
  useEffect(() => {
    if (deepLinkProcessed.current) return;
    if (initialStoryId && stories.length) {
      const story = stories.find((s) => s.id === initialStoryId);
      if (story) { selectStory(story); deepLinkProcessed.current = true; }
    } else if (initialPlaceId && places.length) {
      const place = places.find((p) => p.id === initialPlaceId);
      if (place) { panToPlace(place); deepLinkProcessed.current = true; }
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

  // Era filter change — auto-select the first matching story to jump the map
  const handleEraChange = useCallback((era: string) => {
    setActiveEra(era);
    if (era === 'all') {
      setActiveStory(null);
      setShowPanel(false);
      mapRef.current?.animateToRegion(INITIAL_REGION, 500);
      return;
    }
    // If current story doesn't match the new era, jump to the first matching story
    if (activeStory?.era === era) return;
    const firstMatch = stories.find((s) => s.era === era);
    if (firstMatch) {
      selectStory(firstMatch);
    } else {
      setActiveStory(null);
      setShowPanel(false);
    }
  }, [activeStory, stories, selectStory]);

  if (placesLoading || storiesLoading) {
    return (
      <View style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={[styles.loadingPad, { paddingTop: insets.top + spacing.lg }]}>
          <LoadingSkeleton lines={6} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Map fills the entire screen */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={USE_GOOGLE_MAPS ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        mapType="terrain"
        customMapStyle={USE_GOOGLE_MAPS ? (showModern ? modernMapStyle : ancientMapStyle) : undefined}
        showsPointsOfInterest={USE_GOOGLE_MAPS ? undefined : showModern}
        showsBuildings={USE_GOOGLE_MAPS ? undefined : showModern}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={onRegionChange}
        showsTraffic={false}
        showsIndoors={false}
        accessible
        accessibilityLabel="Biblical world map"
        accessibilityHint="Pinch to zoom, drag to pan"
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

      {/* Era filter — overlaid at top below status bar */}
      <View style={[styles.topControls, { paddingTop: insets.top }]} pointerEvents="box-none">
        <EraFilterBar activeEra={activeEra} onSelect={handleEraChange} />
      </View>

      {/* Floating controls — offset below era filter */}
      <View style={[styles.floatingWrap, { top: insets.top + 44 }]} pointerEvents="box-none">
        <FloatingControls
          showModern={showModern}
          onToggleNames={() => setShowModern((v) => !v)}
          onCentre={() => {
            if (activeStory) selectStory(activeStory);
            else mapRef.current?.animateToRegion(INITIAL_REGION, 500);
          }}
        />
      </View>

      {/* Story picker — overlaid at bottom */}
      <View style={styles.bottomControls} pointerEvents="box-none">
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
      </View>

      {/* Story panel */}
      {showPanel && activeStory && (
        <View style={[styles.storyPanelWrap, { backgroundColor: base.bgElevated, borderTopColor: base.border }]}>
          <StoryPanel
            story={activeStory}
            places={places}
            showModern={showModern}
            onPlaceTap={(placeId) => {
              const p = places.find((x) => x.id === placeId);
              if (p) panToPlace(p);
            }}
            onChapterPress={() => handleChapterPress(activeStory)}
            onClose={() => { setActiveStory(null); setShowPanel(false); }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  floatingWrap: {
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  storyPanelWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    maxHeight: '40%',
    zIndex: 20,
  },
});
