"""
audit_search.py — Scripture Deep Dive homepage search integrity checker

Checks:
  1. Script sources      — index.html <script src> files all exist on disk
  2. VERSES_ALL export   — verses/niv/verses.js exports the VERSES_ALL variable
  3. CHAPTERS_ALL export — verses/chapters.js exports the CHAPTERS_ALL variable
  4. Chapter coverage    — CHAPTERS_ALL contains every live chapter (per REGISTRY)
  5. Chapter data        — every entry has non-empty url, ref, and titles
  6. Chapter url validity— every CHAPTERS_ALL url points to an existing file
  7. Live verse coverage — VERSES_ALL has at least one verse for each live book
  8. Live verse urls     — every live-book verse url points to an existing file
  9. Dead verse links    — no verse in VERSES_ALL links to a non-live chapter
 10. SW precache         — service-worker.js CORE includes both search data files
 11. Search wiring       — handleSearch references VERSES_ALL, CHAPTERS_ALL, LIVE_BOOKS
 12. Input wiring        — search <input> calls handleSearch

Run:  python3 _tools/audit_search.py
"""
import re, os, glob, sys, json

REPO  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS  = '\033[92m  ✓\033[0m'
FAIL  = '\033[91m  ✗\033[0m'
WARN  = '\033[93m  ⚠\033[0m'

issues   = []
warnings = []

def err(msg):  issues.append(msg)
def warn(msg): warnings.append(msg)

def section(title):
    print(f'\n\033[1m{title}\033[0m')
    print('─' * 55)

# ── Load shared data ─────────────────────────────────────────────────────────
section('Loading data')

# REGISTRY from shared.py
with open(os.path.join(REPO, '_tools', 'shared.py')) as f:
    shared_src = f.read()
registry = re.findall(
    r"\('(\w+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*'(OT|NT)',\s*'(\w+)'\)", shared_src)
live_books = {r[0]: {'name':r[1],'total':int(r[2]),'live':int(r[3]),'testament':r[4],'subdir':r[5]}
              for r in registry if int(r[3]) > 0}
expected_chapter_count = sum(b['live'] for b in live_books.values())
print(f'  Live books: {len(live_books)}  ({", ".join(live_books.keys())})')
print(f'  Expected chapters: {expected_chapter_count}')

# index.html
with open(os.path.join(REPO, 'index.html')) as f:
    index_html = f.read()

# service-worker.js
with open(os.path.join(REPO, 'service-worker.js')) as f:
    sw_src = f.read()

# ── Check 1: Script src files exist ─────────────────────────────────────────
section('Check 1: Script source files exist')
script_srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', index_html)
src_ok = src_fail = 0
for src in script_srcs:
    path = os.path.join(REPO, src.lstrip('/'))
    if os.path.exists(path):
        src_ok += 1
    else:
        err(f'  Script src not found on disk: {src}')
        src_fail += 1

if src_fail == 0:
    print(f'{PASS} All {src_ok} script sources exist on disk')
    for s in script_srcs:
        print(f'    {s}')
else:
    print(f'{FAIL} {src_fail} missing script sources ({src_ok} OK):')
    for i in issues[-src_fail:]:
        print(i)

# ── Check 2: VERSES_ALL export ───────────────────────────────────────────────
section('Check 2: verses/niv/verses.js exports VERSES_ALL')
verses_js_path = os.path.join(REPO, 'verses', 'niv', 'verses.js')
if not os.path.exists(verses_js_path):
    err(f'  verses/niv/verses.js NOT FOUND')
    print(f'{FAIL} verses/niv/verses.js not found')
else:
    with open(verses_js_path) as f:
        verses_js = f.read()
    has_export = 'VERSES_ALL' in verses_js
    verse_count = len(re.findall(r'"ref":', verses_js))
    if has_export:
        print(f'{PASS} VERSES_ALL exported — {verse_count:,} verse entries')
    else:
        err('  verses/niv/verses.js does not export VERSES_ALL')
        print(f'{FAIL} VERSES_ALL not found in verses/niv/verses.js')

# ── Check 3: CHAPTERS_ALL export ─────────────────────────────────────────────
section('Check 3: verses/chapters.js exports CHAPTERS_ALL')
chapters_js_path = os.path.join(REPO, 'verses', 'chapters.js')
chapters_data = []
if not os.path.exists(chapters_js_path):
    err('  verses/chapters.js NOT FOUND')
    print(f'{FAIL} verses/chapters.js not found')
else:
    with open(chapters_js_path) as f:
        chapters_js = f.read()
    if 'CHAPTERS_ALL' not in chapters_js:
        err('  verses/chapters.js does not export CHAPTERS_ALL')
        print(f'{FAIL} CHAPTERS_ALL not found in verses/chapters.js')
    else:
        # Parse JSON data
        m = re.search(r'const CHAPTERS_ALL=(\[.*\]);', chapters_js, re.DOTALL)
        if m:
            try:
                chapters_data = json.loads(m.group(1))
                print(f'{PASS} CHAPTERS_ALL exported — {len(chapters_data)} chapter entries')
            except json.JSONDecodeError as e:
                err(f'  CHAPTERS_ALL JSON parse error: {e}')
                print(f'{FAIL} CHAPTERS_ALL JSON invalid: {e}')

# ── Check 4: Chapter coverage ─────────────────────────────────────────────────
section('Check 4: CHAPTERS_ALL covers every live chapter')
if chapters_data:
    # Build set of (book, ch) from chapters_data
    indexed = {(c['book'], c['ch']) for c in chapters_data}
    missing_chapters = []
    extra_ok = 0
    for book_dir, info in live_books.items():
        book_name = info['name']
        for ch in range(1, info['live'] + 1):
            if (book_name, ch) not in indexed:
                missing_chapters.append(f'{book_name} {ch}')
            else:
                extra_ok += 1

    if not missing_chapters:
        print(f'{PASS} All {extra_ok} live chapters indexed in CHAPTERS_ALL')
    else:
        print(f'{FAIL} {len(missing_chapters)} live chapters missing from CHAPTERS_ALL:')
        for c in missing_chapters[:10]:
            err(f'  Missing from CHAPTERS_ALL: {c}')
            print(f'    {c}')
        if len(missing_chapters) > 10:
            print(f'    ... and {len(missing_chapters)-10} more')
else:
    print(f'{WARN} Skipped — CHAPTERS_ALL not loaded')

# ── Check 5: Chapter data quality ────────────────────────────────────────────
section('Check 5: Chapter data quality (url, ref, titles)')
if chapters_data:
    missing_url = missing_ref = missing_titles = 0
    for c in chapters_data:
        if not c.get('url'):  missing_url += 1
        if not c.get('ref'):  missing_ref += 1
        if not c.get('titles') or len(c['titles']) == 0: missing_titles += 1

    total = len(chapters_data)
    if missing_url + missing_ref + missing_titles == 0:
        print(f'{PASS} All {total} chapters have url, ref, and titles')
    else:
        if missing_url:
            err(f'  {missing_url} chapters missing url field')
            print(f'{FAIL} {missing_url} chapters missing url')
        if missing_ref:
            err(f'  {missing_ref} chapters missing ref field')
            print(f'{FAIL} {missing_ref} chapters missing ref')
        if missing_titles:
            warn(f'  {missing_titles} chapters have no section titles')
            print(f'{WARN} {missing_titles} chapters have empty titles list')
else:
    print(f'{WARN} Skipped — CHAPTERS_ALL not loaded')

# ── Check 6: Chapter url validity ─────────────────────────────────────────────
section('Check 6: CHAPTERS_ALL urls exist on disk')
if chapters_data:
    url_ok = url_fail = 0
    bad_urls = []
    for c in chapters_data:
        path = os.path.join(REPO, c.get('url', ''))
        if os.path.exists(path):
            url_ok += 1
        else:
            bad_urls.append(c.get('url', '(empty)'))
            url_fail += 1

    if url_fail == 0:
        print(f'{PASS} All {url_ok} chapter urls resolve to existing files')
    else:
        print(f'{FAIL} {url_fail} chapter urls point to missing files ({url_ok} OK):')
        for u in bad_urls[:5]:
            err(f'  Chapter url not found: {u}')
            print(f'    {u}')
else:
    print(f'{WARN} Skipped — CHAPTERS_ALL not loaded')

# ── Check 7: Live verse coverage ──────────────────────────────────────────────
section('Check 7: VERSES_ALL has verses for every live book')
if os.path.exists(verses_js_path):
    with open(verses_js_path) as f:
        verses_js = f.read()
    # Check each live book appears in urls
    book_coverage_ok = book_coverage_fail = 0
    for book_dir, info in live_books.items():
        book_name = info['name']
        subdir    = info['subdir']
        # URL pattern: ot/genesis/Genesis_1.html
        pattern = f'{subdir}/{book_dir}/'
        if pattern in verses_js:
            book_coverage_ok += 1
        else:
            err(f'  No verses found for live book: {book_name} ({pattern})')
            book_coverage_fail += 1

    if book_coverage_fail == 0:
        print(f'{PASS} All {book_coverage_ok} live books have verses in VERSES_ALL')
    else:
        print(f'{FAIL} {book_coverage_fail} live books missing from VERSES_ALL:')
        for i in issues[-book_coverage_fail:]:
            print(i)
else:
    print(f'{WARN} Skipped — verses/niv/verses.js not found')

# ── Check 8: Live verse url validity (sample) ────────────────────────────────
section('Check 8: Live-book verse urls exist on disk (sampled)')
if os.path.exists(verses_js_path):
    # Parse a sample of live-book verse URLs
    live_dirs = set()
    for book_dir, info in live_books.items():
        live_dirs.add(f'{info["subdir"]}/{book_dir}/')

    # Extract all urls from verses.js
    all_verse_urls = re.findall(r'"url":"([^"]+)"', verses_js)
    live_verse_urls = [u for u in all_verse_urls
                       if any(u.startswith(d) for d in live_dirs)]

    # Sample every 50th URL to avoid checking 10k files
    sample = live_verse_urls[::50]
    sample_ok = sample_fail = 0
    bad_verse_urls = []
    for url in sample:
        path = os.path.join(REPO, url)
        if os.path.exists(path):
            sample_ok += 1
        else:
            bad_verse_urls.append(url)
            sample_fail += 1

    if sample_fail == 0:
        print(f'{PASS} {sample_ok} sampled live-chapter verse urls valid'
              f' (of {len(live_verse_urls):,} total)')
    else:
        print(f'{FAIL} {sample_fail} sampled verse urls point to missing files:')
        for u in bad_verse_urls[:5]:
            err(f'  Verse url missing: {u}')
            print(f'    {u}')
else:
    print(f'{WARN} Skipped — verses/niv/verses.js not found')

# ── Check 9: No dead verse links from non-live books ─────────────────────────
section('Check 9: Search filters verses to live chapters only')
# Check that the LIVE_BOOKS set in handleSearch matches REGISTRY
live_books_in_js = re.search(
    r"const LIVE_BOOKS = new Set\(\[([^\]]+)\]\)", index_html)
if live_books_in_js:
    js_books = set(re.findall(r"'([\w-]+)'", live_books_in_js.group(1)))
    registry_books = set(live_books.keys())
    missing_from_filter = registry_books - js_books
    extra_in_filter = js_books - registry_books

    if not missing_from_filter and not extra_in_filter:
        print(f'{PASS} LIVE_BOOKS filter in handleSearch matches REGISTRY exactly')
        print(f'    {sorted(js_books)}')
    else:
        if missing_from_filter:
            warn(f'  Live books in REGISTRY but NOT in JS filter: {missing_from_filter}')
            print(f'{WARN} Books missing from JS filter: {missing_from_filter}')
        if extra_in_filter:
            warn(f'  Books in JS filter but NOT live in REGISTRY: {extra_in_filter}')
            print(f'{WARN} Extra books in JS filter: {extra_in_filter}')
else:
    err('  LIVE_BOOKS filter not found in handleSearch')
    print(f'{FAIL} LIVE_BOOKS filter missing from handleSearch')

# ── Check 10: SW precache ─────────────────────────────────────────────────────
section('Check 10: SW CORE precaches search data files')
core_m = re.search(r'const CORE = \[(.*?)\];', sw_src, re.DOTALL)
if core_m:
    core = core_m.group(1)
    required = ['/verses/niv/verses.js', '/verses/chapters.js']
    sw_ok = sw_fail = 0
    for req in required:
        if req in core:
            print(f'{PASS} {req} in SW CORE')
            sw_ok += 1
        else:
            err(f'  SW CORE missing: {req}')
            print(f'{FAIL} {req} NOT in SW CORE')
            sw_fail += 1
else:
    err('  CORE array not found in service-worker.js')
    print(f'{FAIL} CORE array not found in service-worker.js')

# ── Check 11: handleSearch wiring ────────────────────────────────────────────
section('Check 11: handleSearch references required components')
hs_match = re.search(r'function handleSearch\(q\)\s*\{(.*?)\nfunction ', index_html, re.DOTALL)
if hs_match:
    fn_body = hs_match.group(1)
    required_refs = {
        'VERSES_ALL':   'window.VERSES_ALL',
        'CHAPTERS_ALL': 'window.CHAPTERS_ALL',
        'LIVE_BOOKS':   'LIVE_BOOKS',
        'unified-results': 'unified-results panel',
        'library-grid': 'library-grid hide',
    }
    fn_ok = fn_fail = 0
    for key, label in required_refs.items():
        if key in fn_body:
            fn_ok += 1
        else:
            err(f'  handleSearch missing: {label} ({key})')
            fn_fail += 1
            print(f'{FAIL} handleSearch missing reference to {key}')

    if fn_fail == 0:
        print(f'{PASS} handleSearch references all required components ({fn_ok} checks)')
else:
    err('  handleSearch function not found in index.html')
    print(f'{FAIL} handleSearch not found in index.html')

# ── Check 12: Search input wiring ────────────────────────────────────────────
section('Check 12: Search input calls handleSearch')
input_m = re.search(r'<input[^>]+id="bookSearch"[^>]*>', index_html)
if input_m:
    input_tag = input_m.group(0)
    if 'handleSearch' in input_tag:
        # Verify it passes value
        if 'this.value' in input_tag or 'value' in input_tag:
            print(f'{PASS} Search input wired correctly to handleSearch(this.value)')
        else:
            warn('  Search input calls handleSearch but may not pass value correctly')
            print(f'{WARN} Search input calls handleSearch but check value passing')
    else:
        err('  Search input does not call handleSearch')
        print(f'{FAIL} Search input missing oninput="handleSearch(..."')
else:
    err('  Search input #bookSearch not found in index.html')
    print(f'{FAIL} #bookSearch input not found in index.html')

# ── Summary ───────────────────────────────────────────────────────────────────
print(f'\n{"="*55}')
if not issues:
    print(f'\033[92m  AUDIT PASSED — {len(warnings)} warning(s).\033[0m')
    for w in warnings:
        print(f'    ⚠  {w.strip()}')
else:
    print(f'\033[91m  AUDIT FAILED — {len(issues)} issue(s), {len(warnings)} warning(s).\033[0m')
    print('\n  Issues requiring fixes:')
    for i in issues:
        print(f'    •  {i.strip()}')
    if warnings:
        print('\n  Warnings:')
        for w in warnings:
            print(f'    ⚠  {w.strip()}')
sys.exit(1 if issues else 0)
