/**
 * components/explore — Layout components specific to the Explore screen.
 *
 * Part of Card #1263 (Explore redesign).
 */

export {
  ProphecyChainCard,
  parseChainLinks,
  formatRange,
  PROPHECY_CHAIN_CARD_WIDTH,
} from './ProphecyChainCard';
export type { ProphecyChainCardProps } from './ProphecyChainCard';

export {
  DebatePreviewList,
  countPositions,
  pickTopDebates,
} from './DebatePreviewList';
export type { DebatePreviewListProps } from './DebatePreviewList';

export {
  WordStudyPreviewList,
  parseFirstGloss,
  countOccurrences,
} from './WordStudyPreviewList';
export type { WordStudyPreviewListProps } from './WordStudyPreviewList';

export { LifeTopicGrid, pickTopCategories } from './LifeTopicGrid';
export type { LifeTopicGridProps } from './LifeTopicGrid';

export { FullWidthImageCard } from './FullWidthImageCard';
export type { FullWidthImageCardProps } from './FullWidthImageCard';

export { GoldSeparator } from './GoldSeparator';
export type { GoldSeparatorProps } from './GoldSeparator';

export { GlossySectionWrapper } from './GlossySectionWrapper';
