# Content Quality Remediation Plan

**Based on:** Content Quality Audit Report (March 26, 2026)
**Principle:** Populate over delete. Every button a user can tap should deliver
insight that deepens their understanding. No fabrication — only accurate
scholarly content.

---

## Work Estimate Summary

| Batch | Items | Effort | Description |
|-------|-------|--------|-------------|
| 0 | 1 | 15 min | Word Study bug fix (after error text) |
| 1 | 8 | 2 hrs | Scholar bio fixes |
| 2 | ~660 | 3–4 days | Empty/ghost panel population |
| 3 | 41 | 1 day | People enrichment (bios, dates, refs, timeline) |
| 4 | 8 | 2 hrs | Missing parallel passages |
| 5 | 20 | 1 day | New word studies |
| 6 | ~259 | 2 days | Thin panel enrichment |

**Total: ~8–9 working days**

---

## Batch 0 — Word Study Bug Fix (15 min)

Waiting on console error + render error text from user. Will fix once
provided. Likely a JSON parse issue or missing field in the detail screen.

---

## Batch 1 — Scholar Bios (2 hours)

### 1A. Full Bio Write (2 scholars)

These have no description, no sections, no tradition. Need complete bios
written in the existing format: {eyebrow, tradition, description, sections}.

1. **Brueggemann** — Walter Brueggemann. OT theology, Psalms scholarship,
   prophetic imagination framework. Columbia Theological Seminary.
   Tradition: Mainline Protestant / Progressive.

2. **Lundbom** — Jack R. Lundbom. Jeremiah specialist. Award-winning
   Anchor Bible Commentary on Jeremiah. Historical-critical approach.
   Tradition: Critical / Academic.

### 1B. Expand Thin Bios (6 scholars)

These have the template structure but only 164 chars of section text
(likely a placeholder). Need real biographical content:

3. Barry G. Webb — Judges specialist, Moore College
4. Daniel I. Block — Ezekiel/Deuteronomy, Wheaton
5. David M. Howard Jr. — Joshua, Bethel Seminary
6. David T. Tsumura — 1 Samuel, Japan Bible Seminary
7. Richard S. Hess — Joshua/OT backgrounds, Denver Seminary
8. Robert D. Bergen — 1-2 Samuel, Hannibal-LaGrange

**Pipeline:** Update bios in config.py SCHOLAR_REGISTRY → run
export_config.py → build_sqlite.py → validate.

**Files:** _tools/config.py, content/meta/scholars.json

---

## Batch 2 — Empty/Ghost Panel Population (3–4 days)

This is the largest batch. Every empty panel represents a button the user
can tap that delivers nothing. The approach is to regenerate the affected
chapters through the standard generator pipeline, populating only the
missing panel types.

### Strategy

Each sub-batch targets a specific book + panel type combination. Generator
scripts will:
1. Read the existing chapter JSON
2. Identify sections with empty/ghost panels
3. Generate quality content for those panels only
4. Merge into the existing chapter data via save_chapter()
5. Rebuild SQLite

This is a MERGE operation — existing good content is preserved,
only the empty slots get filled.

### 2A. Psalms Ghost Buttons (168 panels, 13 chapters)

**Chapters:** 24–30, 35–40
**Panel types:** alter, calvin, net, kidner, vangemeren, goldingay, mac
**Issue:** {"source":"...", "notes":[]} — source exists, notes array empty

For each scholar panel in each section, populate 2–4 commentary notes
following that scholar's perspective and interpretive tradition:
- **Alter:** Literary/poetic analysis, Hebrew wordplay, structural observations
- **Calvin:** Reformed theological exposition, doctrinal application
- **NET:** Textual variants, translation decisions, manuscript notes
- **Kidner:** Concise evangelical exposition, devotional insight
- **VanGemeren:** Redemptive-historical reading, messianic typology
- **Goldingay:** OT theology, canonical connections, critical engagement
- **MacArthur:** Verse-by-verse exposition, pastoral application

**Effort:** ~1 day (13 chapters x 7 scholars x 2 sections avg)

### 2B. Matthew Hebrew/Greek Panels (64 panels, 27 chapters)

**Chapters:** 2–28 (all except ch1)
**Panel type:** heb (empty [])
**Issue:** NT book has Hebrew panel slots but no Greek/Hebrew analysis

For a Gospel, this panel should contain Greek word analysis (the panel
renders as "Hebrew" but functionally it's "Original Language"). Each
section needs 2–4 key Greek terms with:
- Original word + transliteration
- Parsing/morphology
- Semantic significance for the passage
- How the term illuminates the meaning

**Effort:** ~1 day (27 chapters x 2–3 sections avg)

### 2C. Matthew Cross-Ref Panels (23 panels, ~8 chapters)

**Chapters:** 10, plus scattered
**Panel type:** cross (empty [])

Populate with OT quotations/allusions that Matthew cites (Matthew is the
most OT-reference-heavy Gospel). Each entry:
{"ref": "Isa 7:14", "note": "Matthew quotes this as fulfilled in..."}

**Effort:** 2 hours

### 2D. Proverbs Hebrew Panels (35 panels, 22 chapters)

**Chapters:** 1–2, 5–7, 10–17, 21–31
**Panel type:** heb (empty [])

Proverbs is rich in Hebrew wordplay, parallelism types, and
vocabulary. Each section needs 2–3 key Hebrew terms with:
- The Hebrew word/root
- How the parallelism structure works (synonymous, antithetic, synthetic)
- Wordplay or sound patterns in the original

**Effort:** ~0.5 day

### 2E. Proverbs Cross-Ref Panels (23 panels, ~15 chapters)

**Chapters:** 1–9, 31
**Panel type:** cross (empty [])

Proverbs cross-references to wisdom literature (Job, Ecclesiastes,
Song of Solomon) and NT wisdom passages (James, Colossians).

**Effort:** 2 hours

### 2F. 2 Chronicles Cross-Ref Panels (52 panels, 26 chapters)

**Chapters:** 11–36
**Panel type:** cross (empty [])

Chronicles has the richest cross-reference potential in the OT — nearly
every narrative parallels Kings. Each section needs 2–3 refs:
- Parallel Kings passage
- Any prophetic book reference (Isaiah, Jeremiah for later kings)
- NT citations where applicable

**Effort:** 0.5 day

### 2G. Exodus Historical Context Panels (165 panels, 39 chapters)

**Chapters:** 1–40 (nearly all)
**Panel type:** hist (content is "None" — Python serialization bug)

The hist panel exists but was never populated. These need real
historical context: Egyptian chronology, archaeological parallels,
ANE customs, geographical settings. Exodus is archaeologically rich —
there's plenty of legitimate scholarly content for every section.

**Effort:** ~1 day

### 2H. Remaining Small Batches

- **Exodus cross-ref** (16 empty, 12 chapters): 1 hour
- **Genesis cross-ref** (12 empty, 11 chapters): 1 hour
- **Psalms cross-ref** (12 empty, 6 chapters): 30 min
- **Ruth heb/cross** (4 empty, 3 chapters): 30 min

### 2I. Empty TX Chapter Panels (85 panels)

**Books:** Genesis (23ch), Exodus (39ch), Ruth (4ch), Proverbs (19ch)
**Panel type:** tx (Textual Criticism)

Textual criticism panels should contain:
- Key manuscript variants for the chapter
- Dead Sea Scrolls readings where available
- LXX/Septuagint differences
- Significant translation decisions

For chapters where no meaningful textual variants exist, the panel
should note that the text is well-attested with minimal variants
(this is itself useful scholarly information — the user learns the
text is reliable).

**Effort:** 0.5 day

---

## Batch 3 — People Enrichment (1 day)

### 3A. Expand Short Bios (12 people)

Priority expansion targets — people with rich biblical narratives but
thin bios. Each expanded bio should include:
- Who they were and their family context
- Their role in biblical events
- Their significance to the broader narrative
- Key Scripture references

**High priority (major narrative figures):**
1. Uriah the Hittite — David's loyal soldier, Bathsheba's husband,
   the pivot point of David's moral fall. Rich 2 Samuel narrative.
2. Abimelech (son of Gideon) — Judges 9 anti-judge, Shechem massacre,
   killed by a millstone. Cautionary tale of illegitimate kingship.
3. Abner — Saul's general, backed Ish-Bosheth, defected to David,
   murdered by Joab. Complex political figure.
4. Bilhah — Rachel's servant, mother of Dan and Naphtali, later
   involved in the Reuben incident (Gen 35:22).
5. Zilpah — Leah's servant, mother of Gad and Asher.

**Lower priority (limited available info):**
6–12: Adah, Ahinoam (x2), Irad, Jabal, Jubal, Mehujael, Methushael
— for these, expand where possible but accept shorter bios for
genuinely minor figures.

### 3B. Add Missing Dates (10 people)

Research approximate date ranges from scholarly consensus:
- **Judges era (~1200–1020 BC):** Othniel, Ehud, Barak, Jephthah,
  Abimelech, Delilah
- **United Monarchy (~1050–970 BC):** Abner, Joab, Nathan, Uriah

### 3C. Add Missing Refs (3 people)

- Hiram of Tyre: 1 Kings 5:1-12, 9:10-14; 2 Chron 2:3-16
- Oholah: Ezekiel 23:1-10
- Oholibah: Ezekiel 23:11-49

### 3D. Add Timeline Entries (28 people)

These exist in the genealogy tree but not in the timeline. Each needs
a timeline entry with: name, dates, era, summary, category='person'.

**Judges and Monarchy (10):**
Abimelech, Abner, Barak, Delilah, Ehud, Jephthah, Joab, Nathan,
Othniel, Uriah

**Minor Prophets (6):**
Habakkuk, Haggai, Hosea, Micah, Nahum, Zephaniah
(Zechariah prophet is separate from any existing Zechariah entries)

**Hosea's Family (4):**
Beeri, Gomer, Jezreel (son of Hosea), Lo-Ammi, Lo-Ruhamah

**Post-exilic (2):**
Darius I, Joshua son of Jozadak

**Ezekiel Figures (4):**
Gog, Jaazaniah son of Shaphan, Oholah, Oholibah

**Pipeline:** Update config.py PEOPLE_BIOS and TIMELINE_EVENTS →
export_config.py → build_sqlite.py → validate.

---

## Batch 4 — Missing Parallel Passages (2 hours)

Add 8 new parallel passage entries to content/meta/synoptic_map.json:

1. **The Lord's Prayer**
   Matt 6:9-13, Luke 11:2-4

2. **Sermon on the Mount / Sermon on the Plain**
   Matt 5:1–7:29, Luke 6:17-49

3. **The Rich Young Ruler**
   Matt 19:16-30, Mark 10:17-31, Luke 18:18-30

4. **The Great Commission**
   Matt 28:16-20, Mark 16:15-18, Luke 24:44-49, Acts 1:8

5. **Parable of the Sower**
   Matt 13:1-23, Mark 4:1-20, Luke 8:4-15

6. **Parable of the Mustard Seed**
   Matt 13:31-32, Mark 4:30-32, Luke 13:18-19

7. **The Beatitudes**
   Matt 5:3-12, Luke 6:20-26

8. **John the Baptist's Ministry**
   Matt 3:1-12, Mark 1:1-8, Luke 3:1-18, John 1:19-28

**Pipeline:** Add to content/meta/synoptic_map.json →
build_sqlite.py → validate.

---

## Batch 5 — New Word Studies (1 day)

Add 20 new word study entries to content/meta/word_studies.json.
Each entry needs: id, original script, transliteration, language,
Strong's number, glosses array, semantic_range, occurrences array, note.

### Hebrew OT (13 new terms)

1. aman (H539) — believe/trust/be faithful
2. qadosh (H6918) — holy/set apart
3. mishpat (H4941) — justice/judgment
4. racham (H7355) — compassion/mercy
5. yara (H3372) — fear/revere
6. gaal (H1350) — redeem/kinsman-redeemer
7. kaphar (H3722) — atone/cover
8. nabi (H5030) — prophet
9. abad (H5647) — serve/work/worship
10. tsaddiq (H6662) — righteous
11. shama (H8085) — hear/obey
12. chata (H2398) — sin/miss the mark
13. olam (H5769) — eternal/ancient/forever

### Greek NT (7 new terms)

14. charis (G5485) — grace
15. kyrios (G2962) — lord/master
16. soteria (G4991) — salvation
17. metanoia (G3341) — repentance
18. ekklesia (G1577) — church/assembly
19. euangelion (G2098) — gospel/good news
20. zoe (G2222) — life

Note: agape, dikaiosyne, pistis, logos, basileia, pneuma already exist.
ruach exists as ruah. yasha exists as yasha'. No duplicates.

**Pipeline:** Add to content/meta/word_studies.json →
build_sqlite.py → validate.

---

## Batch 6 — Thin Panel Enrichment (2 days, lower priority)

259 panels with content between 50–150 chars. These are functional but
shallow — typically a single cross-reference or a one-sentence commentary.

### Section Panels (138 thin)

Mostly cross-ref panels in Chronicles, Nehemiah, Esther with only one
reference each. Enrich to 2–3 references with explanatory notes.

### Chapter Panels (121 thin)

Mostly ppl (People) and rec (Reception History) panels in prophets
with minimal text. Expand people panels with role context, expand
reception panels with how the passage has been interpreted across
Jewish and Christian traditions.

**This batch is lowest priority** — the content exists and is functional,
it's just shallow compared to the richer books.

---

## Execution Order

```
Batch 0: Word Study bug fix (when error text provided)
    |
Batch 1: Scholar bios (quick, high-visibility)
    |
Batch 2: Empty panel population (largest batch, highest UX impact)
    2G -> Exodus hist "None" (cleanup + populate, 39 chapters)
    2A -> Psalms ghost buttons (13 chapters x 7 scholars)
    2B -> Matthew heb panels (27 chapters)
    2D -> Proverbs heb panels (22 chapters)
    2F -> 2 Chronicles cross-ref (26 chapters)
    2C,2E,2H -> Remaining small panel batches
    2I -> TX chapter panels (85 panels)
    |
Batch 3: People enrichment
    3B -> Dates (quick data entry)
    3C -> Refs (quick data entry)
    3A -> Bio expansion (content writing)
    3D -> Timeline entries (28 new entries)
    |
Batch 4: Parallel passages (data entry)
    |
Batch 5: Word studies (content creation)
    |
Batch 6: Thin panel enrichment (polish pass)
```

---

## Quality Standards for New Content

**Panel content must:**
- Be factually accurate and sourced from legitimate scholarship
- Provide insight the reader couldn't get from reading the text alone
- Be 150+ chars minimum per panel (enough for 2–3 substantive points)
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
