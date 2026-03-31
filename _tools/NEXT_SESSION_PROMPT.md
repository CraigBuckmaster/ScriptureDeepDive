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
| 19-23 | See `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Planned |

### Content Remediation

Batches 0–5 complete (word study bugfix, scholar bios, ghost panels, people enrichment, parallel passages, new word studies). Difficult Passages enrichment 15A-E all complete — 53/53 passages fully enriched with 243 responses across 35+ scholars, no scholar >10%.

| Batch | Description | Status |
|-------|-------------|--------|
| 6 | Thin panel enrichment (~259 panels) | Planned |

---

## What's Next

1. **Deep Study Features Phase 19+20** — Highlight UX Polish + Recommendations — Session N
2. **Thin Panel Enrichment** (~259 panels) — 138 section panels (mostly thin cross-refs in Chronicles/Nehemiah/Esther) + 121 chapter panels (mostly thin ppl/rec in prophets)
3. **Inline Style Migration** (Arch Batch 7) — 318 inline `style={{ }}` objects, migrate to `StyleSheet.create()`
4. **Cross-reference thread expansion** (Batch 13)
5. **Map story enhancements** (Batch 14)
6. **Isaiah 23-66 enrichment debt** (44 chapters, thin panels)
7. **Kings/Chronicles MacArthur enrichment debt** (112 chapters)
8. **Test foundation → CI/CD → branch protection** (Arch 8A-C)

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
