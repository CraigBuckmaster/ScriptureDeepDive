import { describe, it, expect } from 'vitest';
import { parseGapSignal } from '../src/gapDetection';

describe('parseGapSignal', () => {
  it('parses a trailing gap envelope with gap=true', () => {
    const text =
      "I don't have material on Coptic Orthodox commentary for Romans 9 in my corpus.\n" +
      '{"gap": true, "gap_type": "content", "topic": "Coptic Orthodox Romans 9"}';
    const signal = parseGapSignal(text);
    expect(signal).not.toBeNull();
    expect(signal?.gap).toBe(true);
    expect(signal?.gap_type).toBe('content');
    expect(signal?.topic).toContain('Coptic');
  });

  it('parses gap=false envelope', () => {
    const text = 'Here is a full answer.\n{"gap": false}';
    const signal = parseGapSignal(text);
    expect(signal?.gap).toBe(false);
  });

  it('returns null when no trailing JSON is present', () => {
    expect(parseGapSignal('No JSON at all')).toBeNull();
    expect(parseGapSignal('Plain text ending with }')).toBeNull();
  });

  it('rejects invalid gap_type values', () => {
    const text = '{"gap": true, "gap_type": "bogus", "topic": "t"}';
    const signal = parseGapSignal(text);
    expect(signal?.gap).toBe(true);
    expect(signal?.gap_type).toBeUndefined();
  });

  it('handles embedded braces in preceding text', () => {
    const text =
      'The verse uses the idiom {word} in a metaphorical sense.\n{"gap": false}';
    const signal = parseGapSignal(text);
    expect(signal?.gap).toBe(false);
  });

  it('returns null for non-JSON trailing braces', () => {
    expect(parseGapSignal('This is not JSON }')).toBeNull();
  });
});
