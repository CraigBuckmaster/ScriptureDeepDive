/**
 * Tests for theme/typography.ts.
 */
import { fontFamily, typography, scaledTypography } from '@/theme/typography';

describe('typography', () => {
  describe('fontFamily', () => {
    it('has display font families', () => {
      expect(fontFamily.display).toBe('Cinzel_400Regular');
      expect(fontFamily.displayMedium).toBe('Cinzel_500Medium');
      expect(fontFamily.displaySemiBold).toBe('Cinzel_600SemiBold');
    });

    it('has body font families', () => {
      expect(fontFamily.body).toBe('EBGaramond_400Regular');
      expect(fontFamily.bodyItalic).toBe('EBGaramond_400Regular_Italic');
    });

    it('has UI font families', () => {
      expect(fontFamily.ui).toBe('SourceSans3_400Regular');
      expect(fontFamily.uiMedium).toBe('SourceSans3_500Medium');
    });
  });

  describe('typography presets', () => {
    it('has display presets', () => {
      expect(typography.displayLg.fontSize).toBe(22);
      expect(typography.displayMd.fontSize).toBe(16);
      expect(typography.displaySm.fontSize).toBe(12);
    });

    it('has body presets', () => {
      expect(typography.bodyLg.fontSize).toBe(18);
      expect(typography.bodyMd.fontSize).toBe(16);
      expect(typography.bodySm.fontSize).toBe(14);
    });

    it('has UI presets', () => {
      expect(typography.uiLg.fontSize).toBe(16);
      expect(typography.uiMd.fontSize).toBe(14);
      expect(typography.uiSm.fontSize).toBe(12);
    });
  });

  describe('scaledTypography', () => {
    it('scales font sizes', () => {
      const scaled = scaledTypography(2);
      expect(scaled.displayLg.fontSize).toBe(44); // 22 * 2
      expect(scaled.bodyMd.fontSize).toBe(32); // 16 * 2
      expect(scaled.uiSm.fontSize).toBe(24); // 12 * 2
    });

    it('scales line heights', () => {
      const scaled = scaledTypography(1.5);
      expect(scaled.displayLg.lineHeight).toBe(45); // Math.round(30 * 1.5)
    });

    it('returns all presets', () => {
      const scaled = scaledTypography(1);
      expect(Object.keys(scaled)).toContain('displayLg');
      expect(Object.keys(scaled)).toContain('bodyMd');
      expect(Object.keys(scaled)).toContain('uiSm');
    });

    it('handles scale of 1 (identity)', () => {
      const scaled = scaledTypography(1);
      expect(scaled.displayLg.fontSize).toBe(22);
      expect(scaled.displayLg.lineHeight).toBe(30);
    });
  });
});
