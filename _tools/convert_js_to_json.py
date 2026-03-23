#!/usr/bin/env python3
"""
convert_js_to_json.py — Convert all JS data files to clean JSON.

Phase 0C: Handles both simple wrappers (window.X = [...]) and complex
multi-export files (timeline-data.js, people-data.js) by using Node.js
subprocess to eval the JavaScript natively.

Usage:
    python3 _tools/convert_js_to_json.py
"""
import os, sys, re, json, subprocess, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
META = CONTENT / 'meta'
VERSES = CONTENT / 'verses'


# ---------------------------------------------------------------------------
# Core: use Node.js to eval JS objects into JSON
# ---------------------------------------------------------------------------
def _js_eval(js_expression):
    """Evaluate a JS expression via Node.js and return parsed Python object.

    This handles unquoted keys, single quotes, trailing commas, and all
    other JS-valid-but-not-JSON-valid syntax that Python can't parse.
    """
    # Wrap in parens so object literals are expressions, not blocks
    script = f'process.stdout.write(JSON.stringify(eval({json.dumps("(" + js_expression + ")")})))'
    result = subprocess.run(
        ['node', '-e', script],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Node eval failed: {result.stderr[:500]}")
    return json.loads(result.stdout)


def _js_eval_large(js_expression):
    """Like _js_eval but writes to a temp file for large inputs (>100KB).

    Node's -e flag has command-line length limits on some systems.
    """
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
    """Extract a JS assignment block from source code.

    Pattern should match the start (e.g., r'const ERA_HEX\\s*=\\s*').
    Returns the JS expression (the right-hand side).
    """
    m = re.search(pattern, content)
    if not m:
        return None
    start = m.end()
    # Find the matching close bracket/brace
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
# Individual file converters
# ---------------------------------------------------------------------------
def convert_book_intros():
    """data/book-intros.js → content/meta/book-intros.json"""
    src = ROOT / 'data' / 'book-intros.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()
    # Strip: window.BOOK_INTROS = [...];
    block = _extract_js_block(raw, r'window\.BOOK_INTROS\s*=\s*')
    if not block:
        raise ValueError("Cannot find BOOK_INTROS in book-intros.js")
    data = _js_eval_large(block)
    return data, 'book-intros.json'


def convert_people_data():
    """js/pages/people-data.js → content/meta/people.json

    This file has multiple exports: ERA_COLORS, PEOPLE_ERA_NAMES, PEOPLE.
    We extract all into one combined JSON object.
    """
    src = ROOT / 'js' / 'pages' / 'people-data.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()

    era_colors = _extract_js_block(raw, r'(?:const|var)\s+ERA_COLORS\s*=\s*')
    era_names = _extract_js_block(raw, r'(?:const|var)\s+PEOPLE_ERA_NAMES\s*=\s*')
    people = _extract_js_block(raw, r'(?:const|var)\s+PEOPLE\s*=\s*')

    result = {}
    if era_colors:
        result['era_colors'] = _js_eval(era_colors)
    if era_names:
        result['era_names'] = _js_eval(era_names)
    if people:
        result['people'] = _js_eval_large(people)

    return result, 'people.json'


def convert_timeline_data():
    """js/pages/timeline-data.js → content/meta/timelines.json

    Multiple exports: ERA_HEX, ERA_NAMES, ERA_RANGES, EVENTS,
    TIMELINE_PEOPLE, WORLD_EVENTS.
    """
    src = ROOT / 'js' / 'pages' / 'timeline-data.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()

    result = {}

    for name, pattern in [
        ('era_hex', r'(?:const|var)\s+ERA_HEX\s*=\s*'),
        ('era_names', r'(?:const|var)\s+ERA_NAMES\s*=\s*'),
        ('era_ranges', r'(?:const|var)\s+ERA_RANGES\s*=\s*'),
    ]:
        block = _extract_js_block(raw, pattern)
        if block:
            result[name] = _js_eval(block)

    for name, pattern in [
        ('events', r'(?:const|var)\s+EVENTS\s*=\s*'),
        ('timeline_people', r'(?:const|var)\s+TIMELINE_PEOPLE\s*=\s*'),
        ('world_events', r'(?:const|var)\s+WORLD_EVENTS\s*=\s*'),
    ]:
        block = _extract_js_block(raw, pattern)
        if block:
            result[name] = _js_eval_large(block)

    return result, 'timelines.json'


def convert_cross_refs():
    """data/cross-refs.js → content/meta/cross-refs.json

    Two arrays: CROSS_REF_THREADS and CROSS_REF_PAIRS.
    Output as { "threads": [...], "pairs": [...] }
    """
    src = ROOT / 'data' / 'cross-refs.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()

    threads_block = _extract_js_block(raw, r'window\.CROSS_REF_THREADS\s*=\s*')
    pairs_block = _extract_js_block(raw, r'window\.CROSS_REF_PAIRS\s*=\s*')

    result = {
        'threads': _js_eval_large(threads_block) if threads_block else [],
        'pairs': _js_eval_large(pairs_block) if pairs_block else [],
    }
    return result, 'cross-refs.json'


def convert_word_study():
    """data/word-study.js → content/meta/word-studies.json"""
    src = ROOT / 'data' / 'word-study.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()
    block = _extract_js_block(raw, r'window\.WORD_STUDY_DATA\s*=\s*')
    if not block:
        raise ValueError("Cannot find WORD_STUDY_DATA")
    return _js_eval_large(block), 'word-studies.json'


def convert_synoptic():
    """data/synoptic-map.js → content/meta/synoptic.json"""
    src = ROOT / 'data' / 'synoptic-map.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()
    block = _extract_js_block(raw, r'window\.SYNOPTIC_MAP\s*=\s*')
    if not block:
        raise ValueError("Cannot find SYNOPTIC_MAP")
    return _js_eval_large(block), 'synoptic.json'


def convert_scholar_data():
    """commentators/scholar-data.js → content/meta/scholar-data.json"""
    src = ROOT / 'commentators' / 'scholar-data.js'
    with open(src, encoding='utf-8') as f:
        raw = f.read()
    block = _extract_js_block(raw, r'window\.SCHOLAR_DATA\s*=\s*')
    if not block:
        raise ValueError("Cannot find SCHOLAR_DATA")
    return _js_eval_large(block), 'scholar-data.json'


# ---------------------------------------------------------------------------
# Verse file conversion
# ---------------------------------------------------------------------------
def convert_verses():
    """Convert all verse .js files to JSON in content/verses/.

    The verse .json files already exist alongside the .js files
    (generated by the PWA build). We copy those directly rather than
    re-parsing.

    Falls back to stripping the var wrapper if .json doesn't exist.
    """
    count = 0
    errors = []

    for translation in ('niv', 'esv'):
        for testament in ('ot', 'nt'):
            src_dir = ROOT / 'verses' / translation / testament
            out_dir = VERSES / translation
            out_dir.mkdir(parents=True, exist_ok=True)

            if not src_dir.is_dir():
                continue

            for js_file in sorted(src_dir.glob('*.js')):
                book_name = js_file.stem  # e.g. 'genesis'
                json_src = js_file.with_suffix('.json')
                out_path = out_dir / f'{book_name}.json'

                try:
                    if json_src.exists():
                        # Pre-built JSON exists — validate and copy
                        with open(json_src, encoding='utf-8') as f:
                            data = json.load(f)
                        if not isinstance(data, list):
                            raise ValueError(f"Expected array, got {type(data).__name__}")
                    else:
                        # Parse from .js: strip "var VERSES_X = " wrapper
                        with open(js_file, encoding='utf-8') as f:
                            raw = f.read()
                        # Find the array
                        m = re.search(r'var\s+VERSES_\w+\s*=\s*', raw)
                        if not m:
                            raise ValueError("Cannot find VERSES_ var declaration")
                        start = m.end()
                        # Find matching ]
                        end = raw.rindex(']', start) + 1
                        array_str = raw[start:end]
                        data = json.loads(array_str)

                    with open(out_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False)
                    count += 1

                except Exception as e:
                    errors.append((str(js_file), str(e)))

    return count, errors


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def _validate_json(path, expected_type=None, min_entries=None):
    """Load a JSON file and run basic checks."""
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    issues = []
    if expected_type and not isinstance(data, expected_type):
        issues.append(f"Expected {expected_type.__name__}, got {type(data).__name__}")
    if min_entries is not None:
        if isinstance(data, list) and len(data) < min_entries:
            issues.append(f"Expected >= {min_entries} entries, got {len(data)}")
        elif isinstance(data, dict):
            # Check specific keys for dict types
            pass
    return data, issues


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    META.mkdir(parents=True, exist_ok=True)

    converters = [
        ('book-intros', convert_book_intros),
        ('people', convert_people_data),
        ('timelines', convert_timeline_data),
        ('cross-refs', convert_cross_refs),
        ('word-studies', convert_word_study),
        ('synoptic', convert_synoptic),
        ('scholar-data', convert_scholar_data),
    ]

    print("=" * 70)
    print("Phase 0C: Converting JS data files → JSON")
    print("=" * 70)

    # --- Meta files ---
    for label, converter in converters:
        try:
            data, filename = converter()
            out_path = META / filename
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # Summary
            if isinstance(data, list):
                print(f"  ✅ {label:15s} → {filename:25s} ({len(data)} entries, "
                      f"{out_path.stat().st_size // 1024}KB)")
            elif isinstance(data, dict):
                keys = list(data.keys())
                detail_parts = []
                for k in keys:
                    v = data[k]
                    if isinstance(v, list):
                        detail_parts.append(f"{k}:{len(v)}")
                    elif isinstance(v, dict):
                        detail_parts.append(f"{k}:{len(v)} keys")
                    else:
                        detail_parts.append(k)
                detail = ', '.join(detail_parts)
                print(f"  ✅ {label:15s} → {filename:25s} ({detail}, "
                      f"{out_path.stat().st_size // 1024}KB)")
        except Exception as e:
            print(f"  ❌ {label:15s} → FAILED: {e}")

    # --- Verse files ---
    print(f"\n  Converting verse files...")
    v_count, v_errors = convert_verses()
    print(f"  ✅ Verses: {v_count} files converted")
    if v_errors:
        print(f"  ❌ Verse errors ({len(v_errors)}):")
        for path, err in v_errors:
            print(f"     {path}: {err}")

    # --- Validation summary ---
    print(f"\n{'='*70}")
    print("Validation")
    print(f"{'='*70}")

    validations = [
        ('book-intros.json', list, 66),
        ('people.json', dict, None),
        ('timelines.json', dict, None),
        ('cross-refs.json', dict, None),
        ('word-studies.json', list, 10),
        ('synoptic.json', list, 30),
        ('scholar-data.json', list, 40),
    ]

    for filename, expected_type, min_entries in validations:
        path = META / filename
        if not path.exists():
            print(f"  ❌ {filename}: NOT FOUND")
            continue
        data, issues = _validate_json(path, expected_type, min_entries)
        if issues:
            print(f"  ⚠️  {filename}: {'; '.join(issues)}")
        else:
            if isinstance(data, list):
                print(f"  ✅ {filename}: {len(data)} entries")
            elif isinstance(data, dict):
                detail = ', '.join(
                    f"{k}={len(v) if isinstance(v, (list, dict)) else type(v).__name__}"
                    for k, v in data.items()
                )
                print(f"  ✅ {filename}: {{{detail}}}")

    # Cross-refs detail check
    cr_path = META / 'cross-refs.json'
    if cr_path.exists():
        with open(cr_path) as f:
            cr = json.load(f)
        threads = cr.get('threads', [])
        pairs = cr.get('pairs', [])
        print(f"      cross-refs detail: {len(threads)} threads, {len(pairs)} pairs")
        if threads:
            t0 = threads[0]
            chain = t0.get('chain', t0.get('steps', []))
            print(f"      first thread: id={t0.get('id')}, "
                  f"theme={t0.get('theme','')[:40]}, {len(chain)} chain steps")

    # People detail check
    pp_path = META / 'people.json'
    if pp_path.exists():
        with open(pp_path) as f:
            pp = json.load(f)
        people = pp.get('people', [])
        print(f"      people detail: {len(people)} people, "
              f"{len(pp.get('era_colors', {}))} era colors, "
              f"{len(pp.get('era_names', {}))} era names")

    # Timeline detail check
    tl_path = META / 'timelines.json'
    if tl_path.exists():
        with open(tl_path) as f:
            tl = json.load(f)
        events = tl.get('events', [])
        tl_people = tl.get('timeline_people', [])
        world = tl.get('world_events', [])
        print(f"      timelines detail: {len(events)} events, "
              f"{len(tl_people)} people, {len(world)} world events "
              f"(total {len(events)+len(tl_people)+len(world)}), "
              f"{len(tl.get('era_hex', {}))} era colors, "
              f"{len(tl.get('era_ranges', {}))} era ranges")

    # Verse spot check
    niv_gen = VERSES / 'niv' / 'genesis.json'
    if niv_gen.exists():
        with open(niv_gen) as f:
            vdata = json.load(f)
        print(f"      verses spot check: NIV Genesis = {len(vdata)} verses, "
              f"first = \"{vdata[0]['text'][:40]}...\"")
    esv_gen = VERSES / 'esv' / 'genesis.json'
    if esv_gen.exists():
        with open(esv_gen) as f:
            vdata = json.load(f)
        print(f"      verses spot check: ESV Genesis = {len(vdata)} verses, "
              f"first = \"{vdata[0]['text'][:40]}...\"")

    print(f"\n{'='*70}")
    print("Phase 0C complete.")


if __name__ == '__main__':
    os.chdir(ROOT)
    main()
