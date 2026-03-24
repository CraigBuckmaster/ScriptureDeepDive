import { parseReference, splitMultiRef, getBookByName } from '../../src/utils/verseResolver';

describe('parseReference', () => {
  it('parses simple reference', () => {
    const r = parseReference('Gen 1:1');
    expect(r).toEqual({ bookId: 'genesis', bookName: 'Genesis', chapter: 1, verseStart: 1, verseEnd: 1 });
  });
  it('parses verse range', () => {
    const r = parseReference('1 Cor 13:4-7');
    expect(r?.bookId).toBe('1_corinthians');
    expect(r?.verseStart).toBe(4);
    expect(r?.verseEnd).toBe(7);
  });
  it('parses chapter-only', () => {
    const r = parseReference('Ps 23');
    expect(r?.bookId).toBe('psalms');
    expect(r?.chapter).toBe(23);
    expect(r?.verseStart).toBeUndefined();
  });
  it('parses full book name', () => {
    const r = parseReference('Genesis 1:1');
    expect(r?.bookId).toBe('genesis');
  });
  it('parses last verse of Bible', () => {
    const r = parseReference('Rev 22:21');
    expect(r?.bookId).toBe('revelation');
    expect(r?.verseStart).toBe(21);
  });
  it('returns null for empty string', () => {
    expect(parseReference('')).toBeNull();
  });
  it('returns null for invalid book', () => {
    expect(parseReference('NotABook 1:1')).toBeNull();
  });
  it('returns null for no chapter', () => {
    expect(parseReference('Gen')).toBeNull();
  });
  it('handles en-dash range', () => {
    const r = parseReference('Isa 53:4\u20136');
    expect(r?.verseStart).toBe(4);
    expect(r?.verseEnd).toBe(6);
  });
  it('parses numbered book', () => {
    const r = parseReference('2 Sam 7:12');
    expect(r?.bookId).toBe('2_samuel');
  });
});

describe('splitMultiRef', () => {
  it('splits semicolons', () => {
    expect(splitMultiRef('Gen 1:1; Ex 3:14; John 1:1')).toHaveLength(3);
  });
  it('single ref', () => {
    expect(splitMultiRef('Gen 1:1')).toEqual(['Gen 1:1']);
  });
  it('empty string', () => {
    expect(splitMultiRef('')).toEqual([]);
  });
});

describe('getBookByName', () => {
  it('finds by full name', () => {
    expect(getBookByName('Genesis')?.id).toBe('genesis');
  });
  it('finds by abbreviation', () => {
    expect(getBookByName('Gen')?.id).toBe('genesis');
  });
  it('finds numbered book', () => {
    expect(getBookByName('1 Samuel')?.id).toBe('1_samuel');
  });
  it('finds Psalms variations', () => {
    expect(getBookByName('Psalms')?.id).toBe('psalms');
    expect(getBookByName('Psalm')?.id).toBe('psalms');
    expect(getBookByName('Ps')?.id).toBe('psalms');
  });
  it('case insensitive', () => {
    expect(getBookByName('genesis')?.id).toBe('genesis');
    expect(getBookByName('GENESIS')?.id).toBe('genesis');
  });
  it('returns null for unknown', () => {
    expect(getBookByName('Narnia')).toBeNull();
  });
});
