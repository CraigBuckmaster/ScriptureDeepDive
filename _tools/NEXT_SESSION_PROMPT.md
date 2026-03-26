# Continue Content Remediation — Batch 2I onwards

Clone the repo, then read `_tools/CONTENT_REMEDIATION_PLAN.md` for full context.

## What's Done

- **Batch 0:** Word Study detail screen crash — fixed
- **Batch 1:** 8 scholar bios written (Brueggemann, Lundbom, Webb, Block, Howard, Tsumura, Hess, Bergen)
- **Batch 2A:** 168 Psalms ghost panels populated (Ps 24-30, 35-40)
- **Batch 2B:** 85 Matthew Greek/Hebrew panels populated (Matt 2-28)
- **Batch 2C:** 2 Matthew cross-ref panels populated (Matt 10 s1, s3)
- **Batch 2D:** 43 Proverbs Hebrew panels populated (Prov 1,2,5-7,10-17,21-31)
- **Batch 2E:** 15 Proverbs cross-ref panels populated (Prov 1,2,3,4,5,6,7,8,9,10,31)
- **Batch 2F:** 52 2 Chronicles cross-ref panels populated (2 Chr 11-36)
- **Batch 2G:** Exodus hist panels — done
- **Batch 2H:** All remaining cross-ref panels populated — Exodus (15), Genesis (12), Psalms (12), Ruth (4), plus Exodus 26 s3 heb straggler
- **SDK 54 upgrade:** complete
- **Validators:** Counts updated to current (45 live books, 21 pending, 1062 chapters, 253 people, 216 satellite, 51 scholars, 73 places)

### Panel Status: ZERO empty `heb` or `cross` section panels remain in the entire repo.

## What's Next — Continue in This Order

### Batch 2I — TX (Textual Criticism) Chapter Panels (85 empty)

**Books and counts:**
- Genesis: 23 chapters empty tx
- Exodus: 39 chapters empty tx
- Ruth: 4 chapters empty tx
- Proverbs: 19 chapters empty tx

**Panel format:** List of objects, NOT a string. Each entry:
```json
[
  {
    "ref": "4QSamᵃ (Dead Sea Scrolls)",
    "title": "Significant Qumran witness",
    "content": "Detailed explanation of the textual variant or witness...",
    "note": "Brief scholarly takeaway."
  }
]
```

**Key textual witnesses by book:**
- **Genesis:** Samaritan Pentateuch (SP), Dead Sea Scrolls (4QGen), LXX, Targum Onqelos, Vulgate. SP diverges from MT at creation ages, Gerizim references. LXX has divergent chronologies in ch 5/11.
- **Exodus:** SP (significant divergences — expanded Decalogue, Gerizim command), 4QExod, 4QpaleoExod, LXX (differs on tabernacle order ch 35-40), Targum Onqelos.
- **Ruth:** MT is well-attested with minimal variants. LXX adds some clarifying expansions. Targum Ruth has extensive midrashic additions. Note textual stability as itself informative.
- **Proverbs:** LXX Proverbs differs dramatically from MT — different chapter order (ch 24-31 rearranged), extra material, omissions. This is one of the most textually divergent OT books between MT and LXX. 4QProvᵃ fragments exist.

**For chapters with no meaningful textual variants:** Still populate the panel — note that the text is well-attested with minimal variants. This is itself useful scholarly information. 1-2 entries per chapter minimum; 2-4 for textually rich chapters.

**MERGE operation:** Read existing JSON, check if `chapter_panels.tx` exists and is empty list `[]`, populate it, write back. Do NOT touch chapters that already have populated tx panels.

**Audit command to find empty tx panels:**
```python
import json, glob
for book in ['genesis', 'exodus', 'ruth', 'proverbs']:
    for f in sorted(glob.glob(f'content/{book}/*.json'), key=lambda x: int(x.split('/')[-1].replace('.json','')) if x.split('/')[-1].replace('.json','').isdigit() else 0):
        ch = f.split('/')[-1].replace('.json','')
        if not ch.isdigit(): continue
        with open(f) as fh:
            data = json.load(fh)
        tx = data.get('chapter_panels', {}).get('tx')
        if isinstance(tx, list) and len(tx) == 0:
            print(f'{book} {ch}')
```

**Sub-batch strategy** (85 chapters is too many for one script):
1. Genesis tx (23 chapters)
2. Exodus tx part 1 (~20 chapters)
3. Exodus tx part 2 (~19 chapters)
4. Ruth tx (4 chapters) + Proverbs tx (19 chapters)

### After Batch 2I, Continue With:

- **Batch 3:** People enrichment — 41 people need expanded bios, dates, refs, timeline connections. Update `config.py` → `export_config.py` → `build_sqlite.py`. See remediation plan §3A-3D.
- **Batch 4:** 8 parallel passages → `content/meta/synoptic_map.json`
- **Batch 5:** 20 new word studies → `content/meta/word_studies.json`
- **Batch 6:** Thin panel enrichment (lowest priority) — ~259 panels with minimal content

## Pipeline Reminder

1. Write merge script in `/tmp/gen_*.py`
2. Run it to update `content/{book}/{ch}.json` files
3. `python3 _tools/build_sqlite.py`
4. `python3 _tools/validate.py`
5. `python3 _tools/validate_sqlite.py`
6. `rm /tmp/gen_*.py`
7. `git add -A && git commit && git push`

Both validators should pass green before pushing. Current validator counts:
- 45 live books, 21 pending
- 1062 chapters, 2396 sections
- 17501 section panels, 8149 chapter panels
- 253 people (37 spine, 216 satellite), 51 scholars
- 73 places, 378 timelines

Git config: `user.email "craig@companionstudy.app"`, `user.name "Claude AI"`
