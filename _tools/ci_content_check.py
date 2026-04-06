#!/usr/bin/env python3
"""
ci_content_check.py — CI orchestrator for content quality + accuracy gates.

Designed to run in GitHub Actions on PRs that touch content files. Takes a
list of changed files, runs quality_scorer and accuracy_auditor on affected
chapters, compares against baseline, and outputs structured results.

Usage:
    # With changed files as args
    python3 _tools/ci_content_check.py content/genesis/1.json content/genesis/2.json

    # With changed files via stdin (one per line)
    git diff --name-only origin/master HEAD -- 'content/*/[0-9]*.json' | \
        python3 _tools/ci_content_check.py --stdin

    # Dry run (show what would be checked)
    python3 _tools/ci_content_check.py --dry-run content/genesis/1.json

Output:
    Prints JSON to stdout with: hard_errors, quality_warnings,
    accuracy_warnings, summary_markdown, issues_to_create.
    Also writes to _tools/audit/ci_results.json.

Exit codes:
    0 = no hard errors (warnings may exist)
    1 = hard errors found (should block PR)
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
from datetime import datetime, timezone
from pathlib import Path

# Ensure _tools is on path
TOOLS_DIR = Path(__file__).resolve().parent
ROOT = TOOLS_DIR.parent
sys.path.insert(0, str(TOOLS_DIR))

from accuracy_config import (
    CONTENT_DIR, META_DIR, AUDIT_DIR, QUALITY_FLOOR,
    REFERENCE_MATRIX_PATH, STATUS_VERIFIED, STATUS_FLAGGED,
    STATUS_REFUTED, STATUS_SKIPPED, STATUS_UNVERIFIED,
    PASSING_STATUSES, SCORING_WEIGHTS, score_to_grade,
)
from accuracy_extractors import ClaimExtractor
from accuracy_verifiers import AccuracyVerifier, claim_hash


# ─── Changed File Parsing ───────────────────────────────────────────

def parse_changed_files(file_paths: list[str]) -> dict:
    """Parse changed file paths into book/chapter pairs.

    Args:
        file_paths: List of paths like "content/genesis/1.json"

    Returns:
        Dict of {book_dir: [chapter_nums]}
    """
    chapters = defaultdict(list)
    for fp in file_paths:
        fp = fp.strip()
        if not fp:
            continue
        parts = Path(fp).parts
        # Expect: content/{book}/{chapter}.json
        if len(parts) < 3 or parts[0] != "content":
            continue
        book_dir = parts[1]
        if book_dir in ("meta", "verses"):
            continue
        try:
            ch_num = int(Path(parts[2]).stem)
            chapters[book_dir].append(ch_num)
        except ValueError:
            continue

    return dict(chapters)


def parse_changed_meta_files(file_paths: list[str]) -> list[str]:
    """Parse changed file paths to find modified meta files.

    Args:
        file_paths: List of paths like "content/meta/debate-topics.json"

    Returns:
        List of meta filenames that changed (e.g. ["debate-topics.json"])
    """
    meta_files = []
    for fp in file_paths:
        fp = fp.strip()
        if not fp:
            continue
        parts = Path(fp).parts
        if len(parts) >= 3 and parts[0] == "content" and parts[1] == "meta":
            meta_files.append(parts[2])
    return meta_files


# ─── Quality Check ──────────────────────────────────────────────────

def run_quality_check(book_dir: str, chapter_nums: list[int]) -> list[dict]:
    """Run quality_scorer on specific chapters.

    Returns list of {chapter, score, grade, findings} dicts.
    """
    try:
        from quality_scorer import QualityEvaluator
    except ImportError:
        return [{"chapter": ch, "score": -1, "grade": "?",
                 "findings": ["quality_scorer import failed"]} for ch in chapter_nums]

    content_dir = str(CONTENT_DIR)
    verse_dir = str(CONTENT_DIR / "verses")
    evaluator = QualityEvaluator(content_dir, verse_dir)

    # Run at book level and filter to requested chapters
    try:
        report = evaluator.run(book=book_dir)
    except Exception as e:
        return [{"chapter": ch, "score": -1, "grade": "?",
                 "findings": [f"Quality check error: {str(e)[:200]}"]}
                for ch in chapter_nums]

    # Index results by chapter_num
    scored = {ch.chapter_num: ch for ch in report.chapters}

    results = []
    for ch_num in chapter_nums:
        ch_score = scored.get(ch_num)
        if ch_score is None:
            results.append({
                "chapter": ch_num, "score": -1, "grade": "?",
                "findings": ["Chapter not found in quality report"],
            })
            continue

        findings = []
        for cat_name, cat in ch_score.categories.items():
            for f in cat.findings:
                if f.severity in ("warning", "critical"):
                    findings.append(f"{cat_name}: {f.message}")

        results.append({
            "chapter": ch_num,
            "score": round(ch_score.total_score, 1),
            "grade": ch_score.grade,
            "findings": findings,
        })

    return results


# ─── Accuracy Check ─────────────────────────────────────────────────

def run_accuracy_check(book_dir: str, chapter_nums: list[int],
                       max_tier: int = 2) -> dict:
    """Run accuracy_auditor on specific chapters.

    Returns {
        claims: [{id, type, status, notes, ...}],
        stats: {total, verified, flagged, refuted, unverified},
        tier2_calls: int,
        tier2_cost: float,
    }
    """
    extractor = ClaimExtractor()
    verifier = AccuracyVerifier(max_tier=max_tier)

    all_claims = []
    all_results = []

    # Determine testament
    books_meta = json.load(open(META_DIR / "books.json"))
    testament = "ot"
    for b in books_meta:
        if b["id"] == book_dir:
            testament = b.get("testament", "ot")
            break
    book_name = book_dir.replace("_", " ").title()

    for ch_num in chapter_nums:
        ch_path = CONTENT_DIR / book_dir / f"{ch_num}.json"
        if not ch_path.exists():
            continue

        ch_data = json.load(open(ch_path))
        if not isinstance(ch_data, dict):
            continue

        claims = extractor.extract_chapter(ch_data)
        results = verifier.verify_claims(
            claims, testament, book_name=book_name, chapter_num=ch_num
        )
        all_claims.extend(claims)
        all_results.extend(results)

    # Build stats
    status_counts = Counter(r.status for r in all_results)

    # Get Tier 2 usage
    t2_calls = verifier.tier2.call_count if verifier.tier2 else 0
    t2_cost = t2_calls * 0.005

    claim_details = []
    for claim, result in zip(all_claims, all_results):
        claim_details.append({
            "id": claim.id,
            "chapter_id": claim.chapter_id,
            "panel_type": claim.panel_type,
            "claim_type": claim.claim_type,
            "claim_text": claim.claim_text[:300],
            "source_attribution": claim.source_attribution,
            "status": result.status,
            "confidence": result.confidence,
            "notes": result.notes,
            "fix_suggestion": result.fix_suggestion,
            "tier": result.tier,
        })

    return {
        "claims": claim_details,
        "stats": dict(status_counts),
        "total": len(all_claims),
        "tier2_calls": t2_calls,
        "tier2_cost": round(t2_cost, 2),
    }


# ─── Meta Accuracy Check ──────────────────────────────────────────

# Map meta filenames to the MetaClaimExtractor methods that handle them
META_FILE_EXTRACTORS = {
    "debate-topics.json": "extract_debate_topics",
    "difficult-passages.json": "extract_difficult_passages",
    "prophecy-chains.json": "extract_prophecy_chains",
    "concepts.json": "extract_concepts",
    "people.json": "extract_people",
}


def run_meta_accuracy_check(meta_files: list[str],
                            max_tier: int = 2) -> dict:
    """Run accuracy auditing on changed meta files.

    Uses MetaClaimExtractor to extract claims from the specified meta files,
    then verifies them through the standard accuracy pipeline.

    Returns same shape as run_accuracy_check().
    """
    try:
        from accuracy_meta_extractors import MetaClaimExtractor
    except ImportError:
        return {
            "claims": [], "stats": {}, "total": 0,
            "tier2_calls": 0, "tier2_cost": 0,
            "meta_note": "accuracy_meta_extractors import failed",
        }

    extractor = MetaClaimExtractor()
    verifier = AccuracyVerifier(max_tier=max_tier)
    all_claims = []

    for meta_file in meta_files:
        method_name = META_FILE_EXTRACTORS.get(meta_file)
        if not method_name:
            continue
        method = getattr(extractor, method_name, None)
        if not method:
            continue
        try:
            claims = method()
            all_claims.extend(claims)
        except Exception as e:
            print(f"  Meta extractor error ({meta_file}): {e}", file=sys.stderr)

    if not all_claims:
        return {
            "claims": [], "stats": {}, "total": 0,
            "tier2_calls": 0, "tier2_cost": 0,
        }

    # Verify extracted claims
    all_results = verifier.verify_claims(all_claims, "ot")

    status_counts = Counter(r.status for r in all_results)
    t2_calls = verifier.tier2.call_count if verifier.tier2 else 0
    t2_cost = t2_calls * 0.005

    claim_details = []
    for claim, result in zip(all_claims, all_results):
        claim_details.append({
            "id": claim.id,
            "chapter_id": f"meta/{claim.chapter_id}",
            "panel_type": claim.panel_type,
            "claim_type": claim.claim_type,
            "claim_text": claim.claim_text[:300],
            "source_attribution": claim.source_attribution,
            "status": result.status,
            "confidence": result.confidence,
            "notes": result.notes,
            "fix_suggestion": result.fix_suggestion,
            "tier": result.tier,
        })

    return {
        "claims": claim_details,
        "stats": dict(status_counts),
        "total": len(all_claims),
        "tier2_calls": t2_calls,
        "tier2_cost": round(t2_cost, 2),
    }


# ─── Baseline Comparison ────────────────────────────────────────────

def compare_baseline(current_claims: list[dict]) -> dict:
    """Compare current accuracy results against committed baseline.

    Returns {
        new_flagged: [{claim details}],
        new_refuted: [{claim details}],
        resolved: [{claim details}],  # was flagged, now verified
    }
    """
    # Load baseline
    if REFERENCE_MATRIX_PATH.exists():
        baseline = json.load(open(REFERENCE_MATRIX_PATH))
        baseline_claims = baseline.get("claims", {})
    else:
        baseline_claims = {}

    new_flagged = []
    new_refuted = []
    resolved = []

    for claim in current_claims:
        cid = claim["id"]
        baseline_entry = baseline_claims.get(cid, {})
        baseline_status = baseline_entry.get("status")

        if claim["status"] == STATUS_REFUTED:
            if baseline_status != STATUS_REFUTED:
                new_refuted.append(claim)

        elif claim["status"] == STATUS_FLAGGED:
            if baseline_status != STATUS_FLAGGED:
                new_flagged.append(claim)

        elif claim["status"] in (STATUS_VERIFIED, STATUS_SKIPPED):
            if baseline_status == STATUS_FLAGGED:
                resolved.append(claim)

    return {
        "new_flagged": new_flagged,
        "new_refuted": new_refuted,
        "resolved": resolved,
    }


# ─── Summary Markdown ───────────────────────────────────────────────

def build_summary_markdown(
    changed: dict,
    quality_results: dict,
    accuracy_results: dict,
    regression: dict,
    hard_errors: list,
    quality_warnings: list,
    accuracy_warnings: list,
) -> str:
    """Build the PR comment markdown with section-level detail."""

    lines = ["## Content Pipeline — Quality & Accuracy Report", ""]

    # Overall status
    if hard_errors:
        lines.append("❌ **Hard errors found — PR should not merge**")
    elif quality_warnings or accuracy_warnings:
        lines.append("⚠️ **Warnings found — review recommended**")
    else:
        lines.append("✅ **All content checks passed**")
    lines.append("")

    # Scope
    total_chapters = sum(len(chs) for chs in changed.values())
    total_books = len(changed)
    lines.append(f"**Scope:** {total_chapters} chapter(s) across {total_books} book(s)")
    lines.append("")

    # ── Quality: per-chapter scores with findings ──────────────
    all_quality = []
    for book, results in quality_results.items():
        all_quality.extend([(book, r) for r in results])

    if all_quality:
        lines.append("### Content Quality")
        lines.append("")
        lines.append("| Chapter | Score | Grade | Status |")
        lines.append("|---------|-------|-------|--------|")
        chapters_with_findings = []
        for book, qr in all_quality:
            score = qr["score"]
            grade = qr["grade"]
            if score < 0:
                status = "⚠️ Error"
            elif score < QUALITY_FLOOR:
                status = f"⚠️ Below {QUALITY_FLOOR}"
            else:
                status = "✅"
            lines.append(f"| {book} {qr['chapter']} | {score} | {grade} | {status} |")
            if qr.get("findings"):
                chapters_with_findings.append((book, qr))
        lines.append("")

        # Show findings per chapter in collapsible section
        if chapters_with_findings:
            lines.append("<details>")
            lines.append("<summary>Quality findings detail</summary>")
            lines.append("")
            for book, qr in chapters_with_findings:
                lines.append(f"**{book} {qr['chapter']}**")
                for f in qr["findings"][:5]:
                    lines.append(f"- {f}")
                if len(qr["findings"]) > 5:
                    lines.append(f"- *...and {len(qr['findings']) - 5} more*")
                lines.append("")
            lines.append("</details>")
            lines.append("")

    # ── Accuracy: section-level detail ─────────────────────────
    total_claims = 0
    total_verified = 0
    total_flagged = 0
    total_refuted = 0
    issues_by_chapter = {}  # chapter_id -> [(panel, type, status, notes)]

    for book, ar in accuracy_results.items():
        total_claims += ar["total"]
        total_verified += ar["stats"].get(STATUS_VERIFIED, 0) + ar["stats"].get(STATUS_SKIPPED, 0)
        total_flagged += ar["stats"].get(STATUS_FLAGGED, 0)
        total_refuted += ar["stats"].get(STATUS_REFUTED, 0)

        for claim in ar["claims"]:
            if claim["status"] not in PASSING_STATUSES:
                ch_key = claim["chapter_id"]
                if ch_key not in issues_by_chapter:
                    issues_by_chapter[ch_key] = []
                issues_by_chapter[ch_key].append(claim)

    if total_claims > 0:
        lines.append("### Content Accuracy")
        lines.append("")
        lines.append(f"**{total_claims}** claims checked — "
                     f"**{total_verified}** verified, "
                     f"**{total_flagged}** flagged, "
                     f"**{total_refuted}** refuted")

        # Tier 2 cost summary
        t2_calls = sum(ar["tier2_calls"] for ar in accuracy_results.values())
        if t2_calls > 0:
            t2_cost = sum(ar["tier2_cost"] for ar in accuracy_results.values())
            lines.append(f" ({t2_calls} Tier 2 API calls, ~${t2_cost:.2f})")
        lines.append("")

        # Only show detail for refuted claims (these block the PR)
        if issues_by_chapter:
            all_issues = [c for claims in issues_by_chapter.values() for c in claims]
            refuted = [c for c in all_issues if c["status"] == STATUS_REFUTED]
            if refuted:
                lines.append("")
                for c in refuted[:10]:
                    note = c["notes"][:100] if c["notes"] else ""
                    lines.append(f"- ❌ **{c['chapter_id']}** `{c['panel_type']}` {c['claim_type']}: {note}")
                    if c.get("fix_suggestion"):
                        lines.append(f"  > Fix: {c['fix_suggestion'][:150]}")
                if len(refuted) > 10:
                    lines.append(f"- *...and {len(refuted) - 10} more*")
                lines.append("")

    # ── Regression ─────────────────────────────────────────────
    if regression["resolved"]:
        lines.append(f"### ✅ Resolved ({len(regression['resolved'])} previously flagged claims now verified)")
        lines.append("")

    # Hard errors detail
    if hard_errors:
        lines.append("### Hard Errors (blocking)")
        lines.append("")
        for err in hard_errors:
            lines.append(f"- ❌ {err}")
        lines.append("")

    lines.append("---")
    lines.append("*Generated by `ci_content_check.py`*")

    return "\n".join(lines)


# ─── Issue Templates ────────────────────────────────────────────────

def build_issues_to_create(
    quality_warnings: list,
    accuracy_warnings: list,
    regression: dict,
) -> list[dict]:
    """Build list of GitHub issues to create."""
    issues = []

    # Quality issues
    for book, qr in quality_warnings:
        issues.append({
            "title": f"[Content Quality] {book.replace('_',' ').title()} "
                     f"{qr['chapter']} below {QUALITY_FLOOR} ({qr['score']})",
            "labels": ["content", "bug"],
            "body": (
                f"## Quality Score Below Floor\n\n"
                f"**Chapter:** {book}/{qr['chapter']}.json\n"
                f"**Score:** {qr['score']} / 100 (Grade: {qr['grade']})\n"
                f"**Floor:** {QUALITY_FLOOR}\n\n"
                f"### Findings\n" +
                "\n".join(f"- {f}" for f in qr.get("findings", [])) +
                f"\n\n### Action Required\n"
                f"Enrich content to reach {QUALITY_FLOOR}+ score.\n\n"
                f"---\n*Auto-generated by Content Pipeline CI*"
            ),
        })

    # Accuracy regression issues (group by chapter)
    chapter_flags = defaultdict(list)
    for c in regression.get("new_flagged", []):
        ch_key = c.get("chapter_id", "unknown")
        chapter_flags[ch_key].append(c)
    for c in regression.get("new_refuted", []):
        ch_key = c.get("chapter_id", "unknown")
        chapter_flags[ch_key].append(c)

    for ch_key, claims in chapter_flags.items():
        flags = [c for c in claims if c["status"] == STATUS_FLAGGED]
        refuted = [c for c in claims if c["status"] == STATUS_REFUTED]

        title_parts = []
        if refuted:
            title_parts.append(f"{len(refuted)} refuted")
        if flags:
            title_parts.append(f"{len(flags)} flagged")

        body_lines = [
            f"## New Accuracy Issues\n",
            f"**Chapter:** {ch_key}",
            f"**New issues:** {', '.join(title_parts)}\n",
        ]

        if refuted:
            body_lines.append("### Refuted Claims\n")
            for c in refuted:
                body_lines.append(f"#### `{c['id']}` [{c['claim_type']}]")
                body_lines.append(f"- **Claim:** {c['claim_text'][:200]}")
                if c.get("source_attribution"):
                    body_lines.append(f"- **Source:** {c['source_attribution']}")
                body_lines.append(f"- **Issue:** {c['notes']}")
                if c.get("fix_suggestion"):
                    body_lines.append(f"- **Fix:** {c['fix_suggestion']}")
                body_lines.append("")

        if flags:
            body_lines.append("### Flagged Claims\n")
            for c in flags[:10]:
                body_lines.append(f"- `{c['id']}` [{c['claim_type']}]: {c['notes'][:150]}")
            if len(flags) > 10:
                body_lines.append(f"- ... and {len(flags) - 10} more")
            body_lines.append("")

        body_lines.append("---\n*Auto-generated by Content Pipeline CI*")

        issues.append({
            "title": f"[Content Accuracy] {ch_key} — {', '.join(title_parts)}",
            "labels": ["content", "bug"],
            "body": "\n".join(body_lines),
        })

    return issues


# ─── Main ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="CI content quality + accuracy check"
    )
    parser.add_argument("files", nargs="*", help="Changed file paths")
    parser.add_argument("--stdin", action="store_true",
                        help="Read file paths from stdin")
    parser.add_argument("--tier", type=int, default=2,
                        help="Max accuracy tier (default 2)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would be checked")
    parser.add_argument("--quality-only", action="store_true",
                        help="Run quality checks only")
    parser.add_argument("--accuracy-only", action="store_true",
                        help="Run accuracy checks only")

    args = parser.parse_args()

    # Collect changed files
    file_paths = list(args.files)
    if args.stdin:
        file_paths.extend(sys.stdin.read().strip().split("\n"))

    if not file_paths:
        print(json.dumps({"error": "No files provided"}))
        sys.exit(0)

    # Parse into book/chapter pairs
    changed = parse_changed_files(file_paths)
    changed_meta = parse_changed_meta_files(file_paths)

    if not changed and not changed_meta:
        result = {
            "status": "skip",
            "message": "No chapter content changes detected",
            "hard_errors": [],
            "quality_warnings": [],
            "accuracy_warnings": [],
            "issues_to_create": [],
        }
        print(json.dumps(result, indent=2))
        sys.exit(0)

    total_chapters = sum(len(chs) for chs in changed.values())
    print(f"Content check: {total_chapters} chapter(s) across "
          f"{len(changed)} book(s)", file=sys.stderr)
    for book, chapters in sorted(changed.items()):
        print(f"  {book}: chapters {sorted(chapters)}", file=sys.stderr)
    if changed_meta:
        print(f"Meta files changed: {changed_meta}", file=sys.stderr)

    if args.dry_run:
        print(json.dumps({"changed": {k: sorted(v) for k, v in changed.items()},
                          "status": "dry_run"}, indent=2))
        sys.exit(0)

    # ── Run checks ───────────────────────────────────────────
    hard_errors = []
    quality_warnings = []
    quality_passing = []
    accuracy_warnings = []
    quality_results = {}
    accuracy_results = {}
    regression = {"new_flagged": [], "new_refuted": [], "resolved": []}

    # Quality
    if not args.accuracy_only:
        print("Running quality checks...", file=sys.stderr)
        for book, chapters in changed.items():
            qr = run_quality_check(book, chapters)
            quality_results[book] = qr
            for r in qr:
                if r["score"] >= 0 and r["score"] < QUALITY_FLOOR:
                    quality_warnings.append((book, r))
                elif r["score"] >= QUALITY_FLOOR:
                    quality_passing.append((book, r))

    # Accuracy
    if not args.quality_only:
        print(f"Running accuracy checks (max tier {args.tier})...",
              file=sys.stderr)
        for book, chapters in changed.items():
            ar = run_accuracy_check(book, chapters, max_tier=args.tier)
            accuracy_results[book] = ar

            # Check for hard errors
            for claim in ar["claims"]:
                if claim["status"] == STATUS_REFUTED:
                    hard_errors.append(
                        f"REFUTED: {claim['id']} — {claim['notes'][:150]}"
                    )

        # Meta accuracy checks (when meta files changed)
        routable_meta = [f for f in changed_meta if f in META_FILE_EXTRACTORS]
        if routable_meta:
            print(f"Running meta accuracy checks for: {routable_meta}",
                  file=sys.stderr)
            meta_ar = run_meta_accuracy_check(
                routable_meta, max_tier=args.tier
            )
            if meta_ar["total"] > 0:
                accuracy_results["_meta"] = meta_ar
                for claim in meta_ar["claims"]:
                    if claim["status"] == STATUS_REFUTED:
                        hard_errors.append(
                            f"META REFUTED: {claim['id']} — {claim['notes'][:150]}"
                        )

        # Baseline comparison
        all_claims = []
        for ar in accuracy_results.values():
            all_claims.extend(ar["claims"])
        regression = compare_baseline(all_claims)

        if regression["new_refuted"]:
            for c in regression["new_refuted"]:
                hard_errors.append(
                    f"NEW REFUTED: {c['id']} — {c['notes'][:150]}"
                )

        if regression["new_flagged"]:
            accuracy_warnings.extend(regression["new_flagged"])

    # ── Build output ─────────────────────────────────────────
    summary_md = build_summary_markdown(
        changed, quality_results, accuracy_results,
        regression, hard_errors, quality_warnings, accuracy_warnings,
    )

    issues = build_issues_to_create(
        quality_warnings, accuracy_warnings, regression,
    )

    result = {
        "status": "fail" if hard_errors else ("warn" if (quality_warnings or accuracy_warnings) else "pass"),
        "hard_errors": hard_errors,
        "quality_warnings": [
            {"book": b, "chapter": r["chapter"], "score": r["score"]}
            for b, r in quality_warnings
        ],
        "quality_passing": [
            {"book": b, "chapter": r["chapter"], "score": r["score"]}
            for b, r in quality_passing
        ],
        "accuracy_warnings_count": len(accuracy_warnings),
        "new_refuted": len(regression["new_refuted"]),
        "new_flagged": len(regression["new_flagged"]),
        "resolved": len(regression["resolved"]),
        "total_claims_checked": sum(ar["total"] for ar in accuracy_results.values()),
        "tier2_calls": sum(ar["tier2_calls"] for ar in accuracy_results.values()),
        "tier2_cost": round(sum(ar["tier2_cost"] for ar in accuracy_results.values()), 2),
        "summary_markdown": summary_md,
        "issues_to_create": issues,
    }

    # Save results
    ci_results_path = AUDIT_DIR / "ci_results.json"
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    ci_results_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Results saved to {ci_results_path.relative_to(ROOT)}",
          file=sys.stderr)

    # Output JSON to stdout (for CI to consume)
    print(json.dumps(result, indent=2))

    # Exit code
    sys.exit(1 if hard_errors else 0)


if __name__ == "__main__":
    main()
