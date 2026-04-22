#!/usr/bin/env python3
"""
discover_art_sources.py — Resolve r2_filename → current Commons File: name + direct URL.

Uses the MediaWiki Action API on commons.wikimedia.org to:
  1. Search Commons in the File: namespace for each subject
  2. Pick the highest-scoring candidate by a deterministic heuristic
  3. Fetch imageinfo → direct URL + width/height/mime
  4. Write a JSON mapping to _tools/art_sources/_discovered.json

This is the INPUT to patching TARGETS in fix_missing_art.py and to
populating _tools/art_sources/ via --populate-sources.

Run:  python _tools/discover_art_sources.py

Does not require R2 credentials. Only needs network access to
commons.wikimedia.org (confirmed reachable from residential IPs; GH Actions
runners may be blocked — if so, run locally and commit the JSON output).
"""
from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print('[X] requests not installed. Run: python -m pip install requests')
    sys.exit(2)

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / '_tools' / 'art_sources' / '_discovered.json'

USER_AGENT = (
    'CompanionStudyDiscovery/1.0 '
    '(https://companionstudy.app; craig@companionstudy.app) '
    'requests/2.x'
)

API = 'https://commons.wikimedia.org/w/api.php'

# Subject catalog. First-guess filenames are tried directly before searching.
# All filenames exclude the "File:" prefix.
SUBJECTS = [
    {
        'r2_filename': 'figures-abraham-journey.jpg',
        'first_guesses': [],
        'search': 'Abraham journey Figures Bible 1728',
        'name_must_include': ['abraham'],
        'name_should_include': ['figures', 'journey', 'bible'],
    },
    {
        'r2_filename': 'figures-red-sea-crossing.jpg',
        'first_guesses': [],
        'search': 'Crossing Red Sea Figures Bible 1728',
        'name_must_include': ['red sea'],
        'name_should_include': ['figures', 'crossing', 'bible'],
    },
    {
        'r2_filename': 'holman-paul-journey3.jpg',
        'first_guesses': [],
        'search': 'Holman Paul third missionary journey map',
        'name_must_include': ['paul'],
        'name_should_include': ['holman', 'third', 'missionary', 'journey'],
    },
    {
        'r2_filename': 'campin-nativity.jpg',
        'first_guesses': ['Robert Campin - The Nativity - WGA14426.jpg'],
        'search': 'Robert Campin Nativity WGA',
        'name_must_include': ['campin', 'nativity'],
        'name_should_include': ['wga'],
    },
    {
        'r2_filename': 'schnorr-010.jpg',
        'first_guesses': [
            'Schnorr von Carolsfeld Bibel in Bildern 1860 010.png',
        ],
        'search': 'Schnorr Carolsfeld Bibel Bildern 1860 010',
        'name_must_include': ['schnorr', '010'],
        'name_should_include': ['bibel', 'bildern'],
    },
    {
        'r2_filename': 'schnorr-091.jpg',
        'first_guesses': [
            'Schnorr von Carolsfeld Bibel in Bildern 1860 091.png',
        ],
        'search': 'Schnorr Carolsfeld Bibel Bildern 1860 091',
        'name_must_include': ['schnorr', '091'],
        'name_should_include': ['bibel', 'bildern'],
    },
    {
        'r2_filename': 'michelangelo-isaiah.jpg',
        'first_guesses': [
            "'Isaiah Sistine Chapel ceiling' by Michelangelo JBU36FXD.jpg",
            "'Isaiah Sistine Chapel ceiling' by Michelangelo JBU36.jpg",
        ],
        'search': 'Isaiah Sistine Chapel Michelangelo',
        'name_must_include': ['isaiah'],
        'name_should_include': ['michelangelo', 'sistine'],
    },
    {
        'r2_filename': 'michelangelo-daniel.jpg',
        'first_guesses': [
            'Michelangelo, profeti, Daniel 03.jpg',
        ],
        'search': 'Daniel Sistine Chapel Michelangelo prophet',
        'name_must_include': ['daniel'],
        'name_should_include': ['michelangelo', 'sistine'],
    },
    {
        'r2_filename': 'michelangelo-jeremiah.jpg',
        'first_guesses': [],
        'search': 'Jeremiah Sistine Chapel Michelangelo prophet',
        'name_must_include': ['jeremiah'],
        'name_should_include': ['michelangelo', 'sistine'],
    },
]


def mw_get(params: dict) -> dict:
    params = {**params, 'format': 'json', 'formatversion': '2'}
    r = requests.get(API, params=params, headers={'User-Agent': USER_AGENT}, timeout=30)
    r.raise_for_status()
    return r.json()


def imageinfo_for(filename: str) -> dict | None:
    """Return {'title','url','width','height','mime','size'} or None if missing/deleted."""
    data = mw_get({
        'action': 'query',
        'titles': f'File:{filename}',
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime',
    })
    pages = data.get('query', {}).get('pages', [])
    if not pages:
        return None
    page = pages[0]
    if page.get('missing') or page.get('invalid'):
        return None
    infos = page.get('imageinfo', [])
    if not infos:
        return None
    info = infos[0]
    return {
        'title': page['title'],
        'url': info['url'],
        'width': info.get('width'),
        'height': info.get('height'),
        'mime': info.get('mime'),
        'size': info.get('size'),
    }


def search_files(query: str, limit: int = 20) -> list[str]:
    """Return a list of File: titles (without prefix) matching the query."""
    data = mw_get({
        'action': 'query',
        'list': 'search',
        'srsearch': query,
        'srnamespace': 6,
        'srlimit': limit,
    })
    hits = data.get('query', {}).get('search', [])
    return [h['title'].removeprefix('File:') for h in hits]


def score(title: str, subject: dict) -> int:
    """Deterministic scoring. Higher is better. -1 disqualifies."""
    t = title.lower()
    s = 0
    for word in subject['name_must_include']:
        if word.lower() not in t:
            return -1
        s += 100
    for word in subject['name_should_include']:
        if word.lower() in t:
            s += 20
    for bad in ['detail', 'crop', 'derivative', 'after ', 'copy']:
        if bad in t:
            s -= 30
    if t.endswith('.jpg') or t.endswith('.jpeg'):
        s += 5
    return s


def resolve(subject: dict) -> dict:
    """Resolve one subject. Returns a dict the caller can persist."""
    r2 = subject['r2_filename']
    for candidate in subject['first_guesses']:
        info = imageinfo_for(candidate)
        if info:
            return {
                'r2_filename': r2,
                'status': 'ok',
                'method': 'first_guess',
                'commons_title': info['title'],
                'source_url': info['url'],
                'width': info['width'],
                'height': info['height'],
                'mime': info['mime'],
                'size_bytes': info['size'],
            }
    hits = search_files(subject['search'])
    scored = [(score(t, subject), t) for t in hits]
    scored = [(sc, t) for sc, t in scored if sc >= 0]
    scored.sort(reverse=True)
    for _, title in scored:
        info = imageinfo_for(title)
        if info:
            return {
                'r2_filename': r2,
                'status': 'ok',
                'method': 'search',
                'commons_title': info['title'],
                'source_url': info['url'],
                'width': info['width'],
                'height': info['height'],
                'mime': info['mime'],
                'size_bytes': info['size'],
                'search_runner_ups': [t for _, t in scored[:5] if t != title],
            }
    return {
        'r2_filename': r2,
        'status': 'not_found',
        'method': 'exhausted',
        'search_query': subject['search'],
        'search_hits': hits[:10],
    }


def main() -> int:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    resolved: list[dict] = []
    failed: list[dict] = []
    for i, subject in enumerate(SUBJECTS, 1):
        print(f"[{i}/{len(SUBJECTS)}] resolving {subject['r2_filename']}…")
        try:
            result = resolve(subject)
        except Exception as e:
            print(f'         [X] exception: {e}')
            result = {'r2_filename': subject['r2_filename'], 'status': 'error', 'error': str(e)}
        if result.get('status') == 'ok':
            print(
                f"         [OK] {result['commons_title']} "
                f"({result['width']}x{result['height']} {result['mime']}, "
                f"{result['size_bytes']:,} B)"
            )
            resolved.append(result)
        else:
            print(f"         [X] {result.get('status')}: {result.get('error', result.get('search_query', ''))}")
            failed.append(result)

    out = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'resolved': resolved,
        'failed': failed,
    }
    OUT_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print()
    print(f'Wrote {OUT_PATH} — {len(resolved)} ok, {len(failed)} failed')
    return 0 if not failed else 1


if __name__ == '__main__':
    sys.exit(main())
