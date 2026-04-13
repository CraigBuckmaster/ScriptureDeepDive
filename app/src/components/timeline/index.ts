/**
 * components/timeline — Vertical timeline building blocks.
 *
 * Part of Card #1264 (Timeline Phase 1).
 */

export {
  TimelineEraStrip,
  computeEraShares,
  firstWord,
  formatEraRange,
} from './TimelineEraStrip';
export type { TimelineEraStripProps } from './TimelineEraStrip';

export {
  TimelineEventCard,
  formatTimelineYear,
  parsePeopleJson,
  parseChapterLink,
} from './TimelineEventCard';
export type { TimelineEventCardProps } from './TimelineEventCard';

export { TimelineSpine, SPINE_GUTTER_WIDTH } from './TimelineSpine';
export type { TimelineSpineProps } from './TimelineSpine';
