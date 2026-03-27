# Companion Study — Session Handoff: Wave 6 General Epistles

> **This prompt is for CONTENT GENERATION sessions (building Bible book chapters).**
> For feature/UI batch work, see `_tools/IMPLEMENTATION_PLAN.md`.

## Repository Access

```bash
git clone https://CraigBuckmaster:{YOUR_TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive
git config user.email "craig@scripturedeepDive.com"
git config user.name "CompanionStudy"
git config http.sslVerify false
```

---

## Current State

### Wave Progress

| Wave | Books | Status |
|------|-------|--------|
| 1-2 | Torah, Historical, Wisdom, Gospels, Acts | ✅ Complete |
| 3 | Major Prophets | ✅ Complete |
| 4 | Minor Prophets (12 books) | ✅ Complete |
| 5 | Pauline Epistles (13 books) | ✅ Complete |
| **6** | **General Epistles** | **IN PROGRESS** |
| 7 | Revelation | Pending |

### Wave 6 Status

| Book | Chapters | Scholar 1 | Scholar 2 | Status |
|------|----------|-----------|-----------|--------|
| Hebrews | 13 | Lane (WBC) | Cockerill (NICNT) | ✅ Complete |
| **James** | 5 | TBD | TBD | **NEXT** |
| 1 Peter | 5 | TBD | TBD | Pending |
| 2 Peter | 3 | TBD | TBD | Pending |
| 1 John | 5 | TBD | TBD | Pending |
| 2 John | 1 | TBD | TBD | Pending |
| 3 John | 1 | TBD | TBD | Pending |
| Jude | 1 | TBD | TBD | Pending |

**Remaining:** 21 chapters across 7 books

---

## Next: James (5 chapters)

### Recommended Scholars

| Option | Scholar 1 | Scholar 2 |
|--------|-----------|-----------|
| A | Moo (Pillar) | McKnight (NICNT) |
| B | Davids (NIGTC) | McCartney (BECNT) |
| C | Allison (ICC) | Vlachos (EGGNT) |

### Infrastructure Checklist

Before generating chapters:

1. **SCHOLAR_REGISTRY** in `_tools/config.py`
2. **COMMENTATOR_SCOPE** in `_tools/config.py` — add `'james': ['scholar1', 'scholar2']`
3. **scholar-data.json** in `content/meta/`
4. **colors.ts** in `app/src/theme/`
5. **panelLabels.ts** in `app/src/constants/`
6. **Verify REGISTRY** in `_tools/shared.py` — james entry with 0 live
7. **Verify books.json** — james with `is_live: false`

### Generate + Deploy

```bash
# 1. Create generator script
python3 /tmp/gen_james.py

# 2. Validate and build
python3 _tools/validate.py
python3 _tools/build_sqlite.py
python3 _tools/validate_sqlite.py

# 3. Update metadata
# - REGISTRY live count: 0 → 5
# - books.json is_live: true
# - validate.py expected count: 58 → 59

# 4. Commit
rm /tmp/gen_*.py
git add -A && git commit -m "Add James 1-5 (Wave 6)" && git push

# 5. Deploy
cd app && npm run update
```

---

## Panel Structure (NT Epistles)

Each section needs: `heb` (Greek), `ctx`, `cross`, `mac`, `calvin`, `netbible`, + 2 book scholars

```python
save_chapter('james', 1, {
    'title': 'Chapter Title',
    'subtitle': 'Subtitle',
    'sections': [
        {
            'header': 'Verses 1–X — "Section Title"',
            'verses': verse_range(1, X),
            'heb': [('Greek', 'translit', 'gloss', 'explanation')],
            'ctx': 'Context...',
            'cross': [('Ref', 'Connection')],
            'mac': {'source': '', 'notes': [{'ref': '1:1', 'note': '...'}]},
            'calvin': {'source': '', 'notes': [...]},
            'netbible': {'source': '', 'notes': [...]},
            'scholar1': {'source': '', 'notes': [...]},
            'scholar2': {'source': '', 'notes': [...]},
        },
    ],
    'lit': ([...], 'note'),
    'themes': ([...], 'note'),
})
```

---

## Content Standards

- **Verse text:** Word-for-word NIV
- **Tone:** Scholarly, expository, seminary-level
- **Greek:** BDAG conventions
- **Scholar notes:** AI-generated in each scholar's tradition, not direct quotations
- **Cross-references:** Real passages with genuine connections

---

## Session Capacity

- ~24 chapters before quality degrades
- James (5) + 1 Peter (5) + 2 Peter (3) = 13 chapters — fits one session
- Small books (2-3 John, Jude = 3 chapters) can be batched

---

## Key Files

| File | Purpose |
|------|---------|
| `_tools/shared.py` | `save_chapter()`, REGISTRY |
| `_tools/config.py` | SCHOLAR_REGISTRY, COMMENTATOR_SCOPE |
| `_tools/BUILD_PLAN.md` | Full infrastructure checklist |
| `_tools/MASTER_PLAN.md` | Wave order |
| `content/meta/scholar-data.json` | Scholar metadata |

---

## After Wave 6

**Wave 7:** Revelation (22 chapters) — needs Beale, Osborne, Mounce, Aune
