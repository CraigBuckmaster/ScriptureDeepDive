# Companion Study — Architectural Remediation Plan

> **Based on:** Full repo architectural review (March 28, 2026)
> **Goal:** Production-grade standards across git hygiene, type safety, code organization, testing, and performance.

---

## Batch Summary

| Batch | Description | Status |
|-------|-------------|--------|
| 1 | Quick wins (dead deps, stale refs, console cleanup) | **Complete** |
| 2 | Git history purge (scripture.db bloat) | **Complete** |
| 3 | Externalize DB_VERSION | **Complete** |
| 4 | Type safety pass (eliminate `any` types) | **Complete** |
| 5 | Content data layer decomposition | **Complete** |
| 6 | NotesOverlay decomposition | **Complete** |
| 7 | Inline style migration | **Planned** |
| 8A | Test coverage foundation (DB, stores, hooks) | **Planned** |
| 8B | CI/CD pipeline (GitHub Actions) | **Planned** (depends on 8A) |
| 8C | Branch protection + PR workflow | **Planned** (depends on 8B) |

---

## Batch 7 — Inline Style Migration (3–4 hours)

### Problem

318 inline `style={{ }}` objects across the codebase. Each creates a new JavaScript object on every render, bypassing React Native's style caching via `StyleSheet.create()`.

### Strategy

Best done opportunistically — when editing a file, migrate its inline styles. A dedicated pass ensures consistency.

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
  container: { flex: 1, padding: spacing.md },
});
// Usage with dynamic theme colors:
<View style={[styles.container, { backgroundColor: base.bg }]}>
```

**Dynamic styles** (values from props/state) use array syntax:
```typescript
<View style={[styles.container, { opacity: isActive ? 1 : 0.5 }]}>
```

**Audit command:**
```bash
grep -rn "style={{" --include="*.tsx" app/src/ | cut -d: -f1 | sort | uniq -c | sort -rn
```

**Commit:** `perf: migrate inline styles to StyleSheet.create()`

---

## Batch 8A — Test Coverage Foundation (2–3 days)

### Problem

Zero automated tests. No safety net for regressions. Every change is manually verified.

### Tiered Strategy

**Tier 1 — Pure functions (highest value, simplest tests):**

| Module | What to test |
|--------|-------------|
| `verseRef.ts` | `parseRef()`, `formatRef()`, `compareRefs()` |
| `panelLabels.ts` | Panel label resolution, category grouping |
| `typography.ts` | `getFontSize()` across scale values |
| `treeBuilder.ts` | Tree construction from flat genealogy data |
| `scholarSelection.ts` | Free scholar algorithm (when Phase P1 ships) |

**Tier 2 — Database queries (medium complexity):**

| Module | What to test |
|--------|-------------|
| `database.ts` (content) | `getChapter`, `getSections`, `getSectionPanels`, `getVerses`, FTS search |
| `userDatabase.ts` | Migration execution, note CRUD, highlight CRUD, reading progress |

Tests use an in-memory SQLite instance seeded with fixture data.

**Tier 3 — Hooks (requires React testing harness):**

| Hook | What to test |
|------|-------------|
| `useChapterData` | Correct data shape returned, loading states |
| `useSearch` | FTS query construction, filter application |
| `useStudyDepth` | Depth recording, persistence |
| `usePremium` | Gate logic (when Phase P1 ships) |

### Test infrastructure

```bash
cd app
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native
```

Jest config in `app/package.json`:
```json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

**Commit:** `test: add test foundation with Tiers 1-3`

---

## Batch 8B — CI/CD Pipeline (0.5 day)

### GitHub Actions Workflows

**Workflow 1: `content-pipeline.yml`**

Runs on pushes/PRs touching `content/` or `_tools/`. Validates JSON, builds SQLite, checks integrity.

```yaml
name: Content Pipeline
on:
  pull_request:
    branches: [master]
    paths: ['content/**', '_tools/**']
  push:
    branches: [master]
    paths: ['content/**', '_tools/**']
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: python3 _tools/build_sqlite.py
      - run: python3 _tools/validate.py
      - run: python3 _tools/validate_sqlite.py
```

**Workflow 2: `app-tests.yml`**

Runs on pushes/PRs touching `app/`. TypeScript check + Jest tests.

```yaml
name: App Tests
on:
  pull_request:
    branches: [master]
    paths: ['app/**']
  push:
    branches: [master]
    paths: ['app/**']
jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run: { working-directory: app }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: app/package-lock.json }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run test:ci
```

**Commit:** `ci: add GitHub Actions for content pipeline + app tests`

---

## Batch 8C — Branch Protection + PR Workflow (30 min)

### Branch Strategy

```
master (protected)
  ↑
  PR (required: CI passes)
  ↑
feat/description    ← development happens here
```

### GitHub Branch Protection Rules

| Setting | Value |
|---------|-------|
| Require pull request | ✅ |
| Required approvals | 0 (solo dev — self-merge) |
| Require status checks | ✅ (`validate` + `test`) |
| Require up-to-date branches | ✅ |
| Require linear history | ✅ |
| Allow force pushes | ❌ |

### Workflow for Claude Sessions

```bash
git checkout -b feat/description
# ... work and commit ...
git push -u origin feat/description
gh pr create --title "feat: description" --body "summary"
# Wait for CI → merge
gh pr merge --squash
```

**Commit:** `ci: add branch protection rules + PR workflow docs`

---

## Execution Order

```
Batch 7:  Inline style migration          ← Do opportunistically
    ↓
Batch 8A: Test coverage foundation         ← Required before 8B
    ↓
Batch 8B: CI/CD pipeline (GitHub Actions)  ← Requires 8A
    ↓
Batch 8C: Branch protection + PR workflow  ← Requires 8B
```

---

## Out of Scope (Noted for Future)

- **Accessibility (dynamic type, screen reader order)** — requires design decisions
- **Native builds in CI** — requires Apple Developer account
- **App Store submission** — separate workstream
- **Coverage thresholds** — wait until test suite matures past Tiers 1-3
