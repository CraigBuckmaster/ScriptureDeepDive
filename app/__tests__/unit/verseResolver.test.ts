import { parseReference, parseDotReference, splitMultiRef, getBookByName } from '../../src/utils/verseResolver';

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
  it('case-insensitive lookup for mixed case', () => {
    expect(getBookByName('gEnEsIs')?.id).toBe('genesis');
    expect(getBookByName('EXODUS')?.id).toBe('exodus');
    expect(getBookByName('revelation')?.id).toBe('revelation');
  });
  it('resolves common abbreviations', () => {
    expect(getBookByName('Gen')?.id).toBe('genesis');
    expect(getBookByName('Ex')?.id).toBe('exodus');
    expect(getBookByName('Lev')?.id).toBe('leviticus');
    expect(getBookByName('Num')?.id).toBe('numbers');
    expect(getBookByName('Deut')?.id).toBe('deuteronomy');
    expect(getBookByName('Josh')?.id).toBe('joshua');
    expect(getBookByName('Judg')?.id).toBe('judges');
    expect(getBookByName('Isa')?.id).toBe('isaiah');
    expect(getBookByName('Jer')?.id).toBe('jeremiah');
    expect(getBookByName('Matt')?.id).toBe('matthew');
    expect(getBookByName('Rom')?.id).toBe('romans');
    expect(getBookByName('Rev')?.id).toBe('revelation');
  });
  it('returns null for empty string', () => {
    expect(getBookByName('')).toBeNull();
  });
  it('returns null for whitespace-only', () => {
    expect(getBookByName('   ')).toBeNull();
  });
});

describe('parseDotReference', () => {
  it('parses "rom.7.15" format', () => {
    const { parseDotReference } = require('../../src/utils/verseResolver');
    const r = parseDotReference('rom.7.15');
    expect(r).not.toBeNull();
    expect(r?.bookId).toBe('romans');
    expect(r?.chapter).toBe(7);
    expect(r?.verseStart).toBe(15);
    expect(r?.verseEnd).toBe(15);
  });
  it('parses dot reference with verse range', () => {
    const { parseDotReference } = require('../../src/utils/verseResolver');
    const r = parseDotReference('john.3.16-18');
    expect(r?.bookId).toBe('john');
    expect(r?.chapter).toBe(3);
    expect(r?.verseStart).toBe(16);
    expect(r?.verseEnd).toBe(18);
  });
  it('parses dot reference chapter-only', () => {
    const { parseDotReference } = require('../../src/utils/verseResolver');
    const r = parseDotReference('ps.23');
    expect(r?.bookId).toBe('psalms');
    expect(r?.chapter).toBe(23);
    expect(r?.verseStart).toBeUndefined();
  });
  it('returns null for invalid dot reference', () => {
    const { parseDotReference } = require('../../src/utils/verseResolver');
    expect(parseDotReference('')).toBeNull();
    expect(parseDotReference('notabook.1.1')).toBeNull();
  });
});

describe('parseReference – additional edge cases', () => {
  it('parses verse range "Gen 1:1-3"', () => {
    const r = parseReference('Gen 1:1-3');
    expect(r).not.toBeNull();
    expect(r?.bookId).toBe('genesis');
    expect(r?.chapter).toBe(1);
    expect(r?.verseStart).toBe(1);
    expect(r?.verseEnd).toBe(3);
  });
  it('parses single-chapter book "Obadiah 1" as chapter-only', () => {
    const r = parseReference('Obadiah 1');
    expect(r).not.toBeNull();
    expect(r?.bookId).toBe('obadiah');
    expect(r?.chapter).toBe(1);
  });
  it('parses single-chapter book "Philemon 1" as chapter-only', () => {
    const r = parseReference('Philemon 1');
    expect(r).not.toBeNull();
    expect(r?.bookId).toBe('philemon');
    expect(r?.chapter).toBe(1);
  });
  it('parses "Jude 1" as chapter-only', () => {
    const r = parseReference('Jude 1');
    expect(r).not.toBeNull();
    expect(r?.bookId).toBe('jude');
    expect(r?.chapter).toBe(1);
  });
});
