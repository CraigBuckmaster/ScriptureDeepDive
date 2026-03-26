# Companion Study — Security Findings

**Last updated:** 2026-03-26 (all actionable findings resolved)
**Scope:** Full scan of all source files in `app/src/`, `app/App.tsx`, `app/app.json`
**Methodology:** Manual code review of all 130+ source files for injection,
secrets exposure, unsafe deserialization, network surface, and code execution.

---

## Risk Profile

Companion Study is a **fully offline, read-only Bible study app** with
no network calls, no authentication, no user accounts, no APIs, and no
server-side component. The attack surface is minimal. All data comes from
a bundled SQLite database shipped with the app binary.

**Overall risk: LOW**

---

## Findings

### SEC-01: Unguarded JSON.parse Calls (LOW)

**Severity:** LOW
**Impact:** App crash (not exploitable — data is from bundled DB)
**Files affected:** 8

11 instances of `JSON.parse()` without try/catch protection. If any
`_json` column in the bundled SQLite database contains malformed JSON,
the app will crash with an unhandled exception.

| File | Line | Column Parsed |
|------|------|---------------|
| HighlightedText.tsx | 74 | `group.words_json` |
| HighlightedText.tsx | 84 | `group.btn_types_json` |
| PlaceMarkerList.tsx | 28 | `activeStory.places_json` |
| StoryOverlays.tsx | 27 | `story.regions_json` |
| StoryOverlays.tsx | 37 | `story.paths_json` |
| StoryPanel.tsx | 26 | `story.places_json` |
| useBookIntro.ts | 11 | `row.intro_json` |
| MapScreen.tsx | 62 | `story.places_json` |
| ScholarBioScreen.tsx | 40 | `scholar.scope_json` |
| ScholarBrowseScreen.tsx | 90 | `s.scope_json` |

**Note:** ScholarBioScreen line 24 already has a try/catch — this is the
correct pattern. The PanelRenderer.tsx (line 53) also has proper wrapping.

**Why LOW not MEDIUM:** The JSON comes from a build-time generated SQLite
database that goes through the audit pipeline before shipping. There is no
user input path to these JSON columns. The risk is a build-time content
error, not a runtime exploit.

**Recommendation:** Wrap all JSON.parse calls in try/catch with a sensible
fallback (empty array or null). A utility function would standardize this:

```typescript
// utils/safeParse.ts
export function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try { return JSON.parse(json); } catch { return fallback; }
}
```

---

### SEC-02: FTS5 Search Input Not Sanitized (LOW)

**Severity:** LOW
**Impact:** FTS syntax error → empty results or crash
**File:** `src/db/content.ts:318` (searchVerses), `src/db/content.ts:326`
(searchPeople)

The FTS5 MATCH query passes user input directly from the search bar. FTS5
has its own query syntax where characters like `*`, `"`, `NEAR`, `NOT`,
and unbalanced quotes can cause syntax errors.

```typescript
// Current — raw user input goes to MATCH
WHERE f.text MATCH ?
```

Example inputs that would cause errors:
- `"hello` (unbalanced quote)
- `NOT` (bare operator)
- `test*` (prefix search — actually valid, but unexpected behavior)

**Why LOW not MEDIUM:** The useSearch hook wraps the entire search call in
a try/catch and falls back to empty results. So errors are swallowed
silently — the user sees no results, but the app doesn't crash. There is
no SQL injection risk because FTS MATCH is parameterized.

**Recommendation:** Sanitize FTS input before passing to MATCH:

```typescript
function sanitizeFtsQuery(query: string): string {
  // Escape FTS5 special characters by wrapping each term in double quotes
  return query
    .replace(/["\*]/g, '')        // Strip quotes and wildcards
    .split(/\s+/)                 // Split into words
    .filter(w => w.length >= 2)   // Drop single chars
    .map(w => `"${w}"`)           // Quote each term
    .join(' ');                    // AND semantics
}
```

---

### SEC-03: No Error Boundary in Production (LOW)

**Severity:** LOW
**Impact:** White screen of death on unhandled render error
**File:** `app/App.tsx`

An `ErrorBoundary` component exists in `src/components/ErrorBoundary.tsx`
with a proper `componentDidCatch`, error display UI, and "Reload" button.
However, it is never imported or rendered anywhere in the component tree.

In development, React Native shows a red error screen. In production, an
unhandled render error in any component will result in a blank white screen
with no recovery path — the user must force-quit the app.

**Recommendation:** Wrap the root navigator:

```tsx
// App.tsx
import { ErrorBoundary } from './src/components/ErrorBoundary';

// In render:
<ErrorBoundary>
  <RootNavigator />
</ErrorBoundary>
```

---

### SEC-04: Database Not Encrypted (INFO)

**Severity:** INFO (not actionable for this app)
**Impact:** On-device DB readable if device is jailbroken/rooted

The SQLite database (`scripture.db`) is stored unencrypted in the app's
documents directory. On a jailbroken iOS device or rooted Android device,
the database file can be read directly.

**Why INFO:** The database contains only publicly available Bible text and
scholarly commentary. There is no PII, no credentials, no private user
data of any sensitivity. The reading history and bookmarks tables are
low-sensitivity user data.

**No action needed.** If user authentication or personal notes with
sensitive content are added in the future, consider SQLCipher encryption
for the user data tables.

---

### SEC-05: No Network Attack Surface (INFO — POSITIVE)

**Severity:** INFO (positive finding)

The app makes **zero network requests**. There are:
- No `fetch()` calls
- No XMLHttpRequest usage
- No WebSocket connections
- No API keys or tokens in source
- No deep link URL scheme registered
- No web view components

The only external dependency is Expo's push notification system
(`expo-notifications`), which uses Expo's infrastructure for scheduling —
but the current implementation only schedules local notifications, not
remote push. No server communication occurs.

**This is the strongest possible security posture for a mobile app.**

---

### SEC-06: SQL Queries Properly Parameterized (INFO — POSITIVE)

**Severity:** INFO (positive finding)

All 40+ SQL queries in `src/db/content.ts` and `src/db/user.ts` use
parameterized placeholders (`?`). No string interpolation or template
literals are used to build SQL. Example:

```typescript
// ✅ Correct — parameterized
getDb().getFirstAsync<Book>('SELECT * FROM books WHERE id = ?', [id]);

// ❌ Would be dangerous (NOT found anywhere in codebase)
getDb().getFirstAsync<Book>(`SELECT * FROM books WHERE id = '${id}'`);
```

Zero SQL injection risk.

---

## Summary

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| SEC-01 | 11 unguarded JSON.parse calls | LOW | ✅ FIXED — `safeParse()` utility added to `logger.ts`, all catch blocks logged. `useBookIntro` was last unguarded site. |
| SEC-02 | FTS5 search input not sanitized | LOW | ✅ FIXED — `sanitizeFtsQuery()` added to `content.ts`, strips special chars, quotes terms. |
| SEC-03 | ErrorBoundary not wired | LOW | ✅ FIXED — Was already wired in `App.tsx` at time of audit (finding was stale). |
| SEC-04 | Database not encrypted | INFO | No action (public data). Note: user.db now holds notes/bookmarks — still low sensitivity. |
| SEC-05 | No network attack surface | INFO | Positive finding — unchanged. |
| SEC-06 | All SQL parameterized | INFO | Positive finding — unchanged. |

**All actionable findings resolved as of 2026-03-26.**

**Critical findings: 0**
**High findings: 0**
**Medium findings: 0**
**Low findings: 3 (all fixed)**
**Informational: 3 (2 positive)**
