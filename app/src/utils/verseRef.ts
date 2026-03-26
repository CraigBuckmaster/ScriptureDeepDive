/**
 * utils/verseRef.ts — Canonical verse reference format.
 *
 * Format: "{bookId} {ch}:{v}" — e.g., "genesis 1:3"
 * Chapter prefix for LIKE queries: "genesis 1:" (matches all verses in chapter)
 *
 * This is the single source of truth for verse reference formatting.
 * All features (notes, bookmarks, highlights) MUST use these functions
 * to construct and parse verse refs. Never build ref strings inline.
 */

/**
 * Build a canonical verse reference string.
 * With verse:   "genesis 1:3"
 * Without verse: "genesis 1" (chapter-level note)
 */
export function formatVerseRef(bookId: string, ch: number, v?: number): string {
  return v ? `${bookId} ${ch}:${v}` : `${bookId} ${ch}`;
}

/**
 * Build a LIKE-compatible prefix for querying all refs in a chapter.
 * Returns "genesis 1:" — append "%" for LIKE matching.
 */
export function chapterPrefix(bookId: string, ch: number): string {
  return `${bookId} ${ch}:`;
}

/**
 * Parse a canonical ref string back into parts.
 * "genesis 1:3" → { bookId: "genesis", ch: 1, v: 3 }
 * "genesis 1"   → { bookId: "genesis", ch: 1, v: undefined }
 * Returns null if the format is unrecognized.
 */
export function parseVerseRef(ref: string): { bookId: string; ch: number; v?: number } | null {
  // Full ref with verse: "genesis 1:3" or "1_samuel 10:5"
  const full = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (full) {
    return { bookId: full[1], ch: parseInt(full[2], 10), v: parseInt(full[3], 10) };
  }

  // Chapter-level ref: "genesis 1"
  const chOnly = ref.match(/^(.+?)\s+(\d+)$/);
  if (chOnly) {
    return { bookId: chOnly[1], ch: parseInt(chOnly[2], 10) };
  }

  return null;
}

/**
 * Extract just the verse number from a ref string.
 * "genesis 1:3" → 3
 * Returns null if no verse number found.
 */
export function extractVerseNum(ref: string): number | null {
  const m = ref.match(/:(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Format a stored ref for human display.
 * "genesis 1:3" → "Genesis 1:3"
 * "song_of_solomon 4:7" → "Song Of Solomon 4:7"
 */
export function displayRef(ref: string): string {
  const parsed = parseVerseRef(ref);
  if (!parsed) return ref;

  const bookName = parsed.bookId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return parsed.v
    ? `${bookName} ${parsed.ch}:${parsed.v}`
    : `${bookName} ${parsed.ch}`;
}
