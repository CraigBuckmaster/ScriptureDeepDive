# Completed Phases — Data Shape Reference

> Phases 0–23 are fully shipped. This file preserves the data contracts between the content pipeline and React Native components for debugging and content generation reference.

---

## Phase 0 — Chapter Panel Categorization

```typescript
// panelLabels.ts
export const CHAPTER_PANEL_CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'LANGUAGE & FORM', types: ['lit', 'hebtext', 'discourse', 'themes'] },
  { label: 'WORLD BEHIND THE TEXT', types: ['ppl', 'trans', 'src', 'rec'] },
  { label: 'SCHOLARLY TOOLS', types: ['thread', 'tx', 'textual', 'debate'] },
];
```

## Phase 1 — TabbedPanelRenderer

```typescript
interface TabConfig {
  key: string;          // e.g. 'historical', 'audience', 'ane'
  label: string;        // e.g. 'Historical', 'Audience', 'ANE'
  hasData: boolean;     // false = tab hidden
}
```

Detection pattern: panel type stays the same (`hist`, `cross`, `lit`, `tx`). Data shape determines rendering: `typeof data === 'string'` → legacy. `data && data.historical` → composite.

## Phase 2 — Context Hub (hist panel)

```python
# Old shape (string):
panels['hist'] = "The Babylonian Enuma Elish..."

# New shape (object, backward-compatible):
panels['hist'] = {
    "context": "Verse 1 functions as...",         # was 'ctx' panel
    "historical": "The Babylonian Enuma Elish...", # was 'hist' string
    "audience": "Moses' original audience...",      # optional
    "ane": [                                        # optional
        {
            "parallel": "Enuma Elish",
            "similarity": "Both begin with watery chaos...",
            "difference": "Where Marduk creates humans from blood...",
            "significance": "Genesis is a deliberate counter-narrative..."
        }
    ]
}
```

## Phase 3 — Connections Hub (cross panel)

```python
# Old shape (array):
panels['cross'] = [{"ref": "John 1:1-3", "note": "..."}]

# New shape (object, backward-compatible):
panels['cross'] = {
    "refs": [{"ref": "John 1:1-3", "note": "..."}],
    "echoes": [    # optional
        {
            "source_ref": "Genesis 1:1",
            "target_ref": "John 1:1",
            "type": "echo",  # "direct_quote" | "allusion" | "echo" | "typological"
            "source_context": "Genesis opens with God creating by speech...",
            "connection": "John identifies the creative Word as the Logos...",
            "significance": "This frames Jesus as the agent of creation."
        }
    ]
}
```

## Phase 4 — Chiasm View (lit panel extension)

```typescript
interface ChiasmPair {
  label: string;    // "A", "B", "C"
  top: string;      // outer element description
  bottom: string;   // matching inner element description
  color: string;    // hex color for the pair
}

interface ChiasmCenter {
  label: string;    // "X"
  text: string;     // center/focal point description
}

interface ChiasmData {
  title: string;
  pairs: ChiasmPair[];
  center: ChiasmCenter;
}

// Added as optional key to existing LitPanel:
interface LitPanel {
  rows: LitRow[];
  note: string;
  chiasm?: ChiasmData;  // tab only shows when present
}
```

## Phase 5 — Genre Guidance Banner

```json
// content/meta/books.json — added fields:
{
  "genre": "theological_narrative",
  "genre_label": "Theological Narrative",
  "genre_guidance": "Structured around toledot formulas · ANE counter-narrative · Focus on who and why"
}
```

Genre vocabulary: `theological_narrative`, `law`, `wisdom`, `poetry`, `prophecy`, `apocalyptic`, `epistle`, `gospel`, `history`, `lament`, `love_poetry`

## Phase 6 — Study Depth Tracking

```sql
-- user.db
CREATE TABLE study_depth (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  panel_type TEXT NOT NULL,
  first_opened_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(section_id, panel_type)
);
```

## Phase 7 — Study Coach Mode

```python
# Chapter JSON — optional top-level key:
{
    "coaching": [
        {
            "after_section": 1,
            "tip": "Notice the repeating pattern...",
            "genre_tag": "narrative_structure"
        }
    ]
}
```

## Phase 8 — Textual Notes (tx panel upgrade)

```python
# Old shape (array):
chapter_panels['tx'] = [{"verse": "16:9", "issue": "..."}]

# New shape (object, backward-compatible):
chapter_panels['tx'] = {
    "notes": [...existing entries...],
    "stories": [
        {
            "title": "The Ending of Mark",
            "passage": "Mark 16:9-20",
            "summary": "The earliest manuscripts end at 16:8...",
            "evidence": [
                {"manuscript": "Codex Sinaiticus (4th c.)", "reading": "Ends at 16:8"}
            ],
            "consensus": "Most scholars consider 16:9-20 a later addition...",
            "significance": "The abrupt ending may be intentional."
        }
    ]
}
```

## Phase 9 — Concept Journey

```json
// content/meta/concepts.json — added field:
{
  "journey_stops": [
    {
      "ref": "Genesis 9:8-17",
      "book": "genesis",
      "chapter": 9,
      "label": "Noahic Covenant",
      "development": "First covenant — universal scope, unilateral.",
      "what_changes": "God binds himself to never destroy by flood again."
    }
  ]
}
```

## Phase 10 — Synoptic Diff Highlighting

```json
// content/meta/parallel-passages.json — added field:
{
  "diff_annotations": [
    {
      "location": "Matthew 5:3 / Luke 6:20",
      "diff_type": "theological_emphasis",
      "matthew": "Blessed are the poor in spirit",
      "luke": "Blessed are you who are poor",
      "explanation": "Matthew spiritualizes; Luke preserves social dimension."
    }
  ]
}
```

## Phase 13 — Interlinear

```sql
CREATE TABLE interlinear_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  word_position INTEGER NOT NULL,
  original TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  strongs TEXT,
  morphology TEXT,
  gloss TEXT NOT NULL,
  word_study_id TEXT
);
```

## Phase 16 — Reading Streaks

```sql
CREATE TABLE reading_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  chapters_read INTEGER NOT NULL DEFAULT 0,
  books_touched TEXT
);
```

## Phase 19 — Highlight Collections

```sql
ALTER TABLE verse_highlights ADD COLUMN collection_id TEXT;
ALTER TABLE verse_highlights ADD COLUMN note TEXT;

CREATE TABLE highlight_collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  sort_order INTEGER DEFAULT 0
);
```

Colors: Gold (#bfa050), Blue (#5b8fb9), Green (#5fa87a), Purple (#8b7cb8), Coral (#c47a6a), Teal (#5ba8a0)

## Phase 20 — Recommendations

```typescript
interface Recommendation {
  title: string;
  subtitle: string;
  screen: string;
  params?: object;
  priority: number;
}
```

## Phase 22 — Discourse Panel

```python
chapter_panels['discourse'] = {
    "title": "Paul's Argument in Romans 3",
    "steps": [
        {
            "label": "Thesis (v1-2)",
            "text": "Jewish advantage is real.",
            "type": "thesis"  # thesis | evidence | objection | rebuttal | conclusion | transition
        }
    ],
    "note": "Paul uses the diatribe style."
}
```

## Phase 23 — Reading Plans

```json
{
  "id": "covenant_journey",
  "name": "Covenant Journey",
  "description": "Trace the covenant concept...",
  "total_days": 10,
  "is_premium": false,
  "chapters_json": "[{\"day\":1,\"book\":\"genesis\",\"chapter\":9,\"focus\":\"Read + explore\"}]"
}
```

Seeded via user.db migration. 5 free + 5 premium plans.
