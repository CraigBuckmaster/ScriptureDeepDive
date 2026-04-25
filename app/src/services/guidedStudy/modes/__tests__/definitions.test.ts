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

  it.each(GUIDED_STUDY_MODES)(
    '%s has empty panelWeights and empty step prompts in Phase 1',
    (mode) => {
      const def = MODE_DEFINITIONS[mode];
      expect(def.panelWeights).toEqual({});
      for (const step of Object.values(def.steps)) {
        expect(step.prompts).toEqual([]);
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
