import { buildGuidedStudySystemPrompt } from '../guidedStudy';
import type { GuidedStudyMode } from '../../../guidedStudy/types';

const MODES: GuidedStudyMode[] = ['quick', 'deep', 'teaching', 'devotional'];

const FULL_INPUT = {
  chapterRef: 'Romans 8',
  captured: {
    scene: {
      genre_response: 'A theological climax of the Romans argument.',
      audience: 'College small group',
      setting: 'small group',
      arrival: 'Anxious about a hard week.',
    },
    observe: {
      primary: 'No condemnation language.',
      surprises: 'God evaluates the work as good.',
      confusions: 'What does "groaning" mean?',
      repetitions: '"In Christ" / "the Spirit".',
      main_point: 'Order from chaos by speech.',
      clarification: "It isn't a science manual.",
    },
  },
  panelsOpened: [
    { panel_type: 'hist', section_num: 1, opened_at_ms: 1735000000000 },
    { panel_type: 'cross', opened_at_ms: 1735000005000 },
    { panel_type: 'debate', opened_at_ms: 1735000010000 },
    { panel_type: 'hist', section_num: 1, opened_at_ms: 1735000020000 },
  ],
  modeSpecificContext: {
    audience: 'College small group',
    setting: 'small group',
    arrival: 'Anxious about a hard week.',
  },
};

describe('buildGuidedStudySystemPrompt — per-mode shape', () => {
  it.each(MODES)('%s prompt names the mode in the opening line', (mode) => {
    const prompt = buildGuidedStudySystemPrompt({ mode, ...FULL_INPUT });
    const expectedTitle: Record<GuidedStudyMode, string> = {
      quick: 'Quick Pass',
      deep: 'Deep Study',
      teaching: 'prepare to teach',
      devotional: 'Devotional reading',
    };
    expect(prompt).toContain(expectedTitle[mode]);
    expect(prompt).toContain('Romans 8');
  });

  it('quick interpolates scene.genre_response and observe.primary', () => {
    const prompt = buildGuidedStudySystemPrompt({ mode: 'quick', ...FULL_INPUT });
    expect(prompt).toContain('A theological climax of the Romans argument.');
    expect(prompt).toContain('No condemnation language.');
  });

  it('deep interpolates surprises / confusions / repetitions', () => {
    const prompt = buildGuidedStudySystemPrompt({ mode: 'deep', ...FULL_INPUT });
    expect(prompt).toContain('Surprises: God evaluates the work as good.');
    expect(prompt).toContain('Confusions: What does "groaning" mean?');
    expect(prompt).toContain('Repetitions noticed: "In Christ" / "the Spirit".');
  });

  it('teaching interpolates audience / setting / main point / clarification', () => {
    const prompt = buildGuidedStudySystemPrompt({ mode: 'teaching', ...FULL_INPUT });
    expect(prompt).toContain('teaching to: College small group');
    expect(prompt).toContain('Setting: small group');
    expect(prompt).toContain('main point: Order from chaos by speech.');
    expect(prompt).toContain("might get wrong: It isn't a science manual.");
  });

  it('devotional interpolates arrival + word/phrase meeting them', () => {
    const prompt = buildGuidedStudySystemPrompt({ mode: 'devotional', ...FULL_INPUT });
    expect(prompt).toContain('carrying: Anxious about a hard week.');
    expect(prompt).toContain('meeting them: No condemnation language.');
  });

  it('every mode produces a distinct prompt string', () => {
    const set = new Set(
      MODES.map((mode) => buildGuidedStudySystemPrompt({ mode, ...FULL_INPUT })),
    );
    expect(set.size).toBe(MODES.length);
  });
});

describe('buildGuidedStudySystemPrompt — graceful empty handling', () => {
  it.each(MODES)(
    '%s never leaks "undefined" when captured fields are absent',
    (mode) => {
      const prompt = buildGuidedStudySystemPrompt({
        mode,
        chapterRef: 'Genesis 1',
        captured: {},
        panelsOpened: [],
        modeSpecificContext: {},
      });
      expect(prompt).not.toContain('undefined');
      expect(prompt).not.toContain('null');
      // Empty fields render as the canonical placeholder
      expect(prompt).toContain('(not provided)');
    },
  );

  // Quick / deep / teaching include a panels-opened line; devotional
  // intentionally does not (no scholar attribution by default).
  it.each(['quick', 'deep', 'teaching'] as const)(
    '%s renders the canonical placeholder when no panels were opened',
    (mode) => {
      const prompt = buildGuidedStudySystemPrompt({
        mode,
        chapterRef: 'Genesis 1',
        captured: {},
        panelsOpened: [],
        modeSpecificContext: {},
      });
      expect(prompt).toContain('(no panels opened)');
    },
  );

  it('devotional has no panels-opened line at all (contemplative path)', () => {
    const prompt = buildGuidedStudySystemPrompt({
      mode: 'devotional',
      chapterRef: 'Psalm 23',
      captured: {},
      panelsOpened: [
        { panel_type: 'hist', section_num: 1, opened_at_ms: 100 },
      ],
      modeSpecificContext: {},
    });
    expect(prompt).not.toMatch(/panels(?: opened)?:/i);
  });

  it('whitespace-only fields are treated as empty', () => {
    const prompt = buildGuidedStudySystemPrompt({
      mode: 'quick',
      chapterRef: 'Genesis 1',
      captured: { scene: { genre_response: '   ' }, observe: { primary: '\n\t' } },
      panelsOpened: [],
      modeSpecificContext: {},
    });
    expect(prompt).toContain('"What\'s happening": (not provided)');
    expect(prompt).toContain('"One thing to remember": (not provided)');
  });
});

describe('panel summary formatting', () => {
  it('deduplicates same-section/same-type opens; preserves first-open ordering', () => {
    const prompt = buildGuidedStudySystemPrompt({
      mode: 'deep',
      chapterRef: 'Romans 8',
      captured: {},
      panelsOpened: [
        { panel_type: 'hist', section_num: 1, opened_at_ms: 100 },
        { panel_type: 'cross', opened_at_ms: 200 },
        { panel_type: 'hist', section_num: 1, opened_at_ms: 300 },
        { panel_type: 'debate', opened_at_ms: 50 },
      ],
      modeSpecificContext: {},
    });
    // Sorted by opened_at_ms ascending: debate (50), hist@1 (100), cross (200),
    // then dedup of hist@1.
    expect(prompt).toContain('debate, hist (section 1), cross');
  });
});

describe('snapshot stability per mode', () => {
  it.each(MODES)('%s prompt snapshot', (mode) => {
    expect(buildGuidedStudySystemPrompt({ mode, ...FULL_INPUT })).toMatchSnapshot();
  });
});
