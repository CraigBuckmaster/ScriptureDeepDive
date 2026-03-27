# Companion Study — Session Handoff: Batch 7

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

## Current State (as of commit 660d28e0)

### Batches Complete

| Batch | Feature | Status |
|-------|---------|--------|
| 1 | Feature 1 infra (prophecy_chains table, types, queries) | ✅ Complete |
| 2 | Prophecy chains content (50 chains, 283 links) | ✅ Complete |
| 3 | ProphecyBrowse + ProphecyDetail screens | ✅ Complete |
| 4 | user.db migration v2 (tags, collections, links, FTS) | ✅ Complete |
| 5 | Enhanced notes UI (AllNotesScreen 3-tab, CollectionDetail, NotesOverlay) | ✅ Complete |
| 6 | DiscoursePanel component + wiring | ✅ Complete |
| **7** | **Discourse content for Romans** | **NEXT** |

### Key Files Created in Batches 1-6

- `app/src/screens/ProphecyBrowseScreen.tsx` — Category filter + chain cards
- `app/src/screens/ProphecyDetailScreen.tsx` — Timeline rail view
- `app/src/hooks/useProphecyChains.ts` — Data hooks
- `app/src/components/TagChips.tsx` — Tag editing component
- `app/src/components/CollectionPicker.tsx` — Bottom sheet for collections
- `app/src/components/NoteLinkSheet.tsx` — Note linking sheet
- `app/src/screens/CollectionDetailScreen.tsx` — Collection notes view
- `app/src/components/panels/DiscoursePanel.tsx` — Argument flow panel

---

## Batch 7: Discourse Content for Romans

**Goal:** Add `discourse` key to `chapter_panels` for Romans 1-16.

**Files to modify:**
- `content/romans/1.json` through `content/romans/16.json`

**Approach:**
1. Create generator script `/tmp/gen_discourse_romans.py`
2. For each chapter, add discourse data to the existing JSON
3. Run `python3 _tools/build_sqlite.py`
4. Validate with `python3 _tools/validate.py`
5. Delete generator script, commit, push

### DiscourseData Structure

```typescript
interface DiscourseNode {
  id: string;
  type: 'thesis' | 'premise' | 'ground' | 'inference' | 'conclusion' |
        'contrast' | 'concession' | 'purpose' | 'result' |
        'illustration' | 'exhortation' | 'doxology';
  verse_range: string;
  marker?: string;      // "Therefore", "For", "But", etc.
  text: string;
  children?: DiscourseNode[];
}

interface DiscourseData {
  thesis: string;
  nodes: DiscourseNode[];
  note?: string;
}
```

### Romans Chapter-by-Chapter Guide

| Ch | Key Argument | Primary Node Types |
|----|--------------|-------------------|
| 1 | Thesis (1:16-17) → Gentile guilt (1:18-32) | thesis, ground, inference |
| 2 | Jewish guilt — judging others while doing the same | contrast, ground, conclusion |
| 3 | Universal guilt → righteousness by faith introduced | conclusion, premise, thesis |
| 4 | Abraham as proof case — faith credited as righteousness | illustration, ground, conclusion |
| 5 | Results of justification → Adam/Christ parallel | result, contrast, illustration |
| 6 | Dead to sin, alive in Christ — shall we sin? | inference, contrast, exhortation |
| 7 | Released from law — the struggle of the flesh | illustration, contrast, concession |
| 8 | No condemnation → Spirit life → nothing separates | thesis, ground, conclusion, doxology |
| 9 | God's sovereign election — Israel's rejection | premise, ground, contrast |
| 10 | Israel's failure — righteousness by faith, not law | contrast, ground, conclusion |
| 11 | Remnant theology → olive tree → all Israel saved | illustration, premise, doxology |
| 12 | Therefore → living sacrifice → ethical exhortations | exhortation (throughout) |
| 13 | Submit to authorities → love fulfills law | exhortation, ground |
| 14 | Weak/strong conscience — don't judge | exhortation, ground, purpose |
| 15 | Unity in Christ → Paul's mission plans | exhortation, purpose |
| 16 | Greetings + final warnings | exhortation, doxology |

**Note:** Chapters 12-16 shift from doctrinal argument to practical exhortation.

### Discourse Markers to Look For

- **Therefore** (οὖν) → inference/conclusion
- **For** (γάρ) → ground/premise
- **But** (ἀλλά, δέ) → contrast
- **Because** → ground
- **So that / In order that** (ἵνα) → purpose
- **If...then** → premise + inference
- **Now** (νῦν) → transition
- **Just as...so also** → illustration/parallel

### Example: Romans 1 Discourse Data

```json
{
  "thesis": "The gospel is the power of God for salvation to everyone who believes, revealing God's righteousness from faith to faith.",
  "nodes": [
    {
      "id": "r1-1",
      "type": "thesis",
      "verse_range": "1:16-17",
      "text": "Paul states his thesis: the gospel reveals God's righteousness through faith, the righteous shall live by faith."
    },
    {
      "id": "r1-2",
      "type": "ground",
      "verse_range": "1:18-20",
      "marker": "For",
      "text": "God's wrath is revealed because humanity suppresses the truth evident in creation.",
      "children": [
        {
          "id": "r1-2a",
          "type": "inference",
          "verse_range": "1:20",
          "text": "Therefore they are without excuse — God's attributes are clearly seen."
        }
      ]
    },
    {
      "id": "r1-3",
      "type": "result",
      "verse_range": "1:21-23",
      "text": "Though they knew God, they did not honor him — futile thinking led to idolatry."
    },
    {
      "id": "r1-4",
      "type": "conclusion",
      "verse_range": "1:24-32",
      "marker": "Therefore",
      "text": "God gave them over to their desires — the downward spiral of sin and its consequences.",
      "children": [
        {
          "id": "r1-4a",
          "type": "ground",
          "verse_range": "1:28",
          "marker": "Because",
          "text": "Because they did not see fit to acknowledge God, he gave them up to a debased mind."
        }
      ]
    }
  ],
  "note": "Romans 1 establishes the universal problem (sin) that requires the solution (gospel). The 'For' in v.18 grounds the thesis — the gospel is needed because wrath is revealed against ungodliness."
}
```

### Generator Script Pattern

Use the standard pattern from `shared.py`:

```python
import json
from pathlib import Path

CONTENT = Path('/home/claude/ScriptureDeepDive/content')

def add_discourse_to_chapter(book_dir: str, ch: int, discourse_data: dict):
    path = CONTENT / book_dir / f'{ch}.json'
    with open(path) as f:
        chapter = json.load(f)
    
    if 'chapter_panels' not in chapter:
        chapter['chapter_panels'] = {}
    
    chapter['chapter_panels']['discourse'] = discourse_data
    
    with open(path, 'w') as f:
        json.dump(chapter, f, indent=2)
    print(f'  ✓ {book_dir} {ch}')

# Then call for each chapter:
add_discourse_to_chapter('romans', 1, { ... })
```

### Verification

After running the generator:

```bash
python3 _tools/build_sqlite.py
python3 _tools/validate.py
rm /tmp/gen_discourse_romans.py
git add -A && git commit -m "feat(discourse): Batch 7 — Romans 1-16 argument flow data" && git push origin master
```

The app should show "Argument Flow" panel button in Romans chapters.

---

## After Batch 7

**Batch 8:** Concept Explorer (concepts.json + ConceptBrowse + ConceptDetail screens)

See `_tools/IMPLEMENTATION_PLAN.md` lines 751-850 for full spec.

---

## Key Conventions

- **Generator scripts:** Write to `/tmp/`, delete after use
- **Content pipeline:** Generator → JSON → build_sqlite.py → validate.py → commit
- **Verse text:** Must be word-for-word NIV
- **Panel types:** discourse is now registered in panelLabels.ts and PanelRenderer.tsx
- **Commit pattern:** `feat(discourse): Batch 7 — description`

## Deploy

After commit:
```bash
cd app
eas update --branch production
```
