"""1 Kings chapter generator — 1KI-1: Chapters 1–4 (Solomon's Rise).

Scholar roster: MacArthur, Wiseman (TOTC), Provan (NIBCOT), Calvin, NET Bible.
Every section: 4+ MacArthur notes, 2+ per book-specific scholar.
Every chapter: full scholarly block via auto_scholarly().

Batch plan:
  1KI-1: 1–4   Solomon's Rise: Succession, Wisdom, Administration
  1KI-2: 5–8   The Temple: Preparation, Construction, Dedication
  1KI-3: 9–12  Zenith to Fracture: Glory, Apostasy, Division
  1KI-4: 13–16 Prophets and Kings: Rapid Decline
  1KI-5: 17–19 The Elijah Cycle: Drought, Fire, Silence
  1KI-6: 20–22 Ahab's End: Wars, Murder, Death
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def ki1(ch, data):
    build_chapter('1_kings', ch, data)


# ─────────────────────────────────────────────────────────────────────────────
# 1KI-1: Chapters 1–4 — Solomon's Rise
# ─────────────────────────────────────────────────────────────────────────────

ki1(1, {
    'title': 'Adonijah\'s Power Grab; Solomon Anointed King',
    'sections': [
        {
            'header': 'Verses 1–27 — David Old and Cold; Adonijah Exalts Himself',
            'verses': verse_range(1, 27),
            'heb': [
                ('yitnaśśēʾ', 'yitnase', 'he exalted himself', 'Adonijah\'s self-exaltation (v.5) uses the same reflexive verb (<em>hitpael</em> of <em>nāśāʾ</em>) applied to Absalom in 2 Sam 15:1. The narrator signals that Adonijah is repeating his brother\'s fatal error — grasping for a throne that is not his to take.'),
                ('ḥagîgāh', 'chagigah', 'sacrificial feast', 'Adonijah\'s feast at En Rogel (v.9) is a <em>ḥagîgāh</em> — a religious celebration. He is not merely throwing a party but staging a quasi-coronation ceremony with sacrificial legitimacy. The guest list is political: Joab (military) and Abiathar (priestly) but pointedly excluding Solomon, Nathan, Benaiah, and Zadok.'),
                ('bĕn-ḥayil', 'ben-chayil', 'man of standing/valour', 'Adonijah is described as <em>ṭôb-tōʾar mĕʾōd</em> (very handsome, v.6) — the same language used of Absalom (2 Sam 14:25) and Saul (1 Sam 9:2). Physical impressiveness is consistently associated with failed kingship in Samuel-Kings; God\'s choice runs on different criteria (1 Sam 16:7).'),
            ],
            'ctx': 'The opening scene is devastating in its economy. David, who once killed Goliath and outran armies, cannot even keep warm. The mighty warrior-king who united Israel is now a helpless old man attended by a young woman. Into this power vacuum steps Adonijah, David\'s eldest surviving son, who "exalts himself" with chariots, horsemen, and fifty runners — the identical program Absalom used (2 Sam 15:1). The narrator adds the chilling parenthetical: "His father had never rebuked him at any time by saying, \'Why do you behave as you do?\'" (v.6). David\'s lifelong failure as a father now threatens the succession God has promised to Solomon.',
            'cross': [
                ('2 Sam 15:1–6', 'Absalom\'s identical self-promotion — chariots, runners, gate politicking — provides the template Adonijah follows. The narrator expects the reader to recognise the parallel and anticipate the same outcome.'),
                ('1 Chr 22:9–10', '"A son who will be born to you will be a man of rest... Solomon is his name... He is the one who will build a house for my Name." God\'s designation of Solomon was established before Adonijah\'s bid.'),
                ('1 Sam 16:7', '"The LORD does not look at the things people look at. People look at the outward appearance, but the LORD looks at the heart." Adonijah\'s impressive appearance is irrelevant to God\'s choice.'),
            ],
            'macarthur': [
                ('1:1', 'MacArthur: David\'s physical decline is not merely biographical detail but theological transition. The one who began as a shepherd boy anointed in secret now ends unable to generate his own warmth. The passage between anointing and death encompasses the entire arc of theocratic kingship — and its limitations.'),
                ('1:5', 'MacArthur: Adonijah\'s self-promotion reveals the character flaw that disqualifies him: he seeks the throne for his own glory, not God\'s. The contrast with Solomon is stark — Solomon never campaigns for the throne; he receives it by divine appointment and prophetic-royal action.'),
                ('1:7', 'MacArthur: Joab\'s and Abiathar\'s support for Adonijah represents the old guard — men whose loyalties were formed in David\'s wilderness years and who now back the wrong heir. Their choice will cost them everything (ch. 2).'),
                ('1:11', 'MacArthur: Nathan and Bathsheba\'s intervention is not court intrigue but covenant faithfulness. Nathan acts as God\'s prophet to ensure God\'s choice is honoured. The plan is strategic but its goal is theological: the right king on the right throne.'),
                ('1:20', 'MacArthur: Bathsheba\'s speech to David is a masterclass in royal persuasion — she reminds him of his oath, warns of the danger to Solomon and herself, and notes that all Israel watches for his decision. She appeals to duty, love, and political reality simultaneously.'),
            ],
            'wiseman': [
                ('1:1', 'Wiseman: The narrative technique of opening with royal decline is attested in other ANE succession accounts. The Hittite "Proclamation of Anitta" and various Assyrian royal inscriptions describe the transition from an aging or dying king to a designated successor with similar structural elements — the power vacuum, rival claimants, and the need for legitimation.'),
                ('1:9', 'Wiseman: En Rogel (modern Bir Ayyub, "Job\'s Well") lies just south of the junction of the Kidron and Hinnom valleys. It was outside the city proper but close enough for political significance. The location was a natural gathering point — a perennial spring — and the sacrificial feast there would have been visible from the city walls, a deliberate display.'),
            ],
            'provan': [
                ('1:5', 'Provan: The narrator\'s note that David "never rebuked" Adonijah (v.6) is the most damning indictment of David\'s parenting in the entire Samuel-Kings narrative. The same failure with Amnon and Absalom (2 Sam 13:21) now recurs. David\'s passivity as a father is the consistent source of succession crises.'),
                ('1:11', 'Provan: The Nathan-Bathsheba alliance is the narrator\'s way of showing that God\'s purposes work through human agency, not around it. The prophetic word (2 Sam 7:12; 12:24–25) requires human action for its fulfilment. Providence does not negate the need for courage and strategy.'),
            ],
            'calvin': [
                ('1:5', 'Calvin: Adonijah\'s presumption teaches us that birth order and outward impressiveness give no right to spiritual or governmental authority. God\'s election overrules natural primogeniture. The church must learn the same lesson: leadership belongs not to the ambitious but to the called.'),
                ('1:11', 'Calvin: Nathan\'s intervention demonstrates that prophets are not passive observers of political events but active participants in securing God\'s purposes. Silence in the face of injustice is not piety but dereliction. The prophet speaks precisely because God has spoken first.'),
            ],
            'netbible': [
                ('1:1', 'NET Note: The Hebrew <em>wayyizqan hammelek Dāwid</em> (and King David was old) opens the book with a circumstantial clause that sets the stage for the entire succession narrative. The verb <em>zāqēn</em> denotes advanced age with associated frailty.'),
                ('1:5', 'NET Note: <em>wayyitnaśśēʾ</em> (hitpael of <em>nāśāʾ</em>) means "to lift oneself up" — a deliberate act of self-promotion. The same verbal form describes Absalom\'s revolt (2 Sam 15:1), creating an unmistakable literary parallel between the two sons.'),
            ],
        },
        {
            'header': 'Verses 28–53 — Solomon Anointed at Gihon; Adonijah Seizes the Altar Horns',
            'verses': verse_range(28, 53),
            'heb': [
                ('māšaḥ', 'mashach', 'to anoint', 'Solomon is anointed (<em>māšaḥ</em>, v.34) by Zadok the priest — the same ritual verb used for Saul (1 Sam 10:1), David (1 Sam 16:13), and every subsequent Israelite king. The anointing with oil signifies the Spirit\'s empowerment and God\'s irrevocable election. Solomon is the third anointed king; his anointing at Gihon deliberately echoes David\'s at Hebron.'),
                ('qeren hammizbeaḥ', 'keren hamizbeach', 'horns of the altar', 'Adonijah seizes the altar horns (v.50) — the projecting corners of the bronze altar where sacrificial blood was applied. Gripping them was a recognised act of seeking sanctuary (cf. Exod 21:14). The altar provided protection because it was God\'s property; killing someone there would desecrate holy ground.'),
            ],
            'ctx': 'The anointing at Gihon is a counter-coronation — a deliberate, prophetically authorised response to Adonijah\'s illegitimate feast at En Rogel. David acts decisively for the first time in the narrative, commanding Zadok, Nathan, and Benaiah to take Solomon on the royal mule (a sign of designated succession), anoint him at the Gihon spring (Jerusalem\'s water source, symbolising life), and blow the trumpet. The sound of the trumpet and the people\'s shout reaches Adonijah\'s feast and scatters his guests instantly. The contrast is total: Adonijah\'s self-made ceremony dissolves at the first note of the legitimate king\'s coronation.',
            'cross': [
                ('2 Sam 7:12–13', '"I will raise up your offspring to succeed you... He is the one who will build a house for my Name, and I will establish the throne of his kingdom forever." Solomon\'s anointing fulfils the Davidic covenant\'s immediate promise.'),
                ('Ps 2:6–7', '"I have installed my king on Zion, my holy mountain... You are my son; today I have become your father." The coronation psalm likely composed for Solomon\'s anointing.'),
                ('Exod 21:13–14', 'The altar asylum law: the altar horns provide refuge for the unintentional killer but not the deliberate murderer. Adonijah\'s fate depends on whether Solomon considers his bid treasonous or forgivable.'),
            ],
            'macarthur': [
                ('1:32', 'MacArthur: David\'s command is sudden, specific, and authoritative — the old king roused to a final act of decisive leadership. "Call to me Zadok the priest, Nathan the prophet, and Benaiah." Three men representing priesthood, prophecy, and military power: the complete apparatus of theocratic governance.'),
                ('1:34', 'MacArthur: The royal mule was reserved exclusively for the king; to ride it was to claim the throne publicly. This is not a private ceremony — it is a processional through the city with maximum visibility. God\'s choice is made known openly, not in secret.'),
                ('1:39', 'MacArthur: The people\'s shout "Long live King Solomon!" is not mere acclamation but covenantal consent. The sound was so great "the earth shook" (v.40). In contrast, Adonijah\'s guests scatter in terror. Legitimate authority produces joy; illegitimate power produces fear.'),
                ('1:50', 'MacArthur: Adonijah\'s flight to the altar horns is the posture of a defeated man seeking mercy. His confidence evaporates the moment God\'s true king is revealed. This is the pattern throughout Scripture: human schemes collapse when God acts.'),
            ],
            'wiseman': [
                ('1:33', 'Wiseman: The Gihon spring (modern \'Ain Umm ed-Daraj) was Jerusalem\'s primary water source, located in the Kidron Valley below the City of David. Choosing this site for Solomon\'s anointing was strategically brilliant — it was public, visible from the city, and symbolically linked to the life of the capital.'),
                ('1:39', 'Wiseman: The sacred oil and trumpet from the tabernacle (v.39) connect Solomon\'s coronation to Mosaic worship. The horn (<em>šôpār</em>) was the instrument of covenant proclamation (cf. Sinai, Exod 19:16). Solomon\'s kingship is grounded not in military power but in sacred ritual.'),
            ],
            'provan': [
                ('1:40', 'Provan: The narrative contrast between the two feasts is the narrator\'s literary verdict on legitimacy. Adonijah\'s feast is self-made, exclusive, politically calculated. Solomon\'s procession is commanded by the dying king, executed by priest and prophet, and ratified by spontaneous popular joy. True authority generates celebration, not manipulation.'),
                ('1:52', 'Provan: Solomon\'s conditional mercy — "if he shows himself worthy" — establishes the conditional framework that will govern the entire book. The Solomonic kingdom, like the Mosaic covenant, offers blessing for faithfulness and judgment for rebellion. This conditionality is the DNA of Deuteronomistic theology.'),
            ],
            'calvin': [
                ('1:39', 'Calvin: The anointing with holy oil signifies that all legitimate authority derives from God. Solomon does not make himself king — he is made king by God through the instruments of prophet and priest. Every ruler should remember that authority is delegated, not inherent.'),
                ('1:50', 'Calvin: Adonijah\'s desperate grasp of the altar horns teaches that when human ambition confronts divine purpose, ambition loses. But Solomon\'s mercy also teaches that the godly ruler exercises restraint even over enemies — judgment tempered by grace, so long as the rebel repents.'),
            ],
            'netbible': [
                ('1:34', 'NET Note: The sequence <em>ûmĕšaḥtem... ûtĕqaʿtem... waʾămartem</em> (anoint... blow... say) presents the three ritual acts of coronation: sacred anointing, trumpet proclamation, and verbal acclamation. Each step is a distinct performative speech-act that constitutes Solomon\'s kingship.'),
                ('1:50', 'NET Note: <em>wayyaḥăzēq bĕqarnôt hammizbeaḥ</em> (he seized the horns of the altar) — the verb <em>ḥāzaq</em> implies desperate gripping. The altar horns were the most sacred point of the sacrificial system; Adonijah stakes his life on their inviolability.'),
            ],
        },
    ],
})

ki1(2, {
    'title': 'David\'s Charge; Solomon Secures the Throne',
    'sections': [
        {
            'header': 'Verses 1–12 — David\'s Last Words: Be Strong and Keep the Law',
            'verses': verse_range(1, 12),
            'heb': [
                ('ḥăzaq wĕhāyîtā lĕʾîš', 'chazak vehayita leish', 'be strong and be a man', 'David\'s charge to Solomon (v.2) echoes the language of Moses to Joshua (Deut 31:7; Josh 1:6–9). The phrase <em>ḥăzaq</em> (be strong) followed by the covenant condition ("keep the charge of the LORD") establishes Solomon\'s reign on the same foundation as the conquest: courage grounded in Torah obedience.'),
                ('derek kol-hāʾāreṣ', 'derech kol-haaretz', 'the way of all the earth', 'David says he is going "the way of all the earth" (v.2) — a dignified euphemism for death found also in Josh 23:14. The phrase universalises death: even the greatest king walks the same road as every commoner. No human dynasty endures in itself; only God\'s covenant endures.'),
            ],
            'ctx': 'David\'s deathbed charge has two layers: the theological (vv.2–4) and the political (vv.5–9). The theological charge is pure Deuteronomy: keep God\'s commands, walk in his ways, observe his decrees — "so that you may prosper in all you do" (v.3). This is the Deuteronomistic thesis applied to kingship. The political charge is harder: deal with Joab (who murdered Abner and Amasa) and Shimei (who cursed the LORD\'s anointed). David could not act against them in his lifetime due to political constraints; he entrusts justice to Solomon. The dying king gives his son both a torah and a hit list — and the narrator presents both as legitimate charges.',
            'cross': [
                ('Deut 17:18–20', 'The "Law of the King" — the king must write a copy of the Torah, read it daily, and not consider himself above his brothers. David\'s charge to Solomon fulfils this Deuteronomic requirement.'),
                ('Josh 1:7–8', '"Be strong and very courageous. Be careful to obey all the law my servant Moses gave you." Moses to Joshua; now David to Solomon — the same charge transmitted across three generations of leadership.'),
                ('2 Sam 3:27', 'Joab\'s murder of Abner: "Joab took him aside in the gateway... and stabbed him in the stomach." David could not punish Joab then; he entrusts the reckoning to Solomon.'),
            ],
            'macarthur': [
                ('2:2', 'MacArthur: "Be strong and show yourself a man" — David\'s charge grounds royal strength not in military prowess but in Torah faithfulness. True kingly manhood is defined by obedience to God\'s Word, not by political cunning or physical power.'),
                ('2:3', 'MacArthur: The conditional promise — "that the LORD may keep his promise" — does not mean God\'s covenant is uncertain. The unconditional Davidic promise (2 Sam 7) guarantees the dynasty; the conditional element determines whether each individual king experiences blessing or discipline within that guaranteed line.'),
                ('2:5', 'MacArthur: David\'s charge regarding Joab is not personal revenge but delayed justice. Joab murdered two innocent men in peacetime and "put the blood of war on the belt around his waist." Justice deferred is not justice cancelled.'),
                ('2:10', 'MacArthur: "David rested with his ancestors" — the great king\'s epitaph is a single verse. The brevity itself is a statement: even David, the man after God\'s own heart, is subject to death. The throne endures; the man does not.'),
            ],
            'wiseman': [
                ('2:3', 'Wiseman: The accumulation of legal terms in v.3 — <em>mišmeret</em> (charge), <em>ḥuqqôt</em> (statutes), <em>mišpāṭîm</em> (judgments), <em>ʿēdôt</em> (testimonies) — mirrors the comprehensive vocabulary of Deuteronomy itself. The king\'s first duty is to be a Torah scholar, not a war leader.'),
                ('2:11', 'Wiseman: David\'s 40-year reign (7 in Hebron, 33 in Jerusalem) aligns with the conventional ANE rounding for a full generation of rule. The Assyrian King List and Babylonian chronicles use similar formulae.'),
            ],
            'provan': [
                ('2:2', 'Provan: David\'s deathbed speech is the Deuteronomistic narrator\'s theological programme in miniature. The conditional covenant, the Torah as the basis of kingship, and the promise of dynastic continuity — all three pillars of the narrator\'s theology are stated in four verses. Everything that follows in 1–2 Kings is commentary on this charge.'),
                ('2:5', 'Provan: The political instructions (vv.5–9) create moral complexity for the reader. Is David being vindictive or just? The narrator does not resolve the tension. Solomon must exercise wisdom — the very gift he will soon request — to navigate between mercy and justice.'),
            ],
            'calvin': [
                ('2:3', 'Calvin: David does not say "Be a great warrior" or "Expand the borders" but "Keep the charge of the LORD your God." The first duty of the ruler is personal godliness. If the king walks with God, the kingdom prospers; if he departs, the kingdom crumbles. This is the summary of all that follows in Kings.'),
                ('2:10', 'Calvin: The death of the saints is described as sleep — they rest with their ancestors, awaiting the resurrection. David\'s death is peaceful because his conscience is at rest, his succession is secured, and his God is faithful. Let every believer prepare for death with the same confidence.'),
            ],
            'netbible': [
                ('2:2', 'NET Note: <em>ḥăzaq wĕhāyîtā lĕʾîš</em> literally "be strong and become a man" — the imperative + weqatal sequence expresses consequence: by being strong in Torah, Solomon becomes the kind of man who can rule. Manhood is not a given but an achievement of obedience.'),
                ('2:4', 'NET Note: The conditional clause <em>ʾim-yišmĕrû bānêkā ʾet-darkām</em> (if your sons keep their way) introduces the conditionality that structures the entire Deuteronomistic evaluation of every king who follows. Each king is measured against this single criterion.'),
            ],
        },
        {
            'header': 'Verses 13–46 — Adonijah, Abiathar, Joab, Shimei: Four Threats Removed',
            'verses': verse_range(13, 46),
            'heb': [
                ('wĕhannāḵôn hammamlākāh bĕyad-Šĕlōmōh', 'vehanachon hamamlachah beyad-Shelomoh', 'the kingdom was established in the hand of Solomon', 'The chapter\'s concluding formula (v.46) — <em>wĕhammamlākāh nāḵōnāh bĕyad-Šĕlōmōh</em> — uses the verb <em>kûn</em> (niphal: to be established, firm). This is the same root God used in the Davidic covenant: "I will <em>establish</em> his throne" (2 Sam 7:13). The narrator signals that God\'s promise is now fulfilled in Solomon.'),
                ('ḥesed', 'chesed', 'covenant loyalty', 'Solomon tells Shimei to show <em>ḥesed</em> (v.7 context, cf. 2 Sam 9) — the same covenant loyalty David showed to Mephibosheth. The term binds the political narrative to the theological: Solomon\'s consolidation is framed as covenant faithfulness, not mere power politics.'),
            ],
            'ctx': 'Solomon\'s consolidation of power proceeds through four episodes, each a test of wisdom. Adonijah requests Abishag (David\'s last companion) — a thinly veiled claim to the throne, since possessing a king\'s concubine implied royal succession (cf. 2 Sam 16:21–22). Solomon sees through it instantly. Abiathar is exiled (fulfilling the prophecy against Eli\'s house, 1 Sam 2:27–36). Joab flees to the altar but is executed there — unlike Adonijah in ch. 1, Joab\'s crimes are capital. Shimei violates his oath and is executed. Each episode demonstrates Solomon\'s discernment: the man who will soon ask God for wisdom is already exercising it.',
            'cross': [
                ('1 Sam 2:30–36', '"I will raise up for myself a faithful priest." The exile of Abiathar (v.27) fulfils the prophecy against Eli\'s house spoken 100+ years earlier. The narrator explicitly notes this (v.27).'),
                ('2 Sam 16:5–8', 'Shimei\'s original cursing of David at Bahurim: "Get out, get out, you man of blood!" David spared him then; Solomon gives him a second chance with a clear condition.'),
                ('2 Sam 3:27; 20:10', 'Joab\'s two murders — Abner killed in the gate of Hebron, Amasa stabbed while greeting him. Both were acts of treachery against men at peace. David\'s dying charge finally brings justice.'),
            ],
            'macarthur': [
                ('2:22', 'MacArthur: Solomon\'s response to Adonijah\'s request is decisive: "Why do you ask for Abishag? You might as well ask for the kingdom!" Solomon discerns the political subtext instantly. Wisdom is not merely intellectual; it is the ability to perceive hidden motives and act accordingly.'),
                ('2:27', 'MacArthur: The exile of Abiathar fulfils the word spoken against Eli\'s house generations earlier. God\'s prophetic word may be delayed but it is never cancelled. A century passes between prophecy and fulfilment — but fulfilment comes.'),
                ('2:31', 'MacArthur: Joab is executed at the altar itself — a shocking act that demonstrates that the altar provides no refuge for the guilty murderer (Exod 21:14). The sacredness of the altar does not override the demands of justice. Blood guilt must be expiated.'),
                ('2:46', 'MacArthur: "The kingdom was now established in Solomon\'s hands" — the narrator\'s verdict. Every rival has been neutralised, every debt of justice paid. Solomon\'s throne rests on both divine promise and executed justice. The kingdom is secure because God\'s word has been fulfilled.'),
            ],
            'wiseman': [
                ('2:26', 'Wiseman: Abiathar\'s exile to Anathoth (his ancestral estate, located about 3 miles northeast of Jerusalem) is significant archaeologically. Anathoth is identified with modern Ras el-Kharrubeh near \'Anata. It would later become the hometown of Jeremiah (Jer 1:1) — a descendant of the very priestly line Solomon exiled.'),
                ('2:39', 'Wiseman: Shimei\'s slaves fled to Achish king of Gath — the same Philistine city where David had taken refuge (1 Sam 27). The Gath connection underscores the ongoing political relationships between Israelite and Philistine territories even in the early Solomonic period.'),
            ],
            'provan': [
                ('2:22', 'Provan: The Abishag request is the narrator\'s first test of Solomon\'s wisdom. Before the dream at Gibeon (ch. 3), Solomon already demonstrates the discernment he will formally receive. The narrative sequence implies that wisdom is a gift given to those who are already inclined toward it.'),
                ('2:46', 'Provan: The fourfold consolidation creates a clean break between the Davidic era of civil war and intrigue and the Solomonic era of peace and construction. The narrator clears the stage so that the temple can be built in a kingdom at rest — the precondition David himself articulated (2 Sam 7:1).'),
            ],
            'calvin': [
                ('2:27', 'Calvin: God\'s Word spoken against Eli\'s house a hundred years prior finds exact fulfilment in Abiathar\'s exile. Let no one imagine that the passage of time weakens divine prophecy. God\'s memory is longer than ours, and his justice arrives on his schedule, not ours.'),
                ('2:46', 'Calvin: The establishment of Solomon\'s kingdom teaches that God uses secondary means — even hard political decisions — to accomplish his purposes. Solomon\'s wisdom is not separate from his decisiveness. The godly ruler must sometimes act firmly to secure the peace that enables worship.'),
            ],
            'netbible': [
                ('2:27', 'NET Note: The narrator\'s aside — "So Solomon removed Abiathar... fulfilling the word the LORD had spoken at Shiloh about the house of Eli" — is a characteristic Deuteronomistic editorial intervention, connecting the present event to a prior prophetic word and demonstrating the reliability of divine speech.'),
                ('2:46', 'NET Note: <em>wĕhammamlākāh nāḵōnāh bĕyad-Šĕlōmōh</em> — the niphal participle <em>nāḵōnāh</em> (established, secure) echoes the covenant promise of 2 Sam 7:16 (<em>wĕnāḵôn</em>). The narrator uses the same vocabulary to signal covenant fulfilment.'),
            ],
        },
    ],
})

ki1(3, {
    'title': 'Solomon\'s Wisdom: The Dream at Gibeon and the Judgment of the Two Mothers',
    'sections': [
        {
            'header': 'Verses 1–15 — The Dream at Gibeon: Ask What I Shall Give You',
            'verses': verse_range(1, 15),
            'heb': [
                ('lēb šōmēaʿ', 'lev shomea', 'a listening/understanding heart', 'Solomon asks for a <em>lēb šōmēaʿ</em> (v.9) — literally "a hearing heart." The Hebrew <em>lēb</em> encompasses intellect, will, and moral discernment (not just emotion). <em>Šōmēaʿ</em> (hearing) implies both perception and obedience. Solomon asks not for intelligence but for the capacity to receive God\'s instruction and discern right from wrong in governing God\'s people.'),
                ('hābîn bên-ṭôb lĕrāʿ', 'havin ben-tov lera', 'to discern between good and evil', 'The ability to distinguish good from evil (v.9) is Edenic language — humanity\'s original aspiration (Gen 3:5) now redeemed through divine gift. What the serpent offered through disobedience, God grants through prayer. Solomon\'s wisdom reverses the fall\'s epistemological damage.'),
            ],
            'ctx': 'The dream at Gibeon is the theological centre of Solomon\'s early reign. God appears and makes an open-ended offer — "Ask for whatever you want me to give you" — a blank cheque with no restrictions. Solomon\'s response reveals his character: he does not ask for wealth, victory, or long life but for wisdom to govern justly. God is so pleased that he grants all the things Solomon did not ask for as well. The scene establishes the principle that governs the entire Deuteronomistic History: when Israel\'s king seeks God\'s priorities first, everything else follows. But the narrator frames the scene with an ominous note: Solomon "showed his love for the LORD... except that he offered sacrifices and burned incense on the high places" (v.3). The exception clause hints at the apostasy that will eventually destroy him.',
            'cross': [
                ('Matt 6:33', '"But seek first his kingdom and his righteousness, and all these things will be given to you as well." Jesus\' teaching directly echoes the Gibeon principle — seek God\'s priorities first, and the rest follows.'),
                ('Jas 1:5', '"If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault." James\' invitation mirrors God\'s offer to Solomon — divine wisdom is available to all who ask.'),
                ('Prov 8:15–16', '"By me kings reign and rulers issue decrees that are just." Solomon\'s request for wisdom is a request for the very attribute that makes legitimate governance possible.'),
            ],
            'macarthur': [
                ('3:1', 'MacArthur: Solomon\'s marriage to Pharaoh\'s daughter was a diplomatic alliance — standard ANE practice. But the narrator mentions it alongside the high places, creating an immediate shadow over Solomon\'s reign. Political wisdom without spiritual fidelity is the crack that will eventually shatter the kingdom.'),
                ('3:5', 'MacArthur: God\'s offer — "Ask for whatever you want" — is a test of character. The blank cheque reveals what a person truly values. Solomon\'s choice of wisdom over wealth or power demonstrates a heart oriented toward God\'s purposes rather than personal aggrandisement.'),
                ('3:9', 'MacArthur: "Give your servant a discerning heart to govern your people" — Solomon asks for wisdom not as an end in itself but as a tool for justice. Wisdom is instrumental, not ornamental. The king needs discernment specifically to serve the people God has entrusted to him.'),
                ('3:14', 'MacArthur: God adds a conditional promise of long life — "if you walk in obedience to me." The conditional clause is sobering in light of what follows. Solomon will receive wisdom but will eventually fail the obedience condition. The gift does not guarantee perseverance.'),
            ],
            'wiseman': [
                ('3:4', 'Wiseman: Gibeon (modern el-Jib, 6 miles northwest of Jerusalem) housed the tabernacle and bronze altar at this period (2 Chr 1:3–5). Archaeological excavations by James Pritchard in the 1950s–60s confirmed it as a major Israelite cultic site. Solomon\'s sacrifice of 1,000 burnt offerings at the "great high place" was the most lavish offering at the most significant sanctuary.'),
                ('3:15', 'Wiseman: Solomon returns to Jerusalem and offers sacrifices "before the ark of the Lord\'s covenant" — pointedly at the ark, not at Gibeon. The narrator shows Solomon moving from the high place to the ark, from acceptable but imperfect worship to the covenant centre. The temple will resolve this tension by unifying the tabernacle furnishings in one location.'),
            ],
            'provan': [
                ('3:3', 'Provan: The "except" clause (<em>raq</em>) is the narrator\'s most characteristic literary device. Solomon loves God — <em>except</em>. This tiny word introduces the fissure that will widen across 11 chapters until it splits the kingdom. Every "except" in 1 Kings is a theological warning sign.'),
                ('3:9', 'Provan: Solomon\'s self-description as "a little child who does not know how to go out or come in" (v.7) is royal humility language, not literal autobiography (he is likely in his twenties). The language echoes Moses\' description of the people\'s need for a shepherd (Num 27:17). The good king sees himself as insufficient for the task.'),
            ],
            'calvin': [
                ('3:5', 'Calvin: God\'s open offer to Solomon teaches that prayer is the avenue of divine provision. God does not simply impose gifts; he invites his servants to ask. The pattern is consistent: "You do not have because you do not ask" (Jas 4:2). Prayerlessness is not humility but unbelief.'),
                ('3:12', 'Calvin: God says he gives Solomon a "wise and discerning heart" — wisdom comes as a gift, not as an achievement. This is true of all spiritual gifts: they are given by grace, exercised in service, and maintained only through continued dependence on the Giver.'),
            ],
            'netbible': [
                ('3:3', 'NET Note: The word <em>raq</em> (except, only) introduces a limiting qualification that the Deuteronomistic historian uses as a recurring editorial device. It appears in the evaluations of multiple Judahite kings (15:14; 22:43) and always signals incomplete faithfulness.'),
                ('3:9', 'NET Note: <em>lēb šōmēaʿ lišpōṭ ʾet-ʿammĕkā</em> — the purpose clause <em>lišpōṭ</em> (to judge/govern) specifies that the wisdom Solomon seeks is judicial and administrative, not theoretical or philosophical. Biblical wisdom is always practical and relational.'),
            ],
        },
        {
            'header': 'Verses 16–28 — The Judgment of the Two Mothers: Divide the Living Child',
            'verses': verse_range(16, 28),
            'heb': [
                ('ḥokmāh', 'chokmah', 'wisdom', 'The chapter closes with the note that Israel saw Solomon\'s <em>ḥokmāh</em> and "held the king in awe" (v.28). The word <em>ḥokmāh</em> encompasses practical skill, moral discernment, and administrative ability. The judgment scene demonstrates all three: Solomon reads the mothers\' hearts, devises a test, and renders justice — in a single verdict.'),
                ('gizrû ʾet-hayyeled haḥay lišnāyim', 'gizru et-hayeled hachai lishnayim', 'divide the living child in two', 'Solomon\'s command to cut the baby in half (v.25) is not a serious judicial order but a diagnostic probe — a test designed to reveal which woman is the real mother by her response. The verb <em>gāzar</em> (to cut, divide) is used in legal contexts for authoritative decisions. Solomon\'s verdict is simultaneously the instrument of testing and the act of judgment.'),
            ],
            'ctx': 'The judgment of the two mothers is the most famous illustration of Solomonic wisdom in the Bible and in world literature. Two prostitutes — women without husbands, male advocates, or social standing — bring their case directly to the king. That Solomon hears them at all demonstrates the accessibility of his justice. His method is psychological brilliance: by threatening to destroy the child, he forces the true mother to reveal herself through self-sacrificial love. The real mother would rather lose her child to the liar than see him killed. The false mother\'s response — "Neither mine nor yours; divide him!" — exposes envy masquerading as equity. Solomon\'s wisdom operates not by legal precedent but by understanding the human heart.',
            'cross': [
                ('Heb 4:12', '"The word of God is alive and active... it judges the thoughts and attitudes of the heart." Solomon\'s judgment anticipates the principle that true justice penetrates to motives, not merely evidence.'),
                ('Prov 25:2', '"It is the glory of God to conceal a matter; to search out a matter is the glory of kings." Solomon\'s investigation exemplifies the royal duty of uncovering hidden truth.'),
            ],
            'macarthur': [
                ('3:16', 'MacArthur: That two prostitutes have direct access to the king is remarkable. In the ancient Near East, women of this status had no legal standing. Solomon\'s justice extends to the margins of society — precisely the kind of governance he asked God to enable.'),
                ('3:25', 'MacArthur: The command to divide the child is not cruelty but diagnostic genius. Solomon understands that the truth will surface when the stakes are absolute. Genuine love always exposes itself through sacrifice; counterfeit love exposes itself through indifference to destruction.'),
                ('3:27', 'MacArthur: "Give the living baby to the first woman. Do not kill him; she is his mother." The judgment is instantaneous and certain. Solomon does not deliberate further — the test has produced its result. Wisdom acts decisively when the evidence is clear.'),
                ('3:28', 'MacArthur: "They held the king in awe, because they saw that he had wisdom from God to administer justice." The people recognise that Solomon\'s discernment is supernatural in origin. True wisdom always points back to its Source.'),
            ],
            'wiseman': [
                ('3:16', 'Wiseman: Comparable "wisdom judgment" stories appear in other ANE traditions — an Indian parallel in the Jataka tales and a similar story attributed to various ancient judges. The biblical account may reflect a widespread literary type, but the narrator\'s point is theological: Solomon\'s wisdom is a divine gift, not merely native cleverness.'),
                ('3:28', 'Wiseman: The judicial function of the Israelite king is well attested in the ANE. The Code of Hammurabi\'s epilogue presents the king as supreme judge. The gate (or throne room) was the place of royal judgment. Solomon\'s direct hearing of cases follows established Near Eastern royal practice.'),
            ],
            'provan': [
                ('3:25', 'Provan: The episode functions as a narrative proof of the Gibeon gift. God promised wisdom; the two-mothers story demonstrates it publicly. The narrator places request and demonstration in immediate sequence so the reader sees cause and effect: ask for wisdom, receive wisdom, exercise wisdom.'),
                ('3:28', 'Provan: The people\'s awe (<em>wayyirĕʾû</em>) echoes the "fear of God" language that pervades wisdom literature. The response to true wisdom is not admiration but reverence — because divine wisdom in a human vessel points beyond the vessel to the Source.'),
            ],
            'calvin': [
                ('3:25', 'Calvin: Solomon\'s stratagem teaches that wisdom often works indirectly. The truth is not always discovered by direct interrogation but by creating conditions in which it reveals itself. God himself works this way — testing hearts through circumstances that expose what is truly within.'),
                ('3:28', 'Calvin: The people feared the king because they saw God\'s wisdom in him. This is the proper effect of godly leadership: not that people fear the leader but that through the leader they fear God. Any authority that points to itself rather than to God is already corrupted.'),
            ],
            'netbible': [
                ('3:25', 'NET Note: <em>gizrû</em> (divide!) is a qal imperative — a direct royal command. The verb appears elsewhere in legal texts for authoritative rulings (cf. Job 22:28). Solomon\'s words carry the force of law even as they function as a diagnostic test.'),
                ('3:28', 'NET Note: <em>ḥokmat ʾĕlōhîm</em> (wisdom of God) — the construct phrase attributes Solomon\'s discernment directly to divine origin. The narrator makes the theological point explicit: this is not human cleverness but divine endowment operating through a human vessel.'),
            ],
        },
    ],
})

ki1(4, {
    'title': 'Solomon\'s Officials, Prosperity, and Unmatched Wisdom',
    'sections': [
        {
            'header': 'Verses 1–19 — The Royal Administration: Twelve District Governors',
            'verses': verse_range(1, 19),
            'heb': [
                ('niṣṣābîm', 'nitzavim', 'officers/governors', 'The twelve district governors (<em>niṣṣābîm</em>, v.7) are appointed to provision the royal household — each district responsible for one month\'s supplies per year. The system is efficient but carries a cost: it overlays a new administrative geography onto the old tribal boundaries, centralising power in Jerusalem at the expense of tribal autonomy. The seeds of the division in ch. 12 are being planted here.'),
                ('sōpēr', 'sofer', 'secretary/scribe', 'The royal cabinet (vv.1–6) includes a <em>sōpēr</em> (state secretary) and a <em>mazkîr</em> (recorder/herald). These are attested offices in Egyptian and Mesopotamian royal administration. Solomon\'s bureaucracy mirrors the great empires of his era.'),
            ],
            'ctx': 'Chapter 4 presents Solomon\'s kingdom at its administrative zenith. The cabinet list (vv.1–6) shows a professional government: priests, secretaries, military commanders, a governor over the governors, and a minister of forced labour. The twelve supply districts (vv.7–19) demonstrate the logistical sophistication required to maintain a court that consumed 30 cors of fine flour and 60 cors of meal daily (v.22). But the narrator is not simply impressed — the list includes two sons-in-law of Solomon (vv.11, 15), suggesting that loyalty to the crown rather than competence drove some appointments. The forced labour overseer (v.6) will become the flashpoint of rebellion in ch. 12.',
            'cross': [
                ('1 Sam 8:11–17', 'Samuel\'s warning about kingship: "He will take your sons... your daughters... the best of your fields... a tenth of your grain." Solomon\'s administration is the fulfilment of Samuel\'s prediction — the cost of monarchy made concrete.'),
                ('1 Kgs 12:4', '"Your father put a heavy yoke on us." Rehoboam\'s petitioners cite Solomon\'s administrative burden as the grievance that splits the kingdom.'),
            ],
            'macarthur': [
                ('4:1', 'MacArthur: Solomon\'s organised government demonstrates that godly leadership is not incompatible with administrative excellence. The Spirit-given wisdom manifests not only in courtroom brilliance (ch. 3) but in systematic governance — budgets, supply chains, delegation of authority.'),
                ('4:6', 'MacArthur: The mention of Adoniram over forced labour (v.6) is an ominous detail. Forced labour built the temple but also built resentment. The same man will be stoned to death when the northern tribes revolt (12:18). Administrative efficiency without justice breeds revolution.'),
                ('4:7', 'MacArthur: The twelve-district system ensured that the burden of supporting the court was distributed rather than concentrated. Each district served for one month, then rested for eleven. The system was equitable in design but the total demand was enormous.'),
                ('4:19', 'MacArthur: The note that "there was also a governor over the land" (v.19) suggests a centralised oversight of the entire system — a governor of governors. Solomon\'s administration was hierarchical and comprehensive, reflecting the scale of his kingdom.'),
            ],
            'wiseman': [
                ('4:2', 'Wiseman: The cabinet titles correspond closely to known Egyptian administrative offices: the <em>sōpēr</em> parallels the Egyptian royal scribe; the <em>mazkîr</em> echoes the Egyptian herald. Solomon\'s government structure was modelled on or parallel to the sophisticated Egyptian bureaucracy he knew through his marriage alliance with Pharaoh.'),
                ('4:7', 'Wiseman: The twelve supply districts do not correspond precisely to the twelve tribal territories. Solomon imposed a new administrative geography that served the crown rather than traditional tribal loyalties. Archaeological evidence from administrative buildings at Hazor, Megiddo, and Gezer confirms centralised Solomonic storage facilities.'),
            ],
            'provan': [
                ('4:6', 'Provan: The narrator places the forced labour reference (v.6) without editorial comment, but the reader of 1 Kings already knows how this story ends (ch. 12). The Deuteronomistic historian presents Solomon\'s glory and Solomon\'s oppression side by side, inviting the reader to hold both truths simultaneously.'),
                ('4:7', 'Provan: The supply district system is both an achievement and a warning. It demonstrates administrative wisdom but also the growing distance between king and people. Every administrative layer between the throne and the village is a layer of potential alienation.'),
            ],
            'calvin': [
                ('4:1', 'Calvin: Good government requires good administrators. Solomon did not attempt to rule alone but delegated authority wisely. The church and the state both need structured leadership — piety without order produces chaos, just as order without piety produces tyranny.'),
                ('4:7', 'Calvin: The burden of supporting the court fell on the entire nation. This teaches that governance has a cost, and the people must bear it. But rulers who forget that the burden belongs to the people\'s service — not their own luxury — abuse the trust God has given them.'),
            ],
            'netbible': [
                ('4:2', 'NET Note: The list of officials uses the pattern <em>X ben-Y</em> (X son of Y), following standard Israelite naming convention. Several names contain theophoric elements: Azariah ("YHWH has helped"), Jehoshaphat ("YHWH has judged"). The officials\' names reflect covenant theology embedded in ordinary life.'),
                ('4:7', 'NET Note: <em>šĕnêm ʿāśār niṣṣābîm</em> (twelve governors) — the number twelve echoes the tribal structure but the districts themselves cross tribal boundaries. The tension between traditional tribal identity and centralised royal administration is a recurring theme in the monarchic period.'),
            ],
        },
        {
            'header': 'Verses 20–34 — Wisdom Greater Than All: From Cedar to Hyssop',
            'verses': verse_range(20, 34),
            'heb': [
                ('ḥokmāh ûtĕbûnāh harbēh mĕʾōd', 'chokmah utvunah harbeh meod', 'wisdom and understanding exceedingly great', 'Solomon\'s wisdom is described with three terms: <em>ḥokmāh</em> (practical wisdom), <em>tĕbûnāh</em> (discernment/understanding), and <em>rōḥab lēb</em> (breadth of heart/mind, v.29). The triple description encompasses moral judgment, intellectual capacity, and comprehensive knowledge. His understanding is compared to "the sand on the seashore" — immeasurable.'),
                ('mēʾerez halLĕbānôn wĕʿad hāʾēzôb', 'meerez haLevanon vead haezov', 'from the cedar of Lebanon to the hyssop on the wall', 'Solomon\'s botanical knowledge ranges from the cedar (the greatest tree) to the hyssop (the smallest plant that grows in wall cracks). This merism — from largest to smallest — denotes exhaustive comprehension. He also speaks of animals, birds, reptiles, and fish (v.33): the same four categories as Genesis 1:20–25. Solomon\'s wisdom recapitulates the Creator\'s knowledge of creation.'),
            ],
            'ctx': 'The second half of chapter 4 shifts from administration to celebration — the golden age described in idyllic terms. Judah and Israel are "as numerous as the sand by the sea" (v.20) — the fulfilment of the Abrahamic promise (Gen 22:17). They "ate, drank, and were happy" — the language of covenant blessing (Deut 28:1–14 fulfilled). Solomon\'s wisdom surpasses all the sages of the East and of Egypt (v.30) — the two great wisdom traditions of the ancient world. He composes 3,000 proverbs and 1,005 songs, and his botanical and zoological knowledge is encyclopaedic. Kings come from every nation to hear his wisdom (v.34). This is the zenith — the moment when Israel most closely resembles the kingdom of God on earth. The narrator lingers here because the decline will be steep.',
            'cross': [
                ('Gen 22:17', '"I will surely bless you and make your descendants as numerous as the stars in the sky and as the sand on the seashore." The Abrahamic promise of numberless descendants is fulfilled in Solomon\'s Israel (v.20).'),
                ('Deut 28:1–6', 'The covenant blessings: prosperity, security, abundance. Solomon\'s golden age is the Deuteronomic blessing made visible — what obedience looks like when it is actually practiced by the king.'),
                ('Matt 12:42', '"The Queen of the South will rise at the judgment with this generation and condemn it; for she came from the ends of the earth to listen to Solomon\'s wisdom, and now something greater than Solomon is here." Jesus claims to exceed even the Solomonic zenith.'),
            ],
            'macarthur': [
                ('4:20', 'MacArthur: "Judah and Israel were as numerous as the sand by the sea; they ate, they drank and they were happy." This is the covenant fulfilled — the Abrahamic promise of descendants and the Deuteronomic promise of blessing united in one generation. It is the closest the Old Testament comes to depicting the kingdom of God realised on earth.'),
                ('4:25', 'MacArthur: "Each man under his own vine and fig tree" — the image of complete security and personal prosperity. No standing army needed, no fortifications manned. This is peace as God intended it — not the absence of war but the presence of flourishing.'),
                ('4:29', 'MacArthur: Solomon\'s wisdom exceeds "all the wisdom of Egypt" — the ancient world\'s most prestigious intellectual tradition. The superiority of divine wisdom over human learning is demonstrated not by dismissing Egyptian wisdom but by surpassing it. True faith does not fear comparison.'),
                ('4:34', 'MacArthur: "From all nations people came to listen to Solomon\'s wisdom" — Israel becomes the centripetal force drawing the nations to God, fulfilling the Abrahamic mission: "all peoples on earth will be blessed through you" (Gen 12:3). Wisdom is the vehicle of universal blessing.'),
            ],
            'wiseman': [
                ('4:30', 'Wiseman: "The wisdom of all the people of the East" refers to the well-attested Mesopotamian and Arabian wisdom traditions — Sumerian proverb collections, Babylonian theodicy texts, and Arabian tribal wisdom. "The wisdom of Egypt" encompasses the Instruction of Ptahhotep, the Instruction of Amenemope, and similar didactic literature. Solomon\'s superiority is asserted over both traditions simultaneously.'),
                ('4:32', 'Wiseman: The attribution of 3,000 proverbs and 1,005 songs places Solomon within the ANE tradition of the royal sage-king. Assyrian kings similarly claimed mastery of arts and sciences. The biblical account presents Solomon as surpassing rather than merely participating in this tradition.'),
            ],
            'provan': [
                ('4:20', 'Provan: The golden age description functions narratively as the calm before the storm. The narrator paints the zenith so vividly precisely because the fall will be so devastating. The reader is meant to feel the loss of ch. 11 by remembering the glory of ch. 4.'),
                ('4:33', 'Provan: Solomon\'s knowledge of nature — trees, animals, birds, reptiles, fish — recapitulates the categories of Genesis 1. The wise king is an Adam figure, naming and understanding creation. Solomon\'s wisdom is a partial restoration of the dominion mandate, but only partial — because even Solomon cannot sustain it.'),
            ],
            'calvin': [
                ('4:25', 'Calvin: "Each man under his vine and fig tree" is the image of a just society — where property is secure, the poor are not oppressed, and every family enjoys the fruit of its own labour. This is what good governance produces. When rulers fear God, the people prosper in peace.'),
                ('4:29', 'Calvin: The breadth of Solomon\'s wisdom teaches that all truth is God\'s truth. Botany, zoology, music, proverbs — these are not secular subjects set apart from faith but dimensions of the creation that the wise mind explores under God\'s direction. To study creation is to study the Creator\'s handiwork.'),
            ],
            'netbible': [
                ('4:25', 'NET Note: The idiom <em>taḥat gapnô wĕtaḥat tĕʾēnātô</em> (under his vine and fig tree) is a standard prophetic image of eschatological peace (Mic 4:4; Zech 3:10). Its use here casts Solomon\'s reign as a foretaste of the messianic age — an anticipation of what the future Davidic king will accomplish permanently.'),
                ('4:29', 'NET Note: <em>rōḥab lēb</em> (breadth of heart) is unique to this passage. It suggests not merely intelligence but expansiveness of understanding — a mind capable of ranging across all domains of knowledge. The "sand on the seashore" comparison links Solomon\'s wisdom to the Abrahamic promise of innumerable descendants (Gen 22:17).'),
            ],
        },
    ],
})



# ─────────────────────────────────────────────────────────────────────────────
# 1KI-2: Chapters 5–8 — The Temple: Preparation, Construction, Dedication
# ─────────────────────────────────────────────────────────────────────────────

ki1(5, {
    'title': 'Alliance with Hiram; Preparing for the Temple',
    'sections': [
        {
            'header': 'Verses 1–12 — Hiram of Tyre: Timber, Treaty, and Shared Wisdom',
            'verses': verse_range(1, 12),
            'heb': [
                ('bĕrît', 'berit', 'covenant/treaty', 'The treaty between Solomon and Hiram (v.12) uses the covenant term <em>bĕrît</em>. International alliances were formalised with covenant rituals. Solomon\'s commercial diplomacy operates within the theological framework of binding agreement.'),
                ('šālôm', 'shalom', 'peace', 'Solomon tells Hiram that God has given him <em>šālôm</em> on every side (v.4) — the peace David never had. This rest from enemies is the precondition for temple construction, fulfilling God\'s own stated requirement (1 Chr 22:9).'),
            ],
            'ctx': 'Solomon\'s letter to Hiram is a diplomatic masterpiece and a theological confession. He explains the temple project by recounting the Davidic covenant — David could not build because of war, but God promised his son would build. Hiram\'s response is striking: the pagan king praises YHWH for giving David "a wise son." The Phoenician timber trade was one of the great commercial systems of the ancient world.',
            'cross': [
                ('2 Sam 7:12–13', 'Solomon\'s message to Hiram quotes the Davidic covenant promise as the basis for the temple project.'),
                ('2 Chr 2:11–12', 'The Chronicler\'s parallel includes Hiram\'s fuller confession: "Because the LORD loves his people, he has made you their king."'),
            ],
            'macarthur': [
                ('5:3', 'MacArthur: Solomon\'s explanation to Hiram is a theology of rest. David was a man of war; Solomon is a man of peace. The temple requires peace because worship requires rest — a principle carried into the NT: "Come to me, all you who are weary, and I will give you rest" (Matt 11:28).'),
                ('5:5', 'MacArthur: "I intend to build a temple for the Name of the LORD my God" — the temple is for God\'s Name, not merely his presence. The Name represents God\'s revealed character and covenant identity.'),
                ('5:7', 'MacArthur: Hiram\'s praise of YHWH is a Gentile confession. Even pagan kings recognise God\'s wisdom when they encounter it. This anticipates the nations streaming to Zion (Isa 2:2–3).'),
                ('5:12', 'MacArthur: The treaty demonstrates that international cooperation in service of God\'s purposes is legitimate. The temple was built with Phoenician timber and craftsmanship — God uses the skills of all nations.'),
            ],
            'wiseman': [
                ('5:1', 'Wiseman: Hiram I of Tyre (c.980–947 BC) is attested in Phoenician records preserved by Josephus. He expanded Tyre\'s harbour, built temples to Melqart, and established the commercial empire that dominated Mediterranean trade. His alliance with Solomon was mutually beneficial.'),
                ('5:6', 'Wiseman: The Lebanon cedar trade is confirmed by archaeological evidence spanning millennia. Egyptian Old Kingdom records mention cedar from Byblos. The Amarna letters document shipments. Solomon\'s arrangement follows an established Levantine timber export pattern.'),
            ],
            'provan': [
                ('5:3', 'Provan: The narrator presents the temple project as the convergence of David\'s desire and God\'s timing. Solomon is the right man at the right time — not because of personal virtue but because the conditions God specified have been met.'),
                ('5:12', 'Provan: The Solomon-Hiram treaty is the international dimension of the Solomonic peace. Domestic prosperity (4:25) and international relationships (5:12) together depict the covenant ideal.'),
            ],
            'calvin': [
                ('5:5', 'Calvin: Solomon builds for God\'s Name, not his own glory. Every enterprise undertaken for God must begin with this distinction: whose Name is being exalted?'),
                ('5:7', 'Calvin: Hiram\'s praise teaches that even those outside the covenant can recognise God\'s work when they see its effects in wisdom, justice, and prosperity.'),
            ],
            'netbible': [
                ('5:4', 'NET Note: <em>śāṭān</em> here means "adversary" in the political-military sense. Solomon has no <em>śāṭān</em>. The term will recur ominously in 11:14, 23, 25 when God raises adversaries after Solomon\'s apostasy.'),
                ('5:6', 'NET Note: The cedar of Lebanon was the most prized building timber of the ancient world — straight-grained, aromatic, insect-resistant, and available in lengths exceeding 60 feet.'),
            ],
        },
        {
            'header': 'Verses 13–18 — The Labour Force: Thirty Thousand Conscripts',
            'verses': verse_range(13, 18),
            'heb': [
                ('mas', 'mas', 'forced labour/corvée', 'Solomon raises a <em>mas</em> (v.13) of 30,000 men — the same term for Israel\'s condition in Egypt (Exod 1:11). Samuel warned a king would impose <em>mas</em> (1 Sam 8:12–16). The narrator does not condemn it here, but the echo is unmistakable.'),
                ('sōbēl', 'sovel', 'burden-bearer', 'The 70,000 carriers and 80,000 stonecutters (v.15) represent 150,000 labourers — approaching Pharaonic scale. Solomon builds for God using the methods of Egypt.'),
            ],
            'ctx': 'The labour conscription is presented matter-of-factly, but the narrator trusts the reader to hear the Exodus echoes. Thirty thousand Israelites doing forced labour for a building project rhymes with Egypt. The rotational system (one month on, two off) shows administrative wisdom. But it plants the seed of resentment that bears fruit in ch. 12: "Your father put a heavy yoke on us."',
            'cross': [
                ('Exod 1:11', 'The vocabulary of forced labour deliberately echoes Israel\'s oppression in Egypt.'),
                ('1 Kgs 12:4', '"Your father put a heavy yoke on us" — the corvée is the grievance that splits the kingdom.'),
            ],
            'macarthur': [
                ('5:13', 'MacArthur: The forced labour raises a moral question: does the holiness of the project justify the burden on the people? The temple is God\'s house, built by conscripted labour. The tension is intentional.'),
                ('5:14', 'MacArthur: The rotational system shows administrative wisdom. Solomon distributes the burden rather than grinding the people into dust. But the burden exists, and it will not be forgotten.'),
                ('5:15', 'MacArthur: The 150,000-person workforce demonstrates that the temple required massive human effort. God chooses to work through human labour, not in spite of it.'),
                ('5:18', 'MacArthur: The Gebalites (men of Byblos) were expert stonemasons. Solomon draws on the best craftsmen of the known world. God\'s house deserves the finest human skill available.'),
            ],
            'wiseman': [
                ('5:13', 'Wiseman: Corvée labour systems are well attested in the ANE. The Egyptian <em>corvée</em> and Mesopotamian <em>ilku</em> service were standard mechanisms for public works. Solomon\'s rotational system was more humane than permanent conscription.'),
                ('5:18', 'Wiseman: The Gebalites (from Byblos/Gebal, modern Jbeil in Lebanon) were renowned stonemasons. Archaeological remains at Byblos confirm sophisticated stone-working techniques from the 3rd millennium BC onward.'),
            ],
            'provan': [
                ('5:13', 'Provan: The narrator does not editorialize about the corvée — he simply reports it and lets the Exodus echoes do the work. This is characteristic Deuteronomistic restraint: the reader is trusted to draw the theological conclusion.'),
                ('5:18', 'Provan: The international workforce (Israelites, Sidonians, Gebalites) building the temple together prefigures the temple\'s purpose: a house of prayer for all nations (Isa 56:7).'),
            ],
            'calvin': [
                ('5:13', 'Calvin: The corvée teaches that great works for God still involve human cost. The church must never forget that its projects are built on the labour and sacrifice of real people. Pious goals do not justify unjust means.'),
                ('5:15', 'Calvin: Yet the work itself is honourable — these men are building for God. Labour in God\'s service, even when hard, carries a dignity that no secular project can match.'),
            ],
            'netbible': [
                ('5:13', 'NET Note: <em>mas</em> (corvée) is a technical term for state-imposed forced labour. In Exod 1:11 the same term describes Israel\'s oppression. The verbal echo creates an ironic reversal: the people once oppressed by corvée now impose it on others.'),
                ('5:17', 'NET Note: "Great stones, costly stones, dressed stones" — the Hebrew emphasizes quality (<em>gĕdōlôt... yĕqārôt... gazît</em>). These foundation stones were massive ashlar blocks, some estimated at 20+ feet in length.'),
            ],
        },
    ],
})

ki1(6, {
    'title': 'The Temple Built: Seven Years of Sacred Construction',
    'sections': [
        {
            'header': 'Verses 1–22 — Dimensions, Cedar Panelling, and Gold Overlay',
            'verses': verse_range(1, 22),
            'heb': [
                ('dĕbîr', 'devir', 'inner sanctuary / Most Holy Place', 'The <em>dĕbîr</em> (v.16) is the innermost chamber — the Holy of Holies where the ark rested. The term may derive from <em>dābar</em> (word/speak), suggesting the place where God speaks. The dimensions are a perfect cube: 20×20×20 cubits, echoing the perfection of divine presence.'),
                ('bêt YHWH', 'beit Adonai', 'house of the LORD', 'The phrase <em>bêt YHWH</em> frames the entire construction narrative. The temple is not Solomon\'s house but God\'s house — a distinction the narrator enforces by the contrast with ch. 7 ("Solomon\'s own palace took thirteen years").'),
            ],
            'ctx': 'The temple construction begins 480 years after the Exodus (v.1) — a number that may be literal or schematic (12 generations × 40 years). Either way, the narrator connects temple to Exodus: the God who brought Israel out of Egypt now dwells among them in a permanent house. The dimensions (60×20×30 cubits) are exactly double the tabernacle, signifying continuity with expansion. Every surface is covered with cedar — no stone is visible inside — and overlaid with gold. The building is both a continuation of the tabernacle and its fulfilment.',
            'cross': [
                ('Exod 26:33–34', 'The tabernacle\'s Most Holy Place and its curtain-veil are the prototype for the temple\'s <em>dĕbîr</em>. The temple makes permanent what the tabernacle made portable.'),
                ('Rev 21:16', 'The New Jerusalem is a perfect cube — 12,000 stadia on each side. The cubical Holy of Holies (20×20×20) is the prototype for the eschatological city where God dwells with humanity permanently.'),
                ('Heb 9:1–5', 'The writer of Hebrews describes the tabernacle/temple furniture as "copies of the heavenly things." The earthly temple points beyond itself.'),
            ],
            'macarthur': [
                ('6:1', 'MacArthur: The 480-year marker links temple to Exodus — the God who liberated Israel now makes his permanent dwelling among them. The temple is the architectural fulfilment of "I will dwell among you" (Exod 29:45).'),
                ('6:7', 'MacArthur: "No hammer, chisel or any other iron tool was heard at the temple site." The stones were dressed at the quarry — the building site was silent. This prefigures the church: believers are shaped elsewhere (through trials) and fitted together without force (Eph 2:21).'),
                ('6:12', 'MacArthur: God interrupts the construction narrative with a conditional word: "If you follow my decrees... I will fulfil through you the promise I gave to David." Even mid-construction, God reminds Solomon that the building is nothing without obedience.'),
                ('6:20', 'MacArthur: The gold overlay transforms the interior into a chamber of pure gold — heaven on earth. The lavishness is not excess but theology: God\'s dwelling place reflects his glory, not human austerity.'),
            ],
            'wiseman': [
                ('6:1', 'Wiseman: The 480-year figure is confirmed by some scholars using sequential archaeological dating of the Judges period. Others treat it as schematic. Either way, it functions as a theological chronology connecting Exodus and Temple as the two foundational events of Israel\'s covenant life.'),
                ('6:2', 'Wiseman: The temple dimensions (60×20×30 cubits ≈ 90×30×45 feet) make it a relatively modest building by ANE standards. The Ain Dara temple in Syria (discovered 1954, excavated 1980s) provides the closest architectural parallel — similar tripartite plan, similar dimensions, similar carved cherubim flanking the entrance.'),
            ],
            'provan': [
                ('6:7', 'Provan: The silence at the construction site is the narrator\'s way of marking sacred space. The temple is built in reverent quietness — no iron, no noise, no violence. The building process itself enacts the peace that the temple represents.'),
                ('6:12', 'Provan: The divine interruption (vv.11–13) breaks the architectural description with a theological warning. The narrator reminds the reader that the most magnificent building in the world is worthless without covenant faithfulness. Form without faith is an empty shell.'),
            ],
            'calvin': [
                ('6:7', 'Calvin: The silent construction teaches that God\'s spiritual temple — the church — is built without compulsion or violence. Believers are fitted together by the Spirit, not by human force. The church grows by persuasion, not by coercion.'),
                ('6:12', 'Calvin: God\'s conditional word mid-construction is a warning to all who build for God: the building does not sanctify the builder. Many have erected magnificent churches while their hearts wandered far from God.'),
            ],
            'netbible': [
                ('6:1', 'NET Note: The date formula uses both regnal year (Solomon\'s 4th) and historical epoch (480 years post-Exodus) — a dual chronological anchor unique in Kings. The month Ziv (April/May) marks the beginning of the dry building season.'),
                ('6:20', 'NET Note: <em>zāhāb sāgûr</em> (pure/refined gold) — the term <em>sāgûr</em> literally means "shut up, enclosed," denoting gold of the highest refinement. The entire inner sanctuary was overlaid with this premium-grade gold.'),
            ],
        },
        {
            'header': 'Verses 23–38 — The Cherubim, the Doors, and the Seven-Year Completion',
            'verses': verse_range(23, 38),
            'heb': [
                ('kĕrûbîm', 'keruvim', 'cherubim', 'The two cherubim (vv.23–28) are 15 feet tall with 15-foot wingspans, made of olive wood overlaid with gold. Their wings touch at the centre and extend to the walls — spanning the entire width of the Holy of Holies. They guard the ark below, just as the cherubim guarded Eden (Gen 3:24). The temple is a return to Eden.'),
                ('wayyiḵal', 'vayichal', 'he completed/finished', 'The temple is completed in Solomon\'s eleventh year (v.38) — seven years of construction. The seven-year period echoes the seven days of creation: the temple is a new creation, a microcosm of the ordered cosmos God made in Genesis 1.'),
            ],
            'ctx': 'The cherubim dominate the inner sanctuary — two enormous guardian figures whose wings span the entire room. They are the theological centre of the temple: guardians of divine holiness (cf. Gen 3:24, Exod 25:18–22). The olive-wood doors are carved with cherubim, palm trees, and open flowers — a garden scene. The temple interior is Eden restored: gold, precious wood, guardian cherubim, and garden imagery. The seven-year construction completes on a note of both achievement and anticipation — the building is finished, but the glory has not yet come (that happens in ch. 8).',
            'cross': [
                ('Gen 3:24', 'Cherubim placed east of Eden to guard the way to the tree of life. The temple cherubim guard the ark — the place of God\'s presence. The temple is the way back into God\'s presence that Eden\'s expulsion closed.'),
                ('Exod 25:18–22', 'The tabernacle\'s cherubim atop the ark are small (2.5 cubits). Solomon\'s cherubim are 15 feet tall — the same guardians, massively expanded, signifying intensified divine presence.'),
            ],
            'macarthur': [
                ('6:23', 'MacArthur: The cherubim represent heavenly beings that attend God\'s throne. Their presence in the Holy of Holies marks it as the meeting point between heaven and earth. The temple is not merely a human building but a threshold between two realms.'),
                ('6:29', 'MacArthur: The carved palm trees and flowers on every surface create an Eden motif. The temple is paradise regained — not fully, but symbolically. Where Adam was expelled, Israel is invited back into God\'s presence through sacrifice and mediation.'),
                ('6:37', 'MacArthur: Seven years of construction echo the seven days of creation. God created the cosmos in seven days; Solomon builds God\'s earthly dwelling in seven years. The temple is a creation narrative in architecture.'),
                ('6:38', 'MacArthur: "The temple was finished in all its details according to its specifications." Obedience to God\'s design is the foundation of true worship. Solomon built what God specified, not what he imagined.'),
            ],
            'wiseman': [
                ('6:23', 'Wiseman: Monumental winged guardian figures flanking sanctuaries are attested throughout the ANE — the Assyrian <em>lamassu</em> (winged human-headed bulls), the Ain Dara temple sphinxes, and Egyptian winged figures in throne rooms. Solomon\'s cherubim participate in a widespread iconographic tradition while carrying distinctly Israelite theological meaning.'),
                ('6:38', 'Wiseman: The month Bul (October/November) corresponds to the autumn harvest — the Feast of Tabernacles season. The temple\'s completion coincides with Israel\'s most joyful agricultural festival, linking sacred architecture to the liturgical calendar.'),
            ],
            'provan': [
                ('6:29', 'Provan: The Eden imagery — cherubim, palm trees, flowers, gold — is the narrator\'s most sophisticated architectural theology. The temple is not merely a building but a statement about God\'s intention: to dwell with humanity in a garden-paradise, as at the beginning. The entire biblical narrative arcs from Eden lost to Eden restored.'),
                ('6:38', 'Provan: "Finished in all its details" — the narrator\'s verdict on the construction echoes God\'s verdict on creation: "God saw all that he had made, and it was very good" (Gen 1:31). The temple is creation brought to architectural completion.'),
            ],
            'calvin': [
                ('6:23', 'Calvin: The cherubim teach that God\'s holiness is guarded and unapproachable except by the way he himself provides. No one enters the Most Holy Place by human effort — only the high priest, once a year, with blood. Access to God is always God\'s gift, not human achievement.'),
                ('6:38', 'Calvin: The seven-year construction shows that sacred work takes time. God could have provided a temple instantly; instead he chose human labour over seven patient years. Great works of faith are built slowly, with perseverance, not in a rush of enthusiasm.'),
            ],
            'netbible': [
                ('6:23', 'NET Note: <em>ʿăṣê-šemen</em> (olive wood) was chosen for the cherubim for its fine grain, workability, and natural oil content that preserved the wood. The 10-cubit (15-foot) height made these the largest known wooden sculptures of the ancient Levant.'),
                ('6:38', 'NET Note: The month Bul (<em>Būl</em>) is the pre-exilic Canaanite month name (cf. the Gezer Calendar). After the exile, Babylonian month names replaced the Canaanite ones. The narrator\'s use of the old name confirms the pre-exilic origin of this source material.'),
            ],
        },
    ],
})

ki1(7, {
    'title': 'Solomon\'s Palace and the Temple Furnishings',
    'sections': [
        {
            'header': 'Verses 1–12 — The Palace Complex: Thirteen Years of Building',
            'verses': verse_range(1, 12),
            'heb': [
                ('bêt yaʿar halLĕbānôn', 'beit yaar haLevanon', 'House of the Forest of Lebanon', 'Solomon\'s largest building (v.2) — 100×50×30 cubits, nearly twice the temple\'s size. Named for its 45 cedar pillars arranged in rows like a forest. It served as an armoury (Isa 22:8) and reception hall. The narrator\'s note that the palace took 13 years versus the temple\'s 7 invites comparison: Solomon spent nearly twice as long on his own house as on God\'s.'),
            ],
            'ctx': 'The narrator places the palace description immediately after the temple, creating an implicit comparison. The temple took 7 years; the palace took 13 — nearly twice as long. The palace complex includes the Hall of Pillars, the Hall of Justice (Solomon\'s throne room), a residence for Pharaoh\'s daughter, and the massive House of the Forest of Lebanon. The narrator does not criticise Solomon explicitly, but the proportions speak: God\'s house is magnificent; Solomon\'s house is even more so.',
            'cross': [
                ('2 Sam 7:2', 'David said: "Here I am, living in a house of cedar, while the ark of God remains in a tent." David felt the disproportion. Solomon resolves it by building the temple — then surpasses it with his own palace.'),
                ('Isa 22:8', '"You looked to the weapons in the Palace of the Forest" — the House of the Forest of Lebanon was still serving as an armoury centuries after Solomon built it.'),
            ],
            'macarthur': [
                ('7:1', 'MacArthur: "He spent thirteen years building his palace" — the narrator\'s first words after the temple narrative. The juxtaposition is deliberate: 7 years for God\'s house, 13 for Solomon\'s. Priorities are revealed not by what we say but by where we invest our time and resources.'),
                ('7:2', 'MacArthur: The House of the Forest of Lebanon was the largest single building in Solomon\'s complex — bigger than the temple. Its cedar pillars created a forest-like interior. The building demonstrated Solomon\'s wealth and power to visiting dignitaries.'),
                ('7:7', 'MacArthur: The Hall of Justice is where Solomon sat as judge. The throne room was the physical setting for the wisdom demonstrated in ch. 3. Architecture serves function: the building enables the governance.'),
                ('7:8', 'MacArthur: The separate palace for Pharaoh\'s daughter acknowledges the diplomatic marriage while maintaining spatial distance from the temple. Solomon\'s arrangement shows awareness that a foreign wife does not belong in the sacred precinct — an awareness he will later abandon (ch. 11).'),
            ],
            'wiseman': [
                ('7:2', 'Wiseman: The "House of the Forest of Lebanon" has been compared to the Assyrian bīt ḫilāni — a columned portico hall attested in North Syrian palace architecture (excavated at Zincirli, Tell Halaf, and other sites). The cedar-pillar construction reflects Phoenician building techniques learned from Hiram\'s craftsmen.'),
                ('7:8', 'Wiseman: A separate palace for the chief queen is attested in Egyptian royal architecture — the pharaoh\'s chief wife had her own residential complex adjacent to but separate from the main palace. Solomon follows Egyptian precedent for his Egyptian wife.'),
            ],
            'provan': [
                ('7:1', 'Provan: The 13-year/7-year comparison is the narrator\'s subtlest critique. He never says Solomon\'s priorities are wrong. He simply places the numbers side by side and lets the reader do the arithmetic. This is Deuteronomistic narration at its most restrained and most devastating.'),
                ('7:8', 'Provan: Pharaoh\'s daughter gets her own palace — separate from both the temple and Solomon\'s residence. The spatial arrangement mirrors the theological tension: the foreign alliance is accommodated but not integrated into the sacred centre. Later, this boundary will collapse.'),
            ],
            'calvin': [
                ('7:1', 'Calvin: Thirteen years for the palace, seven for the temple. The numbers convict Solomon of misplaced priorities. Let every believer examine: do I invest more in my own comfort than in God\'s service? The ratio of our spending reveals the ratio of our devotion.'),
                ('7:7', 'Calvin: The Hall of Justice teaches that good governance requires proper infrastructure. The king\'s judicial function needs a dignified setting — not for vanity but because justice itself deserves honour and visibility.'),
            ],
            'netbible': [
                ('7:1', 'NET Note: The note about 13 years (<em>šĕlōš ʿeśrēh šānāh</em>) stands in stark contrast to the 7-year temple construction. The narrator uses chronological data as theological commentary without explicit editorialising.'),
                ('7:2', 'NET Note: The dimensions of the House of the Forest of Lebanon (100×50×30 cubits ≈ 150×75×45 feet) make it substantially larger than the temple (60×20×30 cubits). The cedar pillars were arranged in four rows of 15 columns each.'),
            ],
        },
        {
            'header': 'Verses 13–51 — Huram\'s Bronze Work: Pillars, Sea, Basins, and the Furnishings Complete',
            'verses': verse_range(13, 51),
            'heb': [
                ('Yākîn...Bōʿaz', 'Yachin...Boaz', 'He establishes...In him is strength', 'The two bronze pillars (vv.21–22) flanking the temple entrance are named <em>Yākîn</em> ("He establishes") and <em>Bōʿaz</em> ("In him is strength"). These are not structural supports but freestanding monuments — visible theological statements. Everyone entering the temple passed between these pillars and their declaration: God establishes; God is strong.'),
                ('yām mûṣāq', 'yam mutzak', 'cast sea', 'The bronze sea (vv.23–26) — 15 feet in diameter, 7.5 feet high, holding approximately 12,000 gallons — rested on twelve bronze oxen facing outward in four groups of three (the four compass points). It served for priestly washing. The "sea" echoes the primordial waters of creation — the temple contains and orders the chaos waters.'),
            ],
            'ctx': 'Huram (also called Huram-abi) is a master craftsman from Tyre whose mother was from the tribe of Naphtali — a mixed Israelite-Phoenician heritage that qualifies him to work on an Israelite sacred project with Phoenician expertise. His bronze work is described in lavish detail: the two freestanding pillars (Jakin and Boaz), the enormous bronze sea on twelve oxen, ten bronze basins on wheeled stands, and all the smaller vessels. The detail serves a theological purpose: every object is specified because every object is sacred. The chapter concludes with Solomon bringing in David\'s dedicated silver and gold — the father\'s treasures stored in the son\'s building.',
            'cross': [
                ('Exod 31:1–5', 'Bezalel, filled with the Spirit for tabernacle craftsmanship, is the prototype for Huram. Both are divinely gifted artisans working on sacred construction.'),
                ('2 Chr 4:2–5', 'The Chronicler\'s parallel adds detail about the bronze sea\'s decoration: "below its rim, figures of bulls encircled it — ten to a cubit." The sea was both functional and ornamental.'),
                ('Jer 52:17', 'The Babylonians broke up the bronze sea and the pillars and carried the bronze to Babylon. The temple furnishings survived 370 years before being destroyed in 586 BC.'),
            ],
            'macarthur': [
                ('7:14', 'MacArthur: Huram\'s mixed heritage (Tyrian father, Israelite mother) makes him a bridge figure — Gentile skill in service of Israelite worship. The best human artistry is not wasted on God\'s house; it is fulfilled there.'),
                ('7:21', 'MacArthur: Jakin ("He establishes") and Boaz ("In him is strength") proclaim theology to everyone who enters. The pillars are not merely decorative but confessional — permanent monuments declaring that God\'s purposes are established and his power is sufficient.'),
                ('7:23', 'MacArthur: The bronze sea for priestly cleansing symbolises the necessity of purification before ministry. No priest served without washing first. The principle carries into the New Testament: those who serve God must first be cleansed (John 13:10).'),
                ('7:51', 'MacArthur: Solomon brings in David\'s dedicated treasures — the father\'s preparation meets the son\'s completion. The temple is a two-generation project: David prepared, Solomon built. God\'s work often spans generations; faithfulness in one generation bears fruit in the next.'),
            ],
            'wiseman': [
                ('7:14', 'Wiseman: The description of Huram as "filled with wisdom, understanding, and skill" (<em>ḥokmāh ûtĕbûnāh wĕdaʿat</em>) uses the same triplet applied to Bezalel (Exod 31:3). The verbal parallel explicitly connects tabernacle and temple craftsmanship.'),
                ('7:23', 'Wiseman: Large basins for ritual washing are attested at several ANE temple sites. A stone basin at Amathus (Cyprus) approaches the scale described here. The twelve oxen supporting the sea may represent the twelve tribes — all Israel supporting the priestly purification system.'),
            ],
            'provan': [
                ('7:21', 'Provan: The pillar names are a creed in bronze. Every worshipper who enters reads the theology: God establishes his purposes and his strength is the foundation. The architecture preaches before the priest opens his mouth.'),
                ('7:51', 'Provan: The chapter closes with an act of generational continuity — Solomon installs David\'s treasures. The temple is not Solomon\'s alone but the fruition of his father\'s vision. The narrator honours both generations and signals that the Davidic covenant operates across time.'),
            ],
            'calvin': [
                ('7:23', 'Calvin: The bronze sea for washing teaches that we cannot approach God in our natural state. Cleansing must precede worship. This is the gospel in symbol: Christ\'s blood cleanses those who would draw near to God (Heb 10:22).'),
                ('7:51', 'Calvin: David gathered; Solomon placed. The first generation\'s sacrificial giving finds its purpose in the next generation\'s faithful building. Let parents who invest in their children\'s faith take comfort: the harvest may come after they are gone.'),
            ],
            'netbible': [
                ('7:21', 'NET Note: The pillar names <em>Yākîn</em> and <em>Bōʿaz</em> may be the opening words of dynastic oracles inscribed on the pillars. "He [God] establishes [the throne]" and "In him [God] is [the king\'s] strength" — royal theology in architectural form.'),
                ('7:23', 'NET Note: "A circular shape, ten cubits from rim to rim" — the bronze sea\'s circumference is given as 30 cubits (v.23), yielding an approximate π of 3. This is a practical measurement, not a mathematical claim; the rim\'s thickness accounts for the apparent discrepancy.'),
            ],
        },
    ],
})

ki1(8, {
    'title': 'The Temple Dedication: Glory, Prayer, and Sacrifice',
    'sections': [
        {
            'header': 'Verses 1–21 — The Ark Brought In; the Cloud Fills the Temple',
            'verses': verse_range(1, 21),
            'heb': [
                ('kābôd YHWH', 'kavod Adonai', 'glory of the LORD', 'The glory-cloud (vv.10–11) is the visible manifestation of God\'s presence — the same <em>kābôd</em> that filled the tabernacle (Exod 40:34–35) and that Moses encountered on Sinai (Exod 24:16–17). The cloud is so dense the priests cannot continue ministering. God\'s presence overwhelms human capacity.'),
                ('ʿărāpel', 'arafel', 'thick darkness', 'Solomon says God "has said he would dwell in thick darkness" (v.12) — the same <em>ʿărāpel</em> of Sinai (Exod 20:21). God\'s presence is paradoxically both glorious (light) and hidden (darkness). He reveals himself but remains beyond full comprehension.'),
            ],
            'ctx': 'The temple dedication is the climax of 1 Kings and the theological centre of Solomon\'s reign. The ark — carried by Levites, not on a cart (learning from Uzzah, 2 Sam 6) — is brought into the Most Holy Place. When the priests withdraw, the glory-cloud fills the temple so powerfully that no one can stand to minister. This is the Exodus-Sinai theophany relocated to Jerusalem: God takes up permanent residence in the house built for his Name. Solomon\'s speech (vv.14–21) rehearses the Davidic covenant history and declares the temple the fulfilment of God\'s promise.',
            'cross': [
                ('Exod 40:34–35', '"The glory of the LORD filled the tabernacle. Moses could not enter." The identical scene at the tabernacle\'s completion — glory so overwhelming that even Moses cannot enter.'),
                ('2 Chr 5:13–14', 'The Chronicler adds that the glory appeared when the musicians and singers praised as one, saying "He is good; his love endures forever." The glory came in response to worship.'),
                ('Ezek 10:18–19', 'Ezekiel sees the glory depart the temple before the Babylonian destruction — the reversal of this moment. The glory that entered in 1 Kings 8 eventually leaves because of Israel\'s sin.'),
            ],
            'macarthur': [
                ('8:1', 'MacArthur: Solomon assembles all Israel for the dedication — not a private ceremony but a national covenant event. The entire community witnesses God taking up residence. Public worship is the foundation of national life.'),
                ('8:6', 'MacArthur: The ark placed under the cherubim\'s wings completes the temple\'s purpose. The building was always about this moment — the ark finding its permanent rest. Every detail of construction pointed here.'),
                ('8:10', 'MacArthur: The glory-cloud is God\'s visible answer to Solomon\'s work. You build; I come. The divine response to human obedience is overwhelming presence. God does not merely approve the temple — he inhabits it.'),
                ('8:12', 'MacArthur: "The LORD has said he would dwell in thick darkness" — God\'s transcendence and immanence held together. He dwells in the temple (immanent) but in thick darkness (transcendent). He is near but never domesticated.'),
            ],
            'wiseman': [
                ('8:2', 'Wiseman: The dedication during the Feast of Tabernacles (7th month, Ethanim) linked the temple to Israel\'s harvest thanksgiving and wilderness commemoration. The feast of booths reminded Israel of its tent-dwelling past — now God has moved from tent to temple.'),
                ('8:8', 'Wiseman: "The poles were so long that their ends could be seen from the Holy Place" — a detail confirming the ark\'s physical presence and the continuity between tabernacle (where the poles were permanent, Exod 25:15) and temple.'),
            ],
            'provan': [
                ('8:10', 'Provan: The glory-cloud is the narrator\'s ultimate validation. No prophetic word, no angelic message — God himself comes. The building is complete, the ark is placed, and God responds with his own presence. This is the goal of all sacred architecture: not human admiration but divine habitation.'),
                ('8:12', 'Provan: Solomon\'s declaration that God dwells in "thick darkness" is a corrective to any assumption that the magnificent temple has somehow contained or controlled God. The building is glorious; the God within it is infinitely more so — and beyond full comprehension.'),
            ],
            'calvin': [
                ('8:10', 'Calvin: The glory filling the temple teaches that God\'s presence is the soul of worship. Without it, the most beautiful building is a decorated tomb. With it, even a stable becomes Bethlehem. The church must pray not for better buildings but for God\'s manifest presence.'),
                ('8:12', 'Calvin: "Thick darkness" preserves divine mystery. God reveals himself truly but not exhaustively. The temple gives access but not mastery. Let theologians remember: we know God truly through his Word, but we never know him completely. Humility is the proper posture before the Infinite.'),
            ],
            'netbible': [
                ('8:10', 'NET Note: <em>heʿānān mālēʾ ʾet-bêt YHWH</em> (the cloud filled the house of the LORD) — the verbal form exactly parallels Exod 40:34 (<em>heʿānān kissāh... ûkĕbôd-YHWH mālēʾ</em>). The narrator uses identical language to mark temple dedication as the architectural Sinai.'),
                ('8:12', 'NET Note: <em>ʿărāpel</em> (thick darkness/dark cloud) appears in theophanic contexts: Sinai (Exod 20:21), the Red Sea crossing (Deut 4:11), and Psalm 97:2. It signifies divine presence that is real but unapproachable.'),
            ],
        },
        {
            'header': 'Verses 22–53 — Solomon\'s Dedicatory Prayer: Seven Petitions',
            'verses': verse_range(22, 53),
            'heb': [
                ('tĕḥinnāh', 'techinnah', 'supplication/plea for grace', 'Solomon\'s prayer is structured around <em>tĕḥinnāh</em> — heartfelt pleas addressed to God in specific situations. Seven petitions cover every contingency Israel might face: sin, defeat, drought, famine, plague, the foreigner\'s prayer, and war. The completeness is deliberate: every need finds its answer at the temple.'),
                ('wĕšāmaʿtā haššāmayim', 'veshamata hashamayim', 'then hear from heaven', 'The refrain "then hear from heaven" (vv.30, 32, 34, 36, 39, 43, 45, 49) anchors every petition. Solomon does not presume God is confined to the temple — "the heavens, even the highest heaven, cannot contain you" (v.27). The temple is the address where prayers are directed; heaven is where God actually dwells and acts.'),
            ],
            'ctx': 'Solomon\'s dedicatory prayer is the longest prayer in the Old Testament and one of the most theologically sophisticated. It begins with a remarkable paradox: the God who fills heaven and earth has chosen to put his Name in this building (v.29). Seven petitions follow, each structured as "when X happens, and they pray toward this temple, then hear from heaven and forgive/act." The petitions move from individual sin to national catastrophe to the foreigner\'s prayer — expanding the temple\'s reach from Israel to all nations. The sixth petition (vv.41–43) is extraordinary: Solomon prays for the non-Israelite who comes to pray at the temple, "so that all the peoples of the earth may know your Name." The temple is designed from its inception as a house of prayer for all nations.',
            'cross': [
                ('2 Chr 7:14', '"If my people, who are called by my name, will humble themselves and pray... then I will hear from heaven." God\'s response to Solomon\'s prayer — the most quoted verse from this entire narrative.'),
                ('Dan 6:10', 'Daniel prayed "toward Jerusalem" — exactly the practice Solomon\'s prayer establishes. The temple\'s orientation function survived even in exile.'),
                ('Isa 56:7', '"My house will be called a house of prayer for all nations." Jesus quotes this when cleansing the temple (Mark 11:17) — the fulfilment of Solomon\'s sixth petition.'),
            ],
            'macarthur': [
                ('8:23', 'MacArthur: Solomon begins by praising God\'s uniqueness: "There is no God like you in heaven above or on earth below." Theology precedes petition. Before asking, Solomon worships. This is the pattern Christ teaches: "Our Father... hallowed be your name" before "give us this day."'),
                ('8:27', 'MacArthur: "The heavens, even the highest heaven, cannot contain you. How much less this temple I have built!" Solomon\'s greatest theological statement — the builder of the most magnificent temple in the ancient world declares it inadequate to contain God. This is the corrective to all religious architecture: God is always greater than any building.'),
                ('8:41', 'MacArthur: The prayer for the foreigner is remarkable. Solomon explicitly asks God to hear non-Israelites who pray toward the temple, "so that all the peoples of the earth may know your Name." The temple is missionary from its dedication day.'),
                ('8:46', 'MacArthur: "There is no one who does not sin" — Solomon\'s realism grounds the prayer. The temple\'s ministry of forgiveness presupposes universal human sinfulness. This is not pessimism but honesty — the same honesty Paul articulates in Romans 3:23.'),
            ],
            'wiseman': [
                ('8:22', 'Wiseman: Solomon\'s posture — standing before the altar with hands spread toward heaven — matches depictions of royal prayer in Assyrian and Babylonian reliefs. The gesture of open hands signifies both supplication and receptivity. ANE kings regularly prayed publicly at temple dedications.'),
                ('8:37', 'Wiseman: The catalogue of calamities (drought, famine, plague, blight, locusts, siege) matches documented disasters in ANE records. The Assyrian Eponym Chronicle and Babylonian chronicles record precisely these catastrophes. Solomon\'s prayer addresses real, historically attested threats.'),
            ],
            'provan': [
                ('8:27', 'Provan: Solomon\'s "How much less this temple" is the Deuteronomistic theology of the Name in its purest expression. God is not in the temple; God\'s Name is. The Name gives access without implying containment. This theology prevents the temple from becoming an idol while preserving its function as a place of encounter.'),
                ('8:41', 'Provan: The foreigner petition (vv.41–43) breaks the boundaries of ethnic religion. Solomon envisions the temple as a place where any human being — regardless of nationality — can approach Israel\'s God and be heard. This is the Abrahamic promise (Gen 12:3) built into the temple\'s liturgical architecture.'),
            ],
            'calvin': [
                ('8:27', 'Calvin: Solomon confesses God\'s transcendence at the moment of his greatest architectural achievement. This is true wisdom: the more we build for God, the more we recognise that God surpasses all our building. Our finest efforts are a child\'s drawing compared to the reality of divine majesty.'),
                ('8:46', 'Calvin: "There is no one who does not sin." Solomon does not exempt himself or his successors. The temple\'s entire ministry presupposes human failure. Grace is not the exception in God\'s economy; it is the foundation. Every prayer of confession spoken in the temple rests on this bedrock realism.'),
            ],
            'netbible': [
                ('8:27', 'NET Note: <em>hinnēh haššāmayim ûšĕmê haššāmayim lōʾ yĕkalkĕlûkā</em> (the heavens and the highest heavens cannot contain you) — the construction <em>šĕmê haššāmayim</em> (heaven of heavens) is a superlative, denoting the uttermost reaches of the cosmos. Even the totality of created space is insufficient for God.'),
                ('8:46', 'NET Note: <em>kî ʾên ʾādām ʾăšer lōʾ-yeḥĕṭāʾ</em> (there is no person who does not sin) — a universal negative statement. The construction <em>ʾên... ʾăšer lōʾ</em> (there is not... who does not) is an emphatic double negative asserting total human sinfulness. Cf. Eccl 7:20; Rom 3:23.'),
            ],
        },
        {
            'header': 'Verses 54–66 — The Blessing, the Sacrifices, and the People Dismissed with Joy',
            'verses': verse_range(54, 66),
            'heb': [
                ('wayĕbārek', 'vayevarech', 'he blessed', 'Solomon blesses the assembly (v.55) standing — having risen from his knees. The king functions as both worshipper (kneeling in prayer) and mediator (standing to bless). The dual posture captures the king\'s role: he intercedes before God and pronounces blessing on God\'s behalf.'),
                ('śĕmēḥîm wĕṭôbê lēb', 'semechim vetovei lev', 'joyful and glad of heart', 'The people go home "joyful and glad of heart" (v.66) — the signature vocabulary of covenant blessing. The dedication is not solemn austerity but overwhelming joy. Israel has never been closer to God, and the appropriate response is celebration.'),
            ],
            'ctx': 'The dedication concludes with the largest sacrifice in Israel\'s history: 22,000 cattle and 120,000 sheep and goats. The bronze altar cannot contain the volume, so the entire courtyard is consecrated as sacred space (v.64). The celebration lasts fourteen days — a double week, the seven-day festival plus seven additional days. Then Solomon sends the people home "joyful and glad of heart for all the good things the LORD had done for his servant David and his people Israel." The final words link back to the Davidic covenant: everything culminates in God\'s faithfulness to David\'s line.',
            'cross': [
                ('2 Chr 7:1–3', 'The Chronicler adds that fire came down from heaven and consumed the burnt offering — the same divine fire that validated the tabernacle (Lev 9:24). Heaven ratifies the temple as it ratified the tabernacle.'),
                ('Neh 8:10', '"The joy of the LORD is your strength." The same covenant joy that sends Solomon\'s Israel home characterises Ezra\'s community when the law is read after the exile. Joy is the fruit of encountering God.'),
            ],
            'macarthur': [
                ('8:56', 'MacArthur: "Not one word has failed of all the good promises he gave through his servant Moses." Solomon\'s testimony is a vindication of divine faithfulness. Every promise — land, rest, presence, blessing — has been fulfilled. This is the high-water mark of Old Testament covenant history.'),
                ('8:60', 'MacArthur: "So that all the peoples of the earth may know that the LORD is God and that there is no other." The temple\'s purpose extends beyond Israel. God\'s dwelling in Jerusalem is meant to be a witness to the entire world.'),
                ('8:61', 'MacArthur: "But your hearts must be fully committed to the LORD our God." Even at the moment of greatest blessing, Solomon calls for complete devotion. The danger of prosperity is complacency. Solomon preaches what he will eventually fail to practice.'),
                ('8:66', 'MacArthur: The people leave "joyful and glad of heart." This is the emotional texture of covenant faithfulness — not grim duty but overflowing happiness. When God\'s people live in God\'s presence under God\'s blessing, the result is deep, settled joy.'),
            ],
            'wiseman': [
                ('8:63', 'Wiseman: The scale of sacrifice (22,000 cattle, 120,000 sheep) finds parallels in Assyrian temple dedication inscriptions. Ashurnasirpal II\'s dedication of the Northwest Palace at Nimrud (879 BC) involved similarly vast numbers of animals, suggesting both accounts reflect genuine ANE royal dedication practice.'),
                ('8:65', 'Wiseman: "From Lebo Hamath to the Wadi of Egypt" — the traditional boundary formula for Israel\'s maximum territorial extent (cf. Num 34:8; 2 Kgs 14:25). Solomon\'s Israel, at this moment, controls the promised land in its fullest dimensions.'),
            ],
            'provan': [
                ('8:56', 'Provan: Solomon\'s declaration that "not one word has failed" is the narrator\'s theological verdict on the era. Everything God promised has been delivered. The temple stands; the glory fills it; the people celebrate. The question that drives the rest of the narrative is: will this fulfilment endure?'),
                ('8:66', 'Provan: The joy of v.66 is the last unambiguously positive note in Solomon\'s narrative. After this, shadows begin: the conditional warning (9:1–9), the Hiram dispute (9:10–14), and the gradual slide toward ch. 11\'s apostasy. The narrator captures the joy precisely because it will not last.'),
            ],
            'calvin': [
                ('8:56', 'Calvin: "Not one word has failed." Let every believer take this as personal assurance: what God has promised, God will perform. Our doubts do not diminish his faithfulness. Our circumstances do not alter his commitments. Every promise will be fulfilled in its time.'),
                ('8:66', 'Calvin: The people\'s joy is not manufactured emotion but the natural overflow of experienced grace. When God\'s presence is real and his blessings are tangible, joy is not commanded — it erupts. The church should examine itself: if joy is absent, perhaps God\'s presence is being sought too little.'),
            ],
            'netbible': [
                ('8:63', 'NET Note: The <em>šĕlāmîm</em> (fellowship/peace offerings) were the only sacrifice where the worshipper ate the meat. The 142,000 animals represent not just an offering to God but a massive communal feast — the entire nation eating together in God\'s presence.'),
                ('8:66', 'NET Note: <em>śĕmēḥîm wĕṭôbê lēb</em> (joyful and good of heart) combines two terms for happiness. <em>śāmēaḥ</em> is outward, visible joy; <em>ṭôb lēb</em> is deep inner contentment. The dedication produces both — visible celebration and settled gratitude.'),
            ],
        },
    ],
})



# ─────────────────────────────────────────────────────────────────────────────
# 1KI-3: Chapters 9–12 — Zenith to Fracture: Glory, Apostasy, Division
# ─────────────────────────────────────────────────────────────────────────────

ki1(9, {
    'title': 'God\'s Second Appearance; Cities, Fleet, and Foreign Labour',
    'sections': [
        {
            'header': 'Verses 1–9 — The LORD Appears Again: If You Turn Aside, This House Becomes Ruins',
            'verses': verse_range(1, 9),
            'heb': [
                ('hiqḏaštî', 'hikdashti', 'I have consecrated', 'God says "I have consecrated this temple by putting my Name there forever" (v.3). The verb <em>qāḏaš</em> (hiphil: to make holy) indicates permanent divine investment. Yet vv.6–9 immediately condition the temple\'s future on obedience. Even sacred space can become profane through unfaithfulness.'),
                ('māšāl', 'mashal', 'byword/proverb', 'If Israel turns away, "this temple will become a heap of ruins. All who pass by will be appalled and will hiss and say, \'Why has the LORD done this?\'" (vv.8–9). The temple will become a <em>māšāl</em> — a cautionary tale for the nations. The very building meant to attract the nations to God (8:41–43) will instead repel them.'),
            ],
            'ctx': 'God\'s second appearance to Solomon is the theological counterweight to the dedication. Where ch. 8 was all glory and promise, ch. 9 is warning. God accepts the temple but attaches a condition: if you or your sons turn aside, I will reject this temple. The warning is prophetically specific — "this temple will become a heap of ruins" — exactly what happens in 586 BC. The narrator places this warning immediately after the dedication to show that Israel\'s future was never guaranteed by architecture. Buildings don\'t save; covenant faithfulness does.',
            'cross': [
                ('Deut 28:37', '"You will become a thing of horror, a byword among all the nations." God\'s warning to Solomon echoes the Deuteronomic curse formula precisely.'),
                ('2 Kgs 25:8–10', 'Nebuzaradan burned the temple — the fulfilment of this warning, 370 years later.'),
                ('Jer 7:4', '"Do not trust in deceptive words and say, \'This is the temple of the LORD.\'" Jeremiah confronts the same false confidence that God warns against here.'),
            ],
            'macarthur': [
                ('9:3', 'MacArthur: God accepts the temple by putting his Name there "forever" — but the very next verse introduces "if." The unconditional commitment to the Name coexists with conditional blessing for the people. God\'s faithfulness to his Name does not override human responsibility.'),
                ('9:4', 'MacArthur: "Walk before me faithfully as David your father did" — David is the standard, despite his sins. David\'s faithfulness was not sinlessness but wholehearted devotion and repentance. God measures kings not by perfection but by the orientation of their hearts.'),
                ('9:7', 'MacArthur: "I will reject this temple I have consecrated for my Name" — the most shocking threat in the OT. God will abandon his own house if his people abandon him. No institution, no building, no tradition is immune from divine judgment.'),
                ('9:9', 'MacArthur: The nations will explain Israel\'s ruin theologically: "Because they forsook the LORD their God." God\'s judgment is self-interpreting. Even pagans will understand the connection between apostasy and disaster.'),
            ],
            'wiseman': [
                ('9:3', 'Wiseman: Temple dedication texts from Mesopotamia similarly record divine acceptance after construction. The Gudea cylinders (c.2100 BC) describe the god Ningirsu\'s approval of his new temple. The pattern — build, dedicate, receive divine approval — is standard ANE practice; the conditional warning is distinctly Israelite.'),
                ('9:8', 'Wiseman: "This temple will become a heap of ruins" — the Hebrew <em>ʿelyôn</em> may alternatively be read as "conspicuous" rather than "exalted," yielding "this conspicuous temple will cause astonishment." Either reading conveys devastating reversal.'),
            ],
            'provan': [
                ('9:4', 'Provan: The "if" of v.4 is the hinge of the entire book. Everything before it pointed toward fulfilment; everything after it describes the failure to meet the condition. The narrator places this conditional warning at the exact centre of the Solomon narrative — after the temple is built, before the decline begins.'),
                ('9:9', 'Provan: The nations\'explanation — "Because they forsook the LORD" — is the Deuteronomistic theology of history stated by outsiders. Even non-Israelites can read the theological logic of blessing and curse. The pattern is universally legible.'),
            ],
            'calvin': [
                ('9:3', 'Calvin: God consecrates the temple by placing his Name there — yet warns of its destruction in the same breath. This teaches that no external privilege guarantees spiritual security. Baptism, church membership, ordained ministry — all can be withdrawn if faith is abandoned.'),
                ('9:7', 'Calvin: "I will reject this temple" — let no church imagine itself immune from God\'s judgment. Churches have been planted and uprooted throughout history. The lamp can be removed from its stand (Rev 2:5). Only repentance preserves what grace has built.'),
            ],
            'netbible': [
                ('9:3', 'NET Note: <em>hiqḏaštî ʾet-habbayit hazzeh</em> (I have consecrated this house) — the hiphil of <em>qāḏaš</em> indicates God\'s active sanctification. The temple is holy not because of its materials or architecture but because God chose to invest his Name there.'),
                ('9:8', 'NET Note: The Kethib (written text) reads <em>ʿelyôn</em> (exalted/high); the Qere (read text) suggests <em>ʿiyyîn</em> (a heap of ruins). The textual variants both convey devastation: the "exalted" temple becomes an object of horror, or the temple literally becomes rubble.'),
            ],
        },
        {
            'header': 'Verses 10–28 — Twenty Cities, Forced Labour, and the Fleet at Ophir',
            'verses': verse_range(10, 28),
            'heb': [
                ('ʿebed Šĕlōmōh', 'eved Shelomoh', 'Solomon\'s servants', 'The Canaanite remnant populations (v.21) become permanent <em>ʿebed</em> (slaves/servants) — a standing corvée that continues "to this day." Solomon solves the forced-labour problem by exempting Israelites (v.22) and imposing permanent servitude on non-Israelites. The ethical complexity is left unresolved by the narrator.'),
            ],
            'ctx': 'The second half of ch. 9 reveals the underside of Solomon\'s prosperity. Hiram is dissatisfied with the twenty cities Solomon gave him (v.13) — calling them "Cabul" (perhaps "worthless"). Solomon builds with forced labour from conquered populations. The fleet at Ezion-geber brings 420 talents of gold from Ophir. The prosperity is real but the methods are increasingly coercive. The narrator presents both the achievement and the cost without explicit judgment — the reader must weigh them.',
            'cross': [
                ('1 Kgs 12:4', '"Your father put a heavy yoke on us." The forced-labour system of 9:15–22 is the root cause of the secession in ch. 12.'),
                ('2 Chr 8:1–2', 'The Chronicler reverses the Cabul story: Hiram gave cities to Solomon, who rebuilt them. The different perspectives may reflect different stages of a diplomatic exchange.'),
            ],
            'macarthur': [
                ('9:13', 'MacArthur: Hiram\'s dissatisfaction with the cities reveals that even great alliances have friction. Solomon\'s generosity has limits, and Hiram\'s expectations exceed what he receives. International relationships, even in Israel\'s golden age, are imperfect.'),
                ('9:15', 'MacArthur: Solomon\'s building projects — temple, palace, Millo, wall, Hazor, Megiddo, Gezer — represent both achievement and burden. Every monument required labour, taxation, and material. Greatness has a price.'),
                ('9:22', 'MacArthur: Solomon exempts Israelites from permanent slavery but imposes it on Canaanite remnants. The ethical distinction made here will be debated across the centuries. The narrator does not celebrate or condemn — he reports.'),
                ('9:28', 'MacArthur: 420 talents of gold from Ophir (about 16 tons) demonstrates the scale of Solomon\'s commercial empire. The wealth is staggering but it creates dependency on trade networks that will collapse when the kingdom divides.'),
            ],
            'wiseman': [
                ('9:15', 'Wiseman: Archaeological excavations at Hazor, Megiddo, and Gezer have uncovered monumental six-chambered gate structures of remarkably similar design, all dated to the 10th century BC. These are consistent with centralised Solomonic construction. Yigael Yadin\'s excavations at Hazor (1955–58) first identified this architectural pattern.'),
                ('9:26', 'Wiseman: Ezion-geber (modern Tell el-Kheleifeh near Aqaba) was excavated by Nelson Glueck (1938–40), who identified copper-smelting facilities he attributed to Solomon. Later reinterpretation has questioned the smelting identification but confirmed the site\'s importance as a Red Sea port.'),
            ],
            'provan': [
                ('9:13', 'Provan: The Cabul episode introduces a sour note into the Solomon-Hiram relationship. The great alliance of ch. 5 is showing strain. The narrator does not idealise diplomatic relationships — even the best partnerships involve disappointment and negotiation.'),
                ('9:22', 'Provan: The distinction between Israelite soldiers and Canaanite slaves is the narrator\'s way of showing that Solomon\'s Israel has become an empire — with all the moral complexities that empire entails. The liberated people now maintain a servant class. The irony is quiet but unmistakable.'),
            ],
            'calvin': [
                ('9:15', 'Calvin: Solomon\'s extensive building demonstrates that prosperity brings responsibility. Wealth is not for hoarding but for building — infrastructure, defence, worship. But the moment building serves pride rather than purpose, it becomes a snare.'),
                ('9:26', 'Calvin: The Ophir fleet shows Solomon\'s reach extending to the ends of the known world. God\'s blessing on obedience has tangible, material dimensions. Yet all this wealth will prove unable to prevent the kingdom\'s collapse when obedience fails.'),
            ],
            'netbible': [
                ('9:13', 'NET Note: <em>ʾereṣ kābûl</em> — the meaning of "Cabul" is debated. Josephus (Ant. 8.5.3) derives it from a Phoenician word meaning "displeasing." Others connect it to <em>kĕbûlāh</em> (boundary/pledge). Either way, Hiram\'s naming expresses dissatisfaction.'),
                ('9:15', 'NET Note: <em>millôʾ</em> (Millo) is an architectural term meaning "filling" — probably a terraced stone fill supporting the expanded city platform. Archaeological evidence for stepped-stone terracing in the City of David may correspond to the Millo.'),
            ],
        },
    ],
})

ki1(10, {
    'title': 'The Queen of Sheba; Solomon\'s Unmatched Wealth',
    'sections': [
        {
            'header': 'Verses 1–13 — The Queen of Sheba: Nothing Was Hidden from the King',
            'verses': verse_range(1, 13),
            'heb': [
                ('ḥîdôt', 'chidot', 'riddles/hard questions', 'The queen tests Solomon with <em>ḥîdôt</em> (v.1) — the same term used for Samson\'s riddle (Judg 14:12). These are not trivial puzzles but probing questions of wisdom, governance, and theology. The exchange is an intellectual contest between two royal courts, and Solomon prevails completely.'),
                ('rûaḥ', 'ruach', 'spirit/breath', 'The queen says "there was no more <em>rûaḥ</em> in her" (v.5) — she was breathless, overwhelmed. The same word means spirit, wind, breath. Solomon\'s wisdom literally takes her breath away.'),
            ],
            'ctx': 'The Queen of Sheba visit is the narrative apex of Solomon\'s international reputation. She comes from the ends of the earth (likely modern Yemen/Ethiopia) to test his wisdom with hard questions — and he answers every one. Her response is threefold: breathlessness at his wisdom, amazement at his prosperity, and a theological confession: "Praise be to the LORD your God, who has delighted in you" (v.9). A foreign queen acknowledges YHWH as the source of Solomon\'s greatness. This is the Abrahamic promise in action: all nations blessed through Abraham\'s seed. Jesus cites this visit as a rebuke to his generation: "The Queen of the South will rise at the judgment... for she came from the ends of the earth to listen to Solomon\'s wisdom, and now something greater than Solomon is here" (Matt 12:42).',
            'cross': [
                ('Matt 12:42', 'Jesus cites the Queen of Sheba as a Gentile who recognised wisdom — condemning those who reject greater wisdom standing before them.'),
                ('Gen 12:3', '"All peoples on earth will be blessed through you." The queen\'s visit fulfils the Abrahamic promise: a foreign ruler blessed through Israel\'s king.'),
            ],
            'macarthur': [
                ('10:1', 'MacArthur: The Queen of Sheba represents the nations drawn to God\'s wisdom through Israel. Her journey from the ends of the earth demonstrates that divine wisdom is universally attractive — it crosses every cultural and geographical boundary.'),
                ('10:5', 'MacArthur: Her breathlessness encompasses everything: wisdom, wealth, the burnt offerings at the temple. The total effect of Solomon\'s kingdom — intellectual, material, and spiritual — overwhelms her. This is the integrated witness of a covenant-faithful society.'),
                ('10:9', 'MacArthur: The queen praises YHWH, not Solomon. She recognises the divine source of his wisdom. A Gentile queen makes a better theologian than many in Israel who take God\'s gifts for granted.'),
                ('10:13', 'MacArthur: Solomon gives the queen "all she desired" — royal generosity that mirrors God\'s own. The wise king reflects the generous God. Grace flows downward from the throne.'),
            ],
            'wiseman': [
                ('10:1', 'Wiseman: Sheba (Sabaʾ) was a kingdom in southwestern Arabia (modern Yemen) known for frankincense, gold, and precious stones — exactly the gifts the queen brings. Sabaean inscriptions from the 8th century BC onward confirm a wealthy trading civilisation. The queen\'s journey (~1,200 miles) would have taken several months by camel caravan.'),
                ('10:10', 'Wiseman: The 120 talents of gold (approximately 4.5 tons) is the largest single diplomatic gift recorded in the OT. Comparable gifts are attested in Assyrian tribute lists and Egyptian records of foreign offerings to the pharaoh.'),
            ],
            'provan': [
                ('10:1', 'Provan: The Sheba narrative is the peak of the Solomon story — the moment when all the promises converge. Wisdom (ch. 3), wealth (ch. 4), temple (chs. 5–8), and international fame all culminate in a foreign queen confessing YHWH\'s goodness. The narrator places this peak here because the fall begins in the very next chapter.'),
                ('10:9', 'Provan: The queen\'s confession is carefully theological: God placed Solomon on the throne "because of the LORD\'s eternal love for Israel." She credits not Solomon\'s merit but God\'s love. Even a pagan understands what Solomon will forget.'),
            ],
            'calvin': [
                ('10:1', 'Calvin: The queen\'s long journey teaches that true wisdom is worth any effort to obtain. She crossed deserts for Solomon\'s wisdom; how much more should we seek the wisdom of Christ, who is greater than Solomon?'),
                ('10:9', 'Calvin: A pagan queen praises Israel\'s God — a rebuke to every Israelite who takes covenant blessings for granted. Those outside the faith sometimes see God\'s goodness more clearly than those within it.'),
            ],
            'netbible': [
                ('10:1', 'NET Note: <em>šēm YHWH</em> (the name of the LORD) — the queen came because of the reputation of God\'s Name, not merely Solomon\'s fame. The temple\'s purpose (8:41–43) — drawing foreigners to pray to YHWH — is already being realised through Solomon\'s wisdom.'),
                ('10:5', 'NET Note: <em>wĕlōʾ-hāyāh bāh ʿôd rûaḥ</em> (there was no more spirit/breath in her) — the same idiom appears in Josh 2:11 and 5:1 where Canaanites lose heart at Israel\'s approach. The queen\'s response is the positive counterpart: not fear but wonder.'),
            ],
        },
        {
            'header': 'Verses 14–29 — 666 Talents of Gold; the Ivory Throne; Horses from Egypt',
            'verses': verse_range(14, 29),
            'heb': [
                ('šēš mēʾôt šiššîm wāšēš', 'shesh meot shishim vashesh', 'six hundred sixty-six', 'Solomon\'s annual gold income is 666 talents (v.14) — a number that later appears in Rev 13:18. Whether the echo is intentional or coincidental, the accumulation of wealth at this scale crosses into excess. The narrator catalogues it without celebration: gold shields, ivory throne, gold cups, gold everywhere. The abundance becomes oppressive.'),
            ],
            'ctx': 'The wealth catalogue reads like a fever dream of gold. 666 talents annually. 200 large shields of hammered gold. 300 small shields. A great ivory throne overlaid with gold, flanked by lions. All drinking vessels of pure gold — "nothing was made of silver, because silver was considered of little value" (v.21). Ships bring gold, silver, ivory, apes, and baboons every three years. The narrator piles detail upon detail until the reader feels the weight. Then the final note: Solomon acquires horses and chariots from Egypt and exports them to the Hittites and Arameans (vv.28–29). This directly violates Deut 17:16: "The king must not acquire great numbers of horses for himself or make the people return to Egypt to get more." The seeds of apostasy are being sown in the very prosperity that wisdom produced.',
            'cross': [
                ('Deut 17:16–17', '"The king must not acquire great numbers of horses... He must not take many wives... He must not accumulate large amounts of silver and gold." Solomon violates all three Deuteronomic restrictions — horses (10:26–29), wives (11:1–3), and gold (10:14–22).'),
                ('Rev 13:18', '"The number of the beast is 666." Whether an intentional allusion to Solomon\'s gold or not, the number links excessive wealth to spiritual danger.'),
            ],
            'macarthur': [
                ('10:14', 'MacArthur: 666 talents of gold — approximately 25 tons annually. The wealth is real and God-given. But the Deuteronomic law explicitly prohibits the king from accumulating excessive gold (Deut 17:17). Solomon\'s blessings are becoming his temptations.'),
                ('10:21', 'MacArthur: "Nothing was made of silver, because silver was considered of little value." The abundance has distorted all sense of value. When silver becomes worthless, something has gone wrong. Excess corrodes gratitude.'),
                ('10:26', 'MacArthur: "Solomon accumulated chariots and horses" — the exact prohibition of Deut 17:16. The horses come from Egypt — the land of slavery. The king who was to embody Torah is systematically violating it.'),
                ('10:29', 'MacArthur: Solomon becomes an arms dealer — exporting chariots to the Hittites and Arameans. The king of wisdom is now the merchant of military power. The trajectory from temple builder to arms trader is the arc of decline.'),
            ],
            'wiseman': [
                ('10:22', 'Wiseman: The "ships of Tarshish" (v.22) were large, ocean-going vessels capable of extended voyages. The term may indicate ships of the Tarshish class (large merchant vessels) rather than ships sailing to a specific destination. Three-year round trips match the Red Sea/Indian Ocean trade routes to East Africa or western India.'),
                ('10:28', 'Wiseman: Egyptian horse-breeding was centred in the Nile Delta. Assyrian records confirm that Musri (Egypt/Cilicia) was a major source of horses for Near Eastern armies. The price data (600 shekels per chariot, 150 per horse) provides rare ANE commercial information.'),
            ],
            'provan': [
                ('10:14', 'Provan: The gold catalogue is the narrator\'s literary technique for conveying excess. By listing item after golden item, he creates a cumulative effect of surfeit. The reader is meant to feel overwhelmed — and then to recall Deut 17\'s prohibitions. The narrator shows rather than tells.'),
                ('10:29', 'Provan: The horse trade with Egypt is the clearest Deuteronomic violation in the chapter. The narrator places it at the chapter\'s end — the final note before ch. 11\'s explicit apostasy. The trade with Egypt is the bridge between material excess and spiritual collapse.'),
            ],
            'calvin': [
                ('10:14', 'Calvin: The accumulation of gold teaches that wealth without wisdom to use it rightly is a curse disguised as a blessing. Solomon has both wisdom and wealth — but the wealth is beginning to outpace the wisdom. When possessions govern the possessor, the downfall has already begun.'),
                ('10:26', 'Calvin: Horses from Egypt — the very nation God freed Israel from. To return to Egypt for military supplies is to undo the Exodus symbolically. Every believer who returns to old patterns of sin for comfort or security is making the same journey.'),
            ],
            'netbible': [
                ('10:14', 'NET Note: The figure of 666 talents represents an enormous sum — roughly $1.1 billion in modern gold value. This does not include trade profits, tribute, and tax revenue mentioned in v.15. Solomon\'s total annual income dwarfed any contemporary Near Eastern kingdom.'),
                ('10:22', 'NET Note: The cargo list — gold, silver, ivory, apes, and baboons (<em>qōpîm wĕtukiyyîm</em>) — suggests trade routes to East Africa (Somalia/Ethiopia) or western India. The exotic cargo demonstrates the global reach of Solomon\'s commercial network.'),
            ],
        },
    ],
})

ki1(11, {
    'title': 'Solomon\'s Apostasy: Foreign Wives, Adversaries, and the Kingdom Torn',
    'sections': [
        {
            'header': 'Verses 1–25 — Seven Hundred Wives Turn Solomon\'s Heart; God Raises Adversaries',
            'verses': verse_range(1, 25),
            'heb': [
                ('nāšîm nokriyyôt', 'nashim nochriyot', 'foreign women', 'Solomon loved many <em>nāšîm nokriyyôt</em> (v.1) — the exact category Deuteronomy forbids for kings (Deut 17:17) and that Proverbs repeatedly warns against (Prov 2:16; 5:20; 7:5). The irony is devastating: the author of Proverbs falls victim to the very sin he warned his son about.'),
                ('wayyaṭ ʾet-lĕbābô', 'vayat et-levavo', 'they turned his heart', '"His wives turned his heart after other gods" (v.4) — the verb <em>nāṭāh</em> (to turn, incline, bend) describes a gradual process, not a sudden collapse. Solomon\'s apostasy was not a single dramatic act but a slow erosion of devotion over decades.'),
            ],
            'ctx': 'Chapter 11 is the most devastating chapter in 1 Kings. The wisest man who ever lived, who built God\'s temple, who prayed the greatest prayer in the OT — turns to other gods. Seven hundred wives and three hundred concubines from forbidden nations turn his heart to Ashtoreth (Sidonian), Chemosh (Moabite), and Molek (Ammonite). The narrator uses the word "heart" five times — the same heart that asked for wisdom at Gibeon (3:9) now follows other gods. God responds by raising three adversaries: Hadad the Edomite, Rezon of Damascus, and Jeroboam son of Nebat. The divine discipline is precise: the kingdom that Solomon\'s wisdom unified will be torn apart by the adversaries his sin provoked.',
            'cross': [
                ('Deut 17:17', '"He must not take many wives, or his heart will be led astray." The Deuteronomic warning is fulfilled word for word.'),
                ('Neh 13:26', '"Was it not because of marriages like these that Solomon king of Israel sinned?" Nehemiah cites Solomon as the canonical example of foreign-wife apostasy.'),
                ('Prov 5:3–5', '"For the lips of the adulterous woman drip honey... but in the end she is bitter as gall." Solomon\'s own wisdom, tragically unheeded by its author.'),
            ],
            'macarthur': [
                ('11:1', 'MacArthur: "King Solomon loved many foreign women." The verse opens with the same verb (<em>ʾāhab</em>) used of his love for God (3:3). The competition for Solomon\'s heart is stated in identical terms: he loved God; he loved foreign women. The heart cannot serve two masters.'),
                ('11:4', 'MacArthur: "As Solomon grew old, his wives turned his heart after other gods." Age did not bring deeper faith but deeper compromise. The greatest danger for the believer is not sudden temptation but gradual erosion — the slow drift that decades of comfort enable.'),
                ('11:7', 'MacArthur: Solomon built high places for Chemosh and Molek — gods whose worship included child sacrifice. The temple builder became a shrine builder for demons. The descent from Gibeon\'s prayer to Molek\'s altar is the steepest fall in Scripture.'),
                ('11:14', 'MacArthur: "Then the LORD raised up against Solomon an adversary" — the same God who gave peace (5:4) now raises enemies. The adversaries are instruments of divine discipline. God uses political opposition to chasten spiritual rebellion.'),
            ],
            'wiseman': [
                ('11:1', 'Wiseman: Diplomatic marriages were standard ANE practice for sealing alliances. Egyptian, Hittite, and Mesopotamian kings maintained large harems for political reasons. But Solomon\'s 700 wives far exceeds documented royal harems. Ashurnasirpal II had hundreds but not thousands. The number signals excess even by ANE standards.'),
                ('11:7', 'Wiseman: Chemosh was the national deity of Moab (attested on the Mesha Stele, c.840 BC). Molek (Milcom) was an Ammonite deity associated with fire rituals. The high places on the "hill east of Jerusalem" (the Mount of Olives) would have been visible from the temple itself — a deliberate affront.'),
            ],
            'provan': [
                ('11:1', 'Provan: The narrator constructs ch. 11 as the mirror-image of ch. 3. In ch. 3, Solomon loved God "except" for the high places. In ch. 11, his heart is no longer fully devoted — the "except" has consumed the whole. The flaw that was tolerable in youth has become fatal in old age.'),
                ('11:4', 'Provan: "His heart was not fully devoted to the LORD his God, as the heart of David his father had been." The comparison with David is the Deuteronomistic standard. David sinned grievously but always returned. Solomon drifted and never returned. The difference is not in the magnitude of sin but in the direction of the heart.'),
            ],
            'calvin': [
                ('11:1', 'Calvin: Solomon\'s fall teaches that no degree of past blessing guarantees future faithfulness. Wisdom received is not wisdom retained. The greatest gifts require the greatest vigilance, for the higher the position, the more catastrophic the fall.'),
                ('11:7', 'Calvin: Building shrines to Molek — the god of child sacrifice — on the hill facing the temple is an act of breathtaking spiritual violence. The man who built God\'s house now builds houses for his enemies. Sin does not merely subtract from devotion; it actively constructs alternatives.'),
            ],
            'netbible': [
                ('11:2', 'NET Note: <em>min-haggôyim ʾăšer ʾāmar-YHWH</em> (from the nations about which the LORD said) — the narrator explicitly cites the Deuteronomic prohibition. This is not ambiguous: Solomon\'s marriages violate a specific, known divine command.'),
                ('11:4', 'NET Note: <em>lĕbābô lōʾ-hāyāh šālēm ʿim-YHWH</em> (his heart was not fully with the LORD) — <em>šālēm</em> (complete, whole, at peace) is the adjective from the same root as <em>šālôm</em> and <em>Šĕlōmōh</em> (Solomon). The man whose name means "peace/wholeness" is no longer whole with God. The irony is built into his name.'),
            ],
        },
        {
            'header': 'Verses 26–43 — Ahijah Tears the Cloak: Ten Tribes for Jeroboam; Solomon Dies',
            'verses': verse_range(26, 43),
            'heb': [
                ('qāraʿ', 'qara', 'to tear', 'Ahijah tears the new cloak into twelve pieces and gives Jeroboam ten (vv.30–31) — an <em>ôt</em> (enacted prophecy / sign-act). The physical tearing symbolises what God will do to the kingdom. Tearing a garment was a recognised prophetic action (cf. 1 Sam 15:27–28). The prophecy is both prediction and divine sentence.'),
                ('nēr', 'ner', 'lamp', 'God preserves one tribe for David\'s sake — "so that David my servant may always have a <em>nēr</em> before me in Jerusalem" (v.36). The lamp is the Davidic dynasty, kept burning even in judgment. The covenant with David is not revoked but reduced: the dynasty continues, but over one tribe instead of twelve.'),
            ],
            'ctx': 'Ahijah\'s prophecy to Jeroboam is one of the most dramatic enacted prophecies in the OT. He meets Jeroboam alone in a field, tears his new cloak into twelve pieces, and gives ten to Jeroboam — ten tribes will be his. But one tribe remains with David\'s house "for the sake of David my servant and for the sake of Jerusalem." The prophecy is both judgment (the kingdom torn) and grace (the lamp preserved). Solomon tries to kill Jeroboam, who flees to Egypt until Solomon\'s death. The chapter closes with the standard formula: Solomon reigned 40 years. The wisest king dies under God\'s discipline, and his kingdom is about to shatter.',
            'cross': [
                ('1 Sam 15:27–28', 'Saul\'s robe torn by Samuel — the first enacted tearing prophecy. "The LORD has torn the kingdom of Israel from you today." Ahijah\'s action deliberately echoes Samuel\'s.'),
                ('2 Sam 7:14–16', '"When he does wrong, I will punish him... But my love will never be taken away from him." The Davidic covenant promises discipline but not abandonment. One tribe preserved is the covenant kept.'),
                ('1 Kgs 12:15', '"This turn of events was from the LORD, to fulfil the word the LORD had spoken to Jeroboam through Ahijah." The narrator confirms that the political catastrophe of ch. 12 executes the prophetic word of ch. 11.'),
            ],
            'macarthur': [
                ('11:29', 'MacArthur: Ahijah\'s enacted prophecy — tearing the cloak — makes the abstract concrete. The kingdom will be physically, violently divided. Prophetic sign-acts are not mere illustrations but performative declarations: they set divine purposes in motion.'),
                ('11:32', 'MacArthur: "One tribe for the sake of David my servant" — even in judgment, the Davidic covenant is honoured. The lamp is reduced but not extinguished. God\'s faithfulness to his promises survives human unfaithfulness.'),
                ('11:36', 'MacArthur: The "lamp" metaphor for the Davidic dynasty recurs throughout Kings (15:4; 2 Kgs 8:19). The lamp can flicker, dim, nearly go out — but God preserves it. The messianic hope depends on this lamp surviving until Christ.'),
                ('11:43', 'MacArthur: Solomon\'s death notice is terse: he slept with his fathers and was buried in the City of David. No eulogy, no "he did what was right." The silence is the narrator\'s verdict.'),
            ],
            'wiseman': [
                ('11:40', 'Wiseman: Jeroboam\'s flight to Shishak (Shoshenq I) in Egypt places this event in the last decade of Solomon\'s reign (c.940–930 BC). Shoshenq I founded Egypt\'s 22nd Dynasty and would later invade Judah (14:25–26). His willingness to harbour Jeroboam suggests Egyptian interest in destabilising the Israelite monarchy.'),
                ('11:41', 'Wiseman: "The book of the annals of Solomon" is one of three source documents cited in Kings (along with the annals of the kings of Israel and Judah). These were likely official court chronicles maintained by the royal scribes — the <em>sōpēr</em> mentioned in Solomon\'s cabinet (4:3).'),
            ],
            'provan': [
                ('11:31', 'Provan: The tearing of the cloak enacts what Solomon\'s sin has caused. The kingdom is not torn by Jeroboam\'s ambition but by Solomon\'s apostasy. The narrator places the cause (11:1–13) before the effect (11:26–40) to make the theological logic unmistakable: sin causes division.'),
                ('11:36', 'Provan: The lamp metaphor is the Deuteronomistic historian\'s way of expressing eschatological hope within a narrative of decline. The kingdom falls, the kings fail, but the lamp is never extinguished. The entire narrative of Kings is held together by this fragile, persistent flame.'),
            ],
            'calvin': [
                ('11:31', 'Calvin: The tearing of the cloak is a sermon in fabric. God\'s judgments are not hidden but demonstrated — made visible, tangible, public. Let no one imagine that divine discipline operates only in the invisible realm. God\'s hand in history can be seen by those with eyes to see.'),
                ('11:36', 'Calvin: The preserved lamp teaches that God\'s mercy outlasts human sin. Solomon deserved the complete loss of his kingdom. Instead, one tribe is preserved — not for Solomon\'s sake but for David\'s, and ultimately for the sake of the Messiah who would come from David\'s line. Grace plans ahead.'),
            ],
            'netbible': [
                ('11:30', 'NET Note: The garment (<em>śalmāh ḥădāšāh</em>) is specifically "new" — unused, whole, representing the intact kingdom. Its tearing into twelve pieces is a powerful visual: what was whole and new is now fragmented. The Hebrew <em>qāraʿ</em> denotes violent tearing, not cutting.'),
                ('11:36', 'NET Note: <em>nēr</em> (lamp) functions as a metaphor for dynastic continuity — the lamp kept burning in the temple (Exod 27:20) symbolises the perpetual presence of the Davidic house before God. When the lamp metaphor is used for Judah\'s kings, it means the dynasty survives.'),
            ],
        },
    ],
})

ki1(12, {
    'title': 'The Kingdom Divides: Rehoboam\'s Folly and Jeroboam\'s Golden Calves',
    'sections': [
        {
            'header': 'Verses 1–24 — My Little Finger Is Thicker: Rehoboam Rejects the Elders\' Counsel',
            'verses': verse_range(1, 24),
            'heb': [
                ('qāṭonnî', 'katonni', 'my little [finger]', 'Rehoboam\'s boast: "My little finger is thicker than my father\'s waist" (v.10). The Hebrew <em>qāṭonnî</em> likely refers to the little finger, though some scholars read it as a crude anatomical reference. Either way, the boast claims that Rehoboam\'s minimum exceeds Solomon\'s maximum — absurd arrogance from an untested king.'),
                ('ʿaqrabbîm', 'akrabim', 'scorpions', '"My father scourged you with whips; I will scourge you with <em>ʿaqrabbîm</em>" (v.11) — scorpion-tipped whips, multi-lashed instruments of torture. Rehoboam promises not reform but escalation. The young men\'s counsel is governance by intimidation.'),
            ],
            'ctx': 'The Shechem assembly is the political catastrophe that the entire Solomon narrative anticipated. The northern tribes petition for relief from Solomon\'s labour burden. The elders counsel gentleness; the young men counsel brutality. Rehoboam chooses the young men. The narrator adds the theological commentary: "this turn of events was from the LORD, to fulfil the word the LORD had spoken to Jeroboam through Ahijah" (v.15). The political folly is real — Rehoboam genuinely chose badly — but it also executes divine judgment. Human stupidity and divine purpose operate on the same event simultaneously. The kingdom splits: ten tribes follow Jeroboam; Judah and Benjamin remain with Rehoboam.',
            'cross': [
                ('1 Kgs 11:31', 'Ahijah\'s prophecy — ten tribes torn from Solomon\'s house — is fulfilled here precisely. Prophecy stated; ch. 12 delivers.'),
                ('2 Chr 10:15', '"This turn of events was from God." The Chronicler makes the same theological point: the split is divinely orchestrated through human foolishness.'),
                ('Prov 15:1', '"A gentle answer turns away wrath, but a harsh word stirs up anger." Solomon\'s own proverb — ignored by his son.'),
            ],
            'macarthur': [
                ('12:6', 'MacArthur: The elders\'counsel — "If you will be a servant to these people today and serve them" — defines godly leadership as service. The king exists for the people, not the people for the king. This is the principle Jesus restates: "Whoever wants to become great among you must be your servant" (Mark 10:43).'),
                ('12:10', 'MacArthur: The young men\'s counsel is pure machismo — asserting dominance rather than building trust. Their advice replaces service with intimidation. The result is predictable: the people who are threatened with scorpions choose to leave.'),
                ('12:15', 'MacArthur: "This turn of events was from the LORD." God\'s sovereignty does not excuse Rehoboam\'s foolishness. Both truths coexist: Rehoboam freely chose badly, and God used that choice to fulfil his prophetic word. Divine sovereignty operates through, not against, human agency.'),
                ('12:16', 'MacArthur: "What share do we have in David?" — the northern tribes\'secession cry. The Davidic covenant, which should have united the nation, becomes the very point of division. When the king fails, the covenant bond is strained to breaking.'),
            ],
            'wiseman': [
                ('12:1', 'Wiseman: Shechem was a natural location for the assembly — it was the traditional gathering site between north and south (cf. Josh 24), located in Ephraim\'s territory, and carried ancient covenantal associations. Choosing Shechem rather than Jerusalem signalled that the northern tribes would not simply submit to Judahite hegemony.'),
                ('12:18', 'Wiseman: Adoniram (the forced labour overseer from Solomon\'s cabinet, 4:6) is stoned to death — the most violent rejection possible of the corvée system. The man who symbolised Solomon\'s burden becomes the first casualty of the division.'),
            ],
            'provan': [
                ('12:7', 'Provan: The elders understand something Rehoboam does not: authority is relational, not positional. A king who serves earns loyalty; a king who threatens produces rebellion. The narrative is a case study in leadership failure — and its permanent consequences.'),
                ('12:15', 'Provan: The narrator\'s theological comment (v.15) is the Deuteronomistic philosophy of history in a single sentence. Human choices have real consequences AND fulfil divine purposes. The historian holds both truths without resolving the tension — because the tension is the point.'),
            ],
            'calvin': [
                ('12:7', 'Calvin: "If today you will be a servant to these people" — the elders\'counsel defines kingship as servanthood. This is the standard by which every leader, ecclesiastical or civil, should be measured. Power exists for service; when it serves itself, it has already fallen.'),
                ('12:15', 'Calvin: God uses Rehoboam\'s foolishness to accomplish his own purposes. This does not absolve Rehoboam — his pride is genuinely sinful. But God\'s sovereignty is so comprehensive that even human stupidity becomes an instrument of divine justice. Providence wastes nothing.'),
            ],
            'netbible': [
                ('12:10', 'NET Note: <em>qoṭonnî ʿābāh mimmotnê ʾābî</em> — literally "my little-one is thicker than my father\'s loins." The phrase is deliberately provocative, a boast of masculine dominance. The young men\'s rhetoric replaces persuasion with intimidation.'),
                ('12:15', 'NET Note: <em>kî-hāyĕtāh sibbāh mēʿim YHWH</em> (for the turn of events was from the LORD) — <em>sibbāh</em> (turning, cause) indicates divine causation operating through the free decisions of human agents. The Deuteronomistic historian asserts divine sovereignty without denying human responsibility.'),
            ],
        },
        {
            'header': 'Verses 25–33 — Jeroboam\'s Golden Calves at Dan and Bethel',
            'verses': verse_range(25, 33),
            'heb': [
                ('ʿeglê zāhāb', 'eglei zahav', 'calves of gold', 'Jeroboam makes two golden calves (v.28) and uses the identical formula Aaron used at Sinai: "Here are your gods, Israel, who brought you up out of Egypt" (cf. Exod 32:4). The verbal echo is exact and devastating. The narrator makes no editorial comment — the quotation from Exodus is the comment. Jeroboam is not merely sinning; he is re-enacting Israel\'s original apostasy.'),
                ('ḥāṭāʾ', 'chata', 'to sin / cause to sin', '"This thing became a sin" (v.30) — the verb <em>ḥāṭāʾ</em> in the hiphil means "to cause to sin." The calves do not merely represent Jeroboam\'s personal failure but become the mechanism by which all Israel is led into apostasy. This phrase — "the sins of Jeroboam who caused Israel to sin" — will be repeated for every northern king who follows.'),
            ],
            'ctx': 'Jeroboam\'s golden calves are the defining sin of the northern kingdom. His motive is political: if the people go to Jerusalem to sacrifice, their hearts will return to Rehoboam (v.27). So he creates an alternative worship system — golden calves at Dan (northern border) and Bethel (southern border), non-Levitical priests, and a rival feast in the eighth month (one month after Judah\'s Feast of Tabernacles). The calves may represent YHWH\'s throne (not rival gods) — but the effect is the same: worship divorced from the place God chose, conducted by priests God did not appoint, using images God forbade. Every subsequent northern king is evaluated against this baseline: "He did evil... walking in the ways of Jeroboam and his sin, which he had caused Israel to commit."',
            'cross': [
                ('Exod 32:4', '"These are your gods, Israel, who brought you up out of Egypt." Identical formula. The narrator forces the reader to hear the echo of Israel\'s first and worst apostasy.'),
                ('2 Kgs 17:21–23', '"Jeroboam enticed Israel away from following the LORD and caused them to commit a great sin. The Israelites persisted in all the sins of Jeroboam." The Deuteronomistic historian attributes the fall of the northern kingdom directly to Jeroboam\'s calves.'),
                ('Hos 8:5–6', '"Samaria, throw out your calf-idol! My anger burns against them." Hosea, 200 years later, still confronts the same golden calves.'),
            ],
            'macarthur': [
                ('12:26', 'MacArthur: Jeroboam\'s reasoning is political, not theological. He fears losing power if the people worship in Jerusalem. Every religious innovation driven by political calculation rather than divine revelation leads to apostasy. When convenience replaces conviction, the faith is corrupted.'),
                ('12:28', 'MacArthur: The golden calves quote Exodus 32 exactly. Jeroboam knows the history — and repeats it anyway. This is not ignorance but deliberate choice: political survival over theological fidelity. The most dangerous sins are committed with full knowledge.'),
                ('12:31', 'MacArthur: Non-Levitical priests, rival temples, alternative festivals — Jeroboam constructs an entire counterfeit worship system. The counterfeiter does not invent something new; he copies something real with crucial alterations. False religion always mimics true religion.'),
                ('12:33', 'MacArthur: The feast "of his own choosing" in the eighth month — one month after the divinely appointed seventh-month feast. Close enough to feel legitimate, far enough to be rebellion. The most effective deceptions are nearly true.'),
            ],
            'wiseman': [
                ('12:28', 'Wiseman: The calves may have been intended as pedestals for the invisible YHWH — similar to the cherubim above the ark. Bull iconography for deities was widespread in Canaan and the ANE (the Baal/Hadad bull imagery). But the distinction between a pedestal and an idol was too subtle for popular religion, and the calves became objects of worship themselves.'),
                ('12:29', 'Wiseman: Dan (Tell el-Qadi, at the headwaters of the Jordan) and Bethel (Beitin, 12 miles north of Jerusalem) were both ancient cultic sites with pre-Israelite sanctuary traditions. Jeroboam exploited existing sacred associations rather than creating sites from scratch.'),
            ],
            'provan': [
                ('12:28', 'Provan: The Exodus 32 quotation is the narrator\'s most devastating literary technique. By placing Aaron\'s exact words in Jeroboam\'s mouth, he makes the reader\'s judgment instantaneous. No editorial comment is needed. The allusion is the argument.'),
                ('12:30', 'Provan: "This thing became a sin" — the simplest and most damning verdict in Kings. Every subsequent evaluation of northern kings traces back to this sentence. Jeroboam\'s calves become the template against which all northern kingship is measured and found wanting.'),
            ],
            'calvin': [
                ('12:28', 'Calvin: Jeroboam\'s sin teaches that when religion is shaped by political convenience, it ceases to be religion and becomes propaganda. The moment worship serves the state rather than God, it is no longer worship — no matter how elaborate the ritual.'),
                ('12:31', 'Calvin: Counterfeit priests, counterfeit feasts, counterfeit sanctuaries. The thoroughness of Jeroboam\'s alternative system shows how completely religion can be corrupted while retaining outward religious form. External appearance is no guarantee of internal truth.'),
            ],
            'netbible': [
                ('12:28', 'NET Note: <em>hinnēh ʾĕlōhêkā Yiśrāʾēl ʾăšer heʿĕlûkā mēʾereṣ Miṣrāyim</em> — the verbal correspondence with Exod 32:4 is exact. The narrator does not add "as Aaron had said" because the reader is expected to recognise the quotation. The allusion functions as an implicit condemnation.'),
                ('12:31', 'NET Note: <em>bêt bāmôt</em> (house/temple of high places) — Jeroboam does not merely set up open-air altars but constructs actual temple buildings at the high places. He creates a rival institutional religion with permanent infrastructure.'),
            ],
        },
    ],
})



# ─────────────────────────────────────────────────────────────────────────────
# 1KI-4: Chapters 13–16 — Prophets and Kings: Rapid Decline
# ─────────────────────────────────────────────────────────────────────────────

ki1(13, {
    'title': 'The Man of God from Judah; the Old Prophet\'s Deception',
    'sections': [
        {
            'header': 'Verses 1–10 — The Man of God Confronts the Altar at Bethel',
            'verses': verse_range(1, 10),
            'heb': [
                ('ʾîš hāʾĕlōhîm', 'ish haElohim', 'man of God', 'The anonymous prophet from Judah is called <em>ʾîš hāʾĕlōhîm</em> (v.1) — a title of prophetic authority. He prophesies against Jeroboam\'s altar by name: "Josiah" — a king who will not exist for 300 years. This is the most chronologically specific predictive prophecy in Kings.'),
            ],
            'ctx': 'The unnamed man of God from Judah delivers one of the most remarkable prophecies in the OT: he names Josiah — a king born 300 years later — who will desecrate this very altar (fulfilled in 2 Kgs 23:15–18). The altar splits, Jeroboam\'s hand withers and is restored, but Jeroboam does not repent. The man of God refuses the king\'s hospitality as commanded by God: "Do not eat bread or drink water or return by the way you came."',
            'cross': [
                ('2 Kgs 23:15–18', 'Josiah fulfils this prophecy exactly — desecrating the Bethel altar and burning bones on it, but sparing the man of God\'s tomb.'),
                ('Isa 44:28', 'Cyrus named by Isaiah 150 years before his birth. The Josiah prophecy follows the same pattern of divinely specific foreknowledge.'),
            ],
            'macarthur': [
                ('13:2', 'MacArthur: Naming Josiah 300 years in advance demonstrates God\'s absolute sovereignty over history. The future is not unknown to God; it is decreed by him. This prophecy anchors the entire Bethel narrative in divine omniscience.'),
                ('13:4', 'MacArthur: Jeroboam\'s withered hand is healed at the man of God\'s prayer — grace extended even to the rebel king. Yet Jeroboam does not repent. Miracles do not produce faith; they only confirm or challenge existing orientation.'),
                ('13:8', 'MacArthur: The man of God\'s refusal of hospitality is strict obedience to a specific divine command. His faithfulness to God\'s word is the measure of his prophetic integrity. He will tragically fail this same test in the second half of the chapter.'),
                ('13:10', 'MacArthur: "He took another road" — exact obedience to God\'s instruction. The prophet demonstrates that the word of God governs every detail: not just what to say but where to go, what to eat, and which road to take. Total obedience is the prophetic calling.'),
            ],
            'wiseman': [
                ('13:2', 'Wiseman: The specificity of naming Josiah has led some scholars to date this passage to the Josianic period (c.621 BC). However, predictive naming is attested in ANE prophetic texts, and the narrative\'s literary function requires the prediction to precede its fulfilment. The text claims prophetic foreknowledge, not historical retrofitting.'),
                ('13:3', 'Wiseman: The altar splitting and ashes pouring out would have been understood as divine desecration of the sacred space. In ANE religion, the destruction of an altar signified the withdrawal of divine favour from the cult.'),
            ],
            'provan': [
                ('13:2', 'Provan: The Josiah prophecy creates a narrative thread that spans the entire book of Kings — from ch. 13 to 2 Kgs 23. The reader holds this unfulfilled promise across hundreds of pages, watching for its resolution. It is the narrator\'s longest-range narrative device.'),
                ('13:8', 'Provan: The man of God\'s obedience in the first episode (refusing the king) sets up the tragedy of the second episode (accepting the old prophet\'s invitation). The narrator constructs the chapter as a test of prophetic fidelity — passed once, failed once, with fatal consequences.'),
            ],
            'calvin': [
                ('13:2', 'Calvin: God names Josiah three centuries early to show that his purposes are certain before they are enacted. The future is not contingent from God\'s perspective; it is appointed. This is comfort for the faithful and warning for the faithless.'),
                ('13:4', 'Calvin: The withered hand teaches that human power cannot resist divine authority. Jeroboam reaches out to seize the prophet and is seized himself. The arm that would silence God\'s messenger is paralysed by God\'s power.'),
            ],
            'netbible': [
                ('13:2', 'NET Note: <em>yōšiyyāhû šĕmô</em> (Josiah is his name) — the naming formula is the same used for Isaac (Gen 17:19) and Jesus (Matt 1:21). Divine naming indicates divine appointment — the person\'s destiny is determined before birth.'),
                ('13:3', 'NET Note: <em>môpēt</em> (sign/portent) — a validating sign accompanying the prophecy. The altar splits and the ashes pour out as immediate confirmation that the long-range Josiah prophecy is truly from God.'),
            ],
        },
        {
            'header': 'Verses 11–34 — The Old Prophet\'s Lie; the Lion on the Road',
            'verses': verse_range(11, 34),
            'heb': [
                ('nābîʾ zāqēn', 'navi zaken', 'old prophet', 'The old prophet of Bethel (v.11) is one of the most enigmatic figures in Kings. He lies to the man of God — claiming an angel told him to bring him back — and the man of God believes him. Then the old prophet genuinely prophesies the man of God\'s death. He is simultaneously a deceiver and a true prophet — a combination that defies simple moral categories.'),
                ('ʾaryēh', 'aryeh', 'lion', 'The lion kills the man of God but does not eat the body or attack the donkey (vv.24–25). This supernatural restraint proves the death is divine judgment, not natural accident. The lion is God\'s instrument — deployed with surgical precision.'),
            ],
            'ctx': 'The second half of ch. 13 is one of the strangest narratives in Scripture. The old prophet lies, the man of God disobeys, the man of God is killed by a lion, and the old prophet mourns him and asks to be buried alongside him. The moral complexity is deliberate: the man of God who resisted a king\'s invitation falls for a prophet\'s lie. The lesson is severe: obedience to God\'s direct word cannot be overridden by any human authority, even prophetic authority. The chapter closes with the note that Jeroboam "did not change his evil ways" — the man of God\'s mission succeeded prophetically but failed to produce repentance.',
            'cross': [
                ('Gal 1:8', '"Even if we or an angel from heaven should preach a gospel other than the one we preached to you, let them be under God\'s curse!" Paul\'s principle matches the lesson of ch. 13 exactly: no secondary authority overrides God\'s direct word.'),
                ('1 Kgs 20:36', 'Another prophet killed by a lion for disobedience — the same pattern of lethal consequence for prophetic unfaithfulness.'),
            ],
            'macarthur': [
                ('13:18', 'MacArthur: "An angel spoke to me by the word of the LORD... But he was lying." The man of God\'s fatal error: accepting a human claim about divine revelation over the direct word he had received. No secondhand revelation overrides firsthand command.'),
                ('13:24', 'MacArthur: The lion\'s supernatural behaviour — killing without eating, standing beside the donkey — proves this is divine judgment. God controls even predators with precision. The death is measured, not random.'),
                ('13:33', 'MacArthur: After everything — the prophecy, the withered hand, the altar split, the prophet\'s death — Jeroboam "did not change his evil ways." The hardest hearts are not softened by the most dramatic signs. Only grace changes the will.'),
                ('13:34', 'MacArthur: "This was the sin of the house of Jeroboam that led to its downfall and to its destruction." The narrator\'s verdict: Jeroboam\'s dynasty is doomed from this moment. The golden calves are the death sentence, delayed but certain.'),
            ],
            'wiseman': [
                ('13:24', 'Wiseman: Lions were present in Palestine until the medieval period. References to lion attacks appear in Assyrian royal inscriptions and in biblical texts (2 Kgs 17:25–26). The supernatural element is not the lion\'s presence but its selective behaviour.'),
                ('13:31', 'Wiseman: The old prophet\'s request to be buried beside the man of God is a recognition of the Judean prophet\'s genuine authority. By sharing a tomb, the old prophet ensures that when Josiah eventually desecrates the Bethel cemetery, his bones will be protected alongside the man of God\'s (2 Kgs 23:17–18).'),
            ],
            'provan': [
                ('13:18', 'Provan: The chapter\'s moral is not that prophets are untrustworthy but that no human authority — even prophetic — supersedes God\'s direct command. The Deuteronomistic historian is establishing a principle that will govern the entire prophetic narrative of Kings: test every word against God\'s revealed will.'),
                ('13:34', 'Provan: "This was the sin that led to its downfall" — the narrator delivers the dynasty\'s death sentence while Jeroboam is still alive. The verdict precedes the execution by decades. The reader knows the end from the middle.'),
            ],
            'calvin': [
                ('13:18', 'Calvin: The man of God believed a lie because it came from a prophet. This teaches that we must never accept human authority — however impressive — over God\'s clear word. Scripture is the final court of appeal, not any human intermediary.'),
                ('13:24', 'Calvin: God\'s judgment on his own prophet is terrifying in its severity. If God does not spare his faithful servant for one act of disobedience, how much more will he judge those who persistently rebel? The severity of God is the other face of the kindness of God.'),
            ],
            'netbible': [
                ('13:18', 'NET Note: <em>waykakkēš lô</em> (he lied to him) — the narrator states the deception flatly. There is no ambiguity: the old prophet fabricated the angel story. The reader is told the truth so that the man of God\'s failure is seen as gullibility, not reasonable trust.'),
                ('13:24', 'NET Note: The triple tableau — lion, donkey, body — standing together on the road functions as a supernatural sign. Normal predator behaviour (eating prey, attacking nearby animals) is suspended. The scene is a visible parable of divine judgment.'),
            ],
        },
    ],
})

ki1(14, {
    'title': 'Ahijah\'s Word to Jeroboam; Shishak Invades Judah',
    'sections': [
        {
            'header': 'Verses 1–20 — Jeroboam\'s Wife in Disguise; Ahijah\'s Devastating Prophecy',
            'verses': verse_range(1, 20),
            'heb': [
                ('mitnakkērāh', 'mitnakerah', 'disguising herself', 'Jeroboam tells his wife to <em>hitnakkēr</em> (disguise herself, v.2) before visiting Ahijah — the prophet who originally gave Jeroboam the kingdom (11:29–39). The king fears the prophet\'s discernment. But Ahijah is blind (v.4) — and God tells him she is coming. Physical blindness cannot block prophetic sight.'),
            ],
            'ctx': 'Jeroboam\'s son Abijah is sick, and Jeroboam sends his wife in disguise to the now-blind prophet Ahijah. God warns Ahijah in advance: she is coming, and the answer is devastating. Ahijah delivers one of the harshest prophetic judgments in the OT: every male in Jeroboam\'s house will be cut off, eaten by dogs or birds. Only Abijah will receive a proper burial — "because in him there is found something pleasing to the LORD." The boy dies the moment his mother crosses the threshold of home. The dynasty that began with such promise (11:37–38) ends in total destruction because Jeroboam "did more evil than all who lived before you."',
            'cross': [
                ('1 Kgs 11:37–38', 'Ahijah\'s original promise: "If you do whatever I command you... I will build you a dynasty as enduring as the one I built for David." The conditional promise is now revoked because the condition was never met.'),
                ('1 Kgs 15:29', 'Baasha destroys Jeroboam\'s entire family — fulfilling Ahijah\'s prophecy of 14:10.'),
            ],
            'macarthur': [
                ('14:2', 'MacArthur: Jeroboam sends his wife in disguise to the prophet who gave him the kingdom. The king who created a counterfeit religion now creates a counterfeit identity. Deception has become his default mode. But you cannot disguise yourself from God.'),
                ('14:6', 'MacArthur: Ahijah hears her footsteps and says "Come in, wife of Jeroboam. Why this pretence?" God reveals what the disguise conceals. No human strategy can hide from divine omniscience.'),
                ('14:13', 'MacArthur: Only the sick boy receives a proper burial because "in him there is found something pleasing to the LORD." Even in a corrupt household, God discerns and honours individual faithfulness. One good heart in a wicked family is not overlooked.'),
                ('14:18', 'MacArthur: The boy dies "as the LORD had said through his servant Ahijah." Prophetic word and historical event align exactly. The narrator traces every outcome to divine speech. History is the execution of prophecy.'),
            ],
            'wiseman': [
                ('14:2', 'Wiseman: Consulting prophets during royal illness was standard ANE practice. Assyrian kings regularly consulted <em>bārû</em> (diviners) and <em>āšipu</em> (exorcist-priests) when royal family members fell ill. Jeroboam follows the cultural pattern but fears the specific prophet who knows his failures.'),
                ('14:15', 'Wiseman: Ahijah\'s prophecy of exile — "He will uproot Israel from this good land... and scatter them beyond the Euphrates" — accurately predicts the Assyrian deportation of 722 BC, roughly 200 years later.'),
            ],
            'provan': [
                ('14:2', 'Provan: The disguise episode is the narrative\'s final comment on Jeroboam: a man so morally disoriented that he sends his wife to deceive a blind prophet who speaks for the God who sees everything. The irony is total and devastating.'),
                ('14:13', 'Provan: The boy Abijah — the only member of Jeroboam\'s house to receive a proper burial — is the narrator\'s way of saying that judgment is discriminating, not indiscriminate. God\'s wrath does not destroy the righteous with the wicked (cf. Gen 18:25).'),
            ],
            'calvin': [
                ('14:6', 'Calvin: God reveals the disguise to his prophet, teaching that all human scheming is transparent to heaven. Let no sinner imagine that darkness or deception can hide from the eyes of the Almighty.'),
                ('14:13', 'Calvin: In the boy Abijah, God preserves a spark of grace even in a house destined for destruction. This teaches that God\'s judgment, however severe, is never blind. He distinguishes the good from the evil, even within the same family.'),
            ],
            'netbible': [
                ('14:2', 'NET Note: <em>hitnakkĕrî</em> (hitpael of <em>nkr</em>: to make yourself unrecognisable) — the reflexive form indicates deliberate self-transformation. The same root in Gen 42:7 describes Joseph "making himself strange" to his brothers. Disguise in both cases fails.'),
                ('14:10', 'NET Note: The graphic phrase about cutting off every male (<em>maštin bĕqîr</em>) is a vulgar idiom meaning "one who urinates against a wall" — i.e., every male. The crudeness matches the severity of the judgment.'),
            ],
        },
        {
            'header': 'Verses 21–31 — Rehoboam: Judah Does Evil; Shishak Invades',
            'verses': verse_range(21, 31),
            'heb': [
                ('qĕdēšîm', 'kedeshim', 'male shrine prostitutes', 'Judah establishes <em>qĕdēšîm</em> (v.24) — male cult prostitutes associated with Canaanite fertility worship. The practice represents total assimilation to Canaanite religion. Judah has adopted not just Canaanite theology but Canaanite practice.'),
            ],
            'ctx': 'The narrator shifts to Judah under Rehoboam. The verdict is blunt: "Judah did evil in the eyes of the LORD" (v.22). High places, sacred stones, Asherah poles, male shrine prostitutes — the full catalogue of Canaanite religion. Then Shishak (Pharaoh Shoshenq I) invades in Rehoboam\'s fifth year and carries off the temple treasures, including Solomon\'s gold shields. Rehoboam replaces them with bronze — a perfect metaphor for the decline: gold becomes bronze. The kingdom that began with gold overflowing now substitutes cheap metal for precious.',
            'cross': [
                ('2 Chr 12:5–8', 'The Chronicler adds that the prophet Shemaiah explained the invasion: "You have abandoned me; therefore, I now abandon you to Shishak." Repentance brought a limited reprieve.'),
                ('1 Kgs 10:16–17', 'Solomon\'s 200 large gold shields and 300 small gold shields — now carried off to Egypt. The symbol of Solomon\'s glory becomes the spoil of Solomon\'s successor\'s failure.'),
            ],
            'macarthur': [
                ('14:22', 'MacArthur: "Judah did evil" — not just the northern kingdom. Both halves of the divided nation are in rebellion. The narrator prevents any triumphalism in Judah: they are no better than Israel. Sin is universal, not tribal.'),
                ('14:25', 'MacArthur: Shishak\'s invasion is divine discipline — the wealth Solomon accumulated is stripped away in one campaign. What took decades to build is plundered in days. Prosperity without faithfulness is a castle built on sand.'),
                ('14:26', 'MacArthur: Gold shields replaced with bronze — the narrator\'s most eloquent image of decline. The substitution is both literal and metaphorical: Judah maintains the forms of royal splendour while the substance drains away. Religious decline often looks exactly like this.'),
                ('14:30', 'MacArthur: "There was continual warfare between Rehoboam and Jeroboam." The divided kingdom is immediately at war with itself. Division breeds conflict; conflict breeds further division. The cycle of national self-destruction has begun.'),
            ],
            'wiseman': [
                ('14:25', 'Wiseman: Shoshenq I\'s invasion (c.925 BC) is confirmed by his own triumphal relief at the Temple of Amun in Karnak, which lists over 150 conquered cities in both Israel and Judah. This is one of the most important archaeological confirmations of a biblical event.'),
                ('14:26', 'Wiseman: The temple treasury\'s plundering is the first of several recorded in Kings (cf. 2 Kgs 14:14; 16:8; 18:15–16; 24:13). Each extraction represents a further stripping of Solomon\'s legacy — the temple\'s wealth diminishes with each successive crisis.'),
            ],
            'provan': [
                ('14:22', 'Provan: By describing Judah\'s sin immediately after Jeroboam\'s, the narrator establishes the parallel structure that will govern the rest of Kings: Israel sins, Judah sins, both face consequences. Neither kingdom has a monopoly on covenant faithfulness or on judgment.'),
                ('14:26', 'Provan: The gold-to-bronze substitution is the narrative\'s most compact symbol of decline. Rehoboam still has shields, still posts guards, still processes to the temple — the routine continues. But the gold is gone. The form persists while the glory departs. This is the story of institutional religion when faith has emptied it.'),
            ],
            'calvin': [
                ('14:22', 'Calvin: Judah sins alongside Israel. Let no branch of the church imagine itself immune from corruption. Neither tradition nor heritage nor orthodox confession guarantees faithfulness. Every generation must fight the battle of faith for itself.'),
                ('14:26', 'Calvin: Bronze for gold — the substitute that fools no one but becomes accepted through repetition. Churches that replace the gospel with moralism, tradition with formalism, or conviction with accommodation make the same substitution. The guards still march; the gold is gone.'),
            ],
            'netbible': [
                ('14:25', 'NET Note: <em>Šîšaq</em> (Shishak) = Shoshenq I, founder of Egypt\'s 22nd Dynasty. His invasion c.925 BC targeted both Judah and Israel — the Karnak relief includes cities from both kingdoms, suggesting Shoshenq exploited the divided state of the former Solomonic empire.'),
                ('14:26', 'NET Note: <em>māginnê hazzāhāb</em> (gold shields) → <em>māginnê nĕḥōšet</em> (bronze shields). The lexical substitution enacts the narrative\'s theme: the kingdom of gold has become a kingdom of bronze. The same word <em>māgēn</em> (shield) highlights what has changed — the material, not the form.'),
            ],
        },
    ],
})

ki1(15, {
    'title': 'Abijah and Asa in Judah; Nadab and Baasha in Israel',
    'sections': [
        {
            'header': 'Verses 1–24 — Asa\'s Reforms: He Did Right in the Eyes of the LORD',
            'verses': verse_range(1, 24),
            'heb': [
                ('šālēm ʿim-YHWH', 'shalem im-Adonai', 'fully devoted to the LORD', 'Asa\'s heart was <em>šālēm</em> (fully devoted, v.14) "all his days" — the same word used negatively of Solomon (11:4). What Solomon failed to maintain, Asa achieves. He is the first king evaluated positively since the division, restoring hope for the Davidic line.'),
            ],
            'ctx': 'Abijah reigns briefly (3 years) and "committed all the sins his father had done." Then Asa — the first reformer king — reigns 41 years. He expels the male shrine prostitutes, removes the idols, and even deposes his grandmother Maakah for her Asherah pole. His heart is "fully devoted" — but with a caveat: "the high places were not removed." The narrator\'s "except" returns (cf. 3:3). Asa is faithful but not completely so. He also strips the temple treasury to buy an alliance with Ben-Hadad of Aram against Israel — using sacred resources for political strategy.',
            'cross': [
                ('2 Chr 15:17', '"Asa\'s heart was fully committed to the LORD all his life." The Chronicler\'s parallel evaluation is identical.'),
                ('2 Chr 16:7–9', 'The Chronicler adds the prophet Hanani\'s rebuke for the Ben-Hadad alliance: "You relied on the king of Aram and not on the LORD." The political alliance was a failure of faith.'),
            ],
            'macarthur': [
                ('15:11', 'MacArthur: "Asa did what was right in the eyes of the LORD, as his father David had done." The Davidic standard is maintained. After two bad kings, Asa restores the pattern. Even in decline, God raises reformers who turn back the tide — for a time.'),
                ('15:13', 'MacArthur: Deposing his grandmother Maakah for her Asherah pole demonstrates that reform must begin at home. Asa does not spare the powerful or the family. True reform costs personal relationships.'),
                ('15:14', 'MacArthur: "Although he did not remove the high places, Asa\'s heart was fully committed." The narrator holds both truths: genuine devotion and incomplete reform. God accepts the imperfect when the heart is sincere — but notes the imperfection.'),
                ('15:18', 'MacArthur: Stripping the temple treasury to buy a foreign alliance reveals the limit of Asa\'s faith. He trusts God enough to remove idols but not enough to face a military threat without political manoeuvring. Faith is tested most severely in crisis.'),
            ],
            'wiseman': [
                ('15:18', 'Wiseman: Ben-Hadad I of Damascus (c.900–860 BC) is attested in the Melqart Stele discovered near Aleppo (1939). The Aramean kingdom of Damascus was the dominant regional power in the 9th century, making it a natural ally for Judah against Israel.'),
                ('15:20', 'Wiseman: Ben-Hadad\'s conquest of Ijon, Dan, and Abel Beth Maakah in northern Israel is consistent with Aramean expansion southward from the Anti-Lebanon region. Archaeological evidence at Dan shows destruction layers datable to this period.'),
            ],
            'provan': [
                ('15:11', 'Provan: Asa is the narrator\'s first ray of hope in the southern kingdom. After Rehoboam and Abijah, a king arises who "did right." The Deuteronomistic historian uses Asa to demonstrate that the pattern of decline is not inevitable — reform is possible when the king\'s heart is right.'),
                ('15:14', 'Provan: The "high places not removed" caveat follows Asa into his positive evaluation. This persistent qualifier demonstrates the narrator\'s honesty: even the best Judahite kings fall short of the Deuteronomic ideal. Complete reform awaits Josiah — and even he cannot save the nation.'),
            ],
            'calvin': [
                ('15:13', 'Calvin: Asa\'s deposition of his own grandmother teaches that family loyalty must yield to loyalty to God. When relatives promote idolatry, the faithful must choose God over kinship. This is costly but non-negotiable.'),
                ('15:14', 'Calvin: The high places remained — even the best reformer\'s work is incomplete in this life. Let the church not despair of imperfect reform. God honours sincere effort even when the result falls short of perfection.'),
            ],
            'netbible': [
                ('15:13', 'NET Note: <em>mipliṣet</em> (horrid/obscene thing) — the object Maakah made for Asherah. The term implies something repulsive, possibly a phallic cult image. Asa burned it in the Kidron Valley — the same valley where Josiah later destroyed cult objects (2 Kgs 23:4, 6).'),
                ('15:14', 'NET Note: <em>raq habbāmôt lōʾ sārû</em> (only the high places were not removed) — the <em>raq</em> (only/except) particle is the narrator\'s trademark qualifying device, appearing in positive evaluations of both Solomon (3:3) and now Asa.'),
            ],
        },
        {
            'header': 'Verses 25–34 — Baasha Destroys Jeroboam\'s House; Walks in His Sin',
            'verses': verse_range(25, 34),
            'heb': [
                ('bĕḥeṭʾô ʾăšer heḥĕṭîʾ ʾet-Yiśrāʾēl', 'becheto asher hecheti et-Yisrael', 'in his sin which he caused Israel to sin', 'The formula "walked in the way of Jeroboam and in his sin, which he caused Israel to sin" (v.34) becomes the standard verdict for every northern king. It appears over 20 times in Kings. The golden calves are the measuring stick against which every reign is evaluated.'),
            ],
            'ctx': 'Nadab reigns only 2 years before Baasha assassinates him and destroys Jeroboam\'s entire house — fulfilling Ahijah\'s prophecy (14:10). But Baasha then walks in the same sin: the golden calves remain. The pattern is established: northern kings rise by violence, destroy their predecessors, but perpetuate the same apostasy. The mechanism changes; the sin does not. The narrator demonstrates that the problem is not the dynasty but the system — Jeroboam\'s calves corrupt whoever rules, regardless of how they gained power.',
            'cross': [
                ('1 Kgs 14:10', 'Ahijah\'s prophecy against Jeroboam\'s house — fulfilled by Baasha in v.29.'),
                ('1 Kgs 16:1–4', 'Jehu the prophet will deliver an identical prophecy against Baasha — the destroyer becomes the destroyed.'),
            ],
            'macarthur': [
                ('15:27', 'MacArthur: Baasha assassinates Nadab at the siege of Gibbethon — a Philistine city. The northern kingdom is simultaneously fighting external enemies and consuming itself from within. Sin divides, and division weakens.'),
                ('15:29', 'MacArthur: "He killed Jeroboam\'s whole family. He did not leave Jeroboam anyone that breathed." Ahijah\'s prophecy fulfilled to the letter. God\'s word accomplishes exactly what it promises — whether blessing or judgment.'),
                ('15:34', 'MacArthur: Baasha "walked in the ways of Jeroboam and committed the same sin." The instrument of God\'s judgment against Jeroboam repeats Jeroboam\'s sin. Judgment does not produce repentance. Only grace changes hearts.'),
                ('15:34', 'MacArthur: The golden calves survive every dynasty change. They are bigger than any individual king — a systemic corruption embedded in the northern kingdom\'s institutional worship. Structural sin outlasts individual sinners.'),
            ],
            'wiseman': [
                ('15:27', 'Wiseman: Gibbethon (Tell el-Melat, near Gezer) was a Levitical city (Josh 21:23) in Philistine territory. Israel\'s siege there — interrupted by the coup — shows ongoing border conflict with the Philistines. The location reappears in 16:15–17 when Zimri\'s coup also occurs during a Gibbethon siege.'),
                ('15:29', 'Wiseman: The complete destruction of a predecessor\'s dynasty was standard practice in ANE succession by coup. Assyrian, Babylonian, and Hittite records document similar dynastic purges. The practice eliminated rival claimants but perpetuated cycles of violence.'),
            ],
            'provan': [
                ('15:29', 'Provan: The narrator notes the fulfilment of Ahijah\'s prophecy (14:10) — maintaining the theme that prophetic word drives historical outcome. Every major event in Kings is traced to a prior prophetic announcement. The narrative is not random history but executed prophecy.'),
                ('15:34', 'Provan: Baasha\'s identical sin demonstrates the narrator\'s point: the problem in Israel is not personal but systemic. Change the king, keep the calves, and nothing changes. Structural reform — not just leadership change — is what Israel needs and never gets.'),
            ],
            'calvin': [
                ('15:29', 'Calvin: God uses Baasha — a brutal usurper — to fulfil his prophetic word against Jeroboam. This does not sanctify Baasha\'s violence; it demonstrates God\'s sovereignty over even sinful human actions. The instrument of judgment is itself judged (ch. 16).'),
                ('15:34', 'Calvin: Baasha repeats Jeroboam\'s sin after witnessing Jeroboam\'s destruction. How blind is the human heart that it cannot learn even from the ruin of others! The examples of judgment that should produce fear produce only continued rebellion.'),
            ],
            'netbible': [
                ('15:29', 'NET Note: <em>kĕḏabar YHWH ʾăšer dibbēr bĕyad ʿabdô ʾĂḥiyyāh</em> (according to the word of the LORD which he spoke by the hand of his servant Ahijah) — the fulfilment formula explicitly connects event to prophecy. "By the hand of" (<em>bĕyad</em>) is the standard OT idiom for prophetic mediation.'),
                ('15:34', 'NET Note: The formulaic evaluation "he walked in the way of Jeroboam and in his sin which he caused Israel to sin" (<em>wayyēlek bĕderek Yārŏbʿām ûbĕḥaṭṭāʾtô</em>) uses the construct chain to bind the king\'s personal sin to its national effects. Every northern king inherits Jeroboam\'s guilt by perpetuating his system.'),
            ],
        },
    ],
})

ki1(16, {
    'title': 'Elah, Zimri, Omri, Ahab — Rapid Succession and the Worst King Yet',
    'sections': [
        {
            'header': 'Verses 1–20 — From Baasha to Zimri: Seven Days on the Throne',
            'verses': verse_range(1, 20),
            'heb': [
                ('šibʿat yāmîm', 'shivat yamim', 'seven days', 'Zimri reigns only seven days (v.15) — the shortest reign in Israelite history. He seizes the throne by assassination, destroys Baasha\'s house (fulfilling prophetic word), then burns the palace over himself when Omri\'s forces close in. His reign is a compressed tragedy: coup, fulfilment, and self-destruction in one week.'),
            ],
            'ctx': 'Chapter 16 accelerates through four northern kings with breathtaking speed. Baasha dies naturally but under prophetic condemnation (vv.1–6). His son Elah reigns 2 years and is assassinated while drunk by Zimri, his chariot commander (vv.8–10). Zimri destroys Baasha\'s house — fulfilling Jehu\'s prophecy (16:3–4) — but reigns only 7 days before the army proclaims Omri king. Zimri dies in a self-immolated palace. The pace of violence escalates: assassination follows assassination. The northern kingdom is consuming itself.',
            'cross': [
                ('1 Kgs 16:3–4', 'Jehu\'s prophecy against Baasha — identical to Ahijah\'s against Jeroboam. The same sin produces the same punishment. God is consistent.'),
                ('2 Kgs 9:31', 'When Jehu enters Jezreel, Jezebel calls him "Zimri, you murderer!" — invoking Zimri\'s precedent as a warning. The coup artist\'s name becomes a curse.'),
            ],
            'macarthur': [
                ('16:2', 'MacArthur: Jehu\'s prophecy against Baasha mirrors Ahijah\'s against Jeroboam. God treats identical sins with identical judgments. The consistency of divine justice demonstrates that God is no respecter of persons.'),
                ('16:9', 'MacArthur: Elah is assassinated while "drinking himself drunk" in the home of his palace manager. The king\'s dereliction — getting drunk while his army fights at Gibbethon — creates the vulnerability his enemies exploit. Self-indulgence invites disaster.'),
                ('16:15', 'MacArthur: Seven days — the briefest reign. Zimri\'s story teaches that seizing power by violence provides no stability. The sword that gives the throne also takes it.'),
                ('16:18', 'MacArthur: Zimri burns the palace over himself — the ultimate act of despair. When the coup fails, there is no exit strategy. Those who live by the sword die by it.'),
            ],
            'wiseman': [
                ('16:8', 'Wiseman: The assassination of Elah while drinking at the palace steward\'s house follows a pattern attested in ANE sources. The Assyrian king Tukulti-Ninurta I was assassinated by courtiers in similar domestic circumstances. Palace coups often targeted the king during private moments.'),
                ('16:15', 'Wiseman: Zimri\'s 7-day reign is the shortest documented reign in the ANE. Comparable brief reigns are known from Babylonian and Assyrian king lists, usually terminated by counter-coups.'),
            ],
            'provan': [
                ('16:12', 'Provan: The narrator notes the fulfilment of Jehu\'s prophecy (16:1–4) against Baasha — the same fulfilment formula used for Ahijah\'s prophecy against Jeroboam (15:29). The parallel structure demonstrates that God\'s justice operates by consistent principle, not arbitrary caprice.'),
                ('16:18', 'Provan: Zimri\'s self-immolation is the narrator\'s most extreme image of political self-destruction. The northern kingdom is literally burning itself down. The palace that should house governance becomes a funeral pyre. Power pursued for its own sake is self-consuming.'),
            ],
            'calvin': [
                ('16:9', 'Calvin: Elah drunk while his army fights — the picture of a ruler who has abandoned his duty for pleasure. When leaders indulge themselves while their people suffer, judgment is already at the door. Vigilance is the price of authority.'),
                ('16:18', 'Calvin: Zimri\'s fiery suicide teaches that sin\'s wages are paid in full. He who murdered his master is consumed by his own hand. The palace he seized becomes his tomb. There is no peace for the wicked.'),
            ],
            'netbible': [
                ('16:12', 'NET Note: <em>kĕḏabar YHWH ʾăšer dibbēr ʾel-Baʿšāʾ bĕyad Yēhûʾ</em> — the fulfilment formula. "By the hand of Jehu" — a different Jehu from the later king who destroys the Omride dynasty (2 Kgs 9). Prophetic names recur across generations.'),
                ('16:18', 'NET Note: <em>wayyiśrōp ʿālāyw ʾet-bêt hammelek bāʾēš</em> (he burned the royal palace over himself with fire) — the verb <em>śārap</em> (to burn) combined with <em>ʿal</em> (over/upon) indicates deliberate self-immolation. Zimri\'s death is suicide by arson.'),
            ],
        },
        {
            'header': 'Verses 21–34 — Omri Founds Samaria; Ahab: More Evil Than All Before Him',
            'verses': verse_range(21, 34),
            'heb': [
                ('wayyaʿaś hāraʿ mikkōl ʾăšer lĕpānāyw', 'vayaas hara mikol asher lefanav', 'he did more evil than all before him', 'Ahab\'s evaluation (v.30) escalates beyond all predecessors. But v.33 adds: "Ahab also made an Asherah pole and did more to arouse the anger of the LORD... than did all the kings of Israel before him." The superlative is doubled — Ahab is the worst king in Israelite history, exceeding even Jeroboam.'),
            ],
            'ctx': 'Omri founds Samaria and establishes the most powerful northern dynasty — yet the narrator dismisses his 12-year reign in six verses (vv.23–28). His son Ahab marries Jezebel of Sidon and introduces Baal worship on an entirely new scale: a Baal temple in Samaria, an Asherah pole, and active promotion of Canaanite religion. The narrator\'s verdict is the most severe in Kings: Ahab "did more to arouse the anger of the LORD... than all the kings of Israel before him" (v.33). The Elijah cycle that follows (chs. 17–19) is God\'s response to Ahab\'s unprecedented evil.',
            'cross': [
                ('Mic 6:16', '"You have observed the statutes of Omri and all the practices of Ahab\'s house." A century later, Micah still cites the Omride dynasty as the standard of wickedness.'),
                ('2 Kgs 3:4–5', 'The Mesha Stele confirms Omri\'s conquest of Moab: "Omri was king of Israel, and he oppressed Moab many days." The archaeological confirmation validates the narrator\'s brief account.'),
            ],
            'macarthur': [
                ('16:24', 'MacArthur: Omri buys the hill of Samaria and builds a new capital — a shrewd political move. The city is strategically defensible and symbolically fresh: not associated with any previous dynasty. But political brilliance without spiritual fidelity is empty.'),
                ('16:30', 'MacArthur: "Ahab did more evil... than any of those before him." The superlative indicates not just personal sin but systematic promotion of evil. Ahab does not merely tolerate Baal worship; he institutionalises it. The king becomes the architect of national apostasy.'),
                ('16:31', 'MacArthur: Ahab married Jezebel daughter of Ethbaal king of the Sidonians. This is more than a diplomatic marriage — it is a theological alliance. Jezebel brings Baal worship with her and aggressively promotes it. Marriage to a pagan spouse becomes the vehicle for religious revolution.'),
                ('16:34', 'MacArthur: The rebuilding of Jericho by Hiel fulfils Joshua\'s curse (Josh 6:26) — the firstborn dies when the foundation is laid, the youngest when the gates are set. The narrator places this at the chapter\'s end to demonstrate that God\'s ancient words remain active across centuries.'),
            ],
            'wiseman': [
                ('16:24', 'Wiseman: Samaria (modern Sebastia) was excavated by Harvard University (1908–10) and later by Kathleen Kenyon (1931–35). The Omride palace revealed sophisticated ashlar masonry, ivory inlays, and administrative ostraca. Archaeologically, Omri\'s dynasty was the most materially impressive in Israelite history — a fact the narrator deliberately minimises.'),
                ('16:31', 'Wiseman: Ethbaal (Ittobaal) king of the Sidonians is attested by Josephus (citing Menander of Ephesus) as a priest of Astarte who seized the Tyrian throne by assassination. Jezebel\'s father was both priest and king — she brought religious and political authority into the marriage.'),
            ],
            'provan': [
                ('16:25', 'Provan: The narrator gives Omri — the most archaeologically attested Israelite king (Assyrian records call Israel "the house of Omri" for a century after his death) — only six verses. The narrator\'s priorities are theological, not political. Military power and architectural achievement are irrelevant if the king "did evil in the eyes of the LORD."'),
                ('16:33', 'Provan: Ahab\'s doubled superlative — more evil than all before, more anger than all before — prepares the reader for the unprecedented prophetic response. The worst king calls forth the greatest prophet: Elijah. The narrative logic is proportional: extreme evil produces extreme divine intervention.'),
            ],
            'calvin': [
                ('16:31', 'Calvin: Ahab\'s marriage to Jezebel teaches that the choice of a spouse shapes the destiny of a household and even a nation. Jezebel did not merely share Ahab\'s throne; she redirected his worship. Marriage is a theological act with consequences beyond the couple.'),
                ('16:34', 'Calvin: Joshua\'s curse on Jericho — spoken 500 years earlier — is fulfilled in Hiel\'s sons. Let no one dismiss ancient prophecy as expired. God\'s word outlasts every human generation. The curse spoken at the conquest is executed in the monarchy.'),
            ],
            'netbible': [
                ('16:24', 'NET Note: <em>wayyiqen ʾet-hāhār Šōmĕrôn</em> (he bought the hill of Samaria) — the purchase price of two talents of silver was modest for a royal capital. Omri selected the site for its defensive advantages: a steep, isolated hill with excellent visibility in all directions.'),
                ('16:34', 'NET Note: The fulfilment of Joshua\'s curse (Josh 6:26) — <em>kĕḏabar YHWH ʾăšer dibbēr bĕyad Yĕhôšuaʿ</em> (according to the word of the LORD spoken by Joshua) — is the narrator\'s last note before Elijah appears in ch. 17. It demonstrates that prophetic words remain active centuries after they are spoken.'),
            ],
        },
    ],
})

print("\n1KI-4 complete: 1 Kings 13–16 built.")

# ─────────────────────────────────────────────────────────────────────────────
# 1KI-5: Chapters 17–19 — The Elijah Cycle: Drought, Fire, Silence
# ─────────────────────────────────────────────────────────────────────────────

ki1(17, {
    'title': 'Elijah Appears: Drought, Ravens, and Resurrection',
    'sections': [
        {
            'header': 'Verses 1–16 — No Rain; Fed by Ravens; the Widow\'s Jar That Never Ran Dry',
            'verses': verse_range(1, 16),
            'heb': [
                ('ʾĒliyyāhû', 'Eliyahu', 'My God is YHWH', 'Elijah\'s name is his message: <em>ʾĒliyyāhû</em> = "My God is YHWH." In a nation worshipping Baal (the storm god who supposedly controls rain), a man whose name declares "My God is YHWH" announces that there will be no rain "except at my word." The contest is joined with his first breath.'),
                ('kĕrît', 'kerit', 'Kerith', 'The Kerith Ravine (v.3) becomes Elijah\'s hiding place — east of the Jordan, away from Ahab\'s territory. God feeds him through ravens — unclean birds (Lev 11:15) bringing bread and meat. God\'s provision operates outside the purity system when necessary. The means of sustenance are unexpected, even scandalous.'),
            ],
            'ctx': 'Elijah appears without genealogy, without call narrative, without introduction — the most abrupt prophetic entrance in the OT. His first word is an oath: "As the LORD, the God of Israel, lives... there will be neither dew nor rain in the next few years except at my word." The drought is a direct assault on Baal theology: Baal was the storm god, the giver of rain. If YHWH can shut the sky, Baal is impotent. God then sends Elijah to three places of provision: Kerith (ravens), Zarephath (a widow), and eventually Carmel (fire). Each location tests and demonstrates that YHWH alone provides — not Baal, not human resources, not natural processes.',
            'cross': [
                ('Jas 5:17', '"Elijah was a human being, even as we are. He prayed earnestly that it would not rain, and it did not rain on the land for three and a half years." James cites Elijah as a model of effective prayer.'),
                ('Luke 4:25–26', 'Jesus cites the Zarephath widow to show that God\'s grace extends beyond Israel: "There were many widows in Israel... yet Elijah was sent to none of them, but to a widow in Zarephath in Sidon."'),
                ('Deut 11:16–17', '"If you worship other gods... he will shut up the heavens so that it will not rain." The drought fulfils the Deuteronomic curse.'),
            ],
            'macarthur': [
                ('17:1', 'MacArthur: Elijah appears without preamble — no call narrative, no genealogy, no background. He speaks and heaven shuts. The prophet\'s authority derives not from credentials but from the word he carries. The message authenticates the messenger.'),
                ('17:4', 'MacArthur: Ravens — unclean birds — become God\'s delivery service. When God provides, he is not bound by the categories of purity or propriety. The same God who gave the food laws now uses unclean birds to feed his prophet. Grace is creative and unconventional.'),
                ('17:9', 'MacArthur: God sends Elijah to Zarephath — in Sidon, Jezebel\'s homeland. The prophet flees to the very territory of his enemy\'s family. God hides his servants in the last place anyone would look.'),
                ('17:14', 'MacArthur: "The jar of flour will not be used up and the jug of oil will not run dry." Daily provision, not stockpiling. The widow must use her last handful and trust God for tomorrow. This is the manna principle (Exod 16): enough for today, faith for tomorrow.'),
            ],
            'wiseman': [
                ('17:1', 'Wiseman: "Elijah the Tishbite, from Tishbe in Gilead" — Tishbe has been tentatively identified with Tell el-Istib in northern Gilead (Transjordan). Gilead was a rugged, frontier territory — Elijah emerges from the margins, not the centres of power.'),
                ('17:9', 'Wiseman: Zarephath (modern Sarafand, between Tyre and Sidon) was a Phoenician coastal town. A 7th-century BC inscription found there confirms the site\'s identification. Elijah\'s sojourn in Phoenician territory demonstrates YHWH\'s sovereignty over Baal\'s homeland.'),
            ],
            'provan': [
                ('17:1', 'Provan: The narrator introduces Elijah with no preparation — the literary equivalent of a thunderclap. After the measured pace of dynastic succession formulae, a prophet suddenly stands before the king and announces drought. The narrative technique mirrors Elijah\'s message: God interrupts business as usual.'),
                ('17:14', 'Provan: The inexhaustible jar and jug are the narrator\'s way of demonstrating that YHWH controls the food supply — not Baal. The fertility god is impotent while YHWH feeds a Phoenician widow from a handful of flour. The Baal contest begins not on Carmel but in a widow\'s kitchen.'),
            ],
            'calvin': [
                ('17:1', 'Calvin: Elijah\'s abrupt appearance teaches that God raises his servants when they are most needed. In the darkest hour — Ahab and Jezebel promoting Baal — God\'s prophet appears. The church should never despair: God always has his Elijah ready.'),
                ('17:14', 'Calvin: The daily provision of flour and oil teaches radical dependence on God. The widow had enough for one meal; God made it enough for years. Our resources are never the measure of God\'s provision. A little in God\'s hands is more than abundance in our own.'),
            ],
            'netbible': [
                ('17:1', 'NET Note: <em>ḥay-YHWH ʾĕlōhê Yiśrāʾēl ʾăšer ʿāmadtî lĕpānāyw</em> (as the LORD the God of Israel lives, before whom I stand) — this oath formula establishes Elijah as a covenant mediator. "Before whom I stand" denotes prophetic service at God\'s court, like a royal official standing before the king.'),
                ('17:6', 'NET Note: <em>hāʿōrĕbîm</em> (the ravens) — some scholars have proposed reading <em>ʿărbîm</em> (Arabs) or <em>ʿōrbîm</em> (merchants/caravaneers). But the MT reading "ravens" creates the theological point: God uses even unclean creatures to sustain his prophet.'),
            ],
        },
        {
            'header': 'Verses 17–24 — The Widow\'s Son Raised: Now I Know You Are a Man of God',
            'verses': verse_range(17, 24),
            'heb': [
                ('wayyitmōdēd', 'vayitmoded', 'he stretched himself out', 'Elijah stretches himself (<em>māḏaḏ</em>, hitpolel) over the child three times (v.21) — a physical act of identification. The prophet\'s body covers the dead body; life transfers from the living to the dead. This is resurrection through intimate contact — a foreshadowing of resurrection theology.'),
            ],
            'ctx': 'The widow\'s son dies, and she blames Elijah: "Did you come to remind me of my sin and kill my son?" Her theology is retributive — sickness and death are punishment for sin. Elijah takes the child, carries him to the upper room, stretches over him three times, and cries out to God. The boy revives. The widow\'s response is not merely relief but confession: "Now I know that you are a man of God and that the word of the LORD from your mouth is the truth." She moves from retributive theology to personal knowledge of God\'s power. This is the first resurrection miracle in the OT — anticipating Elisha (2 Kgs 4:34–35), Jesus (Luke 7:11–15), and the ultimate resurrection.',
            'cross': [
                ('2 Kgs 4:34–35', 'Elisha raises the Shunammite\'s son with an identical stretching-out gesture. The disciple mirrors the master.'),
                ('Luke 7:11–15', 'Jesus raises the widow of Nain\'s son — another widow, another dead son. Jesus\'s word accomplishes what Elijah\'s bodily contact and prayer accomplished.'),
                ('Heb 11:35', '"Women received back their dead, raised to life again" — the Hebrews writer cites this episode as an example of resurrection faith.'),
            ],
            'macarthur': [
                ('17:18', 'MacArthur: The widow assumes her son\'s death is punishment for her sin — a common but wrong assumption (cf. John 9:2–3). Suffering is not always retributive. Elijah does not correct her theology with words; he corrects it with action — by raising her son.'),
                ('17:21', 'MacArthur: The three-fold stretching is both physical and spiritual — Elijah\'s body over the child\'s body, the prophet\'s life-force symbolically covering death. The act anticipates Christ\'s identification with the dead: he enters death to bring life.'),
                ('17:22', 'MacArthur: "The LORD heard Elijah\'s cry, and the boy\'s life returned to him." God responds to the prophet\'s prayer, not to a ritual. Resurrection is personal — the result of relational prayer, not magical technique.'),
                ('17:24', 'MacArthur: The widow\'s confession — "Now I know" — is conversion language. She believed before; now she knows from experience. The resurrection of her son moves her from intellectual assent to personal encounter. This is the pattern of saving faith.'),
            ],
            'wiseman': [
                ('17:19', 'Wiseman: The "upper room" (<em>ʿăliyyāh</em>) was a rooftop chamber common in Levantine domestic architecture, used for guests and private retreat. Archaeological excavations at Israelite-period sites confirm the prevalence of upper-story rooms built on flat rooftops.'),
                ('17:21', 'Wiseman: The stretching-out gesture has no ANE parallel in the context of resurrection. This is distinctly prophetic practice — Elisha will repeat it (2 Kgs 4:34). The gesture may symbolise the transfer of the prophet\'s life-breath to the dead child.'),
            ],
            'provan': [
                ('17:18', 'Provan: The widow\'s question reveals the theology of the average Israelite: suffering equals punishment. Elijah does not debate theology — he acts. The resurrection is the argument. The narrative teaches that God\'s power speaks louder than theological discussion.'),
                ('17:24', 'Provan: The widow\'s "Now I know" is the chapter\'s climactic confession. She has moved from desperate trust (giving her last flour) through accusation (blaming the prophet) to personal knowledge (the word of the LORD is truth). Her journey is a compressed conversion narrative.'),
            ],
            'calvin': [
                ('17:21', 'Calvin: Elijah\'s three-fold prayer teaches persistence in intercession. He does not accept the first silence as refusal. Three times he stretches, three times he cries out. Prayer that gives up at the first obstacle is not true prayer. God tests our persistence to deepen our dependence.'),
                ('17:24', 'Calvin: "Now I know that the word of the LORD from your mouth is the truth." The resurrection validates both the prophet and his God. Miracles serve truth — they confirm the word, not replace it. The miracle points to the message, not to itself.'),
            ],
            'netbible': [
                ('17:21', 'NET Note: <em>wayyitmōdēd ʿal-hayyeled šālōš pĕʿāmîm</em> (he stretched himself upon the child three times) — the hitpolel of <em>māḏaḏ</em> appears only here and in 2 Kgs 4:34 (Elisha). The threefold repetition may reflect liturgical persistence or the symbolic completeness of three.'),
                ('17:22', 'NET Note: <em>wattāšāb nepeš-hayyeled ʿal-qirbô</em> (the life/soul of the child returned to his body) — <em>nepeš</em> here clearly means life-force or vital principle. The return of the <em>nepeš</em> to the body is the OT\'s clearest description of resurrection as the reversal of death.'),
            ],
        },
    ],
})

ki1(18, {
    'title': 'Mount Carmel: The LORD, He Is God',
    'sections': [
        {
            'header': 'Verses 1–19 — Three Years of Drought; Obadiah Hides 100 Prophets',
            'verses': verse_range(1, 19),
            'heb': [
                ('ʿōbadyāhû', 'Ovadyahu', 'servant of YHWH', 'Obadiah\'s name means "servant of YHWH" — and he lives up to it by hiding 100 prophets from Jezebel\'s purge. His name is a confession of faith in a court that worships Baal. He feared God "greatly" (<em>mĕʾōd</em>, v.3) while serving Ahab\'s household — a portrait of faithful service in a hostile environment.'),
            ],
            'ctx': 'After three years of drought, God sends Elijah back to Ahab. The intervening narrative introduces Obadiah — Ahab\'s palace administrator who secretly saved 100 prophets by hiding them in caves and feeding them. Obadiah represents the "7,000 who have not bowed to Baal" (19:18) — faithfulness operating behind the scenes. When Elijah meets Ahab, the king\'s greeting is revealing: "Is that you, you troubler of Israel?" Elijah redirects: "I have not made trouble for Israel. But you and your father\'s family have." The real troublemaker is not the prophet who declares truth but the king who abandons it.',
            'cross': [
                ('1 Kgs 19:18', '"I reserve seven thousand in Israel — all whose knees have not bowed down to Baal." Obadiah\'s hidden faithfulness is part of this remnant.'),
                ('Matt 10:26', '"There is nothing concealed that will not be disclosed." Obadiah\'s secret service will be known. Hidden faithfulness is still faithfulness.'),
            ],
            'macarthur': [
                ('18:3', 'MacArthur: Obadiah feared the LORD greatly while managing Ahab\'s household. Faithfulness does not require withdrawal from the world — it requires integrity within it. Obadiah served a wicked king while secretly protecting God\'s prophets.'),
                ('18:10', 'MacArthur: Ahab searched "every nation and kingdom" for Elijah — the scope of the manhunt reveals the scale of the threat. One prophet with God\'s word is more dangerous to the regime than an army. Truth is the ultimate political weapon.'),
                ('18:17', 'MacArthur: "Is that you, you troubler of Israel?" Ahab blames the messenger for the message. This is the perennial response of the powerful to the prophet: shoot the messenger. Elijah\'s response is definitive: "I have not troubled Israel, but you have."'),
                ('18:19', 'MacArthur: The summons to Carmel — 450 prophets of Baal, 400 prophets of Asherah, "who eat at Jezebel\'s table" — reveals the scale of institutionalised apostasy. These are state-funded, palace-supported religious professionals. Elijah faces not just false theology but the entire apparatus of the state.'),
            ],
            'wiseman': [
                ('18:4', 'Wiseman: Caves were abundant in the limestone hills of Palestine and served as hiding places throughout Israelite history (cf. 1 Sam 22:1; 24:3). The provision of bread and water for 100 prophets in two groups of fifty was a significant logistical operation that Obadiah managed within the palace administration.'),
                ('18:19', 'Wiseman: The 450 prophets of Baal and 400 of Asherah represent a professional religious establishment. ANE temples maintained large staffs of cultic personnel: diviners, musicians, administrators, and ecstatic prophets. Jezebel\'s patronage followed Phoenician royal practice of maintaining court prophets.'),
            ],
            'provan': [
                ('18:4', 'Provan: Obadiah\'s secret rescue operation demonstrates that faithfulness takes many forms. Not everyone is called to be Elijah — standing alone before kings. Some are called to be Obadiah — working within the system to preserve what can be preserved. Both forms of faithfulness are honoured by the narrator.'),
                ('18:17', 'Provan: The exchange between Ahab and Elijah crystallises the conflict: who is the real troublemaker? The king who imported Baal worship, or the prophet who announced drought in response? The narrator has already answered (16:30–33), but the characters must work it out on the mountain.'),
            ],
            'calvin': [
                ('18:3', 'Calvin: Obadiah teaches that faithfulness in a hostile environment is possible. Not every believer can flee the wicked workplace or the corrupt court. Some must remain and do what good they can — hiding prophets, speaking truth quietly, maintaining integrity under pressure.'),
                ('18:17', 'Calvin: "You troubler of Israel" — the world always blames the prophet for the consequences of sin. The doctor who diagnoses the disease is blamed for the pain. But the disease came first; the diagnosis is mercy, not malice.'),
            ],
            'netbible': [
                ('18:3', 'NET Note: <em>waʿōbaḏyāhû hāyāh yārēʾ ʾet-YHWH mĕʾōd</em> (Obadiah feared the LORD greatly) — the intensifier <em>mĕʾōd</em> (very/exceedingly) is rare in character descriptions. It places Obadiah among the most devout figures in the narrative. His name + his character = perfect alignment.'),
                ('18:17', 'NET Note: <em>ʿōkēr Yiśrāʾēl</em> (troubler of Israel) — the participle <em>ʿōkēr</em> carries overtones of covenant curse (cf. Josh 7:25, Achan "troubled" Israel). Ahab accuses Elijah of bringing covenant malediction — ironic, since Ahab\'s own apostasy triggered the drought-curse.'),
            ],
        },
        {
            'header': 'Verses 20–40 — The Contest on Mount Carmel: Fire from Heaven',
            'verses': verse_range(20, 40),
            'heb': [
                ('ʿad-mātay ʾattem pōsĕḥîm ʿal-šĕtê hassĕʿippîm', 'ad-matay atem posechim al-shtei haseipim', 'how long will you limp between two opinions?', 'Elijah\'s challenge (v.21) uses <em>pāsaḥ</em> (to limp, hobble) — the same root as Passover (<em>pesaḥ</em>). Israel is limping between YHWH and Baal like a cripple between two crutches, unable to walk with either. The wordplay is devastating: the Passover people who should walk straight are hobbling.'),
                ('ʾĕlōhîm ʾăšer-yaʿăneh bāʾēš', 'Elohim asher-yaaneh vaesh', 'the god who answers by fire', 'Elijah proposes the decisive test: "the god who answers by fire — he is God" (v.24). Fire is the medium because both YHWH and Baal were associated with fire and lightning in their respective traditions. The test is fair on Baal\'s own terms — and Baal fails completely.'),
            ],
            'ctx': 'The Carmel contest is the climactic event of 1 Kings. Elijah alone against 450 prophets of Baal. The test is simple: two bulls, two altars, no fire — the god who answers with fire is the true God. Baal\'s prophets cry out from morning to evening; Elijah mocks them: "Perhaps he is deep in thought, or busy, or travelling. Maybe he is sleeping and must be awakened." The Hebrew innuendo is sharper than it appears — "busy" may be a euphemism for using the toilet. Then Elijah rebuilds YHWH\'s altar with twelve stones (one per tribe — reuniting the nation symbolically), drenches everything with water (eliminating any suspicion of trickery), and prays a brief, confident prayer. Fire falls and consumes everything — bull, wood, stones, soil, water. The people fall on their faces: "YHWH — he is God! YHWH — he is God!" The prophets of Baal are seized and executed at the Kishon brook.',
            'cross': [
                ('Lev 9:24', '"Fire came out from the presence of the LORD and consumed the burnt offering." The same divine fire that validated the tabernacle now validates Elijah\'s altar. Fire from heaven is God\'s consistent method of ratifying true worship.'),
                ('2 Chr 7:1', 'Fire from heaven consumes Solomon\'s dedication offerings — the same pattern. Carmel, tabernacle, and temple all receive the same divine signature.'),
                ('Rev 11:5', '"Fire comes from their mouths and devours their enemies." The two witnesses in Revelation are modelled on Moses and Elijah — Carmel\'s fire imagery extended eschatologically.'),
            ],
            'macarthur': [
                ('18:21', 'MacArthur: "How long will you waver between two opinions?" Elijah demands a decision. Syncretism — worshipping both YHWH and Baal — is not an option. The people\'s silence reveals their guilt: they have no answer because they know they are compromised.'),
                ('18:27', 'MacArthur: Elijah\'s mockery is holy sarcasm — exposing the absurdity of worshipping a god who cannot hear, act, or respond. The prophet does not treat Baal with respectful dialogue; he ridicules him. False gods deserve exposure, not courtesy.'),
                ('18:36', 'MacArthur: Elijah\'s prayer is brief — about 30 words. The Baal prophets screamed for hours; Elijah prays one sentence. Effective prayer is not measured by length or volume but by the God it addresses. A sentence to the true God outweighs hours of screaming to an idol.'),
                ('18:39', 'MacArthur: "YHWH — he is God! YHWH — he is God!" The people\'s double confession is the chapter\'s theological climax. For one moment, the entire nation acknowledges the truth that Elijah\'s name declares: My God is YHWH.'),
            ],
            'wiseman': [
                ('18:19', 'Wiseman: Mount Carmel (modern Jebel Mar Elyas, 1,742 feet) projects into the Mediterranean at the northwest end of the Jezreel Valley. It was a boundary zone between Israelite and Phoenician territory — a natural location for a contest between YHWH and Baal. Archaeological surveys have identified ancient cultic sites on the mountain.'),
                ('18:33', 'Wiseman: The twelve water-pourings over the sacrifice and trench demonstrate the impossibility of natural combustion. In a three-year drought, water was extraordinarily precious — its lavish use underscores the boldness of Elijah\'s faith. The water likely came from the Mediterranean (Carmel overlooks the sea).'),
            ],
            'provan': [
                ('18:21', 'Provan: The Carmel contest is not merely a theological debate but a national covenant renewal. Elijah rebuilds the altar with twelve stones — reuniting the divided nation symbolically around YHWH\'s altar. For one moment on the mountain, Israel is whole again.'),
                ('18:38', 'Provan: The fire consumes not just the offering but the stones, soil, and water. This is overkill — a demonstration of power so excessive it eliminates all doubt. The narrator wants the reader to feel the same awe the people felt: this is no ordinary fire. This is God.'),
            ],
            'calvin': [
                ('18:21', 'Calvin: The double-minded — those who try to serve God and idols simultaneously — are worse off than outright pagans. At least the pagans are consistent. The compromiser insults God by putting him on equal footing with a lie. Lukewarm faith is the most dangerous state.'),
                ('18:39', 'Calvin: The people\'s confession is genuine but short-lived. By ch. 19, Jezebel is still in power and Elijah is fleeing for his life. Emotional responses to dramatic events do not constitute lasting faith. The fire on Carmel produced a confession; it did not produce a reformation.'),
            ],
            'netbible': [
                ('18:21', 'NET Note: <em>pōsĕḥîm</em> (limping/hobbling) — a participle suggesting ongoing, habitual wavering. The people have been limping for years. Elijah\'s question demands an end to the chronic condition. <em>Sĕʿippîm</em> (divided opinions/branches) implies a fork in the road: choose one path.'),
                ('18:38', 'NET Note: <em>wattippōl ʾēš-YHWH</em> (the fire of the LORD fell) — the subject is <em>ʾēš-YHWH</em>, fire belonging to and sent by YHWH. This is not lightning but theophanic fire — the same category as the burning bush (Exod 3:2) and the Sinai fire (Exod 19:18). It is God\'s personal presence in combustion.'),
            ],
        },
        {
            'header': 'Verses 41–46 — Rain Returns; Elijah Outruns Ahab\'s Chariot to Jezreel',
            'verses': verse_range(41, 46),
            'heb': [
                ('yad-YHWH', 'yad-Adonai', 'hand of the LORD', 'The hand of the LORD comes upon Elijah (v.46) — enabling a supernatural run from Carmel to Jezreel (~17 miles). The <em>yad YHWH</em> (hand of the LORD) is the term for prophetic empowerment (cf. Ezek 1:3; 3:14). The Spirit enables physical feats that nature cannot explain.'),
            ],
            'ctx': 'After fire, rain. Elijah tells Ahab to eat and drink — "for there is the sound of heavy rain." But there is no rain yet. Elijah goes to the summit of Carmel, bends to the ground, and sends his servant to look toward the sea seven times. On the seventh look: "A cloud as small as a man\'s hand is rising from the sea." Elijah sends a warning to Ahab, and then the sky turns black, wind rises, and torrential rain falls. Then the most extraordinary detail: "the power of the LORD came on Elijah and, tucking his cloak into his belt, he ran ahead of Ahab all the way to Jezreel." The prophet outruns a chariot — supernatural speed that caps the most supernatural day in Israelite history.',
            'cross': [
                ('Jas 5:18', '"Again he prayed, and the heavens gave rain, and the earth produced its crops." James completes the Elijah-prayer narrative: the same prayer that shut the heavens opens them.'),
                ('1 Kgs 19:1', 'But the very next verse begins: "Now Ahab told Jezebel everything Elijah had done." The triumph of Carmel is immediately followed by Jezebel\'s death threat. Victory does not eliminate opposition.'),
            ],
            'macarthur': [
                ('18:42', 'MacArthur: Elijah prays for rain with his face between his knees — the posture of intense, focused intercession. He has just demonstrated power before 450 prophets; now he humbles himself in private prayer. Public boldness and private humility are the marks of true prophetic character.'),
                ('18:44', 'MacArthur: "A cloud as small as a man\'s hand" — Elijah sees God\'s answer before it is visible to anyone else. Faith discerns what sight cannot yet detect. The prophet sees rain in a fist-sized cloud because he knows the character of the God who promised it.'),
                ('18:45', 'MacArthur: The sky turns black, wind comes, heavy rain falls. The three-year drought ends in a moment. What Baal could not do in three years, YHWH does in an instant. The speed of divine action reveals the totality of divine power.'),
                ('18:46', 'MacArthur: Running ahead of Ahab\'s chariot — about 17 miles — is a sign of prophetic empowerment. Elijah does not merely speak for God; the Spirit physically propels him. The prophet\'s body demonstrates what his mouth declared: YHWH is the God of power.'),
            ],
            'wiseman': [
                ('18:42', 'Wiseman: The distance from the Carmel summit to Jezreel (modern Zerin) is approximately 17 miles across the Jezreel Valley. For a man on foot to outrun a chariot team on this terrain required supernatural enablement, as the narrator explicitly states.'),
                ('18:44', 'Wiseman: The cloud "rising from the sea" — the Mediterranean, visible from Carmel\'s western summit — is the natural direction from which rain approached Palestine. The meteorological detail is precise: rain came from the west off the sea.'),
            ],
            'provan': [
                ('18:43', 'Provan: Seven looks before the cloud appears — the number of completeness and the number of creation. Elijah\'s patience in prayer matches the thoroughness of God\'s timing. The narrator builds suspense: six times nothing, then the tiny cloud that changes everything.'),
                ('18:46', 'Provan: The chapter ends with Elijah running through the rain ahead of Ahab\'s chariot — an image of exuberant prophetic power. But the narrator knows what the reader does not yet: the next chapter opens with Elijah running again — this time running away. The juxtaposition is devastating.'),
            ],
            'calvin': [
                ('18:42', 'Calvin: Elijah prays persistently for what God has already promised. The promise of rain does not eliminate the need for prayer; it grounds it. We pray not to inform God but to align our hearts with his purposes. Prayer is not the cause of God\'s action but the appointed means of it.'),
                ('18:46', 'Calvin: The supernatural run teaches that God equips his servants for every task — even physical ones. The same Spirit that gives wisdom gives strength. Nothing is beyond God\'s provision when it serves his purposes.'),
            ],
            'netbible': [
                ('18:44', 'NET Note: <em>ʿāb qĕṭannāh kĕkap-ʾîš</em> (a small cloud like a man\'s palm/hand) — the diminutive <em>qĕṭannāh</em> emphasizes how tiny the cloud is. The man\'s-palm comparison gives it a specific, memorable visual. Great things begin with small signs.'),
                ('18:46', 'NET Note: <em>wĕyad-YHWH hāyĕtāh ʾel-ʾĒliyyāhû</em> (the hand of the LORD was upon Elijah) — the standard formula for prophetic empowerment. In Ezekiel, this phrase precedes visionary experiences; here it enables physical prowess. The "hand of the LORD" is versatile: it empowers whatever the moment requires.'),
            ],
        },
    ],
})

ki1(19, {
    'title': 'Horeb: Jezebel\'s Threat, the Journey, and the Still Small Voice',
    'sections': [
        {
            'header': 'Verses 1–14 — Take My Life; the Angel Feeds; Forty Days to Horeb',
            'verses': verse_range(1, 14),
            'heb': [
                ('qôl dĕmāmāh daqqāh', 'kol demamah dakah', 'a sound of thin silence / a still small voice', 'The famous phrase of v.12 — <em>qôl dĕmāmāh daqqāh</em> — defies easy translation. <em>Qôl</em> = sound/voice; <em>dĕmāmāh</em> = silence/stillness; <em>daqqāh</em> = thin/fine/gentle. A "sound of thin silence" or "a gentle whisper." After wind, earthquake, and fire — God is in none of them. He is in the paradoxical sound that is almost silence. Power gives way to presence.'),
                ('rab', 'rav', 'enough', '"Enough, LORD!" (<em>rab</em>, v.4) — Elijah\'s prayer of exhaustion. One day after the greatest prophetic triumph in history, Elijah is suicidal. The word <em>rab</em> means "much, enough, sufficient." He has had enough — enough of the fight, enough of the isolation, enough of being the only one.'),
            ],
            'ctx': 'The juxtaposition is staggering. Chapter 18: Elijah calls fire from heaven and outruns a chariot. Chapter 19: Elijah collapses under a bush and asks to die. Jezebel\'s death threat — "May the gods deal with me, be it ever so severely, if by this time tomorrow I do not make your life like that of one of them" — undoes everything Carmel accomplished. Elijah flees south through Judah, into the Negev, and collapses. An angel feeds him twice — a 40-day journey to Horeb (Sinai), where Moses met God. At Horeb, God asks: "What are you doing here, Elijah?" The prophet pours out his complaint: "I alone am left." Then the theophany: wind, earthquake, fire — God is in none of them. Then the still small voice. God asks the same question. Elijah gives the same answer. Nothing has changed externally — but God has revealed something: he is not always in the spectacular. Sometimes he is in the whisper.',
            'cross': [
                ('Exod 19:16–18', 'The Sinai theophany: "thunder and lightning, a thick cloud, a very loud trumpet blast, fire and smoke." At Horeb, God reverses the Sinai pattern: the spectacular phenomena appear but God is not in them.'),
                ('Matt 17:3', 'Moses and Elijah appear with Jesus at the Transfiguration — both Horeb-visitors now meeting the one who is greater than Horeb.'),
                ('Rom 11:2–4', 'Paul cites Elijah\'s "I alone am left" and God\'s response about the 7,000 to demonstrate that God always preserves a remnant.'),
            ],
            'macarthur': [
                ('19:2', 'MacArthur: Jezebel\'s threat — after seeing 450 of her prophets killed and fire fall from heaven — shows that evidence does not produce faith in a hard heart. She witnessed God\'s power and responded with a death threat. The problem is not insufficient evidence but a resistant will.'),
                ('19:4', 'MacArthur: "I have had enough, LORD. Take my life." The greatest prophet in Israel\'s history is suicidal. This teaches that spiritual depression is not a sign of weak faith — it can follow the greatest spiritual victories. Exhaustion, isolation, and fear can overwhelm even the strongest.'),
                ('19:7', 'MacArthur: The angel feeds Elijah twice — bread and water, the same provision as the wilderness manna. God\'s first response to the depressed prophet is not rebuke but food. Physical needs precede spiritual counsel. A tired, hungry prophet needs rest before he needs a sermon.'),
                ('19:12', 'MacArthur: The still small voice teaches that God\'s most powerful communication is not always dramatic. Fire, wind, and earthquake serve God — but God himself comes in the whisper. After the noise of Carmel, Elijah needs to learn that God\'s normal mode is quiet faithfulness, not spectacular intervention.'),
            ],
            'wiseman': [
                ('19:8', 'Wiseman: The 40-day journey to Horeb covers approximately 200 miles through the Negev and Sinai Peninsula. The number 40 echoes Moses\'s 40 days on Sinai (Exod 24:18) and Israel\'s 40 years in the wilderness. Elijah retraces Israel\'s route in reverse — from the promised land back to the mountain of revelation.'),
                ('19:11', 'Wiseman: The sequence wind-earthquake-fire mirrors but reverses Sinai\'s theophany (Exod 19:16–18), where these phenomena accompanied God\'s presence. Here God is explicitly NOT in them — a theological correction. The God who once revealed himself in fire now reveals himself in silence.'),
            ],
            'provan': [
                ('19:4', 'Provan: Elijah\'s depression is the narrator\'s most human moment in the Elijah cycle. The prophet who spoke to heaven and received fire is now a man lying under a bush wishing for death. The narrator does not idealise his heroes — he shows them whole, including their brokenness.'),
                ('19:12', 'Provan: The still small voice is the theological centre of the Elijah cycle. It redefines what it means for God to be present. Carmel was spectacular but temporary. The whisper is ordinary but permanent. God\'s ongoing work in the world is more whisper than fire — and the whisper sustains what the fire only demonstrates.'),
            ],
            'calvin': [
                ('19:4', 'Calvin: Elijah\'s despair teaches that the greatest servants of God are still human. The same man who stood against 450 prophets cannot stand against one woman\'s threat. Human strength has limits; only divine strength is inexhaustible. This is why we need not just God\'s gifts but God himself.'),
                ('19:12', 'Calvin: The still small voice corrects our addiction to the spectacular. We want fire from heaven; God gives a whisper. We want dramatic intervention; God gives quiet faithfulness. The Christian life is lived mostly in the whisper, not the whirlwind. Learning to hear the whisper is the deepest form of spiritual maturity.'),
            ],
            'netbible': [
                ('19:4', 'NET Note: <em>rab ʿattāh YHWH qāḥ napšî</em> (enough now, LORD, take my life) — the imperative <em>qāḥ</em> (take!) is blunt and desperate. Elijah uses the same directness with God that he used with Ahab. His prayer is raw honesty, not polished piety.'),
                ('19:12', 'NET Note: <em>qôl dĕmāmāh daqqāh</em> — the three-word phrase is syntactically unusual. <em>Dĕmāmāh</em> (silence) qualified by <em>daqqāh</em> (thin/fine) creates an oxymoron: a sound made of silence. The paradox is the point — God\'s presence transcends the categories of loud and quiet.'),
            ],
        },
        {
            'header': 'Verses 15–21 — Three Commissions: Hazael, Jehu, Elisha; the Seven Thousand',
            'verses': verse_range(15, 21),
            'heb': [
                ('šibʿat ʾălāpîm', 'shivat alafim', 'seven thousand', 'God\'s response to "I alone am left" is devastating: "I reserve seven thousand in Israel" (v.18). Elijah is not alone — he never was. His isolation was perception, not reality. God\'s work is always larger than any individual prophet can see.'),
                ('hišlîk ʾaddartô', 'hishlich adarto', 'he threw his cloak', 'Elijah throws his cloak (<em>ʾadderet</em>) over Elisha (v.19) — a symbolic act of prophetic commissioning. The cloak represents prophetic authority (cf. 2 Kgs 2:8, 13–14). Elisha will literally inherit Elijah\'s mantle.'),
            ],
            'ctx': 'God\'s response to Elijah\'s despair is not comfort but commission: go anoint Hazael king of Aram, Jehu king of Israel, and Elisha as your successor. Three agents of judgment — two political, one prophetic — will execute what Elijah cannot accomplish alone. The 7,000 who have not bowed to Baal remind Elijah that God\'s work is vastly larger than his individual ministry. Elisha\'s call follows immediately: Elijah throws his cloak over him, Elisha slaughters his oxen, burns his ploughing equipment, and follows. The burning of the equipment is total — there is no going back. Discipleship costs everything.',
            'cross': [
                ('Rom 11:4', 'Paul quotes the 7,000 passage to prove that God always preserves a faithful remnant: "So too, at the present time there is a remnant chosen by grace."'),
                ('2 Kgs 2:13–14', 'Elisha picks up Elijah\'s fallen cloak after the chariot of fire and strikes the Jordan — the mantle-transfer prophecied here is completed there.'),
                ('Luke 9:62', '"No one who puts a hand to the plough and looks back is fit for service in the kingdom of God." Jesus echoes the radical commitment of Elisha\'s plough-burning.'),
            ],
            'macarthur': [
                ('19:15', 'MacArthur: God\'s response to depression is not sympathy but mission. "Go back the way you came" — return to the world and act. The cure for prophetic despair is not retreat but obedience. Purpose overcomes paralysis.'),
                ('19:17', 'MacArthur: Three commissions create a chain of judgment: Hazael will devastate Israel militarily; Jehu will destroy the house of Ahab; Elisha will continue the prophetic ministry. God\'s plans always have contingency and succession. No single servant is indispensable.'),
                ('19:18', 'MacArthur: "Seven thousand who have not bowed to Baal" — Elijah\'s despair was based on faulty information. He felt alone; he was not. God\'s faithful remnant is always larger than any prophet can see. Discouragement often stems from an incomplete picture.'),
                ('19:21', 'MacArthur: Elisha burns his ploughing equipment — the tools of his livelihood. There is no fallback position, no plan B. Discipleship that keeps an escape route open is not full discipleship. Following God requires burning the boats.'),
            ],
            'wiseman': [
                ('19:15', 'Wiseman: Hazael became king of Damascus c.843 BC, confirmed by Assyrian records (Shalmaneser III\'s annals). The Tel Dan Stele, discovered in 1993, contains Hazael\'s own account of his military campaigns against Israel and Judah. Elijah\'s commission here anticipates events that unfold across 2 Kings.'),
                ('19:16', 'Wiseman: Jehu\'s anointing is carried out by Elisha\'s servant in 2 Kgs 9:1–6 — the commission passes through the prophetic succession. The Nimrud Black Obelisk depicts Jehu (or his representative) prostrating before Shalmaneser III — the only visual image of an Israelite king.'),
            ],
            'provan': [
                ('19:18', 'Provan: The 7,000 is the narrator\'s correction of Elijah\'s self-pity. The prophet is not the only faithful person in Israel — he is one of 7,000. God\'s work does not depend on one man\'s heroism. This is simultaneously humbling (Elijah is not as unique as he thought) and encouraging (the cause is not lost).'),
                ('19:21', 'Provan: Elisha\'s radical response — killing the oxen, burning the plough, hosting a farewell feast — marks the most complete prophetic call narrative in Kings. Every tie to the old life is severed publicly. The community witnesses the break. There is no ambiguity about Elisha\'s commitment.'),
            ],
            'calvin': [
                ('19:18', 'Calvin: The 7,000 teach that God always preserves a remnant, even when the visible church seems utterly corrupted. Let no one say "the church is dead." God\'s people may be hidden, scattered, and oppressed — but they are never extinct. The invisible church endures when the visible church falls.'),
                ('19:21', 'Calvin: Elisha\'s burnt plough is the OT equivalent of the disciples leaving their nets. Total commitment is not negotiable for those called to prophetic ministry. Half-hearted service is no service at all. The cloak demands the whole person.'),
            ],
            'netbible': [
                ('19:18', 'NET Note: <em>wĕhišʾartî bĕYiśrāʾēl šibʿat ʾălāpîm</em> (I will preserve in Israel seven thousand) — the verb <em>hišʾartî</em> (hiphil of <em>šāʾar</em>) means "I will cause to remain" — active divine preservation, not passive survival. God keeps the remnant; the remnant does not keep itself.'),
                ('19:19', 'NET Note: <em>wayyašlēk ʾaddartô ʾēlāyw</em> (he threw his cloak upon him) — the <em>ʾadderet</em> (cloak/mantle) is the external symbol of prophetic authority. Throwing it over another person symbolises the transfer of that authority. This is prophetic ordination by symbolic action.'),
            ],
        },
    ],
})

print("\n1KI-5 complete: 1 Kings 17–19 built.")

# ─────────────────────────────────────────────────────────────────────────────
# 1KI-6: Chapters 20–22 — Ahab\'s End: Wars, Murder, Death
# ─────────────────────────────────────────────────────────────────────────────

ki1(20, {
    'title': 'Ahab\'s Wars with Ben-Hadad: Victory and Foolish Mercy',
    'sections': [
        {
            'header': 'Verses 1–21 — Ben-Hadad Besieges Samaria; a Prophet Announces Victory',
            'verses': verse_range(1, 21),
            'heb': [
                ('neʿārê śārê hammedînôt', 'nearei sarei hamedinot', 'young officers of the provincial governors', 'God promises victory through the <em>neʿārîm</em> (young men/officers, v.14) — 232 district commanders followed by 7,000 Israelite troops against Ben-Hadad\'s coalition. The small, unlikely force wins because God has decreed it. The purpose: "Then you will know that I am the LORD" (v.13). Victory serves revelation, not national pride.'),
            ],
            'ctx': 'Ben-Hadad of Aram besieges Samaria with 32 allied kings. His demands escalate from tribute to total humiliation. Ahab initially accepts, then refuses the second demand. A prophet (unnamed) promises victory: "I will deliver this vast army into your hands today, and then you will know that I am the LORD." The victory comes through the smallest unit — 232 young officers leading the charge. Ben-Hadad, drinking drunk in his tent, barely escapes. The chapter\'s theological point: God gives Ahab victory not because Ahab deserves it but because "they said, \'The LORD is a god of the hills but not of the valleys\'" (v.28). God fights for his own Name, not for Ahab\'s merit.',
            'cross': [
                ('Judg 7:2–7', 'Gideon\'s 300 — the same pattern of God using a small force to demonstrate that victory comes from him, not from military strength.'),
                ('Deut 20:1–4', '"When you go to war... do not be afraid of them, because the LORD your God will be with you." The Deuteronomic war laws promise divine presence in battle.'),
            ],
            'macarthur': [
                ('20:13', 'MacArthur: God sends a prophet to Ahab — the worst king in Israel — offering military salvation. Grace extends even to the most wicked. The purpose is revelation: "you will know that I am the LORD." God acts for his Name\'s sake, not for the recipient\'s worthiness.'),
                ('20:14', 'MacArthur: Victory through 232 young officers demonstrates God\'s pattern: the smaller the force, the greater the glory. When the instrument is obviously insufficient, the Author of victory is unmistakable.'),
                ('20:16', 'MacArthur: Ben-Hadad was "drinking himself drunk" while the battle began — the same dereliction that cost Elah his life (16:9). Military leaders who indulge themselves while others fight are a recurring judgment in Kings.'),
                ('20:21', 'MacArthur: Ahab defeats the Aramean coalition — a significant military achievement. But the victory belongs to God, not Ahab. The king who worships Baal is saved by YHWH. The irony is sharp and intended.'),
            ],
            'wiseman': [
                ('20:1', 'Wiseman: Ben-Hadad I of Damascus (if distinct from Ben-Hadad in 15:18) leads a coalition of 32 kings — reflecting the fragmented political landscape of the Levant. Assyrian records document similar coalitions of small Syro-Palestinian kingdoms.'),
                ('20:16', 'Wiseman: The note that Ben-Hadad was drinking in his "sukkoth" (booths/campaign shelters) reflects standard ANE military practice. Royal campaign tents with dining facilities are depicted in Assyrian reliefs.'),
            ],
            'provan': [
                ('20:13', 'Provan: The unnamed prophet\'s appearance is startling — Ahab has been God\'s enemy since ch. 16, yet God sends a prophet to save him. The narrator demonstrates that God\'s dealings with Ahab are not simple: judgment for apostasy coexists with grace for military deliverance. God\'s relationship with even the worst king is complex.'),
                ('20:14', 'Provan: The victory through 232 young officers follows the Gideon paradigm: God reduces the force to make the source of victory unmistakable. The narrator is building a case: even Ahab cannot deny that YHWH saved him. His continued apostasy is therefore doubly inexcusable.'),
            ],
            'calvin': [
                ('20:13', 'Calvin: God sends deliverance to Ahab — not because Ahab deserves it but because God\'s Name has been challenged. God protects his own honour even through ungrateful recipients. This is common grace: God sends rain on the righteous and the unrighteous alike.'),
                ('20:21', 'Calvin: The victory teaches that military success is not an indicator of spiritual standing. Ahab wins battles while losing his soul. The church must not confuse institutional success with divine approval. Many flourishing enterprises are under God\'s judgment.'),
            ],
            'netbible': [
                ('20:13', 'NET Note: The anonymous prophet (<em>nābîʾ ʾeḥāḏ</em>, "one prophet") is one of several unnamed prophets in the Ahab narrative (20:13, 22, 28, 35). The narrator uses anonymity to shift focus from the messenger to the message.'),
                ('20:20', 'NET Note: <em>wayyakkû ʾîš ʾîšô</em> (each man struck his man) — the distributive <em>ʾîš ʾîšô</em> indicates individual combat success. The young officers fought with personal initiative, not just formation discipline.'),
            ],
        },
        {
            'header': 'Verses 22–43 — Second Victory; Ahab Spares Ben-Hadad; the Prophet Condemns',
            'verses': verse_range(22, 43),
            'heb': [
                ('ḥerem', 'cherem', 'devoted to destruction', 'Ben-Hadad was under <em>ḥērem</em> — devoted to destruction (v.42). Ahab\'s treaty with him violates the same principle that cost Saul his kingdom when he spared Agag (1 Sam 15). The parallel is deliberate: a king who shows mercy where God demands judgment loses his throne.'),
            ],
            'ctx': 'Ben-Hadad\'s advisers claim YHWH is "a god of the hills" — so they move the battle to the plains. God sends a prophet: "Because the Arameans think the LORD is a god of the hills and not a god of the valleys, I will deliver this vast army into your hands." The second victory is total: 100,000 killed in one day. But then Ahab makes a treaty with Ben-Hadad instead of executing him — calling him "my brother." A prophet condemns Ahab using a parable (like Nathan to David): "You have set free a man I had determined should die. Therefore it is your life for his life, your people for his people."',
            'cross': [
                ('1 Sam 15:9–23', 'Saul spared Agag when God commanded herem. Samuel said: "To obey is better than sacrifice." Ahab\'s mercy toward Ben-Hadad repeats Saul\'s sin with the same consequence: the loss of his kingdom and his life.'),
                ('2 Sam 12:1–7', 'Nathan\'s parable to David. The prophetic parable technique — getting the king to condemn himself — is repeated here in vv.38–42.'),
            ],
            'macarthur': [
                ('20:28', 'MacArthur: God fights not for Ahab but for his own Name. "Because the Arameans think the LORD is a god of the hills and not the valleys" — God acts to correct a theological error. His reputation, not Israel\'s politics, drives the battle.'),
                ('20:34', 'MacArthur: Ahab\'s treaty with Ben-Hadad — "my brother" — substitutes diplomacy for obedience. The king makes a deal when God demanded destruction. Political pragmatism that contradicts divine command is always a fatal compromise.'),
                ('20:42', 'MacArthur: "Your life for his life, your people for his people." The sentence is exact: Ahab will die (ch. 22) and his dynasty will be destroyed (2 Kgs 9–10) because he released the man God sentenced. Disobedience has precise, proportional consequences.'),
                ('20:43', 'MacArthur: Ahab goes home "sullen and angry" — his characteristic response to prophetic confrontation (cf. 21:4). He cannot refute the prophet\'s word, so he sulks. This is the response of a man who knows the truth but refuses to submit to it.'),
            ],
            'wiseman': [
                ('20:34', 'Wiseman: The treaty terms — bazaars in Damascus, return of captured cities — reflect standard ANE vassal treaty provisions. Ben-Hadad offers commercial concessions in exchange for his life. The "bazaars" would be commercial districts under Israelite administration within the Aramean capital.'),
                ('20:35', 'Wiseman: The "sons of the prophets" (<em>bĕnê hannĕbîʾîm</em>) are professional prophetic guilds attested throughout the monarchic period. They appear repeatedly in the Elisha narratives (2 Kgs 2:3, 5, 7; 4:1, 38). The guild system provided institutional support for prophetic ministry.'),
            ],
            'provan': [
                ('20:34', 'Provan: Ahab\'s treaty with Ben-Hadad is the political equivalent of his religious syncretism. He compromises where God demands absoluteness. The narrator shows a consistent character flaw: Ahab always seeks the comfortable middle ground rather than full obedience. In religion, he mixes YHWH and Baal; in politics, he befriends God\'s enemies.'),
                ('20:42', 'Provan: The prophet\'s verdict — "your life for his life" — introduces the exchange principle that will govern Ahab\'s death in ch. 22. The narrative logic is retributive: the mercy Ahab showed to God\'s enemy will be repaid with the judgment Ahab should have executed.'),
            ],
            'calvin': [
                ('20:34', 'Calvin: Ahab\'s false mercy teaches that compassion directed against God\'s command is not virtue but disobedience. There is a kindness that kills — when we spare what God has sentenced, we invite judgment on ourselves. True mercy operates within God\'s will, not against it.'),
                ('20:42', 'Calvin: "Your life for his life" — precise retributive justice. God\'s sentences are exact. He does not punish vaguely or disproportionately. Every consequence matches its cause. This precision should comfort the righteous and terrify the rebellious.'),
            ],
            'netbible': [
                ('20:28', 'NET Note: <em>ʾĕlōhê hārîm</em> (god of the hills) vs. <em>ʾĕlōhê ʿămāqîm</em> (god of the valleys) — the Aramean theological error limits YHWH\'s jurisdiction to a specific terrain type. ANE deities were often associated with specific geographical features. YHWH\'s response demolishes all territorial limitations.'),
                ('20:42', 'NET Note: <em>ʾîš-ḥermî</em> (the man I devoted to destruction) — the <em>ḥērem</em> designation marks Ben-Hadad as under God\'s ban. Releasing a <em>ḥērem</em>-designated person is a covenant violation of the highest order (cf. Josh 6:17–19; 1 Sam 15:3).'),
            ],
        },
    ],
})

ki1(21, {
    'title': 'Naboth\'s Vineyard: Judicial Murder and Prophetic Confrontation',
    'sections': [
        {
            'header': 'Verses 1–16 — Jezebel\'s Plot: False Witnesses, Fabricated Charges, Murder',
            'verses': verse_range(1, 16),
            'heb': [
                ('naḥălat ʾăbōtāy', 'nachalat avotay', 'inheritance of my fathers', 'Naboth refuses to sell because the land is his <em>naḥălāh</em> (ancestral inheritance, v.3). Under Torah law (Lev 25:23–28; Num 36:7), ancestral land was inalienable — it belonged to the family in perpetuity. Naboth\'s refusal is not stubbornness but covenant obedience. He honours God\'s law over the king\'s desire.'),
                ('bĕliyyaʿal', 'beliyaal', 'worthless/wicked men', 'Jezebel procures <em>bĕnê bĕliyyaʿal</em> (worthless men, v.10) to give false testimony against Naboth. The term <em>bĕliyyaʿal</em> (later "Belial" — a name for Satan) denotes persons devoid of moral worth. Jezebel corrupts the judicial system by weaponising its forms: elders, fasting, witnesses, execution — all legally correct in form, totally corrupt in substance.'),
            ],
            'ctx': 'Naboth\'s vineyard is the moral nadir of Ahab\'s reign. Ahab wants the vineyard; Naboth refuses on covenantal grounds. Ahab sulks. Jezebel takes over: she forges letters in Ahab\'s name, proclaims a fast (implying a national crisis), seats Naboth in a place of honour (setting him up), hires false witnesses to accuse him of blasphemy, and has him stoned. Then she tells Ahab: "Get up and take possession." The entire operation is a masterclass in institutional evil — every step follows legal procedure while violating every principle the law was designed to protect. The narrator shows how power corrupts justice: the same legal system that should protect Naboth is turned into the instrument of his murder.',
            'cross': [
                ('Lev 25:23', '"The land must not be sold permanently, because the land is mine." Naboth\'s refusal is grounded in this Levitical principle — the land belongs to God, not to kings.'),
                ('Deut 19:15–21', 'The two-witness requirement for capital cases. Jezebel technically complies with the form while perverting the substance.'),
                ('2 Kgs 9:25–26', 'Jehu throws Joram\'s body onto Naboth\'s plot, fulfilling Elijah\'s prophecy from this chapter.'),
            ],
            'macarthur': [
                ('21:3', 'MacArthur: "The LORD forbid that I should give you the inheritance of my ancestors." Naboth\'s refusal is covenant loyalty at its finest. He risks the king\'s wrath to honour God\'s law. This is the kind of faithfulness that costs everything — and Naboth pays the ultimate price.'),
                ('21:7', 'MacArthur: "Is this how you act as king over Israel?" Jezebel\'s contempt reveals her Phoenician understanding of kingship: the king takes what he wants. Israelite kingship is fundamentally different — the king is under the law, not above it. Jezebel cannot comprehend a king limited by covenant.'),
                ('21:10', 'MacArthur: Jezebel\'s judicial murder uses every form of justice while emptying justice of all substance. This is the most dangerous form of evil: corruption clothed in legal procedure. The system designed to protect the innocent becomes the weapon that destroys them.'),
                ('21:16', 'MacArthur: "Ahab got up to go down and take possession." He does not even protest. He accepts the stolen vineyard knowing how it was obtained. Passive complicity in evil is not innocence — it is participation. Ahab\'s silence makes him guilty.'),
            ],
            'wiseman': [
                ('21:1', 'Wiseman: Jezreel (modern Zerin) was Ahab\'s secondary capital — a winter palace in the fertile Jezreel Valley, in addition to the hilltop capital Samaria. Excavations have identified monumental Iron Age remains at the site. Naboth\'s vineyard would have been adjacent to the royal property.'),
                ('21:10', 'Wiseman: The charge of "cursing God and the king" combines two capital offenses under Israelite law (Exod 22:28; Lev 24:15–16). By fabricating a dual charge, Jezebel ensures the death penalty. The judicial process follows correct form — elders, public assembly, witnesses — making the corruption harder to detect.'),
            ],
            'provan': [
                ('21:3', 'Provan: Naboth\'s refusal stands as the narrative\'s moral standard. He is the faithful Israelite — the opposite of Ahab. He honours Torah over power, covenant over convenience, God over king. The narrator presents him as a martyred saint, killed for obeying the law the king should have upheld.'),
                ('21:7', 'Provan: Jezebel\'s "Is this how you act as king?" exposes the clash between two models of kingship: the Deuteronomic king (under law, serving the people) and the Canaanite/Phoenician king (above law, served by the people). The entire book of Kings is this conflict in narrative form.'),
            ],
            'calvin': [
                ('21:3', 'Calvin: Naboth\'s courage teaches that obedience to God may cost us everything — property, reputation, life itself. But the inheritance he refused to surrender was God\'s land, not his own. He was a steward, and stewards answer to their Master, not to earthly kings.'),
                ('21:10', 'Calvin: The false witnesses teach that the most dangerous injustice wears the mask of legality. When courts are corrupted, when procedure serves power instead of truth, the last refuge of the oppressed is gone. This is why an independent judiciary is not a political luxury but a moral necessity.'),
            ],
            'netbible': [
                ('21:3', 'NET Note: <em>ḥālîlāh llî mēYHWH</em> (far be it from me before the LORD) — literally "profanation to me from YHWH." Naboth considers selling ancestral land not merely unwise but sacrilegious — a desecration of God\'s covenant arrangement for land tenure.'),
                ('21:10', 'NET Note: <em>bērakĕtā ʾĕlōhîm wāmelek</em> (you have cursed God and the king) — the verb <em>bērak</em> here is a euphemism for "cursed" (the same euphemistic use appears in Job 1:5, 11; 2:5, 9). Scribes substituted "bless" for "curse" to avoid writing "curse God."'),
            ],
        },
        {
            'header': 'Verses 17–29 — Elijah Confronts Ahab: Dogs Will Lick Your Blood',
            'verses': verse_range(17, 29),
            'heb': [
                ('hăraṣaḥtā wĕgam-yāraštā', 'haratzachta vegam-yarashta', 'have you murdered and also taken possession?', 'Elijah\'s accusation (v.19) is two words in Hebrew: "murder" and "possess." The starkness is intentional — no mitigation, no qualification, no context. The prophet strips Ahab\'s crime to its essence: you killed a man and stole his land. The simplicity of the charge makes it unanswerable.'),
            ],
            'ctx': 'God sends Elijah to Naboth\'s vineyard with a single devastating question: "Have you murdered and also taken possession?" The prophecy is specific: dogs will lick Ahab\'s blood in the same place they licked Naboth\'s. Jezebel will be eaten by dogs at the wall of Jezreel. Every male in Ahab\'s house will be destroyed. Then — remarkably — Ahab repents. He tears his clothes, puts on sackcloth, fasts, and "went around meekly." God responds to Elijah: "Have you noticed how Ahab has humbled himself? Because he has humbled himself, I will not bring this disaster in his day." The disaster is delayed, not cancelled. Ahab\'s repentance is genuine enough to delay judgment but not thorough enough to avert it.',
            'cross': [
                ('2 Kgs 9:26', '"Yesterday I saw the blood of Naboth and the blood of his sons." Jehu fulfils the Naboth prophecy at the very field where Naboth was murdered.'),
                ('2 Kgs 9:36', '"This is the word of the LORD: Dogs will devour Jezebel\'s flesh." Fulfilled exactly — dogs ate Jezebel at Jezreel.'),
                ('Jonah 3:10', 'Nineveh\'s repentance delays judgment. Ahab\'s repentance follows the same pattern — genuine humility, even from the worst, earns God\'s merciful delay.'),
            ],
            'macarthur': [
                ('21:19', 'MacArthur: Elijah confronts Ahab at the crime scene — Naboth\'s vineyard. The prophet appears exactly where the crime occurred, making it impossible for Ahab to forget what he has done. God\'s messengers confront sin at its source.'),
                ('21:20', 'MacArthur: "You have sold yourself to do evil in the eyes of the LORD." The commercial metaphor is devastating: Ahab has traded his soul for a vineyard. The transaction echoes Esau selling his birthright for a meal (Gen 25:34). The price of sin is always absurdly low compared to what is lost.'),
                ('21:27', 'MacArthur: Ahab\'s repentance is the most surprising turn in his narrative. The worst king of Israel humbles himself — and God notices. "Have you noticed how Ahab has humbled himself before me?" Even partial repentance from the worst sinner moves God to mercy. This is the character of divine grace.'),
                ('21:29', 'MacArthur: Judgment is delayed but not cancelled. Ahab\'s repentance buys time — the disaster falls on his son instead. Partial repentance produces partial reprieve. Only thorough, lasting repentance averts judgment completely.'),
            ],
            'wiseman': [
                ('21:19', 'Wiseman: The Naboth vineyard site would have been identifiable in the vicinity of the Jezreel royal compound. Archaeological surveys of the area have identified agricultural terracing and vine-press installations consistent with vineyard cultivation adjacent to the mound.'),
                ('21:27', 'Wiseman: Royal repentance in sackcloth and fasting is attested in ANE texts. The Assyrian king Esarhaddon performed penitential rituals during times of omen-related anxiety. Sackcloth was the universal Near Eastern garment of mourning and humiliation.'),
            ],
            'provan': [
                ('21:19', 'Provan: Elijah\'s two-verb accusation is the narrator\'s most compressed prophetic speech. No elaboration, no theological framework — just the raw charge. The simplicity mirrors the crime: the case is not complex. Murder and theft. The prophet needs no rhetoric because the facts speak for themselves.'),
                ('21:29', 'Provan: God\'s response to Ahab\'s repentance is the most theologically generous moment in Ahab\'s story. Even for the worst king, God\'s mercy is available. The narrator is not soft on Ahab — the judgment stands — but he shows that God\'s character is consistent: "he is patient... not wanting anyone to perish, but everyone to come to repentance" (2 Pet 3:9).'),
            ],
            'calvin': [
                ('21:20', 'Calvin: "You have sold yourself to do evil." The language of spiritual slavery — Ahab is no longer a free agent but a bondslave of sin. This is the end of every path of persistent rebellion: the sinner loses the ability to choose otherwise. Freedom is lost one compromise at a time.'),
                ('21:29', 'Calvin: Even Ahab\'s imperfect repentance moves God. How much more will genuine, wholehearted repentance! If God shows mercy to the worst on the basis of incomplete humility, how much grace is available to those who truly turn? Let no sinner say "I am too far gone." Ahab was further.'),
            ],
            'netbible': [
                ('21:19', 'NET Note: <em>hăraṣaḥtā wĕgam-yāraštā</em> (have you murdered and also inherited/possessed?) — the two verbs form a devastating pair. <em>Rāṣaḥ</em> (murder) is the Sixth Commandment verb; <em>yāraš</em> (take possession) is the covenant term for inheriting the promised land. Ahab has murdered to take what only God grants.'),
                ('21:27', 'NET Note: <em>wayyiḵnāʿ</em> (he humbled himself) — the niphal of <em>kānaʿ</em> (to be subdued/humbled). The same verb appears in 2 Chr 7:14: "If my people... humble themselves (<em>wĕyiḵḵānĕʿû</em>)." Ahab\'s action matches God\'s prescription exactly — and God responds as promised.'),
            ],
        },
    ],
})

ki1(22, {
    'title': 'Micaiah\'s Prophecy; Ahab Dies at Ramoth Gilead',
    'sections': [
        {
            'header': 'Verses 1–28 — 400 Prophets Say Go; Micaiah Says Disaster',
            'verses': verse_range(1, 28),
            'heb': [
                ('rûaḥ šeqer', 'ruach sheker', 'lying spirit', 'God sends a <em>rûaḥ šeqer</em> (lying spirit, v.22) to entice Ahab through the mouths of 400 prophets. This is one of the most theologically challenging passages in the OT: God himself commissions deception to accomplish judgment. The lying spirit is God\'s instrument — permitted, directed, and purpose-driven — not an autonomous deceiver.'),
                ('qāḏaš', 'kadash', 'set apart', 'Micaiah\'s vision of God\'s heavenly council (vv.19–23) is the OT\'s most detailed depiction of divine deliberation. God asks "Who will entice Ahab?" — not because he lacks power but because he governs through intermediary agents. The council scene reveals that heaven is actively engaged in earthly events.'),
            ],
            'ctx': 'Three years of peace between Israel and Aram end when Ahab decides to retake Ramoth Gilead. Jehoshaphat of Judah joins the campaign but requests "a prophet of the LORD." Four hundred court prophets say "Go!" — but Jehoshaphat senses they are not genuine. Micaiah is summoned and initially mimics the 400, then delivers the true word: Israel scattered on the hills "like sheep without a shepherd." He then reveals the heavenly council scene: God deliberately sent a lying spirit to entice Ahab to his death. Micaiah is slapped and imprisoned. The scene is a study in the politics of prophecy: 400 prophets say what the king wants to hear; one says what God actually said. The majority is wrong; the lone dissenter is right.',
            'cross': [
                ('Job 1:6–12', 'Satan appears before God\'s heavenly council and receives permission to test Job. The same pattern: God permits an agent to accomplish a purpose that serves divine justice.'),
                ('2 Chr 18:18–22', 'The Chronicler\'s identical account — one of the closest parallels between Kings and Chronicles.'),
                ('Deut 13:1–3', '"If a prophet... announces a sign that takes place, and he says, \'Let us follow other gods\' — you must not listen." God may test his people through prophetic deception to expose their hearts.'),
            ],
            'macarthur': [
                ('22:7', 'MacArthur: Jehoshaphat\'s instinct — "Is there no longer a prophet of the LORD here?" — recognises that 400 court prophets are not genuine. Numbers do not equal truth. The majority opinion is irrelevant when it contradicts God\'s word.'),
                ('22:14', 'MacArthur: "I can tell him only what the LORD tells me." Micaiah\'s declaration is the essence of prophetic integrity. The prophet speaks God\'s word regardless of consequences — imprisonment, violence, death. The messenger is accountable to the one who sent the message.'),
                ('22:19', 'MacArthur: The heavenly council vision reveals that what happens on earth is first decided in heaven. Ahab\'s death is not random — it is divinely decreed, deliberated, and executed through specific agents. History is providence in disguise.'),
                ('22:23', 'MacArthur: "The LORD has decreed disaster for you." The 400 prophets are instruments of God\'s judgment, not merely liars. They speak falsehood because God has permitted the lying spirit. This is the most severe form of divine judgment: when God removes the restraint on deception and lets the self-deceived believe their own lies (cf. 2 Thess 2:11).'),
            ],
            'wiseman': [
                ('22:1', 'Wiseman: The three years of peace between Israel and Aram (v.1) fit the period after the Battle of Qarqar (853 BC), where Ahab and Ben-Hadad fought together against Shalmaneser III of Assyria. The Kurkh Monolith inscription of Shalmaneser III lists "Ahab the Israelite" contributing 2,000 chariots and 10,000 soldiers — the largest chariot force in the coalition.'),
                ('22:10', 'Wiseman: The kings sitting on thrones at the threshing floor by the gate of Samaria mirrors ANE judicial and diplomatic settings. Threshing floors served as open-air assembly points for legal proceedings and royal audiences (cf. Ruth 3; 2 Sam 24:18).'),
            ],
            'provan': [
                ('22:19', 'Provan: The heavenly council scene is the narrator\'s theological explanation for the 400 prophets\' false message. They are not merely corrupt — they are instruments in a divine plan. God uses their eagerness to please the king as the mechanism of his judgment. The scene reveals that even false prophecy operates under divine sovereignty.'),
                ('22:28', 'Provan: Micaiah\'s final words — "Mark my words, all you people!" — are a public challenge. If Ahab returns safely, Micaiah is a false prophet. If he does not, the 400 are false. The chapter will answer the test definitively.'),
            ],
            'calvin': [
                ('22:19', 'Calvin: The lying spirit teaches that God governs even the kingdom of darkness. Satan and his agents operate only within the boundaries God sets. This is not dualism — evil has no independent sovereignty. The lying spirit serves God\'s justice whether it knows it or not.'),
                ('22:28', 'Calvin: Micaiah stands alone against 400 prophets, the king, and the entire court. Truth is not determined by majority vote. One voice speaking God\'s word outweighs a thousand voices speaking human invention. The church must remember this in every age.'),
            ],
            'netbible': [
                ('22:19', 'NET Note: <em>rāʾîtî ʾet-YHWH yōšēb ʿal-kisʾô</em> (I saw the LORD sitting on his throne) — Micaiah claims direct visionary access to God\'s council (<em>sôd YHWH</em>). This is the prophetic credentialing par excellence: the true prophet has stood in the divine council (cf. Jer 23:18, 22).'),
                ('22:22', 'NET Note: <em>rûaḥ šeqer bĕpî kol-nĕbîʾāyw</em> (a lying spirit in the mouths of all his prophets) — the spirit is God\'s commissioned agent. The lying is divinely permitted and directed. This passage is the OT\'s strongest assertion that God can use deception as an instrument of judgment against those who have already committed themselves to falsehood.'),
            ],
        },
        {
            'header': 'Verses 29–53 — Ahab Disguised; a Random Arrow; the Kingdom Continues',
            'verses': verse_range(29, 53),
            'heb': [
                ('lĕtummô', 'letummo', 'at random / in his innocence', 'The arrow that kills Ahab is shot <em>lĕtummô</em> (v.34) — "in his innocence/simplicity," meaning the archer drew his bow at random without aiming at anyone specific. The narrator\'s point is devastating: a random arrow accomplishes what a divine decree ordained. Providence operates through contingency. Ahab\'s disguise cannot defeat a "random" arrow guided by God\'s hand.'),
            ],
            'ctx': 'Ahab disguises himself to avoid Micaiah\'s prophecy — but sends Jehoshaphat into battle in his royal robes. Ahab\'s cowardice nearly gets Jehoshaphat killed when the Aramean chariots pursue the robed king. But an unnamed soldier draws his bow "at random" and strikes Ahab between the sections of his armour — the one vulnerable spot in his protection. Ahab bleeds out in his chariot all day, propped up facing the Arameans, and dies at sunset. His blood pools in the chariot floor; when it is washed at the pool of Samaria, dogs lick the blood — fulfilling Elijah\'s prophecy (21:19). The narrator closes the Ahab narrative with the standard formula, then quickly records Jehoshaphat\'s 25-year reign and Ahaziah\'s brief evil reign.',
            'cross': [
                ('1 Kgs 21:19', '"In the place where dogs licked up Naboth\'s blood, dogs will lick up your blood — yes, yours!" Fulfilled at the pool of Samaria where Ahab\'s chariot blood is washed.'),
                ('Prov 16:33', '"The lot is cast into the lap, but its every decision is from the LORD." The "random" arrow is the proverb enacted: human contingency, divine sovereignty.'),
                ('2 Kgs 9:25–26', 'Jehu recalls the Naboth prophecy when he kills Ahab\'s son Joram. The Naboth curse pursues the dynasty for two generations.'),
            ],
            'macarthur': [
                ('22:30', 'MacArthur: Ahab disguises himself but sends Jehoshaphat in royal robes — using his ally as a decoy. This is cowardice compounded by treachery. The man who could not face Naboth honestly cannot face the battlefield honestly. Character is consistent.'),
                ('22:34', 'MacArthur: "A certain man drew his bow at random." From the human perspective, it is chance. From the divine perspective, it is precision. The arrow finds the one gap in Ahab\'s armour — the joint between breastplate and scale-armour. No disguise can protect the man God has sentenced.'),
                ('22:38', 'MacArthur: Dogs licking Ahab\'s blood at the pool of Samaria fulfils Elijah\'s prophecy word for word. The narrator explicitly notes the fulfilment: "as the word of the LORD had declared." Every prophetic word finds its match in history.'),
                ('22:43', 'MacArthur: Jehoshaphat "did what was right in the eyes of the LORD" — a positive evaluation that provides relief after the Ahab narrative. But the familiar caveat follows: "the high places were not removed." The pattern of incomplete reform continues in Judah.'),
            ],
            'wiseman': [
                ('22:34', 'Wiseman: The description of Ahab\'s wound — an arrow penetrating between the joints of armour (<em>bên haddĕbāqîm ûbên hašširyōn</em>) — reflects detailed knowledge of contemporary military equipment. Composite scale armour with jointed sections is well attested in archaeological finds from Iron Age Palestine and Assyria.'),
                ('22:39', 'Wiseman: Ahab\'s "ivory house" (<em>bêt haššēn</em>) is confirmed by the spectacular ivory carvings discovered in the Samaria excavations — hundreds of carved ivory plaques and furniture inlays in Phoenician style, datable to the Omride period.'),
            ],
            'provan': [
                ('22:34', 'Provan: The "random" arrow is the chapter\'s theological climax. All of Ahab\'s efforts to evade the prophetic word — the disguise, the decoy, the positioning — fail against a single arrow shot without aim. The narrator\'s message: you cannot outrun God\'s word. Providence finds you through the most unlikely instruments.'),
                ('22:38', 'Provan: The dogs and the blood are the closing image of Ahab\'s story. The king who took Naboth\'s vineyard by blood pays with his own blood in the presence of dogs. The poetic justice is exact: measure for measure. The narrator trusts the reader to recall Elijah\'s words without restating them.'),
            ],
            'calvin': [
                ('22:34', 'Calvin: The "random" arrow teaches that there is no such thing as chance in God\'s universe. What appears accidental to the archer is precise to the Almighty. Not a sparrow falls without the Father\'s knowledge; not an arrow flies without his direction.'),
                ('22:38', 'Calvin: The fulfilment of Elijah\'s prophecy — dogs licking Ahab\'s blood — demonstrates that God\'s word is self-executing. It does not need human enforcement; it accomplishes itself through the ordinary course of events. The prophet speaks; history obeys.'),
            ],
            'netbible': [
                ('22:34', 'NET Note: <em>lĕtummô</em> (at random / in innocence) — from <em>tōm</em> (integrity, completeness). The archer shoots in simple, unintentional fashion. The narrator uses the word to emphasize the total absence of human design — making the divine design unmistakable.'),
                ('22:38', 'NET Note: <em>kaḏĕbar YHWH ʾăšer dibbēr</em> (according to the word of the LORD which he spoke) — the fulfilment formula closing Ahab\'s story. The narrator traces the entire chain: Elijah\'s word (21:19) → divine decree (22:19–23) → arrow (22:34) → dogs (22:38). Prophecy, decree, instrument, and fulfilment form a seamless chain.'),
            ],
        },
    ],
})

print("\n1KI-6 complete: 1 Kings 20–22 built. ALL 22 CHAPTERS DONE.")


# ─────────────────────────────────────────────────────────────────────────────
# 1KI-4: Chapters 13–16 — Prophets and Kings: Rapid Decline in Both Kingdoms
# ─────────────────────────────────────────────────────────────────────────────

ki1(13, {
    'title': 'The Man of God from Judah; the Old Prophet\'s Deception',
    'sections': [
        {
            'header': 'Verses 1–10 — The Man of God Confronts Jeroboam\'s Altar at Bethel',
            'verses': verse_range(1, 10),
            'heb': [
                ('ʾîš hāʾĕlōhîm', 'ish haElohim', 'man of God', 'The unnamed prophet is called <em>ʾîš hāʾĕlōhîm</em> (man of God) — a title of prophetic authority used for Moses (Deut 33:1), Samuel (1 Sam 9:6), and Elijah (1 Kgs 17:18). His anonymity is significant: his identity is less important than his message. He is a vessel for the divine word, not a personality.'),
                ('mōpēt', 'mofet', 'sign/portent', 'The altar splitting and ashes pouring out (v.5) is a <em>mōpēt</em> — a prophetic sign that authenticates the word spoken. The withering and restoration of Jeroboam\'s hand (vv.4–6) further demonstrates that the prophet speaks with divine authority. Even the king\'s body is subject to the prophet\'s God.'),
            ],
            'ctx': 'The man of God from Judah delivers one of the most remarkable prophecies in the Old Testament: he names Josiah by name approximately 300 years before Josiah\'s birth (v.2, fulfilled in 2 Kgs 23:15–18). The prophecy is accompanied by immediate signs — the altar splits, ashes pour out, and Jeroboam\'s hand withers when he commands the prophet\'s arrest. The king who can control an entire religious system cannot control his own hand when it opposes God\'s messenger. The prophet is commanded not to eat or drink in the northern kingdom and not to return by the same route — a symbolic rejection of fellowship with the apostate shrine.',
            'cross': [
                ('2 Kgs 23:15–18', 'Josiah destroys the Bethel altar and burns bones on it — except the bones of the man of God from Judah, whose tomb is spared. The prophecy finds exact fulfilment three centuries later.'),
                ('Amos 3:14', '"On the day I punish Israel for her sins, I will destroy the altars of Bethel; the horns of the altar will be cut off." Amos confirms the same judgment on the same altar.'),
            ],
            'macarthur': [
                ('13:2', 'MacArthur: The naming of Josiah 300 years before his birth is one of the most striking examples of predictive prophecy in the Old Testament. Only Isaiah\'s naming of Cyrus (Isa 44:28) is comparable. This level of specificity demonstrates that biblical prophecy is not educated guessing but divine revelation.'),
                ('13:4', 'MacArthur: Jeroboam stretches out his hand to seize the prophet and it immediately withers. The irony is devastating: the hand that reached for unauthorized religious authority now cannot even function. Physical power is useless against the word of God.'),
                ('13:6', 'MacArthur: Jeroboam asks the prophet to pray for healing — and receives it. Even the enemy of God benefits from God\'s mercy when a prophet intercedes. But the healing does not produce repentance. Jeroboam is restored physically but remains unchanged spiritually.'),
                ('13:9', 'MacArthur: The command not to eat or drink in the northern kingdom symbolises complete separation from Jeroboam\'s religious system. Fellowship with idolatry is forbidden even in its most innocent forms — sharing a meal. The prohibition is absolute.'),
            ],
            'wiseman': [
                ('13:2', 'Wiseman: The naming of a future king centuries in advance is paralleled in ANE literature only by scribal retrojection — editing a text after the event to appear prophetic. Critical scholars often date this oracle to the Josianic period. Conservative scholars argue that the narrative assumes the prophecy\'s antiquity, since the story makes no sense without the tension between prediction and fulfilment across centuries.'),
                ('13:5', 'Wiseman: The sign of the altar splitting corresponds to known earthquake damage patterns at ancient ANE altars. Whether this was a localised seismic event or a purely miraculous act, the narrative presents it as divine intervention confirming the prophetic word.'),
            ],
            'provan': [
                ('13:2', 'Provan: The specificity of the Josiah prophecy creates a narrative thread that spans the entire Deuteronomistic History. The reader of 1 Kings 13 is meant to remember this verse when reading 2 Kings 23. The narrative is constructed as a single literary work in which prophetic words spoken early find fulfilment late.'),
                ('13:9', 'Provan: The prohibition against eating and drinking is a performative parable: the prophet\'s behaviour <em>enacts</em> God\'s rejection of Bethel. By refusing hospitality, the man of God declares the northern cult illegitimate more powerfully than any speech could.'),
            ],
            'calvin': [
                ('13:4', 'Calvin: God humbles Jeroboam\'s arrogance instantly. The king who dared to arrest God\'s messenger finds his own arm paralysed. Let every ruler learn: you may command armies, but you cannot command the arm of God. When earthly power opposes heaven, earth always loses.'),
                ('13:6', 'Calvin: The healing of Jeroboam\'s hand teaches that God\'s mercy extends even to his enemies. But mercy rejected hardens rather than softens. Jeroboam receives healing but not conversion — the most dangerous spiritual condition: to experience God\'s power without being changed by it.'),
            ],
            'netbible': [
                ('13:2', 'NET Note: The phrase <em>hinnēh-bēn nôlād lĕbêt-Dāwid Yōʾšiyyāhû šĕmô</em> (behold, a son will be born to the house of David, Josiah by name) uses the niphal participle <em>nôlād</em> (being born) — a prophetic present tense. The prophecy treats the future birth as already in process.'),
                ('13:5', 'NET Note: <em>wayyiqqāraʿ hammizbeaḥ</em> (the altar was torn apart) — the niphal of <em>qāraʿ</em> (to tear) connects to Ahijah\'s symbolic tearing of the cloak (11:30). Tearing is the dominant metaphor of 1 Kings: kingdom torn, altar torn, garment torn — all because the covenant was torn.'),
            ],
        },
        {
            'header': 'Verses 11–34 — The Old Prophet\'s Lie; the Lion on the Road',
            'verses': verse_range(11, 34),
            'heb': [
                ('nābîʾ zāqēn', 'navi zaken', 'old prophet', 'The old prophet of Bethel is a deeply ambiguous figure. He is a genuine <em>nābîʾ</em> (prophet) — he prophesies truthfully over the dead man\'s body (vv.21–22) — but he lies to lure the man of God back (v.18). The story demonstrates that prophetic gifting and personal integrity do not always coincide.'),
                ('kikkār leḥem', 'kikkar lechem', 'loaf of bread', 'The shared meal (v.19) violates the divine command of v.9. The man of God eats and drinks in the territory he was commanded to reject. The bread becomes the instrument of disobedience — a communion meal that should never have happened.'),
            ],
            'ctx': 'This is one of the most troubling narratives in the Old Testament. The man of God resists Jeroboam\'s invitation but succumbs to the old prophet\'s lie — "An angel spoke to me by the word of the LORD: Bring him back." The deception works because it sounds plausible: surely God could change his instructions through another prophet? But the man of God had a direct command from God and should have trusted it over any secondary voice. The lion that kills him but does not eat the body or attack the donkey is a supernatural sign — the death is judicial, not random. The old prophet himself recognises this: he buries the man of God and instructs his sons to bury him in the same tomb, honouring the fallen prophet and confirming the truth of his original word against Bethel.',
            'cross': [
                ('Gal 1:8', '"Even if we or an angel from heaven should preach a gospel other than the one we preached to you, let them be under God\'s curse." Paul\'s principle directly addresses the scenario of 1 Kings 13 — a secondary messenger contradicting the original word.'),
                ('Deut 13:1–3', '"If a prophet appears among you... and announces a sign or wonder, and if the sign comes true but says, \'Let us follow other gods,\' you must not listen." A true sign from a false message is still a test.'),
            ],
            'macarthur': [
                ('13:18', 'MacArthur: "He lied to him." The narrator states it bluntly. No ambiguity, no mitigating circumstances. A prophet of God lied. The man of God\'s error was believing a human voice over a divine command he had already received. When God has spoken clearly, no secondary revelation can override it.'),
                ('13:24', 'MacArthur: The lion kills but does not eat; the donkey stands beside the body. This is not natural animal behaviour — it is a sign. The death is judicial punishment, not predatory accident. God is making a point visible to anyone who passes by: disobedience to the divine word has consequences, even for prophets.'),
                ('13:26', 'MacArthur: The old prophet interprets the death correctly: "It is the man of God who disobeyed the word of the LORD." Even the deceiver recognises the justice of the punishment. The irony is searing: the one who caused the disobedience is the one who explains its meaning.'),
                ('13:33', 'MacArthur: The chapter closes with Jeroboam utterly unchanged: "he did not change his evil ways." Neither miracle, nor prophecy, nor the dramatic death of a prophet on the road produces repentance. Hardened hearts are not softened by signs but only by the sovereign work of God.'),
            ],
            'wiseman': [
                ('13:24', 'Wiseman: Lions were present in ancient Palestine until the Crusader period. The Asiatic lion (Panthera leo persica) is attested in Assyrian hunting reliefs and in biblical references (Judg 14; 1 Sam 17:34; 2 Kgs 17:25). A lion killing a traveller was not extraordinary; a lion standing beside the body without eating it was.'),
                ('13:31', 'Wiseman: The old prophet\'s request to be buried in the same tomb as the man of God reflects ANE beliefs about the power of proximity to holy figures. By sharing a burial, the old prophet places himself under the protection of the prophetic word he himself confirmed.'),
            ],
            'provan': [
                ('13:18', 'Provan: The old prophet\'s lie is the narrative\'s most disturbing element because it raises the question of discernment: how does a prophet distinguish between a genuine word from God and a compelling lie? The answer the text provides is stark: the original, clear command takes precedence over any subsequent claim to override it.'),
                ('13:33', 'Provan: The narrator\'s verdict — "Jeroboam did not change his evil ways" — closes the chapter by returning the focus from the prophetic subplot to the royal failure. The spectacular events of ch. 13 produce no political or religious reform. This is the Deuteronomistic thesis in action: the word of God is reliable, but human hearts resist it.'),
            ],
            'calvin': [
                ('13:18', 'Calvin: The man of God perished because he trusted a human voice over the divine voice he had already heard. This is a perpetual danger for believers: the temptation to accept teaching that contradicts what God has clearly said, simply because it comes through an apparently authoritative channel. Test everything against Scripture.'),
                ('13:26', 'Calvin: God\'s judgment on the disobedient prophet is severe but just. Prophetic privilege does not exempt from prophetic accountability. Indeed, those who know God\'s will and violate it face stricter judgment than those who sin in ignorance (cf. Luke 12:48, "to whom much is given, much will be required").'),
            ],
            'netbible': [
                ('13:18', 'NET Note: <em>waykḥēš lô</em> (and he lied to him) — the verb <em>kāḥaš</em> (to lie, deceive) is used elsewhere for covenant treachery (Hos 9:2; Josh 7:11). The old prophet\'s deception is not mere dishonesty but a violation of the prophetic covenant — the most sacred trust in Israel.'),
                ('13:24', 'NET Note: The triple scene — lion, donkey, body — uses the verb <em>ʿōmēd</em> (standing) three times: the lion stands, the donkey stands, the body lies. The supernatural stillness emphasises that this is judgment, not nature.'),
            ],
        },
    ],
})

ki1(14, {
    'title': 'Judgment on Jeroboam\'s House; Rehoboam\'s Judah',
    'sections': [
        {
            'header': 'Verses 1–20 — Ahijah\'s Word to Jeroboam\'s Wife: Your Son Will Die at the Threshold',
            'verses': verse_range(1, 20),
            'heb': [
                ('hišnannēh', 'hishtaneh', 'to disguise oneself', 'Jeroboam tells his wife to disguise herself (v.2) before visiting the prophet Ahijah. The irony is devastating: Ahijah is blind (v.4) but sees more clearly than Jeroboam, who has eyes but cannot perceive the consequences of his apostasy. Physical sight and spiritual insight are inversely related throughout 1 Kings.'),
                ('ʾăḇiyyāh', 'Aviyah', 'Abijah (my father is YHWH)', 'The dying child\'s name means "my father is YHWH" — the very claim Jeroboam\'s golden calves denied. The one member of Jeroboam\'s house in whom "something good toward the LORD" was found (v.13) dies at the threshold of the door, the boundary between life and death, house and grave.'),
            ],
            'ctx': 'Jeroboam\'s son falls ill and the king sends his wife to the prophet Ahijah — the same prophet who originally announced the ten-tribe kingdom (11:29–39). But she goes in disguise, revealing Jeroboam\'s fear and guilt: he wants God\'s help but cannot face God\'s prophet honestly. Ahijah, now blind, is told by God of the deception and delivers the most comprehensive judgment oracle in 1 Kings: Jeroboam\'s dynasty will be utterly destroyed, "cut off" like dung swept away. Only the child Abijah will receive a decent burial because only in him was there "something good toward the LORD" (v.13) — the most poignant grace note in a passage of total devastation.',
            'cross': [
                ('1 Kgs 11:31–38', 'Ahijah\'s original promise to Jeroboam — ten tribes, conditional dynasty "if you walk in obedience." Jeroboam violated every condition. The same prophet who gave the kingdom now takes it away.'),
                ('1 Kgs 15:29', 'Fulfilment: Baasha kills every member of Jeroboam\'s family — "He did not leave Jeroboam anyone that breathed, but destroyed them all, according to the word of the LORD."'),
            ],
            'macarthur': [
                ('14:2', 'MacArthur: Jeroboam sends his wife in disguise to the blind prophet. The absurdity reveals the depth of his spiritual confusion: he trusts the prophet enough to consult him but fears him enough to hide. Partial faith mixed with persistent rebellion is the worst spiritual position — too much knowledge to plead ignorance, too little obedience to receive blessing.'),
                ('14:7', 'MacArthur: "I raised you up from among the people and appointed you ruler over my people Israel" — God recounts his generosity before pronouncing judgment. The pattern is consistent: before judgment, grace is remembered. The severity of punishment is proportional to the magnitude of blessing squandered.'),
                ('14:13', 'MacArthur: "He is the only one belonging to Jeroboam who will be buried" — a devastating grace note. In a family sentenced to total destruction, one child receives mercy because "something good toward the LORD" was found in him. Even in judgment, God preserves the righteous remnant.'),
                ('14:16', 'MacArthur: "He will give Israel up because of the sins Jeroboam has committed and has caused Israel to commit." The king\'s sin is compounded by its corporate dimension — he led others into apostasy. Leadership carries accountability not just for personal sin but for the sins one enables in others.'),
            ],
            'wiseman': [
                ('14:2', 'Wiseman: Shiloh, where Ahijah lived, was the site of the former tabernacle (Josh 18:1; 1 Sam 1:3). The location itself carries theological weight: the prophet of the old covenant centre pronounces judgment on the new king who has violated that covenant.'),
                ('14:17', 'Wiseman: Tirzah, Jeroboam\'s capital (v.17), is identified with Tell el-Far\'ah (North), about 7 miles northeast of Shechem. Excavations by Roland de Vaux revealed substantial early Iron Age II occupation consistent with its role as the northern capital before Omri built Samaria.'),
            ],
            'provan': [
                ('14:2', 'Provan: The disguise motif links back to Jacob disguising himself before blind Isaac (Gen 27). In both cases, a blind authority figure is not actually deceived. The narrator uses the parallel to show that deception before God\'s representatives never works — prophets see with God\'s eyes, not their own.'),
                ('14:13', 'Provan: The "something good toward the LORD" in Abijah is the narrator\'s way of preserving theological nuance within a judgment oracle. Not all of Jeroboam\'s house is equally guilty. The Deuteronomistic historian is capable of distinguishing individual merit even within corporate condemnation.'),
            ],
            'calvin': [
                ('14:2', 'Calvin: The disguise reveals a guilty conscience. Jeroboam knows he has done evil but will not repent — he prefers concealment to confession. This is the universal pattern of unregenerate religion: seeking God\'s benefits while hiding from God\'s truth.'),
                ('14:13', 'Calvin: God takes the righteous child early to spare him from the coming destruction. Early death, which we regard as tragedy, may be divine mercy — removing the innocent before the storm. "The righteous are taken away to be spared from evil" (Isa 57:1).'),
            ],
            'netbible': [
                ('14:10', 'NET Note: The graphic phrase <em>mašṭîn bĕqîr</em> (one who urinates against a wall) is a crude idiom meaning every male — from the highest to the lowest. The vulgarity of the expression matches the severity of the judgment. No male survivor will remain.'),
                ('14:15', 'NET Note: <em>wĕnātaš ʾet-Yiśrāʾēl mēʿal hāʾădāmāh haṭṭôbāh</em> (he will uproot Israel from this good land) — the verb <em>nātaš</em> (to uproot) reverses the planting imagery of 2 Sam 7:10. What God planted, sin uproots. The exile is presented as the reversal of the settlement.'),
            ],
        },
        {
            'header': 'Verses 21–31 — Rehoboam\'s Judah: High Places, Asherah Poles, and Shishak\'s Invasion',
            'verses': verse_range(21, 31),
            'heb': [
                ('qĕdēšîm', 'kedeshim', 'male shrine prostitutes', 'The presence of <em>qĕdēšîm</em> (v.24) — males dedicated to shrine prostitution — represents the deepest level of Canaanite religious syncretism. The term derives from <em>qādôš</em> (holy), creating a horrifying oxymoron: "holy ones" engaged in sexual degradation. Judah has adopted the most debased forms of Canaanite worship.'),
                ('Šîšaq', 'Shishak', 'Shishak (Pharaoh Shoshenq I)', 'Shishak\'s invasion (v.25) is one of the most important external confirmations of biblical history. Pharaoh Shoshenq I\'s victory relief at Karnak lists over 150 conquered cities, many identifiable with biblical sites. The raid on the temple treasury (v.26) strips Solomon\'s golden shields — the visible glory of the previous generation is carried off to Egypt.'),
            ],
            'ctx': 'Rehoboam\'s 17-year reign in Judah is summarised in devastating brevity: high places, sacred stones, Asherah poles on every high hill and under every spreading tree, and male shrine prostitutes. Judah has become indistinguishable from the Canaanites Israel was supposed to displace. Shishak\'s invasion in Rehoboam\'s fifth year (c. 925 BC) strips the temple and palace of their gold — Solomon\'s golden shields are replaced with bronze replicas (v.27), a perfect metaphor for the kingdom\'s decline from gold to bronze, from glory to imitation. The Chronicler adds that Shemaiah the prophet interpreted the invasion as divine discipline (2 Chr 12:5–8).',
            'cross': [
                ('2 Chr 12:5–8', '"You have abandoned me; therefore, I now abandon you to Shishak." The Chronicler preserves the prophetic interpretation that 1 Kings omits. Shishak is God\'s instrument of discipline.'),
                ('Deut 12:2–3', '"Destroy completely all the places on the high mountains, on the hills and under every spreading tree where the nations you are dispossessing worship their gods." Judah has done precisely the opposite.'),
            ],
            'macarthur': [
                ('14:22', 'MacArthur: Judah\'s sin provokes God\'s jealousy (<em>qinʾāh</em>) — not petty envy but the fierce protective love of a covenant husband whose wife has committed adultery. God\'s jealousy is the appropriate response to covenant betrayal.'),
                ('14:25', 'MacArthur: Shishak\'s invasion is divine discipline, not random geopolitics. The treasures Solomon accumulated through wisdom are stripped by a foreign army because of his son\'s foolishness. What wisdom builds, folly forfeits.'),
                ('14:27', 'MacArthur: Bronze shields replacing gold is the narrator\'s most powerful visual metaphor. Rehoboam maintains the appearance of royal processions — guards still carry shields when the king enters the temple — but the substance has been degraded. Religious form without spiritual reality is bronze masquerading as gold.'),
                ('14:30', 'MacArthur: "There was continual warfare between Rehoboam and Jeroboam" — the peace of Solomon\'s era (4:24) has been replaced by perpetual conflict. Division produces war; unity produces peace. The kingdom divided is the kingdom diminished.'),
            ],
            'wiseman': [
                ('14:25', 'Wiseman: Shoshenq I\'s campaign is documented on the Bubastite Portal at Karnak temple, where a relief shows the pharaoh smiting Asiatic enemies before Amun. The city list includes Megiddo, Taanach, Beth Shean, Arad, and others — an extensive campaign through both Judah and Israel. A fragment of a Shoshenq stele was discovered at Megiddo, confirming his presence there.'),
                ('14:26', 'Wiseman: The removal of the gold shields and their replacement with bronze is archaeologically plausible — the enormous quantities of gold described in Solomon\'s reign would have been a primary target for any invading force. Egyptian tomb reliefs from the same period show Asiatic tribute including gold vessels and weapons.'),
            ],
            'provan': [
                ('14:22', 'Provan: The narrator uses "Judah" rather than "Rehoboam" as the subject — "Judah did evil in the eyes of the LORD." The sin is corporate, not merely royal. The Deuteronomistic historian holds the entire society accountable, not just the king. This is important: the people are participants in apostasy, not merely victims of bad leadership.'),
                ('14:27', 'Provan: The bronze-for-gold substitution is the master metaphor of the entire decline narrative. The kingdom retains its rituals and processions but the substance is gone. The form of religion persists; the glory has departed. This is the Ichabod (1 Sam 4:21) principle applied to the monarchy.'),
            ],
            'calvin': [
                ('14:25', 'Calvin: God used Shishak as his rod of discipline. The treasures of the temple, accumulated through years of wisdom, were swept away in a single campaign. This teaches that no amount of past blessing guarantees present security. Each generation must maintain its own faithfulness or forfeit its own inheritance.'),
                ('14:27', 'Calvin: Bronze shields for gold — the visible sign of spiritual decline. The church faces the same danger in every age: maintaining outward forms after the inner reality has departed. Where there was once gold, there is now bronze; where there was once power, there is now pageantry.'),
            ],
            'netbible': [
                ('14:23', 'NET Note: <em>bāmôt ûmaṣṣēbôt waʾăšērîm</em> (high places, sacred pillars, and Asherah poles) — the triad of Canaanite worship installations. The <em>maṣṣēbāh</em> was a standing stone representing the male deity; the <em>ʾăšērāh</em> was a wooden pole or tree representing the mother goddess. Together they constituted the full apparatus of fertility religion.'),
                ('14:25', 'NET Note: The chronological note — fifth year of Rehoboam — dates Shishak\'s invasion to c. 925 BC, consistent with Egyptian chronology placing Shoshenq I\'s Palestinian campaign near the end of his reign (he died c. 924 BC).'),
            ],
        },
    ],
})

ki1(15, {
    'title': 'Abijah and Asa in Judah; Nadab and Baasha in Israel',
    'sections': [
        {
            'header': 'Verses 1–24 — Asa: He Did Right; Maakah\'s Idol Destroyed',
            'verses': verse_range(1, 24),
            'heb': [
                ('šālēm ʿim-YHWH', 'shalem im-YHWH', 'wholly devoted to the LORD', 'Asa\'s heart is described as <em>šālēm</em> (complete, undivided) with the LORD (v.14). The adjective comes from <em>šālôm</em> — wholeness, integrity. Asa\'s devotion is presented as the standard of Judahite kingship: measured not against perfection but against David\'s example of wholehearted commitment to YHWH despite failures.'),
                ('miphletseth', 'mifhletzet', 'repulsive/obscene thing', 'Asa removes his grandmother Maakah from her position as queen mother because she made a <em>miphletseth</em> (v.13) — an obscene image, probably a phallic Asherah pole. He cuts it down and burns it in the Kidron Valley. The term <em>miphletseth</em> occurs only here and in 2 Chr 15:16, suggesting something uniquely horrifying.'),
            ],
            'ctx': 'After the rapid deterioration under Rehoboam and Abijah, Asa represents the first reform in Judah. His 41-year reign (c. 911–870 BC) is the longest in Judah to this point. The narrator praises him with the highest evaluation formula: "Asa did what was right in the eyes of the LORD, as his father David had done" (v.11). His reforms include expelling the male shrine prostitutes, removing Canaanite idols, and deposing his own grandmother for idolatry — an act of extraordinary courage, since the queen mother held significant political power. Yet the narrator adds the qualification: "The high places were not removed" (v.14). Even the best kings fall short of the Deuteronomic ideal of centralised worship.',
            'cross': [
                ('2 Chr 14:9–15', 'The Chronicler adds Asa\'s victory over Zerah the Cushite — a massive Ethiopian/Egyptian army defeated through prayer and divine intervention. This military dimension is absent from 1 Kings.'),
                ('2 Chr 16:12', 'The Chronicler records Asa\'s tragic ending: in his old age he sought physicians rather than God for a severe foot disease, and he oppressed some of the people. Even good kings can end badly.'),
            ],
            'macarthur': [
                ('15:11', 'MacArthur: "Asa did what was right in the eyes of the LORD, as his father David had done." This is the gold-standard evaluation in Kings — comparison to David. Not comparison to an abstract ideal but to a real, flawed man whose heart was wholly devoted to God. The standard is not sinlessness but wholehearted commitment.'),
                ('15:13', 'MacArthur: Deposing his own grandmother required immense personal courage. Family loyalty was paramount in the ancient world; deposing the queen mother was politically dangerous. Asa\'s willingness to put covenant faithfulness above family ties demonstrates that true reform begins at home.'),
                ('15:14', 'MacArthur: "The high places were not removed. Nevertheless, Asa\'s heart was fully committed to the LORD all his life." The narrator holds two truths simultaneously: Asa was faithful, and Asa was incomplete. This is the honest assessment Scripture makes of even its best figures. No one arrives at perfection this side of eternity.'),
                ('15:19', 'MacArthur: Asa\'s alliance with Ben-Hadad of Aram against Baasha of Israel is politically shrewd but spiritually questionable — buying a foreign army with temple silver. The Chronicler explicitly condemns this (2 Chr 16:7–9). Even good kings make bad decisions when they rely on political calculation rather than prayer.'),
            ],
            'wiseman': [
                ('15:2', 'Wiseman: Abijah\'s three-year reign (c. 913–911 BC) is barely mentioned in Kings but given an extended narrative in 2 Chronicles 13, including a major battle with Jeroboam and a speech defending the Davidic covenant and Aaronic priesthood. The Kings narrator subordinates everything to the Deuteronomistic evaluation.'),
                ('15:18', 'Wiseman: Ben-Hadad I of Damascus (c. 900–860 BC) is known from the Melqart Stele discovered near Aleppo, which names "Bar-Hadad son of Tab-Rimmon son of Hezion, king of Aram." This genealogy matches 1 Kgs 15:18 exactly — one of the most precise extra-biblical confirmations of a Kings narrative.'),
            ],
            'provan': [
                ('15:11', 'Provan: The evaluation formula "did right in the eyes of the LORD" is the narrator\'s primary tool. Every king is measured by this single criterion. Military success, economic prosperity, building projects — none of these affect the verdict. The Deuteronomistic historian cares about one thing: covenant faithfulness.'),
                ('15:14', 'Provan: The "high places" qualification creates a narrative tension that runs through all of Judah\'s history. Even good kings leave the high places standing. The problem persists until Josiah (2 Kgs 23), who finally removes them — only for the nation to be exiled anyway. The narrator implies that partial reform is insufficient.'),
            ],
            'calvin': [
                ('15:13', 'Calvin: Asa\'s courage in deposing his grandmother teaches that reformation must begin with those closest to us. It is easy to condemn strangers\' idols; it takes courage to confront idolatry in our own families. But God\'s honour demands priority over every human relationship.'),
                ('15:14', 'Calvin: The high places remained. Even the best human reform is incomplete. Only Christ accomplishes the full purification that no king — not David, not Asa, not Josiah — could achieve. Every reformation points forward to the one reformer who will finish the work.'),
            ],
            'netbible': [
                ('15:13', 'NET Note: <em>miphletseth laʾăšērāh</em> (a repulsive image for Asherah) — <em>miphletseth</em> derives from <em>pālaṣ</em> (to shudder, tremble with horror). The object was so offensive that the narrator can barely name it. Asa\'s response — cutting and burning in the Kidron — follows the Deuteronomic prescription for idol destruction (Deut 7:5).'),
                ('15:14', 'NET Note: The qualifier <em>raq</em> (except, only) recurs — the same limiting particle used for Solomon (3:3). It signals incomplete faithfulness in an otherwise positive evaluation. The <em>raq</em> is the narrator\'s most subtle editorial tool.'),
            ],
        },
        {
            'header': 'Verses 25–34 — Nadab Assassinated; Baasha Destroys Jeroboam\'s Line',
            'verses': verse_range(25, 34),
            'heb': [
                ('hikkāh', 'hikkah', 'he struck him down', 'Baasha "struck down" (<em>hikkāh</em>, v.27) Nadab at Gibbethon — a Philistine border town Israel was besieging. The assassination during a military campaign is a pattern: power is seized at moments of national distraction. The same verb is used for judicial execution (Deut 13:15), giving Baasha\'s act an ambiguous quality — he may consider himself an agent of judgment even as he acts from ambition.'),
            ],
            'ctx': 'The northern kingdom enters its first dynastic transition — and it is violent. Nadab, Jeroboam\'s son, reigns only two years before Baasha assassinates him during the siege of Gibbethon and kills every member of Jeroboam\'s house, fulfilling Ahijah\'s prophecy (14:10–11). The narrator draws the explicit connection: "because of the sins Jeroboam had committed and had caused Israel to commit" (v.30). But Baasha is no reformer — he walks "in the ways of Jeroboam" (v.34). The destroyer of one sinful dynasty immediately becomes the founder of another. The northern cycle of apostasy, assassination, and replacement begins here and will repeat through the book.',
            'cross': [
                ('1 Kgs 14:10–11', 'Ahijah\'s prophecy against Jeroboam\'s house — "I will cut off from Jeroboam every last male... Dogs will eat those belonging to Jeroboam who die in the city." Baasha fulfils this word exactly.'),
                ('1 Kgs 16:1–4', 'Jehu son of Hanani prophesies the identical judgment against Baasha: the man who destroyed one dynasty for its sin commits the same sin and receives the same sentence.'),
            ],
            'macarthur': [
                ('15:27', 'MacArthur: Baasha assassinates Nadab during a military campaign — seizing power at a moment of national vulnerability. The pattern of violent succession in Israel contrasts sharply with Judah\'s (mostly) orderly Davidic transitions. Without a divine covenant guaranteeing the dynasty, every northern king rules by the sword and dies by the sword.'),
                ('15:29', 'MacArthur: The destruction of Jeroboam\'s entire family fulfils the prophetic word of 14:10. God\'s judgment may be delayed but it is never cancelled. Ahijah\'s prophecy, spoken years earlier, finds exact fulfilment through a human agent who acts from political ambition — God\'s sovereignty working through human agency.'),
                ('15:34', 'MacArthur: Baasha walks in Jeroboam\'s ways. The man who destroyed the house of Jeroboam immediately replicates Jeroboam\'s sin. Power alone does not produce righteousness; only a changed heart does. Regime change without spiritual change is merely rearranging the furniture in a burning house.'),
                ('15:30', 'MacArthur: The repeated phrase "the sins of Jeroboam which he sinned and which he made Israel sin" becomes the refrain of the northern kingdom. No northern king ever breaks free of this template. The original sin of the golden calves casts its shadow over every subsequent reign.'),
            ],
            'wiseman': [
                ('15:27', 'Wiseman: Gibbethon (Tell el-Melat, near Gezer) was a Levitical city in Dan\'s territory (Josh 21:23) that had been occupied by the Philistines. Israel\'s repeated attempts to retake it (cf. 16:15) suggest it was a strategic frontier position controlling access to the coastal plain.'),
                ('15:29', 'Wiseman: The total destruction of a royal house upon dynastic change is well attested in ANE practice. The Assyrian usurper Sargon II eliminated the family of his predecessor Shalmaneser V. The practice aimed to prevent any surviving heir from mounting a counter-claim.'),
            ],
            'provan': [
                ('15:29', 'Provan: The narrator\'s explicit citation of the prophetic fulfilment ("according to the word of the LORD given through his servant Ahijah") is the narrative engine of 1 Kings. Every judgment announced by a prophet is eventually executed. The word of God is the constant; kings are the variables.'),
                ('15:34', 'Provan: The verdict on Baasha is identical to the verdict on Jeroboam — the narrator uses the same evaluative formula. The new dynasty is no improvement on the old. The problem in Israel is not which family rules but the structural apostasy inaugurated by the golden calves, which no mere regime change can address.'),
            ],
            'calvin': [
                ('15:29', 'Calvin: God used Baasha — a wicked man acting from selfish ambition — to fulfil his righteous judgment against Jeroboam\'s house. God\'s sovereignty employs human agents without approving their motives. The instrument of judgment is not thereby justified; Baasha will face his own reckoning (16:1–4).'),
                ('15:34', 'Calvin: The cycle of sin continues because the problem is the human heart, not the human ruler. Replace the king and the sin remains. Only the grace of God, working internal transformation, can break the cycle. External reform without internal renewal is futile.'),
            ],
            'netbible': [
                ('15:29', 'NET Note: <em>lōʾ hišʾîr kol-nišmat lĕYārŏbʿām</em> (he did not leave any breathing thing of Jeroboam\'s) — the phrase <em>kol-nišmāh</em> (every breath) echoes the conquest vocabulary of Joshua (Josh 11:11, 14). Baasha\'s purge uses herem language — total destruction — but applied to a fellow Israelite dynasty.'),
                ('15:34', 'NET Note: The formulaic evaluation <em>wayyēlek bĕderek Yārŏbʿām ûbĕḥaṭṭāʾtô ʾăšer heḥĕṭîʾ ʾet-Yiśrāʾēl</em> (he walked in the way of Jeroboam and in his sin which he caused Israel to commit) will be repeated for nearly every northern king. It functions as a liturgical refrain of condemnation.'),
            ],
        },
    ],
})

ki1(16, {
    'title': 'From Baasha to Ahab: Rapid Succession and the Worst King',
    'sections': [
        {
            'header': 'Verses 1–20 — Baasha to Zimri: Coups, Conspiracy, and Seven Days on the Throne',
            'verses': verse_range(1, 20),
            'heb': [
                ('šibʿat yāmîm', 'shivat yamim', 'seven days', 'Zimri reigns only seven days (v.15) — the shortest reign in Israelite history. The number seven, normally associated with completion and divine order, here describes total futility. Zimri\'s "dynasty" begins and ends in a single week, destroyed by the same violence that created it.'),
                ('bāʿar ʾet-bêtô', 'baar et-beito', 'he burned the palace over himself', 'Zimri\'s suicide by fire (v.18) when he sees the city is taken is an act of desperate finality. The burning of the royal palace is both personal destruction and the destruction of the regime. Unlike Saul\'s death (which had tragic nobility), Zimri\'s self-immolation is the end of a seven-day farce.'),
            ],
            'ctx': 'Chapter 16 compresses approximately 50 years of northern history into 34 verses — a deliberate narrative acceleration that conveys the feeling of rapid, meaningless succession. The narrator rushes through dynasties because they are interchangeable: Baasha replicates Jeroboam\'s sin and receives an identical judgment (vv.1–7). His son Elah is assassinated by Zimri while drinking himself drunk (v.9). Zimri reigns seven days before burning himself alive. The speed communicates the futility: without covenant faithfulness, political power is ephemeral. Each regime destroys its predecessor and is destroyed in turn.',
            'cross': [
                ('1 Kgs 14:10–11', 'The prophecy against Jeroboam is repeated nearly verbatim against Baasha (16:3–4). The same sin produces the same judgment. The narrator makes the parallelism explicit.'),
                ('2 Kgs 9:31', 'When Jehu enters Jezreel, Jezebel taunts him: "Is all well, Zimri, you murderer of your master?" Zimri becomes a byword for regicide — his name is a curse that persists for generations.'),
            ],
            'macarthur': [
                ('16:2', 'MacArthur: God\'s indictment of Baasha through Jehu the prophet mirrors Ahijah\'s indictment of Jeroboam: "I lifted you up... but you walked in the ways of Jeroboam." The pattern is established: God gives opportunity, the king squanders it, the prophet announces judgment. This cycle will repeat until there is no northern kingdom left.'),
                ('16:9', 'MacArthur: Elah is murdered while getting drunk in his steward\'s house. The king of Israel is so insulated from his own people and so given to luxury that he is caught unawares in a private drinking session. Leadership requires vigilance; self-indulgence produces vulnerability.'),
                ('16:15', 'MacArthur: Seven days — the duration of a feast, not a reign. Zimri\'s brevity demonstrates that power seized by violence alone cannot sustain itself. Without legitimacy, without popular support, without divine sanction, the throne is just a chair.'),
                ('16:19', 'MacArthur: The narrator provides a moral verdict even for Zimri\'s seven-day reign: "because of the sins he had committed, doing evil in the eyes of the LORD and following the ways of Jeroboam." Even seven days is enough time to be evaluated against God\'s standard.'),
            ],
            'wiseman': [
                ('16:8', 'Wiseman: The chronological data for this period (Elah year 26 of Asa; Zimri year 27; Omri year 31) creates apparent contradictions that scholars resolve through co-regency systems and different calendar reckoning methods. The precision of the data suggests the narrator is working from official Israelite regnal records.'),
                ('16:15', 'Wiseman: Gibbethon reappears (cf. 15:27) — Israel is still besieging the same Philistine frontier town. The military stalemate at Gibbethon spans two reigns and two coups, suggesting it was a persistent strategic problem on the western border.'),
            ],
            'provan': [
                ('16:7', 'Provan: The prophet Jehu\'s message to Baasha contains a paradox: Baasha is condemned both for walking in Jeroboam\'s way (v.2) AND for destroying Jeroboam\'s house (v.7). He was God\'s instrument of judgment but is condemned for using violence as his own tool. The narrator holds divine sovereignty and human responsibility in tension without resolving it.'),
                ('16:18', 'Provan: Zimri burns the palace over himself — the most compressed narrative in Kings. The narrator devotes a single verse to Zimri\'s death. The brevity itself is a verdict: a life and reign so insignificant that one verse suffices for both.'),
            ],
            'calvin': [
                ('16:2', 'Calvin: God reminds Baasha: "I lifted you up from the dust." Every position of authority is a gift from God. When the recipient forgets the source, the gift is reclaimed. The pattern applies to every sphere of life: what God gives, ingratitude forfeits.'),
                ('16:18', 'Calvin: Zimri\'s self-destruction teaches that violence turned outward eventually turns inward. The man who murdered his way to the throne destroys himself when the throne collapses. Sin is inherently self-consuming.'),
            ],
            'netbible': [
                ('16:2', 'NET Note: <em>hărimōtîkā min-heʿāpār</em> (I raised you from the dust) — the phrase echoes 1 Sam 2:8 (Hannah\'s Song) and Ps 113:7. "Dust" represents the lowest social condition. God\'s elevation of Baasha from obscurity to kingship makes his ingratitude all the more culpable.'),
                ('16:11', 'NET Note: <em>lōʾ hišʾîr lô mašṭîn bĕqîr</em> — the crude idiom recurs from 14:10. The narrator uses identical language for the destruction of both Jeroboam\'s and Baasha\'s houses, underlining the parallelism of their sin and punishment.'),
            ],
        },
        {
            'header': 'Verses 21–34 — Omri Builds Samaria; Ahab Marries Jezebel; Baal Worship Established',
            'verses': verse_range(21, 34),
            'heb': [
                ('Šōmĕrôn', 'Shomeron', 'Samaria', 'Omri purchases the hill of Samaria (<em>Šōmĕrôn</em>, from its owner Shemer, v.24) and builds a new capital — the most important act of Israelite city-building since David took Jerusalem. Samaria will remain the northern capital until its destruction in 722 BC, and the name will become synonymous with the northern kingdom itself.'),
                ('wayyēlek laʿăbōd ʾet-haBaʿal wayyištaḥăwû-lô', 'vayelech laavod et-haBaal', 'he went and served Baal and worshipped him', 'Ahab\'s introduction (v.31) marks a quantum leap in apostasy. Previous kings maintained YHWH worship alongside the golden calves; Ahab institutes official Baal worship with a temple in Samaria. The verb sequence — "went... served... worshipped" — describes a deliberate, systematic adoption of a foreign deity as state religion.'),
            ],
            'ctx': 'The chapter\'s second half introduces the two figures who will dominate the rest of 1 Kings: Omri and especially Ahab. Omri is one of the most significant kings in Israelite history from an external perspective — Assyrian records call Israel "the house of Omri" for over a century after his death, and the Mesha Stele credits him with subjugating Moab. Yet the narrator devotes only six verses to him, condemning him as worse than all who preceded him (v.25). Ahab then surpasses even Omri: he marries Jezebel, daughter of the Sidonian king, builds a Baal temple in Samaria, and erects an Asherah pole. The narrator\'s verdict: "Ahab did more to arouse the anger of the LORD, the God of Israel, than did all the kings of Israel before him" (v.33). The stage is set for Elijah.',
            'cross': [
                ('Mic 6:16', '"You have observed the statutes of Omri and all the practices of Ahab\'s house." A century later, Micah still references the Omride dynasty as the paradigm of Israelite apostasy.'),
                ('Rev 2:20', '"You tolerate that woman Jezebel, who calls herself a prophet." Jezebel becomes a biblical archetype for false teaching and religious corruption — referenced even in the New Testament.'),
                ('Josh 6:26', '"Cursed before the LORD is the one who undertakes to rebuild this city, Jericho." The fulfilment in v.34 (Hiel of Bethel rebuilds Jericho, losing his sons) demonstrates that Joshua\'s curse remained active.'),
            ],
            'macarthur': [
                ('16:25', 'MacArthur: "Omri did evil in the eyes of the LORD and sinned more than all those before him." The superlative keeps escalating — each king is worse than his predecessor. The narrative of decline is cumulative; sin does not plateau but accelerates. This is the trajectory of unrestrained apostasy.'),
                ('16:31', 'MacArthur: Ahab\'s marriage to Jezebel is the most consequential political marriage in Israelite history. It brings not just a foreign queen but an aggressive foreign religion backed by royal power. Jezebel does not merely worship Baal privately; she makes it state policy and actively persecutes YHWH prophets (18:4).'),
                ('16:32', 'MacArthur: A Baal temple in the capital city of Israel is the ultimate provocation. The calves at Dan and Bethel were heretical but claimed to represent YHWH; the Baal temple represents an entirely different deity. This is not syncretism but replacement.'),
                ('16:34', 'MacArthur: The rebuilding of Jericho by Hiel at the cost of his sons fulfils Joshua\'s curse (Josh 6:26) — a curse spoken 500+ years earlier. The narrator places this note at the end of the chapter to remind the reader: God\'s word is unfailingly reliable. What God declares, history confirms.'),
            ],
            'wiseman': [
                ('16:24', 'Wiseman: Samaria (Sebastiyeh) sits on an isolated hill with excellent natural defenses, commanding the main east-west route through the central highlands. Harvard excavations (1908–10) and subsequent campaigns uncovered Omride-period ashlar masonry, ivory carvings, and the "Samaria ostraca" (administrative records). The city\'s construction quality confirms Omri as a significant builder-king.'),
                ('16:31', 'Wiseman: Ethbaal king of Sidon is identified by Josephus (citing Menander) as a priest of Astarte who seized the throne by murdering the previous king. Jezebel\'s religious fanaticism is inherited: her father was both king and chief priest of a violent cult. She brought this combination of political and religious authority to Israel.'),
                ('16:33', 'Wiseman: The Mesha Stele (Moabite Stone, discovered 1868) confirms Omri\'s conquest of Moab and notes that "Omri had humbled Moab for many years." Assyrian records continue to call Israel "Bit-Humri" (House of Omri) long after his dynasty fell — testimony to his geopolitical significance that the biblical narrator deliberately minimises.'),
            ],
            'provan': [
                ('16:25', 'Provan: The disproportion between Omri\'s external importance (Assyrian records, Mesha Stele) and his meagre biblical coverage (6 verses) reveals the narrator\'s priorities. Political and military achievement is irrelevant to the Deuteronomistic evaluation. Only covenant faithfulness matters. Omri built Samaria and subjugated Moab but "sinned more than all before him" — and that is his verdict.'),
                ('16:33', 'Provan: The narrator\'s superlative judgment on Ahab — worse than all before him — sets up the Elijah narratives that follow. The deeper the darkness, the more dramatic the prophetic light. Elijah does not appear in a vacuum but in the worst spiritual crisis since the golden calf. The prophet is summoned by the extremity of the apostasy.'),
            ],
            'calvin': [
                ('16:31', 'Calvin: Ahab\'s marriage to Jezebel teaches the danger of unequal yoking. A foreign wife brought a foreign god, and a foreign god brought the destruction of the kingdom. What begins as a political alliance ends as spiritual catastrophe. The church must guard its partnerships with the same vigilance.'),
                ('16:34', 'Calvin: The fulfilment of Joshua\'s ancient curse demonstrates that God\'s word operates outside human timescales. Five centuries pass between the curse and its fulfilment. What patience this implies — and what certainty. God neither forgets nor exaggerates. Every word will be accounted for.'),
            ],
            'netbible': [
                ('16:31', 'NET Note: <em>wayyelek wayyaʿăbōd ʾet-habBaʿal wayyištaḥăwû-lô</em> — the triple <em>wayyiqtol</em> sequence (went... served... worshipped) describes a deliberate process of adoption. This is not accidental syncretism but intentional establishment of Baal as the national deity alongside (or replacing) YHWH.'),
                ('16:34', 'NET Note: <em>bidbar YHWH ʾăšer dibbēr bĕyad Yĕhôšuaʿ bin-Nûn</em> (according to the word of the LORD which he spoke through Joshua son of Nun) — the narrator explicitly cites the prophetic chain: God → Joshua → fulfilment in Ahab\'s day. The word of God traverses centuries with undiminished authority.'),
            ],
        },
    ],
})

print("\n1KI-4 complete: 1 Kings 13–16 built.")
