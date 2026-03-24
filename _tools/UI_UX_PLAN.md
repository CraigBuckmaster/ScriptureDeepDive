# UI/UX Implementation Plan

**Reference:** `app/UI_UX_AUDIT.md`  
**Last updated:** 2026-03-24  
**Status:** Planning complete, no work started  

---

## Overview

This plan addresses all issues identified in the UI/UX audit, organized into 
5 phases. Each phase is self-contained and shippable — you can stop after any 
phase and have a working, improved app.

**Phase 1** — Tab bar icons + More menu (2 files new, 2 files modified)  
**Phase 2** — Home screen redesign (1 file rewritten, 2 files new)  
**Phase 3** — Chapter screen polish (6 files modified, 1 new component)  
**Phase 4** — Secondary screen fixes (8 files modified, 1 new component)  
**Phase 5** — Design system hardening (10+ files, ongoing)  

---

## Phase 1: Tab Bar Icons + More Menu

**Why first:** These are the two most visible "this looks unfinished" problems. 
Tab icons are on screen 100% of the time. The More menu blocks feature 
discovery. Both are small, surgical changes.

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
  - Right: Chevron (ChevronRight icon, base.textMuted)
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

## Phase 2: Home Screen Redesign

**Why second:** The home screen is the first impression. Phase 1 gave us 
proper navigation chrome; now we fix the content.

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

**New layout (top to bottom):**

1. **Hero** (keep, modify)
   - "Scripture Deep Dive" in Cinzel gold, centered
   - Dynamic subtitle: "{liveChapters} chapters · {scholarCount} scholars"
   - Pulled from useHomeData().stats

2. **Continue Reading Card** (new, prominent)
   - Full-width card with bgElevated background, border
   - Book name + chapter number + chapter title
   - "Continue →" touchable
   - Only shows if recentChapters.length > 0
   - If no history: show a "Start Reading →" card that links to Genesis 1
   - This replaces the tiny horizontal BadgeChip scroll

3. **Reading Stats Row** (new)
   - Three stat boxes in a horizontal row (like ReadingHistoryScreen)
   - Chapters read | Current streak | Books explored
   - Only shows if totalChapters > 0
   - Gold numbers, muted labels, Cinzel font

4. **Explore Quick Links** (new)
   - Horizontal scroll of 4 cards: People, Timeline, Maps, Scholars
   - Each card: icon + title + count (e.g., "233 figures")
   - Taps navigate to ExploreTab screens
   - Uses Lucide icons, not emojis

5. **Recently Read** (simplified)
   - If 2+ recent chapters, show a "Recently Read" section
   - Simple vertical list of last 3 chapters with book name + title
   - Each row tappable → navigates to chapter
   - Much simpler than the current full book list

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

## Phase 3: Chapter Screen Polish

**Why third:** With the home screen fixed, users will navigate to chapters 
quickly. Now we polish the 90%-of-time screen.

### 3A. Chapter Nav Bar — Book Name + Navigator Dropdown

**Files:**
- `src/components/ChapterNavBar.tsx` — major update
- `src/components/QnavOverlay.tsx` — kept but refined

**Current state:** The nav bar shows `← Library | Ezekiel 43 | ← →`. 
Tapping the center title opens a full-screen QnavOverlay modal.

**New behavior:**
- **Back button:** Replace `← Library` with `‹ Ezekiel` (back to chapter 
  list for current book, showing the book name for context). Use Lucide 
  `ChevronLeft` icon instead of text arrow.
- **Center title:** Keep `Ezekiel 43` but add a `ChevronDown` icon to 
  signal it's tappable: `Ezekiel 43 ▾`. Tapping opens the QnavOverlay 
  (already works — just needs the visual chevron affordance).
- **Prev/Next arrows:** Replace `←` / `→` text with Lucide `ChevronLeft` / 
  `ChevronRight` icons.

**Props change:**
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
}
```
No new props needed — `bookName` already exists.

**Layout:**
```
┌──────────────────────────────────────┐
│ ‹ Ezekiel    Ezekiel 43 ▾    ‹   › │
│  (back)       (opens qnav)   (±ch) │
└──────────────────────────────────────┘
```

**QnavOverlay refinement (optional, same session):**

The existing QnavOverlay is already functional — full-screen modal with 
search, OT/NT toggle, expandable book → chapter grid. It stays as-is 
structurally. Optional polish:
- Auto-expand the current book on open so the user sees their position
- Highlight the current chapter number in the grid (gold bg instead of 
  bgElevated)
- Replace the `✕` close button with Lucide `X` icon

**File:** `src/components/ChapterNavBar.tsx`

```tsx
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';

// Back button:
<TouchableOpacity onPress={onBack} ...>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <ChevronLeft size={18} color={base.gold} />
    <Text style={{ color: base.gold, fontSize: 14 }}>{bookName}</Text>
  </View>
</TouchableOpacity>

// Center title:
<TouchableOpacity onPress={onQnav} ...>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 14 }}>
      {bookName} {chapterNum}
    </Text>
    <ChevronDown size={14} color={base.textMuted} />
  </View>
</TouchableOpacity>

// Prev/Next:
<ChevronLeft size={20} color={hasPrev ? base.gold : base.textMuted + '40'} />
<ChevronRight size={20} color={hasNext ? base.gold : base.textMuted + '40'} />
```

### 3B. Bottom Bar — Translation Dropdown + Controls

**Files:**
- `src/components/BottomBar.tsx` — major update
- `src/components/TranslationDropdown.tsx` — new component
- `src/stores/settingsStore.ts` — widen translation type

**Current state:** Bottom bar has `← Prev | [NIV | ESV] | Next →`. The 
NIV/ESV toggle shows both options permanently as a pill-shaped segmented 
control.

**Problem:** A segmented control works for 2 options but won't scale. When 
we add KJV, NASB, or NLT, the bar runs out of space. The same dropdown 
pattern used for the view mode selector (Phase 4B) is the right approach.

**New component: `src/components/TranslationDropdown.tsx`**

Same pattern as ViewModeDropdown — compact pill showing only the active 
translation, expands on tap to show all options.

```tsx
interface TranslationDropdownProps {
  active: string;          // 'niv', 'esv', etc.
  options: string[];       // ['niv', 'esv'] — extensible
  onSelect: (t: string) => void;
}
```

Design:
- **Closed state:** Compact pill (bgElevated, border, radii.pill)
  - Label: active translation uppercased ("NIV"), SourceSans3_600SemiBold
  - Right: `ChevronDown` icon, 12px
  - Width: auto, height: 30px
- **Open state:** Dropdown expands UPWARD (since it's in the bottom bar)
  - Absolute positioned above the pill
  - Each option: MIN_TOUCH_TARGET height, uppercase label
  - Active option: gold text + `Check` icon
  - Inactive: base.text, no icon
  - Tap outside → closes
  - Up to 6 options visible without scroll; beyond 6, add scroll

**Labels map** (extensible):
```tsx
const TRANSLATION_LABELS: Record<string, string> = {
  niv: 'NIV',
  esv: 'ESV',
  kjv: 'KJV',       // future
  nasb: 'NASB',     // future
  nlt: 'NLT',       // future
  nrsv: 'NRSV',     // future
};
```

**Store update — `src/stores/settingsStore.ts`:**

Widen the translation type to support future additions:
```tsx
// Before:
translation: 'niv' | 'esv';
setTranslation: (t: 'niv' | 'esv') => void;

// After:
translation: string;
setTranslation: (t: string) => void;
```

The hydrate function's fallback remains 'niv' as default. Validation moves 
to the dropdown component (only shows options that exist in the DB).

**Updated BottomBar layout:**

```
┌──────────────────────────────────────────┐
│ ← Prev    [A-] [A+]  [NIV ▾]  Next →    │
│                        ↑ dropdown        │
└──────────────────────────────────────────┘
```

- Keep Prev/Next (users need bottom-of-screen navigation after scrolling)
- Replace segmented toggle with TranslationDropdown
- Add font size A-/A+ buttons (compact, 28x28, bgElevated circles)
- Bookmark button deferred — better suited to a verse long-press action 
  than a persistent bar button (you'd need to decide WHICH verse to bookmark)

**Props update for BottomBar:**
```tsx
interface Props {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  // Translation and font size now read from stores directly — no new props
}
```

### 3C. Scholarly Block Label

**File:** `src/components/ScholarlyBlock.tsx`

Change:
```tsx
// Before:
"SCHOLARLY BLOCK"
// After:
"CHAPTER ANALYSIS"
```

One-line change.

### 3C. Chapter Header Badge Cleanup

**File:** `src/components/ChapterHeader.tsx`

Changes:
- Add Lucide icons to deep-link badges:
  - Timeline badge: prepend `Clock` icon (size 12)
  - Map badge: prepend `MapPin` icon (size 12)
- Consider changing "About This Book →" from a badge to a plain text link 
  to reduce visual noise in the action bar
- "Notes" badge: add `StickyNote` icon

---

## Phase 4: Secondary Screen Fixes

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
│  By Tradition  ▾    │   ← Compact pill, shows active mode only
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
  - Left: mode label in SourceSans3_500Medium, 13pt, base.text
  - Right: `ChevronDown` Lucide icon, 14px, base.textMuted
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
│  Library          [Canonical Order ▾]│  ← title + dropdown, same line
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

**Badge fix (included in this task):**

When most books are live, the LIVE badge is noise. Invert:
```tsx
// Before:
{!!book.is_live && <BadgeChip label="LIVE" color={base.gold} />}

// After:
{!book.is_live && <BadgeChip label="Coming Soon" color={base.textMuted} />}
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      {!book.is_live && <BadgeChip label="Coming Soon" color={base.textMuted} />}
      <Text style={{ color: base.textMuted, fontSize: 11 }}>
        {book.total_chapters} ch
      </Text>
    </View>
  </TouchableOpacity>
);
```

Used by both the SectionList renderItem (thematic) and FlatList renderItem 
(canonical).

### 4C. Chapter List — Read Progress Indicators

**File:** `src/screens/ChapterListScreen.tsx`

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
  <ChevronLeft size={20} color={base.gold} />
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
`[Hebrew] [Context] [Cross-Ref] [Scholars ▾]`

Tapping "Scholars ▾" expands to show individual scholar buttons. This 
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
| `src/components/ChapterNavBar.tsx` | Book name back button, Lucide icons, tappable title chevron |
| `src/components/BottomBar.tsx` | TranslationDropdown replaces toggle, add font size controls |
| `src/components/TranslationDropdown.tsx` | New — compact upward-expanding dropdown for translations |
| `src/components/QnavOverlay.tsx` | Optional polish: auto-expand current book, highlight current ch |
| `src/stores/settingsStore.ts` | Widen translation type from union to string |
| `src/components/ScholarlyBlock.tsx` | Rename label to "CHAPTER ANALYSIS" |
| `src/components/ChapterHeader.tsx` | Add icons to badges |

**Phase 4:**
| File | Changes |
|------|---------|
| `src/screens/SearchScreen.tsx` | Display names, empty state, load more |
| `src/screens/BookListScreen.tsx` | View selector (canonical + thematic), badge inversion |
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
| 3 | 7 | Medium-High | 30 min |
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

Phases 3B and 4B both introduce dropdown selectors (TranslationDropdown and 
ViewModeDropdown). They share the same UX pattern:
- Closed: compact pill showing active option + chevron
- Open: overlay with options, active item gets checkmark, tap-outside dismisses

**Option A (recommended): Build a generic `CompactDropdown` component** that 
both use:
```tsx
interface CompactDropdownProps {
  value: string;
  options: { key: string; label: string }[];
  onSelect: (key: string) => void;
  direction?: 'down' | 'up';  // up for bottom bar, down for headers
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
    direction="up"
  />
);
```

This avoids duplicating the overlay logic, dismiss handling, and animation 
code across two components. Build CompactDropdown in Phase 3B (first use), 
reuse in Phase 4B.

**Option B: Two separate components.** Simpler upfront, but the dismiss 
overlay and positioning logic will be copy-pasted. Acceptable if time is 
tight, but refactor into a shared component later.

