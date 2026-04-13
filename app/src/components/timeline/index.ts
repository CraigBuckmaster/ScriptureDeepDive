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

// ── Card #1266 (Timeline Phase 2 — intelligence layer) ───────────────
export { PersonFilterBar } from './PersonFilterBar';
export type { PersonFilterBarProps } from './PersonFilterBar';

export { ContemporaryRow, computeContemporaries } from './ContemporaryRow';
export type { ContemporaryRowProps, Contemporary } from './ContemporaryRow';

export { ContemporaryLane, MAX_LANES } from './ContemporaryLane';
export type { ContemporaryLaneProps } from './ContemporaryLane';

export { EraContextPanel, splitCommaList } from './EraContextPanel';
export type { EraContextPanelProps } from './EraContextPanel';
