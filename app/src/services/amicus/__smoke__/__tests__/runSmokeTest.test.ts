/**
 * Unit tests for the smoke-test helpers. The full end-to-end path requires a
 * live proxy and is exercised manually via AmicusSmokeScreen; here we cover
 * the parsers and config loader.
 */
import {
  CANNED_QUERIES,
  extractCitations,
  extractTrailingJson,
} from '../runSmokeTest';

describe('canned_queries.json', () => {
  it('has 10 queries', () => {
    expect(CANNED_QUERIES).toHaveLength(10);
  });

  it('all queries have unique ids', () => {
    const ids = CANNED_QUERIES.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every query has the required fields', () => {
    for (const q of CANNED_QUERIES) {
      expect(q.query).toBeTruthy();
      expect(q.expected_citations).toBeDefined();
      expect(Array.isArray(q.expected_citations.must_include_any_of)).toBe(true);
      expect(Array.isArray(q.expected_citations.must_include_source_types)).toBe(true);
      expect(Array.isArray(q.expected_citations.must_not_include)).toBe(true);
      expect(q.expected_behavior).toBeTruthy();
    }
  });

  it('includes a gap-test query (q06 — Coptic Orthodox)', () => {
    const gapTest = CANNED_QUERIES.find((q) => q.expected_behavior.includes('corpus gap'));
    expect(gapTest).toBeDefined();
  });
});

describe('extractCitations', () => {
  it('extracts bracketed citations', () => {
    expect(
      extractCitations('As Calvin explains [section_panel:romans-9-s1-calvin], election...'),
    ).toEqual(['section_panel:romans-9-s1-calvin']);
  });

  it('dedupes repeated citations', () => {
    const out = extractCitations(
      'See [word_study:hesed] and again [word_study:hesed] in Psalm 23.',
    );
    expect(out).toEqual(['word_study:hesed']);
  });

  it('returns empty array when no citations', () => {
    expect(extractCitations('No citations here.')).toEqual([]);
  });
});

describe('extractTrailingJson', () => {
  it('parses {"gap": true, ...}', () => {
    const out = extractTrailingJson(
      'Sorry, I don\'t have that.\n{"gap": true, "gap_type": "content", "topic": "x"}',
    );
    expect(out).toEqual({ gap: true, gap_type: 'content', topic: 'x' });
  });

  it('parses {"gap": false}', () => {
    expect(extractTrailingJson('answer.\n{"gap": false}')).toEqual({
      gap: false,
    });
  });

  it('returns null with no trailing JSON', () => {
    expect(extractTrailingJson('answer without JSON')).toBeNull();
  });
});
