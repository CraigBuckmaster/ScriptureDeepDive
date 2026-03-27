# Companion Study — Session Handoff: Batch 9b

## Repository Access

```
git clone https://CraigBuckmaster:{YOUR_TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
```

**Git config required:**
```bash
git config user.email "craig@companionstudy.app"
git config user.name "Craig Buckmaster"
```

---

## Current State (as of commit 8dec5a5e)

### Batches Complete

| Batch | Feature | Status |
|-------|---------|--------|
| 1 | Feature 1 infra (prophecy_chains table, types, queries) | ✅ Complete |
| 2 | Prophecy chains content (50 chains, 283 links) | ✅ Complete |
| 3 | ProphecyBrowse + ProphecyDetail screens | ✅ Complete |
| 4 | user.db migration v2 (tags, collections, links, FTS) | ✅ Complete |
| 5 | Enhanced notes UI (AllNotesScreen 3-tab, CollectionDetail, NotesOverlay) | ✅ Complete |
| 6 | DiscoursePanel component + wiring | ✅ Complete |
| 7 | Discourse content for Romans 1-16 | ✅ Complete |
| 8 | Concept Explorer (20 concepts + screens) | ✅ Complete |
| 9a | Difficult Passages (28 entries — first half) | ✅ Complete |
| **9b** | **Difficult Passages (25-30 more entries — second half)** | **NEXT** |

---

## Batch 9a Complete — What's Already There

`content/meta/difficult-passages.json` has 28 entries:

### Ethical (8)
- `canaanite-conquest` — The Conquest of Canaan (major)
- `slavery-regulations` — Old Testament Slavery Laws (major)
- `jephthahs-daughter` — Jephthah's Vow and His Daughter (major)
- `imprecatory-psalms` — The Imprecatory Psalms (moderate)
- `elishas-bears` — Elisha and the Bears (moderate)
- `ananias-sapphira` — The Deaths of Ananias and Sapphira (moderate)
- `concubine-gibeah` — The Levite's Concubine (major)
- `abraham-wife-sister` — Abraham's Wife-Sister Deceptions (moderate)

### Contradiction (5)
- `judas-death` — How Did Judas Die? (moderate)
- `census-numbering` — Who Incited David's Census? (moderate)
- `genealogy-differences` — Matthew and Luke's Genealogies (moderate)
- `resurrection-accounts` — Resurrection Morning Differences (moderate)
- `sermon-mount-plain` — Sermon on the Mount vs. Plain (minor)

### Theological (5)
- `hardening-pharaoh` — God Hardening Pharaoh's Heart (major)
- `unforgivable-sin` — The Unforgivable Sin (major)
- `hebrews-6-apostasy` — Can Believers Lose Salvation? (major)
- `problem-of-evil` — The Problem of Suffering (major)
- `predestination-free-will` — Predestination and Human Choice (major)

### Historical (5)
- `genesis-long-lifespans` — Long Lifespans in Genesis (moderate)
- `exodus-dating` — When Did the Exodus Happen? (moderate)
- `jericho-archaeology` — The Walls of Jericho (moderate)
- `quirinius-census` — The Census of Quirinius (moderate)
- `numbers-exodus` — The Large Numbers in Exodus (moderate)

### Textual (5)
- `marks-ending` — The Ending of Mark's Gospel (moderate)
- `pericope-adulterae` — The Woman Caught in Adultery (moderate)
- `johannine-comma` — The Johannine Comma (minor)
- `lords-prayer-doxology` — The Doxology of the Lord's Prayer (minor)
- `isaiah-authorship` — The Authorship of Isaiah (moderate)

---

## Batch 9b: Difficult Passages Second Half

**Goal:** Add 25-30 more entries to reach 50-60 total. Aim for gaps not covered in 9a.

### Suggested Entries for 9b

**Ethical (add 5-7):**
- David & Bathsheba / Uriah's murder
- Lot offering his daughters
- Jacob's deception of Isaac
- God commanding Abraham to sacrifice Isaac (Akedah)
- Samson's violence and relationships
- Hosea marrying Gomer
- Divine command to kill Agag (1 Samuel 15)

**Contradiction (add 3-5):**
- Different accounts of Saul's death
- Differing Temple dimensions
- Who killed Goliath? (Elhanan question)
- Peter's denials timing
- Cleansing of the Temple (once or twice?)

**Theological (add 3-5):**
- Jacob I loved, Esau I hated
- Restrictive view of women in 1 Timothy 2
- Head covering in 1 Corinthians 11
- Nephilim and "sons of God" (Genesis 6)
- Balaam: prophet or villain?

**Historical (add 3-5):**
- Belshazzar as king (vs. Nabonidus)
- Darius the Mede identity
- Ai and conquest archaeology
- Daniel's court tales — historicity
- Jonah's fish — literal?

**Textual (add 2-3):**
- Matthew's Jeremiah/Zechariah citation
- OT quotations in NT that don't match
- Manuscript variants in key verses

### Data Structure (same as 9a)

```typescript
interface DifficultPassage {
  id: string;
  title: string;
  category: 'ethical' | 'contradiction' | 'theological' | 'historical' | 'textual';
  severity: 'minor' | 'moderate' | 'major';
  passage: string;
  question: string;
  responses: Response[];  // 2-3 scholarly responses
  related_chapters: ChapterRef[];
  tags: string[];
}
```

### Scholar IDs Available

```
alter, block, brueggemann, calvin, collins, hess, japhet, keener, longman,
macarthur, oswalt, provan, rhoads, sarna, selman, waltke, and 35 more
```

Check `content/meta/scholars.json` for the full list.

### Generator Pattern

```python
import json
from pathlib import Path

CONTENT = Path('/home/claude/ScriptureDeepDive/content')

# Load existing passages
path = CONTENT / 'meta' / 'difficult-passages.json'
existing = json.loads(path.read_text())
print(f'Existing: {len(existing)} passages')

# Add new entries
new_passages = [
    {
        "id": "...",
        "title": "...",
        # full entry
    },
    # ...
]

all_passages = existing + new_passages

with open(path, 'w') as f:
    json.dump(all_passages, f, indent=2)
print(f'Total: {len(all_passages)} passages')
```

### Verification

```bash
python3 _tools/build_sqlite.py
python3 _tools/validate.py
python3 _tools/validate_sqlite.py
rm /tmp/gen_difficult_passages_2.py
git add -A && git commit -m "feat(content): Batch 9b — 25+ difficult passages (second half)" && git push
```

---

## After Batch 9

**Batch 10:** DifficultPassagesBrowseScreen + DifficultPassageDetailScreen

---

## Database Stats (as of Batch 9a)

- 58 live books, 1146 chapters
- 50 prophecy chains
- 20 concepts
- 28 difficult passages
- 16 discourse panels (Romans)

## Deploy

After commit:
```bash
cd app
eas update --branch production
```
