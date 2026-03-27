# Companion Study — Implementation Plan (Batched)

**Version:** 1.0  
**Date:** March 2026  
**Reference:** FEATURE_PLAN.md + feature-wireframes.jsx  

---

## Batch Architecture

The 5 features decompose into **12 implementation batches** across 3 phases. Each batch is a self-contained commit that leaves the app in a working state. No batch depends on uncommitted work from another batch.

```
PHASE 1 — Foundation (Batches 1-5)
  ├── Batch 1:  Pipeline scaffolding (3 new tables, validation rules, DB version bump)
  ├── Batch 2:  Feature 1 content — prophecy-chains.json (40-60 chains)
  ├── Batch 3:  Feature 1 screens — ProphecyBrowse + ProphecyDetail + Explore card
  ├── Batch 4:  Feature 2 infra — user.db migration v2 + query layer
  └── Batch 5:  Feature 2 screens — enhanced AllNotes + NoteEditor + CollectionDetail

PHASE 2 — Enrichment (Batches 6-9)
  ├── Batch 6:  Feature 3 panel — DiscoursePanel component + PanelRenderer wiring
  ├── Batch 7:  Feature 3 content — discourse data for Romans + Hebrews (first wave)
  ├── Batch 8:  Feature 4 — concepts.json + ConceptBrowse + ConceptDetail screens
  └── Batch 9:  Feature 5 content — difficult-passages.json (50-80 entries)

PHASE 3 — Integration (Batches 10-12)
  ├── Batch 10: Feature 5 screens — DifficultPassagesBrowse + DifficultPassageDetail
  ├── Batch 11: Chapter cross-linking (prophecy indicators + difficult passage indicators)
  └── Batch 12: Polish — Explore menu reorder, ContentStats expansion, final validation
```

---

## Dependency Graph

```
Batch 1 (pipeline) ──┬── Batch 2 (prophecy content) ── Batch 3 (prophecy screens)
                      │                                       │
                      │                                       ▼
                      ├── Batch 9 (diff passages content) ── Batch 10 (diff passages screens)
                      │                                       │
                      │         Batch 8 (concepts) ◄──────────┤
                      │              ▲                        │
                      │              │                        ▼
                      │         Batch 3 (prophecy)       Batch 11 (chapter cross-links)
                      │                                       │
                      └───────────────────────────────────────►Batch 12 (polish)

Batch 4 (user.db) ── Batch 5 (notes screens)              [independent track]

Batch 6 (panel) ──── Batch 7 (discourse content)          [independent track]
```

Key constraint: Batch 8 (Concepts) queries prophecy_chains and difficult_passages tables — so Batches 2 and 9 should precede it. But the tables exist from Batch 1, so Batch 8 can proceed with empty results in those sections if content isn't ready yet.

---

## PHASE 1 — Foundation

---

### Batch 1: Pipeline Scaffolding

**Goal:** Add 3 new SQLite tables + validation rules + DB version bump. Zero UI changes. After this batch, `build_sqlite.py` can ingest the new meta files (even if they're empty/stub).

**Files modified:**

| File | Change |
|------|--------|
| `_tools/build_sqlite.py` | Add `prophecy_chains`, `concepts`, `difficult_passages` table DDL + populate functions |
| `_tools/validate.py` | Add schema checks for new meta JSON files |
| `_tools/validate_sqlite.py` | Add integrity checks for new tables |
| `content/meta/prophecy-chains.json` | Create stub file: `[]` |
| `content/meta/concepts.json` | Create stub file: `[]` |
| `content/meta/difficult-passages.json` | Create stub file: `[]` |
| `app/src/types/index.ts` | Add `ProphecyChain`, `Concept`, `DifficultPassage` interfaces |
| `app/src/db/content.ts` | Add query functions (return empty until content exists) |

**Detailed changes:**

#### `_tools/build_sqlite.py` — New table DDL (after `timelines` table)

```sql
CREATE TABLE prophecy_chains (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  chain_type TEXT NOT NULL,
  summary TEXT,
  tags_json TEXT,
  links_json TEXT NOT NULL
);

CREATE TABLE concepts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme_key TEXT,
  word_study_ids_json TEXT,
  thread_ids_json TEXT,
  prophecy_chain_ids_json TEXT,
  people_tags_json TEXT,
  search_terms_json TEXT
);

CREATE TABLE difficult_passages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  passage TEXT NOT NULL,
  question TEXT NOT NULL,
  responses_json TEXT NOT NULL,
  related_chapters_json TEXT,
  tags_json TEXT
);
```

#### `_tools/build_sqlite.py` — New populate functions

Follow the exact pattern of `populate_word_studies()` and `populate_cross_refs()`:

```python
def populate_prophecy_chains(cur):
    path = META / "prophecy-chains.json"
    if not path.exists():
        return
    chains = _load_json(path)
    for c in chains:
        cur.execute(
            "INSERT INTO prophecy_chains VALUES (?,?,?,?,?,?,?)",
            (c["id"], c["title"], c["category"], c["type"],
             c.get("summary"), _json_str(c.get("tags", [])),
             _json_str(c["links"]))
        )
    print(f"  prophecy_chains: {len(chains)}")

def populate_concepts(cur):
    path = META / "concepts.json"
    if not path.exists():
        return
    concepts = _load_json(path)
    for c in concepts:
        cur.execute(
            "INSERT INTO concepts VALUES (?,?,?,?,?,?,?,?,?)",
            (c["id"], c["name"], c.get("description"),
             c.get("theme_key"), _json_str(c.get("word_study_ids", [])),
             _json_str(c.get("thread_ids", [])),
             _json_str(c.get("prophecy_chain_ids", [])),
             _json_str(c.get("people_tags", [])),
             _json_str(c.get("search_terms", [])))
        )
    print(f"  concepts: {len(concepts)}")

def populate_difficult_passages(cur):
    path = META / "difficult-passages.json"
    if not path.exists():
        return
    passages = _load_json(path)
    for p in passages:
        cur.execute(
            "INSERT INTO difficult_passages VALUES (?,?,?,?,?,?,?,?,?)",
            (p["id"], p["title"], p["category"], p["severity"],
             p["passage"], p["question"],
             _json_str(p["responses"]),
             _json_str(p.get("related_chapters", [])),
             _json_str(p.get("tags", [])))
        )
    print(f"  difficult_passages: {len(passages)}")
```

Add calls in `main()` after `populate_timelines(cur)`:
```python
populate_prophecy_chains(cur)
populate_concepts(cur)
populate_difficult_passages(cur)
```

#### `app/src/types/index.ts` — New interfaces

```typescript
export interface ProphecyChain {
  id: string;
  title: string;
  category: string;
  chain_type: string;
  summary: string | null;
  tags_json: string;
  links_json: string;
}

export interface Concept {
  id: string;
  name: string;
  description: string | null;
  theme_key: string | null;
  word_study_ids_json: string;
  thread_ids_json: string;
  prophecy_chain_ids_json: string;
  people_tags_json: string;
  search_terms_json: string;
}

export interface DifficultPassage {
  id: string;
  title: string;
  category: string;
  severity: string;
  passage: string;
  question: string;
  responses_json: string;
  related_chapters_json: string | null;
  tags_json: string | null;
}
```

#### `app/src/db/content.ts` — New query functions

```typescript
// ── Prophecy Chains ─────────────────────────────────────────────

export async function getProphecyChains(): Promise<ProphecyChain[]> {
  return getDb().getAllAsync<ProphecyChain>(
    "SELECT * FROM prophecy_chains ORDER BY category, title"
  );
}

export async function getProphecyChain(id: string): Promise<ProphecyChain | null> {
  return getDb().getFirstAsync<ProphecyChain>(
    "SELECT * FROM prophecy_chains WHERE id = ?", [id]
  );
}

export async function getProphecyChainsByCategory(cat: string): Promise<ProphecyChain[]> {
  return getDb().getAllAsync<ProphecyChain>(
    "SELECT * FROM prophecy_chains WHERE category = ? ORDER BY title", [cat]
  );
}

// ── Concepts ────────────────────────────────────────────────────

export async function getConcepts(): Promise<Concept[]> {
  return getDb().getAllAsync<Concept>(
    "SELECT * FROM concepts ORDER BY name"
  );
}

export async function getConcept(id: string): Promise<Concept | null> {
  return getDb().getFirstAsync<Concept>(
    "SELECT * FROM concepts WHERE id = ?", [id]
  );
}

// ── Difficult Passages ──────────────────────────────────────────

export async function getDifficultPassages(): Promise<DifficultPassage[]> {
  return getDb().getAllAsync<DifficultPassage>(
    "SELECT * FROM difficult_passages ORDER BY severity DESC, title"
  );
}

export async function getDifficultPassage(id: string): Promise<DifficultPassage | null> {
  return getDb().getFirstAsync<DifficultPassage>(
    "SELECT * FROM difficult_passages WHERE id = ?", [id]
  );
}

export async function getDifficultPassagesByCategory(cat: string): Promise<DifficultPassage[]> {
  return getDb().getAllAsync<DifficultPassage>(
    "SELECT * FROM difficult_passages WHERE category = ? ORDER BY severity DESC, title", [cat]
  );
}
```

#### Validation additions

**`_tools/validate.py`** — add checks after existing meta validation:
```python
# ── Prophecy chains ──
prophecy_path = META / "prophecy-chains.json"
if prophecy_path.exists():
    chains = json.loads(prophecy_path.read_text())
    for c in chains:
        check(f"prophecy-chain:{c['id']}:has-title", bool(c.get("title")))
        check(f"prophecy-chain:{c['id']}:has-category", c.get("category") in
              ("sacrifice","kingship","priesthood","exodus","temple","covenant",
               "creation","judgment","restoration"))
        check(f"prophecy-chain:{c['id']}:has-links", len(c.get("links", [])) >= 2)
        for link in c.get("links", []):
            check(f"prophecy-chain:{c['id']}:link-has-ref", bool(link.get("ref")))
            check(f"prophecy-chain:{c['id']}:link-has-role", link.get("role") in
                  ("shadow","type","prophecy","fulfillment","consummation"))

# ── Concepts ──
concepts_path = META / "concepts.json"
if concepts_path.exists():
    concepts = json.loads(concepts_path.read_text())
    for c in concepts:
        check(f"concept:{c['id']}:has-name", bool(c.get("name")))

# ── Difficult passages ──
diff_path = META / "difficult-passages.json"
if diff_path.exists():
    passages = json.loads(diff_path.read_text())
    for p in passages:
        check(f"difficult:{p['id']}:has-title", bool(p.get("title")))
        check(f"difficult:{p['id']}:has-category", p.get("category") in
              ("ethical","contradiction","theological","historical","textual"))
        check(f"difficult:{p['id']}:has-question", bool(p.get("question")))
        check(f"difficult:{p['id']}:has-responses", len(p.get("responses", [])) >= 1)
```

**`_tools/validate_sqlite.py`** — add table existence + count checks:
```python
# New feature tables
for tbl in ("prophecy_chains", "concepts", "difficult_passages"):
    tables = [r[0] for r in q(cur, "SELECT name FROM sqlite_master WHERE type='table'")]
    check(f"table:{tbl} exists", tbl in tables)
```

#### DB version bump

In `build_sqlite.py`, update the `db_meta` insert from current version to `0.13`:
```python
cur.execute("INSERT INTO db_meta VALUES ('version', '0.13')")
```

**Verification:** Run `python3 _tools/build_sqlite.py && python3 _tools/validate.py && python3 _tools/validate_sqlite.py` — all should pass with 0 records in new tables.

---

### Batch 2: Feature 1 Content — Prophecy Chains

**Goal:** Create the full `prophecy-chains.json` with 40-60 curated chains. No UI changes.

**Files modified:**

| File | Change |
|------|--------|
| `content/meta/prophecy-chains.json` | Replace stub with full content |

**Content creation approach:**
- Use a generator script in `/tmp/gen_prophecy_chains.py`
- Organize by category: sacrifice (6-8), kingship (6-8), priesthood (3-4), exodus (3-4), temple (4-5), covenant (5-6), creation (3-4), judgment (3-4), restoration (4-5)
- Plus ~20 explicit Messianic prophecy entries (Isa 7:14, Mic 5:2, Zech 9:9, Ps 22, Ps 110, Dan 7:13, etc.)
- Each chain must have at minimum: 1 OT link + 1 NT link
- Every `book_dir` and `chapter_num` must reference a real book/chapter in the canon

**Categories breakdown:**

| Category | Example Chains | Target Count |
|----------|---------------|-------------|
| sacrifice | Lamb of God, Day of Atonement, Red Heifer, Bronze Serpent, Suffering Servant | 6-8 |
| kingship | Messianic King (David), Prophet Like Moses, Son of Man (Dan 7), Lion of Judah, Branch/Shoot | 6-8 |
| priesthood | Melchizedek, High Priest, Mediator | 3-4 |
| exodus | Passover/Lord's Supper, Red Sea/Baptism, Manna/Bread of Life, Rock/Living Water | 4-5 |
| temple | Tabernacle/Incarnation, Veil/Access to God, Temple/Body of Christ | 3-4 |
| covenant | Abrahamic, Mosaic, Davidic, New Covenant, Covenant Sign (circumcision/baptism) | 5-6 |
| creation | First Adam/Last Adam, Eden/New Jerusalem, Creation/New Creation | 3-4 |
| judgment | Flood/Final Judgment, Sodom/Eschatological Fire, Exile/Separation from God | 3-4 |
| restoration | Return from Exile/Salvation, Rebuilt Temple/Church, Restored Kingdom/New Heaven+Earth | 4-5 |

**Verification:** `python3 _tools/build_sqlite.py && python3 _tools/validate.py` — prophecy_chains table populated.

---

### Batch 3: Feature 1 Screens — Prophecy Browse + Detail

**Goal:** Two new screens + Explore card + navigation wiring. Prophecy feature fully functional after this batch.

**Files created:**

| File | Purpose |
|------|---------|
| `app/src/screens/ProphecyBrowseScreen.tsx` | Browse/filter all prophecy chains |
| `app/src/screens/ProphecyDetailScreen.tsx` | Timeline-rail detail view for a single chain |
| `app/src/hooks/useProphecyChains.ts` | Hook wrapping content.ts queries |

**Files modified:**

| File | Change |
|------|--------|
| `app/src/navigation/types.ts` | Add `ProphecyBrowse` + `ProphecyDetail` to `ExploreStackParamList` |
| `app/src/navigation/ExploreStack.tsx` | Register 2 new screens |
| `app/src/screens/ExploreMenuScreen.tsx` | Add "Prophecy & Typology" grid card |
| `app/src/db/content.ts` | Add `getProphecyChainCategories()` if needed for filter chips |

**Screen specifications:**

#### ProphecyBrowseScreen.tsx
- Pattern: follows `WordStudyBrowseScreen` (SafeAreaView + ScrollView + filter chips + card list)
- Filter chips: dynamically derived from distinct `category` values in the data (not hardcoded)
- Card layout per wireframe: title, type badge, first→last ref, link count
- Tapping navigates to `ProphecyDetail` with `{ chainId: string }`

#### ProphecyDetailScreen.tsx
- Pattern: follows `WordStudyDetailScreen` (SafeAreaView + ScrollView + back nav + detail sections)
- Header: title, category + type badges, summary in bordered callout
- Body: vertical timeline rail with gradient line, dot per link, cards with role/ref/label
- OT links: gold-tinted refs; NT links: silver-tinted refs
- Tapping a link's verse ref: navigate to Chapter screen if the book is live, otherwise show a toast
- Navigation: `useRoute<ScreenRouteProp<'Explore', 'ProphecyDetail'>>()`

#### useProphecyChains.ts
```typescript
import { useState, useEffect } from 'react';
import { getProphecyChains, getProphecyChain } from '../db/content';
import type { ProphecyChain } from '../types';

export function useProphecyChains() {
  const [chains, setChains] = useState<ProphecyChain[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProphecyChains().then(setChains).finally(() => setLoading(false));
  }, []);
  return { chains, loading };
}

export function useProphecyChainDetail(id: string) {
  const [chain, setChain] = useState<ProphecyChain | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProphecyChain(id).then(setChain).finally(() => setLoading(false));
  }, [id]);
  return { chain, loading };
}
```

#### Navigation type changes
```typescript
// In ExploreStackParamList:
ProphecyBrowse: undefined;
ProphecyDetail: { chainId: string };
```

#### ExploreMenuScreen addition
Add to `GRID_FEATURES` array:
```typescript
{
  title: 'Prophecy & Typology',
  subtitle: (s) => s ? `${s.prophecyChainCount} chains across the canon` : 'Fulfillment patterns',
  screen: 'ProphecyBrowse',
},
```

**Verification:** App launches, Explore shows new card, tapping opens ProphecyBrowse, tapping a chain opens ProphecyDetail, tapping a ref navigates to Chapter.

---

### Batch 4: Feature 2 Infra — User DB Migration + Query Layer

**Goal:** Add user.db migration v2 (tags, collections, note links, FTS) + all query functions. No UI changes.

**Files modified:**

| File | Change |
|------|--------|
| `app/src/db/userDatabase.ts` | Add migration v2 |
| `app/src/db/user.ts` | Add tag, collection, link, FTS query functions |
| `app/src/types/index.ts` | Add `StudyCollection`, `NoteLink` interfaces; extend `UserNote` |

**Migration v2:**
```typescript
{
  version: 2,
  description: 'Enhanced notes — tags, collections, note links, FTS',
  sql: `
    -- Study collections
    CREATE TABLE IF NOT EXISTS study_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#bfa050',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Add columns to user_notes
    ALTER TABLE user_notes ADD COLUMN tags_json TEXT DEFAULT '[]';
    ALTER TABLE user_notes ADD COLUMN collection_id INTEGER
      REFERENCES study_collections(id) ON DELETE SET NULL;

    -- Note links
    CREATE TABLE IF NOT EXISTS note_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
      to_note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(from_note_id, to_note_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_notes_collection ON user_notes(collection_id);
    CREATE INDEX IF NOT EXISTS idx_note_links_from ON note_links(from_note_id);
    CREATE INDEX IF NOT EXISTS idx_note_links_to ON note_links(to_note_id);

    -- FTS on notes
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      note_text, content=user_notes, content_rowid=id
    );

    -- Populate FTS with existing notes
    INSERT INTO notes_fts(notes_fts) VALUES('rebuild');
  `,
},
```

**New type interfaces:**
```typescript
export interface StudyCollection {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteLink {
  id: number;
  from_note_id: number;
  to_note_id: number;
  created_at: string;
}

// Extend UserNote (add to existing):
export interface UserNote {
  // ...existing fields...
  tags_json: string;         // ADD
  collection_id: number | null; // ADD
}
```

**New query functions in `user.ts`:**

```typescript
// ── Collections ─────────────────────────────────────────────────

export async function getCollections(): Promise<StudyCollection[]> { ... }
export async function getCollection(id: number): Promise<StudyCollection | null> { ... }
export async function createCollection(name: string, description?: string, color?: string): Promise<number> { ... }
export async function updateCollection(id: number, name: string, description: string, color: string): Promise<void> { ... }
export async function deleteCollection(id: number): Promise<void> { ... }
export async function getNotesInCollection(collectionId: number): Promise<UserNote[]> { ... }
export async function getCollectionNoteCounts(): Promise<Record<number, number>> { ... }

// ── Tags ────────────────────────────────────────────────────────

export async function getAllTags(): Promise<string[]> { ... }
export async function updateNoteTags(noteId: number, tags: string[]): Promise<void> { ... }
export async function getNotesByTag(tag: string): Promise<UserNote[]> { ... }
export async function setNoteCollection(noteId: number, collectionId: number | null): Promise<void> { ... }

// ── Note Links ──────────────────────────────────────────────────

export async function linkNotes(fromId: number, toId: number): Promise<void> { ... }
export async function unlinkNotes(fromId: number, toId: number): Promise<void> { ... }
export async function getLinkedNotes(noteId: number): Promise<UserNote[]> { ... }
export async function getReferencingNotes(noteId: number): Promise<UserNote[]> { ... }

// ── FTS Search ──────────────────────────────────────────────────

export async function searchNotesFTS(query: string): Promise<UserNote[]> { ... }
```

**FTS sync:** Update `saveNote()`, `updateNote()`, and `deleteNote()` to keep `notes_fts` in sync:
```typescript
// After INSERT:
await getUserDb().runAsync("INSERT INTO notes_fts(rowid, note_text) VALUES (?, ?)", [id, text]);
// After UPDATE:
await getUserDb().runAsync("UPDATE notes_fts SET note_text = ? WHERE rowid = ?", [text, id]);
// After DELETE:
await getUserDb().runAsync("DELETE FROM notes_fts WHERE rowid = ?", [id]);
```

**Verification:** App launches, migration runs cleanly, existing notes preserved, new columns default correctly, FTS populated.

---

### Batch 5: Feature 2 Screens — Enhanced Notes UI

**Goal:** Upgrade AllNotesScreen with collections/tags/all views. Enhance NotesOverlay with tags, collection picker, note linking. Add CollectionDetailScreen.

**Files created:**

| File | Purpose |
|------|---------|
| `app/src/screens/CollectionDetailScreen.tsx` | Notes within a single collection |
| `app/src/components/TagChips.tsx` | Reusable tag chip row with add/remove |
| `app/src/components/CollectionPicker.tsx` | Bottom sheet for selecting/creating a collection |
| `app/src/components/NoteLinkSheet.tsx` | Search + select sheet for linking notes |

**Files modified:**

| File | Change |
|------|--------|
| `app/src/screens/AllNotesScreen.tsx` | Add 3-tab view (Collections / Tags / All), collection cards, tag cloud |
| `app/src/components/NotesOverlay.tsx` | Add tag chips, collection dropdown, link section |
| `app/src/navigation/types.ts` | Add `CollectionDetail` to `MoreStackParamList` |
| `app/src/navigation/MoreStack.tsx` | Register `CollectionDetailScreen` |
| `app/src/hooks/index.ts` | Export new hooks if needed |

**AllNotesScreen rewrite — key changes:**
- Add segmented control at top: Collections | Tags | All (matches wireframe)
- Collections view: "+ New Collection" button + collection cards (name, color bar, note count, description)
- Tags view: pill cloud with count badges, tapping filters to notes with that tag
- All view: flat note list with collection label + tag badges per note
- Search bar uses FTS instead of LIKE

**NotesOverlay enhancements:**
- Below text input: Tags section with chips + "+ add tag" button
- Below tags: Collection selector (compact dropdown → opens CollectionPicker sheet)
- Below collection: Linked Notes section showing linked note refs + "+ link note" button
- Save button persists tags_json + collection_id along with note text

**CollectionDetailScreen:**
- Pattern: follows `BookmarkListScreen` (SafeAreaView + FlatList + header)
- Shows collection name/description as header
- Lists all notes in the collection ordered by verse_ref
- Export button: copies formatted text to clipboard via `Clipboard.setStringAsync()`
- Edit/delete collection via header menu

**Verification:** Create a collection, add notes with tags, assign to collection, link two notes, search via FTS, navigate CollectionDetail, export works.

---

## PHASE 2 — Enrichment

---

### Batch 6: Feature 3 Panel — Discourse Component + Wiring

**Goal:** New `DiscoursePanel` component, registered in PanelRenderer and panel labels. No content yet — panel renders when data exists.

**Files created:**

| File | Purpose |
|------|---------|
| `app/src/components/panels/DiscoursePanel.tsx` | Collapsible argument tree renderer |

**Files modified:**

| File | Change |
|------|--------|
| `app/src/utils/panelLabels.ts` | Add `discourse: 'Argument Flow'` to `PANEL_LABELS` + add to `CHAPTER_PANEL_ORDER` |
| `app/src/components/panels/PanelRenderer.tsx` | Add `case 'discourse':` with import |
| `app/src/components/panels/index.ts` | Export `DiscoursePanel` |

**DiscoursePanel.tsx specification:**

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
  connectors?: { from: string; to: string; label: string }[];
  note?: string;
}

interface Props {
  data: DiscourseData;
}
```

- Thesis: prominent gold-bordered callout at top
- Nodes: collapsible cards with colored left border (one color per node type)
- Each card shows: type badge, discourse marker (italic), verse range (gold), summary text
- Children: indented 20px, smaller font, same card pattern
- Expand/collapse via state (default: top-level expanded, children collapsed)
- Note: muted text at bottom
- Node type → color mapping (defined as a const map, not hardcoded per-node)

**PanelRenderer addition:**
```typescript
import { DiscoursePanel } from './DiscoursePanel';

// In switch statement, after 'debate' case:
case 'discourse':
  return <DiscoursePanel data={data} />;
```

**panelLabels.ts:**
```typescript
// In PANEL_LABELS:
discourse: 'Argument Flow',

// In CHAPTER_PANEL_ORDER (after 'debate'):
'discourse',
```

**Verification:** Panel renders correctly when test data is manually injected. No visual change in production until content is added.

---

### Batch 7: Feature 3 Content — Discourse Data (First Wave)

**Goal:** Add discourse panel data to Romans (16ch) + Hebrews (13ch) = 29 chapters. These are the two most argument-heavy books in the NT.

**Files modified:**

| File | Change |
|------|--------|
| `content/romans/{1-16}.json` | Add `discourse` key to `chapter_panels` |
| `content/hebrews/{1-13}.json` | Add `discourse` key to `chapter_panels` (Hebrews doesn't exist yet — if not live, defer to when book is built) |

**Content creation approach:**
- Generator script: `/tmp/gen_discourse_romans.py`
- For each chapter, analyze the logical argument structure
- Identify discourse markers (therefore, for, because, but, however, so then, in order that, if...then)
- Map to node types: premise, ground, inference, conclusion, contrast, etc.
- Create 1-2 levels of nesting (thesis → main nodes → sub-arguments)
- Include a `note` explaining how the chapter's argument connects to the book's overall argument

**Romans argument flow (high-level guide for content creation):**
| Chapter | Key Argument |
|---------|-------------|
| 1 | Thesis (1:16-17) → Gentile guilt (1:18-32) |
| 2 | Jewish guilt — judging others while doing the same |
| 3 | Universal guilt → righteousness by faith introduced |
| 4 | Abraham as proof case — faith credited as righteousness |
| 5 | Results of justification → Adam/Christ parallel |
| 6 | Dead to sin, alive in Christ — shall we sin? |
| 7 | Released from law — the struggle of the flesh |
| 8 | No condemnation → Spirit life → nothing separates |
| 9 | God's sovereign election — Israel's rejection |
| 10 | Israel's failure — righteousness by faith, not law |
| 11 | Remnant theology → olive tree → all Israel saved |
| 12 | Therefore → living sacrifice → ethical exhortations |
| 13 | Submit to authorities → love fulfills law |
| 14 | Weak/strong conscience — don't judge |
| 15 | Unity in Christ → Paul's mission plans |
| 16 | Greetings + final warnings |

**Note:** Chapters 12-16 shift from argument to exhortation — discourse data for these uses `exhortation` node types rather than `premise/conclusion`.

**Verification:** `python3 _tools/build_sqlite.py && python3 _tools/validate.py` — discourse panels present in chapter_panels for Romans 1-16. App shows "Argument Flow" button in chapter nav for these chapters.

---

### Batch 8: Feature 4 — Concept Explorer

**Goal:** Populate `concepts.json` + build ConceptBrowseScreen + ConceptDetailScreen + Explore card. Feature fully functional after this batch.

**Files created:**

| File | Purpose |
|------|---------|
| `app/src/screens/ConceptBrowseScreen.tsx` | Browse all theological concepts |
| `app/src/screens/ConceptDetailScreen.tsx` | Aggregated detail view |
| `app/src/hooks/useConceptData.ts` | Hook that runs multi-table aggregation |

**Files modified:**

| File | Change |
|------|--------|
| `content/meta/concepts.json` | Replace stub with 15-25 concept entries |
| `app/src/navigation/types.ts` | Add `ConceptBrowse` + `ConceptDetail` to `ExploreStackParamList` |
| `app/src/navigation/ExploreStack.tsx` | Register 2 new screens |
| `app/src/screens/ExploreMenuScreen.tsx` | Add "Concepts" grid card |

**concepts.json content (15-25 entries):**

| Concept | theme_key | word_study_ids | thread_ids | prophecy_chain_ids |
|---------|-----------|---------------|-----------|-------------------|
| Covenant | Covenant | [berith] | [covenant-thread] | [abrahamic-covenant, new-covenant, ...] |
| Sacrifice & Atonement | (none — no exact theme match) | [hesed, kaphar] | [substitutionary-sacrifice] | [lamb-of-god, day-of-atonement, ...] |
| Kingship | (none) | [melek] | [kingdom-of-god] | [messianic-king, son-of-david, ...] |
| Holiness | Holiness | [qadosh] | [] | [] |
| Exile & Return | (none) | [] | [exile-return] | [exile-restoration, ...] |
| Wisdom | (none) | [chokmah] | [wisdom-thread] | [] |
| Spirit of God | (none) | [ruach] | [spirit-of-god] | [] |
| Faith | Faith | [emunah, pistis] | [] | [] |
| Mercy & Grace | Mercy | [hesed, charis] | [] | [] |
| Judgment | Judgment | [mishpat] | [] | [flood-judgment, ...] |
| Creation | (none) | [] | [creation-new-creation] | [first-adam-last-adam, ...] |
| Temple & Presence | (none) | [mishkan] | [] | [tabernacle-incarnation, ...] |
| Mission | Mission | [] | [] | [] |
| Suffering | (none) | [] | [faithful-suffering] | [suffering-servant, ...] |
| Resurrection | (none) | [anastasis] | [] | [] |

**ConceptDetailScreen — aggregation logic:**

The hook `useConceptData(conceptId)` runs multiple parallel queries:

```typescript
export function useConceptData(conceptId: string) {
  // 1. Load concept record
  // 2. Parse JSON arrays from concept
  // 3. Parallel queries:
  //    a. Word studies: WHERE id IN (word_study_ids)
  //    b. Cross-ref threads: WHERE id IN (thread_ids)
  //    c. Prophecy chains: WHERE id IN (prophecy_chain_ids)
  //    d. People: WHERE id IN (people_tags)
  //    e. Top chapters by theme score:
  //       - Query all chapter_panels WHERE panel_type = 'themes'
  //       - Parse scores JSON in JS
  //       - Filter for matching theme_key
  //       - Sort by score descending, take top 10
  // 4. Return aggregated result
}
```

**ConceptDetailScreen sections (scrollable):**
1. **Overview** — description text in gold-bordered callout
2. **Word Studies** — horizontal scroll of word study cards (tap → WordStudyDetail)
3. **Key Chapters** — top 10 chapters by theme score (tap → Chapter)
4. **Threads** — cross-ref thread summaries (tap → ThreadViewerSheet)
5. **Prophecy Chains** — chain cards (tap → ProphecyDetail)
6. **People** — mini person cards (tap → PersonDetail)

Each section only renders if it has data (no empty section headers).

**Verification:** Explore shows "Concepts" card, tapping opens browse, tapping a concept shows aggregated data from multiple tables.

---

### Batch 9: Feature 5 Content — Difficult Passages

**Goal:** Create `difficult-passages.json` with 50-80 entries. No UI changes.

**Files modified:**

| File | Change |
|------|--------|
| `content/meta/difficult-passages.json` | Replace stub with full content |

**Content creation approach:**
- Generator script: `/tmp/gen_difficult_passages.py`
- Each entry needs: id, title, category, severity, passage ref, question, 2-3 scholarly responses with tradition labels and scholar IDs, related chapter links, tags
- Scholar IDs must match existing scholar records in `content/meta/scholars.json`
- Related chapter `book_dir` + `chapter_num` must reference real chapters

**Category targets:**

| Category | Example Entries | Target Count |
|----------|----------------|-------------|
| ethical | Canaanite conquest, slavery regulations, Jephthah's daughter, Ananias & Sapphira, imprecatory psalms, genocide language, concubine of Gibeah, Elisha's bears | 15-20 |
| contradiction | Judas's death (Matt vs Acts), census (2 Sam 24 vs 1 Chr 21), genealogies (Matt vs Luke), Sermon on Mount vs Plain, resurrection chronology, Quirinius census | 10-15 |
| theological | Hardening Pharaoh's heart, predestination/free will, unforgivable sin, Hebrews 6 — can you lose salvation, problem of evil (Job), limited atonement | 10-15 |
| historical | Exodus dating (early vs late), conquest historicity, Jericho archaeology, Flood geography, Daniel's dating, Acts vs Paul's letters chronology | 8-10 |
| textual | Long ending of Mark, Johannine Comma, Pericope Adulterae, Septuagint vs MT differences, Isaiah authorship (one vs two/three), Pauline authorship debates | 7-10 |

**Verification:** `python3 _tools/build_sqlite.py && python3 _tools/validate.py` — difficult_passages table populated, all entries pass validation.

---

## PHASE 3 — Integration

---

### Batch 10: Feature 5 Screens — Difficult Passages Browse + Detail

**Goal:** Two new screens + Explore card. Feature fully functional after this batch.

**Files created:**

| File | Purpose |
|------|---------|
| `app/src/screens/DifficultPassagesBrowseScreen.tsx` | Browse/filter by category |
| `app/src/screens/DifficultPassageDetailScreen.tsx` | Question + collapsible responses + related chapters |
| `app/src/hooks/useDifficultPassages.ts` | Hook wrapping queries |

**Files modified:**

| File | Change |
|------|--------|
| `app/src/navigation/types.ts` | Add `DifficultPassages` + `DifficultPassageDetail` to `ExploreStackParamList` |
| `app/src/navigation/ExploreStack.tsx` | Register 2 new screens |
| `app/src/screens/ExploreMenuScreen.tsx` | Add "Hard Questions" grid card |

**Screen specifications:**

#### DifficultPassagesBrowseScreen.tsx
- Pattern: matches ProphecyBrowseScreen (filter chips + card list)
- Filter chips: derived from distinct `category` values in data
- Cards: title, category badge, severity badge (if major), passage ref, question preview (2 lines), response count
- Sort: major first, then alphabetical within severity tier

#### DifficultPassageDetailScreen.tsx
- Pattern: follows wireframe exactly
- Header: title, badges, passage ref (tappable)
- Question: bordered callout with question icon
- Responses: collapsible accordion cards, each showing tradition label, summary text, scholar pills
- Scholar pills: tap → navigate to ScholarBio in ExploreStack
- Related chapters: tappable cards at bottom → navigate to Chapter screen
- Navigation requires cross-stack navigation to Read tab for Chapter — use `navigation.navigate('ReadTab', { screen: 'Chapter', params: { bookId, chapterNum } })` or stay in ExploreStack if Chapter is registered there

**Navigation note:** Chapter screen is NOT in ExploreStack currently. Two options:
1. Add `Chapter` to ExploreStackParamList (like HomeStack does) — **recommended**
2. Use cross-tab navigation — fragile

Going with option 1: add `Chapter: { bookId: string; chapterNum: number }` to ExploreStackParamList and register ChapterScreen in ExploreStack. This also benefits ProphecyDetail and ConceptDetail which also want to navigate to chapters.

**Verification:** Explore shows "Hard Questions" card, browse works with filters, detail shows collapsible responses, scholar pills navigate to bios, chapter refs navigate to chapters.

---

### Batch 11: Chapter Cross-Linking

**Goal:** When reading a chapter, show indicators for prophecy chains and difficult passages that reference that chapter. Tapping navigates to the respective detail screen.

**Files modified:**

| File | Change |
|------|--------|
| `app/src/db/content.ts` | Add `getProphecyChainsForChapter()` + `getDifficultPassagesForChapter()` |
| `app/src/hooks/useChapterData.ts` | Fetch cross-link data alongside chapter data |
| `app/src/components/ChapterNavBar.tsx` or `ChapterHeader.tsx` | Show indicator badges |
| `app/src/screens/ChapterScreen.tsx` | Wire up indicator tap → navigation |

**Query approach:**

Since `prophecy_chains.links_json` contains `book_dir` and `chapter_num` per link, and `difficult_passages.related_chapters_json` contains `{ book_dir, chapter_num }` objects, we need to search JSON:

```typescript
// Option A: SQL JSON search (SQLite 3.38+)
export async function getProphecyChainsForChapter(
  bookDir: string, chapterNum: number
): Promise<ProphecyChain[]> {
  return getDb().getAllAsync<ProphecyChain>(
    `SELECT * FROM prophecy_chains
     WHERE links_json LIKE ? AND links_json LIKE ?`,
    [`%"book_dir":"${bookDir}"%`, `%"chapter_num":${chapterNum}%`]
  );
}

// Option B: Denormalized lookup table (better for performance)
// Add in Batch 1 if we want fast lookups:
// CREATE TABLE prophecy_chain_links (
//   chain_id TEXT, book_dir TEXT, chapter_num INTEGER,
//   PRIMARY KEY (chain_id, book_dir, chapter_num)
// );
```

Going with Option A for simplicity — the tables are small (60 chains, 80 passages). LIKE on JSON is fine for <100 rows. If it becomes a performance issue, denormalize later.

**UI placement:**
- ChapterNavBar: add small icon badges next to existing buttons
  - 🔗 icon (or chain icon) if any prophecy chains reference this chapter — shows count
  - ❓ icon if any difficult passages reference this chapter — shows count
- Tapping opens a small bottom sheet listing the matching chains/passages
- Tapping a chain/passage in the sheet navigates to ProphecyDetail / DifficultPassageDetail

**Alternative (simpler):** Add indicators to ChapterHeader subtitle area as tappable chips:
```
Genesis 22 — The Binding of Isaac
[🔗 2 prophecy chains] [❓ 1 hard question]
```

Going with the chip approach — less invasive to ChapterNavBar, consistent with existing subtitle pattern.

**Verification:** Navigate to Genesis 22 (binding of Isaac) — should show prophecy chain indicator. Navigate to Joshua 6 — should show difficult passage indicator. Tapping navigates to detail screens.

---

### Batch 12: Polish & Final Integration

**Goal:** Finalize Explore menu layout, expand ContentStats, run full validation, update memory/docs.

**Files modified:**

| File | Change |
|------|--------|
| `app/src/screens/ExploreMenuScreen.tsx` | Reorder grid to final layout, adjust subtitle counts |
| `app/src/db/content.ts` | Expand `ContentStats` with `prophecyChainCount`, `conceptCount`, `difficultPassageCount` |
| `app/src/types/index.ts` | Extend `ContentStats` interface |
| `_tools/FEATURE_PLAN.md` | Mark features as COMPLETE |
| `_tools/NEXT_SESSION_PROMPT.md` | Update with new feature status |

**ContentStats expansion:**
```typescript
export interface ContentStats {
  liveBooks: number;
  liveChapters: number;
  scholarCount: number;
  peopleCount: number;
  timelineCount: number;
  prophecyChainCount: number;    // ADD
  conceptCount: number;          // ADD
  difficultPassageCount: number; // ADD
}
```

```typescript
export async function getContentStats(): Promise<ContentStats> {
  const [books, chapters, scholars, people, timeline, prophecy, concepts, difficult] =
    await Promise.all([
      // ...existing queries...
      getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM prophecy_chains"),
      getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM concepts"),
      getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM difficult_passages"),
    ]);
  return {
    // ...existing...
    prophecyChainCount: prophecy?.c ?? 0,
    conceptCount: concepts?.c ?? 0,
    difficultPassageCount: difficult?.c ?? 0,
  };
}
```

**ExploreMenuScreen final layout:**

```typescript
const HERO_FEATURES: Feature[] = [
  { title: 'People', ... },
  { title: 'Timeline', ... },
];

const GRID_FEATURES: Feature[] = [
  { title: 'Map', ... },
  { title: 'Parallel Passages', ... },
  { title: 'Word Studies', ... },
  { title: 'Scholars', ... },
  {
    title: 'Prophecy & Typology',
    subtitle: (s) => s ? `${s.prophecyChainCount} fulfillment chains` : 'Across the canon',
    screen: 'ProphecyBrowse',
  },
  {
    title: 'Concepts',
    subtitle: (s) => s ? `${s.conceptCount} theological themes` : 'Cross-canon themes',
    screen: 'ConceptBrowse',
  },
  {
    title: 'Hard Questions',
    subtitle: (s) => s ? `${s.difficultPassageCount} difficult passages` : 'Scholarly responses',
    screen: 'DifficultPassages',
  },
];
```

**Full validation run:**
```bash
python3 _tools/build_sqlite.py
python3 _tools/validate.py
python3 _tools/validate_sqlite.py
```

**Final checklist:**
- [ ] All 3 new Explore cards visible and functional
- [ ] Prophecy Browse → Detail → Chapter navigation works
- [ ] Concept Browse → Detail → sub-navigation (word studies, people, chapters) works
- [ ] Hard Questions Browse → Detail → scholar bios + chapter navigation works
- [ ] Notes: create collection, add tags, link notes, search FTS, export collection
- [ ] Discourse panel visible on Romans chapters (if content built)
- [ ] Chapter cross-link indicators appear on relevant chapters
- [ ] ContentStats shows correct counts
- [ ] No TypeScript errors, no console warnings

---

## Summary Table

| Batch | Feature | Type | New Files | Modified Files | Depends On |
|-------|---------|------|-----------|----------------|------------|
| 1 | All | Pipeline | 3 stubs | 5 | — |
| 2 | F1 | Content | 0 | 1 | Batch 1 |
| 3 | F1 | Screens | 3 | 4 | Batch 2 |
| 4 | F2 | Infra | 0 | 3 | — |
| 5 | F2 | Screens | 4 | 4 | Batch 4 |
| 6 | F3 | Component | 1 | 3 | — |
| 7 | F3 | Content | 0 | 16 | Batch 6 |
| 8 | F4 | Full feature | 3 | 5 | Batch 1 (+ Batch 2 for richer data) |
| 9 | F5 | Content | 0 | 1 | Batch 1 |
| 10 | F5 | Screens | 3 | 4 | Batch 9 |
| 11 | All | Integration | 0 | 4 | Batches 3, 10 |
| 12 | All | Polish | 0 | 5 | All previous |

**Parallel tracks:** Batches 4-5 (notes) and Batches 6-7 (discourse) are fully independent of Batches 1-3 and 8-10. They can proceed in parallel or in any order.

**Content-heavy batches:** 2, 7, 9 are the big ones — these are where the real time goes.

---

## Git Commit Convention

```
feat(prophecy): Batch 1 — pipeline scaffolding for 3 new tables
feat(prophecy): Batch 2 — 48 prophecy chains content
feat(prophecy): Batch 3 — ProphecyBrowse + ProphecyDetail screens
feat(notes): Batch 4 — user.db migration v2 (tags, collections, links)
feat(notes): Batch 5 — enhanced notes UI + CollectionDetail
feat(discourse): Batch 6 — DiscoursePanel component + PanelRenderer wiring
feat(discourse): Batch 7 — Romans 1-16 discourse data
feat(concepts): Batch 8 — Concept Explorer (browse + detail + aggregation)
feat(difficult): Batch 9 — 65 difficult passages content
feat(difficult): Batch 10 — DifficultPassagesBrowse + Detail screens
feat(crosslink): Batch 11 — chapter-level prophecy + difficulty indicators
chore(polish): Batch 12 — Explore layout, ContentStats, final validation
```
