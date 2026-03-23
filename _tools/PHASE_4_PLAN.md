# Phase 4: Genealogy Tree — Implementation Plan

## Overview

**Goal:** Build a pure-native zoomable family tree of 211 biblical people using `d3-hierarchy` for layout math and `react-native-svg` for rendering. No WebView. Full gesture support (pinch-to-zoom, pan with momentum). Bio sidebar with tappable family-link chaining. Search with auto-centre-and-zoom.

**Dependencies:** Phase 2 complete (design system, types, hooks, navigation). Phase 3 complete (PersonSidebar modal placeholder exists and will be fully built here).

**What the PWA has (people.html — 30KB of inline JS):**
- 211 people from `people-data.js` (196KB)
- `d3.hierarchy` + `d3.tree().nodeSize([90, 140])` for layout
- `d3.zoom().scaleExtent([0.15, 3])` for pinch/pan
- Spine nodes (Adam→Jesus lineage) rendered gold, r=7, 11px labels
- Satellite nodes rendered in era color, r=5, 9.5px labels
- 30 people have `spouseOf` set → positioned at x+88 from partner
- Multi-spouse staggering (e.g., Jacob's 4 wives) at y±58 per spouse
- Marriage bars: horizontal line + double-tick symbol at midpoint
- Multi-spouse vertical connector on partner side
- Era filtering: non-matching nodes dimmed to 25% opacity, spine always visible
- Bio panel: era badge, name, dates, role, family links (tappable → chains), bio text, scriptureRole, key refs, chapter link
- Search: filter → tap → animated zoom-to-node
- Initial view: centred on Adam at 0.45x (mobile) / 0.75x (desktop)

**What the React Native app builds:**
- Same tree layout and rendering, but with `react-native-svg` + `react-native-reanimated` + `react-native-gesture-handler`
- Bio as a `@gorhom/bottom-sheet` (phone) or sidebar (tablet)
- PersonDetailScreen for full-page bio (navigable from anywhere)
- Deep-link support: any screen can navigate to the tree with a person pre-selected

---

## Data Model

### Person fields (from people-data.js, stored in SQLite `people` table)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `'adam'`, `'rachel'`, `'paul'` |
| `name` | string | Display name |
| `gender` | `'m'` \| `'f'` | |
| `father` | string \| null | Person ID |
| `mother` | string \| null | Person ID |
| `spouseOf` | string \| null | Person ID — 30 people have this set |
| `era` | string | `'primeval'`, `'patriarch'`, ..., `'nt'` |
| `dates` | string \| null | `'c. 4000 BC (trad.)'` |
| `role` | string | `'First Man'`, `'Beloved wife; mother of Joseph and Benjamin'` |
| `bio` | string | Multi-paragraph biography |
| `scriptureRole` | string \| null | 60 people have this (authors, prophets, etc.) |
| `refs` | string[] | Key scripture references — all 211 have this |
| `chapter` | string \| null | Link to chapter page — 71 people have this |

### Spine determination (COMPUTED, not stored)

The `type` field (`spine` vs `satellite`) is **not stored** in `people-data.js`. It must be computed at runtime by tracing the father chain from Adam to Jesus. A person is `spine` if they appear on the direct patrilineal descent: Adam → Seth → Enosh → ... → David → ... → Joseph → Jesus.

```typescript
function computeSpineIds(people: Person[]): Set<string> {
  const byId = new Map(people.map(p => [p.id, p]));
  // Start from 'jesus' and walk up the father chain
  const spine = new Set<string>();
  let current = byId.get('jesus');
  while (current) {
    spine.add(current.id);
    current = current.father ? byId.get(current.father) : null;
  }
  return spine;
}
```

### Tree layout constants (from people.html)

| Constant | Value | Usage |
|----------|-------|-------|
| `nodeSize` | `[90, 140]` | 90px horizontal spacing, 140px vertical |
| `spouseXOffset` | `88` | Spouse positioned 88px right of partner |
| `spouseYSpread` | `58` | Multi-spouse vertical staggering per spouse |
| `spineRadius` | `7` | Circle radius for spine nodes |
| `satelliteRadius` | `5` | Circle radius for satellite nodes |
| `spineFontSize` | `11` | Label font size for spine |
| `satelliteFontSize` | `9.5` | Label font size for satellite |
| `touchTargetRadius` | `18` | Invisible hit area (>44pt at normal zoom) |
| `minZoom` | `0.15` | Minimum zoom scale |
| `maxZoom` | `3` | Maximum zoom scale |
| `initialScaleMobile` | `0.45` | Starting zoom on phone |
| `initialScaleTablet` | `0.75` | Starting zoom on tablet |
| `marriageTickHeight` | `10` | Height of marriage symbol ticks (±5) |
| `marriageTickGap` | `6` | Gap between the two ticks (±3 from midpoint) |

---

## Batch 4A: Tree Data Layer + Layout Math
*Build the hierarchy, compute positions, handle spouses — pure logic, no rendering.*

### Prompt for Batch 4A

```
Phase 4A: Build the tree data layer and d3-hierarchy layout math.

READ _tools/PHASE_4_PLAN.md (Batch 4A section + Data Model + Constants).
READ _tools/REACT_NATIVE_PLAN.md §4.1-4.2 for architecture.

This batch is pure TypeScript logic — NO rendering, NO gestures. Just
the math that computes x,y positions for 211 nodes.

1. CREATE app/src/utils/treeBuilder.ts:

   a. computeSpineIds(people: Person[]): Set<string>
      Walk the father chain from 'jesus' back to 'adam'.
      Every person on that chain is spine.
      Return the set of IDs.

   b. buildHierarchy(people: Person[]): HierarchyRoot
      Convert flat people array to a D3 hierarchy tree:
      - Create a lookup map: byId[person.id] = { ...person, children: [] }
      - Attach children to fathers (or mothers if no father)
      - Remove spouseOf people from children arrays (they're rendered
        separately, not as tree children)
      - Return byId['adam'] as the root
      Input: Person[] from SQLite
      Output: nested object suitable for d3.hierarchy()

   c. layoutTree(root: HierarchyRoot): LayoutNode[]
      Run d3.hierarchy() + d3.tree().nodeSize([90, 140]) on the root.
      Returns flat array of all positioned nodes with x,y coordinates.

   d. positionSpouses(nodes: LayoutNode[], people: Person[]): void
      For each person with spouseOf set:
        - Find their partner node
        - Set spouse x = partner.x + 88
        - If partner has 1 spouse: spouse.y = partner.y
        - If partner has N spouses: spread symmetrically with 58px gaps
          offset = (i - (count-1)/2) * 58
          spouse.y = partner.y + offset
      Group spouses by partnerId to handle multi-spouse cases (Jacob).

   e. Type definitions:
      interface TreePerson extends Person { type: 'spine' | 'satellite' }
      interface LayoutNode {
        data: TreePerson;
        x: number; y: number;
        parent: LayoutNode | null;
        children: LayoutNode[];
        depth: number;
      }
      interface MarriageBar {
        partnerId: string; spouseId: string;
        x1: number; x2: number; y: number;  // horizontal line
        midX: number;                        // tick position
        dimmed: boolean;
      }
      interface SpouseConnector {
        x: number; yTop: number; yBottom: number;
        dimmed: boolean;
      }

   f. computeMarriageBars(nodes: LayoutNode[], filterEra: string | null): MarriageBar[]
      For each spouse node: compute the horizontal line from partner
      right edge (x+7) to spouse left edge (x-5), and the midpoint
      for the double-tick marriage symbol.

   g. computeSpouseConnectors(nodes: LayoutNode[], filterEra: string | null): SpouseConnector[]
      For partners with 2+ spouses: vertical line connecting all
      spouse y-positions on the partner's right edge.

   h. computeLinks(root: LayoutNode, filterEra: string | null):
        { source: {x,y}, target: {x,y}, isSpine: boolean, dimmed: boolean }[]
      All parent→child links, excluding spouseOf nodes.
      Spine links (both endpoints are spine) get special styling.

2. CREATE app/src/hooks/useTreeLayout.ts:
   Custom hook that combines all the above:
   const { nodes, links, marriageBars, spouseConnectors, spineIds }
     = useTreeLayout(people, filterEra);
   Memoized — only recomputes when people or filterEra changes.

3. TEST with real data:
   - Load all 211 people from SQLite via usePeople()
   - computeSpineIds → expect ~25-30 IDs (Adam through Jesus)
   - buildHierarchy → root should be adam with children
   - layoutTree → 211 nodes with x,y coordinates
   - positionSpouses → 30 spouse nodes repositioned
   - computeMarriageBars → ~30 bars
   - computeLinks → ~180 links (211 minus spouses minus root)
   - Print: node count, spine count, spouse count, link count, bar count
```

---

## Batch 4B: SVG Tree Rendering
*Render the tree with react-native-svg. Nodes, links, marriage bars, labels.*

### Prompt for Batch 4B

```
Phase 4B: Render the genealogy tree with react-native-svg.

READ _tools/PHASE_4_PLAN.md (Batch 4B section + Constants).
READ _tools/REACT_NATIVE_PLAN.md §4.2 for implementation spec.

1. CREATE app/src/components/tree/TreeLink.tsx:
   A single parent→child connection line.
   Props: { source: {x,y}, target: {x,y}, isSpine: boolean, dimmed: boolean }
   - Uses react-native-svg <Path> with d3.linkVertical() equivalent:
     M source.x,source.y C source.x,(source.y+target.y)/2 target.x,(source.y+target.y)/2 target.x,target.y
   - Spine links: stroke goldDim, opacity 0.7
   - Satellite links: stroke eraColor, opacity 0.4
   - Dimmed: opacity 0.1

2. CREATE app/src/components/tree/MarriageBar.tsx:
   Horizontal marriage line + double-tick symbol.
   Props: { bar: MarriageBar }
   Render:
   - <Line> from (x1,y) to (x2,y) — goldDim, strokeWidth 1.5
   - <Line> at (midX-3, y-5) to (midX-3, y+5) — left tick
   - <Line> at (midX+3, y-5) to (midX+3, y+5) — right tick
   - All strokes goldDim, opacity 0.5 (or 0.1 if dimmed)

3. CREATE app/src/components/tree/SpouseConnector.tsx:
   Vertical line connecting multiple spouses on the partner side.
   Props: { connector: SpouseConnector }
   - <Line> from (x, yTop) to (x, yBottom) — goldDim, strokeWidth 1.5

4. CREATE app/src/components/tree/TreeNode.tsx:
   A single person node: invisible touch target + visible circle + label.
   Props: { node: LayoutNode, isSpine: boolean, dimmed: boolean,
            onPress: (person: TreePerson) => void }
   Render:
   - <Circle r={18} fill="transparent" /> — invisible 44pt touch target
   - <Circle r={isSpine ? 7 : 5}
       fill={isSpine ? gold : eraColor}
       stroke={isSpine ? goldBright : eraColor}
       strokeWidth={2}
       opacity={dimmed ? 0.25 : 1} />
   - <SvgText
       dy={isSpine ? -12 : -9}
       textAnchor="middle"
       fontSize={isSpine ? 11 : 9.5}
       fill={isSpine ? goldPale : textDim}
       opacity={dimmed ? 0.25 : 1}>
       {node.data.name}
     </SvgText>
   - onPress attached to the invisible circle

5. CREATE app/src/components/tree/TreeCanvas.tsx:
   The SVG container that renders all tree elements.
   Props: { nodes, links, marriageBars, spouseConnectors, filterEra,
            onNodePress, transform: AnimatedTransform }
   Render order (back to front — same as PWA):
   a. Links (TreeLink for each)
   b. Marriage bars (MarriageBar for each)
   c. Spouse connectors (SpouseConnector for each)
   d. Nodes (TreeNode for each)
   All wrapped in an animated <G> that receives the gesture transform.

   Performance: 211 nodes + ~180 links + ~30 bars = ~420 SVG elements.
   This should render smoothly. If not, consider:
   - Windowing (only render nodes within viewport bounds)
   - React.memo on every sub-component with stable keys

6. VERIFY: Render TreeCanvas full-screen with genesis data.
   - Adam visible at centre
   - Spine nodes gold, satellites colored by era
   - Marriage bars visible between spouses
   - Labels readable
   - Print SVG element count
```

---

## Batch 4C: Gesture System (Pinch-to-Zoom + Pan)
*Simultaneous pinch and pan with momentum, zoom bounds, animated transforms.*

### Prompt for Batch 4C

```
Phase 4C: Build the gesture system for pinch-to-zoom and pan.

READ _tools/PHASE_4_PLAN.md (Batch 4C section + Constants).

1. CREATE app/src/hooks/useTreeGestures.ts:
   Custom hook that provides pinch+pan gesture handling for the tree.

   Returns: { gesture: ComposedGesture, animatedTransform: SharedValue }

   Implementation using react-native-gesture-handler v2 + reanimated:

   a. Shared values:
      - scale: SharedValue<number> (initial: 0.45 mobile / 0.75 tablet)
      - translateX: SharedValue<number> (initial: centre on Adam)
      - translateY: SharedValue<number> (initial: top of tree)
      - savedScale, savedTranslateX, savedTranslateY (for gesture start)

   b. Pinch gesture:
      - onBegin: save current scale
      - onUpdate: scale.value = clamp(savedScale * event.scale, 0.15, 3)
      - Focal point: adjust translate so zoom centres on pinch point

   c. Pan gesture:
      - onBegin: save current translate
      - onUpdate: translateX/Y = saved + event.translationX/Y
      - onEnd: apply decay (momentum) using withDecay()
      - requireMinDistance: 5 (avoid triggering on tap)

   d. Compose: Gesture.Simultaneous(pinchGesture, panGesture)
      Both gestures active at the same time (two-finger pinch+drag).

   e. Animated transform string:
      useAnimatedStyle(() => ({
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ]
      }))

   f. animateTo(x, y, targetScale, duration):
      Programmatic animation — used by search-to-node and era-jump.
      translateX.value = withTiming(x, { duration });
      translateY.value = withTiming(y, { duration });
      scale.value = withTiming(targetScale, { duration });

   g. centreOnNode(nodeX, nodeY, viewportWidth, viewportHeight):
      Calculate translate values to centre a specific node in the viewport.
      Account for bio panel width on tablet (available width = W - 340).

2. CREATE app/src/components/tree/GestureTreeView.tsx:
   Wraps TreeCanvas with the gesture detector.
   Props: { children (TreeCanvas), gestures from useTreeGestures }

   ```typescript
   function GestureTreeView({ nodes, links, bars, connectors, filterEra,
                               onNodePress }) {
     const { gesture, animatedStyle, animateTo, centreOnNode }
       = useTreeGestures();

     return (
       <GestureDetector gesture={gesture}>
         <Animated.View style={[{ flex: 1 }, animatedStyle]}>
           <Svg width="100%" height="100%">
             <TreeCanvas nodes={nodes} links={links}
               marriageBars={bars} spouseConnectors={connectors}
               filterEra={filterEra} onNodePress={onNodePress} />
           </Svg>
         </Animated.View>
       </GestureDetector>
     );
   }
   ```

   NOTE: The animated transform may need to be on a <G> element inside
   the SVG rather than the containing View — test both approaches.
   react-native-svg supports animated transforms on <G> via reanimated.

3. VERIFY gestures:
   - Pinch to zoom in (0.15x → 3x range)
   - Pan with one finger
   - Momentum after pan release (withDecay)
   - Simultaneous pinch + pan
   - Zoom stays within bounds (0.15–3)
   - No jank at 211 nodes
```

---

## Batch 4D: Era Filter + Person Search + Animated Navigation
*Era filter bar, person search with auto-centre, jump-to-era.*

### Prompt for Batch 4D

```
Phase 4D: Build era filtering, person search, and animated navigation.

READ _tools/PHASE_4_PLAN.md (Batch 4D section).

1. CREATE app/src/components/tree/EraFilterBar.tsx:
   Horizontal scrollable row of era filter buttons.
   Props: { activeEra: string, onSelect: (era: string) => void }
   - "All" button + one button per era (9 eras)
   - Each button: era name in Cinzel, era color dot
   - Active button: background = era color at 20%, text = era color
   - Tapping a new era:
     a. Sets filterEra → tree re-renders with dimming
     b. Calls jumpToEra() to animate-centre on the visible nodes

2. UPDATE useTreeLayout to accept filterEra and compute dimmed state:
   - Each node gets `dimmed: filterEra !== null && node.data.era !== filterEra && node.data.type !== 'spine'`
   - Spine nodes are NEVER dimmed (always visible for structural context)
   - Links dimmed when both endpoints are dimmed
   - Marriage bars dimmed when both partners are in non-matching eras

3. CREATE app/src/components/tree/PersonSearchBar.tsx:
   Search input for finding people in the tree.
   Props: { people: Person[], onSelect: (personId: string) => void }
   - TextInput with placeholder "Search people..."
   - As user types: filter people by name (case-insensitive startsWith)
   - Show dropdown of matching results (max 8)
   - Each result: name + era badge + role (truncated)
   - Tapping a result:
     a. Calls onSelect(personId)
     b. Clears search input
     c. Parent component calls centreOnNode + showBio

4. jumpToEra(filterEra, nodes, viewportW, viewportH, animateTo):
   Find bounding box of all non-dimmed nodes.
   Compute centroid. Animate to centre on centroid at current zoom scale.
   Duration: 500ms.

5. centreOnPerson(personId, nodes, viewportW, viewportH, animateTo, isMobile):
   Find the node by ID. Compute target translate to centre that node.
   Target scale: 0.65 (mobile) / 0.9 (tablet).
   Account for bio panel width on tablet (availW = W - 340).
   Animate over 550ms. Same logic as PWA's centreOnPerson().

6. VERIFY:
   - Tap "Patriarchal Period" → non-patriarch nodes dim, view centres
   - Tap "All" → all nodes fully visible
   - Search "Abraham" → dropdown shows result → tap → tree zooms to Abraham
   - Search "Rachel" → tap → tree zooms, bio opens
```

---

## Batch 4E: Bio Panel + PersonDetailScreen + GenealogyTreeScreen Assembly
*The bio sidebar/bottom-sheet, full person detail screen, and the main screen.*

### Prompt for Batch 4E

```
Phase 4E: Build the bio panel, PersonDetailScreen, and assemble
GenealogyTreeScreen.

READ _tools/PHASE_4_PLAN.md (Batch 4E section + Data Model).
READ _tools/REACT_NATIVE_PLAN.md §4.2-4.3 for feature parity checklist.

1. UPDATE app/src/components/PersonSidebar.tsx:
   (Full implementation — replace Phase 2E placeholder)
   On phone: @gorhom/bottom-sheet, snapPoints: ['45%', '85%']
   On tablet: fixed-width sidebar (340px) on the right side

   Content (matching PWA's showBio):
   a. Era badge: pill with era color bg + era name text
   b. Name: displayLg
   c. Dates: bodySm, textDim
   d. Divider line
   e. Role: bodyMd, gold
   f. Family block:
      - Parents row: "Father" / "Parents" label + tappable name links
      - Spouse(s) row: "Spouse" / "Spouses" label + tappable name links
      - Children row: "Child" / "Children" label + tappable name links
      Family links: TouchableOpacity with era-colored text + border.
      Tapping a family link: calls onNavigate(personId) which:
        - Updates selectedPerson to the tapped person
        - Animates tree to centre on that person
        - This creates the "chaining" effect (tap Father → HIS bio → HIS father)
   g. Bio text: bodyMd, the full biography paragraph
   h. Scripture Role section (if scriptureRole is set — 60 people):
      "Role in Scripture" header + text
   i. Key References (all 211 people have refs):
      Row of BadgeChips, each a tappable scripture reference
   j. Chapter link (if chapter is set — 71 people):
      "Read in Scripture Deep Dive →" link → navigates to ChapterScreen

   Props: { person, onClose, onNavigate: (personId) => void }

2. UPDATE app/src/screens/PersonDetailScreen.tsx:
   (Full implementation — replace Phase 2E placeholder)
   Full-page version of the bio content (same data, different layout).
   Reached from: PeoplePanel in chapters, search results, explore menu.
   Has a "See on Family Tree" button that navigates to GenealogyTreeScreen
   with personId param → tree opens centred on that person.

3. UPDATE app/src/screens/GenealogyTreeScreen.tsx:
   (Full implementation — replace Phase 2E placeholder)

   ```typescript
   export default function GenealogyTreeScreen({ route }) {
     const initialPersonId = route.params?.personId;
     const { people } = usePeople();
     const [filterEra, setFilterEra] = useState<string>('all');
     const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

     const { nodes, links, marriageBars, spouseConnectors, spineIds }
       = useTreeLayout(people, filterEra);

     const { gesture, animatedStyle, centreOnNode } = useTreeGestures();

     // Deep-link: if initialPersonId provided, centre on that person
     useEffect(() => {
       if (initialPersonId && people.length) {
         const person = people.find(p => p.id === initialPersonId);
         if (person) {
           setSelectedPerson(person);
           // Delay to let layout complete
           setTimeout(() => centreOnPerson(initialPersonId, ...), 100);
         }
       }
     }, [initialPersonId, people]);

     const handleNodePress = (person: TreePerson) => {
       setSelectedPerson(person);
       centreOnNode(nodeX, nodeY, ...);
     };

     const handleFamilyNavigate = (personId: string) => {
       const person = people.find(p => p.id === personId);
       if (person) {
         setSelectedPerson(person);
         centreOnPerson(personId, ...);
       }
     };

     return (
       <View style={{ flex: 1, backgroundColor: colors.bg }}>
         <EraFilterBar activeEra={filterEra} onSelect={setFilterEra} />
         <PersonSearchBar people={people} onSelect={(id) => {
           handleFamilyNavigate(id);
         }} />

         <GestureTreeView nodes={nodes} links={links}
           bars={marriageBars} connectors={spouseConnectors}
           filterEra={filterEra} onNodePress={handleNodePress}
           gesture={gesture} animatedStyle={animatedStyle} />

         {selectedPerson && (
           <PersonSidebar person={selectedPerson}
             onClose={() => setSelectedPerson(null)}
             onNavigate={handleFamilyNavigate} />
         )}
       </View>
     );
   }
   ```

4. VERIFY full feature parity with people.html:
   - [ ] 211 nodes render (count SVG elements)
   - [ ] Spine nodes are gold, r=7, 11px labels
   - [ ] Satellite nodes are era-colored, r=5, 9.5px labels
   - [ ] Spouse nodes positioned at x+88 from partner
   - [ ] Jacob has 4 wives staggered vertically
   - [ ] Marriage bars with double-tick symbols
   - [ ] Multi-spouse vertical connector visible (e.g., Jacob)
   - [ ] Pinch-to-zoom: 0.15x–3x range
   - [ ] Pan with momentum
   - [ ] Tap node → bio opens with name, dates, role, family links
   - [ ] Tap family link → bio updates + tree animates to new person
   - [ ] Family link chaining: Father → Father → Father works
   - [ ] Era filter: "Patriarchal Period" → non-patriarch nodes dim
   - [ ] Spine always visible when era filtered
   - [ ] Era filter + jump-to-era centres view on visible nodes
   - [ ] Search "Abraham" → dropdown → tap → zoom to Abraham + bio opens
   - [ ] Deep link: navigate from ChapterScreen PeoplePanel → tree opens on person
   - [ ] Touch targets: 44pt minimum (r=18 invisible circle)
   - [ ] Scripture refs in bio are tappable (BadgeChip → CrossRefPopup)
   - [ ] "Read in Scripture Deep Dive →" link navigates to chapter
   - [ ] Phone: bio as bottom sheet. Tablet: bio as sidebar.
   - [ ] Initial load centres on Adam
   - [ ] 60 FPS zoom/pan with 211 nodes
```

---

## Batch Summary

| Batch | Description | Components | Tool calls |
|-------|-------------|-----------|-----------|
| **4A** | Tree data layer: hierarchy builder, layout, spine computation, spouse positioning, marriage bars, links | 2 files (treeBuilder.ts + useTreeLayout.ts) | ~10 |
| **4B** | SVG rendering: TreeNode, TreeLink, MarriageBar, SpouseConnector, TreeCanvas | 5 components | ~10 |
| **4C** | Gesture system: useTreeGestures hook, GestureTreeView wrapper, pinch+pan+momentum | 2 files | ~8 |
| **4D** | Era filter bar, person search, jumpToEra, centreOnPerson | 3 components + 2 functions | ~10 |
| **4E** | PersonSidebar (full), PersonDetailScreen (full), GenealogyTreeScreen assembly, feature parity verification | 3 screens/components | ~12 |

**Total: 5 batches, ~50 tool calls, targeting 2-3 sessions.**

**Dependency graph:**
```
4A ──→ 4B ──→ 4C ──→ 4D ──→ 4E
```

Linear chain — each batch builds on the previous. 4A (pure math) is a prerequisite for 4B (rendering). 4C (gestures) wraps 4B. 4D (search/filter) adds interactive features. 4E (bio + assembly) brings it all together.

---

## Session Planning

**Session 1:** Batches 4A + 4B (data layer + SVG rendering)
**Session 2:** Batches 4C + 4D (gestures + search/filter)
**Session 3:** Batch 4E (bio panel + screen assembly + full verification)

---

## Verification Checklist (run after Phase 4 is complete)

- [ ] computeSpineIds returns ~25-30 IDs (Adam→Jesus chain)
- [ ] buildHierarchy produces tree rooted at Adam
- [ ] layoutTree positions 211 nodes with valid x,y coordinates
- [ ] positionSpouses moves 30 spouse nodes to x+88 from partners
- [ ] Multi-spouse staggering works (Jacob test case)
- [ ] computeMarriageBars produces ~30 bars with correct coordinates
- [ ] computeSpouseConnectors produces vertical lines for multi-spouse partners
- [ ] computeLinks produces ~180 parent→child links
- [ ] TreeNode renders spine (gold, r=7) and satellite (era color, r=5) correctly
- [ ] TreeLink renders spine links (gold) and satellite links (era color) correctly
- [ ] MarriageBar renders horizontal line + double-tick symbol
- [ ] TreeCanvas renders all 211 nodes, ~180 links, ~30 bars without jank
- [ ] Pinch-to-zoom works: 0.15x to 3x range
- [ ] Pan works with momentum (withDecay)
- [ ] Simultaneous pinch + pan works
- [ ] EraFilterBar shows "All" + 9 eras, toggles correctly
- [ ] Era filtering dims non-matching nodes to 25% opacity
- [ ] Spine nodes never dim during era filtering
- [ ] jumpToEra animates view to centroid of visible nodes
- [ ] PersonSearchBar filters by name, shows dropdown, selects correctly
- [ ] centreOnPerson animates to selected node at comfortable zoom
- [ ] PersonSidebar shows: era badge, name, dates, role, family block, bio, refs, chapter link
- [ ] Family link tapping chains: Father → his bio → HIS father
- [ ] PersonDetailScreen shows full-page bio with "See on Family Tree" button
- [ ] Deep link: GenealogyTreeScreen({ personId: 'abraham' }) centres on Abraham
- [ ] Initial view centres on Adam at 0.45x (phone) / 0.75x (tablet)
- [ ] Phone: bio as bottom sheet. Tablet: bio as fixed sidebar (340px)
- [ ] 44pt touch targets on all nodes
- [ ] Zoom/pan at 60 FPS
- [ ] Scripture refs in bio tappable → CrossRefPopup
- [ ] "Read in Scripture Deep Dive →" navigates to correct chapter
