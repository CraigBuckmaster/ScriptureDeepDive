#!/usr/bin/env python3
"""
extract_to_json.py — Chapter HTML→JSON extractor for ScriptureDeepDive.

Phase 0A: Parses every chapter HTML produced by the PWA pipeline and
extracts structured JSON suitable for the React Native SQLite database.

Usage:
    python3 _tools/extract_to_json.py                  # test on 3 chapters
    python3 _tools/extract_to_json.py --all             # extract all 879 chapters
    python3 _tools/extract_to_json.py --validate PATH   # validate one extraction
"""
import os, sys, re, json, math, glob
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SVG_CENTER  = 120
SVG_MAX_R   = 85
MAX_SCORE   = 10

# Known section-level panel types (by ID suffix)
SECTION_PANEL_TYPES = {'grk', 'hist', 'ctx', 'cross', 'poi', 'tl'}
# Known chapter-level panel types (by ID suffix)
CHAPTER_PANEL_TYPES = {
    'ppl', 'trans', 'src', 'rec', 'lit', 'hebtext',
    'thread', 'tx', 'debate', 'themes',
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _text(el):
    """Get text from element, or empty string if None."""
    return el.get_text(strip=True) if el else ''


def _inner_html(el):
    """Get the inner HTML of an element as a string."""
    if not el:
        return ''
    return ''.join(str(c) for c in el.children).strip()


def _parse_verse_range(header_text):
    """Extract verse_start and verse_end from section header text.

    Patterns:
        'Verses 1–5 — The First Day: Light'    → (1, 5)    # en-dash
        'Verses 1‐11 — Rehoboam at Shechem'    → (1, 11)   # unicode hyphen U+2010
        'Verses 1-5 — Title'                    → (1, 5)    # ascii hyphen
        'Verse 1 — The Beginning'               → (1, 1)    # singular
        'Verses 31 — Shamgar'                   → (31, 31)  # plural but single verse
    """
    # Range: any dash variant between two numbers
    m = re.search(r'Verses?\s+(\d+)\s*[\–\-\‐\—]\s*(\d+)', header_text)
    if m:
        return int(m.group(1)), int(m.group(2))
    # Single verse (plural or singular)
    m2 = re.search(r'Verses?\s+(\d+)', header_text)
    if m2:
        v = int(m2.group(1))
        return v, v
    return None, None


def _extract_cid(soup):
    """Find the chapter ID prefix from panel element IDs."""
    el = soup.find(id=re.compile(r'^[a-z0-9]+-s?\d'))
    if el:
        # e.g. 'gen1-s1-grk' → 'gen1', 'gen1-ppl' → 'gen1'
        return el['id'].split('-')[0]
    # Fallback: any element whose id looks like {letters+digits}-
    el = soup.find(id=re.compile(r'^[a-z0-9]+-'))
    if el:
        return el['id'].split('-')[0]
    return None


# ---------------------------------------------------------------------------
# Section-level panel extractors
# ---------------------------------------------------------------------------
def _extract_heb(panel):
    """Hebrew/Greek word study panel.

    Structure: <p> elements each containing:
        <span class="hebrew-word">word</span>
        <span class="tlit">transliteration</span>
        — <strong>gloss</strong>: explanation paragraph
    """
    entries = []
    for p in panel.find_all('p'):
        hw = p.find(class_='hebrew-word')
        tlit = p.find(class_='tlit')
        gloss_el = p.find('strong')
        if not hw:
            continue
        # The paragraph text after the gloss
        full_text = p.get_text(strip=True)
        # Extract just the explanation (after the gloss and colon)
        gloss_text = _text(gloss_el)
        para = ''
        if gloss_text and ':' in full_text:
            idx = full_text.find(':', full_text.find(gloss_text))
            if idx >= 0:
                para = full_text[idx + 1:].strip()
        elif gloss_text:
            # Sometimes no colon, just take everything after the gloss
            idx = full_text.find(gloss_text)
            if idx >= 0:
                para = full_text[idx + len(gloss_text):].strip()
                if para.startswith(':'):
                    para = para[1:].strip()

        entries.append({
            'word': _text(hw),
            'transliteration': _text(tlit),
            'gloss': gloss_text,
            'paragraph': para,
        })
    return entries


def _extract_paragraph_panel(panel):
    """Generic paragraph panel (hist, ctx). Returns joined paragraph text."""
    paras = []
    for p in panel.find_all('p'):
        txt = p.get_text(strip=True)
        if txt:
            paras.append(txt)
    return '\n\n'.join(paras)


def _extract_cross_ref(panel):
    """Cross-reference panel. Returns list of {ref, note}."""
    entries = []
    for li in panel.find_all('li'):
        cite = li.find(class_='ref-cite')
        text = li.find(class_='ref-text')
        if cite:
            entries.append({
                'ref': _text(cite),
                'note': _text(text),
            })
    return entries


def _extract_commentary(panel):
    """Commentary panel (any scholar). Returns {source, notes: [{ref, note}]}."""
    source = _text(panel.find(class_='com-source'))
    notes = []
    for note_div in panel.find_all(class_='com-note'):
        ref = _text(note_div.find(class_='com-ref'))
        p = note_div.find('p')
        notes.append({
            'ref': ref,
            'note': _text(p),
        })
    return {'source': source, 'notes': notes}


def _extract_poi(panel):
    """Places panel. Returns list of {name, coords, text}."""
    entries = []
    for entry in panel.find_all(class_='poi-entry'):
        entries.append({
            'name': _text(entry.find(class_='poi-name')),
            'coords': _text(entry.find(class_='poi-coords')),
            'text': _text(entry.find(class_='poi-text')),
        })
    return entries


def _extract_tl_section(panel):
    """Timeline section panel. Returns list of events."""
    events = []
    for ev in panel.find_all(class_='tl-event'):
        is_current = 'current' in ev.get('class', [])
        events.append({
            'date': _text(ev.find(class_='tl-date')),
            'name': _text(ev.find(class_='tl-name')),
            'text': _text(ev.find(class_='tl-text')),
            'current': is_current,
        })
    return events


# ---------------------------------------------------------------------------
# Chapter-level panel extractors
# ---------------------------------------------------------------------------
def _extract_ppl(panel):
    """People panel. Returns list of {name, role, text}."""
    cards = []
    for card in panel.find_all(class_='person-card'):
        cards.append({
            'name': _text(card.find(class_='person-name')),
            'role': _text(card.find(class_='person-role')),
            'text': _text(card.find(class_='person-text')),
        })
    return cards


def _extract_trans(panel):
    """Translation comparison panel. Returns raw HTML (too complex to restructure)."""
    table = panel.find('table', class_='trans-table')
    if table:
        return _inner_html(table)
    return ''


def _extract_source_blocks(panel, who_class, text_class):
    """Generic source/reception block extractor."""
    blocks = []
    for block in panel.find_all(class_=re.compile(r'source-block|rec-block|src-block')):
        who = block.find(class_=who_class)
        text = block.find(class_=text_class)
        # Some panels use source-title/source-quote/source-note
        if not who:
            who = block.find(class_='source-title')
        if not text:
            text = block.find(class_='source-quote')
        note = block.find(class_='source-note')
        entry = {
            'who': _text(who),
            'text': _text(text),
        }
        if note:
            entry['note'] = _text(note)
        blocks.append(entry)
    return blocks


def _extract_src(panel):
    """Ancient sources panel."""
    blocks = []
    for block in panel.find_all(class_='source-block'):
        blocks.append({
            'title': _text(block.find(class_='source-title')),
            'quote': _text(block.find(class_='source-quote')),
            'note': _text(block.find(class_='source-note')),
        })
    return blocks


def _extract_rec(panel):
    """Reception history panel."""
    blocks = []
    for block in panel.find_all(class_='rec-block'):
        blocks.append({
            'who': _text(block.find(class_='rec-who')),
            'text': _text(block.find(class_='rec-text')),
        })
    return blocks


def _extract_lit(panel):
    """Literary structure panel. Returns {rows: [{label, range, text, is_key}], note}."""
    rows = []
    for row in panel.find_all(class_='lit-row'):
        is_key = 'lit-key' in row.get('class', [])
        label = _text(row.find(class_='lit-label'))
        text = _text(row.find(class_='lit-text'))
        rows.append({
            'label': label,
            'text': text,
            'is_key': is_key,
        })
    # Note: sometimes there's a paragraph after the rows
    note_p = panel.find('p')
    note = _text(note_p) if note_p else ''
    return {'rows': rows, 'note': note}


def _extract_hebtext(panel):
    """Hebrew-rooted reading panel. Returns raw inner HTML (rich styled content)."""
    return _inner_html(panel)


def _extract_thread(panel):
    """Intertextual threading panel. Returns list of thread items."""
    items = []
    for item in panel.find_all(class_='thread-item'):
        direction = 'forward' if 'forward' in item.get('class', []) else 'backward'
        header = item.find(class_='thread-header')
        items.append({
            'anchor': _text(header.find(class_='thread-anchor') if header else None),
            'target': _text(header.find(class_='thread-target') if header else None),
            'type': _text(header.find(class_=re.compile(r'thread-type')) if header else None),
            'text': _text(item.find(class_='thread-text')),
            'direction': direction,
        })
    return items


def _extract_textual(panel):
    """Textual notes panel. Returns list of textual items."""
    items = []
    for item in panel.find_all(class_='tx-item'):
        header = item.find(class_='tx-header')
        items.append({
            'ref': _text(header.find(class_='tx-ref') if header else None),
            'issue': _text(header.find(class_='tx-issue') if header else None),
            'variants': _text(item.find(class_='tx-variants')),
            'significance': _text(item.find(class_='tx-sig')),
        })
    return items


def _extract_debate(panel):
    """Scholarly debates panel. Returns list of debates."""
    debates = []
    for debate in panel.find_all(class_='db-debate'):
        title = _text(debate.find(class_='db-title'))
        positions = []
        for pos in debate.find_all(class_='db-position'):
            positions.append({
                'name': _text(pos.find(class_='db-pos-name')),
                'proponents': _text(pos.find(class_='db-proponents')),
                'argument': _text(pos.find(class_='db-argument')),
            })
        debates.append({'title': title, 'positions': positions})
    return debates


def _extract_themes(panel):
    """Theological themes radar chart. Returns {scores: [{label, score}], note}."""
    svg = panel.find('svg')
    if not svg:
        note_p = panel.find('p')
        return {'scores': [], 'note': _text(note_p)}

    # Labels from <text> elements
    labels = [t.get_text(strip=True) for t in svg.find_all('text')]

    # Scores from polygon points: distance from center → 0-10 scale
    polygon = svg.find('polygon')
    scores = []
    if polygon and polygon.get('points', '').strip():
        points_str = polygon['points'].strip()
        try:
            points = [
                (float(x), float(y))
                for x, y in (p.split(',') for p in points_str.split())
            ]
            for i, (px, py) in enumerate(points):
                dist = math.sqrt((px - SVG_CENTER) ** 2 + (py - SVG_CENTER) ** 2)
                score = round(dist / SVG_MAX_R * MAX_SCORE)
                score = max(0, min(MAX_SCORE, score))
                label = labels[i] if i < len(labels) else f'Theme {i + 1}'
                scores.append({'label': label, 'score': score})
        except (ValueError, IndexError):
            pass

    # If we got labels but no valid polygon, still record labels at score 0
    if not scores and labels:
        scores = [{'label': l, 'score': 0} for l in labels]

    note_p = panel.find('p')
    return {'scores': scores, 'note': _text(note_p)}


# ---------------------------------------------------------------------------
# VHL extraction
# ---------------------------------------------------------------------------
def _extract_vhl(raw_html):
    """Extract VHL groups from the IIFE block at the bottom of the HTML.

    Returns list of {name, css_class, words, btn_types}.

    The IIFE may or may not contain 'use strict'. Patterns seen:
        (function(){ 'use strict'; var DIVINE=... initVHL([...]); })();
        (function(){ var DIVINE=... initVHL([...]); })();
    """
    groups = []

    # Find initVHL call — work backwards from it to find the var declarations
    init_match = re.search(r'initVHL\(\[([^\]]+)\]\)', raw_html)
    if not init_match:
        return groups

    init_pos = init_match.start()
    init_args = init_match.group(1)  # e.g. "DIVINE,PLACES,PEOPLE,TIME,KEY"

    # Find the start of the IIFE — scan backwards from initVHL for '(function'
    block_start = raw_html.rfind('function', max(0, init_pos - 5000), init_pos)
    if block_start < 0:
        return groups

    var_block = raw_html[block_start:init_pos]

    # Parse each var declaration
    var_defs = re.findall(
        r"var\s+(\w+)\s*=\s*\{(.*?)\};",
        var_block, re.DOTALL
    )
    var_map = {}
    for var_name, body in var_defs:
        # Extract words array
        words = []
        words_m = re.search(r"words:\[([^\]]*)\]", body)
        if words_m:
            words = re.findall(r"'([^']*)'", words_m.group(1))

        # Extract css class
        cls = ''
        cls_m = re.search(r"cls:'([^']*)'", body)
        if cls_m:
            cls = cls_m.group(1)

        # Extract btn types array
        btn_types = []
        btn_m = re.search(r"btn:\[([^\]]*)\]", body)
        if btn_m:
            btn_types = re.findall(r"'([^']*)'", btn_m.group(1))

        var_map[var_name] = {
            'name': var_name.lower(),
            'css_class': cls,
            'words': words,
            'btn_types': btn_types,
        }

    # Respect the order in initVHL([...]) call
    for arg in re.findall(r'\w+', init_args):
        if arg in var_map:
            groups.append(var_map[arg])

    return groups


# ---------------------------------------------------------------------------
# Deep links
# ---------------------------------------------------------------------------
def _extract_deep_links(soup):
    """Extract timeline and map deep-links from between header and first section."""
    tl_link = None
    map_link = None

    for a in soup.find_all('a', class_='tl-event-link'):
        href = a.get('href', '')
        text = a.get_text(strip=True)
        # Parse event_id from fragment: ...timeline.html#creation → 'creation'
        frag = href.split('#')[-1] if '#' in href else ''
        if frag:
            tl_link = {'event_id': frag, 'text': text}

    for a in soup.find_all('a', class_='map-story-link'):
        href = a.get('href', '')
        text = a.get_text(strip=True)
        frag = href.split('#')[-1] if '#' in href else ''
        if frag:
            map_link = {'story_id': frag, 'text': text}

    return tl_link, map_link


# ---------------------------------------------------------------------------
# Section extraction
# ---------------------------------------------------------------------------
def _classify_section_panel(panel_id, cid, section_num):
    """Determine panel type from ID.

    Section panels have IDs like: gen1-s1-grk, gen1-s1-mac, gen1-s1-cross
    Returns the type suffix (e.g. 'grk', 'mac', 'cross').
    """
    prefix = f'{cid}-s{section_num}-'
    if not panel_id.startswith(prefix):
        return None
    return panel_id[len(prefix):]


def _extract_section_panels(soup, cid, section_num):
    """Extract all panels for a given section number."""
    prefix = f'{cid}-s{section_num}-'
    panels = {}

    for el in soup.find_all(id=re.compile(rf'^{re.escape(prefix)}')):
        ptype = el['id'][len(prefix):]
        if not ptype:
            continue

        if ptype == 'grk':
            panels['heb'] = _extract_heb(el)
        elif ptype == 'hist':
            panels['hist'] = _extract_paragraph_panel(el)
        elif ptype == 'ctx':
            panels['ctx'] = _extract_paragraph_panel(el)
        elif ptype == 'cross':
            panels['cross'] = _extract_cross_ref(el)
        elif ptype == 'poi':
            panels['poi'] = _extract_poi(el)
        elif ptype == 'tl':
            panels['tl'] = _extract_tl_section(el)
        else:
            # Commentary panel: mac, sarna, alter, calvin, net, oswalt, childs, etc.
            # All scholar panels share the same com-panel structure
            if 'com-panel' in el.get('class', []):
                panels[ptype] = _extract_commentary(el)
            else:
                # Unknown panel type — store raw HTML as fallback
                panels[ptype] = {'_raw_html': _inner_html(el)}

    return panels


# ---------------------------------------------------------------------------
# Chapter-level panel extraction
# ---------------------------------------------------------------------------
def _extract_chapter_panels(soup, cid):
    """Extract all chapter-level panels (no -s{n}- in ID)."""
    panels = {}
    section_pattern = re.compile(rf'^{re.escape(cid)}-s\d+-')

    for el in soup.find_all(id=re.compile(rf'^{re.escape(cid)}-')):
        eid = el['id']
        # Skip section-level panels
        if section_pattern.match(eid):
            continue
        ptype = eid[len(cid) + 1:]
        if not ptype:
            continue

        if ptype == 'ppl':
            panels['ppl'] = _extract_ppl(el)
        elif ptype == 'trans':
            panels['trans'] = _extract_trans(el)
        elif ptype == 'src':
            panels['src'] = _extract_src(el)
        elif ptype == 'rec':
            panels['rec'] = _extract_rec(el)
        elif ptype == 'lit':
            panels['lit'] = _extract_lit(el)
        elif ptype == 'hebtext':
            panels['hebtext'] = _extract_hebtext(el)
        elif ptype == 'thread':
            panels['thread'] = _extract_thread(el)
        elif ptype == 'tx':
            panels['tx'] = _extract_textual(el)
        elif ptype == 'debate':
            panels['debate'] = _extract_debate(el)
        elif ptype == 'themes':
            panels['themes'] = _extract_themes(el)
        else:
            # Unknown — store raw inner HTML
            panels[ptype] = {'_raw_html': _inner_html(el)}

    return panels


# ---------------------------------------------------------------------------
# Main extraction
# ---------------------------------------------------------------------------
def extract_chapter(html_path):
    """Extract a chapter HTML file into a structured dict.

    Args:
        html_path: Path to the chapter HTML file.

    Returns:
        dict matching the React Native plan's chapter JSON schema.
    """
    html_path = Path(html_path)
    with open(html_path, encoding='utf-8') as f:
        raw = f.read()

    soup = BeautifulSoup(raw, 'html.parser')

    # --- Chapter ID ---
    cid = _extract_cid(soup)
    if not cid:
        raise ValueError(f"Cannot determine chapter ID from {html_path}")

    # --- Metadata: path parts ---
    # e.g. ot/genesis/Genesis_1.html → testament='ot', book_dir='genesis', ch_num=1
    parts = html_path.parts
    testament = None
    book_dir = None
    for i, p in enumerate(parts):
        if p in ('ot', 'nt'):
            testament = p
            if i + 1 < len(parts):
                book_dir = parts[i + 1]
            break

    fname = html_path.stem  # 'Genesis_1'
    ch_match = re.search(r'_(\d+)$', fname)
    ch_num = int(ch_match.group(1)) if ch_match else None

    # --- Title and subtitle ---
    h1 = soup.find('h1')
    title = _text(h1)
    subtitle = ''
    if h1:
        next_el = h1.find_next_sibling()
        if next_el and next_el.name == 'p':
            # Make sure it's the subtitle, not a deep-link or section
            classes = next_el.get('class', [])
            if not classes or 'section-header' not in classes:
                subtitle = _text(next_el)

    # --- Deep links ---
    timeline_link, map_story_link = _extract_deep_links(soup)

    # --- Sections ---
    sections_out = []
    section_divs = soup.find_all('div', class_='section')
    for idx, sec_div in enumerate(section_divs, start=1):
        header_el = sec_div.find(class_='section-header') or sec_div.find('h3')
        header_text = _text(header_el)
        verse_start, verse_end = _parse_verse_range(header_text)

        panels = _extract_section_panels(soup, cid, idx)

        sections_out.append({
            'section_num': idx,
            'header': header_text,
            'verse_start': verse_start,
            'verse_end': verse_end,
            'panels': panels,
        })

    # --- Chapter-level panels ---
    chapter_panels = _extract_chapter_panels(soup, cid)

    # --- VHL groups ---
    vhl_groups = _extract_vhl(raw)

    return {
        'chapter_id': cid,
        'testament': testament,
        'book_dir': book_dir,
        'chapter_num': ch_num,
        'title': title,
        'subtitle': subtitle,
        'timeline_link': timeline_link,
        'map_story_link': map_story_link,
        'sections': sections_out,
        'chapter_panels': chapter_panels,
        'vhl_groups': vhl_groups,
    }


# ---------------------------------------------------------------------------
# Batch extraction
# ---------------------------------------------------------------------------
def extract_all(output_dir='content'):
    """Walk ot/ and nt/ (or _archive/ot/ and _archive/nt/) and extract every chapter to JSON.

    Output structure: {output_dir}/{book_dir}/{ch_num}.json
    """
    output_dir = ROOT / output_dir
    count = 0
    errors = []

    for testament in ('ot', 'nt'):
        # Check both root and _archive locations
        testament_dir = ROOT / testament
        if not testament_dir.is_dir():
            testament_dir = ROOT / '_archive' / testament
        if not testament_dir.is_dir():
            continue
        for book_dir in sorted(testament_dir.iterdir()):
            if not book_dir.is_dir():
                continue
            for html_file in sorted(book_dir.glob('*.html')):
                try:
                    data = extract_chapter(html_file)
                    out_book = output_dir / book_dir.name
                    out_book.mkdir(parents=True, exist_ok=True)
                    out_path = out_book / f"{data['chapter_num']}.json"
                    with open(out_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    count += 1
                except Exception as e:
                    errors.append((str(html_file), str(e)))

    print(f"\nExtracted {count} chapters.")
    if errors:
        print(f"Errors ({len(errors)}):")
        for path, err in errors:
            print(f"  {path}: {err}")
    return count, errors


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_extraction(html_path, json_path=None):
    """Compare an extraction against its source HTML.

    Checks section count, panel type presence, and verse ranges.
    """
    html_path = Path(html_path)
    if json_path is None:
        # Infer json path from html path
        parts = html_path.parts
        for i, p in enumerate(parts):
            if p in ('ot', 'nt'):
                book_dir = parts[i + 1]
                break
        ch_match = re.search(r'_(\d+)\.html$', html_path.name)
        ch_num = ch_match.group(1) if ch_match else '1'
        json_path = ROOT / 'content' / book_dir / f'{ch_num}.json'

    json_path = Path(json_path)

    # Load both
    with open(html_path) as f:
        raw = f.read()
    soup = BeautifulSoup(raw, 'html.parser')

    with open(json_path) as f:
        data = json.load(f)

    issues = []

    # Section count
    html_sections = len(soup.find_all('div', class_='section'))
    json_sections = len(data.get('sections', []))
    if html_sections != json_sections:
        issues.append(f"Section count mismatch: HTML={html_sections}, JSON={json_sections}")

    # Panel count per section
    cid = data.get('chapter_id', '')
    for sec in data.get('sections', []):
        sn = sec['section_num']
        prefix = f'{cid}-s{sn}-'
        html_panels = soup.find_all(id=re.compile(rf'^{re.escape(prefix)}'))
        json_panel_count = len(sec.get('panels', {}))
        if len(html_panels) != json_panel_count:
            issues.append(
                f"Section {sn} panel count: HTML={len(html_panels)}, JSON={json_panel_count}"
            )

    # Chapter panels — count unique type suffixes, not raw elements
    # (source HTML sometimes has duplicate IDs, e.g., 3× lk11-hebtext)
    section_id_pattern = re.compile(rf'^{re.escape(cid)}-s\d+-')
    html_ch_panels = [
        el for el in soup.find_all(id=re.compile(rf'^{re.escape(cid)}-'))
        if not section_id_pattern.match(el['id'])
    ]
    html_ch_types = set(
        el['id'][len(cid) + 1:] for el in html_ch_panels
    )
    json_ch_panel_count = len(data.get('chapter_panels', {}))
    if len(html_ch_types) != json_ch_panel_count:
        issues.append(
            f"Chapter panel count: HTML={len(html_ch_types)} unique types, JSON={json_ch_panel_count}"
        )

    # Verse ranges: each section should have valid start/end
    for sec in data.get('sections', []):
        vs = sec.get('verse_start')
        ve = sec.get('verse_end')
        if vs is None or ve is None:
            issues.append(f"Section {sec['section_num']}: missing verse range")
        elif vs > ve:
            issues.append(f"Section {sec['section_num']}: start ({vs}) > end ({ve})")

    # VHL groups
    vhl = data.get('vhl_groups', [])
    if not vhl:
        issues.append("No VHL groups extracted")
    else:
        for g in vhl:
            if not g.get('btn_types'):
                issues.append(f"VHL group '{g.get('name')}' has no btn_types")

    return issues


# ---------------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------------
def _test_chapter(html_path, description):
    """Extract a chapter, validate, and print a summary."""
    html_path = Path(html_path)
    if not html_path.exists():
        print(f"\n{'='*70}")
        print(f"SKIP: {html_path} (file not found)")
        return

    print(f"\n{'='*70}")
    print(f"TEST: {html_path.name} — {description}")
    print(f"{'='*70}")

    data = extract_chapter(html_path)

    # Write to content/
    book_dir = data['book_dir']
    ch_num = data['chapter_num']
    out_dir = ROOT / 'content' / book_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f'{ch_num}.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"  Chapter ID:      {data['chapter_id']}")
    print(f"  Title:           {data['title']}")
    print(f"  Subtitle:        {data['subtitle'][:60]}{'...' if len(data['subtitle']) > 60 else ''}")
    print(f"  Testament:       {data['testament']}")
    print(f"  Book dir:        {data['book_dir']}")
    print(f"  Chapter num:     {data['chapter_num']}")
    print(f"  Timeline link:   {data['timeline_link']}")
    print(f"  Map story link:  {data['map_story_link']}")

    print(f"\n  Sections ({len(data['sections'])}):")
    total_section_panels = 0
    for sec in data['sections']:
        panel_types = sorted(sec['panels'].keys())
        total_section_panels += len(panel_types)
        print(f"    S{sec['section_num']}: vv.{sec['verse_start']}–{sec['verse_end']}  "
              f"panels=[{', '.join(panel_types)}]")

    print(f"\n  Chapter panels ({len(data['chapter_panels'])}):")
    ch_types = sorted(data['chapter_panels'].keys())
    for pt in ch_types:
        val = data['chapter_panels'][pt]
        if isinstance(val, list):
            print(f"    {pt}: {len(val)} items")
        elif isinstance(val, dict):
            if 'scores' in val:
                scores = val['scores']
                score_preview = ', '.join(
                    '{0}={1}'.format(s['label'], s['score']) for s in scores[:3]
                )
                suffix = f' [{score_preview}...]' if scores else ''
                print(f"    {pt}: {len(scores)} themes{suffix}")
            elif 'rows' in val:
                print(f"    {pt}: {len(val['rows'])} rows")
            elif 'notes' in val:
                print(f"    {pt}: {len(val['notes'])} notes")
            else:
                print(f"    {pt}: dict ({len(val)} keys)")
        elif isinstance(val, str):
            print(f"    {pt}: {len(val)} chars")
        else:
            print(f"    {pt}: {type(val).__name__}")

    print(f"\n  VHL groups ({len(data['vhl_groups'])}):")
    for g in data['vhl_groups']:
        print(f"    {g['name']:10s} cls={g['css_class']:15s} "
              f"words={len(g['words']):3d}  btn={g['btn_types']}")

    # Totals
    total_panels = total_section_panels + len(data['chapter_panels'])
    print(f"\n  TOTAL: {len(data['sections'])} sections, "
          f"{total_section_panels} section panels, "
          f"{len(data['chapter_panels'])} chapter panels, "
          f"{total_panels} total panels")

    # Validate
    issues = validate_extraction(html_path, out_path)
    if issues:
        print(f"\n  VALIDATION ISSUES ({len(issues)}):")
        for issue in issues:
            print(f"    ⚠ {issue}")
    else:
        print(f"\n  ✅ VALIDATION PASSED")

    return data


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    os.chdir(ROOT)

    if '--all' in sys.argv:
        extract_all()
    elif '--validate' in sys.argv:
        idx = sys.argv.index('--validate')
        if idx + 1 < len(sys.argv):
            issues = validate_extraction(sys.argv[idx + 1])
            if issues:
                print("Validation issues:")
                for i in issues:
                    print(f"  ⚠ {i}")
            else:
                print("✅ Validation passed")
    else:
        # Default: test on 3 diverse chapters
        tests = [
            ('_archive/ot/genesis/Genesis_1.html', 'Fully enriched, 5 sections, 9 panel types per section'),
            ('_archive/ot/isaiah/Isaiah_6.html', 'Enriched batch 1, 2 sections, 8 panel types per section'),
            ('_archive/ot/isaiah/Isaiah_50.html', 'Unenriched, 2 sections, 2 panel types per section'),
        ]
        for path, desc in tests:
            _test_chapter(path, desc)

        print(f"\n{'='*70}")
        print("Phase 0A test complete. Review output above for any issues.")
        print(f"JSON files written to content/genesis/ and content/isaiah/")
