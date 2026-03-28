# Companion Study — Session Handoff

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

## Current State

All 66 books are live. No new books or chapters will be added.
Content work is now enrichment, accuracy auditing, and feature development.

### Feature Batches Complete

| Batch | Feature | Status |
|-------|---------|--------|
| 1 | Feature 1 infra (prophecy_chains table, types, queries) | Done |
| 2 | Prophecy chains content (50 chains, 283 links) | Done |
| 3 | ProphecyBrowse + ProphecyDetail screens | Done |
| 4 | user.db migration v2 (tags, collections, links, FTS) | Done |
| 5 | Enhanced notes UI (AllNotesScreen 3-tab, CollectionDetail, NotesOverlay) | Done |
| 6 | DiscoursePanel component + wiring | Done |
| 7 | Discourse content for Romans 1-16 | Done |
| 8 | Concept Explorer (20 concepts + screens) | Done |
| 9a | Difficult Passages (28 entries — first half) | Done |
| 9b | Difficult Passages (25 entries — second half) | Done |
| 10 | DifficultPassagesBrowse + DifficultPassageDetail screens | Done |
| 11 | Word Study expansion (+8 studies, concept links) | Done |
| 12A | Timeline: data fixes + era architecture | Done |
| 12B | Timeline: +54 missing biblical events (146->200) | Done |
| 12C | Timeline: +66 book authorship events (new category) | Done |
| 12D | Timeline: chapter links (32->1032 chapters linked) | Done |
| 12E | Timeline: UI enhancements | Done |
| **13** | **Cross-reference thread expansion** | **START HERE** |

### Content Remediation Complete

| Batch | Description | Status |
|-------|-------------|--------|
| 0 | Word Study bug fix | Done |
| 1 | Scholar bio fixes (8 scholars) | Done |
| 2 | Empty/ghost panel population (~660 panels) | Done |
| 3 | People enrichment (41 entries) | Done |
| 4 | Missing parallel passages (8 entries) | Done |
| 5 | New word studies (20 entries) | Done |
| **6** | **Thin panel enrichment (~259 panels)** | **NEXT** |

---

## Database Stats

- **66 books** (ALL LIVE)
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

### Batch 13: Cross-reference thread expansion

### Batch 14: Map story enhancements

### Batch 6 (Remediation): Thin Panel Enrichment

259 panels with content between 50-150 chars. Functional but shallow.

**Section panels (138 thin):** Mostly cross-ref panels in Chronicles, Nehemiah, Esther with only one reference each. Enrich to 2-3 references with explanatory notes.

**Chapter panels (121 thin):** Mostly ppl (People) and rec (Reception History) panels in prophets with minimal text. Expand people panels with role context, expand reception panels with how the passage has been interpreted across Jewish and Christian traditions.

### Standing Enrichment Debt

- Isaiah 23-66 (44 chapters) — thin panels
- Kings/Chronicles MacArthur panels (112 chapters)
- ~134 Psalms without timeline links (no natural narrative anchors)

---

## Quality Standards for Content

**Panel content must:**
- Be factually accurate and sourced from legitimate scholarship
- Provide insight the reader couldn't get from reading the text alone
- Be 150+ chars minimum per panel (enough for 2-3 substantive points)
- Use the scholar's known interpretive tradition and voice
- Include specific verse references within the section range

**People bios must:**
- Explain who they were in context (not just "son of X")
- Note their significance to biblical narrative
- Include approximate dates where scholarly consensus exists
- Reference key Scripture passages
- Be consistent between tree and timeline entries

**Word studies must:**
- Include the original script and accurate transliteration
- Provide Strong's number for cross-reference
- List 3+ glosses showing semantic range
- Include 3+ key occurrences with passage context
- Explain theological significance

**Cross-references must:**
- Show the actual connection (not just list a verse)
- Explain how the referenced passage illuminates the current text
- Prioritize conceptual/thematic links over superficial word matches

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `_tools/DEV_GUIDE.md` | All conventions, pipeline, content standards, gotchas |
| `content/meta/timelines.json` | Timeline source of truth (events, book_events, people, world, era_config) |
| `_tools/build_sqlite.py` | JSON->SQLite compiler |
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
