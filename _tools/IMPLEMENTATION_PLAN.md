# ScriptureDeepDive — Code Review Implementation Plan

**Created:** March 20, 2026  
**Batches:** 7  
**Estimated total effort:** 6–8 sessions  
**Rule:** Every batch ends with `git push` and a working site. No batch depends on a future batch — you can stop after any batch and the site is better than before.

---

## Batch 1 — Housekeeping (No Code Changes)
**Risk: None | Effort: 15 min | SW bump: No**

This batch touches zero functional code. It cleans up build artifacts and dead files that should never have been committed.

### Tasks
1. Create `.gitignore`:
   ```
   __pycache__/
   *.pyc
   .DS_Store
   ```
2. Remove `_tools/__pycache__/` from the repo:
   ```bash
   git rm -r --cached _tools/__pycache__/
   ```
3. Move superseded files to `_tools/_archive/`:
   - `gen_deut_1.py` through `gen_deut_6.py` (superseded by `gen_deuteronomy.py`)
   - `inject_tx_db.py` (superseded by `build_chapter()`)
   - `build_chapters_js.py` (superseded by `rebuild_sw_js()`)
4. Commit: *"Housekeeping: add .gitignore, archive 8 dead files, remove __pycache__ from repo"*

### Verification
- `python3 _tools/audit.py` passes (archived files aren't imported by anything live)
- All gen scripts still run (they import from `shared`, not from archived files)

### What this fixes
- 756KB of `.pyc` files stop being committed
- 2,200 lines of dead code stop confusing future development
- New contributors see only the files that matter

---

## Batch 2 — Shared.py Documentation & Dead Code Removal
**Risk: Low | Effort: 1–2 hours | SW bump: No**

This batch improves readability and removes dead code from shared.py without changing any generated output.

### Tasks
1. **Add module-level docstring** to shared.py explaining:
   - Architecture overview (REGISTRY → gen scripts → build_chapter → page → HTML)
   - Data flow diagram
   - Key globals and what they do
   - Deploy checklist reference

2. **Add section separators** between logical groups:
   ```python
   # ══════════════════════════════════════════════════════════════
   #  PANEL BUILDERS — HTML generators for annotation panels
   # ══════════════════════════════════════════════════════════════
   ```
   Sections: Constants/Registry, Panel Builders, Auto-Scholarly, Page Assembly, Build/Deploy, Rebuild Functions

3. **Remove dead code from shared.py:**
   - Remove `QNAV_JS` and `QNAV_CTRL_JS` from `_bootstrap()` return and destructuring (line 33)
   - Remove the `qnav_overlay()` function (line 892–942) — it's explicitly warned against
   - Update `_bootstrap()` to only return `CSS, TOG_JS, SW_JS` (3 values, not 5)

4. **Add inline comments** to tricky areas:
   - `_auto_thread()` keyword matching logic
   - `_auto_src()` and `_auto_debate()` pattern selection
   - `rebuild_qnav_js()` function extraction fallback logic
   - `vhl_js()` button array system

5. **Fix `_QNAV_FUNCTIONS` SyntaxWarning:** Change `"""..."""` to `r"""..."""` (raw string)

6. Commit: *"Docs: module docstring, section separators, inline comments; remove QNAV_JS/QNAV_CTRL_JS/qnav_overlay dead code"*

### Verification
- `python3 -c "import sys; sys.path.insert(0,'_tools'); import shared"` — no errors, no warnings
- Triple audit passes
- Generated HTML is byte-identical (no functional changes)

### What this fixes
- shared.py goes from "wall of code" to navigable architecture
- 3 unused variables and 1 unused function removed
- SyntaxWarning eliminated

---

## Batch 3 — Extract CSS to External Stylesheet
**Risk: Medium | Effort: 2–3 hours | SW bump: Yes**

This is the biggest single improvement. It eliminates 18MB of CSS duplication, removes the fragile `_bootstrap()` Genesis-scraping pattern, and makes all future CSS changes single-file edits.

### Tasks
1. **Create `styles.css`** from current `CSS + EXTRA_CSS`:
   ```python
   # One-time extraction script
   with open('styles.css', 'w') as f:
       f.write(CSS + '\n' + EXTRA_CSS)
   ```

2. **Update `head()` in shared.py:**
   - Replace `<style>\n{CSS}\n{EXTRA_CSS}\n</style>` with `<link rel="stylesheet" href="../../styles.css">`
   - Remove `CSS` and `EXTRA_CSS` globals
   - Remove `_bootstrap()` function entirely
   - Define `TOG_JS` and `SW_JS` as simple string constants (they're 541 and 145 chars — just inline them)

3. **Regenerate all 439 chapters** (run each gen script):
   ```bash
   for script in gen_leviticus gen_numbers gen_deuteronomy gen_joshua gen_judges gen_1samuel gen_2samuel; do
       python3 _tools/${script}.py
   done
   # Genesis, Exodus, Ruth, Proverbs, Matthew, Mark, Luke, John, Acts
   # need their gen scripts run too
   ```

4. **Update `rebuild_sw_js()`** to include `styles.css` in the CORE cache list

5. **Update `rebuild_qnav_js()`** — the CSS extraction logic (lines 3208–3214) references the old inline CSS from qnav.js; verify it still works or simplify since CSS is now external

6. **Run full deploy cycle:**
   - `rebuild_qnav_js()`, `rebuild_books_js()`, `rebuild_sw_js()`, `update_homepage()`
   - Triple audit
   - Bump SW version

7. Commit: *"Extract CSS to external stylesheet; remove _bootstrap(); -18MB repo size; SW {version}"*

### Verification
- Open any chapter in browser — styling looks identical
- View source — `<link rel="stylesheet" href="../../styles.css">` present, no `<style>` block
- CSS changes in `styles.css` apply to all chapters without regen
- Triple audit passes
- `du -sh --exclude=.git .` shows ~41MB (down from 59MB)

### What this fixes
- Repo shrinks by ~18MB
- `_bootstrap()` eliminated — no more Genesis HTML scraping at import time
- CSS changes become instant (edit one file, push)
- `EXTRA_CSS` merged into canonical stylesheet — no more "patch on patch" accumulation
- Future book additions don't re-duplicate CSS

### Risks & Rollback
- If any chapter HTML has custom inline CSS overrides, they'd be lost. Audit for `<style>` remnants in HTML files before regen.
- Rollback: revert commit, re-run gen scripts with old shared.py

---

## Batch 4 — Extract Inline JS to External Files
**Risk: Low-Medium | Effort: 1–2 hours | SW bump: Yes**

Similar to Batch 3 but for the three inline JS blocks. Lower priority since they're only ~1.5KB combined vs 43KB for CSS, but completes the "no inline code" pattern.

### Tasks
1. **Create `tog.js`** — the `tog()` and `toggleAuth()` functions (currently `TOG_JS`, 541 chars)
2. **Create `history.js`** — the recent-chapters tracker (currently `HISTORY_JS`, 769 chars)
3. **Update `page()` in shared.py:**
   - Replace `_tog` string injection with `<script src="../../tog.js"></script>`
   - Replace `HISTORY_JS` injection with `<script src="../../history.js"></script>`
   - `SW_JS` (145 chars) can stay inline or become external — it's the service worker registration, loaded once
4. **Update `rebuild_sw_js()`** to include `tog.js` and `history.js` in CORE cache
5. **Regenerate all 439 chapters** (same as Batch 3)
6. **Remove `TOG_JS`, `SW_JS`, `HISTORY_JS` constants** from shared.py
7. Triple audit + SW bump + commit

### Verification
- `tog()` function works (click any panel button)
- `toggleAuth()` works (click any authorship disclosure)
- History tracking works (visit 3 chapters, check recent list on homepage)
- Service worker registers

### What this fixes
- Completes the "external resources" pattern — all shared code lives in shared files
- JS changes no longer require 439-file regen
- shared.py shrinks by ~1.5KB of string constants

---

## Batch 5 — Shared.py Refactor: Constants & Configuration
**Risk: Low | Effort: 1–2 hours | SW bump: No**

This batch consolidates scattered magic values without changing any output.

### Tasks
1. **Create `_tools/config.py`** — move all pure-data constants:
   - `COMMENTATOR_CSS` (22 color assignments)
   - `COMMENTATOR_META` (scholar display names, labels, bio slugs)
   - `COMMENTATOR_SCOPE` (which scholars apply to which books)
   - `BOOK_META` (per-book metadata: auth text, is_nt flag, etc.)
   - Button array canonicals (`DIVINE`, `PLACES`, `PEOPLE`, `TIME`, `KEY`)

2. **Update shared.py** to import from config.py:
   ```python
   from config import COMMENTATOR_CSS, COMMENTATOR_META, COMMENTATOR_SCOPE, BOOK_META
   ```

3. **Add comments to REGISTRY** explaining the tuple structure:
   ```python
   # REGISTRY: (book_dir, book_name, total_chapters, live_chapters, scholar_key, test_dir)
   ```

4. Commit: *"Refactor: extract constants to config.py; document REGISTRY structure"*

### Verification
- `python3 -c "import sys; sys.path.insert(0,'_tools'); import shared"` — imports cleanly
- Triple audit passes
- No HTML output changes

### What this fixes
- Data separated from logic — non-developers can safely edit scholar colors, book metadata
- REGISTRY structure documented for anyone reading the code
- shared.py shrinks by hundreds of lines of constant definitions

---

## Batch 6 — Performance: Lazy Loading & Cache Strategy
**Risk: Medium | Effort: 2–3 hours | SW bump: Yes**

This batch improves page load performance without changing the user experience.

### Tasks
1. **Lazy-load `chapters.js`:**
   - Currently loaded on every page via `<script src>` tag
   - Move load into `openQnav()` — only fetch when user opens search
   - Update `qnavFilter()` to handle the case where `CHAPTERS_ALL` hasn't loaded yet (show "Loading search..." briefly)

2. **Lazy-load full verse files in qnav:**
   - `loadAllVerses()` already loads verse files on search open — verify this works for search
   - Consider whether the per-page verse file (`verses/niv/ot/genesis.js`) is still needed for translation toggle, or if `fillVerses()` in translation.js can load ESV on-demand only

3. **Improve service worker cache strategy:**
   - Split CORE into `CORE_SHELL` (styles.css, qnav.js, translation.js, books.js, tog.js — ~10 files) and `CORE_CONTENT` (439 chapter HTML files)
   - Cache shell files on install; cache content files on first visit (runtime caching)
   - Use stale-while-revalidate for content files
   - Keep versioned cache for shell files only

4. **Remove non-live verse files from SW CORE list:**
   - Currently caching NIV + ESV verse files for all 66 books
   - Only cache the 16 live books' verse files
   - Non-live ESV files (50 books) stay in repo but aren't precached

5. Triple audit + SW bump + commit

### Verification
- First page load is noticeably faster (check Network tab)
- Search still works after opening qnav (chapters.js loads dynamically)
- ESV toggle still works
- Offline browsing works for visited chapters

### What this fixes
- Initial page payload drops from ~500KB+ to ~100KB
- Users don't precache 439 HTML files they may never visit
- Cache invalidation is surgical — style changes don't flush chapter cache

---

## Batch 7 — Testing & CI
**Risk: None | Effort: 1–2 hours | SW bump: No**

This batch adds automated safety nets.

### Tasks
1. **Create `.github/workflows/audit.yml`:**
   ```yaml
   on: [push, pull_request]
   jobs:
     audit:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-python@v5
           with: { python-version: '3.12' }
         - run: python3 _tools/audit.py
         - run: python3 _tools/audit_people.py
         - run: python3 _tools/audit_search.py
   ```

2. **Add regression tests** to `_tools/tests/`:
   - `test_qnav_functions.py` — verify qnav.js contains all 6 required functions after `rebuild_qnav_js()`
   - `test_verse_urls.py` — verify no verse file contains spaces in URL paths
   - `test_css_external.py` — verify no chapter HTML contains `<style>` blocks (after Batch 3)
   - `test_sw_version.py` — verify SW version incremented from previous commit

3. **Add audit section 19:** Verify `styles.css` exists and is referenced by all chapter HTML files (after Batch 3)

4. Commit: *"CI: GitHub Actions audit workflow; regression tests for qnav, verse URLs, external CSS"*

### Verification
- Push to GitHub, check Actions tab — green check
- Deliberately break something (e.g., remove a qnav function), push — red X

### What this fixes
- Regressions like the qnav function drop are caught automatically
- Every push is validated before it goes live
- New contributors can't accidentally break the build

---

## Batch Order & Dependencies

```
Batch 1 ─── Batch 2 ─┬─ Batch 3 ─── Batch 4 ─── Batch 6
(cleanup)   (docs)    │  (CSS ext)   (JS ext)    (perf)
                      │
                      ├─ Batch 5
                      │  (config)
                      │
                      └─ Batch 7
                         (CI/tests)
```

- **Batches 1 and 2** are independent prerequisites — do them first in any order
- **Batch 3** (CSS extraction) is the biggest win and unlocks Batch 4
- **Batch 4** (JS extraction) requires Batch 3 (since you're already regenerating all chapters)
- **Batch 5** (config extraction) can happen anytime after Batch 2
- **Batch 6** (performance) requires Batch 3 (external CSS must be in place for cache splitting)
- **Batch 7** (CI) can happen anytime but is most valuable after Batch 3

**Recommended order for maximum efficiency:**
Batch 1 → 2 → 3 → 4 (combine the regen) → 5 → 7 → 6

Note: Batches 3 and 4 should ideally be done in the same session since both require regenerating all 439 chapters. Do the CSS extraction first, update `page()` for external JS too, then run one single regen pass.

---

## Running Totals After Each Batch

| After Batch | Repo Size | shared.py Lines | Dead Files | Tests |
|-------------|-----------|-----------------|------------|-------|
| Current     | 59MB      | 3,446           | 9          | 0     |
| 1           | 58MB      | 3,446           | 0          | 0     |
| 2           | 58MB      | ~3,300          | 0          | 0     |
| 3           | ~41MB     | ~3,100          | 0          | 0     |
| 4           | ~41MB     | ~2,950          | 0          | 0     |
| 5           | ~41MB     | ~2,500          | 0          | 0     |
| 6           | ~41MB     | ~2,500          | 0          | 0     |
| 7           | ~41MB     | ~2,500          | 0          | 5+    |
