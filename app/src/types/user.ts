/**
 * types/user.ts — User data types
 */

import type { Section } from './content';

export interface UserNote {
  id: number;
  verse_ref: string;
  note_text: string;
  created_at: string;
  updated_at: string;
  tags_json: string; // JSON array of tag strings
  collection_id: number | null; // FK to study_collections
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

/**
 * Canonical ordered list of guided study steps. Single source of truth — the
 * migration SQL `CHECK` constraint in `userDatabase.ts` must match this list,
 * and UI components (e.g. `StudySessionStepper`) pair it with label maps.
 * If you change this, update:
 *   1. The `CHECK` constraint on `guided_study_sessions.current_step` in userDatabase.ts
 *   2. `GUIDED_STUDY_STEP_LABELS` in `services/guidedStudy/types.ts`
 */
export const GUIDED_STUDY_STEPS = ['scene', 'observe', 'explore', 'synthesize', 'review'] as const;

export type GuidedStudyStep = (typeof GUIDED_STUDY_STEPS)[number];

export interface GuidedStudySession {
  id: number;
  chapter_id: string;
  status: 'active' | 'completed' | 'dismissed';
  current_step: GuidedStudyStep;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface GuidedStudyResponse {
  id: number;
  session_id: number;
  prompt_key: string;
  prompt_text: string;
  response_text: string;
  updated_at: string;
}

export interface GuidedStudySynthesis {
  id: number;
  session_id: number;
  takeaway: string;
  open_question: string;
  key_connection: string;
  updated_at: string;
}

export interface GuidedReviewItem {
  id: number;
  source_session_id: number;
  chapter_id: string;
  title: string;
  prompt: string;
  answer: string;
  due_date: string;
  interval_days: number;
  review_count: number;
  status: 'due' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ConceptEncounter {
  id: number;
  concept_id: string;
  concept_label: string;
  chapter_id: string;
  first_seen_at: string;
  last_seen_at: string;
  encounter_count: number;
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

// ── Amicus (#1457) ────────────────────────────────────────────

export interface AmicusThread {
  thread_id: string;
  title: string;
  chapter_ref: string | null; // e.g. "romans:9"
  pinned: boolean;
  created_at: string;
  last_message_at: string;
}

export interface AmicusCitation {
  chunk_id: string;
  source_type: string;
  display_label: string;
  scholar_id?: string;
}

export interface AmicusMessage {
  message_id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: AmicusCitation[];
  follow_ups: string[];
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
