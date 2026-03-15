#!/usr/bin/env python3
"""
Scripture Deep Dive — Pre-commit Audit Script
Run: python3 audit.py
All checks must pass before committing.
Add new checks whenever a new class of bug is found.
"""

import re, os, sys

REPO = os.path.dirname(os.path.abspath(__file__))

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

def chapter_paths():
    paths = []
    for book_dir, book_name, chapters in [
        ('genesis',  'Genesis',  range(1, 51)),
        ('exodus',   'Exodus',   range(1, 41)),
        ('proverbs', 'Proverbs', range(1, 32)),
        ('ruth',     'Ruth',     range(1,  5)),
        ('matthew',  'Matthew',  range(1, 21)),
    ]:
        for ch in chapters:
            p = f'{REPO}/{book_dir}/{book_name}_{ch}.html'
            if os.path.exists(p):
                paths.append((p, book_name, ch))
    return paths

def count_verses_in_sections(html):
    boundary = html.find('<div class="scholarly-block">')
    if boundary == -1:
        boundary = html.rfind('</main>')
    return len(re.findall(r'class="verse-text"', html[:boundary]))

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
    # Proverbs — add as chapters go live
    ('Ruth', 1):22,('Ruth', 2):23,('Ruth', 3):18,('Ruth', 4):22,
    ('Proverbs', 1):33,('Proverbs', 2):22,('Proverbs', 3):35,
    ('Proverbs', 4):27,('Proverbs', 5):23,('Proverbs', 6):35,
    ('Proverbs', 7):27,('Proverbs', 8):36,('Proverbs', 9):18,
    ('Proverbs',10):32,
    ('Proverbs',11):31,('Proverbs',12):28,('Proverbs',13):25,
    ('Proverbs',14):35,('Proverbs',15):33,('Proverbs',16):33,
    ('Proverbs',17):28,('Proverbs',18):24,('Proverbs',19):29,
    ('Proverbs',20):30,
    ('Proverbs',21):31,('Proverbs',22):29,('Proverbs',23):35,
    ('Proverbs',24):34,('Proverbs',25):28,('Proverbs',26):28,
    ('Proverbs',27):27,('Proverbs',28):28,('Proverbs',29):27,
    ('Proverbs',30):33,('Proverbs',31):31,
    ('Matthew', 1):25,('Matthew', 2):23,('Matthew', 3):17,('Matthew', 4):25,('Matthew', 5):48,
    ('Matthew', 6):34,('Matthew', 7):29,('Matthew', 8):34,('Matthew', 9):38,('Matthew',10):42,
}

chapters = chapter_paths()

# ═══════════════════════════════════════════════════════════════════════════
# 1. HTML STRUCTURE
# ═══════════════════════════════════════════════════════════════════════════
section('1. HTML Structure')

style_errors = dup_errors = orphan_errors = 0

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    label = f'{book} {ch}'

    # Single <style> block
    if h.count('<style>') != 1:
        fail(f'{label}: {h.count("<style>")} <style> blocks (expected 1)')
        style_errors += 1

    # Orphaned legend — broken legend-item has no text label after the dot div
    # Good:    <div class="legend-item"><div class="legend-dot ..."></div>Hebrew</div>
    # Broken:  <div class="legend-item"><div class="legend-dot ..."></div>\n  (no text before </div>)
    main_start = h.find('<main>')
    if main_start > -1:
        main_html = h[main_start:]
        if re.search(r'<div class="legend-item"><div class="legend-dot[^"]*"></div>\s*\n\s*<div', main_html):
            fail(f'{label}: orphaned/broken legend-item in <main>')
            orphan_errors += 1

    # No loose text fragments from botched removals
    body = h[h.find('</style>'):]
    for frag in ['Available now</div>', 'll-item"><div class="ll-dot']:
        if frag in body:
            fail(f'{label}: orphaned legend text in body')
            orphan_errors += 1

if style_errors == 0:
    ok(f'Single <style> block in all {len(chapters)} chapters')
if orphan_errors == 0:
    ok('No orphaned HTML fragments in chapter pages')

# index.html
with open(f'{REPO}/index.html') as f: idx = f.read()

if idx.count('<style>') != 1:
    fail(f'index.html: {idx.count("<style>")} <style> blocks (expected 1)')
else:
    ok('Single <style> block in index.html')

for marker in ['<!-- HERO -->', '<div id="library-grid">']:
    if idx.count(marker) > 1:
        fail(f'index.html: duplicate {marker!r}')

# ═══════════════════════════════════════════════════════════════════════════
# 2. CSS INTEGRITY
# ═══════════════════════════════════════════════════════════════════════════
section('2. CSS Integrity')

missing_auth = []
missing_mac  = []

for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    css = h[h.find('<style>'):h.find('</style>')]
    if 'authorship-block{' not in css and 'authorship-block {' not in css:
        missing_auth.append(f'{book} {ch}')
    if 'anno-trigger.macarthur' not in css:
        missing_mac.append(f'{book} {ch}')

if missing_auth:
    fail(f'Missing authorship CSS in {len(missing_auth)} chapters: ' +
         ', '.join(missing_auth[:3]) + ('...' if len(missing_auth) > 3 else ''))
else:
    ok('Authorship CSS present in all chapters')

if missing_mac:
    fail(f'Missing MacArthur CSS in {len(missing_mac)} chapters: ' +
         ', '.join(missing_mac[:3]) + ('...' if len(missing_mac) > 3 else ''))
else:
    ok('MacArthur CSS present in all chapters')

# MacArthur panels must have actual content (com-note), not be empty shells
empty_mac = []
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    panels = re.findall(r'class="anno-panel com-panel">(.*?)</div>\s*</div>', h, re.DOTALL)
    for panel in panels:
        if 'com-note' not in panel:
            empty_mac.append(f'{book} {ch}')
            break

if empty_mac:
    fail(f'Empty MacArthur panels (no com-note) in: ' +
         ', '.join(empty_mac[:5]) + ('...' if len(empty_mac) > 5 else ''))
else:
    ok('All MacArthur panels have content')

# ═══════════════════════════════════════════════════════════════════════════
# 3. VERSES.JS — external only, no inline
# ═══════════════════════════════════════════════════════════════════════════
section('3. Verse Index (verses.js)')

vjs_path = f'{REPO}/verses.js'
if not os.path.exists(vjs_path):
    fail('verses.js missing')
else:
    with open(vjs_path) as f: vjs = f.read()
    vc = vjs.count('"ref":')
    if vjs.startswith('const VERSES=[') and vjs.endswith('];'):
        ok(f'verses.js valid — {vc} verses')
    else:
        fail(f'verses.js malformed (starts={vjs[:14]!r}, ends={vjs[-2:]!r})')

inline_v = [f'{b} {c}' for p,b,c in chapters
            if 'const VERSES=' in open(p).read() or 'const VERSES =' in open(p).read()]
if inline_v:
    fail(f'Inline VERSES in {len(inline_v)} chapters: ' + ', '.join(inline_v[:3]))
else:
    ok('No inline VERSES in chapter pages')

if 'const VERSES=' in idx:
    fail('index.html has inline VERSES')
else:
    ok('index.html: no inline VERSES')

missing_ext = [f'{b} {c}' for p,b,c in chapters if '../verses.js' not in open(p).read()]
if missing_ext:
    fail(f'Missing external verses.js in {len(missing_ext)} chapters')
else:
    ok('All chapters load verses.js externally')

if 'src="verses.js"' not in idx:
    fail('index.html missing src="verses.js"')
else:
    ok('index.html loads verses.js externally')

# ═══════════════════════════════════════════════════════════════════════════
# 4. VERSE COUNTS
# ═══════════════════════════════════════════════════════════════════════════
section('4. Verse Counts (NIV)')

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
# 5. NAVIGATION ARROWS
# ═══════════════════════════════════════════════════════════════════════════
section('5. Navigation Arrows')

nav_errors = []
for i, (path, book, ch) in enumerate(chapters):
    with open(path) as f: h = f.read()
    # Find next arrow
    m = re.search(r'class="nav-arrow next([^"]*)"[^>]*href="([^"]*)"', h) or \
        re.search(r'href="([^"]*)"[^>]*class="nav-arrow next([^"]*)"', h)
    if not m: continue
    # Check if a next chapter exists in the same book
    next_exists = (i + 1 < len(chapters) and chapters[i+1][1] == book)
    href = m.group(2) if m.lastindex >= 2 else m.group(1)
    classes = m.group(1) if m.lastindex >= 2 else m.group(2)
    if next_exists and (href == '#' or 'disabled' in classes):
        nav_errors.append(f'{book} {ch}: next arrow disabled but {book} {ch+1} exists')

if nav_errors:
    for e in nav_errors: fail(e)
else:
    ok('No incorrectly disabled next-arrows')

# ═══════════════════════════════════════════════════════════════════════════
# 6. QNAV
# ═══════════════════════════════════════════════════════════════════════════
section('6. Quick Navigation')

qnav_errors = []
for path, book, ch in chapters:
    with open(path) as f: h = f.read()
    if '<div class="qnav-overlay"' not in h:
        qnav_errors.append(f'{book} {ch}: missing qnav-overlay')
    if 'current' not in h:
        qnav_errors.append(f'{book} {ch}: no current chapter highlighted')

if qnav_errors:
    for e in qnav_errors[:5]: fail(e)
else:
    ok('qnav present and current chapter marked in all chapters')

# ═══════════════════════════════════════════════════════════════════════════
# 7. SERVICE WORKER
# ═══════════════════════════════════════════════════════════════════════════
section('7. Service Worker')

with open(f'{REPO}/service-worker.js') as f: sw = f.read()
m = re.search(r"const CACHE = '(scripture-v(\d+))'", sw)
if not m:
    fail('Cannot find SW CACHE version string')
else:
    ok(f'SW version: {m.group(1)}')

if "'/verses.js'" in sw:
    ok('verses.js in SW CORE cache')
else:
    fail("'/verses.js' not in SW CORE cache")

# ═══════════════════════════════════════════════════════════════════════════
# 8. INDEX.HTML
# ═══════════════════════════════════════════════════════════════════════════
section('8. index.html')

# OT/NT both start collapsed by design

for fn in ['handleSearch', 'VERSES.map']:
    if fn in idx: ok(f'{fn} present')
    else: fail(f'index.html: {fn} missing')

if 'continue-bar' in idx:
    ok('Continue reading bar present')
else:
    warn('Continue reading bar not found')

# ═══════════════════════════════════════════════════════════════════════════
# 9. TOG() — both selectors required
# ═══════════════════════════════════════════════════════════════════════════
section('9. tog() Function')

tog_errors = []
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
