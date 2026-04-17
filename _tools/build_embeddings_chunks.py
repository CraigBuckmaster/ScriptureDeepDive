"""
build_embeddings_chunks.py — Chunker module for Amicus embeddings pipeline.

One function per source type. Each chunker reads content JSON files from the
repo and yields dicts of the form:

    {
        'chunk_id':    'section_panel:genesis-1-s1-sarna',
        'source_type': 'section_panel',
        'source_id':   'genesis-1-s1-sarna',
        'metadata':    { ... see README in #1447 ... },
        'text':        '...plain text the embedder will consume...',
    }

Chunk IDs are deterministic — `{source_type}:{source_id}` — so two rebuilds
produce an identical chunk_id set. No UUIDs, no hashes in the id.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Iterable, Iterator

# Re-use the project's book registry so we walk content/<book_dir>/*.json in a
# canonical order rather than whatever the filesystem gives us.
from content_writer import REGISTRY

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
META = CONTENT / 'meta'

# Panel types worth embedding. We skip purely structural panels like bare
# verse ranges or image lists where the text payload is negligible.
SECTION_PANEL_TYPES = {
    'heb', 'ctx', 'hist', 'cross', 'mac', 'calvin', 'netbible', 'sarna',
    'alter', 'hubbard', 'waltke', 'robertson', 'catena', 'marcus', 'rhoads',
    'keener', 'milgrom', 'ashley', 'craigie', 'tigay', 'hess', 'howard',
    'block', 'oswalt', 'walton', 'wright',
}
CHAPTER_PANEL_TYPES = {
    'lit', 'themes', 'ppl', 'trans', 'src', 'rec',
    'hebtext', 'thread', 'tx', 'debate',
}


def _flatten_text(value: Any) -> str:
    """Recursively flatten a JSON panel value to plain text for embedding."""
    if value is None:
        return ''
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float, bool)):
        return str(value)
    if isinstance(value, list):
        return '\n'.join(part for part in (_flatten_text(v) for v in value) if part)
    if isinstance(value, dict):
        parts = []
        for k, v in value.items():
            t = _flatten_text(v)
            if t:
                parts.append(f'{k}: {t}' if not isinstance(v, (dict, list)) else t)
        return '\n'.join(parts)
    return ''


def _panel_scholar_id(panel_type: str) -> str | None:
    """Map a panel_type to the scholar_id it represents, if any."""
    mapping = {
        'mac': 'macarthur', 'calvin': 'calvin', 'netbible': 'netbible',
        'sarna': 'sarna', 'alter': 'alter', 'hubbard': 'hubbard',
        'waltke': 'waltke', 'robertson': 'robertson', 'catena': 'catena',
        'marcus': 'marcus', 'rhoads': 'rhoads', 'keener': 'keener',
        'milgrom': 'milgrom', 'ashley': 'ashley', 'craigie': 'craigie',
        'tigay': 'tigay', 'hess': 'hess', 'howard': 'howard',
        'block': 'block', 'oswalt': 'oswalt', 'walton': 'walton',
        'wright': 'wright',
    }
    return mapping.get(panel_type)


def _load_scholar_traditions() -> dict[str, str]:
    """Build a {scholar_id: tradition} lookup from meta/scholars.json."""
    path = META / 'scholars.json'
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError:
        return {}
    out: dict[str, str] = {}
    for entry in data if isinstance(data, list) else []:
        sid = entry.get('id')
        tradition = entry.get('tradition')
        if sid and tradition:
            out[sid] = tradition
    return out


# ── Source chunkers ───────────────────────────────────────────────────

def chunk_section_panels(scholar_traditions: dict[str, str]) -> Iterator[dict]:
    """One chunk per (section, panel_type) across all chapter files."""
    for book_dir, _name, _total, live, _testament, _td in REGISTRY:
        if live <= 0:
            continue
        book_path = CONTENT / book_dir
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
            for section in data.get('sections', []):
                section_num = section.get('section_num')
                if not isinstance(section_num, int):
                    continue
                verse_start = section.get('verse_start')
                verse_end = section.get('verse_end')
                for panel_type, content in (section.get('panels') or {}).items():
                    if panel_type not in SECTION_PANEL_TYPES:
                        continue
                    text = _flatten_text(content).strip()
                    if not text:
                        continue
                    scholar_id = _panel_scholar_id(panel_type)
                    source_id = f'{book_dir}-{chapter_num}-s{section_num}-{panel_type}'
                    yield {
                        'chunk_id': f'section_panel:{source_id}',
                        'source_type': 'section_panel',
                        'source_id': source_id,
                        'text': text,
                        'metadata': {
                            'scholar_id': scholar_id,
                            'tradition': scholar_traditions.get(scholar_id) if scholar_id else None,
                            'book_id': book_dir,
                            'chapter_num': chapter_num,
                            'verse_start': verse_start,
                            'verse_end': verse_end,
                            'panel_type': panel_type,
                        },
                    }


def chunk_chapter_panels(scholar_traditions: dict[str, str]) -> Iterator[dict]:
    """One chunk per (chapter, panel_type) across all chapter files."""
    for book_dir, _name, _total, live, _testament, _td in REGISTRY:
        if live <= 0:
            continue
        book_path = CONTENT / book_dir
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
            for panel_type, content in (data.get('chapter_panels') or {}).items():
                if panel_type not in CHAPTER_PANEL_TYPES:
                    continue
                text = _flatten_text(content).strip()
                if not text:
                    continue
                source_id = f'{book_dir}-{chapter_num}-{panel_type}'
                yield {
                    'chunk_id': f'chapter_panel:{source_id}',
                    'source_type': 'chapter_panel',
                    'source_id': source_id,
                    'text': text,
                    'metadata': {
                        'scholar_id': None,
                        'tradition': None,
                        'book_id': book_dir,
                        'chapter_num': chapter_num,
                        'verse_start': None,
                        'verse_end': None,
                        'panel_type': panel_type,
                    },
                }


def chunk_word_studies() -> Iterator[dict]:
    """One chunk per word study entry."""
    path = META / 'word-studies.json'
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding='utf-8'))
    for entry in data if isinstance(data, list) else []:
        wid = entry.get('id')
        if not wid:
            continue
        text_parts = [
            entry.get('original', ''),
            entry.get('transliteration', ''),
            ', '.join(entry.get('glosses', []) or []),
            entry.get('range', ''),
            entry.get('note', ''),
        ]
        text = '\n'.join(p for p in text_parts if p).strip()
        if not text:
            continue
        yield {
            'chunk_id': f'word_study:{wid}',
            'source_type': 'word_study',
            'source_id': wid,
            'text': text,
            'metadata': {
                'scholar_id': None,
                'tradition': None,
                'book_id': None,
                'chapter_num': None,
                'verse_start': None,
                'verse_end': None,
                'panel_type': None,
            },
        }


def chunk_lexicon_entries() -> Iterator[dict]:
    """One chunk per Hebrew + Greek lexicon entry."""
    for language, filename, prefix in (
        ('hebrew', 'lexicon-hebrew.json', 'heb'),
        ('greek', 'lexicon-greek.json', 'grk'),
    ):
        path = META / filename
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            continue
        for entry in data if isinstance(data, list) else []:
            strongs = entry.get('strongs')
            if not strongs:
                continue
            definition = entry.get('definition') or {}
            short = definition.get('short', '') if isinstance(definition, dict) else ''
            full_parts = []
            for d in (definition.get('full') or []) if isinstance(definition, dict) else []:
                if isinstance(d, dict):
                    full_parts.append(d.get('text', ''))
                    for sub in d.get('subs') or []:
                        if isinstance(sub, dict):
                            full_parts.append(sub.get('text', ''))
            text = '\n'.join(p for p in [
                entry.get('lemma', ''),
                entry.get('transliteration', ''),
                entry.get('pos', ''),
                short,
                '\n'.join(full_parts),
            ] if p).strip()
            if not text:
                continue
            source_id = f'{prefix}-{strongs}'
            yield {
                'chunk_id': f'lexicon_entry:{source_id}',
                'source_type': 'lexicon_entry',
                'source_id': source_id,
                'text': text,
                'metadata': {
                    'scholar_id': None,
                    'tradition': None,
                    'book_id': None,
                    'chapter_num': None,
                    'verse_start': None,
                    'verse_end': None,
                    'panel_type': language,
                },
            }


def chunk_debate_topics() -> Iterator[dict]:
    """One chunk per debate topic (covering all positions)."""
    path = META / 'debate-topics.json'
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding='utf-8'))
    for entry in data if isinstance(data, list) else []:
        tid = entry.get('id')
        if not tid:
            continue
        positions = []
        for pos in entry.get('positions') or []:
            if not isinstance(pos, dict):
                continue
            positions.append('\n'.join(p for p in [
                f"Position: {pos.get('label', '')}",
                f"Argument: {pos.get('argument', '')}",
                f"Strengths: {pos.get('strengths', '')}",
                f"Weaknesses: {pos.get('weaknesses', '')}",
            ] if p.strip(': ')))
        text = '\n\n'.join(p for p in [
            entry.get('title', ''),
            entry.get('question', ''),
            entry.get('context', ''),
            *positions,
        ] if p).strip()
        if not text:
            continue
        yield {
            'chunk_id': f'debate_topic:{tid}',
            'source_type': 'debate_topic',
            'source_id': tid,
            'text': text,
            'metadata': {
                'scholar_id': None,
                'tradition': None,
                'book_id': entry.get('book_id'),
                'chapter_num': (entry.get('chapters') or [None])[0] if entry.get('chapters') else None,
                'verse_start': None,
                'verse_end': None,
                'panel_type': entry.get('category'),
            },
        }


def chunk_cross_ref_thread_notes() -> Iterator[dict]:
    """One chunk per thread note inside cross-refs threads."""
    path = META / 'cross-refs.json'
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError:
        return
    threads = data.get('threads') if isinstance(data, dict) else data
    for thread in threads or []:
        tid = thread.get('id')
        if not tid:
            continue
        for idx, note in enumerate(thread.get('chain') or []):
            if not isinstance(note, dict):
                continue
            ref = note.get('ref', '')
            body = note.get('note', '')
            text = f'{thread.get("theme", "")}\n{ref}: {body}'.strip()
            if not text:
                continue
            source_id = f'{tid}-{idx}'
            yield {
                'chunk_id': f'cross_ref_thread_note:{source_id}',
                'source_type': 'cross_ref_thread_note',
                'source_id': source_id,
                'text': text,
                'metadata': {
                    'scholar_id': None,
                    'tradition': None,
                    'book_id': None,
                    'chapter_num': None,
                    'verse_start': None,
                    'verse_end': None,
                    'panel_type': None,
                },
            }


def chunk_journey_stops() -> Iterator[dict]:
    """One chunk per journey stop, including connective text (bridge_to_next)."""
    journeys_root = META / 'journeys'
    if not journeys_root.is_dir():
        return
    for journey_type_dir in sorted(journeys_root.iterdir()):
        if not journey_type_dir.is_dir():
            continue
        journey_type = journey_type_dir.name
        for jf in sorted(journey_type_dir.glob('*.json')):
            try:
                data = json.loads(jf.read_text(encoding='utf-8'))
            except json.JSONDecodeError:
                continue
            jid = data.get('id')
            if not jid:
                continue
            for stop in data.get('stops') or []:
                if not isinstance(stop, dict):
                    continue
                order = stop.get('stop_order')
                if not isinstance(order, int):
                    continue
                text_parts = [
                    stop.get('label', ''),
                    stop.get('ref', ''),
                    stop.get('development', ''),
                    stop.get('what_changes', ''),
                    stop.get('bridge_to_next') or '',
                ]
                text = '\n'.join(p for p in text_parts if p).strip()
                if not text:
                    continue
                source_id = f'{journey_type}-{jid}-{order}'
                yield {
                    'chunk_id': f'journey_stop:{source_id}',
                    'source_type': 'journey_stop',
                    'source_id': source_id,
                    'text': text,
                    'metadata': {
                        'scholar_id': None,
                        'tradition': None,
                        'book_id': stop.get('book_id'),
                        'chapter_num': stop.get('chapter_num'),
                        'verse_start': stop.get('verse_start'),
                        'verse_end': stop.get('verse_end'),
                        'panel_type': journey_type,
                    },
                }


_FRONTMATTER_RE = re.compile(r'^---\n(.*?)\n---\n(.*)$', re.DOTALL)


def _parse_meta_faq(path: Path) -> tuple[dict, str] | None:
    """Parse a meta_faq markdown file with YAML-ish frontmatter. Returns
    (frontmatter_dict, body_text) or None if unparseable."""
    try:
        raw = path.read_text(encoding='utf-8')
    except OSError:
        return None
    m = _FRONTMATTER_RE.match(raw)
    if not m:
        return None
    fm_block, body = m.group(1), m.group(2)
    frontmatter: dict[str, Any] = {}
    for line in fm_block.splitlines():
        if ':' not in line:
            continue
        key, _, value = line.partition(':')
        frontmatter[key.strip()] = value.strip()
    return frontmatter, body.strip()


def chunk_meta_faq() -> Iterator[dict]:
    """One chunk per editorial meta-FAQ article."""
    faq_dir = CONTENT / 'meta_faq'
    if not faq_dir.is_dir():
        return
    for md in sorted(faq_dir.glob('*.md')):
        parsed = _parse_meta_faq(md)
        if parsed is None:
            continue
        fm, body = parsed
        fid = fm.get('id') or md.stem
        title = fm.get('title', '')
        tags = fm.get('tags', '')
        text = f'{title}\n{body}'.strip()
        if not text:
            continue
        yield {
            'chunk_id': f'meta_faq:{fid}',
            'source_type': 'meta_faq',
            'source_id': fid,
            'text': text,
            'metadata': {
                'scholar_id': None,
                'tradition': None,
                'book_id': None,
                'chapter_num': None,
                'verse_start': None,
                'verse_end': None,
                'panel_type': tags or None,
            },
        }


# ── Top-level dispatcher ──────────────────────────────────────────────

SOURCE_CHUNKERS: dict[str, Any] = {
    'section_panel': chunk_section_panels,
    'chapter_panel': chunk_chapter_panels,
    'word_study': chunk_word_studies,
    'lexicon_entry': chunk_lexicon_entries,
    'debate_topic': chunk_debate_topics,
    'cross_ref_thread_note': chunk_cross_ref_thread_notes,
    'journey_stop': chunk_journey_stops,
    'meta_faq': chunk_meta_faq,
}


def iter_all_chunks(source_filter: str | None = None) -> Iterator[dict]:
    """Yield every chunk across every source type, in a stable order.

    If `source_filter` is supplied, only chunks from that source type are
    yielded (useful for `--source foo` in the CLI).
    """
    scholar_traditions = _load_scholar_traditions()
    for source_type, fn in SOURCE_CHUNKERS.items():
        if source_filter and source_filter != source_type:
            continue
        if source_type in ('section_panel', 'chapter_panel'):
            yield from fn(scholar_traditions)
        else:
            yield from fn()
