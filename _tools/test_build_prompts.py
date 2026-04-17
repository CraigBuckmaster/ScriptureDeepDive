"""Unit tests for _tools/build_prompts.py helpers (Card #1461).

Run with:
    python3 _tools/test_build_prompts.py
"""
from __future__ import annotations

import os
import sys
import unittest

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import build_prompts  # noqa: E402
import build_prompts_entity as entity  # noqa: E402
from build_prompts_variants import PROFILE_VARIANTS, variant_ids, variant_by_id  # noqa: E402


class ProfileVariantTests(unittest.TestCase):
    def test_six_fixed_variants(self):
        self.assertEqual(len(PROFILE_VARIANTS), 6)

    def test_every_variant_has_required_fields(self):
        for v in PROFILE_VARIANTS:
            self.assertTrue(v['id'])
            self.assertTrue(v['label'])
            self.assertTrue(v['seed_instruction'])

    def test_variant_ids_unique_and_findable(self):
        ids = variant_ids()
        self.assertEqual(len(ids), len(set(ids)))
        for vid in ids:
            self.assertIsNotNone(variant_by_id(vid))
        self.assertIsNone(variant_by_id('nonexistent'))

    def test_generic_balanced_default_present(self):
        self.assertIn('generic_balanced', variant_ids())


class EntityChipTests(unittest.TestCase):
    def test_person_chips_shape(self):
        chips = entity.person_chips('abraham', 'Abraham')
        self.assertEqual(len(chips), 3)
        for c in chips:
            self.assertIn('label', c)
            self.assertIn('seed_query', c)
            self.assertIn('expected_source_types', c)
            self.assertIn('Abraham', c['seed_query'])

    def test_place_chips_reference_the_place(self):
        chips = entity.place_chips('jerusalem', 'Jerusalem')
        for c in chips:
            self.assertIn('Jerusalem', c['seed_query'])

    def test_debate_chips_shape(self):
        chips = entity.debate_chips('election-vs-predestination', 'Election vs. Predestination')
        self.assertEqual(len(chips), 3)
        for c in chips:
            self.assertTrue(c['label'])

    def test_all_entity_rows_iterates_all_types(self):
        rows = entity.all_entity_rows()
        types = {r['entity_type'] for r in rows}
        self.assertIn('person', types)
        self.assertIn('place', types)
        self.assertIn('debate_topic', types)


class ChipValidationTests(unittest.TestCase):
    GOOD = [
        {
            'label': 'What does Romans 9 say on election?',
            'seed_query': 'Explain election in Romans 9 briefly.',
            'expected_source_types': ['section_panel', 'debate_topic'],
        },
        {
            'label': 'Compare Reformed and Jewish readings of this',
            'seed_query': 'How do Reformed and Jewish readings differ?',
            'expected_source_types': ['section_panel'],
        },
        {
            'label': 'Why does Paul use potter and clay imagery',
            'seed_query': 'Why the potter-and-clay metaphor?',
            'expected_source_types': ['chapter_panel'],
        },
    ]

    def test_accepts_valid_chips(self):
        out = build_prompts._validate_chips(self.GOOD)
        self.assertEqual(len(out), 3)

    def test_rejects_wrong_count(self):
        with self.assertRaises(ValueError):
            build_prompts._validate_chips(self.GOOD[:2])

    def test_rejects_short_label(self):
        bad = [dict(self.GOOD[0], label='Too short')] + self.GOOD[1:]
        with self.assertRaises(ValueError):
            build_prompts._validate_chips(bad)

    def test_rejects_long_label(self):
        bad = [dict(self.GOOD[0], label=' '.join(['word'] * 12))] + self.GOOD[1:]
        with self.assertRaises(ValueError):
            build_prompts._validate_chips(bad)

    def test_filters_unknown_source_types(self):
        bad = [dict(self.GOOD[0], expected_source_types=['bogus', 'section_panel'])]
        out = build_prompts._validate_chips(bad + self.GOOD[1:])
        self.assertEqual(out[0]['expected_source_types'], ['section_panel'])

    def test_rejects_missing_seed_query(self):
        bad = [dict(self.GOOD[0], seed_query='')] + self.GOOD[1:]
        with self.assertRaises(ValueError):
            build_prompts._validate_chips(bad)


class ContextTextTests(unittest.TestCase):
    def test_context_includes_title_and_headers(self):
        data = {
            'title': 'Romans 9',
            'subtitle': 'Israel and the Sovereignty of God',
            'sections': [
                {'header': 'The Election of Israel'},
                {'header': 'Vessels of Mercy and Wrath'},
            ],
        }
        ctx = build_prompts.chapter_context_text(data)
        self.assertIn('Romans 9', ctx)
        self.assertIn('Election of Israel', ctx)
        self.assertIn('Vessels', ctx)


if __name__ == '__main__':
    unittest.main(verbosity=2)
