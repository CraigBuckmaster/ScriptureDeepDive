/**
 * types/index.ts — TypeScript interfaces for all database entities
 * and parsed panel content structures.
 *
 * 19 database entity types + 10 parsed panel content types.
 */

// ══════════════════════════════════════════════════════════════
// DATABASE ENTITY TYPES (map directly to SQLite table columns)
// ══════════════════════════════════════════════════════════════

export interface Book {
  id: string;
  name: string;
  testament: 'ot' | 'nt';
  total_chapters: number;
  book_order: number;
  is_live: boolean;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_num: number;
  title: string | null;
  subtitle: string | null;
  timeline_link_event: string | null;
  timeline_link_text: string | null;
  map_story_link_id: string | null;
  map_story_link_text: string | null;
}

export interface Section {
  id: string;
  chapter_id: string;
  section_num: number;
  header: string;
  verse_start: number;
  verse_end: number;
}

export interface SectionPanel {
  id: number;
  section_id: string;
  panel_type: string;
  content_json: string;
}

export interface ChapterPanel {
  id: number;
  chapter_id: string;
  panel_type: string;
  content_json: string;
}

export interface Verse {
  id: number;
  book_id: string;
  chapter_num: number;
  verse_num: number;
  translation: string;
  text: string;
}

export interface BookIntro {
  book_id: string;
  intro_json: string;
}

export interface Person {
  id: string;
  name: string;
  gender: string | null;
  father: string | null;
  mother: string | null;
  spouse_of: string | null;
  era: string | null;
  dates: string | null;
  role: string | null;
  type: 'spine' | 'satellite' | null;
  bio: string | null;
  scripture_role: string | null;
  refs_json: string | null;
  chapter_link: string | null;
}

export interface Scholar {
  id: string;
  name: string;
  label: string;
  color: string | null;
  tradition: string | null;
  scope_json: string;
  bio_json: string;
}

export interface Place {
  id: string;
  ancient_name: string;
  modern_name: string | null;
  latitude: number;
  longitude: number;
  type: 'city' | 'water' | 'region' | 'mountain' | 'site';
  priority: number;
  label_dir: string;
}

export interface MapStory {
  id: string;
  era: string;
  name: string;
  scripture_ref: string | null;
  chapter_link: string | null;
  summary: string;
  places_json: string | null;
  regions_json: string | null;
  paths_json: string | null;
}

export interface WordStudy {
  id: string;
  language: string;
  original: string;
  transliteration: string;
  strongs: string | null;
  glosses_json: string;
  semantic_range: string | null;
  note: string | null;
  occurrences_json: string | null;
}

export interface SynopticEntry {
  id: string;
  title: string;
  category: string | null;
  passages_json: string;
}

export interface VHLGroup {
  id: number;
  chapter_id: string;
  group_name: string;
  css_class: string;
  words_json: string;
  btn_types_json: string;
}

export interface GenealogyConfig {
  key: string;
  value_json: string;
}

export interface CrossRefThread {
  id: string;
  theme: string;
  tags_json: string | null;
  steps_json: string;
}

export interface CrossRefPair {
  id: number;
  from_ref: string;
  to_ref: string;
  note: string | null;
}

export interface TimelineEntry {
  id: string;
  category: 'event' | 'person' | 'world';
  era: string | null;
  name: string;
  year: number;
  scripture_ref: string | null;
  chapter_link: string | null;
  people_json: string | null;
  summary: string | null;
  region: string | null;
}

// ══════════════════════════════════════════════════════════════
// USER DATA TYPES
// ══════════════════════════════════════════════════════════════

export interface UserNote {
  id: number;
  verse_ref: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingProgress {
  book_id: string;
  chapter_num: number;
  completed_at: string | null;
}

export interface Bookmark {
  id: number;
  verse_ref: string;
  label: string | null;
  created_at: string;
}

// ══════════════════════════════════════════════════════════════
// COMPUTED / JOINED TYPES
// ══════════════════════════════════════════════════════════════

export interface RecentChapter extends ReadingProgress {
  title: string | null;
  book_name: string;
}

/** Section with its panels pre-loaded and parsed. */
export interface SectionWithPanels extends Section {
  panels: Record<string, any>;
}

// ══════════════════════════════════════════════════════════════
// PARSED PANEL CONTENT TYPES
// (what you get after JSON.parse on content_json fields)
// ══════════════════════════════════════════════════════════════

export interface HebEntry {
  word: string;
  transliteration?: string;
  tlit?: string;
  gloss: string;
  paragraph?: string;
  text?: string;
  note?: string;
}

export interface CrossRefEntry {
  ref: string;
  note: string;
}

export interface CommentaryNote {
  ref: string;
  note: string;
}

export interface CommentaryPanel {
  source: string;
  notes: CommentaryNote[];
}

export interface PlaceEntry {
  name: string;
  role?: string;
  coords?: [number, number];
  text: string;
}

export interface TimelineEventEntry {
  date: string;
  name: string;
  text: string;
  current?: boolean;
}

export interface LitRow {
  label: string;
  range: string;
  text: string;
  is_key: boolean;
}

export interface LitPanel {
  rows: LitRow[];
  note: string;
}

export interface ThemeScore {
  name: string;
  value: number;
}

export interface ThemesPanel {
  scores: ThemeScore[];
  note: string;
}

export interface SourceEntry {
  title: string;
  quote: string;
  note: string;
}

export interface RecEntry {
  title: string;
  quote: string;
  note: string;
}

export interface ThreadEntry {
  anchor: string;
  target: string;
  direction: string;
  type: string;
  text: string;
}

export interface TextualEntry {
  ref: string;
  title: string;
  content: string;
  note: string;
}

export interface DebateEntry {
  topic: string;
  positions: { scholar: string; position: string }[];
}

export interface HebTextEntry {
  word: string;
  tlit: string;
  gloss: string;
  note: string;
}

export interface PeopleEntry {
  name: string;
  role: string;
  text: string;
  timeline_id?: string;
}

export interface TransRow {
  verse_ref: string;
  translations: { version: string; text: string }[];
}

export interface TransPanel {
  title: string;
  rows: TransRow[];
}
