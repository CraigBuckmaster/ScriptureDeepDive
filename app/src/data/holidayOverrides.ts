/**
 * holidayOverrides.ts — Special-day overrides for verse + encouragement.
 *
 * Two maps:
 *   fixedHolidays  — keyed by 'MM-DD' (same date every year)
 *   movableHolidays — keyed by holiday ID (dates computed at runtime)
 *
 * When today matches a holiday, both the verse of the day and the
 * encouragement subtitle are replaced with the holiday-specific content.
 */

export interface HolidayContent {
  name: string;
  encouragement: string;
  verse: {
    ref: string;
    bookId: string;
    chapter: number;
    text: string;
  };
}

// ── Fixed holidays (same date every year) ─────────────────────────

export const fixedHolidays: Record<string, HolidayContent> = {
  '01-01': {
    name: 'New Year\'s Day',
    encouragement: 'A new year, a fresh page — His mercies begin again today',
    verse: {
      ref: 'Lamentations 3:22–23',
      bookId: 'lamentations',
      chapter: 3,
      text: 'Because of the LORD\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.',
    },
  },
  '01-06': {
    name: 'Epiphany',
    encouragement: 'The light has come — and it shines for you',
    verse: {
      ref: 'Matthew 2:11',
      bookId: 'matthew',
      chapter: 2,
      text: 'On coming to the house, they saw the child with his mother Mary, and they bowed down and worshiped him. Then they opened their treasures and presented him with gifts of gold, frankincense and myrrh.',
    },
  },
  '10-31': {
    name: 'Reformation Day',
    encouragement: 'The righteous shall live by faith — sola fide',
    verse: {
      ref: 'Romans 1:17',
      bookId: 'romans',
      chapter: 1,
      text: 'For in the gospel the righteousness of God is revealed — a righteousness that is by faith from first to last, just as it is written: "The righteous will live by faith."',
    },
  },
  '12-25': {
    name: 'Christmas',
    encouragement: 'The Word became flesh and dwelt among us — Merry Christmas',
    verse: {
      ref: 'Luke 2:10–11',
      bookId: 'luke',
      chapter: 2,
      text: 'But the angel said to them, "Do not be afraid. I bring you good news that will cause great joy for all the people. Today in the town of David a Savior has been born to you; he is the Messiah, the Lord."',
    },
  },
};

// ── Movable holidays (keyed by ID, dates computed at runtime) ─────

export const movableHolidays: Record<string, HolidayContent> = {
  palm_sunday: {
    name: 'Palm Sunday',
    encouragement: 'Blessed is He who comes in the name of the Lord',
    verse: {
      ref: 'Matthew 21:9',
      bookId: 'matthew',
      chapter: 21,
      text: 'The crowds that went ahead of him and those that followed shouted, "Hosanna to the Son of David!" "Blessed is he who comes in the name of the Lord!" "Hosanna in the highest heaven!"',
    },
  },
  good_friday: {
    name: 'Good Friday',
    encouragement: 'By His wounds, we are healed',
    verse: {
      ref: 'Isaiah 53:5',
      bookId: 'isaiah',
      chapter: 53,
      text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.',
    },
  },
  easter: {
    name: 'Easter',
    encouragement: 'He is risen — death has lost its sting',
    verse: {
      ref: '1 Corinthians 15:55–57',
      bookId: '1_corinthians',
      chapter: 15,
      text: '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.',
    },
  },
  ascension: {
    name: 'Ascension Day',
    encouragement: 'He ascended far above all — and fills all things',
    verse: {
      ref: 'Acts 1:9–11',
      bookId: 'acts',
      chapter: 1,
      text: 'After he said this, he was taken up before their very eyes, and a cloud hid him from their sight. They were looking intently up into the sky as he was going, when suddenly two men dressed in white stood beside them.',
    },
  },
  pentecost: {
    name: 'Pentecost',
    encouragement: 'The Spirit was poured out — and still moves today',
    verse: {
      ref: 'Acts 2:4',
      bookId: 'acts',
      chapter: 2,
      text: 'All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.',
    },
  },
  thanksgiving: {
    name: 'Thanksgiving',
    encouragement: 'Give thanks in all circumstances — this is God\'s will for you',
    verse: {
      ref: '1 Thessalonians 5:16–18',
      bookId: '1_thessalonians',
      chapter: 5,
      text: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
    },
  },
  mothers_day: {
    name: 'Mother\'s Day',
    encouragement: 'Her children rise up and call her blessed',
    verse: {
      ref: 'Proverbs 31:28–29',
      bookId: 'proverbs',
      chapter: 31,
      text: 'Her children arise and call her blessed; her husband also, and he praises her: "Many women do noble things, but you surpass them all."',
    },
  },
  fathers_day: {
    name: 'Father\'s Day',
    encouragement: 'A father\'s instruction is a fountain of life',
    verse: {
      ref: 'Proverbs 4:1–2',
      bookId: 'proverbs',
      chapter: 4,
      text: 'Listen, my sons, to a father\'s instruction; pay attention and gain understanding. I give you sound learning, so do not forsake my teaching.',
    },
  },
};
