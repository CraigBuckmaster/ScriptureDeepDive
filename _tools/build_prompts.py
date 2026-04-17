#!/usr/bin/env python3
"""
build_prompts.py — Amicus chip pool orchestrator (Card #1461).

Pre-generates the FAB-peek chip pool at content build time so runtime cost
is ~$0. For each live chapter, produces 3 chips per profile variant via
Claude Haiku; for people/places/debate topics, uses zero-cost templates.

Output writes to a standalone `prompts.db` (like `embeddings.db`); the
`populate_precached_prompts` loader merges rows into `scripture.db` during
the main build.

Usage:
    python _tools/build_prompts.py                  # full rebuild
    python _tools/build_prompts.py --incremental    # only chapters in manifest
    python _tools/build_prompts.py --dry-run        # cost estimate
    python _tools/build_prompts.py --entity-only    # entity chips only
    python _tools/build_prompts.py --chapter-only   # chapter chips only
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import signal
import sqlite3
import sys
import time
from pathlib import Path
from typing import Any, Iterable

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / '_tools'))

from content_writer import REGISTRY  # noqa: E402
from build_prompts_variants import PROFILE_VARIANTS  # noqa: E402
from build_prompts_entity import all_entity_rows  # noqa: E402

PROMPTS_DB = ROOT / 'prompts.db'
MANIFEST_PATH = ROOT / '_tools' / 'prompts_manifest.json'

MODEL_NAME = 'claude-haiku-4-5-20251001'
MAX_TOKENS = 256
BATCH_CHECKPOINT_EVERY = 10
# Haiku 4.5: $1/MTok input, $5/MTok output. Per-chip rough estimate below is
# for dry-run output. Cached-prompt savings are not modeled (~70% savings in
# practice), so this is a conservative upper bound.
INPUT_COST_PER_MTOK = 1.0
OUTPUT_COST_PER_MTOK = 5.0
AVG_INPUT_TOKENS_PER_CALL = 600
AVG_OUTPUT_TOKENS_PER_CALL = 80


# ── Manifest helpers ──────────────────────────────────────────────────

def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            pass
    return {'dirty_chapters': [], 'chapter_hashes': {}}


def save_manifest(m: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(m, indent=2, sort_keys=True), encoding='utf-8')


# ── DB helpers ────────────────────────────────────────────────────────

def open_prompts_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(PROMPTS_DB))
    conn.execute('''
        CREATE TABLE IF NOT EXISTS precached_prompts (
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          profile_variant TEXT NOT NULL,
          chips_json TEXT NOT NULL,
          generated_at TEXT NOT NULL,
          PRIMARY KEY (entity_type, entity_id, profile_variant)
        )
    ''')
    conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_precached_prompts_entity
          ON precached_prompts(entity_type, entity_id)
    ''')
    conn.commit()
    return conn


def upsert_row(
    conn: sqlite3.Connection,
    entity_type: str,
    entity_id: str,
    profile_variant: str,
    chips: list[dict[str, Any]],
) -> None:
    conn.execute(
        '''INSERT INTO precached_prompts
             (entity_type, entity_id, profile_variant, chips_json, generated_at)
           VALUES (?, ?, ?, ?, datetime('now'))
           ON CONFLICT(entity_type, entity_id, profile_variant)
           DO UPDATE SET
             chips_json = excluded.chips_json,
             generated_at = excluded.generated_at''',
        (entity_type, entity_id, profile_variant, json.dumps(chips, ensure_ascii=False)),
    )


# ── Chapter iteration ─────────────────────────────────────────────────

def iter_live_chapters() -> Iterable[tuple[str, int, dict]]:
    for book_dir, _name, _total, live, _testament, _td in REGISTRY:
        if live <= 0:
            continue
        book_path = ROOT / 'content' / book_dir
        if not book_path.is_dir():
            continue
        for ch_file in sorted(book_path.glob('*.json')):
            try:
                data = json.loads(ch_file.read_text(encoding='utf-8'))
            except json.JSONDecodeError:
                continue
            chapter_num = data.get('chapter_num')
            if not isinstance(chapter_num, int):
                continue
            yield book_dir, chapter_num, data


def chapter_context_text(data: dict) -> str:
    """Short blob to send to Haiku — title + a trim of section headers."""
    parts: list[str] = []
    title = data.get('title')
    if title:
        parts.append(f'Title: {title}')
    subtitle = data.get('subtitle')
    if subtitle:
        parts.append(f'Subtitle: {subtitle}')
    headers: list[str] = []
    for sec in data.get('sections', [])[:6]:
        h = sec.get('header')
        if h:
            headers.append(f'- {h}')
    if headers:
        parts.append('Sections:\n' + '\n'.join(headers))
    return '\n'.join(parts)


def chapter_content_hash(data: dict) -> str:
    payload = json.dumps(data, sort_keys=True, ensure_ascii=False).encode('utf-8')
    return hashlib.sha256(payload).hexdigest()


# ── Haiku call ────────────────────────────────────────────────────────

def build_chip_request_body(book_dir: str, ch: int, chapter_ctx: str,
                            variant: dict) -> dict:
    system = (
        "You produce prompt chips for an AI Bible-study companion. Return a "
        "strict JSON array of EXACTLY 3 chip objects. Each chip is:\n"
        '  {"label": "<6-10 words>", '
        '"seed_query": "<full question/prompt>", '
        '"expected_source_types": ["section_panel" | "chapter_panel" | '
        '"debate_topic" | "cross_ref_thread_note" | "journey_stop" | '
        '"word_study" | "lexicon_entry" | "meta_faq"]}\n'
        "Label MUST be 6 to 10 words. No markdown. No preamble. JSON only."
    )
    user = (
        f"Chapter: {book_dir.replace('_', ' ').title()} {ch}\n"
        f"{chapter_ctx}\n\n"
        f"Profile variant: {variant['id']} — {variant['seed_instruction']}\n"
    )
    return {
        'model': MODEL_NAME,
        'max_tokens': MAX_TOKENS,
        'system': system,
        'messages': [{'role': 'user', 'content': user}],
    }


def call_haiku(body: dict, api_key: str) -> list[dict[str, Any]]:
    import urllib.request
    import urllib.error
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=json.dumps(body).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'anthropic-no-retention': 'true',
        },
    )
    delay = 1.0
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                payload = json.loads(resp.read().decode('utf-8'))
            text = payload.get('content', [{}])[0].get('text', '')
            parsed = _extract_json_array(text)
            return _validate_chips(parsed)
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
    raise RuntimeError('call_haiku exhausted retries')


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    """Best-effort extract the first JSON array from model output."""
    start = text.find('[')
    end = text.rfind(']')
    if start < 0 or end < 0:
        raise ValueError('no JSON array in model output')
    raw = text[start:end + 1]
    data = json.loads(raw)
    if not isinstance(data, list):
        raise ValueError('expected JSON array at top level')
    return data


VALID_SOURCE_TYPES = {
    'section_panel', 'chapter_panel', 'debate_topic', 'cross_ref_thread_note',
    'journey_stop', 'word_study', 'lexicon_entry', 'meta_faq',
}


def _validate_chips(chips: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if len(chips) != 3:
        raise ValueError(f'expected 3 chips, got {len(chips)}')
    out: list[dict[str, Any]] = []
    for c in chips:
        if not isinstance(c, dict):
            raise ValueError('chip is not an object')
        label = c.get('label', '').strip()
        seed_query = c.get('seed_query', '').strip()
        expected = c.get('expected_source_types', [])
        word_count = len(label.split())
        if word_count < 6 or word_count > 10:
            raise ValueError(f'label word count {word_count} out of range: {label!r}')
        if not seed_query:
            raise ValueError('seed_query empty')
        if not isinstance(expected, list):
            raise ValueError('expected_source_types must be a list')
        cleaned = [s for s in expected if isinstance(s, str) and s in VALID_SOURCE_TYPES]
        out.append({
            'label': label,
            'seed_query': seed_query,
            'expected_source_types': cleaned,
        })
    return out


# ── Main driver ──────────────────────────────────────────────────────

def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--incremental', action='store_true',
                   help='Re-generate only chapters listed in dirty_chapters')
    p.add_argument('--dry-run', action='store_true',
                   help='Print call counts + estimated cost; no writes')
    p.add_argument('--entity-only', action='store_true',
                   help='Only (re)generate entity chips (zero LLM cost)')
    p.add_argument('--chapter-only', action='store_true',
                   help='Only (re)generate chapter chips')
    p.add_argument('--yes', action='store_true',
                   help='Skip the cost confirmation prompt')
    return p.parse_args(argv)


def estimate_cost(num_calls: int) -> float:
    in_tok = num_calls * AVG_INPUT_TOKENS_PER_CALL
    out_tok = num_calls * AVG_OUTPUT_TOKENS_PER_CALL
    return (in_tok / 1_000_000 * INPUT_COST_PER_MTOK
            + out_tok / 1_000_000 * OUTPUT_COST_PER_MTOK)


def build_chapter_rows(incremental: bool, dry_run: bool,
                       api_key: str | None) -> int:
    manifest = load_manifest()
    dirty = set(manifest.get('dirty_chapters', []))
    chapter_hashes = manifest.get('chapter_hashes', {})

    chapters = list(iter_live_chapters())
    if incremental:
        chapters = [
            (b, c, d) for (b, c, d) in chapters
            if f'{b}-{c}' in dirty or chapter_content_hash(d) != chapter_hashes.get(f'{b}-{c}')
        ]

    call_count = len(chapters) * len(PROFILE_VARIANTS)
    est = estimate_cost(call_count)
    print(f'  chapters to process: {len(chapters)}')
    print(f'  variants: {len(PROFILE_VARIANTS)}')
    print(f'  API calls: {call_count}')
    print(f'  estimated cost: ~${est:.2f} USD (Haiku {MODEL_NAME})')

    if dry_run:
        return 0

    if api_key is None:
        print('  [ERROR] ANTHROPIC_API_KEY is not set')
        sys.exit(1)

    conn = open_prompts_db()
    stopped = {'flag': False}
    prev = signal.signal(signal.SIGINT, lambda s, f: stopped.__setitem__('flag', True))

    written = 0
    try:
        for i, (book_dir, ch, data) in enumerate(chapters, start=1):
            ctx = chapter_context_text(data)
            entity_id = f'{book_dir}-{ch}'
            for variant in PROFILE_VARIANTS:
                body = build_chip_request_body(book_dir, ch, ctx, variant)
                try:
                    chips = call_haiku(body, api_key)
                except Exception as e:  # noqa: BLE001
                    print(f'  [FAIL] {entity_id} {variant["id"]}: {e}')
                    continue
                upsert_row(conn, 'chapter', entity_id, variant['id'], chips)
                written += 1
            # Update manifest with latest hash so incremental can skip next run.
            chapter_hashes[entity_id] = chapter_content_hash(data)
            if i % BATCH_CHECKPOINT_EVERY == 0:
                conn.commit()
                manifest['chapter_hashes'] = chapter_hashes
                save_manifest(manifest)
                print(f'  [OK] checkpoint: {i}/{len(chapters)} chapters')
            if stopped['flag']:
                print('  [WARN] Ctrl-C — stopping after current chapter.')
                break
        conn.commit()
    finally:
        signal.signal(signal.SIGINT, prev)
        conn.close()

    manifest['chapter_hashes'] = chapter_hashes
    if not stopped['flag']:
        manifest['dirty_chapters'] = []
    save_manifest(manifest)
    print(f'  [DONE] chapter rows written: {written}')
    return written


def build_entity_rows() -> int:
    rows = all_entity_rows()
    if not rows:
        print('  [WARN] no entity rows; is content/meta present?')
        return 0
    conn = open_prompts_db()
    try:
        for r in rows:
            upsert_row(
                conn,
                r['entity_type'],
                r['entity_id'],
                r['profile_variant'],
                r['chips'],
            )
        conn.commit()
    finally:
        conn.close()
    print(f'  [OK] entity rows written: {len(rows)}')
    return len(rows)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    print('=' * 60)
    print('Amicus: Building prompt chip pool')
    print('=' * 60)

    api_key = os.environ.get('ANTHROPIC_API_KEY')

    if args.dry_run:
        build_chapter_rows(args.incremental, dry_run=True, api_key=api_key)
        print('  [DRY RUN] no writes performed')
        return 0

    if args.entity_only:
        build_entity_rows()
        return 0

    if args.chapter_only:
        build_chapter_rows(args.incremental, dry_run=False, api_key=api_key)
        return 0

    # Full build: entity (cheap) first, then chapter (LLM).
    est = estimate_cost(len(list(iter_live_chapters())) * len(PROFILE_VARIANTS))
    if est > 1.0 and not args.yes:
        try:
            ans = input(f'Full build will cost ~${est:.2f}. Continue? [y/N] ').strip().lower()
        except EOFError:
            ans = 'n'
        if ans not in ('y', 'yes'):
            print('  [ABORT] user declined')
            return 1

    build_entity_rows()
    build_chapter_rows(args.incremental, dry_run=False, api_key=api_key)
    size = PROMPTS_DB.stat().st_size if PROMPTS_DB.exists() else 0
    print(f'\n  prompts.db: {size // 1024}KB')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
