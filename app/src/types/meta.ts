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
