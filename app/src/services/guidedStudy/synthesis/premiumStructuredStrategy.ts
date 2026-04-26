/**
 * Premium structured synthesis strategy — Phase 3.3 (#1740).
 *
 * The premium experience that ships even with GUIDED_STUDY_AMICUS_SYNTHESIS
 * off. Reuses the same mode-shaped form the free path renders for the
 * recap, plus:
 *   - persists the typed ReviewArtifact to guided_study_sessions.
 *     mode_artifact_json
 *   - records strategy='premium_structured' on the session
 *   - enqueues spaced-review rows in guided_review_items (idempotent —
 *     re-runs on the same session replace rather than duplicate)
 */

import {
  replaceGuidedReviewItems,
  setModeArtifact,
  setSynthesisStrategy,
} from '../../../db/userMutations';
import { logger } from '../../../utils/logger';
import { artifactToReviewRows, buildArtifact } from '../review/artifacts';
import { REVIEW_INTERVAL_DAYS } from '../review';
import type { CapturedInputs } from '../capturedInputs';
import { getCapturedText, type CapturedTextRef } from '../stepBindings';
import type { GuidedStudyMode } from '../types';
import type { SynthesisOutputBlock, SynthesisStrategy } from './strategy';

interface RecapSection {
  label: string;
  ref: CapturedTextRef;
}

const RECAP_SECTIONS_BY_MODE: Record<GuidedStudyMode, RecapSection[]> = {
  quick: [
    { label: 'Takeaway', ref: { step: 'synthesize', key: 'takeaway' } },
    { label: 'Verse to remember', ref: { step: 'synthesize', key: 'key_connection' } },
  ],
  deep: [
    { label: 'Claim', ref: { step: 'synthesize', key: 'takeaway' } },
    { label: 'Evidence', ref: { step: 'synthesize', key: 'key_connection' } },
    { label: 'Tension still unresolved', ref: { step: 'synthesize', key: 'open_question' } },
  ],
  teaching: [
    { label: 'Audience', ref: { step: 'scene', key: 'audience' } },
    { label: 'Setting', ref: { step: 'scene', key: 'setting' } },
    { label: 'Main point', ref: { step: 'observe', key: 'main_point' } },
    { label: 'Clarification', ref: { step: 'observe', key: 'clarification' } },
    { label: 'Outline', ref: { step: 'synthesize', key: 'takeaway' } },
    { label: 'Discussion question', ref: { step: 'synthesize', key: 'open_question' } },
  ],
  devotional: [
    { label: 'What met you', ref: { step: 'observe', key: 'primary' } },
    { label: 'Your prayer', ref: { step: 'synthesize', key: 'takeaway' } },
    { label: 'Carrying forward', ref: { step: 'synthesize', key: 'key_connection' } },
  ],
};

export function buildPremiumStructuredBlocks(
  mode: GuidedStudyMode,
  captured: CapturedInputs,
): SynthesisOutputBlock[] {
  const blocks: SynthesisOutputBlock[] = [];
  for (const section of RECAP_SECTIONS_BY_MODE[mode]) {
    const content = getCapturedText(captured, section.ref).trim();
    if (!content) continue;
    blocks.push({ type: 'recap_section', label: section.label, content });
  }
  if (blocks.length === 0) return [];
  blocks.push({
    type: 'confirmation',
    text: 'Saved for spaced review — your future self will see this again.',
  });
  blocks.push({ type: 'cta_button', label: 'View in My Study', action: 'view_my_study' });
  return blocks;
}

export const premiumStructuredStrategy: SynthesisStrategy = {
  kind: 'premium_structured',
  async run(ctx) {
    const artifact = buildArtifact(ctx.plan.mode, ctx.captured, {
      chapterTitle: ctx.plan.title,
    });

    if (ctx.sessionId != null) {
      try {
        await setModeArtifact(ctx.sessionId, artifact);
        await setSynthesisStrategy(ctx.sessionId, 'premium_structured');
        const rows = artifactToReviewRows(artifact, { chapterTitle: ctx.plan.title }).map((r) => ({
          ...r,
          intervalDays: REVIEW_INTERVAL_DAYS[0],
        }));
        await replaceGuidedReviewItems(ctx.sessionId, ctx.plan.chapterId, ctx.plan.title, rows);
      } catch (err) {
        logger.warn('premiumStructured', 'persist failed', err);
      }
    }

    return {
      kind: 'premium_structured',
      output: buildPremiumStructuredBlocks(ctx.plan.mode, ctx.captured),
      artifact,
    };
  },
};
