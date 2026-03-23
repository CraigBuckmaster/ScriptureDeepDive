#!/usr/bin/env python3
"""
extract_inline_data.py — Extract data embedded inside HTML files.

Phase 0D: Extracts data from map.html, people.html, and 43 scholar
bio HTML files into JSON. These are data sources that live inside HTML
(not in standalone .js files like Phase 0C handled).

Usage:
    python3 _tools/extract_inline_data.py
"""
import os, sys, re, json, subprocess
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'


# ---------------------------------------------------------------------------
# Node.js eval helper (reused from convert_js_to_json.py)
# ---------------------------------------------------------------------------
def _js_eval_large(js_expression):
    """Evaluate a JS expression via Node.js temp file."""
    tmp_path = ROOT / '_tools' / '_tmp_eval.js'
    try:
        with open(tmp_path, 'w', encoding='utf-8') as f:
            f.write(f'const data = eval({json.dumps("(" + js_expression + ")")});\n')
            f.write('process.stdout.write(JSON.stringify(data));\n')
        result = subprocess.run(
            ['node', str(tmp_path)],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode != 0:
            raise RuntimeError(f"Node eval failed: {result.stderr[:500]}")
        return json.loads(result.stdout)
    finally:
        tmp_path.unlink(missing_ok=True)


def _extract_js_block(content, pattern):
    """Extract a JS assignment block matching pattern. Returns the RHS expression."""
    m = re.search(pattern, content)
    if not m:
        return None
    start = m.end()
    depth = 0
    first_open = None
    for i in range(start, len(content)):
        c = content[i]
        if c in ('{', '['):
            if first_open is None:
                first_open = i
            depth += 1
        elif c in ('}', ']'):
            depth -= 1
            if depth == 0:
                return content[first_open:i + 1]
    return None


# ---------------------------------------------------------------------------
# 1. MAP.HTML — Places + Stories + Era data
# ---------------------------------------------------------------------------
def extract_map_data():
    """Extract PLACES, STORIES, ERA_HEX, ERA_NAMES from map.html."""
    src = ROOT / 'map.html'
    with open(src, encoding='utf-8') as f:
        raw = f.read()

    # Find the main <script> block (the one with PLACES)
    scripts = re.findall(r'<script>(.*?)</script>', raw, re.DOTALL)
    main_script = max((s for s in scripts if len(s) > 1000), key=len)

    results = {}

    # ERA_HEX
    block = _extract_js_block(main_script, r'(?:const|var)\s+ERA_HEX\s*=\s*')
    if block:
        results['era_hex'] = _js_eval_large(block)

    # ERA_NAMES
    block = _extract_js_block(main_script, r'(?:const|var)\s+ERA_NAMES\s*=\s*')
    if block:
        results['era_names'] = _js_eval_large(block)

    # PLACES
    block = _extract_js_block(main_script, r'(?:const|var)\s+PLACES\s*=\s*')
    if not block:
        raise ValueError("Cannot find PLACES in map.html")
    places = _js_eval_large(block)

    # STORIES
    block = _extract_js_block(main_script, r'(?:const|var)\s+STORIES\s*=\s*')
    if not block:
        raise ValueError("Cannot find STORIES in map.html")
    stories = _js_eval_large(block)

    return places, stories, results


# ---------------------------------------------------------------------------
# 2. PEOPLE.HTML — Era config + spine computation
# ---------------------------------------------------------------------------
def extract_people_config():
    """Extract genealogy configuration from people.html.

    Returns { era_colors, era_names, spine_ids }.
    Spine IDs are computed by walking the father chain from both ends:
    - DOWN from Adam using known biblical lineage picks at branch points
    - UP from Jesus through father chain
    The spine = union of both paths, preserving Adam→Jesus order.
    """
    # Load people data from Phase 0C output
    people_path = META / 'people.json'
    with open(people_path, encoding='utf-8') as f:
        people_data = json.load(f)

    people = people_data.get('people', [])
    era_colors = people_data.get('era_colors', {})
    era_names = people_data.get('era_names', {})

    by_id = {p['id']: p for p in people}

    # Build children map (excluding spouses)
    children_of = {}
    for p in people:
        fid = p.get('father')
        if fid and not p.get('spouseOf'):
            children_of.setdefault(fid, []).append(p['id'])

    # Known spine picks at branch points (biblical genealogy of Jesus)
    SPINE_PICKS = {
        'adam': 'seth', 'lamech-s': 'noah', 'noah': 'shem',
        'terah': 'abraham', 'abraham': 'isaac', 'isaac': 'jacob',
        'jacob': 'judah', 'david': 'solomon',
    }

    # Walk DOWN from Adam
    down_chain = []
    current = by_id.get('adam')
    visited = set()
    while current and current['id'] not in visited:
        visited.add(current['id'])
        down_chain.append(current['id'])
        kids = children_of.get(current['id'], [])
        if not kids:
            break
        pick = SPINE_PICKS.get(current['id'])
        if pick and pick in kids:
            current = by_id.get(pick)
        elif len(kids) == 1:
            current = by_id.get(kids[0])
        else:
            break  # multiple children, no known pick

    # Walk UP from Jesus
    up_chain = []
    current = by_id.get('jesus')
    while current and current['id'] not in visited:
        up_chain.append(current['id'])
        father_id = current.get('father')
        current = by_id.get(father_id) if father_id else None
    up_chain.reverse()

    # Merge: down_chain + up_chain (no duplicates, preserving order)
    spine_ids = down_chain + up_chain

    return {
        'era_colors': era_colors,
        'era_names': era_names,
        'spine_ids': spine_ids,
    }


# ---------------------------------------------------------------------------
# 3. SCHOLAR BIOS — 43 HTML files
# ---------------------------------------------------------------------------
def extract_scholar_bios():
    """Extract structured bio data from commentators/*.html files.

    Returns dict keyed by scholar ID (from filename).
    """
    bio_dir = ROOT / 'commentators'
    bios = {}
    errors = []

    for html_file in sorted(bio_dir.glob('*.html')):
        # Skip index.html (hub page, not a bio)
        if html_file.stem == 'index':
            continue

        scholar_key = html_file.stem  # e.g. 'macarthur', 'alter'

        try:
            with open(html_file, encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Name
            h1 = soup.find('h1', class_='bio-name')
            name = h1.get_text(strip=True) if h1 else ''

            # Eyebrow
            eyebrow = soup.find('p', class_='bio-eyebrow')
            eyebrow_text = eyebrow.get_text(strip=True) if eyebrow else ''

            # Tradition
            tradition = soup.find('p', class_='bio-tradition')
            tradition_text = tradition.get_text(strip=True) if tradition else ''

            # Sections: each <h2 class="bio-section-title"> + content until next <h2>
            sections = []
            section_headers = soup.find_all('h2', class_='bio-section-title')
            for sec_h in section_headers:
                title = sec_h.get_text(strip=True)
                body_parts = []

                for sib in sec_h.find_next_siblings():
                    if sib.name == 'h2':
                        break  # next section

                    if sib.name == 'p':
                        text = sib.get_text(strip=True)
                        if text:
                            body_parts.append(text)

                    elif sib.name == 'ul' and 'bio-works' in ' '.join(sib.get('class', [])):
                        # Key Works section uses <ul class="bio-works">
                        for li in sib.find_all('li'):
                            text = li.get_text(strip=True)
                            if text:
                                body_parts.append(text)

                    elif sib.name == 'div' and 'bio-appears' in ' '.join(sib.get('class', [])):
                        # Appears In section uses <div class="bio-appears">
                        text = sib.get_text(strip=True)
                        if text:
                            body_parts.append(text)

                sections.append({
                    'title': title,
                    'body': '\n\n'.join(body_parts),
                })

            if not name:
                errors.append(f"{html_file.name}: no name found")
                continue

            bios[scholar_key] = {
                'key': scholar_key,
                'name': name,
                'eyebrow': eyebrow_text,
                'tradition': tradition_text,
                'sections': sections,
            }

        except Exception as e:
            errors.append(f"{html_file.name}: {e}")

    return bios, errors


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    META.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Phase 0D: Extracting inline HTML data")
    print("=" * 60)

    # --- 1. Map data ---
    print("\n1. MAP.HTML")
    places, stories, map_meta = extract_map_data()

    # Write places
    places_path = META / 'places.json'
    with open(places_path, 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    # Validate places
    places_with_coords = [p for p in places if p.get('lat') and p.get('lon')]
    place_types = {}
    for p in places:
        t = p.get('type', 'unknown')
        place_types[t] = place_types.get(t, 0) + 1
    print(f"  ✅ places.json: {len(places)} places ({len(places_with_coords)} with coords)")
    print(f"     Types: {place_types}")

    # Write map-stories (includes era data)
    map_stories_out = {
        'era_hex': map_meta.get('era_hex', {}),
        'era_names': map_meta.get('era_names', {}),
        'stories': stories,
    }
    stories_path = META / 'map-stories.json'
    with open(stories_path, 'w', encoding='utf-8') as f:
        json.dump(map_stories_out, f, ensure_ascii=False, indent=2)

    # Validate stories
    stories_with_paths = len([s for s in stories if s.get('paths')])
    stories_with_regions = len([s for s in stories if s.get('regions')])
    era_dist = {}
    for s in stories:
        era_dist[s.get('era', '?')] = era_dist.get(s.get('era', '?'), 0) + 1
    print(f"  ✅ map-stories.json: {len(stories)} stories "
          f"({stories_with_paths} with paths, {stories_with_regions} with regions)")
    print(f"     Eras: {era_dist}")

    # --- 2. Genealogy config ---
    print("\n2. PEOPLE.HTML (genealogy config)")
    config = extract_people_config()

    config_path = META / 'genealogy-config.json'
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    spine = config['spine_ids']
    print(f"  ✅ genealogy-config.json:")
    print(f"     Era colors: {len(config['era_colors'])} eras")
    print(f"     Era names: {len(config['era_names'])} eras")
    print(f"     Spine: {len(spine)} nodes ({spine[0]} → ... → {spine[-1]})")
    # Show first 5 and last 5
    if len(spine) > 10:
        print(f"     Path: {' → '.join(spine[:5])} → ... → {' → '.join(spine[-5:])}")
    else:
        print(f"     Path: {' → '.join(spine)}")

    # --- 3. Scholar bios ---
    print("\n3. COMMENTATORS/*.HTML (scholar bios)")
    bios, bio_errors = extract_scholar_bios()

    bios_path = META / 'scholar-bios.json'
    with open(bios_path, 'w', encoding='utf-8') as f:
        json.dump(bios, f, ensure_ascii=False, indent=2)

    print(f"  ✅ scholar-bios.json: {len(bios)} scholars")

    # Validate: all should have name + at least 1 section
    for key, bio in sorted(bios.items()):
        section_count = len(bio['sections'])
        section_titles = [s['title'] for s in bio['sections']]
        if section_count == 0:
            print(f"     ⚠ {key}: no sections!")
        elif section_count < 3:
            print(f"     ⚠ {key}: only {section_count} sections ({section_titles})")

    if bio_errors:
        print(f"  ❌ Errors ({len(bio_errors)}):")
        for err in bio_errors:
            print(f"     {err}")

    # Summary by section pattern
    section_patterns = {}
    for bio in bios.values():
        key = tuple(s['title'] for s in bio['sections'])
        section_patterns[key] = section_patterns.get(key, 0) + 1
    print(f"\n  Section patterns:")
    for pattern, count in sorted(section_patterns.items(), key=lambda x: -x[1]):
        print(f"     {count}× {list(pattern)}")

    # --- Final summary ---
    total_size = sum(
        (META / f).stat().st_size
        for f in ['places.json', 'map-stories.json', 'genealogy-config.json', 'scholar-bios.json']
    )
    print(f"\n{'='*60}")
    print(f"Phase 0D complete. Total output: {total_size // 1024}KB")
    print(f"  places.json: {len(places)} places")
    print(f"  map-stories.json: {len(stories)} stories + era data")
    print(f"  genealogy-config.json: {len(spine)} spine nodes + era config")
    print(f"  scholar-bios.json: {len(bios)} scholar bios")


if __name__ == '__main__':
    os.chdir(ROOT)
    main()
