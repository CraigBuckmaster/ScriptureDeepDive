"""Tests for _tools/amicus_analytics/ (#1469)."""
from __future__ import annotations

import os
import sqlite3
import sys
import tempfile
import unittest

_HERE = os.path.dirname(os.path.abspath(__file__))
_ANALYTICS = os.path.join(_HERE, 'amicus_analytics')
for p in (_HERE, _ANALYTICS):
    if p not in sys.path:
        sys.path.insert(0, p)

import query as q  # noqa: E402
import weekly_report as wr  # noqa: E402


def _seed_db(path: str) -> None:
    conn = sqlite3.connect(path)
    conn.executescript('''
        CREATE TABLE amicus_hourly_metrics (
          hour_bucket TEXT PRIMARY KEY,
          total_requests INTEGER NOT NULL DEFAULT 0,
          success_count INTEGER NOT NULL DEFAULT 0,
          rate_limit_count INTEGER NOT NULL DEFAULT 0,
          auth_fail_count INTEGER NOT NULL DEFAULT 0,
          haiku_count INTEGER NOT NULL DEFAULT 0,
          sonnet_count INTEGER NOT NULL DEFAULT 0,
          gap_signal_count INTEGER NOT NULL DEFAULT 0,
          latency_sum_ms REAL NOT NULL DEFAULT 0,
          latency_count INTEGER NOT NULL DEFAULT 0,
          input_tokens_sum REAL NOT NULL DEFAULT 0,
          input_tokens_count INTEGER NOT NULL DEFAULT 0,
          output_tokens_sum REAL NOT NULL DEFAULT 0,
          output_tokens_count INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE amicus_daily_users (
          date TEXT PRIMARY KEY,
          dau_premium INTEGER NOT NULL DEFAULT 0,
          dau_partner_plus INTEGER NOT NULL DEFAULT 0
        );
    ''')
    # Two hours on day 1 (in week), one hour on day 8 (out of week).
    hourly = [
        ('2026-06-01T10', 100, 98, 1, 1, 80, 20, 4, 100_000, 100, 50_000, 100, 8_000, 100),
        ('2026-06-01T11', 120, 119, 1, 0, 100, 20, 5, 150_000, 120, 60_000, 120, 9_600, 120),
        ('2026-06-08T10', 50,  50,  0, 0,  40, 10, 0,  50_000,  50, 25_000, 50, 4_000,  50),
    ]
    conn.executemany(
        '''INSERT INTO amicus_hourly_metrics VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        hourly,
    )
    dau = [
        ('2026-06-01', 120, 5),
        ('2026-06-02', 150, 7),
        ('2026-06-08',  50, 2),   # out of week
    ]
    conn.executemany('INSERT INTO amicus_daily_users VALUES (?, ?, ?)', dau)
    conn.commit()
    conn.close()


class QueryTests(unittest.TestCase):
    def test_load_week_aggregates_in_window(self):
        with tempfile.TemporaryDirectory() as td:
            db = os.path.join(td, 'x.db')
            _seed_db(db)
            m = q.load_week(db, '2026-06-01')
            self.assertEqual(m.total_requests, 220)
            self.assertEqual(m.success_count, 217)
            self.assertEqual(m.rate_limit_count, 2)
            self.assertEqual(m.haiku_count, 180)
            self.assertEqual(m.sonnet_count, 40)
            self.assertEqual(m.gap_signal_count, 9)
            self.assertEqual(m.dau_premium_peak, 150)
            self.assertEqual(m.dau_partner_plus_peak, 7)
            self.assertEqual(m.dau_premium_total, 270)
            # Latency numbers are hour-level means over 2 hours.
            self.assertGreater(m.p95_latency_ms, 0)
            self.assertGreater(m.mean_input_tokens, 0)

    def test_rates_and_pcts(self):
        with tempfile.TemporaryDirectory() as td:
            db = os.path.join(td, 'x.db')
            _seed_db(db)
            m = q.load_week(db, '2026-06-01')
            self.assertAlmostEqual(m.success_rate, 217 / 220 * 100, places=2)
            self.assertAlmostEqual(m.rate_limit_pct, 2 / 220 * 100, places=2)
            self.assertAlmostEqual(m.gap_signal_rate, 9 / 217 * 100, places=2)
            self.assertAlmostEqual(m.sonnet_share_pct, 40 / 220 * 100, places=2)

    def test_empty_week(self):
        with tempfile.TemporaryDirectory() as td:
            db = os.path.join(td, 'x.db')
            _seed_db(db)
            m = q.load_week(db, '2025-01-01')
            self.assertEqual(m.total_requests, 0)
            self.assertEqual(m.success_rate, 0.0)
            self.assertEqual(m.p95_latency_ms, 0.0)

    def test_estimated_cost_nonzero(self):
        m = q.WeekMetrics(
            week_start='2026-06-01',
            total_requests=100, success_count=100, rate_limit_count=0,
            auth_fail_count=0, haiku_count=80, sonnet_count=20,
            gap_signal_count=3,
            p50_latency_ms=0, p95_latency_ms=0,
            mean_input_tokens=500, mean_output_tokens=200,
            dau_premium_peak=10, dau_partner_plus_peak=1,
            dau_premium_total=30, dau_partner_plus_total=3,
        )
        cost = q.estimated_cost_usd(m)
        self.assertGreater(cost['total'], 0)
        self.assertAlmostEqual(cost['haiku'] + cost['sonnet'], cost['total'])


class ReportTests(unittest.TestCase):
    def _sample_metrics(self) -> q.WeekMetrics:
        return q.WeekMetrics(
            week_start='2026-06-01',
            total_requests=220, success_count=217, rate_limit_count=2,
            auth_fail_count=1, haiku_count=180, sonnet_count=40,
            gap_signal_count=9,
            p50_latency_ms=1200, p95_latency_ms=1800,
            mean_input_tokens=600, mean_output_tokens=250,
            dau_premium_peak=150, dau_partner_plus_peak=7,
            dau_premium_total=270, dau_partner_plus_total=12,
        )

    def test_report_mentions_headline_metrics(self):
        m = self._sample_metrics()
        out = wr.render(m, audit_needs_review_pct=3.2)
        self.assertIn('# Amicus weekly report — week of 2026-06-01', out)
        self.assertIn('Total requests: 220', out)
        self.assertIn('1800ms', out)   # p95
        self.assertIn('Sonnet', out)
        self.assertIn('Privacy posture', out)
        self.assertIn('3.20%', out)    # audit rate formatted

    def test_report_hides_audit_line_when_unavailable(self):
        out = wr.render(self._sample_metrics(), audit_needs_review_pct=None)
        self.assertNotIn('Classifier needs-review rate', out)


if __name__ == '__main__':
    unittest.main(verbosity=2)
