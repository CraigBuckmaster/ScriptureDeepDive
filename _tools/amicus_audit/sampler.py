#!/usr/bin/env python3
"""sampler.py — Select a week's Amicus response samples from D1 for audit.

The `amicus_response_samples` table in D1 (Cloudflare Workers binding
`CORPUS_GAPS`) already holds three sample pools written by the proxy:

1. `random_1pct`   — 1% of successful responses, sampled at accept time.
2. `gap_signal`    — 100% of responses that triggered a gap signal
                     (written via the #1471 pipeline).
3. `user_feedback` — 100% of user thumbs-down flags via `/ai/feedback`.

Weekly ops: `python3 _tools/amicus_audit/sampler.py --week 2026-06-01`

The sampler loads the week's rows, normalizes them into JSON the
classifier + review-queue stages can consume, and writes them to
`_tools/amicus_audit/cache/<week>.json`.

For offline use (no D1 creds): point `--source` at a local SQLite file
exported from D1 via `wrangler d1 export`.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import sqlite3
import sys
from dataclasses import dataclass, field
from typing import Iterable, List, Optional


@dataclass
class ResponseSample:
    sample_id: str
    captured_at: int            # ms epoch
    query_text: str
    compressed_profile: str
    current_chapter_ref: Optional[str]
    retrieved_chunks: list      # list of {chunk_id, source_type, ...}
    retrieved_chunks_used: list
    response_text: str
    citations: list             # list of {chunk_id, source_type, display_label, scholar_id?}
    model_tier: str             # 'haiku' | 'sonnet'
    latency_ms: int
    sample_reason: str          # 'random_1pct' | 'gap_signal' | 'user_feedback'
    audit_status: str = 'pending'
    audit_notes: Optional[str] = None
    linked_issue_number: Optional[int] = None

    def to_dict(self) -> dict:
        return {
            'sample_id': self.sample_id,
            'captured_at': self.captured_at,
            'query_text': self.query_text,
            'compressed_profile': self.compressed_profile,
            'current_chapter_ref': self.current_chapter_ref,
            'retrieved_chunks': self.retrieved_chunks,
            'retrieved_chunks_used': self.retrieved_chunks_used,
            'response_text': self.response_text,
            'citations': self.citations,
            'model_tier': self.model_tier,
            'latency_ms': self.latency_ms,
            'sample_reason': self.sample_reason,
            'audit_status': self.audit_status,
            'audit_notes': self.audit_notes,
            'linked_issue_number': self.linked_issue_number,
        }


def week_bounds(week_start: str) -> tuple[int, int]:
    """Return [start_ms, end_ms) for an ISO week-start date (YYYY-MM-DD)."""
    start = _dt.datetime.fromisoformat(week_start).replace(
        tzinfo=_dt.timezone.utc,
    )
    end = start + _dt.timedelta(days=7)
    return int(start.timestamp() * 1000), int(end.timestamp() * 1000)


def _parse_json(raw: Optional[str], fallback):
    if not raw:
        return fallback
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return fallback


def row_to_sample(row: sqlite3.Row) -> ResponseSample:
    return ResponseSample(
        sample_id=row['sample_id'],
        captured_at=int(row['captured_at']),
        query_text=row['query_text'] or '',
        compressed_profile=row['compressed_profile'] or '',
        current_chapter_ref=row['current_chapter_ref'],
        retrieved_chunks=_parse_json(row['retrieved_chunks_json'], []),
        retrieved_chunks_used=_parse_json(row['retrieved_chunks_used_json'], []),
        response_text=row['response_text'] or '',
        citations=_parse_json(row['citations_json'], []),
        model_tier=row['model_tier'] or 'haiku',
        latency_ms=int(row['latency_ms'] or 0),
        sample_reason=row['sample_reason'] or 'random_1pct',
        audit_status=row['audit_status'] or 'pending',
        audit_notes=row['audit_notes'],
        linked_issue_number=row['linked_issue_number'],
    )


def load_week_from_sqlite(
    db_path: str,
    week_start: str,
) -> List[ResponseSample]:
    """Load a week's samples from an on-disk SQLite export of the D1 table."""
    start_ms, end_ms = week_bounds(week_start)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute(
            """
            SELECT sample_id, captured_at, query_text, compressed_profile,
                   current_chapter_ref, retrieved_chunks_json,
                   retrieved_chunks_used_json, response_text, citations_json,
                   model_tier, latency_ms, sample_reason, audit_status,
                   audit_notes, linked_issue_number
              FROM amicus_response_samples
             WHERE captured_at >= ? AND captured_at < ?
             ORDER BY captured_at ASC
            """,
            (start_ms, end_ms),
        )
        return [row_to_sample(r) for r in cur.fetchall()]
    finally:
        conn.close()


def write_samples(
    samples: Iterable[ResponseSample],
    out_path: str,
) -> int:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    payload = [s.to_dict() for s in samples]
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return len(payload)


def default_cache_path(week_start: str) -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(here, 'cache', f'{week_start}.json')


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Sample Amicus responses for audit.')
    p.add_argument('--week', required=True,
                   help='ISO date at week start (YYYY-MM-DD, UTC).')
    p.add_argument('--source', required=True,
                   help='Path to SQLite dump of the amicus_response_samples table.')
    p.add_argument('--out',
                   help='Override the default cache path.')
    args = p.parse_args(argv)

    samples = load_week_from_sqlite(args.source, args.week)
    out = args.out or default_cache_path(args.week)
    n = write_samples(samples, out)
    print(f'wrote {n} samples to {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
