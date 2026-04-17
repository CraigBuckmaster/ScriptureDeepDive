#!/usr/bin/env python3
"""query.py — Aggregation queries for the Amicus analytics report (#1469).

Runs against a local SQLite export of the `amicus-gaps` D1 database —
`wrangler d1 export amicus-gaps --output=…`. No network calls, no per-user
joins. Pure read path.
"""
from __future__ import annotations

import dataclasses
import datetime as _dt
import sqlite3
from typing import Optional


@dataclasses.dataclass
class WeekMetrics:
    week_start: str
    total_requests: int
    success_count: int
    rate_limit_count: int
    auth_fail_count: int
    haiku_count: int
    sonnet_count: int
    gap_signal_count: int
    p50_latency_ms: float
    p95_latency_ms: float
    mean_input_tokens: float
    mean_output_tokens: float
    dau_premium_peak: int
    dau_partner_plus_peak: int
    dau_premium_total: int
    dau_partner_plus_total: int

    @property
    def success_rate(self) -> float:
        return (
            (self.success_count / self.total_requests * 100.0)
            if self.total_requests else 0.0
        )

    @property
    def rate_limit_pct(self) -> float:
        return (
            (self.rate_limit_count / self.total_requests * 100.0)
            if self.total_requests else 0.0
        )

    @property
    def gap_signal_rate(self) -> float:
        return (
            (self.gap_signal_count / self.success_count * 100.0)
            if self.success_count else 0.0
        )

    @property
    def sonnet_share_pct(self) -> float:
        total = self.haiku_count + self.sonnet_count
        return (self.sonnet_count / total * 100.0) if total else 0.0


def week_range(week_start: str) -> tuple[str, str]:
    """Return ['YYYY-MM-DDTHH', 'YYYY-MM-DDTHH') hour-bucket bounds."""
    start = _dt.datetime.fromisoformat(week_start).replace(
        tzinfo=_dt.timezone.utc,
    )
    end = start + _dt.timedelta(days=7)
    return (
        start.strftime('%Y-%m-%dT%H'),
        end.strftime('%Y-%m-%dT%H'),
    )


def _percentile(sorted_values: list[float], pct: float) -> float:
    if not sorted_values:
        return 0.0
    n = len(sorted_values)
    k = max(0, min(n - 1, int(round(pct / 100 * (n - 1)))))
    return float(sorted_values[k])


def load_week(db_path: str, week_start: str) -> WeekMetrics:
    lo, hi = week_range(week_start)
    date_lo = week_start
    date_hi = (
        _dt.datetime.fromisoformat(week_start).replace(
            tzinfo=_dt.timezone.utc,
        )
        + _dt.timedelta(days=7)
    ).strftime('%Y-%m-%d')

    conn = sqlite3.connect(db_path)
    try:
        hourly = conn.execute(
            """
            SELECT total_requests, success_count, rate_limit_count,
                   auth_fail_count, haiku_count, sonnet_count, gap_signal_count,
                   latency_sum_ms, latency_count,
                   input_tokens_sum, input_tokens_count,
                   output_tokens_sum, output_tokens_count
              FROM amicus_hourly_metrics
             WHERE hour_bucket >= ? AND hour_bucket < ?
            """,
            (lo, hi),
        ).fetchall()

        totals = [0] * 7
        lat_sum = 0.0
        lat_count = 0
        in_tok_sum = 0.0
        in_tok_count = 0
        out_tok_sum = 0.0
        out_tok_count = 0
        for row in hourly:
            for i in range(7):
                totals[i] += int(row[i] or 0)
            lat_sum += float(row[7] or 0)
            lat_count += int(row[8] or 0)
            in_tok_sum += float(row[9] or 0)
            in_tok_count += int(row[10] or 0)
            out_tok_sum += float(row[11] or 0)
            out_tok_count += int(row[12] or 0)

        # Percentiles: approximate by bucketing per-hour mean latency.
        hourly_means = sorted(
            float(row[7] or 0) / max(1, int(row[8] or 0))
            for row in hourly
            if (row[8] or 0) > 0
        )

        dau_rows = conn.execute(
            """
            SELECT dau_premium, dau_partner_plus
              FROM amicus_daily_users
             WHERE date >= ? AND date < ?
            """,
            (date_lo, date_hi),
        ).fetchall()
        dau_premium = [int(r[0] or 0) for r in dau_rows]
        dau_partner = [int(r[1] or 0) for r in dau_rows]
    finally:
        conn.close()

    return WeekMetrics(
        week_start=week_start,
        total_requests=totals[0],
        success_count=totals[1],
        rate_limit_count=totals[2],
        auth_fail_count=totals[3],
        haiku_count=totals[4],
        sonnet_count=totals[5],
        gap_signal_count=totals[6],
        p50_latency_ms=_percentile(hourly_means, 50),
        p95_latency_ms=_percentile(hourly_means, 95),
        mean_input_tokens=(in_tok_sum / in_tok_count) if in_tok_count else 0.0,
        mean_output_tokens=(out_tok_sum / out_tok_count) if out_tok_count else 0.0,
        dau_premium_peak=max(dau_premium) if dau_premium else 0,
        dau_partner_plus_peak=max(dau_partner) if dau_partner else 0,
        dau_premium_total=sum(dau_premium),
        dau_partner_plus_total=sum(dau_partner),
    )


# ── LLM cost estimate ────────────────────────────────────────────────

# April 2026 pricing (per 1M tokens, published list).
HAIKU_IN = 1.00
HAIKU_OUT = 5.00
SONNET_IN = 3.00
SONNET_OUT = 15.00


def estimated_cost_usd(metrics: WeekMetrics) -> dict[str, float]:
    haiku_in = metrics.haiku_count * metrics.mean_input_tokens
    haiku_out = metrics.haiku_count * metrics.mean_output_tokens
    sonnet_in = metrics.sonnet_count * metrics.mean_input_tokens
    sonnet_out = metrics.sonnet_count * metrics.mean_output_tokens
    haiku_cost = (haiku_in / 1_000_000 * HAIKU_IN) + (haiku_out / 1_000_000 * HAIKU_OUT)
    sonnet_cost = (sonnet_in / 1_000_000 * SONNET_IN) + (sonnet_out / 1_000_000 * SONNET_OUT)
    return {
        'haiku': haiku_cost,
        'sonnet': sonnet_cost,
        'total': haiku_cost + sonnet_cost,
    }
