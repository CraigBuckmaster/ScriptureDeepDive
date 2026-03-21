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
    range:"Covenant faithfulness that goes beyond legal obligation. Not mere feeling but committed action \u2014 the word that holds the Bible together.",
    note:"Used 248 times in the OT. Describes God\u2019s character more than any other single word. Often paired with \u2018emet\u2019 (faithfulness) to express covenant reliability.",
    occurrences:[
      {ref:"Gen 24:12",  gloss:"kindness",       ctx:"Abraham\u2019s servant prays for God\u2019s hesed"},
      {ref:"Gen 39:21",  gloss:"kindness",       ctx:"The LORD showed Joseph hesed in prison"},
      {ref:"Exod 15:13", gloss:"unfailing love",  ctx:"Song of the Sea: \u2018In your hesed you will lead the people you redeemed\u2019"},
      {ref:"Exod 34:6",  gloss:"love",           ctx:"God\u2019s self-revelation: \u2018abounding in hesed and faithfulness\u2019"},
      {ref:"Ruth 1:8",   gloss:"kindness",       ctx:"Naomi: \u2018May the LORD show hesed to you\u2019"},
      {ref:"Ruth 3:10",  gloss:"kindness",       ctx:"Boaz: \u2018This hesed is greater than the first\u2019"},
      {ref:"2 Sam 7:15", gloss:"love",           ctx:"Davidic covenant: \u2018My hesed will not depart from him\u2019"},
      {ref:"1 Kgs 8:23", gloss:"love",           ctx:"Solomon\u2019s prayer: \u2018You who keep your covenant of hesed\u2019"}
    ]
  },
  {
    id:"shalom", language:"hebrew", original:"\u05E9\u05C1\u05DC\u05D5\u05DD", transliteration:"sh\u0101l\u00f4m", strongs:"H7965",
    glosses:["peace","wholeness","completeness","wellbeing","welfare"],
    range:"Far more than absence of conflict. Shalom is the state of things being as they should be \u2014 creation functioning as God intended. It is the goal of the entire biblical story.",
    note:"From the root sh-l-m (to be complete, whole). Related to the verb shillem (to repay, make restitution) and the name Shlomo (Solomon, \u2018his peace\u2019).",
    occurrences:[
      {ref:"Gen 15:15",  gloss:"peace",      ctx:"Abraham: \u2018You will go to your ancestors in shalom\u2019"},
      {ref:"Gen 37:14",  gloss:"welfare",    ctx:"Jacob sends Joseph to check on the shalom of his brothers"},
      {ref:"Num 6:26",   gloss:"peace",      ctx:"Aaronic blessing: \u2018The LORD give you shalom\u2019"},
      {ref:"Judg 6:24",  gloss:"peace",      ctx:"Gideon builds altar: Yahweh-Shalom"},
      {ref:"1 Kgs 4:24", gloss:"peace",      ctx:"Solomon had shalom on all sides"},
      {ref:"Luke 2:14",  gloss:"peace",      ctx:"Angels: \u2018peace on earth\u2019 \u2014 shalom fulfilled"}
    ]
  },
  {
    id:"torah", language:"hebrew", original:"\u05EA\u05D5\u05E8\u05D4", transliteration:"t\u00f4r\u00e2", strongs:"H8451",
    glosses:["instruction","teaching","law","guidance","direction"],
    range:"Not \u2018law\u2019 in the modern legal sense but \u2018instruction\u2019 \u2014 a parent teaching a child how to walk. Torah is God\u2019s loving guidance for life in covenant relationship.",
    note:"From the root y-r-h (to throw, to shoot, to teach). The same root gives \u2018moreh\u2019 (teacher). Torah is relational before it is legal.",
    occurrences:[
      {ref:"Exod 24:12",  gloss:"law",        ctx:"God gives Moses the torah written on stone"},
      {ref:"Deut 4:8",    gloss:"law",        ctx:"\u2018What nation has such righteous torah?\u2019"},
      {ref:"Deut 6:6-7",  gloss:"commandments",ctx:"Teach them to your children \u2014 torah as household practice"},
      {ref:"Josh 1:8",    gloss:"law",        ctx:"\u2018Do not let this Book of the Torah depart from your mouth\u2019"},
      {ref:"Prov 1:8",    gloss:"teaching",   ctx:"\u2018Do not forsake your mother\u2019s torah\u2019"}
    ]
  },
  {
    id:"berith", language:"hebrew", original:"\u05D1\u05E8\u05D9\u05EA", transliteration:"b\u0259r\u00eet", strongs:"H1285",
    glosses:["covenant","treaty","agreement","pact"],
    range:"A solemn binding agreement between parties. In the OT, God initiates covenants with humanity \u2014 not negotiated contracts but gracious commitments by the greater party.",
    note:"Appears 287 times. The concept structures the entire Bible: Noahic, Abrahamic, Mosaic, Davidic, and New covenants.",
    occurrences:[
      {ref:"Gen 6:18",   gloss:"covenant",  ctx:"God establishes his berith with Noah"},
      {ref:"Gen 15:18",  gloss:"covenant",  ctx:"The LORD made a berith with Abram"},
      {ref:"Gen 17:7",   gloss:"covenant",  ctx:"\u2018An everlasting berith between me and you\u2019"},
      {ref:"Exod 19:5",  gloss:"covenant",  ctx:"\u2018If you keep my berith, you will be my treasured possession\u2019"},
      {ref:"Exod 24:7",  gloss:"covenant",  ctx:"Moses reads the Book of the berith"},
      {ref:"2 Sam 7:12-16",gloss:"covenant",ctx:"The Davidic berith \u2014 eternal throne"},
      {ref:"1 Kgs 8:23", gloss:"covenant",  ctx:"Solomon: \u2018You keep your berith of love\u2019"}
    ]
  },
  {
    id:"tselem", language:"hebrew", original:"\u05E6\u05DC\u05DD", transliteration:"\u1E63elem", strongs:"H6754",
    glosses:["image","likeness","form","representation"],
    range:"In ANE context, kings placed their tselem (statue/image) in conquered territories to represent their rule. Humanity as God\u2019s tselem means every person is God\u2019s representative on earth.",
    note:"Used in Gen 1:26-27 for \u2018image of God\u2019 (tselem elohim). This is the theological foundation of human dignity, equality, and the prohibition against murder (Gen 9:6).",
    occurrences:[
      {ref:"Gen 1:26",  gloss:"image",    ctx:"\u2018Let us make mankind in our tselem\u2019"},
      {ref:"Gen 1:27",  gloss:"image",    ctx:"\u2018In the tselem of God he created them; male and female\u2019"},
      {ref:"Gen 5:3",   gloss:"likeness", ctx:"Adam fathered Seth in his own tselem"},
      {ref:"Gen 9:6",   gloss:"image",    ctx:"\u2018For in the tselem of God has God made mankind\u2019"}
    ]
  },
  {
    id:"ruach", language:"hebrew", original:"\u05E8\u05D5\u05D7", transliteration:"r\u00fba\u1E25", strongs:"H7307",
    glosses:["spirit","wind","breath","Spirit"],
    range:"Simultaneously wind, breath, and spirit. The ambiguity is theologically productive: God\u2019s ruach is the invisible animating force behind all life \u2014 cosmic, personal, and divine.",
    note:"In Gen 1:2 the ruach of God hovers over the waters. In Judg 14:6 ruach rushes on Samson. In 1 Kgs 19:11 God is not in the great wind (ruach). The same word carries all three meanings.",
    occurrences:[
      {ref:"Gen 1:2",    gloss:"Spirit",  ctx:"The ruach of God was hovering over the waters"},
      {ref:"Gen 2:7",    gloss:"breath",  ctx:"God breathed into his nostrils the ruach of life"},
      {ref:"Gen 6:3",    gloss:"Spirit",  ctx:"\u2018My ruach will not contend with humans forever\u2019"},
      {ref:"Num 11:25",  gloss:"Spirit",  ctx:"The LORD took of the ruach on Moses and put it on the elders"},
      {ref:"Judg 3:10",  gloss:"Spirit",  ctx:"The ruach of the LORD came on Othniel"},
      {ref:"Judg 14:6",  gloss:"Spirit",  ctx:"The ruach of the LORD rushed on Samson"},
      {ref:"1 Sam 16:13",gloss:"Spirit",  ctx:"The ruach of the LORD came on David"},
      {ref:"1 Kgs 19:11",gloss:"wind",    ctx:"A great and powerful ruach tore the mountains apart"}
    ]
  },
  {
    id:"yasha", language:"hebrew", original:"\u05D9\u05E9\u05C1\u05E2", transliteration:"y\u0101sha\u02BB", strongs:"H3467",
    glosses:["save","deliver","rescue","help","give victory"],
    range:"To rescue from danger, oppression, or death. The root gives us \u2018Yeshua\u2019 (Joshua/Jesus) and \u2018yeshu\u2019ah\u2019 (salvation). Every rescue in the OT points toward the ultimate deliverance.",
    note:"Joshua (Yehoshua = \u2018YHWH saves\u2019) and Jesus (Yeshua) share this root. The angel tells Joseph: \u2018He will yasha his people from their sins\u2019 (Matt 1:21).",
    occurrences:[
      {ref:"Exod 14:30", gloss:"saved",     ctx:"The LORD yasha\u2019d Israel from the Egyptians"},
      {ref:"Judg 2:16",  gloss:"saved",     ctx:"The LORD raised up judges who yasha\u2019d them"},
      {ref:"1 Sam 17:47",gloss:"save",      ctx:"David: \u2018The battle is the LORD\u2019s and he will yasha\u2019"},
      {ref:"Matt 1:21",  gloss:"save",      ctx:"\u2018He will save (y\u014dsh\u012ba\u02BB) his people from their sins\u2019"}
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  GREEK
  // ═══════════════════════════════════════════════════════════════════════

  {
    id:"logos", language:"greek", original:"\u03BB\u03CC\u03B3\u03BF\u03C2", transliteration:"logos", strongs:"G3056",
    glosses:["word","reason","speech","message","account"],
    range:"From ordinary speech to cosmic creative force. John 1 uses it in a way that resonated with both Jewish (dabar/memra) and Greek (Stoic logos) audiences simultaneously.",
    note:"In John\u2019s prologue, Logos is a title for Christ \u2014 the self-expression of God. This is the most philosophically dense opening in the NT.",
    occurrences:[
      {ref:"John 1:1",   gloss:"Word",    ctx:"\u2018In the beginning was the Logos\u2019"},
      {ref:"John 1:14",  gloss:"Word",    ctx:"\u2018The Logos became flesh and dwelt among us\u2019"},
      {ref:"Acts 2:41",  gloss:"message", ctx:"\u2018Those who accepted his logos were baptized\u2019"},
      {ref:"Acts 6:7",   gloss:"word",    ctx:"\u2018The logos of God spread\u2019"}
    ]
  },
  {
    id:"agape", language:"greek", original:"\u03B1\u0313\u03B3\u03AC\u03C0\u03B7", transliteration:"agap\u0113", strongs:"G26",
    glosses:["love","charity","affection"],
    range:"Self-giving, unconditional love. In the NT, agape is not primarily an emotion but a decision to act for another\u2019s good regardless of cost. It describes God\u2019s love for the world and the love Christians are called to show.",
    note:"Distinguished from phil\u00eda (friendship love) and er\u014ds (romantic love). Agape is chosen, costly, and directed at the undeserving. It defines God\u2019s character (1 John 4:8).",
    occurrences:[
      {ref:"John 3:16",  gloss:"loved",    ctx:"\u2018God so agape\u2019d the world\u2019"},
      {ref:"John 13:34", gloss:"love",     ctx:"\u2018A new commandment: agapate one another\u2019"},
      {ref:"John 15:13", gloss:"love",     ctx:"\u2018Greater agape has no one than this: to lay down one\u2019s life\u2019"},
      {ref:"Acts 2:42",  gloss:"fellowship",ctx:"The early church devoted to agape fellowship"}
    ]
  },
  {
    id:"pistis", language:"greek", original:"\u03C0\u03AF\u03C3\u03C4\u03B9\u03C2", transliteration:"pistis", strongs:"G4102",
    glosses:["faith","trust","faithfulness","belief","conviction"],
    range:"Not intellectual assent but wholehearted trust and loyalty. Pistis is relational: it means entrusting yourself to another person. In the NT, it is the proper human response to God\u2019s action in Christ.",
    note:"Pistis can mean both the human act of trusting and God\u2019s own faithfulness. This double meaning runs through Romans and Galatians.",
    occurrences:[
      {ref:"Matt 8:10",  gloss:"faith",      ctx:"\u2018I have not found such pistis in Israel\u2019"},
      {ref:"Matt 17:20", gloss:"faith",      ctx:"\u2018If you have pistis as small as a mustard seed\u2019"},
      {ref:"Mark 11:22", gloss:"faith",      ctx:"\u2018Have pistis in God\u2019"},
      {ref:"Luke 7:50",  gloss:"faith",      ctx:"\u2018Your pistis has saved you\u2019"},
      {ref:"Acts 6:5",   gloss:"faith",      ctx:"Stephen, \u2018full of pistis and the Holy Spirit\u2019"}
    ]
  },
  {
    id:"basileia", language:"greek", original:"\u03B2\u03B1\u03C3\u03B9\u03BB\u03B5\u03AF\u03B1", transliteration:"basileia", strongs:"G932",
    glosses:["kingdom","reign","rule","sovereignty"],
    range:"Not primarily a place but a reign \u2014 God\u2019s active rule breaking into human history. \u2018The kingdom of God has come near\u2019 means God is acting now, not that a territory has been established.",
    note:"Central to Jesus\u2019 preaching. Matthew uses \u2018kingdom of heaven\u2019 (Jewish reverence avoids saying \u2018God\u2019); Mark and Luke use \u2018kingdom of God.\u2019 Same concept.",
    occurrences:[
      {ref:"Matt 4:17",  gloss:"kingdom",  ctx:"\u2018The basileia of heaven has come near\u2019"},
      {ref:"Matt 6:33",  gloss:"kingdom",  ctx:"\u2018Seek first his basileia and his righteousness\u2019"},
      {ref:"Matt 13:31", gloss:"kingdom",  ctx:"\u2018The basileia of heaven is like a mustard seed\u2019"},
      {ref:"Mark 1:15",  gloss:"kingdom",  ctx:"\u2018The basileia of God has come near\u2019"},
      {ref:"Luke 17:21", gloss:"kingdom",  ctx:"\u2018The basileia of God is in your midst\u2019"},
      {ref:"Acts 1:3",   gloss:"kingdom",  ctx:"Jesus spoke about the basileia of God for forty days"},
      {ref:"Acts 28:31", gloss:"kingdom",  ctx:"Paul proclaimed the basileia of God boldly in Rome"}
    ]
  },
  {
    id:"pneuma", language:"greek", original:"\u03C0\u03BD\u03B5\u03C5\u0342\u03BC\u03B1", transliteration:"pneuma", strongs:"G4151",
    glosses:["spirit","Spirit","wind","breath"],
    range:"The Greek equivalent of Hebrew ruach. Same productive ambiguity: wind, breath, and divine Spirit all in one word. In the NT, pneuma most often refers to the Holy Spirit \u2014 the presence and power of God active in believers.",
    note:"Jesus tells Nicodemus: \u2018The pneuma blows where it wills\u2019 (John 3:8) \u2014 deliberately exploiting the wind/Spirit double meaning. At Pentecost, the Spirit arrives as rushing wind (Acts 2:2).",
    occurrences:[
      {ref:"Matt 3:16",  gloss:"Spirit",  ctx:"The pneuma of God descending like a dove at Jesus\u2019 baptism"},
      {ref:"John 3:8",   gloss:"wind",    ctx:"\u2018The pneuma blows where it wishes\u2019"},
      {ref:"John 20:22", gloss:"Spirit",  ctx:"Jesus breathed on them: \u2018Receive the Holy pneuma\u2019"},
      {ref:"Acts 2:2-4", gloss:"Spirit",  ctx:"Pentecost: rushing pneuma fills them, they speak in tongues"}
    ]
  },
  {
    id:"dikaiosyne", language:"greek", original:"\u03B4\u03B9\u03BA\u03B1\u03B9\u03BF\u03C3\u03CD\u03BD\u03B7", transliteration:"dikaiosyn\u0113", strongs:"G1343",
    glosses:["righteousness","justice","justification","righteous conduct"],
    range:"Right relationship with God and right conduct toward others. Includes both the legal standing of being declared righteous and the lived practice of doing justice. These two senses are never separated in biblical thought.",
    note:"Matthew uses it 7 times \u2014 more than any other Gospel. It is the ethic of the kingdom: \u2018unless your dikaiosyne surpasses that of the Pharisees\u2019 (Matt 5:20).",
    occurrences:[
      {ref:"Matt 5:6",   gloss:"righteousness", ctx:"\u2018Blessed are those who hunger and thirst for dikaiosyne\u2019"},
      {ref:"Matt 5:20",  gloss:"righteousness", ctx:"\u2018Unless your dikaiosyne surpasses the Pharisees\u2019"},
      {ref:"Matt 6:33",  gloss:"righteousness", ctx:"\u2018Seek first his kingdom and his dikaiosyne\u2019"},
      {ref:"Luke 1:75",  gloss:"righteousness", ctx:"Serving God in holiness and dikaiosyne"},
      {ref:"Acts 10:35", gloss:"right",         ctx:"\u2018In every nation the one who does dikaiosyne is acceptable\u2019"}
    ]
  }
];
