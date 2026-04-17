#!/usr/bin/env python3
"""prioritize.py — Rank corpus-gap clusters as meta-FAQ candidates (#1470).

Reads the `corpus_gaps` D1 table (exported to a local SQLite file via
`wrangler d1 export`) and scores each row for meta-FAQ candidacy:

  score = occurrence_count * weight_for_reason
  weight(random_1pct) = 1.0
  weight(gap_signal)  = 1.0
  weight(user_feedback) = 3.0   # direct user signal is worth 3×

Rows that already look resolved (status = 'addressed' | 'redacted') are
skipped. The tool prints a ranked markdown table the content editor can
work from.

Usage:
    python3 _tools/meta_faq/prioritize.py --source cache/amicus-gaps.db
    python3 _tools/meta_faq/prioritize.py --source cache/amicus-gaps.db --top 25
    python3 _tools/meta_faq/prioritize.py --source cache/amicus-gaps.db --min-occurrences 10
"""
from __future__ import annotations

import argparse
import dataclasses
import sqlite3
import sys
from typing import Iterable, Optional


USER_FEEDBACK_WEIGHT = 3.0
DEFAULT_MIN_OCCURRENCES = 5
DEFAULT_TOP = 30


@dataclasses.dataclass
class Candidate:
    gap_id: str
    summary: str
    gap_type: str
    occurrence_count: int
    status: str
    reason: str
    captured_at: Optional[int]

    @property
    def score(self) -> float:
        weight = USER_FEEDBACK_WEIGHT if self.reason == 'user_feedback' else 1.0
        return self.occurrence_count * weight


def load_candidates(
    db_path: str,
    *,
    min_occurrences: int = DEFAULT_MIN_OCCURRENCES,
) -> list[Candidate]:
    conn = sqlite3.connect(db_path)
    try:
        rows = conn.execute(
            """
            SELECT gap_id,
                   COALESCE(scrubbed_summary, '(redacted)') AS summary,
                   COALESCE(gap_type, 'content') AS gap_type,
                   COALESCE(occurrence_count, 1) AS occurrence_count,
                   COALESCE(status, 'new') AS status,
                   COALESCE(source_reason, 'gap_signal') AS reason,
                   captured_at
              FROM corpus_gaps
             WHERE COALESCE(status, 'new') NOT IN ('addressed', 'redacted')
               AND COALESCE(occurrence_count, 1) >= ?
             ORDER BY occurrence_count DESC
            """,
            (min_occurrences,),
        ).fetchall()
    except sqlite3.OperationalError as err:
        # `source_reason` column is optional — older schemas won't have it.
        if 'source_reason' in str(err):
            rows = conn.execute(
                """
                SELECT gap_id,
                       COALESCE(scrubbed_summary, '(redacted)') AS summary,
                       COALESCE(gap_type, 'content') AS gap_type,
                       COALESCE(occurrence_count, 1) AS occurrence_count,
                       COALESCE(status, 'new') AS status,
                       'gap_signal' AS reason,
                       captured_at
                  FROM corpus_gaps
                 WHERE COALESCE(status, 'new') NOT IN ('addressed', 'redacted')
                   AND COALESCE(occurrence_count, 1) >= ?
                 ORDER BY occurrence_count DESC
                """,
                (min_occurrences,),
            ).fetchall()
        else:
            raise
    finally:
        conn.close()

    return [
        Candidate(
            gap_id=r[0],
            summary=r[1],
            gap_type=r[2],
            occurrence_count=int(r[3]),
            status=r[4],
            reason=r[5],
            captured_at=r[6],
        )
        for r in rows
    ]


def rank(candidates: Iterable[Candidate], *, top: int = DEFAULT_TOP) -> list[Candidate]:
    sorted_cs = sorted(candidates, key=lambda c: c.score, reverse=True)
    return sorted_cs[:top]


def render_markdown(candidates: list[Candidate]) -> str:
    if not candidates:
        return '_No candidate gaps above the occurrence threshold._\n'
    lines: list[str] = []
    lines.append('# Meta-FAQ candidate queue')
    lines.append('')
    lines.append(
        '| Rank | Score | Hits | Reason | Type | Summary |'
    )
    lines.append(
        '|---:|---:|---:|---|---|---|'
    )
    for i, c in enumerate(candidates, 1):
        summary = c.summary.replace('|', '\\|').replace('\n', ' ')
        if len(summary) > 90:
            summary = summary[:87] + '…'
        lines.append(
            f'| {i} | {c.score:.1f} | {c.occurrence_count} | '
            f'`{c.reason}` | `{c.gap_type}` | {summary} |'
        )
    lines.append('')
    return '\n'.join(lines)


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Rank corpus-gap clusters as meta-FAQ candidates.')
    p.add_argument('--source', required=True,
                   help='Path to SQLite export of the amicus-gaps D1 database.')
    p.add_argument('--top', type=int, default=DEFAULT_TOP,
                   help='Number of top candidates to display.')
    p.add_argument('--min-occurrences', type=int, default=DEFAULT_MIN_OCCURRENCES,
                   help='Minimum occurrence_count to consider.')
    args = p.parse_args(argv)

    candidates = load_candidates(args.source, min_occurrences=args.min_occurrences)
    top = rank(candidates, top=args.top)
    sys.stdout.write(render_markdown(top))
    return 0


if __name__ == '__main__':
    sys.exit(main())
