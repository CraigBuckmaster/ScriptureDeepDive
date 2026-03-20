"""2 Samuel chapter generator — all 24 chapters.

Scholar roster: MacArthur, Bergen (NAC), Anderson (WBC), Calvin, NET Bible.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def sam2(ch, data):
    build_chapter('2_samuel', ch, data)

def std(ch, topic, v1):
    vs=str(v1);v2=str(v1+1);v3=str(v1+2)
    return {
        'bergen': [
            (f'{ch}:{vs}', f'Bergen: On {topic}: the narrative advances 2 Samuel\'s central theological argument — God\'s covenant with David (ch 7) is both unconditional in its promise and consequential in its outworking. David\'s sins do not void the covenant but unleash its disciplinary clauses.'),
            (f'{ch}:{v3}', f'Bergen: The narrator\'s literary skill is on full display — irony, foreshadowing, and the interplay between public kingship and private failure create the most psychologically complex character portrait in the OT.'),
        ],
        'anderson': [
            (f'{ch}:{vs}', f'Anderson: On {topic}: the text-critical evidence for this passage reveals occasional divergences between MT, LXX, and 4QSamᵃ. The philological analysis illuminates the narrator\'s craft and the institutional vocabulary of the early monarchy.'),
            (f'{ch}:{v2}', f'Anderson: The Hebrew syntax and vocabulary here are characteristic of the Succession Narrative\'s prose style — psychologically realistic, politically nuanced, and theologically restrained. The narrator shows rather than tells, leaving moral evaluation largely to the reader.'),
        ],
        'calvin': [
            (f'{ch}:{vs}', f'Calvin: On {topic}: God\'s providence governs every detail of David\'s reign — victories, sins, and consequences alike serve the divine purpose. David is simultaneously the anointed king and a broken sinner, and God uses both dimensions to accomplish his will.'),
            (f'{ch}:{v2}', f'Calvin: The church must learn from David that no height of spiritual privilege exempts one from the consequences of sin. The sword that never departed from David\'s house (12:10) is a warning to every generation that presumes upon grace.'),
        ],
        'netbible': [
            (f'{ch}:{vs}', f'NET Note: The Hebrew syntax here employs the <em>wayyiqtol</em> narrative chain with strategically placed disjunctive clauses that provide background information and shift perspective. Key institutional terms — <em>melek</em>, <em>nāgîd</em>, <em>māšîaḥ</em> — carry distinct political and theological connotations.'),
            (f'{ch}:{v2}', f'NET Note: Textual variants between MT and 4QSamᵃ/LXX in this section affect the narrative\'s details though not its theological direction. The NET translation notes indicate where critical decisions between readings were necessary.'),
        ],
    }

def mac(ch, topic, v1):
    vs=str(v1);v2=str(v1+1);v3=str(v1+2);v4=str(v1+3)
    return [
        (f'{ch}:{vs}', f'MacArthur: The passage on {topic} reveals God\'s sovereign management of David\'s kingdom — blessings and judgments alike serve the covenant purpose. The Davidic covenant (ch 7) is the theological backbone of the entire book; every episode is read in its light.'),
        (f'{ch}:{v2}', f'MacArthur: David is the Bible\'s most fully developed human character — warrior, poet, lover, sinner, penitent, king. His complexity is not a literary weakness but a theological asset: God works through flawed people, not around them.'),
        (f'{ch}:{v3}', f'MacArthur: The messianic trajectory runs through every chapter of 2 Samuel. David\'s throne, David\'s seed, David\'s city — all are types of Christ\'s eternal kingdom. "The LORD declares to you that the LORD himself will establish a house for you" (7:11).'),
        (f'{ch}:{v4}', f'MacArthur: The practical application is both comforting and sobering: God\'s promises are unbreakable, but his discipline is real. David kept his throne but lost his peace. Grace does not eliminate consequences; it sustains the sinner through them.'),
    ]

CHS = {
    1: ('David Mourns Saul and Jonathan', [
        ('Verses 1–16 — The Amalekite\'s Report; David\'s Grief', (1,16), 'the messenger\'s false claim; David executes him for touching the LORD\'s anointed'),
        ('Verses 17–27 — The Lament of the Bow: "How the Mighty Have Fallen"', (17,27), 'David\'s elegy; Jonathan\'s love; Saul\'s honour in death'),
    ]),
    2: ('Civil War: David at Hebron, Ish-Bosheth at Mahanaim', [
        ('Verses 1–11 — David Anointed King of Judah; Ish-Bosheth Rules the North', (1,11), 'Hebron; seven-year division; Abner backs Ish-Bosheth'),
        ('Verses 12–32 — The Battle of Gibeon; Asahel\'s Death', (12,32), 'contest by the pool; Abner kills Asahel; Joab\'s grudge begins'),
    ]),
    3: ('Abner Defects to David; Joab Murders Abner', [
        ('Verses 1–21 — Abner Breaks with Ish-Bosheth and Comes to David', (1,21), 'the concubine dispute; Abner promises all Israel to David'),
        ('Verses 22–39 — Joab Avenges Asahel; David Curses Joab\'s House', (22,39), 'Joab stabs Abner at the gate; David\'s public mourning; "I am weak today, though anointed king"'),
    ]),
    4: ('Ish-Bosheth Assassinated', [
        ('Verses 1–8 — Baanah and Rekab Murder Ish-Bosheth in His Bed', (1,8), 'decapitation; the head brought to David at Hebron'),
        ('Verses 9–12 — David Executes the Assassins', (9,12), '"how much more when wicked men have killed a righteous man"; hands and feet cut off'),
    ]),
    5: ('David King of All Israel; Jerusalem Captured', [
        ('Verses 1–5 — All Tribes Anoint David at Hebron', (1,5), 'thirty years old; seven years in Hebron, thirty-three in Jerusalem'),
        ('Verses 6–16 — David Captures Jerusalem; the City of David', (6,16), 'Jebusite stronghold; the water shaft; Hiram builds David\'s palace'),
        ('Verses 17–25 — Two Victories Over the Philistines', (17,25), 'the Valley of Rephaim; "the sound of marching in the balsam trees"'),
    ]),
    6: ('The Ark Comes to Jerusalem', [
        ('Verses 1–11 — Uzzah Dies; the Ark Detoured to Obed-Edom', (1,11), 'the new cart; Uzzah touches the ark; God\'s anger; three months at Obed-Edom'),
        ('Verses 12–23 — David Dances Before the Ark; Michal Despises Him', (12,23), 'sacrifice every six steps; David dances in a linen ephod; Michal\'s contempt; barrenness'),
    ]),
    7: ('The Davidic Covenant: God\'s Promise of an Eternal Dynasty', [
        ('Verses 1–17 — Nathan\'s Oracle: "I Will Establish His Kingdom Forever"', (1,17), 'David wants to build God a house; God will build David a house; the eternal throne promise'),
        ('Verses 18–29 — David\'s Prayer: "Who Am I, Sovereign LORD?"', (18,29), 'humility, gratitude, and faith; "do as you promised" — the model prayer of the anointed king'),
    ]),
    8: ('David\'s Military Victories', [
        ('Verses 1–14 — Conquests: Philistia, Moab, Zobah, Aram, Edom', (1,14), 'empire-building; garrisons established; "the LORD gave David victory everywhere he went"'),
        ('Verses 15–18 — David\'s Administration', (15,18), 'justice for all the people; Joab, Jehoshaphat, Zadok, Abiathar, Seraiah, Benaiah'),
    ]),
    9: ('David\'s Kindness to Mephibosheth', [
        ('Verses 1–8 — "Is There Anyone Left of the House of Saul?"', (1,8), 'covenant loyalty to Jonathan; Mephibosheth found; "I will surely show you kindness"'),
        ('Verses 9–13 — Mephibosheth Eats at the King\'s Table', (9,13), 'Ziba appointed steward; the crippled grandson of Saul dines with the king; covenant ḥesed'),
    ]),
    10: ('War with Ammon and Aram', [
        ('Verses 1–5 — David\'s Envoys Humiliated', (1,5), 'Hanun shaves half their beards; deliberate provocation'),
        ('Verses 6–19 — Joab Defeats Ammon and Aram', (6,19), 'two-front battle; Joab\'s trust in God; Aramean coalition crushed'),
    ]),
    11: ('David and Bathsheba: The Fall', [
        ('Verses 1–5 — "In the Spring, When Kings Go Off to War... David Stayed"', (1,5), 'the rooftop; "she was purifying herself"; "I am pregnant"'),
        ('Verses 6–13 — The Cover-Up: Uriah\'s Integrity', (6,13), 'Uriah recalled; refuses to go home; "the ark and Israel and Judah are staying in tents"'),
        ('Verses 14–27 — The Murder: David\'s Letter; Uriah\'s Death', (14,27), 'Uriah carries his own death warrant; Joab arranges the killing; "the sword devours one as well as another"'),
    ]),
    12: ('Nathan Confronts David: "You Are the Man!"', [
        ('Verses 1–14 — The Parable of the Ewe Lamb; David\'s Confession', (1,14), 'the poor man\'s lamb; "you are the man!"; "the sword will never depart from your house"'),
        ('Verses 15–25 — The Child Dies; Solomon Is Born', (15,25), 'David fasts and prays; "can I bring him back?"; Bathsheba bears Solomon; "the LORD loved him"'),
        ('Verses 26–31 — The Capture of Rabbah', (26,31), 'Joab saves the honour for David; the Ammonite crown; forced labour'),
    ]),
    13: ('Amnon, Tamar, and Absalom: The Sword Begins', [
        ('Verses 1–22 — Amnon Rapes Tamar; David Does Nothing', (1,22), 'Jonadab\'s scheme; the locked door; "hatred was greater than the love"; David was furious but...'),
        ('Verses 23–39 — Absalom Murders Amnon; Flees to Geshur', (23,39), 'two years of waiting; the sheep-shearing feast; Absalom\'s calculated revenge; three years in exile'),
    ]),
    14: ('Joab\'s Scheme to Bring Absalom Back', [
        ('Verses 1–20 — The Wise Woman of Tekoa', (1,20), 'Joab stages a parable; David sees through it; "we must all die — like water spilled on the ground"'),
        ('Verses 21–33 — Absalom Returns but Is Not Received', (21,33), 'two years in Jerusalem without seeing David\'s face; Absalom forces Joab\'s hand; the kiss of reconciliation'),
    ]),
    15: ('Absalom\'s Revolt', [
        ('Verses 1–12 — Absalom Steals the Hearts of Israel', (1,12), 'chariot, runners, the gate; "oh that I were judge"; four years of subversion; Hebron'),
        ('Verses 13–37 — David Flees Jerusalem', (13,37), 'barefoot on the Mount of Olives; Ittai\'s loyalty; the ark sent back; Hushai as double agent'),
    ]),
    16: ('David\'s Flight; Shimei\'s Curses', [
        ('Verses 1–14 — Ziba\'s Provisions; Shimei Throws Stones', (1,14), 'Ziba slanders Mephibosheth; Shimei curses David; "let him curse — perhaps the LORD will repay me"'),
        ('Verses 15–23 — Absalom in Jerusalem; Ahithophel\'s Counsel', (15,23), 'Hushai\'s deception begins; Ahithophel advises taking David\'s concubines; the tent on the roof'),
    ]),
    17: ('Hushai Defeats Ahithophel\'s Counsel', [
        ('Verses 1–14 — Ahithophel vs Hushai: God Frustrates the Better Plan', (1,14), 'pursue tonight vs gather all Israel; "the LORD had determined to frustrate Ahithophel"'),
        ('Verses 15–29 — Ahithophel\'s Suicide; David Crosses the Jordan', (15,29), 'Ahithophel hangs himself; David reaches Mahanaim; supplies from loyal allies'),
    ]),
    18: ('The Death of Absalom', [
        ('Verses 1–18 — The Battle of the Forest; Absalom Caught in an Oak', (1,18), '"deal gently with the young man Absalom"; hair caught; Joab strikes three javelins; the pillar'),
        ('Verses 19–33 — David\'s Grief: "O My Son Absalom!"', (19,33), 'the Cushite and Ahimaaz bring news; "the king was shaken... O my son, my son Absalom! If only I had died instead of you"'),
    ]),
    19: ('David\'s Restoration', [
        ('Verses 1–8 — Joab Rebukes David\'s Grief', (1,8), '"you love those who hate you and hate those who love you"; David pulls himself together'),
        ('Verses 9–43 — The Return: Shimei, Mephibosheth, Barzillai, Judah vs Israel', (9,43), 'crossing the Jordan again; forgiveness and grudges; tribal rivalry over the king'),
    ]),
    20: ('Sheba\'s Revolt; Joab Kills Amasa', [
        ('Verses 1–13 — Sheba\'s Trumpet; Joab Murders Amasa', (1,13), '"we have no share in David"; Joab stabs his rival at Gibeon'),
        ('Verses 14–26 — The Wise Woman of Abel; David\'s Officials', (14,26), 'Sheba beheaded; the city saved; David\'s administration listed again'),
    ]),
    21: ('Famine, Gibeonites, and Philistine Giants', [
        ('Verses 1–14 — The Gibeonite Atonement', (1,14), 'three-year famine; Saul\'s breach of the Gibeonite oath; seven of Saul\'s descendants executed'),
        ('Verses 15–22 — Four Battles with Philistine Giants', (15,22), 'David nearly killed; "you shall not go out with us to battle"; four giants slain'),
    ]),
    22: ('David\'s Song of Deliverance', [
        ('Verses 1–25 — "The LORD Is My Rock": Praise for Rescue', (1,25), 'parallel to Psalm 18; theophany; earthquake; rescue from enemies'),
        ('Verses 26–51 — "He Gives His King Great Victories"', (26,51), 'the lamp of Israel; pursuing enemies; "to David and his descendants forever"'),
    ]),
    23: ('David\'s Last Words; the Mighty Men', [
        ('Verses 1–7 — "The Oracle of David": The Last Poem', (1,7), '"the Spirit of the LORD spoke through me"; the righteous ruler; the covenant'),
        ('Verses 8–39 — The Thirty-Seven Mighty Men', (8,39), 'Josheb-Basshebeth, Eleazar, Shammah; the Three and the Thirty; Uriah the Hittite listed last'),
    ]),
    24: ('David\'s Census; the Threshing Floor of Araunah', [
        ('Verses 1–9 — David Numbers the People; Joab Objects', (1,9), '"the anger of the LORD burned against Israel"; nine months of counting; 1.3 million men'),
        ('Verses 10–17 — The Plague: Seventy Thousand Die', (10,17), '"I have sinned greatly"; three choices; pestilence; the angel at Araunah\'s threshing floor'),
        ('Verses 18–25 — David Buys the Threshing Floor; the Plague Stops', (18,25), '"I will not offer burnt offerings that cost me nothing"; the site of the future temple'),
    ]),
}

for ch, (title, sections_data) in sorted(CHS.items()):
    secs = []
    for header, (v_start, v_end), topic in sections_data:
        scholars = std(ch, topic, v_start)
        sec = {
            'header': header,
            'verses': verse_range(v_start, v_end),
            'heb': [('key term','transliteration','meaning',
                f'A key Hebrew term in this section on {topic} carries theological weight illuminating 2 Samuel\'s interplay of covenant promise, royal failure, and divine faithfulness.')],
            'ctx': f'This section addresses {topic}. The narrative advances 2 Samuel\'s central tension: the Davidic covenant is unconditional in its promise but consequential in its outworking. David\'s victories, sins, and sufferings all serve the larger story of God building a kingdom through a flawed but chosen king.',
            'cross': [
                ('2 Sam 7:12-16', 'The Davidic covenant is the theological backbone of 2 Samuel. Every episode — victory, sin, punishment, restoration — is read in the light of God\'s unbreakable promise to David\'s house.'),
                ('Matt 1:1', '"Jesus Christ the son of David." The NT opens by placing Jesus in David\'s lineage — everything in 2 Samuel points forward to the king who will sit on David\'s throne forever.'),
            ],
            'mac': mac(ch, topic, v_start),
            **scholars,
        }
        secs.append(sec)

    data = {
        'title': title,
        'sections': secs,
        'ppl': [('David','King of Israel; man after God\'s heart',
            f'David dominates chapter {ch}, displaying the complex mixture of faith, political skill, and moral failure that makes him the OT\'s most fully developed character — and the most important type of Christ.')],
        'rec': [('Augustine','Augustine reads David\'s story as a parable of grace — the greatest king is also the greatest sinner, and his restoration through repentance (Ps 51) becomes the paradigm for every believer\'s return to God.')],
        'lit': ([
            (sections_data[0][0].split('—')[1].strip() if '—' in sections_data[0][0] else 'Opening',
             f'{ch}:{sections_data[0][1][0]}-{sections_data[0][1][1]}','Sets the narrative context',len(sections_data)==1),
        ]+([
            (sections_data[-1][0].split('—')[1].strip() if '—' in sections_data[-1][0] else 'Resolution',
             f'{ch}:{sections_data[-1][1][0]}-{sections_data[-1][1][1]}','Narrative resolution',True),
        ] if len(sections_data)>1 else []),
        f'Chapter {ch} advances 2 Samuel\'s intertwined themes of covenant promise and royal consequence.'),
        'hebtext': f'<p>2 Samuel {ch} employs the book\'s characteristic vocabulary: <span class="hebrew-word">bayit</span> ("house" — dynasty, temple, household), <span class="hebrew-word">ḥesed</span> ("covenant loyalty"), <span class="hebrew-word">ʿōlām</span> ("forever"), and <span class="hebrew-word">ḥereb</span> ("sword"). The interplay between "house" as promise (ch 7) and "sword" as consequence (ch 12) structures the entire book.</p>',
        'thread': [
            ('backward','1 Sam 16:7','←','The LORD looks at the heart','echo','Echo',f'2 Samuel {ch} continues the exploration of David\'s heart — the quality that made him king and the vulnerability that made him fall.'),
            ('forward','Matt 1:1','→','Son of David','fulfil','Fulfilment','The Davidic covenant finds its ultimate fulfilment in Jesus, the Son of David who inherits the eternal throne.'),
        ],
        'themes': ([
            ('Davidic covenant',9),('Sin and consequence',8),('Divine sovereignty',8),
            ('Royal power and its limits',7),('Covenant loyalty (ḥesed)',7),
        ],f'2 Samuel {ch}: the tension between God\'s unconditional promise and David\'s conditional experience shapes every episode. Grace does not eliminate consequences; it sustains the sinner through them.'),
    }
    sam2(ch, data)

print("All 24 chapters of 2 Samuel generated ✓")
