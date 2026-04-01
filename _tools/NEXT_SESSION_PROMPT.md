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
| Phase 24E — Content Library enrichment | **COMPLETE** (269 entries: 39 chiasms, 46 ANE, 65 echoes, 18 manuscripts, 101 discourse). All 9 batches shipped. |

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
| 7 | Inline style migration (~277 instances) | Planned |
| 8A | Test foundation (111 suites, 711 tests) | **COMPLETE** |
| 8B | CI/CD pipeline (GitHub Actions) | Planned |
| 8C | Branch protection + PR workflow | Planned |

### Content Debt

| Debt | Scope |
|------|-------|
| **Isaiah 23–35 thin panels** | 13 chapters, 26 sections (oracles against nations) |
| Kings/Chronicles MacArthur enrichment | ~112 chapters |
| ~134 Psalms without timeline links | No natural narrative anchors |
| Thin panel enrichment (Batch 6) | ~259 panels |

### Recently Completed

| Item | Date | Scope |
|------|------|-------|
| **Psalms 116-150 enrichment** | April 2026 | 35 psalms, 70 sections — cross + hist panels added |

---

## Isaiah Enrichment Status

**Completed:**
- Isaiah 1-22: Full panel coverage (heb, cross, hist, mac, calvin, net, oswalt, childs)
- Isaiah 36-66: cross + hist panels added (April 2026)

**Remaining:**
- Isaiah 23-35 (Oracles Against Nations): 13 chapters, 26 sections — only has heb + mac
- Need: cross, hist, oswalt, childs panels

**Panel priority for remaining chapters:**
1. `cross` — NT connections
2. `hist` — ANE context, historical background
3. `oswalt` + `childs` — major Isaiah commentators

---

## What's Next

**If doing content work:** Isaiah 23-35 (Oracles Against Nations) still needs cross + hist panels — 13 chapters, 26 sections. Use standard enrichment script pattern.

**If doing code work (Claude Code):** Phase 24 — Content Library screen. See `_tools/DEEP_STUDY_FEATURES_PLAN.md`.

**If doing architecture:** Batch 8A (tests) is COMPLETE (711 tests passing). Next: Batch 8B (CI/CD via GitHub Actions) or Batch 7 (inline styles, 277 remaining).

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

DB version: 0.51 · 54 scholars · 3 translations (NIV, ESV, KJV) · 444K interlinear words · 269 content library entries

**Note:** scripture.db is ~107MB (interlinear data). Rebuild locally before deploy.
