"""
config.py — Data constants for ScriptureDeepDive build system

Extracted from shared.py (Batch 5) to separate data from logic.
These constants are pure data — no functions or side effects.
"""

# ── Per-book commentary roster ────────────────────────────────────────────
#
#  When adding a new book, check this table to decide which scholars to use.
#  Flag in the batch script if a listed scholar does NOT cover the book.
#
#  Book        | Slot 1 (Jewish/OT)    | Slot 2 (Literary)  | Slot 3 (Reformed) | Slot 4 (Notes)
#  ------------|----------------------|--------------------|-------------------|---------------
#  Genesis     | Sarna (JPS Torah)    | Alter (Heb Bible)  | Calvin            | NET Bible
#  Exodus      | Sarna (JPS Torah)    | Alter (Heb Bible)  | Calvin            | NET Bible
#  Ruth        | Hubbard (NICOT Ruth) | Alter (Heb Bible)  | Calvin            | NET Bible
#  Proverbs    | Waltke (NICOT)       | Alter (Heb Bible)  | Calvin            | NET Bible
#  Matthew     | — (NT, no Sarna)     | —                  | Calvin            | NET Bible
#              |   Robertson (NT Gk)  | Catena (Patristic) |                   |
#  Mark        | Marcus (Anchor Bible)| Rhoads (Narrative) | Calvin            | NET Bible
#              |   Robertson (NT Gk)  | Catena (Patristic) |                   |
#  Luke        | Green (NICGT Luke)   | Bovon (Hermeneia)  | Calvin            | NET Bible
#              |   Robertson (NT Gk)  | Catena (Patristic) |                   |
#
#  Hubbard: Robert Hubbard, NICOT Commentary on Ruth (1988). Evangelical-scholarly.
#
#  DECISION LOG:
#  - Ruth: Sarna → Hubbard (Robert Hubbard, NICOT Ruth, 1988)
#    Reason: Sarna did not write on Ruth; Hubbard is the gold-standard
#    evangelical-scholarly commentary on Ruth.
#  - Proverbs: Sarna → Waltke (Bruce K. Waltke, NICOT Proverbs 2 vols, 2004–5)
#    Reason: Sarna did not write on Proverbs; Waltke is the gold-standard
#    evangelical-scholarly commentary on Proverbs.
#  - Matthew: Sarna/Alter not applicable (NT); Robertson + Catena fill slots.
#
# Scope rules for each commentator.
# build_chapter() silently skips a commentator whose scope excludes the current book.
# This means generator scripts never need to know "don't include Robertson in Genesis" —
# the architecture handles it. Add new books to each scope as coverage expands.
COMMENTATOR_SCOPE = {
    # ── Universal — apply to every book ─────────────────────────────────────
    'macarthur': 'all',   # MacArthur Study Bible covers entire canon
    'calvin':    'all',   # Calvin's Commentaries cover entire Bible
    'netbible':  'all',   # NET Bible Full Notes cover entire canon

    # ── OT commentators ──────────────────────────────────────────────────────
    # Nahum Sarna — JPS Torah Commentary (Genesis & Exodus volumes only)
    # SCOPE: Pentateuch only. Ruth included with scholarly-paraphrase caveat.
    # ⚠ Does NOT cover: Proverbs, Psalms, Job, or any non-Torah book.
    'sarna':     ['genesis', 'exodus'],   # JPS Torah — Genesis & Exodus only

    # Robert Alter — The Hebrew Bible: A Translation with Commentary (2019)
    # Covers the entire Hebrew Bible (Torah, Prophets, Writings).
    'alter':     ['genesis', 'exodus', 'ruth', 'proverbs', 'ecclesiastes', 'song_of_solomon'],
    # Future: add 'psalms', 'job', 'isaiah', etc. as built

    # Robert Hubbard — NICOT Commentary on Ruth (1988)
    # SCOPE: Ruth only. The standard evangelical-scholarly Ruth commentary.
    # ⚠ Does NOT cover any other book.
    'hubbard':   ['ruth'],

    # Bruce K. Waltke — NICOT Commentary on Proverbs (2 vols, 2004–2005)
    # SCOPE: Proverbs only. The gold-standard evangelical-scholarly Proverbs commentary.
    # ⚠ Does NOT cover any other book. For Psalms/Job use a different scholar.
    'waltke':    ['proverbs'],
    # Future: if we add Psalms, consider Goldingay or Craigie (WBC)

    # ── NT-only commentators ─────────────────────────────────────────────────
    # A.T. Robertson — Word Pictures in the New Testament (NT only)
    'robertson': ['matthew', 'mark', 'luke', 'john', 'acts'],

    # Catena Aurea — Aquinas compilation on all four Gospels only
    'catena':    ['matthew', 'mark', 'luke', 'john'],
    # Future: 'john'

    # Joel Marcus — Anchor Bible Commentary on Mark (2 vols., 2000/2009)
    # SCOPE: Mark only. Heavyweight historical-critical; strong on Jewish backgrounds,
    # Dead Sea Scrolls parallels, and Roman imperial context.
    'marcus':    ['mark'],

    # Rhoads & Michie — Mark as Story (1982, updated 2012)
    # SCOPE: Mark only. Founding text of Markan narrative criticism —
    # narrator, characters, plot, rhetoric.
    'rhoads':    ['mark'],
    'keener':    ['acts'],
    'milgrom':   ['leviticus', 'numbers'],  # Jacob Milgrom, Anchor Bible Leviticus + Numbers
    'ashley':    ['numbers'],              # Timothy Ashley, NICOT Numbers (1993)
    'craigie':   ['deuteronomy'],           # Peter Craigie, NICOT Deuteronomy (1976)
    'tigay':     ['deuteronomy'],           # Jeffrey Tigay, JPS Torah Deuteronomy (1996)
    'hess':      ['joshua'],                # Richard Hess, TOTC Joshua (1996)
    'howard':    ['joshua'],                # David Howard, NAC Joshua (1998)
    'block':     ['judges'],                # Daniel Block, NAC Judges-Ruth (1999)
    'webb':      ['judges'],                # Barry Webb, NICOT Judges (2012)
    'bergen':    ['1_samuel', '2_samuel'],              # Robert Bergen, NAC 1-2 Samuel (1996)
    'tsumura':   ['1_samuel'],              # David Tsumura, NICOT 1 Samuel (2007)
    'anderson':  ['2_samuel'],              # A.A. Anderson, WBC 2 Samuel (1989)
    'wiseman':   ['1_kings', '2_kings'],   # Donald Wiseman, TOTC 1 & 2 Kings (1993)
    'provan':    ['1_kings', '2_kings'],
    'selman':    ['1_chronicles', '2_chronicles'],  # Martin Selman, TOTC 1 \& 2 Chronicles (1994)
    'japhet':    ['1_chronicles', '2_chronicles'],  # Sara Japhet, OTL I \& II Chronicles (1993)
    'kidner':    ['ezra', 'nehemiah'],                              # Derek Kidner, TOTC Ezra-Nehemiah (1979)
    'williamson':['ezra', 'nehemiah'],
    'jobes':     ['esther'],                             # Karen Jobes, NIVAC Esther (1999)
    'levenson':  ['esther'],
    'clines':    ['job'],                              # David Clines, WBC Job (1989-2011)
    'habel':     ['job'],
    'longman':   ['ecclesiastes', 'song_of_solomon'],               # Tremper Longman III, NICOT Ecclesiastes (1998)
    'fox':       ['ecclesiastes'],
    'garrett':   ['song_of_solomon'],            # Duane Garrett, NAC Song of Songs (2004)               # Michael V. Fox, JPS Ecclesiastes (2004)                              # Norman Habel, OTL Job (1985)                             # Jon Levenson, OTL Esther (1997),                              # H.G.M. Williamson, WBC Ezra-Nehemiah (1985)   # Iain Provan, NIBCOT 1 & 2 Kings (1995)
}


BOOK_META = {
    'genesis': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses (Moshe ben Amram), c.1526&ndash;1406 BC. Born a Hebrew slave in Egypt, '
                 'adopted into Pharaoh\'s household, educated in "all the wisdom of the Egyptians" (Acts 7:22). '
                 'Fled to Midian after killing an Egyptian overseer; spent 40 years as a shepherd under Jethro. '
                 'Called at the burning bush (Exod 3) to lead the Exodus at age 80. Spent 40 years leading Israel '
                 'through the wilderness; died on Mount Nebo in sight of Canaan, age 120.\n\n'
                 '<strong>When written:</strong> c.1445&ndash;1405 BC during the wilderness period, following the Exodus from Egypt. '
                 'Moses drew on earlier patriarchal records, oral tradition, and direct divine revelation. '
                 'The Pentateuch as a whole shows strong literary unity and was treated as Mosaic by both the OT '
                 '(Josh 8:31; 1 Kgs 2:3; Ezra 6:18) and the NT (Mark 12:26; Luke 24:27; John 5:46).\n\n'
                 '<strong>What prompted it:</strong> To record God\'s creation of the world and his covenant relationship '
                 'with the patriarchs &mdash; Abraham, Isaac, Jacob, and Joseph &mdash; culminating in Israel\'s formation '
                 'as a people chosen to carry the promise of blessing to all nations (Gen 12:1&ndash;3). '
                 'Genesis answers the foundational questions: Who is God? Who are we? What went wrong? '
                 'What is God doing about it?'),
        'vhl_places': ['Egypt','Canaan','Goshen','Bethel','Beersheba','Shechem','Hebron','Jordan','Mamre','Haran'],
        'vhl_people': ['Jacob','Joseph','Israel','Pharaoh','Judah','Benjamin','Reuben','Simeon',
                       'Isaac','Abraham','Sarah','Rebekah','Rachel','Leah','Laban','Esau'],
        'vhl_time':   ['day','days','night','year','years','generation','time','age'],
        'vhl_key':    ['covenant','blessing','promise','God','LORD','Israel','faith','fear','firstborn','seed'],
    },
    'exodus': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses, according to Jewish and Christian tradition.\n\n'
                 '<strong>When written:</strong> c.1445-1405 BC during the wilderness period.\n\n'
                 '<strong>What prompted it:</strong> To record God\'s redemption of Israel from Egypt '
                 'and the establishment of the covenant at Sinai.'),
        'vhl_places': ['Egypt','Goshen','Sinai','Midian','wilderness','Canaan','mountain','tabernacle','Nile'],
        'vhl_people': ['Moses','Aaron','Pharaoh','LORD','Miriam','Joshua','Bezalel','Israel','Israelites'],
        'vhl_time':   ['day','days','night','morning','year','generation','Sabbath','Passover'],
        'vhl_key':    ['covenant','commandment','law','holy','glory','tabernacle','sacrifice',
                       'redeem','deliver','sign','wonder','plague'],
    },
    'leviticus': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses, c.1446&ndash;1406 BC. Leviticus records the laws '
                 'given to Israel at Sinai immediately after the tabernacle was erected (Exod 40). '
                 'The Hebrew title <em>Wayyiqraʾ</em> (“And He called”) captures the book’s '
                 'essence: God summons Israel into a priestly relationship. The book covers '
                 'approximately one month at Sinai between Exodus 40:17 and Numbers 1:1.<br><br>'
                 '<strong>Date:</strong> c.1446 BC (early Exodus date). The priestly legislation '
                 'is internally coherent and reflects detailed tabernacle-era conditions.<br><br>'
                 '<strong>Theme:</strong> Holiness — <em>qādōš</em> (holy) appears 87 times. '
                 'The governing call: “Be holy, for I the Lord your God am holy” (19:2). '
                 'Leviticus teaches Israel to approach a holy God through the sacrificial system, '
                 'maintain covenant purity, and embody holiness in every dimension of life.'),
        'vhl_places': [],
        'vhl_people': ['Aaron', 'Moses', 'Nadab', 'Abihu', 'Eleazar', 'Ithamar'],
        'vhl_time':   [],
        'vhl_key':    ['holy', 'holiness', 'atonement', 'offering', 'blood', 'clean', 'unclean',
                       'priest', 'sacrifice', 'burnt offering', 'sin offering', 'guilt offering',
                       'fellowship offering', 'grain offering', 'tabernacle', 'tent of meeting'],
    },
    'numbers': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses, with editorial arrangement c.1446&ndash;1406 BC. '
                 'Numbers covers the wilderness years from Sinai to the plains of Moab &mdash; '
                 'approximately 38 years of Israel\u2019s journey. The Hebrew title <em>Bemidbar</em> '
                 '(&ldquo;In the wilderness&rdquo;) captures the book’s essence: God sustaining '
                 'his people through a generation of failure, discipline, and eventual renewal.<br><br>'
                 '<strong>Date:</strong> c.1446&ndash;1406 BC. The book covers from the second year '
                 'after the Exodus (Num 1:1) to the fortieth year (Num 33:38), ending with Israel '
                 'camped on the plains of Moab, poised to enter Canaan.<br><br>'
                 '<strong>Theme:</strong> The faithfulness of God amid Israel’s persistent '
                 'unfaithfulness. Every act of rebellion (murmuring, the spy crisis, Korah’s '
                 'revolt, Baal Peor) is met with judgment and then mercy. Numbers is the book '
                 'of the wilderness generation’s failure and the new generation’s hope &mdash; '
                 'the old must die before the new can enter.'),
        'vhl_places': ['Sinai', 'Kadesh', 'Moab', 'Canaan', 'Edom', 'Paran', 'Hormah', 'Peor'],
        'vhl_people': ['Moses', 'Aaron', 'Miriam', 'Caleb', 'Joshua', 'Korah', 'Dathan',
                       'Abiram', 'Balaam', 'Balak', 'Phinehas', 'Zelophehad'],
        'vhl_time':   [],
        'vhl_key':    ['census', 'camp', 'tabernacle', 'cloud', 'fire', 'offering', 'vow',
                       'Nazirite', 'jealousy', 'rebellion', 'murmur', 'plague', 'bronze serpent',
                       'inheritance', 'cities of refuge', 'firstfruits', 'atonement'],
    },


    'deuteronomy': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses, with a brief editorial postscript (Deut 34). '
                 'The Hebrew title <em>Devarim</em> (&ldquo;Words&rdquo;) reflects its nature as '
                 'three great farewell addresses.<br><br>'
                 '<strong>Date:</strong> c.1406 BC. The final year of Israel\u2019s wilderness sojourn '
                 'on the plains of Moab. Moses is 120 years old; his death closes the book (34:7).<br><br>'
                 '<strong>Theme:</strong> Covenant love and loyalty. The Shema (6:4\u2013;5) is its '
                 'centrepiece: love for God with whole heart, soul, and strength. Moses calls Israel '
                 'to a choice: covenant faithfulness means life and blessing; apostasy means death '
                 'and exile (30:15\u201320). The book\u2019s structure mirrors Hittite suzerainty '
                 'treaties (Kline, 1963): preamble, historical prologue, stipulations, document '
                 'clause, witnesses, blessings and curses \u2014 evidence for early composition.'),
        'vhl_places': ['Moab', 'Horeb', 'Canaan', 'Ebal', 'Gerizim', 'Nebo', 'Bashan',
                       'Gilead', 'Pisgah', 'Beth-peor', 'Jordan', 'Transjordan'],
        'vhl_people': ['Moses', 'Joshua', 'Caleb', 'Og', 'Sihon', 'Zelophehad'],
        'vhl_time':   [],
        'vhl_key':    ['covenant', 'Shema', 'love', 'obey', 'heart', 'choose', 'remember',
                       'blessing', 'curse', 'life', 'death', 'law', 'Torah', 'prophet',
                       'inheritance', 'land', 'rest', 'holy', 'fear', 'worship', 'tithe',
                       'firstfruits', 'witness', 'cities of refuge', 'king'],
    },    'joshua': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous. Jewish tradition attributes the book to Joshua himself, '
                 'with the final verses (24:29-33) added by Eleazar or Phinehas. The text draws on earlier '
                 'written sources (&ldquo;the Book of Jashar,&rdquo; 10:13) and may have reached its final '
                 'form during the early monarchy.<br><br>'
                 '<strong>Date:</strong> The events span c.1406&ndash;1380 BC, from the Jordan crossing to '
                 'Joshua&rsquo;s death at 110. The book&rsquo;s composition is debated: conservative scholars '
                 'date the core to the late 15th century BC; critical scholars place final editing in the '
                 'Deuteronomistic History (7th&ndash;6th c. BC).<br><br>'
                 '<strong>Theme:</strong> Faithful God, fulfilled promises. The land promised to Abraham (Gen 12:7) '
                 'is finally given to his descendants. The key command: &ldquo;Be strong and courageous&rdquo; (1:6-9). '
                 'The key theological statement: &ldquo;Not one of all the LORD&rsquo;s good promises to Israel '
                 'failed; every one was fulfilled&rdquo; (21:45).'),
        'vhl_people': ['Joshua','Caleb','Rahab','Achan','Phinehas','Eleazar',
                        'Moses','God','LORD','Israel','Gibeonites'],
        'vhl_places': ['Jericho','Jordan','Gilgal','Ai','Gibeon','Shiloh','Shechem',
                        'Hebron','Hazor','Canaan','Ebal','Gerizim','Kadesh'],
        'vhl_key': ['covenant','land','inheritance','conquest','obey','strong','courageous',
                     'holy','destroy','possess','allotment','faithfulness','promise','rest'],
        'vhl_time': ['day','days','year','years','time','generation','month'],
    },

    'judges': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous. Jewish tradition suggests Samuel, but the text is '
                 'anonymous. The recurring phrase &ldquo;in those days there was no king in Israel&rdquo; '
                 '(17:6; 18:1; 19:1; 21:25) implies composition during or after the early monarchy.<br><br>'
                 '<strong>Date:</strong> The events span c.1380&ndash;1050 BC, from Othniel to the eve of '
                 'the monarchy. The repeated cycle &mdash; sin, oppression, cry, deliverance, rest &mdash; '
                 'covers roughly 350 years.<br><br>'
                 '<strong>Theme:</strong> The downward spiral of covenant unfaithfulness. Each judge cycle '
                 'descends further into moral chaos, culminating in civil war (ch.19&ndash;21). '
                 'The refrain: &ldquo;Everyone did what was right in his own eyes&rdquo; (21:25).'),
        'vhl_people': ['Othniel','Ehud','Deborah','Barak','Gideon','Abimelech','Jephthah',
                        'Samson','Delilah','God','LORD','Israel','Philistines'],
        'vhl_places': ['Canaan','Gilead','Shiloh','Shechem','Gaza','Bethlehem','Dan',
                        'Mizpah','Ophrah','Timnah','Hazor'],
        'vhl_key': ['evil','cry','deliver','judge','rest','oppress','forsake','serve',
                     'covenant','idolatry','Baal','Ashtoreth','cycle','king'],
        'vhl_time': ['day','days','year','years','time','generation','month'],
    },
    '1_samuel': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous. Jewish tradition attributes the book to Samuel, Nathan, '
                 'and Gad (1 Chr 29:29). Originally one book with 2 Samuel in the Hebrew canon; divided by '
                 'the LXX translators. The narrative draws on court records, prophetic archives, and the '
                 '&ldquo;Book of Jashar&rdquo; (2 Sam 1:18).<br><br>'
                 '<strong>Date:</strong> Events span c.1100&ndash;1010 BC, from Samuel&rsquo;s birth to '
                 'Saul&rsquo;s death. Composition likely during or after the early monarchy (the phrase '
                 '&ldquo;to this day&rdquo; implies historical distance).<br><br>'
                 '<strong>Theme:</strong> The transition from judges to monarchy. Samuel is the last judge '
                 'and first kingmaker. The book asks: what kind of king does Israel need? Saul answers with '
                 'failure; David is anointed as God&rsquo;s answer. The key theological tension: human '
                 'kingship vs divine sovereignty.'),
        'vhl_people': ['Samuel','Saul','David','Jonathan','Hannah','Eli','Goliath',
                        'Jesse','Abigail','God','LORD','Israel','Philistines'],
        'vhl_places': ['Shiloh','Ramah','Gibeah','Bethlehem','Mizpah','Gilgal',
                        'Nob','Gath','Ziklag','En Gedi','Carmel'],
        'vhl_key': ['king','anoint','spirit','heart','obey','reject','pray','ark',
                     'covenant','prophet','warrior','shepherd','choose'],
        'vhl_time': ['day','days','year','years','time','generation','month'],
    },
    '2_samuel': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous. Originally one book with 1 Samuel. Draws on court '
                 'records, the &ldquo;Succession Narrative&rdquo; (chs 9&ndash;20), and prophetic '
                 'archives. David&rsquo;s lament over Saul and Jonathan (ch 1) and the appendices '
                 '(chs 21&ndash;24) may derive from independent sources.<br><br>'
                 '<strong>Date:</strong> Events span c.1010&ndash;970 BC, from David&rsquo;s accession '
                 'to his final years. The Succession Narrative is widely regarded as one of the earliest '
                 'examples of ancient historiography.<br><br>'
                 '<strong>Theme:</strong> The Davidic covenant and its consequences. God promises David '
                 'an eternal dynasty (ch 7), but David&rsquo;s sin with Bathsheba (chs 11&ndash;12) '
                 'unleashes a chain of violence &mdash; Amnon, Tamar, Absalom &mdash; that nearly '
                 'destroys the very house God promised to build. Grace and judgment intertwine.'),
        'vhl_people': ['David','Joab','Absalom','Nathan','Bathsheba','Uriah','Amnon',
                        'Tamar','Mephibosheth','Abner','Ish-Bosheth','God','LORD','Israel'],
        'vhl_places': ['Hebron','Jerusalem','Zion','Mahanaim','Gilead','Jordan',
                        'Rabbah','Gath','En Rogel','Bahurim'],
        'vhl_key': ['king','covenant','house','dynasty','throne','sin','sword',
                     'loyal','mercy','judgment','anoint','promise','servant'],
        'vhl_time': ['day','days','year','years','time','generation','month'],
    },
    '1_kings': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous. Jewish tradition assigns Kings to Jeremiah, '
                 'but the work draws on multiple sources cited by name: the Book of the Acts of '
                 'Solomon, the Book of the Chronicles of the Kings of Israel, and the Book of the '
                 'Chronicles of the Kings of Judah. The final editor shaped these into a unified '
                 'theological history.<br><br>'
                 '<strong>Date:</strong> Events span c.970&ndash;853 BC, from Solomon&rsquo;s accession '
                 'to Ahaziah of Israel. Final compilation during or after the Babylonian exile '
                 '(post-586 BC), as part of the Deuteronomistic History.<br><br>'
                 '<strong>Theme:</strong> Covenant faithfulness determines national destiny. Solomon&rsquo;s '
                 'wisdom and temple represent the zenith of Israel&rsquo;s covenant life; his apostasy '
                 'and the kingdom&rsquo;s division demonstrate that even the wisest king cannot sustain '
                 'obedience apart from a circumcised heart. The Elijah cycle (chs 17&ndash;19) '
                 'reintroduces the raw power of prophetic witness against royal idolatry.'),
        'vhl_people': ['Solomon','David','Bathsheba','Nathan','Adonijah','Joab','Abiathar','Zadok',
                        'Hiram','Jeroboam','Rehoboam','Ahab','Jezebel','Elijah','Elisha',
                        'Ben-Hadad','Naboth','Micaiah','Jehoshaphat','God','LORD','Israel'],
        'vhl_places': ['Jerusalem','Gibeon','Tyre','Lebanon','Shechem','Dan','Bethel','Samaria',
                        'Jezreel','Carmel','Zarephath','Horeb','Ophir','Ramoth Gilead'],
        'vhl_key': ['wisdom','temple','covenant','kingdom','throne','prophet','altar','sacrifice',
                     'high places','Baal','apostasy','drought','fire','glory','heart','obey'],
        'vhl_time': ['day','days','year','years','month','time','generation'],
    },
    '2_kings': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous (same author/editor as 1 Kings). '
                 'Originally one book with 1 Kings in the Hebrew canon (Melachim). '
                 'The final editor drew on the same court archives and prophetic sources, '
                 'shaping them into a unified Deuteronomistic theological history.<br><br>'
                 '<strong>Date:</strong> Events span c.852&ndash;561 BC, from Elijah&rsquo;s '
                 'departure to Jehoiachin&rsquo;s release in Babylon. Final compilation during '
                 'the exile (post-561 BC), as the closing verses require.<br><br>'
                 '<strong>Theme:</strong> The covenant curses fulfilled. Despite prophetic '
                 'witness (Elisha), revolutionary reform (Jehu), and righteous kings (Hezekiah, '
                 'Josiah), both kingdoms fall. Israel to Assyria (722 BC), Judah to Babylon '
                 '(586 BC). Yet the Davidic line survives &mdash; Jehoiachin is released '
                 '(25:27&ndash;30), a whisper of hope in the darkness.'),
        'vhl_people': ['Elijah','Elisha','Naaman','Gehazi','Jehu','Jezebel','Athaliah','Joash',
                        'Hezekiah','Isaiah','Sennacherib','Manasseh','Josiah','Nebuchadnezzar',
                        'Jehoiachin','Zedekiah','Hilkiah','Huldah','God','LORD','Israel','Judah'],
        'vhl_places': ['Samaria','Jerusalem','Jericho','Jordan','Damascus','Assyria','Babylon',
                        'Shunem','Dothan','Jezreel','Bethel','Carmel','Lachish','Nineveh',
                        'Egypt','Moab','Edom'],
        'vhl_key': ['covenant','temple','high places','exile','deportation','reform','prophet',
                     'judgment','idolatry','Baal','Assyria','Babylon','law','book','fire'],
        'vhl_time': ['day','days','year','years','month','time','generation','reign'],
    },
    '1_chronicles': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous (traditionally attributed to Ezra, but the text is anonymous). '
                 'The author is called "the Chronicler" &mdash; a post-exilic Levitical writer with deep interest in '
                 'temple worship, music, and priestly genealogies. Originally one book with 2 Chronicles (Hebrew: '
                 'Dibr&ecirc; Hayy&acirc;m&icirc;m, "Events of the Days").<br><br>'
                 '<strong>Date:</strong> c.450&ndash;400 BC, during or after the time of Ezra and Nehemiah. '
                 'The genealogy in 3:19&ndash;24 extends several generations past Zerubbabel (c.520 BC), '
                 'placing final composition in the late 5th or early 4th century BC.<br><br>'
                 '<strong>Theme:</strong> Legitimate worship and the continuity of God&rsquo;s people. '
                 'Where Samuel-Kings asks &ldquo;why did we lose everything?&rdquo; Chronicles asks &ldquo;who are we now, '
                 'and how do we worship rightly?&rdquo; David is presented primarily as worship-organiser, not warrior-king. '
                 'The Levites, musicians, and temple service receive more attention than battles and politics.'),
        'vhl_people': ['Adam','Abraham','Isaac','Jacob','Israel','Judah','David','Solomon','Nathan',
                        'Joab','Asaph','Heman','Jeduthun','Zadok','Hiram','Jabez','Uzzah',
                        'Obed-Edom','Ornan','God','LORD'],
        'vhl_places': ['Jerusalem','Hebron','Zion','Gibeon','Kiriath Jearim','Bethlehem',
                        'Tyre','Rabbah','Gath','temple','tabernacle','threshing floor'],
        'vhl_key': ['genealogy','temple','ark','Levites','priest','worship','music','covenant',
                     'all Israel','faithfulness','seek','heart','offering','divisions'],
        'vhl_time': ['day','days','year','years','month','time','generation','reign'],
    },
    '2_chronicles': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> The same anonymous Chronicler who wrote 1 Chronicles. '
                 'Originally a single work, the division into two books occurred in the Greek translation (LXX).<br><br>'
                 '<strong>Date:</strong> c.450&ndash;400 BC. Same compositional period as 1 Chronicles.<br><br>'
                 '<strong>Theme:</strong> The Chronicler retells the history of the Davidic kings from Solomon to the exile, '
                 'focused on temple worship, royal faithfulness, and the seek/forsake pattern: kings who seek God prosper; '
                 'kings who forsake him fall. The northern kingdom is almost entirely ignored &mdash; only Judah matters '
                 'because only Judah has the legitimate temple, priesthood, and Davidic king.'),
        'vhl_people': ['Solomon','Rehoboam','Abijah','Asa','Jehoshaphat','Joram','Ahaziah','Joash',
                        'Amaziah','Uzziah','Jotham','Ahaz','Hezekiah','Manasseh','Josiah','Zedekiah',
                        'Athaliah','Jehoiada','Huldah','Shishak','Sennacherib','Nebuchadnezzar',
                        'God','LORD'],
        'vhl_places': ['Jerusalem','temple','Samaria','Egypt','Assyria','Babylon','Moriah',
                        'Gibeon','Megiddo','Lachish'],
        'vhl_key': ['seek','forsake','temple','altar','priest','Levite','worship','faithfulness',
                     'unfaithfulness','prayer','repentance','reform','covenant','high places'],
        'vhl_time': ['day','days','year','years','month','reign','generation'],
    },
    'ruth': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Unknown; Jewish tradition attributes authorship to Samuel.\n\n'
                 '<strong>When written:</strong> c.1000 BC, possibly early monarchy period.\n\n'
                 '<strong>What prompted it:</strong> To record God\'s providential care for a Moabite widow '
                 'and her mother-in-law, and to trace the lineage of King David.'),
        'vhl_places': ['Bethlehem','Moab','field','gate','threshing floor'],
        'vhl_people': ['Ruth','Naomi','Boaz','Orpah','LORD','redeemer','kinsman'],
        'vhl_time':   ['day','days','harvest','night','morning'],
        'vhl_key':    ['kindness','hesed','redeemer','covenant','blessing','LORD','loyal','faithful'],
    },
    'ezra': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Traditionally Ezra, though the text is anonymous. '
                 '<strong>Date:</strong> c.&thinsp;450&ndash;400 BC. '
                 '<strong>Setting:</strong> Babylon and Jerusalem under Persian rule, covering the returns of 538 BC and 458 BC.'),
        'vhl_places': ['Babylon','Jerusalem','Persia','Judah','Israel','Samaria','Ecbatana','Susa','Egypt','Jordan','Ahava','Casiphia','Zion'],
        'vhl_people': ['Cyrus','Sheshbazzar','Zerubbabel','Jeshua','Ezra','Artaxerxes','Darius','Haggai','Zechariah','Tattenai','Nehemiah','Aaron','David','Moses','Solomon'],
        'vhl_key': ['LORD','God','temple','law','decree','covenant','house','altar','offering','sacrifice','worship','exile','return','vessels','foundation','Passover','Torah'],
        'vhl_time': ['day','days','month','year','years','first year','seventh month','second year','first day'],
    },
    'nehemiah': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Nehemiah son of Hakaliah, with editorial additions. '
                 '<strong>Date:</strong> c.&thinsp;430&ndash;400 BC. '
                 '<strong>Setting:</strong> Susa (Persian capital) and Jerusalem, 445&ndash;432 BC.'),
        'vhl_places': ['Jerusalem','Judah','Samaria','Susa','Israel','Babylon','Egypt','Jordan','Zion','Jericho','Ashdod','Ammon','Moab','Gilead','Ono'],
        'vhl_people': ['Nehemiah','Sanballat','Tobiah','Geshem','Ezra','Artaxerxes','Eliashib','Hanani','Moses','David','Solomon','Abraham','Noah'],
        'vhl_key': ['LORD','God','wall','gates','temple','house','law','covenant','prayer','work','rebuild','guard','fight','remember','joy','tithes','Sabbath'],
        'vhl_time': ['day','days','night','month','year','years','fifty-two days','twelfth year','twentieth year'],
    },
    'esther': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Anonymous. <strong>Date:</strong> c.&thinsp;460&ndash;350 BC. '
                 '<strong>Setting:</strong> Susa, capital of the Persian Empire, during the reign of Ahasuerus (Xerxes I), c.&thinsp;483&ndash;473 BC.'),
        'vhl_places': ['Susa','Persia','India','Ethiopia','Media','Jerusalem','Judah','Babylon'],
        'vhl_people': ['Esther','Mordecai','Haman','Xerxes','Ahasuerus','Vashti','Zeresh','Hathak','Memucan','Hegai','Bigthana','Teresh','Harbona'],
        'vhl_key': ['king','queen','decree','law','sceptre','gallows','feast','banquet','honour','Jews','destroy','deliverance','Purim','lot','edict','royal','throne'],
        'vhl_time': ['day','days','night','month','year','twelfth month','thirteenth day','Adar','Nisan'],
    },
    'job': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Unknown. <strong>Date:</strong> Composition debated (Mosaic to post-exilic). '
                 '<strong>Setting:</strong> The land of Uz, patriarchal era.'),
        'vhl_places': ['Uz','Edom','Sheba','Ophir','Teman','Jordan','Egypt','Rahab'],
        'vhl_people': ['Job','Eliphaz','Bildad','Zophar','Elihu','Satan','God','Moses','Abraham'],
        'vhl_key': ['LORD','God','Almighty','Shaddai','righteous','wicked','wisdom','justice','suffering','redeemer','whirlwind','dust','ashes','integrity','counsel','darkness','light','hope','fear'],
        'vhl_time': ['day','days','night','months','years','morning','dawn'],
    },
    'ecclesiastes': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Traditionally Solomon; the “Teacher” (Qoheleth). '
                 '<strong>Date:</strong> Debated (10th–3rd c. BC). '
                 '<strong>Setting:</strong> Royal court of Jerusalem.'),
        'vhl_places': ['Jerusalem','Israel','Sheol'],
        'vhl_people': ['Qoheleth','Solomon','God'],
        'vhl_key': ['meaningless','hebel','wisdom','folly','toil','profit','portion','time','death','fear','God','righteous','wicked','good','evil','joy','vanity','wind'],
        'vhl_time': ['time','day','days','youth','old','morning','evening','season'],
    },
    'song_of_solomon': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Traditionally Solomon (1:1). '
                 '<strong>Date:</strong> 10th c. BC (traditional) or later. '
                 '<strong>Setting:</strong> Royal court; pastoral landscape of Israel.'),
        'vhl_places': ['Jerusalem','Lebanon','Sharon','Carmel','En Gedi','Tirzah','Hermon'],
        'vhl_people': ['Beloved','Lover','Solomon','Daughters of Jerusalem'],
        'vhl_key': ['love','beloved','beautiful','desire','garden','vineyard','fragrance','kiss','lily','dove','myrrh','wine','spring','fountain','seal'],
        'vhl_time': ['night','day','dawn','spring','winter'],
    },
    'proverbs': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Primarily Solomon son of David (chs.1-29), with additional '
                 'contributions from Agur son of Jakeh (ch.30) and King Lemuel\'s mother (ch.31).\n\n'
                 '<strong>When written:</strong> Core Solomonic material c.970-930 BC; final compilation '
                 'under Hezekiah c.715-686 BC.\n\n'
                 '<strong>What prompted it:</strong> To transmit the accumulated wisdom of Israel\'s sages '
                 'to the next generation -- teaching the fear of the LORD as the foundation of all genuine wisdom.'),
        'vhl_places': ['gate','city','market','field','house','street','court','path','way'],
        'vhl_people': ['LORD','king','fool','wise','righteous','wicked','poor','rich','son','wife','neighbour'],
        'vhl_time':   ['day','days','morning','evening','year','life','age','generation'],
        'vhl_key':    ['wisdom','knowledge','understanding','fear','righteous','wicked',
                       'heart','tongue','mouth','honour','pride','humility'],
    },
    'matthew': {
        'is_nt': True,
        'auth': ('<strong>Author:</strong> Matthew (Levi) ben Alphaeus, a tax collector called by Jesus '
                 'at his customs post in Capernaum (Matt 9:9; Mark 2:14). One of the twelve apostles and '
                 'an eyewitness to the ministry of Jesus. He would have been literate and numerate by '
                 'profession — uniquely equipped to compose a carefully structured written account. '
                 'Unanimous early tradition attributes the Gospel to him: Papias (c.AD 125) records that '
                 '"Matthew compiled the oracles in the Hebrew language, and everyone interpreted them as '
                 'best he could." The Gospel as we have it is in polished literary Greek, suggesting '
                 'either a Greek composition drawing on Aramaic sources, or a Greek original.\n\n'
                 '<strong>When written:</strong> c.AD 80&ndash;90, traditionally associated with Antioch '
                 'of Syria, the first great Gentile church and a centre of Jewish-Christian interaction. '
                 'The Gospel presupposes the destruction of Jerusalem (AD 70) in its apocalyptic passages '
                 '(Matt 22:7; 24:15-22), suggesting composition after that date. It draws on Mark\'s '
                 'Gospel (c.AD 65-70) and on a sayings source shared with Luke (conventionally called Q). '
                 'Matthew shapes his sources with a more formal, structured literary hand than any of the '
                 'other evangelists.\n\n'
                 '<strong>What prompted it:</strong> To present Jesus of Nazareth as the fulfilment of '
                 'Israel\'s entire scriptural heritage — the promised Messiah, the new Moses, the true '
                 'Israel, and the Son of God. Matthew writes primarily for a Jewish-Christian community '
                 'navigating its relationship to the synagogue after AD 70. His ten fulfilment-formula '
                 'citations ("all this took place to fulfil what was spoken through the prophet") are the '
                 'theological spine of the work: Israel\'s Scripture is not superseded but completed in '
                 'Jesus. The Great Commission (28:18-20) shows the universal horizon of a Gospel that '
                 'begins with Abraham and ends with all nations.'),
        'vhl_places': ['Jerusalem','Bethany','Gethsemane','Golgotha','temple','Mount of Olives',
                       'Galilee','Capernaum','Nazareth','Jordan'],
        'vhl_people': ['Jesus','disciples','Pharisees','chief priests','Pilate','Judas','Peter',
                       'scribes','crowd','elders','John'],
        'vhl_time':   ['day','days','night','morning','third day','hour','age','coming','generation'],
        'vhl_key':    ['kingdom','covenant','blood','resurrection','Son of Man','Son of God',
                       'authority','judgment','forgive','fulfil','law','gospel'],
    },
    'mark': {
        'is_nt': True,
        'auth': ('<strong>Author:</strong> John Mark, companion of Peter and Paul. Early and unanimous '
                 'tradition (Papias, c.AD 125; Irenaeus; Clement of Alexandria) identifies Mark as the '
                 'interpreter of Peter — his Gospel preserves the apostle\'s eyewitness testimony in '
                 'compressed, vivid narrative. Mark is mentioned in Acts 12:12, 25; 13:13; 15:37-39; '
                 'Col 4:10; Phm 24; and 1 Pet 5:13 ("my son Mark"), confirming the Petrine connection. '
                 'The Gospel\'s Latinisms, explanation of Jewish customs, and Roman audience markers '
                 'support a Roman provenance.'),
        'vhl_places': ['Galilee', 'Capernaum', 'Jerusalem', 'Judea', 'Jordan',
                       'temple', 'Decapolis', 'Caesarea Philippi', 'Bethany',
                       'Gethsemane', 'Golgotha', 'synagogue', 'wilderness'],
        'vhl_people': ['Jesus', 'disciples', 'Pharisees', 'scribes', 'Peter',
                       'John', 'James', 'crowd', 'demon', 'priest', 'Pilate',
                       'Herod', 'elders', 'chief priests'],
        'vhl_time':   ['day', 'days', 'night', 'morning', 'immediately',
                       'straightway', 'hour', 'third day', 'evening', 'coming'],
        'vhl_key':    ['kingdom', 'gospel', 'Son of God', 'Son of Man', 'faith',
                       'authority', 'repent', 'blood', 'covenant', 'ransom',
                       'Holy Spirit', 'forgive', 'power', 'immediately'],
    },
    'luke': {
        'is_nt': True,
        'auth': ('<strong>Author:</strong> Luke, a Gentile physician (Col 4:14) and the most '
                 'accomplished literary stylist in the New Testament. His Greek is the most '
                 'polished in the NT corpus &mdash; modelled on the style of educated Hellenistic '
                 'historians such as Thucydides and Polybius. Early and unanimous church tradition '
                 '(Irenaeus c.&thinsp;AD&thinsp;180, Clement of Alexandria, Origen, Eusebius, '
                 'Jerome) identifies him as the author of both this Gospel and the Acts of the '
                 'Apostles. He was a close companion of Paul (Phlm 24; 2 Tim 4:11, &ldquo;only '
                 'Luke is with me&rdquo;), and the &ldquo;we&rdquo; passages in Acts '
                 '(16:10&ndash;17; 20:5&ndash;15; 21:1&ndash;18; 27:1&ndash;28:16) confirm '
                 'direct eyewitness participation in events he narrates. Luke is the only '
                 'Gentile author in the canon. He explicitly describes his method in the '
                 'prologue (1:1&ndash;4): careful investigation of all available tradition, '
                 'consultation of eyewitnesses and ministers of the word, and orderly composition '
                 'for a patron named Theophilus &mdash; a preface that conforms to the best '
                 'conventions of Hellenistic historiography.\n\n'
                 '<strong>When written:</strong> c.&thinsp;AD&thinsp;62&ndash;70, most likely '
                 'during Paul&rsquo;s two-year imprisonment in Caesarea (Acts 24:27, c.&thinsp;AD '
                 '57&ndash;59) or shortly thereafter, with publication before Acts (which '
                 'presupposes it, Acts 1:1). A pre-AD&thinsp;70 date is supported by the absence '
                 'of any reference to the destruction of Jerusalem as a past event; the '
                 'Gospel&rsquo;s detailed prediction of the siege (21:20&ndash;24) reads as '
                 'prophecy, not retrospective commentary. A minority of scholars favour '
                 'AD&thinsp;70&ndash;85, arguing that the precision of 21:20 reflects '
                 'post-event knowledge. The two-volume work (Luke&ndash;Acts) is approximately '
                 '27,000 words &mdash; the largest single contribution to the NT by word count.\n\n'
                 '<strong>What prompted it:</strong> Luke writes for Theophilus (&ldquo;friend '
                 'of God&rdquo;), probably a Gentile patron of high social standing '
                 '(&ldquo;most excellent,&rdquo; Acts 1:1, a term used for Roman officials), '
                 'who has already received some instruction in the faith but needs a reliable, '
                 'ordered account to confirm its certainty (1:4). More broadly, Luke&rsquo;s '
                 'two-volume work addresses the expanding Gentile mission: How does the story of '
                 'a Jewish Messiah become good news for all nations? His Gospel foregrounds '
                 'the inclusion of the poor, women, Samaritans, and Gentiles; his Acts shows '
                 'the gospel moving from Jerusalem to Rome. Luke also addresses a pastoral '
                 'crisis: the delay of the Parousia. His travel narrative (9:51&ndash;19:28) '
                 'reframes discipleship as a sustained journey of formation, not merely '
                 'expectation of an imminent end. The Gospel&rsquo;s persistent themes &mdash; '
                 'prayer, joy, the Holy Spirit, reversal of fortune, universal salvation &mdash; '
                 'all serve this dual apologetic and pastoral purpose.'),
        'vhl_places': ['Jerusalem', 'Galilee', 'Judea', 'Samaria', 'Nazareth', 'Capernaum',
                       'Bethlehem', 'Jordan', 'temple', 'synagogue', 'road', 'Jericho'],
        'vhl_people': ['Jesus', 'disciples', 'Pharisees', 'scribes', 'Peter', 'John', 'James',
                       'crowd', 'elders', 'chief priests', 'Pilate', 'Herod', 'angel', 'women'],
        'vhl_time':   ['day', 'days', 'night', 'morning', 'hour', 'today', 'year',
                       'generation', 'coming', 'now', 'appointed time'],
        'vhl_key':    ['kingdom', 'Son of Man', 'salvation', 'Spirit', 'repent', 'forgive',
                       'grace', 'glory', 'faith', 'gospel', 'poor', 'joy', 'covenant', 'prophet'],
    },

    'john': {
        'is_nt': True,
        'auth': (
            '<strong>Author:</strong> John the son of Zebedee &mdash; fisherman, apostle, '
            'and &ldquo;the disciple whom Jesus loved&rdquo; (John 13:23; 19:26; 20:2; 21:7, 20). '
            'The fourth Gospel never names its author directly, but the evidence converges on John: '
            '(1) The &ldquo;beloved disciple&rdquo; is an eyewitness (19:35; 21:24) present at the '
            'Last Supper, the cross, and the empty tomb. (2) Early and unanimous tradition: Irenaeus '
            '(c.&thinsp;AD&thinsp;180), Clement of Alexandria, Origen, and Eusebius all identify '
            'the author as John the apostle writing from Ephesus in old age. (3) The Gospel\u2019s '
            'intimate knowledge of Jerusalem topography (Pool of Bethesda, Pool of Siloam, '
            'the Pavement/Gabbatha) is confirmed by archaeology. (4) The eyewitness claim of 19:35 '
            'and the closing verse of 21:24 point to direct authorial witness. Liberal scholarship '
            'has proposed an anonymous Johannine community or the Elder John of Ephesus; the '
            'traditional identification with the apostle remains the best-attested position.'
            '\n\n'
            '<strong>When written:</strong> c.&thinsp;AD&thinsp;85&ndash;95, probably from Ephesus, '
            'making it the latest of the four Gospels. The Rylands Papyrus (P52, '
            'c.&thinsp;AD&thinsp;125) &mdash; the earliest surviving NT manuscript fragment &mdash; '
            'contains John 18:31-33, 37-38, confirming the Gospel was in circulation in Egypt by the '
            'early second century. A pre-AD&thinsp;70 date has been argued from the Temple language '
            'in chs 2, 5, and 10, which reads as description of a standing building; the majority '
            'of scholars favour a post-70 date for the final composition. The three Johannine '
            'letters and Revelation share vocabulary and theological concerns with the Gospel, '
            'suggesting a common Ephesian milieu.'
            '\n\n'
            '<strong>What prompted it:</strong> John states his purpose explicitly &mdash; a rarity '
            'in the Gospels: &ldquo;These are written that you may believe that Jesus is the '
            'Messiah, the Son of God, and that by believing you may have life in his '
            'name&rdquo; (20:31). The Gospel was written to produce and sustain faith in the person '
            'of Jesus as divine Son. It supplements the Synoptics rather than duplicates them: John '
            'omits the Baptism, the Transfiguration, the Olivet Discourse, and the institution of '
            'the Lord\u2019s Supper as a formal narrative, while providing material found nowhere else '
            '&mdash; the wedding at Cana, Nicodemus, the Samaritan woman, the raising of Lazarus, '
            'the Farewell Discourse (chs&thinsp;14&ndash;17), and the resurrection appearances to '
            'Mary Magdalene and Thomas. Its elevated Christology (&ldquo;In the beginning was the '
            'Word&rdquo;) addresses late first-century challenges to the full divinity of Christ and '
            'lays the foundation for all subsequent trinitarian theology.'
        ),
        'vhl_places': ['Jerusalem', 'Galilee', 'Judea', 'Samaria', 'Bethany', 'Cana',
                       'Jordan', 'temple', 'synagogue', 'Capernaum'],
        'vhl_people': ['Jesus', 'disciples', 'Pharisees', 'Jews', 'Peter', 'Thomas', 'Philip',
                       'Mary', 'Martha', 'Lazarus', 'Pilate', 'Nicodemus', 'crowd'],
        'vhl_time':   ['day', 'days', 'night', 'morning', 'hour', 'now', 'today', 'third day',
                       'abide', 'remain', 'eternal', 'before Abraham'],
        'vhl_key':    ['Word', 'light', 'life', 'love', 'truth', 'glory', 'believe', 'sent',
                       'Father', 'Son', 'Spirit', 'witness', 'eternal life', 'sign'],
    },


    'acts': {
        'is_nt': True,
        'auth': (
            '<strong>Author:</strong> Luke the physician (Col 4:14), a Gentile convert and '
            'travelling companion of Paul. Acts is the second volume of a two-part work addressed '
            'to Theophilus (Luke 1:3; Acts 1:1). The &ldquo;we&rdquo; sections (16:10&ndash;17; '
            '20:5&ndash;21:18; 27:1&ndash;28:16) place Luke as an eyewitness participant in '
            'significant portions of the Pauline mission. Irenaeus, Clement of Alexandria, '
            'and the Muratorian Canon (c.&thinsp;AD&thinsp;170) unanimously identify Luke as author.'
            '\n\n'
            '<strong>When written:</strong> c.&thinsp;AD&thinsp;62&ndash;64, most likely during '
            "Paul's Roman imprisonment (28:30&ndash;31). The abrupt ending &mdash; Paul awaiting "
            'trial &mdash; is most naturally explained if Luke wrote before the outcome was known. '
            'The silence about Jerusalem&rsquo;s destruction (AD&thinsp;70) and Paul&rsquo;s death '
            '(c.&thinsp;AD&thinsp;67) supports an early 60s date.'
            '\n\n'
            '<strong>What prompted it:</strong> Luke traces the Gospel from Jerusalem to Rome, '
            'fulfilling the commission of 1:8 (&ldquo;you will be my witnesses in Jerusalem, and '
            'in all Judea and Samaria, and to the ends of the earth&rdquo;). Acts defends the '
            'legitimacy of the Gentile mission, demonstrates the continuity of the church with '
            'Israel, and shows that the gospel&rsquo;s advance is providentially directed through '
            'opposition, imprisonment, and persecution. It is the indispensable bridge between '
            'the Gospels and the Epistles.'
        ),
        'vhl_places': ['Jerusalem','Antioch','Rome','Ephesus','Corinth','Philippi',
                       'Athens','Caesarea','Damascus','Samaria','Judea','Galatia',
                       'synagogue','temple','Macedonia'],
        'vhl_people': ['Paul','Peter','Barnabas','Stephen','Philip','James','Silas',
                       'Timothy','Apollos','Herod','Felix','Festus','Agrippa',
                       'disciples','apostles','elders','Ananias','Cornelius'],
        'vhl_time':   ['day','days','night','morning','hour','years','year',
                       'suddenly','at once','three days','sabbath','Pentecost'],
        'vhl_key':    ['Spirit','repentance','baptized','believe','witness','gospel',
                       'resurrection','kingdom','salvation','Holy Spirit','boldly',
                       'signs','wonders','name','Word','grace','faith','Gentiles'],
    },


}


PEOPLE_BIO = {
    # Cross-book figures
    ('moses',): (
        'Prophet, lawgiver, and covenant mediator',
        'Moses stands at the centre of the Pentateuch’s narrative \u2014 the one man who '
        'spoke with God face to face (Exod 33:11; Num 12:8) and mediated the Sinai '
        'covenant to Israel. In Leviticus he receives the priestly legislation; in '
        'Numbers he leads, intercedes, and ultimately fails at Meribah (Num 20). '
        'The writer of Hebrews calls him "faithful in all God’s house" (Heb 3:5) '
        'while distinguishing him from Christ, the Son over the house.'
    ),
    ('aaron',): (
        'First high priest of Israel',
        'Aaron, Moses’s brother, is consecrated as Israel’s first high priest in Lev '
        '8–9. He bears the names of the twelve tribes on his breastplate before God '
        'and enters the Most Holy Place once a year on Yom Kippur (Lev 16). His '
        'failures \u2014 the golden calf (Exod 32), challenging Moses’s authority (Num 12), '
        'complicity at Meribah (Num 20) \u2014 make him the paradigm of the imperfect '
        'priest who prefigures a better high priest (Heb 7:26–28).'
    ),
    ('miriam',): (
        'Prophetess and worship leader; Moses’s sister',
        'Miriam leads Israel’s women in worship after the Red Sea crossing (Exod 15:20) '
        'and is called a prophetess. In Num 12 she challenges Moses’s unique prophetic '
        'authority alongside Aaron and is struck with ṣāraʿat \u2014 only to be healed '
        'after Moses’s seven-word intercession. She dies at Kadesh (Num 20:1), her '
        'passing noted in two terse Hebrew words before the water crisis.'
    ),
    ('caleb',): (
        'Spy from Judah; wholehearted follower of God',
        'Caleb alone among the twelve spies urges immediate entry into Canaan (Num '
        '13:30). The word that defines him is "wholehearted" \u2014 he followed God '
        'wholeheartedly (Num 14:24) when the rest of his generation did not. As a '
        'result he is exempted from the forty-year sentence and enters the land at '
        'age 85, still claiming the Anakite hill country God promised him (Josh '
        '14:6–14).'
    ),
    ('joshua',): (
        'Moses’s military commander and designated successor',
        'Joshua son of Nun serves as Moses’s lieutenant throughout the wilderness '
        'period \u2014 commanding at Rephidim (Exod 17), ascending Sinai with Moses '
        '(Exod 24), guarding the tent of meeting. In Num 13–14 he stands with '
        'Caleb as one of two faithful spies. He is formally commissioned in Num 27 '
        'through Moses’s hand-laying and inherits the leadership role that Moses '
        'cannot fulfil past the Jordan.'
    ),
    ('korah',): (
        'Levite leader of the great wilderness rebellion',
        'Korah son of Izhar (a Kohathite) leads the most theologically sophisticated '
        'challenge to covenant authority in Numbers \u2014 arguing that the Aaronic '
        'priesthood contradicts the community’s universal holiness (Num 16:3). The '
        'earth opens and swallows him with Dathan and Abiram; 250 followers die by '
        'divine fire. Jude cites "Korah’s rebellion" as the paradigmatic pattern '
        'of those who despise legitimate spiritual authority (Jude 11).'
    ),
    ('balaam',): (
        'Mesopotamian seer hired to curse Israel',
        'Balaam son of Beor is attested outside the Bible \u2014 the Deir Alla inscription '
        '(c.800 BC) names him as a seer from the region. In Num 22–24 he is hired '
        'by Balak to curse Israel but God compels him to bless instead, producing '
        'four increasingly exalted oracles including the messianic "star from Jacob" '
        '(Num 24:17). His donkey sees what he cannot; his death in Num 31:8 confirms '
        'his role in the Baal Peor seduction (Num 31:16; Rev 2:14).'
    ),
    ('balak',): (
        'King of Moab who hired Balaam to curse Israel',
        'Balak son of Zippor, king of Moab, is terrified by Israel’s military '
        'victories (Num 22:2–4) and commissions Balaam at great expense to produce '
        'a prophetic curse. He prepares seven altars and seven sacrifices three times '
        'at three different vantage points, each time receiving a blessing instead. '
        'His furious dismissal of Balaam without payment (Num 24:10–11) is the '
        'oracle cycle’s comic climax. His strategy of seduction through Balaam’s '
        'counsel (Num 31:16) succeeds where his direct curse attempt failed.'
    ),
    ('phinehas',): (
        'Aaron’s grandson; the zealous priest who stopped the Baal Peor plague',
        'Phinehas son of Eleazar acts with decisive, covenant-protecting zeal when an '
        'Israelite leader publicly brings a Midianite woman into the camp during the '
        'Baal Peor plague. His action stops the plague at 24,000 dead and earns him '
        'God’s "covenant of a lasting priesthood" (Num 25:12–13). Psalm 106:31 '
        'credits this as "righteousness for endless generations." He becomes the '
        'ancestor of the Zadokite priestly line and appears again in Josh 22 mediating '
        'the Transjordan tribes’ altar dispute.'
    ),
    ('eleazar',): (
        "Aaron’s son; second high priest of Israel",
        'Eleazar son of Aaron inherits his father’s high-priestly office on Mount Hor '
        '(Num 20:28) \u2014 the vestment-transfer ceremony that occurs in Aaron’s presence '
        'before his death is the Torah’s most solemn succession. Eleazar serves '
        'alongside Joshua to administer the land distribution (Num 34:17) and appears '
        'throughout the late Numbers narrative as the priestly counterpart to Joshua’s '
        'civil authority. His lineage produces Phinehas and eventually Zadok.'
    ),
    ('nadab',): (
        "Aaron’s eldest son; died offering unauthorized fire",
        'Nadab son of Aaron is ordained alongside his father in Lev 8–9, ascending '
        'to the summit of Israel’s priestly hierarchy. In Lev 10:1–2 he and his '
        'brother Abihu offer "unauthorized fire" before the Lord \u2014 fire that God '
        'had not commanded \u2014 and are consumed by divine fire. Aaron’s silence at '
        'their death (Lev 10:3) is one of the Torah’s most austere moments. They '
        'become the paradigm of presumptuous worship throughout the OT.'
    ),
    ('abihu',): (
        "Aaron’s second son; died alongside Nadab",
        'Abihu son of Aaron is ordained with his father and brothers in Lev 8–9 '
        'and dies with Nadab in Lev 10 offering unauthorized fire. The incident '
        'immediately follows the inaugural divine fire accepting the tabernacle’s '
        'first official sacrifice \u2014 making the contrast between authorized and '
        'unauthorized fire as stark as possible. His death, with Nadab’s, establishes '
        'the seriousness of the priestly vocation: proximity to God is privilege '
        'and peril simultaneously.'
    ),
    ('ithamar',): (
        "Aaron’s youngest surviving son; coordinates Levitical clans",
        'Ithamar son of Aaron survives the deaths of Nadab and Abihu to become one '
        'of Aaron’s two surviving sons alongside Eleazar. He coordinates the Gershonite '
        'and Merarite transport duties (Num 4:28, 33) and receives a significant '
        'role in the tabernacle administration. In Lev 10:16–20 Moses initially '
        'rebukes him for not eating the sin offering, accepting his explanation.'
    ),
    # Numbers-specific
    ('dathan',): (
        'Reubenite rebel; allied with Korah against Moses',
        'Dathan son of Eliab joins Korah’s rebellion in Num 16 from the Reubenite '
        'tribal leadership, challenging Moses’s civil authority rather than Aaron’s '
        'priestly office. He and Abiram refuse to appear before Moses (Num 16:12–14), '
        'framing Egypt as a land flowing with milk and honey in the rebellion’s most '
        'complete inversion of covenant narrative. The earth swallows Dathan, Abiram, '
        'and their households when they stand at their tent entrances.'
    ),
    ('abiram',): (
        'Reubenite rebel; allied with Dathan and Korah',
        'Abiram son of Eliab joins Dathan and Korah in the Num 16 rebellion, sharing '
        'the earth-swallowing judgment. His and Dathan’s refusal to come to Moses '
        '("We will not come!") is one of the boldest acts of defiance in the '
        'wilderness narrative. Psalm 106:17 records "the earth opened up and '
        'swallowed Dathan; it buried the company of Abiram."'
    ),
    # Numbers/Deuteronomy additional figures
    ('sihon',): (
        'Amorite king of Heshbon; defeated by Israel',
        'Sihon king of the Amorites ruled from Heshbon in Transjordan. When Israel requested peaceful '
        'passage through his territory, he refused and came out to fight (Num 21:21–25). Israel '
        'defeated him decisively, occupying his territory from the Arnon to the Jabbok. This victory '
        'is retold as a paradigm of God’s power in Deut 1–2, Ps 135:11, and Ps 136:19. '
        'His defeat, alongside Og’s, became a standard example of God’s faithfulness to '
        'Israel in later liturgical tradition.'
    ),
    ('og',): (
        'Giant king of Bashan; last of the Rephaim',
        'Og king of Bashan was the last of the Rephaim — a pre-Israelite giant people. His iron '
        'bed, measuring nine cubits long (c.4.5m), was preserved in Rabbah of Ammon as a monument '
        '(Deut 3:11). Israel defeated him at Edrei after his defeat of Sihon, and Moses divided '
        'his territory among the Transjordan tribes. Deut 3 presents his defeat as proof that God '
        'can give Israel the whole land: if the giant Og fell, so will the Anakites in Canaan. '
        'He appears in numerous later biblical summaries of God’s power (Ps 135, 136; Neh 9).'
    ),
    # Acts figures
    ('peter',): (
        'Lead apostle; spokesperson for the Jerusalem church',
        'Peter (Simon bar Jonah) dominates Acts 1–12 as the church’s primary '
        'spokesman and miracle-worker. He preaches at Pentecost (Acts 2), heals at '
        'the Beautiful Gate (Acts 3), defends before the Sanhedrin (Acts 4–5), '
        'raises Tabitha (Acts 9:36–42), and receives the vision that opens the '
        'gospel to Gentiles (Acts 10). His release from Herod’s prison by an angel '
        '(Acts 12) closes his narrative in Acts; Paul’s story takes over from ch.13.'
    ),
    ('paul',): (
        'Apostle to the Gentiles; author of thirteen NT letters',
        'Paul (Saul of Tarsus) is introduced as a persecutor at Stephen’s stoning '
        '(Acts 7:58) and is dramatically converted on the Damascus road (Acts 9). '
        'He dominates Acts 13–28 across three missionary journeys, planting churches '
        'from Cyprus to Greece to Rome. His final journey to Rome as a prisoner frames '
        'Acts’ theological climax: the gospel reaching the empire’s capital, '
        '"boldly and without hindrance" (Acts 28:31).'
    ),
    ('barnabas',): (
        "Paul’s first missionary partner; 'Son of Encouragement'",
        'Barnabas (Joseph of Cyprus) is introduced as a generous land-seller in Acts '
        '4:36–37 and is the one who vouches for the newly converted Paul to the '
        'suspicious Jerusalem church (Acts 9:27). He leads the Antioch church '
        '(Acts 11:22–24) and takes Paul as his partner for the first missionary '
        'journey (Acts 13–14). Their sharp disagreement over Mark (Acts 15:36–40) '
        'ends their partnership but doubles the missionary coverage.'
    ),
    ('stephen',): (
        'First martyr; deacon whose speech reframed salvation history',
        'Stephen is appointed as one of the seven deacons in Acts 6 to serve the '
        'Hellenistic widows. His speech before the Sanhedrin (Acts 7) is the longest '
        'speech in Acts and a sweeping reinterpretation of Israel’s history as a '
        'pattern of rejecting God’s messengers. He is stoned while seeing the Son '
        'of Man standing at God’s right hand. His death scatters the Jerusalem '
        'church and launches the Gentile mission (Acts 8:1–4).'
    ),
    ('philip',): (
        'Evangelist; deacon who brought the gospel to Samaria and Ethiopia',
        'Philip the evangelist (distinct from Philip the apostle) is one of the '
        'seven deacons of Acts 6. Scattered by Stephen’s persecution, he preaches '
        'in Samaria with signs and wonders (Acts 8:4–13), then is directed by '
        'an angel to the Ethiopian eunuch on the Gaza road (Acts 8:26–40), '
        'baptising him and inaugurating the gospel’s African reach. He later '
        'hosts Paul at Caesarea (Acts 21:8).'
    ),
    ('cornelius',): (
        'Roman centurion; first Gentile convert; pivot of Acts 10',
        'Cornelius is a God-fearing Roman centurion at Caesarea \u2014 devout, generous, '
        'and prayerful but uncircumcised. His angel-directed encounter with Peter '
        '(Acts 10) is the theological turning point of Acts: the Spirit falls on '
        'Gentiles before baptism, demonstrating that God shows no partiality. '
        'Peter’s report to Jerusalem (Acts 11) establishes the principle that '
        'will be formalized at the Jerusalem Council (Acts 15).'
    ),
    ('silas',): (
        "Prophet and Paul’s companion on the second missionary journey",
        'Silas (Silvanus) is a leading figure in the Jerusalem church and a prophet '
        '(Acts 15:32) chosen by Paul to replace Barnabas after their split. He '
        'accompanies Paul through Macedonia, Philippi (imprisoned together, Acts '
        '16:25–34), Thessalonica, Berea, and Corinth. His Roman citizenship '
        'alongside Paul’s creates the legal dynamic at Philippi. He is co-author '
        'of both Thessalonian letters.'
    ),
    ('timothy',): (
        "Paul’s young protégé; co-author of six NT letters",
        'Timothy is recruited at Lystra on the second journey (Acts 16:1–3) \u2014 the '
        'son of a Jewish mother and Greek father, circumcised by Paul to aid '
        'Jewish outreach. He becomes Paul’s most trusted emissary, sent to '
        'troubled churches when Paul cannot go. Paul twice calls him "my true '
        'son in the faith" and addresses two personal letters to him. He is '
        'co-author of six Pauline letters and appears at the end of Hebrews.'
    ),
    ('james',): (
        "Brother of Jesus; leader of the Jerusalem church",
        'James the brother of Jesus (not the apostle James son of Zebedee) emerges '
        'in Acts as the dominant figure of the Jerusalem church. He is not mentioned '
        'in Acts 1–9 but appears decisively in Acts 12:17 (Peter reports to him '
        'after his prison release), acts as president at the Jerusalem Council '
        '(Acts 15:13–21), and receives Paul’s final Jerusalem report (Acts 21:18). '
        'Paul calls him a "pillar" of the church (Gal 2:9). He authored the letter of James.'
    ),
    ('luke',): (
        'Physician; author of Luke-Acts; Paul’s companion',
        'Luke the physician (Col 4:14) is identified by tradition as the author of '
        'Luke-Acts and as Paul’s companion in the "we" passages of Acts (16:10–17; '
        '20:5–21:18; 27:1–28:16). He is with Paul during the second journey '
        '(Philippi onward), the voyage to Rome, and Paul’s imprisonment. '
        'Colossians 4:14 identifies him as "the beloved physician"; Philemon 24 '
        'calls him Paul’s fellow worker.'
    ),
    ('priscilla',): (
        'Teacher and co-worker with Paul and Apollos',
        'Priscilla (Prisca) and her husband Aquila are Jewish tentmakers expelled '
        'from Rome under Claudius. They meet Paul at Corinth (Acts 18:2) and join '
        'his team as both co-workers in tentmaking and teachers of the faith. '
        'When Apollos arrives at Ephesus with incomplete knowledge, Priscilla '
        'and Aquila "took him aside and explained to him the way of God more '
        'adequately" (Acts 18:26). She is mentioned before Aquila four of six '
        'times in the NT, suggesting her prominence.'
    ),
    ('aquila',): (
        'Tentmaker and co-worker; husband of Priscilla',
        'Aquila is a Jewish tentmaker from Pontus who with Priscilla becomes one '
        'of Paul’s most important co-workers. The couple host a church in their '
        'home in both Ephesus and Rome (1 Cor 16:19; Rom 16:3–5) and risk their '
        'lives for Paul (Rom 16:4). Their partnership with Paul in tentmaking '
        'while he is at Corinth models the early church’s pattern of self-supporting '
        'ministry.'
    ),
    ('apollos',): (
        'Eloquent Alexandrian teacher; discipled by Priscilla and Aquila',
        'Apollos is an Alexandrian Jew who arrives at Ephesus knowing the way of '
        'God accurately but only knowing John’s baptism (Acts 18:24–25). After '
        'Priscilla and Aquila complete his instruction, he becomes a powerful '
        'apologist in Achaia, "vigorously refuting his Jewish opponents in public '
        'debate" (Acts 18:28). Paul’s Corinthian correspondence shows Apollos '
        'became an unintended source of factionalism (1 Cor 1:12), though Paul '
        'regards him as a fellow worker.'
    ),
    ('agrippa',): (
        'Herod Agrippa II; king before whom Paul defends himself (Acts 26)',
        'Herod Agrippa II is the last significant Herodian ruler, client-king of '
        'several territories and a man expert in Jewish customs and disputes '
        '(Acts 26:3). Paul’s defence before him in Acts 26 is the most polished '
        'forensic speech in Acts. Agrippa’s response \u2014 "In a short time you would '
        'persuade me to be a Christian?" (Acts 26:28) \u2014 is ambiguous: half-moved '
        'but unwilling to commit. He agrees with Festus that Paul could have been '
        'released had he not appealed to Caesar.'
    ),
    ('felix',): (
        'Roman governor of Judaea; kept Paul in custody for two years',
        'Antonius Felix is governor of Judaea (52–59 AD) when Paul is transferred '
        'from Jerusalem to Caesarea (Acts 23:24). He gives Paul relative freedom '
        'and converses with him privately about faith and righteousness, but '
        '"became frightened" at Paul’s mention of judgment and deferred (Acts '
        '24:25). He keeps Paul imprisoned hoping for a bribe (Acts 24:26) and '
        'leaves him in custody for two years as a political favour to the Jews.'
    ),
    ('festus',): (
        "Felix’s successor as governor; sent Paul to Rome",
        'Porcius Festus replaces Felix as governor (c.59–60 AD). He immediately '
        'confronts the Paul case, offering Paul a Jerusalem trial \u2014 which Paul '
        'refuses by appealing to Caesar (Acts 25:11). Festus consults Agrippa II '
        'before writing his report to Rome, acknowledging that Paul’s charges '
        'concern "their own religion and about a certain Jesus who had died, '
        'but whom Paul asserted to be alive" (Acts 25:19). He arranges Paul’s '
        'hearing before Agrippa (Acts 25:23–26:32).'
    ),
}

# ── Scholar Registry ─────────────────────────────────────────────────────
# Canonical list of all scholars. Used by build_chapter() to generate
# buttons and panels in a single loop. Adding a new scholar means:
#   1. Add entry here
#   2. Add to COMMENTATOR_SCOPE above
#   3. Add CSS in styles.css
#   4. Add bio page + scholar-data.js entry
# That's it. No more touching shared.py.
#
#   data_key:     key used in section data dicts (e.g. 'mac', 'netbible')
#   scope_key:    key used in COMMENTATOR_SCOPE (e.g. 'macarthur')
#   label:        display name for button text
#   panel_suffix: suffix for panel HTML IDs (e.g. 'mac' → {sid}-mac)
#
SCHOLAR_REGISTRY = [
    # (data_key,    scope_key,    label,          panel_suffix)
    ('mac',         'macarthur',  'MacArthur',    'mac'),
    ('sarna',       'sarna',      'Sarna',        'sarna'),
    ('alter',       'alter',      'Alter',        'alter'),
    ('hubbard',     'hubbard',    'Hubbard',      'hubbard'),
    ('waltke',      'waltke',     'Waltke',       'waltke'),
    ('calvin',      'calvin',     'Calvin',       'calvin'),
    ('netbible',    'netbible',   'NET Notes',    'net'),
    ('robertson',   'robertson',  'Robertson',    'robertson'),
    ('catena',      'catena',     'Catena Aurea', 'catena'),
    ('marcus',      'marcus',     'Marcus',       'marcus'),
    ('rhoads',      'rhoads',     'Rhoads',       'rhoads'),
    ('keener',      'keener',     'Keener',       'keener'),
    ('milgrom',     'milgrom',    'Milgrom',      'milgrom'),
    ('ashley',      'ashley',     'Ashley',       'ashley'),
    ('craigie',     'craigie',    'Craigie',      'craigie'),
    ('tigay',       'tigay',      'Tigay',        'tigay'),
    ('hess',        'hess',       'Hess',         'hess'),
    ('howard',      'howard',     'Howard',       'howard'),
    ('block',       'block',      'Block',        'block'),
    ('webb',        'webb',       'Webb',         'webb'),
    ('williamson',  'williamson', 'Williamson',   'williamson'),
    ('kidner',      'kidner',     'Kidner',       'kidner'),
    ('levenson',    'levenson',   'Levenson',     'levenson'),
    ('jobes',       'jobes',      'Jobes',        'jobes'),
    ('bergen',      'bergen',     'Bergen',       'bergen'),
    ('tsumura',     'tsumura',    'Tsumura',      'tsumura'),
    ('anderson',    'anderson',   'Anderson',     'anderson'),
    ('wiseman',     'wiseman',    'Wiseman',      'wiseman'),
    ('provan',      'provan',     'Provan',       'provan'),
    ('japhet',      'japhet',     'Japhet',       'japhet'),
    ('selman',      'selman',     'Selman',       'selman'),
    ('clines',      'clines',     'Clines',       'clines'),
    ('habel',       'habel',      'Habel',        'habel'),
    ('longman',     'longman',    'Longman',      'longman'),
    ('fox',         'fox',        'Fox',          'fox'),
    ('garrett',     'garrett',    'Garrett',      'garrett'),
]

