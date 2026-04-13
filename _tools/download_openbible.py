"""download_openbible.py — Fetch OpenBible.info source data for the place import.

Downloads the CC BY 4.0 geocoding JSONL files from
https://github.com/openbibleinfo/Bible-Geocoding-Data into
`_data/openbible/`. This script must be run locally — the Claude Code
container has no egress to raw.githubusercontent.com.

Usage
-----
    python3 _tools/download_openbible.py

Outputs
-------
    _data/openbible/ancient.jsonl   (~11 MB)
    _data/openbible/modern.jsonl    (~3 MB)

The files are git-ignored by default (see _data/README.md). Re-run this
script whenever you need to refresh the source data.

Part of Card #1271 (expand places from 73 to 300+).
"""

from __future__ import annotations

import os
import sys
import urllib.request


SOURCE_REPO = 'openbibleinfo/Bible-Geocoding-Data'
BASE_URL = f'https://raw.githubusercontent.com/{SOURCE_REPO}/main/data'
FILES = ('ancient.jsonl', 'modern.jsonl')


def main() -> int:
    out_dir = os.path.join(os.path.dirname(__file__), '..', '_data', 'openbible')
    out_dir = os.path.abspath(out_dir)
    os.makedirs(out_dir, exist_ok=True)

    print(f'Target directory: {out_dir}')
    downloaded = 0
    skipped = 0

    for fname in FILES:
        dest = os.path.join(out_dir, fname)
        if os.path.exists(dest):
            size_kb = os.path.getsize(dest) / 1024
            print(f'  SKIP {fname} (already exists, {size_kb:.0f} KB)')
            skipped += 1
            continue

        url = f'{BASE_URL}/{fname}'
        print(f'  GET {url}')
        try:
            urllib.request.urlretrieve(url, dest)
        except Exception as exc:  # network, HTTP, IO — all fatal
            print(f'  FAILED {fname}: {exc}', file=sys.stderr)
            return 1
        size_kb = os.path.getsize(dest) / 1024
        print(f'  Saved → {dest} ({size_kb:.0f} KB)')
        downloaded += 1

    print(
        f'Done. Downloaded {downloaded}, skipped {skipped}. '
        'Run `python3 _tools/import_openbible_places.py` next.'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
