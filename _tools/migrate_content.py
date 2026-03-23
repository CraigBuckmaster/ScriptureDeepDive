#!/usr/bin/env python3
"""
migrate_content.py — Migrate extracted content to clean JSON formats.

Phase 1C: Converts HTML strings in hebtext panels to structured JSON dicts,
and normalises textual panel key names. Operates on all 879 chapter JSON files.

Usage:
    python3 _tools/migrate_content.py
"""
import os, sys, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
sys.path.insert(0, str(ROOT / '_tools'))


def _strip_tx_html(text):
    """Strip HTML spans from textual notes content."""
    text = re.sub(r'<span class="tx-mt">MT</span>', 'MT:', text)
    text = re.sub(r'<span class="tx-lxx">LXX</span>', 'LXX:', text)
    text = re.sub(r'<span class="tx-dss">DSS</span>', 'DSS:', text)
    text = re.sub(r'<span class="tx-sp">SP</span>', 'SP:', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def migrate_chapter(json_path):
    """Migrate a single chapter JSON file. Returns (changed, issues)."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changed = False
    issues = []
    cp = data.get('chapter_panels', {})

    # ── 1. HEBTEXT: HTML string → list of dicts ──
    # Regenerate from section-level heb entries (already structured)
    hb = cp.get('hebtext')
    if isinstance(hb, str):
        # Aggregate section-level heb entries
        heb_entries = []
        for sec in data.get('sections', []):
            for entry in sec.get('panels', {}).get('heb', []):
                if isinstance(entry, dict):
                    heb_entries.append({
                        'word': entry.get('word', ''),
                        'tlit': entry.get('transliteration', entry.get('tlit', '')),
                        'gloss': entry.get('gloss', ''),
                        'note': entry.get('paragraph', entry.get('note', '')),
                    })
        if heb_entries:
            cp['hebtext'] = heb_entries
            changed = True
        else:
            # No section heb entries to regenerate from — remove the HTML
            del cp['hebtext']
            changed = True
            issues.append('hebtext: removed HTML (no section heb entries to regenerate from)')

    # ── 2. TEXTUAL / TX: normalise key names and strip HTML ──
    # The extractor may have stored this under 'tx' key
    tx = cp.get('tx')
    if isinstance(tx, list):
        cleaned = []
        for item in tx:
            if isinstance(item, dict):
                # Map extracted field names to schema names
                cleaned.append({
                    'ref': item.get('ref', ''),
                    'title': item.get('issue', item.get('title', '')),
                    'content': _strip_tx_html(item.get('variants', item.get('content', ''))),
                    'note': _strip_tx_html(item.get('significance', item.get('note', ''))),
                })
            elif isinstance(item, (list, tuple)) and len(item) >= 4:
                cleaned.append({
                    'ref': item[0],
                    'title': item[1],
                    'content': _strip_tx_html(str(item[2])),
                    'note': _strip_tx_html(str(item[3])),
                })
            else:
                cleaned.append(item)
        if cleaned != tx:
            cp['tx'] = cleaned
            changed = True

    # Write back if changed
    if changed:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return changed, issues


def main():
    print("=" * 60)
    print("Phase 1C: Migrating extracted content")
    print("=" * 60)

    total = 0
    migrated = 0
    hebtext_converted = 0
    tx_converted = 0
    all_issues = []

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            total += 1

            # Check pre-migration state
            with open(json_file) as f:
                pre = json.load(f)
            cp = pre.get('chapter_panels', {})
            had_html_hebtext = isinstance(cp.get('hebtext'), str)
            had_tx = isinstance(cp.get('tx'), list) and cp['tx']

            changed, issues = migrate_chapter(json_file)

            if changed:
                migrated += 1
            if had_html_hebtext and changed:
                hebtext_converted += 1
            if had_tx and changed:
                tx_converted += 1
            if issues:
                for issue in issues:
                    all_issues.append(f"{json_file.name}: {issue}")

    print(f"\n  Files processed: {total}")
    print(f"  Files modified: {migrated}")
    print(f"  Hebtext HTML → dicts: {hebtext_converted}")
    print(f"  Textual normalised: {tx_converted}")

    if all_issues:
        print(f"\n  Issues ({len(all_issues)}):")
        for issue in all_issues[:10]:
            print(f"    {issue}")
        if len(all_issues) > 10:
            print(f"    ... and {len(all_issues) - 10} more")
    else:
        print(f"  Issues: 0")

    # ── Validate all files post-migration ──
    print(f"\n{'='*60}")
    print("Post-migration validation")
    print(f"{'='*60}")

    from shared import validate_chapter_json

    valid_count = 0
    invalid_count = 0
    validation_issues = []

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            is_valid, issues = validate_chapter_json(str(json_file))
            if is_valid:
                valid_count += 1
            else:
                invalid_count += 1
                for issue in issues:
                    validation_issues.append(f"{json_file.name}: {issue}")

    print(f"  Valid: {valid_count}")
    print(f"  Invalid: {invalid_count}")
    if validation_issues:
        print(f"  Validation issues ({len(validation_issues)}):")
        for issue in validation_issues[:10]:
            print(f"    {issue}")

    # ── Verify hebtext format post-migration ──
    print(f"\n{'='*60}")
    print("Hebtext format verification")
    print(f"{'='*60}")

    hebtext_str = 0
    hebtext_list = 0
    hebtext_missing = 0

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses'):
            continue
        for json_file in sorted(book_dir.glob('*.json')):
            with open(json_file) as f:
                data = json.load(f)
            hb = data.get('chapter_panels', {}).get('hebtext')
            if hb is None:
                hebtext_missing += 1
            elif isinstance(hb, str):
                hebtext_str += 1
            elif isinstance(hb, list):
                hebtext_list += 1

    print(f"  hebtext as list (clean): {hebtext_list}")
    print(f"  hebtext as string (HTML): {hebtext_str}")
    print(f"  hebtext missing: {hebtext_missing}")

    if hebtext_str > 0:
        print(f"  ❌ {hebtext_str} hebtext panels still have HTML!")
    else:
        print(f"  ✅ All hebtext panels are clean JSON dicts")

    print(f"\n{'='*60}")
    print("Phase 1C migration complete.")


if __name__ == '__main__':
    os.chdir(ROOT)
    main()
