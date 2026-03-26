# Continue Content Remediation — Batch 2 (panels)

Clone the repo, then read `_tools/CONTENT_REMEDIATION_PLAN.md` for full context.

## What's Done

- **Batch 0:** Word Study detail screen crash — fixed (occurrences_json contains objects `{ref, gloss, ctx}`, not strings)
- **Batch 1:** 8 scholar bios written (Brueggemann, Lundbom, Webb, Block, Howard, Tsumura, Hess, Bergen) in `content/meta/scholar-bios.json` and `scholar-data.json`
- **Batch 2A:** 168 Psalms ghost panels populated (Ps 24-30, 35-40 — alter, calvin, net, kidner, vangemeren, goldingay, mac)
- **Batch 2B:** 85 Matthew Greek/Hebrew panels populated (Matt 2-28 — every section now has 2-3 Greek terms with original, transliteration, gloss, paragraph)
- **Batch 2G:** Exodus hist panels — done in a prior session (1 stragler may remain, verify)
- **SDK 54 upgrade:** `package.json` pinned to `^54.0.0`, `react-native-worklets` added as permanent dep
- **Validators:** Counts updated to current (44 live books, 51 scholars, 252 people, 1054 chapters, 378 timelines), live-only chapter counting fix, single-section allowlist for `jeremiah_45`, `jeremiah_47`, `malachi_4`

## What's Next — Continue in This Order

### Batch 2D — Proverbs Hebrew Panels (43 empty, 24 chapters)
Chapters: 1, 2, 5, 6, 7, 10-17, 21-31. Panel type: `heb` (empty `[]`).
Format: array of `{word, transliteration, gloss, paragraph}` — same as Matthew but Hebrew.
Proverbs is rich in parallelism types, wordplay, and vocabulary. Each section needs 2-3 Hebrew terms.
**MERGE operation:** read existing JSON, fill only empty `heb` panels, write back.

### Batch 2F — 2 Chronicles Cross-Ref Panels (52 empty, 26 chapters)
Chapters: 11-36. Panel type: `cross` (empty `[]`).
Format: array of `{ref, note}` — e.g. `{"ref": "1 Kgs 12:1-24", "note": "Parallel account of Rehoboam's folly..."}`.
Chronicles parallels Kings heavily — every section needs 2-3 cross-refs (parallel Kings passage, prophetic book refs, NT citations where applicable).

### Batch 2C — Matthew Cross-Ref (2 empty)
### Batch 2E — Proverbs Cross-Ref (15 empty)  
### Batch 2H — Remaining small cross-ref batches:
- Exodus cross-ref: 15 empty
- Genesis cross-ref: 12 empty
- Psalms cross-ref: 12 empty

### Batch 2I — TX (Textual Criticism) Chapter Panels (85 empty)
Books: Genesis (23ch), Exodus (39ch), Ruth (4ch), Proverbs (19ch).
Panel type: `tx` in `chapter_panels`. Format: string of textual criticism content.

## After Batch 2, Continue With:
- **Batch 3:** People enrichment (bios, dates, refs, timelines) — update `config.py` → `export_config.py` → `build_sqlite.py`
- **Batch 4:** 8 parallel passages → `content/meta/synoptic_map.json`
- **Batch 5:** 20 new word studies → `content/meta/word_studies.json`
- **Batch 6:** Thin panel enrichment (lowest priority)

## How to Verify Remaining Empty Panels

```python
# Run this to audit what's left
import json, glob
for book in ['proverbs', '2_chronicles', 'matthew', 'exodus', 'genesis', 'psalms']:
    for f in sorted(glob.glob(f'content/{book}/*.json')):
        ch = f.split('/')[-1].replace('.json','')
        if not ch.isdigit(): continue
        with open(f) as fh:
            data = json.load(fh)
        for sec in data.get('sections', []):
            panels = sec.get('panels', {})
            for ptype in ['heb', 'cross']:
                p = panels.get(ptype)
                if p is not None and isinstance(p, list) and len(p) == 0:
                    print(f"{book} {ch} s{sec['section_num']} {ptype}: EMPTY")
```

## Pipeline Reminder

1. Write merge script in `/tmp/gen_*.py`
2. Run it to update `content/{book}/{ch}.json` files
3. `python3 _tools/build_sqlite.py`
4. `python3 _tools/validate.py`
5. `python3 _tools/validate_sqlite.py`
6. `rm /tmp/gen_*.py`
7. `git add -A && git commit && git push`

Both validators should pass green before pushing. If counts drift (new books going live elsewhere), update the hardcoded counts in both validators.
