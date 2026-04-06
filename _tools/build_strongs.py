#!/usr/bin/env python3
"""
build_strongs.py — Fetch and parse Strong's Concordance data into JSON lookup files.

Source: OpenScriptures/strongs (GPL 3.0)
        https://github.com/openscriptures/strongs

Outputs:
    _tools/audit/strongs_ot.json  — OT Hebrew entries (H0001–H8674)
    _tools/audit/strongs_nt.json  — NT Greek entries (G0001–G5624)

Usage:
    python3 _tools/build_strongs.py
"""

import json
import os
import re
import sys
import urllib.request

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from html.parser import HTMLParser
from pathlib import Path

STRONGS_URL = (
    "https://raw.githubusercontent.com/openscriptures/strongs/master/"
    "strongs-dictionary.xhtml"
)

ROOT = Path(__file__).resolve().parent.parent
AUDIT_DIR = ROOT / "_tools" / "audit"
OT_OUTPUT = AUDIT_DIR / "strongs_ot.json"
NT_OUTPUT = AUDIT_DIR / "strongs_nt.json"
CACHE_FILE = Path("/tmp/strongs.xhtml")


class StrongsParser(HTMLParser):
    """Parse the OpenScriptures XHTML into structured entries."""

    def __init__(self):
        super().__init__()
        self.entries = {}
        self.current_section = None  # "ot" or "nt"
        self.in_li = False
        self.current_id = None
        self.current_word = None
        self.current_translit = None
        self.current_lang = None
        self.in_word_tag = False
        self.in_kjv_def = False
        self.current_def_parts = []
        self.current_kjv = []
        self.li_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == "ol":
            return

        if tag == "li":
            self.in_li = True
            self.li_depth += 1
            entry_id = attrs_dict.get("id", "")
            if entry_id.startswith("ot:"):
                self.current_section = "ot"
                self.current_id = "H" + entry_id[3:].zfill(4)
            elif entry_id.startswith("nt:"):
                self.current_section = "nt"
                self.current_id = "G" + entry_id[3:].zfill(4)
            else:
                self.current_id = None
            self.current_word = None
            self.current_translit = None
            self.current_lang = None
            self.current_def_parts = []
            self.current_kjv = []

        elif tag == "i" and self.in_li and self.current_word is None:
            # First <i> in entry = the headword
            self.in_word_tag = True
            self.current_translit = attrs_dict.get("title", "").strip("{}")
            self.current_lang = attrs_dict.get("xml:lang", "")

        elif tag == "span" and self.in_li:
            cls = attrs_dict.get("class", "")
            if "kjv_def" in cls:
                self.in_kjv_def = True

    def handle_endtag(self, tag):
        if tag == "i" and self.in_word_tag:
            self.in_word_tag = False

        elif tag == "span" and self.in_kjv_def:
            self.in_kjv_def = False

        elif tag == "li" and self.in_li:
            self.li_depth -= 1
            if self.li_depth <= 0:
                self.in_li = False
                self.li_depth = 0
                if self.current_id and self.current_word:
                    definition = " ".join(self.current_def_parts).strip()
                    definition = re.sub(r"\s+", " ", definition)
                    kjv_usage = ", ".join(self.current_kjv).strip()

                    self.entries[self.current_id] = {
                        "word": self.current_word,
                        "transliteration": self.current_translit or "",
                        "gloss": _extract_gloss(definition),
                        "strongs_def": definition,
                        "kjv_usage": kjv_usage,
                    }

    def handle_data(self, data):
        if self.in_word_tag and self.current_word is None:
            self.current_word = data.strip()
        elif self.in_kjv_def:
            self.current_kjv.append(data.strip())
        elif self.in_li and not self.in_word_tag and not self.in_kjv_def:
            self.current_def_parts.append(data)


def _extract_gloss(definition: str) -> str:
    """Extract a short gloss from the full Strong's definition.

    Pulls the first meaningful phrase, stripping grammatical notes like
    'a primitive root;' or 'from H1234;'.
    """
    # Remove leading grammar notes
    cleaned = re.sub(
        r"^(\(Aramaic\)\s*)?"
        r"(a primitive (root|word);?\s*|"
        r"from\s+[\w:]+[^;]*;\s*|"
        r"corresponding to\s+[^;]*;\s*|"
        r"(intensive|active|passive|participle|denominative)\s+(from|of)\s+[^;]*;\s*|"
        r"the same as\s+[^;]*;\s*|"
        r"of (foreign|uncertain|Hebrew) origin[^;]*;\s*|"
        r"apparently\s+[^;]*;\s*|"
        r"probably\s+(from|of)\s+[^;]*;\s*)*",
        "",
        definition,
        flags=re.IGNORECASE,
    )
    # Take up to first colon or semicolon or parenthetical
    match = re.match(r"([^:;(]+)", cleaned)
    if match:
        gloss = match.group(1).strip().rstrip(",. ")
        if len(gloss) > 3:
            return gloss
    return cleaned[:80].strip()


def download_strongs() -> str:
    """Download the Strong's XHTML file, using cache if available."""
    if CACHE_FILE.exists():
        print(f"  Using cached file: {CACHE_FILE}")
        return CACHE_FILE.read_text(encoding="utf-8")

    print(f"  Downloading from {STRONGS_URL}...")
    req = urllib.request.Request(STRONGS_URL, headers={"User-Agent": "CompanionStudy/1.0"})
    with urllib.request.urlopen(req) as resp:
        data = resp.read().decode("utf-8")
    CACHE_FILE.write_text(data, encoding="utf-8")
    print(f"  Saved to {CACHE_FILE} ({len(data):,} bytes)")
    return data


def main():
    print("═══ Building Strong's Lexicon Data ═══")

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)

    xhtml = download_strongs()

    print("  Parsing entries...")
    parser = StrongsParser()
    parser.feed(xhtml)

    ot_entries = {k: v for k, v in parser.entries.items() if k.startswith("H")}
    nt_entries = {k: v for k, v in parser.entries.items() if k.startswith("G")}

    print(f"  OT entries: {len(ot_entries)}")
    print(f"  NT entries: {len(nt_entries)}")

    OT_OUTPUT.write_text(json.dumps(ot_entries, ensure_ascii=False, indent=1), encoding="utf-8")
    NT_OUTPUT.write_text(json.dumps(nt_entries, ensure_ascii=False, indent=1), encoding="utf-8")

    ot_size = OT_OUTPUT.stat().st_size
    nt_size = NT_OUTPUT.stat().st_size
    print(f"  Written: {OT_OUTPUT.name} ({ot_size:,} bytes)")
    print(f"  Written: {NT_OUTPUT.name} ({nt_size:,} bytes)")
    print("  Done.")


if __name__ == "__main__":
    main()
