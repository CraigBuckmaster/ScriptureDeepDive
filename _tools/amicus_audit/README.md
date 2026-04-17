# Amicus audit pipeline (#1468)

Weekly accuracy review of Amicus responses. Three sample pools feed a
rule-based classifier; anything that doesn't pass every check (or comes
from the gap-signal / user-feedback pools) is escalated into a
`amicus-audit`-labelled review queue.

## Sample pools

| Reason | Source | Rate |
| --- | --- | --- |
| `random_1pct` | Proxy logs 1% of successful `/ai/chat` responses | ~1% |
| `gap_signal` | Proxy's existing gap-capture pipeline (#1471) | 100% |
| `user_feedback` | `/ai/feedback` thumbs-down endpoint | 100% |

The proxy writes every row to the `amicus_response_samples` D1 table
(schema at the bottom of this file). The `captureGap` pipeline from
#1471 already handles the two escalation pools; card #1468 adds the
random 1% logger.

## Weekly ops

```bash
# 1. Export the D1 table to a local SQLite file for offline processing
wrangler d1 export amicus-gaps \
  --output=_tools/amicus_audit/cache/samples.db \
  --table=amicus_response_samples

# 2. Sample the week
python3 _tools/amicus_audit/sampler.py \
  --week 2026-06-01 \
  --source _tools/amicus_audit/cache/samples.db

# 3. Classify
python3 _tools/amicus_audit/classifier.py \
  --in _tools/amicus_audit/cache/2026-06-01.json \
  --out _tools/amicus_audit/cache/2026-06-01.classified.json

# 4. Emit issue drafts for escalated samples
python3 _tools/amicus_audit/review_queue.py \
  --in _tools/amicus_audit/cache/2026-06-01.classified.json \
  --out _tools/amicus_audit/cache/2026-06-01/issues/

# 5. Weekly metrics report
python3 _tools/amicus_audit/metrics.py \
  --in _tools/amicus_audit/cache/2026-06-01.classified.json \
  --week 2026-06-01 \
  > _tools/amicus_audit/cache/audit_report_2026-06-01.md
```

Target: sustained `needs_review` rate below 5%. Higher = prompt tuning
or a corpus-gap pass is needed.

## Classifier checks

| Check id | What it catches |
| --- | --- |
| `every_citation_has_valid_chunk_id` | Citation marker references a chunk that was actually retrieved. |
| `no_fabricated_scholar_names` | Response names a scholar not present in any retrieved chunk. |
| `gap_signal_consistency` | `gap_signal` samples must acknowledge the gap in prose. |
| `response_length_reasonable` | Flags truncated (<40 chars) or runaway (>6000 chars) responses. |
| `no_prompt_injection_markers` | System-prompt fragments have not leaked into the reply. |
| `citation_source_type_matches_claim` | Scholar attributions cite `section_panel`/`chapter_panel`, not lex sources. |

Samples from the `gap_signal` or `user_feedback` pools are always
escalated regardless of classifier verdict — every one gets a human
eyeball.

## D1 schema (deploy alongside the proxy)

```sql
CREATE TABLE amicus_response_samples (
  sample_id TEXT PRIMARY KEY,
  captured_at INTEGER NOT NULL,
  query_text TEXT NOT NULL,
  query_embedding BLOB,
  compressed_profile TEXT,
  current_chapter_ref TEXT,
  retrieved_chunks_json TEXT,
  retrieved_chunks_used_json TEXT,
  response_text TEXT NOT NULL,
  citations_json TEXT,
  model_tier TEXT,
  latency_ms INTEGER,
  sample_reason TEXT NOT NULL,
  audit_status TEXT NOT NULL DEFAULT 'pending',
  audit_notes TEXT,
  linked_issue_number INTEGER
);

CREATE INDEX idx_amicus_response_samples_captured_at
  ON amicus_response_samples(captured_at);
```

## Out of scope

- Automated corrective content writes — accuracy work is human-review.
- Real-time alerting — weekly cadence is enough at current scale.
- Opening the GitHub issues from the pipeline — `review_queue.py`
  writes Markdown drafts instead; humans confirm and use `gh issue
  create` (or paste into the UI) to actually file them.
