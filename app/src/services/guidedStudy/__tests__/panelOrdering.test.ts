/**
 * Phase 2.8 (#1737) integration test — locks the per-mode panel
 * ordering produced by buildGuidedStudyPlan against a chapter that
 * contains every major panel type. Phase 1.4 fixtures are intentionally
 * narrower; this fixture is purpose-built for Phase 2.4's panelWeights.
 */
import { buildGuidedStudyPlan } from '../plan';
import type { GuidedStudyMode, GuidedStudyPlanInput } from '../types';
import type {
  Book,
  Chapter,
  ChapterPanel,
  Section,
  SectionPanel,
  Verse,
} from '../../../types';

function panel(id: number, sectionId: string, type: string): SectionPanel {
  return { id, section_id: sectionId, panel_type: type, content_json: '{}' };
}

function chapterPanel(id: number, chapterId: string, type: string): ChapterPanel {
  return { id, chapter_id: chapterId, panel_type: type, content_json: '{}' };
}

const book: Book = {
  id: 'rom',
  name: 'Romans',
  testament: 'nt',
  total_chapters: 16,
  book_order: 45,
  is_live: true,
  genre_label: 'Letter',
};

const chapter: Chapter = {
  id: 'rom_8',
  book_id: 'rom',
  chapter_num: 8,
  title: 'Life in the Spirit',
  subtitle: null,
  timeline_link_event: null,
  timeline_link_text: null,
  map_story_link_id: null,
  map_story_link_text: null,
  coaching_json: null,
  difficulty: null,
};

// One section carrying every major section-level panel type. Limited to
// six entries so buildRecommendations' 7-rec cap leaves room for at least
// one chapter-level panel (lit) — without that headroom the teaching
// "lit at index 0" assertion can't hold.
const sections: Array<Section & { panels: SectionPanel[] }> = [
  {
    id: 'rom_8_1',
    chapter_id: 'rom_8',
    section_num: 1,
    header: 'No condemnation',
    verse_start: 1,
    verse_end: 11,
    panels: [
      panel(1, 'rom_8_1', 'hist'),
      panel(2, 'rom_8_1', 'ctx'),
      panel(3, 'rom_8_1', 'heb'),
      panel(4, 'rom_8_1', 'greek'),
      panel(5, 'rom_8_1', 'cross'),
      panel(6, 'rom_8_1', 'debate'),
    ],
  },
];

// Chapter-level panels for lit + discourse.
const chapterPanels: ChapterPanel[] = [
  chapterPanel(101, 'rom_8', 'lit'),
  chapterPanel(102, 'rom_8', 'discourse'),
];

const verses: Verse[] = [
  {
    id: 1,
    book_id: 'rom',
    chapter_num: 8,
    verse_num: 1,
    translation: 'kjv',
    text: 'There is therefore now no condemnation to them which are in Christ Jesus.',
  },
];

function planFor(mode: GuidedStudyMode) {
  const input: GuidedStudyPlanInput = { book, chapter, sections, chapterPanels, verses, mode };
  return buildGuidedStudyPlan(input);
}

function indexOf(plan: ReturnType<typeof buildGuidedStudyPlan>, panelType: string): number {
  return plan.recommendations.findIndex((r) => r.panelType === panelType);
}

describe('panel ordering — fixture has every major panel type present', () => {
  it('deep mode leads with heb or greek', () => {
    const first = planFor('deep').recommendations[0]?.panelType;
    expect(first === 'heb' || first === 'greek').toBe(true);
  });

  it('teaching mode leads with lit', () => {
    expect(planFor('teaching').recommendations[0]?.panelType).toBe('lit');
  });

  it('devotional mode leads with ctx and excludes heb/greek from the limited set', () => {
    const plan = planFor('devotional');
    expect(plan.recommendations[0]?.panelType).toBe('ctx');
    // Devotional caps at 3 recommendations and pushes heb/greek to weight -3,
    // so neither should make the cut.
    const types = plan.recommendations.map((r) => r.panelType);
    expect(types).not.toContain('heb');
    expect(types).not.toContain('greek');
  });

  it('quick mode leads with hist or ctx and deprioritizes heb/greek', () => {
    const plan = planFor('quick');
    const first = plan.recommendations[0]?.panelType;
    expect(first === 'hist' || first === 'ctx').toBe(true);
    // Quick also caps at 3 recs with negative-weighted technical panels —
    // heb/greek/debate should not make the cut.
    const types = plan.recommendations.map((r) => r.panelType);
    expect(types).not.toContain('heb');
    expect(types).not.toContain('greek');
    expect(types).not.toContain('debate');
  });

  it('teaching keeps debate in the recommendations (positive weight)', () => {
    expect(indexOf(planFor('teaching'), 'debate')).toBeGreaterThanOrEqual(0);
  });
});
