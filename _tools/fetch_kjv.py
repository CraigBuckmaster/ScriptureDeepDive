"""
fetch_kjv.py — Download KJV verse data and normalize into CS verse file format.

Source: scrollmapper/bible_databases (public domain)
Output: content/verses/kjv/{book_id}.json (66 files)

Usage:
    PYTHONUTF8=1 python _tools/fetch_kjv.py
"""

import json
import sys
import urllib.request
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'content' / 'verses' / 'kjv'

SOURCE_URL = (
    'https://raw.githubusercontent.com/thiagobodruk/bible'
    '/master/json/en_kjv.json'
)

# Maps 1-based book number → (book_id, full_name, abbreviation)
BOOKS = [
    ('genesis',          'Genesis',         'Gen'),
    ('exodus',           'Exodus',          'Exod'),
    ('leviticus',        'Leviticus',       'Lev'),
    ('numbers',          'Numbers',         'Num'),
    ('deuteronomy',      'Deuteronomy',     'Deut'),
    ('joshua',           'Joshua',          'Josh'),
    ('judges',           'Judges',          'Judg'),
    ('ruth',             'Ruth',            'Ruth'),
    ('1_samuel',         '1 Samuel',        '1 Sam'),
    ('2_samuel',         '2 Samuel',        '2 Sam'),
    ('1_kings',          '1 Kings',         '1 Kgs'),
    ('2_kings',          '2 Kings',         '2 Kgs'),
    ('1_chronicles',     '1 Chronicles',    '1 Chr'),
    ('2_chronicles',     '2 Chronicles',    '2 Chr'),
    ('ezra',             'Ezra',            'Ezra'),
    ('nehemiah',         'Nehemiah',        'Neh'),
    ('esther',           'Esther',          'Esth'),
    ('job',              'Job',             'Job'),
    ('psalms',           'Psalms',          'Ps'),
    ('proverbs',         'Proverbs',        'Prov'),
    ('ecclesiastes',     'Ecclesiastes',    'Eccl'),
    ('song_of_solomon',  'Song of Solomon', 'Song'),
    ('isaiah',           'Isaiah',          'Isa'),
    ('jeremiah',         'Jeremiah',        'Jer'),
    ('lamentations',     'Lamentations',    'Lam'),
    ('ezekiel',          'Ezekiel',         'Ezek'),
    ('daniel',           'Daniel',          'Dan'),
    ('hosea',            'Hosea',           'Hos'),
    ('joel',             'Joel',            'Joel'),
    ('amos',             'Amos',            'Amos'),
    ('obadiah',          'Obadiah',         'Obad'),
    ('jonah',            'Jonah',           'Jonah'),
    ('micah',            'Micah',           'Mic'),
    ('nahum',            'Nahum',           'Nah'),
    ('habakkuk',         'Habakkuk',        'Hab'),
    ('zephaniah',        'Zephaniah',       'Zeph'),
    ('haggai',           'Haggai',          'Hag'),
    ('zechariah',        'Zechariah',       'Zech'),
    ('malachi',          'Malachi',         'Mal'),
    ('matthew',          'Matthew',         'Matt'),
    ('mark',             'Mark',            'Mark'),
    ('luke',             'Luke',            'Luke'),
    ('john',             'John',            'John'),
    ('acts',             'Acts',            'Acts'),
    ('romans',           'Romans',          'Rom'),
    ('1_corinthians',    '1 Corinthians',   '1 Cor'),
    ('2_corinthians',    '2 Corinthians',   '2 Cor'),
    ('galatians',        'Galatians',       'Gal'),
    ('ephesians',        'Ephesians',       'Eph'),
    ('philippians',      'Philippians',     'Phil'),
    ('colossians',       'Colossians',      'Col'),
    ('1_thessalonians',  '1 Thessalonians', '1 Thess'),
    ('2_thessalonians',  '2 Thessalonians', '2 Thess'),
    ('1_timothy',        '1 Timothy',       '1 Tim'),
    ('2_timothy',        '2 Timothy',       '2 Tim'),
    ('titus',            'Titus',           'Titus'),
    ('philemon',         'Philemon',        'Phlm'),
    ('hebrews',          'Hebrews',         'Heb'),
    ('james',            'James',           'Jas'),
    ('1_peter',          '1 Peter',         '1 Pet'),
    ('2_peter',          '2 Peter',         '2 Pet'),
    ('1_john',           '1 John',          '1 John'),
    ('2_john',           '2 John',          '2 John'),
    ('3_john',           '3 John',          '3 John'),
    ('jude',             'Jude',            'Jude'),
    ('revelation',       'Revelation',      'Rev'),
]


import re


def clean_kjv_text(text: str) -> str:
    """
    Clean KJV text from thiagobodruk source:
    1. Remove marginal notes: {word...: Heb. explanation} or {Heb. word}
    2. Remove braces from italicized words: {was} → was
    3. Normalize whitespace
    """
    # Remove marginal notes (contain colon with Heb./Gr. or start with Heb./Gr.)
    # Pattern: {anything: Heb. anything} or {Heb. anything}
    text = re.sub(r'\s*\{[^}]*:\s*Heb\.[^}]*\}', '', text)
    text = re.sub(r'\s*\{Heb\.[^}]*\}', '', text)
    text = re.sub(r'\s*\{[^}]*:\s*Gr\.[^}]*\}', '', text)
    text = re.sub(r'\s*\{Gr\.[^}]*\}', '', text)
    # Remove any remaining notes with colons (catch-all for other marginal notes)
    text = re.sub(r'\s*\{[^}]*:[^}]*\}', '', text)
    
    # Remove braces from italicized words (words added by translators)
    # These are simple {word} or {word word} without colons
    text = re.sub(r'\{([^}:]+)\}', r'\1', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def fetch_source() -> list:
    print(f'Fetching KJV from {SOURCE_URL} ...')
    with urllib.request.urlopen(SOURCE_URL, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8-sig'))
    # thiagobodruk format: array of book objects
    if isinstance(data, list):
        total = sum(sum(len(ch) for ch in b.get('chapters', [])) for b in data)
        print(f'  {total} verses in {len(data)} books fetched.')
        return data
    raise ValueError(f'Unexpected JSON structure: {type(data)}')


def build_book_verses(raw: list) -> dict:
    """
    Parse thiagobodruk format:
    [{"abbrev": "gn", "chapters": [["verse1", ...], ...]}, ...]
    Returns dict: 1-based book number → list of {ch, v, text}
    """
    books: dict[int, list] = {}
    for book_num, book in enumerate(raw, start=1):
        verses = []
        for ch_idx, chapter_verses in enumerate(book.get('chapters', []), start=1):
            for v_idx, text in enumerate(chapter_verses, start=1):
                cleaned = clean_kjv_text(str(text))
                verses.append({'ch': ch_idx, 'v': v_idx, 'text': cleaned})
        books[book_num] = verses
    return books


def write_files(book_verses: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for book_num, (book_id, full_name, abbrev) in enumerate(BOOKS, start=1):
        verses_raw = book_verses.get(book_num, [])
        if not verses_raw:
            print(f'  WARNING: no verses for book {book_num} ({book_id})', file=sys.stderr)
            continue

        verses_out = []
        for v in sorted(verses_raw, key=lambda x: (x['ch'], x['v'])):
            ref = f'{full_name} {v["ch"]}:{v["v"]}'
            short = f'{abbrev} {v["ch"]}:{v["v"]}'
            verses_out.append({
                'ref': ref,
                'short': short,
                'text': v['text'],
                'url': '',
                'book': full_name,
                'ch': v['ch'],
                'v': v['v'],
            })

        out_path = OUT_DIR / f'{book_id}.json'
        out_path.write_text(json.dumps(verses_out, ensure_ascii=False, indent=2), encoding='utf-8')

    total = sum(len(v) for v in book_verses.values())
    print(f'  Written {len(BOOKS)} files — {total} verses total to {OUT_DIR}')


def main():
    raw = fetch_source()
    book_verses = build_book_verses(raw)
    write_files(book_verses)
    print('Done.')


if __name__ == '__main__':
    main()
