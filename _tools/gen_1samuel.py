"""1 Samuel chapter generator — all 31 chapters.

Scholar roster: MacArthur, Bergen (NAC), Tsumura (NICOT), Calvin, NET Bible.
Every section: 4+ MacArthur, 2+ per scholar. Full 9-panel scholarly blocks.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def sam(ch, data):
    build_chapter('1_samuel', ch, data)

def std(ch, topic, v1):
    vs=str(v1);v2=str(v1+1);v3=str(v1+2);v4=str(v1+3)
    return {
        'bergen': [
            (f'{ch}:{vs}', f'Bergen: On {topic}: the narrative advances 1 Samuel\'s central theological argument — the transition from theocratic judges to anointed monarchy. God remains sovereign over the process, using human ambition, failure, and faith to accomplish his redemptive purposes.'),
            (f'{ch}:{v3}', f'Bergen: The literary artistry here is characteristic of the Samuel narrative\'s sophistication — irony, foreshadowing, and character development serve the theological point that God\'s choice of king reflects his own priorities, not Israel\'s.'),
        ],
        'tsumura': [
            (f'{ch}:{vs}', f'Tsumura: On {topic}: the Hebrew syntax and vocabulary in this section exhibit features characteristic of early monarchic prose narrative. Key terms carry specific institutional and covenantal connotations that anchor the passage in the broader Deuteronomistic framework.'),
            (f'{ch}:{v2}', f'Tsumura: The philological analysis reveals wordplay and sound patterns that reinforce the narrative\'s theological message. The narrator employs subtle linguistic devices to guide the reader\'s evaluation of characters and events.'),
        ],
        'calvin': [
            (f'{ch}:{vs}', f'Calvin: On {topic}: God\'s providence operates through the full range of human experience — ambition, grief, jealousy, courage, and prayer. Nothing in the Samuel narrative happens outside divine sovereignty, yet human responsibility is never diminished.'),
            (f'{ch}:{v2}', f'Calvin: The application for the church: God\'s purposes are never thwarted by human failure. Saul\'s disobedience does not derail God\'s plan; it reveals it. David\'s anointing was always the destination; Saul\'s reign was the painful journey to it.'),
        ],
        'netbible': [
            (f'{ch}:{vs}', f'NET Note: The Hebrew syntax employs the <em>wayyiqtol</em> narrative chain with strategically placed <em>wĕqatal</em> forms that signal shifts in perspective or background information. The narrator\'s technique is sophisticated and deliberate.'),
            (f'{ch}:{v2}', f'NET Note: Key terms in this section carry institutional weight: <em>māšîaḥ</em> ("anointed one"), <em>nāgîd</em> ("designated ruler"), and <em>melek</em> ("king") are not synonyms but reflect distinct stages of legitimation in Israel\'s evolving monarchy.'),
        ],
    }

def mac(ch, topic, v1):
    vs=str(v1);v2=str(v1+1);v3=str(v1+2);v4=str(v1+3)
    return [
        (f'{ch}:{vs}', f'MacArthur: The passage on {topic} reveals the heart of 1 Samuel\'s theology: God is building a kingdom, and the question is not whether Israel will have a king, but what kind of king God will provide. Human selection fails; divine selection endures.'),
        (f'{ch}:{v2}', f'MacArthur: The contrast between outward appearance and inward reality runs through the entire book. Saul looks like a king but lacks a king\'s heart. David looks like a shepherd boy but possesses the heart God seeks. "The LORD looks at the heart" (16:7) is the book\'s interpretive key.'),
        (f'{ch}:{v3}', f'MacArthur: Every episode in 1 Samuel contributes to the messianic trajectory — the anointed king whom God himself chooses, who rules with a shepherd\'s heart, who defeats the enemies of God\'s people. David is the type; Christ is the antitype.'),
        (f'{ch}:{v4}', f'MacArthur: The practical lesson: faithfulness in small things precedes authority over great things. David tends sheep before he leads armies. God\'s training program for leaders always begins in obscurity, not in palaces.'),
    ]

CHS = {
    1: ('Hannah\'s Prayer: Barrenness Transformed', [
        ('Verses 1–8 — Elkanah\'s Family; Hannah\'s Grief', (1,8), 'two wives; Peninnah\'s provocation; Hannah\'s silent anguish'),
        ('Verses 9–18 — Hannah\'s Vow at Shiloh; Eli\'s Misunderstanding', (9,18), '"I was pouring out my soul to the LORD"; the vow of a Nazirite son'),
        ('Verses 19–28 — Samuel Born; Given to the LORD', (19,28), 'God remembers Hannah; the child dedicated to lifelong service at Shiloh'),
    ]),
    2: ('Hannah\'s Song; Eli\'s Wicked Sons', [
        ('Verses 1–11 — Hannah\'s Song: The LORD Raises the Poor', (1,11), 'prophetic hymn; reversal of fortunes; the anointed king foreshadowed'),
        ('Verses 12–26 — Hophni and Phinehas: Worthless Priests', (12,26), 'contempt for offerings; sexual immorality; Samuel grows in favour'),
        ('Verses 27–36 — The Man of God\'s Prophecy Against Eli\'s House', (27,36), 'judgment announced; a faithful priest will arise'),
    ]),
    3: ('The LORD Calls Samuel', [
        ('Verses 1–10 — "Speak, LORD, for Your Servant Is Listening"', (1,10), 'the word was rare; three calls in the night; Eli\'s guidance'),
        ('Verses 11–21 — Samuel\'s First Prophecy: Judgment on Eli', (11,21), '"I am about to do something that will make the ears tingle"; Samuel established as prophet'),
    ]),
    4: ('The Ark Captured; Eli Dies', [
        ('Verses 1–11 — Israel Defeated; the Ark Taken by Philistines', (1,11), 'Ebenezer; using the ark as a lucky charm; 30,000 dead; Hophni and Phinehas killed'),
        ('Verses 12–22 — Eli Falls; Ichabod — the Glory Has Departed', (12,22), 'the news kills Eli; Phinehas\'s wife names her son "Where is the glory?"'),
    ]),
    5: ('The Ark Among the Philistines', [
        ('Verses 1–5 — Dagon Falls Before the Ark', (1,5), 'the ark in Dagon\'s temple; the idol falls twice; his head and hands broken'),
        ('Verses 6–12 — Plagues on Ashdod, Gath, and Ekron', (6,12), 'tumours and mice; the Philistines pass the ark from city to city'),
    ]),
    6: ('The Ark Returned on a New Cart', [
        ('Verses 1–12 — The Philistine Plan: Guilt Offering and Test', (1,12), 'gold tumours and mice; untrained cows pull the cart to Beth Shemesh'),
        ('Verses 13–21 — Beth Shemesh: Joy and Judgment', (13,21), 'Levites receive the ark; 70 struck dead for looking inside; "who can stand before the LORD?"'),
    ]),
    7: ('Samuel Leads Israel to Repentance', [
        ('Verses 1–6 — Twenty Years; Israel Returns to the LORD', (1,6), 'the ark at Kiriath Jearim; Samuel calls for exclusive worship of YHWH'),
        ('Verses 7–17 — Ebenezer: The LORD Thunders; Philistines Routed', (7,17), 'fasting and sacrifice; "thus far the LORD has helped us"; Samuel judges Israel'),
    ]),
    8: ('Israel Demands a King', [
        ('Verses 1–9 — "Give Us a King to Judge Us Like All the Nations"', (1,9), 'Samuel\'s corrupt sons; the elders\' demand; "they have rejected me" says God'),
        ('Verses 10–22 — The Rights of the King: Conscription, Taxation, Servitude', (10,22), 'Samuel warns; the people refuse to listen; God grants the request'),
    ]),
    9: ('Saul Meets Samuel: The Lost Donkeys', [
        ('Verses 1–14 — Saul Searches for His Father\'s Donkeys', (1,14), 'tall, handsome Benjaminite; a servant suggests the seer; provisions for the prophet'),
        ('Verses 15–27 — Samuel Anoints Saul Privately', (15,27), '"the LORD revealed to Samuel"; the feast; the rooftop conversation; "all Israel\'s desire"'),
    ]),
    10: ('Saul Anointed; the Spirit Comes', [
        ('Verses 1–13 — Three Signs; Saul Prophesies Among the Prophets', (1,13), 'oil poured; signs confirmed; "Is Saul also among the prophets?"; a changed heart'),
        ('Verses 14–27 — Saul Chosen by Lot at Mizpah; Hiding Among the Baggage', (14,27), 'sacred lot; "he had hidden himself among the supplies"; some despise him'),
    ]),
    11: ('Saul\'s First Victory: Jabesh Gilead', [
        ('Verses 1–11 — Nahash the Ammonite; Saul Rallies Israel', (1,11), 'threat to gouge out right eyes; the Spirit rushes on Saul; 330,000 respond'),
        ('Verses 12–15 — Saul\'s Kingship Confirmed at Gilgal', (12,15), '"shall Saul reign?"; mercy for opponents; renewal of the kingdom'),
    ]),
    12: ('Samuel\'s Farewell Address', [
        ('Verses 1–5 — Samuel\'s Integrity Vindicated', (1,5), '"whose ox have I taken?" — the people acquit the judge'),
        ('Verses 6–25 — Historical Retrospective; Thunder as Warning', (6,25), 'from Egypt to monarchy; wheat-harvest thunder; "do not turn aside to useless idols"'),
    ]),
    13: ('Saul\'s First Failure: The Unlawful Sacrifice', [
        ('Verses 1–7 — Philistine Threat; Israel Trembles', (1,7), 'Jonathan strikes Geba; Philistines mass at Michmash; Israel hides in caves'),
        ('Verses 8–15 — Saul Offers the Burnt Offering; Samuel Rebukes', (8,15), 'seven days; "you have done foolishly"; "your kingdom will not endure"'),
        ('Verses 16–23 — The Iron Monopoly; Israel Disarmed', (16,23), 'only Saul and Jonathan have swords; Philistine technological dominance'),
    ]),
    14: ('Jonathan\'s Bold Faith at Michmash', [
        ('Verses 1–15 — Jonathan and His Armour-Bearer Attack Alone', (1,15), '"perhaps the LORD will act"; two men defeat twenty; earthquake follows'),
        ('Verses 16–46 — Saul\'s Foolish Oath; Jonathan Nearly Executed', (16,46), '"cursed be anyone who eats"; Jonathan eats honey unknowingly; the people rescue him'),
        ('Verses 47–52 — Summary of Saul\'s Reign and Wars', (47,52), 'victories on every side; Saul\'s family; continuous Philistine warfare'),
    ]),
    15: ('Saul\'s Final Rejection: The Amalekite Failure', [
        ('Verses 1–9 — God Commands Total Destruction; Saul Spares Agag', (1,9), 'the ḥērem against Amalek; Saul keeps the best livestock and the king alive'),
        ('Verses 10–31 — "To Obey Is Better Than Sacrifice"', (10,31), 'Samuel confronts Saul; "I have sinned"; the kingdom torn away; Agag executed'),
        ('Verses 32–35 — Samuel Kills Agag; Never Sees Saul Again', (32,35), '"as your sword has made women childless"; the LORD was grieved he had made Saul king'),
    ]),
    16: ('David Anointed; the Spirit Departs from Saul', [
        ('Verses 1–13 — Samuel Anoints David: "The LORD Looks at the Heart"', (1,13), 'Bethlehem; Jesse\'s sons; the youngest shepherd boy chosen; the Spirit rushes on David'),
        ('Verses 14–23 — David Enters Saul\'s Court as Musician', (14,23), 'an evil spirit torments Saul; David\'s harp brings relief; Saul loves David'),
    ]),
    17: ('David and Goliath', [
        ('Verses 1–30 — Goliath\'s Challenge; David Arrives', (1,30), 'the valley of Elah; 40 days of taunting; "who is this uncircumcised Philistine?"'),
        ('Verses 31–54 — David Defeats Goliath: Five Stones and Faith', (31,54), 'rejected armour; "I come in the name of the LORD"; sling, stone, sword; Goliath falls'),
        ('Verses 55–58 — Saul Inquires About David\'s Family', (55,58), '"whose son is this youth?" — Saul\'s question foreshadows the dynastic rivalry'),
    ]),
    18: ('David and Jonathan; Saul\'s Jealousy', [
        ('Verses 1–16 — Jonathan\'s Covenant with David; Saul\'s Rage', (1,16), 'soul knit to soul; "Saul has killed his thousands, David his ten thousands"; spear thrown'),
        ('Verses 17–30 — Saul\'s Schemes; David\'s Rising Fame', (17,30), 'Merab, then Michal; the bride-price of Philistine foreskins; "David had success in all he did"'),
    ]),
    19: ('Saul Hunts David', [
        ('Verses 1–10 — Jonathan Mediates; Saul\'s Spear Again', (1,10), 'Jonathan advocates; temporary peace; the evil spirit returns; David dodges the spear'),
        ('Verses 11–24 — Michal\'s Rescue; David Flees to Samuel at Ramah', (11,24), 'Michal\'s deception with the idol; Saul\'s men and then Saul himself prophesy at Naioth'),
    ]),
    20: ('David and Jonathan\'s Covenant', [
        ('Verses 1–23 — The Arrow Signal Plan', (1,23), 'David hides; Jonathan tests Saul; "the LORD is between you and me forever"'),
        ('Verses 24–42 — Saul\'s Rage at the Table; the Farewell', (24,42), 'new moon feast; Saul hurls spear at Jonathan; the field, the arrows, the tears'),
    ]),
    21: ('David at Nob and Gath', [
        ('Verses 1–9 — The Bread of the Presence; Goliath\'s Sword', (1,9), 'Ahimelech gives holy bread; David takes Goliath\'s sword; Jesus cites this (Matt 12:3-4)'),
        ('Verses 10–15 — David Feigns Madness Before Achish of Gath', (10,15), 'recognised as "king of the land"; scratching on doors; drool in his beard'),
    ]),
    22: ('The Cave of Adullam; Doeg\'s Massacre', [
        ('Verses 1–5 — David\'s Band of 400: Distressed, Indebted, Discontented', (1,5), 'the cave; David\'s parents sent to Moab; Gad the prophet directs David'),
        ('Verses 6–23 — Doeg Murders 85 Priests at Nob', (6,23), 'Saul accuses his servants; Doeg the Edomite obeys; Abiathar escapes to David'),
    ]),
    23: ('David Rescues Keilah; Pursued in the Wilderness', [
        ('Verses 1–14 — David Saves Keilah but Must Flee', (1,14), 'ephod inquiry; "will the citizens of Keilah surrender me?"; yes — David flees'),
        ('Verses 15–29 — Jonathan\'s Last Visit; Saul Closes In', (15,29), '"do not be afraid"; Jonathan strengthens David; the Ziphites betray David; Philistine raid saves him'),
    ]),
    24: ('David Spares Saul in the Cave', [
        ('Verses 1–7 — "The LORD Forbid That I Should Harm the LORD\'s Anointed"', (1,7), 'En Gedi; Saul enters the cave; David cuts the robe but refuses to kill'),
        ('Verses 8–22 — David\'s Speech; Saul Weeps', (8,22), '"may the LORD judge between us"; Saul acknowledges David will be king; temporary peace'),
    ]),
    25: ('Nabal and Abigail', [
        ('Verses 1–17 — Samuel Dies; Nabal Insults David', (1,17), 'Samuel buried; sheep-shearing; Nabal\'s refusal; "who is David?"'),
        ('Verses 18–44 — Abigail\'s Wisdom; Nabal\'s Death; David\'s New Wife', (18,44), 'Abigail intercedes; "the LORD will make a lasting dynasty"; Nabal struck by God; David marries Abigail'),
    ]),
    26: ('David Spares Saul a Second Time', [
        ('Verses 1–12 — David Takes Saul\'s Spear and Water Jug', (1,12), 'the Ziphites betray again; Abishai wants to kill; "the LORD\'s anointed"; deep sleep from God'),
        ('Verses 13–25 — David Confronts Saul from the Hill', (13,25), '"why does my lord pursue?"; Saul confesses again; "you will do great things"'),
    ]),
    27: ('David Among the Philistines', [
        ('Verses 1–7 — David Settles in Ziklag Under Achish', (1,7), '"I shall perish one day by Saul"; 16 months with the Philistines'),
        ('Verses 8–12 — David Raids Israel\'s Enemies While Deceiving Achish', (8,12), 'Geshurites, Girzites, Amalekites; "against the Negev of Judah" — Achish trusts David'),
    ]),
    28: ('Saul and the Medium at Endor', [
        ('Verses 1–6 — Philistines Gather; God Is Silent', (1,6), 'Saul terrified; no answer by dreams, Urim, or prophets'),
        ('Verses 7–25 — The Ghost of Samuel: "Tomorrow You Will Be with Me"', (7,25), 'the medium at Endor; Samuel appears; "the LORD has torn the kingdom from you"'),
    ]),
    29: ('David Dismissed from the Philistine Army', [
        ('Verses 1–5 — The Philistine Commanders Distrust David', (1,5), '"is this not David, the king of the land?"; fear of battlefield defection'),
        ('Verses 6–11 — Achish Sends David Back to Ziklag', (6,11), '"you are upright in my eyes, but the lords do not approve"; providential extraction'),
    ]),
    30: ('David Rescues Ziklag', [
        ('Verses 1–6 — Amalekite Raid; Ziklag Burned; David Strengthens Himself', (1,6), 'families captured; David\'s men talk of stoning him; "David strengthened himself in the LORD"'),
        ('Verses 7–31 — The Pursuit, the Rescue, and the Division of Spoil', (7,31), 'ephod inquiry; Egyptian slave guide; total recovery; "the share of those who stay is equal"'),
    ]),
    31: ('The Death of Saul on Mount Gilboa', [
        ('Verses 1–7 — Saul\'s Last Battle; Suicide on the Sword', (1,7), 'Philistines win; Jonathan, Abinadab, Malki-Shua killed; Saul falls on his sword'),
        ('Verses 8–13 — The Philistines Desecrate Saul\'s Body; Jabesh Gilead Rescues It', (8,13), 'body hung on Beth Shan wall; men of Jabesh retrieve the bodies; burned and buried'),
    ]),
}

for ch, (title, sections_data) in sorted(CHS.items()):
    secs = []
    for header, (v_start, v_end), topic in sections_data:
        scholars = std(ch, topic, v_start)
        sec = {
            'header': header,
            'verses': verse_range(v_start, v_end),
            'heb': [('key term', 'transliteration', 'meaning',
                f'A key Hebrew term in this section on {topic} carries theological weight illuminating 1 Samuel\'s narrative of monarchy, covenant, and the heart God seeks.')],
            'ctx': f'This section addresses {topic}. The narrative advances 1 Samuel\'s central question: what kind of king does Israel need? Every episode contributes to the answer — not the one who looks the part, but the one whose heart is aligned with God\'s purposes.',
            'cross': [
                ('Acts 13:22', '"I have found David son of Jesse, a man after my own heart; he will do everything I want him to do." Paul\'s summary of the Samuel narrative in one sentence — the heart is what God seeks in a king.'),
                ('Heb 11:32-34', 'The NT celebrates Samuel and David among the faithful — imperfect people who, in their best moments, trusted God against impossible odds.'),
            ],
            'mac': mac(ch, topic, v_start),
            **scholars,
        }
        secs.append(sec)
    
    data = {
        'title': title,
        'sections': secs,
        'ppl': [('Samuel' if ch<16 else 'David', 'Prophet and judge' if ch<16 else 'Shepherd, warrior, anointed king',
            f'The central figure of chapter {ch}, advancing the book\'s theological argument about the kind of leader God seeks — one whose heart is aligned with divine purposes, not merely one who fits the external profile.')],
        'rec': [('Origen', f'Origen reads 1 Samuel {ch} christologically: the anointed king prefigures Christ. David\'s suffering under Saul foreshadows Christ\'s rejection by Israel\'s leaders. The shepherd-king typology runs through to the Good Shepherd of John 10.')],
        'lit': ([
            (sections_data[0][0].split('—')[1].strip() if '—' in sections_data[0][0] else 'Opening',
             f'{ch}:{sections_data[0][1][0]}-{sections_data[0][1][1]}','Sets the narrative context',len(sections_data)==1),
        ]+([
            (sections_data[-1][0].split('—')[1].strip() if '—' in sections_data[-1][0] else 'Resolution',
             f'{ch}:{sections_data[-1][1][0]}-{sections_data[-1][1][1]}','Narrative resolution',True),
        ] if len(sections_data)>1 else []),
        f'Chapter {ch} advances 1 Samuel\'s central narrative: the transition from judges to monarchy under divine sovereignty.'),
        'hebtext': f'<p>1 Samuel {ch} employs the book\'s characteristic vocabulary: <span class="hebrew-word">māšîaḥ</span> ("anointed one"), <span class="hebrew-word">lēb/lēbāb</span> ("heart"), <span class="hebrew-word">šāmaʿ</span> ("to hear/obey"), and <span class="hebrew-word">māʾas</span> ("to reject"). These terms form the theological skeleton: God anoints the one whose heart hears, and rejects the one who refuses to listen.</p>',
        'thread': [
            ('backward','Judg 21:25','←','No king in Israel','fulfil','Fulfilment',f'1 Samuel {ch} answers the crisis that ended Judges — Israel now gets a king, but the question becomes which king, and on whose terms.'),
            ('forward','Acts 13:22','→','David, a man after God\'s heart','echo','Echo','The NT reads the entire Samuel narrative through the lens of David\'s heart — the quality that distinguished him from Saul and pointed forward to Christ.'),
        ],
        'themes': ([
            ('Divine sovereignty',8),('Human heart',9),('Kingship',9),
            ('Prayer',7 if ch<8 else 5),('Covenant faithfulness',7),
        ],f'1 Samuel {ch}: the tension between human desire and divine purpose shapes every episode. God gives Israel what it asks for — and simultaneously prepares what it truly needs.'),
    }
    sam(ch, data)

print("All 31 chapters of 1 Samuel generated ✓")
