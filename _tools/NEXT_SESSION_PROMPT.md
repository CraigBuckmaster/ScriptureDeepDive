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

### Feature Roadmap (19 features)

The April 2026 strategy session produced a 19-feature roadmap in two tiers:

**Gap Closure (A1–A10)** — features competitors have that CS doesn't:
- A1. Full Lexicon Integration (Thayer/BDB) — #68
- A2. Cross-Device Sync — #65
- A3. Premium TTS — #66
- A4. Bible Dictionaries (Easton's) — #69
- A5. Greek & Hebrew Grammar Reference — #67
- A6. PDF Study Export
- A7. Verse Image Cards
- A8. Expand Gospel Harmony to ~220 pericopes — #97
- A9. Topical Index (topics.json + screens) — content in #50-55
- A10. Scholar Debate Mode — #56, #58, #59

**Blue Ocean (B1–B9)** — features no competitor has:
- B1. Study Coaching Mode (shipped in Phase 22)
- B2. Passage DNA Fingerprint — #98 (DONE)
- B3. Prayer Prompts — #99 (content), #100 (UI)
- B4. Chapter Difficulty Rating — #101 (DONE)
- B5. Study Session Replay — #102
- B6. Archaeological Evidence Layer — #103 (content), #104 (UI)
- B7. Hermeneutic Lens Switcher — #105
- B8. Time-Travel Reader — #106
- B9. AI "What Would [Scholar] Say?" — #107

Dev plans exist as GitHub issues for A1-A5, A8-A10 with session breakdowns.

### Pricing Strategy (Revised April 2026)

- **$4.99/mo · $39.99/yr · $149.99 lifetime**
- **ALL 54 scholars are FREE** — gate tools, not content
- All highlight colors FREE, difficult passage responses FREE
- Premium gates: interlinear, concordance, content library depth, cross-ref threading, prophecy chain detail, concept explorer depth, word study depth, cloud sync, premium TTS, PDF export
- Full spec: `_tools/PREMIUM_TIER_SPEC.md`

### Architecture Debt

| Batch | Description | Status |
|-------|-------------|--------|
| T6 | Theme legacy cleanup (remove static base export) | **DONE** |
| 7 | Inline style migration (298→153 instances) | **DONE** (top 13 files migrated) |
| 8A | Test foundation (111 suites, 711 tests) | **DONE** |
| 8B | CI/CD content pipeline (GitHub Actions) | **DONE** |
| 8C | Branch protection + PR workflow | Needs manual GitHub Settings config |

### Content Debt

| Debt | Scope |
|------|-------|
| Kings/Chronicles MacArthur enrichment | ~112 chapters |
| ~134 Psalms without timeline links | No natural narrative anchors |
| Thin panel enrichment (Batch 6) | ~259 panels |
| Study coaching content backfill | 0/1,189 chapters have coaching data |

### Recently Completed

| Item | Date | Scope |
|------|------|-------|
| **Passage DNA Fingerprint (#98)** | April 2026 | useChapterFingerprint hook + ChapterFingerprint SVG bar chart in ChapterScreen |
| **Chapter Difficulty Rating (#101)** | April 2026 | Percentile-based scoring in build_sqlite.py + DifficultyBadge in ChapterListScreen |
| **Inline style migration (#92)** | April 2026 | 13 files, 145 inline styles → StyleSheet.create() |
| **Content pipeline CI (#96)** | April 2026 | content-pipeline.yml validates JSON + builds SQLite on PRs |
| **Tree polish Phase 2 (#91)** | April 2026 | Link glow trails, round caps, dashed spouse connectors |
| **Theme T6 cleanup (#89)** | April 2026 | Removed static base export, all files use useTheme() hook |
| **Topics FTS fix** | April 2026 | Changed topics_fts to contentless FTS (`content=''`) |

---

## What's Next

### If doing feature code
Read the full dev plan in the GitHub issue body. Key features ready for development:
- **#56 Scholar Debate Mode** (3 sessions — #58, #59 are session 2 & 3)
- **#69 Bible Dictionaries** (Easton's ~3,900 entries)
- **#68 Full Lexicon Integration** (Thayer/BDB, premium)
- **#100 Prayer Prompt Card UI** (depends on #99 content existing)

### If doing content work
- **#99** — Prayer prompt content for 66 book ch1s
- **#97** — Expand Gospel Harmony from 91 to ~220 pericopes
- **#94** — Kings/Chronicles MacArthur enrichment
- **#60-64** — Debate enrichment batches (5 batches, ~200 topics total)
- **#51-53** — Topical index content batches

### If doing architecture
- **Inline style migration** — 153 instances remain across smaller files
- **#93 Branch protection** — needs manual GitHub Settings configuration (see issue comment for steps)

### Blocked / Deferred
- **#86/#87** — Premium store infrastructure (P1/P2) — blocked on translation licensing (#88)
- **#105-107** — Blue ocean features — deferred, depend on other infrastructure
- **#65** — Cross-device sync — depends on premium infrastructure

---

## Key Files

| File | Purpose |
|------|---------|
| `_tools/PREMIUM_TIER_SPEC.md` | Premium tier pricing ($149.99 lifetime), gating strategy, wireframes |
| `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Active phases (24, P1, P2) + completed phase summary |
| `_tools/COMPLETED_PHASES_REFERENCE.md` | Data shapes for all shipped phases (0–23) |
| `_tools/CONTENT_LIBRARY_ENRICHMENT_PLAN.md` | Phase 24E: 9 enrichment batches with copyright guardrails |
| `_tools/SYNC_ARCHITECTURE.md` | User accounts & cloud sync architecture (predates the full plan in #65) |
| `_tools/ARCH_PLAN.md` | Architecture batches 7, 8A-C (remaining) |
| `_tools/THEME_PLAN.md` | Theme architecture reference |
| `_tools/DEV_GUIDE.md` | Conventions, pipeline, content standards |
| `_tools/db_version.json` | Single source of truth for DB version |
| `content/meta/topics.json` | Topical index content (41 entries, growing) |

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
