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

All books are live. Content work is enrichment, accuracy auditing, and feature development only.

### Architecture Remediation

Batches 1–6 complete (ghost deps, git history purge, DB version externalization, type safety, content layer decomposition, NotesOverlay decomposition).

| Batch | Description | Status |
|-------|-------------|--------|
| 7 | Inline style migration | Planned |
| 8A-C | Test foundation, CI/CD, branch protection | Planned |

### Feature Work Complete

Prophecy chains (50 chains, 283 links, browse + detail screens) · Enhanced notes (3-tab AllNotes, collections, FTS) · Discourse panels (Romans 1-16) · Concept Explorer (20 concepts) · Difficult Passages (53 entries, all enriched, browse + detail screens) · Word Studies (43 studies) · Timeline system (543 entries, 87% chapter deep-link coverage, full UI)

### Deep Study Features (In Progress)

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Chapter panel button categorization (3 groups) | **Complete** |
| 1 | TabbedPanelRenderer composite infrastructure | **Complete** |
| 2 | Context Hub (hist+ctx merge → tabbed composite) | **Complete** |
| 3 | Connections Hub (cross → tabbed with echoes slot) | **Complete** |
| 4 | Literary Structure upgrade (chiasm view) | **Complete** |
| 5 | Genre Guidance Banner | **Complete** |
| 6 | Depth Indicator Dots | **Complete** |
| 7 | Study Coach Mode | **Complete** |
| 8 | Textual Notes Enrichment (tx panel upgrade) | **Complete** |
| 9 | Progressive Revelation (Concept Journey) | **Complete** |
| 10 | Synoptic Diff Highlighting (ParallelPassage upgrade) | **Complete** |
| 11 | Verse Sharing & Copy (VerseLongPressMenu + VOTD share) | **Complete** |
| 16 | Reading Streaks & Engagement Hooks | **Complete** |
| 12 | Multi-Translation Support (KJV added, TranslationPicker) | **Complete** |
| 13 | Interlinear Viewer (444K words, Hebrew + Greek) | **Complete** |
| 14 | User Accounts & Cloud Sync (architecture doc) | **Complete** |
| 17 | TTS Controls Integration | **Complete** |
| 18 | Search Filters (OT/NT/Book) | **Complete** |
| 19 | Highlight UX Polish (6 colors, collections, migration 5) | **Complete** |
| 20 | Personalized Recommendations (heuristic engine) | **Complete** |
| 21 | Concordance Search (Strong's number lookup) | **Complete** |
| 22 | Discourse Expansion (Gal, Eph, Heb, 1Cor — 41 chapters) | **Complete** |
| 23 | Curated Reading Plans (10 plans seeded via migration 6) | **Complete** |

### Content Remediation

Batches 0–5 complete (word study bugfix, scholar bios, ghost panels, people enrichment, parallel passages, new word studies). Difficult Passages enrichment 15A-E all complete — 53/53 passages fully enriched with 243 responses across 35+ scholars, no scholar >10%.

| Batch | Description | Status |
|-------|-------------|--------|
| 6 | Thin panel enrichment (~259 panels) | Planned |

---

### Theme System

| Batch | Description | Status |
|-------|-------------|--------|
| T1 | Infrastructure (provider, hook, palettes, transforms) | **Complete** |
| T2 | Navigation + chrome migration (~8 files) | **Complete** |
| T3 | Screens migration (~30 files) | **Complete** |
| T4 | Components migration (~82 files) | **Complete** |
| T5 | Settings UI (ThemePicker) | **Complete** |
| T6 | Legacy cleanup | Planned |

**T1–T5 complete.** Full theme system is live. All 128+ files migrated to `useTheme()`. ThemePicker in Settings allows switching between Dark/Sepia/Light/System. Next: T6 (remove legacy static `base` export, internalize `colors.ts`).

---

## What's Next

1. **Deep Study Features Phase 22** — Discourse Analysis Expansion (Galatians, Ephesians, Hebrews, 1 Corinthians)
2. **Theme Batch T6** — Legacy cleanup (remove static base export, internalize colors.ts)
3. **Thin Panel Enrichment** (~259 panels) — 138 section panels (mostly thin cross-refs in Chronicles/Nehemiah/Esther) + 121 chapter panels (mostly thin ppl/rec in prophets)
4. **Inline Style Migration** (Arch Batch 7) — 318 inline `style={{ }}` objects, migrate to `StyleSheet.create()`
5. **Cross-reference thread expansion** (Batch 13)
6. **Map story enhancements** (Batch 14)
7. **Isaiah 23-66 enrichment debt** (44 chapters, thin panels)
8. **Kings/Chronicles MacArthur enrichment debt** (112 chapters)
9. **Test foundation → CI/CD → branch protection** (Arch 8A-C)

---

## Standing Enrichment Debt

- Isaiah 23-66 (44 chapters) — thin panels
- Kings/Chronicles MacArthur panels (112 chapters)
- ~134 Psalms without timeline links (no natural narrative anchors)

---

## Key Files

| File | Purpose |
|------|---------|
| `_tools/ARCH_PLAN.md` | Full architectural remediation plan |
| `_tools/DEV_GUIDE.md` | Conventions, pipeline, content standards, gotchas |
| `_tools/db_version.json` | Single source of truth for DB version |
| `_tools/build_sqlite.py` | JSON→SQLite compiler |
| `content/meta/difficult-passages.json` | Difficult passages source of truth |

---

## Deploy

```bash
python3 _tools/build_sqlite.py
cp scripture.db app/assets/scripture.db
git add -A && git commit -m "..." && git push
cd app && eas update --branch production
```

DB version: 0.32 · 54 scholars · 3 translations (NIV, ESV, KJV) · 444K interlinear words

**Note:** scripture.db is now ~107MB (interlinear data). DB files excluded from git (exceed 100MB limit). Rebuild locally before deploy: `python _tools/build_sqlite.py && cp scripture.db app/assets/scripture.db`
