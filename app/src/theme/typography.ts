/**
 * typography.ts — Font families, weights, and named presets.
 *
 * Three font families:
 *   Display: Cinzel        — headings, section titles, panel labels
 *   Body:    EB Garamond   — verse text, bios, commentary, reading
 *   UI:      Source Sans 3  — navigation, search, badges, buttons
 */

// ── Font family names (must match the keys loaded via expo-font) ────

export const fontFamily = {
  display: 'Cinzel_400Regular',
  displayMedium: 'Cinzel_500Medium',
  displaySemiBold: 'Cinzel_600SemiBold',

  body: 'EBGaramond_400Regular',
  bodyMedium: 'EBGaramond_500Medium',
  bodySemiBold: 'EBGaramond_600SemiBold',
  bodyItalic: 'EBGaramond_400Regular_Italic',
  bodyMediumItalic: 'EBGaramond_500Medium_Italic',

  ui: 'SourceSans3_400Regular',
  uiLight: 'SourceSans3_300Light',
  uiMedium: 'SourceSans3_500Medium',
  uiSemiBold: 'SourceSans3_600SemiBold',
} as const;

// ── Named presets ───────────────────────────────────────────────────

export interface TypographyPreset {
  fontFamily: string;
  fontSize: number;
  lineHeight?: number;
  letterSpacing?: number;
}

const presets = {
  // Display (Cinzel)
  displayLg: { fontFamily: fontFamily.displaySemiBold, fontSize: 22, lineHeight: 30, letterSpacing: 0.5 },
  displayMd: { fontFamily: fontFamily.displayMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0.3 },
  displaySm: { fontFamily: fontFamily.display, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },

  // Body (EB Garamond)
  bodyLg: { fontFamily: fontFamily.body, fontSize: 18, lineHeight: 30 },
  bodyMd: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 26 },
  bodySm: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22 },
  bodyItalic: { fontFamily: fontFamily.bodyItalic, fontSize: 16, lineHeight: 26 },
  bodyBold: { fontFamily: fontFamily.bodySemiBold, fontSize: 16, lineHeight: 26 },

  // UI (Source Sans 3)
  uiLg: { fontFamily: fontFamily.uiMedium, fontSize: 16, lineHeight: 22 },
  uiMd: { fontFamily: fontFamily.ui, fontSize: 14, lineHeight: 20 },
  uiSm: { fontFamily: fontFamily.ui, fontSize: 12, lineHeight: 16 },
  uiBold: { fontFamily: fontFamily.uiSemiBold, fontSize: 14, lineHeight: 20 },
} as const;

export { presets as typography };

// ── Dynamic Type scaling ────────────────────────────────────────────

export function scaledTypography(scale: number): Record<keyof typeof presets, TypographyPreset> {
  const result = {} as Record<keyof typeof presets, TypographyPreset>;
  for (const [key, preset] of Object.entries(presets) as [keyof typeof presets, TypographyPreset][]) {
    result[key] = {
      ...preset,
      fontSize: Math.round(preset.fontSize * scale),
      lineHeight: preset.lineHeight ? Math.round(preset.lineHeight * scale) : undefined,
    };
  }
  return result;
}
