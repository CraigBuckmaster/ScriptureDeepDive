"""Unit tests for _tools/import_openbible_places.py helpers.

Run locally with either:
    python3 _tools/test_import_openbible_places.py
    python3 -m unittest _tools.test_import_openbible_places   # if _tools/__init__.py exists

All tests work on small in-memory fixtures — no source JSONL required.
"""

from __future__ import annotations

import os
import sys
import unittest

# Allow running as a plain script from the repo root or from _tools/.
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from import_openbible_places import (  # type: ignore  # noqa: E402
    OSIS_BOOK_MAP,
    assign_label_dir,
    assign_priority,
    build_place_entry,
    classify_type,
    index_modern_by_id,
    is_duplicate,
    join_and_filter,
    make_id,
    osis_to_ref,
    osises_to_refs,
    parse_ancient_extra,
    parse_lonlat,
)


# ── osis_to_ref ────────────────────────────────────────────────────────

class OsisToRefTest(unittest.TestCase):
    def test_three_segment_osis(self):
        self.assertEqual(osis_to_ref('Gen.12.1'), 'Genesis 12:1')
        self.assertEqual(osis_to_ref('2Kgs.5.12'), '2 Kings 5:12')
        self.assertEqual(osis_to_ref('Rev.16.16'), 'Revelation 16:16')

    def test_two_segment_osis(self):
        self.assertEqual(osis_to_ref('Ps.23'), 'Psalms 23')

    def test_single_segment_osis(self):
        self.assertEqual(osis_to_ref('Jude'), 'Jude')

    def test_unknown_book_is_passed_through(self):
        # Foreign keys should round-trip so we don't silently corrupt data.
        self.assertEqual(osis_to_ref('Unknown.1.1'), 'Unknown 1:1')

    def test_empty_string(self):
        self.assertEqual(osis_to_ref(''), '')

    def test_every_canonical_book_mapped(self):
        # Sanity check: the map should cover at least 66 canonical books.
        self.assertGreaterEqual(len(OSIS_BOOK_MAP), 66)


# ── classify_type ──────────────────────────────────────────────────────

class ClassifyTypeTest(unittest.TestCase):
    def test_water_takes_priority(self):
        self.assertEqual(classify_type('natural', 'water', 'Sea of Galilee'), 'water')
        self.assertEqual(classify_type('human', 'water', 'Harbor'), 'water')

    def test_natural_with_mountain_keyword(self):
        self.assertEqual(classify_type('natural', 'land', 'Mount Sinai'), 'mountain')
        self.assertEqual(classify_type('natural', 'land', 'Mizar Hill'), 'mountain')

    def test_natural_with_region_keyword(self):
        self.assertEqual(classify_type('natural', 'land', 'Valley of Hinnom'), 'region')
        self.assertEqual(classify_type('natural', 'land', 'Land of Goshen'), 'region')
        self.assertEqual(classify_type('natural', 'land', 'Wilderness of Sin'), 'region')

    def test_natural_fallback_to_site(self):
        self.assertEqual(classify_type('natural', 'land', 'Rock of Rimmon'), 'site')

    def test_human_is_city(self):
        self.assertEqual(classify_type('human', 'land', 'Jerusalem'), 'city')


# ── assign_priority ────────────────────────────────────────────────────

class AssignPriorityTest(unittest.TestCase):
    def test_tier_1_for_50_plus(self):
        self.assertEqual(assign_priority(500), 1)
        self.assertEqual(assign_priority(50), 1)

    def test_tier_2_for_10_to_49(self):
        self.assertEqual(assign_priority(49), 2)
        self.assertEqual(assign_priority(10), 2)

    def test_tier_3_for_5_to_9(self):
        self.assertEqual(assign_priority(9), 3)
        self.assertEqual(assign_priority(5), 3)

    def test_tier_4_default(self):
        self.assertEqual(assign_priority(4), 4)
        self.assertEqual(assign_priority(0), 4)


# ── assign_label_dir ───────────────────────────────────────────────────

class AssignLabelDirTest(unittest.TestCase):
    def test_rotates_through_dirs(self):
        seen = {assign_label_dir(i) for i in range(8)}
        self.assertEqual(seen, {'e', 'n', 'w', 's', 'ne', 'nw', 'se', 'sw'})

    def test_wraps_after_eight(self):
        self.assertEqual(assign_label_dir(8), assign_label_dir(0))


# ── parse_lonlat ───────────────────────────────────────────────────────

class ParseLonLatTest(unittest.TestCase):
    def test_valid_string(self):
        self.assertEqual(parse_lonlat('35.2,31.7'), (35.2, 31.7))

    def test_with_whitespace(self):
        self.assertEqual(parse_lonlat(' 35.2 , 31.7 '), (35.2, 31.7))

    def test_invalid_inputs(self):
        self.assertIsNone(parse_lonlat(''))
        self.assertIsNone(parse_lonlat('35.2'))
        self.assertIsNone(parse_lonlat('a,b'))
        self.assertIsNone(parse_lonlat(None))  # type: ignore[arg-type]


# ── parse_ancient_extra ────────────────────────────────────────────────

class ParseAncientExtraTest(unittest.TestCase):
    def test_json_string_parsed(self):
        raw = '{"osises":["Gen.1.1"]}'
        self.assertEqual(parse_ancient_extra(raw), {'osises': ['Gen.1.1']})

    def test_dict_returned_as_is(self):
        d = {'osises': ['Gen.1.1']}
        self.assertEqual(parse_ancient_extra(d), d)

    def test_malformed_json_returns_empty(self):
        self.assertEqual(parse_ancient_extra('not json'), {})

    def test_non_object_json_returns_empty(self):
        # A top-level list is valid JSON but not a dict.
        self.assertEqual(parse_ancient_extra('[1,2,3]'), {})


# ── osises_to_refs ─────────────────────────────────────────────────────

class OsisesToRefsTest(unittest.TestCase):
    def test_limits_output(self):
        osises = [f'Gen.{i}.1' for i in range(1, 11)]
        self.assertEqual(len(osises_to_refs(osises, limit=5)), 5)

    def test_preserves_order(self):
        self.assertEqual(
            osises_to_refs(['Gen.12.1', 'Exod.3.1']),
            ['Genesis 12:1', 'Exodus 3:1'],
        )

    def test_empty_and_none_inputs(self):
        self.assertEqual(osises_to_refs([]), [])
        self.assertEqual(osises_to_refs(None), [])  # type: ignore[arg-type]

    def test_skips_non_strings(self):
        # Defensive: bad data in the source shouldn't crash the import.
        self.assertEqual(osises_to_refs(['Gen.1.1', None, 42, 'Exod.3.1']), ['Genesis 1:1', 'Exodus 3:1'])  # type: ignore[list-item]


# ── make_id ────────────────────────────────────────────────────────────

class MakeIdTest(unittest.TestCase):
    def test_slugifies_name(self):
        self.assertEqual(make_id('Jerusalem', set()), 'jerusalem')
        self.assertEqual(make_id('Abel-beth-maacah', set()), 'abel_beth_maacah')
        self.assertEqual(make_id("Sea of Galilee", set()), 'sea_of_galilee')

    def test_avoids_collisions(self):
        existing = {'jerusalem'}
        self.assertEqual(make_id('Jerusalem', existing), 'jerusalem_2')
        existing.add('jerusalem_2')
        self.assertEqual(make_id('Jerusalem', existing), 'jerusalem_3')

    def test_empty_name_falls_back(self):
        self.assertEqual(make_id('', set()), 'place')


# ── is_duplicate ───────────────────────────────────────────────────────

class IsDuplicateTest(unittest.TestCase):
    def setUp(self):
        self.existing = [
            {'id': 'jerusalem', 'ancient': 'Jerusalem', 'lat': 31.77, 'lon': 35.23},
            {'id': 'bethlehem', 'ancient': 'Bethlehem', 'lat': 31.70, 'lon': 35.20},
        ]

    def test_exact_name_match(self):
        new = {'ancient': 'jerusalem', 'lat': 0.0, 'lon': 0.0}
        self.assertTrue(is_duplicate(new, self.existing))

    def test_close_coords_and_substring_name(self):
        new = {'ancient': 'Jerusalem (old)', 'lat': 31.78, 'lon': 35.24}
        self.assertTrue(is_duplicate(new, self.existing))

    def test_different_far_place(self):
        new = {'ancient': 'Rome', 'lat': 41.9, 'lon': 12.5}
        self.assertFalse(is_duplicate(new, self.existing))

    def test_same_coords_but_unrelated_name(self):
        # Same location, but names don't share a substring → not a dup.
        new = {'ancient': 'Foobar', 'lat': 31.77, 'lon': 35.23}
        self.assertFalse(is_duplicate(new, self.existing))


# ── build_place_entry + join_and_filter (end-to-end on fixtures) ───────

def _ancient(id_: str, name: str, modern_id: str, osises: list[str], cls: str = 'human') -> dict:
    return {
        'id': id_,
        'friendly_id': name,
        'identifications': [{'id': modern_id, 'id_source': 'modern', 'class': cls}],
        'extra': '{"osises":%s}' % ('[' + ','.join(f'"{o}"' for o in osises) + ']'),
    }


def _modern(id_: str, name: str, lonlat: str, ancient_id: str, score: int,
            cls: str = 'human', land_or_water: str = 'land') -> dict:
    return {
        'id': id_,
        'friendly_id': name,
        'lonlat': lonlat,
        'class': cls,
        'type': 'node',
        'land_or_water': land_or_water,
        'ancient_associations': {
            ancient_id: {'name': name, 'score': score, 'url_slug': name.lower()},
        },
    }


class BuildPlaceEntryTest(unittest.TestCase):
    def test_builds_full_entry(self):
        ancient = _ancient('a1', 'Megiddo', 'm1', ['Judg.5.19', '2Kgs.23.29'])
        modern = _modern('m1', 'Tel Megiddo', '35.184,32.585', 'a1', 1000)
        existing_ids: set[str] = set()
        entry = build_place_entry(
            ancient, modern,
            osises=['Judg.5.19', '2Kgs.23.29'],
            label_index=0, existing_ids=existing_ids,
        )
        self.assertIsNotNone(entry)
        assert entry is not None  # mypy / narrowing
        self.assertEqual(entry['id'], 'megiddo')
        self.assertEqual(entry['ancient'], 'Megiddo')
        self.assertEqual(entry['modern'], 'Tel Megiddo')
        self.assertAlmostEqual(entry['lat'], 32.585, places=3)
        self.assertAlmostEqual(entry['lon'], 35.184, places=3)
        self.assertEqual(entry['type'], 'city')
        self.assertEqual(entry['priority'], 4)  # 2 refs
        self.assertIn(entry['labelDir'], {'e', 'n', 'w', 's', 'ne', 'nw', 'se', 'sw'})
        self.assertEqual(entry['stories'], [])
        self.assertEqual(entry['refs'], ['Judges 5:19', '2 Kings 23:29'])
        self.assertEqual(entry['confidence'], 1000)
        self.assertIn('megiddo', existing_ids)

    def test_missing_coords_returns_none(self):
        ancient = _ancient('a1', 'NoCoords', 'm1', ['Gen.1.1'])
        modern = _modern('m1', 'Whatever', '', 'a1', 500)  # bad lonlat
        self.assertIsNone(build_place_entry(ancient, modern, ['Gen.1.1'], 0, set()))


class JoinAndFilterTest(unittest.TestCase):
    def _build_rows(self):
        a1 = _ancient('a1', 'Megiddo', 'm1', ['Judg.5.19', '2Kgs.23.29', 'Rev.16.16'])
        a2 = _ancient('a2', 'LowScore', 'm2', ['Gen.1.1'])
        a3 = _ancient('a3', 'NoOsises', 'm3', [])
        # Exact-name collision with an existing place → filtered via is_duplicate.
        a4 = _ancient('a4', 'Jerusalem', 'm4', ['Gen.1.1'])
        a5 = _ancient('a5', 'NoModern', 'mMissing', ['Gen.1.1'])

        m1 = _modern('m1', 'Tel Megiddo', '35.184,32.585', 'a1', 1000)
        # Below threshold confidence → filtered out.
        m2 = _modern('m2', 'Tel Lowscore', '35.5,32.5', 'a2', 50)
        m3 = _modern('m3', 'Tel NoRef', '35.6,32.6', 'a3', 800)
        m4 = _modern('m4', 'Jerusalem Modern', '35.23,31.77', 'a4', 900)
        # Note: m5 missing, so a5 join fails silently.
        return [a1, a2, a3, a4, a5], [m1, m2, m3, m4]

    def test_join_filter_dedup(self):
        ancients, moderns = self._build_rows()
        existing = [
            {'id': 'jerusalem', 'ancient': 'Jerusalem', 'lat': 31.77, 'lon': 35.23},
        ]
        out = join_and_filter(ancients, moderns, existing)
        # Expect only Megiddo — lowscore filtered, no-ref filtered, dup filtered, no-modern filtered.
        self.assertEqual(len(out), 1)
        self.assertEqual(out[0]['ancient'], 'Megiddo')
        # labelDir rotates per final order — first entry is always 'e'.
        self.assertEqual(out[0]['labelDir'], 'e')

    def test_sorted_by_ref_count_desc(self):
        # 3 ancient entries → 3, 2, 1 refs respectively. All should survive.
        a_big = _ancient('b', 'Big', 'mb', ['Gen.1.1', 'Gen.1.2', 'Gen.1.3'])
        a_mid = _ancient('m', 'Mid', 'mm', ['Gen.1.1', 'Gen.1.2'])
        a_sml = _ancient('s', 'Sml', 'ms', ['Gen.1.1'])
        moderns = [
            _modern('mb', 'Mod Big', '10.0,10.0', 'b', 900),
            _modern('mm', 'Mod Mid', '20.0,20.0', 'm', 900),
            _modern('ms', 'Mod Sml', '30.0,30.0', 's', 900),
        ]
        out = join_and_filter([a_sml, a_mid, a_big], moderns, [])
        self.assertEqual([e['ancient'] for e in out], ['Big', 'Mid', 'Sml'])

    def test_target_max_enforced(self):
        rows = []
        moderns = []
        for i in range(30):
            a_id = f'a{i}'
            m_id = f'm{i}'
            rows.append(_ancient(a_id, f'City{i}', m_id, ['Gen.1.1']))
            moderns.append(_modern(m_id, f'Mod{i}', f'{i}.0,{i}.0', a_id, 900))
        out = join_and_filter(rows, moderns, [], target_max=10)
        self.assertEqual(len(out), 10)


# ── index_modern_by_id ─────────────────────────────────────────────────

class IndexModernByIdTest(unittest.TestCase):
    def test_indexes_by_id(self):
        rows = [{'id': 'a'}, {'id': 'b'}, {'no_id': True}]
        idx = index_modern_by_id(rows)  # type: ignore[arg-type]
        self.assertIn('a', idx)
        self.assertIn('b', idx)
        self.assertEqual(len(idx), 2)


if __name__ == '__main__':
    unittest.main()
