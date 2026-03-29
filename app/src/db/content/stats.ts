/**
 * db/content/stats.ts — Content statistics and config queries.
 */

import { getDb } from '../database';

export interface ContentStats {
  liveBooks: number;
  liveChapters: number;
  scholarCount: number;
  peopleCount: number;
  timelineCount: number;
  prophecyChainCount: number;
  conceptCount: number;
  difficultPassageCount: number;
}

export async function getContentStats(): Promise<ContentStats> {
  const [books, chapters, scholars, people, timeline, prophecy, concepts, difficult] = await Promise.all([
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM books WHERE is_live = 1"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM chapters"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM scholars"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM people"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM timelines"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM prophecy_chains"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM concepts"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM difficult_passages"),
  ]);
  return {
    liveBooks: books?.c ?? 0,
    liveChapters: chapters?.c ?? 0,
    scholarCount: scholars?.c ?? 0,
    peopleCount: people?.c ?? 0,
    timelineCount: timeline?.c ?? 0,
    prophecyChainCount: prophecy?.c ?? 0,
    conceptCount: concepts?.c ?? 0,
    difficultPassageCount: difficult?.c ?? 0,
  };
}
