/**
 * computeMovableHolidays.ts — Compute dates for holidays that shift each year.
 *
 * Returns a Map<string, string> keyed by 'MM-DD' → holiday ID.
 * Called once per app launch with the current year.
 */

/**
 * Anonymous Gregorian Easter algorithm (Meeus/Jones/Butcher).
 * Returns the Date of Easter Sunday for the given year.
 */
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Shift a date by N days (positive = forward, negative = backward). */
function offsetDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Nth weekday of a month (e.g., 4th Thursday of November).
 * @param year  Calendar year
 * @param month 0-indexed month (0 = Jan, 10 = Nov)
 * @param weekday 0 = Sunday, 4 = Thursday, etc.
 * @param n Which occurrence (1-based)
 */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month, day);
}

/** Format a Date as 'MM-DD'. */
function toKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

/**
 * Build a map of movable holiday dates for the given year.
 * Keys are 'MM-DD', values are holiday IDs matching holidayOverrides.
 */
export function computeMovableHolidays(year: number): Map<string, string> {
  const easter = getEasterDate(year);
  const map = new Map<string, string>();

  map.set(toKey(offsetDays(easter, -7)),  'palm_sunday');
  map.set(toKey(offsetDays(easter, -2)),  'good_friday');
  map.set(toKey(easter),                  'easter');
  map.set(toKey(offsetDays(easter, 39)),  'ascension');
  map.set(toKey(offsetDays(easter, 49)),  'pentecost');

  // Thanksgiving: 4th Thursday of November
  map.set(toKey(nthWeekdayOfMonth(year, 10, 4, 4)), 'thanksgiving');

  // Mother's Day: 2nd Sunday of May
  map.set(toKey(nthWeekdayOfMonth(year, 4, 0, 2)), 'mothers_day');

  // Father's Day: 3rd Sunday of June
  map.set(toKey(nthWeekdayOfMonth(year, 5, 0, 3)), 'fathers_day');

  return map;
}
