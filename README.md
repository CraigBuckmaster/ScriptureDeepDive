# Scripture Deep Dive

A verse-by-verse Bible study PWA with Hebrew/Greek word studies, historical context, scholarly commentary, and interactive tools.

**Live:** [craigbuckmaster.github.io/ScriptureDeepDive](https://craigbuckmaster.github.io/ScriptureDeepDive/)

## Current Status

- **584 chapters** across **23 books** (18 OT, 5 NT)
- **28 scholars** with per-book scope (MacArthur, Calvin, Sarna, Alter, Jobes, Levenson, etc.)
- **NIV + ESV** verse text with toggle
- Offline-capable PWA with service worker

## Architecture

### Content Pipeline

Chapters are built by ephemeral Python generators (live in `/tmp/`, never committed):

```
/tmp/gen_{book}_b{n}.py  →  build_chapter()  →  ot/{book}/{Book}_{ch}.html
                                ↓
                          _tools/shared.py (template engine)
                          _tools/config.py (COMMENTATOR_SCOPE, BOOK_META, SCHOLAR_REGISTRY)
```

### Key Files

| File | Purpose |
|------|---------|
| `_tools/shared.py` | Build system: `build_chapter()`, `rebuild_*()` functions |
| `_tools/config.py` | Data constants: scholar scopes, book metadata, scholar registry |
| `_tools/audit.py` | 22-section structural audit (runs in CI) |
| `service-worker.js` | SHELL (43 infra files) + PRECACHE (701 content files) |
| `js/core/books.js` | Book registry for nav-arrows and qnav |
| `js/core/qnav.js` | Chapter picker overlay with verse search |
| `js/core/nav-arrows.js` | Prev/next chapter navigation + SW auto-reload |
| `js/features/feature-loader.js` | 4-phase progressive loader for chapter features |

### Interactive Tools

| Tool | File(s) | Description |
|------|---------|-------------|
| Timeline | `timeline.html`, `timeline-data.js` | Interactive SVG with events, people, world history |
| People | `people.html`, `people-data.js` | 211-person biographical tree |
| Word Study | `word-study.html`, `data/word-study.js` | Hebrew/Greek vocabulary explorer |
| Parallel Passages | `synoptic.html`, `data/synoptic-map.js` | Synoptic comparison tool |
| Cross References | `data/cross-refs.js`, `cross-ref-engine.js` | Intertextual linking |
| Map | `map.html` | Bible world geography |

### Adding a New Book

1. Add to REGISTRY in `_tools/shared.py`
2. Add BOOK_PREFIX, BOOK_META, COMMENTATOR_SCOPE entries
3. Add to BOOK_ROSTER + OT/NT_BOOKS in `_tools/audit.py`
4. Create intro page in `intro/{book}.html`
5. Build chapters via ephemeral `/tmp/` generators
6. Run: `rebuild_homepage()`, `rebuild_qnav_js()`, `rebuild_books_js()`, `rebuild_verses_js()`, `rebuild_sw_js()`
7. Run: `python3 _tools/audit.py` (0 failures)
8. Delete generators, commit, push

### Adding a New Scholar

1. Add entry to `SCHOLAR_REGISTRY` in `_tools/config.py`
2. Add scope to `COMMENTATOR_SCOPE` in `_tools/config.py`
3. Add CSS in `styles.css` (`.anno-trigger.{key}`)
4. Add bio page `commentators/{key}.html`
5. Add entry to `commentators/scholar-data.js`

No changes to `shared.py` needed — the scholar loop is data-driven.

## Development

```bash
# Run all checks
python3 _tools/audit.py                    # 22-section structural audit
python3 _tools/tests/test_regressions.py   # 25 regression tests
node _tools/tests/test_verse_resolver.js   # 66 verse resolver tests
```

## Service Worker

- **SHELL** (43 files): Infrastructure cached on install
- **PRECACHE** (701 files): Chapters + verses cached on install for offline reading
- `skipWaiting()` + `clients.claim()` for immediate activation
- Pages auto-reload via `controllerchange` listener when new SW takes control
