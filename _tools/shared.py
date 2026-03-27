"""
Companion Study — Content Build System
============================================

Architecture:
    REGISTRY (book list) + config.py (scholar/book config)
        → gen_{book}.py scripts call save_chapter(book_dir, ch, data)
            → writes content/{book_dir}/{ch}.json
            → build_sqlite.py compiles all JSON into scripture.db

Key Globals:
    REGISTRY        — Ordered list of all books: (dir, name, total, live, key, testament_dir)
    BOOK_PREFIX     — Short abbreviations for each book
    COMMENTATOR_*   — Scholar scope mapping (from config.py)

Deploy Cycle:
    1. Build chapters via ephemeral /tmp/ generator using save_chapter()
    2. python3 _tools/build_sqlite.py
    3. python3 _tools/validate.py + validate_sqlite.py
    4. rm /tmp/gen_*.py
    5. git add -A && commit && push
    6. eas update --branch production
"""
import glob
import re, json, math, os, sys

_REPO = '/home/claude/ScriptureDeepDive'

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
        print(f'  ⚠ auto_scholarly_json failed (non-fatal): {e}')

    # ── Write JSON ──
    out_dir = os.path.join(CONTENT_DIR, book_dir)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f'{ch}.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(chapter, f, ensure_ascii=False, indent=2)

    sec_panel_count = sum(len(s['panels']) for s in chapter['sections'])
    ch_panel_count = len(chapter['chapter_panels'])
    print(f'  ✅ Saved {book_dir} {ch} → {out_path}  '
          f'({len(chapter["sections"])} sections, {sec_panel_count} sec panels, '
          f'{ch_panel_count} ch panels)')
    return out_path


# ── Section panel normalisation ──────────────────────────────────────

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

# ── Canonical timeline CSS ────────────────────────────────────────────────
# Injected into chapters that receive tl-panels via patch scripts.
# Values must match styles.css. Update both together.
TL_CSS = (
    '.tl-visual{position:relative;margin:.5rem 0 .3rem;}'
    '.tl-spine{position:absolute;left:144px;top:8px;bottom:8px;width:2px;'
    'background:linear-gradient(to bottom,transparent,#4a6888 6%,#4a6888 94%,transparent);pointer-events:none;}'
    '.tl-event{position:relative;display:grid;grid-template-columns:130px 28px 1fr;'
    'grid-template-rows:auto auto;align-items:start;padding:6px 0;}'
    '.tl-date{grid-column:1;grid-row:1;text-align:right;font-family:\'Cinzel\',serif;'
    'font-size:.63rem;color:#7a9ab8;line-height:1.6;padding-right:10px;white-space:nowrap;}'
    '.tl-dot-wrap{grid-column:2;grid-row:1 / span 2;display:flex;flex-direction:column;'
    'align-items:center;padding-top:4px;}'
    '.tl-dot{width:10px;height:10px;border-radius:50%;background:#304858;'
    'border:2px solid #4a6888;position:relative;z-index:1;flex-shrink:0;}'
    '.tl-body{grid-column:3;grid-row:1 / span 2;padding-left:12px;}'
    '.tl-name{font-size:.78rem;color:#8ab8d8;line-height:1.6;}'
    '.tl-text{font-size:.78rem;color:var(--text);line-height:1.6;margin-top:.25rem;'
    'padding-top:.25rem;border-top:1px solid rgba(74,104,136,.2);}'
    '.tl-event.current .tl-dot{width:13px;height:13px;background:#c0d8f0;'
    'border-color:#e8f4ff;box-shadow:0 0 7px rgba(192,216,240,.55);margin-top:1px;}'
    '.tl-event.current .tl-date{color:#c0d8f0;}'
    '.tl-event.current .tl-name{color:#e8f4ff;font-weight:600;}'
    '.tl-event.current .tl-text{border-color:rgba(192,216,240,.2);color:var(--text);}'
    '.tl-range{display:flex;justify-content:space-between;font-size:.63rem;'
    'color:var(--text-muted);font-style:italic;padding:.2rem 0 0 170px;}'
    '.tl-caption{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-top:.4rem;}'
)



# ══════════════════════════════════════════════════════════════════════
#  AUTO-SCHOLARLY — AI-driven generation of chapter-level panels
#  These functions analyse section content and produce scholarly panels
#  (literary structure, Hebrew terms, theological themes, etc.)
# ══════════════════════════════════════════════════════════════════════

# DEPRECATED — HTML pipeline retired. Kept for reference only.
# See save_chapter() + auto_scholarly_json() for the JSON pipeline.
# This function is NOT called by anything in the active codebase.
def auto_scholarly(data, book_dir, ch):
    """
    Auto-generate all 9 chapter-level scholarly panels from section content.
    Generates: hebtext, lit, themes, ppl, trans, src, rec, textual, debate, thread.
    """
    import re as _re
    meta     = BOOK_META.get(book_dir, {})
    is_nt    = meta.get('is_nt', False)
    sections = data.get('sections', [])
    title    = data.get('title', '')
    result   = {}

    # ── Aggregate text ────────────────────────────────────────────────────
    all_ctx   = ' '.join(sec.get('ctx','') for sec in sections)
    all_notes = ' '.join(
        n[1] for sec in sections
        for key in ('mac','milgrom','sarna','alter','ashley','calvin','netbible',
                    'hubbard','waltke','marcus','keener','robertson','catena')
        for n in sec.get(key,[]) if len(n) >= 2
    )
    all_text  = (title + ' ' + all_ctx + ' ' + all_notes).lower()

    # ── 1. HEBTEXT ────────────────────────────────────────────────────────
    heb_entries = [e for sec in sections for e in sec.get('heb',[]) if len(e)==4]
    if heb_entries:
        lc = '#90c0e8' if is_nt else '#e890b8'
        heading = 'Key Greek Terms' if is_nt else 'Key Hebrew Terms'
        rows = ''
        for word, translit, gloss, note in heb_entries:
            rows += (f'<div style="margin-bottom:.9rem;">'
                     f'<span style="color:{lc};font-size:1.05rem;">{word}</span>'
                     f' <span style="color:var(--gold-dim);font-size:.75rem;font-style:italic;">{translit}</span>'
                     f' &mdash; <strong style="color:var(--gold);">{gloss}</strong>'
                     f'<br><span style="color:var(--fg2);font-size:.82rem;line-height:1.6;">{note}</span>'
                     f'</div>')
        result['hebtext'] = (f'<div style="padding:.25rem 0;">'
                             f'<p style="font-family:\'Cinzel\',serif;font-size:.65rem;'
                             f'color:var(--trans-accent);margin-bottom:.8rem;letter-spacing:.06em;">'
                             f'{heading}</p>{rows}</div>')

    # ── 2. LIT ────────────────────────────────────────────────────────────
    headers = [sec.get('header','') for sec in sections if sec.get('header')]
    if len(headers) >= 2:
        rows = []
        for hdr in headers:
            m = _re.match(r'(Verses?\s+[\d\u2013\u2014\-]+)\s*[\u2014\u2013\-]+\s*(.*)', hdr)
            if m:
                vv, desc = m.group(1), m.group(2)
                # Add context snippet as structural note
                for sec in sections:
                    if sec.get('header','') == hdr:
                        ctx = sec.get('ctx','')
                        snippet = ctx[:120].rstrip() + '\u2026' if ctx else ''
                        rows.append((vv, desc, snippet, False))
                        break
                else:
                    rows.append((vv, desc, '', False))
            else:
                rows.append((hdr[:60], '', '', False))
        # Use 4-tuple form that lit_panel accepts
        result['lit'] = ([(lbl, vv, txt, ctr) for lbl, vv, txt, ctr in rows], f'Structure of {title}')

    # ── 3. THEMES ─────────────────────────────────────────────────────────
    if is_nt:
        theme_defs = [
            ('Kingdom',   ['kingdom','reign','lord','king','rule']),
            ('Grace',     ['grace','mercy','forgiv','love','compassion']),
            ('Faith',     ['faith','believe','trust','hope','salvation']),
            ('Holiness',  ['holy','righteous','pure','sanctif','spirit']),
            ('Mission',   ['preach','proclaim','gospel','witness','nation']),
            ('Suffering', ['suffer','cross','death','sacrifice','servant']),
        ]
    else:
        theme_defs = [
            ('Holiness',    ['holy','holiness','sanctif','qadosh','pure','consecrat']),
            ('Covenant',    ['covenant','promise','oath','faithful','lord your god','lord']),
            ('Atonement',   ['atone','blood','sacrifice','offering','forgiv','kipper']),
            ('Judgment',    ['judgment','punish','wrath','death','cut off','plague','fire']),
            ('Redemption',  ['redeem','deliver','exodus','freedom','ransom','save','liberat']),
            ('Worship',     ['worship','praise','feast','sabbath','prayer','tabernacle','sanctuary']),
        ]
    tlen = max(1, len(all_text) / 80)
    scores = [(label, min(5, max(1, round(1 + sum(all_text.count(kw) for kw in kws)*4/tlen))))
              for label, kws in theme_defs]
    if scores:  # always include themes if we have text to score
        result['themes'] = (scores, title)

    # ── 4. PPL ────────────────────────────────────────────────────────────
    known_names = meta.get('vhl_people', [])
    mentioned = [n for n in known_names
                 if n.lower() in all_text or
                 any(n.lower() in sec.get('ctx','').lower() for sec in sections)]
    if not mentioned:
        mentioned = known_names[:6]
    roles = {
        'Moses':'Prophet and lawgiver','Aaron':'High priest','Miriam':'Prophetess',
        'Caleb':'Faithful spy','Joshua':'Military leader','Korah':'Rebel Levite',
        'Balaam':'Foreign prophet','Balak':'King of Moab','Phinehas':'Priestly zealot',
        'Zelophehad':'Father of daughters','Nadab':'Son of Aaron','Abihu':'Son of Aaron',
        'Eleazar':"Aaron’s son",'Ithamar':"Aaron’s son",'Dathan':'Reubenite rebel',
        'Abiram':'Reubenite rebel','Peter':'Apostle and leader','Paul':'Apostle to the Gentiles',
        'Barnabas':'Paul’s missionary partner','Stephen':'First martyr',
        'Philip':'Evangelist','Cornelius':'First Gentile convert','Silas':'Paul’s companion',
        'Timothy':'Paul’s protégé','James':'Brother of Jesus, Jerusalem leader',
        'Agrippa':'Herodian king','Felix':'Roman governor','Festus':'Roman governor',
        'Luke':'Author and companion of Paul','Priscilla':'Teacher and co-worker',
        'Aquila':'Tentmaker and co-worker','Apollos':'Eloquent teacher',
    }
    if mentioned:
        ppl = []
        for name in mentioned[:8]:
            bio = _get_person_bio(name, book_dir)
            if bio:
                role, desc = bio[0], bio[1]
                tid = bio[2] if len(bio) > 2 else None
            else:
                role = roles.get(name, 'Key biblical figure')
                ctx_combined = ' '.join(sec.get('ctx','') + ' ' +
                    ' '.join(n[1] for k in ('mac','milgrom','sarna','alter','ashley',
                        'calvin','netbible','keener','robertson','marcus')
                        for n in sec.get(k,[]) if len(n)>=2)
                    for sec in sections)
                sentences = [sent.strip() for sent in ctx_combined.replace(';','.').split('.')
                             if name in sent and len(sent.strip()) > 35]
                desc = (sentences[0][:240] + '\u2026') if sentences else (
                    f'{name} is a key figure in {title}.')
            ppl.append((name, role, desc, tid) if bio else (name, role, desc))
        if ppl:
            result['ppl'] = ppl
    # ── 5. TRANS ─────────────────────────────────────────────────────────
    niv_path = os.path.join(_REPO, 'content', 'verses', 'niv', f'{book_dir}.json')
    esv_path = os.path.join(_REPO, 'content', 'verses', 'esv', f'{book_dir}.json')
    if os.path.exists(niv_path) and os.path.exists(esv_path):
        def _get_vv(path, chapter, vlist):
            import json as _json
            with open(path) as f: verses = _json.load(f)
            return {v['v']: v['text'] for v in verses
                    if v['ch'] == chapter and v['v'] in vlist}
        bk_name = next((r[1] for r in REGISTRY if r[0]==book_dir), book_dir.capitalize())
        try:
            vlist = list(range(1, 10))
            niv_vv = _get_vv(niv_path, ch, vlist)
            esv_vv = _get_vv(esv_path, ch, vlist)
            # Find most divergent verse pair
            diffs = [(abs(len(niv_vv.get(v,'')) - len(esv_vv.get(v,''))), v)
                     for v in vlist if v in niv_vv and v in esv_vv
                     and niv_vv[v].lower() != esv_vv[v].lower()]
            diffs.sort(reverse=True)
            rows, key_label = [], f'{bk_name} {ch}:1'
            for _, v in diffs[:2]:
                if v in niv_vv and v in esv_vv:
                    rows += [('NIV', niv_vv[v]), ('ESV', esv_vv[v])]
                    key_label = f'{bk_name} {ch}:{v}'
            if len(rows) >= 2:
                result['trans'] = (f'Comparing translations in {title}', rows)
        except Exception:
            pass

    # ── 6. SRC ────────────────────────────────────────────────────────────
    src_data = _auto_src(book_dir, ch, title, all_text)
    if src_data:
        result['src'] = src_data

    # ── 7. REC ────────────────────────────────────────────────────────────
    rec_data = _auto_rec(book_dir, ch, title, sections)
    if rec_data:
        result['rec'] = rec_data

    # ── 8. TEXTUAL ────────────────────────────────────────────────────────
    tx_data = _auto_textual(book_dir, ch, title)
    if tx_data:
        result['textual'] = tx_data

    # ── 9. DEBATE ────────────────────────────────────────────────────────
    debate_data = _auto_debate(book_dir, ch, title, sections)
    if debate_data:
        result['debate'] = debate_data

    # ── 10. THREAD ───────────────────────────────────────────────────────
    thread_data = _auto_thread(book_dir, ch, title, sections, is_nt)
    if thread_data:
        result['thread'] = thread_data

    return result



def _auto_thread(book_dir, ch, title, sections, is_nt):
    """Generate Intertextual Threading panel from cross[] entries."""
    items = []
    arrow = '→'
    for sec in sections:
        for ref, note in sec.get('cross', []):
            if not ref or not note:
                continue
            # Parse: "Book Ch:v" as anchor; derive target from note
            # Format for thread_panel: (dc, anchor, arrow, target, tc, tl, text)
            # dc = 'fulfilment'/'echo'/'type'/'allusion' based on keywords
            note_lower = note.lower()
            if any(k in note_lower for k in ['fulfil', 'quotes', 'apply', 'interprets as']):
                dc, tc, tl = 'fulfilment', 'type-ful', 'Fulfilment'
            elif any(k in note_lower for k in ['type', 'prefigure', 'foreshadow', 'anticipat']):
                dc, tc, tl = 'type', 'type-typ', 'Type→Antitype'
            elif any(k in note_lower for k in ['echo', 'allud', 'parallel', 'mirrors', 'recall']):
                dc, tc, tl = 'echo', 'type-ech', 'Echo'
            else:
                dc, tc, tl = 'connection', 'type-con', 'Connection'
            # anchor = source (current chapter reference)
            anchor = f'{title.split(":")[0]}'
            target = ref
            text = note[:250] + ('…' if len(note) > 250 else '')
            items.append((dc, anchor, arrow, target, tc, tl, text))
    return items[:6] if items else []


# ── People biographical database ─────────────────────────────────────────────
# Keyed by (book_dir, name) then falling back to (name,) for cross-book figures.
# Each entry: (role, description)
# PEOPLE_BIO — moved to config.py (Batch 5)
from config import PEOPLE_BIO  # noqa: E402 — must be after _REPO

# Timeline ID mapping for PEOPLE_BIO figures
_TIMELINE_IDS = {'moses': 'moses', 'aaron': 'aaron', 'miriam': 'miriam', 'caleb': 'caleb', 'joshua': 'joshua', 'korah': 'korah', 'balaam': 'balaam', 'balak': 'balak', 'phinehas': 'phinehas', 'eleazar': 'eleazar', 'nadab': 'nadab', 'abihu': 'abihu', 'ithamar': 'ithamar', 'dathan': 'dathan', 'abiram': 'abiram', 'peter': 'peter', 'paul': 'paul', 'barnabas': 'barnabas', 'stephen': 'stephen', 'philip': 'philip-ev', 'cornelius': 'cornelius', 'silas': 'silas', 'timothy': 'timothy', 'james': 'james-brother', 'luke': 'luke', 'priscilla': 'priscilla', 'aquila': 'aquila', 'apollos': 'apollos', 'agrippa': 'agrippa', 'felix': 'felix', 'festus': 'festus',
    'sihon': 'sihon',
    'og': 'og',
}

def _get_person_bio(name, book_dir):
    """Look up a person's (role, description, timeline_id) from the PEOPLE_BIO database."""
    key_specific = (book_dir, name.lower().replace(" ","_"))
    key_general  = (name.lower().replace(" ","_"),)
    first = name.split()[0].lower()
    bio = None
    for key in [key_specific, key_general]:
        if key in PEOPLE_BIO:
            bio = PEOPLE_BIO[key]; break
    if bio is None:
        for key in PEOPLE_BIO:
            if key[-1] == first or (len(key) == 1 and key[0] == first):
                bio = PEOPLE_BIO[key]; break
    if bio is None:
        return None
    # Return (role, desc, timeline_id)
    tid = _TIMELINE_IDS.get(first) or _TIMELINE_IDS.get(name.lower().replace(" ","_"))
    return (bio[0], bio[1], tid)


def _auto_src(book_dir, ch, title, all_text):
    """Generate Ancient Sources panel."""
    ane_map = {
        'leviticus': [
            ('Ugaritic Sacrifice Texts (KTU 1.40)',
             'Ritual texts from Ugarit describe burnt, peace, and purification offerings with comparable priestly procedures and gradations.',
             'Demonstrates that Israel’s sacrificial vocabulary was shared with the wider ancient Near East, while the theological rationale — holiness, atonement, covenant — was distinctively Israelite.'),
            ('Hittite Ritual Texts',
             'Hittite purification rituals describe graduated offerings for different levels of transgression, paralleling the Levitical sin-offering gradations of Lev 4–5.',
             'The structural parallels illuminate the Levitical system’s ANE context while highlighting Israel’s distinctive theology of intentionality and priestly atonement.'),
            ('Philo of Alexandria, De Specialibus Legibus (1st c. AD)',
             'Philo’s allegorical commentary interprets each offering as symbolic of the soul’s approach to God — the burnt offering as total consecration of the rational soul.',
             'Influential on early Christian interpretation; Origen and Clement drew heavily on Philo’s allegorical reading of the Levitical laws.'),
        ],
        'numbers': [
            ('Mari Texts and Census Records (c.1800 BC)',
             'Administrative texts from Mari record comparable tribal musters, census-taking procedures, and military organisation strikingly similar to Numbers 1–4.',
             'Confirms that the Numbers census methodology reflects genuine Bronze Age administrative practice rather than later literary invention.'),
            ('Balaam Texts from Deir Alla (c.800 BC)',
             'A plaster inscription found at Deir Alla in Jordan describes a seer named "Balaam son of Beor" who receives divine night visions — the same figure as Numbers 22–24.',
             'The extra-biblical attestation of Balaam confirms him as a historical figure known in ancient Transjordanian tradition, lending credibility to the Numbers narrative.'),
            ('Ugaritic Priestly Archive Texts',
             'Sanctuary service rosters and offering procedures from Ugarit illuminate the social organisation of ancient Near Eastern priesthoods, paralleling the Levitical organisation of Num 3–4.',
             'The Levitical clan structure and service rotations reflect authentic Bronze Age priestly administrative structures known across the ancient Near East.'),
        ],
        'deuteronomy': [
            ('Hittite Suzerainty Treaties (14th–13th c. BC)',
             'Klaus Baltzer (1960) and Meredith Kline (1963) demonstrated that Deuteronomy follows the '
             'six-part structure of Hittite vassal treaties: preamble (1:1–5), historical prologue '
             '(1:6–3:29), stipulations (4–26), document clause (27:1–9), witnesses (31:19–22), '
             'and blessings/curses (28). This structure is attested only in 14th–13th century BC '
             'treaties, strongly supporting Mosaic authorship.',
             'The treaty-form evidence is the most powerful external argument for Deuteronomy’s '
             'early date. Subsequent Assyrian vassal treaties (7th c. BC) have a different form, '
             'making a late (Josian) dating of the book structurally improbable.'),
            ('Vassal Treaties of Esarhaddon (672 BC)',
             'The Neo-Assyrian VTE contains curse language strikingly similar to Deut 28, leading some '
             'scholars (Weinfeld, Steymans) to argue Deuteronomy was modelled on Assyrian treaties. '
             'However, the VTE represents only the curse section; Deuteronomy’s full six-part '
             'structure matches only Hittite treaties.',
             'The parallel demonstrates that ancient Near Eastern covenant forms were widespread, but '
             'the direction of dependence is disputed. The Hittite parallel is structurally closer and '
             'temporally earlier, supporting the traditional dating.'),
            ('Ugaritic and Ancient Near Eastern Covenant Terminology',
             'The vocabulary of Deuteronomy — <em>berît</em> (covenant), <em>ahavah</em> (love as '
             'covenant loyalty), <em>hesed</em> (loyal love), ‘adon’ (lord) — is attested '
             'in Ugaritic and other ANE diplomatic texts as standard covenant terminology.',
             'This shows that Deuteronomy’s language of love, loyalty, and service was not merely '
             'personal piety but carried legal-diplomatic weight: Israel’s relationship with God '
             'is structured as a formal suzerainty covenant.'),
        ],
        'acts': [
            ('Josephus, Antiquities of the Jews (c.93 AD)',
             'Josephus provides extensive first-century background for the political, religious, and social conditions described in Acts — the Herodian family, Pharisees and Sadducees, Roman provincial governance.',
             'Acts’ historical details consistently align with Josephus’s independent account of the same period, supporting the narrative’s historical credibility.'),
            ('Dead Sea Scrolls (1QS, 1QM)',
             'The Qumran community texts illuminate the diversity of Second Temple Judaism from which Christianity emerged — their eschatological expectations, community rules, and temple criticism parallel aspects of the early church.',
             'The Scrolls demonstrate that the early church’s practices (community meals, shared goods, eschatological expectation) were not unprecedented within Jewish renewal movements.'),
            ('Greco-Roman Travel Literature and Epistolary Conventions',
             'Acts’ travel narrative (ch.13–28) conforms to the conventions of ancient Greek travel literature, and Paul’s speeches follow rhetorical models documented in Greco-Roman oratory.',
             'The Hellenistic literary conventions confirm Acts’ composition for a sophisticated Greco-Roman audience and support its historical reliability as ancient historiography.'),
        ],
        '2_samuel': [
            ('Tel Dan Stele (c.840 BC)',
             'The Aramaic inscription mentioning &ldquo;the house of David&rdquo; is the earliest extra-biblical reference to David\'s dynasty.',
             'Confirms the historical existence of a Davidic royal house, corroborating the 2 Samuel narrative of dynasty-founding.'),
            ('Mesha Stele / Moabite Stone (c.840 BC)',
             'King Mesha of Moab describes his revolt against Israelite control of Transjordan, referencing the &ldquo;house of David.&rdquo;',
             'The Moabite perspective on Israelite territorial claims illuminates the geopolitical context of David\'s Transjordan campaigns in 2 Samuel 8-10.'),
            ('Ancient Near Eastern Royal Ideology and Succession Narratives',
             'Egyptian, Hittite, and Mesopotamian court narratives describe succession crises, palace intrigues, and the legitimation of new dynasties.',
             'The Succession Narrative (2 Sam 9-20) has been compared to Egyptian and Hittite court literature for its psychological realism and political sophistication.'),
        ],
        '1_samuel': [
            ('Philistine Archaeology (Tel Miqne/Ekron, Ashkelon)',
             'Excavations at Philistine sites reveal a sophisticated Aegean-origin culture with distinctive pottery, architecture, and religious practices.',
             'The archaeological record confirms the Philistines as a formidable, technologically advanced people — consistent with their iron monopoly (1 Sam 13:19-22) and military dominance in the Samuel narratives.'),
            ('Tel Dan Stele (c.840 BC)',
             'The Aramaic inscription mentioning &ldquo;the house of David&rdquo; (<em>bytdwd</em>) is the earliest extra-biblical reference to David\'s dynasty.',
             'Confirms the historical existence of a Davidic royal line, corroborating the Samuel narrative\'s account of David\'s rise to kingship.'),
            ('Ancient Near Eastern Kingship Ideology',
             'Mesopotamian and Egyptian king-lists, coronation rituals, and royal ideology illuminate Israel\'s ambivalent adoption of monarchy.',
             'The tension in 1 Samuel between divine kingship and human monarchy reflects a distinctively Israelite adaptation of ANE royal theology — the king serves under YHWH, never as a divine figure.'),
        ],
        'judges': [
            ('Amarna Letters',
             'Letters from Canaanite vassal kings describe the political fragmentation and inter-city rivalries characterising the Judges period.',
             'The correspondence confirms Canaan\'s decentralised city-state structure — the landscape in which tribal judges operated as regional deliverers.'),
            ('Merneptah Stele (c.1207 BC)',
             'The earliest extra-biblical mention of Israel in Canaan, dating to the period of the Judges.',
             'Places Israel in Canaan during the Judges period, corroborating the biblical settlement chronology.'),
            ('Ugaritic Baal Cycle (KTU 1.1-6)',
             'Describes Baal\'s conflict with Mot and Yam — the religious background to Judges\' repeated Baal worship.',
             'Understanding Canaanite religion is essential: Israel was drawn to a sophisticated fertility cult, not abstract idolatry.'),
        ],
        'joshua': [
            ('Amarna Letters (EA 285-290)', 
             'Letters from Canaanite vassal kings to Egyptian Pharaoh describe &ldquo;Habiru&rdquo; invaders destabilising city-states.',
             'The Amarna correspondence (c.1350 BC) describes social upheaval in Canaan that some scholars correlate with the Israelite conquest. The &ldquo;Habiru&rdquo; are not identical to &ldquo;Hebrews&rdquo; but may include them.'),
            ('Merneptah Stele (c.1207 BC)',
             '&ldquo;Israel is laid waste; his seed is not.&rdquo;',
             'The earliest extra-biblical reference to Israel as a people group in Canaan. The determinative marks Israel as a people, not a territory — consistent with a recently settled group.'),
            ('Papyrus Anastasi I',
             'An Egyptian satirical letter describing Canaan\'s geography, roads, and fortified cities.',
             'The detailed Canaanite geography matches Joshua\'s territorial descriptions, confirming the text\'s familiarity with the region\'s actual landscape.'),
        ],

        'daniel': [
            ('The Prayer of Nabonidus (4Q242, Dead Sea Scrolls)',
             'A fragmentary Qumran text describes a Babylonian king struck with illness for seven years who is healed by a Jewish exorcist — strikingly parallel to Nebuchadnezzar’s madness in Daniel 4.',
             'The Prayer of Nabonidus may preserve an older version of the tradition behind Daniel 4, or reflect a common Near Eastern motif of royal humbling. Either way, it confirms the antiquity of the Daniel traditions.'),
            ('1 Maccabees 1–2 (2nd c. BC)',
             'Describes the historical desecration of the Jerusalem temple by Antiochus IV Epiphanes in 167 BC — the event Daniel 8:9–14 and 11:31 prophesy as the “abomination of desolation.”',
             'The fulfilment is documented in non-biblical Jewish sources, confirming Daniel’s prophetic precision whether the prophecy is dated to the 6th or 2nd century BC.'),
            ('Josephus, Antiquities 10.11 (1st c. AD)',
             'Josephus records that when Alexander the Great approached Jerusalem (332 BC), the high priest showed him Daniel’s prophecy about a Greek king conquering Persia, and Alexander was so impressed he offered sacrifices at the temple.',
             'Whether historically accurate or legendary, Josephus’s account shows that Daniel’s prophecies were understood as referring to Greek conquest well before the Christian era.'),
        ],

        'lamentations': [
            ('Sumerian City Laments (c.2000 BC)',
             'The Lamentation over the Destruction of Ur and similar Sumerian texts follow a comparable pattern: the deity abandons the city, enemies destroy it, the population mourns, and a tentative plea for restoration concludes.',
             'Lamentations participates in an ancient Near Eastern genre of city-lament that predates it by over a millennium. The genre validates public grief as a literary and theological act.'),
            ('The Babylonian Chronicles',
             'Cuneiform records document Nebuchadnezzar’s siege and capture of Jerusalem in 597 and 586 BC, confirming the historical catastrophe behind Lamentations.',
             'The archaeological evidence corroborates the destruction described in the poems, including evidence of massive burning in the City of David excavations.'),
        ],

        'isaiah': [
            ('The Cyrus Cylinder (539 BC)',
             'A clay cylinder in which Cyrus of Persia describes his conquest of Babylon and his policy of returning captive peoples to their homelands — the Persian policy that fulfilled Isaiah 44:28–45:1.',
             'The cylinder confirms Isaiah’s prophecy of a Persian king who would liberate captives and authorize temple rebuilding, whether the prophecy is dated early (8th c.) or late (6th c.).'),
            ('The Sennacherib Prism (c.700 BC)',
             'Sennacherib’s own account of his 701 BC campaign states he shut Hezekiah up “like a bird in a cage” in Jerusalem — but conspicuously does NOT claim to have captured the city.',
             'The silence confirms Isaiah 36–37: Sennacherib besieged but never conquered Jerusalem. His own records inadvertently verify Isaiah’s narrative of divine deliverance.'),
            ('The Great Isaiah Scroll (1QIsaᵃ, Dead Sea Scrolls)',
             'A complete copy of Isaiah found at Qumran, dated c.125 BC. The oldest complete biblical manuscript, it is virtually identical to the Masoretic text 1,000 years later.',
             'The scroll demonstrates the remarkable textual stability of Isaiah across a millennium. The text the church reads today is essentially the text the Qumran community read.'),
        ],
    }
    return ane_map.get(book_dir, [])[:3]


def _auto_rec(book_dir, ch, title, sections):
    """Generate Reception History panel from scholars cited + historical tradition."""
    scholar_map = {
        'mac':       ('John MacArthur', 'Evangelical / Reformed', '20th–21st c.'),
        'milgrom':   ('Jacob Milgrom', 'Critical Jewish scholarship', '20th–21st c.'),
        'sarna':     ('Nahum Sarna', 'JPS / Modern Jewish scholarship', '20th c.'),
        'alter':     ('Robert Alter', 'Literary-critical approach', '20th–21st c.'),
        'ashley':    ('Timothy Ashley', 'Evangelical / NICOT', '20th c.'),
        'calvin':    ('John Calvin', 'Reformed / Reformation', '16th c.'),
        'netbible':  ('NET Bible translators', 'Text-critical evangelical', '21st c.'),
        'hubbard':   ('David Hubbard', 'Evangelical / NICOT', '20th c.'),
        'waltke':    ('Bruce Waltke', 'Evangelical / Reformed', '20th–21st c.'),
        'marcus':    ('Joel Marcus', 'Historical-critical', '20th–21st c.'),
        'keener':    ('Craig Keener', 'Evangelical / Socio-historical', '21st c.'),
        'craigie':   ('Peter Craigie', 'Evangelical / NICOT', '20th c.'),
        'tigay':     ('Jeffrey Tigay', 'JPS / Modern Jewish scholarship', '20th\u201321st c.'),
    }
    seen = []
    for sec in sections:
        for key, (name, tradition, era) in scholar_map.items():
            if key in sec and name not in [x[0] for x in seen]:
                notes = sec[key]
                if notes and len(notes[0]) >= 2:
                    text = notes[0][1]
                    seen.append((name, tradition, era, text[:200] + ('…' if len(text)>200 else '')))
    # Also add a patristic or classical reference based on book
    classics = {
        'leviticus': ('Origen, Homilies on Leviticus (c.240 AD)',
                      'Patristic exegesis / Allegorical',
                      'Early',
                      'Origen’s homilies on Leviticus are among the most extensive patristic readings of the book, interpreting the sacrificial system allegorically as prefiguring Christ’s work.'),
        'numbers':   ('Origen, Homilies on Numbers (c.240 AD)',
                      'Patristic exegesis / Allegorical',
                      'Early',
                      'Origen’s homilies treat the wilderness journey as a spiritual allegory for the soul’s journey toward God, reading each campsite as a stage in spiritual formation.'),
        'deuteronomy':('Origen, Homilies on Deuteronomy (3rd c. AD)',
                      'Patristic exegesis / Allegorical',
                      'Early',
                      'Origen read Deuteronomy christologically throughout, interpreting Moses’ '
                      'farewell discourses as prefiguring Christ’s teaching, the “prophet like Moses” '
                      '(18:15) as a direct prophecy of Christ, and the land as a figure of the soul’s '
                      'heavenly inheritance.'),
        'acts':      ('John Chrysostom, Homilies on Acts (c.400 AD)',
                      'Patristic exegesis / Antiochene school',
                      'Early',
                      'Chrysostom’s 55 homilies on Acts are the most thorough patristic commentary, emphasising the Spirit’s active role and the apostles’ moral example for the church.'),
    }
    if book_dir in classics:
        name, trad, era, text = classics[book_dir]
        if name not in [x[0] for x in seen]:
            seen.insert(0, (name, trad, era, text))
    blocks = [(name, f'"{text}"', f'{tradition} — {era}')
              for name, tradition, era, text in seen[:4]]
    return blocks


def _auto_textual(book_dir, ch, title):
    """Generate Textual Notes panel with book-specific LXX/MT content."""
    tx_books = {
        'leviticus': [
            (f'Lev {ch}:1',
             'LXX rendering of the divine speech formula',
             '<span class="tx-mt">MT</span> <em>wayyiqraʾ</em> ("and he called") — <span class="tx-lxx">LXX</span> <em>kai eklēsen</em> closely follows MT. The LXX Leviticus is generally a close translation with stylistic smoothing.',
             'The LXX Leviticus rarely reflects a divergent Hebrew Vorlage; most variants are stylistic. The Qumran Leviticus scrolls (4QLevᵃᵇ) largely confirm the MT tradition.'),
            (f'Lev {ch} (general)',
             'Samaritan Pentateuch variants',
             '<span class="tx-mt">MT</span> is the primary witness; <span class="tx-sp">SP</span> (Samaritan Pentateuch) occasionally harmonises with Exodus parallels and preserves some archaic forms absent from MT.',
             'For Leviticus, the SP variants are minor. The most significant differences involve the location of worship — Gerizim vs Jerusalem — which affects passages relating to the chosen place of sacrifice.'),
        ],
        'numbers': [
            (f'Num {ch}:1',
             'LXX expansion and MT alignment',
             '<span class="tx-mt">MT</span> and <span class="tx-lxx">LXX</span> agree closely in Numbers narrative. The LXX occasionally adds explanatory glosses, particularly in the census and itinerary sections.',
             'The Qumran Numbers scroll (4QNumb) is the most important textual witness, confirming MT in most passages while occasionally aligning with LXX against MT in minor details.'),
            (f'Num {ch} (general)',
             'Samaritan Pentateuch and Qumran',
             '<span class="tx-sp">SP</span> Numbers preserves significant expansions at several points (notably Num 21, 27) that align with Deuteronomy — harmonistic editing for worship at Gerizim.',
             'The Dead Sea Scrolls (4QNumb) represent a text-type distinct from both MT and SP, confirming the diversity of the Numbers textual tradition in the Second Temple period.'),
        ],
        'deuteronomy': [
            (f'Deut {ch}',
             'LXX Deuteronomy and the MT divergences',
             '<span class="tx-mt">MT</span> and <span class="tx-lxx">LXX</span> Deuteronomy diverge more '
             'significantly than other Pentateuchal books. The LXX adds explanatory expansions, especially '
             'in the blessings and curses (ch.28) and the Song of Moses (ch.32).',
             'The LXX Deuteronomy was translated with greater theological freedom than other books. '
             'It often interprets rather than translates, and has shaped the NT’s use of Deuteronomy '
             '(Paul cites LXX Deut in Rom 10 and Gal 3).'),
            (f'Deut {ch} (general)',
             'Qumran and the Samaritan Pentateuch',
             'Deuteronomy is the most-copied book at Qumran (29 manuscripts), showing its centrality '
             'to Second Temple Judaism. The <span class="tx-sp">SP</span> Deuteronomy adds a tenth '
             'commandment mandating an altar on Gerizim (Exod 20:17b insert), the central SP polemic.',
             'The Nash Papyrus (c.150–100 BC) preserves the Decalogue and Shema from Deuteronomy '
             '— the oldest surviving Hebrew manuscript of any biblical text. It shows a mixed '
             'text-type combining MT and LXX features.'),
        ],
        'acts': [
            (f'Acts {ch}',
             'Western text (Codex Bezae D) vs Alexandrian text',
             '<span class="tx-mt">Alexandrian</span> (P45, P74, א, B) is the primary scholarly text. <span class="tx-lxx">Western</span> (Codex Bezae D) is 10–15% longer, with additions that appear to expand and harmonise.',
             'Acts has the most significant NT textual variation. The Western text of Acts is not simply corrupt but may preserve early oral expansions. Most scholars follow the shorter Alexandrian text as more original.'),
            (f'Acts {ch} (general)',
             'P45 and early papyrus witnesses',
             'The Chester Beatty Papyrus (P45, c.250 AD) is the earliest substantial Acts manuscript, generally supporting the Alexandrian text with some unique readings.',
             'The papyrus evidence has largely confirmed the Alexandrian tradition as the best text of Acts, though the Western text’s substantial additions remain a subject of scholarly investigation.'),
        ],
        '2_samuel': [
            ('Tel Dan Stele (c.840 BC)',
             'The Aramaic inscription mentioning &ldquo;the house of David&rdquo; is the earliest extra-biblical reference to David\'s dynasty.',
             'Confirms the historical existence of a Davidic royal house, corroborating the 2 Samuel narrative of dynasty-founding.'),
            ('Mesha Stele / Moabite Stone (c.840 BC)',
             'King Mesha of Moab describes his revolt against Israelite control of Transjordan, referencing the &ldquo;house of David.&rdquo;',
             'The Moabite perspective on Israelite territorial claims illuminates the geopolitical context of David\'s Transjordan campaigns in 2 Samuel 8-10.'),
            ('Ancient Near Eastern Royal Ideology and Succession Narratives',
             'Egyptian, Hittite, and Mesopotamian court narratives describe succession crises, palace intrigues, and the legitimation of new dynasties.',
             'The Succession Narrative (2 Sam 9-20) has been compared to Egyptian and Hittite court literature for its psychological realism and political sophistication.'),
        ],
        '2_samuel': [
            ('4QSam\u1d43 (Dead Sea Scrolls)',
             'Important Qumran witness for 2 Samuel',
             '4QSam\u1d43 preserves readings closer to the LXX than the MT in several passages, including significant variants in 2 Sam 5-6 and the appendices (chs 21-24).',
             'The textual evidence confirms that the MT of 2 Samuel, like 1 Samuel, is not always the best text. Critical editions now routinely consult 4QSam\u1d43 alongside LXX.'),
            ('Josephus, Antiquities VII',
             'First-century retelling of David\'s reign',
             'Josephus\'s account smooths over some of David\'s moral failures while expanding the political narrative, revealing how Second Temple Judaism received the David tradition.',
             'Josephus confirms the broad historical outline while showing interpretive tendencies in the reception of the David story.'),
        ],
        '1_samuel': [
            ('4QSam\u1d43 (Dead Sea Scrolls)',
             'Significant Qumran witness',
             '4QSam\u1d43 preserves a text of Samuel closer to the LXX Vorlage than to the MT. In several places it fills gaps and resolves difficulties (e.g., 1 Sam 10:27-11:1 has an entire paragraph missing from the MT).',
             'The Samuel DSS evidence demonstrates that the MT is not always the best text — the LXX and Qumran sometimes preserve more original readings.'),
            ('Josephus, Antiquities VI-VII',
             'First-century retelling',
             'Josephus provides an extensive parallel to 1 Samuel, sometimes drawing on traditions independent of both MT and LXX.',
             'Josephus confirms the broad narrative outline while showing how the story was received in Second Temple Judaism.'),
        ],
                'judges': [
            ('Amarna Letters',
             'Letters from Canaanite vassal kings describe the political fragmentation and inter-city rivalries characterising the Judges period.',
             'The correspondence confirms Canaan\'s decentralised city-state structure — the landscape in which tribal judges operated as regional deliverers.'),
            ('Merneptah Stele (c.1207 BC)',
             'The earliest extra-biblical mention of Israel in Canaan, dating to the period of the Judges.',
             'Places Israel in Canaan during the Judges period, corroborating the biblical settlement chronology.'),
            ('Ugaritic Baal Cycle (KTU 1.1-6)',
             'Describes Baal\'s conflict with Mot and Yam — the religious background to Judges\' repeated Baal worship.',
             'Understanding Canaanite religion is essential: Israel was drawn to a sophisticated fertility cult, not abstract idolatry.'),
        ],
        
        'judges': [
            ('LXX Judges (Vaticanus vs Alexandrinus)',
             'Two distinct Greek text traditions',
             'Judges has two significantly different LXX traditions (B and A), suggesting independent translation from different Hebrew Vorlagen.',
             'The textual diversity indicates a complex transmission history with multiple Hebrew editions.'),
            ('4QJudg\u1d43 (Dead Sea Scrolls)',
             'Fragmentary Qumran witness',
             'Cave 4 fragments generally align with MT but show minor variants in spelling.',
             'The Qumran evidence supports MT reliability while confirming textual variation existed.'),
        ],
        'joshua': [
            ('LXX Joshua', 'Shorter text form',
             'The LXX of Joshua is significantly shorter than the MT, especially in chapters 5-6, 20, and 24. Some scholars argue the LXX preserves an earlier, more concise text.',
             'The LXX order and shorter readings may witness to a pre-Deuteronomistic edition of Joshua.'),
            ('4QJosh\u1d43 (Dead Sea Scrolls)', 'Altar-building placement',
             'A Qumran fragment places the Ebal altar episode (Josh 8:30-35) after 5:1, supporting the LXX order rather than the MT.',
             'This variant supports the view that the MT order was editorially rearranged, possibly to group all conquest narratives together.'),
        ],
    }
    return tx_books.get(book_dir, [])


def _auto_debate(book_dir, ch, title, sections):
    """Generate Scholarly Debates panel."""
    debates = []
    debate_kws = ['debate','disputed','question','alternatively','scholars','interpret','source','date','author']
    for sec in sections:
        for key in ('milgrom','sarna','ashley','netbible','marcus','keener'):
            for note in sec.get(key, []):
                if len(note) < 2: continue
                if any(kw in note[1].lower() for kw in debate_kws) and len(debates) < 2:
                    ref = note[0] if note[0] else sec.get('header','')[:30]
                    full = note[1]
                    debates.append((
                        f'Interpretive Question: {ref}',
                        [('Critical/Analytical scholarship', full[:150]+'…',
                          'Emphasises historical-critical, literary, or text-critical analysis.'),
                         ('Traditional/Confessional reading',
                          f'Reads {title.split(":")[0]} within the canonical framework of fulfilled prophecy and covenant theology.',
                          'Represented by Calvin, MacArthur, and the evangelical tradition.')],
                        'Both readings engage the text seriously; they differ primarily in their hermeneutical starting points and assumptions about authorship and historical context.'
                    ))
    if not debates:
        book_debates = {
            'leviticus': (
                f'Source and Date of {title.split(":")[0]}',
                [('Documentary hypothesis (Wellhausen, Noth)',
                  f'Assigns {title.split(":")[0]} to the Priestly (P) source, dated to the post-exilic period (6th–5th c. BC) on the basis of vocabulary, theology, and redaction-critical analysis.',
                  'This view treats the Levitical legislation as crystallised priestly tradition rather than Mosaic prescription.'),
                 ('Unified authorship (Milgrom, Wenham, conservative scholarship)',
                  f'Argues that the detailed ANE parallels, archaic vocabulary, and internal coherence support a second-millennium date for {title.split(":")[0]}.',
                  'Milgrom’s detailed comparison with ANE ritual texts demonstrates the antiquity and coherence of the material regardless of the dating question.')],
                'The dating question does not determine the text’s canonical authority or theological meaning, but significantly affects its historical interpretation and setting.'
            ),
            'numbers': (
                f'Historical and Literary Integrity of {title.split(":")[0]}',
                [('Critical scholarship (Noth, Gray)',
                  f'Identifies {title.split(":")[0]} as a composite of J, E, and P sources redacted together, with inconsistencies explained by source combination.',
                  'The source-critical approach accounts for apparent repetitions and tensions but has been questioned for its circular methodology.'),
                 ('Literary and canonical unity (Milgrom, Ashley)',
                  f'Reads {title.split(":")[0]} as a literary unit with deliberate structure, arguing that apparent inconsistencies are rhetorical or theological rather than redactional.',
                  'The literary approach has gained ground; the chapter’s internal coherence supports reading it as a unified composition.')],
                'The source debate is ongoing; its resolution affects historical reconstruction more than theological interpretation.'
            ),
            'deuteronomy': (
            f'Authorship and Date of Deuteronomy',
            [('Critical scholarship: Josian composition (de Wette, Wellhausen)',
              f'The dominant critical view since de Wette (1805) identifies the “book of the law” '
              f'found in 2 Kgs 22 with Deuteronomy, placing its composition in Josiah’s reign (c.621 BC). '
              f'Deuteronomy on this view was written to legitimise Josiah’s centralisation reforms.',
              'This view treats the Mosaic attribution as a literary fiction and explains the book’s '
              'similarities with 7th-century Assyrian treaty forms — though the Hittite parallels are structurally closer.'),
             ('Mosaic authorship / early composition (Kline, Craigie, evangelical scholarship)',
              f'The Hittite suzerainty treaty structure (attested only in 14th–13th c. BC) strongly '
              f'supports early composition. The book’s internal claims (1:1, 31:9,22,24) and NT citations '
              f'(Jesus cites Deuteronomy three times in the temptation: Matt 4:4,7,10) support Mosaic origin.',
              'Craigie and Kline argue that the treaty-form evidence makes a late date structurally '
              'implausible. The “prophet like Moses” passage (18:15) is best read as a genuine '
              'prediction, not a post-exilic retrojection.')],
            'The authorship question significantly affects interpretation but not the canonical authority '
            'or theological meaning of Deuteronomy’s covenant vision.'
        ),
        'acts': (
                f'Authorship and Historicity of {title.split(":")[0]}',
                [('Traditional Lukan authorship (Hengel, Keener, classical scholarship)',
                  f'Attributes Acts to Luke the physician (Col 4:14), a companion of Paul, on the basis of the "we" passages, historical accuracy, and early church tradition.',
                  'Luke’s medical vocabulary (noted by Hobart) and the detailed geographical and political accuracy of Acts support the traditional attribution.'),
                 ('Anonymous/secondary authorship (Haenchen, Conzelmann)',
                  f'Questions Lukan authorship on the basis of discrepancies between Acts’ Paul and the Pauline letters, suggesting a later author using Lukan sources.',
                  'This view notes that Acts does not always match Paul’s letters precisely, and argues the "we" passages may be a literary device rather than eyewitness markers.')],
                'The authorship question remains open; most scholars accept that Acts was composed within a generation of the events described and reflects genuine historical tradition.'
            ),
        }
        if book_dir in book_debates:
            debates.append(book_debates[book_dir])
    return debates

