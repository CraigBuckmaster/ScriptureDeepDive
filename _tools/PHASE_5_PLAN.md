# Phase 5: Biblical World Map — Implementation Plan

## Overview

**Goal:** Build a native biblical world map using `react-native-maps` with 71 places, 28 narrative stories (with polygon regions and polyline journeys), era filtering, ancient/modern name toggle, zoom-responsive labels, a story picker, and a story panel with tappable place chips.

**Dependencies:** Phase 2 complete (design system, types, hooks, navigation). Phase 4 complete (EraFilterBar component can be reused). The PersonSidebar is built. The data access layer has `usePlaces()` and `useMapStories()`.

**What the PWA has (map.html — 86KB):**
- Leaflet.js with ESRI World Physical tiles (no text labels — only our custom place names)
- 71 places: 45 cities, 13 regions, 5 sites, 4 mountains, 4 water bodies
- Place labels: zoom-responsive Cinzel font, type-specific symbols (△ mountain, ◆ site, ● city, italic water)
- Priority-based visibility: priority 1 shown at all zooms, priority 4 only at high zoom
- Label offset direction per place (n/w/e/sw/s/nw/ne/se) to avoid overlap
- 28 stories across 8 eras: 19 with region polygons, 23 with journey polylines
- Story overlays: dashed-border polygons (translucent era-colored fill) + polylines with directional arrows
- Story panel: era badge, name, scripture ref, summary, place chips, chapter link
- Story picker: horizontal button strip filtered by era
- Era filter bar (same component as genealogy tree — can reuse)
- Ancient ↔ Modern name toggle
- Map centre: [30, 38], zoom 5, min 3, max 16
- Loading overlay while tiles load

**react-native-maps translation guide:**

| Leaflet | react-native-maps | Notes |
|---------|-------------------|-------|
| `L.map` | `<MapView>` | `initialRegion` instead of `center`+`zoom` |
| `L.tileLayer` (ESRI) | `mapType="terrain"` | No CSS sepia filter; standard terrain tiles |
| `L.marker` + `L.divIcon` | `<Marker><PlaceLabel/></Marker>` | Custom View as marker child |
| `L.polygon` | `<Polygon>` | Takes `coordinates` array of `{latitude, longitude}` |
| `L.polyline` | `<Polyline>` | Takes `coordinates` array |
| `L.divIcon` (arrow) | `<Marker>` with rotated triangle View | Arrow at journey endpoint |
| Zoom events | `onRegionChangeComplete` | Get current zoom for label scaling |
| `fitBounds` | `mapRef.fitToCoordinates()` | Auto-zoom to story bounds |
| CSS sepia filter | Not available natively | Use standard terrain; evaluate Mapbox post-launch |

---

## Data Model

### Place (from SQLite `places` table)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `'jerusalem'` |
| `ancient_name` | string | `'Jerusalem'` |
| `modern_name` | string \| null | `'Jerusalem, Israel'` |
| `latitude` | number | `31.7784` |
| `longitude` | number | `35.2066` |
| `type` | string | `'city'`, `'mountain'`, `'water'`, `'region'`, `'site'` |
| `priority` | number | 1 (always shown) to 4 (high zoom only) |
| `label_dir` | string | `'n'`, `'s'`, `'e'`, `'w'`, `'ne'`, `'nw'`, `'se'`, `'sw'` |

**Type distribution:** 45 cities, 13 regions, 5 sites, 4 mountains, 4 water bodies

### MapStory (from SQLite `map_stories` table)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `'abram-call'` |
| `era` | string | `'patriarch'` |
| `name` | string | `'Abraham\'s Call'` |
| `scripture_ref` | string | `'Genesis 12:1 – 13:18'` |
| `chapter_link` | string \| null | `'ot/genesis/Genesis_12.html'` |
| `summary` | string | Multi-paragraph narrative |
| `places_json` | string | `'["ur","haran","shechem","bethel"]'` — place IDs |
| `regions_json` | string | `'[{"coords":[[34,30],...], "color":"#7a5c9a", "label":"Land of Canaan"}]'` |
| `paths_json` | string | `'[{"coords":[[46.1,30.9],[38.9,36.8]], "dashed":false, "label":"Ur to Haran"}]'` |

**Era distribution:** NT:8, Patriarch:6, Primeval:3, Exodus:3, Exile:3, Judges:2, Kingdom:2, Prophets:1
**Region data:** 19 stories have polygon regions
**Path data:** 23 stories have polyline journey paths

### Coordinate format

**CRITICAL:** The PWA stores coordinates as `[lon, lat]` (longitude first — GeoJSON convention). `react-native-maps` uses `{ latitude, longitude }` (latitude first). Every coordinate array must be flipped during rendering:

```typescript
const toLatLng = ([lon, lat]: number[]) => ({ latitude: lat, longitude: lon });
```

### Map constants (from map.html)

| Constant | Value | Usage |
|----------|-------|-------|
| `initialCenter` | `{ latitude: 30, longitude: 38 }` | Levant centre |
| `initialZoom` | `5` | Starting zoom |
| `initialDelta` | `{ latitudeDelta: 30, longitudeDelta: 30 }` | Approximate viewport |
| `minZoom` / `maxZoom` | `3` / `16` | Zoom bounds |
| `labelScaleBase` | `0.55` | Font scale at zoom 3 |
| `labelScaleStep` | `0.19` | Font scale increase per zoom level |
| `labelScaleMin` / `Max` | `0.7` / `2.4` | Scale clamp bounds |
| `baseFontCity` | `8.5` | Base font px for city/site/mountain labels |
| `baseFontWater` | `10` | Base font px for water/region labels |
| `polylineDashPattern` | `[seg*3, seg*2]` | Dashed path pattern (scaled to zoom) |
| `polygonDashArray` | `[6, 4]` | Region border dash pattern |
| `polygonFillOpacity` | `0.2` | Region fill transparency |
| `polygonBorderOpacity` | `0.65` | Region border transparency |
| `pathOpacity` | `0.85` | Journey line opacity |

### Zoom-to-priority mapping

| Zoom level | Max priority shown | Approximate coverage |
|------------|-------------------|---------------------|
| < 5 | 1 | Major cities only (Jerusalem, Babylon, Rome) |
| 5–6 | 2 | Important cities (Bethlehem, Nineveh, Damascus) |
| 7–8 | 3 | Most cities + notable sites |
| 9+ | 4 | Everything including minor locations |

---

## Batch 5A: Place Marker System
*PlaceLabel component, zoom-responsive rendering, type-specific symbols, name toggle.*

### Prompt for Batch 5A

```
Phase 5A: Build the place marker and label system for the biblical map.

READ _tools/PHASE_5_PLAN.md (Batch 5A section + Data Model + Constants).
READ _tools/REACT_NATIVE_PLAN.md §5.1-5.2 for the map spec.

1. CREATE app/src/components/map/PlaceLabel.tsx:
   Custom marker child that renders a place label with type-specific symbol.
   Props: { place: Place, showModern: boolean, zoomLevel: number }

   a. Symbol rendering by place type:
      - city: filled circle (●) — View with borderRadius
      - mountain: triangle (△) — SVG polygon or custom shape
      - site: diamond (◆) — rotated square View
      - water: no symbol, name rendered in italic
      - region: no symbol, name rendered in italic, slightly larger font

   b. Label text:
      - showModern=false: place.ancient_name (default)
      - showModern=true: place.modern_name (fallback to ancient if null)
      - Font: Cinzel
      - Color: #d4b483 (warm parchment) for cities/sites/mountains
      - Color: #90c8d8 (soft blue) for water
      - Color: #b8a070 (muted gold) for regions

   c. Zoom-responsive sizing (matching PWA's makePlaceIcon):
      scale = clamp(0.55 + (zoomLevel - 3) * 0.19, 0.7, 2.4)
      fontSize = Math.round(baseFontPx * scale)
      where baseFontPx = 10 for water/region, 8.5 for others

   d. Label offset direction (labelDir):
      Position the text relative to the symbol based on place.label_dir:
      'n' → text above symbol, 'e' → text right of symbol, etc.
      This prevents label overlap for nearby places.

   e. Priority-based visibility:
      Return null if place.priority > maxPriorityForZoom(zoomLevel)
      Priority threshold: zoom<5 → show pri 1, zoom<7 → pri 2,
      zoom<9 → pri 3, zoom 9+ → pri 4

2. CREATE app/src/components/map/PlaceMarkerList.tsx:
   Renders all place markers on the map.
   Props: { places: Place[], showModern: boolean, zoomLevel: number,
            filterStoryId?: string }
   - If filterStoryId is set, only show places that belong to that story
     (join with story.places_json array)
   - Otherwise show all places filtered by zoom priority
   - Each place: <Marker coordinate={...}><PlaceLabel .../></Marker>
   - tracksViewChanges={false} for performance (only re-render when
     zoomLevel or showModern changes, not on every frame)

3. CREATE app/src/hooks/useMapZoom.ts:
   Hook that tracks the current zoom level from MapView.
   Uses onRegionChangeComplete callback to compute zoom from latitudeDelta.
   ```
   const zoomFromDelta = (latDelta: number) =>
     Math.round(Math.log2(360 / latDelta));
   ```
   Returns: { zoomLevel: number, onRegionChange: callback }
   Debounced to avoid re-renders on every drag frame.

4. VERIFY:
   - Render MapView with all 71 places
   - At zoom 5: only priority 1 places visible (major cities)
   - Zoom in: more places appear progressively
   - Mountain places show △ symbol
   - Water places show italic blue text
   - Label directions correct (Jerusalem label doesn't overlap Bethlehem)
   - Print place count at each zoom level
```

---

## Batch 5B: Story Overlay System (Polygons + Polylines + Arrows)
*Render region polygons, journey polylines with directional arrows, zoom-responsive styling.*

### Prompt for Batch 5B

```
Phase 5B: Build the story overlay rendering — polygons, polylines, arrows.

READ _tools/PHASE_5_PLAN.md (Batch 5B section + Data Model + Constants).

CRITICAL COORDINATE FLIP: The data stores [lon, lat]. react-native-maps
uses { latitude, longitude }. Every coordinate must be flipped:
const toLatLng = ([lon, lat]) => ({ latitude: lat, longitude: lon });

1. CREATE app/src/components/map/StoryOverlays.tsx:
   Renders all visual overlays for the active story.
   Props: { story: MapStory, zoomLevel: number }

   a. REGION POLYGONS (19 stories have these):
      Parse story.regions_json → array of region objects.
      Each region: { coords: [[lon,lat],...], color: string, label: string }
      Render: <Polygon
        coordinates={region.coords.map(toLatLng)}
        strokeColor={region.color}
        strokeWidth={clamp(1, 4, (zoomLevel - 3) * 0.4)}
        fillColor={region.color + '33'}  // 20% opacity via hex alpha
        lineDashPattern={[6, 4]}
      />

   b. JOURNEY POLYLINES (23 stories have these):
      Parse story.paths_json → array of path segments.
      Each segment: { coords: [[lon,lat],...], dashed: boolean, label: string }
      Render: <Polyline
        coordinates={seg.coords.map(toLatLng)}
        strokeColor={eraColor}
        strokeWidth={clamp(1.5, 6, 1 + (zoomLevel - 3) * 0.55)}
        lineDashPattern={seg.dashed ? [dashLen*3, dashLen*2] : undefined}
        lineCap="round"
        lineJoin="round"
      />

   c. DIRECTIONAL ARROWS at polyline endpoints:
      For each path segment with 2+ coordinates:
      - Compute angle from second-to-last point to last point
      - Render: <Marker coordinate={lastPoint}>
          <View style={{ transform: [{ rotate: `${angle}deg` }] }}>
            {/* CSS triangle: border trick or SVG */}
            <ArrowTriangle color={eraColor} />
          </View>
        </Marker>
      ArrowTriangle: a small 10x10 triangle pointing up (rotation handles direction)

2. CREATE app/src/utils/geoMath.ts:
   Utility functions for geographic calculations.
   - toLatLng([lon, lat]): { latitude, longitude }
   - computeBearing(from, to): number (degrees) — for arrow rotation
   - computeBounds(coords): { ne, sw } — for fitToCoordinates
   - midpoint(a, b): { latitude, longitude }

3. VERIFY:
   - Select "Abraham's Call" story → 3 polyline paths appear (Ur→Haran,
     Haran→Shechem, south through Canaan) with arrows at endpoints
   - Select "Garden of Eden" → polygon region appears (dashed gold border,
     translucent fill)
   - Select "Flood" → region polygon + path polyline both render
   - Zoom in/out → line widths scale smoothly
   - Arrows point in correct direction of travel
```

---

## Batch 5C: Story Panel + Story Picker
*Bottom sheet story panel, horizontal story picker, era filtering, chapter links.*

### Prompt for Batch 5C

```
Phase 5C: Build the story panel, story picker, and era filtering.

READ _tools/PHASE_5_PLAN.md (Batch 5C section + Data Model).

1. CREATE app/src/components/map/StoryPanel.tsx:
   Renders story detail inside a bottom sheet (phone) or sidebar (tablet).
   Props: { story: MapStory, places: Place[], showModern: boolean,
            onPlaceTap: (placeId: string) => void,
            onChapterPress: () => void }
   Content (matching PWA's showStory):
   a. Era badge: pill with era color bg + era name
   b. Story name: displayLg
   c. Scripture reference: bodyMd, gold
   d. Divider line
   e. Summary text: bodyMd (the narrative — can be multiple paragraphs)
   f. "Key Places" section header
   g. Place chips: horizontal flexWrap row of tappable pills
      - Each chip shows ancient name (or modern if toggle is on)
      - Chip border color: era color
      - Tap → calls onPlaceTap(placeId) → map pans to that place
   h. "Read in Scripture Deep Dive →" link (if chapter_link exists)
      - Tapping navigates to ChapterScreen for that chapter

2. CREATE app/src/components/map/StoryPicker.tsx:
   Horizontal scrollable strip of story buttons, filtered by era.
   Props: { stories: MapStory[], activeStoryId: string | null,
            onSelect: (storyId: string) => void }
   - Each button: story name in Cinzel, 10-11px
   - Active button: era-colored background + border
   - Inactive: bordered, textDim
   - Positioned above the bottom sheet (phone) or above sidebar (tablet)
   - Empty state: "No stories for this era" in muted text
   - Horizontal ScrollView, no pagination

3. REUSE app/src/components/tree/EraFilterBar.tsx from Phase 4:
   Same component — "All" + 9 era buttons. Wire to filter both
   story picker AND place markers by era.
   When era changes:
   - Story picker shows only stories for that era
   - If active story is not in the new era, deselect it
   - Place markers optionally filter by era association
     (places that appear in ANY story of that era)

4. CREATE app/src/components/map/FloatingControls.tsx:
   Overlay buttons floating above the map.
   Props: { showModern: boolean, onToggleNames: () => void,
            onCentre: () => void }
   - "Ancient / Modern" toggle button (top-right area)
   - "Centre" button: resets map to initial view or fits story bounds
   - Semi-transparent dark background, gold text/icons
   - Positioned with absolute positioning, avoiding bottom sheet overlap

5. VERIFY:
   - Era filter "Patriarchal Period" → only 6 stories in picker
   - Tap "Abraham's Call" → story panel opens with era badge, narrative,
     6 place chips (Ur, Haran, Shechem, Bethel, Hebron, Negev)
   - Tap "Shechem" chip → map pans to Shechem
   - Tap "Read in Scripture Deep Dive →" → navigates to Genesis 12
   - Toggle "Modern" → place chips and map labels switch to modern names
   - Tap "Centre" → map fits to show all active story places
```

---

## Batch 5D: MapScreen Assembly + Deep-Link Support
*Assemble everything into the MapScreen. Handle deep-links from chapters.*

### Prompt for Batch 5D

```
Phase 5D: Assemble MapScreen and wire deep-link navigation.

READ _tools/PHASE_5_PLAN.md (Batch 5D section).
READ _tools/REACT_NATIVE_PLAN.md §5.1 for the screen spec.

1. UPDATE app/src/screens/MapScreen.tsx:
   (Full implementation — replace Phase 2E placeholder)

   ```typescript
   export default function MapScreen({ route }) {
     const initialStoryId = route.params?.storyId;
     const initialPlaceId = route.params?.placeId;
     const { places } = usePlaces();
     const { stories } = useMapStories();
     const [activeEra, setActiveEra] = useState<string>('all');
     const [activeStory, setActiveStory] = useState<MapStory | null>(null);
     const [showModern, setShowModern] = useState(false);
     const { zoomLevel, onRegionChange } = useMapZoom();
     const mapRef = useRef<MapView>(null);
     const storySheet = useRef<BottomSheet>(null);
     const navigation = useNavigation();

     // Filter stories by era
     const filteredStories = activeEra === 'all'
       ? stories : stories.filter(s => s.era === activeEra);

     // Deep-link: pre-select story or centre on place
     useEffect(() => {
       if (initialStoryId && stories.length) {
         const story = stories.find(s => s.id === initialStoryId);
         if (story) selectStory(story);
       } else if (initialPlaceId && places.length) {
         const place = places.find(p => p.id === initialPlaceId);
         if (place) panToPlace(place);
       }
     }, [initialStoryId, initialPlaceId, stories, places]);

     function selectStory(story: MapStory) {
       setActiveStory(story);
       storySheet.current?.snapToIndex(0);
       // Fit map to story's places
       const storyPlaceIds = JSON.parse(story.places_json || '[]');
       const storyPlaces = storyPlaceIds
         .map(id => places.find(p => p.id === id))
         .filter(Boolean);
       if (storyPlaces.length && mapRef.current) {
         mapRef.current.fitToCoordinates(
           storyPlaces.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
           { edgePadding: { top: 80, right: 40, bottom: 300, left: 40 }, animated: true }
         );
       }
     }

     function panToPlace(place: Place) {
       mapRef.current?.animateToRegion({
         latitude: place.latitude, longitude: place.longitude,
         latitudeDelta: 2, longitudeDelta: 2,
       }, 500);
     }

     function handleChapterPress(story: MapStory) {
       if (!story.chapter_link) return;
       // Parse "ot/genesis/Genesis_12.html" → bookId + chapterNum
       const match = story.chapter_link.match(/(\w+)\/(\w+)_(\d+)\.html/);
       if (match) {
         navigation.navigate('Chapter', {
           bookId: match[1], chapterNum: parseInt(match[2])
         });
       }
     }

     return (
       <View style={{ flex: 1, backgroundColor: colors.bg }}>
         <EraFilterBar activeEra={activeEra} onSelect={(era) => {
           setActiveEra(era);
           if (activeStory && era !== 'all' && activeStory.era !== era) {
             setActiveStory(null);
             storySheet.current?.close();
           }
         }} />

         <MapView
           ref={mapRef}
           style={{ flex: 1 }}
           mapType="terrain"
           initialRegion={{
             latitude: 30, longitude: 38,
             latitudeDelta: 30, longitudeDelta: 30,
           }}
           onRegionChangeComplete={onRegionChange}
         >
           <PlaceMarkerList
             places={places}
             showModern={showModern}
             zoomLevel={zoomLevel}
             filterStoryId={activeStory?.id}
           />
           {activeStory && (
             <StoryOverlays story={activeStory} zoomLevel={zoomLevel} />
           )}
         </MapView>

         <StoryPicker
           stories={filteredStories}
           activeStoryId={activeStory?.id ?? null}
           onSelect={(id) => {
             const story = stories.find(s => s.id === id);
             if (story) selectStory(story);
           }}
         />

         <FloatingControls
           showModern={showModern}
           onToggleNames={() => setShowModern(!showModern)}
           onCentre={() => {
             if (activeStory) selectStory(activeStory); // re-fit
             else mapRef.current?.animateToRegion({
               latitude: 30, longitude: 38, latitudeDelta: 30, longitudeDelta: 30
             }, 500);
           }}
         />

         <BottomSheet ref={storySheet} snapPoints={['40%', '80%']}
                      index={-1} enablePanDownToClose>
           {activeStory && (
             <StoryPanel
               story={activeStory}
               places={places}
               showModern={showModern}
               onPlaceTap={(placeId) => {
                 const p = places.find(x => x.id === placeId);
                 if (p) panToPlace(p);
               }}
               onChapterPress={() => handleChapterPress(activeStory)}
             />
           )}
         </BottomSheet>
       </View>
     );
   }
   ```

2. DEEP-LINK INTEGRATION:
   The map is reachable via deep-links from:
   a. ChapterScreen map story links (§3.1c):
      navigation.navigate('Map', { storyId: 'abram-call' })
      → map opens, selects that story, fits bounds, shows overlays
   b. PlacesPanel in chapters (§3D):
      navigation.navigate('Map', { placeId: 'jerusalem' })
      → map opens, centres on that place
   c. ExploreMenuScreen:
      navigation.navigate('Map')
      → map opens at default view

3. LOADING STATE:
   Show a loading skeleton while places and stories load from SQLite.
   MapView shows a dark background (#0c0a07) before tiles load.
   Once tiles render: fade in.

4. TABLET LAYOUT:
   On tablet (width > 768):
   - StoryPanel as a fixed 340px sidebar on the right (not bottom sheet)
   - StoryPicker as a vertical list in the sidebar header
   - Map occupies remaining width
   - FloatingControls adjusted for wider layout

5. VERIFY full feature parity with map.html:
   - [ ] 71 places render (cities, mountains, water, regions, sites)
   - [ ] Place labels use Cinzel font, zoom-responsive sizing
   - [ ] Type-specific symbols: △ mountain, ◆ site, ● city, italic water
   - [ ] Priority-based visibility (zoom in → more places appear)
   - [ ] Label offset directions prevent overlap
   - [ ] 28 stories in story picker
   - [ ] Era filter: "Patriarchal Period" → 6 stories
   - [ ] Select story → region polygons appear (dashed border, translucent fill)
   - [ ] Select story → journey polylines appear with directional arrows
   - [ ] Arrows point in correct direction of travel
   - [ ] Zoom in/out → line widths and label sizes scale
   - [ ] Story panel: era badge, name, ref, summary, place chips, chapter link
   - [ ] Tap place chip → map pans to that place
   - [ ] Tap "Read in Scripture Deep Dive →" → navigates to correct chapter
   - [ ] Ancient ↔ Modern name toggle works on both labels and place chips
   - [ ] Deep-link: MapScreen({ storyId: 'abram-call' }) → story pre-selected
   - [ ] Deep-link: MapScreen({ placeId: 'jerusalem' }) → map centred on Jerusalem
   - [ ] Select story → map auto-fits to show all story places
   - [ ] Loading state before data/tiles ready
   - [ ] Phone: story panel as bottom sheet ['40%','80%']
   - [ ] Tablet: story panel as sidebar (340px)
   - [ ] Map terrain tiles render (standard terrain, not sepia-filtered)
   - [ ] Performance: 71 markers + overlays at 60 FPS
```

---

## Batch Summary

| Batch | Description | Components | Tool calls |
|-------|-------------|-----------|-----------|
| **5A** | Place markers: PlaceLabel (zoom-responsive, type symbols, name toggle), PlaceMarkerList, useMapZoom | 3 | ~10 |
| **5B** | Story overlays: StoryOverlays (polygons + polylines + arrows), geoMath utils | 2 | ~8 |
| **5C** | Story panel + picker: StoryPanel, StoryPicker, FloatingControls, EraFilterBar reuse | 3 + reuse | ~10 |
| **5D** | MapScreen assembly, deep-link wiring, loading state, tablet layout, full verification | 1 screen | ~12 |

**Total: 4 batches, ~40 tool calls, targeting 2 sessions.**

**Dependency graph:**
```
5A ──→ 5B ──→ 5C ──→ 5D
```

Linear chain. 5A (markers) must render before 5B (overlays on top). 5C (story panel) needs 5B (overlays triggered by story selection). 5D assembles everything.

---

## Session Planning

**Session 1:** Batches 5A + 5B (place markers + story overlays)
**Session 2:** Batches 5C + 5D (story panel + MapScreen assembly + verification)

---

## Verification Checklist (run after Phase 5 is complete)

- [ ] 71 places render on the map with correct coordinates
- [ ] Place labels: Cinzel font, warm parchment color for land, blue for water
- [ ] Zoom-responsive label sizing (scale 0.7–2.4)
- [ ] Type symbols: ● city, △ mountain, ◆ site, italic water/region
- [ ] Priority filtering: zoom <5 shows only priority 1, zoom 9+ shows all
- [ ] Label offset directions (labelDir) prevent overlap
- [ ] 28 stories available in story picker
- [ ] Era filter: shows correct story count per era (NT:8, Patriarch:6, etc.)
- [ ] Story selection → region polygons render (dashed border, era-colored fill)
- [ ] Story selection → journey polylines render with correct paths
- [ ] Directional arrows at polyline endpoints, correctly rotated
- [ ] Zoom in/out → polygon border width and polyline width scale
- [ ] Story panel shows: era badge, name, ref, summary, place chips, chapter link
- [ ] Place chips tappable → map pans to place location
- [ ] Chapter link → navigates to correct ChapterScreen
- [ ] Ancient ↔ Modern name toggle on labels AND place chips
- [ ] Deep-link: `{ storyId: 'abram-call' }` → story pre-selected, map fitted
- [ ] Deep-link: `{ placeId: 'jerusalem' }` → map centred on Jerusalem
- [ ] Auto-fit: selecting story zooms map to show all story places
- [ ] Coordinate flip: [lon,lat] data → {latitude,longitude} display correct
- [ ] Loading state shown while data loads
- [ ] Phone: bottom sheet story panel with snap points
- [ ] Tablet: sidebar story panel (340px)
- [ ] 60 FPS with 71 markers + active story overlays
- [ ] Centre button: resets to default view or re-fits active story
