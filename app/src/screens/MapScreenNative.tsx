/**
 * MapScreen — Biblical world map, MapLibre edition.
 *
 * Sepia/parchment MapLibre style hosted on R2, with 373 biblical places
 * rendered as GPU SymbolLayers and 28 stories rendered as GeoJSON overlays.
 * Era filter + ancient/modern name toggle + story bottom panel. Deep-link
 * via `storyId` or `placeId` route params.
 *
 * Migrated from react-native-maps in #1315 (MapLibre migration epic #1314).
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Camera, type CameraRef } from '@maplibre/maplibre-react-native';
import { usePlaces } from '../hooks/usePlaces';
import { ensureMapLibreInit } from '../utils/isMapNativeAvailable';
import { useMapStories } from '../hooks/useMapStories';
import { useMapZoom } from '../hooks/useMapZoom';
import { useMapTileCache } from '../hooks/useMapTileCache';
import { useLandscapeUnlock } from '../hooks/useLandscapeUnlock';
import { EraFilterBar } from '../components/tree/EraFilterBar';
import { AncientBorderLayer } from '../components/map/AncientBorderLayer';
import { PlaceMarkerList } from '../components/map/PlaceMarkerList';
import { PersonArcLayer } from '../components/map/PersonArcLayer';
import { StoryOverlays } from '../components/map/StoryOverlays';
import { usePersonArc } from '../hooks/usePersonArc';
import { StoryPicker } from '../components/map/StoryPicker';
import { StoryPanel } from '../components/map/StoryPanel';
import { PlaceDetailCard } from '../components/map/PlaceDetailCard';
import { PlaceSearchBar } from '../components/map/PlaceSearchBar';
import { FloatingControls } from '../components/map/FloatingControls';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing } from '../theme';
import type { MapStory, Place } from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';
import { lightImpact } from '../utils/haptics';
import { STYLE_ANCIENT, STYLE_MODERN } from '../constants/mapStyles';
import { buildPlaceToStoriesMap } from './MapScreen';

// The dispatcher (MapScreen.tsx) gates on isMapNativeAvailable() before
// this module loads. Run module-level init so tiles can be fetched.
ensureMapLibreInit();

// Roughly the Fertile Crescent — Israel through Turkey, Egypt, Iraq.
// Used as default camera and as the pre-cached tile region (#1321).
export const BIBLICAL_REGION = {
  center: [38, 30] as [number, number],
  zoom: 4,
  ne: [55, 45] as [number, number],
  sw: [25, 20] as [number, number],
};

function MapScreen({ route, navigation }: {
  route: ScreenRouteProp<'Explore', 'Map'>;
  navigation: ScreenNavProp<'Explore', 'Map'>;
}) {
  const { base } = useTheme();
  useLandscapeUnlock();

  // Dispatcher (src/screens/MapScreen.tsx) gates on isMapNativeAvailable()
  // before mounting this component, so at this point MapLibre is
  // guaranteed to be linked. Configure the ambient tile cache + pre-cache
  // the biblical region on first mount (#1321).
  useMapTileCache(STYLE_ANCIENT);
  const initialStoryId = route?.params?.storyId;
  const initialPlaceId = route?.params?.placeId;
  const initialPersonId = route?.params?.personId;

  const { places, isLoading: placesLoading } = usePlaces();
  const { stories, isLoading: storiesLoading } = useMapStories();
  const { zoomLevel, onRegionDidChange } = useMapZoom();
  const cameraRef = useRef<CameraRef>(null);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const [activeEra, setActiveEra] = useState<string>('all');
  const [activeStory, setActiveStory] = useState<MapStory | null>(null);
  const [showModern, setShowModern] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Filter stories by era
  const filteredStories = useMemo(() =>
    activeEra === 'all' ? stories : stories.filter((s) => s.era === activeEra),
    [stories, activeEra]
  );

  // Map of placeId → stories that include it
  const placeToStories = useMemo(() => buildPlaceToStoriesMap(stories), [stories]);

  /** Select a story → overlays, camera fit, panel open, era auto-switch. */
  const selectStory = useCallback((story: MapStory) => {
    setActiveStory(story);
    setShowPanel(true);
    setSelectedPlace(null);
    // Auto-switch the ancient-border layer to match the story's era
    // (scaffold for #1317). Preserves the user's 'all' selection only
    // when no era info is present on the story.
    if (story.era) setActiveEra(story.era);

    try {
      const placeIds: string[] = JSON.parse(story.places_json ?? '[]');
      const storyPlaces = placeIds
        .map((id) => places.find((p) => p.id === id))
        .filter(Boolean) as Place[];

      if (storyPlaces.length && cameraRef.current) {
        // Story panel takes ~40% of screen; pad the bottom to keep points visible.
        const panelHeight = Math.round(screenHeight * 0.4);
        const topPad = insets.top + 50;

        // Compute bounding box in [lon, lat] order (MapLibre convention).
        let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
        for (const p of storyPlaces) {
          if (p.longitude < minLon) minLon = p.longitude;
          if (p.longitude > maxLon) maxLon = p.longitude;
          if (p.latitude < minLat) minLat = p.latitude;
          if (p.latitude > maxLat) maxLat = p.latitude;
        }
        cameraRef.current.fitBounds(
          [maxLon, maxLat],
          [minLon, minLat],
          [topPad, 40, panelHeight + 20, 40],
          700,
        );
      }
    } catch (err) { logger.warn('MapScreen', 'Operation failed', err); }
  }, [places, insets.top, screenHeight]);

  /**
   * Pan (and zoom in) to a specific place.
   *
   * `setCamera` combines centerCoordinate + zoomLevel in one animation so
   * we recreate the old `animateToRegion({delta: 2})` behaviour — a close
   * zoom that clearly frames one place.
   */
  const panToPlace = useCallback((place: Place) => {
    cameraRef.current?.setCamera({
      centerCoordinate: [place.longitude, place.latitude],
      zoomLevel: 7.5,
      animationDuration: 500,
      animationMode: 'flyTo',
    });
  }, []);

  /** Tap a marker → open detail card + recentre. */
  const handlePlacePress = useCallback((place: Place) => {
    lightImpact();
    setActiveStory(null);
    setShowPanel(false);
    setSelectedPlace(place);
    panToPlace(place);
  }, [panToPlace]);

  // Person arc (#1324). Resolving the arc is async; when the data lands,
  // the map fits bounds to the full arc.
  const { arcData: personArc } = usePersonArc(initialPersonId);

  // Deep-link handling — auto-select story/place/person from route params
  const lastProcessedStory = useRef<string | null>(null);
  const lastProcessedPlace = useRef<string | null>(null);
  const lastProcessedPerson = useRef<string | null>(null);
  useEffect(() => {
    if (initialStoryId && stories.length && places.length) {
      if (lastProcessedStory.current === initialStoryId) return;
      const story = stories.find((s) => s.id === initialStoryId);
      if (story) {
        selectStory(story);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (story.era) setActiveEra(story.era);
        lastProcessedStory.current = initialStoryId;
      }
    } else if (initialPlaceId && places.length) {
      if (lastProcessedPlace.current === initialPlaceId) return;
      const place = places.find((p) => p.id === initialPlaceId);
      if (place) {
        panToPlace(place);
        lastProcessedPlace.current = initialPlaceId;
      }
    } else if (
      initialPersonId &&
      personArc &&
      personArc.stops.length > 0 &&
      lastProcessedPerson.current !== initialPersonId
    ) {
      // Fit the camera to the arc's bounding box so the full journey is
      // visible. Single-stop arcs just recentre on that place.
      if (personArc.stops.length === 1) {
        const { place } = personArc.stops[0];
        panToPlace(place);
      } else if (cameraRef.current) {
        let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
        for (const s of personArc.stops) {
          const { longitude: lon, latitude: lat } = s.place;
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        cameraRef.current.fitBounds(
          [maxLon, maxLat],
          [minLon, minLat],
          [insets.top + 80, 40, 120, 40],
          700,
        );
      }
      lastProcessedPerson.current = initialPersonId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only length matters for array deps; adding full arrays causes unnecessary reruns
  }, [
    initialStoryId, initialPlaceId, initialPersonId,
    stories.length, places.length, personArc,
    selectStory, panToPlace, insets.top,
  ]);

  // Handle chapter link navigation
  const handleChapterPress = useCallback((story: MapStory) => {
    if (!story.chapter_link) return;
    const match = story.chapter_link.match(/(\w+)\/(\w+)_(\d+)\.html/);
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).navigate('ReadTab', {
        screen: 'Chapter',
        params: { bookId: match[2].toLowerCase(), chapterNum: parseInt(match[3], 10) },
      });
    }
  }, [navigation]);

  /** Era filter change — auto-select the first matching story to jump the map. */
  const handleEraChange = useCallback((era: string) => {
    setActiveEra(era);
    setSelectedPlace(null);
    if (era === 'all') {
      setActiveStory(null);
      setShowPanel(false);
      cameraRef.current?.setCamera({
        centerCoordinate: BIBLICAL_REGION.center,
        zoomLevel: BIBLICAL_REGION.zoom,
        animationDuration: 500,
        animationMode: 'flyTo',
      });
      return;
    }
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
      {/* Accessibility props live on a wrapping View — MapLibre's MapView
          doesn't accept RN accessibility props directly. testID stays on
          the wrapper so `getByTestId('map-view').props.accessibilityLabel`
          keeps resolving in tests. */}
      <View
        testID="map-view"
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityLabel="Biblical world map"
        accessibilityHint="Pinch to zoom, drag to pan"
      >
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={showModern ? STYLE_MODERN : STYLE_ANCIENT}
        onRegionDidChange={onRegionDidChange}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: BIBLICAL_REGION.center,
            zoomLevel: BIBLICAL_REGION.zoom,
          }}
        />
        {/* Ancient political borders for the active era (Biblical mode only) */}
        <AncientBorderLayer era={activeEra} showModern={showModern} />
        <PlaceMarkerList
          places={places}
          showModern={showModern}
          zoomLevel={zoomLevel}
          activeStory={activeStory}
          activePlaceId={selectedPlace?.id ?? null}
          onPlacePress={handlePlacePress}
        />
        {activeStory && (
          <StoryOverlays story={activeStory} zoomLevel={zoomLevel} />
        )}
        {/* Person geographic arc (#1324) */}
        {personArc?.stops?.length ? <PersonArcLayer stops={personArc.stops} /> : null}
      </MapView>
      </View>

      {/* Search bar + era filter — overlaid at top below status bar */}
      <View style={[styles.topControls, { paddingTop: insets.top }]} pointerEvents="box-none">
        <PlaceSearchBar places={places} onSelect={handlePlacePress} />
        <EraFilterBar activeEra={activeEra} onSelect={handleEraChange} />
      </View>

      {/* Floating controls — offset below the search bar + era filter */}
      <View style={[styles.floatingWrap, { top: insets.top + 84 }]} pointerEvents="box-none">
        <FloatingControls
          showModern={showModern}
          onToggleNames={() => setShowModern((v) => !v)}
          onCentre={() => {
            if (activeStory) selectStory(activeStory);
            else cameraRef.current?.setCamera({
              centerCoordinate: BIBLICAL_REGION.center,
              zoomLevel: BIBLICAL_REGION.zoom,
              animationDuration: 500,
              animationMode: 'flyTo',
            });
          }}
        />
      </View>

      {/* Story picker — overlaid at bottom */}
      <View style={styles.bottomControls} pointerEvents="box-none">
        <StoryPicker
          stories={filteredStories}
          activeStoryId={activeStory?.id ?? null}
          places={places}
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

      {/* Place detail card — shares the bottom slot with the story panel */}
      {selectedPlace && !showPanel && (
        <View style={[styles.placeDetailWrap, { backgroundColor: base.bgElevated, borderTopColor: base.border }]}>
          <PlaceDetailCard
            place={selectedPlace}
            stories={placeToStories.get(selectedPlace.id)}
            onClose={() => setSelectedPlace(null)}
            onStoryPress={(s) => selectStory(s)}
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
  placeDetailWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    maxHeight: '30%',
    zIndex: 20,
  },
});

// The dispatcher in `./MapScreen` already wraps this in an error boundary.
export default MapScreen;
