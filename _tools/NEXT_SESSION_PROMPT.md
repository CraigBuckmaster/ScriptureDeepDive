# Continue Content Remediation — Batch 6

Clone the repo, then read `_tools/CONTENT_REMEDIATION_PLAN.md` for full context.

## What's Done

- **Batches 0–5:** ALL COMPLETE.
  - Zero empty `heb`, `cross`, or `tx` section/chapter panels remain.
  - 13 people bios expanded, 10 dates added, 3 entries key-normalized.
  - 27 timeline_people entries added.
  - 8 parallel passages added (60 total synoptic entries).
  - 20 word studies added (35 total).
  - SDK 54 upgrade complete.
  - Validators updated to current counts.

## What's Next — Batch 6: Thin Panel Enrichment

**173 panels** with content between 50–150 chars (thin but not empty). These are live buttons that deliver shallow content. Goal: expand each to 200+ chars with substantive insight.

### Audit Results (by book → panel type → count)

#### Priority 1: Chapter `ppl` Panels (97 panels)

These have truncated text (often ending in `…`) or a single generic entry like `{"name":"God","role":"Key biblical figure","text":"..."}`. Expand each person entry's `text` field to 150+ chars and add 1–2 more people where the chapter warrants it.

| Book | Count | Chapters |
|------|-------|----------|
| Psalms | 56 | 8,14,21,24,29,30,33,34,36,37,38,39,40,42,44,45,46,47,48,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,72,73,74,75,76,77,78,79,80,82,83,84,85,86,87,88 |
| Isaiah | 11 | 1,3,18,26,31,33,35,36,38,39,44 |
| Ezekiel | 10 | 3,6,9,10,18,20,24,27,33,43 |
| Jeremiah | 8 | 4,8,9,10,13,14,23,30 |
| Amos | 3 | 2,3,5 |
| Exodus | 2 | 10,35 |
| Hosea | 2 | 4,10 |
| Zechariah | 2 | 9,13 |
| 2 Chronicles | 1 | 10 |
| Ecclesiastes | 1 | 10 |
| John | 1 | 2 |
| Lamentations | 1 | 5 |
| Nahum | 1 | 2 |
| Nehemiah | 1 | 9 |

#### Priority 2: Chapter `rec` Panels (23 panels)

Reception History panels with only a sentence fragment. Expand to 2–3 traditions (Jewish, Christian, modern) showing how the passage has been interpreted.

| Book | Count | Chapters |
|------|-------|----------|
| Psalms | 8 | 10,11,12,13,16,53,54,86 |
| Isaiah | 7 | 4,8,15,16,19,20,21 |
| Job | 4 | 8,15,18,20 |
| Daniel | 3 | 4,5,6 |
| Esther | 1 | 7 |

#### Priority 3: Section `cross` Panels (47 panels)

Cross-reference panels with only 1 ref. Add 1–2 more cross-references with explanatory notes.

| Book | Count | Chapters |
|------|-------|----------|
| 1 Chronicles | 10 | 8,11,14,16,17,19,20,25,26,27 |
| Nehemiah | 8 | 2,3,6,7,9,10,12,13 |
| Psalms | 6 | 11,24,25,26,28,29 |
| Job | 5 | 2,17,18,25,26 |
| 2 Chronicles | 6 | 2,4,5,6,10,35 |
| Esther | 2 | 6 |

#### Priority 4: Misc Small Groups (6 panels)

| Book | Type | Count | Chapters |
|------|------|-------|----------|
| Esther | sec:ctx | 2 | 6,7 |
| Esther | sec:hist | 2 | 7 |
| Ezekiel | sec:block, sec:calvin, sec:ctx, sec:netbible | 7 | 23,28 |
| Genesis | sec:ctx | 1 | 2 |
| Psalms | sec:ctx | 1 | 24 |

### MERGE Strategy

For each panel:
1. Read existing chapter JSON
2. Find the thin panel (50–150 char JSON)
3. Expand content in-place (DO NOT replace existing text — append to it or rewrite richer)
4. Write back

**For `ppl` panels:** Expand `text` field per person, add missing people.
**For `rec` panels:** Add reception traditions (string content).
**For `cross` panels:** Add 1–2 refs to the existing list.
**For `ctx`/`hist`/scholar panels:** Expand the existing content string.

### Sub-batch Strategy

Split by priority and book to fit within context:

1. **6A:** Psalms `ppl` pt1 (~19 chapters: 8,14,21,24,29,30,33,34,36,37,38,39,40,42,44,45,46,47,48)
2. **6B:** Psalms `ppl` pt2 (~19 chapters: 50-70)
3. **6C:** Psalms `ppl` pt3 (~18 chapters: 72-88) + Psalms `rec` (8) + Psalms `cross` (6)
4. **6D:** Isaiah `ppl` (11) + Isaiah `rec` (7)
5. **6E:** Ezekiel `ppl` (10) + Ezekiel misc (7)
6. **6F:** Jeremiah `ppl` (8) + Job `rec` (4) + Job `cross` (5)
7. **6G:** 1 Chronicles `cross` (10) + 2 Chronicles `cross` (6) + Nehemiah `cross` (8)
8. **6H:** All remaining — Amos, Hosea, Exodus, Daniel, Esther, Zechariah, misc singles

### Audit Command

```python
import json, glob
from collections import defaultdict

thin = defaultdict(lambda: defaultdict(list))
for book_dir in sorted(glob.glob('content/*/')):
    book = book_dir.rstrip('/').split('/')[-1]
    if book in ('meta', 'verses'): continue
    for f in sorted(glob.glob(f'{book_dir}/*.json'), key=lambda x: int(x.split('/')[-1].replace('.json','')) if x.split('/')[-1].replace('.json','').isdigit() else 0):
        ch = f.split('/')[-1].replace('.json','')
        if not ch.isdigit(): continue
        with open(f) as fh:
            data = json.load(fh)
        for sec in data.get('sections', []):
            for ptype, content in sec.get('panels', {}).items():
                clen = len(json.dumps(content)) if not isinstance(content, str) else len(content)
                if 50 <= clen <= 150:
                    thin[book][f'sec:{ptype}'].append(int(ch))
        for ptype, content in data.get('chapter_panels', {}).items():
            clen = len(json.dumps(content)) if not isinstance(content, str) else len(content)
            if 50 <= clen <= 150:
                thin[book][f'ch:{ptype}'].append(int(ch))

total = 0
for book in sorted(thin):
    for ptype in sorted(thin[book]):
        count = len(thin[book][ptype])
        total += count
        print(f'  {book:20s} {ptype:15s} {count:3d}  ch {thin[book][ptype][:5]}')
print(f'\nTotal: {total}')
```

## Pipeline Reminder

1. Write merge script in `/tmp/gen_*.py`
2. Run it to update `content/{book}/{ch}.json` files
3. `python3 _tools/build_sqlite.py`
4. `python3 _tools/validate.py`
5. `python3 _tools/validate_sqlite.py`
6. `rm /tmp/gen_*.py`
7. `git add -A && git commit && git push`

Both validators should pass green before pushing. Current validator counts:
- 57 live books, 9 pending
- 1133 chapters, 2599 sections
- 19125 section panels, 8664 chapter panels
- 281 people (37 spine, 244 satellite), 63 scholars (REGISTRY)
- 73 places, 420 timelines, 60 synoptic entries, 35 word studies

Git config: `user.email "craig@companionstudy.app"`, `user.name "Claude AI"`
