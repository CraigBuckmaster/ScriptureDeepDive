# Companion Study — Session Handoff: Batch 9

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

## Current State (as of commit e9a496c5)

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
| **9** | **Difficult Passages content (50-80 entries)** | **NEXT** |

### Key Files Created in Batches 1-8

- `app/src/screens/ProphecyBrowseScreen.tsx` — Category filter + chain cards
- `app/src/screens/ProphecyDetailScreen.tsx` — Timeline rail view
- `app/src/hooks/useProphecyChains.ts` — Data hooks
- `app/src/components/TagChips.tsx` — Tag editing component
- `app/src/components/CollectionPicker.tsx` — Bottom sheet for collections
- `app/src/components/NoteLinkSheet.tsx` — Note linking sheet
- `app/src/screens/CollectionDetailScreen.tsx` — Collection notes view
- `app/src/components/panels/DiscoursePanel.tsx` — Argument flow panel
- `app/src/screens/ConceptBrowseScreen.tsx` — Concept browse with search
- `app/src/screens/ConceptDetailScreen.tsx` — Aggregated concept view
- `app/src/hooks/useConceptData.ts` — Multi-table aggregation hook
- `content/romans/*.json` — All 16 chapters have discourse data
- `content/meta/concepts.json` — 20 theological concepts

---

## Batch 9: Difficult Passages Content

**Goal:** Create `difficult-passages.json` with 50-80 entries. No UI changes needed (DifficultPassagesBrowse + Detail screens will be Batch 10).

### File to Modify

| File | Change |
|------|--------|
| `content/meta/difficult-passages.json` | Replace empty stub `[]` with full content |

### Data Structure

```typescript
interface DifficultPassage {
  id: string;
  title: string;
  category: 'ethical' | 'contradiction' | 'theological' | 'historical' | 'textual';
  severity: 'minor' | 'moderate' | 'major';
  passage: string;        // e.g., "Joshua 6-11" or "Matthew 27:5 vs Acts 1:18"
  question: string;       // The actual question being addressed
  responses: Response[];  // 2-3 scholarly responses
  related_chapters: ChapterRef[];
  tags: string[];
}

interface Response {
  tradition: string;      // e.g., "Conservative Evangelical", "Critical Scholarship"
  scholar_id: string;     // Must exist in scholars.json
  summary: string;        // The response (2-4 sentences)
}

interface ChapterRef {
  book_dir: string;
  chapter_num: number;
}
```

### Category Targets

| Category | Example Entries | Target Count |
|----------|----------------|-------------|
| ethical | Canaanite conquest, slavery regulations, Jephthah's daughter, Ananias & Sapphira, imprecatory psalms, genocide language, concubine of Gibeah, Elisha's bears | 15-20 |
| contradiction | Judas's death (Matt vs Acts), census (2 Sam 24 vs 1 Chr 21), genealogies (Matt vs Luke), Sermon on Mount vs Plain, resurrection chronology, Quirinius census | 10-15 |
| theological | Hardening Pharaoh's heart, predestination/free will, unforgivable sin, Hebrews 6 — can you lose salvation, problem of evil (Job), limited atonement | 10-15 |
| historical | Exodus dating, conquest archaeology, Jericho walls, Ai, census numbers, long lifespans in Genesis, Belshazzar, Darius the Mede | 10-15 |
| textual | Mark's ending, Johannine Comma, Pericope Adulterae, longer ending of Mark, textual variants in key verses | 5-10 |

### Scholar IDs to Use

Check `content/meta/scholars.json` for valid IDs. Key scholars for difficult passages:
- `mac` (MacArthur) — Conservative evangelical
- `calvin` — Reformation perspective
- `moo` — Evangelical NT scholarship
- `schreiner` — Reformed Baptist
- `netbible` — Text-critical notes
- `block` — OT ethical/theological
- `longman` — OT critical-conservative
- `collins` — Historical-critical OT

### Example Entry

```json
{
  "id": "canaanite-conquest",
  "title": "The Conquest of Canaan",
  "category": "ethical",
  "severity": "major",
  "passage": "Joshua 6-11; Deuteronomy 7:1-2, 20:16-18",
  "question": "How can a good God command the destruction of entire peoples, including women and children?",
  "responses": [
    {
      "tradition": "Divine Command Theodicy",
      "scholar_id": "mac",
      "summary": "God as the author of life has the sovereign right to take it. The Canaanites had 400 years to repent (Gen 15:16), and their destruction was judicial punishment for extreme wickedness including child sacrifice."
    },
    {
      "tradition": "Hyperbolic Warfare Language",
      "scholar_id": "longman",
      "summary": "Ancient Near Eastern conquest accounts routinely used hyperbolic language ('utterly destroyed') that was not meant literally. The continuing presence of Canaanites throughout Judges shows the language was rhetorical, not historical."
    },
    {
      "tradition": "Progressive Revelation",
      "scholar_id": "block",
      "summary": "God accommodated himself to the brutal realities of the ancient world, working within those conventions while progressively revealing higher ethical standards. The conquest must be read in redemptive-historical context."
    }
  ],
  "related_chapters": [
    { "book_dir": "joshua", "chapter_num": 6 },
    { "book_dir": "joshua", "chapter_num": 11 },
    { "book_dir": "deuteronomy", "chapter_num": 7 }
  ],
  "tags": ["conquest", "genocide", "theodicy", "holy war", "Canaanites"]
}
```

### Generator Script Pattern

```python
import json
from pathlib import Path

CONTENT = Path('/home/claude/ScriptureDeepDive/content')

passages = [
    {
        "id": "...",
        "title": "...",
        # ... full entry
    },
    # ... more entries
]

path = CONTENT / 'meta' / 'difficult-passages.json'
with open(path, 'w') as f:
    json.dump(passages, f, indent=2)
print(f'✓ Wrote {len(passages)} difficult passages')
```

### Verification

```bash
python3 _tools/build_sqlite.py
python3 _tools/validate.py
python3 _tools/validate_sqlite.py
rm /tmp/gen_difficult_passages.py
git add -A && git commit -m "feat(content): Batch 9 — 50+ difficult passages" && git push origin master
```

---

## After Batch 9

**Batch 10:** DifficultPassagesBrowseScreen + DifficultPassageDetailScreen

---

## Key Conventions

- **Generator scripts:** Write to `/tmp/`, delete after use
- **Content pipeline:** Generator → JSON → build_sqlite.py → validate.py → commit
- **Scholar IDs:** Must reference existing entries in scholars.json
- **Related chapters:** Must reference live chapters (book_dir + chapter_num)
- **Commit pattern:** `feat(content): Batch 9 — description`

## Database Stats (as of Batch 8)

- 58 live books, 1146 chapters
- 50 prophecy chains
- 20 concepts
- 16 discourse panels (Romans)
- 0 difficult passages (to be populated)

## Deploy

After commit:
```bash
cd app
eas update --branch production
```
