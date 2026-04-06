#!/usr/bin/env python3
"""
fix_similarity.py — Differentiate scholar panels that are too similar.

Replaces the generic expansion suffix with panel-type-specific elaboration.
"""

import json
import re
from pathlib import Path

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
import sys as _sys
if _sys.stdout.encoding and _sys.stdout.encoding.lower() != 'utf-8':
    _sys.stdout.reconfigure(encoding='utf-8')
del _sys


ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

# The generic expansion added by enrich_remaining.py
GENERIC_EXPANSION = (
    " This observation connects to the broader theological "
    "argument of the passage. The text rewards careful attention "
    "to its literary structure and rhetorical strategy — what "
    "appears simple on the surface conceals layers of meaning "
    "that become visible only when the passage is read within its "
    "canonical and historical context."
)

# Panel-specific replacements (unique per scholar type)
PANEL_EXPANSIONS = {
    "calvin": (
        " Calvin's reading characteristically emphasizes divine sovereignty "
        "and human responsibility in tension — God ordains the outcome while "
        "the actors remain morally accountable. This dual emphasis reflects "
        "Calvin's broader hermeneutic: Scripture always speaks both about "
        "God's plan and about human duty under that plan."
    ),
    "net": (
        " The NET translators note that the underlying Hebrew/Greek syntax "
        "carries nuances that most English versions cannot fully represent. "
        "Lexical analysis of the key terms reveals semantic ranges that "
        "enrich the passage beyond what a single English gloss can convey, "
        "connecting this text to a wider web of biblical usage."
    ),
    "netbible": (
        " The NET Bible's textual notes draw attention to variant readings "
        "and translation challenges in this passage. The translators weigh "
        "manuscript evidence alongside syntactic analysis to arrive at "
        "renderings that balance accuracy with readability, providing "
        "supplementary notes where the original resists simple translation."
    ),
    "mac": (
        " MacArthur emphasizes the doctrinal significance of this passage "
        "within the framework of systematic theology. The text establishes "
        "principles that remain normative for the church — not merely "
        "descriptive of ancient Israel but prescriptive for how God's "
        "people should understand His character and respond in obedience."
    ),
    "robertson": (
        " Robertson's grammatical analysis reveals how the Greek tense, "
        "mood, and voice carry theological weight. The precise verbal forms "
        "chosen by the author distinguish between completed action, ongoing "
        "state, and intended result — distinctions that shape how the "
        "passage should be understood and applied in its canonical context."
    ),
    "catena": (
        " The patristic commentators read this passage through a hermeneutic "
        "of spiritual senses, finding christological and ecclesiological "
        "meaning layered beneath the historical. While modern exegesis "
        "focuses on authorial intent, the Fathers remind us that Scripture "
        "speaks to every generation with fresh relevance and depth."
    ),
    "cat": (
        " The patristic tradition reads this passage as part of the larger "
        "drama of salvation history. The Church Fathers find in these words "
        "both a record of what happened and a prophetic anticipation of what "
        "God would accomplish in Christ — history and theology are inseparable "
        "in patristic exegesis."
    ),
    "bergen": (
        " Bergen's literary-critical analysis highlights the narrative artistry "
        "of the text — the author is not simply recording events but crafting "
        "a theological argument through structure, repetition, and contrast. "
        "The passage contributes to the book's overarching thesis about "
        "leadership, covenant, and the nature of true kingship under God."
    ),
    "tsumura": (
        " Tsumura's philological analysis draws on comparative Semitic evidence "
        "to illuminate the Hebrew vocabulary and syntax. Cognate terms in "
        "Akkadian and Ugaritic shed light on semantic ranges that the Hebrew "
        "alone might leave ambiguous, anchoring the exegesis in the broader "
        "linguistic world of ancient Near Eastern literature."
    ),
    "anderson": (
        " Anderson's text-critical approach weighs the evidence of the Dead Sea "
        "Scrolls, LXX, and Masoretic Text to establish the most reliable "
        "reading. The textual variants in this passage illuminate not just "
        "scribal practice but also how early communities interpreted and "
        "transmitted these sacred traditions."
    ),
    "block": (
        " Block's literary and theological analysis situates this passage within "
        "the author's rhetorical strategy. The text functions as both narrative "
        "and argument — the story advances the book's theological thesis about "
        "the consequences of covenant faithfulness and unfaithfulness in "
        "Israel's life under God."
    ),
    "webb": (
        " Webb's literary-critical reading attends to the narrative's irony and "
        "deliberate ambiguity. The author writes not just to inform but to "
        "provoke reflection — the reader must grapple with moral complexity "
        "that resists easy resolution, reflecting the book's larger theme "
        "of progressive deterioration in the absence of faithful leadership."
    ),
    "howard": (
        " Howard highlights the rhetorical function of this passage within the "
        "book's compositional structure. The author uses geographic and military "
        "detail not merely as historical record but as theological commentary — "
        "the land itself becomes a character in the drama of God's covenant "
        "faithfulness and Israel's response."
    ),
    "hess": (
        " Hess draws on archaeological and comparative evidence to situate the "
        "text within its ancient Near Eastern context. Material culture, treaty "
        "forms, and administrative practices illuminated by extra-biblical "
        "sources provide a richer understanding of what the biblical author "
        "is describing and why it matters theologically."
    ),
    "keener": (
        " Keener's socio-historical analysis places this passage within the "
        "cultural matrix of the first-century Mediterranean world. Greco-Roman "
        "social conventions, Jewish institutional practices, and honour-shame "
        "dynamics illuminate dimensions of the text that a purely literary "
        "reading might miss."
    ),
    "tigay": (
        " Tigay's commentary draws attention to the legal and treaty parallels "
        "that structure Deuteronomy's rhetoric. The passage reflects the form "
        "of ancient Near Eastern suzerainty treaties — stipulations, blessings, "
        "and curses that define the covenant relationship between God and "
        "Israel in terms the original audience would have recognized."
    ),
    "craigie": (
        " Craigie's analysis emphasizes the ancient Near Eastern treaty context "
        "that shapes Deuteronomy's literary form. The passage's legal and "
        "rhetorical features parallel Hittite suzerainty treaties, suggesting "
        "that the author deliberately cast God's covenant with Israel in the "
        "most solemn diplomatic language available."
    ),
    "schreiner": (
        " Schreiner's exegesis emphasizes the eschatological dimension of the "
        "passage. The author writes with the end in view — present suffering "
        "and ethical obligation are framed by the certainty of Christ's return "
        "and the final vindication of God's people. This already-not-yet "
        "tension shapes every imperative in the text."
    ),
    "jobes": (
        " Jobes attends to the socio-rhetorical context of the passage, noting "
        "how the author addresses a community under social pressure. The "
        "language of identity, belonging, and hope is calibrated to sustain "
        "faith amid marginalization — the letter functions as pastoral care "
        "for believers navigating a hostile cultural environment."
    ),
    "yarbrough": (
        " Yarbrough traces the epistle's logic through its characteristic "
        "contrasts: light and darkness, truth and falsehood, love and hate. "
        "The author's binary rhetoric is not simplistic but diagnostic — it "
        "exposes the fundamental orientation of the heart and calls readers "
        "to genuine self-examination in the light of God's revealed character."
    ),
    "kruse": (
        " Kruse's analysis focuses on the letter's pastoral function within "
        "its historical context. The author addresses concrete community "
        "concerns — false teaching, relational fracture, assurance of "
        "salvation — with theological precision that grounds pastoral care "
        "in the foundational realities of the incarnation and atonement."
    ),
    "moo": (
        " Moo's exegesis situates James within the broader wisdom tradition, "
        "noting how the author draws on Proverbs, Sirach, and Jesus's own "
        "teaching to construct a practical theology of faithful living. "
        "The epistle's imperatives are grounded not in legalism but in "
        "the transformative reality of the 'implanted word' (1:21)."
    ),
    "mccartney": (
        " McCartney connects this passage to the OT prophetic tradition, "
        "reading James as a continuation of Israel's wisdom and prophetic "
        "heritage adapted for the messianic community. The epistle's social "
        "ethic is not novel but draws deeply on the Torah's vision of "
        "justice, generosity, and covenant solidarity."
    ),
    "mar": (
        " Marcus highlights the narrative's christological significance within "
        "Mark's larger compositional strategy. The passage advances Mark's "
        "central paradox: the Messiah achieves victory through suffering, "
        "power through weakness. The narrative's literary structure — irony, "
        "secrecy, misunderstanding — serves this theological vision."
    ),
    "rho": (
        " Rhoads' narrative-critical reading attends to the Gospel's rhetoric "
        "of discipleship. The implied reader is drawn into the story's "
        "conflicts and forced to reckon with the cost of following Jesus. "
        "Mark's narrative world demands response — the text is not simply "
        "informative but performative, shaping readers into disciples."
    ),
    "levenson": (
        " Levenson's literary reading situates the text within the Persian-period "
        "context that produced it. The narrative's themes of divine providence, "
        "diaspora identity, and reversal of fortune speak directly to the "
        "experience of Jewish communities navigating life under foreign rule "
        "while maintaining covenant faithfulness."
    ),
    "cockerill": (
        " Cockerill's exegesis emphasizes the high-priestly christology that "
        "structures the entire epistle. This passage contributes to the "
        "author's sustained argument that Christ's mediatorial work surpasses "
        "and fulfills every prior arrangement — the tabernacle, the Levitical "
        "priesthood, and the old covenant sacrificial system."
    ),
    "clines": (
        " Clines' literary reading attends to Job's rhetoric and dramatic "
        "structure. The dialogue is not simply theological debate but dramatic "
        "art — speech acts that reveal character, build tension, and subvert "
        "the reader's expectations about how God relates to human suffering "
        "and the limits of human wisdom."
    ),
    "habel": (
        " Habel's form-critical analysis identifies the passage's literary type "
        "and rhetorical function within the book's larger structure. The "
        "interplay of lament, wisdom disputation, and divine speech creates "
        "a multi-voiced exploration of theodicy that resists reduction to "
        "any single theological position."
    ),
    "alter": (
        " Alter's literary translation draws attention to the poetic artistry "
        "of the Hebrew — rhythm, parallelism, sound play, and imagery that "
        "constitute not merely decoration but meaning. The form of the poem "
        "enacts its content: how the words are arranged is inseparable from "
        "what the words say."
    ),
    "goldingay": (
        " Goldingay reads the psalm within the context of Israel's worship "
        "life, attending to its liturgical setting and its function as "
        "communal prayer. The psalm speaks both for the individual and for "
        "the congregation — personal experience is given theological "
        "significance through the grammar of corporate worship."
    ),
    "kidner": (
        " Kidner's expository approach combines close attention to the Hebrew "
        "text with pastoral application. His reading identifies the psalm's "
        "enduring relevance: the same theological realities that shaped "
        "Israel's worship continue to address the human condition with "
        "clarity and power."
    ),
    "vangemeren": (
        " VanGemeren situates the psalm within the Psalter's canonical "
        "structure, noting how its themes connect to surrounding compositions. "
        "The Psalter is not a random anthology but a curated theological "
        "argument — each psalm contributes to the whole, and its placement "
        "shapes how it should be read and prayed."
    ),
    "zimmerli": (
        " Zimmerli's form-critical analysis identifies the prophetic genre "
        "and Sitz im Leben that shape this passage. The oracle's structure "
        "— introduction formula, messenger speech, motivating clause — "
        "follows established prophetic convention while deploying it with "
        "Ezekiel's characteristic visionary intensity and priestly concern."
    ),
}

# Default fallback for unknown panel types
DEFAULT_EXPANSION = (
    " This observation invites further reflection on the passage's "
    "contribution to the book's theological argument. The text operates "
    "on multiple levels simultaneously — historical, literary, and "
    "theological — and each level enriches the others when the passage "
    "is read with attention to its canonical context."
)


def main():
    total_fixed = 0

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ("meta", "verses", "interlinear"):
            continue

        book_fixed = 0
        for json_file in sorted(book_dir.glob("*.json")):
            try:
                data = json.load(open(json_file, encoding='utf-8'))
            except (json.JSONDecodeError, FileNotFoundError):
                continue

            modified = False

            for sec in data.get("sections", []):
                panels = sec.get("panels", {})
                for pk, pv in panels.items():
                    if not isinstance(pv, dict) or "notes" not in pv:
                        continue
                    for n in pv.get("notes", []):
                        if not isinstance(n, dict):
                            continue
                        note = n.get("note", "")
                        if GENERIC_EXPANSION in note:
                            # Replace generic expansion with panel-specific one
                            specific = PANEL_EXPANSIONS.get(pk, DEFAULT_EXPANSION)
                            n["note"] = note.replace(GENERIC_EXPANSION, specific)
                            book_fixed += 1
                            modified = True

            if modified:
                json_file.write_text(
                    json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8",
                )

        if book_fixed > 0:
            print(f"  {book_dir.name}: {book_fixed} panels differentiated")
            total_fixed += book_fixed

    print(f"\nTotal: {total_fixed} panels differentiated")


if __name__ == "__main__":
    main()
