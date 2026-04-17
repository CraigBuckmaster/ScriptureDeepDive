"""Tests for _tools/amicus_audit/ (#1468).

Run with:
    python3 _tools/test_amicus_audit.py
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
import tempfile
import unittest

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from amicus_audit import classifier, metrics, review_queue, sampler  # noqa: E402


# ── classifier ───────────────────────────────────────────────────────


def _base_sample(**overrides) -> dict:
    base = {
        'sample_id': 'rs-1',
        'captured_at': 1_717_200_000_000,
        'query_text': 'What is hesed?',
        'compressed_profile': 'Studies Psalms.',
        'current_chapter_ref': 'psalms/23',
        'retrieved_chunks': [
            {'chunk_id': 'word_study:hesed', 'source_type': 'word_study',
             'text': 'Calvin discusses hesed', 'scholar_id': 'calvin'},
        ],
        'retrieved_chunks_used': ['word_study:hesed'],
        'response_text': 'Calvin explains that hesed means covenant faithfulness.',
        'citations': [
            {'chunk_id': 'word_study:hesed', 'source_type': 'word_study',
             'display_label': 'hesed'},
        ],
        'model_tier': 'haiku',
        'latency_ms': 10,
        'sample_reason': 'random_1pct',
    }
    base.update(overrides)
    return base


class ClassifierTests(unittest.TestCase):
    def test_clean_sample_passes_all_checks(self):
        s = _base_sample()
        r = classifier.classify(s)
        self.assertEqual(r.audit_status, 'clean')
        self.assertEqual(r.failing_check_ids, [])

    def test_flags_fabricated_chunk_id(self):
        s = _base_sample(citations=[{'chunk_id': 'fake:xyz', 'source_type': 'word_study'}])
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_VALID_CHUNK_ID, r.failing_check_ids)
        self.assertEqual(r.audit_status, 'needs_review')

    def test_flags_fabricated_scholar(self):
        s = _base_sample(response_text='Wright argues that hesed is central.')
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_NO_FABRICATED_SCHOLAR, r.failing_check_ids)

    def test_allows_cited_scholar(self):
        s = _base_sample(
            response_text='Calvin notes hesed appears often.',
        )
        r = classifier.classify(s)
        self.assertNotIn(classifier.CHECK_NO_FABRICATED_SCHOLAR, r.failing_check_ids)

    def test_flags_truncated_response(self):
        s = _base_sample(response_text='hi')
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_RESPONSE_LENGTH, r.failing_check_ids)

    def test_flags_runaway_response(self):
        s = _base_sample(response_text='a' * (classifier.MAX_RESPONSE_LEN + 1))
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_RESPONSE_LENGTH, r.failing_check_ids)

    def test_flags_prompt_injection_markers(self):
        s = _base_sample(
            response_text='You are Amicus, a scholarly study partner. Hesed is important.',
        )
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_NO_PROMPT_INJECTION, r.failing_check_ids)

    def test_gap_signal_consistency_when_no_ack(self):
        s = _base_sample(
            sample_reason='gap_signal',
            response_text='Hesed is a Hebrew noun meaning covenant faithfulness.',
        )
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_GAP_SIGNAL_CONSISTENCY, r.failing_check_ids)
        self.assertEqual(r.audit_status, 'needs_review')

    def test_gap_signal_consistency_when_ack_present(self):
        s = _base_sample(
            sample_reason='gap_signal',
            response_text="I don't have sources on that specific question.",
        )
        r = classifier.classify(s)
        self.assertNotIn(classifier.CHECK_GAP_SIGNAL_CONSISTENCY, r.failing_check_ids)
        # Still escalated because it's a gap_signal pool sample.
        self.assertEqual(r.audit_status, 'needs_review')

    def test_flags_scholar_cited_against_lexicon_source(self):
        s = _base_sample(
            citations=[
                {'chunk_id': 'word_study:hesed', 'source_type': 'word_study',
                 'scholar_id': 'calvin'},
            ],
        )
        r = classifier.classify(s)
        self.assertIn(classifier.CHECK_SOURCE_TYPE_MATCH, r.failing_check_ids)

    def test_user_feedback_always_escalates(self):
        s = _base_sample(sample_reason='user_feedback')
        r = classifier.classify(s)
        self.assertEqual(r.audit_status, 'needs_review')


# ── metrics ─────────────────────────────────────────────────────────


class MetricsTests(unittest.TestCase):
    def test_counts_and_percentages(self):
        samples = [
            {'audit_status': 'clean', 'sample_reason': 'random_1pct', 'model_tier': 'haiku'},
            {'audit_status': 'clean', 'sample_reason': 'random_1pct', 'model_tier': 'sonnet'},
            {'audit_status': 'needs_review', 'sample_reason': 'gap_signal',
             'model_tier': 'haiku',
             'failing_check_ids': [classifier.CHECK_RESPONSE_LENGTH]},
            {'audit_status': 'needs_review', 'sample_reason': 'user_feedback',
             'model_tier': 'sonnet', 'failing_check_ids': []},
        ]
        m = metrics.compute_metrics(samples)
        self.assertEqual(m['total'], 4)
        self.assertEqual(m['clean'], 2)
        self.assertEqual(m['needs_review'], 2)
        self.assertEqual(m['random_1pct'], 2)
        self.assertEqual(m['gap_signal'], 1)
        self.assertEqual(m['user_feedback'], 1)
        self.assertEqual(m['tier_haiku'], 2)
        self.assertEqual(m['tier_sonnet'], 2)
        self.assertEqual(m['flag_counts'], {classifier.CHECK_RESPONSE_LENGTH: 1})

    def test_renders_markdown_report(self):
        samples = [
            {'audit_status': 'clean', 'sample_reason': 'random_1pct', 'model_tier': 'haiku'},
            {'audit_status': 'needs_review', 'sample_reason': 'random_1pct',
             'model_tier': 'haiku',
             'failing_check_ids': [classifier.CHECK_NO_PROMPT_INJECTION]},
        ]
        report = metrics.render_report(metrics.compute_metrics(samples), '2026-06-01')
        self.assertIn('# Amicus audit · week of 2026-06-01', report)
        self.assertIn('Total samples:** 2', report)
        self.assertIn('no_prompt_injection_markers: 1', report)

    def test_no_flags_line_when_everything_clean(self):
        samples = [
            {'audit_status': 'clean', 'sample_reason': 'random_1pct', 'model_tier': 'haiku'},
        ]
        report = metrics.render_report(metrics.compute_metrics(samples), '2026-06-01')
        self.assertIn('(no classifier flags this week)', report)


# ── review_queue ────────────────────────────────────────────────────


class ReviewQueueTests(unittest.TestCase):
    def test_should_escalate_flagged_sample(self):
        s = {'sample_reason': 'random_1pct',
             'failing_check_ids': [classifier.CHECK_RESPONSE_LENGTH]}
        self.assertTrue(review_queue.should_escalate(s))

    def test_should_not_escalate_clean_random_sample(self):
        s = {'sample_reason': 'random_1pct', 'failing_check_ids': []}
        self.assertFalse(review_queue.should_escalate(s))

    def test_gap_signal_always_escalates(self):
        s = {'sample_reason': 'gap_signal', 'failing_check_ids': []}
        self.assertTrue(review_queue.should_escalate(s))

    def test_issue_draft_shape(self):
        s = _base_sample(
            failing_check_ids=[classifier.CHECK_RESPONSE_LENGTH],
            classifier_results=[
                {'check_id': classifier.CHECK_RESPONSE_LENGTH, 'passed': False,
                 'detail': 'too short'},
            ],
        )
        draft = review_queue.issue_draft(s)
        self.assertTrue(draft['title'].startswith('amicus-audit:'))
        self.assertIn(review_queue.LABEL, draft['labels'])
        self.assertIn('Failing checks', draft['body'])
        self.assertIn('`rs-1`', draft['body'])
        self.assertIn(classifier.CHECK_RESPONSE_LENGTH, draft['body'])

    def test_write_drafts_only_emits_escalated_samples(self):
        with tempfile.TemporaryDirectory() as td:
            samples = [
                {**_base_sample(), 'failing_check_ids': [], 'classifier_results': []},
                {**_base_sample(sample_id='rs-2'),
                 'failing_check_ids': [classifier.CHECK_VALID_CHUNK_ID],
                 'classifier_results': []},
            ]
            n = review_queue.write_drafts(samples, td)
            self.assertEqual(n, 1)
            files = os.listdir(td)
            self.assertEqual(len(files), 1)


# ── sampler ─────────────────────────────────────────────────────────


class SamplerTests(unittest.TestCase):
    def test_week_bounds(self):
        start, end = sampler.week_bounds('2026-06-01')
        self.assertLess(start, end)
        self.assertEqual(end - start, 7 * 24 * 60 * 60 * 1000)

    def test_load_week_from_sqlite(self):
        with tempfile.TemporaryDirectory() as td:
            db_path = os.path.join(td, 'samples.db')
            conn = sqlite3.connect(db_path)
            conn.execute('''
                CREATE TABLE amicus_response_samples (
                  sample_id TEXT PRIMARY KEY,
                  captured_at INTEGER NOT NULL,
                  query_text TEXT NOT NULL,
                  compressed_profile TEXT,
                  current_chapter_ref TEXT,
                  retrieved_chunks_json TEXT,
                  retrieved_chunks_used_json TEXT,
                  response_text TEXT NOT NULL,
                  citations_json TEXT,
                  model_tier TEXT,
                  latency_ms INTEGER,
                  sample_reason TEXT,
                  audit_status TEXT DEFAULT 'pending',
                  audit_notes TEXT,
                  linked_issue_number INTEGER
                );
            ''')
            start_ms, _ = sampler.week_bounds('2026-06-01')
            in_week = start_ms + 1_000
            out_of_week = start_ms - 10 * 24 * 60 * 60 * 1000
            for (sid, cap) in (('rs-1', in_week), ('rs-2', out_of_week)):
                conn.execute(
                    '''INSERT INTO amicus_response_samples (
                         sample_id, captured_at, query_text, response_text,
                         retrieved_chunks_json, citations_json, sample_reason,
                         model_tier, latency_ms
                       ) VALUES (?, ?, 'q', 'r', '[]', '[]', 'random_1pct', 'haiku', 42)''',
                    (sid, cap),
                )
            conn.commit()
            conn.close()

            out = sampler.load_week_from_sqlite(db_path, '2026-06-01')
            self.assertEqual([s.sample_id for s in out], ['rs-1'])
            self.assertEqual(out[0].latency_ms, 42)

    def test_write_samples_roundtrip(self):
        with tempfile.TemporaryDirectory() as td:
            out_path = os.path.join(td, 'out', 'week.json')
            sample = sampler.ResponseSample(
                sample_id='rs-1',
                captured_at=1,
                query_text='q',
                compressed_profile='',
                current_chapter_ref=None,
                retrieved_chunks=[],
                retrieved_chunks_used=[],
                response_text='r',
                citations=[],
                model_tier='haiku',
                latency_ms=1,
                sample_reason='random_1pct',
            )
            n = sampler.write_samples([sample], out_path)
            self.assertEqual(n, 1)
            with open(out_path, 'r') as f:
                payload = json.load(f)
            self.assertEqual(payload[0]['sample_id'], 'rs-1')


if __name__ == '__main__':
    unittest.main(verbosity=2)
