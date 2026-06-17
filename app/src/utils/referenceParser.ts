/**
 * utils/referenceParser.ts — Extract embedded scripture references from text.
 *
 * Given a block of prose (e.g., commentary note), finds all embedded
 * scripture references and returns their positions for auto-linking.
 */

import { getBookByName } from './verseResolver';

export interface ExtractedRef {
  ref: string;
  start: number;
  end: number;
}

// Pattern: optional "cf." / "See" prefix + book name (with optional number prefix) + chapter:verse
// Examples: "Genesis 3:15", "cf. Rom 8:28-30", "1 Cor 13:4–7", "Ps 23", "Isa 53:4–6"
// Group 1 captures the (possibly empty) prefix so reference offsets can be
// computed exactly from its length rather than via fragile re-replacement.
const REF_PATTERN =
  /((?:cf\.\s*|[Ss]ee\s+)?)(\d?\s*[A-Z][a-z][a-z .]+?)\s+(\d+)(?::(\d+)(?:\s*[-–—]\s*(?:\d+:)?(\d+))?)?/g;

/**
 * Extract all scripture references from a block of text.
 * Returns positions for auto-linking by TappableReference component.
 */
export function extractReferences(text: string): ExtractedRef[] {
  const results: ExtractedRef[] = [];
  let match: RegExpExecArray | null;

  // Reset lastIndex for global regex
  REF_PATTERN.lastIndex = 0;

  while ((match = REF_PATTERN.exec(text)) !== null) {
    const prefix = match[1] ?? '';
    const bookStr = match[2].trim();
    const book = getBookByName(bookStr);
    if (!book) continue;

    // Validate chapter number is reasonable
    const chapter = parseInt(match[3], 10);
    if (chapter < 1 || chapter > book.chapters) continue;

    // Strip the prefix and any whitespace the book group's leading \s* captured,
    // adjusting the start offset so [start, end) maps exactly to `ref`.
    const body = match[0].slice(prefix.length);
    const leadingWs = body.length - body.trimStart().length;
    const ref = body.trim();
    const start = match.index + prefix.length + leadingWs;
    results.push({
      ref,
      start,
      end: start + ref.length,
    });
  }

  return results;
}
