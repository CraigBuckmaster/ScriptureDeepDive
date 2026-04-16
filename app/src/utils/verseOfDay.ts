/**
 * utils/verseOfDay.ts — Single source of truth for the Verse of the Day.
 *
 * Both the HomeScreen (via useHomeData) and the push notification scheduler
 * (services/notifications) import from here so they never drift out of sync.
 *
 * Selection algorithm:
 *   1. If today is a holiday (fixed or movable), use the holiday's verse.
 *   2. Otherwise, pick from FEATURED_VERSES by day-of-year modulo length.
 *
 * All pure functions — no DB access, no platform APIs.
 */

import dailyEncouragements from '../data/dailyEncouragements';
import { computeMovableHolidays } from './computeMovableHolidays';
import { fixedHolidays, movableHolidays, type HolidayContent } from '../data/holidayOverrides';

// ── Types ─────────────────────────────────────────────────────────

export interface VerseOfDay {
  ref: string;
  bookId: string;
  chapter: number;
  verseNum: number;
  text: string;
}

// ── Featured verse pool ───────────────────────────────────────────

/**
 * Curated list of well-known verses. The day-of-year modulo selects one
 * deterministically — no server needed, same verse all day for all users.
 */
export const FEATURED_VERSES: VerseOfDay[] = [
  { ref: 'Genesis 1:1',          bookId: 'genesis',       chapter: 1,   verseNum: 1,   text: 'In the beginning God created the heavens and the earth.' },
  { ref: 'Psalm 23:1',           bookId: 'psalms',        chapter: 23,  verseNum: 1,   text: 'The LORD is my shepherd, I lack nothing.' },
  { ref: 'Proverbs 3:5',         bookId: 'proverbs',      chapter: 3,   verseNum: 5,   text: 'Trust in the LORD with all your heart and lean not on your own understanding.' },
  { ref: 'Isaiah 40:31',         bookId: 'isaiah',        chapter: 40,  verseNum: 31,  text: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { ref: 'Jeremiah 29:11',       bookId: 'jeremiah',      chapter: 29,  verseNum: 11,  text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref: 'Matthew 6:33',         bookId: 'matthew',       chapter: 6,   verseNum: 33,  text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
  { ref: 'Matthew 11:28',        bookId: 'matthew',       chapter: 11,  verseNum: 28,  text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { ref: 'John 1:1',             bookId: 'john',          chapter: 1,   verseNum: 1,   text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
  { ref: 'John 3:16',            bookId: 'john',          chapter: 3,   verseNum: 16,  text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'John 14:6',            bookId: 'john',          chapter: 14,  verseNum: 6,   text: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."' },
  { ref: 'Romans 8:28',          bookId: 'romans',        chapter: 8,   verseNum: 28,  text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Romans 12:2',          bookId: 'romans',        chapter: 12,  verseNum: 2,   text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.' },
  { ref: 'Philippians 4:13',     bookId: 'philippians',   chapter: 4,   verseNum: 13,  text: 'I can do all this through him who gives me strength.' },
  { ref: 'Philippians 4:6',      bookId: 'philippians',   chapter: 4,   verseNum: 6,   text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
  { ref: 'Hebrews 11:1',         bookId: 'hebrews',       chapter: 11,  verseNum: 1,   text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
  { ref: 'James 1:5',            bookId: 'james',         chapter: 1,   verseNum: 5,   text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
  { ref: '2 Timothy 3:16',       bookId: '2_timothy',     chapter: 3,   verseNum: 16,  text: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' },
  { ref: 'Psalm 119:105',        bookId: 'psalms',        chapter: 119, verseNum: 105, text: 'Your word is a lamp for my feet, a light on my path.' },
  { ref: 'Isaiah 53:5',          bookId: 'isaiah',        chapter: 53,  verseNum: 5,   text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.' },
  { ref: 'Micah 6:8',            bookId: 'micah',         chapter: 6,   verseNum: 8,   text: 'He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God.' },
  { ref: 'Lamentations 3:22–23', bookId: 'lamentations',  chapter: 3,   verseNum: 22,  text: 'Because of the LORD\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.' },
  { ref: 'Deuteronomy 6:5',      bookId: 'deuteronomy',   chapter: 6,   verseNum: 5,   text: 'Love the LORD your God with all your heart and with all your soul and with all your strength.' },
  { ref: 'Joshua 1:9',           bookId: 'joshua',        chapter: 1,   verseNum: 9,   text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.' },
  { ref: 'Proverbs 16:3',        bookId: 'proverbs',      chapter: 16,  verseNum: 3,   text: 'Commit to the LORD whatever you do, and he will establish your plans.' },
  { ref: 'Psalm 46:10',          bookId: 'psalms',        chapter: 46,  verseNum: 10,  text: 'He says, "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."' },
  { ref: 'Exodus 14:14',         bookId: 'exodus',        chapter: 14,  verseNum: 14,  text: 'The LORD will fight for you; you need only to be still.' },
  { ref: 'Daniel 2:21',          bookId: 'daniel',        chapter: 2,   verseNum: 21,  text: 'He changes times and seasons; he deposes kings and raises up others. He gives wisdom to the wise and knowledge to the discerning.' },
  { ref: 'Matthew 5:16',         bookId: 'matthew',       chapter: 5,   verseNum: 16,  text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' },
  { ref: 'Psalm 27:1',           bookId: 'psalms',        chapter: 27,  verseNum: 1,   text: 'The LORD is my light and my salvation— whom shall I fear? The LORD is the stronghold of my life— of whom shall I be afraid?' },
  { ref: 'Isaiah 41:10',         bookId: 'isaiah',        chapter: 41,  verseNum: 10,  text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
  { ref: 'Mark 10:27',           bookId: 'mark',          chapter: 10,  verseNum: 27,  text: 'Jesus looked at them and said, "With man this is impossible, but not with God; all things are possible with God."' },
];

// ── Day helpers ────────────────────────────────────────────────────

/**
 * Day-of-year (1..366) for the given date's LOCAL calendar day.
 * Default is today.
 */
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Format a date as 'MM-DD' in local time — used to key holiday maps. */
function monthDayKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

// ── Holiday detection ──────────────────────────────────────────────

/** Cache movable-holiday maps by year. Populated lazily. */
const movableCache: Map<number, Map<string, string>> = new Map();

function getMovableMap(year: number): Map<string, string> {
  let map = movableCache.get(year);
  if (!map) {
    map = computeMovableHolidays(year);
    movableCache.set(year, map);
  }
  return map;
}

/** Return the HolidayContent for the given date, or null if it's a normal day. */
export function getHolidayForDate(date: Date = new Date()): HolidayContent | null {
  const key = monthDayKey(date);
  if (fixedHolidays[key]) return fixedHolidays[key];
  const holidayId = getMovableMap(date.getFullYear()).get(key);
  if (holidayId && movableHolidays[holidayId]) return movableHolidays[holidayId];
  return null;
}

// ── Verse selection ────────────────────────────────────────────────

/**
 * Deterministic verse for an arbitrary date. Same algorithm the homepage uses,
 * factored out so notification scheduling can pre-compute N days ahead.
 */
export function getVerseForDate(date: Date): VerseOfDay {
  const holiday = getHolidayForDate(date);
  if (holiday) return holiday.verse;
  return FEATURED_VERSES[getDayOfYear(date) % FEATURED_VERSES.length];
}

/** Convenience wrapper — today's verse. */
export function getVerseOfDay(): VerseOfDay {
  return getVerseForDate(new Date());
}

// ── Encouragement (subtitle) selection ────────────────────────────

/**
 * Deterministic encouragement string for a given date, mirroring the verse
 * algorithm. Exported so features other than Home can align if needed.
 */
export function getEncouragementForDate(date: Date = new Date()): string {
  const holiday = getHolidayForDate(date);
  if (holiday) return holiday.encouragement;
  return dailyEncouragements[getDayOfYear(date) % dailyEncouragements.length];
}
