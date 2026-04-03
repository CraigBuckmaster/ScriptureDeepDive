/**
 * Tests for utils/refDetector.ts — scripture reference detection in text.
 */
import { splitTextWithRefs, type TextSegment } from '@/utils/refDetector';

describe('splitTextWithRefs', () => {
  it('returns a single text segment for plain text with no references', () => {
    const result = splitTextWithRefs('No scripture here at all.');
    expect(result).toEqual([{ type: 'text', value: 'No scripture here at all.' }]);
  });

  it('returns a single text segment for an empty string', () => {
    const result = splitTextWithRefs('');
    expect(result).toEqual([{ type: 'text', value: '' }]);
  });

  it('splits text with one reference into 3 segments', () => {
    const result = splitTextWithRefs('See Gen. 1:3 for details.');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'text', value: 'See' });
    expect(result[1]).toEqual({ type: 'ref', value: 'Gen. 1:3' });
    expect(result[2]).toEqual({ type: 'text', value: ' for details.' });
  });

  it('detects multiple references in text', () => {
    const result = splitTextWithRefs('Read Matt 28:19 and Rev 21:1 today.');
    const refs = result.filter((s) => s.type === 'ref');
    expect(refs).toHaveLength(2);
    expect(refs[0].value).toBe('Matt 28:19');
    expect(refs[1].value).toBe('Rev 21:1');
  });

  it('recognises abbreviated book names', () => {
    const cases = ['Gen 1:1', 'Ex 3:14', 'Matt 5:3', 'Rev 22:21', 'Ps 23:1'];
    for (const ref of cases) {
      const result = splitTextWithRefs(`See ${ref} here.`);
      const found = result.find((s) => s.type === 'ref');
      expect(found).toBeDefined();
      expect(found!.value).toBe(ref);
    }
  });

  it('recognises numbered book names', () => {
    const cases = ['1 Sam 16:7', '2 Ki 5:10', '1 Cor 13:4'];
    for (const ref of cases) {
      const result = splitTextWithRefs(`In ${ref} we read.`);
      const found = result.find((s) => s.type === 'ref');
      expect(found).toBeDefined();
      expect(found!.value).toBe(ref);
    }
  });

  it('handles verse ranges', () => {
    const result = splitTextWithRefs('See Gen 1:1-3 for context.');
    const ref = result.find((s) => s.type === 'ref');
    expect(ref).toBeDefined();
    expect(ref!.value).toBe('Gen 1:1-3');
  });

  it('handles abbreviated names with dots', () => {
    const result = splitTextWithRefs('Read 1 Chr. 2:10 next.');
    const ref = result.find((s) => s.type === 'ref');
    expect(ref).toBeDefined();
    expect(ref!.value).toBe('1 Chr. 2:10');
  });

  it('strips trailing punctuation from references', () => {
    const trailing = [
      { input: 'See Gen 1:1, and', expected: 'Gen 1:1' },
      { input: 'See Gen 1:1; also', expected: 'Gen 1:1' },
      { input: 'See Gen 1:1. Then', expected: 'Gen 1:1' },
    ];
    for (const { input, expected } of trailing) {
      const result = splitTextWithRefs(input);
      const ref = result.find((s) => s.type === 'ref');
      expect(ref).toBeDefined();
      expect(ref!.value).toBe(expected);
    }
  });

  it('handles a reference at the very start of the text', () => {
    const result = splitTextWithRefs('Rev 21:1-4 describes the new heaven.');
    expect(result[0]).toEqual({ type: 'ref', value: 'Rev 21:1-4' });
    expect(result[1].type).toBe('text');
  });

  it('handles a reference at the very end of the text', () => {
    const result = splitTextWithRefs('The passage is Ps 23:1');
    const last = result[result.length - 1];
    expect(last.type).toBe('ref');
    expect(last.value).toBe('Ps 23:1');
  });
});
