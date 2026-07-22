/**
 * chapterItems.test.ts — Unit tests for the chapter item model (#1871).
 *
 * Covers: read/study/deep modes, lens filtering, verseIndexMap correctness,
 * coaching gating, stable keys.
 */

import {
  buildChapterItems,
  type BuildChapterItemsOpts,
  type ChapterListItem,
} from '../chapterItems';
import type { Section, SectionPanel, ChapterPanel, CoachingTip } from '../../types';

// ── Fixtures ───────────────────────────────────────────────────────

function section(num: number, verseStart: number, verseEnd: number): Section {
  return {
    id: `genesis_1_s${num}`,
    chapter_id: 'genesis_1',
    section_num: num,
    header: `Section ${num}`,
    verse_start: verseStart,
    verse_end: verseEnd,
  };
}

function sectionPanel(sectionId: string, panelType: string, id = 1): SectionPanel {
  return { id, section_id: sectionId, panel_type: panelType, content_json: '{}' };
}

function chapterPanel(panelType: string, id = 1): ChapterPanel {
  return { id, chapter_id: 'genesis_1', panel_type: panelType, content_json: '{}' };
}

const SECTIONS = [
  { ...section(1, 1, 5), panels: ['heb', 'hist', 'cross'].map((t, i) => sectionPanel('genesis_1_s1', t, i)) },
  { ...section(2, 6, 13), panels: ['ctx', 'mac'].map((t, i) => sectionPanel('genesis_1_s2', t, i)) },
  { ...section(3, 14, 25), panels: [] as SectionPanel[] },
];

const CHAPTER_PANELS = [
  chapterPanel('lit', 1),
  chapterPanel('themes', 2),
  chapterPanel('discourse', 3),
];

const TIPS: CoachingTip[] = [
  { after_section: 1, tip: 'Notice the refrain.', genre_tag: 'narrative', tone: 'observation' },
  { after_section: 3, tip: 'What pattern completes here?', genre_tag: 'narrative', tone: 'question' },
];

const CHAPTER_COACHING = {
  questions: ['Why days?'],
  observations: ['Sevens everywhere.'],
  reflections: ['Rest as gift.'],
};

function opts(overrides: Partial<BuildChapterItemsOpts> = {}): BuildChapterItemsOpts {
  return {
    mode: 'study',
    lensKeys: [],
    coaching: {
      studyCoachEnabled: true,
      sectionTips: TIPS,
      chapterCoaching: CHAPTER_COACHING,
      dismissedTips: new Set<number>(),
    },
    genre: { label: 'Narrative', guidance: 'Read for plot and pattern.' },
    prayerPrompt: 'Thank God for order out of chaos.',
    relatedLifeTopicsJson: '["creation-care"]',
    mapStoryLinkId: 'creation_story',
    ...overrides,
  };
}

function types(items: ChapterListItem[]): string[] {
  return items.map((i) => i.type);
}

function byType<T extends ChapterListItem['type']>(items: ChapterListItem[], type: T) {
  return items.filter((i): i is Extract<ChapterListItem, { type: T }> => i.type === type);
}

// ── Mode: study ────────────────────────────────────────────────────

describe('buildChapterItems — study mode', () => {
  const { items, verseIndexMap } = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts());

  it('emits the full ordered item sequence', () => {
    expect(types(items)).toEqual([
      'chapterHeader',
      'genreBanner',
      // section 1 (+ tip after_section 1)
      'sectionHeader', 'verseBlock', 'panelRow', 'coachingCard',
      // section 2 (no tip)
      'sectionHeader', 'verseBlock', 'panelRow',
      // section 3 (+ tip after_section 3)
      'sectionHeader', 'verseBlock', 'panelRow', 'coachingCard',
      'scholarlyBlock',
      'coachingCard', // chapter-level
      'relatedContent', // lifeTopics
      'prayerPrompt',
      'mapChip',
      'relatedContent', // carousel
      'footer',
    ]);
  });

  it('starts with chapterHeader and ends with footer', () => {
    expect(items[0].type).toBe('chapterHeader');
    expect(items[items.length - 1].type).toBe('footer');
  });

  it('only the first section hides its separator', () => {
    const headers = byType(items, 'sectionHeader');
    expect(headers.map((h) => h.showSeparator)).toEqual([false, true, true]);
  });

  it('panelRow carries the section panel keys in order', () => {
    const rows = byType(items, 'panelRow');
    expect(rows.map((r) => r.panelKeys)).toEqual([
      ['heb', 'hist', 'cross'],
      ['ctx', 'mac'],
      [],
    ]);
  });

  it('scholarlyBlock carries chapter panel keys and the disclaimer', () => {
    const [block] = byType(items, 'scholarlyBlock');
    expect(block.panelKeys).toEqual(['lit', 'themes', 'discourse']);
    expect(block.showDisclaimer).toBe(true);
  });

  it('emits section tips and the chapter coaching card', () => {
    const cards = byType(items, 'coachingCard');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toMatchObject({ variant: 'section', tip: TIPS[0] });
    expect(cards[1]).toMatchObject({ variant: 'section', tip: TIPS[1] });
    expect(cards[2]).toMatchObject({ variant: 'chapter', coaching: CHAPTER_COACHING });
  });

  it('emits both relatedContent variants in order', () => {
    const related = byType(items, 'relatedContent');
    expect(related.map((r) => r.variant)).toEqual(['lifeTopics', 'carousel']);
    expect(related[0].relatedLifeTopicsJson).toBe('["creation-care"]');
  });

  it('emits the mapChip slot with the story id', () => {
    const [chip] = byType(items, 'mapChip');
    expect(chip.storyId).toBe('creation_story');
  });

  it('uses stable ${type}:${sectionNum}:${panelKey ?? verseStart} keys, all unique', () => {
    const keys = items.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('sectionHeader:2:6');
    expect(keys).toContain('verseBlock:2:6');
    expect(keys).toContain('panelRow:2:6');
    expect(keys).toContain('coachingCard:1:tip');
    expect(keys).toContain('coachingCard:0:chapter');
    expect(keys).toContain('scholarlyBlock:0:0');
    expect(keys).toContain('mapChip:0:creation_story');
  });

  it('keys are stable across rebuilds with equal inputs', () => {
    const rebuilt = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts());
    expect(rebuilt.items.map((i) => i.key)).toEqual(items.map((i) => i.key));
  });

  describe('verseIndexMap', () => {
    it('maps every verse in every section to its verseBlock index', () => {
      expect(verseIndexMap.size).toBe(25);
      for (let v = 1; v <= 5; v++) expect(verseIndexMap.get(v)).toBe(3);
      for (let v = 6; v <= 13; v++) expect(verseIndexMap.get(v)).toBe(7);
      for (let v = 14; v <= 25; v++) expect(verseIndexMap.get(v)).toBe(10);
    });

    it('every mapped index points at a verseBlock covering that verse', () => {
      for (const [verseNum, idx] of verseIndexMap) {
        const item = items[idx];
        expect(item.type).toBe('verseBlock');
        if (item.type === 'verseBlock') {
          expect(verseNum).toBeGreaterThanOrEqual(item.verseStart);
          expect(verseNum).toBeLessThanOrEqual(item.verseEnd);
        }
      }
    });

    it('has no entry for verses outside every section', () => {
      expect(verseIndexMap.get(0)).toBeUndefined();
      expect(verseIndexMap.get(26)).toBeUndefined();
    });
  });
});

// ── Mode: read ─────────────────────────────────────────────────────

describe('buildChapterItems — read mode', () => {
  const { items, verseIndexMap } = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts({ mode: 'read' }));

  it('hides study chrome: no banner, panels, coaching, scholarly, mapChip, carousel', () => {
    expect(types(items)).toEqual([
      'chapterHeader',
      'sectionHeader', 'verseBlock',
      'sectionHeader', 'verseBlock',
      'sectionHeader', 'verseBlock',
      'relatedContent', // lifeTopics renders in read mode today
      'prayerPrompt',
      'footer',
    ]);
    expect(byType(items, 'relatedContent').map((r) => r.variant)).toEqual(['lifeTopics']);
  });

  it('verseIndexMap tracks the read-mode indices', () => {
    expect(verseIndexMap.get(1)).toBe(2);
    expect(verseIndexMap.get(13)).toBe(4);
    expect(verseIndexMap.get(25)).toBe(6);
  });
});

// ── Mode: deep ─────────────────────────────────────────────────────

describe('buildChapterItems — deep mode', () => {
  it('currently renders identically to study (PR-1 parity bridge)', () => {
    const study = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts({ mode: 'study' }));
    const deep = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts({ mode: 'deep' }));
    expect(deep.items).toEqual(study.items);
    expect([...deep.verseIndexMap]).toEqual([...study.verseIndexMap]);
  });
});

// ── Lens filtering ─────────────────────────────────────────────────

describe('buildChapterItems — lens filtering', () => {
  it('filters section and chapter panel keys to the lens allowlist', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({ lensKeys: ['heb', 'ctx', 'lit'] }),
    );
    const rows = byType(items, 'panelRow');
    expect(rows.map((r) => r.panelKeys)).toEqual([['heb'], ['ctx'], []]);
    const [block] = byType(items, 'scholarlyBlock');
    expect(block.panelKeys).toEqual(['lit']);
  });

  it('an empty lensKeys array means no filtering (authoring-bug safety net)', () => {
    const { items } = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts({ lensKeys: [] }));
    const rows = byType(items, 'panelRow');
    expect(rows[0].panelKeys).toEqual(['heb', 'hist', 'cross']);
  });

  it('a lens matching nothing empties the rows but keeps the items', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({ lensKeys: ['nonexistent'] }),
    );
    expect(byType(items, 'panelRow').every((r) => r.panelKeys.length === 0)).toBe(true);
    expect(byType(items, 'scholarlyBlock')[0].panelKeys).toEqual([]);
  });

  it('lens filtering never touches read mode (no panel items exist)', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({ mode: 'read', lensKeys: ['heb'] }),
    );
    expect(byType(items, 'panelRow')).toHaveLength(0);
  });
});

// ── Coaching gating ────────────────────────────────────────────────

describe('buildChapterItems — coaching gating', () => {
  it('drops dismissed section tips but keeps the rest', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({
        coaching: {
          studyCoachEnabled: true,
          sectionTips: TIPS,
          chapterCoaching: CHAPTER_COACHING,
          dismissedTips: new Set([1]),
        },
      }),
    );
    const cards = byType(items, 'coachingCard');
    expect(cards.map((c) => c.key)).toEqual(['coachingCard:3:tip', 'coachingCard:0:chapter']);
  });

  it('emits no coaching items when the study coach is disabled', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({
        coaching: {
          studyCoachEnabled: false,
          sectionTips: TIPS,
          chapterCoaching: CHAPTER_COACHING,
          dismissedTips: new Set<number>(),
        },
      }),
    );
    expect(byType(items, 'coachingCard')).toHaveLength(0);
  });

  it('emits no chapter card when chapterCoaching is null', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({
        coaching: {
          studyCoachEnabled: true,
          sectionTips: [],
          chapterCoaching: null,
          dismissedTips: new Set<number>(),
        },
      }),
    );
    expect(byType(items, 'coachingCard')).toHaveLength(0);
  });
});

// ── Optional slots ─────────────────────────────────────────────────

describe('buildChapterItems — contextGuard + studySessionCta (D4 #1874)', () => {
  const GUARD = {
    ref: 'jeremiah 29:11',
    book_id: 'jeremiah',
    chapter_num: 29,
    verse_num: 11,
    common_misreading: 'A personal promise of prosperity.',
    actual_context_summary: 'Spoken to exiles facing 70 years in Babylon.',
    suggested_book_id: 'jeremiah',
    suggested_chapter_num: 29,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  it('emits guard, CTA, then genre banner after the chapter header', () => {
    const { items } = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts({
      proofTextGuard: GUARD,
      showStudyCta: true,
    }));
    expect(types(items).slice(0, 4)).toEqual([
      'chapterHeader', 'contextGuard', 'studySessionCta', 'genreBanner',
    ]);
    const [guard] = byType(items, 'contextGuard');
    expect(guard.guard).toBe(GUARD);
  });

  it('hides both in read mode', () => {
    const { items } = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts({
      mode: 'read',
      proofTextGuard: GUARD,
      showStudyCta: true,
    }));
    expect(types(items)).not.toContain('contextGuard');
    expect(types(items)).not.toContain('studySessionCta');
  });

  it('omits both when absent from opts', () => {
    const { items } = buildChapterItems(SECTIONS, CHAPTER_PANELS, opts());
    expect(types(items)).not.toContain('contextGuard');
    expect(types(items)).not.toContain('studySessionCta');
  });
});

describe('buildChapterItems — optional slots', () => {
  it('omits genreBanner, prayerPrompt, lifeTopics, and mapChip when absent', () => {
    const { items } = buildChapterItems(
      SECTIONS,
      CHAPTER_PANELS,
      opts({
        genre: null,
        prayerPrompt: null,
        relatedLifeTopicsJson: null,
        mapStoryLinkId: null,
      }),
    );
    const ts = types(items);
    expect(ts).not.toContain('genreBanner');
    expect(ts).not.toContain('prayerPrompt');
    expect(ts).not.toContain('mapChip');
    expect(byType(items, 'relatedContent').map((r) => r.variant)).toEqual(['carousel']);
  });

  it('handles an empty chapter (no sections, no panels)', () => {
    const { items, verseIndexMap } = buildChapterItems([], [], opts({
      genre: null, prayerPrompt: null, relatedLifeTopicsJson: null, mapStoryLinkId: null,
    }));
    expect(types(items)).toEqual(['chapterHeader', 'scholarlyBlock', 'coachingCard', 'relatedContent', 'footer']);
    expect(verseIndexMap.size).toBe(0);
  });
});
