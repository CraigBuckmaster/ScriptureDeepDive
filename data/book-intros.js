// book-intros.js — How to Read each book of the Bible
// Single source of truth. Edit here; intro pages render from this automatically.
// To add a book intro: append one object to BOOK_INTROS.

window.BOOK_INTROS = [

// ═══════════════════════════════════════════════════════════════════════════
//  PENTATEUCH
// ═══════════════════════════════════════════════════════════════════════════

{
  book: 'genesis',
  title: 'How to Read Genesis',
  subtitle: 'The book of beginnings — creation, fall, covenant, and the family through whom God will bless all nations.',
  authorship:{author:"Moses (Moshe ben Amram), c.1526–1406 BC. Born a Hebrew slave in Egypt, adopted into Pharaoh\'s household, educated in \"all the wisdom of the Egyptians\" (Acts 7:22). Fled to Midian after killing an Egyptian overseer; spent 40 years as a shepherd under Jethro. Called at the burning bush (Exod 3) to lead the Exodus at age 80. Spent 40 years leading Israel through the wilderness; died on Mount Nebo in sight of Canaan, age 120.",date:"c.1445–1405 BC during the wilderness period, following the Exodus from Egypt. Moses drew on earlier patriarchal records, oral tradition, and direct divine revelation. The Pentateuch as a whole shows strong literary unity and was treated as Mosaic by both the OT (Josh 8:31; 1 Kgs 2:3; Ezra 6:18) and the NT (Mark 12:26; Luke 24:27; John 5:46).",prompt:"To record God\'s creation of the world and his covenant relationship with the patriarchs — Abraham, Isaac, Jacob, and Joseph — culminating in Israel\'s formation as a people chosen to carry the promise of blessing to all nations (Gen 12:1–3). Genesis answers the foundational questions: Who is God? Who are we? What went wrong? What is God doing about it?"},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Genesis is theological narrative. It tells a true story, but its purpose is not to satisfy modern curiosity about science or chronology — it is to reveal who God is, what went wrong with the world, and how God began to set it right. Every story is selected and shaped to serve this theological purpose.\n\nThe Hebrew title is Bereshit ("In the beginning"). The English title comes from the Greek Septuagint: Genesis means "origin" or "generation." Both titles capture the book\'s concern with origins — of the cosmos, of humanity, of sin, of nations, and of the covenant family.'
    },
    {
      heading: 'Literary Structure',
      content: 'Genesis is organized around ten "toledot" formulas — the phrase "these are the generations of" (Hebrew toledot). Each formula introduces a new section that traces what became of a particular figure and their descendants. This structure divides the book into two halves: primeval history (universal scope) and patriarchal narrative (one family\'s story).',
      outline: [
        { label: 'Primeval History', chapters: [1, 11], note: 'Creation, Fall, Flood, Babel — the universal human problem' },
        { label: 'Abraham Cycle', chapters: [12, 25], note: 'Call, covenant, testing — God\'s answer begins' },
        { label: 'Jacob Cycle', chapters: [25, 36], note: 'Deception, wrestling, transformation' },
        { label: 'Joseph Novella', chapters: [37, 50], note: 'Providence, reconciliation, "God meant it for good"' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      content: 'These themes recur across every section of Genesis. Track them as you read — they form the theological backbone of the entire Bible.',
      themes: ['Blessing and Curse', 'Covenant', 'Seed / Offspring', 'Land and Exile', 'Election and Promise', 'Sin and Grace', 'God\'s Sovereignty']
    },
    {
      heading: 'Historical Context',
      content: 'Genesis was composed for an audience that already knew the gods of Egypt and Mesopotamia. Its creation account is a deliberate counter-narrative: the sun and moon are not gods but lamps; the sea monsters are creatures, not rivals to the Creator. Reading Genesis against its ancient Near Eastern background reveals how radical its theology was.\n\nThe patriarchal narratives (Abraham through Joseph) fit the cultural world of the second millennium BCE — customs of adoption, inheritance, treaty-making, and pastoral nomadism all correspond to what archaeology has recovered from this period.'
    },
    {
      heading: 'Suggested Reading Order',
      content: 'If you are new to Genesis, start with these key passages to get the arc of the story:',
      plan: [
        { ref: 'Gen 1', label: 'Creation — the world as God intended it' },
        { ref: 'Gen 3', label: 'The Fall — what went wrong' },
        { ref: 'Gen 12', label: 'The Call of Abraham — God\'s answer begins' },
        { ref: 'Gen 15', label: 'The Covenant — smoking firepot ceremony' },
        { ref: 'Gen 22', label: 'The Binding of Isaac — the great test' },
        { ref: 'Gen 37', label: 'Joseph\'s story begins — sold into Egypt' },
        { ref: 'Gen 50', label: '"God meant it for good" — the key sentence' }
      ]
    }
  ]
},

{
  book: 'exodus',
  title: 'How to Read Exodus',
  authorship:{author:"Moses, according to Jewish and Christian tradition.",date:"c.1445-1405 BC during the wilderness period.",prompt:"To record God\'s redemption of Israel from Egypt and the establishment of the covenant at Sinai."},
  subtitle: 'Liberation, law, and the presence of God — the foundational story of Israel\'s identity.',
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Exodus is liberation theology in its oldest form. It tells how God heard the cry of slaves, broke the power of empire, and entered into covenant with a people at a mountain. But it is also a book about God\'s presence — the second half is consumed with how the holy God can dwell among an unholy people.\n\nThe book\'s two halves mirror each other: chapters 1-18 tell the story of leaving Egypt; chapters 19-40 tell the story of God coming to dwell with Israel. The exodus is not just freedom from something — it is freedom for relationship with God.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Oppression & Call', chapters: [1, 6], note: 'Slavery, Moses\' birth, the burning bush' },
        { label: 'Plagues & Passover', chapters: [7, 13], note: 'God vs. Pharaoh — the contest of powers' },
        { label: 'Sea & Wilderness', chapters: [14, 18], note: 'Deliverance, manna, water — learning to trust' },
        { label: 'Sinai Covenant', chapters: [19, 24], note: 'Law as gift, not burden — the covenant is a marriage' },
        { label: 'Tabernacle Instructions', chapters: [25, 31], note: 'God designs a dwelling place' },
        { label: 'Golden Calf & Renewal', chapters: [32, 34], note: 'Failure, intercession, and grace' },
        { label: 'Tabernacle Built', chapters: [35, 40], note: 'God\'s glory fills the tent' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Liberation', 'The Name of God (YHWH)', 'Covenant and Law', 'God\'s Presence', 'Worship', 'Intercession', 'The Hardened Heart']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Exod 1', label: 'Oppression — why deliverance is needed' },
        { ref: 'Exod 3', label: 'The burning bush — "I AM WHO I AM"' },
        { ref: 'Exod 12', label: 'Passover — blood on the doorposts' },
        { ref: 'Exod 14', label: 'The sea crossing — the defining moment' },
        { ref: 'Exod 20', label: 'The Ten Commandments' },
        { ref: 'Exod 32', label: 'The golden calf — the great crisis' },
        { ref: 'Exod 40', label: 'The glory fills the tabernacle' }
      ]
    }
  ]
},

{
  book: 'leviticus',
  title: 'How to Read Leviticus',
  subtitle: 'The most misunderstood book in the Bible — and the key to understanding sacrifice, holiness, and atonement.',
  authorship:{author:"Moses, c.1446–1406 BC. Leviticus records the laws given to Israel at Sinai immediately after the tabernacle was erected (Exod 40). The Hebrew title Wayyiqraʾ (“And He called”) captures the book’s essence: God summons Israel into a priestly relationship. The book covers approximately one month at Sinai between Exodus 40:17 and Numbers 1:1.",date:"c.1446 BC (early Exodus date). The priestly legislation is internally coherent and reflects detailed tabernacle-era conditions.",prompt:"Holiness — qādōš (holy) appears 87 times. The governing call: “Be holy, for I the Lord your God am holy” (19:2). Leviticus teaches Israel to approach a holy God through the sacrificial system, maintain covenant purity, and embody holiness in every dimension of life."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Leviticus is the answer to the question Exodus raises: how can a holy God dwell among an unholy people? The answer is a system of sacrifice, purity, and priesthood that creates the conditions for God\'s presence to remain. It is not arbitrary ritual — it is a coherent moral theology expressed through symbol and practice.\n\nModern readers often skip Leviticus because it seems alien. But the NT writers did not. Hebrews, Romans, and the Gospels all assume you understand Levitical sacrifice. Without Leviticus, the cross makes no sense.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Sacrificial System', chapters: [1, 7], note: 'Five offerings — how to approach God' },
        { label: 'Priesthood', chapters: [8, 10], note: 'Consecration and the danger of God\'s presence' },
        { label: 'Purity Laws', chapters: [11, 15], note: 'Clean/unclean — not hygiene but holiness' },
        { label: 'Day of Atonement', chapters: [16, 16], note: 'The centre of the book and of Israel\'s worship' },
        { label: 'Holiness Code', chapters: [17, 27], note: '"Be holy, for I the LORD your God am holy"' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Holiness', 'Atonement', 'Blood and Life', 'Clean and Unclean', 'The Presence of God', 'Priesthood as Mediation', 'Social Ethics']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Lev 1', label: 'The burnt offering — total dedication' },
        { ref: 'Lev 10', label: 'Nadab and Abihu — holiness is dangerous' },
        { ref: 'Lev 16', label: 'Day of Atonement — the centre of it all' },
        { ref: 'Lev 19', label: '"Love your neighbour as yourself" — yes, this is Leviticus' },
        { ref: 'Lev 26', label: 'Blessings and curses — covenant consequences' }
      ]
    }
  ]
},

{
  book: 'numbers',
  title: 'How to Read Numbers',
  subtitle: 'The wilderness generation — faith tested, leadership challenged, and a people learning (slowly) to trust God.',
  authorship:{author:"Moses, with editorial arrangement c.1446–1406 BC. Numbers covers the wilderness years from Sinai to the plains of Moab — approximately 38 years of Israel’s journey. The Hebrew title Bemidbar (&ldquo;In the wilderness&rdquo;) captures the book’s essence: God sustaining his people through a generation of failure, discipline, and eventual renewal.",date:"c.1446–1406 BC. The book covers from the second year after the Exodus (Num 1:1) to the fortieth year (Num 33:38), ending with Israel camped on the plains of Moab, poised to enter Canaan.",prompt:"The faithfulness of God amid Israel’s persistent unfaithfulness. Every act of rebellion (murmuring, the spy crisis, Korah’s revolt, Baal Peor) is met with judgment and then mercy. Numbers is the book of the wilderness generation’s failure and the new generation’s hope — the old must die before the new can enter."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Numbers is the story of a forty-year journey that should have taken eleven days. It begins with a census at Sinai and ends with a census on the plains of Moab — the old generation counted out, the new generation counted in. In between: rebellion, judgment, grace, and the painful lesson that God\'s promises are real but God\'s people are not ready for them.\n\nThe Hebrew title is Bemidbar ("In the Wilderness"), which captures its setting and its theological point better than the English title.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'At Sinai', chapters: [1, 10], note: 'Census, camp arrangement, final preparations' },
        { label: 'Sinai to Kadesh', chapters: [10, 14], note: 'Complaints, rebellion, the spy disaster' },
        { label: 'Wilderness Years', chapters: [15, 21], note: 'The old generation dies; Korah, water, serpents' },
        { label: 'Plains of Moab', chapters: [22, 36], note: 'Balaam, new census, inheritance laws, final instructions' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Faithfulness vs. Rebellion', 'God\'s Patience', 'Holy War', 'Priesthood and Intercession', 'The Wilderness as Testing', 'Generational Transition']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Num 6', label: 'The Aaronic blessing — the most famous passage' },
        { ref: 'Num 13', label: 'The spies — the turning point of the book' },
        { ref: 'Num 14', label: 'The great refusal and Moses\' intercession' },
        { ref: 'Num 20', label: 'Water from the rock — Moses\' fatal moment' },
        { ref: 'Num 22', label: 'Balaam and the donkey — comic and deadly' }
      ]
    }
  ]
},

{
  book: 'deuteronomy',
  title: 'How to Read Deuteronomy',
  authorship:{author:"Moses, with a brief editorial postscript (Deut 34). The Hebrew title Devarim (&ldquo;Words&rdquo;) reflects its nature as three great farewell addresses.",date:"c.1406 BC. The final year of Israel’s wilderness sojourn on the plains of Moab. Moses is 120 years old; his death closes the book (34:7).",prompt:"Covenant love and loyalty. The Shema (6:4–;5) is its centrepiece: love for God with whole heart, soul, and strength. Moses calls Israel to a choice: covenant faithfulness means life and blessing; apostasy means death and exile (30:15–20). The book’s structure mirrors Hittite suzerainty treaties (Kline, 1963): preamble, historical prologue, stipulations, document clause, witnesses, blessings and curses — evidence for early composition."},
  subtitle: 'Moses\' final sermons — the most quoted OT book in the NT, and the theological heart of the Old Testament.',
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Deuteronomy is a series of speeches by Moses on the plains of Moab, delivered to the new generation about to enter the promised land. It restates the law (the name means "second law") but reframes it as a love relationship: God loved you first; now love God back with all your heart.\n\nStructurally, Deuteronomy follows the pattern of ancient Near Eastern suzerainty treaties — a form Israel\'s audience would have recognized. The covenant is not a legal code but a relationship contract between a great king and his people.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'First Address', chapters: [1, 4], note: 'Historical review — remembering what God did' },
        { label: 'Second Address', chapters: [5, 28], note: 'The Shema, the laws, blessings and curses' },
        { label: 'Third Address', chapters: [29, 30], note: 'Covenant renewal — "choose life"' },
        { label: 'Leadership Transition', chapters: [31, 34], note: 'Song of Moses, blessing, death on Nebo' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Love as Covenant Loyalty', 'Remember / Do Not Forget', 'The Shema', 'One God, One Sanctuary', 'Blessings and Curses', 'Torah as Gift']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Deut 5', label: 'Ten Commandments restated with commentary' },
        { ref: 'Deut 6', label: 'The Shema — "Hear, O Israel"' },
        { ref: 'Deut 8', label: '"Man does not live by bread alone"' },
        { ref: 'Deut 28', label: 'Blessings and curses — the stakes' },
        { ref: 'Deut 30', label: '"Choose life" — the climactic appeal' },
        { ref: 'Deut 34', label: 'The death of Moses' }
      ]
    }
  ]
},

// ═══════════════════════════════════════════════════════════════════════════
//  HISTORICAL BOOKS
// ═══════════════════════════════════════════════════════════════════════════

{
  book: 'joshua',
  title: 'How to Read Joshua',
  subtitle: 'The fulfilment of promise — Israel enters the land, and the question becomes: will they remain faithful?',
  authorship:{author:"Anonymous. Jewish tradition attributes the book to Joshua himself, with the final verses (24:29-33) added by Eleazar or Phinehas. The text draws on earlier written sources (&ldquo;the Book of Jashar,&rdquo; 10:13) and may have reached its final form during the early monarchy.",date:"The events span c.1406–1380 BC, from the Jordan crossing to Joshua&rsquo;s death at 110. The book&rsquo;s composition is debated: conservative scholars date the core to the late 15th century BC; critical scholars place final editing in the Deuteronomistic History (7th–6th c. BC).",prompt:"Faithful God, fulfilled promises. The land promised to Abraham (Gen 12:7) is finally given to his descendants. The key command: &ldquo;Be strong and courageous&rdquo; (1:6-9). The key theological statement: &ldquo;Not one of all the LORD&rsquo;s good promises to Israel failed; every one was fulfilled&rdquo; (21:45)."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Joshua is the story of promise kept. God told Abraham his descendants would possess this land; Joshua narrates its fulfilment. But it is not triumphalist — it is haunted by the question of faithfulness. The book ends with Joshua\'s challenge: "Choose this day whom you will serve."\n\nThe book is part of the Deuteronomistic History (Joshua through 2 Kings), which reads Israel\'s story through the lens of Deuteronomy\'s covenant theology: obey and be blessed, disobey and face judgment.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Entering the Land', chapters: [1, 5], note: 'Commissioning, Rahab, crossing the Jordan' },
        { label: 'Conquest', chapters: [6, 12], note: 'Jericho, Ai, southern and northern campaigns' },
        { label: 'Land Allotment', chapters: [13, 21], note: 'Tribal territories, cities of refuge, Levitical cities' },
        { label: 'Farewell', chapters: [22, 24], note: 'Altar controversy, Joshua\'s final challenge' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Promise Fulfilment', 'Faith and Obedience', 'Holy War', 'The Land as Gift', 'Covenant Loyalty', 'Leadership Transition']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Josh 1', label: '"Be strong and courageous" — the commission' },
        { ref: 'Josh 2', label: 'Rahab — faith from an unexpected source' },
        { ref: 'Josh 6', label: 'Jericho falls' },
        { ref: 'Josh 7', label: 'Achan — sin in the camp' },
        { ref: 'Josh 24', label: '"Choose this day whom you will serve"' }
      ]
    }
  ]
},

{
  book: 'judges',
  title: 'How to Read Judges',
  subtitle: 'A spiral of failure — "In those days there was no king in Israel; everyone did what was right in their own eyes."',
  authorship:{author:"Anonymous. Jewish tradition suggests Samuel, but the text is anonymous. The recurring phrase &ldquo;in those days there was no king in Israel&rdquo; (17:6; 18:1; 19:1; 21:25) implies composition during or after the early monarchy.",date:"The events span c.1380–1050 BC, from Othniel to the eve of the monarchy. The repeated cycle — sin, oppression, cry, deliverance, rest — covers roughly 350 years.",prompt:"The downward spiral of covenant unfaithfulness. Each judge cycle descends further into moral chaos, culminating in civil war (ch.19–21). The refrain: &ldquo;Everyone did what was right in his own eyes&rdquo; (21:25)."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Judges is a deliberately structured narrative of decline. Each cycle of sin-oppression-cry-deliverance gets worse than the last. The judges themselves deteriorate: from Othniel (exemplary) through Gideon (ambiguous) to Samson (catastrophic). The book\'s final five chapters descend into civil war and horror.\n\nThis is not accidental. The author is making a theological argument: without faithful leadership and covenant loyalty, Israel becomes indistinguishable from the nations it displaced. The refrain "no king in Israel" points forward to the monarchy — and beyond it, to the need for a better king.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Prologue', chapters: [1, 3], note: 'Incomplete conquest, the cycle introduced' },
        { label: 'Major Judges', chapters: [3, 12], note: 'Othniel, Ehud, Deborah, Gideon, Jephthah' },
        { label: 'Samson Cycle', chapters: [13, 16], note: 'The last and worst judge — strength without wisdom' },
        { label: 'Appendix of Horror', chapters: [17, 21], note: 'Idolatry, the Levite\'s concubine, civil war' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['The Cycle of Sin', 'Progressive Deterioration', 'Flawed Leaders', 'Covenant Infidelity', '"No King in Israel"', 'God\'s Persistent Grace']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Judg 2', label: 'The cycle explained — the pattern for the whole book' },
        { ref: 'Judg 4', label: 'Deborah and Barak — unexpected heroism' },
        { ref: 'Judg 6', label: 'Gideon\'s call — the turning point in quality' },
        { ref: 'Judg 13', label: 'Samson\'s birth — promise meets failure' },
        { ref: 'Judg 19', label: 'The Levite\'s concubine — rock bottom' },
        { ref: 'Judg 21', label: '"No king in Israel" — the book\'s verdict' }
      ]
    }
  ]
},

{
  book: 'ruth',
  title: 'How to Read Ruth',
  subtitle: 'A jewel of a story — hesed (covenant faithfulness) embodied in an unlikely heroine, set against the darkness of Judges.',
  authorship:{author:"Unknown; Jewish tradition attributes authorship to Samuel.",date:"c.1000 BC, possibly early monarchy period.",prompt:"To record God\'s providential care for a Moabite widow and her mother-in-law, and to trace the lineage of King David."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Ruth is a short story of extraordinary artistry. Set "in the days when the judges ruled," it provides a counter-narrative to the chaos of Judges. While Israel spirals into violence and idolatry, a Moabite woman and a Bethlehemite man quietly embody the covenant faithfulness (hesed) that Israel has abandoned.\n\nEvery detail is deliberate: the names (Naomi = "pleasant," Mara = "bitter," Mahlon = "sickness"), the legal customs, the harvest setting. And the genealogy at the end — Ruth is the great-grandmother of King David. This outsider enters the covenant family and becomes an ancestor of the Messiah.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Emptiness', chapters: [1, 1], note: 'Famine, death, Naomi returns — "Call me Mara"' },
        { label: 'Gleaning', chapters: [2, 2], note: 'Ruth meets Boaz — hesed begins' },
        { label: 'The Threshing Floor', chapters: [3, 3], note: 'Ruth\'s bold proposal — "Spread your wings over me"' },
        { label: 'Redemption', chapters: [4, 4], note: 'Boaz redeems, the genealogy, emptiness reversed' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Hesed (Covenant Faithfulness)', 'The Kinsman-Redeemer', 'Emptiness to Fullness', 'The Foreigner Included', 'Providence in Ordinary Life']
    },
    {
      heading: 'Suggested Reading Order',
      content: 'Ruth is only four chapters. Read it in one sitting — it is designed to be experienced as a whole.',
      plan: [
        { ref: 'Ruth 1', label: 'Read the whole book straight through' }
      ]
    }
  ]
},

{
  book: '1_samuel',
  title: 'How to Read 1 Samuel',
  subtitle: 'The birth of the monarchy — Samuel, Saul, and David in a story about what kind of king Israel needs.',
  authorship:{author:"Anonymous. Jewish tradition attributes the book to Samuel, Nathan, and Gad (1 Chr 29:29). Originally one book with 2 Samuel in the Hebrew canon; divided by the LXX translators. The narrative draws on court records, prophetic archives, and the &ldquo;Book of Jashar&rdquo; (2 Sam 1:18).",date:"Events span c.1100–1010 BC, from Samuel&rsquo;s birth to Saul&rsquo;s death. Composition likely during or after the early monarchy (the phrase &ldquo;to this day&rdquo; implies historical distance).",prompt:"The transition from judges to monarchy. Samuel is the last judge and first kingmaker. The book asks: what kind of king does Israel need? Saul answers with failure; David is anointed as God&rsquo;s answer. The key theological tension: human kingship vs divine sovereignty."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: '1 Samuel narrates the transition from the judges to the monarchy. Three figures dominate: Samuel (the last judge and first prophet), Saul (the king Israel wanted — tall, impressive, fatally insecure), and David (the king God chose — unlikely, flawed, but a man after God\'s heart). The book is about the nature of legitimate authority: does it come from human impressiveness or from divine calling?'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Samuel', chapters: [1, 7], note: 'Birth, call, Eli\'s fall, the ark captured and returned' },
        { label: 'Saul\'s Rise', chapters: [8, 15], note: 'Israel demands a king, Saul\'s victories and failures' },
        { label: 'David\'s Rise / Saul\'s Decline', chapters: [16, 31], note: 'Anointing, Goliath, fugitive years, Saul\'s death' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Kingship and Authority', 'Obedience vs. Sacrifice', 'The Spirit of the LORD', 'Reversal of Expectations', 'Faithful Waiting']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: '1 Sam 1', label: 'Hannah\'s prayer — the theme of reversal' },
        { ref: '1 Sam 8', label: '"Give us a king" — the decisive demand' },
        { ref: '1 Sam 15', label: '"To obey is better than sacrifice"' },
        { ref: '1 Sam 16', label: 'David anointed — God looks at the heart' },
        { ref: '1 Sam 17', label: 'David and Goliath' },
        { ref: '1 Sam 24', label: 'David spares Saul — faithful waiting' }
      ]
    }
  ]
},

{
  book: '2_samuel',
  title: 'How to Read 2 Samuel',
  authorship:{author:"Anonymous. Originally one book with 1 Samuel. Draws on court records, the &ldquo;Succession Narrative&rdquo; (chs 9–20), and prophetic archives. David&rsquo;s lament over Saul and Jonathan (ch 1) and the appendices (chs 21–24) may derive from independent sources.",date:"Events span c.1010–970 BC, from David&rsquo;s accession to his final years. The Succession Narrative is widely regarded as one of the earliest examples of ancient historiography.",prompt:"The Davidic covenant and its consequences. God promises David an eternal dynasty (ch 7), but David&rsquo;s sin with Bathsheba (chs 11–12) unleashes a chain of violence — Amnon, Tamar, Absalom — that nearly destroys the very house God promised to build. Grace and judgment intertwine."},
  subtitle: 'David\'s reign — triumph, sin, consequence, and the covenant that outlasts the king\'s failures.',
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: '2 Samuel is David\'s story: his rise to power over all Israel, the great covenant promise (chapter 7), and the catastrophic sin with Bathsheba that fractures everything. The second half is a study in consequences — Amnon, Absalom, civil war — but also in grace, because God\'s covenant with David survives David\'s failures.\n\nThe Davidic covenant (2 Sam 7) is one of the most consequential passages in the Bible. Every subsequent king is measured against David. The NT opens with "Jesus Christ, the son of David."'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'David\'s Rise', chapters: [1, 5], note: 'Saul\'s death, Hebron, Jerusalem captured' },
        { label: 'David\'s Zenith', chapters: [6, 10], note: 'Ark to Jerusalem, the covenant, military victories' },
        { label: 'The Great Sin', chapters: [11, 12], note: 'Bathsheba, Uriah, Nathan\'s parable' },
        { label: 'Consequences', chapters: [13, 20], note: 'Amnon, Absalom\'s rebellion, restoration' },
        { label: 'Appendices', chapters: [21, 24], note: 'Retrospective: famine, psalm, mighty men, census' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['The Davidic Covenant', 'Power and Its Abuse', 'Sin and Consequence', 'Grace Despite Failure', 'The House of David']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: '2 Sam 5', label: 'David becomes king of all Israel' },
        { ref: '2 Sam 7', label: 'The Davidic covenant — the pivotal chapter' },
        { ref: '2 Sam 11', label: 'Bathsheba — the great sin' },
        { ref: '2 Sam 12', label: 'Nathan\'s parable — "You are the man!"' },
        { ref: '2 Sam 15', label: 'Absalom\'s rebellion — consequences unfold' },
        { ref: '2 Sam 22', label: 'David\'s psalm — looking back on a life' }
      ]
    }
  ]
},

{
  book: '1_kings',
  title: 'How to Read 1 Kings',
  authorship:{author:"Anonymous. Jewish tradition assigns Kings to Jeremiah, but the work draws on multiple sources cited by name: the Book of the Acts of Solomon, the Book of the Chronicles of the Kings of Israel, and the Book of the Chronicles of the Kings of Judah. The final editor shaped these into a unified theological history.",date:"Events span c.970–853 BC, from Solomon&rsquo;s accession to Ahaziah of Israel. Final compilation during or after the Babylonian exile (post-586 BC), as part of the Deuteronomistic History.",prompt:"Covenant faithfulness determines national destiny. Solomon&rsquo;s wisdom and temple represent the zenith of Israel&rsquo;s covenant life; his apostasy and the kingdom&rsquo;s division demonstrate that even the wisest king cannot sustain obedience apart from a circumcised heart. The Elijah cycle (chs 17–19) reintroduces the raw power of prophetic witness against royal idolatry."},
  subtitle: 'Solomon\'s glory, the kingdom divided, and Elijah\'s stand — the beginning of the end.',
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: '1 Kings tells two stories: Solomon\'s reign (the zenith of Israel\'s power and the seeds of its destruction) and the divided kingdom\'s early history, climaxing in the Elijah cycle. The book is part of the Deuteronomistic History, and every king is evaluated by a single criterion: did he worship YHWH alone, or did he follow other gods?\n\nSolomon embodies the tragedy: given wisdom by God, he builds the temple (the book\'s theological centre), but his foreign wives turn his heart. The kingdom splits. The northern kingdom never recovers its faithfulness; Ahab and Jezebel make Baal worship official policy. Into this darkness steps Elijah.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Solomon\'s Rise', chapters: [1, 4], note: 'Succession, wisdom, administration' },
        { label: 'The Temple', chapters: [5, 8], note: 'Construction, dedication, Solomon\'s prayer' },
        { label: 'Zenith to Fracture', chapters: [9, 12], note: 'Glory, apostasy, Rehoboam\'s folly, division' },
        { label: 'Kings of Israel & Judah', chapters: [13, 16], note: 'Prophets, Jeroboam\'s sin, the downward spiral' },
        { label: 'The Elijah Cycle', chapters: [17, 19], note: 'Drought, Carmel, the still small voice' },
        { label: 'Ahab\'s End', chapters: [20, 22], note: 'Wars with Aram, Naboth\'s vineyard, death at Ramoth Gilead' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['True vs. False Worship', 'Wisdom and Folly', 'The Temple as God\'s Dwelling', 'Prophetic Authority', 'The Divided Kingdom', 'Covenant Loyalty']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: '1 Kgs 3', label: 'Solomon asks for wisdom' },
        { ref: '1 Kgs 8', label: 'Temple dedication — the theological high point' },
        { ref: '1 Kgs 11', label: 'Solomon\'s fall — wives and other gods' },
        { ref: '1 Kgs 12', label: 'The kingdom splits — the point of no return' },
        { ref: '1 Kgs 18', label: 'Carmel — "The LORD, he is God!"' },
        { ref: '1 Kgs 19', label: 'The still small voice — Elijah\'s lowest and highest moment' },
        { ref: '1 Kgs 21', label: 'Naboth\'s vineyard — justice and power' }
      ]
    }
  ]
},

{
  book: 'proverbs',
  title: 'How to Read Proverbs',
  subtitle: 'Wisdom for living — how to navigate a complex world with skill, integrity, and the fear of the LORD.',
  authorship:{author:"Primarily Solomon son of David (chs.1-29), with additional contributions from Agur son of Jakeh (ch.30) and King Lemuel\'s mother (ch.31).",date:"Core Solomonic material c.970-930 BC; final compilation under Hezekiah c.715-686 BC.",prompt:"To transmit the accumulated wisdom of Israel\'s sages to the next generation -- teaching the fear of the LORD as the foundation of all genuine wisdom."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Proverbs is wisdom literature — not prophecy, not narrative, not law. Its goal is hokhmah (wisdom): the skill of living well in God\'s world. Proverbs are not promises or absolute rules; they are observations about how life generally works. "Train up a child in the way he should go" is a principle, not a guarantee.\n\nThe book is an anthology — multiple collections by different authors, compiled over centuries. But it has a clear theological framework: "The fear of the LORD is the beginning of wisdom" (1:7). This is not religious anxiety but reverent trust — the conviction that reality is God\'s creation and living well means living in alignment with how God made things to work.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Wisdom\'s Invitation', chapters: [1, 9], note: 'Extended poems: Lady Wisdom vs. Lady Folly' },
        { label: 'Solomon\'s Proverbs I', chapters: [10, 22], note: 'Short two-line sayings — the core collection' },
        { label: 'Sayings of the Wise', chapters: [22, 24], note: 'Instruction-form wisdom' },
        { label: 'Solomon\'s Proverbs II', chapters: [25, 29], note: 'Collected by Hezekiah\'s scribes' },
        { label: 'Agur & Lemuel', chapters: [30, 31], note: 'Numerical sayings, the excellent wife' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['The Fear of the LORD', 'Wisdom vs. Folly', 'Speech and Silence', 'Wealth and Poverty', 'Discipline', 'The Heart', 'Lady Wisdom']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Prov 1', label: 'The purpose statement and first warning' },
        { ref: 'Prov 3', label: '"Trust in the LORD with all your heart"' },
        { ref: 'Prov 8', label: 'Wisdom personified — "I was there when he set the heavens in place"' },
        { ref: 'Prov 15', label: 'A sample of the short sayings at their best' },
        { ref: 'Prov 31', label: 'The woman of valour — often misread' }
      ]
    }
  ]
},

// ═══════════════════════════════════════════════════════════════════════════
//  NEW TESTAMENT
// ═══════════════════════════════════════════════════════════════════════════

{
  book: 'matthew',
  title: 'How to Read Matthew',
  authorship:{author:"Matthew (Levi) ben Alphaeus, a tax collector called by Jesus at his customs post in Capernaum (Matt 9:9; Mark 2:14). One of the twelve apostles and an eyewitness to the ministry of Jesus. He would have been literate and numerate by profession — uniquely equipped to compose a carefully structured written account. Unanimous early tradition attributes the Gospel to him: Papias (c.AD 125) records that \"Matthew compiled the oracles in the Hebrew language, and everyone interpreted them as best he could.\" The Gospel as we have it is in polished literary Greek, suggesting either a Greek composition drawing on Aramaic sources, or a Greek original.",date:"c.AD 80–90, traditionally associated with Antioch of Syria, the first great Gentile church and a centre of Jewish-Christian interaction. The Gospel presupposes the destruction of Jerusalem (AD 70) in its apocalyptic passages (Matt 22:7; 24:15-22), suggesting composition after that date. It draws on Mark\'s Gospel (c.AD 65-70) and on a sayings source shared with Luke (conventionally called Q). Matthew shapes his sources with a more formal, structured literary hand than any of the other evangelists.",prompt:"To present Jesus of Nazareth as the fulfilment of Israel\'s entire scriptural heritage — the promised Messiah, the new Moses, the true Israel, and the Son of God. Matthew writes primarily for a Jewish-Christian community navigating its relationship to the synagogue after AD 70. His ten fulfilment-formula citations (\"all this took place to fulfil what was spoken through the prophet\") are the theological spine of the work: Israel\'s Scripture is not superseded but completed in Jesus. The Great Commission (28:18-20) shows the universal horizon of a Gospel that begins with Abraham and ends with all nations."},
  subtitle: 'Jesus as the new Moses, the son of David, the fulfilment of Israel\'s story — a Gospel written for a Jewish audience.',
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Matthew is a Jewish Gospel. It opens with a genealogy linking Jesus to Abraham and David, organizes Jesus\' teaching into five great discourses (echoing the five books of Moses), and repeatedly declares that events happen "to fulfil what was spoken by the prophet." Matthew\'s Jesus is the climax of Israel\'s story — prophet, priest, and king.\n\nBut Matthew is also the most ecclesiastical Gospel: it alone uses the word "church" (ekklesia) and gives extended teaching on community life (chapter 18). It was written for a community working out what it means to follow Jesus after the resurrection.'
    },
    {
      heading: 'Literary Structure',
      content: 'Matthew alternates between narrative blocks and five major discourse sections, each ending with "When Jesus had finished saying these things."',
      outline: [
        { label: 'Birth & Preparation', chapters: [1, 4], note: 'Genealogy, nativity, baptism, temptation' },
        { label: 'Discourse 1: Sermon on the Mount', chapters: [5, 7], note: 'The new Torah from the new Moses' },
        { label: 'Miracles & Mission', chapters: [8, 10], note: 'Authority in deed, Discourse 2: mission charge' },
        { label: 'Parables of the Kingdom', chapters: [11, 13], note: 'Discourse 3: what the kingdom is like' },
        { label: 'Community & Conflict', chapters: [14, 18], note: 'Peter\'s confession, Discourse 4: church life' },
        { label: 'Jerusalem & Judgment', chapters: [19, 25], note: 'Entry, temple, Discourse 5: eschatology' },
        { label: 'Passion & Resurrection', chapters: [26, 28], note: 'Cross, tomb, Great Commission' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Fulfilment of Scripture', 'Kingdom of Heaven', 'Righteousness', 'Discipleship', 'The New Moses', 'Son of David', 'Church and Community']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Matt 1', label: 'The genealogy — why it matters' },
        { ref: 'Matt 5', label: 'Sermon on the Mount — the heart of Jesus\' teaching' },
        { ref: 'Matt 13', label: 'Kingdom parables — what the kingdom is (and isn\'t)' },
        { ref: 'Matt 16', label: '"Who do you say I am?" — the turning point' },
        { ref: 'Matt 26', label: 'Gethsemane and the trial' },
        { ref: 'Matt 28', label: 'The Great Commission' }
      ]
    }
  ]
},

{
  book: 'mark',
  title: 'How to Read Mark',
  subtitle: 'The urgent Gospel — Jesus as the suffering servant, moving relentlessly toward the cross.',
  authorship:{author:"John Mark, son of Mary of Jerusalem (Acts 12:12), cousin of Barnabas (Col 4:10), and close associate of both Paul and Peter. Early and unanimous tradition identifies him as “the interpreter of Peter”: Papias of Hierapolis (c. AD 125, preserved in Eusebius, HE 3.39.15) records that Mark “wrote down accurately, though not in order, as much as he remembered of the things said or done by the Lord” — drawing entirely on Peter’s teaching. Irenaeus (Against Heresies 3.1.1), Clement of Alexandria (Hypotyposeis, in Eusebius HE 6.14.6), and the Anti-Marcionite Prologue all confirm the Petrine connection. Mark himself is mentioned in Acts 12:12, 25; 13:13; 15:37–39; Col 4:10; Phlm 24; 2 Tim 4:11; and 1 Pet 5:13 (“my son Mark”). He was present at some events he records (the young man fleeing naked, 14:51–52, is widely identified as a Markan self-cameo), and his vividness throughout reflects the eyewitness testimony he received directly from Peter in Rome.",date:"c. AD 55–65, almost certainly in Rome, most likely before the destruction of Jerusalem in AD 70 — which Mark 13 predicts but nowhere records as fulfilled. Clement of Alexandria states the Gospel was written “while Peter was still preaching publicly in Rome.” If so, the most probable window is the late 50s to mid-60s, during Paul’s Roman imprisonment (Acts 28) and Peter’s residence in the capital. Mark is the earliest of the four Gospels (the Markan Priority hypothesis, held by the majority of NT scholars), and both Matthew and Luke appear to have used it as a primary source. The Gospel’s Latin loanwords (legiōn, denarius, praetorium, centurio), its explanation of Jewish customs for non-Jewish readers (7:3–4), and its Latinisms of idiom all point to a Roman Gentile audience.",prompt:"To preserve Peter’s eyewitness testimony in permanent written form for a church facing persecution under Nero (AD 64), and to answer the most urgent question that question raised: who is Jesus, and why did he die? Mark’s opening declaration — “The beginning of the good news about Jesus the Messiah, the Son of God” (1:1) — is simultaneously title, thesis, and answer. The Gospel is structured around the progressive revelation of that identity: demons recognise Jesus before disciples do (1:24); Peter confesses “You are the Messiah” at the midpoint (8:29); a Roman centurion declares “Surely this man was the Son of God” at the cross (15:39). The relentless pace — euthys (“immediately”) appears 41 times — reflects both Peter’s preaching style and the urgency of a community for whom the Passion narrative was not ancient history but recent, costly, and still unfolding."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Mark is the shortest, fastest, and most visceral Gospel. It uses "immediately" (euthys) over forty times. There is no birth narrative, no Sermon on the Mount — Mark plunges straight into Jesus\' ministry and drives toward the cross with relentless energy.\n\nMark\'s central literary device is the "messianic secret": Jesus repeatedly tells people not to reveal who he is. Why? Because his identity cannot be understood apart from the cross. The centurion at the crucifixion — a Gentile, a soldier — is the first human in the Gospel to say, "Truly this man was the Son of God." You only see who Jesus is when you see how he dies.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Galilean Ministry', chapters: [1, 8], note: 'Miracles, controversy, "Who is this?"' },
        { label: 'The Turn: Peter\'s Confession', chapters: [8, 8], note: '"You are the Messiah" — then the shadow falls' },
        { label: 'Journey to Jerusalem', chapters: [8, 10], note: 'Three passion predictions, discipleship teaching' },
        { label: 'Jerusalem Ministry', chapters: [11, 13], note: 'Temple conflict, Olivet discourse' },
        { label: 'Passion Narrative', chapters: [14, 16], note: 'Betrayal, trial, cross, empty tomb' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['The Messianic Secret', 'Suffering Servanthood', 'Discipleship Failure', 'The Way of the Cross', 'Authority and Power', 'Irony']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Mark 1', label: 'The beginning — baptism, calling, authority' },
        { ref: 'Mark 4', label: 'Parables and the storm — who is this?' },
        { ref: 'Mark 8', label: 'Peter\'s confession — the hinge of the Gospel' },
        { ref: 'Mark 10', label: '"The Son of Man came to serve and give his life"' },
        { ref: 'Mark 14', label: 'Gethsemane — the loneliest prayer' },
        { ref: 'Mark 15', label: 'The crucifixion — where everything converges' }
      ]
    }
  ]
},

{
  book: 'luke',
  title: 'How to Read Luke',
  subtitle: 'The Gospel for everyone — the poor, the outcast, women, Gentiles, and anyone the world has written off.',
  authorship:{author:"Luke, a Gentile physician (Col 4:14) and the most accomplished literary stylist in the New Testament. His Greek is the most polished in the NT corpus — modelled on the style of educated Hellenistic historians such as Thucydides and Polybius. Early and unanimous church tradition (Irenaeus c.&thinsp;AD&thinsp;180, Clement of Alexandria, Origen, Eusebius, Jerome) identifies him as the author of both this Gospel and the Acts of the Apostles. He was a close companion of Paul (Phlm 24; 2 Tim 4:11, &ldquo;only Luke is with me&rdquo;), and the &ldquo;we&rdquo; passages in Acts (16:10–17; 20:5–15; 21:1–18; 27:1–28:16) confirm direct eyewitness participation in events he narrates. Luke is the only Gentile author in the canon. He explicitly describes his method in the prologue (1:1–4): careful investigation of all available tradition, consultation of eyewitnesses and ministers of the word, and orderly composition for a patron named Theophilus — a preface that conforms to the best conventions of Hellenistic historiography.",date:"c.&thinsp;AD&thinsp;62–70, most likely during Paul&rsquo;s two-year imprisonment in Caesarea (Acts 24:27, c.&thinsp;AD 57–59) or shortly thereafter, with publication before Acts (which presupposes it, Acts 1:1). A pre-AD&thinsp;70 date is supported by the absence of any reference to the destruction of Jerusalem as a past event; the Gospel&rsquo;s detailed prediction of the siege (21:20–24) reads as prophecy, not retrospective commentary. A minority of scholars favour AD&thinsp;70–85, arguing that the precision of 21:20 reflects post-event knowledge. The two-volume work (Luke–Acts) is approximately 27,000 words — the largest single contribution to the NT by word count.",prompt:"Luke writes for Theophilus (&ldquo;friend of God&rdquo;), probably a Gentile patron of high social standing (&ldquo;most excellent,&rdquo; Acts 1:1, a term used for Roman officials), who has already received some instruction in the faith but needs a reliable, ordered account to confirm its certainty (1:4). More broadly, Luke&rsquo;s two-volume work addresses the expanding Gentile mission: How does the story of a Jewish Messiah become good news for all nations? His Gospel foregrounds the inclusion of the poor, women, Samaritans, and Gentiles; his Acts shows the gospel moving from Jerusalem to Rome. Luke also addresses a pastoral crisis: the delay of the Parousia. His travel narrative (9:51–19:28) reframes discipleship as a sustained journey of formation, not merely expectation of an imminent end. The Gospel&rsquo;s persistent themes — prayer, joy, the Holy Spirit, reversal of fortune, universal salvation — all serve this dual apologetic and pastoral purpose."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Luke is the most literary of the Gospels — written by a careful historian (the prologue says so) who is also a masterful storyteller. Luke emphasises what the other Gospels leave in shadow: Jesus\' concern for the poor, for women, for Samaritans and sinners, for anyone on the margins. It is the Gospel of reversals: the mighty brought low, the humble lifted up.\n\nLuke is also part one of a two-volume work (Luke-Acts). To read Luke fully, you need Acts — the story of Jesus continues in the story of his followers, empowered by the same Spirit.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Birth Narratives', chapters: [1, 2], note: 'Zechariah, Mary, the Magnificat, shepherds' },
        { label: 'Galilean Ministry', chapters: [3, 9], note: 'Baptism, Nazareth sermon, miracles, mission' },
        { label: 'Travel Narrative', chapters: [9, 19], note: 'The long journey to Jerusalem — unique Lukan material' },
        { label: 'Jerusalem Ministry', chapters: [19, 21], note: 'Temple, controversies, eschatology' },
        { label: 'Passion & Resurrection', chapters: [22, 24], note: 'Last supper, cross, Emmaus road, ascension' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['The Holy Spirit', 'Prayer', 'The Poor and Marginalized', 'Women in the Story', 'Table Fellowship', 'Joy', 'Reversal of Status', 'Universal Salvation']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Luke 1', label: 'The Magnificat — Mary\'s revolutionary song' },
        { ref: 'Luke 4', label: 'The Nazareth sermon — Jesus\' mission statement' },
        { ref: 'Luke 10', label: 'The Good Samaritan' },
        { ref: 'Luke 15', label: 'Three parables of the lost — the heart of Luke' },
        { ref: 'Luke 22', label: 'The Last Supper and Gethsemane' },
        { ref: 'Luke 24', label: 'The Emmaus road — recognizing the risen Jesus' }
      ]
    }
  ]
},

{
  book: 'john',
  title: 'How to Read John',
  subtitle: 'The theological Gospel — "that you may believe that Jesus is the Messiah, the Son of God."',
  authorship:{author:"John the son of Zebedee — fisherman, apostle, and &ldquo;the disciple whom Jesus loved&rdquo; (John 13:23; 19:26; 20:2; 21:7, 20). The fourth Gospel never names its author directly, but the evidence converges on John: (1) The &ldquo;beloved disciple&rdquo; is an eyewitness (19:35; 21:24) present at the Last Supper, the cross, and the empty tomb. (2) Early and unanimous tradition: Irenaeus (c.&thinsp;AD&thinsp;180), Clement of Alexandria, Origen, and Eusebius all identify the author as John the apostle writing from Ephesus in old age. (3) The Gospel’s intimate knowledge of Jerusalem topography (Pool of Bethesda, Pool of Siloam, the Pavement/Gabbatha) is confirmed by archaeology. (4) The eyewitness claim of 19:35 and the closing verse of 21:24 point to direct authorial witness. Liberal scholarship has proposed an anonymous Johannine community or the Elder John of Ephesus; the traditional identification with the apostle remains the best-attested position.",date:"c.&thinsp;AD&thinsp;85–95, probably from Ephesus, making it the latest of the four Gospels. The Rylands Papyrus (P52, c.&thinsp;AD&thinsp;125) — the earliest surviving NT manuscript fragment — contains John 18:31-33, 37-38, confirming the Gospel was in circulation in Egypt by the early second century. A pre-AD&thinsp;70 date has been argued from the Temple language in chs 2, 5, and 10, which reads as description of a standing building; the majority of scholars favour a post-70 date for the final composition. The three Johannine letters and Revelation share vocabulary and theological concerns with the Gospel, suggesting a common Ephesian milieu.",prompt:"John states his purpose explicitly — a rarity in the Gospels: &ldquo;These are written that you may believe that Jesus is the Messiah, the Son of God, and that by believing you may have life in his name&rdquo; (20:31). The Gospel was written to produce and sustain faith in the person of Jesus as divine Son. It supplements the Synoptics rather than duplicates them: John omits the Baptism, the Transfiguration, the Olivet Discourse, and the institution of the Lord’s Supper as a formal narrative, while providing material found nowhere else — the wedding at Cana, Nicodemus, the Samaritan woman, the raising of Lazarus, the Farewell Discourse (chs&thinsp;14–17), and the resurrection appearances to Mary Magdalene and Thomas. Its elevated Christology (&ldquo;In the beginning was the Word&rdquo;) addresses late first-century challenges to the full divinity of Christ and lays the foundation for all subsequent trinitarian theology."},
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'John is unlike the other three Gospels. There are no parables, no exorcisms, no Sermon on the Mount. Instead: seven carefully chosen "signs" (miracles), seven "I am" sayings, and long theological discourses. John writes at a higher altitude — his Jesus speaks in cosmic terms about light and darkness, truth and lies, life and death.\n\nThe prologue (1:1-18) sets the key: Jesus is the eternal Logos (Word) who was with God and was God, now become flesh. Everything that follows is commentary on that claim. The book builds to Thomas\'s confession — "My Lord and my God!" — which is where John wants every reader to arrive.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Prologue', chapters: [1, 1], note: '"In the beginning was the Word"' },
        { label: 'Book of Signs', chapters: [2, 12], note: 'Seven signs + discourses; "the world did not know him"' },
        { label: 'Book of Glory', chapters: [13, 17], note: 'Farewell discourse, footwashing, "I am the vine"' },
        { label: 'Passion & Resurrection', chapters: [18, 21], note: 'Arrest, trial, cross, Thomas, breakfast on the beach' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['Logos / Word', 'Light vs. Darkness', 'Life and Death', '"I Am" Sayings', 'Signs and Belief', 'The Farewell Discourse', 'Glory Through Suffering']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'John 1', label: 'The Prologue — the most important 18 verses in the NT' },
        { ref: 'John 3', label: 'Nicodemus — "You must be born again"' },
        { ref: 'John 6', label: 'Bread of Life — the great divide' },
        { ref: 'John 11', label: 'Lazarus — "I am the resurrection and the life"' },
        { ref: 'John 13', label: 'Footwashing — the nature of love' },
        { ref: 'John 17', label: 'The High Priestly Prayer' },
        { ref: 'John 20', label: 'Thomas — "My Lord and my God!"' }
      ]
    }
  ]
},

{
  book: 'acts',
  title: 'How to Read Acts',
  authorship:{author:"Luke the physician (Col 4:14), a Gentile convert and travelling companion of Paul. Acts is the second volume of a two-part work addressed to Theophilus (Luke 1:3; Acts 1:1). The &ldquo;we&rdquo; sections (16:10–17; 20:5–21:18; 27:1–28:16) place Luke as an eyewitness participant in significant portions of the Pauline mission. Irenaeus, Clement of Alexandria, and the Muratorian Canon (c.&thinsp;AD&thinsp;170) unanimously identify Luke as author.",date:"c.&thinsp;AD&thinsp;62–64, most likely during Paul\'s Roman imprisonment (28:30–31). The abrupt ending — Paul awaiting trial — is most naturally explained if Luke wrote before the outcome was known. The silence about Jerusalem&rsquo;s destruction (AD&thinsp;70) and Paul&rsquo;s death (c.&thinsp;AD&thinsp;67) supports an early 60s date.",prompt:"Luke traces the Gospel from Jerusalem to Rome, fulfilling the commission of 1:8 (&ldquo;you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth&rdquo;). Acts defends the legitimacy of the Gentile mission, demonstrates the continuity of the church with Israel, and shows that the gospel&rsquo;s advance is providentially directed through opposition, imprisonment, and persecution. It is the indispensable bridge between the Gospels and the Epistles."},
  subtitle: 'The sequel to Luke\'s Gospel — the Spirit empowers the church to carry Jesus\' mission to the ends of the earth.',
  sections: [
    {
      heading: 'What Kind of Book Is This?',
      content: 'Acts is a continuation of Luke\'s Gospel. Luke told the story of what Jesus "began to do and teach"; Acts tells what he continued to do through his Spirit-empowered followers. It is part history, part theology, part adventure story — shipwrecks, prison breaks, riots, and speeches before kings.\n\nThe geographical structure tells the theological story: Jerusalem (the Jewish centre) → Samaria (the half-outsiders) → the ends of the earth (Rome, the Gentile capital). The Holy Spirit drives every expansion, often over the objections of the human characters.'
    },
    {
      heading: 'Literary Structure',
      outline: [
        { label: 'Jerusalem', chapters: [1, 7], note: 'Pentecost, early church, Stephen\'s martyrdom' },
        { label: 'Judea & Samaria', chapters: [8, 12], note: 'Philip, Paul\'s conversion, Peter and Cornelius' },
        { label: 'Paul\'s First Journey', chapters: [13, 14], note: 'Antioch sends, Asia Minor mission' },
        { label: 'Jerusalem Council', chapters: [15, 15], note: 'The Gentile question resolved' },
        { label: 'Paul\'s Further Journeys', chapters: [16, 20], note: 'Europe, Corinth, Ephesus' },
        { label: 'Paul to Rome', chapters: [21, 28], note: 'Arrest, trials, shipwreck, Rome — the open ending' }
      ]
    },
    {
      heading: 'Key Themes to Watch For',
      themes: ['The Holy Spirit', 'Witness to the Ends of the Earth', 'Jew and Gentile United', 'Prayer', 'Bold Speech (Parrhesia)', 'Suffering for the Gospel', 'The Unstoppable Word']
    },
    {
      heading: 'Suggested Reading Order',
      plan: [
        { ref: 'Acts 2', label: 'Pentecost — the church is born' },
        { ref: 'Acts 9', label: 'Paul\'s conversion on the Damascus road' },
        { ref: 'Acts 10', label: 'Peter and Cornelius — the Gentile breakthrough' },
        { ref: 'Acts 15', label: 'The Jerusalem Council — the critical decision' },
        { ref: 'Acts 17', label: 'Paul in Athens — the gospel meets philosophy' },
        { ref: 'Acts 27', label: 'The shipwreck — Paul\'s faith under pressure' }
      ]
    }
  ]
}

];
