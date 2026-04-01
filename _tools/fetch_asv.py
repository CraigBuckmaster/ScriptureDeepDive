"""
fetch_asv.py — Parse ASV USFX XML and normalize into CS verse file format.

Source: eBible.org ASV USFX export (public domain)
Input:  _tools/eng-asv_usfx.xml
Output: content/verses/asv/{book_id}.json (66 files)

Usage:
    PYTHONUTF8=1 python _tools/fetch_asv.py
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
USFX_PATH = ROOT / '_tools' / 'eng-asv_usfx.xml'
OUT_DIR = ROOT / 'content' / 'verses' / 'asv'

# USFX book code → (book_id, full_name, abbreviation)
# Same mapping used by fetch_kjv.py for consistency
BOOK_MAP: dict[str, tuple[str, str, str]] = {
    'GEN': ('genesis',          'Genesis',         'Gen'),
    'EXO': ('exodus',           'Exodus',          'Exod'),
    'LEV': ('leviticus',        'Leviticus',       'Lev'),
    'NUM': ('numbers',          'Numbers',         'Num'),
    'DEU': ('deuteronomy',      'Deuteronomy',     'Deut'),
    'JOS': ('joshua',           'Joshua',          'Josh'),
    'JDG': ('judges',           'Judges',          'Judg'),
    'RUT': ('ruth',             'Ruth',            'Ruth'),
    '1SA': ('1_samuel',         '1 Samuel',        '1 Sam'),
    '2SA': ('2_samuel',         '2 Samuel',        '2 Sam'),
    '1KI': ('1_kings',          '1 Kings',         '1 Kgs'),
    '2KI': ('2_kings',          '2 Kings',         '2 Kgs'),
    '1CH': ('1_chronicles',     '1 Chronicles',    '1 Chr'),
    '2CH': ('2_chronicles',     '2 Chronicles',    '2 Chr'),
    'EZR': ('ezra',             'Ezra',            'Ezra'),
    'NEH': ('nehemiah',         'Nehemiah',        'Neh'),
    'EST': ('esther',           'Esther',          'Esth'),
    'JOB': ('job',              'Job',             'Job'),
    'PSA': ('psalms',           'Psalms',          'Ps'),
    'PRO': ('proverbs',         'Proverbs',        'Prov'),
    'ECC': ('ecclesiastes',     'Ecclesiastes',    'Eccl'),
    'SNG': ('song_of_solomon',  'Song of Solomon', 'Song'),
    'ISA': ('isaiah',           'Isaiah',          'Isa'),
    'JER': ('jeremiah',         'Jeremiah',        'Jer'),
    'LAM': ('lamentations',     'Lamentations',    'Lam'),
    'EZK': ('ezekiel',          'Ezekiel',         'Ezek'),
    'DAN': ('daniel',           'Daniel',          'Dan'),
    'HOS': ('hosea',            'Hosea',           'Hos'),
    'JOL': ('joel',             'Joel',            'Joel'),
    'AMO': ('amos',             'Amos',            'Amos'),
    'OBA': ('obadiah',          'Obadiah',         'Obad'),
    'JON': ('jonah',            'Jonah',           'Jonah'),
    'MIC': ('micah',            'Micah',           'Mic'),
    'NAM': ('nahum',            'Nahum',           'Nah'),
    'HAB': ('habakkuk',         'Habakkuk',        'Hab'),
    'ZEP': ('zephaniah',        'Zephaniah',       'Zeph'),
    'HAG': ('haggai',           'Haggai',          'Hag'),
    'ZEC': ('zechariah',        'Zechariah',       'Zech'),
    'MAL': ('malachi',          'Malachi',         'Mal'),
    'MAT': ('matthew',          'Matthew',         'Matt'),
    'MRK': ('mark',             'Mark',            'Mark'),
    'LUK': ('luke',             'Luke',            'Luke'),
    'JHN': ('john',             'John',            'John'),
    'ACT': ('acts',             'Acts',            'Acts'),
    'ROM': ('romans',           'Romans',          'Rom'),
    '1CO': ('1_corinthians',    '1 Corinthians',   '1 Cor'),
    '2CO': ('2_corinthians',    '2 Corinthians',   '2 Cor'),
    'GAL': ('galatians',        'Galatians',       'Gal'),
    'EPH': ('ephesians',        'Ephesians',       'Eph'),
    'PHP': ('philippians',      'Philippians',     'Phil'),
    'COL': ('colossians',       'Colossians',      'Col'),
    '1TH': ('1_thessalonians',  '1 Thessalonians', '1 Thess'),
    '2TH': ('2_thessalonians',  '2 Thessalonians', '2 Thess'),
    '1TI': ('1_timothy',        '1 Timothy',       '1 Tim'),
    '2TI': ('2_timothy',        '2 Timothy',       '2 Tim'),
    'TIT': ('titus',            'Titus',           'Titus'),
    'PHM': ('philemon',         'Philemon',        'Phlm'),
    'HEB': ('hebrews',          'Hebrews',         'Heb'),
    'JAS': ('james',            'James',           'Jas'),
    '1PE': ('1_peter',          '1 Peter',         '1 Pet'),
    '2PE': ('2_peter',          '2 Peter',         '2 Pet'),
    '1JN': ('1_john',           '1 John',          '1 John'),
    '2JN': ('2_john',           '2 John',          '2 John'),
    '3JN': ('3_john',           '3 John',          '3 John'),
    'JUD': ('jude',             'Jude',            'Jude'),
    'REV': ('revelation',       'Revelation',      'Rev'),
}


def extract_text(el: ET.Element) -> str:
    """Recursively extract text from an element, stripping markup tags like <w>, <add>, etc."""
    parts: list[str] = []
    if el.text:
        parts.append(el.text)
    for child in el:
        # Skip footnotes and cross-references
        if child.tag in ('f', 'x', 'fe'):
            if child.tail:
                parts.append(child.tail)
            continue
        parts.append(extract_text(child))
        if child.tail:
            parts.append(child.tail)
    return ''.join(parts)


def clean_text(text: str) -> str:
    """Normalize whitespace and clean up verse text."""
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def parse_usfx(path: Path) -> dict[str, list[dict]]:
    """
    Parse USFX XML into dict of book_code → list of {ch, v, text}.
    Uses iterparse for memory efficiency on large XML files.
    """
    books: dict[str, list[dict]] = defaultdict(list)
    current_book = None
    current_chapter = 0

    # We need to parse the whole tree because verse text spans across
    # multiple elements between <v> tags
    print(f'Parsing {path.name} ...')
    tree = ET.parse(path)
    root = tree.getroot()

    for book_el in root.iter('book'):
        book_code = book_el.get('id', '')
        if book_code not in BOOK_MAP:
            continue  # skip front matter, preface, etc.

        current_book = book_code
        current_chapter = 0

        # Walk through all child elements to find chapters and verses
        for el in book_el.iter():
            if el.tag == 'c':
                current_chapter = int(el.get('id', '0'))
            elif el.tag == 'v':
                verse_id = el.get('id', '0')
                if verse_id == '0':
                    continue
                verse_num = int(verse_id)

                # Collect text from this <v> tag until the next <ve/> or <v>
                # The verse text is everything between <v> and <ve/> in the
                # parent element. We need to gather text nodes and child
                # element text that follows this <v> tag.
                # Since iterparse won't help here, we use a different approach:
                # get the tail of <v> and subsequent siblings until <ve/> or next <v>.
                text_parts: list[str] = []
                if el.tail:
                    text_parts.append(el.tail)

                # Walk siblings after this <v> element
                parent = None
                for p_el in book_el.iter():
                    for child in p_el:
                        if child is el:
                            parent = p_el
                            break
                    if parent is not None:
                        break

                if parent is not None:
                    found_v = False
                    for sibling in parent:
                        if sibling is el:
                            found_v = True
                            continue
                        if not found_v:
                            continue
                        # Stop at verse end or next verse
                        if sibling.tag in ('ve', 'v', 'c'):
                            break
                        text_parts.append(extract_text(sibling))
                        if sibling.tail:
                            text_parts.append(sibling.tail)

                verse_text = clean_text(''.join(text_parts))
                if verse_text:
                    books[current_book].append({
                        'ch': current_chapter,
                        'v': verse_num,
                        'text': verse_text,
                    })

    return books


def parse_usfx_regex(path: Path) -> dict[str, list[dict]]:
    """
    Regex-based USFX parser — more reliable for this XML structure
    where verse boundaries are marked by <v> ... <ve/> pairs.
    """
    print(f'Parsing {path.name} (regex) ...')
    content = path.read_text(encoding='utf-8')

    books: dict[str, list[dict]] = defaultdict(list)

    # Split by book
    book_splits = re.split(r'<book\s+id="([A-Z0-9]+)">', content)
    # book_splits: ['preamble', 'GEN', 'gen content', 'EXO', 'exo content', ...]

    i = 1
    while i < len(book_splits) - 1:
        book_code = book_splits[i]
        book_content = book_splits[i + 1]
        i += 2

        if book_code not in BOOK_MAP:
            continue

        current_chapter = 0

        # Process line by line / tag by tag
        # Find all chapter and verse markers
        pos = 0
        while pos < len(book_content):
            # Find next chapter or verse tag
            ch_match = re.search(r'<c\s+id="(\d+)"\s*/>', book_content[pos:])
            v_match = re.search(r'<v\s+id="(\d+)"[^/]*/>', book_content[pos:])

            if ch_match and (not v_match or ch_match.start() < v_match.start()):
                current_chapter = int(ch_match.group(1))
                pos += ch_match.end()
                continue

            if not v_match:
                break

            verse_num = int(v_match.group(1))
            verse_start = pos + v_match.end()

            # Find the end of this verse: <ve/> or next <v> or next <c>
            ve_match = re.search(r'<ve\s*/>', book_content[verse_start:])
            next_v = re.search(r'<v\s+id="\d+"', book_content[verse_start:])
            next_c = re.search(r'<c\s+id="\d+"', book_content[verse_start:])

            ends = []
            if ve_match:
                ends.append(ve_match.start())
            if next_v:
                ends.append(next_v.start())
            if next_c:
                ends.append(next_c.start())

            if ends:
                verse_end = verse_start + min(ends)
            else:
                verse_end = verse_start + 500  # fallback

            raw_text = book_content[verse_start:verse_end]

            # Strip all XML tags to get plain text
            plain = re.sub(r'<[^>]+>', '', raw_text)
            plain = clean_text(plain)

            if plain and current_chapter > 0:
                books[book_code].append({
                    'ch': current_chapter,
                    'v': verse_num,
                    'text': plain,
                })

            pos = verse_start + (min(ends) if ends else 500)

    return books


def write_files(books: dict[str, list[dict]]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total = 0

    for book_code, (book_id, full_name, abbrev) in BOOK_MAP.items():
        verses_raw = books.get(book_code, [])
        if not verses_raw:
            print(f'  WARNING: no verses for {book_code} ({book_id})', file=sys.stderr)
            continue

        # Sort and deduplicate
        seen = set()
        verses_out = []
        for v in sorted(verses_raw, key=lambda x: (x['ch'], x['v'])):
            key = (v['ch'], v['v'])
            if key in seen:
                continue
            seen.add(key)
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
        out_path.write_text(
            json.dumps(verses_out, ensure_ascii=False, indent=2),
            encoding='utf-8',
        )
        total += len(verses_out)

    print(f'  Written {len(BOOK_MAP)} files — {total} verses total to {OUT_DIR}')


def main():
    if not USFX_PATH.exists():
        print(f'ERROR: {USFX_PATH} not found.', file=sys.stderr)
        print('Place the ASV USFX XML file at _tools/eng-asv_usfx.xml', file=sys.stderr)
        sys.exit(1)

    books = parse_usfx_regex(USFX_PATH)
    write_files(books)

    # Summary
    total = sum(len(v) for v in books.values() if v)
    canon_books = [c for c in BOOK_MAP if books.get(c)]
    print(f'Done. {len(canon_books)}/66 books, {total} verses.')


if __name__ == '__main__':
    main()
