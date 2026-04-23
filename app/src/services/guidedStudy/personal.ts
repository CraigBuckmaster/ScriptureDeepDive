import type {
  GuidedReviewItem,
  GuidedStudyQuestion,
  GuidedStudySession,
  GuidedStudyTakeawaySummary,
} from '../../types';
import type { GuidedStudyStep } from './types';

export interface GuidedStudyNextAction {
  kind: 'continue' | 'review' | 'question' | 'takeaway';
  title: string;
  subtitle: string;
  ctaLabel: string;
  chapterId?: string;
  initialStep?: GuidedStudyStep;
}

export function formatChapterRef(chapterId: string): string {
  const match = chapterId.match(/^(.*)_(\d+)$/);
  if (!match) return chapterId;
  const [, rawBook, chapterNum] = match;
  const book = rawBook
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return `${book} ${chapterNum}`;
}

export function getGuidedStudyStepLabel(step: GuidedStudyStep): string {
  switch (step) {
    case 'scene':
      return 'Scene';
    case 'observe':
      return 'Observe';
    case 'explore':
      return 'Explore';
    case 'synthesize':
      return 'Synthesize';
    case 'review':
      return 'Review';
    default:
      return 'Study';
  }
}

export function buildGuidedStudyNextAction(input: {
  activeSessions: GuidedStudySession[];
  dueItems: GuidedReviewItem[];
  openQuestions: GuidedStudyQuestion[];
  recentTakeaways: GuidedStudyTakeawaySummary[];
}): GuidedStudyNextAction | null {
  const active = input.activeSessions[0];
  if (active) {
    return {
      kind: 'continue',
      title: 'Continue studying',
      subtitle: `Resume ${formatChapterRef(active.chapter_id)} at ${getGuidedStudyStepLabel(active.current_step)}.`,
      ctaLabel: 'Continue',
      chapterId: active.chapter_id,
      initialStep: active.current_step,
    };
  }

  if (input.dueItems.length > 0) {
    const first = input.dueItems[0];
    return {
      kind: 'review',
      title: 'Review what is due',
      subtitle:
        input.dueItems.length === 1
          ? `1 prompt from ${formatChapterRef(first.chapter_id)} is ready to revisit.`
          : `${input.dueItems.length} prompts are due across your saved study.`,
      ctaLabel: 'Review now',
      chapterId: first.chapter_id,
      initialStep: 'review',
    };
  }

  const question = input.openQuestions[0];
  if (question) {
    return {
      kind: 'question',
      title: 'Return to an open question',
      subtitle: question.question_text,
      ctaLabel: 'Revisit question',
      chapterId: question.chapter_id,
      initialStep: 'synthesize',
    };
  }

  const takeaway = input.recentTakeaways[0];
  if (takeaway) {
    return {
      kind: 'takeaway',
      title: 'Strengthen your last takeaway',
      subtitle: takeaway.takeaway,
      ctaLabel: 'Open My Study',
      chapterId: takeaway.chapter_id,
      initialStep: 'review',
    };
  }

  return null;
}
