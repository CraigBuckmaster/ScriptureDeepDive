import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { formatChapterRef, type AmicusSeedChapterRef } from './deepLink';
import type { AmicusGuidedStudyContext } from './context';
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
import { logger } from '@/utils/logger';
import type { GuidedStudyStep } from '@/types';

export interface LaunchAmicusStudyThreadInput {
  entryPoint: 'guided_study' | 'my_study';
  chapterId: string;
  sessionId?: number | null;
  guidedStudyStep?: GuidedStudyStep | null;
  openQuestionId?: number | null;
  openQuestionText?: string | null;
  takeaway?: string | null;
  keyConnection?: string | null;
  seedQuery: string;
}

export interface PromotePeekToStudyThreadInput {
  chapterRef?: AmicusSeedChapterRef | null;
  guidedContext?: AmicusGuidedStudyContext | null;
  messages: AmicusDraftMessage[];
}

function createMessageId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2, 10);
  const stamp = Date.now().toString(16);
  return `${prefix}-${stamp}-${rand}`;
}

function chapterRefFromChapterId(chapterId: string): AmicusSeedChapterRef | null {
  const match = /^(.*)_(\d+)$/.exec(chapterId.trim());
  if (!match) return null;
  const chapterNum = Number(match[2]);
  if (!Number.isFinite(chapterNum) || chapterNum <= 0) return null;
  return {
    book_id: match[1]!,
    chapter_num: chapterNum,
  };
}

function buildGuidedContext(input: LaunchAmicusStudyThreadInput): AmicusGuidedStudyContext {
  return {
    entryPoint: input.entryPoint,
    sessionId: input.sessionId ?? null,
    guidedStudyStep: input.guidedStudyStep ?? null,
    openQuestionId: input.openQuestionId ?? null,
    openQuestionText: input.openQuestionText ?? null,
    takeaway: input.takeaway ?? null,
    keyConnection: input.keyConnection ?? null,
  };
}

export async function launchAmicusStudyThread(
  navigation: NavigationProp<ParamListBase>,
  input: LaunchAmicusStudyThreadInput,
): Promise<void> {
  const parent = navigation.getParent<NavigationProp<ParamListBase>>();
  if (!parent) {
    logger.warn('AmicusStudyLaunch', 'no parent navigator available');
    return;
  }

  const chapterRef = chapterRefFromChapterId(input.chapterId);
  const seedChapterRef = formatChapterRef(chapterRef);
  const seedGuidedContext = buildGuidedContext(input);

  let threadId: string | null = null;
  if (input.openQuestionId != null) {
    threadId = await getAmicusThreadIdForGuidedQuestion(input.openQuestionId);
  }
  if (!threadId && input.sessionId != null) {
    threadId = await getAmicusThreadIdForGuidedSession(input.sessionId, input.guidedStudyStep);
  }

  if (threadId) {
    parent.navigate('AmicusTab', {
      screen: 'Thread',
      params: {
        threadId,
        seedChapterRef,
        seedGuidedContext,
      },
    });
    return;
  }

  parent.navigate('AmicusTab', {
    screen: 'NewThread',
    params: {
      seedQuery: input.seedQuery,
      seedChapterRef,
      seedGuidedContext,
    },
  });
}

export async function promotePeekToAmicusThread(
  navigation: NavigationProp<ParamListBase>,
  input: PromotePeekToStudyThreadInput,
): Promise<void> {
  const parent = navigation.getParent<NavigationProp<ParamListBase>>();
  if (!parent) {
    logger.warn('AmicusStudyLaunch', 'no parent navigator available for peek promotion');
    return;
  }

  const latestUserMessage = [...input.messages]
    .reverse()
    .find((message) => message.role === 'user');
  const chapterRefString = formatChapterRef(input.chapterRef);
  let threadId: string | null = null;

  if (input.guidedContext?.openQuestionId != null) {
    threadId = await getAmicusThreadIdForGuidedQuestion(input.guidedContext.openQuestionId);
  }
  if (!threadId && input.guidedContext?.sessionId != null) {
    threadId = await getAmicusThreadIdForGuidedSession(
      input.guidedContext.sessionId,
      input.guidedContext.guidedStudyStep,
    );
  }
  if (!threadId && chapterRefString && input.guidedContext?.entryPoint) {
    threadId = await getLatestAmicusThreadIdForChapterContext(
      chapterRefString,
      input.guidedContext.entryPoint,
    );
  }

  if (!threadId) {
    parent.navigate('AmicusTab', {
      screen: 'NewThread',
      params: {
        seedChapterRef: chapterRefString,
        promotedMessages: input.messages,
        seedGuidedContext: input.guidedContext ?? undefined,
      },
    });
    return;
  }

  for (const message of input.messages) {
    await appendAmicusMessage({
      messageId: createMessageId('m'),
      threadId,
      role: message.role,
      content: message.content,
      citations: message.role === 'assistant' ? message.citations : undefined,
      followUps: message.role === 'assistant' ? message.follow_ups : undefined,
    });
  }

  if (input.guidedContext) {
    await upsertAmicusThreadContext({
      threadId,
      entryPoint: input.guidedContext.entryPoint ?? 'thread',
      guidedSessionId: input.guidedContext.sessionId,
      guidedStep: input.guidedContext.guidedStudyStep,
      openQuestionId: input.guidedContext.openQuestionId,
      takeaway: input.guidedContext.takeaway,
      keyConnection: input.guidedContext.keyConnection,
    });
  }

  if (latestUserMessage) {
    const derived = deriveThreadIntelligence({
      chapterRef: chapterRefString ?? null,
      currentTitle: null,
      userQuery: latestUserMessage.content,
      openQuestionText: input.guidedContext?.openQuestionText,
      takeaway: input.guidedContext?.takeaway,
      keyConnection: input.guidedContext?.keyConnection,
    });
    await upsertAmicusThreadSummary({
      threadId,
      summaryText: derived.summaryText,
      lastUserIntent: derived.lastUserIntent,
    });
  }

  parent.navigate('AmicusTab', {
    screen: 'Thread',
    params: {
      threadId,
      seedChapterRef: chapterRefString ?? undefined,
      seedGuidedContext: input.guidedContext ?? undefined,
    },
  });
}
