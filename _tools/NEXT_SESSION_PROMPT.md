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

## GitHub Project Board

The **Companion Study Kanban** is the source of truth for work items. Access via GitHub Projects V2 (GraphQL API).

**Project ID:** `PVT_kwHOAQG2984BTkG9`
**Columns:** Backlog → Ready → In progress → In review → Done
**Fields:** Status, Priority (P0/P1/P2), Size (XS/S/M/L/XL)

Token needs `repo` + `read:project` + `write:project` scopes to manage the board.

### Board Field IDs (for GraphQL mutations)

| Field | ID | Options |
|-------|----|---------|
| Status | `PVTSSF_lAHOAQG2984BTkG9zhAyQPM` | Backlog=`f75ad846`, Ready=`61e4505c`, In progress=`47fc9ee4`, In review=`df73e18b`, Done=`98236657` |
| Priority | `PVTSSF_lAHOAQG2984BTkG9zhAyRLc` | P0=`79628723`, P1=`0a877460`, P2=`da944a9c` |
| Size | `PVTSSF_lAHOAQG2984BTkG9zhAyRLg` | XS=`6c6483d2`, S=`f784b110`, M=`7515a9f1`, L=`817d0097`, XL=`db339eb2` |

---

## Current State

All 66 books live. All 23 deep study feature phases shipped. Theme system (Dark/Sepia/Light/System) live across all files.

### Kanban — Active Feature Plans (Backlog)

| Issue | Feature | Status | Priority | Size |
|-------|---------|--------|----------|------|
| [#56](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/56) | Scholar Debate Mode | Backlog | P1 | L |
| [#65](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/65) | Cross-Device Sync (A7) | Backlog | P1 | XL |
| [#66](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/66) | Premium TTS | Backlog | P1 | L |
| [#67](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/67) | Greek & Hebrew Grammar Reference (A10) | Backlog | P2 | L |

Each issue contains a **complete dev plan** with session breakdowns, file inventories, schemas, and test plans. Read the issue body before starting work.

### Kanban — Content Generation Stories (Backlog)

| Issue | Task | Status |
|-------|------|--------|
| [#50](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/50) | Theology + End Times topics (~41 entries) | **DONE** |
| [#51](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/51) | Character + Sin + Identity topics (~57 entries) | **DONE** |
| [#52](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/52) | Relationships + Worship + Church topics (~52 entries) | **DONE** |
| [#53](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/53) | Christian Living + Creation topics (~37 entries) | **DONE** |

### Topical Index Content Status

`content/meta/topics.json` has **197 topics** across 10 categories (theology: 28, eschatology: 14, character: 25, sin: 20, identity: 15, relationships: 20, worship: 15, church: 20, living: 30, creation: 10). All four content stories (#50–#53) are **COMPLETE**. No DB table or UI infrastructure yet — the A9 screens/hooks/components have not been built.

**Next topical index work:** A9 UI infrastructure (screens, hooks, components for browsing the 197 topics in-app).

### Other Active Work

| Item | Issue | Status |
|------|-------|--------|
| Phase 24 — Content Library screen | [#109](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/109) | In progress (Claude Code) |
| Phase 24E — Content Library enrichment | — | **COMPLETE** (269 entries) |

### Remaining Feature Work

| Item | Issue | Description | Blocked by |
|------|-------|-------------|------------|
| Phase P1 | [#86](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/86) | Premium store (RevenueCat, UpgradePrompt, SubscriptionScreen) | Translation licensing ([#88](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/88)) |
| Phase P2 | [#87](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/87) | Gate wiring (scholar locks, feature gates, explore depth) | Phase P1 |
| Phase 15 | [#113](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/113) | AI-Powered Q&A | DEFERRED |

### Architecture Debt

| Batch | Issue | Description | Status |
|-------|-------|-------------|--------|
| T6 | [#110](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/110) | Theme legacy cleanup (remove static base export) | Backlog |
| 7 | [#111](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/111) | Inline style migration (~277 instances) | Backlog |
| 8A | — | Test foundation (111 suites, 711 tests) | **COMPLETE** |
| 8B | [#112](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/112) | CI/CD pipeline (GitHub Actions) | Backlog |
| 8C | [#93](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/93) | Branch protection + PR workflow | Backlog |

### Content Debt

| Debt | Issue | Scope |
|------|-------|-------|
| Kings/Chronicles MacArthur enrichment | [#94](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/94) | ~112 chapters |
| Psalms without timeline links | [#114](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/114) | ~134 chapters, no natural narrative anchors |
| Thin panel enrichment (Batch 6) | [#115](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/115) | ~259 panels |

### Recently Completed

| Item | Date | Scope |
|------|------|-------|
| **Topical Index: Christian Living + Creation** | April 2026 | 37 topics (28 living, 9 creation), cumulative 197 topics — all 4 content stories complete |
| **Topical Index: Relationships + Worship + Church** | April 2026 | 52 topics, 19+14+19 per category, cumulative 160 topics |
| **Topical Index: Character + Sin + Identity** | April 2026 | 57 topics, 24+19+14 per category, fixed topics_fts bug |
| **Topical Index: Theology + Eschatology** | April 2026 | 41 topics, 109 subtopics, 343 KJV verses in `topics.json` |
| **Feature plans created** | April 2026 | Premium TTS, Cross-Device Sync, Scholar Debate Mode — full dev plans in GitHub issues |
| **Kanban board integrated** | April 2026 | All feature plans + content stories on Companion Study Kanban with status/priority/size |
| **Isaiah fully enriched** | April 2026 | All 66 chapters, 132 sections, 756 section panels |
| **Psalms 116-150 enrichment** | April 2026 | 35 psalms, 70 sections — cross + hist panels added |

---

## What's Next

**If doing content work:** All four topical index content stories (#50–#53) are complete. Remaining content debt is tracked: #94 (Kings/Chronicles MacArthur, ~112ch), #114 (Psalms timeline links, ~134ch), #115 (thin panel enrichment Batch 6, ~259 panels).

**If doing feature code:** Read the full dev plan in the issue body for whichever feature is being started (#56 Scholar Debate Mode, #65 Cross-Device Sync, or #66 Premium TTS). Move the issue to In Progress. Follow the session breakdown in the plan.

**If doing architecture:** #112 (Batch 8B — CI/CD via GitHub Actions), #111 (Batch 7 — inline styles, ~277 remaining), or #110 (T6 — theme legacy cleanup).

---

## Key Files

| File | Purpose |
|------|---------|
| `content/meta/topics.json` | Topical index content (197 entries, all 4 stories complete) |
| `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Active phases (24, P1, P2) + completed phase summary |
| `_tools/COMPLETED_PHASES_REFERENCE.md` | Data shapes for all shipped phases (0–23) |
| `_tools/CONTENT_LIBRARY_ENRICHMENT_PLAN.md` | Phase 24E: 9 enrichment batches with copyright guardrails |
| `_tools/SYNC_ARCHITECTURE.md` | User accounts & cloud sync architecture (predates the full plan in #65) |
| `_tools/ARCH_PLAN.md` | Architecture batches 7, 8A-C (remaining) |
| `_tools/THEME_PLAN.md` | Theme architecture reference + T6 remaining |
| `_tools/PREMIUM_TIER_SPEC.md` | Premium tier pricing, gating, wireframes |
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

DB version: 0.73 · 54 scholars · 3 translations (NIV, ESV, KJV) · 444K interlinear words · 269 content library entries · 197 topical index entries

**Note:** scripture.db is ~107MB (interlinear data). Rebuild locally before deploy.

---

## Kanban Workflow for Claude

When picking up work:
1. Read the issue body for full context
2. Move the issue to **In Progress** via GraphQL mutation
3. Do the work
4. Commit with `Closes #N` in the message
5. Move to **In Review**, post a completion comment, close the issue
