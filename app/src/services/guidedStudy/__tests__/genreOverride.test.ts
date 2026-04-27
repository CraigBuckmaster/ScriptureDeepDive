/**
 * Tests for #1724 — per-chapter genre override threading through
 * buildGuidedStudyPlan and buildConceptChips. Asserts that when a
 * chapter sets both chapter_genre_label and chapter_genre_guidance,
 * those values appear in the plan output instead of book-level genre.
 */
import { buildGuidedStudyPlan } from '../plan';
import type { GuidedStudyPlanInput } from '../types';
import type { Book, Chapter, Verse } from '../../../types';

const BOOK: Book = {
  id: 'dan',
  name: 'Daniel',
  testament: 'ot',
  total_chapters: 12,
  book_order: 27,
  is_live: true,
  genre_label: 'Apocalyptic',
  genre_guidance: 'Court tales (1-6) + apocalyptic visions (7-12) · Symbolic numbers and beasts',
};

const VERSES: Verse[] = [
  { id: 1, book_id: 'dan', chapter_num: 7, verse_num: 1, translation: 'niv', text: 'In the first year of Belshazzar...' },
];

function makeChapter(overrides: Partial<Chapter> = {}): Chapter {
  return {
    id: 'dan_7',
    book_id: 'dan',
    chapter_num: 7,
    title: "Daniel's Dream of Four Beasts",
    subtitle: 'Vision of the Ancient of Days',
    timeline_link_event: null,
    timeline_link_text: null,
    map_story_link_id: null,
    map_story_link_text: null,
    coaching_json: null,
    difficulty: null,
    ...overrides,
  };
}

function makeInput(chapter: Chapter): GuidedStudyPlanInput {
  return {
    book: BOOK,
    chapter,
    sections: [],
    chapterPanels: [],
    verses: VERSES,
  };
}

function findGenreValue(plan: ReturnType<typeof buildGuidedStudyPlan>): string {
  const row = plan.sceneRows.find(
    (r): r is Extract<typeof r, { kind: 'display' }> =>
      r.kind === 'display' && r.label === 'Genre',
  );
  if (!row) throw new Error('No "Genre" display row found in sceneRows');
  return row.value;
}

describe('buildGuidedStudyPlan — per-chapter genre overrides (#1724)', () => {
  it('uses chapter override label/guidance when both are set', () => {
    const chapter = makeChapter({
      chapter_genre_label: 'Apocalyptic Vision',
      chapter_genre_guidance: 'Symbolic beasts encode empires · Vision-then-interpretation form',
    });

    const value = findGenreValue(buildGuidedStudyPlan(makeInput(chapter)));

    expect(value).toContain('Apocalyptic Vision');
    expect(value).toContain('Symbolic beasts encode empires');
    // Book-level "Court tales" guidance must NOT leak through.
    expect(value).not.toContain('Court tales');
  });

  it('falls back to book-level genre when chapter has no override', () => {
    const chapter = makeChapter();

    const value = findGenreValue(buildGuidedStudyPlan(makeInput(chapter)));

    expect(value).toContain('Apocalyptic');
    expect(value).toContain('Court tales');
  });

  it('produces a chapter-level concept chip from the override label', () => {
    const chapter = makeChapter({
      chapter_genre_label: 'Apocalyptic Vision',
      chapter_genre_guidance: 'Symbolic beasts encode empires',
    });

    const plan = buildGuidedStudyPlan(makeInput(chapter));

    const genreChip = plan.conceptChips.find((c) => c.id.startsWith('genre:'));
    expect(genreChip?.label).toBe('Apocalyptic Vision');
    expect(genreChip?.id).toBe('genre:apocalyptic-vision');
  });

  it('does not mix sources when only one chapter field is populated', () => {
    // Defensive: schema validator rejects this, but if it sneaks through
    // we fall through to book-level entirely rather than mix.
    const chapter = makeChapter({
      chapter_genre_label: 'Apocalyptic Vision',
      chapter_genre_guidance: null,
    });

    const value = findGenreValue(buildGuidedStudyPlan(makeInput(chapter)));

    expect(value).toContain('Apocalyptic');
    expect(value).toContain('Court tales');
    expect(value).not.toContain('Apocalyptic Vision');
  });
});
