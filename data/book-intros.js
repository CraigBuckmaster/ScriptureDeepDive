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
