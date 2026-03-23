# Phase 1: New Content Authoring Pipeline — Implementation Plan

## Overview

**Goal:** Replace the HTML-rendering build pipeline with a JSON-only authoring pipeline. After Phase 1, the workflow is: generator script → `save_chapter()` → JSON → `build_sqlite.py` → SQLite database → OTA to devices.

**Dependencies:** Phase 0 must be complete. The `content/` directory has 879 chapter JSON files (extracted from HTML), all meta JSON files, and `scripture.db`.

**What exists after Phase 0:**
- `content/{book}/{ch}.json` — 879 chapter files (extracted from HTML)
- `content/meta/*.json` — all supporting data files
- `content/verses/{translation}/{book}.json` — all verse data
- `scripture.db` — assembled SQLite database
- `_tools/build_sqlite.py` — JSON→SQLite assembler
- `_tools/validate_sqlite.py` — database integrity checker
- `_archive/` — the retired PWA

**What Phase 1 builds:**
- `save_chapter()` — the new authoring function (replaces `build_chapter()`)
- `auto_scholarly_json()` — auto-generation of chapter-level panels as JSON (replaces HTML-generating `auto_scholarly()`)
- `validate.py` — content JSON schema validator
- New structured format for `hebtext` and `textual` panel data (replacing HTML strings)
- Generator script template for future content sessions
- Updated documentation

**Key insight:** Most of the auto-generation sub-functions (`_auto_src`, `_auto_rec`, `_auto_thread`, `_auto_debate`) already return structured Python data (lists of tuples/dicts), NOT HTML. `build_chapter()` takes their output and passes it to HTML panel-builder functions. In the new pipeline, we skip the HTML step entirely — the structured data IS the output. Only two areas require real conversion work:
1. `hebtext` — currently generates inline-styled HTML from `heb` entries
2. `_auto_textual` — returns data with embedded HTML `<span>` tags

---

## Data Format Definitions

Before writing any code, every panel's JSON format must be defined. These formats are what `save_chapter()` writes and what the React Native app reads.

### Section-level panel formats

**heb** (Hebrew/Greek word studies):
```json
[
  {"word": "רִיב", "tlit": "rîb", "gloss": "lawsuit / controversy", "text": "Hear me, you heavens!..."}
]
```

**ctx** (Literary/historical context):
```json
"Isaiah opens not with his call but with God's legal case against Judah..."
```

**hist** (Historical context):
```json
"The date is the reigns of Uzziah through Hezekiah (c.740–700 BC)..."
```

**cross** (Cross-references):
```json
[
  {"ref": "Deut 32:1", "note": "Moses summoned the same witnesses at the covenant's beginning."},
  {"ref": "Mic 6:1–8", "note": "The same rîb genre."}
]
```

**Commentary panels (mac, calvin, netbible, sarna, oswalt, etc.):**
```json
[
  {"ref": "1:2–3", "note": "Heaven and earth as witnesses. The ox knows; Israel does not."},
  {"ref": "1:5", "note": "The nation described as a beaten body."}
]
```

**poi** (Places):
```json
[
  {"name": "Jerusalem", "role": "Capital city", "text": "The city where the temple stood..."}
]
```

**tl** (Timeline events):
```json
[
  {"date": "740 BC", "event": "Isaiah's call", "text": "In the year that King Uzziah died..."}
]
```

### Chapter-level panel formats

**lit** (Literary structure):
```json
{
  "rows": [
    {"label": "vv.1–15", "range": "1:1–15", "text": "The covenant lawsuit", "is_key": true},
    {"label": "vv.16–31", "range": "1:16–31", "text": "The prostitute city", "is_key": false}
  ],
  "note": "Structure of The Great Arraignment"
}
```

**themes** (Theological themes radar):
```json
{
  "scores": [
    {"name": "Covenant", "value": 9},
    {"name": "Judgment", "value": 9},
    {"name": "Mercy", "value": 6}
  ],
  "note": "Covenant and Judgment peak at 9: the great arraignment."
}
```

**ppl** (People):
```json
[
  {"name": "Isaiah", "role": "Prophet to Judah", "text": "Called in the year King Uzziah died..."},
  {"name": "Uzziah", "role": "King of Judah", "text": "Reigned 52 years..."}
]
```

**trans** (Translation comparison):
```json
{
  "title": "Key Verses Where Translations Diverge",
  "rows": [
    {
      "verse_ref": "Isaiah 1:18",
      "translations": [
        {"version": "NIV", "text": "Though your sins are like scarlet..."},
        {"version": "ESV", "text": "Though your sins are like scarlet..."},
        {"version": "NASB", "text": "Though your sins are as scarlet..."}
      ]
    }
  ]
}
```

**src** (Ancient sources):
```json
[
  {"title": "Enuma Elish (Babylon, c.12th c. BCE)", "quote": "The Babylonian creation epic...", "note": "Genesis 1 uses the same vocabulary..."}
]
```

**rec** (Reception history):
```json
[
  {"title": "John MacArthur — Evangelical / Reformed (20th–21st c.)", "quote": "...", "note": "..."}
]
```

**thread** (Intertextual threading):
```json
[
  {"anchor": "Gen 1:1", "target": "John 1:1–3", "direction": "forward", "type": "fulfilment", "text": "John deliberately echoes Genesis 1:1..."}
]
```

**textual** (Textual notes):
```json
[
  {"ref": "Gen 1:1", "title": "LXX rendering of the creation formula", "content": "MT: bərēʾshîṯ — LXX: en archē closely follows MT.", "note": "The LXX Genesis is generally close..."}
]
```
Note: No HTML spans. The `MT:` and `LXX:` labels are rendered by the app using the scholar's accent color. The content is plain text.

**debate** (Scholarly debates):
```json
[
  {"topic": "Documentary hypothesis vs Mosaic authorship", "positions": [{"scholar": "Sarna", "position": "..."}, {"scholar": "MacArthur", "position": "..."}]}
]
```

**hebtext** (Hebrew-rooted reading):
```json
[
  {"word": "בְּרֵאשִׁית", "tlit": "bərēʾshîṯ", "gloss": "in the beginning", "note": "bara (created, God-only verb)"},
  {"word": "אֱלֹהִים", "tlit": "ʾĕlōhîm", "gloss": "God", "note": "plural + singular verb"}
]
```
Note: This is derived from the section-level `heb` entries. The auto-generation simply aggregates them. Generator scripts that provide explicit hebtext now provide this structured format, NOT HTML.

### Top-level chapter fields

```json
{
  "book": "isaiah",
  "chapter": 1,
  "title": "The Great Arraignment",
  "timeline_link": {"event_id": "creation", "text": "See on Timeline — Creation"},
  "map_story_link": {"story_id": "abram-call", "text": "See on Map — Abraham's Call"},
  "sections": [ ... ],
  "chapter_panels": { ... },
  "vhl_groups": [ ... ]
}
```

---

## Batch 1A: save_chapter() Core Function
*Write the authoring function. Validate inputs. Write JSON. No auto-generation yet.*

### What save_chapter() does

1. Receives a data dict (same structure as what generators pass to `build_chapter()` today)
2. Validates required keys and structure
3. Calls `auto_scholarly_json()` to fill missing chapter-level panels (Batch 1B)
4. Writes clean JSON to `content/{book}/{ch}.json`
5. Optionally rebuilds SQLite

### Prompt for Batch 1A

```
Phase 1A: Write save_chapter() — the core authoring function for the new
JSON-only pipeline.

READ _tools/PHASE_1_PLAN.md (Batch 1A section and Data Format Definitions).
READ _tools/REACT_NATIVE_PLAN.md Phase 1 for the overall spec.

1. In _tools/shared.py, write save_chapter(book_dir, ch, data):
   a. Validates required keys:
      - 'title' (string, non-empty)
      - 'sections' (list, 2+ entries)
      - Each section has: 'header' (string), 'verses' (list of (num, text) tuples),
        'heb' (list of 4-tuples: word, tlit, gloss, text)
   b. Validates section panel types match known types:
      Known section panels: heb, ctx, hist, cross, poi, tl, mac, calvin,
      netbible, and any key in COMMENTATOR_SCOPE
   c. Validates chapter-level panel formats when explicitly provided:
      - 'lit': must be (rows_list, note_string)
      - 'themes': must be (scores_list, note_string) with 10 scores
      - 'hebtext': must be list of dicts (new JSON format, NOT HTML)
   d. Writes JSON to content/{book_dir}/{ch}.json with indent=2, ensure_ascii=False
   e. Prints confirmation with panel counts

   NOTE: Do NOT call auto_scholarly_json() yet — that's Batch 1B.
   For now, save_chapter just writes whatever data it receives.
   If chapter-level panels are missing, they'll be empty in the JSON.

2. Keep verse_range(start, end) unchanged — generators still use it.

3. Write validate_chapter_json(json_path) that loads a chapter JSON
   file and checks:
   - Has 'book', 'chapter', 'title', 'sections'
   - Each section has 'header', 'verse_start', 'verse_end', 'panels'
   - Section panels have valid types
   - No empty string values in panel content
   Returns (is_valid, list_of_issues).

4. Test save_chapter with a minimal hand-written chapter:
   save_chapter('_test', 1, {
       'title': 'Test Chapter',
       'sections': [{
           'header': 'Verses 1–5 — "Test Section A"',
           'verses': verse_range(1, 5),
           'heb': [('תֵּבָה', 'tēvâ', 'word / thing', 'Test Hebrew entry.')],
           'ctx': 'Test context paragraph.',
           'cross': [('Gen 1:1', 'Test cross-reference.')],
           'mac': [('1:1', 'Test MacArthur note.')],
       }, {
           'header': 'Verses 6–10 — "Test Section B"',
           'verses': verse_range(6, 10),
           'heb': [('שָׁלוֹם', 'shālôm', 'peace', 'Test Hebrew entry 2.')],
       }],
       'lit': ([('vv.1–5', '1:1–5', 'Section A', True),
                ('vv.6–10', '1:6–10', 'Section B', False)], 'Test structure'),
       'themes': ([('Covenant',7),('Judgment',5),('Mercy',6),('Faith',4),
                   ('Sovereignty',8),('Worship',3),('Holiness',5),
                   ('Prophecy',4),('Justice',6),('Mission',3)], 'Test note'),
   })
   Verify content/_test/1.json exists and validate_chapter_json passes.
   Delete the _test directory after verification.

5. Print save_chapter function signature and explain the data dict format.
   Do NOT modify or delete any existing functions yet.
```

---

## Batch 1B: Port auto_scholarly() to JSON Output
*The big rewrite. HTML generators become JSON generators.*

### What changes

The existing `auto_scholarly()` does two things:
1. Generates panel DATA from section content (keyword matching, data map lookups)
2. Formats that data as HTML strings

The new `auto_scholarly_json()` does only #1 — it generates structured JSON dicts. The formatting is the React Native app's job.

### Current function audit

| Function | Size | Returns | HTML in output? | Change needed |
|----------|------|---------|-----------------|---------------|
| `auto_scholarly()` | 9.5KB | dict of 10 panel values | Yes (hebtext) | Rewrite hebtext gen. Route to sub-functions. |
| `_auto_thread()` | 2.5KB | list of dicts | No | Return format already JSON-compatible. Keep. |
| `_auto_src()` | 14KB | list of 3-tuples | No | Already (title, quote, note). Convert tuples → dicts. |
| `_auto_rec()` | 3.5KB | list of dicts | No | Already structured. Keep. |
| `_auto_textual()` | 10KB | list of 4-tuples | Yes (HTML spans) | Strip `<span class="tx-mt">MT</span>` → plain `MT:`. Convert tuples → dicts. |
| `_auto_debate()` | 6.5KB | list of dicts | No | Already structured. Keep. |

**Total rewrite surface: ~46KB of code, but only hebtext (inline in auto_scholarly) and _auto_textual need real changes. The rest are tuple→dict conversions.**

### Prompt for Batch 1B

```
Phase 1B: Port auto_scholarly() and all _auto_* functions to JSON output.

READ _tools/PHASE_1_PLAN.md (Batch 1B section and Data Format Definitions)
for exact JSON formats per panel type.

READ the existing auto_scholarly(), _auto_thread(), _auto_src(), _auto_rec(),
_auto_textual(), _auto_debate() functions in _tools/shared.py.

Write auto_scholarly_json(data, book_dir, ch) in _tools/shared.py that:

1. HEBTEXT: Instead of generating HTML from heb entries, return a list of dicts:
   [{"word": "בְּרֵאשִׁית", "tlit": "bərēʾshîṯ", "gloss": "in the beginning",
     "note": "bara (created, God-only verb)"}]
   Simply aggregate the 4-tuples from each section's 'heb' key.

2. LIT: Already returns (rows_list, note_string). Convert to:
   {"rows": [{"label": "vv.1-5", "range": "1:1-5", "text": "...", "is_key": true}],
    "note": "..."}

3. THEMES: Already returns (scores_list, title). Convert to:
   {"scores": [{"name": "Covenant", "value": 7}, ...], "note": "..."}

4. PPL: Already returns a list. Convert person tuples to dicts:
   [{"name": "...", "role": "...", "text": "..."}]

5. TRANS: Currently reads verse JSON files and builds rows.
   Return: {"title": "...", "rows": [{"verse_ref": "...",
   "translations": [{"version": "NIV", "text": "..."}]}]}

6. SRC (_auto_src): Returns list of 3-tuples. Convert to list of dicts:
   [{"title": "...", "quote": "...", "note": "..."}]
   Keep all the existing ane_map data intact.

7. REC (_auto_rec): Returns list of blocks. Convert to list of dicts:
   [{"title": "...", "quote": "...", "note": "..."}]
   Keep the scholar_map data intact.

8. TEXTUAL (_auto_textual): Returns list of 4-tuples with HTML spans.
   Convert to list of dicts AND strip HTML:
   - Replace '<span class="tx-mt">MT</span>' with 'MT:'
   - Replace '<span class="tx-lxx">LXX</span>' with 'LXX:'
   - Replace '<span class="tx-dss">DSS</span>' with 'DSS:'
   - Strip all remaining HTML tags
   Result: [{"ref": "...", "title": "...", "content": "...", "note": "..."}]
   Keep all the tx_books data intact.

9. DEBATE (_auto_debate): Already returns structured data. Convert format:
   [{"topic": "...", "positions": [{"scholar": "...", "position": "..."}]}]
   Keep the keyword matching logic intact.

10. THREAD (_auto_thread): Already returns list of items. Convert to:
    [{"anchor": "...", "target": "...", "direction": "forward",
      "type": "fulfilment", "text": "..."}]

11. Update save_chapter() to call auto_scholarly_json() for any missing
    chapter-level panels, merging results into the data dict before writing.

12. Test auto_scholarly_json on 3 books:
    - Manually construct a minimal data dict for genesis ch.1, isaiah ch.6,
      matthew ch.1 (using the section heb/ctx/cross/mac entries from the
      extracted content/ JSON files)
    - Call auto_scholarly_json and verify each panel type is present and
      has the correct format per the schema definitions
    - Print panel types and entry counts for each test

Do NOT delete the old auto_scholarly() yet — rename it to
_auto_scholarly_html_DEPRECATED. The new function is auto_scholarly_json().
```

---

## Batch 1C: Migrate Existing Content + Define Generator Format
*Convert Phase 0's extracted hebtext HTML to new structured format. Write the template.*

### The migration problem

Phase 0 extracted 879 chapter JSON files from HTML. The `hebtext` and `textual` chapter panels in those files may still contain HTML strings (because Phase 0 extracted them as-is from the HTML). These need to be converted to the new JSON format defined above.

Additionally, generator scripts that we'll write in future sessions need a clear template showing the exact format for every field.

### Prompt for Batch 1C

```
Phase 1C: Migrate existing extracted content to new formats + write
generator script template.

READ _tools/PHASE_1_PLAN.md (Batch 1C section and Data Format Definitions).

1. WRITE _tools/migrate_content.py that:

   a. For each content/{book}/{ch}.json file (879 files):
      - Load the JSON
      - If chapter_panels.hebtext is a string (HTML):
        Parse the HTML to extract structured entries:
        [{"word": "...", "tlit": "...", "gloss": "...", "note": "..."}]
        Strategy: if the HTML contains '<span style="color:#e890b8">' (Hebrew)
        or '<div class="hebrew-word">' blocks, parse them.
        If parsing fails or hebtext is not HTML, leave as-is (it may already
        be in the correct format from auto_scholarly_json).
      - If chapter_panels.textual contains HTML spans:
        Strip <span class="tx-mt">MT</span> → 'MT:'
        Strip <span class="tx-lxx">LXX</span> → 'LXX:'
        Strip all remaining HTML tags from content strings.
        Convert from tuples/lists to list of dicts format.
      - Write the cleaned JSON back to the same file.

   b. Print summary: files processed, hebtext converted, textual converted,
      any failures.

   c. Validate: run validate_chapter_json() on every file after migration.

2. RE-RUN build_sqlite.py after migration to rebuild the database with
   clean JSON content.

3. RE-RUN validate_sqlite.py to confirm database integrity post-migration.

4. WRITE _tools/GENERATOR_TEMPLATE.py — a documented template showing
   exactly how to write a generator script for new chapters:

   ```python
   """Template: Chapter content generator.
   Copy this file, fill in the scholarly content, run with Python 3."""
   import sys; sys.path.insert(0, '/path/to/_tools')
   from shared import save_chapter, verse_range

   BOOK = 'jeremiah'  # book directory name

   def ch(num, title, sections, lit, themes, **kw):
       save_chapter(BOOK, num, {
           'title': title,
           'sections': sections,
           'lit': lit,
           'themes': themes,
           **kw
       })
       print(f'  ✓ {BOOK.title()} {num}')

   ch(1, 'The Call of Jeremiah',
     [
       {'header': 'Verses 1–10 — "Before I Formed You in the Womb"',
        'verses': verse_range(1, 10),
        'heb': [('word', 'transliteration', 'gloss', 'paragraph about the word...')],
        'ctx': 'Historical context paragraph...',
        'cross': [('Ref', 'Cross-reference note...')],
        'mac': [('1:1', 'MacArthur note...')],
        'calvin': [('1:1', 'Calvin note...')],
        'netbible': [('1:1', 'NET Bible note...')],
        # Book-specific scholars:
        # 'thompson': [('1:1', 'Thompson note...')],
       },
       {'header': 'Verses 11–19 — "What Do You See?"',
        'verses': verse_range(11, 19),
        'heb': [('word2', 'tlit2', 'gloss2', 'paragraph2...')],
        'ctx': 'Context paragraph...',
        'cross': [('Ref', 'Note...')],
        'mac': [('1:11', 'Note...')],
       },
     ],
     lit=([('label', 'range', 'text', is_key), ...], 'Structure note'),
     themes=([('Covenant',7),('Judgment',8),('Mercy',5),('Faith',6),
              ('Sovereignty',7),('Worship',4),('Holiness',5),
              ('Prophecy',9),('Justice',6),('Mission',4)], 'Theme note'),
   )
   ```

5. Commit everything. Print summary of what was migrated and created.
```

---

## Batch 1D: End-to-End Test + Documentation
*Prove the full pipeline works. Document everything.*

### Prompt for Batch 1D

```
Phase 1D: End-to-end pipeline test + documentation update.

READ _tools/PHASE_1_PLAN.md (Batch 1D section).

1. END-TO-END TEST:
   a. Copy _tools/GENERATOR_TEMPLATE.py to /tmp/gen_test.py
   b. Fill it with real content for one chapter (e.g., Jeremiah 1 or any
      not-yet-built book — use brief placeholder scholarly content)
   c. Run: python3 /tmp/gen_test.py
   d. Verify content/{book}/1.json exists and is valid JSON
   e. Run: python3 _tools/build_sqlite.py
   f. Query the database to verify the test chapter:
      - SELECT * FROM chapters WHERE book_id='{book}' AND chapter_num=1
      - SELECT COUNT(*) FROM section_panels WHERE section_id LIKE '{book}_1%'
      - SELECT panel_type FROM chapter_panels WHERE chapter_id='{book}_1'
      - SELECT * FROM vhl_groups WHERE chapter_id='{book}_1'
   g. Delete the test content and rebuild DB without it
   h. Print PASS/FAIL for each check

2. WRITE validate.py (_tools/validate.py):
   A comprehensive content validator that checks ALL content/ JSON files:
   a. Schema validation per the format definitions in this plan
   b. Cross-referential checks:
      - Every book referenced in a scholar scope exists in books.json
      - Every person referenced by father/mother exists in people.json
      - VHL groups reference valid CSS classes
   c. Completeness checks:
      - Every live book has chapter JSON files matching expected count
      - Every chapter has 2+ sections
      - Every section has 'heb' entries
   d. Print summary: total files, total sections, total panels, issues found

3. UPDATE DOCUMENTATION:
   a. Update _tools/BUILD_PLAN.md:
      - Replace the HTML build workflow with the new JSON workflow
      - Update the deploy checklist: save_chapter → validate → build_sqlite → push
      - Remove references to rebuild_sw_js, rebuild_qnav_js, etc.

   b. Update _tools/MASTER_PLAN.md:
      - Note the pipeline change
      - Update the "new book planning" process to reference GENERATOR_TEMPLATE.py
      - Update wave order if needed

   c. Write _tools/WORKFLOW.md — a concise guide to the new pipeline:
      ```
      # Content Authoring Workflow

      ## Writing new chapters
      1. Copy GENERATOR_TEMPLATE.py to /tmp/gen_{book}_{range}.py
      2. Fill in scholarly content (same format as always)
      3. Run: python3 /tmp/gen_{book}_{range}.py
      4. Validate: python3 _tools/validate.py
      5. Build DB: python3 _tools/build_sqlite.py
      6. Verify: python3 _tools/validate_sqlite.py
      7. Commit: git add content/ scripture.db && git commit
      8. Deploy: eas update --branch production

      ## Adding a new book
      1. Add to config.py: BOOK_META, COMMENTATOR_SCOPE
      2. Add to content/meta/books.json (is_live: true)
      3. Write chapters using GENERATOR_TEMPLATE.py
      4. Rebuild DB
      ```

4. DEPRECATION:
   In _tools/shared.py, add a comment block at the top of every HTML-only
   function marking it as deprecated:
   ```python
   # DEPRECATED — HTML pipeline retired. Kept for reference only.
   # See save_chapter() for the JSON pipeline.
   # These functions are NOT called by anything in the active codebase.
   ```
   Functions to mark: build_chapter, page, scholarly_block, heb_panel,
   hist_panel, ctx_panel, cross_panel, poi_panel, tl_panel, ppl_panel,
   trans_panel, src_panel, rec_panel, lit_panel, hebtext_panel,
   thread_panel, commentary_panel, mac_panel, textual_panel, debate_panel,
   themes_btn_panel, _build_section_html, head, chapter_header, btn_row,
   verse, auto_scholarly (old HTML version), update_homepage,
   rebuild_books_js, rebuild_sw_js, rebuild_qnav_js, rebuild_verses_js,
   rebuild_niv_from_html.

   Do NOT delete them — they serve as reference for the data structures.

5. Print summary. Commit everything. Push.
```

---

## Batch Summary

| Batch | Description | Tool calls | Dependencies |
|-------|-------------|-----------|--------------|
| **1A** | Write save_chapter() core + validate_chapter_json + test | ~10 | Phase 0 complete |
| **1B** | Port auto_scholarly + all _auto_* to JSON output | ~12 | 1A |
| **1C** | Migrate existing content formats + write generator template | ~10 | 1B |
| **1D** | End-to-end test + validate.py + documentation + deprecation | ~12 | 1C |

**Total: 4 batches, ~44 tool calls, targeting 2 sessions.**

**Dependency graph (linear):**
```
1A → 1B → 1C → 1D
```

Each batch depends on the previous one. No parallelism possible within Phase 1 (unlike Phase 0 where 0A/0C/0D were independent).

---

## Session Planning

**Session 1:** Batches 1A + 1B (save_chapter core + auto_scholarly JSON rewrite)
**Session 2:** Batches 1C + 1D (migrate content + end-to-end test + docs)

---

## Verification Checklist (run after Phase 1 is complete)

- [ ] `save_chapter()` exists in shared.py and writes valid JSON to content/
- [ ] `auto_scholarly_json()` generates all 10 chapter-level panel types as JSON dicts
- [ ] All 879 content/{book}/{ch}.json files have clean JSON (no HTML strings in hebtext or textual)
- [ ] `scripture.db` rebuilt from clean JSON passes all validate_sqlite.py checks
- [ ] `validate.py` runs on all content/ files with 0 errors
- [ ] `GENERATOR_TEMPLATE.py` exists and works end-to-end
- [ ] `WORKFLOW.md` documents the complete new pipeline
- [ ] `BUILD_PLAN.md` and `MASTER_PLAN.md` updated to reflect new pipeline
- [ ] All HTML-rendering functions in shared.py marked as DEPRECATED
- [ ] End-to-end test passes: generator → save_chapter → build_sqlite → query → verify
- [ ] `verse_range()` still works (unchanged)
- [ ] Generator scripts from future sessions will call `save_chapter()` with same data dict structure
