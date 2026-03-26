# Companion Study — Architectural Remediation Plan

**Date:** March 25, 2026  
**Based on:** Architectural Audit (same date)  
**Approach:** Ordered by dependency chain, not just severity. Some P1 items must wait for P0 foundations.

---

## Dependency Graph

```
Phase 1 (P0 — Foundations)
  ├── 1A. Split content/user databases ← everything depends on this
  └── 1B. Standardize verse_ref format ← can run in parallel with 1A

Phase 2 (P1 — Correctness)
  ├── 2A. Wire up chapter cache (or kill it)
  ├── 2B. Batch insert for reading plans + transaction safety
  └── 2C. Type all navigation params

Phase 3 (P2 — Quality)
  ├── 3A. Remove NativeWind dead dependencies
  ├── 3B. Add error logging infrastructure
  ├── 3C. Memoize JSON.parse in panel pipeline
  └── 3D. Dynamic app version

Phase 4 (P3 — Polish, ongoing)
  ├── 4A. Migrate inline styles to StyleSheet
  ├── 4B. Strip console.log for production
  └── 4C. Eliminate remaining `: any` types
```

---

## Phase 1A — Split Content / User Databases

**Why first:** Every content release that bumps `DB_VERSION` will nuke user data. This is a ticking time bomb and the entire upgrade architecture depends on getting it right.

### Current State

- `build_sqlite.py` creates user tables (`user_notes`, `reading_progress`, `bookmarks`, `user_preferences`) **inside** `scripture.db`
- `database.ts` creates additional user tables (`verse_highlights`, `reading_plans`, `plan_progress`) via runtime migrations **inside the same** `scripture.db`
- On version mismatch, `copyAssetDatabaseIfNeeded()` deletes the entire file and replaces it
- The build script comment says "never overwritten by OTA" — but the code does exactly that

### Target Architecture

Two separate SQLite databases:

| Database | Purpose | Lifecycle |
|----------|---------|-----------|
| `scripture.db` | Content only (books, chapters, sections, panels, verses, scholars, people, places, timelines, etc.) | Replaced on every OTA content update. Disposable. |
| `user.db` | All user data (notes, bookmarks, highlights, reading progress, preferences, plans, plan progress) | Never replaced. Migrated in-place via versioned migrations. |

### Implementation Steps

#### Step 1: Remove user tables from `build_sqlite.py`

Remove the `user_notes`, `reading_progress`, `bookmarks`, and `user_preferences` CREATE TABLE statements from the build script's schema string. These should not ship in the bundled asset.

**Files changed:** `_tools/build_sqlite.py`

#### Step 2: Create `db/userDatabase.ts`

New module responsible for `user.db` lifecycle:

```typescript
// db/userDatabase.ts

const USER_DB_VERSION = 1;

let userDb: SQLite.SQLiteDatabase | null = null;

export async function initUserDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (userDb) return userDb;

  userDb = await SQLite.openDatabaseAsync('user.db');
  await userDb.execAsync('PRAGMA journal_mode=WAL');
  await runMigrations(userDb);
  return userDb;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create migration tracking table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM _migrations'
  );
  const currentVersion = row?.version ?? 0;

  // Run each migration in order
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      await db.execAsync('BEGIN TRANSACTION');
      try {
        await db.execAsync(migration.sql);
        await db.runAsync(
          'INSERT INTO _migrations (version) VALUES (?)',
          [migration.version]
        );
        await db.execAsync('COMMIT');
        console.log(`[UserDB] Applied migration v${migration.version}`);
      } catch (err) {
        await db.execAsync('ROLLBACK');
        throw err;
      }
    }
  }
}

const MIGRATIONS = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_ref TEXT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS reading_progress (
        book_id TEXT NOT NULL,
        chapter_num INTEGER NOT NULL,
        completed_at TEXT,
        PRIMARY KEY (book_id, chapter_num)
      );
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_ref TEXT NOT NULL,
        label TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS verse_highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_ref TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(verse_ref)
      );
      CREATE TABLE IF NOT EXISTS reading_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        total_days INTEGER NOT NULL,
        chapters_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS plan_progress (
        plan_id TEXT NOT NULL REFERENCES reading_plans(id),
        day_num INTEGER NOT NULL,
        completed_at TEXT,
        PRIMARY KEY (plan_id, day_num)
      );
    `,
  },
  // Future migrations go here as { version: 2, sql: '...' }
];

export function getUserDb(): SQLite.SQLiteDatabase {
  if (!userDb) throw new Error('User database not initialized');
  return userDb;
}
```

**Key design decisions:**
- Versioned migrations with transaction safety — if migration 3 fails, 1 and 2 are still applied
- `_migrations` table tracks what's been applied (idempotent reruns)
- Future schema changes are just new entries in the `MIGRATIONS` array — no manual `IF NOT EXISTS` juggling

#### Step 3: Refactor `db/database.ts`

- Remove all `CREATE TABLE IF NOT EXISTS` statements for user tables from `initDatabase()`
- `copyAssetDatabaseIfNeeded()` now only manages content DB — safe to delete/replace freely
- Startup sequence becomes: `initDatabase()` then `initUserDatabase()`

#### Step 4: Refactor `db/user.ts`

Change every `getDb()` call to `getUserDb()`:

```typescript
// Before
import { getDb } from './database';

// After
import { getUserDb } from './userDatabase';
```

Every function in `user.ts` switches from `getDb()` → `getUserDb()`. Content queries in `content.ts` stay on `getDb()`.

#### Step 5: Data migration for existing users

Users on current version have user data inside `scripture.db`. First launch after this change must migrate their data out:

```typescript
// In initUserDatabase(), after migrations:
async function migrateFromLegacyDb(userDb: SQLite.SQLiteDatabase): Promise<void> {
  const migrated = await userDb.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_notes'
  );
  if ((migrated?.count ?? 0) > 0) return; // Already migrated

  try {
    const contentDb = getDb(); // scripture.db still has the old data

    // Check if legacy tables exist in content DB
    const hasNotes = await contentDb.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_notes'"
    );
    if (!hasNotes) return; // Fresh install, nothing to migrate

    // Copy each table
    const notes = await contentDb.getAllAsync('SELECT * FROM user_notes');
    const progress = await contentDb.getAllAsync('SELECT * FROM reading_progress');
    const bookmarks = await contentDb.getAllAsync('SELECT * FROM bookmarks');
    const prefs = await contentDb.getAllAsync('SELECT * FROM user_preferences');
    const highlights = await contentDb.getAllAsync('SELECT * FROM verse_highlights');

    // Batch insert into user.db
    await userDb.execAsync('BEGIN TRANSACTION');
    for (const n of notes) {
      await userDb.runAsync(
        'INSERT OR IGNORE INTO user_notes (verse_ref, note_text, created_at, updated_at) VALUES (?,?,?,?)',
        [n.verse_ref, n.note_text, n.created_at, n.updated_at]
      );
    }
    // ... repeat for each table
    await userDb.execAsync('COMMIT');

    console.log('[UserDB] Migrated legacy data from scripture.db');
  } catch (err) {
    console.warn('[UserDB] Legacy migration failed (may be first install):', err);
  }
}
```

#### Step 6: Update `App.tsx` startup

```typescript
// Before
await initDatabase();
await useSettingsStore.getState().hydrate();

// After
await initDatabase();
await initUserDatabase();
await useSettingsStore.getState().hydrate();
```

#### Step 7: Rebuild and validate

- `python3 _tools/build_sqlite.py` — produces a content-only `scripture.db`
- `python3 _tools/validate_sqlite.py` — update to skip user table checks
- Test: install old version, create notes/bookmarks, upgrade to new version, verify data survives

**Files changed:** `_tools/build_sqlite.py`, `_tools/validate_sqlite.py`, `db/database.ts`, new `db/userDatabase.ts`, `db/user.ts`, `db/index.ts`, `App.tsx`  
**Estimated effort:** 1.5 days  
**Risk:** Medium — migration from legacy DB needs careful testing on real devices

---

## Phase 1B — Standardize Verse Reference Format

**Why now:** Must be fixed before user base grows. Data migration gets harder over time.

### Current State

Two incompatible formats in the same database:

| Feature | Format | Example | Location |
|---------|--------|---------|----------|
| Notes | `{bookId}:{ch}` prefix | `genesis:1` | `user.ts` line 15 |
| Highlights | `{bookId} {ch}:` prefix | `genesis 1:` | `user.ts` line 159 |
| Bookmarks | Unknown (never queried by chapter) | ??? | `user.ts` line 94 |

### Target Format

Canonical format: `{bookId} {ch}:{v}` (e.g., `genesis 1:3`)
- Matches how Bible references are written
- Space between book and chapter, colon between chapter and verse
- Prefix queries use `{bookId} {ch}:%`

### Implementation Steps

#### Step 1: Create `utils/verseRef.ts`

```typescript
/**
 * Canonical verse reference format: "genesis 1:3"
 * Chapter prefix for LIKE queries: "genesis 1:%"
 */

export function formatVerseRef(bookId: string, ch: number, v: number): string {
  return `${bookId} ${ch}:${v}`;
}

export function chapterPrefix(bookId: string, ch: number): string {
  return `${bookId} ${ch}:`;
}

export function parseVerseRef(ref: string): { bookId: string; ch: number; v: number } | null {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return { bookId: match[1], ch: parseInt(match[2], 10), v: parseInt(match[3], 10) };
}
```

#### Step 2: Update all `user.ts` functions

Replace inline format strings with `chapterPrefix()`:

```typescript
export async function getNotesForChapter(bookId: string, ch: number) {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE verse_ref LIKE ? ORDER BY verse_ref",
    [`${chapterPrefix(bookId, ch)}%`]
  );
}
```

#### Step 3: Add data migration

In `userDatabase.ts` migration v2 (or in the legacy migration logic), normalize any existing refs that use the old colon format:

```typescript
{
  version: 2,
  sql: `
    -- Normalize "genesis:1:3" → "genesis 1:3"
    UPDATE user_notes SET verse_ref = 
      REPLACE(verse_ref, substr(verse_ref, 1, instr(verse_ref, ':') - 1) || ':', 
              substr(verse_ref, 1, instr(verse_ref, ':') - 1) || ' ')
    WHERE verse_ref LIKE '%:%:%' AND verse_ref NOT LIKE '% %';
  `,
}
```

#### Step 4: Update all call sites

Every place that constructs a verse_ref must use `formatVerseRef()`:
- `saveNote()` callers
- `addBookmark()` callers
- `setHighlight()` callers
- `isBookmarked()` callers

**Files changed:** New `utils/verseRef.ts`, `db/user.ts`, `db/userDatabase.ts`, `components/NotesOverlay.tsx`, `components/BookmarkButton.tsx`, `components/HighlightColorPicker.tsx`  
**Estimated effort:** 0.5 day  
**Risk:** Low — migration SQL should be tested against actual data

---

## Phase 2A — Wire Up or Kill Chapter Cache

### Decision Point

Test whether `useChapterCache` actually improves perceived performance:

1. Add a `console.time` wrapper around `useChapterData`'s DB queries
2. Measure: if chapter load is <50ms (likely — local SQLite at 36MB), **delete the cache entirely**
3. If >100ms, wire it up properly

### If keeping the cache:

Update `useChapterData` to check cache first:

```typescript
async function load() {
  setIsLoading(true);

  // Check cache first
  const cached = getCachedChapter(bookId!, chapterNum, translation);
  if (cached) {
    setChapter(cached.chapter);
    setSections(cached.sections);
    setVerses(cached.verses);
    // Still need panels and notes from DB...
  }

  const ch = cached?.chapter ?? await getChapter(bookId!, chapterNum);
  // ... rest of load
}
```

### If killing the cache (recommended):

Delete `hooks/useChapterCache.ts`, remove import/call from `ChapterScreen.tsx`, remove export from `hooks/index.ts`.

**Estimated effort:** 1 hour either way  
**Recommendation:** Kill it. Local SQLite is fast enough.

---

## Phase 2B — Batch Insert + Transaction Safety for Reading Plans

### Step 1: Batch insert

```typescript
export async function startPlan(planId: string): Promise<void> {
  const plan = await getUserDb().getFirstAsync<ReadingPlan>(
    "SELECT * FROM reading_plans WHERE id = ?", [planId]
  );
  if (!plan) return;

  await getUserDb().execAsync('BEGIN TRANSACTION');
  try {
    await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);

    // Build single multi-row INSERT
    const placeholders = Array.from({ length: plan.total_days },
      (_, i) => `('${planId}', ${i + 1})`
    ).join(',');

    await getUserDb().execAsync(
      `INSERT INTO plan_progress (plan_id, day_num) VALUES ${placeholders}`
    );

    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', ?)",
      [planId]
    );
    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('plan_start_date', ?)",
      [new Date().toISOString().slice(0, 10)]
    );

    await getUserDb().execAsync('COMMIT');
  } catch (err) {
    await getUserDb().execAsync('ROLLBACK');
    throw err;
  }
}
```

### Step 2: Wrap `abandonPlan` in transaction too

```typescript
export async function abandonPlan(planId: string): Promise<void> {
  await getUserDb().execAsync('BEGIN TRANSACTION');
  try {
    await getUserDb().runAsync("DELETE FROM plan_progress WHERE plan_id = ?", [planId]);
    await getUserDb().runAsync(
      "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', '')",
    );
    await getUserDb().execAsync('COMMIT');
  } catch (err) {
    await getUserDb().execAsync('ROLLBACK');
    throw err;
  }
}
```

**Files changed:** `db/user.ts`  
**Estimated effort:** 1 hour

---

## Phase 2C — Type All Navigation Params

### Current State

- `ReadStackParamList`, `HomeStackParamList`, `ExploreStackParamList` are defined but never referenced in screens
- `MoreStack` and `SearchStack` have no param list types at all
- 20 screens use `useNavigation<any>`, 8 use `useRoute<any>`

### Implementation Steps

#### Step 1: Create `navigation/types.ts`

Centralize all param lists and composite types:

```typescript
// navigation/types.ts

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

// ── Stack Param Lists ─────────────────────────────────

export type ReadStackParamList = {
  BookList: undefined;
  ChapterList: { bookId: string };
  BookIntro: { bookId: string };
  Chapter: { bookId: string; chapterNum: number };
  ParallelPassage: { entryId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Chapter: { bookId: string; chapterNum: number };
  ChapterList: { bookId: string };
  BookList: undefined;
  BookIntro: { bookId: string };
  ParallelPassage: { entryId: string };
};

export type ExploreStackParamList = {
  ExploreMenu: undefined;
  GenealogyTree: undefined;
  PersonDetail: { personId: string };
  Map: { storyId?: string };
  Timeline: { eventId?: string };
  WordStudyBrowse: undefined;
  WordStudyDetail: { wordId: string };
  ScholarBrowse: undefined;
  ScholarBio: { scholarId: string };
  ParallelPassage: { entryId: string };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Settings: undefined;
  Bookmarks: undefined;
  ReadingHistory: undefined;
  AllNotes: undefined;
  PlanList: undefined;
  PlanDetail: { planId: string };
  Chapter: { bookId: string; chapterNum: number };
  BookIntro: { bookId: string };
};

export type SearchStackParamList = {
  SearchMain: undefined;
};

// ── Tab Param List ────────────────────────────────────

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ReadTab: NavigatorScreenParams<ReadStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};

// ── Helper types for screens ──────────────────────────

export type ReadNavProp<T extends keyof ReadStackParamList> =
  StackNavigationProp<ReadStackParamList, T>;
export type ReadRouteProp<T extends keyof ReadStackParamList> =
  RouteProp<ReadStackParamList, T>;

// ... repeat for each stack
```

#### Step 2: Update each screen

```typescript
// Before
const navigation = useNavigation<any>();
const route = useRoute<any>();
const { bookId, chapterNum } = route.params ?? {};

// After
import type { ReadNavProp, ReadRouteProp } from '../navigation/types';

const navigation = useNavigation<ReadNavProp<'Chapter'>>();
const route = useRoute<ReadRouteProp<'Chapter'>>();
const { bookId, chapterNum } = route.params;
// ^ TypeScript now guarantees these exist and are typed correctly
```

#### Step 3: Type cross-tab navigation

For `navigation.navigate('ExploreTab', { screen: 'Timeline', params: { eventId: '...' } })`, the `TabParamList` + `NavigatorScreenParams` combo gives full type safety across tabs.

#### Step 4: Remove duplicate param list definitions from stack files

Move the source of truth to `navigation/types.ts`, import from there in each stack navigator file.

**Files changed:** New `navigation/types.ts`, all 23 screen files, 5 stack navigator files  
**Estimated effort:** 1 day (mechanical but touches every screen)  
**Risk:** Low — purely additive typing, no runtime behavior change

---

## Phase 3A — Remove NativeWind Dead Dependencies

```bash
cd app
npm uninstall nativewind tailwindcss
rm tailwind.config.js global.css
```

Remove from `babel.config.js` if there's a NativeWind plugin entry. Remove any `global.css` import in `App.tsx` or `index.ts`.

**Estimated effort:** 15 minutes  
**Risk:** Zero — 0 usages in codebase

---

## Phase 3B — Add Error Logging Infrastructure

### Step 1: Create `utils/logger.ts`

```typescript
// utils/logger.ts

const IS_DEV = __DEV__;

export const logger = {
  info: (tag: string, msg: string, data?: any) => {
    if (IS_DEV) console.log(`[${tag}] ${msg}`, data ?? '');
  },
  warn: (tag: string, msg: string, data?: any) => {
    console.warn(`[${tag}] ${msg}`, data ?? '');
    // Future: send to Sentry/Bugsnag
  },
  error: (tag: string, msg: string, err?: any) => {
    console.error(`[${tag}] ${msg}`, err ?? '');
    // Future: send to Sentry/Bugsnag with stack trace
  },
};
```

### Step 2: Replace all 29 empty catch blocks

Pattern:
```typescript
// Before
catch {}

// After  
catch (err) {
  logger.warn('ComponentName', 'Brief description of what failed', err);
}
```

### Step 3: Replace all 22 console.log/warn/error calls

Switch to `logger.info()` / `logger.warn()` / `logger.error()` so prod logging can be centrally controlled.

**Files changed:** New `utils/logger.ts`, ~35 files with catch blocks or console calls  
**Estimated effort:** 0.5 day

---

## Phase 3C — Memoize JSON.parse in Panel Pipeline

### Option A: Parse once in `useChapterData` (recommended)

```typescript
// In useChapterData, after loading section panels:
const secsWithPanels = await Promise.all(
  secs.map(async (sec) => {
    const rawPanels = await getSectionPanels(sec.id);
    return {
      ...sec,
      panels: rawPanels.map(p => ({
        ...p,
        parsedContent: safeJsonParse(p.content_json),
      })),
    };
  })
);
```

### Option B: Memoize inside PanelRenderer

```typescript
// Cache parsed JSON by panel ID to avoid re-parsing on re-render
const parsedCache = useRef(new Map<number, any>());

function getParsedContent(panelId: number, json: string): any {
  if (parsedCache.current.has(panelId)) return parsedCache.current.get(panelId);
  try {
    const parsed = JSON.parse(json);
    parsedCache.current.set(panelId, parsed);
    return parsed;
  } catch {
    return null;
  }
}
```

**Recommendation:** Option A — parse at data load time, not render time. Panel components receive typed data instead of raw JSON strings.

**Files changed:** `hooks/useChapterData.ts`, `components/panels/PanelRenderer.tsx`, `components/PanelContainer.tsx`  
**Estimated effort:** 2 hours

---

## Phase 3D — Dynamic App Version

### Current State

- `HomeScreen.tsx` hardcodes `Version 1.0.0`
- `SettingsScreen.tsx` reads from `app.json` correctly: `require('../../app.json').expo.version`

### Fix

Create a shared constant:

```typescript
// utils/appVersion.ts
export const APP_VERSION: string = require('../../app.json').expo.version ?? '0.0.0';
```

Import in both `HomeScreen.tsx` and `SettingsScreen.tsx`.

**Estimated effort:** 10 minutes

---

## Phase 4 — Ongoing Polish (No Deadline)

### 4A. Migrate Inline Styles

297 instances of `style={{ ... }}`. Don't batch-fix these — migrate them opportunistically whenever a component is being touched for another reason. Rule: if you edit a file, move its inline styles to `StyleSheet.create()`.

### 4B. Strip Console Logging for Production

After Phase 3B (logger infrastructure), do a sweep:
```bash
grep -rn "console\.\(log\|warn\|error\)" app/src/ --include="*.ts" --include="*.tsx"
```
Replace all with `logger.*` calls. The logger already gates `console.log` behind `__DEV__`.

### 4C. Eliminate `: any` Types

16 instances. Priority targets:
- `SectionWithPanels.panels: Record<string, any>` → type the panel map properly
- `PanelRenderer` local `data: any` → type per panel type after JSON.parse
- `bookData` state in `ChapterScreen` → use `Book | null`

---

## Execution Schedule

| Week | Phase | Items | Days |
|------|-------|-------|------|
| 1 | 1A | DB split + legacy migration | 1.5 |
| 1 | 1B | Verse ref standardization | 0.5 |
| 1 | — | **Testing & validation** | 1 |
| 2 | 2A | Chapter cache decision | 0.5 |
| 2 | 2B | Batch inserts + transactions | 0.5 |
| 2 | 2C | Navigation typing | 1 |
| 2 | 3A | Remove NativeWind | 0.1 |
| 3 | 3B | Logger infrastructure | 0.5 |
| 3 | 3C | JSON.parse memoization | 0.25 |
| 3 | 3D | App version constant | 0.1 |
| 4+ | 4* | Ongoing polish | — |

**Total estimated effort:** ~6 days of focused work across 3 weeks.

---

## Testing Strategy Per Phase

| Phase | Test |
|-------|------|
| 1A | Install old build → create notes, bookmarks, highlights → upgrade → verify all data persists. Also test fresh install (no migration needed). |
| 1B | Verify existing notes/highlights load correctly after ref format migration. Create new ones, confirm format. |
| 2B | Start a 365-day plan, verify all rows created. Kill app mid-start, verify no partial state. |
| 2C | TypeScript compilation catches all errors. No new runtime tests needed — the compiler IS the test. |
| 3B | Intentionally break a JSON panel, verify error appears in logger output instead of silent blank. |

---

## Files Changed Summary

| File | Phases |
|------|--------|
| `_tools/build_sqlite.py` | 1A |
| `_tools/validate_sqlite.py` | 1A |
| `db/database.ts` | 1A |
| **NEW** `db/userDatabase.ts` | 1A |
| `db/user.ts` | 1A, 1B, 2B |
| `db/index.ts` | 1A |
| `App.tsx` | 1A |
| **NEW** `utils/verseRef.ts` | 1B |
| **NEW** `utils/logger.ts` | 3B |
| **NEW** `utils/appVersion.ts` | 3D |
| **NEW** `navigation/types.ts` | 2C |
| All 23 screen files | 2C, 3B |
| All 5 navigation stack files | 2C |
| `hooks/useChapterData.ts` | 2A, 3C |
| `hooks/useChapterCache.ts` | 2A (delete) |
| `components/panels/PanelRenderer.tsx` | 3C |
| `components/NotesOverlay.tsx` | 1B |
| `components/BookmarkButton.tsx` | 1B |
| `components/HighlightColorPicker.tsx` | 1B |
| `HomeScreen.tsx` | 3D |
| `package.json` | 3A |
| `tailwind.config.js` | 3A (delete) |
| `global.css` | 3A (delete) |

---

*This plan is designed so that each phase can be committed and shipped independently. Phase 1A is the only one that requires a careful multi-step migration — everything else is straightforward.*
