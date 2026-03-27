"""
config.py — Data constants for CompanionStudy build system

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
    'alter':     ['genesis', 'exodus', 'ruth', 'proverbs', 'ecclesiastes', 'song_of_solomon', 'psalms', 'lamentations'],
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
    'kidner':    ['ezra', 'nehemiah', 'psalms'],                              # Derek Kidner, TOTC Ezra-Nehemiah (1979)
    'williamson':['ezra', 'nehemiah'],
    'jobes':     ['esther'],                             # Karen Jobes, NIVAC Esther (1999)
    'levenson':  ['esther'],
    'clines':    ['job'],                              # David Clines, WBC Job (1989-2011)
    'habel':     ['job'],
    'longman':   ['ecclesiastes', 'song_of_solomon', 'daniel'],               # Tremper Longman III, NICOT Ecclesiastes (1998)
    'fox':       ['ecclesiastes'],
    'garrett':   ['song_of_solomon'],
    'vangemeren':['psalms'],                    # Willem VanGemeren, EBC Psalms (2008)
    'goldingay': ['psalms', 'daniel'],
    'collins':   ['daniel'],
    'childs':  ['isaiah'],
    'oswalt':  ['isaiah'],
    'oconnor':  ['lamentations'],
    'berlin':  ['lamentations'],                    # John Goldingay, BCOT Psalms (2006-2008)            # Duane Garrett, NAC Song of Songs (2004)               # Michael V. Fox, JPS Ecclesiastes (2004)                              # Norman Habel, OTL Job (1985)                             # Jon Levenson, OTL Esther (1997),                              # H.G.M. Williamson, WBC Ezra-Nehemiah (1985)   # Iain Provan, NIBCOT 1 & 2 Kings (1995)
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
    'psalms': {
        'is_nt': False,
        'auth': ('<strong>Authors:</strong> David (73 psalms), Asaph, Sons of Korah, Solomon, Moses, and anonymous. '
                 '<strong>Date:</strong> c. 1400\u2013400 BC. '
                 '<strong>Setting:</strong> Israel\u2019s worship through a millennium.'),
        'vhl_places': ['Zion','Jerusalem','Israel','Egypt','Babylon','Jordan','Hermon','Sinai','Sheol'],
        'vhl_people': ['David','God','Moses','Solomon','Abraham','Jacob','Messiah'],
        'vhl_key': ['LORD','God','praise','mercy','righteousness','wicked','salvation','trust','fear','love','faithful','king','throne','refuge','shepherd','rock','fortress','holy','glory','prayer'],
        'vhl_time': ['day','night','morning','forever','generations','eternity'],
    },
    'isaiah': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Isaiah son of Amoz (chs.1-39); disputed for chs.40-66 '
                 '("Deutero-Isaiah" / "Trito-Isaiah" or unified authorship).\n\n'
                 '<strong>When written:</strong> 8th century BC (chs.1-39, c.740-700 BC); '
                 'chs.40-66 either late 8th century (traditional) or exilic/post-exilic (critical).\n\n'
                 '<strong>What prompted it:</strong> The Assyrian crisis, Judah\'s covenant unfaithfulness, '
                 'and God\'s plan for universal salvation through the Servant.'),
        'vhl_places': ['Jerusalem','Zion','Babylon','Egypt','Assyria','temple','mountain','wilderness','sea'],
        'vhl_people': ['LORD','servant','king','nations','Israel','Jacob','daughter','remnant'],
        'vhl_time':   ['day','days','time','forever','morning','evening','end','age'],
        'vhl_key':    ['holy','righteousness','justice','salvation','comfort','glory','servant',
                       'light','darkness','covenant','remnant','woe','peace','suffering'],
    },
    'lamentations': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Traditionally attributed to Jeremiah; anonymous in the Hebrew text.\n\n'
                 '<strong>When written:</strong> Shortly after Jerusalem\'s destruction, 586 BC.\n\n'
                 '<strong>What prompted it:</strong> The fall of Jerusalem and destruction of Solomon\'s temple '
                 'by Nebuchadnezzar. Five poems of grief, protest, and tentative hope.'),
        'vhl_places': ['Jerusalem','Zion','gate','street','temple','wall','city'],
        'vhl_people': ['LORD','daughter','children','enemy','prophet','priest','king'],
        'vhl_time':   ['day','night','morning','evening','time','end'],
        'vhl_key':    ['affliction','grief','tears','anger','compassion','faithfulness',
                       'mercy','destruction','sin','hope','suffering','exile'],
    },
    'daniel': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Daniel, with editorial compilation.\n\n'
                 '<strong>When written:</strong> 6th century BC setting (605-536 BC); '
                 'final form debated (6th or 2nd century BC).\n\n'
                 '<strong>What prompted it:</strong> Court tales of faithfulness in exile (chs.1-6) '
                 'and apocalyptic visions of God\'s sovereignty over all kingdoms (chs.7-12).'),
        'vhl_places': ['Babylon','Jerusalem','temple','river','den','furnace','mountain','sea'],
        'vhl_people': ['God','king','son','angel','saints','wise','prince','beast'],
        'vhl_time':   ['time','times','days','years','night','evening','morning','end','eternal'],
        'vhl_key':    ['kingdom','vision','dream','mystery','sovereignty','glory','worship','power',
                       'throne','dominion','stone','horn','beast','angel','decree','wisdom'],
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
    ('vangemeren',  'vangemeren', 'VanGemeren',   'vangemeren'),
    ('goldingay',   'goldingay',  'Goldingay',    'goldingay'),
    ('collins',   'collins',   'Collins',   'collins'),
    ('berlin',    'berlin',    'Berlin',    'berlin'),
    ('oconnor',   'oconnor',   "O'Connor", 'oconnor'),
    ('oswalt',    'oswalt',    'Oswalt',    'oswalt'),
    ('childs',    'childs',    'Childs',    'childs'),
]



BOOK_META['jeremiah'] = {
    'is_nt': False,
    'auth': 'Traditionally attributed to the prophet Jeremiah, son of Hilkiah, a priest from Anathoth in Benjamin. The scroll was dictated to his scribe Baruch son of Neriah (Jer 36:4). Composition spans c. 627–570 BC, covering the reigns of Josiah, Jehoiakim, Jehoiachin, and Zedekiah.',
    'vhl_places': ['Jerusalem', 'Judah', 'Babylon', 'Egypt', 'Anathoth', 'Zion', 'Jordan', 'Euphrates', 'Shiloh', 'Ramah', 'Moab', 'Ammon', 'Edom', 'Philistia', 'Tyre', 'Sidon', 'Damascus'],
    'vhl_people': ['Jeremiah', 'Baruch', 'Josiah', 'Jehoiakim', 'Zedekiah', 'Nebuchadnezzar', 'Moses', 'David', 'Abraham', 'Rachel', 'Hananiah', 'Ebed-Melech', 'Gedaliah', 'Ishmael'],
    'vhl_key': ['covenant', 'word', 'heart', 'repent', 'turn', 'forsake', 'wrath', 'remnant', 'new covenant', 'restore', 'pluck up', 'plant', 'destroy', 'build', 'oracle', 'burden'],
    'vhl_time': ['in those days', 'at that time', 'the days are coming', 'in the reign of', 'in the fourth year', 'in the tenth year'],
}

# Wave 3 scholars for Jeremiah
SCHOLAR_REGISTRY.append(('lundbom', 'lundbom', 'Lundbom', 'lundbom'))
SCHOLAR_REGISTRY.append(('brueggemann', 'brueggemann', 'Brueggemann', 'brueggemann'))

COMMENTATOR_SCOPE['lundbom'] = ['jeremiah']
COMMENTATOR_SCOPE['brueggemann'] = ['jeremiah']

# ── Wave 3: Ezekiel ─────────────────────────────────────────────────────
BOOK_META['ezekiel'] = {
    'is_nt': False,
    'auth': 'Attributed to the prophet-priest Ezekiel son of Buzi (Ezek 1:3), a Zadokite priest deported to Babylon in 597 BC with King Jehoiachin. Prophetic ministry spans 593-571 BC, making him a contemporary of Jeremiah (in Jerusalem) and Daniel (in the Babylonian court). The book is notable for its precise date formulae (14 dated oracles) and first-person narration throughout.',
    'vhl_places': ['Babylon', 'Jerusalem', 'Kebar', 'Chebar', 'Israel', 'Judah', 'Egypt', 'Tyre', 'Sidon', 'Edom', 'Moab', 'Ammon', 'Zion', 'Gog', 'Magog', 'Temple', 'Dead Sea'],
    'vhl_people': ['Ezekiel', 'Daniel', 'Noah', 'Job', 'David', 'Moses', 'Nebuchadnezzar', 'Pharaoh', 'Jaazaniah', 'Pelatiah', 'Oholah', 'Oholibah', 'Gog', 'Tammuz'],
    'vhl_key': ['glory', 'kabod', 'know', 'abomination', 'spirit', 'heart', 'flesh', 'idols', 'vision', 'watchman', 'shepherd', 'covenant', 'holiness', 'profane', 'sanctuary', 'dry bones', 'recognition formula'],
    'vhl_time': ['in the thirtieth year', 'in the fifth year', 'in the sixth year', 'in the seventh year', 'in the ninth year', 'in the tenth year', 'in the eleventh year', 'in the twelfth year', 'in the twenty-fifth year'],
}

# Wave 3 scholars for Ezekiel
SCHOLAR_REGISTRY.append(('zimmerli', 'zimmerli', 'Zimmerli', 'zimmerli'))

COMMENTATOR_SCOPE['block'].append('ezekiel')
COMMENTATOR_SCOPE['zimmerli'] = ['ezekiel']

# ── Wave 4: Jonah ──────────────────────────────────────────────────

BOOK_META['jonah'] = {
    'is_nt': False,
    'auth': 'Attributed to Jonah son of Amittai (Jonah 1:1; cf. 2 Kings 14:25), a prophet from Gath-hepher in the northern kingdom of Israel during the reign of Jeroboam II (c. 786-746 BC). The third-person narration suggests the book was composed or edited by a later hand, though it preserves the prophet\'s experience.',
    'vhl_places': ['Nineveh', 'Tarshish', 'Joppa', 'Gath-hepher', 'Israel'],
    'vhl_people': ['Jonah', 'Jeroboam II', 'Jesus'],
    'vhl_key': ['flee', 'great', 'appointed', 'compassion', 'angry', 'relent', 'perish', 'pity', 'wind', 'storm', 'fish', 'worm', 'vine', 'repent', 'mercy'],
    'vhl_time': ['on the first day', 'on the third day', 'forty days', 'at dawn the next day'],
}

# Stuart — WBC on Hosea-Jonah
SCHOLAR_REGISTRY.append(('stuart', 'stuart', 'Stuart', 'stuart'))

COMMENTATOR_SCOPE['stuart'] = ['jonah']

# ── Wave 4: Amos ───────────────────────────────────────────────────

BOOK_META['amos'] = {
    'is_nt': False,
    'auth': 'Attributed to Amos of Tekoa, a shepherd and dresser of sycamore-fig trees (Amos 1:1; 7:14-15) who prophesied during the reigns of Uzziah of Judah and Jeroboam II of Israel (c. 760-750 BC). Amos was not a professional prophet but a layman called directly by God, making him the earliest writing prophet in the canonical collection.',
    'vhl_places': ['Tekoa', 'Israel', 'Judah', 'Damascus', 'Gaza', 'Tyre', 'Edom', 'Ammon', 'Moab', 'Samaria', 'Bethel', 'Gilgal', 'Beersheba', 'Zion', 'Jerusalem'],
    'vhl_people': ['Amos', 'Jeroboam II', 'Uzziah', 'Amaziah', 'David'],
    'vhl_key': ['justice', 'righteousness', 'day of the LORD', 'lion', 'plumb line', 'basket', 'judgment', 'remnant', 'seek', 'woe', 'oracle', 'fire', 'restore', 'exile', 'famine', 'earthquake'],
    'vhl_time': ['two years before the earthquake', 'in that day', 'the days are coming', 'in those days'],
}

# Andersen-Freedman — Anchor Bible on Amos/Hosea
SCHOLAR_REGISTRY.append(('andersen_freedman', 'andersen_freedman', 'Andersen & Freedman', 'andersen_freedman'))

COMMENTATOR_SCOPE['stuart'].append('amos')
COMMENTATOR_SCOPE['andersen_freedman'] = ['amos']

# ── Wave 4: Obadiah ────────────────────────────────────────────────

BOOK_META['obadiah'] = {
    'is_nt': False,
    'auth': 'Attributed to the prophet Obadiah (Obad 1:1). Nothing else is known about this author; the name means "servant of YHWH" and was common in ancient Israel. Dating is debated: proposals range from the 9th century BC (after an Edomite invasion during Jehoram\'s reign, 2 Chr 21:16-17) to the early 6th century (after Edom\'s collaboration with Babylon in 586 BC). The post-586 date is more widely held.',
    'vhl_places': ['Edom', 'Esau', 'Zion', 'Jerusalem', 'Teman', 'Negev', 'Seir'],
    'vhl_people': ['Esau', 'Jacob'],
    'vhl_key': ['pride', 'day', 'destruction', 'possession', 'kingdom', 'judgment', 'Edom', 'brother', 'violence', 'deliverers'],
    'vhl_time': ['in the day', 'on that day', 'the day of the LORD'],
}

COMMENTATOR_SCOPE['stuart'].append('obadiah')

# ── Wave 4: Joel ───────────────────────────────────────────────────

BOOK_META['joel'] = {
    'is_nt': False,
    'auth': 'Attributed to Joel son of Pethuel (Joel 1:1). Nothing else is known about this prophet. Dating is debated: proposals range from the 9th century to the post-exilic period (5th-4th century BC). The absence of references to a king, the prominence of priests and elders, and the mention of Greeks (3:6) suggest a post-exilic date, though certainty is impossible.',
    'vhl_places': ['Zion', 'Jerusalem', 'Judah', 'Valley of Jehoshaphat', 'Egypt', 'Edom', 'Tyre', 'Sidon', 'Philistia'],
    'vhl_people': ['Joel'],
    'vhl_key': ['day of the LORD', 'locusts', 'Spirit', 'repent', 'restore', 'rend', 'pour out', 'valley', 'harvest', 'darkness', 'army', 'trumpet', 'refuge'],
    'vhl_time': ['the day of the LORD', 'in those days', 'at that time', 'afterward'],
}

COMMENTATOR_SCOPE['stuart'].append('joel')

# ── Wave 4: Hosea ──────────────────────────────────────────────────

BOOK_META['hosea'] = {
    'is_nt': False,
    'auth': 'Attributed to Hosea son of Beeri (Hos 1:1). Hosea prophesied in the northern kingdom of Israel during the reigns of Uzziah, Jotham, Ahaz, and Hezekiah of Judah, and Jeroboam II of Israel (ca. 750-715 BC). He is the only writing prophet native to the northern kingdom. The superscription spans roughly four decades, making Hosea one of the longest-serving prophets. His ministry coincided with Israel\'s final years before the Assyrian conquest of Samaria in 722 BC.',
    'vhl_places': ['Samaria', 'Jezreel', 'Gilead', 'Bethel', 'Gilgal', 'Egypt', 'Assyria', 'Lebanon', 'Ephraim', 'Judah', 'Shechem', 'Tabor', 'Mizpah', 'Baal Peor', 'Admah', 'Zeboiim'],
    'vhl_people': ['Hosea', 'Gomer', 'Jezreel', 'Lo-Ruhamah', 'Lo-Ammi', 'Jeroboam II'],
    'vhl_key': ['harlotry', 'return', 'knowledge', 'faithfulness', 'love', 'covenant', 'Ephraim', 'Baal', 'sow', 'reap', 'compassion', 'heal', 'adultery', 'judgment'],
    'vhl_time': ['in that day', 'in the days of', 'afterward', 'in the last days'],
}

COMMENTATOR_SCOPE['stuart'].append('hosea')
COMMENTATOR_SCOPE['andersen_freedman'].append('hosea')

# ── Wave 4: Micah ──────────────────────────────────────────────────

BOOK_META['micah'] = {
    'is_nt': False,
    'auth': 'Attributed to Micah of Moresheth (Mic 1:1), a small town in the Judean Shephelah southwest of Jerusalem. He prophesied during the reigns of Jotham, Ahaz, and Hezekiah of Judah (ca. 750-686 BC), making him a contemporary of Isaiah and Hosea. Jeremiah 26:18 confirms his historicity, quoting Micah 3:12 and noting that Hezekiah did not put him to death but instead feared the LORD. Micah is the only prophet whose oracle is cited by name in another prophetic book.',
    'vhl_places': ['Moresheth', 'Samaria', 'Jerusalem', 'Zion', 'Bethlehem', 'Lachish', 'Assyria', 'Babylon', 'Egypt', 'Gilead', 'Bashan'],
    'vhl_people': ['Micah', 'Hezekiah', 'Balak', 'Balaam', 'Moses', 'Aaron', 'Miriam'],
    'vhl_key': ['justice', 'mercy', 'walk humbly', 'remnant', 'shepherd', 'ruler', 'peace', 'Zion', 'oppression', 'idolatry', 'faithfulness', 'pardon', 'inheritance'],
    'vhl_time': ['in the last days', 'in that day', 'at that time', 'from of old', 'from ancient times'],
}

COMMENTATOR_SCOPE['stuart'].append('micah')
COMMENTATOR_SCOPE['waltke'].append('micah')

# ── Wave 4: Habakkuk ───────────────────────────────────────────────

BOOK_META['habakkuk'] = {
    'is_nt': False,
    'auth': 'Attributed to the prophet Habakkuk (Hab 1:1; 3:1). Nothing is known about him outside this book. The name may derive from the Akkadian hambakuku, a garden plant, or from the Hebrew root habaq ("to embrace"). The musical notations in chapter 3 (superscription "on shigionoth," closing "for the director of music, on my stringed instruments") suggest a Levitical connection. The book is dated to the late seventh century BC, between the fall of Assyria (612 BC) and the Babylonian invasion of Judah (605-586 BC), most likely during the reign of Jehoiakim (609-598 BC).',
    'vhl_places': ['Babylon', 'Jerusalem', 'Judah', 'Lebanon', 'Teman', 'Mount Paran', 'Cushan', 'Midian'],
    'vhl_people': ['Habakkuk'],
    'vhl_key': ['violence', 'justice', 'faith', 'righteous', 'woe', 'vision', 'wait', 'glory', 'pride', 'silence', 'rejoice', 'strength'],
    'vhl_time': ['in your days', 'at the appointed time', 'yet I will wait', 'though'],
}

COMMENTATOR_SCOPE['robertson'].append('habakkuk')

# ── Wave 4: Nahum ──────────────────────────────────────────────────

BOOK_META['nahum'] = {
    'is_nt': False,
    'auth': 'Attributed to Nahum the Elkoshite (Nah 1:1). The location of Elkosh is unknown; suggestions include al-Qosh in Assyria, Capernaum (kfar Nahum, "village of Nahum") in Galilee, and a site in Judah near Beit Jibrin. The name Nahum means "comfort" or "consolation" (from the root nkh). The book is dated between the fall of Thebes (663 BC, referenced in 3:8-10) and the fall of Nineveh (612 BC), likely in the late seventh century during the reign of Josiah (640-609 BC).',
    'vhl_places': ['Nineveh', 'Judah', 'Thebes', 'Bashan', 'Carmel', 'Lebanon'],
    'vhl_people': ['Nahum'],
    'vhl_key': ['vengeance', 'wrath', 'jealous', 'refuge', 'flood', 'plunder', 'blood', 'lion', 'fortress', 'destruction', 'comfort', 'decree'],
    'vhl_time': ['the LORD is slow to anger', 'no more', 'never again'],
}

COMMENTATOR_SCOPE['robertson'].append('nahum')

# ── Wave 4: Zephaniah ─────────────────────────────────────────────

BOOK_META['zephaniah'] = {
    'is_nt': False,
    'auth': 'Attributed to Zephaniah son of Cushi, son of Gedaliah, son of Amariah, son of Hezekiah (Zeph 1:1). The four-generation genealogy is unique among the prophets and likely traces his lineage to King Hezekiah of Judah, making him of royal blood. The name Zephaniah means "the LORD hides/treasures" (from tsaphan + Yah). The superscription dates his ministry to the reign of Josiah (640-609 BC), likely before the reforms of 621 BC given the condemnation of syncretistic worship practices.',
    'vhl_places': ['Jerusalem', 'Judah', 'Gaza', 'Ashkelon', 'Ashdod', 'Ekron', 'Moab', 'Ammon', 'Cush', 'Nineveh', 'Assyria'],
    'vhl_people': ['Zephaniah', 'Josiah'],
    'vhl_key': ['day of the LORD', 'wrath', 'remnant', 'humble', 'seek', 'shelter', 'purify', 'rejoice', 'shame', 'gather', 'restore', 'punishment'],
    'vhl_time': ['the great day', 'at that time', 'on that day', 'before the day', 'in the morning'],
}

COMMENTATOR_SCOPE['robertson'].append('zephaniah')

# ── Wave 4: Haggai ─────────────────────────────────────────────────

BOOK_META['haggai'] = {
    'is_nt': False,
    'auth': 'Attributed to the prophet Haggai (Hag 1:1; 2:1, 10, 20). The name means "festive" or "my feast" (from hag, "pilgrimage feast"), possibly indicating birth during a festival. Haggai prophesied in the second year of the Persian king Darius I (520 BC), making him a contemporary of Zechariah (Ezra 5:1; 6:14). His ministry is precisely dated across four oracles spanning a three-month period (August-December 520 BC). He is one of only two post-exilic prophets (with Zechariah) whose ministry is confirmed in the historical books (Ezra 5:1; 6:14).',
    'vhl_places': ['Jerusalem', 'Judah'],
    'vhl_people': ['Haggai', 'Zerubbabel', 'Joshua son of Jozadak', 'Darius I'],
    'vhl_key': ['temple', 'build', 'glory', 'signet ring', 'chosen', 'consider', 'blessing', 'drought', 'shake', 'desire', 'covenant', 'remnant'],
    'vhl_time': ['in the second year of King Darius', 'on the first day', 'on the twenty-first day', 'on the twenty-fourth day', 'from this day on'],
}

SCHOLAR_REGISTRY.append(('verhoef', 'verhoef', 'Verhoef', 'verhoef'))
COMMENTATOR_SCOPE['verhoef'] = ['haggai']

# ── Zechariah ────────────────────────────────────────────────────────
BOOK_META['zechariah'] = {
    'is_nt': False,
    'auth': 'Attributed to the prophet Zechariah son of Berekiah, son of Iddo (Zec 1:1; cf. Ezra 5:1; 6:14; Neh 12:16). The name means "Yahweh remembers" (from zakar, "to remember"). Zechariah was both a prophet and a priest of the Iddo clan who returned from Babylonian exile. He began prophesying in the eighth month of the second year of Darius I (October/November 520 BC), two months after Haggai\'s first oracle. His dated visions span from 520 to 518 BC (Zec 1:1; 1:7; 7:1), though chapters 9-14 are widely regarded as later compositions. The book divides into two major sections: chapters 1-8 (dated night visions and oracles encouraging temple rebuilding) and chapters 9-14 (undated oracles of eschatological judgment and restoration). Zechariah is the longest of the Minor Prophets and the most apocalyptic, with symbolic visions rivaling Daniel and Ezekiel in complexity.',
    'vhl_places': ['Jerusalem', 'Judah', 'Zion', 'Mount of Olives', 'Babylon'],
    'vhl_people': ['Zechariah', 'Zerubbabel', 'Joshua son of Jozadak', 'Darius I', 'The Branch'],
    'vhl_key': ['Branch', 'jealous', 'return', 'temple', 'wall of fire', 'lampstand', 'olive trees', 'flying scroll', 'four chariots', 'crown', 'fasting', 'truth', 'cornerstone', 'shepherd', 'pierced', 'fountain', 'holy', 'living water', 'remnant'],
    'vhl_time': ['in the eighth month of the second year of Darius', 'on the twenty-fourth day of the eleventh month', 'in the fourth year of King Darius', 'on that day'],
}

SCHOLAR_REGISTRY.append(('boda', 'boda', 'Boda', 'boda'))
COMMENTATOR_SCOPE['boda'] = ['zechariah']

# ── Malachi ──────────────────────────────────────────────────────────
BOOK_META['malachi'] = {
    'is_nt': False,
    'auth': "Attributed to 'Malachi' (Mal 1:1), though the name may be a title rather than a personal name — mal'akhi means 'my messenger,' the same word used in 3:1 ('I will send my messenger'). If a title, the author is anonymous. The book's historical context points to the mid-fifth century BC (c. 460-430 BC), after the Second Temple was completed (515 BC) but before or during Nehemiah's reforms. The community suffers from spiritual apathy, corrupt priesthood, intermarriage with pagan women, divorce, neglect of tithes, and cynical questioning of God's justice — the same issues Nehemiah confronted (Neh 13). Malachi is the last of the twelve Minor Prophets and, in the Christian canon, the final book of the Old Testament, making its closing promise of Elijah's return (4:5-6) a bridge to the New Testament.",
    'vhl_places': ['Jerusalem', 'Judah', 'Edom', 'Horeb'],
    'vhl_people': ['Malachi', 'Jacob', 'Esau', 'Levi', 'Moses', 'Elijah'],
    'vhl_key': ['messenger', 'covenant', 'tithe', 'curse', 'blessing', 'honor', 'love', 'refiner', 'offering', 'sun of righteousness', 'scroll of remembrance', 'treasured possession', 'return', 'robbing God'],
    'vhl_time': ['the day is coming', 'on the day when I act', 'before that great and dreadful day'],
}

SCHOLAR_REGISTRY.append(('hill', 'hill', 'Hill', 'hill'))
COMMENTATOR_SCOPE['hill'] = ['malachi']
COMMENTATOR_SCOPE['verhoef'].append('malachi')

# ══════════════════════════════════════════════════════════════════════
#  WAVE 5 — NT Epistles
# ══════════════════════════════════════════════════════════════════════

# ── Romans ───────────────────────────────────────────────────────────
BOOK_META['romans'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Rom 1:1), formerly Saul of Tarsus, a Pharisee trained under Gamaliel (Acts 22:3). Paul's authorship of Romans is virtually uncontested in scholarship; even the most sceptical critics accept Pauline authorship. The letter's theological depth, autobiographical details, and greeting list (ch.&thinsp;16) all cohere with the Pauline corpus.\n\n<strong>When written:</strong> c.&thinsp;AD&thinsp;57, during Paul's third missionary journey, most likely from Corinth. The mention of Phoebe from Cenchreae (16:1), Gaius as host (16:23; cf. 1&thinsp;Cor 1:14), and Erastus the city director (16:23) all point to Corinth. Paul is about to depart for Jerusalem with the collection (15:25&ndash;28) before his intended visit to Rome and Spain.\n\n<strong>What prompted it:</strong> Paul writes to a church he did not found, introducing himself and his gospel before his planned visit (1:10&ndash;15; 15:22&ndash;29). The letter serves multiple purposes: (1) a comprehensive exposition of the gospel of God's righteousness; (2) pastoral guidance for Jewish-Gentile tensions in the Roman house churches, especially after the return of Jewish Christians following the expiration of Claudius's edict (AD&thinsp;49); (3) a theological foundation for Paul's mission to Spain, seeking Roman support as a base of operations. Romans is the most systematic and theologically comprehensive of Paul's letters.",
    'vhl_places': ['Rome', 'Jerusalem', 'Spain', 'Corinth', 'Cenchreae', 'Israel', 'Zion'],
    'vhl_people': ['Paul', 'Abraham', 'Adam', 'Moses', 'Christ', 'David', 'Isaac', 'Jacob', 'Esau', 'Pharaoh', 'Elijah', 'Isaiah', 'Phoebe', 'Priscilla', 'Aquila'],
    'vhl_key': ['righteousness', 'faith', 'law', 'grace', 'sin', 'justification', 'Spirit', 'flesh', 'gospel', 'wrath', 'glory', 'hope', 'love', 'mercy', 'election', 'predestined', 'sanctification', 'reconciliation', 'redemption', 'adoption'],
    'vhl_time': ['now', 'at the present time', 'at just the right time', 'from the creation of the world', 'the day of God\u2019s wrath'],
}

SCHOLAR_REGISTRY.append(('moo', 'moo', 'Moo', 'moo'))
SCHOLAR_REGISTRY.append(('schreiner', 'schreiner', 'Schreiner', 'schreiner'))
COMMENTATOR_SCOPE['moo'] = ['romans']
COMMENTATOR_SCOPE['schreiner'] = ['romans']

# ── 1 Corinthians ────────────────────────────────────────────────────
BOOK_META['1_corinthians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (1\u2009Cor 1:1), writing with Sosthenes (probably the former synagogue ruler of Acts 18:17). Pauline authorship is universally accepted; the letter\u2019s autobiographical details, theological vocabulary, and cross-references to other Pauline correspondence leave no serious room for doubt.\n\n<strong>When written:</strong> c.\u2009AD\u200955, near the end of Paul\u2019s extended ministry in Ephesus during his third missionary journey (16:8). Paul had already written an earlier (now lost) letter to Corinth (5:9) and had received oral reports from Chloe\u2019s household (1:11) as well as a written letter from the Corinthians raising specific questions (7:1).\n\n<strong>What prompted it:</strong> Multiple crises in the young Corinthian church: factionalism around leaders (chs.\u20091\u20134), sexual immorality (ch.\u20095), lawsuits among believers (6:1\u20138), questions about marriage and celibacy (ch.\u20097), food offered to idols (chs.\u20098\u201310), abuses at the Lord\u2019s Supper (ch.\u200911), spiritual gifts and their regulation (chs.\u200912\u201314), and denial of the bodily resurrection (ch.\u200915). The letter is Paul\u2019s most sustained engagement with the practical outworking of the gospel in a Greco-Roman urban context, addressing how the cross reshapes community life, ethics, worship, and eschatological hope.",
    'vhl_places': ['Corinth', 'Ephesus', 'Jerusalem', 'Cenchreae', 'Achaia', 'Macedonia', 'Asia'],
    'vhl_people': ['Paul', 'Apollos', 'Cephas', 'Christ', 'Sosthenes', 'Stephanas', 'Crispus', 'Gaius', 'Chloe', 'Timothy', 'Moses', 'Adam'],
    'vhl_key': ['wisdom', 'foolishness', 'cross', 'Spirit', 'body', 'temple', 'love', 'resurrection', 'gifts', 'knowledge', 'freedom', 'conscience', 'divisions', 'holiness', 'grace', 'glory', 'power', 'calling', 'church', 'edification'],
    'vhl_time': ['the time is short', 'the present crisis', 'until he comes', 'the last trumpet', 'the day', 'at the coming of the Lord'],
}

SCHOLAR_REGISTRY.append(('fee', 'fee', 'Fee', 'fee'))
SCHOLAR_REGISTRY.append(('thiselton', 'thiselton', 'Thiselton', 'thiselton'))
COMMENTATOR_SCOPE['fee'] = ['1_corinthians', '2_corinthians']
COMMENTATOR_SCOPE['thiselton'] = ['1_corinthians']

# ── 2 Corinthians ────────────────────────────────────────────────────
BOOK_META['2_corinthians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (2\u2009Cor 1:1), writing with Timothy. Pauline authorship is virtually undisputed, though the letter\u2019s literary unity is debated: some scholars propose that chs.\u20091\u20139 and 10\u201313 were originally separate letters, while others defend the integrity of the canonical form.\n\n<strong>When written:</strong> c.\u2009AD\u200955\u201356, from Macedonia (2:13; 7:5), shortly after 1\u2009Corinthians. Between the two canonical letters Paul made a painful visit to Corinth (2:1; 12:14; 13:1\u20132) and wrote a severe \u2018tearful letter\u2019 (2:3\u20134; 7:8\u201312), now lost.\n\n<strong>What prompted it:</strong> Paul writes in response to Titus\u2019s encouraging report from Corinth (7:6\u20137): the majority have repented following the tearful letter. However, a group of \u2018super-apostles\u2019 (11:5; 12:11) have arrived, challenging Paul\u2019s authority, questioning his credentials, and boasting of their own spiritual superiority. The letter is Paul\u2019s most intensely personal and theologically profound defence of his apostolic ministry, articulating a \u2018theology of weakness\u2019 in which divine power is perfected through human frailty (12:9\u201310).",
    'vhl_places': ['Corinth', 'Macedonia', 'Jerusalem', 'Troas', 'Asia', 'Achaia', 'Damascus'],
    'vhl_people': ['Paul', 'Timothy', 'Titus', 'Christ', 'Moses', 'Satan', 'Silvanus'],
    'vhl_key': ['comfort', 'affliction', 'ministry', 'new covenant', 'reconciliation', 'glory', 'weakness', 'power', 'grace', 'boasting', 'sincerity', 'commendation', 'generosity', 'collection', 'apostle', 'suffering', 'transformation', 'veil', 'treasure', 'temple'],
    'vhl_time': ['the day of the Lord Jesus', 'now is the time of God\u2019s favour', 'now is the day of salvation', 'at home with the Lord', 'the judgment seat of Christ', 'the third heaven'],
}

SCHOLAR_REGISTRY.append(('harris', 'harris', 'Harris', 'harris'))
COMMENTATOR_SCOPE['harris'] = ['2_corinthians']


# ── Galatians ────────────────────────────────────────────────────────
BOOK_META['galatians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Gal 1:1), writing with \u2018all the brothers and sisters with me\u2019 (1:2). Pauline authorship is virtually undisputed; the letter\u2019s intensely personal tone, autobiographical narrative (chs.\u20091\u20132), and theological argumentation bear Paul\u2019s unmistakable stamp.\n\n<strong>When written:</strong> c.\u2009AD\u200948\u201355. Dating depends on the identification of the recipients. The \u2018South Galatian\u2019 theory (recipients are churches in Pisidian Antioch, Iconium, Lystra, and Derbe founded on the first missionary journey) permits a date as early as AD\u200948\u201349, making Galatians possibly the earliest Pauline letter. The \u2018North Galatian\u2019 theory (recipients are ethnic Galatians in the northern plateau region) requires a later date, c.\u2009AD\u200953\u201355, during the third missionary journey.\n\n<strong>What prompted it:</strong> After Paul\u2019s departure, rival missionaries arrived among the Galatian churches insisting that Gentile believers must be circumcised and observe the Mosaic law to be fully justified (1:6\u20137; 3:1\u20133; 5:2\u20134; 6:12\u201313). Paul responds with his most passionate and theologically concentrated letter, defending justification by faith apart from works of the law, narrating his apostolic calling and independence, and articulating the freedom of the gospel against legalistic distortion. Galatians has been called the \u2018Magna Carta of Christian liberty.\u2019",
    'vhl_places': ['Galatia', 'Jerusalem', 'Antioch', 'Syria', 'Cilicia', 'Arabia', 'Damascus'],
    'vhl_people': ['Paul', 'Abraham', 'Christ', 'Peter', 'James', 'Barnabas', 'Titus', 'Moses', 'Hagar', 'Sarah', 'Isaac'],
    'vhl_key': ['faith', 'law', 'grace', 'justification', 'freedom', 'Spirit', 'flesh', 'circumcision', 'gospel', 'promise', 'covenant', 'curse', 'righteousness', 'adoption', 'inheritance', 'crucified', 'works', 'fruit', 'love', 'truth'],
    'vhl_time': ['the present evil age', 'the fullness of time', 'when the set time had fully come', 'formerly', 'now that faith has come', 'the Israel of God'],
}

SCHOLAR_REGISTRY.append(('bruce', 'bruce', 'Bruce', 'bruce'))
COMMENTATOR_SCOPE['moo'].append('galatians')
COMMENTATOR_SCOPE['bruce'] = ['galatians']

# ── Ephesians ────────────────────────────────────────────────────────
BOOK_META['ephesians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Eph 1:1; 3:1), writing from prison (3:1; 4:1; 6:20). Pauline authorship has been debated since the nineteenth century: the letter\u2019s elevated style, distinctive vocabulary (90+ words not found elsewhere in Paul), lack of personal greetings (unusual for a Pauline letter), and developed ecclesiology have led many critical scholars to regard it as deutero-Pauline. Conservative scholarship maintains Pauline authorship, explaining the differences by the letter\u2019s encyclical nature and liturgical-hymnic style.\n\n<strong>When written:</strong> c.\u2009AD\u200960\u201362, during Paul\u2019s first Roman imprisonment (Acts 28:16\u201331), alongside Colossians, Philemon, and Philippians. The close verbal parallels with Colossians suggest the two letters were composed in close temporal proximity and likely carried by the same messenger, Tychicus (Eph 6:21\u201322; Col 4:7\u20138).\n\n<strong>What prompted it:</strong> Unlike most Pauline letters, Ephesians does not address a specific crisis. It reads as a theological meditation and pastoral exhortation, possibly as a circular letter to multiple churches in Asia Minor. The letter unfolds God\u2019s eternal purpose (\u2018mystery\u2019) to unite all things in Christ (1:9\u201310), emphasising the cosmic scope of redemption, the unity of Jew and Gentile in one body, and the ethical implications of the believer\u2019s new identity in Christ. It is Paul\u2019s most ecclesiological letter, presenting the church as Christ\u2019s body, bride, and temple.",
    'vhl_places': ['Ephesus', 'Rome', 'Asia Minor'],
    'vhl_people': ['Paul', 'Christ', 'Tychicus', 'Abraham', 'Moses'],
    'vhl_key': ['grace', 'mystery', 'unity', 'body', 'Spirit', 'church', 'love', 'faith', 'heavenly realms', 'fullness', 'power', 'inheritance', 'predestined', 'sealed', 'reconciliation', 'armour', 'peace', 'glory', 'wisdom', 'walk'],
    'vhl_time': ['before the creation of the world', 'the fullness of time', 'the coming ages', 'formerly', 'but now', 'in the last days', 'the evil day'],
}

SCHOLAR_REGISTRY.append(('lincoln', 'lincoln', 'Lincoln', 'lincoln'))
SCHOLAR_REGISTRY.append(('obrien', 'obrien', "O\'Brien", 'obrien'))
COMMENTATOR_SCOPE['lincoln'] = ['ephesians']
COMMENTATOR_SCOPE['obrien'] = ['ephesians']


# ── Philippians ──────────────────────────────────────────────────────
BOOK_META['philippians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Phil 1:1), writing with Timothy. Pauline authorship is virtually undisputed. The letter\u2019s autobiographical details, theological vocabulary, and personal warmth are unmistakably Pauline.\n\n<strong>When written:</strong> c.\u2009AD\u200960\u201362, during Paul\u2019s first Roman imprisonment (Acts 28:16\u201331). Some scholars argue for an Ephesian imprisonment (c.\u2009AD\u200954\u201355) based on the frequency of communication between Paul and Philippi implied in the letter, but the traditional Roman provenance remains the majority view.\n\n<strong>What prompted it:</strong> Paul writes to thank the Philippians for their financial gift, delivered by Epaphroditus (4:18), and to update them on his circumstances and Epaphroditus\u2019s recovery from illness (2:25\u201330). The letter also addresses incipient disunity in the congregation (4:2\u20133), warns against Judaizing opponents (3:2\u20134) and libertine tendencies (3:18\u201319), and encourages steadfast joy in the face of suffering. Philippians is Paul\u2019s most personal and warmly affectionate letter, pervaded by the theme of joy (chara/chairein appears sixteen times).",
    'vhl_places': ['Philippi', 'Rome', 'Macedonia', 'Thessalonica'],
    'vhl_people': ['Paul', 'Timothy', 'Epaphroditus', 'Christ', 'Euodia', 'Syntyche', 'Clement'],
    'vhl_key': ['joy', 'gospel', 'fellowship', 'humility', 'mind', 'Christ', 'suffering', 'righteousness', 'knowledge', 'gain', 'loss', 'citizenship', 'pressing on', 'peace', 'contentment', 'power', 'grace', 'servant', 'glory', 'confidence'],
    'vhl_time': ['the day of Christ Jesus', 'the day of Christ', 'at the name of Jesus', 'from the first day until now', 'to live is Christ, to die is gain'],
}

SCHOLAR_REGISTRY.append(('silva', 'silva', 'Silva', 'silva'))
COMMENTATOR_SCOPE['fee'].append('philippians')
COMMENTATOR_SCOPE['silva'] = ['philippians']

# ── Colossians ───────────────────────────────────────────────────────
BOOK_META['colossians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Col 1:1), writing with Timothy. Pauline authorship is debated in critical scholarship: the letter\u2019s elevated style, distinctive vocabulary, and developed Christology have led some to classify it as deutero-Pauline. Conservative scholarship defends Pauline authorship, noting the close connections with Philemon (an undisputed letter) and the theological continuity with the acknowledged Pauline corpus.\n\n<strong>When written:</strong> c.\u2009AD\u200960\u201362, during Paul\u2019s first Roman imprisonment, alongside Ephesians and Philemon. Tychicus and Onesimus carried all three letters (Col 4:7\u20139; Eph 6:21\u201322; Phlm 10\u201312).\n\n<strong>What prompted it:</strong> Epaphras, who founded the Colossian church (1:7), reported to Paul about a dangerous teaching infiltrating the community (2:8, 16\u201323). This \u2018Colossian heresy\u2019\u2014likely a syncretistic blend of Jewish mysticism, ascetic practice, and proto-Gnostic speculation\u2014promoted angel worship, dietary regulations, festival observance, and visionary experiences as means of accessing divine fullness. Paul responds with the letter\u2019s central affirmation: in Christ \u2018all the fullness of the Deity lives in bodily form\u2019 (2:9), making all supplementary religious systems unnecessary.",
    'vhl_places': ['Colossae', 'Laodicea', 'Hierapolis', 'Rome'],
    'vhl_people': ['Paul', 'Timothy', 'Epaphras', 'Tychicus', 'Onesimus', 'Christ', 'Aristarchus', 'Mark', 'Luke', 'Nympha', 'Archippus'],
    'vhl_key': ['fullness', 'mystery', 'wisdom', 'knowledge', 'supremacy', 'firstborn', 'reconciliation', 'image', 'head', 'body', 'circumcision', 'philosophy', 'shadow', 'reality', 'hidden', 'above', 'put off', 'put on', 'peace', 'thankfulness'],
    'vhl_time': ['before all things', 'the hope stored up for you in heaven', 'when Christ appears', 'formerly', 'but now', 'the coming wrath'],
}

COMMENTATOR_SCOPE['moo'].append('colossians')
COMMENTATOR_SCOPE['obrien'].append('colossians')

# ── 1 Thessalonians ─────────────────────────────────────────────────────
BOOK_META['1_thessalonians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (1 Thess 1:1), writing jointly with Silas (Silvanus) and Timothy. Pauline authorship is virtually undisputed; even critical scholars who reject other Pauline letters accept 1 Thessalonians as authentic. It is likely Paul's earliest surviving letter and possibly the oldest document in the New Testament.\n\n<strong>When written:</strong> c.\u2009AD\u200950–51, from Corinth during Paul's second missionary journey. This dating is anchored by the Gallio inscription, which places Paul in Corinth c.\u2009AD\u200951–52 (Acts 18:12).\n\n<strong>What prompted it:</strong> Paul had been forced to leave Thessalonica abruptly after only a few weeks of ministry due to violent opposition (Acts 17:1–10). Anxious about the young church's survival under persecution, he sent Timothy back to check on them (3:1–5). Timothy returned with encouraging news: the Thessalonians' faith had remained strong (3:6–8). Paul writes to express thanksgiving, defend his ministry against slander (2:1–12), encourage perseverance, and address two pressing concerns: sexual ethics (4:1–8) and the fate of believers who die before Christ's return (4:13–18).",
    'vhl_places': ['Thessalonica', 'Corinth', 'Macedonia', 'Achaia', 'Athens', 'Philippi'],
    'vhl_people': ['Paul', 'Silas', 'Timothy', 'Christ', 'Jason'],
    'vhl_key': ['faith', 'love', 'hope', 'gospel', 'word', 'power', 'Holy Spirit', 'joy', 'persecution', 'affliction', 'example', 'imitation', 'wrath', 'waiting', 'coming', 'return', 'dead in Christ', 'rapture', 'clouds', 'meeting', 'sanctification', 'holiness', 'sexual immorality', 'brotherly love', 'work', 'idleness', 'sleep', 'awake', 'sober', 'armor', 'salvation', 'peace', 'blameless'],
    'vhl_time': ['the coming of our Lord Jesus', 'the day of the Lord', 'at his coming', 'when he comes', 'the dead in Christ will rise first', 'we who are still alive', 'to meet the Lord in the air', 'forever with the Lord', 'like a thief in the night', 'sudden destruction'],
}

SCHOLAR_REGISTRY.append(('wanamaker', 'wanamaker', 'Wanamaker', 'wanamaker'))
COMMENTATOR_SCOPE['fee'].append('1_thessalonians')
COMMENTATOR_SCOPE['wanamaker'] = ['1_thessalonians', '2_thessalonians']

# ── 2 Thessalonians ─────────────────────────────────────────────────────
BOOK_META['2_thessalonians'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (2 Thess 1:1; 3:17), writing with Silas and Timothy. Pauline authorship is debated in modern scholarship: critics note differences in eschatology (the 'restrainer' and 'man of lawlessness' material has no parallel in undisputed letters), a cooler tone, and possible literary dependence on 1 Thessalonians. Defenders argue the differences reflect a pastoral response to new circumstances and that the letter's vocabulary and theology remain authentically Pauline.\n\n<strong>When written:</strong> c.\u2009AD\u200951–52, from Corinth shortly after 1 Thessalonians, if authentic. Some scholars who accept Pauline authorship place it before 1 Thessalonians.\n\n<strong>What prompted it:</strong> The Thessalonians had become confused about the timing of Christ's return. Some believed 'the day of the Lord has already come' (2:2)—possibly based on a letter falsely attributed to Paul. This eschatological confusion had practical consequences: some believers had stopped working, expecting the imminent end (3:6–12). Paul writes to correct the error with apocalyptic teaching about the 'man of lawlessness' who must appear first (2:3–4), to encourage perseverance under persecution (1:4–10), and to rebuke idleness: 'If anyone is not willing to work, let him not eat' (3:10).",
    'vhl_places': ['Thessalonica', 'Corinth'],
    'vhl_people': ['Paul', 'Silas', 'Timothy', 'Christ', 'the man of lawlessness', 'the restrainer'],
    'vhl_key': ['faith', 'love', 'perseverance', 'persecution', 'affliction', 'relief', 'judgment', 'glory', 'punishment', 'destruction', 'rebellion', 'apostasy', 'man of lawlessness', 'son of destruction', 'restrainer', 'mystery of lawlessness', 'deception', 'delusion', 'lie', 'truth', 'sanctification', 'election', 'calling', 'tradition', 'work', 'idleness', 'busybody', 'discipline', 'warning', 'peace', 'grace'],
    'vhl_time': ['the day of the Lord', 'when the Lord Jesus is revealed from heaven', 'at his coming', 'the rebellion comes first', 'until he is taken out of the way', 'the Lord will slay with the breath of his mouth', 'the splendor of his coming', 'from the beginning'],
}

COMMENTATOR_SCOPE['fee'].append('2_thessalonians')

# ── Philemon ─────────────────────────────────────────────────────────
BOOK_META['philemon'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Phlm 1), writing with Timothy. Pauline authorship is undisputed; even the most sceptical critics accept it. The letter is the shortest of Paul\u2019s surviving correspondence and the most personal, addressed to an individual rather than a congregation.\n\n<strong>When written:</strong> c.\u2009AD\u200960\u201362, during Paul\u2019s first Roman imprisonment, simultaneously with Colossians. Onesimus, the letter\u2019s subject, accompanied Tychicus on the return journey to Colossae (Col 4:9).\n\n<strong>What prompted it:</strong> Onesimus, a slave belonging to Philemon (a wealthy Christian in Colossae and leader of the house church there), had fled\u2014possibly after stealing from his master (v.\u200918)\u2014and made his way to Rome, where he encountered Paul and became a believer (v.\u200910). Paul writes to persuade Philemon to receive Onesimus back \u2018no longer as a slave, but better than a slave, as a dear brother\u2019 (v.\u200916). The letter is a masterpiece of diplomatic rhetoric, deploying friendship, obligation, appeal, and gentle pressure to effect reconciliation. It is the most concrete test case of how the gospel transforms social relationships from within.",
    'vhl_places': ['Colossae', 'Rome'],
    'vhl_people': ['Paul', 'Philemon', 'Onesimus', 'Timothy', 'Apphia', 'Archippus', 'Epaphras', 'Mark', 'Aristarchus', 'Demas', 'Luke'],
    'vhl_key': ['love', 'brother', 'slave', 'freedom', 'useful', 'useless', 'heart', 'refresh', 'partner', 'charge', 'confidence', 'appeal', 'voluntary', 'debt', 'welcome', 'grace', 'fellowship', 'prayer', 'good', 'faith'],
    'vhl_time': ['formerly', 'now', 'forever', 'for a little while'],
}

COMMENTATOR_SCOPE['obrien'].append('philemon')
COMMENTATOR_SCOPE['bruce'].append('philemon')

# ── Wave 5 Session I: Pastoral Epistles ──────────────────────

SCHOLAR_REGISTRY.append(('mounce', 'mounce', 'Mounce', 'mounce'))
SCHOLAR_REGISTRY.append(('towner', 'towner', 'Towner', 'towner'))

# ── 1 Timothy ────────────────────────────────────────────────

BOOK_META['1_timothy'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (1 Tim 1:1), though Pauline authorship of the Pastoral Epistles is one of the most debated questions in NT scholarship. Critics point to vocabulary differences (306 hapax legomena in the Pastorals, over a third not found elsewhere in Paul), a developed ecclesiology (bishops, elders, deacons), and theology that seems to presuppose a post-Pauline setting. Defenders argue for a secretary hypothesis (Luke as amanuensis), a later stage in Paul\u2019s ministry after Acts 28, and the different genre (personal paraenesis vs. community letters) as explaining the differences.\n\n<strong>When written:</strong> c.\u2009AD\u200962\u201365, if authentic, during a period of ministry between a first and second Roman imprisonment not recorded in Acts. If pseudonymous, c.\u2009AD\u200980\u2013100.\n\n<strong>What prompted it:</strong> Paul had left Timothy in Ephesus to combat false teaching that combined Jewish speculation (genealogies, myths, the law) with proto-Gnostic asceticism (forbidding marriage, certain foods). The letter provides Timothy with apostolic authority to organize the church, appoint qualified leaders, refute heresy, and model godly conduct. It is simultaneously a charge to a young pastor, a church order manual, and a polemic against deviant teaching.",
    'vhl_places': ['Ephesus', 'Macedonia', 'Rome', 'Crete'],
    'vhl_people': ['Paul', 'Timothy', 'Hymenaeus', 'Alexander', 'Christ Jesus'],
    'vhl_key': ['faith', 'godliness', 'sound doctrine', 'teaching', 'good conscience', 'love', 'charge', 'command', 'trustworthy saying', 'overseer', 'deacon', 'elder', 'prayer', 'modesty', 'submission', 'myths', 'genealogies', 'law', 'blasphemy', 'shipwreck', 'training', 'piety', 'contentment', 'money', 'fight the good fight', 'eternal life', 'guard the deposit'],
    'vhl_time': ['later times', 'the last days', 'the appearing of our Lord Jesus Christ', 'in due time', 'the present age'],
}

COMMENTATOR_SCOPE['mounce'] = ['1_timothy', '2_timothy', 'titus']
COMMENTATOR_SCOPE['towner'] = ['1_timothy', '2_timothy', 'titus']

# ── 2 Timothy ────────────────────────────────────────────────

BOOK_META['2_timothy'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (2 Tim 1:1). The most personal of the three Pastoral Epistles, 2 Timothy reads as a final testament from an aging apostle facing death. Even some scholars who doubt Pauline authorship of 1 Timothy and Titus concede that 2 Timothy contains genuine Pauline fragments (especially 4:6\u201322), which may have been incorporated into a later pseudonymous composition.\n\n<strong>When written:</strong> c.\u2009AD\u200966\u201367, during Paul\u2019s second Roman imprisonment, shortly before his execution under Nero. If pseudonymous, c.\u2009AD\u200980\u2013100, drawing on genuine Pauline material.\n\n<strong>What prompted it:</strong> Paul writes from prison knowing his death is imminent (\u2018I am already being poured out like a drink offering,\u2019 4:6). He summons Timothy to Rome before winter (4:21), warns him about intensifying opposition and false teaching, and charges him to guard the gospel, preach the word, and endure suffering. The letter is pervaded by themes of perseverance, succession, and the transmission of apostolic tradition to the next generation.",
    'vhl_places': ['Rome', 'Ephesus', 'Troas', 'Corinth', 'Miletus', 'Antioch', 'Iconium', 'Lystra'],
    'vhl_people': ['Paul', 'Timothy', 'Lois', 'Eunice', 'Phygelus', 'Hermogenes', 'Onesiphorus', 'Hymenaeus', 'Philetus', 'Demas', 'Luke', 'Mark', 'Tychicus', 'Alexander the coppersmith', 'Priscilla', 'Aquila'],
    'vhl_key': ['faith', 'love', 'power', 'spirit', 'suffering', 'endurance', 'shame', 'guard', 'deposit', 'entrust', 'soldier', 'athlete', 'farmer', 'worker', 'approved', 'rightly handling', 'word of truth', 'flee', 'pursue', 'righteousness', 'godliness', 'Scripture', 'inspired', 'preach the word', 'sound doctrine', 'crown', 'appearing', 'departure', 'fight', 'finish', 'keep'],
    'vhl_time': ['the last days', 'that day', 'his appearing and his kingdom', 'the time of my departure has come', 'from childhood'],
}

# ── Titus ─────────────────────────────────────────────────────

BOOK_META['titus'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Paul the apostle (Tit 1:1). The letter shares vocabulary, style, and concerns with 1 Timothy and is grouped with it under the \u2018Pastoral Epistles\u2019 label (a designation first used by D. N. Berdot in 1703 and popularized by Paul Anton in 1726). Authorship questions mirror those of 1 Timothy.\n\n<strong>When written:</strong> c.\u2009AD\u200963\u201365, between Paul\u2019s two Roman imprisonments, roughly contemporary with 1 Timothy. Paul had recently visited Crete and left Titus there to complete organizational work (1:5).\n\n<strong>What prompted it:</strong> Paul had left Titus on Crete to appoint elders in every town and combat false teachers\u2014particularly those of \u2018the circumcision group\u2019 (1:10) who were teaching \u2018Jewish myths\u2019 (1:14) and disrupting households for financial gain. The letter provides Titus with criteria for elder appointment, instructions for household conduct organized by social group (older men, older women, young women, young men, slaves), and a theological framework grounding ethical behavior in the grace of God that has appeared in Christ (2:11\u201314; 3:3\u20137).",
    'vhl_places': ['Crete', 'Nicopolis', 'Dalmatia'],
    'vhl_people': ['Paul', 'Titus', 'Artemas', 'Tychicus', 'Zenas', 'Apollos', 'Christ Jesus'],
    'vhl_key': ['faith', 'truth', 'godliness', 'grace', 'good works', 'sound doctrine', 'elder', 'overseer', 'blameless', 'self-controlled', 'sober-minded', 'silence', 'rebuke', 'myths', 'pure', 'defiled', 'Savior', 'appeared', 'washing', 'renewal', 'Holy Spirit', 'justified', 'heirs', 'eternal life', 'trustworthy saying', 'devoted', 'divisive person'],
    'vhl_time': ['the hope of eternal life', 'before the beginning of time', 'at his appointed season', 'the grace of God has appeared', 'the blessed hope', 'when the kindness and love of God our Savior appeared'],
}

# ── Wave 6 Session J: Hebrews ────────────────────────────────

SCHOLAR_REGISTRY.append(('lane', 'lane', 'Lane', 'lane'))
SCHOLAR_REGISTRY.append(('cockerill', 'cockerill', 'Cockerill', 'cockerill'))

BOOK_META['hebrews'] = {
    'is_nt': True,
    'auth': "<strong>Author:</strong> Unknown. Hebrews is the only major NT epistle whose author is not named in the text. Early Eastern tradition attributed it to Paul (reflected in its canonical placement after the Pauline letters), but Western churches were sceptical from the start. Origen famously concluded: \u2018Who wrote the epistle, in truth God knows.\u2019 Modern candidates include Apollos (Luther\u2019s suggestion, supported by the Alexandrian style and OT expertise), Barnabas (Tertullian\u2019s attribution), Priscilla (Harnack\u2019s proposal), and others. The author\u2019s Greek is the most polished in the NT, the rhetorical structure is sophisticated, and the theology of Christ\u2019s high priesthood is unparalleled elsewhere.\n\n<strong>When written:</strong> Before AD 70, since the author speaks of the temple sacrificial system as still functioning (8:4\u20135; 9:6\u20139; 10:1\u20133) and makes no mention of the temple\u2019s destruction\u2014a decisive argument that would have powerfully supported the letter\u2019s thesis that the old covenant is obsolete. Most scholars date it c.\u2009AD\u200964\u201368.\n\n<strong>What prompted it:</strong> A community of Jewish Christians, possibly in Rome (13:24, \u2018those from Italy send greetings\u2019), was in danger of abandoning faith in Christ and reverting to Judaism under pressure of persecution and social ostracism. The author writes to demonstrate the absolute superiority of Christ over every aspect of the old covenant\u2014angels, Moses, Joshua, the Aaronic priesthood, the tabernacle, the sacrifices\u2014and to warn that there is no returning to a system that Christ has rendered obsolete. The letter is at once a theological treatise on Christ\u2019s priesthood, a homiletical exhortation to perseverance, and an urgent pastoral plea not to \u2018drift away\u2019 (2:1) or \u2018shrink back\u2019 (10:39).",
    'vhl_places': ['Jerusalem', 'Mount Sinai', 'Mount Zion', 'Egypt', 'Canaan', 'Rome'],
    'vhl_people': ['Jesus', 'Moses', 'Abraham', 'Melchizedek', 'Aaron', 'Abel', 'Enoch', 'Noah', 'Sarah', 'Isaac', 'Jacob', 'Esau', 'Joseph', 'Rahab', 'David', 'Samuel', 'Gideon', 'Barak', 'Samson', 'Jephthah', 'Timothy'],
    'vhl_key': ['faith', 'better', 'covenant', 'priest', 'high priest', 'Melchizedek', 'sacrifice', 'blood', 'heavenly', 'mediator', 'promise', 'oath', 'rest', 'shadow', 'copy', 'pattern', 'perfection', 'eternal', 'once for all', 'sit down', 'right hand', 'throne', 'grace', 'endurance', 'discipline', 'cloud of witnesses', 'anchor', 'veil', 'tabernacle', 'new covenant', 'obsolete', 'confidence', 'access', 'draw near'],
    'vhl_time': ['in these last days', 'today', 'once for all', 'at the end of the ages', 'a Sabbath rest remains', 'the day approaching', 'yet a little while', 'he who is coming will come', 'yesterday and today and forever'],
}

COMMENTATOR_SCOPE['lane'] = ['hebrews']
COMMENTATOR_SCOPE['cockerill'] = ['hebrews']
