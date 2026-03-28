# Companion Study — Session Handoff: Batch 12E+

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

## Current State (as of commit 0e2bd9d3)

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
| 12A | Timeline: data fixes + era architecture | ✅ Complete |
| 12B | Timeline: +54 missing biblical events (146→200) | ✅ Complete |
| 12C | Timeline: +66 book authorship events (new category) | ✅ Complete |
| 12D | Timeline: chapter links (32→1032 chapters linked) | ✅ Complete |
| **12E** | **Timeline: UI enhancements** | **← START HERE** |

### Bug Fixes This Session

- **Notes overlay keyboard bug:** `KeyboardAvoidingView` added so header stays below status bar when keyboard opens
- **Notes auto-edit on create:** New notes now auto-enter edit mode so tags/collections/links are immediately visible
- **Timeline deep-link bug:** Chapter JSON stores raw IDs (`creation`) but timelines DB uses prefixed IDs (`evt_creation`). `TimelineScreen` now checks both forms.
- **Book events filter:** `'book'` category included in events toggle so book authorship events render on timeline.

---

## Database Stats

- **66 books** (ALL 66 LIVE — Revelation completed)
- **1,189 chapters** in DB
- **543 timeline entries** (203 events + 66 books + 250 people + 24 world)
- **1,032 chapters** with timeline deep-links (87% coverage)
- 50 prophecy chains (283 links)
- 20 concepts
- 53 difficult passages
- 16 discourse panels (Romans)
- 43 word studies (26 Hebrew, 17 Greek)
- 51 scholars, 282 people, 73 places
- DB version 0.15

---

## Phase 12E: Timeline UI Enhancements ← START HERE

**Estimated time: 2 hours**

### 1. Add "Books" category toggle
- New chip in category filter row: 📖 Books
- Color: `#7a6b5a` (parchment brown)
- Add `showBooks` state alongside `showEvents`, `showPeople`, `showWorld`
- Book events already in DB with `category='book'` — just need UI toggle
- **Note:** Currently books are bundled with events toggle (added in 12D-1). Separate them into their own toggle.

### 2. Data-driven era rendering
- `EraFilterBar` should read era config from DB (`getTimelineEraConfig()`) instead of hardcoded constants
- `timelineLayout.ts` should accept passed config instead of `ERA_RANGES` constant
- Era config already stored in `genealogy_config` table under key `timeline_era_config`

### 3. Event detail → chapter navigation
- If a timeline event has `chapter_link`, show "Go to Chapter" button in the event detail popup/card
- Parse chapter_link format: `{testament}/{book_id}/{DisplayName}_{ch}.html`
- Navigate to `ChapterScreen` with `{ bookId, chapterNum }`
- Reference: `MapScreen.tsx` lines 115-124 already has this parsing logic

### 4. Visual distinction for book events
- Different marker shape (square or book icon) vs circle for regular events
- Use `category` field to distinguish: `'event'` = circle, `'book'` = square/book

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `content/meta/timelines.json` | Source of truth — events, book_events, timeline_people, world_events, era_config |
| `_tools/build_sqlite.py` | Lines 593-660: `populate_timelines()` — processes all 4 arrays |
| `app/src/screens/TimelineScreen.tsx` | Main timeline UI |
| `app/src/utils/timelineLayout.ts` | Layout math, `ERA_RANGES`, positioning |
| `app/src/components/tree/EraFilterBar.tsx` | Era filter chips |
| `app/src/db/content.ts` | Timeline queries + `getTimelineEraConfig()` |
| `app/src/types/index.ts` | `TimelineEntry`, `EraConfig` interfaces |
| `app/src/components/NotesOverlay.tsx` | Notes modal (recently fixed) |

---

## After Batch 12

**Batch 13:** Cross-reference thread expansion
**Batch 14:** Map story enhancements

### Standing Enrichment Debt
- Isaiah 23-66 (44 chapters) — thin panels
- Kings/Chronicles MacArthur panels (112 chapters)
- ~134 Psalms without timeline links (no natural narrative anchors)

---

## Deploy

After each phase commit:
```bash
cd app
eas update --branch production
```
