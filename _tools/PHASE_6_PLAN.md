# Phase 6: Remaining Feature Screens — Implementation Plan

## Overview

**Goal:** Build ALL remaining screens that are still placeholders from Phase 2E. This includes not just the four feature areas listed in the RN plan (Timeline, Word Study, Synoptic, Scholars) but also six navigation/utility screens that nothing else has built: HomeScreen, BookListScreen, ChapterListScreen, ExploreMenuScreen, SearchScreen, SettingsScreen.

**Total screens to build: 12** (not 6 as the RN plan suggests).

**Dependencies:** Phases 2–5 complete. All data hooks, design tokens, panel components, ChapterScreen, GenealogyTree, and MapScreen are built.

### Screen inventory — what's built vs. placeholder

| Screen | Built in | Status |
|--------|----------|--------|
| ChapterScreen | Phase 3 | ✅ Full |
| BookIntroScreen | Phase 3 (deep-scroll) | ✅ Full |
| GenealogyTreeScreen | Phase 4 | ✅ Full |
| PersonDetailScreen | Phase 4 | ✅ Full |
| MapScreen | Phase 5 | ✅ Full |
| **HomeScreen** | Phase 2E placeholder | ❌ Needs build |
| **BookListScreen** | Phase 2E placeholder | ❌ Needs build |
| **ChapterListScreen** | Phase 2E placeholder | ❌ Needs build |
| **ExploreMenuScreen** | Phase 2E placeholder | ❌ Needs build |
| **SearchScreen** | Phase 2E placeholder | ❌ Needs build |
| **SettingsScreen** | Phase 2E placeholder | ❌ Needs build |
| **TimelineScreen** | Phase 2E placeholder | ❌ Needs build |
| **WordStudyBrowseScreen** | Phase 2E placeholder | ❌ Needs build |
| **WordStudyDetailScreen** | Phase 2E placeholder | ❌ Needs build |
| **ParallelPassageScreen** | Phase 2E placeholder | ❌ Needs build |
| **ScholarBrowseScreen** | Phase 2E placeholder | ❌ Needs build |
| **ScholarBioScreen** | Phase 2E placeholder | ❌ Needs build |

---

## Data Audit Summary

### Timeline (216 events)
- **Source:** `timeline-data.js` (73KB) → SQLite via Phase 0
- **Events:** 216 across 9 eras (NT:49, Exodus:30, Patriarch:25, Judges:21, Prophets:16, Primeval:14, Exile:14, Kingdom:12, Intertestamental:5)
- **Year range:** -4000 (Creation) to +105 (John on Patmos)
- **Event fields:** id, era, name, year, ref, chapter (link), people[] (IDs), summary
- **Layout:** Non-linear scale via SCALE_BREAKPOINTS (10 breakpoints mapping year→x pixel position). TOTAL_WIDTH=9000 virtual pixels.
- **Scale breakpoints:** `[[-4000,0],[-2200,1400],[-1800,2000],[-1400,2800],[-1050,3700],[-930,4100],[-722,4780],[-432,6500],[0,8000],[95,9000]]`
- **Rendering:** era-colored background bands, horizontal axis with tick marks, events placed in 12 swim lanes using greedy assignment (avoid label overlap), detail panel on tap
- **Interaction:** horizontal pan + pinch-to-zoom, jumpToEra (animate to era centroid)
- **Deep-link:** `navigate('Timeline', { eventId })` centres on that event

### Word Studies (15 entries)
- **Source:** `word-study.js` (17KB) → SQLite `word_studies` table
- **Fields:** id, language (hebrew/greek), original (Unicode), transliteration, strongs, glosses[], range, note, occurrences[]
- **Browse page:** grid/list view, filter by language (All/Hebrew/Greek), search by transliteration/gloss
- **Detail page:** full lexicon card with all fields, tappable occurrence refs

### Synoptic/Parallel Passages (45 entries)
- **Source:** `synoptic-map.js` (10KB) → SQLite `synoptic_map` table
- **Fields:** id, title, category (gospel, gospel-luke, gospel-john, ot-parallel), passages[{book, ref}]
- **Category labels:** Synoptic Gospels, Luke Special, John Special, OT Parallels
- **Browse:** filterable list by category, searchable
- **Compare view:** side-by-side columns showing resolved verse text per Gospel, synced scroll

### Scholars (43 entries)
- **Source:** `scholar-data.js` (21KB) + `scholar-bios.json` → SQLite `scholars` table
- **Data fields:** key, name, color, scope (books covered), tradition, desc
- **Bio fields:** eyebrow, name, tradition, sections[{title, body}], other scholars grid
- **Bio sections:** Biography, Interpretive Approach, Theological Tradition, Key Works, Appears In
- **Browse:** grid of 43 cards, filterable by tradition/era
- **Bidirectional:** scholar bio → chapter panel, chapter ScholarTag → scholar bio

### SearchEngine (3KB)
- **Functions:** searchChapters, searchVerses, searchPeople, search (unified)
- **Native equivalent:** SQLite FTS5 on verses table + people table + direct queries on books/chapters

---

## Batch 6A: HomeScreen + BookListScreen + ChapterListScreen
*The navigation spine — how users get to chapters.*

### Prompt for Batch 6A

```
Phase 6A: Build HomeScreen, BookListScreen, and ChapterListScreen.

READ _tools/PHASE_6_PLAN.md (Batch 6A section).
READ _tools/REACT_NATIVE_PLAN.md §2.4 for the HomeScreen spec.

1. UPDATE app/src/screens/HomeScreen.tsx (full implementation):
   a. Hero section: app name "Scripture Deep Dive" in Cinzel displayLg,
      tagline in bodyMd italic, dark background with subtle gold gradient
   b. "Continue Reading" section:
      - useRecentChapters(5) hook
      - Horizontal row of tappable chips: "Genesis 12", "Isaiah 6", etc.
      - Each chip: book name + chapter number, gold border
      - Tap → navigate to ChapterScreen with bookId + chapterNum
      - Hidden if no reading history
   c. Inline search bar:
      - TextInput with "Search verses, people..." placeholder
      - useSearch(query) hook with debounce
      - Results render INLINE below the search bar (not navigation to SearchTab)
      - Mixed results: verse matches (book + chapter + text preview) +
        people matches (name + era badge + role)
      - Tap verse → ChapterScreen. Tap person → PersonDetailScreen.
      - Collapse results when query cleared
   d. Book grid with OT/NT toggle:
      - Two toggle buttons: "Old Testament" / "New Testament"
      - useBooks() hook filtered by testament
      - Each book: tappable row with book name (Cinzel) + chapter count
        + "LIVE" BadgeChip if is_live=true
      - Tap book row → navigate to ChapterListScreen with bookId
      - Books with is_live=false: textMuted, no badge, still tappable
        (ChapterListScreen shows all chapters but marks unlive ones)
   e. Footer: "Scripture Deep Dive" + version + "About" link

2. UPDATE app/src/screens/BookListScreen.tsx (full implementation):
   a. Header: "Library" in displayLg
   b. OT/NT section headers (collapsible)
   c. Book cards: name, chapter count, LIVE badge, tradition grouping
      (Law, History, Poetry, Prophets for OT; Gospels, Acts, Epistles,
      Apocalypse for NT)
   d. Tap book → navigate to ChapterListScreen

3. UPDATE app/src/screens/ChapterListScreen.tsx (full implementation):
   a. Header: book name in displayLg
   b. "About This Book" link → BookIntroScreen
   c. Chapter number grid: flexWrap of numbered buttons (1, 2, 3, ...)
      - Live chapters: gold text, tappable → ChapterScreen
      - Non-live chapters: textMuted, disabled
      - Grid button size: 44x44 (accessibility)
   d. Chapter count summary: "50 chapters · 30 live"

4. VERIFY:
   - HomeScreen → Continue Reading shows last 5 chapters
   - Search "Abraham" → mixed results (verse + person)
   - Tap OT toggle → books list filtered
   - Tap "Genesis" → ChapterListScreen → 50 chapter buttons
   - Tap chapter 1 → ChapterScreen opens
   - BookListScreen → scrollable list of all 66 books
```

---

## Batch 6B: ExploreMenuScreen + SearchScreen + SettingsScreen
*The utility screens — explore launcher, full search, app settings.*

### Prompt for Batch 6B

```
Phase 6B: Build ExploreMenuScreen, SearchScreen, and SettingsScreen.

READ _tools/PHASE_6_PLAN.md (Batch 6B section).

1. UPDATE app/src/screens/ExploreMenuScreen.tsx (full implementation):
   Grid of 6 feature cards (2 columns):
   a. "People" — genealogy tree icon — → GenealogyTreeScreen
   b. "Map" — map pin icon — → MapScreen
   c. "Timeline" — clock icon — → TimelineScreen
   d. "Parallel Passages" — columns icon — → ParallelPassageScreen
   e. "Word Studies" — book icon — → WordStudyBrowseScreen
   f. "Scholars" — mortarboard icon — → ScholarBrowseScreen

   Each card: icon (Lucide), title (Cinzel displaySm), subtitle
   (1-line description, bodySm), gold border on hover/press.
   Background: bgElevated. Responsive: 3 columns on tablet.

2. UPDATE app/src/screens/SearchScreen.tsx (full implementation):
   Full-featured search (more comprehensive than HomeScreen inline search).
   a. Large TextInput with auto-focus
   b. useSearch(query) with debounce (300ms)
   c. Result sections (separated by headers):
      - "Verses" — FTS5 matches with highlighted query terms
        Each result: book + chapter:verse + text snippet
        Tap → ChapterScreen
      - "People" — name + era badge + role
        Tap → PersonDetailScreen
      - "Word Studies" — original + transliteration + gloss
        Tap → WordStudyDetailScreen
      - "Books" — matching book names
        Tap → ChapterListScreen
   d. Empty state: "Search verses, people, and more..."
   e. Recent searches (stored in user_preferences): last 5 queries
   f. Clear button, keyboard avoidance

3. UPDATE app/src/screens/SettingsScreen.tsx (full implementation):
   a. Translation preference:
      - "Default Translation" row → toggle between NIV and ESV
      - Uses settingsStore
   b. Font size:
      - Slider (12–24pt) with live preview text
      - Uses settingsStore.fontSize
   c. VHL toggle:
      - "Verse Highlighting" switch
      - Uses settingsStore.vhlEnabled
   d. About section:
      - App version, build number
      - "Scripture Deep Dive" description
      - "Authorship & Methodology" → AuthorshipSheet
      - Credits / acknowledgements
   e. Data section:
      - "Export Notes" → generates JSON of all user_notes
      - "Clear Reading History" → clears reading_progress table (with confirm)

4. VERIFY:
   - ExploreMenuScreen shows 6 cards, each navigates correctly
   - SearchScreen: search "covenant" → verse results + word study result
   - SearchScreen: search "Moses" → person result + verse results
   - SettingsScreen: toggle NIV↔ESV, change font size, see preview
```

---

## Batch 6C: TimelineScreen (Standalone)
*The most complex screen in Phase 6. 216 events, proportional SVG, pan+zoom, detail panel.*

### Prompt for Batch 6C

```
Phase 6C: Build the standalone TimelineScreen with full interactivity.

READ _tools/PHASE_6_PLAN.md (Batch 6C section + Timeline data audit).
READ _tools/REACT_NATIVE_PLAN.md §6.1-6.2 for the spec.

The timeline is a horizontally scrollable SVG canvas (9000 virtual pixels
wide) with era-colored bands, proportionally positioned events, swim-lane
label assignment, and a detail panel.

1. CREATE app/src/utils/timelineLayout.ts:
   Pure layout math — no rendering.

   a. SCALE_BREAKPOINTS: const array matching the PWA exactly:
      [[-4000,0],[-2200,1400],[-1800,2000],[-1400,2800],
       [-1050,3700],[-930,4100],[-722,4780],[-432,6500],[0,8000],[95,9000]]
      TOTAL_WIDTH = 9000

   b. yearToX(year: number): number
      Piecewise linear interpolation across SCALE_BREAKPOINTS.
      Returns x position (0–9000) for any year in range.

   c. ERA_RANGES: { primeval:[-4000,-2200], patriarch:[-2200,-1800], ... }

   d. assignLanes(events: TimelineEvent[], laneCount: number): PositionedEvent[]
      Greedy lane assignment algorithm (matching PWA's drawEvents):
      - Sort events by yearToX(year)
      - For each event: compute label width from name length
      - Place in first lane where left edge clears previous right edge + gap
      - If no lane has room: place in the lane with earliest right edge
      Returns each event with x, y (lane index), labelWidth.

   e. formatYear(year: number): string
      -4000 → "4000 BC", 0 → "AD·BC", 33 → "AD 33", 95 → "AD 95"

   f. computeTickMarks(): { x: number, label: string, major: boolean }[]
      Returns the tick mark array matching the PWA's exact tick positions
      (major at every 500 years + year 0 + year 33).

2. CREATE app/src/components/timeline/TimelineSVG.tsx:
   The shared SVG component used in BOTH TimelineScreen AND the in-chapter
   tl panel (Phase 3D). This is the core renderer.

   Props: { events: PositionedEvent[], eraRanges, ticks, width: number,
            height: number, highlightEventId?: string,
            onEventPress: (event) => void }

   Render (using react-native-svg):
   a. Era background bands:
      For each era: <Rect x={yearToX(start)} width={yearToX(end)-yearToX(start)}
        y={ERA_BAR_Y} height={ERA_BAR_H} fill={eraColor} opacity={0.75} />
      Era name label centred in each band (Cinzel 15px white)

   b. Horizontal axis line:
      <Line x1={0} y1={AXIS_Y} x2={TOTAL_WIDTH} y2={AXIS_Y} stroke="#3a2808" />

   c. Tick marks + year labels:
      Major ticks: height 14, strokeWidth 2
      Minor ticks: height 8, strokeWidth 1
      Year labels below axis in Cinzel

   d. Event markers:
      For each positioned event:
      - Vertical stem line from lane y to axis
      - Circle at lane y (era-colored, r=4)
      - Label text: "Event Name · 2000 BC" (Cinzel, era-colored)
      - Highlighted event: gold glow circle behind, slightly larger
      - Tappable: onPress → onEventPress

   e. All wrapped in a <G> that receives animated transform for pan/zoom

3. CREATE app/src/components/timeline/TimelineDetailPanel.tsx:
   Detail card shown when an event is tapped.
   Props: { event: TimelineEvent, onClose, onChapterPress, onPersonPress }
   Content (matching PWA's showDetail):
   a. Era badge (era color)
   b. Event name (displayLg)
   c. Date (formatYear)
   d. Scripture reference (tappable → CrossRefPopup)
   e. Summary text (bodyMd)
   f. People chips (tappable → PersonSidebar)
   g. "Read in Scripture Deep Dive →" chapter link
   Rendered as @gorhom/bottom-sheet on phone, sidebar on tablet.

4. UPDATE app/src/screens/TimelineScreen.tsx (full implementation):
   a. EraFilterBar (reuse from Phase 4)
   b. Horizontal pan + pinch-to-zoom gesture (similar to tree gestures):
      - Pan: translateX shared value with withDecay momentum
      - Pinch: scale shared value, clamped (0.3–3)
      - Animate the <G> transform in TimelineSVG
   c. jumpToEra: animate translateX to centre on the filtered era
   d. Deep-link: route.params?.eventId → centre on that event, open detail
   e. TimelineSVG fills the screen
   f. TimelineDetailPanel as bottom sheet / sidebar

5. VERIFY:
   - 216 events render across the full 9000px width
   - Era bands coloured correctly (9 distinct colors)
   - Events positioned proportionally (Patriarchs compressed vs NT expanded)
   - Swim-lane assignment: no label overlaps
   - Pan left/right with momentum
   - Pinch-to-zoom works
   - Tap event → detail panel with name, date, summary, people, chapter link
   - Era filter "NT" → only NT events visible (or all dimmed except NT)
   - Deep-link: navigate('Timeline', { eventId: 'creation' }) → centres on creation
   - formatYear: -4000 → "4000 BC", 33 → "AD 33"
```

---

## Batch 6D: Word Study Browse + Detail
*15 lexicon entries with Hebrew/Greek filtering, search, full detail view.*

### Prompt for Batch 6D

```
Phase 6D: Build WordStudyBrowseScreen and WordStudyDetailScreen.

READ _tools/PHASE_6_PLAN.md (Batch 6D section + Word Study data audit).

1. UPDATE app/src/screens/WordStudyBrowseScreen.tsx (full implementation):
   a. Search bar: filter by transliteration or gloss text
   b. Language filter: "All" / "Hebrew" / "Greek" toggle buttons
   c. FlatList of word study entries:
      Each row: original script (large, accent color: pink Hebrew / blue Greek)
        → transliteration (italic, gold-dim)
        → primary gloss (gold, bold)
        → Strongs number (uiSm, textMuted)
   d. Tap row → navigate to WordStudyDetailScreen
   e. 15 entries total — no pagination needed

2. UPDATE app/src/screens/WordStudyDetailScreen.tsx (full implementation):
   Full lexicon card for a single word.
   a. Original script: large (28pt), accent color
   b. Transliteration: italic, gold-dim
   c. Strongs number: badge
   d. Glosses: horizontal row of BadgeChips (one per gloss)
   e. Semantic range: bodyMd paragraph
   f. Theological note: bodyMd paragraph
   g. Occurrences: list of tappable scripture references
      - Each ref: BadgeChip → tap opens CrossRefPopup with verse text
   h. "Back to all words" navigation

   This is the same content as the WordStudyPopup (Phase 3H) but
   in a full-screen layout with more room for the occurrence list.

3. VERIFY:
   - Browse screen: 15 entries render
   - Filter "Hebrew" → only Hebrew entries shown
   - Search "covenant" → matches "ḥesed" entry
   - Tap entry → detail screen with full lexicon card
   - Occurrence refs tappable → CrossRefPopup
```

---

## Batch 6E: Parallel Passage / Synoptic Screen
*45 parallel passage sets, side-by-side comparison, synced scroll.*

### Prompt for Batch 6E

```
Phase 6E: Build ParallelPassageScreen with browse and compare views.

READ _tools/PHASE_6_PLAN.md (Batch 6E section + Synoptic data audit).

1. UPDATE app/src/screens/ParallelPassageScreen.tsx (full implementation):
   TWO MODES: browse (list of 45 entries) and compare (side-by-side text).

   a. BROWSE MODE (default):
      - Category filter: "All" / "Synoptic Gospels" / "Luke Special" /
        "John Special" / "OT Parallels" toggle buttons
      - Search bar: filter by passage title
      - FlatList of 45 entries:
        Each row: title (e.g., "The Baptism of Jesus")
          → passage refs listed below (Matt 3:13-17, Mark 1:9-11, etc.)
          → number of Gospel columns
      - Tap row → switch to COMPARE MODE for that entry

   b. COMPARE MODE:
      On phone (width < 768): TABBED view
        - Swipeable tabs: one tab per Gospel in the passage set
        - Each tab: resolved verse text (from SQLite) in bodyLg
        - Tab headers: "Matthew", "Mark", "Luke", "John"
        - Only tabs for Gospels that have this passage (2-4 tabs)

      On tablet (width >= 768): SIDE-BY-SIDE columns
        - 2-4 columns, each showing one Gospel's verse text
        - ScrollView with synced scroll position:
          when user scrolls one column, others scroll to match
          (use ScrollView onScroll + scrollTo refs)
        - Column headers: Gospel name + reference

      Unique-word highlighting: words that appear in one Gospel
      but NOT in the others are highlighted in gold. This shows
      each Gospel's distinctive contributions.
      Algorithm: for each word in each column, check if it appears
      in ALL other columns. If not → highlighted.

   c. Navigation: reachable from ExploreMenuScreen AND from ChapterScreen
      (via route params if a parallel passage is detected for the current chapter).

2. VERIFY:
   - Browse: 45 entries in list
   - Filter "Synoptic Gospels" → subset shown
   - Tap "The Baptism of Jesus" → compare view with 4 Gospels
   - Phone: tabbed view, swipe between Matthew/Mark/Luke/John
   - Tablet: side-by-side columns with synced scroll
   - Unique words highlighted in gold
   - Back button returns to browse mode
```

---

## Batch 6F: Scholar Browse + Bio Screens
*43 scholars, filterable grid, full bio with sections and cross-links.*

### Prompt for Batch 6F

```
Phase 6F: Build ScholarBrowseScreen and ScholarBioScreen.

READ _tools/PHASE_6_PLAN.md (Batch 6F section + Scholar data audit).

1. UPDATE app/src/screens/ScholarBrowseScreen.tsx (full implementation):
   a. Search bar: filter by scholar name
   b. Tradition filter: horizontal scrollable chips for distinct traditions
      (Evangelical, Reformed, Jewish Academic, Literary Criticism,
      Historical-Critical, Patristic, etc.)
   c. Grid of 43 scholar cards (2 columns phone, 3 columns tablet):
      Each card:
      - Scholar name in scholar's color (Cinzel displaySm)
      - Tradition badge (uiSm, textDim)
      - Scope: "Genesis–Deuteronomy" or "All books" (bodySm)
      - Left border: 3px in scholar's color
      - Background: scholar's color at 8% opacity
   d. Tap card → navigate to ScholarBioScreen

2. UPDATE app/src/screens/ScholarBioScreen.tsx (full implementation):
   Full bio page matching the PWA's commentators/*.html structure.
   a. Header area:
      - Scholar name (displayLg, scholar's color)
      - Tradition (bodyMd, textDim)
      - Eyebrow text (bodySm, italic)
   b. Bio sections (from bio_json.sections array):
      Each section: title (displaySm) + body paragraphs (bodyMd)
      Standard sections: Biography, Interpretive Approach,
      Theological Tradition, Key Works, Appears In
   c. "Appears In" section:
      List of books where this scholar has commentary panels.
      Each book: tappable → navigate to ChapterListScreen for that book.
      Derived from scholar.scope_json.
   d. "Other Scholars" grid at bottom:
      Grid of other scholar cards (excluding current) — same card
      component as ScholarBrowseScreen. Tap → navigate to their bio.
   e. Scholar dropdown nav (matching PWA):
      A dropdown at the top to quickly jump to any other scholar's bio
      without going back to the browse screen.

3. WIRE BIDIRECTIONAL NAVIGATION:
   a. ScholarTag (built in Phase 3B) → tapping opens ScholarInfoSheet
      → "See full bio" → ScholarBioScreen
   b. ScholarBioScreen "Appears In" → ChapterListScreen → ChapterScreen
      → CommentaryPanel shows that scholar's notes
   c. ScholarInfoSheet (Phase 3H) already has "See full bio" link —
      ensure it navigates to ScholarBioScreen with scholarId param.

4. VERIFY:
   - Browse: 43 scholars in grid
   - Filter by "Evangelical" → subset shown
   - Search "MacArthur" → matches
   - Tap MacArthur → bio page with 5 sections
   - "Appears In" shows books (e.g., "All books")
   - "Other Scholars" grid shows 42 other scholars
   - Dropdown nav → jump to Calvin bio → back to MacArthur
   - ScholarTag in chapter panel → ScholarInfoSheet → "See full bio" → bio page
```

---

## Batch Summary

| Batch | Description | Screens | Tool calls |
|-------|-------------|---------|-----------|
| **6A** | HomeScreen (hero, continue reading, search, book grid), BookListScreen, ChapterListScreen | 3 | ~12 |
| **6B** | ExploreMenuScreen, SearchScreen (full FTS5), SettingsScreen | 3 | ~10 |
| **6C** | TimelineScreen (216 events, SVG, pan+zoom, detail panel, deep-link), TimelineSVG component, TimelineDetailPanel, timelineLayout utils | 1 screen + 3 components | ~14 |
| **6D** | WordStudyBrowseScreen, WordStudyDetailScreen | 2 | ~6 |
| **6E** | ParallelPassageScreen (browse + compare, tabbed/side-by-side, synced scroll, unique-word highlight) | 1 | ~10 |
| **6F** | ScholarBrowseScreen, ScholarBioScreen (full bio, other scholars grid, dropdown nav, bidirectional wiring) | 2 | ~10 |

**Total: 6 batches, ~62 tool calls, targeting 3 sessions.**

**Dependency graph:**
```
6A ──→ 6B ──┐
             ├──→ (all independent from here)
6C ──────────┤
6D ──────────┤
6E ──────────┤
6F ──────────┘
```

6A and 6B must come first (HomeScreen provides navigation entry to everything). 6C/6D/6E/6F are independent of each other — any order works after 6B.

---

## Session Planning

**Session 1:** Batches 6A + 6B (navigation spine + utility screens)
**Session 2:** Batch 6C (timeline — complex, needs its own session)
**Session 3:** Batches 6D + 6E + 6F (word study + synoptic + scholars)

---

## Verification Checklist (run after Phase 6 is complete)

**Navigation screens:**
- [ ] HomeScreen: hero, continue reading chips (last 5), inline search, book grid with OT/NT toggle
- [ ] HomeScreen: search "Abraham" → mixed verse + people results inline
- [ ] BookListScreen: 66 books organized by testament and tradition group
- [ ] ChapterListScreen: chapter grid with live/unlive distinction, "About This Book" link
- [ ] ExploreMenuScreen: 6 feature cards, each navigates correctly
- [ ] SearchScreen: FTS5 search across verses, people, word studies, books
- [ ] SearchScreen: recent search history (last 5 queries)
- [ ] SettingsScreen: translation toggle, font size slider, VHL toggle, about, export notes

**Timeline:**
- [ ] 216 events render across 9000px width
- [ ] Era bands (9 eras) with correct colors
- [ ] Proportional positioning via SCALE_BREAKPOINTS
- [ ] Swim-lane assignment: no label overlaps
- [ ] Horizontal pan with momentum + pinch-to-zoom
- [ ] Tap event → detail panel (name, date, summary, people chips, chapter link)
- [ ] Era filter → jumpToEra animation
- [ ] Deep-link: eventId param → centres on event
- [ ] In-chapter tl panel uses same TimelineSVG component

**Word Studies:**
- [ ] Browse: 15 entries with original script, transliteration, gloss
- [ ] Filter by Hebrew/Greek
- [ ] Search by transliteration or gloss
- [ ] Detail: full lexicon card with occurrences (tappable refs)

**Parallel Passages:**
- [ ] Browse: 45 entries filterable by category
- [ ] Compare: phone = tabbed, tablet = side-by-side columns
- [ ] Synced scroll in side-by-side mode
- [ ] Unique-word highlighting (gold for distinctive words)

**Scholars:**
- [ ] Browse: 43 scholars in grid, filterable by tradition
- [ ] Bio: 5 sections, "Appears In" with book links, "Other Scholars" grid
- [ ] Dropdown nav between scholar bios
- [ ] Bidirectional: ScholarTag → ScholarInfoSheet → ScholarBioScreen → ChapterScreen

**All screens:**
- [ ] No Phase 2E placeholder screens remain
- [ ] Every screen from §2.4 screen hierarchy is fully implemented
- [ ] Dark theme consistent across all screens
- [ ] Accessibility labels on all interactive elements
- [ ] Tablet-responsive layouts where specified
