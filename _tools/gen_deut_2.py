"""DEUT-2: Deuteronomy chapters 5–11 — Decalogue, Shema, Core Covenant"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

deu(5, {
    'title': 'The Ten Commandments Restated: Covenant at Horeb',
    'sections': [
        {
            'header': 'Verses 1–21 — The Decalogue: What God Spoke at Horeb',
            'verses': verse_range(1, 21),
            'heb': [
                ('bĕrît', 'berit', 'covenant',
                 'Deuteronomy\'s central word. The Decalogue is not a law code imposed on strangers but the terms of a relationship already established by grace. The preamble ("I am the LORD your God, who brought you out of Egypt") comes first: redemption precedes obligation.'),
                ('lōʾ tirsāḥ', 'lo tirtzach', 'you shall not murder',
                 'The sixth commandment uses rāṣaḥ — a specific term for illegal killing (murder), not all killing. The OT does not prohibit capital punishment or warfare. The prohibition is against taking human life in violation of God\'s judicial authority.'),
            ],
            'ctx': 'Moses restates the Decalogue (cf. Exod 20:1–17) with significant variations. The most notable: the sabbath commandment is grounded not in creation (as in Exodus) but in the Exodus redemption — "remember that you were slaves in Egypt" (v.15). The rest day commemorates liberation as much as creation. Moses also adds: he stood between God and the people because they feared the fire (vv.5, 22–27). The Decalogue is received through a mediator, anticipating the pattern of all covenantal mediation that culminates in Christ.',
            'cross': [
                ('Matt 5:17–20', '"Do not think that I have come to abolish the Law or the Prophets; I have not come to abolish them but to fulfil them." Jesus\'s relationship to the Decalogue is fulfilment, not replacement — he intensifies the commands toward their inner, heart-level intent.'),
                ('Rom 13:8–10', '"Love does no harm to a neighbour. Therefore love is the fulfilment of the law." Paul reads the second table of the Decalogue as summarised in love.'),
                ('Exod 20:1–17', 'The Decalogue\'s first occurrence. The Deuteronomic restatement with its Exodus-grounded sabbath is not a contradiction but a deliberate pastoral expansion.'),
            ],
            'mac': [
                ('5:1–5', 'MacArthur: "The LORD our God made a covenant with us at Horeb. It was not with our ancestors that the LORD made this covenant, but with us, with all of us who are alive here today." Moses addresses the second generation as if present at Horeb, making the covenant personally applicable. Every generation is addressed by the covenant as directly as those who first received it. Scripture is not historical document — it is living address.'),
                ('5:6–7', 'MacArthur: "I am the LORD your God, who brought you out of Egypt, out of the land of slavery. You shall have no other gods before me." The preamble precedes the command: redemption grounds obligation. God does not begin with "thou shalt" but with "I am — and I rescued you." The basis of covenant obedience is always grace received, not duty performed. This ordering is the antidote to legalism.'),
                ('5:12–15', 'MacArthur: The sabbath\'s Exodus rationale — "remember that you were slaves in Egypt" — gives the rest day a social justice dimension absent from Exodus 20. Slaves have no rest. The sabbath is Israel\'s weekly enacted testimony that they are free — and that their servants, animals, and even strangers deserve that freedom too. Sabbath is liberation theology, not merely liturgical calendar.'),
                ('5:22–27', 'MacArthur: The people\'s request for Moses to mediate — "speak to us yourself and we will listen" — is both an act of fear and an act of faith. They recognise that direct encounter with the holy God is more than they can bear. This instinct is correct: the incarnation will be God\'s ultimate answer to it. When Israel says "let Moses speak to us," they are expressing the need that the Word-made-flesh will permanently meet.'),
            ],
            'craigie': [
                ('5:6', 'Craigie: The treaty preamble formula — "I am the LORD your God" — is identical in structure to Hittite suzerainty treaty introductions where the great king identifies himself. The Decalogue is embedded in a specific covenant between a specific God and a specific people.'),
            ],
            'tigay': [
                ('5:15', 'Tigay: The shift from the creation basis of the sabbath (Exod 20:11) to the Exodus basis (Deut 5:15) does not represent a contradiction. Both rationales are valid and complementary — the sabbath is both a creation ordinance and a redemption memorial.'),
            ],
        },
        {
            'header': 'Verses 22–33 — The Mediator\'s Role; Life and Obedience',
            'verses': verse_range(22, 33),
            'heb': [
                ('kol-ʾăšer dabbēr YHWH', 'kol-asher dibber YHWH', 'all that the LORD our God has spoken',
                 'The people\'s summary of their commitment is comprehensive — "everything the LORD our God says." The scope of covenant loyalty is total, not selective. You cannot choose which commandments to follow; the covenant is an integrated whole.'),
            ],
            'ctx': 'After the Decalogue, Moses recounts the people\'s terrified response: let Moses mediate, for if we hear God directly we will die. God affirms this response: "They are right in what they have said" (v.28). The fear was appropriate — the holy God\'s direct voice is death to sinful humanity. The mediator pattern is established as theological necessity. Moses is then commissioned to receive all the commandments and teach the people — the structure of Deuteronomy\'s entire second address.',
            'cross': [
                ('1 Tim 2:5', '"For there is one God and one mediator between God and mankind, the man Christ Jesus." Paul\'s statement is the NT answer to Deuteronomy 5:27 — the people\'s request for a mediator is ultimately answered in the one mediator who is both fully divine and fully human.'),
                ('Gal 3:19–20', '"The law was given through angels and entrusted to a mediator." Paul draws on the Deuteronomy 5 mediator structure to contrast the Sinai covenant with the direct promise to Abraham.'),
            ],
            'mac': [
                ('5:28–29', 'MacArthur: "I have heard what this people said to you. Everything they said was good." God\'s endorsement of Israel\'s request for mediation is remarkable. The holy God affirms human recognition of the need for a go-between. And then the pathos: "Oh, that their hearts would be inclined to fear me and keep all my commands always!" This is God\'s longing — not for mechanical compliance but for willing, joyful covenant faithfulness. Deuteronomy is the book of the heart because God longs for the heart.'),
                ('5:32–33', 'MacArthur: "Do not turn aside to the right or to the left. Walk in obedience to all that the LORD your God has commanded you, so that you may live and prosper." The final exhortation is movement — "walk." Covenant faithfulness is a journey, not a position. The image is not a statue in a shrine but a person in motion, keeping to the path that God has marked.'),
            ],
        },
    ],
})

deu(6, {
    'title': 'The Great Commandment: The Shema and Love for God',
    'sections': [
        {
            'header': 'Verses 1–19 — The Shema; Love for God; the Mezuzah',
            'verses': verse_range(1, 19),
            'heb': [
                ('šĕmaʿ yiśrāʾēl YHWH ʾĕlōhênû YHWH ʾeḥād',
                 'Shema Yisrael YHWH Eloheinu YHWH Echad',
                 'Hear O Israel: the LORD our God, the LORD is one',
                 'The Shema is the most important statement in Judaism. Echad (one) speaks of uniqueness, undivided loyalty, and incomparability. God is not one of many; he is the one and only. The Shema is simultaneously a theological claim (monotheism) and a covenant demand (exclusive loyalty).'),
                ('ʾāhabtā ʾēt YHWH ʾĕlōhêkā bĕkol-lĕbābĕkā',
                 'veahavta et YHWH Elohekha bechol-levavkha',
                 'you shall love the LORD your God with all your heart',
                 'The great command is love — ahav, deep personal affection and loyal commitment. To love God with "all your heart, all your soul, all your might" is to give every dimension of the self. The tripling of "all" (kol) intensifies the demand: no part of the self is exempt from the covenant claim.'),
            ],
            'ctx': 'Deuteronomy 6 is the heart of the book. After the prologue and Decalogue, Moses gives the summary: the Shema (vv.4–5) — the declaration of God\'s oneness and the command to love him completely. Jesus will call it the greatest commandment (Matt 22:37–38). The chapter then provides the practical pedagogy: teach these words constantly — at home, walking, lying down, rising. Bind them on hand and forehead, write them on doorposts. The mezuzah and tefillin that will define Jewish practice for millennia are rooted here.',
            'cross': [
                ('Matt 22:37–38', '"Love the Lord your God with all your heart and with all your soul and with all your mind. This is the first and greatest commandment." Jesus quotes Deut 6:5 as the summary of the entire law.'),
                ('Mark 12:29–30', '"The most important one is this: Hear, O Israel: The Lord our God, the Lord is one. Love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength." Mark\'s version adds "strength" as a fourth dimension.'),
                ('Luke 10:27', '"Love the Lord your God with all your heart and with all your soul and with all your strength and with all your mind; and love your neighbour as yourself." The lawyer combines Deut 6:5 and Lev 19:18 — precisely the summary Jesus endorses.'),
            ],
            'mac': [
                ('6:4–5', 'MacArthur: The Shema is not merely an affirmation of monotheism — it is a covenant commitment. "The LORD is one" means not only that there is one God but that Israel\'s God is absolutely the object of their loyalty. The demand for love "with all your heart" means the love must be total, not divided between God and competing allegiances. Every other love in the human heart must be ordered under and through this love.'),
                ('6:6–9', 'MacArthur: "These commandments that I give you today are to be on your hearts." Heart, home, travel, sleep, rising, hand, forehead, doorpost: every dimension of life is saturated with the covenant words. The pedagogy of Deuteronomy is total immersion, not weekly instruction. The covenant is not a department of life but the atmosphere of life.'),
                ('6:10–12', 'MacArthur: "When the LORD your God brings you into the land... be careful that you do not forget the LORD." The warning about prosperity is more urgent than the warning about poverty. Hardship tends to drive people to God; abundance tends to make God feel unnecessary. Deuteronomy anticipates the spiritual danger of success: a good land, fine houses, wells you did not dig, vineyards you did not plant — and then forgetting who gave them all.'),
                ('6:16', 'MacArthur: "Do not put the LORD your God to the test as you did at Massah." Jesus quotes this verse in rejecting Satan\'s suggestion that he jump from the Temple (Matt 4:7). Testing God means demanding proof before trusting — treating God as a subject of experiment rather than an object of faith.'),
            ],
            'craigie': [
                ('6:4', 'Craigie: The Shema\'s echad is better understood as "alone" or "unique" than merely "one." God is not one of many — he is in a category by himself. The monotheism implied is exclusive not merely numerical.'),
                ('6:6–9', 'Craigie: The pedagogical method of Deut 6:6–9 is total saturation — every moment and every place is a site of covenant formation. This reflects the ancient Near Eastern understanding that covenant loyalty must be cultivated through constant rehearsal.'),
            ],
            'tigay': [
                ('6:5', 'Tigay: The call to love God with "all your heart" uses the double-yod spelling of lev (heart), which rabbinic tradition interpreted as directing both the good and evil inclinations toward God. The full self — including its tendency toward evil — is called into the covenant relationship.'),
            ],
        },
        {
            'header': 'Verses 20–25 — Teaching the Next Generation: Exodus as Foundation',
            'verses': verse_range(20, 25),
            'heb': [
                ('ʿăbādîm hāyînû lĕpharʿōh bĕmiṣrāyim', 'avadim hayinu lePharaoh beMitzrayim',
                 'we were slaves of Pharaoh in Egypt',
                 'The catechetical formula is in the first person plural — not "they were slaves" but "we were." Every generation rehearses the Exodus as personal history. The covenant is not inherited intellectually but re-appropriated through re-telling.'),
            ],
            'ctx': 'The chapter closes with the Deuteronomic catechism: when your child asks "why these laws?" you answer with the Exodus narrative. The answer to religious formation\'s "why" is always historical: because God acted, because we were slaves and God freed us. Law is not arbitrary command but the shape of a redeemed life. This catechetical framework — child asks, parent tells the Exodus story — becomes the structural principle of Passover pedagogy.',
            'cross': [
                ('Exod 12:26–27', '"When your children ask you, \'What does this ceremony mean to you?\' then tell them..." The Passover catechism is the origin of Deuteronomy 6:20–25\'s pedagogical structure.'),
                ('1 Pet 3:15', '"Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have." Peter\'s NT catechetical instruction has the same structure as Deut 6:20–25: be ready to answer questions about faith with testimony to what God has done.'),
            ],
            'mac': [
                ('6:20–21', 'MacArthur: "In the future, when your son asks you, \'What is the meaning of the stipulations, decrees and laws the LORD our God has commanded you?\' tell him: \'We were slaves of Pharaoh in Egypt.\'" The pedagogy begins with narrative, not doctrine. The answer to "why do we live like this?" is "because of what God did for us." Identity precedes ethics: you are a redeemed people, and your life should look like what you are.'),
                ('6:24–25', 'MacArthur: "And if we are careful to obey all this law before the LORD our God, as he has commanded us, that will be our righteousness." This is not about earning salvation — Israel was already redeemed from Egypt before any law was given. The "righteousness" described is covenant faithfulness — living consistently with the salvation already received. It is the OT equivalent of "work out your salvation with fear and trembling" (Phil 2:12).'),
            ],
        },
    ],
})

deu(7, {
    'title': 'Driving Out the Nations: Holy People, Uncompromising Separation',
    'sections': [
        {
            'header': 'Verses 1–16 — No Compromise with Canaan; the Holy People',
            'verses': verse_range(1, 16),
            'heb': [
                ('ḥāram', 'charam', 'devote to destruction / ban / herem',
                 'Ḥāram means to dedicate something irrevocably to God — in this case for total destruction. The Canaanite herem is not ethnic but theological: contamination prevention. The rationale: intermarriage will lead to idolatry (v.4).'),
                ('ʿam qādôš', 'am kadosh', 'holy people',
                 'Qadosh (holy) means set apart, distinct, consecrated. Israel is "a holy people to the LORD your God" — not because of their size or virtue (v.7) but because of God\'s election and love. Holiness is a gift before it is a demand.'),
            ],
            'ctx': 'Chapter 7 addresses the herem applied to the seven Canaanite nations. Moses gives three rationales: (1) contamination — intermarriage will lead to idolatry; (2) election — God chose Israel not because of size or merit but out of love; (3) faithfulness — God keeps covenant with those who love him. The command is not racial genocide but a theological surgical procedure: removing the cancer of Canaanite religion before it destroys Israel\'s covenant identity.',
            'cross': [
                ('1 Pet 2:9', '"But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession." Peter applies Deut 7:6\'s election language to the church — the NT Israel is a "holy nation" by new-covenant inclusion.'),
                ('2 Cor 6:14–17', '"Do not be yoked together with unbelievers... \'Come out from them and be separate, says the Lord.\'" Paul applies the principle of Deut 7\'s separation to the church\'s relationship with idolatrous culture.'),
            ],
            'mac': [
                ('7:1–4', 'MacArthur: The prohibition of intermarriage with Canaanite peoples is not ethnic prejudice — it is spiritual self-preservation. Solomon\'s violation of exactly this command (1 Kgs 11:1–4) proves Moses right: his foreign wives "turned his heart after other gods." Deuteronomy 7 is not about racial purity; it is about covenant integrity.'),
                ('7:6–8', 'MacArthur: "The LORD did not set his affection on you and choose you because you were more numerous than other peoples — for you were the fewest. But it was because the LORD loved you." This is election in its purest form: unconditional, personal, sovereign. Nothing in Israel merited God\'s love. The love came first and created the people it loved. This is the theological foundation of all grace.'),
                ('7:9–11', 'MacArthur: "Know therefore that the LORD your God is God; he is the faithful God, keeping his covenant of love to a thousand generations of those who love him." Divine faithfulness is the ground of human faithfulness. The thousand-generation timeframe of his covenant love dwarfs any human timeframe. Israel\'s faithfulness is called forth by and modelled on God\'s own.'),
                ('7:12–16', 'MacArthur: The blessings promised for covenant faithfulness — children, crops, cattle, health — are not health-and-wealth theology. They are the natural fruit of a society ordered according to God\'s design. Creation was designed to flourish under the stewardship of covenant humanity.'),
            ],
            'craigie': [
                ('7:1–2', 'Craigie: The seven nations list is a conventional formula for the pre-Israelite inhabitants of Canaan. The herem command applies to the theological category — peoples whose religious practices posed an existential threat to Israel\'s covenant identity.'),
            ],
        },
        {
            'header': 'Verses 17–26 — Do Not Be Afraid; God Will Drive Them Out',
            'verses': verse_range(17, 26),
            'heb': [
                ('lōʾ tîrāʾ mēhem', 'lo tira mehem', 'do not be afraid of them',
                 'The fear prohibition is Deuteronomy\'s repeated pastoral refrain. The wilderness generation was disqualified by fear at Kadesh. "Do not be afraid" is not a denial of the enemy\'s power but a reorientation: the enemy\'s power is real, but God\'s power is infinitely greater.'),
            ],
            'ctx': 'Moses anticipates the objection: what if the nations are too numerous? The answer: remember what God did to Pharaoh and Egypt. He will drive out the nations "little by little" (v.22) — not all at once, because the land needs time to be inhabited and wild animals would multiply in empty territory. The gradualness is providential wisdom, not delay. The chapter closes with instructions on destroying idols — even the silver and gold of their images must not be kept.',
            'cross': [
                ('2 Tim 1:7', '"For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." Paul\'s antidote to fear echoes Deuteronomy 7\'s repeated "do not be afraid" — both are grounded in the character and power of God.'),
            ],
            'mac': [
                ('7:17–19', 'MacArthur: "You may say to yourselves, \'These nations are stronger than we are. How can we drive them out?\' But do not be afraid of them; remember well what the LORD your God did to Pharaoh and to all Egypt." Memory is Moses\' primary weapon against fear. The antidote to the fear of overwhelming opposition is meditation on God\'s demonstrated power.'),
                ('7:22', 'MacArthur: "The LORD your God will drive out those nations before you, little by little." The gradual conquest is explicitly providential — not a failure of divine power but an act of divine wisdom. Trusting God\'s timing means accepting that his schedule serves purposes we cannot always see.'),
                ('7:25–26', 'MacArthur: The prohibition on keeping the gold and silver of idols is an anti-materialism command with theological bite. "Do not covet the silver and gold on them... it is detestable to the LORD." Achan\'s sin in Joshua 7 is the precise violation Moses is anticipating here.'),
            ],
        },
    ],
})

deu(8, {
    'title': 'Remember the Wilderness; Do Not Forget God When You Prosper',
    'sections': [
        {
            'header': 'Verses 1–10 — The Wilderness Discipline: God\'s Pedagogical Purpose',
            'verses': verse_range(1, 10),
            'heb': [
                ('lĕmaʿan ʿannōtkā lĕnassōtkā', 'lema\'an anotcha lenasotkha',
                 'in order to humble you and to test you',
                 'The wilderness is intentional divine pedagogy. Anah (to humble, afflict) and nasah (to test, prove) are education terms: the wilderness was a school, not merely a punishment. The same word nasah is used of God\'s testing of Abraham (Gen 22:1).'),
                ('lōʾ ʿal-halleḥem lĕbaddô yiḥyeh hāʾādām',
                 'lo al-halechem levado yichyeh haadam',
                 'man does not live on bread alone',
                 'The manna was physical provision whose purpose was spiritual formation. Life is sustained by God\'s word, not merely by calories. Jesus quotes this in the wilderness temptation (Matt 4:4), deliberately re-entering Israel\'s wilderness experience.'),
            ],
            'ctx': 'Chapter 8 is Deuteronomy\'s theology of the wilderness. The forty years were not divine abandonment but divine education: God humbled Israel to test what was in their hearts, to teach them that life comes from God\'s word. The manna was a lesson in dependence — daily provision that could not be stored, requiring daily trust. Their clothing did not wear out; their feet did not swell. The wilderness is a place of care, not merely trial. The purpose: that Israel might know that the LORD disciplines them as a father disciplines a child (v.5).',
            'cross': [
                ('Matt 4:4', '"It is written: Man shall not live on bread alone, but on every word that comes from the mouth of God." Jesus quotes Deut 8:3 in his wilderness temptation, deliberately identifying himself with Israel\'s wilderness experience and succeeding where they failed.'),
                ('Prov 3:11–12', '"My son, do not despise the LORD\'s discipline... because the LORD disciplines those he loves." Proverbs develops the Deuteronomy 8:5 father-child discipline theology.'),
                ('Heb 12:5–11', '"The Lord disciplines the one he loves, and he chastens everyone he accepts as his son." Hebrews 12 is a sustained theological development of Deuteronomy 8\'s pedagogical interpretation of suffering.'),
            ],
            'mac': [
                ('8:2–3', 'MacArthur: "He humbled you, causing you to hunger and then feeding you with manna... to teach you that man does not live on bread alone but on every word that comes from the mouth of the LORD." The sequence is deliberate: hunger first, then manna. The hunger was not an accident but a preparation. God created the need in order to demonstrate the provision. The same pattern runs through all spiritual formation: the emptying precedes the filling.'),
                ('8:5', 'MacArthur: "Know then in your heart that as a man disciplines his son, so the LORD your God disciplines you." The father-child metaphor is one of Scripture\'s most important theological claims. Discipline is a sign of sonship, not rejection. The wilderness was not divine hostility but divine parenting. This reframes every trial: not "why is God allowing this?" but "what is my Father teaching me here?"'),
                ('8:7–10', 'MacArthur: The description of Canaan\'s abundance — wheat, barley, vines, figs, pomegranates, olive oil, honey, iron ore, copper — is the anti-wilderness. Where the wilderness had no food, Canaan overflows. But Moses\' tone is warning, not celebration: prosperity is the harder test. Hardship often produces faith; comfort often produces forgetfulness.'),
                ('8:10', 'MacArthur: "When you have eaten and are satisfied, praise the LORD your God for the good land he has given you." The command to praise God after a meal is the origin of the Birkat Hamazon (Grace after Meals) in Jewish practice. Gratitude is not an optional response to blessing — it is a covenant obligation.'),
            ],
            'craigie': [
                ('8:2–5', 'Craigie: The pedagogical interpretation of the wilderness is unique to Deuteronomy. Numbers presents the wilderness more as a place of rebellion and judgment; Deuteronomy reframes it as a school of dependence. Both perspectives are true — the same events carry different theological registers.'),
            ],
        },
        {
            'header': 'Verses 11–20 — The Prosperity Trap: Do Not Forget the LORD',
            'verses': verse_range(11, 20),
            'heb': [
                ('pen-tiškāḥ ʾet-YHWH ʾĕlōhêkā', 'pen-tishkach et-YHWH Elohekha',
                 'lest you forget the LORD your God',
                 'The pen (lest) + forgetting formula is Moses\' characteristic warning structure. Forgetting (shakach) in the covenant context means practical amnesia: living as if God did not exist, did not give, did not sustain. It is not primarily intellectual doubt but behavioural independence.'),
                ('kōḥî wĕʿōṣem yādî', 'kochi veozem yadi', 'my power and the strength of my hand',
                 'The prosperity trap is self-attribution — "my power produced this wealth." The arrogance is subtle: not a denial of God\'s existence but a re-attribution of outcomes.'),
            ],
            'ctx': 'The prosperity warning is urgent: when you have built fine houses, when your herds have grown, when your silver and gold have increased — then your heart will become proud and you will forget the LORD. Moses anticipates the exact psychological mechanism of covenant forgetting: prosperity produces pride, pride produces self-sufficiency, self-sufficiency produces amnesia about God. The corrective is attribution — "remember the LORD your God, for it is he who gives you the ability to produce wealth" (v.18).',
            'cross': [
                ('Luke 12:16–21', 'Jesus\' parable of the Rich Fool is the dramatic illustration of Deuteronomy 8:17 — "my power and the strength of my hand have produced this wealth for me."'),
                ('1 Cor 4:7', '"What do you have that you did not receive? And if you did receive it, why do you boast as though you did not?" Paul\'s rhetorical question is a NT Deuteronomy 8 moment — the re-attribution of all gifts to God.'),
            ],
            'mac': [
                ('8:11–14', 'MacArthur: Moses lists the sequence of prosperity\'s spiritual danger with clinical precision: satisfaction → pride → forgetting. The slide is gradual and almost imperceptible. No Israelite planned to forget God; each small step toward self-sufficiency felt justified. Spiritual disciplines are Israel\'s structural resistance to this gravitational pull. You do not accidentally remember God; you must build remembrance into the architecture of your life.'),
                ('8:17–18', 'MacArthur: "You may say to yourself, \'My power and the strength of my hands have produced this wealth for me.\' But remember the LORD your God, for it is he who gives you the ability to produce wealth." The theology of secondary causation: human effort is real, but the ability to work is itself a gift. Every skill, every opportunity, every health that enables work — all are grace, not achievement.'),
                ('8:19–20', 'MacArthur: "If you ever forget the LORD your God and follow other gods... I testify against you today that you will surely be destroyed." Deuteronomy does not traffic in vague spiritual discouragement — it speaks covenant consequences plainly. The destruction of prosperous Israel will mirror the destruction of the Canaanites before them: both perished for the same sin.'),
            ],
        },
    ],
})

deu(9, {
    'title': 'Not Because of Your Righteousness: The Lesson of the Golden Calf',
    'sections': [
        {
            'header': 'Verses 1–12 — God\'s Grace, Not Israel\'s Merit',
            'verses': verse_range(1, 12),
            'heb': [
                ('lōʾ bĕṣidqātĕkā', 'lo betzidkat\'kha', 'not because of your righteousness',
                 'The negative is emphatic and repeated — "not because of your righteousness, not because of your uprightness" (vv.4–5, 6). Israel must never conclude that the conquest rewards moral achievement. The land is given; it is not earned. This anti-merit theology is foundational to understanding grace in the OT.'),
                ('qĕšē-ʿōrep', 'keshe-oref', 'stiff-necked',
                 'The characterisation "stiff-necked" (literally "hard of neck") is Israel\'s defining label for its own obstinacy. A stiff-necked animal resists the yoke; a stiff-necked people resists divine guidance. This is Israel\'s characteristic sin — not dramatic apostasy but persistent resistance to God\'s direction.'),
            ],
            'ctx': 'Chapter 9 is a sustained theological argument against Israelite pride. Moses is emphatic: you are not getting Canaan because you are righteous — you are getting it because the nations are wicked (v.5) and because God made promises to Abraham, Isaac, and Jacob. And to prove the point, he goes through the catalogue of Israel\'s wilderness failures: the golden calf, Taberah, Massah, Kibroth-hattaavah, and Kadesh (vv.22–24). The generation about to enter Canaan must understand that they enter not as righteous conquerors but as undeserving recipients of covenant mercy.',
            'cross': [
                ('Rom 11:17–21', '"Do not be arrogant, but tremble." Paul applies the Deuteronomy 9 anti-pride warning to Gentile Christians — do not conclude that inclusion in God\'s covenant is a reward for merit.'),
                ('Eph 2:8–9', '"For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast." The Ephesian statement of grace is the NT form of Deut 9:4–6\'s anti-merit theology.'),
            ],
            'mac': [
                ('9:4–6', 'MacArthur: "After the LORD your God has driven them out before you, do not say to yourself, \'The LORD has brought me here because of my righteousness.\'" The pre-emptive strike against pride is Moses\' most important pastoral act in Deuteronomy. Spiritual success — answered prayer, military victory, economic prosperity — has a unique capacity to produce self-congratulation. The antidote is theological clarity: grace, not merit, explains every good gift.'),
                ('9:7', 'MacArthur: "Remember this and never forget how you aroused the anger of the LORD your God in the wilderness. From the day you left Egypt until you arrived here, you have been rebellious against the LORD." The summary is devastating. Not "you occasionally stumbled" but "from the day you left Egypt, you have been rebellious." The grace that carried this people carried them through habitual failure, not occasional lapse.'),
                ('9:9–11', 'MacArthur: Moses was on the mountain for forty days without food or water, receiving the two stone tablets. This is the pinnacle of Israel\'s covenant history, the moment of Torah reception. And then, immediately, the catastrophe of the golden calf. The pattern of ch.9 — greatest covenant moment followed by greatest covenant failure — is repeated throughout the Bible.'),
                ('9:12', 'MacArthur: "\'Go down from here at once, because your people whom you brought out of Egypt have become corrupt.\'" God\'s "your people" addressing Moses — not claiming them for himself — is a momentary theological distancing that mirrors Exod 32:7. In the moment of deepest failure, God speaks as if Moses owns them. Moses will respond by claiming them back — "they are your people" (Deut 9:26–29).'),
            ],
            'craigie': [
                ('9:4–6', 'Craigie: The anti-righteousness argument is structurally parallel to the election argument of ch.7: just as God chose Israel not because of their greatness but because of his love, now God gives them the land not because of their righteousness but because of the nations\' wickedness and his oath to the patriarchs. In both cases the initiative is entirely God\'s and the human contribution is zero.'),
            ],
        },
        {
            'header': 'Verses 13–29 — The Golden Calf; Moses\' Intercession',
            'verses': verse_range(13, 29),
            'heb': [
                ('wayyitqōṣep YHWH', 'vayitkatzef YHWH', 'the LORD was angry / wrathful',
                 'The divine anger is not arbitrary rage but the covenant response to covenant betrayal. Divine wrath in Deuteronomy is always the other side of divine love — the depth of the anger measures the depth of the commitment.'),
                ('zĕkōr lĕʿabdêkā lĕʾabrāhām', 'zechor laavadekha leAvraham',
                 'remember your servants Abraham',
                 'Moses\' intercessory prayer appeals to the Abrahamic covenant — the prior, unconditional promises God made to the patriarchs. This is covenant intercession at its most theologically precise: Moses is not arguing that Israel deserves mercy but that God has bound himself by oath.'),
            ],
            'ctx': 'Moses recounts the golden calf incident: God\'s anger, the tablets smashed, the intercession lasting forty days and nights. The intercession is the theological centre. Moses does not argue Israel\'s righteousness. He argues three things: (1) Your reputation is at stake — Egypt will mock you; (2) Your promises are at stake — you swore to Abraham; (3) This is your people and your inheritance. The intercession works — Israel is not destroyed. Moses here is at his most Christlike: standing between a guilty people and a righteous God.',
            'cross': [
                ('Exod 32:11–14', '"LORD, why should your anger burn against your people, whom you brought out of Egypt?" Moses\' intercession in Exodus 32 is the source text for Deuteronomy 9\'s retrospective.'),
                ('Heb 7:25', '"He is able to save completely those who come to God through him, because he always lives to intercede for them." The pattern of Mosaic intercession in Deuteronomy 9 anticipates Christ\'s perpetual high-priestly intercession.'),
            ],
            'mac': [
                ('9:18–19', 'MacArthur: "Then once again I fell prostrate before the LORD for forty days and forty nights; I ate no bread and drank no water, because of all the sin you had committed." Moses\' forty-day fast is intercessory self-denial — he identifies with the people he is pleading for. This foreshadows the full incarnational solidarity of Christ.'),
                ('9:20', 'MacArthur: "And the LORD was angry enough with Aaron to destroy him, but at that time I prayed for Aaron too." The brief note about Aaron\'s personal danger — and Moses\' intercession for him — is one of Deuteronomy\'s most revealing moments. Moses prayed for the man whose cowardice caused the catastrophe. Intercession covers the guilty, not only the innocent.'),
                ('9:25–29', 'MacArthur: Moses\' intercession is covenant advocacy: "Do not destroy your people, your own inheritance that you redeemed by your great power." He returns the people to God — "they are yours" — and reminds God of his own investment in them. The argument is not Israel\'s merit but God\'s commitment. This is still the only ground on which prayer for the guilty can stand.'),
            ],
        },
    ],
})

deu(10, {
    'title': 'The Second Tablets; the Ark; Love and Fear of God',
    'sections': [
        {
            'header': 'Verses 1–11 — New Tablets; the Ark; Levitical Appointment',
            'verses': verse_range(1, 11),
            'heb': [
                ('wĕkātabtî ʿal-hallûḥōt', 'vechtavti al-haluchot', 'and I will write on the tablets',
                 'The divine writing is the covenant\'s authentication — God himself inscribed the Decalogue. The second set of tablets (after Moses shattered the first) represents covenant renewal: the covenant broken by Israel\'s sin is restored by God\'s grace. The second tablets are more remarkable than the first — they come after the failure, not before it.'),
                ('ʾărôn hāʿēṣîm', 'aron haetzim', 'ark of acacia wood',
                 'The simple description — an acacia wood box — is deliberate understatement. The ark\'s significance is entirely in its contents (the covenant tablets) and its role (the meeting point between God and Israel). God\'s dwelling is defined not by architectural grandeur but by the presence of his word.'),
            ],
            'ctx': 'Moses recounts the aftermath of the golden calf: new stone tablets, their deposit in the ark, the death of Aaron, the Levites\' appointment to priestly service. The sequence is remarkable — immediately after Israel\'s greatest failure comes the restoration of all the institutions of worship. The covenant is not merely resumed; it is rebuilt on the same terms. This is the pattern of divine grace: not a lowering of standards after failure but full restoration of the original covenant.',
            'cross': [
                ('Heb 9:4', '"This ark contained the gold jar of manna, Aaron\'s staff that had budded, and the stone tablets of the covenant." The author of Hebrews describes the ark\'s contents as a summary of Israel\'s covenant history.'),
                ('2 Cor 3:3', '"Written not with ink but with the Spirit of the living God, not on tablets of stone but on tablets of human hearts." Paul reinterprets the stone tablets through the new covenant of Jer 31:33.'),
            ],
            'mac': [
                ('10:1–5', 'MacArthur: The restoration of the tablets is a theology of grace in miniature. Israel broke the covenant; God wrote it again. No renegotiation, no reduction in terms — the original covenant is simply restored. This is the pattern of God\'s dealings with his people: not a lowered bar after failure but full restoration after repentance.'),
                ('10:8–9', 'MacArthur: "At that time the LORD set apart the tribe of Levi to carry the ark of the covenant, to stand before the LORD to minister and to pronounce blessings in his name." The Levites carry, minister, and bless — a threefold vocation. They have "no inheritance" in the land because the LORD himself is their inheritance. Those who serve God fully are sustained by God fully.'),
                ('10:10–11', 'MacArthur: "And the LORD listened to me at this time also." Moses\' intercession was heard — twice. Prayer does not change God\'s ultimate purposes, but it participates in the means by which God accomplishes them. Moses\' intercession is not magic — it is covenant relationship in action.'),
                ('10:6–7', 'MacArthur: The itinerary notice about Aaron\'s death and Eleazar\'s succession makes a theological point: the Aaronic priesthood persists through generational change. The priestly office is not bound to the individual. When Aaron died, Eleazar took his place, and the ministry continued.'),
            ],
        },
        {
            'header': 'Verses 12–22 — Fear, Love, Serve: The Great Summary',
            'verses': verse_range(12, 22),
            'heb': [
                ('wĕʿattāh yiśrāʾēl mā YHWH šōʾēl', 'veattah Yisrael mah YHWH shoeil',
                 'And now Israel, what does the LORD your God ask of you?',
                 'The rhetorical question sets up the great summary of covenant demands. "What does God ask?" could receive an overwhelming answer — hundreds of commandments. Instead Moses gives a distilled five-fold summary: fear, walk, love, serve, observe.'),
                ('ʿarel lĕbabkem', 'arel levavchem', 'circumcise your hearts',
                 'The metaphor of heart-circumcision appears here (10:16) and reaches its fullest form in 30:6, where God himself will circumcise their hearts. Heart circumcision removes the stubborn resistance to God. Paul develops this in Romans 2:29 and Colossians 2:11.'),
            ],
            'ctx': 'Verses 12–22 are one of Deuteronomy\'s great theological summaries. Moses asks: what does God require of you? Five-fold: fear, walk, love, serve, observe (v.12). Then he grounds these demands in God\'s character: God is the God of gods, Lord of lords — yet he loves the alien, provides for the orphan and widow, executes justice for the oppressed. The demands flow from the character: love the alien because God loves the alien; fear God because he is incomparable.',
            'cross': [
                ('Mic 6:8', '"He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God." Micah\'s great summary echoes Deuteronomy 10:12\'s question and structure.'),
                ('Matt 23:23', '"You have neglected the more important matters of the law — justice, mercy and faithfulness." Jesus identifies the "weightier matters" in terms that directly reflect Deuteronomy 10\'s justice-for-the-powerless theology.'),
            ],
            'mac': [
                ('10:12–13', 'MacArthur: "What does the LORD your God ask of you but to fear the LORD your God, to walk in obedience to him, to love him, to serve the LORD your God with all your heart and with all your soul, and to observe the LORD\'s commands." The five demands are a graduated movement: fear (reverence) → walk (direction) → love (motivation) → serve (expression) → observe (practice). Each builds on the previous. Fear without love produces cold compliance; love without fear produces presumption.'),
                ('10:14–15', 'MacArthur: "To the LORD your God belong the heavens, even the highest heavens, the earth and everything in it. Yet the LORD set his affection on your ancestors and loved them." The contrast is staggering: the God who owns everything chose the smallest and least. Election is the divine preference for the unexpected — the counterintuitive love that passes by the obvious candidates.'),
                ('10:17–18', 'MacArthur: "For the LORD your God is God of gods and Lord of lords, the great God, mighty and awesome... He defends the cause of the fatherless and the widow, and loves the foreigner residing among you." The juxtaposition is deliberate: the cosmic Lord is simultaneously the advocate of the powerless. Power and compassion are unified in God.'),
                ('10:19', 'MacArthur: "And you are to love those who are foreigners, for you yourselves were foreigners in Egypt." Love of the alien is grounded in Israel\'s own alien experience. Empathy is the ethical engine — you know what it is to be vulnerable, displaced, dependent on the mercy of the powerful. Therefore show others the mercy you needed.'),
            ],
        },
    ],
})

deu(11, {
    'title': 'Love and Obey the LORD: Blessings on the Land; Choose This Day',
    'sections': [
        {
            'header': 'Verses 1–25 — Remember God\'s Acts; Blessings for Obedience',
            'verses': verse_range(1, 25),
            'heb': [
                ('ʾāhabtā ʾēt YHWH ʾĕlōhêkā', 'ahavta et YHWH Elohekha', 'love the LORD your God',
                 'The command to love appears throughout Deuteronomy 11 as the chapter\'s refrain. In the ancient Near East, "love" in covenant contexts meant loyal allegiance and obedience; in Deuteronomy it carries this meaning but adds genuine personal devotion — the relationship with God is personal, not merely political.'),
                ('ʾereṣ zābat ḥālāb ûdĕbāš', 'eretz zavat chalav udvash',
                 'a land flowing with milk and honey',
                 'The formula captures the land\'s superabundance in two representative products: milk (pastoral) and honey (agricultural or wild). It appears repeatedly as shorthand for covenant blessing in material form.'),
            ],
            'ctx': 'Chapter 11 closes the Shema section with a final call to love and obey. Moses appeals to the personal memories of those present: you yourselves saw what God did in Egypt, what he did to Dathan and Abiram, how the earth swallowed them (v.7). The land ahead responds to covenant faithfulness: rain in its seasons, grass for cattle, grain and wine and oil. But the land also responds to apostasy — its rains stop when Israel worships other gods (vv.16–17). The ecology of Canaan is covenant-shaped.',
            'cross': [
                ('John 14:15', '"If you love me, keep my commandments." Jesus uses the Deuteronomic pattern — love expressed through obedience — as the summary of discipleship.'),
                ('Lev 26:3–5', '"If you follow my decrees... I will send you rain in its season." Leviticus 26 provides the covenant blessing/curse framework that Deuteronomy 11 summarises.'),
            ],
            'mac': [
                ('11:1–7', 'MacArthur: "Remember today that your children were not the ones who saw and experienced the discipline of the LORD your God... It was you who saw with your own eyes." Moses draws a sharp line: the new generation has firsthand memories of God\'s discipline that their children will not have. With that comes greater responsibility — more has been seen, more is required. Privilege and accountability are inseparable.'),
                ('11:13–17', 'MacArthur: The covenant promise that rain will come in season if Israel obeys is a remarkable statement about the intersection of theology and ecology. The land of Canaan (unlike Egypt) depends entirely on rainfall. Its agricultural cycle is therefore a theological barometer — abundant rains reflect covenant faithfulness; drought reflects apostasy. The prophets will develop this connection extensively (1 Kgs 17–18; Jer 14).'),
                ('11:18–21', 'MacArthur: "Fix these words of mine in your hearts and minds; tie them as symbols on your hands and bind them on your foreheads." The command of 6:6–9 is repeated with identical force. The mezuzah, the tefillin, the constant teaching to children — these are covenant infrastructure. A covenant community that stops teaching the next generation is a covenant community in decline.'),
                ('11:26–28', 'MacArthur: "See, I am setting before you today a blessing and a curse." The stark binary of covenant life — blessing or curse, obedience or disobedience — is not a simplification but a clarification. Every day presents Israel with the same fundamental choice that Eden presented to Adam. You are either moving toward God or away from him.'),
            ],
            'craigie': [
                ('11:10–12', 'Craigie: The contrast between Egypt (irrigated by technology) and Canaan (watered by rain from heaven) is not merely geographical but theological. Canaan\'s dependence on rain means dependence on God. This dependence is a gift, not a liability: it structures covenant relationship into the agricultural calendar.'),
            ],
        },
        {
            'header': 'Verses 26–32 — Blessing and Curse; Mount Ebal and Gerizim',
            'verses': verse_range(26, 32),
            'heb': [
                ('habbĕrākāh wĕhaqqĕlālāh', 'haberachah vehakelala', 'the blessing and the curse',
                 'The two-way structure of Deuteronomy\'s covenant is explicit here and elaborated fully in chs.27–28. The blessing/curse pattern is not arbitrariness but structure: the universe is designed with consequences built into its moral fabric.'),
            ],
            'ctx': 'The first discourse closes with a preview of the covenant ceremony that will take place after crossing the Jordan (detailed in ch.27): the blessings pronounced from Mount Gerizim, the curses from Mount Ebal. The two mountains facing each other across the valley of Shechem become the physical embodiment of the covenant\'s binary character. The whole land is arranged around this choice: blessing on one side, curse on the other, Israel standing between — called to choose.',
            'cross': [
                ('Josh 8:30–35', '"Then Joshua built on Mount Ebal an altar to the LORD... Afterward, Joshua read all the words of the law — the blessings and the curses." Joshua\'s faithful implementation shows the covenant ceremony taking place exactly as Moses commanded.'),
                ('Gal 3:13', '"Christ redeemed us from the curse of the law by becoming a curse for us." Paul reads the Deuteronomic curse structure through the cross: Christ absorbed the covenant curse that Israel\'s disobedience incurred.'),
            ],
            'mac': [
                ('11:26–28', 'MacArthur: The binary presentation — blessing and curse — is not a theological oversimplification but a moral clarification. Life presents innumerable complexities, but beneath them all is a single axis: alignment with or against the will of the God who created and sustains reality. Every choice is ultimately a choice for blessing or curse, life or death.'),
                ('11:29–32', 'MacArthur: The geographical imagination of Deuteronomy is remarkable: before Israel even crosses the Jordan, Moses has them mentally standing in the valley between Gerizim and Ebal, hearing blessing and curse called across the landscape. The covenant ceremony at Shechem is Israel\'s covenant renewal in Canaan itself — the land becomes a witness to the covenant.'),
            ],
        },
    ],
})

print("DEUT-2 complete: chapters 5–11 built.")
