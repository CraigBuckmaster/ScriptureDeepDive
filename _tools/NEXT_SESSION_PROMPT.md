# Companion Study — Session Handoff: Batch 8

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

## Current State (as of commit 2b714e67)

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
| **8** | **Concept Explorer (concepts.json + screens)** | **NEXT** |

### Key Files Created in Batches 1-7

- `app/src/screens/ProphecyBrowseScreen.tsx` — Category filter + chain cards
- `app/src/screens/ProphecyDetailScreen.tsx` — Timeline rail view
- `app/src/hooks/useProphecyChains.ts` — Data hooks
- `app/src/components/TagChips.tsx` — Tag editing component
- `app/src/components/CollectionPicker.tsx` — Bottom sheet for collections
- `app/src/components/NoteLinkSheet.tsx` — Note linking sheet
- `app/src/screens/CollectionDetailScreen.tsx` — Collection notes view
- `app/src/components/panels/DiscoursePanel.tsx` — Argument flow panel
- `content/romans/*.json` — All 16 chapters now have discourse data

---

## Batch 8: Concept Explorer

**Goal:** Populate `concepts.json` with 15-25 theological concepts + build ConceptBrowseScreen + ConceptDetailScreen + Explore card. Feature fully functional after this batch.

### Files to Create

| File | Purpose |
|------|---------|
| `app/src/screens/ConceptBrowseScreen.tsx` | Browse all theological concepts |
| `app/src/screens/ConceptDetailScreen.tsx` | Aggregated detail view |
| `app/src/hooks/useConceptData.ts` | Hook that runs multi-table aggregation |

### Files to Modify

| File | Change |
|------|--------|
| `content/meta/concepts.json` | Replace stub with 15-25 concept entries |
| `app/src/navigation/types.ts` | Add `ConceptBrowse` + `ConceptDetail` to `ExploreStackParamList` |
| `app/src/navigation/ExploreStack.tsx` | Register 2 new screens |
| `app/src/screens/ExploreMenuScreen.tsx` | Add "Concepts" grid card |

### Concept Data Structure

```typescript
interface Concept {
  id: string;
  title: string;
  description: string;
  theme_key?: string;          // Links to chapter themes scores
  word_study_ids: string[];    // Links to word_studies table
  thread_ids: string[];        // Links to cross_ref_threads table
  prophecy_chain_ids: string[];// Links to prophecy_chains table
  people_tags: string[];       // Links to people table
  tags: string[];
}
```

### Target Concepts (15-25)

| Concept | theme_key | word_study_ids | thread_ids | prophecy_chain_ids |
|---------|-----------|---------------|-----------|-------------------|
| Covenant | Covenant | [berith] | [covenant-thread] | [abrahamic-covenant, new-covenant, ...] |
| Sacrifice & Atonement | (none) | [hesed, kaphar] | [substitutionary-sacrifice] | [lamb-of-god, ...] |
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

### ConceptDetailScreen Aggregation Logic

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

### ConceptDetailScreen Sections

1. **Overview** — description text in gold-bordered callout
2. **Word Studies** — horizontal scroll of word study cards (tap → WordStudyDetail)
3. **Key Chapters** — top 10 chapters by theme score (tap → Chapter)
4. **Threads** — cross-ref thread summaries (tap → ThreadViewerSheet)
5. **Prophecy Chains** — chain cards (tap → ProphecyDetail)
6. **People** — mini person cards (tap → PersonDetail)

Each section only renders if it has data (no empty section headers).

### Implementation Steps

1. **concepts.json content** — Generate 15-25 entries with proper IDs linking to existing data
2. **Types** — Add to `ExploreStackParamList` in `navigation/types.ts`
3. **useConceptData hook** — Multi-table aggregation with parallel queries
4. **ConceptBrowseScreen** — Grid/list of concept cards with search
5. **ConceptDetailScreen** — Scrollable sections with conditional rendering
6. **ExploreStack** — Register both screens
7. **ExploreMenuScreen** — Add "Concepts" grid card

### Verification

- Explore shows "Concepts" card
- Tapping opens ConceptBrowseScreen with 15-25 concepts
- Tapping a concept opens ConceptDetailScreen with aggregated data
- All links (word studies, chapters, threads, chains, people) navigate correctly

---

## After Batch 8

**Batch 9:** Difficult Passages content (50-80 entries in `difficult-passages.json`)

See `_tools/IMPLEMENTATION_PLAN.md` lines 828-900 for full spec.

---

## Key Conventions

- **Generator scripts:** Write to `/tmp/`, delete after use
- **Content pipeline:** Generator → JSON → build_sqlite.py → validate.py → commit
- **Verse text:** Must be word-for-word NIV
- **Commit pattern:** `feat(concepts): Batch 8 — description`

## Database Stats (as of Batch 7)

- 58 live books, 8 pending
- 1146 chapters
- 50 prophecy chains
- 16 discourse panels (Romans)

## Deploy

After commit:
```bash
cd app
eas update --branch production
```
