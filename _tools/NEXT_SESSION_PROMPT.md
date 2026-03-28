# Companion Study — Session Handoff: Batch 13+

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

## Current State (as of commit f5d2b8bb)

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
| 12E | Timeline: UI enhancements | ✅ Complete |
| **13** | **Cross-reference thread expansion** | **← START HERE** |

### Batch 12 Delivered (This Session)

**Content:**
- +54 biblical events across all 12 eras (146→200)
- +66 book authorship events (new `book_events` array, `category='book'`)
- Chapter timeline links expanded from 32→1,032 (87% coverage)

**UI:**
- Books category toggle (parchment brown #7a6b5a, separate from Events)
- Square markers for book events, circles for regular events
- "Go to Chapter →" button in event detail panel
- Book events render above axis alongside regular events

**Bug Fixes:**
- Notes overlay: `KeyboardAvoidingView` prevents header from sliding behind status bar
- Notes: auto-enter edit mode on create so tags/collections/links are immediately visible
- Timeline deep-link: now handles `evt_`/`bk_` prefix mismatch between chapter JSON and DB
- Validator counts synced for Revelation completion (66 live books)

---

## Database Stats

- **66 books** (ALL 66 LIVE)
- **1,189 chapters** in DB
- **543 timeline entries** (203 events + 66 books + 250 people + 24 world)
- **1,032 chapters** with timeline deep-links (87% coverage)
- 50 prophecy chains (283 links)
- 20 concepts, 53 difficult passages
- 16 discourse panels (Romans)
- 43 word studies (26 Hebrew, 17 Greek)
- 51 scholars, 282 people, 73 places
- DB version 0.15

---

## What's Next

**Batch 13:** Cross-reference thread expansion
**Batch 14:** Map story enhancements

### Standing Enrichment Debt
- Isaiah 23-66 (44 chapters) — thin panels
- Kings/Chronicles MacArthur panels (112 chapters)
- ~134 Psalms without timeline links (no natural narrative anchors)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `content/meta/timelines.json` | Timeline source of truth (events, book_events, people, world, era_config) |
| `_tools/build_sqlite.py` | JSON→SQLite compiler |
| `app/src/screens/TimelineScreen.tsx` | Timeline UI (category toggles, SVG canvas, detail modal) |
| `app/src/utils/timelineLayout.ts` | Layout math, ERA_RANGES, lane assignment |
| `app/src/components/tree/EraFilterBar.tsx` | Era filter pills |
| `app/src/components/NotesOverlay.tsx` | Notes modal (KeyboardAvoidingView, auto-edit) |

---

## Deploy

After each phase commit:
```bash
cd app
eas update --branch production
```
