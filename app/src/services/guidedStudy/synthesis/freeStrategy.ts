/**
 * Free synthesis strategy — Phase 3.2 (#1739).
 *
 * Reads CapturedInputs and the current mode, returns the mode-shaped
 * recap + clipboard/share/upgrade CTAs as SynthesisOutputBlock[]. No
 * persistence, no Amicus call, no streaming.
 */

import type { CapturedInputs } from '../capturedInputs';
import { getCapturedText, type CapturedTextRef } from '../stepBindings';
import type { GuidedStudyMode } from '../types';
import type {
  SynthesisOutputBlock,
  SynthesisRunResult,
  SynthesisStrategy,
} from './strategy';

interface RecapSection {
  label: string;
  ref: CapturedTextRef;
}

interface RecapConfig {
  /** Mode-specific card title (e.g. 'Your Quick Pass'). */
  title: string;
  sections: RecapSection[];
}

const RECAP_BY_MODE: Record<GuidedStudyMode, RecapConfig> = {
  quick: {
    title: 'Your Quick Pass',
    sections: [
      { label: 'Takeaway', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Verse to remember', ref: { step: 'synthesize', key: 'key_connection' } },
    ],
  },
  deep: {
    title: 'Your Deep Study',
    sections: [
      { label: 'Claim', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Evidence', ref: { step: 'synthesize', key: 'key_connection' } },
      { label: 'Tension still unresolved', ref: { step: 'synthesize', key: 'open_question' } },
    ],
  },
  teaching: {
    title: 'Your Teaching Outline',
    sections: [
      { label: 'Audience', ref: { step: 'scene', key: 'audience' } },
      { label: 'Setting', ref: { step: 'scene', key: 'setting' } },
      { label: 'Main point', ref: { step: 'observe', key: 'main_point' } },
      { label: 'Clarification', ref: { step: 'observe', key: 'clarification' } },
      { label: 'Outline', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Discussion question', ref: { step: 'synthesize', key: 'open_question' } },
    ],
  },
  devotional: {
    title: 'Your Devotional',
    sections: [
      { label: 'What met you', ref: { step: 'observe', key: 'primary' } },
      { label: 'Your prayer', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Carrying forward', ref: { step: 'synthesize', key: 'key_connection' } },
    ],
  },
};

/**
 * Mode-specific recap-card title (e.g. for use as the card heading
 * the renderer chooses to display). Exposed so the screen can title
 * the rendered card without re-deriving it.
 */
export function recapTitleFor(mode: GuidedStudyMode): string {
  return RECAP_BY_MODE[mode].title;
}

export function buildFreeSynthesisBlocks(
  mode: GuidedStudyMode,
  captured: CapturedInputs,
): SynthesisOutputBlock[] {
  const cfg = RECAP_BY_MODE[mode];
  const blocks: SynthesisOutputBlock[] = [];

  for (const section of cfg.sections) {
    const content = getCapturedText(captured, section.ref).trim();
    if (!content) continue;
    blocks.push({ type: 'recap_section', label: section.label, content });
  }

  // No recap content yet → return an empty descriptor list. The renderer
  // hides the card entirely in that case.
  if (blocks.length === 0) return [];

  blocks.push({ type: 'cta_button', label: 'Copy to clipboard', action: 'copy' });
  blocks.push({ type: 'cta_button', label: 'Share', action: 'share' });
  blocks.push({
    type: 'footer_note',
    text: 'Companion+ saves this for spaced review and brings it back when it matters.',
  });
  return blocks;
}

export const freeStrategy: SynthesisStrategy = {
  kind: 'free',
  async run(ctx): Promise<SynthesisRunResult> {
    return {
      kind: 'free',
      output: buildFreeSynthesisBlocks(ctx.plan.mode, ctx.captured),
      artifact: null,
    };
  },
};
