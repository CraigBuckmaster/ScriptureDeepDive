/**
 * types/meta.ts — Parsed panel content types
 * (what you get after JSON.parse on content_json fields)
 */

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

/**
 * Second Temple Context (st2) panel payload.
 * Matches the pipeline schema from HWGTB-P1-03 (#1540) and the authored
 * content in HWGTB-P1-06 (#1543).
 */
export type St2CitationType = 'direct_quotation' | 'allusion' | 'echo';

export interface St2CitationRef {
  nt: string;
  source?: string;
  type?: St2CitationType;
}

export interface St2ScholarVoice {
  scholar_id: string;
  tradition?: string;
  note: string;
}

export interface SecondTemplePanelPayload {
  header: string;
  body: string;
  extrabiblical_ids: string[];
  citation_refs: St2CitationRef[];
  scholar_voices?: St2ScholarVoice[];
  takeaway?: string;
}

// ── Extra-biblical literature (HWGTB #1538 / #1541) ──────────────────

export type ExtrabiblicalCategory =
  | 'apocrypha'
  | 'pseudepigrapha'
  | 'dss'
  | 'deuterocanon';

export interface ExtrabiblicalTraditionStatus {
  protestant: string;
  catholic: string;
  eastern_orthodox: string;
  ethiopian_tewahedo: string;
}

/** Summary row used by the index screen's FlatList. */
export interface ExtrabiblicalSummary {
  id: string;
  title: string;
  category: ExtrabiblicalCategory | null;
  brief_summary: string;
  also_known_as: string[];
  tradition_status: ExtrabiblicalTraditionStatus;
}

// Parsed sub-shapes used by ExtraBiblicalDetailScreen (HWGTB-P2-03).

export type ExtrabiblicalCitationType = 'direct_quotation' | 'allusion' | 'echo';

export interface ExtrabiblicalNTCitation {
  ref: string;
  cites: string;
  type?: ExtrabiblicalCitationType;
}

export interface ExtrabiblicalOTAllusion {
  ref: string;
  connection: string;
}

export interface ExtrabiblicalScholarVoice {
  scholar_id: string;
  position: string;
}

export interface ExtrabiblicalFurtherReading {
  title: string;
  author?: string;
  note?: string;
  /** Present if future entries add external links; the Phase-1 seed
   *  (#1541) uses text-only references so this is rarely populated. */
  url?: string;
}

/** Parsed entry — what the Detail screen consumes after JSON.parse. */
export interface ExtrabiblicalEntry {
  id: string;
  title: string;
  also_known_as: string[];
  category: ExtrabiblicalCategory | null;
  estimated_date: string | null;
  original_language: string | null;
  tradition_status: ExtrabiblicalTraditionStatus;
  brief_summary: string;
  full_summary: string | null;
  nt_citations: ExtrabiblicalNTCitation[];
  ot_allusions: ExtrabiblicalOTAllusion[];
  scholar_voices: ExtrabiblicalScholarVoice[];
  related_debate_ids: string[];
  related_journey_ids: string[];
  related_difficult_passage_ids: string[];
  tags: string[];
  further_reading: ExtrabiblicalFurtherReading[];
}

/** Raw row as stored in SQLite (serialized JSON columns). */
export interface ExtrabiblicalRow {
  id: string;
  title: string;
  also_known_as_json: string | null;
  category: ExtrabiblicalCategory | null;
  estimated_date: string | null;
  original_language: string | null;
  tradition_status_json: string;
  brief_summary: string;
  full_summary: string | null;
  nt_citations_json: string | null;
  ot_allusions_json: string | null;
  scholar_voices_json: string | null;
  related_debate_ids_json: string | null;
  related_journey_ids_json: string | null;
  related_difficult_passage_ids_json: string | null;
  tags_json: string | null;
  further_reading_json: string | null;
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

/** Enriched outline item with range string and summary (#1112). */
export interface BookIntroEnrichedOutlineItem {
  label: string;
  range: string;
  summary: string;
}

/** Key verse with reference, text, and significance (#1112). */
export interface BookIntroKeyVerse {
  ref: string;
  text: string;
  why: string;
}

/** At-a-glance metadata for quick book overview (#1112). */
export interface BookIntroAtAGlance {
  author: string;
  date: string;
  chapters: number | string;
  genre: string;
  key_theme: string;
  key_word: string;
}

export interface ParsedBookIntro {
  title?: string;
  subtitle?: string;
  authorship?: string | BookIntroAuthorship;
  sections?: BookIntroSection[];
  text?: string;
  /* Enrichment fields (#1112) */
  era?: string;
  era_span?: string[];
  purpose?: string;
  key_verses?: BookIntroKeyVerse[];
  christ_in?: string;
  outline?: BookIntroEnrichedOutlineItem[];
  at_a_glance?: BookIntroAtAGlance;
}
