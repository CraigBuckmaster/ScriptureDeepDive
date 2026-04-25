import { buildGuidedStudyPlan } from '../plan';
import { GUIDED_STUDY_MODES, GUIDED_STUDY_STEPS } from '../types';
import { MODE_DEFINITIONS } from '../modes/definitions';
import { loadFixture } from './fixtures/sampleChapters';

describe('GuidedStudyPlan.stepPrompts', () => {
  it.each(GUIDED_STUDY_MODES)(
    '%s plan exposes all five steps with prompts identical to MODE_DEFINITIONS',
    (mode) => {
      const plan = buildGuidedStudyPlan(loadFixture('gen_1', mode));
      const def = MODE_DEFINITIONS[mode];

      for (const step of GUIDED_STUDY_STEPS) {
        expect(plan.stepPrompts[step]).toEqual(def.steps[step].prompts);
      }
    },
  );

  it('quick mode carries the verbatim prompt copy', () => {
    const plan = buildGuidedStudyPlan(loadFixture('gen_1', 'quick'));
    expect(plan.stepPrompts.scene.map((p) => p.text)).toEqual([
      "What kind of writing is this, and what's happening in this chapter?",
    ]);
    expect(plan.stepPrompts.observe.map((p) => p.text)).toEqual([
      "What's the one thing you'd want to remember from this chapter?",
    ]);
    expect(plan.stepPrompts.review.map((p) => p.text)).toEqual([
      'What verse or phrase will you carry with you today?',
    ]);
  });

  it('deep mode supplies three observe prompts (surprise, confusion, repetition)', () => {
    const plan = buildGuidedStudyPlan(loadFixture('gen_1', 'deep'));
    expect(plan.stepPrompts.observe).toHaveLength(3);
    expect(plan.stepPrompts.observe.map((p) => p.text)).toEqual([
      'What surprises you in this chapter?',
      'What confuses you or feels unresolved?',
      'What words, phrases, or ideas seem to repeat?',
    ]);
  });

  it('teaching mode supplies two scene prompts (audience + setting)', () => {
    const plan = buildGuidedStudyPlan(loadFixture('rom_8', 'teaching'));
    expect(plan.stepPrompts.scene).toHaveLength(2);
    expect(plan.stepPrompts.scene.map((p) => p.text)).toEqual([
      'Who are you teaching? What do they already know about this passage?',
      "What's the setting — sermon, small group, classroom, one-on-one?",
    ]);
  });

  it('teaching mode supplies two observe prompts (main point + clarification)', () => {
    const plan = buildGuidedStudyPlan(loadFixture('rom_8', 'teaching'));
    expect(plan.stepPrompts.observe).toHaveLength(2);
    expect(plan.stepPrompts.observe.map((p) => p.text)).toEqual([
      "What's the main point you'd want a listener to leave with?",
      "What would they get wrong if you didn't clarify it?",
    ]);
  });

  it('devotional mode prayer prompt appears at synthesize', () => {
    const plan = buildGuidedStudyPlan(loadFixture('psa_23', 'devotional'));
    expect(plan.stepPrompts.synthesize.map((p) => p.text)).toEqual([
      'What might God be saying? Pray it back in your own words.',
    ]);
  });

  it('legacyPrompts retains the genre + better-question pair', () => {
    const plan = buildGuidedStudyPlan(loadFixture('gen_1', 'quick'));
    expect(plan.legacyPrompts).toHaveLength(2);
    expect(plan.legacyPrompts.map((p) => p.key)).toEqual([
      'genre-observation',
      'better-question',
    ]);
  });

  it('every prompt key is unique across all (mode, step) combinations', () => {
    const seen = new Set<string>();
    for (const mode of GUIDED_STUDY_MODES) {
      for (const step of GUIDED_STUDY_STEPS) {
        for (const prompt of MODE_DEFINITIONS[mode].steps[step].prompts) {
          expect(seen.has(prompt.key)).toBe(false);
          seen.add(prompt.key);
        }
      }
    }
  });
});
