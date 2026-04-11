import { computeMovableHolidays } from '../../src/utils/computeMovableHolidays';

describe('computeMovableHolidays', () => {
  it('computes correct Easter 2026 (April 5)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('04-05')).toBe('easter');
  });

  it('computes correct Good Friday 2026 (April 3)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('04-03')).toBe('good_friday');
  });

  it('computes correct Palm Sunday 2026 (March 29)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('03-29')).toBe('palm_sunday');
  });

  it('computes correct Ascension 2026 (May 14)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('05-14')).toBe('ascension');
  });

  it('computes correct Pentecost 2026 (May 24)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('05-24')).toBe('pentecost');
  });

  it('computes Thanksgiving 2026 (Nov 26)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('11-26')).toBe('thanksgiving');
  });

  it('computes Mothers Day 2026 (May 10)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('05-10')).toBe('mothers_day');
  });

  it('computes Fathers Day 2026 (June 21)', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.get('06-21')).toBe('fathers_day');
  });

  it('returns 8 movable holidays', () => {
    const holidays = computeMovableHolidays(2026);
    expect(holidays.size).toBe(8);
  });

  // Verify the algorithm works for a different year (Easter 2025 = April 20)
  it('computes correct Easter 2025 (April 20)', () => {
    const holidays = computeMovableHolidays(2025);
    expect(holidays.get('04-20')).toBe('easter');
  });

  // Leap year: Easter 2028 = April 16
  it('computes correct Easter for leap year 2028 (April 16)', () => {
    const holidays = computeMovableHolidays(2028);
    expect(holidays.get('04-16')).toBe('easter');
  });

  it('computes correct Good Friday for leap year 2028 (April 14)', () => {
    const holidays = computeMovableHolidays(2028);
    expect(holidays.get('04-14')).toBe('good_friday');
  });

  // Century year: Easter 2000 = April 23
  it('computes correct Easter for century year 2000 (April 23)', () => {
    const holidays = computeMovableHolidays(2000);
    expect(holidays.get('04-23')).toBe('easter');
  });

  // Year where Easter falls in March: Easter 2024 = March 31
  it('computes correct Easter for 2024 when it falls in March (March 31)', () => {
    const holidays = computeMovableHolidays(2024);
    expect(holidays.get('03-31')).toBe('easter');
  });

  it('computes correct Palm Sunday for March Easter 2024 (March 24)', () => {
    const holidays = computeMovableHolidays(2024);
    expect(holidays.get('03-24')).toBe('palm_sunday');
  });

  it('computes correct Good Friday for March Easter 2024 (March 29)', () => {
    const holidays = computeMovableHolidays(2024);
    expect(holidays.get('03-29')).toBe('good_friday');
  });

  // nthWeekdayOfMonth: 4th Thursday of November 2026
  it('computes Thanksgiving (4th Thursday of November) correctly for 2024', () => {
    const holidays = computeMovableHolidays(2024);
    // Nov 2024: 4th Thursday = Nov 28
    expect(holidays.get('11-28')).toBe('thanksgiving');
  });

  // nthWeekdayOfMonth: 4th Thursday of November 2028
  it('computes Thanksgiving correctly for 2028 (Nov 23)', () => {
    const holidays = computeMovableHolidays(2028);
    expect(holidays.get('11-23')).toBe('thanksgiving');
  });

  it('always returns 8 movable holidays regardless of year', () => {
    for (const year of [2000, 2024, 2025, 2026, 2028]) {
      expect(computeMovableHolidays(year).size).toBe(8);
    }
  });
});
