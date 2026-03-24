# UI/UX Implementation Plan

**Reference:** `app/UI_UX_AUDIT.md`  
**Last updated:** 2026-03-24  
**Status:** Phases 1–4 complete, Phase 5 remaining  

---

## Overview

This plan addresses all issues identified in the UI/UX audit, organized into 
5 phases. Each phase is self-contained and shippable — you can stop after any 
phase and have a working, improved app.

**Phase 1** — Tab bar icons + More menu (2 files new, 2 files modified)  
**Phase 2** — Home screen redesign (1 file rewritten, 2 files new)  
**Phase 3** — Chapter screen polish (8 files modified, 1 deleted, 1 new)  
**Phase 4** — Secondary screen fixes (8 files modified, 1 new component)  
**Phase 5** — Design system hardening (10+ files, ongoing)  

---

## Phase 1: Tab Bar Icons + More Menu ✅ COMPLETE

**Why first:** These are the two most visible "this looks unfinished" problems. 
Tab icons are on screen 100% of the time. The More menu blocks feature 
discovery. Both are small, surgical changes.

**Decision:** About info will live on HomeScreen (Phase 2) as a subtle footer
colophon, not in the More menu. More menu has 4 rows: Bookmarks, Reading 
History, Reading Plans, Settings.

### 1A. Tab Bar Icons

**File:** `src/navigation/TabNavigator.tsx`  
**Dependency:** `lucide-react-native` (already installed)

**Changes:**
- Import 5 icons from lucide-react-native:
  - HomeTab → `Home`
  - ReadTab → `Library`
  - ExploreTab → `Compass`
  - SearchTab → `Search`
  - MoreTab → `MoreHorizontal`
- Add `tabBarIcon` to each `Tab.Screen` options:
  ```tsx
  options={{
    tabBarLabel: 'Home',
    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
  }}
  ```
- Adjust `tabBarLabelStyle` fontSize from 10 → 9 to accommodate icons.
- Add `tabBarIconStyle: { marginBottom: -2 }` to tighten icon-label spacing.

**No other files affected.**

### 1B. More Menu Screen

**Problem:** The More tab currently lands on SettingsScreen. Bookmarks, 
Reading History, and Reading Plans are registered in MoreStack but have 
no navigation path — they're invisible.

**New file:** `src/screens/MoreMenuScreen.tsx`

**Design:**
- SafeAreaView with dark background
- "More" title in Cinzel gold (consistent with other tab landing pages)
- 5 menu rows, each a TouchableOpacity with:
  - Left: Lucide icon (20px, base.textDim)
  - Center: Label (SourceSans3_500Medium, 15pt, base.text)
  - Right: Lucide `ArrowRight` icon (14px, base.textMuted)
  - Full row height: MIN_TOUCH_TARGET (44pt)
  - Bottom border: base.border + '40'

**Menu items:**
| Icon | Label | Screen |
|------|-------|--------|
| Bookmark | Bookmarks | Bookmarks |
| Clock | Reading History | ReadingHistory |
| Calendar | Reading Plans | PlanList |
| Settings | Settings | Settings |
| Info | About | About (new — extract from Settings) |

**File modified:** `src/navigation/MoreStack.tsx`
- Change initial screen from `Settings` to `MoreMenu`
- Add `<Stack.Screen name="MoreMenu" component={MoreMenuScreen} />`
- Add `<Stack.Screen name="About" component={AboutScreen} />` (optional, 
  can remain within Settings for now)

**Data needed:** None — pure navigation screen.

---

## Phase 2: Home Screen Redesign ✅ COMPLETE

**Why second:** The home screen is the first impression. Phase 1 gave us 
proper navigation chrome; now we fix the content.

**Implementation notes:**
- About info placed as footer colophon on HomeScreen (book icon + italic 
  description + version) instead of separate screen or More menu row.
- 31 curated verses in FEATURED_VERSES array for Verse of the Day.
- HomeStack now has Chapter, ChapterList, BookList, BookIntro, 
  ParallelPassage screens for in-tab navigation from home cards.
- getContentStats() batches 5 COUNT queries with Promise.all.
- Includes timelineCount for explore link subtitle.

### 2A. New DB Queries

**File:** `src/db/content.ts` — add these queries:

```typescript
// Live counts for home screen stats
export async function getContentStats(): Promise<{
  liveBooks: number;
  liveChapters: number;
  scholarCount: number;
  peopleCount: number;
}> {
  const books = await getDb().getFirstAsync<{c: number}>(
    "SELECT COUNT(*) as c FROM books WHERE is_live = 1"
  );
  const chapters = await getDb().getFirstAsync<{c: number}>(
    "SELECT COUNT(*) as c FROM chapters"
  );
  const scholars = await getDb().getFirstAsync<{c: number}>(
    "SELECT COUNT(*) as c FROM scholars"
  );
  const people = await getDb().getFirstAsync<{c: number}>(
    "SELECT COUNT(*) as c FROM people"
  );
  return {
    liveBooks: books?.c ?? 0,
    liveChapters: chapters?.c ?? 0,
    scholarCount: scholars?.c ?? 0,
    peopleCount: people?.c ?? 0,
  };
}
```

### 2B. New Hook

**New file:** `src/hooks/useHomeData.ts`

Consolidates all home screen data into one hook:
```typescript
export function useHomeData() {
  // Returns: { stats, recentChapters, readingStats, currentBook, isLoading }
  // stats = getContentStats()
  // recentChapters = getRecentChapters(3)  — last 3 chapters, not 5
  // readingStats = getReadingStats()
  // currentBook = derived from most recent chapter
}
```

### 2C. Rewrite HomeScreen

**File:** `src/screens/HomeScreen.tsx` — full rewrite

**Design reference:** YouVersion Bible App home screen — warm, personal, 
content-forward. Not a library catalog. Adapted to our scholarly dark theme.

**New layout (top to bottom):**

1. **Time-Aware Greeting** (new)
   - "Good Morning" / "Good Afternoon" / "Good Evening" based on device time
   - Cinzel_600SemiBold, 22pt, base.text
   - Below: dynamic subtitle in textDim, EB Garamond italic:
     "{liveBooks} books · {liveChapters} chapters · {scholarCount} scholars"
   - Pulled from useHomeData().stats

2. **Verse of the Day Card** (new, hero-sized — like YouVersion)
   - Full-width card, generous padding, bgElevated background
   - Subtle gradient or border accent (gold, very low opacity)
   - Top: "Verse of the Day" label in Cinzel, textMuted, 10pt
   - Below: verse reference in gold, Cinzel_500Medium, 16pt 
     (e.g., "Matthew 7:8")
   - Body: verse text in EB Garamond, base.text, 20-22pt, generous 
     line height — the text IS the design, just like YouVersion
   - Tappable: navigates to the chapter containing the verse
   - **Verse selection:** deterministic daily rotation — hash the date 
     string to pick from a curated list of ~365 verses stored in the DB 
     or a hardcoded array in the hook. Avoids needing a server.

3. **Continue Reading Card** (like YouVersion's "Guided Scripture" cards)
   - Full-width card, bgElevated, border
   - Left side: book name + chapter number + chapter title (stacked)
   - Right side: subtle arrow or "Continue" label
   - Only shows if recentChapters.length > 0
   - If no history: show a "Start Reading" card that links to Genesis 1 
     with inviting copy: "Begin your journey through Scripture"
   - Visual style: same card style as Verse of the Day but slightly 
     smaller, less padding

4. **Reading Stats Row** (compact, below cards)
   - Three stat boxes in a horizontal row
   - Chapters read | Current streak | Books explored
   - Only shows if totalChapters > 0
   - Gold numbers (Cinzel), muted labels (SourceSans3), compact

5. **Explore Quick Links** (like YouVersion's bottom cards)
   - Vertical stack of 2-3 cards, each a touchable row:
     - Left: section label + title (stacked)
     - Right: Lucide icon or subtle visual
   - Cards:
     - "People" → "233 biblical figures across 9 eras" → GenealogyTree
     - "Timeline" → "115 events from Creation to Revelation" → Timeline
     - "Scholars" → "46 commentators across traditions" → ScholarBrowse
   - Counts pulled from DB via useHomeData().stats
   - Subdued card style — these are discovery paths, not hero content

**REMOVED from HomeScreen:**
- OT/NT toggle (moves to BookListScreen as the canonical view mode — see 4B)
- Full book list (moves to BookListScreen with view selector — see 4B)
- Search bar (lives in Search tab)
- Inline search results (lives in Search tab)
- "Scripture Deep Dive" as a hero title (replaced by personal greeting — 
  the app name lives in the tab bar and splash screen)

**New hook addition — Verse of the Day:**

```typescript
// Inside useHomeData.ts or a separate useVerseOfDay.ts
function getVerseOfDay(): { ref: string; bookId: string; chapter: number; text: string } {
  // Curated array of ~100-365 verse objects
  // Index = dayOfYear % array.length
  // Returns the verse text + navigation target
}
```

Option A: Hardcoded curated array (simplest, no DB dependency)
Option B: Query a `verses_featured` table (more maintainable, add later)

Recommend Option A for now — ship fast, migrate to DB later.

**REMOVED from HomeScreen:**
- OT/NT toggle (moves to BookListScreen as the canonical view mode — see 4B)
- Full book list (moves to BookListScreen with view selector — see 4B)
- Search bar (lives in Search tab)
- Inline search results (lives in Search tab)

**Files affected:**
- `src/screens/HomeScreen.tsx` — full rewrite
- `src/hooks/useHomeData.ts` — new file
- `src/db/content.ts` — add getContentStats()
- `src/navigation/HomeStack.tsx` — add Chapter screen to HomeStack so 
  "Continue Reading" can navigate directly to a chapter without switching 
  tabs (add same screens as ReadStack: Chapter, ChapterList, BookList)

**Navigation consideration:** HomeStack currently only has HomeMain. For the 
Continue Reading card to navigate to a chapter without switching tabs, 
HomeStack needs Chapter (and ideally ChapterList and BookList) as screens. 
This is a common React Navigation pattern — shared screens across stacks.

---

## Phase 3: Chapter Screen Polish ✅ COMPLETE

**Why third:** With the home screen fixed, users will navigate to chapters 
quickly. Now we polish the 90%-of-time screen.

**Implementation notes:**
- CompactDropdown is fully generic (value/options/onSelect/direction).
  TranslationDropdown is a thin wrapper. ViewModeDropdown reuses it in Phase 4.
- ChapterNavBar now owns translation state directly via settingsStore.
- QnavOverlay wired into ChapterScreen (was orphaned — toggleQnav fired 
  but nothing rendered). Auto-expands current book, highlights current chapter.
- BottomBar deleted entirely — all controls live in nav bar now.
- Zero chevrons remain in codebase (verified via grep). TTS ▶ play icon kept.
- "About This Book →" converted from BadgeChip to plain text link.
- settingsStore translation type widened from 'niv'|'esv' to string.

### 3A. Chapter Nav Bar — Simplified, No Redundancy

**Files:**
- `src/components/ChapterNavBar.tsx` — major rewrite
- `src/components/QnavOverlay.tsx` — kept, refined
- `src/components/TranslationDropdown.tsx` — new, lives in nav bar
- `src/stores/settingsStore.ts` — widen translation type

**Current state:** The nav bar shows `← Library | Ezekiel 43 | ← →`. 
Tapping the center title opens a full-screen QnavOverlay modal. The chapter 
page below also shows "Ezekiel 43" as a title — redundant.

**Principle:** The book picker in the nav bar shows WHERE you are (book name). 
The chapter content below shows WHAT you're reading (chapter title). No 
duplication.

**New nav bar layout:**
```
┌──────────────────────────────────────────┐
│  ← Ezekiel     [NIV]     ‹  Ch 43  ›   │
│  (back/picker)  (trans)    (prev/next)  │
└──────────────────────────────────────────┘
```

**Left: Book name as back button + picker trigger**
- Lucide `ArrowLeft` icon (not ChevronLeft — no chevrons anywhere) + 
  book name text: `← Ezekiel`
- **Short tap:** Goes back to chapter list for current book
- **Long press:** Opens QnavOverlay for full book/chapter navigation
- No chevron, no "▾" — the long-press behavior is a power-user shortcut, 
  not a visible affordance. The primary tap does the expected thing (back).

**Center: Translation dropdown**
- CompactDropdown showing active translation: `NIV`
- Taps to reveal options (NIV, ESV, future additions)
- Dropdown expands **downward** from the nav bar
- Compact pill style: bgElevated background, border, radii.pill
- No chevron on the pill — just the label. The pill shape itself signals 
  it's interactive.
- Active option in dropdown: gold text + `Check` icon
- Inactive options: base.text

**Right: Prev/Next with chapter number**
- `‹  Ch 43  ›` — Lucide `ArrowLeft` / `ArrowRight` icons flanking the 
  chapter number
- Disabled state: icon color fades to `base.textMuted + '40'`
- The chapter number between the arrows provides context and acts as a 
  mini position indicator

**What's REMOVED from nav bar:**
- No "Library" text (replaced by book name which is more contextual)
- No redundant "Ezekiel 43" center title (chapter page content handles this)
- No chevrons on anything

**Props:**
```tsx
interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
  // Translation handled internally via settingsStore
}
```

**TranslationDropdown in nav bar** (new component):
```tsx
// src/components/TranslationDropdown.tsx
// Uses CompactDropdown internally (see architecture notes at bottom of plan)
interface TranslationDropdownProps {
  active: string;
  options: { key: string; label: string }[];
  onSelect: (key: string) => void;
}
```

Extensible labels map:
```tsx
const TRANSLATION_OPTIONS = [
  { key: 'niv', label: 'NIV' },
  { key: 'esv', label: 'ESV' },
  // Future: { key: 'kjv', label: 'KJV' }, etc.
];
```

**Store update — `src/stores/settingsStore.ts`:**
```tsx
// Widen translation type:
translation: string;  // was 'niv' | 'esv'
setTranslation: (t: string) => void;
```

**QnavOverlay refinement:**
- Auto-expand the current book on open
- Highlight the current chapter number in the grid (gold bg)
- Replace `✕` text with Lucide `X` icon

### 3B. Remove Bottom Bar Entirely

**Files:**
- `src/components/BottomBar.tsx` — DELETE this file
- `src/screens/ChapterScreen.tsx` — remove BottomBar import and usage

**Current state:** Bottom bar shows `← Prev | [NIV | ESV] | Next →`, 
duplicating the top bar's prev/next and housing the translation toggle.

**Decision:** Bottom bar is removed entirely.
- Prev/next lives in the nav bar (3A)
- Translation lives in the nav bar (3A)
- Font size A-/A+ stays in Settings screen only (it's a set-once preference, 
  not a per-session toggle)
- No bookmark bar button — bookmarking is better as a verse long-press action 
  (future feature)

**ChapterScreen.tsx changes:**
```tsx
// Remove:
import { BottomBar } from '../components/BottomBar';
// Remove the entire <BottomBar ... /> JSX at bottom of the return
// Remove hasPrev/hasNext/goPrev/goNext props passed to BottomBar
// (keep them — they're still used by ChapterNavBar)
```

**Note:** The BottomBar.tsx file can be kept in the repo but unused, or 
deleted outright. Recommend deletion for cleanliness — it's in git history 
if we ever need it back.

### 3C. Remove All Chevrons from Panel Buttons

**File:** `src/components/PanelButton.tsx`

**Rule: No chevrons anywhere in the app.** This is a global design decision.

Current panel buttons render: `Hebrew ▾`, `Calvin ▾`, `Cross-Ref ▾`, etc.

Change:
```tsx
// Before:
{label} ▾

// After:
{label}
```

The active/inactive state is already communicated via background color and 
text color changes (active = accent bg 20% + accent text; inactive = 
transparent bg + textDim). The chevron is redundant visual noise.

**Also remove chevrons from:**
- `src/components/QnavOverlay.tsx` — book expand indicators (`▸` / `▾`)
  Replace with Lucide `Plus` / `Minus` icons, or simply remove them and 
  let the expand/collapse animation communicate the state
- Any other component that uses `▾`, `▸`, `▶`, or `ChevronDown/Right` as 
  a UI affordance — grep and eliminate

**Grep check before shipping:**
```bash
grep -rn '▾\|▸\|▶\|ChevronDown\|ChevronRight\|ChevronUp' src/ --include="*.tsx"
```
The only acceptable Chevron usage after this phase is **zero**.

### 3D. Scholarly Block Label

**File:** `src/components/ScholarlyBlock.tsx`

Change:
```tsx
// Before:
"SCHOLARLY BLOCK"
// After:
"CHAPTER ANALYSIS"
```

One-line change.

### 3E. Chapter Header Badge Cleanup

**File:** `src/components/ChapterHeader.tsx`

Changes:
- Add Lucide icons to deep-link badges:
  - Timeline badge: prepend `Clock` icon (size 12)
  - Map badge: prepend `MapPin` icon (size 12)
- Consider changing "About This Book →" from a badge to a plain text link 
  to reduce visual noise in the action bar
- "Notes" badge: add `StickyNote` icon

---

## Phase 4: Secondary Screen Fixes ✅ COMPLETE

**Implementation notes:**
- SearchScreen: book_name joined in searchVerses query, display names in
  results, empty state with Search icon, "Load more" button at 20 results.
- BookListScreen: ViewModeDropdown (reuses CompactDropdown) in title row.
  Thematic (default) = SectionList by tradition. Canonical = OT/NT toggle 
  + FlatList. Shared renderBookRow function. No LIVE badges.
- ChapterListScreen: ArrowLeft back button, no "· Live" label, read 
  progress via getProgressForBook() → visited chapters get gold tint.
- ExploreMenuScreen: Lucide icons replacing emojis, panel accent colors 
  per card border, live counts from getContentStats().
- SettingsScreen: dynamic stats from DB, working Clear History with 
  confirmation + feedback, version from app.json, back button added.
- settingsStore: bookListMode added (persisted, default 'thematic').

### 4A. Search Screen Display Names

**File:** `src/screens/SearchScreen.tsx`

Problem: Verse results show `v.book_id` (DB slug like "ezekiel") instead of 
the display name ("Ezekiel").

Fix options:
1. Join to books table in the searchVerses query (preferred — fix in DB layer)
2. Build a book_id → name lookup in the component

**Better fix in `src/db/content.ts`:**
```typescript
export async function searchVerses(query: string, limit: number = 50) {
  return getDb().getAllAsync(
    `SELECT v.*, b.name as book_name FROM verses_fts f
     JOIN verses v ON v.id = f.rowid
     JOIN books b ON b.id = v.book_id
     WHERE f.text MATCH ?
     LIMIT ?`,
    [query, limit]
  );
}
```

Then in SearchScreen, display `v.book_name` instead of `v.book_id`.

Also add:
- Empty state: "No results found for '{query}'" when results are empty
- "Load more" button when verses.length === 20 (current slice limit)

### 4B. Book List — View Selector (Canonical + Thematic) + Badge Fix

**Files:**
- `src/screens/BookListScreen.tsx` — major update
- `src/components/ViewModeDropdown.tsx` — new component

**Context:** Currently HomeScreen has a canonical view (OT/NT toggle, flat list 
in Bible order) and BookListScreen has a thematic view (grouped by tradition: 
Law, History, Poetry, Prophets, etc.). After Phase 2 removes the book list from 
HomeScreen, both views need to live on BookListScreen.

**New component: ViewModeDropdown**

A compact dropdown selector that shows only the active view label. Tapping it 
reveals both options; selecting one collapses it back. This is friendlier on 
mobile than a toggle that shows both options permanently.

```
┌─────────────────────┐
│  By Tradition       │   ← Compact pill, shows active mode only
└─────────────────────┘

  Tapped ↓

┌─────────────────────┐
│  By Tradition  ✓    │   ← Highlighted as current
│  Canonical          │   ← Tap to switch
└─────────────────────┘
```

**Implementation — `src/components/ViewModeDropdown.tsx`:**

```tsx
interface ViewModeDropdownProps {
  mode: 'canonical' | 'thematic';
  onModeChange: (mode: 'canonical' | 'thematic') => void;
}
```

Design details:
- **Closed state:** Pill-shaped button (bgElevated, border, radii.md)
  - Label: mode label in SourceSans3_500Medium, 13pt, base.text
  - No chevron, no icon — pill shape is sufficient affordance
  - Height: 34px (compact but touchable — full pill is the tap target)
  - Width: auto (fits content)
- **Open state:** Same pill expands into a small dropdown below
  - Absolute positioned, same width as pill, bgElevated, border
  - Two rows, each MIN_TOUCH_TARGET height
  - Active row: gold text + `Check` icon
  - Inactive row: base.text, no icon
  - Tap outside or select → closes
  - Use a transparent overlay behind the dropdown to capture outside taps
- **Labels:**
  - `'canonical'` → "Canonical Order"
  - `'thematic'` → "By Tradition"
- **Persist preference:** Store selected mode in settingsStore or user 
  preferences so it survives app restarts. Add to settingsStore:
  ```tsx
  bookListMode: 'canonical' | 'thematic';
  setBookListMode: (m: 'canonical' | 'thematic') => void;
  ```

**Implementation — `src/screens/BookListScreen.tsx`:**

State: `const mode = useSettingsStore(s => s.bookListMode);`

The screen renders differently based on mode:

**Thematic mode** (current behavior, becomes default):
- SectionList with OT_GROUPS + NT_GROUPS headers
- Groups: Law, History, Poetry & Wisdom, Major Prophets, Minor Prophets, 
  Gospels & Acts, Pauline Epistles, General Epistles, Apocalypse
- No OT/NT toggle needed — sections already separate them

**Canonical mode** (moved from HomeScreen):
- OT/NT toggle at top (the gold underline toggle from current HomeScreen)
- FlatList of books filtered by testament, in Bible order
- No section groupings — simple flat list
- Same row component as thematic mode (book name + chapter count + badge)

**Layout structure:**
```
┌──────────────────────────────────────┐
│  Library        [Canonical Order]   │  ← title + dropdown pill, same line
├──────────────────────────────────────┤
│  [OT / NT toggle]                   │  ← only in canonical mode
├──────────────────────────────────────┤
│  LAW                                │  ← section headers (thematic only)
│  Genesis                    50 ch   │
│  Exodus                     40 ch   │
│  ...                                │
└──────────────────────────────────────┘
```

The title row uses `flexDirection: 'row', justifyContent: 'space-between'` 
to place "Library" on the left and the dropdown on the right.

**Badge removal (included in this task):**

Remove ALL "LIVE" badges and status indicators from the book list. The 
dimmed text color on non-live books is sufficient to communicate status — 
no badge needed.

**`is_live` dependency audit (completed):**

| File | Usage | Action |
|------|-------|--------|
| `BookListScreen.tsx:74` | `BadgeChip label="LIVE"` | **REMOVE** — delete the badge entirely |
| `HomeScreen.tsx:141` | `BadgeChip label="LIVE"` | **REMOVE** — gone after Phase 2 rewrite anyway |
| `ChapterListScreen.tsx:32` | `' · Live'` text suffix | **REMOVE** — see 4C below |
| `BookListScreen.tsx:68` | Dims book name when `!is_live` | **KEEP** — this IS the visual indicator |
| `QnavOverlay.tsx:110,139` | Dims book/chapter text | **KEEP** — correct behavior |
| `ChapterListScreen.tsx:50-51` | Disables chapter taps when `!is_live` | **KEEP** — critical navigation guard |
| `QnavOverlay.tsx:129-130` | Disables chapter selection | **KEEP** — critical navigation guard |
| `content.ts:32` | `getLiveBooks()` query | **KEEP** — used by hooks |
| `types/index.ts:18` | `is_live: boolean` type | **KEEP** — field still in DB |
| `verseResolver.ts:176` | `isLiveBook()` utility | **KEEP** — fast existence check |

The `is_live` field stays in the DB and code — it's doing important work 
gating navigation and dimming text. We just kill the visual badges.

```tsx
// BookListScreen.tsx — REMOVE this entire line:
{!!book.is_live && <BadgeChip label="LIVE" color={base.gold} />}
```

**Shared book row component:**

Since both views render the same book row (name, chapter count, badge, 
onPress), extract a `BookRow` component or inline function to avoid 
duplicating the renderItem code:

```tsx
const renderBookRow = (book: Book) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('ChapterList', { bookId: book.id })}
    style={bookRowStyle}
  >
    <Text style={{ color: book.is_live ? base.text : base.textMuted, ... }}>
      {book.name}
    </Text>
    <Text style={{ color: base.textMuted, fontSize: 11 }}>
      {book.total_chapters} ch
    </Text>
  </TouchableOpacity>
);
```

Used by both the SectionList renderItem (thematic) and FlatList renderItem 
(canonical).

### 4C. Chapter List — Read Progress + Remove "Live" Label

**File:** `src/screens/ChapterListScreen.tsx`

**Remove "· Live" text from subtitle:**
```tsx
// Before:
{book.total_chapters} chapters{book.is_live ? ' · Live' : ''}

// After:
{book.total_chapters} chapters
```

The dimmed chapter numbers already communicate non-live status. No label 
needed.

**Add read progress indicators:**
Changes:
- Import `getProgressForBook` from `../db/user`
- Load progress on mount: `const [visited, setVisited] = useState<Set<number>>(new Set())`
- In the chapter grid, add a visual indicator for visited chapters:
  ```tsx
  backgroundColor: visited.has(ch) ? base.gold + '15' : base.bgElevated,
  ```
  Or a small dot indicator below the chapter number.

### 4D. Explore Menu — Replace Emojis with Icons

**File:** `src/screens/ExploreMenuScreen.tsx`

Changes:
- Import Lucide icons: `Users`, `Map`, `Clock`, `GitCompare`, `BookOpen`, 
  `GraduationCap`
- Replace emoji strings with styled icons:
  ```tsx
  // Before:
  { title: 'People', icon: '👥', ... }
  // After:
  { title: 'People', icon: Users, ... }
  ```
- Render: `<f.icon size={24} color={base.gold} />`
- Add live counts to subtitles by querying the DB
- Add subtle accent border colors per card using panel colors

### 4E. Settings Screen — Fix Hardcoded Values + Dead Button

**File:** `src/screens/SettingsScreen.tsx`

Changes:
- Import `getContentStats` from `../db/content`
- Load stats on mount, replace hardcoded text:
  ```tsx
  // Before:
  "43 scholars across 30 books with 879 chapters"
  // After:
  `${stats.scholarCount} scholars across ${stats.liveBooks} books 
   with ${stats.liveChapters} chapters`
  ```
- Fix "Clear Reading History" — implement the onPress:
  ```tsx
  onPress: async () => {
    await getDb().runAsync("DELETE FROM reading_progress");
    // Show success feedback
  }
  ```
- Version number: import from app.json or use Constants.expoConfig.version

### 4F. Back Navigation on ChapterListScreen

**File:** `src/screens/ChapterListScreen.tsx`

Add a back button at the top:
```tsx
<TouchableOpacity onPress={() => navigation.goBack()}>
  <ArrowLeft size={20} color={base.gold} />
</TouchableOpacity>
```

Currently relies on system back gesture which isn't obvious on iOS.

---

## Phase 5: Design System Hardening

This phase is ongoing and can be done incrementally across sessions.

### 5A. Gold Overuse Reduction

**File:** `src/theme/colors.ts`

Add a new token:
```typescript
export const base = {
  // ... existing ...
  accent: '#c9a84c',        // primary accent (rename gold → accent in usage)
  verseNum: '#9a8a6a',      // verse numbers — warmer, less prominent than gold
  navText: '#d8ccb0',       // navigation text — lighter than gold, less saturated
} as const;
```

Then selectively replace `base.gold` usage:
- Verse numbers in VerseBlock.tsx → `base.verseNum`
- "← Library" and nav arrows in ChapterNavBar → `base.navText`
- Keep `base.gold` for: titles, active states, primary buttons, branding

**This is a high-touch change** — grep for `base.gold` across all files and 
decide per-usage. Do NOT find-and-replace blindly.

### 5B. Elevated Background Contrast

**File:** `src/theme/colors.ts`

```typescript
// Before:
bgElevated: '#181410',
// After:
bgElevated: '#1e1a12',  // slightly more contrast
```

Test on a real device screen — dark theme contrast is screen-dependent.

### 5C. StyleSheet Extraction (Incremental)

For each component, extract inline styles to a `StyleSheet.create()` block 
at the bottom of the file. Priority order:
1. ChapterScreen.tsx (most complex)
2. VerseBlock.tsx (rendered per-verse, performance-sensitive)
3. HomeScreen.tsx (after Phase 2 rewrite)
4. SectionBlock.tsx
5. All panel components

Pattern:
```tsx
// At bottom of file:
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.bg },
  verseRow: { flexDirection: 'row', marginBottom: 2 },
  // ...
});
```

### 5D. Loading States for Explore Screens

Add LoadingSkeleton to screens that currently show blank while loading:
- `GenealogyTreeScreen.tsx`
- `MapScreen.tsx`
- `TimelineScreen.tsx`
- `ScholarBrowseScreen.tsx`
- `WordStudyBrowseScreen.tsx`

Pattern:
```tsx
if (isLoading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <LoadingSkeleton lines={6} />
    </SafeAreaView>
  );
}
```

### 5E. Panel Button Grouping (Future — Complex)

This is the most complex UI change and should be deferred until after 
Phases 1-4 are stable. The idea:

Instead of 8 individual buttons per section:
`[Hebrew] [Context] [Cross-Ref] [MacArthur] [Calvin] [NET] [Block] [Zimmerli]`

Group scholars:
`[Hebrew] [Context] [Cross-Ref] [Scholars]`

Tapping "Scholars" expands to show individual scholar buttons. This 
reduces visual density on the button row.

**Implementation:**
- New component: `ScholarButtonGroup.tsx`
- Wraps multiple scholar PanelButtons in a collapsible container
- ButtonRow detects scholar panels and renders the group instead
- Requires state management for the group expand/collapse

**Defer this** until user feedback confirms button density is a real problem 
on phones. It may be fine with the horizontal scroll.

---

## File Change Summary

### New Files (6)
| File | Phase | Purpose |
|------|-------|---------|
| `src/screens/MoreMenuScreen.tsx` | 1B | More tab landing page |
| `src/hooks/useHomeData.ts` | 2B | Consolidated home screen data |
| `src/components/CompactDropdown.tsx` | 3B | Reusable dropdown (up/down direction) |
| `src/components/TranslationDropdown.tsx` | 3B | Thin wrapper — translation picker |
| `src/components/ViewModeDropdown.tsx` | 4B | Thin wrapper — canonical/thematic selector |
| (optional) `src/screens/AboutScreen.tsx` | 1B | Extracted from Settings |
| (optional) `src/components/ScholarButtonGroup.tsx` | 5E | Grouped scholar buttons |

### Modified Files (by phase)

**Phase 1:**
| File | Changes |
|------|---------|
| `src/navigation/TabNavigator.tsx` | Add Lucide icons to all 5 tabs |
| `src/navigation/MoreStack.tsx` | Add MoreMenu as initial screen |

**Phase 2:**
| File | Changes |
|------|---------|
| `src/screens/HomeScreen.tsx` | Full rewrite — dashboard layout |
| `src/db/content.ts` | Add getContentStats() query |
| `src/navigation/HomeStack.tsx` | Add Chapter + ChapterList screens |

**Phase 3:**
| File | Changes |
|------|---------|
| `src/components/ChapterNavBar.tsx` | Book name back, translation dropdown, ch prev/next, no chevrons |
| `src/components/TranslationDropdown.tsx` | New — compact dropdown for translations in nav bar |
| `src/components/BottomBar.tsx` | DELETE — all controls moved to nav bar |
| `src/screens/ChapterScreen.tsx` | Remove BottomBar import and usage |
| `src/components/PanelButton.tsx` | Remove ▾ chevron from all button labels |
| `src/components/QnavOverlay.tsx` | Remove ▸/▾ indicators, polish, auto-expand current book |
| `src/stores/settingsStore.ts` | Widen translation type from union to string |
| `src/components/ScholarlyBlock.tsx` | Rename label to "CHAPTER ANALYSIS" |
| `src/components/ChapterHeader.tsx` | Add icons to badges |

**Phase 4:**
| File | Changes |
|------|---------|
| `src/screens/SearchScreen.tsx` | Display names, empty state, load more |
| `src/screens/BookListScreen.tsx` | View selector (canonical + thematic), remove LIVE badges |
| `src/components/ViewModeDropdown.tsx` | New — compact dropdown for view mode |
| `src/stores/settingsStore.ts` | Add bookListMode preference |
| `src/screens/ChapterListScreen.tsx` | Read progress dots, back button |
| `src/screens/ExploreMenuScreen.tsx` | Lucide icons, live counts, colors |
| `src/screens/SettingsScreen.tsx` | Dynamic stats, fix dead button, version |
| `src/db/content.ts` | Join book name in searchVerses |

**Phase 5:**
| File | Changes |
|------|---------|
| `src/theme/colors.ts` | New tokens (verseNum, navText), bgElevated bump |
| `src/components/VerseBlock.tsx` | Use verseNum color |
| `src/components/ChapterNavBar.tsx` | Use navText color |
| Multiple panel/screen files | StyleSheet extraction |
| 5 Explore screen files | Add LoadingSkeleton |

---

## Dependency Order

```
Phase 1A (tab icons)     — independent, can ship alone
Phase 1B (more menu)     — independent, can ship alone
Phase 2  (home screen)   — depends on Phase 1 being done (so home tab 
                           icon exists), but technically independent
Phase 3  (chapter polish) — independent; modifies settingsStore.ts 
                           (widens translation type)
Phase 4A (search fixes)  — independent
Phase 4B (book list)     — modifies settingsStore.ts (adds bookListMode);
                           depends on Phase 2 completing the HomeScreen 
                           rewrite (canonical view moves here).
                           If doing Phase 3 + 4B in same session, 
                           combine settingsStore changes.
Phase 4C-F               — each sub-task is independent
Phase 5A (gold reduction) — should come AFTER Phase 2 + 3 so we're not 
                           changing colors while also changing layouts
Phase 5B (contrast)       — independent
Phase 5C (stylesheets)    — do AFTER all layout changes are finalized
Phase 5D (loading states) — independent
Phase 5E (button groups)  — defer, evaluate after user testing
```

---

## Estimated Effort Per Phase

| Phase | Files | Complexity | Est. Time |
|-------|-------|-----------|-----------|
| 1A | 1 | Low | 5 min |
| 1B | 2 | Low | 15 min |
| 2 | 4 | Medium-High | 30 min |
| 3 | 9 | High | 35 min |
| 4 | 8 | Medium-High | 35 min |
| 5A-B | 3+ | Low-Medium | 15 min |
| 5C | 10+ | Low (repetitive) | Ongoing |
| 5D | 5 | Low | 10 min |

**Phases 1-4 total: ~2.5 hours of Claude session time.**

---

## Testing Checklist (Per Phase)

After each phase, verify on Expo Go:

- [ ] App launches without red screen errors
- [ ] All 5 tabs render and navigate correctly
- [ ] Chapter screen loads content with all panels functional
- [ ] Search returns results with correct display names
- [ ] Explore features (People, Timeline, Map) load without blank screens
- [ ] Settings changes persist across app restart
- [ ] Navigation back buttons work on every screen
- [ ] No "Text strings must be rendered within a <Text> component" errors
- [ ] Tab bar icons render at correct size and color
- [ ] Home screen shows dynamic data (not hardcoded counts)

---

## Notes for Future Sessions

- Always `git pull origin master` before starting work
- Always `npx expo install --fix` after any dependency changes  
- Test on Expo Go after each phase — don't batch multiple phases before testing
- The `!!value &&` pattern must be used for any SQLite boolean field rendered 
  in JSX (is_live, has_note, etc.) — SQLite returns 0/1, not false/true
- `lucide-react-native` is already installed — no `npm install` needed for icons
- The app uses `@react-navigation/stack` (not native-stack) — animations are 
  JS-based, which is fine for this content-heavy app but means transitions 
  won't be as buttery as native-stack
- Color changes in Phase 5A should be tested on multiple phone screens — OLED 
  dark theme contrast varies significantly between devices

### Dropdown Component Architecture

Phases 3A and 4B both introduce dropdown selectors (TranslationDropdown and 
ViewModeDropdown). They share the same UX pattern:
- Closed: compact pill showing active option label only (NO chevron)
- Open: overlay with options, active item gets checkmark, tap-outside dismisses

**Global rule: NO CHEVRONS.** No `▾`, `▸`, `ChevronDown`, `ChevronRight`, 
or any directional indicator on any interactive element. The pill shape and 
styling are sufficient affordance. This applies to:
- Panel buttons (PanelButton.tsx)
- Dropdown triggers (CompactDropdown.tsx)
- Book expand/collapse in QnavOverlay
- Navigation arrows use `ArrowLeft`/`ArrowRight`, NOT `ChevronLeft`/`ChevronRight`

**Build a generic `CompactDropdown` component** that both use:
```tsx
interface CompactDropdownProps {
  value: string;
  options: { key: string; label: string }[];
  onSelect: (key: string) => void;
  direction?: 'down' | 'up';  // down for nav bar, up if ever used at bottom
}
```

TranslationDropdown and ViewModeDropdown become thin wrappers:
```tsx
// TranslationDropdown.tsx
export const TranslationDropdown = ({ active, onSelect }) => (
  <CompactDropdown
    value={active}
    options={[{ key: 'niv', label: 'NIV' }, { key: 'esv', label: 'ESV' }]}
    onSelect={onSelect}
    direction="down"
  />
);
```

Build CompactDropdown in Phase 3A (first use), reuse in Phase 4B.

