#!/usr/bin/env python3
"""
quality_scorer.py — Content quality scoring engine for Companion Study.

Scores every chapter 0–100 across four categories (25 pts each):
  1. DENSITY     — Panel content richness (char counts, stub detection)
  2. VERSE_COV   — Verse coverage completeness and validity
  3. COMPLETENESS — Structural element presence (core panels, scholars, etc.)
  4. RELEVANCE   — Content relevance/accuracy (heuristic or LLM-based)

Usage (called from schema_validator.py --quality):
    from quality_scorer import QualityEvaluator
    evaluator = QualityEvaluator(content_dir, verse_dir)
    report = evaluator.run(book="genesis")
    report.print_terminal()

Direct usage:
    python3 _tools/quality_scorer.py [--book genesis] [--chapter gen1] [--deep] [--worst 20] [--json]
"""

import json
import hashlib
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from difflib import SequenceMatcher
from pathlib import Path
from collections import Counter


# ─── Configuration ──────────────────────────────────────────────────

# Core (non-scholar) section panel types
CORE_SECTION_PANELS = {"heb", "cross", "hist", "tl", "places", "poi", "ctx"}

# Minimum expected section panels (every section ideally has these)
REQUIRED_SECTION_PANELS = {"heb", "cross"}

# Known chapter panel types
KNOWN_CHAPTER_PANELS = {
    "lit", "themes", "ppl", "trans", "src", "rec",
    "hebtext", "thread", "tx", "debate", "discourse",
}

# ── Density thresholds (character counts) ──
# Maps content length ranges to (rating_name, score_out_of_10)
DENSITY_TIERS = [
    (0,       "empty",     0),
    (100,     "stub",      2),
    (250,     "thin",      5),
    (500,     "adequate",  7),
    (1000,    "good",      9),
    (999999,  "rich",     10),
]

# Per-panel-type threshold multipliers (v1: uniform, ready for per-type tuning)
PANEL_THRESHOLD_MULTIPLIERS = {
    # "heb": 0.5,    # Hebrew panels are naturally shorter
    # "cross": 0.7,  # Cross-ref panels are note-based
}

# Placeholder / template artifact patterns
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

# Source field format: "Author Name, Work Title — Paraphrase Type"
SOURCE_PATTERN = re.compile(r"^.+[,\s].+\s*[—–-]\s*.+$")


# ─── Data Classes ───────────────────────────────────────────────────

@dataclass
class Finding:
    """A single quality observation about a chapter."""
    category: str       # density | verse_coverage | completeness | relevance
    severity: str       # info | warning | critical
    message: str
    section_num: int = None
    panel_type: str = None


@dataclass
class CategoryScore:
    """Score for one quality category (0–25)."""
    name: str
    score: float = 0.0
    max_score: float = 25.0
    findings: list = field(default_factory=list)

    def add_finding(self, severity, message, section_num=None, panel_type=None):
        self.findings.append(Finding(
            category=self.name, severity=severity, message=message,
            section_num=section_num, panel_type=panel_type,
        ))


@dataclass
class ChapterScore:
    """Complete quality score for a single chapter."""
    chapter_id: str
    book_dir: str
    chapter_num: int
    density: CategoryScore = field(default_factory=lambda: CategoryScore("density"))
    verse_coverage: CategoryScore = field(default_factory=lambda: CategoryScore("verse_coverage"))
    completeness: CategoryScore = field(default_factory=lambda: CategoryScore("completeness"))
    relevance: CategoryScore = field(default_factory=lambda: CategoryScore("relevance"))

    @property
    def total_score(self) -> float:
        return self.density.score + self.verse_coverage.score + \
               self.completeness.score + self.relevance.score

    @property
    def grade(self) -> str:
        s = self.total_score
        if s >= 90: return "A"
        if s >= 80: return "B"
        if s >= 70: return "C"
        if s >= 60: return "D"
        return "F"

    @property
    def categories(self):
        return {
            "density": self.density,
            "verse_coverage": self.verse_coverage,
            "completeness": self.completeness,
            "relevance": self.relevance,
        }

    def all_findings(self, min_severity=None):
        severity_order = {"info": 0, "warning": 1, "critical": 2}
        min_level = severity_order.get(min_severity, 0) if min_severity else 0
        findings = []
        for cat in self.categories.values():
            for f in cat.findings:
                if severity_order.get(f.severity, 0) >= min_level:
                    findings.append(f)
        return findings


# ─── Text Extraction ────────────────────────────────────────────────

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

    # Cross-references — dict with refs list
    if panel_key == "cross" and isinstance(panel_data, dict):
        refs = panel_data.get("refs", [])
        return " ".join(r.get("note", "") for r in refs if isinstance(r, dict))

    # Historical context — dict with historical + context fields
    if panel_key == "hist" and isinstance(panel_data, dict):
        parts = [panel_data.get("historical", ""), panel_data.get("context", "")]
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


# ─── Scoring Functions ──────────────────────────────────────────────

def score_density(chapter_data, sections):
    """Category 1: Content Density (25 pts).

    Scores every panel across all sections for substantive content.
    """
    cat = CategoryScore("density")
    panel_scores = []

    for sec in sections:
        sec_num = sec.get("section_num", 0)
        panels = sec.get("panels", {})

        if not panels:
            cat.add_finding("critical", "Section has no panels", section_num=sec_num)
            panel_scores.append(0)
            continue

        for panel_key, panel_data in panels.items():
            text = extract_panel_text(panel_key, panel_data)
            char_count = len(text.strip())
            score, tier = get_density_score(char_count, panel_key)
            panel_scores.append(score)

            if tier == "empty":
                cat.add_finding("critical", f"Empty {panel_key} panel",
                                section_num=sec_num, panel_type=panel_key)
            elif tier == "stub":
                cat.add_finding("warning", f"Stub {panel_key} panel ({char_count} chars)",
                                section_num=sec_num, panel_type=panel_key)
            elif tier == "thin":
                cat.add_finding("info", f"Thin {panel_key} panel ({char_count} chars)",
                                section_num=sec_num, panel_type=panel_key)

    # Chapter panels contribute too (lower weight: count once each)
    ch_panels = chapter_data.get("chapter_panels", {})
    for panel_key, panel_data in ch_panels.items():
        text = extract_panel_text(panel_key, panel_data)
        char_count = len(str(text).strip()) if text else 0
        # Chapter panels get a simpler check — just present and non-trivial
        if char_count > 50:
            panel_scores.append(8)
        elif char_count > 0:
            panel_scores.append(4)
        else:
            panel_scores.append(0)

    if panel_scores:
        avg = sum(panel_scores) / len(panel_scores)
        cat.score = min(25.0, (avg / 10.0) * 25.0)
    else:
        cat.score = 0.0
        cat.add_finding("critical", "No panels found in chapter")

    return cat


def score_verse_coverage(chapter_data, sections, verse_data):
    """Category 2: Verse Coverage (25 pts).

    Checks that sections cover all verses in the chapter without gaps.
    """
    cat = CategoryScore("verse_coverage")
    book_dir = chapter_data.get("book_dir", "")
    chapter_num = chapter_data.get("chapter_num", 0)

    # Get max verse for this chapter from verse data
    chapter_verses = [
        v for v in verse_data if v.get("ch") == chapter_num
    ]

    if not chapter_verses:
        cat.score = 25.0  # No verse data available — can't deduct, pass by default
        cat.add_finding("info", "No verse data available for this chapter")
        return cat

    max_verse = max(v.get("v", 0) for v in chapter_verses)
    all_expected = set(range(1, max_verse + 1))

    # Collect covered verses from sections
    covered = set()
    overlaps = []
    invalid_refs = []

    for sec in sections:
        sec_num = sec.get("section_num", 0)
        vs = sec.get("verse_start", 0)
        ve = sec.get("verse_end", 0)

        if vs <= 0 or ve <= 0:
            invalid_refs.append(f"S{sec_num}: invalid range {vs}-{ve}")
            continue

        if vs > max_verse or ve > max_verse:
            invalid_refs.append(f"S{sec_num}: range {vs}-{ve} exceeds chapter max ({max_verse})")

        sec_range = set(range(vs, min(ve, max_verse) + 1))

        # Check for overlap with already-covered verses
        overlap = covered & sec_range
        if overlap:
            overlaps.append(f"S{sec_num}: verses {sorted(overlap)} overlap with prior section")

        covered |= sec_range

    # Sub-score 1: Full coverage (12 pts)
    missing = all_expected - covered
    if missing:
        coverage_pct = len(covered) / len(all_expected)
        cat.score += 12.0 * coverage_pct
        cat.add_finding("warning",
                        f"Missing verses: {_format_verse_ranges(sorted(missing))} "
                        f"({len(missing)}/{len(all_expected)} uncovered)")
    else:
        cat.score += 12.0

    # Sub-score 2: No overlapping ranges (5 pts)
    if overlaps:
        cat.score += 0.0
        for o in overlaps:
            cat.add_finding("warning", o)
    else:
        cat.score += 5.0

    # Sub-score 3: Valid verse refs (5 pts)
    if invalid_refs:
        deduction = min(5.0, len(invalid_refs) * 2.5)
        cat.score += 5.0 - deduction
        for ir in invalid_refs:
            cat.add_finding("warning", ir)
    else:
        cat.score += 5.0

    # Sub-score 4: Section count sanity (3 pts)
    num_sections = len(sections)
    if num_sections > 0 and max_verse > 0:
        verses_per_section = max_verse / num_sections
        if verses_per_section > 20:
            cat.score += 0.0
            cat.add_finding("warning",
                            f"Only {num_sections} section(s) for {max_verse} verses "
                            f"({verses_per_section:.0f} verses/section)")
        elif verses_per_section > 15:
            cat.score += 1.5
            cat.add_finding("info",
                            f"{num_sections} sections for {max_verse} verses "
                            f"— consider splitting")
        else:
            cat.score += 3.0
    else:
        cat.score += 3.0

    return cat


def score_completeness(chapter_data, sections, scholar_panel_keys):
    """Category 3: Completeness (25 pts).

    Checks presence of expected structural elements.
    """
    cat = CategoryScore("completeness")
    total_sections = len(sections)

    # Sub-score 1: Core section panels (10 pts)
    if total_sections > 0:
        missing_count = 0
        for sec in sections:
            sec_num = sec.get("section_num", 0)
            panels = set(sec.get("panels", {}).keys())
            for req in REQUIRED_SECTION_PANELS:
                if req not in panels:
                    missing_count += 1
                    cat.add_finding("warning",
                                    f"Missing required '{req}' panel",
                                    section_num=sec_num)
        max_possible = total_sections * len(REQUIRED_SECTION_PANELS)
        if max_possible > 0:
            pct = (max_possible - missing_count) / max_possible
            cat.score += 10.0 * pct
        else:
            cat.score += 10.0
    else:
        cat.score += 0.0

    # Sub-score 2: Scholar panels (5 pts)
    sections_with_scholars = 0
    for sec in sections:
        panels = set(sec.get("panels", {}).keys())
        scholar_panels = panels - CORE_SECTION_PANELS
        if scholar_panels:
            sections_with_scholars += 1
        else:
            cat.add_finding("warning", "No scholar panels",
                            section_num=sec.get("section_num", 0))

    if total_sections > 0:
        cat.score += 5.0 * (sections_with_scholars / total_sections)
    else:
        cat.score += 0.0

    # Sub-score 3: Chapter panels (5 pts)
    ch_panels = set(chapter_data.get("chapter_panels", {}).keys())
    expected_ch_panels = {"ppl", "trans", "src", "rec", "lit", "tx", "themes", "thread", "debate"}
    present = ch_panels & expected_ch_panels
    # Score based on how many are present (2+ is passing)
    ch_count = len(present)
    if ch_count >= 6:
        cat.score += 5.0
    elif ch_count >= 4:
        cat.score += 4.0
    elif ch_count >= 2:
        cat.score += 3.0
    elif ch_count >= 1:
        cat.score += 1.5
    else:
        cat.score += 0.0
        cat.add_finding("warning", "No chapter-level panels present")

    # Sub-score 4: VHL groups (3 pts)
    vhl = chapter_data.get("vhl_groups", [])
    if isinstance(vhl, list) and len(vhl) > 0:
        cat.score += 3.0
    else:
        cat.score += 0.0
        cat.add_finding("info", "No VHL groups defined")

    # Sub-score 5: Timeline / hist panel placement (2 pts)
    has_timeline = bool(chapter_data.get("timeline_link"))
    if has_timeline:
        cat.score += 1.0
    else:
        cat.add_finding("info", "No timeline_link")

    # hist panel should be on first section only
    first_section_panels = set(sections[0].get("panels", {}).keys()) if sections else set()
    if "hist" in first_section_panels:
        cat.score += 1.0
    else:
        cat.add_finding("info", "No hist panel on first section")

    return cat


def score_relevance_heuristic(chapter_data, sections, scholar_panel_keys):
    """Category 4: Relevance & Accuracy — heuristic mode (25 pts).

    Checks source field format, duplicate content, keyword relevance,
    placeholder text, and scholar ID validity.
    """
    cat = CategoryScore("relevance")

    all_panels_by_section = []
    for sec in sections:
        sec_num = sec.get("section_num", 0)
        panels = sec.get("panels", {})
        all_panels_by_section.append((sec_num, panels))

    # Sub-score 1: Scholar ID validity (5 pts)
    invalid_ids = []
    for sec_num, panels in all_panels_by_section:
        for pk in panels:
            if pk not in CORE_SECTION_PANELS and pk not in scholar_panel_keys:
                invalid_ids.append((sec_num, pk))
                cat.add_finding("warning", f"Unknown panel key '{pk}'",
                                section_num=sec_num, panel_type=pk)
    if invalid_ids:
        deduction = min(5.0, len(invalid_ids) * 1.0)
        cat.score += 5.0 - deduction
    else:
        cat.score += 5.0

    # Sub-score 2: Source field format (5 pts)
    source_total = 0
    source_valid = 0
    for sec_num, panels in all_panels_by_section:
        for pk, pv in panels.items():
            if isinstance(pv, dict) and "source" in pv:
                source_total += 1
                src = pv["source"]
                if SOURCE_PATTERN.match(src):
                    source_valid += 1
                else:
                    cat.add_finding("info",
                                    f"Non-standard source format: '{src[:60]}'",
                                    section_num=sec_num, panel_type=pk)
    if source_total > 0:
        cat.score += 5.0 * (source_valid / source_total)
    else:
        cat.score += 5.0  # No source fields to check — no deduction

    # Sub-score 3: No duplicate content (5 pts)
    duplicate_found = 0
    for sec_num, panels in all_panels_by_section:
        texts = {}
        for pk, pv in panels.items():
            text = extract_panel_text(pk, pv).strip()
            if len(text) < 50:
                continue  # Too short to meaningfully compare
            texts[pk] = text

        keys = list(texts.keys())
        for i in range(len(keys)):
            for j in range(i + 1, len(keys)):
                ratio = SequenceMatcher(
                    None, texts[keys[i]][:500], texts[keys[j]][:500]
                ).ratio()
                if ratio > 0.70:
                    duplicate_found += 1
                    cat.add_finding("warning",
                                    f"High similarity ({ratio:.0%}) between "
                                    f"'{keys[i]}' and '{keys[j]}'",
                                    section_num=sec_num)
    if duplicate_found:
        deduction = min(5.0, duplicate_found * 2.0)
        cat.score += 5.0 - deduction
    else:
        cat.score += 5.0

    # Sub-score 4: Keyword relevance (5 pts)
    # Check if panel text references words from the section header
    low_relevance = 0
    for sec_num, panels in all_panels_by_section:
        sec = next((s for s in sections if s.get("section_num") == sec_num), None)
        if not sec:
            continue
        header = sec.get("header", "")
        # Extract significant words (3+ chars, not common words)
        stop_words = {
            "the", "and", "for", "with", "from", "that", "this", "was",
            "are", "will", "has", "his", "her", "its", "who", "all",
            "but", "not", "they", "you", "him", "she", "our",
        }
        header_words = {
            w.lower() for w in re.findall(r"[A-Za-z']+", header)
            if len(w) >= 3 and w.lower() not in stop_words
        }

        if len(header_words) < 2:
            continue  # Header too generic to score meaningfully

        # Combine all panel text for this section
        combined = " ".join(
            extract_panel_text(pk, pv) for pk, pv in panels.items()
        ).lower()

        matches = sum(1 for w in header_words if w in combined)
        if matches < 2 and len(header_words) >= 3:
            low_relevance += 1
            cat.add_finding("info",
                            f"Low keyword overlap with header '{header}'",
                            section_num=sec_num)

    total_sections = len(all_panels_by_section)
    if total_sections > 0 and low_relevance > 0:
        deduction = min(5.0, (low_relevance / total_sections) * 5.0)
        cat.score += 5.0 - deduction
    else:
        cat.score += 5.0

    # Sub-score 5: No placeholder text (5 pts)
    placeholder_count = 0
    for sec_num, panels in all_panels_by_section:
        for pk, pv in panels.items():
            text = extract_panel_text(pk, pv)
            for pattern in PLACEHOLDER_PATTERNS:
                if pattern.search(text):
                    placeholder_count += 1
                    cat.add_finding("critical",
                                    f"Placeholder text detected: {pattern.pattern}",
                                    section_num=sec_num, panel_type=pk)
                    break  # One finding per panel is enough

    if placeholder_count:
        deduction = min(5.0, placeholder_count * 2.5)
        cat.score += 5.0 - deduction
    else:
        cat.score += 5.0

    return cat


def score_relevance_deep(chapter_data, sections, verse_data, cache, api_key=None):
    """Category 4: Relevance & Accuracy — LLM deep mode (25 pts).

    Sends section content to Claude for semantic evaluation.
    Results are cached by content hash to avoid redundant API calls.
    """
    cat = CategoryScore("relevance")

    # Check for API key
    if not api_key:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        cat.score = 12.5  # Neutral score — can't evaluate
        cat.add_finding("warning", "No ANTHROPIC_API_KEY set — deep mode unavailable")
        return cat

    try:
        import anthropic
    except ImportError:
        cat.score = 12.5
        cat.add_finding("warning", "anthropic package not installed — deep mode unavailable")
        return cat

    client = anthropic.Anthropic(api_key=api_key)
    book_dir = chapter_data.get("book_dir", "")
    chapter_num = chapter_data.get("chapter_num", 0)
    chapter_id = chapter_data.get("chapter_id", f"{book_dir}{chapter_num}")

    # Build content hash for cache key
    content_str = json.dumps(sections, sort_keys=True)
    content_hash = hashlib.sha256(content_str.encode()).hexdigest()[:16]
    cache_key = f"{chapter_id}:{content_hash}"

    # Check cache
    if cache_key in cache:
        cached = cache[cache_key]
        cat.score = cached.get("score", 12.5)
        for f in cached.get("findings", []):
            cat.add_finding(f["severity"], f["message"],
                            f.get("section_num"), f.get("panel_type"))
        return cat

    # Get verse text for context
    chapter_verses = {
        v["v"]: v["text"]
        for v in verse_data if v.get("ch") == chapter_num
    }

    # Batch sections (up to 3 per API call)
    all_scores = []
    all_flags = []

    for batch_start in range(0, len(sections), 3):
        batch = sections[batch_start:batch_start + 3]

        prompt_parts = []
        for sec in batch:
            sec_num = sec.get("section_num", 0)
            vs, ve = sec.get("verse_start", 0), sec.get("verse_end", 0)
            header = sec.get("header", "")

            # Get verse text
            verse_text = " ".join(
                f"({v}) {chapter_verses.get(v, '[missing]')}"
                for v in range(vs, ve + 1) if v in chapter_verses
            )

            # Get panel content
            panel_desc = []
            for pk, pv in sec.get("panels", {}).items():
                text = extract_panel_text(pk, pv)
                if text:
                    panel_desc.append(f"- {pk}: {text[:300]}")

            prompt_parts.append(
                f"Section {sec_num}: \"{header}\" (verses {vs}-{ve})\n"
                f"Verse text: {verse_text[:500]}\n"
                f"Panels:\n" + "\n".join(panel_desc[:8])
            )

        prompt = (
            f"You are evaluating Bible study commentary for quality.\n"
            f"Book: {book_dir}, Chapter: {chapter_num}\n\n"
            + "\n\n---\n\n".join(prompt_parts)
            + "\n\nScore each section on three dimensions (0-10):\n"
            "1. RELEVANCE: Does each panel directly relate to these verses?\n"
            "2. ACCURACY: Are theological claims and attributions credible?\n"
            "3. DEPTH: Does commentary add genuine insight?\n\n"
            "Respond as JSON only, no markdown:\n"
            '{"sections": [{"section_num": N, "relevance": N, "accuracy": N, '
            '"depth": N, "flags": ["..."]}]}'
        )

        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}],
            )

            text = response.content[0].text.strip()
            # Strip markdown fences if present
            text = re.sub(r"^```json\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            result = json.loads(text)

            for sec_result in result.get("sections", []):
                rel = sec_result.get("relevance", 5)
                acc = sec_result.get("accuracy", 5)
                dep = sec_result.get("depth", 5)
                avg = (rel + acc + dep) / 3.0
                all_scores.append(avg)

                for flag in sec_result.get("flags", []):
                    if flag and flag.strip():
                        all_flags.append(flag)
                        cat.add_finding("info", flag,
                                        section_num=sec_result.get("section_num"))

            time.sleep(0.5)  # Rate limiting

        except Exception as e:
            cat.add_finding("warning", f"LLM evaluation failed: {str(e)[:80]}")
            all_scores.append(5.0)  # Neutral fallback

    # Calculate final score
    if all_scores:
        avg_score = sum(all_scores) / len(all_scores)
        cat.score = (avg_score / 10.0) * 25.0
    else:
        cat.score = 12.5  # Neutral

    # Cache result
    cache[cache_key] = {
        "score": cat.score,
        "findings": [
            {"severity": f.severity, "message": f.message,
             "section_num": f.section_num, "panel_type": f.panel_type}
            for f in cat.findings
        ],
    }

    return cat


# ─── Report ─────────────────────────────────────────────────────────

class QualityReport:
    """Aggregated quality report across all evaluated chapters."""

    def __init__(self):
        self.chapters: list[ChapterScore] = []
        self.deep_mode: bool = False

    @property
    def avg_score(self):
        if not self.chapters:
            return 0.0
        return sum(c.total_score for c in self.chapters) / len(self.chapters)

    @property
    def distribution(self):
        counts = Counter(c.grade for c in self.chapters)
        return {g: counts.get(g, 0) for g in ["A", "B", "C", "D", "F"]}

    def worst_n(self, n=10):
        return sorted(self.chapters, key=lambda c: c.total_score)[:n]

    def by_book(self):
        books = {}
        for ch in self.chapters:
            books.setdefault(ch.book_dir, []).append(ch)
        return {
            bk: sorted(chs, key=lambda c: c.chapter_num)
            for bk, chs in sorted(books.items())
        }

    def print_terminal(self, worst_n=10, verbose=False):
        """Print human-readable quality report to stdout."""
        total = len(self.chapters)
        if total == 0:
            print("No chapters evaluated.")
            return

        mode = "DEEP (LLM)" if self.deep_mode else "HEURISTIC"
        print(f"\n{'═' * 60}")
        print(f"  CONTENT QUALITY REPORT — {mode}")
        print(f"  {total} chapters evaluated | avg score: {self.avg_score:.1f}")
        print(f"{'═' * 60}")

        # Score distribution
        dist = self.distribution
        max_count = max(dist.values()) if dist else 1
        print(f"\n  SCORE DISTRIBUTION:")
        for grade, label, color_range in [
            ("A", "90-100", "█"), ("B", "80-89 ", "█"),
            ("C", "70-79 ", "█"), ("D", "60-69 ", "█"), ("F", "<60   ", "█"),
        ]:
            count = dist.get(grade, 0)
            bar_len = int((count / max_count) * 30) if max_count > 0 else 0
            bar = color_range * bar_len
            pct = (count / total * 100) if total > 0 else 0
            print(f"  {grade} ({label}): {bar:<30s} {count:>4d} ({pct:.0f}%)")

        # Per-book summary
        print(f"\n  {'─' * 56}")
        for book_dir, chapters in self.by_book().items():
            book_avg = sum(c.total_score for c in chapters) / len(chapters)
            print(f"\n  {book_dir.upper()} ({len(chapters)} ch)  avg: {book_avg:.1f}")

            for ch in chapters:
                score = ch.total_score
                bar_len = int(score / 100 * 20)
                bar = "█" * bar_len + "░" * (20 - bar_len)
                cats = (f"D:{ch.density.score:.0f} "
                        f"V:{ch.verse_coverage.score:.0f} "
                        f"C:{ch.completeness.score:.0f} "
                        f"R:{ch.relevance.score:.0f}")
                print(f"  {ch.chapter_id:<8s} {bar} {score:5.1f}  {cats}")

                # Show findings for low-scoring chapters or in verbose mode
                if verbose or score < 60:
                    for f in ch.all_findings("warning"):
                        sec = f"S{f.section_num}" if f.section_num else ""
                        ptype = f"[{f.panel_type}]" if f.panel_type else ""
                        sev = "⚠" if f.severity == "warning" else "✖"
                        print(f"           {sev} {sec} {ptype} {f.message}")

        # Worst chapters
        worst = self.worst_n(worst_n)
        if worst:
            print(f"\n  {'─' * 56}")
            print(f"  WORST {worst_n} CHAPTERS:")
            for i, ch in enumerate(worst, 1):
                findings = ch.all_findings("warning")
                summary = "; ".join(f.message for f in findings[:3])
                if len(findings) > 3:
                    summary += f" (+{len(findings) - 3} more)"
                print(f"  {i:>2}. {ch.chapter_id:<8s} {ch.total_score:5.1f}  {summary[:80]}")

        print(f"\n{'═' * 60}")

    def save_json(self, path):
        """Save report as JSON for programmatic consumption."""
        data = {
            "total_chapters": len(self.chapters),
            "avg_score": round(self.avg_score, 1),
            "deep_mode": self.deep_mode,
            "distribution": self.distribution,
            "books": [],
        }

        for book_dir, chapters in self.by_book().items():
            book_entry = {
                "book_dir": book_dir,
                "avg_score": round(
                    sum(c.total_score for c in chapters) / len(chapters), 1
                ),
                "chapters": [],
            }
            for ch in chapters:
                ch_entry = {
                    "chapter_id": ch.chapter_id,
                    "score": round(ch.total_score, 1),
                    "grade": ch.grade,
                    "categories": {},
                }
                for cat_name, cat_score in ch.categories.items():
                    ch_entry["categories"][cat_name] = {
                        "score": round(cat_score.score, 1),
                        "max": cat_score.max_score,
                        "findings": [
                            {
                                "severity": f.severity,
                                "message": f.message,
                                "section_num": f.section_num,
                                "panel_type": f.panel_type,
                            }
                            for f in cat_score.findings
                        ],
                    }
                book_entry["chapters"].append(ch_entry)

            data["books"].append(book_entry)

        # Worst 20
        data["worst_20"] = [
            {"chapter_id": ch.chapter_id, "score": round(ch.total_score, 1),
             "grade": ch.grade}
            for ch in self.worst_n(20)
        ]

        with open(path, "w") as f:
            json.dump(data, f, indent=2)

        print(f"\n  Report saved to {path}")


# ─── Evaluator ──────────────────────────────────────────────────────

class QualityEvaluator:
    """Main evaluator that orchestrates quality scoring across chapters."""

    def __init__(self, content_dir="content", verse_dir="content/verses",
                 deep=False, api_key=None):
        self.content_dir = Path(content_dir)
        self.verse_dir = Path(verse_dir)
        self.deep = deep
        self.api_key = api_key

        # Load scholar panel keys (from both meta and registry)
        self.scholar_panel_keys = self._load_scholar_keys()

        # Load verse data indexed by book
        self.verse_cache = {}

        # LLM result cache
        self.llm_cache = self._load_llm_cache()

    def _load_scholar_keys(self):
        """Build set of valid scholar panel keys from all available sources."""
        keys = set()

        # From scholars.json meta
        meta_path = self.content_dir / "meta" / "scholars.json"
        if meta_path.exists():
            scholars = json.loads(meta_path.read_text())
            for s in scholars:
                keys.add(s.get("panel_key", ""))
                keys.add(s.get("id", ""))

        # From config.py SCHOLAR_REGISTRY if available
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

    def _load_llm_cache(self):
        cache_path = Path(__file__).resolve().parent / ".quality_cache.json"
        if cache_path.exists():
            try:
                return json.loads(cache_path.read_text())
            except (json.JSONDecodeError, Exception):
                pass
        return {}

    def _save_llm_cache(self):
        cache_path = Path(__file__).resolve().parent / ".quality_cache.json"
        with open(cache_path, "w") as f:
            json.dump(self.llm_cache, f, indent=2)

    def _get_verse_data(self, book_dir):
        """Load and cache verse data for a book."""
        if book_dir in self.verse_cache:
            return self.verse_cache[book_dir]

        verse_path = self.verse_dir / "niv" / f"{book_dir}.json"
        if verse_path.exists():
            data = json.loads(verse_path.read_text())
            self.verse_cache[book_dir] = data
            return data

        self.verse_cache[book_dir] = []
        return []

    def evaluate_chapter(self, chapter_path):
        """Score a single chapter file."""
        try:
            data = json.loads(chapter_path.read_text())
        except (json.JSONDecodeError, Exception) as e:
            # Return a zero-score chapter
            ch_id = chapter_path.stem
            score = ChapterScore(
                chapter_id=ch_id,
                book_dir=chapter_path.parent.name,
                chapter_num=0,
            )
            score.density.add_finding("critical", f"Failed to load: {e}")
            return score

        if not isinstance(data, dict):
            ch_id = chapter_path.stem
            return ChapterScore(chapter_id=ch_id,
                                book_dir=chapter_path.parent.name,
                                chapter_num=0)

        book_dir = data.get("book_dir", chapter_path.parent.name)
        chapter_num = data.get("chapter_num", 0)
        chapter_id = data.get("chapter_id") or f"{book_dir}{chapter_num}"

        sections = [s for s in data.get("sections", []) if isinstance(s, dict)]
        verse_data = self._get_verse_data(book_dir)

        score = ChapterScore(
            chapter_id=chapter_id,
            book_dir=book_dir,
            chapter_num=chapter_num,
        )

        # Score each category
        score.density = score_density(data, sections)
        score.verse_coverage = score_verse_coverage(data, sections, verse_data)
        score.completeness = score_completeness(data, sections, self.scholar_panel_keys)

        if self.deep:
            score.relevance = score_relevance_deep(
                data, sections, verse_data, self.llm_cache, self.api_key
            )
        else:
            score.relevance = score_relevance_heuristic(
                data, sections, self.scholar_panel_keys
            )

        return score

    def run(self, book=None, chapter=None):
        """Run quality evaluation across specified scope.

        Args:
            book: Limit to a single book directory name
            chapter: Limit to a single chapter_id (e.g. "gen1")

        Returns:
            QualityReport with all scored chapters
        """
        report = QualityReport()
        report.deep_mode = self.deep

        # Determine which files to evaluate
        if chapter:
            # Find the chapter file
            found = False
            for book_dir in sorted(self.content_dir.iterdir()):
                if not book_dir.is_dir() or book_dir.name in ("meta", "verses"):
                    continue
                for json_file in sorted(book_dir.glob("*.json")):
                    try:
                        data = json.loads(json_file.read_text())
                        if isinstance(data, dict) and data.get("chapter_id") == chapter:
                            score = self.evaluate_chapter(json_file)
                            report.chapters.append(score)
                            found = True
                            break
                    except Exception:
                        continue
                if found:
                    break
            if not found:
                print(f"  Chapter '{chapter}' not found.")

        elif book:
            book_path = self.content_dir / book
            if book_path.is_dir():
                for json_file in sorted(book_path.glob("*.json")):
                    score = self.evaluate_chapter(json_file)
                    report.chapters.append(score)
            else:
                print(f"  Book directory '{book}' not found.")

        else:
            # All chapters in all live books
            meta_path = self.content_dir / "meta" / "books.json"
            live_books = set()
            if meta_path.exists():
                books = json.loads(meta_path.read_text())
                live_books = {b["id"] for b in books if b.get("is_live")}

            for book_dir in sorted(self.content_dir.iterdir()):
                if not book_dir.is_dir() or book_dir.name in ("meta", "verses"):
                    continue
                # Only evaluate live books when running all
                if live_books and book_dir.name not in live_books:
                    continue
                for json_file in sorted(book_dir.glob("*.json")):
                    score = self.evaluate_chapter(json_file)
                    report.chapters.append(score)

        # Save LLM cache if deep mode was used
        if self.deep:
            self._save_llm_cache()

        return report


# ─── Utilities ──────────────────────────────────────────────────────

def _format_verse_ranges(verses):
    """Format a list of verse numbers into compact ranges.

    e.g. [1, 2, 3, 7, 8, 12] -> "1-3, 7-8, 12"
    """
    if not verses:
        return ""
    ranges = []
    start = verses[0]
    end = start
    for v in verses[1:]:
        if v == end + 1:
            end = v
        else:
            ranges.append(f"{start}-{end}" if end > start else str(start))
            start = end = v
    ranges.append(f"{start}-{end}" if end > start else str(start))
    return ", ".join(ranges)


# ─── CLI Entry Point ────────────────────────────────────────────────

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Content quality scoring for Companion Study"
    )
    parser.add_argument("--book", type=str, default=None,
                        help="Evaluate a single book (e.g. genesis)")
    parser.add_argument("--chapter", type=str, default=None,
                        help="Evaluate a single chapter (e.g. gen1)")
    parser.add_argument("--deep", action="store_true",
                        help="Use LLM for relevance/accuracy scoring")
    parser.add_argument("--worst", type=int, default=10,
                        help="Show N lowest-scoring chapters (default: 10)")
    parser.add_argument("--json", action="store_true",
                        help="Save report to _tools/quality_report.json")
    parser.add_argument("--verbose", action="store_true",
                        help="Show findings for all chapters, not just low scorers")
    parser.add_argument("--api-key", type=str, default=None,
                        help="Anthropic API key (or set ANTHROPIC_API_KEY env var)")

    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    os.chdir(root)

    evaluator = QualityEvaluator(
        content_dir="content",
        verse_dir="content/verses",
        deep=args.deep,
        api_key=args.api_key,
    )

    report = evaluator.run(book=args.book, chapter=args.chapter)
    report.print_terminal(worst_n=args.worst, verbose=args.verbose)

    if args.json:
        report.save_json("_tools/quality_report.json")


if __name__ == "__main__":
    main()
