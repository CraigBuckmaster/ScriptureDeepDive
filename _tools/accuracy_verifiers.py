"""
accuracy_verifiers.py — Tiered verification engine for accuracy audit.

Tier 0: Free, local, exhaustive structural checks.
Tier 1: Local data checks against Strong's lexicon + internal meta.
Tier 2: Claude API (no web search) — PLACEHOLDER for Phase 3.
Tier 3: Claude API + web search — PLACEHOLDER for Phase 4.
"""

import json
import re
import hashlib
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from difflib import SequenceMatcher

from accuracy_config import (
    STATUS_VERIFIED, STATUS_FLAGGED, STATUS_REFUTED,
    STATUS_UNVERIFIED, STATUS_SKIPPED,
    CONTENT_DIR, VERSE_DIR, META_DIR,
    STRONGS_OT_PATH, STRONGS_NT_PATH, CACHE_DIR,
    load_book_aliases,
)
from accuracy_extractors import Claim


# ─── Data Classes ───────────────────────────────────────────────────

@dataclass
class Source:
    """A corroborating source for a verification result."""
    title: str
    author: str = ""
    type: str = "lexicon"  # primary_work | lexicon | concordance | encyclopedia | web
    reference: str = ""    # "H1254" or "pp. 5-6"
    url: str = ""
    verification_note: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class VerificationResult:
    """Result of verifying a single claim."""
    claim_id: str
    status: str = STATUS_UNVERIFIED
    confidence: int = 0
    sources: list = field(default_factory=list)
    notes: str = ""
    fix_suggestion: Optional[str] = None
    verified_at: str = ""
    tier: int = 0

    def to_dict(self) -> dict:
        d = asdict(self)
        d["sources"] = [s if isinstance(s, dict) else s.to_dict()
                        for s in self.sources]
        return d


# ─── Claim Hashing (for caching) ───────────────────────────────────

def claim_hash(claim: Claim) -> str:
    """Deterministic hash of claim content for cache keying."""
    payload = f"{claim.claim_text}|{claim.source_attribution}|{claim.panel_type}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


# ─── Verse Reference Validator ──────────────────────────────────────

class VerseIndex:
    """Index of all known verse references for Tier 0 cross-ref validation."""

    def __init__(self):
        self._books = {}        # book_id → max_chapter
        self._verses = {}       # book_id → {ch → max_verse}
        self._aliases = {}      # lowercase name/abbrev → book_id
        self._loaded = False

    def load(self):
        """Load verse data from NIV verse files + books.json."""
        if self._loaded:
            return

        # Load book metadata
        books = json.load(open(META_DIR / "books.json", encoding='utf-8'))
        for book in books:
            bid = book["id"]
            self._books[bid] = book.get("total_chapters", 0)

        # Load verse files for detailed chapter/verse bounds
        niv_dir = VERSE_DIR / "niv"
        if niv_dir.exists():
            for vf in niv_dir.glob("*.json"):
                bid = vf.stem
                verses = json.load(open(vf, encoding='utf-8'))
                ch_verses = {}
                for v in verses:
                    ch = v.get("ch", 0)
                    vn = v.get("v", 0)
                    if ch not in ch_verses or vn > ch_verses[ch]:
                        ch_verses[ch] = vn
                self._verses[bid] = ch_verses

        # Load aliases
        self._aliases = load_book_aliases()
        # Also add raw book IDs
        for bid in self._books:
            self._aliases[bid.lower()] = bid

        self._loaded = True

    def resolve_ref(self, ref_str: str) -> dict:
        """Parse a verse reference string and check if it exists.

        Returns dict with:
            valid: bool
            book_id: str or None
            chapter: int or None
            verse_start: int or None
            verse_end: int or None
            error: str or None
        """
        self.load()
        ref_str = ref_str.strip()
        if not ref_str:
            return {"valid": False, "book_id": None, "chapter": None,
                    "verse_start": None, "verse_end": None,
                    "error": "Empty reference"}

        # Strip parenthetical suffixes like "(LXX)", "(cf. Gen 26:22)"
        cleaned = re.sub(r'\s*\([^)]*\)\s*$', '', ref_str).strip()

        # Skip non-biblical source references
        NON_BIBLICAL_PREFIXES = (
            "josephus", "philo", "tacitus", "pliny", "suetonius",
            "eusebius", "mishnah", "talmud", "targum", "midrash",
        )
        if cleaned.lower().startswith(NON_BIBLICAL_PREFIXES):
            return {"valid": True, "book_id": "_nonbiblical", "chapter": None,
                    "verse_start": None, "verse_end": None, "error": None}

        # Parse patterns like "Gen 1:1", "1 John 3:16-18", "Ps 33:6,9",
        # "Gen 1:1–3", "Romans 8:28–30"
        # Pattern: optional_number? BookName chapter:verse(-verse)?
        match = re.match(
            r'^(\d\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+'
            r'(\d+)(?::(\d+)(?:\s*[–\-,]\s*(\d+))?)?',
            cleaned
        )
        if not match:
            # Try without chapter:verse (just "Genesis 1")
            match2 = re.match(r'^(\d\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)$',
                              cleaned)
            if match2:
                prefix = (match2.group(1) or "").strip()
                book_name = ((prefix + " " if prefix else "") + match2.group(2)).strip()
                chapter = int(match2.group(3))
                return self._validate_book_chapter(book_name, chapter)

            # Try book-only reference (e.g., "Ruth", "Song of Songs")
            book_only = re.match(r'^(\d\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)*)$', cleaned)
            if book_only:
                prefix = (book_only.group(1) or "").strip()
                book_name = ((prefix + " " if prefix else "") + book_only.group(2)).strip()
                book_id = self._resolve_book(book_name)
                if book_id:
                    return {"valid": True, "book_id": book_id, "chapter": None,
                            "verse_start": None, "verse_end": None, "error": None}

            # Try book range (e.g., "Matt-John")
            range_match = re.match(r'^([A-Za-z]+)\s*[-–]\s*([A-Za-z]+)$', cleaned)
            if range_match:
                book_a = self._resolve_book(range_match.group(1))
                book_b = self._resolve_book(range_match.group(2))
                if book_a and book_b:
                    return {"valid": True, "book_id": book_a, "chapter": None,
                            "verse_start": None, "verse_end": None, "error": None}

            return {"valid": False, "book_id": None, "chapter": None,
                    "verse_start": None, "verse_end": None,
                    "error": f"Cannot parse reference: {ref_str}"}

        prefix = (match.group(1) or "").strip()
        book_name = ((prefix + " " if prefix else "") + match.group(2)).strip()
        chapter = int(match.group(3))
        verse_start = int(match.group(4)) if match.group(4) else None
        verse_end = int(match.group(5)) if match.group(5) else verse_start

        # Resolve book name to ID
        book_id = self._resolve_book(book_name)
        if not book_id:
            return {"valid": False, "book_id": None, "chapter": chapter,
                    "verse_start": verse_start, "verse_end": verse_end,
                    "error": f"Unknown book: {book_name}"}

        # Non-canonical books — recognized but not in our verse DB
        if book_id == "_noncanon":
            return {"valid": True, "book_id": book_id, "chapter": chapter,
                    "verse_start": verse_start, "verse_end": verse_end,
                    "error": None}

        # Check chapter bounds
        max_ch = self._books.get(book_id, 0)
        has_variant_marker = ref_str != cleaned  # Had parenthetical like (LXX)
        if max_ch and chapter > max_ch:
            # Auto-correct single-chapter books: "Jude 11" → Jude 1:11
            if max_ch == 1 and verse_start is None:
                verse_start = chapter
                verse_end = chapter
                chapter = 1
            # LXX / variant text additions (e.g., Dan 14 = Bel and the Dragon)
            elif has_variant_marker:
                return {"valid": True, "book_id": book_id, "chapter": chapter,
                        "verse_start": verse_start, "verse_end": verse_end,
                        "error": None}
            else:
                return {"valid": False, "book_id": book_id, "chapter": chapter,
                        "verse_start": verse_start, "verse_end": verse_end,
                        "error": f"{book_name} has {max_ch} chapters, not {chapter}"}

        # Check verse bounds if we have verse data
        if verse_start and book_id in self._verses:
            ch_verses = self._verses[book_id]
            max_v = ch_verses.get(chapter, 0)
            if max_v and verse_start > max_v:
                return {"valid": False, "book_id": book_id, "chapter": chapter,
                        "verse_start": verse_start, "verse_end": verse_end,
                        "error": f"{book_name} {chapter} has {max_v} verses, "
                                 f"not {verse_start}"}

        return {"valid": True, "book_id": book_id, "chapter": chapter,
                "verse_start": verse_start, "verse_end": verse_end,
                "error": None}

    def _resolve_book(self, name: str) -> Optional[str]:
        """Resolve a book name or abbreviation to a book_id."""
        key = name.lower().strip()
        if key in self._aliases:
            return self._aliases[key]
        # Try fuzzy match for common variants
        for alias, bid in self._aliases.items():
            if key.startswith(alias) or alias.startswith(key):
                return bid
        return None

    def _validate_book_chapter(self, book_name, chapter):
        book_id = self._resolve_book(book_name)
        if not book_id:
            return {"valid": False, "book_id": None, "chapter": chapter,
                    "verse_start": None, "verse_end": None,
                    "error": f"Unknown book: {book_name}"}
        max_ch = self._books.get(book_id, 0)
        if max_ch and chapter > max_ch:
            # Auto-correct single-chapter books
            if max_ch == 1:
                return {"valid": True, "book_id": book_id, "chapter": 1,
                        "verse_start": chapter, "verse_end": chapter, "error": None}
            return {"valid": False, "book_id": book_id, "chapter": chapter,
                    "verse_start": None, "verse_end": None,
                    "error": f"{book_name} has {max_ch} chapters, not {chapter}"}
        return {"valid": True, "book_id": book_id, "chapter": chapter,
                "verse_start": None, "verse_end": None, "error": None}


# ─── Strong's Lexicon Lookup ────────────────────────────────────────

class StrongsLookup:
    """Lookup Hebrew/Greek words against Strong's Concordance data."""

    def __init__(self):
        self._ot = None
        self._nt = None

    def _load(self):
        if self._ot is not None:
            return
        if STRONGS_OT_PATH.exists():
            self._ot = json.load(open(STRONGS_OT_PATH, encoding='utf-8'))
        else:
            self._ot = {}
        if STRONGS_NT_PATH.exists():
            self._nt = json.load(open(STRONGS_NT_PATH, encoding='utf-8'))
        else:
            self._nt = {}
        # Build reverse lookup: normalized word → Strong's number
        self._word_to_id_ot = {}
        for sid, entry in self._ot.items():
            w = entry.get("word", "")
            if w:
                norm = _normalize_hebrew(w)
                self._word_to_id_ot[norm] = sid
                # Also store original for direct match
                self._word_to_id_ot[w] = sid
        self._word_to_id_nt = {}
        for sid, entry in self._nt.items():
            w = entry.get("word", "")
            if w:
                norm = _normalize_hebrew(w)  # Works for Greek diacritics too
                self._word_to_id_nt[norm] = sid
                self._word_to_id_nt[w] = sid

    def lookup_word(self, word: str, testament: str = "ot") -> Optional[dict]:
        """Look up a Hebrew/Greek word and return its Strong's entry.

        Args:
            word: The Hebrew/Greek word (Unicode)
            testament: "ot" or "nt"

        Returns:
            Strong's entry dict or None if not found.
        """
        self._load()
        word_map = self._word_to_id_ot if testament == "ot" else self._word_to_id_nt
        entries = self._ot if testament == "ot" else self._nt

        # Direct match
        sid = word_map.get(word)
        if sid:
            entry = entries[sid].copy()
            entry["strongs_id"] = sid
            return entry

        # Normalized match (strips vowels, decomposes presentation forms)
        norm = _normalize_hebrew(word)
        sid = word_map.get(norm)
        if sid:
            entry = entries[sid].copy()
            entry["strongs_id"] = sid
            return entry

        # Try stripping one prefix (ב, ל, מ, ה, ו, כ, ש)
        stripped = _strip_hebrew_prefix(norm)
        if stripped != norm:
            sid = word_map.get(stripped)
            if sid:
                entry = entries[sid].copy()
                entry["strongs_id"] = sid
                return entry

        return None

    def check_gloss(self, word: str, claimed_gloss: str,
                    testament: str = "ot") -> VerificationResult:
        """Check if a claimed gloss matches Strong's definition.

        Returns a VerificationResult with status and confidence.
        """
        self._load()
        entry = self.lookup_word(word, testament)

        if entry is None:
            return VerificationResult(
                claim_id="",
                status=STATUS_UNVERIFIED,
                confidence=30,
                notes=f"Word '{word}' not found in Strong's {testament.upper()} lexicon. "
                      f"May be a phrase, rare form, or prefixed variant. Needs Tier 2 review.",
                tier=1,
            )

        strongs_def = entry.get("strongs_def", "").lower()
        kjv_usage = entry.get("kjv_usage", "").lower()
        strongs_gloss = entry.get("gloss", "").lower()
        claimed_lower = claimed_gloss.lower().strip()

        # Extract just the gloss part (before any parenthetical or explanatory text)
        claimed_core = re.split(r'[;(—–\-]', claimed_lower)[0].strip()

        # Check if claimed gloss appears in Strong's definition or KJV usage
        if (claimed_core in strongs_def or
            claimed_core in kjv_usage or
            claimed_core in strongs_gloss):
            return VerificationResult(
                claim_id="",
                status=STATUS_VERIFIED,
                confidence=90,
                sources=[Source(
                    title="Strong's Concordance",
                    type="lexicon",
                    reference=entry.get("strongs_id", ""),
                    verification_note=f"Gloss matches Strong's: {entry.get('gloss', '')}",
                )],
                notes="Gloss confirmed by Strong's Concordance",
                tier=1,
            )

        # Fuzzy match
        sim = _gloss_similarity(claimed_core, strongs_def)
        sim2 = _gloss_similarity(claimed_core, strongs_gloss)
        best_sim = max(sim, sim2)

        if best_sim > 0.5:
            return VerificationResult(
                claim_id="",
                status=STATUS_VERIFIED,
                confidence=int(60 + best_sim * 30),
                sources=[Source(
                    title="Strong's Concordance",
                    type="lexicon",
                    reference=entry.get("strongs_id", ""),
                    verification_note=(
                        f"Gloss partially matches Strong's "
                        f"(similarity: {best_sim:.0%}). "
                        f"Strong's: {entry.get('gloss', '')}"
                    ),
                )],
                notes="Gloss is broadly consistent with Strong's",
                tier=1,
            )

        # No match — defer to Tier 2 rather than flagging
        # (contextual glosses legitimately differ from Strong's lexical definitions)
        return VerificationResult(
            claim_id="",
            status=STATUS_UNVERIFIED,
            confidence=50,
            sources=[Source(
                title="Strong's Concordance",
                type="lexicon",
                reference=entry.get("strongs_id", ""),
                verification_note=(
                    f"Claimed gloss '{claimed_gloss}' differs from "
                    f"Strong's definition: '{entry.get('gloss', '')}'. "
                    f"Contextual gloss may be valid — needs Tier 2 review."
                ),
            )],
            notes=(
                f"Word found in Strong's ({entry.get('strongs_id', '')}) but "
                f"gloss does not match lexical definition. Deferred to Tier 2."
            ),
            tier=1,
        )


# ─── Scholar Registry Validator ─────────────────────────────────────

class ScholarValidator:
    """Validate scholar panel keys and source attributions."""

    def __init__(self):
        self._scholars = None

    def _load(self):
        if self._scholars is not None:
            return
        scholars_path = META_DIR / "scholars.json"
        if scholars_path.exists():
            data = json.load(open(scholars_path, encoding='utf-8'))
            self._scholars = {s["panel_key"]: s for s in data}
        else:
            self._scholars = {}

        # Panel key aliases (content JSON key → scholars.json panel_key)
        self._aliases = {
            "net": "netbible",
            "netbible": "net",
            "mar": "marcus",
            "cat": "catena",
            "catena": "cat",
            "rho": "rhoads",
            # These scholars exist in content but not yet in scholars.json
            # They self-alias so the validator doesn't flag them as unknown
            "lane": "lane",
            "cockerill": "cockerill",
            "yarbrough": "yarbrough",
            "kruse": "kruse",
            "mccartney": "mccartney",
            "davids": "davids",
            "green": "green",
            "thiselton": "thiselton",
            "beale": "beale",
            "osborne": "osborne",
            "mounce": "mounce",
            "towner": "towner",
            "harris": "harris",
            "wanamaker": "wanamaker",
            "obrien": "obrien",
            "bruce": "bruce",
            "lincoln": "lincoln",
            "silva": "silva",
        }
        # Also add the existing panel_keys as self-aliases
        for pk in list(self._scholars.keys()):
            self._aliases[pk] = pk

    def is_valid_panel_key(self, panel_key: str) -> bool:
        """Check if a scholar panel_key is registered or aliased."""
        self._load()
        # Known alias (including unregistered-but-known scholars)
        if panel_key in self._aliases:
            return True
        # Direct match in registry
        return panel_key in self._scholars

    def get_scholar_info(self, panel_key: str) -> Optional[dict]:
        """Get scholar metadata by panel_key (with alias support)."""
        self._load()
        resolved = self._aliases.get(panel_key, panel_key)
        return self._scholars.get(resolved)

    def check_source_format(self, source_field: str) -> VerificationResult:
        """Check if a source attribution follows the expected format.

        Accepted formats:
        - "Author Name, Work Title — Paraphrase Type"
        - "Author Name, Work Title — Type"
        - "Work Title — Type" (e.g., "MacArthur Study Bible — Faithful Paraphrase")
        - "Work Title -- Type" (legacy double-dash)
        """
        if not source_field:
            return VerificationResult(
                claim_id="", status=STATUS_FLAGGED, confidence=0,
                notes="Missing source attribution field", tier=0,
            )

        # Check for the standard format: has some kind of separator
        has_separator = any(sep in source_field for sep in (" — ", " – ", " - ", " -- "))

        if has_separator and len(source_field) > 10:
            return VerificationResult(
                claim_id="", status=STATUS_SKIPPED, confidence=100,
                notes="Source field format is valid", tier=0,
            )

        # Accept well-known short forms without separator
        if len(source_field) > 10:
            return VerificationResult(
                claim_id="", status=STATUS_SKIPPED, confidence=80,
                notes="Source field present (non-standard format)", tier=0,
            )

        return VerificationResult(
            claim_id="", status=STATUS_FLAGGED, confidence=50,
            notes=f"Non-standard source format: '{source_field}'", tier=0,
        )


# ─── Tier 0 Verifier ───────────────────────────────────────────────

class Tier0Verifier:
    """Free, local, exhaustive structural checks."""

    def __init__(self):
        self.verse_index = VerseIndex()
        self.scholar_validator = ScholarValidator()

    def verify(self, claim: Claim) -> VerificationResult:
        """Run Tier 0 checks on a claim.

        Returns VerificationResult or None if this tier doesn't apply.
        """
        now = datetime.now(timezone.utc).isoformat()

        if claim.claim_type == "cross_reference" and claim.verification_tier == 0:
            # Check if the reference exists
            result = self.verse_index.resolve_ref(claim.claim_text)
            if result["valid"]:
                return VerificationResult(
                    claim_id=claim.id,
                    status=STATUS_SKIPPED,
                    confidence=100,
                    notes=f"Reference validated: {claim.claim_text}",
                    verified_at=now,
                    tier=0,
                )
            else:
                return VerificationResult(
                    claim_id=claim.id,
                    status=STATUS_FLAGGED,
                    confidence=20,
                    notes=f"Invalid reference: {result['error']}",
                    verified_at=now,
                    tier=0,
                )

        if claim.claim_type == "scholar_attribution":
            # Meta panel types are not scholar panel_keys — exempt from structural checks
            META_PANEL_TYPES = {
                "debate", "scholar_bio", "debate_topic", "difficult_passage",
                "book_intro", "prophecy_chain", "concept", "topic",
                "word_study", "timeline", "synoptic", "place",
                "map_story", "cross_ref_thread", "cross_ref_pair", "people",
            }
            is_meta = claim.panel_type in META_PANEL_TYPES

            # Check source format — exempt known scholars and meta panels
            source = claim.source_attribution or ""
            is_known_scholar = self.scholar_validator.is_valid_panel_key(claim.panel_type)

            skip_source_check = False
            if not source and (is_known_scholar or is_meta):
                skip_source_check = True  # Known scholar or meta, empty source
            elif is_meta and source and len(source) < 15:
                skip_source_check = True  # Short-form proponent in meta
            elif is_known_scholar and source == claim.panel_type:
                skip_source_check = True  # Source is just the panel_key (data quality, not accuracy)
            elif is_known_scholar and not source:
                skip_source_check = True  # Known scholar, missing source

            if not skip_source_check:
                fmt_result = self.scholar_validator.check_source_format(source)
                if fmt_result.status == STATUS_FLAGGED:
                    fmt_result.claim_id = claim.id
                    fmt_result.verified_at = now
                    return fmt_result

            # Check panel_key is valid (skip for meta panel types)
            if not is_meta and not self.scholar_validator.is_valid_panel_key(claim.panel_type):
                    return VerificationResult(
                        claim_id=claim.id,
                        status=STATUS_FLAGGED,
                        confidence=30,
                        notes=f"Unknown scholar panel_key: {claim.panel_type}",
                        verified_at=now,
                        tier=0,
                    )

        return None  # Tier 0 doesn't apply to this claim


# ─── Tier 1 Verifier ───────────────────────────────────────────────

class Tier1Verifier:
    """Local data checks against Strong's lexicon and internal meta."""

    def __init__(self):
        self.strongs = StrongsLookup()

    def verify(self, claim: Claim, book_testament: str = "ot") -> VerificationResult:
        """Run Tier 1 checks on a claim.

        Returns VerificationResult or None if this tier doesn't apply.
        """
        now = datetime.now(timezone.utc).isoformat()

        if claim.claim_type == "hebrew_greek" and claim.verification_tier <= 1:
            # Parse the claim text to extract word and gloss
            parsed = _parse_hebrew_claim(claim.claim_text)
            if parsed:
                word, gloss = parsed
                result = self.strongs.check_gloss(word, gloss, book_testament)
                result.claim_id = claim.id
                result.verified_at = now
                return result

        return None  # Tier 1 doesn't apply to this claim


# ─── Tier 2 Verifier (Claude API, no web search) ───────────────────

class Tier2Verifier:
    """Claude API verification using training knowledge (no web search).

    Batches 8-10 claims per call for cost efficiency. Used for historical
    dates, Hebrew interpretive claims, timeline accuracy, people/places
    facts, and theological connections.
    """

    BATCH_SIZE = 8

    SYSTEM_PROMPT = (
        "You are a biblical studies fact-checker with expertise in ANE history, "
        "Hebrew/Greek linguistics, textual criticism, and biblical scholarship.\n\n"
        "You will receive a batch of claims from a Bible study app. For each claim, "
        "assess whether it is factually accurate based on your knowledge.\n\n"
        "Respond ONLY with a JSON array (no markdown fences, no preamble):\n"
        "[\n"
        '  {"claim_index": 1, "status": "VERIFIED"|"FLAGGED"|"REFUTED", '
        '"confidence": 0-100, "notes": "brief explanation", '
        '"fix_suggestion": "correction if REFUTED, null otherwise"}\n'
        "]\n\n"
        "Rules:\n"
        "- VERIFIED = you are confident this is factually correct\n"
        "- FLAGGED = you are not confident enough to confirm\n"
        "- REFUTED = this contradicts established scholarship or known facts\n"
        "- Be aggressive about flagging. When in doubt, FLAGGED.\n"
        "- For REFUTED claims, always provide a fix_suggestion with the correct information.\n"
        "- Keep notes concise (1-2 sentences)."
    )

    def __init__(self):
        self._api_key = None
        self._call_count = 0
        self._max_calls = 5000  # Safety cap

    def _get_api_key(self):
        if self._api_key is None:
            from accuracy_config import load_api_key
            self._api_key = load_api_key()
        return self._api_key

    def is_available(self) -> bool:
        """Check if Tier 2 is available (API key configured)."""
        return bool(self._get_api_key())

    def verify_batch(self, claims: list[Claim], book_name: str = "",
                     chapter_num: int = 0) -> list[VerificationResult]:
        """Verify a batch of claims via Claude API.

        Args:
            claims: List of claims to verify (max BATCH_SIZE)
            book_name: Human-readable book name for context
            chapter_num: Chapter number for context

        Returns:
            List of VerificationResult, one per claim.
        """
        if not claims:
            return []

        api_key = self._get_api_key()
        if not api_key:
            now = datetime.now(timezone.utc).isoformat()
            return [VerificationResult(
                claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                notes="Tier 2 unavailable: no API key configured",
                verified_at=now, tier=2,
            ) for c in claims]

        if self._call_count >= self._max_calls:
            now = datetime.now(timezone.utc).isoformat()
            return [VerificationResult(
                claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                notes=f"Tier 2 call limit reached ({self._max_calls})",
                verified_at=now, tier=2,
            ) for c in claims]

        # Build the prompt
        numbered = []
        for i, claim in enumerate(claims, 1):
            ctx = f"[{claim.claim_type}]"
            if claim.source_attribution:
                ctx += f" Source: {claim.source_attribution}"
            if claim.verse_ref:
                ctx += f" Ref: {claim.verse_ref}"
            numbered.append(f"{i}. {ctx}\n   \"{claim.claim_text[:500]}\"")

        user_msg = (
            f"CLAIMS from {book_name} chapter {chapter_num}:\n\n"
            + "\n\n".join(numbered)
        )

        # Call the API
        try:
            import urllib.request
            import time

            body = json.dumps({
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2000,
                "system": self.SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": user_msg}],
            })

            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=body.encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                },
                method="POST",
            )

            # Rate limiting: simple delay
            time.sleep(1.2)  # ~50 RPM

            # Retry with backoff for transient network errors
            last_err = None
            for attempt in range(3):
                try:
                    with urllib.request.urlopen(req, timeout=90) as resp:
                        result = json.load(resp)
                    break
                except (urllib.error.URLError, OSError, TimeoutError) as e:
                    last_err = e
                    if attempt < 2:
                        time.sleep(2 ** (attempt + 1))
            else:
                raise last_err

            self._call_count += 1

            # Extract text response
            text_parts = [
                block.get("text", "")
                for block in result.get("content", [])
                if block.get("type") == "text"
            ]
            response_text = "\n".join(text_parts).strip()

            # Parse JSON response
            # Strip markdown fences if present
            cleaned = response_text
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```\w*\n?', '', cleaned)
                cleaned = re.sub(r'\n?```$', '', cleaned)
            cleaned = cleaned.strip()

            verdicts = json.loads(cleaned)

        except (json.JSONDecodeError, urllib.error.URLError, Exception) as e:
            now = datetime.now(timezone.utc).isoformat()
            return [VerificationResult(
                claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                notes=f"Tier 2 API error: {str(e)[:100]}",
                verified_at=now, tier=2,
            ) for c in claims]

        # Map verdicts back to claims
        now = datetime.now(timezone.utc).isoformat()
        results = []
        for i, claim in enumerate(claims):
            idx = i + 1
            verdict = None
            for v in verdicts:
                if v.get("claim_index") == idx:
                    verdict = v
                    break

            if verdict is None:
                results.append(VerificationResult(
                    claim_id=claim.id, status=STATUS_UNVERIFIED, confidence=0,
                    notes="No verdict returned for this claim",
                    verified_at=now, tier=2,
                ))
                continue

            status = verdict.get("status", STATUS_UNVERIFIED)
            if status not in (STATUS_VERIFIED, STATUS_FLAGGED, STATUS_REFUTED):
                status = STATUS_UNVERIFIED

            fix = verdict.get("fix_suggestion")
            if fix == "null" or fix is None:
                fix = None

            results.append(VerificationResult(
                claim_id=claim.id,
                status=status,
                confidence=verdict.get("confidence", 50),
                notes=verdict.get("notes", ""),
                fix_suggestion=fix if status == STATUS_REFUTED else None,
                verified_at=now,
                tier=2,
            ))

        return results

    def verify_claims_batched(self, claims: list[Claim],
                              book_name: str = "",
                              chapter_num: int = 0) -> list[VerificationResult]:
        """Verify claims in batches of BATCH_SIZE."""
        all_results = []
        for i in range(0, len(claims), self.BATCH_SIZE):
            batch = claims[i:i + self.BATCH_SIZE]
            try:
                results = self.verify_batch(batch, book_name, chapter_num)
            except (KeyboardInterrupt, SystemExit):
                raise
            except Exception as e:
                now = datetime.now(timezone.utc).isoformat()
                results = [VerificationResult(
                    claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                    notes=f"Tier 2 batch error: {str(e)[:100]}",
                    verified_at=now, tier=2,
                ) for c in batch]
            all_results.extend(results)
        return all_results

    @property
    def call_count(self) -> int:
        return self._call_count


# ─── Tier 3 Verifier (Claude API + Web Search) ─────────────────────

class Tier3Verifier:
    """Claude API with web search for scholar attribution verification.

    Verifies claimed scholar positions against published works using
    web search to find corroborating sources. One API call per scholar
    panel (all notes for one scholar grouped together).
    """

    SYSTEM_PROMPT = (
        "You are a biblical scholarship fact-checker with access to web search.\n\n"
        "I will provide a scholar attribution from a Bible study app — a specific "
        "claim about what a named scholar argues in their published work. Your job "
        "is to verify whether this accurately represents the scholar's position.\n\n"
        "Instructions:\n"
        "1. Search for the scholar's actual published position on this passage.\n"
        "2. Compare the claimed position to what the scholar actually wrote.\n"
        "3. Provide specific source references (book title, page numbers, edition).\n\n"
        "Respond ONLY with a JSON array (no markdown fences, no preamble). "
        "One object per claim:\n"
        "[\n"
        '  {"claim_index": 1, "status": "VERIFIED"|"FLAGGED"|"REFUTED", '
        '"confidence": 0-100, '
        '"sources": [{"title": "...", "author": "...", "reference": "page/section", '
        '"url": "...", "note": "how this supports the verdict"}], '
        '"notes": "explanation", '
        '"fix_suggestion": "if REFUTED, what should the claim say instead"}\n'
        "]\n\n"
        "Rules:\n"
        "- VERIFIED: You found corroborating evidence in the scholar's published work.\n"
        "- FLAGGED: You cannot confirm. Do NOT assume accuracy.\n"
        "- REFUTED: The claim contradicts the scholar's known, published position.\n"
        "- Be aggressive about flagging. When in doubt, FLAGGED.\n"
        "- Always provide at least one source with a specific reference.\n"
        "- For REFUTED claims, always provide a fix_suggestion."
    )

    def __init__(self):
        self._api_key = None
        self._call_count = 0
        self._max_calls = 2000

    def _get_api_key(self):
        if self._api_key is None:
            from accuracy_config import load_api_key
            self._api_key = load_api_key()
        return self._api_key

    def is_available(self) -> bool:
        return bool(self._get_api_key())

    def verify_scholar_panel(self, claims: list[Claim],
                             source_attribution: str = "",
                             book_name: str = "",
                             chapter_num: int = 0) -> list[VerificationResult]:
        """Verify a batch of claims from one scholar panel via API + web search.

        All claims should be from the same scholar/source for optimal batching.
        """
        if not claims:
            return []

        api_key = self._get_api_key()
        now = datetime.now(timezone.utc).isoformat()

        if not api_key:
            return [VerificationResult(
                claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                notes="Tier 3 unavailable: no API key",
                verified_at=now, tier=3,
            ) for c in claims]

        if self._call_count >= self._max_calls:
            return [VerificationResult(
                claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                notes=f"Tier 3 call limit reached ({self._max_calls})",
                verified_at=now, tier=3,
            ) for c in claims]

        # Build prompt with all notes from this scholar panel
        numbered = []
        for i, claim in enumerate(claims, 1):
            ref_ctx = f" (verse {claim.verse_ref})" if claim.verse_ref else ""
            numbered.append(f"{i}. {claim.claim_text[:500]}{ref_ctx}")

        user_msg = (
            f"SCHOLAR: {source_attribution}\n"
            f"BOOK/CHAPTER: {book_name} {chapter_num}\n\n"
            f"CLAIMED POSITIONS ({len(claims)} claims):\n\n"
            + "\n\n".join(numbered)
        )

        try:
            import urllib.request
            import time

            body = json.dumps({
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4000,
                "system": self.SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": user_msg}],
                "tools": [{"type": "web_search_20250305", "name": "web_search"}],
            })

            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=body.encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                },
                method="POST",
            )

            time.sleep(2.0)  # ~30 RPM for web search calls

            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.load(resp)

            self._call_count += 1

            # Extract text response (may include tool_use blocks)
            text_parts = [
                block.get("text", "")
                for block in result.get("content", [])
                if block.get("type") == "text"
            ]
            response_text = "\n".join(text_parts).strip()

            # Parse JSON response
            cleaned = response_text
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```\w*\n?', '', cleaned)
                cleaned = re.sub(r'\n?```$', '', cleaned)
            cleaned = cleaned.strip()

            # Find the JSON array in the response
            json_start = cleaned.find('[')
            json_end = cleaned.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                cleaned = cleaned[json_start:json_end]

            verdicts = json.loads(cleaned)

        except (json.JSONDecodeError, urllib.error.URLError, Exception) as e:
            return [VerificationResult(
                claim_id=c.id, status=STATUS_UNVERIFIED, confidence=0,
                notes=f"Tier 3 API error: {str(e)[:100]}",
                verified_at=now, tier=3,
            ) for c in claims]

        # Map verdicts to claims
        results = []
        for i, claim in enumerate(claims):
            idx = i + 1
            verdict = None
            for v in verdicts:
                if v.get("claim_index") == idx:
                    verdict = v
                    break

            if verdict is None:
                results.append(VerificationResult(
                    claim_id=claim.id, status=STATUS_UNVERIFIED, confidence=0,
                    notes="No verdict returned", verified_at=now, tier=3,
                ))
                continue

            status = verdict.get("status", STATUS_UNVERIFIED)
            if status not in (STATUS_VERIFIED, STATUS_FLAGGED, STATUS_REFUTED):
                status = STATUS_UNVERIFIED

            # Parse sources
            sources = []
            for src in verdict.get("sources", []):
                if isinstance(src, dict):
                    sources.append(Source(
                        title=src.get("title", ""),
                        author=src.get("author", ""),
                        type="web" if src.get("url") else "primary_work",
                        reference=src.get("reference", ""),
                        url=src.get("url", ""),
                        verification_note=src.get("note", ""),
                    ))

            fix = verdict.get("fix_suggestion")
            if fix in ("null", None, ""):
                fix = None

            results.append(VerificationResult(
                claim_id=claim.id,
                status=status,
                confidence=verdict.get("confidence", 50),
                sources=sources,
                notes=verdict.get("notes", ""),
                fix_suggestion=fix if status == STATUS_REFUTED else None,
                verified_at=now,
                tier=3,
            ))

        return results

    @property
    def call_count(self) -> int:
        return self._call_count


# ─── Combined Verifier ──────────────────────────────────────────────

class AccuracyVerifier:
    """Orchestrates verification across all available tiers."""

    def __init__(self, max_tier: int = 1):
        self.max_tier = max_tier
        self.tier0 = Tier0Verifier()
        self.tier1 = Tier1Verifier() if max_tier >= 1 else None
        self.tier2 = Tier2Verifier() if max_tier >= 2 else None
        self.tier3 = Tier3Verifier() if max_tier >= 3 else None
        self._cache = {}
        self._load_cache()

    def _load_cache(self):
        """Load cached verification results."""
        if not CACHE_DIR.exists():
            return
        for cache_file in CACHE_DIR.glob("*.json"):
            try:
                data = json.load(open(cache_file, encoding='utf-8'))
                self._cache[cache_file.stem] = data
            except (json.JSONDecodeError, IOError):
                continue

    def _save_to_cache(self, chash: str, result: VerificationResult):
        """Save a verification result to cache."""
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cache_path = CACHE_DIR / f"{chash}.json"
        cache_path.write_text(json.dumps(result.to_dict(), indent=1))
        self._cache[chash] = result.to_dict()

    def verify_claim(self, claim: Claim, book_testament: str = "ot") -> VerificationResult:
        """Verify a single claim using the highest applicable tier.

        Checks cache first. Falls through tiers from highest available
        down to 0. Note: Tier 2 uses batch API — single-claim calls are
        inefficient. Prefer verify_claims() for Tier 2.
        """
        # Check cache
        chash = claim_hash(claim)
        if chash in self._cache:
            cached = self._cache[chash]
            return VerificationResult(**{
                k: v for k, v in cached.items()
                if k in VerificationResult.__dataclass_fields__
            })

        now = datetime.now(timezone.utc).isoformat()

        # Tier 0 — always runs
        result = self.tier0.verify(claim)
        if result and result.status != STATUS_UNVERIFIED:
            self._save_to_cache(chash, result)
            return result

        # Tier 1 — if available
        if self.tier1 and claim.verification_tier <= 1:
            result = self.tier1.verify(claim, book_testament)
            if result and result.status != STATUS_UNVERIFIED:
                self._save_to_cache(chash, result)
                return result

        # Tier 2 — single claim (inefficient, use verify_claims for batching)
        if self.tier2 and claim.verification_tier <= 2 and self.tier2.is_available():
            results = self.tier2.verify_batch([claim])
            if results and results[0].status != STATUS_UNVERIFIED:
                self._save_to_cache(chash, results[0])
                return results[0]

        # Tier 3 — scholar attribution via web search
        if self.tier3 and claim.verification_tier <= 3 and self.tier3.is_available():
            results = self.tier3.verify_scholar_panel([claim], claim.source_attribution or "")
            if results and results[0].status != STATUS_UNVERIFIED:
                self._save_to_cache(chash, results[0])
                return results[0]

        # Claims that need higher tiers than available
        if claim.verification_tier > self.max_tier:
            return VerificationResult(
                claim_id=claim.id,
                status=STATUS_UNVERIFIED,
                confidence=0,
                notes=f"Requires Tier {claim.verification_tier} (max available: {self.max_tier})",
                verified_at=now,
                tier=claim.verification_tier,
            )

        # Default: unverified
        return VerificationResult(
            claim_id=claim.id,
            status=STATUS_UNVERIFIED,
            confidence=0,
            notes="No applicable verification tier",
            verified_at=now,
            tier=0,
        )

    def verify_claims(self, claims: list[Claim],
                      book_testament: str = "ot",
                      book_name: str = "",
                      chapter_num: int = 0) -> list[VerificationResult]:
        """Verify a batch of claims with efficient Tier 2 batching.

        Claims are first processed through Tier 0+1 individually.
        Remaining unverified Tier 2 claims are batched for API calls.
        """
        results = []
        tier2_queue = []
        tier2_indices = []
        tier3_queue = []
        tier3_indices = []

        for i, claim in enumerate(claims):
            # Check cache first
            chash = claim_hash(claim)
            if chash in self._cache:
                cached = self._cache[chash]
                results.append(VerificationResult(**{
                    k: v for k, v in cached.items()
                    if k in VerificationResult.__dataclass_fields__
                }))
                continue

            now = datetime.now(timezone.utc).isoformat()

            # Tier 0
            result = self.tier0.verify(claim)
            if result and result.status != STATUS_UNVERIFIED:
                self._save_to_cache(chash, result)
                results.append(result)
                continue

            # Tier 1
            if self.tier1 and claim.verification_tier <= 1:
                result = self.tier1.verify(claim, book_testament)
                if result and result.status != STATUS_UNVERIFIED:
                    self._save_to_cache(chash, result)
                    results.append(result)
                    continue

            # Queue for Tier 2 if applicable
            if (self.tier2 and claim.verification_tier <= 2
                    and self.tier2.is_available()):
                results.append(None)  # Placeholder
                tier2_queue.append(claim)
                tier2_indices.append(len(results) - 1)
            # Queue for Tier 3 if applicable
            elif (self.tier3 and claim.verification_tier <= 3
                    and self.tier3.is_available()):
                results.append(None)  # Placeholder
                tier3_queue.append(claim)
                tier3_indices.append(len(results) - 1)
            else:
                results.append(VerificationResult(
                    claim_id=claim.id,
                    status=STATUS_UNVERIFIED,
                    confidence=0,
                    notes=(f"Requires Tier {claim.verification_tier} "
                           f"(max available: {self.max_tier})"
                           if claim.verification_tier > self.max_tier
                           else "No applicable verification tier"),
                    verified_at=now,
                    tier=claim.verification_tier,
                ))

        # Process Tier 2 batch
        if tier2_queue and self.tier2:
            t2_results = self.tier2.verify_claims_batched(
                tier2_queue, book_name, chapter_num
            )
            for idx, result in zip(tier2_indices, t2_results):
                chash = claim_hash(tier2_queue[tier2_indices.index(idx)])
                if result.status != STATUS_UNVERIFIED:
                    self._save_to_cache(chash, result)
                results[idx] = result

        # Process Tier 3 batch — group by source for efficient API calls
        if tier3_queue and self.tier3:
            # Group by source_attribution
            source_groups = {}
            for idx, claim in zip(tier3_indices, tier3_queue):
                source = claim.source_attribution or claim.panel_type
                if source not in source_groups:
                    source_groups[source] = ([], [])
                source_groups[source][0].append(claim)
                source_groups[source][1].append(idx)

            for source, (group_claims, group_indices) in source_groups.items():
                t3_results = self.tier3.verify_scholar_panel(
                    group_claims, source, book_name, chapter_num
                )
                for idx, result in zip(group_indices, t3_results):
                    q_idx = tier3_indices.index(idx)
                    chash = claim_hash(tier3_queue[q_idx])
                    if result.status != STATUS_UNVERIFIED:
                        self._save_to_cache(chash, result)
                    results[idx] = result

        return results


# ─── Helper Functions ───────────────────────────────────────────────

def _normalize_hebrew(text: str) -> str:
    """Normalize Hebrew text for matching.

    1. NFKD decompose presentation forms (U+FB1D–FB4F → base + combining)
    2. Strip all cantillation marks (U+0591–U+05AF)
    3. Strip all vowel points / dagesh / marks (U+05B0–U+05C7)
    4. Result: consonant-only base form
    """
    import unicodedata
    decomposed = unicodedata.normalize("NFKD", text)
    return re.sub(r'[\u0591-\u05C7]', '', decomposed)


# Common Hebrew prepositional prefixes (single-letter particles)
_HEBREW_PREFIXES = "בלמהוכש"


def _strip_hebrew_prefix(consonants: str) -> str:
    """Strip one common prepositional prefix from consonantal Hebrew.

    Only strips if the remaining word is at least 2 consonants.
    """
    if len(consonants) >= 3 and consonants[0] in _HEBREW_PREFIXES:
        return consonants[1:]
    return consonants


def _gloss_similarity(claimed: str, reference: str) -> float:
    """Compute similarity between claimed and reference glosses.

    Uses word overlap plus SequenceMatcher for partial matching.
    """
    if not claimed or not reference:
        return 0.0

    # Word-level overlap
    claimed_words = set(re.findall(r'\w+', claimed.lower()))
    ref_words = set(re.findall(r'\w+', reference.lower()))

    if not claimed_words or not ref_words:
        return 0.0

    # Remove stopwords
    stopwords = {"a", "an", "the", "to", "of", "in", "and", "or", "is",
                 "was", "be", "by", "for", "with", "from", "as", "at",
                 "on", "it", "its", "i.e", "i.e."}
    claimed_words -= stopwords
    ref_words -= stopwords

    if not claimed_words:
        return 0.0

    overlap = len(claimed_words & ref_words)
    jaccard = overlap / len(claimed_words | ref_words) if (claimed_words | ref_words) else 0

    # Also use SequenceMatcher for substring-level similarity
    seq_sim = SequenceMatcher(None, claimed.lower(), reference.lower()).ratio()

    return max(jaccard, seq_sim)


def _parse_hebrew_claim(claim_text: str) -> Optional[tuple[str, str]]:
    """Parse a Hebrew claim like 'בָּרָא (bara) = to create' into (word, gloss).

    Returns (word, gloss) or None if unparsable.
    """
    # Pattern: HebrewWord (transliteration) = gloss
    match = re.match(r'^([\u0590-\u05FF\uFB1D-\uFB4F]+)\s*\([^)]+\)\s*=\s*(.+)$',
                     claim_text)
    if match:
        return match.group(1).strip(), match.group(2).strip()

    # Pattern: GreekWord (transliteration) = gloss
    match = re.match(r'^([\u0370-\u03FF\u1F00-\u1FFF]+)\s*\([^)]+\)\s*=\s*(.+)$',
                     claim_text)
    if match:
        return match.group(1).strip(), match.group(2).strip()

    return None
