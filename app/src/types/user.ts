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
