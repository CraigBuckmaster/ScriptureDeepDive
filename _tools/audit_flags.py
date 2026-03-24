#!/usr/bin/env python3
"""
Audit Flag Scanner for ScriptureDeepDive content.

Scans all chapter JSON files and people/timeline metadata to generate
machine-parseable audit flags for later human verification.

Usage:
    python3 _tools/audit_flags.py                  # Full scan (all books)
    python3 _tools/audit_flags.py ezekiel          # Single book
    python3 _tools/audit_flags.py ezekiel 29 35    # Chapter range

Categories:
    date             — chronological claims (regnal years, siege dates, oracle dates)
    hebrew           — transliterations, vowel pointing, glosses, etymologies
    greek            — same for NT content
    scholar_position — claims attributed to a specific scholar's published view
    historical       — archaeological, political, or cultural claims
    family           — genealogical relationships, identifications
    cross_ref        — whether cited passages actually support the stated claim

Confidence (1-5, 0 = zero confidence):
    5 — Near certain (e.g., well-established biblical date like 586 BC fall of Jerusalem)
    4 — High confidence (e.g., standard scholarly consensus position)
    3 — Moderate (e.g., debated dating, plausible but contested claim)
    2 — Low (e.g., minority scholarly position, uncertain identification)
    1 — Very low (e.g., speculative reconstruction, obscure claim)
    0 — No confidence (should never appear; indicates a generation error)

Output: content/meta/audit-flags.json
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Configuration ──

CONTENT_DIR = Path(__file__).parent.parent / 'content'
OUTPUT_FILE = CONTENT_DIR / 'meta' / 'audit-flags.json'

# Known well-established dates that get higher confidence
WELL_KNOWN_DATES = {
    '586 BC': 5, '587 BC': 4, '586/587 BC': 4, '587/586 BC': 4,
    '605 BC': 5, '597 BC': 5, '538 BC': 5, '539 BC': 5,
    '722 BC': 5, '721 BC': 4, '612 BC': 5,
    '586 BCE': 5, '587 BCE': 4,
    '1446 BC': 3, '1260 BC': 3,  # Exodus date — debated
    '966 BC': 4, '960 BC': 3,    # Temple construction
    '931 BC': 4, '930 BC': 4,    # Kingdom division
    '1010 BC': 4, '1000 BC': 3,  # David's reign
    '4 BC': 4, '6 BC': 3,        # Birth of Jesus
    'AD 30': 3, 'AD 33': 3,      # Crucifixion
    'AD 70': 5,                   # Fall of Jerusalem (Roman)
}

# Scholars whose notes are AI-generated (all of them)
AI_GENERATED_SCHOLARS = {
    'mac', 'macarthur', 'calvin', 'netbible', 'net', 'sarna', 'alter',
    'hubbard', 'waltke', 'robertson', 'catena', 'marcus', 'rhoads',
    'keener', 'milgrom', 'ashley', 'craigie', 'tigay', 'hess', 'howard',
    'block', 'webb', 'williamson', 'kidner', 'levenson', 'jobes',
    'bergen', 'tsumura', 'anderson', 'wiseman', 'provan', 'japhet',
    'selman', 'clines', 'habel', 'longman', 'fox', 'garrett',
    'vangemeren', 'goldingay', 'collins', 'berlin', 'oconnor', 'oswalt',
    'childs', 'lundbom', 'brueggemann', 'zimmerli',
}

# Regex patterns for extracting flaggable content
DATE_PATTERN = re.compile(
    r'(?:'
    r'(?:c\.\s*)?'                           # optional "c. "
    r'(?:January|February|March|April|May|June|July|August|September|October|November|December)?'
    r'\s*'
    r'\d{1,4}'                               # year number
    r'(?:\s*[-–/]\s*\d{1,4})?'              # optional range
    r'\s*'
    r'(?:BC|BCE|AD|CE)'                      # era marker
    r')',
    re.IGNORECASE
)

# More specific date patterns for oracle/event dates
SPECIFIC_DATE_PATTERN = re.compile(
    r'(?:'
    r'(?:the\s+)?'
    r'(?:tenth|eleventh|twelfth|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth)\s+'
    r'(?:year|month|day)'
    r')',
    re.IGNORECASE
)

# Historical claim indicators
HISTORICAL_INDICATORS = re.compile(
    r'(?:'
    r'historically|archaeological(?:ly)?|excavat|inscription|'
    r'ancient\s+Near\s+East(?:ern)?|ANE|'
    r'(?:Neo-)?Babylonian|Assyrian|Egyptian|Persian|Greek|Roman|'
    r'siege\s+of|battle\s+of|fall\s+of|destruction\s+of|'
    r'(?:capital|fortress|city)\s+of|'
    r'located\s+(?:at|near|in)|modern\s+(?:day\s+)?|'
    r'Elephantine|Amarna|Ugarit|Dead\s+Sea\s+Scrolls|LXX|Septuagint|'
    r'Masoretic|MT\s+reads'
    r')',
    re.IGNORECASE
)

# Family/genealogy indicators
FAMILY_INDICATORS = re.compile(
    r'(?:'
    r'(?:son|daughter|father|mother|wife|husband|brother|sister|ancestor|descendant)\s+of|'
    r'married\s+to|born\s+to|'
    r'(?:the\s+)?(?:first|second|third|fourth)?\s*(?:born|child)|'
    r'from\s+the\s+(?:tribe|clan|house|line|lineage)\s+of'
    r')',
    re.IGNORECASE
)

# Cross-reference pattern
CROSSREF_PATTERN = re.compile(
    r'(?:Gen|Exod?|Lev|Num|Deut?|Josh?|Judg|Ruth|'
    r'(?:[12]\s*)?Sam|(?:[12]\s*)?Kgs?|(?:[12]\s*)?Chr(?:on)?|'
    r'Ezra?|Neh|Esth?|Job|Pss?|Prov|Eccl(?:es)?|Song|'
    r'Isa|Jer|Lam|Ezek?|Dan|Hos|Joel|Amos|Obad?|Jon(?:ah)?|'
    r'Mic|Nah|Hab|Zeph|Hag|Zech|Mal|'
    r'Matt?|Mark?|Luke?|John?|Acts?|Rom|'
    r'(?:[12]\s*)?Cor|Gal|Eph|Phil|Col|'
    r'(?:[12]\s*)?Thess?|(?:[12]\s*)?Tim|Titus?|Phlm|Phile|'
    r'Heb|Jas|James|(?:[12]\s*)?Pet|(?:[123]\s*)?John?|Jude|Rev)'
    r'\s*\d+[:\.\d,\-–\s]*'
)


class AuditScanner:
    """Scans content JSON and generates audit flags."""

    def __init__(self):
        self.flags = []
        self.flag_counter = 0
        self.stats = {
            'chapters_scanned': 0,
            'total_flags': 0,
            'by_category': {},
            'by_confidence': {},
            'by_book': {},
        }

    def _make_flag(self, book, chapter, section_num, category,
                   confidence, claim, source_panel, context=''):
        """Create a single audit flag entry."""
        self.flag_counter += 1
        flag = {
            'id': f'flag_{self.flag_counter:05d}',
            'book': book,
            'chapter': chapter,
            'section': section_num,
            'category': category,
            'confidence': confidence,
            'claim': claim[:300],  # truncate very long claims
            'source_panel': source_panel,
            'context': context[:200] if context else '',
            'status': 'pending',
        }
        self.flags.append(flag)

        # Update stats
        self.stats['total_flags'] += 1
        self.stats['by_category'][category] = \
            self.stats['by_category'].get(category, 0) + 1
        self.stats['by_confidence'][str(confidence)] = \
            self.stats['by_confidence'].get(str(confidence), 0) + 1
        self.stats['by_book'][book] = \
            self.stats['by_book'].get(book, 0) + 1

    def _date_confidence(self, date_str):
        """Assign confidence to a date claim based on scholarly consensus."""
        normalized = date_str.strip()
        # Check well-known dates
        for known, conf in WELL_KNOWN_DATES.items():
            if known.lower() in normalized.lower():
                return conf
        # Approximate/uncertain dates
        if normalized.startswith('c.') or normalized.startswith('ca.'):
            return 3
        # Date ranges get lower confidence (often debated)
        if '/' in normalized or '–' in normalized or '-' in normalized:
            digits = re.findall(r'\d+', normalized)
            if len(digits) >= 2:
                return 3
        # Default: moderate confidence for specific dates
        return 3

    def _scan_text_for_dates(self, text, book, chapter, section_num, panel):
        """Extract date claims from text and create flags."""
        if not text:
            return
        for match in DATE_PATTERN.finditer(text):
            date_str = match.group(0)
            confidence = self._date_confidence(date_str)
            # Get surrounding context
            start = max(0, match.start() - 40)
            end = min(len(text), match.end() + 40)
            context = text[start:end]
            self._make_flag(book, chapter, section_num, 'date',
                            confidence, date_str, panel, context)

    def _scan_text_for_historical(self, text, book, chapter, section_num, panel):
        """Extract historical claims from text."""
        if not text:
            return
        for match in HISTORICAL_INDICATORS.finditer(text):
            # Get the sentence containing the match
            sent_start = text.rfind('.', 0, match.start())
            sent_start = sent_start + 1 if sent_start >= 0 else 0
            sent_end = text.find('.', match.end())
            sent_end = sent_end + 1 if sent_end >= 0 else len(text)
            sentence = text[sent_start:sent_end].strip()
            if len(sentence) > 15:  # skip trivial matches
                self._make_flag(book, chapter, section_num, 'historical',
                                3, sentence, panel)

    def _scan_text_for_family(self, text, book, chapter, section_num, panel):
        """Extract genealogical claims from text."""
        if not text:
            return
        for match in FAMILY_INDICATORS.finditer(text):
            sent_start = text.rfind('.', 0, match.start())
            sent_start = sent_start + 1 if sent_start >= 0 else 0
            sent_end = text.find('.', match.end())
            sent_end = sent_end + 1 if sent_end >= 0 else len(text)
            sentence = text[sent_start:sent_end].strip()
            if len(sentence) > 15:
                self._make_flag(book, chapter, section_num, 'family',
                                3, sentence, panel)

    def _scan_hebrew_entry(self, entry, book, chapter, section_num):
        """Flag a Hebrew/Greek word study entry for verification."""
        word = entry.get('word', '')
        tlit = entry.get('transliteration', '')
        gloss = entry.get('gloss', '')
        paragraph = entry.get('paragraph', '')

        # Flag the word + transliteration + gloss as a unit
        claim = f"Hebrew: {word} ({tlit}) = '{gloss}'"
        # Hebrew entries need verification but are based on standard lexicons
        self._make_flag(book, chapter, section_num, 'hebrew',
                        3, claim, 'heb', paragraph[:200] if paragraph else '')

        # Also scan the paragraph for dates and historical claims
        if paragraph:
            self._scan_text_for_dates(paragraph, book, chapter,
                                      section_num, 'heb')
            self._scan_text_for_historical(paragraph, book, chapter,
                                           section_num, 'heb')

    def _scan_scholar_notes(self, panel_key, panel_data, book, chapter,
                            section_num):
        """Flag scholar-attributed notes."""
        if panel_key not in AI_GENERATED_SCHOLARS:
            return

        notes = []
        if isinstance(panel_data, dict):
            notes = panel_data.get('notes', [])
        elif isinstance(panel_data, list):
            notes = panel_data

        for note_entry in notes:
            if isinstance(note_entry, dict):
                ref = note_entry.get('ref', '')
                note_text = note_entry.get('note', '')
            elif isinstance(note_entry, (list, tuple)) and len(note_entry) >= 2:
                ref, note_text = note_entry[0], note_entry[1]
            else:
                continue

            # Every scholar note is flagged — they are all AI-generated
            claim = f"[{panel_key}] {ref}: {note_text}"
            self._make_flag(book, chapter, section_num, 'scholar_position',
                            3, claim, panel_key, '')

            # Also scan note text for dates, historical claims, family
            self._scan_text_for_dates(note_text, book, chapter,
                                      section_num, panel_key)
            self._scan_text_for_historical(note_text, book, chapter,
                                           section_num, panel_key)
            self._scan_text_for_family(note_text, book, chapter,
                                       section_num, panel_key)

    def _scan_cross_refs(self, cross_list, book, chapter, section_num):
        """Flag cross-reference entries."""
        if not isinstance(cross_list, list):
            return
        for entry in cross_list:
            if isinstance(entry, dict):
                ref = entry.get('ref', '')
                note = entry.get('note', '')
            elif isinstance(entry, (list, tuple)) and len(entry) >= 2:
                ref, note = entry[0], entry[1]
            else:
                continue

            claim = f"Cross-ref {ref}: {note}"
            # Cross-refs are moderate confidence — the reference exists
            # but the interpretive connection may be stretched
            self._make_flag(book, chapter, section_num, 'cross_ref',
                            3, claim, 'cross', '')

    def _scan_context(self, ctx_text, book, chapter, section_num, panel='ctx'):
        """Scan context/historical paragraphs."""
        if not ctx_text or not isinstance(ctx_text, str):
            return
        self._scan_text_for_dates(ctx_text, book, chapter, section_num, panel)
        self._scan_text_for_historical(ctx_text, book, chapter,
                                       section_num, panel)
        self._scan_text_for_family(ctx_text, book, chapter, section_num, panel)

    def _scan_chapter_panels(self, ch_panels, book, chapter):
        """Scan chapter-level panels (themes, lit notes)."""
        if not isinstance(ch_panels, dict):
            return

        # Themes note
        themes = ch_panels.get('themes')
        if isinstance(themes, dict) and themes.get('note'):
            self._scan_context(themes['note'], book, chapter, 0, 'themes')

        # Lit note
        lit = ch_panels.get('lit')
        if isinstance(lit, dict) and lit.get('note'):
            self._scan_context(lit['note'], book, chapter, 0, 'lit')

    def scan_chapter(self, filepath, book):
        """Scan a single chapter JSON file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        chapter = data.get('chapter_num', 0)
        self.stats['chapters_scanned'] += 1

        # Scan each section
        for sec in data.get('sections', []):
            sec_num = sec.get('section_num', 0)
            panels = sec.get('panels', {})

            if not isinstance(panels, dict):
                continue

            # Hebrew word studies
            heb_entries = panels.get('heb', [])
            if isinstance(heb_entries, list):
                for entry in heb_entries:
                    if isinstance(entry, dict):
                        # Determine if OT or NT for category
                        testament = data.get('testament', 'OT')
                        if testament == 'NT':
                            # Check if entry looks Greek
                            word = entry.get('word', '')
                            if any(ord(c) > 0x0370 and ord(c) < 0x03FF
                                   for c in word):
                                entry_copy = dict(entry)
                                claim = (f"Greek: {entry.get('word', '')} "
                                         f"({entry.get('transliteration', '')}) "
                                         f"= '{entry.get('gloss', '')}'")
                                self._make_flag(book, chapter, sec_num,
                                                'greek', 3, claim, 'heb',
                                                entry.get('paragraph', '')[:200])
                            else:
                                self._scan_hebrew_entry(entry, book,
                                                        chapter, sec_num)
                        else:
                            self._scan_hebrew_entry(entry, book,
                                                    chapter, sec_num)

            # Context paragraphs
            for ctx_key in ('ctx', 'hist'):
                ctx_val = panels.get(ctx_key)
                if isinstance(ctx_val, str):
                    self._scan_context(ctx_val, book, chapter,
                                       sec_num, ctx_key)

            # Cross-references
            cross = panels.get('cross', [])
            self._scan_cross_refs(cross, book, chapter, sec_num)

            # Scholar notes — scan ALL panel keys that look like scholars
            for panel_key, panel_val in panels.items():
                if panel_key in AI_GENERATED_SCHOLARS:
                    self._scan_scholar_notes(panel_key, panel_val,
                                             book, chapter, sec_num)

        # Chapter-level panels
        self._scan_chapter_panels(data.get('chapter_panels', {}),
                                  book, chapter)

    def scan_people(self):
        """Scan people.json for flaggable claims."""
        people_file = CONTENT_DIR / 'meta' / 'people.json'
        if not people_file.exists():
            return

        with open(people_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        people = data.get('people', [])
        for person in people:
            pid = person.get('id', '?')

            # Dates
            dates = person.get('dates', '')
            if dates:
                confidence = 3
                for known, conf in WELL_KNOWN_DATES.items():
                    if known.lower() in dates.lower():
                        confidence = max(confidence, conf)
                self._make_flag('_meta', 0, 0, 'date',
                                confidence,
                                f"Person '{pid}' dates: {dates}",
                                'people.json')

            # Family references
            for rel_key in ('father', 'mother', 'spouseOf'):
                rel_val = person.get(rel_key)
                if rel_val:
                    self._make_flag('_meta', 0, 0, 'family',
                                    3,
                                    f"Person '{pid}' {rel_key}: {rel_val}",
                                    'people.json')

            # Bio and role — scan for historical claims
            for text_key in ('bio', 'scriptureRole', 'role'):
                text = person.get(text_key, '')
                if text:
                    self._scan_text_for_dates(text, '_meta', 0, 0,
                                              'people.json')
                    self._scan_text_for_historical(text, '_meta', 0, 0,
                                                   'people.json')

    def scan_timelines(self):
        """Scan timelines.json for flaggable claims."""
        timeline_file = CONTENT_DIR / 'meta' / 'timelines.json'
        if not timeline_file.exists():
            return

        with open(timeline_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        events = data.get('events', [])
        for evt in events:
            eid = evt.get('id', '?')
            year = evt.get('year')
            name = evt.get('name', '')
            summary = evt.get('summary', '')

            # Year
            if year is not None:
                # Convert to string for matching
                year_str = f"{abs(year)} {'BC' if year < 0 else 'AD'}"
                confidence = WELL_KNOWN_DATES.get(year_str, 3)
                self._make_flag('_meta', 0, 0, 'date',
                                confidence,
                                f"Event '{eid}' ({name}): year {year}",
                                'timelines.json')

            # Summary
            if summary:
                self._scan_text_for_historical(summary, '_meta', 0, 0,
                                               'timelines.json')

    def scan_book(self, book_dir):
        """Scan all chapters for a single book."""
        book_path = CONTENT_DIR / book_dir
        if not book_path.exists() or not book_path.is_dir():
            print(f"  Skipping {book_dir} (not found)")
            return

        chapter_files = sorted(book_path.glob('*.json'),
                               key=lambda p: int(p.stem))
        for cf in chapter_files:
            try:
                self.scan_chapter(cf, book_dir)
            except Exception as e:
                print(f"  Error scanning {cf}: {e}")

    def scan_all(self, book_filter=None, ch_start=None, ch_end=None):
        """Scan all content and generate flags."""
        print("Audit Flag Scanner")
        print("=" * 60)

        # Determine which books to scan
        if book_filter:
            books = [book_filter]
        else:
            books = sorted([
                d.name for d in CONTENT_DIR.iterdir()
                if d.is_dir() and d.name not in ('meta', 'verses')
            ])

        # Scan chapters
        for book in books:
            book_path = CONTENT_DIR / book
            if not book_path.exists():
                continue

            chapter_files = sorted(book_path.glob('*.json'),
                                   key=lambda p: int(p.stem))

            # Apply chapter range filter
            if ch_start is not None or ch_end is not None:
                chapter_files = [
                    cf for cf in chapter_files
                    if (ch_start is None or int(cf.stem) >= ch_start)
                    and (ch_end is None or int(cf.stem) <= ch_end)
                ]

            if chapter_files:
                print(f"  Scanning {book}: {len(chapter_files)} chapters...")
                for cf in chapter_files:
                    try:
                        self.scan_chapter(cf, book)
                    except Exception as e:
                        print(f"    Error in {cf.name}: {e}")

        # Scan metadata files
        if not book_filter:
            print("  Scanning people.json...")
            self.scan_people()
            print("  Scanning timelines.json...")
            self.scan_timelines()

        print(f"\n  Total flags: {self.stats['total_flags']}")
        print(f"  Chapters scanned: {self.stats['chapters_scanned']}")
        print(f"  By category:")
        for cat, count in sorted(self.stats['by_category'].items()):
            print(f"    {cat}: {count}")
        print(f"  By confidence:")
        for conf, count in sorted(self.stats['by_confidence'].items()):
            print(f"    {conf}: {count}")

    def save(self, merge_existing=True):
        """Save flags to audit-flags.json.

        If merge_existing=True and the file already exists, merge new flags
        while preserving status changes on existing flags.
        """
        output = {
            'version': 1,
            'generated': datetime.now(timezone.utc).isoformat(),
            'stats': self.stats,
            'flags': self.flags,
        }

        if merge_existing and OUTPUT_FILE.exists():
            try:
                with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                    existing = json.load(f)

                # Build lookup of existing flags by (book, chapter, section,
                # category, claim_prefix) to preserve status
                existing_status = {}
                for ef in existing.get('flags', []):
                    key = (ef['book'], ef['chapter'], ef['section'],
                           ef['category'], ef['claim'][:100])
                    existing_status[key] = ef.get('status', 'pending')

                # Apply preserved status to matching new flags
                for flag in self.flags:
                    key = (flag['book'], flag['chapter'], flag['section'],
                           flag['category'], flag['claim'][:100])
                    if key in existing_status:
                        flag['status'] = existing_status[key]

            except (json.JSONDecodeError, KeyError):
                pass  # If existing file is corrupt, just overwrite

        os.makedirs(OUTPUT_FILE.parent, exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n  Saved to {OUTPUT_FILE}")
        print(f"  File size: {OUTPUT_FILE.stat().st_size / 1024:.1f} KB")


def main():
    scanner = AuditScanner()

    # Parse arguments
    book_filter = None
    ch_start = None
    ch_end = None

    if len(sys.argv) > 1:
        book_filter = sys.argv[1]
    if len(sys.argv) > 2:
        ch_start = int(sys.argv[2])
    if len(sys.argv) > 3:
        ch_end = int(sys.argv[3])

    scanner.scan_all(book_filter, ch_start, ch_end)
    scanner.save(merge_existing=True)

    print("\n" + "=" * 60)
    print("AUDIT FLAGS COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    os.chdir(Path(__file__).parent.parent)
    main()
