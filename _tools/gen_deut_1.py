"""DEUT-1: Deuteronomy chapters 1–4 — Historical Prologue"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

deu(1, {
    'title': 'Looking Back: From Horeb to the Edge of Canaan',
    'sections': [
        {
            'header': 'Verses 1–18 — The Setting; the Commission at Horeb',
            'verses': verse_range(1, 18),
            'heb': [
                ('ʾēlleh haddĕbārîm', 'elleh haddevarim', 'these are the words',
                 'The opening formula gives Deuteronomy its Hebrew name — Devarim, "Words." This is not merely a law code but a personal address: the dying Moses speaks face to face with the generation that will enter what he cannot. The "words" are covenantal speech — binding, performative, final.'),
                ('bēʿēber hayyardēn', 'beever hayarden', 'beyond the Jordan',
                 'The phrase orients the reader: Moses speaks from Transjordan, looking west toward the land he will never enter. Every word of Deuteronomy is coloured by this pathos — Moses at the border, speaking to those who will cross.'),
            ],
            'ctx': 'Deuteronomy opens with precise geographical and temporal data: the plains of Moab, the fortieth year, the eleventh month, the first day. Moses is 120 years old. He has forty days to live. The whole book is his farewell address — three speeches, a song, and a blessing. Ch.1 begins with a review of the Horeb commission: God commanded Israel to move from Sinai toward Canaan. Moses recounts the appointment of judges (Exod 18) and the seriousness of impartial justice.',
            'cross': [
                ('Acts 7:38', '"He was in the assembly in the wilderness, with the angel who spoke to him on Mount Sinai." Stephen\'s speech draws heavily on Deuteronomy\'s historical retrospective — Moses at Horeb is the paradigm of God speaking through a mediator.'),
                ('Heb 3:7–11', '"Today, if you hear his voice, do not harden your hearts as you did in the rebellion." Hebrews applies the Deuteronomic retrospective directly to the church — the wilderness generation\'s failure is a warning for every generation.'),
                ('John 1:17', '"The law was given through Moses; grace and truth came through Jesus Christ." The Johannine contrast echoes Deuteronomy\'s structure: Moses mediates the covenant; Jesus is its fulfilment.'),
            ],
            'mac': [
                ('1:1–5', 'MacArthur: Deuteronomy opens with a portrait of Moses at the end of everything — forty years of leadership, a people finally on the brink of the land, and Moses himself excluded from the crossing. Yet he speaks not in bitterness but in pastoral urgency. The retrospective is not self-justification but theological catechesis: this is who God is, this is what he has done, this is what you must choose.'),
                ('1:6–8', 'MacArthur: "The LORD our God said to us at Horeb, \'You have stayed long enough at this mountain.\'" The command to leave Sinai is one of the Bible\'s great forward-movement moments. The mountain of law-giving was never meant to be a permanent dwelling — it was a commissioning point. Israel is not called to live at Horeb but to move from it into the inheritance.'),
                ('1:9–15', 'MacArthur: The appointment of judges models a crucial principle: Moses could not bear the burden of Israel alone, and he did not try. Distributed justice under delegated authority is a God-ordained pattern. The instruction to the judges — hear small and great alike, fear no one, bring hard cases to Moses — establishes a covenant judicial system that anticipates Israel\'s later institutions.'),
                ('1:16–17', 'MacArthur: "Do not show partiality in judging; hear both small and great alike." The impartiality command is foundational to covenant society. When judges favour the powerful, the covenant community fractures from within. Justice that respects persons is the beginning of covenant dissolution — it is why the prophets later condemn Israel\'s courts with such ferocity.'),
            ],
            'craigie': [
                ('1:1–5', 'Craigie: The geographical and chronological precision of the opening verses is characteristic of ancient Near Eastern treaty documents. Deuteronomy\'s preamble identifies the speaker (Moses), the occasion (Transjordan, fortieth year), and the audience (all Israel). This is treaty language — the suzerain identifying himself and his vassal before the covenant terms are stated.'),
                ('1:6–8', 'Craigie: The command to "turn and set out" from Horeb echoes the language of ancient campaigns where a king orders his army to march. God is Israel\'s divine warrior-king, and Deuteronomy frames the conquest not as human aggression but as the fulfilment of a divinely commissioned campaign.'),
            ],
            'tigay': [
                ('1:1', 'Tigay: The phrase "beyond the Jordan" is puzzling if Moses is the speaker — from his position in Transjordan, Canaan is "beyond" to the west. The JPS commentary notes that "beyond the Jordan" consistently means the western bank in the rest of the OT, suggesting the phrasing may be a theological marker rather than a spatial descriptor.'),
            ],
            'calvin': [
                ('1:9–18', 'Calvin: The judicial appointment prefigures the NT principle of plural eldership. No single human leader can bear the weight of God\'s people alone — not Moses, not any pastor or bishop. Moses\' delegation is wise governance and theological humility simultaneously.'),
            ],
        },
        {
            'header': 'Verses 19–46 — The Spy Crisis: Faith Failed at Kadesh',
            'verses': verse_range(19, 46),
            'heb': [
                ('māʾăsû bāʾāreṣ', 'maasu baaretz', 'they despised the land',
                 'The Hebrew maas (to despise, reject) is a covenant term — rejecting God\'s gift is rejecting God himself. The spies\' report turned the land from a divine promise into a human threat.'),
                ('wayyirgĕnû', 'vayirgenu', 'you grumbled',
                 'The verb rāgan (to murmur, complain) runs through the wilderness narrative like a refrain. Israel\'s repeated murmuring is not petty discontent but theological rebellion — they are accusing God of malice.'),
            ],
            'ctx': 'Moses recounts the spy episode from Numbers 13–14 with a key difference: here the people initiate the spy mission (v.22). Moses\' retrospective emphasises Israel\'s failure of faith: they saw the land\'s power and forgot God\'s promise. Caleb and Joshua alone held firm. The result: a generation condemned to die in the wilderness. The Kadesh narrative is the hinge of Israel\'s history: the moment when a generation chose fear over faith.',
            'cross': [
                ('Heb 3:16–19', '"Who were they who heard and rebelled? Were they not all those Moses led out of Egypt?... Their bodies perished in the wilderness." Hebrews reads the Kadesh failure as a warning about hardening the heart against God\'s "today."'),
                ('Ps 95:7–11', '"Today, if you hear his voice, do not harden your hearts as you did at Meribah." The Psalter returns to the Kadesh crisis as the paradigm of covenant failure.'),
                ('Num 13:1–2', 'In Numbers, God commands the spy mission; in Deuteronomy, the people request it. Moses\' retelling emphasises their initiative — and therefore their culpability.'),
            ],
            'mac': [
                ('1:22–25', 'MacArthur: "Let us send men ahead to spy out the land" — the people\'s initiative reveals their fundamental posture: gathering intelligence before trusting God\'s word. God had already promised the land; the spies were designed to supplement faith with reconnaissance. The problem was not curiosity but the implicit distrust that made reconnaissance feel necessary.'),
                ('1:26–28', 'MacArthur: "You grumbled in your tents and said, \'The LORD hates us.\'" This is the wilderness generation\'s defining theological error: misreading divine discipline as divine malice. God had done nothing but bless them since Egypt. Yet one frightening report from ten spies rewrites their entire history. Fear rewrites theology.'),
                ('1:34–38', 'MacArthur: Moses\' inclusion in the judgment — barred from the land "because of you" — is one of Scripture\'s most poignant moments. Moses bore the consequences of a people he served faithfully for forty years. The leader is bound to the people he leads, even in their failure.'),
                ('1:42–44', 'MacArthur: The attempted military reversal — "we will go up and fight" after God withdrew — is the second great sin: presumption following despair. They swung from faithless retreat to faithless attack, neither sanctioned by God. Disobedience cannot be corrected by willpower; it requires repentance.'),
            ],
            'craigie': [
                ('1:26–33', 'Craigie: Moses identifies the root sin as unwillingness to trust (lo avitem, "you were not willing," v.26). The covenant demanded not merely external compliance but the surrender of will — a trust that acted before it felt ready.'),
            ],
            'tigay': [
                ('1:22', 'Tigay: The tension between Deut 1:22 (people request spies) and Num 13:1–2 (God commands the mission) reflects Moses providing his own retrospective framing, emphasising Israel\'s initiative to underscore their culpability. Both accounts are theologically true from different perspectives.'),
            ],
            'netbible': [
                ('1:37', 'NET Note: Moses says he was barred from the land "because of you" (bĕgallalkem) — literally "on your account." This is either a reference to Numbers 20 (Meribah, where the people\'s pressure contributed to his striking the rock) or a proleptic statement about their general rebelliousness.'),
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
                 'The kinship language is theologically significant: Edom are Israel\'s brothers. Israel must not despise or provoke them. The covenant community\'s obligations of decency extend even to nations outside the covenant.'),
                ('nātatî lĕkā', 'natati lekha', 'I have given to you',
                 'The repeated divine gift formula drives the chapter. God has allocated territories to Edom, Moab, and Ammon just as he has to Israel. The theology of territorial gift is universal: God is sovereign over all nations\' inheritances.'),
            ],
            'ctx': 'Deuteronomy 2 recounts thirty-eight years of wilderness wandering compressed into a few verses, then traces Israel\'s path around the territories of Edom, Moab, and Ammon. God explicitly forbids Israel from taking any land belonging to these three nations — each has received its inheritance from God just as Israel has received Canaan. Israel is to pay for food and water — behaving as peaceful guests, not conquerors. Then the tone shifts: Sihon the Amorite is a different case. God hardens Sihon\'s heart (v.30) and Israel\'s victories begin.',
            'cross': [
                ('Amos 9:7', '"\'Did I not bring Israel up from Egypt, the Philistines from Caphtor and the Arameans from Kir?\'" Amos expands Deuteronomy 2\'s theology: God orchestrates the migrations and inheritances of all nations, not just Israel.'),
                ('Acts 17:26', '"He marked out their appointed times in history and the boundaries of their lands." Paul\'s Areopagus speech draws directly on Deuteronomy 2\'s theology of divinely allocated national boundaries.'),
            ],
            'mac': [
                ('2:2–8', 'MacArthur: "Do not provoke them to war, for I will not give you any of their land." The restraint commanded toward Edom, Moab, and Ammon is a covenant lesson in proportionality — not every adversary is an enemy to be destroyed. Knowing who to fight requires knowing who not to fight.'),
                ('2:9–12', 'MacArthur: The parenthetical about the Emites and Horites establishes that God had already been clearing the land of its former inhabitants through other nations. The conquest of Canaan is not an anomaly in God\'s governance but the continuation of a long providential pattern.'),
                ('2:14–15', 'MacArthur: "Thirty-eight years passed until all that generation of fighting men had perished from the camp, as the LORD had sworn to them." The sentence is devastating in its brevity. Thirty-eight years: an entire generation buried in sand. The judgment at Kadesh was not reversed, not shortened, not negotiated. God\'s word stands.'),
                ('2:24–25', 'MacArthur: "See, I have given into your hand Sihon the Amorite... Begin to take possession of it." God gives the victory before the battle — the gift precedes the effort. Faith acts on the promised outcome, not the present circumstances.'),
            ],
            'craigie': [
                ('2:1–8', 'Craigie: The command to pay Edom for food and water reflects the ancient Near Eastern custom governing the movement of armies through foreign territory. Israel must behave as a law-abiding traveller, not an invader — God had not commissioned them to take that territory.'),
            ],
            'tigay': [
                ('2:10–12', 'Tigay: The parenthetical notes about pre-Israelite giant peoples (Emim, Horim, Zamzummin) suggest the Deuteronomic editor had access to traditions about Transjordan\'s pre-Israelite inhabitants. God had been doing this work of national displacement for generations before Israel arrived.'),
            ],
        },
        {
            'header': 'Verses 26–37 — Sihon Defeated: The Conquest Begins',
            'verses': verse_range(26, 37),
            'heb': [
                ('wayyaqšēh YHWH ʾet-rûḥô', 'vayaqsheh YHWH et-rucho', 'the LORD hardened his spirit',
                 'Divine hardening language appears here as in the Exodus narrative. The theological tension is productive: Sihon refused from his own hardness of heart, yet God was sovereign over that refusal. Human agency and divine sovereignty are both affirmed.'),
                ('yaraš', 'yarash', 'possess / dispossess / inherit',
                 'One of Deuteronomy\'s key words. Israel\'s relationship to the land is not conquest in the ordinary sense but inheritance — receiving what God has given. The possession of Canaan is simultaneously military action and covenant fulfilment.'),
            ],
            'ctx': 'Moses sends a message of peace to Sihon of Heshbon: allow Israel to pass through, purchasing food and water. Sihon refuses — God has hardened his spirit so that Israel might take his territory as the first of many inheritances. The ensuing battle results in complete victory: all towns taken, the population devoted to destruction. The territory from the Arnon to the Jabbok becomes Israel\'s first inheritance. Moses uses this victory as a theological marker: what happened to Sihon will happen to all the nations west of the Jordan.',
            'cross': [
                ('Neh 9:22', '"You gave them kingdoms and nations... They took over the country of Sihon king of Heshbon and the country of Og king of Bashan." Nehemiah\'s great prayer recites Israel\'s wilderness victories as acts of pure divine grace.'),
                ('Ps 135:10–12', '"He struck down many nations and killed mighty kings — Sihon king of the Amorites, Og king of Bashan." The Psalter\'s liturgical recitation of Sihon\'s defeat shows how this victory became a cornerstone of Israel\'s worship testimony.'),
            ],
            'mac': [
                ('2:26–29', 'MacArthur: Israel\'s peaceful overture to Sihon is not weakness but diplomacy — it reflects genuine respect for the possibility of peaceful coexistence. God does not call Israel to make war where peace is possible. The refusal was Sihon\'s choice and God\'s sovereign appointment simultaneously.'),
                ('2:30', 'MacArthur: "The LORD your God had made his spirit stubborn and his heart obstinate in order to give him into your hands." The hardening of Sihon parallels the hardening of Pharaoh. In both cases, the hardening does not create a new disposition but confirms an already existing rebellion. God does not make neutral people enemies — he firms up those who have already chosen enmity.'),
                ('2:34–35', 'MacArthur: The ḥērem applied to Sihon\'s towns is best understood within the framework of divine judicial execution: God, whose patience is infinite, had waited 400 years (Gen 15:16) while the Amorites\' wickedness ripened to judgment. Israel was not acting in self-interest but as the instrument of a patient judge whose time had finally come.'),
                ('2:36', 'MacArthur: "There was not one town too strong for us." This is faith\'s summary statement — not of Israel\'s military capability, but of God\'s absolute reliability. Every city that appeared impregnable fell before the God who gave his word.'),
            ],
            'craigie': [
                ('2:30', 'Craigie: The hardening of Sihon\'s heart is structurally parallel to the Exodus hardening of Pharaoh and serves the same theological function: demonstrating that no human will can thwart God\'s redemptive purposes. The mighty are brought low to show God\'s greatness, not Israel\'s military skill.'),
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
                ('ʿarsô bĕqar zel', 'arzav beqarzel', 'his bed was of iron',
                 'Og\'s iron bed — nine cubits by four cubits (c.4.5 × 2m) — is displayed in Rabbah as a monument. The detail establishes Og as the paradigm of the unconquerable enemy, a giant whose very furniture intimidated. Yet he fell. God\'s point is made by the monument itself.'),
                ('repāʾîm', 'refaim', 'Rephaim / giants',
                 'The Rephaim were pre-Israelite giant peoples. Og was the last of them (v.11). For Israel, defeating the last Rephaite giant carried both military and theological freight: God\'s strength surpasses all human mythology of power.'),
            ],
            'ctx': 'The victory over Og follows immediately after Sihon\'s defeat. Og commands sixty fortified cities with "high walls, gates and bars" — the kind of fortifications that had terrified the spy generation at Kadesh. But God\'s word comes: "Do not be afraid of him" (v.2). Og is defeated entirely, his territory divided between Reuben, Gad, and half-Manasseh. Moses then addresses Joshua directly (v.21): "You have seen with your own eyes all that the LORD your God has done to these two kings. The LORD will do the same to all the kingdoms over there." The pattern of Sihon and Og becomes the template of faith for the conquest.',
            'cross': [
                ('Josh 12:4–5', '"He was the last of the Rephaim. He reigned in Ashtaroth and Edrei." Joshua\'s victory list confirms the completion of what Deuteronomy anticipates.'),
                ('Ps 136:19–21', '"Sihon king of the Amorites… Og king of Bashan." The paired names become a liturgical formula — a recurring testimony to God\'s power in Israel\'s worship.'),
            ],
            'mac': [
                ('3:1–3', 'MacArthur: "The LORD our God delivered Og into our hands." The battle summary is the theological conclusion — the military action is described briefly, but God\'s decisive agency is stated first. Israel did not defeat Og; God delivered Og.'),
                ('3:11', 'MacArthur: Og\'s iron bed preserved in Rabbah is a masterpiece of theological irony. The monument meant to perpetuate the memory of Og\'s greatness perpetuates instead the testimony of his defeat. The greatest memorials to human strength become, in God\'s hands, testimonies to divine glory.'),
                ('3:18–20', 'MacArthur: The condition placed on the Transjordan tribes — your fighting men must cross with your brothers — establishes the principle that covenant community benefit requires covenant community contribution. Personal security does not release corporate responsibility.'),
                ('3:21–22', 'MacArthur: Moses commissions Joshua with the two-part pattern of every biblical commissioning: a backward look (you have seen what God did to Sihon and Og) and a forward word (God will do the same). Faith always stands on remembered grace. Joshua\'s courage is borrowed from what God has already demonstrated.'),
            ],
            'craigie': [
                ('3:3–7', 'Craigie: The ḥērem applied to Og\'s cities follows the same pattern as Sihon\'s defeat. The total destruction is a theological act — the removal of a culture so corrupted by idolatry that its preservation would have been spiritually fatal to Israel.'),
            ],
            'tigay': [
                ('3:11', 'Tigay: The reference to Og\'s bed in Rabbah is the kind of detail that suggests genuine antiquarian knowledge. The author knew of a monument in Rabbah (the Ammonite capital, later Philadelphia/Amman). Such specific local knowledge is consistent with an early date for the tradition.'),
            ],
        },
        {
            'header': 'Verses 23–29 — Moses\' Plea; the Sight from Pisgah',
            'verses': verse_range(23, 29),
            'heb': [
                ('waʾetḥannan', 'vaetchanan', 'I pleaded / I implored grace',
                 'The verb ḥānan (to implore, to seek grace) gives ch.4 its Hebrew name in Jewish tradition. Moses did not demand entry into Canaan as a right — he pleaded for grace. The prayer was refused. Even Moses, the greatest of prophets, received "no" from God.'),
                ('ʿăbōr hayyardēn', 'avor hayarden', 'cross the Jordan',
                 'The Jordan crossing is Deuteronomy\'s horizon — the event Moses will not experience but which every word of his addresses. To cross the Jordan is to enter the inheritance.'),
            ],
            'ctx': 'Moses recounts his personal prayer to enter the land — and God\'s refusal. The refusal is blunt: "That is enough. Do not speak to me anymore about this matter" (v.26). Moses is permitted to see the land from Mount Pisgah — a sight granted but not an entry achieved. Then God turns to the future: Joshua will lead them across. The Pisgah view is the most poignant scene in Deuteronomy — the greatest leader in Israel\'s history at the boundary of his own calling, seeing but not entering what God had prepared. Yet Moses speaks no bitterness.',
            'cross': [
                ('Heb 11:13', '"All these people were still living by faith when they died. They did not receive the things promised; they only saw them and welcomed them from a distance." Moses\' Pisgah view is the paradigm for faith\'s partial vision.'),
                ('Matt 17:3', '"Just then there appeared before them Moses and Elijah, talking with Jesus." The Transfiguration is the theological answer to Moses\' Pisgah prayer — he does finally enter the Promised Land, in the company of its Lord.'),
            ],
            'mac': [
                ('3:23–25', 'MacArthur: Moses\' prayer is the most intimate moment in Deuteronomy — "O Sovereign LORD, you have begun to show your servant your greatness." Even in asking for what will be refused, Moses begins with praise. The posture of petition is gratitude for what has already been given.'),
                ('3:26', 'MacArthur: "That is enough. Do not speak to me anymore about this matter." God\'s "no" to Moses is one of Scripture\'s clearest demonstrations that unanswered prayer is not a failure of faith. Moses was God\'s friend, yet this prayer was refused. The refusal was purposeful — Moses\' exclusion from Canaan was itself a theological statement about the law\'s inability to bring God\'s people into the fullness of the promise.'),
                ('3:27–28', 'MacArthur: "Look at the land with your own eyes, since you are not going to cross this Jordan." God does not deny Moses the sight — only the crossing. Grace gives what it can, even when it withholds what is asked. Moses sees the whole land — a panorama of promise.'),
                ('3:28', 'MacArthur: "Encourage and strengthen him, for he will lead this people across." Moses\' final pastoral act is not to enter the land but to prepare his successor. Leadership\'s last gift is a well-commissioned successor. The mission continues even when the leader\'s role ends.'),
            ],
            'netbible': [
                ('3:26', 'NET Note: "The LORD was angry with me because of you" — this phrase may refer to the Meribah incident (Num 20) where the people\'s pressure contributed to Moses\' failure, or it may be a more general statement about the burden of leading a rebellious people.'),
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
                 'The great imperative sounds here before it reaches its famous form in 6:4. Šāmaʿ means both "hear" and "obey" — in Hebrew, authentic hearing produces action. Israel is not called to intellectual acknowledgment but to responsive obedience that flows from hearing.'),
                ('ʾēl qannāʾ', 'el kanna', 'a jealous God',
                 'The divine attribute of qin\'ah (jealousy, zeal) is not a defect in God but a perfection — the passionate commitment of the covenant God to his people. A husband who is indifferent to his wife\'s infidelity does not love her. God\'s jealousy is the measure of his love.'),
            ],
            'ctx': 'Chapter 4 is the theological summit of the historical prologue. Moses draws out the implications of what Israel has seen: at Baal Peor, those who followed other gods died; those who held fast to the LORD lived. The statutes are wise — other nations will marvel at a people whose God is so near. The Horeb theophany is recalled: Israel heard a voice but saw no form — the basis of the aniconic command. The chapter closes with three cities of refuge in Transjordan (vv.41–43) — mercy structures built before Israel even crosses the Jordan.',
            'cross': [
                ('John 4:24', '"God is spirit, and his worshipers must worship in the Spirit and in truth." Jesus\' statement expands Deuteronomy 4\'s aniconic theology: the formless God is worshipped not through images but through Spirit-enabled response.'),
                ('Rom 1:23', '"They exchanged the glory of the immortal God for images made to look like a mortal human being and birds and animals and reptiles." Paul\'s idolatry taxonomy in Romans 1 closely follows Deuteronomy 4:15–19\'s same categories.'),
                ('Acts 17:24–29', '"The God who made the world... does not live in temples built by human hands... we should not think that the divine being is like gold or silver or stone." Paul\'s Areopagus argument is a Deuteronomy 4 address to pagans.'),
            ],
            'mac': [
                ('4:1–8', 'MacArthur: "What other nation is so great as to have such righteous decrees and laws as this body of laws?" No ancient law code approaches the Torah\'s combination of moral depth, social equity, and theological grounding. The law is Israel\'s wisdom before the nations — evidence that their God is incomparable.'),
                ('4:9', 'MacArthur: "Watch yourselves closely so that you do not forget the things your eyes have seen... Teach them to your children and to their children after them." This verse is the charter of covenant memory. Forgetting is the enemy — not dramatic apostasy but gradual fading. The antidote is active, repeated transmission to the next generation.'),
                ('4:15–20', 'MacArthur: "You heard the sound of words but saw no form" (v.12). This is Deuteronomy\'s most profound aesthetic principle: because God revealed himself without form, any form used to represent him is a lie. Images reduce the infinite to the finite, the living to the static, the personal to the impersonal.'),
                ('4:29', 'MacArthur: "But if from there you seek the LORD your God, you will find him if you seek him with all your heart and with all your soul." Even in exile — even at the furthest point of covenant failure — the door of return is open. Deuteronomy 4 anticipates the exile before Israel even enters the land and provides the theology of return that will sustain the prophets for centuries.'),
            ],
            'craigie': [
                ('4:1–8', 'Craigie: The claim that obedience to the statutes will demonstrate Israel\'s wisdom to the nations is a missional theology embedded in the law itself. Israel\'s covenant life is not private religion but public testimony.'),
                ('4:32–35', 'Craigie: Moses\' appeal to history is the ancient Near Eastern equivalent of the historical prologue in suzerainty treaties — the great king recounts his past acts of grace as the basis for demanding loyalty. Obedience flows from gratitude, not merely obligation.'),
            ],
            'tigay': [
                ('4:41–43', 'Tigay: The three Transjordan cities of refuge established at the end of ch.4 are functionally anticipatory — they apply Deuteronomy\'s legislation to territory Israel already controls before the Jordan is crossed.'),
            ],
        },
        {
            'header': 'Verses 41–49 — Cities of Refuge; Setting of the Second Address',
            'verses': verse_range(41, 49),
            'heb': [
                ('ʿārê hammiqlāṭ', 'arei hamiklaṭ', 'cities of refuge / asylum cities',
                 'Miqlaṭ (refuge, asylum) — a place of protection from the blood avenger. The cities of refuge are mercy institutions built into the legal fabric of Israel. The principle: death without due process is not justice.'),
            ],
            'ctx': 'Moses designates three cities of refuge east of the Jordan: Bezer in the plateau wilderness (for Reuben), Ramoth in Gilead (for Gad), and Golan in Bashan (for Manasseh). The legal principle is that the unintentional killer must not be executed before a proper hearing. Three more cities will be designated west of the Jordan after the conquest (19:1–9). The passage ends by re-establishing the setting for Moses\' second and longest address.',
            'cross': [
                ('Num 35:9–28', '"Select some towns to be your cities of refuge." The Numbers legislation provides the full theological rationale that Deuteronomy 19 will elaborate — intentional vs. unintentional homicide and the role of the congregation.'),
                ('Heb 6:18', '"We who have fled to take hold of the hope set before us may be greatly encouraged." Hebrews uses the cities of refuge as a typological backdrop for the safety found in Christ.'),
                ('Josh 20:1–9', 'Joshua designates all six cities of refuge — three east, three west — fulfilling the Deuteronomic command precisely.'),
            ],
            'mac': [
                ('4:41–43', 'MacArthur: The cities of refuge are a theological institution as well as a legal one. They embody the principle that guilt requires proportionality: unintentional killing is not murder. The law distinguishes between what the heart intended and what the hand caused.'),
                ('4:44–49', 'MacArthur: The transitional paragraph re-grounds the second address in historical reality: this is spoken in the valley near Beth Peor — the very site of the Baal Peor apostasy (Num 25). Moses does not avoid difficult geography. He delivers covenant renewal precisely where the covenant was most recently violated.'),
                ('4:41', 'MacArthur: The cities of refuge are built before a single western chapter is conquered — mercy structures established even before the law\'s full application begins. This is the pattern of the whole Bible: grace precedes demand.'),
                ('4:35–36', 'MacArthur: "You were shown these things so that you might know that the LORD is God; besides him there is no other." The incomparable God is not merely a cosmological claim but a pastoral foundation: the same God who owns the cosmos has personally addressed Israel.'),
            ],
            'netbible': [
                ('4:41', 'NET Note: The three Transjordan cities of refuge (Bezer, Ramoth, Golan) are named here for the first time in Deuteronomy. Their immediate designation before the Jordan crossing shows Moses acting on the covenant promises as if they are already secured — a model of anticipatory faith.'),
            ],
        },
    ],
})

print("DEUT-1 complete: chapters 1–4 built.")
