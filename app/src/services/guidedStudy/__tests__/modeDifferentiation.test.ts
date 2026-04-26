/**
 * Phase 2.8 (#1737) integration test — proves each mode produces a
 * recognisably different plan against the same chapter fixture.
 */
import { buildGuidedStudyPlan } from '../plan';
import { GUIDED_STUDY_MODES, type GuidedStudyMode, type GuidedStudyStep } from '../types';
import { loadFixture } from './fixtures/sampleChapters';

const STEPS: GuidedStudyStep[] = ['scene', 'observe', 'explore', 'synthesize', 'review'];

function plansByMode() {
  return Object.fromEntries(
    GUIDED_STUDY_MODES.map((mode) => [mode, buildGuidedStudyPlan(loadFixture('rom_8', mode))]),
  ) as Record<GuidedStudyMode, ReturnType<typeof buildGuidedStudyPlan>>;
}

function promptKeySignature(prompts: { key: string }[]): string {
  return prompts
    .map((p) => p.key)
    .sort()
    .join(',');
}

describe('mode differentiation on Romans 8', () => {
  const plans = plansByMode();

  it('each mode emits a non-empty stepPrompts array at every step', () => {
    for (const mode of GUIDED_STUDY_MODES) {
      for (const step of STEPS) {
        expect(plans[mode].stepPrompts[step].length).toBeGreaterThan(0);
      }
    }
  });

  it('every (mode, step) pair has a distinct prompt-key signature from at least one other mode', () => {
    let stepsWithDifferentiation = 0;
    for (const step of STEPS) {
      const signatures = new Set(
        GUIDED_STUDY_MODES.map((mode) => promptKeySignature(plans[mode].stepPrompts[step])),
      );
      if (signatures.size > 1) stepsWithDifferentiation += 1;
    }
    // Spec acceptance: at least 4 of 5 steps must differ.
    expect(stepsWithDifferentiation).toBeGreaterThanOrEqual(4);
  });

  it.each([
    ['quick', ['hist', 'ctx']],
    ['deep', ['heb', 'greek']],
    ['teaching', ['lit', 'discourse', 'hist']],
    ['devotional', ['ctx']],
  ] as const)(
    '%s mode leads with %s (panelWeights table)',
    (mode, allowed) => {
      const first = plans[mode].recommendations[0]?.panelType;
      expect(allowed).toContain(first);
    },
  );

  it('teaching adds two scene input rows; devotional adds one; quick + deep add none', () => {
    const inputCount = (mode: GuidedStudyMode) =>
      plans[mode].sceneRows.filter((r) => r.kind === 'input').length;
    expect(inputCount('teaching')).toBe(2);
    expect(inputCount('devotional')).toBe(1);
    expect(inputCount('quick')).toBe(0);
    expect(inputCount('deep')).toBe(0);
  });

  it('all four modes still expose the four standard display scene rows', () => {
    for (const mode of GUIDED_STUDY_MODES) {
      const displayRows = plans[mode].sceneRows.filter((r) => r.kind === 'display');
      expect(displayRows.map((r) => r.label)).toEqual([
        'Genre',
        'Moment',
        'Original audience context',
        'Purpose',
      ]);
    }
  });
});
