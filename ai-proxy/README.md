# Amicus Proxy

Cloudflare Worker that sits between the Companion Study mobile client and the
AI providers (Anthropic for chat, OpenAI for embeddings). Ships with the rest
of the monorepo so the code that talks to the proxy and the code that runs
the proxy are versioned together.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/ai/health` | none | liveness probe — returns `{status, version}` |
| `POST` | `/ai/embed` | premium or partner_plus | OpenAI `text-embedding-3-small`, returns 1536-dim vector |
| `POST` | `/ai/chat` | premium or partner_plus | streaming Anthropic response with gap-signal detection |

## Responsibilities

1. **Auth.** Validates the RevenueCat receipt on the `Authorization: Bearer
   <receipt>` header. Cached in KV for 5 minutes per receipt.
2. **Rate limit.** Per-user monthly + 10-minute burst counters:
   `premium` → 300/month + 10/burst;
   `partner_plus` → 1500/month + 30/burst.
3. **Zero retention.** Sets `anthropic-no-retention: true` on every Anthropic
   request.
4. **Streaming pass-through.** Tees the Anthropic SSE stream to the client
   and also consumes it server-side to extract the structured `gap_signal`
   JSON envelope.
5. **Metadata-only logging.** Logs never contain request bodies, response
   text, retrieved chunks, or profile summaries. Only `user_hash`, endpoint,
   status, latency, and entitlement.

## Local development

```bash
cd ai-proxy
npm install
npm run dev          # starts wrangler dev on localhost:8787
```

In a second terminal:

```bash
# Health
curl -s http://localhost:8787/ai/health | jq

# Chat (401 — missing auth)
curl -i -X POST http://localhost:8787/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"query":"Hello?"}'
```

## Tests

```bash
npm test             # vitest run (no network)
npm run typecheck    # tsc --noEmit
```

The tests are self-contained — no real RevenueCat / Anthropic / OpenAI calls.
Auth and rate-limit suites use an in-memory KV stub; the Anthropic suite
intercepts `fetch` to assert on outbound headers and body shape.

## Secrets

Set these once per environment:

```bash
wrangler secret put REVENUECAT_SECRET_KEY --env staging
wrangler secret put ANTHROPIC_API_KEY     --env staging
wrangler secret put OPENAI_API_KEY        --env staging

# Production — only after staging is validated end-to-end
wrangler secret put REVENUECAT_SECRET_KEY --env production
wrangler secret put ANTHROPIC_API_KEY     --env production
wrangler secret put OPENAI_API_KEY        --env production
```

Never commit secrets to `wrangler.toml`. The committed file contains only
bindings and routes.

## Deploy

```bash
npm run deploy:staging      # wrangler deploy --env staging
npm run deploy:production   # wrangler deploy --env production
```

Staging publishes to `ai-staging.contentcompanionstudy.com`; production to
`ai.contentcompanionstudy.com`. Configure the KV namespace and D1 database
IDs in `wrangler.toml` before the first deploy.

## Rollback

Wrangler keeps a handful of historical deployments. To roll back:

```bash
wrangler deployments list --env production
wrangler rollback <deployment-id> --env production
```

If Cloudflare's dashboard access is faster, the "Deployments" tab on the
Worker page offers a one-click rollback.

## Corpus gap capture (#1471)

Three inputs flag a gap, any of which triggers D1 persistence:

1. Model self-report via the trailing `{"gap": true, ...}` JSON envelope.
2. Retrieval max score below `GAP_SIMILARITY_FLOOR` (0.55).
3. Explicit thumbs-down via `POST /ai/feedback`.

On capture:

- The question is SHA-PII-scrubbed (email, phone, URL, card) before storage.
- A scrubbed summary is produced by Haiku (`anthropic-no-retention: true`)
  for the GitHub issue body.
- The question is embedded once and compared against recent open gaps
  (cosine ≥ 0.9 → increment `occurrence_count` rather than insert).
- `DELETE /ai/gaps/:id` wipes the row (admin-gated; current gate is
  `partner_plus` entitlement + Cloudflare Access).

**Endpoints added:**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/ai/feedback` | Thumbs-down a response; body includes query + chunks + reason |
| DELETE | `/ai/gaps/:id` | Hard-redact a gap row |

**D1 schema:** `migrations/0001_corpus_gaps.sql`. Apply with:

```bash
wrangler d1 execute amicus-corpus-gaps-staging --file=migrations/0001_corpus_gaps.sql
wrangler d1 execute amicus-corpus-gaps         --file=migrations/0001_corpus_gaps.sql
```

**Config flag:** the `amicus_config` table stores `gap_sync_mode` =
`individual` | `digest`. Default `individual`; flip at ~20K users by
updating the row, no backend change needed.

**Sync to GitHub:** `_tools/corpus_gap_sync.py` (runs on a schedule) reads
`status='new'` rows, creates issues with label `corpus-gap` (the Partner
Gaps kanban swim lane), and marks rows `issue_opened`. In digest mode,
singletons roll up into a daily digest issue; clusters (≥3 occurrences)
still get dedicated issues.

## Relationship to other cards

- `#1447` produces the embeddings this proxy never directly touches; the
  client uses `#1451` retrieval before calling `/ai/chat`.
- `#1471` (this card) — full corpus-gap capture pipeline.
- `#1472` adds Partner+ upgrade flow, which leans on the `partner_plus`
  entitlement this proxy already recognizes.
