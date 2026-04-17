/**
 * services/amicus/index.ts — Public entry point for the Amicus service layer.
 *
 * Keep the surface small: callers should use `retrieve()` and the shared
 * types. Internals (rerank, vectorSearch, embed) are importable for tests
 * but not part of the public contract.
 */
export { retrieve } from './retrieval';
export type { RetrievalResult, RetrieveOptions } from './retrieval';
export { AmicusError } from './types';
export type {
  AmicusErrorCode,
  ChunkSourceType,
  ChunkMetadata,
  CompressedProfile,
  ChapterRef,
  RetrievalContext,
  RetrievedChunk,
} from './types';
