# Companion Study — Architectural Audit Report

**Date:** March 25, 2026  
**Auditor:** Senior Architect Review  
**Scope:** Full React Native app (`app/src/`), content pipeline (`_tools/`), data layer (`scripture.db`)  
**Codebase:** ~14,228 lines TS/TSX · 68 components · 23 screens · 22 hooks · 2 stores

---

## Executive Summary

This is a well-structured, single-developer codebase that punches above its weight. The content pipeline is industrial-grade, the data architecture is clean, and the separation of concerns is genuine — not just cosmetic. That said, there are **two critical bugs**, several moderate architectural risks, and a handful of tech debt items that will compound as the app scales toward all 66 books.

**Overall Grade: B+**  
Strong foundations, smart design decisions, a few landmines.

---

## 🔴 CRITICAL — Fix Before Next Release

### 1. Database Upgrade Destroys User Data

**Severity:** Critical · Data Loss  
**Location:** `db/database.ts` lines 103–149

The DB upgrade flow does a full `deleteAsync` + `copyAsync` — replacing the entire `scripture.db`. But user tables (`user_notes`, `reading_progress`, `bookmarks`, `user_preferences`, `verse_highlights`, `plan_progress`) live *inside that same database*. When `EXPECTED_DB_VERSION` is bumped from `0.11` → `0.12`, every user loses all their notes, bookmarks, reading history, and preferences.

**Root Cause:** Content and user data are co-located in a single SQLite file. The upgrade assumes the whole file is disposable.

**Recommended Fix:**  
Split into two databases:
- `scripture.db` — content only, replaced on every OTA update, no user tables
- `user.db` — user-only tables, never replaced, migrated in-place

Alternatively, before replacing, export user tables to a temp DB, replace scripture.db, then re-import. But the two-DB approach is cleaner long-term.

**Effort:** Medium (1–2 days). This is the single most important fix in this audit.

---

### 2. Verse Reference Format Inconsistency

**Severity:** Critical · Data Integrity  
**Location:** `db/user.ts` lines 15–16 vs 159–160

Notes use colon-separated format:
```typescript
const prefix = `${bookId}:${ch}`;  // e.g., "genesis:1"
```

Highlights use space-separated format:
```typescript
const prefix = `${bookId} ${ch}:`;  // e.g., "genesis 1:"
```

This means `getNotesForChapter` and `getHighlightsForChapter` use **incompatible key formats** for the same conceptual entity (a verse reference). Cross-feature queries (e.g., "show me highlighted verses that also have notes") will silently return nothing. Any future unification of the verse_ref format will require a data migration.

**Recommended Fix:**  
Pick one canonical format (e.g., `genesis 1:3`), add a `formatVerseRef()` utility, and migrate any existing stored refs. Do this before the user base grows.

---

## 🟠 MODERATE — Address This Quarter

### 3. N+1 Query in Reading Plan Initialization

**Location:** `db/user.ts` lines 193–199

```typescript
for (let day = 1; day <= plan.total_days; day++) {
  await getDb().runAsync(
    "INSERT INTO plan_progress (plan_id, day_num) VALUES (?, ?)",
    [planId, day]
  );
}
```

A 365-day plan fires 365 individual INSERT statements. This should be a single batch insert.

**Fix:** Build a single `INSERT INTO plan_progress VALUES (?,?),(?,?),(?,?)...` statement or use `execAsync` with a multi-row insert.

---

### 4. Chapter Pre-fetch Cache Never Used

**Location:** `hooks/useChapterCache.ts`

The `useChapterCache` hook pre-fetches adjacent chapters into a `Map<string, any>`, but `useChapterData` never checks this cache — it always does fresh DB queries. The cache is populated but orphaned.

**Impact:** Wasted CPU/memory on every chapter view. Not harmful, but misleading — it *looks* like pre-fetching works.

**Fix:** Have `useChapterData` check `getCachedChapter()` before hitting the DB, or remove the hook entirely if local SQLite is fast enough (which it likely is at 36MB).

---

### 5. NativeWind Installed But Unused

**Location:** `package.json`, `tailwind.config.js`, `global.css`

NativeWind + TailwindCSS are in dependencies, config files exist, but `className=` usage across the entire codebase is **0**. Everything uses `StyleSheet.create()`.

**Impact:** ~200KB+ of unused dependency weight in the bundle. Config files are noise.

**Fix:** Remove `nativewind`, `tailwindcss`, `tailwind.config.js`, `global.css` unless there's a plan to migrate styling.

---

### 6. Navigation Typing is `<any>` Everywhere

**Location:** 20 files use `useNavigation<any>`, 8 use `useRoute<any>`

Every screen casts navigation to `any`, defeating TypeScript's purpose. Route params are unchecked — a typo in `bookId` or `chapterNum` silently passes `undefined` and the screen silently fails.

**Fix:** Define `RootStackParamList`, per-stack param lists (already partially done in `ReadStack.tsx`), and use `NativeStackNavigationProp<ReadStackParamList, 'Chapter'>` in each screen. This is a one-time investment that prevents an entire class of runtime bugs.

---

### 7. 297 Inline Styles

**Location:** Across all components

While `StyleSheet.create()` is used in most screens, there are 297 instances of `style={{ ... }}` — these create new objects on every render, bypassing React Native's style caching.

**Impact:** Minor perf overhead individually, but at scale (especially in list renders), it adds up.

**Fix:** Not urgent, but as part of any component refactor, move inline styles to `StyleSheet.create()` or at minimum `useMemo`.

---

### 8. 29 Silent Error Swallows

**Location:** Throughout `db/`, `stores/`, `hooks/`

```typescript
catch {
  // nothing
}
```

Empty catch blocks in 29 locations. Database failures, JSON parse errors, and preference hydration errors are all silently consumed. In production, a corrupt DB row or malformed `content_json` will just show a blank screen with no diagnostics.

**Fix:** At minimum, log to `console.warn`. Better: create a lightweight error reporting utility that can be swapped for Sentry/Bugsnag later.

---

### 9. ScrollView for Long Lists Instead of FlatList

**Location:** `ChapterScreen.tsx` uses `ScrollView` for the main reading experience

For chapters with 10+ sections and many panels, the entire content tree is mounted at once. `FlatList` (or `FlashList`) would virtualize offscreen content.

**Nuance:** Bible chapters are typically short enough that this isn't catastrophic, and `ScrollView` simplifies layout measurement (the `sectionYMap` / `btnRowYMap` refs). But for long chapters like Psalm 119 (176 verses) or Isaiah 1 with many panels open, this will jank.

**Fix:** Consider `FlashList` for the section list, or at minimum lazy-mount panels that are below the fold.

---

## 🟡 LOW — Tech Debt & Cleanup

### 10. `content_json` Parsed at Render Time

Every panel does `JSON.parse(contentJson)` inside the component render. For complex chapters with 15+ panels, this is redundant parsing on every re-render.

**Fix:** Parse once in `useChapterData` or memoize in `PanelRenderer`.

### 11. 16 Explicit `: any` Types

Loose typing in `SectionWithPanels.panels`, `PanelRenderer.data`, `bookData` state, etc. Each one is a potential runtime crash waiting for a shape mismatch.

### 12. 18 `console.log` Statements

Should be stripped for production builds or gated behind `__DEV__`.

### 13. Version String Hardcoded in HomeScreen

`Version 1.0.0` is a string literal. Should come from `app.json` / `expo-constants`.

### 14. `startPlan` / `abandonPlan` Not Transactional

If `startPlan` fails mid-way through inserting 365 rows, you get partial progress data. Wrap in a transaction.

### 15. `useHomeData` Verse Pool is Static

The 31 featured verses are hardcoded. Once you have 66 books of verse data in SQLite, this could query the DB for a random verse from a "featured" table — more maintainable and expandable.

---

## ✅ What's Done Well

These are genuine architectural strengths — not platitudes:

1. **Token-based theming** — The gold color swap we just did touched 6 files and cascaded to 100+ usages. That's the payoff of good design.

2. **Content pipeline separation** — Generator scripts → JSON → SQLite → App is a clean, reproducible, debuggable pipeline. The fact that generators are ephemeral (`/tmp/`) and never committed is smart discipline.

3. **Single-open panel policy** — `readerStore.setActivePanel()` elegantly prevents UI chaos. Toggle same = close, toggle different = switch. Simple state machine.

4. **Panel rendering architecture** — `PanelRenderer` as a type-dispatch router with a scholar fallback is extensible without modification. Adding a new panel type is one `case` statement.

5. **DB query layer** — `content.ts` and `user.ts` cleanly separate read-only content from user mutations. Functions are typed, specific, and composable. No ORM overhead.

6. **Zustand over Redux** — For this app's complexity, Zustand is the right call. Two small stores with clear boundaries. No boilerplate.

7. **Validation pipeline** — `validate.py` + `validate_sqlite.py` catch content issues before they reach users. Many apps skip this entirely.

8. **Maestro E2E flows** — 10 flow files covering core user journeys. Most solo projects have zero E2E tests.

9. **Error boundary at root** — Catches crashes gracefully instead of white-screening.

10. **Type definitions** — 19 DB entity types + 10 panel content types. The `types/index.ts` file is a living contract between the pipeline and the app.

---

## Priority Roadmap

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Split content/user databases | 1–2 days | Prevents data loss |
| P0 | Fix verse_ref format inconsistency | 0.5 day | Prevents data corruption |
| P1 | Batch insert for reading plans | 1 hour | Performance fix |
| P1 | Wire up or remove chapter cache | 2 hours | Remove dead code or gain perf |
| P1 | Type navigation params properly | 1 day | Prevents runtime bugs |
| P2 | Remove NativeWind deps | 30 min | Reduce bundle size |
| P2 | Add error logging to catch blocks | 0.5 day | Debuggability |
| P2 | Memoize JSON.parse in panels | 2 hours | Render performance |
| P3 | Migrate inline styles | Ongoing | Incremental perf gains |
| P3 | Strip console.log for prod | 30 min | Clean logs |

---

*End of audit. The bones are solid — the two critical items need attention before the next content release that bumps the DB version.*
