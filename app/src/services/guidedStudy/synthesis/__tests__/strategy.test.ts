import { chooseStrategy } from '../strategy';
import { freeStrategy, buildFreeSynthesisBlocks, recapTitleFor } from '../freeStrategy';
import { premiumStructuredStrategy } from '../premiumStructuredStrategy';
import { premiumAmicusStrategy } from '../premiumAmicusStrategy';
import type { CapturedInputs } from '../../capturedInputs';
import type { GuidedStudyMode, GuidedStudyPlan } from '../../types';

function planFor(mode: GuidedStudyMode): GuidedStudyPlan {
  return {
    chapterId: 'gen_1',
    title: 'Genesis 1',
    mode,
    modeLabel: 'Mode',
    sceneRows: [],
    stepPrompts: { scene: [], observe: [], explore: [], synthesize: [], review: [] },
    legacyPrompts: [],
    recommendations: [],
    evidenceTrail: [],
    betterQuestionPrompt: '',
    conceptChips: [],
  };
}

describe('chooseStrategy', () => {
  it('returns the free strategy when isPremium is false', () => {
    const s = chooseStrategy({
      isPremium: false,
      amicusFlagEnabled: true,
      amicusCanUse: true,
    });
    expect(s).toBe(freeStrategy);
  });

  it('returns premium_amicus when premium + flag on + amicus access available', () => {
    const s = chooseStrategy({
      isPremium: true,
      amicusFlagEnabled: true,
      amicusCanUse: true,
    });
    expect(s).toBe(premiumAmicusStrategy);
  });

  it('falls back to premium_structured when the flag is off', () => {
    const s = chooseStrategy({
      isPremium: true,
      amicusFlagEnabled: false,
      amicusCanUse: true,
    });
    expect(s).toBe(premiumStructuredStrategy);
  });

  it('falls back to premium_structured when amicus access is unavailable', () => {
    const s = chooseStrategy({
      isPremium: true,
      amicusFlagEnabled: true,
      amicusCanUse: false,
    });
    expect(s).toBe(premiumStructuredStrategy);
  });
});

describe('freeStrategy.run', () => {
  it('returns kind=free with artifact=null', async () => {
    const result = await freeStrategy.run({
      plan: planFor('quick'),
      captured: {},
      sessionId: null,
      bookId: 'gen',
      chapterNum: 1,
    });
    expect(result.kind).toBe('free');
    expect(result.artifact).toBeNull();
  });

  it('emits an empty output array when nothing is captured', async () => {
    const result = await freeStrategy.run({
      plan: planFor('quick'),
      captured: {},
      sessionId: null,
      bookId: 'gen',
      chapterNum: 1,
    });
    expect(result.output).toEqual([]);
  });

  it('emits recap_section + cta + footer blocks in the expected order when captured', async () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', key_connection: 'B.', open_question: '' },
    };
    const result = await freeStrategy.run({
      plan: planFor('quick'),
      captured,
      sessionId: null,
      bookId: 'gen',
      chapterNum: 1,
    });
    const types = result.output.map((b) => b.type);
    // recap_sections come first, then both cta_buttons, then the footer note.
    expect(types).toEqual([
      'recap_section',
      'recap_section',
      'cta_button',
      'cta_button',
      'footer_note',
    ]);
  });

  it('hides recap_section blocks when their captured field is empty', async () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', key_connection: '', open_question: '' },
    };
    const result = await freeStrategy.run({
      plan: planFor('quick'),
      captured,
      sessionId: null,
      bookId: 'gen',
      chapterNum: 1,
    });
    const recapSections = result.output.filter((b) => b.type === 'recap_section');
    expect(recapSections).toHaveLength(1);
  });
});

describe('buildFreeSynthesisBlocks per mode', () => {
  it.each(['quick', 'deep', 'teaching', 'devotional'] as const)(
    '%s mode renders the mode-shaped recap title',
    (mode) => {
      const expected: Record<GuidedStudyMode, string> = {
        quick: 'Your Quick Pass',
        deep: 'Your Deep Study',
        teaching: 'Your Teaching Outline',
        devotional: 'Your Devotional',
      };
      expect(recapTitleFor(mode)).toBe(expected[mode]);
    },
  );

  it('teaching pulls from scene + observe + synthesize buckets', () => {
    const captured: CapturedInputs = {
      scene: { audience: 'small group', setting: 'small group' },
      observe: { main_point: 'main', clarification: 'clarify' },
      synthesize: {
        takeaway: 'outline',
        open_question: 'discuss?',
        key_connection: '',
      },
    };
    const blocks = buildFreeSynthesisBlocks('teaching', captured);
    const labels = blocks
      .filter((b): b is { type: 'recap_section'; label: string; content: string } => b.type === 'recap_section')
      .map((b) => b.label);
    expect(labels).toEqual([
      'Audience',
      'Setting',
      'Main point',
      'Clarification',
      'Outline',
      'Discussion question',
    ]);
  });
});

describe('premium strategies', () => {
  // premium_structured is implemented by #1740; round-trip covered in
  // premiumStructured.test.ts. Keep a smoke check on its kind here so the
  // strategy.ts switch never silently regresses.
  it('premium_structured reports its kind', () => {
    expect(premiumStructuredStrategy.kind).toBe('premium_structured');
  });

  it('premium_amicus throws not-implemented (filled in by #1745)', async () => {
    await expect(
      premiumAmicusStrategy.run({
        plan: planFor('deep'),
        captured: {},
        sessionId: null,
        bookId: 'gen',
        chapterNum: 1,
      }),
    ).rejects.toThrow(/not implemented/);
  });

  it('premium_amicus reports its kind', () => {
    expect(premiumAmicusStrategy.kind).toBe('premium_amicus');
  });
});
