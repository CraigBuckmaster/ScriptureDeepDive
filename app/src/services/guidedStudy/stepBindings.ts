/**
 * stepBindings — Phase 2.6 (#1735) glue between rendered prompts /
 * captured inputs / carry-forward banner content.
 *
 * Two responsibilities:
 *
 * 1. PROMPT_BINDINGS maps each `GuidedPrompt.key` declared in
 *    MODE_DEFINITIONS to the (step, key) location inside CapturedInputs
 *    where the user's response should land.
 *
 * 2. CARRY_FORWARD_BY_MODE_STEP defines which prior-step capture fields
 *    each (mode, step) renders in its CarriedForwardBanner, with the
 *    visible label for each surfaced item.
 *
 * Both maps are pure data so they're trivial to test and extend.
 */

import type { CarriedForwardItem } from '../../components/guidedStudy/CarriedForwardBanner';
import type { CapturedInputs } from './capturedInputs';
import type { GuidedStudyMode, GuidedStudyStep } from './types';

export type CapturedTextRef =
  | { step: 'scene'; key: 'genre_response' | 'audience' | 'setting' | 'arrival' }
  | {
      step: 'observe';
      key:
        | 'primary'
        | 'surprises'
        | 'confusions'
        | 'repetitions'
        | 'main_point'
        | 'clarification';
    }
  | { step: 'synthesize'; key: 'takeaway' | 'open_question' | 'key_connection' };

/**
 * For each mode-prompt key, where the user's text response is persisted.
 * Prompts that do not have a binding (e.g. explore-step "which panel
 * helps?" prompts) are intentionally absent — the screen renders them
 * as labels rather than text inputs.
 */
export const PROMPT_BINDINGS: Record<string, CapturedTextRef> = {
  // Quick
  'quick-scene-genre': { step: 'scene', key: 'genre_response' },
  'quick-observe-takeaway': { step: 'observe', key: 'primary' },
  'quick-synthesize-summary': { step: 'synthesize', key: 'takeaway' },

  // Deep
  'deep-scene-tensions': { step: 'scene', key: 'genre_response' },
  'deep-observe-surprise': { step: 'observe', key: 'surprises' },
  'deep-observe-confusion': { step: 'observe', key: 'confusions' },
  'deep-observe-repetition': { step: 'observe', key: 'repetitions' },
  'deep-synthesize-claim': { step: 'synthesize', key: 'takeaway' },

  // Teaching
  'teaching-observe-main-point': { step: 'observe', key: 'main_point' },
  'teaching-observe-misread': { step: 'observe', key: 'clarification' },
  'teaching-synthesize-outline': { step: 'synthesize', key: 'takeaway' },

  // Devotional
  'devotional-observe-meeting': { step: 'observe', key: 'primary' },
  'devotional-synthesize-prayer': { step: 'synthesize', key: 'takeaway' },

  // Review-step prompts (#1736 — feed SynthesisFreeRecap). Each mode's
  // review prompt persists into the closest reusable synthesize slot.
  'quick-review-carry': { step: 'synthesize', key: 'key_connection' },
  'deep-review-connection': { step: 'synthesize', key: 'key_connection' },
  'teaching-review-check': { step: 'synthesize', key: 'open_question' },
  'devotional-review-carry': { step: 'synthesize', key: 'key_connection' },
};

export function getPromptBinding(promptKey: string): CapturedTextRef | undefined {
  return PROMPT_BINDINGS[promptKey];
}

export function getCapturedText(
  captured: CapturedInputs,
  ref: CapturedTextRef,
): string {
  const stepBucket = captured[ref.step];
  if (!stepBucket) return '';
  // Each ref.key is a string-valued field in its bucket — see the type
  // unions on CapturedInputs and CapturedTextRef.
  const value = (stepBucket as Record<string, unknown>)[ref.key];
  return typeof value === 'string' ? value : '';
}

export function setCapturedText(
  captured: CapturedInputs,
  ref: CapturedTextRef,
  value: string,
): CapturedInputs {
  const prevBucket = (captured[ref.step] ?? {}) as Record<string, unknown>;
  const nextBucket = { ...prevBucket, [ref.key]: value };
  return { ...captured, [ref.step]: nextBucket } as CapturedInputs;
}

interface CarryForwardSpec {
  ref: CapturedTextRef;
  label: string;
}

/**
 * Per (mode, step), the list of prior-step capture refs to surface in the
 * CarriedForwardBanner, with their visible label. Empty refs are filtered
 * out at render time so the banner is silent until there's something to
 * carry.
 */
const CARRY_FORWARD_BY_MODE_STEP: Record<
  GuidedStudyMode,
  Partial<Record<GuidedStudyStep, CarryForwardSpec[]>>
> = {
  quick: {
    observe: [
      {
        ref: { step: 'scene', key: 'genre_response' },
        label: "What's happening in this chapter",
      },
    ],
    synthesize: [{ ref: { step: 'observe', key: 'primary' }, label: 'Your one thing' }],
    review: [
      { ref: { step: 'synthesize', key: 'takeaway' }, label: 'Your one-sentence summary' },
    ],
  },
  deep: {
    explore: [
      { ref: { step: 'observe', key: 'surprises' }, label: 'What you noticed' },
    ],
    synthesize: [
      { ref: { step: 'observe', key: 'surprises' }, label: 'What you noticed' },
      // Phase 2.6 has no explore-step text capture, so this slot stays
      // empty in practice — listed here per the #1732 mapping table so a
      // future card (most_helpful_panel_type tracking) drops in cleanly.
    ],
    review: [{ ref: { step: 'synthesize', key: 'takeaway' }, label: 'Your claim' }],
  },
  teaching: {
    observe: [{ ref: { step: 'scene', key: 'audience' }, label: 'Your audience' }],
    explore: [
      { ref: { step: 'observe', key: 'main_point' }, label: 'Your main point' },
    ],
    synthesize: [
      { ref: { step: 'scene', key: 'audience' }, label: 'Your audience' },
      { ref: { step: 'observe', key: 'main_point' }, label: 'Your main point' },
    ],
    review: [{ ref: { step: 'synthesize', key: 'takeaway' }, label: 'Your outline' }],
  },
  devotional: {
    observe: [
      { ref: { step: 'scene', key: 'arrival' }, label: 'What you brought today' },
    ],
    synthesize: [
      { ref: { step: 'scene', key: 'arrival' }, label: 'What you brought' },
      { ref: { step: 'observe', key: 'primary' }, label: 'What met you' },
    ],
    review: [{ ref: { step: 'synthesize', key: 'takeaway' }, label: 'Your prayer' }],
  },
};

export function buildCarryForwardItems(
  mode: GuidedStudyMode,
  step: GuidedStudyStep,
  captured: CapturedInputs,
): CarriedForwardItem[] {
  const specs = CARRY_FORWARD_BY_MODE_STEP[mode]?.[step] ?? [];
  const items: CarriedForwardItem[] = [];
  for (const spec of specs) {
    const content = getCapturedText(captured, spec.ref).trim();
    if (!content) continue;
    items.push({ sourceStep: spec.ref.step, label: spec.label, content });
  }

  // Observation-chip selections (#1839) carry into Explore/Synthesize
  // alongside typed text, rendered as a chip list by the banner.
  if (step === 'explore' || step === 'synthesize') {
    const selections = (captured.observeSelections ?? []).filter(
      (s) => typeof s === 'string' && s.trim().length > 0,
    );
    if (selections.length > 0) {
      items.push({
        sourceStep: 'observe',
        label: 'What you marked',
        content: selections.join(' · '),
        chips: selections,
      });
    }
  }

  return items;
}

/**
 * Which steps currently have non-empty carry-forward content for the
 * given mode + captured state. Used to render the small "carry-forward
 * available" dot on the stepper.
 */
export function stepsWithCarryForward(
  mode: GuidedStudyMode,
  captured: CapturedInputs,
): Set<GuidedStudyStep> {
  const result = new Set<GuidedStudyStep>();
  const stepMap = CARRY_FORWARD_BY_MODE_STEP[mode] ?? {};
  for (const step of Object.keys(stepMap) as GuidedStudyStep[]) {
    if (buildCarryForwardItems(mode, step, captured).length > 0) {
      result.add(step);
    }
  }
  return result;
}
