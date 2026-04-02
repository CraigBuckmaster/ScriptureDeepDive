/**
 * GospelColors — Canonical color constants for the Gospel identity system.
 *
 * These colors are used consistently across Harmony screens, GospelDots,
 * GospelPassageCards, and DiffAnnotations.
 */

export const GOSPEL_COLORS: Record<string, string> = {
  matthew: '#5b8def',
  mark: '#e8854a',
  luke: '#5cb85c',
  john: '#b070d8',
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

export const GOSPEL_ORDER = ['matthew', 'mark', 'luke', 'john'];

export function gospelColor(bookId: string): string {
  return GOSPEL_COLORS[bookId] ?? '#908878';
}
