#!/usr/bin/env python3
"""
lens_quality_scorer.py — Quality scorer for hermeneutic lens guidance entries.

Scores each (chapter, lens) entry 0-100 across four dimensions (25 pts each),
mirroring the DVCR scheme used by quality_scorer.py:

  1. DENSITY        — Guidance has a concrete chapter anchor (verse number,
                      named character, named place, or motif keyword). No
                      generic "this passage shows..." filler.
  2. VERSE_COVERAGE — Any verse refs cited in guidance fall within the
                      chapter's actual verse range (no out-of-bounds).
  3. COMPLETENESS   — At least one rubric token from lens_rubrics.json for
                      the active lens; soft-scored with partial credit.
  4. RELEVANCE      — No filler phrases ("the lens reveals", etc.); guidance
                      doesn't restate the chapter's themes panel verbatim;
                      no `should_avoid` patterns from the rubric trigger.

CI gate: chapters with any entry below 90 are flagged for fix.

Usage:
    python3 _tools/lens_quality_scorer.py                    # All chapters
    python3 _tools/lens_quality_scorer.py --chapter gen1
    python3 _tools/lens_quality_scorer.py --lens grammatical
    python3 _tools/lens_quality_scorer.py --worst 20
    python3 _tools/lens_quality_scorer.py --json             # machine output
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
LENS_DIR = CONTENT / 'hermeneutic_lenses'
LENSES_JSON = LENS_DIR / 'lenses.json'
CHAPTERS_DIR = LENS_DIR / 'chapters'
RUBRICS_JSON = Path(__file__).resolve().parent / 'lens_rubrics.json'

# Subdirectories of content/ that are NOT books — keep in sync with the
# constant of the same name in schema_validator.py.
NON_BOOK_DIRS = frozenset({
    'meta', 'verses', 'interlinear', 'archaeology', 'life_topics',
    'historical_interpretations', 'grammar', 'map-styles',
    'hermeneutic_lenses',
})

# Bring panel taxonomy + scholar keys onto the path so we share the
# panel-key allowlist with the rest of the pipeline. Keeps lens validation
# in lockstep when scholars are added.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from panel_taxonomy import (  # noqa: E402
    CORE_SECTION_PANELS,
    CHAPTER_PANEL_TYPES,
    load_scholar_keys,
)


# ─── Configuration ──────────────────────────────────────────────────

QUALITY_FLOOR = 90

GUIDANCE_MIN_LEN = 80
GUIDANCE_MAX_LEN = 280

# Banned filler patterns. Drop the score on Relevance.
FILLER_PATTERNS = [
    re.compile(r"\bthe lens reveals\b", re.IGNORECASE),
    re.compile(r"\bthis lens shows\b", re.IGNORECASE),
    re.compile(r"\bthrough this lens\b", re.IGNORECASE),
    re.compile(r"\bthis passage shows that\b", re.IGNORECASE),
    re.compile(r"\bthis text teaches that\b", re.IGNORECASE),
    re.compile(r"\bin this chapter we (see|learn)\b", re.IGNORECASE),
]

# In-chapter verse ref: requires explicit `v` or `vv` prefix to disambiguate
# from cross-book citations like "Psalm 33:6" or "Heb 4:9-11" where the digits
# after the colon are NOT verses of the current chapter. Bare-number refs
# elsewhere in the guidance are not validated for chapter-bounds.
VERSE_REF_RE = re.compile(r"\bvv?\.?\s*(\d{1,3})(?:[\u2013\u2014\-](\d{1,3}))?\b")
# Loose density-anchor pattern: catches verse refs in any form for the
# Density check ('does this guidance reference a verse at all?').
ANY_VERSE_PATTERN = re.compile(r"\b(?:vv?\.?\s*)?(\d{1,3})(?:[\u2013\u2014:\-](\d{1,3}))?\b")
PROPER_NOUN_RE = re.compile(r"\b[A-Z][a-z]{2,}\b")


# ─── Data Classes ───────────────────────────────────────────────────

@dataclass
class Finding:
    severity: str   # info | warn | fail
    dimension: str
    message: str

    def to_dict(self):
        return asdict(self)


@dataclass
class EntryScore:
    chapter_id: str
    lens_id: str
    density: int = 0
    verse_coverage: int = 0
    completeness: int = 0
    relevance: int = 0
    total: int = 0
    findings: list[Finding] = field(default_factory=list)

    def to_dict(self):
        d = asdict(self)
        d['findings'] = [f.to_dict() for f in self.findings]
        return d


# ─── Loaders ────────────────────────────────────────────────────────

def _load_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def load_lens_ids() -> set[str]:
    if not LENSES_JSON.exists():
        return set()
    return {l['id'] for l in _load_json(LENSES_JSON)}


def load_rubrics() -> dict:
    if not RUBRICS_JSON.exists():
        return {}
    raw = _load_json(RUBRICS_JSON)
    raw.pop('_comment', None)
    return raw


def load_chapter_verse_max(chapter_id: str, content_dir: Path = CONTENT) -> int | None:
    """Find the max verse number for a chapter by scanning its content JSON.

    Returns None if the chapter file can't be found — verse-coverage scoring
    will then skip the bounds check rather than penalize.
    """
    # chapter_id is like 'gen1', 'psa119'; need to find the matching content/{book}/{N}.json.
    # We don't have a direct mapping from chapter_id to book_dir without books.json,
    # so try the simplest scan: look for a chapter JSON whose chapter_id field matches.
    for book_dir in content_dir.iterdir():
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for chap_file in book_dir.glob('*.json'):
            try:
                data = _load_json(chap_file)
            except (json.JSONDecodeError, OSError):
                continue
            if data.get('chapter_id') == chapter_id:
                # Collect verse_end across sections
                max_v = 0
                for section in data.get('sections', []):
                    end = section.get('verse_end')
                    if isinstance(end, int):
                        max_v = max(max_v, end)
                return max_v if max_v > 0 else None
    return None


def load_chapter_themes_text(chapter_id: str, content_dir: Path = CONTENT) -> str:
    """Pull the chapter's themes panel text for plagiarism check."""
    for book_dir in content_dir.iterdir():
        if not book_dir.is_dir() or book_dir.name in NON_BOOK_DIRS:
            continue
        for chap_file in book_dir.glob('*.json'):
            try:
                data = _load_json(chap_file)
            except (json.JSONDecodeError, OSError):
                continue
            if data.get('chapter_id') == chapter_id:
                themes = (data.get('chapter_panels', {}) or {}).get('themes', {})
                if isinstance(themes, dict):
                    return ' '.join(str(v) for v in themes.values() if isinstance(v, str))
                return str(themes) if themes else ''
    return ''


# ─── Scoring Logic ──────────────────────────────────────────────────

def score_density(guidance: str) -> tuple[int, list[Finding]]:
    """25 pts: concrete chapter anchor (verse number, proper noun, motif word)."""
    findings = []
    score = 25

    if len(guidance) < GUIDANCE_MIN_LEN:
        findings.append(Finding('fail', 'density',
                                f'guidance too short ({len(guidance)} < {GUIDANCE_MIN_LEN})'))
        score -= 15
    elif len(guidance) > GUIDANCE_MAX_LEN:
        findings.append(Finding('warn', 'density',
                                f'guidance too long ({len(guidance)} > {GUIDANCE_MAX_LEN})'))
        score -= 5

    has_verse_ref = bool(ANY_VERSE_PATTERN.search(guidance))
    has_proper_noun = bool(PROPER_NOUN_RE.search(guidance))

    if not (has_verse_ref or has_proper_noun):
        findings.append(Finding('fail', 'density',
                                'no concrete anchor: no verse number or proper noun found'))
        score -= 12

    return max(0, score), findings


def score_verse_coverage(guidance: str, max_verse: int | None) -> tuple[int, list[Finding]]:
    """25 pts: any verse refs in guidance fall within the chapter's verse range."""
    findings = []
    if max_verse is None:
        # Can't verify, give full credit but note it.
        return 25, [Finding('info', 'verse_coverage', 'chapter verse range unknown; skipped bounds check')]

    score = 25
    for m in VERSE_REF_RE.finditer(guidance):
        v_start = int(m.group(1))
        v_end = int(m.group(2)) if m.group(2) else v_start
        # Guard: 4-digit numbers etc. won't match (1-3 digits). v_start of 0 is bogus too.
        if v_start == 0 or v_start > max_verse or v_end > max_verse:
            findings.append(Finding('fail', 'verse_coverage',
                                    f'verse ref {v_start}{f"-{v_end}" if v_end != v_start else ""} '
                                    f'out of range (chapter has {max_verse} verses)'))
            score -= 10
    return max(0, score), findings


def score_completeness(guidance: str, lens_id: str, rubric: dict) -> tuple[int, list[Finding]]:
    """25 pts: at least one rubric `must_have_one_of` token present."""
    findings = []
    must_have = rubric.get('must_have_one_of', []) if rubric else []
    if not must_have:
        return 25, [Finding('info', 'completeness',
                            f'no rubric tokens for lens "{lens_id}"; full credit')]
    g_lower = guidance.lower()
    matched = [t for t in must_have if t.lower() in g_lower]
    if matched:
        return 25, []
    findings.append(Finding('fail', 'completeness',
                            f'no rubric token from lens "{lens_id}" present in guidance'))
    return 10, findings


def score_relevance(guidance: str, rubric: dict, themes_text: str) -> tuple[int, list[Finding]]:
    """25 pts: no filler phrases, no `should_avoid` matches, not echoing themes."""
    findings = []
    score = 25

    for pat in FILLER_PATTERNS:
        if pat.search(guidance):
            findings.append(Finding('fail', 'relevance',
                                    f'filler phrase matched: /{pat.pattern}/'))
            score -= 8

    for avoid in (rubric or {}).get('should_avoid', []):
        if avoid.lower() in guidance.lower():
            findings.append(Finding('warn', 'relevance',
                                    f'lens-specific avoid phrase matched: "{avoid}"'))
            score -= 5

    # Plagiarism check: > 60% of guidance words also appear in the themes text.
    if themes_text:
        g_words = set(re.findall(r"\w+", guidance.lower()))
        t_words = set(re.findall(r"\w+", themes_text.lower()))
        if g_words:
            overlap = len(g_words & t_words) / len(g_words)
            if overlap > 0.6:
                findings.append(Finding('warn', 'relevance',
                                        f'guidance shares {overlap*100:.0f}% of words with themes panel; restate'))
                score -= 7

    return max(0, score), findings


def score_panel_keys(entry: dict, all_panel_keys: set[str]) -> list[Finding]:
    """Schema-style check on panel_filter / panel_order. Doesn't affect score
    (the schema validator already gate-keeps for invalid keys), but surfaces
    helpful warnings here too."""
    findings = []
    for field_name in ('panel_filter', 'panel_order'):
        keys = entry.get(field_name)
        if keys is None:
            continue
        if not isinstance(keys, list):
            findings.append(Finding('fail', 'schema',
                                    f'{field_name} must be a list'))
            continue
        for k in keys:
            if k not in all_panel_keys:
                findings.append(Finding('warn', 'schema',
                                        f'{field_name} key "{k}" not in known panel set'))
    if 'panel_filter' in entry and 'panel_order' in entry:
        order_keys = set(entry.get('panel_order') or [])
        filter_keys = set(entry.get('panel_filter') or [])
        extra = order_keys - filter_keys
        if extra:
            findings.append(Finding('fail', 'schema',
                                    f'panel_order contains keys not in panel_filter: {sorted(extra)}'))
    return findings


# ─── Entry & Aggregation ────────────────────────────────────────────

def score_entry(chapter_id: str, entry: dict, rubrics: dict,
                all_panel_keys: set[str]) -> EntryScore:
    lens_id = entry.get('lens_id', '')
    guidance = entry.get('guidance', '')
    rubric = rubrics.get(lens_id, {})

    max_verse = load_chapter_verse_max(chapter_id)
    themes_text = load_chapter_themes_text(chapter_id)

    score = EntryScore(chapter_id=chapter_id, lens_id=lens_id)
    score.density, f1 = score_density(guidance)
    score.verse_coverage, f2 = score_verse_coverage(guidance, max_verse)
    score.completeness, f3 = score_completeness(guidance, lens_id, rubric)
    score.relevance, f4 = score_relevance(guidance, rubric, themes_text)
    score.total = score.density + score.verse_coverage + score.completeness + score.relevance
    score.findings = f1 + f2 + f3 + f4 + score_panel_keys(entry, all_panel_keys)
    return score


def iter_entries(chapter_filter: str | None = None,
                 lens_filter: str | None = None) -> Iterable[tuple[str, dict]]:
    if not CHAPTERS_DIR.is_dir():
        return
    for json_file in sorted(CHAPTERS_DIR.glob('*.json')):
        chapter_id = json_file.stem
        if chapter_filter and chapter_id != chapter_filter:
            continue
        try:
            data = _load_json(json_file)
        except json.JSONDecodeError as err:
            print(f"[ERROR] {json_file.name} invalid JSON: {err}")
            continue
        for entry in data.get('lenses', []):
            if lens_filter and entry.get('lens_id') != lens_filter:
                continue
            yield chapter_id, entry


# ─── CLI ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Hermeneutic lens quality scorer')
    parser.add_argument('--chapter', help='Limit to one chapter_id (e.g. gen1)')
    parser.add_argument('--lens', help='Limit to one lens_id (e.g. grammatical)')
    parser.add_argument('--worst', type=int, default=0,
                        help='Show N lowest-scoring entries (default: all <90)')
    parser.add_argument('--json', dest='as_json', action='store_true',
                        help='Output JSON to stdout instead of human report')
    parser.add_argument('--floor', type=int, default=QUALITY_FLOOR,
                        help=f'Pass/fail floor (default: {QUALITY_FLOOR})')
    args = parser.parse_args()

    rubrics = load_rubrics()
    valid_lens_ids = load_lens_ids()
    scholar_keys = load_scholar_keys(CONTENT)
    all_panel_keys = CORE_SECTION_PANELS | CHAPTER_PANEL_TYPES | scholar_keys

    scores: list[EntryScore] = []
    unknown_lens_count = 0
    for chapter_id, entry in iter_entries(args.chapter, args.lens):
        if entry.get('lens_id') not in valid_lens_ids:
            unknown_lens_count += 1
        scores.append(score_entry(chapter_id, entry, rubrics, all_panel_keys))

    # Summary
    total_entries = len(scores)
    passing = sum(1 for s in scores if s.total >= args.floor)
    failing = total_entries - passing
    avg = (sum(s.total for s in scores) / total_entries) if total_entries else 0

    if args.as_json:
        out = {
            'total': total_entries,
            'passing': passing,
            'failing': failing,
            'avg': round(avg, 2),
            'floor': args.floor,
            'unknown_lens_count': unknown_lens_count,
            'entries': [s.to_dict() for s in scores],
        }
        print(json.dumps(out, indent=2))
        return 0 if failing == 0 else 1

    # Human report
    print(f"\n{'='*60}")
    print(f"LENS QUALITY REPORT — {total_entries} entries")
    print(f"{'='*60}")
    if total_entries == 0:
        print("No lens content yet — pipeline ready, awaiting Phase 2+.")
        return 0

    print(f"Passing (>= {args.floor}): {passing}")
    print(f"Failing  (<  {args.floor}): {failing}")
    print(f"Average:           {avg:.1f}/100")

    by_lens = Counter(s.lens_id for s in scores)
    print("\nBy lens:")
    for lens_id, n in by_lens.most_common():
        lens_avg = sum(s.total for s in scores if s.lens_id == lens_id) / n
        print(f"  {lens_id:<15} {n:>4} entries, avg {lens_avg:.1f}")

    failed_scores = sorted([s for s in scores if s.total < args.floor], key=lambda s: s.total)
    if args.worst > 0:
        failed_scores = failed_scores[:args.worst]
    if failed_scores:
        print(f"\n--- {len(failed_scores)} entries below floor ---")
        for s in failed_scores:
            print(f"\n[{s.total}/100] {s.chapter_id} / {s.lens_id} "
                  f"(D:{s.density} V:{s.verse_coverage} C:{s.completeness} R:{s.relevance})")
            for f in s.findings:
                if f.severity == 'fail':
                    print(f"  [FAIL] {f.dimension}: {f.message}")
                elif f.severity == 'warn':
                    print(f"  [WARN] {f.dimension}: {f.message}")

    if unknown_lens_count:
        print(f"\n[FAIL] {unknown_lens_count} entries reference unknown lens_id "
              f"— check {LENSES_JSON.relative_to(ROOT)}")
        return 1

    return 0 if failing == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
