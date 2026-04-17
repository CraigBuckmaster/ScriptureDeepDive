"""
build_prompts_entity.py — Templated entity chips (zero LLM cost).

Chips for people/places/debate topics are deterministic templates because a
user's intent on those screens is narrow enough that static phrasing works.
The chapter chips in `build_prompts.py` are the LLM-generated set; this
module produces the companion entity rows.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterator

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'


def _prettify(name: str) -> str:
    return name.replace('_', ' ').replace('-', ' ').strip()


def person_chips(person_id: str, name: str) -> list[dict[str, Any]]:
    pretty = _prettify(name or person_id)
    return [
        {
            'label': f'Who was {pretty}?',
            'seed_query': f'Who was {pretty} — summarize in 3 sentences.',
            'expected_source_types': ['section_panel', 'chapter_panel'],
        },
        {
            'label': f'Where does {pretty} appear in scripture?',
            'seed_query': f'List the main scripture references for {pretty}.',
            'expected_source_types': ['cross_ref_thread_note'],
        },
        {
            'label': f'Scholars on {pretty}',
            'seed_query': f'How do the scholars read {pretty}?',
            'expected_source_types': ['section_panel'],
        },
    ]


def place_chips(place_id: str, name: str) -> list[dict[str, Any]]:
    pretty = _prettify(name or place_id)
    return [
        {
            'label': f'What happened at {pretty}?',
            'seed_query': f'What significant events occurred at {pretty}?',
            'expected_source_types': ['section_panel', 'chapter_panel'],
        },
        {
            'label': f'Scholars on {pretty}',
            'seed_query': f'What do the scholars say about {pretty}?',
            'expected_source_types': ['section_panel'],
        },
        {
            'label': 'Related people and events',
            'seed_query': f'Who and what is connected to {pretty}?',
            'expected_source_types': ['cross_ref_thread_note', 'journey_stop'],
        },
    ]


def debate_chips(topic_id: str, title: str) -> list[dict[str, Any]]:
    pretty = title or _prettify(topic_id)
    return [
        {
            'label': 'Different views on this',
            'seed_query': f'Summarize the main positions on {pretty}.',
            'expected_source_types': ['debate_topic'],
        },
        {
            'label': 'Strongest arguments for each side',
            'seed_query': f'What are the strongest arguments for each view of {pretty}?',
            'expected_source_types': ['debate_topic'],
        },
        {
            'label': 'Where does this show up in scripture?',
            'seed_query': f'Which passages most bear on {pretty}?',
            'expected_source_types': ['debate_topic', 'section_panel'],
        },
    ]


# ── Iterators over meta files ────────────────────────────────────────

def iter_people() -> Iterator[tuple[str, str]]:
    path = META / 'people.json'
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding='utf-8'))
    for p in data.get('people', []) if isinstance(data, dict) else data:
        pid = p.get('id')
        if pid:
            yield pid, p.get('name', pid)


def iter_places() -> Iterator[tuple[str, str]]:
    path = META / 'places.json'
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding='utf-8'))
    for p in data if isinstance(data, list) else []:
        pid = p.get('id')
        if pid:
            yield pid, p.get('ancient_name') or p.get('modern_name') or pid


def iter_debate_topics() -> Iterator[tuple[str, str]]:
    path = META / 'debate-topics.json'
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding='utf-8'))
    for t in data if isinstance(data, list) else []:
        tid = t.get('id')
        if tid:
            yield tid, t.get('title', tid)


def all_entity_rows() -> list[dict[str, Any]]:
    """Produce `precached_prompts` rows for every entity."""
    rows: list[dict[str, Any]] = []
    for pid, name in iter_people():
        rows.append({
            'entity_type': 'person',
            'entity_id': pid,
            'profile_variant': 'default',
            'chips': person_chips(pid, name),
        })
    for pid, name in iter_places():
        rows.append({
            'entity_type': 'place',
            'entity_id': pid,
            'profile_variant': 'default',
            'chips': place_chips(pid, name),
        })
    for tid, title in iter_debate_topics():
        rows.append({
            'entity_type': 'debate_topic',
            'entity_id': tid,
            'profile_variant': 'default',
            'chips': debate_chips(tid, title),
        })
    return rows
