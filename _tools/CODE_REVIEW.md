# ScriptureDeepDive — Senior Code Review

**Date:** March 20, 2026  
**Reviewer:** Architecture & Performance Review  
**Scope:** Full codebase — 439 chapter HTML files, 3,446-line shared.py, 16 live books, ~59MB repo

---

## Executive Summary

The project is a functional, content-rich PWA with impressive scholarly depth. The build tooling works and the audit system catches real bugs. However, the codebase has accumulated significant technical debt through rapid iterative development. The three highest-impact issues are: **18MB of duplicated CSS** baked into every HTML file, **dead code** from superseded build approaches, and a **fragile bootstrap pattern** that scrapes Genesis HTML files at import time. Addressing these would cut the repo size by ~30%, eliminate an entire class of recurring bugs, and make the codebase maintainable for long-term growth toward 66 books.

---

## 1. DEAD CODE — Remove Immediately

### 1.1 `QNAV_JS` and `QNAV_CTRL_JS` (shared.py line 33)

**Status:** Assigned by `_bootstrap()` but never referenced anywhere after line 33.

These two variables are extracted from Genesis 2's inline scripts but are completely unused — qnav functionality moved to the external `qnav.js` file. They should be removed from the `_bootstrap()` return tuple and the destructuring assignment.

### 1.2 `qnav_overlay()` function (shared.py line 892)

**Status:** Defined but explicitly warned against in `page()` (line 1610: "never use qnav_overlay() inside page()").

This 50-line function generates a qnav HTML panel that is no longer used — the panel is now injected dynamically by `qnav.js`. Remove entirely.

### 1.3 `gen_deut_1.py` through `gen_deut_6.py` (6 files, 2,032 lines)

**Status:** Superseded by `gen_deuteronomy.py` (272 lines), which consolidates all 6 batch files.

These were the original partial generators. The consolidated `gen_deuteronomy.py` is the canonical version. The 6 partial files are dead weight. Move to an `_archive/` directory or delete.

### 1.4 `inject_tx_db.py` (90 lines)

**Status:** A surgical HTML injector for Textual Notes and Scholarly Debates panels. This was useful during the retrofit era but is now superseded by `build_chapter()` in shared.py, which generates these panels natively. Verify no current workflow calls it, then archive.

### 1.5 `build_chapters_js.py` (77 lines)

**Status:** Duplicated functionality. `rebuild_sw_js()` in shared.py already calls an internal chapters.js builder. This standalone script is the older version. Verify `rebuild_sw_js()` covers all functionality, then archive.

### 1.6 `_tools/__pycache__/` (756KB)

**Status:** Should be in `.gitignore` and never committed. Add `__pycache__/` to `.gitignore` and remove from the repo.

---

## 2. CSS ARCHITECTURE — The Biggest Win

### 2.1 The Problem: 43KB × 439 = 18MB of Duplication

Every chapter HTML file contains the **full CSS** inline in a `<style>` block — 22KB of base CSS (scraped from Genesis 1 at import time) plus 20KB of `EXTRA_CSS` (patches accumulated over time). This means:

- **18MB** of identical CSS across 439 files in the repo
- Every `git push` with style changes touches 439 files
- The `_bootstrap()` function scrapes Genesis 1 + 2 HTML at Python import time, creating a fragile dependency where CSS correctness depends on the state of two specific chapter files

### 2.2 The Fix: External Stylesheet

Extract all CSS to a single `styles.css` file and replace the inline `<style>` block with a `<link>` tag. This would:

- **Reduce repo size by ~18MB** (from 59MB to ~41MB)
- Eliminate the `_bootstrap()` scraping pattern entirely
- Make CSS changes a single-file edit instead of regenerating 439 HTML files
- Enable browser caching — users download CSS once, not per-page
- Eliminate `EXTRA_CSS` — all rules live in one canonical file

**Migration path:**
1. Create `styles.css` from `CSS + EXTRA_CSS`
2. Update `head()` in shared.py to emit `<link rel="stylesheet" href="../../styles.css">` instead of `<style>{CSS}{EXTRA_CSS}</style>`
3. Regenerate all chapters (can be done incrementally as books are rebuilt)
4. Remove `_bootstrap()`, `CSS`, `EXTRA_CSS` globals

### 2.3 Inline JS Blocks (TOG_JS, SW_JS, HISTORY_JS)

Similarly, `TOG_JS` (541 chars), `SW_JS` (145 chars), and `HISTORY_JS` (769 chars) are baked into every page. These are small enough that the duplication isn't a storage issue, but they create the same maintenance problem — a change requires regenerating all 439 files. Consider moving them to external JS files loaded alongside `qnav.js` and `translation.js`.

---

## 3. `_bootstrap()` — Fragile Architecture

### 3.1 The Problem

The `_bootstrap()` function (lines 7–33) runs at **Python import time** and scrapes CSS from `Genesis_1.html` and JS from `Genesis_2.html` using string slicing (`g1.find('<style>') + 7`). This means:

- If Genesis 1 or 2 HTML is corrupted or missing, **all of shared.py fails to import**
- If a new CSS rule is added to Genesis 1 manually, it might get stripped by the `EXTRA_CSS` marker logic
- The CSS source of truth is a generated output file, not a source file — a circular dependency
- The comment at line 10 literally says "Genesis 2 has the full qnav control script... which Genesis 1 lost when rebuilt" — this is a red flag that the architecture is already causing data loss

### 3.2 The Fix

After extracting CSS to `styles.css` (section 2.2), `_bootstrap()` becomes unnecessary. The `TOG_JS`, `SW_JS`, and `HISTORY_JS` constants can be defined as simple string literals in shared.py (they're already small and stable). This eliminates the Genesis HTML dependency entirely.

---

## 4. SHARED.PY — Code Quality

### 4.1 Size and Commenting

At **3,446 lines**, shared.py is the entire build system. It has good function-level docstrings but lacks:

- **Module-level architecture doc:** No explanation of the data flow (REGISTRY → generators → build_chapter → page → HTML)
- **Section separators:** The file jumps from panel helpers to auto-scholarly to build_chapter to homepage with no visual grouping
- **Inline comments on tricky logic:** Functions like `_auto_thread()`, `_auto_src()`, `_auto_debate()` have complex keyword matching with magic strings but minimal explanation of why specific patterns were chosen

**Recommendation:** Add a module docstring at the top describing the architecture, and consider splitting into logical modules: `shared/registry.py`, `shared/panels.py`, `shared/auto_scholarly.py`, `shared/builders.py`, `shared/deploy.py`.

### 4.2 `_QNAV_FUNCTIONS` as Raw String

The canonical qnav functions are now stored as a Python raw string (`_QNAV_FUNCTIONS`) containing JavaScript. This works but has a SyntaxWarning for invalid escape sequences (`\s`, `\\` inside the JS regex patterns). Use `r"""..."""` (raw string) to silence this, or better yet, store the canonical functions in a separate `.js` file and read it at build time.

### 4.3 `EXTRA_CSS` Growing Unbounded

`EXTRA_CSS` is 20KB and growing. Every new feature (commentator colors, MacArthur panels, timeline visuals, POI entries) appends CSS rules to this block. The name "EXTRA" implies temporary patches, but it now exceeds the original CSS. Merge everything into a single canonical stylesheet.

### 4.4 Magic Numbers and String Constants

Commentator colors, button arrays, panel IDs, and CSS class names are defined as string literals scattered across multiple functions. Consider consolidating into a `CONSTANTS` section at the top of the file or a `config.py`.

---

## 5. PERFORMANCE IMPROVEMENTS

### 5.1 Verse File Loading (Current: Eager, Propose: Lazy)

Currently, each chapter page loads `../../verses/niv/{book}.js` at page load — the entire book's verses (Genesis = 1,533 verses = 368KB). The user only needs the current chapter's ~30 verses for display. The full book is needed only for qnav search.

**Proposal:** Split verse files into per-chapter files (`genesis_1.js`, `genesis_2.js`, etc.) loaded on demand. The full-book file is loaded lazily when the user opens the search panel (`loadAllVerses()`). This would reduce initial page load from ~370KB to ~10KB for verse data.

### 5.2 Service Worker Cache Strategy

The current `service-worker.js` caches a CORE list of 439+ files. Every SW version bump invalidates the entire cache. Consider:

- **Cache versioning per book:** `scripture-genesis-v5`, `scripture-exodus-v3` — only invalidate the book that changed
- **Runtime caching:** Cache chapter HTML on first visit instead of precaching all 439 pages
- **Stale-while-revalidate:** Serve from cache immediately, update in background

### 5.3 `chapters.js` Size (184KB)

This file contains all 439 chapter titles and context snippets for search. It's loaded on every page but only used when the user opens the search overlay. Consider lazy-loading it inside `loadAllVerses()` or on qnav open.

---

## 6. VERSE FILE ARCHITECTURE

### 6.1 Dual Verse Files (NIV + ESV for all 66 books)

The repo contains NIV and ESV verse files for all 66 books of the Bible — even though only 16 books are currently live. The non-live verse files (50 books × 2 translations = 100 files, ~15MB) are carried in every clone but never served.

**Recommendation:** This is acceptable as "pre-built infrastructure" for future books, but document this clearly. Consider a `.gitattributes` rule to mark them as binary/LFS candidates if repo size becomes an issue.

### 6.2 `rebuild_verses_js()` Regex Fix

The recent fix changed `re.DOTALL` to no flag on the JSON extraction regex. This works because the JSON is on line 1, but it's fragile — if a verse file ever has a newline in the JSON (e.g., from a manual edit), it would silently fail. Add a comment explaining this constraint, or use a more robust extraction method (read line 1 only, strip the `var X=` prefix, strip the trailing `;`).

---

## 7. TESTING

### 7.1 Current State

- **3 audit scripts** (`audit.py`, `audit_people.py`, `audit_search.py`) — excellent coverage of structural integrity
- **1 Playwright config** (`_tools/playwright.config.js`) + **1 test file** (`_tools/tests/ui.spec.js`) — UI test infrastructure exists but coverage is unknown

### 7.2 Gaps

- **No unit tests for shared.py functions** — `build_chapter()`, `auto_scholarly()`, the panel builders, and `rebuild_*` functions are untested except through the audit scripts
- **No ESV toggle regression test** — the bug we just fixed (qnav functions dropped silently) would have been caught by a test that opens a chapter, clicks ESV, and verifies verse text changes
- **No CI/CD pipeline** — builds and deploys are manual. A GitHub Actions workflow that runs the 3 audits on every push would catch regressions immediately

---

## 8. FUTURE ARCHITECTURE RECOMMENDATIONS

### 8.1 Template Engine

Currently, `page()` builds HTML by string concatenation. As the project grows toward 66 books, consider using Jinja2 templates. This would:

- Separate HTML structure from Python logic
- Make CSS/JS changes possible without touching shared.py
- Enable theming and A/B testing of layouts
- Make the build process more auditable

### 8.2 Configuration File

Move all book-specific metadata (REGISTRY, BOOK_META, COMMENTATOR_SCOPE, COMMENTATOR_META, COMMENTATOR_CSS, PEOPLE_BIO, TIMELINE_DATA) into a `config.yaml` or `config.json`. This separates data from code and makes it easier for non-developers to contribute content.

### 8.3 Incremental Builds

Currently, adding a new book requires regenerating ALL qnav files, ALL chapter grids on the homepage, and bumping the global SW version. Consider:

- **Manifest-based builds:** A `manifest.json` tracks which books/chapters are at which version. The build system only regenerates what changed.
- **Per-book SW versions:** Each book has its own cache key, so deploying 1 Kings doesn't invalidate the Genesis cache.

### 8.4 Content-Addressed Verse Files

Instead of `verses/niv/ot/genesis.js`, use content-hashed filenames like `genesis.a3f8c2.js`. This enables aggressive cache-forever headers and eliminates the need for SW version bumps on verse corrections.

---

## 9. PRIORITY MATRIX

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Remove dead code (§1) | 1 hour | Reduces confusion, removes ~2K lines |
| **P0** | Add `__pycache__/` to .gitignore | 5 min | Stops committing build artifacts |
| **P1** | Extract CSS to external stylesheet (§2) | 4 hours | -18MB repo, eliminates bootstrap fragility |
| **P1** | Add module docstring + section separators to shared.py | 2 hours | Massive readability improvement |
| **P2** | Add GitHub Actions CI for audits | 1 hour | Catches regressions automatically |
| **P2** | Lazy-load verse files (§5.1) | 3 hours | Faster page loads |
| **P3** | Split shared.py into modules | 4 hours | Better maintainability |
| **P3** | Jinja2 templates (§8.1) | 8 hours | Better separation of concerns |
| **P3** | Per-book cache versioning (§5.2) | 3 hours | Smaller cache invalidations |

---

## 10. FILES TO DELETE OR ARCHIVE

| File | Action | Reason |
|------|--------|--------|
| `_tools/gen_deut_1.py` | Archive | Superseded by gen_deuteronomy.py |
| `_tools/gen_deut_2.py` | Archive | Superseded |
| `_tools/gen_deut_3.py` | Archive | Superseded |
| `_tools/gen_deut_4.py` | Archive | Superseded |
| `_tools/gen_deut_5.py` | Archive | Superseded |
| `_tools/gen_deut_6.py` | Archive | Superseded |
| `_tools/inject_tx_db.py` | Archive | Superseded by build_chapter() |
| `_tools/build_chapters_js.py` | Archive | Duplicated in rebuild_sw_js() |
| `_tools/__pycache__/` | Delete + gitignore | Build artifact, never committed |
| `_tools/playwright.config.js` | Keep (if tests used) | Audit test coverage first |

---

*End of review.*
