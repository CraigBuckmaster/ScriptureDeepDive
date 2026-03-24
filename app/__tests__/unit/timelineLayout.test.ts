import { yearToX, formatYear, TOTAL_WIDTH } from '../../src/utils/timelineLayout';

describe('yearToX', () => {
  it('maps -4000 to 0', () => expect(yearToX(-4000)).toBe(0));
  it('maps 95 to 9000', () => expect(yearToX(95)).toBe(TOTAL_WIDTH));
  it('maps exact breakpoint -2200 to 1400', () => expect(yearToX(-2200)).toBe(1400));
  it('maps 0 to 8000', () => expect(yearToX(0)).toBe(8000));
  it('interpolates between breakpoints', () => {
    const x = yearToX(-3100);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(1400);
  });
  it('clamps below minimum', () => expect(yearToX(-5000)).toBe(0));
  it('clamps above maximum', () => expect(yearToX(200)).toBe(TOTAL_WIDTH));
});

describe('formatYear', () => {
  it('formats BC years', () => expect(formatYear(-4000)).toBe('4000 BC'));
  it('formats year 0', () => expect(formatYear(0)).toBe('AD·BC'));
  it('formats AD years', () => expect(formatYear(33)).toBe('AD 33'));
});
