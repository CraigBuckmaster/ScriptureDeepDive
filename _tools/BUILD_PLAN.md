# Scripture Deep Dive — New Book Build Plan

> **Read this file before starting any new book.**
> Last updated: 2026-03-22 (after Job completion, 25 books live)

---

## Phase 1: Planning (before touching any code)

1. **Book profile** — testament, total chapters, author, date, setting
2. **Scholar roster** — which existing scholars cover this book? New scholars needed?
3. **Batch strategy** — group chapters by content arc (5–7 chapters per batch typical)
4. **DRAFT ALL CHAPTER SECTIONS** — verse ranges + section headers for every chapter
   - This prevents mid-build refactors
   - Each section needs: header, verse range, and 1-sentence content summary
5. **People inventory** — key figures to add to `js/pages/people-data.js`
6. **Timeline inventory** — key events to add to `js/pages/timeline-data.js`

---

## Phase 2: Infrastructure (before building any chapters)

### Core registry files

| File | What to add |
|------|-------------|
| `_tools/shared.py` | REGISTRY tuple: `('dir', 'Name', total_ch, 0, 'OT'/'NT', 'ot'/'nt')` |
| `_tools/shared.py` | BOOK_PREFIX: `'dir': 'abbrev'` |
| `_tools/config.py` | COMMENTATOR_SCOPE: extend existing scholars + add new |
| `_tools/config.py` | BOOK_META: `is_nt`, `auth`, `vhl_places`, `vhl_people`, `vhl_key`, `vhl_time` |
| `_tools/config.py` | SCHOLAR_REGISTRY: new `('key', 'key', 'Label', 'key')` entries |
| `_tools/audit.py` | BOOK_ROSTER: add book tuple |
| `_tools/audit.py` | OT_BOOKS or NT_BOOKS regex: add book dir name |

### Frontend files

| File | What to add |
|------|-------------|
| `css/styles.css` | Button CSS for each new scholar: `.anno-trigger.{key}` (color, border, bg, hover, active) |
| `js/features/translation.js` | Add `'VERSES_{BOOK}'` to `bookVars` array |

### Scholar infrastructure (for each NEW scholar)

**`commentators/scholar-data.js`** — add entry with ALL fields:
```javascript
{
  key: '{key}',
  name: 'Full Name',
  color: '#hexcolor',        // ← REQUIRED for dropdown dot + hub card
  scope: 'Book1, Book2',     // ← REQUIRED for dropdown + hub card
  tradition: 'Tradition · Era',
  desc: 'One-sentence description', // ← REQUIRED for hub card
  dates: '1900–',
  photo: '',
  works: 'Commentary Name (Year)',
  bio: 'Full bio paragraph.',
  bookScope: ['book1'],
  buttonCSS: '.anno-trigger.{key}'
}
```

**`commentators/{key}.html`** — bio page with FULL nav infrastructure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{Name} — Scripture Deep Dive</title>
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#0c0a07">
  <link rel="apple-touch-icon" href="../assets/icon-192.png">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond..." rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <nav class="com-nav" id="com-nav"></nav>   <!-- dropdown injected by JS -->
  <div class="bio-wrap">
    <div class="bio-header">
      <h1 class="bio-name">{Name}</h1>
      <p class="bio-tradition">{subtitle}</p>
    </div>
    <div class="bio-section">
      <h2 class="bio-section-title">Biography</h2>
      <p>...</p>
    </div>
    <div class="bio-section">
      <h2 class="bio-section-title">Key Works</h2>
      <p>...</p>
    </div>
    <div class="bio-section">
      <h2 class="bio-section-title">Approach</h2>
      <p>...</p>
    </div>
    <div class="bio-others" id="bio-others-target"></div>  <!-- others grid -->
  </div>
  <script>window.CURRENT_SCHOLAR="{key}";</script>
  <script src="scholar-data.js"></script>
  <script src="commentator-nav.js"></script>
  <script src="../js/core/site-footer.js"></script>
</body>
</html>
```

**Critical checklist for bio pages:**
- [ ] `<nav class="com-nav" id="com-nav"></nav>` present
- [ ] `window.CURRENT_SCHOLAR="{key}"` set before script loads
- [ ] `scholar-data.js` loaded
- [ ] `commentator-nav.js` loaded
- [ ] `<div class="bio-others" id="bio-others-target"></div>` present

### Other infrastructure

| Item | Location |
|------|----------|
| Book intro page | `intro/{book}.html` |
| Chapter directory | `ot/{book}/` or `nt/{book}/` |

---

## Phase 3: Build (repeat per batch)

1. Create generator at `/tmp/gen_{book}_b{n}.py` (NEVER in `_tools/`)
2. Run generator → produces chapter HTML files
3. Update REGISTRY live count in `shared.py`
4. Run rebuilds:
   ```python
   shared.update_homepage()
   shared.rebuild_qnav_js()
   shared.rebuild_books_js()
   shared.rebuild_sw_js()
   ```
5. First and last batch only:
   ```python
   shared.rebuild_verses_js('niv')
   shared.rebuild_verses_js('esv')
   ```
6. Bump SW version in `service-worker.js`
7. Run audit: `python3 _tools/audit.py` (22 sections, 0 failures)
8. Run tests: `python3 _tools/tests/test_regressions.py` (25+ tests)
9. Delete generator: `rm /tmp/gen_{book}*.py`
10. Commit and push: `git add -A && git commit -m "..." && git push origin master`

### Generator syntax gotcha
Cross-reference tuples that end with a description followed by `)]` often have a missing closing quote. Before running any generator, pre-check syntax:
```python
compile(open('/tmp/gen_{book}_b{n}.py').read(), 'gen.py', 'exec')
```
Common fix pattern:
```python
import re
c = re.sub(r"(\w)\.\)\],", r"\1.')],", c)
```

---

## Phase 4: Post-Build Enrichment

### People page (`js/pages/people-data.js`)

Add key figures from the new book. Entry structure:
```javascript
{
  id: "person_id",
  name: "Display Name",
  gender: "m" | "f",
  father: "parent_id" | null,
  mother: "parent_id" | null,
  spouseOf: "spouse_id" | null,
  era: "primeval|patriarch|exodus|judges|kingdom|prophets|exile|nt",
  dates: "c. 1000 BC",
  role: "Short role description",
  bio: "Full biographical paragraph..."
}
```

### Timeline (`js/pages/timeline-data.js`)

Add key events. Two arrays:
- `EVENTS` — biblical events with chapter links:
  ```javascript
  { id:'event_id', era:'era', name:'Event Name', year:-1000,
    ref:'Book 1:1', chapter:'ot/book/Book_1.html',
    people:['person1','person2'],
    summary:'One-sentence summary.' }
  ```
- `WORLD_EVENTS` — secular history for context:
  ```javascript
  { label:'Event Name', year:-1000 }
  ```

---

## Build quality rules

- **VERSE TEXT**: Word-for-word NIV. No paraphrasing. Every verse in a section displayed.
- **Sections**: Minimum 2 per chapter (build_chapter enforces this)
- **Lit rows**: Minimum 2 per lit-diagram (audit warns on single)
- **MacArthur notes**: Minimum 4-5 per panel
- **Scholar panels**: Minimum 2 entries per section per scholar
- **Hebrew words**: At least 1-2 per section with transliteration + meaning + theological significance
- **Cross-references**: At least 2 per section, mixing OT/NT connections
- **Historical context**: At least 1 per chapter
- **VHL button arrays**: Must resolve in at least one btn-row per group. `context` is always safe fallback.
- **tog()**: Must query `.anno-panel.open,.themes-panel.open` — both selectors required.

---

## Current state reference

- **SW versioning**: `scripture-2.{N}` — bump by 1 per push
- **Rebuild functions**: `update_homepage()`, `rebuild_qnav_js()`, `rebuild_books_js()`, `rebuild_sw_js()`, `rebuild_verses_js(translation)`
- **Audit**: 22 sections, run with `python3 _tools/audit.py`
- **Tests**: `python3 _tools/tests/test_regressions.py` (25 tests) + `node _tools/tests/test_verse_resolver.js` (66 tests)
- **Git config**: `user.email=craig@scripturedeepDive.com`, `user.name=ScriptureDeepDive`, `http.sslVerify=false`
