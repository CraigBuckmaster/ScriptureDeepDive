# Content Test Pipeline — Implementation Plan

**Status:** PLANNED  
**Created:** 2026-04-04  
**Depends on:** Accuracy Audit System (Issue #305, Phases 1–2 complete)  
**Related:** Existing `.github/workflows/content-pipeline.yml`

---

## 1. Problem Statement

Content is generated with AI assistance. Any PR that adds or modifies content
could introduce hallucinated scholar positions, incorrect dates, broken
cross-references, thin panels, or missing structural elements. Currently the
CI pipeline only validates JSON schema and builds the DB. It does not check
content *quality* or *accuracy*.

**Goal:** Every content PR gets automatic quality + accuracy analysis. Hard
errors block the merge. Quality/accuracy regressions warn and create a GitHub
issue with actionable details.

---

## 2. Gate Design (Hybrid)

### 2.1 Hard Errors → BLOCK PR

These always fail the check and prevent merge:

| Error | Source Tool | Why It Blocks |
|-------|-----------|---------------|
| Invalid JSON schema (missing keys, wrong types) | schema_validator.py | Broken data will crash the app |
| Cross-reference to nonexistent verse | accuracy_auditor.py T0 | User-visible broken link |
| Unknown scholar panel_key | accuracy_auditor.py T0 | Panel won't render |
| Missing source attribution on scholar panel | accuracy_auditor.py T0 | Data integrity violation |
| REFUTED claim (proven wrong by Tier 2) | accuracy_auditor.py T2 | Known-false content in a study tool |
| DB build failure | build_sqlite.py | App can't load content |
| DB integrity check failure | validate_sqlite.py | Corrupt database |

### 2.2 Quality Floor → WARN + CREATE ISSUE

Any chapter touched by the PR that scores below **90** on quality_scorer:

- PR comment shows the failing chapters with scores and findings
- Auto-creates a GitHub issue titled `[Content Quality] {book} {chapter} below 90 ({score})`
- Labels: `content`, `bug`
- Does **not** block merge — allows forward progress while tracking debt

### 2.3 Accuracy Regression → WARN + CREATE ISSUE

When Tier 0+1+2 finds **new** problems in chapters changed by the PR:

- **New FLAGGED claims** (claims that were not flagged in the baseline matrix)
- **New REFUTED claims** (always block — see 2.1)
- **Degraded accuracy** (chapter accuracy score dropped vs baseline)

PR comment shows the new flags with full claim details. Auto-creates a
GitHub issue titled `[Content Accuracy] {book} {chapter} — {N} new flags`
with claim IDs, text, and notes.

---

## 3. Changed-File Detection

The pipeline only runs quality/accuracy checks on **chapters actually changed
by the PR**. This keeps CI fast and API costs proportional to PR size.

```yaml
# Step: Detect which content chapters changed
- name: Detect changed chapters
  id: changes
  run: |
    # Get changed files in content/ directory
    CHANGED=$(git diff --name-only ${{ github.event.pull_request.base.sha }} HEAD \
      -- 'content/*/[0-9]*.json' | sort)

    if [ -z "$CHANGED" ]; then
      echo "changed=none" >> $GITHUB_OUTPUT
      echo "No chapter content changes detected"
      exit 0
    fi

    # Extract book/chapter pairs: "genesis/1.json" → "--chapter gen1"
    BOOKS=""
    CHAPTERS=""
    for f in $CHANGED; do
      book=$(echo $f | cut -d/ -f2)
      ch=$(basename $f .json)
      BOOKS="$BOOKS $book"
      CHAPTERS="$CHAPTERS ${book}${ch}"
    done

    # Deduplicate books
    BOOKS=$(echo $BOOKS | tr ' ' '\n' | sort -u | tr '\n' ' ')

    echo "changed=true" >> $GITHUB_OUTPUT
    echo "books=$BOOKS" >> $GITHUB_OUTPUT
    echo "chapters=$CHAPTERS" >> $GITHUB_OUTPUT
    echo "files=$CHANGED" >> $GITHUB_OUTPUT
    echo "count=$(echo $CHANGED | wc -w)" >> $GITHUB_OUTPUT
```

### What triggers content tests:

| Change | Runs Quality? | Runs Accuracy? | Why |
|--------|:---:|:---:|-----|
| `content/{book}/{ch}.json` modified | ✅ | ✅ | Core content changed |
| `content/{book}/{ch}.json` added | ✅ | ✅ | New content |
| `content/meta/*.json` modified | ❌ | ✅ (T0 only) | Meta data affects cross-refs |
| `_tools/*.py` modified | ❌ | ❌ | Tool changes, not content |
| `app/src/**` modified | ❌ | ❌ | App code, not content |

---

## 4. Pipeline Steps

### Current Steps (keep as-is, update file references):
1. **Validate content JSON** — `python3 _tools/schema_validator.py` (BLOCK on fail)
2. **Build scripture.db** — `python3 _tools/build_sqlite.py` (BLOCK on fail)
3. **Validate DB integrity** — `python3 _tools/validate_sqlite.py` (BLOCK on fail)

### New Steps (added after existing):
4. **Detect changed chapters** — Extract book/chapter list from PR diff
5. **Quality scoring** — `python3 _tools/quality_scorer.py --book {book} --json` for each affected book (WARN if any chapter < 90)
6. **Accuracy audit Tier 0+1** — `python3 _tools/accuracy_auditor.py --book {book} --tier 1 --json` (BLOCK on REFUTED, WARN on new FLAGGED)
7. **Accuracy audit Tier 2** — `python3 _tools/accuracy_auditor.py --book {book} --tier 2 --json` (BLOCK on REFUTED, WARN on new FLAGGED). Requires `ANTHROPIC_API_KEY` secret.
8. **Compare against baseline** — Diff new results against committed reference_matrix.json to detect regressions
9. **Generate summary** — Build PR comment with tables and details
10. **Post PR comment** — Update or create bot comment
11. **Create issues** — For any warnings (quality < 90, new flags)

### Step Ordering:
```
Schema Validation ──→ DB Build ──→ DB Integrity
                                        │
                                   Detect Changes
                                        │
                              ┌─────────┼──────────┐
                              │         │          │
                          Quality    Accuracy    Accuracy
                          Scoring    Tier 0+1    Tier 2
                              │         │          │
                              └─────────┼──────────┘
                                        │
                                  Compare Baseline
                                        │
                                  Generate Summary
                                        │
                              ┌─────────┼──────────┐
                              │                    │
                         Post PR Comment    Create Issues
                                                (if needed)
```

---

## 5. Baseline Comparison

The reference_matrix.json committed to the repo serves as the baseline for
regression detection.

### How it works:

```python
# Pseudo-code for regression detection

baseline = load("_tools/audit/reference_matrix.json")  # Committed baseline
current = run_accuracy_audit(changed_chapters)           # Fresh results

new_flags = []
for claim_id, result in current.items():
    baseline_status = baseline.get(claim_id, {}).get("status")

    if result["status"] == "REFUTED":
        # Always a hard error, regardless of baseline
        hard_errors.append(claim_id)

    elif result["status"] == "FLAGGED":
        if baseline_status != "FLAGGED":
            # This is a NEW flag — regression
            new_flags.append(claim_id)
        # else: existing flag, grandfathered

    elif result["status"] == "UNVERIFIED":
        # Can't verify at this tier — not a regression
        pass
```

### Edge cases:
- **New chapter (no baseline):** All claims are new. FLAGGED = warn, REFUTED = block.
- **Chapter modified:** Compare claim-by-claim. New text = new claim hash = re-verified.
- **Baseline doesn't cover this chapter:** Treat as new chapter.

---

## 6. PR Comment Format

```markdown
## Content Pipeline Results

✅ Schema validation passed (112,436 checks)
✅ DB build successful
✅ DB integrity verified

### Content Quality (3 chapters changed)

| Chapter | Score | Grade | Findings |
|---------|-------|-------|----------|
| genesis 12 | 94.3 | A | — |
| genesis 13 | 87.2 | B+ | ⚠ Below 90 floor |
| genesis 14 | 91.0 | A | — |

⚠ **1 chapter below quality floor (90)**
→ Issue created: #312

### Content Accuracy (Tier 0+1+2)

| Chapter | Claims | Verified | Flagged | Refuted |
|---------|--------|----------|---------|---------|
| genesis 12 | 92 | 78 | 2 | 0 |
| genesis 13 | 85 | 71 | 3 (1 new) | 0 |
| genesis 14 | 88 | 74 | 0 | 0 |

⚠ **1 new flagged claim** in genesis 13:
- `genesi-13-s2-sarna-003` [scholar_attribution]
  Claim: "Sarna argues that Abram's wealth..."
  Issue: Could not confirm in JPS Torah Commentary

→ Issue created: #313

### Tier 2 API Cost
- 3 chapters audited, 18 API calls, ~$0.09 spent
```

---

## 7. GitHub Issue Creation

When quality or accuracy warnings fire, the workflow auto-creates an issue.

### Quality Issue Template:
```markdown
Title: [Content Quality] Genesis 13 below 90 (87.2)
Labels: content, bug
Body:
  ## Quality Score Below Floor

  **Chapter:** genesis/13.json
  **Score:** 87.2 / 100 (Grade: B+)
  **Floor:** 90

  ### Findings
  - Density: 19/25 — Section 2 hist panel is thin (180 chars)
  - Completeness: 22/25 — Missing `tl` panel in section 1
  - Verse Coverage: 22/25 — Verses 14-15 overlap with section 3

  ### Action Required
  Enrich thin panels and fix structural issues to reach 90+ score.

  ---
  *Auto-generated by Content Pipeline CI*
```

### Accuracy Issue Template:
```markdown
Title: [Content Accuracy] Genesis 13 — 1 new flagged claim
Labels: content, bug
Body:
  ## New Accuracy Flags

  **Chapter:** genesis/13.json
  **New flags:** 1 (was 2, now 3)

  ### New Claims Flagged

  #### `genesi-13-s2-sarna-003` [scholar_attribution]
  - **Claim:** "Sarna argues that Abram's wealth was exceptional..."
  - **Source:** Nahum Sarna, JPS Torah Commentary
  - **Issue:** Could not confirm this specific claim in Sarna's commentary.
    Sarna discusses Abram's journey (pp. 98-99) but does not characterize
    the wealth as "exceptional."
  - **Tier:** 2 (Claude API)
  - **Confidence:** 35

  ### Action Required
  Review flagged claims and either:
  1. Correct the content to match the scholar's actual position
  2. Provide manual verification that the claim is accurate

  ---
  *Auto-generated by Content Pipeline CI*
```

---

## 8. Secrets Required

| Secret | Purpose | Where to Set |
|--------|---------|-------------|
| `ANTHROPIC_API_KEY` | Tier 2 accuracy checks in CI | GitHub repo Settings → Secrets → Actions |

The workflow gracefully skips Tier 2 if the secret is not set:

```yaml
- name: Accuracy audit Tier 2
  if: steps.changes.outputs.changed == 'true' && env.ANTHROPIC_API_KEY != ''
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    for book in ${{ steps.changes.outputs.books }}; do
      python3 _tools/accuracy_auditor.py --book "$book" --tier 2 --json \
        >> accuracy_t2.json
    done
```

---

## 9. CI Cost Estimate

| PR Size | Chapters | T0+1 Time | T2 Calls | T2 Cost | Total Time |
|---------|----------|-----------|----------|---------|-----------|
| Small (1-5 chapters) | 5 | <1s | ~30 | ~$0.15 | ~20s |
| Medium (10-20 chapters) | 20 | <2s | ~120 | ~$0.60 | ~45s |
| Large batch (50 chapters) | 50 | <3s | ~300 | ~$1.50 | ~90s |
| Full book (50 chapters) | 50 | <3s | ~300 | ~$1.50 | ~90s |

**Monthly estimate** (assuming ~10 PRs/month, avg 15 chapters each):
- T0+1: Free
- T2: ~150 calls × $0.005 = **~$7.50/month**

---

## 10. Workflow File Changes

### content-pipeline.yml updates needed:
1. Fix `validate.py` → `schema_validator.py` reference
2. Fix `validate_sqlite.py` reference (still correct, not renamed)
3. Add changed-chapter detection step
4. Add quality_scorer step
5. Add accuracy_auditor T0+1 step
6. Add accuracy_auditor T2 step (conditional on secret)
7. Add baseline comparison step
8. Expand summary generation with quality + accuracy tables
9. Add issue creation step
10. Update blocking logic (hard errors block, warnings don't)

### New supporting tool needed:
`_tools/ci_content_check.py` — A single orchestrator script that:
1. Takes a list of changed files as input
2. Runs quality_scorer on affected chapters
3. Runs accuracy_auditor on affected chapters
4. Compares against baseline reference_matrix.json
5. Outputs structured JSON with:
   - hard_errors (list of blocking issues)
   - quality_warnings (chapters below 90)
   - accuracy_warnings (new flags/regressions)
   - summary_table (for PR comment)
   - issues_to_create (for GitHub issue creation)

This keeps the workflow YAML clean — one step calls one script, gets one
JSON output, and the workflow just posts the comment and creates issues.

---

## 11. File Architecture

```
_tools/
├── ci_content_check.py          # CI orchestrator (new)
├── schema_validator.py          # Step 1: JSON schema (existing, renamed)
├── quality_scorer.py            # Step 5: Quality scoring (existing, renamed)
├── accuracy_auditor.py          # Steps 6-7: Accuracy audit (existing, renamed)
├── accuracy_config.py           # Accuracy config (existing)
├── accuracy_extractors.py       # Claim extraction (existing)
├── accuracy_verifiers.py        # Verification engine (existing)
├── build_sqlite.py              # Step 2: DB build (existing)
├── validate_sqlite.py           # Step 3: DB integrity (existing)
├── audit/
│   ├── reference_matrix.json    # Baseline for regression detection
│   ├── summary.json             # Aggregate scores
│   └── ...
.github/workflows/
├── content-pipeline.yml         # Updated workflow (existing)
```

---

## 12. Build Phases

| Phase | Scope | Deliverable | Depends On |
|-------|-------|-------------|-----------|
| **CP-1** | Fix existing workflow | Update `validate.py` → `schema_validator.py` in content-pipeline.yml | File renames (done) |
| **CP-2** | Changed-file detection | Add step to extract affected chapters from PR diff | CP-1 |
| **CP-3** | Quality gate | Run quality_scorer on changed chapters, compare against floor of 90 | CP-2 |
| **CP-4** | Accuracy gate T0+1 | Run accuracy_auditor T0+1, detect regressions vs baseline | CP-2 |
| **CP-5** | Accuracy gate T2 | Run accuracy_auditor T2 with API key secret | CP-4 + API key in GitHub secrets |
| **CP-6** | ci_content_check.py | Single orchestrator script replacing individual steps | CP-3 + CP-4 |
| **CP-7** | Issue creation | Auto-create GitHub issues for warnings | CP-6 |
| **CP-8** | Full baseline | Run full corpus audit to establish baseline matrix | Accuracy Audit Phase 3-4 |

### Phase sequencing:
- **CP-1** is a one-line fix, ship immediately
- **CP-2 through CP-6** are one session of work
- **CP-7** requires `issues: write` permission in the workflow
- **CP-8** requires API key + ~$172 spend

---

## 13. Permissions

The workflow needs expanded permissions for issue creation:

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write          # NEW: for auto-creating issues
```

---

## 14. Quality Floor Escalation Plan

| Phase | Floor | When |
|-------|-------|------|
| **Now** | 90 | Initial deployment |
| **After remediation** | 92 | When corpus average reaches 92+ |
| **Mature** | 95 | When all chapters are above 92 |

The floor is set in `accuracy_config.py` as a constant:

```python
QUALITY_FLOOR = 90  # Minimum quality_scorer score for content
```

Raising it is a one-line change + PR.

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API key exposure in CI logs | Security breach | GitHub Actions masks secrets automatically; never echo the key |
| Tier 2 cost spikes on large PRs | Budget overrun | Cap at 500 calls per PR via `--max-calls` flag; warn in comment if capped |
| Flaky Tier 2 results | False positives in CI | Cache results; re-run on same content produces same hash → same result |
| Too many issues created | Noise | Deduplicate: check if issue already exists for that chapter before creating |
| Baseline drift | Stale comparisons | Baseline is updated on each merge to master; PRs always compare against latest |
| Quality floor too aggressive | Blocks progress | Floor is a warning, not a blocker — content can still merge |

---

## 16. Success Criteria

- [ ] PRs with content changes get a quality + accuracy report in the PR comment
- [ ] Hard errors (schema, REFUTED claims, broken refs) block the PR
- [ ] Chapters below quality floor of 90 generate a warning + issue
- [ ] New FLAGGED claims generate a warning + issue
- [ ] Tier 2 runs automatically when API key is configured
- [ ] Tier 2 is gracefully skipped when API key is missing
- [ ] No false positives on the blocking gate (zero legitimate content blocked)
- [ ] Issues created have enough detail to act on without re-running tools
- [ ] CI completes in under 2 minutes for typical PRs (1-20 chapters)
- [ ] Monthly Tier 2 cost stays under $10 at current PR velocity
