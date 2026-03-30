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
| 15A | Difficult Passages enrichment — Textual (8 passages) | Done |
| 15B | Difficult Passages enrichment — Historical (10 passages) | Done |
| 15C | Difficult Passages enrichment — Contradiction (10 passages) | Done |
| **15D** | **Difficult Passages enrichment — Theological (10 passages)** | **START HERE** |
| 15E | Difficult Passages enrichment — Ethical (14 passages, 1 done) | Planned |

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
- 20 concepts, 53 difficult passages (**29 enriched**, 24 pending)
- 16 discourse panels (Romans)
- 43 word studies (26 Hebrew, 17 Greek)
- 51 scholars, 282 people, 73 places
- DB version 0.18

---

## What's Next — Difficult Passages Enrichment (Batch 15D + 15E)

### Overview

The schema, UI, and pipeline are already built and shipped. The DifficultPassageDetailScreen
supports: context, key_verses, consensus, further_reading at the passage level, and
tradition_family, key_verses, strengths, weaknesses at the response level. All new fields
are optional — un-enriched entries render gracefully with the old layout.

29/53 passages are enriched. Use the enriched entries (especially `canaanite-conquest` and
`marks-ending`) as quality/depth templates for all remaining entries.

### Enrichment Targets Per Passage

- `context`: 200-400 chars framing the difficulty (what the text says, why it's a problem)
- `key_verses`: 2-5 NIV verses with ref and text
- `consensus`: 150-300 chars noting where scholarship broadly lands
- `further_reading`: 1-3 real, citable published works
- 4-6 responses (variable per passage, based on how many legitimate positions exist)
- Each response `summary`: 500-1000 chars (current average is 229 for unenriched — need 2-4x expansion)
- Each response: `tradition_family`, `key_verses`, `strengths`, `weaknesses`

### Content Principles

- **Lean evangelical but represent other views fairly.** This is an evangelical study app.
- **Present all views but note scholarly consensus where it exists.**
- **Never fabricate scholar positions.** Attribute interpretive positions scholars genuinely hold
  based on their published works. Summaries are paraphrased positions, not direct quotes.
- **Diversify scholar attribution.** Use the full roster of 51 scholars in the app.

### Scholar Distribution (Current — 195 total responses)

MacArthur is at 21.5% and Longman at 15.4%. Both need to come DOWN. Target: no scholar >15%.
Use MacArthur 0-1 times per batch of 10 passages in 15D/15E. Lean into underused scholars.

**Top 10 current:**
macarthur: 42 (21.5%), longman: 30 (15.4%), keener: 21 (10.8%), block: 13 (6.7%),
calvin: 12 (6.2%), collins: 10 (5.1%), waltke: 8 (4.1%), marcus: 8 (4.1%),
provan: 6 (3.1%), sarna: 5 (2.6%)

**Underused scholars to prioritize in 15D/15E:**
NT specialists: moo, schreiner, fee (NOT YET IN scholars.json — add if needed)
OT specialists: goldingay (2), brueggemann (2), milgrom (0), fox (0), garrett (0)
Jewish: sarna (5), alter (0 in DP), levenson (0)
Patristic/Reformed: catena (2), calvin (12 — good)
Text-critical: netbible (5), robertson (5)
Women scholars: jobes (1), berlin (0), oconnor (0)

### Batch 15D — Theological (10 passages, START HERE)

These need careful tradition-balancing. Multiple confessional traditions have strong,
well-defined positions. Be especially careful with Calvinist/Arminian, egalitarian/complementarian.

**Passage IDs:**
`hardening-pharaoh`, `unforgivable-sin`, `hebrews-6-apostasy`, `problem-of-evil`,
`predestination-free-will`, `jacob-esau-loved-hated`, `women-silence`, `head-covering`,
`nephilim-sons-of-god`, `balaam-prophet-villain`

**Scholar allocation guidance for 15D:**
- Calvinist/Arminian passages: Use schreiner (Calvinist), moo (moderate), keener or longman (Arminian-leaning), block or waltke (Reformed OT)
- Women's role passages: Use keener, jobes, fee (egalitarian voices), macarthur or schreiner (complementarian), calvin (historical)
- OT theological: sarna, alter, milgrom (Jewish), block, waltke (evangelical OT), brueggemann (mainline)
- Nephilim/Balaam: sarna, alter, ashley, block, collins

### Batch 15E — Ethical (14 passages remaining, `canaanite-conquest` already done)

Highest scrutiny — do after 15D with full pattern established.

**Passage IDs:**
`slavery-regulations`, `jephthahs-daughter`, `imprecatory-psalms`, `elishas-bears`,
`ananias-sapphira`, `concubine-gibeah`, `abraham-wife-sister`, `akedah-isaac`,
`lot-daughters`, `david-bathsheba`, `jacob-deception`, `hosea-gomer`,
`samson-violence`, `kill-agag`

### How to Enrich a Passage

1. Open `content/meta/difficult-passages.json`
2. Find the entry by `id`
3. Add `context`, `key_verses`, `consensus`, `further_reading` fields
4. Expand `responses` array: increase to 4-6 entries, add `tradition_family`, `key_verses`,
   `strengths`, `weaknesses` to each response, expand `summary` to 500-1000 chars
5. Reference the enriched entries for format/depth
6. Run pipeline: `python3 _tools/build_sqlite.py` → `cp scripture.db app/assets/scripture.db`
7. `git add -A && git commit && git push`

### Enrichment Script Pattern

The proven pattern from 15A-C: write a Python script at `/tmp/enrich_15d.py` that contains
a dict of ENRICHMENTS keyed by passage ID, loads the JSON file, patches matching entries,
and writes it back. Run it, verify with a stats check, build, commit, push, delete the script.

Split into two scripts if context gets heavy (5 passages per script).

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
- Use the enriched entries as quality templates

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
