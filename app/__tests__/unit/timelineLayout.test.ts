import { yearToX, formatYear, TOTAL_WIDTH, SCALE_BREAKPOINTS } from '../../src/utils/timelineLayout';

const FIRST_X = SCALE_BREAKPOINTS[0][1];                     // PAD_LEFT = 200
const LAST_X = SCALE_BREAKPOINTS[SCALE_BREAKPOINTS.length - 1][1]; // TOTAL_WIDTH - PAD_RIGHT = 9200

describe('yearToX', () => {
  it('maps earliest breakpoint year to first x', () => expect(yearToX(-4000)).toBe(FIRST_X));
  it('maps last breakpoint year to last x', () => expect(yearToX(95)).toBe(LAST_X));
  it('maps exact breakpoint -2200 to 1600', () => expect(yearToX(-2200)).toBe(1600));
  it('maps 0 to 8200', () => expect(yearToX(0)).toBe(8200));
  it('interpolates between breakpoints', () => {
    const x = yearToX(-3100);
    expect(x).toBeGreaterThan(FIRST_X);
    expect(x).toBeLessThan(1600);
  });
  it('clamps below minimum', () => expect(yearToX(-5000)).toBe(FIRST_X));
  it('clamps above maximum', () => expect(yearToX(200)).toBe(LAST_X));
});

describe('formatYear', () => {
  it('formats BC years', () => expect(formatYear(-4000)).toBe('4000 BC'));
  it('formats year 0', () => expect(formatYear(0)).toBe('AD·BC'));
  it('formats AD years', () => expect(formatYear(33)).toBe('AD 33'));
});
