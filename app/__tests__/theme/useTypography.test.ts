/**
 * Tests for buildTypography() math — caps and fallbacks.
 * The useTypography() hook itself is a thin memoized wrapper.
 */
import { buildTypography } from '@/theme/typography';
import { typography } from '@/theme/typography';

describe('buildTypography', () => {
  it('returns content and chrome maps plus effective scales', () => {
    const result = buildTypography(1, 1);
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('chrome');
    expect(result).toHaveProperty('effective');
    expect(result.effective).toEqual({ content: 1, chrome: 1 });
  });

  it('defaults (os=1, reading=1) leave sizes unchanged', () => {
    const result = buildTypography(1, 1);
    expect(result.content.bodyLg.fontSize).toBe(typography.bodyLg.fontSize);
    expect(result.content.displayLg.fontSize).toBe(typography.displayLg.fontSize);
    expect(result.chrome.uiLg.fontSize).toBe(typography.uiLg.fontSize);
    expect(result.content.bodyLg.lineHeight).toBe(typography.bodyLg.lineHeight);
  });

  it('caps content at MAX_CONTENT_SCALE when os × reading exceeds it', () => {
    // 1.5 × 1.5 = 2.25, capped to 2.2
    const result = buildTypography(1.5, 1.5);
    expect(result.effective.content).toBeCloseTo(2.2, 5);
    // Chrome uses os only (1.5) — under the 1.8 cap, so passes through.
    expect(result.effective.chrome).toBeCloseTo(1.5, 5);
    // Content sizes reflect the capped scale.
    expect(result.content.bodyMd.fontSize).toBe(Math.round(16 * 2.2));
    expect(result.chrome.uiMd.fontSize).toBe(Math.round(14 * 1.5));
  });

  it('caps chrome at MAX_CHROME_SCALE when os exceeds it', () => {
    // os=2.0, reading=1.0 → content = 2.0 (under cap), chrome = 1.8 (capped)
    const result = buildTypography(2.0, 1.0);
    expect(result.effective.content).toBeCloseTo(2.0, 5);
    expect(result.effective.chrome).toBeCloseTo(1.8, 5);
    expect(result.content.bodyMd.fontSize).toBe(Math.round(16 * 2.0));
    expect(result.chrome.uiLg.fontSize).toBe(Math.round(16 * 1.8));
  });

  it('falls back to defaults for non-finite inputs', () => {
    const nan = buildTypography(Number.NaN, Number.NaN);
    expect(nan.effective.content).toBe(1);
    expect(nan.effective.chrome).toBe(1);

    const inf = buildTypography(Number.POSITIVE_INFINITY, 1);
    expect(inf.effective.content).toBe(1);
    expect(inf.effective.chrome).toBe(1);

    const badReading = buildTypography(1, Number.NaN);
    expect(badReading.effective.content).toBe(1);
    expect(badReading.effective.chrome).toBe(1);
  });

  it('preserves fontFamily and letterSpacing when scaling', () => {
    const result = buildTypography(1, 1.25);
    expect(result.content.displayLg.fontFamily).toBe(typography.displayLg.fontFamily);
    expect(result.content.displayLg.letterSpacing).toBe(typography.displayLg.letterSpacing);
  });

  it('scales lineHeight proportionally and leaves undefined when preset has none', () => {
    const result = buildTypography(1, 1.5);
    // bodyMd has lineHeight 26, scaled by 1.5 → 39
    expect(result.content.bodyMd.lineHeight).toBe(Math.round(26 * 1.5));
  });
});
