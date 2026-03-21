// cross-refs.js — Cross-reference thread database
// Curated theological threads tracing ideas across the canon.
// To add a thread: append to CROSS_REF_THREADS.
// To add a pair: append to CROSS_REF_PAIRS.
// Threads are consumed by cross-ref-engine.js; pairs provide bidirectional links.

window.CROSS_REF_THREADS = [

  // ── Sacrifice & Atonement ───────────────────────────────────────────────
  {
    id: "substitutionary-sacrifice",
    theme: "Substitutionary Sacrifice",
    tags: ["sacrifice", "atonement", "typology", "lamb"],
    chain: [
      { ref: "Gen 3:21",     note: "God clothes Adam and Eve — the first animal dies for human covering" },
      { ref: "Gen 22:1-14",  note: "Abraham offers Isaac; God provides the ram — 'On the mountain of the LORD it will be provided'" },
      { ref: "Exod 12:1-13", note: "The Passover lamb — blood on the doorposts shields from judgment" },
      { ref: "Lev 16:15-22", note: "Day of Atonement — the scapegoat bears the sins of the people away" },
      { ref: "Lev 17:11",    note: "'The life of a creature is in the blood; I have given it to you to make atonement'" },
      { ref: "John 1:29",    note: "John the Baptist: 'Behold, the Lamb of God, who takes away the sin of the world'" },
      { ref: "Mark 10:45",   note: "'The Son of Man came to give his life as a ransom for many'" }
    ]
  },

  // ── Covenant Thread ─────────────────────────────────────────────────────
  {
    id: "covenant-thread",
    theme: "The Covenant Thread",
    tags: ["covenant", "promise", "faithfulness"],
    chain: [
      { ref: "Gen 9:8-17",   note: "Noahic covenant — never again; the rainbow sign" },
      { ref: "Gen 12:1-3",   note: "Abrahamic call — bless all families of the earth" },
      { ref: "Gen 15:1-21",  note: "Covenant ceremony — smoking firepot; God binds himself alone" },
      { ref: "Gen 17:1-14",  note: "Covenant sign — circumcision; 'walk before me and be blameless'" },
      { ref: "Exod 19:3-6",  note: "Sinai — 'a kingdom of priests and a holy nation'" },
      { ref: "Exod 24:3-8",  note: "Blood of the covenant — 'We will do everything the LORD has said'" },
      { ref: "Deut 30:11-20",note: "Choose life — the covenant demand and promise" },
      { ref: "2 Sam 7:8-16", note: "Davidic covenant — an eternal throne" },
      { ref: "1 Kgs 8:22-30",note: "Solomon's prayer — covenant remembered at the temple" },
      { ref: "Matt 26:27-28",note: "'This is my blood of the covenant, poured out for many'" },
      { ref: "Luke 22:20",   note: "'This cup is the new covenant in my blood'" }
    ,
      { ref: "2 Kgs 17:15", note: "Israel rejected the covenant — followed worthless idols" },
      { ref: "2 Kgs 23:3",  note: "Josiah renews the covenant — the last great reform" }]
  },

  // ── Creation & New Creation ─────────────────────────────────────────────
  {
    id: "creation-new-creation",
    theme: "Creation and New Creation",
    tags: ["creation", "eschatology", "renewal"],
    chain: [
      { ref: "Gen 1:1-2",    note: "In the beginning — formless void, Spirit hovering over the waters" },
      { ref: "Gen 2:7",      note: "God breathes life into Adam — the first animation" },
      { ref: "Gen 3:17-19",  note: "The ground is cursed — creation groans under sin" },
      { ref: "Gen 8:1-14",   note: "The flood recedes — a new beginning, echoing day 3 of creation" },
      { ref: "John 1:1-5",   note: "'In the beginning was the Word' — John deliberately echoes Genesis 1" },
      { ref: "John 20:22",   note: "Jesus breathes on them — new creation, echoing Genesis 2:7" },
      { ref: "Acts 2:1-4",   note: "Pentecost — the Spirit fills the new community" }
    ]
  },

  // ── Exile and Return ────────────────────────────────────────────────────
  {
    id: "exile-return",
    theme: "Exile and Return",
    tags: ["exile", "restoration", "land", "homecoming"],
    chain: [
      { ref: "Gen 3:23-24",  note: "Expelled from Eden — the first exile" },
      { ref: "Gen 12:1",     note: "Abraham called out of homeland — exile as vocation" },
      { ref: "Gen 46:1-4",   note: "Jacob goes to Egypt — 'I will go down with you and bring you back'" },
      { ref: "Exod 3:7-8",   note: "God hears the cry and comes down to deliver — the great return" },
      { ref: "Deut 28:63-68",note: "Covenant curse — exile promised for unfaithfulness" },
      { ref: "Deut 30:1-5",  note: "Promise of restoration — 'even if you have been banished to the most distant land'" },
      { ref: "1 Kgs 9:6-7",  note: "Temple warning — 'I will reject this temple and cut Israel off'" },
      { ref: "Luke 15:11-24",note: "The prodigal son — exile, repentance, homecoming" }
    ,
      { ref: "2 Kgs 17:6",  note: "Samaria falls — Israel exiled to Assyria (722 BC)" },
      { ref: "2 Kgs 25:11", note: "Jerusalem falls — Judah exiled to Babylon (586 BC)" },
      { ref: "2 Kgs 25:27", note: "Jehoiachin released from prison — the Davidic line survives" }]
  },

  // ── The Name of God ─────────────────────────────────────────────────────
  {
    id: "divine-name",
    theme: "The Name of God",
    tags: ["YHWH", "divine name", "theophany", "revelation"],
    chain: [
      { ref: "Gen 1:1",      note: "Elohim — God as powerful creator" },
      { ref: "Gen 2:4",      note: "YHWH Elohim — the covenant name first appears" },
      { ref: "Gen 17:1",     note: "El Shaddai — God Almighty appears to Abraham" },
      { ref: "Exod 3:13-15", note: "'I AM WHO I AM' — the defining revelation at the burning bush" },
      { ref: "Exod 33:18-23",note: "Moses asks to see God's glory — 'You cannot see my face and live'" },
      { ref: "Exod 34:6-7",  note: "The LORD passes by — 'compassionate, gracious, slow to anger'" },
      { ref: "1 Kgs 8:27",   note: "'The heavens cannot contain you — how much less this temple'" },
      { ref: "John 8:58",    note: "'Before Abraham was, I AM' — Jesus claims the divine name" },
      { ref: "John 14:9",    note: "'Whoever has seen me has seen the Father'" }
    ]
  },

  // ── Shepherd Motif ──────────────────────────────────────────────────────
  {
    id: "shepherd-motif",
    theme: "God as Shepherd, Leaders as Shepherds",
    tags: ["shepherd", "leadership", "care", "David"],
    chain: [
      { ref: "Gen 48:15",    note: "Jacob: 'God who has been my shepherd all my life'" },
      { ref: "Gen 49:24",    note: "Joseph blessed by 'the Shepherd, the Rock of Israel'" },
      { ref: "Num 27:15-17", note: "Moses prays: 'appoint someone so the people will not be like sheep without a shepherd'" },
      { ref: "1 Sam 16:11",  note: "David the shepherd boy — chosen by God from the flock" },
      { ref: "2 Sam 5:2",    note: "'You will shepherd my people Israel'" },
      { ref: "1 Kgs 22:17",  note: "Micaiah's vision: 'Israel scattered like sheep without a shepherd'" },
      { ref: "Matt 9:36",    note: "Jesus 'had compassion, because they were like sheep without a shepherd'" },
      { ref: "John 10:11",   note: "'I am the good shepherd — the good shepherd lays down his life'" }
    ]
  },

  // ── Kingdom of God ──────────────────────────────────────────────────────
  {
    id: "kingdom-of-god",
    theme: "The Kingdom of God",
    tags: ["kingdom", "reign", "sovereignty", "messiah"],
    chain: [
      { ref: "Gen 1:26-28",  note: "Humanity given dominion — the first kingdom mandate" },
      { ref: "Exod 19:5-6",  note: "'A kingdom of priests' — Israel as kingdom prototype" },
      { ref: "Deut 17:14-20",note: "The law of the king — what godly rule looks like" },
      { ref: "1 Sam 8:6-9",  note: "'They have rejected me as their king' — the cost of a human king" },
      { ref: "2 Sam 7:12-14",note: "The Davidic promise — 'I will establish his kingdom'" },
      { ref: "1 Kgs 3:9",    note: "Solomon asks for a discerning heart to govern" },
      { ref: "1 Kgs 11:11",  note: "The kingdom torn — Solomon's failure" },
      { ref: "Matt 4:17",    note: "'Repent, for the kingdom of heaven has come near'" },
      { ref: "Mark 1:15",    note: "'The time has come; the kingdom of God has come near'" },
      { ref: "Luke 17:20-21",note: "'The kingdom of God is in your midst'" },
      { ref: "Acts 1:6-8",   note: "'It is not for you to know the times — but you will receive power'" }
    ,
      { ref: "2 Kgs 11:12", note: "Joash crowned — the Davidic line preserved through Athaliah's purge" }]
  },

  // ── The Spirit of God ───────────────────────────────────────────────────
  {
    id: "spirit-of-god",
    theme: "The Spirit of God",
    tags: ["Holy Spirit", "ruach", "pneuma", "empowerment"],
    chain: [
      { ref: "Gen 1:2",      note: "The Spirit hovers over the waters — present at creation" },
      { ref: "Num 11:25-26", note: "The Spirit rests on the seventy elders — and on two in the camp" },
      { ref: "Judg 3:10",    note: "The Spirit comes on Othniel — empowerment for deliverance" },
      { ref: "Judg 14:6",    note: "The Spirit rushes on Samson — raw power without wisdom" },
      { ref: "1 Sam 16:13",  note: "The Spirit comes on David — permanent empowerment" },
      { ref: "1 Kgs 18:12",  note: "Obadiah fears the Spirit will carry Elijah away" },
      { ref: "1 Kgs 19:11-12",note: "Not in wind, earthquake, fire — but a gentle whisper" },
      { ref: "Luke 4:18-19", note: "'The Spirit of the Lord is on me — to proclaim good news'" },
      { ref: "John 20:22",   note: "Jesus breathes the Spirit on the disciples" },
      { ref: "Acts 2:1-4",   note: "Pentecost — the Spirit poured out on all flesh" }
    ]
  },

  // ── Faithfulness in Suffering ───────────────────────────────────────────
  {
    id: "faithful-suffering",
    theme: "Faithfulness Through Suffering",
    tags: ["suffering", "perseverance", "testing", "trust"],
    chain: [
      { ref: "Gen 22:1-2",   note: "God tests Abraham with Isaac — the ultimate demand" },
      { ref: "Gen 37:23-28", note: "Joseph sold by brothers — suffering that leads to salvation" },
      { ref: "Gen 50:20",    note: "'You meant evil; God meant it for good' — the key to Joseph's story" },
      { ref: "Exod 1:8-14",  note: "Israel enslaved — suffering before deliverance" },
      { ref: "Ruth 1:20-21", note: "Naomi: 'The Almighty has made my life bitter' — suffering that leads to restoration" },
      { ref: "1 Sam 22:1-2", note: "David in the cave — the anointed king as fugitive" },
      { ref: "Mark 8:34",    note: "'Whoever wants to be my disciple must deny themselves and take up their cross'" },
      { ref: "Acts 5:41",    note: "The apostles rejoice 'because they had been counted worthy of suffering'" }
    ]
  },

  // ── Women of Faith ──────────────────────────────────────────────────────
  {
    id: "women-of-faith",
    theme: "Women of Courage and Faith",
    tags: ["women", "courage", "faith", "reversal"],
    chain: [
      { ref: "Gen 16:7-13",  note: "Hagar — the first person to name God: 'You are the God who sees me'" },
      { ref: "Gen 38:26",    note: "Tamar — Judah: 'She is more righteous than I'" },
      { ref: "Exod 1:15-21", note: "The midwives feared God and let the boys live — civil disobedience" },
      { ref: "Exod 2:1-10",  note: "Moses' mother and Pharaoh's daughter — women saving the deliverer" },
      { ref: "Josh 2:1-21",  note: "Rahab hides the spies — a Canaanite woman of faith" },
      { ref: "Judg 4:4-9",   note: "Deborah — prophet, judge, military strategist" },
      { ref: "Ruth 3:10-11", note: "Ruth: 'a woman of noble character' — hesed embodied" },
      { ref: "Luke 1:46-55", note: "Mary's Magnificat — the most revolutionary song in Scripture" },
      { ref: "John 20:17-18",note: "Mary Magdalene — first witness of the resurrection" }
    ]
  },
  // ── Wisdom ──────────────────────────────────────────────────────────────
  {
    id: "wisdom-thread",
    theme: "The Pursuit of Wisdom",
    tags: ["wisdom", "fear of the LORD", "understanding", "knowledge"],
    chain: [
      { ref: "Gen 3:6",      note: "The tree of knowledge — wisdom sought apart from God" },
      { ref: "Deut 4:6",     note: "'Observe them carefully, for this will show your wisdom'" },
      { ref: "1 Kgs 3:9-12", note: "Solomon asks for wisdom — and God grants it" },
      { ref: "1 Kgs 4:29-34",note: "Solomon's wisdom surpasses all the East and Egypt" },
      { ref: "Prov 1:7",     note: "'The fear of the LORD is the beginning of knowledge'" },
      { ref: "Prov 3:13-18", note: "Blessed is the one who finds wisdom — 'she is a tree of life'" },
      { ref: "Prov 8:22-31", note: "Wisdom present at creation — 'I was there when he set the heavens in place'" },
      { ref: "Prov 9:10",    note: "'The fear of the LORD is the beginning of wisdom'" },
      { ref: "Matt 12:42",   note: "'One greater than Solomon is here'" },
      { ref: "Luke 2:52",    note: "Jesus grew in wisdom" },
      { ref: "Acts 6:10",    note: "Stephen's wisdom could not be resisted" }
    ]
  }
];

// ── Bidirectional pairs (simpler connections without a full thread) ────────
window.CROSS_REF_PAIRS = [
  { a: "Gen 1:1",     b: "John 1:1",     note: "'In the beginning' — creation and incarnation" },
  { a: "Gen 3:15",    b: "Luke 1:31-33",  note: "The seed of the woman — first promise, fulfilment" },
  { a: "Gen 14:18",   b: "Mark 14:22-24", note: "Melchizedek brings bread and wine — priestly foreshadowing" },
  { a: "Gen 28:12",   b: "John 1:51",     note: "Jacob's ladder — Jesus: 'You will see angels ascending and descending'" },
  { a: "Exod 3:14",   b: "John 8:58",     note: "'I AM' — the burning bush and Jesus' claim" },
  { a: "Exod 16:4",   b: "John 6:32-35",  note: "Manna from heaven — Jesus: 'I am the bread of life'" },
  { a: "Num 21:8-9",  b: "John 3:14-15",  note: "The bronze serpent lifted up — 'so the Son of Man must be lifted up'" },
  { a: "Deut 6:4-5",  b: "Mark 12:29-30", note: "The Shema — Jesus affirms: the greatest commandment" },
  { a: "Deut 18:15",  b: "Acts 3:22-23",  note: "'A prophet like me' — Moses predicts, Peter identifies Jesus" },
  { a: "Judg 13:5",   b: "Matt 2:23",     note: "Samson the Nazirite from birth — 'He will be called a Nazarene'" },
  { a: "Ruth 4:17",   b: "Matt 1:5-6",    note: "Ruth in the genealogy of David — and of Jesus" },
  { a: "1 Sam 2:1-10",b: "Luke 1:46-55",  note: "Hannah's song and Mary's Magnificat — the same theology of reversal" },
  { a: "2 Sam 7:14",  b: "Luke 1:32-33",  note: "'I will be his father, he will be my son' — Davidic covenant fulfilled" },
  { a: "1 Kgs 17:8-16",b:"Luke 4:25-26",  note: "Elijah and the widow — Jesus cites this to explain his mission" },
  { a: "1 Kgs 19:11-12",b:"Mark 4:39",    note: "God in the whisper, not the storm — Jesus commands the storm itself" },
  { a: "Lev 19:18",   b: "Matt 22:39",    note: "'Love your neighbour' — Leviticus to Jesus" },
  { a: "Prov 8:22-31",b: "John 1:1-3",    note: "Wisdom at creation — the Word at creation" }
,
  { a: "2 Kgs 18:13",b: "Isa 36:1",     note: "Sennacherib invades — parallel accounts in Kings and Isaiah" },
  { a: "2 Kgs 25:1", b: "Jer 52:4",     note: "The siege of Jerusalem — parallel accounts in Kings and Jeremiah" }];
