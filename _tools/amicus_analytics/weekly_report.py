#!/usr/bin/env python3
"""weekly_report.py — Render the Amicus weekly analytics report (#1469).

Usage:
    python3 _tools/amicus_analytics/weekly_report.py \\
        --source cache/amicus-gaps.db \\
        --week 2026-06-01 \\
        [--audit-summary cache/2026-06-01.classified.json] \\
        > report.md
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Optional

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from query import WeekMetrics, estimated_cost_usd, load_week  # noqa: E402


TARGET_P95_MS = 2000.0
TARGET_GAP_SIGNAL_PCT = 5.0


def _check(ok: bool) -> str:
    return '✓' if ok else '✗'


def render(
    metrics: WeekMetrics,
    audit_needs_review_pct: Optional[float] = None,
) -> str:
    cost = estimated_cost_usd(metrics)
    total_dau = metrics.dau_premium_peak + metrics.dau_partner_plus_peak
    cost_per_user = (cost['total'] / total_dau) if total_dau else 0.0

    lines: list[str] = []
    lines.append(f'# Amicus weekly report — week of {metrics.week_start}')
    lines.append('')
    lines.append('## Usage')
    lines.append(f'- Total requests: {metrics.total_requests:,}')
    lines.append(f'- Daily active premium users (peak): {metrics.dau_premium_peak:,}')
    lines.append(f'- Daily active Partner+ users (peak): {metrics.dau_partner_plus_peak:,}')
    lines.append('')
    lines.append('## Performance')
    p95_ok = metrics.p95_latency_ms < TARGET_P95_MS
    lines.append(
        f'- p50 / p95 latency: {metrics.p50_latency_ms:.0f}ms / '
        f'{metrics.p95_latency_ms:.0f}ms (target p95 < {TARGET_P95_MS:.0f}ms {_check(p95_ok)})'
    )
    lines.append(f'- Success rate: {metrics.success_rate:.1f}%')
    lines.append(
        f'- Rate-limit hits: {metrics.rate_limit_count:,} '
        f'({metrics.rate_limit_pct:.2f}% of requests)'
    )
    lines.append(f'- Auth failures: {metrics.auth_fail_count:,}')
    lines.append(
        f'- Model mix: Haiku {metrics.haiku_count:,} vs Sonnet {metrics.sonnet_count:,} '
        f'({metrics.sonnet_share_pct:.1f}% Sonnet)'
    )
    lines.append('')
    lines.append('## Cost')
    lines.append(
        f'- Total LLM cost: ${cost["total"]:,.2f} '
        f'(Haiku: ${cost["haiku"]:,.2f}, Sonnet: ${cost["sonnet"]:,.2f})'
    )
    lines.append(f'- Mean input / output tokens: {metrics.mean_input_tokens:.0f} / {metrics.mean_output_tokens:.0f}')
    lines.append(f'- Cost per DAU: ${cost_per_user:.3f}')
    lines.append('')
    lines.append('## Quality signals')
    gap_ok = metrics.gap_signal_rate < TARGET_GAP_SIGNAL_PCT
    lines.append(
        f'- Gap signal rate: {metrics.gap_signal_rate:.2f}% '
        f'(target < {TARGET_GAP_SIGNAL_PCT:.1f}% {_check(gap_ok)})'
    )
    if audit_needs_review_pct is not None:
        lines.append(
            f'- Classifier needs-review rate: {audit_needs_review_pct:.2f}% '
            '(from #1468)'
        )
    lines.append('')
    lines.append('## Privacy posture')
    lines.append('- No per-user tracking. DAU is computed via a 16-char fingerprint')
    lines.append('  of SHA-256(receipt_hash:date) that rotates nightly — raw tokens')
    lines.append('  never touch D1.')
    lines.append('- Query + response text live only in the audit-sampling table,')
    lines.append('  after email/phone scrubbing. See `_tools/amicus_audit/`.')
    lines.append('')
    return '\n'.join(lines)


def _load_audit_pct(path: Optional[str]) -> Optional[float]:
    if not path:
        return None
    with open(path, 'r', encoding='utf-8') as f:
        samples = json.load(f)
    if not samples:
        return 0.0
    flagged = sum(
        1 for s in samples if s.get('audit_status') == 'needs_review'
    )
    return flagged / len(samples) * 100.0


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Weekly Amicus analytics report.')
    p.add_argument('--source', required=True,
                   help='Path to SQLite export of the amicus-gaps D1 database.')
    p.add_argument('--week', required=True,
                   help='ISO date at week start (YYYY-MM-DD, UTC).')
    p.add_argument('--audit-summary',
                   help='Optional path to the #1468 classified samples JSON.')
    args = p.parse_args(argv)

    metrics = load_week(args.source, args.week)
    audit_pct = _load_audit_pct(args.audit_summary)
    sys.stdout.write(render(metrics, audit_pct))
    return 0


if __name__ == '__main__':
    sys.exit(main())
