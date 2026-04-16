#!/usr/bin/env python3
"""Migration: convert concept journey data from concepts.json into unified journey JSON.

Reads content/meta/concepts.json, finds every concept with non-empty `journey_stops`,
and writes a journey JSON file at content/meta/journeys/concept/{concept_id}.json.

Idempotent — running twice cleanly overwrites existing files.

Usage (from repo root):
    python _tools/migrate_concept_journeys.py
"""
import json
import os
import sys
from pathlib import Path

# Resolve repo root from this file's location (_tools/migrate_concept_journeys.py)
REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / '_tools'))

from content_writer import save_journey


def load_concepts():
    """Load concepts.json and return the list of concept dicts."""
    path = REPO / 'content' / 'meta' / 'concepts.json'
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def build_concept_journey(concept):
    """Convert a concept dict with journey_stops into unified journey format."""
    stops_raw = concept.get('journey_stops', [])
    if not stops_raw:
        return None

    cid = concept['id']
    title = concept['title']

    # Ensure description is non-empty (required by save_journey)
    description = concept.get('description', '')
    if not description.strip():
        description = f'{title} in Scripture'

    depth = 'long' if len(stops_raw) >= 10 else 'medium' if len(stops_raw) >= 6 else 'short'

    # Build hero_image_url from first image if available
    images = concept.get('images')
    hero_image_url = None
    if images and isinstance(images, list) and len(images) > 0:
        first_img = images[0]
        if isinstance(first_img, dict):
            hero_image_url = first_img.get('url')

    # Build tags from related IDs
    tags = []
    for wid in concept.get('word_study_ids', []):
        tags.append({'type': 'word_study', 'id': wid})
    for pid in concept.get('prophecy_chain_ids', []):
        tags.append({'type': 'prophecy_chain', 'id': pid})
    for pid in concept.get('people_tags', []):
        tags.append({'type': 'person', 'id': pid})
    for tag in concept.get('tags', []):
        tags.append({'type': 'theme', 'id': tag})

    # Build stops
    stops = []
    for i, stop in enumerate(stops_raw):
        stops.append({
            'stop_order': i + 1,
            'stop_type': 'regular',
            'label': stop['label'],
            'ref': stop['ref'],
            'book_id': stop['book'],
            'chapter_num': stop['chapter'],
            'verse_start': None,
            'verse_end': None,
            'development': stop.get('development', ''),
            'what_changes': stop.get('what_changes', ''),
            'linked_journey_id': None,
            'linked_journey_intro': None,
            'bridge_to_next': '[BRIDGE TO AUTHOR]' if i < len(stops_raw) - 1 else None,
        })

    return {
        'id': cid,
        'journey_type': 'concept',
        'lens_id': 'theological',
        'title': title,
        'subtitle': None,
        'description': description,
        'depth': depth,
        'sort_order': 0,
        'person_id': None,
        'concept_id': cid,
        'era': None,
        'hero_image_url': hero_image_url,
        'tags': tags,
        'stops': stops,
    }


def main():
    print('=== Migrating concept journeys to unified format ===\n')

    concepts = load_concepts()
    migrated = 0
    skipped = 0

    for concept in concepts:
        stops = concept.get('journey_stops', [])
        if not stops:
            skipped += 1
            continue

        journey_dict = build_concept_journey(concept)
        if journey_dict is None:
            skipped += 1
            continue

        save_journey('concept', journey_dict)
        migrated += 1

    print(f'\n=== Done: {migrated} concept journeys migrated, {skipped} skipped ===')


if __name__ == '__main__':
    main()
