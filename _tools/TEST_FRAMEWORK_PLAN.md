# Companion Study — Test Framework Plan

## Executive Summary

Build a **unified, config-driven, 3-tier test framework** that covers all 30 live books (879 chapters), the SQLite database (34 tables, 61K verses), and the React Native mobile app — runnable both locally and via GitHub Actions CI.

---

## Current State

| Script | Lines | What It Does |
|--------|-------|-------------|
| `validate.py` | 210 | JSON schema validation, cross-refs, completeness |
| `validate_sqlite.py` | 362 | DB integrity, FTS, cross-book checks |
| `app/__tests__/unit/*.test.ts` | 221 (6 files) | Jest unit tests (geoMath, panelLabels, referenceParser, timelineLayout, treeBuilder, verseResolver) |

**Gaps:** No unified runner, content coverage only spot-checks, no JSON↔SQLite cross-validation, no enrichment tracking, mobile app has zero integration tests.

---

## Architecture

### Directory Structure

```
_tools/
├── test_all.py                    # Unified CLI runner
├── tests/
│   ├── conftest.py                # Shared pytest fixtures
│   ├── pytest.ini                 # pytest configuration
│   ├── helpers.py                 # Shared utility functions
│   │
│   ├── tier1_content/             # Content Completeness
│   │   ├── test_chapter_schema.py     # Every JSON has required keys
│   │   ├── test_section_panels.py     # Section panels exist + have content
│   │   ├── test_chapter_panels.py     # Chapter-level panels present
│   │   ├── test_scholar_coverage.py   # Scholars match scope config
│   │   ├── test_verse_counts.py       # NIV/ESV verse counts match expected
│   │   ├── test_vhl_groups.py         # VHL groups present + valid CSS classes
│   │   ├── test_meta_files.py         # books.json, people.json, scholars.json
│   │   └── test_enrichment.py         # Enrichment debt tracker (report, not fail)
│   │
│   ├── tier2_integrity/           # Cross-Layer Integrity
│   │   ├── test_json_vs_sqlite.py     # JSON ↔ SQLite row counts + content
│   │   ├── test_verse_files.py        # Verse JSON ↔ DB verse counts
│   │   ├── test_scholar_scopes.py     # Scholar scopes ↔ actual panels
│   │   ├── test_people_integrity.py   # People refs ↔ people data ↔ DB
│   │   └── test_book_meta.py          # books.json live flags ↔ content dirs ↔ DB
│   │
│   └── tier3_mobile/              # Mobile App (Jest — see below)
│
app/__tests__/
├── unit/                          # Existing 6 tests + new
│   ├── geoMath.test.ts            # existing
│   ├── panelLabels.test.ts        # existing
│   ├── referenceParser.test.ts    # existing
│   ├── timelineLayout.test.ts     # existing
│   ├── treeBuilder.test.ts        # existing
│   ├── verseResolver.test.ts      # existing
│   ├── colors.test.ts             # NEW
│   └── haptics.test.ts            # NEW
├── integration/                   # NEW
│   ├── database.test.ts           # DB query layer with fixture DB
│   ├── search.test.ts             # Search hooks with mock DB
│   └── navigation.test.ts        # Navigation param parsing
└── fixtures/
    └── test.db                    # Subset of scripture.db
```

### Design Principles

1. **Config-driven.** Every book list, scholar scope, and panel type is read from `content/meta/*.json`. When a new book goes live, zero test files change.

2. **Parameterized.** `@pytest.mark.parametrize` generates one test case per chapter. Failure says "genesis-3 section 2 missing heb panel" not just "something failed."

3. **Tiered execution:**
   ```bash
   python3 _tools/test_all.py                # all tiers
   python3 _tools/test_all.py --tier 1       # content only (~5s)
   python3 _tools/test_all.py --tier 2       # integrity (~10s)
   python3 _tools/test_all.py --tier 3       # mobile Jest (~5s)
   ```

---

## Tier 1: Content Completeness (Python/pytest, ~5s)

### conftest.py — Shared Fixtures

```python
@pytest.fixture(scope="session")
def meta(repo_root):
    meta_dir = repo_root / 'content' / 'meta'
    return {f.stem: json.loads(f.read_text()) for f in meta_dir.glob('*.json')}

@pytest.fixture(scope="session")
def live_books(meta):
    return [b for b in meta['books'] if b.get('is_live')]

@pytest.fixture(scope="session")
def all_chapters(repo_root, live_books):
    chapters = []
    for book in live_books:
        book_dir = repo_root / 'content' / book['id']
        for ch in range(1, book['total_chapters'] + 1):
            data = json.loads((book_dir / f'{ch}.json').read_text())
            chapters.append((book['id'], ch, data))
    return chapters
```

### Tests

- **test_chapter_schema** — Every chapter has required keys, ≥1 section, valid verse ranges, no duplicate section numbers. Parameterized: 879 test cases.
- **test_section_panels** — Every section has ≥1 panel, no empty content, panel keys from known vocabulary. ~2,200 cases.
- **test_chapter_panels** — Known panel types only, no raw HTML in hebtext. 879 cases.
- **test_scholar_coverage** — Scholar panels match `scholar-scopes.json`. Scoped scholars present only in their books, `"all"` scholars present everywhere. ~45 cases.
- **test_verse_counts** — NIV/ESV verse files exist for all 66 books, each entry has required keys, no empty text. 132 cases.
- **test_vhl_groups** — Valid `css_class` values, non-empty `words` and `btn_types`. 879 cases.
- **test_meta_files** — 66 books, 233 people with valid parent refs, 45 scholars, valid place coordinates, all 66 book intros. ~30 cases.
- **test_enrichment** — Report-only: which books have VHL, timeline links, MacArthur, people, themes.

---

## Tier 2: Cross-Layer Integrity (Python/pytest, ~10s)

- **test_json_vs_sqlite** — DB row counts match JSON file counts for books, chapters, sections, panels. Spot-check 10 random chapters field-by-field. ~50 cases.
- **test_verse_files** — Verse counts in `content/verses/` match `verses` table per book per translation. Total 61K. No orphans, no duplicates. ~70 cases.
- **test_scholar_scopes** — Every DB scholar has a scope entry. Panels exist where scoped. ~45 cases.
- **test_people_integrity** — JSON people ↔ DB people match. Parent refs valid. FTS works. ~15 cases.
- **test_book_meta** — `is_live` flags ↔ content dirs ↔ DB agree. 66 book intros present. ~10 cases.

---

## Tier 3: Mobile App (Jest, ~5s)

### Expand Existing + Add Integration Tests

- **database.test.ts** — Test `src/db/content.ts` queries: `getBooks()`, `getChapter()`, `getSections()`, `searchVerses()`. Uses fixture DB.
- **search.test.ts** — Test search hook logic with mock DB.
- **navigation.test.ts** — Route param parsing, deep link URL parsing.
- **colors.test.ts** — Theme color exports.
- **haptics.test.ts** — Haptics util.

---

## Unified Runner: test_all.py

```python
#!/usr/bin/env python3
"""
Usage:
    python3 _tools/test_all.py                # all tiers
    python3 _tools/test_all.py --tier 1       # content only
    python3 _tools/test_all.py --tier 1 2     # content + integrity
    python3 _tools/test_all.py --tier 3       # mobile (Jest)
    python3 _tools/test_all.py --report       # enrichment report
"""
```

Tier 1+2: `pytest _tools/tests/`. Tier 3: `cd app && npx jest`.

---

## CI Pipeline: GitHub Actions

### `.github/workflows/tests.yml`

```yaml
name: Tests
on: [push, pull_request]

jobs:
  content-integrity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install pytest
      - run: python3 _tools/test_all.py --tier 1 --tier 2

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd app && npm ci && npx jest --ci --coverage
```

Note: `.github/` is currently in `.gitignore` — remove that line to enable CI.

---

## Test Count Projections

| Tier | Tests | Runtime |
|------|-------|---------|
| Tier 1 Content | ~5,000 | ~5s |
| Tier 2 Integrity | ~190 | ~10s |
| Tier 3 Mobile | ~40 | ~5s |
| **TOTAL** | **~5,230** | **~20s** |

---

## Scaling

When a new book goes live: `all_chapters` fixture auto-expands from `books.json`. Zero test files edited.

When a new scholar is added: `test_scholar_coverage` auto-validates from `scholar-scopes.json`.

When a new panel type is introduced: add to `KNOWN_PANEL_TYPES` in `helpers.py` (one line).
