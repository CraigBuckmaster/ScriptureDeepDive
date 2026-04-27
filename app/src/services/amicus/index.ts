/**
 * services/amicus/index.ts — Public entry point for the Amicus service layer.
 *
 * Keep the surface small: callers should use `retrieve()` and the shared
 * types. Internals (rerank, vectorSearch, embed) are importable for tests
 * but not part of the public contract.
 */
export { retrieve } from './retrieval';
export type { RetrievalResult, RetrieveOptions } from './retrieval';
export {
  buildAmicusContextEnvelope,
  chapterRefFromChipContext,
  formatAmicusContextLabel,
  normalizeChapterRef,
  prettyBookId,
  serializeAmicusChapterRef,
} from './context';
export { buildStudyActionSeeds } from './studyActions';
export { launchAmicusStudyThread } from './studyLaunch';
export { promotePeekToThread } from './promotePeekToThread';
export {
  deriveThreadIntelligence,
  shouldAutoRenameThread,
  summarizeLinkedQuestionState,
} from './threadIntelligence';
export { formatTrustStanceLabel, summarizeAmicusTrust } from './trust';
export type { AmicusContextEnvelope, AmicusEntryPoint, AmicusGuidedStudyContext } from './context';
export type { AmicusStudyActionKey, AmicusStudyActionSeed } from './studyActions';
export type { LaunchAmicusStudyThreadInput } from './studyLaunch';
export type { PromotePeekResult, PromotePeekToThreadInput } from './promotePeekToThread';
export type { DerivedThreadIntelligence } from './threadIntelligence';
export type { AmicusTrustStance, AmicusTrustSummary } from './trust';
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
