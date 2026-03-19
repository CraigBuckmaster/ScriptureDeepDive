"""Numbers chapter generator — NUM-1 through NUM-6."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def num(ch, data):
    build_chapter('numbers', ch, data)

# ─────────────────────────────────────────────────────────────────────────────
# NUM-1: Chapters 1–6 — The Census, Camp Order, Nazirite, and Priestly Blessing
# ─────────────────────────────────────────────────────────────────────────────

num(1, {
    'title': 'The First Census: God Counts His Army',
    'sections': [
        {
            'header': 'Verses 1–19 — The Command to Count Israel',
            'verses': verse_range(1, 19),
            'heb': [
                ('śĕʾû ʾet-rōʾš', 'seu et-rosh', 'lift the head / take a census', 'Literally "lift the head" — the idiom for a census. The head of each tribe is individually named and commissioned. The census is an act of honour: each man counted is acknowledged by name before God.'),
                ('kol-yōṣēʾ ṣābāʾ bĕyiśrāʾēl', 'kol-yotze tzava beYisrael', 'everyone who goes out to war in Israel', 'The census counts men aged 20 and over who are able to serve in the army. Numbers is a military book — Israel is not a wandering band of refugees but a covenant army being organised for conquest.'),
            ],
            'ctx': 'Numbers opens exactly one year and one month after the Exodus (1:1; cf. Exod 12:2) — Israel has been at Sinai for eleven months receiving the law. Now God commissions a military census: all men 20 and older, tribe by tribe, name by name. The census is simultaneously a roll-call of the covenant community and a muster of the army. Twelve tribal leaders are named as co-commissioners. The Levites are explicitly excluded (v.49) — their role is the tabernacle, not the battlefield.',
            'cross': [
                ('Rev 7:4–8', '"Then I heard the number of those who were sealed: 144,000 from all the tribes of Israel." The sealing of 144,000 in Revelation mirrors the tribal census structure of Numbers — God counting and marking his covenant people for a spiritual warfare.'),
                ('Exod 30:12', '"When you take a census of the Israelites to count them, each one must pay the Lord a ransom for his life at the time he is counted." The Sinai census required atonement money; this Numbers census is commissioned by God without that proviso — Israel is already ransomed through Passover.'),
            ],
            'mac': [
                ('1:1–4', 'MacArthur: The census\'s military purpose is explicit — "all the men in Israel who are twenty years old or more and able to serve in the army" (v.3). Numbers is the book of the wilderness army, and this opening muster establishes the context: Israel is not merely a pilgrim community but a covenant force being organised for the conquest of Canaan.'),
                ('1:16–19', 'MacArthur: The twelve named leaders represent a formal military command structure — each is "head of his ancestral tribe" (v.16). Moses and Aaron do not conduct the census alone; they deputise tribal leadership. The covenant community governs itself through distributed, divinely-designated authority.'),
            ],
            'milgrom': [
                ('1:1', 'Milgrom: "On the first day of the second month of the second year after the Israelites came out of Egypt" — the precise date anchors Numbers in the wilderness narrative calendar. The census is taken one month after the tabernacle\'s completion (Exod 40:17). Israel\'s military organisation follows immediately upon the establishment of their sanctuary.'),
                ('1:3', 'Milgrom: The age threshold of 20 corresponds to the age of legal majority in the ancient Near East — the age at which a man became responsible for military service and full covenant obligations. The census defines the adult male covenant community.'),
            ],
            'sarna': [
                ('1:2', 'Sarna: The Hebrew pĕqad (to count, muster, attend to) carries the dual sense of enumeration and care — when God "counts" Israel he is both organising and attending to them. The census is an act of divine notice: each Israelite is personally known and valued.'),
            ],
            'ashley': [
                ('1:1–19', 'Ashley: The census serves multiple purposes simultaneously: military (organising the army), cultic (establishing the community\'s covenant identity), and theological (demonstrating that God\'s promise to Abraham of innumerable descendants is being fulfilled). The 603,550 counted in v.46 represents an extraordinary fulfilment of the Abrahamic promise.'),
            ],
            'alter': [
                ('1:1–4', 'Alter: Numbers opens with bureaucratic precision — date, location, divine command, purpose, methodology. The priestly writers\' characteristic mode is on full display: the sacred is enacted through exact procedure. The census is not merely practical but liturgical; each name lifted before God is an act of consecration.'),
            ],
            'calvin': [
                ('1:1–4', 'Calvin: God commands the census to impress upon Israel that their military strength derives entirely from his provision, not from their own numbers. When the count is complete, Israel must not trust in 603,000 spears — they must trust in the God who counted them. The census humbles as it honours.'),
            ],
            'netbible': [
                ('1:2', 'NET Note: "Take a census" (śĕʾû ʾet-rōʾš) — "lift the head" is the Hebrew idiom for taking a count. In Gen 40:13, 19, the same phrase is used both for restoring someone to honour and for executing them — the census "lifts the head" of each Israelite, acknowledging their individual status before God.'),
            ],
        },
        {
            'header': 'Verses 20–54 — The Tribal Counts; the Levites Exempted',
            'verses': verse_range(20, 54),
            'heb': [
                ('tôladōt', 'toledot', 'generations / family lines / clans', 'The genealogical term running through the Pentateuch — each tribe is counted according to its tôladōt (family divisions). The census organises Israel by its covenant genealogy, not by geography or occupation.'),
                ('pĕquddêhem', 'pequddeihem', 'their numbered ones / their muster', 'From pāqad (to count, muster, visit). The repeated formula "their numbered ones were X" (vv.21, 23, 25…) creates a liturgical cadence — each tribe solemnly numbered and acknowledged.'),
            ],
            'ctx': 'The tribal counts follow a fixed formula: tribe, lineage, total. Judah is the largest (74,600), followed by Dan (62,700) and Simeon (59,300). The smallest is Manasseh (32,200). Total: 603,550 fighting men — a number that will recur in the second census of ch.26, where the new generation is counted after the wilderness deaths. The Levites are exempt from military service (vv.47–54) — their duty is the tabernacle, not the battlefield. They camp around the sanctuary to prevent anyone unauthorised approaching and dying.',
            'cross': [
                ('Exod 1:7', '"The Israelites were exceedingly fruitful; they multiplied greatly, increased in numbers and became so numerous that the land was filled with them." The census numbers fulfil the promise made to Abraham (Gen 15:5) and the fertility described in Exodus\'s opening — against every attempt to suppress them.'),
                ('Heb 12:22–23', '"You have come to Mount Zion… to the church of the firstborn, whose names are written in heaven." The NT community also has a heavenly census — names individually recorded before God.'),
            ],
            'mac': [
                ('1:47–54', 'MacArthur: The Levites\' exemption from military service is a profound theological statement: the ministry of the sanctuary is as essential to Israel\'s survival as the army. Without the tabernacle — the locus of divine presence — the army has nothing to fight for. Without the army, the tabernacle has no protection. The two vocations are complementary, not competing.'),
            ],
            'milgrom': [
                ('1:47–53', 'Milgrom: The Levites camp "around the tabernacle of the covenant law" to provide a buffer between the holy sanctuary and the ordinary Israelites. Milgrom\'s insight: proximity to the holy is dangerous for the unprepared (cf. Lev 10; Num 4:15, 20). The Levites form a graded cordon of holiness — protecting both the sanctuary from defilement and the people from the consequences of inadvertent approach.'),
            ],
            'ashley': [
                ('1:47–54', 'Ashley: The Levites\' exemption is not a privilege but a responsibility — they bear the tabernacle and answer for any defilement of it. "The Israelites are to set up their tents by divisions, each man in his own camp under his own standard" (v.52). Order in the camp reflects the order of creation: God is holy, his dwelling is holy, and the community organised around it must reflect that holiness.'),
            ],
            'sarna': [
                ('1:46', 'Sarna: The total of 603,550 fighting men implies a total Israelite population of approximately 2 million — a figure that has generated extensive scholarly debate. Milgrom and others argue for alternative readings of ʾelep (thousand) as a military unit rather than a literal numeral, producing smaller figures. The text\'s theological point is consistent regardless: the covenant community has grown beyond all human calculation.'),
            ],
            'alter': [
                ('1:20–43', 'Alter: The census list\'s formulaic repetition — each tribe given identical linguistic treatment — is a deliberate literary strategy. Twelve tribes, twelve formulas, twelve totals: the unity and completeness of Israel is embodied in the list\'s structure. The repetition is not monotony but music — a twelve-note chord of the covenant community.'),
            ],
            'calvin': [
                ('1:47–54', 'Calvin: The separation of the Levites for sanctuary service teaches the perpetual need for a dedicated ministry. The entire people cannot be priests — specialisation in sacred service is a divine provision, not a human hierarchy. The NT equivalent is the gift of pastor-teachers to the church (Eph 4:11–12): not to do all the work but to equip the whole community.'),
            ],
            'netbible': [
                ('1:46', 'NET Note: The total of 603,550 echoes the count in Exod 38:26, providing narrative continuity across the Pentateuch. The consistency of the number across different contexts suggests it was a theologically significant figure in Israelite tradition — whatever its precise demographic meaning.'),
            ],
        },
    ],
})

num(2, {
    'title': 'The Camp Arrangement: God\'s Army in Formation',
    'sections': [
        {
            'header': 'Verses 1–17 — The East and South Divisions',
            'verses': verse_range(1, 17),
            'heb': [
                ('degel', 'degel', 'standard / banner / division', 'Each grouping of three tribes marches under a degel (banner/standard). The camp is organised into four divisions of three tribes, each with a lead tribe (Judah, Reuben, Ephraim, Dan). The standards create a sacred geography around the tabernacle.'),
                ('mûl', 'mul', 'opposite / facing / in front of', 'Each tribe camps "facing" the tent of meeting — every Israelite\'s tent is oriented toward the sanctuary. The spatial arrangement ensures that God\'s dwelling is the centre of Israel\'s literal and symbolic world.'),
            ],
            'ctx': 'Numbers 2 describes the camp arrangement: the tabernacle at the centre, the Levites forming the inner ring, and the twelve tribes in four groups of three forming the outer ring. East side: Judah (lead), Issachar, Zebulun. South: Reuben (lead), Simeon, Gad. West: Ephraim (lead), Manasseh, Benjamin. North: Dan (lead), Asher, Naphtali. Judah leads the march — the tribe of royalty, from which the messianic king will come. The arrangement is a theology in spatial form: God at the centre, surrounded by his covenant people in ordered formation.',
            'cross': [
                ('Rev 21:12–14', 'The New Jerusalem has twelve gates named after the twelve tribes of Israel — the eschatological camp arrangement. The tribes\' permanent orientation toward the divine presence (Num 2) prefigures the eternal community\'s orientation toward the throne.'),
                ('Ezek 1:10', 'The four faces of the living creatures (lion, ox, man, eagle) were associated in rabbinic tradition with the four lead tribes of Numbers 2 (Judah the lion, Reuben the man, Ephraim the ox, Dan the eagle). The creatures of the divine throne-chariot mirror the camp arrangement of the covenant army.'),
            ],
            'mac': [
                ('2:1–2', 'MacArthur: "Each man under his standard with the banners of his family" — the camp organisation is not merely practical but theological. Every Israelite knows their place: tribe, family, standard, direction of camp. There is no anonymity before God. The ordered camp is a visible parable of the ordered covenant community.'),
                ('2:9', 'MacArthur: Judah leads the eastern division with 186,400 men — the largest division. Judah\'s precedence reflects the blessing of Jacob (Gen 49:8–10): the sceptre will not depart from Judah. The march order of Numbers anticipates the monarchy — Judah first, always.'),
            ],
            'milgrom': [
                ('2:1–2', 'Milgrom: The tabernacle at the centre of the camp is the spatial expression of YHWH\'s kingship over Israel. The surrounding tribes are the vassal army of the divine king. Milgrom draws the parallel to ancient Near Eastern battle arrangements: the king\'s tent at the centre, the army surrounding it. Israel\'s camp is a theocratic military formation.'),
            ],
            'ashley': [
                ('2:1–34', 'Ashley: The fourfold camp arrangement (east, south, west, north) mirrors the structure of Eden and the new Jerusalem — the divine dwelling at the centre, the covenant community radially arranged around it. Numbers 2 is a liturgical diagram: it teaches Israel what their relationship to God looks like when lived out in space.'),
            ],
            'sarna': [
                ('2:3', 'Sarna: Judah\'s position on the east side — the side of the tabernacle\'s entrance — gives it the place of highest honour. The sunrise comes from the east; the gate of approach is from the east. Judah as the lead tribe camps at the point where the divine presence is most directly approached.'),
            ],
            'alter': [
                ('2:1–2', 'Alter: The camp arrangement instruction is spare — "under his standard… facing the tent of meeting on all sides." But its theological density is enormous: Israel oriented toward God\'s dwelling, each tribe in its place, the whole community forming a living frame around the divine presence. The text describes a habitation, not just an encampment.'),
            ],
            'calvin': [
                ('2:1–2', 'Calvin: The ordered camp teaches that worship requires structure. God does not merely call Israel to follow him into the wilderness — he organises them around himself with military precision. True religion is not formless enthusiasm but ordered approach to a holy God. The church that abandons order abandons something of the divine design.'),
            ],
            'netbible': [
                ('2:2', 'NET Note: "At a distance around the tent of meeting" — the exact distance is not specified. The arrangement creates a buffer between the ordinary camp and the sacred tent, corresponding to the concentric holiness zones of the tabernacle itself (outer court, holy place, most holy place).'),
            ],
        },
        {
            'header': 'Verses 18–34 — The West and North Divisions; the March Order',
            'verses': verse_range(18, 34),
            'heb': [
                ('lĕmassĕʿêhem', 'lemasei\'hem', 'according to their divisions / when they set out', 'The march order mirrors the camp order — Judah sets out first, then Reuben, then the tabernacle carried by the Levites in the middle, then Ephraim, then Dan as the rear guard. The theology of the camp is the theology of the march: God at the centre, surrounded and protected by his covenant people.'),
            ],
            'ctx': 'The west and north divisions complete the fourfold camp. Ephraim leads the western division (108,100), representing the Joseph tribes. Dan leads the north and acts as the rear guard (157,600 — the second largest). The total camp count of 603,550 matches the census of ch.1. The chapter closes by noting that the Levites, not counted here, travel with the tabernacle in the centre of the march — they are at once the most protected (surrounded by all twelve tribes) and the most exposed (closest to the dangerous holiness of the divine presence).',
            'cross': [
                ('Num 10:14', '"The divisions of the camp of Judah went first." The camp arrangement of Numbers 2 is enacted in the march of Numbers 10 — the theology of spatial order becomes the theology of historical movement.'),
                ('1 Cor 14:40', '"Everything should be done in a fitting and orderly way." Paul\'s instruction to the Corinthian church echoes the camp-order theology of Numbers: the community gathered around God must be ordered, not chaotic.'),
            ],
            'mac': [
                ('2:17', 'MacArthur: "The tent of meeting and the Levites\' camp shall set out in the middle of the camps." The tabernacle marches at the heart of Israel\'s formation — surrounded by the covenant people, carried by the Levites, the locus of divine presence moving with the community. Israel is not marching toward God; they are marching with him.'),
            ],
            'milgrom': [
                ('2:32–34', 'Milgrom: The closing summary emphasises obedience: "just as the Lord commanded Moses, so the Israelites did." The camp arrangement is a divine specification, not a human convention. Milgrom notes this compliance formula appears repeatedly in Numbers where Israel obeys — its absence in the rebellion narratives of chapters 11–14 and 20 is pointed.'),
            ],
            'ashley': [
                ('2:31–34', 'Ashley: Dan as the rear guard is the tribe of the rearguard — the last to set out, gathering the stragglers. It is a role of honour and responsibility: those who march last protect the most vulnerable. In Israel\'s later tribal history, Dan occupies the northernmost boundary of the land — always at the edge, always the outer guardian.'),
            ],
            'alter': [
                ('2:32–34', 'Alter: The closing compliance formula — "just as the Lord commanded Moses" — is the camp narrative\'s theological exclamation point. The entire elaborate arrangement, tribe by tribe, standard by standard, is a single act of obedience. Obedience is the medium through which the ordered community of God is constructed.'),
            ],
            'calvin': [
                ('2:18–34', 'Calvin: The precision of the camp arrangement — every tribe knowing its place, every family its location — teaches that order is not an imposition on freedom but its prerequisite. The Israelite who knew his place in the camp could move freely within that order. The Christian who understands their place in the body of Christ (1 Cor 12) is free to exercise their gifts without confusion.'),
            ],
            'netbible': [
                ('2:17', 'NET Note: The tabernacle in the "middle" (bĕtôk) of the marching formation provides maximum security — every threat from any direction must pass through six tribes\' formations before reaching the divine dwelling. The arrangement is simultaneously devotional and strategic.'),
            ],
        },
    ],
})

num(3, {
    'title': 'The Levites: Substitutes for the Firstborn',
    'sections': [
        {
            'header': 'Verses 1–26 — Aaron\'s Sons; Levitical Clans and Their Duties',
            'verses': verse_range(1, 26),
            'heb': [
                ('pĕqûdê', 'pequdei', 'the appointed ones / the numbered ones of', 'The Levites are separately numbered — not for military service but for sanctuary service. Their census is a consecration roster, not a military muster.'),
                ('nĕtûnîm', 'netunim', 'given ones / those who are given', 'The Levites are "given" (nātan) to Aaron (v.9) — dedicated to priestly service as assistants. The same word used in Ezra-Nehemiah for the temple servants (nĕtînîm) traces back to this Numbers commissioning.'),
            ],
            'ctx': 'Numbers 3 introduces the Levites\' formal appointment. The chapter opens with Aaron\'s surviving sons (Eleazar and Ithamar — Nadab and Abihu having died in Lev 10) then details the three Levitical clans: Gershon (camp duties, west side), Kohath (most holy objects, south side), Merari (structural elements, north side). Moses and Aaron camp at the east — the entrance side, the place of highest holiness. The theological centre of the chapter is the substitution principle (vv.40–51): God claims every firstborn of Israel as his (from the Passover night, Exod 13); the Levites are given in substitution for the firstborn. Israel\'s firstborns are redeemed; the Levites serve in their place.',
            'cross': [
                ('Heb 7:11–12', '"If perfection could have been attained through the Levitical priesthood… why was there still need for another priest, one in the order of Melchizedek, not in the order of Aaron?" The Levitical arrangement of Numbers 3–4 is the priestly system Hebrews declares superseded by Christ.'),
                ('Rom 12:1', '"Offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship." The NT equivalent of Levitical consecration: every believer given to God as a substitute, serving in place of the old sacrificial system.'),
            ],
            'mac': [
                ('3:5–10', 'MacArthur: The Levites\' role as assistants (mĕšārtîm) to Aaron reflects the permanent principle that priestly ministry requires both the office-holder (Aaron) and the supporting community (Levites). No minister of God works alone; the covenant structure provides for distributed, collaborative service.'),
                ('3:14–20', 'MacArthur: The three Levitical clans — Gershon, Kohath, Merari — correspond to Levi\'s three sons (Gen 46:11). The entire clan structure of Israel\'s priestly assistants traces back to one man\'s three sons. The covenant family is the building block of covenant service.'),
            ],
            'milgrom': [
                ('3:9', 'Milgrom: "Give the Levites to Aaron and his sons — they are to be given wholly to him." The Levites are not independent ministers but appendages of the Aaronic priesthood. Milgrom\'s priestly-institutional reading: the Levitical system creates a graded hierarchy of holiness — Aaronic priests at the top, Levites below them, Israelites below that — with the gradations protecting the sacred core from unauthorized access.'),
                ('3:40–51', 'Milgrom: The firstborn-Levite exchange is one of Numbers\' most theologically rich passages. God owns every firstborn (Exod 13:2) — the Passover established his claim. The Levites are given as substitutes, releasing Israel\'s firstborn from their obligations. The five-over redemption money (v.46) covers the excess where Levites don\'t fully substitute numerically.'),
            ],
            'ashley': [
                ('3:5–10', 'Ashley: The appointment of the Levites establishes the principle that access to God is mediated, graduated, and structured. Not everyone approaches the sanctuary the same way — not because God favours some people but because holiness requires appropriate preparation, and the Levitical system provides it.'),
            ],
            'sarna': [
                ('3:1', 'Sarna: "These are the family records of Aaron and Moses at the time the Lord spoke to Moses at Mount Sinai." The tôlĕdôt formula (family records/generations) signals a new narrative unit. Numbers 3 is a genealogical commissioning: the Levites\' identity and function are inseparable from their ancestry.'),
            ],
            'alter': [
                ('3:40–43', 'Alter: The counting of the firstborn male Israelites (22,273) versus the Levites (22,000) creates a 273-person surplus that requires redemption money. The arithmetic is deliberate theology — the substitution is almost perfect but not quite, and the residue requires a financial transaction. No theological exchange is entirely symmetrical; grace always involves surplus.'),
            ],
            'calvin': [
                ('3:40–51', 'Calvin: The firstborn-Levite exchange teaches that all of Israel belongs to God — not just the Levites but every firstborn, every family. The Levites serve as the visible symbol of the invisible truth: the whole people is God\'s possession. The NT fulfils this: "You are not your own; you were bought at a price" (1 Cor 6:20).'),
            ],
            'netbible': [
                ('3:9', 'NET Note: "Wholly given" — nĕtûnîm nĕtûnîm (double noun), an emphatic construction. The Levites are not partially consecrated — they are entirely given over to priestly service. The double form emphasises totality of dedication: nothing of the Levite\'s life is held back from covenant service.'),
            ],
        },
        {
            'header': 'Verses 27–51 — Kohath and Merari; the Firstborn Exchange',
            'verses': verse_range(27, 51),
            'heb': [
                ('miqdāš', 'miqdash', 'sanctuary / holy place', 'From qādaš (holy). The Kohathites care for the most holy objects — ark, table, lampstand, altars. Their proximity to the miqdāš is the highest honour and the greatest danger in Israel\'s priestly system.'),
                ('pĕdûyê hāʾōdĕpîm', 'peduyei ha\'odepim', 'the redemption money for those in excess', 'The 273 firstborn Israelites who exceed the Levite count must be redeemed at 5 shekels each. The arithmetic gap between types and antitypes requires a supplementary payment — a principle Paul will apply to Christ\'s work: he pays the excess that the old system could not cover.'),
            ],
            'ctx': 'Kohath (8,600 males) guards the most holy objects and camps on the south side; they will carry the ark and sanctuary furnishings when Israel moves. Merari (6,200 males) camps on the north and carries the structural elements — frames, crossbars, posts. Together the Levitical clans form a graded ring of sanctuary service around the tabernacle. The chapter closes with the firstborn exchange: 22,000 Levites substitute for 22,273 firstborn Israelites; the 273 surplus are redeemed at 5 shekels each, a total of 1,365 shekels given to Aaron.',
            'cross': [
                ('Num 4:1–20', 'Numbers 4 specifies exactly how the Kohathites handle the most holy objects for transport — they must not touch them or even look at them uncovered. The Numbers 3 assignment leads directly into the Numbers 4 protocols: privilege and danger are inseparable in the Levitical system.'),
                ('1 Pet 2:9', '"You are a royal priesthood." The entire Levitical arrangement of Numbers 3 points toward the NT\'s democratisation of priestly access: in Christ, all believers are given to God as the ultimate firstborn exchange, all serving as priests before him.'),
            ],
            'mac': [
                ('3:27–32', 'MacArthur: Eleazar son of Aaron oversees all the Levites (v.32) — the priestly hierarchy is clear. The Kohathites are the most privileged (they carry the ark) but also the most restricted (they cannot touch the holy objects). High privilege always entails high accountability in the Levitical system.'),
            ],
            'milgrom': [
                ('3:31', 'Milgrom: The Kohathites\' charge — "the ark, the table, the lampstand, the altars, the articles of the sanctuary… the curtain, and everything related to their use" — is a comprehensive list of the tabernacle\'s most holy furnishings. Milgrom notes these are precisely the items behind the inner curtain (Exod 26:33) — Kohath has access to the Most Holy Place\'s contents, if not to the space itself.'),
            ],
            'ashley': [
                ('3:40–51', 'Ashley: The firstborn-Levite exchange is grounded in the Exodus event (v.13, "when I struck down all the firstborn in Egypt, I set apart for myself every firstborn in Israel"). The Passover not only saved Israel — it created a permanent divine claim on every firstborn. The Levites serve as the institutional expression of that claim.'),
            ],
            'sarna': [
                ('3:46–51', 'Sarna: The 5-shekel redemption price for the surplus firstborn is the same as the valuation of a male infant in Lev 27:6. The consistency of the pricing across different contexts suggests a standard redemption tariff in Israelite law.'),
            ],
            'alter': [
                ('3:27–32', 'Alter: The Kohathites\' charge over "the ark, the table, the lampstand, the altars" is listed in the same order as these objects were constructed in Exodus 25–27 — the priestly tradition maintains strict order even in listing. The objects of the sanctuary have a theological sequence; their custody follows the same sequence.'),
            ],
            'calvin': [
                ('3:27–51', 'Calvin: The elaborate Levitical hierarchy — Kohath nearest the holy, Merari farthest — teaches that proximity to God carries proportional responsibility. We do not all stand equally close to the holy; those entrusted with greater access are more accountable. The NT equivalent: teachers will be judged more strictly (Jas 3:1) precisely because their office brings them nearest to the word of God.'),
            ],
            'netbible': [
                ('3:38', 'NET Note: Moses and Aaron camp at the entrance to the tabernacle on the east — the side of the tabernacle\'s entrance and the sunrise. Their position is both the most accessible (facing the entrance) and the most protective (guarding the approach). Moses as prophet and Aaron as priest together guard the gateway to the divine presence.'),
            ],
        },
    ],
})

num(4, {
    'title': 'The Transport Duties of the Levitical Clans',
    'sections': [
        {
            'header': 'Verses 1–20 — The Kohathites: Covering the Most Holy Things',
            'verses': verse_range(1, 20),
            'heb': [
                ('makkĕsēh ʿôr taḥaš', 'makhseh or tachash', 'covering of sea-cow hide / dugong leather', 'The outermost protective covering for the holy objects during transport. The tachash skin (possibly dugong or porpoise hide) provides both physical protection and visible distinction — the ark and furnishings travel wrapped, hidden from sight, inaccessible to touch.'),
                ('wĕlōʾ yābōʾû lirʾôt kĕballa', 'welo yavo lirot kevalah', 'they shall not go in to see the holy things being covered', 'The Kohathites must not watch Aaron and his sons cover the objects for transport. The holy things in their transitional state — being wrapped but not yet fully covered — are supremely dangerous. Even the most privileged Levites are excluded from the act of covering itself.'),
            ],
            'ctx': 'Numbers 4 specifies the exact transport protocols for each Levitical clan. The Kohathites carry the most holy objects — but only after Aaron and his sons have covered them. The sequence is precise: ark covered with the veil from before the Lord → badger skin → blue cloth; table → blue cloth → scarlet cloth → badger skin; lampstand → blue cloth → badger skin; altars → blue cloth → badger skin. Every sacred object has a specific wrapping order. The Kohathites then carry these without touching them (using poles or frames). Anyone who touches the holy objects or even looks at them uncovered dies (v.20).',
            'cross': [
                ('2 Sam 6:6–7', 'Uzzah touched the ark to steady it and died. The Num 4:15 protocol — "they must not touch the holy things or they will die" — was not merely Levitical fine print but a description of the actual lethal character of holiness mishandled.'),
                ('Heb 9:5', '"Above the ark were the cherubim of the Glory, overshadowing the atonement cover." The writer of Hebrews describes the ark\'s mercy seat — the very surface covered in the precise order of Num 4:5–6 — as the locus of the divine Glory.'),
            ],
            'mac': [
                ('4:5–6', 'MacArthur: The ark receives the most elaborate covering sequence — the inner veil (the boundary between Most Holy Place and Holy Place, literally "the curtain of the screen"), then the badger skin, then a solid blue cloth, then the carrying poles inserted. The most holy object receives the most thorough concealment. The principle: the holier the object, the more layers of separation between it and ordinary access.'),
                ('4:15–20', 'MacArthur: "They must not touch the holy things or they will die." The Kohathites\' privilege is inseparable from their vulnerability. To carry the ark is the highest Levitical honour — and the highest Levitical risk. There is no proximity to the holy that does not also involve proximity to death for the unprepared.'),
            ],
            'milgrom': [
                ('4:5–6', 'Milgrom: The covering sequence for the ark — inner veil, then outer skins, then blue cloth — is precisely the reverse of the order in which the tabernacle itself was constructed (blue cloth first, then coverings). The dismantling-for-transport reverses the construction order, maintaining the theological logic at every stage.'),
                ('4:20', 'Milgrom: "They must not go in to see the holy things even for a moment, or they will die." The word kĕballa (even for a moment / as it is being covered) is a hapax legomenon. The restriction covers even the briefest, most incidental glimpse during the covering process — holiness admits no casual viewing.'),
            ],
            'ashley': [
                ('4:1–20', 'Ashley: The elaborate transport protocols reveal a key theological principle: holiness is not simply a spiritual category but has physical, material reality. The ark is genuinely dangerous to touch; the covering genuinely protects. The material and the sacred are not separate realms in Numbers\' worldview.'),
            ],
            'sarna': [
                ('4:5–14', 'Sarna: Each sacred object receives a covering that reflects its function: the ark (blue, associated with heaven/divine presence), the table (scarlet, associated with the sacred meal), the lampstand (blue, associated with heaven\'s light). The colour coding is a visible theology: each object\'s covering declares its spiritual significance.'),
            ],
            'alter': [
                ('4:5–15', 'Alter: The minute specificity of the covering instructions — blue cloth, badger skin, carrying poles in this order, that direction — is the priestly writers at their most characteristic. The holy is managed through exact procedure. There is no room for improvisation when handling the divine presence; improvisation is what killed Nadab and Abihu.'),
            ],
            'calvin': [
                ('4:15', 'Calvin: "They must not touch the holy things or they will die" teaches the utter holiness of God and the utter inadequacy of the unprepared human approach. The elaborate covering protocols are an enacted sermon: nothing common can make contact with the divine without mediation. Christ is the ultimate covering — through him, humanity can approach the holiness that would otherwise be lethal.'),
            ],
            'netbible': [
                ('4:6', 'NET Note: "Spread a solid blue cloth over it" — the blue cloth covering the already-covered ark marks it visually for the Kohathites as the most holy object during transport. Blue (tĕkēlet) is the colour of the sky/heaven — the covering that belongs to God.'),
            ],
        },
        {
            'header': 'Verses 21–49 — The Gershonites and Merarites; Service Ages',
            'verses': verse_range(21, 49),
            'heb': [
                ('kol-bāʾ laṣṣābāʾ', 'kol-ba latzava', 'all who come to serve / enter the service', 'The service age is 30–50 for all Levitical clans. The Hebrew ṣābāʾ (service/army/host) is the same word used for the military census — Levitical sanctuary service is treated with the same seriousness as military service. Both are forms of covenant warfare.'),
            ],
            'ctx': 'The Gershonites (vv.21–28) carry the curtains, coverings, screens, and ropes — the fabric components of the tabernacle. The Merarites (vv.29–33) carry the structural elements: boards, crossbars, posts, bases — the heavy skeleton of the sanctuary. Both clans serve under the direction of the Aaronic priests (Ithamar son of Aaron coordinates both). The service age of 30–50 is significant: Moses and Aaron presumably counted these men separately from the general census (ages 20–60). The chapter closes with the totals: Kohath 2,750; Gershon 2,630; Merari 3,200 — total Levites in active service: 8,580.',
            'cross': [
                ('Luke 3:23', '"Now Jesus himself was about thirty years old when he began his ministry." Jesus begins his public ministry at the same age as the Levites enter full sanctuary service — the connection was not lost on the early church.'),
                ('1 Chr 23:24–27', 'David later lowers the Levitical service age to 20 — the same as the military census age — reflecting the permanent establishment of the temple and reduced need for the heavy physical transport work of the wilderness period.'),
            ],
            'mac': [
                ('4:21–28', 'MacArthur: The Gershonites\' duty — carrying curtains, screens, and coverings — may seem less prestigious than the Kohathites\' ark-carrying, but without the Gershonite fabric the sanctuary has no walls or roof. Every role in the service of God is essential; hierarchy of honour does not imply hierarchy of importance.'),
                ('4:46–49', 'MacArthur: The total of 8,580 active Levitical servants (ages 30–50) from 22,000 total Levites reflects a natural age distribution. Not all are called to the most physically demanding period of service simultaneously. God\'s workforce is efficiently distributed across the life cycle.'),
            ],
            'milgrom': [
                ('4:29–33', 'Milgrom: The Merarites carry the heaviest load — boards, crossbars, posts, and their heavy bronze bases — and receive the most detailed inventory list. Their service is the most physically demanding and the least glamorous. Milgrom notes that every component of the sanctuary is essential: without the Merarites\' boards and bases, the Kohathites have no building to serve in.'),
            ],
            'ashley': [
                ('4:34–49', 'Ashley: The service age of 30–50 reflects practical wisdom: the work of transporting the tabernacle required mature strength and experience, not just youthful energy. The Levitical system matches the physical demands of each role to the life stage of its workers — a principle of stewardship that values both the individual and the task.'),
            ],
            'alter': [
                ('4:46–49', 'Alter: The census summary — tribe by tribe, total by total, grand total at the end — mirrors the structure of the military census in ch.1. The Levitical service census uses the same formal apparatus as the military muster, reinforcing the theological equivalence: sanctuary service is Israel\'s most important warfare.'),
            ],
            'calvin': [
                ('4:21–49', 'Calvin: The distribution of Levitical duties teaches the body-of-Christ principle centuries before Paul articulates it: many members, one body, each part essential. The curtain-carriers are not less holy than the ark-carriers; the structural-component teams are not less consecrated than the most holy object teams. Diversity of gifts within unity of purpose.'),
            ],
            'netbible': [
                ('4:30', 'NET Note: Service age "from thirty to fifty years old" — the lower age of 30 ensures Levites have reached full physical and presumably spiritual maturity. The upper limit of 50 coincides with the anticipated decline of physical strength needed for the heavy transport work. After 50, the Levite presumably continues in advisory or lighter service roles.'),
            ],
        },
    ],
})

num(5, {
    'title': 'Purity of the Camp: Restitution, Jealousy, and Unfaithfulness',
    'sections': [
        {
            'header': 'Verses 1–10 — Exclusion of the Unclean; Restitution Laws',
            'verses': verse_range(1, 10),
            'heb': [
                ('wĕšallĕḥû min-hammahăneh', 'weshallchu min-hamachaneh', 'they shall be sent outside the camp', 'The camp\'s holiness requires the exclusion of ritual impurity — those with infectious skin diseases, discharges, or corpse-contamination. The same logic as the purity laws of Lev 13–15 applied to the camp\'s military-sacred context.'),
                ('maʿal māʿal', 'ma\'al ma\'al', 'to commit a trespass / to act unfaithfully', 'The term for covenant violation involving sacred property or trust relationships. Num 5:6 uses it for any sin against another person — emphasising that wrongs between humans are simultaneously wrongs against God (cf. Lev 6:1–7).'),
            ],
            'ctx': 'Numbers 5 addresses three forms of impurity that could defile the camp: ritual uncleanness (vv.1–4), unconfessed sin requiring restitution (vv.5–10), and suspected marital unfaithfulness (vv.11–31). The first two sections continue the holiness-of-the-camp theme from ch.2–4. The restitution law (vv.5–10) restates Lev 6:1–7 with one addition: if the wronged party has died with no kinsman to receive restitution, it goes to the Lord (i.e., to the priest). The chapter establishes that the sacred camp of Numbers 1–4 must be maintained in moral as well as ritual purity.',
            'cross': [
                ('Matt 5:23–24', '"First go and be reconciled to them; then come and offer your gift." Jesus applies the restitution-before-sacrifice principle of Num 5:5–10: wrongs between people must be addressed before approaching God.'),
                ('1 Cor 5:13', '"Expel the wicked person from among you." Paul\'s instruction for church discipline echoes the camp-exclusion logic of Num 5:1–4: the covenant community maintains holiness by removing what defiles it.'),
            ],
            'mac': [
                ('5:1–4', 'MacArthur: The exclusion of the ritually impure from the camp is not about personal condemnation but community protection. The holy God dwells "in the midst of" this camp (v.3) — his presence is the reason the camp must be pure. Impurity that would be tolerable at a distance from the divine presence becomes dangerous in proximity to it.'),
                ('5:5–10', 'MacArthur: The restitution law\'s theological insight is that sinning against a person is simultaneously sinning against God (v.6 — "being unfaithful to the Lord"). There is no category of purely horizontal sin in covenant theology. Every wrong done to an image-bearer is a wrong done to the One whose image they bear.'),
            ],
            'milgrom': [
                ('5:2', 'Milgrom: The three categories of exclusion — skin disease, discharge, corpse-contamination — correspond to the major impurity categories of Lev 13–15. Their application to the wilderness camp extends the priestly purity system beyond the sanctuary to the entire Israelite habitation. The camp itself is a sacred zone requiring the same maintenance as the tabernacle precincts.'),
            ],
            'ashley': [
                ('5:5–8', 'Ashley: The restitution provision reveals the interpersonal dimension of holiness. Israel\'s camp is not purely a cultic space — it is a community of relationships. Holiness requires right relationship both with God (ritual purity) and with neighbour (moral integrity). The two cannot be separated.'),
            ],
            'sarna': [
                ('5:7', 'Sarna: "They must confess the sin they have committed" — confession is the prerequisite for restitution, as in Lev 5:5. The restitution-plus-20% formula of Lev 5:16 applies here as well. The consistent surcharge across multiple legal contexts signals that violation of trust — whether toward the sacred or toward a neighbour — carries a premium penalty.'),
            ],
            'alter': [
                ('5:1–4', 'Alter: The camp exclusion laws are stark: "Send away male and female alike; send them outside the camp." No exceptions for status, tribe, or relationship — the holiness requirement is absolute and egalitarian. The camp\'s purity cannot be maintained by selective application.'),
            ],
            'calvin': [
                ('5:5–10', 'Calvin: The restitution law teaches that confession without compensation is incomplete repentance. True turning from sin involves not only acknowledging the wrong but making material amends where possible. The NT does not abolish this principle — Zacchaeus (Luke 19:8) and Paul (Phlm 18–19) both embody it.'),
            ],
            'netbible': [
                ('5:3', 'NET Note: "So they will not defile their camp, where I dwell among them" — the motivation for camp purity is explicitly the divine indwelling. The camp is not merely Israel\'s residence; it is God\'s residence. The holiness requirement flows from the presence, not the other way around.'),
            ],
        },
        {
            'header': 'Verses 11–31 — The Jealousy Offering: The Ordeal of Suspected Unfaithfulness',
            'verses': verse_range(11, 31),
            'heb': [
                ('ṣārāh', 'tzarah', 'jealousy / a spirit of jealousy', 'From qānāʾ (to be jealous, zealous). The "spirit of jealousy" that comes over a husband is not mere suspicion but a divinely-recognised state that triggers the ordeal procedure. God takes marital covenant fidelity seriously enough to provide a judicial mechanism for its resolution.'),
                ('mê hammārîm hāmĕʾārĕrîm', 'mei hamarim hamearerim', 'the bitter water that brings a curse', 'The ordeal water — described as "bitter/biting" and "cursing/testing." If the woman is guilty, the water causes physical symptoms (swollen abdomen, thigh wasting); if innocent, it has no effect. The ordeal places judgment entirely in God\'s hands.'),
            ],
            'ctx': 'The jealousy offering (vv.11–31) is among the most unusual passages in the Pentateuch: a suspected (not proven) adulterous wife is brought to the priest, who prepares a mixture of holy water, tabernacle dust, and the ink of a written curse. She drinks it; if guilty, she suffers physical effects; if innocent, she is cleared and becomes pregnant. The procedure protects both the innocent woman (she cannot be punished without proof) and the marriage (the priest, not the husband, administers judgment). The ordeal removes the case from human passion and places it entirely in God\'s judicial hands. This is not primitive magic but theological jurisprudence: God alone can judge what no human witness can confirm.',
            'cross': [
                ('John 8:3–11', 'The woman caught in adultery is brought to Jesus for judgment — precisely the scenario the Numbers 5 ordeal addressed. Jesus\'s refusal to condemn without evidence, and his invitation for the sinless to cast the first stone, reflects the ordeal\'s underlying principle: judgment of hidden sin belongs to God, not human accusers.'),
                ('Heb 4:13', '"Nothing in all creation is hidden from God\'s sight. Everything is uncovered and laid bare before the eyes of him to whom we must give account." The jealousy ordeal\'s theological premise: what is hidden from human court is not hidden from God.'),
            ],
            'mac': [
                ('5:11–15', 'MacArthur: The jealousy offering procedure protects the accused woman\'s rights in an ancient Near Eastern context where a husband\'s accusation alone could destroy a woman\'s standing. The ordeal requires priestly administration, written procedure, and divine verification — a sophisticated legal protection for the vulnerable.'),
                ('5:27–28', 'MacArthur: The binary outcome — guilty woman suffers physical consequences; innocent woman is declared clean — places the judicial verdict entirely in God\'s hands. Human courts cannot investigate adultery committed in secret; this ordeal provides a divinely-administered verdict where human evidence fails.'),
            ],
            'milgrom': [
                ('5:17–26', 'Milgrom: The dissolution of the curse-writing into the water, and the woman drinking it, is the most distinctive element of the ordeal. Milgrom\'s analysis: the written divine name (erased into the water) becomes the active agent of the verdict — the woman literally drinks the word of God, which then acts within her. The ordeal is not magic but theology: the divine word is the judge.'),
                ('5:28', 'Milgrom: If the woman is innocent, "she will be cleared of guilt and will be able to have children" — the positive outcome is not merely legal acquittal but renewed fertility. The ordeal, far from being punitive, offers restoration to the innocent: her honour is restored, her marriage secured, her fruitfulness confirmed.'),
            ],
            'ashley': [
                ('5:11–31', 'Ashley: The jealousy ordeal procedure is unique in the ancient Near East for its protection of the accused woman. Mesopotamian parallels typically involve river ordeals (the accused jumps into the river; survival = innocence). The Numbers ordeal is less physically dangerous and more theologically precise: the verdict rests on God\'s knowledge of hidden acts, not on physical endurance.'),
            ],
            'sarna': [
                ('5:21', 'Sarna: The priest\'s oath formula — "may the Lord cause you to become a curse and an oath among your people" — invokes the covenant curse rather than a neutral verdict. The procedure embeds the marital covenant within the broader Sinaitic covenant: unfaithfulness in marriage is a covenant violation that draws covenant sanctions.'),
            ],
            'alter': [
                ('5:23–24', 'Alter: "He shall write these curses on a scroll, and then wash them off into the bitter water." The erasing of the written divine word into drinking water is an extraordinary act — the text is consumed by the woman, its verdict enacted in her body. The body becomes the court, and God is the judge.'),
            ],
            'calvin': [
                ('5:11–31', 'Calvin: The jealousy ordeal teaches that God sees what human courts cannot. No hidden sin is finally beyond divine scrutiny; no secret transgression escapes ultimate accounting. The procedure is also pastorally protective: an innocent wife cannot be condemned by her husband\'s suspicion alone. God\'s court is both more just and more searching than any human tribunal.'),
            ],
            'netbible': [
                ('5:17', 'NET Note: "Holy water in a clay jar" and "dust from the tabernacle floor" — the ordeal water combines the sacred (holy water) with the earthy (dust). The mixture embodies the intersection of divine judgment and earthly reality. The tabernacle dust grounds the ordeal in the specific sacred space where God dwells among Israel.'),
            ],
        },
    ],
})

num(6, {
    'title': 'The Nazirite Vow and the Aaronic Blessing',
    'sections': [
        {
            'header': 'Verses 1–21 — The Nazirite: Separated to God',
            'verses': verse_range(1, 21),
            'heb': [
                ('nāzîr', 'nazir', 'Nazirite / consecrated / separated one', 'From nāzar (to consecrate, separate, dedicate). The Nazirite is a voluntary ascetic who takes a special vow of dedication to God for a defined period. Three distinctive markers: no grape products (not even grape juice or raisins), no razor to the head, and no contact with dead bodies — even of close family.'),
                ('pereʿ', 'pera', 'uncut hair / long flowing hair', 'The Nazirite\'s uncut hair is the visible marker of their vow — a sign of consecration worn on the body throughout the vow period. When the vow ends, the head is shaved and the hair offered on the altar (v.18).'),
            ],
            'ctx': 'Numbers 6 introduces the Nazirite institution — a voluntary vow of special consecration available to any Israelite, male or female. Three prohibitions: (1) no grape products (wine, vinegar, raisins, grape juice — the entire grape-product spectrum); (2) no razor on the head; (3) no corpse contact, even for parents. The Nazirite mirrors aspects of the high-priestly holiness: the high priest also abstains from mourning-related impurity for parents (Lev 21:11) and the grape prohibition parallels the priestly wine restriction before service (Lev 10:9). The Nazirite is a lay person living as if a priest — extraordinary holiness available to all. The chapter closes with the Aaronic Blessing (vv.24–26) — the most beautiful blessing in the Torah.',
            'cross': [
                ('Amos 2:11–12', '"I also raised up prophets from among your children and Nazirites from among your youths… But you made the Nazirites drink wine." Amos condemns Israel for corrupting the Nazirite institution — the vow was a measure of covenant vitality.'),
                ('Luke 1:15', '"He is never to take wine or other fermented drink, and he will be filled with the Holy Spirit even before he is born." John the Baptist fulfils the Nazirite pattern — a lifelong vow of the Num 6 type, anticipating the ultimate consecrated one.'),
                ('Judg 13:5', '"No razor may be used on his head, because the boy is to be a Nazirite, dedicated to God from the womb." Samson is another lifelong Nazirite — whose vow-breaking (the hair, the wine) parallels the tragedy of Numbers\' rebellion chapters.'),
            ],
            'mac': [
                ('6:1–4', 'MacArthur: The three Nazirite prohibitions form a coherent theological unit: no grape products (renouncing natural pleasure), uncut hair (wearing consecration visibly), no corpse contact (maintaining ritual purity even at cost of family obligation). The Nazirite vow is total consecration enacted through specific physical disciplines.'),
                ('6:9–12', 'MacArthur: If a Nazirite is accidentally defiled by a sudden death, they must restart the vow from the beginning — the previous days do not count. This rigorous restart requirement reveals the vow\'s seriousness: partial consecration is not acceptable. The principle applies to every covenant commitment: defilement requires renewed dedication from scratch, not merely picking up where one left off.'),
            ],
            'milgrom': [
                ('6:3–4', 'Milgrom: The grape prohibition is comprehensive — wine, beer, grape juice, fresh grapes, raisins, seeds, skins. The total exclusion of all grape products goes beyond ordinary priestly restrictions (Lev 10:9 only prohibits wine before service). Milgrom\'s analysis: the Nazirite\'s abstention from the fruit of the vine symbolises abstention from the joys of ordinary life during the period of special consecration.'),
                ('6:18–20', 'Milgrom: The conclusion of the Nazirite vow involves offering the consecrated hair on the altar — the symbol of the vow is literally consumed in fire before God. The Nazirite\'s distinctive physical identity is surrendered as an offering. The consecration that was marked on the body is now offered to God as the vow\'s completion.'),
            ],
            'ashley': [
                ('6:1–21', 'Ashley: The Nazirite institution democratises high-priestly holiness — any Israelite, male or female, can voluntarily undertake a period of exceptional consecration. This is Numbers\' most explicit expression of the "kingdom of priests" vision of Exod 19:6: the priestly level of holiness is available to the whole community, not just the Aaronic line.'),
            ],
            'sarna': [
                ('6:5', 'Sarna: The uncut hair as the Nazirite\'s sign of consecration functions as the visible equivalent of the high priest\'s turban (Exod 28:36–38) inscribed "Holy to the Lord." Both are crown-level markers of belonging to God. The Nazirite wears their consecration on their head for the duration of the vow.'),
            ],
            'alter': [
                ('6:1–2', 'Alter: "If a man or woman wants to make a special vow, a vow of dedication to the Lord as a Nazirite" — the vow is voluntary and open to both sexes. In a system where most religious distinctions favour males, the Nazirite vow is explicitly gender-neutral. Any Israelite can reach for extraordinary consecration.'),
            ],
            'calvin': [
                ('6:1–21', 'Calvin: The Nazirite vow teaches that special consecration to God involves special discipline. The three abstentions are not arbitrary restrictions but training in self-denial for the sake of a higher purpose. Christians are called to a perpetual Nazirite-like consecration: "Do not get drunk on wine… Instead, be filled with the Spirit" (Eph 5:18).'),
            ],
            'netbible': [
                ('6:9', 'NET Note: Accidental corpse-contamination "defiles the head" — the centre of the Nazirite\'s vow-symbol (the hair). The defilement strikes at the sign of consecration, requiring complete restart. The severity reflects the principle that even unintentional violation of a holy commitment must be fully remedied.'),
            ],
        },
        {
            'header': 'Verses 22–27 — The Aaronic Blessing',
            'verses': verse_range(22, 27),
            'heb': [
                ('yĕbārĕkĕkā yhwh wĕyišmĕrekā', 'yevarechecha YHWH veyishmerecha', 'May the Lord bless you and keep you', 'The first benediction: blessing (material provision, covenant favour) and keeping (protection, guarding). The six Hebrew words encapsulate the totality of divine care.'),
                ('yāʾēr yhwh pānāyw ʾēlêkā wîḥunnekā', 'ya\'er YHWH panav elecha vichunecha', 'May the Lord make his face shine on you and be gracious to you', 'The second benediction: the shining face (divine favour, presence, delight) and grace (unmerited covenant favour). God\'s face turned toward Israel rather than hidden.'),
                ('yiśśāʾ yhwh pānāyw ʾēlêkā wĕyāśēm lĕkā šālôm', 'yissa YHWH panav elecha veyasem lecha shalom', 'May the Lord turn his face toward you and give you peace', 'The third and climactic benediction: the lifted/turned face (complete divine attention and acceptance) and shalom (wholeness, flourishing, total wellbeing). The blessing moves from provision (v.24) to presence (v.25) to peace (v.26) — an ascending arc.'),
            ],
            'ctx': 'The Aaronic Blessing (vv.24–26) is the most beautiful passage in Numbers and among the most ancient liturgical texts in the Bible. An actual physical copy of this blessing, inscribed on a silver scroll, was found at Ketef Hinnom (Jerusalem) dating to c.600 BC — making it one of the oldest surviving biblical texts. The blessing\'s three couplets follow an ascending structure: 3+3 Hebrew words (v.24), 3+4 Hebrew words (v.25), 4+3 Hebrew words (v.26). The divine name appears in each line; the subject is always Israel receiving; the verb in each line is a wish (jussive). God commands Aaron to bless Israel using his own name — "so they will put my name on the Israelites, and I will bless them" (v.27).',
            'cross': [
                ('2 Cor 13:14', '"The grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you all." Paul\'s trinitarian benediction follows the three-couplet structure of the Aaronic Blessing and has been read as a NT fulfilment of it.'),
                ('Rev 22:4', '"They will see his face." The ultimate fulfilment of "the Lord make his face shine on you" — in the new creation, the beatific vision is the final realisation of the Aaronic Blessing\'s deepest longing.'),
                ('Ps 67:1', '"May God be gracious to us and bless us and make his face shine on us." The psalm echoes the Aaronic Blessing — the priestly blessing becomes a corporate prayer, Israel\'s desire for the divine favour extended to all nations.'),
            ],
            'mac': [
                ('6:24–26', 'MacArthur: The three-fold repetition of "the Lord" (YHWH) in the blessing has been read by Christian interpreters as a trinitarian anticipation — Father, Son, and Spirit each named in the ascending benediction. Whether or not the Trinitarian reading is intended, the threefold divine name signals the comprehensive character of the blessing: God in all his fullness is the source of Israel\'s protection, presence, and peace.'),
                ('6:27', 'MacArthur: "So they will put my name on the Israelites, and I will bless them." The blessing is not mere priestly well-wishing — it is the effective placement of the divine name on the people. When the priest pronounces the Aaronic Blessing, something happens: the name of God is inscribed on Israel, and God himself guarantees the blessing. The spoken blessing is a sacramental act.'),
            ],
            'milgrom': [
                ('6:24–26', 'Milgrom: The Ketef Hinnom amulets containing the Aaronic Blessing date to the late 7th century BC — the oldest surviving biblical text. Their use as protective amulets reflects the blessing\'s understood power: the divine name placed on the wearer provides real protection. The amulets are a material instantiation of v.27 — the name written on the person.'),
                ('6:27', 'Milgrom: "They will put my name on the Israelites" — the priestly act of blessing is described as an act of naming. The blessed person bears the divine name as a mark of belonging and protection. Milgrom\'s theology of the divine name: the name of God is his active presence, not merely his label. To have his name placed on you is to have him placed on you.'),
            ],
            'ashley': [
                ('6:22–27', 'Ashley: The Aaronic Blessing closes the entire introductory section of Numbers (chs.1–6) with a lyric of grace. After all the census counts, camp arrangements, Levitical rosters, and purity laws, the book pauses for a blessing. The bureaucratic is framed by the lyrical; the organisational is held within the pastoral. Numbers is not merely a handbook — it is a theology of God\'s care for his people.'),
            ],
            'sarna': [
                ('6:24–26', 'Sarna: The ascending pattern of the blessing — provision (keep/guard), then presence (face shining), then peace (face lifted/shalom) — moves from the material to the personal to the comprehensive. The climax is not wealth or military victory but shalom: the total flourishing that comes from undistorted relationship with God.'),
            ],
            'alter': [
                ('6:24–26', 'Alter: The Aaronic Blessing is the most perfectly crafted poem in Numbers — possibly in the Pentateuch. Three lines, each with the divine name, each with a two-part structure, each ascending in length and intimacy. The movement from "keep" (external protection) to "shine" (divine delight) to "peace" (inner wholeness) traces the arc of what it means to be blessed by God.'),
            ],
            'calvin': [
                ('6:24–27', 'Calvin: The Aaronic Blessing is the Old Testament\'s clearest preview of the gospel: God\'s face turned toward humanity in grace, not judgment; God\'s name placed on the sinner, not withdrawn; God\'s peace given, not withdrawn. Christ is the ultimate fulfilment — in him, God\'s face shines without veil, his name is placed on every believer in baptism, and his shalom is not a wish but an accomplished fact.'),
            ],
            'netbible': [
                ('6:25', 'NET Note: "Make his face shine" (yāʾēr pānāyw) — the idiom of the shining face denotes favour and pleasure (cf. Ps 31:16; 80:3, 7, 19). The opposite, the hidden face (Ps 44:24; 88:14), signifies abandonment or judgment. The Aaronic Blessing asks God to be to Israel what he was to Moses: face to face, not hidden.'),
            ],
        },
    ],
})

print("NUM-1 complete: Numbers 1–6 built.")
