/**
 * GospelColors — Canonical color constants for the Gospel identity system.
 *
 * These colors are used consistently across Harmony screens, GospelDots,
 * GospelPassageCards, and DiffAnnotations.
 */

export const GOSPEL_COLORS: Record<string, string> = {
  matthew: '#5b8def', // data-color: intentional (Matthew identity blue)
  mark: '#e8854a',    // data-color: intentional (Mark identity orange)
  luke: '#5cb85c',    // data-color: intentional (Luke identity green)
  john: '#b070d8',    // data-color: intentional (John identity purple)
};

export const GOSPEL_LABELS: Record<string, string> = {
  matthew: 'Matthew',
  mark: 'Mark',
  luke: 'Luke',
  john: 'John',
};

export const GOSPEL_SHORT: Record<string, string> = {
  matthew: 'M',
  mark: 'Mk',
  luke: 'L',
  john: 'J',
};

/**
 * Brighter dot/badge variants used by GospelDots and the Harmony/Parallel
 * detail screens — tuned for small indicators on dark surfaces, so they
 * deliberately diverge from GOSPEL_COLORS above.
 */
export const GOSPEL_DOT_COLORS: Record<string, string> = {
  matthew: '#70b8e8', // data-color: intentional (dot blue)
  mark: '#e86040',    // data-color: intentional (dot orange)
  luke: '#81C784',    // data-color: intentional (dot green)
  john: '#b090d0',    // data-color: intentional (dot purple)
};

/**
 * Diff annotation colors (Harmony DiffAnnotation cards) — part of the
 * Gospel identity system's comparison UI.
 */
export const DIFF_TYPE_COLORS: Record<string, string> = {
  addition: '#4a8c5c', // data-color: intentional
  omission: '#8c4a4a', // data-color: intentional
  reordering: '#8a6e1a', // data-color: intentional
  wording: '#8a6e1a', // data-color: intentional
  theological_emphasis: '#8a6e1a', // data-color: intentional
};

export const DIFF_TYPE_BG: Record<string, string> = {
  addition: '#4a8c5c22', // data-color: intentional
  omission: '#8c4a4a22', // data-color: intentional
  reordering: '#bfa05022', // data-color: intentional
  wording: '#bfa05022', // data-color: intentional
  theological_emphasis: '#bfa05022', // data-color: intentional
};

export const GOSPEL_ORDER = ['matthew', 'mark', 'luke', 'john'];

export function gospelColor(bookId: string): string {
  return GOSPEL_COLORS[bookId] ?? '#908878'; // data-color: intentional (neutral fallback for non-gospel books)
}
