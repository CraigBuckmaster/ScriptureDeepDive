"""DEUT-6: Deuteronomy chapters 31–34 — Joshua, Song of Moses, Death of Moses"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

deu(31, {
    'title': 'Joshua Commissioned; the Torah Deposited; the Witness Song Commanded',
    'sections': [
        {
            'header': 'Verses 1–22 — Moses\' Farewell; Joshua\'s Commissioning; Torah Deposited',
            'verses': verse_range(1, 22),
            'heb': [
                ('chazak veeamatz', 'chazak veeamatz', 'be strong and courageous',
                 'The commissioning formula given to Joshua -- "be strong and courageous" -- is repeated four times in this chapter (vv.6, 7, 23) and becomes the keynote of Joshua\'s entire career (Josh 1:6-9). The formula acknowledges that the task ahead is genuinely frightening but provides the antidote: not human courage but God-grounded confidence.'),
                ('vayichtov Moshe et-haTorah', 'vayichtov Moshe et-haTorah',
                 'Moses wrote down this law',
                 'The writing and depositing of the Torah (v.9) is the great archival act of Deuteronomy -- Moses certifies the covenant document and entrusts it to the Levites for preservation beside the ark. The Torah is not oral tradition but written text, preserved, guarded, and read publicly every seven years.'),
            ],
            'ctx': 'Chapter 31 is the transition chapter of Deuteronomy. Moses formally announces that he is 120 years old and cannot cross the Jordan (v.2). He commissions Joshua before all Israel (vv.7-8) and before God (v.23). The Torah is written and deposited with the Levites beside the ark (v.9), with instructions for a public reading every seventh year at the feast of Tabernacles (vv.10-13). Then God delivers a devastating prediction: Israel will prostitute itself to other gods, and the curses of ch.28 will come. For this reason, God commands Moses to write a song (ch.32) that will serve as a witness against Israel when it apostatises.',
            'cross': [
                ('Josh 1:6-9', '"Be strong and courageous, because you will lead these people to inherit the land... Be strong and very courageous... Have I not commanded you? Be strong and courageous. Do not be afraid." Joshua 1 is a sustained development of Deuteronomy 31\'s commissioning formula.'),
                ('Heb 4:8', '"For if Joshua had given them rest, God would not have spoken later about another day." The author of Hebrews uses Joshua\'s limitation -- he gave Israel rest in Canaan but not the ultimate rest -- to argue for a greater rest that Christ provides.'),
                ('2 Tim 4:7', '"I have fought the good fight, I have finished the race, I have kept the faith." Paul\'s farewell echoes Moses\'s Deuteronomy 31 farewell structure -- the dying leader commissions his successor and entrusts the covenant to those who come after.'),
            ],
            'mac': [
                ('31:1-6', 'MacArthur: "Moses was a hundred and twenty years old when he died, yet his eyes were not weak nor his strength gone" (34:7). In ch.31 we see Moses at his finest hour -- not the moment of triumph but the moment of passing on. The greatest leader in Israel\'s history is not diminished by age; he is in full vigour. Yet he willingly steps aside. The capacity to hand over what you have built, without undermining the successor, is the final test of a great leader\'s character. Moses passes it perfectly.'),
                ('31:7-8', 'MacArthur: "Be strong and courageous, for you must go with this people into the land... The LORD himself goes before you and will be with you; he will never leave you nor forsake you. Do not be afraid; do not be discouraged." The commissioning formula has two parts: the command (be strong) and the ground (the LORD goes before you). The courage is not summoned from within but borrowed from the divine presence.'),
                ('31:9-13', 'MacArthur: The seven-year public Torah reading -- every Sabbath year, at the feast of Tabernacles, to all Israel including children and foreigners -- is the covenant community\'s most important educational institution. Every generation must hear the covenant in its entirety. "Their children, who do not know this law, must hear it and learn to fear the LORD your God." Covenant formation begins before comprehension is fully formed.'),
                ('31:16-18', 'MacArthur: God tells Moses plainly: "After you die, these people will soon prostitute themselves to the foreign gods of the land they are entering." The prediction is devastating -- Moses is dying with the knowledge that everything he has built will be betrayed. Yet he does not give up or rage against the ingratitude. He completes his task: writing the song, commissioning Joshua, blessing the tribes. Faithfulness in covenant service is not dependent on its outcomes.'),
            ],
            'craigie': [
                ('31:19', 'Craigie: The command to write a song as a witness against Israel is remarkable -- God is providing a covenant self-condemnation mechanism in advance. The song will be in Israel\'s mouths (v.19) even when they have forgotten the law, so that when the curses come, the witness will be present. This is covenant foresight: God prepares the evidence of Israel\'s guilt before the act of guilt occurs.'),
            ],
        },
        {
            'header': 'Verses 23–29 — Joshua\'s Commission Before God; the Song Commanded',
            'verses': verse_range(23, 29),
            'heb': [
                ('anochi yadati', 'anochi yadati', 'I know / I myself know',
                 'God\'s "I know" (v.27) -- before Israel has even crossed the Jordan -- is one of Deuteronomy\'s most sobering divine statements. Omniscience applied to human tendency is not fatalism but realism: God\'s foreknowledge of Israel\'s failure does not cause the failure but prepares for its consequences.'),
            ],
            'ctx': 'The chapter closes with Joshua\'s direct commissioning before the LORD at the tent of meeting (v.23) -- a more solemn version of the public commissioning before Israel (vv.7-8). God then commands Moses to write the song of ch.32 as a witness -- because "I know how rebellious and stiff-necked you are. If you have been rebellious against the LORD while I am still alive and with you, how much more will you rebel after I die!" (v.27). The Torah scroll is deposited beside the ark as a witness against Israel. Two witnesses: the song (in their mouths) and the Torah (beside the ark).',
            'cross': [
                ('Rom 8:29-30', '"For those God foreknew he also predestined... And those he predestined, he also called; those he called, he also justified." God\'s foreknowledge in Deuteronomy 31 is not fatalism but sovereign governance -- he provides for the foreknown failure without approving it.'),
            ],
            'mac': [
                ('31:23', 'MacArthur: "The LORD gave this command to Joshua son of Nun: \'Be strong and courageous, for you will bring the Israelites into the land I promised them on oath, and I myself will be with you.\'" The divine commissioning is direct and personal -- God speaks to Joshua, not only about him. The promise "I myself will be with you" is the covenant\'s most fundamental assurance, repeated from Genesis through Revelation.'),
                ('31:26-29', 'MacArthur: "Take this Book of the Law and place it beside the ark of the covenant of the LORD your God." The Torah is placed beside the ark, not in it (the tablets are inside, Deut 10:5). It serves as a witness -- an external testimony to what God commanded and Israel agreed. The two covenant witnesses are now in place: the ark\'s tablets (the Decalogue) and the Torah scroll (the full covenant). Both will outlast Moses.'),
            ],
        },
    ],
})

deu(32, {
    'title': 'The Song of Moses: Covenant Witness to the Faithless Generation',
    'sections': [
        {
            'header': 'Verses 1–25 — The Song: God\'s Character, Israel\'s Corruption',
            'verses': verse_range(1, 25),
            'heb': [
                ('haazinu hashamayim', 'haazinu hashamayim', 'give ear O heavens',
                 'The song opens by calling heaven and earth as witnesses (v.1) -- the cosmic court summoned to hear the covenant case. This is the ancient Near Eastern treaty witness formula, but where treaties invoke gods as witnesses, Deuteronomy invokes creation itself.'),
                ('tzur', 'tzur', 'Rock',
                 'God as "the Rock" (tzur, vv.4, 15, 18, 30, 31) is the Song of Moses\'s characteristic divine title. The Rock is immovable, trustworthy, and ancient -- the permanent foundation against which Israel\'s fickleness is contrasted. Paul identifies this Rock with Christ (1 Cor 10:4).'),
            ],
            'ctx': 'The Song of Moses (Deuteronomy 32) is one of the most ancient pieces of Hebrew poetry in the OT. Its structure is that of a covenant lawsuit (riv): God summons witnesses (heaven and earth), states his case (Israel\'s ingratitude), describes Israel\'s sin (abandoning the Rock), announces the consequences (divine anger and foreign judgment), and concludes with divine vindication and mercy. The song describes God\'s care for Israel with the most evocative imagery in Deuteronomy: "he found him in a desert land... he encircled him, cared for him, kept him as the apple of his eye. Like an eagle that stirs up its nest, that flutters over its young" (vv.10-11).',
            'cross': [
                ('Rev 15:3', '"They sang the song of God\'s servant Moses and of the Lamb." The Song of Moses is sung in heaven by those who have overcome the beast -- the ultimate covenant witness becomes the song of eschatological victory.'),
                ('1 Cor 10:4', '"They drank from the spiritual rock that accompanied them, and that rock was Christ." Paul\'s identification of Christ with the Rock of Deuteronomy 32 is the NT\'s most explicit typological application of the song.'),
                ('Rom 10:19; 15:10', 'Paul quotes Deuteronomy 32:21 ("I will make you envious by those who are not a nation") and 32:43 ("Rejoice, his people, you nations") in Romans to argue that Gentile inclusion was always anticipated in Israel\'s own scripture.'),
            ],
            'mac': [
                ('32:1-4', 'MacArthur: "He is the Rock, his works are perfect, and all his ways are just. A faithful God who does no wrong, upright and just is he." The song\'s opening is a meditation on God\'s character -- perfect, just, faithful, upright. Everything that follows is measured against this standard: Israel will be shown to be the opposite of what God is. The contrast between God\'s faithfulness and Israel\'s faithlessness is the song\'s organizing principle.'),
                ('32:10-14', 'MacArthur: "In a desert land he found him, in a barren and howling waste. He shielded him and cared for him; he guarded him as the apple of his eye, like an eagle that stirs up its nest and hovers over its young, that spreads its wings to catch them and carries them on its pinions." This is Deuteronomy\'s most beautiful passage. The eagle imagery -- stirring the nest to force the young to fly, hovering beneath to catch them if they fall -- is the most intimate picture of divine pastoral care in the Pentateuch.'),
                ('32:15-18', 'MacArthur: "Jeshurun grew fat and kicked; filled with food, they became heavy and sleek. They abandoned the God who made them and rejected the Rock their Savior." Jeshurun ("the upright one") is a poetic name for Israel -- and its description is devastating: prosperity produced complacency, complacency produced forgetting, forgetting produced apostasy. Deuteronomy 8\'s warning has been ignored.'),
                ('32:19-25', 'MacArthur: "The LORD saw this and rejected them because he was angered by his sons and daughters. \'I will hide my face from them,\' he said." The hiding of God\'s face is the covenant\'s most terrible consequence -- not dramatic judgment but divine withdrawal. The silence of God in the face of apostasy is a more severe sentence than immediate punishment.'),
            ],
            'craigie': [
                ('32:1-43', 'Craigie: The Song of Moses is a covenant lawsuit (Hebrew riv) -- a legal genre well-attested in the OT prophets (Mic 6, Isa 1, Hos 4) where God brings charges against his people in a court setting. The song\'s structure follows the lawsuit pattern: summons (vv.1-3), accusation (vv.4-6), evidence (vv.7-14), violation (vv.15-18), verdict (vv.19-25), and resolution (vv.26-43).'),
            ],
        },
        {
            'header': 'Verses 26–52 — Divine Vindication; Moses Commanded to Die',
            'verses': verse_range(26, 52),
            'heb': [
                ('lu lo kaas oyev agur', 'lu lo kaas oyev agur',
                 'lest the enemy misunderstand',
                 'God\'s restraint in not completely destroying Israel (v.27) is motivated by his concern for his own reputation -- lest the enemies claim credit for what is actually God\'s own disciplinary action. Divine reputation serves as a paradoxical protection for the people being disciplined.'),
                ('ki lo davar req hu mikkhem', 'ki lo davar req hu mikkhem',
                 'for it is not an empty word for you',
                 'Moses\'s final word about the Torah is that it is not empty (req) -- not abstract, theoretical, optional. "It is your life." The word is not a supplementary guideline but the substance of Israel\'s existence. To abandon it is to choose non-life.'),
            ],
            'ctx': 'The song\'s conclusion (vv.26-43) is God\'s vindication: he will not completely destroy Israel because his enemies would misattribute the destruction to their own power (v.27). God\'s honour is paradoxically Israel\'s protection. The song closes with the most universal invitation in Deuteronomy: "Rejoice, you nations, with his people, for he will avenge the blood of his servants" (v.43). After the song is delivered, Moses is commanded to ascend Mount Nebo to view the land and die there.',
            'cross': [
                ('Heb 1:6', '"When God brings his firstborn into the world, he says, \'Let all God\'s angels worship him.\'" Hebrews quotes Deuteronomy 32:43 (LXX) as applied to Christ -- the angels\'s worship of the Son fulfils the song\'s call for cosmic celebration.'),
                ('Rom 15:10', '"Again, it says, \'Rejoice, you Gentiles, with his people.\'" Paul quotes Deuteronomy 32:43 in Romans to demonstrate that Gentile inclusion in the covenant was always anticipated in Israel\'s own scriptures.'),
                ('Matt 17:1-3', '"Just then there appeared before them Moses and Elijah, talking with Jesus." Moses finally enters the Promised Land -- not in death at Nebo but in the company of the land\'s Lord on the Mount of Transfiguration.'),
            ],
            'mac': [
                ('32:39-43', 'MacArthur: "See now that I myself am he! There is no god besides me. I put to death and I bring to life, I have wounded and I will heal, and no one can deliver out of my hand... Rejoice, you nations, with his people." The song ends not with condemnation but with vindication. The avenging and atoning God will ultimately bring his people and all nations to joy. The cosmic call to rejoice with Israel is the OT\'s most universal invitation.'),
                ('32:45-47', 'MacArthur: "When Moses finished reciting all these words to all Israel, he said to them, \'Take to heart all the words I have solemnly declared to you today... They are not just idle words for you -- they are your life.\'" The final summation of Deuteronomy\'s purpose: the law is not idle (empty, weightless) but lifegiving. The word is life. Not a contribution to life but its substance.'),
                ('32:48-52', 'MacArthur: God\'s final instruction to Moses is a death sentence with a landscape attached. "Go up to Mount Nebo in Moab, across from Jericho, and view Canaan... There on the mountain that you have climbed you will die." The dying God has the final word, and it is both judgment and mercy -- you will die here, but I will show you the land first. God gives what he withholds.'),
            ],
        },
    ],
})

deu(33, {
    'title': 'The Blessing of Moses: The Twelve Tribes at the Close',
    'sections': [
        {
            'header': 'Verses 1–17 — The Theophanic Prologue; Blessings on the Tribes',
            'verses': verse_range(1, 17),
            'heb': [
                ('ish haElohim', 'ish haElohim', 'the man of God',
                 'Moses is described as "the man of God" -- a title used of prophets (Elijah, Elisha, Samuel) who speak with divine authority. The farewell blessing is not merely a patriarchal bequest but a prophetic pronouncement. Each tribal blessing is a word from God mediated through his spokesman.'),
                ('YHWH miSinai ba', 'YHWH miSinai ba', 'the LORD came from Sinai',
                 'The opening theophanic declaration -- God coming from Sinai, rising from Seir, shining from Paran -- echoes Habakkuk 3 and Judges 5 (the Song of Deborah). God arrives from his mountain stronghold to bless his people. The cosmic warrior-king descends to pronounce covenant blessing.'),
            ],
            'ctx': 'Chapter 33 is Moses\'s farewell blessing on the twelve tribes -- the OT\'s only example of a prophetic blessing of all Israel at once, comparable to Jacob\'s blessings in Genesis 49. The chapter begins with a theophanic poem (vv.2-5) describing God\'s arrival from Sinai and his rule over Jeshurun, then moves through the tribal blessings, and closes with a magnificent doxology (vv.26-29). The tribal blessings vary significantly from Genesis 49 -- reflecting the changed fortunes of the wilderness period.',
            'cross': [
                ('Gen 49:1-28', 'Jacob\'s blessings on the twelve tribes are the direct precedent for Deuteronomy 33. The comparison reveals Judah\'s changed situation (Deut 33:7 is a prayer for Judah\'s survival) and Levi\'s rehabilitation -- from Gen 49\'s curse for violence to Deut 33\'s elevation to priestly service.'),
                ('Rev 7:4-8', '"Then I heard the number of those who were sealed: 144,000 from all the tribes of Israel." Revelation\'s sealing of the twelve tribes echoes both Moses\'s and Jacob\'s tribal blessings -- the covenant people are individually known and accounted for in God\'s final census.'),
            ],
            'mac': [
                ('33:1', 'MacArthur: Moses\'s final act is blessing. Not warning, not recrimination, not lament -- blessing. Despite everything he knows about Israel\'s coming apostasy, despite his own exclusion from the land, despite forty years of sustained ingratitude -- Moses blesses them. This is the pastoral heart at its fullest: the dying leader uses his last strength to speak good over those he loves.'),
                ('33:2-5', 'MacArthur: The theophanic prologue -- the LORD coming from Sinai, rising from Seir, shining from Paran -- is one of the most ancient pieces of Hebrew poetry. God is the divine warrior marching to bless his people. The cosmic arrival from his mountain stronghold frames all that follows: these blessings are not human wishes but divine pronouncements by the God who controls all nations.'),
                ('33:8-11', 'MacArthur: The blessing of Levi is one of the chapter\'s most theologically significant. "They teach your precepts to Jacob and your law to Israel. They shall put incense before you and whole burnt offerings on your altar." The Levitical vocation is to be the covenant\'s living memory -- the people who teach the Torah so that others can know what God requires.'),
                ('33:13-17', 'MacArthur: The blessings of Joseph (Ephraim and Manasseh) are the most elaborate in the chapter -- dew from heaven, the deep below, finest gifts of the earth, the favour of the one who dwelt in the burning bush. The one who dwelt in the burning bush (v.16) is a unique Deuteronomic title for God, recalling the Exodus commission. The greatest material blessing in the tribal list goes to Joseph\'s descendants.'),
            ],
            'craigie': [
                ('33:2-5', 'Craigie: The theophanic opening of the blessing chapter echoes early Israelite poetry (Judg 5:4-5; Hab 3:3-4) in its description of God coming from the south (Sinai, Seir, Paran). This "divine warrior march" motif is one of the OT\'s most ancient poetic forms. Deuteronomy 33 preserves archaic poetic material that may predate the narrative prose of the book.'),
            ],
        },
        {
            'header': 'Verses 18–29 — Remaining Tribal Blessings; the Great Doxology',
            'verses': verse_range(18, 29),
            'heb': [
                ('ein kaEl Yeshurun', 'ein kaEl Yeshurun', 'there is no one like the God of Jeshurun',
                 'The doxological close of Deuteronomy 33 is one of the OT\'s most beloved statements about divine protection. Jeshurun ("the upright one") is Israel at its idealised best -- and even at its best, it is defined by the God who is incomparable. The community\'s identity is rooted in God\'s uniqueness, not its own.'),
                ('taḥat zero\'ot olam', 'tachat zerot olam', 'underneath are the everlasting arms',
                 '"Underneath are the everlasting arms" -- not merely that God is above, sovereign and transcendent, but that he is underneath, bearing the weight of his people. The God who holds up the cosmos holds up the falling saint. This image of divine support from below is unique in the OT.'),
            ],
            'ctx': 'The remaining tribal blessings (Zebulun, Issachar, Gad, Dan, Naphtali, Asher) are followed by the magnificent doxological close (vv.26-29): "There is no one like the God of Jeshurun, who rides across the heavens to help you and on the clouds in his majesty... The eternal God is your refuge, and underneath are the everlasting arms." The chapter closes: "Blessed are you, Israel! Who is like you, a people saved by the LORD?" The question echoes the Exodus victory song (Exod 15:11: "Who among the gods is like you, LORD?") -- Israel\'s uniqueness is a reflection of its God\'s uniqueness.',
            'cross': [
                ('Exod 15:11', '"Who among the gods is like you, LORD?" Moses\'s question at the Red Sea is answered in the farewell blessing: the people whose God is incomparable are themselves unique. The bookends of Moses\'s ministry are songs of divine incomparability.'),
                ('Eph 6:10', '"Finally, be strong in the Lord and in his mighty power." Paul\'s armour of God passage reflects the Deuteronomy 33 divine warrior theology -- God\'s people are strong not in their own strength but in the strength of the God who rides the heavens on their behalf.'),
            ],
            'mac': [
                ('33:26-27', 'MacArthur: "There is no one like the God of Jeshurun, who rides across the heavens to help you and on the clouds in his majesty... The eternal God is your refuge, and underneath are the everlasting arms." The doxological close is one of the OT\'s most beloved statements about divine protection. "Underneath are the everlasting arms" -- not merely that God is above, sovereign and transcendent, but that he is underneath, bearing the weight of his people.'),
                ('33:29', 'MacArthur: "Blessed are you, Israel! Who is like you, a people saved by the LORD? He is your shield and helper and your glorious sword. Your enemies will cower before you, and you will tread on their heights." Moses\'s final word to Israel is this: you are unique in the world -- not because of your power or wisdom, but because the LORD is your God. The people defined by salvation are unlike all other peoples. Identity, security, and superiority all flow from the single fact of covenant election.'),
            ],
        },
    ],
})

deu(34, {
    'title': 'The Death of Moses: The Greatest Prophet\'s End',
    'sections': [
        {
            'header': 'Verses 1–8 — Moses on Nebo; His Death; Israel\'s Mourning',
            'verses': verse_range(1, 8),
            'heb': [
                ('lo kihata eino velo nas lechocho', 'lo kihata eino velo nas lechocho',
                 'his eyes were not dim nor his natural strength gone',
                 'Moses at 120 years old is in full physical vigour -- his death is not the decay of age but the completion of a covenant term. "On the mouth of the LORD" (v.5) is literally how his death is described -- the death not of failure but of fulfilment. Moses\'s life was exactly the length God intended.'),
                ('al pi YHWH', 'al pi YHWH', 'at the mouth of the LORD / at God\'s command',
                 'The phrase "at the mouth of the LORD" (v.5) is used for Moses\'s death -- literally, God\'s breath. This is the most intimate death description in the OT. Rabbinic tradition reads it as "by the kiss of God" -- Moses died in the direct encounter with the divine.'),
            ],
            'ctx': 'Deuteronomy concludes with the death of Moses. He ascends Mount Nebo, sees the whole land spread out before him -- from Gilead to Dan, Naphtali to the Mediterranean, Negev to Jericho -- and dies there in Moab, buried by God himself in an unknown grave. He is 120 years old, eyes undimmed, strength unabated. The whole nation mourns for thirty days. The unknown grave is a mercy: no shrine, no cult, no successor-worship. Moses points beyond himself to the One greater than Moses.',
            'cross': [
                ('Matt 17:1-3', '"Just then there appeared before them Moses and Elijah, talking with Jesus." Moses\'s Transfiguration appearance is the NT\'s answer to his Pisgah exclusion: the one barred from entering the land by Sinai\'s law enters the land in the company of the law\'s Fulfiller.'),
                ('Jude 9', '"But even the archangel Michael, when he was disputing with the devil about the body of Moses, did not himself dare to condemn him but said, \'The Lord rebuke you!\'" The dispute over Moses\'s body shows the extraordinary significance attached to Moses\'s death even in tradition outside the canon.'),
            ],
            'mac': [
                ('34:1-4', 'MacArthur: "There the LORD showed him the whole land -- from Gilead to Dan, all of Naphtali, the territory of Ephraim and Manasseh, all the land of Judah as far as the Mediterranean Sea, the Negev and the whole region from the Valley of Jericho... Then the LORD said to him, \'This is the land I promised on oath to Abraham, Isaac and Jacob.\'" The sight from Pisgah is simultaneously the fulfilment of the promise and its withholding. God shows Moses exactly what his people will receive and what he himself will not.'),
                ('34:5-6', 'MacArthur: "And Moses the servant of the LORD died there in Moab, as the LORD had said. He buried him in Moab, in the valley opposite Beth Peor, but to this day no one knows where his grave is." God buried Moses. The greatest leader in Israel\'s history received the most intimate burial: no mourners, no monument, no marked grave -- only God\'s hands. The unknown grave is a mercy: no shrine, no cult, no successor-worship.'),
                ('34:7-8', 'MacArthur: "Moses was a hundred and twenty years old when he died, yet his eyes were not weak nor his strength gone." Moses dies in full vigour -- the sharpness of his faculties intact, the energy of his body undiminished. This is covenant-completion death, not decay-of-age death. The mourning period of thirty days matches the mourning for Aaron (Num 20:29) -- Moses\'s death is given equal weight to Israel\'s first high priest.'),
            ],
        },
        {
            'header': 'Verses 9–12 — Joshua\'s Commission; the Verdict on Moses',
            'verses': verse_range(9, 12),
            'heb': [
                ('ki lo kam navi od beYisrael keMoshe', 'ki lo kam navi od beYisrael keMoshe',
                 'no prophet has risen in Israel like Moses',
                 'The OT\'s final verdict on Moses is unequalled excellence -- no prophet has arisen in Israel like him, whom the LORD knew face to face (v.10). This statement sets up the expectation that Deuteronomy 18:15\'s "prophet like Moses" awaits fulfilment. The NT\'s answer is the Word made flesh.'),
                ('asher yada YHWH panim el-panim', 'asher yada YHWH panim el-panim',
                 'whom the LORD knew face to face',
                 'The "face to face" knowledge between God and Moses is the OT\'s highest description of prophetic intimacy. No other prophet received this designation. The NT\'s answer: in Christ, the "face to face" relationship is extended to all -- "now I know in part; then I shall know fully, even as I am fully known" (1 Cor 13:12).'),
            ],
            'ctx': 'The final verses describe the transition: Joshua, full of the spirit of wisdom because Moses had laid hands on him, assumes leadership. The Israelites listen to Joshua and do what the LORD commanded Moses. And then the final word: no prophet has since arisen in Israel like Moses, whom the LORD knew face to face. The OT ends with an unfilled expectation -- Moses is unequalled, but a prophet like Moses was promised (18:15). The gap waits for its answer in the Word made flesh.',
            'cross': [
                ('Heb 3:5-6', '"Moses was faithful as a servant in all God\'s house... But Christ is faithful as the Son over God\'s house." The author of Hebrews ends the OT\'s Moses-comparison exactly where Deuteronomy 34 ends: Moses was the greatest prophet, but Christ is greater -- not servant but Son.'),
                ('John 1:17-18', '"For the law was given through Moses; grace and truth came through Jesus Christ. No one has ever seen God, but the one and only Son... has made him known." John\'s prologue resolves the Deuteronomy 34 "face to face" question: what Moses had partially, Christ gives fully.'),
            ],
            'mac': [
                ('34:9', 'MacArthur: "Now Joshua son of Nun was filled with the spirit of wisdom because Moses had laid his hands on him." The succession is complete: Moses\'s spirit of wisdom is transferred to Joshua through the laying on of hands. The laying on of hands -- commissioning, blessing, Spirit-transfer -- runs from here through the NT\'s apostolic ordination. The mission continues; the messenger changes. The commission outlasts the commissioner.'),
                ('34:10-12', 'MacArthur: "Since then, no prophet has risen in Israel like Moses, whom the LORD knew face to face, who did all those signs and wonders the LORD sent him to do in Egypt... For no one has ever shown the mighty power or performed the awesome deeds that Moses did in the sight of all Israel." The OT\'s final word is a statement of incomparable greatness -- and a gap. No prophet like Moses has arisen since. The gap waits to be filled. The NT\'s answer: the Word made flesh, the Moses-greater-than-Moses (Heb 3:3), has come. In Jesus Christ, the face-to-face relationship with God that Moses alone had in the old covenant is extended to all who are in him.'),
            ],
            'craigie': [
                ('34:1-12', 'Craigie: The death narrative of Deuteronomy 34 is the Deuteronomistic History\'s opening paragraph -- it ends one era (the Mosaic) and begins another (the conquest). Moses\'s death closes the Pentateuch; Joshua\'s commissioning opens the historical books. The covenant continues, the mission continues, the Spirit continues. Only the mediator changes.'),
            ],
            'tigay': [
                ('34:10', 'Tigay: The JPS commentary notes that "no prophet has arisen in Israel like Moses" is a post-Mosaic editorial note, likely added by Joshua or a later editor. It places Deuteronomy\'s protagonist in the entire subsequent prophetic tradition and finds him unequalled. The Deuteronomy 18:15 promise of a prophet like Moses is implicitly still unfulfilled at the canon\'s close -- an open expectation.'),
            ],
        },
    ],
})

print("DEUT-6 complete: chapters 31–34 built.")
print("\n=== ALL 34 DEUTERONOMY CHAPTERS BUILT ===")
