/**
 * utils/refDetector.ts — Detect inline scripture references in text.
 *
 * Used by DictionaryDetailScreen to make references tappable within
 * definition text. Returns alternating text/ref segments.
 */

const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

// Build abbreviated names (what Easton's commonly uses)
const ABBREVS = [
  'Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth',
  '1 Sam', '2 Sam', '1 Ki', '2 Ki', '1 Chr', '2 Chr',
  'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song',
  'Isa', 'Jer', 'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos',
  'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
  'Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom',
  '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
  '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Tit', 'Philem', 'Heb',
  'James', '1 Pet', '2 Pet', '1 John', '2 John', '3 John',
  'Jude', 'Rev',
];

const VALID_BOOKS = new Set([
  ...BOOK_NAMES.map((b) => b.toLowerCase()),
  ...ABBREVS.map((a) => a.toLowerCase().replace('.', '')),
]);

// Pattern for scripture references like "Gen. 1:3", "Matt 28:19", "1 Chr. 2:10"
const REF_PATTERN =
  /\b(\d?\s?(?:Sam|Ki|Chr|Cor|Thess|Tim|Pet|John|Gen|Ex|Lev|Num|Deut|Josh|Judg|Ruth|Ezra|Neh|Esth|Job|Ps|Prov|Eccl|Song|Isa|Jer|Lam|Ezek|Dan|Hos|Joel|Amos|Obad|Jonah|Mic|Nah|Hab|Zeph|Hag|Zech|Mal|Matt|Mark|Luke|Acts|Rom|Gal|Eph|Phil|Col|Tit|Philem|Heb|James|Jude|Rev)\.?\s+\d+(?::\d+(?:[,\-]\d+)*)?)/gi;

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
