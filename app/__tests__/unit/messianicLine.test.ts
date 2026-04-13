import {
  MESSIANIC_LINE,
  isMessianic,
  messianicLineLength,
} from '@/utils/messianicLine';

describe('MESSIANIC_LINE', () => {
  it('contains Adam at the start and Jesus at the end', () => {
    expect(MESSIANIC_LINE[0]).toBe('adam');
    expect(MESSIANIC_LINE[MESSIANIC_LINE.length - 1]).toBe('jesus');
  });

  it('includes the core messianic figures', () => {
    const expected = ['noah', 'abraham', 'isaac', 'jacob', 'judah', 'david', 'solomon', 'zerubbabel'];
    expected.forEach((id) => expect(MESSIANIC_LINE).toContain(id));
  });

  it('has no duplicate ids', () => {
    const set = new Set(MESSIANIC_LINE);
    expect(set.size).toBe(MESSIANIC_LINE.length);
  });
});

describe('isMessianic', () => {
  it('returns true for known line members', () => {
    expect(isMessianic('david')).toBe(true);
    expect(isMessianic('jesus')).toBe(true);
  });

  it('returns false for non-members', () => {
    expect(isMessianic('esau')).toBe(false);
    expect(isMessianic('ishmael')).toBe(false);
  });

  it('returns false for null/undefined/empty', () => {
    expect(isMessianic(null)).toBe(false);
    expect(isMessianic(undefined)).toBe(false);
    expect(isMessianic('')).toBe(false);
  });
});

describe('messianicLineLength', () => {
  it('matches the array length', () => {
    expect(messianicLineLength()).toBe(MESSIANIC_LINE.length);
  });
});
