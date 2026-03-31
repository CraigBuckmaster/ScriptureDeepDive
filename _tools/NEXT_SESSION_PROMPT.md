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
| 8 | Textual Notes Enrichment (tx panel upgrade) | Planned |
| 9 | Progressive Revelation (Concept Journey) | **Complete** |
| 10-23 | See `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Planned |

### Content Remediation

Batches 0–5 complete (word study bugfix, scholar bios, ghost panels, people enrichment, parallel passages, new word studies). Difficult Passages enrichment 15A-E all complete — 53/53 passages fully enriched with 243 responses across 35+ scholars, no scholar >10%.

| Batch | Description | Status |
|-------|-------------|--------|
| 6 | Thin panel enrichment (~259 panels) | Planned |

---

## What's Next

1. **Deep Study Features Phase 8 + 10** — Textual Notes Enrichment + Synoptic Diff Highlighting (remaining Session F phases)
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

DB version: 0.25 · 54 scholars
