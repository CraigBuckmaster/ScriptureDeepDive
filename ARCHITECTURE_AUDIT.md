# ScriptureDeepDive — Full System Architecture Audit

**Date:** 2026-04-03
**Auditor:** Sr. Architect Review (Claude Code)
**Scope:** Every file in the repository — screens, components, hooks, stores, services, DB layer, utils, types, theme, navigation, CI/CD, tests, config, and store metadata.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Findings (Fix Now)](#2-critical-findings)
3. [Performance Audit](#3-performance-audit)
4. [Dead Code & Unused Exports](#4-dead-code--unused-exports)
5. [Security Audit](#5-security-audit)
6. [Database Layer Audit](#6-database-layer-audit)
7. [Architecture & Code Structure](#7-architecture--code-structure)
8. [CI/CD & Testing](#8-cicd--testing)
9. [Build & Bundle Optimization](#9-build--bundle-optimization)
10. [Store Metadata & Release Readiness](#10-store-metadata--release-readiness)
11. [Prioritized Recommendations](#11-prioritized-recommendations)

---

## 1. Executive Summary

### Codebase Profile

| Metric | Value |
|--------|-------|
| Total source files | ~200+ (TS/TSX/JS) |
| Screens | 46 |
| Components | 111 |
| Custom hooks | 43 |
| Stores (Zustand) | 5 |
| Services | 4 |
| DB query modules | 12 |
| Utility modules | 14 |
| Test files | 247 (~18,900 LOC) |
| CI workflows | 2 |

### Overall Scores

| Category | Score | Notes |
|----------|-------|-------|
| Architecture & Structure | **8/10** | Clean layering, good separation of concerns |
| Performance | **5/10** | Systematic memoization gaps across all layers |
| Security | **7/10** | Mostly safe; SQL LIKE injection + credential handling need fixes |
| Code Quality | **7/10** | Solid foundation, moderate duplication |
| Test Coverage | **7/10** | 247 tests, but thresholds are low (40%) |
| CI/CD | **6/10** | No lint step, no bundle size tracking |
| Dead Code | **6/10** | Barrel exports incomplete; unused theme values |
| Release Readiness | **7/10** | Store metadata thorough; placeholder credentials remain |

### Top 5 Architectural Concerns

1. **Zero screen-level error boundaries** — one component crash takes down an entire screen
2. **Race conditions in 8+ hooks** — async state updates without cancellation tokens
3. **Massive code duplication across 9 Browse screens** — ~1,200 LOC of copy-paste
4. **Only 11 of 111 components use React.memo** — systematic re-render waste
5. **46+ `as any` casts in navigation** — type-unsafe cross-stack routing

---

## 2. Critical Findings

### 2.1 Race Conditions in Data Hooks (8+ hooks affected)

**Severity: CRITICAL**

Multiple hooks fetch async data and call `setState` without checking if the component is still mounted or if the input has changed.

| Hook | File | Issue |
|------|------|-------|
| `useHighlightsForChapter` | `hooks/useHighlights.ts` | `reload()` callback missing `bookId, ch` in dependency array. Rapid chapter swiping causes data from chapter N to overwrite chapter N+1. |
| `useBookmarkedVerses` | `hooks/useBookmarkedVerses.ts` | `toggleBookmark` uses stale `bookmarked`/`bookmarkIds` from closure. Rapid toggling causes data corruption. |
| `useConceptData` | `hooks/useConceptData.ts` | `loadData` is memoized with `[conceptId]` but async iteration over panels references outer-scope `conceptData`. If `conceptId` changes mid-iteration, stale data is set. |
| `useStudyDepth` | `hooks/useStudyDepth.ts` | `buildMap` captured in useCallback with `[sectionPanels]` — stale closure when `recordOpen` calls it. |
| `useDebateTopics` | `hooks/useDebateTopics.ts` | Debounce timer fires setState on unmounted component if unmount occurs during debounce window. |

**Fix:** Add `AbortController` or mounted-ref guard to all async hooks. Create a generic `useAsyncData(fetchFn, deps)` hook that handles cancellation, loading, and error states uniformly.

### 2.2 No Screen-Level Error Boundaries (46 screens)

**Severity: CRITICAL**

Only a global `ErrorBoundary` exists in `App.tsx`. No screen wraps its content in an error boundary. A single crash in any deeply nested component (e.g., a malformed JSON panel) takes down the entire screen with no recovery.

**Fix:** Create a `withErrorBoundary(Screen, { fallback })` HOC and wrap all 46 screen exports.

### 2.3 SQL LIKE Injection on JSON Columns

**Severity: CRITICAL**

| File | Line(s) | Issue |
|------|---------|-------|
| `db/content/features.ts` | 39-41 | `WHERE links_json LIKE ?` with unescaped `bookDir` and `chapterNum` interpolated into pattern |
| `db/content/debates.ts` | 50 | `WHERE chapters_json LIKE ?` with unescaped `chapterNum` |
| `db/user.ts` | 541 | `WHERE tags_json LIKE ?` with unescaped `tag` (quotes not escaped) |
| `db/user.ts` | 80 | `WHERE note_text LIKE ?` — LIKE metacharacters `%` and `_` not escaped |

While all queries use parameterized `?` (preventing classic SQL injection), LIKE wildcards and JSON special characters are not escaped, enabling unexpected pattern matches.

**Fix:** Escape LIKE wildcards (`%`, `_`) in all LIKE patterns and add `ESCAPE '\'` clause. For JSON columns, prefer `json_extract()` over LIKE where SQLite version supports it.

### 2.4 Panel Color Key Mismatch

**Severity: HIGH**

In `theme/colors.ts` line 56, the Hebrew text panel color is keyed as `hebText` (camelCase), but in `utils/panelLabels.ts` line 24 and throughout the codebase, it is referenced as `hebtext` (lowercase). This causes the Hebrew panel to silently fall back to the default `com` colors.

**Fix:** Rename the key in `colors.ts` from `hebText` to `hebtext`.

### 2.5 Supabase Credentials Pattern

**Severity: HIGH**

`lib/supabase.ts` has placeholder credentials in source code:
```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

While gated by `CONFIGURED = false`, if this flag is ever set to `true` without switching to env vars, credentials leak into the bundle.

**Fix:** Replace with `process.env.SUPABASE_URL` / `process.env.SUPABASE_ANON_KEY` and throw if missing when `CONFIGURED` is true.

---

## 3. Performance Audit

### 3.1 Memoization Gaps — Components

Only **11 of 111 components** use `React.memo`. The 11 that do: `DifficultyBadge`, `TreeNode`, `TreeCanvas`, `TreeLink`, `MarriageBarSvg`, `SpouseConnectorSvg`, `ChapterFingerprint`, `StoryOverlays`, `PlaceLabel`, `PlaceMarkerList`, `VerseBlock`.

**Components that should be memoized but are not:**

| Component | Why |
|-----------|-----|
| `BadgeChip` | Pure presentation, rendered in many lists |
| `GenreBanner` | Header, pure |
| `StreakBadge` | Simple badge |
| `GospelPassageCard` | Card in scrollable lists |
| `ComparisonVerse` | Rendered in long verse-comparison lists |
| `SectionHeader` | Frequently re-rendered in section lists |
| `TagChips` | Pure presentation |
| `ScholarTag` | Pure presentation |
| `DepthDots` | Pure presentation |
| All panel components (20+) | Panels are expensive to render |

### 3.2 Memoization Gaps — Screens

Only **1 of 46 screens** uses `React.memo` internally (`BookListScreen` with `BookRow`). The other 45 have zero memoized sub-components.

**Worst offenders by inline function count:**

| Screen | Inline `onPress` handlers per render | Impact |
|--------|--------------------------------------|--------|
| `HomeScreen` | 9+ | Each render creates 9 new function objects |
| `AllNotesScreen` | 6+ (plus 3 inline tab render functions of 100+ lines each) | Tab switching re-renders everything |
| `SearchScreen` | 5+ cross-tab navigations | New refs break child memo |
| `ChapterScreen` | 715 lines, 50+ state vars, no extracted sub-components | Most performance-critical screen |

### 3.3 Tab Re-Render Problem

Three screens use conditional rendering for tabs:
```tsx
{activeTab === 'collections' && renderCollectionsTab()}
{activeTab === 'tags' && renderTagsTab()}
```

Each `renderXXXTab()` is 100+ lines of inline logic. Every tab switch re-renders ALL tab functions. Affected screens: `AllNotesScreen`, `ConceptDetailScreen`, `SearchScreen`.

**Fix:** Extract each tab as a separate memoized component.

### 3.4 Prop Drilling — PanelContainer Chain

`PanelContainer` accepts 6 callback props (`onRefPress`, `onWordStudyPress`, `onScholarPress`, `onPersonPress`, `onPlacePress`, `onEventPress`) and passes them through `PanelRenderer` to 20+ individual panel components. Most panels use only 1-2 of these callbacks.

**Fix:** Create a `PanelCallbacksContext` to eliminate this 3-level prop chain.

### 3.5 Duplicate Fetch Pattern (15+ hooks)

These hooks all follow the identical pattern: `useState(initial) + useEffect(() => { fetch().then(setState) }, [deps])`:

`useBooks`, `usePeople`, `usePlaces`, `useScholars`, `useWordStudies`, `useProphecyChains`, `useRecentChapters`, `useLexicon`, `useMapStories`, `useAvailableVoices`, `useDictionaryBrowse`, `useHarmonyData`, `useTopicData`, `useContentLibrary`, `useDebateTopics`

**Fix:** Create a generic `useAsyncData<T>(fetchFn, deps)` hook that handles loading, error, data, and cleanup uniformly. Estimated savings: ~300 LOC and consistent error/loading behavior.

### 3.6 Database Query Performance

| Issue | Location | Impact |
|-------|----------|--------|
| **N+1 query in `getRecentChapters()`** | `db/user.ts:101-129` | Loops over rows issuing a separate query per row. Should JOIN in a single query. |
| **O(n) streak calculation** | `db/user.ts:362-384` | Fetches ALL reading days then loops manually. Should use SQL window functions. |
| **Hardcoded NT book list** | `db/user.ts:407-443` | 27 book names hardcoded in a Set for testament classification. Should query from DB. |
| **Missing indexes** | `db/user.ts` | No index on `verse_highlights.verse_ref` or `bookmarks.verse_ref` — both are searched frequently. |

### 3.7 Utility Performance

| Issue | Location | Fix |
|-------|----------|-----|
| Regex recompilation | `utils/refDetector.ts:46` | Large `REF_PATTERN` regex used in `matchAll` — reset `lastIndex` to 0 before each call |
| Timeline ticks recomputation | `utils/timelineLayout.ts:150-160` | `computeTickMarks()` returns same result every call — cache at module level |
| Hardcoded scholar labels | `utils/panelLabels.ts:39-117` | 78 scholar names hardcoded. Should query from `scholars` table at init |

---

## 4. Dead Code & Unused Exports

### 4.1 Hooks Barrel Export (`hooks/index.ts`)

The barrel file exports ~10 hooks, but **30+ hooks are defined and NOT exported from the barrel**. They are imported directly by file path from screens. This is not technically dead code, but indicates the barrel is incomplete and misleading.

**Missing from barrel (sampling):**
`useAvailableVoices`, `useChapterFingerprint`, `useConceptData`, `useContentLibrary`, `useDifficultPassages`, `useDebateTopics`, `useLexicon`, `useOnboardingStatus`, `usePremium`, `useRecommendations`, `useRedLetter`, `useScreenView`, `useSearch`, `useStoreReview`, `useStreakData`, `useStudyDepth`, `useSwipeNavigation`, `useTTS`, `useTranslationSwitch`, `useTreeGestures`, `useTreeLayout`, `useLandscapeUnlock`

**Fix:** Either export all hooks from the barrel (preferred for discoverability) or remove the barrel entirely and always import by path.

### 4.2 Unused Imports in Components

| File | Unused Import |
|------|---------------|
| `ThreadViewerSheet.tsx` | `BadgeChip` imported but never used |
| `ThreadViewerSheet.tsx` | `logger` imported but never used |

### 4.3 Unused Theme Values

| File | Value | Status |
|------|-------|--------|
| `theme/colors.ts` | `severity.minor` (`#4CAF50`) | Not referenced anywhere in codebase — dead code |
| `theme/colors.ts` | `base.borderLight` (`#2a2010`) | Used in palette definition but no component references it |

### 4.4 Duplicate Logic Across Components

**JSON parsing try/catch** — identical pattern in 8+ files:
`ThreadViewerSheet`, `ScholarInfoSheet`, `StoryPanel`, `StoryOverlays`, `PersonSidebar`, `PlaceMarkerList`, plus multiple panel files.

**Fix:** Extract `parseJSON<T>(json: string, fallback: T): T` utility.

**Era color resolution** — `eras[story.era] ?? base.gold` pattern repeated in 15+ files across tree, map, and panel components.

**Fix:** Extract `getEraColor(era: string, defaultColor: string): string` utility.

**OT book detection** — hardcoded 36-item array in `InterlinearSheet.tsx` lines 48-56 to determine text direction.

**Fix:** Move to a shared constant or query book metadata.

### 4.5 Duplicate FTS Sanitization

Identical FTS query sanitization logic exists in both `db/content/search.ts` (lines 14-21) and `db/user.ts` (lines 602-607).

**Fix:** Extract to `utils/sanitizeFts.ts` and import in both.

---

## 5. Security Audit

### 5.1 SQL Parameterization

**Overall: GOOD.** All queries use parameterized `?` placeholders. No string concatenation into SQL. The only risk vector is LIKE pattern injection (covered in section 2.3).

### 5.2 Authentication & OAuth

| Area | Status | Notes |
|------|--------|-------|
| OAuth flow | SECURE | Uses `expo-auth-session` with PKCE via Supabase |
| Token storage | SECURE | Handled by Supabase client (AsyncStorage) |
| Token logging | SAFE | No tokens logged |
| Session refresh | GOOD | Supabase listener in `authStore` handles refresh |

### 5.3 Local Data Storage

User data stored in SQLite (`user.db`) includes: notes, bookmarks, highlights, reading progress, auth profile (email, display name, avatar URL, provider). This is non-sensitive metadata stored locally — acceptable.

**Recommendation:** Add `last_synced_at` column to `auth_profiles` for sync-conflict resolution.

### 5.4 Credential Management

| Item | Status | Risk |
|------|--------|------|
| Supabase URL/Key in source | Placeholder only (`CONFIGURED=false`) | Medium — must use env vars before enabling |
| Google Maps API Key | Loaded from env var with unsafe fallback | High — `app.config.js` falls back to literal string `'GOOGLE_MAPS_API_KEY'` instead of throwing |
| Apple/Google store credentials | Placeholders in `eas.json` | Low — clearly marked |
| Google service account JSON | `.gitignore` protected | Safe |

### 5.5 `any` Type Usage (Type Safety as Security)

| File | Issue |
|------|-------|
| `lib/supabase.ts` | `let _client: any = null` — should type as `SupabaseClient \| null` |
| `utils/haptics.ts` | `let Haptics: any = null` — should type as `typeof import('expo-haptics') \| null` |
| Navigation (46+ locations) | `as any` casts for cross-stack navigation — see section 7.3 |
| `types/index.ts` | `SectionWithPanels.panels: Record<string, object>` — too vague, should be `Record<string, unknown>` |

---

## 6. Database Layer Audit

### 6.1 Architecture (Excellent)

- **Two-database pattern:** Content DB (`scripture.db`, read-only, versioned) + User DB (`user.db`, persistent with migrations). Clean separation.
- **Migration system:** Idempotent migrations wrapped in transactions. Versioned tracking table (`_migrations`). Error handling halts startup.
- **WAL mode:** Enabled for read performance.
- **Singleton connections:** Properly managed.

### 6.2 Query Efficiency Issues

| Issue | File:Lines | Severity |
|-------|-----------|----------|
| N+1 query pattern | `user.ts:101-129` (`getRecentChapters`) | HIGH — issues N separate queries in a loop |
| O(n) streak loop | `user.ts:362-384` (`getReadingStats`) | MEDIUM — fetches all days, loops manually |
| Hardcoded book list | `user.ts:407-443` | LOW — 27 NT books in a Set |
| Large JSON in migration | `userDatabase.ts:206-351` (v6 reading plans) | LOW — hard to maintain |

### 6.3 Missing Indexes

```sql
-- Recommended additions via new migration:
CREATE INDEX IF NOT EXISTS idx_verse_highlights_ref ON verse_highlights(verse_ref);
CREATE INDEX IF NOT EXISTS idx_bookmarks_ref ON bookmarks(verse_ref);
```

### 6.4 Connection Lifecycle

`closeAllTranslationDbs()` is exported from `translationManager.ts` but never called. Should be invoked on app shutdown/background to release file handles.

### 6.5 Translation Manager (Good)

- Deduplicates concurrent downloads (prevents double-fetch)
- Caches open connections
- WAL mode enabled for supplemental DBs
- Minor issue: `openTranslationDb()` doesn't verify SQLite file signature

---

## 7. Architecture & Code Structure

### 7.1 Layer Separation (Excellent)

```
app/src/
├── screens/        (46 files)  — Page-level UI
├── components/     (111 files) — Reusable UI pieces
│   ├── panels/     (20+ files) — Content panel renderers
│   ├── tree/       (7 files)   — Genealogy tree SVG
│   ├── map/        (6 files)   — Map overlays
│   └── notes/      (4 files)   — Notes overlay system
├── hooks/          (43 files)  — Data fetching & UI logic
├── stores/         (5 files)   — Zustand global state
├── services/       (4 files)   — Analytics, purchases, notifications, reengagement
├── db/             (12 files)  — SQLite data access
│   └── content/    (10 files)  — Read-only content queries
├── utils/          (14 files)  — Pure business logic
├── types/          (4 files)   — TypeScript interfaces
├── theme/          (9 files)   — Design tokens & palettes
├── navigation/     (9 files)   — React Navigation stacks
└── lib/            (2 files)   — Supabase + OAuth
```

Clear boundaries, minimal coupling, no circular dependencies detected.

### 7.2 Browse Screen Duplication (Architectural Debt)

9 Browse screens share ~60-70% identical code:

`ConceptBrowseScreen`, `DebateBrowseScreen`, `DictionaryBrowseScreen`, `DifficultPassagesBrowseScreen`, `HarmonyBrowseScreen`, `ProphecyBrowseScreen`, `ScholarBrowseScreen`, `TopicBrowseScreen`, `WordStudyBrowseScreen`

All follow the same pattern: SearchInput → AlphabetBar/CategoryFilter → SectionList/FlatList → identical empty states → identical headers.

**Fix:** Create a `BrowseScreenTemplate<T>` generic component. Estimated savings: 800-1,200 LOC.

### 7.3 Navigation Type Safety

Cross-stack navigation uses `as any` casts in 46+ locations because `RootStackParamList` is not defined for the root navigator.

**Fix:** Add to `navigation/types.ts`:
```typescript
export type RootStackParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  ReadTab: NavigatorScreenParams<ReadStackParamList>;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};
```

### 7.4 Large Files Needing Decomposition

| File | Lines | Recommendation |
|------|-------|----------------|
| `ChapterScreen.tsx` | 715 | Extract `ChapterContent`, `VerseListing`, panel wrapper as memoized sub-components |
| `DifficultPassageDetailScreen.tsx` | 734 | Split into section components |
| `AllNotesScreen.tsx` | 478 | Extract each tab as separate component |
| `TimelineScreen.tsx` | 484 | Extract event cards and controls |
| `treeBuilder.ts` | 477 | Acceptable for algorithm complexity |
| `user.ts` | 659 | Split into `userQueries.ts` + `userMutations.ts` |
| `colors.ts` | 261 | Optionally split by category |

### 7.5 Component Barrel Exports

| Barrel | Status |
|--------|--------|
| `components/tree/index.ts` | Complete and minimal |
| `components/notes/index.ts` | Minimal — exports only public interface |
| `components/panels/index.ts` | Complete — all 20+ panels exported |
| `components/map/index.ts` | Complete |
| `hooks/index.ts` | **Incomplete** — only ~10 of 43 hooks exported |
| `db/content/index.ts` | Complete |
| `utils/index.ts` | Complete |
| `theme/index.ts` | Complete |

### 7.6 Inconsistent Patterns

| Pattern | Inconsistency |
|---------|---------------|
| Loading states | 34/46 screens show loading; 12 show blank/nothing |
| Error handling | Some hooks log + set error state; others silently swallow with `.catch(() => {})` |
| Navigation method | Some screens use `navigate()`, others `push()` — no clear convention |
| JSON parsing | 8+ components each have their own try/catch JSON.parse |
| Accessibility | Only ~10 screens have `accessibilityLabel` on interactive elements |

---

## 8. CI/CD & Testing

### 8.1 CI Workflows

**`test.yml`** — Runs on PR and push to master. Steps: checkout → Node 20 → npm install → `tsc --noEmit` → jest with coverage → post results to PR comment → upload coverage artifact (14-day retention).

**`content-pipeline.yml`** — Runs on changes to `content/` and `_tools/`. Steps: Python 3.12 → validate content JSON → rebuild scripture.db → validate SQLite integrity.

### 8.2 CI Gaps

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| **No ESLint step** | HIGH | Add `npx eslint src/ --max-warnings 0` |
| **No Prettier check** | MEDIUM | Add `npx prettier --check src/` |
| **No bundle size tracking** | MEDIUM | Add Metro bundle analysis + size budget |
| **No lint workflow** | HIGH | Create `.github/workflows/lint.yml` |
| **Content pipeline doesn't report to PR** | LOW | Add failure summaries to PR comments |
| **No jest cache** | LOW | Cache `.jest` directory in CI |

### 8.3 Test Coverage

| Metric | Current Threshold | Industry Standard | Gap |
|--------|-------------------|-------------------|-----|
| Statements | 40% | 70-80% | -30% |
| Branches | 33% | 60-70% | -30% |
| Functions | 38% | 70-80% | -32% |
| Lines | 40% | 70-80% | -30% |

The `utils/` directory has **lower** thresholds (35%) than global — this appears to be a mistake as utilities should have the highest coverage.

### 8.4 Test Quality

**Strengths:**
- 247 test files covering components, hooks, screens, units, stores, services
- Consistent use of `beforeEach()` + `jest.clearAllMocks()`
- Proper `renderHook` + `waitFor` patterns for async hooks
- Comprehensive jest.setup.js mocking all native modules (297 lines)
- `renderWithProviders` helper wraps ThemeContext + NavigationContainer

**Gaps:**
- No integration/E2E tests (only unit/component)
- No snapshot tests for complex UI components
- No performance threshold tests (e.g., "chapter loads in <500ms")
- No database schema/migration integrity tests
- Limited error-case coverage in many test files
- Store tests don't cover concurrent state mutations

### 8.5 Test Infrastructure

The `jest.setup.js` (297 lines) comprehensively mocks: Expo modules (font, splash, speech, notifications, sqlite, asset, file-system, sharing, screen-orientation, constants, auth-session, web-browser, store-review), React Native modules (reanimated, gesture-handler, maps, svg, safe-area-context), navigation, and UI libraries.

---

## 9. Build & Bundle Optimization

### 9.1 Current State

- No `metro.config.js` — using Expo 54 defaults
- No console stripping in production builds
- No code splitting
- `newArchEnabled: true` in `app.json` — React Native New Architecture is on (early-stage in Expo 54, potential stability risk)
- `d3-hierarchy` (~15KB gzipped) imported for genealogy tree — only used in one feature

### 9.2 Recommendations

| Optimization | Impact | Effort |
|-------------|--------|--------|
| Create `metro.config.js` with `drop_console` in production | Reduces bundle + removes debug noise | Low |
| Add `babel-plugin-transform-remove-console` | Same as above, Babel-level | Low |
| Lazy-load screen components with `React.lazy()` | Faster initial load | Medium |
| Lazy-load panel components (20+ panels) | Reduce initial bundle | Medium |
| Verify `d3-hierarchy` is tree-shaken (not full `d3`) | Prevent 200KB+ bloat | Low |
| Add bundle size budget to CI | Prevent regression | Low |
| Evaluate `newArchEnabled: false` for v1.0 stability | Reduce crash risk | Low |

---

## 10. Store Metadata & Release Readiness

### 10.1 iOS Metadata (`store-metadata/ios.md`)

- Subtitle exceeds 30-character limit by 1 character: "Logos & Letters, verse by verse" (31 chars)
- Keywords within 100-char limit (94 chars)
- Category discrepancy: ios.md says "Reference > Bible Study" but APP_STORE_GUIDE.md says subcategory blank

### 10.2 Android Metadata (`store-metadata/android.md`)

- Complete and properly formatted with HTML tags for Play Store
- All fields within character limits

### 10.3 Release Notes Accuracy

Content counts (30 books, 879 chapters, 43 scholars, 211 people, etc.) should be auto-verified against the database during content-pipeline CI, not hardcoded.

### 10.4 Privacy Policy

- Current (March 2026)
- Correctly states no data collection, local-only storage
- Missing explicit GDPR/CCPA compliance statement (technically compliant since no data collected, but explicit mention strengthens it)
- Domain spelling (`scripturedeepive.com`) is consistent with bundle ID but may be an intentional abbreviation or typo

### 10.5 Submission Blockers

| Blocker | File | Status |
|---------|------|--------|
| Apple credentials (Apple ID, ASC App ID, Team ID) | `eas.json:36-38` | PLACEHOLDER |
| Google service account JSON | `eas.json:41` | Must create before Android submission |
| Google Maps API key | `app.config.js:12` | Must set env var before build |

---

## 11. Prioritized Recommendations

### Phase 1 — Critical (This Week)

| # | Issue | Files Affected | Est. Effort |
|---|-------|----------------|-------------|
| 1 | Fix race conditions in async hooks (add AbortController/mounted guard) | 8 hook files | 4-6 hrs |
| 2 | Add screen-level error boundaries (create `withErrorBoundary` HOC) | 46 screens + 1 new file | 2-3 hrs |
| 3 | Fix SQL LIKE injection (escape wildcards, use `json_extract`) | 4 DB files | 2 hrs |
| 4 | Fix `hebText` → `hebtext` panel color key | `theme/colors.ts` | 5 min |
| 5 | Move Supabase credentials to env vars | `lib/supabase.ts` | 30 min |
| 6 | Fix `app.config.js` to throw on missing Google Maps API key | `app.config.js` | 10 min |

### Phase 2 — High Priority (Next 1-2 Weeks)

| # | Issue | Files Affected | Est. Effort |
|---|-------|----------------|-------------|
| 7 | Create generic `useAsyncData` hook + migrate 15 hooks | 16 files | 6-8 hrs |
| 8 | Add `React.memo` to 30+ pure components | 30+ component files | 3-4 hrs |
| 9 | Extract `BrowseScreenTemplate` and consolidate 9 browse screens | 10 files | 8-10 hrs |
| 10 | Add `RootStackParamList` and remove 46+ `as any` navigation casts | `navigation/types.ts` + 20+ screens | 4-6 hrs |
| 11 | Add missing DB indexes (`verse_highlights.verse_ref`, `bookmarks.verse_ref`) | 1 migration file | 30 min |
| 12 | Fix N+1 query in `getRecentChapters()` | `db/user.ts` | 1 hr |
| 13 | Add ESLint + Prettier CI workflow | 1 workflow file | 1 hr |
| 14 | Create `PanelCallbacksContext` to eliminate prop drilling | 3-4 files | 2 hrs |

### Phase 3 — Medium Priority (Next Sprint)

| # | Issue | Files Affected | Est. Effort |
|---|-------|----------------|-------------|
| 15 | Extract `parseJSON<T>()` and `getEraColor()` utilities | 1 new util + 15+ consumers | 2-3 hrs |
| 16 | Decompose `ChapterScreen` (715 lines) into sub-components | 1 screen → 3-4 components | 4-6 hrs |
| 17 | Add loading skeletons to 12 screens missing them | 12 screen files | 3-4 hrs |
| 18 | Fix silent `.catch(() => {})` patterns — add logging + error states | 13+ locations | 2-3 hrs |
| 19 | Complete `hooks/index.ts` barrel exports | 1 file | 30 min |
| 20 | Add bundle size tracking to CI | 1 workflow + config | 1-2 hrs |
| 21 | Split `db/user.ts` (659 lines) into queries + mutations | 1 file → 2 files | 2 hrs |
| 22 | Fix iOS subtitle to ≤30 characters | `store-metadata/ios.md` | 5 min |
| 23 | Add periodic premium status sync on app foreground | `services/purchases.ts` | 1 hr |

### Phase 4 — Nice to Have (Future)

| # | Issue | Est. Effort |
|---|-------|-------------|
| 24 | Add accessibility labels to all interactive elements across 15+ screens | 8-12 hrs |
| 25 | Add integration/E2E tests for critical user flows | 8-12 hrs |
| 26 | Increase test coverage thresholds to 55-60% | Ongoing |
| 27 | Implement screen-level code splitting with `React.lazy` | 4-6 hrs |
| 28 | Evaluate Expo 55 upgrade path | 4-8 hrs |
| 29 | Create `metro.config.js` with production optimizations | 1 hr |
| 30 | Remove unused `severity.minor` color and dead theme values | 30 min |
| 31 | Add snapshot tests for complex UI components | 4-6 hrs |
| 32 | Query scholar labels from DB instead of hardcoding 78 names | 2 hrs |

---

## Appendix: Files Audited

Every `.ts`, `.tsx`, `.js`, `.json`, `.yml`, and `.md` file in the repository was read and analyzed, excluding `node_modules/`, `.next/`, and `package-lock.json`. Total: ~200+ source files, 247 test files, 9 config files, 6 metadata docs, 2 CI workflows.
