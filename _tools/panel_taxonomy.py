#!/usr/bin/env python3
"""
panel_taxonomy.py — Shared panel taxonomy for quality + coverage tooling.

This module is imported by both `_tools/quality_scorer.py` (existing) and
`_tools/coverage_auditor.py` (upcoming, see epic #1625). It holds the single
source of truth for panel type classification, density thresholds, and the
text/density extraction helpers used across both tools.

Deliberate separation from `_tools/accuracy_config.py`: that module serves the
accuracy auditor's claim-extraction logic and defines its own (overlapping
but distinct) panel taxonomy — for example, `accuracy_config.CORE_SECTION_PANELS`
includes scholar keys like `"mac"` / `"net"` which this taxonomy excludes.
Do not attempt to consolidate the two.

Symbols moved verbatim from quality_scorer.py:
    CORE_SECTION_PANELS, REQUIRED_SECTION_PANELS, CHAPTER_PANEL_TYPES
    (exported from quality_scorer as KNOWN_CHAPTER_PANELS for backwards compat),
    DENSITY_TIERS, PANEL_THRESHOLD_MULTIPLIERS, PLACEHOLDER_PATTERNS,
    SOURCE_PATTERN, extract_panel_text(), get_density_score(),
    load_scholar_keys() (extracted from QualityEvaluator._load_scholar_keys).

Added for the upcoming coverage auditor (#1628):
    LINGUISTIC_PANELS, HISTORICAL_PANELS, CONNECTIVE_PANELS,
    GENRE_EXPECTED_PANELS, TEMPLATE_PATTERNS (populated by A3 curation),
    categorize_panel().
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


# ─── Panel type sets (quality_scorer origin) ────────────────────────

# Core (non-scholar) section panel types used by the quality scorer.
CORE_SECTION_PANELS = {"heb", "cross", "hist", "tl", "places", "poi", "ctx"}

# Minimum expected section panels (every section ideally has these).
REQUIRED_SECTION_PANELS = {"heb", "cross"}

# Known chapter panel types. Renamed from the legacy `KNOWN_CHAPTER_PANELS`
# to `CHAPTER_PANEL_TYPES` for the coverage auditor; quality_scorer.py
# re-exports the old name for backwards compatibility.
CHAPTER_PANEL_TYPES = {
    "lit", "themes", "ppl", "trans", "src", "rec",
    "hebtext", "thread", "tx", "debate", "discourse",
}


# ─── Density thresholds ─────────────────────────────────────────────

# Maps content length ranges to (rating_name, score_out_of_10).
DENSITY_TIERS = [
    (0,       "empty",     0),
    (100,     "stub",      2),
    (250,     "thin",      5),
    (500,     "adequate",  7),
    (1000,    "good",      9),
    (999999,  "rich",     10),
]

# Per-panel-type threshold multipliers — lower = more lenient for shorter panels.
PANEL_THRESHOLD_MULTIPLIERS = {
    "heb": 0.5,      # Hebrew panels are naturally shorter (word studies)
    "cross": 0.5,    # Cross-ref panels are citations, not commentary
}


# ─── Placeholder / source patterns ──────────────────────────────────

# Generic placeholder / template artifact patterns.
PLACEHOLDER_PATTERNS = [
    re.compile(r"\bTODO\b", re.IGNORECASE),
    re.compile(r"\bplaceholder\b", re.IGNORECASE),
    re.compile(r"\bLorem\b"),
    re.compile(r"\binsert here\b", re.IGNORECASE),
    re.compile(r"\.{4,}"),  # four or more dots
    re.compile(r"^This passage is significant because\b"),
    re.compile(r"^This section describes\b"),
    re.compile(r"\[fill in\]", re.IGNORECASE),
]

# Source field format: "Author Name, Work Title — Paraphrase Type".
SOURCE_PATTERN = re.compile(r"^.+[,\s].+\s*[—–-]\s*.+$")


# ─── Coverage auditor additions (L1/L2/L3 classification) ──────────

# Section-panel category assignment used by coverage_auditor.py.
# Commentary category is derived dynamically via load_scholar_keys().
LINGUISTIC_PANELS = {"heb", "hebtext"}
HISTORICAL_PANELS = {"hist", "ctx"}
CONNECTIVE_PANELS = {"cross", "thread", "debate", "themes", "tl", "poi", "places"}

# Evidence-based per-genre expected chapter panels (≥60% present-rate
# in current content). Used by L3 chapter-panel completeness.
GENRE_EXPECTED_PANELS = {
    "theological_narrative": {"ppl", "trans", "src", "rec", "lit", "hebtext", "thread", "tx", "themes"},
    "law":                   {"ppl", "src", "rec", "lit", "hebtext", "thread", "tx", "debate", "themes"},
    "history":               {"ppl", "trans", "lit", "thread", "themes"},
    "wisdom":                {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "poetry":                {"ppl", "trans", "rec", "lit", "hebtext", "themes"},
    "love_poetry":           {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "lament":                {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "prophecy":              {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "apocalyptic":           {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes"},
    "gospel":                {"ppl", "trans", "src", "rec", "lit", "hebtext", "tx", "debate", "themes"},
    "epistle":               {"ppl", "trans", "rec", "lit", "hebtext", "thread", "themes", "discourse"},
}

# Type-specific template patterns. Each value is a list of tuples; every
# substring in a tuple must appear in the serialized panel JSON for a match.
# Populated by the A3 curation pass (#1629); empty at refactor time.
TEMPLATE_PATTERNS: dict[str, list[tuple[str, ...]]] = {}


# ─── Text extraction + density scoring ──────────────────────────────

def extract_panel_text(panel_key, panel_data):
    """Extract meaningful text content from any panel type.

    Returns the combined text as a single string for length measurement
    and content analysis. Handles all known panel structures.
    """
    if panel_data is None:
        return ""

    # Hebrew word studies — list of dicts
    if panel_key == "heb" and isinstance(panel_data, list):
        parts = []
        for entry in panel_data:
            if isinstance(entry, dict):
                parts.append(entry.get("paragraph", ""))
                parts.append(entry.get("gloss", ""))
        return " ".join(p for p in parts if p)

    # Cross-references — dict with refs list + echoes list
    if panel_key == "cross" and isinstance(panel_data, dict):
        parts = []
        for r in panel_data.get("refs", []):
            if isinstance(r, dict):
                parts.append(r.get("note", ""))
        for e in panel_data.get("echoes", []):
            if isinstance(e, dict):
                parts.append(e.get("source_context", ""))
                parts.append(e.get("target_context", ""))
        return " ".join(p for p in parts if p)

    # Historical context — dict with historical + context + ane + audience fields
    if panel_key == "hist" and isinstance(panel_data, dict):
        parts = [
            panel_data.get("historical", ""),
            panel_data.get("context", ""),
            panel_data.get("audience", ""),
        ]
        ane = panel_data.get("ane", [])
        if isinstance(ane, list):
            parts.extend(str(item) for item in ane)
        elif isinstance(ane, str):
            parts.append(ane)
        return " ".join(p for p in parts if p)

    # Timeline — list of dicts with text
    if panel_key == "tl" and isinstance(panel_data, list):
        return " ".join(
            entry.get("text", "") for entry in panel_data if isinstance(entry, dict)
        )

    # Places — dict, possibly with _raw_html
    if panel_key == "places" and isinstance(panel_data, dict):
        raw = panel_data.get("_raw_html", "")
        # Strip HTML for length measurement
        return re.sub(r"<[^>]+>", " ", raw).strip() if raw else ""

    # Points of interest — list of dicts with text
    if panel_key == "poi" and isinstance(panel_data, list):
        return " ".join(
            entry.get("text", "") for entry in panel_data if isinstance(entry, dict)
        )

    # Scholar panels — dict with source + notes list
    if isinstance(panel_data, dict) and "notes" in panel_data:
        notes = panel_data.get("notes", [])
        if isinstance(notes, list):
            return " ".join(
                n.get("note", "") for n in notes if isinstance(n, dict)
            )
        return ""

    # Fallback: stringify
    if isinstance(panel_data, str):
        return panel_data
    if isinstance(panel_data, dict):
        return " ".join(str(v) for v in panel_data.values())
    if isinstance(panel_data, list):
        return " ".join(str(item) for item in panel_data)

    return str(panel_data)


def get_density_score(char_count, panel_key=None):
    """Score a panel's content density based on character count.

    Returns (score_out_of_10, tier_name).
    """
    multiplier = PANEL_THRESHOLD_MULTIPLIERS.get(panel_key, 1.0)
    adjusted = char_count / multiplier if multiplier > 0 else char_count

    prev_threshold = 0
    for threshold, name, score in DENSITY_TIERS:
        if adjusted < threshold:
            return score, name
        prev_threshold = threshold

    return 10, "rich"


# ─── Scholar key discovery ──────────────────────────────────────────

def load_scholar_keys(content_dir) -> set[str]:
    """Build the set of valid scholar panel keys from all available sources.

    Reads `{content_dir}/meta/scholars.json` (both `id` and `panel_key` fields)
    and, if importable, the `SCHOLAR_REGISTRY` from `_tools/config.py`.
    Empty strings are discarded. Used by QualityEvaluator and coverage_auditor.
    """
    content_dir = Path(content_dir)
    keys: set[str] = set()

    meta_path = content_dir / "meta" / "scholars.json"
    if meta_path.exists():
        scholars = json.loads(meta_path.read_text(encoding='utf-8'))
        for s in scholars:
            keys.add(s.get("panel_key", ""))
            keys.add(s.get("id", ""))

    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from config import SCHOLAR_REGISTRY
        for entry in SCHOLAR_REGISTRY:
            if isinstance(entry, (tuple, list)) and len(entry) >= 4:
                keys.add(entry[3])  # panel_key
                keys.add(entry[0])  # config_id
    except (ImportError, Exception):
        pass

    keys.discard("")
    return keys


# ─── Category classification ────────────────────────────────────────

def categorize_panel(panel_key: str, scholar_keys: set[str]) -> str:
    """Return 'linguistic' | 'historical' | 'commentary' | 'connective' | 'unknown'.

    Commentary check comes BEFORE others because scholar keys like 'mac'
    (MacArthur) look like historical codes but are actually scholars.
    """
    if panel_key in scholar_keys:      return "commentary"
    if panel_key in LINGUISTIC_PANELS: return "linguistic"
    if panel_key in HISTORICAL_PANELS: return "historical"
    if panel_key in CONNECTIVE_PANELS: return "connective"
    return "unknown"
