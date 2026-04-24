import { formatAmicusContextLabel } from './context';
import type { AmicusStudyActionSeed } from './studyActions';

export interface DeriveThreadIntelligenceOptions {
  currentTitle?: string | null;
  chapterRef?: string | null;
  userQuery: string;
  action?: AmicusStudyActionSeed | null;
  openQuestionText?: string | null;
  takeaway?: string | null;
  keyConnection?: string | null;
}

export interface DerivedThreadIntelligence {
  title: string;
  summaryText: string;
  lastUserIntent: string | null;
}

const DEFAULT_TITLE = 'New conversation';

function compactWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function humanizeActionLabel(action: AmicusStudyActionSeed): string {
  switch (action.key) {
    case 'explain_context':
      return 'chapter overview';
    case 'investigate_question':
      return 'open question';
    case 'interpretive_tensions':
      return 'interpretive tensions';
    case 'refine_takeaway':
      return 'refine takeaway';
    case 'trace_connections':
      return 'key connections';
  }
}

export function shouldAutoRenameThread(title: string | null | undefined): boolean {
  if (!title) return true;
  const normalized = compactWhitespace(title).toLowerCase();
  return normalized.length === 0 || normalized === DEFAULT_TITLE.toLowerCase();
}

export function deriveThreadIntelligence(
  options: DeriveThreadIntelligenceOptions,
): DerivedThreadIntelligence {
  const question = compactWhitespace(options.userQuery);
  const chapterLabel = formatAmicusContextLabel(options.chapterRef);
  const intent = options.action?.label ?? null;
  const openQuestion = compactWhitespace(options.openQuestionText ?? '');
  const takeaway = compactWhitespace(options.takeaway ?? '');
  const keyConnection = compactWhitespace(options.keyConnection ?? '');

  if (openQuestion && chapterLabel) {
    return {
      title: `${chapterLabel} — ${truncate(openQuestion, 34)}`,
      summaryText: `Investigating: ${truncate(openQuestion, 90)}`,
      lastUserIntent: 'Investigate question',
    };
  }

  if (takeaway && chapterLabel) {
    return {
      title: `${chapterLabel} — refine takeaway`,
      summaryText: `Refining takeaway: ${truncate(takeaway, 90)}`,
      lastUserIntent: 'Refine takeaway',
    };
  }

  if (keyConnection && chapterLabel) {
    return {
      title: `${chapterLabel} — trace connection`,
      summaryText: `Tracing connection: ${truncate(keyConnection, 90)}`,
      lastUserIntent: 'Trace key connections',
    };
  }

  if (options.action && chapterLabel) {
    const label = humanizeActionLabel(options.action);
    return {
      title: `${chapterLabel} — ${label}`,
      summaryText: `${options.action.label} in ${chapterLabel}.`,
      lastUserIntent: options.action.label,
    };
  }

  if (options.action) {
    return {
      title: options.action.label,
      summaryText: `${options.action.label}.`,
      lastUserIntent: options.action.label,
    };
  }

  if (chapterLabel) {
    return {
      title: shouldAutoRenameThread(options.currentTitle)
        ? `${chapterLabel} — ${truncate(question, 36)}`
        : (options.currentTitle ?? DEFAULT_TITLE),
      summaryText: truncate(question, 96),
      lastUserIntent: intent,
    };
  }

  return {
    title: shouldAutoRenameThread(options.currentTitle)
      ? truncate(question, 60)
      : (options.currentTitle ?? DEFAULT_TITLE),
    summaryText: truncate(question, 96),
    lastUserIntent: intent,
  };
}

export function summarizeLinkedQuestionState(input: {
  chapterRef?: string | null;
  questionText: string;
  status: 'open' | 'resolved';
}): string {
  const chapterLabel = formatAmicusContextLabel(input.chapterRef);
  const question = compactWhitespace(input.questionText);
  if (input.status === 'resolved') {
    return chapterLabel ? `Resolved question in ${chapterLabel}.` : 'Resolved question.';
  }
  return `Investigating: ${truncate(question, 90)}`;
}
