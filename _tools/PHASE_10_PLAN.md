# Phase 10: Content Completion — Implementation Plan

## Overview

**Goal:** Complete the entire 66-book Bible. This is the only open-ended phase — it runs post-launch and may take 6-12 months depending on pace. Every other phase had a fixed scope; this one has 488 chapters of work across three categories: enrichment debt (189 chapters), new book creation (299 chapters across 36 books), and supporting data expansion (people, timeline events, map stories, scholars).

**Dependencies:** Phases 0-9 complete. The app is live. The JSON authoring pipeline (`save_chapter()` → `build_sqlite.py` → `eas update`) works. The OTA update pipeline delivers content to devices within minutes.

**What already exists:**
- 30 live books, 879 chapters
- 690 chapters fully enriched (15 buttons)
- 44 chapters partially enriched (Isaiah 23-66, 7 buttons)
- 145 chapters at base level (7 buttons, no MacArthur)
- 43 scholars in the system
- 211 people in the genealogy tree
- 216 timeline events
- 71 map places, 28 map stories
- 15 word study entries
- 45 synoptic/parallel passage entries
- All 66 book intros already written

**What Phase 10 builds:**
- 488 chapters of scholarly content
- ~35 new scholars (config + data + bios + colors)
- ~100+ new people entries (NT figures, minor prophets)
- ~80+ new timeline events (epistles, church history)
- ~20+ new map places + ~15 new map stories
- ~20+ new word study entries (Greek NT terms)
- ~30+ new synoptic/parallel passage entries

---

## Content Landscape

### Work categories (ordered by priority)

| Category | Chapters | Priority | Reason |
|----------|----------|----------|--------|
| Isaiah enrichment (23-66) | 44 | **Immediate** | Existing chapters, just need more panels |
| Kings/Chronicles MacArthur | 112 | **High** | Quick win — only adding MacArthur notes |
| Ezra/Nehemiah/Esther enrichment | 33 | **High** | Existing chapters, need ctx + cross + scholars |
| Jeremiah (new book) | 52 | **High** | Largest remaining OT prophet |
| Ezekiel (new book) | 48 | **High** | Completes major prophets |
| Minor Prophets (12 new books) | 67 | **Medium** | 12 books, many small |
| Pauline Epistles (13 new books) | 76 | **Medium** | Core NT theology |
| General Epistles + Hebrews (8 new books) | 34 | **Medium** | Cross-references everything |
| Revelation (new book) | 22 | **Last** | Capstone — references all other books |

### Wave order (from MASTER_PLAN.md)

The wave order is designed so that scholars are added once and reused across books, cross-reference targets are live before references are written, and thematic affinity keeps adjacent sessions coherent.

| Wave | Books | New ch | New scholars | Sessions est. |
|------|-------|--------|-------------|---------------|
| **Enrichment** | Isaiah, Kings/Chron, Ezra/Neh/Esther | 189 | 0 | ~9 |
| **Wave 3 (cont.)** | Jeremiah, Ezekiel | 100 | 3 (lundbom, brueggemann, zimmerli) | ~6 |
| **Wave 4** | 12 Minor Prophets | 67 | 5 new + 2 extend (stuart, andersen_f, verhoef, boda, hill) | ~4 |
| **Wave 5** | 13 Pauline Epistles | 76 | 9 new (moo, schreiner, bruce_ff, fee, thiselton, thielman, harris_m, barnett, mounce, towner) | ~4 |
| **Wave 6** | 8 General Epistles + Hebrews | 34 | 5 new (lane, cockerill, mccartney, kruse, marshall) | ~2 |
| **Wave 7** | Revelation | 22 | 2 new (beale, osborne) | ~1 |
| **TOTAL** | 36 new + enrichment | 488 | ~35 new scholars | ~26 sessions |

---

## New Book Infrastructure Checklist

Every time a NEW book is added (not enrichment), these steps must happen BEFORE chapter content is written. This is the Phase 1 pipeline equivalent of the old BUILD_PLAN.md checklist.

### Per-book setup (one-time, before first chapter)

```
1. config.py:
   - Add to BOOK_META: { 'jeremiah': { 'is_nt': False, ... } }
   - Add to COMMENTATOR_SCOPE for each scholar covering this book
   - Update SCHOLAR_REGISTRY if new scholars are added this wave

2. content/meta/books.json:
   - Add book entry with is_live: true
   - Set correct book_order (canonical position 1-66)

3. content/meta/scholar-scopes.json:
   - Add/update scope arrays for scholars covering this book

4. VHL template:
   - Define default VHL groups for the book (DIVINE, PLACES, PEOPLE, TIME, KEY)
   - Book-specific word lists (e.g., Jeremiah: "oracle", "exile", "return")

5. People data (content/meta/people.json):
   - Add any new people introduced in this book
   - Update existing people with new refs/chapter links

6. Timeline data (content/meta/timelines.json):
   - Add events for this book's narrative
   - Connect events to chapter links

7. Map data (content/meta/places.json + map-stories.json):
   - Add any new places (Jeremiah: Anathoth, Mizpah, Tahpanhes)
   - Add map stories for key journeys

8. Word studies (content/meta/word-studies.json):
   - Add book-specific key terms (Jeremiah: nāvî "prophet", šûv "return/repent")

9. Reading plans:
   - Update affected plans if the new book belongs to one
   - New plans may be added (e.g., "Major Prophets" plan once Jer+Ezek done)
```

### Per-scholar setup (one-time, at first use)

```
1. config.py SCHOLAR_REGISTRY:
   - Add entry: { 'lundbom': { 'name': 'Jack R. Lundbom', 'label': 'Lundbom', ... } }

2. content/meta/scholars.json:
   - Add full entry with id, name, label, tradition, era, scope, color

3. content/meta/scholar-bios.json:
   - Add bio with eyebrow, sections: [Biography, Interpretive Approach,
     Theological Tradition, Key Works, Appears In]

4. theme/colors.ts (app code):
   - Add scholar color to scholars object
   - This requires an OTA code update (not just content) — but only
     once per wave, not per book. Bundle all new scholar colors
     for a wave in one app update.
   
   ALTERNATIVE: Store scholar colors in scholars.json (already there)
   and read from SQLite at runtime instead of hardcoding in theme.
   This avoids app updates for new scholar colors entirely.
   RECOMMENDED: use this approach. Phase 2B's getScholarColor() should
   read from the scholars table, not from a hardcoded map.
```

---

## Enrichment Batch Templates

### Template: Isaiah Enrichment (add ctx, cross, calvin, netbible, oswalt, childs)

Each enrichment batch adds 6 panel types to ~11 existing chapters.

```
Isaiah enrichment batch. Chapters {START}-{END}.

READ _tools/PHASE_10_PLAN.md enrichment template.
READ _tools/REACT_NATIVE_PLAN.md for panel JSON formats.

For each chapter {START} through {END}, load the existing
content/isaiah/{ch}.json and ADD these panels to each section:

1. ctx: Historical/literary context paragraph (2-4 sentences per section)
2. cross: 3-5 cross-references per section with notes
3. calvin: 3-5 Calvin commentary notes per section
4. netbible: 3-5 NET Bible translation/textual notes per section
5. oswalt: 3-5 Oswalt (NICOT Isaiah) commentary notes per section
6. childs: 3-5 Childs (canonical approach) commentary notes per section

The heb (Hebrew), mac (MacArthur), lit, themes, ppl, trans, src, rec,
thread, textual, debate panels already exist from the base build.

After adding panels:
- save_chapter('isaiah', {ch}, data) for each chapter
- python3 _tools/build_sqlite.py
- python3 _tools/validate.py
- Commit and push
- eas update --branch production (OTA to devices)
```

### Template: MacArthur-only Enrichment (Kings/Chronicles)

Each batch adds only MacArthur notes to ~11 existing chapters.

```
Kings/Chronicles MacArthur batch. {BOOK} chapters {START}-{END}.

READ _tools/PHASE_10_PLAN.md MacArthur enrichment template.

For each chapter, load content/{book}/{ch}.json and ADD mac panel
to each section:
- mac: 4-5 MacArthur Study Bible notes per section
  Format: [{"ref": "ch:v", "note": "MacArthur commentary..."}]

All other panels already exist. Only adding MacArthur.
After: save_chapter, build_sqlite, validate, commit, eas update.
```

### Template: New Book (full build from scratch)

Each batch creates ~11 chapters from scratch with all panels.

```
{BOOK} new chapters {START}-{END}.

READ _tools/PHASE_10_PLAN.md new book template.
READ _tools/GENERATOR_TEMPLATE.py for the exact function signature.

Ensure book infrastructure is complete BEFORE this batch:
- {BOOK} in books.json with is_live: true
- Scholar scopes updated for all scholars covering {BOOK}
- VHL word lists defined for {BOOK}

For each chapter {START} through {END}, create full content:

save_chapter('{book}', {ch}, {
    'title': 'Chapter Title',
    'sections': [{
        'header': 'Verses X–Y — "Section Title"',
        'verses': verse_range(X, Y),
        'heb': [(word, tlit, gloss, paragraph), ...],  # 3-5 per section
        'ctx': 'Context paragraph...',
        'cross': [('Ref', 'note'), ...],  # 3-5 per section
        'mac': [('ch:v', 'note'), ...],   # 4-5 per section
        'calvin': [('ch:v', 'note'), ...],
        'netbible': [('ch:v', 'note'), ...],
        # Book-specific scholars:
        '{scholar1}': [('ch:v', 'note'), ...],
        '{scholar2}': [('ch:v', 'note'), ...],
    }, {
        # section 2...
    }],
    'lit': ([('label', 'range', 'text', is_key), ...], 'Structure note'),
    'themes': ([('Covenant',N), ...10 themes...], 'Theme note'),
})

After each batch: build_sqlite, validate, commit, eas update.
```

---

## Execution Schedule

### Stage 1: Clear Enrichment Debt (9 sessions)

| Batch | Content | Chapters | Session |
|-------|---------|----------|---------|
| 10.E1 | Isaiah 23-33 enrichment | 11 | 1 |
| 10.E2 | Isaiah 34-44 enrichment | 11 | 1 |
| 10.E3 | Isaiah 45-55 enrichment | 11 | 2 |
| 10.E4 | Isaiah 56-66 enrichment | 11 | 2 |
| 10.E5 | 1 Kings 1-11 MacArthur | 11 | 3 |
| 10.E6 | 1 Kings 12-22 MacArthur | 11 | 3 |
| 10.E7 | 2 Kings 1-13 MacArthur | 13 | 4 |
| 10.E8 | 2 Kings 14-25 MacArthur | 12 | 4 |
| 10.E9 | 1 Chronicles 1-15 MacArthur | 15 | 5 |
| 10.E10 | 1 Chronicles 16-29 MacArthur | 14 | 5 |
| 10.E11 | 2 Chronicles 1-18 MacArthur | 18 | 6 |
| 10.E12 | 2 Chronicles 19-36 MacArthur | 18 | 6 |
| 10.E13 | Ezra 1-10 enrichment | 10 | 7 |
| 10.E14 | Nehemiah 1-13 enrichment | 13 | 7 |
| 10.E15 | Esther 1-10 enrichment | 10 | 8 |
| | **Subtotal** | **189** | **~9 sessions** |

**OTA cadence:** Push an update after every session (2 batches). Users see new content within a day of each session.

### Stage 2: Wave 3 Completion — Jeremiah + Ezekiel (6 sessions)

**Pre-build infrastructure (1 batch):**
```
Wave 3 completion: scholar + book infrastructure.

1. Add 3 new scholars to config.py + scholars.json + scholar-bios.json:
   - lundbom: Jack R. Lundbom (Jeremiah, Anchor Bible)
   - brueggemann: Walter Brueggemann (Jeremiah, theology of exile)
   - zimmerli: Walther Zimmerli (Ezekiel, Hermeneia)
   
2. Add to books.json: jeremiah (is_live:true), ezekiel (is_live:true)
3. Update scholar-scopes.json: block → add ezekiel
4. Add people: Jeremiah, Baruch, Ezekiel, Nebuchadnezzar (if not already)
5. Add timeline events: Fall of Jerusalem (586 BC), Exile begins, Ezekiel's call
6. Add map places: Anathoth, Babylon (if not already), Chebar canal, Tel-Abib
7. Add map stories: Exile to Babylon, Ezekiel's visions
8. Add word studies: nāvî (prophet), šûv (return), gôlâ (exile)
9. Define VHL word lists for both books
10. build_sqlite, validate, commit, push
```

| Batch | Content | Chapters | Session |
|-------|---------|----------|---------|
| 10.W3.0 | Infrastructure (above) | — | 1 |
| 10.W3.1 | Jeremiah 1-10 | 10 | 1 |
| 10.W3.2 | Jeremiah 11-21 | 11 | 2 |
| 10.W3.3 | Jeremiah 22-32 | 11 | 2 |
| 10.W3.4 | Jeremiah 33-42 | 10 | 3 |
| 10.W3.5 | Jeremiah 43-52 | 10 | 3 |
| 10.W3.6 | Ezekiel 1-12 | 12 | 4 |
| 10.W3.7 | Ezekiel 13-24 | 12 | 4 |
| 10.W3.8 | Ezekiel 25-36 | 12 | 5 |
| 10.W3.9 | Ezekiel 37-48 | 12 | 5 |
| | **Subtotal** | **100** | **~6 sessions** |

### Stage 3: Wave 4 — Minor Prophets (4 sessions)

**Pre-build infrastructure (1 batch):** Add ~7 scholars, 12 books to books.json, VHL templates, people, timeline events, map stories.

| Batch | Content | Chapters | Session |
|-------|---------|----------|---------|
| 10.W4.0 | Infrastructure | — | 1 |
| 10.W4.1 | Jonah (4) + Amos 1-5 (5) | 9 | 1 |
| 10.W4.2 | Amos 6-9 (4) + Hosea 1-7 (7) | 11 | 2 |
| 10.W4.3 | Hosea 8-14 (7) + Micah (7) | 14 | 2 |
| 10.W4.4 | Habakkuk (3) + Joel (3) + Obadiah (1) + Nahum (3) | 10 | 3 |
| 10.W4.5 | Zephaniah (3) + Haggai (2) + Malachi (4) | 9 | 3 |
| 10.W4.6 | Zechariah 1-14 | 14 | 4 |
| | **Subtotal** | **67** | **~4 sessions** |

### Stage 4: Wave 5 — Pauline Epistles (4 sessions)

**Pre-build infrastructure (1 batch):** Add ~9 scholars, 13 books, Greek word studies, NT timeline events, Paul's journey map stories.

| Batch | Content | Chapters | Session |
|-------|---------|----------|---------|
| 10.W5.0 | Infrastructure | — | 1 |
| 10.W5.1 | Romans 1-8 | 8 | 1 |
| 10.W5.2 | Romans 9-16 | 8 | 2 |
| 10.W5.3 | Galatians (6) + Ephesians (6) | 12 | 2 |
| 10.W5.4 | Philippians (4) + Colossians (4) + 1 Thess (5) | 13 | 3 |
| 10.W5.5 | 2 Thess (3) + 1 Corinthians 1-8 | 11 | 3 |
| 10.W5.6 | 1 Corinthians 9-16 + 2 Corinthians 1-5 | 13 | 4 |
| 10.W5.7 | 2 Corinthians 6-13 + 1 Tim (6) + 2 Tim (4) + Titus (3) + Philemon (1) | 22 | 4 |
| | **Subtotal** | **76** | **~4 sessions** |

### Stage 5: Wave 6 — General Epistles + Hebrews (2 sessions)

**Pre-build infrastructure (1 batch):** Add ~5 scholars, 8 books, extend existing scholars (moo→James, schreiner→1-2 Peter+Jude).

| Batch | Content | Chapters | Session |
|-------|---------|----------|---------|
| 10.W6.0 | Infrastructure | — | 1 |
| 10.W6.1 | Hebrews 1-13 | 13 | 1 |
| 10.W6.2 | James (5) + 1 Peter (5) + 2 Peter (3) + Jude (1) | 14 | 2 |
| 10.W6.3 | 1 John (5) + 2 John (1) + 3 John (1) | 7 | 2 |
| | **Subtotal** | **34** | **~2 sessions** |

### Stage 6: Wave 7 — Revelation (1 session)

**Pre-build infrastructure (small):** Add 2 scholars (beale, osborne). This book references everything — all cross-reference targets are now live.

| Batch | Content | Chapters | Session |
|-------|---------|----------|---------|
| 10.W7.0 | Infrastructure + Revelation 1-11 | 11 | 1 |
| 10.W7.1 | Revelation 12-22 | 11 | 1 |
| | **Subtotal** | **22** | **~1 session** |

---

## Supporting Data Expansion

Each wave doesn't just add chapter content — it expands the app's interconnected data layers. These are included in the infrastructure batches but are significant enough to call out.

### People (content/meta/people.json)

| Wave | New people | Examples |
|------|-----------|---------|
| Wave 3 | ~15 | Jeremiah, Baruch, Gedaliah, Ezekiel, Daniel's companions (if not already) |
| Wave 4 | ~20 | Hosea/Gomer, Amos, Jonah, Micah, Habakkuk, Haggai, Zechariah, Malachi |
| Wave 5 | ~25 | Paul (extend), Timothy, Titus, Philemon, Onesimus, Priscilla, Aquila, Apollos, Phoebe, Lydia |
| Wave 6 | ~10 | James (brother of Jesus), Jude, Diotrephes, Gaius |
| Wave 7 | ~5 | John of Patmos (extend), the 7 churches personified |
| **Total** | **~75** | **211 → ~286 people** |

### Timeline events (content/meta/timelines.json)

| Wave | New events | Examples |
|------|-----------|---------|
| Wave 3 | ~15 | Fall of Jerusalem, Exile begins, Ezekiel's temple vision, Valley of dry bones |
| Wave 4 | ~12 | Jonah and Nineveh, Amos's visions, Hosea's marriage, Temple rebuilt (Haggai) |
| Wave 5 | ~20 | Paul's conversion (already exists), each epistle's writing date, Council of Jerusalem |
| Wave 6 | ~8 | Hebrews written (pre-70 AD?), James martyred, Peter in Rome |
| Wave 7 | ~5 | John exiled to Patmos, 7 letters written, New Jerusalem vision |
| **Total** | **~60** | **216 → ~276 events** |

### Map places + stories

| Wave | New places | New stories | Examples |
|------|-----------|------------|---------|
| Wave 3 | ~5 | ~3 | Anathoth, Tel-Abib; Exile journey, Ezekiel's visions |
| Wave 4 | ~3 | ~2 | Tekoa (Amos); Jonah's journey (extend existing) |
| Wave 5 | ~8 | ~5 | Corinth, Ephesus, Philippi, Colossae, Thessalonica; Paul's 3 journeys (extend existing) |
| Wave 6 | ~3 | ~2 | Patmos; destinations of general epistles |
| Wave 7 | ~2 | ~3 | 7 churches of Revelation (Ephesus, Smyrna, Pergamum, etc.) |
| **Total** | **~21** | **~15** | **71→~92 places, 28→~43 stories** |

### Word studies (content/meta/word-studies.json)

| Wave | New entries | Examples |
|------|-----------|---------|
| Wave 3 | ~5 | nāvî (prophet), gôlâ (exile), šûv (return), rûaḥ (spirit), kāvôd (glory) |
| Wave 4 | ~3 | mišpāṭ (justice), ḥezyôn (vision), yôm YHWH (Day of the LORD) |
| Wave 5 | ~8 | dikaiosynē (righteousness), pistis (faith), charis (grace), agapē (love), sarx (flesh), pneuma (spirit) |
| Wave 6 | ~3 | pistis (extend), hypomonē (endurance), parousia (coming) |
| Wave 7 | ~3 | apokalypsis (revelation), arnion (lamb), nikōn (conqueror) |
| **Total** | **~22** | **15 → ~37 entries** |

---

## OTA Deployment Workflow

Every content session ends with an OTA push. This is the workflow:

```bash
# After each content batch:
python3 _tools/build_sqlite.py           # Rebuild database from all JSON
python3 _tools/validate.py               # Validate all content
python3 _tools/validate_sqlite.py        # Validate database integrity

git add content/ scripture.db
git commit -m "Content: {book} {chapters} — {description}"
git push origin master

# Push to all installed apps:
cd app
eas update --branch production --message "{book} {chapters} now available"
```

**User experience:** Users see a brief loading indicator on next app launch, then the new content is available. No store review, no manual update needed.

**Frequency:** After every session (~2 batches). Users receive 1-2 content updates per week during active authoring.

---

## Quality Gates

Every content batch must pass before OTA:

1. **validate.py** — JSON schema validation for all new/modified chapters
2. **validate_sqlite.py** — database integrity (referential, completeness, FTS5)
3. **Spot check** — manually open 2 chapters from the batch in the app and verify:
   - All panels render
   - No empty panels
   - Hebrew/Greek entries display correctly
   - Cross-references are tappable
   - Scholar commentary is properly attributed
4. **New scholar check** (if scholars added this wave):
   - Scholar appears in ScholarBrowseScreen
   - Scholar bio renders in ScholarBioScreen
   - Scholar's color renders in CommentaryPanel headers
   - Scholar scope shows correct books

---

## Milestones

| Milestone | Chapters live | Books live | Target |
|-----------|-------------|-----------|--------|
| App launch (Phase 9) | 879 | 30 | Week 23 |
| Enrichment complete | 879 (all at 15 btn) | 30 | +9 sessions |
| Major prophets complete | 979 | 32 | +15 sessions |
| Minor prophets complete | 1,046 | 44 | +19 sessions |
| Pauline epistles complete | 1,122 | 57 | +23 sessions |
| General epistles complete | 1,156 | 65 | +25 sessions |
| **Revelation complete (FULL BIBLE)** | **1,189** | **66** | **+26 sessions** |

At a pace of 2 sessions per week: **~13 weeks (3 months) post-launch to complete the full Bible.**

At 1 session per week: **~26 weeks (6 months).**

---

## Batch Prompt Templates

### Prompt: Enrichment batch (add panels to existing chapters)

```
Content enrichment: {BOOK} chapters {START}-{END}.
Add {PANEL_LIST} panels to each section.

READ _tools/PHASE_10_PLAN.md enrichment template.

For each chapter {START} through {END}:
1. Load content/{book}/{ch}.json
2. For each section, add:
   {PANEL_DETAILS}
3. save_chapter('{book}', {ch}, data)

After all chapters:
- python3 _tools/build_sqlite.py
- python3 _tools/validate.py
- git add content/ scripture.db && git commit
- eas update --branch production
```

### Prompt: New book infrastructure

```
Wave {N} infrastructure: Add {BOOK_LIST} to the content pipeline.

READ _tools/PHASE_10_PLAN.md new book infrastructure checklist.

1. SCHOLARS: Add {SCHOLAR_LIST} to config.py SCHOLAR_REGISTRY,
   content/meta/scholars.json, content/meta/scholar-bios.json.
   Each scholar needs: id, name, label, tradition, era, scope, color,
   bio with 5 sections (Biography, Approach, Tradition, Key Works, Appears In).

2. BOOKS: Add {BOOK_LIST} to content/meta/books.json with is_live:true.
   Update content/meta/scholar-scopes.json.

3. PEOPLE: Add {PEOPLE_LIST} to content/meta/people.json with full fields
   (id, name, gender, father, mother, spouseOf, era, dates, role, bio,
   refs, chapter link).

4. TIMELINE: Add {EVENT_LIST} to content/meta/timelines.json.

5. MAP: Add {PLACE_LIST} to content/meta/places.json.
   Add {STORY_LIST} to content/meta/map-stories.json.

6. WORD STUDIES: Add {WORD_LIST} to content/meta/word-studies.json.

7. VHL: Define default word groups for each new book.

8. build_sqlite, validate, commit, push, eas update.
```

### Prompt: New book chapter batch

```
{BOOK} chapters {START}-{END} (new book, full build).

READ _tools/PHASE_10_PLAN.md new book template.
READ _tools/GENERATOR_TEMPLATE.py.

Infrastructure for {BOOK} is already set up (scholars, books.json, VHL).
Book-specific scholars: {SCHOLAR_LIST} (+ MacArthur, Calvin, NET Bible).

For each chapter, create full content with save_chapter():
- title, 2+ sections
- Each section: heb (3-5 entries), ctx, cross (3-5), mac (4-5),
  calvin (3-5), netbible (3-5), {scholar1} (3-5), {scholar2} (3-5)
- Chapter-level: lit, themes (10 scores), auto-generated: ppl, trans,
  src, rec, thread, textual, debate

{BOOK}-specific guidance:
{BOOK_SPECIFIC_NOTES}

After: build_sqlite, validate, commit, eas update.
```

---

## Verification Checklist (per wave completion)

- [ ] All chapters for the wave are in content/{book}/{ch}.json
- [ ] scripture.db rebuilt and passes validate_sqlite.py
- [ ] New scholars appear in ScholarBrowseScreen with correct colors and bios
- [ ] New people appear in GenealogyTreeScreen (if biblical figures with family links)
- [ ] New timeline events appear in TimelineScreen at correct dates
- [ ] New map places/stories appear in MapScreen
- [ ] New word studies appear in WordStudyBrowseScreen
- [ ] Cross-references from new chapters to existing chapters resolve correctly
- [ ] Cross-references from existing chapters to new chapters resolve correctly
- [ ] OTA update received by test device within minutes
- [ ] Reading plans updated if affected books are now live
- [ ] Book intros already existed (all 66 written) — verify they render for new books

## Final Verification (after Revelation completes)

- [ ] 66 books, 1,189 chapters live
- [ ] All chapters at 15+ button enrichment level
- [ ] ~68 scholars in the system with full bios
- [ ] ~286 people in genealogy tree
- [ ] ~276 timeline events
- [ ] ~92 map places, ~43 map stories
- [ ] ~37 word study entries
- [ ] Every cross-reference in the entire Bible resolves to a live chapter
- [ ] "Read Through the Bible" reading plan covers all 1,189 chapters
- [ ] App database size still < 50MB
- [ ] OTA update with full Bible database delivers to devices successfully
