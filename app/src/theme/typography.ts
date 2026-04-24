/**
 * typography.ts — Font families, weights, and named presets.
 *
 * Three font families:
 *   Display: Cinzel        — headings, section titles, panel labels
 *   Body:    EB Garamond   — verse text, bios, commentary, reading
 *   UI:      Source Sans 3  — navigation, search, badges, buttons
 */

import {
  MAX_CHROME_SCALE,
  MAX_CONTENT_SCALE,
  READING_SCALE_DEFAULT,
} from './scale';

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

export type TypographyMap = Record<keyof typeof presets, TypographyPreset>;

export interface BuiltTypography {
  content: TypographyMap;
  chrome: TypographyMap;
  effective: { content: number; chrome: number };
}

// ── Dynamic Type scaling ────────────────────────────────────────────

/** @deprecated Unused — kept for PR 2 migration, removed in PR 3. */
export function scaledTypography(scale: number): TypographyMap {
  const result = {} as TypographyMap;
  for (const [key, preset] of Object.entries(presets) as [keyof typeof presets, TypographyPreset][]) {
    result[key] = {
      ...preset,
      fontSize: Math.round(preset.fontSize * scale),
      lineHeight: preset.lineHeight ? Math.round(preset.lineHeight * scale) : undefined,
    };
  }
  return result;
}

function applyScale(factor: number): TypographyMap {
  const result = {} as TypographyMap;
  for (const [key, preset] of Object.entries(presets) as [keyof typeof presets, TypographyPreset][]) {
    result[key] = {
      ...preset,
      fontSize: Math.round(preset.fontSize * factor),
      lineHeight: preset.lineHeight ? Math.round(preset.lineHeight * factor) : undefined,
    };
  }
  return result;
}

/**
 * Build the typography map for a given OS font scale and in-app reading
 * scale. Returns two full preset copies plus the effective numeric scales:
 *
 *   content = min(osScale × readingScale, MAX_CONTENT_SCALE)
 *   chrome  = min(osScale,               MAX_CHROME_SCALE)
 *
 * Non-finite inputs fall back to 1.0 so a corrupt preference can't
 * collapse the UI to NaN sizes.
 */
export function buildTypography(osScale: number, readingScale: number): BuiltTypography {
  const safeOs = Number.isFinite(osScale) ? osScale : 1;
  const safeReading = Number.isFinite(readingScale) ? readingScale : READING_SCALE_DEFAULT;

  const contentScale = Math.min(MAX_CONTENT_SCALE, safeOs * safeReading);
  const chromeScale = Math.min(MAX_CHROME_SCALE, safeOs);

  return {
    content: applyScale(contentScale),
    chrome: applyScale(chromeScale),
    effective: { content: contentScale, chrome: chromeScale },
  };
}
