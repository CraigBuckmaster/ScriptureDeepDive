/**
 * services/guidedStudy/timeBudget.ts — Time-adaptive sessions (#1842).
 *
 * "I have 10 minutes" produces a shorter, honest session: the evidence
 * trail is sorted by the mode's panelWeights and sliced to fit the
 * budget using per-panel minute estimates (estimate.ts heuristics).
 * Everything that doesn't fit comes back as a deferred list the
 * session persists (deferred_trail_json, migration v26 — owned by
 * #1835; this issue adds NO migration) so the next plan-linked session
 * can front-load it.
 */
import { estimatePanelMinutes } from './estimate';
import type {
  GuidedEvidenceTrailItem,
  GuidedStudyPlanInput,
} from './types';

/** Fallback minutes for a trail item whose panel content can't be located. */
const DEFAULT_ITEM_MINUTES = 3;

export interface BudgetedTrail {
  trail: GuidedEvidenceTrailItem[];
  deferredTrail: GuidedEvidenceTrailItem[];
}

/** Locate a trail item's panel content_json inside the plan input. */
function findContentJson(
  input: GuidedStudyPlanInput,
  item: GuidedEvidenceTrailItem,
): string | null {
  if (item.sectionNum != null) {
    const section = input.sections.find((s) => s.section_num === item.sectionNum);
    return section?.panels.find((p) => p.panel_type === item.panelType)?.content_json ?? null;
  }
  return input.chapterPanels.find((p) => p.panel_type === item.panelType)?.content_json ?? null;
}

/** Minutes estimate for one trail item. */
export function estimateTrailItemMinutes(
  input: GuidedStudyPlanInput,
  item: GuidedEvidenceTrailItem,
): number {
  const contentJson = findContentJson(input, item);
  return contentJson != null ? estimatePanelMinutes(contentJson) : DEFAULT_ITEM_MINUTES;
}

/**
 * Apply a minute budget to the trail. No budget → the trail passes
 * through untouched (byte-identical to pre-#1842 output) with an empty
 * deferred list. With a budget: sort by the mode's panelWeights
 * (heaviest first, original order as tiebreak), keep items while they
 * fit — always at least one, so a small budget still yields a session
 * rather than an empty trail — and defer the rest.
 */
export function applyTimeBudget(
  fullTrail: GuidedEvidenceTrailItem[],
  input: GuidedStudyPlanInput,
  panelWeights: Readonly<Record<string, number>>,
): BudgetedTrail {
  const budget = input.timeBudgetMin;
  if (budget == null || fullTrail.length === 0) {
    return { trail: fullTrail, deferredTrail: [] };
  }

  const byWeight = fullTrail
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        (panelWeights[b.item.panelType] ?? 0) - (panelWeights[a.item.panelType] ?? 0) ||
        a.index - b.index,
    )
    .map(({ item }) => item);

  const trail: GuidedEvidenceTrailItem[] = [];
  const deferredTrail: GuidedEvidenceTrailItem[] = [];
  let spentMin = 0;
  for (const item of byWeight) {
    const minutes = estimateTrailItemMinutes(input, item);
    if (trail.length === 0 || spentMin + minutes <= budget) {
      trail.push(item);
      spentMin += minutes;
    } else {
      deferredTrail.push(item);
    }
  }

  return { trail, deferredTrail };
}

/**
 * Reorder a trail so items whose trail kind (the `kind:` prefix of the
 * item key) was deferred in the plan's previous session come first
 * (#1842 spec 3). Keys are chapter-specific, so matching happens on
 * the kind — "you deferred language study last time, so it leads
 * today" — while relative order inside each group is preserved.
 */
export function prependDeferredKinds(
  trail: GuidedEvidenceTrailItem[],
  deferredKeys: string[],
): GuidedEvidenceTrailItem[] {
  if (deferredKeys.length === 0) return trail;
  const kinds = new Set(deferredKeys.map((key) => key.split(':')[0]));
  const front = trail.filter((item) => kinds.has(item.key.split(':')[0]));
  if (front.length === 0) return trail;
  const rest = trail.filter((item) => !kinds.has(item.key.split(':')[0]));
  return [...front, ...rest];
}
