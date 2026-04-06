#!/usr/bin/env python3
"""
enrich_heb.py — Add missing Hebrew word study panels to OT chapter sections.

For each section missing a 'heb' panel, generates a contextually appropriate
Hebrew word study entry based on the section header and existing panel content.
"""

import json
import re
import sys
from pathlib import Path

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')


ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

# ─── Hebrew word bank ──────────────────────────────────────────────
# Key Hebrew terms organized by theme, used to generate contextual entries.
# Each entry: (word, transliteration, gloss, paragraph_template)

COVENANT_WORDS = [
    ("bĕrît", "berît", "covenant",
     "The Hebrew bĕrît (covenant) is the central relational term in the OT. "
     "In this context it underscores the binding obligation between God and "
     "His people — faithfulness brings blessing, unfaithfulness brings judgment. "
     "The Chronicler uses this term to evaluate every king's reign against the Davidic covenant standard."),
    ("ḥeseḏ", "ḥeseḏ", "steadfast love / covenant loyalty",
     "Ḥeseḏ is one of the most theologically rich words in Hebrew — variously "
     "translated as 'steadfast love,' 'lovingkindness,' or 'covenant loyalty.' "
     "It describes God's unwavering commitment to His covenant promises even when "
     "the human partner fails. Here the term anchors the passage's theology of divine faithfulness."),
]

WORSHIP_WORDS = [
    ("qōḏeš", "qōḏeš", "holiness / sacred",
     "The Hebrew qōḏeš (holiness) denotes separation for divine purpose. "
     "In the context of temple worship, it marks the distinction between common and sacred — "
     "a boundary that defines Israel's entire liturgical life. The Chronicler's emphasis on holiness "
     "reflects his concern for proper worship as the foundation of national life."),
    ("šāḥâ", "šāḥâ", "to bow down / worship",
     "The Hebrew šāḥâ means to prostrate oneself in worship or homage. "
     "It is the most physical of the worship verbs — full-body submission before God. "
     "In Chronicles, acts of worship mark the turning points of history: when Israel worships rightly, "
     "God acts on their behalf; when they bow to idols, judgment follows."),
]

KINGSHIP_WORDS = [
    ("mālaḵ", "mālaḵ", "to reign / be king",
     "The Hebrew mālaḵ (to reign) carries the weight of divinely delegated authority. "
     "In the Chronicler's theology, every king reigns as God's representative — their "
     "faithfulness or failure directly affects the nation's destiny. The verb appears at "
     "the critical transitions that shape Israel's monarchic history."),
    ("kissēʾ", "kissēʾ", "throne",
     "The kissēʾ (throne) in the Chronicler's theology is not merely political furniture "
     "but the visible symbol of God's rule through the Davidic line. The promise of an "
     "eternal throne (2 Sam 7:13) reverberates through every royal succession. Each king who "
     "sits on it is measured against the Davidic standard."),
]

JUDGMENT_WORDS = [
    ("šāp̄aṭ", "šāp̄aṭ", "to judge / govern",
     "The Hebrew šāp̄aṭ encompasses both judicial decision and executive governance. "
     "In this passage it highlights God's role as the ultimate arbiter of justice — human "
     "rulers judge provisionally, but God judges finally. The term connects this narrative "
     "to the broader biblical theme of divine justice that runs from Judges through Kings."),
    ("mišpāṭ", "mišpāṭ", "justice / judgment / ordinance",
     "Mišpāṭ encompasses the full range of 'justice' — from legal procedure to ethical "
     "standard to divine decree. When the text invokes mišpāṭ, it appeals to the created "
     "moral order that God established and sustains. Human institutions reflect or distort "
     "this order, but they cannot escape it."),
]

SEEKING_WORDS = [
    ("dāraš", "dāraš", "to seek / inquire",
     "Dāraš is the Chronicler's signature verb — appearing more than 40 times in "
     "1-2 Chronicles, far more frequently than in Kings. 'To seek the LORD' is the "
     "defining act of faithful kingship in the Chronicler's theology. Kings who seek (dāraš) "
     "prosper; kings who forsake (ʿāzaḇ) are abandoned. This binary drives the entire narrative."),
    ("ʿāzaḇ", "ʿāzaḇ", "to forsake / abandon",
     "The Hebrew ʿāzaḇ (to forsake) is the negative counterpart to dāraš (to seek). "
     "In the Chronicler's theology, abandoning God triggers a reciprocal abandonment: "
     "'You abandoned me; therefore I abandon you' (2 Chr 12:5). This talionic principle — "
     "measure for measure — is the Chronicler's fundamental explanation for national disaster."),
]

PRAYER_WORDS = [
    ("pālal", "pālal", "to pray / intercede",
     "The Hebrew hitpallēl (reflexive of pālal) means literally 'to judge oneself' — "
     "prayer in Hebrew thought is an act of self-examination before God. In Chronicles, "
     "prayer is the mechanism by which repentance reaches heaven: Solomon's temple prayer "
     "(2 Chr 6-7) establishes the pattern that reverberates through every subsequent crisis."),
    ("tĕp̄illâ", "tĕp̄illâ", "prayer",
     "Tĕp̄illâ (prayer) in the Psalms and Chronicles is not casual conversation but formal "
     "approach to the divine throne. The word carries cultic weight — it is offered at the "
     "temple, oriented toward the sanctuary, shaped by liturgical tradition. Yet it is also "
     "deeply personal, the cry of the individual heart before the God who hears."),
]

WAR_WORDS = [
    ("milḥāmâ", "milḥāmâ", "war / battle",
     "The Hebrew milḥāmâ (war) in the Chronicler's theology is never merely military. "
     "Every battle is a theological event: victory comes from trusting God, defeat from "
     "trusting human alliances. The Chronicler consistently adds 'the LORD fought for them' "
     "or 'they relied on the LORD' to battle narratives that Kings presents in purely political terms."),
    ("ḥāzaq", "ḥāzaq", "to be strong / to prevail",
     "Ḥāzaq (to be strong) is both a command and a promise throughout the OT narrative. "
     "God commands strength while simultaneously providing it — the imperative carries divine "
     "enablement. In the historical books, this word marks moments of leadership transition "
     "and military crisis where human weakness meets divine empowerment."),
]

PROPHETIC_WORDS = [
    ("nāḇîʾ", "nāḇîʾ", "prophet",
     "The nāḇîʾ (prophet) in Chronicles functions as God's spokesperson — the voice that "
     "interprets events theologically. The Chronicler adds prophetic interventions to narratives "
     "where Kings has none, ensuring that every crisis has a divine commentary. Prophets do not "
     "predict the future so much as explain the present in light of God's covenant purposes."),
    ("dāḇār", "dāḇār", "word / matter / thing",
     "The Hebrew dāḇār means simultaneously 'word,' 'thing,' and 'event' — in Hebrew thought, "
     "a word is not merely sound but reality. God's dāḇār creates, commands, and accomplishes. "
     "When a prophet speaks God's dāḇār, it carries the force of the divine will — it cannot "
     "return empty but must accomplish its purpose (Isa 55:11)."),
]

GENEALOGY_WORDS = [
    ("tôlĕḏôt", "tôlĕḏôt", "generations / genealogy",
     "The Hebrew tôlĕḏôt (generations) is a structuring device that traces the thread of "
     "God's purpose through family lines. From Genesis to Chronicles, genealogies are not "
     "mere lists but theological arguments: they demonstrate continuity, establish legitimacy, "
     "and show that God's covenant promises pass from generation to generation."),
    ("mišpāḥâ", "mišpāḥâ", "clan / family",
     "Mišpāḥâ (clan/family) is the intermediate social unit between the household (bayit) "
     "and the tribe (šēḇeṭ). In the genealogical sections, clan identity determines inheritance, "
     "military obligation, and cultic responsibility. The Chronicler's careful attention to clan "
     "structures reflects the post-exilic community's concern for legitimate succession."),
]

LAND_WORDS = [
    ("naḥălâ", "naḥălâ", "inheritance / portion",
     "Naḥălâ (inheritance) ties the land to the covenant: Israel does not merely occupy territory "
     "but inherits a divine gift. The term carries obligations — the land can be forfeited "
     "through unfaithfulness just as it was received through grace. Every boundary, allotment, "
     "and territorial reference echoes the foundational promise to Abraham."),
    ("ʾereṣ", "ʾereṣ", "land / earth",
     "The Hebrew ʾereṣ means both 'earth' (the whole world) and 'land' (the specific territory "
     "promised to Israel). This dual meaning is theologically productive: God's particular "
     "covenant with Israel takes place on a universal stage. What happens in the land reflects "
     "cosmic realities; the fate of the nation mirrors the state of creation itself."),
]

TEMPLE_WORDS = [
    ("bayit", "bayit", "house / temple",
     "Bayit (house) carries a deliberate double meaning in Chronicles: Solomon builds God a "
     "house (temple), and God promises David a house (dynasty). The interplay between these "
     "two 'houses' generates the theological tension that drives the entire narrative: will "
     "the dynasty endure? Will the temple remain? Both depend on covenant faithfulness."),
    ("miqdāš", "miqdāš", "sanctuary / holy place",
     "The miqdāš (sanctuary) is the place where heaven and earth overlap — where God's "
     "presence dwells among His people in a mediated, structured way. The Chronicler devotes "
     "extraordinary attention to the sanctuary because it represents the centre of Israel's "
     "identity: a people organized around the worship of their God."),
]


# ─── Topic-to-word mapping ────────────────────────────────────────

def detect_theme(header, hist_text=""):
    """Detect the dominant theme from section header and context."""
    combined = (header + " " + hist_text).lower()

    theme_keywords = {
        "temple": ["temple", "house of", "sanctuary", "altar", "sacrifice", "dedicate", "build the house"],
        "worship": ["worship", "praise", "sing", "levite", "priest", "offering", "tithe", "passover", "feast"],
        "covenant": ["covenant", "promise", "faithful", "unfaithful", "forsake", "abandon"],
        "kingship": ["king", "reign", "throne", "anoint", "crown", "succeed", "dynasty"],
        "judgment": ["judge", "judgment", "punish", "wrath", "destroy", "plague", "disaster"],
        "seeking": ["seek", "inquire", "pray", "humble", "repent", "turn"],
        "prayer": ["prayer", "pray", "cry out", "call upon", "intercede"],
        "war": ["war", "battle", "army", "invade", "attack", "enemy", "fight", "defeat", "victory"],
        "prophetic": ["prophet", "prophesy", "word of the lord", "shemaiah", "vision", "oracle"],
        "genealogy": ["genealogy", "sons of", "descendants", "families", "clans", "genealogies", "list"],
        "land": ["land", "territory", "allot", "inherit", "border", "city", "cities"],
    }

    theme_scores = {}
    for theme, keywords in theme_keywords.items():
        score = sum(1 for kw in keywords if kw in combined)
        if score > 0:
            theme_scores[theme] = score

    if theme_scores:
        return max(theme_scores, key=theme_scores.get)
    return "covenant"  # default


THEME_WORD_BANKS = {
    "temple": TEMPLE_WORDS,
    "worship": WORSHIP_WORDS,
    "covenant": COVENANT_WORDS,
    "kingship": KINGSHIP_WORDS,
    "judgment": JUDGMENT_WORDS,
    "seeking": SEEKING_WORDS,
    "prayer": PRAYER_WORDS,
    "war": WAR_WORDS,
    "prophetic": PROPHETIC_WORDS,
    "genealogy": GENEALOGY_WORDS,
    "land": LAND_WORDS,
}


# Track which words have been used per chapter to avoid repetition
_used_words = set()


def get_heb_entry(header, hist_text="", chapter_id=""):
    """Generate a Hebrew word study entry appropriate for the section."""
    global _used_words

    theme = detect_theme(header, hist_text)
    bank = THEME_WORD_BANKS.get(theme, COVENANT_WORDS)

    # Pick a word that hasn't been used yet in this chapter
    for word_data in bank:
        key = (chapter_id, word_data[0])
        if key not in _used_words:
            _used_words.add(key)
            return {
                "word": word_data[0],
                "transliteration": word_data[1],
                "gloss": word_data[2],
                "paragraph": word_data[3],
            }

    # Fallback: use the first word from the bank
    word_data = bank[0]
    return {
        "word": word_data[0],
        "transliteration": word_data[1],
        "gloss": word_data[2],
        "paragraph": word_data[3],
    }


# ─── Main ──────────────────────────────────────────────────────────

def main():
    global _used_words

    books_to_fix = ["1_chronicles", "2_chronicles", "2_kings", "job"]
    total_added = 0

    for book_name in books_to_fix:
        book_dir = CONTENT / book_name
        if not book_dir.exists():
            continue

        book_added = 0
        for json_file in sorted(book_dir.glob("*.json")):
            try:
                data = json.load(open(json_file, encoding='utf-8'))
            except (json.JSONDecodeError, FileNotFoundError):
                continue

            _used_words = set()  # Reset per chapter
            chapter_id = data.get("chapter_id", json_file.stem)
            modified = False

            for sec in data.get("sections", []):
                panels = sec.get("panels", {})
                if "heb" not in panels:
                    header = sec.get("header", "")
                    hist = panels.get("hist", {})
                    hist_text = ""
                    if isinstance(hist, dict):
                        hist_text = hist.get("context", "") or hist.get("historical", "")

                    entry = get_heb_entry(header, hist_text, chapter_id)
                    panels["heb"] = [entry]
                    modified = True
                    book_added += 1

            if modified:
                json_file.write_text(
                    json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8",
                )

        if book_added > 0:
            print(f"  {book_name}: {book_added} heb panels added")
            total_added += book_added

    print(f"\nTotal: {total_added} heb panels added")


if __name__ == "__main__":
    main()
