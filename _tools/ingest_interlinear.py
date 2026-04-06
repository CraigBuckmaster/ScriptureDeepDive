"""
ingest_interlinear.py — Download and normalize Hebrew + Greek interlinear data.

Sources:
  - Hebrew OT: openscriptures/morphhb (CC-BY 4.0) — OSIS XML
  - Greek NT:  morphgnt/tischendorf-data v2.7 (CC-BY-SA) — word-per-line
  - Hebrew glosses: openscriptures/HebrewLexicon — Strong's XML
  - Greek glosses:  morphgnt/strongs-dictionary-xml — Strong's XML

Output: content/interlinear/{book_id}.json (66 files)

Usage:
    PYTHONUTF8=1 python _tools/ingest_interlinear.py
"""

import json, re, sys, time, unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
import sys as _sys
if _sys.stdout.encoding and _sys.stdout.encoding.lower() != 'utf-8':
    _sys.stdout.reconfigure(encoding='utf-8')
del _sys


ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'content' / 'interlinear'

# ── URLs ────────────────────────────────────────────────────────────

MORPHHB_BASE = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc'
TISCH_BASE = 'https://raw.githubusercontent.com/morphgnt/tischendorf-data/master/word-per-line/2.7/Unicode'
STRONGS_HEB_URL = 'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/HebrewStrong.xml'
STRONGS_GRK_URL = 'https://raw.githubusercontent.com/morphgnt/strongs-dictionary-xml/master/strongsgreek.xml'

# ── Book mappings ───────────────────────────────────────────────────

# morphhb OSIS code → CS book_id
HEBREW_BOOKS = [
    ('Gen', 'genesis'), ('Exod', 'exodus'), ('Lev', 'leviticus'),
    ('Num', 'numbers'), ('Deut', 'deuteronomy'), ('Josh', 'joshua'),
    ('Judg', 'judges'), ('Ruth', 'ruth'), ('1Sam', '1_samuel'),
    ('2Sam', '2_samuel'), ('1Kgs', '1_kings'), ('2Kgs', '2_kings'),
    ('1Chr', '1_chronicles'), ('2Chr', '2_chronicles'), ('Ezra', 'ezra'),
    ('Neh', 'nehemiah'), ('Esth', 'esther'), ('Job', 'job'),
    ('Ps', 'psalms'), ('Prov', 'proverbs'), ('Eccl', 'ecclesiastes'),
    ('Song', 'song_of_solomon'), ('Isa', 'isaiah'), ('Jer', 'jeremiah'),
    ('Lam', 'lamentations'), ('Ezek', 'ezekiel'), ('Dan', 'daniel'),
    ('Hos', 'hosea'), ('Joel', 'joel'), ('Amos', 'amos'),
    ('Obad', 'obadiah'), ('Jonah', 'jonah'), ('Mic', 'micah'),
    ('Nah', 'nahum'), ('Hab', 'habakkuk'), ('Zeph', 'zephaniah'),
    ('Hag', 'haggai'), ('Zech', 'zechariah'), ('Mal', 'malachi'),
]

# tischendorf code → CS book_id
GREEK_BOOKS = [
    ('MT', 'matthew'), ('MR', 'mark'), ('LU', 'luke'), ('JOH', 'john'),
    ('AC', 'acts'), ('RO', 'romans'), ('1CO', '1_corinthians'),
    ('2CO', '2_corinthians'), ('GA', 'galatians'), ('EPH', 'ephesians'),
    ('PHP', 'philippians'), ('COL', 'colossians'), ('1TH', '1_thessalonians'),
    ('2TH', '2_thessalonians'), ('1TI', '1_timothy'), ('2TI', '2_timothy'),
    ('TIT', 'titus'), ('PHM', 'philemon'), ('HEB', 'hebrews'),
    ('JAS', 'james'), ('1PE', '1_peter'), ('2PE', '2_peter'),
    ('1JO', '1_john'), ('2JO', '2_john'), ('3JO', '3_john'),
    ('JUDE', 'jude'), ('RE', 'revelation'),
]

# ── Transliteration ────────────────────────────────────────────────

HEBREW_CONSONANTS = {
    '\u05D0': "'", '\u05D1': 'v', '\u05D2': 'g', '\u05D3': 'd',
    '\u05D4': 'h', '\u05D5': 'v', '\u05D6': 'z', '\u05D7': 'ch',
    '\u05D8': 't', '\u05D9': 'y', '\u05DA': 'kh', '\u05DB': 'kh',
    '\u05DC': 'l', '\u05DD': 'm', '\u05DE': 'm', '\u05DF': 'n',
    '\u05E0': 'n', '\u05E1': 's', '\u05E2': "'", '\u05E3': 'f',
    '\u05E4': 'f', '\u05E5': 'ts', '\u05E6': 'ts', '\u05E7': 'q',
    '\u05E8': 'r', '\u05E9': 'sh', '\u05EA': 't',
}

HEBREW_VOWELS = {
    '\u05B0': 'e', '\u05B1': 'e', '\u05B2': 'a', '\u05B3': 'o',
    '\u05B4': 'i', '\u05B5': 'e', '\u05B6': 'e', '\u05B7': 'a',
    '\u05B8': 'a', '\u05B9': 'o', '\u05BA': 'o', '\u05BB': 'u',
    '\u05BC': '', '\u05BD': '',  # dagesh/meteg — skip
}

GREEK_MAP = {
    '\u03B1': 'a', '\u0391': 'A', '\u03B2': 'b', '\u0392': 'B',
    '\u03B3': 'g', '\u0393': 'G', '\u03B4': 'd', '\u0394': 'D',
    '\u03B5': 'e', '\u0395': 'E', '\u03B6': 'z', '\u0396': 'Z',
    '\u03B7': 'e', '\u0397': 'E', '\u03B8': 'th', '\u0398': 'Th',
    '\u03B9': 'i', '\u0399': 'I', '\u03BA': 'k', '\u039A': 'K',
    '\u03BB': 'l', '\u039B': 'L', '\u03BC': 'm', '\u039C': 'M',
    '\u03BD': 'n', '\u039D': 'N', '\u03BE': 'x', '\u039E': 'X',
    '\u03BF': 'o', '\u039F': 'O', '\u03C0': 'p', '\u03A0': 'P',
    '\u03C1': 'r', '\u03A1': 'R', '\u03C3': 's', '\u03A3': 'S',
    '\u03C2': 's',  # final sigma
    '\u03C4': 't', '\u03A4': 'T', '\u03C5': 'u', '\u03A5': 'U',
    '\u03C6': 'ph', '\u03A6': 'Ph', '\u03C7': 'ch', '\u03A7': 'Ch',
    '\u03C8': 'ps', '\u03A8': 'Ps', '\u03C9': 'o', '\u03A9': 'O',
}


def transliterate_hebrew(text: str) -> str:
    """Basic Hebrew → Latin transliteration (consonants + major vowels)."""
    # Strip cantillation marks (U+0591–U+05AF) and other formatting
    cleaned = re.sub('[\u0591-\u05AF\u05BF\u05C1-\u05C7/]', '', text)
    result = []
    for ch in cleaned:
        if ch in HEBREW_CONSONANTS:
            result.append(HEBREW_CONSONANTS[ch])
        elif ch in HEBREW_VOWELS:
            v = HEBREW_VOWELS[ch]
            if v:
                result.append(v)
        # skip other marks
    return ''.join(result)


def transliterate_greek(text: str) -> str:
    """Basic Greek → Latin transliteration."""
    # Strip diacritics: decompose then remove combining marks
    nfkd = unicodedata.normalize('NFD', text)
    result = []
    for ch in nfkd:
        if unicodedata.category(ch).startswith('M'):
            continue  # skip combining marks
        if ch in GREEK_MAP:
            result.append(GREEK_MAP[ch])
        elif ch.isalpha():
            result.append(ch)  # keep unknown letters as-is
    return ''.join(result)


# ── URL fetch helper ────────────────────────────────────────────────

def fetch_url(url: str) -> bytes:
    """Fetch URL with retry."""
    for attempt in range(3):
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:
            if attempt == 2:
                raise
            time.sleep(1)
    return b''


# ── Strong's lexicon parsing ───────────────────────────────────────

def parse_strongs_hebrew() -> dict:
    """Parse Hebrew Strong's → {H1234: 'short gloss'}."""
    print('  Fetching Hebrew Strong\'s lexicon...')
    data = fetch_url(STRONGS_HEB_URL).decode('utf-8')
    glosses = {}

    # Parse XML with namespace
    ns = {'os': 'http://openscriptures.github.com/morphhb/namespace'}
    root = ET.fromstring(data)
    for entry in root.findall('.//os:entry', ns):
        sid = entry.get('id', '')
        if not sid.startswith('H'):
            continue
        # Get w element text as a fallback short gloss
        w_el = entry.find('os:w', ns)
        w_text = w_el.text if w_el is not None and w_el.text else ''
        # Look for meaning element
        meaning_el = entry.find('.//os:meaning', ns)
        meaning = ''
        if meaning_el is not None:
            meaning = ''.join(meaning_el.itertext()).strip()
        # Use meaning if available, otherwise w_text
        gloss = meaning[:60] if meaning else w_text[:60]
        if gloss:
            glosses[sid] = gloss

    print(f'    {len(glosses)} Hebrew entries parsed.')
    return glosses


def parse_strongs_greek() -> dict:
    """Parse Greek Strong's → {G1234: 'short gloss'}."""
    print('  Fetching Greek Strong\'s lexicon...')
    data = fetch_url(STRONGS_GRK_URL).decode('utf-8')
    glosses = {}

    root = ET.fromstring(data)
    for entry in root.findall('.//entry'):
        # Extract Strong's number
        strongs_el = entry.find('strongs')
        if strongs_el is None or not strongs_el.text:
            continue
        snum = strongs_el.text.strip()
        if not snum.startswith('G'):
            snum = f'G{snum}'

        # Extract definition
        def_el = entry.find('strongs_def')
        if def_el is not None:
            defn = ''.join(def_el.itertext()).strip()
            # Clean up HTML-like tags
            defn = re.sub(r'<[^>]+>', '', defn).strip()
            if defn:
                glosses[snum] = defn[:60]

    print(f'    {len(glosses)} Greek entries parsed.')
    return glosses


# ── Hebrew OT parsing ──────────────────────────────────────────────

OSIS_NS = '{http://www.bibletechnologies.net/2003/OSIS/namespace}'


def extract_strongs_from_lemma(lemma: str) -> str:
    """Extract H-number from morphhb lemma like 'b/7225' or '1254 a'."""
    # Strip prefix codes: b/, c/, d/, etc.
    parts = lemma.split('/')
    num_part = parts[-1].strip()
    # Strip trailing letter suffix
    num_part = re.sub(r'\s*[a-z]$', '', num_part)
    try:
        return f'H{int(num_part)}'
    except ValueError:
        return ''


def parse_hebrew_book(xml_data: str, book_id: str, glosses: dict) -> list:
    """Parse morphhb OSIS XML into word list."""
    root = ET.fromstring(xml_data)
    words = []

    for chapter_el in root.iter(f'{OSIS_NS}chapter'):
        osis_id = chapter_el.get('osisID', '')  # e.g., "Gen.1"
        ch_match = re.search(r'\.(\d+)$', osis_id)
        if not ch_match:
            continue
        ch = int(ch_match.group(1))

        for verse_el in chapter_el.iter(f'{OSIS_NS}verse'):
            verse_id = verse_el.get('osisID', '')  # e.g., "Gen.1.1"
            v_match = re.search(r'\.(\d+)$', verse_id)
            if not v_match:
                continue
            v = int(v_match.group(1))

            word_pos = 0
            for w_el in verse_el.iter(f'{OSIS_NS}w'):
                word_pos += 1
                lemma = w_el.get('lemma', '')
                morph = w_el.get('morph', '')
                original = w_el.text or ''
                # Clean: strip cantillation marks from original for display
                original_clean = re.sub('[\u0591-\u05AF]', '', original)
                # Remove the / separator but keep the text
                original_clean = original_clean.replace('/', '')

                strongs = extract_strongs_from_lemma(lemma)
                tlit = transliterate_hebrew(original)
                gloss = glosses.get(strongs, '')

                words.append({
                    'ch': ch, 'v': v, 'pos': word_pos,
                    'original': original_clean,
                    'transliteration': tlit,
                    'strongs': strongs,
                    'morphology': morph,
                    'gloss': gloss,
                })

    return words


# ── Greek NT parsing ───────────────────────────────────────────────

def parse_greek_book(text_data: str, book_id: str, glosses: dict) -> list:
    """Parse tischendorf word-per-line text into word list."""
    words = []
    verse_positions = defaultdict(int)  # (ch, v) → running position

    for line in text_data.strip().split('\n'):
        line = line.strip()
        if not line:
            continue

        # Format: "MT 1:1.1 C Βίβλος Βίβλος N-NSF 976 βίβλος ! βίβλος"
        parts = line.split()
        if len(parts) < 8:
            continue

        # Parse reference: "1:1.1" → ch=1, v=1, word_pos from .1
        ref = parts[1]  # "1:1.1"
        ref_match = re.match(r'(\d+):(\d+)\.(\d+)', ref)
        if not ref_match:
            continue
        ch = int(ref_match.group(1))
        v = int(ref_match.group(2))
        word_pos = int(ref_match.group(3))

        original = parts[3]  # text form with punctuation
        morph = parts[5]     # morphology code
        strongs_num = parts[6]  # raw number

        # Build Strong's ID
        try:
            strongs = f'G{int(strongs_num)}'
        except ValueError:
            strongs = ''

        # Clean original: strip trailing punctuation
        original_clean = re.sub(r'[.,;:!?·]$', '', original)

        tlit = transliterate_greek(original_clean)
        gloss = glosses.get(strongs, '')

        words.append({
            'ch': ch, 'v': v, 'pos': word_pos,
            'original': original_clean,
            'transliteration': tlit,
            'strongs': strongs,
            'morphology': morph,
            'gloss': gloss,
        })

    return words


# ── Main ───────────────────────────────────────────────────────────

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total_words = 0

    # 1. Fetch Strong's lexicons
    print('Phase 1: Fetching Strong\'s lexicons...')
    heb_glosses = parse_strongs_hebrew()
    grk_glosses = parse_strongs_greek()

    # 2. Fetch and parse Hebrew OT
    print(f'\nPhase 2: Fetching {len(HEBREW_BOOKS)} Hebrew OT books...')
    for osis_code, book_id in HEBREW_BOOKS:
        url = f'{MORPHHB_BASE}/{osis_code}.xml'
        try:
            xml_data = fetch_url(url).decode('utf-8')
            words = parse_hebrew_book(xml_data, book_id, heb_glosses)
            out_path = OUT_DIR / f'{book_id}.json'
            out_path.write_text(
                json.dumps(words, ensure_ascii=False, indent=None),
                encoding='utf-8'
            )
            total_words += len(words)
            print(f'  {book_id}: {len(words)} words')
        except Exception as e:
            print(f'  ERROR {book_id}: {e}', file=sys.stderr)

    # 3. Fetch and parse Greek NT
    print(f'\nPhase 3: Fetching {len(GREEK_BOOKS)} Greek NT books...')
    for tisch_code, book_id in GREEK_BOOKS:
        url = f'{TISCH_BASE}/{tisch_code}.txt'
        try:
            text_data = fetch_url(url).decode('utf-8', errors='replace')
            words = parse_greek_book(text_data, book_id, grk_glosses)
            out_path = OUT_DIR / f'{book_id}.json'
            out_path.write_text(
                json.dumps(words, ensure_ascii=False, indent=None),
                encoding='utf-8'
            )
            total_words += len(words)
            print(f'  {book_id}: {len(words)} words')
        except Exception as e:
            print(f'  ERROR {book_id}: {e}', file=sys.stderr)

    print(f'\nDone: {total_words} total words across 66 books → {OUT_DIR}')


if __name__ == '__main__':
    main()
