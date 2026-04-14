/**
 * types/content.ts — Database entity types for content
 * (map directly to SQLite table columns)
 */

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
  related_life_topics_json?: string | null;
  redemptive_act?: string | null;
}

export interface CoachingTip {
  after_section: number;
  tip: string;
  genre_tag: string;
  tone?: 'observation' | 'question' | 'devotional';
}

export interface ChapterCoaching {
  questions: string[];
  observations: string[];
  reflections: string[];
  cross_refs?: string[];
}

export interface CoachingData {
  section_tips?: CoachingTip[];
  chapter_coaching?: ChapterCoaching;
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

/** Non-genealogical link types from #1288. */
export type AssociationType =
  | 'disciple'
  | 'contemporary'
  | 'adversary'
  | 'servant';

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
  /** Classification. `'allegorical'` excludes the person from the
   *  genealogy tree (Card #1289) while keeping the row in the content DB
   *  so commentary and search can still reference them. `'spine'` /
   *  `'satellite'` are derived at DB-build time from messianic spine
   *  membership. */
  type: 'spine' | 'satellite' | 'allegorical' | null;
  bio: string | null;
  scripture_role: string | null;
  refs_json: string | null;
  chapter_link: string | null;
  /** Anchor person for satellite figures with no biblical genealogy (#1288). */
  associated_with: string | null;
  /** Nature of the association (#1288). */
  association_type: AssociationType | null;
  /**
   * JSON array of `PersonGeographyStop` — chronological geographic arc
   * across the person's life. Populated by a Chat session (#1324);
   * runtime code renders it as a LineLayer + numbered markers.
   */
  geography_json?: string | null;
}

/** One stop on a person's life geographic arc. */
export interface PersonGeographyStop {
  /** References a row in places.json / places table. */
  place_id: string;
  /** App era id (patriarch / nt / kingdom / …). */
  era: string;
  /** 10–15 word description of what happened at this location. */
  event: string;
  /** 1-based chronological order within the person's arc. */
  order: number;
}

/** Row from people_journeys table (#1125). */
export interface PersonJourneyStage {
  id: number;
  person_id: string;
  stage_order: number;
  stage: string;
  era: string | null;
  book_dir: string | null;
  chapters: string | null;   // JSON array
  verse_ref: string | null;
  summary: string | null;
  theme: string | null;
}

/** Row from people_legacy_refs table (#1125). */
export interface PersonLegacyRef {
  id: number;
  person_id: string;
  ref: string;
  note: string | null;
}

/** Row from redemptive_acts table (#1118). */
export interface RedemptiveAct {
  id: string;
  act_order: number;
  name: string;
  tagline: string | null;
  summary: string | null;
  key_verse: string | null;
  era_ids: string | null;      // JSON array
  book_range: string | null;
  threads: string | null;      // JSON array
  prophecy_chains: string | null; // JSON array
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
  /** JSON-encoded array of verse-ref strings — added by Card #1271. */
  refs_json?: string | null;
  /** 1–1000 identification confidence from OpenBible.info (Card #1271). */
  confidence?: number | null;
  // ── Enrichment layer (#1323) ───────────────────────────────────
  /** 50–100 words of geographic + theological context. */
  description?: string | null;
  /** 1-sentence hook shown in the detail card header. */
  significance?: string | null;
  /** JSON array of verse-ref strings, each a tappable chip. */
  key_verses_json?: string | null;
  /** JSON array of `{ scholar_id, tradition, note, ref }` objects. */
  scholar_notes_json?: string | null;
  // ── Cross-testament history (#1325) ────────────────────────────
  /** JSON array of `{ ref, testament, event, era }` objects. */
  testament_history_json?: string | null;
}

/** Parsed shape of a `scholar_notes_json` entry. */
export interface PlaceScholarNote {
  scholar_id: string;
  tradition: string;
  note: string;
  ref?: string;
}

/** Parsed shape of a `testament_history_json` entry. */
export interface PlaceTestamentEvent {
  ref: string;
  testament: 'OT' | 'NT';
  event: string;
  era: string;
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

// ── Content Images (generic, Epic #1071 #1087) ─────────────

export interface ContentImage {
  id: number;
  content_type: string;
  content_id: string;
  url: string;
  caption: string | null;
  credit: string | null;
  display_order: number;
}
