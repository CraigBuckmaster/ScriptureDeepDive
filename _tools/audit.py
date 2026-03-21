#!/usr/bin/env python3
"""
Scripture Deep Dive — Pre-commit Audit Script
Run: python3 audit.py
All checks must pass before committing.
Add new checks whenever a new class of bug is found.

Issue history this file was written to catch:
  - Empty/broken hebtext panels ([] content)
  - Missing/thin literary highlight rows
  - Thin/missing scholar com-note panels
  - MacArthur panels absent or thin
  - Chapter subtitle showing 'Book N' instead of real title
  - com-source divs not closed (notes nested inside com-source)
  - com-notes leaking outside their panel div
  - Various CSS/JS structural issues (tog, VHL, qnav, etc.)
"""

import re, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PASS  = '\033[92m✓\033[0m'
FAIL  = '\033[91m✗\033[0m'
WARN  = '\033[93m⚠\033[0m'
HEAD  = '\033[96m'
RESET = '\033[0m'

failures = []
warnings = []

def section(title):
    print(f"\n{HEAD}─── {title} {'─' * max(0, 48 - len(title))}{RESET}")

def ok(msg):    print(f"  {PASS} {msg}")
def fail(msg):  print(f"  {FAIL} {msg}"); failures.append(msg)
def warn(msg):  print(f"  {WARN}  {msg}"); warnings.append(msg)

BOOK_ROSTER = [
    ('genesis',  'Genesis',  range(1, 51), 'ot'),
    ('exodus',   'Exodus',   range(1, 41), 'ot'),
    ('proverbs', 'Proverbs', range(1, 32), 'ot'),
    ('leviticus','Leviticus',range(1, 28), 'ot'),
    ('numbers',      'Numbers',      range(1, 37), 'ot'),
    ('deuteronomy',  'Deuteronomy',  range(1, 35), 'ot'),
    ('joshua',       'Joshua',       range(1, 25), 'ot'),
    ('judges',       'Judges',       range(1, 22), 'ot'),
    ('1_samuel',     '1 Samuel',     range(1, 32), 'ot'),
    ('2_samuel',     '2 Samuel',     range(1, 25), 'ot'),
    ('1_kings',      '1 Kings',      range(1, 23), 'ot'),
    ('2_kings',      '2 Kings',      range(1,  9), 'ot'),
    ('ruth',         'Ruth',         range(1,  5), 'ot'),
    ('matthew',  'Matthew',  range(1, 29), 'nt'),
    ('mark',     'Mark',     range(1, 17), 'nt'),
    ('luke',     'Luke',     range(1, 25), 'nt'),
    ('john',     'John',     range(1, 22), 'nt'),
    ('acts',     'Acts',     range(1, 29), 'nt'),
]

SCHOLAR_KEYS = {
    'Genesis':  ['sarna',    'alter', 'calvin', 'netbible'],
    'Exodus':   ['sarna',    'alter', 'calvin', 'netbible'],
    'Ruth':     ['hubbard',  'alter', 'calvin', 'netbible'],
    'Proverbs': ['waltke',   'alter', 'calvin', 'netbible'],
    'Matthew':  ['robertson','catena','calvin', 'netbible'],
    'Mark':     ['marcus',   'catena','calvin', 'netbible'],
    'Luke':     ['robertson','catena','calvin', 'netbible'],
    'John':     ['catena',   'calvin'],
    'Acts':        ['robertson','keener'],
    'Leviticus':   ['milgrom',  'calvin', 'netbible'],
    'Numbers':     ['milgrom',  'ashley', 'calvin', 'netbible'],
    'Deuteronomy': ['craigie',  'tigay',  'calvin', 'netbible'],
    'Joshua':      ['hess',     'howard', 'calvin', 'netbible'],
    'Judges':      ['block',    'webb',   'calvin', 'netbible'],
    '1 Samuel':    ['bergen',   'tsumura','calvin', 'netbible'],
    '2 Samuel':    ['bergen',   'anderson','calvin', 'netbible'],
    '1 Kings':     ['wiseman',  'provan',  'calvin', 'netbible'],
    '2 Kings':     ['wiseman',  'provan',  'calvin', 'netbible'],
}

def chapter_paths():
    paths = []
    for book_dir, book_name, chapters, test_dir in BOOK_ROSTER:
        for ch in chapters:
            p = f'{REPO}/{test_dir}/{book_dir}/{book_name}_{ch}.html'
            if os.path.exists(p):
                paths.append((p, book_name, ch))
    return paths

def count_verses_in_sections(html):
    boundary = html.find('<div class="scholarly-block">')
    if boundary == -1:
        boundary = html.rfind('</main>')
    return len(re.findall(r'class="verse-text"', html[:boundary]))

def get_sections(body, bnd):
    """Return list of (start, end) for each section in body (before scholarly-block)."""
    secs = [m.start() for m in re.finditer(r'<div class="section">', body)]
    result = []
    for i, s in enumerate(secs):
        e = secs[i+1] if i+1 < len(secs) else bnd
        result.append((s, e))
    return result

def count_notes_in_panel(sec_html, key):
    """Return note count for a scholar panel, or None if panel is absent."""
    m = re.search(rf'class="anno-panel[^"]*\bcom-{key}\b[^"]*">', sec_html)
    if not m: return None
    start = m.end()
    end_m = re.search(r'<div[^>]+class="anno-panel', sec_html[start:])
    content = sec_html[start:start + end_m.start()] if end_m else sec_html[start:]
    return len(re.findall(r'class="com-note"', content))

def panel_has_closed_source(sec_html, key):
    """Return True if the com-source div inside this panel has a proper closing tag."""
    m = re.search(rf'class="anno-panel[^"]*\bcom-{key}\b[^"]*">', sec_html)
    if not m: return True  # no panel — not this check's problem
    # Find content up to next panel
    start = m.end()
    end_m = re.search(r'<div[^>]+class="anno-panel', sec_html[start:])
    panel_content = sec_html[start:start + end_m.start()] if end_m else sec_html[start:]
    # com-source div should have </div> before any com-note
    src_m = re.search(r'class="com-source">(.*?)(?=<div class="com-note"|$)', panel_content, re.DOTALL)
    if not src_m: return True
    return '</div>' in src_m.group(1)

def check_leaked_notes(body, bnd):
    """Return list of section indices where com-notes appear outside a panel."""
    leaked = []
    secs = get_sections(body, bnd)
    for si, (s, e) in enumerate(secs):
        sec = body[s:e]
        # Find all com-panel divs and check if any com-note follows outside them
        for pm in re.finditer(r'<div[^>]+class="anno-panel com-panel[^"]*">', sec):
            p_start = pm.end()
            depth = 1
            i = p_start
            while i < len(sec):
                if sec[i:i+4] == '<div': depth += 1
                elif sec[i:i+6] == '</div>':
                    depth -= 1
                    if depth == 0:
                        after = sec[i+6:i+56].strip()
                        if after.startswith('<div class="com-note">'):
                            leaked.append(si+1)
                        break
                i += 1
    return leaked


# ── Expected NIV verse counts ─────────────────────────────────────────────
EXPECTED = {
    ('Genesis', 1):31,('Genesis', 2):25,('Genesis', 3):24,('Genesis', 4):26,
    ('Genesis', 5):32,('Genesis', 6):22,('Genesis', 7):24,('Genesis', 8):22,
    ('Genesis', 9):29,('Genesis',10):32,('Genesis',11):32,('Genesis',12):20,
    ('Genesis',13):18,('Genesis',14):24,('Genesis',15):21,('Genesis',16):16,
    ('Genesis',17):27,('Genesis',18):33,('Genesis',19):38,('Genesis',20):18,
    ('Genesis',21):34,('Genesis',22):24,('Genesis',23):20,('Genesis',24):67,
    ('Genesis',25):34,('Genesis',26):35,('Genesis',27):46,('Genesis',28):22,
    ('Genesis',29):35,('Genesis',30):43,('Genesis',31):55,('Genesis',32):32,
    ('Genesis',33):20,('Genesis',34):31,('Genesis',35):29,('Genesis',36):43,
    ('Genesis',37):36,('Genesis',38):30,('Genesis',39):23,('Genesis',40):23,
    ('Genesis',41):57,('Genesis',42):38,('Genesis',43):34,('Genesis',44):34,
    ('Genesis',45):28,('Genesis',46):34,('Genesis',47):31,('Genesis',48):22,
    ('Genesis',49):33,('Genesis',50):26,
    ('Exodus', 1):22,('Exodus', 2):25,('Exodus', 3):22,('Exodus', 4):31,
    ('Exodus', 5):23,('Exodus', 6):30,('Exodus', 7):25,('Exodus', 8):32,
    ('Exodus', 9):35,('Exodus',10):29,('Exodus',11):10,('Exodus',12):51,
    ('Exodus',13):22,('Exodus',14):31,('Exodus',15):27,('Exodus',16):36,
    ('Exodus',17):16,('Exodus',18):27,('Exodus',19):25,('Exodus',20):26,
    ('Exodus',21):36,('Exodus',22):31,('Exodus',23):33,('Exodus',24):18,
    ('Exodus',25):40,('Exodus',26):37,('Exodus',27):21,('Exodus',28):43,
    ('Exodus',29):46,('Exodus',30):38,('Exodus',31):18,('Exodus',32):35,
    ('Exodus',33):23,('Exodus',34):35,('Exodus',35):35,('Exodus',36):38,
    ('Exodus',37):29,('Exodus',38):31,('Exodus',39):43,('Exodus',40):38,
    ('Ruth', 1):22,('Ruth', 2):23,('Ruth', 3):18,('Ruth', 4):22,
    ('Proverbs', 1):33,('Proverbs', 2):22,('Proverbs', 3):35,
    ('Proverbs', 4):27,('Proverbs', 5):23,('Proverbs', 6):35,
    ('Proverbs', 7):27,('Proverbs', 8):36,('Proverbs', 9):18,
    ('Proverbs',10):32,('Proverbs',11):31,('Proverbs',12):28,('Proverbs',13):25,
    ('Proverbs',14):35,('Proverbs',15):33,('Proverbs',16):33,
    ('Proverbs',17):28,('Proverbs',18):24,('Proverbs',19):29,
    ('Proverbs',20):30,('Proverbs',21):31,('Proverbs',22):29,('Proverbs',23):35,
    ('Proverbs',24):34,('Proverbs',25):28,('Proverbs',26):28,
    ('Proverbs',27):27,('Proverbs',28):28,('Proverbs',29):27,
    ('Proverbs',30):33,('Proverbs',31):31,
    ('Matthew', 1):25,('Matthew', 2):23,('Matthew', 3):17,('Matthew', 4):25,
    ('Matthew', 5):48,('Matthew', 6):34,('Matthew', 7):29,('Matthew', 8):34,
    ('Matthew', 9):38,('Matthew',10):42,('Matthew',11):30,('Matthew',12):50,
    ('Matthew',13):58,('Matthew',14):36,('Matthew',15):39,('Matthew',16):28,
    ('Matthew',17):26,('Matthew',18):35,('Matthew',19):30,('Matthew',20):34,
    ('Matthew',21):46,('Matthew',22):46,('Matthew',23):38,('Matthew',24):51,
    ('Matthew',25):46,('Matthew',26):75,('Matthew',27):66,('Matthew',28):20,
    ('Mark', 1):45,('Mark', 2):28,('Mark', 3):35,('Mark', 4):41,
    ('Mark', 5):43,('Mark', 6):56,('Mark', 7):36,('Mark', 8):38,
    ('Mark', 9):48,('Mark',10):52,('Mark',11):32,('Mark',12):44,
    ('Mark',13):37,('Mark',14):72,('Mark',15):46,('Mark',16):20,
    ('Luke', 1):80,('Luke', 2):52,('Luke', 3):38,('Luke', 4):44,
    ('Luke', 5):39,('Luke', 6):49,('Luke', 7):50,('Luke', 8):56,
    ('Luke', 9):62,('Luke',10):42,('Luke',11):54,('Luke',12):59,
    ('Luke',13):34,('Luke',14):35,('Luke',15):32,('Luke',16):31,
    ('Luke',17):37,('Luke',18):43,('Luke',19):48,('Luke',20):47,
    ('Luke',21):38,('Luke',22):71,('Luke',23):56,('Luke',24):53,
    ('John', 1):51,('John', 2):25,('John', 3):36,('John', 4):54,
    ('John', 5):47,('John', 6):71,('John', 7):53,('John', 8):59,
    ('John', 9):41,('John',10):42,('John',11):57,('John',12):50,
    ('John',13):38,('John',14):31,('John',15):27,('John',16):33,
    ('John',17):26,('John',18):40,('John',19):42,('John',20):31,
    ('John',21):25,
    ('Acts', 1):26,('Acts', 2):47,('Acts', 3):26,('Acts', 4):37,
    ('Acts', 5):42,('Acts', 6):15,('Acts', 7):60,('Acts', 8):40,
    ('Acts', 9):43,('Acts',10):48,('Acts',11):30,('Acts',12):25,
    ('Acts',13):52,('Acts',14):28,('Acts',15):41,('Acts',16):40,
    ('Acts',17):34,('Acts',18):28,('Acts',19):41,('Acts',20):38,
    ('Acts',21):40,('Acts',22):30,('Acts',23):35,('Acts',24):26,  # v7 is a Western text addition omitted in NIV
    ('Acts',25):27,('Acts',26):32,('Acts',27):44,('Acts',28):31,
}

chapters = chapter_paths()

# ═══════════════════════════════════════════════════════════════════════════
# 1. HTML STRUCTURE
# ═══════════════════════════════════════════════════════════════════════════
section('1. HTML Structure')

style_errors = orphan_errors = 0

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    label = f'{book} {ch}'

    # Accept either inline <style> or external stylesheet link
    has_inline = h.count('<style>') == 1
    has_external = 'styles.css' in h
    if not has_inline and not has_external:
        fail(f'{label}: no <style> block and no styles.css link')
        style_errors += 1

    main_start = h.find('<main>')
    if main_start > -1:
        main_html = h[main_start:]
        if re.search(r'<div class="legend-item"><div class="legend-dot[^"]*"></div>\s*\n\s*<div', main_html):
            fail(f'{label}: orphaned/broken legend-item in <main>')
            orphan_errors += 1

    # Look for orphaned fragments after the head section
    body = h[h.find('</head>'):]
    for frag in ['Available now</div>', 'll-item"><div class="ll-dot']:
        if frag in body:
            fail(f'{label}: orphaned legend text in body')
            orphan_errors += 1

if style_errors == 0:
    ok(f'CSS present in all {len(chapters)} chapters')
if orphan_errors == 0:
    ok('No orphaned HTML fragments')

with open(f'{REPO}/index.html') as f: idx = f.read()
# Homepage may use inline <style> OR external homepage.css
_has_homepage_css = 'homepage.css' in idx
if idx.count('<style>') == 1 or _has_homepage_css:
    ok('Homepage CSS present' + (' (external homepage.css)' if _has_homepage_css else ' (inline <style>)'))
else:
    fail(f'index.html: {idx.count("<style>")} <style> blocks and no homepage.css link')

# ═══════════════════════════════════════════════════════════════════════════
# 2. CHAPTER SUBTITLE
# New check: subtitle <p> must not repeat "Book N" — must be real title
# ═══════════════════════════════════════════════════════════════════════════
section('2. Chapter Subtitles')

bad_subtitles = []
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    h1_pos = h.find('<h1>')
    if h1_pos == -1: continue
    after = h[h1_pos:h1_pos+200]
    p_m = re.search(r'</h1>\s*<p[^>]*>(.*?)</p>', after)
    if not p_m:
        bad_subtitles.append(f'{book} {ch}: no subtitle <p> found')
    elif p_m.group(1).strip() in (f'{book} {ch}', book, f'{book}'):
        bad_subtitles.append(f'{book} {ch}: subtitle is placeholder "{p_m.group(1).strip()}"')

if bad_subtitles:
    for e in bad_subtitles[:5]: fail(e)
    if len(bad_subtitles) > 5: fail(f'...and {len(bad_subtitles)-5} more subtitle issues')
else:
    ok(f'All {len(chapters)} chapters have real subtitle titles')

# ═══════════════════════════════════════════════════════════════════════════
# 3. CSS INTEGRITY
# ═══════════════════════════════════════════════════════════════════════════
section('3. CSS Integrity')

# CSS now lives in external styles.css — check it once rather than per-chapter
_styles_path = os.path.join(REPO, 'styles.css')
if os.path.exists(_styles_path):
    with open(_styles_path) as f: _css = f.read()
    ok(f'External styles.css found ({len(_css):,} chars)')
    if 'anno-trigger.macarthur' not in _css:
        fail('Missing MacArthur CSS in styles.css')
    else:
        ok('MacArthur CSS present in styles.css')
else:
    # Fallback: check inline <style> per chapter (legacy mode)
    missing_mac  = []
    for path, book, ch in chapters:
        with open(path) as f: h = f.read()
        css = h[h.find('<style>'):h.find('</style>')]
        if 'anno-trigger.macarthur' not in css:
            missing_mac.append(f'{book} {ch}')
    if missing_mac:
        fail(f'Missing MacArthur CSS in {len(missing_mac)} chapters: ' +
             ', '.join(missing_mac[:3]) + ('...' if len(missing_mac) > 3 else ''))
    else:
        ok('MacArthur CSS present in all chapters')

# ═══════════════════════════════════════════════════════════════════════════
# 4. VERSES.JS
# ═══════════════════════════════════════════════════════════════════════════
section('4. Verse Index (verses/)')

OT_BOOKS = ['genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','1_samuel','2_samuel','1_kings','2_kings','ruth','proverbs']

# Check monolithic verses/verses.js (full canon fallback)
vjs_path = f'{REPO}/verses/niv/verses.js'
if not os.path.exists(vjs_path):
    fail('verses/verses.js (full canon fallback) missing')
else:
    with open(vjs_path) as f: vjs = f.read()
    vc = vjs.count('"ref":')
    if 'VERSES_ALL=' in vjs:
        ok(f'verses/verses.js (full canon) valid — {vc} verses')
    else:
        fail(f'verses/verses.js malformed (starts={vjs[:20]!r})')

# Check per-book verse files in verses/ot/ and verses/nt/
missing_per_book = []
for book_dir, book_name, ch_range, test_dir_v in BOOK_ROSTER:
    p = f'{REPO}/verses/niv/{test_dir_v}/{book_dir}.js'
    if not os.path.exists(p):
        missing_per_book.append(f'verses/niv/{test_dir_v}/{book_dir}.js')
if missing_per_book:
    fail(f'Missing per-book verse files: {", ".join(missing_per_book)}')
else:
    ok('All per-book verses/{testament}/{book}.js files present')

# Check chapters load their own book's verse file from verses/ subdir
wrong_verses = []
for p, b, c in chapters:
    with open(p) as f: h = f.read()
    book_dir_for_ch = os.path.basename(os.path.dirname(p))
    test = 'ot' if book_dir_for_ch in OT_BOOKS else 'nt'
    expected_d1 = f'../verses/niv/{test}/{book_dir_for_ch}.js'
    expected_d2 = f'../../verses/niv/{test}/{book_dir_for_ch}.js'
    if expected_d1 not in h and expected_d2 not in h:
        wrong_verses.append(f'{b} {c}')
if wrong_verses:
    fail(f'{len(wrong_verses)} chapters missing per-book verses script: ' + ', '.join(wrong_verses[:3]))
else:
    ok('All chapters load their per-book verses file')
# ═══════════════════════════════════════════════════════════════════════════
# 5. VERSE COUNTS
# ═══════════════════════════════════════════════════════════════════════════
section('5. Verse Counts (NIV)')

wrong = []
for path, book, ch in chapters:
    exp = EXPECTED.get((book, ch))
    if exp is None: continue
    with open(path) as f: h = f.read()
    found = count_verses_in_sections(h)
    if found != exp:
        wrong.append(f'{book} {ch}: {found}/{exp}')

if wrong:
    for e in wrong: fail(e)
else:
    ok(f'All {len(EXPECTED)} chapters have correct NIV verse counts')

# ═══════════════════════════════════════════════════════════════════════════
# 6. NAVIGATION ARROWS
# ═══════════════════════════════════════════════════════════════════════════
section('6. Navigation Arrows')

nav_errors = []
for i, (path, book, ch) in enumerate(chapters):
    with open(path) as f: h = f.read()
    m = re.search(r'class="nav-arrow next([^"]*)"[^>]*href="([^"]*)"', h) or \
        re.search(r'href="([^"]*)"[^>]*class="nav-arrow next([^"]*)"', h)
    if not m: continue
    next_exists = (i + 1 < len(chapters) and chapters[i+1][1] == book)
    href = m.group(2) if m.lastindex >= 2 else m.group(1)
    classes = m.group(1) if m.lastindex >= 2 else m.group(2)
    if next_exists and (href == '#' or 'disabled' in classes):
        nav_errors.append(f'{book} {ch}: next arrow disabled but {book} {ch+1} exists')

if nav_errors:
    for e in nav_errors: fail(e)
else:
    ok('No incorrectly disabled next-arrows')

# Verify cross-book nav arrows use ../../ testament-prefixed paths
REGISTRY_ORDER = [
    ('genesis','Genesis','ot'), ('exodus','Exodus','ot'),
    ('leviticus','Leviticus','ot'), ('numbers','Numbers','ot'), ('deuteronomy','Deuteronomy','ot'), ('joshua','Joshua','ot'), ('judges','Judges','ot'), ('1_samuel','1 Samuel','ot'), ('2_samuel','2 Samuel','ot'), ('1_kings','1 Kings','ot'), ('2_kings','2 Kings','ot'), ('ruth','Ruth','ot'), ('proverbs','Proverbs','ot'),
    ('matthew','Matthew','nt'), ('mark','Mark','nt'),
    ('luke','Luke','nt'), ('john','John','nt'), ('acts','Acts','nt'),
]
LIVE_CHS = {bd: ch_range.stop-1 for bd,bn,ch_range,_ in BOOK_ROSTER}
cross_errors = []
for i,(bd,bn,td) in enumerate(REGISTRY_ORDER):
    if i > 0:  # check first chapter's prev arrow
        pbd,pbn,ptd = REGISTRY_ORDER[i-1]
        pl = LIVE_CHS[pbd]
        path = f'{REPO}/{td}/{bd}/{bn}_1.html'
        if os.path.exists(path):
            with open(path) as f: h = f.read()
            expected = f'../../{ptd}/{pbd}/{pbn.replace(" ","_")}_{pl}.html'
            if expected not in h:
                cross_errors.append(f'{bn} 1: prev cross-book href wrong (expected {expected})')
    if i < len(REGISTRY_ORDER)-1:  # check last chapter's next arrow
        nbd,nbn,ntd = REGISTRY_ORDER[i+1]
        ll = LIVE_CHS[bd]
        path = f'{REPO}/{td}/{bd}/{bn}_{ll}.html'
        if os.path.exists(path):
            with open(path) as f: h = f.read()
            expected = f'../../{ntd}/{nbd}/{nbn.replace(" ","_")}_1.html'
            if expected not in h:
                cross_errors.append(f'{bn} {ll}: next cross-book href wrong (expected {expected})')
if cross_errors:
    for e in cross_errors: fail(e)
else:
    ok('All cross-book nav boundaries correct')

# Verify QNAV_CURRENT values use testament/book/Name_N.html format
qnav_cur_errors = []
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    m = re.search(r'QNAV_CURRENT="([^"]+)"', h)
    if not m:
        qnav_cur_errors.append(f'{book} {ch}: no QNAV_CURRENT')
    else:
        val = m.group(1)
        if not (val.startswith('ot/') or val.startswith('nt/')):
            qnav_cur_errors.append(f'{book} {ch}: QNAV_CURRENT not testament-prefixed: {val!r}')
if qnav_cur_errors:
    fail(f'{len(qnav_cur_errors)} chapters with bad QNAV_CURRENT: ' + ', '.join(qnav_cur_errors[:3]))
else:
    ok('All chapters have testament-prefixed QNAV_CURRENT')

# Verify no chapter still uses depth-1 ../ for root assets
root_assets = ['books.js','qnav.js','index.html','manifest.json','icon-192.png']
depth_errors = []
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    for asset in root_assets:
        if f'"../{asset}"' in h:
            depth_errors.append(f'{book} {ch}: ../{asset} should be ../../{asset}')
            break
if depth_errors:
    fail(f'{len(depth_errors)} chapters have depth-1 asset paths: ' + ', '.join(depth_errors[:3]))
else:
    ok('All chapters use correct depth-2 (../../) asset paths')

# ═══════════════════════════════════════════════════════════════════════════
# 7. QNAV
# ═══════════════════════════════════════════════════════════════════════════
section('7. Quick Navigation')

qnav_errors = []
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    if 'qnav.js' not in h:
        qnav_errors.append(f'{book} {ch}: missing qnav.js reference')
    elif 'QNAV_CURRENT' not in h:
        qnav_errors.append(f'{book} {ch}: missing QNAV_CURRENT')

if qnav_errors:
    for e in qnav_errors[:5]: fail(e)
else:
    ok('qnav present and current chapter marked in all chapters')

# ═══════════════════════════════════════════════════════════════════════════
# 8. SERVICE WORKER
# ═══════════════════════════════════════════════════════════════════════════
section('8. Service Worker')

with open(f'{REPO}/service-worker.js') as f: sw = f.read()
m = re.search(r"const CACHE = '(scripture-[\d.v]+)'", sw)
if not m:
    fail('Cannot find SW CACHE version string')
else:
    ok(f'SW version: {m.group(1)}')

if "'/verses/niv/verses.js'" in sw:
    ok('verses/verses.js in SW CORE cache')
else:
    fail("'/verses/verses.js' not in SW CORE cache")

# Verify SW registration in chapters uses ../../ (depth-2) not ../
bad_sw_reg = [f'{b} {c}' for p,b,c in chapters
              if '"../service-worker.js"' in open(p).read()]
if bad_sw_reg:
    fail(f'{len(bad_sw_reg)} chapters register SW at wrong depth (../): ' + ', '.join(bad_sw_reg[:3]))
else:
    ok('All chapters register service worker at correct depth (../../)')

# Verify SW CORE cache uses /ot/ and /nt/ prefixed paths
old_flat = re.findall(r"'/(genesis|exodus|ruth|proverbs|matthew|mark|luke|john|acts)/[^']+\.html'", sw)
if old_flat:
    fail(f'SW CORE has {len(old_flat)} flat (pre-restructure) chapter paths')
else:
    nt_count = sw.count("'/nt/")
    ot_count = sw.count("'/ot/")
    ok(f'SW CORE chapter paths correct: {ot_count} OT, {nt_count} NT entries')

# ═══════════════════════════════════════════════════════════════════════════
# 9. TOG() FUNCTION
# ═══════════════════════════════════════════════════════════════════════════
section('9. tog() Function')

tog_errors = []
# Check external tog.js exists and has correct content
_tog_path = os.path.join(REPO, 'tog.js')
if os.path.exists(_tog_path):
    with open(_tog_path) as f: _tog_content = f.read()
    if 'anno-panel.open' in _tog_content and 'themes-panel.open' in _tog_content:
        ok('External tog.js has correct selectors')
    else:
        fail('External tog.js missing required selectors')
    # Verify chapters reference it
    _missing_tog_ref = []
    for path, book, ch in chapters:
        with open(path) as f: h = f.read()
        if 'tog.js' not in h and 'function tog(' not in h:
            _missing_tog_ref.append(f'{book} {ch}')
    if _missing_tog_ref:
        for e in _missing_tog_ref[:5]: fail(f'{e}: no tog.js reference or inline tog()')
    else:
        ok(f'All {len(chapters)} chapters load tog.js')
else:
    # Fallback: check inline tog() per chapter (legacy)
    for path, book, ch in chapters:
        with open(path) as f: h = f.read()
        m = re.search(r'function tog\b.*?\{(.*?)\n\}', h, re.DOTALL)
        if not m:
            tog_errors.append(f'{book} {ch}: tog() not found')
            continue
        body = m.group(1)
        if 'anno-panel.open' not in body or 'themes-panel.open' not in body:
            tog_errors.append(f'{book} {ch}: tog() missing required selectors')
    if tog_errors:
        for e in tog_errors[:5]: fail(e)
    else:
        ok('tog() correct in all chapters')

# ═══════════════════════════════════════════════════════════════════════════
# 10. PANEL CSS & JS COMPLETENESS
# ═══════════════════════════════════════════════════════════════════════════
section('10. Panel CSS & JS Completeness')

missing_panel_css   = []
missing_panel_open  = []
missing_vhl         = []
missing_qnav_filter = []
has_togthemes       = []
missing_label_js    = []
missing_qnav_groups = []
bad_btn_css         = []
missing_scholarly   = []
single_section      = []

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    # CSS may be inline (<style>) or external (styles.css) — get the right source
    if '<style>' in h:
        css = h[h.find('<style>'):h.find('</style>')]
    elif os.path.exists(os.path.join(REPO, 'styles.css')):
        css = _css  # reuse from section 3
    else:
        css = ''
    label = f'{book} {ch}'

    if '.anno-panel{display:none' not in css and '.anno-panel {display:none' not in css:
        missing_panel_css.append(label)
    if '.anno-panel.open{display:block' not in css and '.anno-panel.open {display:block' not in css:
        missing_panel_open.append(label)
    if 'DIVINE={' not in h and 'DIVINE ={' not in h:
        missing_vhl.append(label)
    if 'qnav.js' not in h and 'function qnavFilter' not in h:
        missing_qnav_filter.append(label)
    if 'togThemes' in h:
        has_togthemes.append(label)
    if 'var label' not in h and "'label'" not in h and 'history.js' not in h:
        missing_label_js.append(label)
    if 'qnav.js' not in h and ('id="qnav-t-ot"' not in h or 'id="qnav-t-nt"' not in h):
        missing_qnav_groups.append(label)
    if re.search(r'\.anno-trigger\{[^}]*letter-spacing:\.07em', css):
        bad_btn_css.append(label)
    sch_match = re.search(r'class="scholarly-buttons">(.*?)</div>', h, re.DOTALL)
    if sch_match and 'anno-trigger' not in sch_match.group(1):
        missing_scholarly.append(label)
    if h.count('<div class="section">') < 2:
        single_section.append(f'{label} ({h.count("<div class=\"section\">")} section)')

checks_10 = [
    (single_section,      'Chapters with <2 sections'),
    (missing_panel_css,   'Missing .anno-panel display:none CSS'),
    (missing_panel_open,  'Missing .anno-panel.open CSS'),
    (missing_vhl,         'Missing VHL IIFE (DIVINE word highlighting)'),
    (missing_qnav_filter, 'Missing qnavFilter function'),
    (has_togthemes,       'togThemes() used — must use tog() instead'),
    (missing_label_js,    'History JS missing label field'),
    (missing_qnav_groups, 'Missing qnav OT/NT testament groups'),
    (bad_btn_css,         'Duplicate/old anno-trigger CSS (letter-spacing:.07em)'),
    (missing_scholarly,   'scholarly-buttons has no anno-trigger buttons'),
]

all_ok_10 = True
for bad_list, msg in checks_10:
    if bad_list:
        fail(f'{msg}: {", ".join(bad_list[:3])}{"..." if len(bad_list) > 3 else ""}')
        all_ok_10 = False

if all_ok_10:
    ok('All panel CSS, JS, and structural checks clean')

# ═══════════════════════════════════════════════════════════════════════════
# 11. HEBTEXT PANELS
# New check: heb-text-panel must not contain '[]' or be near-empty
# ═══════════════════════════════════════════════════════════════════════════
section('11. Hebrew Text Panels')

heb_broken  = []
heb_missing = []

for path, book, ch in chapters:
    with open(path) as f: h = f.read()

    if h.find('<div class="scholarly-block">') == -1:
        continue  # no scholarly block — skip (old-style chapter)

    # Two valid panel locations:
    # (A) scholarly-block: Matthew / OT  — chapter-level Greek/Hebrew reading
    # (B) section-level: John / Acts     — per-section Greek Word Study panels
    # A chapter passes if ANY hebtext panel anywhere has real content (≥30 chars after h4)

    panels = re.findall(r'class="anno-panel heb-text-panel">(.*?)</div>', h, re.DOTALL)
    if not panels:
        heb_missing.append(f'{book} {ch}')
        continue

    # Check if at least one panel has real content (not just <h4>...</h4>)
    real_content = [re.sub(r'<h4>[^<]*</h4>', '', p).strip() for p in panels]
    real_panels  = [c for c in real_content if len(c) >= 30]

    if not real_panels:
        heb_broken.append(f'{book} {ch}: all {len(panels)} hebtext panels are empty stubs')
    # Else: at least one panel has content — chapter passes

if heb_broken:
    for e in heb_broken[:5]: fail(f'Broken hebtext: {e}')
    if len(heb_broken) > 5: fail(f'...and {len(heb_broken)-5} more broken hebtext panels')
else:
    ok(f'All hebtext panels have real content')

if heb_missing:
    for e in heb_missing[:3]: warn(f'Missing hebtext panel: {e}')

# ═══════════════════════════════════════════════════════════════════════════
# 12. LITERARY HIGHLIGHTS
# New check: lit-diagram must have ≥2 lit-rows
# ═══════════════════════════════════════════════════════════════════════════
section('12. Literary Highlights')

lit_empty  = []
lit_single = []

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    bnd = h.find('<div class="scholarly-block">')
    if bnd == -1: continue
    sch = h[bnd:]
    if 'lit-panel' not in sch: continue
    rows = len(re.findall(r'class="lit-row', sch))
    if rows == 0:
        lit_empty.append(f'{book} {ch}')
    elif rows == 1:
        lit_single.append(f'{book} {ch}')

if lit_empty:
    for e in lit_empty[:5]: fail(f'Empty lit-diagram: {e}')
    if len(lit_empty) > 5: fail(f'...and {len(lit_empty)-5} more empty lit panels')
else:
    ok('No empty literary highlight panels')

if lit_single:
    for e in lit_single[:5]: warn(f'Single lit-row (needs 2): {e}')
    if len(lit_single) > 5: warn(f'...and {len(lit_single)-5} more single-row lit panels')
else:
    ok('All lit panels have ≥2 rows')

# ═══════════════════════════════════════════════════════════════════════════
# 13. SCHOLAR PANELS — note counts
# New check: every section must have ≥2 com-notes in each scholar panel
# Also checks MacArthur panels are present and have ≥2 notes
# ═══════════════════════════════════════════════════════════════════════════
section('13. Scholar Panel Note Counts')

scholar_missing  = []  # panel entirely absent
scholar_thin     = []  # panel exists but <2 notes
mac_missing      = []
mac_thin         = []

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    bnd = h.find('<div class="scholarly-block">')
    if bnd == -1: continue
    body = h[:bnd]
    secs = get_sections(body, bnd)
    keys = SCHOLAR_KEYS.get(book, [])

    for si, (s, e) in enumerate(secs):
        sec = body[s:e]
        label = f'{book} {ch} s{si+1}'

        # MacArthur
        mac_cnt = count_notes_in_panel(sec, 'macarthur')
        if mac_cnt is None:
            mac_missing.append(label)
        elif mac_cnt < 2:
            mac_thin.append(f'{label} ({mac_cnt} notes)')

        # Per-book scholars
        for key in keys:
            cnt = count_notes_in_panel(sec, key)
            if cnt is None:
                scholar_missing.append(f'{label} {key}')
            elif cnt < 2:
                scholar_thin.append(f'{label} {key} ({cnt} notes)')

all_ok_13 = True
# MacArthur missing is structural — hard fail
if mac_missing:
    sample = ', '.join(mac_missing[:3]) + ('...' if len(mac_missing) > 3 else '')
    fail(f'MacArthur panel MISSING in {len(mac_missing)} sections: {sample}')
    all_ok_13 = False
# MacArthur thin, scholar missing/thin are content debt — warn only
for bad_list, label in [
    (mac_thin,        'MacArthur panel thin (<2 notes)'),
    (scholar_missing, 'Scholar panel MISSING'),
    (scholar_thin,    'Scholar panel thin (<2 notes)'),
]:
    if bad_list:
        sample = ', '.join(bad_list[:3]) + ('...' if len(bad_list) > 3 else '')
        warn(f'{label} in {len(bad_list)} sections: {sample}')

if all_ok_13:
    ok('All MacArthur panels present; scholar content debt tracked as warnings')

# ═══════════════════════════════════════════════════════════════════════════
# 14. COM-SOURCE CLOSURE & LEAKED NOTES
# New check: com-source divs must be closed; no com-notes outside panels
# ═══════════════════════════════════════════════════════════════════════════
section('14. Panel HTML Integrity')

source_unclosed = []
notes_leaked    = []

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    bnd = h.find('<div class="scholarly-block">')
    if bnd == -1: continue
    body = h[:bnd]
    secs = get_sections(body, bnd)
    all_keys = SCHOLAR_KEYS.get(book, []) + ['macarthur']

    for si, (s, e) in enumerate(secs):
        sec = body[s:e]
        label = f'{book} {ch} s{si+1}'

        # Check com-source closure for each scholar
        for key in all_keys:
            if not panel_has_closed_source(sec, key):
                source_unclosed.append(f'{label} {key}')

    # Check for leaked notes (outside panel divs)
    leaked = check_leaked_notes(body, bnd)
    for si in leaked:
        notes_leaked.append(f'{book} {ch} s{si}')

all_ok_14 = True
for bad_list, label in [
    (source_unclosed, 'com-source div not closed (notes nesting inside it)'),
    (notes_leaked,    'com-notes leaking outside their panel div'),
]:
    if bad_list:
        sample = ', '.join(bad_list[:3]) + ('...' if len(bad_list) > 3 else '')
        fail(f'{label}: {sample}')
        all_ok_14 = False

if all_ok_14:
    ok('All com-source divs closed; no leaked com-notes')

# ═══════════════════════════════════════════════════════════════════════════
# 15. PLACES & TIMELINE PANEL STRUCTURE
# New checks: when a places/timeline panel exists, validate its internal HTML
# ═══════════════════════════════════════════════════════════════════════════
section('15. Places & Timeline Panel Structure')

poi_bad   = []  # poi-panel exists but malformed
tl_bad    = []  # tl-panel exists but malformed
tl_no_cur = []  # tl-panel exists but no current event

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    bnd = h.find('<div class="scholarly-block">'); body = h[:bnd]
    secs = get_sections(body, bnd)

    for si, (s_start, s_end) in enumerate(secs):
        sec = body[s_start:s_end]
        label = f'{book} {ch} s{si+1}'

        # ── Places panel ────────────────────────────────────────────────
        if 'class="anno-panel poi-panel"' in sec:
            # Must have at least one poi-entry
            if 'class="poi-entry"' not in sec:
                poi_bad.append(f'{label}: poi-panel has no poi-entry divs')
            # Must have poi-name and poi-text inside each entry
            entries = re.findall(r'class="poi-entry"(.*?)(?=class="poi-entry"|</div>\s*</div>)',
                                 sec, re.DOTALL)
            for entry in entries:
                if 'poi-name' not in entry:
                    poi_bad.append(f'{label}: poi-entry missing poi-name')
                    break
                if 'poi-text' not in entry:
                    poi_bad.append(f'{label}: poi-entry missing poi-text')
                    break

        # ── Timeline panel ───────────────────────────────────────────────
        if 'class="anno-panel tl-panel"' in sec:
            # Must have tl-visual spine
            if 'class="tl-visual"' not in sec:
                tl_bad.append(f'{label}: tl-panel missing tl-visual wrapper')
            elif 'class="tl-spine"' not in sec:
                tl_bad.append(f'{label}: tl-panel missing tl-spine')
            # Must have at least 3 tl-event entries for useful context
            elif len(re.findall(r'class="tl-event', sec)) < 3:
                tl_bad.append(f'{label}: tl-panel has fewer than 3 events (insufficient context)')
            # Must have exactly one current event
            cur_events = re.findall(r'class="tl-event current"', sec)
            if len(cur_events) == 0:
                tl_no_cur.append(f'{label}: no current event marked')
            elif len(cur_events) > 1:
                tl_no_cur.append(f'{label}: {len(cur_events)} current events (should be 1)')
            # Current event must have tl-text explanation
            if len(cur_events) == 1:
                cur_m = re.search(r'class="tl-event current"(.*?)(?=class="tl-event|</div>\s*</div>\s*</div>)',
                                  sec, re.DOTALL)
                if cur_m and 'class="tl-text"' not in cur_m.group(1):
                    tl_bad.append(f'{label}: current tl-event has no tl-text explanation')
            # tl-range and tl-caption should be present
            if 'class="tl-range"' not in sec:
                tl_bad.append(f'{label}: tl-panel missing tl-range date labels')

missing_tl_css  = []
missing_poi_css = []
# CSS may be inline or in external styles.css
_ext_css = ''
if os.path.exists(os.path.join(REPO, 'styles.css')):
    with open(os.path.join(REPO, 'styles.css')) as f: _ext_css = f.read()
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    if '<style>' in h:
        css = h[h.find('<style>'):h.find('</style>')]
    else:
        css = _ext_css
    if 'class="anno-panel tl-panel"' in h and 'tl-visual' not in css:
        missing_tl_css.append(f'{book} {ch}')
    if 'class="anno-panel poi-panel"' in h and 'poi-entry' not in css:
        missing_poi_css.append(f'{book} {ch}')

all_ok_15 = True
for bad_list, label in [
    (missing_tl_css,  'Timeline panel present but tl-visual CSS missing'),
    (missing_poi_css, 'Places panel present but poi-entry CSS missing'),
    (poi_bad,   'Places panel structural issues'),
    (tl_bad,    'Timeline panel structural issues'),
    (tl_no_cur, 'Timeline panel missing/duplicate current event'),
]:
    if bad_list:
        sample = ', '.join(bad_list[:3]) + ('...' if len(bad_list) > 3 else '')
        fail(f'{label}: {sample}')
        all_ok_15 = False

# Count how many sections actually have these panels (informational)
poi_count = sum(1 for p,b,c in chapters
                for content in [open(p).read()]
                for sec in [content[:content.find('<div class="scholarly-block">')]]
                if 'class="anno-panel poi-panel"' in sec)
tl_count  = sum(1 for p,b,c in chapters
                for content in [open(p).read()]
                for sec in [content[:content.find('<div class="scholarly-block">')]]
                if 'class="anno-panel tl-panel"' in sec)

if all_ok_15:
    ok(f'All places/timeline panels valid ({poi_count} place panels, {tl_count} timeline panels)')

# ═══════════════════════════════════════════════════════════════════════════
# 16. HOMEPAGE STRUCTURAL CHECKS
# ═══════════════════════════════════════════════════════════════════════════
section('16. Homepage Structural Checks')

# Load external homepage files if they exist
_hp_css_path = f'{REPO}/homepage.css'
_hp_js_path = f'{REPO}/homepage.js'
_hp_css = open(_hp_css_path).read() if os.path.exists(_hp_css_path) else ''
_hp_js = open(_hp_js_path).read() if os.path.exists(_hp_js_path) else ''
_hp_all = idx + _hp_css + _hp_js  # combined content for checks

if '.book-item.open .chapter-list' not in _hp_all:
    fail('index.html: .book-item.open .chapter-list rule missing')
else:
    ok('.book-item.open .chapter-list rule present')

if 'item.label' not in _hp_all:
    fail('index.html: continue-reading chip does not read item.label')
else:
    ok('Continue-reading chip reads item.label')

for fn in ['handleSearch', 'VERSES_ALL']:
    if fn in _hp_all: ok(f'{fn} present in homepage')
    else: fail(f'homepage: {fn} missing')

if 'continue-bar' in _hp_all:
    ok('Continue reading bar present')
else:
    warn('Continue reading bar not found')

# Testament + book dropdown scroll guards
if "block:'start'" in _hp_all and 'toggleTestament' in _hp_all:
    ok('toggleTestament scroll guard present (dropdowns open downward)')
else:
    fail("homepage: toggleTestament missing scroll guard — dropdowns may open off-screen upward. "
         "Add: if (rect.top < 60) grp.scrollIntoView({behavior:'smooth', block:'start'})")

if "block:'start'" in _hp_all and 'toggleBook' in _hp_all and 'getBoundingClientRect' in _hp_all:
    ok('toggleBook scroll guard present (chapter list opens downward)')
else:
    fail("homepage: toggleBook missing scroll guard — chapter list may open off-screen upward. "
         "Add rect.top < 60 guard with scrollIntoView block:'start'")

# ═══════════════════════════════════════════════════════════════════════════
# 17. SCHOLAR BIO PAGES + COMMENTATOR CSS
# ═══════════════════════════════════════════════════════════════════════════
import importlib, sys as _sys
_sys.path.insert(0, os.path.join(REPO, '_tools'))
import shared as _shared; _shared = importlib.reload(_shared)

# Collect all book-specific scholars actually in use
_live_books = set()
for bd, bn, tot, live, testament, td in _shared.REGISTRY:
    if live > 0:
        _live_books.add(bd)

_used_scholars = set()
for key, scope in _shared.COMMENTATOR_SCOPE.items():
    if scope == 'all':
        continue  # universal scholars don't need individual bios (except macarthur/calvin/netbible which already have them)
    if isinstance(scope, list):
        if any(b in _live_books for b in scope):
            _used_scholars.add(key)

# Check bio pages exist
_bio_dir = os.path.join(REPO, 'commentators')
_missing_bios = []
for key in sorted(_used_scholars):
    bio_path = os.path.join(_bio_dir, f'{key}.html')
    if not os.path.exists(bio_path):
        _missing_bios.append(key)

if _missing_bios:
    warn(f"Scholar bio pages missing in commentators/: {', '.join(_missing_bios)}")
else:
    ok(f'All {len(_used_scholars)} book-specific scholars have bio pages')

# Check index.html cards (either hardcoded or dynamically loaded via scholar-data.js)
_idx_path = os.path.join(_bio_dir, 'index.html')
if os.path.exists(_idx_path):
    with open(_idx_path) as _f: _idx_content = _f.read()
    if 'scholar-data.js' in _idx_content and 'hub-grid-target' in _idx_content:
        ok(f'All {len(_used_scholars)} scholars have index cards (dynamic via scholar-data.js)')
    else:
        _missing_cards = [k for k in sorted(_used_scholars) if f'href="{k}.html"' not in _idx_content]
        if _missing_cards:
            warn(f"Scholar cards missing in commentators/index.html: {', '.join(_missing_cards)}")
        else:
            ok(f'All {len(_used_scholars)} scholars have index cards')

# Check CSS button colors exist in styles.css (or shared.py for legacy)
_css_sources = ''
_styles_file = os.path.join(REPO, 'styles.css')
if os.path.exists(_styles_file):
    with open(_styles_file) as _f: _css_sources += _f.read()
with open(os.path.join(REPO, '_tools', 'shared.py')) as _f: _css_sources += _f.read()
_missing_css = [k for k in sorted(_used_scholars) if f'.anno-trigger.{k}' not in _css_sources]
if _missing_css:
    warn(f"Commentator CSS missing for: {', '.join(_missing_css)}")
else:
    ok(f'All {len(_used_scholars)} scholars have button CSS colors')


# ═══════════════════════════════════════════════════════════════════════════
# 18. VERSE FILE INTEGRITY + TRANSLATION TOGGLE
# ═══════════════════════════════════════════════════════════════════════════
import glob as _glob

# Check all ESV+NIV verse files for space-in-var-name bugs
_bad_vars = []
for _vpath in sorted(_glob.glob(os.path.join(REPO, 'verses', '*', '*', '*.js'))):
    with open(_vpath) as _vf: _vline = _vf.readline()
    _vm = re.match(r'var\s+(.*?)=', _vline)
    if _vm and ' ' in _vm.group(1).strip():
        _bad_vars.append(os.path.relpath(_vpath, REPO))
if _bad_vars:
    fail(f"Space in JS var name in verse files: {', '.join(_bad_vars)}")
else:
    ok('All verse files have valid JS variable names')

# Check BOOK_VARS in translation.js has no spaces
with open(os.path.join(REPO, 'translation.js')) as _tf: _tx = _tf.read()
_bv_match = re.search(r"BOOK_VARS\s*=\s*\[([^\]]+)\]", _tx)
if _bv_match:
    _bv_entries = re.findall(r"'(VERSES_[^']+)'", _bv_match.group(1))
    _bad_bv = [v for v in _bv_entries if ' ' in v]
    if _bad_bv:
        fail(f"Space in BOOK_VARS entry: {', '.join(_bad_bv)}")
    else:
        ok(f'BOOK_VARS entries all valid ({len(_bv_entries)} books)')

# Check every live book has its BOOK_VARS entry
_live_names = set()
for bd, bn, tot, live, testament, td in _shared.REGISTRY:
    if live > 0:
        _live_names.add('VERSES_' + bn.upper().replace(' ', '_'))
_missing_bv = _live_names - set(_bv_entries) if _bv_match else _live_names
if _missing_bv:
    fail(f"Live books missing from BOOK_VARS: {', '.join(sorted(_missing_bv))}")
else:
    ok(f'All {len(_live_names)} live books registered in BOOK_VARS')

# ═══════════════════════════════════════════════════════════════════════════
# 18. VERSE LOADING INTEGRITY
# Every verse-body span in every chapter must have matching data in its verse file.
# ═══════════════════════════════════════════════════════════════════════════
section('18. Verse Loading Integrity')

_vl_errors = []
for book_dir, book_name, total, live, _test, subdir in _shared.REGISTRY:
    if live == 0: continue
    _vf = os.path.join(REPO, 'verses', 'niv', subdir, f'{book_dir}.js')
    if not os.path.exists(_vf):
        _vl_errors.append(f'{book_name}: verse file missing')
        continue
    with open(_vf) as _f: _vjs = _f.read()
    _var_name = f'VERSES_{book_dir.upper()}'
    if f'var {_var_name}=' not in _vjs and f'var {_var_name} =' not in _vjs:
        _vl_errors.append(f'{book_name}: variable {_var_name} not found')
        continue
    _data_keys = set(re.findall(r'"book":"([^"]+)","ch":(\d+),"v":(\d+)', _vjs))
    _data_keys = {f'{b} {c}:{v}' for b, c, v in _data_keys}
    for ch in range(1, live + 1):
        _cf = os.path.join(REPO, subdir, book_dir, f'{book_name.replace(" ","_")}_{ch}.html')
        if not os.path.exists(_cf): continue
        with open(_cf) as _f: _ch = _f.read()
        if f'verses/niv/{subdir}/{book_dir}.js' not in _ch:
            _vl_errors.append(f'{book_name} {ch}: missing verse file script tag')
        if 'translation.js' not in _ch:
            _vl_errors.append(f'{book_name} {ch}: missing translation.js')
        _bodies = re.findall(r'data-book="([^"]+)"\s*data-ch="(\d+)"\s*data-v="(\d+)"', _ch)
        if not _bodies:
            _vl_errors.append(f'{book_name} {ch}: no verse-body spans')
            continue
        for _b, _c, _v in _bodies:
            if f'{_b} {_c}:{_v}' not in _data_keys:
                _vl_errors.append(f'{book_name} {ch}: verse {_b} {_c}:{_v} has no data')
                break  # one per chapter is enough

if _vl_errors:
    fail(f'Verse loading issues ({len(_vl_errors)}):')
    for _e in _vl_errors[:5]: fail(f'  {_e}')
else:
    ok(f'All {sum(1 for _,_,_,l,_,_ in _shared.REGISTRY if l > 0)} books pass verse loading integrity')

# ESV coverage: every live chapter should have ESV data too
_esv_gaps = []
for book_dir, book_name, total, live, _test, subdir in _shared.REGISTRY:
    if live == 0: continue
    _ef = os.path.join(REPO, 'verses', 'esv', subdir, f'{book_dir}.js')
    if not os.path.exists(_ef):
        _esv_gaps.append(f'{book_name}: ESV file missing')
        continue
    with open(_ef) as _f: _ejs = _f.read()
    _esv_chs = set(int(m) for m in re.findall(r'"ch":(\d+)', _ejs))
    for ch in range(1, live + 1):
        if ch not in _esv_chs:
            _esv_gaps.append(f'{book_name} {ch}: missing from ESV data')
if _esv_gaps:
    fail(f'ESV verse gaps ({len(_esv_gaps)}):')
    for _g in _esv_gaps[:5]: fail(f'  {_g}')
else:
    ok(f'ESV verse data complete for all {sum(1 for _,_,_,l,_,_ in _shared.REGISTRY if l > 0)} live books')

# ═══════════════════════════════════════════════════════════════════════════
# RESULT
# ═══════════════════════════════════════════════════════════════════════════
print(f"\n{'═' * 52}")
if failures:
    print(f'\033[91m  AUDIT FAILED — {len(failures)} issue(s). Fix before committing.\033[0m')
    for f in failures:
        print(f'    • {f}')
    sys.exit(1)
elif warnings:
    print(f'\033[93m  AUDIT PASSED with {len(warnings)} warning(s).\033[0m')
    for w in warnings:
        print(f'    ⚠  {w}')
    sys.exit(0)
else:
    print(f'\033[92m  AUDIT PASSED — all checks clean. Safe to commit.\033[0m')
    sys.exit(0)
