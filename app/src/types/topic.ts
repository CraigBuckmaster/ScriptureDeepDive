/**
 * types/topic.ts — Type definitions for the Topical Index feature.
 */

export interface TopicVerse {
  ref: string;
  text: string;
  note?: string;
}

export interface Subtopic {
  label: string;
  verses: TopicVerse[];
}

/** Raw DB row — JSON columns are unparsed strings. */
export interface Topic {
  id: string;
  title: string;
  category: string;
  description: string;
  tags_json: string;
  subtopics_json: string;
  related_concept_ids_json: string | null;
  related_thread_ids_json: string | null;
  related_prophecy_ids_json: string | null;
  relevant_chapters_json: string | null;
}
