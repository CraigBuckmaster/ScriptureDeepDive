"""
build_prompts_variants.py — Profile variant seeds for the Amicus chip pool.

Each variant biases the LLM prompt toward scholars + themes a user of that
profile tends to engage with. Matches `PROFILE_VARIANTS` referenced in
#1461 and consumed by the runtime chip selector (future #1474).
"""
from __future__ import annotations

from typing import TypedDict


class ProfileVariant(TypedDict):
    id: str
    label: str
    tradition_bias: list[str]
    scholar_bias: list[str]
    genre_bias: list[str]
    seed_instruction: str


PROFILE_VARIANTS: list[ProfileVariant] = [
    {
        'id': 'generic_balanced',
        'label': 'Generic / balanced (default fallback)',
        'tradition_bias': [],
        'scholar_bias': [],
        'genre_bias': [],
        'seed_instruction': (
            'Produce chips suitable for a broadly curious reader with no single '
            'tradition emphasized. Mix exegesis, history, and cross-references.'
        ),
    },
    {
        'id': 'reformed_narrative',
        'label': 'Reformed leaning, OT narrative',
        'tradition_bias': ['Reformed', 'Conservative Evangelical'],
        'scholar_bias': ['calvin', 'wright', 'macarthur'],
        'genre_bias': ['narrative', 'law'],
        'seed_instruction': (
            'Prefer chips that surface covenant theology, Christocentric '
            'readings, and Reformed scholarship (Calvin, Wright).'
        ),
    },
    {
        'id': 'reformed_prophets',
        'label': 'Reformed leaning, prophets',
        'tradition_bias': ['Reformed', 'Conservative Evangelical'],
        'scholar_bias': ['calvin', 'wright', 'oswalt'],
        'genre_bias': ['prophecy', 'apocalyptic'],
        'seed_instruction': (
            'Prefer chips about prophetic structure, messianic typology, and '
            'Reformed exegesis of Israel vs. Church.'
        ),
    },
    {
        'id': 'jewish_pentateuch',
        'label': 'Jewish leaning, Torah',
        'tradition_bias': ['Jewish', 'Conservative Jewish'],
        'scholar_bias': ['sarna', 'alter', 'milgrom'],
        'genre_bias': ['law', 'narrative'],
        'seed_instruction': (
            'Prefer chips that foreground Hebrew literary artistry, JPS-style '
            'commentary, and Ancient Near Eastern context.'
        ),
    },
    {
        'id': 'jewish_prophets',
        'label': 'Jewish leaning, prophets',
        'tradition_bias': ['Jewish', 'Conservative Jewish'],
        'scholar_bias': ['alter', 'sarna'],
        'genre_bias': ['prophecy'],
        'seed_instruction': (
            'Prefer chips about rhetorical structure in Hebrew prophecy, '
            'literary echoes within the Tanakh, and prophetic genre.'
        ),
    },
    {
        'id': 'catholic_gospels',
        'label': 'Catholic tradition, NT gospels',
        'tradition_bias': ['Catholic', 'Patristic'],
        'scholar_bias': ['catena', 'keener'],
        'genre_bias': ['gospel'],
        'seed_instruction': (
            'Prefer chips about patristic readings, sacramental theology, and '
            'catholic tradition on the Gospels.'
        ),
    },
]


def variant_by_id(variant_id: str) -> ProfileVariant | None:
    for v in PROFILE_VARIANTS:
        if v['id'] == variant_id:
            return v
    return None


def variant_ids() -> list[str]:
    return [v['id'] for v in PROFILE_VARIANTS]
