def parse_year_from_dates(dates_str):
    """Extract approximate BIRTH year from dates string.
    Reads first year for ranges like "c. 1529-1407 BC" → -1529.
    """
    if not dates_str: return None
    s = dates_str.strip()
    # "20 BC – AD 39": mixed era — birth is the BC year
    m_mixed = re.match(r'(?:c\.\s*)?(\d+)\s*BC', s)
    if m_mixed: return -int(m_mixed.group(1))
    # "c. 45 AD" or "c. 45-100 AD": pure AD range — birth = first number
    m_ad = re.match(r'(?:c\.\s*)?(\d+)(?:-\d+)?\s*AD', s)
    if m_ad: return int(m_ad.group(1))
    # Pure BC range "c. 1529-1407 BC": first number = birth year
    m_bc_range = re.match(r'(?:c\.\s*)?(\d+)-(\d+)\s*BC', s)
    if m_bc_range: return -int(m_bc_range.group(1))
    # Single BC date "c. 1526 BC"
    m_bc = re.match(r'(?:c\.\s*)?(\d+)\s*BC', s)
    if m_bc: return -int(m_bc.group(1))
    return None

"""
audit_people.py — Scripture Deep Dive people/biography accuracy checker

Checks:
  1. Parent chain completeness    — father/mother fields resolve to existing IDs
  2. Parent loop detection        — no circular ancestry
  3. Chapter link validity        — chapter: file exists and mentions the person
  4. Cross-ref validity           — refs[] entries exist in NIV verse files
  5. Timeline alignment           — PEOPLE dates consistent with TIMELINE_PEOPLE years
  6. Bio–panel consistency        — people panels link to IDs that exist in PEOPLE
  7. Era plausibility             — era field matches approximate date range

Run:  python3 _tools/audit_people.py
"""
import re, os, glob, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS  = '\033[92m  ✓\033[0m'
FAIL  = '\033[91m  ✗\033[0m'
WARN  = '\033[93m  ⚠\033[0m'

issues = []
warnings = []

def err(msg):  issues.append(msg)
def warn(msg): warnings.append(msg)

def section(title):
    print(f'\n\033[1m{title}\033[0m')
    print('─' * 55)

# ── Load data ────────────────────────────────────────────────────────────────

section('Loading data')

# PEOPLE array from people.html
with open(os.path.join(REPO, 'people.html')) as f:
    people_html = f.read()

people_start = people_html.find('const PEOPLE')
people_end   = people_html.find('\n];', people_start)
raw_people   = people_html[people_start:people_end+3]

# Parse entries
raw_entries = re.findall(r'\{[^{}]+\}', raw_people, re.DOTALL)
people = []
by_id  = {}
for e in raw_entries:
    entry = {}
    for field in ['id','name','gender','father','mother','spouseOf','era','dates','role','bio','chapter']:
        m = re.search(rf'{field}:"([^"]*)"', e)
        entry[field] = m.group(1) if m else None
        if m is None:
            # Check for null
            nm = re.search(rf'{field}:null', e)
            entry[field] = None if nm else entry[field]
    # refs array
    refs_m = re.search(r'refs:\[([^\]]*)\]', e)
    entry['refs'] = re.findall(r'"([^"]+)"', refs_m.group(1)) if refs_m else []
    people.append(entry)
    if entry['id']:
        by_id[entry['id']] = entry

print(f'  Loaded {len(people)} PEOPLE entries')

# TIMELINE_PEOPLE from timeline.html
with open(os.path.join(REPO, 'timeline.html')) as f:
    tl_html = f.read()
tp_m = re.search(r'const TIMELINE_PEOPLE\s*=\s*\[(.*?)\];', tl_html, re.DOTALL)
timeline_people = {}
if tp_m:
    for e in re.findall(r'\{[^}]+\}', tp_m.group(1)):
        id_m   = re.search(r"id:'([^']+)'", e)
        name_m = re.search(r"name:'([^']+)'", e)
        year_m = re.search(r'year:(-?\d+)', e)
        if id_m and year_m:
            timeline_people[id_m.group(1)] = {
                'name': name_m.group(1) if name_m else '',
                'year': int(year_m.group(1))
            }
print(f'  Loaded {len(timeline_people)} TIMELINE_PEOPLE entries')

# NIV verse index
print('  Building NIV verse index...')
niv_refs = set()
for js_path in glob.glob(os.path.join(REPO, 'verses/niv/**/*.js'), recursive=True):
    with open(js_path) as f:
        content = f.read()
    for ref in re.findall(r'"ref":"([^"]+)"', content):
        niv_refs.add(ref)
    # Also add short refs (e.g. "Gen 1:1")
    for short in re.findall(r'"short":"([^"]+)"', content):
        niv_refs.add(short)
print(f'  Loaded {len(niv_refs):,} NIV verse refs')

# Panel links from chapter HTML files
print('  Scanning chapter people panel links...')
panel_links = {}  # id → [paths that link to it]
for path in sorted(glob.glob(os.path.join(REPO, 'ot/**/*.html'), recursive=True) +
                   glob.glob(os.path.join(REPO, 'nt/**/*.html'), recursive=True)):
    if not re.search(r'_\d+\.html$', path): continue
    with open(path) as f: h = f.read()
    for pid in re.findall(r'people\.html#([\w-]+)', h):
        panel_links.setdefault(pid, []).append(os.path.relpath(path, REPO))
print(f'  Found {len(panel_links)} unique person IDs linked from panels')

# ── CHECK 1: Parent chain completeness ─────────────────────────────────────
section('Check 1: Parent chain completeness')
parent_ok = parent_fail = 0
for p in people:
    for rel in ['father', 'mother']:
        parent_id = p.get(rel)
        if parent_id and parent_id not in by_id:
            err(f"  {p['id']}: {rel}=\"{parent_id}\" — ID not found in PEOPLE")
            parent_fail += 1
        elif parent_id:
            parent_ok += 1

if parent_fail == 0:
    print(f'{PASS} All {parent_ok} parent references resolve correctly')
else:
    print(f'{FAIL} {parent_fail} broken parent references ({parent_ok} OK)')
    for i in issues[-parent_fail:]:
        print(f'    {i}')

# ── CHECK 2: Circular ancestry detection ───────────────────────────────────
section('Check 2: Circular ancestry detection')
loops = []
def has_loop(pid, visited=None):
    if visited is None: visited = set()
    if pid in visited: return True
    if pid not in by_id: return False
    visited.add(pid)
    for rel in ['father', 'mother']:
        parent = by_id[pid].get(rel)
        if parent and has_loop(parent, set(visited)):
            return True
    return False

loop_count = 0
for p in people:
    if p['id'] and has_loop(p['id']):
        err(f"  Circular ancestry detected for: {p['id']}")
        loop_count += 1

if loop_count == 0:
    print(f'{PASS} No circular ancestry chains found')
else:
    print(f'{FAIL} {loop_count} circular ancestry chains')

# ── CHECK 3: Chapter link validity ─────────────────────────────────────────
section('Check 3: Chapter link validity')
chap_ok = chap_missing_file = chap_name_absent = 0
chap_issues = []
for p in people:
    chap = p.get('chapter')
    if not chap: continue
    chap_path = os.path.join(REPO, chap)
    if not os.path.exists(chap_path):
        chap_issues.append(f"  {p['id']}: chapter=\"{chap}\" — FILE NOT FOUND")
        chap_missing_file += 1
    else:
        with open(chap_path) as f: ch_html = f.read()
        # Check person's name appears in the chapter
        name = p['name'].split('(')[0].strip()  # e.g. "James" from "James (brother of Jesus)"
        first_name = name.split()[0]
        if first_name.lower() not in ch_html.lower():
            chap_issues.append(f"  {p['id']} ({name}): name not found in {chap}")
            chap_name_absent += 1
        else:
            chap_ok += 1

if not chap_issues:
    print(f'{PASS} All {chap_ok} chapter links valid — file exists and mentions the person')
else:
    print(f'{FAIL if chap_missing_file else WARN} {len(chap_issues)} chapter link issues ({chap_ok} OK):')
    for i in chap_issues:
        print(i)
    if chap_missing_file:
        issues.extend(chap_issues[:chap_missing_file])
    else:
        warnings.extend(chap_issues)

# ── CHECK 4: Cross-ref validity ─────────────────────────────────────────────
section('Check 4: Cross-reference validity')

def ref_in_niv(ref):
    """Check if a ref string like 'Gen 1:1' or 'Gen 1:1-3' exists in NIV."""
    ref = ref.strip()
    # Handle ranges: 'Gen 1:1-3' → check 'Gen 1:1'
    range_m = re.match(r'(.+):(\d+)-(\d+)$', ref)
    if range_m:
        base = f"{range_m.group(1)}:{range_m.group(2)}"
        return base in niv_refs or ref in niv_refs
    # Handle chapter ranges: 'Gen 1-3' → check 'Gen 1:1'
    chap_range = re.match(r'(.+)\s+(\d+)-\d+$', ref)
    if chap_range:
        base = f"{chap_range.group(1)} {chap_range.group(2)}:1"
        return base in niv_refs
    # Direct check
    if ref in niv_refs:
        return True
    # Try short form lookup
    # 'Gen 1:1' style — check if the book portion maps
    return False

ref_ok = ref_fail = ref_skip = 0
ref_issues = []
# Book abbreviation expansion
BOOK_MAP = {
    'Gen': 'Genesis', 'Exod': 'Exodus', 'Exo': 'Exodus', 'Lev': 'Leviticus',
    'Num': 'Numbers', 'Deut': 'Deuteronomy', 'Josh': 'Joshua', 'Judg': 'Judges',
    'Ruth': 'Ruth', '1 Sam': '1 Samuel', '2 Sam': '2 Samuel',
    '1 Kgs': '1 Kings', '2 Kgs': '2 Kings', '1 Chr': '1 Chronicles', '2 Chr': '2 Chronicles',
    'Ezra': 'Ezra', 'Neh': 'Nehemiah', 'Est': 'Esther', 'Job': 'Job',
    'Ps': 'Psalms', 'Prov': 'Proverbs', 'Eccl': 'Ecclesiastes', 'Song': 'Song of Solomon',
    'Isa': 'Isaiah', 'Jer': 'Jeremiah', 'Lam': 'Lamentations', 'Ezek': 'Ezekiel',
    'Dan': 'Daniel', 'Hos': 'Hosea', 'Joel': 'Joel', 'Amos': 'Amos', 'Obad': 'Obadiah',
    'Jon': 'Jonah', 'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk',
    'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 'Mal': 'Malachi',
    'Matt': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
    'Acts': 'Acts', 'Rom': 'Romans', '1 Cor': '1 Corinthians', '2 Cor': '2 Corinthians',
    'Gal': 'Galatians', 'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians',
    '1 Thess': '1 Thessalonians', '2 Thess': '2 Thessalonians',
    '1 Tim': '1 Timothy', '2 Tim': '2 Timothy', 'Titus': 'Titus',
    'Phlm': 'Philemon', 'Heb': 'Hebrews', 'Jas': 'James',
    '1 Pet': '1 Peter', '2 Pet': '2 Peter', '1 John': '1 John', '2 John': '2 John',
    '3 John': '3 John', 'Jude': 'Jude', 'Rev': 'Revelation',
}

def expand_ref(ref):
    """Expand abbreviated book names to full names and return normalised ref."""
    ref = ref.strip()
    # Try each abbreviation
    for abbr, full in sorted(BOOK_MAP.items(), key=lambda x: -len(x[0])):
        if ref.startswith(abbr + ' ') or ref.startswith(abbr + ':'):
            return full + ref[len(abbr):]
    return ref

# Single-chapter books — refs like "Jude 11" mean "Jude 1:11"
SINGLE_CHAPTER_BOOKS = {
    'Obadiah', 'Philemon', '2 John', '3 John', 'Jude',
}

def check_ref(ref):
    """Return True if ref can be found in NIV, False if definitely wrong."""
    if not ref or not ref.strip(): return True
    ref = ref.strip()
    # Skip broad cross-book ranges like "Matt-John" or "Exod 1-Deut 34"
    if re.match(r'.+-.+ \d', ref) or re.match(r'[A-Z][a-z]+-[A-Z][a-z]+$', ref):
        return True  # too broad to verify against verse index
    expanded = expand_ref(ref)
    # Handle single-chapter books: "Jude 11" → "Jude 1:11"
    for book in SINGLE_CHAPTER_BOOKS:
        if expanded.startswith(book + ' ') and ':' not in expanded:
            m = re.match(rf'{re.escape(book)} (\d+)(?:-(\d+))?$', expanded)
            if m:
                expanded = f"{book} 1:{m.group(1)}"
    # Direct match
    if expanded in niv_refs: return True
    # Range "Genesis 1:1-3" → "Genesis 1:1"
    m = re.match(r'(.+:\d+)-\d+$', expanded)
    if m and m.group(1) in niv_refs: return True
    # Comma-separated "Acts 25:13-26:32" — take first verse ref
    m_comma = re.match(r'(.+:\d+)[-,]', expanded)
    if m_comma and m_comma.group(1) in niv_refs: return True
    # Chapter range "Genesis 1-3" → "Genesis 1:1"
    m2 = re.match(r'(.+)\s+(\d+)-\d+$', expanded)
    if m2:
        if f"{m2.group(1)} {m2.group(2)}:1" in niv_refs: return True
    # Whole chapter "Genesis 1" → "Genesis 1:1"
    m3 = re.match(r'(.+)\s+(\d+)$', expanded)
    if m3:
        if f"{m3.group(1)} {m3.group(2)}:1" in niv_refs: return True
    # Comma within chapter "Acts 18:1-3,18-28" → "Acts 18:1"
    m4 = re.match(r'(.+:\d+),\d+', expanded)
    if m4 and m4.group(1) in niv_refs: return True
    # Cross-chapter range "Luke 1:5-25,57-80" → "Luke 1:5"
    m5 = re.match(r'(.+:\d+)(?:-\d+)?,', expanded)
    if m5 and m5.group(1) in niv_refs: return True
    return False

for person in people:
    for ref in person.get('refs', []):
        if not ref.strip(): continue
        # Skip non-canonical refs (Josephus, etc.)
        if any(x in ref for x in ['Josephus', 'Tacitus', 'Philo', 'Eusebius', 'trad', 'heading']):
            ref_skip += 1
            continue
        if check_ref(ref):
            ref_ok += 1
        else:
            ref_issues.append(f"  {person['id']}: ref \"{ref}\" → not found in NIV")
            ref_fail += 1

if not ref_issues:
    print(f'{PASS} All {ref_ok} cross-refs valid ({ref_skip} non-canonical skipped)')
else:
    print(f'{WARN} {ref_fail} refs not found in NIV ({ref_ok} OK, {ref_skip} non-canonical skipped):')
    for i in ref_issues[:20]:
        print(i)
    if len(ref_issues) > 20:
        print(f'    ... and {len(ref_issues)-20} more')
    warnings.extend(ref_issues)

# ── CHECK 5: Timeline alignment ─────────────────────────────────────────────
section('Check 5: Timeline date alignment')

def parse_year_from_dates(dates_str):
    """Extract approximate BIRTH year (first year) from dates string.
    
    Handles:
      "c. 1526 BC"          → -1526
      "c. 45 AD"            → 45
      "c. 1529-1407 BC"     → -1529  (birth, not death)
      "c. 2166-1991 BC"     → -2166
      "20 BC – AD 39"       → -20
      "c. 45-100 AD"        → 45
      "c. 3300-2350 BC"     → -3300
    """
    if not dates_str: return None
    s = dates_str.strip()
    # "20 BC – AD 39": mixed era — birth is the BC year (first number)
    m = re.match(r'(?:c\.\s*)?(\d+)\s*BC', s)
    if m: return -int(m.group(1))
    # "c. 45 AD" or "c. 45-100 AD": pure AD — first number = birth
    m = re.match(r'(?:c\.\s*)?(\d+)(?:-\d+)?\s*AD', s)
    if m: return int(m.group(1))
    # "c. 1529-1407 BC (trad.)": range with trailing text
    m = re.match(r'(?:c\.\s*)?(\d+)-\d+\s*BC', s)
    if m: return -int(m.group(1))
    return None

tl_ok = tl_mismatch = tl_missing = 0
tl_issues = []
TOLERANCE = 120  # years — dates are approximate

for person in people:
    pid = person['id']
    if pid not in timeline_people:
        if person.get('dates') and person.get('era') in ['primeval','patriarch','exodus','judges','kingdom','prophets','exile','nt']:
            tl_missing += 1  # Has dates but no timeline entry
        continue
    tl_year = timeline_people[pid]['year']
    bio_year = parse_year_from_dates(person.get('dates'))
    if bio_year is None:
        continue
    diff = abs(tl_year - bio_year)
    if diff > TOLERANCE:
        tl_issues.append(
            f"  {pid} ({person['name']}): "
            f"bio={person['dates']} (≈{bio_year}), "
            f"timeline year={tl_year} — diff {diff}y"
        )
        tl_mismatch += 1
    else:
        tl_ok += 1

if not tl_issues:
    print(f'{PASS} {tl_ok} timeline dates align within {TOLERANCE}y tolerance')
else:
    print(f'{WARN} {tl_mismatch} timeline/bio date mismatches (tolerance {TOLERANCE}y):')
    for i in tl_issues:
        print(i)
    warnings.extend(tl_issues)
if tl_missing:
    print(f'{WARN} {tl_missing} people have bio dates but no timeline entry')

# ── CHECK 6: Panel links resolve ────────────────────────────────────────────
section('Check 6: People panel → PEOPLE tree resolution')
link_ok = link_fail = 0
link_issues = []
for pid, paths in sorted(panel_links.items()):
    if pid not in by_id:
        link_issues.append(f"  people.html#{pid} linked from {len(paths)} chapter(s) — ID NOT IN PEOPLE")
        link_fail += 1
    else:
        link_ok += 1

if not link_issues:
    print(f'{PASS} All {link_ok} panel person links resolve to PEOPLE entries')
else:
    print(f'{FAIL} {link_fail} broken panel links ({link_ok} OK):')
    for i in link_issues:
        print(i)
    issues.extend(link_issues)

# ── CHECK 7: Era plausibility ────────────────────────────────────────────────
section('Check 7: Era plausibility')
ERA_RANGES = {
    'primeval':  (-5000, -2000),
    'patriarch': (-2200, -1800),
    'exodus':    (-2000, -1200),  # extended back for Levi's sons
    'judges':    (-1400, -1000),
    'kingdom':   (-1100,  -900),
    'prophets':  (-1000,  -550),
    'exile':     ( -700,  -400),
    'nt':        ( -100,   120),
}
era_ok = era_fail = 0
era_issues = []
for person in people:
    era = person.get('era')
    bio_year = parse_year_from_dates(person.get('dates'))
    if not era or bio_year is None: continue
    if era not in ERA_RANGES: continue
    lo, hi = ERA_RANGES[era]
    if not (lo - 200 <= bio_year <= hi + 200):
        era_issues.append(
            f"  {person['id']} ({person['name']}): "
            f"era=\"{era}\" but date ≈{bio_year} "
            f"(expected {lo}–{hi})"
        )
        era_fail += 1
    else:
        era_ok += 1

if not era_issues:
    print(f'{PASS} {era_ok} era assignments plausible')
else:
    print(f'{WARN} {era_fail} era/date mismatches ({era_ok} OK):')
    for i in era_issues:
        print(i)
    warnings.extend(era_issues)

# ── Summary ──────────────────────────────────────────────────────────────────
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
        print('\n  Warnings (review recommended):')
        for w in warnings[:15]:
            print(f'    ⚠  {w.strip()}')
        if len(warnings) > 15:
            print(f'    ⚠  ... and {len(warnings)-15} more warnings')
