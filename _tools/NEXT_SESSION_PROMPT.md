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
| [#50](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/50) | Theology + End Times topics (~41 entries) | **DONE** (In Review) |
| [#51](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/51) | Character + Sin + Identity topics (~57 entries) | **DONE** |
| [#52](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/52) | Relationships + Worship + Church topics (~55 entries) | Backlog — **NEXT** |
| [#53](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/53) | Christian Living + Creation topics (~40 entries) | Backlog |
| [#54](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/54) | validate_sqlite.py topics count validation | Backlog |
| [#55](https://github.com/CraigBuckmaster/ScriptureDeepDive/issues/55) | Auto-generate relevant_chapters_json from theme panel data | Backlog |

### Topical Index Content Status

`content/meta/topics.json` exists with **41 topics** (27 theology + 14 eschatology, 343 KJV verses). No DB table or UI infrastructure yet — the A9 screens/hooks/components have not been built. Content generation is proceeding ahead of infrastructure.

**Next content story (#51)** adds ~60 entries across Character, Sin, and Identity categories. Read the issue body for the full topic list and format spec.

### Other Active Work

| Item | Status |
|------|--------|
| Phase 24 — Content Library screen | In progress (Claude Code) |
| Phase 24E — Content Library enrichment | **COMPLETE** (269 entries) |

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
| Kings/Chronicles MacArthur enrichment | ~112 chapters |
| ~134 Psalms without timeline links | No natural narrative anchors |
| Thin panel enrichment (Batch 6) | ~259 panels |

### Recently Completed

| Item | Date | Scope |
|------|------|-------|
| **Topical Index: Theology + Eschatology** | April 2026 | 41 topics, 109 subtopics, 343 KJV verses in `topics.json` |
| **Feature plans created** | April 2026 | Premium TTS, Cross-Device Sync, Scholar Debate Mode — full dev plans in GitHub issues |
| **Kanban board integrated** | April 2026 | All feature plans + content stories on Companion Study Kanban with status/priority/size |
| **Isaiah fully enriched** | April 2026 | All 66 chapters, 132 sections, 756 section panels |
| **Psalms 116-150 enrichment** | April 2026 | 35 psalms, 70 sections — cross + hist panels added |

---

## What's Next

**If doing content work:** Pick up **#51** (Character + Sin + Identity topics, ~60 entries). Move it to In Progress on the kanban, generate topics into `content/meta/topics.json` (append to existing 41), commit, push, move to In Review. Then #52, #53.

**If doing feature code:** Read the full dev plan in the issue body for whichever feature is being started (#56 Scholar Debate Mode, #65 Cross-Device Sync, or #66 Premium TTS). Move the issue to In Progress. Follow the session breakdown in the plan.

**If doing architecture:** Batch 8B (CI/CD via GitHub Actions) or Batch 7 (inline styles, 277 remaining).

---

## Key Files

| File | Purpose |
|------|---------|
| `content/meta/topics.json` | Topical index content (41 entries, growing) |
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

DB version: 0.51 · 54 scholars · 3 translations (NIV, ESV, KJV) · 444K interlinear words · 269 content library entries

**Note:** scripture.db is ~107MB (interlinear data). Rebuild locally before deploy.

---

## Kanban Workflow for Claude

When picking up work:
1. Read the issue body for full context
2. Move the issue to **In Progress** via GraphQL mutation
3. Do the work
4. Commit with `Closes #N` in the message
5. Move to **In Review**, post a completion comment, close the issue
