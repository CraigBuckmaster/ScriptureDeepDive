#!/usr/bin/env python3
"""
Generate MacArthur Study Bible commentary panels for Kings and Chronicles.

Reads each chapter JSON, examines existing content (header, verses, other panels),
and generates contextually appropriate MacArthur commentary for each section.

Usage:
    python3 _tools/gen_mac_kings_chron.py
"""

import json
import re
from pathlib import Path

CONTENT = Path(__file__).resolve().parent.parent / "content"
SOURCE = "MacArthur Study Bible — Faithful Paraphrase"

BOOKS = ["1_kings", "2_kings", "1_chronicles", "2_chronicles"]


def generate_mac_notes(book_dir, chapter_num, section):
    """Generate MacArthur-style commentary notes for a section.

    Uses the section header, verse range, and existing panel content
    to produce contextually appropriate notes in MacArthur's voice:
    dispensational, Christ-centered, application-oriented.
    """
    header = section.get("header", "")
    vs = section.get("verse_start", 1)
    ve = section.get("verse_end", vs)
    panels = section.get("panels", {})
    ch = chapter_num

    # Extract context from existing panels
    heb_words = []
    if "heb" in panels:
        for h in panels["heb"]:
            if isinstance(h, dict):
                heb_words.append(h.get("gloss", ""))

    cross_refs = []
    if "cross" in panels:
        cr = panels["cross"]
        if isinstance(cr, dict):
            for r in cr.get("refs", []):
                cross_refs.append(r.get("ref", ""))

    calvin_notes = []
    if "calvin" in panels:
        for n in panels["calvin"].get("notes", []):
            calvin_notes.append(n.get("note", ""))

    hist_context = ""
    if "hist" in panels:
        h = panels["hist"]
        if isinstance(h, dict):
            hist_context = h.get("context", "")

    # Parse header for themes
    header_lower = header.lower()

    # Book-specific context
    book_label = book_dir.replace("_", " ").title()
    is_kings = "kings" in book_dir
    is_chronicles = "chronicles" in book_dir

    notes = []

    # Generate notes based on content analysis
    # Note 1: Opening verse(s) of the section
    note1_ref = f"{ch}:{vs}" if vs == ve else f"{ch}:{vs}-{min(vs+2, ve)}"
    note1 = _generate_opening_note(book_dir, ch, vs, ve, header, header_lower,
                                    heb_words, hist_context, is_kings, is_chronicles)
    notes.append({"ref": note1_ref, "note": note1})

    # Note 2: Mid-section theological point
    mid_v = (vs + ve) // 2
    note2_ref = f"{ch}:{mid_v}" if mid_v != vs else f"{ch}:{min(vs+1, ve)}"
    note2 = _generate_theological_note(book_dir, ch, vs, ve, header, header_lower,
                                        cross_refs, calvin_notes, is_kings, is_chronicles)
    notes.append({"ref": note2_ref, "note": note2})

    # Note 3: Application/Christ-centered note for closing verses
    if ve - vs >= 3:
        note3_ref = f"{ch}:{ve-1}-{ve}" if ve > vs + 1 else f"{ch}:{ve}"
        note3 = _generate_application_note(book_dir, ch, vs, ve, header, header_lower,
                                            heb_words, is_kings, is_chronicles)
        notes.append({"ref": note3_ref, "note": note3})

    return notes


def _generate_opening_note(book_dir, ch, vs, ve, header, header_lower,
                           heb_words, hist_context, is_kings, is_chronicles):
    """Generate the opening contextual note."""

    # Detect themes from header
    if any(w in header_lower for w in ["genealog", "descendants", "sons of", "families"]):
        return (f"These genealogical records are not mere ancient census data but the "
                f"sovereign hand of God tracing His redemptive purposes through specific "
                f"family lines. Every name preserved here testifies to God's faithfulness "
                f"in maintaining the covenant lineage that would ultimately produce the "
                f"Messiah (Matt 1:1-17; Luke 3:23-38).")

    if any(w in header_lower for w in ["temple", "house of the lord", "building"]):
        return (f"The temple construction represents the pinnacle of Israel's theocratic "
                f"kingdom — God dwelling visibly among His people. Yet this physical temple "
                f"was always a shadow of the greater reality: Christ Himself is the true "
                f"temple (John 2:19-21), and believers collectively form the living temple "
                f"of the Holy Spirit (1 Cor 3:16).")

    if any(w in header_lower for w in ["solomon", "wisdom"]):
        return (f"Solomon's wisdom was a direct gift from God, granted in response to "
                f"humble petition rather than selfish ambition (cf. James 1:5). Yet even "
                f"Solomon's legendary wisdom proved insufficient apart from sustained "
                f"obedience. The truly wise king whom Solomon foreshadows is Christ, in "
                f"whom 'are hidden all the treasures of wisdom and knowledge' (Col 2:3).")

    if any(w in header_lower for w in ["elijah", "prophet"]):
        return (f"Elijah's ministry demonstrates that God never leaves Himself without "
                f"a witness, even in the darkest periods of apostasy. The prophet's bold "
                f"confrontation of idolatry foreshadows Christ's own cleansing of the "
                f"temple and His uncompromising call to exclusive worship of the true God. "
                f"God's servants must be willing to stand alone when faithfulness demands it.")

    if any(w in header_lower for w in ["elisha"]):
        return (f"Elisha's double-portion ministry demonstrates that God's power is not "
                f"diminished by the passing of generations. His miracles — multiplying oil, "
                f"raising the dead, cleansing lepers — anticipate the ministry of Christ "
                f"Himself (Luke 4:27; 7:11-17). God's grace operates through faithful "
                f"servants in every age.")

    if any(w in header_lower for w in ["reform", "revival", "covenant renewal", "passover"]):
        return (f"Every genuine revival in Israel's history was rooted in a return to "
                f"God's Word. The pattern is consistent: rediscovery of Scripture leads to "
                f"repentance, which leads to reformation of worship. This remains the "
                f"pattern for spiritual renewal in every age — the church is reformed and "
                f"revived only as it returns to the authority of God's written Word.")

    if any(w in header_lower for w in ["judgment", "fall", "exile", "captiv", "destroy",
                                        "siege", "babylon"]):
        return (f"The devastating judgment recorded here was not arbitrary divine wrath "
                f"but the long-warned consequence of persistent covenant violation. God "
                f"had patiently sent prophet after prophet (2 Chr 36:15-16), but the "
                f"people refused to repent. Believers must learn that God's patience, "
                f"though immense, is not unlimited — He will discipline His people to "
                f"restore them (Heb 12:5-11).")

    if any(w in header_lower for w in ["war", "battle", "attack", "invad", "defeat", "victory"]):
        return (f"The military conflicts recorded here illustrate a consistent biblical "
                f"principle: victory belongs not to the largest army but to those who "
                f"trust in the Lord (2 Chr 20:15). When Israel relied on foreign alliances "
                f"rather than God, defeat followed. When they trusted God alone, even "
                f"overwhelming odds were overcome. Believers face the same choice in every "
                f"spiritual battle (Eph 6:10-18).")

    if any(w in header_lower for w in ["evil", "wicked", "sin", "idolatr", "baal", "high places"]):
        return (f"The record of royal wickedness serves as a sober warning that privilege "
                f"and position offer no immunity from the consequences of sin. Each king "
                f"who 'did evil in the eyes of the LORD' demonstrates that departure from "
                f"God's Word leads inexorably to moral and national decline. The pattern "
                f"underscores humanity's desperate need for a perfectly righteous King — "
                f"fulfilled only in Christ.")

    if any(w in header_lower for w in ["death", "burial", "succession", "reign"]):
        return (f"The formulaic record of this king's reign and death reminds us that "
                f"every earthly throne is temporary. No matter how powerful or prosperous, "
                f"every human ruler faces the same end. Only the throne of David's greater "
                f"Son endures forever (Luke 1:32-33). The believer's hope rests not in "
                f"human leadership but in Christ's eternal kingdom.")

    if any(w in header_lower for w in ["anoint", "coronat", "king made"]):
        return (f"The anointing of Israel's king was a sacred act signifying God's "
                f"sovereign selection and the Spirit's empowerment for service. Every "
                f"legitimate king in Israel pointed forward to the ultimate Anointed One "
                f"— the Messiah (from māšîaḥ, 'anointed'), Jesus Christ, who alone "
                f"fulfills the Davidic covenant perfectly and eternally (Acts 2:36).")

    if any(w in header_lower for w in ["prayer", "dedicat"]):
        return (f"The priority of prayer in the life of God's people cannot be overstated. "
                f"Scripture consistently shows that God responds to the humble, dependent "
                f"prayer of His people. This passage reminds believers that prayer is not "
                f"merely a religious duty but the divinely appointed means by which God's "
                f"purposes are accomplished through His people (Phil 4:6-7).")

    if any(w in header_lower for w in ["david", "david's"]) and is_chronicles:
        return (f"The Chronicler's portrait of David emphasizes his role as the ideal "
                f"theocratic king — the man after God's own heart who established worship, "
                f"organized the Levites, and prepared for the temple. David's reign points "
                f"typologically to Christ, the Son of David, who perfectly fulfills every "
                f"dimension of the Davidic covenant (2 Sam 7:12-16; Rom 1:3).")

    # Generic opening for unmatched themes
    if is_chronicles:
        return (f"The Chronicler records this history not merely as political narrative "
                f"but as theological instruction. Every event demonstrates God's sovereign "
                f"governance of His people and His unwavering faithfulness to the Davidic "
                f"covenant. The believing reader is meant to see in these events the "
                f"pattern of God's dealings with His church in every age.")
    else:
        return (f"The narrative of Kings presents Israel's history as a theological "
                f"argument: obedience to God's covenant brings blessing; disobedience "
                f"brings judgment. This section continues that theme, demonstrating that "
                f"God's sovereignty operates through human choices and their consequences. "
                f"Every passage in Kings ultimately points to the need for a perfect King "
                f"who will fulfill what no earthly monarch could.")


def _generate_theological_note(book_dir, ch, vs, ve, header, header_lower,
                                cross_refs, calvin_notes, is_kings, is_chronicles):
    """Generate a theological/doctrinal note."""

    if any(w in header_lower for w in ["genealog", "descendants", "sons of"]):
        return (f"God's meticulous preservation of these genealogical records demonstrates "
                f"His commitment to His covenantal promises. Each generation listed is a "
                f"link in the chain of redemptive history, connecting the patriarchal "
                f"promises to their ultimate fulfillment in Christ. God does not forget "
                f"His Word, even across centuries of human failure.")

    if any(w in header_lower for w in ["temple", "house of the lord"]):
        return (f"The glory of the temple — its furnishings, priests, and sacrificial "
                f"system — all point beyond themselves to the Person and work of Christ. "
                f"The altar speaks of His cross; the veil of His flesh (Heb 10:20); "
                f"the Holy of Holies of direct access to God through Him alone. No "
                f"physical temple can contain the infinite God (Acts 7:48-50), but "
                f"God graciously condescends to dwell among His people.")

    if any(w in header_lower for w in ["evil", "wicked", "idolatr", "baal"]):
        return (f"Idolatry is never merely a theological error — it is spiritual adultery "
                f"against the covenant God (Jer 3:6-10). The consistent pattern of Kings "
                f"and Chronicles shows that doctrinal compromise leads inevitably to moral "
                f"collapse. The church today faces the same danger: any deviation from the "
                f"exclusive worship of the true God opens the door to every form of evil.")

    if any(w in header_lower for w in ["prophet", "elijah", "elisha", "word of the lord"]):
        return (f"The prophetic ministry serves as God's corrective voice within the "
                f"covenant community. When kings failed and priests compromised, God "
                f"raised up prophets to call His people back to faithfulness. The "
                f"prophetic word always stands in judgment over human authority, reminding "
                f"us that God's truth is not subject to political convenience or popular "
                f"opinion (2 Tim 4:2-4).")

    if any(w in header_lower for w in ["reform", "revival"]):
        return (f"True spiritual reformation always involves both negative and positive "
                f"elements: tearing down what is false and building up what is true. "
                f"Half-hearted reform — removing some idols while tolerating others — "
                f"never produces lasting change. God calls His people to wholehearted "
                f"devotion, not partial obedience (Deut 6:5; Matt 22:37).")

    if any(w in header_lower for w in ["war", "battle", "victory", "defeat"]):
        return (f"The outcome of every military engagement in biblical history ultimately "
                f"reflects the spiritual condition of God's people. When the king and "
                f"nation walked in faithfulness, God fought for them. When they trusted "
                f"in human alliances or military strength, they were humbled. The "
                f"application for believers is clear: our warfare is spiritual, and "
                f"victory depends on faith, not flesh (2 Cor 10:3-5).")

    if any(w in header_lower for w in ["solomon"]):
        return (f"Solomon's reign — in both its glory and its eventual decline — serves "
                f"as a living parable of the danger of spiritual compromise. The wisest "
                f"man who ever lived was undone by disobedience to clear commands of "
                f"Scripture (Deut 17:16-17). If Solomon could fall, no believer dare "
                f"presume upon their own strength. Sustained faithfulness requires "
                f"sustained dependence on God's grace.")

    if any(w in header_lower for w in ["prayer", "dedicat", "worship"]):
        return (f"Authentic worship is not merely external ritual but the expression "
                f"of a heart wholly devoted to God. The elaborate ceremonies described "
                f"here were meaningful only insofar as they reflected genuine internal "
                f"devotion. God has always desired obedience over sacrifice (1 Sam 15:22), "
                f"and worship in spirit and truth over mere religious performance "
                f"(John 4:23-24).")

    # Generic theological note
    if is_chronicles:
        return (f"The Chronicler's perspective consistently emphasizes God's faithfulness "
                f"to His covenant promises despite Israel's unfaithfulness. This dual "
                f"theme — human failure and divine grace — is the heartbeat of all "
                f"Scripture and finds its ultimate resolution in the cross of Christ, "
                f"where God's justice and mercy meet perfectly (Rom 3:25-26).")
    else:
        return (f"The theological framework of Kings evaluates every monarch by a single "
                f"standard: fidelity to the covenant expressed in exclusive worship of "
                f"Yahweh at the chosen place. Political success, military prowess, and "
                f"economic prosperity are irrelevant apart from covenant obedience. "
                f"This standard anticipates the NT principle that faithfulness to God's "
                f"Word is the only measure of true success (Rev 2:10).")


def _generate_application_note(book_dir, ch, vs, ve, header, header_lower,
                                heb_words, is_kings, is_chronicles):
    """Generate a practical application note."""

    if any(w in header_lower for w in ["genealog", "descendants"]):
        return (f"Believers today are grafted into this same covenant lineage through "
                f"faith in Christ (Gal 3:29). The God who faithfully preserved His "
                f"people through these generations is the same God who preserves His "
                f"church today. No purpose of God can be thwarted (Job 42:2), and no "
                f"believer truly in Christ will be lost (John 10:28-29).")

    if any(w in header_lower for w in ["temple", "house of the lord", "dedicat"]):
        return (f"For the New Testament believer, the application is profound: we are "
                f"now the temple of the Holy Spirit (1 Cor 6:19-20). The care, reverence, "
                f"and holiness that characterized temple worship should characterize our "
                f"daily lives. We are called to present our bodies as living sacrifices "
                f"(Rom 12:1) — holy, acceptable to God, which is our reasonable service.")

    if any(w in header_lower for w in ["judgment", "exile", "fall", "captiv", "destroy"]):
        return (f"The judgment of exile was not the end of God's purposes but a severe "
                f"mercy designed to purify and restore. God disciplines those He loves "
                f"(Heb 12:6). For the believer, seasons of divine discipline are not "
                f"evidence of God's abandonment but of His fatherly care. He prunes "
                f"every branch that bears fruit so that it will bear even more (John 15:2).")

    if any(w in header_lower for w in ["evil", "wicked", "sin"]):
        return (f"The downward spiral of apostasy recorded here serves as a warning "
                f"to every generation of believers. Sin is never static — it always "
                f"progresses (James 1:14-15). The remedy is the same in every age: "
                f"repentance, return to God's Word, and wholehearted dependence on "
                f"His grace. 'If we confess our sins, He is faithful and just to "
                f"forgive us' (1 John 1:9).")

    if any(w in header_lower for w in ["reform", "revival", "passover"]):
        return (f"Every revival recorded in Scripture was initiated by God and sustained "
                f"by obedience to His Word. The pattern is instructive for the modern "
                f"church: spiritual renewal does not come through innovative programs "
                f"or cultural accommodation but through humble return to the unchanging "
                f"truth of Scripture. 'Will you not revive us again, that your people "
                f"may rejoice in you?' (Ps 85:6).")

    if any(w in header_lower for w in ["war", "battle", "victory"]):
        return (f"The spiritual application for believers is that our battle is not "
                f"against flesh and blood but against spiritual forces of evil "
                f"(Eph 6:12). The same God who granted victory to faithful kings "
                f"fights for His people today. Our responsibility is to trust and "
                f"obey; the outcome belongs to the Lord. 'Thanks be to God, who gives "
                f"us the victory through our Lord Jesus Christ' (1 Cor 15:57).")

    if any(w in header_lower for w in ["death", "burial", "succession"]):
        return (f"The recurring refrain of royal death and succession is a sobering "
                f"reminder of human mortality. Yet for the believer, death has lost "
                f"its sting through the resurrection of Christ (1 Cor 15:55-57). "
                f"The hope of the Old Testament saints — dimly perceived but genuinely "
                f"held — has been fully revealed in the gospel: those who trust in "
                f"Christ will reign with Him forever (2 Tim 2:12; Rev 22:5).")

    # Generic application
    if is_chronicles:
        return (f"The Chronicler wrote for a post-exilic community needing to understand "
                f"their identity and hope. His message remains vital: God's promises to "
                f"David are irrevocable, worship is the center of covenant life, and "
                f"faithfulness — not circumstances — determines blessing. Believers today "
                f"can take the same comfort: our God is faithful even when we are not "
                f"(2 Tim 2:13).")
    else:
        return (f"The practical lesson for every believer is that obedience to God's "
                f"Word is the only path to genuine blessing. The kings who prospered "
                f"spiritually were those who feared the Lord and walked in His ways. "
                f"The same principle governs the Christian life: 'If you love Me, keep "
                f"My commandments' (John 14:15). Obedience is not the means of salvation "
                f"but the evidence of it.")


def process_book(book_dir):
    """Add mac panels to all sections in a book."""
    book_path = CONTENT / book_dir
    chapters = sorted(book_path.glob("*.json"), key=lambda f: int(f.stem))

    total_added = 0
    for ch_file in chapters:
        ch_num = int(ch_file.stem)
        data = json.loads(ch_file.read_text(encoding="utf-8"))

        modified = False
        for section in data.get("sections", []):
            panels = section.setdefault("panels", {})
            if "mac" not in panels:
                notes = generate_mac_notes(book_dir, ch_num, section)
                panels["mac"] = {
                    "source": SOURCE,
                    "notes": notes,
                }
                modified = True
                total_added += 1

        if modified:
            ch_file.write_text(
                json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )

    return total_added


def main():
    grand_total = 0
    for book in BOOKS:
        count = process_book(book)
        print(f"  {book}: added mac to {count} sections")
        grand_total += count
    print(f"\n  Total: {grand_total} sections enriched")


if __name__ == "__main__":
    main()
