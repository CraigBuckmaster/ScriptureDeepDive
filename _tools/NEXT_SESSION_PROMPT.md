# Companion Study — Session Handoff

## Repository Access

```
git clone https://CraigBuckmaster:{YOUR_TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
```

**Git config required:**
```bash
git config user.email "craig@companionstudy.app"
git config user.name "Craig Buckmaster"
```

---

## Current State

All 66 books live. All 23 deep study feature phases shipped. Theme system (Dark/Sepia/Light/System) live across all files.

### Active Work

| Item | Status |
|------|--------|
| Phase 24 — Content Library screen | **In progress** (Claude Code building pipeline + screen) |
| Phase 24E — Content Library enrichment | Seed data committed (128 entries: 16 chiasms, 19 ANE, 26 echoes, 10 manuscripts, 57 discourse). 9 batches planned to reach ~270. See `_tools/CONTENT_LIBRARY_ENRICHMENT_PLAN.md` |

### Remaining Feature Work

| Item | Description | Blocked by |
|------|-------------|------------|
| Phase P1 | Premium store (RevenueCat, UpgradePrompt, SubscriptionScreen) | Translation licensing |
| Phase P2 | Gate wiring (scholar locks, feature gates, explore depth) | Phase P1 |
| Phase 15 | AI-Powered Q&A | DEFERRED |

### Architecture Debt

| Batch | Description | Status |
|-------|-------------|--------|
| T6 | Theme legacy cleanup (remove static base export) | Planned |
| 7 | Inline style migration (~318 instances) | Planned |
| 8A-C | Test foundation → CI/CD → branch protection | Planned (sequential) |

### Content Debt

| Debt | Scope |
|------|-------|
| Isaiah 23–66 thin panels | 44 chapters |
| Kings/Chronicles MacArthur enrichment | ~112 chapters |
| ~134 Psalms without timeline links | No natural narrative anchors |
| Thin panel enrichment (Batch 6) | ~259 panels |

---

## What's Next

**If doing code work (Claude Code):** Phase 24 — Content Library. See `_tools/DEEP_STUDY_FEATURES_PLAN.md`.

**If doing content work:** Phase 24E enrichment batches. See `_tools/CONTENT_LIBRARY_ENRICHMENT_PLAN.md`. Start with Batch 1 (chiasms: Psalms + OT narrative).

**If doing architecture:** Theme Batch T6 (small) or Arch Batch 7 (inline styles, medium).

---

## Key Files

| File | Purpose |
|------|---------|
| `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Active phases (24, P1, P2) + completed phase summary |
| `_tools/COMPLETED_PHASES_REFERENCE.md` | Data shapes for all shipped phases (0–23) |
| `_tools/CONTENT_LIBRARY_ENRICHMENT_PLAN.md` | Phase 24E: 9 enrichment batches with copyright guardrails |
| `_tools/ARCH_PLAN.md` | Architecture batches 7, 8A-C (remaining) |
| `_tools/THEME_PLAN.md` | Theme architecture reference + T6 remaining |
| `_tools/PREMIUM_TIER_SPEC.md` | Premium tier pricing, gating, wireframes |
| `_tools/SYNC_ARCHITECTURE.md` | User accounts & cloud sync architecture |
| `_tools/DEV_GUIDE.md` | Conventions, pipeline, content standards |
| `_tools/db_version.json` | Single source of truth for DB version |

---

## Deploy

```bash
python3 _tools/build_sqlite.py
cp scripture.db app/assets/scripture.db
git add -A && git commit -m "..." && git push
cd app && eas update --branch production
```

DB version: 0.32 · 54 scholars · 3 translations (NIV, ESV, KJV) · 444K interlinear words · 128 content library entries

**Note:** scripture.db is ~107MB (interlinear data). Rebuild locally before deploy.
