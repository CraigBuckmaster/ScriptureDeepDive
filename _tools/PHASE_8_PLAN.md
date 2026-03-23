# Phase 8: Testing & Polish — Implementation Plan

## Overview

**Goal:** Systematically test every layer of the app (unit → component → integration → E2E), hit every performance target, complete the accessibility audit, and polish every visual edge case before store submission.

**Dependencies:** Phases 2–7 complete. All screens, components, and features fully implemented.

**Scale of what needs testing:**
- ~141 testable items (utilities, hooks, components, screens, modals)
- 21 screens + 8 modals
- 17 panel types + 42 scholar variations
- 28 E2E user flows
- 7 performance targets
- ~20 polish items

**Testing tools (installed in Phase 2A):**
- **Jest** — unit tests + component tests
- **React Native Testing Library (RNTL)** — component rendering + interaction tests
- **Maestro** — E2E device flows (YAML-based, no flaky selectors)
- **Accessibility Inspector** (Xcode) + **TalkBack** (Android) — manual audit
- **React DevTools + Flipper** — performance profiling

**Strategy:** This phase does NOT write code for new features. It writes tests, finds bugs, fixes them, and polishes. Every batch produces test files that live permanently in the repo.

---

## Test File Structure

```
app/
  __tests__/
    unit/
      verseResolver.test.ts
      referenceParser.test.ts
      panelLabels.test.ts
      treeBuilder.test.ts
      timelineLayout.test.ts
      geoMath.test.ts
    integration/
      database.test.ts
      contentQueries.test.ts
      userQueries.test.ts
      searchEngine.test.ts
    components/
      HighlightedText.test.tsx
      VerseBlock.test.tsx
      PanelRenderer.test.tsx
      ButtonRow.test.tsx
      CollapsibleSection.test.tsx
      TappableReference.test.tsx
    screens/
      ChapterScreen.test.tsx
      HomeScreen.test.tsx
      SearchScreen.test.tsx
  maestro/
    flows/
      01_fresh_install.yaml
      02_browse_to_chapter.yaml
      03_read_and_panels.yaml
      04_notes_and_bookmarks.yaml
      05_qnav_navigation.yaml
      06_genealogy_tree.yaml
      07_map_story.yaml
      08_timeline.yaml
      09_word_study.yaml
      10_synoptic.yaml
      11_scholar_flow.yaml
      12_deep_links.yaml
      13_tts_and_share.yaml
      14_reading_plan.yaml
      15_search.yaml
      16_settings.yaml
```

---

## Batch 8A: Unit Tests (Pure Logic)
*Test every utility function with deterministic inputs and expected outputs. No rendering.*

### Prompt for Batch 8A

```
Phase 8A: Write unit tests for all pure utility functions.

READ _tools/PHASE_8_PLAN.md (Batch 8A section).

Write Jest test files for every utility module. Each test file lives in
app/__tests__/unit/. These are pure logic tests — no React rendering,
no database, no async. Fast and deterministic.

1. CREATE app/__tests__/unit/verseResolver.test.ts:
   Test parseReference():
   - "Gen 1:1" → { bookId:'genesis', chapter:1, verseStart:1, verseEnd:1 }
   - "1 Cor 13:4-7" → { bookId:'1_corinthians', chapter:13, verseStart:4, verseEnd:7 }
   - "Ps 23" → { bookId:'psalms', chapter:23, verseStart:undefined }
   - "Genesis 1:1–2:3" → cross-chapter range handling
   - "Rev 22:21" → last verse of the Bible
   - "" → null
   - "NotABook 1:1" → null
   - "Gen" → null (no chapter)

   Test splitMultiRef():
   - "Gen 1:1; Ex 3:14; John 1:1" → 3 strings
   - "Gen 1:1" → 1 string
   - "" → []

   Test getBookByName():
   - "Genesis" → genesis entry
   - "Gen" → genesis entry (abbreviation)
   - "1 Samuel" → 1_samuel entry
   - "Psalms" / "Psalm" / "Ps" → psalms entry
   - "Revelation" / "Rev" → revelation entry

   Total: ~20 test cases.

2. CREATE app/__tests__/unit/referenceParser.test.ts:
   Test extractReferences():
   - "See Genesis 3:15 for the protevangelion" → [{ref:"Genesis 3:15", start:4, end:16}]
   - "cf. Rom 8:28-30" → [{ref:"Rom 8:28-30", ...}]
   - "Isaiah 53:4–6 and Psalm 22:1" → 2 results
   - "No references here" → []
   - "Gen 1:1; Ex 3:14" → 2 results
   - "The year 2024 was significant" → [] (numbers not refs)

   Total: ~10 test cases.

3. CREATE app/__tests__/unit/panelLabels.test.ts:
   Test getPanelLabel():
   - "heb" → "Hebrew"
   - "ctx" → "Context"
   - "mac" → "MacArthur" (scholar lookup)
   - "sarna" → "Sarna"
   - "unknownKey" → "unknownKey" (fallback)

   Total: ~12 test cases (cover all 17 panel types + 2 scholars + fallback).

4. CREATE app/__tests__/unit/treeBuilder.test.ts:
   Test with a minimal people dataset (10 people, not full 211):

   Test computeSpineIds():
   - Given 10 people with father chains: adam→seth→enosh→...
   - Returns correct spine set

   Test buildHierarchy():
   - Returns adam as root
   - Children attached correctly
   - Spouses NOT in children array

   Test positionSpouses():
   - Single spouse: x = partner.x + 88, y = partner.y
   - Two spouses: spread at y ± 29 (58/2)
   - Three spouses: spread at y - 58, y, y + 58

   Test computeMarriageBars():
   - Returns bar with x1 (partner right edge), x2 (spouse left edge), midX

   Total: ~15 test cases.

5. CREATE app/__tests__/unit/timelineLayout.test.ts:
   Test yearToX():
   - yearToX(-4000) → 0
   - yearToX(95) → 9000
   - yearToX(-2200) → 1400 (exact breakpoint)
   - yearToX(-3100) → interpolated between breakpoints
   - yearToX(0) → 8000

   Test formatYear():
   - formatYear(-4000) → "4000 BC"
   - formatYear(0) → "AD·BC"
   - formatYear(33) → "AD 33"

   Test assignLanes():
   - 3 non-overlapping events → each gets a different lane or same if spaced
   - 3 overlapping events → assigned to different lanes

   Total: ~12 test cases.

6. CREATE app/__tests__/unit/geoMath.test.ts:
   Test toLatLng():
   - toLatLng([35.2, 31.7]) → { latitude: 31.7, longitude: 35.2 }

   Test computeBearing():
   - North: bearing from (0,0) to (1,0) → ~0°
   - East: bearing from (0,0) to (0,1) → ~90°

   Total: ~6 test cases.

7. RUN all tests: npx jest __tests__/unit/ --verbose
   Print: total tests, pass count, fail count, coverage summary.
   Fix any failures. Target: 100% pass rate on unit tests.
```

---

## Batch 8B: Integration Tests (Database + Queries)
*Test SQLite initialization, content queries, user data operations with real scripture.db.*

### Prompt for Batch 8B

```
Phase 8B: Write integration tests for the database layer.

READ _tools/PHASE_8_PLAN.md (Batch 8B section).

These tests use the real scripture.db file. They verify that the data
pipeline (Phase 0 extraction → Phase 1 JSON → build_sqlite.py) produced
correct, queryable data.

1. CREATE app/__tests__/integration/database.test.ts:
   Test initDatabase():
   - Database opens without error
   - Tables exist (query sqlite_master)
   - Expected table count: 20+ tables

2. CREATE app/__tests__/integration/contentQueries.test.ts:
   Test every content query function from db/content.ts:

   Books:
   - getBooks() → 66 entries
   - getLiveBooks() → 30 entries
   - getBook('genesis') → { name:'Genesis', testament:'ot', total_chapters:50 }

   Chapters:
   - getChapter('genesis', 1) → non-null, title contains 'Creation'
   - getChapterWithLinks('genesis', 1) → timeline_link_event = 'creation'
   - getChapter('genesis', 999) → null

   Sections:
   - getSections('genesis_1') → 5 sections (Genesis 1 has 5)
   - First section verse_start = 1
   - Last section verse_end > 20

   Panels:
   - getSectionPanels('genesis_1_s1') → includes 'heb', 'ctx', 'cross', 'mac'
   - getChapterPanels('genesis_1') → includes 'lit', 'themes', 'ppl'
   - content_json is valid JSON for each panel

   Verses:
   - getVerses('genesis', 1, 'niv') → 31 verses
   - getVerses('genesis', 1, 'esv') → 31 verses
   - Verse 1 text contains "In the beginning"
   - getVerses('psalms', 119, 'niv') → 176 verses (longest chapter)

   VHL:
   - getVHLGroups('genesis_1') → 5 groups (DIVINE, PLACES, PEOPLE, TIME, KEY)
   - Each group has words_json and btn_types_json (both non-empty arrays)

   People:
   - getPerson('abraham') → non-null, era='patriarch'
   - getPersonChildren('abraham') → includes 'isaac'
   - getAllPeople() → 211 entries

   Scholars:
   - getScholar('macarthur') → name='John MacArthur'
   - getAllScholars() → 43 entries
   - getScholarsForBook('genesis') → includes macarthur, sarna, alter

   Map:
   - getPlaces() → 71 entries
   - getMapStories() → 28 entries
   - getMapStories('patriarch') → 6 entries

   Search:
   - searchVerses('In the beginning') → includes Genesis 1:1
   - searchVerses('covenant') → multiple results
   - searchPeople('abraham') → returns abraham entry

   Threads:
   - getThreadsForChapter('genesis', 1) → at least 1 thread

   Total: ~40 test cases.

3. CREATE app/__tests__/integration/userQueries.test.ts:
   Test user data operations (write + read + delete):

   Notes:
   - saveNote('genesis 1:1', 'Test note') → no error
   - getNotesForChapter('genesis', 1) → 1 result
   - getNoteCount('genesis', 1) → 1
   - deleteNote(id) → getNotesForChapter returns 0

   Bookmarks:
   - addBookmark('genesis 1:1', 'Promise') → no error
   - getBookmarks() → 1 result
   - removeBookmark(id) → getBookmarks() returns 0

   Highlights:
   - setHighlight('genesis 1:1', 'gold') → no error
   - getHighlightsForChapter('genesis', 1) → 1 result, color='gold'
   - setHighlight('genesis 1:1', 'blue') → replaces (UNIQUE constraint)
   - removeHighlight('genesis 1:1') → 0 results

   History:
   - recordVisit('genesis', 1) → no error
   - getRecentChapters(5) → includes genesis_1
   - getReadingStats() → totalChapters >= 1

   Preferences:
   - setPreference('translation', 'esv') → no error
   - getPreference('translation') → 'esv'

   Plans:
   - getPlans() → 5 plans
   - startPlan('gospels-30') → plan_progress populated
   - completePlanDay('gospels-30', 1) → completed_at set
   - abandonPlan('gospels-30') → progress cleared

   Cleanup: each test should clean up its test data after running.
   Total: ~25 test cases.

4. CREATE app/__tests__/integration/searchEngine.test.ts:
   Test the unified search hook behavior:
   - Empty query → no results
   - "Abraham" → person result + verse results
   - "covenant" → verse results + word study result
   - "Genesis" → book result
   - Very long query → no crash, empty results

   Total: ~8 test cases.

5. RUN: npx jest __tests__/integration/ --verbose
   Target: 100% pass rate. Fix any data issues found.
```

---

## Batch 8C: Component Tests (Rendering + Interaction)
*Test key components render correctly and respond to user interaction.*

### Prompt for Batch 8C

```
Phase 8C: Write component tests for critical UI components.

READ _tools/PHASE_8_PLAN.md (Batch 8C section).

Use React Native Testing Library (RNTL). These tests render components
in a test environment and verify output and interaction.

NOTE: Not every component needs a test file. Focus on components with
LOGIC (conditional rendering, state, callbacks) rather than pure display.

1. CREATE app/__tests__/components/HighlightedText.test.tsx:
   The VHL engine — most complex rendering logic in the app.
   - Renders plain text when no groups active
   - Highlights "LORD" when divine group active
   - Correct color for each group type (divine=pink, places=green, etc.)
   - onVhlWordPress fires with correct btnTypes when highlighted word tapped
   - Non-matching words render in default color
   - Case-insensitive matching ("lord" matches "LORD" group)
   - Punctuation handling: "LORD," matches "LORD" group
   Total: ~10 test cases.

2. CREATE app/__tests__/components/VerseBlock.test.tsx:
   - Renders correct number of verse Text elements
   - Verse numbers present and formatted correctly
   - NoteIndicator renders for each verse
   - NoteIndicator gold when hasNote, muted when not
   - BookmarkButton renders for each verse
   - Highlight background applied when verse is highlighted
   Total: ~8 test cases.

3. CREATE app/__tests__/components/PanelRenderer.test.tsx:
   - Dispatches HebrewPanel for type "heb"
   - Dispatches ContextPanel for type "ctx"
   - Dispatches CommentaryPanel for unknown type (scholar fallback)
   - All 17 known types dispatch to correct component
   Total: ~18 test cases (one per type + fallback).

4. CREATE app/__tests__/components/ButtonRow.test.tsx:
   - Renders correct number of buttons
   - Active button has active styling
   - Tap button fires onToggle with correct panelType
   - Scholar buttons show scholar color
   - Chevron ▾ present on section-level buttons
   Total: ~6 test cases.

5. CREATE app/__tests__/components/CollapsibleSection.test.tsx:
   - Renders title
   - Initially collapsed when initiallyCollapsed=true
   - Expands on tap
   - Collapses on second tap
   - Children visible when expanded
   Total: ~5 test cases.

6. CREATE app/__tests__/components/TappableReference.test.tsx:
   - Renders plain text when no refs found
   - Renders tappable span for "Gen 1:1" in text
   - onRefPress fires with correct ParsedRef
   - Multiple refs in text: both tappable
   Total: ~5 test cases.

7. CREATE app/__tests__/screens/ChapterScreen.test.tsx:
   HIGH-LEVEL screen test (not exhaustive — E2E covers details):
   - Renders chapter title
   - Renders correct number of sections
   - Nav bar shows book name and chapter number
   - Bottom bar renders translation toggle
   Total: ~5 test cases.

8. CREATE app/__tests__/screens/HomeScreen.test.tsx:
   - Renders hero section
   - Renders book grid
   - Search input present
   Total: ~4 test cases.

9. CREATE app/__tests__/screens/SearchScreen.test.tsx:
   - Search input auto-focused
   - Empty state shown initially
   - Results render after query input
   Total: ~3 test cases.

10. RUN: npx jest __tests__/components/ __tests__/screens/ --verbose
    Target: 100% pass rate. Print coverage for tested components.
```

---

## Batch 8D: E2E Tests (Maestro Flows)
*Full device flows testing real user journeys end-to-end.*

### Prompt for Batch 8D

```
Phase 8D: Write Maestro E2E test flows for all 28 critical user journeys.

READ _tools/PHASE_8_PLAN.md (Batch 8D section + E2E flows list).

Maestro uses YAML flow files. Each flow describes a user journey with
taps, swipes, assertions, and waits. Flows run on a real device or
emulator.

Write all flow files in app/maestro/flows/. Group related journeys
into single files to reduce setup overhead.

1. CREATE app/maestro/flows/01_fresh_install.yaml:
   - Launch app
   - Wait for splash to dismiss
   - Assert HomeScreen visible ("Scripture Deep Dive" text)
   - Assert no "Continue Reading" section (fresh install)
   - Assert book grid visible

2. CREATE app/maestro/flows/02_browse_to_chapter.yaml:
   - Tap "Read" tab
   - Assert BookListScreen visible
   - Tap "Genesis"
   - Assert ChapterListScreen visible, "50 chapters"
   - Tap chapter 1
   - Assert ChapterScreen visible, "Genesis 1" title
   - Assert verse text contains "In the beginning"

3. CREATE app/maestro/flows/03_read_and_panels.yaml:
   - Navigate to Genesis 1
   - Assert section headers visible
   - Assert VHL highlighted words visible (colored text)
   - Tap "Hebrew" button → assert Hebrew panel expands
   - Tap "Context" button → assert Hebrew closes, Context opens
   - Tap "Context" again → assert Context closes
   - Scroll down to scholarly block
   - Tap "Literary Structure" → assert panel opens with structure rows
   - Tap "Theological Themes" → assert radar chart SVG visible

4. CREATE app/maestro/flows/04_notes_and_bookmarks.yaml:
   - Navigate to Genesis 1
   - Tap note indicator (✏️) on verse 1
   - Assert NoteEditor opens
   - Type "Test note"
   - Tap Save
   - Assert "My Notes (1)" badge visible
   - Tap bookmark icon on verse 1
   - Assert bookmark icon fills gold
   - Long-press verse 3
   - Assert HighlightColorPicker appears
   - Tap gold color
   - Assert verse 3 background changes

5. CREATE app/maestro/flows/05_qnav_navigation.yaml:
   - Navigate to Genesis 1
   - Tap 🔍 button (Qnav trigger)
   - Assert QnavOverlay opens
   - Type "Psalm" in search
   - Assert search results appear
   - Tap "Psalms" result → tap chapter 23
   - Assert ChapterScreen shows "Psalms 23"

6. CREATE app/maestro/flows/06_genealogy_tree.yaml:
   - Tap "Explore" tab
   - Tap "People" card
   - Assert GenealogyTreeScreen visible
   - Pinch to zoom in
   - Tap a visible node (e.g., "Adam")
   - Assert PersonSidebar opens with "Adam" name
   - Tap "Seth" in family links
   - Assert sidebar updates to "Seth"

7. CREATE app/maestro/flows/07_map_story.yaml:
   - Tap "Explore" tab → "Map"
   - Assert MapScreen visible
   - Tap "Patriarchal Period" era filter
   - Assert story picker shows patriarch stories
   - Tap "Abraham's Call"
   - Assert story panel opens with "Abraham's Call" name
   - Assert polyline overlays visible on map
   - Tap "Shechem" place chip → assert map pans

8. CREATE app/maestro/flows/08_timeline.yaml:
   - Tap "Explore" → "Timeline"
   - Assert TimelineScreen visible
   - Swipe left (pan timeline)
   - Tap an event marker
   - Assert detail panel opens with event name + summary
   - Tap "Read in Scripture Deep Dive →"
   - Assert navigates to ChapterScreen

9. CREATE app/maestro/flows/09_word_study.yaml:
   - Tap "Explore" → "Word Studies"
   - Assert 15 entries visible
   - Tap "Hebrew" filter
   - Tap "ḥesed" entry
   - Assert detail screen with glosses, range, occurrences

10. CREATE app/maestro/flows/10_synoptic.yaml:
    - Tap "Explore" → "Parallel Passages"
    - Assert 45 entries
    - Tap "The Baptism of Jesus"
    - Assert compare view with Gospel columns
    - Swipe between tabs (phone) or verify columns (tablet)

11. CREATE app/maestro/flows/11_scholar_flow.yaml:
    - Navigate to Genesis 1
    - Open a MacArthur panel
    - Tap "MacArthur" ScholarTag
    - Assert ScholarInfoSheet opens
    - Tap "See full bio"
    - Assert ScholarBioScreen with "John MacArthur"
    - Assert "Other Scholars" grid visible

12. CREATE app/maestro/flows/12_deep_links.yaml:
    - Navigate to Genesis 1
    - Tap "See on Timeline — Creation"
    - Assert TimelineScreen centres on creation event
    - Go back → tap "See on Map" link (if present)
    - Assert MapScreen with story pre-selected

13. CREATE app/maestro/flows/13_tts_and_share.yaml:
    - Navigate to Genesis 1
    - Tap TTS button
    - Assert TTS controls appear
    - Wait 2 seconds (verses being read)
    - Tap pause → assert paused
    - Tap stop → assert controls disappear
    - Long-press verse 1 → tap Share
    - Assert share sheet appears (or share card visible)

14. CREATE app/maestro/flows/14_reading_plan.yaml:
    - Navigate to Settings → Reading Plans
    - Tap "Psalms in 30 Days"
    - Tap "Start Plan"
    - Assert Day 1 highlighted
    - Tap a Day 1 chapter → assert ChapterScreen opens
    - Go back → assert day shows checkmark (auto-complete)
    - Go to HomeScreen → assert DailyReadingCard visible

15. CREATE app/maestro/flows/15_search.yaml:
    - Tap "Search" tab
    - Type "covenant"
    - Assert verse results appear
    - Assert word study result appears (ḥesed)
    - Tap a verse result → assert ChapterScreen opens

16. CREATE app/maestro/flows/16_settings.yaml:
    - Tap "More" tab → Settings
    - Change translation to ESV
    - Change font size to 20
    - Go to Genesis 1 → assert ESV text and larger font
    - Go back → reset to NIV and 16

17. RUN all Maestro flows: maestro test app/maestro/flows/
    Print: total flows, pass count, fail count.
    Fix any failures. Target: 100% pass rate.
```

---

## Batch 8E: Performance Profiling + Optimization
*Measure against targets. Optimize bottlenecks.*

### Prompt for Batch 8E

```
Phase 8E: Performance profiling against targets and optimization.

READ _tools/PHASE_8_PLAN.md (Batch 8E section).

Performance targets (from the RN plan):
  App launch → home screen: < 2 seconds
  Chapter load (cold): < 500ms
  Panel expand animation: 60 FPS
  Genealogy tree zoom/pan: 60 FPS
  Map marker rendering (71 markers): < 100ms
  FTS5 search results: < 200ms
  Database total size: < 25MB

1. MEASURE each target:

   a. App launch:
      Add performance.now() markers in App.tsx:
      - T0: App component mounts
      - T1: fonts loaded
      - T2: database initialized
      - T3: HomeScreen renders
      Print T3-T0. Target: < 2000ms.

   b. Chapter load:
      In ChapterScreen, measure time from navigation start to verses rendered.
      Test with: Genesis 1 (5 sections), Psalm 119 (longest, 176 verses),
      Isaiah 1 (enriched, 15 buttons per section).
      Target: < 500ms for all three.

   c. Panel expand:
      Use React DevTools profiler to measure frame drops during
      PanelContainer expand animation. Test with a content-heavy panel
      (e.g., MacArthur commentary with 6+ notes).
      Target: 0 dropped frames (60 FPS).

   d. Genealogy tree:
      Profile zoom/pan gesture with 211 nodes rendered.
      Use Flipper performance plugin or JS FPS counter.
      Target: 60 FPS sustained during pinch-to-zoom.

   e. Map markers:
      Measure time from MapScreen mount to all 71 markers visible.
      Profile with onRegionChangeComplete timing.
      Target: < 100ms.

   f. FTS5 search:
      Time searchVerses('covenant') and searchPeople('abraham').
      Test with various query lengths and result counts.
      Target: < 200ms for both.

   g. Database size:
      ls -la app/assets/scripture.db
      Target: < 25MB.

2. OPTIMIZE any target that fails:

   Common optimizations:
   - Chapter load slow → pre-fetch adjacent chapters (verify Phase 3I cache works)
   - Panel expand jank → use useNativeDriver:true for reanimated animations
   - Tree zoom jank → add React.memo to TreeNode, TreeLink with stable keys
   - Map slow → set tracksViewChanges={false} on all markers
   - Search slow → ensure FTS5 indexes are built (verify in build_sqlite.py)
   - DB too large → check for duplicate verse data, compress JSON blobs

   App-specific optimizations:
   - HighlightedText: memoize word-split + group-matching with useMemo
   - VerseBlock: use React.memo with custom areEqual (only re-render when
     verses, VHL groups, or notes change — not on every parent render)
   - SectionBlock: lazy-load panel content (don't parse JSON until panel opens)
   - FlatList optimizations: getItemLayout, maxToRenderPerBatch,
     windowSize, removeClippedSubviews
   - Image loading: use expo-image with caching for any icons/assets

3. RE-MEASURE after optimizations. Print before/after comparison table.
   All targets must be met before proceeding to Phase 9.
```

---

## Batch 8F: Accessibility Audit + Visual Polish
*Full accessibility walkthrough. Polish every visual edge case.*

### Prompt for Batch 8F

```
Phase 8F: Accessibility audit and visual polish pass.

READ _tools/PHASE_8_PLAN.md (Batch 8F section).

PART 1: ACCESSIBILITY AUDIT

Walk through every screen with VoiceOver (iOS Simulator) or TalkBack
(Android Emulator) enabled. Fix every issue found.

Checklist by screen:

a. HomeScreen:
   - [ ] Hero text announced
   - [ ] Search input: accessibilityLabel="Search verses, people..."
   - [ ] Book grid items: accessibilityRole="button", label includes book name
   - [ ] Continue Reading chips: label includes "Genesis Chapter 12"

b. ChapterScreen:
   - [ ] Nav bar: "Library" back button, "Chapter N" announced
   - [ ] Verse numbers announced before verse text
   - [ ] VHL highlighted words: accessibilityHint="Opens Hebrew panel"
   - [ ] Panel buttons: accessibilityRole="button", accessibilityState={selected:isActive}
   - [ ] Panel container: accessibilityLiveRegion="polite" (announces when content changes)
   - [ ] NoteIndicator: "Add note to verse N" / "Edit note on verse N"
   - [ ] BookmarkButton: "Bookmark verse N" / "Remove bookmark from verse N"
   - [ ] Bottom bar: "Previous chapter" / "Next chapter" / "Switch to ESV"

c. QnavOverlay:
   - [ ] Modal announced when opening
   - [ ] Search input focused automatically
   - [ ] Book names and chapter numbers announced
   - [ ] Close button accessible

d. GenealogyTreeScreen:
   - [ ] Tree nodes: "Abraham, Patriarch, tap for biography"
   - [ ] Zoom accessible via pinch gesture (VoiceOver 2-finger zoom)
   - [ ] PersonSidebar: family links announced with role ("Father: Terah")

e. MapScreen:
   - [ ] Place markers: "Jerusalem, city" announced
   - [ ] Story panel: content announced when sheet opens
   - [ ] Place chips: "Tap to centre map on Shechem"

f. TimelineScreen:
   - [ ] Events: "Creation, 4000 BC, tap for details"
   - [ ] Detail panel: full content announced

g. All modals/sheets:
   - [ ] Focus trapped within modal
   - [ ] Escape/back gesture closes modal
   - [ ] Content announced on open

h. Dynamic Type:
   - [ ] Set iOS text size to largest
   - [ ] All verse text scales appropriately
   - [ ] Panel text scales
   - [ ] No text truncation that hides content
   - [ ] Layout doesn't break at large sizes

i. Contrast (WCAG AA — 4.5:1 minimum):
   - [ ] Gold (#c9a84c) on dark bg (#0c0a07) = 6.2:1 ✅
   - [ ] Text (#f0e8d8) on dark bg = 14.7:1 ✅
   - [ ] TextDim (#b8a888) on dark bg = 7.4:1 ✅
   - [ ] TextMuted (#7a6a50) on dark bg = 3.8:1 ⚠️ (only used for non-essential)
   - [ ] Panel accent colors on panel backgrounds — verify each of 17 types

PART 2: VISUAL POLISH

a. Splash screen:
   - Golden cross icon on #0c0a07 background
   - Smooth fade transition to HomeScreen
   - expo-splash-screen configured in app.json

b. App icon:
   - 1024×1024 icon.png in assets/images/
   - Adaptive icon (Android): foreground + background layers
   - All size variants auto-generated by Expo

c. Empty states (verify every screen has one):
   - HomeScreen: no Continue Reading → section hidden (not "No history")
   - BookmarkListScreen: "No bookmarks yet. Tap the bookmark icon..."
   - NotesOverlay: "No notes yet. Tap ✏️ next to any verse."
   - SearchScreen: "Search verses, people, and more..."
   - ReadingHistoryScreen: "No chapters read yet."
   - PlanDetailScreen (no active plan): shows "Start Plan" CTA

d. Error states:
   - Database initialization failure → error screen with "Retry" button
   - Network error during OTA update → graceful fallback to cached content
   - Invalid chapter navigation (bad route params) → redirect to BookListScreen

e. Loading states:
   - ChapterScreen: LoadingSkeleton while data loads
   - Panel content: subtle shimmer while JSON parses
   - Map: dark background before tiles load
   - Tree: "Loading family tree..." with spinner

f. Haptic feedback (iOS):
   - Panel toggle: light impact
   - Bookmark toggle: medium impact
   - Translation toggle: selection changed
   Import * as Haptics from 'expo-haptics'

g. Keyboard handling:
   - SearchScreen: keyboard avoidance, dismiss on scroll
   - QnavOverlay: keyboard avoidance for search input
   - NoteEditor: keyboard avoidance, "Done" button in toolbar

h. Safe area insets:
   - All screens use SafeAreaView or useSafeAreaInsets
   - ChapterNavBar: top inset for notch/Dynamic Island
   - BottomBar: bottom inset for home indicator
   - Bottom sheets: content above home indicator

i. Orientation:
   - Lock to portrait on phone
   - Allow landscape on tablet
   - app.json: "orientation": "portrait" (override per-screen for tablet)

j. Dark mode:
   - App is dark-mode-only (no light theme)
   - System dark mode changes don't affect the app
   - NavigationContainer uses custom dark theme
   - StatusBar: light-content

Commit all fixes. Print summary of issues found and resolved.
```

---

## Batch Summary

| Batch | Description | Test files | Tool calls |
|-------|-------------|-----------|-----------|
| **8A** | Unit tests: verseResolver, referenceParser, panelLabels, treeBuilder, timelineLayout, geoMath | 6 test files, ~75 test cases | ~10 |
| **8B** | Integration tests: database init, content queries (40 cases), user queries (25 cases), search | 4 test files, ~75 test cases | ~12 |
| **8C** | Component tests: HighlightedText, VerseBlock, PanelRenderer, ButtonRow, CollapsibleSection, TappableReference, 3 screens | 9 test files, ~60 test cases | ~12 |
| **8D** | E2E Maestro flows: 16 flow files covering 28 user journeys | 16 YAML files | ~14 |
| **8E** | Performance profiling: 7 targets measured, optimizations applied, before/after comparison | measurement scripts | ~10 |
| **8F** | Accessibility audit (VoiceOver/TalkBack walkthrough, Dynamic Type, contrast) + visual polish (splash, icons, empty/error/loading states, haptics, keyboard, safe areas) | fixes across many files | ~12 |

**Total: 6 batches, ~70 tool calls, targeting 3 sessions.**

**Dependency graph:**
```
8A ──┐
8B ──┼──→ 8D ──→ 8E ──→ 8F
8C ──┘
```

8A/8B/8C can run in parallel (unit, integration, component tests are independent). 8D (E2E) should run after all lower-level tests pass. 8E (performance) after E2E to ensure measurements reflect the real app. 8F (polish) last — fixes found during testing.

---

## Session Planning

**Session 1:** Batches 8A + 8B (unit + integration tests — ~150 test cases)
**Session 2:** Batches 8C + 8D (component tests + 16 Maestro E2E flows)
**Session 3:** Batches 8E + 8F (performance profiling + accessibility + polish)

---

## Exit Criteria (all must be met before Phase 9)

**Testing:**
- [ ] ~75 unit tests: 100% pass
- [ ] ~75 integration tests: 100% pass
- [ ] ~60 component tests: 100% pass
- [ ] 16 Maestro E2E flows: 100% pass (all 28 journeys covered)
- [ ] 0 known bugs that affect core reading experience

**Performance:**
- [ ] App launch < 2 seconds
- [ ] Chapter load < 500ms (tested with Genesis 1, Psalm 119, Isaiah 1)
- [ ] Panel expand: 60 FPS (0 dropped frames)
- [ ] Genealogy tree zoom/pan: 60 FPS with 211 nodes
- [ ] Map marker rendering: < 100ms for 71 markers
- [ ] FTS5 search: < 200ms
- [ ] Database size: < 25MB

**Accessibility:**
- [ ] VoiceOver walkthrough: all screens navigable, all interactive elements announced
- [ ] TalkBack walkthrough: same as VoiceOver
- [ ] Dynamic Type: verse text scales at all system sizes without layout breakage
- [ ] Contrast: all primary text meets WCAG AA (4.5:1)

**Polish:**
- [ ] Splash screen renders correctly
- [ ] App icon renders at all sizes
- [ ] Every screen has an appropriate empty state
- [ ] Database error → error screen with retry
- [ ] Loading skeletons on all async content
- [ ] Haptic feedback on panel toggle, bookmark, translation (iOS)
- [ ] Keyboard avoidance on all text inputs
- [ ] Safe area insets on all screens (notch, home indicator)
- [ ] Portrait lock on phone, landscape allowed on tablet
- [ ] Dark mode only, StatusBar light-content
