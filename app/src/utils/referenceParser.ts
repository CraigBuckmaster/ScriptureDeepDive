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
const REF_PATTERN =
  /(?:cf\.\s*|[Ss]ee\s+)?(\d?\s*[A-Z][a-z][a-z .]+?)\s+(\d+)(?::(\d+)(?:\s*[-–—]\s*(?:\d+:)?(\d+))?)?/g;

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
    const bookStr = match[1].trim();
    const book = getBookByName(bookStr);
    if (!book) continue;

    // Validate chapter number is reasonable
    const chapter = parseInt(match[2], 10);
    if (chapter < 1 || chapter > book.chapters) continue;

    results.push({
      ref: match[0].replace(/^(?:cf\.\s*|[Ss]ee\s+)/, '').trim(),
      start: match.index + (match[0].length - match[0].replace(/^(?:cf\.\s*|[Ss]ee\s+)/, '').length),
      end: match.index + match[0].length,
    });
  }

  return results;
}
