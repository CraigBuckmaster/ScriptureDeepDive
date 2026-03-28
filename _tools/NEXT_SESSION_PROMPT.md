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

## Current State (as of commit e2ef5761)

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
| **12** | **Timeline improvements** | **IN PROGRESS** |

---

## Database Stats (as of Phase 12A)

- 66 books total (58 live, 1146 chapters)
- 50 prophecy chains (283 links)
- 20 concepts (all with word study links now)
- 53 difficult passages
- 16 discourse panels (Romans)
- 43 word studies (26 Hebrew, 17 Greek)
- 51 scholars
- 281 people (37 spine, 244 satellite)
- 420 timeline events (146 biblical events, 250 people, 24 world events)
- 32 chapters with timeline links
- 12 eras in era_config (DB version 0.15)

---

## Batch 12: Timeline Improvements — Comprehensive Overhaul

### Scope Summary

| Work Area | Tasks |
|-----------|-------|
| **Data Quality Fixes** | Fix 6 problematic events (NULL era, malformed IDs, missing refs) |
| **Architecture** | Move era metadata from hardcoded TS → data-driven JSON/DB |
| **Content: Missing Events** | Audit + add significant biblical events across all eras (~50-80 new) |
| **Content: Book Authorship** | Add 66 "book written" events as new category |
| **Content: Chapter Links** | Expand from 32 → ~400+ chapters with timeline links |
| **UI Enhancements** | "Books" category toggle, detail→chapter navigation, data-driven eras |

---

### Phase 12A: Data Fixes + Era Metadata Migration ✅ COMPLETE
**Commit: e2ef5761**

Completed:
- Fixed 6 events with malformed IDs (removed double `evt_` prefix)
- Added `era: apostolic` + chapter links to 3 Thessalonians events
- Added `era_config` to `timelines.json` (12 eras with hex/name/pill/range)
- Added `divided_kingdom`, `post-exilic`, `apostolic` to `theme/colors.ts`
- Updated `ERA_RANGES` in `timelineLayout.ts` with all 12 eras
- Added `getTimelineEraConfig()` query + `EraConfig` type to `content.ts`
- `build_sqlite.py` now stores `era_config` in `genealogy_config` table

---

### Phase 12B: Content — Missing Biblical Events ← START HERE
**Estimated time: 2-3 hours**

Target: **+50-80 events** across all eras.

| Era | Current | Gaps to Fill |
|-----|---------|--------------|
| **primeval** | 6 | Lamech's song, Methuselah, Noah's vineyard |
| **patriarch** | 10 | Hagar sent away, Binding of Isaac, Jacob's ladder, Jacob wrestles angel, Joseph's dreams, Joseph rules Egypt |
| **exodus** | 11 | Individual plagues, Golden calf incident, Spies sent, Korah's rebellion, Bronze serpent, Balaam |
| **judges** | 14 | Individual judges (Ehud, Deborah, Gideon, Jephthah, Samson key events), Ruth |
| **kingdom** | 5 | Samuel anoints Saul, David vs Goliath, David flees Saul, Absalom's rebellion, Solomon's judgment, Temple dedication |
| **divided_kingdom** | 13 | More kings, Ahab/Jezebel, Naboth's vineyard, Jehu's purge |
| **prophets** | 20 | Elisha miracles, Isaiah's call details, Hezekiah's tunnel |
| **exile** | 25 | Daniel's visions (individual), Fiery furnace, Lion's den, Ezekiel's visions |
| **post-exilic** | 3 | Temple rebuilt, Ezra reads Law, Nehemiah's wall completed, Esther's deliverance |
| **intertestamental** | 5 | Ptolemaic/Seleucid rule, Septuagint translation, Hasmonean dynasty |
| **nt** | 23 | Jesus: temptation, transfiguration, Lazarus raised, triumphal entry, Last Supper, Gethsemane, trials; Stephen martyred, James killed |
| **apostolic** | 8 | Paul's shipwreck, Paul in Rome, persecution events, John's exile |

---

### Phase 12C: Content — Book Authorship Timeline
**Estimated time: 1-2 hours**

Add new category `"book"` with **66 entries** for when each biblical book was written.

**Event schema:**
```json
{
  "id": "book-genesis",
  "category": "book",
  "name": "Genesis Written",
  "year": -1445,
  "era": "exodus",
  "author": "moses",
  "ref": "Genesis",
  "summary": "Moses compiles and writes Genesis during the wilderness period..."
}
```

**Dating approach:** Conservative evangelical (traditional authorship, earlier dates for Pentateuch).

**Rough breakdown by era:**
- **Exodus era (-1445):** Genesis–Deuteronomy, Job (early dating)
- **Kingdom (-1000 to -930):** Joshua, Judges, Ruth, 1-2 Samuel, Psalms (David), Proverbs, Ecclesiastes, Song of Solomon
- **Divided/Prophets (-930 to -586):** 1-2 Kings, Isaiah, Hosea, Amos, Micah, Jonah, Nahum, Habakkuk, Zephaniah
- **Exile (-586 to -538):** Jeremiah, Lamentations, Ezekiel, Daniel, Obadiah
- **Post-exilic (-538 to -400):** 1-2 Chronicles, Ezra, Nehemiah, Esther, Haggai, Zechariah, Malachi
- **NT (45-95 AD):** All 27 NT books

---

### Phase 12D: Content — Chapter Timeline Links
**Estimated time: 3-4 hours (can be batched across sessions)**

Expand chapter → timeline event linking from **32 → 400+ chapters**.

**Batching strategy:**
1. **12D-1:** Pentateuch (187 chapters)
2. **12D-2:** Gospels + Acts (117 chapters)
3. **12D-3:** Historical books (249 chapters)
4. **12D-4:** Prophets (250 chapters)
5. **12D-5:** Epistles + Wisdom (remaining)

**Link strategy by book type:**

| Book Type | Link Strategy |
|-----------|---------------|
| **Pentateuch** | Creation, flood, patriarchs, exodus events, wilderness |
| **Historical** | Kings, battles, key narrative events |
| **Prophets** | Prophet's call, major oracles, historical context |
| **Gospels** | Jesus events (birth, ministry, passion, resurrection) |
| **Acts** | Pentecost, missionary journeys, councils |
| **Epistles** | Link to "book written" events |
| **Wisdom** | Author/era events (Solomon, David) where applicable |

**Note:** Not all chapters will have links — some Psalms, Proverbs, and theological chapters lack natural timeline anchors.

---

### Phase 12E: UI Enhancements
**Estimated time: 2 hours**

1. **Add "Books" category toggle:**
   - New chip in category row: 📖 Books
   - Color: `#7a6b5a` (parchment brown)
   - Separate swim lane below "World History"

2. **Data-driven era rendering:**
   - `EraFilterBar` reads from DB config
   - `timelineLayout.ts` uses passed config instead of constants

3. **Event detail → chapter navigation:**
   - If event has `chapter_link`, show "Go to Chapter" button
   - Navigate to `ChapterScreen` with proper params

4. **Visual distinction for book events:**
   - Different marker shape (square or book icon) vs circle for events

---

### Execution Order

```
Phase 12A (fixes + architecture)     ✅ COMPLETE (e2ef5761)
    ↓
Phase 12B (missing events)           ← START HERE
    ↓
Phase 12C (book authorship)
    ↓
Phase 12D-1 (chapter links: Pentateuch)
    ↓
Phase 12E (UI enhancements)
    ↓
Validate → Build → Deploy
    ↓
Phase 12D-2..5 (remaining chapter links) ← Can continue in future sessions
```

---

### Key Files Reference

| File | Purpose |
|------|---------|
| `content/meta/timelines.json` | Source of truth for all timeline data |
| `_tools/build_sqlite.py` | Lines 593-650: `populate_timelines()` |
| `app/src/screens/TimelineScreen.tsx` | Main timeline UI (322 lines) |
| `app/src/utils/timelineLayout.ts` | Layout math, era ranges, positioning |
| `app/src/components/tree/EraFilterBar.tsx` | Era filter chips |
| `app/src/db/content.ts` | Lines 261-278: timeline queries |
| `app/src/types/index.ts` | `TimelineEntry` interface |

---

## After Batch 12

**Batch 13:** Cross-reference thread expansion
**Batch 14:** Map story enhancements

---

## Deploy

After each phase commit:
```bash
cd app
eas update --branch production
```
