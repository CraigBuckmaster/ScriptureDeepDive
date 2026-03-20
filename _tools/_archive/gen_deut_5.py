"""DEUT-5: Deuteronomy chapters 27–30 — Covenant Ratification: Blessings, Curses, Renewal"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

deu(27, {
    'title': 'The Altar on Mount Ebal; the Covenant Curses',
    'sections': [
        {
            'header': 'Verses 1–10 — The Law on Stones; the Altar at Ebal',
            'verses': verse_range(1, 10),
            'heb': [
                ('har Eival', 'har Eival', 'Mount Ebal',
                 'Ebal and Gerizim face each other across the valley of Shechem -- the geographical and theological centre of Canaan. Ebal is the mountain of curses; Gerizim is the mountain of blessings. Standing between them, Israel announces the covenant\'s binary character.'),
                ('even gedolot', 'even gedolot', 'large stones / plastered stones',
                 'The plastered stones with the law inscribed were a public declaration: the law of God governs this land. Before Israel begins to settle Canaan, the covenant is written into its landscape. The uncut stone altar underscores that access to God is on his terms -- human technology may not shape the altar.'),
            ],
            'ctx': 'Chapter 27 describes the covenant ceremony to take place immediately after crossing the Jordan: plaster-covered stones inscribed with the law at Shechem, an altar of uncut stones, the tribes divided between Gerizim (blessing) and Ebal (curse), and twelve curses recited by the Levites with congregational Amens. The uncut stone altar (no iron tools) echoes Exodus 20:25 -- the approach to God is provided by God, not constructed by humanity. Joshua will implement this ceremony precisely (Josh 8:30-35).',
            'cross': [
                ('Josh 8:30-35', '"Then Joshua built on Mount Ebal an altar to the LORD... Joshua read all the words of the law -- the blessings and the curses -- just as it is written in the Book of the Law." Joshua\'s faithful implementation confirms the Deuteronomy 27 ceremony as a real covenant ratification event.'),
                ('Exod 20:25', '"If you make an altar of stones for me, do not build it with dressed stones, for you will defile it if you use a tool on it." The uncut stone altar principle is rooted in Exodus -- the approach to God must not be engineered by human craftsmanship.'),
            ],
            'mac': [
                ('27:2-4', 'MacArthur: The plastered stones with the law inscribed were a public declaration: the law of God governs this land. Before Israel begins to settle Canaan, the covenant is written into its landscape. The law is not private piety but public constitution -- the charter of the covenant community inscribed in stone for all to see.'),
                ('27:5-8', 'MacArthur: The uncut stone altar -- no iron tool may touch it -- embodies a fundamental principle of approach to God: human engineering cannot improve on what God has provided. The altar\'s natural state is its fitness for God\'s use. This is the permanent theological critique of all human religious innovation: the approach to God is given, not constructed.'),
                ('27:9-10', 'MacArthur: "Be silent, Israel, and listen! You have now become the people of the LORD your God. Obey the LORD your God and follow his commands and decrees." The moment of covenant ratification is also the moment of new identity: "You have now become the people of the LORD your God." The covenant simultaneously creates and declares the relationship.'),
            ],
            'craigie': [
                ('27:1-8', 'Craigie: The Shechem ceremony is geographically significant: Shechem was where Abram first received God\'s covenant promise (Gen 12:6-7). The covenant is being renewed in the very place it was first promised. The inscribed stones make the covenant visible and permanent in the landscape -- a monument that both testifies and commands.'),
            ],
        },
        {
            'header': 'Verses 11–26 — The Twelve Curses; Congregational Amens',
            'verses': verse_range(11, 26),
            'heb': [
                ('arur', 'arur', 'cursed',
                 'Twelve curses are pronounced, each beginning with "arur" (cursed). The number twelve corresponds to the twelve tribes -- the curses address the entire covenant community. The Levites lead the curses; all Israel responds "Amen" (so be it). Each Amen is a personal affirmation of the covenant\'s consequences.'),
                ('amen', 'amen', 'so be it / truly / let it be so',
                 'The congregational Amen response to each curse is one of the most powerful liturgical acts in the OT. The assembly does not passively receive the curses -- they actively affirm them. "Amen" is a declaration of assent: I acknowledge that this consequence follows this sin, and I accept it.'),
            ],
            'ctx': 'The twelve curses (vv.15-26) are deliberately targeted at secret sins -- violations hidden from human observers. Idolatry, dishonoring parents, boundary moving, misleading the blind, perverting justice, sexual violations, murder, and accepting a bribe: these are the sins most likely to go unpunished by human courts. The covenant curses address the judicial blind spots. The final curse (v.26) is comprehensive: "Cursed is anyone who does not uphold the words of this law by carrying them out." Paul quotes this in Gal 3:10.',
            'cross': [
                ('Gal 3:10', '"For all who rely on the works of the law are under a curse, as it is written: \'Cursed is everyone who does not continue to do everything written in the Book of the Law.\'" Paul quotes Deuteronomy 27:26 to argue that the law cannot justify -- no one keeps it perfectly, so all who rely on it are under its curse.'),
                ('Gal 3:13', '"Christ redeemed us from the curse of the law by becoming a curse for us." The Deuteronomy 27 curse structure finds its resolution in Christ\'s bearing of the accumulated curse on the cross.'),
            ],
            'mac': [
                ('27:14-15', 'MacArthur: The twelve curses are deliberately targeted at secret sins -- violations hidden from human observers. The covenant cannot be gamed: even where human courts cannot reach, divine judgment does. The Amen response from all Israel turns each curse into a personal oath: I acknowledge that this consequence will follow this sin. The whole community takes collective responsibility for the covenant\'s integrity.'),
                ('27:19', 'MacArthur: "Cursed is anyone who withholds justice from the foreigner, the fatherless or the widow." The curse on injustice toward the most vulnerable is among the most pointed of the twelve. God\'s covenant is explicitly concerned with the protection of those who have no human advocate. The curse ensures that even when human courts fail the vulnerable, divine judgment does not.'),
                ('27:24', 'MacArthur: "Cursed is anyone who kills their neighbour secretly." The curse on secret murder covers what no human court can easily prosecute. The covenant\'s judicial reach extends to the hidden act. This is why the Deuteronomic law is not merely a legal code but a theological framework: God sees what human courts cannot.'),
                ('27:26', 'MacArthur: "Cursed is anyone who does not uphold the words of this law by carrying them out." Paul\'s quotation of this verse (Gal 3:10) identifies it as the comprehensive curse -- the one that encompasses all law-keeping. The good news of the gospel is that Christ has absorbed this curse (Gal 3:13) so that those who are in him are no longer under it.'),
            ],
        },
    ],
})

deu(28, {
    'title': 'The Great Blessings and the Great Curses: Covenant at Its Starkest',
    'sections': [
        {
            'header': 'Verses 1–44 — The Covenant Blessings; the Opening Curses',
            'verses': verse_range(1, 44),
            'heb': [
                ('vehaya im-shamo tishma', 'vehaya im-shamo tishma',
                 'if you fully obey the LORD your God',
                 'The double verb (shama + tishma) is the Hebrew intensive: not merely "if you obey" but "if you truly, fully, faithfully obey." The blessings are conditional on complete covenant faithfulness. The standard is not perfectionism (the sacrificial system provides for failure) but wholehearted orientation.'),
                ('vehayita veraish velo vezanav', 'vehayita veraish velo vezanav',
                 'you will be the head and not the tail',
                 'The head/tail metaphor (v.44) summarises the reversal that covenant failure brings: Israel, called to be a leader among nations, becomes a follower; called to lead, becomes enslaved. The image reverses the election blessing of ch.7 with exact precision.'),
            ],
            'ctx': 'Chapter 28 is Deuteronomy\'s most dramatic chapter -- 68 verses, 14 of blessings and 54 of curses. The asymmetry is deliberate: the curses are longer and more terrifying than the blessings because the stakes of covenant failure are catastrophic. The blessings are agricultural, domestic, military, and national: fruitful fields, blessed cities, victory over enemies, rain in season, Israel as head among nations. The curses progressively intensify through the first half of the chapter before reaching their most extreme forms in vv.45-68.',
            'cross': [
                ('Lev 26', 'The Leviticus 26 blessings and curses provide the legal-covenantal framework that Deuteronomy 28 expands dramatically. Both texts anticipate the exile and both provide the theology of return.'),
                ('2 Kgs 17; 25', 'The fall of Israel (722 BC) and Judah (586 BC) are interpreted through the lens of Deuteronomy 28 -- the curses came upon them because they violated the covenant.'),
            ],
            'mac': [
                ('28:1-6', 'MacArthur: The six blessing formulas ("blessed in the city... blessed in the country... blessed when you come in... blessed when you go out") are comprehensive principles: every sphere of life flourishes under covenant faithfulness. The blessings are the natural fruit of a society ordered according to God\'s design. Creation works as it was meant to when covenant is kept.'),
                ('28:7-14', 'MacArthur: The military, agricultural, and national blessings are not magic rewards for religious compliance but the described outcomes of covenant faithfulness. "The LORD will grant you abundant prosperity -- in the fruit of your womb, the young of your livestock and the crops of your ground." These are the material expressions of the blessing of living in alignment with the Creator\'s design.'),
                ('28:15-19', 'MacArthur: The curse formulas mirror the blessings exactly: "cursed in the city... cursed in the country... cursed when you come in... cursed when you go out." The exact reversal of blessing is not poetic symmetry but theological precision: covenant betrayal produces the opposite of what covenant faithfulness produces.'),
                ('28:36-44', 'MacArthur: The progressive curses culminate in exile -- "the LORD will drive you and the king you set over you to a nation unknown to you or your ancestors." The threat of exile is not a later addition but is built into the covenant structure from the beginning. The covenant that gave the land can take it away.'),
            ],
            'craigie': [
                ('28:15-44', 'Craigie: The extensive curse section is not designed to terrify Israel into compliance but to make fully explicit what covenant failure means. The curses are predictive, not vindictive -- they describe what happens when a society organised around the living God turns away from him. Deuteronomy 28 functions as a covenant warning, not a threat.'),
            ],
        },
        {
            'header': 'Verses 45–68 — The Great Curses: Siege, Exile, Return to Egypt',
            'verses': verse_range(45, 68),
            'heb': [
                ('tachat asher lo avadeta et-YHWH', 'tachat asher lo avadeta et-YHWH',
                 'because you did not serve the LORD your God',
                 'The root cause of Israel\'s future disaster is stated explicitly in v.47: not dramatic apostasy but the failure to serve God "joyfully and gladly in the time of prosperity." Grudging, joyless, mechanical religious compliance is already the beginning of covenant failure.'),
                ('matzor', 'matzor', 'siege',
                 'The siege language of vv.52-57 reaches horrifying specificity: the siege will be so severe that parents eat their own children and hide food from family members. The description is not hyperbole but accurate prophecy of what siege warfare does to a starving population.'),
            ],
            'ctx': 'The second half of the curse section intensifies dramatically: disease, defeat, madness, exile, siege so severe parents eat their children, return to Egypt as slaves with no buyers. Many scholars note that the curse section closely parallels the Vassal Treaties of Esarhaddon (672 BC) -- either as shared ANE treaty formula or as evidence of a specific relationship. The curses are not designed to be fulfilled but to be avoided -- yet the historical narrative of Joshua through Kings shows them progressively fulfilled.',
            'cross': [
                ('Rev 6:1-17', 'The four horsemen of the Apocalypse -- war, famine, plague, death -- recapitulate the Deuteronomy 28 curse sequence in eschatological form.'),
                ('Lam 4:10', '"With their own hands compassionate women have cooked their own children, who became their food when my people were destroyed." Lamentations documents the fulfilment of Deuteronomy 28:57\'s most horrifying curse during the siege of Jerusalem.'),
            ],
            'mac': [
                ('28:47-48', 'MacArthur: "Because you did not serve the LORD your God joyfully and gladly in the time of prosperity, therefore in hunger and thirst, in nakedness and dire poverty, you will serve the enemies the LORD sends against you." The most searching verse in the chapter: the root cause of Israel\'s future disaster is not dramatic apostasy but the failure to serve God joyfully. Grudging, joyless, mechanical religious compliance is already the beginning of covenant failure.'),
                ('28:58-60', 'MacArthur: "If you do not carefully follow all the words of this law... the LORD will send fearful plagues on you and your descendants, harsh and prolonged disasters, and severe and lingering illnesses." The progression from disobedience to disaster is gradual -- the curses escalate through stages, not all at once. God\'s judgment is patient, not impulsive.'),
                ('28:63-68', 'MacArthur: The exile curse -- return to Egypt in ships, sold as slaves, no buyers -- is the most extreme reversal of the Exodus. Israel began in Egypt as slaves; they will return to Egypt as slaves. History moves in covenant circles: what God did in grace, covenant failure can undo. The anti-Exodus is the covenant\'s most terrifying threat.'),
            ],
            'tigay': [
                ('28:36-37', 'Tigay: The threat of exile "to a land unknown to you or your ancestors" was remarkably fulfilled in the Assyrian and Babylonian exiles. The specificity of the Deuteronomic curses has led many scholars to date Deuteronomy as post-exilic prophecy after the fact. The Kline/Craigie position is that the specificity reflects genuine prophetic foresight within the Mosaic covenant structure.'),
            ],
        },
    ],
})

deu(29, {
    'title': 'The Covenant at Moab: Renewal for the New Generation',
    'sections': [
        {
            'header': 'Verses 1–21 — The Moab Covenant; Eyes That Do Not See',
            'verses': verse_range(1, 21),
            'heb': [
                ('velo natan YHWH lachem lev ladaat', 'velo natan YHWH lachem lev ladaat',
                 'the LORD has not given you a mind that understands',
                 'The statement that God had not given Israel spiritual understanding despite all they had seen (v.4) is a profound mystery. Moses is not blaming God but describing the persistence of spiritual blindness in the face of overwhelming evidence. Paul quotes this verse (Rom 11:8) in his discussion of Israel\'s hardening -- spiritual sight is ultimately a divine gift.'),
                ('pen yesh bakem shoresh poreh rosh velaanah',
                 'pen yesh bakem shoresh poreh rosh velaanah',
                 'lest there is among you a root bearing poison and bitterness',
                 'The "root of bitterness" (v.18) is the apostate individual within the covenant community -- the one who takes the covenant oath while planning to exempt himself from it. The image is of a poisonous plant that spreads underground, contaminating the community before its effects are visible.'),
            ],
            'ctx': 'Chapter 29 is the third of Moses\' addresses -- a covenant renewal for the new generation. He begins with the contrast between what their eyes have seen (Exodus, wilderness miracles) and what their hearts have not understood (v.4). The appeal is both cognitive and affective: they have seen everything; they must now comprehend what it means. Moses then binds all Israel -- the present generation and all future generations -- to the Moab covenant (v.15). A severe warning against apostate individuals follows. The chapter closes with the most-quoted verse of Deuteronomy 29: "The secret things belong to the LORD our God, but the things revealed belong to us and to our children forever" (v.29).',
            'cross': [
                ('Rom 11:8', '"God gave them a spirit of stupor, eyes that could not see and ears that could not hear, to this very day." Paul quotes Deuteronomy 29:4 in his discussion of Israel\'s hardening -- spiritual sight is God\'s gift, not human achievement.'),
                ('Heb 12:15', '"See to it that no one falls short of the grace of God and that no bitter root grows up to cause trouble and defile many." The Hebrews author applies Deuteronomy 29:18\'s bitter root warning to the NT community.'),
            ],
            'mac': [
                ('29:2-4', 'MacArthur: "Your eyes have seen all that the LORD did in Egypt... But to this day the LORD has not given you a mind that understands or eyes that see or ears that hear." The paradox is shattering: they saw everything, and still did not understand. Seeing is not believing; spiritual understanding is a divine gift. The same miracles that produced faith in some produced hardness in others. This is why spiritual sight cannot be produced by evidence alone.'),
                ('29:10-15', 'MacArthur: "All of you are standing today in the presence of the LORD your God... together with your children and your wives, and the foreigners living in your camps." The covenant at Moab is radically inclusive: officials, elders, workers, foreigners -- everyone present is party to the covenant. And more than those present: "I am making this covenant... with those who are not here today." Every future generation is included.'),
                ('29:19-20', 'MacArthur: "When such a person hears the words of this oath and they invoke a blessing on themselves, thinking, \'I will be safe, even though I persist in going my own way...\'" The individual who takes the covenant oath while planning to exempt themselves from it will find that their private apostasy contaminates the community around them. Individual faithlessness has corporate consequences.'),
            ],
            'craigie': [
                ('29:1-15', 'Craigie: The Moab covenant is structurally a second covenant ratification -- the first was at Horeb (Sinai). The two covenants are not contradictory but complementary: the Sinai covenant established the relationship; the Moab covenant renews and extends it to the new generation on the threshold of entering the land. The covenant is living, not static.'),
            ],
        },
        {
            'header': 'Verses 22–29 — Future Desolation; Hidden and Revealed Things',
            'verses': verse_range(22, 29),
            'heb': [
                ('hanistarot laYHWH eloheinu', 'hanistarot laYHWH eloheinu',
                 'the secret things belong to the LORD our God',
                 'Verse 29\'s famous statement about hidden and revealed things is one of Deuteronomy\'s most theologically important. God has revealed what Israel needs to know for covenant faithfulness; what he has not revealed is his own business. This is the foundational principle of revealed religion: work with what God has said, not with what he has not said.'),
            ],
            'ctx': 'The chapter closes with a prospective description of the land\'s desolation when Israel apostatises -- foreign nations will ask why the land is ruined. The answer: because they forsook the covenant of the LORD. Then the most-quoted verse of chapter 29: "The secret things belong to the LORD our God, but the things revealed belong to us and to our children forever, that we may follow all the words of this law." The hidden/revealed distinction is the foundational principle of biblical epistemology: act on what God has given, trust him with what he has withheld.',
            'cross': [
                ('Deut 30:11-14', '"Now what I am commanding you today is not too difficult for you or beyond your reach... the word is very near you." The revealed things of 29:29 are explicitly accessible -- not remote or esoteric.'),
                ('Rev 22:18-19', '"I warn everyone who hears the words of the prophecy of this scroll: If anyone adds anything to them, God will add to that person the plagues described in this scroll." Revelation\'s canonical closing warning echoes Deuteronomy 29\'s covenant completeness -- the revealed things are sufficient.'),
            ],
            'mac': [
                ('29:22-25', 'MacArthur: "All the nations will ask: \'Why has the LORD done this to this land? Why this fierce, burning anger?\' And the answer will be: \'It is because this people abandoned the covenant of the LORD...\'" The land\'s desolation will itself be a testimony to the nations about the covenant\'s reality. The curses, if fulfilled, become a witness to God\'s faithfulness to his word -- even in judgment.'),
                ('29:29', 'MacArthur: "The secret things belong to the LORD our God, but the things revealed belong to us and to our children forever, that we may follow all the words of this law." The principle of theological sufficiency: God has revealed what we need to live faithfully. The hidden things -- the why behind suffering, the timing of fulfilment, the final purposes of history -- are God\'s business. The revealed things -- the law, the promises, the covenant -- are our business. Wisdom knows the difference and acts on what has been given.'),
            ],
        },
    ],
})

deu(30, {
    'title': 'Return and Restoration; the Two Ways; Life or Death',
    'sections': [
        {
            'header': 'Verses 1–10 — Return from Exile; Heart-Circumcision',
            'verses': verse_range(1, 10),
            'heb': [
                ('veshavta ad-YHWH elohekha', 'veshavta ad-YHWH elohekha',
                 'then you will return to the LORD your God',
                 'The return (shuv, repentance) of Deuteronomy 30 is the theological foundation of all OT repentance theology. Shuv means both "return" (geographically -- from exile) and "repent" (spiritually -- from apostasy). The two senses are inseparable: spiritual return to God and physical return to the land are a single covenant movement.'),
                ('umol YHWH elohekha et-levavkha', 'umol YHWH elohekha et-levavkha',
                 'and the LORD your God will circumcise your heart',
                 'The great promise of Deuteronomy 30:6 -- God himself will circumcise the heart -- is the OT\'s most explicit anticipation of the new covenant. Heart circumcision in ch.10:16 was a command ("circumcise your hearts"); here it is a promise ("God will circumcise your heart"). The new covenant provides what the old covenant demanded.'),
            ],
            'ctx': 'Chapter 30 is one of the most theologically rich chapters in the OT. It anticipates Israel\'s exile and return with remarkable specificity, promises a divine heart-circumcision (v.6) that enables what the law demands, and closes with the most explicit statement of the covenant\'s binary character: "I have set before you life and death, blessings and curses. Now choose life" (v.19). Paul quotes vv.12-14 in Romans 10:6-8 to argue that the righteousness of faith is accessible to all -- the word is "near you, in your mouth and in your heart."',
            'cross': [
                ('Jer 31:31-34', '"I will make a new covenant with the people of Israel... I will put my law in their minds and write it on their hearts." Jeremiah\'s new covenant promise is the prophetic development of Deuteronomy 30:6\'s heart-circumcision promise.'),
                ('Ezek 36:26-27', '"I will give you a new heart and put a new spirit in you... And I will put my Spirit in you and move you to follow my decrees." Ezekiel\'s new covenant promise is the eschatological fulfilment of Deuteronomy 30:6.'),
                ('Rom 10:6-8', '"The righteousness that is by faith says: \'Do not say in your heart, \'Who will ascend into heaven?\'\' ... But what does it say? \'The word is near you; it is in your mouth and in your heart.\'" Paul quotes Deut 30:12-14 to argue that the NT gospel of faith has the same accessibility as the Mosaic covenant.'),
            ],
            'mac': [
                ('30:1-6', 'MacArthur: "When all these blessings and curses I have set before you come on you and you take them to heart wherever the LORD your God disperses you among the nations... then the LORD your God will restore your fortunes and have compassion on you." Even in exile -- even at the lowest point of covenant failure -- the return is possible. The curses are not the end of the story; return is.'),
                ('30:6', 'MacArthur: "The LORD your God will circumcise your hearts and the hearts of your descendants, so that you may love him with all your heart and with all your soul, and live." This is Deuteronomy\'s most important theological sentence. The demand of 6:5 ("love the LORD your God with all your heart") finds its provision here: God himself will enable what he demands. Without this verse, Deuteronomy\'s demands are crushing; with it, they are possible.'),
                ('30:11-14', 'MacArthur: "Now what I am commanding you today is not too difficult for you or beyond your reach... No, the word is very near you; it is in your mouth and in your heart so you may obey it." The accessibility of the covenant word is the most important pastoral statement in the chapter. God has not demanded the impossible -- the word is near, not remote; accessible, not esoteric.'),
            ],
            'craigie': [
                ('30:1-10', 'Craigie: Deuteronomy 30\'s exile-and-return passage is remarkable for its pre-exilic prediction of what will happen if Israel violates the covenant. The theology of return (shuv) embedded here sustains the exilic community in Babylon and grounds the prophets\' promises of restoration.'),
            ],
            'tigay': [
                ('30:6', 'Tigay: Deuteronomy 30:6 is the closest the Torah comes to the new covenant promise of Jeremiah 31. The verse shifts from command (10:16: "circumcise your hearts") to promise: God will do what Israel cannot do for themselves. This is the Torah\'s most explicit glimpse of grace that precedes and enables obedience.'),
            ],
        },
        {
            'header': 'Verses 11–20 — The Word Is Near; Choose Life',
            'verses': verse_range(11, 20),
            'heb': [
                ('ki karov eilecha hadavar meod', 'ki karov eilecha hadavar meod',
                 'the word is very near you',
                 'The accessibility of the covenant word is Moses\' most important pastoral statement. The word is near -- in the mouth (for confession) and in the heart (for belief and obedience). Paul quotes this in Romans 10:8 as the summary of the gospel\'s accessibility: the righteousness of faith does not require heroic achievement.'),
                ('uvacharta bachayim', 'uvacharta bachayim', 'choose life',
                 'The ultimate Deuteronomic statement. Not "choose correct theology" or "choose better behaviour" -- choose life. And life is defined: "the LORD is your life." To choose God is to choose life; to reject God is to choose death. This binary is the clearest possible statement of what is at stake in every covenant choice.'),
            ],
            'ctx': 'The chapter\'s conclusion is Deuteronomy\'s most famous passage: the accessibility of the covenant word (vv.11-14) and the great binary choice (vv.15-20). Moses sets before Israel the two ways: life and prosperity, or death and destruction. Love the LORD, walk in his ways, keep his commands and you will live and increase. Turn away and you will perish. Heaven and earth are called as witnesses. Then the most direct command in the book: "Choose life, so that you and your children may live."',
            'cross': [
                ('John 14:6', '"I am the way and the truth and the life. No one comes to the Father except through me." Jesus\' self-identification as the Life is the NT answer to Deuteronomy 30:19-20\'s choice of life -- he is not merely the path to life but is himself the life that Israel was called to choose.'),
                ('Gal 3:11-12', '"Clearly no one who relies on the law is justified before God, because \'the righteous will live by faith.\' The law is not based on faith." Paul sets Deuteronomy 30\'s "choose" within the larger framework of faith vs. works -- the accessibility of the word (30:14) is the accessibility of faith.'),
            ],
            'mac': [
                ('30:15-16', 'MacArthur: "See, I set before you today life and prosperity, death and destruction. For I command you today to love the LORD your God, to walk in obedience to him, and to keep his commands, decrees and laws; then you will live and increase." The simplicity of the covenant summary is its power: life comes from loving the LORD and walking in his ways. Prosperity is not a reward bolted on but the organic outcome of covenant faithfulness.'),
                ('30:19-20', 'MacArthur: "This day I call the heavens and the earth as witnesses against you that I have set before you life and death, blessings and curses. Now choose life, so that you and your children may live and that you may love the LORD your God, listen to his voice, and hold fast to him. For the LORD is your life." The ultimate Deuteronomic statement: choose life. And life is defined: the LORD is your life. To choose God is to choose life; to reject God is to choose death. This binary is the clearest possible statement of what is at stake.'),
            ],
        },
    ],
})

print("DEUT-5 complete: chapters 27–30 built.")
