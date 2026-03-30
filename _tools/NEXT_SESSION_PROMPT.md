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

Batches 1–5 complete (ghost deps, git history purge, DB version externalization, type safety, content layer decomposition).

| Batch | Description | Status |
|-------|-------------|--------|
| 6 | NotesOverlay decomposition | Planned |
| 7 | Inline style migration | Planned |
| 8A-C | Test foundation, CI/CD, branch protection | Planned |

### Feature Work Complete

Prophecy chains (50 chains, 283 links, browse + detail screens) · Enhanced notes (3-tab AllNotes, collections, FTS) · Discourse panels (Romans 1-16) · Concept Explorer (20 concepts) · Difficult Passages (53 entries, all enriched, browse + detail screens) · Word Studies (43 studies) · Timeline system (543 entries, 87% chapter deep-link coverage, full UI)

### Content Remediation

Batches 0–5 complete (word study bugfix, scholar bios, ghost panels, people enrichment, parallel passages, new word studies). Difficult Passages enrichment 15A-E all complete — 53/53 passages fully enriched with 243 responses across 35+ scholars, no scholar >10%.

| Batch | Description | Status |
|-------|-------------|--------|
| 6 | Thin panel enrichment (~259 panels) | Planned |

---

## What's Next

1. **Thin Panel Enrichment** (~259 panels) — 138 section panels (mostly thin cross-refs in Chronicles/Nehemiah/Esther) + 121 chapter panels (mostly thin ppl/rec in prophets)
2. **NotesOverlay Decomposition** — see `_tools/ARCH_PLAN.md`
3. **Cross-reference thread expansion** (Batch 13)
4. **Map story enhancements** (Batch 14)
5. **Isaiah 23-66 enrichment debt** (44 chapters, thin panels)
6. **Kings/Chronicles MacArthur enrichment debt** (112 chapters)
7. **Test foundation → CI/CD → branch protection** (Arch 8A-C)

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

DB version: 0.20 · 54 scholars
