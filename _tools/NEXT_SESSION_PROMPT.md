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

### Architecture Remediation

| Batch | Description | Status |
|-------|-------------|--------|
| 1 | Quick wins (ghost deps, tsconfig, logger migration) | Done |
| 2 | Git history purge (scripture.db bloat, 3 GB reclaimed) | Done |
| 3 | Externalize DB_VERSION to db_version.json | Done |
| 4 | Type safety (all 45 `any` types eliminated) | Done |
| 5 | Content data layer decomposition (content.ts → 9 modules) | Done |
| 6 | NotesOverlay decomposition | **PLANNED** |
| 7 | Inline style migration | **PLANNED** |
| 8A-C | Test foundation, CI/CD, branch protection | **PLANNED** |

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
| 12A-E | Timeline: data, events, book authorship, chapter links, UI | Done |
| **15** | **Difficult Passages enrichment** | **START HERE** |

### Content Remediation Complete

| Batch | Description | Status |
|-------|-------------|--------|
| 0 | Word Study bug fix | Done |
| 1 | Scholar bio fixes (8 scholars) | Done |
| 2 | Empty/ghost panel population (~660 panels) | Done |
| 3 | People enrichment (41 entries) | Done |
| 4 | Missing parallel passages (8 entries) | Done |
| 5 | New word studies (20 entries) | Done |
| 6 | Thin panel enrichment (~259 panels) | Planned |

---

## Database Stats

- **66 books** (ALL LIVE)
- **1,189 chapters** in DB
- **543 timeline entries** (203 events + 66 books + 250 people + 24 world)
- **1,032 chapters** with timeline deep-links (87% coverage)
- 50 prophecy chains (283 links)
- 20 concepts, 53 difficult passages (2 enriched, 51 pending)
- 16 discourse panels (Romans)
- 43 word studies (26 Hebrew, 17 Greek)
- 51 scholars, 282 people, 73 places
- DB version 0.17

---

## What's Next — Difficult Passages Enrichment (Batch 15)

### Overview

The schema, UI, and pipeline are already built and shipped. The DifficultPassageDetailScreen
now supports: context, key_verses, consensus, further_reading at the passage level, and
tradition_family, key_verses, strengths, weaknesses at the response level. All new fields
are optional — un-enriched entries render gracefully with the old layout.

Two entries are fully enriched as proof-of-concept: `canaanite-conquest` and `mark-ending`.
Use these as the quality/depth template for all remaining entries.

### Enrichment Targets Per Passage

- `context`: 200-400 chars framing the difficulty (what the text says, why it's a problem)
- `key_verses`: 2-5 NIV verses with ref and text
- `consensus`: 150-300 chars noting where scholarship broadly lands
- `further_reading`: 1-3 real, citable published works
- 4-6 responses (variable per passage, based on how many legitimate positions exist)
- Each response `summary`: 500-1000 chars (current average is 229 — need 2-4x expansion)
- Each response: `tradition_family`, `key_verses`, `strengths`, `weaknesses`
- No single scholar in more than 15% of total responses

### Content Principles

- **Lean evangelical but represent other views fairly.** This is an evangelical study app.
- **Present all views but note scholarly consensus where it exists.**
- **Never fabricate scholar positions.** Attribute interpretive positions scholars genuinely hold
  based on their published works. Summaries are paraphrased positions, not direct quotes.
- **Diversify scholar attribution.** Use the full roster of 51 scholars in the app. Reduce
  MacArthur from 28% to <15%. Add Jewish (Sarna, Alter), patristic (Calvin, Catena),
  and NT-specific (Moo, Schreiner, Fee, Keener) voices where appropriate.

### Batch Order (by category)

Work through in this order — each category has similar research patterns:

| Batch | Category | Count | Notes |
|-------|----------|-------|-------|
| 15A | Textual | 8 passages | Most factual, lowest controversy, good warm-up |
| 15B | Historical | 10 passages | Archaeological/dating evidence is concrete |
| 15C | Contradiction | 10 passages | Harmonization patterns are well-established |
| 15D | Theological | 10 passages | Need careful tradition-balancing |
| 15E | Ethical | 15 passages | Highest scrutiny, do last with full pattern established |

### How to Enrich a Passage

1. Open `content/meta/difficult-passages.json`
2. Find the entry by `id`
3. Add `context`, `key_verses`, `consensus`, `further_reading` fields
4. Expand `responses` array: increase to 4-6 entries, add `tradition_family`, `key_verses`,
   `strengths`, `weaknesses` to each response, expand `summary` to 500-1000 chars
5. Reference the two completed entries (`canaanite-conquest`, `mark-ending`) for format/depth
6. Run pipeline: `python3 _tools/build_sqlite.py` → `cp scripture.db app/assets/scripture.db`
7. Verify on device

### Passage IDs by Batch

**15A — Textual (8):**
`mark-ending` (DONE), `woman-adultery`, `johannine-comma`, `lords-prayer-doxology`,
`isaiah-authorship`, `matthew-jeremiah-citation`, `ot-quotation-mismatch`,
`significant-manuscript-variants`

**15B — Historical (10):**
`long-lifespans`, `exodus-date`, `jericho-walls`, `quirinius-census`,
`large-numbers-exodus`, `belshazzar-king`, `darius-mede`, `conquest-ai`,
`daniel-court-tales`, `jonah-fish`

**15C — Contradiction (10):**
`judas-death`, `david-census`, `genealogies-matthew-luke`, `resurrection-differences`,
`sermon-mount-plain`, `saul-death`, `goliath-killer`, `temple-cleansing`,
`peter-denials`, `temple-dimensions`

**15D — Theological (10):**
`pharaoh-heart`, `unforgivable-sin`, `lose-salvation`, `problem-of-suffering`,
`predestination-choice`, `jacob-esau-hated`, `women-silent`, `head-coverings`,
`nephilim-sons-of-god`, `balaam-prophet-villain`

**15E — Ethical (15):**
`canaanite-conquest` (DONE), `slavery-laws`, `jephthah-daughter`,
`imprecatory-psalms`, `elisha-bears`, `ananias-sapphira`, `levite-concubine`,
`abraham-wife-sister`, `abraham-sacrifice-isaac`, `lot-daughters`,
`david-bathsheba-uriah`, `jacob-deceiving-isaac`, `hosea-prostitute`,
`samson-violence`, `saul-kill-agag`

---

## Other Planned Work

### Batch 13: Cross-reference thread expansion

### Batch 14: Map story enhancements

### Remediation Batch 6: Thin Panel Enrichment

259 panels with content between 50-150 chars. Functional but shallow.

**Section panels (138 thin):** Mostly cross-ref panels in Chronicles, Nehemiah, Esther
with only one reference each. Enrich to 2-3 references with explanatory notes.

**Chapter panels (121 thin):** Mostly ppl (People) and rec (Reception History) panels
in prophets with minimal text.

### Arch Remediation Batch 6: NotesOverlay Decomposition

See `_tools/ARCH_PLAN.md` for full plan.

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

**Difficult passage responses must:**
- Attribute only positions scholars genuinely hold based on published works
- Expand summaries to 500-1000 chars with specific verse citations inline
- Include tradition_family, key_verses, strengths, and weaknesses
- Never fabricate quotes or positions — paraphrase known scholarly arguments
- Use the enriched `canaanite-conquest` and `mark-ending` as quality templates

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `_tools/ARCH_PLAN.md` | Full architectural remediation plan (Batches 1-8) |
| `_tools/DEV_GUIDE.md` | All conventions, pipeline, content standards, gotchas |
| `_tools/db_version.json` | Single source of truth for DB version |
| `_tools/build_sqlite.py` | JSON→SQLite compiler |
| `content/meta/difficult-passages.json` | Difficult passages source of truth |
| `app/src/hooks/useDifficultPassages.ts` | Types + data hooks for difficult passages |
| `app/src/screens/DifficultPassageDetailScreen.tsx` | Enriched detail UI with expandable analysis |
| `app/src/screens/DifficultPassagesBrowseScreen.tsx` | Browse/filter/search UI |

---

## Deploy

After each phase commit:
```bash
python3 _tools/build_sqlite.py
cp scripture.db app/assets/scripture.db
git add -A && git commit -m "..." && git push
cd app && eas update --branch production
```
