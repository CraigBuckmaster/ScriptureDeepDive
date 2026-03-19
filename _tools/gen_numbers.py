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
