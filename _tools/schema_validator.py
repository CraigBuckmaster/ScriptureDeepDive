#!/usr/bin/env python3
"""
schema_validator.py — Content JSON validator for Companion Study.

Checks all content/{book}/{ch}.json files and content/meta/*.json reference
data for schema conformance, cross-referential integrity, and completeness.

Validation sections:
  1. CHAPTER SCHEMA    — Required keys, section structure, panel types
  2. CROSS-REFERENCES  — Scholar scopes → valid books, people parent refs → valid IDs
  3. COMPLETENESS      — 66 live books, correct chapter counts
  4. PANEL DISTRIBUTION — Section/chapter panel type frequency counts
  5. FEATURE META      — Prophecy chains, concepts, difficult passages, debate topics schema

Exit codes:
  0 = all checks passed
  1 = one or more checks failed

Note: Count-mismatch failures (e.g. "expected 66 live books") are expected
when counts drift from hardcoded values. Only schema, panel, cross-ref, and
parent-ref failures indicate real problems.

Usage:
    python3 _tools/schema_validator.py
"""
import os, sys, json, re
from pathlib import Path
from collections import Counter, defaultdict
from difflib import SequenceMatcher

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
META = CONTENT / 'meta'
sys.path.insert(0, str(ROOT / '_tools'))

passed = 0
failed = 0
warnings = 0


def warn(label, detail=''):
    """Record a warning. Prints but does not affect pass/fail counts."""
    global warnings
    warnings += 1
    print(f"  [WARN] {label}" + (f" — {detail}" if detail else ""))


def check(label, condition, detail=''):
    """Record a pass/fail check. Only prints on failure to keep output clean.

    Args:
        label: Human-readable description of what's being checked
        condition: True = pass, False = fail
        detail: Optional extra info shown on failure (e.g. "got 5, expected 10")
    """
    global passed, failed
    if condition:
        passed += 1
    else:
        failed += 1
        msg = f"  [FAIL] {label}"
        if detail:
            msg += f" — {detail}"
        print(msg)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    """Run all content validation checks and print a summary.

    Returns 0 if all checks pass, 1 if any fail.
    """
    global passed, failed, warnings

    print("=" * 60)
    print("Content Validation")
    print("=" * 60)

    # ── Load reference data ──
    books = json.loads((META / 'books.json').read_text()) if (META / 'books.json').exists() else []
    live_books = {b['id']: b for b in books if b.get('is_live')}
    people_data = json.loads((META / 'people.json').read_text()) if (META / 'people.json').exists() else {}
    people_ids = {p['id'] for p in people_data.get('people', [])}
    scholars = json.loads((META / 'scholars.json').read_text()) if (META / 'scholars.json').exists() else []
    scholar_ids = {s['id'] for s in scholars}

    known_chapter_types = {
        'lit', 'themes', 'ppl', 'trans', 'src', 'rec',
        'hebtext', 'thread', 'tx', 'debate', 'discourse',
    }

    # ── 1. Schema validation per chapter ──
    print("\n--- 1. CHAPTER SCHEMA ---")

    total_files = 0
    total_sections = 0
    total_sec_panels = 0
    total_ch_panels = 0
    panel_type_counts = Counter()
    ch_panel_type_counts = Counter()
    hebtext_html = 0
    books_found = Counter()

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            total_files += 1
            books_found[book_dir.name] += 1

            try:
                with open(json_file) as f:
                    data = json.load(f)
            except json.JSONDecodeError as e:
                check(f"{json_file.name} valid JSON", False, str(e))
                continue

            # Required keys
            for key in ('book_dir', 'chapter_num', 'title', 'sections'):
                if key not in data:
                    check(f"{json_file.name} has '{key}'", False)

            sections = data.get('sections', [])
            check(f"{json_file.name} has sections", len(sections) >= 1,
                  f"got {len(sections)}")

            for i, sec in enumerate(sections):
                total_sections += 1
                if 'header' not in sec:
                    check(f"{json_file.name} S{i+1} has header", False)
                panels = sec.get('panels', {})
                total_sec_panels += len(panels)
                for ptype in panels:
                    panel_type_counts[ptype] += 1

            # Chapter panels
            cp = data.get('chapter_panels', {})
            total_ch_panels += len(cp)
            for ptype in cp:
                ch_panel_type_counts[ptype] += 1
                if ptype not in known_chapter_types:
                    check(f"{json_file.name} known ch panel type", False,
                          f"unknown: '{ptype}'")

            # hebtext must not be HTML
            hb = cp.get('hebtext')
            if isinstance(hb, str) and '<' in hb:
                hebtext_html += 1

    check("All hebtext clean (no HTML)", hebtext_html == 0,
          f"{hebtext_html} still have HTML")

    print(f"\n  Files: {total_files}")
    print(f"  Sections: {total_sections}")
    print(f"  Section panels: {total_sec_panels}")
    print(f"  Chapter panels: {total_ch_panels}")

    # ── 2. Cross-referential checks ──
    print("\n--- 2. CROSS-REFERENCES ---")

    # Scholar scopes reference valid books
    scopes_path = META / 'scholar-scopes.json'
    if scopes_path.exists():
        scopes = json.loads(scopes_path.read_text())
        all_book_ids = {b['id'] for b in books}
        bad_scope_refs = []
        for scholar_id, scope in scopes.items():
            if isinstance(scope, list):
                for book_id in scope:
                    if book_id not in all_book_ids:
                        bad_scope_refs.append(f"{scholar_id} → {book_id}")
        check("Scholar scopes reference valid books",
              len(bad_scope_refs) == 0, f"{bad_scope_refs[:5]}")

    # People father/mother refs
    people_list = people_data.get('people', [])
    bad_parents = []
    for p in people_list:
        for rel in ('father', 'mother'):
            ref = p.get(rel)
            if ref and ref not in people_ids:
                bad_parents.append(f"{p['id']}.{rel} → {ref}")
    check("People parent refs valid", len(bad_parents) == 0,
          f"{len(bad_parents)} broken: {bad_parents[:5]}")

    # VHL css_class values
    valid_css = {'vhl-divine', 'vhl-place', 'vhl-person', 'vhl-time', 'vhl-key'}
    bad_css = set()
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            with open(json_file) as f:
                data = json.load(f)
            for g in data.get('vhl_groups', []):
                css = g.get('css_class', '')
                if css and css not in valid_css:
                    bad_css.add(css)
    check("VHL css_class values valid", len(bad_css) == 0,
          f"unknown: {bad_css}")

    # ── 3. Completeness ──
    print("\n--- 3. COMPLETENESS ---")

    check(f"{len(live_books)} live books", len(live_books) == 66,
          f"got {len(live_books)}")

    # Every live book has correct chapter count
    for book_id, book in live_books.items():
        expected = book['total_chapters']
        actual = books_found.get(book_id, 0)
        if actual != expected:
            check(f"{book_id} has {expected} chapters", False,
                  f"got {actual}")

    total_expected = sum(b['total_chapters'] for b in live_books.values())
    total_live_files = sum(books_found.get(bid, 0) for bid in live_books)
    check(f"Total chapters = {total_expected}", total_live_files == total_expected,
          f"got {total_live_files}")

    # ── 4. Panel distribution ──
    print("\n--- 4. PANEL DISTRIBUTION ---")
    print("  Section panel types:")
    for ptype, count in panel_type_counts.most_common(15):
        print(f"    {ptype:12s}: {count}")
    print("  Chapter panel types:")
    for ptype, count in ch_panel_type_counts.most_common():
        print(f"    {ptype:12s}: {count}")

    # ── 5. Feature meta files ──
    print("\n--- 5. FEATURE META FILES ---")

    # Prophecy chains
    pc_path = META / 'prophecy-chains.json'
    if pc_path.exists():
        pc_data = json.loads(pc_path.read_text())
        check("prophecy-chains.json is list", isinstance(pc_data, list))
        for i, c in enumerate(pc_data):
            for key in ('id', 'title', 'category', 'type', 'links'):
                check(f"prophecy chain [{i}] has '{key}'", key in c,
                      f"chain {c.get('id', f'index {i}')} missing '{key}'")
            if 'links' in c:
                for j, link in enumerate(c['links']):
                    for lk in ('book_dir', 'chapter_num', 'verse_ref'):
                        check(f"chain {c.get('id','?')} link [{j}] has '{lk}'",
                              lk in link, f"missing '{lk}'")
        print(f"  prophecy chains: {len(pc_data)}")

    # Concepts
    co_path = META / 'concepts.json'
    if co_path.exists():
        co_data = json.loads(co_path.read_text())
        check("concepts.json is list", isinstance(co_data, list))
        for i, c in enumerate(co_data):
            for key in ('id', 'title'):
                check(f"concept [{i}] has '{key}'", key in c,
                      f"concept {c.get('id', f'index {i}')} missing '{key}'")
        print(f"  concepts: {len(co_data)}")

    # Difficult passages
    dp_path = META / 'difficult-passages.json'
    if dp_path.exists():
        dp_data = json.loads(dp_path.read_text())
        check("difficult-passages.json is list", isinstance(dp_data, list))
        for i, p in enumerate(dp_data):
            for key in ('id', 'title', 'category', 'severity', 'passage', 'question', 'responses'):
                check(f"difficult passage [{i}] has '{key}'", key in p,
                      f"passage {p.get('id', f'index {i}')} missing '{key}'")
            if 'responses' in p:
                for j, r in enumerate(p['responses']):
                    for rk in ('tradition', 'summary'):
                        check(f"passage {p.get('id','?')} response [{j}] has '{rk}'",
                              rk in r, f"missing '{rk}'")
        print(f"  difficult passages: {len(dp_data)}")

    # ── Debate Topics ──
    dt_path = META / 'debate-topics.json'
    if dt_path.exists():
        print("\n--- DEBATE TOPICS ---")
        dt_data = json.loads(dt_path.read_text())
        check("debate-topics.json is list", isinstance(dt_data, list))

        all_book_ids = {b['id'] for b in books}
        valid_categories = {'ethical', 'historical', 'interpretive', 'textual', 'theological'}
        tag_re = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*$')
        seen_topic_ids = set()
        enriched_count = 0
        unenriched_ids = []
        tag_format_warnings = 0

        for i, t in enumerate(dt_data):
            tid = t.get('id', f'index_{i}')

            # ── Structural: required skeleton fields ──
            for key in ('id', 'title', 'category', 'book_id', 'chapters', 'passage', 'question'):
                check(f"debate topic {tid} has '{key}'", key in t,
                      f"missing '{key}'")

            # Unique ID
            if 'id' in t:
                check(f"debate topic {tid} unique ID",
                      t['id'] not in seen_topic_ids,
                      f"duplicate ID: {t['id']}")
                seen_topic_ids.add(t['id'])

            # book_id referential integrity
            book_id = t.get('book_id')
            if book_id:
                check(f"debate topic {tid} book_id valid",
                      book_id in all_book_ids,
                      f"'{book_id}' not in books.json")

            # category membership
            cat = t.get('category')
            if cat:
                check(f"debate topic {tid} category valid",
                      cat in valid_categories,
                      f"'{cat}' not in {sorted(valid_categories)}")

            # positions non-empty list
            positions = t.get('positions', [])
            check(f"debate topic {tid} has positions",
                  isinstance(positions, list) and len(positions) >= 1,
                  f"got {len(positions) if isinstance(positions, list) else type(positions).__name__}")

            # Position structural validation
            for j, pos in enumerate(positions):
                for pk in ('id', 'label', 'tradition_family', 'argument'):
                    check(f"debate topic {tid} position [{j}] has '{pk}'",
                          pk in pos,
                          f"missing '{pk}'")

                # scholar_ids referential integrity (if present)
                for sid in pos.get('scholar_ids', []):
                    check(f"debate topic {tid} pos [{j}] scholar '{sid}' valid",
                          sid in scholar_ids,
                          f"'{sid}' not in scholars.json")

            # ── Enrichment completeness ──
            has_context = bool(t.get('context'))
            has_synthesis = bool(t.get('synthesis'))
            has_related = isinstance(t.get('related_passages'), list) and len(t.get('related_passages', [])) > 0
            has_tags = isinstance(t.get('tags'), list) and len(t.get('tags', [])) >= 3

            # Check position-level enrichment
            positions_enriched = True
            for pos in positions:
                if not (pos.get('strengths') and pos.get('weaknesses')):
                    positions_enriched = False
                if not (isinstance(pos.get('key_verses'), list) and len(pos.get('key_verses', [])) >= 2):
                    positions_enriched = False

            fully_enriched = all([has_context, has_synthesis, has_related, has_tags, positions_enriched])

            if fully_enriched:
                enriched_count += 1

                # Tag format check (warning only — existing data has non-conforming tags)
                for tag in t.get('tags', []):
                    if not tag_re.match(tag):
                        tag_format_warnings += 1
            else:
                unenriched_ids.append(tid)

        # Summary stats
        print(f"  Total topics: {len(dt_data)}")
        print(f"  Fully enriched: {enriched_count}")
        print(f"  Unenriched: {len(unenriched_ids)}")
        if tag_format_warnings > 0:
            print(f"  [WARN] {tag_format_warnings} tags have non-lowercase-hyphenated format (cleanup needed)")
        if unenriched_ids and len(unenriched_ids) <= 20:
            print(f"  Unenriched IDs: {unenriched_ids}")

    # ── 6. Life Topics ──
    life_topics_dir = CONTENT / 'life_topics'
    if life_topics_dir.is_dir():
        print("\n--- 6. LIFE TOPICS ---")

        # Load categories
        cat_path = life_topics_dir / 'categories.json'
        categories = []
        if cat_path.exists():
            categories = json.loads(cat_path.read_text())
            check("life_topics categories.json is list", isinstance(categories, list))
            category_ids = set()
            for i, cat in enumerate(categories):
                for key in ('id', 'name', 'display_order'):
                    check(f"category [{i}] has '{key}'", key in cat,
                          f"category {cat.get('id', f'index {i}')} missing '{key}'")
                if 'id' in cat:
                    category_ids.add(cat['id'])
            print(f"  categories: {len(categories)}")
        else:
            category_ids = set()
            check("life_topics categories.json exists", False, "file not found")

        # Load topic files
        topics_dir = life_topics_dir / 'topics'
        topic_files = sorted(topics_dir.glob('*.json')) if topics_dir.is_dir() else []
        topic_ids = set()
        for json_file in topic_files:
            try:
                t = json.loads(json_file.read_text())
            except json.JSONDecodeError as e:
                check(f"{json_file.name} valid JSON", False, str(e))
                continue

            for key in ('id', 'category_id', 'title', 'summary', 'body', 'display_order'):
                check(f"topic {json_file.stem} has '{key}'", key in t,
                      f"missing '{key}'")

            tid = t.get('id', json_file.stem)
            topic_ids.add(tid)

            # Referential integrity: category_id
            cat_id = t.get('category_id')
            if cat_id:
                check(f"topic {tid} category_id references valid category",
                      cat_id in category_ids,
                      f"'{cat_id}' not in categories.json")

            # Referential integrity: scholar_id
            for j, s in enumerate(t.get('scholars', [])):
                sid = s.get('scholar_id')
                if sid:
                    check(f"topic {tid} scholar [{j}] references valid scholar",
                          sid in scholar_ids,
                          f"'{sid}' not in scholars.json")

            # Verse entries have required fields
            for j, v in enumerate(t.get('verses', [])):
                for vk in ('verse_ref', 'verse_order'):
                    check(f"topic {tid} verse [{j}] has '{vk}'", vk in v,
                          f"missing '{vk}'")

        # Related topic refs point to known topic IDs
        for json_file in topic_files:
            try:
                t = json.loads(json_file.read_text())
            except json.JSONDecodeError:
                continue
            tid = t.get('id', json_file.stem)
            for rel in t.get('related', []):
                check(f"topic {tid} related '{rel}' references valid topic",
                      rel in topic_ids,
                      f"'{rel}' not found among topic files")

        print(f"  topics: {len(topic_files)}")

    # ── 7. Archaeological Evidence ──
    arch_path = CONTENT / 'archaeology' / 'discoveries.json'
    if arch_path.exists():
        print("\n--- 7. ARCHAEOLOGICAL EVIDENCE ---")
        arch_data = json.loads(arch_path.read_text())
        check("archaeology discoveries.json is list", isinstance(arch_data, list))
        discovery_ids = set()
        for i, d in enumerate(arch_data):
            for key in ('id', 'name', 'category', 'significance', 'description'):
                check(f"discovery [{i}] has '{key}'", key in d,
                      f"discovery {d.get('id', f'index {i}')} missing '{key}'")
            if 'id' in d:
                discovery_ids.add(d['id'])
            # Verse links validation
            for j, v in enumerate(d.get('verse_links', [])):
                check(f"discovery {d.get('id','?')} verse_link [{j}] has 'verse_ref'",
                      'verse_ref' in v, f"missing 'verse_ref'")
        print(f"  discoveries: {len(arch_data)}")

    # Greek lexicon
    gl_path = META / 'lexicon-greek.json'
    if gl_path.exists():
        gl_data = json.loads(gl_path.read_text())
        check("lexicon-greek.json is list", isinstance(gl_data, list))
        seen_strongs = set()
        for i, e in enumerate(gl_data):
            strongs = e.get('strongs', '')
            for key in ('strongs', 'language', 'lemma', 'transliteration', 'definition'):
                check(f"lexicon entry [{i}] has '{key}'", key in e,
                      f"entry {strongs or f'index {i}'} missing '{key}'")
            # Validate strongs format
            if strongs:
                check(f"lexicon entry {strongs} valid format",
                      re.match(r'^G\d{4}$', strongs) is not None,
                      f"invalid strongs format: {strongs}")
                check(f"lexicon entry {strongs} not duplicate",
                      strongs not in seen_strongs,
                      f"duplicate strongs: {strongs}")
                seen_strongs.add(strongs)
            # Check definition structure
            if 'definition' in e:
                check(f"lexicon entry {strongs} has definition.short",
                      'short' in e['definition'] and e['definition']['short'],
                      f"{strongs} missing definition.short")
        print(f"  Greek lexicon entries: {len(gl_data)}")

    # Hebrew lexicon
    hl_path = META / 'lexicon-hebrew.json'
    if hl_path.exists():
        hl_data = json.loads(hl_path.read_text())
        check("lexicon-hebrew.json is list", isinstance(hl_data, list))
        seen_strongs = set()
        for i, e in enumerate(hl_data):
            strongs = e.get('strongs', '')
            for key in ('strongs', 'language', 'lemma', 'transliteration', 'definition'):
                check(f"hebrew lexicon entry [{i}] has '{key}'", key in e,
                      f"entry {strongs or f'index {i}'} missing '{key}'")
            if strongs:
                check(f"hebrew lexicon entry {strongs} valid format",
                      re.match(r'^H\d{4}$', strongs) is not None,
                      f"invalid strongs format: {strongs}")
                check(f"hebrew lexicon entry {strongs} not duplicate",
                      strongs not in seen_strongs,
                      f"duplicate strongs: {strongs}")
                seen_strongs.add(strongs)
            if 'definition' in e:
                check(f"hebrew lexicon entry {strongs} has definition.short",
                      'short' in e['definition'] and e['definition']['short'],
                      f"{strongs} missing definition.short")
        print(f"  Hebrew lexicon entries: {len(hl_data)}")

    # ── 8. Timeline link validation ──
    print("\n--- 8. TIMELINE LINK VALIDATION ---")

    tl_path = META / 'timelines.json'
    if tl_path.exists():
        tl_data = json.loads(tl_path.read_text())
        valid_event_ids = set()
        for key, val in tl_data.items():
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, dict) and 'id' in item:
                        valid_event_ids.add(item['id'])

        tl_checked = 0
        tl_invalid = 0
        for book_dir in sorted(CONTENT.iterdir()):
            if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
                continue
            for json_file in sorted(book_dir.glob('*.json')):
                try:
                    with open(json_file) as f:
                        data = json.load(f)
                except json.JSONDecodeError:
                    continue
                tl = data.get('timeline_link')
                if isinstance(tl, dict):
                    eid = tl.get('event_id')
                    if eid:
                        tl_checked += 1
                        if eid not in valid_event_ids:
                            tl_invalid += 1
                            check(f"{json_file.name} timeline_link event_id valid",
                                  False, f"'{eid}' not in timelines.json")

        print(f"  Timeline links checked: {tl_checked}")
        print(f"  Invalid event IDs: {tl_invalid}")
    else:
        print("  timelines.json not found — skipping")

    # ── 9. Near-duplicate detection ──
    print("\n--- 9. NEAR-DUPLICATE DETECTION ---")

    dup_count = 0
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                with open(json_file) as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                continue
            # Group scholar notes by panel_key within this chapter
            scholar_notes = defaultdict(list)
            for sec in data.get('sections', []):
                panels = sec.get('panels', {})
                for panel_key, panel_val in panels.items():
                    if panel_key in ('heb', 'cross'):
                        continue
                    if isinstance(panel_val, dict):
                        for note_obj in panel_val.get('notes', []):
                            note_text = note_obj.get('note', '')
                            if note_text:
                                scholar_notes[panel_key].append(note_text)
            # Compare pairs within same scholar+chapter
            for panel_key, notes in scholar_notes.items():
                for i in range(len(notes)):
                    for j in range(i + 1, len(notes)):
                        ratio = SequenceMatcher(None, notes[i], notes[j]).ratio()
                        if ratio > 0.85:
                            dup_count += 1
                            warn(f"{json_file.name} [{panel_key}] near-duplicate notes",
                                 f"ratio={ratio:.2f}")

    print(f"  Near-duplicates found: {dup_count}")

    # ── 10. Coaching tip bounds check ──
    print("\n--- 10. COACHING TIP BOUNDS CHECK ---")

    oob_tips = 0
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                with open(json_file) as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                continue
            sections = data.get('sections', [])
            for tip in data.get('coaching', []):
                after = tip.get('after_section')
                if after is not None and not (0 <= after < len(sections)):
                    oob_tips += 1
                    warn(f"{json_file.name} coaching after_section out of bounds",
                         f"after_section={after}, sections=0..{len(sections)-1}")

    print(f"  Out-of-bounds coaching tips: {oob_tips}")

    # ── 11. Scholar scope enforcement ──
    print("\n--- 11. SCHOLAR SCOPE ENFORCEMENT ---")

    scope_violations = 0
    scopes_path_11 = META / 'scholar-scopes.json'
    if scopes_path_11.exists():
        scopes_data = json.loads(scopes_path_11.read_text())
        for book_dir in sorted(CONTENT.iterdir()):
            if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
                continue
            for json_file in sorted(book_dir.glob('*.json')):
                try:
                    with open(json_file) as f:
                        data = json.load(f)
                except json.JSONDecodeError:
                    continue
                bdir = data.get('book_dir', book_dir.name)
                for sec in data.get('sections', []):
                    panels = sec.get('panels', {})
                    for panel_key in panels:
                        if panel_key not in scopes_data:
                            continue
                        allowed = scopes_data[panel_key]
                        if allowed == 'all':
                            continue
                        if isinstance(allowed, list) and bdir not in allowed:
                            scope_violations += 1
                            warn(f"{json_file.name} scholar '{panel_key}' out of scope",
                                 f"book_dir='{bdir}' not in {allowed}")

        print(f"  Scope violations: {scope_violations}")
    else:
        print("  scholar-scopes.json not found — skipping")

    # ── 12. Hebrew/Greek gloss consistency ──
    print("\n--- 12. HEBREW/GREEK GLOSS CONSISTENCY ---")

    word_glosses = defaultdict(set)
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                with open(json_file) as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                continue
            for sec in data.get('sections', []):
                panels = sec.get('panels', {})
                heb_entries = panels.get('heb', [])
                if isinstance(heb_entries, list):
                    for entry in heb_entries:
                        word = entry.get('word', '')
                        gloss = entry.get('gloss', '')
                        if word and gloss:
                            word_glosses[word].add(gloss.strip().lower())

    divergent_count = 0
    for word, glosses in word_glosses.items():
        if len(glosses) > 3:
            divergent_count += 1
            print(f"  [INFO] '{word}' has {len(glosses)} distinct glosses: {sorted(glosses)[:5]}...")

    print(f"  Divergent words (>3 glosses): {divergent_count}")

    # ── Summary ──
    print(f"\n{'='*60}")
    print(f"RESULTS: {passed} passed, {failed} failed, {warnings} warnings")
    if failed == 0:
        print("[OK] ALL CONTENT CHECKS PASSED")
    else:
        print(f"[FAIL] {failed} CHECKS FAILED")
    print(f"{'='*60}")

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description="Content validation + quality scoring")
    parser.add_argument("--quality", action="store_true",
                        help="Run quality scoring after validation")
    parser.add_argument("--book", type=str, default=None,
                        help="Quality: evaluate a single book (e.g. genesis)")
    parser.add_argument("--chapter", type=str, default=None,
                        help="Quality: evaluate a single chapter (e.g. gen1)")
    parser.add_argument("--deep", action="store_true",
                        help="Quality: use LLM for relevance scoring")
    parser.add_argument("--worst", type=int, default=10,
                        help="Quality: show N lowest-scoring chapters (default: 10)")
    parser.add_argument("--json", action="store_true",
                        help="Quality: save report to _tools/quality_report.json")
    parser.add_argument("--verbose", action="store_true",
                        help="Quality: show findings for all chapters")
    parser.add_argument("--api-key", type=str, default=None,
                        help="Quality: Anthropic API key for --deep mode")
    parser.add_argument("--accuracy", action="store_true",
                        help="Run accuracy audit (Tier 0+1, free)")
    parser.add_argument("--accuracy-deep", action="store_true",
                        help="Run accuracy audit with API (Tier 0-2, costs money)")

    args = parser.parse_args()
    os.chdir(ROOT)

    # Always run structural validation
    result = main()

    # Optionally run quality scoring
    if args.quality:
        from quality_scorer import QualityEvaluator
        evaluator = QualityEvaluator(
            content_dir="content",
            verse_dir="content/verses",
            deep=args.deep,
            api_key=args.api_key,
        )
        report = evaluator.run(book=args.book, chapter=args.chapter)
        report.print_terminal(worst_n=args.worst, verbose=args.verbose)
        if args.json:
            report.save_json("_tools/quality_report.json")

    # Optionally run accuracy audit
    if args.accuracy or args.accuracy_deep:
        import subprocess
        tier = "2" if args.accuracy_deep else "1"
        cmd = ["python3", "_tools/accuracy_auditor.py", "--tier", tier]
        if args.book:
            cmd.extend(["--book", args.book])
        if args.chapter:
            cmd.extend(["--chapter", args.chapter])
        print(f"\n{'═' * 60}")
        print(f"  Running accuracy audit (Tier {tier})...")
        print(f"{'═' * 60}\n")
        audit_result = subprocess.run(cmd)
        if audit_result.returncode != 0:
            result = 1

    sys.exit(result)
