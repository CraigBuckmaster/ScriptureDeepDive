/**
 * services/amicus/types.ts — Shared types for the Amicus service layer.
 *
 * Source types listed here mirror the chunker in `_tools/build_embeddings_chunks.py`
 * and the Worker's `ai-proxy/src/types.ts`. Keep them aligned.
 */

export type ChunkSourceType =
  | 'section_panel'
  | 'chapter_panel'
  | 'word_study'
  | 'lexicon_entry'
  | 'debate_topic'
  | 'cross_ref_thread_note'
  | 'journey_stop'
  | 'meta_faq';

export interface ChunkMetadata {
  scholar_id?: string;
  tradition?: string;
  book_id?: string;
  chapter_num?: number;
  verse_start?: number;
  verse_end?: number;
  panel_type?: string;
}

export interface RetrievedChunk {
  chunk_id: string;
  source_type: ChunkSourceType;
  source_id: string;
  text: string;
  /** Final score after all boosts and normalizations. Higher is more relevant. */
  score: number;
  metadata: ChunkMetadata;
}

/**
 * Snapshot of a user's study profile used for re-ranking.
 *
 * Produced by `generateProfile()` in #1452. Retained here as a structural
 * type so we don't take a hard import dependency on the profile module
 * before #1452 ships.
 */
export interface CompressedProfile {
  prose: string;
  preferred_scholars: string[];
  preferred_traditions: string[];
}

export interface ChapterRef {
  book_id: string;
  chapter_num: number;
}

export interface RetrievalContext {
  query: string;
  profile: CompressedProfile;
  currentChapterRef: ChapterRef | null;
}

/** Union of all typed retrieval failures. */
export type AmicusErrorCode =
  | 'EMBED_FAILED'
  | 'EXTENSION_NOT_LOADED'
  | 'OFFLINE'
  | 'PROXY_UNAUTHORIZED';

export class AmicusError extends Error {
  readonly code: AmicusErrorCode;
  constructor(code: AmicusErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'AmicusError';
  }
}
