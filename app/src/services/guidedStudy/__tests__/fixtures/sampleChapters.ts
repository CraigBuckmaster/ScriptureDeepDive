import type {
  Book,
  Chapter,
  ChapterPanel,
  ParsedBookIntro,
  Section,
  SectionPanel,
  Verse,
} from '../../../../types';
import type { GuidedStudyMode, GuidedStudyPlanInput } from '../../types';

export const SAMPLE_CHAPTER_IDS = [
  'gen_1',
  'psa_23',
  'isa_53',
  'rom_8',
  'prov_3',
] as const;

export type SampleChapterId = (typeof SAMPLE_CHAPTER_IDS)[number];

interface ChapterFixture {
  book: Book;
  chapter: Chapter;
  sections: Array<Section & { panels: SectionPanel[] }>;
  chapterPanels: ChapterPanel[];
  verses: Verse[];
  bookIntro: ParsedBookIntro;
}

function panel(id: number, sectionId: string, type: string, note: string): SectionPanel {
  return { id, section_id: sectionId, panel_type: type, content_json: JSON.stringify({ note }) };
}

function chapterPanel(id: number, chapterId: string, type: string, note: string): ChapterPanel {
  return { id, chapter_id: chapterId, panel_type: type, content_json: JSON.stringify({ note }) };
}

const GEN_1: ChapterFixture = {
  book: {
    id: 'gen',
    name: 'Genesis',
    testament: 'ot',
    total_chapters: 50,
    book_order: 1,
    is_live: true,
    genre: 'theological_narrative',
    genre_label: 'Theological Narrative',
    genre_guidance: 'Read for who and why before how and when.',
  },
  chapter: {
    id: 'gen_1',
    book_id: 'gen',
    chapter_num: 1,
    title: 'The Creation of the Heaven and the Earth',
    subtitle: 'Creation ordered by speech',
    timeline_link_event: null,
    timeline_link_text: null,
    map_story_link_id: null,
    map_story_link_text: null,
    coaching_json: null,
    difficulty: null,
  },
  sections: [
    {
      id: 'gen_1_1',
      chapter_id: 'gen_1',
      section_num: 1,
      header: 'Light',
      verse_start: 1,
      verse_end: 5,
      panels: [
        panel(1, 'gen_1_1', 'hist', 'ANE creation backdrop'),
        panel(2, 'gen_1_1', 'ctx', 'Function-oriented opening'),
        panel(3, 'gen_1_1', 'heb', 'bara — to create'),
        panel(4, 'gen_1_1', 'cross', 'John 1:1-3 echo'),
      ],
    },
    {
      id: 'gen_1_2',
      chapter_id: 'gen_1',
      section_num: 2,
      header: 'Sky and seas',
      verse_start: 6,
      verse_end: 13,
      panels: [
        panel(5, 'gen_1_2', 'ctx', 'Separating the waters'),
        panel(6, 'gen_1_2', 'lit', 'Day pairings 1-3 / 4-6'),
      ],
    },
  ],
  chapterPanels: [
    chapterPanel(101, 'gen_1', 'lit', 'Six-day frame, sabbath crown'),
    chapterPanel(102, 'gen_1', 'debate', 'Days: literal vs framework'),
  ],
  verses: [
    { id: 1, book_id: 'gen', chapter_num: 1, verse_num: 1, translation: 'kjv', text: 'In the beginning God created the heaven and the earth.' },
    { id: 2, book_id: 'gen', chapter_num: 1, verse_num: 2, translation: 'kjv', text: 'And the earth was without form, and void.' },
  ],
  bookIntro: {
    era: 'Primeval',
    purpose: 'Explain beginnings and covenant hope.',
    at_a_glance: {
      author: 'Moses (traditional)',
      date: '~1446-1406 BC',
      chapters: 50,
      genre: 'Theological Narrative',
      key_theme: 'Creation, fall, and covenant promise',
      key_word: 'beginning',
    },
  },
};

const PSA_23: ChapterFixture = {
  book: {
    id: 'psa',
    name: 'Psalms',
    testament: 'ot',
    total_chapters: 150,
    book_order: 19,
    is_live: true,
    genre: 'poetry',
    genre_label: 'Psalm',
    genre_guidance: 'Trace the emotional arc.',
  },
  chapter: {
    id: 'psa_23',
    book_id: 'psa',
    chapter_num: 23,
    title: 'The LORD Is My Shepherd',
    subtitle: 'Trust through the valley',
    timeline_link_event: null,
    timeline_link_text: null,
    map_story_link_id: null,
    map_story_link_text: null,
    coaching_json: null,
    difficulty: null,
  },
  sections: [
    {
      id: 'psa_23_1',
      chapter_id: 'psa_23',
      section_num: 1,
      header: 'Shepherd',
      verse_start: 1,
      verse_end: 3,
      panels: [
        panel(1, 'psa_23_1', 'heb', 'roi — my shepherd'),
        panel(2, 'psa_23_1', 'ctx', 'Pastoral imagery in ancient Israel'),
      ],
    },
    {
      id: 'psa_23_2',
      chapter_id: 'psa_23',
      section_num: 2,
      header: 'Valley',
      verse_start: 4,
      verse_end: 6,
      panels: [
        panel(3, 'psa_23_2', 'cross', 'John 10 — good shepherd'),
        panel(4, 'psa_23_2', 'ctx', 'Banquet imagery in covenant context'),
      ],
    },
  ],
  chapterPanels: [
    chapterPanel(201, 'psa_23', 'lit', 'Shift from third to second person at v.4'),
    chapterPanel(202, 'psa_23', 'com', 'Calvin: comfort in the shadow'),
  ],
  verses: [
    { id: 1, book_id: 'psa', chapter_num: 23, verse_num: 1, translation: 'kjv', text: 'The LORD is my shepherd; I shall not want.' },
  ],
  bookIntro: {
    era: 'Monarchy',
    purpose: 'Anthology of Israel’s prayer and praise.',
    at_a_glance: {
      author: 'David and others',
      date: '~1000-400 BC',
      chapters: 150,
      genre: 'Poetry',
      key_theme: 'Worship in every season',
      key_word: 'praise',
    },
  },
};

const ISA_53: ChapterFixture = {
  book: {
    id: 'isa',
    name: 'Isaiah',
    testament: 'ot',
    total_chapters: 66,
    book_order: 23,
    is_live: true,
    genre: 'prophecy',
    genre_label: 'Prophecy',
    genre_guidance: 'Listen for the covenant lawsuit.',
  },
  chapter: {
    id: 'isa_53',
    book_id: 'isa',
    chapter_num: 53,
    title: 'The Suffering Servant',
    subtitle: 'Stricken for the people',
    timeline_link_event: null,
    timeline_link_text: null,
    map_story_link_id: null,
    map_story_link_text: null,
    coaching_json: null,
    difficulty: null,
  },
  sections: [
    {
      id: 'isa_53_1',
      chapter_id: 'isa_53',
      section_num: 1,
      header: 'No form or comeliness',
      verse_start: 1,
      verse_end: 3,
      panels: [
        panel(1, 'isa_53_1', 'hist', '8th-century context'),
        panel(2, 'isa_53_1', 'heb', 'mareh — appearance'),
      ],
    },
    {
      id: 'isa_53_2',
      chapter_id: 'isa_53',
      section_num: 2,
      header: 'Stricken',
      verse_start: 4,
      verse_end: 6,
      panels: [
        panel(3, 'isa_53_2', 'ctx', 'Substitutionary motif'),
        panel(4, 'isa_53_2', 'src', 'Acts 8 — Ethiopian eunuch reads'),
      ],
    },
    {
      id: 'isa_53_3',
      chapter_id: 'isa_53',
      section_num: 3,
      header: 'Vindication',
      verse_start: 7,
      verse_end: 12,
      panels: [
        panel(5, 'isa_53_3', 'cross', '1 Peter 2:24'),
      ],
    },
  ],
  chapterPanels: [
    chapterPanel(301, 'isa_53', 'debate', 'Servant identity: Israel vs Messiah'),
    chapterPanel(302, 'isa_53', 'com', 'Calvin / Moo on imputation'),
  ],
  verses: [
    { id: 1, book_id: 'isa', chapter_num: 53, verse_num: 1, translation: 'kjv', text: 'Who hath believed our report?' },
  ],
  bookIntro: {
    era: 'Divided monarchy',
    purpose: 'Comfort and confront a covenant people facing judgment.',
    at_a_glance: {
      author: 'Isaiah of Jerusalem',
      date: '~740-680 BC',
      chapters: 66,
      genre: 'Prophecy',
      key_theme: 'The Holy One of Israel',
      key_word: 'comfort',
    },
  },
};

const ROM_8: ChapterFixture = {
  book: {
    id: 'rom',
    name: 'Romans',
    testament: 'nt',
    total_chapters: 16,
    book_order: 45,
    is_live: true,
    genre: 'epistle',
    genre_label: 'Letter',
    genre_guidance: 'Trace the argument paragraph by paragraph.',
  },
  chapter: {
    id: 'rom_8',
    book_id: 'rom',
    chapter_num: 8,
    title: 'Life in the Spirit',
    subtitle: 'No condemnation, no separation',
    timeline_link_event: null,
    timeline_link_text: null,
    map_story_link_id: null,
    map_story_link_text: null,
    coaching_json: null,
    difficulty: null,
  },
  sections: [
    {
      id: 'rom_8_1',
      chapter_id: 'rom_8',
      section_num: 1,
      header: 'No condemnation',
      verse_start: 1,
      verse_end: 11,
      panels: [
        panel(1, 'rom_8_1', 'greek', 'katakrima — condemnation'),
        panel(2, 'rom_8_1', 'ctx', 'Forensic vs participatory framing'),
        panel(3, 'rom_8_1', 'cross', 'Galatians 5 echo'),
      ],
    },
    {
      id: 'rom_8_2',
      chapter_id: 'rom_8',
      section_num: 2,
      header: 'Children and heirs',
      verse_start: 12,
      verse_end: 17,
      panels: [
        panel(4, 'rom_8_2', 'com', 'Moo: adoption as legal status'),
        panel(5, 'rom_8_2', 'debate', 'Suffering: necessary or consequential?'),
      ],
    },
    {
      id: 'rom_8_3',
      chapter_id: 'rom_8',
      section_num: 3,
      header: 'No separation',
      verse_start: 31,
      verse_end: 39,
      panels: [
        panel(6, 'rom_8_3', 'cross', 'Psalm 44 quoted'),
      ],
    },
  ],
  chapterPanels: [
    chapterPanel(401, 'rom_8', 'discourse', 'Climax of chs 5-8'),
    chapterPanel(402, 'rom_8', 'debate', 'Predestination scope'),
  ],
  verses: [
    { id: 1, book_id: 'rom', chapter_num: 8, verse_num: 1, translation: 'kjv', text: 'There is therefore now no condemnation to them which are in Christ Jesus.' },
  ],
  bookIntro: {
    era: 'Apostolic',
    purpose: 'Defend the gospel for Jew and Gentile alike.',
    at_a_glance: {
      author: 'Paul',
      date: '~57 AD',
      chapters: 16,
      genre: 'Letter',
      key_theme: 'Righteousness from God',
      key_word: 'gospel',
    },
  },
};

const PROV_3: ChapterFixture = {
  book: {
    id: 'prov',
    name: 'Proverbs',
    testament: 'ot',
    total_chapters: 31,
    book_order: 20,
    is_live: true,
    genre: 'wisdom',
    genre_label: 'Wisdom',
    genre_guidance: 'Read as observed regularities, not iron promises.',
  },
  chapter: {
    id: 'prov_3',
    book_id: 'prov',
    chapter_num: 3,
    title: 'Trust in the LORD',
    subtitle: 'Wisdom’s value and ways',
    timeline_link_event: null,
    timeline_link_text: null,
    map_story_link_id: null,
    map_story_link_text: null,
    coaching_json: null,
    difficulty: null,
  },
  sections: [
    {
      id: 'prov_3_1',
      chapter_id: 'prov_3',
      section_num: 1,
      header: 'Trust',
      verse_start: 1,
      verse_end: 12,
      panels: [
        panel(1, 'prov_3_1', 'heb', 'batach — trust'),
        panel(2, 'prov_3_1', 'ctx', 'Father-to-son didactic frame'),
      ],
    },
    {
      id: 'prov_3_2',
      chapter_id: 'prov_3',
      section_num: 2,
      header: 'Wisdom’s worth',
      verse_start: 13,
      verse_end: 35,
      panels: [
        panel(3, 'prov_3_2', 'cross', 'Job 28 — wisdom’s mine'),
      ],
    },
  ],
  chapterPanels: [
    chapterPanel(501, 'prov_3', 'lit', 'Three-strand: trust / honor / discipline'),
  ],
  verses: [
    { id: 1, book_id: 'prov', chapter_num: 3, verse_num: 5, translation: 'kjv', text: 'Trust in the LORD with all thine heart.' },
  ],
  bookIntro: {
    era: 'United monarchy onward',
    purpose: 'Form covenant character through observed wisdom.',
    at_a_glance: {
      author: 'Solomon and others',
      date: '~970-700 BC',
      chapters: 31,
      genre: 'Wisdom',
      key_theme: 'Fear of the LORD',
      key_word: 'wisdom',
    },
  },
};

const FIXTURES: Record<SampleChapterId, ChapterFixture> = {
  gen_1: GEN_1,
  psa_23: PSA_23,
  isa_53: ISA_53,
  rom_8: ROM_8,
  prov_3: PROV_3,
};

export function loadFixture(id: SampleChapterId, mode: GuidedStudyMode): GuidedStudyPlanInput {
  const f = FIXTURES[id];
  return {
    book: f.book,
    chapter: f.chapter,
    sections: f.sections,
    chapterPanels: f.chapterPanels,
    verses: f.verses,
    bookIntro: f.bookIntro,
    mode,
  };
}
