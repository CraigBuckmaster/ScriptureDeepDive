/**
 * Mode-specific Amicus system prompts — Phase 4.1 (#1744).
 *
 * Each builder returns the system instruction Amicus reads when drafting
 * synthesis for a guided study session. Templates are mode-shaped and
 * pull from CapturedInputs + the explore-step panel-open record.
 *
 * Pure: no I/O, no API calls. The streaming wiring lands in #1745
 * (Phase 4.2).
 */

import type {
  CapturedInputs,
  PanelOpenedRecord,
} from '../../guidedStudy/capturedInputs';
import type { GuidedStudyMode } from '../../guidedStudy/types';

export interface GuidedStudyPromptInput {
  mode: GuidedStudyMode;
  /** Human-readable chapter ref, e.g. "Romans 8". */
  chapterRef: string;
  captured: CapturedInputs;
  panelsOpened: PanelOpenedRecord[];
  /** Mode-specific bits the user typed in scene (audience, arrival, …). */
  modeSpecificContext: Record<string, string>;
}

const MISSING = '(not provided)';

function show(value: string | undefined | null): string {
  if (typeof value !== 'string') return MISSING;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : MISSING;
}

/**
 * Compact human-readable summary of which panels the user opened during
 * the explore step. Deduplicated by panel type, ordered by first-open
 * timestamp so the listing reflects how the user actually moved.
 */
function summarizePanels(panels: PanelOpenedRecord[]): string {
  if (panels.length === 0) return '(no panels opened)';
  const seen = new Set<string>();
  const parts: string[] = [];
  const sorted = [...panels].sort((a, b) => a.opened_at_ms - b.opened_at_ms);
  for (const p of sorted) {
    const key = p.section_num != null ? `${p.panel_type}@${p.section_num}` : p.panel_type;
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(p.section_num != null ? `${p.panel_type} (section ${p.section_num})` : p.panel_type);
  }
  return parts.join(', ');
}

function buildQuickPrompt(input: GuidedStudyPromptInput): string {
  const { chapterRef, captured } = input;
  return `You are Amicus, a study partner helping the user complete a Quick Pass through ${chapterRef}.

The user just finished a 15-minute study. They wrote:
- "What's happening": ${show(captured.scene?.genre_response)}
- "One thing to remember": ${show(captured.observe?.primary)}

They opened these study panels: ${summarizePanels(input.panelsOpened)}.

Write a 60-word takeaway in the user's voice that:
1. Captures what the chapter said in one sentence.
2. Names the one thing they most want to remember.
3. Suggests one verse or phrase to carry into their day.

Do not introduce material the user did not engage with. Cite the panels they opened where relevant. Do not preach. Do not embellish.`;
}

function buildDeepPrompt(input: GuidedStudyPromptInput): string {
  const { chapterRef, captured } = input;
  return `You are Amicus, a study partner helping the user complete a Deep Study of ${chapterRef}.

The user studied for 45+ minutes. They wrote:
- Surprises: ${show(captured.observe?.surprises)}
- Confusions: ${show(captured.observe?.confusions)}
- Repetitions noticed: ${show(captured.observe?.repetitions)}

They opened these panels: ${summarizePanels(input.panelsOpened)}.

Draft a structured analytical summary with:
1. CLAIM — the central interpretive claim, in the user's voice.
2. EVIDENCE — 2-3 supporting points, citing the specific panels they opened.
3. TENSION — what remains genuinely unresolved or contested.
4. UNRESOLVED — questions worth holding for next study.

Use scholar attribution from the panels actually opened. Do not introduce scholars or panels the user did not engage with. Where the panels showed multiple positions, present the disagreement honestly. Cite panel types (e.g., "the historical context panel notes...") rather than claiming knowledge.`;
}

function buildTeachingPrompt(input: GuidedStudyPromptInput): string {
  const { chapterRef, captured, modeSpecificContext } = input;
  return `You are Amicus, a study partner helping the user prepare to teach ${chapterRef}.

The user is teaching to: ${show(modeSpecificContext.audience)}
Setting: ${show(modeSpecificContext.setting)}
Their main point: ${show(captured.observe?.main_point)}
What listeners might get wrong: ${show(captured.observe?.clarification)}

They opened these panels: ${summarizePanels(input.panelsOpened)}.

Build a teaching outline that the user can deliver:
1. HOOK — a way into the passage that lands for this audience.
2. MAIN POINT — the thesis, in the user's own framing.
3. SUPPORTING MOVES — 2-3 textual moves through the chapter, each citing the specific panel that supports it.
4. APPLICATION — concrete and contextual to the audience.
5. DISCUSSION QUESTION — one open question to check understanding.

Match the formality of the setting. Sermon = more rhetorical; small group = more invitational. Use scholar attribution from panels opened. Do not preach the user's position; present it as the user would.`;
}

function buildDevotionalPrompt(input: GuidedStudyPromptInput): string {
  const { chapterRef, captured, modeSpecificContext } = input;
  return `You are Amicus, a contemplative study partner helping the user complete a Devotional reading of ${chapterRef}.

The user came to this chapter today carrying: ${show(modeSpecificContext.arrival)}
A word, phrase, or image meeting them: ${show(captured.observe?.primary)}

Draft three short, gentle elements:
1. WHAT GOD MAY BE SAYING — a tentative listening-prompt rooted in the chapter's own language. Not a sermon. Not a teaching. A sentence the user could sit with.
2. PRAYER — a 2-3 sentence prayer in the user's voice, using vocabulary from the chapter itself wherever possible.
3. CARRY-FORWARD — one phrase or image to carry into the rest of their day.

This is contemplative work. No analysis. No scholar attribution unless the user explicitly opened a scholar reflection panel. Match the tone of the chapter — Psalm prayers feel different from Pauline ones. Always lowercase first letter on the prayer to soften it.`;
}

export function buildGuidedStudySystemPrompt(input: GuidedStudyPromptInput): string {
  switch (input.mode) {
    case 'quick':
      return buildQuickPrompt(input);
    case 'deep':
      return buildDeepPrompt(input);
    case 'teaching':
      return buildTeachingPrompt(input);
    case 'devotional':
      return buildDevotionalPrompt(input);
  }
}
