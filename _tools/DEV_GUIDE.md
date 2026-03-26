# Companion Study — Developer Guide

> **Read this before writing any app code.**
> These conventions exist because we hit real bugs. Each rule links to
> the audit finding that motivated it.

Last updated: 2026-03-26

---

## 1. Two-Database Architecture

**Rule:** Content in `scripture.db`, user data in `user.db`. Never mix them.

| Database | Contains | Lifecycle |
|----------|----------|-----------|
| `scripture.db` | Books, chapters, sections, panels, verses, scholars, people, places, timelines, VHL groups, word studies, cross-refs | **Replaced in full** on every content update (DB version bump). Treat as disposable. |
| `user.db` | Notes, bookmarks, highlights, reading progress, preferences, reading plans, plan progress | **Never replaced.** Schema changes via versioned migrations only. |

**Why:** Before the split, bumping `DB_VERSION` deleted and replaced `scripture.db`, which also contained user tables. Every content update destroyed all user data.

**Enforced by:**
- `build_sqlite.py` does NOT create user tables
- `database.ts` (content) has zero `CREATE TABLE` statements at runtime
- `userDatabase.ts` owns all user tables via the migration system
- `user.ts` imports `getUserDb()` for user queries, `getDb()` only for cross-DB enrichment

### Adding a new user table or column

1. Open `app/src/db/userDatabase.ts`
2. Add a new entry to the `MIGRATIONS` array with the next version number
3. **NEVER** modify an existing migration — only append
4. The migration runs inside a transaction automatically
5. Test: install the old version, create some data, upgrade, verify data survives

```typescript
// Example: adding a "tags" column to bookmarks
{
  version: 2,
  description: 'Add tags column to bookmarks',
  sql: `ALTER TABLE bookmarks ADD COLUMN tags TEXT;`,
},
```

### Bumping the content DB version

When `build_sqlite.py` schema changes (new content table, new column, etc.):

1. Bump `DB_VERSION` in `_tools/build_sqlite.py`
2. Bump `EXPECTED_DB_VERSION` in `app/src/db/database.ts` to match
3. Both values **must** be identical strings
4. This triggers a full replace of `scripture.db` on user devices — which is safe because user data lives in `user.db`

---

## 2. Verse Reference Format

**Rule:** All verse references use the format `"{bookId} {ch}:{v}"` — e.g., `"genesis 1:3"`. Never construct ref strings inline.

**Why:** Notes previously used `genesis:1:3` (colons) while bookmarks/highlights used `genesis 1:3` (space). Cross-feature queries silently returned nothing.

**Enforced by:** `app/src/utils/verseRef.ts` — single source of truth.

| Function | Purpose | Example |
|----------|---------|---------|
| `formatVerseRef(bookId, ch, v)` | Build a ref | `"genesis 1:3"` |
| `chapterPrefix(bookId, ch)` | Build LIKE prefix | `"genesis 1:"` |
| `parseVerseRef(ref)` | Parse back to parts | `{ bookId, ch, v }` |
| `extractVerseNum(ref)` | Get just the verse number | `3` |
| `displayRef(ref)` | Human display | `"Genesis 1:3"` |

**Do:**
```typescript
import { formatVerseRef, chapterPrefix } from '../utils/verseRef';
const ref = formatVerseRef(bookId, ch, verseNum);
const prefix = chapterPrefix(bookId, ch);
```

**Don't:**
```typescript
// ❌ Never construct refs inline
const ref = `${bookId}:${ch}:${v}`;
const ref = `${bookId} ${ch}:${v}`;
const prefix = `${bookId}:${ch}`;
```

---

## 3. Error Handling

**Rule:** Never use empty `catch {}` blocks. Always capture the error and log it.

**Why:** 29 silent catch blocks hid database failures, JSON parse errors, and preference corruption. Screens showed blank content with zero diagnostics.

**Enforced by:** `app/src/utils/logger.ts`

```typescript
import { logger } from '../utils/logger';

// ✅ Do
try { ... } catch (err) {
  logger.warn('ComponentName', 'What failed', err);
}

// ❌ Don't
try { ... } catch {}
try { ... } catch { /* ignore */ }
```

**Logger levels:**
- `logger.info(tag, msg)` — dev only, stripped in production
- `logger.warn(tag, msg, data)` — always logged, recoverable issues
- `logger.error(tag, msg, err)` — always logged, crashes/corruption

**Console calls:** Use `logger.info()` instead of `console.log()`. Logger gates dev-only output automatically.

---

## 4. Navigation Typing

**Rule:** Always type `useRoute()` with `ScreenRouteProp`. Never use `useRoute<any>()`.

**Why:** `useRoute<any>()` means `route.params.bookId` compiles even if the param doesn't exist on that screen's route — resulting in silent `undefined` at runtime.

**Enforced by:** `app/src/navigation/types.ts` — centralized param lists.

```typescript
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';

// ✅ Do — TypeScript catches mistyped params at compile time
const route = useRoute<ScreenRouteProp<'Read', 'Chapter'>>();
const { bookId, chapterNum } = route.params; // typed correctly

// ❌ Don't — silent undefined on typos
const route = useRoute<any>();
const { bookId, chapterNum } = route.params ?? {}; // compiles but may crash
```

**Adding a new screen:**
1. Add the screen name + params to the correct `*StackParamList` in `navigation/types.ts`
2. Add the `<Stack.Screen>` in the stack navigator file
3. Use `ScreenRouteProp<'StackName', 'ScreenName'>` in the screen component

---

## 5. Theming

**Rule:** Never hardcode color hex values. Use `base.*` tokens from `app/src/theme/colors.ts`.

**Why:** The gold color swap touched 6 files and cascaded to 100+ usages because everything uses tokens. Hardcoded hex values get left behind and create visual inconsistencies.

```typescript
// ✅ Do
import { base } from '../theme';
color: base.gold

// ❌ Don't
color: '#bfa050'
color: '#c9a84c'
```

**Exception:** Scholar colors in `colors.ts` itself, and panel accent colors, are defined as hex values in the token file — that's the one place where hex literals belong.

---

## 6. Styling

**Rule:** Use `StyleSheet.create()` for styles. Avoid inline `style={{ }}` objects.

**Why:** Inline style objects create new references on every render, bypassing React Native's style caching. 297 inline styles were identified in the audit.

```typescript
// ✅ Do
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.bg },
});

// ❌ Avoid
<View style={{ flex: 1, backgroundColor: base.bg }} />
```

**NativeWind/TailwindCSS:** Removed from the project. We don't use `className=`. Don't re-add them.

---

## 7. Panel Data Flow

**Rule:** `PanelRenderer` handles JSON.parse via `useMemo`. Panel components receive parsed data, not raw JSON strings.

**Why:** Before memoization, every re-render re-parsed `content_json` for every open panel. Chapters with 15+ panels would parse the same JSON repeatedly.

**Convention:** If you need to parse a JSON column from SQLite elsewhere (e.g., `bio_json`, `glosses_json`), do it in the data-loading hook, not in the render function.

---

## 8. Database Query Patterns

**Rule:** User data queries go through `getUserDb()`, content queries through `getDb()`. Cross-database joins must be done in application code (two separate queries).

**Why:** `user.db` and `scripture.db` are separate SQLite files. SQL JOINs across them don't work.

```typescript
// ✅ Do — two-step query
const progress = await getUserDb().getAllAsync('SELECT * FROM reading_progress ...');
const bookInfo = await getDb().getFirstAsync('SELECT name FROM books WHERE id = ?', [bookId]);

// ❌ Don't — cross-DB JOIN will fail
await getDb().getAllAsync('SELECT * FROM reading_progress JOIN books ...');
```

**Reference implementation:** See `getRecentChapters()` in `db/user.ts`.

---

## 9. Transactions for Multi-Step Writes

**Rule:** Wrap multi-statement writes in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`.

**Why:** `startPlan()` previously did 365 individual INSERTs with no transaction. A crash mid-way left partial data. Now it uses batch inserts inside a transaction.

```typescript
await getUserDb().execAsync('BEGIN TRANSACTION');
try {
  await getUserDb().runAsync('DELETE FROM ...');
  await getUserDb().runAsync('INSERT INTO ...');
  await getUserDb().execAsync('COMMIT');
} catch (err) {
  await getUserDb().execAsync('ROLLBACK');
  throw err;
}
```

---

## Quick Reference: What Goes Where

| I need to... | File |
|--------------|------|
| Add a user table/column | `db/userDatabase.ts` (new migration) |
| Add a content table/column | `_tools/build_sqlite.py` + bump version |
| Add a new screen | `navigation/types.ts` + stack file + screen file |
| Add a new panel type | `PanelRenderer.tsx` (new case) + new panel component |
| Add a new scholar | `config.py` + `meta/*.json` + `colors.ts` |
| Add a new color token | `theme/colors.ts` |
| Construct a verse reference | `utils/verseRef.ts` |
| Log an error | `utils/logger.ts` |
| Safely parse a JSON column | `safeParse()` from `utils/logger.ts` |
| Change the gold color | `theme/colors.ts` → `base.gold` (one place) |

---

## Known Debt & Future Work

Items deferred from completed audits. Not bugs — polish for when bandwidth allows.

**Accessibility:**
- Dynamic type integration — font scaling is manual via Settings slider, not linked to system accessibility font size. To fix: read the system font scale from `PixelRatio.getFontScale()` and apply it as a multiplier to `fontSize` values.
- Screen reader navigation order — not explicitly defined for complex screens like `ChapterScreen` with multiple expandable panels. To fix: add `accessibilityOrder` or manual `accessible` grouping so VoiceOver/TalkBack reads in a logical sequence.

**Styling (Phase 4 — ongoing):**
- 297 inline `style={{ }}` objects remain across components. Migrate to `StyleSheet.create()` opportunistically when editing files.
- 13 `useNavigation<any>` remain in nav-only screens (no route params to mistype — low risk).
- 16 explicit `: any` types remain (e.g., `SectionWithPanels.panels`, `PanelRenderer.data`). Type properly when touching those files.
