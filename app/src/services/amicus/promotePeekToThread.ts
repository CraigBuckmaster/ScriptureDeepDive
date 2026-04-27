/**
 * services/amicus/promotePeekToThread.ts — promotes ephemeral peek
 * messages into a persistent Amicus thread (#1464).
 *
 * **Navigation-agnostic by design.** Returns a `PromotePeekResult` describing
 * what should happen next (open an existing thread, or create a new one);
 * the caller — typically `App.tsx` via `navigationRef` — performs the actual
 * navigation. The original implementation (#1500) called
 * `navigation.getParent().navigate(...)` from inside the service, which
 * coupled the leaf component to the tab name and the navigator tree shape.
 * That coupling was the architectural complaint underlying #1562 / #1563.
 *
 * This file replaces `promotePeekToAmicusThread` from `studyLaunch.ts`. The
 * thread-lookup logic (linked question → linked session → latest chapter
 * thread) is preserved verbatim; the navigation side-effect is the only
 * thing that moves out.
 */
import type { AmicusGuidedStudyContext } from './context';
import { formatChapterRef, type AmicusSeedChapterRef } from './deepLink';
import { deriveThreadIntelligence } from './threadIntelligence';
import {
  getAmicusThreadIdForGuidedQuestion,
  getAmicusThreadIdForGuidedSession,
  getLatestAmicusThreadIdForChapterContext,
} from '@/db/userQueries';
import {
  appendAmicusMessage,
  upsertAmicusThreadContext,
  upsertAmicusThreadSummary,
} from '@/db/userMutations';
import type { AmicusDraftMessage } from '@/types';

// ── Public types ───────────────────────────────────────────────────────

export interface PromotePeekToThreadInput {
  messages: AmicusDraftMessage[];
  chapterRef?: AmicusSeedChapterRef | null;
  guidedContext?: AmicusGuidedStudyContext | null;
}

/**
 * Discriminated union describing what the caller should do next.
 *
 * `kind: 'existing'` — a persisted thread already covers this study context.
 *   Peek messages have been appended; navigate the user into Thread.
 *
 * `kind: 'new'` — no existing thread matched. The caller should navigate to
 *   NewThread with `promotedMessages`; that screen creates the thread and
 *   persists the messages on mount (existing behaviour, preserved). The
 *   service does NOT create the thread itself, because thread creation is
 *   coupled to UI mounting (analytics events, scroll position, etc.).
 */
export type PromotePeekResult =
  | {
      kind: 'existing';
      threadId: string;
      seedChapterRef?: string;
      seedGuidedContext?: AmicusGuidedStudyContext;
    }
  | {
      kind: 'new';
      promotedMessages: AmicusDraftMessage[];
      seedChapterRef?: string;
      seedGuidedContext?: AmicusGuidedStudyContext;
    };

// ── Implementation ─────────────────────────────────────────────────────

/**
 * Promote peek messages into a persistent thread.
 *
 * Resolution order for an existing thread:
 *   1. Linked guided question (highest specificity)
 *   2. Linked guided session + step
 *   3. Latest thread for this chapter + entry-point combination
 *
 * If none match, returns a `kind: 'new'` result; the NewThread screen will
 * create the thread when it mounts.
 */
export async function promotePeekToThread(
  input: PromotePeekToThreadInput,
): Promise<PromotePeekResult> {
  const { messages, chapterRef, guidedContext } = input;
  const seedChapterRef = formatChapterRef(chapterRef) ?? undefined;
  const seedGuidedContext = guidedContext ?? undefined;

  // ── Look for an existing thread to merge into ───────────────────────
  let threadId: string | null = null;

  if (guidedContext?.openQuestionId != null) {
    threadId = await getAmicusThreadIdForGuidedQuestion(guidedContext.openQuestionId);
  }

  if (!threadId && guidedContext?.sessionId != null) {
    threadId = await getAmicusThreadIdForGuidedSession(
      guidedContext.sessionId,
      guidedContext.guidedStudyStep,
    );
  }

  if (!threadId && seedChapterRef && guidedContext?.entryPoint) {
    threadId = await getLatestAmicusThreadIdForChapterContext(
      seedChapterRef,
      guidedContext.entryPoint,
    );
  }

  // ── No match: hand back a 'new' result for the NewThread screen ─────
  if (!threadId) {
    return {
      kind: 'new',
      promotedMessages: messages,
      seedChapterRef,
      seedGuidedContext,
    };
  }

  // ── Match: persist messages + context, then return 'existing' ───────
  for (const message of messages) {
    await appendAmicusMessage({
      messageId: createMessageId('m'),
      threadId,
      role: message.role,
      content: message.content,
      citations: message.role === 'assistant' ? message.citations : undefined,
      followUps: message.role === 'assistant' ? message.follow_ups : undefined,
    });
  }

  if (guidedContext) {
    await upsertAmicusThreadContext({
      threadId,
      entryPoint: guidedContext.entryPoint ?? 'thread',
      guidedSessionId: guidedContext.sessionId,
      guidedStep: guidedContext.guidedStudyStep,
      openQuestionId: guidedContext.openQuestionId,
      takeaway: guidedContext.takeaway,
      keyConnection: guidedContext.keyConnection,
    });
  }

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');

  if (latestUserMessage) {
    const derived = deriveThreadIntelligence({
      chapterRef: seedChapterRef ?? null,
      currentTitle: null,
      userQuery: latestUserMessage.content,
      openQuestionText: guidedContext?.openQuestionText,
      takeaway: guidedContext?.takeaway,
      keyConnection: guidedContext?.keyConnection,
    });
    await upsertAmicusThreadSummary({
      threadId,
      summaryText: derived.summaryText,
      lastUserIntent: derived.lastUserIntent,
    });
  }

  return {
    kind: 'existing',
    threadId,
    seedChapterRef,
    seedGuidedContext,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────

function createMessageId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2, 10);
  const stamp = Date.now().toString(16);
  return `${prefix}-${stamp}-${rand}`;
}
