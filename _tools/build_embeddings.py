#!/usr/bin/env python3
"""
build_embeddings.py — Amicus embeddings pipeline orchestrator.

Chunks all Companion Study content, generates vector embeddings via OpenAI's
`text-embedding-3-small` API, and writes them to `embeddings.db`. The build
orchestrator (`build_sqlite.py`) merges `embeddings.db` into `scripture.db`.

Usage:
    python _tools/build_embeddings.py                # full rebuild
    python _tools/build_embeddings.py --incremental  # only re-embeds changed chunks
    python _tools/build_embeddings.py --dry-run      # print counts + cost, no API calls
    python _tools/build_embeddings.py --source section_panel  # restrict to one source type
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import signal
import sqlite3
import struct
import sys
import time
from pathlib import Path
from typing import Iterable

# Ensure stdout can handle UTF-8 (Windows cp1252 default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / '_tools'))

from build_embeddings_chunks import iter_all_chunks, SOURCE_CHUNKERS  # noqa: E402

EMBEDDINGS_DB = ROOT / 'embeddings.db'
MANIFEST_PATH = ROOT / '_tools' / 'embedding_manifest.json'

MODEL_NAME = 'text-embedding-3-small'
EMBEDDING_DIM = 1536
BATCH_SIZE = 100
# OpenAI pricing for text-embedding-3-small: $0.02 per 1M tokens.
PRICE_PER_MILLION_TOKENS = 0.02
# Rough heuristic: 1 token ≈ 4 characters for English prose. Good enough for
# dry-run cost estimation; the real API call returns exact token usage.
CHARS_PER_TOKEN_HEURISTIC = 4


# ── Manifest helpers ──────────────────────────────────────────────────

def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            pass
    return {'chunks': {}, 'dirty_chapters': []}


def save_manifest(manifest: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, sort_keys=True), encoding='utf-8'
    )


def content_hash(chunk: dict) -> str:
    """Stable SHA256 over (text, metadata). Used for incremental dedup."""
    payload = json.dumps(
        {'text': chunk['text'], 'metadata': chunk['metadata']},
        sort_keys=True,
        ensure_ascii=False,
    ).encode('utf-8')
    return hashlib.sha256(payload).hexdigest()


# ── DB helpers ────────────────────────────────────────────────────────

def open_embeddings_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(EMBEDDINGS_DB))
    conn.execute('''
        CREATE TABLE IF NOT EXISTS embedding_chunks (
            chunk_id      TEXT PRIMARY KEY,
            source_type   TEXT NOT NULL,
            source_id     TEXT NOT NULL,
            text          TEXT NOT NULL,
            metadata_json TEXT NOT NULL,
            content_hash  TEXT NOT NULL,
            embedding     BLOB NOT NULL
        )
    ''')
    conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_source
            ON embedding_chunks(source_type, source_id)
    ''')
    conn.commit()
    return conn


def existing_hashes(conn: sqlite3.Connection) -> dict[str, str]:
    return dict(conn.execute(
        'SELECT chunk_id, content_hash FROM embedding_chunks'
    ).fetchall())


def upsert_chunk(conn: sqlite3.Connection, chunk: dict, ch: str, emb: list[float]) -> None:
    blob = struct.pack(f'<{len(emb)}f', *emb)
    conn.execute(
        '''INSERT INTO embedding_chunks
           (chunk_id, source_type, source_id, text, metadata_json, content_hash, embedding)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(chunk_id) DO UPDATE SET
               source_type = excluded.source_type,
               source_id   = excluded.source_id,
               text        = excluded.text,
               metadata_json = excluded.metadata_json,
               content_hash  = excluded.content_hash,
               embedding     = excluded.embedding''',
        (
            chunk['chunk_id'], chunk['source_type'], chunk['source_id'],
            chunk['text'], json.dumps(chunk['metadata'], sort_keys=True),
            ch, blob,
        ),
    )


# ── Embedding API ─────────────────────────────────────────────────────

def embed_batch(texts: list[str], api_key: str) -> list[list[float]]:
    """Call OpenAI embeddings endpoint. Retries 3× on 429/5xx with backoff."""
    import urllib.request
    import urllib.error

    body = json.dumps({'model': MODEL_NAME, 'input': texts}).encode('utf-8')
    delay = 1.0
    for attempt in range(3):
        req = urllib.request.Request(
            'https://api.openai.com/v1/embeddings',
            data=body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                payload = json.loads(resp.read().decode('utf-8'))
            vectors = [item['embedding'] for item in payload['data']]
            for v in vectors:
                if len(v) != EMBEDDING_DIM:
                    raise RuntimeError(
                        f'Unexpected embedding dim {len(v)}, expected {EMBEDDING_DIM}'
                    )
            return vectors
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < 2:
                time.sleep(delay)
                delay *= 2
                continue
            raise
        except urllib.error.URLError:
            if attempt < 2:
                time.sleep(delay)
                delay *= 2
                continue
            raise
    raise RuntimeError('embed_batch: exhausted retries')


# ── Main build ────────────────────────────────────────────────────────

def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--incremental', action='store_true',
                   help='Only re-embed chunks whose content_hash changed')
    p.add_argument('--dry-run', action='store_true',
                   help='Print chunk count + estimated cost; no API calls')
    p.add_argument('--source', choices=sorted(SOURCE_CHUNKERS.keys()),
                   help='Restrict chunking to one source type')
    p.add_argument('--yes', action='store_true',
                   help='Skip the cost-prompt confirmation (for CI/automation)')
    return p.parse_args(argv)


def gather_chunks(source_filter: str | None) -> list[dict]:
    return list(iter_all_chunks(source_filter=source_filter))


def summarize_by_source(chunks: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for c in chunks:
        counts[c['source_type']] = counts.get(c['source_type'], 0) + 1
    return counts


def estimate_cost(chunks: Iterable[dict]) -> tuple[int, float]:
    total_chars = sum(len(c['text']) for c in chunks)
    tokens = total_chars // CHARS_PER_TOKEN_HEURISTIC
    cost_usd = tokens / 1_000_000 * PRICE_PER_MILLION_TOKENS
    return tokens, cost_usd


def print_dry_run(chunks: list[dict]) -> None:
    counts = summarize_by_source(chunks)
    total = sum(counts.values())
    tokens, cost = estimate_cost(chunks)
    print('  [DRY RUN] Chunk counts by source:')
    for src in sorted(counts):
        print(f'    {src:<26} {counts[src]:>6}')
    print(f'    {"TOTAL":<26} {total:>6}')
    print(f'  [DRY RUN] Estimated tokens: ~{tokens:,}')
    print(f'  [DRY RUN] Estimated cost:   ~${cost:.4f} USD '
          f'(at ${PRICE_PER_MILLION_TOKENS}/1M tokens)')


def run_build(
    chunks: list[dict],
    api_key: str,
    incremental: bool,
) -> None:
    conn = open_embeddings_db()
    existing = existing_hashes(conn)
    manifest = load_manifest()

    # Determine which chunks actually need re-embedding.
    work_items: list[tuple[dict, str]] = []
    skipped = 0
    for chunk in chunks:
        ch = content_hash(chunk)
        if incremental and existing.get(chunk['chunk_id']) == ch:
            skipped += 1
            continue
        work_items.append((chunk, ch))

    if not work_items:
        print('  [OK] Nothing to do — every chunk already current.')
        conn.close()
        return

    print(f'  [INFO] To embed: {len(work_items)}  (skipped {skipped} up-to-date)')

    # Allow graceful Ctrl-C: commit after each batch so next run resumes.
    stopped = {'flag': False}

    def _handle_sigint(_sig, _frm):
        stopped['flag'] = True
        print('\n  [WARN] Ctrl-C received — finishing current batch then stopping.')

    previous = signal.signal(signal.SIGINT, _handle_sigint)

    try:
        for start in range(0, len(work_items), BATCH_SIZE):
            batch = work_items[start:start + BATCH_SIZE]
            texts = [item[0]['text'] for item in batch]
            vectors = embed_batch(texts, api_key)
            for (chunk, ch), vec in zip(batch, vectors):
                upsert_chunk(conn, chunk, ch, vec)
                manifest.setdefault('chunks', {})[chunk['chunk_id']] = ch
            conn.commit()
            save_manifest(manifest)
            print(f'  [OK] Batch {start // BATCH_SIZE + 1}: '
                  f'{start + len(batch)}/{len(work_items)} chunks embedded')
            if stopped['flag']:
                break
    finally:
        signal.signal(signal.SIGINT, previous)
        conn.close()

    # Clear dirty_chapters after a successful full pass.
    if not stopped['flag']:
        manifest['dirty_chapters'] = []
        save_manifest(manifest)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    print('=' * 60)
    print('Amicus: Building embeddings')
    print('=' * 60)

    chunks = gather_chunks(args.source)
    if not chunks:
        print('  [WARN] No chunks collected — is content/ present?')
        return 0

    if args.dry_run:
        print_dry_run(chunks)
        return 0

    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print('  [ERROR] OPENAI_API_KEY is not set.')
        print('          Set it in your shell (never commit a key to the repo).')
        return 1

    _tokens, cost = estimate_cost(chunks)
    if not args.incremental and not args.yes and cost > 0.50:
        print_dry_run(chunks)
        try:
            answer = input('Continue? [y/N] ').strip().lower()
        except EOFError:
            answer = 'n'
        if answer not in ('y', 'yes'):
            print('  [ABORT] User declined.')
            return 1

    # --incremental implies we only embed the diff. Without it we clear the
    # target table so stale chunks (deleted sources) don't linger.
    if not args.incremental and EMBEDDINGS_DB.exists():
        EMBEDDINGS_DB.unlink()

    run_build(chunks, api_key=api_key, incremental=args.incremental)
    size = EMBEDDINGS_DB.stat().st_size if EMBEDDINGS_DB.exists() else 0
    print(f"\n  [DONE] embeddings.db: {size // 1024}KB")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
