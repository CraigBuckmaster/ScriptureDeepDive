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

## CRITICAL — What Is NOT Changing

This plan is **purely additive**. Every existing feature on the chapter page is preserved exactly as-is. Nothing is being replaced, removed, or redesigned. The wireframes used during planning simplified the UI for readability — they are NOT replacement specs.

### ChapterScreen features that MUST remain untouched:

| Component | File | What it does |
|-----------|------|--------------|
| **ChapterNavBar** | `components/ChapterNavBar.tsx` | Full nav bar: Book Name ▾ (Qnav picker) \| ‹ chapter# › (prev/next arrows) \| ⓘ (book intro). DO NOT simplify or replace. |
| **QnavOverlay** | `components/QnavOverlay.tsx` | Full-screen book/chapter quick-navigation modal. Triggered by tapping book name or chapter number in nav bar. |
| **NotesOverlay** | `components/notes/NotesOverlay.tsx` | 3-tab notes system (chapter notes, collections, search). Triggered by note badges and verse-level note icons. |
| **ChapterHeader** | `components/ChapterHeader.tsx` | Title, subtitle, and tappable BadgeChip pills (timeline link, map link, notes count). |
| **Reading progress bar** | Inline in `ChapterScreen.tsx` | 2px gold bar below nav bar tracking scroll position. |
| **SectionHeader** | `components/SectionHeader.tsx` | Cinzel gold heading with bottom border for each section. |
| **VerseBlock + VHL** | `components/VerseBlock.tsx` | Verse text rendering with Verse Highlight Links (colored tappable words that open relevant panels). |
| **SectionBlock** | `components/SectionBlock.tsx` | Container: SectionHeader → VerseBlock → ButtonRow → active panel. VHL tap handler resolves panel types. |
| **ButtonRow** | `components/ButtonRow.tsx` | Section-level: content buttons (square) + divider + scholar pills. Wrapping flex layout. |
| **PanelButton** | `components/PanelButton.tsx` | Individual toggle: square for content, pill for scholars. Gold active state. |
| **PanelContainer** | `components/PanelContainer.tsx` | Panel wrapper with close button, colored left border, header. |
| **ScholarlyBlock** | `components/ScholarlyBlock.tsx` | "CHAPTER ANALYSIS" divider + chapter-level ButtonRow + active panel. |
| **Swipe navigation** | `ChapterScreen.tsx` (onTouchStart/End) | Horizontal swipe to navigate between chapters. |
| **TTSControls** | `components/TTSControls.tsx` | Play/pause, skip, speed control (exists as component, integration in progress). |
| **All existing panel types** | `components/panels/*.tsx` | Every existing panel renderer (Hebrew, Context, Historical, CrossRef, Commentary, Places, Timeline, Literary Structure, Hebrew Reading, Themes Radar, People, Translation, Sources, Reception, Threading, Textual, Debate, Discourse) continues to work unchanged for existing data shapes. |

### The integration rules:

1. **New ambient UI (genre banner, depth dots, coach cards) is INSERTED between existing components** — never replacing them.
2. **Composite panels enhance existing panels** — they detect new data shapes and render tabs, but old data shapes still render exactly as before through the same code paths.
3. **Phase 0 (chapter categorization) only adds category label headers** between existing buttons. Same buttons, same order, same behavior.
4. **No component is deleted, renamed, or restructured** unless explicitly stated in a phase's "Files to modify" table.

### Theme system awareness

A separate Theme System (Dark / Sepia / Light) is planned — see `_tools/THEME_PLAN.md`. All new components created in these phases must follow whichever color convention is active at build time:

- **If theme infrastructure has shipped (Batch T1):** Use `const { base } = useTheme()` for all color references. Never import `base` directly from `theme/colors`.
- **If theme infrastructure has NOT shipped yet:** Use `import { base } from '../theme'` as normal. These files will be migrated later during the theme rollout.

**Style convention (applies regardless of theme status):** Use `StyleSheet.create()` for layout (dimensions, padding, flex, border radii). Apply colors dynamically via array syntax: `[styles.card, { backgroundColor: base.bgElevated }]`. This keeps layout static and cacheable while allowing colors to be theme-reactive.

**Highlight colors (Phase 19):** The 5 highlight colors (gold, blue, green, pink, purple) were designed for dark backgrounds. When theming ships, these will need per-theme variants to maintain contrast on sepia/light backgrounds. Plan for a `highlightColors` key in the theme palette.

---

## PRE-LAUNCH DEPENDENCY — Translation Licensing

**Status: BLOCKING for premium tier launch. Must be resolved before any paid features go live.**

CS currently displays NIV and ESV verse text in a free app. Once a paid tier (Companion+) exists, the app is considered **commercial** regardless of whether translations are in the free tier.

### NIV (Biblica)

Biblica's General Use Guidelines explicitly state non-commercial means: *"no sales, subscriptions, advertising, monetization, or commercial exploitation of any kind."* A freemium app with a paid tier does NOT qualify as non-commercial.

**Action required:**
1. Submit a Permission Request Form at `biblica.com/permissions/`
2. Full-text digital licensing requires a **registered legal entity** (not an individual)
3. Royalty fees are case-by-case — expect a response within 10 business days
4. Alternative: API.Bible (American Bible Society) offers express commercial licensing starting at **$10/month per translation**

### ESV (Crossway)

ESV API terms state "free for non-commercial use." Commercial use requires separate permission.

**Action required:**
1. Contact Crossway permissions for commercial app licensing
2. Or use API.Bible's express licensing ($10/month)

### Options

| Option | NIV Cost | ESV Cost | Complexity |
|--------|----------|----------|------------|
| Direct publisher licenses | Case-by-case royalty | Case-by-case | Requires legal entity, negotiation |
| API.Bible commercial tier | ~$10/month | ~$10/month | Simpler — express licensing, API integration |
| Move NIV/ESV to premium only | $0 (not distributed in free tier) | $0 | Weakens free tier significantly |
| Keep free tier, launch premium WITHOUT translations change | ⚠ Risk | ⚠ Risk | May violate current license terms |

**Recommendation:** Apply to Biblica and Crossway directly first. If the process is slow or costly, API.Bible at $20/month total for both translations is a clean fallback. Do NOT launch a paid tier without resolving this — the publishers actively enforce licensing terms.

**Timeline:** Start this process NOW. It can take 2-4 weeks for responses. Don't let it become the bottleneck when the code is ready.

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

---

# PART 2 — Competitive Gap Features (Phases 11–16)

These phases address features where competitors outperform CS. Phases 11–13 are directly executable by Claude Code. Phases 14–16 require architectural decisions from Craig before implementation can begin — those phases produce architecture docs, not shipping code.

---

## Phase 11 — Verse Sharing & Copy

**Goal:** Let users copy and share verse text from anywhere verses appear.

**Current state:** VOTD exists on HomeScreen but has no share action. No sharing or clipboard functionality exists anywhere in the app.

### Capability

- Long-press a verse in VerseBlock → copy text to clipboard (toast confirmation)
- Share button on VOTD card (HomeScreen) → system share sheet with verse text + reference
- Share action available in verse context menu or long-press menu
- Format: `"In the beginning God created the heavens and the earth." — Genesis 1:1 (NIV)\n\nCompanion Study`

### Files to create

| File | Purpose |
|------|---------|
| `app/src/utils/shareVerse.ts` | Utility: format verse text + ref, call RN Share API |
| `app/src/components/VerseLongPressMenu.tsx` | Context menu on long-press: Copy / Share / Add Note |

### Files to modify

| File | Change |
|------|--------|
| `app/src/components/VerseBlock.tsx` | Add long-press handler to verse text spans |
| `app/src/screens/HomeScreen.tsx` | Add share icon/button to VOTD card |

### Dependencies

- `react-native` `Share` API (built-in, no install needed)
- `expo-clipboard` for copy (`npx expo install expo-clipboard`)

### Implementation steps

1. `npx expo install expo-clipboard` from `app/` directory
2. Create `shareVerse.ts` — export `copyVerse(text, ref)` and `shareVerse(text, ref, translation)`
3. Create `VerseLongPressMenu.tsx` — a small popup with Copy / Share / Note options
4. Add `onLongPress` handler to verse text in `VerseBlock.tsx`
5. Add share icon to VOTD card in `HomeScreen.tsx`
6. Test: long-press verse → copy works, share sheet opens with formatted text

### Effort: Small (1 session or less)

---

## Phase 12 — Multi-Translation Support

**Goal:** Add KJV as a third translation (public domain, no licensing). Architecture supports future paid translations.

**Current state:** NIV + ESV verse files in `content/verses/{niv|esv}/`. Reader shows one translation. TranslationPanel exists as a chapter-level panel for comparison notes.

### ⚠ Licensing note

KJV is public domain — no licensing required. NASB, NLT, CSB, and ESV all have commercial licensing terms that may change if the app charges money. **Start with KJV only.** Additional translations can be added later once licensing is investigated for the paid tier.

### Data changes

```
content/verses/kjv/          # NEW — KJV verse files, same shape as niv/esv
  genesis.json
  exodus.json
  ... (all 66 books)
```

Verse file shape is identical: `[{ ref, short, text, url, book, ch, v }]`

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/TranslationPicker.tsx` | Small pill toggle: NIV / ESV / KJV |
| `content/verses/kjv/*.json` | KJV verse files for all 66 books |

### Files to modify

| File | Change |
|------|--------|
| `app/src/stores/settingsStore.ts` or preferences | Persist selected translation |
| `app/src/hooks/useChapterData.ts` | Load verses for the selected translation |
| `app/src/db/database.ts` | Query verses by translation |
| `app/src/screens/ChapterScreen.tsx` | Render TranslationPicker in ChapterHeader area |
| `_tools/build_sqlite.py` | Ingest KJV verse files into verses table with translation column |
| `_tools/validate.py` | Validate KJV verse files |

### Database schema change

```sql
-- Add translation column to verses table:
ALTER TABLE verses ADD COLUMN translation TEXT NOT NULL DEFAULT 'niv';
-- Existing NIV/ESV data gets tagged during build
-- KJV data inserted with translation='kjv'
```

### Architecture for future translations

The translation picker, verse query, and settings persistence are all designed to support N translations. Adding NASB/NLT later means: (1) add verse files to `content/verses/{translation}/`, (2) update the picker options, (3) rebuild. The code doesn't hardcode translation names — it reads available translations from the DB.

### Content generation

KJV text is public domain and widely available in structured JSON format. Source from OpenScriptures or a similar open dataset. Write an ingestion script to normalize into CS's verse file shape.

### Implementation steps

1. Source KJV verse data, normalize into `content/verses/kjv/*.json`
2. Add `translation` column to verses table in `build_sqlite.py`
3. Tag existing NIV/ESV data during build
4. Create `TranslationPicker.tsx` — horizontal pill row (NIV / ESV / KJV)
5. Add translation preference to settings store
6. Update `useChapterData` to query by selected translation
7. Render picker in ChapterScreen (below nav bar or in ChapterHeader)
8. Validate, build, test: switch translations, verify verse text changes

### Effort: Medium (1-2 sessions — mostly data sourcing)

---

## Phase 13 — Interlinear Viewer

**Goal:** Tap any verse to see the underlying Hebrew (OT) or Greek (NT) with word-level data: original word, transliteration, Strong's number, morphology, and gloss.

**Current state:** CS has 43 curated word studies and a HebrewPanel per section. But no verse-level interlinear — users can't tap a word in the text and see its original language form.

### ⚠ Data sourcing note

Open-source interlinear datasets exist:
- **OpenScriptures Hebrew Bible** (OSHB) — morphology-tagged Hebrew with Strong's numbers, MIT license
- **Berean Interlinear Bible** — Greek/Hebrew with glosses, CC-BY-SA
- **STEP Bible data** (Tyndale House) — tagged Greek/Hebrew, CC-BY license

Claude Code can build the viewer component and data pipeline, but the raw interlinear data needs to be sourced and ingested first. This is a data acquisition phase + UI phase.

### Data shape

```json
// New table: interlinear_words
{
  "book_id": "genesis",
  "chapter": 1,
  "verse": 1,
  "word_position": 1,
  "original": "\u05D1\u05B0\u05BC\u05E8\u05B5\u05D0\u05E9\u05B4\u05C1\u05D9\u05EA",
  "transliteration": "bereshit",
  "strongs": "H7225",
  "morphology": "Prep-b | N-fs-c",
  "gloss": "In [the] beginning",
  "word_study_id": "bereshit"    // Links to existing CS word study if available
}
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/InterlinearSheet.tsx` | Bottom sheet showing word-level interlinear data for a verse |
| `app/src/components/InterlinearWord.tsx` | Single word card: original, transliteration, Strong's, gloss |
| `_tools/ingest_interlinear.py` | Script to convert source data into interlinear_words table format |

### Files to modify

| File | Change |
|------|--------|
| `app/src/components/VerseBlock.tsx` | Add tap handler on verse text to open InterlinearSheet |
| `app/src/db/database.ts` | Add `getInterlinearWords(bookId, chapter, verse)` query |
| `_tools/build_sqlite.py` | Add `interlinear_words` table, ingest data |
| `app/src/types/index.ts` | Add `InterlinearWord` interface |

### Database schema

```sql
CREATE TABLE interlinear_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  word_position INTEGER NOT NULL,
  original TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  strongs TEXT,
  morphology TEXT,
  gloss TEXT NOT NULL,
  word_study_id TEXT    -- FK to word_studies if CS has a matching study
);
CREATE INDEX idx_interlinear_verse ON interlinear_words(book_id, chapter_num, verse_num);
```

### InterlinearSheet design

- Bottom sheet (gorhom/bottom-sheet) triggered by tapping a verse number or a dedicated interlinear icon
- Shows verse text at top, then a horizontal-scrollable row of InterlinearWord cards
- Each card: original language text (large, centered), transliteration (smaller), Strong's number (tappable — links to word study if available), morphology code, English gloss
- Right-to-left layout for Hebrew, left-to-right for Greek
- Cards are tappable — if a matching word_study_id exists, navigates to WordStudyDetailScreen

### Integration with existing word studies

CS has 43 word studies. Where a Strong's number maps to an existing word study, the interlinear card shows a gold indicator and tapping navigates to the full word study. This connects the new interlinear viewer to CS's existing curated content — a differentiator vs. BLB's raw data approach.

### Implementation steps

1. Source and download interlinear dataset (OSHB for OT, Berean/STEP for NT)
2. Write `_tools/ingest_interlinear.py` to normalize into CS schema
3. Add `interlinear_words` table to `build_sqlite.py`
4. Create `InterlinearWord.tsx` component
5. Create `InterlinearSheet.tsx` bottom sheet
6. Add verse tap handler in `VerseBlock.tsx`
7. Map Strong's numbers to existing word_study IDs where applicable
8. Build, test: tap verse → sheet opens with word-level data

### Effort: Large (2-3 sessions — data sourcing is the bottleneck)

---

## Phase 14 — User Accounts & Cloud Sync (Architecture Phase)

**Goal:** Produce an architecture document — NOT shipping code. This phase requires backend provider decisions.

**⚠ This is a PLANNING phase.** Claude Code produces `_tools/SYNC_ARCHITECTURE.md`, not implementation.

### Decisions Craig must make before implementation

| Decision | Options | Implications |
|----------|---------|--------------|
| Auth provider | Supabase Auth / Firebase Auth / Clerk | Supabase = open-source, PostgreSQL, generous free tier. Firebase = Google ecosystem, proven scale. Clerk = developer-friendly, pricier. |
| Backend hosting | Supabase (hosted) / Firebase / Custom (Fly.io + Postgres) | Supabase is the simplest path for a solo dev. Firebase is heavier but more battle-tested. |
| What syncs | Notes, bookmarks, highlights, reading progress, preferences, study depth | All user.db data. Sync = full table replication or per-record merge? |
| Conflict resolution | Last-write-wins / CRDT / Manual merge | Last-write-wins is simplest. CRDTs are overkill for this use case. |
| Account creation UX | Email/password / Apple Sign-In / Google Sign-In | Apple Sign-In is required by App Store if you offer ANY social login. |
| Cost ceiling | Free tier limits, when to start paying | Supabase free: 50K MAU, 500MB DB, 1GB storage. Likely sufficient for early growth. |

### Architecture doc output

The phase produces `_tools/SYNC_ARCHITECTURE.md` covering:
- Auth flow (sign up, sign in, sign out, account deletion)
- Data model (which tables sync, sync direction, conflict resolution)
- API design (REST vs. realtime subscriptions)
- Offline-first strategy (local-first with background sync)
- Migration path (existing user.db data → cloud on first sign-in)
- Security model (row-level security, data isolation)
- Cost projections at 1K / 10K / 100K users

### Effort: 1 session to produce architecture doc. Implementation is a multi-session effort after decisions are made.

---

## Phase 15 — AI-Powered Contextual Q&A (Future Enhancement — Deferred)

**Status: DEFERRED.** This is a future enhancement that deserves thoughtful planning and will incur ongoing API costs. Not part of the current execution roadmap. Revisit after user base growth validates the investment.

**Goal:** When ready, produce an architecture document. Implementation follows only after cost modeling and premium tier revenue can support it.

### What makes CS's AI different from Bible Chat / ChatGPT

CS has structured scholarly commentary data for every section of every chapter — 45+ scholars with tradition family labels. An AI Q&A feature grounded in this data would be fundamentally different from generic Bible chatbots:
- Answers cite specific scholars by name with tradition family context
- Responses reference CS's own panel content (cross-refs, historical context, word studies)
- The AI doesn't make up theology — it synthesizes from CS's curated scholar data
- Users can tap citations to navigate to the actual panel content

### Decisions Craig must make

| Decision | Options | Implications |
|----------|---------|--------------|
| LLM provider | Anthropic Claude API / OpenAI / Local model | Claude API is the natural fit. Cost: ~$3-15 per 1M tokens depending on model. |
| Model choice | Claude Haiku (cheap, fast) / Sonnet (balanced) / Opus (expensive, best) | Haiku for simple lookups, Sonnet for synthesis. Could use routing. |
| Context injection | Full section panel data / RAG over scholar DB / Hybrid | RAG is most cost-effective. Full context gives best answers but costs more per query. |
| Rate limiting | Queries per day per user / Token budget per user | Premium tier: 20-50 queries/day. Free tier: 3-5 queries/day or none. |
| Premium gating | Premium-only / Free with limits / Free trial | Aligns with pricing strategy: premium feature with API cost justification. |

### Architecture doc output

The phase produces `_tools/AI_QA_ARCHITECTURE.md` covering:
- Prompt engineering strategy (system prompt, context injection, citation format)
- RAG pipeline design (embedding scholar data, retrieval strategy)
- API integration (request/response flow, error handling, streaming)
- Cost modeling (tokens per query × queries per user × user base)
- UI design (where does the Q&A surface? Inline? Dedicated screen? Bottom sheet?)
- Content grounding (how to ensure answers reference CS data, not hallucinate)
- Premium gating implementation

### Effort: 1 session to produce architecture doc. Implementation is multi-session after decisions.

---

## Phase 16 — Reading Streaks & Engagement Hooks

**Goal:** Subtle engagement features that drive daily return without feeling gamified.

**Current state:** HomeScreen has VOTD and Continue Reading card. ReadingHistoryScreen exists. No streak tracking.

### Features

1. **Reading streak counter** — "5-day streak" badge on HomeScreen. Tracks consecutive days with at least one chapter read. Stored in user.db.
2. **Weekly summary** — "This week: 12 chapters across 3 books" card on HomeScreen.
3. **Milestone celebrations** — Subtle gold toast when user hits milestones: 10 chapters, 50 chapters, full book completed, 30-day streak.

### Database change (user.db migration 4)

```sql
CREATE TABLE IF NOT EXISTS reading_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,           -- ISO date (YYYY-MM-DD)
  chapters_read INTEGER NOT NULL DEFAULT 0,
  books_touched TEXT                    -- comma-separated book IDs
);
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/StreakBadge.tsx` | Flame/streak counter for HomeScreen |
| `app/src/components/WeeklySummary.tsx` | "This week" card for HomeScreen |
| `app/src/components/MilestoneToast.tsx` | Subtle celebration toast |
| `app/src/hooks/useStreakData.ts` | Hook to calculate current streak, weekly stats |

### Files to modify

| File | Change |
|------|--------|
| `app/src/db/userDatabase.ts` | Add migration 4 (or 3/4 depending on study depth ordering) |
| `app/src/screens/HomeScreen.tsx` | Add StreakBadge and WeeklySummary |
| `app/src/hooks/useHomeData.ts` | Include streak data in home screen payload |

### Design notes

- Streak badge: small, gold, understated — NOT a flaming gamification widget. Think: `📖 5-day streak` in muted gold.
- Weekly summary: 1-2 lines, factual, not congratulatory. "This week: 8 chapters across Genesis and Romans."
- Milestones: gold toast that auto-dismisses after 3 seconds. "You've read 50 chapters." No confetti, no fireworks.

### Effort: Small-Medium (1 session)

---

## Updated Execution Order

```
PART 1 — Differentiation Features
  Phase 0  (categorization)       — Session A
  Phase 1  (tabbed infra)         — Session A
  Phase 2  (Context Hub)          — Session B
  Phase 3  (Connections Hub)      — Session B
  Phase 4  (Chiasm View)          — Session C
  Phase 5  (Genre Banner)         — Session D
  Phase 6  (Study Depth)          — Session D
  Phase 7  (Study Coach)          — Session E
  Phase 8  (Textual Enrichment)   — Session F
  Phase 9  (Concept Journey)      — Session F
  Phase 10 (Synoptic Diffs)       — Session F

PART 2 — Competitive Gap Features
  Phase 11 (Verse Sharing)        — Session G (quick win, do early)
  Phase 12 (Multi-Translation)    — Session H (KJV first, data sourcing)
  Phase 13 (Interlinear)          — Session I + J (data sourcing + UI)
  Phase 14 (Accounts/Sync)        — Session K (architecture doc only)
  Phase 15 (AI Q&A)               — DEFERRED (future enhancement, revisit post-launch)
  Phase 16 (Streaks/Engagement)   — Session G (pairs well with sharing)
```

**Recommended quick wins to front-load:** Phases 11 + 16 (sharing + streaks) can be done in a single session and provide immediate user-facing value. Consider running Session G before or alongside Session A.

---

# PART 3 — Enhancement Features (Phases 17–23)

These phases take existing features from "Good" to "Strong" in the competitive matrix.

---

## Phase 17 — TTS Integration

**Goal:** Wire the existing `useTTS` hook and `TTSControls` component into ChapterScreen. Both are fully built — this is pure integration.

**Current state:** `hooks/useTTS.ts` wraps expo-speech with play/pause/skip/speed. `components/TTSControls.tsx` renders the control bar. Neither is imported into ChapterScreen.

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/ChapterScreen.tsx` | Import useTTS, pass verses, render TTSControls as a sticky bottom bar when active |
| `app/src/components/ChapterNavBar.tsx` | Add a TTS toggle icon (speaker icon) to the nav bar |
| `app/src/components/TTSControls.tsx` | Migrate any remaining inline styles to StyleSheet.create() |

### Integration design

- TTS icon in ChapterNavBar (right side, next to ⓘ). Tap toggles TTS mode on/off.
- When TTS is active, `TTSControls` renders as a sticky bar at the bottom of the screen (above tab bar if applicable), overlaying content.
- `useTTS` receives the chapter's verses array. Auto-advances through verses.
- When a verse is playing, it should be visually highlighted in `VerseBlock` (gold underline or background tint) — pass `currentVerse` to VerseBlock for highlighting.
- TTS stops and resets on chapter navigation.

### Implementation steps

1. Import `useTTS` in ChapterScreen, pass `verses` array
2. Add speaker icon to ChapterNavBar with `onTTSPress` prop
3. When TTS active, render TTSControls in a `position: absolute` bottom bar
4. Pass `ttsCurrentVerse` to VerseBlock for active verse highlighting
5. Ensure TTS stops on chapter change (useEffect cleanup)
6. Migrate TTSControls inline styles to StyleSheet.create()
7. Test: tap speaker → controls appear, play → verse highlighted, skip works, speed works, navigate away → stops

### Effort: Small (half a session)

---

## Phase 18 — Search Filters

**Goal:** Add testament and book filter chips to SearchScreen for scoped searching.

**Current state:** SearchScreen has FTS5 on verses and people. No filtering — all results are unscoped. Results show in three sections (People, Word Studies, Verses) with load-more on verses.

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/SearchFilterChips.tsx` | Horizontal pill row: All / OT / NT / [Book picker] |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/SearchScreen.tsx` | Render filter chips below search input, pass filter to useSearch |
| `app/src/hooks/useSearch.ts` | Accept testament/book filter params, modify FTS query |

### Filter design

- Horizontal scrollable chip row below search input
- Default: "All" (current behavior)
- Testament filters: "OT" / "NT" — these are simple WHERE clauses on the testament field
- Book filter: tapping a "Book..." chip opens a small picker (reuse QnavOverlay's book list or a simplified version)
- Filters combine: "NT" + search "grace" = only NT verses containing "grace"
- Filter state resets when query clears

### Query modification

```sql
-- Current:
SELECT * FROM verses_fts WHERE verses_fts MATCH ?

-- With testament filter:
SELECT v.* FROM verses_fts vf
JOIN verses v ON v.id = vf.rowid
JOIN chapters c ON c.id = (v.book_id || v.chapter_num)
JOIN books b ON b.id = v.book_id
WHERE vf.verses_fts MATCH ?
AND b.testament = ?

-- With book filter:
... AND v.book_id = ?
```

### Implementation steps

1. Create `SearchFilterChips.tsx` — horizontal row of pill buttons
2. Add filter state to SearchScreen (testament, bookId)
3. Update `useSearch` to accept and apply filter params
4. Test: search "love", filter to NT → only NT results, filter to "1 John" → scoped results

### Effort: Small (half a session, pairs with Phase 17)

---

## Phase 19 — Highlight UX Polish

**Goal:** Upgrade highlights from single-color to multi-color palette with collections and export.

**Current state:** `verse_highlights` table has a single `color` column. Highlighting exists but the UX details need auditing against competitors.

### Database change (user.db migration — next available version)

```sql
-- Add collection support to highlights
ALTER TABLE verse_highlights ADD COLUMN collection_id TEXT;
ALTER TABLE verse_highlights ADD COLUMN note TEXT;

CREATE TABLE IF NOT EXISTS highlight_collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  sort_order INTEGER DEFAULT 0
);
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/components/HighlightColorPicker.tsx` | 6-8 color palette popup |
| `app/src/components/HighlightCollectionSheet.tsx` | Bottom sheet for managing highlight collections |

### Files to modify

| File | Change |
|------|--------|
| `app/src/db/userDatabase.ts` | Add migration for collections table + columns |
| `app/src/components/VerseBlock.tsx` | Update long-press to show color picker (after Phase 11 adds long-press) |
| `app/src/screens/BookmarkListScreen.tsx` | Add highlights tab with collection grouping |

### Color palette

Pre-defined colors that work on dark background:
- Gold (#bfa050) — default
- Blue (#5b8fb9)
- Green (#5fa87a)
- Purple (#8b7cb8)
- Coral (#c47a6a)
- Teal (#5ba8a0)

### Highlight collections

- Users create named collections: "Covenant promises", "Messianic prophecies", "Prayer verses"
- Each collection has a default color
- Highlights can be assigned to a collection (optional)
- BookmarkListScreen gets a "Highlights" tab showing collections → verses

### Export

- Export all highlights or a collection as plain text: `ref — verse text [color/collection]`
- Uses the same share mechanism as Phase 11

### Implementation steps

1. Add migration to userDatabase.ts
2. Create HighlightColorPicker (small popup, 6 color circles)
3. Update verse long-press flow: select text → pick color → optional collection
4. Create HighlightCollectionSheet for managing collections
5. Add highlights tab to BookmarkListScreen
6. Add export action to collection view
7. Test: highlight with colors, create collection, assign highlights, export

### Effort: Medium (1 session)

---

## Phase 20 — Personalized Recommendations

**Goal:** Replace hardcoded "From Your Study" cards on HomeScreen with data-driven suggestions based on reading history.

**Current state:** HomeScreen has a "FROM YOUR STUDY" / "EXPLORE" section with hardcoded cards (People, Timeline). Not personalized at all.

### Recommendation engine (simple heuristics, no AI)

Based on user's reading history, generate 2-4 contextual suggestion cards:

| Signal | Recommendation |
|--------|---------------|
| Read Genesis 1-11 | "Explore the Covenant concept" → Concept Explorer |
| Read any prophecy-rich book | "Trace prophecy fulfillment" → Prophecy Browse |
| Read 10+ chapters of any book | "Meet the people of [Book]" → People screen filtered |
| Opened Hebrew panels 5+ times | "Dive deeper: Word Studies" → Word Study Browse |
| Never visited Timeline | "See the big picture: Timeline" → Timeline |
| Read parallel Gospel accounts | "Compare the accounts" → Parallel Passages |
| Opened Difficult Passages 0 times | "Wrestle with hard texts" → Difficult Passages Browse |

### Files to create

| File | Purpose |
|------|---------|
| `app/src/hooks/useRecommendations.ts` | Heuristic engine: reads history, generates suggestions |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/HomeScreen.tsx` | Replace hardcoded suggestions with useRecommendations output |
| `app/src/hooks/useHomeData.ts` | Include recommendation data |

### Recommendation data shape

```typescript
interface Recommendation {
  title: string;          // "Explore the Covenant concept"
  subtitle: string;       // "You've been reading Genesis — trace the theme"
  screen: string;         // navigation target
  params?: object;        // navigation params
  priority: number;       // higher = more relevant
}
```

### Implementation steps

1. Create `useRecommendations.ts` — queries reading_progress, study_depth, reading_streaks tables
2. Implement heuristic rules (table above)
3. Return top 2-4 recommendations sorted by priority
4. Replace hardcoded cards in HomeScreen with dynamic recommendation cards
5. Fallback: if no reading history, show the current hardcoded explore cards
6. Test: read some chapters, return to home, verify suggestions change

### Effort: Small (half a session, pairs with Phase 19)

---

## Phase 21 — Concordance Search

**Goal:** Search the Bible by Strong's number / original language word — "show me every verse where hesed (H2617) appears."

**Depends on:** Phase 13 (Interlinear) — requires `interlinear_words` table.

**Current state:** No concordance. FTS5 searches English text only.

### Files to create

| File | Purpose |
|------|---------|
| `app/src/screens/ConcordanceScreen.tsx` | Dedicated concordance search screen |
| `app/src/components/ConcordanceResult.tsx` | Single result card: verse text with the target word highlighted |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/ExploreMenuScreen.tsx` | Add "Concordance" to the Explore grid |
| `app/src/navigation/types.ts` | Add ConcordanceScreen route |
| `app/src/db/database.ts` | Add `searchByStrongs(strongsNum)` query |
| `app/src/components/panels/InterlinearSheet.tsx` | Add "See all occurrences" link on each interlinear word card |

### Concordance flow

1. User taps a word in the interlinear view (Phase 13)
2. Card shows Strong's number, morphology, gloss
3. New "See all N occurrences" link at bottom of card
4. Tapping navigates to ConcordanceScreen pre-filtered for that Strong's number
5. ConcordanceScreen can also be accessed from Explore menu for manual search

### Query

```sql
SELECT iw.*, v.text, v.book_id, v.chapter_num, v.verse_num, b.name as book_name
FROM interlinear_words iw
JOIN verses v ON v.book_id = iw.book_id
  AND v.chapter_num = iw.chapter_num
  AND v.verse_num = iw.verse_num
JOIN books b ON b.id = v.book_id
WHERE iw.strongs = ?
ORDER BY b.book_order, iw.chapter_num, iw.verse_num
```

### ConcordanceScreen design

- Search input at top: accepts Strong's number (H2617) or original word (חֶסֶד)
- Results grouped by book with occurrence count
- Each result: verse reference + verse text with target word highlighted
- Tappable → navigates to chapter
- Footer: total occurrences count, distribution chart (optional)

### Integration with word studies

Where a Strong's number maps to an existing CS word study, show a banner at the top: "CS has a curated study on this word → [View Word Study]"

### Effort: Medium (1 session, after Phase 13)

---

## Phase 22 — Discourse Analysis Expansion

**Goal:** Extend discourse/argument flow panels from Romans to 4 more epistles.

**Current state:** `DiscoursePanel` component exists and is fully functional. Data exists only for Romans 1-16.

### Target books

| Book | Chapters | Why |
|------|----------|-----|
| Galatians | 6 | Paul's most passionate argument — justification by faith |
| Ephesians | 6 | Systematic theology in letter form — doctrinal + practical halves |
| Hebrews | 13 | The most complex theological argument in the NT |
| 1 Corinthians | 16 | Addresses specific issues — each section has distinct argument flow |

### Content generation approach

This is **pure content work** — no code changes needed. The DiscoursePanel component and the `discourse` chapter panel type already work. This phase writes enrichment scripts that add discourse data to chapters.

Follow the standard enrichment script pattern:
1. Write generator script to `/tmp/gen_discourse_{book}.py`
2. For each chapter, create a discourse panel with: argument_steps (ordered logical flow), key_transitions (where Paul shifts his argument), rhetorical_devices (chiasm, inclusio, diatribe, etc.)
3. Run, verify, validate, build, commit

### Discourse panel data shape (existing)

```python
chapter_panels['discourse'] = {
    "title": "Paul's Argument in Romans 3",
    "steps": [
        {
            "label": "Thesis (v1-2)",
            "text": "Jewish advantage is real — they were entrusted with God's oracles.",
            "type": "thesis"    # thesis | evidence | objection | rebuttal | conclusion | transition
        }
    ],
    "note": "Paul uses the diatribe style — posing hypothetical objections to advance his argument."
}
```

### Implementation steps

1. Write discourse content for Galatians 1-6 (smallest book, fastest to generate)
2. Write discourse content for Ephesians 1-6
3. Write discourse content for Hebrews 1-13
4. Write discourse content for 1 Corinthians 1-16
5. Each book: generate → validate → build → validate_sqlite → commit
6. Total: 41 chapters of new discourse data

### Effort: Large (content-heavy — 2-3 sessions of enrichment scripts)

---

## Phase 23 — Curated Reading Plans

**Goal:** Create 5-10 reading plans that leverage CS's unique features (concept explorer, prophecy chains, difficult passages, scholarly panels).

**Current state:** `reading_plans` and `plan_progress` tables exist. PlanListScreen and PlanDetailScreen exist. Plans are stored in content/meta/ and loaded into the DB.

### This is pure content work — no code changes.

### Plan concepts

| Plan | Days | Unique angle |
|------|------|-------------|
| "Genesis: With Ancient Eyes" | 14 | Pairs each chapter with the ANE context and original audience panels (Phase 2 data) |
| "Covenant Journey" | 10 | Follows the Concept Explorer covenant stops through the canon (Phase 9 data) |
| "The Prophecy Trail" | 21 | Reads prophecy origin chapters + fulfillment chapters, paired with prophecy chain data |
| "Wrestling with Hard Texts" | 12 | Reads the context chapters for 12 difficult passages, then explores the Difficult Passages feature |
| "Meet the Scholars" | 7 | Each day features a different scholar's commentary on a key passage — introduces the multi-perspective model |
| "Paul's Arguments" | 14 | Reads Romans, Galatians, Ephesians with discourse panels (Phase 22 data) |
| "The Hebrew Words That Matter" | 10 | Pairs chapters with key Hebrew word studies — hesed, shalom, berith, etc. |
| "Kings & Chronicles: Two Perspectives" | 14 | Reads parallel accounts side-by-side using the Parallel Passages feature |
| "Revelation: Reading Apocalyptic" | 12 | Genre guidance (Phase 5) + literary structure + chiasm view (Phase 4) for Revelation |
| "The Whole Story in 30 Days" | 30 | Selected chapters from Genesis to Revelation, each with one featured study tool |

### Content generation

Each plan is a JSON object in `content/meta/reading-plans.json`:

```json
{
  "id": "genesis-ancient-eyes",
  "name": "Genesis: With Ancient Eyes",
  "description": "Read Genesis the way its first audience heard it — against the backdrop of Egyptian and Mesopotamian culture.",
  "total_days": 14,
  "feature_tag": "ane_context",
  "chapters": [
    {
      "day": 1,
      "book_id": "genesis",
      "chapter_num": 1,
      "focus": "Open the Context panel and read all three tabs: Historical, Audience, and ANE Parallels.",
      "tip": "Pay attention to what Genesis 1 is arguing AGAINST, not just what it affirms."
    }
  ]
}
```

The `focus` and `tip` fields are what differentiate these from generic reading plans — they direct users to specific CS features. Nobody else can offer "Read Genesis 1 and open the ANE Parallels tab" because nobody else HAS an ANE Parallels tab.

### Implementation steps

1. Write plan JSON for all 10 plans
2. Ensure plans reference features that exist (some depend on earlier phases)
3. Add to `content/meta/reading-plans.json`
4. Validate, build, test in PlanListScreen

### Dependencies

- Plans 1, 6, 9 depend on earlier phases (Context Hub, Discourse, Genre/Chiasm)
- Plans 2, 3 depend on Phase 9 (Concept Journey)
- Ship feature-independent plans first, add feature-dependent plans as prerequisites land

### Effort: Medium (content generation — 1-2 sessions)

---

## Updated Execution Order (Complete)

```
PART 1 — Differentiation Features
  Phase 0  (categorization)       — Session A
  Phase 1  (tabbed infra)         — Session A
  Phase 2  (Context Hub)          — Session B
  Phase 3  (Connections Hub)      — Session B
  Phase 4  (Chiasm View)          — Session C
  Phase 5  (Genre Banner)         — Session D
  Phase 6  (Study Depth)          — Session D
  Phase 7  (Study Coach)          — Session E
  Phase 8  (Textual Enrichment)   — Session F
  Phase 9  (Concept Journey)      — Session F
  Phase 10 (Synoptic Diffs)       — Session F

PART 2 — Competitive Gap Features
  Phase 11 (Verse Sharing)        — Session G (quick win, do early)
  Phase 12 (Multi-Translation)    — Session H (KJV first, data sourcing)
  Phase 13 (Interlinear)          — Session I + J (data sourcing + UI)
  Phase 14 (Accounts/Sync)        — Session K (architecture doc only)
  Phase 15 (AI Q&A)               — DEFERRED (future enhancement)
  Phase 16 (Streaks/Engagement)   — Session G (pairs well with sharing)

PART 3 — Enhancement Features
  Phase 17 (TTS Integration)      — Session M (pairs with Phase 18)
  Phase 18 (Search Filters)       — Session M
  Phase 19 (Highlight UX)         — Session N (pairs with Phase 20)
  Phase 20 (Recommendations)      — Session N
  Phase 21 (Concordance)          — Session O (depends on Phase 13)
  Phase 22 (Discourse Expansion)  — Session P (content, pairs with Phase 23)
  Phase 23 (Reading Plans)        — Session P (content)
```

**Total: 23 phases across ~16 sessions.**

---

## Updated Commit Convention (Phases 11-23)

```
feat(share): Phase 11 — verse copy/share functionality
feat(translations): Phase 12 — KJV translation + translation picker
feat(interlinear): Phase 13 — verse-level Hebrew/Greek interlinear viewer
docs(sync): Phase 14 — cloud sync architecture document
# Phase 15 (AI Q&A) — DEFERRED
feat(engagement): Phase 16 — reading streaks and weekly summary
feat(tts): Phase 17 — TTS controls integration into ChapterScreen
feat(search): Phase 18 — testament and book filter chips
feat(highlights): Phase 19 — multi-color palette, collections, export
feat(home): Phase 20 — personalized study recommendations
feat(concordance): Phase 21 — Strong's number concordance search
feat(content): Phase 22 — discourse analysis for Gal, Eph, Heb, 1Cor
feat(content): Phase 23 — 10 curated feature-integrated reading plans
```

---

---

# PART 3 — Enhancement Features (Phases 17–23)

These phases bring existing "Good" features to "Strong" by polishing UX, expanding content, and filling functional gaps surfaced in the competitive analysis.

---

## Phase 17 — TTS Integration

**Goal:** Wire the existing `useTTS` hook and `TTSControls` component into ChapterScreen so users can listen to chapters.

**Current state:** `hooks/useTTS.ts` wraps expo-speech with verse-by-verse auto-advance, speed control, play/pause/skip. `components/TTSControls.tsx` renders the control bar. Neither is imported into ChapterScreen.

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/ChapterScreen.tsx` | Import useTTS + TTSControls, render controls bar at bottom when active |
| `app/src/components/ChapterNavBar.tsx` | Add a speaker/headphone icon button to trigger TTS mode |
| `app/src/components/TTSControls.tsx` | Migrate inline styles to StyleSheet.create (Arch Batch 7 compliance) |

### Integration design

- **Activation:** Speaker icon in ChapterNavBar (right side, next to ⓘ). Tapping toggles TTS mode.
- **When active:** TTSControls bar renders as a sticky bottom bar above the tab navigator (position: absolute bottom, or use a Zustand `isTTSActive` flag).
- **Auto-scroll:** When TTS advances to a new verse, scroll the chapter view to keep the current verse visible. Highlight the currently-speaking verse with a subtle gold left border.
- **Chapter navigation:** Stop TTS when user swipes to a new chapter. Auto-play next chapter is a future enhancement.
- **Speed persistence:** Save selected speed to user preferences (existing preferences table in user.db).

### Implementation steps

1. Migrate TTSControls.tsx inline styles to StyleSheet.create
2. Add speaker icon to ChapterNavBar (lucide `Volume2` or `Headphones`)
3. Add `isTTSActive` state to ChapterScreen (or reader store)
4. Call `useTTS(verses)` in ChapterScreen, pass controls to TTSControls
5. Render TTSControls as a fixed bottom bar when active
6. Add verse highlighting during playback (subtle gold left border on active verse)
7. Auto-scroll to active verse during playback
8. Stop TTS on chapter change (useEffect cleanup)
9. Test: tap speaker → controls appear, play → verses read aloud with auto-advance, speed changes persist

### Effort: Small (partial session)

---

## Phase 18 — Search Filters

**Goal:** Add testament and book filter chips to SearchScreen for more precise verse searching.

**Current state:** SearchScreen uses FTS5 across verses, people, and word studies. No filtering by testament or book. Results capped at 20 with "load more."

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/SearchScreen.tsx` | Add filter chip row below search input |
| `app/src/hooks/useSearch.ts` | Accept filter params, modify verse query with WHERE clauses |

### Filter chips design

- Row of horizontal scrollable chips below search input
- **Testament:** `All` / `OT` / `NT` (single select, default: All)
- **Book:** Optional book picker that appears when a testament is selected. Scrollable pill list of book names in canonical order. Multi-select.
- **Sort:** `Relevance` / `Canonical Order` (single select, default: Relevance)

### Query modification

```sql
-- Current:
SELECT ... FROM verses_fts WHERE verses_fts MATCH ?

-- With filters:
SELECT ... FROM verses_fts
JOIN verses ON verses.rowid = verses_fts.rowid
JOIN books ON books.id = verses.book_id
WHERE verses_fts MATCH ?
  AND books.testament = ?       -- if testament filter active
  AND books.id IN (?, ?, ?)     -- if book filter active
ORDER BY ...                    -- relevance or book_order + chapter + verse
```

### Implementation steps

1. Add filter state to SearchScreen (testament, bookIds, sortOrder)
2. Create FilterChipRow component (horizontal scroll, pill-shaped chips)
3. Pass filters to useSearch hook
4. Modify verse query in useSearch to apply WHERE clauses
5. Add book picker (shows when OT or NT selected — list of books for that testament)
6. Test: search "love" → filter to NT → filter to 1 Corinthians → verify results narrow correctly

### Effort: Small (partial session)

---

# PREMIUM INFRASTRUCTURE — Phase P (Companion+)

> **EXECUTE THIS PHASE BEFORE Phase 19.** All prior deep study features (Phases 0-18) have shipped.
> This phase wires the premium subscription system and gates features per the "Taste the Depth" strategy.
> Full spec: `_tools/PREMIUM_TIER_SPEC.md`

## Strategy Summary

**Free tier:** 2 curated scholars per section + hist + heb + cross panels + all Explore tools (browse-level) + maps/timeline/genealogy (full) + 3 highlight colors + 5 reading plans + basic TTS + full offline.

**Companion+ ($4.99/mo · $39.99/yr · $99.99 lifetime):** All 54 scholars + interlinear + concordance + cross-ref threading + difficult passage responses + chiasm + discourse + genre guidance + study coaching + study depth + allusion mapping + manuscript stories + progressive revelation depth + unlimited highlights + all 10 plans + sync + premium TTS + PDF export + verse image cards.

**No free trial.** The free tier is the trial.

---

## Phase P1 — Premium Store & Prompt Infrastructure

**Session: Dedicated session before Phase 19. ~1 full session.**

### Files to create

| File | Purpose |
|------|---------|
| `app/src/stores/premiumStore.ts` | Zustand store: `isPremium`, `purchaseType`, `expiresAt`, `checkPremiumStatus()`, `restorePurchase()` |
| `app/src/services/purchases.ts` | RevenueCat SDK wrapper (or expo-in-app-purchases). Configure 3 products: monthly, annual, lifetime. Handle purchase flow, receipt validation, status restore. |
| `app/src/hooks/usePremium.ts` | `const { isPremium, showUpgrade } = usePremium()` — single hook consumed everywhere. `showUpgrade(variant)` triggers the prompt with the correct copy. |
| `app/src/components/UpgradePrompt.tsx` | Reusable bottom-sheet modal. Props: `variant` ('scholar' \| 'feature' \| 'personal' \| 'explore'), `featureName`, `featureDescription`. Gold accent, Cinzel header, 3 plan buttons, restore link, dismiss button. See `_tools/PREMIUM_TIER_SPEC.md` §4 for prompt wireframes. |
| `app/src/screens/SubscriptionScreen.tsx` | Full subscription management screen. Plan selection (monthly/annual/lifetime highlighted), feature list, subscribe button, restore purchases, cancellation info. Accessible from Settings and from UpgradePrompt "Learn more." |
| `app/src/utils/scholarSelection.ts` | `selectFreeScholars(panels: Record<string, any>): string[]` — returns the 2 scholar IDs that are free for a given section. Algorithm: pick one evangelical (priority: `mac` > `net` > `netbible`) + one diverse (priority: `sarna` > `alter` > `calvin` > `chrysostom` > `robertson`). If section has ≤2 scholar panels, all are free. |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/SettingsScreen.tsx` | Add "Companion+" row showing subscription status. Tap → SubscriptionScreen. |
| `app/src/stores/index.ts` | Export premiumStore |
| `app/src/navigation/types.ts` | Add Subscription route to MoreStack |

### Dependencies to install

```bash
cd app
npx expo install react-native-purchases  # RevenueCat SDK
```

RevenueCat is free until $2.5K MRR, then 1%. Handles receipt validation, subscription status, analytics, cross-platform.

**Alternative:** `expo-in-app-purchases` (free, but requires manual receipt validation and status management).

### Implementation steps

1. Install RevenueCat SDK
2. Create `premiumStore.ts` with Zustand — persist premium status locally, sync with RevenueCat on app launch
3. Create `usePremium.ts` hook
4. Create `UpgradePrompt.tsx` bottom-sheet with 4 variant layouts (scholar, feature, personal, explore)
5. Create `SubscriptionScreen.tsx` with plan selection
6. Create `scholarSelection.ts` with the 2-scholar algorithm
7. Add Companion+ row to SettingsScreen
8. Add Subscription route to navigation
9. Test: mock `isPremium = false`, verify prompt appears. Mock `isPremium = true`, verify full access.

### Effort: 1 full session

---

## Phase P2 — Gate Wiring (Retroactive + Forward)

**Session: Same session as P1 or immediately following. ~1 session.**

This phase adds premium checks to ALL features that are gated. Most of these features already exist (Phases 0-18 shipped). This phase adds the `isPremium` checks.

### Scholar gating (the conversion engine)

| File | Change |
|------|--------|
| `app/src/components/PanelButton.tsx` | Add `locked` prop. When `locked=true`: show small 🔒 icon overlay, tap triggers `showUpgrade('scholar')` instead of panel toggle. Visual: same pill shape, same scholar color, but dimmed with lock icon. |
| `app/src/components/SectionBlock.tsx` | Import `usePremium` + `selectFreeScholars`. For each section, compute free scholars. Pass `locked={!isPremium && !freeScholars.includes(scholarId)}` to scholar PanelButtons. |
| `app/src/components/ScholarlyBlock.tsx` | Same pattern for chapter-level scholar panels. |

### Feature gating (completed features)

| Feature (Phase) | File to modify | Gate logic |
|---|---|---|
| Interlinear (P13) | `InterlinearSheet.tsx` or wherever interlinear triggers | If `!isPremium`, show UpgradePrompt('feature') with name "Interlinear Hebrew & Greek" instead of opening interlinear. |
| Cross-ref threading (P3) | `CompositeConnectionsPanel.tsx` | If `!isPremium`, hide the "Threads" tab or show upgrade prompt on tab tap. Basic cross-refs panel stays free. |
| Chiasm view (P4) | `ChiasmView.tsx` or `LiteraryStructurePanel.tsx` | If `!isPremium`, show UpgradePrompt('feature') instead of rendering chiasm. Basic literary structure stays free. |
| Genre banner (P5) | `GenreBanner.tsx` | If `!isPremium`, don't render GenreBanner. (It's an ambient premium perk, not a blocking gate.) |
| Study depth dots (P6) | `DepthDots.tsx` | If `!isPremium`, don't render DepthDots. |
| Study coaching (P7) | `StudyCoachCard.tsx` | If `!isPremium`, don't render StudyCoachCards. |
| Textual / manuscript (P8) | `TextualPanel.tsx` | If `!isPremium`, show UpgradePrompt('feature') for manuscript stories tab. Basic textual notes stay free. |
| Progressive revelation (P9) | `ConceptDetailScreen.tsx` | If `!isPremium`, show concept overview (free) but gate the journey/progression view. |
| Allusion mapping (P3) | `EchoesView.tsx` | If `!isPremium`, show UpgradePrompt('feature'). |
| Discourse analysis | `DiscoursePanel.tsx` | If `!isPremium`, show UpgradePrompt('feature'). |
| Difficult passages | `DifficultPassageDetailScreen.tsx` | If `!isPremium`, show question + consensus (free) but gate scholarly responses section. |

### Explore tool gating

| Feature | Free experience | Premium gate |
|---|---|---|
| Prophecy chains | Browse all 50, see chain overview | Detail view (per-link analysis) gated |
| Word studies | Browse all 43, see basic definition | Full lexicon + occurrence map gated |
| Concept explorer | Browse all 20, see description + key verses | Journey/progression view gated |
| Difficult passages | Browse all 53, see question + consensus | Scholarly responses gated |

### Personal feature gating

| File | Change |
|------|--------|
| `HighlightColorPicker.tsx` | Show 3 colors free. Colors 4-5+ show lock icon. Tap → UpgradePrompt('personal'). |
| (Phase 23 plans) | 5 plans free, 5 premium. PlanListScreen shows premium plans with lock. |
| `TTSControls.tsx` | Basic voice free. Premium voice selector gated. |

### HomeScreen upsell (subtle)

| File | Change |
|------|--------|
| `useHomeData.ts` | After `readingStats.totalChapters >= 5` AND `!isPremium`, include a `companionPlusCard` in home data. |
| `HomeScreen.tsx` | Render a subtle gold-bordered card: "Unlock all 54 scholars and every study tool — Companion+" with dismiss. Show max once per session. |

### Implementation steps

1. Wire scholar gating in SectionBlock + ScholarlyBlock + PanelButton
2. Wire feature gates for each completed phase (interlinear, chiasm, threading, etc.)
3. Wire Explore depth gates (prophecy detail, word study detail, concept journey, difficult passage responses)
4. Wire personal gates (highlight colors, plans, TTS)
5. Add HomeScreen upsell card logic
6. Test all gates with `isPremium = false`: verify every gate shows appropriate UpgradePrompt
7. Test with `isPremium = true`: verify all features fully accessible, no prompts shown
8. Verify free tier still delivers: 2 scholars per section, hist/heb/cross panels, all Explore browse, maps/timeline/genealogy full, search, notes, bookmarks

### Effort: 1 full session

### Commit convention

```
feat(premium): Phase P1 — subscription infrastructure (store, hooks, RevenueCat, prompts)
feat(premium): Phase P2 — gate wiring for scholars, study tools, explore depth, personal features
```

---

## Phase 19 — Highlight UX Polish

**Goal:** Enhance verse highlighting with multi-color management, organized collections, and export.

**⚠ PREMIUM GATE:** Free users get 3 highlight colors. Companion+ unlocks unlimited colors + collections + export. The `HighlightColorPicker` must check `isPremium` from Phase P2 — colors beyond the first 3 show a lock icon and tap triggers UpgradePrompt('personal'). The HighlightBrowseScreen and export features are Companion+ only.

**Current state:** 5 named colors (gold/Key verses, blue/Commands, green/Prayers, pink/Prophecy, purple/Study later). HighlightColorPicker is a modal with color circles. Highlights stored in `verse_highlights` table in user.db. No way to view all highlights by color, no export.

### Files to create

| File | Purpose |
|------|---------|
| `app/src/screens/HighlightBrowseScreen.tsx` | Browse all highlights, filterable by color |
| `app/src/components/HighlightExport.tsx` | Export highlights as formatted text |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/MoreMenuScreen.tsx` | Add "Highlights" menu item |
| `app/src/navigation/types.ts` | Add HighlightBrowse route |
| `app/src/db/user.ts` | Add `getHighlightsByColor()`, `getAllHighlights()` queries |
| `app/src/components/HighlightColorPicker.tsx` | Add "View all [color]" link below color circles |

### HighlightBrowseScreen design

- Header: "Highlights" with total count
- Color filter row: all 5 color circles as filter pills, plus "All" option
- List: verse reference + verse text + color dot, grouped by book
- Tap → navigate to chapter with verse scrolled into view
- Long-press → remove highlight
- Export button in header → generates formatted text (plain text or markdown)

### Export format

```
# My Highlights — Companion Study
## Key Verses (Gold)
Genesis 1:1 — In the beginning God created the heavens and the earth.
John 3:16 — For God so loved the world...

## Commands (Blue)
Matthew 28:19 — Therefore go and make disciples...
```

### Implementation steps

1. Add query functions to user.ts
2. Create HighlightBrowseScreen with color filter
3. Add route to navigation
4. Add menu item in MoreMenuScreen
5. Add "View all" link in HighlightColorPicker
6. Create export function (Share API with formatted text)
7. Test: highlight verses in different colors, browse screen shows correct grouping, export produces clean text

### Effort: Small-Medium (1 session)

### Theme note

The 5 highlight colors were chosen for dark backgrounds. When the theme system ships, highlight colors will need per-theme variants (darker/more saturated on light backgrounds) to maintain contrast. The `HighlightColorPicker` should read highlight colors from the theme palette (`theme.highlightColors`) rather than hardcoding hex values. If building Phase 19 before theming, use `base`-imported constants that can be swapped to `useTheme()` later.

---

## Phase 20 — Personalized Recommendations

**Goal:** Make the "From Your Study" section on HomeScreen contextually smarter using existing user data.

**Current state:** HomeScreen shows "From Your Study" with suggestion cards. The suggestions are based on recent reading but don't leverage the full study data available.

### Recommendation engine (heuristic, no AI needed)

```typescript
interface Recommendation {
  type: 'concept' | 'prophecy' | 'person' | 'wordStudy' | 'difficultPassage' | 'unexplored';
  title: string;
  subtitle: string;
  navigateTo: { screen: string; params: object };
}

// Recommendation sources (priority order):
// 1. Concepts related to recently-read books
//    "You read Romans 1-3. Explore the concept: Justification"
// 2. Prophecy chains that start in recently-read books
//    "You read Isaiah 53. Trace the Suffering Servant prophecy chain"
// 3. People encountered in recent chapters
//    "You met Melchizedek in Genesis 14. Read his full story."
// 4. Word studies relevant to recent reading
//    "You read Psalm 23. Explore the word study: roeh (shepherd)"
// 5. Difficult passages in recently-read chapters
//    "Genesis 6:1-4 — Who are the 'sons of God'?"
// 6. Unexplored features
//    "You've never visited the Genealogy Tree. Try it."
```

### Files to create

| File | Purpose |
|------|---------|
| `app/src/hooks/useRecommendations.ts` | Heuristic recommendation engine |

### Files to modify

| File | Change |
|------|--------|
| `app/src/hooks/useHomeData.ts` | Call useRecommendations, include in return |
| `app/src/screens/HomeScreen.tsx` | Render recommendation cards with type-specific icons and navigation |

### Data sources (all already in scripture.db)

- `reading_history` → recently-read books/chapters (user.db)
- `concepts` → concept-to-book mappings via tags
- `prophecy_chains` → chains with book references
- `people` → people-to-chapter mappings
- `word_studies` → studies with book/chapter relevance
- `difficult_passages` → passage locations

### Implementation steps

1. Create `useRecommendations.ts` — query recent history, cross-reference with explore data, return 3-5 recommendations
2. Update `useHomeData` to include recommendations
3. Update HomeScreen to render recommendation cards with type icons (concept = lightbulb, prophecy = chain, person = user, etc.)
4. Each card navigates to the relevant explore screen
5. Test: read Genesis 1-3, return to Home → see recommendations for Covenant concept, Creation word study, Adam person bio

### Effort: Small-Medium (partial session)

---

## Phase 21 — Concordance Search

**Goal:** After Phase 13 (interlinear) ships, add a concordance mode that shows every occurrence of a Hebrew/Greek word across the Bible.

**⚠ Depends on Phase 13.** Cannot be implemented until interlinear_words table exists.

**⚠ PREMIUM GATE:** Concordance search is a Companion+ feature. The ConcordanceScreen entry point (from Explore menu or from interlinear word tap) must check `isPremium`. If `!isPremium`, show `UpgradePrompt('feature')` with name "Concordance Search" and description "Find every verse where a Hebrew or Greek word appears across the entire Bible."

### Integration with Phase 13

Phase 13 gives us a `interlinear_words` table with Strong's numbers per word. Concordance search queries this table:

```sql
-- "Show me every verse where H2617 (hesed) appears"
SELECT DISTINCT iw.book_id, iw.chapter_num, iw.verse_num,
       iw.original, iw.transliteration, iw.gloss,
       v.text, b.name as book_name
FROM interlinear_words iw
JOIN verses v ON v.book_id = iw.book_id
  AND v.chapter_num = iw.chapter_num
  AND v.verse_num = iw.verse_num
  AND v.translation = 'niv'
JOIN books b ON b.id = iw.book_id
WHERE iw.strongs = ?
ORDER BY b.book_order, iw.chapter_num, iw.verse_num
```

### Entry points

1. **From InterlinearSheet (Phase 13):** Tap a Strong's number → "See all N occurrences"
2. **From WordStudyDetailScreen:** "Concordance: see every verse with this word"
3. **From SearchScreen:** New "Original Language" search mode alongside verse/people/word study

### Files to create

| File | Purpose |
|------|---------|
| `app/src/screens/ConcordanceScreen.tsx` | Full concordance results view |
| `app/src/components/ConcordanceEntry.tsx` | Single result: ref + gloss + verse text with word highlighted |

### Files to modify

| File | Change |
|------|--------|
| `app/src/db/database.ts` | Add `getConcordanceResults(strongs)` query |
| `app/src/components/panels/InterlinearSheet.tsx` | Add "See all occurrences" button per word |
| `app/src/screens/WordStudyDetailScreen.tsx` | Add concordance link |
| `app/src/navigation/types.ts` | Add Concordance route |

### Implementation steps

1. Add concordance query to database.ts
2. Create ConcordanceScreen — header with word info (original, transliteration, Strong's, gloss), count badge, scrollable list of every verse
3. Create ConcordanceEntry — verse ref, verse text with the target word highlighted in gold
4. Add navigation from InterlinearSheet and WordStudyDetailScreen
5. Test: open interlinear on Genesis 1:1 → tap bereshit → "See all occurrences" → shows every verse with H7225

### Effort: Medium (1 session, but only after Phase 13)

---

## Phase 22 — Discourse Analysis Expansion

**Goal:** Expand discourse/argument flow panels from Romans (16 chapters) to Galatians, Ephesians, Hebrews, and 1 Corinthians.

**Current state:** DiscoursePanel exists with data for Romans 1-16. The component is done — this is a pure content generation phase.

**⚠ PREMIUM GATE:** Discourse analysis is a Companion+ feature (gated in Phase P2 via DiscoursePanel). New content generated here is automatically premium — no additional gating code needed.

### Content scope

| Book | Chapters | Priority |
|------|----------|----------|
| Galatians | 6 | High — short, densely argued, frequently studied |
| Ephesians | 6 | High — structured argument, two-part (doctrinal + practical) |
| Hebrews | 13 | High — complex sustained argument, most benefit from flow analysis |
| 1 Corinthians | 16 | Medium — longer, topic-by-topic structure |

**Total: 41 chapters of discourse data**

### Data shape (same as existing Romans data)

```python
chapter_panels['discourse'] = {
  "thesis": "Paul argues that justification is by faith alone...",
  "sections": [
    {
      "label": "Thesis Statement",
      "verses": "1:1-5",
      "function": "thesis",         # thesis | support | illustration | objection | rebuttal | application | conclusion | transition
      "summary": "Paul states his core argument...",
      "connects_to": "next"
    }
  ],
  "flow_note": "The argument builds from..."
}
```

### Content generation approach

- Standard enrichment script pattern: write generator to `/tmp/`, run, validate, build
- Split into 4 scripts (one per book) to manage context
- Source: academic commentaries on argument structure (Fee, Thiselton, Schreiner, Bruce, Cockerill, Lincoln)
- Each section needs: verse range, rhetorical function label, summary, connection to next section

### Implementation steps

1. Write `/tmp/gen_discourse_galatians.py` — discourse data for Galatians 1-6
2. Run, validate, verify section counts
3. Repeat for Ephesians, Hebrews, 1 Corinthians
4. Build, validate_sqlite
5. Test: open Galatians 1 → chapter analysis → "Argument Flow" button appears and works

### Effort: Medium (content-heavy, 1-2 sessions)

---

## Phase 23 — Curated Study Plans

**Goal:** Create 10 reading plans that leverage CS's unique features, and seed them into the reading_plans table.

**Current state:** `reading_plans` table exists in user.db (migration 1) but is empty. PlanListScreen and PlanDetailScreen UI exists and works. No plans are seeded.

**⚠ PREMIUM GATE:** 5 plans are free, 5 are Companion+. Plans that leverage premium features (all scholars, discourse, prophecy chain depth, difficult passage responses) are premium. PlanListScreen must show premium plans with a lock icon and "Companion+" badge. Tapping a locked plan → UpgradePrompt('feature') with name "Premium Reading Plans."

### Plan concepts (leveraging CS differentiators)

| Plan | Days | Unique angle | Tier |
|------|------|-------------|------|
| Genesis Deep Dive | 14 | Each day: read chapter + explore one panel type | **Free** |
| Covenant Journey | 10 | Traces covenant concept: Gen 9 → Gen 15 → Exod 19 → 2 Sam 7 → Jer 31 → Heb 8 | **Free** |
| Psalms of Lament | 7 | 7 lament psalms with literary structure | **Free** |
| The Life of David | 10 | 1-2 Samuel with people bios, maps, and timeline | **Free** |
| Creation to Covenant | 21 | Genesis 1-50 at ~2.5 chapters/day | **Free** |
| Prophecy Fulfilled | 12 | Follows 12 prophecy chains from OT promise to NT fulfillment | **Companion+** |
| The Difficult Questions | 10 | 10 difficult passages, one per day, with all scholarly perspectives | **Companion+** |
| Paul's Arguments | 14 | Romans + Galatians with discourse panels | **Companion+** |
| Meet the Scholars | 7 | 7 chapters, each featuring a different scholar tradition (all 54 unlocked) | **Companion+** |
| Hebrew Word Treasures | 10 | 10 chapters paired with deep word studies + interlinear | **Companion+** |

Add `is_premium: boolean` field to reading plan seed data. PlanListScreen reads this field to show lock/badge.

### Data shape

```json
{
  "id": "covenant_journey",
  "name": "Covenant Journey",
  "description": "Trace the covenant concept from Noah to the New Covenant. Each day pairs a key passage with the Concept Explorer, cross-references, and scholarly commentary.",
  "total_days": 10,
  "chapters_json": "[{\"day\":1,\"book\":\"genesis\",\"chapter\":9,\"focus\":\"Read + explore Covenant concept\"},{\"day\":2,\"book\":\"genesis\",\"chapter\":15,\"focus\":\"Abrahamic covenant + cross-refs\"}]"
}
```

### Seeding mechanism

Plans are seeded during user.db migration (new migration). This ensures they exist on first launch and after updates.

```sql
-- Migration 3 (or next available):
INSERT OR IGNORE INTO reading_plans (id, name, description, total_days, chapters_json) VALUES
  ('covenant_journey', 'Covenant Journey', '...', 10, '[...]'),
  ('prophecy_fulfilled', 'Prophecy Fulfilled', '...', 12, '[...]'),
  ...
```

### Files to modify

| File | Change |
|------|--------|
| `app/src/db/userDatabase.ts` | New migration seeding plans |

### Implementation steps

1. Write plan content (10 plans × day-by-day chapter assignments with focus notes)
2. Add migration to userDatabase.ts that seeds all plans
3. Test: fresh install → PlanListScreen shows all plans, tap plan → PlanDetailScreen shows daily readings, start plan → progress tracking works

### Effort: Small-Medium (mostly content writing, minimal code)

---

## Phase 24 — Content Library

**Goal:** A single searchable screen in Explore with category tabs that aggregates panel content from across all chapters. Deep-link navigation auto-opens the source panel and preserves back-navigation state.

**Current content inventory (as of March 2026):**

| Category | Entries | Source panel | Level |
|----------|---------|-------------|-------|
| Manuscript Stories | 10 | `tx` (chapter) | chapter |
| Discourse / Argument Flow | 57 | `discourse` (chapter) | chapter |
| Echoes & Allusions | 0 (needs enrichment) | `cross.echoes` (section) | section |
| ANE Parallels | 0 (needs enrichment) | `hist.ane` (section) | section |
| Chiasm Structures | 0 (needs enrichment) | `lit.chiasm` (chapter) | chapter |

Empty categories are hidden automatically — tabs appear as content enrichment fills them in, no code change needed.

### Architecture overview

```
ExploreMenu → ContentLibrary (push onto stack)
  ├── Category tabs: Manuscripts | Discourse | Echoes | ANE | Chiasms
  │   (only tabs with entries > 0 are rendered)
  ├── Search bar (client-side filter within active category)
  ├── Optional OT/NT filter chips
  └── Entry cards grouped by book
        └── tap → Chapter screen (push, with openPanel param)
                    ├── Panel auto-opens to correct section/tab
                    ├── Auto-scrolls to the opened panel
                    ├── "← Content Library" breadcrumb below nav bar
                    └── Back button/swipe → ContentLibrary (scroll + tab + search preserved)
```

### Database — new table in scripture.db (build-time index)

All 5 content types are stored as JSON blobs inside `section_panels` and `chapter_panels`. Rather than parsing JSON at runtime, `build_sqlite.py` extracts entries into a flat `content_library` table during the build — fast queries, automatic sync with content.

```sql
CREATE TABLE content_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,        -- 'echoes' | 'ane' | 'manuscripts' | 'chiasms' | 'discourse'
  title TEXT NOT NULL,           -- display title for the card
  preview TEXT,                  -- 1-2 sentence preview for the card
  book_id TEXT NOT NULL,
  book_name TEXT NOT NULL,       -- denormalized for display without JOIN
  chapter_num INTEGER NOT NULL,
  section_num INTEGER,           -- NULL for chapter-level panels
  panel_type TEXT NOT NULL,      -- 'cross' | 'hist' | 'tx' | 'lit' | 'discourse'
  tab_key TEXT,                  -- 'echoes' | 'ane' | 'stories' | 'chiasm' | NULL
  testament TEXT NOT NULL,       -- 'ot' | 'nt' for filtering
  sort_order INTEGER NOT NULL DEFAULT 0  -- book_order * 1000 + chapter_num for canonical ordering
);
CREATE INDEX idx_cl_category ON content_library(category);
CREATE INDEX idx_cl_book ON content_library(book_id);
```

**Build-time extraction logic** (in `build_sqlite.py`):

Walk all chapter JSONs. For each chapter:

- **Echoes:** For each section with `cross.echoes[]`, emit one row per echo. Title = `"{source_ref} → {target_ref}"`. Preview = truncated `connection` field.
- **ANE Parallels:** For each section with `hist.ane[]`, emit one row per entry. Title = `parallel` name. Preview = truncated `similarity`.
- **Manuscript Stories:** For each chapter with `tx.stories[]`, emit one row per story. Title = story `title`. Preview = truncated `summary`.
- **Chiasms:** For each chapter with `lit.chiasm`, emit one row. Title = chiasm `title`. Preview = first pair label + " … " + center label.
- **Discourse:** For each chapter with `discourse`, emit one row. Title = discourse `title`. Preview = first step's text truncated.

### Deep-link: auto-open panel on arrival

**Route param change** — add `openPanel` to `Chapter` params in ALL stacks (ReadStack, HomeStack, ExploreStack, MoreStack):

```typescript
// navigation/types.ts
Chapter: {
  bookId: string;
  chapterNum: number;
  openPanel?: {
    sectionNum?: number;   // undefined = chapter-level panel
    panelType: string;     // 'cross' | 'hist' | 'tx' | 'lit' | 'discourse'
    tabKey?: string;       // 'echoes' | 'ane' | 'stories' | 'chiasm'
  };
};
```

**Flow:**

1. `ChapterScreen` reads `route.params.openPanel`, passes it as a prop to child components
2. **Section-level panels** (echoes, ANE): `SectionBlock` receives `openPanel`. If `openPanel.sectionNum === this section's section_num`, it sets initial `activePanel` state to `openPanel.panelType`. The composite panel receives `defaultTab={openPanel.tabKey}`.
3. **Chapter-level panels** (manuscripts, chiasm, discourse): `ScholarlyBlock` receives `openPanel`. If `openPanel.sectionNum` is undefined, it sets initial `activePanel` to `openPanel.panelType` with `defaultTab`.
4. **Auto-scroll:** After the target panel renders, `ChapterScreen` scrolls to it using `scrollViewRef` + `measureLayout`. Small delay (~300ms) to let layout settle.
5. **Breadcrumb:** When `openPanel` is present, render a small `"← Content Library"` pill below `ChapterNavBar` that calls `navigation.goBack()`. Disappears on chapter swipe navigation (since `openPanel` context no longer applies).

### TabbedPanelRenderer — `defaultTab` prop

```typescript
// Add to TabbedPanelRenderer props:
interface Props {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (key: string) => void;
  defaultTab?: string;      // NEW — if provided, override initial activeTab
  children: React.ReactNode;
}
```

Composite panels (`CompositeContextPanel`, `CompositeConnectionsPanel`, `TextualPanel`, `LiteraryStructurePanel`) pass `defaultTab` through from their parent's `openPanel.tabKey`.

### Content Library screen design

**Category tabs:** Horizontal scrollable pills below header. Only categories with `COUNT(*) > 0` are rendered. Query category counts on mount.

**Search:** Client-side filtering on `title` and `preview` fields. Sufficient for expected volume (< 500 entries per category).

**Filter chips:** "All" / "OT" / "NT" — reuse same pattern as `SearchFilterChips.tsx` from Phase 18.

**Entry cards:**
- Title: gold, 13pt, fontFamily.heading for chiasms/discourse, fontFamily.uiMedium for others
- Reference pill: book name + chapter (+ section if section-level), muted background, 10pt
- Preview: textMuted, 11pt, 2-line numberOfLines clamp
- Tap → `navigation.push('Chapter', { bookId, chapterNum, openPanel: { sectionNum, panelType, tabKey } })`

**Grouping:** Entries grouped by book within each category, with book name section headers (SectionList). Canonical book order via `sort_order`.

**Empty state:** Categories with zero entries are hidden (tab not rendered). No "coming soon" placeholders.

### Files to create

| File | Purpose |
|------|---------|
| `app/src/screens/ContentLibraryScreen.tsx` | Main screen: category tabs + search + OT/NT chips + grouped SectionList |
| `app/src/components/ContentLibraryCard.tsx` | Entry card: title, reference pill, preview, onPress |
| `app/src/hooks/useContentLibrary.ts` | Queries `content_library` table, handles category/testament filtering + search |

### Files to modify

| File | Change |
|------|--------|
| `_tools/build_sqlite.py` | Add `content_library` table creation + population from chapter JSONs |
| `_tools/validate_sqlite.py` | Add `content_library` to table validation |
| `app/src/navigation/types.ts` | Add `ContentLibrary` route to `ExploreStackParamList`; add optional `openPanel` to `Chapter` params in ALL stacks |
| `app/src/screens/ExploreMenuScreen.tsx` | Add "Content Library" entry to explore grid |
| `app/src/screens/ChapterScreen.tsx` | Read `openPanel` param, pass to SectionBlock/ScholarlyBlock, render breadcrumb, auto-scroll |
| `app/src/components/SectionBlock.tsx` | Accept `openPanel` prop, set initial `activePanel` when section matches |
| `app/src/components/ScholarlyBlock.tsx` | Accept `openPanel` prop, set initial `activePanel` for chapter-level panels |
| `app/src/components/panels/TabbedPanelRenderer.tsx` | Accept `defaultTab` prop for initial tab selection |
| `app/src/components/ChapterNavBar.tsx` | Render "← Content Library" breadcrumb when `fromLibrary` |
| `app/src/db/database.ts` | Add `getContentLibraryCounts()`, `getContentLibrary(category, testament?)`, `searchContentLibrary(query, category)` |
| `app/src/types/index.ts` | Add `ContentLibraryEntry` interface |

### Implementation steps

1. **Build pipeline** — Add `content_library` table to `build_sqlite.py` with extraction logic for all 5 categories. Run build, verify counts (10 manuscripts, 57 discourse, 0 for the rest). Add to `validate_sqlite.py`.
2. **Database queries + hook** — Add queries to `database.ts`. Create `useContentLibrary.ts`. Test queries return correct data.
3. **Screen + card** — Build `ContentLibraryScreen.tsx` (category tabs, search, SectionList) and `ContentLibraryCard.tsx`. Add to ExploreMenuScreen grid and navigation types.
4. **Deep-link plumbing** — Add `openPanel` to Chapter route params in all stacks. Wire `ChapterScreen` → `SectionBlock` / `ScholarlyBlock` → panel auto-open. Add `defaultTab` to `TabbedPanelRenderer`. Test: tap discourse entry → chapter opens with discourse panel visible.
5. **Auto-scroll + breadcrumb** — Add scroll-to-panel behavior in ChapterScreen. Add "← Content Library" breadcrumb to ChapterNavBar. Test full round-trip: Library → Chapter (panel opens, scrolls) → Back (library state preserved).
6. **Validate + commit** — `validate.py` → `build_sqlite.py` → `validate_sqlite.py` → `npx tsc --noEmit` → commit.

### Content enrichment dependency

The 3 empty categories require separate content enrichment sessions (standard enrichment script pattern):

| Category | Scope | Effort |
|----------|-------|--------|
| Echoes & Allusions | ~50 high-priority NT→OT allusions (Romans 9-11, Hebrews, Revelation, Matthew fulfillment formulas) | 1-2 sessions |
| ANE Parallels | Genesis 1-11 + Exodus 1-20 parallels (Enuma Elish, Atrahasis, Code of Hammurabi, etc.) | 1 session |
| Chiasm Structures | ~20 widely-accepted chiasms (Genesis 1, 6-9, Daniel 2-7, Psalm 23, major Gospel passages) | 1 session |

These are independent of the Content Library code — they follow the standard enrichment script pattern. The library picks them up automatically on next `build_sqlite.py` run.

### Effort: ~2 sessions

Session P: Steps 1-3 (build pipeline + screen UI)
Session Q: Steps 4-6 (deep-link plumbing + polish)

---

## Updated Execution Order (Full)

```
PART 1 — Differentiation Features (Sessions A-F)
  Phase 0  (categorization)       — Session A
  Phase 1  (tabbed infra)         — Session A
  Phase 2  (Context Hub)          — Session B
  Phase 3  (Connections Hub)      — Session B
  Phase 4  (Chiasm View)          — Session C
  Phase 5  (Genre Banner)         — Session D
  Phase 6  (Study Depth)          — Session D
  Phase 7  (Study Coach)          — Session E
  Phase 8  (Textual Enrichment)   — Session F
  Phase 9  (Concept Journey)      — Session F
  Phase 10 (Synoptic Diffs)       — Session F

PART 2 — Competitive Gap Features (Sessions G-K)
  Phase 11 (Verse Sharing)        — Session G
  Phase 16 (Streaks/Engagement)   — Session G
  Phase 12 (Multi-Translation)    — Session H
  Phase 13 (Interlinear)          — Session I + J
  Phase 14 (Accounts/Sync)        — Session K (architecture doc only)
  Phase 15 (AI Q&A)               — DEFERRED

PART 3 — Enhancement Features (Sessions L-O)
  Phase 17 (TTS Integration)      — Session L
  Phase 18 (Search Filters)       — Session L
  Phase 20 (Recommendations)      — Session L
  Phase 19 (Highlight UX)         — Session M
  Phase 21 (Concordance)          — Session N (depends on Phase 13)
  Phase 22 (Discourse Expansion)  — Session N (content-only)
  Phase 23 (Reading Plans)        — Session O (content + seed migration)

PART 4 — Content Discovery (Sessions P-Q)
  Phase 24 (Content Library)      — Session P (pipeline + screen) + Session Q (deep-link + polish)
```

**Total: ~17 sessions across 24 phases.**

---

## Updated Commit Convention (Phases 17-23)

```
feat(tts): Phase 17 — TTS integration into ChapterScreen
feat(search): Phase 18 — testament and book filter chips
feat(highlights): Phase 19 — highlight browse screen, collections, export
feat(home): Phase 20 — personalized study recommendations
feat(concordance): Phase 21 — Strong's concordance search
feat(content): Phase 22 — discourse analysis for Galatians, Ephesians, Hebrews, 1 Cor
feat(plans): Phase 23 — 10 curated study plans seeded into reading_plans
feat(explore): Phase 24 — Content Library screen with deep-link panel navigation
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
- [ ] No inline `style={{ }}` objects — use `StyleSheet.create()` for layout; apply colors via array syntax `[styles.x, { color: base.y }]`
- [ ] Colors reference `base.*` / `getPanelColors()` tokens (never hardcoded hex) — theme-ready regardless of whether theme infrastructure has shipped yet
