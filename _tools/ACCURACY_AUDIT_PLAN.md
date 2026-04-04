# Accuracy Audit System — Implementation Plan

**Status:** PLANNED  
**Created:** 2026-04-03  
**Purpose:** Detect AI hallucinations, verify scholar attributions, and build a
reference matrix proving every content claim against trusted sources.

---

## 1. Problem Statement

Companion Study contains ~1,189 chapters with ~20,790 section panels (9,694
scholar-attributed) and ~9,044 chapter panels. Each panel contains 1–10
verifiable claims — estimated 40,000–80,000 total claims across the corpus.

These claims were generated with AI assistance. Any of them could be:
- **Hallucinated** — a plausible-sounding but fabricated position attributed to a scholar
- **Misattributed** — a real position assigned to the wrong scholar
- **Inaccurate** — a date, definition, or historical fact that's subtly wrong
- **Distorted** — a real scholar's nuanced view flattened into a caricature

The accuracy audit extracts every verifiable claim, checks it against trusted
sources, and produces a **reference matrix** that proves (or disproves) each
claim with citations.

---

## 2. Relationship to Existing Tools

| Tool | What It Checks | Overlap |
|------|---------------|---------|
| `schema_validator.py` | JSON schema, structural integrity, cross-ref format | None — structural only |
| `quality_scorer.py` | Panel density, verse coverage, completeness, basic relevance | Minimal — quality scores content richness, not factual accuracy |
| `accuracy_auditor.py` *(new)* | Factual accuracy of content claims against external sources | Separate score, separate output |

`accuracy_auditor.py` is **independent** of quality_scorer.py. A chapter can score 98 on
quality (rich, complete, well-structured) and 60 on accuracy (several
misattributed scholar positions). The two tools answer different questions.

**Pipeline integration:** `schema_validator.py --accuracy` runs Tier 0+1 checks (free,
local) as a gate. `schema_validator.py --accuracy --deep` runs full Tier 0–3 (requires
API key, costs money).

---

## 3. Claim Taxonomy

Every extracted claim is classified into one of 6 types:

### 3.1 Scholar Attribution (Weight: 30%)
- **Source panels:** Scholar panels (mac, sarna, alter, calvin, etc.)
- **Example:** "Sarna argues that bereshit is a temporal clause"
- **Verification:** Tier 3 — Claude API + web search against cited published work
- **Risk level:** HIGHEST — AI hallucination most likely here

### 3.2 Hebrew/Greek Definitions (Weight: 20%)
- **Source panels:** heb, hebtext
- **Example:** "בָּרָא (bara) means 'to create from nothing'"
- **Verification:** Tier 0 (gloss vs Strong's) + Tier 2 (nuanced interpretive claims)
- **Risk level:** MEDIUM — glosses are usually correct; etymology/nuance can drift

### 3.3 Cross-References (Weight: 15%)
- **Source panels:** cross, thread
- **Example:** "See John 1:1–3 for NT echo of creation"
- **Verification:** Tier 0 (ref existence in verse DB) + Tier 2 (theological connection validity)
- **Risk level:** LOW — refs are usually valid; connection quality varies

### 3.4 Historical/Archaeological (Weight: 15%)
- **Source panels:** hist, src
- **Example:** "The Enuma Elish dates to c. 1100 BCE"
- **Verification:** Tier 2 — Claude API against training knowledge
- **Risk level:** MEDIUM — dates and ANE parallels are checkable

### 3.5 Timeline (Weight: 10%)
- **Source panels:** timeline_link, date claims in any panel
- **Example:** "Battle of Qarqar occurred in 853 BC"
- **Verification:** Tier 1 (internal consistency vs timelines.json) + Tier 2
- **Risk level:** LOW-MEDIUM — most dates are conventional

### 3.6 People/Places (Weight: 10%)
- **Source panels:** ppl, places meta
- **Example:** "David was the second king of Israel"
- **Verification:** Tier 1 (internal consistency) + Tier 2 (disputed facts)
- **Risk level:** LOW — mostly biblical facts, rarely hallucinated

---

## 4. Verification Tiers

### Tier 0 — Free, Local, Exhaustive
Runs on every chapter, every time, no API required. ~2 seconds for full corpus.

Checks:
- Cross-reference existence: Does the cited ref exist in `content/verses/`?
- Verse range validity: section verse_start/verse_end within book bounds
- Scholar panel_key matches a known scholar in `content/meta/scholars.json`
- Source field format: matches `"Author, Work — Paraphrase Type"` pattern
- Duplicate detection: identical claim text across panels in same chapter
- Internal ref consistency: thread anchors/targets resolve to real verses

### Tier 1 — Local Data, No API
Uses bundled lexicon data and existing meta files. ~5 seconds for full corpus.

Checks:
- Hebrew/Greek gloss vs Strong's Concordance (bundled `strongs_ot.json` + `strongs_nt.json`)
- Transliteration format validation (standard academic transliteration)
- People facts vs `people.json` internal consistency
- Places facts vs `places.json` internal consistency
- Timeline dates vs `timelines.json` for contradictions
- Scholar tradition alignment (e.g., Calvin panel shouldn't contain dispensationalist claims)

### Tier 2 — Claude API, No Web Search
Uses Claude's training knowledge to verify claims. ~$0.005/call, batched 8–10
claims per call.

Checks:
- Historical date accuracy (ANE chronology, archaeological dating)
- Hebrew/Greek interpretive claims beyond simple glosses
- People/places disputed facts
- Theological position plausibility (is this a real position anyone holds?)

### Tier 3 — Claude API + Web Search
Uses Claude with web_search tool to verify against live sources. ~$0.015/call,
one call per scholar panel.

Checks:
- Scholar attribution verification against cited published work
- Returns: per-note verdict + source URL/page reference
- Generates fix suggestions for REFUTED claims

---

## 5. File Architecture

```
_tools/
├── accuracy_auditor.py              # CLI entry point + orchestrator
├── accuracy_extractors.py   # Claim extraction from chapter JSON
├── accuracy_verifiers.py    # Tiered verification engine + API client
├── accuracy_config.py       # Weights, thresholds, prompt templates
├── audit/                   # Persistent output (git-tracked)
│   ├── reference_matrix.json    # Master claim-level results
│   ├── summary.json             # Aggregate scores by book/type
│   ├── strongs_ot.json          # Bundled OT Strong's lexicon (~5,600 entries)
│   ├── strongs_nt.json          # Bundled NT Strong's lexicon (~5,500 entries)
│   ├── reports/                 # Per-book markdown reports
│   │   ├── genesis.md
│   │   └── ...
│   └── .cache/                  # API response cache (git-ignored via .gitignore)
│       └── {claim_hash}.json
```

### .gitignore addition
```
_tools/audit/.cache/
_tools/.env
```

---

## 6. Data Structures

### 6.1 Claim (extraction output)

```python
@dataclass
class Claim:
    id: str                    # "gen-1-s1-sarna-001"
    chapter_id: str            # "gen1"
    book_dir: str              # "genesis"
    section_num: int | None    # None for chapter-level panels
    panel_type: str            # "sarna", "heb", "cross", etc.
    claim_type: str            # scholar_attribution | hebrew_greek | cross_reference
                               # historical | timeline | people_places
    claim_text: str            # Verbatim claim from JSON
    source_attribution: str | None  # "Nahum Sarna, JPS Torah Commentary"
    verse_ref: str | None      # "1:1"
    verification_tier: int     # 0, 1, 2, or 3
```

### 6.2 VerificationResult (verification output)

```python
@dataclass
class VerificationResult:
    claim_id: str
    status: str                # VERIFIED | FLAGGED | REFUTED | UNVERIFIED | SKIPPED
    confidence: int            # 0–100
    sources: list[Source]      # Corroborating sources found
    notes: str                 # Explanation of verdict
    fix_suggestion: str | None # For REFUTED: suggested correction
    verified_at: str           # ISO 8601 timestamp
    tier: int                  # Which tier produced this result

@dataclass
class Source:
    title: str                 # "JPS Torah Commentary: Genesis"
    author: str                # "Nahum M. Sarna"
    type: str                  # primary_work | lexicon | concordance | encyclopedia | web
    reference: str             # "pp. 5-6" or "H1254" or "ch. 3, §2"
    url: str | None            # Web URL if available
    verification_note: str     # How this source supports/refutes the claim
```

### 6.3 Reference Matrix (persistent JSON)

```json
{
  "metadata": {
    "version": "1.0",
    "baseline_date": "2026-04-03T00:00:00Z",
    "last_updated": "2026-04-03T00:00:00Z",
    "corpus_stats": {
      "total_claims": 52000,
      "by_status": {
        "VERIFIED": 45000,
        "FLAGGED": 5800,
        "REFUTED": 200,
        "UNVERIFIED": 1000,
        "SKIPPED": 12000
      },
      "by_type": {
        "scholar_attribution": { "total": 18000, "verified": 15000, "flagged": 2500, "refuted": 150 },
        "hebrew_greek": { "total": 8000, "verified": 7500, "flagged": 400, "refuted": 20 },
        "cross_reference": { "total": 12000, "verified": 11800, "flagged": 150, "refuted": 10 },
        "historical": { "total": 6000, "verified": 5200, "flagged": 700, "refuted": 15 },
        "timeline": { "total": 3000, "verified": 2800, "flagged": 180, "refuted": 5 },
        "people_places": { "total": 5000, "verified": 4700, "flagged": 270, "refuted": 0 }
      }
    }
  },
  "claims": {
    "gen-1-s1-sarna-001": {
      "chapter_id": "gen1",
      "book_dir": "genesis",
      "section_num": 1,
      "panel_type": "sarna",
      "claim_type": "scholar_attribution",
      "claim_text": "The Hebrew bereshit does not require a definite article...",
      "source_attribution": "Nahum Sarna, JPS Torah Commentary",
      "status": "VERIFIED",
      "confidence": 94,
      "sources": [
        {
          "title": "JPS Torah Commentary: Genesis",
          "author": "Nahum M. Sarna",
          "type": "primary_work",
          "reference": "pp. 5-6",
          "url": "https://...",
          "verification_note": "Sarna discusses bereshit ambiguity on pp. 5-6, confirming both absolute and construct readings."
        }
      ],
      "notes": "Verified against primary source. Accurately represents Sarna's position.",
      "fix_suggestion": null,
      "verified_at": "2026-04-03T12:00:00Z",
      "tier": 3
    }
  }
}
```

### 6.4 Summary (aggregate scores)

```json
{
  "generated_at": "2026-04-03T12:00:00Z",
  "corpus_average": 89.4,
  "books": {
    "genesis": {
      "score": 93.2,
      "grade": "A",
      "chapters": {
        "1": { "score": 95, "claims": 42, "flagged": 1, "refuted": 0 },
        "2": { "score": 91, "claims": 38, "flagged": 2, "refuted": 0 }
      },
      "by_type": {
        "scholar_attribution": 91,
        "hebrew_greek": 97,
        "cross_reference": 100,
        "historical": 88,
        "timeline": 92,
        "people_places": 95
      }
    }
  },
  "worst_chapters": [
    { "chapter_id": "2chr36", "book": "2_chronicles", "score": 62, "flagged": 8, "refuted": 2 }
  ],
  "worst_scholars": [
    { "scholar": "mac", "accuracy": 84, "flagged": 120, "refuted": 15 }
  ]
}
```

---

## 7. Scoring Model

### Per-Chapter Score (0–100)

```
chapter_score = (
    scholar_pct    * 0.30 +
    hebrew_pct     * 0.20 +
    crossref_pct   * 0.15 +
    historical_pct * 0.15 +
    timeline_pct   * 0.10 +
    people_pct     * 0.10
) * 100
```

Where `*_pct` = `verified_count / total_claims_in_dimension`.

**Aggressive flagging rule:** Only `VERIFIED` and `SKIPPED` count as "good."
`FLAGGED` counts as unverified (0). This ensures the score reflects *proven*
accuracy, not assumed accuracy.

### Grade Mapping

| Score | Grade | Meaning |
|-------|-------|---------|
| 95–100 | A+ | Fully verified, publication-ready |
| 90–94 | A | Minor flags, no refutations |
| 85–89 | B+ | Some unverified claims, review recommended |
| 80–84 | B | Multiple flags, needs attention |
| 70–79 | C | Significant accuracy concerns |
| < 70 | D | Major remediation required |

---

## 8. API Integration

### 8.1 Configuration

```python
# _tools/.env (git-ignored)
ANTHROPIC_API_KEY=sk-ant-...
```

```python
# accuracy_config.py
import os
from pathlib import Path

ENV_FILE = Path(__file__).parent / ".env"

def load_api_key() -> str | None:
    """Load API key from .env file."""
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("ANTHROPIC_API_KEY")
```

### 8.2 Tier 3 Prompt Template (Scholar Verification)

```
You are a biblical scholarship fact-checker. You have access to web search.

I will provide a scholar attribution from a Bible study app. Your job is to
verify whether the attributed position accurately represents the scholar's
published work.

SCHOLAR: {source_attribution}
BOOK/CHAPTER: {book_name} {chapter_num}
VERSE: {verse_ref}

CLAIMED POSITION:
"{claim_text}"

Instructions:
1. Search for the scholar's actual published position on this passage.
2. Compare the claimed position to what the scholar actually wrote.
3. Return a JSON object (no markdown fences):

{
  "status": "VERIFIED" | "FLAGGED" | "REFUTED",
  "confidence": 0-100,
  "sources": [
    {
      "title": "...",
      "author": "...",
      "type": "primary_work" | "secondary" | "web",
      "reference": "page/section reference",
      "url": "...",
      "verification_note": "..."
    }
  ],
  "notes": "Explanation of your verdict",
  "fix_suggestion": "If REFUTED, what should the claim say instead? null otherwise"
}

Rules:
- Use VERIFIED only if you find corroborating evidence in the scholar's work.
- Use FLAGGED if you cannot confirm — do NOT assume accuracy.
- Use REFUTED if the claim contradicts the scholar's known position.
- Always provide at least one source with a specific reference.
- Be aggressive about flagging. When in doubt, FLAGGED.
```

### 8.3 Tier 2 Prompt Template (Historical/Hebrew Batch)

```
You are a biblical studies fact-checker. Verify each claim below using your
knowledge of ANE history, Hebrew linguistics, and biblical scholarship.

CLAIMS (from {book_name} {chapter_num}):
{numbered_claims_list}

For each claim, return a JSON array (no markdown fences):
[
  {
    "claim_index": 1,
    "status": "VERIFIED" | "FLAGGED" | "REFUTED",
    "confidence": 0-100,
    "notes": "Brief explanation",
    "fix_suggestion": "If REFUTED, correction. null otherwise."
  },
  ...
]

Rules:
- VERIFIED = you are confident this is factually correct.
- FLAGGED = you are not confident enough to confirm.
- REFUTED = this contradicts established scholarship or known facts.
- Be aggressive about flagging. When in doubt, FLAGGED.
```

### 8.4 Batching Strategy

| Tier | Batch Size | Estimated Calls (Baseline) | Cost/Call | Total Cost |
|------|-----------|---------------------------|-----------|------------|
| 3 (scholar) | 1 panel/call | ~9,694 | ~$0.015 | ~$145 |
| 2 (hist/heb) | 8–10 claims/call | ~3,000 | ~$0.005 | ~$15 |
| 0+1 (local) | Full corpus | 0 | $0 | $0 |
| **Total** | | ~12,700 | | **~$160** |

### 8.5 Rate Limiting & Retry

```python
# accuracy_verifiers.py
MAX_CONCURRENT = 5          # Parallel API calls
RATE_LIMIT_RPM = 50         # Requests per minute
RETRY_ATTEMPTS = 3          # Retries on transient failure
RETRY_BACKOFF = 2.0         # Exponential backoff base (seconds)
CHECKPOINT_INTERVAL = 50    # Save progress every N claims
```

Checkpoint saving means a crashed baseline run resumes from where it stopped,
not from scratch.

---

## 9. Caching

```python
def claim_hash(claim: Claim) -> str:
    """Deterministic hash of claim content for cache keying."""
    payload = f"{claim.claim_text}|{claim.source_attribution}|{claim.panel_type}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]
```

Cache structure: `_tools/audit/.cache/{hash}.json` — one file per verified claim,
containing the raw `VerificationResult` as JSON.

On subsequent runs:
1. Extract claims from chapter JSON
2. Hash each claim
3. If hash exists in cache → load cached result, skip API call
4. If hash missing → queue for API verification
5. After verification → write to cache

**Cache invalidation:** If panel content changes (edit, enrichment), the hash
changes, and the claim is re-verified automatically.

---

## 10. CLI Interface

```
accuracy_auditor.py — Content accuracy auditor for Companion Study

Usage:
  python3 _tools/accuracy_auditor.py                        # Full baseline (all books, all tiers available)
  python3 _tools/accuracy_auditor.py --book genesis          # Audit one book
  python3 _tools/accuracy_auditor.py --chapter gen1          # Audit one chapter
  python3 _tools/accuracy_auditor.py --tier 0                # Tier 0 only (free, instant)
  python3 _tools/accuracy_auditor.py --tier 1                # Tier 0+1 (free, local data)
  python3 _tools/accuracy_auditor.py --tier 2                # Tier 0+1+2 (API, no web search)
  python3 _tools/accuracy_auditor.py --tier 3                # All tiers (API + web search, full cost)
  python3 _tools/accuracy_auditor.py --scholar sarna         # Audit one scholar across all books
  python3 _tools/accuracy_auditor.py --type historical       # Audit one claim type only
  python3 _tools/accuracy_auditor.py --report                # Regenerate markdown reports from matrix
  python3 _tools/accuracy_auditor.py --worst 20              # Show 20 lowest-scoring chapters
  python3 _tools/accuracy_auditor.py --flagged               # List all FLAGGED + REFUTED claims
  python3 _tools/accuracy_auditor.py --stats                 # Corpus-wide statistics
  python3 _tools/accuracy_auditor.py --cost-estimate          # Estimate API cost without running
  python3 _tools/accuracy_auditor.py --dry-run               # Extract claims, show counts, no verification
  python3 _tools/accuracy_auditor.py --json                  # Machine-readable output

Validate.py integration:
  python3 _tools/schema_validator.py --accuracy              # Tier 0+1 gate (free)
  python3 _tools/schema_validator.py --accuracy --deep       # Full Tier 0–3 (requires API key)
```

---

## 11. Terminal Output Format

```
═══ ACCURACY AUDIT — Genesis ═════════════════════════════════════

  Chapter  Scholar  Hebrew  Cross   Hist   Time   Ppl    TOTAL
  ─────────────────────────────────────────────────────────────
  gen1       92      97      100     88     90     95      93  A
  gen2       88      95      100     85     90     92      91  A
  gen3       84      92       98     80     85     90      87  B+
  gen4       96      94      100     92     95     98      95  A+
  ...

  Book Average: 91.2 / 100 (Grade: A)
  Claims: 842 total | 780 verified | 52 flagged | 3 refuted | 7 unverified

  ⚠ FLAGGED (52 claims) — top 5:
    gen3-s2-sarna-003  [scholar_attribution]
      Claim: "Sarna argues the serpent represents Canaanite fertility cults"
      Issue: Cannot confirm in JPS Torah Commentary. Sarna discusses nachash
             (p. 24) as embodying cunning, not fertility cult symbolism.

    gen6-s1-hist-001   [historical]
      Claim: "The Gilgamesh flood tablet dates to 2100 BCE"
      Issue: Standard dating is c. 2100 BCE for Sumerian flood story (Eridu
             Genesis), but Gilgamesh Tablet XI is Neo-Assyrian (c. 7th c. BCE).
             Possible conflation of two traditions.

  ✗ REFUTED (3 claims):
    gen6-s1-mac-002    [scholar_attribution]
      Claim: "MacArthur identifies the Nephilim as fallen angels"
      Source: MacArthur Study Bible (2006), p. 26
      Actual: MacArthur identifies Nephilim as offspring of Sethite-Cainite
              intermarriage, explicitly rejecting the fallen angel view.
      Fix:    "MacArthur identifies the 'sons of God' as descendants of Seth
              who intermarried with the line of Cain, producing the Nephilim
              as mighty but ungodly offspring."

══════════════════════════════════════════════════════════════════
```

---

## 12. Baseline Run Strategy

**Priority order:** Highest quality-scored books first (validate that the best
work is accurate before chasing problems in weaker content).

```python
BASELINE_ORDER = [
    # Phase A: Flagships — highest quality, most user-visible
    "genesis", "exodus", "psalms", "matthew", "john", "romans",
    "revelation", "isaiah", "daniel",

    # Phase B: Torah + Historical
    "leviticus", "numbers", "deuteronomy",
    "joshua", "judges", "ruth",
    "1_samuel", "2_samuel", "1_kings", "2_kings",

    # Phase C: Wisdom + Prophets
    "job", "proverbs", "ecclesiastes", "song_of_solomon",
    "jeremiah", "lamentations", "ezekiel",

    # Phase D: Minor Prophets
    "hosea", "joel", "amos", "obadiah", "jonah", "micah",
    "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",

    # Phase E: NT Letters
    "acts", "1_corinthians", "2_corinthians", "galatians",
    "ephesians", "philippians", "colossians",
    "1_thessalonians", "2_thessalonians",
    "1_timothy", "2_timothy", "titus", "philemon",
    "hebrews", "james", "1_peter", "2_peter",
    "1_john", "2_john", "3_john", "jude",

    # Phase F: Remaining
    "1_chronicles", "2_chronicles", "ezra", "nehemiah", "esther",
    "mark", "luke",
]
```

Estimated time for full Tier 3 baseline: ~4–6 hours (rate-limited API calls).
Can be interrupted and resumed via checkpointing.

---

## 13. Strong's Lexicon Bundle

### Source
OpenScriptures Hebrew/Greek lexicon data (MIT license, GitHub).
- OT: ~5,624 entries (H0001–H8674)
- NT: ~5,523 entries (G0001–G5624)
- Total: ~200KB compressed JSON

### Generation (one-time)
```bash
python3 _tools/build_strongs.py   # Fetches + processes → audit/strongs_ot.json, audit/strongs_nt.json
```

### Schema
```json
{
  "H1254": {
    "word": "בָּרָא",
    "transliteration": "bara'",
    "pronunciation": "baw-raw'",
    "gloss": "to create, shape, form",
    "strongs_def": "a primitive root; (absolutely) to create...",
    "kjv_usage": "choose, create (creator), cut down, dispatch, do, make (fat)"
  }
}
```

### Tier 1 Hebrew Check Logic
```python
def verify_hebrew_gloss(claim: Claim, strongs: dict) -> VerificationResult:
    """Check if a Hebrew word's gloss matches Strong's."""
    # Extract Strong's number from claim if present
    # Fuzzy-match the transliteration against strongs entries
    # Compare gloss against strongs_def and kjv_usage
    # VERIFIED if gloss is consistent
    # FLAGGED if gloss makes claims beyond what Strong's supports
    # REFUTED if gloss contradicts Strong's
```

---

## 14. Fix Suggestion Engine

When a claim is REFUTED, the Tier 2/3 API call generates a fix suggestion.
These are stored in the reference matrix and surfaced in reports.

### Fix Workflow
1. Audit detects REFUTED claim with fix_suggestion
2. Report shows the original claim, the evidence, and the fix
3. Developer reviews and applies fix manually (or via a future `accuracy_auditor.py --apply-fixes` command)
4. On next audit run, the changed claim gets a new hash → re-verified
5. If the fix is correct → status changes to VERIFIED

### Future: `--apply-fixes` (Phase 6, deferred)
Could auto-generate a generator script that patches REFUTED claims in chapter
JSON files. Not in initial scope — manual review is appropriate for now since
fixes involve theological judgment.

---

## 15. Build Phases

| Phase | Scope | Files | Cost | Session Est. |
|-------|-------|-------|------|-------------|
| **1** | Claim extraction + Tier 0 checks | `accuracy_auditor.py`, `accuracy_extractors.py`, `accuracy_config.py` | $0 | 1 session |
| **2** | Tier 1 + Strong's bundle | `accuracy_verifiers.py` (local), `build_strongs.py`, `strongs_ot.json`, `strongs_nt.json` | $0 | 1 session |
| **3** | Tier 2 + API integration | `accuracy_verifiers.py` (API), batch manager, caching, checkpointing | ~$15 | 1 session |
| **4** | Tier 3 + scholar verification | Web search integration, reference matrix population, fix suggestions | ~$145 | 2–3 sessions (rate-limited) |
| **5** | Reports + pipeline gate | Markdown reports, `schema_validator.py --accuracy` integration, summary.json | $0 | 1 session |

**Phase 1–2 can ship in a single session.** These provide immediate value with
zero cost: structural checks, cross-ref validation, Hebrew gloss verification
against Strong's. Catches the easy errors before spending money on API calls.

**Phase 3–4 require the Anthropic API key.** Craig provides this when ready.
The baseline run can be done incrementally (one book per session if preferred).

**Phase 5** wires everything into the deploy pipeline.

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API cost overrun | $200+ on baseline | `--cost-estimate` flag; `--tier` flag to limit scope; checkpointing |
| False positives flood | Noise buries real issues | Confidence scores + severity tiers; `--worst N` to focus review |
| Claude can't find scholar's work online | FLAGGED when should be VERIFIED | Accept FLAGGED as "not proven" — manual review queue |
| Strong's data gaps | Missing entries for rare words | Fall back to Tier 2 API check for unmatched entries |
| Reference matrix grows too large | Git bloat | Compress to ~5MB; per-book files if needed |
| Rate limiting during baseline | Slow progress | Checkpointing + resume; parallel calls within limits |

---

## 17. Success Criteria

- [ ] Tier 0+1 runs in < 30 seconds for full corpus
- [ ] Every scholar panel claim has a verification status
- [ ] Every REFUTED claim has a fix_suggestion
- [ ] Reference matrix is committed and browsable
- [ ] Per-book markdown reports show clear pass/fail with sources
- [ ] `schema_validator.py --accuracy` gates deploy pipeline (Tier 0+1)
- [ ] Corpus accuracy score baseline established
- [ ] Top 10 worst chapters identified for remediation
- [ ] Scholar accuracy leaderboard shows per-scholar reliability

---

## 18. Future Extensions (Not In Scope)

- `--apply-fixes` auto-remediation of REFUTED claims
- Web dashboard for browsing reference matrix
- Scheduled re-audit (weekly cron) to catch regression
- Export reference matrix as appendix/bibliography for the app itself
- User-facing "verified" badges on scholar panels
- Integration with quality_scorer.py for composite content health score
