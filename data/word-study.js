// word-study.js — Hebrew and Greek lexicon entries
// Each entry: original-language word with semantic range, theological significance, occurrences.
// To add a word: append one object to WORD_STUDY_DATA.
// Consumed by: word-study-engine.js, word-study-ui.js

window.WORD_STUDY_DATA = [

  // ═══════════════════════════════════════════════════════════════════════
  //  HEBREW
  // ═══════════════════════════════════════════════════════════════════════

  {
    id:"hesed", language:"hebrew", original:"\u05D7\u05E1\u05D3", transliteration:"\u1E25esed", strongs:"H2617",
    glosses:["steadfast love","lovingkindness","mercy","loyalty","covenant faithfulness"],
    range:"Covenant faithfulness that goes beyond legal obligation. Not mere feeling but committed action — the word that holds the Bible together.",
    note:"Used 248 times in the OT. Describes God’s character more than any other single word. Often paired with ‘emet’ (faithfulness) to express covenant reliability.",
    occurrences:[
      {ref:"Gen 24:12",  gloss:"kindness",       ctx:"Abraham’s servant prays for God’s hesed"},
      {ref:"Gen 39:21",  gloss:"kindness",       ctx:"The LORD showed Joseph hesed in prison"},
      {ref:"Exod 15:13", gloss:"unfailing love",  ctx:"Song of the Sea: ‘In your hesed you will lead the people you redeemed’"},
      {ref:"Exod 34:6",  gloss:"love",           ctx:"God’s self-revelation: ‘abounding in hesed and faithfulness’"},
      {ref:"Ruth 1:8",   gloss:"kindness",       ctx:"Naomi: ‘May the LORD show hesed to you’"},
      {ref:"Ruth 3:10",  gloss:"kindness",       ctx:"Boaz: ‘This hesed is greater than the first’"},
      {ref:"2 Sam 7:15", gloss:"love",           ctx:"Davidic covenant: ‘My hesed will not depart from him’"},
      {ref:"1 Kgs 8:23", gloss:"love",           ctx:"Solomon’s prayer: ‘You who keep your covenant of hesed’"}
    ,
      {ref:"2 Kgs 13:23",  gloss:"covenant love", ctx:"The LORD was gracious because of his hesed with Abraham, Isaac and Jacob"}]
  },
  {
    id:"shalom", language:"hebrew", original:"\u05E9\u05C1\u05DC\u05D5\u05DD", transliteration:"sh\u0101l\u00f4m", strongs:"H7965",
    glosses:["peace","wholeness","completeness","wellbeing","welfare"],
    range:"Far more than absence of conflict. Shalom is the state of things being as they should be — creation functioning as God intended. It is the goal of the entire biblical story.",
    note:"From the root sh-l-m (to be complete, whole). Related to the verb shillem (to repay, make restitution) and the name Shlomo (Solomon, ‘his peace’).",
    occurrences:[
      {ref:"Gen 15:15",  gloss:"peace",      ctx:"Abraham: ‘You will go to your ancestors in shalom’"},
      {ref:"Gen 37:14",  gloss:"welfare",    ctx:"Jacob sends Joseph to check on the shalom of his brothers"},
      {ref:"Num 6:26",   gloss:"peace",      ctx:"Aaronic blessing: ‘The LORD give you shalom’"},
      {ref:"Judg 6:24",  gloss:"peace",      ctx:"Gideon builds altar: Yahweh-Shalom"},
      {ref:"1 Kgs 4:24", gloss:"peace",      ctx:"Solomon had shalom on all sides"},
      {ref:"Luke 2:14",  gloss:"peace",      ctx:"Angels: ‘peace on earth’ — shalom fulfilled"}
    ]
  },
  {
    id:"torah", language:"hebrew", original:"\u05EA\u05D5\u05E8\u05D4", transliteration:"t\u00f4r\u00e2", strongs:"H8451",
    glosses:["instruction","teaching","law","guidance","direction"],
    range:"Not ‘law’ in the modern legal sense but ‘instruction’ — a parent teaching a child how to walk. Torah is God’s loving guidance for life in covenant relationship.",
    note:"From the root y-r-h (to throw, to shoot, to teach). The same root gives ‘moreh’ (teacher). Torah is relational before it is legal.",
    occurrences:[
      {ref:"Exod 24:12",  gloss:"law",        ctx:"God gives Moses the torah written on stone"},
      {ref:"Deut 4:8",    gloss:"law",        ctx:"‘What nation has such righteous torah?’"},
      {ref:"Deut 6:6-7",  gloss:"commandments",ctx:"Teach them to your children — torah as household practice"},
      {ref:"Josh 1:8",    gloss:"law",        ctx:"‘Do not let this Book of the Torah depart from your mouth’"},
      {ref:"Prov 1:8",    gloss:"teaching",   ctx:"‘Do not forsake your mother’s torah’"}
    ,
      {ref:"Lev 7:37",  gloss:"law", ctx:"‘This is the torah of the burnt offering, grain offering, sin offering’"}]
  },
  {
    id:"berith", language:"hebrew", original:"\u05D1\u05E8\u05D9\u05EA", transliteration:"b\u0259r\u00eet", strongs:"H1285",
    glosses:["covenant","treaty","agreement","pact"],
    range:"A solemn binding agreement between parties. In the OT, God initiates covenants with humanity — not negotiated contracts but gracious commitments by the greater party.",
    note:"Appears 287 times. The concept structures the entire Bible: Noahic, Abrahamic, Mosaic, Davidic, and New covenants.",
    occurrences:[
      {ref:"Gen 6:18",   gloss:"covenant",  ctx:"God establishes his berith with Noah"},
      {ref:"Gen 15:18",  gloss:"covenant",  ctx:"The LORD made a berith with Abram"},
      {ref:"Gen 17:7",   gloss:"covenant",  ctx:"‘An everlasting berith between me and you’"},
      {ref:"Exod 19:5",  gloss:"covenant",  ctx:"‘If you keep my berith, you will be my treasured possession’"},
      {ref:"Exod 24:7",  gloss:"covenant",  ctx:"Moses reads the Book of the berith"},
      {ref:"2 Sam 7:12-16",gloss:"covenant",ctx:"The Davidic berith — eternal throne"},
      {ref:"1 Kgs 8:23", gloss:"covenant",  ctx:"Solomon: ‘You keep your berith of love’"}
    ,
      {ref:"Lev 26:9",  gloss:"covenant", ctx:"‘I will keep my berith with you’"},
      {ref:"2 Kgs 23:3",  gloss:"covenant", ctx:"Josiah renews the berith before the LORD — the last great covenant renewal"}]
  },
  {
    id:"tselem", language:"hebrew", original:"\u05E6\u05DC\u05DD", transliteration:"\u1E63elem", strongs:"H6754",
    glosses:["image","likeness","form","representation"],
    range:"In ANE context, kings placed their tselem (statue/image) in conquered territories to represent their rule. Humanity as God’s tselem means every person is God’s representative on earth.",
    note:"Used in Gen 1:26-27 for ‘image of God’ (tselem elohim). This is the theological foundation of human dignity, equality, and the prohibition against murder (Gen 9:6).",
    occurrences:[
      {ref:"Gen 1:26",  gloss:"image",    ctx:"‘Let us make mankind in our tselem’"},
      {ref:"Gen 1:27",  gloss:"image",    ctx:"‘In the tselem of God he created them; male and female’"},
      {ref:"Gen 5:3",   gloss:"likeness", ctx:"Adam fathered Seth in his own tselem"},
      {ref:"Gen 9:6",   gloss:"image",    ctx:"‘For in the tselem of God has God made mankind’"}
    ]
  },
  {
    id:"ruach", language:"hebrew", original:"\u05E8\u05D5\u05D7", transliteration:"r\u00fba\u1E25", strongs:"H7307",
    glosses:["spirit","wind","breath","Spirit"],
    range:"Simultaneously wind, breath, and spirit. The ambiguity is theologically productive: God’s ruach is the invisible animating force behind all life — cosmic, personal, and divine.",
    note:"In Gen 1:2 the ruach of God hovers over the waters. In Judg 14:6 ruach rushes on Samson. In 1 Kgs 19:11 God is not in the great wind (ruach). The same word carries all three meanings.",
    occurrences:[
      {ref:"Gen 1:2",    gloss:"Spirit",  ctx:"The ruach of God was hovering over the waters"},
      {ref:"Gen 2:7",    gloss:"breath",  ctx:"God breathed into his nostrils the ruach of life"},
      {ref:"Gen 6:3",    gloss:"Spirit",  ctx:"‘My ruach will not contend with humans forever’"},
      {ref:"Num 11:25",  gloss:"Spirit",  ctx:"The LORD took of the ruach on Moses and put it on the elders"},
      {ref:"Judg 3:10",  gloss:"Spirit",  ctx:"The ruach of the LORD came on Othniel"},
      {ref:"Judg 14:6",  gloss:"Spirit",  ctx:"The ruach of the LORD rushed on Samson"},
      {ref:"1 Sam 16:13",gloss:"Spirit",  ctx:"The ruach of the LORD came on David"},
      {ref:"1 Kgs 19:11",gloss:"wind",    ctx:"A great and powerful ruach tore the mountains apart"}
    ,
      {ref:"Lev 16:16",  gloss:"Spirit", ctx:"Atonement for the tabernacle — where God’s ruach dwells among impurity"},
      {ref:"2 Kgs 2:15",  gloss:"spirit", ctx:"The ruach of Elijah rests on Elisha — prophetic succession"}]
  },
  {
    id:"yasha", language:"hebrew", original:"\u05D9\u05E9\u05C1\u05E2", transliteration:"y\u0101sha\u02BB", strongs:"H3467",
    glosses:["save","deliver","rescue","help","give victory"],
    range:"To rescue from danger, oppression, or death. The root gives us ‘Yeshua’ (Joshua/Jesus) and ‘yeshu’ah’ (salvation). Every rescue in the OT points toward the ultimate deliverance.",
    note:"Joshua (Yehoshua = ‘YHWH saves’) and Jesus (Yeshua) share this root. The angel tells Joseph: ‘He will yasha his people from their sins’ (Matt 1:21).",
    occurrences:[
      {ref:"Exod 14:30", gloss:"saved",     ctx:"The LORD yasha’d Israel from the Egyptians"},
      {ref:"Judg 2:16",  gloss:"saved",     ctx:"The LORD raised up judges who yasha’d them"},
      {ref:"1 Sam 17:47",gloss:"save",      ctx:"David: ‘The battle is the LORD’s and he will yasha’"},
      {ref:"Matt 1:21",  gloss:"save",      ctx:"‘He will save (y\u014dsh\u012ba\u02BB) his people from their sins’"}
    ,
      {ref:"2 Kgs 19:34",  gloss:"save/deliver", ctx:"I will defend this city and save (yasha) it, for my sake and for David’s sake"}]
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  GREEK
  // ═══════════════════════════════════════════════════════════════════════

  {
    id:"logos", language:"greek", original:"\u03BB\u03CC\u03B3\u03BF\u03C2", transliteration:"logos", strongs:"G3056",
    glosses:["word","reason","speech","message","account"],
    range:"From ordinary speech to cosmic creative force. John 1 uses it in a way that resonated with both Jewish (dabar/memra) and Greek (Stoic logos) audiences simultaneously.",
    note:"In John’s prologue, Logos is a title for Christ — the self-expression of God. This is the most philosophically dense opening in the NT.",
    occurrences:[
      {ref:"John 1:1",   gloss:"Word",    ctx:"‘In the beginning was the Logos’"},
      {ref:"John 1:14",  gloss:"Word",    ctx:"‘The Logos became flesh and dwelt among us’"},
      {ref:"Acts 2:41",  gloss:"message", ctx:"‘Those who accepted his logos were baptized’"},
      {ref:"Acts 6:7",   gloss:"word",    ctx:"‘The logos of God spread’"}
    ]
  },
  {
    id:"agape", language:"greek", original:"\u03B1\u0313\u03B3\u03AC\u03C0\u03B7", transliteration:"agap\u0113", strongs:"G26",
    glosses:["love","charity","affection"],
    range:"Self-giving, unconditional love. In the NT, agape is not primarily an emotion but a decision to act for another’s good regardless of cost. It describes God’s love for the world and the love Christians are called to show.",
    note:"Distinguished from phil\u00eda (friendship love) and er\u014ds (romantic love). Agape is chosen, costly, and directed at the undeserving. It defines God’s character (1 John 4:8).",
    occurrences:[
      {ref:"John 3:16",  gloss:"loved",    ctx:"‘God so agape’d the world’"},
      {ref:"John 13:34", gloss:"love",     ctx:"‘A new commandment: agapate one another’"},
      {ref:"John 15:13", gloss:"love",     ctx:"‘Greater agape has no one than this: to lay down one’s life’"},
      {ref:"Acts 2:42",  gloss:"fellowship",ctx:"The early church devoted to agape fellowship"}
    ]
  },
  {
    id:"pistis", language:"greek", original:"\u03C0\u03AF\u03C3\u03C4\u03B9\u03C2", transliteration:"pistis", strongs:"G4102",
    glosses:["faith","trust","faithfulness","belief","conviction"],
    range:"Not intellectual assent but wholehearted trust and loyalty. Pistis is relational: it means entrusting yourself to another person. In the NT, it is the proper human response to God’s action in Christ.",
    note:"Pistis can mean both the human act of trusting and God’s own faithfulness. This double meaning runs through Romans and Galatians.",
    occurrences:[
      {ref:"Matt 8:10",  gloss:"faith",      ctx:"‘I have not found such pistis in Israel’"},
      {ref:"Matt 17:20", gloss:"faith",      ctx:"‘If you have pistis as small as a mustard seed’"},
      {ref:"Mark 11:22", gloss:"faith",      ctx:"‘Have pistis in God’"},
      {ref:"Luke 7:50",  gloss:"faith",      ctx:"‘Your pistis has saved you’"},
      {ref:"Acts 6:5",   gloss:"faith",      ctx:"Stephen, ‘full of pistis and the Holy Spirit’"}
    ]
  },
  {
    id:"basileia", language:"greek", original:"\u03B2\u03B1\u03C3\u03B9\u03BB\u03B5\u03AF\u03B1", transliteration:"basileia", strongs:"G932",
    glosses:["kingdom","reign","rule","sovereignty"],
    range:"Not primarily a place but a reign — God’s active rule breaking into human history. ‘The kingdom of God has come near’ means God is acting now, not that a territory has been established.",
    note:"Central to Jesus’ preaching. Matthew uses ‘kingdom of heaven’ (Jewish reverence avoids saying ‘God’); Mark and Luke use ‘kingdom of God.’ Same concept.",
    occurrences:[
      {ref:"Matt 4:17",  gloss:"kingdom",  ctx:"‘The basileia of heaven has come near’"},
      {ref:"Matt 6:33",  gloss:"kingdom",  ctx:"‘Seek first his basileia and his righteousness’"},
      {ref:"Matt 13:31", gloss:"kingdom",  ctx:"‘The basileia of heaven is like a mustard seed’"},
      {ref:"Mark 1:15",  gloss:"kingdom",  ctx:"‘The basileia of God has come near’"},
      {ref:"Luke 17:21", gloss:"kingdom",  ctx:"‘The basileia of God is in your midst’"},
      {ref:"Acts 1:3",   gloss:"kingdom",  ctx:"Jesus spoke about the basileia of God for forty days"},
      {ref:"Acts 28:31", gloss:"kingdom",  ctx:"Paul proclaimed the basileia of God boldly in Rome"}
    ]
  },
  {
    id:"pneuma", language:"greek", original:"\u03C0\u03BD\u03B5\u03C5\u0342\u03BC\u03B1", transliteration:"pneuma", strongs:"G4151",
    glosses:["spirit","Spirit","wind","breath"],
    range:"The Greek equivalent of Hebrew ruach. Same productive ambiguity: wind, breath, and divine Spirit all in one word. In the NT, pneuma most often refers to the Holy Spirit — the presence and power of God active in believers.",
    note:"Jesus tells Nicodemus: ‘The pneuma blows where it wills’ (John 3:8) — deliberately exploiting the wind/Spirit double meaning. At Pentecost, the Spirit arrives as rushing wind (Acts 2:2).",
    occurrences:[
      {ref:"Matt 3:16",  gloss:"Spirit",  ctx:"The pneuma of God descending like a dove at Jesus’ baptism"},
      {ref:"John 3:8",   gloss:"wind",    ctx:"‘The pneuma blows where it wishes’"},
      {ref:"John 20:22", gloss:"Spirit",  ctx:"Jesus breathed on them: ‘Receive the Holy pneuma’"},
      {ref:"Acts 2:2-4", gloss:"Spirit",  ctx:"Pentecost: rushing pneuma fills them, they speak in tongues"}
    ]
  },
  {
    id:"dikaiosyne", language:"greek", original:"\u03B4\u03B9\u03BA\u03B1\u03B9\u03BF\u03C3\u03CD\u03BD\u03B7", transliteration:"dikaiosyn\u0113", strongs:"G1343",
    glosses:["righteousness","justice","justification","righteous conduct"],
    range:"Right relationship with God and right conduct toward others. Includes both the legal standing of being declared righteous and the lived practice of doing justice. These two senses are never separated in biblical thought.",
    note:"Matthew uses it 7 times — more than any other Gospel. It is the ethic of the kingdom: ‘unless your dikaiosyne surpasses that of the Pharisees’ (Matt 5:20).",
    occurrences:[
      {ref:"Matt 5:6",   gloss:"righteousness", ctx:"‘Blessed are those who hunger and thirst for dikaiosyne’"},
      {ref:"Matt 5:20",  gloss:"righteousness", ctx:"‘Unless your dikaiosyne surpasses the Pharisees’"},
      {ref:"Matt 6:33",  gloss:"righteousness", ctx:"‘Seek first his kingdom and his dikaiosyne’"},
      {ref:"Luke 1:75",  gloss:"righteousness", ctx:"Serving God in holiness and dikaiosyne"},
      {ref:"Acts 10:35", gloss:"right",         ctx:"‘In every nation the one who does dikaiosyne is acceptable’"}
    ]
  }
];
