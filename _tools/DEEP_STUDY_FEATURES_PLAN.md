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

This plan is **purely additive**. Every existing feature on the chapter page is preserved exactly as-is. Nothing is being replaced, removed, or redesigned.

### ChapterScreen features that MUST remain untouched:

| Component | File | What it does |
|-----------|------|--------------|
| **ChapterNavBar** | `components/ChapterNavBar.tsx` | Full nav bar: Book Name ▾ (Qnav picker) \| ‹ chapter# › (prev/next arrows) \| ⓘ (book intro). DO NOT simplify or replace. |
| **QnavOverlay** | `components/QnavOverlay.tsx` | Full-screen book/chapter quick-navigation modal. |
| **NotesOverlay** | `components/notes/NotesOverlay.tsx` | 3-tab notes system (chapter notes, collections, search). |
| **ChapterHeader** | `components/ChapterHeader.tsx` | Title, subtitle, and tappable BadgeChip pills. |
| **Reading progress bar** | Inline in `ChapterScreen.tsx` | 2px gold bar below nav bar tracking scroll position. |
| **SectionHeader** | `components/SectionHeader.tsx` | Cinzel gold heading with bottom border. |
| **VerseBlock + VHL** | `components/VerseBlock.tsx` | Verse text rendering with Verse Highlight Links. |
| **SectionBlock** | `components/SectionBlock.tsx` | Container: SectionHeader → VerseBlock → ButtonRow → active panel. |
| **ButtonRow** | `components/ButtonRow.tsx` | Section-level: content buttons (square) + divider + scholar pills. |
| **PanelButton** | `components/PanelButton.tsx` | Individual toggle: square for content, pill for scholars. |
| **PanelContainer** | `components/PanelContainer.tsx` | Panel wrapper with close button, colored left border, header. |
| **ScholarlyBlock** | `components/ScholarlyBlock.tsx` | "CHAPTER ANALYSIS" divider + chapter-level ButtonRow + active panel. |
| **All existing panel types** | `components/panels/*.tsx` | Every existing panel renderer continues unchanged. |

### Integration rules:

1. **New ambient UI is INSERTED between existing components** — never replacing them.
2. **Composite panels enhance existing panels** — they detect new data shapes and render tabs, but old data shapes still render exactly as before.
3. **No component is deleted, renamed, or restructured** unless explicitly stated.

### Style convention:

Use `const { base } = useTheme()` for all color references. `StyleSheet.create()` for layout. Colors via array syntax: `[styles.card, { backgroundColor: base.bgElevated }]`.

---

## PRE-LAUNCH DEPENDENCY — Translation Licensing

**Status: BLOCKING for premium tier launch. Must be resolved before any paid features go live.**

CS displays NIV and ESV verse text. Once a paid tier (Companion+) exists, the app is **commercial**.

| Option | NIV Cost | ESV Cost | Complexity |
|--------|----------|----------|------------|
| Direct publisher licenses | Case-by-case royalty | Case-by-case | Requires legal entity, negotiation |
| API.Bible commercial tier | ~$10/month | ~$10/month | Simpler — express licensing |
| Move NIV/ESV to premium only | $0 | $0 | Weakens free tier significantly |

**Recommendation:** Apply to Biblica and Crossway directly first. API.Bible at $20/month total is a clean fallback. Do NOT launch a paid tier without resolving this.

---

## Completed Phases (0–23) — ALL SHIPPED

Data shapes for all completed phases archived in `_tools/COMPLETED_PHASES_REFERENCE.md`.

| Phase | Feature | Key data |
|-------|---------|----------|
| 0 | Chapter panel categorization (3 groups) | `CHAPTER_PANEL_CATEGORIES` in `panelLabels.ts` |
| 1 | TabbedPanelRenderer composite infrastructure | `TabConfig` interface |
| 2 | Context Hub (hist+ctx merge → tabbed composite) | `hist` panel: object with `context`, `historical`, `audience?`, `ane?[]` |
| 3 | Connections Hub (cross → tabbed with echoes) | `cross` panel: object with `refs[]`, `echoes?[]` |
| 4 | Literary Structure upgrade (chiasm view) | `lit` panel: `chiasm?` with `pairs[]` + `center` |
| 5 | Genre Guidance Banner | `genre`, `genre_label`, `genre_guidance` in books.json |
| 6 | Depth Indicator Dots | `study_depth` table in user.db |
| 7 | Study Coach Mode | `coaching[]` array in chapter JSON |
| 8 | Textual Notes Enrichment (tx upgrade) | `tx` panel: object with `notes[]`, `stories?[]` |
| 9 | Progressive Revelation (Concept Journey) | `journey_stops[]` in concepts.json |
| 10 | Synoptic Diff Highlighting | `diff_annotations[]` in parallel-passages.json |
| 11 | Verse Sharing & Copy | `VerseLongPressMenu`, `shareVerse()` utility |
| 12 | Multi-Translation Support (KJV) | `TranslationPicker`, verse files in `content/verses/kjv/` |
| 13 | Interlinear Viewer (444K words) | `interlinear_words` table, `InterlinearSheet` |
| 14 | User Accounts & Cloud Sync | Architecture doc: `_tools/SYNC_ARCHITECTURE.md` |
| 15 | AI-Powered Q&A | DEFERRED |
| 16 | Reading Streaks & Engagement | `reading_streaks` table, `StreakBadge`, `WeeklySummary` |
| 17 | TTS Integration | `TTSControls` wired into ChapterScreen |
| 18 | Search Filters (OT/NT/Book) | `SearchFilterChips`, FTS with testament/book WHERE |
| 19 | Highlight UX Polish (6 colors) | `highlight_collections` table, `HighlightColorPicker` |
| 20 | Personalized Recommendations | `useRecommendations` heuristic engine |
| 21 | Concordance Search | `ConcordanceScreen`, Strong's number lookup |
| 22 | Discourse Expansion | Galatians, Ephesians, Hebrews, 1 Corinthians — 41 chapters |
| 23 | Curated Reading Plans | 10 plans seeded via migration (5 free, 5 premium) |

---

## Phase P1 — Premium Store & Prompt Infrastructure

**Status: NOT STARTED. Prerequisite: Translation licensing resolved.**

**Session: ~1 full session.**

### Files to create

| File | Purpose |
|------|---------|
| `app/src/stores/premiumStore.ts` | Zustand store: `isPremium`, `purchaseType`, `expiresAt`, `checkPremiumStatus()`, `restorePurchase()` |
| `app/src/services/purchases.ts` | RevenueCat SDK wrapper. Configure 3 products: monthly ($4.99), annual ($39.99), lifetime ($99.99). |
| `app/src/hooks/usePremium.ts` | `const { isPremium, showUpgrade } = usePremium()` — single hook consumed everywhere. |
| `app/src/components/UpgradePrompt.tsx` | Reusable bottom-sheet modal. Props: `variant` ('scholar' \| 'feature' \| 'personal' \| 'explore'), `featureName`, `featureDescription`. See `_tools/PREMIUM_TIER_SPEC.md` §4 for wireframes. |
| `app/src/screens/SubscriptionScreen.tsx` | Full subscription management screen. Plan selection, feature list, restore purchases. |
| `app/src/utils/scholarSelection.ts` | `selectFreeScholars(panels)` — returns the 2 scholar IDs that are free for a section. Algorithm: 1 evangelical + 1 diverse. |

### Files to modify

| File | Change |
|------|--------|
| `app/src/screens/SettingsScreen.tsx` | Add "Companion+" row showing subscription status → SubscriptionScreen |
| `app/src/stores/index.ts` | Export premiumStore |
| `app/src/navigation/types.ts` | Add Subscription route to MoreStack |

### Dependencies

```bash
cd app && npx expo install react-native-purchases  # RevenueCat SDK (free until $2.5K MRR)
```

### Implementation steps

1. Install RevenueCat SDK
2. Create `premiumStore.ts` — persist locally, sync with RevenueCat on launch
3. Create `usePremium.ts` hook
4. Create `UpgradePrompt.tsx` with 4 variant layouts
5. Create `SubscriptionScreen.tsx`
6. Create `scholarSelection.ts` (2-scholar algorithm)
7. Add Companion+ row to SettingsScreen
8. Add Subscription route
9. Test with mock `isPremium` values

---

## Phase P2 — Gate Wiring (Retroactive + Forward)

**Status: NOT STARTED. Depends on Phase P1.**

**Session: ~1 session (same as P1 or immediately following).**

Adds `isPremium` checks to ALL features that are gated.

### Scholar gating (the conversion engine)

| File | Change |
|------|--------|
| `PanelButton.tsx` | Add `locked` prop. When locked: 🔒 icon overlay, tap → `showUpgrade('scholar')` |
| `SectionBlock.tsx` | Import `usePremium` + `selectFreeScholars`. Pass `locked` to non-free scholar PanelButtons. |
| `ScholarlyBlock.tsx` | Same for chapter-level scholar panels. |

### Feature gating

| Feature | File | Gate |
|---------|------|------|
| Interlinear | `InterlinearSheet.tsx` | UpgradePrompt('feature') if !isPremium |
| Echoes/Allusions | `EchoesView.tsx` | UpgradePrompt('feature') |
| Chiasm view | `LiteraryStructurePanel.tsx` | UpgradePrompt('feature') — basic lit stays free |
| Genre banner | `GenreBanner.tsx` | Don't render if !isPremium |
| Study depth dots | `DepthDots.tsx` | Don't render if !isPremium |
| Study coaching | `StudyCoachCard.tsx` | Don't render if !isPremium |
| Manuscript stories | `TextualPanel.tsx` | UpgradePrompt('feature') — basic notes stay free |
| Concept journey | `ConceptDetailScreen.tsx` | Gate journey view, overview stays free |
| Discourse | `DiscoursePanel.tsx` | UpgradePrompt('feature') |
| Difficult passages | `DifficultPassageDetailScreen.tsx` | Gate scholarly responses, consensus stays free |

### Explore tool gating

| Feature | Free | Premium |
|---------|------|---------|
| Prophecy chains | Browse + overview | Detail/per-link analysis |
| Word studies | Browse + definition | Full lexicon + occurrences |
| Concept explorer | Browse + description | Journey/progression |
| Difficult passages | Browse + consensus | Scholarly responses |

### Personal feature gating

| File | Change |
|------|--------|
| `HighlightColorPicker.tsx` | 3 colors free, rest locked |
| Reading plans | 5 free, 5 premium (lock icon) |
| `TTSControls.tsx` | Basic voice free, premium voices gated |

### HomeScreen upsell

After `totalChapters >= 5` AND `!isPremium`: subtle gold-bordered "Companion+" card (max once per session, dismissible).

### Commit convention

```
feat(premium): Phase P1 — subscription infrastructure
feat(premium): Phase P2 — gate wiring for scholars, tools, explore, personal
```

---

## Phase 24 — Content Library

**Status: IN PROGRESS (Claude Code building pipeline + screen).**

**Goal:** A single searchable screen in Explore with category tabs aggregating panel content from across all chapters. Deep-link navigation auto-opens the source panel and preserves back-navigation state.

**Content inventory (updated April 2026):**

| Category | Entries | Source panel | Level |
|----------|---------|-------------|-------|
| Chiasm Structures | 16 | `lit.chiasm` (chapter) | chapter |
| ANE Parallels | 19 | `hist.ane` (section) | section |
| Echoes & Allusions | 26 | `cross.echoes` (section) | section |
| Manuscript Stories | 10 | `tx.stories` (chapter) | chapter |
| Discourse / Argument Flow | 57 | `discourse` (chapter) | chapter |
| **Total** | **128** | | |

Empty categories hidden automatically — tabs appear as enrichment fills them.

### Database — content_library table (scripture.db, build-time index)

```sql
CREATE TABLE content_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  book_id TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  section_num INTEGER,
  panel_type TEXT NOT NULL,
  tab_key TEXT,
  testament TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_cl_category ON content_library(category);
CREATE INDEX idx_cl_book ON content_library(book_id);
```

### Deep-link: openPanel route param

```typescript
// Added to Chapter params in ALL stacks:
Chapter: {
  bookId: string;
  chapterNum: number;
  openPanel?: {
    sectionNum?: number;
    panelType: string;
    tabKey?: string;
  };
};
```

Flow: ChapterScreen reads `openPanel` → passes to SectionBlock/ScholarlyBlock → auto-opens matching panel → auto-scrolls → "← Content Library" breadcrumb for back navigation.

### Files to create

| File | Purpose |
|------|---------|
| `app/src/screens/ContentLibraryScreen.tsx` | Category tabs + search + OT/NT chips + grouped SectionList |
| `app/src/components/ContentLibraryCard.tsx` | Entry card: title, reference pill, preview |
| `app/src/hooks/useContentLibrary.ts` | Queries content_library table |

### Files to modify

| File | Change |
|------|--------|
| `_tools/build_sqlite.py` | content_library table creation + population |
| `_tools/validate_sqlite.py` | Add content_library validation |
| `app/src/navigation/types.ts` | ContentLibrary route + openPanel param |
| `app/src/screens/ExploreMenuScreen.tsx` | Add Content Library to grid |
| `app/src/screens/ChapterScreen.tsx` | Read openPanel, pass down, breadcrumb, auto-scroll |
| `app/src/components/SectionBlock.tsx` | Accept openPanel, auto-open |
| `app/src/components/ScholarlyBlock.tsx` | Accept openPanel, auto-open |
| `app/src/components/panels/TabbedPanelRenderer.tsx` | Accept defaultTab prop |
| `app/src/components/ChapterNavBar.tsx` | Breadcrumb when fromLibrary |
| `app/src/db/database.ts` | getContentLibrary queries |

### Implementation steps

1. **Build pipeline** — content_library table in build_sqlite.py
2. **Database queries + hook** — database.ts + useContentLibrary.ts
3. **Screen + card** — ContentLibraryScreen + ContentLibraryCard + navigation
4. **Deep-link plumbing** — openPanel param + auto-open + defaultTab
5. **Auto-scroll + breadcrumb** — scroll-to-panel + back navigation
6. **Validate + commit**

### Content enrichment

Full enrichment plan: **`_tools/CONTENT_LIBRARY_ENRICHMENT_PLAN.md`** (Phase 24E). Expands 128 → ~270 entries across 9 batches in ~5 sessions.

### Effort: ~2 sessions (P: pipeline+screen, Q: deep-link+polish)

---

## Execution Order — Remaining Work

```
ACTIVE
  Phase 24  (Content Library)       — Session P + Q (in progress)
  Phase 24E (Content Enrichment)    — Sessions R1-R5 (see CONTENT_LIBRARY_ENRICHMENT_PLAN.md)

PREMIUM (blocked on translation licensing)
  Phase P1  (Premium Store)         — 1 session
  Phase P2  (Gate Wiring)           — 1 session

DEFERRED
  Phase 15  (AI Q&A)                — Revisit post-launch
```

---

## Commit Convention

```
feat(explore): Phase 24 — Content Library screen with deep-link panel navigation
feat(content): Phase 24E Batch N — [see CONTENT_LIBRARY_ENRICHMENT_PLAN.md]
feat(premium): Phase P1 — subscription infrastructure
feat(premium): Phase P2 — gate wiring
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
- [ ] No inline `style={{ }}` objects — use `StyleSheet.create()` for layout
- [ ] Colors reference `base.*` / `getPanelColors()` tokens via `useTheme()`
