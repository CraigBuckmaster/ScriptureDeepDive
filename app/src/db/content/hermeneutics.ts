/**
 * db/content/hermeneutics.ts — Hermeneutic lens queries.
 */

import { getDb } from '../database';
import type { HermeneuticLens, ChapterLensContent } from '../../types';

export async function getAllLenses(): Promise<HermeneuticLens[]> {
  return getDb().getAllAsync<HermeneuticLens>(
    'SELECT * FROM hermeneutic_lenses ORDER BY display_order',
  );
}

export async function getLensesForChapter(chapterId: string): Promise<HermeneuticLens[]> {
  return getDb().getAllAsync<HermeneuticLens>(
    `SELECT hl.* FROM hermeneutic_lenses hl
     INNER JOIN chapter_lens_content clc ON clc.lens_id = hl.id
     WHERE clc.chapter_id = ?
     ORDER BY hl.display_order`,
    [chapterId],
  );
}

export async function getChapterLensContent(
  chapterId: string,
  lensId: string,
): Promise<ChapterLensContent | null> {
  return getDb().getFirstAsync<ChapterLensContent>(
    'SELECT * FROM chapter_lens_content WHERE chapter_id = ? AND lens_id = ?',
    [chapterId, lensId],
  );
}
