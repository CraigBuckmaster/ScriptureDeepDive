#!/usr/bin/env python3
"""
coverage_auditor.py — Three-layer content coverage audit (#1628).

Audits the Companion Study corpus across three integrated layers (see
parent epic #1625 for the full plan and rubric):

    L1 — Section coverage tiers (deficient | thin | adequate | rich)
    L2 — Panel content quality (substantive | empty | stub | placeholder | template)
    L3 — Chapter-panel completeness (per genre rubric)

Reuses panel taxonomy + helpers from `panel_taxonomy.py` (#1627). Does NOT
import from `quality_scorer.py` — that tool serves a different scoring
purpose and stays separate.

Usage:
    python _tools/coverage_auditor.py --all
    python _tools/coverage_auditor.py --sections          # L1 only
    python _tools/coverage_auditor.py --panel-quality     # L2 only
    python _tools/coverage_auditor.py --chapter-panels    # L3 only
    python _tools/coverage_auditor.py --book genesis --section-detail
    python _tools/coverage_auditor.py --template-candidates
    python _tools/coverage_auditor.py --format json|markdown|issues
    python _tools/coverage_auditor.py --output-dir _audit
    python _tools/coverage_auditor.py --all --ci [--baseline _audit/baseline.json]
    python _tools/coverage_auditor.py --parables   # Phase 2 stub
    python _tools/coverage_auditor.py --concepts   # Phase 3 stub
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

# Ensure local _tools/ is on sys.path so panel_taxonomy + audit_emitters import cleanly.
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

from panel_taxonomy import (
    LINGUISTIC_PANELS, HISTORICAL_PANELS, CONNECTIVE_PANELS,
    GENRE_EXPECTED_PANELS, TEMPLATE_PATTERNS, CHAPTER_PANEL_TYPES,
    DENSITY_TIERS, PANEL_THRESHOLD_MULTIPLIERS, PLACEHOLDER_PATTERNS,
    extract_panel_text, get_density_score, load_scholar_keys,
    categorize_panel,
)
from audit_emitters import (
    render_markdown, render_issue_bodies, render_template_candidates,
)

RUBRIC_VERSION = "3.0"


# ─── Dataclasses ────────────────────────────────────────────────────

@dataclass
class PanelVerdict:
    """Result of L2 evaluation for a single panel."""
    panel_key: str
    scope: str                    # 'section' | 'chapter'
    char_count: int
    verdict: str                  # 'substantive' | 'empty' | 'stub' | 'placeholder' | 'template'
    details: str | None = None


@dataclass
class SectionVerdict:
    """L1 tier assignment + accumulated panel evaluations for one section."""
    book_id: str
    chapter_num: int
    section_num: int
    verse_start: int
    verse_end: int
    panel_weight: float
    categories_hit: int
    commentator_count: int
    tier: str                     # 'deficient' | 'thin' | 'adequate' | 'rich'
    panels: list[PanelVerdict] = field(default_factory=list)
    findings: list[dict] = field(default_factory=list)


@dataclass
class ChapterPanelVerdict:
    """L3 evaluation for one expected chapter panel."""
    book_id: str
    chapter_num: int
    panel_key: str
    verdict: str                  # 'substantive' | 'missing' | 'empty' | 'stub' | 'placeholder' | 'template'
    expected: bool
    char_count: int = 0
    details: str | None = None


@dataclass
class TemplateCandidate:
    """A panel grouped into a same-signature cluster for review."""
    panel_key: str
    signature: str
    book_id: str
    chapter_num: int
    sample_body: str


@dataclass
class AuditReport:
    """Aggregate report — input for emitters and JSON dump."""
    generated_at: str
    rubric_version: str
    sections: list[SectionVerdict] = field(default_factory=list)
    chapter_panels: list[ChapterPanelVerdict] = field(default_factory=list)
    template_candidates: list[TemplateCandidate] = field(default_factory=list)
    book_meta: dict = field(default_factory=dict)
    book_order: list[str] = field(default_factory=list)

    def summary(self) -> dict:
        tier_counts = Counter(v.tier for v in self.sections)
        # panel_verdicts spans every evaluated panel (sections + chapter panels).
        # 'missing' is L3-only and not a panel verdict, so exclude it.
        panel_counts: Counter = Counter(p.verdict for v in self.sections for p in v.panels)
        for cp in self.chapter_panels:
            if cp.verdict != "missing":
                panel_counts[cp.verdict] += 1
        cp_counts = Counter(cp.verdict for cp in self.chapter_panels if cp.expected)
        finding_counts: Counter = Counter()
        for v in self.sections:
            finding_counts[v.book_id] += len(v.findings)
            finding_counts[v.book_id] += sum(1 for p in v.panels if p.verdict != "substantive")
        for cp in self.chapter_panels:
            if cp.verdict != "substantive":
                finding_counts[cp.book_id] += 1
        top_books = sorted(finding_counts.items(), key=lambda kv: -kv[1])
        return {
            "total_sections": len(self.sections),
            "tier_counts": {
                "deficient": tier_counts.get("deficient", 0),
                "thin": tier_counts.get("thin", 0),
                "adequate": tier_counts.get("adequate", 0),
                "rich": tier_counts.get("rich", 0),
            },
            "total_panels": (
                sum(len(v.panels) for v in self.sections)
                + sum(1 for cp in self.chapter_panels if cp.verdict != "missing")
            ),
            "panel_verdicts": {
                "substantive": panel_counts.get("substantive", 0),
                "empty": panel_counts.get("empty", 0),
                "stub": panel_counts.get("stub", 0),
                "placeholder": panel_counts.get("placeholder", 0),
                "template": panel_counts.get("template", 0),
            },
            "chapter_panel_expected": sum(1 for cp in self.chapter_panels if cp.expected),
            "chapter_panel_substantive": cp_counts.get("substantive", 0),
            "chapter_panel_missing": cp_counts.get("missing", 0),
            "chapter_panel_deficient": sum(
                cp_counts.get(v, 0) for v in ("empty", "stub", "placeholder", "template")
            ),
            "top_books_by_findings": top_books,
        }

    def by_book(self) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for v in self.sections:
            entry = out.setdefault(v.book_id, {
                "sections": [], "chapter_panels": [],
                "genre": self.book_meta.get(v.book_id, {}).get("genre", "?"),
                "total_chapters": self.book_meta.get(v.book_id, {}).get("total_chapters", 0),
            })
            entry["sections"].append(v)
        for cp in self.chapter_panels:
            entry = out.setdefault(cp.book_id, {
                "sections": [], "chapter_panels": [],
                "genre": self.book_meta.get(cp.book_id, {}).get("genre", "?"),
                "total_chapters": self.book_meta.get(cp.book_id, {}).get("total_chapters", 0),
            })
            entry["chapter_panels"].append(cp)
        return out

    def to_json(self) -> str:
        return json.dumps({
            "generated_at": self.generated_at,
            "rubric_version": self.rubric_version,
            "summary": self.summary(),
            "sections": [asdict(v) for v in self.sections],
            "chapter_panels": [asdict(cp) for cp in self.chapter_panels],
            "template_candidates": [asdict(tc) for tc in self.template_candidates],
            "book_order": self.book_order,
            "book_meta": self.book_meta,
        }, indent=2, ensure_ascii=False, default=str)

    def to_markdown(self) -> str:
        return render_markdown(self, self.book_order)

    def to_issue_bodies(self) -> dict[str, str]:
        return render_issue_bodies(self, self.book_order, self.book_meta)


# ─── Books discovery ────────────────────────────────────────────────

def load_books(content_dir: Path) -> list[dict]:
    """Return live books from content/meta/books.json in canonical order.

    Never hardcodes the book list. Non-book content directories
    (archaeology, journeys, timeline, etc.) are excluded automatically
    because they don't appear in books.json.
    """
    meta_path = content_dir / "meta" / "books.json"
    if not meta_path.exists():
        return []
    books = json.loads(meta_path.read_text(encoding="utf-8"))
    live = [b for b in books if b.get("is_live")]
    live.sort(key=lambda b: b.get("book_order", 9999))
    return live


def iter_chapter_files(book_dir: Path) -> Iterable[Path]:
    """Yield chapter JSON files in numeric order (1.json, 2.json, ..., 10.json)."""
    files = list(book_dir.glob("*.json"))

    def keyfn(p: Path) -> tuple[int, str]:
        stem = p.stem
        try:
            return (int(stem), "")
        except ValueError:
            return (10**9, stem)

    for p in sorted(files, key=keyfn):
        yield p


def load_chapter(path: Path) -> dict | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return None
        return data
    except (json.JSONDecodeError, OSError):
        return None


# ─── L2: Panel content quality ──────────────────────────────────────

def _is_empty_panel(panel_data) -> bool:
    """A panel is empty if its data is structurally empty or all whitespace."""
    if panel_data is None:
        return True
    if isinstance(panel_data, (dict, list, str)) and len(panel_data) == 0:
        return True
    return False


def _matches_template(panel_key: str, panel_data) -> tuple[bool, str | None]:
    """Type-specific template detection.

    Each pattern is a tuple of substrings; ALL must appear in the serialized
    panel JSON for a match. Returns (matched, details_or_none).
    """
    patterns = TEMPLATE_PATTERNS.get(panel_key, [])
    if not patterns:
        return False, None
    serialized = json.dumps(panel_data, ensure_ascii=False)
    for i, pattern in enumerate(patterns):
        if all(substr in serialized for substr in pattern):
            return True, f"matches pattern {i}"
    return False, None


def evaluate_panel(panel_key: str, panel_data, scope: str = "section") -> PanelVerdict:
    """Apply the L2 verdict ladder: empty → placeholder → template → stub → substantive.

    See epic #1625 §1.5 for rationale. The empirical 100*0.5=50 floor for
    `heb` panels means only genuinely malformed Hebrew word-study panels
    register as stubs (corpus median is ~484 chars).
    """
    if _is_empty_panel(panel_data):
        return PanelVerdict(
            panel_key=panel_key, scope=scope, char_count=0,
            verdict="empty", details=None,
        )

    text = extract_panel_text(panel_key, panel_data)
    char_count = len(text.strip())

    if char_count == 0:
        return PanelVerdict(
            panel_key=panel_key, scope=scope, char_count=0,
            verdict="empty", details=None,
        )

    for pattern in PLACEHOLDER_PATTERNS:
        if pattern.search(text):
            return PanelVerdict(
                panel_key=panel_key, scope=scope, char_count=char_count,
                verdict="placeholder", details=pattern.pattern,
            )

    matched, detail = _matches_template(panel_key, panel_data)
    if matched:
        return PanelVerdict(
            panel_key=panel_key, scope=scope, char_count=char_count,
            verdict="template", details=detail,
        )

    multiplier = PANEL_THRESHOLD_MULTIPLIERS.get(panel_key, 1.0)
    stub_threshold = 100 * multiplier
    if char_count < stub_threshold:
        return PanelVerdict(
            panel_key=panel_key, scope=scope, char_count=char_count,
            verdict="stub", details=f"below {stub_threshold:g}-char threshold",
        )

    return PanelVerdict(
        panel_key=panel_key, scope=scope, char_count=char_count,
        verdict="substantive", details=None,
    )


# ─── L1: Section tier ───────────────────────────────────────────────

def _section_chapter_bonus(chapter_panel_verdicts: list[ChapterPanelVerdict]) -> float:
    """+0.5 per distinct chapter-panel category with ≥1 substantive panel."""
    cats = set()
    for cp in chapter_panel_verdicts:
        if cp.verdict == "substantive":
            cats.add(cp.panel_key)
    return 0.5 * len(cats)


def evaluate_section(
    book_id: str,
    chapter_num: int,
    section: dict,
    scholar_keys: set[str],
    chapter_panel_verdicts: list[ChapterPanelVerdict],
) -> SectionVerdict:
    """Compute the L1 tier for one section based on its substantive panels."""
    sec_num = section.get("section_num", 0)
    vs = section.get("verse_start", 0)
    ve = section.get("verse_end", 0)
    panels = section.get("panels", {}) or {}

    panel_verdicts: list[PanelVerdict] = []
    for panel_key, panel_data in panels.items():
        panel_verdicts.append(evaluate_panel(panel_key, panel_data, scope="section"))

    substantive = [p for p in panel_verdicts if p.verdict == "substantive"]
    categories = {categorize_panel(p.panel_key, scholar_keys) for p in substantive}
    categories.discard("unknown")
    commentator_count = len({
        p.panel_key for p in substantive
        if categorize_panel(p.panel_key, scholar_keys) == "commentary"
    })

    # panel_weight: each non-commentary substantive = 1.0; commentary collapses to 1.0
    weight = sum(
        1.0 for p in substantive
        if categorize_panel(p.panel_key, scholar_keys) != "commentary"
    )
    if commentator_count > 0:
        weight += 1.0
    weight += _section_chapter_bonus(chapter_panel_verdicts)

    # categories_hit caps at 4 (linguistic|historical|connective|commentary)
    hit_categories = set()
    for p in substantive:
        cat = categorize_panel(p.panel_key, scholar_keys)
        if cat in ("linguistic", "historical", "connective", "commentary"):
            hit_categories.add(cat)
    categories_hit = min(len(hit_categories), 4)

    tier = _assign_tier(weight, categories_hit, commentator_count)

    findings: list[dict] = []
    if commentator_count == 0:
        findings.append({"code": "no_commentary"})
    elif commentator_count == 1:
        findings.append({"code": "single_commentator"})
    if commentator_count > 0 and len([p for p in substantive
                                      if categorize_panel(p.panel_key, scholar_keys) != "commentary"]) == 0:
        findings.append({"code": "commentary_only"})
    if "linguistic" not in hit_categories:
        findings.append({"code": "linguistic_missing"})
    if "historical" not in hit_categories:
        findings.append({"code": "historical_missing"})
    if "connective" not in hit_categories:
        findings.append({"code": "connective_missing"})
    for p in panel_verdicts:
        if p.verdict != "substantive":
            findings.append({
                "code": f"panel_{p.verdict}",
                "panel_key": p.panel_key,
                "details": p.details,
            })

    return SectionVerdict(
        book_id=book_id,
        chapter_num=chapter_num,
        section_num=sec_num,
        verse_start=vs,
        verse_end=ve,
        panel_weight=weight,
        categories_hit=categories_hit,
        commentator_count=commentator_count,
        tier=tier,
        panels=panel_verdicts,
        findings=findings,
    )


def _assign_tier(weight: float, categories_hit: int, commentator_count: int) -> str:
    """Apply the rubric in epic #1625 §1.4. Order matters: rich → adequate → thin → deficient."""
    if weight >= 6 and categories_hit == 4 and commentator_count >= 3:
        return "rich"
    if weight >= 4 and categories_hit >= 3 and commentator_count >= 2:
        return "adequate"
    if weight == 3 and categories_hit == 2 and commentator_count == 2:
        return "thin"
    return "deficient"


# ─── L3: Chapter-panel completeness ─────────────────────────────────

def evaluate_chapter_panels(
    book_id: str,
    chapter_num: int,
    chapter_data: dict,
    genre: str,
) -> list[ChapterPanelVerdict]:
    """Compare a chapter's panels against the genre rubric.

    Emits one ChapterPanelVerdict per expected type (missing or evaluated)
    and one INFO-style 'bonus' verdict per substantive panel not in the
    expected set.
    """
    expected_set = GENRE_EXPECTED_PANELS.get(genre, set())
    chapter_panels = chapter_data.get("chapter_panels", {}) or {}
    out: list[ChapterPanelVerdict] = []

    for ptype in sorted(expected_set):
        if ptype not in chapter_panels:
            out.append(ChapterPanelVerdict(
                book_id=book_id, chapter_num=chapter_num, panel_key=ptype,
                verdict="missing", expected=True, char_count=0,
                details="not present in chapter_panels",
            ))
            continue
        pv = evaluate_panel(ptype, chapter_panels[ptype], scope="chapter")
        out.append(ChapterPanelVerdict(
            book_id=book_id, chapter_num=chapter_num, panel_key=ptype,
            verdict=pv.verdict, expected=True, char_count=pv.char_count,
            details=pv.details,
        ))

    for ptype, pdata in chapter_panels.items():
        if ptype in expected_set:
            continue
        pv = evaluate_panel(ptype, pdata, scope="chapter")
        if pv.verdict == "substantive":
            out.append(ChapterPanelVerdict(
                book_id=book_id, chapter_num=chapter_num, panel_key=ptype,
                verdict="substantive", expected=False, char_count=pv.char_count,
                details="bonus (not in genre expected set)",
            ))
        elif pv.verdict in ("template", "placeholder"):
            # Slight extension over epic §1.6: surface boilerplate on
            # non-expected chapter panels too. Otherwise the 165 epistle
            # `debate` templates would be silently dropped, defeating the
            # purpose of L2 detection. Keep `expected=False` so emitters
            # can rank these as informational rather than rubric failures.
            out.append(ChapterPanelVerdict(
                book_id=book_id, chapter_num=chapter_num, panel_key=ptype,
                verdict=pv.verdict, expected=False, char_count=pv.char_count,
                details=pv.details,
            ))
    return out


# ─── Audit driver ───────────────────────────────────────────────────

_NUMERIC_REF_RE = re.compile(r"\b\d+(?::\d+)?\b")


def _signature_of(panel_data) -> str:
    """Lowercased, numeric-stripped JSON serialization, first 300 chars."""
    serialized = json.dumps(panel_data, ensure_ascii=False).lower()
    serialized = _NUMERIC_REF_RE.sub("", serialized)
    return serialized[:300]


def collect_template_candidates(
    content_dir: Path,
    books: list[dict],
    panel_keys_with_patterns: set[str],
) -> dict[str, list[dict]]:
    """Group panels by (panel_key, signature_prefix). Yields ≥5-member clusters
    only for panel keys NOT already covered by TEMPLATE_PATTERNS.

    Returns { panel_key: [ {signature, count, chapters, samples}, ... ] }.
    """
    buckets: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
    sample_bodies: dict[tuple[str, str], list[str]] = defaultdict(list)

    for book in books:
        book_id = book["id"]
        book_dir = content_dir / book_id
        if not book_dir.is_dir():
            continue
        for ch_path in iter_chapter_files(book_dir):
            data = load_chapter(ch_path)
            if data is None:
                continue
            chapter_num = data.get("chapter_num", 0)

            chapter_panels = data.get("chapter_panels", {}) or {}
            for ptype, pdata in chapter_panels.items():
                if ptype in panel_keys_with_patterns:
                    continue
                sig = _signature_of(pdata)
                if not sig:
                    continue
                key = (ptype, sig)
                buckets[key].append((book_id, f"{book_id} {chapter_num}"))
                if len(sample_bodies[key]) < 3:
                    sample_bodies[key].append(
                        json.dumps(pdata, indent=2, ensure_ascii=False)[:1500]
                    )

            for sec in data.get("sections", []) or []:
                if not isinstance(sec, dict):
                    continue
                sec_num = sec.get("section_num", 0)
                for ptype, pdata in (sec.get("panels", {}) or {}).items():
                    if ptype in panel_keys_with_patterns:
                        continue
                    sig = _signature_of(pdata)
                    if not sig:
                        continue
                    key = (ptype, sig)
                    buckets[key].append(
                        (book_id, f"{book_id} {chapter_num}:§{sec_num}")
                    )
                    if len(sample_bodies[key]) < 3:
                        sample_bodies[key].append(
                            json.dumps(pdata, indent=2, ensure_ascii=False)[:1500]
                        )

    by_panel: dict[str, list[dict]] = defaultdict(list)
    for (ptype, sig), members in buckets.items():
        if len(members) < 5:
            continue
        by_panel[ptype].append({
            "signature": sig,
            "count": len(members),
            "chapters": [m[1] for m in members],
            "samples": sample_bodies[(ptype, sig)],
        })
    for ptype in by_panel:
        by_panel[ptype].sort(key=lambda c: -c["count"])
    return dict(by_panel)


def run_audit(
    content_dir: Path,
    *,
    book_filter: str | None = None,
    do_sections: bool = True,
    do_chapter_panels: bool = True,
) -> AuditReport:
    """Walk the corpus and produce an AuditReport.

    `do_sections` controls whether L1/L2 are run; `do_chapter_panels`
    controls L3. Both default to True (the `--all` behavior).
    """
    books = load_books(content_dir)
    if book_filter:
        books = [b for b in books if b["id"] == book_filter]
    book_order = [b["id"] for b in books]
    book_meta = {b["id"]: b for b in books}
    scholar_keys = load_scholar_keys(content_dir)

    sections: list[SectionVerdict] = []
    chapter_panels_out: list[ChapterPanelVerdict] = []

    for book in books:
        book_id = book["id"]
        genre = book.get("genre", "?")
        book_dir = content_dir / book_id
        if not book_dir.is_dir():
            continue
        for ch_path in iter_chapter_files(book_dir):
            data = load_chapter(ch_path)
            if data is None:
                continue
            chapter_num = data.get("chapter_num", 0)

            cp_verdicts: list[ChapterPanelVerdict] = []
            if do_chapter_panels or do_sections:
                cp_verdicts = evaluate_chapter_panels(book_id, chapter_num, data, genre)

            if do_chapter_panels:
                chapter_panels_out.extend(cp_verdicts)

            if do_sections:
                for sec in data.get("sections", []) or []:
                    if not isinstance(sec, dict):
                        continue
                    sv = evaluate_section(
                        book_id, chapter_num, sec, scholar_keys, cp_verdicts,
                    )
                    sections.append(sv)

    return AuditReport(
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        rubric_version=RUBRIC_VERSION,
        sections=sections,
        chapter_panels=chapter_panels_out,
        template_candidates=[],
        book_meta=book_meta,
        book_order=book_order,
    )


# ─── CI baseline diffing ────────────────────────────────────────────

def _baseline_finding_keys(baseline: dict) -> set[str]:
    """Reduce a baseline JSON to a set of stable finding keys."""
    keys: set[str] = set()
    for sv in baseline.get("sections", []):
        if sv.get("tier") == "deficient":
            keys.add(f"L1:{sv['book_id']}:{sv['chapter_num']}:{sv['section_num']}:deficient")
        for p in sv.get("panels", []) or []:
            if p.get("verdict") != "substantive":
                keys.add(
                    f"L2:{sv['book_id']}:{sv['chapter_num']}:{sv['section_num']}"
                    f":{p['panel_key']}:{p['verdict']}"
                )
    for cp in baseline.get("chapter_panels", []):
        if cp.get("expected") and cp.get("verdict") != "substantive":
            keys.add(
                f"L3:{cp['book_id']}:{cp['chapter_num']}"
                f":{cp['panel_key']}:{cp['verdict']}"
            )
    return keys


def report_finding_keys(report: AuditReport) -> set[str]:
    keys: set[str] = set()
    for sv in report.sections:
        if sv.tier == "deficient":
            keys.add(f"L1:{sv.book_id}:{sv.chapter_num}:{sv.section_num}:deficient")
        for p in sv.panels:
            if p.verdict != "substantive":
                keys.add(
                    f"L2:{sv.book_id}:{sv.chapter_num}:{sv.section_num}"
                    f":{p.panel_key}:{p.verdict}"
                )
    for cp in report.chapter_panels:
        if cp.expected and cp.verdict != "substantive":
            keys.add(f"L3:{cp.book_id}:{cp.chapter_num}:{cp.panel_key}:{cp.verdict}")
    return keys


def ci_check(report: AuditReport, baseline_path: Path | None) -> tuple[int, list[str]]:
    """Compute regressions vs baseline. Returns (exit_code, regression_lines).

    Without baseline → informational, exits 0.
    With baseline → exits 1 on any new finding key not in the baseline.
    """
    if baseline_path is None or not baseline_path.exists():
        return 0, []
    try:
        baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        return 1, [f"Failed to read baseline: {e}"]
    new_keys = report_finding_keys(report) - _baseline_finding_keys(baseline)
    if not new_keys:
        return 0, []
    return 1, sorted(new_keys)


# ─── CLI ────────────────────────────────────────────────────────────

def _format_section_detail(report: AuditReport) -> str:
    """Per-section detail dump used by --section-detail."""
    lines = ["# Section Detail", ""]
    for sv in report.sections:
        lines.append(
            f"- {sv.book_id} {sv.chapter_num}:{sv.verse_start}–{sv.verse_end} "
            f"§{sv.section_num} → {sv.tier} "
            f"(weight={sv.panel_weight:g}, cats={sv.categories_hit}, "
            f"commentators={sv.commentator_count})"
        )
        for p in sv.panels:
            lines.append(
                f"    · `{p.panel_key}` → {p.verdict} ({p.char_count} chars)"
                + (f" — {p.details}" if p.details else "")
            )
    return "\n".join(lines)


def _write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Three-layer content coverage audit")
    parser.add_argument("--all", action="store_true",
                        help="Run all three audit layers (default if no layer flag)")
    parser.add_argument("--sections", action="store_true",
                        help="L1 + L2 only (sections + per-panel quality)")
    parser.add_argument("--panel-quality", action="store_true",
                        help="L2 only (per-panel quality on sections + chapters)")
    parser.add_argument("--chapter-panels", action="store_true",
                        help="L3 only (chapter-panel completeness)")
    parser.add_argument("--book", type=str, default=None,
                        help="Limit audit to a single book id (e.g. genesis)")
    parser.add_argument("--section-detail", action="store_true",
                        help="Emit per-section detail (use with --book)")
    parser.add_argument("--template-candidates", action="store_true",
                        help="Surface ≥5-member panel clusters for template review")
    parser.add_argument("--format", type=str, default="markdown",
                        choices=["json", "markdown", "issues"],
                        help="Output format")
    parser.add_argument("--output-dir", type=str, default="_audit",
                        help="Directory for generated artifacts (default _audit)")
    parser.add_argument("--ci", action="store_true",
                        help="CI mode: diff against baseline, exit 1 on regressions")
    parser.add_argument("--baseline", type=str, default=None,
                        help="Path to baseline JSON (default _audit/baseline.json)")
    parser.add_argument("--content-dir", type=str, default="content",
                        help="Content root directory (default content)")
    parser.add_argument("--parables", action="store_true",
                        help="(Phase 2 stub — not yet implemented)")
    parser.add_argument("--concepts", action="store_true",
                        help="(Phase 3 stub — not yet implemented)")

    args = parser.parse_args(argv)

    if args.parables:
        print("Phase 2 — not yet implemented")
        return 0
    if args.concepts:
        print("Phase 3 — not yet implemented")
        return 0

    root = Path(__file__).resolve().parent.parent
    os.chdir(root)
    content_dir = Path(args.content_dir)
    out_dir = Path(args.output_dir)

    do_sections = args.all or args.sections or args.panel_quality or (
        not (args.chapter_panels or args.template_candidates or args.section_detail)
    )
    do_chapter_panels = args.all or args.chapter_panels or args.panel_quality or (
        not (args.sections or args.template_candidates or args.section_detail)
    )
    if args.section_detail:
        do_sections = True
        do_chapter_panels = True

    if args.template_candidates:
        books = load_books(content_dir)
        if args.book:
            books = [b for b in books if b["id"] == args.book]
        clusters = collect_template_candidates(
            content_dir, books, set(TEMPLATE_PATTERNS.keys()),
        )
        if not clusters:
            print("No ≥5-member clusters found.")
            return 0
        for ptype, cs in sorted(clusters.items()):
            md = render_template_candidates(ptype, cs)
            target = out_dir / f"template-candidates-{ptype}.md"
            _write_text(target, md)
            print(f"  wrote {target}  ({len(cs)} cluster(s))")
        return 0

    report = run_audit(
        content_dir,
        book_filter=args.book,
        do_sections=do_sections,
        do_chapter_panels=do_chapter_panels,
    )

    if args.ci:
        baseline = Path(args.baseline) if args.baseline else (out_dir / "baseline.json")
        exit_code, regressions = ci_check(report, baseline)
        if regressions:
            print("Regressions vs baseline:")
            for r in regressions[:50]:
                print(f"  + {r}")
            if len(regressions) > 50:
                print(f"  …({len(regressions) - 50} more)")
        else:
            print("CI: no regressions vs baseline.")
        return exit_code

    if args.section_detail:
        print(_format_section_detail(report))
        return 0

    if args.format == "json":
        print(report.to_json())
    elif args.format == "issues":
        bodies = report.to_issue_bodies()
        out_dir.mkdir(parents=True, exist_ok=True)
        for book_id, body in bodies.items():
            target = out_dir / "issues" / f"{book_id}.md"
            _write_text(target, body)
            print(f"  wrote {target}")
    else:
        print(report.to_markdown())

    return 0


if __name__ == "__main__":
    sys.exit(main())
