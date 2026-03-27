# Companion Study — Session Handoff: Batch 12

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

## Current State (as of commit 4d35a0c5)

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
| 9b | Difficult Passages (25 entries — second half) | ✅ Complete |
| 10 | DifficultPassagesBrowse + DifficultPassageDetail screens | ✅ Complete |
| 11 | Word Study expansion (+8 studies, concept links) | ✅ Complete |
| **12** | **Timeline improvements** | **NEXT** |

---

## Database Stats (as of Batch 11)

- 66 books total (58 live, 1146 chapters)
- 50 prophecy chains (283 links)
- 20 concepts (all with word study links now)
- 53 difficult passages
- 16 discourse panels (Romans)
- 43 word studies (26 Hebrew, 17 Greek)
- 51 scholars
- 281 people (37 spine, 244 satellite)
- 420 timeline events

---

## Batch 12: Timeline Improvements

**Goal:** Enhance timeline content and visualization.

### Current State

`timelines` table has 420 events with:
- `id`, `name`, `summary`, `year`, `era`, `category`
- `book_refs_json`, `tags_json`

### Files to Review

- `app/src/screens/TimelineScreen.tsx`
- `app/src/hooks/` (no dedicated timeline hook currently)
- `content/meta/timelines.json`

### Potential Improvements

1. **Content audit**: Check for gaps in major biblical events
2. **Era coverage**: Ensure balanced coverage across eras (Patriarchs, Exodus, Judges, United Kingdom, Divided Kingdom, Exile, Return, Intertestamental, NT)
3. **Category enrichment**: Add categories if missing (political, religious, prophetic, etc.)
4. **Chapter linking**: Ensure events link to relevant chapters
5. **UI enhancements**: Better filtering, era navigation, event detail view

### Suggested Approach

1. Audit current timeline events by era
2. Identify major gaps (key battles, prophets, kings, NT events)
3. Add missing high-value events
4. Enhance chapter linking where weak
5. Consider UI improvements if time permits

---

## After Batch 12

**Batch 13:** Cross-reference thread expansion
**Batch 14:** Map story enhancements

---

## Deploy

After commit:
```bash
cd app
eas update --branch production
```
