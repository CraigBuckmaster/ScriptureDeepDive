/**
 * services/study/planTemplates.ts — Item builders for unified study
 * plans (#1831).
 *
 * Each builder derives its items from content-DB queries only — there
 * are no hardcoded book/chapter lists here. Builders return
 * `StudyPlanItemDraft[]`; `createStudyPlan` (db/userMutations) assigns
 * `item_num` on insert.
 */
import { getBook } from '../../db/content';
import { getJourneyStops } from '../../db/content/features';
import { getTopic } from '../../db/content/reference';
import type { StudyPlanItemDraft } from '../../types';
import { logger } from '../../utils/logger';

/**
 * Parse a content chapter id ("genesis_1", "1_samuel_16") into its
 * book id and chapter number. Returns null on unrecognized input.
 */
export function parseChapterId(
  chapterId: string,
): { bookId: string; chapterNum: number } | null {
  const m = chapterId.match(/^(.+)_(\d+)$/);
  if (!m) return null;
  return { bookId: m[1], chapterNum: parseInt(m[2], 10) };
}

/**
 * One guided session per chapter of the book, in canonical order.
 * Returns [] when the book id is unknown.
 */
export async function buildBookPlanItems(bookId: string): Promise<StudyPlanItemDraft[]> {
  const book = await getBook(bookId);
  if (!book) {
    logger.warn('studyPlans', `buildBookPlanItems: unknown book "${bookId}"`);
    return [];
  }
  const items: StudyPlanItemDraft[] = [];
  for (let ch = 1; ch <= book.total_chapters; ch++) {
    items.push({ kind: 'session', ref: { bookId, chapterNum: ch } });
  }
  return items;
}

/**
 * One guided session per scripture-anchored journey stop, in stop
 * order. Stops without a book/chapter anchor (narrative interludes)
 * are skipped — a session needs a chapter to open on.
 */
export async function buildJourneyPlanItems(journeyId: string): Promise<StudyPlanItemDraft[]> {
  const stops = await getJourneyStops(journeyId);
  const items: StudyPlanItemDraft[] = [];
  for (const stop of stops) {
    if (!stop.book_id || stop.chapter_num == null) continue;
    items.push({
      kind: 'session',
      ref: {
        bookId: stop.book_id,
        chapterNum: stop.chapter_num,
        ...(stop.verse_start != null ? { verseStart: stop.verse_start } : {}),
        stopId: stop.id,
      },
    });
  }
  return items;
}

/**
 * One guided session per chapter in the topic's
 * `relevant_chapters_json`, preserving the curated order and skipping
 * duplicates/unparseable ids. Returns [] when the topic is unknown or
 * has no relevant chapters.
 */
export async function buildTopicPlanItems(topicId: string): Promise<StudyPlanItemDraft[]> {
  const topic = await getTopic(topicId);
  if (!topic) {
    logger.warn('studyPlans', `buildTopicPlanItems: unknown topic "${topicId}"`);
    return [];
  }

  let chapterIds: string[] = [];
  try {
    const parsed: unknown = JSON.parse(topic.relevant_chapters_json ?? '[]');
    if (Array.isArray(parsed)) {
      chapterIds = parsed.filter((c): c is string => typeof c === 'string');
    }
  } catch (err) {
    logger.warn('studyPlans', `buildTopicPlanItems: bad relevant_chapters_json on "${topicId}"`, err);
    return [];
  }

  const items: StudyPlanItemDraft[] = [];
  const seen = new Set<string>();
  for (const chapterId of chapterIds) {
    if (seen.has(chapterId)) continue;
    seen.add(chapterId);
    const ref = parseChapterId(chapterId);
    if (!ref) continue;
    items.push({ kind: 'session', ref });
  }
  return items;
}
