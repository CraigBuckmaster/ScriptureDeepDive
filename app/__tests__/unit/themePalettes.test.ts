import { buildPalette } from '@/theme/palettes';
import * as colors from '@/theme/colors';

describe('buildPalette', () => {
  it('builds dark palette with correct mode', () => {
    const palette = buildPalette('dark');
    expect(palette.mode).toBe('dark');
    expect(palette.statusBarStyle).toBe('light-content');
  });

  it('builds sepia palette with correct mode', () => {
    const palette = buildPalette('sepia');
    expect(palette.mode).toBe('sepia');
    expect(palette.statusBarStyle).toBe('dark-content');
  });

  it('builds light palette with correct mode', () => {
    const palette = buildPalette('light');
    expect(palette.mode).toBe('light');
    expect(palette.statusBarStyle).toBe('dark-content');
  });

  it('dark palette has expected base color keys', () => {
    const palette = buildPalette('dark');
    expect(palette.base.bg).toBe('#0c0a07');
    expect(palette.base.gold).toBe('#bfa050');
    expect(palette.base.text).toBe('#f0e8d8');
    expect(palette.base.danger).toBe('#e05a6a');
  });

  it('sepia and light palettes have different bg from dark', () => {
    const dark = buildPalette('dark');
    const sepia = buildPalette('sepia');
    const light = buildPalette('light');
    expect(sepia.base.bg).not.toBe(dark.base.bg);
    expect(light.base.bg).not.toBe(dark.base.bg);
    expect(sepia.base.bg).not.toBe(light.base.bg);
  });

  it('all palettes include required color sections', () => {
    for (const mode of ['dark', 'sepia', 'light'] as const) {
      const p = buildPalette(mode);
      expect(p.panels).toBeDefined();
      expect(p.scholars).toBeDefined();
      expect(p.eras).toBeDefined();
      expect(p.categoryColors).toBeDefined();
      expect(p.families).toBeDefined();
    }
  });

  it('categoryColors.event uses mode-specific gold', () => {
    const dark = buildPalette('dark');
    const sepia = buildPalette('sepia');
    expect(dark.categoryColors.event).toBe(dark.base.gold);
    expect(sepia.categoryColors.event).toBe(sepia.base.gold);
  });
});

describe('Theme legacy cleanup (#110)', () => {
  it('does NOT export static base from colors.ts', () => {
    expect((colors as any).base).toBeUndefined();
  });

  it('exports panels, scholars, eras from colors.ts', () => {
    expect(colors.panels).toBeDefined();
    expect(colors.scholars).toBeDefined();
    expect(colors.eras).toBeDefined();
  });
});
