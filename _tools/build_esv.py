#!/usr/bin/env python3
"""
build_esv.py — One-time ESV verse file builder.

Uses the Crossway ESV API to download all verse text for the books
currently live in Scripture Deep Dive and writes the output to
verses/esv/ot/ and verses/esv/nt/ in the same format as verses/niv/.

Usage:
    ESV_API_KEY=your_key_here python3 _tools/build_esv.py

    Or set the key inline:
    python3 _tools/build_esv.py --key your_key_here

The API key is never written to disk or committed. Get a free key at:
    https://api.esv.org/

After running:
    1. Verify the output in verses/esv/
    2. In translation.js, set esv: { available: true }
    3. Run: python3 _tools/shared.py  (to normalise the ESV files)
    4. Commit verses/esv/ to the repo
    5. Deploy

Copyright notice will appear automatically on chapter pages when ESV is active:
    "Scripture quotations are from the ESV® Bible, copyright © 2001 by Crossway."
"""

import os
import re
import sys
import json

# Force UTF-8 output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import time
import urllib.request
import urllib.error
import urllib.parse
import argparse

# ── CONFIG ────────────────────────────────────────────────────────────────────

# Books currently live in the app — (book_name, testament, chapter_count)
# Full Bible — all 66 books
LIVE_BOOKS = [
    # OT
    ('Genesis',         'ot',  50), ('Exodus',          'ot',  40), ('Leviticus',       'ot',  27),
    ('Numbers',         'ot',  36), ('Deuteronomy',     'ot',  34), ('Joshua',          'ot',  24),
    ('Judges',          'ot',  21), ('Ruth',            'ot',   4), ('1 Samuel',        'ot',  31),
    ('2 Samuel',        'ot',  24), ('1 Kings',         'ot',  22), ('2 Kings',         'ot',  25),
    ('1 Chronicles',    'ot',  29), ('2 Chronicles',    'ot',  36), ('Ezra',            'ot',  10),
    ('Nehemiah',        'ot',  13), ('Esther',          'ot',  10), ('Job',             'ot',  42),
    ('Psalms',          'ot', 150), ('Proverbs',        'ot',  31), ('Ecclesiastes',    'ot',  12),
    ('Song of Solomon', 'ot',   8), ('Isaiah',          'ot',  66), ('Jeremiah',        'ot',  52),
    ('Lamentations',    'ot',   5), ('Ezekiel',         'ot',  48), ('Daniel',          'ot',  12),
    ('Hosea',           'ot',  14), ('Joel',            'ot',   3), ('Amos',            'ot',   9),
    ('Obadiah',         'ot',   1), ('Jonah',           'ot',   4), ('Micah',           'ot',   7),
    ('Nahum',           'ot',   3), ('Habakkuk',        'ot',   3), ('Zephaniah',       'ot',   3),
    ('Haggai',          'ot',   2), ('Zechariah',       'ot',  14), ('Malachi',         'ot',   4),
    # NT
    ('Matthew',         'nt',  28), ('Mark',            'nt',  16), ('Luke',            'nt',  24),
    ('John',            'nt',  21), ('Acts',            'nt',  28), ('Romans',          'nt',  16),
    ('1 Corinthians',   'nt',  16), ('2 Corinthians',   'nt',  13), ('Galatians',       'nt',   6),
    ('Ephesians',       'nt',   6), ('Philippians',     'nt',   4), ('Colossians',      'nt',   4),
    ('1 Thessalonians', 'nt',   5), ('2 Thessalonians', 'nt',   3), ('1 Timothy',       'nt',   6),
    ('2 Timothy',       'nt',   4), ('Titus',           'nt',   3), ('Philemon',        'nt',   1),
    ('Hebrews',         'nt',  13), ('James',           'nt',   5), ('1 Peter',         'nt',   5),
    ('2 Peter',         'nt',   3), ('1 John',          'nt',   5), ('2 John',          'nt',   1),
    ('3 John',          'nt',   1), ('Jude',            'nt',   1), ('Revelation',      'nt',  22),
]

FETCH_ONLY = []  # empty = fetch all missing books

ESV_API_BASE = 'https://api.esv.org/v3/passage/text/'

# API params: plain text, include verse numbers but nothing else
ESV_PARAMS = (
    'include-headings=false'
    '&include-footnotes=false'
    '&include-verse-numbers=true'
    '&include-short-copyright=false'
    '&include-passage-references=false'
    '&include-selahs=false'
    '&indent-poetry=false'
    '&indent-paragraphs=false'
    '&indent-psalm-doxology=false'
)

REPO_ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(REPO_ROOT, 'verses', 'esv')
DELAY_SEC  = 1.0   # delay between books (1 request per book now)


# ── HELPERS ───────────────────────────────────────────────────────────────────

def fetch_book(book, chapter_count, api_key):
    """Fetch an entire book from the ESV API in one request. Returns raw text string."""
    ref = urllib.parse.quote(f'{book} 1-{chapter_count}')
    url = f'{ESV_API_BASE}?q={ref}&{ESV_PARAMS}'
    req = urllib.request.Request(url, headers={'Authorization': f'Token {api_key}'})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
            passages = data.get('passages', [])
            return passages[0] if passages else ''
    except urllib.error.HTTPError as e:
        print(f'    HTTP {e.code} for {book}: {e.reason}')
        return None
    except Exception as e:
        print(f'    Error for {book}: {e}')
        return None


def parse_book(raw_text, book, testament, chapter_count):
    """
    Parse the ESV API plain-text response for an entire book into verse dicts.
    The API returns all chapters concatenated. We detect chapter boundaries by
    looking for the book name followed by a chapter number in the text, or by
    tracking verse numbers resetting back to 1.
    """
    if not raw_text:
        return []

    verses = []
    # Split on verse markers [N]
    parts = re.split(r'\[(\d+)\]', raw_text.strip())

    current_ch = 1
    last_v = 0
    book_short_map = {
        'Genesis':'Gen','Exodus':'Ex','Leviticus':'Lev','Numbers':'Num',
        'Deuteronomy':'Deut','Joshua':'Josh','Judges':'Judg','Ruth':'Ru',
        '1 Samuel':'1Sam','2 Samuel':'2Sam','1 Kings':'1Ki','2 Kings':'2Ki',
        '1 Chronicles':'1Ch','2 Chronicles':'2Ch','Ezra':'Ezr','Nehemiah':'Neh',
        'Esther':'Est','Job':'Job','Psalms':'Ps','Proverbs':'Prov',
        'Ecclesiastes':'Eccl','Song of Solomon':'Song','Isaiah':'Isa',
        'Jeremiah':'Jer','Lamentations':'Lam','Ezekiel':'Ezek','Daniel':'Dan',
        'Hosea':'Hos','Joel':'Joel','Amos':'Amos','Obadiah':'Ob','Jonah':'Jon',
        'Micah':'Mic','Nahum':'Nah','Habakkuk':'Hab','Zephaniah':'Zeph',
        'Haggai':'Hag','Zechariah':'Zech','Malachi':'Mal',
        'Matthew':'Mt','Mark':'Mk','Luke':'Lk','John':'Jn','Acts':'Ac',
        'Romans':'Rom','1 Corinthians':'1Cor','2 Corinthians':'2Cor',
        'Galatians':'Gal','Ephesians':'Eph','Philippians':'Phil',
        'Colossians':'Col','1 Thessalonians':'1Th','2 Thessalonians':'2Th',
        '1 Timothy':'1Ti','2 Timothy':'2Ti','Titus':'Tit','Philemon':'Phm',
        'Hebrews':'Heb','James':'Jas','1 Peter':'1Pe','2 Peter':'2Pe',
        '1 John':'1Jn','2 John':'2Jn','3 John':'3Jn','Jude':'Jude',
        'Revelation':'Rev',
    }
    book_short = book_short_map.get(book, book[:3])
    book_dir = book.lower().replace(' ', '_')

    i = 1
    while i < len(parts) - 1:
        v_num = int(parts[i])
        v_text = parts[i + 1] if i + 1 < len(parts) else ''
        v_text = re.sub(r'\s+', ' ', v_text).strip()
        v_text = re.sub(r'\s*\(ESV\)\s*$', '', v_text).strip()

        # Detect chapter boundary: verse number reset to 1 (or lower than last)
        if v_num == 1 and last_v > 1:
            current_ch += 1

        last_v = v_num

        if v_text and current_ch <= chapter_count:
            verses.append({
                'ref':   f'{book} {current_ch}:{v_num}',
                'short': f'{book_short} {current_ch}:{v_num}',
                'text':  v_text,
                'url':   f'{testament}/{book_dir}/{book.replace(" ", "_")}_{current_ch}.html',
                'book':  book,
                'ch':    current_ch,
                'v':     v_num,
            })
        i += 2

    return verses


def write_book_file(book, testament, verses):
    """Write verses/esv/{testament}/{book_lower}.js"""
    book_lower = book.lower()
    testament_dir = os.path.join(OUTPUT_DIR, testament)
    os.makedirs(testament_dir, exist_ok=True)

    out_path = os.path.join(testament_dir, f'{book_lower}.js')
    payload  = json.dumps(verses, separators=(',', ':'), ensure_ascii=False)
    var_name = f'VERSES_{book.upper()}'

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(f'var {var_name}={payload};\n')
        f.write(f'if(!window.VERSES_ALL)window.VERSES_ALL=[];\n')
        f.write(f'window.VERSES_ALL=window.VERSES_ALL.concat({var_name});\n')

    # Auto-register in translation.js BOOK_VARS
    try:
        import sys as _sys
        _sys.path.insert(0, os.path.dirname(__file__))
        from shared import ensure_tx_book_var
        ensure_tx_book_var(book)
    except Exception as _e:
        print(f'  [translation.js] Could not auto-update: {_e}')

    return out_path


def write_combined_index(all_verses):
    """Write verses/esv/verses.js — full canon search index."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, 'verses.js')
    payload  = json.dumps(all_verses, separators=(',', ':'), ensure_ascii=False)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('// ESV full canon verse index\n')
        f.write(f'var VERSES_ALL={payload};\n')

    return out_path


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Build ESV verse files from the Crossway API.')
    parser.add_argument('--key', help='ESV API key (or set ESV_API_KEY env var)')
    parser.add_argument('--resume', help='Resume from this book (e.g. "Luke") if a previous run was interrupted')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be fetched without calling the API')
    args = parser.parse_args()

    api_key = args.key or os.environ.get('ESV_API_KEY', '')
    if not api_key and not args.dry_run:
        print('ERROR: ESV API key required.')
        print('  Set ESV_API_KEY environment variable or use --key YOUR_KEY')
        print('  Get a free key at https://api.esv.org/')
        sys.exit(1)

    print('Scripture Deep Dive — ESV verse file builder')
    print(f'Output: {OUTPUT_DIR}')
    print(f'Books:  {len(LIVE_BOOKS)} ({sum(c for _,_,c in LIVE_BOOKS)} chapters total)')
    print(f'Delay:  {DELAY_SEC}s between requests')
    print()

    if args.dry_run:
        print('DRY RUN — no API calls will be made.')
        total_requests = sum(ch for _, _, ch in LIVE_BOOKS)
        print(f'Would make {total_requests} API requests (~{total_requests * DELAY_SEC:.0f}s)')
        for book, testament, chapters in LIVE_BOOKS:
            print(f'  {book} ({testament.upper()}): {chapters} chapters')
        return

    resuming = False
    if args.resume:
        resuming = True
        print(f'Resuming from: {args.resume}')

    all_verses = []
    total_verses = 0

    for book, testament, chapter_count in LIVE_BOOKS:
        # Handle resume
        if resuming:
            if book != args.resume:
                # Check if file already exists from previous run
                existing = os.path.join(OUTPUT_DIR, testament, f'{book.lower()}.js')
                if os.path.exists(existing):
                    print(f'  {book}: skipping (already exists)')
                    with open(existing, encoding='utf-8') as f: raw = f.read()
                    start = raw.find('[')
                    if start != -1:
                        depth = 0
                        end = start
                        for i in range(start, len(raw)):
                            if raw[i] == '[': depth += 1
                            elif raw[i] == ']':
                                depth -= 1
                                if depth == 0: end = i + 1; break
                        try:
                            book_verses = json.loads(raw[start:end])
                            all_verses.extend(book_verses)
                        except Exception:
                            pass
                    continue
                # File doesn't exist, stop skipping
                resuming = False

        print(f'{book} ({testament.upper()}, {chapter_count} chapters):', end=' ', flush=True)
        book_verses = []

        raw = fetch_book(book, chapter_count, api_key)
        if raw is None:
            print(f'FAILED — waiting 20s then retrying...')
            time.sleep(20)
            raw = fetch_book(book, chapter_count, api_key)
            if raw is None:
                print(f'FAILED twice — skipping {book}.')
                continue

        book_verses = parse_book(raw, book, testament, chapter_count)
        print(f'{len(book_verses)} verses fetched.')

        time.sleep(DELAY_SEC)

        # Write the book file
        out_path = write_book_file(book, testament, book_verses)
        all_verses.extend(book_verses)
        total_verses += len(book_verses)
        print(f'  -> Wrote {out_path} ({len(book_verses)} verses)\n')

    # Write combined index
    idx_path = write_combined_index(all_verses)
    print(f'Wrote {idx_path} ({total_verses} total verses)')
    print()
    print('Done. Next steps:')
    print('  1. Review a few verse files in verses/esv/')
    print('  2. In translation.js: set  esv: { available: true }')
    print('  3. Test a chapter page — ESV toggle should appear')
    print('  4. git add verses/esv/ && git commit -m "Add ESV translation files"')
    print('  5. Deploy')


if __name__ == '__main__':
    main()
