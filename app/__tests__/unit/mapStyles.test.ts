import { ancientMapStyle, modernMapStyle } from '@/utils/mapStyles';

describe('mapStyles', () => {
  it('ancientMapStyle is a non-empty array', () => {
    expect(Array.isArray(ancientMapStyle)).toBe(true);
    expect(ancientMapStyle.length).toBeGreaterThan(0);
  });

  it('modernMapStyle is a non-empty array', () => {
    expect(Array.isArray(modernMapStyle)).toBe(true);
    expect(modernMapStyle.length).toBeGreaterThan(0);
  });

  it('style rules have expected structure', () => {
    for (const rule of ancientMapStyle) {
      expect(rule).toHaveProperty('stylers');
      expect(Array.isArray(rule.stylers)).toBe(true);
    }
  });

  it('ancient style hides modern labels', () => {
    const labelRules = ancientMapStyle.filter(
      (r) => r.elementType === 'labels' || r.elementType === 'labels.text',
    );
    expect(labelRules.length).toBeGreaterThan(0);
  });
});
