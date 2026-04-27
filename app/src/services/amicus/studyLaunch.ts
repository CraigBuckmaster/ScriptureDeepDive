import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { formatChapterRef, type AmicusSeedChapterRef } from './deepLink';
import type { AmicusGuidedStudyContext } from './context';
import {
  getAmicusThreadIdForGuidedQuestion,
  getAmicusThreadIdForGuidedSession,
} from '@/db/userQueries';
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
