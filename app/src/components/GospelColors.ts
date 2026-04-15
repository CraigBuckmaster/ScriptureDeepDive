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

export const GOSPEL_ORDER = ['matthew', 'mark', 'luke', 'john'];

export function gospelColor(bookId: string): string {
  return GOSPEL_COLORS[bookId] ?? '#908878'; // data-color: intentional (neutral fallback for non-gospel books)
}
