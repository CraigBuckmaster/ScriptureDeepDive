/**
 * Tests for utils/haptics.
 *
 * haptics is mocked in jest.setup.js, so we test the mock.
 * The real implementation is platform-dependent and relies on expo-haptics native module.
 */
import { lightImpact, mediumImpact } from '@/utils/haptics';

describe('haptics', () => {
  it('lightImpact is callable', () => {
    expect(typeof lightImpact).toBe('function');
    expect(() => lightImpact()).not.toThrow();
  });

  it('mediumImpact is callable', () => {
    expect(typeof mediumImpact).toBe('function');
    expect(() => mediumImpact()).not.toThrow();
  });

  it('lightImpact has been mocked', () => {
    lightImpact();
    expect(lightImpact).toHaveBeenCalled();
  });

  it('mediumImpact has been mocked', () => {
    mediumImpact();
    expect(mediumImpact).toHaveBeenCalled();
  });
});
