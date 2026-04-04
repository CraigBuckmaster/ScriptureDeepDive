"""
accuracy_extractors.py — Claim extraction from Companion Study chapter JSON.

Walks the chapter data structure and produces typed Claim objects for
every verifiable assertion. Each claim knows its type, source panel,
verification tier, and the verbatim text to check.
"""

import re
from dataclasses import dataclass, field, asdict
from typing import Optional

from accuracy_config import (
    CORE_SECTION_PANELS, HEBREW_PANELS, CROSS_REF_PANELS,
    HISTORICAL_PANELS, PEOPLE_PANELS, SOURCE_PANELS, THREAD_PANELS,
    DEBATE_PANELS, TEXTUAL_PANELS, DEFAULT_TIERS,
)


# ─── Data Classes ───────────────────────────────────────────────────

@dataclass
class Claim:
    """A single verifiable claim extracted from chapter content."""
    id: str                          # e.g. "gen-1-s1-sarna-001"
    chapter_id: str                  # e.g. "gen1"
    book_dir: str                    # e.g. "genesis"
    section_num: Optional[int]       # None for chapter-level panels
    panel_type: str                  # e.g. "sarna", "heb", "cross"
    claim_type: str                  # scholar_attribution | hebrew_greek | etc.
    claim_text: str                  # Verbatim claim from JSON
    source_attribution: Optional[str]  # e.g. "Nahum Sarna, JPS Torah Commentary"
    verse_ref: Optional[str]         # e.g. "1:1" or "Gen 1:1"
    verification_tier: int           # 0, 1, 2, or 3

    def to_dict(self) -> dict:
        return asdict(self)


# ─── Claim ID Generation ───────────────────────────────────────────

def _make_id(book_dir: str, chapter_num: int, section_num: Optional[int],
             panel_type: str, index: int) -> str:
    """Generate a deterministic claim ID.

    Format: {book_abbrev}-{chapter}-s{section}-{panel}-{index:03d}
    Chapter-level panels use 'ch' instead of 's{N}'.
    """
    # Abbreviate book name for compactness
    abbrev = book_dir.replace("_", "")[:6]
    sec_part = f"s{section_num}" if section_num is not None else "ch"
    return f"{abbrev}-{chapter_num}-{sec_part}-{panel_type}-{index:03d}"


# ─── Main Extractor ─────────────────────────────────────────────────

class ClaimExtractor:
    """Extract verifiable claims from a chapter JSON structure."""

    def extract_chapter(self, chapter_data: dict) -> list[Claim]:
        """Extract all claims from a single chapter.

        Args:
            chapter_data: Parsed chapter JSON (dict with sections, chapter_panels, etc.)

        Returns:
            List of Claim objects ready for verification.
        """
        claims = []
        book_dir = chapter_data.get("book_dir", "unknown")
        chapter_num = chapter_data.get("chapter_num", 0)
        chapter_id = chapter_data.get("chapter_id", f"{book_dir}{chapter_num}")

        # ── Section-level panels ────────────────────────────────────
        for section in chapter_data.get("sections", []):
            if not isinstance(section, dict):
                continue
            sec_num = section.get("section_num")
            panels = section.get("panels", {})
            if not isinstance(panels, dict):
                continue

            for panel_key, panel_data in panels.items():
                if panel_key in HEBREW_PANELS:
                    claims.extend(self._extract_hebrew(
                        panel_data, book_dir, chapter_num, chapter_id, sec_num
                    ))
                elif panel_key in CROSS_REF_PANELS:
                    claims.extend(self._extract_cross_refs(
                        panel_data, book_dir, chapter_num, chapter_id, sec_num
                    ))
                elif panel_key in HISTORICAL_PANELS:
                    claims.extend(self._extract_historical(
                        panel_data, book_dir, chapter_num, chapter_id, sec_num
                    ))
                elif panel_key not in CORE_SECTION_PANELS:
                    # Scholar panel
                    claims.extend(self._extract_scholar(
                        panel_key, panel_data, book_dir, chapter_num,
                        chapter_id, sec_num
                    ))
                # mac and net are in CORE but are scholar-attributed
                elif panel_key in ("mac", "net"):
                    claims.extend(self._extract_scholar(
                        panel_key, panel_data, book_dir, chapter_num,
                        chapter_id, sec_num
                    ))

        # ── Chapter-level panels ────────────────────────────────────
        cp = chapter_data.get("chapter_panels", {})
        if isinstance(cp, dict):
            if "ppl" in cp:
                claims.extend(self._extract_people(
                    cp["ppl"], book_dir, chapter_num, chapter_id
                ))
            if "src" in cp:
                claims.extend(self._extract_sources(
                    cp["src"], book_dir, chapter_num, chapter_id
                ))
            if "rec" in cp:
                claims.extend(self._extract_reception(
                    cp["rec"], book_dir, chapter_num, chapter_id
                ))
            if "thread" in cp:
                claims.extend(self._extract_threads(
                    cp["thread"], book_dir, chapter_num, chapter_id
                ))
            if "debate" in cp:
                claims.extend(self._extract_debate(
                    cp["debate"], book_dir, chapter_num, chapter_id
                ))
            if "tx" in cp:
                claims.extend(self._extract_textual(
                    cp["tx"], book_dir, chapter_num, chapter_id
                ))
            if "hebtext" in cp:
                claims.extend(self._extract_hebtext(
                    cp["hebtext"], book_dir, chapter_num, chapter_id
                ))

        return claims

    # ── Section Panel Extractors ────────────────────────────────────

    def _extract_hebrew(self, panel_data, book_dir, ch_num, ch_id, sec_num):
        """Extract claims from heb panel (list of word entries)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            word = entry.get("word", "")
            translit = entry.get("transliteration", "")
            gloss = entry.get("gloss", "")
            paragraph = entry.get("paragraph", "")

            # Claim 1: The gloss itself (Tier 0/1 — checkable against Strong's)
            if gloss:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, sec_num, "heb", i * 2),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=sec_num, panel_type="heb",
                    claim_type="hebrew_greek",
                    claim_text=f"{word} ({translit}) = {gloss}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=1,
                ))

            # Claim 2: The interpretive paragraph (Tier 2 — needs more context)
            if paragraph and len(paragraph) > 50:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, sec_num, "heb", i * 2 + 1),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=sec_num, panel_type="heb",
                    claim_type="hebrew_greek",
                    claim_text=paragraph,
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    def _extract_cross_refs(self, panel_data, book_dir, ch_num, ch_id, sec_num):
        """Extract claims from cross panel (dict with refs, optional echoes)."""
        claims = []
        if not isinstance(panel_data, dict):
            return claims

        for key in ("refs", "echoes"):
            refs = panel_data.get(key, [])
            if not isinstance(refs, list):
                continue
            for i, ref_entry in enumerate(refs):
                if not isinstance(ref_entry, dict):
                    continue
                ref = ref_entry.get("ref", "")
                note = ref_entry.get("note", "")

                # Claim 1: The reference exists (Tier 0)
                if ref:
                    idx = i * 2 if key == "refs" else 100 + i * 2
                    claims.append(Claim(
                        id=_make_id(book_dir, ch_num, sec_num, "cross", idx),
                        chapter_id=ch_id, book_dir=book_dir,
                        section_num=sec_num, panel_type="cross",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

                # Claim 2: The theological connection (Tier 2)
                if note and len(note) > 30:
                    claims.append(Claim(
                        id=_make_id(book_dir, ch_num, sec_num, "cross", idx + 1),
                        chapter_id=ch_id, book_dir=book_dir,
                        section_num=sec_num, panel_type="cross",
                        claim_type="cross_reference",
                        claim_text=f"[{ref}] {note}",
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=2,
                    ))

        return claims

    def _extract_historical(self, panel_data, book_dir, ch_num, ch_id, sec_num):
        """Extract claims from hist panel (dict with historical, context, ane)."""
        claims = []
        if not isinstance(panel_data, dict):
            return claims

        idx = 0
        for key in ("historical", "context", "ane"):
            text = panel_data.get(key, "")
            if not isinstance(text, str) or len(text) < 30:
                continue
            claims.append(Claim(
                id=_make_id(book_dir, ch_num, sec_num, "hist", idx),
                chapter_id=ch_id, book_dir=book_dir,
                section_num=sec_num, panel_type="hist",
                claim_type="historical",
                claim_text=text,
                source_attribution=None,
                verse_ref=None,
                verification_tier=2,
            ))
            idx += 1

        return claims

    def _extract_scholar(self, panel_key, panel_data, book_dir, ch_num,
                         ch_id, sec_num):
        """Extract claims from a scholar panel (dict with source + notes)."""
        claims = []
        if not isinstance(panel_data, dict):
            return claims

        source = panel_data.get("source", "")
        notes = panel_data.get("notes", [])
        if not isinstance(notes, list):
            return claims

        # Parse source attribution
        attribution = _parse_source_attribution(source)

        for i, note_entry in enumerate(notes):
            if not isinstance(note_entry, dict):
                continue
            ref = note_entry.get("ref", "")
            note_text = note_entry.get("note", "")
            if not note_text or len(note_text) < 20:
                continue

            claims.append(Claim(
                id=_make_id(book_dir, ch_num, sec_num, panel_key, i),
                chapter_id=ch_id, book_dir=book_dir,
                section_num=sec_num, panel_type=panel_key,
                claim_type="scholar_attribution",
                claim_text=note_text,
                source_attribution=attribution,
                verse_ref=ref,
                verification_tier=3,
            ))

        return claims

    # ── Chapter Panel Extractors ────────────────────────────────────

    def _extract_people(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from ppl chapter panel (list of person entries)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            name = entry.get("name", "")
            role = entry.get("role", "")
            text = entry.get("text", "")

            if text and len(text) > 30:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "ppl", i),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="ppl",
                    claim_type="people_places",
                    claim_text=f"[{name} — {role}] {text}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=1,
                ))

        return claims

    def _extract_sources(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from src chapter panel (ANE source parallels)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            title = entry.get("title", "")
            quote = entry.get("quote", "")
            note = entry.get("note", "")

            text = quote or note
            if text and len(text) > 30:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "src", i),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="src",
                    claim_type="historical",
                    claim_text=f"[{title}] {text}",
                    source_attribution=title,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    def _extract_reception(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from rec chapter panel (reception history)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            who = entry.get("who", "")
            text = entry.get("text", "")

            if text and len(text) > 30:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "rec", i),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="rec",
                    claim_type="historical",
                    claim_text=f"[{who}] {text}",
                    source_attribution=who,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    def _extract_threads(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from thread chapter panel (cross-ref threads)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            anchor = entry.get("anchor", "")
            target = entry.get("target", "")
            text = entry.get("text", "")
            thread_type = entry.get("type", "")

            if target:
                # Claim 1: target ref exists (Tier 0)
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "thread", i * 2),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="thread",
                    claim_type="cross_reference",
                    claim_text=target,
                    source_attribution=None,
                    verse_ref=target,
                    verification_tier=0,
                ))

            if text and len(text) > 30:
                # Claim 2: theological connection (Tier 2)
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "thread", i * 2 + 1),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="thread",
                    claim_type="cross_reference",
                    claim_text=f"[{anchor} → {target}, {thread_type}] {text}",
                    source_attribution=None,
                    verse_ref=target,
                    verification_tier=2,
                ))

        return claims

    def _extract_debate(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from debate chapter panel (scholarly debates)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            title = entry.get("title", "")
            positions = entry.get("positions", [])

            for j, pos in enumerate(positions):
                if not isinstance(pos, dict):
                    continue
                pos_name = pos.get("name", "")
                proponents = pos.get("proponents", "")
                argument = pos.get("argument", "")

                if argument and len(argument) > 30:
                    claims.append(Claim(
                        id=_make_id(book_dir, ch_num, None, "debate",
                                    i * 10 + j),
                        chapter_id=ch_id, book_dir=book_dir,
                        section_num=None, panel_type="debate",
                        claim_type="scholar_attribution",
                        claim_text=f"[{title} — {pos_name}] {argument}",
                        source_attribution=proponents,
                        verse_ref=None,
                        verification_tier=3,
                    ))

        return claims

    def _extract_textual(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from tx chapter panel (textual criticism)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            ref = entry.get("ref", "")
            title = entry.get("title", "")
            content = entry.get("content", "")

            if content and len(content) > 30:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "tx", i),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="tx",
                    claim_type="historical",
                    claim_text=f"[{ref}: {title}] {content}",
                    source_attribution=None,
                    verse_ref=ref,
                    verification_tier=2,
                ))

        return claims

    def _extract_hebtext(self, panel_data, book_dir, ch_num, ch_id):
        """Extract claims from hebtext chapter panel (chapter-level Hebrew)."""
        claims = []
        if not isinstance(panel_data, list):
            return claims

        for i, entry in enumerate(panel_data):
            if not isinstance(entry, dict):
                continue
            word = entry.get("word", "")
            tlit = entry.get("tlit", "")
            gloss = entry.get("gloss", "")
            note = entry.get("note", "")

            if gloss:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "hebtext", i * 2),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="hebtext",
                    claim_type="hebrew_greek",
                    claim_text=f"{word} ({tlit}) = {gloss}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=1,
                ))

            if note and len(note) > 50:
                claims.append(Claim(
                    id=_make_id(book_dir, ch_num, None, "hebtext", i * 2 + 1),
                    chapter_id=ch_id, book_dir=book_dir,
                    section_num=None, panel_type="hebtext",
                    claim_type="hebrew_greek",
                    claim_text=note,
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims


# ─── Helpers ────────────────────────────────────────────────────────

def _parse_source_attribution(source_field: str) -> str:
    """Parse a source field like 'Author, Work — Type' into a clean attribution.

    Returns the 'Author, Work' part without the paraphrase type suffix.
    """
    if not source_field:
        return ""
    # Strip trailing paraphrase type marker
    for sep in (" — ", " – ", " - "):
        if sep in source_field:
            return source_field.split(sep)[0].strip()
    return source_field.strip()
