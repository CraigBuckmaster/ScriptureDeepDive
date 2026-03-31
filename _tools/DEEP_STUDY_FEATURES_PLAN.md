# Companion Study — Deep Study Features Implementation Plan

> **Purpose:** Step-by-step implementation guide for Claude Code sessions.  
> **Principle:** 10 new features, zero new buttons.  
> **Architecture:** Composite panels (tabbed interiors) + ambient UI elements.

---

## Pre-Read Checklist

Before starting ANY phase, clone the repo and read:
- `_tools/DEV_GUIDE.md` — conventions, pipeline, gotchas
- `_tools/NEXT_SESSION_PROMPT.md` — current state
- This file — the phase you're executing

---

## Phase 0 — Chapter Panel Categorization

**Goal:** Group the existing 10-11 chapter-level buttons into 3 labeled categories. Zero functionality change, pure UX improvement.

**Why first:** Quick win, establishes the visual pattern for the categorized layout before any new data lands.

### Files to modify

| File | Change |
|------|--------|
| `app/src/utils/panelLabels.ts` | Add `CHAPTER_PANEL_CATEGORIES` constant |
| `app/src/components/ScholarlyBlock.tsx` | Render category headers between button groups |
| `app/src/components/ButtonRow.tsx` | Add optional `categories` prop for grouped rendering |

### Data shape

```typescript
// panelLabels.ts — new export
export const CHAPTER_PANEL_CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'LANGUAGE & FORM', types: ['lit', 'hebtext', 'discourse', 'themes'] },
  { label: 'WORLD BEHIND THE TEXT', types: ['ppl', 'trans', 'src', 'rec'] },
  { label: 'SCHOLARLY TOOLS', types: ['thread', 'tx', 'textual', 'debate'] },
];
```

### Implementation steps

1. Add `CHAPTER_PANEL_CATEGORIES` to `panelLabels.ts`
2. Add a `categories` prop to `ButtonRow` — when present, render category label headers (`fontSize: 8, color: textMuted, letterSpacing: 1.2, fontWeight: 700`) between groups instead of a flat list
3. In `ScholarlyBlock.tsx`, pass `categories={CHAPTER_PANEL_CATEGORIES}` to `ButtonRow` when `isChapterLevel` is true
4. Panels not in any category render in an "OTHER" group at the end
5. Test: open any chapter with 8+ chapter panels, verify visual grouping, verify all panels still toggle correctly

### No content pipeline changes. No DB changes. No type changes.

---

## Phase 1 — Composite Panel Infrastructure

**Goal:** Build a reusable `TabbedPanelRenderer` component that wraps existing panel renderers with internal tab navigation.

**Why second:** This is the foundation component that Phases 2-4 depend on.

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/panels/TabbedPanelRenderer.tsx` | Generic tabbed wrapper for composite panels |

### Files to modify

| File | Change |
|------|--------|
| `app/src/components/panels/PanelRenderer.tsx` | Detect composite data and delegate to TabbedPanelRenderer |
| `app/src/types/index.ts` | Add composite panel type interfaces |

### Component design

```typescript
// TabbedPanelRenderer.tsx
interface TabConfig {
  key: string;          // e.g. 'historical', 'audience', 'ane'
  label: string;        // e.g. 'Historical', 'Audience', 'ANE'
  hasData: boolean;     // false = tab hidden (graceful degradation)
}

interface Props {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: React.ReactNode;  // The active tab's panel content
}
```

### Detection pattern in PanelRenderer

The composite panel pattern is detected by checking for known keys in the parsed JSON data. The panel type stays the same (`hist`, `cross`, `lit`, `tx`) — the data shape determines whether it renders as a simple panel or a tabbed composite.

```typescript
// In PanelRenderer.tsx, inside the 'hist' case:
case 'hist':
  // If data is a string (legacy), render HistoricalContextPanel as-is
  // If data is an object with { historical, audience?, ane? }, render TabbedPanelRenderer
  if (typeof data === 'string') {
    return <HistoricalContextPanel text={data} onRefPress={onRefPress} />;
  }
  if (data && typeof data === 'object' && data.historical) {
    return <CompositeContextPanel data={data} onRefPress={onRefPress} />;
  }
  // Fallback: treat as string
  return <HistoricalContextPanel text={JSON.stringify(data)} onRefPress={onRefPress} />;
```

### Key design decisions

- **Backward compatible:** Old string/array data still renders with existing panels. New object-with-keys data triggers composite view.
- **Tab state is local:** Each TabbedPanelRenderer manages its own active tab via useState. No global state needed.
- **Tab visibility is data-driven:** Tabs only show when their data key is present and non-empty. A `hist` panel with only `historical` data renders without tabs (identical to current behavior).

### Tab styling

- Tab bar: horizontal flex, `borderBottom: 1px solid border`, each tab is flex:1
- Active tab: `borderBottom: 2px solid gold`, `background: gold + '12'`, `color: gold`, `fontWeight: 700`
- Inactive tab: `borderBottom: 2px solid transparent`, `color: #665`, `fontWeight: 500`
- Font: `fontFamily.uiMedium`, `fontSize: 12`
- Close button: right-aligned in the tab bar row

---

## Phase 2 — Context Hub (hist panel upgrade)

**Goal:** Merge `hist` (Historical Context) and `ctx` (Context) into a single "Context" button, and add Audience + ANE tabs.

### What changes

| Before | After |
|--------|-------|
| 2 section buttons: `hist` + `ctx` | 1 section button: `hist` (labeled "Context") |
| `hist` renders plain text | `hist` renders tabbed: Context / Audience / ANE |
| `ctx` is a separate panel | `ctx` content merged into `hist.context` field |

**Net button change: -1 per section** (ctx absorbed into hist)

### Data shape change

```python
# Old shape (string):
panels['hist'] = "The Babylonian Enuma Elish..."

# New shape (object, backward-compatible detection via isinstance check):
panels['hist'] = {
    "context": "Verse 1 functions as a theological prologue...",      # was 'ctx'
    "historical": "The Babylonian Enuma Elish (c. 1100 BCE)...",      # was 'hist'
    "audience": "Moses' original audience had lived 400 years...",     # NEW (optional)
    "ane": [                                                           # NEW (optional)
        {
            "parallel": "Enuma Elish",
            "similarity": "Both begin with watery chaos...",
            "difference": "Where Marduk creates humans from blood...",
            "significance": "Genesis is a deliberate counter-narrative..."
        }
    ]
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/panels/CompositeContextPanel.tsx` | Renders the tabbed Context Hub |

### Files to modify

| File | Change |
|------|--------|
| `app/src/components/panels/PanelRenderer.tsx` | Add composite detection for `hist` case |
| `app/src/utils/panelLabels.ts` | Change `hist` label from `'History'` to `'Context'`; remove `ctx` from `SECTION_PANEL_ORDER` |
| `app/src/types/index.ts` | Add `CompositeContextData` interface |
| `_tools/shared.py` | Update `save_chapter()` to accept new hist shape |
| `_tools/validate.py` | Accept both string and object for hist panel |

### Content pipeline

- **Migration script:** Write a one-time `/tmp/migrate_hist_ctx.py` that walks all chapter JSONs, finds sections with both `hist` and `ctx`, merges them into the new object shape: `{ "historical": old_hist, "context": old_ctx }`. Sections with only `hist` get `{ "historical": old_hist }`. Remove `ctx` key from panels.
- **Enrichment:** `audience` and `ane` fields are added incrementally via future enrichment scripts. They start empty — tabs only show when data exists.
- **Generator template:** Update `_tools/GENERATOR_TEMPLATE.py` to show new hist shape.

### Implementation steps

1. Create `CompositeContextPanel.tsx` using `TabbedPanelRenderer`
2. Create `AudienceView` sub-component (renders plain text with onRefPress)
3. Create `ANEParallelView` sub-component (renders array of parallel objects)
4. Update `PanelRenderer.tsx` hist case with composite detection
5. Update `panelLabels.ts`: `hist: 'Context'`, remove `ctx` from order
6. Write and run migration script to merge hist+ctx across all chapters
7. `python3 _tools/validate.py && python3 _tools/build_sqlite.py && python3 _tools/validate_sqlite.py`
8. Test: verify Genesis 1 section 1 shows "Context" button, opens with tabs, Historical and Context tabs have content, Audience and ANE tabs absent (no data yet)

---

## Phase 3 — Connections Hub (cross panel upgrade)

**Goal:** Add an "Echoes & Allusions" tab to the cross-reference panel.

### Data shape change

```python
# Old shape (array):
panels['cross'] = [
    {"ref": "John 1:1-3", "note": "In the beginning was the Word..."}
]

# New shape (object, backward-compatible):
panels['cross'] = {
    "refs": [
        {"ref": "John 1:1-3", "note": "In the beginning was the Word..."}
    ],
    "echoes": [    # NEW (optional)
        {
            "source_ref": "Genesis 1:1",
            "target_ref": "John 1:1",
            "type": "echo",           # "direct_quote" | "allusion" | "echo" | "typological"
            "source_context": "Genesis opens with God creating by speech...",
            "connection": "John identifies the creative Word as the pre-existent Logos...",
            "significance": "This frames Jesus not as a new figure but as the agent of creation itself."
        }
    ]
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/panels/CompositeConnectionsPanel.tsx` | Tabbed Cross-Refs + Echoes |
| `app/src/components/panels/EchoesView.tsx` | Renders echo/allusion entries |

### Files to modify

| File | Change |
|------|--------|
| `app/src/components/panels/PanelRenderer.tsx` | Composite detection for `cross` case |
| `app/src/utils/panelLabels.ts` | Change `cross` label from `'Cross-Ref'` to `'Connections'` |
| `app/src/types/index.ts` | Add `EchoEntry` and `CompositeConnectionsData` interfaces |

### Content pipeline

- **Migration script:** Walk all chapters, wrap existing cross arrays in `{ "refs": old_array }`. The `echoes` key starts absent.
- **Enrichment:** Echoes data added incrementally. Priority: Genesis 1-3, John 1, Romans 9-11, Hebrews 1-2, Revelation 1.

### Implementation steps

1. Create `EchoesView.tsx` — renders source context, connection type badge, significance
2. Create `CompositeConnectionsPanel.tsx` using TabbedPanelRenderer
3. Update `PanelRenderer.tsx` cross case
4. Update `panelLabels.ts`: `cross: 'Connections'`
5. Write and run migration script
6. Validate, build, test

---

## Phase 4 — Literary Structure Upgrade (chiasm view)

**Goal:** Add an interactive chiasm visualization tab to the existing Literary Structure panel.

### Data shape change

```python
# Existing shape stays:
chapter_panels['lit'] = {
    "rows": [{"label": "Day 1", "text": "Light/darkness", "is_key": False}],
    "note": "The seven days form a framework..."
}

# New optional key:
chapter_panels['lit'] = {
    "rows": [...],
    "note": "...",
    "chiasm": {    # NEW (optional — tab only shows when present)
        "title": "Genesis 1:1 - 2:3 Chiastic Structure",
        "pairs": [
            {
                "label": "A",
                "top": "Creation of heavens and earth (1:1)",
                "bottom": "God rests; creation complete (2:1-3)",
                "color": "#6A5ACD"
            }
        ],
        "center": {
            "label": "X",
            "text": "Land, vegetation, animals, humanity (1:9-13, 24-31)"
        }
    }
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/panels/ChiasmView.tsx` | Interactive chiasm visualization |

### Files to modify

| File | Change |
|------|--------|
| `app/src/components/panels/LiteraryStructurePanel.tsx` | Add tab detection, render ChiasmView when data present |
| `app/src/types/index.ts` | Extend `LitPanel` with optional `chiasm` field |

### ChiasmView design

- Each pair renders as two side-by-side cards with matching background color (at 15% opacity)
- Cards show label (bold, colored) + text (muted)
- Arrow/link indicator between pairs
- Center/focal point renders as a highlighted card spanning full width
- `borderColor` uses the pair's color at 30% opacity

### Content pipeline

- Chiasm data added incrementally to `lit` panels via enrichment scripts
- Priority chapters: Genesis 1, Genesis 6-9 (Flood), Daniel 2-7, Psalm 23, Book of Revelation structure

---

## Phase 5 — Genre Guidance Banner

**Goal:** Add a dismissible genre banner below the chapter header.

### Data changes

```json
// content/meta/books.json — add genre field:
{
  "id": "genesis",
  "name": "Genesis",
  "testament": "ot",
  "total_chapters": 50,
  "book_order": 1,
  "is_live": true,
  "genre": "theological_narrative",
  "genre_label": "Theological Narrative",
  "genre_guidance": "Structured around toledot formulas \u00b7 ANE counter-narrative \u00b7 Focus on who and why, not how and when"
}
```

Genre vocabulary (for all 66 books):
`theological_narrative`, `law`, `wisdom`, `poetry`, `prophecy`, `apocalyptic`, `epistle`, `gospel`, `history`, `lament`, `love_poetry`

Some books have mixed genre — use primary genre with optional `genre_note` for chapters that differ (e.g., Isaiah contains both prophecy and apocalyptic).

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/GenreBanner.tsx` | Dismissible genre guidance chip |

### Files to modify

| File | Change |
|------|--------|
| `content/meta/books.json` | Add `genre`, `genre_label`, `genre_guidance` to all 66 books |
| `_tools/build_sqlite.py` | Include genre fields in books table (add columns) |
| `app/src/screens/ChapterScreen.tsx` | Render `GenreBanner` between `ChapterHeader` and first section |
| `app/src/types/index.ts` | Add genre fields to `Book` interface |
| `app/src/db/database.ts` | Update `getBook()` query to include genre fields |

### GenreBanner behavior

- Renders only when `book.genre_guidance` is truthy
- Dismissible per-session (useState, not persisted — reappears on next chapter)
- Styling: `background: gold + '0A'`, `border: 1px solid gold + '25'`, borderRadius 8, icon + label + guidance text + close button
- Genre label: uppercase, gold, fontSize 10, fontWeight 700, letterSpacing 0.5
- Guidance text: muted, fontSize 10

### Implementation steps

1. Add genre data to all 66 books in `books.json`
2. Add columns to books table in `build_sqlite.py`
3. Update `Book` type, `getBook()` query
4. Create `GenreBanner.tsx`
5. Add to `ChapterScreen.tsx` between header and sections
6. Build, validate, test

---

## Phase 6 — Study Depth Tracking

**Goal:** Track which panels users have opened per section and show progress dots.

### Database change (user.db migration 3)

```sql
CREATE TABLE IF NOT EXISTS study_depth (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  panel_type TEXT NOT NULL,
  first_opened_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(section_id, panel_type)
);
CREATE INDEX idx_study_depth_chapter ON study_depth(chapter_id);
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/DepthDots.tsx` | Tiny dot indicator component |
| `app/src/hooks/useStudyDepth.ts` | Hook to read/write depth data |

### Files to modify

| File | Change |
|------|--------|
| `app/src/db/userDatabase.ts` | Add migration 3 |
| `app/src/components/SectionHeader.tsx` | Add DepthDots beside section title |
| `app/src/components/SectionBlock.tsx` | Call depth recording when panel opens |

### DepthDots design

- Row of tiny circles (width: 4, height: 4, borderRadius: 50%)
- Filled (gold) = panel opened at least once, unfilled (#444) = not yet opened
- Count is based on content panel types available for the section (exclude scholars from count — too many)
- Content panel categories to track: `heb`, `hist`, `cross` (3 base types; could expand as composite tabs are added)

### useStudyDepth hook

```typescript
function useStudyDepth(chapterId: string, sections: Section[], panels: Map<string, SectionPanel[]>) {
  // Returns Map<sectionId, { explored: number, total: number }>
  // On mount: query study_depth table for this chapter
  // Exposes: recordOpen(sectionId, panelType) — INSERT OR IGNORE
}
```

### Implementation steps

1. Add migration 3 to `userDatabase.ts`
2. Create `useStudyDepth.ts` hook
3. Create `DepthDots.tsx` component
4. Integrate into `SectionHeader.tsx` (dots right-aligned)
5. In `SectionBlock.tsx`, call `recordOpen()` when a panel is toggled open
6. Test: open panels, verify dots fill in, verify persistence across chapter navigation

---

## Phase 7 — Study Coach Mode

**Goal:** Toggleable setting that inserts contextual coaching cards between sections.

### Data shape

```python
# In chapter JSON — new optional top-level key:
{
    "chapter_id": "gen1",
    "sections": [...],
    "chapter_panels": {...},
    "coaching": [    # NEW (optional)
        {
            "after_section": 1,
            "tip": "Notice the repeating pattern: 'God said... it was so... God saw it was good.' What breaks the pattern on Day 2?",
            "genre_tag": "narrative_structure"
        },
        {
            "after_section": 3,
            "tip": "Days 1-3 create spaces (light, sky, land). Days 4-6 fill them (luminaries, birds/fish, animals/humans). This parallel structure is intentional.",
            "genre_tag": "literary_pattern"
        }
    ]
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/StudyCoachCard.tsx` | Inline coaching card component |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/ChapterScreen.tsx` | Render coaching cards between sections when enabled |
| `app/src/screens/SettingsScreen.tsx` | Add "Study Coach" toggle |
| `app/src/stores/settingsStore.ts` (or preferences table) | Persist study coach on/off preference |
| `app/src/hooks/useChapterData.ts` | Return coaching array from chapter data |
| `_tools/build_sqlite.py` | Store coaching in chapters table or a new coaching table |
| `_tools/validate.py` | Accept coaching key in chapter schema |

### StudyCoachCard design

- `borderLeft: 3px solid gold`
- `background: gold + '08'`
- `borderRadius: 0 6px 6px 0`
- Header: graduation cap emoji + "STUDY COACH" (gold, fontSize 9, fontWeight 700)
- Body: tip text (muted, fontSize 11, lineHeight 1.5)
- Dismissible per-chapter (local state)

### Content pipeline

- Coaching tips are optional — chapters without them simply don't show cards
- Start with Genesis 1-3, Psalm 23, Romans 1, John 1, Revelation 1 as proof-of-concept
- Tips can be generated in batches via enrichment scripts

---

## Phase 8 — Textual Notes Enrichment (tx panel upgrade)

**Goal:** Add "Manuscript Stories" tab to the existing Textual Notes chapter panel.

### Data shape change

```python
# Existing tx shape (array of entries) stays.
# New composite shape:
chapter_panels['tx'] = {
    "notes": [...existing entries...],
    "stories": [    # NEW (optional, ~30-50 entries total across Bible)
        {
            "title": "The Ending of Mark",
            "passage": "Mark 16:9-20",
            "summary": "The earliest manuscripts end at 16:8...",
            "evidence": [
                {"manuscript": "Codex Sinaiticus (4th c.)", "reading": "Ends at 16:8"},
                {"manuscript": "Codex Vaticanus (4th c.)", "reading": "Ends at 16:8"},
                {"manuscript": "Later manuscripts", "reading": "Include 16:9-20"}
            ],
            "consensus": "Most scholars consider 16:9-20 a later addition...",
            "significance": "The abrupt ending may be intentional — Mark's readers are left to respond."
        }
    ]
}
```

### Implementation: Same pattern as Phases 2-3

1. Create `ManuscriptStoriesView.tsx`
2. Update `TextualPanel.tsx` to detect composite shape and render tabs
3. Migration script to wrap existing tx arrays in `{ "notes": old_array }`
4. Populate stories data for major variants (Mark 16, John 7:53-8:11, 1 John 5:7-8, etc.)

---

## Phase 9 — Progressive Revelation (Concept Explorer upgrade)

**Goal:** Add a "Journey" view to ConceptDetailScreen that visualizes how a concept develops across the canon.

### Data shape change

```json
// content/meta/concepts.json — add journey_stops:
{
  "id": "covenant",
  "title": "Covenant",
  "description": "...",
  "journey_stops": [
    {
      "ref": "Genesis 9:8-17",
      "book": "genesis",
      "chapter": 9,
      "label": "Noahic Covenant",
      "development": "First covenant — universal scope, unilateral, with all creation. No conditions.",
      "what_changes": "God binds himself to never destroy by flood again. The rainbow is the sign."
    },
    {
      "ref": "Genesis 15:1-21",
      "book": "genesis",
      "chapter": 15,
      "label": "Abrahamic Covenant",
      "development": "Narrows from universal to one family. Still unilateral — God passes between the pieces alone.",
      "what_changes": "Land, offspring, and blessing promised. The covenant family begins."
    }
  ]
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/ConceptJourney.tsx` | Timeline-style journey visualization |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/ConceptDetailScreen.tsx` | Add "Journey" tab when journey_stops data exists |
| `content/meta/concepts.json` | Add journey_stops to concepts |
| `_tools/build_sqlite.py` | Include journey data in concepts table |

### ConceptJourney design

- Vertical timeline with connected nodes
- Each node: reference badge + label + development text + "what changes" callout
- Nodes are tappable — navigate to the chapter
- Uses existing timeline visual patterns from TimelineScreen

---

## Phase 10 — Synoptic Diff Highlighting (ParallelPassage upgrade)

**Goal:** Highlight textual differences in parallel passage comparisons with scholarly annotations.

### Data shape change

```json
// content/meta/parallel-passages.json — add diff_annotations:
{
  "id": "beatitudes",
  "refs": ["Matthew 5:1-12", "Luke 6:20-26"],
  "diff_annotations": [
    {
      "location": "Matthew 5:3 / Luke 6:20",
      "diff_type": "theological_emphasis",
      "matthew": "Blessed are the poor in spirit",
      "luke": "Blessed are you who are poor",
      "explanation": "Matthew spiritualizes the poverty; Luke preserves the social/economic dimension. Both are authentic emphases of Jesus' teaching, shaped for different audiences."
    }
  ]
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/DiffAnnotation.tsx` | Inline diff annotation card |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/ParallelPassageScreen.tsx` | Render diff highlights and annotation cards |

### Implementation

- Diff badges: additions (green), omissions (red/dimmed), changes (gold)
- Each annotation is expandable — tap to see explanation
- Only present for Gospel synoptics and Kings/Chronicles pairs

---

## Execution Order & Dependencies

```
Phase 0 (categorization)     — standalone, do first
  ↓
Phase 1 (tabbed infra)       — foundation for 2, 3, 4, 8
  ↓
Phase 2 (Context Hub)        — depends on Phase 1
Phase 3 (Connections Hub)    — depends on Phase 1
Phase 4 (Chiasm View)        — depends on Phase 1
  ↓
Phase 5 (Genre Banner)       — standalone, no dependencies
Phase 6 (Study Depth)        — standalone, no dependencies
Phase 7 (Study Coach)        — standalone, no dependencies
  ↓
Phase 8 (Textual Enrichment) — depends on Phase 1
Phase 9 (Concept Journey)    — standalone
Phase 10 (Synoptic Diffs)    — standalone
```

**Recommended session grouping:**
- Session A: Phases 0 + 1 (categorization + infrastructure)
- Session B: Phases 2 + 3 (Context Hub + Connections Hub)
- Session C: Phase 4 (Chiasm View)
- Session D: Phases 5 + 6 (Genre Banner + Study Depth)
- Session E: Phase 7 (Study Coach)
- Session F: Phases 8 + 9 + 10 (Textual + Concept Journey + Synoptic)

Each session: implement → validate → build → test → commit → update NEXT_SESSION_PROMPT.md.

---

## Content Generation Strategy

Phases 2-4 and 7-10 require new content data. Approach:

1. **Phase 2 (Context Hub):** Migration script merges existing hist+ctx. Audience and ANE data added via enrichment batches — start with Genesis 1-11, Exodus 1-20, Romans, Hebrews.
2. **Phase 3 (Connections):** Echoes data is the most research-intensive. Start with the 50 most important NT→OT allusions (Romans 9-11, Hebrews, Revelation, Matthew fulfillment formulas).
3. **Phase 4 (Chiasm):** Academic chiasm data is well-documented. Start with ~20 most widely accepted chiasms (Genesis 1, 6-9, Daniel 2-7, Psalm 23, major Gospel passages).
4. **Phase 7 (Study Coach):** Tips can be generated per-genre in batches. Start with 5 proof-of-concept chapters.
5. **Phase 8 (Textual):** ~30-50 manuscript stories total. Well-documented in academic literature.
6. **Phase 9 (Concept Journey):** 20 concepts × 5-10 stops each = ~100-200 entries.
7. **Phase 10 (Synoptic Diffs):** ~20-30 parallel passage pairs with annotations.

All content follows the standard enrichment script pattern:
1. Write generator to `/tmp/`
2. Syntax-check, run, verify counts
3. Validate → build → validate_sqlite
4. Delete script, commit, push

---

## Commit Convention

```
feat(panels): Phase 0 — categorize chapter-level panel buttons
feat(panels): Phase 1 — TabbedPanelRenderer composite infrastructure
feat(panels): Phase 2 — Context Hub (hist+ctx merge, audience/ANE tabs)
feat(panels): Phase 3 — Connections Hub (echoes/allusions tab)
feat(panels): Phase 4 — chiasm visualization for Literary Structure
feat(ui): Phase 5 — genre guidance banner
feat(tracking): Phase 6 — study depth dots
feat(ui): Phase 7 — study coach mode
feat(panels): Phase 8 — manuscript stories in Textual Notes
feat(explore): Phase 9 — progressive revelation journey
feat(parallel): Phase 10 — synoptic diff highlighting
```

---

## Validation Checklist Per Phase

- [ ] `python3 _tools/validate.py` passes (content integrity)
- [ ] `python3 _tools/build_sqlite.py` succeeds (DB build)
- [ ] `python3 _tools/validate_sqlite.py` passes (DB integrity)
- [ ] `npx tsc --noEmit --pretty` from `app/` — no type errors in modified files
- [ ] Existing panels still work (backward compatibility)
- [ ] New composite tabs only appear when data is present
- [ ] Panel close/toggle behavior unchanged
- [ ] No inline `style={{ }}` objects — use `StyleSheet.create()`
