import { buildRecommendations } from '../plan';
import type { Chapter, ChapterPanel, Section, SectionPanel, Verse } from '../../../types';
import type { GuidedStudyPlanInput } from '../types';

const chapter: Chapter = {
  id: 'genesis_1',
  book_id: 'genesis',
  chapter_num: 1,
  title: 'Creation',
  subtitle: null,
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
    text: 'In the beginning.',
  },
];

function panel(id: number, sectionId: string, panel_type: string): SectionPanel {
  return { id, section_id: sectionId, panel_type, content_json: '{}' };
}

const sections: Array<Section & { panels: SectionPanel[] }> = [
  {
    id: 'genesis_1_1',
    chapter_id: 'genesis_1',
    section_num: 1,
    header: 'Light',
    verse_start: 1,
    verse_end: 5,
    panels: [
      panel(1, 'genesis_1_1', 'ctx'),
      panel(2, 'genesis_1_1', 'heb'),
      panel(3, 'genesis_1_1', 'cross'),
      panel(4, 'genesis_1_1', 'debate'),
      panel(5, 'genesis_1_1', 'com'),
    ],
  },
];

const chapterPanels: ChapterPanel[] = [];

const baseInput: GuidedStudyPlanInput = {
  book: null,
  chapter,
  sections,
  chapterPanels,
  verses,
};

describe('buildRecommendations panelWeights', () => {
  it('with empty weights, output matches the canonical RECOMMENDATION_ORDER', () => {
    const recs = buildRecommendations(baseInput);
    expect(recs.map((r) => r.panelType)).toEqual(['ctx', 'heb', 'cross', 'com', 'debate']);
  });

  it('with empty weights, output is identical to the explicit-{} call', () => {
    const implicit = buildRecommendations(baseInput).map((r) => r.panelType);
    const explicit = buildRecommendations(baseInput, {}).map((r) => r.panelType);
    expect(explicit).toEqual(implicit);
  });

  it('promotes a panelType to the front when its weight is positive', () => {
    const recs = buildRecommendations(baseInput, { heb: 10 });
    expect(recs[0].panelType).toBe('heb');
  });

  it('demotes a panelType to the back when its weight is negative', () => {
    const recs = buildRecommendations(baseInput, { debate: -10 });
    expect(recs[recs.length - 1].panelType).toBe('debate');
  });

  it('orders multiple weighted types by their weight, descending', () => {
    const recs = buildRecommendations(baseInput, { debate: 5, heb: 10, cross: 1 });
    const order = recs.map((r) => r.panelType);
    expect(order.slice(0, 3)).toEqual(['heb', 'debate', 'cross']);
  });

  it('preserves the relative order of equal-weight items (stable sort)', () => {
    // Every type maps to weight 0, so the array should be untouched.
    const recs = buildRecommendations(baseInput, { unknown: 0 });
    expect(recs.map((r) => r.panelType)).toEqual(['ctx', 'heb', 'cross', 'com', 'debate']);
  });
});
