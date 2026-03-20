#!/usr/bin/env python3
"""
esv_fill_gaps.py — Fills in missing/empty ESV verse files.
Only fetches books that are missing or have 0 verses.
Uses whole-book requests (1 API call per book) with long delays.

Usage:
    python _tools/esv_fill_gaps.py --key YOUR_ESV_API_KEY

Takes ~5 minutes for 20 books at 10s delay. Safe for ESV API rate limits.
"""

import os, sys, re, json, time, urllib.request, urllib.error, urllib.parse, argparse

# Force UTF-8 on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ESV_API = 'https://api.esv.org/v3/passage/text/'
ESV_PARAMS = ('include-headings=false&include-footnotes=false'
              '&include-verse-numbers=true&include-short-copyright=false'
              '&include-passage-references=false&include-selahs=false'
              '&indent-poetry=false&indent-paragraphs=false'
              '&indent-psalm-doxology=false')

DELAY = 10  # seconds between books
CHUNK = 30  # chapters per request (large books get split)

BOOKS = [
    # (name, testament, chapters, short, filename)
    ('Genesis','ot',50,'Gen','genesis'),('Exodus','ot',40,'Ex','exodus'),
    ('Leviticus','ot',27,'Lev','leviticus'),('Numbers','ot',36,'Num','numbers'),
    ('Deuteronomy','ot',34,'Deut','deuteronomy'),('Joshua','ot',24,'Josh','joshua'),
    ('Judges','ot',21,'Judg','judges'),('Ruth','ot',4,'Ru','ruth'),
    ('1 Samuel','ot',31,'1Sam','1_samuel'),('2 Samuel','ot',24,'2Sam','2_samuel'),
    ('1 Kings','ot',22,'1Ki','1_kings'),('2 Kings','ot',25,'2Ki','2_kings'),
    ('1 Chronicles','ot',29,'1Ch','1_chronicles'),('2 Chronicles','ot',36,'2Ch','2_chronicles'),
    ('Ezra','ot',10,'Ezr','ezra'),('Nehemiah','ot',13,'Neh','nehemiah'),
    ('Esther','ot',10,'Est','esther'),('Job','ot',42,'Job','job'),
    ('Psalms','ot',150,'Ps','psalms'),('Proverbs','ot',31,'Prov','proverbs'),
    ('Ecclesiastes','ot',12,'Eccl','ecclesiastes'),('Song of Solomon','ot',8,'Song','song_of_solomon'),
    ('Isaiah','ot',66,'Isa','isaiah'),('Jeremiah','ot',52,'Jer','jeremiah'),
    ('Lamentations','ot',5,'Lam','lamentations'),('Ezekiel','ot',48,'Ezek','ezekiel'),
    ('Daniel','ot',12,'Dan','daniel'),('Hosea','ot',14,'Hos','hosea'),
    ('Joel','ot',3,'Joel','joel'),('Amos','ot',9,'Amos','amos'),
    ('Obadiah','ot',1,'Ob','obadiah'),('Jonah','ot',4,'Jon','jonah'),
    ('Micah','ot',7,'Mic','micah'),('Nahum','ot',3,'Nah','nahum'),
    ('Habakkuk','ot',3,'Hab','habakkuk'),('Zephaniah','ot',3,'Zeph','zephaniah'),
    ('Haggai','ot',2,'Hag','haggai'),('Zechariah','ot',14,'Zech','zechariah'),
    ('Malachi','ot',4,'Mal','malachi'),
    ('Matthew','nt',28,'Mt','matthew'),('Mark','nt',16,'Mk','mark'),
    ('Luke','nt',24,'Lk','luke'),('John','nt',21,'Jn','john'),
    ('Acts','nt',28,'Ac','acts'),('Romans','nt',16,'Rom','romans'),
    ('1 Corinthians','nt',16,'1Cor','1_corinthians'),('2 Corinthians','nt',13,'2Cor','2_corinthians'),
    ('Galatians','nt',6,'Gal','galatians'),('Ephesians','nt',6,'Eph','ephesians'),
    ('Philippians','nt',4,'Phil','philippians'),('Colossians','nt',4,'Col','colossians'),
    ('1 Thessalonians','nt',5,'1Th','1_thessalonians'),('2 Thessalonians','nt',3,'2Th','2_thessalonians'),
    ('1 Timothy','nt',6,'1Ti','1_timothy'),('2 Timothy','nt',4,'2Ti','2_timothy'),
    ('Titus','nt',3,'Tit','titus'),('Philemon','nt',1,'Phm','philemon'),
    ('Hebrews','nt',13,'Heb','hebrews'),('James','nt',5,'Jas','james'),
    ('1 Peter','nt',5,'1Pe','1_peter'),('2 Peter','nt',3,'2Pe','2_peter'),
    ('1 John','nt',5,'1Jn','1_john'),('2 John','nt',1,'2Jn','2_john'),
    ('3 John','nt',1,'3Jn','3_john'),('Jude','nt',1,'Jude','jude'),
    ('Revelation','nt',22,'Rev','revelation'),
]


def fetch_text(book_name, ch_start, ch_end, total_chapters, api_key):
    """Fetch a range of chapters. Returns raw text or None."""
    # Single-chapter books: just use the book name — "Obadiah 1" means verse 1!
    if total_chapters == 1:
        ref = urllib.parse.quote(book_name)
    else:
        # Use explicit chapter:verse format to avoid ambiguity
        # "Ezra 1-10" could be misread as "Ezra ch1 v1-10"
        # "Ezra 1:1-10:99" is unambiguous: chapter 1 verse 1 through chapter 10 verse 99
        ref = urllib.parse.quote(f'{book_name} {ch_start}:1-{ch_end}:999')
    url = f'{ESV_API}?q={ref}&{ESV_PARAMS}'
    req = urllib.request.Request(url, headers={'Authorization': f'Token {api_key}'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data.get('passages', [''])[0]
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return '429'
        print(f'    HTTP {e.code}: {e.reason}')
        return None
    except Exception as e:
        print(f'    Error: {e}')
        return None


def fetch_book(name, chapters, api_key):
    """Fetch entire book, chunking if needed. Returns full text."""
    all_text = ''
    for start in range(1, chapters + 1, CHUNK):
        end = min(start + CHUNK - 1, chapters)
        for attempt in range(1, 4):
            result = fetch_text(name, start, end, chapters, api_key)
            if result == '429':
                wait = 60 * attempt
                print(f'    Rate limited — waiting {wait}s (attempt {attempt}/3)...')
                time.sleep(wait)
                continue
            elif result is None:
                print(f'    Failed chunk {start}-{end}')
                return None
            else:
                all_text += result
                break
        else:
            print(f'    Gave up on {name} {start}-{end} after 3 attempts')
            return None
        if end < chapters:
            time.sleep(DELAY)
    return all_text


def parse_verses(raw, name, testament, chapters, short, filename):
    """Parse raw ESV text into verse dicts matching repo format."""
    if not raw:
        return []
    verses = []
    parts = re.split(r'\[(\d+)\]', raw.strip())
    ch = 1
    last_v = 0
    for i in range(1, len(parts) - 1, 2):
        v = int(parts[i])
        text = re.sub(r'\s+', ' ', parts[i + 1]).strip()
        if v == 1 and last_v > 0:
            ch += 1
        last_v = v
        if not text:
            continue
        verses.append({
            'ref': f'{name} {ch}:{v}',
            'short': f'{short} {ch}:{v}',
            'text': text,
            'url': f'{testament}/{filename}/{name.replace(" ", "_")}_{ch}.html',
            'book': name,
            'ch': ch,
            'v': v,
        })
    return verses


def write_file(name, testament, filename, verses):
    """Write verse JS file matching repo format."""
    var = 'VERSES_' + re.sub(r'\W', '_', name.upper())
    out_dir = os.path.join(REPO, 'verses', 'esv', testament)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f'{filename}.js')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'var {var}={json.dumps(verses, separators=(",",":"), ensure_ascii=False)};\n')
        f.write(f'if(!window.VERSES_ALL)window.VERSES_ALL=[];\n')
        f.write(f'window.VERSES_ALL=window.VERSES_ALL.concat({var});\n')
    return path


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--key', required=True, help='ESV API key')
    p.add_argument('--force', action='store_true', help='Re-fetch ALL books, not just gaps')
    args = p.parse_args()

    # Find gaps: missing files or 0-verse files
    gaps = []
    for name, testament, chapters, short, filename in BOOKS:
        path = os.path.join(REPO, 'verses', 'esv', testament, f'{filename}.js')
        if not os.path.exists(path):
            gaps.append((name, testament, chapters, short, filename, 'MISSING'))
        else:
            with open(path, encoding='utf-8') as f:
                content = f.read()
            if content.count('"ref":') == 0:
                gaps.append((name, testament, chapters, short, filename, 'EMPTY'))
            elif content.count('"ref":') < chapters:  # suspiciously few verses
                gaps.append((name, testament, chapters, short, filename, f'PARTIAL ({content.count(chr(34) + "ref" + chr(34))}v)'))

    if args.force:
        gaps = [(n, t, c, s, f, 'FORCE') for n, t, c, s, f in BOOKS]

    if not gaps:
        print('All 66 ESV files look complete. Use --force to re-fetch everything.')
        return

    print(f'ESV Gap Filler — {len(gaps)} books to fetch ({DELAY}s delay)\n')
    for name, testament, chapters, short, filename, reason in gaps:
        print(f'  {reason:12} {name} ({chapters} ch)')

    print()
    fetched = 0
    for i, (name, testament, chapters, short, filename, reason) in enumerate(gaps):
        print(f'[{i+1}/{len(gaps)}] {name} ({chapters} chapters)...')
        raw = fetch_book(name, chapters, args.key)
        if raw is None:
            print(f'  SKIPPED — fetch failed\n')
            continue

        verses = parse_verses(raw, name, testament, chapters, short, filename)
        if len(verses) == 0:
            print(f'  SKIPPED — 0 verses parsed (not overwriting)\n')
            continue

        path = write_file(name, testament, filename, verses)
        print(f'  -> {len(verses)} verses -> {path}\n')
        fetched += 1

        if i < len(gaps) - 1:
            time.sleep(DELAY)

    print(f'\nDone: {fetched}/{len(gaps)} books fetched.')
    print('Next: git add verses/esv/ && git commit -m "Fill ESV gaps" && git push')


if __name__ == '__main__':
    main()
