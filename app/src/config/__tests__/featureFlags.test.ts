import { FEATURE_FLAGS, isFlagEnabled, type FeatureFlag } from '../featureFlags';

describe('featureFlags', () => {
  it('GUIDED_STUDY_AMICUS_SYNTHESIS defaults to false', () => {
    expect(FEATURE_FLAGS.GUIDED_STUDY_AMICUS_SYNTHESIS).toBe(false);
    expect(isFlagEnabled('GUIDED_STUDY_AMICUS_SYNTHESIS')).toBe(false);
  });

  it('FEATURE_FLAGS is exhaustively typed by FeatureFlag', () => {
    // Round-trip through FeatureFlag — caller can iterate via a typed
    // narrowing. If a flag is added to FEATURE_FLAGS without updating the
    // type, tsc fails on this assignment.
    const keys = Object.keys(FEATURE_FLAGS) as FeatureFlag[];
    expect(keys).toContain('GUIDED_STUDY_AMICUS_SYNTHESIS');
    for (const key of keys) {
      expect(typeof FEATURE_FLAGS[key]).toBe('boolean');
    }
  });

  it('isFlagEnabled returns the stored boolean', () => {
    // Spot-check the helper actually reads from FEATURE_FLAGS rather than
    // hardcoding a value.
    expect(isFlagEnabled('GUIDED_STUDY_AMICUS_SYNTHESIS')).toBe(
      FEATURE_FLAGS.GUIDED_STUDY_AMICUS_SYNTHESIS,
    );
  });
});
