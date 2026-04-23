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
];

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
    const plan = buildGuidedStudyPlan({
      book,
      chapter,
      sections,
      chapterPanels,
      verses,
      bookIntro,
    });

    expect(plan.title).toBe('The Creation of the Heaven and the Earth');
    expect(plan.sceneRows.map((row) => row.label)).toEqual([
      'Genre',
      'Moment',
      'Original audience context',
      'Purpose',
    ]);
    expect(plan.prompts).toHaveLength(2);
    expect(plan.recommendations.map((rec) => rec.panelType)).toEqual(['ctx', 'heb', 'cross']);
    expect(plan.conceptChips.map((chip) => chip.label)).toContain('Theological Narrative');
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
});
