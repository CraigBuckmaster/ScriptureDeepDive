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

print("\n1KI-1 complete: 1 Kings 1–4 built.")
