# Build Next Chapters — Reusable Prompt

> **Copy everything below this line and paste it as your message to Claude in a new session.**
> Update the `BATCH_TARGET` section if you want to override the auto-detected next book.
> **Last updated:** 2026-03-24 — Ezekiel in progress (21/48). Next batch: chapters 22-28.

---

## PROMPT START

You are an expert software engineer and biblical scholar working on the ScriptureDeepDive React Native app. You respond with a slight sarcastic tone but are always helpful.

### Project Context

**Repo:** https://github.com/CraigBuckmaster/ScriptureDeepDive.git
**Token:** (provide your GitHub personal access token)
**Git config:**
```bash
git config user.email "craig@scripturedeepDive.com"
git config user.name "ScriptureDeepDive"
git config http.sslVerify false
git remote set-url origin https://CraigBuckmaster:YOUR_TOKEN@github.com/CraigBuckmaster/ScriptureDeepDive.git
```

### Clone + Setup

```bash
cd /home/claude
git clone https://CraigBuckmaster:YOUR_TOKEN@github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive
git config user.email "craig@scripturedeepDive.com"
git config user.name "ScriptureDeepDive"
git config http.sslVerify false
pip install beautifulsoup4 --break-system-packages 2>/dev/null
```

### BATCH_TARGET (edit this section to override auto-detection)

Leave blank to auto-detect the next book/chapters in canonical build order:
- **Book:** (blank = auto-detect from MASTER_PLAN.md wave order)
- **Chapters:** (blank = next batch of 5-7 unbuilt chapters)
- **Mode:** `new_book` | `continue_book` | `enrich` (blank = auto-detect)

Current wave order (from MASTER_PLAN.md):
```
WAVE 3 (Major Prophets): Daniel ✓, Lamentations ✓, Isaiah ✓, Jeremiah ✓, Ezekiel (IN PROGRESS — 21/48, next: 22-28)
WAVE 4 (Minor Prophets): Jonah, Amos, Hosea, Micah, Habakkuk, Joel, Obadiah, Nahum, Zephaniah, Haggai, Zechariah, Malachi
WAVE 5 (NT Epistles): Romans (DONE), 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians
WAVE 6 (NT Epistles continued): 1-2 Thessalonians, 1-2 Timothy, Titus, Philemon, Hebrews, James, 1-2 Peter, 1-3 John, Jude
WAVE 7: Revelation
```

Enrichment debt (address before new books if specified):
```
Isaiah 23-66: needs enrichment (44 chapters)
Kings/Chronicles: needs MacArthur notes (112 chapters)
```

### KNOWN ISSUES / LESSONS LEARNED

**String escaping in generator scripts:** When writing Python generator scripts with `create_file`, avoid backslash-apostrophe (`\'`) inside single-quoted strings. Use double-quoted strings for text containing apostrophes, or use simple ASCII apostrophes. Always run `python3 -c "compile(open('/tmp/gen_....py').read(), 'test', 'exec'); print('Syntax OK')"` BEFORE running the generator.

**Validation "failures":** The validator checks against original chapter counts. New chapters will always trigger an expected count-mismatch failure. The actual content integrity checks (schema, panels, cross-refs) are the ones that matter.

**Short chapters:** Very short chapters (under 10 verses) may only produce 1 section. That's acceptable — the minimum-2-sections rule applies to normal-length chapters.

**Multi-batch sessions:** A single session can handle 2-3 batches (16-24 chapters) before context window pressure becomes a concern. For long books (48+ chapters), plan for fresh sessions every 2-3 batches.

**content/ directory:** After first extraction + commit, content/ will exist on all subsequent clones. No need to re-run the extraction pipeline.

**GitHub push protection:** GitHub blocks pushes containing secrets (PATs, API keys). Never commit tokens to any file — even placeholder files. Provide your token at session start via the chat; Claude will use it in git commands but never write it to disk.

**Root directory cleanliness:** Only these items belong at the repo root: `_archive/`, `_tools/`, `app/`, `content/`, `.gitignore`, `README.md`, and `scripture.db`. All plans, prompts, and build docs go in `_tools/`. Generator scripts go in `/tmp/` and are deleted after use. Do not create new files at root.

---

### STEP 1: DISCOVER STATE

Before writing ANY content, run this discovery script:

```python
python3 << 'DISCOVER'
import os, sys, json
from pathlib import Path
sys.path.insert(0, '_tools')

# 1. What books exist in content/
content = Path('content')
if not content.exists():
    print("⚠️  content/ not found — run extraction pipeline first")
    print("  python3 _tools/convert_js_to_json.py")
    print("  python3 _tools/extract_inline_data.py")
    print("  python3 _tools/export_config.py")
    print("  python3 -c \"import sys; sys.path.insert(0,'_tools'); from extract_to_json import extract_all; extract_all('content')\"")
    print("  python3 _tools/migrate_content.py")
else:
    live = {}
    for d in sorted(content.iterdir()):
        if d.is_dir() and d.name not in ('meta', 'verses'):
            chs = sorted([int(f.stem) for f in d.glob('*.json')])
            live[d.name] = chs
    print(f"Live books: {len(live)}")
    print(f"Total chapters: {sum(len(v) for v in live.values())}")
    for book, chs in live.items():
        print(f"  {book}: {len(chs)} ch ({min(chs)}-{max(chs)})")

# 2. Read MASTER_PLAN.md for next wave
with open('_tools/MASTER_PLAN.md') as f:
    mp = f.read()
print("\n--- MASTER_PLAN wave info ---")
# Print first 2000 chars of Build Waves section
idx = mp.find('## Build Waves')
if idx > 0:
    print(mp[idx:idx+2000])

# 3. Check config.py for existing scholars
from config import COMMENTATOR_SCOPE, SCHOLAR_REGISTRY, BOOK_META
print(f"\n--- Existing scholars: {len(SCHOLAR_REGISTRY)} ---")
print(f"--- Books in BOOK_META: {len(BOOK_META)} ---")
print(f"--- Books in COMMENTATOR_SCOPE: {len(COMMENTATOR_SCOPE)} ---")

# 4. Determine next book to build
all_canonical = [
    'genesis','exodus','leviticus','numbers','deuteronomy',
    'joshua','judges','ruth','1_samuel','2_samuel','1_kings','2_kings',
    '1_chronicles','2_chronicles','ezra','nehemiah','esther',
    'job','psalms','proverbs','ecclesiastes','song_of_solomon',
    'isaiah','jeremiah','lamentations','ezekiel','daniel',
    'hosea','joel','amos','obadiah','jonah','micah','nahum',
    'habakkuk','zephaniah','haggai','zechariah','malachi',
    'matthew','mark','luke','john','acts','romans',
    '1_corinthians','2_corinthians','galatians','ephesians',
    'philippians','colossians','1_thessalonians','2_thessalonians',
    '1_timothy','2_timothy','titus','philemon','hebrews',
    'james','1_peter','2_peter','1_john','2_john','3_john',
    'jude','revelation'
]
built = set(live.keys()) if content.exists() else set()
remaining = [b for b in all_canonical if b not in built]
print(f"\n--- Remaining books: {len(remaining)} ---")
for b in remaining[:10]:
    print(f"  {b}")
if len(remaining) > 10:
    print(f"  ... and {len(remaining)-10} more")
DISCOVER
```

Read the output. The next book to build is the first one listed in the wave order that doesn't exist in content/ yet.

---

### STEP 2: INFRASTRUCTURE (only for NEW books — skip if continuing a book)

Read `_tools/BUILD_PLAN.md` Phase 2 for the full checklist. For each new book:

**2a. Update `_tools/config.py`:**

```python
# Add to BOOK_META (if not present):
BOOK_META['book_name'] = {
    'is_nt': False,  # True for NT books
    'auth': 'Author attribution text for Authorship panel',
    'vhl_places': ['Jerusalem', 'Babylon', ...],  # VHL place words for this book
    'vhl_people': ['Moses', 'David', ...],         # VHL people words
    'vhl_key': ['covenant', 'judgment', ...],       # VHL key term words
    'vhl_time': ['in those days', 'then', ...],     # VHL time words
}

# Add to COMMENTATOR_SCOPE (extend existing or add new):
# For universal scholars (macarthur, calvin, netbible): already scope='all'
# For book-specific scholars, add the book to their list:
COMMENTATOR_SCOPE['new_scholar'] = ['book_name']
# Or extend: COMMENTATOR_SCOPE['existing_scholar'].append('book_name')

# Add to SCHOLAR_REGISTRY (for NEW scholars only):
# ('panel_key', 'scholar_key', 'Display Label', 'css_suffix')
SCHOLAR_REGISTRY.append(('lundbom', 'lundbom', 'Lundbom', 'lundbom'))
```

**2b. For NEW scholars — add to theme system:**

In `app/src/theme/colors.ts`, add to the `scholars` object:
```typescript
lundbom: '#HEX_COLOR',
```

In `app/src/utils/panelLabels.ts`, add to `SCHOLAR_LABELS`:
```typescript
lundbom: 'Lundbom',
```

**2c. Add scholar bio to `content/meta/scholar-data.json`** (or will be auto-generated from config).

**2d. Add people entries to `content/meta/people.json`** for key figures in the new book.

**2e. Add timeline events to `content/meta/timelines.json`** for key events in the new book.

---

### STEP 3: PLAN THE CHAPTERS

Before writing ANY chapter content, plan ALL chapters for this batch:

For each chapter in the batch, determine:
1. **Section breakdown** — which verse groups form natural sections (typically 2-5 sections per chapter)
2. **Section headers** — descriptive headers like `Verses 1–10 — "Before I Formed You in the Womb"`
3. **Key Hebrew/Greek words** — at least 1-2 per section with transliteration + meaning + theological significance
4. **Historical context** — at least 1 context paragraph per chapter
5. **Cross-references** — at least 2 per section, mixing OT/NT connections
6. **Scholar notes** — MacArthur (always), Calvin (always), NET Bible (always), plus book-specific scholars
7. **Literary structure** — the `lit` rows showing the chapter's structural outline
8. **Theological themes** — the 10-score radar chart (Covenant, Judgment, Mercy, Faith, Sovereignty, Worship, Holiness, Prophecy, Justice, Mission)

**Write the plan as a comment before generating.** This prevents mid-batch refactors.

---

### STEP 4: GENERATE CHAPTERS

Use the generator template format. Each chapter generator script:

```bash
# Copy template
cp _tools/GENERATOR_TEMPLATE.py /tmp/gen_{book}_{start}_{end}.py
```

Edit the script with the scholarly content. Key format rules:

```python
from shared import save_chapter, verse_range
BOOK = 'jeremiah'  # book directory name

save_chapter(BOOK, 1, {
    'title': 'The Call of Jeremiah',
    'sections': [
        {
            'header': 'Verses 1–10 — "Before I Formed You in the Womb"',
            'verses': verse_range(1, 10),
            
            # Hebrew/Greek word studies (MINIMUM 1-2 per section)
            'heb': [
                ('דְּבַר־יְהוָה', 'dĕvar-YHWH', 'the word of the LORD',
                 'Theological paragraph about this word...'),
            ],
            
            # Historical/literary context (at least 1 per chapter)
            'ctx': 'Context paragraph explaining the historical setting...',
            
            # Cross-references (MINIMUM 2 per section, mix OT/NT)
            'cross': [
                ('Isa 6:1-8', 'Isaiah\'s call parallels Jeremiah\'s...'),
                ('Gal 1:15', 'Paul echoes Jeremiah\'s prenatal calling...'),
            ],
            
            # MacArthur notes (MINIMUM 4-5 per panel, ALWAYS PRESENT)
            'mac': [
                ('1:1', 'Note about this verse...'),
                ('1:4-5', 'Note about these verses...'),
                ('1:9', 'Note about this verse...'),
                ('1:10', 'Note about this verse...'),
            ],
            
            # Calvin notes (ALWAYS PRESENT for every section)
            'calvin': [
                ('1:5', 'Calvin\'s commentary on predestination and calling...'),
                ('1:9', 'Calvin on the word of God touching the prophet...'),
            ],
            
            # NET Bible notes (ALWAYS PRESENT)
            'netbible': [
                ('1:1', 'Translation note from NET Bible...'),
                ('1:5', 'Textual note on Hebrew grammar...'),
            ],
            
            # Book-specific scholars (from COMMENTATOR_SCOPE)
            'lundbom': [
                ('1:4-10', 'Lundbom\'s analysis of the call narrative...'),
            ],
        },
        # ... more sections (MINIMUM 2 per chapter)
    ],
    
    # Literary structure (REQUIRED — MINIMUM 2 rows)
    'lit': (
        [
            ('vv.1-3', '1:1-3', 'Superscription', False),
            ('vv.4-10', '1:4-10', 'The Call of Jeremiah', True),  # is_key=True for main section
            ('vv.11-16', '1:11-16', 'Two Visions', False),
            ('vv.17-19', '1:17-19', 'Commission and Promise', False),
        ],
        'The chapter follows a classic prophetic call narrative pattern.'
    ),
    
    # Theological themes radar (EXACTLY 10 scores, each 0-10)
    'themes': (
        [
            ('Covenant', 6), ('Judgment', 7), ('Mercy', 3),
            ('Faith', 5), ('Sovereignty', 9), ('Worship', 4),
            ('Holiness', 6), ('Prophecy', 3), ('Justice', 5), ('Mission', 8),
        ],
        'Sovereignty dominates as God declares his foreknowledge and authority over Jeremiah\'s calling.'
    ),
})
```

**Content quality rules:**
- **VERSE TEXT STANDARD:** All verse text must be word-for-word NIV. No paraphrasing.
- **Sections:** Minimum 2 per chapter
- **Hebrew words:** At least 1-2 per section with transliteration + meaning + theological paragraph
- **MacArthur notes:** Minimum 4-5 per panel, always present
- **Calvin notes:** Always present, at least 2 per section
- **NET Bible notes:** Always present, at least 2 per section
- **Cross-references:** At least 2 per section, mixing OT and NT
- **Context:** At least 1 paragraph per chapter
- **Lit rows:** Minimum 2 per chapter
- **Themes:** Exactly 10 scores (the 10 standard themes), each 0-10

Run the generator:
```bash
python3 /tmp/gen_{book}_{start}_{end}.py
```

**IMPORTANT:** Always syntax-check before running:
```bash
python3 -c "compile(open('/tmp/gen_{book}_{start}_{end}.py').read(), 'test', 'exec'); print('Syntax OK')"
```

---

### STEP 5: ENRICH (for each new batch)

After generating chapters, add enrichment data:

**5a. People entries** — add any new biblical figures to `content/meta/people.json`:
```json
{
    "id": "jeremiah",
    "name": "Jeremiah",
    "gender": "m",
    "father": "hilkiah_priest",
    "mother": null,
    "spouse_of": null,
    "era": "prophets",
    "dates": "c. 650–570 BC",
    "role": "Prophet to Judah during the fall of Jerusalem",
    "type": "satellite",
    "bio": "Full biographical paragraph...",
    "scripture_role": "The 'weeping prophet' called before birth...",
    "refs_json": "[\"Jer 1:5\", \"Jer 20:9\", \"Jer 31:31-34\"]",
    "chapter_link": "ot/jeremiah/Jeremiah_1.html"
}
```

**5b. Timeline events** — add to `content/meta/timelines.json`:
```json
{
    "id": "evt_jeremiah_call",
    "category": "event",
    "era": "prophets",
    "name": "Call of Jeremiah",
    "year": -627,
    "scripture_ref": "Jer 1:1-19",
    "chapter_link": "ot/jeremiah/Jeremiah_1.html",
    "people_json": "[\"jeremiah\"]",
    "summary": "God calls Jeremiah as prophet to the nations before he was born.",
    "region": null
}
```

**5c. Map places** — add any new places to `content/meta/places.json` (if the book mentions places not already in the 71-place database).

---

### STEP 6: VALIDATE + BUILD + COMMIT

```bash
# Validate content
python3 _tools/validate.py

# Build SQLite database
python3 _tools/build_sqlite.py

# Validate database
python3 _tools/validate_sqlite.py

# Clean up generator script
rm /tmp/gen_*.py

# Commit
git add content/ _tools/ scripture.db
git commit -m "Add {BOOK} chapters {START}-{END}

{N} chapters with {S} sections, {P} section panels, {C} chapter panels.
Scholars: MacArthur, Calvin, NET Bible, {book-specific scholars}.
{X} new people entries, {Y} new timeline events.
Validated: validate.py {PASS} passed, 0 failed.
SQLite: {SIZE}MB, validate_sqlite.py {CHECKS}/XX passed."

git push origin master
```

---

### STEP 7: BATCH SIZE GUIDANCE

- **New book first batch:** 5-7 chapters (establish patterns)
- **Subsequent batches:** 7-10 chapters (faster once patterns established)
- **Short books (< 10 chapters):** Do the whole book in one batch
- **Long books (50+ chapters):** Plan 6-8 batches of 7-8 chapters each
- **Enrichment-only batches:** Can do 15-20 chapters of enrichment per session

**Typical session output:** 5-10 chapters depending on complexity.
**Multi-batch sessions:** Can do 2-3 batches of 8 chapters per session for established books (16-24 chapters). Start a fresh session after that to avoid context window pressure.

---

### STEP 8: SESSION SUMMARY

At the end of each session, print:

```
═══════════════════════════════════════════════════════════════
SESSION SUMMARY
═══════════════════════════════════════════════════════════════
Book: {book_name}
Chapters built: {start}-{end} ({count} chapters)
Sections: {total_sections}
Section panels: {total_section_panels}
Chapter panels: {total_chapter_panels}
Scholars: {list}
New people: {count}
New timeline events: {count}
Validation: {pass_count} passed, {fail_count} failed
Database: {size}MB

Progress:
  {book_name}: {done}/{total} chapters ({percent}%)
  
Next batch: {book_name} chapters {next_start}-{next_end}
═══════════════════════════════════════════════════════════════
```

---

### REFERENCE: Current Live Books (32)

Genesis(50), Exodus(40), Leviticus(27), Numbers(36), Deuteronomy(34),
Joshua(24), Judges(21), Ruth(4), 1 Samuel(31), 2 Samuel(24),
1 Kings(22), 2 Kings(25), 1 Chronicles(29), 2 Chronicles(36),
Ezra(10), Nehemiah(13), Esther(10), Job(42), Psalms(150), Proverbs(31),
Ecclesiastes(12), Song of Solomon(8), Isaiah(66), Jeremiah(52),
Lamentations(5), **Ezekiel(21/48)**, Daniel(12),
Matthew(28), Mark(16), Luke(24), John(21), Acts(28)

**Total: 952 chapters across 32 books. 34 books remaining (237 chapters).**

### REFERENCE: The 10 Standard Theological Themes

Every chapter gets a 10-score radar chart with these exact themes:
1. **Covenant** — God's covenant promises and faithfulness
2. **Judgment** — divine judgment, consequences, warnings
3. **Mercy** — divine compassion, grace, forgiveness, restoration
4. **Faith** — trust, belief, faithfulness of people
5. **Sovereignty** — God's control, providence, divine will
6. **Worship** — true vs. false worship, idolatry, temple
7. **Holiness** — purity, separation, sanctification
8. **Prophecy** — prophetic speech, visions, fulfillment
9. **Justice** — social justice, righteousness, equity
10. **Mission** — calling, purpose, witness, spreading God's word

### REFERENCE: Ezekiel Progress (Current Book)

- **48 chapters total** — 21 done, 27 remaining (~4 more batches of 7)
- **Chapters 1-21 COMPLETE:** Throne vision, call, watchman, sign-acts, temple abominations, glory departing, sign-acts of exile, false prophets, idolatrous elders, useless vine, unfaithful wife, two eagles, individual responsibility, lament for princes, rebellion history, sword unsheathed
- **Infrastructure DONE:** BOOK_META, Zimmerli (new scholar), Block scope extended, colors, labels, scholar-data all configured — skip Step 2
- **Scholars:** MacArthur, Calvin, NET Bible, Block (NICOT), Zimmerli (Hermeneia)
- **Next batch (22-28):** Bloody city, Oholah/Oholibah, boiling pot + wife's death, oracles against nations (Ammon, Moab, Edom, Philistia, Tyre)
- **Then:** 29-35 (Egypt oracles, shepherds, new heart), 36-42 (dry bones, Gog/Magog, temple vision begins), 43-48 (temple vision completes)
- **Setting:** Babylonian exile, by the Kebar River, 593-571 BC
- **Hebrew emphasis:** Priestly vocabulary (Ezekiel was a priest), glory (kabod) theology, recognition formula ("then they will know that I am the LORD" — appears 72x)
- **People added so far:** Buzi, Jehoiachin, Pelatiah, Jaazaniah, Zedekiah, Jehoahaz (+ Ezekiel entry updated)
- **Timeline events added so far:** 5 (call, sign-acts, temple abominations vision, glory departs, history review)
