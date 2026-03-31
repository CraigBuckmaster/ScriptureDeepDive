/**
 * transforms.ts — HSL color transform utilities for theme palette generation.
 *
 * Pure functions that programmatically shift panel, scholar, and era colors
 * per theme mode. Used by palettes.ts to generate sepia/light variants
 * from the dark (canonical) color values.
 */

import type { PanelColors } from './colors';

type ThemeMode = 'dark' | 'sepia' | 'light';

/**
 * Convert a hex color string to HSL components.
 * Returns [hue (0-360), saturation (0-100), lightness (0-100)].
 */
export function hexToHSL(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l * 100];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL components back to a hex color string.
 * h: 0-360, s: 0-100, l: 0-100.
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;
  const hNorm = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r: number, g: number, b: number;
  if (hNorm < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hNorm < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hNorm < 180) {
    [r, g, b] = [0, c, x];
  } else if (hNorm < 240) {
    [r, g, b] = [0, x, c];
  } else if (hNorm < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (v: number) => {
    const val = Math.round((v + m) * 255);
    return Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Transform a panel's {bg, border, accent} colors for a given theme mode.
 *
 * - dark: identity (return as-is)
 * - sepia: bg -> lighten to ~92% luminance + warm hue shift, border -> lighten to ~75%, accent -> darken 15%
 * - light: bg -> lighten to ~96%, border -> lighten to ~82%, accent -> darken 25%
 */
export function transformPanelColors(panel: PanelColors, mode: ThemeMode): PanelColors {
  if (mode === 'dark') return panel;

  const [bgH, bgS] = hexToHSL(panel.bg);
  const [borderH, borderS] = hexToHSL(panel.border);
  const [accentH, accentS, accentL] = hexToHSL(panel.accent);

  if (mode === 'sepia') {
    return {
      bg: hslToHex(bgH + 10, bgS * 0.6, 92),
      border: hslToHex(borderH + 10, borderS * 0.5, 75),
      accent: hslToHex(accentH, accentS, Math.max(0, accentL - 15)),
    };
  }

  // light
  return {
    bg: hslToHex(bgH, bgS * 0.3, 96),
    border: hslToHex(borderH, borderS * 0.3, 82),
    accent: hslToHex(accentH, accentS, Math.max(0, accentL - 25)),
  };
}

/**
 * Transform a single accent color (scholar or era) for a given theme mode.
 *
 * - dark: identity
 * - sepia: darken 20%, increase saturation 10%
 * - light: darken 30%, increase saturation 15%
 */
export function transformAccentColor(hex: string, mode: ThemeMode): string {
  if (mode === 'dark') return hex;

  const [h, s, l] = hexToHSL(hex);

  if (mode === 'sepia') {
    return hslToHex(h, Math.min(100, s + 10), Math.max(0, l - 20));
  }

  // light
  return hslToHex(h, Math.min(100, s + 15), Math.max(0, l - 30));
}
