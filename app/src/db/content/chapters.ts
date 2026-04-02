/**
 * db/content/chapters.ts — Chapter, section, panel, verse, and VHL queries.
 */

import { getDb, getVerseDb } from '../database';
import type {
  Chapter, Section, SectionPanel, ChapterPanel, Verse, VHLGroup, InterlinearWord,
  ConcordanceResult,
} from '../../types';

export async function getChapter(bookId: string, ch: number): Promise<Chapter | null> {
  return getDb().getFirstAsync<Chapter>(
    'SELECT * FROM chapters WHERE book_id = ? AND chapter_num = ?',
    [bookId, ch]
  );
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  return getDb().getFirstAsync<Chapter>(
    'SELECT * FROM chapters WHERE id = ?', [id]
  );
}

export async function getSections(chapterId: string): Promise<Section[]> {
  return getDb().getAllAsync<Section>(
    'SELECT * FROM sections WHERE chapter_id = ? ORDER BY section_num',
    [chapterId]
  );
}

export async function getSectionPanels(sectionId: string): Promise<SectionPanel[]> {
  return getDb().getAllAsync<SectionPanel>(
    'SELECT * FROM section_panels WHERE section_id = ? ORDER BY panel_type',
    [sectionId]
  );
}

export async function getSectionPanelsByType(
  sectionId: string, panelType: string
): Promise<SectionPanel | null> {
  return getDb().getFirstAsync<SectionPanel>(
    'SELECT * FROM section_panels WHERE section_id = ? AND panel_type = ?',
    [sectionId, panelType]
  );
}

export async function getChapterPanels(chapterId: string): Promise<ChapterPanel[]> {
  return getDb().getAllAsync<ChapterPanel>(
    'SELECT * FROM chapter_panels WHERE chapter_id = ? ORDER BY panel_type',
    [chapterId]
  );
}

export async function getChapterPanelByType(
  chapterId: string, panelType: string
): Promise<ChapterPanel | null> {
  return getDb().getFirstAsync<ChapterPanel>(
    'SELECT * FROM chapter_panels WHERE chapter_id = ? AND panel_type = ?',
    [chapterId, panelType]
  );
}

export async function getVerses(
  bookId: string, ch: number, translation: string = 'kjv'
): Promise<Verse[]> {
  const db = await getVerseDb(translation);
  return db.getAllAsync<Verse>(
    'SELECT * FROM verses WHERE book_id = ? AND chapter_num = ? AND translation = ? ORDER BY verse_num',
    [bookId, ch, translation]
  );
}

export async function getVerse(
  bookId: string, ch: number, verse: number, translation: string = 'kjv'
): Promise<Verse | null> {
  const db = await getVerseDb(translation);
  return db.getFirstAsync<Verse>(
    'SELECT * FROM verses WHERE book_id = ? AND chapter_num = ? AND verse_num = ? AND translation = ?',
    [bookId, ch, verse, translation]
  );
}

export async function getInterlinearWords(
  bookId: string, ch: number, verse: number
): Promise<InterlinearWord[]> {
  return getDb().getAllAsync<InterlinearWord>(
    `SELECT iw.id, iw.book_id, iw.chapter_num, iw.verse_num, iw.word_position,
       iw.original, iw.transliteration, iw.strongs,
       im.code as morphology, ig.gloss, iw.word_study_id
     FROM interlinear_words iw
     LEFT JOIN interlinear_glosses ig ON ig.id = iw.gloss_id
     LEFT JOIN interlinear_morphology im ON im.id = iw.morphology_id
     WHERE iw.book_id = ? AND iw.chapter_num = ? AND iw.verse_num = ?
     ORDER BY iw.word_position`,
    [bookId, ch, verse]
  );
}

export async function getConcordanceResults(strongs: string): Promise<ConcordanceResult[]> {
  return getDb().getAllAsync<ConcordanceResult>(
    `SELECT iw.book_id, iw.chapter_num, iw.verse_num,
       iw.original, iw.transliteration,
       MIN(ig.gloss) as gloss,
       v.text, b.name as book_name
     FROM interlinear_words iw
     LEFT JOIN interlinear_glosses ig ON ig.id = iw.gloss_id
     JOIN verses v ON v.book_id = iw.book_id
       AND v.chapter_num = iw.chapter_num
       AND v.verse_num = iw.verse_num
       AND v.translation = 'kjv'
     JOIN books b ON b.id = iw.book_id
     WHERE iw.strongs = ?
     GROUP BY iw.book_id, iw.chapter_num, iw.verse_num
     ORDER BY b.book_order, iw.chapter_num, iw.verse_num`,
    [strongs]
  );
}

export async function getConcordanceCount(strongs: string): Promise<number> {
  const row = await getDb().getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(DISTINCT book_id || ':' || chapter_num || ':' || verse_num) as cnt
     FROM interlinear_words WHERE strongs = ?`,
    [strongs]
  );
  return row?.cnt ?? 0;
}

export async function getVHLGroups(chapterId: string): Promise<VHLGroup[]> {
  return getDb().getAllAsync<VHLGroup>(
    'SELECT * FROM vhl_groups WHERE chapter_id = ?',
    [chapterId]
  );
}

export async function getRedLetterVerses(
  bookId: string, chapterNum: number
): Promise<number[]> {
  const rows = await getDb().getAllAsync<{ verse_num: number }>(
    'SELECT verse_num FROM red_letter_verses WHERE book_id = ? AND chapter_num = ?',
    [bookId, chapterNum]
  );
  return rows.map(r => r.verse_num);
}
