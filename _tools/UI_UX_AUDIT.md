# Scripture Deep Dive — UI/UX Audit Report (Post Phase 1–5)

**Last updated:** 2026-03-24
**Scope:** Full scan of all 130+ source files in `app/src/`
**Previous audit:** All P0–P2 issues from the original audit are resolved.

---

## Executive Summary

Phases 1–5 of the UI/UX plan are complete. The app has gone from "developer
prototype" to "polished product" across navigation, home screen, chapter
reading, secondary screens, and design system. The remaining issues are
P1–P3 quality items — nothing is broken, but there's cleanup debt and a
batch of orphaned components from features that were wired but never rendered.

**Resolved since last audit:**
- ✅ Tab bar icons (Lucide, all 5 tabs)
- ✅ More menu as proper landing page
- ✅ HomeScreen redesigned (greeting, VOTD, continue reading, stats, explore)
- ✅ ChapterNavBar rewritten (Lucide icons, translation dropdown, book name)
- ✅ BottomBar removed (all controls in nav bar)
- ✅ QnavOverlay wired up (was orphaned), auto-expand + current highlight
- ✅ Zero chevrons in codebase
- ✅ "SCHOLARLY BLOCK" → "CHAPTER ANALYSIS"
- ✅ Chapter header badges with Lucide icons
- ✅ Search: display names, empty state, load more
- ✅ BookList: view selector (canonical/thematic), no LIVE badges
- ✅ ChapterList: back button, read progress, no "· Live"
- ✅ Explore: Lucide icons, live counts, accent colors
- ✅ Settings: dynamic stats, working clear history, version from app.json
- ✅ Gold reduction (verseNum, navText tokens)
- ✅ bgElevated contrast bump
- ✅ StyleSheet extraction (ChapterScreen, VerseBlock, SectionBlock, SectionHeader)
- ✅ Loading skeletons for 5 explore screens

---

## Open Issues

### 1. ORPHANED COMPONENTS — P1

14 components exist in `src/components/` but are never imported by any
screen or other component. They compile, they ship in the bundle, and they
add dead weight.

| Component | Purpose | Status |
|-----------|---------|--------|
| AuthorshipSheet | Book authorship overlay | Never imported |
| BookmarkButton | Star icon per verse | Never imported |
| CollapsibleSection | Animated expand/collapse | Never imported (was used pre-Phase 3) |
| CrossRefPopup | Cross-reference detail popup | Never imported |
| DailyReadingCard | Reading plan day card | Never imported |
| ErrorBoundary | React error boundary wrapper | Never imported |
| HighlightColorPicker | Verse highlight color selector | Never imported |
| NotesOverlay | Per-verse notes modal | Wired in readerStore but never rendered |
| NotificationSettings | Daily verse notification toggle | Never imported |
| ScholarInfoSheet | Scholar detail bottom sheet | Never imported |
| TTSControls | Text-to-speech playback UI | Never imported |
| ThreadViewerSheet | Cross-ref thread viewer | Never imported |
| VerseShareCard | Verse image share card | Never imported |
| WordStudyPopup | Word study detail popup | Never imported |

**Action:** These are likely future features waiting for integration, not
dead code. Do NOT delete — but do not ship them in the binary. Consider
moving them to a `src/components/_staged/` directory to signal they're
not yet active. The ErrorBoundary should be wired up immediately (see #2).

**Special case — NotesOverlay:** The readerStore has `notesOverlayOpen`
and `toggleNotesOverlay`. ChapterScreen imports `toggleNotes` and calls it
from the Notes badge and verse note press. But the `<NotesOverlay />`
component is never rendered in ChapterScreen's JSX. This means tapping
"Notes" toggles a boolean that nothing reads. Wire it up or remove the
toggle from the store.

---

### 2. ERROR BOUNDARY NOT WIRED — P1

`ErrorBoundary.tsx` exists with a proper `componentDidCatch` implementation
and a user-friendly error UI with a "Reload" button. But it's never wrapped
around any screen or the root navigator. A crash in any component will show
a red screen (dev) or a white screen of death (production).

**Fix:** Wrap `<RootNavigator />` in `App.tsx`:
```tsx
<ErrorBoundary>
  <RootNavigator />
</ErrorBoundary>
```

---

### 3. MISSING BACK NAVIGATION — P1

6 screens reachable from the More tab and Explore tab have no visible back
button. Users must rely on iOS swipe-back or Android hardware back, which
is not discoverable.

| Screen | Reached From | Has Back Button |
|--------|-------------|-----------------|
| BookmarkListScreen | MoreMenu | ❌ No |
| ReadingHistoryScreen | MoreMenu | ❌ No |
| PlanListScreen | MoreMenu | ❌ No |
| PlanDetailScreen | PlanList | ❌ No |
| ScholarBioScreen | ScholarBrowse | ❌ No |
| WordStudyDetailScreen | WordStudyBrowse | ❌ No |

**Fix:** Add `<ArrowLeft>` back button to the header of each screen,
matching the pattern used in ChapterListScreen and SettingsScreen.

---

### 4. UNICODE BACK ARROWS — P2

3 screens use text `← Back` instead of Lucide `ArrowLeft` icon. This is
inconsistent with the Phase 3 design language.

| Screen | Current | Should Be |
|--------|---------|-----------|
| BookIntroScreen | `← Back` text | `<ArrowLeft>` + "Back" |
| ParallelPassageScreen | `← Back` text | `<ArrowLeft>` + "Back" |
| PersonDetailScreen | `← Back` text | `<ArrowLeft>` + "Back" |

---

### 5. FONT FAMILY STRING LITERALS — P2

~200 instances across screens and components use raw string literals like
`fontFamily: 'Cinzel_400Regular'` instead of the `fontFamily` tokens
defined in `src/theme/typography.ts`.

This makes global font changes impossible without find-and-replace across
every file. The typography system is well-designed; it's just underutilized.

**Screens:** 78 string literal usages
**Components:** 122 string literal usages

**Fix:** Incremental migration. Each time a file is touched for any reason,
replace string literals with `fontFamily.display`, `fontFamily.body`,
`fontFamily.uiMedium`, etc.

---

### 6. STYLESHEET EXTRACTION — P2

14 screens still use only inline `style={{...}}` objects with no
`StyleSheet.create()` block. Inline styles are recreated every render.

**Already extracted (4):** ChapterScreen, HomeScreen, MoreMenuScreen,
BookListScreen, ChapterListScreen, SearchScreen, SettingsScreen,
ExploreMenuScreen, VerseBlock, SectionBlock, SectionHeader,
CompactDropdown, ChapterNavBar, QnavOverlay

**Not yet extracted (14 screens):**
BookIntroScreen, BookmarkListScreen, GenealogyTreeScreen, MapScreen,
ParallelPassageScreen, PersonDetailScreen, PlanDetailScreen,
PlanListScreen, ReadingHistoryScreen, ScholarBioScreen,
ScholarBrowseScreen, TimelineScreen, WordStudyBrowseScreen,
WordStudyDetailScreen

**Fix:** Same incremental approach as #5. Extract when touching files.

---

### 7. DETAIL SCREEN LOADING STATES — P2

3 detail screens show a blank dark screen while loading data, instead of
the LoadingSkeleton shimmer animation used elsewhere:

| Screen | Current Loading UI | Should Be |
|--------|-------------------|-----------|
| PlanDetailScreen | Blank `<View />` | LoadingSkeleton |
| ScholarBioScreen | Blank `<View />` | LoadingSkeleton |
| WordStudyDetailScreen | Blank `<View />` | LoadingSkeleton |

BookIntroScreen and PersonDetailScreen also show blank views but at least
have `isLoading` checks.

---

### 8. ACCESSIBILITY — P3

**What's good:**
- MIN_TOUCH_TARGET (44pt) enforced on all interactive elements
- accessibilityRole and accessibilityLabel on key components (PanelButton,
  ChapterNavBar, QnavOverlay, CompactDropdown, CollapsibleSection)
- SectionHeader has `accessibilityRole="header"`

**What's missing:**
- Zero accessibilityLabel/accessibilityRole on any screen-level elements
- No accessibilityHint on complex interactive elements (long-press book
  name for Qnav, swipe gestures on tree/map)
- No dynamic type integration — font scaling is manual via Settings slider,
  not linked to system accessibility font size
- Screen reader navigation order not explicitly defined for complex screens
  (ChapterScreen with multiple panels)

---

### 9. MINOR POLISH — P3

- **"About This Book →" text link** in ChapterHeader uses raw arrow `→`.
  Could use Lucide `ArrowRight` for consistency with the rest of the app.
- **ParallelPassageScreen** has no loading skeleton for initial data load.
- **PlanListScreen** "Active" text badge on active plan could be a BadgeChip
  for visual consistency.
- **ReadingHistoryScreen** navigates to `ReadTab` stack — if accessed from
  HomeStack, this switches tabs instead of pushing within current stack.
- **BookmarkListScreen** verse_ref regex parsing (`/^(\w+)\s+(\d+):(\d+)$/`)
  doesn't handle book IDs with underscores (e.g., `1_samuel 1:1`). The
  `\w+` only matches word characters which includes underscores, so it
  works, but it's fragile.

---

## Priority Summary (Post Phase 1–5)

| Priority | Issue | Impact |
|----------|-------|--------|
| P1 | NotesOverlay wired but never rendered (#1) | Feature appears broken |
| P1 | ErrorBoundary not wrapping root (#2) | Prod crash = white screen |
| P1 | 6 screens missing back buttons (#3) | Navigation dead-ends |
| P2 | 3 screens with unicode back arrows (#4) | Visual inconsistency |
| P2 | 200 font family string literals (#5) | Maintenance debt |
| P2 | 14 screens without StyleSheet (#6) | Performance debt |
| P2 | 3 detail screens blank while loading (#7) | Flash of empty |
| P3 | Accessibility gaps (#8) | Inclusion |
| P3 | Minor polish items (#9) | Quality of life |

---

## Metrics

- **Total components:** 35 active + 14 orphaned = 49
- **Total screens:** 21
- **Total hooks:** 20
- **Files with StyleSheet:** 14 / 35 components, 8 / 21 screens
- **Files using fontFamily tokens:** ~30% (remainder use string literals)
- **Loading skeletons:** 8 screens covered, 3 screens still blank
- **Back buttons:** 15 screens have them, 6 do not
