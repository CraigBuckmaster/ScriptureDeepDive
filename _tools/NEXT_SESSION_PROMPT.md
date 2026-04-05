# Next Session: Debate Enrichment Batch 4 — Genesis (29 topics)

**Issue:** #309
**Kanban status:** Ready → move to In Progress when starting

## What to do

Enrich 29 unenriched Genesis debate topics in `content/meta/debate-topics.json`.

### Enrichment spec per topic

Each unenriched topic has skeleton data (id, title, category, book_id, chapters, passage, question, positions with argument only). Fill in:

1. **`context`** — 3–5 sentence scholarly framing paragraph. Set the historical, literary, and theological stage. Mention key scholars by name where relevant.
2. **`positions[].strengths`** — 2–3 sentences on what this position handles well.
3. **`positions[].weaknesses`** — 2–3 sentences on what this position struggles with.
4. **`positions[].key_verses`** — 3–6 verse references (e.g. "Genesis 2:4") that this position relies on.
5. **`positions[].scholar_ids`** — Match to scholars in `content/meta/scholars.json`. Use IDs like `wenham`, `waltke`, `sailhamer`, `hamilton`, `sarna`, `alter`, `macarthur`, `calvin`, `brueggemann`, etc. Only attribute if the scholar actually holds this position in their published work.
6. **`synthesis`** — 3–5 sentence fair summary. State where scholarly consensus leans (if any), what the key differentiator is between positions, and what remains genuinely open.
7. **`related_passages`** — 3–8 cross-references (e.g. "Exodus 20:11", "Psalm 90:4").
8. **`tags`** — 3–6 lowercase hyphenated tags (e.g. "creation", "hermeneutics", "patriarchs").

### Quality rules

- **Scholar attribution must be accurate.** Only assign a scholar_id if that scholar demonstrably holds this position in published work.
- **Balance positions.** No position should read as obviously "correct" — present each charitably.
- **No fabricated quotes.** Paraphrase scholarly positions; never invent direct quotations.
- **Maintain existing data.** Don't overwrite existing `id`, `title`, `category`, `book_id`, `chapters`, `passage`, `question`, or position `id`/`label`/`tradition_family`/`proponents`/`argument` fields. Only ADD to empty fields.

### Execution pattern

Write a Python script to `/tmp/gen_debate_batch4.py` that:
1. Loads `content/meta/debate-topics.json`
2. For each of the 29 Genesis topic IDs listed below, enriches the empty fields
3. Writes back to the same file with `json.dump(data, f, indent=2, ensure_ascii=False)`
4. Prints a summary of what was enriched

### Topic IDs to enrich (29)

```
two-creation-accounts-complementary-or-contradictory
lamech-s-song-4-23-24-escalating-violence-and-the-sevenfold-
the-flood-s-relationship-to-de-creation-and-new-creation
lot-righteous-or-compromised
the-400-years-of-oppression-15-13-chronology
hagar-and-ishmael-the-status-of-the-rejected-line
abraham-s-intercession-bargaining-with-god
hagar-s-expulsion-moral-problem-or-providential-design
hittites-in-canaan-historical-problem
the-servant-s-prayer-model-for-providential-guidance
isaac-character-or-cipher
jacob-s-vow-28-20-22-conditional-faith-or-genuine-commitment
jacob-s-marriages-polygamy-and-the-ot-narrative
the-mandrakes-fertility-superstition-and-providence
mizpah-covenant-31-44-55-boundary-or-blessing
is-the-jacob-esau-reconciliation-genuine
simeon-and-levi-s-vengeance-disproportionate-or-just
rachel-s-death-and-tomb-historical-memory
the-edomite-king-list-pre-dynastic-or-contemporaneous-record
tamar-s-method-justified-deception-or-sin
potiphar-s-wife-ancient-near-eastern-parallels
joseph-and-daniel-parallel-narratives
joseph-s-rise-historical-plausibility
the-egyptian-separation-at-table-43-32-historical-accuracy
judah-s-speech-44-18-34-rhetoric-and-transformation
joseph-s-forgiveness-does-he-explicitly-forgive
god-s-appearance-at-beersheba-the-last-patriarchal-theophany
joseph-s-famine-policy-economic-wisdom-or-oppression
the-double-tribe-status-of-joseph-legal-and-theological-sign
```

### After completion

1. Run `python3 _tools/build_sqlite.py`
2. Run `python3 _tools/validate.py` and `python3 _tools/validate_sqlite.py`
3. `rm /tmp/gen_debate_batch4.py`
4. `git add -A && git commit -m "content(debates): Enrich batch 4 — Genesis (29 topics)" && git push`
5. Close issue #309 via API
6. Move #309 to Done on kanban, move #310 to Ready
7. **Regenerate this file** with the Batch 5 (Exodus) prompt — same structure, swap topic IDs and issue numbers

### Batch sequence

| Batch | Issue | Book(s) | Topics | Status |
|-------|-------|---------|--------|--------|
| 4 | #309 | Genesis | 29 | **THIS SESSION** |
| 5 | #310 | Exodus | 34 | Backlog |
| 6 | #311 | Leviticus + Deuteronomy | 30 | Backlog |
| 7 | #312 | Numbers + Joshua | 39 | Backlog |
| 8 | #313 | Proverbs + Ruth/Ezra/Nehemiah | 40 | Backlog |

**Total remaining after batches 1–3:** 172 topics across 5 sessions.
