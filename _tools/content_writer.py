"""
Companion Study — Content Build System
============================================

Core pipeline module for the Companion Study Bible app.
All 66 books are live — this is now used for content enrichment and accuracy fixes only.

Architecture:
    REGISTRY (book list) + config.py (scholar/book config)
        → enrichment scripts read existing JSON, modify target panels
            → save_chapter(book_dir, ch, data) writes content/{book_dir}/{ch}.json
            → build_sqlite.py compiles all JSON into scripture.db

Key Exports:
    REGISTRY        — Ordered list of all 66 books (dir, name, total, live, testament, testament_dir)
    BOOK_PREFIX     — Short abbreviations for each book (e.g. 'genesis' → 'gen')
    save_chapter()  — Write/update a chapter JSON file from a data dict
    verse_range()   — Generate verse number tuples for section definitions
    auto_scholarly_json() — Auto-generate missing chapter-level panels (lit, themes, ppl, etc.)

Pipeline (run after any content change):
    1. python3 _tools/validate.py
    2. python3 _tools/build_sqlite.py
    3. python3 _tools/validate_sqlite.py
    4. git add -A && commit && push
    5. cd app && eas update --branch production
"""
import glob
import re, json, math, os, sys
from pathlib import Path

# Dynamically resolve the repo root from this file's location (_tools/content_writer.py → repo root).
# This allows the script to work in any directory, not just a specific container path.
_REPO = str(Path(__file__).resolve().parent.parent)

# ══════════════════════════════════════════════════════════════════════
#  REGISTRY — canonical ordered list of all Bible books
#  Tuple: (book_dir, display_name, total_chapters, live_chapters, testament, testament_dir)
#    book_dir       — filesystem directory name (underscores for spaces)
#    display_name   — human-readable book name (spaces allowed)
#    total_chapters — total chapters in the book
#    live_chapters  — how many chapters are built and deployed (0 = not yet live)
#    testament      — 'OT' or 'NT'
#    testament_dir  — filesystem path segment: 'ot' or 'nt'
# ══════════════════════════════════════════════════════════════════════

REGISTRY = [
    ('genesis',  'Genesis',   50, 50, 'OT', 'ot'),
    ('exodus',   'Exodus',    40, 40, 'OT', 'ot'),
    ('leviticus','Leviticus',  27, 27, 'OT', 'ot'),
    ('numbers',      'Numbers',      36, 36, 'OT', 'ot'),
    ('deuteronomy', 'Deuteronomy',  34, 34, 'OT', 'ot'),
    ('joshua',      'Joshua',       24, 24, 'OT', 'ot'),
    ('judges',      'Judges',       21, 21, 'OT', 'ot'),
    ('ruth',        'Ruth',          4,  4, 'OT', 'ot'),
    ('1_samuel',    '1 Samuel',     31, 31, 'OT', 'ot'),
    ('2_samuel',    '2 Samuel',     24, 24, 'OT', 'ot'),
    ('1_kings',     '1 Kings',      22, 22, 'OT', 'ot'),
    ('2_kings',     '2 Kings',      25, 25, 'OT', 'ot'),
    ('1_chronicles','1 Chronicles', 29, 29, 'OT', 'ot'),
    ('2_chronicles','2 Chronicles', 36, 36, 'OT', 'ot'),
    ('ezra',        'Ezra',         10, 10, 'OT', 'ot'),
    ('nehemiah',    'Nehemiah',     13, 13, 'OT', 'ot'),
    ('esther',      'Esther',       10, 10, 'OT', 'ot'),
    ('job',          'Job',          42, 42, 'OT', 'ot'),
    ('ecclesiastes', 'Ecclesiastes', 12, 12, 'OT', 'ot'),
    ('song_of_solomon','Song of Solomon',8, 8, 'OT', 'ot'),
    ('psalms',       'Psalms',       150,150, 'OT', 'ot'),
    ('daniel',       'Daniel',        12, 12, 'OT', 'ot'),
    ('lamentations', 'Lamentations',    5,  5, 'OT', 'ot'),
    ('isaiah',       'Isaiah',         66, 66, 'OT', 'ot'),
    ('jeremiah',     'Jeremiah',       52, 52, 'OT', 'ot'),
    ('ezekiel',      'Ezekiel',        48, 48, 'OT', 'ot'),
    ('jonah',        'Jonah',           4,  4, 'OT', 'ot'),
    ('amos',         'Amos',            9,  9, 'OT', 'ot'),
    ('obadiah',      'Obadiah',         1,  1, 'OT', 'ot'),
    ('joel',         'Joel',            3,  3, 'OT', 'ot'),
    ('hosea',        'Hosea',          14, 14, 'OT', 'ot'),
    ('micah',        'Micah',           7,  7, 'OT', 'ot'),
    ('habakkuk',     'Habakkuk',        3,  3, 'OT', 'ot'),
    ('nahum',        'Nahum',           3,  3, 'OT', 'ot'),
    ('zephaniah',    'Zephaniah',       3,  3, 'OT', 'ot'),
    ('haggai',       'Haggai',          2,  2, 'OT', 'ot'),
    ('zechariah',    'Zechariah',      14, 14, 'OT', 'ot'),
    ('malachi',      'Malachi',         4,  4, 'OT', 'ot'),
    ('proverbs', 'Proverbs',  31, 31, 'OT', 'ot'),
    ('matthew',  'Matthew',   28, 28, 'NT', 'nt'),
    ('mark',     'Mark',      16, 16, 'NT', 'nt'),
    ('luke',     'Luke',      24, 24, 'NT', 'nt'),
    ('john',     'John',      21, 21, 'NT', 'nt'),
    ('acts',     'Acts',      28, 28, 'NT', 'nt'),
    ('romans',   'Romans',    16, 16, 'NT', 'nt'),
    ('1_corinthians', '1 Corinthians', 16, 16, 'NT', 'nt'),
    ('2_corinthians', '2 Corinthians', 13, 13, 'NT', 'nt'),
    ('galatians',     'Galatians',      6,  6, 'NT', 'nt'),
    ('ephesians',     'Ephesians',      6,  6, 'NT', 'nt'),
    ('philippians',   'Philippians',    4,  4, 'NT', 'nt'),
    ('colossians',       'Colossians',      4,  4, 'NT', 'nt'),
    ('1_thessalonians',  '1 Thessalonians', 5,  5, 'NT', 'nt'),
    ('2_thessalonians',  '2 Thessalonians', 3,  3, 'NT', 'nt'),
    ('philemon',         'Philemon',        1,  1, 'NT', 'nt'),
    ('1_timothy',        '1 Timothy',       6,  6, 'NT', 'nt'),
    ('2_timothy',        '2 Timothy',       4,  4, 'NT', 'nt'),
    ('titus',            'Titus',           3,  3, 'NT', 'nt'),
    ('hebrews',          'Hebrews',        13, 13, 'NT', 'nt'),
    ('james',            'James',           5,  5, 'NT', 'nt'),
    ('1_peter',          '1 Peter',         5,  5, 'NT', 'nt'),
    ('2_peter',          '2 Peter',         3,  3, 'NT', 'nt'),
    ('1_john',           '1 John',          5,  5, 'NT', 'nt'),
    ('2_john',           '2 John',          1,  1, 'NT', 'nt'),
    ('3_john',           '3 John',          1,  1, 'NT', 'nt'),
    ('jude',             'Jude',            1,  1, 'NT', 'nt'),
    ('revelation',       'Revelation',     22, 22, 'NT', 'nt'),
]

# Short prefix used for auto-generated panel IDs (e.g. gen46-s1-grk)
BOOK_PREFIX = {
    'genesis':  'gen',
    'exodus':   'ex',
    'deuteronomy': 'deu',
    'joshua':   'josh',
    'judges':   'judg',
    '1_samuel': '1sa',
    '2_samuel': '2sa',
    '1_kings':  '1ki',
    '2_kings':  '2ki',
    '1_chronicles':'1ch',
    '2_chronicles':'2ch',
    'ezra':     'ezr',
    'nehemiah': 'neh',
    'esther': 'est',
    'job': 'job',
    'ecclesiastes': 'eccl',
    'song_of_solomon': 'sng',
    'psalms': 'psa',
    'daniel': 'dan',
    'lamentations': 'lam',
    'isaiah':       'isa',
    'jeremiah':     'jer',
    'ezekiel':      'ezk',
    'jonah':        'jon',
    'amos':         'amo',
    'obadiah':      'oba',
    'joel':         'jol',
    'hosea':        'hos',
    'micah':        'mic',
    'habakkuk':     'hab',
    'nahum':        'nah',
    'zephaniah':    'zep',
    'haggai':       'hag',
    'zechariah':    'zec',
    'malachi':      'mal',
    'ruth':     'ru',
    'proverbs': 'pr',
    'leviticus':'lev',
    'numbers':  'num',
    'matthew':  'mt',
    'mark':     'mk',
    'luke':     'lk',
    'john':     'jn',
    'acts':     'ac',
    'romans':   'ro',
    '1_corinthians': '1co',
    '2_corinthians': '2co',
    'galatians':     'gal',
    'ephesians':     'eph',
    'philippians':   'php',
    'colossians':        'col',
    '1_thessalonians':   '1th',
    '2_thessalonians':   '2th',
    'philemon':          'phm',
    '1_timothy':         '1ti',
    '2_timothy':         '2ti',
    'titus':             'tit',
    'hebrews':           'heb',
    'james':             'jas',
    '1_peter':           '1pe',
    '2_peter':           '2pe',
    '1_john':            '1jn',
    '2_john':            '2jn',
    '3_john':            '3jn',
    'jude':              'jud',
    'revelation':        'rev',
}

# COMMENTATOR_SCOPE — moved to config.py (Batch 5)
# See config.py for the full scholar roster documentation.
from config import COMMENTATOR_SCOPE, SCHOLAR_REGISTRY  # noqa: E402

# Book-level constants — AUTH text, IS_NT flag, VHL word lists
# BOOK_META — moved to config.py (Batch 5)
from config import BOOK_META  # noqa: E402

# ══════════════════════════════════════════════════════════════════════
#  JSON PIPELINE — save_chapter() writes JSON for the React Native app
# ══════════════════════════════════════════════════════════════════════

ROOT = _REPO
CONTENT_DIR = os.path.join(ROOT, 'content')


def save_chapter(book_dir, ch, data):
    """Save chapter content as structured JSON for the React Native pipeline.

    Generator scripts call this with tuples/lists. Extracted content passes
    dicts. This function normalises both into the canonical JSON format.

    Args:
        book_dir: Book directory name (e.g., 'genesis', 'isaiah')
        ch: Chapter number (int)
        data: Dict with keys:
            Required:
                title (str): Chapter title
                sections (list[dict]): 1+ sections, each with:
                    header (str): Section header
                    verses: verse_range() output [(n,''),...] or 'start-end' string
                    heb (list): 4-tuples (word,tlit,gloss,text) or dicts
                    + any panel keys: ctx, hist, cross, mac, calvin, poi, tl, etc.
            Optional chapter-level panels (auto-generated in Phase 1B if missing):
                lit: (rows_list, note) or {"rows":[...], "note":"..."}
                themes: (scores_list, note) or {"scores":[...], "note":"..."}
                ppl, trans, src, rec, hebtext, thread, tx, debate

    Output: content/{book_dir}/{ch}.json
    """
    # ── Validate required structure ──
    assert 'title' in data and data['title'], f"Missing or empty 'title'"
    assert 'sections' in data, f"Missing 'sections'"
    assert len(data['sections']) >= 1, f"Need at least 1 section, got {len(data['sections'])}"
    for i, sec in enumerate(data['sections']):
        assert 'header' in sec, f"Section {i+1} missing 'header'"

    # ── Build chapter envelope ──
    chapter = {
        'chapter_id': None,
        'testament': None,
        'book_dir': book_dir,
        'chapter_num': ch,
        'title': data['title'],
        'subtitle': data.get('subtitle', ''),
        'timeline_link': data.get('timeline_link'),
        'map_story_link': data.get('map_story_link'),
        'sections': [],
        'chapter_panels': {},
        'vhl_groups': data.get('vhl_groups', []),
    }

    # ── Process sections ──
    skip_keys = {'header', 'verses', 'verse_start', 'verse_end'}

    for i, sec in enumerate(data['sections'], start=1):
        verse_start, verse_end = _parse_verses_field(sec)

        section_out = {
            'section_num': i,
            'header': sec['header'],
            'verse_start': verse_start,
            'verse_end': verse_end,
            'panels': {},
        }

        for key, value in sec.items():
            if key in skip_keys or value is None:
                continue
            section_out['panels'][key] = _normalise_section_panel(key, value)

        chapter['sections'].append(section_out)

    # ── Chapter-level panels (explicit from data) ──
    ch_panel_keys = {'lit', 'themes', 'ppl', 'trans', 'src', 'rec',
                     'hebtext', 'thread', 'tx', 'debate'}
    for key in ch_panel_keys:
        if key in data and data[key] is not None:
            chapter['chapter_panels'][key] = _normalise_chapter_panel(key, data[key])

    # ── Auto-generate missing chapter panels ──
    try:
        auto_panels = auto_scholarly_json(data, book_dir, ch)
        for key, value in auto_panels.items():
            if key not in chapter['chapter_panels']:
                chapter['chapter_panels'][key] = value
    except Exception as e:
        print(f'  [WARN] auto_scholarly_json failed (non-fatal): {e}')

    # ── Write JSON ──
    out_dir = os.path.join(CONTENT_DIR, book_dir)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f'{ch}.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(chapter, f, ensure_ascii=False, indent=2)

    sec_panel_count = sum(len(s['panels']) for s in chapter['sections'])
    ch_panel_count = len(chapter['chapter_panels'])
    print(f'  [OK] Saved {book_dir} {ch} → {out_path}  '
          f'({len(chapter["sections"])} sections, {sec_panel_count} sec panels, '
          f'{ch_panel_count} ch panels)')
    return out_path


# ── Section panel normalisation ──────────────────────────────────────
# Generator scripts pass data as Python tuples/lists for ease of authoring.
# Extracted/enriched content may already be dicts from existing JSON.
# These functions convert both formats into the canonical JSON shape that
# the React Native app expects. Each panel type has its own target schema:
#   heb   → [{"word", "transliteration", "gloss", "paragraph"}]
#   ctx   → plain string
#   cross → [{"ref", "note"}]
#   mac/calvin/net/scholars → {"source", "notes": [{"ref", "note"}]}
# ─────────────────────────────────────────────────────────────────────

def _parse_verses_field(sec):
    """Extract verse_start/verse_end from section dict."""
    vs = sec.get('verse_start')
    ve = sec.get('verse_end')
    if vs is not None:
        return vs, ve

    vr = sec.get('verses')
    if vr is None:
        return None, None
    # verse_range() returns [(1,''), (2,''), ...] — take min/max
    if isinstance(vr, list) and vr and isinstance(vr[0], (list, tuple)):
        nums = [v[0] for v in vr if isinstance(v[0], int)]
        if nums:
            return min(nums), max(nums)
    # String format: '1-5'
    if isinstance(vr, str) and '-' in vr:
        parts = vr.split('-')
        try:
            return int(parts[0]), int(parts[1])
        except (ValueError, IndexError):
            pass
    return None, None


def _normalise_section_panel(key, value):
    """Normalise a single section panel value from generator or extraction format."""
    # Hebrew word studies
    if key == 'heb' and isinstance(value, list):
        entries = []
        for e in value:
            if isinstance(e, (list, tuple)) and len(e) >= 4:
                entries.append({'word': e[0], 'transliteration': e[1],
                                'gloss': e[2], 'paragraph': e[3]})
            elif isinstance(e, dict):
                entries.append(e)
        return entries

    # Context / historical — plain strings
    if key in ('ctx', 'hist') and isinstance(value, str):
        return value

    # Cross-references
    if key == 'cross' and isinstance(value, list):
        entries = []
        for e in value:
            if isinstance(e, (list, tuple)) and len(e) >= 2:
                entries.append({'ref': e[0], 'note': e[1]})
            elif isinstance(e, dict):
                entries.append(e)
        return entries

    # Places / timeline — passthrough
    if key in ('poi', 'tl'):
        return value

    # Scholar commentary panels (mac, calvin, net, sarna, oswalt, etc.)
    if isinstance(value, list) and value:
        first = value[0]
        # Generator format: list of 2-tuples (ref, note)
        if isinstance(first, (list, tuple)) and len(first) >= 2:
            return {'source': '', 'notes': [
                {'ref': str(n[0]), 'note': str(n[1])} for n in value if len(n) >= 2
            ]}
        # Already-extracted format: dict with 'notes' key
        if isinstance(first, dict) and 'notes' in first:
            return value  # Already wrapped
        # Already normalised list of dicts
        if isinstance(first, dict):
            return value

    # Fallback: passthrough
    return value


# ── Chapter panel normalisation ──────────────────────────────────────
# Chapter-level panels appear once per chapter (not per section).
# Generator scripts pass them as tuples; this converts to dicts.
# Target schemas:
#   lit    → {"rows": [{"range","ref","label","chiastic"}], "note": str}
#   themes → {"scores": [{"name","value"}], "note": str}
#   ppl    → [{"name","role","text"}]
#   src    → [{"title","quote","note"}]
#   rec    → [{"title","quote","note"}]
#   tx     → [{"ref","title","content","note"}]
#   thread → [{"anchor","target","direction","type","text"}]
#   hebtext, debate, trans → passthrough (already structured)
# ─────────────────────────────────────────────────────────────────────

def _normalise_chapter_panel(key, value):
    """Normalise a chapter-level panel value from generator or extraction format."""
    # lit: generator passes (rows_list, note_string)
    if key == 'lit':
        if isinstance(value, (list, tuple)) and len(value) == 2 and isinstance(value[0], list):
            rows, note = value
            return {
                'rows': [_normalise_lit_row(r) for r in rows],
                'note': note or '',
            }
        if isinstance(value, dict):
            return value  # already normalised

    # themes: generator passes (scores_list, note_string)
    if key == 'themes':
        if isinstance(value, (list, tuple)) and len(value) == 2 and isinstance(value[0], list):
            scores, note = value
            return {
                'scores': [{'name': s[0], 'value': s[1]} if isinstance(s, (list, tuple))
                           else s for s in scores],
                'note': note or '',
            }
        if isinstance(value, dict):
            return value

    # hebtext: generator passes list of dicts or tuples
    if key == 'hebtext':
        if isinstance(value, list):
            entries = []
            for e in value:
                if isinstance(e, (list, tuple)) and len(e) >= 4:
                    entries.append({'word': e[0], 'tlit': e[1], 'gloss': e[2], 'note': e[3]})
                elif isinstance(e, dict):
                    entries.append(e)
            return entries
        return value  # might be raw HTML from extraction — Phase 1C handles migration

    # ppl: generator passes list of 3-tuples or dicts
    if key == 'ppl':
        if isinstance(value, list) and value:
            first = value[0]
            if isinstance(first, (list, tuple)):
                return [{'name': p[0], 'role': p[1], 'text': p[2] if len(p) > 2 else ''}
                        for p in value]
        return value

    # src, rec: list of 3-tuples or dicts
    if key in ('src', 'rec'):
        if isinstance(value, list) and value:
            first = value[0]
            if isinstance(first, (list, tuple)):
                return [{'title': s[0], 'quote': s[1], 'note': s[2] if len(s) > 2 else ''}
                        for s in value]
        return value

    # thread: list of dicts or tuples
    if key == 'thread':
        if isinstance(value, list) and value:
            first = value[0]
            if isinstance(first, (list, tuple)):
                return [{'anchor': t[0], 'target': t[1],
                         'direction': t[2] if len(t) > 2 else 'forward',
                         'type': t[3] if len(t) > 3 else '',
                         'text': t[4] if len(t) > 4 else ''}
                        for t in value]
        return value

    # tx (textual): list of 4-tuples or dicts
    if key == 'tx':
        if isinstance(value, list) and value:
            first = value[0]
            if isinstance(first, (list, tuple)):
                return [{'ref': t[0], 'title': t[1],
                         'content': t[2] if len(t) > 2 else '',
                         'note': t[3] if len(t) > 3 else ''}
                        for t in value]
        return value

    # debate: passthrough (already structured)
    if key == 'debate':
        return value

    # trans: passthrough (already structured)
    if key == 'trans':
        return value

    return value


def _normalise_lit_row(row):
    """Normalise a lit row from tuple or dict."""
    if isinstance(row, (list, tuple)) and len(row) >= 3:
        return {
            'label': row[0],
            'range': row[1],
            'text': row[2],
            'is_key': row[3] if len(row) > 3 else False,
        }
    if isinstance(row, dict):
        return row
    return {'label': str(row), 'range': '', 'text': '', 'is_key': False}


# ── Chapter JSON validator ───────────────────────────────────────────

def validate_chapter_json(json_path):
    """Validate a chapter JSON file against the schema.

    Returns (is_valid, list_of_issues).
    """
    issues = []

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        return False, [f"Cannot load: {e}"]

    # Required top-level keys
    for key in ('book_dir', 'chapter_num', 'title', 'sections'):
        if key not in data:
            issues.append(f"Missing required key: {key}")

    if not data.get('title'):
        issues.append("Empty title")

    sections = data.get('sections', [])
    if len(sections) < 1:
        issues.append("No sections")

    known_section_types = {
        'heb', 'ctx', 'hist', 'cross', 'poi', 'tl', 'places',
    }
    # Add all scholar keys from COMMENTATOR_SCOPE
    try:
        from config import COMMENTATOR_SCOPE
        known_section_types.update(COMMENTATOR_SCOPE.keys())
    except ImportError:
        pass

    known_chapter_types = {
        'lit', 'themes', 'ppl', 'trans', 'src', 'rec',
        'hebtext', 'thread', 'tx', 'debate',
    }

    for i, sec in enumerate(sections):
        prefix = f"Section {i+1}"
        if 'header' not in sec:
            issues.append(f"{prefix}: missing header")
        if sec.get('verse_start') is None:
            issues.append(f"{prefix}: missing verse_start")
        panels = sec.get('panels', {})
        if not panels:
            issues.append(f"{prefix}: no panels")
        for ptype, content in panels.items():
            if content is None or content == '':
                issues.append(f"{prefix}: null/empty-string panel '{ptype}'")

    ch_panels = data.get('chapter_panels', {})
    for ptype, content in ch_panels.items():
        if ptype not in known_chapter_types:
            issues.append(f"Unknown chapter panel type: '{ptype}'")
        if content is None or content == '':
            issues.append(f"Null/empty-string chapter panel: '{ptype}'")

    return len(issues) == 0, issues


def rebuild_sqlite():
    """Rebuild scripture.db from all content/ JSON files."""
    import subprocess
    result = subprocess.run(
        [sys.executable, os.path.join(ROOT, '_tools', 'build_sqlite.py')],
        capture_output=True, text=True,
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"ERROR: {result.stderr}")
    return result.returncode == 0


# ══════════════════════════════════════════════════════════════════════
#  AUTO-SCHOLARLY JSON — auto-generate chapter-level panels as dicts
# ══════════════════════════════════════════════════════════════════════

def auto_scholarly_json(data, book_dir, ch):
    """Auto-generate chapter-level scholarly panels as clean JSON dicts.

    Calls the existing auto_scholarly() and transforms its tuple/HTML
    output into the canonical JSON formats defined in PHASE_1_PLAN.md.

    Returns a dict with keys: hebtext, lit, themes, ppl, trans, src,
    rec, tx, debate, thread. Missing panels omitted.
    """
    import re as _re

    # Call the existing (HTML-era) auto_scholarly
    raw = auto_scholarly(data, book_dir, ch)
    result = {}

    # ── HEBTEXT: HTML string → list of dicts ──
    # Instead of parsing the HTML, regenerate from section heb entries
    sections = data.get('sections', [])
    meta = BOOK_META.get(book_dir, {})
    is_nt = meta.get('is_nt', False)
    heb_entries = []
    for sec in sections:
        for e in sec.get('heb', []):
            if isinstance(e, (list, tuple)) and len(e) >= 4:
                heb_entries.append({
                    'word': e[0], 'tlit': e[1], 'gloss': e[2], 'note': e[3],
                })
            elif isinstance(e, dict):
                heb_entries.append({
                    'word': e.get('word', ''),
                    'tlit': e.get('transliteration', e.get('tlit', '')),
                    'gloss': e.get('gloss', ''),
                    'note': e.get('paragraph', e.get('note', '')),
                })
    if heb_entries:
        result['hebtext'] = heb_entries

    # ── LIT: (rows_list, note) → {rows, note} ──
    if 'lit' in raw:
        lit_raw = raw['lit']
        if isinstance(lit_raw, (list, tuple)) and len(lit_raw) == 2:
            rows, note = lit_raw
            result['lit'] = {
                'rows': [_normalise_lit_row(r) for r in rows],
                'note': note or '',
            }
        elif isinstance(lit_raw, dict):
            result['lit'] = lit_raw

    # ── THEMES: (scores_list, note) → {scores, note} ──
    if 'themes' in raw:
        themes_raw = raw['themes']
        if isinstance(themes_raw, (list, tuple)) and len(themes_raw) == 2:
            scores, note = themes_raw
            result['themes'] = {
                'scores': [{'name': s[0], 'value': s[1]} if isinstance(s, (list, tuple))
                           else s for s in scores],
                'note': note or '',
            }
        elif isinstance(themes_raw, dict):
            result['themes'] = themes_raw

    # ── PPL: list of tuples → list of dicts ──
    if 'ppl' in raw:
        ppl_raw = raw['ppl']
        ppl_out = []
        for p in ppl_raw:
            if isinstance(p, (list, tuple)):
                entry = {'name': p[0], 'role': p[1],
                         'text': p[2] if len(p) > 2 else ''}
                if len(p) > 3 and p[3]:
                    entry['timeline_id'] = p[3]
                ppl_out.append(entry)
            elif isinstance(p, dict):
                ppl_out.append(p)
        if ppl_out:
            result['ppl'] = ppl_out

    # ── TRANS: (title, rows_list) → {title, rows} ──
    if 'trans' in raw:
        trans_raw = raw['trans']
        if isinstance(trans_raw, (list, tuple)) and len(trans_raw) == 2:
            title_str, rows = trans_raw
            # rows = [('NIV', text), ('ESV', text), ...]
            # Group into verse-pairs
            trans_rows = []
            for i in range(0, len(rows), 2):
                if i + 1 < len(rows):
                    trans_rows.append({
                        'verse_ref': '',
                        'translations': [
                            {'version': rows[i][0], 'text': rows[i][1]},
                            {'version': rows[i+1][0], 'text': rows[i+1][1]},
                        ]
                    })
            if trans_rows:
                result['trans'] = {'title': title_str, 'rows': trans_rows}
        elif isinstance(trans_raw, dict):
            result['trans'] = trans_raw

    # ── SRC: list of 3-tuples → list of dicts ──
    if 'src' in raw:
        src_out = []
        for s in raw['src']:
            if isinstance(s, (list, tuple)) and len(s) >= 3:
                src_out.append({'title': s[0], 'quote': s[1], 'note': s[2]})
            elif isinstance(s, dict):
                src_out.append(s)
        if src_out:
            result['src'] = src_out

    # ── REC: list of 3-tuples → list of dicts ──
    if 'rec' in raw:
        rec_out = []
        for r in raw['rec']:
            if isinstance(r, (list, tuple)) and len(r) >= 3:
                rec_out.append({'title': r[0], 'quote': r[1], 'note': r[2]})
            elif isinstance(r, dict):
                rec_out.append(r)
        if rec_out:
            result['rec'] = rec_out

    # ── TEXTUAL: list of 4-tuples with HTML → list of dicts, plain text ──
    if 'textual' in raw:
        tx_out = []
        for t in raw['textual']:
            if isinstance(t, (list, tuple)) and len(t) >= 4:
                content = _strip_tx_html(t[2])
                tx_out.append({'ref': t[0], 'title': t[1],
                               'content': content, 'note': t[3]})
            elif isinstance(t, dict):
                if 'content' in t:
                    t['content'] = _strip_tx_html(t['content'])
                tx_out.append(t)
        if tx_out:
            result['tx'] = tx_out  # Note: 'textual' key → 'tx' in JSON schema

    # ── DEBATE: already structured dicts ──
    if 'debate' in raw:
        result['debate'] = raw['debate']

    # ── THREAD: list of 7-tuples → list of dicts ──
    if 'thread' in raw:
        thread_out = []
        for t in raw['thread']:
            if isinstance(t, (list, tuple)) and len(t) >= 7:
                thread_out.append({
                    'direction': t[0],   # dc: fulfilment/echo/type/connection
                    'anchor': t[1],
                    'target': t[3],
                    'type': t[5],        # tl: display label
                    'text': t[6],
                })
            elif isinstance(t, dict):
                thread_out.append(t)
        if thread_out:
            result['thread'] = thread_out

    return result


def _strip_tx_html(text):
    """Strip HTML spans from textual notes content.

    Converts: <span class="tx-mt">MT</span> → MT:
              <span class="tx-lxx">LXX</span> → LXX:
              <span class="tx-dss">DSS</span> → DSS:
              <span class="tx-sp">SP</span> → SP:
    Strips all remaining HTML tags.
    """
    import re as _re
    text = _re.sub(r'<span class="tx-mt">MT</span>', 'MT:', text)
    text = _re.sub(r'<span class="tx-lxx">LXX</span>', 'LXX:', text)
    text = _re.sub(r'<span class="tx-dss">DSS</span>', 'DSS:', text)
    text = _re.sub(r'<span class="tx-sp">SP</span>', 'SP:', text)
    text = _re.sub(r'<[^>]+>', '', text)  # strip remaining HTML
    text = _re.sub(r'\s+', ' ', text).strip()
    return text

def verse_range(start, end):
    """Return [(n, '')] for verse numbers start..end inclusive.
    Use in generator scripts: 'verses': verse_range(1, 18)
    """
    return [(n, '') for n in range(start, end + 1)]

