"""Unit tests for _tools/build_embeddings.py and build_embeddings_chunks.py.

Run locally with:
    python3 _tools/test_build_embeddings.py

All tests work against real repo content and do not make network calls.
"""
from __future__ import annotations

import hashlib
import json
import os
import struct
import sys
import tempfile
import unittest
from pathlib import Path

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import build_embeddings  # noqa: E402
import build_embeddings_chunks as chunks_mod  # noqa: E402


class ChunkerTests(unittest.TestCase):
    """The chunker output must be deterministic, complete, and well-formed."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.chunks = list(chunks_mod.iter_all_chunks())

    def test_nonempty(self) -> None:
        self.assertGreater(len(self.chunks), 1000,
                           'expected tens of thousands of chunks from real corpus')

    def test_every_chunk_has_text(self) -> None:
        for c in self.chunks:
            self.assertTrue(c['text'], f'empty text on chunk {c["chunk_id"]}')

    def test_chunk_ids_are_unique_and_deterministic(self) -> None:
        ids = [c['chunk_id'] for c in self.chunks]
        self.assertEqual(len(ids), len(set(ids)), 'duplicate chunk_id detected')
        ids2 = [c['chunk_id'] for c in chunks_mod.iter_all_chunks()]
        self.assertEqual(ids, ids2,
                         'iter_all_chunks is not deterministic between calls')

    def test_chunk_id_format(self) -> None:
        """chunk_id must be `{source_type}:{source_id}`."""
        for c in self.chunks:
            expected = f'{c["source_type"]}:{c["source_id"]}'
            self.assertEqual(c['chunk_id'], expected)

    def test_metadata_shape(self) -> None:
        required = {
            'scholar_id', 'tradition', 'book_id', 'chapter_num',
            'verse_start', 'verse_end', 'panel_type',
        }
        for c in self.chunks:
            self.assertEqual(set(c['metadata'].keys()), required,
                             f'metadata keys mismatch for {c["chunk_id"]}')

    def test_source_filter(self) -> None:
        ws = list(chunks_mod.iter_all_chunks(source_filter='word_study'))
        self.assertGreater(len(ws), 0)
        for c in ws:
            self.assertEqual(c['source_type'], 'word_study')

    def test_counts_match_spec_rough(self) -> None:
        """Chunk counts per source should be in the ballpark called out in
        #1447. ±20% is plenty for this sanity check; see the dry-run output
        for exact numbers."""
        counts: dict[str, int] = {}
        for c in self.chunks:
            counts[c['source_type']] = counts.get(c['source_type'], 0) + 1
        self.assertGreaterEqual(counts.get('word_study', 0), 40)
        self.assertGreaterEqual(counts.get('debate_topic', 0), 200)
        self.assertGreaterEqual(counts.get('lexicon_entry', 0), 10_000)
        self.assertGreaterEqual(counts.get('section_panel', 0), 5_000)


class ContentHashTests(unittest.TestCase):
    def test_hash_is_stable(self) -> None:
        chunk = {
            'chunk_id': 'x:y',
            'source_type': 'x',
            'source_id': 'y',
            'text': 'hello world',
            'metadata': {'book_id': 'genesis', 'chapter_num': 1},
        }
        self.assertEqual(build_embeddings.content_hash(chunk),
                         build_embeddings.content_hash(chunk))

    def test_hash_changes_with_text(self) -> None:
        base = {
            'chunk_id': 'x:y', 'source_type': 'x', 'source_id': 'y',
            'text': 'a', 'metadata': {},
        }
        other = dict(base, text='b')
        self.assertNotEqual(build_embeddings.content_hash(base),
                            build_embeddings.content_hash(other))


class DbUpsertTests(unittest.TestCase):
    def test_upsert_roundtrip_and_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            build_embeddings.EMBEDDINGS_DB = Path(tmp) / 'e.db'
            conn = build_embeddings.open_embeddings_db()
            chunk = {
                'chunk_id': 'word_study:foo',
                'source_type': 'word_study',
                'source_id': 'foo',
                'text': 't',
                'metadata': {'k': 1},
            }
            vec = [0.0] * build_embeddings.EMBEDDING_DIM
            build_embeddings.upsert_chunk(conn, chunk, 'abc', vec)
            build_embeddings.upsert_chunk(conn, chunk, 'abc', vec)
            conn.commit()
            row = conn.execute('SELECT COUNT(*) FROM embedding_chunks').fetchone()
            self.assertEqual(row[0], 1, 'upsert should be idempotent on chunk_id')
            stored = conn.execute(
                'SELECT embedding FROM embedding_chunks WHERE chunk_id=?',
                ('word_study:foo',),
            ).fetchone()[0]
            unpacked = struct.unpack(
                f'<{build_embeddings.EMBEDDING_DIM}f', stored,
            )
            self.assertEqual(len(unpacked), build_embeddings.EMBEDDING_DIM)
            conn.close()


if __name__ == '__main__':
    unittest.main(verbosity=2)
