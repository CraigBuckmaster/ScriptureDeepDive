/**
 * Synthesis strategy abstraction — Phase 3.2 (#1739).
 *
 * The screen needs a synthesis output without knowing which tier or
 * feature flag the user is on. Three concrete strategies hide behind
 * this interface:
 *   - free                 (this card, freeStrategy.ts)
 *   - premium_structured   (#1740 / Phase 3.3)
 *   - premium_amicus       (Phase 4 / #1745)
 *
 * Strategies return *descriptors* of the UI (SynthesisOutputBlock[])
 * rather than JSX so the renderer + tests + a future preview tool can
 * consume them without React-Native rendering machinery.
 */

import type { CapturedInputs } from '../capturedInputs';
import type { GuidedStudyPlan } from '../types';
import { freeStrategy } from './freeStrategy';
import { premiumAmicusStrategy } from './premiumAmicusStrategy';
import { premiumStructuredStrategy } from './premiumStructuredStrategy';

export type SynthesisStrategyKind = 'free' | 'premium_structured' | 'premium_amicus';

export interface SynthesisRunContext {
  plan: GuidedStudyPlan;
  captured: CapturedInputs;
  sessionId: number | null;
  bookId: string;
  chapterNum: number;
}

export interface CitationRef {
  /** Panel type that was opened during the explore step (e.g. 'hist'). */
  panelType: string;
  /** Optional short snippet/quote drawn from the panel. */
  snippet?: string;
}

export interface ReviewArtifact {
  kind: 'memory_verse' | 'analytical_claim' | 'teaching_outline' | 'returning_prayer';
  title: string;
  body: string;
}

export type SynthesisOutputBlock =
  | { type: 'recap_section'; label: string; content: string }
  | { type: 'cta_button'; label: string; action: 'copy' | 'share' | 'upgrade' }
  | { type: 'streaming_placeholder' }
  | { type: 'amicus_text'; html: string; citations: CitationRef[] }
  | { type: 'footer_note'; text: string };

export interface SynthesisRunResult {
  kind: SynthesisStrategyKind;
  output: SynthesisOutputBlock[];
  artifact: ReviewArtifact | null;
}

export interface SynthesisStrategyCallbacks {
  onAmicusDelta?: (token: string) => void;
  onAmicusComplete?: () => void;
  onError?: (err: Error) => void;
}

export interface SynthesisStrategy {
  kind: SynthesisStrategyKind;
  run(
    ctx: SynthesisRunContext,
    callbacks?: SynthesisStrategyCallbacks,
  ): Promise<SynthesisRunResult>;
}

export interface ChooseStrategyArgs {
  isPremium: boolean;
  amicusFlagEnabled: boolean;
  /** Result of useAmicusAccess.canUse. */
  amicusCanUse: boolean;
}

/**
 * Pick a strategy without looking at the rendered UI.
 *
 *   - non-premium                                 → free
 *   - premium + flag on + amicus access available → premium_amicus
 *   - premium otherwise                           → premium_structured
 */
export function chooseStrategy(args: ChooseStrategyArgs): SynthesisStrategy {
  if (!args.isPremium) return freeStrategy;
  if (args.amicusFlagEnabled && args.amicusCanUse) return premiumAmicusStrategy;
  return premiumStructuredStrategy;
}
