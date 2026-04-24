# Content Coverage Audit — Planning Document v3 (FINAL)

**Status:** Approved plan. Next action is Tier A issue spec authoring.
**Date:** 2026-04-24
**Supersedes:** v1 (morning), v2 (afternoon)
**Change log v2→v3:** All open decisions from §7 resolved. Parable gating locked as tradition-based with `is_default` flag. Phase 3 embeddings via existing `build_embeddings.py`. Audit artifacts split — regenerable JSON gitignored at `_audit/`, committed plan reports at `docs/audit/`. Scholar pacing: all 6 parable scholars land before any parable content authoring. Label taxonomy confirmed.

---

## 0. Summary

One umbrella epic. Three phases. One shared Python tool.

```
Umbrella Epic: Content Coverage Audit
├── Phase 1 — Coverage & Quality Floor (integrated three-layer audit)
│     L1. Section coverage tiers
│     L2. Panel content quality (empty / stub / placeholder / template)
│     L3. Chapter-panel completeness (per genre rubric)
├── Phase 2 — Parables
└── Phase 3 — Concept Mapping
```

---

## 1. Shared Tool: `_tools/coverage_auditor.py`

### 1.1 Invocation

```
python _tools/coverage_auditor.py --all
python _tools/coverage_auditor.py --sections          # L1 only
python _tools/coverage_auditor.py --panel-quality     # L2 only
python _tools/coverage_auditor.py --chapter-panels    # L3 only
python _tools/coverage_auditor.py --book genesis --section-detail
python _tools/coverage_auditor.py --template-candidates   # surface suspected templates for review
python _tools/coverage_auditor.py --format=json|markdown|issues
python _tools/coverage_auditor.py --all --ci          # block on new 🔴, regressions
```

### 1.2 Architecture

Reuse (no duplication) from `quality_scorer.py`:
- `_load_scholar_keys()` — commentary key set (includes `id` + `panel_key` for the 5 that differ: `macarthur/mac`, `netbible/net`, `catena/cat`, `marcus/mar`, `rhoads/rho`)
- `extract_panel_text()` — panel char-count extraction
- `PLACEHOLDER_PATTERNS` + `get_density_score()` — generic stub detection

Pre-work: extract shared helpers to `_tools/panel_taxonomy.py` (small refactor PR, behavior-preserving).

### 1.3 Panel Taxonomy

```python
# _tools/panel_taxonomy.py
LINGUISTIC_PANELS = {"heb", "hebtext"}
HISTORICAL_PANELS = {"hist", "ctx"}
CONNECTIVE_PANELS = {"cross", "thread", "debate", "themes", "tl", "poi", "places"}
# Commentary keys derived dynamically from scholars.json

CHAPTER_PANEL_TYPES = {
    "ppl", "trans", "src", "rec", "lit", "hebtext",
    "thread", "tx", "debate", "themes", "discourse"
}
```

### 1.4 Section Tier Rubric (L1)

**A panel must pass L2 substantive check to count toward tier thresholds.** Empty/stub/placeholder/template panels do not count, even if keys exist in JSON.

Per section:
- `panel_weight` = count of substantive section panels, commentary collapsed to 1
- `categories_hit` = count of {linguistic, historical, connective, commentary} with ≥1 substantive panel
- `commentator_count` = distinct scholar keys with substantive content
- +0.5 to `panel_weight` for each substantive chapter-panel category

| Tier | Conditions (all must hold) |
|---|---|
| 🔴 **Deficient** | `panel_weight < 3` OR `categories_hit < 2` OR `commentator_count < 2` |
| 🟡 **Thin** | `panel_weight == 3` AND `categories_hit == 2` AND `commentator_count == 2` |
| 🟢 **Adequate** | `panel_weight >= 4` AND `categories_hit >= 3` AND `commentator_count >= 2` |
| ✨ **Rich** | `panel_weight >= 6` AND `categories_hit == 4` AND `commentator_count >= 3` |

🟡 and 🔴 both remediated in the same Tier C pass (§2.4).

### 1.5 Panel Content Quality (L2)

Per-panel verdict: `substantive | empty | stub | placeholder | template`.

Detection stack (type-specific patterns + generic placeholder regex, both active):

1. **empty** — `null`, `{}`, `[]`, `""`, or no non-whitespace content
2. **stub (generic)** — total char count below type-specific threshold (derived from `quality_scorer.DENSITY_TIERS` scaled by `PANEL_THRESHOLD_MULTIPLIERS`; `heb`/`cross` get lower floors, `debate`/`thread` get higher)
3. **placeholder (generic)** — matches any `quality_scorer.PLACEHOLDER_PATTERNS` entry (TODO, Lorem, ellipses, "This passage is significant because", etc.)
4. **template (type-specific)** — matches a known template pattern for its type, stored in `panel_taxonomy.TEMPLATE_PATTERNS`:

   ```python
   TEMPLATE_PATTERNS = {
     "debate": [
       ("Critical/Analytical scholarship", "Traditional/Confessional reading", "Emphasises historical-critical"),
     ],
     # Other types populated by Tier A3 curation pass after --template-candidates scan
   }
   ```

   Patterns curated, hand-verified, then committed. `--template-candidates` surfaces suspicious panels for review; patterns iterate as new templates are discovered.

Any verdict other than `substantive` → emits finding `panel_{empty|stub|placeholder|template}`, panel doesn't count toward L1 tier.

### 1.6 Chapter-Panel Completeness (L3)

**Evidence-based genre rubric.** A panel is "expected" for a genre if it's present in ≥60% of that genre's existing chapters — this captures what authors already treat as natural per the "don't force, but if it fits include it" rule.

```python
# _tools/panel_taxonomy.py
GENRE_EXPECTED_PANELS = {
    "theological_narrative": {"ppl", "trans", "src", "rec", "lit", "hebtext", "thread", "tx", "themes"},
    "law":                   {"ppl", "src", "rec", "lit", "hebtext", "thread", "tx", "debate", "themes"},
    "history":               {"ppl", "trans", "lit", "thread", "themes"},
    "wisdom":                {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "poetry":                {"ppl", "trans", "rec", "lit", "hebtext", "themes"},
    "love_poetry":           {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "lament":                {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "prophecy":              {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "apocalyptic":           {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "gospel":                {"ppl", "trans", "src", "rec", "lit", "hebtext", "tx", "debate", "themes"},
    "epistle":               {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes", "discourse"},
}
```

Per chapter, L3 emits:
- `chapter_panel_missing` — expected type absent from JSON
- `chapter_panel_empty/stub/placeholder/template` — present but L2 says not substantive

### 1.7 Output Artifacts

**Regenerable snapshots (gitignored at `_audit/`):**
- `_audit/latest.json` — machine-readable findings
- `_audit/latest.md` — narrative report
- `_audit/issues/{book_id}.md` — per-book draft issue bodies
- `_audit/baseline.json` — CI baseline snapshot (grandfathers pre-existing findings)

**Committed plan reports (`docs/audit/`):**
- `docs/audit/YYYY-MM-DD-coverage-audit.md` — dated snapshots of the compiled plan that feed story creation. Living historical record; small text files only.

`.gitignore` additions: `_audit/`

### 1.8 Output JSON Shape

```json
{
  "generated_at": "2026-04-24T...",
  "rubric_version": "3.0",
  "summary": {
    "sections": {"total": 2784, "deficient": 0, "thin": 0, "adequate": 0, "rich": 0},
    "panel_quality": {"total_panels": 0, "substantive": 0, "empty": 0, "stub": 0, "placeholder": 0, "template": 0},
    "chapter_panels": {"total_expected": 0, "present_substantive": 0, "missing": 0, "deficient": 0}
  },
  "books": [{
    "book_id": "2_corinthians",
    "genre": "epistle",
    "sections_by_tier": {"deficient": 0, "thin": 0, "adequate": 0, "rich": 0},
    "chapters": [{
      "chapter_num": 9,
      "section_findings": [...],
      "chapter_panel_findings": [
        {"type": "chapter_panel_template", "panel": "debate",
         "note": "Matches generic 'Critical/Analytical + Traditional/Confessional' template"}
      ]
    }]
  }]
}
```

### 1.9 CI Integration (deferred to Tier D)

After Phase 1 remediation backlog drops below threshold:
- `--ci` blocks new 🔴, new panel-quality regressions, new chapter-panel regressions
- `_audit/baseline.json` grandfathers pre-existing findings — only regressions block
- Wired into `content-pipeline.yml`

---

## 2. Phase 1 — Coverage & Quality Floor

### 2.1 Preliminary Findings (investigation-derived, pre-tool)

**L1:**
- 2,784 sections across 66 books
- 10 guaranteed-🔴 sections already identified, 3 in John (1, 3, 8 — section 4 each)
- Real 🔴 count after tool runs — expected 150–300+ once template/stub panels stop counting

**L2:**
- **173 chapters** with templated `debate` panels (Critical/Analytical + Traditional/Confessional boilerplate; 2 Cor 9 exemplar)
- Additional template patterns in other panel types surfaced by Tier A3 curation
- Handful of stub panels (e.g., Genesis 10/11/12 `themes` = 26 chars each)

**L3 gaps against genre rubric:**

| Panel | Genre | Gap (chapters) |
|---|---|---|
| `debate` | epistle | ~63 missing + 173 templates |
| `debate` | theological_narrative | ~157 missing |
| `src` | theological_narrative | ~64 missing |
| `trans` | theological_narrative | ~41 missing |
| `rec` | history | ~65 missing |

Corrected from v1: `discourse` is epistle-only (83% present there, ~0% elsewhere) — not a general gap.

### 2.2 Phase 1 Child Issues

**Tier A — Tool & Infrastructure (4 issues):**

1. `[Phase 1] [chore] Extract panel_taxonomy.py from quality_scorer.py` — refactor, behavior-preserving
2. `[Phase 1] [feat] Build coverage_auditor.py (all three audit levels)`
3. `[Phase 1] [chore] Template pattern curation pass` — runs `--template-candidates`, reviews clusters, commits `TEMPLATE_PATTERNS`
4. `[Phase 1] [chore] Generate initial audit + produce first docs/audit report`

**Decision gate after Tier A4:** Craig reviews the dated `docs/audit/YYYY-MM-DD-coverage-audit.md`. Signs off on Tier B/C structure before bulk creation.

**Tier B — Per-Book Enrichment Epics** (one per book with any L1/L2/L3 finding; books with none → no epic):

- Title: `[Phase 1] [Epic] {Book} — Content Coverage Enrichment`
- Links umbrella epic + Phase 1 sub-epic
- Description references the relevant section of `docs/audit/YYYY-MM-DD-coverage-audit.md`

**Tier C — Enrichment Issues within each book epic:**

- Title: `[Phase 1] {Book} Ch X–Y — Coverage Enrichment`
- Grouped by chapter-range, sized by finding density (~15–25 findings per issue = ~1–2 days Claude Code work)
- Each issue covers all three audit layers for its chapter range (one pass per chapter)
- Books with 1–5 findings → single issue
- Books with 6–25 → 1–2 issues
- Books with 25+ → 3–5 issues

**Tier D — CI Integration (1 issue, last):**

5. `[Phase 1] [ci] Add --ci gate to content-pipeline.yml with baseline snapshot`

### 2.3 Tier C Issue Template

```markdown
**Goal:** Bring {Book} Chapters X–Y to full coverage (L1 sections + L2 panel quality + L3 chapter-panel completeness).

**Level 1 — Sections to enrich:**
- [ ] Gen 22:1 (🔴 — commentary-only; add `hist` + `cross`)
- [ ] Gen 22:5 (🟡 — 2 commentators, need +1; suggested: Alter)

**Level 2 — Panels to rewrite:**
- [ ] Gen 22 chapter `debate` panel (template boilerplate; rewrite with named scholars)
- [ ] Gen 24 section 3 `heb` panel (stub, 47 chars)

**Level 3 — Chapter panels to author:**
- [ ] Gen 23 `src` panel (missing; theological_narrative expects this)

**Acceptance criteria:**
- [ ] `coverage_auditor --book genesis --section-detail` shows zero findings for chapters X–Y
- [ ] `quality_scorer` ≥ 90 for affected chapters
- [ ] No new placeholder/stub/template content
- [ ] NIV verse text unchanged

**Out of scope:**
- Sections already 🟢
- Panels already substantive
- Chapter panels not in the genre's expected set
- Section header changes (Phase 3)
```

### 2.4 🟡 + 🔴 Same-Pass Confirmation

All sections failing L1 Adequate (🟡 Thin and 🔴 Deficient) are remediated together in the same Tier C pass. Integrated chapter-range issues already open the file; fixing both tiers at once eliminates rework.

---

## 3. Phase 2 — Parables

### 3.1 Scholar Prerequisites (all 6 before any content authoring)

**Confirmed:** all parable scholars land first. Prevents invented scope. Phase 2 content does not start until all 6 registry entries are complete and verified.

| Scholar | Tradition | Priority |
|---|---|---|
| Klyne Snodgrass | Evangelical · Contemporary | P0 |
| Arland Hultgren | Lutheran · Mainline | P0 |
| Kenneth Bailey | Evangelical · Middle Eastern | P0 |
| Joachim Jeremias | Critical · Mid-20th C | P1 |
| Craig Blomberg | Evangelical · Contemporary | P1 |
| Darrell Bock | Evangelical · Dallas Seminary | P2 |

Each scholar add = one issue: `scholars.json` + `scholar-bios.json` + `SCHOLAR_REGISTRY` + `COMMENTATOR_SCOPE` + bio image on R2.

### 3.2 Schema (additive)

```sql
CREATE TABLE parables (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  primary_ref TEXT NOT NULL,
  primary_book TEXT NOT NULL,
  primary_chapter INTEGER NOT NULL,
  primary_verse_start INTEGER NOT NULL,
  primary_verse_end INTEGER NOT NULL,
  parallel_refs_json TEXT DEFAULT '[]',
  category TEXT NOT NULL,        -- kingdom | judgment | grace | wisdom | prayer | discipleship
  complexity TEXT NOT NULL,      -- simple_simile | example_story | allegorical
  audience TEXT,                 -- disciples | crowds | opponents | mixed
  historical_context TEXT NOT NULL,
  interpretive_crux TEXT
);

CREATE TABLE parable_interpretations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parable_id TEXT NOT NULL REFERENCES parables(id),
  tradition TEXT NOT NULL,
  scholar_id TEXT NOT NULL REFERENCES scholars(id),
  interpretation TEXT NOT NULL,
  key_move TEXT,
  source TEXT,
  is_default INTEGER NOT NULL DEFAULT 0   -- 0|1; exactly one =1 per parable_id
);

CREATE INDEX idx_parables_primary_ref ON parables(primary_book, primary_chapter);
CREATE INDEX idx_parable_interps_parable ON parable_interpretations(parable_id);
CREATE INDEX idx_parable_interps_tradition ON parable_interpretations(tradition);
CREATE INDEX idx_parable_interps_default ON parable_interpretations(parable_id, is_default);
```

Loader (in `build_sqlite_loaders.py`) enforces "exactly one `is_default=1` per `parable_id`" at build time. Build fails if violated.

Source files:
- `content/meta/parables.json`
- `content/meta/parable-interpretations.json`

### 3.3 Parable Panel Type

New section panel `parable`, rendered on originating section only. Synoptic parallel sections get `cross` entries pointing back.

```json
{
  "parable_id": "good_samaritan",
  "title": "The Good Samaritan",
  "summary": "Jesus redefines 'neighbor'...",
  "audience": "A lawyer testing Jesus; crowd present",
  "structure": "Setup → Ignored by priest → Ignored by Levite → Samaritan acts → Jesus's inversion of the question",
  "interpretive_crux": "Who is the 'neighbor'?"
}
```

Interpretations live in the dedicated table — not duplicated in the panel JSON. App pulls them via SQLite.

### 3.4 Canonical Parable List

Locked before content: Snodgrass-primary (~35 parables), cross-checked against Hultgren and Blomberg. Frozen in a Phase 2 infrastructure issue.

**Scope:** Jesus's parables only. OT parabolic teachings (Nathan/David, Isaiah's vineyard, Jotham) deferred to future Phase 2b — not mixed in here.

### 3.5 Quality Floor Per Parable

- `parable` panel on originating section
- ≥3 interpretations spanning ≥2 traditions
- Exactly one interpretation with `is_default=1`
- `hist` or `ctx` panel on originating section
- Cross-refs to synoptic parallels where applicable
- `debate_topic` entry when interpretations genuinely diverge

### 3.6 Premium Gating (tradition-based, locked)

**Free users see:**
- Full `parable` panel (summary, audience, structure, crux)
- The one `is_default=1` interpretation (the majority/consensus reading, or the most pedagogically valuable when that differs — Bailey's Middle-Eastern reading for Prodigal Son, for example)
- All synoptic cross-refs *(not gated)*
- Linked debate topic *(not gated)*

**Premium users see:**
- All interpretations across traditions (the multi-tradition conversation)
- The `key_move` field for each scholar's distinctive exegetical contribution

Editorial guidance for choosing `is_default` gets added to `_tools/DEV_GUIDE.md`: usually majority reading in conservative Protestant scholarship; deviate only when a different tradition's reading is meaningfully more pedagogically powerful.

Implementation: `usePremium()` gate on the interpretations list below the default; `UpgradePrompt` with `FEATURE_DESCRIPTIONS.parable_interpretations`.

### 3.7 App-Side Work

- `ParablePanel.tsx` — new renderer
- `ParableInterpretationsModal.tsx` — shows default first; others gated
- `app/src/db/queries/parables.ts` — DB helpers
- Parable detail screen + deep link (`companionstudy://parable/{id}`)
- Premium gate wiring

### 3.8 Phase 2 Issue Structure

```
[Phase 2] [Epic] Parables
├── [Phase 2] Scholar: Snodgrass (P0 — blocks content)
├── [Phase 2] Scholar: Hultgren (P0 — blocks content)
├── [Phase 2] Scholar: Bailey (P0 — blocks content)
├── [Phase 2] Scholar: Jeremias (P1 — blocks content)
├── [Phase 2] Scholar: Blomberg (P1 — blocks content)
├── [Phase 2] Scholar: Bock (P2 — blocks content)
├── [Phase 2] Schema: parables + parable_interpretations tables
├── [Phase 2] Loader: build_sqlite_loaders.py additions + is_default enforcement
├── [Phase 2] Canonical parable list freeze
├── [Phase 2] Content: Matthew parables (~23)
├── [Phase 2] Content: Mark parables (~8, mostly parallels)
├── [Phase 2] Content: Luke parables (~28, incl. Luke-only)
├── [Phase 2] Content: Synoptic cross-ref audit
├── [Phase 2] App: ParablePanel renderer
├── [Phase 2] App: ParableInterpretationsModal + premium gate
├── [Phase 2] App: Parable detail screen + deep link
└── [Phase 2] [chore] Add is_default editorial guidance to DEV_GUIDE.md
```

---

## 4. Phase 3 — Concept Mapping

### 4.1 Positioning

`content/meta/concepts.json` = macro-theological (20 entries: Covenant, Kingdom, etc. — stays macro).
`content/meta/topics.json` = granular life-topic (197 entries — extensible).

Phase 3 maps the 2,784 section headers onto existing concepts/topics. Gaps (≥2 occurrences, unmapped) become new `topics.json` entries, never `concepts.json`.

### 4.2 Schema (single new table)

```sql
CREATE TABLE section_topic_map (
  section_id TEXT NOT NULL REFERENCES sections(id),
  target_type TEXT NOT NULL,        -- 'topic' | 'concept'
  target_id TEXT NOT NULL,
  strength REAL NOT NULL DEFAULT 1.0,
  mapping_source TEXT NOT NULL,     -- 'auto' | 'reviewed' | 'manual'
  PRIMARY KEY (section_id, target_type, target_id)
);
CREATE INDEX idx_section_topic_map_target ON section_topic_map(target_type, target_id);
```

### 4.3 Embedding Source (locked)

**Option A — OpenAI via `build_embeddings.py`.** One-time cost (~$0.02) for initial clustering. Re-runs effectively zero since no new chapters are coming. Reuse existing infrastructure.

### 4.4 Phase 3 Issue Structure

```
[Phase 3] [Epic] Concept Mapping
├── [Phase 3] Extract normalized section headers (CSV for review)
├── [Phase 3] Embedding clustering via build_embeddings.py
├── [Phase 3] Human review: cluster quality + initial mappings
├── [Phase 3] Schema: section_topic_map table + loader
├── [Phase 3] coverage_auditor --concepts implementation
├── [Phase 3] Gap report: unmapped clusters ≥2 occurrences
├── [Phase 3] New topics.json entries (batched by category)
└── [Phase 3] App: section detail surfaces linked concepts/topics
```

---

## 5. Epic & Kanban Structure

### 5.1 Title + Label Conventions

| Level | Title pattern | Labels |
|---|---|---|
| Umbrella | `[Epic] Content Coverage Audit` | `coverage:umbrella` |
| Phase sub-epic | `[Phase N] [Epic] {phase name}` | `coverage:phaseN` |
| Infrastructure (Tier A) | `[Phase 1] [chore] ...` or `[Phase 1] [feat] ...` | `coverage:phase1`, `coverage:infrastructure` |
| Per-book epic (Tier B) | `[Phase 1] [Epic] {Book} — Content Coverage Enrichment` | `coverage:phase1`, `coverage:enrichment` |
| Enrichment issue (Tier C) | `[Phase 1] {Book} Ch X–Y — Coverage Enrichment` | `coverage:phase1`, `coverage:enrichment` |
| Phase 2 items | `[Phase 2] ...` | `coverage:phase2` + scope label |
| Phase 3 items | `[Phase 3] ...` | `coverage:phase3` + scope label |

Labels to create: `coverage:umbrella`, `coverage:phase1`, `coverage:phase2`, `coverage:phase3`, `coverage:infrastructure`, `coverage:enrichment`. All kanban filtering runs off these.

### 5.2 Board Shape Estimate

- 1 umbrella epic
- 3 phase sub-epics
- 4 Phase 1 Tier A issues
- ~30–50 per-book epics (only books with findings)
- ~80–150 Phase 1 enrichment issues
- 1 CI gate issue
- ~16 Phase 2 issues
- ~8 Phase 3 issues

Total: ~140–230 cards over the lifetime of the initiative. Created in waves, not at once.

---

## 6. Execution Timeline

```
Week 0:         Craig approves v3 (this doc)
Week 1:         Tier A1 (refactor) + A2 (auditor build)
Week 2:         Tier A3 (template curation) + A4 (first audit + docs/audit report)
Week 2:         Craig reviews real numbers; signs off on Tier B/C structure
Week 2–3:       Tier B epics + Tier C issues created in bulk (after review)
Week 2+:        Phase 2 scholar additions start (all 6 land before content) — parallel
Week 3+:        Phase 1 Tier C execution — Claude Code parallelizable
Week 5–6:       Phase 2 schema + canonical list freeze
Week 6+:        Phase 2 content authoring begins (scholars complete)
Week 8:         Phase 1 wraps → Tier D CI gate enabled
Week 9+:        Phase 3 extraction + clustering + mapping
```

---

## 7. Scope Boundaries

Not touching: `user.db`, Amicus (#1446), How We Got The Bible (#1536), Issue #1224, NIV verse text, section headers (Phase 3 maps, doesn't rewrite), existing substantive panels (no padding), scholars beyond the 6 parable additions, OT parabolic teachings.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Issue sprawl | One integrated issue per chapter-range spans all 3 audit layers |
| Template false positives | Tier A3 curation pass reviews clusters before patterns commit |
| Template false negatives | `--template-candidates` iterative surfacing |
| Quality padding | `quality_scorer` ≥90 floor enforced per issue |
| Genre rubric edge cases | Single-book genres use their own present rates |
| Parable attribution drift | All 6 scholars land first; existing `accuracy_auditor` Tier 2 runs on content PRs |
| Cluster drift (Phase 3) | ≥2-occurrence threshold + manual review gate |
| `is_default` drift (Phase 2) | Loader enforces exactly-one invariant at build time |

---

## 9. Success Metrics

- **P1 L1:** ≥95% sections 🟢 Adequate or better
- **P1 L2:** zero empty/stub/template panels in remediated books
- **P1 L3:** every chapter has substantive versions of its genre's expected panels
- **P2:** 100% canonical parables with panel + ≥3 interpretations + ≥2 traditions + exactly one `is_default`
- **P3:** ≥90% sections mapped to ≥1 topic or concept

---

## Next Action

Claude writes tight issue specs for the 4 Phase 1 Tier A issues:

1. `[Phase 1] [chore] Extract panel_taxonomy.py from quality_scorer.py`
2. `[Phase 1] [feat] Build coverage_auditor.py (all three audit levels)`
3. `[Phase 1] [chore] Template pattern curation pass`
4. `[Phase 1] [chore] Generate initial audit + first docs/audit report`

Specs delivered as drafts for Craig's review. Nothing posted to GitHub until specs approved.
