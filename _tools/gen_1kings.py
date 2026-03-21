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

print("\n1KI-3 complete: 1 Kings 9–12 built.")
