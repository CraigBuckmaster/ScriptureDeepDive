/**
 * Premium Amicus synthesis strategy — Phase 4.2 (#1745).
 *
 * Behind the GUIDED_STUDY_AMICUS_SYNTHESIS flag. When the flag is on AND
 * the user has premium AND useAmicusAccess.canUse, the synthesize step
 * routes through this strategy instead of premiumStructured.
 *
 * Flow:
 *   1. Build mode-specific Amicus system prompt (#1744).
 *   2. Stream the draft via the existing streamChat (Epic #1446).
 *   3. Parse the labelled response into the typed ReviewArtifact.
 *   4. Persist artifact + strategy + replaceGuidedReviewItems.
 *   5. Emit output blocks for SynthesisPremiumDraft to render.
 *
 * The caller (the screen) owns AbortSignal via ctx.abortSignal and the
 * streaming UI via onAmicusDelta/onAmicusComplete callbacks.
 */

import {
  replaceGuidedReviewItems,
  setModeArtifact,
  setSynthesisStrategy,
} from '../../../db/userMutations';
import { getAmicusAuthToken } from '../../amicus/authToken';
import { streamChat } from '../../amicus/chat';
import { buildGuidedStudySystemPrompt } from '../../amicus/prompts/guidedStudy';
import { logger } from '../../../utils/logger';
import { artifactToReviewRows } from '../review/artifacts';
import { REVIEW_INTERVAL_DAYS } from '../review';
import type { CapturedInputs } from '../capturedInputs';
import type { GuidedStudyMode } from '../types';
import type {
  CitationRef,
  ReviewArtifact,
  SynthesisOutputBlock,
  SynthesisStrategy,
  SynthesisStrategyCallbacks,
} from './strategy';

function extractModeContext(
  mode: GuidedStudyMode,
  captured: CapturedInputs,
): Record<string, string> {
  const scene = captured.scene ?? {};
  if (mode === 'teaching') {
    return {
      audience: typeof scene.audience === 'string' ? scene.audience : '',
      setting: typeof scene.setting === 'string' ? scene.setting : '',
    };
  }
  if (mode === 'devotional') {
    return { arrival: typeof scene.arrival === 'string' ? scene.arrival : '' };
  }
  return {};
}

const LABEL_TO_KEY: Record<GuidedStudyMode, Record<string, string>> = {
  quick: {
    // Quick prompt asks for a single 60-word takeaway; no labels.
  },
  deep: {
    CLAIM: 'claim',
    EVIDENCE: 'evidence',
    TENSION: 'tension',
    UNRESOLVED: 'unresolved',
  },
  teaching: {
    HOOK: 'hook',
    'MAIN POINT': 'mainPoint',
    'SUPPORTING MOVES': 'moves',
    APPLICATION: 'application',
    'DISCUSSION QUESTION': 'discussionQuestion',
  },
  devotional: {
    'WHAT GOD MAY BE SAYING': 'sayingTo',
    PRAYER: 'prayer',
    'CARRY-FORWARD': 'carryForward',
  },
};

/**
 * Tolerant label-based extractor. Normalises markdown bold and leading
 * enumerators (`1.` / `1)` / `*` / `-`) per line so the labelled-section
 * regex stays simple. For each label, pulls the text following `LABEL`
 * (any of `:` / `—` / `-` separators) up until the next LABEL or end of
 * text. Whitespace-trimmed.
 */
export function parseLabeledSections(
  text: string,
  labels: string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  if (labels.length === 0) return result;
  const normalized = text
    .replace(/\*\*/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*])\s*/, ''))
    .join('\n');
  const labelPattern = labels.map((l) => l.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
  const regex = new RegExp(
    `(?:^|\\n)\\s*(${labelPattern})\\s*[:—-]\\s*([\\s\\S]*?)(?=(?:\\n\\s*(?:${labelPattern})\\s*[:—-])|$)`,
    'gi',
  );
  let m: RegExpExecArray | null;
  while ((m = regex.exec(normalized)) !== null) {
    const label = m[1].toUpperCase();
    const body = (m[2] ?? '').trim();
    if (!result[label]) result[label] = body;
  }
  return result;
}

export function parseModeArtifact(
  mode: GuidedStudyMode,
  text: string,
  captured: CapturedInputs,
  chapterRef: string,
): ReviewArtifact {
  const labels = Object.keys(LABEL_TO_KEY[mode]);
  const sections = parseLabeledSections(text, labels);
  switch (mode) {
    case 'quick':
      return {
        type: 'memory_verse',
        verseRef: chapterRef,
        verseText: text.trim().split(/\n+/).slice(-1)[0] ?? '',
        takeaway: text.trim(),
      };
    case 'deep':
      return {
        type: 'analytical_claim',
        claim: sections.CLAIM ?? '',
        evidence: sections.EVIDENCE ?? '',
        tension: sections.TENSION ? sections.TENSION : null,
      };
    case 'teaching': {
      const movesRaw = sections['SUPPORTING MOVES'] ?? '';
      const moves = movesRaw
        .split(/\n+/)
        .map((s) => s.replace(/^[-*\d.)\s]+/, '').trim())
        .filter(Boolean);
      return {
        type: 'teaching_outline',
        audience:
          typeof captured.scene?.audience === 'string' ? captured.scene.audience : '',
        mainPoint: sections['MAIN POINT'] ?? '',
        moves,
        application: sections.APPLICATION ?? '',
        discussionQuestion: sections['DISCUSSION QUESTION'] ?? '',
      };
    }
    case 'devotional':
      return {
        type: 'returning_prayer',
        arrival: typeof captured.scene?.arrival === 'string' ? captured.scene.arrival : '',
        wordOrPhrase:
          typeof captured.observe?.primary === 'string' ? captured.observe.primary : '',
        prayer: sections.PRAYER ?? '',
        carryForward: sections['CARRY-FORWARD'] ?? '',
      };
  }
}

export function buildAmicusOutputBlocks(
  fullText: string,
  artifact: ReviewArtifact,
  citations: CitationRef[] = [],
): SynthesisOutputBlock[] {
  const blocks: SynthesisOutputBlock[] = [];
  if (fullText.trim().length > 0) {
    blocks.push({ type: 'amicus_text', html: fullText, citations });
  }
  blocks.push({
    type: 'confirmation',
    text: 'Saved to your study — Amicus drafted this from what you opened.',
  });
  blocks.push({ type: 'cta_button', label: 'View in My Study', action: 'view_my_study' });
  // Discriminator usage: `artifact` is intentionally part of the contract
  // even if no per-block transform is needed today — future cards will
  // surface artifact-specific renderings here.
  void artifact;
  return blocks;
}

interface AmicusStreamRunner {
  run(args: {
    systemPrompt: string;
    threadId: string;
    bookId: string;
    chapterNum: number;
    abortSignal?: AbortSignal;
    callbacks?: SynthesisStrategyCallbacks;
    onCitation?: (citation: CitationRef) => void;
  }): Promise<string>;
}

const defaultRunner: AmicusStreamRunner = {
  async run(args) {
    const authToken = await getAmicusAuthToken();
    if (!authToken) {
      throw new Error('premiumAmicus: missing Amicus auth token');
    }
    const controller = new AbortController();
    if (args.abortSignal) {
      if (args.abortSignal.aborted) controller.abort();
      else args.abortSignal.addEventListener('abort', () => controller.abort());
    }
    return await new Promise<string>((resolve, reject) => {
      let acc = '';
      void streamChat({
        threadId: args.threadId,
        userQuery: 'Draft my synthesis.',
        currentChapterRef: { book_id: args.bookId, chapter_num: args.chapterNum },
        // The mode-specific system prompt is passed as the first
        // conversation turn — streamChat does not have a dedicated
        // system field. The model treats this turn as context.
        conversationHistory: [{ role: 'user', content: args.systemPrompt }],
        authToken,
        signal: controller.signal,
        onDelta: (token) => {
          acc += token;
          args.callbacks?.onAmicusDelta?.(token);
        },
        onCitation: (pill) => {
          // Map the streaming-pill shape onto our typed CitationRef so
          // downstream blocks stay decoupled from streamParser internals.
          args.onCitation?.({
            panelType: pill.source_type,
            snippet: pill.display_label,
          });
        },
        onGapSignal: () => {
          // Gap signals are an Amicus internal hint; not relevant to
          // the synthesis-draft output.
        },
        onComplete: (final) => {
          args.callbacks?.onAmicusComplete?.();
          resolve(final.prose || acc);
        },
        onError: (err) => {
          args.callbacks?.onError?.(err instanceof Error ? err : new Error(String(err)));
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });
  },
};

let activeRunner: AmicusStreamRunner = defaultRunner;
/** Test-only override for the streaming runner. */
export function __setAmicusStreamRunnerForTests(runner: AmicusStreamRunner | null): void {
  activeRunner = runner ?? defaultRunner;
}

function synthesisThreadId(sessionId: number | null): string {
  return sessionId != null ? `guided-synthesis-${sessionId}` : `guided-synthesis-anon`;
}

export const premiumAmicusStrategy: SynthesisStrategy = {
  kind: 'premium_amicus',
  async run(ctx, callbacks) {
    const systemPrompt = buildGuidedStudySystemPrompt({
      mode: ctx.plan.mode,
      chapterRef: ctx.plan.title,
      captured: ctx.captured,
      panelsOpened: ctx.captured.explore?.panels_opened ?? [],
      modeSpecificContext: extractModeContext(ctx.plan.mode, ctx.captured),
    });


    const citations: CitationRef[] = [];
    let fullText = '';
    try {
      fullText = await activeRunner.run({
        systemPrompt,
        threadId: synthesisThreadId(ctx.sessionId),
        bookId: ctx.bookId,
        chapterNum: ctx.chapterNum,
        abortSignal: ctx.abortSignal,
        callbacks,
        onCitation: (citation) => {
          citations.push(citation);
        },
      });
    } catch (err) {
      logger.warn('premiumAmicus', 'stream failed', err);
      throw err;
    }

    if (ctx.abortSignal?.aborted) {
      // Caller cancelled mid-stream. Do not persist anything; surface the
      // abort to the caller via a rejection so state stays consistent.
      throw new Error('premiumAmicus: aborted');
    }

    const artifact = parseModeArtifact(ctx.plan.mode, fullText, ctx.captured, ctx.plan.title);

    if (ctx.sessionId != null) {
      try {
        await setModeArtifact(ctx.sessionId, artifact);
        await setSynthesisStrategy(ctx.sessionId, 'premium_amicus');
        const rows = artifactToReviewRows(artifact, { chapterTitle: ctx.plan.title }).map((r) => ({
          ...r,
          intervalDays: REVIEW_INTERVAL_DAYS[0],
        }));
        await replaceGuidedReviewItems(ctx.sessionId, ctx.plan.chapterId, ctx.plan.title, rows);
      } catch (err) {
        logger.warn('premiumAmicus', 'persist failed', err);
      }
    }

    return {
      kind: 'premium_amicus',
      output: buildAmicusOutputBlocks(fullText, artifact, citations),
      artifact,
    };
  },
};
