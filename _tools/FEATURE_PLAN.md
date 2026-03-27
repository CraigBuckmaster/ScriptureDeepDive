# Companion Study — Feature Build Plan

**Version:** 1.0  
**Date:** March 2026  
**Status:** Planning  

---

## Overview

Five new features, ordered by priority. Each is designed to integrate cleanly with the existing JSON → SQLite → React Native pipeline, reuse established UI patterns (panel architecture, Explore cards, list → detail screens), and require zero architectural changes.

---

## Feature 1: Typology & Prophecy Fulfillment Tracker

### Problem
Users encounter OT passages that foreshadow or prefigure NT fulfillment — but the app has no dedicated surface to explore these connections. Cross-ref panels link individual verses. Cross-ref threads trace 11 thematic chains. Neither answers the question: *"Show me every Messianic prophecy and where it's fulfilled."*

### What It Is
A browsable index of prophecy-fulfillment chains and typological patterns, accessible from Explore and cross-linked from chapter view when reading a relevant passage.

### Data Model

**New meta file:** `content/meta/prophecy-chains.json`

```json
[
  {
    "id": "lamb-of-god",
    "title": "The Lamb of God",
    "category": "sacrifice",
    "type": "typology",
    "summary": "From Passover lamb to the Lamb who takes away the sin of the world.",
    "tags": ["sacrifice", "atonement", "passover", "christology"],
    "links": [
      {
        "ref": "Gen 22:7-8",
        "role": "shadow",
        "label": "Abraham: 'God will provide the lamb'",
        "book_dir": "genesis",
        "chapter_num": 22
      },
      {
        "ref": "Exod 12:3-7",
        "role": "type",
        "label": "Passover lamb — unblemished, blood on doorposts",
        "book_dir": "exodus",
        "chapter_num": 12
      },
      {
        "ref": "Isa 53:7",
        "role": "prophecy",
        "label": "Led like a lamb to the slaughter",
        "book_dir": "isaiah",
        "chapter_num": 53
      },
      {
        "ref": "John 1:29",
        "role": "fulfillment",
        "label": "Behold, the Lamb of God",
        "book_dir": "john",
        "chapter_num": 1
      },
      {
        "ref": "Rev 5:6",
        "role": "consummation",
        "label": "The Lamb standing as though slain",
        "book_dir": "revelation",
        "chapter_num": 5
      }
    ]
  }
]
```

**Categories:** `sacrifice`, `kingship`, `priesthood`, `exodus`, `temple`, `covenant`, `creation`, `judgment`, `restoration`

**Link roles:** `shadow` (early hint), `type` (OT pattern), `prophecy` (explicit prediction), `fulfillment` (NT realization), `consummation` (eschatological completion)

**Target count:** 40-60 chains. Examples:
- Adam → Christ (headship/representation)
- Isaac → Christ (substitutionary sacrifice)
- Joseph → Christ (rejected then exalted)
- Moses → Christ (prophet like Moses, Deut 18:15)
- David → Messianic King
- Melchizedek → Christ's priesthood
- Passover → Lord's Supper
- Exodus → Salvation paradigm
- Tabernacle → Incarnation (John 1:14)
- Day of Atonement → Christ's sacrifice
- Jonah → Death and resurrection (Matt 12:40)
- Bronze serpent → Crucifixion (John 3:14)
- ~30 explicit Messianic prophecies (Isa 7:14, Mic 5:2, Zech 9:9, etc.)

### New SQLite Table

```sql
CREATE TABLE prophecy_chains (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  chain_type TEXT NOT NULL,       -- 'typology' | 'prophecy' | 'dual'
  summary TEXT,
  tags_json TEXT,
  links_json TEXT NOT NULL        -- array of {ref, role, label, book_dir, chapter_num}
);
```

### New Screens

**ProphecyBrowseScreen** (Explore → "Prophecy & Typology")
- Filter chips: All | Sacrifice | Kingship | Priesthood | Exodus | Temple | Covenant | ...
- List of chains, each showing: title, category badge, link count, first/last ref preview
- Tapping opens ProphecyDetailScreen

**ProphecyDetailScreen**
- Chain title + summary at top
- Vertical timeline-style visualization of links:
  - Left rail: role badges (shadow → type → prophecy → fulfillment → consummation)
  - Each node: ref, label, tap to navigate to chapter
- Color coding: OT links in warm gold, NT links in silver-white

### Chapter Integration
- When rendering a section whose verse range overlaps a prophecy chain link, show a subtle indicator (e.g., a small chain icon on the section header)
- Tapping opens the ProphecyDetailScreen for that chain
- Data: build a lookup index `ref → chain_id[]` at SQLite build time (or query on the fly)

### Navigation Changes

```typescript
// types.ts — add to ExploreStackParamList:
ProphecyBrowse: undefined;
ProphecyDetail: { chainId: string };
```

### Pipeline Integration
- Add `prophecy-chains.json` to `content/meta/`
- Add table creation + insert logic to `build_sqlite.py`
- Add validation rules to `validate.py`
- Add to `validate_sqlite.py` integrity checks
- Add Explore card to ExploreMenuScreen

### Effort Estimate
- Content creation: ~3-4 sessions (40-60 chains, each requiring careful verse selection)
- SQLite + pipeline: 1 session
- Two new screens + Explore card: 1-2 sessions
- Chapter cross-linking: 1 session
- **Total: ~6-8 sessions**

---

## Feature 2: Enhanced Research Workspace

### Problem
Current notes are flat text tied to verse refs. No organization, no tagging, no collections, no cross-linking. Users doing serious multi-chapter studies have no way to group their work.

### What It Is
An upgraded notes system with tags, study collections, and note-to-note linking. Entirely in user.db — no content pipeline changes.

### Data Model Changes

**User DB Migration (version 2):**

```sql
-- Add columns to user_notes
ALTER TABLE user_notes ADD COLUMN tags_json TEXT DEFAULT '[]';
ALTER TABLE user_notes ADD COLUMN collection_id INTEGER REFERENCES study_collections(id);

-- New table: study collections
CREATE TABLE study_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#bfa050',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- New table: note links (note A references note B)
CREATE TABLE note_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
  to_note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(from_note_id, to_note_id)
);

-- Index for fast tag search
CREATE INDEX idx_notes_collection ON user_notes(collection_id);

-- FTS on notes for search
CREATE VIRTUAL TABLE notes_fts USING fts5(note_text, content=user_notes, content_rowid=id);
```

### Tag System
- Tags are user-defined strings stored as JSON array per note: `["christology", "question", "essay-draft"]`
- No predefined tag set — users create as they go
- Tag autocomplete from previously used tags (query distinct tags across all notes)
- Tag colors: auto-assigned from a palette based on hash of tag name

### Study Collections
- Named containers: "My Romans Study", "Covenant Theology Research", "Sermon Prep — Hebrews"
- Each collection has: name, description, color (user-selectable from a small palette)
- A note can belong to zero or one collection
- Collections are listed on AllNotesScreen with a filter/group toggle
- Collection detail view shows all notes in the collection, ordered by verse ref

### Note Linking
- When editing a note, user can tap "Link" to search for another note by verse ref or text
- Linked notes show a small badge; tapping navigates to the linked note
- Bi-directional display: if note A links to note B, note B shows "Referenced by note A"

### Screen Changes

**AllNotesScreen** — Enhanced
- Add filter bar: All | By Collection | By Tag | Untagged
- Collection groups: collapsible sections, each showing note count
- Tag filter: multi-select chip bar of all used tags
- Search: now uses FTS instead of LIKE

**NotesOverlay** — Enhanced
- Add tag chips below note text input (tap to add/remove)
- Add collection selector dropdown
- Add "Link to note" button → opens search sheet
- Show linked notes as tappable references below the note

**New: CollectionDetailScreen**
- Shows all notes in a collection
- Header with collection name, description, note count
- Export button: copies all notes as formatted text to clipboard

**New: CollectionManageScreen** (or bottom sheet)
- Create / rename / delete / recolor collections

### Navigation Changes

```typescript
// types.ts — add to MoreStackParamList:
CollectionDetail: { collectionId: number };
```

### User DB Query Examples

```typescript
// Get all tags used across notes
async function getAllTags(): Promise<string[]> {
  const rows = await getUserDb().getAllAsync<{ tags_json: string }>(
    "SELECT DISTINCT tags_json FROM user_notes WHERE tags_json != '[]'"
  );
  const tagSet = new Set<string>();
  rows.forEach(r => JSON.parse(r.tags_json).forEach((t: string) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// Get notes by tag
async function getNotesByTag(tag: string): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE tags_json LIKE ? ORDER BY verse_ref",
    [`%"${tag}"%`]
  );
}

// Get notes in a collection
async function getNotesInCollection(collectionId: number): Promise<UserNote[]> {
  return getUserDb().getAllAsync<UserNote>(
    "SELECT * FROM user_notes WHERE collection_id = ? ORDER BY verse_ref",
    [collectionId]
  );
}
```

### Effort Estimate
- DB migration + query layer: 1 session
- Tag UI (chips, autocomplete, filter): 1-2 sessions
- Collection CRUD + detail screen: 1-2 sessions
- Note linking UI + queries: 1 session
- FTS integration + search upgrade: 0.5 session
- Export functionality: 0.5 session
- **Total: ~5-7 sessions**

---

## Feature 3: Discourse & Argument Mapping (Epistles)

### Problem
Epistles are logical arguments, not narratives. The `lit` panel shows structural divisions but not logical flow. When Paul writes "therefore" in Romans 8:1, users need to see that it concludes the argument of Romans 5-7. The logical connections between premises, inferences, and conclusions are invisible.

### What It Is
A new chapter-level panel type (`discourse`) showing the logical argument structure of epistle chapters as a collapsible tree or flow diagram.

### Data Model

**New chapter panel type:** `discourse`

Added to `chapter_panels` in chapter JSON for applicable books:

```json
{
  "chapter_panels": {
    "discourse": {
      "thesis": "No condemnation for those in Christ Jesus",
      "nodes": [
        {
          "id": "n1",
          "type": "premise",
          "verse_range": "8:1-2",
          "text": "No condemnation — the law of the Spirit has set you free from the law of sin and death",
          "children": []
        },
        {
          "id": "n2",
          "type": "ground",
          "verse_range": "8:3-4",
          "marker": "For",
          "text": "God did what the law could not do — sent his Son to condemn sin in the flesh",
          "children": [
            {
              "id": "n2a",
              "type": "purpose",
              "verse_range": "8:4",
              "marker": "in order that",
              "text": "The righteous requirement of the law might be fulfilled in us"
            }
          ]
        },
        {
          "id": "n3",
          "type": "contrast",
          "verse_range": "8:5-8",
          "marker": "For",
          "text": "Flesh vs. Spirit mindset — death vs. life and peace",
          "children": [
            {
              "id": "n3a",
              "type": "ground",
              "verse_range": "8:7-8",
              "marker": "because",
              "text": "The mind governed by flesh is hostile to God and cannot submit to his law"
            }
          ]
        },
        {
          "id": "n4",
          "type": "inference",
          "verse_range": "8:9-11",
          "marker": "However",
          "text": "You are not in the flesh but in the Spirit — if the Spirit dwells in you",
          "children": []
        },
        {
          "id": "n5",
          "type": "conclusion",
          "verse_range": "8:12-13",
          "marker": "Therefore",
          "text": "We are debtors not to the flesh — put to death the deeds of the body and live",
          "children": []
        }
      ],
      "connectors": [
        { "from": "n1", "to": "n2", "label": "grounded by" },
        { "from": "n2", "to": "n3", "label": "elaborated by" },
        { "from": "n3", "to": "n4", "label": "contrasted with" },
        { "from": "n4", "to": "n5", "label": "leads to" }
      ],
      "note": "Romans 8 opens with the resolution of chapters 5-7. The 'therefore' of 8:1 concludes that the believer's union with Christ (ch.6), freedom from the law's condemnation (ch.7), and the Spirit's life-giving power together eliminate condemnation."
    }
  }
}
```

**Node types:** `thesis`, `premise`, `ground`, `inference`, `conclusion`, `contrast`, `concession`, `purpose`, `result`, `illustration`, `exhortation`, `doxology`

**Discourse markers tracked:** Therefore, For, Because, But, However, So then, In order that, If...then, Although, Nevertheless, Finally

### Applicable Books
Romans (16), 1 Corinthians (16), 2 Corinthians (13), Galatians (6), Ephesians (6), Philippians (4), Colossians (4), 1 Thessalonians (5), 2 Thessalonians (3), 1 Timothy (6), 2 Timothy (4), Titus (3), Philemon (1), Hebrews (13), James (5), 1 Peter (5), 2 Peter (3), 1 John (5), Jude (1)

**Total: ~144 chapters.** Not all need full discourse mapping — some are more narrative/liturgical. Realistic target: 80-100 chapters with meaningful argument structure.

### New Panel Component

**DiscoursePanel.tsx**
- Renders the argument tree as indented, collapsible nodes
- Each node shows: type badge (color-coded), verse range, discourse marker (if present), summary text
- Connectors shown as subtle lines between nodes
- Thesis displayed prominently at top
- Note displayed at bottom
- Tapping a verse range scrolls to or highlights that section

### Panel Registration
- Add `'discourse'` to `CHAPTER_PANEL_ORDER` in `panelLabels.ts`
- Add label: `discourse: 'Argument Flow'`
- Add case to `PanelRenderer.tsx`
- Import new `DiscoursePanel` component

### Content Pipeline
- Generator scripts produce `discourse` data in `chapter_panels`
- No new meta file needed — data lives in chapter JSON like `lit`, `themes`, etc.
- `build_sqlite.py` already handles arbitrary chapter panel types (stores as JSON in `chapter_panels` table)
- Validate: add schema check for discourse node structure

### Effort Estimate
- Panel component: 1-2 sessions
- Pipeline registration (labels, renderer, validation): 0.5 session
- Content creation: 6-10 sessions (80-100 chapters of careful argument analysis)
- **Total: ~8-13 sessions** (content-heavy)

---

## Feature 4: Concept Explorer (Lightweight)

### Problem
Users can search verses and browse word studies, but there's no way to ask: "Show me everything this app knows about covenant" and get back the word study, the chapters where covenant scores highest, the cross-ref threads about covenant, the people associated with covenants, and the prophecy chains involving covenant — all in one view.

### What It Is
An aggregation view that pulls together existing data across multiple tables for a given theological concept. No new data entry — it queries and assembles what's already there.

### Concept Index

**New meta file:** `content/meta/concepts.json`

```json
[
  {
    "id": "covenant",
    "name": "Covenant",
    "description": "God's binding commitment to his people — the structural backbone of biblical theology.",
    "theme_key": "Covenant",
    "word_study_ids": ["berith", "diatheke"],
    "thread_ids": ["covenant-thread"],
    "prophecy_chain_ids": ["abrahamic-covenant", "new-covenant"],
    "people_tags": ["abraham", "moses", "david", "jeremiah", "jesus"],
    "search_terms": ["covenant", "promise", "oath", "agreement", "berith"]
  },
  {
    "id": "sacrifice",
    "name": "Sacrifice & Atonement",
    "description": "The cost of reconciliation — from Abel's offering to the cross.",
    "theme_key": "Sacrifice",
    "word_study_ids": ["hesed", "kaphar"],
    "thread_ids": ["substitutionary-sacrifice"],
    "prophecy_chain_ids": ["lamb-of-god", "day-of-atonement"],
    "people_tags": ["abel", "abraham", "moses", "aaron"],
    "search_terms": ["sacrifice", "atonement", "offering", "blood", "lamb"]
  }
]
```

**Target count:** 15-25 concepts. These are the major theological themes that organize the Bible: Covenant, Sacrifice, Kingship, Priesthood, Temple, Exile/Return, Wisdom, Judgment, Mercy, Faith, Holiness, Spirit, Resurrection, Mission, Law/Grace, Creation/New Creation, etc.

### New SQLite Table

```sql
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
```

### How It Works (Query-Time Aggregation)

When user taps a concept, the app runs multiple queries and assembles the results:

```typescript
async function getConceptData(conceptId: string) {
  const concept = await db.getFirstAsync('SELECT * FROM concepts WHERE id = ?', [conceptId]);
  const parsed = {
    ...concept,
    wordStudyIds: JSON.parse(concept.word_study_ids_json),
    threadIds: JSON.parse(concept.thread_ids_json),
    prophecyChainIds: JSON.parse(concept.prophecy_chain_ids_json),
    peopleTags: JSON.parse(concept.people_tags_json),
  };

  // 1. Word studies
  const wordStudies = await db.getAllAsync(
    `SELECT * FROM word_studies WHERE id IN (${parsed.wordStudyIds.map(() => '?').join(',')})`,
    parsed.wordStudyIds
  );

  // 2. Cross-ref threads
  const threads = await db.getAllAsync(
    `SELECT * FROM cross_ref_threads WHERE id IN (${parsed.threadIds.map(() => '?').join(',')})`,
    parsed.threadIds
  );

  // 3. Prophecy chains (once Feature 1 is built)
  const chains = await db.getAllAsync(
    `SELECT * FROM prophecy_chains WHERE id IN (${parsed.prophecyChainIds.map(() => '?').join(',')})`,
    parsed.prophecyChainIds
  );

  // 4. Top chapters by theme score
  const topChapters = await db.getAllAsync(
    `SELECT cp.chapter_id, cp.content_json, c.title, c.book_dir, c.chapter_num
     FROM chapter_panels cp
     JOIN chapters c ON c.id = cp.chapter_id
     WHERE cp.panel_type = 'themes'
     ORDER BY json_extract(cp.content_json, '$.scores') DESC
     LIMIT 20`
  );
  // Filter in JS for the matching theme_key + sort by score

  // 5. Related people
  const people = await db.getAllAsync(
    `SELECT * FROM people WHERE id IN (${parsed.peopleTags.map(() => '?').join(',')})`,
    parsed.peopleTags
  );

  return { concept: parsed, wordStudies, threads, chains, topChapters, people };
}
```

### New Screens

**ConceptBrowseScreen** (Explore → "Concepts")
- Grid or list of concept cards: name, one-line description, icon count badges (word studies, threads, chapters)
- No filtering needed at 15-25 items — just a clean list

**ConceptDetailScreen**
- Scrollable sections:
  - **Overview:** Description text
  - **Word Studies:** Linked cards (tap → WordStudyDetail)
  - **Key Chapters:** Top 10 chapters by theme score (tap → Chapter)
  - **Threads:** Cross-ref thread summaries (tap → ThreadViewerSheet)
  - **Prophecy Chains:** Chain summaries (tap → ProphecyDetail) — requires Feature 1
  - **People:** Mini cards for associated people (tap → PersonDetail)

### Navigation Changes

```typescript
// types.ts — add to ExploreStackParamList:
ConceptBrowse: undefined;
ConceptDetail: { conceptId: string };
```

### Dependencies
- Enriched by Feature 1 (Prophecy Chains) — but works without it (that section just stays empty)
- Requires theme scores to be populated in chapter_panels — already done for all live books

### Effort Estimate
- Content creation (15-25 concept definitions + linkages): 1-2 sessions
- SQLite table + pipeline: 0.5 session
- Query aggregation layer: 1 session
- Two new screens: 1-2 sessions
- Explore card: 0.25 session
- **Total: ~4-6 sessions**

---

## Feature 5: Difficult Passages Index

### Problem
Users encounter passages that are confusing, ethically challenging, or apparently contradictory. The `debate` panel addresses some of these per-chapter, but there's no browse-able index where a user can say "what are the hard questions in Genesis?" or "show me apparent contradictions across the Bible."

### What It Is
A curated index of difficult passages with scholarly responses, browsable from Explore and cross-linked to chapter view.

### Data Model

**New meta file:** `content/meta/difficult-passages.json`

```json
[
  {
    "id": "gen-genocide-canaanites",
    "title": "The Conquest of Canaan",
    "category": "ethical",
    "severity": "major",
    "passage": "Josh 6:21; Deut 20:16-18",
    "question": "How do we reconcile God's command to destroy the Canaanites with his character of love and justice?",
    "responses": [
      {
        "tradition": "Ancient Near Eastern context",
        "summary": "The language of total destruction (herem) is conventional ANE warfare rhetoric — hyperbolic, not literal. Archaeological evidence shows Canaanite culture persisted in the region. The command targets Canaanite religion (idolatry, child sacrifice), not ethnicity.",
        "scholars": ["hess", "block"]
      },
      {
        "tradition": "Progressive revelation",
        "summary": "God accommodated to the moral framework available in the ancient world. As revelation progresses, the ethic moves from corporate judgment toward individual accountability and enemy love (Matt 5:44).",
        "scholars": ["longman", "calvin"]
      },
      {
        "tradition": "Divine judgment",
        "summary": "God as moral governor has the right to judge nations. Genesis 15:16 indicates God waited 400 years for Canaanite iniquity to reach its full measure. The conquest is judicial, not genocidal.",
        "scholars": ["mac"]
      }
    ],
    "related_chapters": [
      { "book_dir": "joshua", "chapter_num": 6 },
      { "book_dir": "deuteronomy", "chapter_num": 20 }
    ],
    "tags": ["violence", "old-testament", "conquest", "divine-command"]
  }
]
```

**Categories:** `ethical` (violence, slavery, gender), `contradiction` (apparent discrepancies), `theological` (hard doctrines), `historical` (archaeology vs. text), `textual` (translation disputes)

**Severity:** `major` (frequently asked, high stakes), `moderate` (common question, manageable), `minor` (specialist interest)

**Target count:** 50-80 entries. Examples:
- God hardening Pharaoh's heart (Exod 4-14)
- Genocide command (Josh 6, Deut 20)
- Slavery regulations (Exod 21, Lev 25)
- Jephthah's daughter (Judg 11)
- David's census (2 Sam 24 vs 1 Chr 21 — who incited?)
- Genealogy discrepancies (Matt 1 vs Luke 3)
- Judas's death (Matt 27 vs Acts 1)
- Paul vs James on faith and works
- Imprecatory psalms (Ps 137:9)
- Ananias and Sapphira's death (Acts 5)

### New SQLite Table

```sql
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

### New Screens

**DifficultPassagesBrowseScreen** (Explore → "Hard Questions")
- Filter chips: All | Ethical | Contradictions | Theological | Historical | Textual
- Sort: by severity (major first) or by canonical order
- Each card: title, category badge, question preview (2 lines), passage ref
- Search bar for keyword search

**DifficultPassageDetailScreen**
- Question prominently displayed
- Passage reference (tappable → chapter)
- Responses as collapsible cards, each showing:
  - Tradition label
  - Summary text
  - Scholar pills (tappable → ScholarBio)
- Related chapters listed at bottom (tappable)

### Chapter Integration
- When viewing a chapter that appears in `related_chapters` of any difficult passage entry, show a small "?" indicator on the section header or chapter nav bar
- Tapping opens the DifficultPassageDetail

### Navigation Changes

```typescript
// types.ts — add to ExploreStackParamList:
DifficultPassages: undefined;
DifficultPassageDetail: { passageId: string };
```

### Effort Estimate
- Content creation: 4-6 sessions (50-80 entries with multi-tradition responses)
- SQLite + pipeline: 0.5 session
- Two new screens: 1-2 sessions
- Chapter cross-linking: 0.5 session
- **Total: ~6-9 sessions**

---

## Summary: Implementation Order & Dependencies

```
Phase 1 (Foundation)
  └── Feature 1: Prophecy Tracker ─────── new meta + 2 screens + chapter linking
  └── Feature 2: Research Workspace ───── user.db migration + enhanced notes UI

Phase 2 (Enrichment)
  └── Feature 3: Discourse Mapping ────── new panel type + epistle content
  └── Feature 4: Concept Explorer ─────── aggregation layer + 2 screens
        (enhanced by Feature 1 data)

Phase 3 (Polish)
  └── Feature 5: Difficult Passages ───── new meta + 2 screens + chapter linking
```

**Total estimated sessions: 29-43** (heavily content-dependent)

---

## Explore Menu — Updated Layout

After all five features, the Explore screen becomes:

**Hero Cards (full-width):**
1. People (existing)
2. Timeline (existing)

**Grid Cards (2-column):**
1. Map (existing)
2. Parallel Passages (existing)
3. Word Studies (existing)
4. Scholars (existing)
5. **Prophecy & Typology** (NEW — Feature 1)
6. **Concepts** (NEW — Feature 4)
7. **Hard Questions** (NEW — Feature 5)

The grid naturally accommodates odd counts. 7 grid items = 3 full rows + 1 half-width card.

---

## UI & Theme Integration

All new screens follow existing conventions:
- Background: `base.bg` (#1a1710)
- Elevated surfaces: `base.bgElevated` (#252015)
- Gold accent: `base.gold` (#bfa050)
- Text: `base.text` / `base.textDim` / `base.textMuted`
- Font families: `fontFamily.displaySemiBold`, `fontFamily.ui`
- Cards: 1px border `gold + '20'` opacity, `radii.md` corners
- Buttons: 40px height, Source Sans, pill-style for scholar tags
- All scrollable screens use `SafeAreaView` + `ScrollView` with `useScrollToTop`
- All list → detail patterns use stack navigation with gesture-enabled back
