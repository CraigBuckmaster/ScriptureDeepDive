import { describe, it, expect } from 'vitest';
import {
  DEDUP_COSINE_THRESHOLD,
  GAP_SIMILARITY_FLOOR,
  cosineSimilarity,
  isLowRetrievalScore,
  packEmbedding,
  parseGapSignal,
  scrubPII,
  unpackEmbedding,
} from '../src/gapDetection';

describe('parseGapSignal', () => {
  it('parses a trailing gap envelope with gap=true', () => {
    const text =
      "I don't have material on Coptic Orthodox commentary for Romans 9 in my corpus.\n" +
      '{"gap": true, "gap_type": "content", "topic": "Coptic Orthodox Romans 9"}';
    const signal = parseGapSignal(text);
    expect(signal).not.toBeNull();
    expect(signal?.gap).toBe(true);
    expect(signal?.gap_type).toBe('content');
  });

  it('parses gap=false envelope', () => {
    expect(parseGapSignal('answer.\n{"gap": false}')?.gap).toBe(false);
  });

  it('returns null when no trailing JSON', () => {
    expect(parseGapSignal('No JSON at all')).toBeNull();
    expect(parseGapSignal('Plain text ending with }')).toBeNull();
  });

  it('rejects invalid gap_type', () => {
    expect(
      parseGapSignal('{"gap": true, "gap_type": "bogus", "topic": "t"}')?.gap_type,
    ).toBeUndefined();
  });

  it('handles embedded braces before envelope', () => {
    expect(
      parseGapSignal('The verse uses {word} in metaphor.\n{"gap": false}')?.gap,
    ).toBe(false);
  });
});

describe('scrubPII', () => {
  it('redacts emails', () => {
    expect(scrubPII('ping me at alex@example.com')).toContain('[email]');
  });
  it('redacts phone numbers', () => {
    expect(scrubPII('call 415-555-1234 please')).toContain('[phone]');
  });
  it('redacts URLs', () => {
    expect(scrubPII('see https://example.com/page')).toContain('[url]');
  });
  it('redacts credit-card-shaped strings', () => {
    expect(scrubPII('card 4111 1111 1111 1111')).toContain('[card]');
  });
  it('leaves ordinary text alone', () => {
    expect(scrubPII('What does chesed mean?')).toBe('What does chesed mean?');
  });
});

describe('isLowRetrievalScore', () => {
  it('returns true for empty chunks', () => {
    expect(isLowRetrievalScore([])).toBe(true);
  });

  it('returns true when every chunk is below the floor', () => {
    const chunks = [
      { chunk_id: 'a', source_type: 'section_panel', text: 't', metadata: {}, score: 0.3 },
      { chunk_id: 'b', source_type: 'section_panel', text: 't', metadata: {}, score: 0.4 },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isLowRetrievalScore(chunks as any)).toBe(true);
  });

  it('returns false when any chunk is above the floor', () => {
    const chunks = [
      { chunk_id: 'a', source_type: 'section_panel', text: 't', metadata: {}, score: 0.3 },
      { chunk_id: 'b', source_type: 'section_panel', text: 't', metadata: {}, score: 0.8 },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isLowRetrievalScore(chunks as any)).toBe(false);
  });
});

describe('cosine + pack/unpack', () => {
  it('cosine of identical vectors is 1', () => {
    const a = new Float32Array([0.1, 0.2, 0.3]);
    expect(cosineSimilarity(a, a)).toBeCloseTo(1);
  });

  it('cosine of orthogonal vectors is 0', () => {
    const a = new Float32Array([1, 0]);
    const b = new Float32Array([0, 1]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it('pack/unpack round-trips', () => {
    const v = [0.01, -0.5, 1.25];
    const packed = packEmbedding(v);
    const unpacked = unpackEmbedding(packed);
    expect(unpacked[0]).toBeCloseTo(0.01);
    expect(unpacked[1]).toBeCloseTo(-0.5);
    expect(unpacked[2]).toBeCloseTo(1.25);
  });
});

describe('constants', () => {
  it('dedup threshold is strict', () => {
    expect(DEDUP_COSINE_THRESHOLD).toBeGreaterThanOrEqual(0.85);
    expect(DEDUP_COSINE_THRESHOLD).toBeLessThanOrEqual(0.95);
  });
  it('similarity floor matches plan', () => {
    expect(GAP_SIMILARITY_FLOOR).toBeCloseTo(0.55);
  });
});
