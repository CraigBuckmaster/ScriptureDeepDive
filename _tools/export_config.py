#!/usr/bin/env python3
"""
export_config.py — Export Python config dicts to JSON.

Phase 0E: Merges data from config.py, shared.py, and previously
extracted JSON (scholar-data.json from 0C, scholar-bios.json from 0D)
into comprehensive JSON files for the SQLite builder.

Usage:
    python3 _tools/export_config.py
"""
import os, sys, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'
sys.path.insert(0, str(ROOT / '_tools'))

import config


# ---------------------------------------------------------------------------
# All 66 books in canonical order (Protestant)
# ---------------------------------------------------------------------------
CANONICAL_ORDER = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1_samuel', '2_samuel',
    '1_kings', '2_kings', '1_chronicles', '2_chronicles',
    'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'song_of_solomon', 'isaiah', 'jeremiah',
    'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
    'haggai', 'zechariah', 'malachi',
    'matthew', 'mark', 'luke', 'john', 'acts',
    'romans', '1_corinthians', '2_corinthians', 'galatians',
    'ephesians', 'philippians', 'colossians',
    '1_thessalonians', '2_thessalonians',
    '1_timothy', '2_timothy', 'titus', 'philemon',
    'hebrews', 'james', '1_peter', '2_peter',
    '1_john', '2_john', '3_john', 'jude', 'revelation',
]

TOTAL_CHAPTERS = {
    'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36,
    'deuteronomy': 34, 'joshua': 24, 'judges': 21, 'ruth': 4,
    '1_samuel': 31, '2_samuel': 24, '1_kings': 22, '2_kings': 25,
    '1_chronicles': 29, '2_chronicles': 36, 'ezra': 10, 'nehemiah': 13,
    'esther': 10, 'job': 42, 'psalms': 150, 'proverbs': 31,
    'ecclesiastes': 12, 'song_of_solomon': 8, 'isaiah': 66,
    'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12,
    'hosea': 14, 'joel': 3, 'amos': 9, 'obadiah': 1, 'jonah': 4,
    'micah': 7, 'nahum': 3, 'habakkuk': 3, 'zephaniah': 3,
    'haggai': 2, 'zechariah': 14, 'malachi': 4,
    'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21, 'acts': 28,
    'romans': 16, '1_corinthians': 16, '2_corinthians': 13,
    'galatians': 6, 'ephesians': 6, 'philippians': 4, 'colossians': 4,
    '1_thessalonians': 5, '2_thessalonians': 3,
    '1_timothy': 6, '2_timothy': 4, 'titus': 3, 'philemon': 1,
    'hebrews': 13, 'james': 5, '1_peter': 5, '2_peter': 3,
    '1_john': 5, '2_john': 1, '3_john': 1, 'jude': 1, 'revelation': 22,
}

DISPLAY_NAMES = {
    'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus',
    'numbers': 'Numbers', 'deuteronomy': 'Deuteronomy', 'joshua': 'Joshua',
    'judges': 'Judges', 'ruth': 'Ruth', '1_samuel': '1 Samuel',
    '2_samuel': '2 Samuel', '1_kings': '1 Kings', '2_kings': '2 Kings',
    '1_chronicles': '1 Chronicles', '2_chronicles': '2 Chronicles',
    'ezra': 'Ezra', 'nehemiah': 'Nehemiah', 'esther': 'Esther',
    'job': 'Job', 'psalms': 'Psalms', 'proverbs': 'Proverbs',
    'ecclesiastes': 'Ecclesiastes', 'song_of_solomon': 'Song of Solomon',
    'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
    'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea',
    'joel': 'Joel', 'amos': 'Amos', 'obadiah': 'Obadiah', 'jonah': 'Jonah',
    'micah': 'Micah', 'nahum': 'Nahum', 'habakkuk': 'Habakkuk',
    'zephaniah': 'Zephaniah', 'haggai': 'Haggai', 'zechariah': 'Zechariah',
    'malachi': 'Malachi', 'matthew': 'Matthew', 'mark': 'Mark',
    'luke': 'Luke', 'john': 'John', 'acts': 'Acts', 'romans': 'Romans',
    '1_corinthians': '1 Corinthians', '2_corinthians': '2 Corinthians',
    'galatians': 'Galatians', 'ephesians': 'Ephesians',
    'philippians': 'Philippians', 'colossians': 'Colossians',
    '1_thessalonians': '1 Thessalonians', '2_thessalonians': '2 Thessalonians',
    '1_timothy': '1 Timothy', '2_timothy': '2 Timothy', 'titus': 'Titus',
    'philemon': 'Philemon', 'hebrews': 'Hebrews', 'james': 'James',
    '1_peter': '1 Peter', '2_peter': '2 Peter', '1_john': '1 John',
    '2_john': '2 John', '3_john': '3 John', 'jude': 'Jude',
    'revelation': 'Revelation',
}

# Read REGISTRY from shared.py (list of tuples)
def _read_registry():
    """Parse REGISTRY from shared.py without importing (avoid side effects)."""
    import re
    with open(ROOT / '_tools' / 'shared.py', encoding='utf-8') as f:
        raw = f.read()
    m = re.search(r'REGISTRY\s*=\s*\[', raw)
    if not m:
        return []
    start = m.end() - 1
    depth = 0
    for i in range(start, len(raw)):
        if raw[i] == '[': depth += 1
        elif raw[i] == ']': depth -= 1
        if depth == 0:
            block = raw[start:i + 1]
            break
    # Eval as Python literal
    import ast
    return ast.literal_eval(block)


# ---------------------------------------------------------------------------
# 1. books.json
# ---------------------------------------------------------------------------
def build_books():
    """Build the full 66-book list with live status."""
    registry = _read_registry()
    # Build set of live books from REGISTRY
    live_books = {entry[0] for entry in registry}

    books = []
    for i, book_id in enumerate(CANONICAL_ORDER, start=1):
        testament = 'ot' if i <= 39 else 'nt'
        books.append({
            'id': book_id,
            'name': DISPLAY_NAMES.get(book_id, book_id),
            'testament': testament,
            'total_chapters': TOTAL_CHAPTERS.get(book_id, 0),
            'book_order': i,
            'is_live': book_id in live_books,
        })
    return books


# ---------------------------------------------------------------------------
# 2. scholars.json (merged from all sources)
# ---------------------------------------------------------------------------
def build_scholars():
    """Merge SCHOLAR_REGISTRY + COMMENTATOR_SCOPE + scholar-data.json + scholar-bios.json."""
    # SCHOLAR_REGISTRY: list of tuples (panel_key, scholar_key, label, css_suffix)
    sr = config.SCHOLAR_REGISTRY

    # COMMENTATOR_SCOPE: { scholar_key: 'all' | [books] }
    cs = config.COMMENTATOR_SCOPE

    # scholar-data.json from 0C: has color, scope text, desc, plus extra fields
    sd_path = META / 'scholar-data.json'
    scholar_data_list = []
    if sd_path.exists():
        with open(sd_path) as f:
            scholar_data_list = json.load(f)
    sd_by_key = {s['key']: s for s in scholar_data_list}

    # scholar-bios.json from 0D: has eyebrow, tradition, sections
    bios_path = META / 'scholar-bios.json'
    bios = {}
    if bios_path.exists():
        with open(bios_path) as f:
            bios = json.load(f)

    # Build merged scholar entries
    scholars = []
    seen_keys = set()

    for panel_key, scholar_key, label, css_suffix in sr:
        if scholar_key in seen_keys:
            continue
        seen_keys.add(scholar_key)

        sd = sd_by_key.get(scholar_key, {})
        bio = bios.get(scholar_key, {})
        scope = cs.get(scholar_key, [])

        entry = {
            'id': scholar_key,
            'panel_key': panel_key,
            'label': label,
            'name': sd.get('name') or bio.get('name', label),
            'color': sd.get('color', '#888888'),
            'tradition': sd.get('tradition') or bio.get('tradition', ''),
            'scope': 'all' if scope == 'all' else scope,
            'scope_text': sd.get('scope', ''),
            'description': sd.get('desc', ''),
            'eyebrow': bio.get('eyebrow', ''),
            'bio_sections': bio.get('sections', []),
        }

        # Extra fields from scholar-data.js (if present)
        for extra_key in ('bookScope', 'buttonCSS'):
            if extra_key in sd:
                entry[extra_key] = sd[extra_key]

        scholars.append(entry)

    return scholars


# ---------------------------------------------------------------------------
# 3. scholar-scopes.json
# ---------------------------------------------------------------------------
def build_scholar_scopes():
    """Export COMMENTATOR_SCOPE as JSON."""
    return dict(config.COMMENTATOR_SCOPE)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    META.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Phase 0E: Exporting Python config → JSON")
    print("=" * 60)

    # 1. books.json
    books = build_books()
    books_path = META / 'books.json'
    with open(books_path, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
    live = [b for b in books if b['is_live']]
    live_ch = sum(b['total_chapters'] for b in live)
    total_ch = sum(b['total_chapters'] for b in books)
    print(f"\n  ✅ books.json: {len(books)} books ({len(live)} live = {live_ch} chapters, "
          f"{len(books) - len(live)} pending = {total_ch - live_ch} chapters)")

    # 2. scholars.json
    scholars = build_scholars()
    scholars_path = META / 'scholars.json'
    with open(scholars_path, 'w', encoding='utf-8') as f:
        json.dump(scholars, f, ensure_ascii=False, indent=2)
    with_bio = len([s for s in scholars if s['bio_sections']])
    with_color = len([s for s in scholars if s['color'] != '#888888'])
    print(f"  ✅ scholars.json: {len(scholars)} scholars "
          f"({with_bio} with bios, {with_color} with colors)")

    # 3. scholar-scopes.json
    scopes = build_scholar_scopes()
    scopes_path = META / 'scholar-scopes.json'
    with open(scopes_path, 'w', encoding='utf-8') as f:
        json.dump(scopes, f, ensure_ascii=False, indent=2)
    universal = [k for k, v in scopes.items() if v == 'all']
    print(f"  ✅ scholar-scopes.json: {len(scopes)} scopes "
          f"({len(universal)} universal: {universal})")

    # Summary
    total_size = sum(
        (META / f).stat().st_size
        for f in ['books.json', 'scholars.json', 'scholar-scopes.json']
    )
    print(f"\n{'='*60}")
    print(f"Phase 0E complete. Total: {total_size // 1024}KB")


if __name__ == '__main__':
    os.chdir(ROOT)
    main()
