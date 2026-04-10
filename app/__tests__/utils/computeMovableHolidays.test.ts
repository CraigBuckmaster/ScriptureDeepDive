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
});
