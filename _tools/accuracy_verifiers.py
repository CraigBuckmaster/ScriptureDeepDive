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
        books = json.load(open(META_DIR / "books.json"))
        for book in books:
            bid = book["id"]
            self._books[bid] = book.get("total_chapters", 0)

        # Load verse files for detailed chapter/verse bounds
        niv_dir = VERSE_DIR / "niv"
        if niv_dir.exists():
            for vf in niv_dir.glob("*.json"):
                bid = vf.stem
                verses = json.load(open(vf))
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

        # Parse patterns like "Gen 1:1", "1 John 3:16-18", "Ps 33:6,9",
        # "Gen 1:1–3", "Romans 8:28–30"
        # Pattern: optional_number? BookName chapter:verse(-verse)?
        match = re.match(
            r'^(\d\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+'
            r'(\d+)(?::(\d+)(?:\s*[–\-,]\s*(\d+))?)?',
            ref_str
        )
        if not match:
            # Try without chapter:verse (just "Genesis 1")
            match2 = re.match(r'^(\d\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)$',
                              ref_str)
            if match2:
                prefix = (match2.group(1) or "").strip()
                book_name = ((prefix + " " if prefix else "") + match2.group(2)).strip()
                chapter = int(match2.group(3))
                return self._validate_book_chapter(book_name, chapter)
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

        # Check chapter bounds
        max_ch = self._books.get(book_id, 0)
        if max_ch and chapter > max_ch:
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
            self._ot = json.load(open(STRONGS_OT_PATH))
        else:
            self._ot = {}
        if STRONGS_NT_PATH.exists():
            self._nt = json.load(open(STRONGS_NT_PATH))
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
            data = json.load(open(scholars_path))
            self._scholars = {s["panel_key"]: s for s in data}
        else:
            self._scholars = {}

        # Panel key aliases (content JSON key → scholars.json panel_key)
        self._aliases = {
            "net": "netbible",
        }
        # Also add the existing panel_keys as self-aliases
        for pk in list(self._scholars.keys()):
            self._aliases[pk] = pk

    def is_valid_panel_key(self, panel_key: str) -> bool:
        """Check if a scholar panel_key is registered (with alias support)."""
        self._load()
        resolved = self._aliases.get(panel_key, panel_key)
        return resolved in self._scholars

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
            # Check source format
            fmt_result = self.scholar_validator.check_source_format(
                claim.source_attribution or ""
            )
            if fmt_result.status == STATUS_FLAGGED:
                fmt_result.claim_id = claim.id
                fmt_result.verified_at = now
                return fmt_result

            # Check panel_key is valid
            if not self.scholar_validator.is_valid_panel_key(claim.panel_type):
                # Might be a debate panel — those use "debate" as panel_type
                if claim.panel_type not in ("debate",):
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


# ─── Combined Verifier ──────────────────────────────────────────────

class AccuracyVerifier:
    """Orchestrates verification across all available tiers."""

    def __init__(self, max_tier: int = 1):
        self.max_tier = max_tier
        self.tier0 = Tier0Verifier()
        self.tier1 = Tier1Verifier() if max_tier >= 1 else None
        self._cache = {}
        self._load_cache()

    def _load_cache(self):
        """Load cached verification results."""
        if not CACHE_DIR.exists():
            return
        for cache_file in CACHE_DIR.glob("*.json"):
            try:
                data = json.load(open(cache_file))
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
        down to 0.
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

        # Tier 2/3 — not yet implemented (Phase 3/4)
        if claim.verification_tier >= 2:
            return VerificationResult(
                claim_id=claim.id,
                status=STATUS_UNVERIFIED,
                confidence=0,
                notes=f"Requires Tier {claim.verification_tier} verification "
                      f"(API access needed)",
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
                      book_testament: str = "ot") -> list[VerificationResult]:
        """Verify a batch of claims."""
        return [self.verify_claim(c, book_testament) for c in claims]


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
