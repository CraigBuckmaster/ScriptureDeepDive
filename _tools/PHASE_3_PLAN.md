# Phase 3: ChapterScreen — Implementation Plan

## Overview

**Goal:** Build the complete ChapterScreen experience — the screen where 90% of user time is spent. This includes verse rendering with VHL highlighting, all 17 panel types, the button/panel toggle system, the Qnav overlay, per-verse notes, cross-reference popups, the thread viewer, and all supporting modals.

**Dependencies:** Phase 2 complete. The design system, TypeScript types, data access layer, hooks, navigation skeleton, and Zustand stores all exist.

**Component count:** 49 components total, organized into 9 batches.

**Batching strategy:** Build from the inside out:
1. Utilities (verse resolver, reference parser) — no UI dependency
2. Shared primitives (CollapsibleSection, TappableReference, LoadingSkeleton) — used by everything
3. Verse rendering (HighlightedText, VerseBlock, NoteIndicator) — the core reading experience
4. Section-level panels (7 types) — the per-section scholarly content
5. Chapter-level panels (10 types) + PanelRenderer — the chapter-wide scholarly content
6. Button/panel system (ButtonRow, PanelContainer, ScholarlyBlock) — the toggle mechanics
7. ChapterScreen assembly (nav bar, bottom bar, header, scroll layout)
8. Modals (Qnav, Notes, CrossRef, WordStudy, Scholar, Thread, Authorship)
9. Integration + polish (progressive loading, pre-fetch, accessibility audit)

---

## Button Type → Panel Type → Label Mapping

This is the Rosetta Stone. The PWA's `btn_row()` maps button CSS classes to panel IDs. The React Native app maps `panel_type` from SQLite to components.

### Section-level buttons

| Button class (PWA) | Panel type (DB) | Display label | Component |
|-------------------|----------------|---------------|-----------|
| `hebrew` | `heb` | Hebrew ▾ | HebrewPanel |
| `history` | `hist` | History ▾ | HistoricalContextPanel |
| `context` | `ctx` | Context ▾ | ContextPanel |
| `cross` | `cross` | Cross-Ref ▾ | CrossRefPanel |
| `macarthur` | `mac` | MacArthur ▾ | CommentaryPanel |
| `calvin` | `calvin` | Calvin ▾ | CommentaryPanel |
| `netbible` | `netbible` | NET Notes ▾ | CommentaryPanel |
| `sarna` | `sarna` | Sarna ▾ | CommentaryPanel |
| *(any scholar key)* | *(scholar key)* | *(Scholar label) ▾* | CommentaryPanel |
| `places` | `poi` | Places ▾ | PlacesPanel |
| `timeline` | `tl` | Timeline ▾ | TimelinePanel |

### Chapter-level buttons

| Button class (PWA) | Panel type (DB) | Display label | Component |
|-------------------|----------------|---------------|-----------|
| `literary` | `lit` | Literary Structure | LiteraryStructurePanel |
| `hebrew-text` | `hebtext` | Hebrew-Rooted Reading | HebrewReadingPanel |
| `themes` | `themes` | Theological Themes | ThemesRadarPanel |
| `people` | `ppl` | People | PeoplePanel |
| `translations` | `trans` | Translations | TranslationPanel |
| `sources` | `src` | Ancient Sources | SourcesPanel |
| `reception` | `rec` | Reception History | ReceptionPanel |
| `threading` | `thread` | Intertextual Threading | ThreadingPanel |
| `textual` | `textual` | Textual Notes | TextualPanel |
| `debate` | `debate` | Scholarly Debates | DebatePanel |

### Label resolution utility

```typescript
// utils/panelLabels.ts
const PANEL_LABELS: Record<string, string> = {
  heb: 'Hebrew', hist: 'History', ctx: 'Context', cross: 'Cross-Ref',
  poi: 'Places', tl: 'Timeline', lit: 'Literary Structure',
  hebtext: 'Hebrew-Rooted Reading', themes: 'Theological Themes',
  ppl: 'People', trans: 'Translations', src: 'Ancient Sources',
  rec: 'Reception History', thread: 'Intertextual Threading',
  textual: 'Textual Notes', debate: 'Scholarly Debates',
};
export function getPanelLabel(type: string): string {
  if (PANEL_LABELS[type]) return PANEL_LABELS[type];
  const scholar = getScholar(type);
  return scholar?.label ?? type;
}
```

---

## Batch 3A: Utility Layer (Verse Resolver + Reference Parser)
*Port verse-resolver.js to TypeScript. Build reference auto-linking.*

### Prompt for Batch 3A

```
Phase 3A: Port verse-resolver.js to TypeScript and build the reference
parser for auto-linking scripture references in panel text.

READ _tools/PHASE_3_PLAN.md (Batch 3A section).
READ _tools/REACT_NATIVE_PLAN.md §3.4 for cross-reference resolution spec.

The PWA's verse-resolver.js (14KB) parses reference strings like
"Gen 1:1-3", "1 Cor 13:4-7", "Ps 23" and resolves them to structured
data. It has a BOOK_TABLE with all 66 books: dir, name, short, testament,
chapters.

1. CREATE app/src/utils/verseResolver.ts:
   BOOK_TABLE: const array of 66 entries:
   { id: 'genesis', name: 'Genesis', short: 'Gen', testament: 'ot', chapters: 50 }
   Include ALL standard abbreviations for all 66 books.

   Export:
   a. parseReference(refString: string): ParsedRef | null
      Handles: "Gen 1:1", "Gen 1:1-3", "Gen 1:1–2:3", "1 Cor 13",
      "Ps 23", "Genesis 1:1"
      Returns: { bookId, bookName, chapter, verseStart?, verseEnd? }

   b. resolveVerseText(ref: ParsedRef, translation: string): string[]
      Queries SQLite verses table for the actual verse text.

   c. getBookByName(name: string): BookEntry | null
      Fuzzy matching on name, short, and common variations.

   d. splitMultiRef(refString: string): string[]
      Splits "Gen 1:1; Ex 3:14; John 1:1" into individual ref strings.

   e. isLive(bookId: string): boolean
      Checks books table.

2. CREATE app/src/utils/referenceParser.ts:
   Given a block of text (e.g., commentary note), find ALL embedded
   scripture references and return their positions for auto-linking.
   Export: extractReferences(text: string): { ref: string, start: number, end: number }[]
   Regex patterns for: "See Genesis 3:15", "cf. Rom 8:28-30",
   "Isaiah 53:4–6 and Psalm 22:1"

3. CREATE app/src/utils/panelLabels.ts:
   PANEL_LABELS map + getPanelLabel(type) function as shown above.

4. TEST all functions with 6+ cases. Print PASS/FAIL.
```

---

## Batch 3B: Shared Primitives
*Reusable components used across all panels and the chapter layout.*

### Prompt for Batch 3B

```
Phase 3B: Build shared primitive components used throughout ChapterScreen.

READ _tools/PHASE_3_PLAN.md (Batch 3B section).

1. CREATE app/src/components/CollapsibleSection.tsx:
   Animated expand/collapse using react-native-reanimated.
   Props: { title: string, initiallyCollapsed?: boolean,
            accentColor?: string, children: ReactNode }
   - Title row with rotating chevron
   - Animated height via useAnimatedStyle + withTiming
   - accessibilityRole="button", announces expanded/collapsed

2. CREATE app/src/components/TappableReference.tsx:
   Auto-links scripture references within any text.
   Props: { text: string, style?: TextStyle,
            onRefPress: (ref: ParsedRef) => void }
   - Uses extractReferences() to find refs
   - Splits into plain + tappable segments
   - Tappable spans: gold underline, onPress → CrossRefPopup
   - No refs found → renders plain text (zero overhead)

3. CREATE app/src/components/LoadingSkeleton.tsx:
   Shimmer placeholder.
   Props: { lines?: number, width?: DimensionValue, height?: number }
   - Animated opacity pulse (reanimated)
   - Dark theme: bgElevated ↔ bgSurface

4. CREATE app/src/components/ScholarTag.tsx:
   Colored name tag for scholars.
   Props: { scholarId: string, onPress?: () => void }
   - BG: scholar color at 15% opacity
   - Text + border: scholar color
   - Tap → ScholarInfoSheet

5. CREATE app/src/components/BadgeChip.tsx:
   Generic pill-shaped chip.
   Props: { label: string, icon?: ReactNode, color?: string,
            onPress?: () => void }
   - Used for: thread badges, era tags, "LIVE" badges

6. VERIFY all 5 in a test screen. Confirm animations, colors, taps.
```

---

## Batch 3C: Verse Rendering Engine
*HighlightedText, VerseBlock, SectionBlock — the core reading components.*

### Prompt for Batch 3C

```
Phase 3C: Build the verse rendering engine — VHL highlighting, per-verse
note indicators, section layout.

READ _tools/PHASE_3_PLAN.md (Batch 3C section).
READ _tools/REACT_NATIVE_PLAN.md §3.3 for VHL spec.

1. CREATE app/src/components/HighlightedText.tsx:
   The VHL engine for verse text.
   Props: { text, groups: VHLGroup[], activeGroups: string[],
            onWordPress?, style? }
   Algorithm:
   a. Split text into words (preserve attached punctuation)
   b. For each word, check against active groups' word lists (case-insensitive)
   c. Matched: colored Text with onPress. Colors by css_class:
      vhl-divine → panels.heb.accent (#e890b8)
      vhl-place → panels.poi.accent (#30a848)
      vhl-person → panels.ppl.accent (#e86040)
      vhl-time → tl accent (blue)
      vhl-key → gold (#c9a84c)
   d. Unmatched: plain Text
   e. Memoize: only recompute when text or activeGroups change

2. CREATE app/src/components/NoteIndicator.tsx:
   Per-verse pencil icon.
   Props: { verseNum, hasNote, onPress }
   - Pencil: gold if hasNote, textMuted if not
   - 44pt touch target, accessibilityLabel

3. CREATE app/src/components/VerseBlock.tsx:
   All verses for one section.
   Props: { verses, vhlGroups, activeVhlGroups, notedVerses: Set<number>,
            onWordPress, onNotePress, fontSize }
   Per verse: superscript number (gold, Cinzel) + HighlightedText + NoteIndicator
   EB Garamond body text, fontSize from settingsStore.

4. CREATE app/src/components/SectionHeader.tsx:
   Props: { header: string }
   Cinzel font, gold accent, border-bottom.

5. CREATE app/src/components/SectionBlock.tsx:
   Container: header + verses + button row + panel area.
   Props: { section, panels, verses, vhlGroups, activeVhlGroups,
            notedVerses, activePanel, onPanelToggle, onWordPress,
            onNotePress, onRefPress }

6. VERIFY with Genesis 1: load sections + verses, render first section,
   confirm VHL colors, note indicators, font rendering.
```

---

## Batch 3D: Section-Level Panel Components (7 types)
*Hebrew, Context, History, Cross-Ref, Commentary, Places, Timeline.*

### Prompt for Batch 3D

```
Phase 3D: Build all 7 section-level panel components.

READ _tools/PHASE_3_PLAN.md (Batch 3D section + Rosetta Stone).
READ _tools/PHASE_1_PLAN.md "Data Format Definitions" for JSON schemas.

All panels share: bg/border/accent from getPanelColors(type),
3px left border, body in EB Garamond, title in Cinzel 12pt.

1. HebrewPanel: HebEntry[] → word (accent, large) + tlit (gold-dim italic)
   + gloss (gold bold) + paragraph (bodyMd, TappableReference)

2. ContextPanel: string → paragraph with TappableReference. ctx green.

3. HistoricalContextPanel: string → same as ContextPanel. hist blue.

4. CrossRefPanel: CrossRefEntry[] → per entry: ref (accent, tappable →
   CrossRefPopup) + note (bodyMd, TappableReference)

5. CommentaryPanel: CommentaryEntry[], scholarId → ScholarTag header +
   source line + per entry: ref (scholar color) + note (TappableReference).
   Scholar color from getScholarColor(scholarId).

6. PlacesPanel: PlaceEntry[] → place cards. Tap name → MapScreen.
   poi green (#30a848).

7. TimelinePanel: TimelineEvent[] → event cards with date badge.
   Tap → TimelineScreen. tl blue.

8. VERIFY: render each with Genesis 1 section panel data.
```

---

## Batch 3E: Chapter-Level Panel Components (10 types) + PanelRenderer
*Literary, HebrewReading, Themes radar, People, Translation, Sources, Reception, Threading, Textual, Debate.*

### Prompt for Batch 3E

```
Phase 3E: Build all 10 chapter-level panel components + PanelRenderer.

READ _tools/PHASE_3_PLAN.md (Batch 3E section + Rosetta Stone).
READ _tools/PHASE_1_PLAN.md "Data Format Definitions" for JSON schemas.

1. LiteraryStructurePanel: { rows: LitRow[], note } → vertical list,
   is_key rows get gold left border. lit yellow-green.

2. HebrewReadingPanel: HebEntry[] → interlinear list. hebText gold.

3. ThemesRadarPanel: { scores: ThemeScore[], note } → SVG radar chart.
   react-native-svg: 5 concentric Circles, 10 axis Lines from center,
   gold Polygon connecting scores, SvgText labels at outer edge.
   Chart 240x240. Note below in bodySm italic.

4. PeoplePanel: PersonEntry[] → 2-col card grid. Name (accent, tappable
   → PersonSidebar) + role + text. ppl orange.

5. TranslationPanel: { title, rows: TransRow[] } → table layout.
   Version label (uiBold) + text (bodyMd). trans teal.

6. SourcesPanel: SourceEntry[] → title (displaySm) + quote (italic)
   + note (bodySm). src purple.

7. ReceptionPanel: same as SourcesPanel. rec pink.

8. ThreadingPanel: ThreadEntry[] → anchor→target with arrow + type badge
   + text with TappableReference. thread purple.

9. TextualPanel: TextualEntry[] → ref header + title + content (with
   MT:/LXX:/DSS: labels highlighted) + note. tx blue-purple.

10. DebatePanel: DebateEntry[] → topic heading + per position: ScholarTag
    + position text. debate muted-red.

11. PanelRenderer.tsx: dispatch map — PANEL_COMPONENTS Record +
    fallback to CommentaryPanel for unknown types (scholars).

12. VERIFY: load genesis_1 chapter panels, render each type.
    Confirm radar chart SVG, people card taps, threading arrows.
```

---

## Batch 3F: Button/Panel Toggle System + Scholarly Block
*The toggle mechanics, animated containers, and scholarly block layout.*

### Prompt for Batch 3F

```
Phase 3F: Build button row, panel container, and scholarly block.

READ _tools/PHASE_3_PLAN.md (Batch 3F section + Rosetta Stone).

1. PanelButton.tsx: single toggle button.
   Props: { label, panelType, isActive, scholarId?, onPress }
   Cinzel 10-11px. Default: border + textDim. Active: accent bg 20% +
   accent border + accent text. Scholar buttons use getScholarColor().
   Chevron ▾ for section panels. Min 44pt touch.

2. ButtonRow.tsx: horizontal ScrollView of PanelButtons.
   Props: { panels, activePanel, onToggle }
   Button order: section = heb,hist,ctx,cross,[scholars],poi,tl
   Chapter = lit,hebtext,themes,ppl,trans,src,rec,thread,textual,debate

3. PanelContainer.tsx: animated expand/collapse wrapper.
   Props: { panelType, contentJson, isOpen }
   Reanimated height animation. Renders PanelRenderer inside.
   Left border (3px accent) + bg + padding.

4. ScholarlyBlock.tsx: container for chapter-level panels.
   Props: { chapterPanels, activePanel, onToggle }
   Divider with "SCHOLARLY BLOCK" label, ButtonRow, PanelContainer.

5. UPDATE SectionBlock: wire ButtonRow + PanelContainer.
   Single-open policy from readerStore: tap section panel → close any
   open panel (in any section or chapter), open this one.

6. VERIFY Genesis 1: tap Hebrew → expands. Tap Context → Hebrew
   collapses, Context expands. Tap Context → closes. Chapter-level
   Literary Structure → opens. Single-open across section+chapter.
```

---

## Batch 3G: ChapterScreen Assembly + Nav Chrome
*Assemble ChapterScreen from all sub-components.*

### Prompt for Batch 3G

```
Phase 3G: Assemble ChapterScreen with nav bar, header, scroll, bottom bar.

READ _tools/PHASE_3_PLAN.md (Batch 3G section).
READ _tools/REACT_NATIVE_PLAN.md §3.1–3.1e for full layout + specs.

1. ChapterNavBar.tsx (full implementation):
   ← Library | Book Ch.N | ← 🔍 →
   Back → BookListScreen. Prev/Next disabled on first/last.
   Qnav trigger → opens QnavOverlay. Sticky with safe area.

2. BottomBar.tsx:
   ← Prev | NIV ↔ ESV | Next →
   Translation toggle: animated pill slider. Sticky bottom.

3. ChapterHeader.tsx:
   Title (displayLg) + subtitle (bodyMd italic) + action bar
   (NotesButton + "About This Book →") + timeline deep-link
   (if not null) + map story deep-link (if not null) + thread
   badge bar (if threads exist).

4. ChapterScreen.tsx (full implementation):
   - useChapterData hook for all data
   - useEffect: recordVisit + prefetch adjacent chapters
   - useNotedVerses for note indicators
   - ScrollView with: ChapterHeader → sections.map(SectionBlock) →
     ScholarlyBlock → Authorship CollapsibleSection
   - ChapterNavBar sticky top, BottomBar sticky bottom
   - QnavOverlay + NotesOverlay rendered as children

5. VERIFY Genesis 1: nav bar, title, timeline link "See on Timeline —
   Creation", 5 sections with verses, button rows, scholarly block,
   bottom bar NIV/ESV toggle, Next navigates to Genesis 2.
```

---

## Batch 3H: All Modals
*Qnav, Notes, CrossRef, WordStudy, Scholar, Thread, Authorship.*

### Prompt for Batch 3H

```
Phase 3H: Build all 7 modal components to full implementation.

READ _tools/PHASE_3_PLAN.md (Batch 3H section).
READ _tools/REACT_NATIVE_PLAN.md §3.5 (Qnav), §3.6 (Notes), §3.7 (Thread).

1. QnavOverlay.tsx (full — replace placeholder):
   Full-screen Modal. Header: X + "Navigate". Search bar with
   debounced useSearch. OT/NT toggle (gold underline). FlatList of
   BookAccordion: tappable book row → expand chapter grid (flexWrap
   44x44 number buttons). Live chapters gold, non-live muted.
   Tap chapter → onSelectChapter + close. Remembers testament toggle.

2. NotesOverlay.tsx (full):
   Full-screen Modal. Header: book + chapter + close. FlatList of
   NoteCard (ref, text, date, edit/delete). Empty state message.
   Edit: inline TextInput, save on blur. Delete: confirm alert.
   NoteEditor: Modal with TextInput + verse ref + Save/Cancel.

3. CrossRefPopup.tsx (full):
   Centered Modal (80% width). Reference header, resolved verse text,
   "Go to chapter" button, close. Triggered by TappableReference.

4. WordStudyPopup.tsx (full):
   Bottom sheet ['40%','70%']. Hebrew/Greek word large, tlit, gloss,
   Strongs, range, note. "See full study →" link. Triggered by VHL tap.

5. ScholarInfoSheet.tsx (full):
   Bottom sheet ['35%','60%']. Name, tradition, era, eyebrow, brief bio.
   "See full bio →" link. Triggered by ScholarTag tap.

6. ThreadViewerSheet.tsx (full):
   Bottom sheet ['60%','90%']. Thread theme name header. FlatList of
   ThreadSteps: circle + connecting line + ref (tappable) + type badge
   + text. Current chapter step highlighted gold. "Go to chapter" per step.

7. AuthorshipSheet.tsx (full):
   Bottom sheet ['50%']. Static methodology/attribution content.

8. VERIFY: Genesis 1 → Qnav search "Abraham" → results. Notes → empty
   state → add note → badge updates. Cross-ref tap → popup. VHL tap →
   word study. ScholarTag tap → bio sheet. Thread badge → step viewer.
```

---

## Batch 3I: Integration, Progressive Loading, Accessibility
*Wire everything together. Performance tune. Accessibility audit.*

### Prompt for Batch 3I

```
Phase 3I: Integration, progressive loading, pre-fetch, accessibility.

READ _tools/PHASE_3_PLAN.md (Batch 3I section).

1. PROGRESSIVE LOADING: ChapterScreen phased rendering:
   Phase 1 (immediate): verse text + section headers
   Phase 2 (50ms via InteractionManager): button rows
   Phase 3 (on tap): panel content from SQLite

2. PRE-FETCH: on mount, load prev/next chapter data into cache Map.
   On navigate, check cache → instant transition.

3. SCROLL: reset to top on chapter nav. Restore position after modal.

4. ACCESSIBILITY AUDIT:
   - All buttons: accessibilityLabel + accessibilityRole
   - Verse numbers announced by VoiceOver
   - PanelButton: accessibilityState={{ selected: isActive }}
   - PanelContainer: accessibilityLiveRegion="polite"
   - Modals: focus trapping, escape to close
   - Dynamic Type: fontSize from settingsStore scales correctly
   - Contrast: all text on dark bg meets WCAG AA (4.5:1)

5. EDGE CASES:
   - 1-section chapter (some Psalms)
   - 10-section chapter (scroll performance)
   - No deep-links → links don't render
   - No threads → badge bar hidden
   - Unenriched chapter (7 buttons)
   - Enriched chapter (15+ buttons — horizontal scroll)
   - Empty scholarly block
   - Long panel content (internal scroll)
   - Rapid prev/next tapping (no stale data)

6. PERFORMANCE:
   - Chapter load < 500ms
   - Panel expand: 60 FPS
   - VHL render: no jank on 30-verse sections
   - Qnav open: < 200ms
   - Search: < 300ms after debounce

7. Commit everything. Print component count, test results.
```

---

## Batch Summary

| Batch | Description | Components | Tool calls |
|-------|-------------|-----------|-----------|
| **3A** | Verse resolver + reference parser + panel labels | 3 utils | ~8 |
| **3B** | Shared primitives (Collapsible, TappableRef, Skeleton, ScholarTag, BadgeChip) | 5 | ~8 |
| **3C** | Verse rendering (HighlightedText, VerseBlock, NoteIndicator, SectionHeader, SectionBlock) | 5 | ~10 |
| **3D** | Section-level panels (Hebrew, Context, History, CrossRef, Commentary, Places, Timeline) | 7 | ~10 |
| **3E** | Chapter-level panels (10 types) + PanelRenderer | 11 | ~12 |
| **3F** | Button/panel system (PanelButton, ButtonRow, PanelContainer, ScholarlyBlock) | 4 | ~8 |
| **3G** | ChapterScreen assembly (NavBar, BottomBar, ChapterHeader, full ChapterScreen) | 4 | ~12 |
| **3H** | All modals (Qnav, Notes, CrossRef, WordStudy, Scholar, Thread, Authorship) | 10+ | ~14 |
| **3I** | Progressive loading, pre-fetch, scroll, accessibility, edge cases, perf | 0 new | ~10 |

**Total: 9 batches, ~92 tool calls, targeting 4-5 sessions.**

**Dependency graph:**
```
3A ──→ 3B ──→ 3C ──→ 3D ──┐
                            ├──→ 3F ──→ 3G ──→ 3H ──→ 3I
                     3E ────┘
```

3D and 3E can run in the same session (independent of each other). Both must complete before 3F.

---

## Session Planning

**Session 1:** Batches 3A + 3B (utilities + primitives)
**Session 2:** Batch 3C (verse rendering — complex + performance-critical)
**Session 3:** Batches 3D + 3E (all 17 panel components)
**Session 4:** Batches 3F + 3G (toggle system + ChapterScreen assembly)
**Session 5:** Batches 3H + 3I (all modals + integration/polish)

---

## Verification Checklist (run after Phase 3 is complete)

- [ ] verseResolver parses all reference formats (6+ test cases pass)
- [ ] referenceParser extracts refs from prose text
- [ ] panelLabels maps all 18+ panel types to labels
- [ ] CollapsibleSection animates expand/collapse
- [ ] TappableReference auto-links refs in text
- [ ] HighlightedText colors VHL words (5 group types × 5 colors)
- [ ] VerseBlock renders verse nums, text, note indicators
- [ ] All 7 section panels render with correct accent colors
- [ ] All 10 chapter panels render with correct accent colors
- [ ] ThemesRadarPanel SVG renders 10 axes correctly
- [ ] CommentaryPanel renders with scholar-specific colors (42 scholars)
- [ ] PanelRenderer dispatches to correct component for all types
- [ ] ButtonRow renders labels and order per section
- [ ] PanelContainer animates at 60 FPS
- [ ] Single-open policy works across section AND chapter panels
- [ ] ChapterNavBar: back, prev/next (disabled states), Qnav trigger
- [ ] BottomBar: prev/next, NIV↔ESV toggle
- [ ] ChapterHeader: title, subtitle, notes, intro link, deep-links, badges
- [ ] QnavOverlay: OT/NT toggle, accordion, chapter grid, search
- [ ] NotesOverlay: view/edit/delete, empty state, badge updates
- [ ] CrossRefPopup: verse text + "Go to chapter"
- [ ] WordStudyPopup: lexicon card from VHL tap
- [ ] ScholarInfoSheet: quick bio from ScholarTag tap
- [ ] ThreadViewerSheet: step-by-step journey, current step highlighted
- [ ] Progressive loading: verses first → buttons → panels on tap
- [ ] Pre-fetch: prev/next transitions near-instant
- [ ] Scroll resets on chapter navigation
- [ ] All elements have accessibility labels
- [ ] Dynamic Type font scaling works
- [ ] Chapter load < 500ms, panel expand 60 FPS, search < 300ms
- [ ] Tested: 1-section, 10-section, unenriched, enriched chapters
