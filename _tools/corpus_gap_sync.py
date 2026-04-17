#!/usr/bin/env python3
"""
corpus_gap_sync.py — Sync corpus gaps from Cloudflare D1 into GitHub issues.

Designed to be scheduled (e.g. GitHub Actions cron, or a Cloudflare Worker
cron trigger posting to the GitHub REST API). Pulls gaps with status='new'
from D1, creates one issue per gap (individual mode) or a daily digest
(digest mode), and marks the row 'issue_opened' in D1.

Two modes, switched by the `gap_sync_mode` row in the D1 `amicus_config`
table (see ai-proxy/migrations/0001_corpus_gaps.sql):

  - individual (default)  — every gap → its own issue in the Partner Gaps
                             kanban swim lane.
  - digest                — singletons roll up into a single daily issue;
                             clusters (occurrence_count >= 3) still get
                             dedicated issues.

Usage:
    python3 _tools/corpus_gap_sync.py --dry-run            # preview
    python3 _tools/corpus_gap_sync.py                      # real run

Environment:
    CORPUS_GAP_D1_URL      — Cloudflare D1 query API URL
    CORPUS_GAP_D1_TOKEN    — Cloudflare API token with D1 access
    GITHUB_TOKEN           — PAT with repo issues: write
    GITHUB_REPO            — "owner/repo", e.g. "CraigBuckmaster/ScriptureDeepDive"
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import urllib.request
import urllib.error
from typing import Any, Iterable

DEFAULT_LABELS = ['corpus-gap']
CLUSTER_THRESHOLD = 3


# ── D1 client ─────────────────────────────────────────────────────────

class D1Client:
    """Minimal client for Cloudflare D1's HTTP query endpoint."""

    def __init__(self, url: str | None = None, token: str | None = None) -> None:
        self.url = url or os.environ.get('CORPUS_GAP_D1_URL') or ''
        self.token = token or os.environ.get('CORPUS_GAP_D1_TOKEN') or ''
        if not self.url or not self.token:
            raise RuntimeError(
                'CORPUS_GAP_D1_URL and CORPUS_GAP_D1_TOKEN must be set',
            )

    def query(self, sql: str, params: list[Any] | None = None) -> list[dict[str, Any]]:
        body = {'sql': sql, 'params': params or []}
        req = urllib.request.Request(
            self.url,
            data=json.dumps(body).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json',
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode('utf-8'))
        result = payload.get('result') or []
        if not result:
            return []
        first = result[0]
        return first.get('results', []) or []


# ── GitHub client ─────────────────────────────────────────────────────

class GitHubClient:
    def __init__(self, token: str | None = None, repo: str | None = None) -> None:
        self.token = token or os.environ.get('GITHUB_TOKEN') or ''
        self.repo = repo or os.environ.get('GITHUB_REPO') or ''
        if not self.token or not self.repo:
            raise RuntimeError('GITHUB_TOKEN and GITHUB_REPO must be set')

    def create_issue(
        self, title: str, body: str, labels: Iterable[str],
    ) -> int:
        data = {'title': title, 'body': body, 'labels': list(labels)}
        req = urllib.request.Request(
            f'https://api.github.com/repos/{self.repo}/issues',
            data=json.dumps(data).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {self.token}',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json',
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode('utf-8'))
        return int(payload['number'])


# ── Sync logic ────────────────────────────────────────────────────────

def get_sync_mode(d1: D1Client) -> str:
    rows = d1.query(
        "SELECT value FROM amicus_config WHERE key = 'gap_sync_mode'",
    )
    if rows:
        v = rows[0].get('value', 'individual')
        if v in ('individual', 'digest'):
            return v
    return 'individual'


def fetch_new_gaps(d1: D1Client) -> list[dict[str, Any]]:
    return d1.query(
        """SELECT gap_id, scrubbed_summary, gap_type, current_chapter_ref,
                  occurrence_count, captured_at, retrieval_max_score
             FROM corpus_gaps
            WHERE status = 'new'
              AND redacted = 0
            ORDER BY captured_at DESC""",
    )


def mark_queued(d1: D1Client, gap_ids: list[str]) -> None:
    if not gap_ids:
        return
    placeholders = ','.join('?' * len(gap_ids))
    d1.query(
        f"UPDATE corpus_gaps SET status='queued' WHERE gap_id IN ({placeholders})",
        gap_ids,
    )


def mark_issue_opened(d1: D1Client, gap_ids: list[str], issue_number: int) -> None:
    if not gap_ids:
        return
    placeholders = ','.join('?' * len(gap_ids))
    d1.query(
        f"""UPDATE corpus_gaps
               SET status='issue_opened',
                   linked_issue_number=?
             WHERE gap_id IN ({placeholders})""",
        [issue_number, *gap_ids],
    )


def build_individual_body(gap: dict[str, Any]) -> str:
    captured = dt.datetime.utcfromtimestamp(int(gap['captured_at'])).strftime(
        '%Y-%m-%d %H:%M UTC',
    )
    return (
        f"**Scrubbed summary:** {gap.get('scrubbed_summary') or '(none)'}\n\n"
        f"**Gap type:** {gap.get('gap_type') or 'content'}\n"
        f"**Current chapter ref:** {gap.get('current_chapter_ref') or '—'}\n"
        f"**First seen:** {captured}\n"
        f"**Occurrences:** {gap.get('occurrence_count', 1)}\n"
        f"**Retrieval max score:** {gap.get('retrieval_max_score')}\n"
        f"**Gap id (D1):** `{gap['gap_id']}`\n\n"
        '_Auto-created by `_tools/corpus_gap_sync.py`. Close this issue '
        'with `closes corpus-gap-<id>` in a content-PR body to mark the '
        'gap as shipped._\n'
    )


def build_digest_body(singletons: list[dict[str, Any]]) -> str:
    lines = [
        f"**Daily corpus-gap digest** — {len(singletons)} single-occurrence gaps.",
        '',
        'Clusters (≥3 occurrences) and thumbs-down gaps continue to get dedicated issues.',
        '',
        '| gap_id | gap_type | chapter | summary |',
        '|--------|----------|---------|---------|',
    ]
    for g in singletons:
        safe_summary = (g.get('scrubbed_summary') or '').replace('|', r'\|')[:120]
        lines.append(
            f"| `{g['gap_id'][:8]}` | {g.get('gap_type') or 'content'} "
            f"| {g.get('current_chapter_ref') or '—'} "
            f"| {safe_summary} |"
        )
    return '\n'.join(lines) + '\n'


def sync_individual(d1: D1Client, gh: GitHubClient, gaps: list[dict[str, Any]],
                    dry_run: bool = False) -> int:
    """One issue per gap. Returns number of issues created."""
    count = 0
    for gap in gaps:
        summary = gap.get('scrubbed_summary') or '(unknown topic)'
        title = f"corpus-gap: {summary[:70]}"
        body = build_individual_body(gap)
        if dry_run:
            print(f"[DRY] create issue: {title}")
            count += 1
            continue
        issue_num = gh.create_issue(title, body, DEFAULT_LABELS)
        mark_issue_opened(d1, [gap['gap_id']], issue_num)
        count += 1
    return count


def sync_digest(d1: D1Client, gh: GitHubClient, gaps: list[dict[str, Any]],
                dry_run: bool = False) -> int:
    """Clusters + thumbs-down → own issue; singletons → one digest issue."""
    clusters = [g for g in gaps if int(g.get('occurrence_count', 1)) >= CLUSTER_THRESHOLD]
    singletons = [g for g in gaps if g not in clusters]
    count = 0

    for gap in clusters:
        summary = gap.get('scrubbed_summary') or '(unknown topic)'
        title = f"corpus-gap (cluster): {summary[:70]}"
        body = build_individual_body(gap)
        if dry_run:
            print(f"[DRY] create cluster issue: {title}")
        else:
            issue_num = gh.create_issue(title, body, DEFAULT_LABELS)
            mark_issue_opened(d1, [gap['gap_id']], issue_num)
        count += 1

    if singletons:
        day = dt.datetime.utcnow().strftime('%Y-%m-%d')
        title = f"corpus-gap digest — {day} ({len(singletons)} gaps)"
        body = build_digest_body(singletons)
        if dry_run:
            print(f"[DRY] create digest: {title}")
        else:
            issue_num = gh.create_issue(title, body, DEFAULT_LABELS)
            mark_issue_opened(d1, [g['gap_id'] for g in singletons], issue_num)
        count += 1

    return count


# ── CLI ───────────────────────────────────────────────────────────────

def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--dry-run', action='store_true',
                   help='Print planned issues; no D1 updates, no GitHub calls')
    p.add_argument('--mode', choices=('auto', 'individual', 'digest'), default='auto',
                   help='Override the D1 config flag')
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    d1 = D1Client()
    mode = args.mode if args.mode != 'auto' else get_sync_mode(d1)
    print(f"  mode: {mode}")

    gaps = fetch_new_gaps(d1)
    print(f"  pending gaps: {len(gaps)}")
    if not gaps:
        return 0

    gh = GitHubClient() if not args.dry_run else None

    mark_queued(d1, [g['gap_id'] for g in gaps]) if not args.dry_run else None

    if mode == 'digest':
        created = sync_digest(d1, gh, gaps, dry_run=args.dry_run)
    else:
        created = sync_individual(d1, gh, gaps, dry_run=args.dry_run)

    print(f"  issues: {created}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
