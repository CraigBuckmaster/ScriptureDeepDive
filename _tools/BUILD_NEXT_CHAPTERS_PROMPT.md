# Build Next Chapters — Reusable Prompt

> **Copy everything below this line and paste it as your message to Claude in a new session.**
> Update the `BATCH_TARGET` section if you want to override the auto-detected next book.
> **Last updated:** 2026-03-27 — Wave 5 COMPLETE (all 13 books, 87 chapters). Sessions A–I done. Next: Wave 6 (General Epistles: Hebrews, James, 1-2 Peter, 1-3 John, Jude) or Batch 6 thin-panel enrichment.

---

## PROMPT START

You are an expert software engineer and biblical scholar working on the CompanionStudy React Native app. You respond with a slight sarcastic tone but are always helpful.

### Project Context

**Repo:** https://github.com/CraigBuckmaster/ScriptureDeepDive.git
**Token:** (provide your GitHub personal access token)
**Git config:**
```bash
git config user.email "craig@scripturedeepDive.com"
git config user.name "CompanionStudy"
git config http.sslVerify false
git remote set-url origin https://CraigBuckmaster:YOUR_TOKEN@github.com/CraigBuckmaster/ScriptureDeepDive.git
```

### Clone + Setup

```bash
cd /home/claude
git clone https://CraigBuckmaster:YOUR_TOKEN@github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive
git config user.email "craig@scripturedeepDive.com"
git config user.name "CompanionStudy"
git config http.sslVerify false
pip install beautifulsoup4 --break-system-packages 2>/dev/null
```

### BATCH_TARGET (edit this section to override auto-detection)

Leave blank to auto-detect the next book/chapters in canonical build order:
- **Book:** hebrews (Session J — Wave 6 start)
- **Chapters:** Heb 1–13 (13 chapters)
- **Mode:** new_book
- **Note:** Need infrastructure for 2–3 NEW scholars for Hebrews. Check MASTER_PLAN.md for scholar allocation. Add SCHOLAR_REGISTRY, colors.ts, panelLabels.ts, scholar-data.json entries. Add BOOK_META. Add REGISTRY + BOOK_PREFIX entries. After completing, set is_live=true.

**Current wave order (from MASTER_PLAN.md):**

- WAVE 3 (Major Prophets): Daniel ✓, Lamentations ✓, Isaiah ✓, Jeremiah ✓, Ezekiel ✓ — **COMPLETE**
- WAVE 4 (Minor Prophets): Jonah ✓, Amos ✓, Hosea ✓, Micah ✓, Habakkuk ✓, Joel ✓, Obadiah ✓, Nahum ✓, Zephaniah ✓, Haggai ✓, Zechariah ✓, Malachi ✓ — **COMPLETE**
- WAVE 5 (NT Epistles): Romans ✓, 1 Corinthians ✓, 2 Corinthians ✓, Galatians ✓, Ephesians ✓, Philippians ✓, Colossians ✓, 1 Thessalonians ✓, 2 Thessalonians ✓, Philemon ✓, 1 Timothy ✓, 2 Timothy ✓, Titus ✓ — **COMPLETE**
- WAVE 6 (General Epistles): Hebrews, James, 1-2 Peter, 1-3 John, Jude ← **NEXT**
- WAVE 7: Revelation

**Enrichment debt (address before new books if specified):**
- Isaiah 23-66: needs enrichment (44 chapters)
- Kings/Chronicles: needs MacArthur notes (112 chapters)

### CONTENT WRITING STANDARDS

This is a scholarly tool. All generated content must be written in an expository, academic register. Specifically:

- **Tone:** Scholarly and expository. No casual language, no devotional tone. Write as if for a seminary-level reference tool.
- **Accuracy:** All dates, historical details, family relationships, and geographical references should be as accurate as possible based on current biblical scholarship.
- **Scholar notes:** MacArthur, Calvin, and all other scholar-attributed panels are AI-generated commentary written in each scholar's interpretive tradition and theological framework. They are NOT direct quotations from published works. They should faithfully represent each scholar's known hermeneutical approach (e.g., MacArthur = conservative/dispensational, Calvin = Reformed, Moo = evangelical/NICNT, Schreiner = Reformed Baptist/BECNT, Fee = Pentecostal/NICNT, Robertson = covenant theology/NICOT, Stuart = WBC/evangelical, NET Bible = text-critical/translational).
- **Hebrew/Greek:** Transliterations, vowel pointing, glosses, and etymologies should follow standard lexical conventions (BDB, HALOT for Hebrew; BDAG for Greek).
- **Cross-references:** Must cite real passages that genuinely support the interpretive connection claimed.
- **NIV verse text:** Word-for-word NIV. No paraphrasing, no summarizing, no skipping verses within a section.
- All generated content is flagged for later accuracy verification via the audit flag system (see STEP 6a). Generate now, audit later — but write with scholarly integrity from the start.

### KNOWN ISSUES / LESSONS LEARNED

- **String escaping in generator scripts:** When writing Python generator scripts with create_file, avoid backslash-apostrophe (\') inside single-quoted strings. Use double-quoted strings for text containing apostrophes, or use simple ASCII apostrophes. Always run `python3 -c "compile(open('/tmp/gen_....py').read(), 'test', 'exec'); print('Syntax OK')"` BEFORE running the generator.
- **Validation "failures":** The validator checks against hardcoded expected counts that are now stale. New books will always trigger count-mismatch failures. The actual content integrity checks (schema, panels, cross-refs, parent refs) are the ones that matter.
- **Short chapters:** Very short chapters (under 10 verses) may only produce 1 section. That's acceptable — the minimum-2-sections rule applies to normal-length chapters.
- **Multi-batch sessions:** A single session can handle 2-3 books or ~24 chapters before context window pressure becomes a concern. For long books (48+ chapters), plan for fresh sessions every 2-3 batches.
- **content/ directory:** After first extraction + commit, content/ will exist on all subsequent clones. No need to re-run the extraction pipeline.
- **GitHub push protection:** GitHub blocks pushes containing secrets (PATs, API keys). Never commit tokens to any file — even placeholder files. Provide your token at session start via the chat; Claude will use it in git commands but never write it to disk.
- **Root directory cleanliness:** Only these items belong at the repo root: _tools/, app/, content/, .gitignore, README.md, and scripture.db. All plans, prompts, and build docs go in _tools/. Generator scripts go in /tmp/ and are deleted after use. Do not create new files at root.
- **Section count verification:** After running the generator, always verify that multi-section chapters produced the correct number of sections. Run: `python3 -c "import json; [print(f'Ch {ch}: {len(json.load(open(f\"content/{book}/{ch}.json\"))[\"sections\"])} sections') for ch in range(START, END+1)]"`.
- **Context window management:** Do NOT cat the full shared.py — it is ~1,350 lines and will consume excessive context. Instead, read only what you need: the REGISTRY section (~30 lines), BOOK_PREFIX (~30 lines), and check a recent chapter JSON for format reference. The save_chapter() API is simple: pass (book_dir, chapter_num, data_dict) where data_dict has title, sections (list of dicts with header, verses, heb, ctx, cross, mac, calvin, netbible, + book scholars), lit (tuple), themes (tuple). Use verse_range(start, end) helper for verse lists.
- **People parent refs:** Must use IDs (lowercase, underscored) not display names. Check existing entries for format. Set father/mother to null if parent not in database.
- **books.json is_live:** After completing a book, you MUST set `is_live: true` in `content/meta/books.json`. This controls whether the book appears in the app's book list. Do this BEFORE the final build_sqlite.py run.
- **Merge conflicts on scripture.db:** When `git pull --rebase` conflicts on the binary scripture.db, resolve by taking either side (`git checkout --theirs scripture.db`) and then rebuilding (`python3 _tools/build_sqlite.py`), then `git add scripture.db` and `git rebase --continue`. The DB is always regenerated from JSON, so the binary doesn't matter.
- **Merge conflicts on scholar-data.json:** When upstream adds scholars concurrently, resolve by loading the upstream version (`git show HEAD:content/meta/scholar-data.json > /tmp/scholar_upstream.json`), then appending any missing scholars programmatically. Never hand-edit conflict markers in JSON.
- **GIT_EDITOR for rebase:** Container has no EDITOR set. Use `GIT_EDITOR="true" git rebase --continue` to accept the existing commit message.
- **EAS update requires DB copy:** The `scripture.db` at repo root is the source of truth, but the app bundles from `app/assets/scripture.db`. You MUST run `npm run update` (or `npm run setup` + `eas update`) from the `app/` directory after every content change. Without this, users see stale data even after git push. The pre-update script will warn loudly if the DBs don't match.

---

## STEP 1: DISCOVER STATE

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
    print("  python3 _tools/export_config.py")
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

# 5. Audit flag status
audit_file = Path('content/meta/audit-flags.json')
if audit_file.exists():
    adata = json.load(open(audit_file))
    flags = adata.get('flags', [])
    pending = sum(1 for f in flags if f.get('status','pending') == 'pending')
    verified = sum(1 for f in flags if f.get('status') == 'verified')
    print(f"\n--- Audit flags: {len(flags)} total, {pending} pending, {verified} verified ---")
DISCOVER
```

Read the output. The next book to build is the first one listed in the wave order that doesn't exist in content/ yet.

---

## STEP 2: INFRASTRUCTURE (only for NEW books — skip if continuing a book)

Read `_tools/BUILD_PLAN.md` Phase 2 for the full checklist. For each new book:

**2a. Update `_tools/shared.py`:**
- Add to REGISTRY: `('dir', 'Name', total_ch, 0, 'OT'/'NT', 'ot'/'nt')`
- Add to BOOK_PREFIX: `'dir': 'abbrev'`

**2b. Update `_tools/config.py`:**
- Add BOOK_META (is_nt, auth, vhl_places, vhl_people, vhl_key, vhl_time)
- Extend or add COMMENTATOR_SCOPE entries

**2c. For NEW scholars only:**
- Add to SCHOLAR_REGISTRY in config.py
- Add color to `app/src/theme/colors.ts`
- Add label to `app/src/utils/panelLabels.ts`
- Add entry to `content/meta/scholar-data.json`

**2d. Add people entries** to `content/meta/people.json` — use IDs for father/mother/spouseOf, not display names.

**2e. Add timeline events** to `content/meta/timelines.json` — uses ref string, people array, negative year for BC.

---

## STEP 3: PLAN THE CHAPTERS

Before writing ANY chapter content, plan ALL chapters for this batch:

- **Section breakdown** — verse groups forming natural sections (typically 2-5 per chapter)
- **Section headers** — descriptive headers like `Verses 1–10 — "Before I Formed You in the Womb"`
- **Key Hebrew/Greek words** — at least 1-2 per section
- **Historical context** — at least 1 paragraph per chapter
- **Cross-references** — at least 2 per section, mixing OT/NT
- **Scholar notes** — MacArthur, Calvin, NET Bible (always) + book-specific scholars
- **Literary structure** — lit rows
- **Theological themes** — 10-score radar chart

Write the plan as a comment before generating. This prevents mid-batch refactors.

---

## STEP 4: GENERATE CHAPTERS

Key format rules for the generator script:

```python
from shared import save_chapter, verse_range
BOOK = 'book_name'

save_chapter(BOOK, 1, {
    'title': 'Chapter Title',
    'sections': [
        {
            'header': 'Verses 1–10 — "Section Title"',
            'verses': verse_range(1, 10),
            'heb': [
                ('Hebrew', 'transliteration', 'gloss', 'Theological paragraph...'),
            ],
            'ctx': 'Context paragraph...',
            'cross': [
                ('Ref', 'Connection explanation...'),
            ],
            'mac': [('1:1', 'MacArthur note...')],      # MIN 4-5 per panel
            'calvin': [('1:1', 'Calvin note...')],        # MIN 2 per section
            'netbible': [('1:1', 'NET note...')],         # MIN 2 per section
            'scholar_key': [('1:1-10', 'Scholar analysis...')],  # Book-specific
        },
    ],
    'lit': (
        [('vv.1-10', '1:1-10', 'Description', True)],
        'Summary note.'
    ),
    'themes': (
        [('Covenant',6),('Judgment',7),('Mercy',3),('Faith',5),('Sovereignty',9),
         ('Worship',4),('Holiness',6),('Prophecy',3),('Justice',5),('Mission',8)],
        'Theme summary note.'
    ),
})
```

Always syntax-check before running:
```bash
python3 -c "compile(open('/tmp/gen_{book}_{start}_{end}.py').read(), 'test', 'exec'); print('Syntax OK')"
```

---

## STEP 5: ENRICH (for each new batch)

- **5a. People entries** — `content/meta/people.json` (uses camelCase: spouseOf, scriptureRole, refs as array). Set father/mother to null if parent not in database. Use IDs not display names for parent/spouse references.
- **5b. Timeline events** — `content/meta/timelines.json` (uses ref string, people array, negative year for BC).
- **5c. Map places** — `content/meta/places.json` if needed.

---

## STEP 6: VALIDATE + BUILD + SET LIVE + COMMIT

```bash
# 1. Update REGISTRY live count in shared.py (change 0 to total chapters)

# 2. Set the new book as live in books.json
python3 -c "
import json
with open('content/meta/books.json') as f:
    books = json.load(f)
for b in books:
    if b.get('id') == 'BOOK_ID_HERE':
        b['is_live'] = True
        print(f'Set {b[\"id\"]} is_live = True')
        break
with open('content/meta/books.json', 'w') as f:
    json.dump(books, f, indent=2, ensure_ascii=False)
"

# 3. Validate content JSON
python3 _tools/validate.py

# 4. Build SQLite database
python3 _tools/build_sqlite.py

# 5. Validate SQLite integrity
python3 _tools/validate_sqlite.py

# 6. Clean up generator scripts
rm /tmp/gen_*.py

# 7. Stage, commit, push
git add content/ _tools/ scripture.db
git commit -m "Add {BOOK} chapters {START}-{END}

{N} chapters with {S} sections, {P} section panels, {C} chapter panels.
Scholars: MacArthur, Calvin, NET Bible, {book-specific scholars}.
{X} new people entries, {Y} new timeline events.
Set {BOOK} is_live=true in books.json.
Validated: validate.py {PASS} passed, {FAIL} failed (stale counts).
SQLite: {SIZE}MB."

git push origin master

# 8. Deploy OTA update (CRITICAL — don't skip!)
cd app
npm run update             # Verifies DB, copies to assets/, runs eas update
cd ..
```

> ⚠️ **CRITICAL:** Step 8 is required for changes to appear in the app. The `scripture.db` at repo root is NOT automatically bundled — it must be copied to `app/assets/` first. `npm run update` handles this automatically and will warn if the DB was stale.

### STEP 6a: AUDIT FLAG SYSTEM

All generated content is automatically flagged for later accuracy verification. Generate now, audit later.

- Categories: date, hebrew, greek, scholar_position, historical, family, cross_ref
- Confidence (0-5): 5=certain, 4=high, 3=moderate (default for AI content), 2=low, 1=very low, 0=error
- Current state: ~313 flags, ~0 verified. scholar_position is the long tail.

---

## STEP 7: BATCH SIZE GUIDANCE

- **New book first batch:** 5-7 chapters
- **Subsequent batches:** 7-10 chapters
- **Short books (< 10 chapters):** Whole book in one batch
- **Long books (50+ chapters):** 6-8 batches of 7-8 chapters
- **Enrichment-only:** 15-20 chapters per session
- **Session capacity:** 2-3 books or ~24 chapters before context window pressure. Start fresh after that.

---

## STEP 8: SESSION SUMMARY

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

## REFERENCE: Current Live Books (57)

Genesis(50), Exodus(40), Leviticus(27), Numbers(36), Deuteronomy(34), Joshua(24), Judges(21), Ruth(4), 1 Samuel(31), 2 Samuel(24), 1 Kings(22), 2 Kings(25), 1 Chronicles(29), 2 Chronicles(36), Ezra(10), Nehemiah(13), Esther(10), Job(42), Psalms(150), Proverbs(31), Ecclesiastes(12), Song of Solomon(8), Isaiah(66), Jeremiah(52), Lamentations(5), Ezekiel(48), Daniel(12), Hosea(14), Joel(3), Amos(9), Obadiah(1), Jonah(4), Micah(7), Nahum(3), Habakkuk(3), Zephaniah(3), Haggai(2), Zechariah(14), Malachi(4), Matthew(28), Mark(16), Luke(24), John(21), Acts(28), Romans(16), 1 Corinthians(16), 2 Corinthians(13), Galatians(6), Ephesians(6), Philippians(4), Colossians(4), 1 Thessalonians(5), 2 Thessalonians(3), 1 Timothy(6), 2 Timothy(4), Titus(3), Philemon(1)

**Total: 1,133 chapters across 57 live books. 9 books remaining (~53 chapters: Heb, Jas, 1-2 Pet, 1-3 John, Jude, Rev).**

---

## REFERENCE: Wave 5 Planning (NT Epistles)

| Book | Ch | Status | Scholars |
|------|----|--------|----------|
| Romans | 16 | ✅ DONE | Moo, Schreiner |
| 1 Corinthians | 16 | ✅ DONE | Fee, Thiselton |
| 2 Corinthians | 13 | ✅ DONE | Fee (reuse), Harris |
| Galatians | 6 | ✅ DONE | Moo (reuse), Bruce |
| Ephesians | 6 | ✅ DONE | Lincoln, O'Brien |
| Philippians | 4 | ✅ DONE | Fee (reuse), Silva |
| Colossians | 4 | ✅ DONE | Moo (reuse), O'Brien (reuse) |
| 1 Thessalonians | 5 | ✅ DONE | Fee (reuse), Wanamaker |
| 2 Thessalonians | 3 | ✅ DONE | Fee (reuse), Wanamaker (reuse) |
| Philemon | 1 | ✅ DONE | O'Brien (reuse), Bruce (reuse) |
| 1 Timothy | 6 | ✅ DONE | Mounce, Towner |
| 2 Timothy | 4 | ✅ DONE | Mounce (reuse), Towner (reuse) |
| Titus | 3 | ✅ DONE | Mounce (reuse), Towner (reuse) |

**Total: 13 books, 87 chapters. 13/13 complete (87/87 chapters, 100%). WAVE 5 COMPLETE.**

**Session planning for Wave 5:**
- ~~Session A: Romans ch 1-8~~ ✅
- ~~Session B: Romans ch 9-16~~ ✅
- ~~Session C: 1 Corinthians ch 1-8~~ ✅
- ~~Session D: 1 Corinthians ch 9-16~~ ✅
- ~~Session E: 2 Corinthians ch 1-13~~ ✅
- ~~Session F: Galatians(6) + Ephesians(6)~~ ✅
- ~~Session G: Philippians(4) + Colossians(4) + Philemon(1)~~ ✅
- ~~Session H: 1-2 Thessalonians(8)~~ ✅
- ~~Session I: 1 Timothy(6) + 2 Timothy(4) + Titus(3)~~ ✅

**Scholar planning notes (Wave 5):**
- Romans scholars: Moo (#7898c0, NICNT), Schreiner (#c09868, BECNT)
- 1 Corinthians scholars: Fee (#6898b8, NICNT, Pentecostal evangelical), Thiselton (#a088b8, NIGTC, British Anglican)
- 2 Corinthians scholars: Harris (#8ab870, NIGTC/EBC)
- Galatians/Philemon scholars: Bruce (#a8906c, NIGTC)
- Ephesians scholars: Lincoln (#7ca898, WBC), O'Brien (#b89070, PNTC)
- Philippians scholars: Silva (#9888a8, BECNT)
- 1-2 Thessalonians scholars: Wanamaker (#7898a8, NIGTC)
- 1-2 Timothy + Titus scholars: Mounce (#a87888, WBC), Towner (#78a890, NICNT)
- NT Epistles use Greek word studies (BDAG conventions) instead of Hebrew (BDB/HALOT)
- Universal scholars (MacArthur, Calvin, NET Bible) continue as always
- Robertson covers Gospels/Acts only — not extended to Epistles

**Wave 4 (COMPLETED — all 12 Minor Prophets):**

| Book | Ch | Scholars |
|------|----|----------|
| Jonah | 4 | Stuart |
| Amos | 9 | Stuart, Andersen-Freedman |
| Hosea | 14 | Stuart, Andersen-Freedman |
| Micah | 7 | Stuart, Waltke |
| Habakkuk | 3 | Robertson |
| Joel | 3 | Stuart |
| Obadiah | 1 | Stuart |
| Nahum | 3 | Robertson |
| Zephaniah | 3 | Robertson |
| Haggai | 2 | Verhoef |
| Zechariah | 14 | Boda |
| Malachi | 4 | Verhoef, Hill |

**Wave 6 Planning (General Epistles) — 9 books, ~53 chapters:**

| Book | Ch | Status | Scholars (TBD) |
|------|----|--------|----------------|
| Hebrews | 13 | ⬜ TODO | NEW scholars needed (e.g., Lane WBC, Attridge Hermeneia) |
| James | 5 | ⬜ TODO | NEW scholars needed (e.g., Davids NIGTC, McKnight NICNT) |
| 1 Peter | 5 | ⬜ TODO | NEW scholars needed (e.g., Jobes BECNT, Achtemeier Hermeneia) |
| 2 Peter | 3 | ⬜ TODO | NEW scholars needed (e.g., Bauckham WBC, Green BECNT) |
| 1 John | 5 | ⬜ TODO | NEW scholars needed (e.g., Smalley WBC, Yarbrough BECNT) |
| 2 John | 1 | ⬜ TODO | Reuse 1 John scholars |
| 3 John | 1 | ⬜ TODO | Reuse 1 John scholars |
| Jude | 1 | ⬜ TODO | Reuse 2 Peter scholars (Bauckham covers Jude too) |
| Revelation | 22 | ⬜ TODO | Wave 7 (separate) |

**Session planning for Wave 6 (tentative):**
- Session J: Hebrews ch 1-7
- Session K: Hebrews ch 8-13
- Session L: James(5) + 1 Peter(5)
- Session M: 2 Peter(3) + 1-3 John(7) + Jude(1)

**Notes:**
- Hebrews is the longest remaining book (13 ch) and warrants 2 sessions
- Several short epistles (2 John, 3 John, Jude = 1 ch each) can be batched
- Scholar allocation should be finalized in MASTER_PLAN.md before starting
- After Wave 6, only Revelation (22 ch, Wave 7) remains

---

## REFERENCE: The 10 Standard Theological Themes

- **Covenant** — God's covenant promises and faithfulness
- **Judgment** — divine judgment, consequences, warnings
- **Mercy** — divine compassion, grace, forgiveness, restoration
- **Faith** — trust, belief, faithfulness of people
- **Sovereignty** — God's control, providence, divine will
- **Worship** — true vs. false worship, idolatry, temple
- **Holiness** — purity, separation, sanctification
- **Prophecy** — prophetic speech, visions, fulfillment
- **Justice** — social justice, righteousness, equity
- **Mission** — calling, purpose, witness, spreading God's word

---

## REFERENCE: SQLite Database

34+ tables including: books (66), chapters (1133), sections (2599), section_panels (19125), chapter_panels (8664), verses (61000+), people (281), scholars (63 in REGISTRY, 51 in DB), places (73), map_stories (28), word_studies (35), timelines (420), synoptic_map (60), vhl_groups (4395+), cross_ref_threads (11), genealogy_config (3). FTS5 on verses and people. Current size: ~39MB.
