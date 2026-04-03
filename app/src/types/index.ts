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
  genre?: string;
  genre_label?: string;
  genre_guidance?: string;
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
  coaching_json: string | null;
  difficulty: number | null;
  prayer_prompt?: string | null;
}

export interface CoachingTip {
  after_section: number;
  tip: string;
  genre_tag: string;
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

export interface ContentLibraryEntry {
  id: number;
  category: string;
  title: string;
  preview: string | null;
  book_id: string;
  book_name: string;
  chapter_num: number;
  section_num: number | null;
  panel_type: string;
  tab_key: string | null;
  testament: 'ot' | 'nt';
  sort_order: number;
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
  period: string | null;
  sort_order: number;
  passages_json: string;
  diff_annotations_json: string | null;
}

/** Alias for SynopticEntry used in Harmony of the Gospels screens. */
export type HarmonyEntry = SynopticEntry;

export interface InterlinearWord {
  id: number;
  book_id: string;
  chapter_num: number;
  verse_num: number;
  word_position: number;
  original: string;
  transliteration: string;
  strongs: string | null;
  morphology: string | null;
  gloss: string | null;
  word_study_id: string | null;
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

// ── Life Topics ─────────────────────────────────────────────

export interface LifeTopicCategory {
  id: string;
  name: string;
  display_order: number;
  icon?: string;
}

export interface LifeTopic {
  id: string;
  category_id: string;
  title: string;
  subtitle?: string;
  summary: string;
  body: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LifeTopicVerse {
  id: number;
  topic_id: string;
  verse_ref: string;
  verse_order: number;
  annotation?: string;
  is_primary: boolean;
}

// ── Concordance (Phase 21) ───────────────────────────────────

export interface ConcordanceResult {
  book_id: string;
  chapter_num: number;
  verse_num: number;
  original: string;
  transliteration: string;
  gloss: string | null;
  text: string;
  book_name: string;
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
  tags_json: string;              // JSON array of tag strings
  collection_id: number | null;   // FK to study_collections
}

export interface StudyCollection {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteLink {
  id: number;
  from_note_id: number;
  to_note_id: number;
  created_at: string;
}

export interface StudySession {
  id: number;
  chapter_id: string;
  started_at: string;
  ended_at?: string;
  duration_ms: number;
}

export interface StudySessionEvent {
  id: number;
  session_id: number;
  event_type: string;
  panel_type?: string;
  scholar_id?: string;
  section_id?: string;
  timestamp_ms: number;
  metadata_json?: string;
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
  panels: Record<string, object>;
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

// ── Composite Context Data (Phase 2) ────────────────────────────────

export interface ANEParallel {
  parallel: string;
  similarity: string;
  difference: string;
  significance: string;
}

export interface CompositeContextData {
  context?: string;
  historical?: string;
  audience?: string;
  ane?: ANEParallel[];
}

// ── Composite Connections Data (Phase 3) ─────────────────────────────

export type EchoType = 'direct_quote' | 'allusion' | 'echo' | 'typological';

export interface EchoEntry {
  source_ref: string;
  target_ref: string;
  type: EchoType;
  source_context: string;
  connection: string;
  significance: string;
}

export interface CompositeConnectionsData {
  refs: CrossRefEntry[];
  echoes?: EchoEntry[];
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

// ── Chiasm Structure (Phase 4) ──────────────────────────────────────

export interface ChiasmPair {
  label: string;
  top: string;
  bottom: string;
  color: string;
}

export interface ChiasmCenter {
  label: string;
  text: string;
}

export interface ChiasmData {
  title: string;
  pairs: ChiasmPair[];
  center: ChiasmCenter;
}

export interface LitPanel {
  rows: LitRow[];
  note: string;
  chiasm?: ChiasmData;
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

// ── Feature types (prophecy chains, concepts, difficult passages) ──

/** Parsed from ProphecyChain.links_json */
export interface ProphecyChainLink {
  book_dir: string;
  chapter_num: number;
  verse_ref: string;
  label?: string;
  role?: string;        // 'origin' | 'development' | 'fulfillment' | 'consummation'
  summary?: string;
  note?: string;        // Legacy field from initial data generation
}

/** Raw DB row — JSON columns are unparsed strings */
export interface ProphecyChain {
  id: string;
  title: string;
  category: string;    // 'messianic' | 'covenant' | 'judgment' | 'restoration' | 'typological'
  chain_type: string;  // 'prophecy-fulfillment' | 'type-antitype' | 'promise-realization'
  summary: string | null;
  tags_json: string | null;
  links_json: string;
}

/** Raw DB row */
export interface Concept {
  id: string;
  name: string;
  description: string | null;
  theme_key: string | null;
  word_study_ids_json: string | null;
  thread_ids_json: string | null;
  prophecy_chain_ids_json: string | null;
  people_tags_json: string | null;
  search_terms_json: string | null;
}

/** Parsed from DifficultPassage.responses_json */
export interface DifficultPassageResponse {
  tradition: string;
  summary: string;
  scholars?: string[];
  key_argument?: string;
}

/** Parsed from DifficultPassage.related_chapters_json */
export interface DifficultPassageChapter {
  book_dir: string;
  chapter_num: number;
}

/** Raw DB row — JSON columns are unparsed strings */
export interface DifficultPassage {
  id: string;
  title: string;
  category: string;    // 'ethical' | 'contradiction' | 'theological' | 'historical' | 'textual'
  severity: string;    // 'hard' | 'very_hard' | 'notorious'
  passage: string;
  question: string;
  responses_json: string;
  related_chapters_json: string | null;
  tags_json: string | null;
}

// ── Debate Topics (Scholar Debate Mode) ─────────────────────

export type DebateTopicCategory =
  | 'theological'
  | 'ethical'
  | 'historical'
  | 'textual'
  | 'interpretive';

/** Raw DB row — JSON columns are unparsed strings */
export interface DebateTopicRow {
  id: string;
  title: string;
  category: string;
  book_id: string;
  chapters_json: string;
  passage: string | null;
  question: string;
  context: string | null;
  positions_json: string;
  synthesis: string | null;
  related_passages_json: string | null;
  tags_json: string | null;
}

/** Summary shape returned by browse queries (position_count computed). */
export interface DebateTopicSummary extends DebateTopicRow {
  position_count: number;
}

/** Parsed position within a debate topic. */
export interface DebatePosition {
  id: string;
  label: string;
  tradition_family: string;
  scholar_ids: string[];
  proponents: string;
  argument: string;
  strengths: string;
  weaknesses: string;
  key_verses: string[];
}

/** Fully parsed debate topic. */
export interface DebateTopic {
  id: string;
  title: string;
  category: DebateTopicCategory;
  book_id: string;
  chapters: number[];
  passage: string;
  question: string;
  context: string;
  positions: DebatePosition[];
  synthesis: string;
  related_passages: string[];
  tags: string[];
}

// ══════════════════════════════════════════════════════════════
// PARSED BIO / INTRO TYPES
// ══════════════════════════════════════════════════════════════

export interface ScholarBio {
  eyebrow?: string;
  sections: { title: string; body: string }[];
}

export interface BookIntroOutlineItem {
  label: string;
  chapters?: [number, number];
  note?: string;
}

export interface BookIntroPlanItem {
  ref: string;
  label: string;
}

export interface BookIntroSection {
  heading?: string;
  content?: string;
  body?: string;
  outline?: BookIntroOutlineItem[];
  themes?: string[];
  plan?: BookIntroPlanItem[];
}

export interface BookIntroAuthorship {
  author?: string;
  date?: string;
  prompt?: string;
}

export interface ParsedBookIntro {
  title?: string;
  subtitle?: string;
  authorship?: string | BookIntroAuthorship;
  sections?: BookIntroSection[];
  text?: string;
}

// Re-export ParsedRef so panel components can import from types
export type { ParsedRef } from '../utils/verseResolver';
