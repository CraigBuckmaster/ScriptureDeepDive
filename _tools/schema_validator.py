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
 19. JOURNEY VALIDATION — Journey JSON schema, stop structure, cross-file linked refs

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

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
META = CONTENT / 'meta'
sys.path.insert(0, str(ROOT / '_tools'))

# Subdirectories of content/ that are NOT books and must be skipped by every
# chapter-walk loop. Kept as a single source of truth so adding a new content
# directory (e.g. hermeneutic_lenses) only requires one edit, not eleven.
NON_BOOK_DIRS = frozenset({
    'meta', 'verses', 'interlinear', 'archaeology', 'life_topics',
    'historical_interpretations', 'grammar', 'map-styles',
    'hermeneutic_lenses',
})

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
_FAQ_FRONTMATTER_RE = re.compile(r'^---\n(.*?)\n---\n(.*)$', re.DOTALL)


def _validate_meta_faq():
    """Section 20 META-FAQ (Card #1449) — validates the editorial meta-FAQ
    corpus in content/meta_faq/*.md. Every article must have an `id`, `title`,
    and `tags` frontmatter field, a non-empty body, and a word count under 700.
    Runs only if the directory exists (so the check is a no-op on branches
    that do not include the corpus)."""
    faq_dir = CONTENT / 'meta_faq'
    if not faq_dir.is_dir():
        return

    print("\n--- 20. META-FAQ ---")
    # PLAYBOOK.md documents the meta-faq track; it's not itself an article.
    # Skip it (and any future ALL-CAPS .md docs) — articles have lowercase
    # snake_case filenames matching their frontmatter `id`.
    articles = sorted(md for md in faq_dir.glob('*.md') if md.stem.islower())
    check(f"meta_faq directory present with {len(articles)} articles",
          len(articles) >= 1, f"got {len(articles)}")

    seen_ids: set[str] = set()
    for md in articles:
        raw = md.read_text(encoding='utf-8')
        m = _FAQ_FRONTMATTER_RE.match(raw)
        if not m:
            check(f"{md.name} has frontmatter", False,
                  'missing --- ... --- block')
            continue
        fm_text, body = m.group(1), m.group(2)
        fm = {}
        for line in fm_text.splitlines():
            if ':' in line:
                key, _, val = line.partition(':')
                fm[key.strip()] = val.strip()
        for required in ('id', 'title', 'tags'):
            check(f"{md.name}: '{required}' frontmatter",
                  bool(fm.get(required)), f"missing or empty {required}")
        fid = fm.get('id', '')
        if fid:
            check(f"{md.name}: unique id",
                  fid not in seen_ids, f"duplicate id '{fid}'")
            seen_ids.add(fid)
            check(f"{md.name}: id matches filename",
                  fid == md.stem,
                  f"id '{fid}' != filename '{md.stem}'")
        body = body.strip()
        check(f"{md.name}: non-empty body",
              bool(body), 'body is empty')
        word_count = len(body.split())
        check(f"{md.name}: word count < 700 ({word_count})",
              word_count < 700,
              f'article is {word_count} words; spec says under 500-ish, cap 700')


def _validate_hermeneutic_lenses():
    """Section 21 HERMENEUTIC LENSES (Epic #820) — validates lens definitions
    and per-chapter guidance entries.

    Required structure:
        content/hermeneutic_lenses/
        ├── lenses.json                    # 8 lens definitions
        └── chapters/
            └── <chapter_id>.json          # {lenses: [{lens_id, guidance, ...}]}

    Gracefully passes if directory absent (Phase 0 ships the loader before
    Phase 2+ writes content).
    """
    print("\n--- 21. HERMENEUTIC LENSES ---")
    lens_dir = CONTENT / 'hermeneutic_lenses'
    if not lens_dir.is_dir():
        print("  (directory absent; skipping — expected before Phase 0)")
        return

    # ── lenses.json ──
    lenses_path = lens_dir / 'lenses.json'
    check("hermeneutic_lenses/lenses.json present", lenses_path.exists())
    if not lenses_path.exists():
        return

    try:
        lenses = json.loads(lenses_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as err:
        check(f"lenses.json valid JSON", False, str(err))
        return

    check("lenses.json is a list", isinstance(lenses, list))
    if not isinstance(lenses, list):
        return

    seen_ids: set[str] = set()
    seen_orders: set[int] = set()
    id_pattern = re.compile(r"^[a-z][a-z0-9_]*$")
    for i, lens in enumerate(lenses):
        ctx = f"lens[{i}]"
        if not isinstance(lens, dict):
            check(f"{ctx} is object", False)
            continue
        for required in ('id', 'name', 'description', 'display_order'):
            check(f"{ctx} has '{required}'",
                  required in lens and lens[required] not in (None, ''),
                  f"missing or empty {required}")
        lid = lens.get('id', '')
        if lid:
            check(f"{ctx} id '{lid}' format", bool(id_pattern.match(lid)),
                  "must match ^[a-z][a-z0-9_]*$")
            check(f"{ctx} id '{lid}' unique", lid not in seen_ids)
            seen_ids.add(lid)
        order = lens.get('display_order')
        if isinstance(order, int):
            check(f"{ctx} display_order {order} unique",
                  order not in seen_orders)
            seen_orders.add(order)
        # Optional length checks for the description fields.
        desc = lens.get('description', '')
        if desc:
            check(f"{ctx} description length 20-160", 20 <= len(desc) <= 160,
                  f"got {len(desc)}")
        long_desc = lens.get('long_description')
        if long_desc:
            check(f"{ctx} long_description length 80-500",
                  80 <= len(long_desc) <= 500, f"got {len(long_desc)}")

    valid_lens_ids = seen_ids

    # ── chapter files ──
    chapters_dir = lens_dir / 'chapters'
    if not chapters_dir.is_dir():
        print("  chapters/ directory absent (expected; Phase 2+ adds content)")
        return

    # Build the panel-key allowlist using the same source as lens_quality_scorer.
    try:
        from panel_taxonomy import (
            CORE_SECTION_PANELS as _CORE,
            CHAPTER_PANEL_TYPES as _CHTYPES,
            load_scholar_keys as _lsk,
        )
        all_panel_keys = _CORE | _CHTYPES | _lsk(CONTENT)
    except ImportError:
        all_panel_keys = set()
        warn("panel_taxonomy not importable — skipping panel-key allowlist check")

    # Build the set of valid chapter_ids from books.json + chapter files.
    valid_chapter_ids: set[str] = set()
    for book_dir in CONTENT.iterdir():
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for chap_file in book_dir.glob('*.json'):
            try:
                cid = json.loads(chap_file.read_text(encoding='utf-8')).get('chapter_id')
                if cid:
                    valid_chapter_ids.add(cid)
            except (json.JSONDecodeError, OSError):
                continue

    chapter_files = sorted(chapters_dir.glob('*.json'))
    print(f"  chapter files: {len(chapter_files)}")
    total_entries = 0
    for cf in chapter_files:
        chapter_id = cf.stem
        if valid_chapter_ids:
            check(f"chapters/{cf.name}: chapter_id '{chapter_id}' exists",
                  chapter_id in valid_chapter_ids)
        try:
            data = json.loads(cf.read_text(encoding='utf-8'))
        except json.JSONDecodeError as err:
            check(f"chapters/{cf.name}: valid JSON", False, str(err))
            continue
        check(f"chapters/{cf.name}: has 'lenses' list",
              isinstance(data.get('lenses'), list))
        seen_lens_for_chapter: set[str] = set()
        for j, entry in enumerate(data.get('lenses', []) or []):
            ctx = f"chapters/{cf.name}#{j}"
            if not isinstance(entry, dict):
                check(f"{ctx} is object", False)
                continue
            lens_id = entry.get('lens_id', '')
            check(f"{ctx} has lens_id", bool(lens_id))
            if lens_id and valid_lens_ids:
                check(f"{ctx} lens_id '{lens_id}' is registered",
                      lens_id in valid_lens_ids)
            check(f"{ctx} lens_id '{lens_id}' unique within chapter",
                  lens_id not in seen_lens_for_chapter,
                  "same lens listed twice for one chapter")
            seen_lens_for_chapter.add(lens_id)

            guidance = entry.get('guidance', '')
            check(f"{ctx} has guidance", bool(guidance))
            if guidance:
                check(f"{ctx} guidance length 80-280",
                      80 <= len(guidance) <= 280,
                      f"got {len(guidance)}")

            for field_name in ('panel_filter', 'panel_order'):
                fval = entry.get(field_name)
                if fval is None:
                    continue
                check(f"{ctx} {field_name} is list",
                      isinstance(fval, list))
                if not isinstance(fval, list):
                    continue
                check(f"{ctx} {field_name} non-empty",
                      len(fval) > 0,
                      "empty list would hide everything; omit instead")
                check(f"{ctx} {field_name} values are strings",
                      all(isinstance(k, str) for k in fval))
                check(f"{ctx} {field_name} no duplicates",
                      len(set(fval)) == len(fval))
                if all_panel_keys:
                    bad = [k for k in fval if k not in all_panel_keys]
                    check(f"{ctx} {field_name} keys all valid",
                          not bad,
                          f"unknown keys: {bad}")

            if 'panel_filter' in entry and 'panel_order' in entry:
                f_set = set(entry.get('panel_filter') or [])
                o_set = set(entry.get('panel_order') or [])
                extra = o_set - f_set
                check(f"{ctx} panel_order subset of panel_filter",
                      not extra,
                      f"order has keys missing from filter: {sorted(extra)}")
            total_entries += 1
    print(f"  total entries: {total_entries}")


def main():
    """Run all content validation checks and print a summary.

    Returns 0 if all checks pass, 1 if any fail.
    """
    global passed, failed, warnings

    print("=" * 60)
    print("Content Validation")
    print("=" * 60)

    # ── Load reference data ──
    books_raw = json.loads((META / 'books.json').read_text(encoding='utf-8')) if (META / 'books.json').exists() else []
    books = books_raw if isinstance(books_raw, list) else books_raw.get('books', []) if isinstance(books_raw, dict) else []
    live_books = {b['id']: b for b in books if b.get('is_live')}

    people_raw = json.loads((META / 'people.json').read_text(encoding='utf-8')) if (META / 'people.json').exists() else {}
    # people.json may be {people: [...]} (object) or [...] (array)
    if isinstance(people_raw, list):
        people_list_ref = people_raw
    elif isinstance(people_raw, dict):
        people_list_ref = people_raw.get('people', [])
    else:
        people_list_ref = []
    people_data = {'people': people_list_ref}  # normalize for downstream code
    people_ids = {p['id'] for p in people_list_ref}

    scholars_raw = json.loads((META / 'scholars.json').read_text(encoding='utf-8')) if (META / 'scholars.json').exists() else []
    scholars = scholars_raw if isinstance(scholars_raw, list) else list(scholars_raw.values()) if isinstance(scholars_raw, dict) else []
    scholar_ids = {s['id'] for s in scholars}

    known_chapter_types = {
        'lit', 'themes', 'ppl', 'trans', 'src', 'rec',
        'hebtext', 'thread', 'tx', 'debate', 'discourse',
    }

    CURRENT_SCHEMA_VERSION = '1.0'

    # ── 1. Schema validation per chapter ──
    print("\n--- 1. CHAPTER SCHEMA ---")

    stale_schema_count = 0
    total_files = 0
    total_sections = 0
    total_sec_panels = 0
    total_ch_panels = 0
    panel_type_counts = Counter()
    ch_panel_type_counts = Counter()
    hebtext_html = 0
    books_found = Counter()

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            total_files += 1
            books_found[book_dir.name] += 1

            try:
                with open(json_file, encoding='utf-8') as f:
                    data = json.load(f)
            except json.JSONDecodeError as e:
                check(f"{json_file.name} valid JSON", False, str(e))
                continue

            # Required keys
            for key in ('book_dir', 'chapter_num', 'title', 'sections'):
                if key not in data:
                    check(f"{json_file.name} has '{key}'", False)

            # Schema version check
            sv = data.get('schema_version', '0.0')
            if sv != CURRENT_SCHEMA_VERSION:
                stale_schema_count += 1

            # Per-chapter genre override (#1724) — atomic both-or-neither.
            # If a chapter sets one of (chapter_genre_label, chapter_genre_guidance)
            # it must set the other; otherwise the resolver in app code falls
            # through to book-level entirely (mismatched mixing is forbidden).
            has_label = 'chapter_genre_label' in data
            has_guidance = 'chapter_genre_guidance' in data
            if has_label != has_guidance:
                check(f"{json_file.name} chapter genre fields paired", False,
                      "must set both chapter_genre_label and chapter_genre_guidance, or neither")
            elif has_label and has_guidance:
                lbl = data['chapter_genre_label']
                gdc = data['chapter_genre_guidance']
                if not isinstance(lbl, str) or not lbl.strip():
                    check(f"{json_file.name} chapter_genre_label non-empty string", False)
                if not isinstance(gdc, str) or not gdc.strip():
                    check(f"{json_file.name} chapter_genre_guidance non-empty string", False)

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

    if stale_schema_count > 0:
        warn(f"{stale_schema_count}/{total_files} files at stale schema version (run migrate_content.py)")

    print(f"\n  Files: {total_files}")
    print(f"  Sections: {total_sections}")
    print(f"  Section panels: {total_sec_panels}")
    print(f"  Chapter panels: {total_ch_panels}")

    # ── 2. Cross-referential checks ──
    print("\n--- 2. CROSS-REFERENCES ---")

    # Scholar scopes reference valid books
    scopes_path = META / 'scholar-scopes.json'
    if scopes_path.exists():
        scopes = json.loads(scopes_path.read_text(encoding='utf-8'))
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

    # People journey/legacy_refs validation (#1125)
    all_book_ids_pj = {b['id'] for b in books}
    tl_pj = META / 'timelines.json'
    valid_era_keys_pj = set()
    if tl_pj.exists():
        valid_era_keys_pj = set(json.loads(tl_pj.read_text(encoding='utf-8')).get('era_config', {}).keys())

    journey_count = 0
    for p in people_list:
        pid = p.get('id', '?')

        # journey — optional array of stage objects
        journey = p.get('journey')
        if journey is not None:
            check(f"person {pid} journey is list", isinstance(journey, list))
            if isinstance(journey, list):
                journey_count += 1
                for j, stage in enumerate(journey):
                    for sk in ('stage', 'summary'):
                        check(f"person {pid} journey [{j}] has '{sk}'",
                              sk in stage, f"missing '{sk}'")

                    # era cross-reference
                    sera = stage.get('era')
                    if sera and valid_era_keys_pj:
                        check(f"person {pid} journey [{j}] era valid",
                              sera in valid_era_keys_pj,
                              f"'{sera}' not in era_config")

                    # book_dir cross-reference
                    sbook = stage.get('book_dir')
                    if sbook:
                        check(f"person {pid} journey [{j}] book_dir valid",
                              sbook in all_book_ids_pj,
                              f"'{sbook}' not in books.json")

        # legacy_refs — optional array of {ref, note}
        legacy = p.get('legacy_refs')
        if legacy is not None:
            check(f"person {pid} legacy_refs is list", isinstance(legacy, list))
            if isinstance(legacy, list):
                for j, lr in enumerate(legacy):
                    for lk in ('ref', 'note'):
                        check(f"person {pid} legacy_ref [{j}] has '{lk}'",
                              lk in lr, f"missing '{lk}'")

    if journey_count > 0:
        print(f"  people with journeys: {journey_count}")

    # VHL css_class values
    valid_css = {'vhl-divine', 'vhl-place', 'vhl-person', 'vhl-time', 'vhl-key'}
    bad_css = set()
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            with open(json_file, encoding='utf-8') as f:
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

    # ── Book intros enrichment (optional fields — #1111) ──
    bi_path = META / 'book-intros.json'
    if bi_path.exists():
        bi_data = json.loads(bi_path.read_text(encoding='utf-8'))
        check("book-intros.json is list", isinstance(bi_data, list))

        # Load valid era keys for cross-reference validation
        tl_path_bi = META / 'timelines.json'
        valid_era_keys = set()
        if tl_path_bi.exists():
            tl_bi = json.loads(tl_path_bi.read_text(encoding='utf-8'))
            valid_era_keys = set(tl_bi.get('era_config', {}).keys())

        enriched_bi = 0
        for i, intro in enumerate(bi_data):
            bid = intro.get('book', f'index_{i}')

            # era — optional, must match a valid era_config key
            era = intro.get('era')
            if era is not None:
                check(f"book-intro {bid} era valid",
                      era in valid_era_keys,
                      f"'{era}' not in era_config")

            # era_span — optional array of valid era keys
            era_span = intro.get('era_span')
            if era_span is not None:
                check(f"book-intro {bid} era_span is list",
                      isinstance(era_span, list))
                if isinstance(era_span, list):
                    for ek in era_span:
                        check(f"book-intro {bid} era_span key '{ek}' valid",
                              ek in valid_era_keys,
                              f"'{ek}' not in era_config")

            # purpose — optional non-empty string
            purpose = intro.get('purpose')
            if purpose is not None:
                check(f"book-intro {bid} purpose non-empty",
                      isinstance(purpose, str) and len(purpose.strip()) > 0)

            # key_verses — optional array of {ref, text, why}
            kv = intro.get('key_verses')
            if kv is not None:
                check(f"book-intro {bid} key_verses is list",
                      isinstance(kv, list))
                if isinstance(kv, list):
                    for j, verse in enumerate(kv):
                        for vk in ('ref', 'text', 'why'):
                            check(f"book-intro {bid} key_verse [{j}] has '{vk}'",
                                  vk in verse,
                                  f"missing '{vk}'")

            # christ_in — optional non-empty string
            ci = intro.get('christ_in')
            if ci is not None:
                check(f"book-intro {bid} christ_in non-empty",
                      isinstance(ci, str) and len(ci.strip()) > 0)

            # outline — optional array of {label, range, summary}
            ol = intro.get('outline')
            if ol is not None:
                check(f"book-intro {bid} outline is list",
                      isinstance(ol, list))
                if isinstance(ol, list):
                    for j, item in enumerate(ol):
                        for ok in ('label', 'range', 'summary'):
                            check(f"book-intro {bid} outline [{j}] has '{ok}'",
                                  ok in item,
                                  f"missing '{ok}'")

            # at_a_glance — optional object with required sub-fields
            aag = intro.get('at_a_glance')
            if aag is not None:
                check(f"book-intro {bid} at_a_glance is object",
                      isinstance(aag, dict))
                if isinstance(aag, dict):
                    for ak in ('author', 'date', 'chapters', 'genre', 'key_theme', 'key_word'):
                        check(f"book-intro {bid} at_a_glance has '{ak}'",
                              ak in aag,
                              f"missing '{ak}'")

            # Track enrichment progress
            has_enrichment = any(intro.get(f) is not None for f in
                                ('era', 'purpose', 'key_verses', 'christ_in', 'outline', 'at_a_glance'))
            if has_enrichment:
                enriched_bi += 1

        print(f"  book intros: {len(bi_data)} total, {enriched_bi} enriched")

    # ── Redemptive arc (#1118) ──
    ra_path = META / 'redemptive-arc.json'
    if ra_path.exists():
        ra_data = json.loads(ra_path.read_text(encoding='utf-8'))
        check("redemptive-arc.json is object", isinstance(ra_data, dict))

        # Load valid cross-reference IDs
        tl_ra = META / 'timelines.json'
        valid_era_keys_ra = set()
        if tl_ra.exists():
            valid_era_keys_ra = set(json.loads(tl_ra.read_text(encoding='utf-8')).get('era_config', {}).keys())

        pc_ra = META / 'prophecy-chains.json'
        valid_chain_ids = set()
        if pc_ra.exists():
            for c in json.loads(pc_ra.read_text(encoding='utf-8')):
                if 'id' in c:
                    valid_chain_ids.add(c['id'])

        # Validate acts array
        acts = ra_data.get('acts', [])
        check("redemptive-arc has acts", isinstance(acts, list) and len(acts) >= 1,
              f"got {len(acts) if isinstance(acts, list) else type(acts).__name__}")

        for i, act in enumerate(acts):
            aid = act.get('id', f'index_{i}')
            for key in ('id', 'name', 'tagline', 'summary', 'key_verse'):
                check(f"redemptive act {aid} has '{key}'", key in act,
                      f"missing '{key}'")

            # era_ids — must reference valid era_config keys
            era_ids = act.get('era_ids', [])
            if era_ids:
                check(f"redemptive act {aid} era_ids is list", isinstance(era_ids, list))
                if isinstance(era_ids, list):
                    for eid in era_ids:
                        check(f"redemptive act {aid} era '{eid}' valid",
                              eid in valid_era_keys_ra,
                              f"'{eid}' not in era_config")

            # book_range — optional string
            book_range = act.get('book_range')
            if book_range is not None:
                check(f"redemptive act {aid} book_range is string",
                      isinstance(book_range, str) and len(book_range.strip()) > 0)

            # threads — optional list of thread IDs
            threads = act.get('threads', [])
            if threads:
                check(f"redemptive act {aid} threads is list", isinstance(threads, list))

            # prophecy_chains — optional list of chain IDs
            chains = act.get('prophecy_chains', [])
            if chains and valid_chain_ids:
                for cid in chains:
                    check(f"redemptive act {aid} chain '{cid}' valid",
                          cid in valid_chain_ids,
                          f"'{cid}' not in prophecy-chains.json")

        # Validate chapter_map (nested: book_id -> {chapter_num: act_id})
        chapter_map = ra_data.get('chapter_map', {})
        total_mappings = 0
        if chapter_map:
            check("redemptive-arc chapter_map is object", isinstance(chapter_map, dict))
            act_ids = {a.get('id') for a in acts}
            all_book_ids_ra = {b['id'] for b in books}
            for book_id, chapters in chapter_map.items():
                check(f"chapter_map {book_id} is valid book",
                      book_id in all_book_ids_ra,
                      f"'{book_id}' not in books.json")
                if isinstance(chapters, dict):
                    for ch_num, act_id in chapters.items():
                        total_mappings += 1
                        check(f"chapter_map {book_id}:{ch_num} references valid act",
                              act_id in act_ids,
                              f"'{act_id}' not in acts")

        print(f"  redemptive arc: {len(acts)} acts, {total_mappings} chapter mappings")

    # Prophecy chains
    pc_path = META / 'prophecy-chains.json'
    if pc_path.exists():
        pc_data = json.loads(pc_path.read_text(encoding='utf-8'))
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
        co_data = json.loads(co_path.read_text(encoding='utf-8'))
        check("concepts.json is list", isinstance(co_data, list))
        for i, c in enumerate(co_data):
            for key in ('id', 'title'):
                check(f"concept [{i}] has '{key}'", key in c,
                      f"concept {c.get('id', f'index {i}')} missing '{key}'")
        print(f"  concepts: {len(co_data)}")

    # Difficult passages
    dp_path = META / 'difficult-passages.json'
    if dp_path.exists():
        dp_data = json.loads(dp_path.read_text(encoding='utf-8'))
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

    # ── Extra-biblical literature (#1538) ──
    eb_path = META / 'extrabiblical.json'
    if eb_path.exists():
        print("\n--- EXTRABIBLICAL ---")
        eb_data = json.loads(eb_path.read_text(encoding='utf-8'))
        check("extrabiblical.json is list", isinstance(eb_data, list))

        valid_categories = {'apocrypha', 'pseudepigrapha', 'dss', 'deuterocanon'}
        required_status_keys = {'protestant', 'catholic', 'eastern_orthodox', 'ethiopian_tewahedo'}
        valid_citation_types = {'direct_quotation', 'allusion', 'echo'}
        snake_re = re.compile(r'^[a-z0-9]+(_[a-z0-9]+)*$')
        # Accept refs like "genesis 1:3", "jude 14-15", "1 peter 2:4-10",
        # "1 john 1", "matthew 5:3-12". Books with leading digits or multiple
        # words are permitted. The chapter portion allows an optional verse
        # range with or without a colon (Jude has only one chapter, so "jude
        # 14-15" is legal).
        ref_re = re.compile(
            r'^[a-z0-9_]+(\s[a-z0-9_]+)*\s\d+(-\d+)?(:\d+(-\d+)?)?$'
        )

        # Cross-link ID pools (loaded defensively — some may not exist yet)
        debate_ids = set()
        dtp = META / 'debate-topics.json'
        if dtp.exists():
            try:
                dtd = json.loads(dtp.read_text(encoding='utf-8'))
                debate_ids = {t['id'] for t in (dtd if isinstance(dtd, list) else []) if 'id' in t}
            except Exception:
                pass
        difficult_ids = set()
        if dp_path.exists():
            try:
                dpd = json.loads(dp_path.read_text(encoding='utf-8'))
                difficult_ids = {p['id'] for p in (dpd if isinstance(dpd, list) else []) if 'id' in p}
            except Exception:
                pass
        journey_ids = set()
        journeys_dir = META / 'journeys'
        if journeys_dir.exists():
            for jf in journeys_dir.rglob('*.json'):
                try:
                    jd = json.loads(jf.read_text(encoding='utf-8'))
                    if isinstance(jd, dict) and 'id' in jd:
                        journey_ids.add(jd['id'])
                except Exception:
                    pass

        seen_ids = set()
        for i, e in enumerate(eb_data):
            eid = e.get('id', f'index_{i}')

            # Required top-level keys
            for key in ('id', 'title', 'tradition_status', 'brief_summary'):
                check(f"extrabiblical {eid} has '{key}'", key in e,
                      f"missing '{key}'")

            # id shape + uniqueness
            if 'id' in e:
                check(f"extrabiblical {eid} id is snake_case",
                      bool(snake_re.match(e['id'])),
                      f"id '{e['id']}' not snake_case")
                check(f"extrabiblical {eid} id unique",
                      e['id'] not in seen_ids,
                      f"duplicate id: {e['id']}")
                seen_ids.add(e['id'])

            # category enum (nullable in schema, but if present must be valid)
            if e.get('category') is not None:
                check(f"extrabiblical {eid} category valid",
                      e['category'] in valid_categories,
                      f"'{e['category']}' not in {sorted(valid_categories)}")

            # tradition_status must have all 4 keys
            ts = e.get('tradition_status')
            if isinstance(ts, dict):
                missing = required_status_keys - set(ts.keys())
                check(f"extrabiblical {eid} tradition_status has 4 keys",
                      len(missing) == 0,
                      f"missing: {sorted(missing)}")

            # brief_summary is a non-empty string
            bs = e.get('brief_summary')
            check(f"extrabiblical {eid} brief_summary non-empty",
                  isinstance(bs, str) and len(bs.strip()) > 0,
                  "empty or non-string")

            # full_summary is nullable but if present must be string
            fs = e.get('full_summary')
            if fs is not None:
                check(f"extrabiblical {eid} full_summary is string if present",
                      isinstance(fs, str), f"got {type(fs).__name__}")

            # nt_citations[]
            for j, cit in enumerate(e.get('nt_citations', []) or []):
                ref = cit.get('ref', '')
                check(f"extrabiblical {eid} nt_citations[{j}].ref parses",
                      bool(ref_re.match(ref.strip().lower())),
                      f"ref '{ref}' does not match verse pattern")
                if 'type' in cit:
                    check(f"extrabiblical {eid} nt_citations[{j}].type valid",
                          cit['type'] in valid_citation_types,
                          f"'{cit['type']}' not in {sorted(valid_citation_types)}")

            # scholar_voices[].scholar_id valid
            for j, sv in enumerate(e.get('scholar_voices', []) or []):
                sid = sv.get('scholar_id')
                check(f"extrabiblical {eid} scholar_voices[{j}].scholar_id valid",
                      sid in scholar_ids,
                      f"'{sid}' not in scholars.json")

            # related_debate_ids[] valid
            for j, did in enumerate(e.get('related_debate_ids', []) or []):
                check(f"extrabiblical {eid} related_debate_ids[{j}] valid",
                      did in debate_ids,
                      f"'{did}' not in debate-topics.json")

            # related_difficult_passage_ids[] valid
            for j, did in enumerate(e.get('related_difficult_passage_ids', []) or []):
                check(f"extrabiblical {eid} related_difficult_passage_ids[{j}] valid",
                      did in difficult_ids,
                      f"'{did}' not in difficult-passages.json")

            # related_journey_ids[] valid
            for j, jid in enumerate(e.get('related_journey_ids', []) or []):
                check(f"extrabiblical {eid} related_journey_ids[{j}] valid",
                      jid in journey_ids,
                      f"'{jid}' not in content/meta/journeys/**")

        print(f"  extrabiblical: {len(eb_data)}")

    # ── Canon Traditions (#1539 / #1542) ──
    ct_path = META / 'canon_traditions.json'
    if ct_path.exists():
        print("\n--- CANON TRADITIONS ---")
        ct_data = json.loads(ct_path.read_text(encoding='utf-8'))
        check("canon_traditions.json is list", isinstance(ct_data, list))

        all_book_ids = {b['id'] for b in books}
        # Dual-table book-ID resolution per #1542: canon_list[].books[] ids
        # may reference either the 66-book Protestant canon (books.json) or
        # extrabiblical.json (deuterocanon, pseudepigrapha, DSS, etc.).
        # Ids resolving in neither table are logged as informational —
        # expected while the extrabiblical table is seeded incrementally —
        # but malformed snake_case ids always fail.
        extrabib_ids = set()
        eb_path_ct = META / 'extrabiblical.json'
        if eb_path_ct.exists():
            try:
                ebd = json.loads(eb_path_ct.read_text(encoding='utf-8'))
                extrabib_ids = {e['id'] for e in (ebd if isinstance(ebd, list) else []) if 'id' in e}
            except Exception:
                pass

        snake_re = re.compile(r'^[a-z0-9]+(_[a-z0-9]+)*$')
        seen_ct_ids = set()
        for i, t in enumerate(ct_data):
            tid = t.get('id', f'index_{i}')

            # Required top-level keys
            for key in ('id', 'label', 'book_count', 'canon_list'):
                check(f"canon_tradition {tid} has '{key}'", key in t,
                      f"missing '{key}'")

            # id shape + uniqueness
            if 'id' in t:
                check(f"canon_tradition {tid} id is snake_case",
                      bool(snake_re.match(t['id'])),
                      f"id '{t['id']}' not snake_case")
                check(f"canon_tradition {tid} id unique",
                      t['id'] not in seen_ct_ids,
                      f"duplicate id: {t['id']}")
                seen_ct_ids.add(t['id'])

            # book_count matches total canon_list length
            canon_list = t.get('canon_list', [])
            if isinstance(canon_list, list) and 'book_count' in t:
                total_listed = sum(
                    len(s.get('books', [])) for s in canon_list
                    if isinstance(s, dict)
                )
                check(f"canon_tradition {tid} book_count matches canon_list",
                      total_listed == t['book_count'],
                      f"book_count={t['book_count']}, listed={total_listed}")

            # canon_list[].books[]: dual-table resolution
            unresolved = []
            for sec in canon_list if isinstance(canon_list, list) else []:
                if not isinstance(sec, dict):
                    continue
                for bid in sec.get('books', []):
                    check(f"canon_tradition {tid} book '{bid}' is snake_case",
                          bool(snake_re.match(bid)),
                          f"'{bid}' is not a valid id token")
                    if bid not in all_book_ids and bid not in extrabib_ids:
                        unresolved.append(bid)
            if unresolved:
                uniq = sorted(set(unresolved))
                print(f"  canon_tradition {tid}: {len(unresolved)} unresolved "
                      f"book id(s) (expected while extrabiblical is partial): "
                      f"{uniq[:5]}" + ("…" if len(uniq) > 5 else ""))

        print(f"  canon_traditions: {len(ct_data)}")

    # ── Debate Topics ──
    dt_path = META / 'debate-topics.json'
    if dt_path.exists():
        print("\n--- DEBATE TOPICS ---")
        dt_data = json.loads(dt_path.read_text(encoding='utf-8'))
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
            categories = json.loads(cat_path.read_text(encoding='utf-8'))
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
                t = json.loads(json_file.read_text(encoding='utf-8'))
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

        # Known-unauthored canonical topical-Bible categories. References to
        # these IDs from existing topics are tracked as warnings rather than
        # failures — they're a roadmap, not typos. Unknown IDs outside this
        # set still hard-fail to catch genuine misspellings.
        # When a topic file is added for any of these IDs, remove from this set.
        UNAUTHORED_TOPIC_IDS = {
            'adoption', 'belonging', 'commitment', 'community', 'contentment',
            'courage', 'discipline', 'faith', 'faithfulness', 'family',
            'generosity', 'grace', 'gratitude', 'hope', 'humility',
            'image_of_god', 'loss', 'love', 'loyalty', 'mental_renewal',
            'patience', 'peace', 'purity', 'purpose', 'reconciliation',
            'rest', 'sabbath', 'temptation', 'trust', 'wisdom', 'work',
        }

        # Related topic refs point to known topic IDs
        unauthored_refs: dict[str, list[str]] = {}
        for json_file in topic_files:
            try:
                t = json.loads(json_file.read_text(encoding='utf-8'))
            except json.JSONDecodeError:
                continue
            tid = t.get('id', json_file.stem)
            for rel in t.get('related', []):
                if rel in topic_ids:
                    check(f"topic {tid} related '{rel}' references valid topic",
                          True)
                elif rel in UNAUTHORED_TOPIC_IDS:
                    unauthored_refs.setdefault(rel, []).append(tid)
                else:
                    check(f"topic {tid} related '{rel}' references valid topic",
                          False,
                          f"'{rel}' not found among topic files and not on the unauthored allowlist")

        if unauthored_refs:
            total_refs = sum(len(srcs) for srcs in unauthored_refs.values())
            warn(f"{len(unauthored_refs)} canonical topical-Bible categories referenced "
                 f"but not yet authored ({total_refs} total references)",
                 ", ".join(sorted(unauthored_refs.keys())))

        print(f"  topics: {len(topic_files)}")

    # ── 7. Archaeological Evidence ──
    arch_path = CONTENT / 'archaeology' / 'discoveries.json'
    if arch_path.exists():
        print("\n--- 7. ARCHAEOLOGICAL EVIDENCE ---")
        arch_data = json.loads(arch_path.read_text(encoding='utf-8'))
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
        gl_data = json.loads(gl_path.read_text(encoding='utf-8'))
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
        hl_data = json.loads(hl_path.read_text(encoding='utf-8'))
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
        tl_data = json.loads(tl_path.read_text(encoding='utf-8'))
        valid_event_ids = set()
        for key, val in tl_data.items():
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, dict) and 'id' in item:
                        valid_event_ids.add(item['id'])

        tl_checked = 0
        tl_invalid = 0
        for book_dir in sorted(CONTENT.iterdir()):
            if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
                continue
            for json_file in sorted(book_dir.glob('*.json')):
                try:
                    with open(json_file, encoding='utf-8') as f:
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

        # ── Era config enrichment validation (#1115) ──
        era_config = tl_data.get('era_config', {})
        all_book_ids_ec = {b['id'] for b in books}
        enriched_eras = 0
        for era_key, era in era_config.items():
            # Required base fields
            for rk in ('hex', 'name', 'pill', 'range'):
                check(f"era_config {era_key} has '{rk}'", rk in era,
                      f"missing '{rk}'")

            # Optional enrichment fields — validate types when present
            summary = era.get('summary')
            if summary is not None:
                check(f"era_config {era_key} summary non-empty",
                      isinstance(summary, str) and len(summary.strip()) > 0)

            narrative = era.get('narrative')
            if narrative is not None:
                check(f"era_config {era_key} narrative non-empty",
                      isinstance(narrative, str) and len(narrative.strip()) > 0)

            key_themes = era.get('key_themes')
            if key_themes is not None:
                check(f"era_config {era_key} key_themes is list",
                      isinstance(key_themes, list) and len(key_themes) > 0)

            key_people = era.get('key_people')
            if key_people is not None:
                check(f"era_config {era_key} key_people is list",
                      isinstance(key_people, list))
                if isinstance(key_people, list):
                    for pid in key_people:
                        check(f"era_config {era_key} key_people '{pid}' valid",
                              pid in people_ids,
                              f"'{pid}' not in people.json")

            era_books = era.get('books')
            if era_books is not None:
                check(f"era_config {era_key} books is list",
                      isinstance(era_books, list))
                if isinstance(era_books, list):
                    for bk in era_books:
                        check(f"era_config {era_key} book '{bk}' valid",
                              bk in all_book_ids_ec,
                              f"'{bk}' not in books.json")

            chapter_range = era.get('chapter_range')
            if chapter_range is not None:
                # Shape: {book_id: [start_chapter, end_chapter], ...}
                # Eras can span multiple books (divided_kingdom -> 1kings + 2kings, etc.)
                ok = isinstance(chapter_range, dict) and all(
                    isinstance(k, str)
                    and isinstance(v, list) and len(v) == 2
                    and all(isinstance(n, int) and n > 0 for n in v)
                    for k, v in chapter_range.items()
                )
                check(f"era_config {era_key} chapter_range shape",
                      ok,
                      "expected {book_id: [start_ch, end_ch], ...} with positive ints")

            geographic_center = era.get('geographic_center')
            if geographic_center is not None:
                # Shape: {"region": str, "place_ids": [str, ...]}
                ok = (
                    isinstance(geographic_center, dict)
                    and isinstance(geographic_center.get('region'), str)
                    and isinstance(geographic_center.get('place_ids'), list)
                    and all(isinstance(p, str) for p in geographic_center.get('place_ids', []))
                )
                check(f"era_config {era_key} geographic_center shape",
                      ok,
                      "expected {region: str, place_ids: [str, ...]}")

            redemptive_thread = era.get('redemptive_thread')
            if redemptive_thread is not None:
                check(f"era_config {era_key} redemptive_thread non-empty",
                      isinstance(redemptive_thread, str) and len(redemptive_thread.strip()) > 0)

            transition_to_next = era.get('transition_to_next')
            if transition_to_next is not None:
                # Empty string is valid for the terminal era (apocalyptic) —
                # nothing comes after Revelation. Only enforce string type and
                # non-empty for non-terminal eras.
                if not isinstance(transition_to_next, str):
                    check(f"era_config {era_key} transition_to_next is string",
                          False, "expected string")
                elif era_key != 'apocalyptic' and len(transition_to_next.strip()) == 0:
                    check(f"era_config {era_key} transition_to_next non-empty",
                          False,
                          "non-terminal era must describe transition to next era")

            has_enrichment = any(era.get(f) is not None for f in
                                ('summary', 'narrative', 'key_themes', 'key_people',
                                 'books', 'chapter_range', 'geographic_center',
                                 'redemptive_thread', 'transition_to_next'))
            if has_enrichment:
                enriched_eras += 1

        print(f"  era_config: {len(era_config)} eras, {enriched_eras} enriched")

        # ── World events schema (#1809) ──
        from world_regions import WORLD_REGION_KEYS
        world_events = tl_data.get('world_events', [])
        check("world_events is list", isinstance(world_events, list),
              f"got {type(world_events).__name__}")
        if isinstance(world_events, list):
            seen_world_ids = set()
            for we in world_events:
                wid = we.get('id') if isinstance(we, dict) else None
                label = f"world_event '{wid}'" if wid else "world_event"
                check(f"{label} is dict", isinstance(we, dict))
                if not isinstance(we, dict):
                    continue
                check(f"{label} id is non-empty string",
                      isinstance(wid, str) and len(wid) > 0,
                      "missing or non-string id")
                if isinstance(wid, str):
                    check(f"{label} id is unique",
                          wid not in seen_world_ids,
                          f"duplicate id: {wid}")
                    seen_world_ids.add(wid)
                check(f"{label} name is non-empty string",
                      isinstance(we.get('name'), str) and len(we.get('name', '')) > 0,
                      "missing or non-string name")
                check(f"{label} year is int",
                      isinstance(we.get('year'), int) and not isinstance(we.get('year'), bool),
                      f"year is {type(we.get('year')).__name__}")
                region = we.get('region')
                check(f"{label} region is canonical key",
                      isinstance(region, str) and region in WORLD_REGION_KEYS,
                      f"region {region!r} not in {sorted(WORLD_REGION_KEYS)}")
                check(f"{label} summary is non-empty string",
                      isinstance(we.get('summary'), str) and len(we.get('summary', '')) > 0,
                      "missing or non-string summary")
            print(f"  world_events: {len(world_events)} entries, {len(seen_world_ids)} unique ids")

    else:
        print("  timelines.json not found — skipping")

    # ── 9. Near-duplicate detection ──
    print("\n--- 9. NEAR-DUPLICATE DETECTION ---")

    dup_count = 0
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                with open(json_file, encoding='utf-8') as f:
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
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                with open(json_file, encoding='utf-8') as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                continue
            sections = data.get('sections', [])
            valid_nums = {s.get('section_num') for s in sections}
            for tip in data.get('coaching', []):
                after = tip.get('after_section')
                if after is not None and after not in valid_nums:
                    oob_tips += 1
                    warn(f"{json_file.name} coaching after_section out of bounds",
                         f"after_section={after}, valid section_nums={sorted(valid_nums)}")

    print(f"  Out-of-bounds coaching tips: {oob_tips}")

    # ── 11. Scholar scope enforcement ──
    print("\n--- 11. SCHOLAR SCOPE ENFORCEMENT ---")

    scope_violations = 0
    scopes_path_11 = META / 'scholar-scopes.json'
    if scopes_path_11.exists():
        scopes_data = json.loads(scopes_path_11.read_text(encoding='utf-8'))
        for book_dir in sorted(CONTENT.iterdir()):
            if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
                continue
            for json_file in sorted(book_dir.glob('*.json')):
                try:
                    with open(json_file, encoding='utf-8') as f:
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
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                with open(json_file, encoding='utf-8') as f:
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

    # ── 13. Unregistered scholar check (#559) ──
    print("\n--- 13. UNREGISTERED SCHOLARS ---")

    scholars_path = META / 'scholars.json'
    if scholars_path.exists():
        scholars_data = json.loads(scholars_path.read_text(encoding='utf-8'))
        valid_scholar_keys = set()
        for s in scholars_data:
            valid_scholar_keys.add(s['id'])
            if s.get('panel_key'):
                valid_scholar_keys.add(s['panel_key'])
        non_scholar_panels = {
            'heb', 'hist', 'ctx', 'cross', 'greek', 'hebtext', 'interlinear',
            'tl', 'places', 'poi', 'themes', 'lit', 'trans', 'src', 'rec',
            'thread', 'tx', 'textual', 'debate', 'discourse', 'ppl', 'com',
            # st2 — Second Temple Context panel (HWGTB #1540)
            'st2',
        }
        unregistered = []
        for book_dir in sorted(CONTENT.iterdir()):
            if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
                continue
            for json_file in sorted(book_dir.glob('*.json')):
                try:
                    data = json.loads(json_file.read_text(encoding='utf-8'))
                except Exception:
                    continue
                for i, sec in enumerate(data.get('sections', [])):
                    for ptype in sec.get('panels', {}):
                        if ptype not in non_scholar_panels and ptype not in valid_scholar_keys:
                            unregistered.append(f"{book_dir.name}/{json_file.stem} S{i+1}: {ptype}")
        check("No unregistered scholars in panels", len(unregistered) == 0,
              f"{len(unregistered)} unregistered: {unregistered[:5]}")
        print(f"  Unregistered scholars: {len(unregistered)}")
    else:
        print("  [SKIP] scholars.json not found")

    # ── 13b. st2 panel payload integrity (HWGTB #1540) ──
    print("\n--- 13b. ST2 PANEL INTEGRITY ---")

    st2_extrabiblical_ids = set()
    eb_path_st2 = META / 'extrabiblical.json'
    if eb_path_st2.exists():
        try:
            ebd = json.loads(eb_path_st2.read_text(encoding='utf-8'))
            st2_extrabiblical_ids = {e['id'] for e in (ebd if isinstance(ebd, list) else []) if 'id' in e}
        except Exception:
            pass

    st2_ref_re = re.compile(
        r'^[a-z0-9_]+(\s[a-z0-9_]+)*\s\d+(-\d+)?(:\d+(-\d+)?)?$'
    )
    st2_valid_citation_types = {'direct_quotation', 'allusion', 'echo'}
    st2_required_keys = {'header', 'body', 'extrabiblical_ids', 'citation_refs'}
    st2_panel_count = 0

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                data = json.loads(json_file.read_text(encoding='utf-8'))
            except Exception:
                continue
            for i, sec in enumerate(data.get('sections', [])):
                st2 = sec.get('panels', {}).get('st2')
                if st2 is None:
                    continue
                loc = f"{book_dir.name}/{json_file.stem} S{i+1}"
                st2_panel_count += 1
                check(f"st2 {loc} is object", isinstance(st2, dict),
                      f"got {type(st2).__name__}")
                if not isinstance(st2, dict):
                    continue
                missing = st2_required_keys - set(st2.keys())
                check(f"st2 {loc} has required keys",
                      len(missing) == 0,
                      f"missing {sorted(missing)}")

                # extrabiblical_ids[] resolve
                for j, eid in enumerate(st2.get('extrabiblical_ids', []) or []):
                    check(f"st2 {loc} extrabiblical_ids[{j}] valid",
                          eid in st2_extrabiblical_ids,
                          f"'{eid}' not in extrabiblical.json")

                # citation_refs[].nt parses + .type enum
                for j, cit in enumerate(st2.get('citation_refs', []) or []):
                    if not isinstance(cit, dict):
                        check(f"st2 {loc} citation_refs[{j}] is object", False,
                              f"got {type(cit).__name__}")
                        continue
                    nt = str(cit.get('nt', '')).strip().lower()
                    check(f"st2 {loc} citation_refs[{j}].nt parses",
                          bool(st2_ref_re.match(nt)),
                          f"ref '{cit.get('nt')}' does not match verse pattern")
                    if 'type' in cit:
                        check(f"st2 {loc} citation_refs[{j}].type valid",
                              cit['type'] in st2_valid_citation_types,
                              f"'{cit['type']}' not in {sorted(st2_valid_citation_types)}")

                # scholar_voices[].scholar_id resolve (if present)
                for j, sv in enumerate(st2.get('scholar_voices', []) or []):
                    if not isinstance(sv, dict):
                        continue
                    sid = sv.get('scholar_id')
                    check(f"st2 {loc} scholar_voices[{j}].scholar_id valid",
                          sid in scholar_ids,
                          f"'{sid}' not in scholars.json")

    print(f"  st2 panels scanned: {st2_panel_count}")

    # ── 14. Verse overlap check (#560) ──
    print("\n--- 14. VERSE OVERLAPS ---")

    overlaps = []
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                data = json.loads(json_file.read_text(encoding='utf-8'))
            except Exception:
                continue
            if not isinstance(data, dict):
                continue
            sections = data.get('sections', [])
            prev_end = -1
            for i, sec in enumerate(sections):
                vs = sec.get('verse_start')
                ve = sec.get('verse_end')
                if vs is None or ve is None:
                    continue
                if i > 0 and vs <= prev_end:
                    overlaps.append(f"{book_dir.name}/{json_file.stem} S{i+1}: v{vs}-{ve} overlaps prev end v{prev_end}")
                prev_end = ve
    # Warning until content fix #558 lands, then promote to check()
    if overlaps:
        for o in overlaps[:10]:
            warn("Verse overlap", o)
    print(f"  Verse overlaps (warning until #558): {len(overlaps)}")

    # ── 15. Verse gap warning (#562) ──
    print("\n--- 15. VERSE GAPS ---")

    gaps = []
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            try:
                data = json.loads(json_file.read_text(encoding='utf-8'))
            except Exception:
                continue
            if not isinstance(data, dict):
                continue
            sections = data.get('sections', [])
            prev_end = 0
            for i, sec in enumerate(sections):
                vs = sec.get('verse_start')
                ve = sec.get('verse_end')
                if vs is None or ve is None:
                    continue
                if i > 0 and vs > prev_end + 1:
                    gaps.append(f"{book_dir.name}/{json_file.stem} S{i+1}: gap v{prev_end+1}-{vs-1}")
                prev_end = ve
    if gaps:
        for g in gaps[:20]:
            warn("Verse gap", g)
        if len(gaps) > 20:
            warn(f"...and {len(gaps) - 20} more verse gaps")
    print(f"  Verse gaps (warning only): {len(gaps)}")

    # ── 16. Historical interpretations validation (#987) ──
    hist_dir = CONTENT / 'historical_interpretations'
    if hist_dir.is_dir():
        print("\n--- 16. HISTORICAL INTERPRETATIONS ---")

        # Validate eras.json
        eras_path = hist_dir / 'eras.json'
        if eras_path.exists():
            eras_data = json.loads(eras_path.read_text(encoding='utf-8'))
            check("eras.json is list", isinstance(eras_data, list))
            era_ids = set()
            for i, era in enumerate(eras_data):
                for key in ('id', 'name', 'date_range', 'description', 'display_order'):
                    check(f"era [{i}] has '{key}'", key in era,
                          f"era {era.get('id', f'index {i}')} missing '{key}'")
                if 'id' in era:
                    era_ids.add(era['id'])
            print(f"  eras: {len(eras_data)}")
        else:
            era_ids = set()
            check("eras.json exists", False, "file not found")

        # Validate interpretation files
        interp_dir = hist_dir / 'interpretations'
        interp_files = sorted(interp_dir.glob('*.json')) if interp_dir.is_dir() else []
        total_interps = 0
        for json_file in interp_files:
            try:
                entries = json.loads(json_file.read_text(encoding='utf-8'))
            except json.JSONDecodeError as e:
                check(f"{json_file.name} valid JSON", False, str(e))
                continue
            check(f"{json_file.name} is list", isinstance(entries, list))
            if not isinstance(entries, list):
                continue
            for j, entry in enumerate(entries):
                total_interps += 1
                for key in ('id', 'verse_ref', 'era', 'author', 'interpretation'):
                    check(f"{json_file.stem} entry [{j}] has '{key}'", key in entry,
                          f"entry {entry.get('id', f'index {j}')} missing '{key}'")
                # era referential integrity
                era_val = entry.get('era')
                if era_val and era_ids:
                    check(f"{json_file.stem} entry [{j}] era valid",
                          era_val in era_ids,
                          f"'{era_val}' not in eras.json")
        print(f"  interpretation files: {len(interp_files)}")
        print(f"  total entries: {total_interps}")

    # ── 17. Interlinear data validation (#972) ──
    interlinear_dir = CONTENT / 'interlinear'
    if interlinear_dir.is_dir():
        print("\n--- 17. INTERLINEAR DATA ---")

        # OT books use H (Hebrew), NT books use G (Greek)
        nt_books = {
            'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
            '1_corinthians', '2_corinthians', 'galatians', 'ephesians',
            'philippians', 'colossians', '1_thessalonians', '2_thessalonians',
            '1_timothy', '2_timothy', 'titus', 'philemon', 'hebrews',
            'james', '1_peter', '2_peter', '1_john', '2_john', '3_john',
            'jude', 'revelation',
        }
        strongs_re = re.compile(r'^[HG]\d{1,5}$')
        required_fields = ('ch', 'v', 'pos', 'original', 'transliteration', 'strongs', 'morphology', 'gloss')

        interlinear_files = sorted(interlinear_dir.glob('*.json'))
        check("Interlinear files exist", len(interlinear_files) > 0,
              "no JSON files in content/interlinear/")
        total_words = 0
        total_schema_issues = 0
        total_strongs_issues = 0
        total_empty_original = 0

        for json_file in interlinear_files:
            book_name = json_file.stem
            expected_prefix = 'G' if book_name in nt_books else 'H'

            try:
                data = json.loads(json_file.read_text(encoding='utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                check(f"interlinear {json_file.name} valid JSON/UTF-8", False, str(e))
                continue

            check(f"interlinear {json_file.name} is list", isinstance(data, list))
            if not isinstance(data, list):
                continue

            total_words += len(data)
            check(f"interlinear {json_file.name} non-empty", len(data) > 0)

            # Validate word entries (sample first 200 + last 50 for speed on large files)
            sample = data[:200] + data[-50:] if len(data) > 250 else data
            for i, word in enumerate(sample):
                idx = i if i < 200 else len(data) - 50 + (i - 200)
                # Required fields
                for key in required_fields:
                    if key not in word:
                        total_schema_issues += 1
                        if total_schema_issues <= 5:
                            check(f"interlinear {book_name} word [{idx}] has '{key}'", False)

                # strongs format
                s = word.get('strongs', '')
                if s and not strongs_re.match(s):
                    total_strongs_issues += 1
                    if total_strongs_issues <= 5:
                        check(f"interlinear {book_name} word [{idx}] strongs format", False,
                              f"got '{s}'")

                # strongs prefix matches testament
                if s and s[0] != expected_prefix:
                    total_strongs_issues += 1
                    if total_strongs_issues <= 5:
                        check(f"interlinear {book_name} word [{idx}] strongs prefix",
                              False, f"expected '{expected_prefix}' got '{s[0]}'")

                # original text should not be empty
                if not word.get('original', '').strip():
                    total_empty_original += 1

            # Chapter continuity: check chapters are sequential
            chapters = sorted(set(w.get('ch', 0) for w in data))
            if chapters:
                expected_chapters = list(range(chapters[0], chapters[-1] + 1))
                missing = set(expected_chapters) - set(chapters)
                if missing:
                    check(f"interlinear {book_name} no missing chapters", False,
                          f"missing chapters: {sorted(missing)[:10]}")

        check("Interlinear schema issues", total_schema_issues == 0,
              f"{total_schema_issues} missing fields")
        check("Interlinear strongs format", total_strongs_issues == 0,
              f"{total_strongs_issues} invalid strongs")
        if total_empty_original > 0:
            warn(f"Interlinear empty 'original' fields: {total_empty_original}")

        print(f"  interlinear files: {len(interlinear_files)}")
        print(f"  total words: {total_words}")

    # ── 18. Verse data completeness validation (#981) ──
    verses_dir = CONTENT / 'verses'
    if verses_dir.is_dir():
        print("\n--- 18. VERSE DATA COMPLETENESS ---")

        translations = sorted(d.name for d in verses_dir.iterdir() if d.is_dir())
        check("Verse translations exist", len(translations) >= 2,
              f"got {len(translations)}: {translations}")

        # Build expected book list from meta/books.json
        expected_books = {b['id']: b['total_chapters'] for b in books if b.get('is_live')}
        verse_required_fields = ('ref', 'text', 'book', 'ch', 'v')

        # Bundled translations must be complete; downloadable may be partial
        translations_json = ROOT / 'app' / 'src' / 'db' / 'translations.json'
        bundled_ids = set()
        if translations_json.exists():
            bundled_ids = {t['id'] for t in json.loads(translations_json.read_text(encoding='utf-8')) if t.get('bundled')}

        for trans in translations:
            trans_dir = verses_dir / trans
            trans_files = {f.stem: f for f in trans_dir.glob('*.json')}

            is_bundled = trans in bundled_ids

            # Check all 66 books present
            missing_books = set(expected_books.keys()) - set(trans_files.keys())
            check(f"verses/{trans} has all {len(expected_books)} books",
                  len(missing_books) == 0,
                  f"missing: {sorted(missing_books)[:10]}")

            total_verses = 0
            schema_issues = 0
            empty_text = 0
            encoding_issues = 0

            for book_id, json_path in sorted(trans_files.items()):
                try:
                    data = json.loads(json_path.read_text(encoding='utf-8'))
                except UnicodeDecodeError as e:
                    encoding_issues += 1
                    check(f"verses/{trans}/{book_id} UTF-8", False, str(e))
                    continue
                except json.JSONDecodeError as e:
                    check(f"verses/{trans}/{book_id} valid JSON", False, str(e))
                    continue

                if not isinstance(data, list):
                    check(f"verses/{trans}/{book_id} is list", False)
                    continue

                total_verses += len(data)

                # Check no empty verse arrays
                check(f"verses/{trans}/{book_id} non-empty", len(data) > 0)

                # Chapter count matches expected
                if book_id in expected_books:
                    chapters_found = set(v.get('ch', 0) for v in data)
                    expected_ch = expected_books[book_id]
                    if len(chapters_found) != expected_ch:
                        if is_bundled:
                            check(f"verses/{trans}/{book_id} has {expected_ch} chapters",
                                  False, f"got {len(chapters_found)}")
                        else:
                            warn(f"verses/{trans}/{book_id} has {len(chapters_found)}/{expected_ch} chapters (downloadable)")

                # Sample field validation (check first + last 20 verses)
                sample = data[:20] + data[-20:] if len(data) > 40 else data
                for v in sample:
                    for key in verse_required_fields:
                        if key not in v:
                            schema_issues += 1
                    if not v.get('text', '').strip():
                        empty_text += 1

            check(f"verses/{trans} schema", schema_issues == 0,
                  f"{schema_issues} missing fields")
            if empty_text > 0:
                warn(f"verses/{trans} has {empty_text} empty text fields (sampled)")
            if encoding_issues > 0:
                check(f"verses/{trans} encoding", False,
                      f"{encoding_issues} files with encoding issues")
            print(f"  {trans}: {len(trans_files)} books, {total_verses} verses")

    # ── 19. Journey JSON schema validation (#1384) ──
    journeys_root = META / 'journeys'
    journey_subdirs = ('thematic', 'concept', 'person')
    journey_files = []
    for subdir in journey_subdirs:
        d = journeys_root / subdir
        if d.is_dir():
            journey_files.extend(sorted(d.glob('*.json')))

    if journey_files:
        print("\n--- 19. JOURNEY VALIDATION ---")

        # Load valid lens IDs from journey-lenses.json
        lenses_path = META / 'journey-lenses.json'
        valid_lens_ids = set()
        if lenses_path.exists():
            lenses_data = json.loads(lenses_path.read_text(encoding='utf-8'))
            if isinstance(lenses_data, list):
                valid_lens_ids = {l['id'] for l in lenses_data if 'id' in l}

        # Load all book IDs for book_id validation
        all_book_ids_j = {b['id'] for b in books}

        id_re = re.compile(r'^[a-z0-9][a-z0-9-]*$')
        valid_journey_types = {'person', 'concept', 'thematic'}
        valid_depths = {'short', 'medium', 'long'}
        valid_stop_types = {'regular', 'linked_journey'}
        valid_tag_types = {'person', 'place', 'theme', 'word_study', 'prophecy_chain'}

        # First pass: collect all journey IDs for cross-file linked_journey_id resolution
        all_journey_ids = set()
        journey_data_cache = {}
        for json_file in journey_files:
            try:
                data = json.loads(json_file.read_text(encoding='utf-8'))
            except json.JSONDecodeError as e:
                check(f"{json_file.name} valid JSON", False, str(e))
                continue
            journey_data_cache[json_file] = data
            jid = data.get('id')
            if jid:
                all_journey_ids.add(jid)

        # Second pass: validate each journey
        linked_refs = []  # collect (file, linked_journey_id) for cross-file check
        total_journeys = 0
        total_stops = 0

        for json_file, data in journey_data_cache.items():
            total_journeys += 1
            jid = data.get('id', json_file.stem)

            # id — required, string, matches pattern
            check(f"journey {jid} has 'id'", 'id' in data, "missing 'id'")
            if 'id' in data:
                check(f"journey {jid} id format",
                      isinstance(data['id'], str) and bool(id_re.match(data['id'])),
                      f"got '{data['id']}'")

            # journey_type — required, enum
            check(f"journey {jid} has 'journey_type'",
                  'journey_type' in data, "missing 'journey_type'")
            jtype = data.get('journey_type')
            if jtype is not None:
                check(f"journey {jid} journey_type valid",
                      jtype in valid_journey_types,
                      f"got '{jtype}'")

            # title — required, non-empty string
            check(f"journey {jid} has 'title'", 'title' in data, "missing 'title'")
            if 'title' in data:
                check(f"journey {jid} title non-empty",
                      isinstance(data['title'], str) and len(data['title'].strip()) > 0)

            # description — required, non-empty string
            check(f"journey {jid} has 'description'",
                  'description' in data, "missing 'description'")
            if 'description' in data:
                check(f"journey {jid} description non-empty",
                      isinstance(data['description'], str) and len(data['description'].strip()) > 0)

            # lens_id — required when thematic, optional otherwise; must match lenses
            lens_id = data.get('lens_id')
            if jtype == 'thematic':
                check(f"journey {jid} has 'lens_id' (thematic)",
                      lens_id is not None, "lens_id required for thematic journeys")
            if lens_id is not None and valid_lens_ids:
                check(f"journey {jid} lens_id valid",
                      lens_id in valid_lens_ids,
                      f"'{lens_id}' not in journey-lenses.json")

            # depth — optional, enum if present
            depth = data.get('depth')
            if depth is not None:
                check(f"journey {jid} depth valid",
                      depth in valid_depths,
                      f"got '{depth}'")

            # person_id — required when person, null otherwise
            if jtype == 'person':
                check(f"journey {jid} has 'person_id' (person type)",
                      data.get('person_id') is not None,
                      "person_id required for person journeys")
            else:
                check(f"journey {jid} person_id null (non-person type)",
                      data.get('person_id') is None,
                      f"person_id should be null for {jtype} journey")

            # concept_id — required when concept, null otherwise
            if jtype == 'concept':
                check(f"journey {jid} has 'concept_id' (concept type)",
                      data.get('concept_id') is not None,
                      "concept_id required for concept journeys")
            else:
                check(f"journey {jid} concept_id null (non-concept type)",
                      data.get('concept_id') is None,
                      f"concept_id should be null for {jtype} journey")

            # stops — required, non-empty array
            check(f"journey {jid} has 'stops'", 'stops' in data, "missing 'stops'")
            stops = data.get('stops', [])
            check(f"journey {jid} stops is non-empty list",
                  isinstance(stops, list) and len(stops) >= 1,
                  f"got {len(stops) if isinstance(stops, list) else type(stops).__name__}")

            if not isinstance(stops, list):
                continue

            total_stops += len(stops)

            # Validate each stop
            for si, stop in enumerate(stops):
                slabel = f"journey {jid} stop [{si}]"

                # stop_order — required, integer, sequential from 1
                check(f"{slabel} has 'stop_order'",
                      'stop_order' in stop, "missing 'stop_order'")
                so = stop.get('stop_order')
                if so is not None:
                    check(f"{slabel} stop_order is int",
                          isinstance(so, int), f"got {type(so).__name__}")
                    check(f"{slabel} stop_order sequential",
                          so == si + 1,
                          f"expected {si + 1}, got {so}")

                # stop_type — required, enum
                check(f"{slabel} has 'stop_type'",
                      'stop_type' in stop, "missing 'stop_type'")
                stype = stop.get('stop_type')
                if stype is not None:
                    check(f"{slabel} stop_type valid",
                          stype in valid_stop_types,
                          f"got '{stype}'")

                # Type-specific fields
                if stype == 'regular':
                    # label — required non-empty
                    check(f"{slabel} has 'label'",
                          'label' in stop, "missing 'label'")
                    if 'label' in stop:
                        check(f"{slabel} label non-empty",
                              isinstance(stop['label'], str) and len(stop['label'].strip()) > 0)

                    # ref — required non-empty
                    check(f"{slabel} has 'ref'",
                          'ref' in stop, "missing 'ref'")
                    if 'ref' in stop:
                        check(f"{slabel} ref non-empty",
                              isinstance(stop['ref'], str) and len(stop['ref'].strip()) > 0)

                    # book_id — required, must be valid
                    check(f"{slabel} has 'book_id'",
                          'book_id' in stop, "missing 'book_id'")
                    sbid = stop.get('book_id')
                    if sbid:
                        check(f"{slabel} book_id valid",
                              sbid in all_book_ids_j,
                              f"'{sbid}' not in books.json")

                    # chapter_num — required positive int
                    check(f"{slabel} has 'chapter_num'",
                          'chapter_num' in stop, "missing 'chapter_num'")
                    scn = stop.get('chapter_num')
                    if scn is not None:
                        check(f"{slabel} chapter_num positive int",
                              isinstance(scn, int) and scn > 0,
                              f"got {scn}")

                    # development — required non-empty
                    check(f"{slabel} has 'development'",
                          'development' in stop, "missing 'development'")
                    if 'development' in stop:
                        check(f"{slabel} development non-empty",
                              isinstance(stop['development'], str) and len(stop['development'].strip()) > 0)

                elif stype == 'linked_journey':
                    # linked_journey_id — required
                    check(f"{slabel} has 'linked_journey_id'",
                          'linked_journey_id' in stop, "missing 'linked_journey_id'")
                    ljid = stop.get('linked_journey_id')
                    if ljid:
                        linked_refs.append((json_file.name, ljid))

                    # linked_journey_intro — required non-empty
                    check(f"{slabel} has 'linked_journey_intro'",
                          'linked_journey_intro' in stop,
                          "missing 'linked_journey_intro'")
                    if 'linked_journey_intro' in stop:
                        check(f"{slabel} linked_journey_intro non-empty",
                              isinstance(stop['linked_journey_intro'], str) and len(stop['linked_journey_intro'].strip()) > 0)

                # bridge_to_next — required on all stops except the last; null/absent on last
                is_last = (si == len(stops) - 1)
                bridge = stop.get('bridge_to_next')
                if is_last:
                    check(f"{slabel} bridge_to_next null on final stop",
                          bridge is None or bridge == '',
                          f"final stop should not have bridge_to_next")
                else:
                    check(f"{slabel} has bridge_to_next",
                          bridge is not None and isinstance(bridge, str) and len(bridge.strip()) > 0,
                          "bridge_to_next required on non-final stops")

                # Tag validation
                tags = stop.get('tags', [])
                if isinstance(tags, list):
                    for ti, tag in enumerate(tags):
                        if isinstance(tag, dict):
                            check(f"{slabel} tag [{ti}] has 'type'",
                                  'type' in tag, "missing 'type'")
                            ttype = tag.get('type')
                            if ttype is not None:
                                check(f"{slabel} tag [{ti}] type valid",
                                      ttype in valid_tag_types,
                                      f"got '{ttype}'")
                            check(f"{slabel} tag [{ti}] has 'id'",
                                  'id' in tag, "missing 'id'")

        # Cross-file check: all linked_journey_id references resolve
        for fname, ljid in linked_refs:
            check(f"{fname} linked_journey_id '{ljid}' resolves",
                  ljid in all_journey_ids,
                  f"'{ljid}' not found in any journey file")

        print(f"  journey files: {total_journeys}")
        print(f"  total stops: {total_stops}")

    # ── 20. META-FAQ (Amicus Card #1449) ──
    _validate_meta_faq()

    # ── 21. HERMENEUTIC LENSES (Epic #820) ──
    _validate_hermeneutic_lenses()

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
