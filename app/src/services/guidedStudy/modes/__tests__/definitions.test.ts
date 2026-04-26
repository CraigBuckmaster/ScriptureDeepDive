import { GUIDED_STUDY_MODES, type GuidedStudyMode } from '../../types';
import { MODE_DEFINITIONS, getModeDefinition } from '../definitions';

// Hardcoded current-behavior values (Phase 1 parity). If you change these, you
// are changing observable behavior — make sure that is intentional.
const EXPECTED_RECOMMENDATION_LIMIT: Record<GuidedStudyMode, number> = {
  quick: 3,
  deep: 5,
  teaching: 5,
  devotional: 3,
};

const EXPECTED_TRAIL_ORDER: Record<GuidedStudyMode, readonly string[]> = {
  quick: ['context', 'language', 'scripture'],
  deep: ['context', 'language', 'scripture', 'debate'],
  teaching: ['context', 'structure', 'scripture', 'debate'],
  devotional: ['context', 'scripture', 'language'],
};

describe('MODE_DEFINITIONS', () => {
  it('covers exactly the four GUIDED_STUDY_MODES keys', () => {
    const keys = Object.keys(MODE_DEFINITIONS).sort();
    const expected = [...GUIDED_STUDY_MODES].sort();
    expect(keys).toEqual(expected);
  });

  it.each(GUIDED_STUDY_MODES)(
    '%s recommendationLimit matches current MODE_RECOMMENDATION_LIMIT',
    (mode) => {
      expect(MODE_DEFINITIONS[mode].recommendationLimit).toBe(
        EXPECTED_RECOMMENDATION_LIMIT[mode],
      );
    },
  );

  it.each(GUIDED_STUDY_MODES)(
    '%s trailOrder matches current MODE_TRAIL_ORDER',
    (mode) => {
      expect([...MODE_DEFINITIONS[mode].trailOrder]).toEqual(EXPECTED_TRAIL_ORDER[mode]);
    },
  );

  it.each(GUIDED_STUDY_MODES)('%s has a non-empty marketingPromise', (mode) => {
    expect(MODE_DEFINITIONS[mode].marketingPromise.trim().length).toBeGreaterThan(0);
  });

  it.each(GUIDED_STUDY_MODES)('%s has non-empty panelWeights after Phase 2.4', (mode) => {
    const weights = MODE_DEFINITIONS[mode].panelWeights;
    expect(Object.keys(weights).length).toBeGreaterThan(0);
  });

  it('quick mode prefers context + cross-references and deprioritizes technical panels', () => {
    const quick = MODE_DEFINITIONS.quick.panelWeights;
    expect(quick.hist).toBeGreaterThan(0);
    expect(quick.ctx).toBeGreaterThan(0);
    expect(quick.cross).toBeGreaterThan(0);
    expect(quick.heb ?? 0).toBeLessThan(0);
    expect(quick.greek ?? 0).toBeLessThan(0);
    expect(quick.debate ?? 0).toBeLessThan(0);
  });

  it('deep mode prefers original-language and structural panels', () => {
    const deep = MODE_DEFINITIONS.deep.panelWeights;
    expect(deep.heb).toBeGreaterThan(deep.com ?? 0);
    expect(deep.greek).toBeGreaterThan(deep.com ?? 0);
    expect(deep.lit).toBeGreaterThan(deep.com ?? 0);
  });

  it('teaching mode leads with literary structure', () => {
    const teaching = MODE_DEFINITIONS.teaching.panelWeights;
    const lit = teaching.lit ?? 0;
    for (const [type, weight] of Object.entries(teaching)) {
      if (type === 'lit') continue;
      expect(weight).toBeLessThanOrEqual(lit);
    }
  });

  it('devotional mode leads with context and canonical echoes; pushes technical panels below zero', () => {
    const devotional = MODE_DEFINITIONS.devotional.panelWeights;
    expect(devotional.ctx).toBeGreaterThan(0);
    expect(devotional.cross).toBeGreaterThan(0);
    expect(devotional.com).toBeGreaterThan(0);
    expect(devotional.heb ?? 0).toBeLessThan(0);
    expect(devotional.greek ?? 0).toBeLessThan(0);
    expect(devotional.tx ?? 0).toBeLessThan(0);
  });

  it.each(GUIDED_STUDY_MODES)(
    '%s has at least one prompt at every step after Phase 2.1',
    (mode) => {
      const def = MODE_DEFINITIONS[mode];
      for (const [stepKey, step] of Object.entries(def.steps)) {
        expect(step.prompts.length).toBeGreaterThan(0);
        for (const prompt of step.prompts) {
          expect(prompt.key).toMatch(new RegExp(`^${mode}-${stepKey}-`));
          expect(prompt.text.trim().length).toBeGreaterThan(0);
        }
      }
    },
  );

  it('exposes all five guided-study steps per mode', () => {
    const expectedSteps = ['scene', 'observe', 'explore', 'synthesize', 'review'].sort();
    for (const mode of GUIDED_STUDY_MODES) {
      expect(Object.keys(MODE_DEFINITIONS[mode].steps).sort()).toEqual(expectedSteps);
    }
  });
});

describe('getModeDefinition', () => {
  it.each(GUIDED_STUDY_MODES)('returns the definition for %s', (mode) => {
    expect(getModeDefinition(mode)).toBe(MODE_DEFINITIONS[mode]);
  });

  it('falls back to deep for unknown keys (matches normalizeMode behavior)', () => {
    expect(getModeDefinition('garbage' as GuidedStudyMode)).toBe(MODE_DEFINITIONS.deep);
  });
});
