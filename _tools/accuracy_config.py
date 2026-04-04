"""
accuracy_config.py — Configuration for the accuracy audit system.

Weights, thresholds, panel type classifications, and prompt templates.
"""

import os
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent
TOOLS_DIR = ROOT / "_tools"
CONTENT_DIR = ROOT / "content"
VERSE_DIR = CONTENT_DIR / "verses"
META_DIR = CONTENT_DIR / "meta"
AUDIT_DIR = TOOLS_DIR / "audit"
REPORTS_DIR = AUDIT_DIR / "reports"
CACHE_DIR = AUDIT_DIR / ".cache"
REFERENCE_MATRIX_PATH = AUDIT_DIR / "reference_matrix.json"
SUMMARY_PATH = AUDIT_DIR / "summary.json"
STRONGS_OT_PATH = AUDIT_DIR / "strongs_ot.json"
STRONGS_NT_PATH = AUDIT_DIR / "strongs_nt.json"
ENV_FILE = TOOLS_DIR / ".env"

# ─── Claim Types ────────────────────────────────────────────────────

CLAIM_TYPES = {
    "scholar_attribution",
    "hebrew_greek",
    "cross_reference",
    "historical",
    "timeline",
    "people_places",
}

# ─── Scoring Weights (must sum to 1.0) ──────────────────────────────

SCORING_WEIGHTS = {
    "scholar_attribution": 0.30,
    "hebrew_greek":        0.20,
    "cross_reference":     0.15,
    "historical":          0.15,
    "timeline":            0.10,
    "people_places":       0.10,
}

# ─── Content Quality Floor ───────────────────────────────────────

QUALITY_FLOOR = 90  # Minimum quality_scorer score for content in CI gate

# ─── Grade Mapping ──────────────────────────────────────────────────

GRADE_THRESHOLDS = [
    (95, "A+"),
    (90, "A"),
    (85, "B+"),
    (80, "B"),
    (70, "C"),
    (0,  "D"),
]

def score_to_grade(score: float) -> str:
    """Convert a 0–100 score to a letter grade."""
    for threshold, grade in GRADE_THRESHOLDS:
        if score >= threshold:
            return grade
    return "D"

# ─── Verification Statuses ──────────────────────────────────────────

STATUS_VERIFIED = "VERIFIED"
STATUS_FLAGGED = "FLAGGED"
STATUS_REFUTED = "REFUTED"
STATUS_UNVERIFIED = "UNVERIFIED"
STATUS_SKIPPED = "SKIPPED"

# Statuses that count as "good" in scoring
PASSING_STATUSES = {STATUS_VERIFIED, STATUS_SKIPPED}

# ─── Panel Classification ───────────────────────────────────────────

# Core section panel types (not scholar-attributed)
CORE_SECTION_PANELS = {"heb", "cross", "hist", "ctx", "tl", "places", "poi", "mac", "net"}

# Panel types that map to specific claim extractors
HEBREW_PANELS = {"heb"}
CROSS_REF_PANELS = {"cross"}
HISTORICAL_PANELS = {"hist"}

# Chapter-level panel types
CHAPTER_PANEL_TYPES = {
    "ppl", "trans", "src", "rec", "lit", "hebtext",
    "thread", "tx", "debate", "themes", "discourse",
}

# Chapter panels that produce people_places claims
PEOPLE_PANELS = {"ppl"}

# Chapter panels that produce historical claims
SOURCE_PANELS = {"src", "rec"}

# Chapter panels that produce cross_reference claims
THREAD_PANELS = {"thread"}

# Chapter panels that produce scholar_attribution-like claims
DEBATE_PANELS = {"debate"}
TEXTUAL_PANELS = {"tx"}

# ─── Tier Assignment Rules ──────────────────────────────────────────

# Default tier by claim type (can be overridden by complexity heuristics)
DEFAULT_TIERS = {
    "cross_reference":     0,
    "people_places":       1,
    "hebrew_greek":        1,  # Simple glosses; interpretive claims → Tier 2
    "timeline":            1,
    "historical":          2,
    "scholar_attribution": 3,
}

# ─── Cross-Reference Parsing ────────────────────────────────────────

# Canonical book name → book_id mapping for verse ref validation
# (generated from books.json at runtime to avoid hardcoding)
BOOK_NAME_ALIASES = {}  # Populated by load_book_aliases()

def load_book_aliases() -> dict:
    """Build book name → book_id mapping from books.json.

    Handles common abbreviations and name variants.
    """
    global BOOK_NAME_ALIASES
    if BOOK_NAME_ALIASES:
        return BOOK_NAME_ALIASES

    import json
    books = json.load(open(META_DIR / "books.json"))
    aliases = {}

    for book in books:
        bid = book["id"]
        name = book["name"]
        # Full name
        aliases[name.lower()] = bid
        # Without spaces
        aliases[name.lower().replace(" ", "")] = bid

    # Common abbreviations
    ABBREVIATIONS = {
        "gen": "genesis", "exod": "exodus", "ex": "exodus",
        "lev": "leviticus", "num": "numbers", "deut": "deuteronomy",
        "josh": "joshua", "judg": "judges", "ruth": "ruth",
        "1 sam": "1_samuel", "2 sam": "2_samuel",
        "1sam": "1_samuel", "2sam": "2_samuel",
        "1 kgs": "1_kings", "2 kgs": "2_kings",
        "1kgs": "1_kings", "2kgs": "2_kings",
        "1 ki": "1_kings", "2 ki": "2_kings",
        "1ki": "1_kings", "2ki": "2_kings",
        "1 chr": "1_chronicles", "2 chr": "2_chronicles",
        "1chr": "1_chronicles", "2chr": "2_chronicles",
        "1 chron": "1_chronicles", "2 chron": "2_chronicles",
        "neh": "nehemiah", "est": "esther",
        "ps": "psalms", "psa": "psalms", "psalm": "psalms",
        "prov": "proverbs", "eccl": "ecclesiastes", "eccles": "ecclesiastes",
        "song": "song_of_solomon", "sos": "song_of_solomon",
        "ss": "song_of_solomon", "cant": "song_of_solomon",
        "isa": "isaiah", "jer": "jeremiah", "lam": "lamentations",
        "ezek": "ezekiel", "eze": "ezekiel",
        "dan": "daniel", "hos": "hosea",
        "ob": "obadiah", "obad": "obadiah",
        "jon": "jonah", "mic": "micah", "nah": "nahum",
        "hab": "habakkuk", "zeph": "zephaniah",
        "hag": "haggai", "zech": "zechariah", "mal": "malachi",
        "matt": "matthew", "mt": "matthew", "mat": "matthew",
        "mk": "mark", "mr": "mark",
        "lk": "luke", "luk": "luke",
        "jn": "john", "joh": "john",
        "rom": "romans", "1 cor": "1_corinthians", "2 cor": "2_corinthians",
        "1cor": "1_corinthians", "2cor": "2_corinthians",
        "gal": "galatians", "eph": "ephesians", "phil": "philippians",
        "col": "colossians",
        "1 thess": "1_thessalonians", "2 thess": "2_thessalonians",
        "1thess": "1_thessalonians", "2thess": "2_thessalonians",
        "1 tim": "1_timothy", "2 tim": "2_timothy",
        "1tim": "1_timothy", "2tim": "2_timothy",
        "tit": "titus", "phlm": "philemon", "phm": "philemon",
        "heb": "hebrews", "jas": "james", "jam": "james",
        "1 pet": "1_peter", "2 pet": "2_peter",
        "1pet": "1_peter", "2pet": "2_peter",
        "1 jn": "1_john", "2 jn": "2_john", "3 jn": "3_john",
        "1jn": "1_john", "2jn": "2_john", "3jn": "3_john",
        "rev": "revelation",
        # Alternate full names
        "1 samuel": "1_samuel", "2 samuel": "2_samuel",
        "1 kings": "1_kings", "2 kings": "2_kings",
        "1 chronicles": "1_chronicles", "2 chronicles": "2_chronicles",
        "1 corinthians": "1_corinthians", "2 corinthians": "2_corinthians",
        "1 thessalonians": "1_thessalonians", "2 thessalonians": "2_thessalonians",
        "1 timothy": "1_timothy", "2 timothy": "2_timothy",
        "1 peter": "1_peter", "2 peter": "2_peter",
        "1 john": "1_john", "2 john": "2_john", "3 john": "3_john",
        "song of solomon": "song_of_solomon", "song of songs": "song_of_solomon",
    }
    aliases.update(ABBREVIATIONS)

    BOOK_NAME_ALIASES = aliases
    return aliases


# ─── API Configuration (Phase 3+) ──────────────────────────────────

def load_api_key() -> str | None:
    """Load Anthropic API key from .env file or environment."""
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("ANTHROPIC_API_KEY")


# API rate limiting
MAX_CONCURRENT = 5
RATE_LIMIT_RPM = 50
RETRY_ATTEMPTS = 3
RETRY_BACKOFF = 2.0
CHECKPOINT_INTERVAL = 50

# ─── Baseline Priority Order ────────────────────────────────────────

BASELINE_ORDER = [
    # Phase A: Flagships — highest quality, most user-visible
    "genesis", "exodus", "psalms", "matthew", "john", "romans",
    "revelation", "isaiah", "daniel",
    # Phase B: Torah + Historical
    "leviticus", "numbers", "deuteronomy",
    "joshua", "judges", "ruth",
    "1_samuel", "2_samuel", "1_kings", "2_kings",
    # Phase C: Wisdom + Prophets
    "job", "proverbs", "ecclesiastes", "song_of_solomon",
    "jeremiah", "lamentations", "ezekiel",
    # Phase D: Minor Prophets
    "hosea", "joel", "amos", "obadiah", "jonah", "micah",
    "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",
    # Phase E: NT Letters
    "acts", "1_corinthians", "2_corinthians", "galatians",
    "ephesians", "philippians", "colossians",
    "1_thessalonians", "2_thessalonians",
    "1_timothy", "2_timothy", "titus", "philemon",
    "hebrews", "james", "1_peter", "2_peter",
    "1_john", "2_john", "3_john", "jude",
    # Phase F: Remaining
    "1_chronicles", "2_chronicles", "ezra", "nehemiah", "esther",
    "mark", "luke",
]
