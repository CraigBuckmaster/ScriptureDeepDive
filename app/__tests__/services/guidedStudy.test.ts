import { getStudyDepthEstimate } from '@/services/guidedStudy/estimate';
import { buildGuidedStudyPlan } from '@/services/guidedStudy/plan';
import {
  buildReviewItemsFromSynthesis,
  nextIntervalAfter,
  REVIEW_INTERVAL_DAYS,
} from '@/services/guidedStudy/review';
import type { Book, Chapter, ChapterPanel, Section, SectionPanel, Verse } from '@/types';
import type { ParsedBookIntro } from '@/types';

const book: Book = {
  id: 'genesis',
  name: 'Genesis',
  testament: 'ot',
  total_chapters: 50,
  book_order: 1,
  is_live: true,
  genre: 'theological_narrative',
  genre_label: 'Theological Narrative',
  genre_guidance: 'Focus on who and why, not only how and when.',
};

const chapter: Chapter = {
  id: 'genesis_1',
  book_id: 'genesis',
  chapter_num: 1,
  title: 'The Creation of the Heaven and the Earth',
  subtitle: 'Creation ordered by speech',
  timeline_link_event: null,
  timeline_link_text: null,
  map_story_link_id: null,
  map_story_link_text: null,
  coaching_json: null,
  difficulty: null,
};

const verses: Verse[] = [
  {
    id: 1,
    book_id: 'genesis',
    chapter_num: 1,
    verse_num: 1,
    translation: 'kjv',
    text: 'In the beginning God created the heaven and the earth.',
  },
  {
    id: 2,
    book_id: 'genesis',
    chapter_num: 1,
    verse_num: 2,
    translation: 'kjv',
    text: 'And the earth was without form, and void.',
  },
];

const sections: Array<Section & { panels: SectionPanel[] }> = [
  {
    id: 'genesis_1_1',
    chapter_id: 'genesis_1',
    section_num: 1,
    header: 'Light',
    verse_start: 1,
    verse_end: 5,
    panels: [
      {
        id: 1,
        section_id: 'genesis_1_1',
        panel_type: 'ctx',
        content_json: '{"note":"ancient context"}',
      },
      {
        id: 2,
        section_id: 'genesis_1_1',
        panel_type: 'heb',
        content_json: '{"note":"hebrew word study"}',
      },
    ],
  },
];

const chapterPanels: ChapterPanel[] = [
  { id: 1, chapter_id: 'genesis_1', panel_type: 'cross', content_json: '{"refs":["John 1:1"]}' },
  { id: 2, chapter_id: 'genesis_1', panel_type: 'debate', content_json: '{"topic":"days"}' },
];

const bookIntro: ParsedBookIntro = {
  era: 'Primeval',
  purpose: 'Explain beginnings and covenant hope.',
  at_a_glance: {
    author: 'Moses (traditional)',
    date: '~1446–1406 BC',
    chapters: 50,
    genre: 'Theological Narrative',
    key_theme: 'Creation, fall, and covenant promise',
    key_word: 'beginning',
  },
};

describe('guided study services', () => {
  it('calculates stable study depth estimates from verse and panel word counts', () => {
    const estimate = getStudyDepthEstimate(verses, sections[0].panels, chapterPanels);

    expect(estimate).toEqual({
      readMin: 1,
      guidedMin: 5,
      deepMin: 13,
    });
  });

  it('builds scene rows, observe prompts, recommendations, and concept chips', () => {
    const plan = buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels,
      verses,
      bookIntro,
    });

    expect(plan.title).toBe('The Creation of the Heaven and the Earth');
    expect(plan.mode).toBe('deep');
    expect(plan.sceneRows.map((row) => row.label)).toEqual([
      'Genre',
      'Moment',
      'Original audience context',
      'Purpose',
    ]);
    expect(plan.prompts).toHaveLength(2);
    expect(plan.recommendations.map((rec) => rec.panelType)).toEqual([
      'ctx',
      'heb',
      'cross',
      'debate',
    ]);
    expect(plan.evidenceTrail.map((item) => item.title)).toEqual([
      'Start with context',
      'Check the language',
      'Compare Scripture',
      'If unclear, weigh debate',
    ]);
    expect(plan.conceptChips.map((chip) => chip.label)).toContain('Theological Narrative');
  });

  it('adapts recommendation depth and better questions by study mode', () => {
    const quick = buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels,
      verses,
      bookIntro,
      mode: 'quick',
    });
    const teaching = buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels,
      verses,
      bookIntro,
      mode: 'teaching',
    });
    const devotional = buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels,
      verses,
      bookIntro,
      mode: 'devotional',
    });

    expect(quick.recommendations).toHaveLength(3);
    expect(quick.betterQuestionPrompt).toContain('one question');
    expect(teaching.betterQuestionPrompt).toContain('teach this passage');
    expect(devotional.betterQuestionPrompt).toBe(
      'What does the chapter emphasize before you ask how it applies to me?',
    );
  });

  it('schedules one row per populated synthesis field at the first interval', () => {
    const items = buildReviewItemsFromSynthesis({
      takeaway: 'Creation is ordered by God.',
      open_question: '',
      key_connection: 'John echoes Genesis.',
    });

    // Empty fields are filtered out → 2 populated rows (not 3, not 8).
    expect(REVIEW_INTERVAL_DAYS).toEqual([1, 3, 7, 30]);
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.intervalDays === 1)).toBe(true);
    expect(items.map((item) => item.prompt)).toEqual([
      'What was your main takeaway from this study session?',
      'What key connection did this chapter reveal?',
    ]);
  });

  it('walks the interval ladder on completion and stops after the last', () => {
    expect(nextIntervalAfter(1)).toBe(3);
    expect(nextIntervalAfter(3)).toBe(7);
    expect(nextIntervalAfter(7)).toBe(30);
    expect(nextIntervalAfter(30)).toBeNull();
    // Off-ladder values (corrupt row) terminate the chain cleanly rather than looping.
    expect(nextIntervalAfter(2)).toBeNull();
    expect(nextIntervalAfter(0)).toBeNull();
  });

  it('falls back to the generic genre prompt when genre is unknown or missing', () => {
    const mysteryBook: Book = {
      ...book,
      genre: 'mystery_genre',
      genre_label: 'Mystery Genre',
    };
    const plan = buildGuidedStudyPlan({
      book: mysteryBook,
      chapter,
      sections,
      chapterPanels,
      verses,
    });
    const genrePromptText = plan.prompts.find((p) => p.key === 'genre-observation')?.text ?? '';
    expect(genrePromptText).toBe(
      'What does the passage emphasize before you open any study panels?',
    );

    // No book/genre at all → same generic fallback
    const plan2 = buildGuidedStudyPlan({
      book: { ...book, genre_label: '' },
      chapter,
      sections,
      chapterPanels,
      verses,
    });
    expect(plan2.prompts.find((p) => p.key === 'genre-observation')?.text).toBe(
      'What does the passage emphasize before you open any study panels?',
    );
  });

  it('produces genre-specific prompts for each canonical genre label', () => {
    const cases: Array<[string, string]> = [
      ['Narrative', 'What tension, movement, or turning point do you notice in this scene?'],
      ['Psalm', 'What emotional movement do you notice from the opening line to the close?'],
      ['Prophet', 'What covenant problem is the prophet confronting?'],
      ['Letter', 'What problem or question is this paragraph answering?'],
      ['Wisdom', 'What pattern of wise or foolish living is being exposed?'],
    ];
    for (const [label, expected] of cases) {
      const plan = buildGuidedStudyPlan({
        book: { ...book, genre_label: label },
        chapter,
        sections,
        chapterPanels,
        verses,
      });
      expect(plan.prompts.find((p) => p.key === 'genre-observation')?.text).toBe(expected);
    }
  });

  it('derives confidence badges for debate and commentary panel types', () => {
    const plan = buildGuidedStudyPlan({
      book,
      chapter,
      sections: [
        {
          ...sections[0],
          panels: [
            {
              id: 10,
              section_id: 'genesis_1_1',
              panel_type: 'debate',
              content_json: '{"positions":[]}',
            },
            {
              id: 11,
              section_id: 'genesis_1_1',
              panel_type: 'com',
              content_json: '{"scholar":"calvin"}',
            },
          ],
        },
      ],
      chapterPanels: [],
      verses,
    });
    const debate = plan.recommendations.find((r) => r.panelType === 'debate');
    const com = plan.recommendations.find((r) => r.panelType === 'com');
    expect(debate?.confidence).toBe('debated');
    expect(com?.confidence).toBe('majority');
  });

  it('caps recommendations at 5 and dedupes by panel type', () => {
    // Many chapter panels → recommendations should still cap at 5
    const lotsOfChapterPanels: ChapterPanel[] = [
      { id: 1, chapter_id: 'genesis_1', panel_type: 'cross', content_json: '{}' },
      { id: 2, chapter_id: 'genesis_1', panel_type: 'lit', content_json: '{}' },
      { id: 3, chapter_id: 'genesis_1', panel_type: 'themes', content_json: '{}' },
      { id: 4, chapter_id: 'genesis_1', panel_type: 'rec', content_json: '{}' },
      { id: 5, chapter_id: 'genesis_1', panel_type: 'trans', content_json: '{}' },
      { id: 6, chapter_id: 'genesis_1', panel_type: 'src', content_json: '{}' },
      { id: 7, chapter_id: 'genesis_1', panel_type: 'ppl', content_json: '{}' },
    ];
    const plan = buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels: lotsOfChapterPanels,
      verses,
    });
    expect(plan.recommendations.length).toBeLessThanOrEqual(5);
  });

  it('handles empty sections and empty panels without crashing', () => {
    const plan = buildGuidedStudyPlan({
      book,
      chapter,
      sections: [],
      chapterPanels: [],
      verses: [],
    });
    expect(plan.title).toBe('The Creation of the Heaven and the Earth');
    expect(plan.recommendations).toHaveLength(0);
    // Section prompt falls back to the generic chapter-level prompt
    expect(plan.prompts.some((p) => p.text.includes('chapter on its own terms'))).toBe(true);
  });

  it('reads concept haystack from bookIntro fields (purpose, key_theme, key_word)', () => {
    const bookIntro: ParsedBookIntro = {
      purpose: 'Explores themes of covenant and mercy between God and his people.',
      at_a_glance: {
        author: 'Moses',
        date: '~1446 BC',
        chapters: 50,
        genre: 'Theological Narrative',
        key_theme: 'Creation and redemption',
        key_word: 'covenant',
      },
    };
    const plan = buildGuidedStudyPlan({
      book: { ...book, genre_label: '' },
      chapter: { ...chapter, title: 'Neutral Title', subtitle: null },
      sections: [],
      chapterPanels: [],
      verses: [],
      bookIntro,
    });
    const labels = plan.conceptChips.map((c) => c.label.toLowerCase());
    // At least one lexical concept from the bookIntro haystack is picked up
    expect(labels.some((l) => ['covenant', 'creation', 'redemption', 'mercy'].includes(l))).toBe(
      true,
    );
  });
});
