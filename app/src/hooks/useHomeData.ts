/**
 * useHomeData — Consolidated data hook for the HomeScreen.
 *
 * Loads content stats, recent chapters, reading stats, and verse of the day
 * in a single hook with unified loading state.
 */

import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getContentStats, type ContentStats } from '../db/content';
import { getRecentChapters, getReadingStats, type ReadingStats } from '../db/user';
import type { RecentChapter } from '../types';
import { logger } from '../utils/logger';
import dailyEncouragements from '../data/dailyEncouragements';

// ── Verse of the Day ───────────────────────────────────────────────

interface VerseOfDay {
  ref: string;
  bookId: string;
  chapter: number;
  text: string;
}

/**
 * Curated list of well-known verses. The day-of-year modulo selects one
 * deterministically — no server needed, same verse all day for all users.
 */
const FEATURED_VERSES: VerseOfDay[] = [
  { ref: 'Genesis 1:1',      bookId: 'genesis',       chapter: 1,  text: 'In the beginning God created the heavens and the earth.' },
  { ref: 'Psalm 23:1',       bookId: 'psalms',        chapter: 23, text: 'The LORD is my shepherd, I lack nothing.' },
  { ref: 'Proverbs 3:5',     bookId: 'proverbs',      chapter: 3,  text: 'Trust in the LORD with all your heart and lean not on your own understanding.' },
  { ref: 'Isaiah 40:31',     bookId: 'isaiah',        chapter: 40, text: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { ref: 'Jeremiah 29:11',   bookId: 'jeremiah',      chapter: 29, text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref: 'Matthew 6:33',     bookId: 'matthew',       chapter: 6,  text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
  { ref: 'Matthew 11:28',    bookId: 'matthew',       chapter: 11, text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { ref: 'John 1:1',         bookId: 'john',          chapter: 1,  text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
  { ref: 'John 3:16',        bookId: 'john',          chapter: 3,  text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'John 14:6',        bookId: 'john',          chapter: 14, text: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."' },
  { ref: 'Romans 8:28',      bookId: 'romans',        chapter: 8,  text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Romans 12:2',      bookId: 'romans',        chapter: 12, text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.' },
  { ref: 'Philippians 4:13', bookId: 'philippians',   chapter: 4,  text: 'I can do all this through him who gives me strength.' },
  { ref: 'Philippians 4:6',  bookId: 'philippians',   chapter: 4,  text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
  { ref: 'Hebrews 11:1',     bookId: 'hebrews',       chapter: 11, text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
  { ref: 'James 1:5',        bookId: 'james',         chapter: 1,  text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
  { ref: '2 Timothy 3:16',   bookId: '2-timothy',     chapter: 3,  text: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' },
  { ref: 'Psalm 119:105',    bookId: 'psalms',        chapter: 119, text: 'Your word is a lamp for my feet, a light on my path.' },
  { ref: 'Isaiah 53:5',      bookId: 'isaiah',        chapter: 53, text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.' },
  { ref: 'Micah 6:8',        bookId: 'micah',         chapter: 6,  text: 'He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God.' },
  { ref: 'Lamentations 3:22–23', bookId: 'lamentations', chapter: 3, text: 'Because of the LORD\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.' },
  { ref: 'Deuteronomy 6:5',  bookId: 'deuteronomy',   chapter: 6,  text: 'Love the LORD your God with all your heart and with all your soul and with all your strength.' },
  { ref: 'Joshua 1:9',       bookId: 'joshua',        chapter: 1,  text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.' },
  { ref: 'Proverbs 16:3',    bookId: 'proverbs',      chapter: 16, text: 'Commit to the LORD whatever you do, and he will establish your plans.' },
  { ref: 'Psalm 46:10',      bookId: 'psalms',        chapter: 46, text: 'He says, "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."' },
  { ref: 'Exodus 14:14',     bookId: 'exodus',        chapter: 14, text: 'The LORD will fight for you; you need only to be still.' },
  { ref: 'Daniel 2:21',      bookId: 'daniel',        chapter: 2,  text: 'He changes times and seasons; he deposes kings and raises up others. He gives wisdom to the wise and knowledge to the discerning.' },
  { ref: 'Matthew 5:16',     bookId: 'matthew',       chapter: 5,  text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' },
  { ref: 'Psalm 27:1',       bookId: 'psalms',        chapter: 27, text: 'The LORD is my light and my salvation— whom shall I fear? The LORD is the stronghold of my life— of whom shall I be afraid?' },
  { ref: 'Isaiah 41:10',     bookId: 'isaiah',        chapter: 41, text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
  { ref: 'Mark 10:27',       bookId: 'mark',          chapter: 10, text: 'Jesus looked at them and said, "With man this is impossible, but not with God; all things are possible with God."' },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getVerseOfDay(): VerseOfDay {
  return FEATURED_VERSES[getDayOfYear() % FEATURED_VERSES.length];
}

// ── Time-aware greeting ────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ── Personal subtitle ───────────────────────────────────────────

function getSubtitle(readingStats: ReadingStats | null): string {
  if (!readingStats || readingStats.totalChapters === 0) {
    return 'Learn to read the Bible the way it was written';
  }
  return dailyEncouragements[getDayOfYear() % dailyEncouragements.length];
}

// ── Hook ───────────────────────────────────────────────────────────

export interface HomeData {
  greeting: string;
  subtitle: string;
  stats: ContentStats | null;
  verse: VerseOfDay;
  recentChapters: RecentChapter[];
  readingStats: ReadingStats | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useHomeData(): HomeData {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [recentChapters, setRecentChapters] = useState<RecentChapter[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, recent, rs] = await Promise.all([
        getContentStats(),
        getRecentChapters(3),
        getReadingStats(),
      ]);
      setStats(s);
      setRecentChapters(recent);
      setReadingStats(rs);
    } catch (err) {
      logger.warn('useHomeData', 'Load error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return {
    greeting: getGreeting(),
    subtitle: getSubtitle(readingStats),
    stats,
    verse: getVerseOfDay(),
    recentChapters,
    readingStats,
    isLoading,
    refresh: load,
  };
}
