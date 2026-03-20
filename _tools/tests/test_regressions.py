"""
Regression tests for ScriptureDeepDive build system.

Run:  python3 _tools/tests/test_regressions.py
Exit: 0 on success, 1 on failure

These tests catch bugs that have occurred in the past and must never recur.
Each test documents the original bug and the fix.
"""
import sys, os, re, glob, json

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO, '_tools'))

passes = 0
fails = 0

def ok(msg):
    global passes
    passes += 1
    print(f'  \033[92m✓\033[0m {msg}')

def fail(msg):
    global fails
    fails += 1
    print(f'  \033[91m✗\033[0m {msg}')


# ═══════════════════════════════════════════════════════════════════════════
# TEST 1: qnav.js contains all 6 required global functions
# Bug: rebuild_qnav_js() silently dropped functions when marker comment was
#      missing. openQnav/closeQnav/qnavFilter etc became undefined, breaking
#      search and cascading to break ESV toggle. Fixed SW 2.148.
# ═══════════════════════════════════════════════════════════════════════════

print('\n1. qnav.js global functions')
qnav_path = os.path.join(REPO, 'qnav.js')
with open(qnav_path) as f:
    qnav = f.read()

required_fns = ['openQnav', 'closeQnav', 'qnavToggleBook',
                'qnavToggleTestament', 'qnavFilter', 'loadAllVerses']
for fn in required_fns:
    if f'function {fn}' in qnav:
        ok(f'{fn}() defined')
    else:
        fail(f'{fn}() MISSING — search/nav will break')

# Also verify rebuild preserves them
import importlib, shared
shared = importlib.reload(shared)
shared.rebuild_qnav_js()
with open(qnav_path) as f:
    qnav_after = f.read()
for fn in required_fns:
    if f'function {fn}' not in qnav_after:
        fail(f'{fn}() lost after rebuild_qnav_js() — the old bug is back!')


# ═══════════════════════════════════════════════════════════════════════════
# TEST 2: No verse files have spaces in URL paths
# Bug: ESV verse files for spaced book names (1 Samuel, 2 Kings, etc.) had
#      URLs like "ot/1 samuel/1 Samuel_1.html" instead of underscored paths.
#      This caused 404s on ESV toggle. Fixed SW 2.148.
# ═══════════════════════════════════════════════════════════════════════════

print('\n2. Verse file URL integrity')
bad_urls = []
for f in sorted(glob.glob(os.path.join(REPO, 'verses', '*', '*', '*.js'))):
    with open(f) as fh:
        raw = fh.read()
    urls = re.findall(r'"url":"([^"]+)"', raw)
    for u in urls:
        if ' ' in u:
            bad_urls.append((os.path.relpath(f, REPO), u))
            break  # one per file is enough

if bad_urls:
    for path, url in bad_urls[:5]:
        fail(f'Space in URL: {path} → {url}')
else:
    ok(f'No spaces in verse file URLs')


# ═══════════════════════════════════════════════════════════════════════════
# TEST 3: External CSS — no chapter has inline <style> blocks
# Bug: 43KB of CSS was duplicated into every chapter HTML file (18MB total).
#      Extracted to styles.css in Batch 3 (SW 2.149).
# ═══════════════════════════════════════════════════════════════════════════

print('\n3. External stylesheet')
styles_path = os.path.join(REPO, 'styles.css')
if os.path.exists(styles_path):
    ok('styles.css exists')
    with open(styles_path) as f:
        css = f.read()
    if len(css) > 10000:
        ok(f'styles.css has content ({len(css):,} chars)')
    else:
        fail(f'styles.css suspiciously small ({len(css)} chars)')
else:
    fail('styles.css MISSING')

inline_style_count = 0
missing_link_count = 0
for html_path in glob.glob(os.path.join(REPO, 'ot', '*', '*.html')) + \
                 glob.glob(os.path.join(REPO, 'nt', '*', '*.html')):
    if not re.search(r'_\d+\.html$', html_path):
        continue
    with open(html_path) as f:
        h = f.read()
    if '<style>' in h:
        inline_style_count += 1
    if 'styles.css' not in h:
        missing_link_count += 1

if inline_style_count == 0:
    ok('No chapters have inline <style> blocks')
else:
    fail(f'{inline_style_count} chapters still have inline <style>')

if missing_link_count == 0:
    ok('All chapters link to styles.css')
else:
    fail(f'{missing_link_count} chapters missing styles.css link')


# ═══════════════════════════════════════════════════════════════════════════
# TEST 4: External JS — tog.js and history.js
# Ensures inline scripts aren't baked back in during regen.
# ═══════════════════════════════════════════════════════════════════════════

print('\n4. External JS files')
for js_file in ['tog.js', 'history.js']:
    path = os.path.join(REPO, js_file)
    if os.path.exists(path):
        ok(f'{js_file} exists')
    else:
        fail(f'{js_file} MISSING')

# Spot-check a few chapters for external refs
sample_files = glob.glob(os.path.join(REPO, 'ot', 'genesis', 'Genesis_*.html'))[:3]
for sf in sample_files:
    with open(sf) as f:
        h = f.read()
    name = os.path.basename(sf)
    if 'tog.js' in h:
        ok(f'{name} loads tog.js')
    else:
        fail(f'{name} missing tog.js reference')
    if 'function tog(' in h:
        fail(f'{name} still has INLINE tog() — should be external')


# ═══════════════════════════════════════════════════════════════════════════
# TEST 5: Service worker CORE includes all external assets
# ═══════════════════════════════════════════════════════════════════════════

print('\n5. Service worker CORE assets')
sw_path = os.path.join(REPO, 'service-worker.js')
with open(sw_path) as f:
    sw = f.read()

required_assets = ['/styles.css', '/tog.js', '/history.js',
                   '/qnav.js', '/translation.js', '/books.js']
for asset in required_assets:
    if asset in sw:
        ok(f'{asset} in SW CORE')
    else:
        fail(f'{asset} MISSING from SW CORE')


# ═══════════════════════════════════════════════════════════════════════════
# TEST 6: config.py constants are accessible via shared.py
# ═══════════════════════════════════════════════════════════════════════════

print('\n6. config.py integration')
for const in ['COMMENTATOR_SCOPE', 'BOOK_META', 'PEOPLE_BIO']:
    if hasattr(shared, const):
        val = getattr(shared, const)
        if isinstance(val, dict) and len(val) > 0:
            ok(f'shared.{const}: {len(val)} entries')
        else:
            fail(f'shared.{const} is empty or wrong type')
    else:
        fail(f'shared.{const} not accessible')


# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

print(f'\n{"═"*50}')
if fails == 0:
    print(f'\033[92m  ALL {passes} TESTS PASSED\033[0m')
else:
    print(f'\033[91m  {fails} FAILED, {passes} passed\033[0m')
print()

sys.exit(1 if fails > 0 else 0)
