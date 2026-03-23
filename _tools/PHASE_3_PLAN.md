# Phase 3: ChapterScreen — Implementation Plan

## Overview

**Goal:** Build the complete ChapterScreen — the reading experience where 90% of user time is spent. This includes the screen itself, all 17 panel components, the VHL engine, the verse resolver, the button/panel toggle system, Qnav, per-verse notes, thread viewer, cross-ref popups, and every modal triggered from a chapter page.

**Dependencies:** Phase 2 complete. Expo project exists with design system, types, data layer, hooks, navigation skeleton, and placeholder screens.

**Component count:** 49 distinct components across 8 categories.

**Complexity map:**

| Category | Count | Difficulty | Notes |
|----------|-------|-----------|-------|
| Utilities (non-visual) | 2 | High | verseResolver is 15KB of ref-parsing logic |
| Shared components | 3 | Low | CollapsibleSection, LoadingSkeleton, TappableReference |
| Verse rendering | 5 | High | VHL word-matching + coloring is the hardest component |
| Button/panel system | 4 | Medium | Animated expand/collapse, single-open policy |
| Section-level panels | 7+1 | Medium | 7 named + 1 parameterized CommentaryPanel |
| Chapter-level panels | 10 | Medium | ThemesRadarPanel (SVG) is the hardest one |
| ChapterScreen + chrome | 7 | Medium | Orchestrator + nav bar + bottom bar + header components |
| Modals | 11 | Medium | Qnav is the largest (88KB equivalent in PWA) |

---

## Reference: Button Label Map

Every button in the PWA maps a CSS class to a display label and a panel type. The React Native app uses the panel_type from the database to drive both the label and the component.

```typescript
// utils/panelConfig.ts

export const PANEL_CONFIG: Record<string, { label: string; icon?: string }> = {
  // Section-level
  heb:      { label: 'Hebrew' },    // or 'Greek' for NT chapters
  hist:     { label: 'History' },
  ctx:      { label: 'Context' },
  cross:    { label: 'Cross-Ref' },
  poi:      { label: 'Places' },
  tl:       { label: 'Timeline' },
  // Chapter-level
  lit:      { label: 'Literary Structure' },
  hebtext:  { label: 'Hebrew Reading' },
  themes:   { label: 'Theological Themes' },
  ppl:      { label: 'People' },
  trans:    { label: 'Translations' },
  src:      { label: 'Ancient Sources' },
  rec:      { label: 'Reception History' },
  thread:   { label: 'Intertextual Threading' },
  textual:  { label: 'Textual Notes' },
  debate:   { label: 'Scholarly Debates' },
};

// Scholar panels use the scholar's label from the scholars table.
// Unknown panel types fall through to CommentaryPanel.
export function getPanelLabel(type: string, scholar?: Scholar): string {
  if (PANEL_CONFIG[type]) return PANEL_CONFIG[type].label;
  if (scholar) return scholar.label;
  return type;  // fallback
}
```

---

## Batch 3A: Utilities + Shared Components
*The foundation everything else depends on: verse resolver, reference auto-linker, and reusable UI primitives.*

### Prompt for Batch 3A

```
Phase 3A: Build utility modules and shared UI components used by
every panel and the ChapterScreen itself.

READ _tools/PHASE_3_PLAN.md (Batch 3A section).
READ _tools/REACT_NATIVE_PLAN.md §3.4 for cross-reference resolution spec.

1. CREATE app/src/utils/verseResolver.ts — Port of verse-resolver.js (15KB):

   The PWA's VerseResolver has a BOOK_TABLE with 66 entries:
   { dir:'genesis', name:'Genesis', short:'Gen', testament:'ot', chapters:50 }

   Port these functions to TypeScript:
   a. parse(refStr: string): ParsedRef | null
      - Handles: "Gen 1:1", "1 Cor 3:14-16", "Ps 23", "Genesis 1:1–2:3"
      - The regex pattern: /^(\d?\s*[A-Za-z]+\.?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(\d+))?)?/
      - First resolves book name via _resolveBook (handles abbreviations:
        Gen, Exod, Lev, Num, Deut, Josh, Judg, 1 Sam, 2 Sam, 1 Kgs, 2 Kgs,
        1 Chr, 2 Chr, Ps, Prov, Eccl, Song, Isa, Jer, Lam, Ezek, Dan,
        Matt, Mk, Lk, Jn, Acts, Rom, 1 Cor, 2 Cor, Gal, Eph, Phil, Col,
        1 Thess, 2 Thess, 1 Tim, 2 Tim, Heb, Jas, 1 Pet, 2 Pet, Rev, etc.)
      - Returns: { book, name, short, testament, ch, v1, v2, ref }
   b. toShort(refStr): string — "Genesis 1:1" → "Gen 1:1"
   c. getBook(key): BookEntry | null
   d. isLive(bookDir): boolean — checks if book is in the live set

   Use the books table from SQLite for the BOOK_TABLE data instead of
   hardcoding 66 entries. Load once on init, cache in module scope.

2. CREATE app/src/utils/referenceParser.ts:
   Scans a text string and finds ALL scripture references in it.
   Returns: Array<{ ref: string; start: number; end: number }>

   This is used by EVERY panel that contains commentary text — the parser
   identifies refs like "Gen 1:1" or "cf. Deut 32:1" in free text so
   they can be wrapped in TappableReference components.

   Regex approach: scan for patterns like
     /\b(\d?\s*[A-Z][a-z]+\.?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*\d+)?)/g
   Then validate each match against verseResolver.parse().

3. CREATE app/src/utils/panelConfig.ts:
   The PANEL_CONFIG map and getPanelLabel() function as defined in
   the Reference section of this plan.

4. CREATE app/src/components/CollapsibleSection.tsx:
   Animated expand/collapse wrapper using react-native-reanimated:
   - Props: title, initiallyCollapsed, accentColor?, children
   - Header row: title text + chevron that rotates on toggle
   - Content area: animated height from 0 → measured height
   - Uses useAnimatedStyle + withTiming for smooth 250ms animation
   - This component is reused by: authorship disclosure, panel containers,
     and chapter-level scholarly block

5. CREATE app/src/components/LoadingSkeleton.tsx:
   Shimmer placeholder for async-loading content:
   - Props: width, height, lines?
   - Animated opacity pulse (0.3 → 0.7 → 0.3) using reanimated
   - Used when panel content takes >100ms to render

6. CREATE app/src/components/TappableReference.tsx:
   Wraps scripture reference text so it's tappable → opens CrossRefPopup:
   - Props: refString, children (the display text)
   - Parses refString with verseResolver.parse()
   - If valid: renders as gold-colored Text with onPress → opens CrossRefPopup
   - If invalid: renders as plain Text (no interactivity)
   - Used inside: CrossRefPanel, CommentaryPanel, ContextPanel, etc.

7. CREATE app/src/components/AutoLinkedText.tsx:
   Takes a raw text string, scans it with referenceParser, and renders
   a mixed Text with TappableReference spans for every found reference
   and plain Text for everything between.
   - Props: text: string, style?: TextStyle
   - Uses referenceParser to find refs, splits text, interleaves
     plain Text and TappableReference components

8. VERIFY: Write a quick test that:
   - verseResolver.parse("Gen 1:1") returns genesis ch1 v1
   - verseResolver.parse("1 Cor 3:14-16") returns 1_corinthians ch3 v14 v2=16
   - verseResolver.parse("Ps 23") returns psalms ch23
   - referenceParser finds 2 refs in "See Gen 1:1 and Exod 3:14"
   - CollapsibleSection renders and toggles
   Print PASS/FAIL.
```

---

## Batch 3B: Verse Rendering Layer
*VerseBlock, VHL HighlightedText, NoteIndicator, SectionBlock — the core reading components.*

### Prompt for Batch 3B

```
Phase 3B: Build the verse rendering components — the text the user
actually reads.

READ _tools/PHASE_3_PLAN.md (Batch 3B section).
READ _tools/REACT_NATIVE_PLAN.md §3.3 for VHL spec.

1. CREATE app/src/components/HighlightedText.tsx:
   The VHL (Visual Highlight Layer) word-matching engine.

   Props:
   - text: string (the verse text, e.g., "In the beginning God created...")
   - groups: VHLGroup[] (from getVHLGroups, each has group_name, css_class, words_json)
   - activeGroups: string[] (which VHL groups are currently enabled)
   - onWordPress?: (word: string) => void (for word study popup)

   Implementation:
   a. Parse words_json from each active group into a Set<string> (case-insensitive)
   b. Split text into words (preserve whitespace and punctuation)
   c. For each word, check if it matches any active group
   d. Render as:
      - Matched word: <Text style={{ color: groupColor }}> with onPress
      - Unmatched word: plain <Text>
   e. Group colors map from css_class:
      vhl-divine → colors.panels.heb.accent (#e890b8)
      vhl-place  → colors.panels.poi.accent (#30a848)
      vhl-person → colors.panels.ppl.accent (#e86040)
      vhl-time   → colors.panels.tl.accent  (#70b8e8)
      vhl-key    → colors.gold (#c9a84c)

   Performance: memoize the word→group lookup map. This renders for every
   verse in the chapter — it must be fast.

2. CREATE app/src/components/NoteIndicator.tsx:
   Tiny pencil icon at the end of each verse:
   - Props: verseNum, hasNote, onPress
   - Renders Pencil icon from lucide-react-native (size 12)
   - Color: gold if hasNote, textMuted if not
   - Touch target: 44x44pt (accessibility)
   - accessibilityLabel: "Edit note on verse {n}" / "Add note to verse {n}"

3. CREATE app/src/components/VerseBlock.tsx:
   Renders a section's verses with VHL highlighting and note indicators:
   - Props: verses: Verse[], vhlGroups, activeVhlGroups, notes: Record<number, UserNote>,
            onNotePress, onWordPress, fontSize (from settings)
   - For each verse: render verse number (superscript, Cinzel, gold) +
     HighlightedText + NoteIndicator
   - Verse text uses EB Garamond, bodyLg size (scaled by user font preference)
   - Line height: 1.8x font size for comfortable reading

4. CREATE app/src/components/SectionHeader.tsx:
   Renders the section header text (e.g., 'Verses 1–13 — "In the Beginning"'):
   - Props: header: string
   - Cinzel font, displayMd, gold color
   - Horizontal rule below

5. CREATE app/src/components/SectionBlock.tsx:
   The complete section unit: header + verses + button row + panel:
   - Props: section: Section, panels: SectionPanel[], verses: Verse[],
            vhlGroups, activeVhlGroups, notes, scholars: Scholar[],
            activePanel, onPanelToggle, onNotePress, onWordPress
   - Renders:
     a. SectionHeader
     b. VerseBlock (with VHL + notes)
     c. ButtonRow (from available panels)
     d. Active panel content (if this section has the open panel)

6. VERIFY with Genesis 1 data:
   - Load Genesis 1 sections + verses + VHL groups from SQLite
   - Render SectionBlock for section 1
   - Confirm VHL highlighting: "God" should be colored (divine group)
   - Confirm verse numbers render as gold superscripts
   - Print component render count to check for unnecessary re-renders
```

---

## Batch 3C: Button Row + Panel System + Section-Level Panels
*The panel toggle mechanism and all 8 section-level panel components.*

### Prompt for Batch 3C

```
Phase 3C: Build the panel toggle system and all section-level panel
components.

READ _tools/PHASE_3_PLAN.md (Batch 3C section and Reference: Button Label Map).
READ _tools/REACT_NATIVE_PLAN.md §3.2 for PanelRenderer spec.
READ _tools/PHASE_1_PLAN.md Data Format Definitions for JSON schemas.

1. CREATE app/src/components/PanelButton.tsx:
   Individual toggle button in a button row:
   - Props: panelType, label, isActive, accentColor, onPress
   - Renders: Cinzel text (displaySm, letter-spacing 2)
   - Background: transparent when inactive, accentColor at 15% opacity when active
   - Border: 1px accentColor at 30% opacity
   - Minimum width: 44pt (accessibility)
   - Small ▾ chevron after label text (like PWA's &#9660;)

2. CREATE app/src/components/ButtonRow.tsx:
   Dynamic horizontal button strip:
   - Props: panels: SectionPanel[], scholars: Scholar[], activePanel, onToggle
   - Renders PanelButton for each panel, colored by getPanelColors(type)
   - For commentary panels (type not in PANEL_CONFIG): use scholar.label
     as the display text and scholar color from getScholarColor(type)
   - Horizontal ScrollView if buttons overflow (which they will for
     enriched chapters with 15+ panels)
   - Gap: spacing.sm (8pt)

3. CREATE app/src/components/PanelContainer.tsx:
   Animated expand/collapse wrapper for panel content:
   - Props: isOpen, panelType, children
   - Uses react-native-reanimated: animated height 0 → measured height
   - Background: getPanelColors(panelType).bg
   - Left border: 3px getPanelColors(panelType).accent
   - 250ms timing animation with easeInOut
   - Content padding: spacing.md

4. CREATE app/src/components/panels/PanelRenderer.tsx:
   Central dispatch: given a panel_type and content_json, renders the
   correct component. Uses the PANEL_COMPONENTS map from the RN plan.
   Unknown types → CommentaryPanel with scholarId.

5. CREATE SECTION-LEVEL PANEL COMPONENTS in app/src/components/panels/:

   a. HebrewPanel.tsx:
      Data: HebEntry[] (word, tlit, gloss, text)
      Renders each entry:
      - Hebrew/Greek word in accent color (#e890b8 OT / #90c0e8 NT)
      - Transliteration in italic, goldDim
      - Gloss in bold gold
      - Paragraph text in bodyMd
      Tap on word → onWordPress(tlit) for WordStudyPopup

   b. ContextPanel.tsx:
      Data: string (paragraph text)
      Renders with AutoLinkedText (auto-links scripture refs)
      Uses ctx accent colors

   c. HistoricalContextPanel.tsx:
      Data: string (paragraph text)
      Same as ContextPanel but with hist accent colors

   d. CrossRefPanel.tsx:
      Data: CrossRefEntry[] ({ref, note})
      Renders each as: TappableReference(ref) + note text
      Gold bullet separator. Ref in gold, note in bodyMd.

   e. CommentaryPanel.tsx:
      Data: CommentaryEntry[] ({ref, note}), scholarId: string
      Header: scholar name from scholars table + tradition + source line
      Each entry: ref in bold + note paragraph with AutoLinkedText
      Scholar accent color from getScholarColor(scholarId)
      Tap scholar name in header → ScholarInfoSheet

   f. PlacesPanel.tsx:
      Data: PlaceEntry[] ({name, role, text})
      Renders cards with place name (bold, poi accent) + role + text
      Tap card → navigate to MapScreen with place pre-selected

   g. TimelinePanel.tsx:
      Data: TimelineEvent[] ({date, event, text})
      Renders event cards with date badge + event name + text
      Tap → navigate to TimelineScreen centered on that event

6. VERIFY with Genesis 1:
   - Open section 1 panels from database
   - Render HebrewPanel with the heb data
   - Render CrossRefPanel with the cross data
   - Render CommentaryPanel for macarthur
   - Confirm accent colors match the design system
   - Confirm TappableReference auto-linking works in CommentaryPanel
```

---

## Batch 3D: Chapter-Level Panels
*The 10 scholarly block panels including the SVG radar chart.*

### Prompt for Batch 3D

```
Phase 3D: Build all 10 chapter-level panel components (the scholarly block).

READ _tools/PHASE_3_PLAN.md (Batch 3D section).
READ _tools/PHASE_1_PLAN.md Data Format Definitions for JSON schemas.

1. CREATE chapter-level panels in app/src/components/panels/:

   a. LiteraryStructurePanel.tsx:
      Data: { rows: LitRow[], note: string }
      Render as a visual outline:
      - Each row: label (Cinzel displaySm) | range | text
      - is_key rows get a gold left border + slightly brighter background
      - Note at bottom in bodySm italic

   b. HebrewReadingPanel.tsx:
      Data: HebEntry[] (same as section-level heb but aggregated)
      Render each: Hebrew word (accent color) → transliteration →
      gloss → note. Uses hebText accent colors.

   c. ThemesRadarPanel.tsx:
      Data: { scores: ThemeScore[], note: string }
      Render an SVG radar chart using react-native-svg:
      - 10 axes (one per theme), arranged in a circle
      - Concentric rings at values 2, 4, 6, 8, 10
      - Polygon connecting the 10 score points, filled gold at 20% opacity
      - Theme labels around the outside
      - Tap a theme label → could highlight related content (future)
      - Note below chart in bodySm

      SVG rendering:
      - viewBox="0 0 240 240", center at (120,120), radius 85
      - Each axis: angle = (i / 10) * 2π - π/2 (start at top)
      - Point position: center + (score/10 * radius) * (cos(angle), sin(angle))
      - Use <Polygon>, <Circle>, <Line>, <SvgText> from react-native-svg

   d. PeoplePanel.tsx:
      Data: PersonEntry[] ({name, role, text})
      Render person cards:
      - Name in bold, ppl accent color
      - Role in Cinzel displaySm
      - Text in bodyMd with AutoLinkedText
      - Tap name → open PersonSidebar modal

   e. TranslationPanel.tsx:
      Data: { title: string, rows: TransRow[] }
      Each row: verse_ref header + table of version→text
      Render as alternating-shade rows with version labels in bold

   f. SourcesPanel.tsx:
      Data: SourceEntry[] ({title, quote, note})
      Render blocks: title (bold, src accent), quote (italic, bodyMd),
      note (bodySm). With AutoLinkedText on note.

   g. ReceptionPanel.tsx:
      Data: same structure as SourcesPanel
      Render identically but with rec accent colors.

   h. ThreadingPanel.tsx:
      Data: ThreadEntry[] ({anchor, target, direction, type, text})
      Render: anchor (TappableReference) → arrow → target (TappableReference)
      Type badge (e.g., "Fulfilment", "Echo") with thread accent color
      Text below.

   i. TextualPanel.tsx:
      Data: TextualEntry[] ({ref, title, content, note})
      Render: ref header + title + content paragraph + note
      MT/LXX/DSS labels rendered in distinct colors
      (MT: gold, LXX: blue #70b8e8, DSS: green #70d098)

   j. DebatePanel.tsx:
      Data: DebateEntry[] ({topic, positions: [{scholar, position}]})
      Render: topic header + position cards per scholar
      Scholar names colored by getScholarColor(scholar)

2. CREATE app/src/components/ScholarlyBlock.tsx:
   The chapter-level panel container:
   - Props: chapterPanels: ChapterPanel[], scholars: Scholar[],
            activePanel, onPanelToggle
   - Header: "Chapter-Level Scholarship" (Cinzel displaySm)
   - ButtonRow with chapter-level panel buttons
   - PanelContainer with active panel content

3. VERIFY with Genesis 1:
   - Load chapter panels from SQLite
   - Render ThemesRadarPanel with themes data → SVG renders correctly
   - Render LiteraryStructurePanel → rows display with key highlighting
   - Render PeoplePanel → person cards render with names
```

---

## Batch 3E: ChapterScreen Orchestrator
*The main screen that assembles everything.*

### Prompt for Batch 3E

```
Phase 3E: Build the ChapterScreen itself plus its nav bar, bottom bar,
and header components.

READ _tools/PHASE_3_PLAN.md (Batch 3E section).
READ _tools/REACT_NATIVE_PLAN.md §3.1, §3.1a–e for the full layout spec.

1. CREATE app/src/components/ChapterNavBar.tsx:
   Sticky navigation bar at top of ChapterScreen:
   - Left: "← Library" back button → navigation.goBack()
   - Center: book name (Cinzel displaySm) + "Chapter N" (uiSm)
   - Right: ← arrow | 🔍 (Qnav trigger) | → arrow
   - Prev/next arrows disabled on first/last chapter (opacity 0.3)
   - Background: bgElevated with bottom border
   - Height: ~56pt

2. CREATE app/src/components/BottomBar.tsx:
   Fixed bar at bottom of ChapterScreen:
   - Left: "← Prev" (disabled on ch.1)
   - Center: "NIV" / "ESV" toggle button (taps switch translation via settingsStore)
   - Right: "Next →" (disabled on last chapter)
   - Background: bgElevated with top border
   - Safe area padding at bottom (home indicator)

3. CREATE app/src/components/ChapterHeader.tsx:
   The area between nav bar and first section:
   - Props: chapter: Chapter, noteCount, threads: CrossRefThread[],
            bookId, chapterNum, navigation
   - Renders in order:
     a. Chapter title (h1, Cinzel displayLg)
     b. Subtitle (chapter.title, EB Garamond bodyItalic)
     c. ActionBar: [My Notes (N)] button + [About This Book →] link
     d. DeepLinkBar: timeline link + map story link (conditional, from chapter columns)
     e. ThreadBadgeBar: thread badges (conditional)

4. CREATE app/src/components/ThreadBadge.tsx:
   Small badge chip for a cross-ref thread:
   - Props: thread: CrossRefThread, onPress
   - Renders: ✴ icon + thread.theme text
   - thread accent color background at 15% opacity
   - Tap → opens ThreadViewerSheet

5. REPLACE the placeholder ChapterScreen with the real implementation:

   app/src/screens/ChapterScreen.tsx:
   - Uses useChapterData(bookId, chapterNum) hook for ALL data
   - Uses readerStore for activePanel + qnavOpen + notesOverlayOpen
   - Uses settingsStore for translation + fontSize + vhlEnabled

   Structure:
   ```
   <View style={{ flex: 1 }}>
     <ChapterNavBar ... />
     <ScrollView>
       <ChapterHeader ... />
       {sections.map(section => (
         <SectionBlock key={section.id}
           section={section}
           panels={sectionPanelsMap[section.id]}
           verses={versesForSection(section)}
           vhlGroups={vhlGroups}
           activeVhlGroups={vhlEnabled ? ALL_GROUP_NAMES : []}
           notes={notesMap}
           scholars={scholars}
           activePanel={activePanel}
           onPanelToggle={handlePanelToggle}
           onNotePress={handleNotePress}
           onWordPress={handleWordPress}
         />
       ))}
       <ScholarlyBlock
         chapterPanels={chapterPanels}
         scholars={scholars}
         activePanel={activePanel}
         onPanelToggle={handlePanelToggle}
       />
       <CollapsibleSection title="Authorship & Sources" initiallyCollapsed>
         <Text>Commentary panels are scholarly paraphrases...</Text>
       </CollapsibleSection>
     </ScrollView>
     <BottomBar ... />
     <QnavOverlay visible={qnavOpen} ... />
     <NotesOverlay visible={notesOverlayOpen} ... />
   </View>
   ```

   Key behaviors:
   - Single-open panel policy: tapping a panel closes any other open panel
   - Translation toggle re-loads verses from SQLite
   - Prev/Next navigation: push new ChapterScreen with adjacent chapter
   - Records visit to reading_progress on mount (§3.8)
   - Pre-fetches adjacent chapters in background (useEffect)

6. PROGRESSIVE LOADING:
   - Phase 1: Render verse text + section headers immediately
   - Phase 2: Render button rows after 50ms (InteractionManager.runAfterInteractions)
   - Phase 3: Panel content loads on-demand when tapped
   - LoadingSkeleton shown if panel data takes >100ms

7. VERIFY end-to-end:
   - Navigate to Genesis 1 via ReadTab → BookList → ChapterList → Chapter
   - Confirm: nav bar shows "← Library | Genesis | Chapter 1 | ← 🔍 →"
   - Confirm: verse text renders with VHL highlighting
   - Confirm: button rows appear for each section
   - Confirm: tapping Hebrew button expands HebrewPanel
   - Confirm: tapping another button closes Hebrew, opens new one
   - Confirm: scholarly block renders below sections
   - Confirm: bottom bar shows translation toggle + prev/next
   - Confirm: translation toggle switches NIV ↔ ESV
```

---

## Batch 3F: Qnav Overlay
*The full-screen quick-navigation modal — the primary navigation mechanism.*

### Prompt for Batch 3F

```
Phase 3F: Build the Qnav (Quick Navigation) overlay.

READ _tools/PHASE_3_PLAN.md (Batch 3F section).
READ _tools/REACT_NATIVE_PLAN.md §3.5 for the Qnav spec.

The PWA's qnav.js is 88KB — it's the most complex navigation component.
It provides instant book/chapter jumping from any chapter page.

1. CREATE app/src/components/BookAccordion.tsx:
   Expandable book row inside Qnav:
   - Props: book: Book, expanded: boolean, onToggle, onSelectChapter
   - Collapsed: book name (Cinzel displaySm) + chapter count + LIVE badge
   - Expanded: chapter number grid (FlexWrap row of number buttons)
   - Chapter buttons: 34x34pt, gold border, gold text
   - Non-live chapters: dimmed (textMuted), not tappable
   - Animated expand with react-native-reanimated

2. CREATE app/src/components/QnavSearchResults.tsx:
   Inline mixed search results inside Qnav:
   - Props: query: string, onSelectChapter, onSelectPerson
   - Uses useSearch(query) hook (debounced 300ms)
   - Renders mixed results:
     * Verse matches: book + chapter + verse snippet (tap → navigate)
     * People matches: name + role (tap → PersonSidebar)
   - Max 10 results shown, "See all in Search" link at bottom

3. REPLACE the placeholder QnavOverlay with full implementation:

   app/src/components/QnavOverlay.tsx:
   - Full-screen modal (animationType="slide")
   - Header: close button (X) + "Navigate" title
   - Search bar: TextInput with placeholder "Search verses, people..."
   - When query >= 2 chars: show QnavSearchResults, hide book list
   - When query empty: show testament toggle + book accordion list
   - OT/NT toggle: two buttons, active has gold underline
   - Book list: FlatList of BookAccordion components
   - Filtered by active testament
   - Remember last testament toggle via Zustand (readerStore)
   - onSelectChapter(bookId, ch): navigate to ChapterScreen + close overlay

4. VERIFY:
   - Open Qnav from ChapterScreen nav bar 🔍 button
   - OT tab shows OT books, NT tab shows NT books
   - Expand Genesis → chapter grid appears (1-50)
   - Tap chapter 12 → navigates to Genesis 12, overlay closes
   - Type "Abraham" in search → people result appears
   - Type "In the beginning" → verse result appears
```

---

## Batch 3G: Notes System + Reading History
*Per-verse notes, notes overlay, note editor, and reading history tracking.*

### Prompt for Batch 3G

```
Phase 3G: Build the complete per-verse notes system and reading history.

READ _tools/PHASE_3_PLAN.md (Batch 3G section).
READ _tools/REACT_NATIVE_PLAN.md §3.6 and §3.8.

1. CREATE app/src/components/NotesButton.tsx:
   "My Notes (3)" button in the chapter header action bar:
   - Props: noteCount: number, onPress
   - Cinzel displaySm text, gold color
   - Badge: gold circle with white count number (if > 0)
   - Tap → opens NotesOverlay modal

2. CREATE app/src/components/NoteEditor.tsx:
   Inline editor for creating/editing a verse note:
   - Props: verseRef, initialText, onSave, onCancel
   - TextInput with auto-focus, multiline, placeholder "Write a note..."
   - Save and Cancel buttons below
   - Background: bgSurface
   - Saves via db/user.ts saveNote()

3. REPLACE the placeholder NotesOverlay with full implementation:

   app/src/components/NotesOverlay.tsx:
   - Full-screen modal
   - Header: "My Notes — {BookName} {Ch}" + close button
   - FlatList of NoteCard components
   - Each NoteCard: verse ref header + note text + timestamp + edit/delete buttons
   - Empty state: "No notes yet. Tap ✏️ next to any verse to start."
   - Delete confirmation: Alert.alert before deleting

4. INTEGRATE notes into VerseBlock:
   - Update VerseBlock: when NoteIndicator is tapped, show inline NoteEditor
     below that verse (or navigate to the note in NotesOverlay)
   - After saving a note, the NoteIndicator changes to gold (hasNote=true)
   - noteCount in ChapterHeader updates reactively

5. INTEGRATE reading history:
   - In ChapterScreen's useEffect on mount: call recordVisit(bookId, ch)
   - This feeds the "Continue Reading" chips on HomeScreen (Phase later)

6. VERIFY:
   - Navigate to Genesis 1
   - Tap pencil icon on verse 1 → NoteEditor appears
   - Type "Test note" → save → pencil turns gold
   - "My Notes (1)" badge appears in header
   - Tap "My Notes (1)" → NotesOverlay opens with the note
   - Delete note → pencil returns to muted, badge disappears
```

---

## Batch 3H: Cross-Ref Popup + Word Study Popup + Scholar Sheet
*The three popups triggered by tapping within panel content.*

### Prompt for Batch 3H

```
Phase 3H: Build CrossRefPopup, WordStudyPopup, and ScholarInfoSheet.

READ _tools/PHASE_3_PLAN.md (Batch 3H section).
READ _tools/REACT_NATIVE_PLAN.md §3.4.

1. REPLACE placeholder CrossRefPopup with full implementation:

   app/src/components/CrossRefPopup.tsx:
   - Triggered by: tapping any TappableReference in any panel
   - Receives: parsedRef (from verseResolver)
   - Bottom sheet (@gorhom/bottom-sheet) with snapPoints ['40%', '70%']
   - Content:
     a. Reference header (e.g., "Genesis 1:1" in Cinzel displayMd gold)
     b. Verse text loaded from SQLite (getVerses for that book/ch/verse)
     c. "Go to chapter →" link that navigates to ChapterScreen
   - If verse range (e.g., Gen 1:1-3): show all verses in range
   - If chapter-only (e.g., Gen 1): show first 5 verses + "Read full chapter →"

2. REPLACE placeholder WordStudyPopup with full implementation:

   app/src/components/WordStudyPopup.tsx:
   - Triggered by: tapping a VHL-highlighted word in verse text
   - Receives: word string (transliteration)
   - Bottom sheet with snapPoints ['35%', '60%']
   - Looks up word in word_studies table via transliteration match
   - Content:
     a. Original script (Hebrew/Greek) in large display
     b. Transliteration (italic)
     c. Strong's number (if available)
     d. Glosses (comma-separated)
     e. Brief note
     f. "See full study →" link → navigate to WordStudyDetailScreen
   - If no match found: show "No word study available for '{word}'"

3. REPLACE placeholder ScholarInfoSheet with full implementation:

   app/src/components/ScholarInfoSheet.tsx:
   - Triggered by: tapping a scholar name in CommentaryPanel header
   - Receives: scholarId
   - Bottom sheet with snapPoints ['40%']
   - Loads scholar from SQLite
   - Content:
     a. Scholar name (Cinzel displayMd) in scholar's accent color
     b. Tradition + era (uiSm textDim)
     c. Brief bio (first section of bio_json, first 200 chars)
     d. "See full bio →" link → navigate to ScholarBioScreen
     e. "Books covered: Genesis, Exodus, ..." from scope_json

4. CREATE a modal provider context for these popups:

   app/src/components/PopupProvider.tsx:
   - React context that provides: openCrossRef(ref), openWordStudy(word),
     openScholarInfo(scholarId)
   - Wraps the app so any component anywhere can trigger these popups
   - Renders the actual bottom sheet components at the root level
   - This avoids prop-drilling onPress handlers through every panel

5. WIRE PopupProvider into App.tsx (wrap inside GestureHandlerRootView).

6. UPDATE TappableReference to use PopupProvider context instead of props.

7. UPDATE CommentaryPanel to use PopupProvider for scholar name taps.

8. UPDATE HighlightedText to use PopupProvider for word study taps.

9. VERIFY:
   - Open Genesis 1, expand MacArthur panel
   - Tap "John 1:1" reference in text → CrossRefPopup shows John 1:1 verse
   - Tap "Go to chapter →" → navigates to John 1
   - Back to Genesis 1, tap a VHL-highlighted word → WordStudyPopup shows
   - Tap "MacArthur" header text → ScholarInfoSheet shows bio preview
```

---

## Batch 3I: Thread Viewer + Authorship Sheet
*The final modals: step-by-step cross-book journey and methodology disclosure.*

### Prompt for Batch 3I

```
Phase 3I: Build ThreadViewerSheet and AuthorshipSheet, then final
integration pass.

READ _tools/PHASE_3_PLAN.md (Batch 3I section).
READ _tools/REACT_NATIVE_PLAN.md §3.7 and §3.1d.

1. REPLACE placeholder ThreadViewerSheet with full implementation:

   app/src/components/ThreadViewerSheet.tsx:
   - Triggered by: tapping a ThreadBadge in ChapterHeader
   - Bottom sheet with snapPoints ['60%', '90%']
   - Props: thread: CrossRefThread (parsed steps_json), initialStepIndex
   - Content:
     a. Thread theme title (Cinzel displayMd, thread accent color)
     b. Step list (FlatList):
        Each step: reference (TappableReference) + type badge + text
        Current step highlighted with gold left border
        Anchor step marked with ★ icon
     c. "Go to chapter →" on each step navigates to that chapter
     d. Step-by-step navigation: previous/next buttons at bottom
   - Thread type badges: "Fulfilment", "Echo", "Expansion", "Contrast"
     each with distinct muted color

2. REPLACE placeholder AuthorshipSheet with full implementation:

   app/src/components/AuthorshipSheet.tsx:
   - Triggered by: tapping "Authorship & Sources ▾" at bottom of chapter
     OR from SettingsScreen "About the commentary" link
   - Bottom sheet with snapPoints ['50%']
   - Static content:
     * "Commentary panels are scholarly paraphrases, not direct quotes."
     * "Each scholar's work is cited by name and edition."
     * "Hebrew/Greek studies are based on standard lexicons (BDB, HALOT, BDAG)."
     * "Cross-references are curated, not algorithmically generated."
     * "Verse text is word-for-word NIV (default) or ESV."
   - Uses bodySm EB Garamond, subdued gold text

3. FINAL INTEGRATION PASS on ChapterScreen:
   - Confirm ALL modals are wired:
     * Qnav: 🔍 button → QnavOverlay ✓
     * Notes: My Notes button → NotesOverlay ✓
     * Cross-ref: TappableReference → CrossRefPopup ✓
     * Word study: VHL word tap → WordStudyPopup ✓
     * Scholar: scholar name tap → ScholarInfoSheet ✓
     * Thread: ThreadBadge → ThreadViewerSheet ✓
     * Authorship: CollapsibleSection → AuthorshipSheet ✓
   - Confirm progressive loading works (verses render first)
   - Confirm single-open panel policy works across section AND chapter panels
   - Confirm prev/next chapter navigation works
   - Confirm translation toggle re-renders verses

4. PERFORMANCE CHECK:
   - Open Genesis 1 (enriched, 5 sections, 18 buttons per section)
   - Measure: time from navigation start → verse text visible
   - Target: < 500ms
   - Measure: scroll FPS through all sections
   - Target: 60 FPS (no jank)
   - Measure: panel expand animation
   - Target: smooth 250ms

5. ACCESSIBILITY CHECK:
   - VoiceOver/TalkBack can navigate through verse numbers
   - Panel buttons are announced with their labels
   - Note indicators are announced with "Edit note" / "Add note"
   - Bottom bar buttons are announced
   - All touch targets >= 44pt

6. Print full component count, integration status for each modal,
   and performance metrics. Commit everything.
```

---

## Batch Summary

| Batch | Description | Components | Tool calls |
|-------|-------------|-----------|-----------|
| **3A** | Utilities + shared components | 6 | ~12 |
| **3B** | Verse rendering (VHL, NoteIndicator, SectionBlock) | 5 | ~10 |
| **3C** | Button row + panel system + 8 section-level panels | 12 | ~14 |
| **3D** | 10 chapter-level panels + ScholarlyBlock | 11 | ~14 |
| **3E** | ChapterScreen orchestrator + nav/bottom bars + header | 7 | ~14 |
| **3F** | Qnav overlay (BookAccordion, search, full modal) | 3 | ~10 |
| **3G** | Notes system + reading history | 4 | ~10 |
| **3H** | CrossRefPopup + WordStudyPopup + ScholarInfoSheet + PopupProvider | 4 | ~12 |
| **3I** | ThreadViewerSheet + AuthorshipSheet + integration + performance | 3 | ~10 |

**Total: 9 batches, 55 components, ~106 tool calls, targeting 4-5 sessions.**

**Dependency graph:**
```
3A ──→ 3B ──→ 3C ──→ 3D ──┐
                            ├──→ 3E ──→ 3F
                            │         ├──→ 3G
                            │         └──→ 3H ──→ 3I
                            │
```

3A through 3D are strictly linear (each builds on the previous).
After 3E (the screen exists), 3F/3G/3H can run in any order.
3I is the final integration pass that requires everything else.

---

## Session Planning

**Session 1:** Batches 3A + 3B (utilities + verse rendering)
**Session 2:** Batch 3C (button/panel system + section panels — this is the densest batch)
**Session 3:** Batches 3D + 3E (chapter panels + ChapterScreen orchestrator)
**Session 4:** Batches 3F + 3G (Qnav + notes)
**Session 5:** Batches 3H + 3I (popups + integration + performance)

---

## Verification Checklist (run after Phase 3 is complete)

- [ ] ChapterScreen renders Genesis 1 with all sections, verses, and VHL highlighting
- [ ] 18 panel types render correctly (7 section + 10 chapter + 1 parameterized commentary)
- [ ] Panel button rows show correct labels and scholar colors
- [ ] Single-open panel policy: only one panel open at a time across entire page
- [ ] Panel expand/collapse animations are smooth (250ms, 60 FPS)
- [ ] Verse text uses EB Garamond, verse numbers use Cinzel (gold superscripts)
- [ ] VHL highlighting colors 5 word groups correctly
- [ ] Translation toggle switches NIV ↔ ESV and re-renders verses
- [ ] Prev/Next chapter navigation works, disabled on first/last
- [ ] Qnav overlay: OT/NT toggle, book accordion, chapter grid, inline search
- [ ] Qnav: selecting a chapter navigates and closes overlay
- [ ] Per-verse note indicators (pencil icons) appear on every verse
- [ ] Creating/editing/deleting notes works via NoteEditor
- [ ] NotesOverlay shows all notes for current chapter with edit/delete
- [ ] "My Notes (N)" badge count updates reactively
- [ ] CrossRefPopup shows verse text when tapping scripture references
- [ ] WordStudyPopup shows lexicon entry when tapping VHL words
- [ ] ScholarInfoSheet shows scholar bio preview when tapping scholar names
- [ ] ThreadBadges appear when chapter has cross-ref threads
- [ ] ThreadViewerSheet shows step-by-step journey with navigation
- [ ] "About This Book →" link navigates to BookIntroScreen
- [ ] Timeline/map deep-links navigate to correct screens (with params)
- [ ] Authorship disclosure collapses/expands
- [ ] Reading history recorded on chapter visit
- [ ] Progressive loading: verses appear first, panels load on demand
- [ ] Chapter load time < 500ms, scroll 60 FPS, panel animation smooth
- [ ] All touch targets >= 44pt, VoiceOver navigable, Dynamic Type respected
