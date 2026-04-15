/**
 * utils/refDetector.ts — Detect inline scripture references in text.
 *
 * Used by DictionaryDetailScreen to make references tappable within
 * definition text. Returns alternating text/ref segments.
 */

// Pattern for scripture references like "Gen. 1:3", "Matt 28:19", "1 Chr. 2:10"
const REF_PATTERN =
  /\b(\d?\s?(?:Sam|Ki|Chr|Cor|Thess|Tim|Pet|John|Gen|Ex|Lev|Num|Deut|Josh|Judg|Ruth|Ezra|Neh|Esth|Job|Ps|Prov|Eccl|Song|Isa|Jer|Lam|Ezek|Dan|Hos|Joel|Amos|Obad|Jonah|Mic|Nah|Hab|Zeph|Hag|Zech|Mal|Matt|Mark|Luke|Acts|Rom|Gal|Eph|Phil|Col|Tit|Philem|Heb|James|Jude|Rev)\.?\s+\d+(?::\d+(?:[,-]\d+)*)?)/gi;

export interface TextSegment {
  type: 'text' | 'ref';
  value: string;
}

/**
 * Split text into alternating text and scripture reference segments.
 * Ref segments can be rendered as tappable gold text.
 */
export function splitTextWithRefs(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(REF_PATTERN)) {
    const start = match.index!;
    const ref = match[0].trim().replace(/[.;,]+$/, '');

    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }
    segments.push({ type: 'ref', value: ref });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
