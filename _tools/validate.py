#!/usr/bin/env python3
"""
validate.py — Comprehensive content JSON validator.

Checks all content/{book}/{ch}.json files for schema conformance,
cross-referential integrity, and completeness.

Usage:
    python3 _tools/validate.py
"""
import os, sys, json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
META = CONTENT / 'meta'
sys.path.insert(0, str(ROOT / '_tools'))

passed = 0
failed = 0


def check(label, condition, detail=''):
    global passed, failed
    if condition:
        passed += 1
    else:
        failed += 1
        msg = f"  ❌ {label}"
        if detail:
            msg += f" — {detail}"
        print(msg)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    global passed, failed

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
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses'):
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
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses'):
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

    check(f"{len(live_books)} live books", len(live_books) == 58,
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
            for key in ('id', 'name'):
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

    # ── Summary ──
    print(f"\n{'='*60}")
    print(f"RESULTS: {passed} passed, {failed} failed")
    if failed == 0:
        print("✅ ALL CONTENT CHECKS PASSED")
    else:
        print(f"❌ {failed} CHECKS FAILED")
    print(f"{'='*60}")

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    os.chdir(ROOT)
    sys.exit(main())
