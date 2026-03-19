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

# ─────────────────────────────────────────────────────────────────────────────
# NUM-2: Chapters 7–10 — Tabernacle Dedication; Levites; Cloud and Trumpets
# ─────────────────────────────────────────────────────────────────────────────

num(7, {
    'title': 'The Offerings of the Leaders: Twelve Days of Dedication',
    'sections': [
        {
            'header': 'Verses 1–47 — The First Six Tribal Leaders\' Offerings',
            'verses': verse_range(1, 47),
            'heb': [
                ('nĕśîʾîm', "nesi'im", 'leaders / princes / chieftains', 'The tribal leaders (nĕśîʾîm) are the same men named as census co-commissioners in Num 1:5–15. Now they make identical voluntary offerings for the tabernacle\'s dedication — the same gift from each tribe, one per day, over twelve days. Equality of honour in the covenant community.'),
                ('qorban', 'qorban', 'offering / gift brought near', 'From qārab (to draw near). Each leader\'s offering is an act of approach — the tribe\'s first and best given to draw near to God in the newly consecrated tabernacle.'),
            ],
            'ctx': 'Numbers 7 is the longest chapter in the Pentateuch (89 verses) and consists almost entirely of repetition: twelve identical offering lists, one per tribal leader, one per day. Each leader brings: one silver plate (130 shekels), one silver basin (70 shekels), one gold dish (10 shekels), a burnt offering (one bull, one ram, one male lamb), a sin offering (one male goat), and a fellowship offering (two oxen, five rams, five goats, five male lambs). The repetition is not literary laziness but theological precision — every tribe is equally honoured, every leader\'s gift equally recorded. God receives and acknowledges each tribe individually. The chapter ends (v.89) with the remarkable note: "When Moses entered the tent of meeting to speak with the Lord, he heard the voice speaking to him from between the two cherubim above the atonement cover." The tabernacle is functioning: God speaks from within it.',
            'cross': [
                ('Rev 5:8', '"Each one had a harp and they were holding golden bowls full of incense, which are the prayers of God\'s people." The twenty-four elders\' golden bowls echo the twelve golden dishes of Num 7 — covenant offerings now transformed into the prayers that rise before the eternal throne.'),
                ('Heb 9:23', '"It was necessary, then, for the copies of the heavenly things to be purified with these sacrifices." The tabernacle dedication offerings of Num 7 are the earthly counterpart to the heavenly sanctuary\'s purification through Christ\'s blood.'),
            ],
            'mac': [
                ('7:1–3', 'MacArthur: The leaders bring their gifts "on the day Moses finished setting up the tabernacle" — the first act of Israel\'s post-Sinai worship is tribal offering. The community\'s leaders lead in generosity. The pattern is consistent throughout Scripture: covenant leadership is expressed through sacrificial giving.'),
                ('7:10–11', 'MacArthur: The twelve-day schedule — one tribe per day — ensures that each offering is received as distinct, not merged into a collective. Every tribe has its own day of honour before God. The administrative precision (same gift, separate days, individual recording) expresses the covenant principle: God knows and acknowledges each part of his people individually.'),
            ],
            'milgrom': [
                ('7:1', 'Milgrom: The chapter\'s placement — after the tabernacle is consecrated (Lev 8–9) and all the purity and vow laws are established (Num 1–6) — is chronologically retroactive. Num 7 actually precedes the Num 1–4 census in the narrative timeline. The redactors placed it here for theological reasons: the tabernacle dedication is the culmination of the entire preparation sequence.'),
                ('7:89', 'Milgrom: The concluding verse — Moses hearing the divine voice from between the cherubim — is the theological payoff for the entire chapter. All 89 verses of offering lists build toward this: the tabernacle is functioning as intended, the divine voice has taken up residence, the sanctuary system is operational.'),
            ],
            'ashley': [
                ('7:10–83', 'Ashley: The twelve-fold repetition is the text\'s most distinctive feature and its deepest theological statement. Each tribe is given identical treatment — no tribe receives preferential listing or offering. The repetition embodies the covenant\'s egalitarian structure: all twelve tribes stand equally before God, equally honoured, equally recorded.'),
            ],
            'sarna': [
                ('7:3', 'Sarna: The leaders bring six covered carts and twelve oxen — two leaders per cart, one ox per leader. The offering is both generous (six carts of silver and gold) and communal (shared transport, shared honour). The tabernacle is built through distributed covenant generosity.'),
            ],
            'alter': [
                ('7:12–83', 'Alter: The twelve-fold repetition in Numbers 7 is unique in biblical literature — no other passage repeats an inventory verbatim twelve times. The priestly writers\' aesthetic of accumulative precision reaches its zenith. The repetition is not failure of imagination but a theological choice: every tribe\'s day is worth its own complete, unabbreviated record.'),
            ],
            'calvin': [
                ('7:1–83', 'Calvin: The tabernacle dedication offerings teach that the worship of God involves tangible, material generosity. The leaders did not merely attend the dedication — they brought significant wealth. True worship is costly; it involves the surrender of what is valuable. The twelve-day sequence models sustained, distributed covenant generosity.'),
            ],
            'netbible': [
                ('7:1', 'NET Note: Numbers 7 is chronologically earlier than chapters 1–6 (the tabernacle was erected on 1 Nisan; the census was taken on 1 Iyyar, one month later). The redactors placed the dedication account here to group all tabernacle-related material together before the narrative of Israel\'s departure from Sinai begins in ch.10.'),
            ],
        },
        {
            'header': 'Verses 48–89 — The Last Six Leaders\' Offerings; Moses Hears God',
            'verses': verse_range(48, 89),
            'heb': [
                ('wayyišmaʿ ʾet-haqqôl', 'wayyishma et-haqqol', 'and he heard the voice', 'The chapter\'s climactic final verse: Moses enters the completed, dedicated tabernacle and hears the divine voice speaking from between the cherubim. The entire 89-verse chapter of offerings culminates in the moment of divine communication — the tabernacle is functioning as its name implies: a meeting place.'),
            ],
            'ctx': 'Days 7–12 repeat the identical offering pattern — Ephraim (day 7), Manasseh (day 8), Benjamin (day 9), Dan (day 10), Asher (day 11), Naphtali (day 12). The total gifts: 12 silver plates, 12 silver basins, 12 gold dishes, 12 burnt offering animals, 12 sin offerings, 24 oxen/fellowship offerings, plus 60 rams/goats/lambs. The accumulated weight of the offerings represents Israel\'s complete covenant response to the completed sanctuary. Verse 89 then shifts register entirely: Moses enters and hears God. The twelve days of offerings create the conditions for the divine voice — not by mechanical causation but by covenant faithfulness.',
            'cross': [
                ('John 1:14', '"The Word became flesh and made his dwelling among us." The tabernacle\'s function — the divine voice speaking from within it — reaches its ultimate fulfilment in the Incarnation: God\'s word dwelling, not in a tent, but in human flesh.'),
                ('Exod 25:22', '"There, above the cover between the two cherubim that are over the ark of the covenant law, I will meet with you and give you all my commands." Numbers 7:89 records the fulfilment of this Exodus promise: God speaks from precisely the location he designated.'),
            ],
            'mac': [
                ('7:84–88', 'MacArthur: The cumulative totals of the twelve leaders\' offerings — 12 silver plates, 12 gold dishes, 24 cattle, 60 rams, 60 goats — represent Israel\'s concentrated covenant devotion. This is not annual giving but a one-time covenant-inaugurating act of comprehensive worship. The scale of the offering matches the scale of the event.'),
                ('7:89', 'MacArthur: The final verse is Numbers\' most intimate moment: Moses alone with God, the divine voice speaking from the most holy space in Israel\'s world. Everything that precedes — the census, the camp order, the Levitical appointments, the twelve days of offerings — is preparation for this: God speaking to his people through his appointed mediator.'),
            ],
            'milgrom': [
                ('7:89', 'Milgrom: The verb "heard" (wayyišmaʿ) with no stated object immediately — "he heard the voice" — creates a moment of rhetorical suspense before the source is named. Moses enters, and encounters the divine voice. Milgrom notes this parallels the description of Sinai (Deut 4:12, "you heard the sound of words but saw no form") — the tabernacle is a portable Sinai, the ongoing site of divine speech.'),
            ],
            'ashley': [
                ('7:89', 'Ashley: The chapter\'s closing verse functions as a dedication plaque for the entire tabernacle system: it works. Moses enters, God speaks. The twelve days of preparation and twelve leaders\' offerings have established the conditions for ongoing covenant communication. The tabernacle is not a monument but a meeting place.'),
            ],
            'sarna': [
                ('7:89', 'Sarna: "He heard the voice speaking to him from between the two cherubim above the atonement cover" — the mercy seat, covered with blood on Yom Kippur, is also the throne from which the divine voice issues. The place of atonement and the place of revelation are the same point. Grace and truth meet at the mercy seat.'),
            ],
            'alter': [
                ('7:89', 'Alter: After 88 verses of inventory and repetition, the chapter\'s final verse shifts to intimate narrative: Moses and the divine voice. The prose suddenly breathes. The shift in register — from list to scene — is deliberate: all the material preparation leads to this unquantifiable moment of divine-human encounter.'),
            ],
            'calvin': [
                ('7:89', 'Calvin: Moses hearing the divine voice from the mercy seat is the prototype of prayer: approaching the appointed place of atonement to receive the divine word. The Christian enters the holy of holies through Christ (Heb 10:19–22) and hears the word of God — the same dynamic, the same mercy seat, the same voice, now accessible to all.'),
            ],
            'netbible': [
                ('7:89', 'NET Note: "From between the two cherubim" — this precise location was established in Exod 25:22 as the designated point of divine communication. The cherubim flank the mercy seat/atonement cover, their wings meeting above it. The divine voice comes from the intersection of holiness (the ark) and grace (the atonement cover) — theologically precise geography.'),
            ],
        },
    ],
})

num(8, {
    'title': 'The Lampstand; the Levites Consecrated and Retired',
    'sections': [
        {
            'header': 'Verses 1–4 — The Lampstand Arrangement',
            'verses': verse_range(1, 4),
            'heb': [
                ('ʾel-mûl pĕnê hamĕnôrāh', 'el-mul pnei hamenorah', 'toward the front of the lampstand / facing the lampstand', 'The seven lamps must be arranged to light the space "in front of" the lampstand — directed forward, not upward or randomly. The lampstand\'s light is purposeful and oriented: it illuminates the table of showbread, providing light for the sanctuary\'s priestly service.'),
            ],
            'ctx': 'The short lampstand section (vv.1–4) connects the tabernacle dedication of ch.7 to the Levitical consecration of ch.8. Aaron is commanded to set up the seven lamps so they illuminate "the area in front of the lampstand" — not diffuse light but focused, directed illumination. This tiny passage ties back to the lampstand instructions of Exod 25:31–40 and Lev 24:1–4. Numbers 8\'s brief inclusion of the lampstand detail is a narrative hinge: the sanctuary is fully operational (ch.7), the light is properly arranged (vv.1–4), and now the Levites who serve in its light are formally consecrated (vv.5–26).',
            'cross': [
                ('Rev 1:20', '"The seven lampstands are the seven churches." John\'s vision transforms the singular seven-branched menorah into seven separate lampstands, each representing a church community — the covenant people still called to be the light of the world (Matt 5:14–16).'),
                ('John 8:12', '"I am the light of the world." Jesus\' claim applies the lampstand theology directly to himself — the true lamp before God, giving light in the darkness.'),
            ],
            'mac': [
                ('8:1–4', 'MacArthur: The lampstand\'s directed light — illuminating the space in front of it toward the table of showbread — creates a visual theology. The light of God\'s presence illuminates the covenant bread (Israel\'s presence before God). The lampstand and the table are paired furnishings in the holy place, the light always pointing toward the covenant meal.'),
            ],
            'milgrom': [
                ('8:2', 'Milgrom: "When you set up the lamps, the seven lamps shall give light in front of the lampstand." The positioning creates what Milgrom calls a "lamp-focused" illumination — all seven lamps directed toward the centre, maximising the light on the showbread table and the incense altar. The lampstand is not merely decorative but functionally illuminating the covenant objects.'),
            ],
            'ashley': [
                ('8:1–4', 'Ashley: The lampstand section in Num 8 serves as a literary transition and a theological reminder: the sanctuary\'s inner life depends on maintained light. Before the Levites are consecrated (vv.5–26), the light that will illuminate their service is confirmed as properly arranged. The ministers serve in light; the light is arranged before the ministers are commissioned.'),
            ],
            'sarna': [
                ('8:4', 'Sarna: "The lampstand was made exactly like the pattern the Lord had shown Moses." The conformity formula — explicit reference back to the Exod 25 design specifications — affirms that every detail of the completed tabernacle matches the divine blueprint. There is no improvisation; the sanctuary is a precise copy of the heavenly pattern (Heb 8:5).'),
            ],
            'alter': [
                ('8:1–4', 'Alter: Four verses — command, compliance, construction note. The priestly style at its most compressed. The lampstand passage is almost an afterthought in placement but foundational in theology: the light must be right before the servants are installed. Correct worship precedes correct service.'),
            ],
            'calvin': [
                ('8:1–4', 'Calvin: The lampstand\'s directed light is a figure of the word of God illuminating the covenant meal — scripture and sacrament together. The Christian equivalent: the preaching of the word (the lampstand) illuminates the Lord\'s Table (the showbread). Remove the light and the meal loses its meaning; remove the meal and the light has nothing to illuminate.'),
            ],
            'netbible': [
                ('8:2', 'NET Note: "El-mul pĕnê hamĕnôrāh" — literally "toward the face of the lampstand" — means the lamps are directed to shine forward/outward rather than back toward the wall. The architectural effect: maximum illumination of the table of showbread directly opposite. The paired furnishings (lampstand west wall, table north wall) are in a liturgical dialogue.'),
            ],
        },
        {
            'header': 'Verses 5–26 — The Consecration and Retirement of the Levites',
            'verses': verse_range(5, 26),
            'heb': [
                ('wĕhēnaptā ʾōtām tĕnûpāh', "wehenafta otam tenufah", 'you shall wave them as a wave offering', 'The Levites are "waved" before the Lord — the same elevation gesture used for portions of the fellowship offering. The Levites are the offering; their entire persons are presented to God in a communal act of dedication before taking up their service.'),
                ('ûmibben ḥămīšîm šānāh', 'umibben chamishim shanah', 'from the age of fifty years', 'The retirement age for active Levitical service. After 50, the Levite steps down from heavy transport duties but "assists his brothers" in lighter duties. Retirement from strenuous service is not exile from covenant life — the retired Levite continues in an advisory, supportive role.'),
            ],
            'ctx': 'The Levites\' formal consecration (vv.5–22) follows a sequence: ritual washing, shaving all hair, washing clothes, presenting themselves before the community, laying of hands by the Israelites (the whole community consecrates the Levites as their substitutes, vv.9–10), Aaron waving them before the Lord, Levites laying hands on the two bulls (one for sin offering, one for burnt offering), atonement. The theology is clear: the Levites are a living offering — the community\'s representative gift to God. Verses 23–26 establish the service ages (25–50 for active service; 50+ for lighter assistance), slightly different from the 30–50 of ch.4, reflecting different duties at different career stages.',
            'cross': [
                ('Rom 12:1', '"Offer your bodies as a living sacrifice, holy and pleasing to God." Paul\'s NT equivalent of the Levitical wave offering — the believer presents their whole self as a living offering, the ultimate fulfilment of the Num 8 consecration ceremony.'),
                ('1 Pet 2:9', '"You are a royal priesthood." The NT democratisation of the Levitical consecration: every believer undergoes a Num 8-type dedication — washed (baptism), presented (profession of faith), consecrated (Spirit-filling).'),
            ],
            'mac': [
                ('8:9–12', 'MacArthur: The hands-laying by "the whole Israelite community" (v.9–10) is extraordinary — not just Moses or Aaron but the entire assembly participates in consecrating the Levites. The community\'s collective act of dedication reflects the principle that the Levites serve on behalf of all Israel. Their consecration belongs to the whole people.'),
                ('8:25–26', 'MacArthur: The retirement provision — active service until 50, then "assisting" — is one of the Levitical system\'s most humane provisions. Aging Levites are not discarded; they continue in lighter duties and serve as mentors and advisors. The covenant community values its experienced servants at every life stage.'),
            ],
            'milgrom': [
                ('8:10', 'Milgrom: "The Israelites are to lay their hands on the Levites" — not the normal single-hand laying of Lev 1:4 but the symbolic transfer from the community to its representatives. The Levites are consecrated as Israel\'s collective offering to God; the hand-laying transfers the entire community\'s dedication into the Levites who will embody it.'),
                ('8:19', 'Milgrom: "I have given the Levites as gifts to Aaron and his sons from among the Israelites, to do the work of the Israelites at the tent of meeting and to make atonement for them so that no plague will strike the Israelites when they go near the sanctuary." The Levites\' protective function — shielding Israel from the lethal consequences of unmediated approach to the holy — is explicit here.'),
            ],
            'ashley': [
                ('8:5–22', 'Ashley: The Levitical consecration ceremony is the communal counterpart to the Aaronic ordination of Lev 8. Where Aaron\'s ordination was initiated by Moses alone, the Levites are consecrated by the whole community. The two ceremonies together establish the full priestly system: Aaronic priests for sanctuary service, Levites for communal support, the entire assembly as the body that sustains and is sustained by both.'),
            ],
            'sarna': [
                ('8:6–7', 'Sarna: The purification of the Levites — sprinkling with "water of cleansing" (literally "water of sin-offering"), shaving all hair, washing clothes — is a total physical renewal before presentation. The Levites are cleansed from the crown of the head to the soles of the feet; their entire embodied identity is prepared for covenant service.'),
            ],
            'alter': [
                ('8:10–11', 'Alter: The wave offering of the Levites — living human beings elevated before the Lord — is the most dramatic use of the tĕnûpāh gesture in the Pentateuch. All previous wave offerings were animal portions or grain; here the offering is persons. The Levites are not merely workers; they are Israel\'s living sacrifice.'),
            ],
            'calvin': [
                ('8:23–26', 'Calvin: The Levitical retirement provision models the principle that different life stages call for different service intensity. Youth and middle age for active labour; later years for wisdom, mentoring, and lighter duties. The covenant community honours its older members by retaining them in service rather than excluding them — a counter to every culture\'s tendency to discard the elderly.'),
            ],
            'netbible': [
                ('8:25–26', 'NET Note: The service age in Num 4 was 30–50; here it is 25–50. The apparent discrepancy likely reflects different types of service: the Num 4 count (30–50) specifies active transport duties; Num 8:24–26 describes the broader range of sanctuary service beginning at 25. The five years between 25 and 30 may have been a training/apprenticeship period.'),
            ],
        },
    ],
})

num(9, {
    'title': 'The Second Passover and the Guiding Cloud',
    'sections': [
        {
            'header': 'Verses 1–14 — The Second Passover: Grace for the Ceremonially Unclean',
            'verses': verse_range(1, 14),
            'heb': [
                ('ṭĕmēʾ-nepeš', 'teme-nefesh', 'unclean through a dead person / corpse-contaminated', 'The men who approach Moses with the Passover question have incurred corpse-impurity and cannot participate in the Passover as scheduled. Their question — "Why should we be deprived?" — initiates a new divine provision rather than a rebuke.'),
                ('môʿēd ʾaḥēr', "mo'ed acher", 'an appointed time at another time / the second date', 'God\'s response to the unclean men\'s question: a second Passover, one month later (14 Iyyar instead of 14 Nisan), for those who were impure or on a journey during the first. The provision is a model of divine pastoral accommodation: the covenant requirement stands, but grace provides an alternative path to fulfilment.'),
            ],
            'ctx': 'Numbers 9\'s opening section records Israel\'s first anniversary Passover (14 Nisan, year 2 — exactly one year after the Exodus Passover of Exod 12). A pastoral problem arises: some men are ceremonially unclean due to corpse-contact and cannot participate. They approach Moses with an urgent question: "Why should we be kept from presenting the Lord\'s offering with the other Israelites?" Moses takes the question to God; God provides the "second Passover" (Pesach Sheni) — a makeup provision one month later. The section closes (vv.13–14) with the warning: those who are clean but neglect the Passover face kārēt. The provision is grace; the expectation is participation.',
            'cross': [
                ('Luke 14:16–24', 'Jesus\'s parable of the great banquet — those originally invited who make excuses are replaced by others gathered from the streets. The Passover\'s mandatory participation principle (Num 9:13 — the clean person who neglects it faces kārēt) and its gracious accommodation principle (the second Passover for the unclean) together form the backdrop for the parable\'s urgency.'),
                ('1 Cor 11:27–29', '"Whoever eats the bread or drinks the cup of the Lord in an unworthy manner will be guilty." The Num 9 Passover principle — participation required, unworthy absence punishable — resonates with Paul\'s warning about the Lord\'s Supper.'),
            ],
            'mac': [
                ('9:6–8', 'MacArthur: The men\'s question — "Why should we be deprived?" — is one of the most faith-affirming moments in Numbers. They are not seeking an exemption from the Passover; they want to participate. Their impurity is not their fault, yet they refuse to treat it as grounds for exclusion. They bring their problem to Moses and ultimately to God, trusting that grace will provide a path.'),
                ('9:13', 'MacArthur: The kārēt penalty for a clean person who neglects the Passover without justification is the counterbalance to the second Passover\'s grace. Grace provides an alternative path for the genuinely impeded; it is not permission for cavalier indifference. The covenant memorial cannot be casually skipped — to do so is to repudiate the Exodus redemption itself.'),
            ],
            'milgrom': [
                ('9:6–14', 'Milgrom: The second Passover provision is a landmark in legal reasoning: a case not covered by existing law is brought to the lawgiver, who seeks divine guidance, and a new precedent is established. The process models the development of case law within the covenant system — not rigid inflexibility but responsive guidance that maintains the law\'s underlying purpose.'),
            ],
            'ashley': [
                ('9:1–14', 'Ashley: The Passover section\'s pastoral sensitivity is characteristic of Numbers at its best. God does not condemn the unclean men for their impurity — they could not help it. He provides for them. The covenant\'s requirements are firm; its administration is gracious. The two together — demand and provision — define the character of covenant relationship.'),
            ],
            'sarna': [
                ('9:14', 'Sarna: "The same rules apply both to the native-born Israelites and to the foreigners residing among them." The second Passover provision extends to resident aliens — the same grace available to Israelites is available to those who have cast their lot with Israel. The covenant community is defined by participation, not ethnicity.'),
            ],
            'alter': [
                ('9:6–8', 'Alter: The men approach Moses with a question framed as a grievance: "Why should we be deprived?" The directness is striking — they bring their complaint to the highest authority and receive a hearing. Moses does not dismiss them; he takes their question to God. The covenant legal system is responsive to the community it governs.'),
            ],
            'calvin': [
                ('9:6–13', 'Calvin: The second Passover teaches that God\'s law is always in service of his grace. When the law\'s requirement (Passover on 14 Nisan) conflicts with the law\'s purpose (every Israelite participating in the covenant memorial), God provides a supplementary path. The law\'s spirit — full covenant participation — takes precedence over its letter, when the letter would frustrate the spirit.'),
            ],
            'netbible': [
                ('9:11', 'NET Note: The second Passover (14 Iyyar) follows the same instructions as the first — eaten with unleavened bread and bitter herbs, no bone broken, not left until morning (vv.11–12, echoing Exod 12:8, 10, 46). The provisions are identical; only the date changes. The makeup Passover is a genuine Passover, not a diminished substitute.'),
            ],
        },
        {
            'header': 'Verses 15–23 — The Cloud: God\'s Guidance in the Wilderness',
            'verses': verse_range(15, 23),
            'heb': [
                ('ʿānān', 'anan', 'cloud', 'The divine cloud — covering the tabernacle by day, appearing as fire by night (v.16). The cloud is the visible form of divine presence guiding Israel\'s movements. Israel moves when the cloud lifts; Israel camps when the cloud settles. The entire wilderness itinerary is determined by this one indicator.'),
                ('ʿal-pî yhwh yissĕʿû wĕʿal-pî yhwh yaḥănû', 'al-pi YHWH yissa\'u ve\'al-pi YHWH yachanu', 'at the command of the Lord they set out and at the command of the Lord they camped', 'The repeated refrain of vv.18, 20, 23 — Israel\'s movements are entirely determined by divine command, not human initiative. The cloud is God\'s speaking; Israel\'s movement is Israel\'s hearing. The wilderness journey is a sustained act of covenant obedience.'),
            ],
            'ctx': 'The cloud section (vv.15–23) describes the guiding cloud that has been present since Exodus 13:21–22 but is now described with more detail: it covers the tabernacle from day to day; it looks like fire at night; Israel moves only when it lifts. The repetition in this section — "whether for two days or a month or a year… they would remain in camp… they would not set out" — emphasises the absolute submission of Israel\'s itinerary to divine direction. Israel does not plan their route; they follow the cloud. The section is framed by the same phrase (v.18 and v.23): "at the command of the Lord." The cloud is the bridge between the tabernacle dedication (chs.7–8) and the march from Sinai (ch.10).',
            'cross': [
                ('1 Cor 10:1–2', '"Our ancestors were all under the cloud and… they were all baptised into Moses in the cloud and in the sea." Paul identifies the Exodus/wilderness cloud as a typological baptism — Israel immersed in the divine presence, the cloud as God\'s enveloping grace.'),
                ('Acts 1:9', '"He was taken up before their very eyes, and a cloud hid him from their sight." The Ascension cloud echoes the wilderness cloud — Christ departing into the divine presence, the same cloud that guided Israel now receiving the risen Lord.'),
            ],
            'mac': [
                ('9:15–23', 'MacArthur: The cloud guidance narrative is Numbers\' most vivid image of radical dependence. Israel cannot plan their route, cannot anticipate their movements, cannot know whether they will camp for two days or two years. Every decision — when to move, when to stop — belongs to God. The wilderness teaches the one lesson Israel keeps failing: "Trust in the Lord with all your heart and lean not on your own understanding" (Prov 3:5).'),
            ],
            'milgrom': [
                ('9:18', 'Milgrom: The phrase "at the command of the Lord" (ʿal-pî yhwh) appears six times in vv.18–23 — a deliberate rhetorical accumulation. Every movement of the Israelite camp is grounded in explicit divine command. Milgrom notes this is not merely theological decoration but the narrative\'s foundational claim: the wilderness journey is not Israel\'s adventure but God\'s choreography.'),
            ],
            'ashley': [
                ('9:15–23', 'Ashley: The cloud theology of Numbers 9 establishes the model for Israel\'s relationship to divine guidance throughout the OT: God leads visibly, community follows responsively, movement is determined by presence rather than plan. The absence of the cloud (cf. Ps 74:1) is a theological crisis; its presence is the guarantee of covenant accompaniment.'),
            ],
            'sarna': [
                ('9:20–22', 'Sarna: "Whether the cloud stayed over the tabernacle for two days or a month or a year…" The indefinite duration possibilities — two days, a month, a year — cover the entire spectrum of human impatience. The cloud stays as long as it stays. Israel\'s obedience must be as flexible as God\'s timing.'),
            ],
            'alter': [
                ('9:22–23', 'Alter: The triple "at the command of the Lord" in the closing verses creates a liturgical cadence — Israel\'s itinerary is not a narrative of human decisions but a sequence of divine commands and covenant responses. The repetition transforms geography into theology: every campsite is a divine appointment, every march a divine commission.'),
            ],
            'calvin': [
                ('9:15–23', 'Calvin: The cloud guidance teaches total dependence on God for direction — not merely for sustenance (manna and water) but for the most fundamental decisions: when to stay, when to go. The Christian equivalent is prayer as the cloud-analogue: the decision to move or remain is referred to God, not resolved by human planning alone.'),
            ],
            'netbible': [
                ('9:16', 'NET Note: "By night it looked like fire" — the pillar of fire by night and cloud by day is first mentioned at Exod 13:21–22. The consistent dual appearance (cloud/fire) indicates a single phenomenon with two aspects: shielding from the desert sun by day, providing warmth and light by night. The cloud is practical as well as theological — God\'s guidance is also God\'s care.'),
            ],
        },
    ],
})

num(10, {
    'title': 'The Silver Trumpets and the Departure from Sinai',
    'sections': [
        {
            'header': 'Verses 1–10 — The Silver Trumpets: Signals for a Covenant People',
            'verses': verse_range(1, 10),
            'heb': [
                ('ḥăṣōṣĕrôt', 'chatsotzerot', 'silver trumpets', 'Straight metal trumpets (distinct from the ram\'s horn šôpār). Two trumpets, blown by priests, serve multiple purposes: summoning the assembly (both trumpets), summoning leaders only (one trumpet), signalling march (blasts), alarm for war, and accompanying sacrificial worship. The trumpet system is Israel\'s covenant communication infrastructure.'),
                ('tĕrûʿāh', 'teruah', 'alarm blast / battle signal', 'A staccato, broken blast pattern distinct from the long sustained blast (tĕqîʿāh). The tĕrûʿāh signals alarm, battle, or the march of camp divisions. The word recurs in the Feast of Trumpets (Yom Teruah, Num 29:1) and in eschatological contexts.'),
            ],
            'ctx': 'Numbers 10:1–10 establishes the silver trumpet system — two instruments, blown by priests, with five distinct signals: (1) both trumpets together = full assembly; (2) one trumpet = leaders only; (3) first alarm blast = east camp marches; (4) second alarm blast = south camp marches; (5) festal blasts = feast days and offerings. The final instruction (v.9–10) extends the trumpets\' function to warfare and worship: sounding trumpets before God in battle ensures divine remembrance and rescue; sounding them at feasts and offerings is a "memorial before God." The trumpets are not merely practical signals but theological statements: the covenant people are called, organised, and remembered by God.',
            'cross': [
                ('1 Cor 14:8', '"If the trumpet does not sound a clear call, who will get ready for battle?" Paul uses the military trumpet-clarity principle of Num 10:5–8 to make his point about intelligible speech in worship.'),
                ('1 Thess 4:16', '"For the Lord himself will come down from heaven, with a loud command, with the voice of the archangel and with the trumpet call of God." The eschatological trumpet echoes the Num 10 assembly-trumpet: the final summoning of the covenant community.'),
                ('Rev 8:2', 'The seven angels with seven trumpets in Revelation draw on the Num 10 trumpet-system — the covenant signals now cosmic in scope.'),
            ],
            'mac': [
                ('10:1–7', 'MacArthur: The precision of the trumpet signals — long blast/short blast, one/two trumpets, different combinations for different purposes — models the principle that communication in covenant community must be clear and codified. Ambiguous signals produce confused responses. The covenant people need unambiguous communication from their leadership.'),
                ('10:9–10', 'MacArthur: The trumpet\'s role in worship (v.10) — "a memorial before your God" — elevates it from a practical tool to a sacramental instrument. When Israel sounds the trumpet at feasts and offerings, they are calling God\'s attention to themselves as his covenant people. The sound is a prayer without words.'),
            ],
            'milgrom': [
                ('10:1–2', 'Milgrom: Two silver trumpets — the silver reflecting the precious character of the communication medium. Milgrom notes that the use of priests (not Levites or leaders) to blow the trumpets integrates the communication system into the priestly structure. The trumpets are extensions of the priestly vocation: calling, organising, and guiding the covenant community.'),
                ('10:9', 'Milgrom: "When you go to war in your own land against an enemy who is oppressing you, sound a blast on the trumpets. Then you will be remembered by the Lord your God." The trumpet as a memorial device (zikkārôn) connects to the Aaronic Blessing\'s "memorial" language. Israel\'s sound before God calls forth his remembering — his active, interventive attention.'),
            ],
            'ashley': [
                ('10:1–10', 'Ashley: The trumpet system is Numbers\' most direct practical communication mechanism — the covenant army needs clear, unambiguous signals. But Ashley notes the theological dimension: the trumpets are used not only to communicate with Israel (vv.5–7) but with God (vv.9–10). The covenant people communicate in both directions.'),
            ],
            'sarna': [
                ('10:10', 'Sarna: "Blow the trumpets over your burnt offerings and fellowship offerings… They will be a memorial (zikkārôn) for you before your God." The trumpet blast at sacrifice is a verbal claim on divine attention — "remember us" sounded in metal rather than words. The memorial concept (zākar) runs through the entire sacrificial system.'),
            ],
            'alter': [
                ('10:1–10', 'Alter: The trumpet instructions are the last piece of the Sinai legislation before Israel departs. The covenant people are now fully organised: census taken, camp arranged, Levites appointed, tabernacle dedicated, guidance established, communication system in place. Everything is ready; the trumpets call the march to begin.'),
            ],
            'calvin': [
                ('10:9–10', 'Calvin: The trumpet\'s role as a "memorial before God" teaches that God\'s remembering is not passive recall but active intervention. When Israel sounds the trumpet in war or worship, they are claiming the covenant promise: "I will be your God." The covenant memorial is the foundation of Israel\'s confidence in battle and in worship alike.'),
            ],
            'netbible': [
                ('10:2', 'NET Note: "Silver trumpets" (ḥăṣōṣĕrôt kĕsep) — straight metal tubes, distinct from the curved ram\'s horn (šôpār). Trumpets of this type have been found in Egyptian tomb contexts (Tutankhamun\'s tomb contained two). The priestly trumpets are a Levantine cultural form pressed into covenant service.'),
            ],
        },
        {
            'header': 'Verses 11–36 — The Departure from Sinai; Moses and Hobab; the Ark Prayer',
            'verses': verse_range(11, 36),
            'heb': [
                ('wayyissĕʿû bĕnê-yiśrāʾēl lĕmassĕʿêhem', "wayyisu benei-yisrael lemase'eihem", 'the Israelites set out stage by stage', 'The great departure from Sinai after almost a year. The phrase lĕmassĕʿêhem (according to their stages/journeys) uses the same root as the later "book of journeys" (Num 33). Israel\'s wilderness travel is structured as a series of divine-directed stages.'),
                ('qûmāh yhwh wĕyāpūṣû ʾōyĕbeykā', 'kumah YHWH weyaputzu oyevecha', 'Arise, O Lord! Let your enemies be scattered!', 'The ark-prayer for march (v.35) — a warrior-liturgy accompanying the ark\'s movement. When the ark moved, the covenant army moved; the ark-prayer commissions God himself as the vanguard of Israel\'s march. The language is battle-speech directed at the divine warrior.'),
            ],
            'ctx': 'The departure from Sinai (vv.11–28) follows the prescribed order of Num 2: Judah first, then Reuben, then the Levites with the tabernacle, then Ephraim, then Dan. The narrative detour (vv.29–32) features Moses\'s invitation to Hobab (his brother-in-law) to accompany Israel as a wilderness guide — a fascinating instance of Moses seeking human assistance alongside divine guidance. Hobab\'s response is ambiguous (vv.29–32); the narrative may imply eventual agreement (cf. Judg 1:16). The section closes with the two ark-prayers (vv.35–36) — when the ark moved: "Arise, Lord! May your enemies be scattered"; when it came to rest: "Return, Lord, to the countless thousands of Israel." These liturgies frame Israel\'s wilderness journey as divine warfare and divine homecoming.',
            'cross': [
                ('Ps 68:1', '"May God arise, may his enemies be scattered; may his foes flee before him." Psalm 68\'s opening verse quotes the Num 10:35 ark-prayer directly — the wilderness liturgy becomes a Davidic psalm, suggesting the ark-prayer was used in later Israelite worship.'),
                ('Ps 132:8', '"Arise, Lord, and come to your resting place, you and the ark of your might." The ark\'s journey from Sinai to the Promised Land continues in the ark\'s eventual arrival at Zion — the Num 10:36 "return" prayer finds its fulfilment in Jerusalem.'),
            ],
            'mac': [
                ('10:11–13', 'MacArthur: "On the twentieth day of the second month of the second year, the cloud lifted from above the tabernacle." After eleven months at Sinai — receiving the law, building the tabernacle, organising the community — Israel\'s wilderness march finally begins. The divine signal is given; the covenant army moves. The eleven-month preparation was not delay but essential formation.'),
                ('10:35–36', 'MacArthur: The two ark-prayers are warrior-liturgies — prayers that frame Israel\'s movement as divine warfare. "Arise, Lord!" commissions God as the vanguard; "Return, Lord!" acknowledges that God\'s return to his "countless thousands" is the purpose of every march. Israel\'s destination is not merely Canaan — it is the restoration of full covenant fellowship with the God who marches with them.'),
            ],
            'milgrom': [
                ('10:35–36', 'Milgrom: The ark-prayers are the oldest liturgical texts in the Bible — possibly predating even the Psalms in their original form. Their warrior-language ("scattered," "enemies," "foes") identifies the ark as the throne of the divine warrior, its movement as military advance. The covenant of Sinai is enacted in martial terms: the divine king leads his army into battle.'),
                ('10:29–32', 'Milgrom: Moses\'s invitation to Hobab reveals a pastoral realism: even with the divine cloud as guide, human knowledge of the wilderness terrain is valuable. Moses is not displaying lack of faith — he is displaying practical wisdom. The divine and the human are not in competition; they are complementary instruments of covenant navigation.'),
            ],
            'ashley': [
                ('10:11–28', 'Ashley: The departure from Sinai is the pivot of the entire Pentateuch narrative. The Abrahamic covenant, the Exodus, the Sinai law, the tabernacle construction — all of this has been preparation for this moment: Israel organised, equipped, and ready to march toward the promised land. Numbers 10:11 is the sentence that launches the covenant community into its wilderness future.'),
            ],
            'sarna': [
                ('10:29', 'Sarna: Moses\'s appeal to Hobab — "come with us and we will treat you well, for the Lord has promised good things to Israel" — is the first explicit invitation to a non-Israelite to join Israel\'s journey. Hobab\'s knowledge of the wilderness is offered as a gift; Israel\'s covenant blessings are offered in return. The covenant community is not closed to those who choose to join it.'),
            ],
            'alter': [
                ('10:35', 'Alter: "Arise, Lord! May your enemies be scattered; may your foes flee before you." The brevity and force of the ark-prayer — six Hebrew words — achieves what poetry always achieves at its best: maximum effect with minimum means. The divine warrior is invoked with a single verb and two parallel requests. The ark moves; God goes before.'),
            ],
            'calvin': [
                ('10:35–36', 'Calvin: The ark-prayers model the relationship between prayer and action: before the army marches, prayer calls on God to lead; when the army rests, prayer calls on God to dwell. Every movement and every rest of Israel\'s life is framed by invocation. The Christian equivalent is Paul\'s "pray without ceasing" — all of life encompassed by the arc of prayer.'),
            ],
            'netbible': [
                ('10:35', 'NET Note: Psalm 68:1 quotes this verse almost verbatim ("Let God arise, let his enemies be scattered"), suggesting the ark-prayer was incorporated into the liturgical Psalter. The movement from wilderness ark-prayer to temple Psalm demonstrates the continuity of Israel\'s worship tradition across its changing institutional forms.'),
            ],
        },
    ],
})

print("NUM-2 complete: Numbers 7–10 built.")

# ─────────────────────────────────────────────────────────────────────────────
# NUM-3: Chapters 11–14 — Complaint, Quail; Miriam; The Spy Crisis
# ─────────────────────────────────────────────────────────────────────────────

num(11, {
    'title': 'Fire, Quail, and the Seventy Elders: The Beginning of Complaint',
    'sections': [
        {
            'header': 'Verses 1–25 — Fire at Taberah; Complaining about Food; the Seventy Elders',
            'verses': verse_range(1, 25),
            'heb': [
                ('mistaʾôněnîm', 'mistaonenim', 'complaining / those who complained', 'The Hithpoel of ʾānan — an unusual form suggesting deliberate, habitual complaining. Not an involuntary grievance but a chosen posture of complaint against the covenant God. It marks the beginning of Numbers\' rebellion sequence.'),
                ('hāʾăsapsup', 'haasafsuf', 'the rabble / the riffraff / the mixed multitude', 'The discontented element within Israel — perhaps the "mixed multitude" of Exod 12:38 who joined Israel in the Exodus. Their craving (hittaʾawwû taʾăwāh) ignites the broader rebellion against the manna.'),
            ],
            'ctx': 'Numbers 11 opens the rebellion sequence that will dominate chs.11–21. Three crises in rapid succession: (1) unnamed complaint → fire at Taberah (vv.1–3); (2) craving for meat → the quail and plague (vv.4–34); (3) Moses\'s leadership crisis → the seventy elders (vv.14–25). The food complaint is particularly revealing — Israel lists the Egyptian food they miss (fish, cucumbers, melons, leeks, onions, garlic) and despises the manna God provides daily. Moses\'s own crisis (vv.11–15) is remarkable: he complains to God, "Why have you brought this trouble on your servant?… If this is how you are going to treat me, please go ahead and kill me." God\'s response is pastoral rather than punitive: he establishes the seventy elders to share Moses\'s burden, and he sends the quail — but the craving is met with a plague.',
            'cross': [
                ('1 Cor 10:6', '"Now these things occurred as examples to keep us from setting our hearts on evil things as they did." Paul explicitly uses the Num 11 rebellion as a warning for NT believers — the pattern of complaint against God\'s provision is a trap for every generation.'),
                ('Ps 106:14–15', '"In the desert they gave in to their craving; in the wilderness they put God to the test. So he gave them what they asked for, but sent a wasting disease among them." The Psalmist summarises Num 11 — God\'s judgment is not always refusal; sometimes it is granting the craving with consequences.'),
            ],
            'mac': [
                ('11:4–6', 'MacArthur: The food list — fish, cucumbers, melons, leeks, onions, garlic — reveals the nature of the complaint. Egypt\'s food was real, varied, and sensory. Manna is daily, reliable, and divine — but not diverse. The rebellion is not against hunger but against sameness; not against scarcity but against God\'s chosen form of provision. The complaint is fundamentally ingratitude.'),
                ('11:14–15', 'MacArthur: Moses\'s prayer for death is one of the most honest moments of pastoral exhaustion in Scripture. He does not pray secretly; he tells God exactly how he feels: "I cannot carry all these people alone; the burden is too heavy for me." God\'s response is not rebuke but provision — the seventy elders. God meets exhaustion with structure, not condemnation.'),
            ],
            'milgrom': [
                ('11:1', 'Milgrom: The fire at Taberah is set off by "complaint" (hĕmiṯʾônĕnîm) — a rare form suggesting pretextual or habitual grievance rather than genuine hardship. The fire burns "at the outskirts of the camp" — not the centre, not the tabernacle, but the margins. Divine judgment in Numbers begins at the periphery before spreading inward, reflecting graduated covenant consequence.'),
                ('11:16–17', 'Milgrom: The seventy elders parallel the Jethro tradition of Exod 18 but with a different mechanism: not administrative efficiency but spiritual endowment. God takes some of Moses\'s Spirit and places it on the seventy. The shared Spirit creates a distributed prophetic authority — leadership is not Moses alone but a community of Spirit-bearers.'),
            ],
            'ashley': [
                ('11:4–34', 'Ashley: The quail narrative is Numbers\' first extended crisis and its most psychologically rich. The people weep publicly (v.4, 10, 13, 18), Moses complains privately (vv.11–15), God responds with provision and judgment simultaneously (vv.18–20, 31–33). The chapter models the full complexity of covenant life: genuine distress, legitimate leadership struggle, divine patience, divine anger, and the terrible logic of getting what you crave.'),
            ],
            'sarna': [
                ('11:5', 'Sarna: The menu of Egyptian foods — "fish we used to eat in Egypt for free" — is not merely nostalgia but a theological statement. Egypt, the house of slavery, is remembered as the house of provision. The Exodus has been reframed in Israel\'s memory from redemption to deprivation. This inversion of perspective is the heart of the complaint.'),
            ],
            'alter': [
                ('11:11–15', 'Alter: Moses\'s soliloquy to God is among the most poignant passages in the Torah — a great leader at the breaking point, speaking with complete candour to the One who assigned him this impossible task. "Did I conceive all these people? Did I give them birth? Why do you tell me to carry them in my arms…?" The metaphor of nursing mother applied to Moses\'s pastoral burden is unforgettable.'),
            ],
            'calvin': [
                ('11:1–3', 'Calvin: The punishment at Taberah teaches that complaining against God\'s provision is not merely emotional negativity but covenant rebellion. To despise the manna — God\'s daily miracle — is to despise the God who gives it. Christian contentment is not passive acceptance but active gratitude for what God has chosen to provide, even when it is less than what we might choose.'),
            ],
            'netbible': [
                ('11:17', 'NET Note: "I will take some of the Spirit that is on you and put it on them" — the Spirit\'s distribution to the seventy elders is not division (Moses loses none) but multiplication. The text does not say Moses\'s Spirit is reduced; the shared anointing is additive, not subtractive. This models Spirit-empowered distributed leadership throughout the OT.'),
            ],
        },
        {
            'header': 'Verses 26–35 — Eldad, Medad, and the Quail Plague',
            'verses': verse_range(26, 35),
            'heb': [
                ('mitnabbe\'im', 'mitnabe\'im', 'were prophesying', 'Hithpael of nābaʾ — prophesying, but in what mode is unclear. This may refer to ecstatic, spirit-inspired speech rather than predictive prophecy. The verb form suggests something spontaneous and visibly unusual — hence Joshua\'s alarm.'),
                ('kĕvārāh', 'kevarak', 'about two cubits deep', 'The quail migration is so dense it covers the ground to a depth of three feet around the camp. The excess provision — not the lack of it — becomes the instrument of judgment. God\'s judgment through abundance is the chapter\'s most disturbing theological note.'),
            ],
            'ctx': 'Eldad and Medad (vv.26–30) stay in the camp rather than going to the tent of meeting but still receive the Spirit and prophesy — to Joshua\'s alarm and Moses\'s liberating response: "Are you jealous for my sake? I wish that all the Lord\'s people were prophets." The quail arrives in vast quantity (vv.31–33) — those who gathered least collected ten homers. But as they begin eating, "while the meat was still between their teeth," God strikes with a severe plague. The place is named Kibroth Hattaavah — "Graves of Craving." The craving became the grave.',
            'cross': [
                ('Acts 2:17–18', '"In the last days, God says, I will pour out my Spirit on all people. Your sons and daughters will prophesy." Peter quotes Joel in describing Pentecost — the fulfilment of Moses\'s wish: "I wish that all the Lord\'s people were prophets" (Num 11:29).'),
                ('Ps 78:29–31', '"He gave them what they craved… but before they turned from what they craved, even while the food was still in their mouths, God\'s anger rose against them." The Psalmist\'s reflection on Kibroth Hattaavah — the anatomy of craving-turned-grave.'),
            ],
            'mac': [
                ('11:28–29', 'MacArthur: "Are you jealous for my sake?" — Moses\'s response to Joshua\'s protectiveness is one of the most gracious statements of leadership in Scripture. A leader who is threatened by others\' gifts will suppress them; a leader who longs for God\'s blessing on all will celebrate every expression of the Spirit. Moses models the anti-jealousy of true covenant leadership.'),
                ('11:31–34', 'MacArthur: The quail plague is Numbers\' most sobering divine judgment — not fire, not disease, but the consequence of getting exactly what was demanded. "While the meat was still between their teeth" — the craving that began as a complaint ended as a grave. Kibroth Hattaavah is a memorial warning: some prayers are dangerous to have answered.'),
            ],
            'milgrom': [
                ('11:26–30', 'Milgrom: The Eldad-Medad episode introduces a principle that will recur throughout Israel\'s history: the Spirit of God is not bound to institutional structures. The Spirit falls on those who did not follow the prescribed procedure (going to the tent). Moses\'s response — "I wish all the Lord\'s people were prophets" — anticipates Joel\'s prophecy and Pentecost.'),
            ],
            'ashley': [
                ('11:33', 'Ashley: "But while the meat was still between their teeth and before it could be consumed, the anger of the Lord burned against the people." The timing is theologically precise — the judgment comes at the moment of satisfaction, not the moment of craving. The craving itself was not punished; the consuming satisfaction of it was. God judges not the desire but the idol made of it.'),
            ],
            'alter': [
                ('11:32', 'Alter: "All that day and night and all the next day the people went out and gathered quail. No one gathered less than ten homers." The scale of the gathering — every person, all day and night, minimal collection ten bushels — is grotesque. The excess is itself the judgment; the abundance is already becoming the grave.'),
            ],
            'calvin': [
                ('11:34', 'Calvin: Kibroth Hattaavah — "Graves of Craving" — is a permanent memorial to the principle that disordered desire destroys. The people\'s craving was not for food per se (they had manna) but for the satisfactions of a life without God\'s constraints. When God removed the constraints and gave the craving its fullest expression, it killed them. Ungoverned desire is always ultimately fatal.'),
            ],
            'netbible': [
                ('11:31', 'NET Note: "From the sea" — quail migrated annually across the Sinai peninsula from Africa to the Mediterranean, often flying low and landing exhausted on the ground where they could be easily caught. The "miraculous" element is not the quail themselves but their divinely-timed, divinely-scaled provision — and its timing with the people\'s demand.'),
            ],
        },
    ],
})

num(12, {
    'title': 'Miriam and Aaron: The Challenge to Moses\'s Authority',
    'sections': [
        {
            'header': 'Verses 1–9 — Miriam and Aaron Speak Against Moses',
            'verses': verse_range(1, 9),
            'heb': [
                ('wĕhāʾîš mōšeh ʿānāw mĕʾōd', "weha'ish Moshe anav me'od", 'Now Moses was a very humble man', 'Ânāv (humble/meek) — the quality that makes Moses uniquely suited to hear God directly. His humility is not weakness but a particular form of spiritual receptivity: he does not grasp at status or defend his position. God defends it for him.'),
                ('peh ʾel-peh ădabbēr-bô', "peh el-peh adaber-vo", 'I speak with him face to face / mouth to mouth', 'God\'s description of his unique relationship with Moses — not through visions or dreams (as with other prophets) but directly, clearly, "mouth to mouth." The intimacy of Moses\'s prophetic access is unparalleled in Israel\'s history (cf. Deut 34:10).'),
            ],
            'ctx': 'Miriam and Aaron challenge Moses on two grounds: his Cushite wife (ethnicity objection) and their own prophetic status ("Has the Lord spoken only through Moses?"). The narrator notes the first objection but God addresses only the second — the prophetic-authority challenge. God summons all three to the tent of meeting, distinguishes Moses\'s prophetic access from all others (not through visions but "face to face"), and strikes Miriam with ṣāraʿat. Aaron pleads; Moses intercedes. Miriam is confined outside the camp for seven days. The entire community waits for her.',
            'cross': [
                ('Deut 34:10', '"Since then, no prophet has risen in Israel like Moses, whom the Lord knew face to face." The claim of Num 12:6–8 is confirmed at Moses\'s death: the "mouth to mouth" relationship was unique and unrepeated.'),
                ('Matt 17:5', '"This is my Son, whom I love; with him I am well pleased. Listen to him!" At the Transfiguration, God\'s voice distinguishes Jesus from Moses and Elijah — the ultimate "face to face" relationship surpassing even Moses\'s unique access.'),
            ],
            'mac': [
                ('12:1–3', 'MacArthur: The Cushite wife objection is almost certainly a cover for the real issue — prophetic authority. The narrator\'s aside ("Moses was a very humble man") is not accidental: it is the theological key. Miriam and Aaron\'s challenge is essentially a power struggle; Moses\'s humility is precisely what makes him immune to the temptation to fight back. He does not need to defend himself because he has no ego investment in his position.'),
                ('12:6–8', 'MacArthur: God\'s distinction between Moses and all other prophets — "With him I speak face to face, clearly and not in riddles" — establishes a prophetic hierarchy that will govern Israel\'s understanding of revelation for millennia. Not all prophecy is equal; not all prophetic access is the same. Moses stands at the apex of Israel\'s prophetic tradition.'),
            ],
            'milgrom': [
                ('12:1', 'Milgrom: The Cushite wife is identified with Zipporah in some traditions (Exod 2:21, from Midian; some traditions identify Midian with Cush). The objection may be ethnic — Moses married a non-Israelite — or it may simply be the presenting complaint for the deeper power struggle. Either way, God does not address it, suggesting the ethnic objection was a pretext.'),
                ('12:8', 'Milgrom: "The form of the Lord" (tĕmûnat yhwh) — Moses sees not merely the divine glory but some form or likeness. This goes beyond any other Israelite\'s prophetic access, approaching but not reaching the direct sight of God\'s face (Exod 33:20). Moses is the prophet-mediator who bridges the gap between divine transcendence and human finitude.'),
            ],
            'ashley': [
                ('12:1–16', 'Ashley: The Miriam-Aaron episode reveals that the challenges to covenant authority do not only come from outside the community (the rabble, the Egyptians) but from within the family and the leadership. Aaron and Miriam are Moses\'s own siblings and both prophetic figures. The threat from within is the more dangerous one — and God addresses it with both judgment and mercy.'),
            ],
            'sarna': [
                ('12:3', 'Sarna: The narrator\'s parenthetical note — "Now Moses was a very humble man, more humble than anyone else on the face of the earth" — is one of the Torah\'s most unusual first-person-style comments. Its placement between the challenge (vv.1–2) and God\'s response (vv.4–8) is interpretive: Moses\'s greatness is not power but receptivity. He is great because he is empty of self.'),
            ],
            'alter': [
                ('12:6–8', 'Alter: God\'s speech distinguishing Moses from other prophets is among the most formally elevated passages in Numbers — carefully structured, rhetorically precise, climaxing in the devastating rhetorical question of v.8: "Why then were you not afraid to speak against my servant Moses?" The divine defense of Moses is more devastating than any punishment Moses could have requested.'),
            ],
            'calvin': [
                ('12:3', 'Calvin: Moses\'s humility is not natural meekness but God-wrought submission — the quality of a man who has seen God "face to face" and therefore has no need to assert himself before other humans. Those who have genuinely encountered God\'s glory find human status comparison absurd. True meekness flows from worship.'),
            ],
            'netbible': [
                ('12:7', 'NET Note: "He is faithful in all my house" (neʾĕmān bĕkol-bêtî) — the title "faithful in all my house" is unique to Moses in the OT. The writer of Hebrews (3:2, 5) uses it to compare Moses\'s faithfulness with Christ\'s: Moses as faithful servant in God\'s house; Christ as faithful Son over God\'s house.'),
            ],
        },
        {
            'header': 'Verses 10–16 — Miriam\'s Leprosy; Moses\'s Intercession; Seven Days Outside',
            'verses': verse_range(10, 16),
            'heb': [
                ('ʾal-naʾ tĕhî kĕmēt', "al-na tehi kamet", 'please do not let her be like the dead', 'Moses\'s intercession for Miriam is brief and urgent — seven Hebrew words. The "please" (naʾ) signals urgent entreaty; the comparison to "the dead" (who emerge from the womb already half-decayed, v.12) shows the severity of her condition. Moses prays for the sister who just challenged him.'),
            ],
            'ctx': 'When the cloud lifts from the tent of meeting, Miriam is suddenly covered with ṣāraʿat. Aaron turns and sees — her skin is white as snow. He immediately confesses ("we have sinned") and pleads with Moses, who immediately intercedes for her. God\'s response: she will be confined outside the camp for seven days, as if her father had spit in her face (a shaming gesture). The entire camp waits for Miriam\'s seven days before moving. The combination of judgment (confinement), mercy (healing), and community solidarity (waiting) is characteristic of Numbers at its most pastorally complex.',
            'cross': [
                ('Luke 17:14', '"Go, show yourselves to the priests." Jesus sends healed lepers to the priests in fulfilment of the Levitical procedure — the same process that will declare Miriam clean after her seven days outside the camp.'),
                ('Matt 5:44', '"Pray for those who persecute you." Moses intercedes immediately for the sister who just challenged his authority — the pattern Jesus commands is first enacted by Moses.'),
            ],
            'mac': [
                ('12:13', 'MacArthur: Moses\'s seven-word prayer for Miriam — "Please, God, heal her!" — is the shortest intercessory prayer in Scripture and among the most powerful. After Miriam has publicly challenged his authority, Moses\'s first response is prayer for her, not satisfaction at her judgment. This is the meekness of v.3 in action: no vindictiveness, no gloating, immediate compassionate intercession.'),
                ('12:15', 'MacArthur: "The people did not move on till Miriam was brought back" — the entire covenant community halts for one member\'s restoration. Israel\'s march is not more important than the redemption of a single person. The community\'s coherence takes precedence over its schedule.'),
            ],
            'milgrom': [
                ('12:10–12', 'Milgrom: Aaron\'s description of Miriam as "like a stillborn infant" (v.12) is a graphic description of advanced ṣāraʿat — skin so damaged it resembles a half-formed newborn. The simile drives home the severity of her condition and the urgency of Moses\'s intercession. Milgrom notes this is one of the OT\'s most vivid descriptions of ṣāraʿat\'s full effect.'),
            ],
            'ashley': [
                ('12:15–16', 'Ashley: The community waiting for Miriam — a woman, a prophet, one who has just been punished — is a striking counter to the tendency of ancient communities to simply move on and leave the disgraced behind. Israel\'s solidarity with Miriam in her shame and restoration is a model of covenant community: no one is dispensable, not even the disciplined.'),
            ],
            'sarna': [
                ('12:14', 'Sarna: "If her father had spit in her face, would she not have been in disgrace for seven days?" — the seven-day period parallels the seven-day shame-period in ancient Near Eastern custom for public disgrace. God\'s discipline mirrors human social consequences but adds the element of genuine physical healing and restoration — judgment with a clear endpoint.'),
            ],
            'alter': [
                ('12:13', 'Alter: The brevity of Moses\'s intercession — four words in Hebrew (ʾēl nāʾ rĕfāʾ nāʾ lāh — "Please God, heal her please") — is itself a theological statement. Moses does not craft an elaborate plea or argue theological reasons; he cries out the bare minimum of urgent love. Sometimes prayer is simply "please."'),
            ],
            'calvin': [
                ('12:10–16', 'Calvin: Miriam\'s punishment and restoration model the covenant\'s discipline-and-mercy structure. The judgment is real (seven days outside), the humiliation genuine, but the endpoint is clear and the restoration complete. God does not destroy Miriam for her rebellion — he disciplines her and restores her. The covenant\'s judgment is always in service of the covenant\'s relationship.'),
            ],
            'netbible': [
                ('12:15', 'NET Note: "The people did not move on till Miriam was brought back" — the Hiphil of ʾāsap ("gathered in/brought back") uses the same root as the verb for gathering the dead for burial. Miriam is "gathered back" from the social death of camp exclusion — her restoration is a small resurrection.'),
            ],
        },
    ],
})

num(13, {
    'title': 'The Spies: Seeing the Land Through the Eyes of Fear',
    'sections': [
        {
            'header': 'Verses 1–25 — The Twelve Spies Sent; The Land Explored',
            'verses': verse_range(1, 25),
            'heb': [
                ('ʾănāšîm', 'anashim', 'men', 'One leader from each tribe — significant men, each a chieftain (nāśîʾ) of his tribe. The spies are not random soldiers but tribal leaders entrusted with the mission. Their failure is therefore not just personal but representational — Israel\'s leadership fails the covenant test.'),
                ('Kālēb ben Yĕpunneh', 'Calev ben Yefunneh', 'Caleb son of Jephunneh', 'Caleb\'s name likely means "dog" or "wholehearted" — the latter apt for the man who follows God "wholeheartedly" (14:24). His wholehearted spirit (ʿaqab ʾaḥărāy) stands in direct contrast to the ten spies\' fearful report.'),
            ],
            'ctx': 'Numbers 13 records the spy mission to Canaan — the decisive test that will determine whether the Exodus generation enters the promised land. Moses sends twelve tribal leaders for forty days. They bring back an enormous cluster of grapes (requiring two men to carry), pomegranates, and figs — visible confirmation that the land "flows with milk and honey." They also bring back the report of fortified cities and giant inhabitants (Nephilim, Anakites). The chapter ends at the threshold of the great crisis: ten spies see the people as grasshoppers before the giants; two see the same facts through the lens of faith.',
            'cross': [
                ('Heb 3:19', '"So we see that they were not able to enter, because of their unbelief." The writer of Hebrews identifies the spy crisis as the paradigmatic failure of unbelief — the event that defines Israel\'s wilderness generation for the NT as a negative example.'),
                ('Josh 14:6–14', 'Caleb, 85 years old, claims the land God promised him at Kadesh-barnea — the faith of his spy mission vindicated forty-five years later.'),
            ],
            'mac': [
                ('13:17–20', 'MacArthur: Moses\'s briefing for the spies is detailed and practical: assess the land (Is it good or bad?), the people (Are they strong or weak?), the cities (Are they unwalled or fortified?), the soil (Is it fertile or poor?). The mission is intelligence-gathering, not doubt-expressing. The problem is not the reconnaissance but what the ten spies do with the information they gather.'),
                ('13:23–24', 'MacArthur: The enormous grape cluster — two men, a pole — is a tangible confirmation of the Promised Land\'s abundance. The evidence was visible and concrete: the land flows with milk and honey. The problem is not insufficient evidence but insufficient faith to act on the evidence that was given.'),
            ],
            'milgrom': [
                ('13:2', 'Milgrom: "Send men to explore the land of Canaan, which I am giving to the Israelites." The divine command uses the participiple "I am giving" — the gift is already in process. The land is being given; the reconnaissance is not to determine whether to go but how. The ten spies\'s later report converts a logistics mission into a referendum on the promise.'),
                ('13:27–29', 'Milgrom: The spies\' report has two parts: the land is indeed flowing with milk and honey (the good news, vv.27–28a), but the people are powerful and the cities large (the bad news, vv.28b–29). The ten spies lead with the good news but frame the bad news as determinative. Caleb and Joshua will reverse this weighting.'),
            ],
            'ashley': [
                ('13:1–25', 'Ashley: The forty-day reconnaissance period mirrors other significant forty-day periods in the Pentateuch (Exod 24:18, Moses on Sinai; Gen 7:4, the flood). The number signals a divine appointment — a period of testing and preparation. The spies return from their forty-day test; Israel\'s response will consign the generation to forty years.'),
            ],
            'sarna': [
                ('13:22', 'Sarna: "Hebron had been built seven years before Zoan in Egypt" — a historical note that grounds the spy narrative in real geography. Hebron is one of the oldest cities in Canaan; the Anakites who lived there were a notoriously large people (Deut 9:2). The spies\' fear is not irrational — Hebron\'s history and inhabitants were genuinely formidable by human standards.'),
            ],
            'alter': [
                ('13:23', 'Alter: The grape cluster carried on a pole by two men is one of Numbers\' most vivid images — a hyperbolically literal fulfilment of "a land flowing with milk and honey." The fruit is so large two men must carry it. The land exceeds even what the promise implied. The problem is not the evidence but the ability to trust it.'),
            ],
            'calvin': [
                ('13:17–25', 'Calvin: The spy mission is not unbelief — Moses commands it, God permits it. Intelligence-gathering is not incompatible with faith. The sin comes afterward, when the ten spies allow the intelligence to overwhelm the promise. Faith does not ignore reality; it interprets reality through the lens of God\'s covenant word.'),
            ],
            'netbible': [
                ('13:22', 'NET Note: "Ahiman, Sheshai, and Talmai, the descendants of Anak" — the three Anakites at Hebron are named, giving them individual identity and weight. These are not generic "big people" but named, powerful individuals whose size made them legendary. The spies\' fear is not fabrication; the threat they faced was real. But God is greater.'),
            ],
        },
        {
            'header': 'Verses 26–33 — The Spies\' Report: The Grasshopper Complex',
            'verses': verse_range(26, 33),
            'heb': [
                ('wayyahaś', 'wayyahas', 'he silenced / he calmed', 'Caleb\'s verb: he "hushed" (haśāh) the people before Moses — a command to stop the panic. One man against the tide of ten, silencing the assembly. His action as much as his words is the embodiment of the faith that distinguishes him.'),
                ('kaḥăgābîm', 'kachagavim', 'like grasshoppers', 'The ten spies\' self-description: "We seemed like grasshoppers in our own eyes, and we looked the same to them." The double perception — how they saw themselves, how they imagined the giants saw them — reveals the mechanism of unbelief: it begins with self-assessment, not with God-assessment.'),
            ],
            'ctx': 'The spies\' return (vv.26–29) initially confirms the mission\'s findings — good land, but formidable inhabitants. Then Caleb silences the panic and proposes immediate action: "We should go up and take possession of the land, for we can certainly do it." The ten contradict him: "We can\'t attack those people; they are stronger than we are." Their report escalates into a "bad report" (dibbāh) — slander against the land. The final image is devastating: "We seemed like grasshoppers in our own eyes." Self-perception, not God\'s assessment, has become the measure of reality. Israel has exchanged God\'s perspective for their own smallness.',
            'cross': [
                ('2 Tim 1:7', '"For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." The antidote to the grasshopper complex — the Spirit of power replaces the spirit of fear that reduced Israel to grasshoppers in their own eyes.'),
                ('Rom 8:31', '"If God is for us, who can be against us?" Paul\'s rhetorical question is the theological counter to Num 13:31 ("We can\'t attack those people; they are stronger than we are"). The issue is not the strength of the opposition but the identity of the one on Israel\'s side.'),
            ],
            'mac': [
                ('13:30', 'MacArthur: Caleb\'s "We can certainly do it" is one of faith\'s clearest statements in the Torah — not a denial of the obstacles but a declaration that the obstacles are secondary to the promise. He has seen the same giants, the same fortified cities, the same formidable reality as the ten. He interprets that reality through the covenant rather than through his own smallness.'),
                ('13:33', 'MacArthur: "We seemed like grasshoppers in our own eyes" — the ten spies have committed the fundamental theological error: they have made themselves the measure. The question is not "How big are we compared to the giants?" but "How big is God compared to the giants?" Self-measurement always produces despair; God-measurement always produces courage.'),
            ],
            'milgrom': [
                ('13:32', 'Milgrom: "The land we explored devours those living in it" — the ten spies\' description of Canaan as a "land that devours its inhabitants" contradicts the earlier report of its fertility. The slander (dibbāh) is not merely about the inhabitants but about the land itself. They are not just afraid of the Canaanites; they have rejected the promise.'),
            ],
            'ashley': [
                ('13:30–33', 'Ashley: The contrast between Caleb\'s single verse (v.30) and the ten spies\' three verses (vv.31–33) is telling. One voice of faith is overwhelmed by multiple voices of fear. The majority report is not automatically the correct one; in the covenant community, faithfulness is measured by alignment with God\'s word, not by headcount.'),
            ],
            'sarna': [
                ('13:33', 'Sarna: "We seemed like grasshoppers in our own eyes, and we looked the same to them" — the second half is a projection: the spies assume the giants saw them as small as they saw themselves. They have no evidence for this; it is the imagination of unbelief. Fear projects its own self-assessment onto others and calls the projection reality.'),
            ],
            'alter': [
                ('13:32–33', 'Alter: The "bad report" (dibbāh) escalates through two verses from realism (fortified cities, powerful people) to slander (land that devours its inhabitants, giants who make us grasshoppers). The movement from factual intelligence to panic-driven distortion is the textbook anatomy of how unbelief processes reality.'),
            ],
            'calvin': [
                ('13:31–33', 'Calvin: "We can\'t attack those people; they are stronger than we are." The ten spies speak the truth about human strength and lie about theological reality. They have seen God\'s power in the Exodus, the Red Sea, the provision of manna and water, the Sinai theophany — and still conclude that the Canaanites are stronger. Unbelief is not lack of evidence; it is refusal to interpret evidence through the lens of covenant experience.'),
            ],
            'netbible': [
                ('13:33', 'NET Note: "Nephilim" (v.33) — the reference to the Nephilim connects to Gen 6:4, where they appear before the flood. Their post-flood appearance here either reflects legendary tradition about large people groups or the use of the term for any extraordinarily large warriors. The point for the narrative is the ten spies\' perception of overwhelming, superhuman opposition.'),
            ],
        },
    ],
})

num(14, {
    'title': 'The Rebellion at Kadesh: The Sentence of Forty Years',
    'sections': [
        {
            'header': 'Verses 1–25 — The People\'s Rebellion; Moses\'s Intercession',
            'verses': verse_range(1, 25),
            'heb': [
                ('lûlê', 'lulei', 'if only / would that', 'The ultimate inversion: "If only we had died in Egypt! If only we had died in this wilderness!" The people who were enslaved in Egypt and are now months from the promised land wish they were back in Egypt or dead. The covenant has been completely inverted in their imagination.'),
                ('lĕmaʿan šimkā', 'lemaʼan shimcha', 'for the sake of your name / for your name\'s sake', 'Moses\'s intercession turns not on Israel\'s repentance (there is none) but on God\'s own reputation among the nations. The nations who heard of the Exodus will say YHWH was unable to complete what he began. God\'s honour is the ground of Moses\'s appeal.'),
            ],
            'ctx': 'Numbers 14 is the climactic crisis of the Pentateuch. The people weep through the night, propose returning to Egypt, and move to stone Caleb and Joshua. God announces his intention to destroy Israel and start over with Moses. Moses intercedes with three arguments: (1) God\'s reputation among the nations (vv.13–16); (2) the divine character proclamation of Exod 34:6–7 (vv.17–19); (3) the covenant itself ("forgive, as you have forgiven since Egypt," v.19). God responds: "I have forgiven them, as you asked" — but with a judicial consequence. The Exodus generation will die in the wilderness. Every person who was counted in the census (20 years and older) will not enter Canaan. Only Caleb and Joshua are excepted. Forty years in the wilderness: one year for each day of the spy mission.',
            'cross': [
                ('Heb 3:16–4:2', '"Who were they who heard and rebelled? Were they not all those Moses led out of Egypt?… They were not able to enter, because of their unbelief." The writer of Hebrews makes Num 14 the paradigmatic warning passage for the NT church: covenant proximity does not guarantee covenant entry.'),
                ('Exod 34:6–7', '"The Lord, the Lord, the compassionate and gracious God, slow to anger, abounding in love and faithfulness." Moses quotes the Sinai self-revelation of God as the basis for his intercession — God\'s own stated character is the grounds for the appeal.'),
            ],
            'mac': [
                ('14:13–19', 'MacArthur: Moses\'s intercession is one of the great theological arguments in Scripture. He does not argue Israel\'s merit (they have none) or their potential (they have just proved faithless). He argues God\'s character and God\'s reputation. The intercession is entirely theocentric — "for the sake of your name" (cf. v.17). This is the model for Christian prayer: appeal to God\'s own character, not to our own worthiness.'),
                ('14:20–23', 'MacArthur: "I have forgiven them, as you asked" — God forgives but does not remove consequences. Forgiveness and judgment are not mutually exclusive in the covenant framework. The generation is forgiven in the sense that they are not immediately destroyed; they are judged in that they will not enter the land. The grace that preserves them and the justice that sentences them operate simultaneously.'),
            ],
            'milgrom': [
                ('14:1–4', 'Milgrom: The people\'s proposal to return to Egypt (v.4) is the logical endpoint of the spy crisis: if the land cannot be taken, the only alternative is retreat to the starting point. The proposal to appoint a leader to take them back to Egypt inverts the Exodus — the people are now proposing a reverse Exodus, returning to slavery. This is the nadir of Israel\'s covenant failure.'),
                ('14:17–19', 'Milgrom: Moses\'s quotation of the divine character formula (Exod 34:6–7) as the basis for intercession establishes a principle of covenant prayer: God\'s own self-disclosure is the most powerful ground for appeal. Moses holds God to his own self-declaration. This is not manipulation but covenant faithfulness — praying God\'s own promises back to him.'),
            ],
            'ashley': [
                ('14:1–10', 'Ashley: The community\'s response to the spies\' report escalates rapidly: weeping (v.1), corporate complaint (v.2), desire for death (v.2), proposal to return to Egypt (v.3), stone Caleb and Joshua (v.10). The speed of the descent from fear to murderous intent reveals how thin the covenant community\'s loyalty was. Grace had not yet been appropriated; it had only been received.'),
            ],
            'sarna': [
                ('14:11', 'Sarna: "How long will these people treat me with contempt? How long will they refuse to believe in me, in spite of all the signs I have performed among them?" God\'s rhetorical questions to Moses reveal divine grief as much as divine anger. The language is relational, not merely judicial — these are the words of a covenant partner who has been consistently rejected despite consistent faithfulness.'),
            ],
            'alter': [
                ('14:13–16', 'Alter: Moses\'s argument from international reputation is extraordinary — he appeals to what the Egyptians will say, what the nations will conclude. He is not being cynical; he is being theologically astute. God\'s honour among the nations is a legitimate and powerful ground for mercy. The nations watching the Exodus deserve to see its completion; God\'s aborted promise would be a theological scandal.'),
            ],
            'calvin': [
                ('14:17–19', 'Calvin: Moses\'s intercession models the principle that the deepest ground for prayer is not human need but divine character. "In accordance with your great love, forgive the sin of these people" — Moses appeals not to Israel\'s contrition (absent) or to their future potential (dubious) but to God\'s love and God\'s past forgiveness. This is the structure of Christian prayer at its best: appealing to what God is and what God has already done.'),
            ],
            'netbible': [
                ('14:18', 'NET Note: "Forgiving wickedness, rebellion and sin. Yet he does not leave the guilty unpunished; he punishes the children for the sin of the parents to the third and fourth generation" — Moses quotes Exod 34:6–7 but omits the opening list of God\'s gracious attributes, moving directly to the justice-mercy tension. He uses the full text including the justice clause — his prayer is honest about God\'s character, not selective.'),
            ],
        },
        {
            'header': 'Verses 26–45 — The Forty-Year Sentence; the Defeated Presumption',
            'verses': verse_range(26, 45),
            'heb': [
                ('yĕdaʿtem ʾet-tĕnûʾātî', 'yeda\'tem et-tenuati', 'you will know what it is like to have me withdraw my support / you will feel my opposition', 'A deeply ominous phrase — tĕnûʾāh means "my thwarting" or "my opposition." The generation that refused to enter Canaan will experience God opposing their movement rather than leading it — the ultimate covenant reversal.'),
                ('wayaʿpîlû', 'wayapiloo', 'yet they dared to go up / they presumed / they acted presumptuously', 'The word for the unauthorized assault on the Amalekites and Canaanites — the people try to enter the land on their own, after the sentence has been declared. Presumption is the opposite of faith: where faith acts on God\'s invitation, presumption acts on God\'s absence.'),
            ],
            'ctx': 'The divine sentence (vv.26–35) is precise: everyone counted in the census (20+) will die in the wilderness — one year for each spy day, forty years total. Only Caleb and Joshua are exempted. The ten unfaithful spies die immediately of plague. Then in an act of grotesque irony, the people immediately reverse course and attempt to enter Canaan anyway — without the ark, without Moses, against Moses\'s warning. They are defeated by the Amalekites and Canaanites. Presumption after refusal is no more pleasing to God than refusal itself. The generation is now condemned from both directions: they refused when God invited; they attempted when God forbade.',
            'cross': [
                ('Num 14:44', '"Nevertheless, in their presumption they went up toward the high hill country, though neither Moses nor the ark of the Lord\'s covenant moved from the camp." The absent ark is the theological marker: Israel attempted what only God\'s presence can accomplish. Without the ark (the symbol of divine accompaniment), the campaign was doomed before it began.'),
                ('Luke 14:28–32', '"Suppose a king is about to go to war against another king. Won\'t he first sit down and consider whether he is able with ten thousand men to oppose the one coming against him with twenty thousand?" Jesus\'s principle of counting the cost before action reflects the Num 14 lesson: the issue is not whether to fight but whether God is with you.'),
            ],
            'mac': [
                ('14:26–35', 'MacArthur: The forty-year sentence is proportional, specific, and memorable: one year for each spy day. The spy mission that took forty days produces forty years of consequences. God\'s judicial sentences are not arbitrary but calibrated — the punishment fits the crime in a way Israel will never forget. Every year of wilderness wandering is a reminder of one day of faithless reconnaissance.'),
                ('14:39–45', 'MacArthur: The presumptuous assault on Canaan is the covenant\'s tragic irony: the generation who refused to go when God invited now attempts to go when God has forbidden. Both the refusal and the presumption are forms of self-will — replacing God\'s timing and command with their own. Faith acts on God\'s invitation, neither refusing nor presuming.'),
            ],
            'milgrom': [
                ('14:29–33', 'Milgrom: The census numbers reappear in the sentence — "this generation" is defined precisely as those counted in Num 1 (600,000+ males, ages 20+). The census that organised Israel into an army now defines the generation that will die without entering Canaan. The census data becomes the sentence data: every man numbered will die unnumbered in the wilderness.'),
                ('14:44', 'Milgrom: "The ark of the Lord\'s covenant did not move from the camp" — the ark\'s immobility is the key detail. The divine warrior who goes before Israel (10:35) has withdrawn. Without the ark\'s movement, Israel has no divine vanguard; their assault is entirely human — and humanly insufficient.'),
            ],
            'ashley': [
                ('14:39–45', 'Ashley: The attempted entry into Canaan after the judgment is pronounced reveals the generation\'s fundamental problem: they respond to circumstances rather than to God\'s word. When the spies reported negatively, they despaired. When God announced judgment, they decided to act. Neither response is faith — both are reactions to events rather than responses to the covenant word.'),
            ],
            'sarna': [
                ('14:44–45', 'Sarna: The defeat at Hormah by the Amalekites and Canaanites is the first military defeat recorded for Israel in the wilderness — a foretaste of the forty years\' experience. The generation that saw Egypt, the Red Sea, and Sinai ends by being "beaten back" at the boundary of the land they refused to enter. The trajectory of unbelief is always downward.'),
            ],
            'alter': [
                ('14:40', 'Alter: "We have sinned. We will go up to the place the Lord promised." The repentance comes one day too late and takes the wrong form: they confess the sin of refusing to go and then immediately attempt to go — as if the action can undo the confession. Genuine repentance accepts the consequences of sin; presumptuous repentance tries to remove consequences through compensating action.'),
            ],
            'calvin': [
                ('14:26–35', 'Calvin: The forty-year sentence teaches that covenant consequences are real and permanent within this life, even after forgiveness. God forgives the rebellion; he does not immediately remove its earthly consequences. The Christian who has been forgiven a serious sin may live with its earthly consequences for the rest of their life. Forgiveness restores the relationship; it does not always restore the circumstances.'),
            ],
            'netbible': [
                ('14:34', 'NET Note: "For forty years — one year for each of the forty days you explored the land — you will suffer for your sins and know what it is like to have me against you." The correlation is exact: the spy mission determined the wilderness sentence. The forty days of faithless reconnaissance translated into forty years of wilderness discipline. Divine judgment is precisely calibrated.'),
            ],
        },
    ],
})

print("NUM-3 complete: Numbers 11–14 built.")

# ─────────────────────────────────────────────────────────────────────────────
# NUM-4: Chapters 15–19 — Offering Laws; Korah; Aaron's Staff; Red Heifer
# ─────────────────────────────────────────────────────────────────────────────

num(15, {
    'title': 'Supplementary Offering Laws: Grace After Judgment',
    'sections': [
        {
            'header': 'Verses 1–31 — Supplementary Offerings; Unintentional and Defiant Sin',
            'verses': verse_range(1, 31),
            'heb': [
                ('kî tāḇōʾû ʾel-ʾereṣ', 'ki tavo\'u el-eretz', 'when you come into the land', 'The repeated formula for the laws of ch.15 — offered to a generation that has just been sentenced to die in the wilderness. The laws assume the next generation will enter the land. Judgment on the present does not cancel promise for the future.'),
                ('bĕyād rāmāh', 'beyad ramah', 'with a high hand / defiantly / presumptuously', 'The deliberate, defiant sin (Num 15:30) that no sacrifice can cover — the opposite of the unintentional sin (bišgāgāh) for which the ḥaṭṭāʾt provides atonement. The "high hand" sinner blasphemes YHWH and must be cut off.'),
            ],
            'ctx': 'Numbers 15 follows the Kadesh catastrophe with supplementary offering laws — a remarkable pastoral move. God addresses the next generation immediately after sentencing the current one: "When you enter the land I am giving you as a home…" (v.2). The laws cover accompanying offerings for burnt and fellowship offerings (vv.1–16), first-fruits contribution (vv.17–21), and the critical distinction between unintentional sin (atoneable, vv.22–29) and defiant sin (unatonable, v.30–31). The chapter closes with the Sabbath-breaker narrative (vv.32–36) and the command to wear tassels (vv.37–41) — visible reminders of the commandments for a generation prone to forgetting.',
            'cross': [
                ('Heb 10:26', '"If we deliberately keep on sinning after we have received the knowledge of the truth, no sacrifice for sins is left." The NT equivalent of the "high hand" category — the NT too distinguishes between the forgiven sinner who struggles and the apostate who defies.'),
                ('Matt 23:5', '"Everything they do is done for people to see: they make their phylacteries wide and the tassels on their garments long." Jesus addresses the hypocrisy of tassels divorced from obedience — the tassel command (Num 15:38–40) was for remembrance, not performance.'),
            ],
            'mac': [
                ('15:1–2', 'MacArthur: The placement of these laws immediately after the forty-year sentence is intentionally pastoral. The current generation is condemned; their children are not. God\'s instruction for life in Canaan is given to the next generation while the wilderness generation still lives. The judgment does not end the promise — it delays and transfers it.'),
                ('15:30–31', 'MacArthur: The defiant sinner (beyad rāmāh — with a raised hand, as if shaking a fist at God) commits a category of sin beyond sacrifice. This is not moral failure under pressure but deliberate, contemptuous rebellion. The NT equivalent is not every deliberate sin but the apostasy of one who knowingly and permanently rejects Christ (Heb 6:4–6; 10:26–29).'),
            ],
            'milgrom': [
                ('15:22–29', 'Milgrom: The distinction between communal unintentional sin (v.22–26) and individual unintentional sin (v.27–29) mirrors the sin offering gradations of Lev 4. The entire community sinning inadvertently requires a bull; the individual requires a yearling goat. The theological principle is consistent: inadvertent sin, at whatever scale, can be atoned; defiant sin cannot.'),
                ('15:38–40', 'Milgrom: The tassel command (ṣîṣit) places a visible covenant reminder on every garment. Each tassel has a blue thread (tĕkēlet) — the colour of the sanctuary — creating a portable reminder that the wearer belongs to the covenant community. The tassels are democratised sanctuary symbolism: the blue of the tabernacle worn by every Israelite.'),
            ],
            'ashley': [
                ('15:17–21', 'Ashley: The first-fruits contribution (reʾšît ʿărīsōtêkem — the first of your ground meal) extends the firstfruits principle of Lev 23 to every meal. The first portion of every batch of dough belongs to God. The covenant claim on the first is not just agricultural (firstfruits at harvest) but domestic (first portion at every baking). All of life is covenant territory.'),
            ],
            'sarna': [
                ('15:3', 'Sarna: "When you present to the Lord food offerings from the herd or the flock… to fulfil a special vow, or as a freewill offering" — the laws of ch.15 cover both the obligatory and the voluntary. The supplementary offerings (flour, oil, wine) accompanying sacrifices give every worshipper a means of expressing gratitude beyond the minimum required. Covenant worship has both floor and ceiling.'),
            ],
            'alter': [
                ('15:32–36', 'Alter: The Sabbath-breaker narrative — a man found gathering wood on the Sabbath, held in custody until Moses consults God, then stoned — is a disturbing case study. The act seems minor; the punishment is death. But the "high hand" category (defiant sin, vv.30–31) has just been defined: this man, like Nadab and Abihu, represents the category of deliberate covenant violation that cannot be covered by sacrifice.'),
            ],
            'calvin': [
                ('15:1–16', 'Calvin: The supplementary offering laws given immediately after the sentence of Num 14 demonstrate that divine judgment and divine grace coexist. The condemned generation hears new laws for the land they will never enter. God does not withdraw his instruction simply because the recipients have failed — the covenant continues, the instruction continues, for those who will come after.'),
            ],
            'netbible': [
                ('15:30', 'NET Note: "But anyone who sins defiantly (beyad rāmāh), whether native-born or foreigner, blasphemes the Lord and must be cut off from the people of Israel." The phrase beyad rāmāh is literally "with a raised hand" — the hand raised not in worship but in defiance. The posture describes attitude as much as action: the defiant sinner is not struggling against sin but shaking a fist at the God who commands.'),
            ],
        },
        {
            'header': 'Verses 32–41 — The Sabbath-Breaker; the Tassels Command',
            'verses': verse_range(32, 41),
            'heb': [
                ('ṣîṣit', 'tzitzit', 'tassel / fringe', 'The knotted fringes attached to the corners of garments — a portable covenant reminder. The blue (tĕkēlet) thread in each tassel connects the wearer to the sanctuary\'s colour, making every garment a miniature tabernacle reminder.'),
            ],
            'ctx': 'The tassels command (vv.37–41) closes ch.15 with a visual covenant aide-mémoire: four tassels (one on each corner of the outer garment), each with a blue thread, to be looked at and remembered. The stated purpose (v.39): "so you will remember all the commands of the Lord, that you may obey them and not prostitute yourselves by chasing after the lusts of your own hearts and eyes." The heart-and-eyes image captures the anthropology of sin: craving begins in the eyes, settles in the heart, and issues in unfaithfulness. The tassel is an embodied counter-habit: look at the blue thread, remember the commandment, resist the craving.',
            'cross': [
                ('Deut 22:12', '"Make tassels on the four corners of the cloak you wear." Deuteronomy\'s parallel command confirms the tassel practice as a covenant institution.'),
                ('Matt 9:20', '"A woman who had been subject to bleeding for twelve years came up behind him and touched the edge of his cloak." The edge (kraspedon) of Jesus\'s garment likely refers to the tassel (ṣîṣit) — the woman reaches for the covenant fringe of the one who perfectly keeps the covenant.'),
            ],
            'mac': [
                ('15:38–40', 'MacArthur: The tassel is a brilliant pedagogical device: it attaches the covenant obligation to the body. Every time an Israelite looks down at their garment, the blue tassel asks: are you keeping the commandments? The physical reminder serves the same function as sacraments in the NT — it makes the invisible covenant visible, the abstract obligation concrete.'),
            ],
            'milgrom': [
                ('15:39', 'Milgrom: "You will not prostitute yourselves by going after the lusts of your own hearts and eyes" — the tassels are specifically positioned as a counter to the visual craving that drives covenant unfaithfulness. The connection to the spy crisis is implicit: the spies saw the land through the eyes of fear; Israel is commanded to see through the eyes of the commandment.'),
            ],
            'ashley': [
                ('15:37–41', 'Ashley: The tassels chapter closes with the full Exodus motivation: "I am the Lord your God, who brought you out of Egypt." The tassel reminder is grounded in the covenant relationship established at the Exodus. The commandments are not arbitrary restrictions but the shape of life in covenant with the God who redeems.'),
            ],
            'sarna': [
                ('15:39', 'Sarna: The dual anthropology — "hearts and eyes" (lĕbaḇkem wĕʿênêkem) — anticipates the Shema\'s "heart, soul, and strength." Both heart (intention) and eye (perception) need covenant re-orientation. The tassels address the visual pathway to the heart: redirect what you look at, and the heart will follow.'),
            ],
            'alter': [
                ('15:40–41', 'Alter: The tassel section closes with the most comprehensive statement of the covenant\'s purpose: "be holy to your God… I am the Lord your God, who brought you out of Egypt to be your God." Three clauses moving from command (be holy) to identity (I am the Lord) to history (who brought you out). The tassel is small; the theology it embeds is total.'),
            ],
            'calvin': [
                ('15:37–41', 'Calvin: External signs have their proper place in the life of faith — not as replacements for internal devotion but as aids to it. The tassel is not magic; it does not automatically produce obedience. But it provides a repeated, embodied prompt for the mind and heart that Scripture consistently recommends. The NT sacraments serve the same purpose: visible, physical reminders of invisible, spiritual realities.'),
            ],
            'netbible': [
                ('15:38', 'NET Note: The blue thread (pĕtîl tĕkēlet) in the tassel is the same blue used for the tabernacle curtains and the high priest\'s garments (Exod 25:4; 28:6). The colour connects the ordinary Israelite\'s garment to the sanctuary — making every person a walking portable reminder of the covenant\'s sacred centre.'),
            ],
        },
    ],
})

num(16, {
    'title': 'Korah\'s Rebellion: The Danger of Priestly Ambition',
    'sections': [
        {
            'header': 'Verses 1–35 — Korah, Dathan, and Abiram; the Earth Opens',
            'verses': verse_range(1, 35),
            'heb': [
                ('kol-hāʿēdāh kullām qĕdōšîm', 'kol-ha\'eda kullam qedoshim', 'the whole community is holy — all of them', 'Korah\'s challenge reverses the Levitical holiness structure: if every Israelite is equally holy (Exod 19:6 — "a kingdom of priests"), then the special Aaronic priesthood is an unauthorized usurpation. The argument is theologically sophisticated — and fatally wrong.'),
                ('wattipptaḥ hāʾāreṣ ʾet-pîhā', 'wattiptach ha\'aretz et-piha', 'the earth opened its mouth', 'The earth swallowing Dathan and Abiram alive is one of the most dramatic divine judgments in the Torah. The normally passive earth becomes an active instrument of covenant justice.'),
            ],
            'ctx': 'Numbers 16 records the most serious leadership challenge in Israel\'s wilderness period. Korah (a Levite) joins with Dathan and Abiram (Reubenites) and 250 leaders to challenge Moses and Aaron: "You have gone too far! The whole community is holy, every one of them, and the Lord is with them. Why then do you set yourselves above the Lord\'s assembly?" The argument conflates two legitimate truths (all Israel is holy; all are equally before God) to reach a false conclusion (therefore the Aaronic priesthood is illegitimate). Moses\'s response is to refer the matter to God — let him decide who is holy. The test: everyone brings incense. Those whom God accepts are the ones he has chosen. Korah\'s 250 followers die by divine fire; Dathan and Abiram (who refused to come) are swallowed by the earth with their households.',
            'cross': [
                ('Jude 11', '"Woe to them! They have taken the way of Cain; they have rushed for profit into Balaam\'s error; they have been destroyed in Korah\'s rebellion." Jude uses Korah as the prototype of those who despise legitimate authority in the church.'),
                ('Heb 5:4', '"No one takes this honour on himself; he must be called by God, just as Aaron was." The priesthood is not a democratic institution — it derives from divine appointment, not popular assent. Korah\'s error is the error of treating spiritual authority as self-authorising.'),
            ],
            'mac': [
                ('16:1–3', 'MacArthur: Korah\'s challenge is the most sophisticated rebellion in Numbers — it uses the language of the covenant ("the whole community is holy") against the covenant\'s structure (Aaronic priesthood). The error is not in the premise (Israel is holy) but in the inference (therefore all priestly distinctions are human usurpation). God\'s holiness differentiations are not contradictions of covenant equality but expressions of covenant order.'),
                ('16:31–33', 'MacArthur: The earth swallowing Dathan and Abiram alive is judgment by inversion: those who challenged God\'s appointed order return to the earth from which they came. The normally passive creation becomes an active instrument of covenant justice — the same earth that receives the dead now takes the living who rebelled against the one who gives life.'),
            ],
            'milgrom': [
                ('16:3', 'Milgrom: Korah\'s argument — "the whole community is holy, every one of them" — is not theologically wrong in itself. But Milgrom identifies the fatal category error: Korah confuses the holiness of the covenant community (which is real) with the holiness of the priestly office (which is a distinct, divinely-appointed vocation). The priesthood\'s separateness does not contradict the community\'s holiness; it serves it.'),
                ('16:20–35', 'Milgrom: The dual judgment — fire for the 250 incense-burners, earthquake for Dathan and Abiram — distinguishes two aspects of the rebellion. The incense-burners usurped priestly prerogatives (offering incense); Dathan and Abiram challenged Moses\'s civil authority. The two categories of rebellion receive proportional and fitting judgments.'),
            ],
            'ashley': [
                ('16:1–35', 'Ashley: The Korah rebellion reveals that the greatest threats to covenant order come from within the covenant community — from those who know enough theology to frame their rebellion in theological terms. Korah does not argue against God; he argues using God\'s own language. This is the most dangerous form of covenant challenge: not external attack but internal subversion using the community\'s own vocabulary.'),
            ],
            'sarna': [
                ('16:12–14', 'Sarna: Dathan and Abiram\'s response to Moses\'s summons is a masterpiece of inversion: "We will not come! Isn\'t it enough that you have brought us up out of a land flowing with milk and honey to kill us in the wilderness? And now you also want to lord it over us!" They describe Egypt as a land flowing with milk and honey — the very phrase the Torah uses for Canaan. Their rebellion has completely inverted the covenant narrative.'),
            ],
            'alter': [
                ('16:28–30', 'Alter: Moses\'s test is a radical appeal to divine judgment: "If these men die a natural death… then the Lord has not sent me. But if the Lord brings about something totally new, and the earth opens its mouth and swallows them…" Moses stakes everything on a divine sign. His confidence is not arrogance but the bedrock certainty of one who has heard the divine voice directly.'),
            ],
            'calvin': [
                ('16:1–3', 'Calvin: Korah\'s argument — "all the community is holy" — is the perennial error of those who use a true principle to demolish necessary structure. The principle is sound (every believer is a priest, 1 Pet 2:9); the application is wrong (therefore no one can have special authority). The NT itself maintains both the universal priesthood and the distinct office of elders/pastors — Korah\'s error is not resolved by the NT but corrected by it.'),
            ],
            'netbible': [
                ('16:3', 'NET Note: "You have gone too far" (rab-lākem) — the same phrase Moses uses to rebuke Korah (v.7: "You Levites have gone too far!"). The verbal echo is deliberate: Moses turns Korah\'s accusation back on him. The one who charges "too much authority" is himself taking too much authority. The irony is the chapter\'s theological engine.'),
            ],
        },
        {
            'header': 'Verses 36–50 — The Bronze Censers; the Plague; Aaron\'s Intercession',
            'verses': verse_range(36, 50),
            'heb': [
                ('wayyaʿămod bên-hammētîm ûbên haḥayyîm', 'wayaamod bein-hameitim uvein hachayim', 'he stood between the dead and the living', 'Aaron\'s intercession in the plague — literally standing in the gap between the dying and the living with his censer of incense. The high-priestly action that stops a plague: not prayer from a distance but physical, intercessory presence in the boundary between death and life.'),
            ],
            'ctx': 'The aftermath of the rebellion has two parts: (1) the bronze censers of the 250 are hammered into a covering for the altar — a permanent warning (vv.36–40); (2) the next day, the entire community blames Moses and Aaron for killing "the Lord\'s people," a fresh plague begins, and Aaron literally runs with his censer to stand between the dying and the living (vv.41–50). The plague kills 14,700 before Aaron\'s intercession stops it. The episode confirms both the lesson of the rebellion (the Aaronic priesthood is divinely appointed) and the character of the Aaronic priest (he runs toward the plague, not away from it).',
            'cross': [
                ('Heb 7:25', '"He always lives to intercede for them." Aaron\'s physical intercession between the dead and living is the OT type of Christ\'s perpetual high-priestly intercession — standing between the dying and the living, always.'),
                ('Ezek 22:30', '"I looked for someone among them who would build up the wall and stand before me in the gap on behalf of the land so I would not have to destroy it." Ezekiel\'s "standing in the gap" imagery derives from Aaron\'s literal act in Num 16:48.'),
            ],
            'mac': [
                ('16:47–48', 'MacArthur: Aaron\'s running toward the plague is the definitive priestly act of the wilderness narrative. He does not pray from the edge; he physically enters the boundary between death and life. The censer of incense — the same instrument that killed Korah\'s followers (Lev 10:1–2) — is now the instrument of intercession. The same fire that judges also atones, in the hands of the properly ordained priest.'),
            ],
            'milgrom': [
                ('16:38–40', 'Milgrom: The hammering of the 250 bronze censers into an altar covering is a permanent memorial of two kinds: warning (do not usurp priestly prerogatives) and consecration (the censers touched the altar\'s fire and became holy). The very instruments of rebellion are repurposed as covenant markers. God transforms the evidence of judgment into a teaching monument.'),
            ],
            'ashley': [
                ('16:46–50', 'Ashley: The community\'s instant reversion to accusation the day after the Korah judgment ("You have killed the Lord\'s people") reveals the depth of the wilderness generation\'s spiritual blindness. They see the judgment on Korah\'s rebellion and interpret it as injustice rather than covenant faithfulness. Aaron\'s intercession is for a people who do not deserve it — the nature of all true priestly intercession.'),
            ],
            'sarna': [
                ('16:48', 'Sarna: "He stood between the dead and the living, and the plague stopped." The single Hebrew verb wayyaʿămod (he stood) carries the full weight of the priestly vocation: standing in the breach, maintaining the boundary between life and death, holding the covenant space open for the living. The priest is the one who stands.'),
            ],
            'alter': [
                ('16:47', 'Alter: "Aaron took it as Moses said and ran into the midst of the assembly; and behold, the plague had already begun among the people." The word "ran" (wayyārāts) — the priest runs toward the dying. The censer already burning, the incense already rising. Aaron does not hesitate. His willingness to stand between the dead and the living is the embodiment of the intercessory vocation.'),
            ],
            'calvin': [
                ('16:46–50', 'Calvin: Aaron\'s intercession with the burning censer models the nature of priestly mediation: entering the space of death with the fire of the altar. Christ, our high priest, entered death itself — not with a censer but in his own body — and by his resurrection stands between the dead and the living for all who are his.'),
            ],
            'netbible': [
                ('16:40', 'NET Note: "A reminder to the Israelites that no one except a descendant of Aaron should come to burn incense before the Lord" — the bronze-censer altar covering is a permanent architectural warning. Every Israelite who passes by the altar sees the reforged metal and is reminded: only Aaron\'s line. The architecture of the sanctuary is a theology lesson.'),
            ],
        },
    ],
})

num(17, {
    'title': 'Aaron\'s Staff Buds: The Levitical Priesthood Confirmed',
    'sections': [
        {
            'header': 'Verses 1–13 — The Twelve Staffs; Aaron\'s Staff Produces Almonds',
            'verses': verse_range(1, 13),
            'heb': [
                ('maṭṭeh', 'matteh', 'staff / rod / tribe', 'The same word for the tribal staff and the tribe itself — the leader\'s staff represents the tribe. Twelve staffs, one per tribe, placed before the ark overnight. The staff that produces life (buds, blossoms, almonds) designates the chosen priestly tribe.'),
                ('šāqēd', 'shaqed', 'almond / almond tree', 'The almond tree is one of the first to bloom in Israel — its name (šāqēd) shares a root with šāqad (to watch, to be alert). Aaron\'s blossoming staff is a sign of life, watchfulness, and divine attention. It produces not just blossoms but ripe almonds overnight — hyperbolically complete growth.'),
            ],
            'ctx': 'Numbers 17 provides the definitive divine confirmation of the Aaronic priesthood following Korah\'s challenge. Twelve staffs are collected — one per tribal leader, each labeled with the tribe\'s name. Aaron\'s name is written on the Levite staff. They are placed "before the Lord" (before the ark) overnight. In the morning, Aaron\'s staff has budded, blossomed, and produced ripe almonds — an entire growth cycle in a single night. The miracle settles the question: God has chosen Aaron. The staff is preserved inside the ark (v.10) as a permanent sign "against the rebels." The people\'s response (v.12–13) is despairing: "We will die! We are lost!"',
            'cross': [
                ('Heb 9:4', '"The gold-covered ark of the covenant… contained the gold jar of manna, Aaron\'s staff that had budded, and the stone tablets of the covenant." Aaron\'s staff in the ark is the NT\'s confirmation of this event — the miracle is permanently enshrined in Israel\'s most sacred object.'),
                ('John 15:5', '"I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit." The fruitfulness of Aaron\'s dead staff — brought to life by divine appointment — anticipates the resurrection-life that bears fruit when connected to Christ.'),
            ],
            'mac': [
                ('17:8', 'MacArthur: The triple growth — buds, blossoms, ripe almonds — in a single night is a miracle of compressed time. The almond tree normally takes months to move from bud to fruit; here the entire cycle occurs between evening and morning. God\'s vindication of Aaron is as unmistakably miraculous as the judgment on Korah was dramatically final.'),
                ('17:10', 'MacArthur: Placing Aaron\'s budded staff inside the ark alongside the manna and the tablets creates a three-part covenant testimony: the law (tablets — who God is and what he requires), the provision (manna — how God sustains), and the priesthood (staff — how God is approached). The ark holds the complete covenant theology.'),
            ],
            'milgrom': [
                ('17:5', 'Milgrom: "The man I choose — his staff will sprout, and I will rid myself of this constant grumbling against you, the Israelites." The sign is not merely for Israel\'s benefit but for God\'s vindication. The grumbling against Moses and Aaron is simultaneously grumbling against God\'s choice. The budded staff settles both the political and theological question.'),
                ('17:12–13', 'Milgrom: The people\'s response — "We will die! We are lost!" — reveals the unintended effect of God\'s vindication. The power of the priestly office, confirmed so dramatically, terrifies rather than comforts. They now understand that approaching God without proper mediation is lethal. The correct lesson from Korah and Aaron\'s staff is not despair but proper use of the priestly access God has provided.'),
            ],
            'ashley': [
                ('17:1–11', 'Ashley: The twelve-staff test is democratic in design: every tribe gets an equal chance, the same conditions, the same opportunity. The result is not imposed but demonstrated. God does not simply declare Aaron chosen — he shows it. The miracle is designed to be undeniable and memorable: the dead wood of Aaron\'s staff becomes living fruit overnight.'),
            ],
            'sarna': [
                ('17:2–3', 'Sarna: One staff per tribe — twelve staffs for twelve tribes, with Levi as one among them, no more and no less. The equality of the test is its genius: Aaron\'s tribe is not given a head start or special conditions. The miracle\'s power is that it occurs under perfectly equal experimental conditions.'),
            ],
            'alter': [
                ('17:8', 'Alter: "Behold, Aaron\'s staff, which belonged to the house of Levi, had sprouted and put forth buds and produced blossoms and it bore ripe almonds." The four-stage enumeration — sprouted, buds, blossoms, ripe almonds — lavishes detail on the miracle. The list is both biologically precise and liturgically excessive: God\'s vindication of Aaron is not minimally sufficient but extravagantly unmistakable.'),
            ],
            'calvin': [
                ('17:1–11', 'Calvin: The miracle of Aaron\'s staff teaches that spiritual authority must be divinely authenticated, not merely claimed. Neither seniority, popularity, nor theological argument is sufficient to establish priestly office. God must confirm it — and his confirmation is always unmistakable. The church\'s problem is not lack of leaders but confusion about which leaders God has genuinely called and gifted.'),
            ],
            'netbible': [
                ('17:10', 'NET Note: "Put back Aaron\'s staff in front of the testimony, to be kept as a sign against the rebellious." The term ʾôt (sign) places Aaron\'s staff in the category of covenant signs (rainbow, circumcision, Sabbath). The budded staff is not merely a historical curiosity but an ongoing covenant marker: the Aaronic priesthood is divinely ordained, permanently testified.'),
            ],
        },
        {
            'header': 'Verses 12–13 — The People\'s Response; the Staff Preserved',
            'verses': verse_range(12, 13),
            'heb': [
                ('gāwaʿnû ʾābadnû kullānû ʾābādnû', 'gavanu avadnu kullanu avadnu', 'we will die! we are lost! we are all lost!', 'Triple lament — the most despairing words in Numbers. After Aaron\'s staff confirms the priestly order, Israel\'s response is not relief but terror. They have finally grasped the lethal character of holiness, but without the comfort of the gospel that makes such holiness approachable.'),
            ],
            'ctx': 'The confirmation of Aaron\'s priesthood produces an unexpected crisis: rather than reassuring Israel, it terrifies them. "We will die! We are lost! We are all lost! Anyone who even comes near the tabernacle of the Lord will die. Are we all going to die?" (vv.12–13). The sign that was meant to end the grumbling has instead revealed how little Israel understands about the nature of holy approach. God\'s answer will come in Num 18: the priests and Levites bear the danger on Israel\'s behalf. Aaron\'s staff is preserved inside the ark — a permanent covenant sign against future rebellion.',
            'cross': [
                ('Heb 10:19–22', '"Therefore, brothers and sisters, since we have confidence to enter the Most Holy Place by the blood of Jesus… let us draw near to God." The terror of Num 17:12–13 — "we will all die near the tabernacle" — is answered in Hebrews: draw near with confidence, through Christ the high priest, whose blood grants access that Aaron\'s staff only pointed toward.'),
                ('Isa 6:5', '"Woe to me! I am ruined! For I am a man of unclean lips… and my eyes have seen the King, the Lord Almighty." Isaiah\'s response to the divine glory mirrors Israel\'s terror in Num 17 — the right response to holy presence is initially devastation, before the coal of grace is applied.'),
            ],
            'mac': [
                ('17:12–13', 'MacArthur: Israel\'s terror — "we will all die near the tabernacle" — is theologically correct but spiritually incomplete. They have understood the danger (God\'s holiness is lethal to the unprepared) but not yet the provision (God\'s priests bear that danger on their behalf). Num 18 is the answer to Num 17\'s question. The gap between holy terror and confident approach is bridged by the high-priestly mediator.'),
            ],
            'milgrom': [
                ('17:12–13', 'Milgrom: The people\'s threefold cry — gāwaʿnû, ʾābadnû, kullānû ʾābādnû — is the emotional climax of the Korah-Aaron sequence. The rebellion sequence (Num 16–17) has succeeded in its pedagogical purpose: Israel finally understands that the divine presence is not to be trifled with. But understanding the danger without the provision produces despair; Num 18 supplies the provision.'),
            ],
            'ashley': [
                ('17:12–13', 'Ashley: The preserved staff in the ark is a living contradiction: it sprouts in the presence of God, demonstrating divine appointment and life; yet the people\'s response to that same demonstration is a cry of expected death. The tension between the life-giving sign and the death-fearing response is resolved only by the priest who stands between — Aaron, whose staff bloomed, now bearing Israel\'s danger on their behalf (Num 18:1).'),
            ],
            'sarna': [
                ('17:10', 'Sarna: "Put back Aaron\'s staff in front of the testimony, to be kept as a sign against the rebels." The staff joins the manna (Exod 16:33–34) and eventually the tablets as objects preserved in or before the ark. Together they are Israel\'s covenant memorial objects: the law given (tablets), the provision sustained (manna), the priesthood confirmed (staff). The theology of the ark is complete.'),
            ],
            'alter': [
                ('17:12–13', 'Alter: The triple repetition — "we will die, we are lost, we are all lost" — creates a rhythm of despair that reverberates against the miracle of the budded staff. The same night that produced almonds from dead wood produced terror in the living community. The miracle and the despair are inseparable: genuine encounter with divine power always produces both wonder and fear.'),
            ],
            'calvin': [
                ('17:12–13', 'Calvin: Israel\'s despairing cry is the right response to the wrong question. They ask "will we die near the tabernacle?" when they should ask "how does God provide safe approach?" The law always generates this question; only the gospel answers it. The staff that blooms points forward to the resurrection of the one who will say: "I am the way. No one comes to the Father except through me."'),
            ],
            'netbible': [
                ('17:13', 'NET Note: The question "Are we all going to die?" (hăʾîm tamnû ligwōaʿ) anticipates Numbers 18:1\'s answer: no, because the priests and Levites bear the danger on your behalf. The structure of Num 17–18 is question (how do we survive proximity to the holy?) and answer (through the priestly mediators God has appointed). The chapter break should not obscure the direct theological dialogue.'),
            ],
        },
    ],
})

num(18, {
    'title': 'Priestly and Levitical Portions: Sustaining the Sacred Ministry',
    'sections': [
        {
            'header': 'Verses 1–20 — The Priests\' Responsibilities and Portions',
            'verses': verse_range(1, 20),
            'heb': [
                ('ʾattem tiśśĕʾû ʾet-ʿăwōn hammiqdāš', 'atem tis\'u et-avon hammiqdash', 'you shall bear the iniquity of the sanctuary', 'The priests\' responsibility is described as "bearing the iniquity" of the sanctuary — taking upon themselves the ritual impurity and inadvertent violations of the people. The priest bears what Israel cannot carry; the sacrificial system distributes this bearing across the ordained mediators.'),
                ('ʾēšer nātatî lĕkā lĕmošāl', 'asher natati lecha lemashala', 'everything given to me as most holy portion', 'The priestly portions are described as God\'s own gift — he gives to the priests what belongs to him. The priests eat from what God has received. Their sustenance is sanctified by its origin: the table of the priests is the overflow of the divine table.'),
            ],
            'ctx': 'Numbers 18 directly follows the people\'s terrified question of 17:12–13 ("Will everyone who comes near the tabernacle die?") with God\'s answer: the priests and Levites bear the danger on Israel\'s behalf. The chapter establishes the priestly/Levitical income: most holy portions (sin, guilt, grain offerings — priests only, eaten in the sanctuary), holy portions (first-born animals, first-fruits, devoted things — priest\'s household), and the Levitical tithe (one-tenth of all Israel\'s produce — their inheritance in place of land). The theological principle (v.20): "I am your share and your inheritance among the Israelites."',
            'cross': [
                ('1 Cor 9:13–14', '"Do you not know that those who work in the temple get their food from the temple…? In the same way, the Lord has commanded that those who preach the gospel should receive their living from the gospel." Paul directly applies the priestly portion principle of Num 18 to NT ministry support.'),
                ('Mal 3:10', '"Bring the whole tithe into the storehouse… Test me in this… and see if I will not throw open the floodgates of heaven." Malachi\'s call to faithful tithing grounds itself in the Num 18 tithe system.'),
            ],
            'mac': [
                ('18:1–7', 'MacArthur: "You and your sons and your father\'s family are to bear the responsibility for offenses connected with the sanctuary." The priests and Levites answer for the sanctuary\'s integrity — they are simultaneously privileged (closest access) and responsible (bearing the consequences of failure). The graduated holiness structure is also a graduated accountability structure.'),
                ('18:20', 'MacArthur: "I am your share and your inheritance among the Israelites." The priests receive no land — God himself is their portion. This is the highest form of covenant blessing: not a land, not a territory, not material wealth, but God himself as the inheritance. The NT equivalent: "Christ is all and is in all" (Col 3:11).'),
            ],
            'milgrom': [
                ('18:1', 'Milgrom: "You and your sons and your father\'s family are to bear the responsibility for offenses connected with the sanctuary." The Hebrew ʿāwōn (iniquity/responsibility) — the priests bear the guilt incurred by others\' unintentional violations of the sanctuary. This is substitutionary responsibility: Aaron and his sons absorb the covenant consequences of Israel\'s inadvertent trespasses, protecting the people from direct divine judgment.'),
                ('18:21–24', 'Milgrom: The Levitical tithe (every tenth of Israel\'s produce) substitutes for the Levites\' lack of land inheritance. Their "land" is the covenant community\'s generosity. Milgrom notes this creates a structural dependency of the Levites on Israel\'s faithfulness — and Israel\'s faithfulness on the Levites\' service. The two are mutually sustaining.'),
            ],
            'ashley': [
                ('18:8–20', 'Ashley: The elaborate listing of priestly portions — most holy, holy, first-born, devoted, first-fruits — reflects a careful economic theology. The sanctuary is not self-sustaining; it requires the community\'s tithes and offerings to function. God has built the economic provision for his servants into the covenant structure itself, not left it to voluntary giving.'),
            ],
            'sarna': [
                ('18:20', 'Sarna: "I am your share and your inheritance" (ʾănî ḥelqĕkā wĕnaḥalātĕkā) — the priests receive God himself as their inheritance in place of land. The phrase anticipates Psalm 16:5 ("You, Lord, are my chosen portion and my cup") and shapes the entire OT theology of God as the believer\'s ultimate inheritance, fulfilled in the NT\'s promise of God as all in all.'),
            ],
            'alter': [
                ('18:20', 'Alter: "I am your share and your inheritance" — four words in Hebrew (ʾănî ḥelqĕkā wĕnaḥalātĕkā). The compression is perfect. After the lists of portions, animals, tithes, and first-fruits, the chapter\'s theological peak arrives in a single sentence: the priests\' real inheritance is not food or silver but God himself. The material provisions are significant; this one verse transcends them.'),
            ],
            'calvin': [
                ('18:20', 'Calvin: "I am your share and your inheritance" is the most exalted statement of the priestly vocation in the Pentateuch. No land, no material estate — only God. This is the perfection of the covenant promise: not blessings from God but God himself. The NT saint who has learned to count everything loss compared to "gaining Christ" (Phil 3:8) has appropriated what Aaron\'s priesthood prefigured.'),
            ],
            'netbible': [
                ('18:19', 'NET Note: "It is an everlasting covenant of salt before the Lord for both you and your offspring." The salt covenant (bĕrît melaḥ) signals permanent, unconditional alliance — salt preserves and does not decay. The priestly portion covenant is not provisional; it is as permanent as salt, as enduring as the covenant itself.'),
            ],
        },
        {
            'header': 'Verses 21–32 — The Levitical Tithe; the Tithe of the Tithe',
            'verses': verse_range(21, 32),
            'heb': [
                ('maʿăśēr', 'ma\'aser', 'tithe / tenth', 'One-tenth of all Israel\'s agricultural produce goes to the Levites as their inheritance in lieu of land. The Levites in turn give one-tenth of their tithe to the priests — the tithe of the tithe. The cascade creates a system where every tenth belongs to God, then one-tenth of what the Levites receive goes further up the priestly hierarchy.'),
            ],
            'ctx': 'The Levitical tithe section (vv.21–32) specifies the tithe system in detail: all Israel gives one-tenth of produce and livestock to the Levites (vv.21–24); the Levites in turn give one-tenth of what they receive to the Aaronic priests (vv.25–32). The Levites are explicitly instructed (v.26): "When you receive from the Israelites the tithe I give you as your inheritance, you must present a tenth of that tithe as the Lord\'s offering." The principle is consistent: even those who receive from others\' tithes are themselves tithers. No one is exempt from the covenant obligation of first-fruits.',
            'cross': [
                ('Heb 7:9', '"One might even say that Levi, who collects the tenth, paid the tenth through Abraham, since when Melchizedek met Abraham, Levi was still in the body of his ancestor." The writer of Hebrews uses the tithe system of Num 18 to establish Melchizedek\'s (and Christ\'s) superiority to the Levitical order.'),
                ('2 Cor 9:7', '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion." Paul\'s cheerful-giving principle governs the spirit; the Num 18 tithe system governs the minimum structure.'),
            ],
            'mac': [
                ('18:25–29', 'MacArthur: The Levites are tithers — they give one-tenth of what they receive. This ensures that the principle of first-fruits dedication runs through every level of the covenant community. No one, not even those sustained by others\' giving, is exempt from the covenant obligation to give back to God. The cascade of tithes models the covenant principle: everything comes from God, everything returns to God.'),
            ],
            'milgrom': [
                ('18:28', 'Milgrom: "You must also present the Lord\'s offering from all your tithes." The Levites\' own tithe to the priests is called "the Lord\'s offering" (tĕrûmat yhwh) — the same designation used for Israel\'s tithe to the Levites. The cascade of giving is uniform in character: at every level, the tenth is the Lord\'s offering, not a human gift to humans.'),
            ],
            'ashley': [
                ('18:21–32', 'Ashley: The tithe-of-the-tithe system creates a covenant economy of graduated generosity. Israel gives to the Levites; the Levites give to the priests; the priests are sustained by God. The direction is always upward — toward God — even as the material goods flow across the community. The tithe system is a participation in the economy of heaven.'),
            ],
            'sarna': [
                ('18:21', 'Sarna: "I give to the Levites all the tithes in Israel as their inheritance in return for the work they do while serving at the tent of meeting." The tithe is not a charitable gift to the Levites but a covenantally mandated salary — payment for professional sacred service. The Levites\' work is real work deserving real compensation.'),
            ],
            'alter': [
                ('18:30–32', 'Alter: The closing assurance — "you will incur no sin by reason of it when you have presented the best part of it" — frames the entire tithe system as a matter of covenant integrity. Pay what is owed; present the best; incur no guilt. The tithe clears the conscience of the Levite and the Israelite alike: generosity fulfils, not burdens.'),
            ],
            'calvin': [
                ('18:21–32', 'Calvin: The tithe system\'s extension to the Levites themselves — they tithe from their own tithes — establishes the universal character of covenant giving. No one is too poor, no one is sustained by others\' generosity, no one is close enough to God to be exempt from returning a portion to him. The NT equivalent: "Each one must give as he has decided in his heart" — the spirit of the tithe survives its specific Levitical form.'),
            ],
            'netbible': [
                ('18:26', 'NET Note: "When you receive from the Israelites the tithe… you must present a tenth of that tithe as the Lord\'s offering." The Levites\' tithe to the priests constitutes approximately 1% of all Israel\'s produce (10% of the 10% tithe). The Aaronic priesthood is sustained by the concentrated tithe — small numerically but drawn from the entire covenant community\'s contribution.'),
            ],
        },
    ],
})

num(19, {
    'title': 'The Red Heifer: Purification from the Impurity of Death',
    'sections': [
        {
            'header': 'Verses 1–13 — The Red Heifer Ritual',
            'verses': verse_range(1, 13),
            'heb': [
                ('pārāh ʾădummāh', 'parah adummah', 'red heifer / red cow', 'A perfectly red, unblemished cow that has never been yoked — set apart from all agricultural use for this single sacred purpose. Its colour (red = the colour of blood and death) and its perfect condition (without defect, never yoked) mark it as a unique sacrificial animal for the unique category of corpse-impurity.'),
                ('ḥuqqat hattôrāh', 'chuqqat hatorah', 'statute of the law / a permanent ordinance', 'The red heifer rite is called a ḥuqqāh (permanent statute) — one of the ḥuqqîm (statutes) for which no reason is given. The Talmud notes this is one of the Torah\'s most puzzling laws: the ashes that purify the impure simultaneously make the priest who uses them impure. The paradox is deliberate.'),
            ],
            'ctx': 'Numbers 19 is the Torah\'s most theologically mysterious chapter. A red heifer without defect, never yoked, is slaughtered outside the camp, burned entirely (with cedar wood, hyssop, and scarlet yarn), and its ashes mixed with water to create "water of cleansing" for corpse-impurity. The paradox: the ashes that purify the corpse-contaminated person make the priest who prepares and applies the water impure until evening. The pure becomes impure while making the impure pure. This ḥuqqāh (statute beyond rational explanation) models the principle of substitutionary purification — the one who purifies takes on the impurity they remove. The Mishnah asks why; the Torah does not answer.',
            'cross': [
                ('Heb 9:13–14', '"The blood of goats and bulls and the ashes of a heifer sprinkled on those who are ceremonially unclean sanctify them so that they are outwardly clean. How much more, then, will the blood of Christ, who through the eternal Spirit offered himself unblemished to God, cleanse our consciences from acts that lead to death."'),
                ('1 Pet 1:19', '"The precious blood of Christ, a lamb without blemish or defect." The "without defect, never yoked" requirements of the red heifer are fulfilled in Christ — the unblemished one who had never been subjected to the yoke of sin.'),
            ],
            'mac': [
                ('19:1–10', 'MacArthur: The red heifer\'s unique features — red colour, no defect, never yoked, slaughtered outside the camp, burned entirely — mark it as a sacrifice unlike any other. It is not brought to the tabernacle but removed from the camp entirely. The impurity it addresses (death) is so profound that the normal sacrificial system cannot contain the purification rite. Death requires a purification of extraordinary character.'),
                ('19:11–13', 'MacArthur: Seven-day impurity for corpse contact, with washing on days 3 and 7 — the most extended purification process in Levitical law. Death\'s defilement is not quickly or easily removed. The prolonged purification process embodies the theological weight of mortality in the covenant\'s worldview: death is the enemy, not merely a natural transition.'),
            ],
            'milgrom': [
                ('19:2', 'Milgrom: The red heifer\'s paradox — it purifies the impure and impurifies the pure — is one of Milgrom\'s most extended discussions. His analysis: the ashes are a concentrated impurity-absorber; contact with them transfers the absorbed impurity to anyone who handles them. The priest who purifies others absorbs the impurity they remove. This is the mechanism of substitutionary purification: the purifier bears what the purified releases.'),
                ('19:9', 'Milgrom: The ashes are stored "outside the camp in a ceremonially clean place" — the cleanest location outside the camp\'s sacred centre. The concentrated purity-producing substance must be kept in its own category: too powerful for the ordinary camp, too sacred for the unclean margins. It occupies a unique spatial status between the holy and the common.'),
            ],
            'ashley': [
                ('19:1–10', 'Ashley: The red heifer ritual addresses the most pressing practical concern in a community where people die: how does Israel maintain a covenant community around a holy God when death is inevitable and death creates the most severe ritual impurity? The red heifer is God\'s pastoral provision for unavoidable mortality in a covenant context. It does not make death holy — it provides a path through death\'s defilement back to covenant life.'),
            ],
            'sarna': [
                ('19:2', 'Sarna: "A red heifer without defect or blemish and that has never been under a yoke" — the three requirements (red, perfect, unyoked) create a uniquely set-apart animal. The unyoked requirement means this animal has never served any human purpose; it has been preserved for this single divine use. Its entire existence has been a consecration.'),
            ],
            'alter': [
                ('19:11–13', 'Alter: The red heifer rite is the Levitical purity system at its most demanding and its most theologically resonant. The seven-day impurity, the required sprinkling on days 3 and 7 (mirroring the consecration period of Lev 8), the kārēt penalty for neglecting purification — all reflect the seriousness with which the priestly tradition treats death\'s defilement of the covenant community.'),
            ],
            'calvin': [
                ('19:1–13', 'Calvin: The red heifer\'s paradox — purifying the impure at the cost of making the purifier impure — is the clearest OT symbol of Christ\'s atoning work. He who knew no sin became sin for us; the pure one took on our impurity to purify us. The ḥuqqāh (statute without stated reason) is the closest the Torah comes to describing what the NT calls "the mystery of our faith."'),
            ],
            'netbible': [
                ('19:9', 'NET Note: "The water of cleansing" (mê niddāh) — literally "waters of impurity/separation," though they function to remove impurity. The paradoxical name captures the paradoxical nature of the rite: impurity-waters that remove impurity. The language is deliberately provocative, signalling that this rite operates in a theological register beyond ordinary purity logic.'),
            ],
        },
        {
            'header': 'Verses 14–22 — Application: Corpse-Impurity in Tents and Open Country',
            'verses': verse_range(14, 22),
            'heb': [
                ('ʾōhel', 'ohel', 'tent', 'The primary unit of Israelite habitation. When someone dies in a tent, the tent and everything in it becomes impure for seven days — the enclosed space amplifies the spread of corpse-impurity. The open-field rules (v.16) apply less severe spreading logic.'),
            ],
            'ctx': 'The application rules (vv.14–22) specify how corpse-impurity spreads and how the red heifer water is applied. Death in a tent makes the tent and all its contents impure; touching a human bone, a corpse, a grave, or someone slain in open country creates seven-day impurity. The purification ritual: a clean person takes hyssop, dips it in the water, and sprinkles the unclean person on days 3 and 7. After washing on day 7, the person is clean by evening. The closing paradox is restated: the person who sprinkles the water becomes impure until evening; anything the unclean person touches before purification becomes impure.',
            'cross': [
                ('Ps 51:7', '"Cleanse me with hyssop, and I will be clean; wash me, and I will be whiter than snow." David\'s prayer uses the red heifer purification imagery — the hyssop sprinkling of Num 19:18 becomes the metaphor for moral cleansing.'),
                ('John 19:29', '"A jar of wine vinegar was there, so they soaked a sponge in it, put the sponge on a stalk of the hyssop plant, and lifted it to Jesus\' lips." The hyssop at the crucifixion connects to the Passover (Exod 12:22) and the red heifer purification — Christ is the one being purified by his own death, purifying all who touch him.'),
            ],
            'mac': [
                ('19:14–16', 'MacArthur: The tent-rule is the most extensive impurity-spreading mechanism in Levitical law: every person, every open container, everything in the tent where someone died becomes impure for seven days. Death\'s defilement is comprehensive — it saturates the dwelling space. The scale of the purification required matches the scale of the defilement caused.'),
                ('19:20–22', 'MacArthur: The kārēt penalty for neglecting red heifer purification is the most severe consequence in the purity system — reserved for deliberate contempt of the purification provision. The person who treats death\'s defilement casually "defiles the Lord\'s tabernacle." Casual approach to the holy is as dangerous as active rebellion.'),
            ],
            'milgrom': [
                ('19:14–16', 'Milgrom: The tent rule creates what Milgrom calls a "corpse-cloud" — death defiles the enclosed airspace of a tent. The spatial logic of impurity spreading is consistent with the priestly worldview: holiness and impurity are dynamic, spatial forces that move through physical environments. The red heifer water is the only remedy for this most severe form of defilement.'),
            ],
            'ashley': [
                ('19:14–22', 'Ashley: The application rules acknowledge that death is unavoidable in a human community — people will die in tents, bones will be encountered in fields. The red heifer provision is not for an ideal community where death never occurs but for a real community where it constantly does. The pastoral genius of Num 19 is its realistic engagement with human mortality within a covenant framework.'),
            ],
            'sarna': [
                ('19:18', 'Sarna: The hyssop branch (ʾēzôb) appears throughout the purification system — Passover (Exod 12:22), Levitical skin disease purification (Lev 14:4–6), and here. Its association with cleansing is so strong that it becomes the standard metaphor for purification in the Psalms (Ps 51:7). The humble hyssop plant is the covenant\'s instrument of cleansing.'),
            ],
            'alter': [
                ('19:20–22', 'Alter: The closing restatement of the purification-impurity paradox — the one who sprinkles becomes impure; the sprinkled becomes clean — frames the entire chapter with its central mystery. The chapter begins with the paradox (the preparer becomes impure) and ends with it (the applier becomes impure). The red heifer law is defined by this theological inversion: the one who mediates purification bears its cost.'),
            ],
            'calvin': [
                ('19:14–22', 'Calvin: The spreading of corpse-impurity through tent and open country models the total effect of death\'s corruption on human existence — nothing touched by mortality is entirely clean. The red heifer water, sprinkled precisely with hyssop on precise days, is the covenant\'s provision for living with this reality. Christ is the ultimate red heifer: his death, outside the city (cf. Heb 13:12), produces the water that cleanses all who are sprinkled with his blood.'),
            ],
            'netbible': [
                ('19:18', 'NET Note: "A clean person shall take hyssop, dip it in the water, and sprinkle the tent and all the furnishings and the persons who were there, and also the one who touched a bone, a corpse, a grave, or a person who had been killed." The clean person\'s act of sprinkling transfers impurity to themselves while removing it from others. This substitutionary mechanism — taking on impurity to remove it — is the theological heart of the red heifer rite.'),
            ],
        },
    ],
})

print("NUM-4 complete: Numbers 15–19 built.")

# ─────────────────────────────────────────────────────────────────────────────
# NUM-5: Chapters 20–25 — Water from Rock; Bronze Serpent; Balaam; Baal Peor
# ─────────────────────────────────────────────────────────────────────────────

num(20, {
    'title': 'The Waters of Meribah: Moses’s Failure at the Threshold',
    'sections': [
        {
            'header': 'Verses 1–13 — Miriam Dies; Water from the Rock; Moses’s Sin',
            'verses': verse_range(1, 13),
            'heb': [
                ('ṣar', 'tzar', 'adversity / distress / trouble', 'The communal distress that drives Israel to assemble against Moses and Aaron. The same word used for the Egyptian oppression. Israel has traded Egyptian slavery for wilderness hardship and perceives no difference.'),
                ('yakol’ti lāṟekem', "yakol'ti lahem", 'to bring out water for them', 'God’s command to Moses: speak to the rock. The contrast with Exod 17 is significant — there God commanded Moses to strike the rock; here he commands speech. Moses strikes twice instead. The failure is one of disobedience in method, not in faith in God’s provision.'),
            ],
            'ctx': 'Numbers 20 is one of the Torah’s most theologically dense chapters. Three events in rapid succession: Miriam’s death (v.1 — two words in Hebrew, no mourning recorded), the water crisis at Kadesh (vv.2–13), and Aaron’s death at Mount Hor (vv.22–29). The water crisis produces Moses’s sin — he strikes the rock twice and says "Must we bring you water?" (v.10), taking credit for God’s provision. God’s verdict: "Because you did not trust me enough to honour me as holy in the sight of the Israelites, you will not bring this community into the land." The greatest leader in Israel’s history is disqualified from the promised land for one act of public unbelief. The place is named Meribah — "quarrelling."',
            'cross': [
                ('Heb 3:16–4:2', '"Who were they who heard and rebelled? Were they not all those Moses led out of Egypt?" Moses’s disqualification and the generation’s disqualification share the same root: unbelief that dishonours God’s holiness at the critical moment.'),
                ('1 Cor 10:4', '"They drank from the spiritual rock that accompanied them, and that rock was Christ." Paul identifies the water-giving rock as a type of Christ — the one struck for Israel’s sake whose provision follows them through the wilderness.'),
                ('Ps 106:32–33', '"By the waters of Meribah they angered the Lord, and trouble came to Moses because of them; for they rebelled against the Spirit of God, and rash words came from Moses’ lips."'),
            ],
            'mac': [
                ('20:10–11', 'MacArthur: Moses’s sin has three components: striking instead of speaking (disobedience of method), striking twice (suggesting anger or lack of trust), and saying "Must we bring you water?" (attributing the miracle to himself and Aaron rather than to God). Any one alone might not have been disqualifying; together they constitute a public failure to honour God as holy before the congregation.'),
                ('20:12', 'MacArthur: "Because you did not trust me enough to honour me as holy" — the verdict reveals that Moses’s sin was fundamentally about the representation of God’s character. Moses is Israel’s representative before God; when he misrepresents God’s holiness publicly, the consequences must be proportional to the public nature of the office.'),
            ],
            'milgrom': [
                ('20:2–13', 'Milgrom: The rabbis debated exactly what Moses’s sin was — striking instead of speaking, striking twice, losing his temper, or saying "we." Milgrom’s analysis: the sin was the failure to "sanctify" (qiddash) God — the same root as "holiness." Moses’s public role required public sanctification of God’s name; his angry, self-referential action desanctified it instead.'),
                ('20:13', 'Milgrom: The name Meribah ("quarrelling") recurs throughout the OT as a memorial of covenant failure at the threshold of fulfilment. The site becomes a theological shorthand: the place where Israel quarrelled with God and where even Moses stumbled — a permanent reminder that no human leader is above covenant accountability.'),
            ],
            'ashley': [
                ('20:1– 3', 'Ashley: The juxtaposition of Miriam’s death (v.1) with the immediate water crisis (v.2) is theologically stark. The greatest woman in Israel’s history dies without recorded mourning, and the community’s first response is complaint. The wilderness generation has not changed; they are still the people who cannot receive God’s servants’ deaths without making them about themselves.'),
            ],
            'sarna': [
                ('20:10', 'Sarna: "Must we bring you water out of this rock?" — the use of "we" (Moses and Aaron) rather than "he" (God) is the crux of the transgression. Moses has inserted himself as the agent of the miracle rather than God. The representative of God before Israel has represented himself instead.'),
            ],
            'alter': [
                ('20:10–11', 'Alter: Two verbs — "he raised his arm and struck the rock twice" — carry the weight of the greatest failure in the Torah. The twice-striking is an act of frustrated repetition, the gesture of a man who has lost his composure and his theological clarity simultaneously. Water flows nonetheless: God’s provision survives Moses’s failure, but Moses does not survive its consequences.'),
            ],
            'calvin': [
                ('20:12', 'Calvin: Moses’s disqualification teaches that proximity to God intensifies rather than reduces accountability. Those who have seen God most clearly are most responsible for representing him accurately. The higher the office, the more costly the public failure. This principle governs ministerial accountability in every age: those who speak for God bear the greatest responsibility for how they do so.'),
            ],
            'netbible': [
                ('20:8', 'NET Note: "Speak to that rock" — the difference between the Exod 17 command (strike, Exod 17:6) and this command (speak) may signal an escalation in the covenant relationship: what required force in the early wilderness period now requires only word. Moses’s regression to striking is a failure to grow with the covenant.'),
            ],
        },
        {
            'header': 'Verses 14–29 — Edom’s Refusal; Aaron’s Death',
            'verses': verse_range(14, 29),
            'heb': [
                ('ʾl-tiqraʾ ʾlēnû', "al-tiqra elenu", 'do not come against us', 'Edom’s refusal to grant passage — a family betrayal. Edom is Israel’s brother (Esau’s descendants); their refusal to help their kin in the wilderness is a covenant of kinship broken, a theme the prophets will return to repeatedly (Amos 1:11; Obad 10–14).'),
            ],
            'ctx': 'Israel requests permission to pass through Edom on the King’s Highway. Moses’s message to Edom (vv.14–17) is a masterpiece of diplomatic humility: "your brother Israel," a summary of the Egyptian suffering, a promise not to use fields or water, an offer to pay for anything consumed. Edom refuses, threatens with the sword, and Israel turns away. Then Aaron dies on Mount Hor — stripped of his priestly garments, which are transferred to Eleazar his son. Aaron dies clothed in his office’s absence; Eleazar inherits the office stripped from his father. The chapter ends in mourning: "the whole house of Israel mourned for Aaron thirty days."',
            'cross': [
                ('Obad 10–14', '"Because of the violence against your brother Jacob, you will be covered with shame; you will be destroyed forever." Obadiah’s prophecy against Edom directly addresses the Num 20 refusal and its generational consequences.'),
                ('Heb 7:23–24', '"Now there have been many of those priests, since death prevented them from continuing in office; but because Jesus lives forever, he has a permanent priesthood." The transfer from Aaron to Eleazar (death preventing continuation) is the type of the contrast with Christ’s permanent priesthood.'),
            ],
            'mac': [
                ('20:28–29', 'MacArthur: The stripping of Aaron’s priestly garments on Mount Hor and their transfer to Eleazar is the most solemn succession ceremony in the Torah. Aaron does not simply hand over his vestments — Moses removes them and places them on Eleazar in Aaron’s presence and before Aaron’s death. Aaron dies seeing his son clothed in his office. The priestly line continues; the individual gives way.'),
            ],
            'milgrom': [
                ('20:22–29', 'Milgrom: Aaron’s death on Mount Hor, with the explicit transfer of garments to Eleazar, ensures the unbroken continuity of the Aaronic priesthood. Milgrom notes that the vestment-transfer ceremony is the priestly equivalent of the succession narratives for civil leadership — the office is not buried with the man but transferred to the next generation.'),
            ],
            'ashley': [
                ('20:14–21', 'Ashley: Edom’s refusal demonstrates that the promised land journey will not be simply a march. Every negotiation, every detour around hostile kin, every refusal adds to the wilderness formation of Israel. The long way around Edom is not a detour from God’s plan but part of it.'),
            ],
            'sarna': [
                ('20:14', 'Sarna: "Your brother Israel" — Moses appeals to the Esau-Jacob kinship as the basis for diplomatic courtesy. The appeal to brotherhood is both genuine (Edom and Israel are descended from twin brothers) and tactically shrewd. That Edom refuses even this appeal is a measure of how completely the fraternal covenant has been broken.'),
            ],
            'alter': [
                ('20:29', 'Alter: "When the whole Israelite community learned that Aaron had died, all the Israelites mourned for him thirty days." Thirty days — the same period of mourning prescribed for Moses (Deut 34:8). Aaron, the priest of the golden calf, the one who challenged Moses’s authority, the one who lost two sons to divine fire — is mourned by all Israel for a month. The covenant community’s grief for their high priest is unqualified.'),
            ],
            'calvin': [
                ('20:22–29', 'Calvin: Aaron’s death on Mount Hor, transferred from his garments to his son, models the principle that priestly office outlives any individual officiant. The vestments are not buried; they are transferred. The church’s ministry is not dependent on any one person’s continuation; it is carried by the office, which belongs to God and is given to successors in each generation.'),
            ],
            'netbible': [
                ('20:28', 'NET Note: "Moses removed Aaron’s garments and put them on his son Eleazar" — the investiture sequence mirrors the original ordination of Lev 8. Moses is again the officiating agent, as he was at Aaron’s original ordination. The symmetry is deliberate: the one who installed Aaron removes his vestments; the priestly succession is bookended by Moses.'),
            ],
        },
    ],
})

num(21, {
    'title': 'The Bronze Serpent: Judgment, Petition, and the Look of Faith',
    'sections': [
        {
            'header': 'Verses 1–9 — Arad Defeated; the Bronze Serpent',
            'verses': verse_range(1, 9),
            'heb': [
                ('nehāš haqqĕdōšim', 'nachash haqedoshim', 'the fiery serpents / the burning serpents', 'From šārap (to burn) — the serpents’ bites cause burning. The same root gives us seraphim (the burning ones of Isa 6). The judgment instrument is serpentine fire — the wilderness becomes a place of fiery death for those who speak against God.'),
                ('nĕšet', 'nechoshet', 'bronze / copper', 'The bronze serpent (nēšet nehāš — a Hebrew wordplay) is made from the same material as the altar of burnt offering. Looking at the bronze serpent does not cure the bite physiologically; it is an act of faith directed toward the divine provision.'),
            ],
            'ctx': 'Numbers 21 records Israel’s most direct engagement with judgment and the look of faith. The Canaanite king of Arad attacks and takes captives; Israel vows total destruction (ḥerem) if God gives them victory — and wins (vv.1–3). Then Israel complains again — against God and against Moses, about the lack of water and food, calling the manna "miserable food." God sends fiery serpents; many die. The people confess, Moses intercedes, God commands: make a bronze serpent and mount it on a pole. Anyone bitten who looks at it lives. The mechanism is faith — not medicine but directed trust. The chapter closes with the march to the plains of Moab, defeating Sihon and Og.',
            'cross': [
                ('John 3:14–15', '"Just as Moses lifted up the snake in the wilderness, so the Son of Man must be lifted up, that everyone who believes may have eternal life in him." Jesus applies the bronze serpent directly to his crucifixion — the look of faith toward the lifted serpent is the type of faith in the crucified Christ.'),
                ('2 Kgs 18:4', '"He removed the high places, smashed the sacred stones and cut down the Asherah poles. He broke into pieces the bronze snake Moses had made, for up to that time the Israelites had been burning incense to it." Hezekiah destroys the Nehushtan when it becomes an idol — the instrument of faith corrupted into an object of worship.'),
            ],
            'mac': [
                ('21:6–9', 'MacArthur: The bronze serpent is one of the most theologically instructive episodes in the wilderness narrative. God uses the very instrument of judgment (the serpent form) as the instrument of salvation — the judging thing becomes the saving thing when lifted up and looked at in faith. Jesus applies this directly: he who bore our sin-curse ("became a curse for us," Gal 3:13) is simultaneously the instrument of our salvation when we look to him in faith.'),
                ('21:8–9', 'MacArthur: "Anyone who is bitten can look at it and live" — the provision is universal and uncomplicated. No elaborate ritual, no payment, no special qualification — only look. The simplicity of the provision is the point. Salvation by looking — the act of desperate, faith-directed attention toward the divine provision — is the OT type of justification by faith alone.'),
            ],
            'milgrom': [
                ('21:4–9', 'Milgrom: The bronze serpent episode is unique in the wilderness narratives: this is the only instance where God provides a material object as the instrument of healing rather than a direct divine act. The object mediates the divine power; the faith-act (looking) activates the mediation. Milgrom notes this anticipates the theological structure of the tabernacle itself — material objects mediating the divine presence to the community.'),
            ],
            'ashley': [
                ('21:8–9', 'Ashley: The bronze serpent is not magic — the healing comes from God, not from the metal. The serpent is a faith-object: it directs the bitten person’s attention toward the God who provides. The act of looking is the act of trust. This is the theological logic Jesus applies in John 3:14–15: looking to the lifted Christ is looking to the God who provides salvation through the instrument of judgment.'),
            ],
            'sarna': [
                ('21:9', 'Sarna: "Moses made a bronze snake and put it up on a pole. Then when anyone was bitten by a snake and looked at the bronze snake, they lived." The four-beat sequence — made, put up, bitten, looked, lived — is compressed to its essentials. The narrative efficiency is the theological precision: the mechanism is simple, the provision immediate, the condition singular.'),
            ],
            'alter': [
                ('21:8', 'Alter: "Make a fiery serpent and set it on a standard, and it will be that everyone who is bitten — when he looks at it he will live." The divine instruction reverses the normal logic: the serpent that kills becomes the serpent that heals; the instrument of divine anger becomes the instrument of divine mercy. The reversal is the signature of grace throughout the biblical narrative.'),
            ],
            'calvin': [
                ('21:8–9', 'Calvin: The bronze serpent is one of the clearest OT types of Christ because Jesus himself interprets it. The looked-at serpent = the lifted Christ; the venomous bite = the mortal wound of sin; looking = faith. Calvin notes that the look required nothing of the bitten person except turning their eyes toward what God had provided. Salvation is entirely divine initiative; faith is the human reception of that initiative, not a contribution to it.'),
            ],
            'netbible': [
                ('21:8', 'NET Note: "Make a fiery snake" — the image of a serpent mounted on a pole has ANE parallels: bronze serpents on poles appear in Egyptian and Canaanite contexts as symbols of healing and divine power. God uses a culturally legible symbol and fills it with covenant content, redirecting the common ANE healing-serpent image toward trust in YHWH alone.'),
            ],
        },
        {
            'header': 'Verses 10–35 — The March to Moab; Sihon and Og Defeated',
            'verses': verse_range(10, 35),
            'heb': [
                ('bēʾēr', 'be\'er', 'well / cistern', 'The well at which God commands "Gather the people together and I will give them water" (v.16) — followed immediately by Israel’s well-song ("Spring up, O well!"). After Meribah’s failure, a well is given with a song. The wilderness journey is not uniform suffering; it contains genuine moments of provision and joy.'),
            ],
            'ctx': 'The march itinerary (vv.10–20) moves Israel from the Red Sea route toward Moab. The well-song (vv.17–18) is one of Numbers’ few lyric passages — Israel singing to the water, the leaders digging, the nobles providing. Then two decisive military victories: Sihon king of the Amorites refuses passage (unlike Edom, Sihon attacks) and is defeated; Og king of Bashan is defeated. These victories east of the Jordan give Israel a foothold that will serve as the base for the Canaan crossing. The conquest has begun.',
            'cross': [
                ('Deut 2:24–37', 'Moses’s retrospective account of the Sihon victory emphasises that God hardened Sihon’s spirit to refuse — his military aggression was divinely ordered to give Israel both land and confidence before the Jordan crossing.'),
                ('Ps 135:11', '"Sihon king of the Amorites and Og king of Bashan and all the kings of Canaan" — the Sihon and Og victories become a standard element of Israel’s praise liturgy, rehearsed as evidence of YHWH’s military faithfulness.'),
            ],
            'mac': [
                ('21:21–25', 'MacArthur: Sihon’s refusal to grant passage triggers his destruction — unlike Edom (which Israel circumnavigated), Sihon attacks and forfeits his territory. The contrast is instructive: Edom’s refusal was hostile but not aggressive; Sihon’s refusal became invasion. God permits Israel to suffer some rebuffs (Edom) while using others as occasions for the conquest’s beginning (Sihon, Og).'),
            ],
            'milgrom': [
                ('21:17–18', 'Milgrom: The well-song is the wilderness narrative’s most joyful passage — Israel singing to the water, the leaders and nobles cooperating to provide it. The song’s context (after the bronze serpent healing and before the military victories) places it at a moment of renewed covenant confidence. The same people who complained about water at Meribah now sing to the well that God gives them.'),
            ],
            'ashley': [
                ('21:33–35', 'Ashley: The defeat of Og king of Bashan — a giant (Deut 3:11, his iron bed measured 9 cubits) — continues the pattern of God defeating what Israel fears most. The spy report’s grasshopper complex (Num 13) is systematically dismantled: first Sihon (Amorite king), then Og (the giant). By the time Israel reaches the Jordan, the generation who said "we cannot" has been replaced by a generation that has watched God defeat the very enemies their parents feared.'),
            ],
            'sarna': [
                ('21:27–30', 'Sarna: The taunt-song against Sihon (vv.27–30) is an ancient poem quoted in Numbers as evidence of Sihon’s own military prowess — the Amorites themselves boasted of their victory over Moab. That Israel defeats the very people who wrote the victory poem demonstrates that Israel’s God is greater than the military achievements the Amorites celebrated.'),
            ],
            'alter': [
                ('21:17–18', 'Alter: "Spring up, O well! Sing to it!" — Israel singing to the water, the leaders digging with their staffs. The song is brief, ecstatic, communal. After chapters of complaint, murmuring, and plague, the wilderness community sings. The well-song is Numbers’ most spontaneous moment of worship — unordered, unstructured, arising directly from the experience of provision.'),
            ],
            'calvin': [
                ('21:21–35', 'Calvin: The military victories over Sihon and Og are the first fruits of the conquest — and they come to the new generation, not the old. The people who received the forty-year sentence have died; their children fight. The covenant promise is not cancelled by one generation’s failure; it is delayed and transferred. God’s faithfulness outlasts human unfaithfulness.'),
            ],
            'netbible': [
                ('21:14', 'NET Note: "The Book of the Wars of the Lord" — a reference to an ancient Israelite anthology of war poetry, now lost, that apparently recorded early Israelite military victories. Its citation here suggests the compiler of Numbers had access to a wider body of Israelite historical literature. The Torah is not the only ancient Israelite document; it cites others.'),
            ],
        },
    ],
})

num(22, {
    'title': 'Balak Summons Balaam: The Prophet Who Cannot Curse What God Has Blessed',
    'sections': [
        {
            'header': 'Verses 1–35 — Balak’s Embassy; the Donkey and the Angel',
            'verses': verse_range(1, 35),
            'heb': [
                ('bārak', 'barak', 'to bless', 'The root of Balaam’s dilemma: God has blessed Israel (bārak) and Balaam cannot curse (qābab) what God has blessed. The entire Balaam narrative turns on the immovability of the divine blessing — Balak’s money cannot purchase a reversal of what God has established.'),
                ('’ātōn', 'aton', 'female donkey / she-donkey', 'The donkey who sees the angel of the Lord and speaks is one of the Torah’s most memorable narrative devices. The prophet who is supposed to see divine things is blind to what his donkey perceives. The animal’s vision shames the seer’s blindness.'),
            ],
            'ctx': 'Numbers 22 begins the Balaam cycle (chs.22–24) — one of the most extraordinary extended narratives in the Pentateuch. Balak king of Moab, terrified by Israel’s military victories, hires the renowned seer Balaam to curse Israel. God twice forbids Balaam to go; on the third summons (with greater incentives), God permits it with the instruction: "do only what I tell you." The donkey episode (vv.21–35) is theologically central: Balaam’s prophetic vision is so dulled by desire that his donkey sees the angel he cannot. The angel’s rebuke and Balaam’s submission set up the oracles: Balaam arrives with Balak’s money but God’s words.',
            'cross': [
                ('2 Pet 2:15–16', '"They have left the straight way and wandered off to follow the way of Balaam son of Bezer, who loved the wages of wickedness. But he was rebuked for his wrongdoing by a donkey — an animal without speech — who spoke with a human voice and restrained the prophet’s madness."'),
                ('Jude 11', '"They have rushed for profit into Balaam’s error." Balaam’s willingness to sell his prophetic gift becomes the NT’s standard example of mercenary ministry.'),
                ('Rev 2:14', '"You have people there who hold to the teaching of Balaam, who taught Balak to entice the Israelites to sin by eating food sacrificed to idols and by committing sexual immorality." The Balaam connection to Baal Peor (Num 25, 31:16) is the basis for this NT allusion.'),
            ],
            'mac': [
                ('22:12', 'MacArthur: God’s first word to Balaam is unambiguous: "Do not go with them. You must not put a curse on those people, because they are blessed." The divine prohibition is clear. Balaam’s subsequent attempts to find a loophole — asking again when offered more money — reveal that he wants to go, which is why the donkey episode is necessary: God must physically restrain a prophet whose heart has already departed.'),
                ('22:28–30', 'MacArthur: The speaking donkey is one of Scripture’s most dramatic moments of divine communication. God uses the most unlikely instrument — a beast of burden — to shame the professional prophet. The donkey saw what Balaam could not because Balaam’s spiritual perception was blinded by greed. Animal clarity rebukes human blindness.'),
            ],
            'milgrom': [
                ('22:20–22', 'Milgrom: "God was very angry when he went" (v.22) — yet God himself had said "go" in v.20. The apparent contradiction is resolved by understanding that God’s permission was reluctant and conditional: "do only what I tell you." Balaam’s eagerness to go despite God’s clear reluctance is what provokes the anger. Permission given against God’s preference is not the same as God’s positive endorsement.'),
                ('22:28', 'Milgrom: The donkey’s speech is the Torah’s only example of direct animal speech after the serpent in Gen 3. The parallel is deliberate: as the serpent spoke to undermine the divine word, the donkey speaks to support it. The Torah’s two speaking animals bracket the range of talking-animal episodes: one destructive (Gen 3), one redemptive (Num 22).'),
            ],
            'ashley': [
                ('22:1–14', 'Ashley: The Balaam narrative introduces a non-Israelite prophet of genuine stature — one whom even God addresses directly (v.9, 12, 20). This is remarkable in Numbers: God speaks to a pagan seer as directly as to Moses. The implication is that God’s communicative reach extends beyond Israel’s covenant community, even using non-Israelite prophetic figures to serve his purposes for Israel.'),
            ],
            'sarna': [
                ('22:5', 'Sarna: Balaam is identified as from "Pethor, which is near the Euphrates River" — northern Mesopotamia. The Deir Alla inscription (c.800 BC) mentioning "Balaam son of Beor" confirms Balaam as a figure known in ancient Transjordanian tradition. The Numbers narrative is not legendary invention but engages a historically attested prophetic tradition.'),
            ],
            'alter': [
                ('22:22–35', 'Alter: The donkey episode is one of the Torah’s finest comic-ironic passages. Three times the donkey sees the angel and turns aside; three times Balaam beats her; then she speaks. The scene inverts the professional seer’s claim to special vision: his animal has better prophetic sight than he does. The comedy carries a serious theological point — Balaam’s spiritual blindness is a function of his willingness to be bought.'),
            ],
            'calvin': [
                ('22:38', 'Calvin: "I must speak only what God puts in my mouth" — Balaam’s statement to Balak, however hypocritically arrived at, articulates the essential principle of biblical prophecy. No prophet speaks their own words; every prophet is a mouthpiece of divine communication. Balaam’s mouth will be constrained to speak what he does not want to say — a vivid illustration of the irresistibility of divine inspiration.'),
            ],
            'netbible': [
                ('22:20', 'NET Note: "Since these men have come to summon you, rise and go with them; but you must do only what I tell you to do" — the conditional permission creates the narrative tension of the following chapters. God permits what he does not prefer, but constrains the outcome. Balaam’s freedom of movement and the divine constraint on his speech are both real; their combination drives the plot of chs.22–24.'),
            ],
        },
        {
            'header': 'Verses 36–41 — Balak Meets Balaam; Preparation for the Oracles',
            'verses': verse_range(36, 41),
            'heb': [
                ('mā ’ākaltī lēḥābed lĕkā', "ma achalti lehaved lecha", 'am I really able to say anything? / what power do I have to say anything?', 'Balaam’s question to Balak upon arrival — "do I have any power to say anything?" The rhetorical question undermines Balak’s expectations from the outset. Balaam arrives knowing he cannot deliver what Balak paid for.'),
            ],
            'ctx': 'Balak’s angry question to Balaam — "Why didn’t you come when I first summoned you? Did I not say I would reward you well?" — reveals the transactional nature of his request. He expects that money and status can purchase prophetic output. Balaam’s response is gentle but determinative: "I can’t say whatever I please. I must speak only what God puts in my mouth." The seven altars, seven bulls, and seven rams prepared at Bamoth Baal establish the setting for the four oracles that will follow — each oracle more expansive and more Israel-favouring than the last.',
            'cross': [
                ('Num 23:1–2', '"Build me seven altars here, and prepare seven bulls and seven rams for me." The elaborate sacrificial preparation cannot purchase a curse — it only provides a platform from which God’s blessing will be pronounced more publicly.'),
                ('Acts 8:18–20', '"Simon offered them money and said, ‘Give me also this ability.’… Peter answered: ‘May your money perish with you, because you thought you could buy the gift of God with money!’" The Simon Magus episode is the NT parallel to Balak’s attempt to purchase prophetic output.'),
            ],
            'mac': [
                ('22:36–41', 'MacArthur: Balak’s sacrifice of seven bulls and seven rams on seven altars is an attempt to leverage religious activity in service of political goals. The elaborate ritual is designed to create the conditions for Balaam’s curse. But the covenant God cannot be manipulated by ritual preparation that is divorced from covenant relationship. Religious performance in service of covenant-hostile purposes is not worship — it is attempted coercion.'),
            ],
            'milgrom': [
                ('22:38–41', 'Milgrom: The seven-altar structure mirrors the seven-altar arrangement of legitimate Israelite sacrifice — a parody of covenant worship. Balak’s attempts to create a sacrificial context for the curse reflects the ancient Near Eastern belief that prophecy and divination operate within ritual frameworks. What Balak cannot know is that YHWH operates outside those frameworks, using them only when he chooses.'),
            ],
            'ashley': [
                ('22:36–41', 'Ashley: The chapter’s closing verses set up the oracles with deliberate narrative irony: Balak has spent enormous resources (the repeated embassy, the seven altars, the sacrifices) to create conditions for a curse, and Balaam arrives already knowing he cannot curse what God has blessed. The gap between Balak’s expectations and Balaam’s constraint is the dramatic engine of chapters 23–24.'),
            ],
            'sarna': [
                ('22:41', 'Sarna: "The next morning Balak took Balaam up to Bamoth Baal, and from there he could see the outskirts of the Israelite camp." Balak brings Balaam to a high place where he can see Israel — the assumption being that the prophet needs to see his target. But the view of Israel becomes the context for blessing, not cursing; proximity to the covenant community reveals their indomitable character to the prophet.'),
            ],
            'alter': [
                ('22:38', 'Alter: Balaam’s response — "the word God puts in my mouth, that I must speak" — is spoken to Balak as a warning but functions for the reader as a theological announcement. What follows in chapters 23–24 is not Balaam’s professional output but divine compulsion. The oracles are not Balaam’s art; they are God’s word in an unwilling prophet’s mouth.'),
            ],
            'calvin': [
                ('22:36–41', 'Calvin: The elaborate sacrificial preparation cannot change what God has already determined — Israel is blessed and no curse can reverse that. Calvin sees in this episode a profound comfort for the church: when enemies seek to curse God’s people through religious, political, or military means, they are working against an already-established divine blessing that no human power can reverse.'),
            ],
            'netbible': [
                ('22:41', 'NET Note: "Bamoth Baal" — literally "high places of Baal." Balak brings Balaam to a pagan high place to invoke a pagan curse. The irony of the oracle cycle: the high places of Baal become the locations from which YHWH’s blessing of Israel is proclaimed. God appropriates pagan sacred space for covenant proclamation.'),
            ],
        },
    ],
})

num(23, {
    'title': 'The First and Second Oracles of Balaam',
    'sections': [
        {
            'header': 'Verses 1–12 — The First Oracle: A People Who Cannot Be Cursed',
            'verses': verse_range(1, 12),
            'heb': [
                ('mâ ʾqqōb lōʾ qabbāh ʾēl', "ma eqqov lo qabbah El", 'how can I curse whom God has not cursed?', 'The rhetorical impossibility at the heart of the first oracle: Balaam cannot curse what God has not cursed; cannot denounce what God has not denounced. The curse Balak purchased is theologically impossible — God’s prior blessing renders any human curse void.'),
                ('yiškōn lēbādād', 'yishkon levadad', 'a people who dwell alone / who live apart', 'Israel’s distinctive characteristic in the first oracle — they are “a people who live apart and do not consider themselves one of the nations.” The apartness is covenant isolation: not cultural arrogance but divine designation.'),
            ],
            'ctx': 'The first oracle (vv.7–10) is delivered from Bamoth Baal after Balaam encounters God (v.4) and receives the divine word. The oracle has four rhetorical moves: (1) Balak summoned me, but God has not cursed Israel — I cannot (vv.7–8); (2) Israel is a people apart, uncountable in their blessing (v.9); (3) who can count the dust of Jacob? — the Abrahamic promise (v.10a); (4) let me die the death of the righteous (v.10b). Balak’s furious response — "What have you done to me? I brought you here to curse my enemies, but you have done nothing but bless them!" — sets up the second oracle.',
            'cross': [
                ('Gen 13:16', '"I will make your offspring like the dust of the earth, so that if anyone could count the dust, then your offspring could be counted." Balaam’s "who can count the dust of Jacob?" (v.10) directly quotes the Abrahamic promise — the blessing Balak paid to reverse is the promise God made to Abraham that cannot be reversed.'),
                ('Rom 8:31', '"If God is for us, who can be against us?" The theological logic of the first oracle: God’s prior blessing renders all human opposition ineffective. Paul’s rhetorical question is the NT distillation of Balaam’s reluctant proclamation.'),
            ],
            'mac': [
                ('23:8–10', 'MacArthur: The first oracle establishes the foundational principle of the entire Balaam cycle: God’s blessing precedes and overrides human cursing. Balak paid for the reversal of a divine decree — which is theologically impossible regardless of the prophet’s fee. The oracle teaches that the covenant people’s security rests not on their own strength but on the prior word of God that established their blessing.'),
            ],
            'milgrom': [
                ('23:9', 'Milgrom: "A people who live apart and do not consider themselves one of the nations" — Israel’s apartness (bādad) is not isolation as weakness but isolation as distinction. The covenant community is not like the nations because it is constituted differently — by divine election, not by ethnicity or territory alone. Balaam sees this from the outside and reports it accurately.'),
            ],
            'ashley': [
                ('23:10', 'Ashley: "Let me die the death of the righteous, and may my final end be like theirs!" — Balaam’s personal response to what he sees is astonishing. He wishes to participate in Israel’s destiny. The professional curser is converted by his own oracle into an admirer of the people he was hired to destroy. The divine word works on the speaker as well as the audience.'),
            ],
            'sarna': [
                ('23:7', 'Sarna: The oracle’s opening — "Balak brought me from Aram, the king of Moab from the eastern mountains" — situates Balaam’s geography and commission. The distance and expense of the summons underscore Balak’s desperation and the covenant community’s threat to surrounding nations.'),
            ],
            'alter': [
                ('23:10', 'Alter: "Let me die the death of the upright, let my end be like his." The final line of the first oracle is Balaam’s personal confession — the professional curser desires the death of the blessed. The oracle that begins with rhetorical impossibility ends with personal longing. Balaam, the instrument of God’s blessing, is himself moved by what he must proclaim.'),
            ],
            'calvin': [
                ('23:8–10', 'Calvin: The first oracle demonstrates that no prayer, ritual, or money can reverse what God has established. Balak assembles every instrument of ancient Near Eastern religious power — altars, sacrifices, a renowned prophet — and produces a blessing. The lesson for the church: its enemies’ most concentrated efforts against God’s people cannot undo what God has spoken over them.'),
            ],
            'netbible': [
                ('23:10', 'NET Note: "Who can count the dust of Jacob" — the phrase echoes Gen 13:16 ("your offspring like the dust of the earth") and Gen 28:14 ("your descendants will be like the dust of the earth"). Balaam’s oracle is saturated with Abrahamic covenant language, confirming that Israel’s blessing is rooted in the patriarchal promises that precede and ground the Sinaitic covenant.'),
            ],
        },
        {
            'header': 'Verses 13–30 — The Second Oracle: God Is Not a Man Who Lies',
            'verses': verse_range(13, 30),
            'heb': [
                ('lōʾ ʾîš ʾēl wîkazzēb', "lo ish El viykazev", 'God is not a man that he should lie', 'The second oracle’s theological centre: God’s word is not like human speech — it cannot be retracted, revised, or reversed. What God has spoken over Israel is irrevocable because God’s character is immutable. The oracle is a declaration of divine immutability in the context of prophetic compulsion.'),
            ],
            'ctx': 'Balak moves Balaam to a different vantage point (Zophim on Pisgah — from where he can see only part of Israel) in hopes that a different view will produce a different result. The second oracle (vv.18–24) is more expansive than the first. Its structure: (1) God is not a man who lies or changes his mind; (2) I was told to bless, and I cannot reverse it; (3) God has seen no iniquity in Jacob that would disqualify the blessing; (4) God who brought Israel out of Egypt is like a wild ox in their midst; (5) no sorcery or divination can work against Jacob — God himself is their announcement. Balak’s response: "At least don’t curse them at all." He has retreated from asking for a curse to asking for no blessing.',
            'cross': [
                ('Heb 6:17–18', '"God wanted to make the unchanging nature of his purpose very clear to the heirs of what was promised, he confirmed it with an oath. God did this so that, by two unchangeable things in which it is impossible for God to lie, we who have fled to take hold of the hope set before us may be greatly encouraged." The immutability of God’s covenant word — the second oracle’s central claim — is the Hebrews’ ground for assurance.'),
                ('1 Sam 15:29', '"He who is the Glory of Israel does not lie or change his mind; for he is not a human being, that he should change his mind." Samuel quotes the second oracle’s theology directly when addressing Saul’s rejection.'),
            ],
            'mac': [
                ('23:19–20', 'MacArthur: "God is not human, that he should lie, not a human being, that he should change his mind. Does he speak and then not act? Does he promise and not fulfil?" — the second oracle’s most important verses. The divine immutability that Balak hoped would bend (perhaps God could be persuaded to reconsider) is precisely what cannot bend. The blessing is irrevocable because the character behind it is unchanging.'),
            ],
            'milgrom': [
                ('23:19', 'Milgrom: The contrast between divine and human speech is the second oracle’s theological core: human words can be retracted; divine words cannot. Balak’s entire enterprise rests on the assumption that prophetic speech can override divine speech — that Balaam’s curse can neutralise God’s blessing. The second oracle demolishes that assumption philosophically before demolishing it practically.'),
            ],
            'ashley': [
                ('23:21', 'Ashley: "No misfortune is seen in Jacob, no misery observed in Israel; the Lord their God is with them" — the second oracle’s pastoral centre. God sees no disqualifying condition in Israel. From Balak’s perspective, Israel is a terrifying military threat; from God’s perspective, Israel is his covenant people in whom no curse-worthy condition exists.'),
            ],
            'sarna': [
                ('23:23', 'Sarna: "There is no divination against Jacob, no evil omens against Israel" — the oracle explicitly addresses the world of divination and omen-reading in which Balak operates. Within that world, the oracle declares: the tools of the diviner do not work against the covenant community. YHWH himself is the only announcement relevant to Israel.'),
            ],
            'alter': [
                ('23:19', 'Alter: "God is not a man that he should lie, nor a son of man that he should repent." The oracle’s pivotal verse is grammatically and theologically precise: the triple negative (not a man, not a son of man, not a liar, not a repenter) builds a rhetorical wall around the immutability of the divine word. Balak has come to the wrong prophet — the prophet’s God cannot be manipulated by any human mechanism.'),
            ],
            'calvin': [
                ('23:19', 'Calvin: "God is not a man that he should lie" is one of the OT’s clearest statements of divine immutability and veracity. The assurance of salvation rests precisely on this: God’s promises cannot be revoked because God’s character cannot change. Balaam’s reluctant proclamation becomes one of the OT’s most comforting theological affirmations.'),
            ],
            'netbible': [
                ('23:21', 'NET Note: "The Lord their God is with them; the shout of the King is among them" — the "shout of the King" (tĕrûʿat melek) refers to the battle cry or acclamation of a divine king present with his army. The same root (tĕrûʿāh) is used for the Feast of Trumpets (Num 29:1) and the ark-cry of Num 10:35. The covenant community’s military victories are grounded in the presence of the divine king.'),
            ],
        },
    ],
})

num(24, {
    'title': 'The Third and Fourth Oracles: The Star from Jacob',
    'sections': [
        {
            'header': 'Verses 1–13 — The Third Oracle: How Beautiful Are Your Tents, O Jacob',
            'verses': verse_range(1, 13),
            'heb': [
                ('nǝʾum', "ne'um", 'utterance / oracle / declaration', 'The prophetic formula introducing the third and fourth oracles: nĕʾum bileʿām (oracle of Balaam) combined with nĕʾum šōmēaʿ ʾimrê ʾēl (oracle of one who hears the words of God). The formula claims direct divine reception — not divination or omen-reading but genuine prophetic hearing.'),
                ('mah-ṭōbû ʾohalêkā yaʿăqōb', "ma tovu ohaleicha Ya'akov", 'how beautiful are your tents, O Jacob', 'The opening of the third oracle — one of the most beloved phrases in Jewish liturgy, sung at the beginning of morning synagogue service. The aesthetic beauty of Israel’s dwelling places expresses the covenant flourishing that Balak’s curse was meant to destroy.'),
            ],
            'ctx': 'The third oracle breaks new ground: Balaam abandons divination entirely and simply opens his eyes to see Israel (v.2) — the Spirit of God comes upon him. The oracle (vv.5–9) is the most lyrical of the four: Israel’s tents like valleys spread out, like gardens by the river, like aloes planted by God, like cedars beside waters. The king shall be greater than Agag; the kingdom shall be exalted. Blessed are those who bless Israel; cursed are those who curse Israel (reversing Balak’s request completely). Balak’s furious dismissal: he strikes his hands together and sends Balaam away without the promised payment. Balaam’s response: "Even if you gave me all the silver and gold in your palace, I could not do anything to go beyond the command of God."',
            'cross': [
                ('Gen 12:3', '"I will bless those who bless you, and whoever curses you I will curse." The third oracle’s closing formula (v.9b: "Blessed is everyone who blesses you and cursed is everyone who curses you") quotes the Abrahamic covenant directly — Balak hired Balaam to reverse the Abrahamic promise and instead received its reaffirmation.'),
                ('Rev 22:1–2', '"The river of the water of life, as clear as crystal, flowing from the throne of God… On each side of the river stood the tree of life." The garden imagery of the third oracle (tents like gardens by a river, vv.5–6) prefigures the eschatological garden-city of Revelation.'),
            ],
            'mac': [
                ('24:5–6', 'MacArthur: "How beautiful are your tents, O Jacob, your dwelling places, O Israel! Like valleys they spread out, like gardens beside a river, like aloes planted by the Lord, like cedars beside the waters." The lyric beauty of the third oracle contrasts sharply with Balak’s military terror of Israel. What Balak sees as a threatening army, Balaam sees (under prophetic inspiration) as a flourishing garden. The covenant community’s true identity is aesthetic and fruitful, not merely military.'),
                ('24:9', 'MacArthur: "Blessed is everyone who blesses you and cursed is everyone who curses you" — the Abrahamic formula reaffirmed at the very moment Balak expected its reversal. The money paid to produce a curse has produced the deepest blessing of all: the covenant promise reconfirmed by a pagan prophet in an enemy king’s presence.'),
            ],
            'milgrom': [
                ('24:2–3', 'Milgrom: The shift from divination (chs.22–23) to direct Spirit-reception (ch.24) marks the escalation of the oracle cycle. Balaam abandons his divinatory techniques and simply receives — "the Spirit of God came on him." The move from technique to reception is the move from pagan prophetism to genuine prophecy. Even Balaam, in his best moments, operates in the mode of Israel’s prophets.'),
            ],
            'ashley': [
                ('24:10–11', 'Ashley: Balak’s physical gesture — striking his hands together in fury — and his dismissal of Balaam without payment is the comic climax of the oracle cycle. The most expensive prophetic consultation in ancient Near Eastern history has produced exactly the opposite of what was commissioned. The money that was meant to purchase a curse has funded a threefold blessing of Israel.'),
            ],
            'sarna': [
                ('24:5', 'Sarna: "Mah tovu ohaleicha Yaaqov" — "How beautiful are your tents, O Jacob." This verse became the opening of Jewish morning prayers because it represents the Gentile perspective on Israel’s covenant beauty: even a pagan prophet, compelled by God, recognises the loveliness of the covenant community. The prayer begins by hearing Israel through Balaam’s reluctant eyes.'),
            ],
            'alter': [
                ('24:5–6', 'Alter: The garden imagery — valleys, gardens by a river, aloes planted by God, cedars beside waters — is the most lyrically accomplished passage in Numbers. The wilderness people described in terms of garden abundance: the covenant promise of land and flourishing breaking into the desert narrative. The beauty is prophetic — Balaam sees what is not yet fully visible.'),
            ],
            'calvin': [
                ('24:9', 'Calvin: The Abrahamic formula pronounced by Balaam confirms that the covenant promises are irreversible. Even the most sophisticated human attempt to reverse them — professional prophecy, elaborate ritual, royal resources — produces their reconfirmation. The church’s enemies who work to undo God’s purposes among his people are working against the grain of an established divine word.'),
            ],
            'netbible': [
                ('24:5', 'NET Note: "How beautiful are your tents, O Jacob, your dwelling places, O Israel!" — The phrase became the opening of Jewish shacharit (morning prayer). The use of a pagan prophet’s words as a liturgical opening is theologically striking: Israel begins each day’s worship by hearing itself described through the eyes of an outsider compelled by God to see Israel’s covenant beauty.'),
            ],
        },
        {
            'header': 'Verses 14–25 — The Fourth Oracle: A Star Shall Come from Jacob',
            'verses': verse_range(14, 25),
            'heb': [
                ('dārak kôkāb miyyaʿăqōb', 'darah kochav miYaakov', 'a star shall come from Jacob', 'The messianic oracle of Balaam — the most explicitly royal-messianic prophecy in Numbers. The star (kôkāb) and the sceptre (šēbeṭ) from Jacob/Israel will crush Moab and all the sons of Seth. The language of crushing (māḥaṣ) and ruling (rādāh) is the language of the Davidic monarchy and ultimately of the Messiah.'),
            ],
            'ctx': 'The fourth oracle (vv.15–19) is the most elevated of the four — and the most explicitly eschatological. The seer who "sees the vision of the Almighty" (v.4, 16) looks to the far future: "I see him, but not now; I behold him, but not near." A star from Jacob, a sceptre from Israel, will crush Moab’s temples and destroy all the sons of Seth. Edom will be conquered; Israel will gain strength; a ruler will arise from Jacob. The four brief oracles against Amalek, the Kenites, Asshur, and Eber follow, and Balaam departs. The oracle cycle closes without any curse; Balaam returns to his home, and Balak is left with nothing.',
            'cross': [
                ('Matt 2:2', '"Where is the one who has been born king of the Jews? We saw his star when it rose and have come to worship him." The Magi’s star — almost certainly informed by Balaam’s oracle — represents the fulfilment of the star-from-Jacob prophecy. Non-Israelite observers of astronomical signs seek the messianic king, just as a non-Israelite prophet announced him centuries earlier.'),
                ('Rev 22:16', '"I am the Root and the Offspring of David, and the bright Morning Star." Jesus applies Balaam’s star imagery to himself in Revelation’s closing chapter.'),
                ('Gen 49:10', '"The sceptre will not depart from Judah, nor the ruler’s staff from between his feet, until he to whom it belongs shall come." Balaam’s sceptre-from-Israel oracle parallels Jacob’s blessing of Judah — both prophesying a messianic ruler from the covenant people.'),
            ],
            'mac': [
                ('24:17', 'MacArthur: "A star will come out of Jacob; a sceptre will rise out of Israel. He will crush the foreheads of Moab, the skulls of all the people of Sheth." The star-and-sceptre oracle is Numbers’ most explicit messianic prophecy — and it comes from a pagan prophet’s mouth, in an enemy king’s presence, as the climactic conclusion of a failed curse attempt. The Messiah’s coming is announced by the most unlikely instrument, in the most ironic circumstances, as the ultimate answer to all efforts to curse the covenant people.'),
                ('24:16', 'MacArthur: Balaam describes himself as "one who hears the words of God, who has knowledge from the Most High, who sees a vision from the Almighty, who falls prostrate, and whose eyes are opened." The qualifications are those of a genuine prophet. Even Balaam, compromised by greed and morally flawed, experiences authentic prophetic reception when God speaks through him. God’s word is not limited by the quality of its human instrument.'),
            ],
            'milgrom': [
                ('24:17', 'Milgrom: The star-and-sceptre oracle was understood messianically in the Second Temple period and the NT. Bar Kokhba ("son of a star") took his messianic title from this verse. The Dead Sea Scrolls’ Damascus Document also interprets it messianically. The oracle’s reach across history — from Balaam’s mouth to the Magi’s journey to Jesus’s self-identification in Rev 22:16 — is one of the most remarkable trajectories in biblical literature.'),
            ],
            'ashley': [
                ('24:14–17', 'Ashley: The fourth oracle’s temporal frame — "what this people will do to your people in days to come" — explicitly projects beyond the immediate historical moment into eschatological time. Balaam is not prophesying about the conquest of Canaan alone but about something beyond it: a royal figure from Israel who will exercise universal dominion. The oracle’s scope exceeds any historical Israelite king.'),
            ],
            'sarna': [
                ('24:17', 'Sarna: "A star will come out of Jacob; a sceptre will rise out of Israel." The parallelism (star/sceptre, Jacob/Israel) is characteristic of ancient Near Eastern poetry. The star is a royal symbol in the ANE; the sceptre is the standard symbol of royal authority in the OT. Together they describe the coming of Israel’s definitive king — one who will fulfil what the Davidic monarchy only partially achieved.'),
            ],
            'alter': [
                ('24:17', 'Alter: "I see him, but not now; I behold him, but not near. A star shall come from Jacob, a sceptre shall rise from Israel." The temporal dislocation — seen but not yet present, beheld but distant — is prophetic vision at its most characteristic: the prophet sees across time, reporting the future as if present but acknowledging its distance. The star-oracle is the most far-seeing vision in Numbers.'),
            ],
            'calvin': [
                ('24:17', 'Calvin: The star-and-sceptre oracle is fulfilled in David proximately and in Christ ultimately. Calvin follows the standard interpretive tradition: the oracle’s language (crushing the foreheads of Moab, dominating the sons of Seth) exceeds what any Israelite king accomplished and points to the universal dominion of the one who was announced by the Magi’s star (Matt 2:2) and who calls himself the Morning Star (Rev 22:16).'),
            ],
            'netbible': [
                ('24:17', 'NET Note: "He will crush the foreheads of Moab, the skulls of all the sons of Sheth" — the violent imagery reflects the complete subjugation of Israel’s enemies by the messianic king. "Sons of Sheth" (bĕnê-šēt) is debated — possibly a reference to all humanity (if Sheth = Seth, Gen 4:25) or to a specific people group. If the universal reading is correct, the oracle claims universal dominion for the star from Jacob.'),
            ],
        },
    ],
})

num(25, {
    'title': 'Baal Peor: The Seduction That Killed Twenty-Four Thousand',
    'sections': [
        {
            'header': 'Verses 1–13 — Israel Joins Baal Peor; Phinehas’s Zeal',
            'verses': verse_range(1, 13),
            'heb': [
                ('wayāḥel haʿam lizānôt', 'wayachel ha\'am liznot', 'the people began to commit sexual immorality', 'The verb ḥālal (begin) marks a new phase of degradation. The sexual immorality (zānāh, the root of zonah/harlot) is inseparable from the idolatrous worship — the Moabite women invited Israel to their sacrifices, which included sexual rites. Spiritual and sexual unfaithfulness are intertwined.'),
                ('qinʾh', "qin'ah", 'zeal / jealousy / passionate devotion', 'Phinehas’s act is described as qinʾh (zeal/jealousy) — the same root as God’s jealousy for Israel in Exod 20:5 ("I, the Lord your God, am a jealous God"). Phinehas acts with divine jealousy because Israel’s unfaithfulness has provoked the divine jealousy that defends the covenant.'),
            ],
            'ctx': 'Numbers 25 is the darkest chapter in the Balaam cycle’s aftermath. Balak could not curse Israel through Balaam; according to Num 31:16 and Rev 2:14, Balaam advised Balak to seduce Israel into covenant violation through the Midianite/Moabite women. The plan works: Israel worships Baal of Peor; God commands the execution of the leaders; a plague begins; a plague of 24,000 breaks out. At the height of the plague, an Israelite man brazenly brings a Midianite woman into the camp before Moses and the weeping congregation. Phinehas (Aaron’s grandson) takes a spear and drives it through both of them in the tent. The plague stops. God grants Phinehas a "covenant of a lasting priesthood" for his zeal.',
            'cross': [
                ('1 Cor 10:8', '"We should not commit sexual immorality, as some of them did — and in one day twenty-three thousand of them died." Paul references Baal Peor as a warning for NT believers — the number differs slightly from Num 25 (24,000), possibly because Paul counts only the plague deaths or rounds differently.'),
                ('Ps 106:28–31', '"They yoked themselves to the Baal of Peor and ate sacrifices offered to lifeless gods… But Phinehas stood up and intervened, and the plague was checked. This was credited to him as righteousness for endless generations to come."'),
                ('Rev 2:14', '"You have people there who hold to the teaching of Balaam, who taught Balak to entice the Israelites to sin by eating food sacrificed to idols and by committing sexual immorality."'),
            ],
            'mac': [
                ('25:1–3', 'MacArthur: The Baal Peor apostasy is the logical endpoint of everything Numbers 11–25 has been building toward: a community that has complained about provision, challenged authority, rejected the promised land, and now capitulates to the sexual-religious practices of the surrounding nations. The apostasy begins with eating (v.2 — the Moabite women invite them to their sacrifices) and expands to worship. The sequence — table fellowship leading to cultic participation leading to spiritual adultery — is a consistent biblical pattern.'),
                ('25:11–13', 'MacArthur: Phinehas’s grant of a "covenant of a lasting priesthood" (bĕrît kĕhunnat ʿôlām) for his act of violent zeal is one of the most striking divine rewards in the Torah. God does not merely commend Phinehas; he makes a covenant with him personally. The zeal that drove Phinehas to act was not human anger but divine jealousy (qinʾat ʾĕlōhîm) — and God recognises and rewards the alignment of the priest’s jealousy with his own.'),
            ],
            'milgrom': [
                ('25:6–9', 'Milgrom: The act of the unnamed Israelite — bringing the Midianite woman "into his brothers’ presence" while Moses and the congregation wept at the tent entrance — is an act of calculated brazenness, not reckless passion. He knows what he is doing; he does it publicly. This is the bĕyad rāmāh (high-handed defiance) of Num 15:30 enacted at the worst possible moment.'),
                ('25:13', 'Milgrom: The "covenant of a lasting priesthood" granted to Phinehas is interpreted in later tradition as the establishment of the Zadokite priestly line. Milgrom traces the Zadokite claim to Phinehas’s lineage as the theological foundation of Second Temple priestly authority.'),
            ],
            'ashley': [
                ('25:1–16', 'Ashley: The Baal Peor episode completes the Balaam narrative’s irony: Balaam could not curse Israel with his mouth, so he devised a way to entice Israel into self-destruction through covenant violation. The enemy’s most effective weapon against the covenant community is not military force but the seductive offer of religious-sexual accommodation. Israel’s greatest danger is internal, not external.'),
            ],
            'sarna': [
                ('25:3', 'Sarna: "Israel joined in worshipping the Baal of Peor" — the verb ṣāmad (to be joined, yoked) carries connotations of yoke-attachment, as between animals. Israel has yoked itself to a foreign deity — the same language Paul will use for being "yoked together with unbelievers" (2 Cor 6:14). The covenant community’s self-yoking to what opposes it is the deepest form of self-betrayal.'),
            ],
            'alter': [
                ('25:6–8', 'Alter: The moment is precisely framed: the congregation weeping at the tent entrance, Moses and the leaders weeping, and one man walking past all of them with a Midianite woman, openly, into the tent. The juxtaposition of communal grief and individual brazenness is the episode’s dramatic centrepiece. Phinehas’s response — taking the spear, following them into the tent — is the act of a man who understands that public sin in the covenant community requires a public response.'),
            ],
            'calvin': [
                ('25:11–13', 'Calvin: Phinehas’s zeal models the principle that there are moments when the defence of God’s honour requires decisive action rather than patient tolerance. The covenant community cannot passively accommodate public, brazen covenant violation — not because of human anger but because of alignment with divine jealousy. The NT equivalent is Paul’s instruction to remove the immoral person from the church (1 Cor 5:2–5) for the community’s protection and the individual’s potential restoration.'),
            ],
            'netbible': [
                ('25:13', 'NET Note: "A covenant of a lasting priesthood" — the phrase is unique in the Torah, paralleling the "covenant of salt" (Num 18:19) and the "covenant of peace" (Num 25:12). Phinehas’s descendants are confirmed in the Aaronic priestly line through this personal covenant grant. The Zadokites (Ezek 44:15) and later the Maccabean priest-kings traced their legitimacy to Phinehas.'),
            ],
        },
        {
            'header': 'Verses 14–18 — The Offenders Named; the Midianite Command',
            'verses': verse_range(14, 18),
            'heb': [
                ('ṣōrēb', 'tzorev', 'pierced through / skewered', 'Phinehas’s spear pierces both offenders simultaneously through their bodies. The graphic detail is not gratuitous but judicial: the execution is public, undeniable, and immediately visible to the congregation. The plague stops at this moment.'),
            ],
            'ctx': 'The offenders are named (vv.14–15): the Israelite man is Zimri son of Salu, a leader of a Simeonite family; the Midianite woman is Cozbi daughter of Zur, a Midianite tribal chief. Both are of high status — this is not a case of marginal individuals but of prominent community leaders engaging in public covenant violation. The chapter closes (vv.16–18) with God’s command to treat the Midianites as enemies because of the Baal Peor seduction and because of Cozbi’s role. The Midianite war of Num 31 will execute this command.',
            'cross': [
                ('Num 31:7–8', '"They fought against Midian, as the Lord commanded Moses, and killed every man… They also killed Balaam son of Beor with the sword." The Midianite war executes the command of Num 25:17, and Balaam’s death confirms the connection between his counsel and the Baal Peor apostasy (31:16).'),
                ('1 Kgs 18:40', '"Then Elijah commanded them, ‘Seize the prophets of Baal. Don’t let anyone get away!’ They seized them, and Elijah had them brought down to the Kishon Valley and slaughtered there." Elijah’s zeal against Baal worship mirrors Phinehas’s zeal at Baal Peor — both act with divine jealousy against covenant idolatry.'),
            ],
            'mac': [
                ('25:14–15', 'MacArthur: The naming of both offenders — Zimri, a Simeonite leader, and Cozbi, a Midianite chief’s daughter — gives the episode its full weight. This was not an impulsive encounter between anonymous individuals but a deliberate, high-status act of covenant contempt at the most public possible moment. The naming also establishes the judicial record: the covenant community knows who did this and knows that it was judged.'),
            ],
            'milgrom': [
                ('25:16–18', 'Milgrom: The command to treat the Midianites as enemies (v.17) because of the Peor seduction and Cozbi’s role establishes the theological rationale for the Midianite war of Num 31. The war is not ethnic cleansing but covenant justice: Midian used its women as a weapon against the covenant community and must face the consequences. The war is framed as a religious response to a religious attack.'),
            ],
            'ashley': [
                ('25:14–18', 'Ashley: The naming of Zimri and Cozbi closes the Baal Peor episode with judicial specificity: the record stands, the identities are known, the judgment is documented. The broader command against Midian (vv.16–18) extends the response from the individual execution to the national level — the seduction at Peor was not an accident but a strategy (Num 31:16), and the response must be proportional.'),
            ],
            'sarna': [
                ('25:14', 'Sarna: Zimri son of Salu is described as "a leader of a Simeonite family" — his status makes his act worse, not better. Leaders bear heavier covenant responsibility; their public violations have greater public impact. The Simeonite tribe, already diminished since the Levi-Simeon violence of Gen 34, loses further numbers in the plague at Baal Peor (the second census of Num 26 will show Simeon’s dramatic reduction).'),
            ],
            'alter': [
                ('25:18', 'Alter: "Treat the Midianites as enemies and kill them, because they treated you as enemies when they deceived you in the Peor incident." The verb nkl (to deceive, treat cunningly) reveals the strategic character of the seduction: Midian used the women of Cozbi’s class as agents of deliberate covenant destruction. The covenant community’s response is proportional to the attack’s intentionality.'),
            ],
            'calvin': [
                ('25:16–18', 'Calvin: The command against Midian closes the Balaam cycle’s moral: the enemy that could not curse Israel from without devised a strategy to destroy Israel from within. The covenant community faces its greatest danger not from military assault but from cultural and religious seduction. The NT equivalent: "Do not be conformed to this world" (Rom 12:2) — the world’s most effective weapon is accommodation, not attack.'),
            ],
            'netbible': [
                ('25:18', 'NET Note: "Because of the matter of Peor and because of Cozbi, the daughter of the prince of Midian" — the two grounds for the anti-Midian command: the ideological seduction (Peor) and its personal embodiment (Cozbi). The double ground establishes that the judgment is not arbitrary but specifically responsive to Midian’s deliberate use of religious-sexual seduction against Israel’s covenant fidelity.'),
            ],
        },
    ],
})

print("NUM-5 complete: Numbers 20–25 built.")

# ─────────────────────────────────────────────────────────────────────────────
# NUM-6a: Chapters 26–30 — Second Census; Zelophehad; Joshua; Feasts; Vows
# ─────────────────────────────────────────────────────────────────────────────

num(26, {
    'title': 'The Second Census: A New Generation Counted',
    'sections': [
        {
            'header': 'Verses 1–51 — The Census of the New Generation',
            'verses': verse_range(1, 51),
            'heb': [
                ('kol-yotsē tsāvā', 'kol-yotze tzava', 'all who go out to war', 'The same military census formula as Num 1:3. The new generation is counted by the same standard as the old — but the numbers belong to those who grew up watching their parents die, and now stand ready to enter.'),
            ],
            'ctx': 'Numbers 26 is the structural hinge of the book: the first census (ch.1) counted the generation sentenced to die; the second counts their children. The total is nearly identical — 601,730 vs 603,550 — the covenant community survived forty years at almost exactly the same size. The closing note (vv.63-65) delivers the verdict: not one man from the original census remains except Caleb and Joshua. The word of God was fulfilled with complete precision.',
            'cross': [
                ('Josh 14:1', '"These are the areas the Israelites received as an inheritance in the land of Canaan, which Eleazar the priest, Joshua son of Nun and the heads of the tribal clans of Israel allotted to them." The second census land-allocation function (Num 26:52-56) is fulfilled in Joshua.'),
                ('Heb 3:17-19', '"With whom was he angry for forty years? Was it not with those who sinned, whose bodies perished in the wilderness?... So we see that they were not able to enter, because of their unbelief."'),
            ],
            'mac': [
                ('26:63-65', 'MacArthur: The census closes with the most devastating summary in Numbers: "Not one of them was among those counted by Moses and Aaron the priest when they counted the Israelites in the Desert of Sinai. For the Lord had told them they would surely die in the wilderness, and not one of them was left except Caleb son of Jephunneh and Joshua son of Nun." Forty years. 603,550 men. All dead. The word of God proved precisely accurate.'),
                ('26:52-56', 'MacArthur: The census is taken for land allocation — larger tribes receive larger portions, but the specific land is determined by lot. The combination of population size and divine lot ensures both proportional justice and divine sovereignty in the inheritance distribution.'),
            ],
            'milgrom': [
                ('26:1-4', 'Milgrom: The second census immediately follows the Baal Peor plague — a transition from judgment to preparation. The new count establishes who remains and who is eligible for the conquest. The census is a theological reset: the generation of judgment fully accounted for; the generation of promise beginning its official muster.'),
                ('26:52-56', 'Milgrom: The land allocation by lot (goral) ensures that no human preference or political negotiation determines the inheritance. The lot is a divine instrument — the decision belongs to God. Tribal competition for prime territories is eliminated before it can arise.'),
            ],
            'ashley': [
                ('26:64-65', 'Ashley: The census closing note — "Not one of them was among those counted by Moses and Aaron" — is the fulfilment of Num 14:29-32 with mathematical precision. Every man numbered in the first census who was over 20 is absent from the second. The covenant word has been executed completely.'),
            ],
            'sarna': [
                ('26:55-56', 'Sarna: The land by lot (goral) removes human ambition from the equation. The same word for lot (goral) also means destiny — one\'s inheritance is God\'s ordained portion. Proverbs 16:33: "The lot is cast into the lap, but its every decision is from the Lord."'),
            ],
            'alter': [
                ('26:64-65', 'Alter: "Not one of them was left except Caleb son of Jephunneh and Joshua son of Nun." The entire book of Numbers has been moving toward this sentence. The census that opened Numbers (ch.1) has produced its one remaining result: two men. Everyone else is gone. The forty years are complete, documented, acknowledged. The new chapter begins.'),
            ],
            'calvin': [
                ('26:63-65', 'Calvin: The census\'s closing note is the most sobering data point in the Torah. Forty years of divine faithfulness matched by forty years of human faithlessness. Yet the community survives, the covenant endures, and the new generation stands at the threshold. God\'s purposes are not defeated by human failure; they are delayed and then fulfilled in the next generation.'),
            ],
            'netbible': [
                ('26:55', 'NET Note: "The land is to be divided by lot" — the lot (goral) expresses the theological claim that land distribution is ultimately God\'s decision, not Israel\'s. Proportional justice (larger tribes get more) and divine sovereignty (where each tribe lives is God\'s choice) operate simultaneously.'),
            ],
        },
        {
            'header': 'Verses 52–65 — Land Allocation Principles; the Census Conclusion',
            'verses': verse_range(52, 65),
            'heb': [
                ('goral', 'goral', 'lot / portion / destiny', 'The lot determines specific land boundaries for each tribe. Casting it expresses that land allocation is a divine decision. The same word for lot also means destiny — inheritance is God\'s ordained portion for each community.'),
            ],
            'ctx': 'The allocation principles (vv.52-56) balance tribal size and divine lot. The Levites are excluded — God is their inheritance. The chapter\'s final verses deliver the theological verdict: of the original census, only Caleb and Joshua survive. The forty-year sentence has been executed with complete precision.',
            'cross': [
                ('Ps 16:5-6', '"Lord, you alone are my portion and my cup; you make my lot secure. The boundary lines have fallen for me in pleasant places; surely I have a delightful inheritance." The Psalmist applies the Numbers land-lot theology to spiritual inheritance.'),
                ('Acts 1:17', 'The word "share" (kleros) derives from the LXX goral of Numbers — the NT community inherits the language of lot-determined portions for ministry roles.'),
            ],
            'mac': [
                ('26:52-56', 'MacArthur: The two-factor allocation — tribal size for amount, divine lot for location — is a masterpiece of covenant governance. Human proportionality is honoured; divine sovereignty is preserved. Neither pure equality nor pure lottery — a synthesis reflecting the covenant\'s character throughout: order and grace together.'),
            ],
            'milgrom': [
                ('26:62', 'Milgrom: The Levites are counted separately (23,000) but receive no land portion — "They received no inheritance among the Israelites." Their inheritance is the priestly portions and the tithe. God himself is their portion (Num 18:20).'),
            ],
            'ashley': [
                ('26:52-56', 'Ashley: The land-by-lot system reflects Numbers\' entire theology: the land is God\'s gift, distributed by his choice. Israel has not conquered on their own terms — they receive on God\'s terms, through military action he superintends and divine lot he determines. The inheritance is grace from start to finish.'),
            ],
            'sarna': [
                ('26:55-56', 'Sarna: The prime agricultural land, strategic valleys, and coastal plains are all distributed by divine decision — removing the source of potential inter-tribal conflict before it arises. The lot system prevents the strongest tribes from claiming the best land by force or negotiation.'),
            ],
            'alter': [
                ('26:52-56', 'Alter: The allocation formula — larger group, larger inheritance; smaller group, smaller inheritance — is a principle of proportional justice. But the qualifier (by lot) ensures that proportional justice does not become human favouritism. Structured yet sovereign: the Numbers system at its most characteristic.'),
            ],
            'calvin': [
                ('26:52-56', 'Calvin: The lot teaches that covenant inheritance is not earned by military achievement but given by sovereign divine choice. The lot removes human ambition. The NT equivalent: our inheritance in Christ is "not from works, so that no one can boast" (Eph 2:9) — sovereignly assigned, graciously given.'),
            ],
            'netbible': [
                ('26:65', 'NET Note: "Not one of them was left except Caleb son of Jephunneh and Joshua son of Nun" — fulfilment of the specific exception clause of Num 14:30. The forty-year wilderness period executed the covenant verdict with exact precision. The exception was promised; the exception was fulfilled.'),
            ],
        },
    ],
})

num(27, {
    'title': 'The Daughters of Zelophehad; Joshua Appointed',
    'sections': [
        {
            'header': 'Verses 1–11 — The Daughters of Zelophehad: A Legal Precedent',
            'verses': verse_range(1, 11),
            'heb': [
                ('lamah yiggara shem-avinu', 'lamah yiggara shem avinu', 'why should our father\'s name disappear?', 'The daughters\' legal argument: their father\'s name and inheritance should not be lost because he died without male heirs. The appeal is to covenant family continuity — no Israelite household should be extinguished from the inheritance.'),
            ],
            'ctx': 'The five daughters of Zelophehad (Mahlah, Noah, Hoglah, Milcah, Tirzah) bring their case to Moses, Eleazar, and the whole assembly: their father died without male heirs. They request his inheritance pass to them. Moses brings it to God; God rules in their favour and establishes new law — daughters inherit when there are no sons. The ruling establishes a comprehensive inheritance priority: son, daughter, brothers, father\'s brothers, nearest clan relative.',
            'cross': [
                ('Josh 17:3-4', '"Zelophehad had no sons but only daughters, whose names were Mahlah, Noah, Hoglah, Milcah and Tirzah. They went to Eleazar the priest, Joshua son of Nun, and the leaders and said, \'The Lord commanded Moses to give us an inheritance among our brothers.\' So Joshua gave them an inheritance among their father\'s brothers."'),
                ('Gal 3:28', '"There is neither Jew nor Gentile, neither slave nor free, nor is there male and female, for you are all one in Christ Jesus." The NT principle of equality in inheritance finds OT anticipation in the Zelophehad ruling.'),
            ],
            'mac': [
                ('27:1-7', 'MacArthur: The daughters demonstrate that the covenant system is responsive to cases it has not explicitly anticipated. They do not rebel; they petition. They appeal to the covenant principle of family continuity and receive a judicial ruling that extends the law\'s application. This is case law development at its most faithful: pressing established principles into new situations through legitimate petition.'),
                ('27:8-11', 'MacArthur: The inheritance priority list (son, daughter, brothers, father\'s brothers, nearest relative) is one of the Torah\'s most systematic legal codifications. It ensures Israelite inheritance remains within the clan structure that maintains both land distribution and covenant family identity.'),
            ],
            'milgrom': [
                ('27:5-7', 'Milgrom: "Moses brought their case before the Lord. And the Lord said to Moses, \'What Zelophehad\'s daughters are saying is right.\'" God affirms the daughters\' legal reasoning directly. This is one of the rare cases where God endorses human legal argument rather than simply promulgating law. The daughters\' argument is sound, and God says so.'),
            ],
            'ashley': [
                ('27:1-7', 'Ashley: Five women address the entire male leadership of Israel with a legal argument — and win. The case demonstrates that the covenant system is responsive to equity claims. Where existing law produces unjust outcomes, legitimate petition can produce new precedent. The covenant is not rigidly patriarchal but responsive to justice.'),
            ],
            'sarna': [
                ('27:4', 'Sarna: "Why should our father\'s name disappear from his clan because he had no son?" The daughters frame their claim in terms of their father\'s covenant status, not personal desire for property. They ask for the law\'s own logic to be applied consistently — covenant family continuity demands it.'),
            ],
            'alter': [
                ('27:1-7', 'Alter: Five women stand before the entire Israelite assembly and make a legal argument. The narrative gives their names, their genealogy, and their argument in full. The detail is not decorative: these are real women making a real legal claim, and the text honours them by recording both their names and their successful argument.'),
            ],
            'calvin': [
                ('27:5-7', 'Calvin: God\'s direct ruling demonstrates that the covenant legal system is not a closed code but a living system responsive to equity. When written law does not address a case, the covenant community may petition the lawgiver. The NT equivalent is prayer for wisdom (Jas 1:5) — bringing unaddressed cases to the one whose law always serves justice.'),
            ],
            'netbible': [
                ('27:8', 'NET Note: "Tell the Israelites, \'If a man dies and leaves no son, give his inheritance to his daughter.\'" The ruling establishes a permanent legal principle (chuqqat mishpat — a judicial statute) that extends to all Israel, not just Zelophehad\'s daughters. The individual case becomes universal law.'),
            ],
        },
        {
            'header': 'Verses 12–23 — Moses Shown the Land; Joshua Commissioned',
            'verses': verse_range(12, 23),
            'heb': [
                ('wesamachta et-yadcha alav', 'vesamachta et-yadcha alav', 'you shall lay your hand on him', 'The commissioning gesture for Joshua — the same hand-laying used for ordination (Lev 8) and substitution (Num 8). Moses transfers his authority to Joshua through the physical gesture before Eleazar and the whole assembly.'),
            ],
            'ctx': 'God shows Moses the land from Mount Abarim — he will see it but not enter it. Moses\'s response is entirely pastoral: his first concern is not his own fate but the community\'s future. "May the Lord appoint a man over this community so that they will not be like sheep without a shepherd." God appoints Joshua — "a man in whom is the spirit" — and Moses commissions him before Eleazar and the whole assembly through hand-laying and public authorisation.',
            'cross': [
                ('Deut 34:9', '"Now Joshua son of Nun was filled with the spirit of wisdom because Moses had laid his hands on him. So the Israelites listened to him and did what the Lord had commanded Moses."'),
                ('John 10:11', '"I am the good shepherd. The good shepherd lays down his life for the sheep." Moses\'s prayer for a shepherd-leader (v.17) is answered first by Joshua and ultimately by Christ — the shepherd who not only guides but dies for the flock.'),
            ],
            'mac': [
                ('27:15-17', 'MacArthur: Moses\'s prayer for a successor — "May the Lord appoint a man over this community so that they will not be like sheep without a shepherd" — is the prayer of a true shepherd. He does not grieve his own exclusion from the promised land; he grieves the community\'s potential leaderlessness. The mark of genuine leadership is that the community\'s welfare supersedes the leader\'s legacy.'),
                ('27:18-23', 'MacArthur: The public commissioning of Joshua before Eleazar and the whole assembly ensures transparent succession. Covenant leadership transitions are not private arrangements but public commissionings, accountable to the community and its covenant authority structure.'),
            ],
            'milgrom': [
                ('27:18-20', 'Milgrom: "So Moses did as the Lord commanded him. He took Joshua and had him stand before Eleazar the priest and the whole assembly. Then he laid his hands on him and commissioned him." The compliance formula is precise: Moses does exactly as commanded, in the prescribed order. The succession is covenantally ordered, not improvised.'),
            ],
            'ashley': [
                ('27:12-14', 'Ashley: God\'s reminder to Moses of his sin at Meribah grounds his exclusion in consequence rather than arbitrariness. Moses needs to understand why he cannot enter. This understanding is what enables his pastoral response: knowing why he cannot go, he can still pray for the people who will.'),
            ],
            'sarna': [
                ('27:17', 'Sarna: "So the Lord\'s people will not be like sheep without a shepherd" — the shepherd metaphor for leadership receives here its most pastoral expression in the Torah. Moses prays not for a general or a judge but for a shepherd. The request defines what covenant leadership fundamentally is.'),
            ],
            'alter': [
                ('27:18', 'Alter: "Take Joshua son of Nun, a man in whom is the spirit, and lay your hand on him." The three qualifications — genealogy (son of Nun), divine qualification (the spirit), and public installation (the gesture) — together establish Joshua\'s legitimate authority. The succession is simultaneously human and divine.'),
            ],
            'calvin': [
                ('27:15-17', 'Calvin: Moses\'s prayer for a shepherd-leader models the first principle of pastoral intercession: pray for the community\'s need before your own. Moses has just been told he will die without entering the promised land, and his response is not grief for himself but prayer for the people. This is the shepherd\'s heart.'),
            ],
            'netbible': [
                ('27:20', 'NET Note: "Give him some of your authority so the whole Israelite community will obey him" — the Hebrew hod (authority, splendour) is the word used for the divine radiance. Moses transfers a portion of his covenant authority to Joshua — enough for public recognition. The community must see the transfer to accept it.'),
            ],
        },
    ],
})

num(28, {
    'title': 'The Offering Calendar: Daily, Weekly, Monthly',
    'sections': [
        {
            'header': 'Verses 1–15 — The Tamid, Sabbath, and New Moon Offerings',
            'verses': verse_range(1, 15),
            'heb': [
                ('tamid', 'tamid', 'continual / perpetual / regular', 'The foundational principle of Israel\'s public worship: two lambs every morning and evening sustain the covenant relationship without interruption. The altar never goes cold; the covenant is never suspended. Tamid is the pulse of Israel\'s daily life with God.'),
            ],
            'ctx': 'Numbers 28-29 provide the most comprehensive listing of Israel\'s public offering calendar in the Torah. The system operates at four time scales: daily (twice-daily tamid), weekly (Sabbath — double the daily), monthly (new moon), and annual (seven feasts). The tamid is the baseline: two unblemished lambs every day without exception, with grain and drink offerings. The Sabbath offering doubles the tamid; the new moon adds bulls and rams. Each higher time-unit builds on the daily foundation.',
            'cross': [
                ('Heb 10:11', '"Day after day every priest stands and performs his religious duties; again and again he offers the same sacrifices, which can never take away sins." The writer contrasts the repetitive tamid with Christ\'s once-for-all sacrifice — the perpetual offering points to its own insufficiency and the need for a final, unrepeatable sacrifice.'),
                ('Rev 8:3-4', '"Another angel, who had a golden censer, came and stood at the altar. He was given much incense to offer, with the prayers of all God\'s people, on the golden altar in front of the throne." The heavenly altar of perpetual incense fulfils the tamid theology.'),
            ],
            'mac': [
                ('28:1-8', 'MacArthur: The tamid — two lambs every morning and evening — is the heartbeat of Israel\'s worship. The regular, rhythmic sacrifice establishes that covenant relationship is not episodic (maintained only at festivals) but constant. The altar is never cold. The priests\' daily duty of maintaining the tamid is the most foundational act of Israelite worship.'),
                ('28:9-10', 'MacArthur: The Sabbath offering doubles the tamid — four lambs instead of two, plus additional grain and drink offerings. The Sabbath is not a day of reduced worship but of intensified worship: more is offered to God on the day of rest, not less. The Sabbath amplifies the covenant\'s material expression.'),
            ],
            'milgrom': [
                ('28:1-8', 'Milgrom: The comprehensive public offering calendar of Num 28-29 is unique in the Pentateuch for its systematic completeness. Where Lev 23 lists the feasts with their dates and theological character, Num 28-29 specifies the exact offerings for each occasion. The two texts are complementary: Leviticus provides the theological framework; Numbers provides the liturgical manual.'),
            ],
            'ashley': [
                ('28:1-8', 'Ashley: The tamid establishes that Israel\'s relationship with God is maintained through regular, unfailing covenant acts, not merely through emotional response or crisis-driven devotion. The morning and evening lambs are offered whether Israel feels spiritually alive or dead, whether the day is exceptional or ordinary. Covenant faithfulness is expressed through regularity, not intensity.'),
            ],
            'sarna': [
                ('28:9-10', 'Sarna: The Sabbath offering — "in addition to the regular burnt offering and its drink offering" — is built upon the tamid, not substituted for it. The Sabbath does not replace ordinary worship; it adds to it. Each special occasion adds to, not replaces, the baseline. Covenant worship has both a steady pulse and periodic intensifications.'),
            ],
            'alter': [
                ('28:1-3', 'Alter: "Make sure that you present to me at the appointed time my food offerings, as an aroma pleasing to me." The divine first-person framing — "my food offerings," "to me," "pleasing to me" — positions the public offering system as a covenant meal relationship. The tamid feeds the covenant relationship.'),
            ],
            'calvin': [
                ('28:1-15', 'Calvin: The tamid calendar teaches that covenant worship requires discipline, not merely inspiration. The daily, weekly, monthly offerings are not dependent on the worshipper\'s mood or Israel\'s national circumstances. The NT equivalent is the instruction to pray without ceasing (1 Thess 5:17) and to gather regularly (Heb 10:25): covenant faithfulness is maintained through regularity.'),
            ],
            'netbible': [
                ('28:4', 'NET Note: "Prepare one lamb in the morning and the other at twilight" — the morning offering preceded the daily work; the evening offering concluded it. The day is bracketed by covenant sacrifice. The tamid creates a liturgical frame for every day of Israelite life, making each day a covenant day rather than a secular interval.'),
            ],
        },
        {
            'header': 'Verses 16–31 — Passover, Unleavened Bread, and Feast of Weeks',
            'verses': verse_range(16, 31),
            'heb': [
                ('bikkurim', 'bikkurim', 'firstfruits', 'The offering at the beginning of the wheat harvest — the firstfruits principle applied to the grain harvest\'s completion. Two loaves of leavened bread presented as firstfruits, plus an elaborate burnt offering sequence.'),
            ],
            'ctx': 'The annual feast offerings: Passover and Unleavened Bread (vv.16-25) receive extensive offering sequences for all seven days; the Feast of Weeks/Pentecost (vv.26-31) adds a special burnt offering for its single day. Each feast\'s offering follows the same pattern: burnt offerings (bulls, rams, lambs), sin offering (male goat), plus grain and drink offerings. The accumulation across the festival calendar communicates the covenant\'s concentrated devotion.',
            'cross': [
                ('1 Cor 15:20', '"But Christ has indeed been raised from the dead, the firstfruits of those who have fallen asleep." Paul applies the firstfruits theology of Num 28:26 to the resurrection — Christ is the first of the harvest of resurrection.'),
                ('Acts 2:1', '"When the day of Pentecost came, they were all together in one place." The Feast of Weeks — specified in Num 28:26-31 — is the day of the Spirit\'s outpouring, connecting agricultural firstfruits to the eschatological harvest of the new covenant community.'),
            ],
            'mac': [
                ('28:16-25', 'MacArthur: The Passover and Unleavened Bread offering sequence — two young bulls, one ram, seven male lambs per day, plus a sin offering goat, for seven days — is the most elaborate offering complex in the Numbers calendar. The feast that commemorates Israel\'s foundational redemptive event receives the most sustained sacrificial attention. The redemption event is never routine.'),
                ('28:26-31', 'MacArthur: The Feast of Weeks firstfruits offering acknowledges that the harvest\'s completion is God\'s gift and that its first and best belong to him before Israel eats of the new wheat. Prosperity and abundance are occasions for intensified worship, not reduced worship.'),
            ],
            'milgrom': [
                ('28:16-25', 'Milgrom: The Passover offering complex in Num 28 is more elaborate than the Lev 23 listing — it specifies exact animal counts and grain and drink accompaniments for each of the seven days. The elaboration reflects the Numbers offering calendar\'s purpose as a priestly manual rather than a theological summary. Lev 23 tells Israel what to observe; Num 28-29 tells the priests what to offer.'),
            ],
            'ashley': [
                ('28:26-31', 'Ashley: The Feast of Weeks offering brings together two theological streams: agricultural firstfruits (the first of the wheat harvest belongs to God) and historical covenant (fifty days after Passover). Numbers 28\'s offering calendar links the agricultural and historical dimensions of Israel\'s covenant calendar into a single liturgical unity.'),
            ],
            'sarna': [
                ('28:16', 'Sarna: The placement of Passover instructions in the offering calendar confirms that the Passover is both a historical commemoration and a liturgical event requiring priestly management. Personal redemption (Passover) and communal covenant worship (the sacrificial calendar) are inseparable in Israel\'s theology.'),
            ],
            'alter': [
                ('28:16-25', 'Alter: The seven-day Unleavened Bread offering sequence — the same animals each day, repeated seven times — embodies the covenant\'s consistency. The feast is not one dramatic gesture but a sustained, daily covenant act. Covenant faithfulness as regular discipline rather than periodic intensity.'),
            ],
            'calvin': [
                ('28:26-31', 'Calvin: The Feast of Weeks offering, given at the harvest\'s completion, teaches that prosperity and abundance are occasions for intensified worship. The more God gives, the more Israel returns. The NT equivalent: "Command those who are rich in this present world to be generous and willing to share" (1 Tim 6:17-18).'),
            ],
            'netbible': [
                ('28:26', 'NET Note: The Feast of Weeks marks the completion of the spring grain harvest, fifty days after the Passover firstfruits offering. The fifty-day counting period (the Omer) creates a liturgical arc between Passover (barley harvest) and Weeks (wheat harvest) — the entire spring harvest season is covenant time.'),
            ],
        },
    ],
})

num(29, {
    'title': 'The Autumn Feasts: Trumpets, Atonement, and Tabernacles',
    'sections': [
        {
            'header': 'Verses 1–11 — Feast of Trumpets and Day of Atonement',
            'verses': verse_range(1, 11),
            'heb': [
                ('yom teruah', 'yom teruah', 'day of trumpet blasting / day of the alarm', 'The alarm-blast that inaugurates the seventh month and calls Israel to assembly. The same teruah vocabulary appears in the Ark Prayer of Num 10:35 and in eschatological trumpet passages throughout the OT.'),
            ],
            'ctx': 'Numbers 29 provides the autumn feast offerings: the Feast of Trumpets (1 Tishri), the Day of Atonement (10 Tishri — with fasting), and the Feast of Tabernacles (15-22 Tishri — the most elaborate offering sequence in the entire calendar). The autumn feasts form a theological sequence: Trumpets (summons), Atonement (cleansing), Tabernacles (celebration in restored fellowship). The seventh month is the most liturgically dense period of Israel\'s year.',
            'cross': [
                ('Lev 23:27-32', 'The Lev 23 Yom Kippur commands (fasting, no work, the high priest\'s entry) are the foundation; Num 29:7-11 specifies the public offerings for that day — complementary texts providing the complete Yom Kippur requirement.'),
                ('Rev 8:2', '"And I saw the seven angels who stand before God, and seven trumpets were given to them." The seven eschatological trumpets draw on the Yom Teruah theology — the final trumpet summons of the covenant community.'),
            ],
            'mac': [
                ('29:1-6', 'MacArthur: The Feast of Trumpets opens the sacred seventh month. The trumpets summon; Atonement cleanses; Tabernacles celebrates. The sequence is the covenant\'s annual narrative arc: call, purification, and restored fellowship. The same arc governs individual salvation: call, justification, sanctification.'),
                ('29:7-11', 'MacArthur: The Day of Atonement public offerings are the communal counterpart to the high priest\'s sanctuary ministry of Lev 16. The public offerings acknowledge the community\'s sinfulness; the high priestly ministry purges the sanctuary of accumulated defilement. Both are necessary; together they constitute the annual covenant reset.'),
            ],
            'milgrom': [
                ('29:1', 'Milgrom: The Feast of Trumpets announces the sacred month — containing Atonement and Tabernacles. The trumpets are a month-long prologue: "prepare — the great days are coming." Only in later rabbinic tradition does 1 Tishri become the Jewish New Year (Rosh Hashanah); in Numbers, it is simply the beginning of the sacred seventh month.'),
            ],
            'ashley': [
                ('29:7-11', 'Ashley: The Day of Atonement\'s two-part structure — fasting (self-denial) and elaborate public offering — combines inward and outward covenant response. Fasting expresses the community\'s recognition of sin and dependence; the offerings provide the covenantal mechanism for addressing that sin. Neither alone is sufficient.'),
            ],
            'sarna': [
                ('29:1', 'Sarna: The Feast of Trumpets is described as a "day of teruah" — the alarm-blast rather than the assembly-blast. Its placement ten days before Atonement creates a ten-day period of preparation and self-examination before the covenant\'s most solemn day.'),
            ],
            'alter': [
                ('29:7-11', 'Alter: The Day of Atonement offering list is identical in structure to the Trumpets offering, confirming that the two feasts of the seventh month share the same sacrificial weight. The similarity underscores their belonging together: summons and atonement are inseparable in the autumn sequence.'),
            ],
            'calvin': [
                ('29:7-11', 'Calvin: The commanded fasting of Yom Kippur teaches that the covenant requires periodic, concentrated corporate self-examination. The NT church does not observe the Levitical calendar, but the principle of regular intentional self-examination — "Let a person examine themselves" (1 Cor 11:28) — is the NT counterpart of the Yom Kippur fasting requirement.'),
            ],
            'netbible': [
                ('29:7', 'NET Note: "Deny yourselves" — the Hiphil of anah, to humble or afflict oneself. The reflexive construction indicates voluntary self-denial, not external imposition. Yom Kippur is the only legally mandated fast in the Torah — the fasting is not optional piety but covenant obligation.'),
            ],
        },
        {
            'header': 'Verses 12–40 — The Feast of Tabernacles: Seventy Bulls',
            'verses': verse_range(12, 40),
            'heb': [
                ('Sukkot', 'Sukkot', 'Tabernacles / Booths / temporary shelters', 'The seven-day harvest festival of dwelling in temporary shelters — commemorating the wilderness period. The Tabernacles offering sequence is the most elaborate in the calendar: 70 bulls over seven days (decreasing from 13 to 7), plus rams and lambs, then a solemn assembly on the eighth day.'),
            ],
            'ctx': 'The Feast of Tabernacles receives the most elaborate offering sequence in Numbers 28-29. Days 1-7 feature decreasing burnt offerings: 13 bulls (day 1), 12, 11, 10, 9, 8, 7 — 70 bulls total, associated in rabbinic tradition with the 70 nations of Genesis 10. The eighth day (shemini atzeret) is a separate solemn assembly with a dramatically reduced offering (1 bull, 1 ram, 7 lambs) — as if God is calling the community to stay one more day in intimate fellowship after the great feast.',
            'cross': [
                ('John 7:37-38', '"On the last and greatest day of the festival, Jesus stood and said in a loud voice, \'Let anyone who is thirsty come to me and drink.\'" Jesus\' declaration on the last day of Tabernacles claims to fulfil the feast\'s deepest longing.'),
                ('Zech 14:16', '"Then the survivors from all the nations that have attacked Jerusalem will go up year after year to worship the King, the Lord Almighty, and to celebrate the Festival of Tabernacles." Tabernacles is the eschatological feast — the nations joining Israel in the final celebration.'),
            ],
            'mac': [
                ('29:12-34', 'MacArthur: The seventy bulls of Tabernacles\' seven days are the most discussed feature of the festival offering. Rabbinic tradition associates them with the seventy nations of Genesis 10 — Israel offering intercession for all humanity at its greatest feast. The covenant community\'s blessing is intended to overflow to all nations (Gen 12:3).'),
                ('29:35-38', 'MacArthur: The eighth-day assembly\'s dramatically reduced offering — from Tabernacles\' elaborate sequence down to one bull, one ram, seven lambs — is interpreted in rabbinic tradition as an intimate private dinner after the great public feast. God calls his people to linger, to stay, to be present with him one more day.'),
            ],
            'milgrom': [
                ('29:12-38', 'Milgrom: The Tabernacles offering sequence\'s decreasing bull count (13, 12, 11, 10, 9, 8, 7 = 70 total) is one of Numbers\' most mathematically distinctive features. The descending count creates a liturgical arc within the feast week: each day slightly less than the previous, building anticipation for the eighth day\'s quiet close.'),
            ],
            'ashley': [
                ('29:35-38', 'Ashley: The shemini atzeret (eighth-day assembly) is structurally distinct from Tabernacles — Lev 23:36 and Num 29:35 both treat it as a separate feast. Its minimal offering after the week\'s extravagance creates a theological contrast: the great public celebration followed by a simple, intimate gathering. The eighth day signals what lies beyond the seven — the eschatological rest that follows the full week of covenant celebration.'),
            ],
            'sarna': [
                ('29:12', 'Sarna: "On the fifteenth day of the seventh month, hold a sacred assembly and do no regular work. Celebrate a festival to the Lord for seven days." The seventh month contains three feasts compressed into its first three weeks — the most liturgically dense period of Israel\'s year, Israel\'s most sustained engagement with the covenant worship calendar.'),
            ],
            'alter': [
                ('29:35-38', 'Alter: The eighth day\'s reduced offering — one bull, one ram, seven lambs — is a striking diminuendo after the Tabernacles crescendo. The feast week builds to 70 bulls and falls back to 1. The liturgical shape of a great celebration followed by intimate closure: the party ends, the guests depart, but God asks his people to stay one more day in quiet fellowship.'),
            ],
            'calvin': [
                ('29:12-40', 'Calvin: The Feast of Tabernacles\' seven-day duration and booth-dwelling teach that covenant joy is both extended and embodied. The Christian is called not to brief moments of spiritual intensity but to sustained orientation of joy in God\'s presence. The eighth day\'s intimate assembly models the contemplative dimension of covenant life: after the public celebration, private fellowship.'),
            ],
            'netbible': [
                ('29:35', 'NET Note: The shemini atzeret (eighth-day restraint) is a distinct feast appended to Tabernacles. In later rabbinic practice it became Simchat Torah (rejoicing in the Torah). The eighth day\'s significance: beyond the seven of completeness, the eighth signals new creation — rest beyond rest, the eschatological Sabbath.'),
            ],
        },
    ],
})

num(30, {
    'title': 'The Law of Vows: Accountability and Release',
    'sections': [
        {
            'header': 'Verses 1–8 — Men\'s Vows; Daughters\' Vows',
            'verses': verse_range(1, 8),
            'heb': [
                ('neder', 'neder', 'vow', 'A voluntary, binding promise to God. Once made it cannot be broken (v.2: "he must not break his word but must do everything he said"). The vow is a self-imposed covenant obligation; breaking it is a form of covenant infidelity toward God himself.'),
                ('hepher', 'hepher', 'annul / nullify / revoke', 'The technical term for the father\'s or husband\'s right to nullify a woman\'s vow. Appears only in covenant-revocation contexts — the most formal possible cancellation of a binding obligation. Silence ratifies; explicit revocation nullifies.'),
            ],
            'ctx': 'Numbers 30 addresses vows within the household authority structure of ancient Israel. Men\'s vows are unconditional and binding (v.2). Women\'s vows have two levels: an unmarried daughter under her father (vv.3-5) and a married woman under her husband (vv.6-15). In both cases, the male authority figure has the right to nullify — but only immediately upon hearing the vow. Silence is ratification; delay removes the right to revoke. The vow law protects both the innocent woman (she can be released from rash vows) and the covenant (all voluntary commitments carry binding force).',
            'cross': [
                ('Matt 5:33-37', '"Do not swear an oath at all... All you need to say is simply \'Yes\' or \'No\'." Jesus elevates the vow principle beyond the Levitical system: the Christian\'s ordinary word should be as reliable as a sworn vow.'),
                ('Eccl 5:4-5', '"When you make a vow to God, do not delay to fulfil it... It is better not to make a vow than to make one and not fulfil it." Ecclesiastes applies the Num 30 principle directly.'),
            ],
            'mac': [
                ('30:1-2', 'MacArthur: "A man who makes a vow to the Lord or takes an oath to obligate himself by a pledge must not break his word." Once made, the vow shares the binding force of God\'s own commands. Breaking a vow is not merely failing to follow through — it is covenant infidelity. The voluntary becomes obligatory.'),
                ('30:3-5', 'MacArthur: The father\'s authority over his daughter\'s vows is protective: a daughter who makes a rash vow she cannot fulfil can be released by her father\'s timely revocation. But the father must act immediately. Procrastination eliminates the protective option. Authority structures are meant to protect, not control.'),
            ],
            'milgrom': [
                ('30:3-5', 'Milgrom: The vow law\'s household authority structure reflects the legal reality that women\'s covenant obligations in ancient Israel were embedded in family structures. The father\'s right to revoke is not a denigration of the daughter\'s agency but recognition that her vows could create obligations affecting the entire household.'),
            ],
            'ashley': [
                ('30:1-15', 'Ashley: The vow law\'s careful attention to household authority and gender is characteristic of Numbers\' pastoral concern for practical covenant living. It does not simply command "keep your vows"; it provides for the complexity of vows made within family structures, with authority relationships that affect what obligations are binding and what relief is available.'),
            ],
            'sarna': [
                ('30:2', 'Sarna: "He must not break his word" — literally "he shall not defile his word" (lo yachel devaro). The verb chalal (to defile, profane) is the same root as profaning God\'s name (Lev 22:32). Breaking a personal vow defiles one\'s own integrity and by extension the covenant God in whose name the vow was made.'),
            ],
            'alter': [
                ('30:3-5', 'Alter: The father\'s right to nullify is hedged with two conditions: he must hear the vow (he cannot revoke what he does not know), and he must act on the day of hearing (delay forfeits the right). The temporal precision is the law\'s elegant protection against both arbitrary authority and arbitrary commitment.'),
            ],
            'calvin': [
                ('30:1-2', 'Calvin: The vow law\'s binding character teaches that voluntary covenant commitments carry real weight. The Christian who takes membership vows, baptismal vows, or marriage vows has made a voluntary binding commitment that partakes of the same seriousness as Israel\'s formal vows. Casual treatment of such vows is covenant infidelity in NT terms as surely as in OT terms.'),
            ],
            'netbible': [
                ('30:5', 'NET Note: "Her father may nullify any vow she has made... and the Lord will release her from it" — the divine release is explicit. When the father properly revokes the vow, God himself releases the obligation. The authority structure is not merely social but covenantally sanctioned.'),
            ],
        },
        {
            'header': 'Verses 9–16 — Widows\', Divorced Women\'s, and Married Women\'s Vows',
            'verses': verse_range(9, 16),
            'heb': [
                ('gerushah', 'gerushah', 'divorced woman / sent away', 'A woman who has been sent away from her husband. Her vow is fully binding — she has no male authority figure to revoke it on her behalf. Her covenant obligations are her own, and she bears full accountability for them as a direct covenant agent.'),
            ],
            'ctx': 'Widows and divorced women (v.9) bear full, unconditional covenant accountability for their vows — no male authority figure can revoke on their behalf. Married women\'s vows (vv.10-15) carry the husband\'s right to revoke (same-day, on hearing), but late revocation transfers guilt from the wife to the husband. The pattern is consistent: where a male authority figure is present and hearing, he has a time-limited right to revoke; where none exists, the woman bears full covenant accountability. The law is not about women\'s capacity for covenant but about household structures of accountability.',
            'cross': [
                ('1 Cor 7:34', '"An unmarried woman or virgin is concerned about the Lord\'s affairs: her aim is to be devoted to the Lord in both body and spirit." The unmarried woman\'s undivided devotion draws on the vow law\'s logic: she bears her covenant obligations directly, without mediation.'),
                ('Ruth 1:16-17', '"Where you go I will go... May the Lord deal with me, be it ever so severely, if even death separates you and me." Ruth\'s oath is a widow\'s vow — fully binding under Num 30:9.'),
            ],
            'mac': [
                ('30:9', 'MacArthur: The widow and divorced woman\'s vow is unconditionally binding — full covenant accountability. The absence of a male authority figure does not diminish their obligation; it simply means there is no revocation mechanism. Their vows are as binding as any man\'s. The law treats them as fully responsible covenant agents.'),
                ('30:15', 'MacArthur: The husband who allows his wife\'s vow to stand and then revokes it later bears her guilt. This guilt-transfer provision makes capricious authority-exercise costly. Authority structures carry accountability, not just privilege.'),
            ],
            'milgrom': [
                ('30:9', 'Milgrom: The equal binding force of widows\' and divorced women\'s vows reflects a consistent legal principle: covenant accountability is proportional to covenant agency. Where there is no male authority figure to provide oversight, the woman stands as a full covenant agent accountable directly to God.'),
            ],
            'ashley': [
                ('30:10-15', 'Ashley: The married woman\'s vow law creates a careful balance: the husband has authority to revoke, but it is bounded (same-day, on hearing) and carries consequences (guilt-transfer if misused). Authority in the covenant community is always accountable authority.'),
            ],
            'sarna': [
                ('30:9', 'Sarna: Widows and divorcees are treated identically — both women without a current male authority structure, both bearing full unbounded covenant accountability. Loss of the marriage relationship (whether through death or divorce) places women in the same legal position of direct accountability before God.'),
            ],
            'alter': [
                ('30:15', 'Alter: "If he nullifies them after he has heard them, then he will be responsible for her guilt" — the guilt-transfer clause is the vow law\'s most sophisticated provision. Authority is not a one-way power to revoke; it carries the obligation to act timely and the consequences of acting improperly.'),
            ],
            'calvin': [
                ('30:9-16', 'Calvin: The widow and divorcee\'s fully binding vows teach that no external authority structure can substitute for personal covenant accountability. Each believer stands directly before God for the commitments they have made, regardless of social circumstances. God is the ultimate recipient and enforcer of every covenant promise.'),
            ],
            'netbible': [
                ('30:15', 'NET Note: "He will be responsible for her guilt" — the Hebrew yissa et-avonah (he will bear her iniquity) uses the same guilt-bearing language as the priests\' bearing of Israel\'s iniquity (Num 18:1). The husband who improperly revokes becomes an unwilling guilt-bearer — a sobering reminder that authority in the covenant community always carries corresponding responsibility.'),
            ],
        },
    ],
})

print("NUM-6a complete: Numbers 26-30 built.")

# ─────────────────────────────────────────────────────────────────────────────
# NUM-6b: Chapters 31–36 — Midianite War; Transjordan; Itinerary; Boundaries;
#          Cities of Refuge; Zelophehad Marriage Restriction
# ─────────────────────────────────────────────────────────────────────────────

num(31, {
    'title': 'The War Against Midian: Covenant Justice and Its Aftermath',
    'sections': [
        {
            'header': 'Verses 1–24 — The Midianite War; Balaam\'s Death',
            'verses': verse_range(1, 24),
            'heb': [
                ('neqam', 'neqam', 'vengeance / covenant justice', 'The war against Midian is explicitly framed as divine neqam (vengeance / retributive justice) for the Baal Peor seduction. This is not ethnic warfare but covenant justice: Midian attacked Israel\'s covenant faithfulness through religious-sexual seduction, and the response is proportional covenant judgment.'),
            ],
            'ctx': 'Numbers 31 executes the command of Num 25:17-18: war against Midian for the Baal Peor seduction. Israel defeats Midian, killing all the men including five Midianite kings and Balaam. Moses is furious that the women were spared — they were the Peor seduction\'s agents (v.16). Only the virgin girls are spared. The chapter provides extensive purity requirements for returning soldiers and a detailed spoil-distribution formula. The war\'s theological purpose is the elimination of the specific religious-sexual threat that nearly destroyed Israel at Peor.',
            'cross': [
                ('Rev 19:11-15', '"I saw heaven standing open and there before me was a white horse, whose rider is called Faithful and True. With justice he judges and wages war." The divine-warrior imagery of Num 31 finds its eschatological fulfilment — covenant warfare reaches its ultimate expression.'),
                ('Num 25:17-18', '"Treat the Midianites as enemies and kill them, because they treated you as enemies when they deceived you in the Peor incident." The Midianite war executes this specific command — it is not impulsive violence but the fulfilment of a covenant instruction.'),
            ],
            'mac': [
                ('31:1-8', 'MacArthur: The Midianite war\'s theological rationale — covenant justice for the Baal Peor seduction — is established in Num 25:17-18. The war is not ethnic aggression but the execution of a specific divine command in response to a specific covenant attack. Balaam\'s death (v.8) confirms his role: the oracle-seller who counselled Israel\'s destruction perishes by the sword of the people he tried to destroy.'),
                ('31:19-24', 'MacArthur: The purification requirements for returning soldiers apply the red heifer theology of Num 19 to a military context. Even justified warfare creates impurity; even covenant justice requires subsequent purification. The warrior who kills for God must still be cleansed before re-entering the covenant community.'),
            ],
            'milgrom': [
                ('31:14-18', 'Milgrom: Moses\'s fury at the returning soldiers for sparing the women is grounded in v.16: "They were the ones who followed Balaam\'s advice and enticed the Israelites to be unfaithful to the Lord in the Peor incident." The women who survived were the specific agents of the seduction that killed 24,000 Israelites.'),
            ],
            'ashley': [
                ('31:1-2', 'Ashley: "The Lord said to Moses, \'Take vengeance on the Midianites for the Israelites.\'" The divine first-person command grounds the war in covenant justice, not human aggression. The chapter is morally uncomfortable for modern readers, but the war is a direct response to a direct covenant attack, executed under explicit divine command.'),
            ],
            'sarna': [
                ('31:7-8', 'Sarna: "They fought against Midian, as the Lord commanded Moses, and killed every man. Among their victims were Evi, Rekem, Zur, Hur and Reba — the five kings of Midian. They also killed Balaam son of Beor with the sword." Balaam\'s death closes the theological loop of chs.22-25: the prophet who counselled Israel\'s destruction perishes in the war his counsel provoked.'),
            ],
            'alter': [
                ('31:14-16', 'Alter: Moses\'s anger at the returning soldiers — "Have you allowed all the women to live?" — is the chapter\'s moral centre. The women Moses condemns are specifically the Peor agents. His anger is not bloodthirst but covenant consistency: the war was for elimination of the specific threat; returning with that threat intact defeats the war\'s purpose.'),
            ],
            'calvin': [
                ('31:1-2', 'Calvin: The Midianite war is a covenant war — commanded by God, executed for covenant justice, subject to covenant rules (purification required even for justified killing). The NT does not sanction holy war for the church; the covenant community\'s warfare is now spiritual (Eph 6:10-18), not military.'),
            ],
            'netbible': [
                ('31:16', 'NET Note: "They were the ones who followed Balaam\'s advice and enticed the Israelites to be unfaithful to the Lord in the Peor incident" — Balaam\'s role in the Baal Peor seduction, only hinted at in Num 25, is made explicit here. Balaam could not curse Israel prophetically, so he devised a strategy of seduction (cf. Rev 2:14).'),
            ],
        },
        {
            'header': 'Verses 25–54 — Division of Spoil; the Warrior\'s Offering',
            'verses': verse_range(25, 54),
            'heb': [
                ('kipper', 'kipper', 'make atonement / atone for', 'The voluntary warrior\'s offering (vv.48-54) is described as making atonement — unusual since no specific sin is confessed. The atonement appears to be a general acknowledgment that even covenant warriors who survived a divinely commanded war stand before God in need of his mercy, not self-congratulation.'),
            ],
            'ctx': 'The spoil division (vv.25-47) distributes equally between soldiers and community, with a levy from each half going to the Lord (via priests and Levites). The warriors\' voluntary additional offering (vv.48-54) — 16,750 shekels of gold jewellery — is given because not one Israelite soldier died in the battle (v.49). The offering is presented as atonement and memorial. The war\'s final accounting is theological: the community received everything; not one life was lost; the gold offering acknowledges that God fought for them.',
            'cross': [
                ('2 Sam 8:11-12', '"King David dedicated these articles to the Lord, as he had done with the silver and gold from all the nations he had subdued." David\'s practice of consecrating war spoil reflects the principle established in the warrior\'s offering of Num 31.'),
                ('1 Sam 30:24', '"The share of the man who stayed with the supplies is to be the same as that of him who went down to the battle." David codifies the equal-spoil-distribution principle of Num 31:27.'),
            ],
            'mac': [
                ('31:48-54', 'MacArthur: The voluntary gold offering of 16,750 shekels — given because not one Israelite soldier died — is one of Numbers\' most theologically significant moments. The officers acknowledge the victory was not their achievement: "to make atonement for ourselves before the Lord." Even legitimate warfare requires atonement; even a divinely commanded victory is received with humility.'),
            ],
            'milgrom': [
                ('31:25-47', 'Milgrom: The equal division of spoil (half to soldiers, half to community) with proportional levies to the Lord is a sophisticated covenant economic arrangement. The soldiers who risk their lives receive no more than those who stayed behind — the principle of equal covenant benefit regardless of role.'),
            ],
            'ashley': [
                ('31:49', 'Ashley: "Not one of us is missing" — the chapter\'s theological summit. The entire military force returned alive from a war against five kings. The miraculous preservation was not the soldiers\' achievement; it was God\'s. The gold offering acknowledges this: atonement for themselves, because they know the victory was not their doing.'),
            ],
            'sarna': [
                ('31:50', 'Sarna: The specific list of jewellery items — armbands, bracelets, signet rings, earrings, necklaces — is the most detailed inventory of personal adornment in Numbers. The voluntary offering of personal jewellery that came through Midianite women is simultaneously a material gift and a symbolic purification from the seduction.'),
            ],
            'alter': [
                ('31:49', 'Alter: "Your servants have counted the soldiers under our command, and not one is missing." After the complex moral difficulties of the Midianite war, this single sentence of complete divine protection reorients everything: God kept faith with his covenant army. Not one life lost. The gold offering is the only appropriate response to such preservation.'),
            ],
            'calvin': [
                ('31:48-54', 'Calvin: The warriors\' voluntary offering — acknowledging that even a divinely commanded war requires atonement — models the principle that proximity to legitimate violence requires cleansing before God. The Christian\'s entire life requires continuous covenant cleansing, not because warfare is inherently sinful, but because every human act stands under God\'s holiness.'),
            ],
            'netbible': [
                ('31:50', 'NET Note: "To make atonement for ourselves before the Lord" — the voluntary gold offering is described as atonement (kipper) with no specific sin stated. The atonement appears to be a general acknowledgment: even covenant warriors who survived a divinely commanded war stand before God in need of his mercy rather than self-congratulation.'),
            ],
        },
    ],
})

num(32, {
    'title': 'The Transjordan Tribes: Settlement Before the Jordan Crossing',
    'sections': [
        {
            'header': 'Verses 1–27 — Reuben and Gad\'s Request; Moses\'s Rebuke and Negotiation',
            'verses': verse_range(1, 27),
            'heb': [
                ('pen-teniu et-lev', "pen-teniu et-lev", 'lest you discourage the hearts', 'Moses\'s initial rebuke invokes the Kadesh crisis: if Reuben and Gad settle east of the Jordan before the conquest, the rest of Israel will lose heart — just as the spy report discouraged the previous generation. The echo of Num 13-14 is intentional and pointed.'),
            ],
            'ctx': 'Reuben, Gad, and half-Manasseh have large livestock herds and find the east-Jordan territories ideal. They request to settle there rather than crossing into Canaan. Moses\'s reaction invokes the spy crisis: "Should your fellow Israelites go to war while you sit here?" The tribes propose a compromise: their families settle in east-Jordan cities, but all fighting men cross with Israel and fight until every tribe has its inheritance. Moses accepts with a conditional oath: fulfil the military obligation, receive the east-Jordan land; fail, receive inheritance in Canaan like everyone else.',
            'cross': [
                ('Josh 22:1-4', '"Then Joshua summoned the Reubenites, the Gadites and the half-tribe of Manasseh and said to them, \'You have done all that Moses the servant of the Lord commanded, and you have obeyed me in everything I commanded.\'" The Num 32 commitment is honoured completely in Joshua.'),
                ('Heb 6:12', '"We do not want you to become lazy, but to imitate those who through faith and patience inherit what has been promised." The east-Jordan tribes\' commitment (fight first, then inherit) models the principle that covenant inheritance requires active participation in the community\'s mission.'),
            ],
            'mac': [
                ('32:6-9', 'MacArthur: Moses\'s invocation of the Kadesh crisis — "Why do you want to discourage the Israelites from crossing over?" — reveals his awareness that the new generation could repeat the old generation\'s failure. Covenant leadership means watching for the patterns that have destroyed communities before and naming them before they repeat.'),
                ('32:20-24', 'MacArthur: The conditional oath Moses extracts models the principle of corporate covenant obligation. Personal settlement does not release individuals from community responsibility. The east-Jordan tribes cannot enjoy their inheritance while their brothers fight without them.'),
            ],
            'milgrom': [
                ('32:6-15', 'Milgrom: Moses\'s extensive rehearsal of the Kadesh crisis (vv.6-15) is a direct accusation: "you are doing what your fathers did." The new generation, standing at the threshold of the promised land, is about to repeat the old generation\'s fatal self-interest. The Reubenite/Gadite proposal must be reframed before it destroys the community\'s momentum.'),
            ],
            'ashley': [
                ('32:16-19', 'Ashley: The tribes\' counter-proposal — "we will build pens for our livestock and cities for our women and children, but we will arm ourselves and go ahead of the Israelites" — transforms a potentially self-serving request into a covenantal contribution. They will go ahead (before the Israelites), not merely alongside. The proposal becomes an act of covenant leadership.'),
            ],
            'sarna': [
                ('32:1', 'Sarna: "The Reubenites and Gadites, who had very large herds and flocks, saw that the lands of Jazer and Gilead were suitable for livestock." Economic observation is not sin — the problem is the potential covenant consequence of acting on it without considering community obligations.'),
            ],
            'alter': [
                ('32:16-17', 'Alter: The tribes\' offer is carefully worded: families stay behind (Moses\'s concern addressed) but warriors go ahead (his deeper concern — military desertion — addressed). The negotiation produces a covenant-consistent solution to a legitimate need. Both parties\' concerns are resolved without compromising covenant obligations.'),
            ],
            'calvin': [
                ('32:6-9', 'Calvin: Moses\'s rebuke models the responsibility of covenant leaders to interrupt potentially catastrophic patterns. The Reubenite and Gadite request, however reasonable in livestock terms, could become the new spy crisis if not properly negotiated. Moses has seen this story before and will not let it repeat.'),
            ],
            'netbible': [
                ('32:17', 'NET Note: "We will arm ourselves quickly and go ahead of the Israelites" — the word "quickly" (chushim) emphasises urgency. The tribes are not looking for an excuse to delay; they are volunteering to be the vanguard. This reframes their request entirely: not "let us stay behind" but "let us go first, so we can return to our families."'),
            ],
        },
        {
            'header': 'Verses 28–42 — The Agreement Formalised; the Transjordan Settlement',
            'verses': verse_range(28, 42),
            'heb': [
                ('im-lo yaavru chaluzim', "im-lo yaavru chaluzim ittechem", 'if they do not cross over armed with you', 'The conditional clause of the oath — if the tribes fail to cross with the armed force, the east-Jordan settlement is forfeit and they receive their inheritance in Canaan. The condition is public, specific, and enforceable.'),
            ],
            'ctx': 'Moses formalises the agreement before Eleazar, Joshua, and the tribal leaders — ensuring it survives his death. The conditional terms are clear: cross armed with Israel, fight until the land is subdued, then return to the east-Jordan inheritance. Failure means Canaan inheritance with everyone else. The chapter closes with the cities being built and additional Manassite territories conquered. The Transjordan settlement begins; the covenant agreement is in force.',
            'cross': [
                ('Josh 1:12-15', '"But to the Reubenites, the Gadites and the half-tribe of Manasseh, Joshua said, \'Remember the command that Moses the servant of the Lord gave you...\'" Joshua enforces the Num 32 agreement at the Jordan crossing.'),
                ('Josh 22:2-3', '"You have kept all that Moses the servant of the Lord commanded you. You have obeyed me in everything I commanded. For a long time now you have not deserted your fellow Israelites but have carried out the mission the Lord your God gave you."'),
            ],
            'mac': [
                ('32:28-32', 'MacArthur: The formalisation before Eleazar and Joshua ensures continuity beyond Moses\'s death. The agreement becomes institutionally binding — not dependent on Moses\'s personal authority but embedded in the covenant community\'s public record. Commitments that extend beyond an individual\'s lifetime must be publicly witnessed and institutionally embedded.'),
            ],
            'milgrom': [
                ('32:33-42', 'Milgrom: The rebuilding of cities begins immediately after the agreement is formalised — before the fighting men cross the Jordan. The families need settled, defensible cities while the warriors are away. The practical urgency confirms that the east-Jordan settlement was not a fantasy but a carefully planned covenant arrangement.'),
            ],
            'ashley': [
                ('32:28-32', 'Ashley: The agreement\'s formalisation ensures that no future generation can claim the east-Jordan tribes settled without covenant basis. Their legitimacy within the covenant community is publicly established — they are not deserters but warriors who fulfilled their obligations and then received their promised portion.'),
            ],
            'sarna': [
                ('32:33', 'Sarna: The addition of half-Manasseh to the Reuben and Gad agreement — introduced without prior mention in the negotiations — reflects Manasseh\'s military successes in Gilead (vv.39-42). The covenant arrangement is flexible enough to accommodate additional participants whose contributions earn them a share.'),
            ],
            'alter': [
                ('32:29-30', 'Alter: Moses\'s conditional oath is the most precise covenant conditional in Numbers. The condition is fair, the alternatives are clear, the enforcement is public. The covenant community\'s social contract is expressed with legal exactitude.'),
            ],
            'calvin': [
                ('32:28-42', 'Calvin: The Transjordan settlement models the principle that geographic separation does not release covenant community members from shared obligations. The east-Jordan tribes\' families live in a different land; their warriors fight on the western side of the Jordan. Physical distance does not dissolve covenant solidarity.'),
            ],
            'netbible': [
                ('32:33', 'NET Note: "Then Moses gave to the Gadites, the Reubenites, and the half-tribe of Manasseh... the kingdom of Sihon king of the Amorites and the kingdom of Og king of Bashan" — the territories given are the recently conquered kingdoms of Num 21. The east-Jordan settlement is built on Israel\'s military victories, not on dispossessing a non-hostile people.'),
            ],
        },
    ],
})

num(33, {
    'title': 'The Wilderness Itinerary: Forty Years in Forty-Two Stages',
    'sections': [
        {
            'header': 'Verses 1–49 — The Journey from Egypt to Moab',
            'verses': verse_range(1, 49),
            'heb': [
                ('massa', "massa", 'journey / stage / setting out', 'Each wilderness stop is a massa — a journey-stage, a setting-out. The word occurs 42 times in the itinerary, once for each stage. The wilderness is not a featureless void but a sequence of precisely remembered divine appointments. Each campsite is a moment in God\'s covenant choreography.'),
            ],
            'ctx': 'Numbers 33 is the Torah\'s wilderness travel log — 42 campsite names from Rameses to the plains of Moab. The list names places mentioned elsewhere in Exodus-Numbers and many mentioned nowhere else. Theologically, it proves that God\'s forty-year custody of Israel was precise, intentional, and remembered. Not a single stage is unnamed or forgotten. The wilderness was not chaos but a divinely orchestrated sequence of divine meetings. The chapter closes (vv.50-56) with the conquest command: drive out the inhabitants, destroy their religious sites, possess the land by lot.',
            'cross': [
                ('Acts 7:36-38', '"He led them out of Egypt and performed wonders and signs in Egypt, at the Red Sea and for forty years in the wilderness." Stephen\'s speech summarises the wilderness period as a single, divinely led journey — the same theology of the Num 33 itinerary.'),
                ('Heb 3:7-4:2', 'The writer of Hebrews interprets the wilderness journey as a warning pattern for the NT community — the places of failure (Meribah, Kadesh) are the itinerary\'s theological landmarks.'),
            ],
            'mac': [
                ('33:1-2', 'MacArthur: "Moses recorded the stages in their journey at the Lord\'s command." The itinerary is divine historical record, not human memoir. Every campsite name is a divine acknowledgment: Israel was there, God was there with them. The wilderness was not formless suffering but a precisely remembered sequence of divine accompaniment.'),
                ('33:3-9', 'MacArthur: The itinerary begins at Rameses on the fifteenth of Nisan, "while the Egyptians were burying all their firstborn." The departure is timed against Egypt\'s grief. Every Israelite reading this itinerary knows its first step: from the land of death, on the morning after redemption.'),
            ],
            'milgrom': [
                ('33:1-9', 'Milgrom: The wilderness itinerary is a priestly compilation of genuine historical records — an administrative travel log preserved because it documented the covenant community\'s actual journey under God\'s guidance. The comprehensiveness and detail argue against literary invention; the precision argues for genuine archival material.'),
            ],
            'ashley': [
                ('33:1-49', 'Ashley: The itinerary\'s 42 stages has attracted symbolic interpretation: 42 is 6 times 7 (the number before completion). Whether or not this is the compiler\'s intent, the list presents Israel\'s wilderness journey as a precisely bounded, divinely completed sequence — not chaotic wandering but purposeful formation.'),
            ],
            'sarna': [
                ('33:2', 'Sarna: "Moses recorded the stages in their journey at the Lord\'s command" — the divine command to record establishes the itinerary\'s authority. This is the official covenant community\'s record of its formative journey. The wilderness years are not to be blurred into generic suffering; they are to be precisely remembered as the specific locations of God\'s faithfulness.'),
            ],
            'alter': [
                ('33:3-9', 'Alter: The itinerary\'s opening — "They set out from Rameses on the fifteenth day of the first month, the day after the Passover, marching out defiantly while all the Egyptians were burying their firstborn" — is one of the most cinematically powerful sentences in Numbers. The contrast is total: Egypt buries its dead; Israel marches out boldly. The wilderness journey begins at Egypt\'s maximum grief and Israel\'s maximum deliverance.'),
            ],
            'calvin': [
                ('33:1-49', 'Calvin: The divine command to record the itinerary teaches that God\'s guidance of his people through difficult times is meant to be remembered. The wilderness journey — with all its failures and faithful provisions — is not to be forgotten but documented. "Do this in remembrance of me" (Luke 22:19); "Remember what you were taught" (Col 3:16). The covenant community\'s history is covenant theology.'),
            ],
            'netbible': [
                ('33:3', 'NET Note: "They marched out boldly in plain view of all the Egyptians" — literally "with a high hand" (beyad ramah), the same phrase as Exod 14:8 for Israel\'s departure. The "high hand" of covenant courage here contrasts with the "high hand" of covenant defiance in Num 15:30. The same posture can express either covenant courage or covenant arrogance.'),
            ],
        },
        {
            'header': 'Verses 50–56 — The Conquest Command: Drive Out the Inhabitants',
            'verses': verse_range(50, 56),
            'heb': [
                ('wehorashtem et-kol-yoshvei ha\'aretz', "wehorashtem kol yoshvei", 'you shall drive out all the inhabitants of the land', 'The conquest command issued at the journey\'s end — remove the Canaanite religious infrastructure (carved images, molten idols, high places) and possess the land by divine assignment. The command is comprehensive and non-negotiable.'),
            ],
            'ctx': 'The wilderness itinerary closes (v.49) and immediately the conquest command issues (vv.50-56): drive out all inhabitants, destroy their religious sites, take possession by lot. The warning is pointed: if the inhabitants are not driven out, those who remain will become "barbs in your eyes and thorns in your sides." The land belongs to God; he is giving it to Israel; Israel must receive it on his terms. Incomplete obedience will produce incomplete blessing — the Judges narrative will prove this with devastating thoroughness.',
            'cross': [
                ('Judg 2:1-3', '"I said, \'I will never break my covenant with you, and you shall not make a covenant with the people of this land...\' But you have disobeyed me. Why have you done this? And I have also said, \'They will become traps for you, and their gods will become snares to you.\'" Judges fulfils the Num 33:55 warning exactly.'),
                ('2 Cor 10:3-5', '"For though we live in the world, we do not wage war as the world does... We demolish arguments and every pretension that sets itself up against the knowledge of God." Paul\'s spiritual warfare language echoes the Num 33 conquest command, applied to the Christian\'s interior conquest of opposing thought.'),
            ],
            'mac': [
                ('33:51-53', 'MacArthur: The conquest command is comprehensive: drive out all inhabitants, destroy all idolatrous infrastructure (carved images, molten idols, high places), take possession of the land. The comprehensiveness is necessary — partial obedience in a covenant war produces the Judges narrative: the inhabitants who remain become exactly the "thorns and barbs" the warning predicted.'),
                ('33:55-56', 'MacArthur: "Those you allow to remain will become barbs in your eyes and thorns in your sides." Barbs in the eyes impair vision; thorns in the side cause constant pain. Tolerated Canaanite religious presence will distort Israel\'s spiritual vision and create perpetual covenantal discomfort. The Judges narrative proves this warning with precise historical fulfilment.'),
            ],
            'milgrom': [
                ('33:50-56', 'Milgrom: The conquest command\'s placement at the end of the wilderness itinerary is theologically deliberate: the 42-stage journey through the wilderness has been preparation for this moment. Israel arrives as a community formed by divine guidance, not as a newly assembled army. The formation precedes the command.'),
            ],
            'ashley': [
                ('33:51-56', 'Ashley: The command to destroy Canaanite religious infrastructure before addressing people\'s residences is significant: the religious threat is addressed first, the social reality second. The Canaanite cult — not the Canaanite people per se — is the primary danger to Israel\'s covenant faithfulness. The conquest is a religious act as much as a military one.'),
            ],
            'sarna': [
                ('33:55', 'Sarna: "Those you allow to remain will become barbs in your eyes and thorns in your sides" — the agricultural metaphors evoke the curse of Gen 3:18 ("thorns and thistles it will produce for you"). The Canaanite residue in the land will reproduce the curse-dynamic in Israel\'s covenantal experience.'),
            ],
            'alter': [
                ('33:52-53', 'Alter: The destruction command targets three categories of Canaanite religious presence: the portable (carved images), the cast (molten idols), and the architectural (high places). The comprehensiveness ensures that no category of Canaanite religious infrastructure survives to contaminate Israel\'s covenant worship.'),
            ],
            'calvin': [
                ('33:55', 'Calvin: The warning — "those you allow to remain will become thorns in your sides" — is the OT\'s clearest statement that incomplete sanctification produces ongoing spiritual suffering. The Christian who tolerates sin does not achieve stable compromise but chronic spiritual impairment. The thorns and barbs of incomplete obedience are more costly than the initial discomfort of complete surrender.'),
            ],
            'netbible': [
                ('33:52', 'NET Note: "Demolish all their high places" (bamot) — open-air shrines used for Canaanite worship. Israelite history confirms that every preserved high place became a site of syncretism — the prophets and reforming kings repeatedly address the high places as the persistent source of Israelite apostasy.'),
            ],
        },
    ],
})

num(34, {
    'title': 'The Boundaries of the Promised Land',
    'sections': [
        {
            'header': 'Verses 1–15 — The Four Boundaries of Canaan',
            'verses': verse_range(1, 15),
            'heb': [
                ('gevul', 'gevul', 'border / boundary / territory', 'The word that structures the entire chapter — appears 14 times. The land\'s boundaries are divinely specified with geographic precision: southern boundary (Negev and Sinai), western boundary (Mediterranean coast), northern boundary (Lebo Hamath), eastern boundary (Jordan River and Sea of Kinnereth).'),
            ],
            'ctx': 'Numbers 34 provides the geographical boundaries of the promised land — specification unique in its geographic precision. The boundaries define the territory between the Jordan River (east), the Mediterranean (west), Lebo Hamath (north), and the Negev and Sinai (south). The east-Jordan territory already assigned to Reuben, Gad, and Manasseh is explicitly noted as outside these boundaries (vv.14-15). The land God promises has specific, mappable boundaries that are both theological (this is what I am giving you) and practical (this is what you must take).',
            'cross': [
                ('Gen 15:18-21', '"On that day the Lord made a covenant with Abram and said, \'To your descendants I give this land, from the Wadi of Egypt to the great river, the Euphrates.\'" The Num 34 boundaries are the practical territorial specification of the Abrahamic land promise.'),
                ('Josh 13:1-7', '"When Joshua had grown old, the Lord said to him, \'You are now very old, and there are still very large areas of land to be taken over.\'" The Num 34 boundaries were not fully possessed in Joshua\'s lifetime — the land promise extends beyond the conquest generation.'),
            ],
            'mac': [
                ('34:1-12', 'MacArthur: The specific boundary descriptions — named wadis, mountains, cities, seas — ground the land promise in concrete geography. This is not a vague spiritual blessing but a specific, mappable territory. God\'s promises are not abstractions; they are attached to specific realities that can be traced on a map. The theological truth is expressed through geographical precision.'),
                ('34:13-15', 'MacArthur: The explicit exclusion of the east-Jordan territories from the Canaan boundaries confirms that the Reuben and Gad and Manasseh settlement was a legitimate covenant arrangement, not a second-class inheritance. All Israel has its inheritance; the boundaries distinguish which territory belongs to which part of the community.'),
            ],
            'milgrom': [
                ('34:1-12', 'Milgrom: The land boundaries of Num 34 correspond closely to the Egyptian administrative province of Canaan in the Late Bronze Age (c.1550-1200 BC). This archaeological correlation supports the antiquity of the boundary descriptions and their rooting in genuine historical-geographical knowledge rather than later literary invention.'),
            ],
            'ashley': [
                ('34:1-12', 'Ashley: The precision of the land boundaries is itself a theological statement: the promised land is a real place, not a spiritual metaphor. God does not promise Israel vague spiritual abundance; he promises specific geography. The boundary descriptions ground the covenant promise in verifiable, tangible reality — the same theological move as the incarnation.'),
            ],
            'sarna': [
                ('34:6', 'Sarna: "Your western boundary will be the coast of the Mediterranean Sea. This will be your boundary on the west." The Mediterranean as the western boundary is one of the covenant\'s most enduring geographical markers. The sea that Israel never crossed (in the sense of colonising) is the consistent western edge of the divine gift.'),
            ],
            'alter': [
                ('34:1-12', 'Alter: The boundary chapter\'s detailed geographical specifications are Numbers at its most administrative. But the administrative detail is the theological content: God knows every wadi, every mountain pass, every city that marks the edge of his gift. The land that Israel is about to receive is a specific place that God knows precisely and gives intentionally.'),
            ],
            'calvin': [
                ('34:1-12', 'Calvin: The specific land boundaries teach that God\'s gifts are particular, not generic. He does not give Israel "land" in the abstract; he gives these boundaries, this territory. The NT equivalent: God does not give believers vague spiritual blessing but specific gifts (1 Cor 12:7-11), specific callings (Eph 4:11), specific communities (Acts 2:47). God\'s grace is always particular.'),
            ],
            'netbible': [
                ('34:3', 'NET Note: "Your southern side will include some of the Desert of Zin along the border of Edom" — the Negev and Sinai boundary marks the edge of the territory Israel will receive as gift. The territory south of this line — through which Israel wandered for forty years — is not part of the promise. The wilderness is formation; Canaan is destination.'),
            ],
        },
        {
            'header': 'Verses 16–29 — The Land Distribution Leaders',
            'verses': verse_range(16, 29),
            'heb': [
                ('nesi\'im', "nesi'im", 'leaders / princes / chieftains', 'The same term as in Num 1-2 for the tribal census leaders. Now the same tribal authority structure is commissioned for land distribution. The covenant community\'s administrative structure — established at Sinai — functions across the generational transition.'),
            ],
            'ctx': 'God appoints the men who will administer the land distribution: Eleazar (high priest) and Joshua (military leader) as co-administrators, plus one designated leader from each of the ten tribes receiving Canaan inheritance (Reuben, Gad, and half-Manasseh already have their east-Jordan portions). The list parallels the census leaders of Num 1 but with entirely different men — the Num 1 leaders have all died. New leaders for a new generation, tasked with distributing the gift their parents forfeited.',
            'cross': [
                ('Josh 14:1', '"These are the areas the Israelites received as an inheritance in the land of Canaan, which Eleazar the priest, Joshua son of Nun and the heads of the tribal clans of Israel allotted to them." The Num 34 appointment is fulfilled precisely in Joshua.'),
                ('Acts 1:26', '"Then they cast lots, and the lot fell to Matthias; so he was added to the eleven apostles." The NT parallel: new leaders appointed by divine guidance for the new covenant community\'s governance.'),
            ],
            'mac': [
                ('34:16-29', 'MacArthur: The appointment of specific men for land distribution ensures accountability and transparency. The land allocation is not left to improvisation or military spoils; it is administered by named, appointed, publicly known leaders. The covenant community\'s inheritance is distributed with the same administrative care as its census and its offerings.'),
            ],
            'milgrom': [
                ('34:17', 'Milgrom: Eleazar and Joshua as co-administrators reflect the dual authority structure throughout Numbers: the priestly dimension (Eleazar) ensures the land distribution honours the covenant\'s sacred character; the military dimension (Joshua) ensures practical administrative competence. Neither alone suffices.'),
            ],
            'ashley': [
                ('34:16-29', 'Ashley: The appointment of new distribution leaders from the new generation is a sign of covenant continuity across the generational transition. The administrative structure that organised the wilderness generation continues into the settlement generation. The covenant community\'s institutional memory survives the forty-year interruption.'),
            ],
            'sarna': [
                ('34:17', 'Sarna: "Eleazar the priest and Joshua son of Nun" — the pairing of priest and civil leader mirrors the pairing of Aaron and Moses for the wilderness generation. The covenant community always requires both dimensions of leadership: the priestly (representing the covenant\'s sacred character) and the civil and military (representing its practical governance).'),
            ],
            'alter': [
                ('34:16-29', 'Alter: The list of distribution leaders replicates the structure of Num 1\'s census leaders. The repetition of the leadership-list form signals continuity: the covenant community\'s governance structure is preserved across the generational transition. The form is the same; the names are all new.'),
            ],
            'calvin': [
                ('34:16-29', 'Calvin: The appointment of specific, accountable leaders for land distribution models the principle that God\'s gifts to the community require careful, accountable administration. The land is God\'s gift; its distribution must honour that gift through ordered, just administration — as must the church\'s administration of material and spiritual gifts.'),
            ],
            'netbible': [
                ('34:29', 'NET Note: "These are the men the Lord commanded to assign the inheritance to the Israelites in the land of Canaan" — the divine passive confirms that the distribution leaders are God\'s appointees, not tribal political selections. The land that belongs to God is distributed by leaders he has designated.'),
            ],
        },
    ],
})

num(35, {
    'title': 'Cities of Refuge: The Levitical Towns and the Law of Homicide',
    'sections': [
        {
            'header': 'Verses 1–15 — Levitical Towns and the Six Cities of Refuge',
            'verses': verse_range(1, 15),
            'heb': [
                ('ir miqlet', 'ir miklat', 'city of refuge / city of asylum', 'From kalat (to absorb, take in). The six cities of refuge provide asylum for the unintentional killer against the goel hadam (avenger of blood / nearest kinsman). The city of refuge is not an amnesty for murder but a haven from blood vengeance for those who kill without intent.'),
                ('goel hadam', 'goel hadam', 'avenger of blood / redeemer of blood / kinsman-redeemer', 'The nearest male relative who had both the right and the obligation to avenge a murdered kinsman. The cities of refuge provide a legal check on the goel\'s vengeance by distinguishing murder (no refuge) from manslaughter (refuge available).'),
            ],
            'ctx': 'Numbers 35 addresses two interconnected provisions: the Levitical towns (vv.1-8) and the cities of refuge (vv.9-34). Since the Levites receive no land inheritance, 48 towns with surrounding pastureland are distributed among them from each tribe\'s territory. Six of these 48 are designated cities of refuge — three on each side of the Jordan, accessible to any unintentional killer (Israelite, resident alien, or foreigner). The city of refuge provides asylum until the high priest\'s death; the killer may then return home without fear of the blood avenger. The chapter closes with the principle that blood defiles the land, and only the killer\'s blood can purge that defilement.',
            'cross': [
                ('Josh 20:7-9', '"So they set apart Kedesh in Galilee in the hill country of Naphtali, Shechem in the hill country of Ephraim, and Kiriath Arba (that is, Hebron) in the hill country of Judah... These towns were designated for all the Israelites and for the foreigners residing among them." The Num 35 command is fulfilled in Joshua.'),
                ('Heb 6:18-20', '"We who have fled to take hold of the hope set before us may be greatly encouraged. We have this hope as an anchor for the soul, firm and secure. It enters the inner sanctuary behind the curtain, where our forerunner, Jesus, has entered on our behalf." The writer of Hebrews applies the city of refuge imagery to Christ — the believer fleeing to him for refuge finds safety in the inner sanctuary he has opened.'),
            ],
            'mac': [
                ('35:1-8', 'MacArthur: The Levitical towns distribute the priestly tribe throughout Israel\'s territory — ensuring that every region has access to priestly teaching and ministry. The Levites without land serve as the covenant community\'s distributed pastoral infrastructure. No Israelite lives too far from Levitical presence and instruction.'),
                ('35:9-15', 'MacArthur: The six cities of refuge — three on each side of the Jordan, accessible to all — reflect the covenant\'s concern for justice that distinguishes murder from manslaughter. The blood-avenger system, left unchecked, could execute the innocent (those who killed unintentionally). The cities provide a legal mechanism for determining guilt before the execution of justice.'),
            ],
            'milgrom': [
                ('35:9-15', 'Milgrom: The cities of refuge are accessible to resident aliens and foreigners as well as Israelites — covenant justice is not ethnically restricted. Anyone who kills unintentionally deserves the protection of legal process. The inclusion of non-Israelites reflects the covenant\'s underlying principle that justice is universal, not tribal.'),
                ('35:28', 'Milgrom: "The accused must stay in his city of refuge until the death of the high priest; only after the death of the high priest may he return to his own property." The high priest\'s death serves as a kind of general amnesty — the most significant interpretive question is why. Milgrom\'s answer: the high priest\'s death expiates the blood-guilt of his generation, allowing those in the cities of refuge to return clean.'),
            ],
            'ashley': [
                ('35:9-15', 'Ashley: The six cities of refuge reflect the covenant\'s recognition that human society inevitably produces unintentional killing. The law does not pretend this can be eliminated; it provides a legal institution for managing it justly. The covenant law is realistic about human fallibility and pastoral in its provision for those caught in its consequences.'),
            ],
            'sarna': [
                ('35:6', 'Sarna: "Among the towns you give the Levites there are to be six cities of refuge, to which a person who has killed someone may flee." Six of the 48 Levitical towns become cities of refuge — the priestly infrastructure serves the function of legal asylum as well as religious instruction. The overlap of priestly and judicial functions is consistent with the Levitical vocation throughout Numbers.'),
            ],
            'alter': [
                ('35:9-15', 'Alter: The cities of refuge are equally distributed — three on each side of the Jordan — ensuring geographic accessibility. No unintentional killer should have to travel so far that the blood avenger overtakes them before they reach safety. The legal institution is designed to be practically accessible, not merely theoretically available.'),
            ],
            'calvin': [
                ('35:9-15', 'Calvin: The cities of refuge provided to unintentional killers model the principle of mercy within justice. The law distinguishes between murder (which cannot be redeemed by flight) and manslaughter (which can). Calvin sees in this distinction a type of the gospel: the gospel does not excuse all sin indiscriminately but provides a refuge for the repentant who have sinned without full deliberate intent against God\'s covenant.'),
            ],
            'netbible': [
                ('35:15', 'NET Note: "These six towns will be a place of refuge for Israelites and for foreigners and temporary residents among them, so that anyone who has killed another person accidentally may flee there." The three-fold inclusion — Israelites, foreigners, temporary residents — makes the cities of refuge the most universally accessible legal institution in the Torah. The city of refuge knows no ethnic restriction.'),
            ],
        },
        {
            'header': 'Verses 16–34 — Murder vs Manslaughter; Blood Defiles the Land',
            'verses': verse_range(16, 34),
            'heb': [
                ('betzad', 'betzad', 'intentionally / with premeditation / designedly', 'The key distinguishing term between murder (premeditated, intentional) and manslaughter (accidental). The cities of refuge provide asylum for the belo-da\'at (without knowledge/intent) killer; the intentional murderer finds no refuge and must die.'),
            ],
            'ctx': 'The homicide law (vv.16-34) distinguishes murder from manslaughter through four criteria: the weapon used (iron, stone, or wood capable of killing — vv.16-18), the relationship (lying in wait or enmity — v.20), the prior relationship (hatred — v.20-21), and the circumstances (sudden, without enmity, without seeing — vv.22-23). The congregation adjudicates the case; the city of refuge provides sanctuary pending trial. The chapter closes with the land-defilement principle (vv.33-34): blood defiles the land, and only the killer\'s blood expiates blood-guilt. The land cannot be purged of blood except by the blood of the one who shed it.',
            'cross': [
                ('Matt 5:21-22', '"You have heard that it was said to the people long ago, \'You shall not murder.\' But I tell you that anyone who is angry with a brother or sister will be subject to judgment." Jesus extends the Num 35 murder category to include the anger and contempt that produce murder — the NT interiorises the OT distinction.'),
                ('Rom 13:4', '"For the one in authority is God\'s servant for your good. But if you do wrong, be afraid, for rulers do not bear the sword for no reason." Paul\'s affirmation of capital punishment for murder reflects the Num 35 principle that intentional killing requires the ultimate sanction.'),
            ],
            'mac': [
                ('35:16-21', 'MacArthur: The homicide law\'s criteria for distinguishing murder from manslaughter — weapon type, prior relationship, lying in wait, acting from hatred — reflect sophisticated legal reasoning. The Torah is not a simplistic blood-vengeance code but a nuanced legal system that protects the innocent from vigilante justice while ensuring that genuine murder receives its proper consequence.'),
                ('35:33-34', 'MacArthur: "Do not pollute the land where you are. Bloodshed pollutes the land, and atonement cannot be made for the land on which blood has been shed, except by the blood of the one who shed it." The land-defilement principle reflects the covenant\'s understanding that the created order participates in moral reality. Innocent blood shed on the land creates a moral pollution that only justice can resolve.'),
            ],
            'milgrom': [
                ('35:33-34', 'Milgrom: The blood-defiles-the-land principle is the closest the Torah comes to an ecological theology of covenant justice. The land is not morally neutral; it responds to the moral condition of its inhabitants. Innocent blood creates a defilement in the created order that only justice resolves. The Torah\'s environmental ethics are grounded in covenant theology.'),
            ],
            'ashley': [
                ('35:22-25', 'Ashley: The congregation\'s role in adjudicating homicide cases — receiving the accused, judging between murderer and blood-avenger — makes the entire community responsible for covenant justice. Capital punishment in Israel is not a personal transaction between families but a communal act of covenant justice administered by the congregation.'),
            ],
            'sarna': [
                ('35:30', 'Sarna: "No one is to be put to death on the testimony of only one witness." The two-witness requirement for capital punishment is one of the Torah\'s most important legal protections. The irreversibility of execution demands the highest evidentiary standard. No single testimony, however credible, can justify taking a life.'),
            ],
            'alter': [
                ('35:33-34', 'Alter: "Do not pollute the land where you are, for blood pollutes the land." The land is not a morally inert surface on which human events occur; it participates in the moral-covenantal order. The Torah\'s final word on the homicide law is not legal procedure but cosmic moral ecology: innocent blood mars the created world, and only justice restores it.'),
            ],
            'calvin': [
                ('35:33-34', 'Calvin: The land-defilement principle teaches that sin has effects beyond the sinner — it corrupts the created environment. Calvin sees in this a preview of Romans 8:20-22: "The creation was subjected to frustration... in hope that the creation itself will be liberated from its bondage to decay." Covenant sin defiles the land; the new creation will restore the land to its original moral integrity.'),
            ],
            'netbible': [
                ('35:30', 'NET Note: "Anyone who kills a person is to be put to death as a murderer only on the testimony of witnesses. But no one is to be put to death on the testimony of only one witness." The two-witness rule for capital cases is among the Torah\'s most significant procedural protections. It appears in Deut 17:6 and 19:15, forms the basis of NT church discipline (Matt 18:16; 2 Cor 13:1), and reflects the irreversible nature of execution.'),
            ],
        },
    ],
})

num(36, {
    'title': 'The Daughters of Zelophehad: The Marriage Restriction',
    'sections': [
        {
            'header': 'Verses 1\u20139 \u2014 The Manassite Concern; God\u2019s Ruling',
            'verses': verse_range(1, 9),
            'heb': [
                ('lo-titassev nachalah', "lo-titassev nachalah", 'the inheritance must not pass from tribe to tribe', 'The qualification on the ch.27 Zelophehad ruling: daughters who inherit must marry within their own tribe, otherwise land would transfer between tribes through marriage, disrupting the divinely-determined land allocation. Individual equity (ch.27) is balanced by communal land integrity (ch.36).'),
            ],
            'ctx': 'The leaders of Manasseh bring a new concern to Moses: if the daughters marry outside their tribe, their inherited land will transfer to their husbands\u2019 tribe at the next Jubilee, permanently reducing Manasseh\u2019s inheritance. God\u2019s ruling: daughters who inherit must marry within their own tribe. The two rulings together constitute a complete and balanced covenant legal provision: individual equity and communal integrity are both preserved.',
            'cross': [
                ('Josh 17:3\u20136', '"Zelophehad son of Hepher had no sons but only daughters... and their father\u2019s brothers\u2019 sons married them. These girls married cousins on their father\u2019s side." The Num 36 ruling is fulfilled in Joshua.'),
                ('1 Cor 7:39', '"A woman is bound to her husband as long as he lives... but if her husband dies, she is free to marry anyone she wishes, but he must belong to the Lord." Paul\u2019s "in the Lord" qualification echoes the Num 36 within-tribe principle: covenant community defines the context for marriage.'),
            ],
            'mac': [
                ('36:1\u20139', 'MacArthur: The Manassite leaders\u2019 concern is legitimate: the Zelophehad ruling, taken alone, would create a mechanism for tribal land erosion through marriage. God\u2019s qualification preserves both equities \u2014 the daughters receive their father\u2019s inheritance (ch.27 stands) and the tribal land allocation remains intact (ch.36 qualification added). The two rulings model the covenant\u2019s care for both individual equity and communal integrity.'),
                ('36:8\u20139', 'MacArthur: "Every daughter who inherits land in any Israelite tribe must marry someone in her father\u2019s tribal clan" \u2014 the rule applies to every inheriting daughter in Israel, not only Zelophehad\u2019s five. The Zelophehad case produces universal law. Individual legal situations repeatedly generate covenant principles for the whole community.'),
            ],
            'milgrom': [
                ('36:1\u20139', 'Milgrom: The Num 36 ruling is a sophisticated legal qualification that preserves both the individual equity of the ch.27 ruling and the communal land integrity of the tribal inheritance system. Neither ruling cancels the other; together they constitute a complete and balanced covenant legal provision for the unique case of daughters who inherit.'),
            ],
            'ashley': [
                ('36:5\u20139', 'Ashley: God\u2019s endorsement of the Manassite concern \u2014 "What the tribe of Manasseh is saying is right" \u2014 confirms that communal land integrity is a legitimate covenant value. The Zelophehad daughters\u2019 individual equity did not exhaust the relevant legal considerations; the tribal community\u2019s concern for its inheritance is equally valid and equally addressed.'),
            ],
            'sarna': [
                ('36:6', 'Sarna: The qualification \u2014 marrying within the tribe \u2014 is described as a "command of the Lord," not merely a pragmatic compromise. The land allocation of Num 26 and 34 is a divine distribution; its disruption through unregulated inter-tribal marriage would undermine the divine order of Israel\u2019s territorial covenant. The marriage restriction protects the covenant\u2019s spatial theology.'),
            ],
            'alter': [
                ('36:7', 'Alter: "No inheritance in Israel is to pass from tribe to tribe, for every Israelite shall keep the tribal inheritance of their ancestors." The inheritance principle is absolute: the divine land distribution, fixed by lot in the second census, is permanent. Inter-tribal inheritance transfer would introduce a randomness into the divine allocation that the lot\u2019s sovereignty was designed to prevent.'),
            ],
            'calvin': [
                ('36:6\u20139', 'Calvin: The marriage restriction teaches that individual freedom operates within communal covenant structures. The daughters have genuine freedom to marry \u2014 but within the tribe. The restriction is not arbitrary but serves the communal good of preserving the divine land distribution. Individual rights in the covenant community are real but not unlimited.'),
            ],
            'netbible': [
                ('36:9', 'NET Note: "No inheritance may pass from one tribe to another, for each Israelite tribe is to keep the land it inherits" \u2014 the principle is stated twice (vv.7 and 9) for emphasis. The double statement signals a foundational principle, not merely a specific ruling: the tribal land allocations of Num 26\u201334 are permanent covenant arrangements, not provisional arrangements subject to erosion through ordinary social and economic processes.'),
            ],
        },
        {
            'header': 'Verses 10\u201313 \u2014 The Daughters\u2019 Compliance; Numbers Concludes',
            'verses': verse_range(10, 13),
            'heb': [
                ('ken asuu', "ken asu", 'so they did / thus they obeyed', 'The compliance formula that closes the Zelophehad story and Numbers itself: the daughters heard the command and did it. The same verb (asah \u2014 to do, to act) runs throughout Numbers\u2019 compliance formulas. Numbers ends where it must: with hearing and doing.'),
            ],
            'ctx': 'The daughters comply: Mahlah, Tirzah, Hoglah, Milcah, and Noah \u2014 all five named again \u2014 marry their cousins within Manasseh\u2019s clans. The Zelophehad daughters\u2019 story is complete: they sought justice (ch.27), received it, and lived by the covenant qualification that accompanied it (ch.36). Numbers then closes with its final formula: "These are the commands and regulations the Lord gave through Moses to the Israelites on the plains of Moab by the Jordan across from Jericho." The book that began with a census at Sinai ends with covenant compliance at the Jordan. The promised land is one crossing away.',
            'cross': [
                ('Deut 1:1', '"These are the words Moses spoke to all Israel in the wilderness east of the Jordan \u2014 that is, in the Arabah." Deuteronomy begins where Numbers ends: Moses speaking to all Israel on the plains of Moab, across from Jericho. The two books form a continuous narrative seam.'),
                ('Josh 1:2', '"Moses my servant is dead. Now then, you and all these people, get ready to cross the Jordan River into the land I am about to give to them." Joshua picks up precisely where Numbers leaves off \u2014 the covenant community poised at the Jordan.'),
            ],
            'mac': [
                ('36:10\u201312', 'MacArthur: "So Zelophehad\u2019s daughters did as the Lord commanded Moses. Mahlah, Tirzah, Hoglah, Milcah and Noah married their cousins on their father\u2019s side." Five women named, five acts of obedient compliance. The daughters who brought the original case honour the qualification with the same covenant faithfulness with which they pursued the original ruling. Numbers ends on a note of covenant obedience.'),
                ('36:13', 'MacArthur: "These are the commands and regulations the Lord gave through Moses to the Israelites on the plains of Moab by the Jordan across from Jericho." The closing formula is simultaneously legal (commands and regulations), geographical (plains of Moab), and eschatological (across from Jericho). Numbers ends at the edge of the promise. Everything the book prepared for is one crossing away.'),
            ],
            'milgrom': [
                ('36:13', 'Milgrom: The closing formula echoes Lev 27:34 ("These are the commands the Lord gave Moses at Mount Sinai for the Israelites"). Numbers is the Sinai laws applied to the journey and extended to the plains of Moab. The book\u2019s legal corpus is complete; Deuteronomy will be Moses\u2019s final address from the same location before the crossing.'),
            ],
            'ashley': [
                ('36:10\u201312', 'Ashley: The daughters\u2019 compliance is narrated with the same careful name-by-name detail as their original petition. All five are named again; all five comply. The narrative honours their covenant faithfulness at the book\u2019s close as it honoured their legal courage at the Zelophehad story\u2019s beginning. Numbers closes with five women who sought justice, received it, and lived by it.'),
            ],
            'sarna': [
                ('36:13', 'Sarna: "These are the commands and regulations the Lord gave through Moses to the Israelites on the plains of Moab by the Jordan across from Jericho." The closing formula is geographical and covenantal simultaneously. The Jordan crossing from Jericho is the threshold of Canaan. Numbers ends at the edge of the promise. Everything that follows \u2014 the crossing, the conquest, the settlement \u2014 is Deuteronomy and Joshua. Numbers\u2019 final word is the word of a community standing ready.'),
            ],
            'alter': [
                ('36:13', 'Alter: Numbers opens with Israel\u2019s organised muster at Sinai and closes with Israel organised, instructed, and waiting at the Jordan. The book is a record of formation: the generation that refused to enter has been replaced by the generation that is ready. The forty years between ch.1 and ch.36 are the distance between refusal and readiness. Numbers is the book of the wilderness that produced the people capable of the crossing.'),
            ],
            'calvin': [
                ('36:10\u201313', 'Calvin: The daughters\u2019 obedient compliance \u2014 marrying within the tribe as God commanded \u2014 models the final covenant posture that Numbers seeks to instil: hearing and doing. The book that began with a generation that heard and did not do ends with five women who heard and did. The contrast is Numbers\u2019 theological arc in miniature: from Kadesh-barnea\u2019s refusal to the daughters of Zelophehad\u2019s compliance. The covenant community is ready to cross.'),
            ],
            'netbible': [
                ('36:13', 'NET Note: "These are the commands and regulations the Lord gave through Moses to the Israelites on the plains of Moab by the Jordan across from Jericho" \u2014 the closing formula is the editorial colophon of Numbers, parallel to Lev 27:34. Numbers is the Sinai laws applied to the journey and extended to the plains of Moab. Deuteronomy will be Moses\u2019s final address from the same location. Numbers ends where Deuteronomy begins.'),
            ],
        },
    ],
})

print("NUM-6b complete: Numbers 31-36 built.")
