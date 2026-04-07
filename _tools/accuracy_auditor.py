#!/usr/bin/env python3
"""
accuracy_auditor.py — Content accuracy auditor for Companion Study.

Extracts verifiable claims from chapter JSON, checks them against trusted
sources (Strong's lexicon, verse DB, Scholar registry, Claude API), and
produces a reference matrix with per-claim verdicts and source citations.

Usage:
    python3 _tools/accuracy_auditor.py                        # Full audit (all books, Tier 0+1)
    python3 _tools/accuracy_auditor.py --book genesis          # Audit one book
    python3 _tools/accuracy_auditor.py --chapter gen1          # Audit one chapter
    python3 _tools/accuracy_auditor.py --tier 0                # Tier 0 only (free, instant)
    python3 _tools/accuracy_auditor.py --tier 1                # Tier 0+1 (free, local data)
    python3 _tools/accuracy_auditor.py --scholar sarna         # Audit one scholar across all books
    python3 _tools/accuracy_auditor.py --type historical       # Audit one claim type only
    python3 _tools/accuracy_auditor.py --report                # Regenerate markdown reports
    python3 _tools/accuracy_auditor.py --worst 20              # Show 20 lowest-scoring chapters
    python3 _tools/accuracy_auditor.py --flagged               # List all FLAGGED + REFUTED claims
    python3 _tools/accuracy_auditor.py --stats                 # Corpus-wide statistics
    python3 _tools/accuracy_auditor.py --cost-estimate         # Estimate API cost without running
    python3 _tools/accuracy_auditor.py --dry-run               # Extract claims, show counts only
    python3 _tools/accuracy_auditor.py --json                  # Machine-readable output
"""

import argparse
import json
import os
import sys
import time

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from collections import Counter, defaultdict
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

# Ensure _tools is on path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from accuracy_config import (
    ROOT, CONTENT_DIR, META_DIR, AUDIT_DIR, REPORTS_DIR,
    REFERENCE_MATRIX_PATH, SUMMARY_PATH,
    SCORING_WEIGHTS, PASSING_STATUSES, CLAIM_TYPES,
    STATUS_VERIFIED, STATUS_FLAGGED, STATUS_REFUTED,
    STATUS_UNVERIFIED, STATUS_SKIPPED,
    BASELINE_ORDER, score_to_grade,
)
from accuracy_extractors import ClaimExtractor, Claim
from accuracy_meta_extractors import MetaClaimExtractor
from accuracy_verifiers import (
    AccuracyVerifier, VerificationResult, claim_hash,
)


# ─── Constants ──────────────────────────────────────────────────────

COST_PER_TIER2_CALL = 0.005
COST_PER_TIER3_CALL = 0.015
CLAIMS_PER_TIER2_BATCH = 8


# ─── Chapter Loading ───────────────────────────────────────────────

def load_chapter(book_dir: str, chapter_num: int) -> dict:
    """Load a chapter JSON file."""
    path = CONTENT_DIR / book_dir / f"{chapter_num}.json"
    if not path.exists():
        return {}
    return json.load(open(path, encoding='utf-8'))


def iter_chapters(book_filter: str = None,
                  chapter_filter: str = None,
                  chapters_list: list = None) -> list[tuple[str, int, dict]]:
    """Iterate over chapters, optionally filtered.

    Args:
        book_filter: Single book ID to filter to
        chapter_filter: Single chapter ID like "gen1"
        chapters_list: List of {"book": str, "chapter": int} dicts for targeted runs

    Yields: (book_dir, chapter_num, chapter_data)
    """
    books_meta = json.load(open(META_DIR / "books.json", encoding='utf-8'))
    chapters = []

    # Targeted list mode (e.g., re-running T2 on specific chapters)
    if chapters_list:
        for item in chapters_list:
            book_id = item["book"]
            ch_num = item["chapter"]
            data = load_chapter(book_id, ch_num)
            if data:
                chapters.append((book_id, ch_num, data))
        return chapters

    if chapter_filter:
        # Parse chapter filter like "gen1" → book=genesis, ch=1
        book_dir, ch_num = _parse_chapter_id(chapter_filter, books_meta)
        if book_dir:
            data = load_chapter(book_dir, ch_num)
            if data:
                chapters.append((book_dir, ch_num, data))
        return chapters

    # Determine book order
    if book_filter:
        book_ids = [book_filter]
    else:
        # Use baseline priority order, with any missing books appended
        all_ids = {b["id"] for b in books_meta}
        book_ids = [b for b in BASELINE_ORDER if b in all_ids]
        remaining = sorted(all_ids - set(book_ids))
        book_ids.extend(remaining)

    for book_id in book_ids:
        book_dir = CONTENT_DIR / book_id
        if not book_dir.is_dir():
            continue
        for ch_file in sorted(book_dir.glob("*.json")):
            try:
                ch_num = int(ch_file.stem)
            except ValueError:
                continue
            data = json.load(open(ch_file, encoding='utf-8'))
            if isinstance(data, dict):
                chapters.append((book_id, ch_num, data))

    return chapters


def _parse_chapter_id(chapter_id: str, books_meta: list) -> tuple:
    """Parse a chapter ID like 'gen1' into (book_dir, chapter_num)."""
    import re
    # Try pattern: abbreviation + number
    match = re.match(r'^([a-z_]+?)(\d+)$', chapter_id.lower())
    if not match:
        return None, None

    prefix = match.group(1)
    ch_num = int(match.group(2))

    # Find matching book
    for book in books_meta:
        bid = book["id"]
        if bid.startswith(prefix) or bid.replace("_", "").startswith(prefix):
            return bid, ch_num

    return None, None


def _get_testament(book_dir: str) -> str:
    """Get testament (ot/nt) for a book."""
    books_meta = json.load(open(META_DIR / "books.json", encoding='utf-8'))
    for b in books_meta:
        if b["id"] == book_dir:
            return b.get("testament", "ot")
    return "ot"


# ─── Scoring ────────────────────────────────────────────────────────

def score_chapter(results: list[VerificationResult],
                  claims: list[Claim]) -> dict:
    """Compute accuracy score for a chapter.

    Returns dict with overall score, per-type scores, and counts.
    """
    # Group by claim type
    type_claims = defaultdict(list)
    type_results = defaultdict(list)
    for claim, result in zip(claims, results):
        type_claims[claim.claim_type].append(claim)
        type_results[claim.claim_type].append(result)

    type_scores = {}
    for ctype in CLAIM_TYPES:
        results_for_type = type_results.get(ctype, [])
        total = len(results_for_type)
        if total == 0:
            type_scores[ctype] = 100.0  # No claims = perfect score
            continue
        passing = sum(1 for r in results_for_type
                      if r.status in PASSING_STATUSES)
        type_scores[ctype] = (passing / total) * 100.0

    # Weighted overall score
    weighted_sum = sum(
        type_scores.get(ctype, 100.0) * weight
        for ctype, weight in SCORING_WEIGHTS.items()
    )
    overall = weighted_sum

    # Counts
    status_counts = Counter(r.status for r in results)

    return {
        "score": round(overall, 1),
        "grade": score_to_grade(overall),
        "type_scores": {k: round(v, 1) for k, v in type_scores.items()},
        "total_claims": len(claims),
        "by_status": dict(status_counts),
    }


# ─── Reference Matrix ──────────────────────────────────────────────

def load_matrix() -> dict:
    """Load existing reference matrix or create empty one."""
    if REFERENCE_MATRIX_PATH.exists():
        return json.load(open(REFERENCE_MATRIX_PATH, encoding='utf-8'))
    return {
        "metadata": {
            "version": "1.0",
            "baseline_date": None,
            "last_updated": None,
            "corpus_stats": {},
        },
        "claims": {},
    }


def save_matrix(matrix: dict):
    """Save reference matrix to disk."""
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    matrix["metadata"]["last_updated"] = datetime.now(timezone.utc).isoformat()
    if not matrix["metadata"]["baseline_date"]:
        matrix["metadata"]["baseline_date"] = matrix["metadata"]["last_updated"]
    REFERENCE_MATRIX_PATH.write_text(
        json.dumps(matrix, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )


def update_matrix(matrix: dict, claims: list[Claim],
                  results: list[VerificationResult]) -> dict:
    """Update the reference matrix with new verification results."""
    for claim, result in zip(claims, results):
        matrix["claims"][claim.id] = {
            "chapter_id": claim.chapter_id,
            "book_dir": claim.book_dir,
            "section_num": claim.section_num,
            "panel_type": claim.panel_type,
            "claim_type": claim.claim_type,
            "claim_text": claim.claim_text[:500],  # Truncate for size
            "source_attribution": claim.source_attribution,
            "status": result.status,
            "confidence": result.confidence,
            "sources": [s if isinstance(s, dict) else s.to_dict()
                        for s in (result.sources or [])],
            "notes": result.notes,
            "fix_suggestion": result.fix_suggestion,
            "verified_at": result.verified_at,
            "tier": result.tier,
        }

    # Update corpus stats
    all_statuses = Counter(c["status"] for c in matrix["claims"].values())
    all_types = defaultdict(lambda: defaultdict(int))
    for c in matrix["claims"].values():
        all_types[c["claim_type"]][c["status"]] += 1
        all_types[c["claim_type"]]["total"] += 1

    matrix["metadata"]["corpus_stats"] = {
        "total_claims": len(matrix["claims"]),
        "by_status": dict(all_statuses),
        "by_type": {k: dict(v) for k, v in all_types.items()},
    }

    return matrix


# ─── Summary Generation ────────────────────────────────────────────

def generate_summary(matrix: dict, chapter_scores: dict) -> dict:
    """Generate summary.json from matrix and chapter scores."""
    books = defaultdict(lambda: {"chapters": {}, "by_type": {}})

    for ch_key, score_data in chapter_scores.items():
        book_dir, ch_num = ch_key
        books[book_dir]["chapters"][str(ch_num)] = {
            "score": score_data["score"],
            "grade": score_data["grade"],
            "claims": score_data["total_claims"],
            **score_data["by_status"],
        }
        # Accumulate type scores
        for ctype, tscore in score_data["type_scores"].items():
            if ctype not in books[book_dir]["by_type"]:
                books[book_dir]["by_type"][ctype] = []
            books[book_dir]["by_type"][ctype].append(tscore)

    # Compute book averages
    book_summaries = {}
    for book_dir, data in books.items():
        ch_scores = [ch["score"] for ch in data["chapters"].values()]
        avg = sum(ch_scores) / len(ch_scores) if ch_scores else 0
        type_avgs = {}
        for ctype, scores in data["by_type"].items():
            type_avgs[ctype] = round(sum(scores) / len(scores), 1) if scores else 0
        book_summaries[book_dir] = {
            "score": round(avg, 1),
            "grade": score_to_grade(avg),
            "chapters": data["chapters"],
            "by_type": type_avgs,
        }

    # Worst chapters
    all_ch = [(k, v) for k, v in chapter_scores.items()]
    all_ch.sort(key=lambda x: x[1]["score"])
    worst = [
        {"chapter_id": f"{k[0]}{k[1]}", "book": k[0],
         "score": v["score"], **v["by_status"]}
        for k, v in all_ch[:20]
    ]

    all_scores = [v["score"] for v in chapter_scores.values()]
    corpus_avg = sum(all_scores) / len(all_scores) if all_scores else 0

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "corpus_average": round(corpus_avg, 1),
        "books": book_summaries,
        "worst_chapters": worst,
    }

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    SUMMARY_PATH.write_text(json.dumps(summary, indent=1), encoding="utf-8")
    return summary


# ─── Report Generation ──────────────────────────────────────────────

def generate_book_report(book_dir: str, chapter_scores: dict,
                         matrix: dict) -> str:
    """Generate a markdown report for one book."""
    lines = [f"# Accuracy Audit — {book_dir.replace('_', ' ').title()}",
             f"", f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
             ""]

    # Chapter table
    book_chapters = {k: v for k, v in chapter_scores.items() if k[0] == book_dir}
    if not book_chapters:
        lines.append("No chapters audited.")
        return "\n".join(lines)

    lines.append("| Chapter | Scholar | Hebrew | Cross | Hist | Time | Ppl | TOTAL | Grade |")
    lines.append("|---------|---------|--------|-------|------|------|-----|-------|-------|")

    for (bd, ch_num), score in sorted(book_chapters.items(), key=lambda x: x[0][1]):
        ts = score["type_scores"]
        lines.append(
            f"| {ch_num} "
            f"| {ts.get('scholar_attribution', 100):.0f} "
            f"| {ts.get('hebrew_greek', 100):.0f} "
            f"| {ts.get('cross_reference', 100):.0f} "
            f"| {ts.get('historical', 100):.0f} "
            f"| {ts.get('timeline', 100):.0f} "
            f"| {ts.get('people_places', 100):.0f} "
            f"| **{score['score']:.0f}** "
            f"| {score['grade']} |"
        )

    avg = sum(s["score"] for s in book_chapters.values()) / len(book_chapters)
    lines.extend(["", f"**Book Average: {avg:.1f}/100 ({score_to_grade(avg)})**", ""])

    # Flagged and refuted claims
    flagged = []
    refuted = []
    for claim_id, claim_data in matrix.get("claims", {}).items():
        if claim_data.get("book_dir") != book_dir:
            continue
        if claim_data["status"] == STATUS_FLAGGED:
            flagged.append((claim_id, claim_data))
        elif claim_data["status"] == STATUS_REFUTED:
            refuted.append((claim_id, claim_data))

    if refuted:
        lines.append(f"## Refuted Claims ({len(refuted)})")
        lines.append("")
        for claim_id, cd in refuted:
            lines.append(f"### `{claim_id}` [{cd['claim_type']}]")
            lines.append(f"**Claim:** {cd['claim_text'][:200]}")
            if cd.get("source_attribution"):
                lines.append(f"**Attributed to:** {cd['source_attribution']}")
            lines.append(f"**Issue:** {cd['notes']}")
            if cd.get("fix_suggestion"):
                lines.append(f"**Fix:** {cd['fix_suggestion']}")
            lines.append("")

    if flagged:
        lines.append(f"## Flagged Claims ({len(flagged)})")
        lines.append("")
        for claim_id, cd in flagged[:20]:  # Cap at 20 for readability
            lines.append(f"- `{claim_id}` [{cd['claim_type']}]: {cd['notes'][:150]}")
        if len(flagged) > 20:
            lines.append(f"- ... and {len(flagged) - 20} more")
        lines.append("")

    return "\n".join(lines)


# ─── Terminal Output ────────────────────────────────────────────────

def print_header():
    """Print audit header."""
    print("\n═══ COMPANION STUDY — ACCURACY AUDIT ═══════════════════════════")
    print()


def print_chapter_table(book_dir: str, chapter_scores: dict):
    """Print per-chapter score table for a book."""
    book_chapters = {k: v for k, v in chapter_scores.items() if k[0] == book_dir}
    if not book_chapters:
        return

    print(f"  {'Chapter':<10} {'Scholar':>8} {'Hebrew':>8} {'Cross':>8} "
          f"{'Hist':>8} {'Time':>8} {'Ppl':>8}   {'TOTAL':>6}  Grade")
    print(f"  {'─' * 78}")

    for (bd, ch_num), score in sorted(book_chapters.items(), key=lambda x: x[0][1]):
        ts = score["type_scores"]
        print(
            f"  {bd}{ch_num:<5} "
            f"{ts.get('scholar_attribution', 100):>7.0f} "
            f"{ts.get('hebrew_greek', 100):>7.0f} "
            f"{ts.get('cross_reference', 100):>7.0f} "
            f"{ts.get('historical', 100):>7.0f} "
            f"{ts.get('timeline', 100):>7.0f} "
            f"{ts.get('people_places', 100):>7.0f}   "
            f"{score['score']:>5.0f}  {score['grade']}"
        )


def print_summary(chapter_scores: dict, matrix: dict, elapsed: float):
    """Print corpus summary."""
    if not chapter_scores:
        print("  No chapters audited.")
        return

    all_scores = [v["score"] for v in chapter_scores.values()]
    avg = sum(all_scores) / len(all_scores)
    total_claims = sum(v["total_claims"] for v in chapter_scores.values())

    # Count statuses across all results
    status_totals = Counter()
    for v in chapter_scores.values():
        for status, count in v["by_status"].items():
            status_totals[status] += count

    print(f"\n  Corpus Average: {avg:.1f}/100 ({score_to_grade(avg)})")
    print(f"  Claims: {total_claims:,} total | "
          f"{status_totals.get(STATUS_VERIFIED, 0):,} verified | "
          f"{status_totals.get(STATUS_SKIPPED, 0):,} skipped | "
          f"{status_totals.get(STATUS_FLAGGED, 0):,} flagged | "
          f"{status_totals.get(STATUS_REFUTED, 0):,} refuted | "
          f"{status_totals.get(STATUS_UNVERIFIED, 0):,} unverified")
    print(f"  Time: {elapsed:.1f}s")


def print_flagged(matrix: dict, limit: int = 20):
    """Print flagged and refuted claims."""
    flagged = []
    refuted = []

    for claim_id, cd in matrix.get("claims", {}).items():
        if cd["status"] == STATUS_FLAGGED:
            flagged.append((claim_id, cd))
        elif cd["status"] == STATUS_REFUTED:
            refuted.append((claim_id, cd))

    if refuted:
        print(f"\n  ✗ REFUTED ({len(refuted)} claims):")
        for claim_id, cd in refuted[:limit]:
            print(f"    {claim_id}  [{cd['claim_type']}]")
            print(f"      Claim: {cd['claim_text'][:120]}")
            print(f"      Issue: {cd['notes'][:120]}")
            if cd.get("fix_suggestion"):
                print(f"      Fix:   {cd['fix_suggestion'][:120]}")
            print()

    if flagged:
        print(f"\n  ⚠ FLAGGED ({len(flagged)} claims) — showing top {min(limit, len(flagged))}:")
        for claim_id, cd in flagged[:limit]:
            print(f"    {claim_id}  [{cd['claim_type']}]")
            print(f"      {cd['notes'][:150]}")
            print()


def print_worst(chapter_scores: dict, n: int = 20):
    """Print the N worst-scoring chapters."""
    sorted_ch = sorted(chapter_scores.items(), key=lambda x: x[1]["score"])
    print(f"\n  Worst {min(n, len(sorted_ch))} chapters:")
    print(f"  {'Chapter':<20} {'Score':>6}  Grade  {'Claims':>7}  {'Flagged':>8}  {'Refuted':>8}")
    print(f"  {'─' * 70}")
    for (bd, ch), score in sorted_ch[:n]:
        print(f"  {bd} {ch:<12} {score['score']:>5.0f}  {score['grade']:<6} "
              f"{score['total_claims']:>6}  "
              f"{score['by_status'].get(STATUS_FLAGGED, 0):>7}  "
              f"{score['by_status'].get(STATUS_REFUTED, 0):>7}")


def print_cost_estimate(claims: list[Claim]):
    """Print estimated API cost for higher tiers."""
    tier2_claims = [c for c in claims if c.verification_tier == 2]
    tier3_claims = [c for c in claims if c.verification_tier == 3]

    tier2_calls = len(tier2_claims) // CLAIMS_PER_TIER2_BATCH + 1
    tier3_calls = len(tier3_claims)  # 1 call per scholar panel claim group

    tier2_cost = tier2_calls * COST_PER_TIER2_CALL
    tier3_cost = tier3_calls * COST_PER_TIER3_CALL
    total = tier2_cost + tier3_cost

    print(f"\n  Cost Estimate:")
    print(f"    Tier 0+1 (local):  $0.00  ({len(claims) - len(tier2_claims) - len(tier3_claims)} claims)")
    print(f"    Tier 2 (API):      ${tier2_cost:.2f}  ({len(tier2_claims)} claims, ~{tier2_calls} calls)")
    print(f"    Tier 3 (API+web):  ${tier3_cost:.2f}  ({len(tier3_claims)} claims, ~{tier3_calls} calls)")
    print(f"    Total:             ${total:.2f}")


# ─── Main ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Content accuracy auditor for Companion Study"
    )
    parser.add_argument("--book", help="Audit a single book (e.g., genesis)")
    parser.add_argument("--chapter", help="Audit a single chapter (e.g., gen1)")
    parser.add_argument("--chapters-file",
                        help="JSON file with list of {book, chapter} to audit")
    parser.add_argument("--tier", type=int, default=1,
                        help="Max verification tier (0-3, default 1)")
    parser.add_argument("--scholar", help="Audit one scholar across all books")
    parser.add_argument("--type", dest="claim_type",
                        help="Audit one claim type only")
    parser.add_argument("--report", action="store_true",
                        help="Generate markdown reports")
    parser.add_argument("--worst", type=int, metavar="N",
                        help="Show N lowest-scoring chapters")
    parser.add_argument("--flagged", action="store_true",
                        help="List all FLAGGED + REFUTED claims")
    parser.add_argument("--stats", action="store_true",
                        help="Corpus-wide statistics")
    parser.add_argument("--cost-estimate", action="store_true",
                        help="Estimate API cost without running")
    parser.add_argument("--dry-run", action="store_true",
                        help="Extract claims only, no verification")
    parser.add_argument("--json", action="store_true",
                        help="Machine-readable JSON output")
    parser.add_argument("--no-save", action="store_true",
                        help="Don't save matrix or reports")
    parser.add_argument("--no-meta", action="store_true",
                        help="Skip meta content (people, debates, etc.)")
    parser.add_argument("--meta-only", action="store_true",
                        help="Audit meta content only, skip chapters")

    args = parser.parse_args()

    if not args.json:
        print_header()

    start_time = time.time()

    # ── Load target chapters list if provided ─────────────────
    chapters_list = None
    if args.chapters_file:
        if not args.json:
            print(f"  Loading targets from {args.chapters_file}...")
        chapters_list = json.load(open(args.chapters_file, encoding='utf-8'))
        if not args.json:
            print(f"  Targeting {len(chapters_list)} specific chapters")

    # ── Load chapters ────────────────────────────────────────
    if not args.meta_only:
        chapters = iter_chapters(
            book_filter=args.book,
            chapter_filter=args.chapter,
            chapters_list=chapters_list,
        )
    else:
        chapters = []

    if not chapters and not args.meta_only and not args.json:
        print("  No chapters found.")
        sys.exit(1)

    if not args.json:
        if chapters:
            books_seen = set(bd for bd, _, _ in chapters)
            print(f"  Scope: {len(chapters)} chapters across {len(books_seen)} books")

    # ── Extract chapter claims ────────────────────────────────
    extractor = ClaimExtractor()
    all_claims = []
    claims_by_chapter = {}

    for book_dir, ch_num, ch_data in chapters:
        claims = extractor.extract_chapter(ch_data)

        # Filter by scholar if requested
        if args.scholar:
            claims = [c for c in claims if c.panel_type == args.scholar]

        # Filter by claim type if requested
        if args.claim_type:
            claims = [c for c in claims if c.claim_type == args.claim_type]

        all_claims.extend(claims)
        claims_by_chapter[(book_dir, ch_num)] = claims

    # ── Extract meta claims ───────────────────────────────────
    meta_claims = []
    include_meta = (not args.no_meta and not args.book and not args.chapter
                    ) or args.meta_only

    if include_meta:
        meta_extractor = MetaClaimExtractor()
        meta_claims = meta_extractor.extract_all()

        # Apply filters
        if args.scholar:
            meta_claims = [c for c in meta_claims if c.panel_type == args.scholar]
        if args.claim_type:
            meta_claims = [c for c in meta_claims if c.claim_type == args.claim_type]

        all_claims.extend(meta_claims)
        # Group meta claims under a synthetic chapter key
        if meta_claims:
            claims_by_chapter[("meta", 0)] = meta_claims

    if not args.json:
        type_counts = Counter(c.claim_type for c in all_claims)
        tier_counts = Counter(c.verification_tier for c in all_claims)
        ch_count = len([k for k in claims_by_chapter if k[0] != "meta"])
        meta_count = len(meta_claims)
        scope_parts = []
        if ch_count:
            scope_parts.append(f"{ch_count} chapters")
        if meta_count:
            scope_parts.append(f"{meta_count} meta claims")
        print(f"  Extracted: {len(all_claims):,} claims ({', '.join(scope_parts)})")
        print(f"  By type: " + ", ".join(
            f"{t}={n}" for t, n in sorted(type_counts.items())))
        print(f"  By tier: " + ", ".join(
            f"T{t}={n}" for t, n in sorted(tier_counts.items())))

    # ── Cost estimate mode ───────────────────────────────────
    if args.cost_estimate:
        print_cost_estimate(all_claims)
        return

    # ── Dry run mode ─────────────────────────────────────────
    if args.dry_run:
        if args.json:
            print(json.dumps({
                "total_claims": len(all_claims),
                "by_type": dict(Counter(c.claim_type for c in all_claims)),
                "by_tier": dict(Counter(c.verification_tier for c in all_claims)),
                "by_book": dict(Counter(c.book_dir for c in all_claims)),
            }, indent=2))
        else:
            print("\n  Dry run complete. No verification performed.")
        return

    # ── Verify claims ────────────────────────────────────────
    if not args.json:
        print(f"\n  Verifying (max tier {args.tier})...")

    verifier = AccuracyVerifier(max_tier=args.tier)
    all_results = []
    results_by_chapter = {}
    ch_total = len(claims_by_chapter)

    for ch_idx, ((book_dir, ch_num), claims) in enumerate(claims_by_chapter.items(), 1):
        testament = _get_testament(book_dir)
        book_name = book_dir.replace("_", " ").title()
        if not args.json and args.tier >= 2 and ch_total > 1:
            t2_calls = verifier.tier2.call_count if verifier.tier2 else 0
            t3_calls = verifier.tier3.call_count if verifier.tier3 else 0
            api_info = f"T2:{t2_calls}"
            if t3_calls:
                api_info += f" T3:{t3_calls}"
            print(f"\r  [{ch_idx}/{ch_total}] {book_dir} {ch_num} "
                  f"({api_info})", end="", flush=True)
        results = verifier.verify_claims(
            claims, testament, book_name=book_name, chapter_num=ch_num
        )
        all_results.extend(results)
        results_by_chapter[(book_dir, ch_num)] = results

    if not args.json and args.tier >= 2 and ch_total > 1:
        print()  # Clear progress line

    # Report API usage
    if not args.json:
        if verifier.tier2 and verifier.tier2.call_count > 0:
            t2_calls = verifier.tier2.call_count
            t2_cost = t2_calls * COST_PER_TIER2_CALL
            print(f"  Tier 2: {t2_calls} API calls (~${t2_cost:.2f})")
        if verifier.tier3 and verifier.tier3.call_count > 0:
            t3_calls = verifier.tier3.call_count
            t3_cost = t3_calls * COST_PER_TIER3_CALL
            print(f"  Tier 3: {t3_calls} API calls (~${t3_cost:.2f})")

    # ── Score chapters ───────────────────────────────────────
    chapter_scores = {}
    for (book_dir, ch_num), claims in claims_by_chapter.items():
        results = results_by_chapter[(book_dir, ch_num)]
        chapter_scores[(book_dir, ch_num)] = score_chapter(results, claims)

    # ── Update matrix ────────────────────────────────────────
    matrix = load_matrix()
    matrix = update_matrix(matrix, all_claims, all_results)

    if not args.no_save:
        save_matrix(matrix)
        summary = generate_summary(matrix, chapter_scores)
        if not args.json:
            print(f"  Matrix saved: {REFERENCE_MATRIX_PATH.relative_to(ROOT)}")
            print(f"  Summary saved: {SUMMARY_PATH.relative_to(ROOT)}")

    # ── Generate reports ─────────────────────────────────────
    if args.report and not args.no_save:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        books_in_scope = set(bd for bd, _ in chapter_scores)
        for book_dir in books_in_scope:
            report = generate_book_report(book_dir, chapter_scores, matrix)
            report_path = REPORTS_DIR / f"{book_dir}.md"
            report_path.write_text(report, encoding="utf-8")
        if not args.json:
            print(f"  Reports: {len(books_in_scope)} book reports generated")

    elapsed = time.time() - start_time

    # ── Output ───────────────────────────────────────────────
    if args.json:
        print(json.dumps({
            "corpus_average": round(
                sum(v["score"] for v in chapter_scores.values()) /
                len(chapter_scores), 1
            ) if chapter_scores else 0,
            "chapters_audited": len(chapter_scores),
            "total_claims": len(all_claims),
            "by_status": dict(Counter(r.status for r in all_results)),
            "elapsed_seconds": round(elapsed, 1),
        }, indent=2))
        return

    # Terminal output
    if args.book or args.chapter:
        books_to_show = set(bd for bd, _ in chapter_scores)
        for bd in sorted(books_to_show):
            print(f"\n  ─── {bd.replace('_', ' ').title()} ───")
            print_chapter_table(bd, chapter_scores)
    elif len(chapter_scores) <= 50:
        books_to_show = set(bd for bd, _ in chapter_scores)
        for bd in sorted(books_to_show):
            print(f"\n  ─── {bd.replace('_', ' ').title()} ───")
            print_chapter_table(bd, chapter_scores)

    print_summary(chapter_scores, matrix, elapsed)

    if args.worst:
        print_worst(chapter_scores, args.worst)

    if args.flagged:
        print_flagged(matrix)
    elif not args.json:
        # Always show top flagged/refuted
        refuted_count = sum(1 for c in matrix["claims"].values()
                           if c["status"] == STATUS_REFUTED)
        flagged_count = sum(1 for c in matrix["claims"].values()
                           if c["status"] == STATUS_FLAGGED)
        if refuted_count or flagged_count:
            print_flagged(matrix, limit=5)

    print("\n══════════════════════════════════════════════════════════════════")


if __name__ == "__main__":
    main()
