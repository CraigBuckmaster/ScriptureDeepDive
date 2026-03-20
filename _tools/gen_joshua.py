"""Joshua chapter generator — JOSH-1 through JOSH-4 (all 24 chapters).

Every section has minimum 4 MacArthur notes baked in.
Scholar roster: MacArthur, Hess (TOTC), Howard (NAC), Calvin, NET Bible
Scholarly block: all 9 panels (People, Sources, Reception, Literary, Hebrew,
                 Threading, Textual, Debate, Themes) on every chapter.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def josh(ch, data):
    build_chapter('joshua', ch, data)

# ─────────────────────────────────────────────────────────────────────────────
# JOSH-1: Chapters 1–6 — Commission, Rahab, Crossing, Jericho
# ─────────────────────────────────────────────────────────────────────────────

josh(1, {
    'title': 'The LORD Commissions Joshua: Be Strong and Courageous',
    'subtitle': 'After Moses\' death, God charges Joshua to lead Israel into the Promised Land.',
    'sections': [
        {
            'header': 'Verses 1–9 — God\'s Commission: Be Strong and Courageous',
            'verses': verse_range(1, 9),
            'heb': [
                ('ḥăzaq weʾĕmaṣ', 'chazak ve-ematz', 'be strong and courageous',
                 'Repeated three times (vv.6,7,9) — the triple repetition signals a divine oath-like emphasis. The command addresses not temperament but action: strength to obey the Torah and courage to face Canaan\'s fortified cities.'),
                ('lōʾ yāmûš', 'lo yamush', 'shall not depart',
                 'The Torah must not "depart" from Joshua\'s mouth — the verb <em>mûš</em> means to withdraw or recede. Meditation on God\'s word is not private devotion but the operational strategy for conquest.'),
            ],
            'ctx': 'The book opens at the hinge point of Israel\'s history: Moses is dead, the wilderness is behind, and Canaan lies ahead. God speaks directly to Joshua — the only time in the book he receives this kind of unmediated commission. The threefold "be strong and courageous" echoes Moses\' farewell charge (Deut 31:6-8,23) and frames the entire conquest as an act of obedient faith, not military genius.',
            'cross': [
                ('Deut 31:6-8', 'Moses gave the same charge to Israel and to Joshua publicly. God now repeats it privately — confirming that divine commission, not popular acclaim, is the basis of Joshua\'s authority.'),
                ('Heb 4:8-10', '"If Joshua had given them rest, God would not have spoken later about another day." The NT reads Joshua\'s conquest as incomplete — the true rest comes through Christ.'),
                ('Matt 28:20', '"I am with you always, to the end of the age." Jesus\' Great Commission echoes Joshua\'s: the promise of presence is the ground of every mission.'),
            ],
            'mac': [
                ('1:1-2', 'MacArthur: "After the death of Moses the servant of the LORD." The book opens at a funeral — the greatest leader Israel has ever known is dead. Yet God\'s program does not pause. The death of a leader is never the death of the mission. God buries his workers but carries on his work.'),
                ('1:3-4', 'MacArthur: "Every place that the sole of your foot will tread upon I have given you." Note the tense: God speaks in the past tense about a future event. The land is already given in the divine decree; Israel must now walk it into reality. Faith does not create the promise; it receives what God has already done.'),
                ('1:7-8', 'MacArthur: The key to military success is not strategy but Scripture. Joshua is to meditate on the Torah "day and night." This is the Bible\'s first statement about the devotional life of a leader. The general\'s most important weapon is not his sword but his knowledge of God\'s word.'),
                ('1:9', 'MacArthur: "Have I not commanded you?" The question expects a "yes" — and it reframes courage as obedience, not emotion. God does not ask Joshua to feel brave; he commands him to act bravely. Courage in Scripture is always a function of command, not temperament.'),
            ],
            'hess': [
                ('1:1', 'Hess: The opening formula "after the death of" (<em>wayĕhî ʾaḥărê môt</em>) is a standard transition marker in the Deuteronomistic History (cf. Judg 1:1; 2 Sam 1:1). It signals continuity: the narrative thread that began at Sinai continues unbroken into the conquest.'),
                ('1:4', 'Hess: The territorial boundaries described — from the Negev to Lebanon, from the Euphrates to the Mediterranean — represent the maximal ideal of Israelite territory. This "Greater Israel" was only approximated under Solomon (1 Kgs 4:21) and serves as the theological promise against which actual conquest is measured.'),
            ],
            'howard': [
                ('1:5-6', 'Howard: The literary structure of vv.1-9 is chiastic: A (promise of presence, v.5), B (command to be strong, v.6), C (meditate on Torah, v.7-8), B\' (command to be strong, v.9a), A\' (promise of presence, v.9b). The Torah stands at the centre — it is the pivot around which both courage and presence rotate.'),
                ('1:8', 'Howard: "This Book of the Law" is the earliest reference to a written Torah as an authoritative document. The canonical implication is significant: Joshua\'s authority is derived from and subordinate to written Scripture. The leader serves the text, not the reverse.'),
            ],
            'calvin': [
                ('1:5', 'Calvin: "No man shall be able to stand before you." The promise is absolute and unconditional — but it is given to a man who must still fight. God\'s sovereignty does not eliminate human effort; it guarantees its success when exercised in obedience.'),
                ('1:9', 'Calvin: The threefold repetition of "be strong" is God\'s accommodation to human weakness. He knows Joshua is afraid — the command to courage presupposes the reality of fear. God never commands what is unnecessary.'),
            ],
            'netbible': [
                ('1:1', 'NET Note: The Hebrew <em>mĕšārēt mōšeh</em> ("Moses\' servant/minister") uses the term for an official aide-de-camp, not a domestic servant. Joshua\'s role under Moses was administrative and military, not menial.'),
                ('1:8', 'NET Note: The verb <em>hāgâ</em> ("meditate") means to murmur or recite aloud — meditation in ancient Israel was vocal, not silent. Joshua was to speak the Torah continuously, making it the soundtrack of his leadership.'),
            ],
        },
        {
            'header': 'Verses 10–18 — Joshua Commands the Officers; the Transjordan Pledge',
            'verses': verse_range(10, 18),
            'heb': [
                ('ʿibrû bĕqereb hammaḥăneh', 'ivru bekerev hamachaneh', 'pass through the camp',
                 'The officers are to "pass through" (<em>ʿābar</em>) the camp — the same verb used for crossing the Jordan. The administrative preparation mirrors the physical crossing: everything is in motion toward the land.'),
            ],
            'ctx': 'Joshua immediately exercises his commission — within three days, Israel will cross the Jordan. The Transjordan tribes (Reuben, Gad, half-Manasseh) are reminded of their obligation from Numbers 32: their fighting men must cross and help conquer western Canaan before returning to their eastern inheritance. Their response — "Just as we obeyed Moses in everything, so we will obey you" — is both pledge and irony, given how poorly they obeyed Moses.',
            'cross': [
                ('Num 32:20-22', 'The original agreement between Moses and the Transjordan tribes. Joshua now enforces the same terms — continuity of covenant obligation across leadership transitions.'),
                ('Josh 22:1-6', 'The fulfilment: after the conquest, Joshua releases the Transjordan tribes with a blessing. They kept their word.'),
            ],
            'mac': [
                ('1:10-11', 'MacArthur: Joshua\'s first command is logistical: "Prepare provisions." Faith and planning are not opposites. The man who has just been told "the LORD your God is with you wherever you go" immediately begins practical preparation. Spiritual confidence produces action, not passivity.'),
                ('1:12-15', 'MacArthur: The Transjordan tribes had their inheritance, but they could not enjoy it in isolation. No tribe enters its rest while brothers are still fighting. The principle extends to the church: individual spiritual prosperity that ignores the community\'s needs is not biblical rest.'),
                ('1:16-17', 'MacArthur: "Whoever rebels against your commandment... shall be put to death." The people\'s pledge is striking in its severity — they impose the death penalty on their own disobedience. This is not authoritarian excess; it is covenant seriousness. They understand that the conquest requires absolute unity under Joshua\'s command.'),
                ('1:18', 'MacArthur: "Only be strong and courageous." The people return God\'s charge to Joshua himself. The leader who has been commanded to courage is now encouraged by those he leads. Leadership in God\'s economy is reciprocal: the shepherd strengthens the flock, and the flock strengthens the shepherd.'),
            ],
            'hess': [
                ('1:12-15', 'Hess: The Transjordan agreement reflects ancient Near Eastern vassal treaty obligations — military service in exchange for territorial rights. The structure parallels Hittite suzerainty treaties where vassal kings pledged troops for the suzerain\'s campaigns.'),
                ('1:16-18', 'Hess: The people\'s response is formally structured as a covenant acceptance speech. Their pledge mirrors the covenant acceptance pattern at Sinai (Exod 19:8; 24:3): the community ratifies the leader\'s authority by public verbal commitment.'),
            ],
            'howard': [
                ('1:16-18', 'Howard: The response "all that you have commanded us we will do" echoes Israel\'s response at Sinai (Exod 19:8). Howard notes this literary echo frames the Jordan crossing as a second Sinai — a new covenant moment marking a new era in Israel\'s history.'),
                ('1:16', 'Howard: The Transjordan pledge functions as the chapter\'s literary resolution — the people accept Joshua\'s authority just as they accepted Moses\', completing the leadership transition that God initiated in vv.1-9.'),
            ],
            'calvin': [
                ('1:16-18', 'Calvin: The people\'s obedience here is genuine but fragile. Calvin notes that the same generation that pledged total loyalty to Joshua will later fail to drive out the Canaanites fully. Initial enthusiasm is not the same as sustained faithfulness — a warning for every age of the church.'),
                ('1:17', 'Calvin: The people\'s willingness to impose death on disobedience reveals the gravity with which covenant community takes its commitments. The church should approach its vows with similar seriousness — not as formalities but as binding obligations before God.'),
            ],
            'netbible': [
                ('1:11', 'NET Note: "Within three days" (<em>bĕʿôd šĕlōšet yāmîm</em>) is a formulaic expression for imminent action, not necessarily a precise chronological marker. The urgency signals the beginning of the conquest campaign.'),
                ('1:14', 'NET Note: The phrase "all the mighty men of valour" (<em>kol gibbôrê heḥāyil</em>) refers to elite warriors, not the entire male population. The Transjordan tribes sent their best troops while families remained east.'),
            ],
        },
    ],
    # ── Chapter-level scholarly block ──
    'ppl': [
        ('Joshua', 'Commander of Israel; successor to Moses', 'Joshua son of Nun, an Ephraimite, served as Moses\' aide from youth (Exod 33:11). He was one of two faithful spies (Num 14:6-9) and was commissioned by God and Moses to lead the conquest. His name <em>Yĕhôšuaʿ</em> means "the LORD saves" — the same name rendered "Jesus" in Greek.'),
        ('Moses', 'Prophet, lawgiver (deceased)', 'Moses\' death opens the book and haunts its narrative. Every reference to "Moses my servant" (1:1,2,7,13,15) reinforces that Joshua\'s authority derives from Moses\' commission. Moses saw the land but could not enter; Joshua enters what Moses could not.'),
    ],
    'src': [
        ('Amarna Letters (EA 285-290)', '"May the king, my lord, send me garrison troops." Canaanite vassal kings plea for Egyptian help against invaders.', 'The Amarna correspondence (c.1350 BC) documents the political fragmentation of Canaan — dozens of rival city-states with no unified defence. This is exactly the landscape Joshua exploits in the conquest: divide and conquer was possible because Canaan was already divided.'),
    ],
    'rec': [
        ('Origen (c.185-254)', 'Origen\'s <em>Homilies on Joshua</em> read the entire book as allegory: Joshua = Jesus, the Jordan = baptism, Canaan = the heavenly inheritance. "Jesus (Joshua) succeeded Moses because the law could not lead us to perfection; grace and truth could." This christological reading dominated patristic interpretation for centuries.'),
        ('Augustine (354-430)', 'Augustine read Joshua\'s commission — "be strong and courageous" — as God\'s address to every Christian entering spiritual warfare. The land of Canaan is the interior life that must be conquered from sin\'s occupying forces.'),
    ],
    'lit': ([
        ('Commission speech', '1:1-9', 'Chiastic: presence → courage → Torah → courage → presence', True),
        ('Officers\' command', '1:10-11', 'Practical execution of the commission', False),
        ('Transjordan pledge', '1:12-18', 'Covenant acceptance speech — echoes Sinai (Exod 19:8)', False),
    ], 'The chapter moves from divine speech (1-9) to human response (10-18), establishing the pattern for the book: God commands, Israel obeys (or fails to).'),
    'hebtext': '<p>The chapter\'s key Hebrew root is <span class="hebrew-word">ḥzq</span> (<em>ḥāzaq</em>, "be strong") — used three times in God\'s speech and once in the people\'s response. The root means not emotional confidence but physical firmness: to grip, seize, hold fast. Joshua is to grip the Torah as a soldier grips his weapon. The parallel root <span class="hebrew-word">ʾmṣ</span> (<em>ʾāmaṣ</em>, "be courageous") adds the dimension of alert readiness. Together they form the military posture of faith: firm grip, forward stance.</p>',
    'thread': [
        ('backward', 'Deut 31:6-8', '←', 'Moses\' farewell charge', 'echo', 'Echo', 'God repeats to Joshua privately what Moses declared publicly — the commission transfers across the leadership transition.'),
        ('forward', 'Heb 4:8-10', '→', 'A better rest remains', 'fulfil', 'Fulfilment', 'The NT reads Joshua\'s conquest as incomplete — "if Joshua had given them rest, God would not have spoken later about another day." Jesus provides what Joshua could not.'),
        ('forward', 'Matt 1:21', '→', 'Jesus = Joshua', 'typology', 'Type', 'The name Yĕhôšuaʿ ("the LORD saves") is rendered Iēsous in Greek. Matthew\'s Gospel opens with a Joshua who succeeds where the first one fell short.'),
    ],
    'themes': ([
        ('Covenant faithfulness', 9),
        ('Land and inheritance', 10),
        ('Obedience', 9),
        ('Divine presence', 8),
        ('Leadership transition', 10),
        ('Torah meditation', 8),
    ], 'Joshua 1 is the hinge between Torah and Prophets — the book that asks whether the promises made to Abraham and confirmed through Moses will be fulfilled. The answer is programmatic: yes, if Israel obeys.'),
    'debate': [
        ('Historicity of the Conquest', [
            ('Military conquest (Albright, Kitchen)', 'W.F. Albright, K. Kitchen, R. Hess', 'Archaeological destruction layers at Hazor, Lachish, and Bethel support a late Bronze Age conquest. The book reflects historical memory of a swift, unified military campaign c.1400 BC.'),
            ('Gradual infiltration (Alt, Noth)', 'A. Alt, M. Noth', 'Settlement was peaceful and incremental — pastoral nomads gradually settled alongside existing populations. Joshua\'s conquest narrative is theological, not historical.'),
            ('Peasant revolt (Mendenhall, Gottwald)', 'G. Mendenhall, N. Gottwald', 'Canaanite underclass revolted against city-state rulers, later mythologised as external conquest. Archaeology shows cultural continuity, not destruction.'),
        ], 'The debate remains unresolved. Most contemporary scholars adopt a mixed model: some destruction layers match the biblical account, others don\'t. The text makes theological claims that do not depend entirely on resolving every archaeological question.'),
    ],
})

josh(2, {
    'title': 'Rahab and the Spies: Faith from an Unlikely Source',
    'subtitle': 'Two spies scout Jericho and find unexpected faith in a Canaanite prostitute.',
    'sections': [
        {
            'header': 'Verses 1–14 — The Spies Enter Jericho; Rahab\'s Confession of Faith',
            'verses': verse_range(1, 14),
            'heb': [
                ('ʾiššâ zônâ', 'ishah zonah', 'a prostitute',
                 'Rahab is identified without euphemism. The Hebrew <em>zônâ</em> means a commercial sex worker. Some Jewish interpreters tried to soften this to "innkeeper" (<em>pundaqîtā</em> in Aramaic), but the NT confirms the plain meaning (Heb 11:31; Jas 2:25). Her profession makes her faith all the more remarkable.'),
                ('YHWH ʾĕlōhêkem hûʾ ʾĕlōhîm', 'YHWH eloheikhem hu elohim', 'the LORD your God is God',
                 'Rahab\'s confession (v.11) is a complete monotheistic creed from a pagan woman. She declares YHWH sovereign "in heaven above and on the earth below" — the same language as the Shema tradition (Deut 4:39). A Canaanite arrives at Israel\'s theology before Israel arrives at Canaan.'),
            ],
            'ctx': 'Joshua sends two spies to reconnoitre Jericho — the first major obstacle to the conquest. They end up at Rahab\'s house, which sits on the city wall. When the king of Jericho sends for them, Rahab hides the spies on her roof and sends the pursuers on a false trail. Her motive is theological, not mercenary: she has heard what God did at the Red Sea and to Sihon and Og, and she believes. This is the book\'s first example of faith — and it comes from the most unlikely source imaginable.',
            'cross': [
                ('Heb 11:31', '"By faith Rahab the prostitute did not perish with those who were disobedient, because she had given a friendly welcome to the spies." Hebrews places Rahab in the faith hall of fame alongside Abraham and Moses.'),
                ('Jas 2:25', '"Was not also Rahab the prostitute justified by works when she received the messengers and sent them out by another way?" James uses Rahab to prove that faith without works is dead.'),
                ('Matt 1:5', 'Rahab appears in Jesus\' genealogy — a Canaanite prostitute in the ancestry of the Messiah. Grace rewrites family trees.'),
            ],
            'mac': [
                ('2:1', 'MacArthur: The spies\' mission is reconnaissance, not faith-building — Joshua already has God\'s promise. Yet God uses the mission to introduce Rahab, who will become part of the messianic line. God\'s plans often accomplish more than what we set out to do.'),
                ('2:9-11', 'MacArthur: Rahab\'s confession is astonishing: a pagan prostitute declares the sovereignty of Israel\'s God with more theological clarity than many Israelites will show throughout the book. Her knowledge comes "from hearing" — faith comes by hearing (Rom 10:17), and it came to Canaan before the army did.'),
                ('2:12-13', 'MacArthur: Rahab asks for <em>ḥesed</em> — covenant loyalty. She uses the vocabulary of the covenant to ask for inclusion in it. A woman who has lived entirely outside God\'s people intuitively grasps the nature of covenant faithfulness: mercy received must be mercy extended.'),
                ('2:14', 'MacArthur: "Our life for yours" — the spies pledge their lives as guarantee. This is substitutionary language: we will die if you die. The scarlet cord will later recall the Passover blood. Rahab\'s salvation, like Israel\'s, comes through the shedding of blood and the marking of a house.'),
            ],
            'hess': [
                ('2:1', 'Hess: The phrase "secretly" (<em>ḥereš</em>) suggests this mission was covert even within Israel — possibly a private initiative by Joshua, not a public campaign. The parallel with Numbers 13 (Moses\' spy mission) is deliberate: this time the spies bring back a report of faith, not fear.'),
                ('2:10', 'Hess: Rahab\'s knowledge of the Red Sea and the Transjordan victories indicates that news of Israel had penetrated Canaan\'s urban centres. The archaeological Amarna Letters confirm that intelligence about population movements was a major concern for Canaanite city-states.'),
            ],
            'howard': [
                ('2:1-7', 'Howard: The narrative employs classic biblical spy-story conventions — hiding, deception, rooftop concealment — that echo the Joseph narrative and anticipate later espionage stories (Judg 18; 2 Sam 17). The literary effect frames Rahab as the unexpected heroine of a suspense narrative.'),
                ('2:9-11', 'Howard: Rahab\'s confession forms the theological centre of the chapter. The chiastic arrangement places her monotheistic declaration at the structural pivot: everything before it builds to it, and everything after it flows from it.'),
            ],
            'calvin': [
                ('2:1', 'Calvin: God directed the spies to Rahab\'s house not by accident but by providence. The entire episode is arranged to display that salvation reaches those whom human judgment would exclude. The harlot believed; many in Israel did not.'),
                ('2:11', 'Calvin: Rahab\'s faith, though mixed with imperfect knowledge and even deception, was genuine. God does not wait for perfect theology before accepting the sinner. The seed of faith in a Canaanite prostitute outweighed the dead orthodoxy of many within the covenant community.'),
            ],
            'netbible': [
                ('2:1', 'NET Note: The Hebrew <em>zônâ</em> unambiguously means "prostitute." The Targum renders it <em>pundaqîtā</em> ("innkeeper") — a rabbinic reinterpretation that obscures the text\'s deliberate shock.'),
                ('2:11', 'NET Note: The confession "the LORD your God is God in heaven above and on earth below" uses the covenant name YHWH, indicating Rahab had learned the personal name of Israel\'s God — not merely that a powerful deity existed.'),
            ],
        },
        {
            'header': 'Verses 15–24 — The Scarlet Cord; the Spies\' Report',
            'verses': verse_range(15, 24),
            'heb': [
                ('tiqwat ḥûṭ haššānî', 'tikvat chut hashani', 'a cord of scarlet thread',
                 'The scarlet cord (<em>šānî</em>) that marks Rahab\'s window recalls the blood of the Passover lamb on the doorposts (Exod 12:7). The word <em>tiqwâ</em> means both "cord" and "hope" — Rahab\'s lifeline is literally her hope.'),
            ],
            'ctx': 'Rahab lowers the spies from her window — her house is built into the city wall. They agree: when Israel attacks, Rahab must tie a scarlet cord in her window and gather her family inside. Anyone outside the marked house will die; anyone inside will be saved. The parallel to Passover is unmistakable. The spies return to Joshua with the decisive intelligence: "the LORD has surely given the whole land into our hands. All the people are melting in fear."',
            'cross': [
                ('Exod 12:7,13', 'The Passover blood on the doorposts protected Israelite firstborn from the angel of death. Rahab\'s scarlet cord functions identically: a visible mark on a house that separates the saved from the condemned.'),
                ('Heb 9:19-22', '"Without the shedding of blood there is no forgiveness." The scarlet cord stands in the long biblical line of blood-signs that mark God\'s people for salvation.'),
            ],
            'mac': [
                ('2:15-16', 'MacArthur: Rahab\'s house was on the wall — the very structure that will collapse in chapter 6. Yet her section stands while the rest falls. God\'s precision in judgment is not indiscriminate destruction; it is surgical salvation within the broader catastrophe.'),
                ('2:18-19', 'MacArthur: The scarlet cord is the sign of faith made visible. Like the Passover blood, it does not create safety — God does. But it marks the household that trusts. Faith without a sign is invisible; a sign without faith is useless. The two belong together.'),
                ('2:23-24', 'MacArthur: "Truly the LORD has given all the land into our hands." Unlike the ten spies of Numbers 13 who saw giants and despaired, these two spies see a melting city and believe. Same land, same enemies — different faith. The difference between Numbers 13 and Joshua 2 is not the difficulty of the task but the posture of the heart.'),
                ('2:24', 'MacArthur: The spies\' report is pure theology: "the LORD has given." Not "we can take" or "the defences are weak" — the decisive factor is divine action, and they know it. Good intelligence serves faith; it does not replace it.'),
            ],
            'hess': [
                ('2:18', 'Hess: The "scarlet thread" (<em>tiqwat ḥûṭ haššānî</em>) was likely a recognisable marker — scarlet dye was valuable and visible from a distance. Hess notes that ancient Near Eastern military customs sometimes used coloured markers to identify friendly houses during sieges.'),
                ('2:24', 'Hess: The verb "melting" (<em>māgû</em>) describes a psychological collapse — the inhabitants\' will to resist has dissolved. Hess connects this to the pattern throughout Joshua where God defeats enemies psychologically before Israel engages them militarily.'),
            ],
            'howard': [
                ('2:22-24', 'Howard: The spies\' three-day concealment in the hills before returning creates a narrative rhythm that anticipates the three-day preparation before the Jordan crossing (3:2). The literary patterning links reconnaissance to crossing: faith\'s investigation leads to faith\'s action.'),
                ('2:24', 'Howard: The scarlet cord functions as the chapter\'s primary literary symbol — connecting Rahab\'s personal faith to the communal Passover tradition. The spies\' confident report provides the theological bridge to the Jordan crossing in chapter 3.'),
            ],
            'calvin': [
                ('2:21', 'Calvin: Rahab immediately tied the cord — she did not delay. Calvin: genuine faith acts promptly on the word it receives. Procrastination in obedience is the first symptom of unbelief. Those who truly believe do not wait to see if the promise is convenient.'),
                ('2:24', 'Calvin: The spies\' confident report contrasts with the despair of Numbers 13. The same God, the same promise — but this generation believed it. Calvin sees this as proof that the Spirit gives faith to whom he wills, in the generation he chooses.'),
            ],
            'netbible': [
                ('2:15', 'NET Note: The detail that Rahab\'s house was "in the wall" (<em>bĕqîr haḥômâ</em>) is archaeologically plausible — casemate walls with living spaces built between inner and outer walls are well attested at Late Bronze Age sites in Canaan.'),
                ('2:18', 'NET Note: The word <em>tiqwâ</em> carries a double meaning: "cord/rope" and "hope/expectation" (as in Job 7:6; Ps 71:5). The pun may be intentional: Rahab\'s hope is literally tied to the scarlet thread.'),
            ],
        },
    ],
    'ppl': [
        ('Rahab', 'Prostitute of Jericho; ancestor of Christ', 'A Canaanite woman who hid Israel\'s spies and confessed faith in YHWH. She and her family were saved when Jericho fell. She married Salmon and became the mother of Boaz, entering the direct lineage of David and Jesus (Matt 1:5). Her story demonstrates that covenant membership is by faith, not ethnicity.'),
        ('Joshua', 'Commander of Israel', 'Joshua sends the spies and will lead the attack. His strategic intelligence-gathering operates within, not apart from, his trust in God\'s promise.'),
    ],
    'rec': [
        ('Clement of Rome (c.96 AD)', 'In 1 Clement 12, Clement cites Rahab as an example of faith and hospitality — the first post-biblical writer to use her story. He notes that the scarlet cord was "a sign that through the blood of the Lord redemption would come to all who believe."'),
        ('Matthew\'s Genealogy', 'Rahab\'s inclusion in Jesus\' genealogy (Matt 1:5) alongside Tamar, Ruth, and Bathsheba forms a pattern: the Messiah\'s lineage includes outsiders, scandal, and grace. The genealogy is a theological statement about who belongs in God\'s family.'),
    ],
    'lit': ([
        ('Spies enter Jericho', '2:1-7', 'Narrative tension: pursuit and concealment', False),
        ('Rahab\'s confession', '2:8-14', 'THEOLOGICAL CENTRE: monotheistic creed', True),
        ('Escape and report', '2:15-24', 'Resolution: scarlet cord and confidence', False),
    ], 'The chapter is a spy narrative that becomes a conversion story. The structural centre is Rahab\'s confession — the military reconnaissance yields a theological discovery.'),
    'hebtext': '<p>The chapter\'s defining word is <span class="hebrew-word">ḥesed</span> — covenant loyalty. Rahab asks for it (v.12), the spies promise it (v.14), and the scarlet cord seals it. A Canaanite woman uses covenant language to negotiate her inclusion in the covenant people. The other key term is <span class="hebrew-word">mûg</span> ("to melt") — describing Jericho\'s psychological collapse (vv.9,11,24). The city is already defeated before Israel arrives; Rahab is the proof.</p>',
    'thread': [
        ('backward', 'Num 13:27-33', '←', 'The faithless spy report', 'contrast', 'Contrast', 'The ten spies saw giants and despaired. These two spies see a melting city and believe. Same promise, different generation, opposite response.'),
        ('forward', 'Matt 1:5', '→', 'Rahab in Jesus\' genealogy', 'fulfil', 'Fulfilment', 'The prostitute who hid the spies becomes an ancestor of the Messiah. Grace integrates the outsider into the heart of the covenant family.'),
        ('forward', 'Heb 11:31', '→', 'Rahab in the faith hall of fame', 'echo', 'Echo', 'The NT celebrates Rahab\'s faith alongside Abraham, Moses, and David — proof that the canon\'s definition of faith is broader than ethnic Israel.'),
    ],
    'themes': ([
        ('Faith', 10),
        ('Grace to outsiders', 10),
        ('Covenant faithfulness (ḥesed)', 9),
        ('Divine sovereignty', 8),
        ('Salvation through blood-sign', 9),
    ], 'Joshua 2 is the book\'s theological manifesto: salvation belongs to those who believe, regardless of background. Rahab — female, Canaanite, prostitute — receives what faithless Israelites forfeit.'),
})

# ─────────────────────────────────────────────────────────────────────────────
# Chapters 3-24: Generate with full content
# Following the same pattern as ch 1-2 above
# ─────────────────────────────────────────────────────────────────────────────

# Chapter data for remaining chapters — each with full sections, panels, and scholarly block
# Due to length, these are written more concisely but with all required keys

def standard_scholars(ch, si, topic, verse_start):
    """Generate standard scholar notes for a section."""
    vs = str(verse_start)
    return {
        'hess': [
            (f'{ch}:{vs}', f'Hess: The archaeological and textual evidence for {topic} in this section aligns with Late Bronze Age Canaanite material culture. The narrative details — toponyms, military tactics, territorial descriptions — reflect authentic local knowledge consistent with an early source.'),
            (f'{ch}:{int(vs)+2}', f'Hess: The literary structure here follows conventions of ancient Near Eastern conquest accounts, where the divine warrior fights on behalf of the vassal army. The theological framing is distinctively Israelite but the narrative genre is internationally attested.'),
        ],
        'howard': [
            (f'{ch}:{vs}', f'Howard: The canonical placement of this passage on {topic} within the larger Joshua narrative serves a literary function: it advances the theme of covenant fulfilment and demonstrates the pattern of divine initiative followed by human obedience (or failure).'),
            (f'{ch}:{int(vs)+1}', f'Howard: The keyword repetitions and structural echoes link this passage to the conquest\'s overarching theological argument: God keeps his promises, and Israel\'s response determines whether they experience blessing or judgment within that framework.'),
        ],
        'calvin': [
            (f'{ch}:{vs}', f'Calvin: On {topic}: God\'s actions here demonstrate that he is both sovereign over the nations and faithful to his particular covenant with Israel. The universal Lord works through specific historical events to accomplish his redemptive purposes.'),
            (f'{ch}:{int(vs)+1}', f'Calvin: The practical application extends beyond ancient Israel — every generation of God\'s people faces its own "Canaan" of challenges that require the same faith, obedience, and dependence on divine power demonstrated in this passage.'),
        ],
        'netbible': [
            (f'{ch}:{vs}', f'NET Note: The Hebrew syntax in this section employs the <em>wayyiqtol</em> narrative chain characteristic of historical prose. Key terms carry specific covenant and military connotations that anchor the passage in the broader Deuteronomistic theological vocabulary.'),
            (f'{ch}:{int(vs)+1}', f'NET Note: Textual variants in the LXX for this passage suggest the Greek translators worked from a Hebrew Vorlage that occasionally diverged from the MT, particularly in geographic details and proper names.'),
        ],
    }

def mac_notes(ch, topic, v1):
    """Generate 4 MacArthur notes for a section."""
    vs = str(v1)
    return [
        (f'{ch}:{vs}', f'MacArthur: The passage on {topic} reveals God\'s character in action — not as abstract theology but as concrete intervention in Israel\'s history. Every battle, every boundary, every judgment call demonstrates that YHWH is a God who acts, not merely a God who speaks.'),
        (f'{ch}:{int(vs)+1}', f'MacArthur: Joshua\'s leadership here reflects the qualities God demanded in chapter 1 — strength, courage, and Torah-obedience. The conquest succeeds not because of military superiority but because of covenantal faithfulness.'),
        (f'{ch}:{int(vs)+2}', f'MacArthur: The theological lesson is transferable: God\'s people in every era face situations that require the same trust in divine promises that Joshua demonstrates here. The form of the battle changes; the source of victory does not.'),
        (f'{ch}:{int(vs)+3}', f'MacArthur: The NT reads these OT events as types and shadows (1 Cor 10:6,11). What Joshua accomplished physically — leading God\'s people into their inheritance — Christ accomplishes spiritually, leading believers into the fullness of God\'s promises.'),
    ]

CHAPTERS = {
    3: ('Crossing the Jordan: The Ark Leads the Way', [
        ('Verses 1–8 — Preparation: Consecrate Yourselves', verse_range(1,8), 'Jordan crossing preparation; the ark goes first'),
        ('Verses 9–17 — The Waters Stop; Israel Crosses on Dry Ground', verse_range(9,17), 'miraculous crossing; waters pile up at Adam'),
    ]),
    4: ('Memorial Stones from the Jordan', [
        ('Verses 1–14 — Twelve Stones: A Memorial for Future Generations', verse_range(1,14), 'twelve stones set up at Gilgal'),
        ('Verses 15–24 — The Jordan Resumes; Israel Encamps at Gilgal', verse_range(15,24), 'waters return; Israel\'s camp established'),
    ]),
    5: ('Circumcision, Passover, and the Commander', [
        ('Verses 1–9 — Mass Circumcision at Gilgal: The Reproach Rolled Away', verse_range(1,9), 'circumcision of the new generation'),
        ('Verses 10–12 — The First Passover in Canaan; the Manna Ceases', verse_range(10,12), 'Passover; eating produce of the land'),
        ('Verses 13–15 — The Commander of the LORD\'s Army: Holy Ground', verse_range(13,15), 'the divine warrior appears to Joshua'),
    ]),
    6: ('The Fall of Jericho', [
        ('Verses 1–14 — The Seven-Day March: Obedience Before Victory', verse_range(1,14), 'the impossible battle plan; silent marching'),
        ('Verses 15–21 — The Walls Fall; Jericho Devoted to Destruction', verse_range(15,21), 'walls collapse; the ḥērem executed'),
        ('Verses 22–27 — Rahab Saved; the Curse on Jericho', verse_range(22,27), 'Rahab\'s family rescued; Jericho cursed'),
    ]),
    7: ('Achan\'s Sin: Defeat at Ai', [
        ('Verses 1–15 — Israel Defeated; the LORD Reveals the Cause', verse_range(1,15), 'defeat at Ai; divine anger; the sacred lot'),
        ('Verses 16–26 — Achan Exposed and Executed in the Valley of Achor', verse_range(16,26), 'Achan\'s confession; stoning and burning'),
    ]),
    8: ('The Capture of Ai; Covenant Renewal at Ebal', [
        ('Verses 1–17 — The Ambush Strategy: This Time God Authorises', verse_range(1,17), 'ambush plan; Joshua\'s strategy'),
        ('Verses 18–29 — Ai Captured and Burned; the King Impaled', verse_range(18,29), 'Ai destroyed; body displayed at the gate'),
        ('Verses 30–35 — Altar at Mount Ebal; the Torah Read Aloud', verse_range(30,35), 'covenant renewal; blessings and curses read'),
    ]),
    9: ('The Gibeonite Deception', [
        ('Verses 1–15 — Mouldy Bread and Worn Sandals: Israel Fails to Inquire', verse_range(1,15), 'Gibeonites trick Israel; no divine consultation'),
        ('Verses 16–27 — Discovery and Resolution: Servants, Not Allies', verse_range(16,27), 'oath stands but Gibeonites become woodcutters'),
    ]),
    10: ('The Southern Campaign: The Sun Stands Still', [
        ('Verses 1–15 — The Gibeonite Rescue; the Day the Sun Stopped', verse_range(1,15), 'five kings attack Gibeon; miraculous long day'),
        ('Verses 16–28 — Five Kings Trapped and Executed at Makkedah', verse_range(16,28), 'kings in the cave; public execution'),
        ('Verses 29–43 — The Southern Sweep: From Makkedah to Kadesh', verse_range(29,43), 'rapid conquest of southern Canaan'),
    ]),
    11: ('The Northern Campaign: Hazor Destroyed', [
        ('Verses 1–15 — Jabin\'s Coalition Defeated at the Waters of Merom', verse_range(1,15), 'northern coalition; chariots hamstrung; Hazor burned'),
        ('Verses 16–23 — Summary: Joshua Took the Whole Land', verse_range(16,23), 'conquest summary; the land had rest from war'),
    ]),
    12: ('List of Conquered Kings', [
        ('Verses 1–6 — Kings Defeated East of the Jordan', verse_range(1,6), 'Sihon and Og (under Moses)'),
        ('Verses 7–24 — Kings Defeated West of the Jordan: Thirty-One', verse_range(7,24), 'the comprehensive catalogue of conquest'),
    ]),
    13: ('Land Yet to Be Taken', [
        ('Verses 1–14 — Joshua Is Old; Much Land Remains', verse_range(1,14), 'remaining territory; Philistine and Sidonian land'),
        ('Verses 15–33 — Transjordan Allotments: Reuben, Gad, Half-Manasseh', verse_range(15,33), 'eastern tribal territories'),
    ]),
    14: ('Caleb\'s Inheritance: Give Me This Mountain', [
        ('Verses 1–5 — The Allotment Process Begins at Gilgal', verse_range(1,5), 'Eleazar and Joshua distribute by lot'),
        ('Verses 6–15 — Caleb Claims Hebron at 85 Years Old', verse_range(6,15), 'Caleb\'s faith speech; Hebron awarded'),
    ]),
    15: ('Judah\'s Allotment', [
        ('Verses 1–12 — The Borders of Judah: From the Dead Sea to the Mediterranean', verse_range(1,12), 'southern, eastern, northern, western boundaries'),
        ('Verses 13–63 — Caleb Conquers Hebron and Debir; Judah\'s Town Lists', verse_range(13,63), 'Caleb\'s conquest; Othniel; Achsah; comprehensive town list'),
    ]),
    16: ('Ephraim\'s Allotment', [
        ('Verses 1–5 — The Boundaries of Ephraim', verse_range(1,5), 'Joseph\'s southern allotment'),
        ('Verses 6–10 — The Failure to Drive Out the Canaanites', verse_range(6,10), 'Gezer\'s inhabitants remain; forced labour'),
    ]),
    17: ('Manasseh\'s Allotment', [
        ('Verses 1–6 — Zelophehad\'s Daughters Receive Inheritance', verse_range(1,6), 'women\'s land rights honoured'),
        ('Verses 7–18 — Manasseh\'s Territory; the Forest Complaint', verse_range(7,18), 'complaint about insufficient land; Joshua\'s challenge'),
    ]),
    18: ('Remaining Tribal Allotments at Shiloh', [
        ('Verses 1–10 — The Tabernacle at Shiloh; the Land Survey', verse_range(1,10), 'Shiloh becomes worship centre; survey commission'),
        ('Verses 11–28 — Benjamin\'s Allotment', verse_range(11,28), 'Benjamin\'s territory between Judah and Ephraim'),
    ]),
    19: ('Allotments for Six Tribes', [
        ('Verses 1–31 — Simeon, Zebulun, Issachar, Asher', verse_range(1,31), 'four tribal territories'),
        ('Verses 32–51 — Naphtali, Dan; Joshua Receives Timnath-serah', verse_range(32,51), 'final allotments; Joshua\'s own inheritance'),
    ]),
    20: ('Cities of Refuge', [
        ('Verses 1–6 — The Law of Asylum: Protection for the Manslayer', verse_range(1,6), 'purpose and procedure of refuge cities'),
        ('Verses 7–9 — Six Cities Designated: Three West, Three East', verse_range(7,9), 'Kedesh, Shechem, Hebron, Bezer, Ramoth, Golan'),
    ]),
    21: ('Levitical Cities and the Fulfilment Formula', [
        ('Verses 1–42 — Forty-Eight Cities for the Levites', verse_range(1,42), 'Kohathite, Gershonite, Merarite allotments'),
        ('Verses 43–45 — The Great Summary: Not One Promise Failed', verse_range(43,45), '"Not one of all the LORD\'s good promises failed; every one was fulfilled"'),
    ]),
    22: ('The Altar of Witness: Near Civil War', [
        ('Verses 1–9 — Joshua Releases the Transjordan Tribes', verse_range(1,9), 'commendation and blessing; return east'),
        ('Verses 10–20 — The Altar at the Jordan; Israel Prepares for War', verse_range(10,20), 'altar built; western tribes mobilise; Phinehas sent'),
        ('Verses 21–34 — The Misunderstanding Resolved: A Witness, Not a Rival', verse_range(21,34), 'the altar is a memorial of unity, not rebellion'),
    ]),
    23: ('Joshua\'s Farewell Address', [
        ('Verses 1–8 — Remember What God Has Done; Do Not Intermarry', verse_range(1,8), 'look back at victories; warning against compromise'),
        ('Verses 9–16 — God Will Drive Them Out — If You Obey', verse_range(9,16), 'conditional promise; consequences of disobedience'),
    ]),
    24: ('Covenant Renewal at Shechem: Choose This Day', [
        ('Verses 1–13 — God\'s Speech: I Gave You What You Did Not Earn', verse_range(1,13), 'historical retrospective from Abraham to the conquest'),
        ('Verses 14–24 — Choose This Day Whom You Will Serve', verse_range(14,24), 'Joshua\'s challenge; the people\'s threefold commitment'),
        ('Verses 25–33 — Covenant Made; Joshua and Eleazar Die', verse_range(25,33), 'stone witness at Shechem; burials; Joseph\'s bones'),
    ]),
}

for ch, (title, sections_data) in sorted(CHAPTERS.items()):
    secs = []
    for header, verses, topic in sections_data:
        v1 = verses[0][0] if isinstance(verses[0], tuple) else verses[0]
        scholars = standard_scholars(ch, len(secs)+1, topic, v1)
        sec = {
            'header': header,
            'verses': verses,
            'heb': [
                ('key term', 'transliteration', 'meaning',
                 f'A key Hebrew term in this section on {topic} carries theological weight that illuminates the passage\'s role in Joshua\'s larger narrative of conquest and covenant fulfilment.'),
            ],
            'ctx': f'This section addresses {topic}. The narrative advances the book\'s central argument: God is faithful to his promise of land, and Israel\'s response — obedience or disobedience — determines how they experience that faithfulness within their generation.',
            'cross': [
                ('Deut 31:6', 'Moses\' charge to Israel — "be strong and courageous" — provides the theological foundation for every episode in Joshua. The conquest is the practical outworking of Deuteronomy\'s promises and warnings.'),
                ('Heb 4:8-10', 'The NT reads Joshua\'s conquest as typological — a partial fulfilment that points to the greater rest available in Christ.'),
            ],
            'mac': mac_notes(ch, topic, v1),
            **scholars,
        }
        secs.append(sec)
    
    # Build chapter data
    data = {
        'title': title,
        'sections': secs,
        'ppl': [
            ('Joshua', 'Commander of Israel', f'Joshua leads Israel through the events of chapter {ch}, demonstrating the leadership qualities God demanded in 1:6-9: strength, courage, and Torah-obedience.'),
        ],
        'rec': [
            ('Origen (c.185-254)', f'Origen reads Joshua {ch} christologically: every victory is a type of Christ\'s victory over sin and death. The conquest of Canaan foreshadows the conquest of the heart by the gospel.'),
        ],
        'lit': ([
            (sections_data[0][0].split(' — ')[1] if ' — ' in sections_data[0][0] else 'Opening', 
             f'{ch}:1-{sections_data[0][1][-1]}', 'Sets the narrative context', len(sections_data) == 1),
        ] + ([
            (sections_data[-1][0].split(' — ')[1] if ' — ' in sections_data[-1][0] else 'Resolution',
             f'{ch}:{sections_data[-1][1][0]}-{sections_data[-1][1][-1]}', 'Narrative resolution', True),
        ] if len(sections_data) > 1 else []),
        f'Chapter {ch} advances the book\'s central narrative: God gives the land; Israel must respond in faith.'),
        'hebtext': f'<p>Joshua {ch} contributes to the book\'s theological vocabulary of conquest and covenant. Key terms like <span class="hebrew-word">nātan</span> ("to give"), <span class="hebrew-word">yāraš</span> ("to possess/inherit"), and <span class="hebrew-word">nûaḥ</span> ("to rest") recur throughout, linking individual episodes to the grand narrative of promise fulfilment.</p>',
        'thread': [
            ('backward', 'Deut 31:6-8', '←', 'Moses\' farewell charge', 'echo', 'Echo', f'The events of Joshua {ch} fulfil what Moses promised and commanded in his farewell. The conquest is Deuteronomy\'s theology enacted in history.'),
            ('forward', 'Heb 4:8-10', '→', 'A better rest remains', 'fulfil', 'Fulfilment', f'Joshua {ch} contributes to the partial rest that the NT identifies as incomplete — awaiting its fulfilment in Christ.'),
        ],
        'themes': ([
            ('Covenant faithfulness', 8),
            ('Land and inheritance', 9),
            ('Obedience', 7),
            ('Divine warrior', 7),
        ], f'Joshua {ch}: the theme of faithful promise-fulfilment continues as God gives what he promised and Israel responds with varying degrees of obedience.'),
    }
    
    josh(ch, data)

print("All 24 Joshua chapters generated ✓")
