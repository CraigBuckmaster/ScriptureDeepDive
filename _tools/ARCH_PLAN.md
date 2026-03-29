# Companion Study — Architectural Remediation Plan

> **Based on:** Full repo architectural review (March 28, 2026)
> **Goal:** Bring the codebase to production-grade standards across git hygiene,
> type safety, code organization, testing, and performance.
>
> Batches are ordered by impact-to-effort ratio. Each is independently
> shippable — no batch depends on a later one.

---

## Batch Summary

| Batch | Description | Effort | Risk |
|-------|-------------|--------|------|
| 1 | Quick wins (dead deps, stale refs, console cleanup) | 1 hr | None |
| 2 | Git history purge (scripture.db bloat) | 2 hrs | Force-push required |
| 3 | Externalize DB_VERSION (stop self-modifying builds) | 30 min | Low |
| 4 | Type safety pass (eliminate all `any` types) | 2–3 hrs | Low |
| 5 | Content data layer decomposition | 1–2 hrs | Low |
| 6 | NotesOverlay decomposition | 2–3 hrs | Medium |
| 7 | Inline style migration | 3–4 hrs | Low |
| 8 | Test coverage foundation | 2–3 days | None |

**Total: ~5–6 working days**

---

## Batch 1 — Quick Wins (1 hour)

Low-effort, zero-risk changes that clean up visible debt immediately.

### 1A. Remove Ghost Dependencies

`victory-native` and `react-native-web` are in `package.json` but have
zero imports anywhere in `src/`. They bloat the bundle for nothing.

```bash
cd app
npm uninstall victory-native react-native-web
```

**Verify:** `grep -rn "victory\|react-native-web" src/` returns nothing.

### 1B. Remove Stale tsconfig Reference

`nativewind-env.d.ts` is in the `include` array but the file doesn't exist.
NativeWind was removed from the project months ago.

**File:** `app/tsconfig.json`

**Change:** Remove `"nativewind-env.d.ts"` from the `include` array:
```json
"include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
```

### 1C. Replace console.* with logger.* (8 files)

The project has `logger.ts` as the standard, but 8 files still use raw
`console.log/warn/error`. This defeats the gated logging system.

| File | Pattern | Replacement |
|------|---------|-------------|
| `ErrorBoundary.tsx` | `console.error` | `logger.error('ErrorBoundary', ...)` |
| `database.ts` | `console.log`, `console.warn` | `logger.info('DB', ...)`, `logger.warn('DB', ...)` |
| `userDatabase.ts` | `console.log`, `console.error` | `logger.info('UserDB', ...)`, `logger.error('UserDB', ...)` |
| `useHomeData.ts` | `console.warn` | `logger.warn('useHomeData', ...)` |
| `usePeople.ts` | `console.warn` | `logger.warn('usePeople', ...)` |
| `useTreeGestures.ts` | `console.log` | `logger.info('TreeGestures', ...)` |
| `GenealogyTreeScreen.tsx` | `console.log` | `logger.info('GenealogyTree', ...)` |
| `perfMonitor.ts` | `console.log` | `logger.info('Perf', ...)` |

Each file needs `import { logger } from '../utils/logger';` added.

**Commit:** `chore: remove ghost deps, fix tsconfig, standardize logging`

---

## Batch 2 — Git History Purge (2 hours)

### Problem

`scripture.db` has been committed 83 times. Git stores every version as a
separate binary object. Total: **3,084 MB** of dead weight in `.git/`.
The working tree is 87 MB. Every clone downloads 35x the actual project size.

### Root Cause

`scripture.db` is a derived artifact — fully regenerated from `content/`
by `build_sqlite.py`. It should never have been tracked by git.

### Solution

**Step 1: Gitignore the derived files**

Add to `.gitignore`:
```
scripture.db
app/assets/scripture.db
```

**Step 2: Remove from git tracking (keep on disk)**
```bash
git rm --cached scripture.db
git rm --cached app/assets/scripture.db  # if tracked
git commit -m "chore: gitignore scripture.db (derived artifact)"
```

**Step 3: Purge history with BFG Repo-Cleaner**
```bash
# From a fresh clone (required by BFG)
java -jar bfg.jar --delete-files scripture.db
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Step 4: All collaborators re-clone**

The force-push rewrites history. Everyone must `git clone` fresh.

**Step 5: Update pipeline docs**

Add to DEV_GUIDE.md section 10 (Content Pipeline):
```
scripture.db is gitignored — it's a derived artifact rebuilt by build_sqlite.py.
After cloning, run `python3 _tools/build_sqlite.py` to generate it locally.
The app copies it into assets/ via `npm run setup` (runs automatically on start).
```

### Alternative: Git LFS

If there's a reason to keep the DB in version control (e.g., CI/CD needs it
without running the Python pipeline), use Git LFS instead:

```bash
git lfs install
git lfs track "scripture.db"
git lfs track "app/assets/scripture.db"
```

This stores the binary in LFS and keeps a lightweight pointer in the repo.
Clones stay fast. History doesn't bloat. However, this requires LFS hosting
(GitHub includes 1 GB free with each repo).

**Recommendation:** Gitignore is simpler and sufficient. The DB is regenerated
in seconds from JSON. There's no reason to version-track it.

**Commit:** `chore: purge scripture.db from git history (3 GB reclaimed)`

---

## Batch 3 — Externalize DB_VERSION (30 minutes)

### Problem

`bump_db_version()` in `build_sqlite.py` rewrites its own source file on
every build. This creates phantom diffs in `git status`, merge noise, and
violates the principle that build tools shouldn't modify themselves.

### Solution

Create `_tools/db_version.json`:
```json
{ "version": "0.15" }
```

**Modify `build_sqlite.py`:**
- Read version from `_tools/db_version.json` instead of a module-level constant
- `bump_db_version()` writes to the JSON file and to `database.ts`
- No longer rewrites itself

**Modify `app/src/db/database.ts`:**
- Read from `db_version.json` at build time, OR keep the `const` and have
  `bump_db_version()` update it (current approach, minus the self-rewrite)

**Simplest approach:** Keep `database.ts` as-is (it needs a compile-time constant).
Only change `build_sqlite.py` to read/write `_tools/db_version.json` instead of
editing its own Python source.

```python
# build_sqlite.py — new approach
VERSION_FILE = ROOT / '_tools' / 'db_version.json'

def get_db_version():
    return json.loads(VERSION_FILE.read_text())['version']

def bump_db_version():
    data = json.loads(VERSION_FILE.read_text())
    old = data['version']
    major, minor = old.split('.')
    data['version'] = f"{major}.{int(minor) + 1}"
    VERSION_FILE.write_text(json.dumps(data, indent=2))
    # Also update database.ts...
    return data['version']
```

**Commit:** `refactor: externalize DB_VERSION to db_version.json`

---

## Batch 4 — Type Safety Pass (2–3 hours)

### Problem

45 explicit `any` types across 31 files. 15 `useNavigation<any>()` calls.
These bypass TypeScript's safety net — the whole reason for using TypeScript.

### Strategy

Work file-by-file. The `any` types fall into three categories:

**Category A: `useNavigation<any>()` — 15 files**

These all need the proper `ScreenNavProp` type from `navigation/types.ts`.
The pattern is already established — these are just files that were never
updated.

Files: `AllNotesScreen`, `BookListScreen`, `BookmarkListScreen`,
`ExploreMenuScreen`, `GenealogyTreeScreen`, `HomeScreen`, `MapScreen`,
`MoreMenuScreen`, `ParallelPassageScreen`, `PlanListScreen`,
`ProphecyBrowseScreen`, `ProphecyDetailScreen`, `ReadingHistoryScreen`,
`ScholarBrowseScreen`, `WordStudyBrowseScreen`

**Change pattern:**
```typescript
// Before
const navigation = useNavigation<any>();

// After
const navigation = useNavigation<ScreenNavProp<'Explore', 'ProphecyBrowse'>>();
```

**Category B: Component prop types — 10 files**

| File | Current | Proper Type |
|------|---------|-------------|
| `ChapterSkeleton.tsx` | `style?: any` | `style?: ViewStyle` |
| `ScholarInfoSheet.tsx` | `useState<any>` | `useState<ScholarBio \| null>` |
| `SectionBlock.tsx` | `onRefPress?: (ref: any)` | `onRefPress?: (ref: ParsedRef)` |
| `DebatePanel.tsx` | `entries: any[]` | `entries: DebateEntry[]` |
| `ReceptionPanel.tsx` | `entries: any[]` | `entries: RecEntry[]` |
| `TranslationPanel.tsx` | `data: any` | `data: TransPanel` |
| `BookIntroScreen.tsx` | `section: any` | Define `BookIntroSection` interface |
| `ChapterScreen.tsx` | `useState<any>` | `useState<Book \| null>` |
| `GenealogyTreeScreen.tsx` | `{ route, navigation }: any` | Proper screen prop types |
| `MapScreen.tsx` | `{ route, navigation }: any` | Proper screen prop types |

**Category C: Utility types — 5 files**

| File | Current | Proper Type |
|------|---------|-------------|
| `useBookIntro.ts` | `useState<any>` | Define `ParsedBookIntro` |
| `treeBuilder.ts` | 3 `any` refs | Type the d3 hierarchy nodes |
| `SearchScreen.tsx` | 4 `any` refs | Type search result variants |
| `typography.ts` | 1 `any` | `Record<string, TextStyle>` |
| `ScholarBioScreen.tsx` | 3 `any` | Type parsed bio structure |

**Commit:** `refactor: eliminate all any types (45 → 0)`

---

## Batch 5 — Content Data Layer Decomposition (1–2 hours)

### Problem

`content.ts` is a single 470-line file with 60+ flat exported functions.
No grouping, no namespacing. Finding the right query requires scrolling
through unrelated domains.

### Target Structure

```
src/db/content/
├── index.ts          # Re-exports everything (no breaking changes)
├── books.ts          # getBooks, getBook, getLiveBooks, getBookIntro
├── chapters.ts       # getChapter, getChapterById, getSections, getSectionPanels,
│                     #   getChapterPanels, getVHLGroups, getVerses, getVerse
├── scholars.ts       # getAllScholars, getScholar, getScholarsForBook
├── people.ts         # getAllPeople, getPerson, getPersonChildren, getSpousesOf
├── places.ts         # getPlaces, getPlace, getMapStories, getMapStory
├── reference.ts      # getWordStudy, getSynopticEntries, getCrossRefThreads,
│                     #   getCrossRefPairsForVerse, getTimelineEvents, etc.
├── features.ts       # getProphecyChain(s), getConcept(s), getDifficultPassage(s)
├── search.ts         # searchVerses, searchPeople
└── stats.ts          # getContentStats, getGenealogyConfig, getTimelineEraConfig
```

### Migration Strategy

1. Create `src/db/content/` directory
2. Move functions into domain files (copy, don't refactor — keep signatures identical)
3. Create `index.ts` that re-exports everything from all sub-modules
4. Update `src/db/index.ts` to point to `./content/index` instead of `./content`
5. **Zero changes needed in any consumer** — imports from `../db/content` still work

**Commit:** `refactor(db): decompose content.ts into domain modules`

---

## Batch 6 — NotesOverlay Decomposition (2–3 hours)

### Problem

`NotesOverlay.tsx` is 608 lines handling: note CRUD, tag management,
collection assignment, note linking, search, keyboard avoidance, and
scroll/animation. 11 `useState` calls in one component.

### Target Structure

```
src/components/notes/
├── NotesOverlay.tsx       # Shell: modal visibility, keyboard handling, layout (~100 lines)
├── NotesList.tsx          # Renders the scrollable list of notes (~80 lines)
├── NoteCard.tsx           # Single note display with edit/delete actions (~100 lines)
├── NoteEditor.tsx         # Edit mode: text input, tag chips, collection, links (~150 lines)
├── NewNoteInput.tsx       # Create mode: verse ref picker + text input (~80 lines)
└── useNotesOverlay.ts     # Hook: all state + CRUD operations (~120 lines)
```

### Key Decisions

**State lives in the hook.** `useNotesOverlay` owns all 11 `useState` values
plus `reload`, `handleSave`, `handleDelete`, `handleTagUpdate`,
`handleCollectionChange`, `handleLink/Unlink`. The hook returns an interface
that child components consume.

**The shell is thin.** `NotesOverlay.tsx` becomes a `Modal` wrapper that calls
`useNotesOverlay()` and passes data down to `NotesList` / `NoteEditor` /
`NewNoteInput`. It handles `KeyboardAvoidingView` and close animation.

**No behavior change.** This is a pure structural refactor — the UX stays
identical. Every interaction that works today must work after decomposition.

### Migration

1. Extract `useNotesOverlay` hook (all state + handlers)
2. Extract `NoteCard` (the per-note render block)
3. Extract `NoteEditor` (the editing state UI)
4. Extract `NewNoteInput` (the bottom add-note bar)
5. Extract `NotesList` (FlatList wrapper)
6. Slim `NotesOverlay.tsx` to a shell

Test manually after each extraction — there are no automated tests for this
component.

**Commit:** `refactor(notes): decompose NotesOverlay into 5 focused components + hook`

---

## Batch 7 — Inline Style Migration (3–4 hours)

### Problem

318 inline `style={{ }}` objects across the codebase. Each creates a new
JavaScript object on every render, bypassing React Native's style caching
via `StyleSheet.create()`.

### Strategy

This is best done opportunistically — when editing a file for another reason,
migrate its inline styles at the same time. But a dedicated pass ensures
consistency.

**Priority order** (by render frequency):
1. `ChapterScreen.tsx` — renders on every chapter navigation
2. `SectionBlock.tsx` — renders N times per chapter
3. `PanelRenderer.tsx` + panel components — renders inside sections
4. `HomeScreen.tsx` — renders on app launch
5. `BookListScreen.tsx` — renders on every Read tab visit
6. All remaining screens and components

**Pattern:**
```typescript
// Before
<View style={{ flex: 1, backgroundColor: base.bg, padding: spacing.md }}>

// After (at bottom of file)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.bg, padding: spacing.md },
});
// ...
<View style={styles.container}>
```

**Dynamic styles** (values from props/state) use array syntax:
```typescript
<View style={[styles.container, { opacity: isActive ? 1 : 0.5 }]}>
```

**Commit:** `perf: migrate 318 inline styles to StyleSheet.create()`

---

## Batch 8 — Test Coverage Foundation (2–3 days)

### Current State

6 unit tests covering pure utility functions. Zero tests for:
hooks, components, screens, database layer, stores, navigation.

### Target Coverage (Phase 1)

Focus on the layers that break silently and are hardest to catch manually.

**Tier 1 — Database layer (highest ROI)**

The `content.ts` and `user.ts` functions are the foundation everything else
depends on. Test them against a test fixture database.

```
__tests__/db/
├── content.test.ts     # getBooks, getChapter, getSections, getVerses, search
├── user.test.ts        # saveNote, getNotesForChapter, bookmarks, progress
└── fixtures/
    └── test.db         # Small SQLite with 2 books, 4 chapters, sample panels
```

**Key tests:**
- `getBooks()` returns 66 live books
- `getChapter('genesis', 1)` returns sections with panels
- `searchVerses('beginning')` returns Genesis 1:1
- `saveNote()` → `getNotesForChapter()` round-trip
- `recordVisit()` → `getRecentChapters()` round-trip
- User DB migration runs cleanly on fresh database

**Tier 2 — Stores**

Test `settingsStore` hydration and persistence:
- Default values before hydration
- `setTranslation('esv')` → hydrate → value persists
- `setFontSize(25)` clamps to 24

Test `readerStore` single-open policy:
- `setActivePanel('s1', 'heb')` → `setActivePanel('s1', 'heb')` → clears
- `setActivePanel('s1', 'heb')` → `setActivePanel('s2', 'mac')` → switches

**Tier 3 — Hooks**

Test `useChapterData` with mock DB:
- Returns loading state initially
- Returns chapter + sections + panels after load
- Cancels on unmount (no state updates after unmount)

**Tier 4 — Components (deferred)**

Component tests require `@testing-library/react-native` and render mocking.
Defer until Tiers 1–3 are solid.

### Setup

```bash
cd app
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

Update `jest.config.js` to include DB test setup (in-memory SQLite).

**Commit:** `test: add database + store + hook test foundation`

---

## Execution Order

```
Batch 1: Quick wins (deps, tsconfig, logging)     ← Start here
    |
Batch 2: Git history purge                        ← Highest impact
    |
Batch 3: Externalize DB_VERSION                   ← Pairs with Batch 2
    |
Batch 4: Type safety pass                         ← Catches bugs
    |
Batch 5: Content data layer split                 ← Readability
    |
Batch 6: NotesOverlay decomposition               ← Maintainability
    |
Batch 7: Inline style migration                   ← Performance (do opportunistically)
    |
Batch 8: Test coverage                             ← Ongoing
```

---

## Out of Scope (Noted for Future)

These were identified in the review but are not included in this plan:

- **Chapter screen params duplication** (4 stacks define `Chapter` independently).
  Fix requires a navigation architecture change (shared modal stack or linking
  config). Plan separately when adding new screens.

- **Accessibility (dynamic type, screen reader order).** Already tracked in
  DEV_GUIDE.md Known Debt. Requires design decisions about which screens
  to prioritize.

- **CI/CD pipeline.** No GitHub Actions, no automated testing on push.
  Depends on Batch 8 (test foundation) being complete first.

- **App Store submission.** Requires Apple Developer account (not yet
  established) and `expo-haptics` enablement. Separate workstream.
