#!/usr/bin/env python3
"""
audit_explore_images.py — Audit every URL in explore-images.json.

Classifies each manifest entry:
  LIVE        — URL returns 200 on R2 (card will render)
  REUPLOAD    — URL returns non-200 but bytes exist in _tools/art_sources/
                → fix by running fix_missing_art.py for that filename
  DEAD        — URL returns non-200 and no local bytes
                → needs re-curation (extend discover_art_sources.py SUBJECTS)
  FEATURED    — Resolves via content_images SQLite, not an inline URL
  UNCOVERED   — Entry exists in manifest but has no images[] and empty featured[]
  NO_ENTRY    — Screen has no manifest entry at all

Run:  python _tools/audit_explore_images.py

Exit codes:
    0  — every card has at least one LIVE image (or FEATURED via SQLite)
    1  — one or more cards lack image coverage
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'app' / 'assets' / 'explore-images.json'
ART_SOURCES = ROOT / '_tools' / 'art_sources'

# Every screen the Explore menu references. Must be kept in sync with
# SECTIONS in app/src/screens/ExploreMenuScreen.tsx. If a screen is listed
# here but absent from the manifest, the audit reports NO_ENTRY.
EXPLORE_SCREENS = [
    'GenealogyTree', 'Timeline', 'Map', 'Periods', 'RedemptiveArc',
    'JourneyBrowse', 'TopicBrowse', 'ProphecyBrowse', 'ThreadBrowse', 'HarmonyBrowse',
    'WordStudyBrowse', 'Concordance', 'DictionaryBrowse',
    'ScholarBrowse', 'DebateBrowse', 'DifficultPassagesBrowse', 'ContentLibrary',
    'LifeTopics',
    'LensBrowse', 'ArchaeologyBrowse', 'TimeTravelBrowse', 'GrammarBrowse',
]

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'


def head(url: str) -> int:
    """Return HTTP status or 0 on network error."""
    req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def filename_from_url(url: str) -> str:
    return url.rsplit('/', 1)[-1]


def main() -> int:
    manifest = json.loads(MANIFEST.read_text())

    rows: list[dict] = []

    for screen in EXPLORE_SCREENS:
        entry = manifest.get(screen)
        if entry is None:
            rows.append({'screen': screen, 'status': 'NO_ENTRY', 'detail': 'not in manifest'})
            continue

        featured = entry.get('featured') or []
        images = entry.get('images') or []

        if featured:
            rows.append({
                'screen': screen,
                'status': 'FEATURED',
                'detail': f"{len(featured)} featured ids via content_images",
            })
            continue

        if not images:
            rows.append({
                'screen': screen,
                'status': 'UNCOVERED',
                'detail': 'no featured[], no images[]',
            })
            continue

        # Inline images — HEAD each
        per_url = []
        all_live = True
        for img in images:
            url = img['url']
            code = head(url)
            fname = filename_from_url(url)
            has_local = (ART_SOURCES / fname).exists()
            if code == 200:
                per_url.append(('LIVE', fname))
            elif has_local:
                per_url.append(('REUPLOAD', fname))
                all_live = False
            else:
                per_url.append(('DEAD', fname))
                all_live = False

        status = 'LIVE' if all_live else 'PARTIAL'
        detail = ', '.join(f'{s}:{f}' for s, f in per_url)
        rows.append({'screen': screen, 'status': status, 'detail': detail})

    # Print table
    print(f"{'SCREEN':<28} {'STATUS':<10} DETAIL")
    print('-' * 100)
    for r in rows:
        print(f"{r['screen']:<28} {r['status']:<10} {r['detail']}")

    # Summary
    counts: dict[str, int] = {}
    for r in rows:
        counts[r['status']] = counts.get(r['status'], 0) + 1
    print()
    print('Summary:', ', '.join(f'{k}={v}' for k, v in sorted(counts.items())))

    broken = sum(1 for r in rows if r['status'] in {'NO_ENTRY', 'UNCOVERED', 'PARTIAL'})
    return 0 if broken == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
