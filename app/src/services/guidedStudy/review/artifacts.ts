/**
 * Mode-shaped review artifacts — Phase 3.3 (#1740).
 *
 * Each builder reads CapturedInputs defensively (NULL-tolerant, empty
 * strings rather than undefined) and produces the typed ReviewArtifact
 * for the mode. The artifact is persisted to guided_study_sessions.
 * mode_artifact_json by premiumStructured, and is the source of truth
 * for the spaced review queue rows.
 */

import type { CapturedInputs } from '../capturedInputs';
import type { ReviewArtifact } from '../synthesis/strategy';
import type { GuidedStudyMode } from '../types';

function getScene(captured: CapturedInputs, key: 'audience' | 'setting' | 'arrival'): string {
  const scene = captured.scene;
  if (!scene) return '';
  const value = scene[key];
  return typeof value === 'string' ? value : '';
}

function getObserve(
  captured: CapturedInputs,
  key: 'primary' | 'main_point',
): string {
  const obs = captured.observe;
  if (!obs) return '';
  const value = obs[key];
  return typeof value === 'string' ? value : '';
}

function getSynth(
  captured: CapturedInputs,
  key: 'takeaway' | 'open_question' | 'key_connection',
): string {
  const synth = captured.synthesize;
  if (!synth) return '';
  return synth[key] ?? '';
}

export interface ArtifactBuildContext {
  /** Human-readable chapter title (e.g. "Romans 8 — Life in the Spirit"). */
  chapterTitle: string;
}

function buildQuickArtifact(
  captured: CapturedInputs,
  ctx: ArtifactBuildContext,
): Extract<ReviewArtifact, { type: 'memory_verse' }> {
  return {
    type: 'memory_verse',
    verseRef: ctx.chapterTitle,
    verseText: getSynth(captured, 'key_connection'),
    takeaway: getSynth(captured, 'takeaway'),
  };
}

function buildDeepArtifact(
  captured: CapturedInputs,
): Extract<ReviewArtifact, { type: 'analytical_claim' }> {
  const tension = getSynth(captured, 'open_question');
  return {
    type: 'analytical_claim',
    claim: getSynth(captured, 'takeaway'),
    evidence: getSynth(captured, 'key_connection'),
    tension: tension.trim().length > 0 ? tension : null,
  };
}

function buildTeachingArtifact(
  captured: CapturedInputs,
): Extract<ReviewArtifact, { type: 'teaching_outline' }> {
  // The single synthesize prompt for teaching asks for hook + main point +
  // moves + application + discussion question as one freeform outline. The
  // structured "moves" array carries the outline as a single entry until a
  // future card introduces line-by-line capture; main point + discussion
  // question come from their dedicated capture fields.
  const outline = getSynth(captured, 'takeaway');
  const moves = outline.trim().length > 0 ? [outline.trim()] : [];
  return {
    type: 'teaching_outline',
    audience: getScene(captured, 'audience'),
    mainPoint: getObserve(captured, 'main_point'),
    moves,
    application: '',
    discussionQuestion: getSynth(captured, 'open_question'),
  };
}

function buildDevotionalArtifact(
  captured: CapturedInputs,
): Extract<ReviewArtifact, { type: 'returning_prayer' }> {
  return {
    type: 'returning_prayer',
    arrival: getScene(captured, 'arrival'),
    wordOrPhrase: getObserve(captured, 'primary'),
    prayer: getSynth(captured, 'takeaway'),
    carryForward: getSynth(captured, 'key_connection'),
  };
}

export function buildArtifact(
  mode: GuidedStudyMode,
  captured: CapturedInputs,
  ctx: ArtifactBuildContext,
): ReviewArtifact {
  switch (mode) {
    case 'quick':
      return buildQuickArtifact(captured, ctx);
    case 'deep':
      return buildDeepArtifact(captured);
    case 'teaching':
      return buildTeachingArtifact(captured);
    case 'devotional':
      return buildDevotionalArtifact(captured);
  }
}

/**
 * Convert a typed artifact into row payloads for guided_review_items.
 * One row per non-empty answer field; the prompt names what the user is
 * recalling. Rows scheduled at REVIEW_INTERVAL_DAYS[0] (the existing
 * spaced-review ladder picks up from there).
 */
export function artifactToReviewRows(
  artifact: ReviewArtifact,
  ctx: ArtifactBuildContext,
): Array<{ prompt: string; answer: string }> {
  switch (artifact.type) {
    case 'memory_verse':
      return [
        { prompt: `What verse will you carry from ${ctx.chapterTitle}?`, answer: artifact.verseText },
        { prompt: `Your one-sentence takeaway from ${ctx.chapterTitle}:`, answer: artifact.takeaway },
      ].filter((r) => r.answer.trim().length > 0);
    case 'analytical_claim':
      return [
        { prompt: `Your claim from ${ctx.chapterTitle}:`, answer: artifact.claim },
        { prompt: 'What evidence supported your claim?', answer: artifact.evidence },
        ...(artifact.tension
          ? [{ prompt: 'What tension is still unresolved?', answer: artifact.tension }]
          : []),
      ].filter((r) => r.answer.trim().length > 0);
    case 'teaching_outline':
      return [
        { prompt: `Main point for ${ctx.chapterTitle}:`, answer: artifact.mainPoint },
        ...artifact.moves.map((m) => ({ prompt: 'A move from your outline:', answer: m })),
        { prompt: "Discussion question you'll ask:", answer: artifact.discussionQuestion },
      ].filter((r) => r.answer.trim().length > 0);
    case 'returning_prayer':
      return [
        { prompt: `Your prayer from ${ctx.chapterTitle}:`, answer: artifact.prayer },
        { prompt: 'Word or phrase that met you:', answer: artifact.wordOrPhrase },
        { prompt: 'What are you carrying forward?', answer: artifact.carryForward },
      ].filter((r) => r.answer.trim().length > 0);
  }
}
