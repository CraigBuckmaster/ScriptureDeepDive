#!/usr/bin/env python3
"""
audit_emitters.py — Output formatters for coverage_auditor.py (#1628).

Split from coverage_auditor.py for readability. Contains the Markdown
report builder and per-book issue-body generator. JSON output is inlined
in coverage_auditor.AuditReport.to_json because it's a trivial dataclass
dump.

Public API:
    render_markdown(report, book_order) -> str
    render_issue_bodies(report, book_order, book_meta) -> dict[book_id, body_md]
    render_template_candidates(panel_key, clusters) -> str

See parent epic #1625 for the full plan and rubric definitions.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from typing import Iterable

TIER_EMOJI = {
    "deficient": "🔴",
    "thin": "🟡",
    "adequate": "🟢",
    "rich": "✨",
}


# ─── Markdown report ────────────────────────────────────────────────

def render_markdown(report, book_order: list[str]) -> str:
    """Produce the full Markdown audit report."""
    lines: list[str] = []
    lines.append(f"# Content Coverage Audit — {report.generated_at}")
    lines.append("")
    lines.append("## Cover Note")
    lines.append("")
    lines.append("_(authored in A4; leave this section for the A4 tracking issue.)_")
    lines.append("")
    lines.append(_executive_summary_md(report))
    lines.append(_per_book_section_md(report, book_order))
    return "\n".join(lines)


def _executive_summary_md(report) -> str:
    s = report.summary()
    total_sections = s["total_sections"]
    tiers = s["tier_counts"]

    def pct(n):
        return f"{(100.0 * n / total_sections):.1f}%" if total_sections else "n/a"

    lines = [
        "## Executive Summary",
        "",
        f"Sections: {total_sections} total",
        (f"  🔴 Deficient: {tiers['deficient']} ({pct(tiers['deficient'])}) | "
         f"🟡 Thin: {tiers['thin']} ({pct(tiers['thin'])}) | "
         f"🟢 Adequate: {tiers['adequate']} ({pct(tiers['adequate'])}) | "
         f"✨ Rich: {tiers['rich']} ({pct(tiers['rich'])})"),
        "",
        f"Panel quality: {s['total_panels']} panels evaluated",
        (f"  substantive: {s['panel_verdicts']['substantive']} | "
         f"empty: {s['panel_verdicts']['empty']} | "
         f"stub: {s['panel_verdicts']['stub']} | "
         f"placeholder: {s['panel_verdicts']['placeholder']} | "
         f"template: {s['panel_verdicts']['template']}"),
        "",
        "Chapter-panel completeness (per genre rubric):",
        (f"  Expected: {s['chapter_panel_expected']} | "
         f"Present substantive: {s['chapter_panel_substantive']} | "
         f"Missing: {s['chapter_panel_missing']} | "
         f"Present but deficient: {s['chapter_panel_deficient']}"),
        "",
        "Top 5 books by total finding count:",
    ]
    for i, (book_id, count) in enumerate(s["top_books_by_findings"][:5], 1):
        lines.append(f"  {i}. {book_id}: {count} findings")
    lines.append("")
    return "\n".join(lines)


def _per_book_section_md(report, book_order: list[str]) -> str:
    by_book = report.by_book()
    lines = ["## Per-Book Breakdown", ""]

    for book_id in book_order:
        if book_id not in by_book:
            continue
        entry = by_book[book_id]
        sections = entry["sections"]
        chapter_panels = entry["chapter_panels"]
        genre = entry.get("genre", "?")
        total_chapters = entry.get("total_chapters", 0)

        tier_counts = Counter(v.tier for v in sections)
        lines.append(
            f"### {book_id} ({genre} — {total_chapters} chapters, {len(sections)} sections)"
        )
        lines.append("")
        lines.append(
            "  🔴 {d} | 🟡 {t} | 🟢 {a} | ✨ {r}".format(
                d=tier_counts.get("deficient", 0),
                t=tier_counts.get("thin", 0),
                a=tier_counts.get("adequate", 0),
                r=tier_counts.get("rich", 0),
            )
        )

        # L1 findings (deficient + thin only; adequate/rich skipped)
        problem_sections = [v for v in sections if v.tier in ("deficient", "thin")]
        if problem_sections:
            lines.append("")
            lines.append("**L1 sections needing enrichment:**")
            for v in problem_sections[:25]:
                lines.append(_format_section_line(v))
            if len(problem_sections) > 25:
                lines.append(f"  …({len(problem_sections) - 25} more)")

        # L2 non-substantive panels
        bad_panels = [
            (v, p) for v in sections for p in v.panels
            if p.verdict != "substantive"
        ]
        if bad_panels:
            lines.append("")
            lines.append("**L2 panels needing rewrite:**")
            for v, p in bad_panels[:25]:
                lines.append(
                    f"  - Ch {v.chapter_num} §{v.section_num} "
                    f"`{p.panel_key}`: {p.verdict}"
                    + (f" ({p.details})" if p.details else "")
                )
            if len(bad_panels) > 25:
                lines.append(f"  …({len(bad_panels) - 25} more)")

        # L3 chapter-panel findings
        l3_problems = [cp for cp in chapter_panels if cp.verdict != "substantive"]
        if l3_problems:
            lines.append("")
            lines.append("**L3 chapter panels:**")
            for cp in l3_problems[:25]:
                tag = "missing" if cp.verdict == "missing" else cp.verdict
                lines.append(
                    f"  - Ch {cp.chapter_num} `{cp.panel_key}`: {tag}"
                    + (f" ({cp.details})" if cp.details else "")
                )
            if len(l3_problems) > 25:
                lines.append(f"  …({len(l3_problems) - 25} more)")

        lines.append("")

    return "\n".join(lines)


def _format_section_line(v) -> str:
    emoji = TIER_EMOJI.get(v.tier, "?")
    reasons = []
    if v.commentator_count < 2:
        reasons.append(f"commentators={v.commentator_count}")
    if v.categories_hit < 2:
        reasons.append(f"categories={v.categories_hit}")
    if v.panel_weight < 3:
        reasons.append(f"weight={v.panel_weight:g}")
    reason_str = ", ".join(reasons) if reasons else "boundary"
    return (
        f"  - {emoji} Ch {v.chapter_num} §{v.section_num} "
        f"(v.{v.verse_start}-{v.verse_end}) — {reason_str}"
    )


# ─── Per-book issue bodies ──────────────────────────────────────────

def render_issue_bodies(report, book_order: list[str], book_meta: dict) -> dict[str, str]:
    """Produce one Tier-C-style draft issue body per book with any findings.

    Returns { book_id: markdown_body }. Books with zero findings are omitted.
    """
    by_book = report.by_book()
    bodies: dict[str, str] = {}
    for book_id in book_order:
        if book_id not in by_book:
            continue
        entry = by_book[book_id]
        body = _single_book_issue_body(book_id, entry, book_meta.get(book_id, {}))
        if body:
            bodies[book_id] = body
    return bodies


def _single_book_issue_body(book_id: str, entry: dict, meta: dict) -> str:
    sections = entry["sections"]
    chapter_panels = entry["chapter_panels"]
    genre = entry.get("genre", "?")
    total_chapters = entry.get("total_chapters", 0)

    l1 = [v for v in sections if v.tier in ("deficient", "thin")]
    l2 = [(v, p) for v in sections for p in v.panels if p.verdict != "substantive"]
    l3 = [cp for cp in chapter_panels if cp.verdict != "substantive"]

    if not l1 and not l2 and not l3:
        return ""

    lines: list[str] = []
    lines.append(
        f"**Goal:** Bring {meta.get('name', book_id)} ({genre} — "
        f"{total_chapters} chapters) to full coverage "
        "(L1 sections + L2 panel quality + L3 chapter-panel completeness)."
    )
    lines.append("")
    if l1:
        lines.append(f"**Level 1 — Sections to enrich ({len(l1)}):**")
        for v in l1:
            emoji = TIER_EMOJI.get(v.tier, "?")
            lines.append(
                f"- [ ] {book_id} {v.chapter_num}:{v.verse_start}–{v.verse_end} "
                f"({emoji} {v.tier}) — §{v.section_num}; "
                f"commentators={v.commentator_count}, "
                f"categories={v.categories_hit}, weight={v.panel_weight:g}"
            )
        lines.append("")
    if l2:
        lines.append(f"**Level 2 — Panels to rewrite ({len(l2)}):**")
        for v, p in l2:
            lines.append(
                f"- [ ] {book_id} ch {v.chapter_num} §{v.section_num} "
                f"`{p.panel_key}` — {p.verdict}"
                + (f" ({p.details})" if p.details else "")
            )
        lines.append("")
    if l3:
        lines.append(f"**Level 3 — Chapter panels ({len(l3)}):**")
        for cp in l3:
            lines.append(
                f"- [ ] {book_id} ch {cp.chapter_num} `{cp.panel_key}` — {cp.verdict}"
                + (f" ({cp.details})" if cp.details else "")
            )
        lines.append("")

    lines.append("**Acceptance criteria:**")
    lines.append(f"- [ ] `coverage_auditor --book {book_id}` shows zero findings")
    lines.append("- [ ] `quality_scorer` ≥ 90 for affected chapters")
    lines.append("- [ ] No new placeholder/stub/template content")
    lines.append("- [ ] NIV verse text unchanged")
    lines.append("")
    lines.append(
        "**Out of scope:** sections already 🟢/✨; panels already substantive; "
        "chapter panels not in this genre's expected set; section header changes (Phase 3)."
    )
    return "\n".join(lines)


# ─── Template-candidates report ─────────────────────────────────────

def render_template_candidates(panel_key: str, clusters: list[dict]) -> str:
    """Produce the markdown report for `--template-candidates` output.

    Each cluster is a dict: { signature, count, chapters, samples (list[str]) }.
    Only clusters with ≥5 members should be passed in; filtering is the caller's job.
    """
    lines = [f"# Template Candidates — `{panel_key}` panels", ""]
    if not clusters:
        lines.append("_No ≥5-member clusters found._")
        return "\n".join(lines)

    for i, cluster in enumerate(clusters, 1):
        lines.append(f"## Cluster {i} — {cluster['count']} members")
        lines.append("")
        lines.append("**Signature prefix:**")
        lines.append("")
        lines.append("```")
        lines.append(cluster["signature"])
        lines.append("```")
        lines.append("")
        lines.append("**Chapters:**")
        for ch in sorted(cluster["chapters"])[:50]:
            lines.append(f"- {ch}")
        if len(cluster["chapters"]) > 50:
            lines.append(f"- …({len(cluster['chapters']) - 50} more)")
        lines.append("")
        lines.append("**Samples:**")
        for j, sample in enumerate(cluster["samples"][:3], 1):
            lines.append(f"### Sample {j}")
            lines.append("")
            lines.append("```")
            lines.append(sample)
            lines.append("```")
            lines.append("")
        lines.append("---")
        lines.append("")
    return "\n".join(lines)
