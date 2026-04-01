# Phase 24E — Content Library Enrichment Plan

> **Referenced from:** `_tools/DEEP_STUDY_FEATURES_PLAN.md` (Phase 24)
> **Goal:** Expand all 5 Content Library categories from 128 to ~270 entries across 9 batches.

---

## Current Baseline (after initial seed)

| Category | Entries | Books covered |
|----------|---------|---------------|
| Chiasms | 16 | 11 books |
| ANE Parallels | 19 | 2 books (Genesis, Exodus) |
| Echoes & Allusions | 26 | 7 books |
| Manuscript Stories | 10 | 8 books |
| Discourse | 57 | 5 books |
| **Total** | **128** | |

## Target (after all 9 batches)

| Category | Target | Books covered |
|----------|--------|---------------|
| Chiasms | ~39 | ~22 books |
| ANE Parallels | ~46 | ~12 books |
| Echoes & Allusions | ~64 | ~18 books |
| Manuscript Stories | ~22 | ~14 books |
| Discourse | ~99 | ~14 books |
| **Total** | **~270** | |

---

## COPYRIGHT GUARDRAILS — MANDATORY FOR ALL BATCHES

These rules apply to every enrichment script. Read before generating any content.

### What is NOT copyrightable (safe to use freely)

1. **Structural observations.** "Genesis 6–9 has a chiastic structure centered on 8:1a" is an analytical fact. Noting that Wenham (1978) identified this structure is attribution, not reproduction. Any scholar can independently observe the same structure.

2. **Factual parallels between texts.** "Enuma Elish opens with watery chaos; Genesis 1 opens with formless void and deep waters" is a factual comparison of two texts. The observation that these are similar is not owned by any scholar.

3. **Manuscript variant data.** Which manuscripts read what is factual data published in critical apparatuses (NA28, UBS5). "Codex Sinaiticus ends Mark at 16:8" is a fact, not copyrightable expression.

4. **Argument structure analysis.** "Paul's argument in Romans 3 moves from universal guilt to justification by faith" is an analytical observation any reader can make.

5. **Cross-reference identification.** "John 1:1 echoes Genesis 1:1" is a factual observation published in thousands of commentaries and cross-reference systems.

### What IS copyrightable (never reproduce)

1. **Scholar's specific prose.** Never copy a scholar's sentences, even with minor word changes. Write all descriptions from scratch in CS's own voice.

2. **English translations of ANE texts.** Translations in COS (Context of Scripture), ANET (Pritchard), Foster's *Before the Muses*, etc. are copyrighted works. **Never quote ANE text translations.** Instead, describe what the text says in our own words: "The Enuma Elish describes the mingling of primordial waters" — NOT a quote from any published translation.

3. **Bible translation text.** NIV, ESV, NASB prose is copyrighted. Content Library entries contain scholarly descriptions that *reference* verses by citation (e.g., "Genesis 1:1" or "vv.3–5") but must not embed full verse quotations in panel data. Short allusive phrases ("let there be light") used in analytical context are acceptable as they constitute common biblical language, but never reproduce multi-verse passages.

4. **Proprietary databases.** Don't reproduce data structures from Logos Bible Software, BibleHub's interlinear layouts, or similar commercial tools.

5. **Published chiasm diagrams.** A scholar's specific visual layout or formatting of a chiasm is copyrightable. Our data shape (pairs + center) is our own format. Describe the structural observation independently.

### Per-category rules

**Chiasms:**
- Write all pair descriptions (`top`, `bottom`) and center texts in original prose
- Name the scholar(s) who identified the structure in the `title` field only if it's a widely-attributed discovery (e.g., "Wenham's Flood Chiasm" is fine as a title convention, but prefer descriptive titles like "The Flood Narrative Chiasm")
- Use our own pair labels (A/B/C) — these are standard notation
- The chiasm's existence is a factual observation; our prose describing each element must be original

**ANE Parallels:**
- NEVER quote published translations of ANE texts (COS, ANET, Foster)
- Describe what ANE texts say in our own words: "The text describes..." not a quoted translation
- Name the ANE text, its approximate date, and its culture of origin — these are facts
- `similarity`, `difference`, and `significance` fields must be original analytical prose
- When citing a specific ANE text's content, use indirect description: "Atrahasis describes humans created from clay mixed with divine blood" — this describes content without reproducing any translator's copyrighted English rendering

**Echoes & Allusions:**
- `source_context` and `connection` fields must be original prose describing the biblical texts and their relationship
- Brief verse references (e.g., "Genesis 1:1", "John 1:1–3") are citations, not reproductions
- Short allusive phrases from well-known verses ("In the beginning", "the Lamb of God") are acceptable in analytical context as common biblical language
- Never embed multi-verse NIV/ESV quotations in the data fields
- `type` values ("direct_quote", "allusion", "echo", "typological") are our own classification system
- `significance` must be original analytical commentary

**Manuscript Stories:**
- Manuscript sigla (ℵ, B, P75, etc.) and their readings are factual data from critical apparatuses
- Never reproduce Metzger's *Textual Commentary* prose — write original narrative descriptions
- `evidence` array entries describe what each manuscript reads — this is factual reportage
- `consensus` and `significance` fields must be original prose
- The existence and nature of textual variants is public scholarly data, not owned by any publisher

**Discourse / Argument Flows:**
- Argument outlines are analytical observations — any reader can identify that Paul shifts from doctrine to application in Ephesians 4
- `step.text` descriptions must be original prose, not paraphrased from any single commentary
- Attribute rhetorical techniques (diatribe, inclusio, chiasm) as standard terms — these are not proprietary
- `step.type` values ("thesis", "evidence", "objection", "rebuttal", "conclusion", "transition") are our own classification

### Validation checklist (add to every enrichment script)

Before committing any enrichment batch:
- [ ] All descriptive prose is written from scratch (not paraphrased from a single source)
- [ ] No ANE text translations are quoted (only described in our own words)
- [ ] No multi-verse Bible quotations are embedded in data fields
- [ ] No scholar's specific sentences are reproduced
- [ ] Structural observations are attributed when a specific scholar's discovery but described in original prose
- [ ] `python3 _tools/validate.py` passes
- [ ] `python3 _tools/build_sqlite.py` succeeds
- [ ] `python3 _tools/validate_sqlite.py` passes

---

## Batch 1 — Chiasms: Psalms + OT Narrative (~15 entries)

Well-documented chiastic structures from published scholarship. All pair descriptions written from scratch.

### Psalms (8)

| Chapter | Structure | Source scholarship |
|---------|-----------|-------------------|
| Psalm 3 | Morning prayer — trust brackets lament | Auffret |
| Psalm 8 | Concentric praise — divine name frames human dignity | Craigie, Auffret |
| Psalm 30 | Thanksgiving — weeping/joy brackets the crisis | Auffret |
| Psalm 46 | God our refuge — "God is with us" refrain frames the center | Hossfeld/Zenger |
| Psalm 51 | Penitential — outer restoration brackets inner confession | Auffret, Terrien |
| Psalm 103 | Praise — "Bless the LORD" frames benefits and character | Allen |
| Psalm 110 | Royal-priestly oracle — messianic enthronement | Mitchell |
| Psalm 137 | Exile lament — memory and imprecation bracket Zion's songs | Berlin |

### OT Narrative (7)

| Chapter | Structure | Source scholarship |
|---------|-----------|-------------------|
| Esther (whole book) | Reversal structure — Haman's rise mirrors his fall | Radday, Clines |
| Job 1–2, 42 | Prose frame — divine council brackets the dialogues | Dell, Clines |
| Judges 14–16 | Samson cycle — first Philistine woman mirrors Delilah | Webb |
| 2 Samuel 11–12 | David & Bathsheba — sin brackets Nathan's parable | Bar-Efrat, Fokkelman |
| Ecclesiastes 1, 12 | Envelope — "Meaningless! Meaningless!" frames the argument | Fox |
| Deuteronomy 32 | Song of Moses — covenant faithfulness brackets accusation | Lund, Christensen |
| Zechariah 1–8 | Night visions — matched pairs around the lampstand vision | Butterworth |

---

## Batch 2 — Chiasms: NT (~8 entries)

| Chapter | Structure | Source scholarship |
|---------|-----------|-------------------|
| Philippians 2:6-11 | Christ hymn — descent/ascent with "death on a cross" at center | Lohmeyer, Martin |
| Luke 1–2 | Infancy narrative — Zechariah/Mary annunciations mirror, Magnificat/Benedictus | Talbert |
| Luke 15 | Three parables — lost sheep/coin bracket the prodigal son | Bailey |
| John 6 | Bread of life discourse — sign/discourse/crisis | Ellis, Mlakuzhyil |
| Acts 1–15 | Peter/Paul parallel — matching miracle sequences | Talbert |
| Revelation 4–5 | Throne room — worship frames the scroll/Lamb scene | Beale |
| Colossians 1:15-20 | Christ hymn — creation/reconciliation with "blood of his cross" | Lohmeyer |
| 1 John (whole epistle) | Spiral — love/truth/sin cycles with increasing intensity | Law, Brown |

---

## Batch 3 — ANE Parallels: Wisdom Literature (~15 entries)

**Copyright reminder:** Describe all ANE text content in our own words. Never quote published translations.

### Proverbs

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| 22:17–24:22 | Instruction of Amenemope (Egypt, c. 12th cent. BCE) | Thirty sections of wisdom instruction — widely accepted literary dependence, strongest ANE parallel in the entire Bible |
| 1:1–7 | Instruction of Ptahhotep (Egypt, c. 25th cent. BCE) | Father-to-son wisdom instruction genre, emphasis on hearing/obedience |
| Various | Sumerian Proverb Collections (Mesopotamia, 3rd mill. BCE) | Short, pithy observations on human nature — parallel genre and form |
| Various | Aramaic Proverbs of Ahiqar (7th cent. BCE) | Wisdom of a court sage — fables, admonitions, numerical sayings |

### Job

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Whole book | Ludlul Bel Nemeqi (Babylon, c. 12th cent. BCE) | "I Will Praise the Lord of Wisdom" — righteous sufferer, friends fail to help, deity restores |
| 3–31 | Babylonian Theodicy (c. 1000 BCE) | Acrostic dialogue: sufferer and friend debate divine justice — structural parallel to Job's dialogues |
| Whole book | Sumerian "A Man and His God" (c. 2000 BCE) | Earliest known righteous sufferer text — suffering, complaint, divine restoration |

### Ecclesiastes

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| 9:7–9 | Gilgamesh Epic, Tablet X — Siduri's advice (Babylon) | Tavern-keeper tells Gilgamesh: eat, drink, enjoy, hold your wife's hand — remarkably close thematic content in a completely different literary context |
| 1–12 | Egyptian Harper Songs (various periods) | Carpe diem theme in funeral context — "make holiday; follow your heart" tradition |

### Psalms

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Psalm 104 | Great Hymn to Aten (Egypt, c. 14th cent. BCE) | Creation order, animal provision, sun-dependence — one of the most discussed parallels in ANE studies |
| Royal Psalms (2, 72, 110) | Egyptian Enthronement Texts | Divine sonship declaration at coronation, world-rule language, divine commission |
| Lament Psalms (6, 22, 38, 88) | Mesopotamian Individual Laments (e.g., "Prayer to Every God") | Structure: address deity, describe suffering, petition, vow of praise |
| Psalm 29 | Ugaritic Baal Hymns (c. 14th cent. BCE) | Storm-god theophany, divine voice in thunder — early scholarship proposed direct literary adaptation |

### Song of Solomon

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Various | Egyptian Love Poetry — Chester Beatty Papyrus (c. 13th cent. BCE) | "Brother/sister" address, garden imagery, lovesickness, seeking in the streets at night |
| Various | Sumerian Sacred Marriage Poetry (3rd mill. BCE) | Inanna/Dumuzi love poetry — royal bridegroom, garden setting, physical descriptions |

---

## Batch 4 — ANE Parallels: Law, Prophecy, Daniel (~12 entries)

**Copyright reminder:** Describe all law code content in our own words. Never quote published translations from COS/ANET.

### Law

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Exodus 21–23 | Code of Hammurabi (Babylon, c. 1754 BCE) | Case law format ("if a man..."), bodily injury compensations, slave laws, property damage — but different underlying theology of justice |
| Exodus 21–23 | Laws of Eshnunna (Babylon, c. 1930 BCE) | Predates Hammurabi; bride-price laws, goring-ox law closely parallels Exodus 21:28–32 |
| Deuteronomy 12–26 | Hittite Laws (Anatolia, c. 16th cent. BCE) | Land-based legislation, asylum cities, treatment of slaves, levirate marriage |
| Leviticus 17–26 | Middle Assyrian Laws (c. 12th cent. BCE) | Sexual offense laws, purity regulations, female property rights — compare and contrast with Holiness Code |

### Prophecy

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Prophetic genre | Mari Prophecy Texts (c. 18th cent. BCE) | Earliest known prophetic oracles: unsolicited divine messages through ecstatics to the king |
| Prophetic genre | Neo-Assyrian Prophecy Collections (7th cent. BCE) | Oracles collected and archived — parallel to how Israelite prophecy was compiled into books |
| Oracles against nations | Egyptian Execration Texts (c. 19th cent. BCE) | Curses on enemy nations inscribed on pottery — structural parallel to prophetic judgment oracles |
| Numbers 22–24 | Deir Alla Inscription — Balaam (c. 840 BCE) | Non-Israelite inscription mentioning "Balaam son of Beor" — extrabiblical attestation of a biblical figure |

### Daniel

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Daniel 5 | Nabonidus Chronicle (Babylon, 6th cent. BCE) | Records Babylon's fall to Cyrus — corroborates Daniel 5's fall-of-Babylon narrative; clarifies Belshazzar's historical role |
| Daniel 4 | Prayer of Nabonidus (Dead Sea Scrolls, 4Q242) | Qumran text describing a Babylonian king struck with disease for seven years — possible parallel tradition to Nebuchadnezzar's madness |
| Daniel 1–6 | Babylonian Court Tale genre | Contest/test narratives at foreign courts — parallel structure in Esther, Joseph narrative, Ahiqar |

### Joshua/Judges

| Section | ANE Text | Key parallel |
|---------|----------|-------------|
| Joshua 1–12 | Egyptian Campaign Records — Thutmose III, Ramesses II | Conquest narrative conventions: divine commission, march-to-battle, city-by-city accounts, summary lists |
| Judges 3, 2 Kings 3 | Mesha Stele / Moabite Stone (c. 840 BCE) | Moabite king describes defeating Israel with Chemosh's help — mirror-image of Israelite war narratives told from the opposing side |

---

## Batch 5 — Echoes & Allusions: Isaiah Servant Songs + Passion (~20 entries)

Highest-impact single batch. Isaiah 53 is the most-quoted OT chapter in the NT.

**Copyright reminder:** Reference verses by citation only. Describe connections in original analytical prose. Short well-known phrases ("man of sorrows," "the Lamb of God") used in analytical context are common biblical language.

### Isaiah 53 thread

| Source | Target | Type |
|--------|--------|------|
| Isaiah 53:4 | Matthew 8:17 | direct_quote — Matthew applies the Servant's bearing of infirmities to Jesus' healing ministry |
| Isaiah 53:10–12 | Mark 10:45 | allusion — "ransom for many" echoes the Servant who bore the sin of many |
| Isaiah 53:12 | Luke 22:37 | direct_quote — Jesus quotes the Servant's numbering with transgressors at the Last Supper |
| Isaiah 53:7–8 | Acts 8:32–35 | direct_quote — the Ethiopian eunuch reads the Servant Song; Philip identifies the Servant as Jesus |
| Isaiah 53:5–6 | Romans 4:25 | allusion — "delivered over for our trespasses" echoes the Servant's substitutionary suffering |
| Isaiah 53:1 | Romans 10:16 | direct_quote — Isaiah's question about belief applied to Israel's response to the gospel |
| Isaiah 52:13–53:12 | Philippians 2:7–8 | echo — the Christ hymn's descent pattern mirrors the Servant's trajectory |
| Isaiah 53:5–6, 9 | 1 Peter 2:22–25 | direct_quote — Peter draws extensively on the Servant Song for his theology of suffering |

### Isaiah 40–55 broader

| Source | Target | Type |
|--------|--------|------|
| Isaiah 40:3 | Mark 1:2–3 | direct_quote — the wilderness voice applied to John the Baptist |
| Isaiah 42:1–4 | Matthew 12:18–21 | direct_quote — longest OT quotation in Matthew, identifies Jesus as the gentle Servant |
| Isaiah 49:6 | Acts 13:47 | direct_quote — Paul applies the Servant's light-to-the-Gentiles mission to his own apostolate |
| Isaiah 52:7 | Romans 10:15 | direct_quote — beautiful feet of gospel messengers |
| Isaiah 61:1–2 | Luke 4:18–19 | direct_quote — Jesus reads this in Nazareth and declares it fulfilled |
| Isaiah 6:9–10 | Acts 28:26–27 | direct_quote — Paul's final word to Roman Jews echoes Isaiah's hardening commission |

### Passion Psalms

| Source | Target | Type |
|--------|--------|------|
| Psalm 69:9 | John 2:17 | direct_quote — zeal for God's house applied to temple cleansing |
| Psalm 69:21 | Matthew 27:34, 48 | allusion — vinegar/gall offered at crucifixion echoes the psalmist's lament |
| Psalm 118:22–23 | Mark 12:10–11 / Acts 4:11 / 1 Peter 2:7 | direct_quote — the rejected stone applied to Christ by Jesus, Peter, and Paul |
| Psalm 110:1 | Mark 12:36 / Acts 2:34–35 / Hebrews 1:13 | direct_quote — most-quoted OT verse in the NT; right-hand session as proof of exaltation |

---

## Batch 6 — Echoes & Allusions: Exodus Typology + Luke-Acts (~18 entries)

**Copyright reminder:** Same rules as Batch 5.

### Exodus typology

| Source | Target | Type |
|--------|--------|------|
| Exodus 12 (Passover) | Luke 22:15–20 / 1 Corinthians 5:7 | typological — Last Supper as new Passover; Christ as Passover lamb |
| Exodus 14 (Red Sea) | 1 Corinthians 10:1–4 | typological — Israel's sea crossing as baptism prototype |
| Exodus 16 (Manna) | John 6:31–35 | typological — wilderness bread → bread of life |
| Exodus 25–40 (Tabernacle) | John 1:14 | echo — the Word tabernacled (eskēnōsen) among us — divine dwelling takes human form |
| Exodus 17:6 (Rock) | 1 Corinthians 10:4 | typological — Paul identifies the wilderness rock as Christ |
| Exodus 34:29–35 (Moses' veil) | 2 Corinthians 3:7–18 | typological — veil over Moses' face → veil over Israel's heart, removed in Christ |

### Luke-Acts OT echoes

| Source | Target | Type |
|--------|--------|------|
| 1 Samuel 2:1–10 (Hannah's prayer) | Luke 1:46–55 (Magnificat) | echo — Mary's song mirrors Hannah's reversal-of-fortunes theology |
| 1 Kings 17 (Elijah at Zarephath) | Luke 4:25–26 | allusion — Jesus cites Elijah's Gentile-widow ministry to explain his own mission |
| 2 Kings 5 (Naaman) | Luke 4:27 | allusion — Jesus cites Elisha healing a Gentile leper; Nazareth rejects him for it |
| Genesis 12:3 / 22:18 (Abraham promise) | Acts 3:25 | direct_quote — Peter quotes the Abrahamic blessing promise |
| 2 Samuel 7:12–13 (Davidic covenant) | Acts 2:30–31 | allusion — Peter argues David foresaw the Messiah's resurrection |
| Joel 2:28–32 | Acts 2:17–21 | direct_quote — Peter quotes Joel at Pentecost: Spirit poured out on all people |
| Amos 9:11–12 | Acts 15:16–17 | direct_quote — James quotes Amos at the Jerusalem Council to justify Gentile inclusion |
| Deuteronomy 18:15, 18 | Acts 3:22, 7:37 | direct_quote — the prophet-like-Moses promise applied to Jesus |
| Isaiah 55:3 / Psalm 16:10 | Acts 13:34–35 | direct_quote — Paul in Pisidian Antioch uses non-decay promise to prove resurrection |
| Habakkuk 1:5 | Acts 13:41 | direct_quote — Paul warns the synagogue with Habakkuk's unbelievable-work oracle |
| Isaiah 49:6 | Acts 13:47 | direct_quote — Paul applies Servant Song to his own Gentile outreach |
| Psalm 2:1–2 | Acts 4:25–26 | direct_quote — the early church quotes the royal psalm to interpret the crucifixion |

---

## Batch 7 — Manuscript Stories Expansion (~12 entries)

**Copyright reminder:** Variant data is factual (from critical apparatuses). Write original narrative descriptions. Never reproduce Metzger's *Textual Commentary* prose.

| Book/Chapter | Variant | Scholarly consensus |
|-------------|---------|-------------------|
| Mark 1:1 | "Son of God" — present in most MSS (ℵ¹, B, D, W), absent in ℵ*, Θ, some Old Latin | Divided; slightly favors inclusion but shorter reading may be original |
| Luke 22:43–44 | Jesus' agony — angel strengthening him, sweat like drops of blood | Absent in P75, ℵ*, A, B, W; present in ℵ², D, L. Likely not original but very early tradition |
| Luke 23:34 | "Father, forgive them, for they do not know what they are doing" | Absent in P75, ℵ*, B, D*, W. Possibly removed because it seemed to conflict with judgment on Jerusalem |
| John 5:3b–4 | Angel stirring the water — whoever stepped in first was healed | Absent in P66, P75, ℵ, B, C*, D. Late explanatory addition |
| Romans 5:1 | "we have (echomen) peace" vs. "let us have (echōmen) peace" — single letter difference | One of the most debated single-letter variants; external evidence favors indicative |
| Romans 16:25–27 | Doxology placement — after 14:23, after 15:33, after 16:23, or absent | Varies by tradition; likely original to Romans but position shifted as letter circulated |
| 1 Timothy 3:16 | "God (theos) was manifested" vs. "who (hos) was manifested" in the flesh | Later MSS read "God" (Byzantine); earlier MSS read "who" (ℵ*, A*, C*, F, G). "Who" almost certainly original |
| Hebrews 2:9 | "by the grace (chariti) of God" vs. "apart from (chōris) God" he tasted death | Grace reading dominant; "apart from God" is difficult but possibly original |
| Revelation 13:18 | 666 vs. 616 — the number of the beast | P115 (earliest papyrus) reads 616; Irenaeus knew of 616 but argued for 666 |
| Matthew 17:21 | "This kind does not go out except by prayer and fasting" | Absent in ℵ, B, Θ. Probably assimilated from Mark 9:29 |
| Matthew 18:11 | "For the Son of Man came to save the lost" | Absent in ℵ, B, L, f1. Assimilated from Luke 19:10 |
| Acts 8:37 | Philip's baptismal confession — "I believe that Jesus Christ is the Son of God" | Absent in P45, P74, ℵ, A, B, C. Western text addition reflecting early baptismal liturgy |

---

## Batch 8 — Discourse Expansion: 4 Epistles (~26 entries)

**Copyright reminder:** Argument outlines are analytical observations. Write all step descriptions from scratch.

### 2 Corinthians (13 chapters)
Paul's most emotionally complex letter. Argument moves from apostolic suffering → reconciliation ministry → collection appeal → defense of authority. Potential "letter compilation" seams at 2:14 and chapters 10–13.

### Philippians (4 chapters)
Joy in suffering. Christ hymn (2:6–11) is the theological hinge: descent/ascent pattern models the humility Paul calls for. Tight unity of indicative (what Christ did) and imperative (how to live).

### Colossians (4 chapters)
Christ's cosmic supremacy → ethical implications. Parallels Ephesians in structure (doctrinal → practical) but with distinct anti-syncretism polemic.

### 1 Peter (5 chapters)
Identity → ethics under persecution. "Elect exiles" as controlling metaphor. Household code embedded in theology of suffering. 2:4–10 is the theological center.

---

## Batch 9 — Discourse Expansion: Remaining Epistles (~17 entries)

### 1 Thessalonians (5 chapters)
Paul's earliest letter. Thanksgiving → defense of conduct → ethical instruction → eschatology. The Parousia passages (4:13–5:11) are the theological climax.

### James (5 chapters)
Not a traditional epistle argument but a sermonic flow: trials/wisdom → rich/poor → faith/works → speech → patience. 2:14–26 (faith without works) as the interpretive crux.

### 1 John (5 chapters)
Spiral/cyclical argument — love, sin, and belief cycle with increasing intensity. No linear outline works perfectly; the spiral is itself a distinctive feature.

### Titus (3 chapters)
Compact pastoral letter. Elder qualifications → sound doctrine vs. false teachers → grace-driven ethics. The "faithful sayings" structure provides anchor points.

---

## Enrichment Execution Order

```
Batch 1  Chiasms: Psalms + OT Narrative       — ~15 entries, Session R1
Batch 2  Chiasms: NT                           — ~8 entries,  Session R1
Batch 3  ANE Parallels: Wisdom Literature      — ~15 entries, Session R2
Batch 4  ANE Parallels: Law, Prophecy, Daniel  — ~12 entries, Session R2
Batch 5  Echoes: Isaiah Servant Songs + Passion — ~20 entries, Session R3
Batch 6  Echoes: Exodus Typology + Luke-Acts   — ~18 entries, Session R3
Batch 7  Manuscript Stories Expansion           — ~12 entries, Session R4
Batch 8  Discourse: 4 Epistles                  — ~26 entries, Session R4
Batch 9  Discourse: Remaining Epistles          — ~17 entries, Session R5
```

**~5 enrichment sessions total (R1–R5), each producing ~25–40 entries.**

Each session follows the standard enrichment script pattern:
1. Write generator to `/tmp/gen_*.py`
2. Syntax-check with `python3 -c "compile(...)"`
3. Run script
4. `python3 _tools/validate.py`
5. `python3 _tools/build_sqlite.py`
6. `python3 _tools/validate_sqlite.py`
7. `rm /tmp/gen_*.py`
8. `git add -A && commit && push`

## Commit Convention

```
feat(content): Phase 24E Batch 1 — 15 chiasms (Psalms + OT narrative)
feat(content): Phase 24E Batch 2 — 8 chiasms (NT)
feat(content): Phase 24E Batch 3 — 15 ANE parallels (wisdom literature)
feat(content): Phase 24E Batch 4 — 12 ANE parallels (law, prophecy, Daniel)
feat(content): Phase 24E Batch 5 — 20 echoes (Isaiah Servant Songs + Passion)
feat(content): Phase 24E Batch 6 — 18 echoes (Exodus typology + Luke-Acts)
feat(content): Phase 24E Batch 7 — 12 manuscript stories
feat(content): Phase 24E Batch 8 — 26 discourse panels (2 Cor, Phil, Col, 1 Pet)
feat(content): Phase 24E Batch 9 — 17 discourse panels (1 Thess, James, 1 John, Titus)
```
