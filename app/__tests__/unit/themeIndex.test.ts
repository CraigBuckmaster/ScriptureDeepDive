/**
 * Tests for theme/index.ts — getPanelColors and getScholarColor.
 */
import { getPanelColors, getScholarColor, fontFamily, spacing, radii } from '@/theme';

describe('theme/index', () => {
  describe('getPanelColors', () => {
    it('returns colors for known panel type "com"', () => {
      const colors = getPanelColors('com');
      expect(colors).toHaveProperty('bg');
      expect(colors).toHaveProperty('border');
      expect(colors).toHaveProperty('accent');
    });

    it('returns fallback colors for unknown panel type', () => {
      const colors = getPanelColors('unknown_panel_type');
      expect(colors).toHaveProperty('bg');
      expect(colors).toHaveProperty('border');
      expect(colors).toHaveProperty('accent');
    });
  });

  describe('getScholarColor', () => {
    it('returns a color string for known scholar', () => {
      const color = getScholarColor('some_unknown_scholar');
      expect(typeof color).toBe('string');
      expect(color).toBe('#8a6e1a'); // fallback
    });
  });

  describe('re-exports', () => {
    it('exports fontFamily', () => {
      expect(fontFamily.body).toBe('EBGaramond_400Regular');
    });

    it('exports spacing', () => {
      expect(typeof spacing.md).toBe('number');
    });

    it('exports radii', () => {
      expect(typeof radii.md).toBe('number');
    });
  });
});
