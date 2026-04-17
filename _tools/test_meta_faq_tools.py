"""Tests for _tools/meta_faq/ (#1470)."""
from __future__ import annotations

import os
import sqlite3
import sys
import tempfile
import unittest

_HERE = os.path.dirname(os.path.abspath(__file__))
_META = os.path.join(_HERE, 'meta_faq')
for p in (_HERE, _META):
    if p not in sys.path:
        sys.path.insert(0, p)

import count as count_mod  # noqa: E402
import prioritize as prio  # noqa: E402


# ── prioritize.py ────────────────────────────────────────────────────


def _seed_corpus_gaps(path: str) -> None:
    conn = sqlite3.connect(path)
    conn.executescript('''
        CREATE TABLE corpus_gaps (
          gap_id TEXT PRIMARY KEY,
          scrubbed_summary TEXT,
          gap_type TEXT,
          occurrence_count INTEGER,
          status TEXT,
          source_reason TEXT,
          captured_at INTEGER,
          redacted INTEGER DEFAULT 0
        );
    ''')
    rows = [
        ('g1', 'Reformed vs Jewish readings of Romans 9',  'content', 47, 'new',
         'gap_signal',   1000),
        ('g2', 'LXX translation decisions in Isaiah 7:14', 'translation', 31, 'new',
         'user_feedback', 1001),
        ('g3', 'Already addressed topic',                   'content',  99, 'addressed',
         'gap_signal',   1002),
        ('g4', 'Low-frequency one-off',                     'content',   2, 'new',
         'gap_signal',   1003),
        ('g5', 'Redacted',                                  'content',  40, 'redacted',
         'gap_signal',   1004),
    ]
    conn.executemany(
        'INSERT INTO corpus_gaps VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        rows,
    )
    conn.commit()
    conn.close()


class PrioritizeTests(unittest.TestCase):
    def test_loads_only_active_rows_above_threshold(self):
        with tempfile.TemporaryDirectory() as td:
            db = os.path.join(td, 'x.db')
            _seed_corpus_gaps(db)
            cs = prio.load_candidates(db, min_occurrences=5)
            ids = {c.gap_id for c in cs}
            self.assertEqual(ids, {'g1', 'g2'})

    def test_user_feedback_weighting(self):
        g1 = prio.Candidate(
            gap_id='g1', summary='a', gap_type='content',
            occurrence_count=47, status='new', reason='gap_signal',
            captured_at=None,
        )
        g2 = prio.Candidate(
            gap_id='g2', summary='b', gap_type='translation',
            occurrence_count=31, status='new', reason='user_feedback',
            captured_at=None,
        )
        # g2 has lower count but 3× weight → should outrank g1.
        self.assertEqual(g1.score, 47.0)
        self.assertEqual(g2.score, 93.0)
        ranked = prio.rank([g1, g2], top=2)
        self.assertEqual([c.gap_id for c in ranked], ['g2', 'g1'])

    def test_render_markdown_columns(self):
        cs = [
            prio.Candidate(
                gap_id='g1', summary='A quick summary with | pipes',
                gap_type='content', occurrence_count=40, status='new',
                reason='gap_signal', captured_at=None,
            ),
        ]
        md = prio.render_markdown(cs)
        self.assertIn('| Rank | Score |', md)
        self.assertIn('`gap_signal`', md)
        # The pipe should be escaped so it doesn't break the table.
        self.assertIn('\\|', md)

    def test_empty_candidates(self):
        self.assertIn('No candidate gaps', prio.render_markdown([]))


# ── count.py ─────────────────────────────────────────────────────────


class CountTests(unittest.TestCase):
    def test_counts_md_files_excluding_playbook(self):
        with tempfile.TemporaryDirectory() as td:
            for name in ('a.md', 'b.md', 'c.md', 'PLAYBOOK.md', '_draft.md', 'README.txt'):
                with open(os.path.join(td, name), 'w') as f:
                    f.write('x')
            self.assertEqual(count_mod.count_articles(td), 3)

    def test_quarterly_target_grows_with_time(self):
        # Baseline quarter → 50
        from datetime import datetime
        self.assertEqual(
            count_mod.quarterly_target(datetime(2026, 4, 1)), 50,
        )
        # One full quarter later (Jul 1) → 70
        self.assertEqual(
            count_mod.quarterly_target(datetime(2026, 7, 1)), 70,
        )
        # Six months later → 90
        self.assertEqual(
            count_mod.quarterly_target(datetime(2026, 10, 1)), 90,
        )

    def test_real_meta_faq_count(self):
        # Sanity-check the packaged articles are above the baseline.
        here = os.path.dirname(os.path.abspath(__file__))
        meta_dir = os.path.abspath(os.path.join(here, '..', 'content', 'meta_faq'))
        self.assertGreaterEqual(count_mod.count_articles(meta_dir), 50)


if __name__ == '__main__':
    unittest.main(verbosity=2)
