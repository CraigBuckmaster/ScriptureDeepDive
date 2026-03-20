"""DEUT-3: Deuteronomy chapters 12–18 — Cultic and Civil Legislation"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

deu(12, {
    'title': 'The One Place of Worship: Centralisation and Purity',
    'sections': [
        {
            'header': 'Verses 1–28 — Destroy the High Places; One Sanctuary',
            'verses': verse_range(1, 28),
            'heb': [
                ('hammāqôm ʾăšer-yibḥar YHWH', 'hamakom asher yivchar YHWH',
                 'the place which the LORD shall choose',
                 'The formula "the place the LORD will choose" deliberately avoids naming the location — Deuteronomy consistently uses this indirect phrase rather than specifying Jerusalem. The chosen place is defined by divine election, not human preference.'),
                ('šimkô šām', 'shmo sham', 'to put his name there',
                 'The "name theology" of Deuteronomy — God puts his name at the chosen sanctuary — is a deliberate alternative to Exodus-style presence theology. In Deuteronomy, God\'s name (identity, authority, character) is present at the sanctuary; the divine person is in heaven.'),
            ],
            'ctx': 'Chapter 12 inaugurates the central law section (chs.12–26) with its most distinctive command: all worship must be centralised at the one sanctuary God will choose. Scattered altars and high places — the Canaanite pattern of worship at every hill and under every green tree — must be destroyed completely. The centralisation demand is simultaneously anti-syncretistic and community-forming: the whole nation gathers in one place. The chapter also addresses a practical consequence: if the slaughter of meat is decentralised, meat may be eaten without sacrifice (vv.15–16) — but blood must still not be consumed. The final verse gives the permanent anti-syncretism principle: do not worship the LORD using the methods of Canaanite religion.',
            'cross': [
                ('John 4:21–24', '"A time is coming when you will worship the Father neither on this mountain nor in Jerusalem... God is spirit, and his worshipers must worship in the Spirit and in truth." Jesus radically fulfils and supersedes the Deuteronomy 12 centralisation principle: the one place of worship is no longer geographical but spiritual.'),
                ('1 Kgs 8:29', '"May your eyes be open toward this temple night and day, this place of which you said, \'My Name shall be there.\'" Solomon\'s dedication prayer uses the Deuteronomic name-theology to consecrate the Jerusalem temple.'),
            ],
            'mac': [
                ('12:2–4', 'MacArthur: "Destroy completely all the places on the high mountains and on the hills and under every spreading tree where the nations you are dispossessing worship their gods." The command is total: no accommodation to existing religious sites. You cannot use an idol\'s altar and worship a different God — the form of worship shapes its content.'),
                ('12:5–7', 'MacArthur: "But you are to seek the place the LORD your God will choose from among all your tribes to put his Name there for his dwelling." The contrast is deliberate: the nations worshipped wherever they chose; Israel will worship where God chooses. Worship is not a human preference but a divine appointment.'),
                ('12:13–14', 'MacArthur: "Be careful not to sacrifice your burnt offerings anywhere you please. Offer them only at the place the LORD will choose." The warning against worshipping "anywhere you please" is the foundational critique of autonomous religion — worship designed by human preference rather than divine command.'),
                ('12:29–32', 'MacArthur: "Be careful not to be ensnared by inquiring about their gods, saying, \'How do these nations serve their gods? We will do the same.\'" Religious curiosity is not neutral — it can become religious contamination. Israel\'s syncretism always began with curiosity, not conversion.'),
            ],
            'craigie': [
                ('12:1–7', 'Craigie: The centralisation command is the legislative expression of Deuteronomy\'s monotheism: just as there is one God, there is one legitimate place to meet him. Fragmented worship sites in the ancient world typically served competing deities. Centralisation is a liturgical statement about the unity and exclusivity of Israel\'s God.'),
            ],
            'tigay': [
                ('12:15–16', 'Tigay: The permission to slaughter animals for food anywhere is a significant legal relaxation from Levitical practice (Lev 17:1–4). This reflects the practical reality of a settled, dispersed Israel — daily meat consumption cannot require a trip to the central sanctuary. The blood prohibition (v.16) remains absolute, as the sacred character of life.'),
            ],
        },
        {
            'header': 'Verses 29–32 — No Curiosity About Canaanite Religion',
            'verses': verse_range(29, 32),
            'heb': [
                ('lōʾ-taʿăśeh kēn laYHWH', 'lo taase chen laYHWH',
                 'you shall not worship the LORD your God in their way',
                 'The prohibition of Canaanite worship methods applied to YHWH-worship is one of Deuteronomy 12\'s most radical statements. It is not only forbidden to worship other gods using their methods; it is also forbidden to worship the true God using those methods. Form matters.'),
            ],
            'ctx': 'The final verses anticipate the temptation of religious imitation: after the Canaanites are driven out, Israel might adopt their worship practices for the LORD. This is explicitly forbidden. The Canaanites even burned their children to their gods (v.31), the ultimate expression of Canaanite religion\'s corruption and the most urgent warning about where religious syncretism ultimately leads.',
            'cross': [
                ('Jer 19:5', '"They have built the high places of Baal to burn their children in the fire as offerings." Jeremiah documents exactly the syncretistic child sacrifice Moses warned against.'),
                ('1 Cor 10:20-21', 'The sacrifices of pagans are offered to demons, not to God. You cannot drink the cup of the Lord and the cup of demons too. Paul\'s analysis of pagan sacrifice echoes the Deuteronomic concern.'),
            ],
            'mac': [
                ('12:29-31', 'MacArthur: The logic of Deut 12:29-31 is still operative. Religious practices do not carry neutral content -- they embody and transmit theological commitments. The question "how do they worship their gods?" is always followed by "we will do the same." Israel\'s history from Judges through the divided kingdom is precisely the tragedy of religious imitation that Moses is anticipating.'),
                ('12:32', 'MacArthur: "See that you do all I command you; do not add to it or take away from it." The canon-closing formula applied to the Deuteronomic law establishes the principle of sola scriptura centuries before the Reformation articulated it. Both addition (innovations in worship) and subtraction (ignoring inconvenient commands) are equally forbidden.'),
            ],
        },
    ],
})

deu(13, {
    'title': 'Testing False Prophets and Apostates: Covenant Loyalty Over Family',
    'sections': [
        {
            'header': 'Verses 1–11 — The False Prophet; the Family Member Who Entices',
            'verses': verse_range(1, 11),
            'heb': [
                ('nābîʾ ʾô ḥōlēm ḥălôm', 'navi o cholem chalom',
                 'prophet or one who foretells by dreams',
                 'Deuteronomy 13 addresses the situation where both prophet and dreamer appear to function miraculously — signs and wonders occur — but the message is idolatrous. The criterion for testing prophecy is not supernatural power but theological faithfulness: does the message call Israel toward or away from the LORD?'),
                ('ʾaḥarê ʾĕlōhîm ʾăḥērîm', 'acharei elohim acherim', 'after other gods',
                 'The phrase "other gods" is Deuteronomy\'s standard description of idolatry — gods who are "other" (acher) than the LORD, alien to the covenant relationship. The idolatry test runs through all of Deuteronomy\'s false-prophet legislation.'),
            ],
            'ctx': 'Chapter 13 addresses three scenarios of apostasy: (1) a prophet or dreamer who performs signs but leads to other gods (vv.1–5); (2) a family member who secretly entices to other gods (vv.6–11); (3) a whole city that goes after other gods (vv.12–18). In all three cases the response is the same: death. The severity reflects the stakes: apostasy is not merely personal failure but covenant catastrophe. The chapter also teaches that miraculous signs are not self-validating — a miracle that contradicts God\'s word is a test, not a confirmation (v.3).',
            'cross': [
                ('Matt 24:24', '"For false messiahs and false prophets will appear and perform great signs and wonders to deceive, if possible, even the elect." Jesus quotes Deuteronomy 13\'s false prophet scenario as the template for end-time deception.'),
                ('Gal 1:8', '"But even if we or an angel from heaven should preach a gospel other than the one we preached to you, let them be under God\'s curse!" Paul applies the Deuteronomy 13 logic to gospel preaching: the test is not the messenger\'s authority but the message\'s faithfulness.'),
                ('1 John 4:1', '"Test the spirits to see whether they are from God, because many false prophets have gone out into the world." John\'s testing-of-spirits instruction is the NT application of Deuteronomy 13\'s false prophet test.'),
            ],
            'mac': [
                ('13:1–3', 'MacArthur: "If the sign or wonder spoken of takes place, and the prophet says, \'Let us follow other gods\'... you must not listen to the words of that prophet." The miracle happened, but the prophet is still false. Supernatural confirmation does not validate spiritual direction. This is the permanent antidote to sensationalism — miracles do not authenticate theology.'),
                ('13:3', 'MacArthur: "The LORD your God is testing you to find out whether you love him with all your heart and with all your soul." The false prophet is permitted to arise as a divine test of Israel\'s covenant loyalty. This is the same pattern as Job: God allows the test to prove, not to destroy.'),
                ('13:6–9', 'MacArthur: "If your very own brother, or your son or daughter, or the wife you love... secretly entices you, saying, \'Let us go and worship other gods\'... do not yield to them or listen to them." Covenant loyalty to God supersedes even the deepest human loyalties. Jesus quoted this principle (Matt 10:37): "Anyone who loves father or mother more than me is not worthy of me."'),
                ('13:10–11', 'MacArthur: The execution of the apostate enticer — even a family member — is the most shocking command in Deuteronomy 13. Read within covenant theology it makes sense: apostasy is spiritual treason against the community\'s covenant with God. The severity is not disproportionate to the crime but calibrated to its catastrophic consequences.'),
            ],
            'tigay': [
                ('13:1–5', 'Tigay: The admission that a false prophet\'s sign may actually come true (v.2) is theologically remarkable. The criterion for testing prophecy is theological, not empirical. God can allow miracles to accompany false prophecy as a test. Supernatural power is never self-validating.'),
            ],
        },
        {
            'header': 'Verses 12–18 — The Apostate City: Total Destruction Required',
            'verses': verse_range(12, 18),
            'heb': [
                ('yāṣĕʾû ʾănāšîm bĕliyaʿal', 'yatzu anashim veliyaal',
                 'certain worthless scoundrels have gone out',
                 'Beliyaal (literally "without profit/value") is used for the most contemptible moral failure. The worthless scoundrels of Deut 13:13 who entice a city to apostasy foreshadow the NT\'s Belial (2 Cor 6:15) — the embodiment of covenant betrayal.'),
            ],
            'ctx': 'If an entire Israelite city is led into idolatry, it receives the same herem treatment as Canaanite cities: complete destruction, burning to ash, never rebuilt. The logic is consistent: apostasy within the covenant community is more dangerous than apostasy outside it. An Israelite city worshipping false gods is a cancer in the covenant body. The chapter ends with the covenant promise: if you execute this judgment, God will be merciful to you and multiply you.',
            'cross': [
                ('Rev 17–18', '"Fallen, fallen is Babylon the Great!" Revelation\'s imagery of the apostate city destroyed draws on Deuteronomy 13:16\'s herem of the apostate Israelite city.'),
            ],
            'mac': [
                ('13:12–15', 'MacArthur: "If you hear it said about one of the towns... then you must inquire, probe and investigate it thoroughly." The process before judgment is careful — thorough investigation, not mob action. The severity of the ultimate penalty is matched by the scrupulousness of the process that leads to it.'),
                ('13:16–18', 'MacArthur: The herem of the apostate city includes its livestock and goods — total destruction, nothing kept. The temptation to profit from judgment is the temptation of Achan (Josh 7) and Saul (1 Sam 15). Judgment that benefits the executor is not pure judgment but mixed motive.'),
            ],
        },
    ],
})

deu(14, {
    'title': 'Clean and Unclean Food; Tithing Laws',
    'sections': [
        {
            'header': 'Verses 1–21 — A Holy People: Dietary Distinctions',
            'verses': verse_range(1, 21),
            'heb': [
                ('lōʾ titgōdĕdû', 'lo titgodedu', 'you shall not cut yourselves',
                 'The prohibition of self-cutting as a mourning practice is an anti-Canaanite command — it was characteristic of Canaanite religious mourning (cf. 1 Kgs 18:28, the Baal prophets). Israel\'s identity as God\'s children (v.1) prohibits such rites.'),
                ('bāhēmāh ṭĕhōrāh', 'behema tehorah', 'clean animal',
                 'The dietary distinctions are a condensed version of Leviticus 11. The rationale given here (v.21c) — "you are a holy people to the LORD your God" — grounds the food laws not in hygiene but in identity. Israel\'s eating habits mark them as different: every meal is a declaration of covenant distinctiveness.'),
            ],
            'ctx': 'Chapter 14 addresses mourning practices (vv.1–2) and dietary laws (vv.3–21) under the same theological heading: "you are a holy people to the LORD your God." Both sections are applications of Israel\'s covenant identity. The mourning prohibitions distinguish Israel from Canaanite grief practices; the food laws distinguish Israel from Canaanite eating practices. Holiness is embodied in the daily — in how you grieve and how you eat, not only in grand religious occasions.',
            'cross': [
                ('Acts 10:9–16', '"Do not call anything impure that God has made clean." Peter\'s vision repeals the dietary laws as a covenant boundary between Jews and Gentiles, fulfilling the new covenant\'s erasure of ethnic/ritual distinctions.'),
                ('Col 2:16–17', '"Therefore do not let anyone judge you by what you eat or drink... These are a shadow of the things that were to come; the reality, however, is found in Christ."'),
            ],
            'mac': [
                ('14:1–2', 'MacArthur: "You are the children of the LORD your God. Do not cut yourselves or shave the front of your heads for the dead." The filial identity — "children of the LORD your God" — is the deepest ground for all Deuteronomy\'s behavioral commands. You behave this way because of who you are. Identity produces ethics; covenant relationship shapes conduct.'),
                ('14:3–8', 'MacArthur: The clean/unclean animal distinctions seem arbitrary to modern readers, but their consistent rationale is holiness-marking. Every meal eaten in obedience to these rules was a micro-act of covenant identity. The food laws trained Israel to think in categories — clean and unclean, holy and common — that shaped the whole theological imagination.'),
                ('14:21c', 'MacArthur: "Do not cook a young goat in its mother\'s milk." This law (appearing three times in the Pentateuch) is the foundation of the Jewish practice of not mixing milk and meat. At a theological level, it resists the confusion of life-giving (mother\'s milk) with life-taking (death and cooking). Categories of life and death must not be mingled.'),
                ('14:22–23', 'MacArthur: "Be sure to set aside a tenth of all that your fields produce each year... so that you may learn to revere the LORD your God always." The tithe\'s stated purpose is educational — "so that you may learn." The act of giving first produces the habit of reverence. Tithing is spiritual formation through financial practice.'),
            ],
        },
        {
            'header': 'Verses 22–29 — The Annual Tithe; the Third-Year Tithe for the Poor',
            'verses': verse_range(22, 29),
            'heb': [
                ('maʿăśēr', 'maaser', 'tithe / tenth',
                 'The tithe (a tenth of annual produce) is Israel\'s acknowledgment that God owns the land and its produce — the human farmer is a tenant, not an owner. Giving a tenth is not charity but recognition of prior ownership.'),
            ],
            'ctx': 'Deuteronomy distinguishes two tithe cycles: the annual tithe for the pilgrimage feasts (vv.22–26), and the third-year tithe for the Levites, foreigners, orphans, and widows (vv.27–29). The annual tithe is consumed "in the presence of the LORD" at the chosen sanctuary — a festive meal of rejoicing before God. If the journey is too long to bring produce, it may be converted to money. The third-year tithe stays locally for the poor. Together they form a comprehensive social welfare system embedded in the agricultural calendar.',
            'cross': [
                ('2 Cor 9:6–7', '"Whoever sows sparingly will also reap sparingly... God loves a cheerful giver." Paul\'s NT tithing theology expands Deuteronomy 14\'s "learn to revere" rationale: giving flows from a transformed heart.'),
            ],
            'mac': [
                ('14:26', 'MacArthur: "Use the silver to buy whatever you like: cattle, sheep, wine or other fermented drink, or anything you wish. Then you and your household shall eat there in the presence of the LORD your God and rejoice." The tithe feast is a banquet of joy, not a solemn sacrifice. The dominant tone of OT covenant practice was celebration, not mourning. God commanded his people to eat, drink, and be glad in his presence.'),
                ('14:28–29', 'MacArthur: The third-year tithe — for the Levite, the foreigner, the orphan, and the widow — is the OT\'s structural provision for the economically vulnerable. It is covenant obligation: a percentage of every community\'s agricultural output is permanently earmarked for those who cannot produce their own food.'),
            ],
        },
    ],
})

deu(15, {
    'title': 'The Sabbath Year: Debt Cancellation, Slave Release, Firstborn Animals',
    'sections': [
        {
            'header': 'Verses 1–18 — Debt Release; the Generous Heart; Slave Freedom',
            'verses': verse_range(1, 18),
            'heb': [
                ('šĕmiṭṭāh', 'shemita', 'release / remission',
                 'The shemita (sabbath year release) is one of the Torah\'s most radical economic provisions. Every seven years, debts owed between Israelites are cancelled. The word is from shamat (to let drop, release). The provision protects the poor from permanent debt bondage and forces periodic economic levelling.'),
                ('pen yihyeh dābar ʿim-lĕbābĕkā bĕliyaʿal',
                 'pen yihyeh davar im-levavcha beliyaal',
                 'lest there be a wicked thought in your heart',
                 'Moses anticipates the psychological resistance to the release year. The "wicked thought" (beliyaal in the heart) is the rationalization of selfishness masquerading as prudence. Deuteronomy is a manual for the internal life, not just external behavior.'),
            ],
            'ctx': 'Chapter 15 contains three linked provisions: the seventh-year debt cancellation (vv.1–11), the release of Hebrew slaves in the seventh year (vv.12–18), and the firstborn animal laws (vv.19–23). All three reflect the same theology: Israel was enslaved in Egypt, God freed them, therefore Israel must not enslave its own members permanently. The Exodus is the ground of all social justice legislation in Deuteronomy. Moses not only commands generosity — he anticipates and addresses the psychology of resistance.',
            'cross': [
                ('Luke 4:18–19', '"He has sent me to proclaim freedom for the prisoners... to proclaim the year of the Lord\'s favour." Jesus\' inaugural sermon reads his ministry as the fulfilment of the shemita and Jubilee — the ultimate release year.'),
                ('Matt 18:23–35', 'The parable of the unmerciful servant is a Deuteronomy 15 meditation: a slave is forgiven an enormous debt, then refuses to forgive a small debt owed to him. You who have been released must release others.'),
                ('2 Cor 8:9', '"For you know the grace of our Lord Jesus Christ, that though he was rich, yet for your sake he became poor, so that you through his poverty might become rich."'),
            ],
            'mac': [
                ('15:1–3', 'MacArthur: The seventh-year debt release applies between Israelites. The principle still stands: the people of God are to order their economic relationships according to principles of generosity and periodic levelling that the surrounding culture does not practice.'),
                ('15:7–10', 'MacArthur: "Do not be hardhearted or tightfisted toward them. Rather, be openhanded and freely lend them whatever they need." The openhanded/tightfisted contrast is visceral — Moses is appealing to embodied generosity. The command to lend even near the seventh year is a test of genuine generosity versus calculated self-interest.'),
                ('15:9', 'MacArthur: "Be careful not to harbour this wicked thought: \'The seventh year, the year for cancelling debts, is near,\' so that you do not show ill will toward the needy." Moses doesn\'t just command generosity — he names the exact rationalization that prevents it. The wicked thought is always dressed in pragmatism. Deuteronomy addresses the heart, not just the hand.'),
                ('15:12–15', 'MacArthur: "If any of your people sell themselves to you and serve you six years, in the seventh year you must let them go free." The slave release is grounded in the Exodus: "Remember that you were slaves in Egypt and the LORD your God redeemed you." The redeemed must not permanently enslave the redeemable.'),
            ],
            'craigie': [
                ('15:1–11', 'Craigie: The shemita law is among the most socially radical provisions in any ancient legal code. Its economic vision — periodic debt cancellation to prevent permanent poverty — has no parallel in Hammurabi or any other ANE code. The radicalism is theological: the land and its wealth belong to God, and permanent economic stratification violates the covenant community\'s identity.'),
            ],
        },
        {
            'header': 'Verses 19–23 — The Firstborn Animal: Reserved for God',
            'verses': verse_range(19, 23),
            'heb': [
                ('kal-habĕkôr ʾăšer yiwwālēd', 'kol-habechor asher yivvaled',
                 'every firstborn that is born',
                 'Firstborn animals belong to God — because the firstborn represents the first-fruit of life and production. Dedicating the firstborn acknowledges that new life begins with God and that Israel\'s herds are covenant property held in trust.'),
            ],
            'ctx': 'The firstborn animal law concludes chapter 15: male firstborn cattle, sheep, and goats belong to the LORD and may not be put to work or used for shearing. They are eaten at the annual feasts. The pattern of Deuteronomy\'s economic legislation is now visible: the seventh-year release, the tithes, the firstborn laws — all are structured acknowledgments of divine ownership.',
            'cross': [
                ('Heb 12:23', '"The church of the firstborn, whose names are written in heaven." The NT church is described as a "firstborn" community — the first-fruit of the new creation, consecrated to God.'),
                ('Col 1:15', '"The Son is the image of the invisible God, the firstborn over all creation." Christ is the ultimate Firstborn — the first-fruit of the new creation who defines what all firstborn are meant to be.'),
            ],
            'mac': [
                ('15:19–20', 'MacArthur: "Set apart for the LORD your God every firstborn male of your herds and flocks. Do not put the firstborn of your oxen to work, and do not shear the firstborn of your sheep." The firstborn animal\'s exemption from labour is a weekly reminder that some things belong entirely to God and must not be pressed into human service.'),
                ('15:21–23', 'MacArthur: The provision allowing a defective firstborn to be eaten locally shows the law\'s pastoral realism. God does not require the impossible — he provides for imperfection without abandoning the principle. The blood prohibition (v.23) remains absolute because life belongs to God.'),
            ],
        },
    ],
})

deu(16, {
    'title': 'The Three Annual Festivals; Justice in the Gates',
    'sections': [
        {
            'header': 'Verses 1–17 — Passover, Weeks, and Tabernacles',
            'verses': verse_range(1, 17),
            'heb': [
                ('ḥag happesaḥ', 'chag hapesach', 'the feast of Passover',
                 'The three pilgrimage feasts (Passover, Weeks/Pentecost, Tabernacles) are Deuteronomy\'s liturgical calendar. Passover commemorates the Exodus; Weeks celebrates the grain harvest; Tabernacles commemorates the wilderness and celebrates the final harvest. All three are to be observed "in the place the LORD will choose."'),
                ('šāmôr ʾet-ḥodeš hāʾābîb', 'shamor et-chodesh haAviv',
                 'observe the month of Abib',
                 'Abib (Nisan) is the month of the Exodus and the Passover. "Observing" the month means ordering the year around this sacred memory. The calendar itself is a theological statement: Israel\'s time begins with redemption, not with creation or agricultural cycles.'),
            ],
            'ctx': 'Chapter 16 summarises the three pilgrimage feasts: Passover (vv.1–8), Weeks/Pentecost (vv.9–12), and Tabernacles (vv.13–17). All three are to be held at the central sanctuary; all three involve rejoicing; all three include the whole household — sons, daughters, servants, Levites, foreigners, orphans, widows. The feast structure is a community-gathering, equality-enforcing institution. The chapter closes: "Every man shall give as he is able, according to the blessing of the LORD your God that he has given you" (v.17).',
            'cross': [
                ('Acts 2:1–4', '"When the day of Pentecost came, they were all together in one place." The outpouring of the Spirit occurs on the festival of Weeks — the first-fruits of the Spirit\'s harvest are given on the day Israel offered its first-fruits of grain.'),
                ('John 7:37–39', '"On the last and greatest day of the festival, Jesus stood and said... \'Let anyone who is thirsty come to me and drink.\'" Jesus\' invitation at the Tabernacles festival claims to fulfil what the feast pointed toward.'),
                ('1 Cor 5:7–8', '"For Christ, our Passover lamb, has been sacrificed. Therefore let us keep the Festival." Paul reads the Christian life as a perpetual Passover festival in light of Christ\'s sacrifice.'),
            ],
            'mac': [
                ('16:1–3', 'MacArthur: "Observe the month of Abib and celebrate the Passover of the LORD your God." The Passover is the central act of Israel\'s worship calendar — the yearly re-enactment of the Exodus. Israel\'s entire liturgical year is oriented around redemption history, not agricultural cycles. Grace received (Passover) precedes harvest celebrated (Weeks and Tabernacles).'),
                ('16:9–12', 'MacArthur: "Count off seven weeks... and rejoice before the LORD your God at the place he will choose." The feast of Weeks is joy in the LORD\'s presence for what the harvest represents: God\'s provision of daily life. The command to rejoice is not optional sentiment — it is covenant obligation.'),
                ('16:13–15', 'MacArthur: "Celebrate the Festival of Tabernacles for seven days... Be joyful at your festival... your joy will be complete." The seven-day joy festival is remarkable — God gives Israel a week of sustained, corporate rejoicing. Complete joy is the covenant\'s affective goal, not merely its incidental benefit.'),
                ('16:16–17', 'MacArthur: "Three times a year all your men must appear before the LORD... No man should appear before the LORD empty-handed: Each of you must bring a gift in proportion to the way the LORD your God has blessed you." The principle of proportional giving — not equal giving but proportional to blessing — is the covenant\'s economic equity mechanism.'),
            ],
        },
        {
            'header': 'Verses 18–22 — Appoint Judges; Do Not Pervert Justice',
            'verses': verse_range(18, 22),
            'heb': [
                ('šōpĕṭîm wĕšōṭĕrîm', 'shoftim veshotrim', 'judges and officers',
                 'Judges decided cases; officers enforced decisions. The appointment is local: "in all your towns" — justice must be accessible, not centralised only at the sanctuary.'),
                ('ṣedeq ṣedeq tirdōp', 'tzedek tzedek tirdof', 'justice, justice you shall pursue',
                 'The double repetition of tzedek (justice, righteousness) indicates not mere pursuit of justice but zealous, passionate pursuit. The verb radap (to pursue, chase) is used of hunting — justice is pursued with that intensity.'),
            ],
            'ctx': 'The festival laws transition immediately to judicial laws — the connection is deliberate. A community that celebrates God\'s justice must embody justice in its courts. Judges are to be appointed in every town; they must judge impartially, take no bribes, not pervert justice. The Asherah pole and sacred stone — symbols of Canaanite fertility religion — must not be set up near the altar: not even in the village square may Canaanite religious symbols stand alongside the altar of the LORD.',
            'cross': [
                ('Amos 5:24', '"But let justice roll on like a river, righteousness like a never-failing stream!" Amos\'s great justice oracle is the prophetic development of Deuteronomy 16:20\'s "justice, justice you shall pursue."'),
                ('Matt 23:23', '"You have neglected the more important matters of the law — justice, mercy and faithfulness." Jesus identifies the "weightier matters" in terms that directly echo Deuteronomy 16\'s justice mandate.'),
            ],
            'mac': [
                ('16:18–19', 'MacArthur: "Do not pervert justice or show partiality. Do not accept a bribe, for a bribe blinds the eyes of the wise and twists the words of the innocent." The three prohibitions — perversion, partiality, and bribery — cover the three main failure modes of human justice systems. All three distort the same thing: the truth.'),
                ('16:20', 'MacArthur: "Follow justice and justice alone, so that you may live and possess the land the LORD your God is giving you." The justice-land connection is striking: a just judicial system is literally a condition of possessing the land. A society that perverts justice loses its right to the inheritance. This is why the prophets connect social injustice so directly with exile.'),
            ],
        },
    ],
})

deu(17, {
    'title': 'Courts of Appeal; the Law of the King',
    'sections': [
        {
            'header': 'Verses 1–13 — Idolatry Cases; the Supreme Court',
            'verses': verse_range(1, 13),
            'heb': [
                ('ʿal-pî šĕnayim ʿēdîm', 'al pi shnayim edim', 'on the testimony of two witnesses',
                 'The two-witness rule is a cornerstone of Deuteronomic legal procedure. No capital sentence may be executed on the testimony of a single witness. The NT extends this to church discipline (Matt 18:16) and apostolic credibility (2 Cor 13:1).'),
                ('hammaqqôm ʾăšer yibḥar', 'hamakom asher yivchar', 'the place which he will choose',
                 'The central sanctuary serves as the supreme court for cases too difficult for local judges. The highest judicial authority in Israel is located in the presence of God — a theological statement about the ultimate source of justice.'),
            ],
            'ctx': 'Chapter 17 addresses two judicial scenarios: (1) an idolater worthy of death — the trial procedure, the two-witness requirement, the witnesses casting the first stone (vv.2–7); (2) cases too difficult for local courts, referred to the central Levitical-priestly court (vv.8–13). The defiant person who ignores the supreme court\'s ruling is executed for contempt — the community\'s legal integrity requires that final decisions be respected. The chapter then introduces the remarkable law of the king (vv.14–20).',
            'cross': [
                ('Matt 18:16', '"Take one or two others along, so that \'every matter may be established by the testimony of two or three witnesses.\'" Jesus applies the Deuteronomy 17 two-witness rule to church discipline.'),
                ('John 8:17', '"In your own Law it is written that the testimony of two witnesses is true. I am one who testifies for myself; my other witness is the Father." Jesus invokes the Deuteronomy 17 two-witness rule in his own defence.'),
            ],
            'mac': [
                ('17:6–7', 'MacArthur: "The hands of the witnesses must be first in putting that person to death." The witnesses must participate in the execution — a powerful disincentive to false testimony. If you accuse someone falsely, you will personally participate in their death. The legal system\'s integrity is protected by making false accusation psychologically costly.'),
                ('17:8–12', 'MacArthur: The appeal to the central court establishes a crucial principle: there are cases too complex for local wisdom. Humility about the limits of local judgment is a judicial virtue. The defiant person who ignores the ruling is executed, because a community where every individual decides which judgments to accept is no community at all.'),
                ('17:14–17', 'MacArthur: Three prohibitions on the king: no many horses (military power), no many wives (harem diplomacy), no much silver and gold (wealth accumulation). These three prohibitions are precisely violated by Solomon (1 Kgs 10–11) — Deuteronomy 17 is the measure by which Israel\'s greatest king is judged and found wanting.'),
                ('17:18–20', 'MacArthur: "When he takes the throne... he is to write for himself on a scroll a copy of this law... He is to read it all the days of his life." The king is defined as the Torah\'s primary student. The covenant leader is not above the law but under it. God\'s word governs the governor.'),
            ],
            'craigie': [
                ('17:14–20', 'Craigie: The law of the king in Deuteronomy is unique in the ancient Near East. No other ancient law code attempts to pre-emptively limit the power of a king or define kingship as fundamentally law-observant. In surrounding cultures, the king was the source of law; in Israel, the king is under the law.'),
            ],
        },
        {
            'header': 'Verses 14–20 — The Law of the King',
            'verses': verse_range(14, 20),
            'heb': [
                ('lōʾ-yarabbeh-llô sûsîm', 'lo yarbeh lo susim',
                 'he shall not multiply horses for himself',
                 'The three multiplying prohibitions (horses, wives, silver/gold) use the same verb rabah (to multiply, increase) — the king must not multiply the symbols of royal power. Each is a specific temptation of ancient Near Eastern kingship.'),
                ('mishneh hatôrāh hazzōʾt', 'mishneh haTorah hazot', 'a copy of this law',
                 'The king must write for himself a copy of the Torah — not commission a copy, but personally write one. The physical act of transcription is a formation exercise: you cannot copy a text without reading it carefully.'),
            ],
            'ctx': 'The law of the king (vv.14–20) fundamentally redefines kingship. The Israelite king is to be chosen by God (not the people), be from among the Israelites, not multiply horses/wives/wealth, and read the Torah daily so that his heart is not lifted above his brothers. The king is a brother, not a lord. The Deuteronomic ideal — the king as the Torah\'s primary student and servant — is the measure against which all of Israel\'s kings will be evaluated in the Deuteronomistic History.',
            'cross': [
                ('1 Kgs 10–11', 'Solomon violates all three prohibitions: 1,400 chariots and 12,000 horses (1 Kgs 10:26); 700 wives and 300 concubines (1 Kgs 11:3); accumulated silver and gold beyond measure (1 Kgs 10:27). Deuteronomy 17 is the specific measuring rod against which Solomon is judged.'),
                ('Matt 21:5', '"See, your king comes to you, gentle and riding on a donkey." Jesus\' Palm Sunday entry is an anti-Deuteronomy-17 king announcement: no horses, no military display — the covenant king arrives in the mode of a brother, not a lord.'),
            ],
            'mac': [
                ('17:15', 'MacArthur: "Be sure to appoint over you a king the LORD your God chooses." God\'s selection of the king is the foundation of legitimate Israelite monarchy. When Israel demands a king "like all the nations" (1 Sam 8:5), Samuel rebukes them because they are asking for human selection rather than divine appointment.'),
                ('17:20', 'MacArthur: The king must not "consider himself better than his fellow Israelites." The covenant king is a brother — primus inter pares, first among equals. The NT application: Peter\'s "not lording it over those entrusted to you" (1 Pet 5:3) and Jesus\' "the greatest among you will be your servant" (Matt 23:11).'),
            ],
        },
    ],
})

deu(18, {
    'title': 'Levitical Provisions; Divination Prohibited; The Prophet Like Moses',
    'sections': [
        {
            'header': 'Verses 1–8 — Priestly Portions; the LORD as Inheritance',
            'verses': verse_range(1, 8),
            'heb': [
                ('YHWH hûʾ naḥălātô', 'YHWH hu nachalato', 'the LORD is his inheritance',
                 'The Levites have no territorial inheritance — the LORD himself is their inheritance (v.2). Those who serve God fully are sustained by God fully. The NT equivalent is Jesus\' "do not worry about what you will eat or drink" (Matt 6:25).'),
                ('nābîʾ miqirbĕkā meʾaḥêkā kāmōnî',
                 'navi mikirbecha meacheicha kamoni',
                 'a prophet from your midst, from your brothers, like me',
                 'The "prophet like Moses" (18:15–18) is one of the OT\'s most significant messianic texts. The NT applies it explicitly to Jesus (Acts 3:22; John 6:14). The criteria: from among Israel, spirit-equipped, speaking God\'s words, to be obeyed under penalty of divine judgment.'),
            ],
            'ctx': 'Chapter 18 addresses three aspects of Israel\'s religious infrastructure: (1) the material support of Levitical priests (vv.1–8); (2) the prohibition of occult practices (vv.9–13) — divination, sorcery, omens, witchcraft, mediums, spiritists; (3) the promise of the true prophet (vv.14–22). The contrast is sharp: Israel has legitimate channels of divine access (priest and prophet); it must not resort to illegitimate ones. The chapter is the OT\'s clearest statement about the uniqueness of authorised prophetic revelation.',
            'cross': [
                ('Acts 3:22–23', '"For Moses said, \'The Lord your God will raise up for you a prophet like me from among your own people; you must listen to everything he tells you.\'" Peter applies Deuteronomy 18:15–19 directly to Jesus at Pentecost.'),
                ('John 1:21, 25', '"Are you the Prophet?" The crowds repeatedly ask this question, showing Deut 18 was a live messianic expectation in Second Temple Judaism.'),
                ('John 6:14', '"Surely this is the Prophet who is to come into the world." The feeding of the 5,000 (like manna in the wilderness) triggers identification of Jesus as the Deuteronomy 18 prophet.'),
                ('Heb 1:1–2', '"In the past God spoke to our ancestors through the prophets... but in these last days he has spoken to us by his Son." Hebrews reads the whole prophetic tradition as finding its fulfilment in Christ.'),
            ],
            'mac': [
                ('18:9–12', 'MacArthur: "When you enter the land... do not learn to imitate the detestable ways of the nations there. Let no one be found among you who sacrifices their son or daughter in the fire, who practices divination or sorcery..." The list of prohibited occult practices covers every method of accessing spiritual power outside of legitimate divine channels. Their common feature: all attempt to gain knowledge or power from spiritual sources other than God.'),
                ('18:13', 'MacArthur: "You must be blameless before the LORD your God." The covenant people do not need occult access to spiritual reality because they have direct relationship with the true God. Occultism is the spiritual practice of those who do not have genuine access to God — Israel\'s prohibition is a statement about the privilege of covenant relationship.'),
                ('18:15–18', 'MacArthur: "The LORD your God will raise up for you a prophet like me from among you... I will raise up for them a prophet like you from among their fellow Israelites, and I will put my words in his mouth. He will tell them everything I command him." The Moses-like prophet is distinguished by three marks: divine appointment, divine words placed in his mouth, divine authority backed by judgment. These marks are perfectly met only in Jesus.'),
                ('18:20–22', 'MacArthur: The test for a true prophet is simple: if what the prophet says does not happen, God did not send him. The Deuteronomic test is empirical — false prophecy is self-refuting over time. The church\'s test of teachers requires the same long perspective: does their ministry prove out over time?'),
            ],
            'craigie': [
                ('18:15–22', 'Craigie: Against the background of prohibited occult channels (vv.9–13), God provides the authorised channel: the prophet who speaks God\'s words. The contrast is complete: the occultist attempts to access divine knowledge illegitimately; the true prophet receives divine words as a gift and a burden.'),
            ],
            'tigay': [
                ('18:15', 'Tigay: "Prophet like me" primarily referred, in its original context, to a succession of prophets after Moses. The singular "prophet" may be a collective singular. Only in later Jewish and early Christian interpretation was it read as pointing to a single eschatological figure. Both readings are consistent with the text\'s ambiguity.'),
            ],
        },
        {
            'header': 'Verses 9–22 — Forbidden Practices; The Prophet Like Moses',
            'verses': verse_range(9, 22),
            'heb': [
                ('qōsēm qĕsāmîm', 'qosem qesamim', 'one who practises divination',
                 'The ten prohibited occult practices cover every method of accessing spiritual power outside of authorised divine channels. Their common feature: all attempt to gain knowledge or power from spiritual sources other than God.'),
                ('nābîʾ kāmōnî', 'navi kamoni', 'a prophet like me',
                 'The self-reference is the key to the passage messianic significance. The prophet like Moses will be from Israel, receive God\'s words directly, and must be obeyed. The NT\'s identification of Jesus as this prophet is the most direct messianic application of Deuteronomy.'),
            ],
            'ctx': 'Having established the Levitical priesthood\'s material support, Moses turns to Israel\'s spiritual infrastructure: the prohibition of all occult access to divine knowledge (vv.9–14) and the promise of the true prophet (vv.15–22). The contrast is complete: Israel has authorised channels of divine communication (priest and prophet); it must not resort to illegitimate ones. The ten forbidden practices are followed by the one authorised alternative: a prophet like Moses, whose words come directly from God.',
            'cross': [
                ('Acts 3:22', '"The Lord your God will raise up for you a prophet like me from among your own people; you must listen to everything he tells you." Peter applies this directly to Jesus.'),
                ('Matt 17:5', '"This is my Son, whom I love; with him I am well pleased. Listen to him!" The divine command at the Transfiguration echoes the Deuteronomy 18 command to "listen to him."'),
            ],
            'mac': [
                ('18:9–13', 'MacArthur: The command to be "blameless" (tamim) before God concludes the list of prohibited practices. Wholeness and integrity before God is the positive counterpart to the prohibition of occult fragmentation. The covenant people do not need to split their allegiance between God and spiritual power sources -- they have the only source worth having.'),
                ('18:15-19', 'MacArthur: The Moses-like prophet is the OT\'s greatest messianic text. God said he would put his words in the prophet\'s mouth and he would tell them everything commanded. Three marks: divine appointment, divine words, divine authority. Jesus meets all three -- and exceeds Moses in that he is not merely the recipient of God\'s words but is himself the Word of God (John 1:1).'),
                ('18:20-22', 'MacArthur: "If what a prophet proclaims in the name of the LORD does not take place or come true, that is a message the LORD has not spoken." The empirical test for prophecy requires patience -- false prophecy is self-refuting over time, but may appear successful temporarily. The church must apply the same long-view assessment to teachers and prophets.'),
            ],
        },
    ],
})

print("DEUT-3 complete: chapters 12–18 built.")
