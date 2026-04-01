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
| 7 | Inline style migration (~318 instances) | Planned |
| 8A-C | Test foundation → CI/CD → branch protection | Planned (sequential) |

### Content Debt

| Debt | Scope |
|------|-------|
| **Isaiah 23–66 thin panels** | 44 chapters, 88 sections (see plan below) |
| Kings/Chronicles MacArthur enrichment | ~112 chapters |
| ~134 Psalms without timeline links | No natural narrative anchors |
| Thin panel enrichment (Batch 6) | ~259 panels |

---

## Isaiah 23–66 Enrichment Plan

**Problem:** Isaiah 1-22 has full panel coverage (heb, cross, hist, mac, calvin, net, oswalt, childs). Isaiah 23-66 only has heb + mac. Missing 6 panel types across 88 sections = 528 panels to write.

**Breakdown by theological section:**

| Section | Chapters | Sections | Priority |
|---------|----------|----------|----------|
| Oracles against nations | 23-35 | 26 | Medium |
| Historical (Hezekiah) | 36-39 | 8 | Low (narrative, less commentary-heavy) |
| **Book of Comfort** | **40-55** | **32** | **HIGH** (Servant Songs, most NT-quoted) |
| Restoration | 56-66 | 22 | Medium |

**Recommended execution order:**

1. **Isaiah 40-55 first** — Servant Songs (42, 49, 50, 52-53), "Comfort my people," Cyrus oracles. Most theologically impactful, most NT cross-references.
2. **Isaiah 56-66 second** — Restoration themes, eschatological hope.
3. **Isaiah 23-35 third** — Oracles against nations (Tyre, Egypt, Babylon, etc.).
4. **Isaiah 36-39 last** — Historical narrative (parallels 2 Kings 18-20).

**Panel priority within each batch:**
1. `cross` — NT connections (critical for Servant Songs)
2. `hist` — exile context, historical background
3. `oswalt` + `childs` — major Isaiah commentators
4. `calvin` + `net` — supplementary

**Per-session scope:** ~32 sections with cross + hist = 64 panels. Or ~16 sections with all 6 panel types = 96 panels.

---

## What's Next

**If doing content work (Isaiah enrichment):** Start with Isaiah 40-55 (Book of Comfort). Add cross + hist panels to 32 sections. See Isaiah Enrichment Plan above. Use standard enrichment script pattern: write generator to /tmp/, run, build, validate, commit, push.

**If doing code work (Claude Code):** Phase 24 — Content Library screen. See `_tools/DEEP_STUDY_FEATURES_PLAN.md`.

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

DB version: 0.51 · 54 scholars · 3 translations (NIV, ESV, KJV) · 444K interlinear words · 269 content library entries

**Note:** scripture.db is ~107MB (interlinear data). Rebuild locally before deploy.
