#!/usr/bin/env python3
"""
build_niv.py — NIV verse file builder for new books.

Uses the Scripture API Bible (api.scripture.api.bible) to download NIV verse
text for books not yet in the repo and writes output to verses/niv/ot/ or
verses/niv/nt/ in the same format as the existing NIV files.

Usage:
    API_BIBLE_KEY=your_key_here python _tools/build_niv.py --books "1 Kings" "Psalms"

    Or set the key inline:
    python _tools/build_niv.py --key your_key_here --books "1 Kings"

    List all available books:
    python _tools/build_niv.py --key your_key_here --list-books

    Dry run (no API calls):
    python _tools/build_niv.py --key your_key_here --books "1 Kings" --dry-run

Get a free API key at:
    https://scripture.api.bible/
    (Sign up -> My Apps -> Add App -> copy the API key)

The NIV Bible ID on Scripture API Bible is:
    78a9f6124f344018-01  (New International Version 2011)

After running:
    1. Verify the output in verses/niv/
    2. Add the book to LIVE_BOOKS in build_esv.py so ESV can also be pulled
    3. Add the book to REGISTRY in shared.py
    4. Build the chapter HTML files
    5. Commit and deploy

NOTE: The 9 books already in the repo (Genesis, Exodus, Ruth, Proverbs,
Matthew, Mark, Luke, John, Acts) do NOT need to be re-pulled — they are
complete and accurate. This script is only for NEW books.
"""

import os
import re
import sys
import json
import time
import urllib.request
import urllib.error
import argparse

# Force UTF-8 output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── CONFIG ────────────────────────────────────────────────────────────────────

# NIV Bible ID on Scripture API Bible
NIV_BIBLE_ID = '78a9f6124f344018-01'

API_BASE = 'https://api.scripture.api.bible/v1'

# Book metadata: (display_name, testament, total_chapters, book_id_on_api)
# Book IDs follow the USFM standard used by Scripture API Bible.
# Add new books here as you need them.
ALL_BOOKS = {
    # Old Testament
    'Genesis':        ('ot', 50,  'GEN'),
    'Exodus':         ('ot', 40,  'EXO'),
    'Leviticus':      ('ot', 27,  'LEV'),
    'Numbers':        ('ot', 36,  'NUM'),
    'Deuteronomy':    ('ot', 34,  'DEU'),
    'Joshua':         ('ot', 24,  'JOS'),
    'Judges':         ('ot', 21,  'JDG'),
    'Ruth':           ('ot',  4,  'RUT'),
    '1 Samuel':       ('ot', 31,  '1SA'),
    '2 Samuel':       ('ot', 24,  '2SA'),
    '1 Kings':        ('ot', 22,  '1KI'),
    '2 Kings':        ('ot', 25,  '2KI'),
    '1 Chronicles':   ('ot', 29,  '1CH'),
    '2 Chronicles':   ('ot', 36,  '2CH'),
    'Ezra':           ('ot', 10,  'EZR'),
    'Nehemiah':       ('ot', 13,  'NEH'),
    'Esther':         ('ot', 10,  'EST'),
    'Job':            ('ot', 42,  'JOB'),
    'Psalms':         ('ot', 150, 'PSA'),
    'Proverbs':       ('ot', 31,  'PRO'),
    'Ecclesiastes':   ('ot', 12,  'ECC'),
    'Song of Solomon':('ot',  8,  'SNG'),
    'Isaiah':         ('ot', 66,  'ISA'),
    'Jeremiah':       ('ot', 52,  'JER'),
    'Lamentations':   ('ot',  5,  'LAM'),
    'Ezekiel':        ('ot', 48,  'EZK'),
    'Daniel':         ('ot', 12,  'DAN'),
    'Hosea':          ('ot', 14,  'HOS'),
    'Joel':           ('ot',  3,  'JOL'),
    'Amos':           ('ot',  9,  'AMO'),
    'Obadiah':        ('ot',  1,  'OBA'),
    'Jonah':          ('ot',  4,  'JON'),
    'Micah':          ('ot',  7,  'MIC'),
    'Nahum':          ('ot',  3,  'NAM'),
    'Habakkuk':       ('ot',  3,  'HAB'),
    'Zephaniah':      ('ot',  3,  'ZEP'),
    'Haggai':         ('ot',  2,  'HAG'),
    'Zechariah':      ('ot', 14,  'ZEC'),
    'Malachi':        ('ot',  4,  'MAL'),
    # New Testament
    'Matthew':        ('nt', 28,  'MAT'),
    'Mark':           ('nt', 16,  'MRK'),
    'Luke':           ('nt', 24,  'LUK'),
    'John':           ('nt', 21,  'JHN'),
    'Acts':           ('nt', 28,  'ACT'),
    'Romans':         ('nt', 16,  'ROM'),
    '1 Corinthians':  ('nt', 16,  '1CO'),
    '2 Corinthians':  ('nt', 13,  '2CO'),
    'Galatians':      ('nt',  6,  'GAL'),
    'Ephesians':      ('nt',  6,  'EPH'),
    'Philippians':    ('nt',  4,  'PHP'),
    'Colossians':     ('nt',  4,  'COL'),
    '1 Thessalonians':('nt',  5,  '1TH'),
    '2 Thessalonians':('nt',  3,  '2TH'),
    '1 Timothy':      ('nt',  6,  '1TI'),
    '2 Timothy':      ('nt',  4,  '2TI'),
    'Titus':          ('nt',  3,  'TIT'),
    'Philemon':       ('nt',  1,  'PHM'),
    'Hebrews':        ('nt', 13,  'HEB'),
    'James':          ('nt',  5,  'JAS'),
    '1 Peter':        ('nt',  5,  '1PE'),
    '2 Peter':        ('nt',  3,  '2PE'),
    '1 John':         ('nt',  5,  '1JN'),
    '2 John':         ('nt',  1,  '2JN'),
    '3 John':         ('nt',  1,  '3JN'),
    'Jude':           ('nt',  1,  'JUD'),
    'Revelation':     ('nt', 22,  'REV'),
}

# Books already in the repo — warn but don't block if requested
EXISTING_BOOKS = {
    'Genesis', 'Exodus', 'Ruth', 'Proverbs',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts'
}

DELAY_SEC  = 1.0   # polite delay between API requests
REPO_ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(REPO_ROOT, 'verses', 'niv')


# ── HELPERS ───────────────────────────────────────────────────────────────────

def fetch_chapter_verses(book_id, chapter, api_key):
    """
    Fetch all verses for one chapter from Scripture API Bible.
    Returns list of (verse_num, text) tuples.
    """
    # Get verse list for the chapter
    chapter_id = f'{book_id}.{chapter}'
    url = f'{API_BASE}/bibles/{NIV_BIBLE_ID}/chapters/{chapter_id}/verses'
    req = urllib.request.Request(url, headers={'api-key': api_key})

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            verse_list = data.get('data', [])
    except urllib.error.HTTPError as e:
        print(f'    HTTP {e.code} fetching verse list for {book_id} {chapter}: {e.reason}')
        return None
    except Exception as e:
        print(f'    Error fetching verse list for {book_id} {chapter}: {e}')
        return None

    verses = []
    for verse_meta in verse_list:
        verse_id = verse_meta['id']          # e.g. "GEN.1.1"
        v_num    = int(verse_meta['number'])  # e.g. 1

        # Fetch individual verse text (plain text, no markup)
        v_url = (f'{API_BASE}/bibles/{NIV_BIBLE_ID}/verses/{verse_id}'
                 f'?content-type=text&include-verse-numbers=false'
                 f'&include-titles=false&include-chapter-numbers=false')
        v_req = urllib.request.Request(v_url, headers={'api-key': api_key})

        try:
            with urllib.request.urlopen(v_req, timeout=15) as v_resp:
                v_data = json.loads(v_resp.read().decode('utf-8'))
                text   = v_data['data']['content']
                # Clean: collapse whitespace, strip leading/trailing
                text   = re.sub(r'\s+', ' ', text).strip()
                if text:
                    verses.append((v_num, text))
            time.sleep(0.15)  # brief pause between verse fetches within chapter
        except urllib.error.HTTPError as e:
            print(f'    HTTP {e.code} fetching {verse_id}: {e.reason}')
        except Exception as e:
            print(f'    Error fetching {verse_id}: {e}')

    return verses


def build_verse_objects(book_name, testament, chapter, verse_tuples):
    """Convert (v_num, text) tuples into verse dict objects."""
    book_dir   = book_name.lower().replace(' ', '_').replace("'", '')
    book_short = {
        'Genesis':'Gen','Exodus':'Ex','Leviticus':'Lev','Numbers':'Num',
        'Deuteronomy':'Deut','Joshua':'Josh','Judges':'Judg','Ruth':'Ru',
        '1 Samuel':'1Sa','2 Samuel':'2Sa','1 Kings':'1Ki','2 Kings':'2Ki',
        '1 Chronicles':'1Ch','2 Chronicles':'2Ch','Ezra':'Ezr',
        'Nehemiah':'Neh','Esther':'Est','Job':'Job','Psalms':'Ps',
        'Proverbs':'Prov','Ecclesiastes':'Eccl','Song of Solomon':'Song',
        'Isaiah':'Isa','Jeremiah':'Jer','Lamentations':'Lam',
        'Ezekiel':'Ezek','Daniel':'Dan','Hosea':'Hos','Joel':'Joel',
        'Amos':'Amos','Obadiah':'Obad','Jonah':'Jonah','Micah':'Mic',
        'Nahum':'Nah','Habakkuk':'Hab','Zephaniah':'Zeph','Haggai':'Hag',
        'Zechariah':'Zech','Malachi':'Mal',
        'Matthew':'Mt','Mark':'Mk','Luke':'Lk','John':'Jn','Acts':'Ac',
        'Romans':'Rom','1 Corinthians':'1Co','2 Corinthians':'2Co',
        'Galatians':'Gal','Ephesians':'Eph','Philippians':'Phil',
        'Colossians':'Col','1 Thessalonians':'1Th','2 Thessalonians':'2Th',
        '1 Timothy':'1Ti','2 Timothy':'2Ti','Titus':'Tit','Philemon':'Phm',
        'Hebrews':'Heb','James':'Jas','1 Peter':'1Pe','2 Peter':'2Pe',
        '1 John':'1Jn','2 John':'2Jn','3 John':'3Jn','Jude':'Jude',
        'Revelation':'Rev',
    }.get(book_name, book_name[:3])

    return [
        {
            'ref':   f'{book_name} {chapter}:{v_num}',
            'short': f'{book_short} {chapter}:{v_num}',
            'text':  text,
            'url':   f'{testament}/{book_dir}/{book_name.replace(" ", "_")}_{chapter}.html',
            'book':  book_name,
            'ch':    chapter,
            'v':     v_num,
        }
        for v_num, text in verse_tuples
    ]


def write_book_file(book_name, testament, verses):
    """Write verses/niv/{testament}/{book_lower}.js"""
    # File name: lowercase, spaces become underscores, drop apostrophes
    book_file  = book_name.lower().replace(' ', '_').replace("'", '') + '.js'
    var_name   = 'VERSES_' + re.sub(r'\W', '_', book_name.upper())
    testament_dir = os.path.join(OUTPUT_DIR, testament)
    os.makedirs(testament_dir, exist_ok=True)

    out_path = os.path.join(testament_dir, book_file)
    payload  = json.dumps(verses, separators=(',', ':'), ensure_ascii=False)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(f'var {var_name}={payload};\n')
        f.write(f'if(!window.VERSES_ALL)window.VERSES_ALL=[];\n')
        f.write(f'window.VERSES_ALL=window.VERSES_ALL.concat({var_name});\n')

    return out_path, var_name


def rebuild_niv_index():
    """Rebuild verses/niv/verses.js from all existing NIV book files."""
    import glob as _glob
    all_verses = []
    for fpath in sorted(_glob.glob(os.path.join(OUTPUT_DIR, '**', '*.js'), recursive=True)):
        if 'verses.js' in fpath:
            continue
        with open(fpath, encoding='utf-8') as f: raw = f.read()
        start = raw.find('[')
        if start == -1: continue
        depth = 0
        for i in range(start, len(raw)):
            if raw[i] == '[': depth += 1
            elif raw[i] == ']':
                depth -= 1
                if depth == 0: end = i + 1; break
        try:
            book_verses = json.loads(raw[start:end])
            all_verses.extend(book_verses)
            print(f'  {os.path.basename(fpath)}: {len(book_verses)} verses')
        except Exception as e:
            print(f'  {os.path.basename(fpath)}: ERROR ({e})')

    out_path = os.path.join(OUTPUT_DIR, 'verses.js')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('// NIV full canon verse index\n')
        f.write('var VERSES_ALL=' + json.dumps(all_verses, separators=(',', ':'),
                ensure_ascii=False) + ';\n')
    return len(all_verses), out_path


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Build NIV verse files for new books using Scripture API Bible.')
    parser.add_argument('--key',   help='API key (or set API_BIBLE_KEY env var)')
    parser.add_argument('--books', nargs='+', metavar='BOOK',
                        help='Book name(s) to fetch, e.g. "1 Kings" "Psalms"')
    parser.add_argument('--list-books', action='store_true',
                        help='List all available book names and exit')
    parser.add_argument('--dry-run',    action='store_true',
                        help='Show what would be fetched without calling the API')
    parser.add_argument('--rebuild-index', action='store_true',
                        help='Rebuild verses/niv/verses.js from all existing files only')
    args = parser.parse_args()

    # List books mode
    if args.list_books:
        print('Available books (already in repo marked with *):')
        for name in sorted(ALL_BOOKS):
            tst, chs, _ = ALL_BOOKS[name]
            marker = ' *' if name in EXISTING_BOOKS else ''
            print(f'  {name:25} ({tst.upper()}, {chs:3} chapters){marker}')
        return

    # Rebuild index only
    if args.rebuild_index:
        print('Rebuilding verses/niv/verses.js from all existing NIV files...')
        total, path = rebuild_niv_index()
        print(f'\nDone. {total} total verses -> {path}')
        return

    api_key = args.key or os.environ.get('API_BIBLE_KEY', '')
    if not api_key and not args.dry_run:
        print('ERROR: API key required.')
        print('  Set API_BIBLE_KEY env var or use --key YOUR_KEY')
        print('  Get a free key at https://scripture.api.bible/')
        sys.exit(1)

    if not args.books:
        print('ERROR: specify at least one book with --books, e.g.:')
        print('  python _tools/build_niv.py --key KEY --books "1 Kings" "Psalms"')
        print('  python _tools/build_niv.py --key KEY --list-books')
        sys.exit(1)

    # Validate requested books
    to_fetch = []
    for name in args.books:
        if name not in ALL_BOOKS:
            print(f'ERROR: "{name}" not recognised. Use --list-books to see valid names.')
            sys.exit(1)
        if name in EXISTING_BOOKS:
            print(f'WARNING: {name} is already in the repo at verses/niv/. '
                  f'Fetching again will overwrite it.')
        to_fetch.append((name, *ALL_BOOKS[name]))  # (name, testament, chapters, book_id)

    total_chapters = sum(chs for _, _, chs, _ in to_fetch)
    print('Scripture Deep Dive -- NIV verse file builder')
    print(f'Output:  {OUTPUT_DIR}')
    print(f'Books:   {len(to_fetch)} ({total_chapters} chapters total)')
    print(f'Delay:   {DELAY_SEC}s between chapters')
    print()

    if args.dry_run:
        print('DRY RUN -- no API calls will be made.')
        est = total_chapters * (DELAY_SEC + 0.5)
        print(f'Would make ~{total_chapters} chapter requests (~{est:.0f}s)')
        for name, tst, chs, book_id in to_fetch:
            print(f'  {name:25} ({tst.upper()}, {chs} chapters, ID: {book_id})')
        return

    all_new_verses = []

    for book_name, testament, chapter_count, book_id in to_fetch:
        print(f'{book_name} ({testament.upper()}, {chapter_count} chapters):')
        book_verses = []

        for ch in range(1, chapter_count + 1):
            verse_tuples = fetch_chapter_verses(book_id, ch, api_key)

            if verse_tuples is None:
                print(f'  Ch {ch:3d}: FAILED -- retrying in 15s...')
                time.sleep(15)
                verse_tuples = fetch_chapter_verses(book_id, ch, api_key)
                if verse_tuples is None:
                    print(f'  Ch {ch:3d}: FAILED twice -- skipping.')
                    continue

            ch_verses = build_verse_objects(book_name, testament, ch, verse_tuples)
            book_verses.extend(ch_verses)
            sample = verse_tuples[0][1] if verse_tuples else ''
            print(f'  Ch {ch:3d}: {len(verse_tuples):3d} verses  -- '
                  f'{book_name} {ch}:1: {sample[:50]}...')
            time.sleep(DELAY_SEC)

        # Write book file
        out_path, var_name = write_book_file(book_name, testament, book_verses)
        all_new_verses.extend(book_verses)
        print(f'  -> Wrote {out_path} ({len(book_verses)} verses)\n')

    # Rebuild combined NIV index
    print('Rebuilding full NIV index (verses/niv/verses.js)...')
    total, idx_path = rebuild_niv_index()
    print(f'-> Wrote {idx_path} ({total} total NIV verses)')
    print()
    print('Done. Next steps:')
    print('  1. Add the new book(s) to LIVE_BOOKS in _tools/build_esv.py')
    print('  2. Run build_esv.py --books "BookName" to pull the ESV text')
    print('  3. Add the book to REGISTRY in _tools/shared.py')
    print('  4. Build the chapter HTML files')
    print('  5. git add verses/niv/ && git commit -m "Add NIV: BookName"')
    print('  6. Deploy')


if __name__ == '__main__':
    main()
