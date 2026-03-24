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
});
