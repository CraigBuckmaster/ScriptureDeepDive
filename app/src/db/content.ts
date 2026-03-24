/**
 * db/content.ts — Read-only content queries against scripture.db.
 *
 * Every function returns typed results. JSON columns are returned as
 * raw strings — parse at render time using the panel content types.
 */

import { getDb } from './database';
import type {
  Book, Chapter, Section, SectionPanel, ChapterPanel,
  Verse, BookIntro, Person, Scholar, Place, MapStory,
  WordStudy, SynopticEntry, VHLGroup, CrossRefThread,
  CrossRefPair, TimelineEntry, GenealogyConfig,
} from '../types';

// ── Books ───────────────────────────────────────────────────────────

export async function getBooks(): Promise<Book[]> {
  return getDb().getAllAsync<Book>(
    'SELECT * FROM books ORDER BY book_order'
  );
}

export async function getBook(id: string): Promise<Book | null> {
  return getDb().getFirstAsync<Book>(
    'SELECT * FROM books WHERE id = ?', [id]
  );
}

export async function getLiveBooks(): Promise<Book[]> {
  return getDb().getAllAsync<Book>(
    'SELECT * FROM books WHERE is_live = 1 ORDER BY book_order'
  );
}

// ── Chapters ────────────────────────────────────────────────────────

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

// ── Sections + Panels ───────────────────────────────────────────────

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

// ── Verses ──────────────────────────────────────────────────────────

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

// ── VHL Groups ──────────────────────────────────────────────────────

export async function getVHLGroups(chapterId: string): Promise<VHLGroup[]> {
  return getDb().getAllAsync<VHLGroup>(
    'SELECT * FROM vhl_groups WHERE chapter_id = ?',
    [chapterId]
  );
}

// ── Book Intros ─────────────────────────────────────────────────────

export async function getBookIntro(bookId: string): Promise<BookIntro | null> {
  return getDb().getFirstAsync<BookIntro>(
    'SELECT * FROM book_intros WHERE book_id = ?', [bookId]
  );
}

// ── People ──────────────────────────────────────────────────────────

export async function getAllPeople(): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people ORDER BY name'
  );
}

export async function getPerson(id: string): Promise<Person | null> {
  return getDb().getFirstAsync<Person>(
    'SELECT * FROM people WHERE id = ?', [id]
  );
}

export async function getPersonChildren(parentId: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people WHERE father = ? OR mother = ? ORDER BY name',
    [parentId, parentId]
  );
}

export async function getSpousesOf(personId: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people WHERE spouse_of = ? ORDER BY name',
    [personId]
  );
}

// ── Scholars ────────────────────────────────────────────────────────

export async function getAllScholars(): Promise<Scholar[]> {
  return getDb().getAllAsync<Scholar>(
    'SELECT * FROM scholars ORDER BY name'
  );
}

export async function getScholar(id: string): Promise<Scholar | null> {
  return getDb().getFirstAsync<Scholar>(
    'SELECT * FROM scholars WHERE id = ?', [id]
  );
}

export async function getScholarsForBook(bookId: string): Promise<Scholar[]> {
  return getDb().getAllAsync<Scholar>(
    `SELECT * FROM scholars 
     WHERE scope_json = '"all"' 
        OR json_type(scope_json) = 'array' AND EXISTS (
          SELECT 1 FROM json_each(scope_json) WHERE json_each.value = ?
        )
     ORDER BY name`,
    [bookId]
  );
}

// ── Places + Map Stories ────────────────────────────────────────────

export async function getPlaces(): Promise<Place[]> {
  return getDb().getAllAsync<Place>(
    'SELECT * FROM places ORDER BY priority, ancient_name'
  );
}

export async function getPlace(id: string): Promise<Place | null> {
  return getDb().getFirstAsync<Place>(
    'SELECT * FROM places WHERE id = ?', [id]
  );
}

export async function getMapStories(era?: string): Promise<MapStory[]> {
  if (era) {
    return getDb().getAllAsync<MapStory>(
      'SELECT * FROM map_stories WHERE era = ? ORDER BY name',
      [era]
    );
  }
  return getDb().getAllAsync<MapStory>(
    'SELECT * FROM map_stories ORDER BY era, name'
  );
}

export async function getMapStory(id: string): Promise<MapStory | null> {
  return getDb().getFirstAsync<MapStory>(
    'SELECT * FROM map_stories WHERE id = ?', [id]
  );
}

// ── Word Studies ────────────────────────────────────────────────────

export async function getAllWordStudies(): Promise<WordStudy[]> {
  return getDb().getAllAsync<WordStudy>(
    'SELECT * FROM word_studies ORDER BY transliteration'
  );
}

export async function getWordStudy(id: string): Promise<WordStudy | null> {
  return getDb().getFirstAsync<WordStudy>(
    'SELECT * FROM word_studies WHERE id = ?', [id]
  );
}

// ── Synoptic Passages ───────────────────────────────────────────────

export async function getSynopticEntries(): Promise<SynopticEntry[]> {
  return getDb().getAllAsync<SynopticEntry>(
    'SELECT * FROM synoptic_map ORDER BY title'
  );
}

// ── Cross-Reference Threads ─────────────────────────────────────────

export async function getCrossRefThreads(): Promise<CrossRefThread[]> {
  return getDb().getAllAsync<CrossRefThread>(
    'SELECT * FROM cross_ref_threads ORDER BY theme'
  );
}

export async function getCrossRefThread(id: string): Promise<CrossRefThread | null> {
  return getDb().getFirstAsync<CrossRefThread>(
    'SELECT * FROM cross_ref_threads WHERE id = ?', [id]
  );
}

export async function getCrossRefPairsForVerse(verseRef: string): Promise<CrossRefPair[]> {
  return getDb().getAllAsync<CrossRefPair>(
    'SELECT * FROM cross_ref_pairs WHERE from_ref = ? OR to_ref = ?',
    [verseRef, verseRef]
  );
}

// ── Timeline ────────────────────────────────────────────────────────

export async function getTimelineEvents(): Promise<TimelineEntry[]> {
  return getDb().getAllAsync<TimelineEntry>(
    'SELECT * FROM timelines WHERE category = ? ORDER BY year',
    ['event']
  );
}

export async function getTimelinePeople(): Promise<TimelineEntry[]> {
  return getDb().getAllAsync<TimelineEntry>(
    'SELECT * FROM timelines WHERE category = ? ORDER BY year',
    ['person']
  );
}

export async function getAllTimelineEntries(): Promise<TimelineEntry[]> {
  return getDb().getAllAsync<TimelineEntry>(
    'SELECT * FROM timelines ORDER BY year'
  );
}

// ── Genealogy Config ────────────────────────────────────────────────

export async function getGenealogyConfig(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<GenealogyConfig>(
    'SELECT * FROM genealogy_config WHERE key = ?', [key]
  );
  return row?.value_json ?? null;
}

// ── Content Stats ──────────────────────────────────────────────────

export interface ContentStats {
  liveBooks: number;
  liveChapters: number;
  scholarCount: number;
  peopleCount: number;
  timelineCount: number;
}

export async function getContentStats(): Promise<ContentStats> {
  const [books, chapters, scholars, people, timeline] = await Promise.all([
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM books WHERE is_live = 1"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM chapters"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM scholars"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM people"),
    getDb().getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM timelines"),
  ]);
  return {
    liveBooks: books?.c ?? 0,
    liveChapters: chapters?.c ?? 0,
    scholarCount: scholars?.c ?? 0,
    peopleCount: people?.c ?? 0,
    timelineCount: timeline?.c ?? 0,
  };
}

// ── Full-Text Search ────────────────────────────────────────────────

export async function searchVerses(query: string, limit: number = 50): Promise<Verse[]> {
  return getDb().getAllAsync<Verse>(
    `SELECT v.*, b.name as book_name FROM verses_fts f
     JOIN verses v ON v.id = f.rowid
     JOIN books b ON b.id = v.book_id
     WHERE f.text MATCH ?
     LIMIT ?`,
    [query, limit]
  );
}

export async function searchPeople(query: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    `SELECT p.* FROM people_fts f
     JOIN people p ON p.rowid = f.rowid
     WHERE f.name MATCH ?`,
    [query]
  );
}
