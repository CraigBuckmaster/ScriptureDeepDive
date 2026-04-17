# Amicus aggregate analytics (#1469)

Privacy-first usage metrics. **Zero per-user tracking.** Three data
streams feed one weekly markdown report:

1. **Hourly counters** — every `/ai/chat` request bumps a row keyed
   `YYYY-MM-DDTHH` (UTC). No user data is recorded.
2. **Daily active users** — computed from a 16-char fingerprint of
   `SHA-256(receipt_hash + ":" + date)`. The fingerprint rotates
   nightly, so cross-day correlation is impossible even server-side.
   Raw receipt hashes and tokens never touch D1.
3. **Client events** (optional) — the app posts aggregate counters
   (peek opens, home-card taps, citation taps, etc.) to
   `POST /ai/metrics`. Payloads contain numbers + short categorical
   tags only — no user id, no query text, no response text.

## What we do NOT track

- Individual user behavior over time (no profiles beyond auth)
- Query or response text (those live briefly in the audit-sampling
  table, scrubbed, and only in that table)
- Device fingerprints, location beyond what Cloudflare headers
  naturally surface (we do not enrich)

## D1 schema

```sql
CREATE TABLE amicus_hourly_metrics (
  hour_bucket TEXT PRIMARY KEY,
  total_requests INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  rate_limit_count INTEGER NOT NULL DEFAULT 0,
  auth_fail_count INTEGER NOT NULL DEFAULT 0,
  haiku_count INTEGER NOT NULL DEFAULT 0,
  sonnet_count INTEGER NOT NULL DEFAULT 0,
  gap_signal_count INTEGER NOT NULL DEFAULT 0,
  latency_sum_ms REAL NOT NULL DEFAULT 0,
  latency_count INTEGER NOT NULL DEFAULT 0,
  input_tokens_sum REAL NOT NULL DEFAULT 0,
  input_tokens_count INTEGER NOT NULL DEFAULT 0,
  output_tokens_sum REAL NOT NULL DEFAULT 0,
  output_tokens_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE amicus_daily_user_fingerprints (
  date TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  tier TEXT NOT NULL,
  PRIMARY KEY (date, fingerprint)
);

CREATE TABLE amicus_daily_users (
  date TEXT PRIMARY KEY,
  dau_premium INTEGER NOT NULL DEFAULT 0,
  dau_partner_plus INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE amicus_client_events (
  hour_bucket TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_tag TEXT NOT NULL DEFAULT '',
  event_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hour_bucket, event_name, event_tag)
);
```

A nightly job (out of scope for this card) should `DELETE FROM
amicus_daily_user_fingerprints WHERE date < date('now','-2 day')` to
enforce the nightly-rotation guarantee.

## Weekly ops

```bash
# 1. Export D1 to a local SQLite file
wrangler d1 export amicus-gaps --output=_tools/amicus_analytics/cache/amicus-gaps.db

# 2. Render the report (optionally combines with the #1468 audit summary)
python3 _tools/amicus_analytics/weekly_report.py \
  --source _tools/amicus_analytics/cache/amicus-gaps.db \
  --week 2026-06-01 \
  --audit-summary _tools/amicus_audit/cache/2026-06-01.classified.json \
  > _tools/amicus_analytics/cache/report_2026-06-01.md
```

Paste the generated markdown into a GitHub discussion or the weekly
release-notes commit.
