#!/usr/bin/env python3
"""Migration: convert person journey data from people.json into unified journey JSON.

Reads content/meta/people.json, finds every person with a non-empty `journey`
array, and writes a journey JSON file at content/meta/journeys/person/{person_id}.json.

Idempotent — running twice cleanly overwrites existing files.

Usage (from repo root):
    python _tools/migrate_person_journeys.py
"""
import json
import os
import sys
from pathlib import Path

# Resolve repo root from this file's location (_tools/migrate_person_journeys.py)
REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / '_tools'))

from content_writer import save_journey


def load_people():
    """Load people.json and return the list of person dicts."""
    path = REPO / 'content' / 'meta' / 'people.json'
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['people']


def parse_chapters(raw):
    """Normalise chapters field — could be a list or a JSON string."""
    if raw is None:
        return []
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, TypeError):
            return []
    if isinstance(raw, list):
        return raw
    return []


def build_person_journey(person):
    """Convert a person dict with journey stages into unified journey format."""
    journey = person.get('journey', [])
    if not journey:
        return None

    pid = person['id']
    name = person['name']
    role = person.get('role')

    # Ensure description is non-empty (required by save_journey)
    description = person.get('bio') or person.get('summary') or ''
    if not description.strip():
        parts = [name]
        if role:
            parts.append(role)
        description = ' — '.join(parts)

    depth = 'long' if len(journey) >= 8 else 'medium' if len(journey) >= 5 else 'short'

    stops = []
    for i, stage in enumerate(journey):
        chapters = parse_chapters(stage.get('chapters'))
        chapter_num = chapters[0] if chapters else None

        stops.append({
            'stop_order': i + 1,
            'stop_type': 'regular',
            'label': stage['stage'],
            'ref': stage['verse_ref'],
            'book_id': stage['book_dir'],
            'chapter_num': chapter_num,
            'verse_start': None,
            'verse_end': None,
            'development': stage.get('summary', ''),
            'what_changes': stage.get('theme', ''),
            'linked_journey_id': None,
            'linked_journey_intro': None,
            'bridge_to_next': '[BRIDGE TO AUTHOR]' if i < len(journey) - 1 else None,
        })

    return {
        'id': pid,
        'journey_type': 'person',
        'lens_id': 'biographical',
        'title': name,
        'subtitle': role,
        'description': description,
        'depth': depth,
        'sort_order': 0,
        'person_id': pid,
        'concept_id': None,
        'era': person.get('era'),
        'hero_image_url': person.get('image_url'),
        'tags': [],
        'stops': stops,
    }


def main():
    print('=== Migrating person journeys to unified format ===\n')

    people = load_people()
    migrated = 0
    skipped = 0

    for person in people:
        journey = person.get('journey', [])
        if not journey:
            continue

        journey_dict = build_person_journey(person)
        if journey_dict is None:
            skipped += 1
            continue

        save_journey('person', journey_dict)
        migrated += 1

    print(f'\n=== Done: {migrated} person journeys migrated, {skipped} skipped ===')


if __name__ == '__main__':
    main()
