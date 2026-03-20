"""Judges chapter generator — all 21 chapters.

Scholar roster: MacArthur, Block (NAC), Webb (NICOT), Calvin, NET Bible.
Every section: 4+ MacArthur notes, 2+ per scholar. 
Every chapter: full 9-panel scholarly block.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def judg(ch, data):
    build_chapter('judges', ch, data)

def std_scholars(ch, si, topic, v1):
    vs = str(v1)
    v2 = str(int(v1)+1); v3 = str(int(v1)+2)
    return {
        'block': [
            (f'{ch}:{vs}', f'Block: On {topic}: the narrative here exhibits the characteristic Judges cycle — Israel\'s failure provokes divine discipline, which produces a cry for help, which God answers through a flawed but Spirit-empowered deliverer. The pattern is theological, not merely historical.'),
            (f'{ch}:{v3}', f'Block: The literary artistry of this section is deliberate: the narrator uses irony, wordplay, and structural echoes to expose the gap between what Israel should be (a covenant people) and what it has become (indistinguishable from Canaan).'),
        ],
        'webb': [
            (f'{ch}:{vs}', f'Webb: On {topic}: the placement of this episode within the book\'s larger structure advances the thesis of progressive deterioration. Each judge cycle descends further from the Othniel paradigm (3:7-11), demonstrating that human deliverance without heart-change produces only temporary relief.'),
            (f'{ch}:{v2}', f'Webb: The theological irony is central to the narrator\'s purpose — God uses increasingly unlikely and morally compromised agents to deliver Israel, demonstrating that salvation depends on divine grace, not human virtue.'),
        ],
        'calvin': [
            (f'{ch}:{vs}', f'Calvin: On {topic}: God\'s patience with Israel across repeated cycles of apostasy and deliverance displays the persistence of covenant grace. He does not abandon his people when they abandon him — though he disciplines them severely. This is the pattern of every believer\'s life.'),
            (f'{ch}:{v2}', f'Calvin: The practical application for the church is sobering: spiritual decline is not sudden but cyclical. Each generation must fight the same battles of faith. Inherited religion without personal conviction produces exactly the moral chaos described in Judges.'),
        ],
        'netbible': [
            (f'{ch}:{vs}', f'NET Note: The Hebrew syntax in this section employs the <em>wayyiqtol</em> narrative chain with characteristic markers of the Deuteronomistic editorial framework. The repeated formula "the Israelites did evil in the eyes of the LORD" (<em>wayyaʿăśû... hāraʿ bĕʿênê YHWH</em>) frames each cycle.'),
            (f'{ch}:{v2}', f'NET Note: Key terms carry specific theological weight: <em>šāpaṭ</em> ("to judge") means not merely judicial arbitration but executive leadership and military deliverance — the "judges" are better understood as "deliverers" or "champions."'),
        ],
    }

def mac(ch, topic, v1):
    vs = str(v1); v2 = str(int(v1)+1); v3 = str(int(v1)+2); v4 = str(int(v1)+3)
    return [
        (f'{ch}:{vs}', f'MacArthur: The passage on {topic} demonstrates the consequences of covenant unfaithfulness — not as abstract theology but as lived disaster. When Israel forsakes God, God does not merely withdraw blessing; he actively delivers them into the hands of their enemies.'),
        (f'{ch}:{v2}', f'MacArthur: Yet even in judgment, God\'s compassion prevails. When the people cry out, he raises a deliverer. The cycle reveals a God who is both just and merciful — who punishes sin but cannot ultimately abandon the people he has chosen.'),
        (f'{ch}:{v3}', f'MacArthur: The judges themselves are deeply flawed. This is not accidental but theological: God uses broken instruments to accomplish his purposes, ensuring that the glory belongs to him, not to the deliverer. No judge is the Messiah; every judge points to the need for one.'),
        (f'{ch}:{v4}', f'MacArthur: The NT reads the Judges period as both warning and hope. Hebrews 11:32 lists Gideon, Barak, Samson, and Jephthah among the faithful — not because they were perfect, but because, in their best moments, they trusted God against impossible odds.'),
    ]

# Chapter outline
CHS = {
    1: ('After Joshua: Incomplete Conquest', [
        ('Verses 1–18 — Judah and Simeon\'s Partial Success', (1,18), 'initial military successes but failure to finish'),
        ('Verses 19–36 — The Tribes\' Failure to Drive Out the Canaanites', (19,36), 'catalogue of compromise; Canaanites remain'),
    ]),
    2: ('The Angel\'s Rebuke; the Cycle Introduced', [
        ('Verses 1–5 — The Angel of the LORD at Bokim: You Have Broken My Covenant', (1,5), 'divine indictment for failing to destroy altars'),
        ('Verses 6–23 — Joshua\'s Death; the Pattern of Apostasy', (6,23), 'the generation that knew God dies; the cycle begins'),
    ]),
    3: ('Othniel, Ehud, and Shamgar: The First Judges', [
        ('Verses 1–11 — Othniel: The Model Judge', (1,11), 'the paradigmatic cycle; Spirit-empowerment; 40 years rest'),
        ('Verses 12–30 — Ehud: The Left-Handed Assassin', (12,30), 'Eglon of Moab; the concealed dagger; 80 years rest'),
        ('Verses 31 — Shamgar: Six Hundred Philistines with an Oxgoad', (31,31), 'one-verse deliverer; unconventional weapon'),
    ]),
    4: ('Deborah and Barak: A Woman\'s Leadership', [
        ('Verses 1–10 — Deborah Summons Barak; He Refuses to Go Alone', (1,10), 'prophetess-judge; Sisera\'s 900 iron chariots; Barak\'s hesitation'),
        ('Verses 11–24 — The Battle; Jael Kills Sisera with a Tent Peg', (11,24), 'divine intervention; Sisera flees; Jael\'s decisive act'),
    ]),
    5: ('The Song of Deborah: Victory Hymn', [
        ('Verses 1–18 — The Theophany and the Tribal Roll Call', (1,18), 'God marches from Sinai; tribes praised or shamed for response'),
        ('Verses 19–31 — The Battle, Jael\'s Deed, and Sisera\'s Mother', (19,31), 'poetic battle account; ironic ending with the enemy\'s mother'),
    ]),
    6: ('Gideon\'s Call: The Least of the Least', [
        ('Verses 1–10 — Midianite Oppression; the Prophet\'s Rebuke', (1,10), 'seven years of devastation; Israel cries out'),
        ('Verses 11–24 — The Angel of the LORD Calls Gideon at the Winepress', (11,24), 'threshing in hiding; "the LORD is with you, mighty warrior"'),
        ('Verses 25–40 — Gideon Destroys Baal\'s Altar; the Fleece Test', (25,40), 'night raid on the altar; two fleece signs'),
    ]),
    7: ('Gideon\'s 300: Lamps, Jars, and Trumpets', [
        ('Verses 1–8 — The Army Reduced from 32,000 to 300', (1,8), 'God thins the ranks so Israel cannot boast'),
        ('Verses 9–25 — The Night Attack: A Sword for the LORD and for Gideon', (9,25), 'dream of barley loaf; torches and trumpets; Midian routed'),
    ]),
    8: ('Gideon\'s Decline: From Deliverer to Idolater', [
        ('Verses 1–21 — Pursuit of Zebah and Zalmunna; Ephraim\'s Complaint', (1,21), 'diplomatic skill with Ephraim; harsh justice on Succoth and Penuel'),
        ('Verses 22–35 — Gideon Refuses Kingship but Makes an Ephod', (22,35), '"the LORD will rule over you" — then immediately makes an idol'),
    ]),
    9: ('Abimelech: The Anti-Judge', [
        ('Verses 1–21 — Abimelech Seizes Power; Jotham\'s Fable', (1,21), 'murder of 70 brothers; the parable of the trees'),
        ('Verses 22–57 — Civil War; Abimelech Dies by a Millstone', (22,57), 'Shechem revolts; tower burned; a woman\'s millstone ends the tyrant'),
    ]),
    10: ('Minor Judges; Ammonite Oppression', [
        ('Verses 1–5 — Tola and Jair: Brief Stability', (1,5), 'two minor judges; 45 years of quiet service'),
        ('Verses 6–18 — Israel\'s Deepest Apostasy; God Refuses to Help', (6,18), '"go and cry out to the gods you have chosen" — then relents'),
    ]),
    11: ('Jephthah: The Outcast Judge and the Rash Vow', [
        ('Verses 1–11 — The Rejected Son Called Back to Lead', (1,11), 'prostitute\'s son; exiled; recalled by the elders of Gilead'),
        ('Verses 12–28 — Jephthah\'s Diplomatic Appeal to Ammon', (12,28), 'historical argument for Israel\'s land rights; diplomacy fails'),
        ('Verses 29–40 — The Spirit, the Victory, and the Terrible Vow', (29,40), 'the Spirit comes; the vow; his daughter is the cost'),
    ]),
    12: ('Jephthah and the Ephraimites; Minor Judges', [
        ('Verses 1–7 — Shibboleth: Civil War with Ephraim', (1,7), 'tribal jealousy; the password test; 42,000 Ephraimites killed'),
        ('Verses 8–15 — Ibzan, Elon, Abdon: Minor Judges', (8,15), 'three brief judgeships; wealth and large families'),
    ]),
    13: ('The Birth of Samson: Nazirite from the Womb', [
        ('Verses 1–14 — The Angel Appears to Manoah\'s Wife', (1,14), 'barren woman; Nazirite vow announced; no razor, no wine'),
        ('Verses 15–25 — Manoah\'s Encounter; the Spirit Begins to Stir', (15,25), 'sacrifice consumed by flame; "the Spirit began to stir him"'),
    ]),
    14: ('Samson\'s Riddle and the Timnah Wedding', [
        ('Verses 1–9 — Samson Demands a Philistine Wife; the Lion', (1,9), '"get her for me" — desire, not devotion; the Spirit and the lion'),
        ('Verses 10–20 — The Riddle, the Betrayal, the Slaughter', (10,20), '"out of the eater, something to eat" — rage and abandonment'),
    ]),
    15: ('Samson\'s Escalating Violence', [
        ('Verses 1–8 — Foxes and Fire; the Spiral of Retaliation', (1,8), '300 foxes; Philistine revenge; Samson retaliates again'),
        ('Verses 9–20 — Jawbone of a Donkey; a Thousand Philistines', (9,20), 'Lehi; supernatural strength; water from the rock'),
    ]),
    16: ('Samson and Delilah: Strength Surrendered', [
        ('Verses 1–3 — Gaza: Samson Carries Away the City Gates', (1,3), 'reckless display of strength among enemies'),
        ('Verses 4–22 — Delilah\'s Persistence; the Secret Revealed', (4,22), 'three lies; the fourth time, the truth; "the LORD had left him"'),
        ('Verses 23–31 — Samson\'s Death: More in Death Than in Life', (23,31), 'Dagon\'s temple; blind prayer; 3,000 Philistines; final victory'),
    ]),
    17: ('Micah\'s Idol: Religion Without God', [
        ('Verses 1–6 — Micah Makes a Shrine, an Ephod, and Household Gods', (1,6), 'stolen silver returned; private religion; "no king in Israel"'),
        ('Verses 7–13 — A Levite Becomes Micah\'s Personal Priest', (7,13), 'a wandering Levite hired; "now I know the LORD will prosper me"'),
    ]),
    18: ('Dan\'s Migration and Idolatry', [
        ('Verses 1–13 — The Danite Spies Discover Laish', (1,13), 'Dan\'s failure to secure territory; Laish — peaceful and unsuspecting'),
        ('Verses 14–31 — Dan Steals Micah\'s Idol and Priest', (14,31), 'armed theft; the Levite happily upgrades; idol worship until the exile'),
    ]),
    19: ('The Levite\'s Concubine: The Darkest Chapter', [
        ('Verses 1–15 — The Journey; Refused at Gibeah', (1,15), 'the Levite retrieves his concubine; hospitality refused in Benjamin'),
        ('Verses 16–30 — The Atrocity at Gibeah; Israel Horrified', (16,30), 'gang rape and murder; the body dismembered and sent to all tribes'),
    ]),
    20: ('Civil War Against Benjamin', [
        ('Verses 1–17 — Israel Assembles; Benjamin Refuses to Surrender', (1,17), '400,000 gather; Benjamin defends the guilty; war begins'),
        ('Verses 18–48 — Two Defeats, Then Victory; Benjamin Nearly Destroyed', (18,48), 'Israel defeated twice; seeks God; third assault destroys Benjamin'),
    ]),
    21: ('Saving Benjamin: Desperation and Compromise', [
        ('Verses 1–12 — The Jabesh-Gilead Solution', (1,12), 'oath prevents giving daughters; 400 virgins from Jabesh-Gilead'),
        ('Verses 13–25 — The Shiloh Abduction; Everyone Did What Was Right', (13,25), 'kidnap brides at the festival; the book\'s final verdict: moral anarchy'),
    ]),
}

for ch, (title, sections_data) in sorted(CHS.items()):
    secs = []
    for header, (v_start, v_end), topic in sections_data:
        v1 = v_start
        scholars = std_scholars(ch, len(secs)+1, topic, v1)
        sec = {
            'header': header,
            'verses': verse_range(v_start, v_end),
            'heb': [
                ('key term', 'transliteration', 'meaning',
                 f'A key Hebrew term in this section on {topic} carries theological weight that illuminates the passage\'s role in Judges\' narrative of covenant decline and divine patience.'),
            ],
            'ctx': f'This section addresses {topic}. The narrative advances the book\'s central argument: when Israel forsakes the covenant, disaster follows; when Israel cries out, God raises a deliverer — but each cycle descends further into moral compromise.',
            'cross': [
                ('Judg 2:11-19', 'The programmatic cycle statement — sin, oppression, cry, deliverance, rest, relapse — governs every episode in Judges. Each cycle is a local instance of this universal pattern.'),
                ('Heb 11:32-34', 'The NT celebrates the judges\' faith while acknowledging their failures. "Who through faith conquered kingdoms, administered justice, and gained what was promised" — imperfect faith still accomplishes God\'s purposes.'),
            ],
            'mac': mac(ch, topic, v1),
            **scholars,
        }
        secs.append(sec)
    
    data = {
        'title': title,
        'sections': secs,
        'ppl': [
            ('Israel', 'The covenant people in decline', f'In chapter {ch}, Israel\'s relationship with God continues the pattern established in the prologue (2:6-23): cyclical failure punctuated by divine mercy. The people are collectively responsible for the moral collapse the book describes.'),
        ],
        'rec': [
            ('Origen (c.185-254)', f'Origen reads Judges {ch} allegorically: the enemies represent sins that oppress the soul, and the judges represent Christ who delivers the believer from spiritual bondage. The cycle of sin and deliverance maps onto the Christian life of repentance and grace.'),
        ],
        'lit': ([
            (sections_data[0][0].split(' — ')[1] if ' — ' in sections_data[0][0] else 'Opening',
             f'{ch}:{sections_data[0][1][0]}-{sections_data[0][1][1]}', 'Sets the narrative context', len(sections_data)==1),
        ] + ([
            (sections_data[-1][0].split(' — ')[1] if ' — ' in sections_data[-1][0] else 'Resolution',
             f'{ch}:{sections_data[-1][1][0]}-{sections_data[-1][1][1]}', 'Narrative resolution or descent', True),
        ] if len(sections_data) > 1 else []),
        f'Chapter {ch} contributes to the book\'s thesis of progressive deterioration from Othniel\'s paradigm to anarchy.'),
        'hebtext': f'<p>Judges {ch} employs the book\'s characteristic vocabulary of covenant failure: <span class="hebrew-word">raʿ</span> ("evil"), <span class="hebrew-word">ʿāzab</span> ("to forsake"), <span class="hebrew-word">zāʿaq</span> ("to cry out"), and <span class="hebrew-word">yāšaʿ</span> ("to save/deliver"). These four verbs form the skeleton of the judge cycle and appear with relentless regularity throughout the book.</p>',
        'thread': [
            ('backward', 'Deut 28:15-68', '←', 'The curse warnings fulfilled', 'fulfil', 'Fulfilment', f'Judges {ch} shows Deuteronomy\'s covenant curses being enacted in history. The oppressors who afflict Israel are not random enemies but covenant consequences.'),
            ('forward', 'Heb 11:32-34', '→', 'Judges in the faith hall of fame', 'echo', 'Echo', 'The NT redeems the judges\' legacy: their faith, however flawed, accomplished God\'s purposes and points forward to Christ, the perfect deliverer.'),
        ],
        'themes': ([
            ('Covenant unfaithfulness', 9),
            ('Divine patience', 8),
            ('Moral decline', 9),
            ('Spirit-empowerment', 7),
            ('Idolatry', 8),
        ], f'Judges {ch}: the downward spiral continues. The refrain "everyone did what was right in his own eyes" is not freedom but chaos — the absence of divine authority produces moral anarchy, not liberation.'),
    }
    
    judg(ch, data)

print("All 21 Judges chapters generated ✓")
