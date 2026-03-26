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

### Panel Status: ZERO empty `heb`, `cross`, or `tx` panels remain in the entire repo.

## What's Done (continued)

- **Batch 2I:** 85 tx chapter panels populated — Genesis (23), Exodus (39), Ruth (4), Proverbs (19). Zero empty tx panels remain.

## What's Next — Continue in This Order

### Batch 3 — People Enrichment (41 people)

41 people need expanded bios, dates, refs, timeline connections. Update `config.py` → `export_config.py` → `build_sqlite.py`. See remediation plan §3A-3D.

### Batch 4 — Parallel Passages (8)

8 parallel passages → `content/meta/synoptic_map.json`

### Batch 5 — Word Studies (20)

20 new word studies → `content/meta/word_studies.json`

### Batch 6 — Thin Panel Enrichment (lowest priority)

~259 panels with minimal content

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
- 1070 chapters, 2418 sections
- 17677 section panels, 8213 chapter panels
- 260 people (37 spine, 223 satellite), 51 scholars
- 73 places, 380 timelines

Git config: `user.email "craig@companionstudy.app"`, `user.name "Claude AI"`
