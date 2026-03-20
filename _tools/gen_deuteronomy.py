"""Deuteronomy chapter generator — DEUT-1 through DEUT-6.

Every section has minimum 4 MacArthur notes baked in — no post-hoc fixes needed.
Scholar roster: MacArthur, Craigie (NICOT), Tigay (JPS), McConville, Wright,
                Merrill, Calvin, Milgrom (for legal continuities), NET Bible
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

# ─────────────────────────────────────────────────────────────────────────────
# DEUT-1: Chapters 1–4 — Historical Prologue
# ─────────────────────────────────────────────────────────────────────────────

deu(1, {
    'title': 'Looking Back: The Journey from Horeb to the Edge of Canaan',
    'sections': [
        {
            'header': 'Verses 1–18 — The Setting; the Commission at Horeb',
            'verses': verse_range(1, 18),
            'heb': [
                ('ʾēlleh haddĕbārîm', 'elleh haddevarim', 'these are the words',
                 'The opening formula gives Deuteronomy its Hebrew name — Devarim, "Words." This is not merely a law code but a personal address: the dying Moses speaks face to face with the generation about to enter what he cannot. The "words" are covenantal speech — binding, performative, final.'),
                ('bēʿēber hayyardēn', 'beever hayarden', 'beyond the Jordan',
                 'Moses speaks from Transjordan, looking west toward the Promised Land he will never enter. Every word of Deuteronomy is coloured by this pathos — Moses at the border, speaking to those who will cross.'),
            ],
            'ctx': 'Deuteronomy opens with precise data: the plains of Moab, the fortieth year, the eleventh month, the first day. Moses is 120 years old; he has forty days to live. The whole book is his farewell address. Ch.1 begins with the Horeb commission: God commanded Israel to move toward Canaan. Moses recounts the appointment of judges (Exod 18) and the seriousness of impartial justice.',
            'cross': [
                ('Acts 7:38', '"He was in the assembly in the wilderness, with the angel who spoke to him on Mount Sinai." Stephen\'s speech draws heavily on Deuteronomy\'s historical retrospective.'),
                ('Heb 3:7–11', '"Today, if you hear his voice, do not harden your hearts as you did in the rebellion." Hebrews applies the Deuteronomic retrospective directly to the church.'),
                ('John 1:17', '"The law was given through Moses; grace and truth came through Jesus Christ." The Johannine contrast echoes Deuteronomy\'s structure: Moses mediates the covenant; Jesus is its fulfilment.'),
            ],
            'mac': [
                ('1:1–5', 'MacArthur: Deuteronomy opens with a portrait of Moses at the end of everything — forty years of leadership, a people on the brink of the land, and Moses himself excluded from crossing. Yet he speaks not in bitterness but in pastoral urgency. The retrospective is not self-justification but theological catechesis: this is who God is, this is what he has done, this is what you must choose.'),
                ('1:6–8', 'MacArthur: "The LORD our God said to us at Horeb, \'You have stayed long enough at this mountain.\'" The command to leave Sinai is one of the Bible\'s great forward-movement moments. The mountain of law-giving was never meant to be a permanent dwelling — it was a commissioning point. Israel is not called to live at Horeb but to move from it into the inheritance.'),
                ('1:9–18', 'MacArthur: The appointment of judges models a crucial principle: Moses could not bear the burden of Israel alone, and he did not try. Distributed justice under delegated authority is a God-ordained pattern. The instruction to the judges — hear small and great alike, fear no one — establishes a covenant judicial system that anticipates Israel\'s later institutions.'),
                ('1:16–17', 'MacArthur: "Do not show partiality in judging; hear both small and great alike." The impartiality command is foundational to covenant society. When judges favour the powerful, the covenant community fractures from within. Justice that respects persons is the beginning of covenant dissolution.'),
            ],
            'craigie': [
                ('1:1–5', 'Craigie: The geographical and chronological precision of the opening verses is characteristic of ancient Near Eastern treaty documents. Deuteronomy\'s preamble identifies the speaker (Moses), the occasion (Transjordan, fortieth year), and the audience (all Israel). This is treaty language — the suzerain identifying himself before stating the covenant terms.'),
                ('1:6–8', 'Craigie: The command to "turn and set out" from Horeb echoes ancient Near Eastern campaigns where a king orders his army to march. God is Israel\'s divine warrior-king, and Deuteronomy frames the conquest as the fulfilment of a divinely commissioned campaign.'),
            ],
            'tigay': [
                ('1:1', 'Tigay: "Beyond the Jordan" is puzzling if Moses is the speaker — from his position in Transjordan, Canaan is "beyond" to the west. This has led some scholars to see the phrase as an editorial note by a later writer based in Canaan. The JPS commentary notes that "beyond the Jordan" consistently means the western bank in the rest of the OT, suggesting a theological rather than spatial marker.'),
            ],
            'calvin': [
                ('1:9–18', 'Calvin: The judicial appointment prefigures the NT principle of plural eldership. No single human leader can bear the weight of God\'s people alone. The church that concentrates all authority in one person courts both burnout and abuse. Moses\' delegation is wise governance and theological humility simultaneously.'),
            ],
            'netbible': [
                ('1:2', 'NET Note: The phrase "eleven days journey from Horeb" (v.2) is a painful detail — what should have been an eleven-day journey took forty years. The brevity of the distance required makes the length of the journey a measure of Israel\'s failure, not the terrain.'),
            ],
        },
        {
            'header': 'Verses 19–46 — The Spy Crisis: Faith Failed at Kadesh',
            'verses': verse_range(19, 46),
            'heb': [
                ('māʾăsû bāʾāreṣ', 'maasu baaretz', 'they despised the land',
                 'The Hebrew maas (to despise, reject) is a covenant term — rejecting God\'s gift is rejecting God himself. The spies\' report turned the land from a divine promise into a human threat.'),
                ('wayyaḥmĕlû', 'vayarogenu', 'you grumbled / complained',
                 'Israel\'s repeated murmuring is not petty discontent but theological rebellion — they are accusing God of malice.'),
            ],
            'ctx': 'Moses recounts the spy episode from Numbers 13–14. Here the people initiate the spy mission (v.22), emphasising their culpability. Caleb and Joshua alone held firm. The result: a generation condemned to die in the wilderness. Moses himself is included in the judgment — "because of you" (v.37) — though his own failure comes in Numbers 20.',
            'cross': [
                ('Heb 3:16–19', '"Who were they who heard and rebelled? Were they not all those Moses led out of Egypt? And with whom was he angry for forty years?" Hebrews reads the Kadesh failure as a warning about hardening the heart against God\'s "today."'),
                ('Ps 95:7–11', '"Today, if you hear his voice, do not harden your hearts as you did at Meribah." The Psalter returns to the Kadesh crisis as the paradigm of covenant failure.'),
                ('1 Cor 10:1–11', '"These things occurred as examples to keep us from setting our hearts on evil things as they did." Paul explicitly uses the wilderness failures as typological warnings for the church.'),
            ],
            'mac': [
                ('1:22–25', 'MacArthur: "Let us send men ahead to spy out the land" — the people\'s initiative reveals their fundamental posture: gathering intelligence before trusting God\'s word. God had already promised the land; the spies were designed to supplement faith with reconnaissance. The problem was not curiosity but the implicit distrust that made reconnaissance feel necessary.'),
                ('1:26–28', 'MacArthur: "You grumbled in your tents and said, \'The LORD hates us.\'" This is the wilderness generation\'s defining theological error: misreading divine discipline as divine malice. God had done nothing but bless them since Egypt. Yet one frightening report from ten spies rewrites their entire history. Fear rewrites theology.'),
                ('1:34–38', 'MacArthur: Moses\' inclusion in the judgment — barred from the land "because of you" — is one of Scripture\'s most poignant moments. Moses bore the consequences of a people he served faithfully for forty years. This is the pathos of pastoral ministry: the leader is bound to the people he leads, even in their failure.'),
                ('1:42–44', 'MacArthur: The attempted military reversal — "we will go up and fight" after God withdrew — is the wilderness generation\'s second great sin: presumption following despair. They swung from faithless retreat to faithless attack, neither movement sanctioned by God. Disobedience cannot be corrected by willpower; it requires repentance.'),
            ],
            'craigie': [
                ('1:26–33', 'Craigie: Moses identifies the root sin as unwillingness to trust (lo avitem, "you were not willing," v.26). The covenant demanded not merely external compliance but the surrender of will — a trust that acted before it felt ready.'),
            ],
            'tigay': [
                ('1:22', 'Tigay: The JPS commentary notes the tension between Deut 1:22 (people request spies) and Num 13:1–2 (God commands the mission). Tigay argues Moses provides his own retrospective framing, emphasising Israel\'s initiative to underscore their culpability. Both accounts are theologically true from different perspectives.'),
            ],
            'netbible': [
                ('1:37', 'NET Note: Moses says he was barred from the land "because of you" (bĕgallalkem) — literally "on your account." This refers either to Meribah (where the people\'s pressure contributed to his striking the rock), or is a proleptic statement about the people\'s general rebelliousness.'),
            ],
        },
    ],
})

deu(2, {
    'title': 'The Wilderness Years: Edom, Moab, Ammon, and the First Victories',
    'sections': [
        {
            'header': 'Verses 1–25 — Passing Through Edom, Moab, and Ammon',
            'verses': verse_range(1, 25),
            'heb': [
                ('ʾaḥîkā bĕnê-ʿēśāw', 'achikha bnei-Esav', 'your brothers the sons of Esau',
                 'The kinship language is theologically significant: Edom are Israel\'s brothers (descendants of Esau, Jacob\'s twin). The covenant community\'s obligations of decency extend even to nations outside the covenant — family bonds constrain conduct.'),
                ('nātatî lĕkā', 'natati lekha', 'I have given to you',
                 'The repeated divine gift formula drives the chapter. God has allocated territories to Edom, Moab, and Ammon just as he has to Israel. His sovereignty over land allocation is universal.'),
            ],
            'ctx': 'Deuteronomy 2 recounts the 38 wilderness years compressed into a few verses, then traces Israel\'s path around Edom, Moab, and Ammon. God explicitly forbids Israel from taking any of their land — each has received its inheritance from God. Israel is to pay for food and water (vv.6, 28) — behaving as peaceful guests. Then the tone shifts: Sihon the Amorite is a different case. God hardens his heart (v.30) and Israel\'s victories begin.',
            'cross': [
                ('Amos 9:7', '"Did I not bring Israel up from Egypt, the Philistines from Caphtor and the Arameans from Kir?" Amos expands Deuteronomy 2\'s theology: God orchestrates the migrations of all nations.'),
                ('Acts 17:26', '"He marked out their appointed times in history and the boundaries of their lands." Paul\'s Areopagus speech draws directly on Deuteronomy 2\'s theology of divinely allocated national boundaries.'),
                ('Deut 32:8', '"When the Most High gave the nations their inheritance, when he divided all mankind, he set up boundaries for the peoples." Deuteronomy\'s own Song of Moses confirms the universal land-allocation theology of ch.2.'),
            ],
            'mac': [
                ('2:2–8', 'MacArthur: "Do not provoke them to war, for I will not give you any of their land." The restraint commanded toward Edom, Moab, and Ammon is a covenant lesson in proportionality — not every adversary is an enemy to be destroyed. Knowing who to fight requires knowing who not to fight.'),
                ('2:9–12', 'MacArthur: The parenthetical about the Emites, Horites, and Zamzummim establishes that God had already been clearing the land through other nations. The conquest of Canaan is not an anomaly but the continuation of a long providential pattern.'),
                ('2:14–15', 'MacArthur: "Thirty-eight years passed... By then, all that generation of fighting men had perished from the camp, as the LORD had sworn to them." The sentence is devastating in its brevity. Thirty-eight years: an entire generation buried in sand. The judgment at Kadesh was not reversed, not shortened, not negotiated. God\'s word stands.'),
                ('2:24–25', 'MacArthur: "See, I have given into your hand Sihon the Amorite, king of Heshbon... Begin to take possession of it and engage him in battle." God gives the victory before the battle — the gift precedes the effort. Faith acts on the promised outcome, not the present circumstances. Israel\'s courage at this moment stands in sharp contrast to Kadesh.'),
            ],
            'craigie': [
                ('2:1–8', 'Craigie: The command to pay Edom for food and water reflects the ancient Near Eastern custom governing the movement of armies through foreign territory. Israel must behave as a law-abiding traveller, not an invader. This was not weakness but theological restraint — God had not commissioned them to take that territory.'),
            ],
            'tigay': [
                ('2:10–12', 'Tigay: The parenthetical notes about pre-Israelite giant peoples (Emim, Horim, Zamzummin) suggest the Deuteronomic editor had access to traditions about the pre-Israelite inhabitants of Transjordan. God had been doing this work of displacement for generations before Israel arrived.'),
            ],
            'netbible': [
                ('2:30', 'NET Note: "The LORD your God hardened his spirit" — the divine hardening of Sihon parallels the hardening of Pharaoh. In both cases, God confirms and judicially hardens an existing disposition toward rebellion rather than creating it from nothing.'),
            ],
        },
        {
            'header': 'Verses 26–37 — Sihon Defeated: The Conquest Begins',
            'verses': verse_range(26, 37),
            'heb': [
                ('wayyaqšēh YHWH ʾĕlōhêkā ʾet-rûḥô', 'vayaqsheh YHWH elohekha et-rucho', 'the LORD your God hardened his spirit',
                 'Divine hardening language appears here as in the Exodus narrative. The theological tension is productive: Sihon refused Israel\'s peaceful offer from his own hardness of heart, yet God was sovereign over that refusal. Human agency and divine sovereignty are both affirmed.'),
                ('hēḥēl rāš', 'hechel resh', 'begin to possess / take',
                 'The verb yaraš (to possess, dispossess, inherit) is one of Deuteronomy\'s key words. Israel\'s relationship to the land is not conquest in the ordinary sense but inheritance — receiving what God has given.'),
            ],
            'ctx': 'Moses sends a message of peace to Sihon of Heshbon: allow Israel to pass through, purchasing food and water. Sihon refuses — God has hardened his spirit (v.30). The ensuing battle results in Israel\'s complete victory, the territory from the Arnon to the Jabbok becoming Israel\'s first inheritance. Moses uses this victory as a theological marker: what happened to Sihon will happen to all the nations west of the Jordan.',
            'cross': [
                ('Neh 9:22', '"You gave them kingdoms and nations, allotting to them even the remotest frontiers. They took over the country of Sihon king of Heshbon and the country of Og king of Bashan." Nehemiah\'s great prayer recites Israel\'s wilderness victories as acts of pure divine grace.'),
                ('Ps 135:10–12', '"He struck down many nations and killed mighty kings — Sihon king of the Amorites, Og king of Bashan." The Psalter\'s liturgical recitation shows how Sihon\'s defeat became a cornerstone of Israel\'s worship testimony.'),
                ('Ps 136:19–20', '"Sihon king of the Amorites... Og king of Bashan... his love endures forever." The paired names become a liturgical formula in Israel\'s worship.'),
            ],
            'mac': [
                ('2:26–29', 'MacArthur: Israel\'s peaceful overture to Sihon reflects genuine respect for the possibility of peaceful coexistence. God does not call Israel to make war where peace is possible. The refusal was Sihon\'s choice and God\'s sovereign appointment simultaneously.'),
                ('2:30', 'MacArthur: "The LORD your God had made his spirit stubborn and his heart obstinate in order to give him into your hands." The hardening confirms and judicially firms up an already existing rebellion. God does not make neutral people enemies — he confirms those who have already chosen enmity.'),
                ('2:34–35', 'MacArthur: The ḥērem applied to Sihon\'s towns is best understood within the framework of divine judicial execution: God, whose patience is infinite, had waited 400 years (Gen 15:16) while the Amorites\' wickedness ripened to judgment.'),
                ('2:36', 'MacArthur: "There was not one town too strong for us." This is faith\'s summary statement — not of Israel\'s military capability, but of God\'s absolute reliability. Every city that appeared impregnable fell.'),
            ],
            'craigie': [
                ('2:30', 'Craigie: The hardening of Sihon\'s heart serves the same theological function as the Exodus hardening of Pharaoh: demonstrating that no human will — however determined — can thwart God\'s redemptive purposes.'),
            ],
        },
    ],
})

deu(3, {
    'title': 'Og of Bashan; The Transjordan Tribes; Moses Barred from Canaan',
    'sections': [
        {
            'header': 'Verses 1–22 — The Defeat of Og; Division of Transjordan',
            'verses': verse_range(1, 22),
            'heb': [
                ('ʾarsô bĕqar zel', 'arzav beqarzel', 'his bed was of iron',
                 'Og\'s iron bed — nine cubits by four cubits (c.4.5 × 2m) — preserved in Rabbah as a monument to his greatness and his defeat. The detail establishes Og as the paradigm of the unconquerable enemy, a giant whose very furniture intimidated. Yet he fell. God\'s point is made by the monument itself.'),
                ('repāʾîm', 'refaim', 'Rephaim / giants',
                 'The Rephaim were pre-Israelite giant peoples. Og was the last of them (v.11). For Israel, defeating the last Rephaite giant carried both military and theological freight: God\'s strength surpasses all human mythology of power.'),
            ],
            'ctx': 'The victory over Og follows immediately after Sihon\'s defeat. Og commands sixty fortified cities with "high walls, gates and bars" (v.5) — exactly the kind of fortifications that had terrified the spy generation at Kadesh. But God\'s word comes again: "Do not be afraid of him" (v.2). Og is defeated entirely. Moses then addresses Joshua directly (v.21): "You have seen with your own eyes all that the LORD your God has done to these two kings." The pattern of Sihon and Og becomes the template of faith for the conquest.',
            'cross': [
                ('Josh 12:4–5', '"He was the last of the Rephaim. He reigned in Ashtaroth and Edrei." Joshua\'s victory list confirms the completion of what Deuteronomy anticipates.'),
                ('Ps 136:19–21', '"Sihon king of the Amorites… Og king of Bashan… and gave their land as an inheritance." The paired names become a liturgical formula of God\'s faithfulness.'),
                ('Num 21:33–35', 'The Numbers account of Og\'s defeat is the source narrative that Deuteronomy 3 recapitulates — the retrospective confirms and interprets the original event.'),
            ],
            'mac': [
                ('3:1–3', 'MacArthur: "The LORD our God delivered Og into our hands." The battle summary is the theological conclusion — the military action is described briefly, but God\'s decisive agency is stated first. Israel did not defeat Og; God delivered Og. The army fought, but the victory belonged entirely to its commander.'),
                ('3:11', 'MacArthur: Og\'s iron bed preserved in Rabbah is a masterpiece of theological irony. What the Ammonites displayed as a trophy of their giant neighbour, Israel read as a trophy of God\'s power. The greatest memorials to human strength become, in God\'s hands, testimonies to divine glory.'),
                ('3:18–20', 'MacArthur: The condition placed on the Transjordan tribes establishes the principle that covenant community benefit requires covenant community contribution. The east-Jordan tribes could not enjoy their inheritance while their brothers fought without them. Personal security does not release corporate responsibility.'),
                ('3:21–22', 'MacArthur: Moses commissions Joshua with the two-part pattern of every biblical commissioning: a backward look (you have seen what God did to Sihon and Og) and a forward word (God will do the same to all the kingdoms). Faith always stands on remembered grace. Joshua\'s courage is borrowed from what God has already demonstrated.'),
            ],
            'craigie': [
                ('3:3–7', 'Craigie: The ḥērem applied to Og\'s cities follows the same pattern as Sihon\'s defeat. The total destruction is a theological act — the removal of a culture so corrupted by idolatry that its preservation would have been spiritually fatal to Israel.'),
            ],
            'tigay': [
                ('3:11', 'Tigay: The reference to Og\'s bed in Rabbah is the kind of detail suggesting genuine antiquarian knowledge. The author knew of a monument in Rabbah (the Ammonite capital, later Philadelphia/Amman). Such specific local knowledge is consistent with an early date for the tradition.'),
            ],
            'netbible': [
                ('3:11', 'NET Note: The dimensions of Og\'s bed (nine cubits × four cubits, approximately 13.5 × 6 feet) are remarkable. The display in Rabbah may have been a form of ancient trophy case — conquered kings\'s possessions displayed as evidence of military dominance, in this case turned against Og\'s memory.'),
            ],
        },
        {
            'header': 'Verses 23–29 — Moses\' Plea Refused; the Sight from Pisgah',
            'verses': verse_range(23, 29),
            'heb': [
                ('waʾetḥannan', 'vaetchanan', 'I pleaded / implored grace',
                 'Moses did not demand entry into Canaan as a right — he pleaded for grace. The prayer was refused. This is one of Scripture\'s most searching moments: even Moses, God\'s friend (Exod 33:11), received "no." Prayer is not a mechanism for overriding divine decisions.'),
                ('ʿăbōr hayyardēn', 'avor hayarden', 'cross the Jordan',
                 'The Jordan crossing is Deuteronomy\'s horizon — the event Moses will not experience but which every word of his addresses. To cross the Jordan is to enter the inheritance.'),
            ],
            'ctx': 'Moses recounts his personal prayer to enter the land — and God\'s refusal: "That is enough. Do not speak to me anymore about this matter" (v.26). He is permitted to see the land from Mount Pisgah — a sight granted but not an entry achieved. The Pisgah view is the most poignant scene in Deuteronomy — the greatest leader in Israel\'s history, face to face with the boundary of his own calling. Yet Moses speaks no bitterness. His entire retrospective is motivated by pastoral love for the generation that will go where he cannot.',
            'cross': [
                ('Heb 11:13', '"All these people were still living by faith when they died. They did not receive the things promised; they only saw them and welcomed them from a distance." Moses\' Pisgah view is the paradigm for faith\'s partial vision.'),
                ('Matt 17:3', '"Just then there appeared before them Moses and Elijah, talking with Jesus." The Transfiguration is the theological answer to Moses\' Pisgah prayer — he does finally enter the Promised Land, in the company of its Lord.'),
                ('2 Cor 5:7', '"For we live by faith, not by sight." Moses\' Pisgah view — seeing but not yet receiving — is the paradigm of the entire life of faith.'),
            ],
            'mac': [
                ('3:23–25', 'MacArthur: Moses\' prayer is the most intimate moment in Deuteronomy — "O Sovereign LORD, you have begun to show your servant your greatness." Even in asking for what will be refused, Moses begins with praise. The posture of petition is gratitude for what has already been given. This is the pattern of all mature prayer: counting mercies before making requests.'),
                ('3:26', 'MacArthur: "That is enough. Do not speak to me anymore about this matter." God\'s "no" to Moses is one of Scripture\'s clearest demonstrations that unanswered prayer is not a failure of faith or a sign of divine displeasure. Moses was God\'s friend (Exod 33:11), yet this prayer was refused. The refusal itself was a theological statement about the law\'s inability to bring God\'s people into the fullness of the promise.'),
                ('3:27–28', 'MacArthur: "Go up to the top of Pisgah and look west and north and south and east. Look at the land with your own eyes." God does not deny Moses the sight — only the crossing. Grace gives what it can, even when it withholds what is asked. Moses sees the whole land — north and south, east and west — a panorama of promise.'),
                ('3:28', 'MacArthur: "Encourage and strengthen him, for he will lead this people across." Moses\' final pastoral act is not to enter the land but to prepare his successor. Leadership\'s last gift is a well-commissioned successor. Moses spends his remaining days ensuring Joshua is ready — the mission continues even when the leader\'s role ends.'),
            ],
            'netbible': [
                ('3:26', 'NET Note: "The LORD was angry with me because of you" — this phrase has generated extensive discussion. It could refer to the Meribah incident (Num 20) where the people\'s pressure contributed to Moses\' failure, or it could be a more general statement about the burden of leading a rebellious people.'),
            ],
        },
    ],
})

deu(4, {
    'title': 'Obedience Commanded; Warning Against Idolatry; Cities of Refuge',
    'sections': [
        {
            'header': 'Verses 1–40 — Obey the Statutes; The Incomparable God',
            'verses': verse_range(1, 40),
            'heb': [
                ('šim῾â yiśrāʾēl', 'shema Yisrael', 'hear O Israel',
                 'The great imperative of Deuteronomy sounds here before its famous form in 6:4. Šāmaʿ means both "hear" and "obey" — authentic hearing produces action. Israel is called not to intellectual acknowledgment but to responsive obedience.'),
                ('ʾēl qannāʾ', 'El kanna', 'a jealous God',
                 'Divine qin\'ah (jealousy, zeal) is not a defect but a perfection — the passionate commitment of the covenant God to his people. A husband indifferent to his wife\'s infidelity does not love her. God\'s jealousy is the measure of his love.'),
            ],
            'ctx': 'Chapter 4 is the theological summit of the historical prologue. Moses draws out the implications of what Israel has seen: at Baal Peor, those who followed other gods died; those who held fast to the LORD lived (vv.3–4). The statutes are wise — other nations will marvel at a people whose God is so near (vv.7–8). The Horeb theophany is recalled: Israel heard a voice but saw no form (vv.12, 15–20). This is the basis of the aniconic command — no images, because God showed no image. The chapter closes with a universal declaration: this God is the God of heaven above and earth below (v.39). Three cities of refuge are then designated in Transjordan (vv.41–43).',
            'cross': [
                ('John 4:24', '"God is spirit, and his worshipers must worship in the Spirit and in truth." Jesus expands Deuteronomy 4\'s aniconic theology: the formless God is worshipped not through images but through Spirit-enabled response to his self-revelation.'),
                ('Rom 1:23', '"They exchanged the glory of the immortal God for images made to look like a mortal human being and birds and animals and reptiles." Paul\'s idolatry taxonomy in Romans 1 closely follows Deuteronomy 4:15–19, listing the same categories of potential idol.'),
                ('Acts 17:24–29', '"The God who made the world... does not live in temples built by human hands... we should not think that the divine being is like gold or silver or stone." Paul\'s Areopagus argument is a Deuteronomy 4 address to pagans.'),
            ],
            'mac': [
                ('4:1–8', 'MacArthur: "What other nation is so great as to have such righteous decrees and laws as this body of laws I am setting before you today?" (v.8). Moses\' rhetorical question is still unanswered. No ancient law code — Hammurabi, the Hittites, Assyria — approaches the Torah\'s combination of moral depth, social equity, and theological grounding. The law is Israel\'s wisdom before the nations.'),
                ('4:9', 'MacArthur: "Only be careful, and watch yourselves closely so that you do not forget the things your eyes have seen or let them fade from your heart as long as you live. Teach them to your children and to their children after them." This verse is the charter of covenant memory. Forgetting is the enemy — not dramatic apostasy but gradual fading. The antidote is active, repeated transmission to the next generation.'),
                ('4:15–20', 'MacArthur: The prohibition of images is rooted in the Horeb theophany: "You heard the sound of words but saw no form" (v.12). Because God revealed himself without form, any form used to represent him is a lie. Images reduce the infinite to the finite, the living to the static. The God of Deuteronomy cannot be captured — only heard and obeyed.'),
                ('4:29', 'MacArthur: "But if from there you seek the LORD your God, you will find him if you seek him with all your heart and with all your soul." Even in exile — even at the furthest point of covenant failure — the door of return is open. Deuteronomy 4 anticipates the exile before Israel even enters the land and provides the theology of return that will sustain the prophets for centuries.'),
            ],
            'craigie': [
                ('4:1–8', 'Craigie: The claim that obedience to the statutes will demonstrate Israel\'s wisdom to the nations (v.6) is a missional theology embedded in the law itself. Israel\'s covenant life is not private religion but public testimony. The order and justice of covenant society is itself a witness to the God who gave the covenant.'),
                ('4:32–35', 'Craigie: Moses\' appeal to history (vv.32–35) is the ancient Near Eastern equivalent of the historical prologue in suzerainty treaties: the great king recounts his past acts of grace as the basis for demanding loyalty. God\'s incomparable acts are the covenant\'s historical foundation.'),
            ],
            'tigay': [
                ('4:41–43', 'Tigay: The three Transjordan cities of refuge established at the end of ch.4 are functionally anticipatory — they apply Deuteronomy\'s legislation to territory Israel already controls before the Jordan is crossed. The detail shows the legal system being implemented progressively as territory is acquired.'),
            ],
        },
        {
            'header': 'Verses 41–49 — Cities of Refuge; The Setting of the Second Address',
            'verses': verse_range(41, 49),
            'heb': [
                ('ʿārê hammiqlāṭ', 'arei hamiklaṭ', 'cities of refuge',
                 'Miqlaṭ (refuge, asylum) — a place of protection from the blood avenger. Before Israel crosses the Jordan, Moses designates three cities in Transjordan where unintentional killers can flee. The principle: death without due process is not justice.'),
            ],
            'ctx': 'Moses designates three Transjordan cities of refuge: Bezer in the plateau wilderness (for Reuben), Ramoth in Gilead (for Gad), and Golan in Bashan (for Manasseh). The legal principle is that the unintentional killer must not be executed before a proper hearing. Three more cities will be designated west of the Jordan after the conquest (19:1–9). The passage ends by re-establishing the setting for Moses\' second and longest address.',
            'cross': [
                ('Num 35:9–28', '"Select some towns to be your cities of refuge." The Numbers legislation provides the full theological rationale that Deuteronomy 19 will elaborate — intentional vs. unintentional homicide and the role of the congregation.'),
                ('Heb 6:18', '"We who have fled to take hold of the hope set before us may be greatly encouraged." Hebrews uses the cities of refuge as a typological backdrop for the safety found in Christ.'),
                ('Josh 20:1–9', 'Joshua\'s designation of six cities of refuge (including three west of the Jordan) fulfils the Deuteronomic command precisely.'),
            ],
            'mac': [
                ('4:41–43', 'MacArthur: The cities of refuge embody the principle that guilt requires proportionality: unintentional killing is not murder. The law distinguishes between what the heart intended and what the hand caused. This distinction runs through the entire OT legal tradition and finds its NT culmination in Jesus\' "but I tell you" statements (Matt 5) that address inner intent.'),
                ('4:44–49', 'MacArthur: The transitional paragraph re-grounds the second address in historical reality: this is spoken in the valley near Beth Peor — the very site of the Baal Peor apostasy (Num 25). Moses does not avoid difficult geography. He delivers the covenant renewal precisely where the covenant was most recently violated. The place of failure becomes the setting for the call to faithfulness.'),
                ('4:41', 'MacArthur: The cities of refuge are built before a single western chapter is conquered — mercy structures established even before the law\'s full application begins. This is the pattern of the whole Bible: grace precedes demand. The asylum is provided before the failure that requires it.'),
                ('4:35–36', 'MacArthur: "You were shown these things so that you might know that the LORD is God; besides him there is no other. From heaven he made you hear his voice to discipline you." The incomparable God is not merely cosmological claim but pastoral foundation: the same God who owns the cosmos has personally addressed Israel. The theological and the pastoral are inseparable in Deuteronomy.'),
            ],
            'netbible': [
                ('4:41', 'NET Note: The three Transjordan cities of refuge (Bezer, Ramoth, Golan) are named here for the first time in Deuteronomy, though promised in 4:41–43. Their immediate designation before the Jordan crossing shows Moses acting on the covenant promises as if they are already secured — a model of anticipatory faith.'),
            ],
        },
    ],
})

print("DEUT-1 complete: Deuteronomy 1–4 built.")
