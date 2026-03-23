# Phase 0: Data Migration — Implementation Plan

## Overview

**Goal:** Extract ALL content from HTML/JS into structured JSON, build a SQLite database, and archive the PWA. This is a one-time, irreversible migration.

**Scope:**
- 879 chapter HTML files → 879 chapter JSON files (the hard part)
- 12 JS data files → 12 JSON files (trivial wrappers)
- 3 HTML files with inline data → 4 JSON files (custom parsers)
- 43 scholar bio HTML files → 1 JSON file (custom parser)
- 3 Python config dicts → 3 JSON files (export script)
- All of the above → 1 SQLite database (build script)

**Estimated tool calls per batch:** Kept under 15 to stay within context limits.

**What NOT to extract:** Verse text. It already exists as structured JSON in `verses/niv/ot/*.js` and `verses/esv/ot/*.js` (66 files per translation). These just need their `var X = ` wrappers stripped.

---

## Batch 0A: Build the Chapter HTML→JSON Extractor
*The most complex piece. Build the tool, test on 3 books, iterate.*

### What the extractor must parse from each chapter HTML

**Section-level data** (repeats per section, identified by `<div class="section">` blocks):

| Panel | CSS identifier | Internal structure |
|-------|---------------|-------------------|
| Hebrew/Greek | `id="{cid}-s{n}-grk"` class `heb-text-panel` | `<div class="hebrew-word">` blocks with `<span class="hw">` (word), `<span class="tlit">` (transliteration), `<span class="hgloss">` (gloss), `<p>` (paragraph) |
| Historical Context | `id="{cid}-s{n}-hist"` class `hist` | `<h4>` title + `<p>` paragraph(s) |
| Context | `id="{cid}-s{n}-ctx"` class `ctx` | `<h4>` title + `<p>` paragraph(s) |
| Cross-Reference | `id="{cid}-s{n}-cross"` class `cross-ref` | `<ul class="cross-ref-list">` → `<li>` items with `<span class="ref-cite">` + `<span class="ref-text">` |
| Commentary (any scholar) | `id="{cid}-s{n}-{key}"` class `com-panel com-{key}` | `<h4>` title + `<div class="com-source">` + multiple `<div class="com-note">` each with `<span class="com-ref">` + `<p>` |
| Places | `id="{cid}-s{n}-poi"` class `poi-panel` | `<div class="poi-grid">` → `<div class="poi-card">` entries |
| Timeline | `id="{cid}-s{n}-tl"` class `tl-panel` | Custom timeline HTML with events |

**Chapter-level panels** (one per chapter, identified by `id="{cid}-{type}"` without `-s{n}-`):

| Panel | CSS class | Internal structure |
|-------|-----------|-------------------|
| People | `ppl-panel` | `<div class="person-grid">` → `<div class="person-card">` with person-name, person-role, person-text |
| Translation | `trans-panel` | `<table class="trans-table">` with verse label rows + translation rows (t-label + text) |
| Sources | `src-panel` | `<div class="source-block">` with source-title, source-quote, source-note |
| Reception | `rec-panel` | `<div class="source-block">` with source-title, source-quote, source-note |
| Literary | `lit-panel` | `<div class="lit-row">` with lit-label + lit-text. Optional lit-key class. |
| Hebrew Reading | `heb-text-panel` (chapter-level) | Raw styled `<p>` with verse-num sups and Hebrew spans |
| Threading | `thread-panel` | `<div class="thread-item">` with thread-header (anchor, arrow, target, type) + thread-text |
| Textual | `tx-panel` | `<div class="tx-item">` blocks |
| Debate | `db-panel` | `<div class="debate-item">` blocks |
| Themes | `themes-panel` | SVG radar chart (extract scores from polygon points math) + `<p>` note |

**VHL groups** (at bottom of each HTML, inside an IIFE):

Pattern:
```javascript
(function() {
  'use strict';
  var DIVINE={words:['LORD','God','Almighty',...],cls:'vhl-divine',btn:['hebrew','hebrew-text','context']};
  var PLACES={words:['Jerusalem','Zion',...],cls:'vhl-place',btn:['places','context']};
  var PEOPLE={words:['Abraham','Moses',...],cls:'vhl-person',btn:['people','context']};
  var TIME  ={words:['day','days',...],cls:'vhl-time',btn:['timeline','context']};
  var KEY   ={words:['covenant','blessing',...],cls:'vhl-key',btn:['literary','cross']};
  initVHL([DIVINE,PLACES,PEOPLE,TIME,KEY]);
})();
```

### Prompt for Batch 0A

```
Phase 0A: Build _tools/extract_to_json.py — the chapter HTML→JSON extractor.

READ the React Native plan Phase 0 at _tools/REACT_NATIVE_PLAN.md and the
implementation plan at _tools/PHASE_0_PLAN.md (Batch 0A section) for the
full panel-by-panel extraction spec.

Build a Python script `_tools/extract_to_json.py` with a function
`extract_chapter(html_path) → dict` that:

1. Parses a chapter HTML file with BeautifulSoup
2. Extracts the chapter ID (e.g., "gen1"), book dir, chapter number, title
3. For EACH section div, extracts:
   - header text
   - verse_start and verse_end (from the header text pattern "Verses X–Y")
   - ALL section-level panels by ID pattern {cid}-s{n}-{type}:
     * heb/grk: Hebrew word entries (word, tlit, gloss, text)
     * hist: paragraph text
     * ctx: paragraph text
     * cross: list of (ref, note) tuples
     * com-{scholar}: list of (ref, note) tuples per commentary
     * poi: place entries
     * tl: timeline entries
4. Extracts ALL chapter-level panels by ID pattern {cid}-{type}:
   - ppl, trans, src, rec, lit, hebtext, thread, tx (textual), debate, themes
5. Extracts VHL groups from the IIFE block at the bottom of the file
6. Returns a dict matching the JSON schema in the React Native plan

Include a `extract_all(output_dir)` function that walks ot/ and nt/,
extracts every chapter, and writes JSON to content/{book}/{ch}.json.

Include a `validate_extraction(html_path, json_path)` function that
loads both, compares section counts, panel type counts, and verse ranges.

Test on 3 diverse chapters:
- ot/genesis/Genesis_1.html (fully enriched, 18 buttons, 5 sections)
- ot/isaiah/Isaiah_6.html (enriched batch 1, 15 buttons, 2 sections)
- ot/isaiah/Isaiah_50.html (unenriched, 7 buttons, 2 sections)

Print a summary showing panels found vs expected for each test chapter.
Do NOT run on all 879 yet — just build and test the tool.
```

---

## Batch 0B: Run Extractor on All 879 Chapters + Fix Issues
*Run the tool, assess failures, fix, re-run.*

### Prompt for Batch 0B

```
Phase 0B: Run extract_to_json.py on ALL 879 chapters. Fix any extraction
failures.

READ _tools/PHASE_0_PLAN.md (Batch 0B section).

1. Run `extract_all('content/')` on all 879 chapter HTML files
2. Print a summary: total chapters processed, total panels extracted,
   any failures or warnings
3. Run validation on every output:
   - Section count matches between HTML and JSON
   - No empty panel content (content_json is not empty string or null)
   - Verse ranges are contiguous within each section
   - Every chapter has at least: title, 2+ sections, heb panels
4. Print a failure report: which chapters failed and why
5. Fix any systematic extraction bugs
6. Re-run until 0 failures

Commit the content/ directory with all JSON files.
Do NOT build SQLite yet — that's Batch 0F.
```

---

## Batch 0C: Convert JS Data Files to JSON
*Trivial wrappers. 12 files, all the same pattern.*

### Files to convert

| # | Source | Target | Wrapper to strip |
|---|--------|--------|-----------------|
| 1 | `data/book-intros.js` (233KB) | `content/meta/book-intros.json` | `window.BOOK_INTROS = [` ... `];` |
| 2 | `js/pages/people-data.js` (196KB) | `content/meta/people.json` | `window.PEOPLE_DATA=[` or similar |
| 3 | `js/pages/timeline-data.js` (75KB) | `content/meta/timelines.json` | Multiple: `const ERA_HEX = {`, `const ERA_NAMES = {`, event arrays |
| 4 | `data/cross-refs.js` (17KB) | `content/meta/cross-refs.json` | `window.CROSS_REF_DATA = [` |
| 5 | `data/word-study.js` (18KB) | `content/meta/word-studies.json` | `window.WORD_STUDY_DATA = [` |
| 6 | `data/synoptic-map.js` (10KB) | `content/meta/synoptic.json` | `window.SYNOPTIC_MAP = [` |
| 7 | `commentators/scholar-data.js` (21KB) | `content/meta/scholar-data.json` | `window.SCHOLAR_DATA = [` |
| 8-11 | `verses/niv/ot/*.js` (39 files) | `content/verses/niv/{book}.json` | `var VERSES_GENESIS=[` etc. |
| 8-11 | `verses/niv/nt/*.js` (27 files) | `content/verses/niv/{book}.json` | Same pattern |
| 8-11 | `verses/esv/ot/*.js` (39 files) | `content/verses/esv/{book}.json` | Same pattern |
| 8-11 | `verses/esv/nt/*.js` (27 files) | `content/verses/esv/{book}.json` | Same pattern |

**Note:** The JS files use bare JS object notation (unquoted keys, single quotes). They're NOT valid JSON. Strategy: use a regex to add quotes around keys, or use `demjson3`, or use Node.js `eval()` in a subprocess, or manually handle with Python regex.

### Prompt for Batch 0C

```
Phase 0C: Convert all JS data files to JSON.

READ _tools/PHASE_0_PLAN.md (Batch 0C section) for the full file list.

Write _tools/convert_js_to_json.py that:

1. Converts each JS data file to clean JSON:
   - data/book-intros.js → content/meta/book-intros.json
   - js/pages/people-data.js → content/meta/people.json
   - js/pages/timeline-data.js → content/meta/timelines.json
   - data/cross-refs.js → content/meta/cross-refs.json
   - data/word-study.js → content/meta/word-studies.json
   - data/synoptic-map.js → content/meta/synoptic.json
   - commentators/scholar-data.js → content/meta/scholar-data.json

2. Converts all verse files (132 files across niv/esv × ot/nt):
   - verses/niv/ot/*.js → content/verses/niv/{book}.json
   - verses/niv/nt/*.js → content/verses/niv/{book}.json
   - verses/esv/ot/*.js → content/verses/esv/{book}.json
   - verses/esv/nt/*.js → content/verses/esv/{book}.json

The JS files use bare object notation (unquoted keys, single quotes).
They are NOT valid JSON. Use a strategy that handles this:
- Strip the var/const/window.X = wrapper
- Strip trailing semicolons
- Use Node.js subprocess: `node -e "process.stdout.write(JSON.stringify(eval('(' + input + ')')))"` 
  OR use Python regex to quote keys and convert single quotes
  OR use the demjson3 library

3. Validate each output: load as JSON, check it's an array/object, print
   entry counts.

4. Print summary: files converted, total entries, any failures.

Commit all output to content/meta/ and content/verses/.
```

---

## Batch 0D: Extract Inline HTML Data (Map, People, Scholar Bios)
*Custom parsers for data embedded inside HTML files, not in separate JS.*

### What to extract

**map.html (94KB):**
- `const PLACES = [...]` — 60+ place objects inline in a `<script>` block
- `const STORIES = [...]` — 15+ story objects inline in the same block
- `const ERA_HEX = {...}` — era color mapping
- `const ERA_NAMES = {...}` — era display names

**people.html (32KB):**
- `const ERA_COLORS = {...}` — era colors for tree rendering
- `const PEOPLE_ERA_NAMES = {...}` — era display names
- `function buildHierarchy()` — logic that determines spine nodes (we extract the RESULT, not the function)

**commentators/*.html (43 files, ~9KB each):**
- Bio name (`<h1 class="bio-name">`)
- Eyebrow text (`<p class="bio-eyebrow">`)
- Tradition (`<p class="bio-tradition">`)
- Section titles + body text (`<h2 class="bio-section-title">` + following `<p>` tags)

### Prompt for Batch 0D

```
Phase 0D: Extract inline data from map.html, people.html, and 43
scholar bio HTML files.

READ _tools/PHASE_0_PLAN.md (Batch 0D section) for exact extraction targets.

Write _tools/extract_inline_data.py that:

1. EXTRACT FROM map.html:
   - Parse the <script> block containing PLACES and STORIES arrays
   - The arrays use JS object notation (unquoted keys, single quotes)
   - Extract PLACES → content/meta/places.json (array of place objects)
   - Extract STORIES → content/meta/map-stories.json (array of story objects)
   - Extract ERA_HEX and ERA_NAMES from map.html → include in map-stories.json
     as top-level keys
   - Validate: print place count, story count, verify all places have lat/lon

2. EXTRACT FROM people.html:
   - Parse ERA_COLORS and PEOPLE_ERA_NAMES from the <script> block
   - Determine spine nodes: run the buildHierarchy() logic in Python
     (a person is "spine" if they're in the direct Adam→Jesus lineage —
     check father chains) OR extract the spine list from the function
   - Write content/meta/genealogy-config.json with:
     { "era_colors": {...}, "era_names": {...}, "spine_ids": [...] }
   - Validate: print era count, spine node count

3. EXTRACT FROM commentators/*.html (43 files):
   - For each file, parse with BeautifulSoup:
     * window.CURRENT_SCHOLAR value (the scholar key)
     * <h1 class="bio-name"> → name
     * <p class="bio-eyebrow"> → eyebrow
     * <p class="bio-tradition"> → tradition
     * All <h2 class="bio-section-title"> + following <p> siblings → sections[]
   - Write content/meta/scholar-bios.json as an object keyed by scholar ID
   - Validate: print scholar count, verify all 43 have name + at least 1 section

Commit all outputs.
```

---

## Batch 0E: Export Python Config to JSON
*Three dicts from config.py need to become JSON files.*

### Prompt for Batch 0E

```
Phase 0E: Export Python config dictionaries to JSON.

READ _tools/PHASE_0_PLAN.md (Batch 0E section).

Write _tools/export_config.py that:

1. Import from _tools/config.py:
   - SCHOLAR_REGISTRY (43 entries) → content/meta/scholars.json
   - COMMENTATOR_SCOPE (43 entries) → content/meta/scholar-scopes.json
   - BOOK_META → content/meta/books.json

2. Import from _tools/shared.py:
   - REGISTRY (book list with live chapter counts) → merge into books.json

3. scholars.json format: array of objects, each with:
   { "id": "macarthur", "name": "John MacArthur", "label": "MacArthur",
     "tradition": "Evangelical", "color": "#9e3a3a", ... }
   Merge with scholar-data.json from Batch 0C (which has color, scope text,
   desc) and scholar-bios.json from Batch 0D (which has bio sections).
   Result: ONE comprehensive scholars.json with all data per scholar.

4. books.json format: array of objects, each with:
   { "id": "genesis", "name": "Genesis", "testament": "ot",
     "total_chapters": 50, "book_order": 1, "is_live": true,
     "prefix": "gen", "directory": "genesis" }

5. scholar-scopes.json format: object keyed by scholar ID:
   { "macarthur": "all", "sarna": ["genesis","exodus"], ... }

Print summary. Commit.
```

---

## Batch 0F: Build SQLite Schema + build_sqlite.py
*Create the database builder that assembles all JSON into one .db file.*

### Prompt for Batch 0F

```
Phase 0F: Build _tools/build_sqlite.py — the JSON→SQLite assembler.

READ the full SQLite schema from _tools/REACT_NATIVE_PLAN.md Phase 0.5.
READ _tools/PHASE_0_PLAN.md (Batch 0F section).

Write _tools/build_sqlite.py that:

1. Creates scripture.db with the full schema from the React Native plan
   (all tables: books, chapters, sections, section_panels, chapter_panels,
   verses, book_intros, people, scholars, places, map_stories, word_studies,
   synoptic_map, vhl_groups, genealogy_config, verses_fts, people_fts,
   user tables)

2. Populates from content/ JSON files:
   - content/meta/books.json → books table
   - content/{book}/{ch}.json → chapters, sections, section_panels,
     chapter_panels, vhl_groups tables
   - content/verses/niv/{book}.json + esv → verses table
   - content/meta/book-intros.json → book_intros table
   - content/meta/people.json → people table
   - content/meta/scholars.json → scholars table (merged with bios + scopes)
   - content/meta/places.json → places table
   - content/meta/map-stories.json → map_stories table
   - content/meta/word-studies.json → word_studies table
   - content/meta/synoptic.json → synoptic_map table
   - content/meta/genealogy-config.json → genealogy_config table

3. Builds FTS5 indexes for verses and people

4. Prints comprehensive stats:
   - Row counts per table
   - Database file size
   - Sample queries: "SELECT * FROM sections WHERE chapter_id='genesis_1'"
     to verify data integrity

Do NOT populate user tables (user_notes, reading_progress, bookmarks,
user_preferences) — those are created empty.

Run build_sqlite.py and commit scripture.db.
```

---

## Batch 0G: Validate the SQLite Database
*Comprehensive integrity checks before we trust this as the source of truth.*

### Prompt for Batch 0G

```
Phase 0G: Validate the SQLite database with comprehensive integrity checks.

READ _tools/PHASE_0_PLAN.md (Batch 0G section).

Write _tools/validate_sqlite.py that runs these checks against scripture.db:

1. COMPLETENESS:
   - 30 books with is_live=1, 36 with is_live=0
   - 879 chapters total across live books
   - Every chapter has 2+ sections
   - Every section has at least a 'heb' panel in section_panels
   - Every chapter has at least 'lit' and 'themes' in chapter_panels
   - Verse counts per book match known totals (Gen=1533, Ps=2461, etc.)
   - 211 people entries
   - 43 scholar entries
   - 60+ places
   - 15+ map stories
   - 879 VHL group sets (one per chapter)

2. REFERENTIAL INTEGRITY:
   - Every chapter.book_id exists in books
   - Every section.chapter_id exists in chapters
   - Every section_panel.section_id exists in sections
   - Every chapter_panel.chapter_id exists in chapters
   - Every vhl_groups.chapter_id exists in chapters

3. CONTENT QUALITY:
   - No section_panels with empty content_json
   - No chapter_panels with empty content_json
   - JSON in content_json columns is valid (json_valid() in SQLite)
   - People with father/mother references point to existing people IDs
   - Scholar scope references point to existing book IDs

4. FTS5 SEARCH:
   - Search "In the beginning" → returns Genesis 1:1
   - Search "Abraham" in people → returns abraham entry
   - Search "covenant" → returns multiple verse matches

5. CROSS-BOOK SPOT CHECKS (compare JSON source to DB):
   - Genesis 1 section count matches
   - Psalms 23 panel types match
   - Isaiah 6 scholar panels present (oswalt, childs)
   - Daniel 1 scholar panels present (collins, longman, goldingay)
   - Matthew 1 section panels present

Print PASS/FAIL for each check. Print overall summary.
Commit the validation script.
```

---

## Batch 0H: Archive the PWA + Write save_chapter()
*Tag the HTML era as done. Write the new authoring function.*

### Prompt for Batch 0H

```
Phase 0H: Archive the PWA and write the new authoring pipeline.

READ _tools/PHASE_0_PLAN.md (Batch 0H section).
READ _tools/REACT_NATIVE_PLAN.md Phase 1 for save_chapter() spec.

1. ARCHIVE THE PWA:
   - git tag pwa-final -m "Final PWA state before React Native migration"
   - Create _archive/ directory
   - Move these to _archive/: ot/, nt/, index.html, people.html, map.html,
     intro/, commentators/, css/, js/, data/, verses/, service-worker.js,
     manifest.json, assets/ (keep icon PNGs in a new location for the app)
   - Keep in root: _tools/, content/, scripture.db, .git
   - Update .gitignore if needed
   - Commit: "Archive PWA — content/ and scripture.db are now source of truth"

2. WRITE save_chapter():
   Modify _tools/shared.py:
   - Add a new function save_chapter(book_dir, ch, data) that:
     a. Validates required keys (title, sections with 2+ entries)
     b. Validates each section has header, verses, heb
     c. Auto-generates chapter-level panels if missing (same auto_*
        logic from the existing build_chapter, but outputting dicts
        instead of HTML strings):
        - auto_people → ppl
        - auto_translations → trans
        - auto_sources → src
        - auto_reception → rec
        - auto_literary → lit (from data['lit'])
        - auto_hebtext → hebtext (from data['hebtext'])
        - auto_threading → thread
        - auto_themes → themes (from data['themes'])
     d. Writes JSON to content/{book_dir}/{ch}.json
     e. Prints confirmation

   - Add rebuild_sqlite() function that calls build_sqlite.py as subprocess

   - Keep verse_range() and all helper functions that generator scripts use
   - REMOVE or deprecate: build_chapter(), page(), all HTML rendering functions
     (don't delete yet — mark as deprecated with a comment for reference)

3. TEST save_chapter():
   - Write a minimal test: save_chapter('_test', 1, {...test data...})
   - Verify the JSON output matches expected structure
   - Clean up _test/

4. Print summary of what was archived, what remains, new function signature.
   Commit everything. Push.
```

---

## Batch Summary

| Batch | Description | Tool calls | Dependencies |
|-------|-------------|-----------|--------------|
| **0A** | Build HTML→JSON extractor, test on 3 chapters | ~12 | None |
| **0B** | Run on all 879 chapters, fix failures | ~10 | 0A |
| **0C** | Convert 12 JS data files + 132 verse files to JSON | ~8 | None (parallel with 0A) |
| **0D** | Extract inline data from map.html, people.html, 43 bios | ~10 | None (parallel with 0A) |
| **0E** | Export Python config to JSON, merge scholar data | ~6 | 0C, 0D |
| **0F** | Build SQLite schema + build_sqlite.py, populate DB | ~10 | 0B, 0C, 0D, 0E |
| **0G** | Validate SQLite database, comprehensive integrity checks | ~6 | 0F |
| **0H** | Archive PWA, write save_chapter(), test new pipeline | ~10 | 0G |

**Total: 8 batches, ~72 tool calls, targeting 4-6 sessions.**

**Dependency graph:**
```
0A ──→ 0B ──┐
0C ──────────┤
0D ──────────┼──→ 0E ──→ 0F ──→ 0G ──→ 0H
             │
```

0A, 0C, and 0D can run in the same session if tool limits allow. 0E merges their outputs. 0F assembles everything into SQLite. 0G validates. 0H archives and transitions.

---

## Session Planning

**Session 1:** Batches 0A + 0C (build extractor + convert JS files)
**Session 2:** Batches 0B + 0D (run extractor on all 879 + extract inline HTML)
**Session 3:** Batches 0E + 0F (merge configs + build SQLite)
**Session 4:** Batches 0G + 0H (validate DB + archive PWA + write save_chapter)

---

## Verification Checklist (run after Phase 0 is complete)

- [ ] `content/` has 30 book directories with JSON files matching chapter counts
- [ ] `content/meta/` has: books.json, book-intros.json, people.json, timelines.json, cross-refs.json, word-studies.json, synoptic.json, scholars.json, scholar-scopes.json, scholar-data.json, scholar-bios.json, places.json, map-stories.json, genealogy-config.json
- [ ] `content/verses/` has niv/ and esv/ subdirectories with 66 JSON files each
- [ ] `scripture.db` exists and passes all validation checks
- [ ] `_archive/` contains the complete old PWA
- [ ] `save_chapter()` works and produces valid JSON
- [ ] `build_sqlite.py` runs cleanly and produces a valid database
- [ ] `git tag pwa-final` exists
- [ ] No HTML files remain in the working tree outside `_archive/`
- [ ] Generator scripts can call `save_chapter()` with the same data dicts as before
