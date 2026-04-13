"""import_openbible_places.py — Expand places.json with OpenBible.info data.

Reads `_data/openbible/ancient.jsonl` and `_data/openbible/modern.jsonl`,
joins them, classifies/scores/filters, and **appends** new rows to
`content/meta/places.json`. The existing 73 places and their `stories`
links are preserved exactly — this is an append-only operation.

Usage
-----
    # 1. First download the source data locally:
    python3 _tools/download_openbible.py
    # 2. Then import:
    python3 _tools/import_openbible_places.py

Source data license: Creative Commons Attribution 4.0
See `content/meta/map-stories.json` → `attribution` for user-facing credit.

Part of Card #1271 (expand places from 73 to 300+).
"""

from __future__ import annotations

import json
import os
import re
import sys
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

# ── Config ────────────────────────────────────────────────────────────

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SOURCE_DIR = os.path.join(REPO_ROOT, '_data', 'openbible')
ANCIENT_JSONL = os.path.join(SOURCE_DIR, 'ancient.jsonl')
MODERN_JSONL = os.path.join(SOURCE_DIR, 'modern.jsonl')
PLACES_JSON = os.path.join(REPO_ROOT, 'content', 'meta', 'places.json')

# How many new entries to keep (in addition to the existing 73).
TARGET_NEW_MIN = 200
TARGET_NEW_MAX = 300

# Filter thresholds.
MIN_CONFIDENCE = 100  # out of 1000
MIN_REF_COUNT = 1

# Duplicate proximity (degrees of lat/lon — ~0.1° ≈ 11 km).
DUP_PROXIMITY_DEGREES = 0.1

# ── OSIS book map ─────────────────────────────────────────────────────

OSIS_BOOK_MAP: Dict[str, str] = {
    'Gen': 'Genesis', 'Exod': 'Exodus', 'Lev': 'Leviticus', 'Num': 'Numbers',
    'Deut': 'Deuteronomy', 'Josh': 'Joshua', 'Judg': 'Judges', 'Ruth': 'Ruth',
    '1Sam': '1 Samuel', '2Sam': '2 Samuel', '1Kgs': '1 Kings', '2Kgs': '2 Kings',
    '1Chr': '1 Chronicles', '2Chr': '2 Chronicles', 'Ezra': 'Ezra', 'Neh': 'Nehemiah',
    'Esth': 'Esther', 'Job': 'Job', 'Ps': 'Psalms', 'Prov': 'Proverbs',
    'Eccl': 'Ecclesiastes', 'Song': 'Song of Solomon', 'Isa': 'Isaiah',
    'Jer': 'Jeremiah', 'Lam': 'Lamentations', 'Ezek': 'Ezekiel', 'Dan': 'Daniel',
    'Hos': 'Hosea', 'Joel': 'Joel', 'Amos': 'Amos', 'Obad': 'Obadiah',
    'Jonah': 'Jonah', 'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk',
    'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 'Mal': 'Malachi',
    'Matt': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
    'Acts': 'Acts', 'Rom': 'Romans', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians',
    'Gal': 'Galatians', 'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians',
    '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians', '1Tim': '1 Timothy',
    '2Tim': '2 Timothy', 'Titus': 'Titus', 'Phlm': 'Philemon', 'Heb': 'Hebrews',
    'Jas': 'James', '1Pet': '1 Peter', '2Pet': '2 Peter', '1John': '1 John',
    '2John': '2 John', '3John': '3 John', 'Jude': 'Jude', 'Rev': 'Revelation',
}

DIRS = ('e', 'n', 'w', 's', 'ne', 'nw', 'se', 'sw')


# ── Pure helpers (all unit-tested) ────────────────────────────────────

def osis_to_ref(osis: str) -> str:
    """Convert an OSIS reference to a human-readable form.

    Examples:
        Gen.12.1     → "Genesis 12:1"
        2Kgs.5.12    → "2 Kings 5:12"
        Ps.23        → "Psalms 23"
        Unknown.1.1  → "Unknown 1:1"   (book kept verbatim)
    """
    if not osis:
        return ''
    parts = osis.split('.')
    book = OSIS_BOOK_MAP.get(parts[0], parts[0])
    if len(parts) >= 3:
        return f'{book} {parts[1]}:{parts[2]}'
    if len(parts) == 2:
        return f'{book} {parts[1]}'
    return book


def classify_type(cls: str, land_or_water: str, ancient_name: str) -> str:
    """Map OpenBible's class/land-or-water to our `type` enum.

    Returns one of: 'city', 'water', 'mountain', 'region', 'site'.
    """
    if land_or_water == 'water':
        return 'water'
    if cls == 'natural':
        name_lower = (ancient_name or '').lower()
        if any(w in name_lower for w in ('mount', 'hill', 'peak')):
            return 'mountain'
        if any(
            w in name_lower
            for w in ('valley', 'plain', 'desert', 'wilderness', 'land of', 'region')
        ):
            return 'region'
        return 'site'
    return 'city'


def assign_priority(ref_count: int) -> int:
    """Map a Bible-reference count to a zoom-priority tier (1 = most important)."""
    if ref_count >= 50:
        return 1
    if ref_count >= 10:
        return 2
    if ref_count >= 5:
        return 3
    return 4


def assign_label_dir(index: int) -> str:
    """Deterministically rotate label offsets across new places."""
    return DIRS[index % len(DIRS)]


def parse_lonlat(raw: str) -> Optional[Tuple[float, float]]:
    """Parse the "lon,lat" string used by modern.jsonl.

    Returns (lon, lat) as floats, or None if parsing fails.
    """
    if not raw or not isinstance(raw, str):
        return None
    parts = raw.split(',')
    if len(parts) != 2:
        return None
    try:
        return (float(parts[0].strip()), float(parts[1].strip()))
    except ValueError:
        return None


def parse_ancient_extra(extra: Any) -> Dict[str, Any]:
    """Parse the `extra` field — it's a JSON-string INSIDE a JSON object.

    Returns the parsed dict, or {} on any failure. Tolerates when `extra`
    is already a dict (defensive — some JSONL variants may change format).
    """
    if isinstance(extra, dict):
        return extra
    if not isinstance(extra, str):
        return {}
    try:
        value = json.loads(extra)
        return value if isinstance(value, dict) else {}
    except (ValueError, TypeError):
        return {}


def make_id(ancient_name: str, existing_ids: Set[str]) -> str:
    """Slug `ancient_name` into a short, url-friendly id unique to `existing_ids`."""
    slug = re.sub(r'[^a-z0-9]+', '_', (ancient_name or '').lower()).strip('_')
    if not slug:
        slug = 'place'
    candidate = slug
    suffix = 2
    while candidate in existing_ids:
        candidate = f'{slug}_{suffix}'
        suffix += 1
    return candidate


def is_duplicate(
    new_place: Dict[str, Any],
    existing: Iterable[Dict[str, Any]],
    threshold_deg: float = DUP_PROXIMITY_DEGREES,
) -> bool:
    """Whether `new_place` already exists in `existing` (by name or proximity)."""
    name_lower = new_place['ancient'].lower()
    lat = new_place['lat']
    lon = new_place['lon']
    for ex in existing:
        ex_name = (ex.get('ancient') or '').lower()
        if not ex_name:
            continue
        if ex_name == name_lower:
            return True
        ex_lat = ex.get('lat')
        ex_lon = ex.get('lon')
        if ex_lat is None or ex_lon is None:
            continue
        if (
            abs(ex_lat - lat) < threshold_deg
            and abs(ex_lon - lon) < threshold_deg
            and (name_lower in ex_name or ex_name in name_lower)
        ):
            return True
    return False


def osises_to_refs(osises: List[str], limit: int = 5) -> List[str]:
    """Convert up to `limit` OSIS refs to display-form strings, preserving order."""
    if not osises:
        return []
    out: List[str] = []
    for osis in osises:
        if not isinstance(osis, str) or not osis:
            continue
        out.append(osis_to_ref(osis))
        if len(out) >= limit:
            break
    return out


def build_place_entry(
    ancient: Dict[str, Any],
    modern: Dict[str, Any],
    osises: List[str],
    label_index: int,
    existing_ids: Set[str],
) -> Optional[Dict[str, Any]]:
    """Assemble the final places.json entry from a joined ancient/modern pair.

    Returns None if the pair can't produce a valid entry (missing
    coordinates, etc.). Mutates `existing_ids` to reserve the newly
    allocated id.
    """
    ancient_name = ancient.get('friendly_id') or ''
    if not ancient_name:
        return None

    coords = parse_lonlat(modern.get('lonlat'))
    if coords is None:
        return None
    lon, lat = coords

    refs = osises_to_refs(osises)
    ref_count = len(osises)

    associations = modern.get('ancient_associations') or {}
    score_obj = associations.get(ancient.get('id'), {})
    confidence = score_obj.get('score') if isinstance(score_obj, dict) else None
    if not isinstance(confidence, (int, float)):
        confidence = None
    else:
        confidence = int(confidence)

    cls = modern.get('class') or ancient.get('identifications', [{}])[0].get('class', '')
    land_or_water = modern.get('land_or_water') or ''
    place_type = classify_type(cls, land_or_water, ancient_name)

    new_id = make_id(ancient_name, existing_ids)
    existing_ids.add(new_id)

    return {
        'id': new_id,
        'ancient': ancient_name,
        'modern': modern.get('friendly_id') or None,
        'lon': round(lon, 4),
        'lat': round(lat, 4),
        'type': place_type,
        'priority': assign_priority(ref_count),
        'labelDir': assign_label_dir(label_index),
        'stories': [],
        'refs': refs,
        'confidence': confidence,
    }


# ── IO + join ─────────────────────────────────────────────────────────

def load_jsonl(path: str) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    with open(path, 'r', encoding='utf-8') as fh:
        for lineno, raw in enumerate(fh, start=1):
            raw = raw.strip()
            if not raw:
                continue
            try:
                rows.append(json.loads(raw))
            except ValueError as exc:
                print(f'WARN {path}:{lineno} — bad JSON ({exc})', file=sys.stderr)
    return rows


def index_modern_by_id(modern_rows: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    return {row['id']: row for row in modern_rows if 'id' in row}


def join_and_filter(
    ancient_rows: List[Dict[str, Any]],
    modern_rows: List[Dict[str, Any]],
    existing_places: List[Dict[str, Any]],
    *,
    min_confidence: int = MIN_CONFIDENCE,
    min_ref_count: int = MIN_REF_COUNT,
    target_max: int = TARGET_NEW_MAX,
) -> List[Dict[str, Any]]:
    """Join ancient ↔ modern, filter, dedup against existing, return new entries.

    Entries are sorted by reference count desc; we take up to `target_max`.
    The pure logic lives here so it can be exercised from unit tests with
    small in-memory fixtures.
    """
    modern_by_id = index_modern_by_id(modern_rows)
    existing_ids: Set[str] = {p['id'] for p in existing_places if 'id' in p}

    # (ref_count, entry)
    candidates: List[Tuple[int, Dict[str, Any]]] = []

    for idx, ancient in enumerate(ancient_rows):
        identifications = ancient.get('identifications') or []
        if not identifications:
            continue

        modern_id = identifications[0].get('id')
        if not modern_id:
            continue
        modern = modern_by_id.get(modern_id)
        if modern is None:
            continue

        extra = parse_ancient_extra(ancient.get('extra'))
        osises = extra.get('osises') or []
        if not isinstance(osises, list):
            osises = []
        if len(osises) < min_ref_count:
            continue

        entry = build_place_entry(ancient, modern, osises, idx, existing_ids)
        if entry is None:
            continue

        if entry['confidence'] is not None and entry['confidence'] < min_confidence:
            # Claim the id for nothing — release it so we don't block others.
            existing_ids.discard(entry['id'])
            continue

        if is_duplicate(entry, existing_places):
            existing_ids.discard(entry['id'])
            continue

        candidates.append((len(osises), entry))

    # Sort by reference count desc, stable by insertion order.
    candidates.sort(key=lambda pair: pair[0], reverse=True)

    # Re-assign `labelDir` after the final sort so rotation feels even on the map.
    selected: List[Dict[str, Any]] = []
    for i, (_, entry) in enumerate(candidates[:target_max]):
        entry['labelDir'] = assign_label_dir(i)
        selected.append(entry)
    return selected


# ── CLI driver ────────────────────────────────────────────────────────

def _ensure_source_files() -> None:
    missing = [p for p in (ANCIENT_JSONL, MODERN_JSONL) if not os.path.exists(p)]
    if not missing:
        return
    rel = [os.path.relpath(p, REPO_ROOT) for p in missing]
    print(
        'Source JSONL files not found:\n  ' + '\n  '.join(rel) + '\n'
        'Run `python3 _tools/download_openbible.py` first.',
        file=sys.stderr,
    )
    sys.exit(2)


def main() -> int:
    _ensure_source_files()

    print(f'Loading {os.path.relpath(ANCIENT_JSONL, REPO_ROOT)}...')
    ancient_rows = load_jsonl(ANCIENT_JSONL)
    print(f'  {len(ancient_rows)} ancient rows')

    print(f'Loading {os.path.relpath(MODERN_JSONL, REPO_ROOT)}...')
    modern_rows = load_jsonl(MODERN_JSONL)
    print(f'  {len(modern_rows)} modern rows')

    print(f'Loading {os.path.relpath(PLACES_JSON, REPO_ROOT)}...')
    with open(PLACES_JSON, 'r', encoding='utf-8') as fh:
        existing = json.load(fh)
    print(f'  {len(existing)} existing places')

    new_entries = join_and_filter(ancient_rows, modern_rows, existing)
    if len(new_entries) < TARGET_NEW_MIN:
        print(
            f'WARN: only {len(new_entries)} new entries survived filtering '
            f'(target {TARGET_NEW_MIN}+). Check thresholds.',
            file=sys.stderr,
        )

    combined = existing + new_entries

    # Write back with the same formatting as existing content files.
    with open(PLACES_JSON, 'w', encoding='utf-8') as fh:
        json.dump(combined, fh, indent=2, ensure_ascii=False)
        fh.write('\n')

    print(
        f'Wrote {len(combined)} total places '
        f'({len(existing)} existing + {len(new_entries)} new) '
        f'to {os.path.relpath(PLACES_JSON, REPO_ROOT)}.'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
