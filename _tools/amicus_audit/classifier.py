#!/usr/bin/env python3
"""classifier.py — Rule-based first-pass classifier for audit samples (#1468).

Six deterministic checks run per sample. Samples that pass every check
are marked `clean`; any failure moves them to `needs_review` (with the
failing check ids recorded for the review-queue stage).

All checks are pure functions that take a sample dict + return a
`CheckResult`. The driver is equally pure so this module is trivial to
unit-test with no I/O.

Usage:
    python3 _tools/amicus_audit/classifier.py --in cache/2026-06-01.json \\
        --out cache/2026-06-01.classified.json
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from typing import Callable, Iterable, List, Optional


@dataclass
class CheckResult:
    check_id: str
    passed: bool
    detail: Optional[str] = None


CHECK_VALID_CHUNK_ID = 'every_citation_has_valid_chunk_id'
CHECK_NO_FABRICATED_SCHOLAR = 'no_fabricated_scholar_names'
CHECK_GAP_SIGNAL_CONSISTENCY = 'gap_signal_consistency'
CHECK_RESPONSE_LENGTH = 'response_length_reasonable'
CHECK_NO_PROMPT_INJECTION = 'no_prompt_injection_markers'
CHECK_SOURCE_TYPE_MATCH = 'citation_source_type_matches_claim'

MIN_RESPONSE_LEN = 40
MAX_RESPONSE_LEN = 6000

# Phrases that would indicate the system prompt leaked into the response.
PROMPT_LEAK_MARKERS = (
    'you are amicus',
    '<retrieved_chunks>',
    '<profile>',
    "here are the relevant chunks",
    '{{current_chapter_ref}}',
)

# Scholar mentions that appear in free prose but with no citation backing
# them are only flagged when the scholar is NOT present in any retrieved
# chunk. We keep the list conservative — false-positives are expensive in
# review time.
SCHOLAR_NAME_RE = re.compile(
    r"\b(Calvin|Luther|Barth|Wright|Sarna|Alter|Brueggemann|Sproul|Keller|"
    r"Chesterton|Spurgeon|Edwards|Bonhoeffer|Schreiner|Moo|Fitzmyer)\b",
)


def _chunk_ids(chunks: list) -> set[str]:
    out = set()
    for c in chunks or []:
        cid = c.get('chunk_id') if isinstance(c, dict) else None
        if isinstance(cid, str) and cid:
            out.add(cid)
    return out


def check_every_citation_has_valid_chunk_id(sample: dict) -> CheckResult:
    retrieved = _chunk_ids(sample.get('retrieved_chunks') or [])
    bad = []
    for c in sample.get('citations') or []:
        if not isinstance(c, dict):
            continue
        cid = c.get('chunk_id')
        if not isinstance(cid, str) or cid not in retrieved:
            bad.append(cid or '<missing>')
    if bad:
        return CheckResult(
            CHECK_VALID_CHUNK_ID, False,
            f'unknown chunk_ids in citations: {bad}',
        )
    return CheckResult(CHECK_VALID_CHUNK_ID, True)


def _scholars_in_chunks(chunks: list) -> set[str]:
    out: set[str] = set()
    for c in chunks or []:
        if not isinstance(c, dict):
            continue
        text = c.get('text') or ''
        sid = c.get('scholar_id') or ''
        if sid:
            out.add(sid.lower())
        for m in SCHOLAR_NAME_RE.findall(text):
            out.add(m.lower())
    return out


def check_no_fabricated_scholar_names(sample: dict) -> CheckResult:
    retrieved_scholars = _scholars_in_chunks(sample.get('retrieved_chunks') or [])
    cited_scholars = {
        (c.get('scholar_id') or '').lower()
        for c in sample.get('citations') or []
        if isinstance(c, dict) and c.get('scholar_id')
    }
    mentioned = {
        m.lower() for m in SCHOLAR_NAME_RE.findall(sample.get('response_text') or '')
    }
    # A mentioned scholar is fine if it's in retrieved chunks OR in a citation.
    allowed = retrieved_scholars | cited_scholars
    fabricated = sorted(m for m in mentioned if m not in allowed)
    if fabricated:
        return CheckResult(
            CHECK_NO_FABRICATED_SCHOLAR, False,
            f'scholar(s) named in response but not in retrieved chunks: {fabricated}',
        )
    return CheckResult(CHECK_NO_FABRICATED_SCHOLAR, True)


GAP_ACK_PATTERNS = (
    "i don't have",
    'i do not have',
    "i can't find",
    'i cannot find',
    'no sources in',
    'outside my',
    "isn't in",
    'is not in',
    'not in the',
)


def check_gap_signal_consistency(sample: dict) -> CheckResult:
    if sample.get('sample_reason') != 'gap_signal':
        return CheckResult(CHECK_GAP_SIGNAL_CONSISTENCY, True)
    body = (sample.get('response_text') or '').lower()
    if any(p in body for p in GAP_ACK_PATTERNS):
        return CheckResult(CHECK_GAP_SIGNAL_CONSISTENCY, True)
    return CheckResult(
        CHECK_GAP_SIGNAL_CONSISTENCY, False,
        'gap_signal sample but response does not acknowledge the gap.',
    )


def check_response_length_reasonable(sample: dict) -> CheckResult:
    n = len((sample.get('response_text') or '').strip())
    if n < MIN_RESPONSE_LEN:
        return CheckResult(
            CHECK_RESPONSE_LENGTH, False,
            f'response is very short ({n} chars).',
        )
    if n > MAX_RESPONSE_LEN:
        return CheckResult(
            CHECK_RESPONSE_LENGTH, False,
            f'response is very long ({n} chars).',
        )
    return CheckResult(CHECK_RESPONSE_LENGTH, True)


def check_no_prompt_injection_markers(sample: dict) -> CheckResult:
    body = (sample.get('response_text') or '').lower()
    hits = [m for m in PROMPT_LEAK_MARKERS if m in body]
    if hits:
        return CheckResult(
            CHECK_NO_PROMPT_INJECTION, False,
            f'possible prompt leak markers: {hits}',
        )
    return CheckResult(CHECK_NO_PROMPT_INJECTION, True)


SCHOLAR_SOURCE_TYPES = {'section_panel', 'chapter_panel'}
LEX_SOURCE_TYPES = {'word_study', 'lexicon_entry'}


def check_citation_source_type_matches_claim(sample: dict) -> CheckResult:
    body = (sample.get('response_text') or '').lower()
    mismatches: list[str] = []
    for c in sample.get('citations') or []:
        if not isinstance(c, dict):
            continue
        st = c.get('source_type')
        sid = c.get('scholar_id')
        # A cited scholar attribution should live on a scholar-bearing source.
        if sid and st not in SCHOLAR_SOURCE_TYPES:
            mismatches.append(f'scholar {sid} cited as {st}')
        # Lexical / word-study claims should cite lex sources.
        if st and 'means' in body and st not in LEX_SOURCE_TYPES and sid is None:
            # Don't flag — word-meaning paraphrase can legitimately reference
            # a panel. Keep this guarded so we don't blow up the false-positive
            # rate.
            pass
    if mismatches:
        return CheckResult(
            CHECK_SOURCE_TYPE_MATCH, False,
            '; '.join(mismatches),
        )
    return CheckResult(CHECK_SOURCE_TYPE_MATCH, True)


CHECKS: tuple[Callable[[dict], CheckResult], ...] = (
    check_every_citation_has_valid_chunk_id,
    check_no_fabricated_scholar_names,
    check_gap_signal_consistency,
    check_response_length_reasonable,
    check_no_prompt_injection_markers,
    check_citation_source_type_matches_claim,
)


@dataclass
class ClassifiedSample:
    sample: dict
    results: List[CheckResult]
    audit_status: str              # 'clean' | 'needs_review'
    failing_check_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            **self.sample,
            'audit_status': self.audit_status,
            'classifier_results': [
                {'check_id': r.check_id, 'passed': r.passed, 'detail': r.detail}
                for r in self.results
            ],
            'failing_check_ids': self.failing_check_ids,
        }


def classify(sample: dict) -> ClassifiedSample:
    results = [chk(sample) for chk in CHECKS]
    failing = [r.check_id for r in results if not r.passed]
    # Gap-signal and user-feedback samples are always escalated regardless of
    # classifier outcome — humans need to eyeball them.
    force_review = sample.get('sample_reason') in ('gap_signal', 'user_feedback')
    status = 'needs_review' if failing or force_review else 'clean'
    return ClassifiedSample(
        sample=sample,
        results=results,
        audit_status=status,
        failing_check_ids=failing,
    )


def classify_all(samples: Iterable[dict]) -> list[ClassifiedSample]:
    return [classify(s) for s in samples]


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Classify audit samples.')
    p.add_argument('--in', dest='in_path', required=True,
                   help='JSON file produced by sampler.py.')
    p.add_argument('--out', dest='out_path', required=True,
                   help='Where to write classified samples.')
    args = p.parse_args(argv)

    with open(args.in_path, 'r', encoding='utf-8') as f:
        samples = json.load(f)
    classified = classify_all(samples)

    os.makedirs(os.path.dirname(args.out_path), exist_ok=True)
    with open(args.out_path, 'w', encoding='utf-8') as f:
        json.dump([c.to_dict() for c in classified], f, ensure_ascii=False, indent=2)

    clean = sum(1 for c in classified if c.audit_status == 'clean')
    flagged = len(classified) - clean
    print(f'classified {len(classified)} samples: {clean} clean, {flagged} needs_review')
    return 0


if __name__ == '__main__':
    sys.exit(main())
