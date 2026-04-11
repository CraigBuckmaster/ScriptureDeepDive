import { extractReferences } from '../../src/utils/referenceParser';

describe('extractReferences', () => {
  it('finds simple reference in text', () => {
    const refs = extractReferences('See Genesis 3:15 for the protevangelion');
    expect(refs.length).toBe(1);
    expect(refs[0].ref).toBe('Genesis 3:15');
  });
  it('finds cf. prefixed reference', () => {
    const refs = extractReferences('cf. Rom 8:28-30');
    expect(refs.length).toBe(1);
    expect(refs[0].ref).toBe('Rom 8:28-30');
  });
  it('finds multiple references', () => {
    const refs = extractReferences('Isaiah 53:4 and Psalm 22:1 are key');
    expect(refs.length).toBe(2);
  });
  it('returns empty for no references', () => {
    expect(extractReferences('No references here')).toEqual([]);
  });
  it('ignores random numbers', () => {
    expect(extractReferences('The year 2024 was significant')).toEqual([]);
  });
  it('validates chapter in range', () => {
    const refs = extractReferences('Gen 999:1');
    expect(refs.length).toBe(0);
  });

  it('finds chapter-only reference like "Psalm 23"', () => {
    const refs = extractReferences('Read Psalm 23 for comfort');
    expect(refs.length).toBe(1);
    expect(refs[0].ref).toBe('Psalm 23');
  });

  it('strips "See " prefix from ref but adjusts start position', () => {
    const text = 'See Isaiah 53:4 for details';
    const refs = extractReferences(text);
    expect(refs.length).toBe(1);
    expect(refs[0].ref).toBe('Isaiah 53:4');
    // The ref should not contain the "See " prefix
    expect(refs[0].ref).not.toMatch(/^See /);
    // start should point to where the actual ref begins (after "See ")
    expect(text.slice(refs[0].start, refs[0].end)).toBe('Isaiah 53:4');
  });

  it('finds en-dash range like "Gen 3:15–17"', () => {
    const refs = extractReferences('Gen 3:15\u201317 is the protevangelion');
    expect(refs.length).toBe(1);
    expect(refs[0].ref).toContain('Gen 3:15');
  });

  it('finds numbered book like "1 Corinthians 13:4"', () => {
    const refs = extractReferences('1 Corinthians 13:4 talks about love');
    expect(refs.length).toBe(1);
    expect(refs[0].ref).toBe('1 Corinthians 13:4');
  });

  it('resets regex lastIndex properly on consecutive calls', () => {
    const first = extractReferences('Genesis 1:1 is the beginning');
    const second = extractReferences('Exodus 3:14 is significant');
    expect(first.length).toBe(1);
    expect(first[0].ref).toBe('Genesis 1:1');
    expect(second.length).toBe(1);
    expect(second[0].ref).toBe('Exodus 3:14');
  });

  it('tracks start and end positions that bracket the ref in the original string', () => {
    const text = 'The passage in Romans 8:28 is encouraging';
    const refs = extractReferences(text);
    expect(refs.length).toBe(1);
    // end position should be past the ref in the original string
    expect(refs[0].end).toBeGreaterThan(refs[0].start);
    // the extracted slice should contain the ref text
    const extracted = text.slice(refs[0].start, refs[0].end);
    expect(extracted).toContain('Romans 8:28');
  });

  it('strips "cf. " prefix from ref', () => {
    const text = 'cf. Isa 53:4\u20136 is messianic';
    const refs = extractReferences(text);
    expect(refs.length).toBe(1);
    expect(refs[0].ref).not.toMatch(/^cf\./);
    expect(refs[0].ref).toContain('Isa 53:4');
  });
});
