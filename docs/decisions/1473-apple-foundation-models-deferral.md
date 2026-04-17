# 1473 · Apple Foundation Models evaluation — deferral record

**Status:** Deferred (not in v1)
**Decision date:** 2026-04-17
**Trigger to revisit:** Cloud AI spend exceeds **$5K/month** for three consecutive months OR a material Anthropic pricing change.

## Context

Epic #1446 (Amicus — AI Study Partner v1) uses Anthropic Claude — Haiku for short responses, Sonnet for depth and for Partner+ users. The card #1473 asks whether a fraction of queries could be answered on-device by **Apple Foundation Models** (iOS 18+, Apple Silicon) to reduce cloud spend.

We are **deferring** this work. The card's own language makes it clear: *"premature optimization before usage data is real"*. We won't know which queries fit the simple-query profile until the audit-sample pipeline (#1468) and aggregate analytics (#1469) have several months of production traffic to chew on.

## Scope of this record

- Document the trigger condition so it is visible without needing to dig through the issue tracker.
- Codify a **feasibility checklist** that the engineer picking this up later can run without re-reading the whole epic.
- Ship a minimal, inert scaffold in the client so when the trigger is hit we are extending existing code, not re-architecting — specifically, a `queryRouting` module whose public API can stay unchanged while an implementation swaps.

## Non-goals

- Shipping any actual Apple Foundation Models routing.
- Evaluating Gemini Nano. That's a separate card once Android coverage warrants.
- Training our own fine-tuned model. Sovereignty already lives behind the AI proxy; the proxy pattern gives the portability we'd need.

## Feasibility checklist (for the engineer picking this up later)

Run these in order before writing any code:

1. **iOS 18+ share** — query the analytics (#1469) for User-Agent header distribution. Go/no-go threshold: **≥40%** of Amicus requests come from iOS 18+.
2. **API surface stability** — confirm the Foundation Models API has not been deprecated or substantially reshaped since iOS 18.
3. **Quality benchmarks** — pull 200 representative samples from `amicus_response_samples` (spread across gap-signal, user-feedback, and random_1pct pools). Run each through Apple FM and compare to the original Haiku response via the #1468 classifier. Accept only if the Apple FM `needs_review` rate is within **5% absolute** of the Haiku rate.
4. **Latency** — measure on an iPhone 15 Pro (median of 50 runs). Accept only if median < 500ms; reject if p95 > 1200ms.
5. **Citation integrity** — Apple FM must not hallucinate chunk_ids. This is the single highest-risk failure mode. Reject the eval if `check_every_citation_has_valid_chunk_id` fails more than 1% of samples.

If all five pass, proceed to the shadow-comparison rollout described in the issue.

## Decision

Stop here until the trigger fires. The inert scaffold below keeps the option open without committing any new complexity to the running app.

## Scaffold shipped with this record

`app/src/services/amicus/queryRouting.ts` — a pure client-side helper that classifies a query as `simple` or `complex` per the rules in card #1473:

- `simple` = ≤2 retrieved chunks AND no multi-turn context AND query < 100 tokens.
- `complex` = everything else.

Today the router unconditionally returns `'cloud'`. When the trigger fires, a future PR adds an `'apple_fm'` return path behind a capability check — without changing any call site. Tests fix the classification boundaries so future refactors stay inside the documented spec.

## Rollback plan

If the feature ever ships and needs to be pulled back: the router is a single branch. Setting the capability check to `false` reverts 100% of traffic to the cloud path without a code change.
