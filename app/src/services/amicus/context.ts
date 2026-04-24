import { formatChapterRef, parseChapterRef, type AmicusSeedChapterRef } from './deepLink';
import type { ChipContext } from '@/hooks/useAmicusChips';
import type { GuidedStudyStep } from '@/types';

export type AmicusEntryPoint =
  | 'fab'
  | 'peek'
  | 'thread'
  | 'home_card'
  | 'guided_study'
  | 'my_study';

export interface AmicusGuidedStudyContext {
  entryPoint?: AmicusEntryPoint;
  sessionId?: number | null;
  guidedStudyStep?: GuidedStudyStep | null;
  openQuestionId?: number | null;
  openQuestionText?: string | null;
  takeaway?: string | null;
  keyConnection?: string | null;
}

export interface AmicusContextEnvelope {
  entryPoint: AmicusEntryPoint;
  routeContext: ChipContext;
  chapterRef: AmicusSeedChapterRef | null;
  sessionId: number | null;
  guidedStudyStep: GuidedStudyStep | null;
  openQuestionId: number | null;
  openQuestionText: string | null;
  takeaway: string | null;
  keyConnection: string | null;
}

export interface BuildAmicusContextEnvelopeOptions {
  entryPoint: AmicusEntryPoint;
  chipContext?: ChipContext | null;
  chapterRef?: AmicusSeedChapterRef | string | null;
  guidedStudyContext?: AmicusGuidedStudyContext | null;
}

function parseLegacyChapterRef(raw: string): AmicusSeedChapterRef | null {
  const match = /^([^:]+):(\d+)$/.exec(raw.trim());
  if (!match) return null;
  const chapterNum = Number(match[2]);
  if (!Number.isFinite(chapterNum) || chapterNum <= 0) return null;
  return {
    book_id: match[1]!,
    chapter_num: chapterNum,
  };
}

export function normalizeChapterRef(
  ref: AmicusSeedChapterRef | string | null | undefined,
): AmicusSeedChapterRef | null {
  if (!ref) return null;
  if (typeof ref === 'string') {
    return parseChapterRef(ref) ?? parseLegacyChapterRef(ref);
  }
  if (
    typeof ref.book_id === 'string' &&
    ref.book_id.trim().length > 0 &&
    Number.isFinite(ref.chapter_num) &&
    ref.chapter_num > 0
  ) {
    return {
      book_id: ref.book_id.trim(),
      chapter_num: ref.chapter_num,
    };
  }
  return null;
}

export function chapterRefFromChipContext(
  chipContext: ChipContext | null | undefined,
): AmicusSeedChapterRef | null {
  if (!chipContext || chipContext.kind !== 'chapter') return null;
  return {
    book_id: chipContext.bookId,
    chapter_num: chipContext.chapterNum,
  };
}

export function serializeAmicusChapterRef(
  ref: AmicusSeedChapterRef | string | null | undefined,
): string | null {
  const normalized = normalizeChapterRef(ref);
  return normalized ? (formatChapterRef(normalized) ?? null) : null;
}

export function prettyBookId(bookId: string): string {
  return bookId.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatAmicusContextLabel(
  ref: AmicusSeedChapterRef | string | null | undefined,
): string | null {
  const normalized = normalizeChapterRef(ref);
  if (!normalized) {
    if (typeof ref !== 'string') return null;
    const trimmed = ref.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return `${prettyBookId(normalized.book_id)} ${normalized.chapter_num}`;
}

export function buildAmicusContextEnvelope(
  options: BuildAmicusContextEnvelopeOptions,
): AmicusContextEnvelope {
  const routeContext = options.chipContext ?? { kind: 'none' };
  const guidedContext = options.guidedStudyContext;
  return {
    entryPoint: guidedContext?.entryPoint ?? options.entryPoint,
    routeContext,
    chapterRef: normalizeChapterRef(options.chapterRef) ?? chapterRefFromChipContext(routeContext),
    sessionId: guidedContext?.sessionId ?? null,
    guidedStudyStep: guidedContext?.guidedStudyStep ?? null,
    openQuestionId: guidedContext?.openQuestionId ?? null,
    openQuestionText: guidedContext?.openQuestionText?.trim() || null,
    takeaway: guidedContext?.takeaway?.trim() || null,
    keyConnection: guidedContext?.keyConnection?.trim() || null,
  };
}
