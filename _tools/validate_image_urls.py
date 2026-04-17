#!/usr/bin/env python3
"""
validate_image_urls.py — Ensure no Wikimedia hotlink URLs remain in content.

Wikimedia blocks hotlinking from mobile apps (HTTP 403). All images must
be hosted on R2 (contentcompanionstudy.com) or another owned CDN.

Scans:
  - content/meta/explore-images.json   (explore panel images)
  - app/assets/explore-images.json     (bundled copy — must match source)
  - content/meta/scholar-bios.json     (scholar portrait images)

Exit codes:
  0 = all clear
  1 = blocked hotlink URLs found

Usage:
    python3 _tools/validate_image_urls.py

Part of the build pipeline — called from build_sqlite.py.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'
ASSETS = ROOT / 'app' / 'assets'

BLOCKED_HOSTS = [
    'upload.wikimedia.org',
    'upload.wikipedia.org',
    'commons.wikimedia.org',
]

SCAN_TARGETS = [
    META / 'explore-images.json',
    ASSETS / 'explore-images.json',
    META / 'scholar-bios.json',
    META / 'book-intros.json',
    META / 'concepts.json',
    META / 'map-stories.json',
    META / 'people.json',
    META / 'prophecy-chains.json',
    META / 'timelines.json',
    META / 'word-studies.json',
]

# Also scan journey files dynamically
JOURNEY_DIR = META / 'journeys'


def find_image_urls(obj, path=''):
    """Recursively yield (json_path, url) for any key that looks like an image URL."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            child_path = f'{path}.{k}' if path else k
            if k in ('url', 'image_url', 'image', 'portrait_url', 'src', 'hero_image_url'):
                if isinstance(v, str) and v.startswith('http'):
                    yield child_path, v
            else:
                yield from find_image_urls(v, child_path)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            yield from find_image_urls(item, f'{path}[{i}]')


def is_blocked(url):
    """Return True if the URL uses a blocked host."""
    for host in BLOCKED_HOSTS:
        if host in url:
            return True
    return False


def validate_file(path):
    """Validate a single JSON file. Returns list of (path, url) violations."""
    if not path.exists():
        return []
    try:
        data = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        print(f'  WARNING: Could not parse {path.name}: {e}')
        return []

    violations = []
    for json_path, url in find_image_urls(data):
        if is_blocked(url):
            violations.append((json_path, url))
    return violations


def validate_manifest_sync():
    """Verify content/meta/explore-images.json matches app/assets/explore-images.json."""
    src = META / 'explore-images.json'
    dst = ASSETS / 'explore-images.json'
    if not src.exists() or not dst.exists():
        return True  # Can't check if one doesn't exist

    try:
        src_data = json.load(open(src, encoding='utf-8'))
        dst_data = json.load(open(dst, encoding='utf-8'))
    except Exception:
        return True

    if json.dumps(src_data, sort_keys=True) != json.dumps(dst_data, sort_keys=True):
        print('  DRIFT: content/meta/explore-images.json and app/assets/explore-images.json differ!')
        print('         Run build_sqlite.py to sync, or fix the source of truth in content/meta/.')
        return False
    return True


def main():
    print('Image URL validation')
    print('=' * 50)

    total_violations = 0
    for path in SCAN_TARGETS:
        rel = path.relative_to(ROOT)
        violations = validate_file(path)
        if violations:
            print(f'\n  FAIL: {rel} — {len(violations)} blocked hotlink URL(s):')
            for json_path, url in violations:
                # Truncate URL for readability
                display_url = url if len(url) < 80 else url[:77] + '...'
                print(f'    {json_path}: {display_url}')
            total_violations += len(violations)
        else:
            print(f'  OK: {rel}')

    # Scan journey files
    if JOURNEY_DIR.exists():
        for journey_file in sorted(JOURNEY_DIR.rglob('*.json')):
            violations = validate_file(journey_file)
            if violations:
                rel = journey_file.relative_to(ROOT)
                print(f'\n  FAIL: {rel} — {len(violations)} blocked hotlink URL(s):')
                for json_path, url in violations:
                    display_url = url if len(url) < 80 else url[:77] + '...'
                    print(f'    {json_path}: {display_url}')
                total_violations += len(violations)

    synced = validate_manifest_sync()

    if total_violations > 0:
        print(f'\n✗ {total_violations} blocked hotlink URL(s) found.')
        print('  All images must be hosted on R2 (contentcompanionstudy.com).')
        print('  Run: python _tools/download_explore_images.py')
        print('  Then: python _tools/upload_images_to_r2.py --priority')
        sys.exit(1)

    if not synced:
        print('\n✗ Manifest drift detected.')
        sys.exit(1)

    print('\n✓ All image URLs are on owned infrastructure.')
    sys.exit(0)


if __name__ == '__main__':
    main()
