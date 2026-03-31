/**
 * db/content/chapters.ts — Chapter, section, panel, verse, and VHL queries.
 */

import { getDb } from '../database';
import type {
  Chapter, Section, SectionPanel, ChapterPanel, Verse, VHLGroup, InterlinearWord,
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
  bookId: string, ch: number, translation: string = 'niv'
): Promise<Verse[]> {
  return getDb().getAllAsync<Verse>(
    'SELECT * FROM verses WHERE book_id = ? AND chapter_num = ? AND translation = ? ORDER BY verse_num',
    [bookId, ch, translation]
  );
}

export async function getVerse(
  bookId: string, ch: number, verse: number, translation: string = 'niv'
): Promise<Verse | null> {
  return getDb().getFirstAsync<Verse>(
    'SELECT * FROM verses WHERE book_id = ? AND chapter_num = ? AND verse_num = ? AND translation = ?',
    [bookId, ch, verse, translation]
  );
}

export async function getInterlinearWords(
  bookId: string, ch: number, verse: number
): Promise<InterlinearWord[]> {
  return getDb().getAllAsync<InterlinearWord>(
    'SELECT * FROM interlinear_words WHERE book_id = ? AND chapter_num = ? AND verse_num = ? ORDER BY word_position',
    [bookId, ch, verse]
  );
}

export async function getVHLGroups(chapterId: string): Promise<VHLGroup[]> {
  return getDb().getAllAsync<VHLGroup>(
    'SELECT * FROM vhl_groups WHERE chapter_id = ?',
    [chapterId]
  );
}
