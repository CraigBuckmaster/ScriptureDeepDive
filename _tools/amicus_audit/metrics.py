#!/usr/bin/env python3
"""metrics.py — Weekly accuracy metrics for audit samples (#1468).

Produces a Markdown report consumed by the ops swim-lane (#1469). Pure
function at its core so unit tests cover the aggregation shape.

Usage:
    python3 _tools/amicus_audit/metrics.py --in cache/2026-06-01.classified.json \\
        > audit_report_2026-06-01.md
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from typing import Iterable, Optional


REPORT_TEMPLATE = """# Amicus audit · week of {week}

- **Total samples:** {total}
- **Clean:** {clean} ({clean_pct:.1f}%)
- **Needs review:** {needs_review} ({needs_pct:.1f}%)

## Sample pools

- Random 1%: {random_1pct}
- Gap signals: {gap_signal}
- User thumbs-downs: {user_feedback}

## Classifier flags

{flag_lines}

## Model tier split

- Haiku: {tier_haiku}
- Sonnet: {tier_sonnet}
{extra}
"""


def compute_metrics(classified_samples: Iterable[dict]) -> dict:
    """Aggregate already-classified samples into report-ready counts.

    Accepts the output shape of `classifier.classify_all` after
    `to_dict()`.
    """
    samples = list(classified_samples)
    total = len(samples)
    by_status = Counter(s.get('audit_status') for s in samples)
    by_reason = Counter(s.get('sample_reason') for s in samples)
    by_tier = Counter(s.get('model_tier') for s in samples)
    flag_counts: Counter = Counter()
    for s in samples:
        for cid in s.get('failing_check_ids') or []:
            flag_counts[cid] += 1
    clean = by_status.get('clean', 0)
    needs_review = by_status.get('needs_review', 0)
    return {
        'total': total,
        'clean': clean,
        'needs_review': needs_review,
        'clean_pct': (clean / total * 100.0) if total else 0.0,
        'needs_pct': (needs_review / total * 100.0) if total else 0.0,
        'random_1pct': by_reason.get('random_1pct', 0),
        'gap_signal': by_reason.get('gap_signal', 0),
        'user_feedback': by_reason.get('user_feedback', 0),
        'tier_haiku': by_tier.get('haiku', 0),
        'tier_sonnet': by_tier.get('sonnet', 0),
        'flag_counts': dict(flag_counts),
    }


def render_report(metrics: dict, week: str, extra: str = '') -> str:
    flags = metrics.get('flag_counts', {})
    if flags:
        flag_lines = '\n'.join(
            f'- {k}: {v}' for k, v in sorted(flags.items(), key=lambda kv: -kv[1])
        )
    else:
        flag_lines = '- (no classifier flags this week)'
    return REPORT_TEMPLATE.format(
        week=week,
        total=metrics['total'],
        clean=metrics['clean'],
        needs_review=metrics['needs_review'],
        clean_pct=metrics['clean_pct'],
        needs_pct=metrics['needs_pct'],
        random_1pct=metrics['random_1pct'],
        gap_signal=metrics['gap_signal'],
        user_feedback=metrics['user_feedback'],
        tier_haiku=metrics['tier_haiku'],
        tier_sonnet=metrics['tier_sonnet'],
        flag_lines=flag_lines,
        extra=('\n' + extra) if extra else '',
    )


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Weekly audit metrics.')
    p.add_argument('--in', dest='in_path', required=True,
                   help='JSON file produced by classifier.py.')
    p.add_argument('--week', required=True,
                   help='ISO date at week start (YYYY-MM-DD).')
    args = p.parse_args(argv)

    with open(args.in_path, 'r', encoding='utf-8') as f:
        samples = json.load(f)
    metrics = compute_metrics(samples)
    sys.stdout.write(render_report(metrics, args.week))
    return 0


if __name__ == '__main__':
    sys.exit(main())
