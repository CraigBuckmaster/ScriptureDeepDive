/**
 * types/explore.ts — Explore/feature types
 */

// ── Explore Image Cards (Epic #1071) ────────────────────────

export interface ExploreImage {
  url: string;
  caption: string;
  credit: string;
  deepLink: { screen: string; params?: Record<string, string> };
}

export interface ExploreFeatureImages {
  count: number | null;
  noun: string;
  images: ExploreImage[];
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
  tags_json: string | null;
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

// ── Archaeological Evidence ────────────────────────────────

export interface ArchaeologicalDiscovery {
  id: string;
  name: string;
  category: string;
  date_range?: string;
  location?: string;
  significance: string;
  description: string;
  image_url?: string;
  images_json?: string;
  source?: string;
  display_order: number;
}

export interface ArchaeologyVerseLink {
  id: number;
  discovery_id: string;
  verse_ref: string;
  relevance?: string;
}

export interface ArchaeologyImage {
  id: number;
  discovery_id: string;
  url: string;
  caption?: string;
  credit?: string;
  display_order: number;
}

// ── Historical Interpretations (Time-Travel Reader) ────────

export interface HistoricalInterpretation {
  id: string;
  verse_ref: string;
  era: string;
  era_label: string;
  author: string;
  author_dates?: string;
  source_title: string;
  source_date?: string;
  interpretation: string;
  context?: string;
  display_order: number;
}

export interface InterpretationEra {
  id: string;
  name: string;
  date_range: string;
  description: string;
  display_order: number;
}

// ── Grammar Articles ──────────────────────────────────────────

export interface GrammarArticle {
  id: string;
  title: string;
  language: string;
  category: string;
  summary: string;
  body: string;
  examples_json?: string;
  related_articles_json?: string;
  display_order: number;
}

// ── Community Submissions ────────────────────────────────────

export type SubmissionType = 'verse_collection' | 'personal_reflection' | 'topical_study';
export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Submission {
  id: string;
  type: SubmissionType;
  topic_id: string;
  title: string;
  body: string;
  status: SubmissionStatus;
  verses_json: string;
  scholars_json?: string;
  author_id: string;
  author_name: string;
  upvote_count: number;
  star_avg: number;
  created_at: string;
  updated_at: string;
}

// ── In-App Notifications ──────────────────────────────────────

export interface AppNotification {
  id: string;
  type: 'new_submission' | 'submission_approved' | 'submission_rejected' | 'trust_upgraded';
  title: string;
  body: string;
  target_id?: string;
  target_type?: string;
  is_read: boolean;
  created_at: string;
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

// ── Hermeneutic Lenses ──────────────────────────────────────

export interface HermeneuticLens {
  id: string;
  name: string;
  description: string;
  icon?: string;
  display_order: number;
}

export interface ChapterLensContent {
  id: number;
  chapter_id: string;
  lens_id: string;
  guidance: string;
  panel_filter_json?: string;
  panel_order_json?: string;
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
