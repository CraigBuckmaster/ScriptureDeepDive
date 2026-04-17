/**
 * services/amicus/promotePeekToThread.ts — Handoff (#1464) that turns an
 * ephemeral peek conversation into a persistent Amicus thread.
 *
 * The peek (#1463) lives in hook memory only. When the user taps
 * "Continue in Amicus tab →" on turn 3+, this module writes the thread
 * + messages to user.db and navigates into the Amicus tab.
 */
import {
  appendAmicusMessage,
  createAmicusThread,
} from '@/db/userMutations';
import { logger } from '@/utils/logger';
import type { PeekMessage } from '@/hooks/usePeekConversation';

export interface PromoteChapterRef {
  book_id: string;
  chapter_num: number;
}

/** Minimal nav surface — lets us unit-test without pulling in react-navigation. */
export interface PromoteNavigation {
  getParent: () => { navigate: (name: string, params?: unknown) => void } | undefined;
}

export interface PromotePeekToThreadParams {
  peekMessages: PeekMessage[];
  chapterRef?: PromoteChapterRef | null;
  navigation: PromoteNavigation;
  /** Injectable for tests. */
  makeId?: (prefix: string) => string;
}

const TITLE_MAX_CHARS = 50;
const TITLE_MIN_CHARS = 10;
const FALLBACK_TITLE = 'New Amicus conversation';

export function buildThreadTitle(firstUserMessage: string | undefined): string {
  const trimmed = (firstUserMessage ?? '').trim();
  if (trimmed.length < TITLE_MIN_CHARS) return FALLBACK_TITLE;
  if (trimmed.length <= TITLE_MAX_CHARS) return trimmed;

  const slice = trimmed.slice(0, TITLE_MAX_CHARS);
  const lastSpace = slice.lastIndexOf(' ');
  // Only break on a word boundary if it gets us past the minimum.
  const cut = lastSpace >= TITLE_MIN_CHARS ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

function defaultMakeId(prefix: string): string {
  const r = Math.random().toString(16).slice(2, 10);
  const t = Date.now().toString(16);
  return `${prefix}-${t}-${r}`;
}

function serializeChapterRef(ref: PromoteChapterRef | null | undefined): string | null {
  if (!ref) return null;
  return `${ref.book_id}/${ref.chapter_num}`;
}

/**
 * Creates a persistent thread from a peek conversation.
 *
 * Throws if the DB write fails. Callers are expected to catch and render a
 * toast/error banner (the peek stays open so the user can retry).
 */
export async function promotePeekToThread(
  params: PromotePeekToThreadParams,
): Promise<string> {
  const mkId = params.makeId ?? defaultMakeId;
  const threadId = mkId('t');

  const firstUser = params.peekMessages.find((m) => m.role === 'user');
  const title = buildThreadTitle(firstUser?.content);
  const chapterRef = serializeChapterRef(params.chapterRef);

  await createAmicusThread({ threadId, title, chapterRef });

  for (const msg of params.peekMessages) {
    await appendAmicusMessage({
      messageId: mkId('m'),
      threadId,
      role: msg.role,
      content: msg.content,
      citations: msg.citations?.map((c) => ({
        chunk_id: c.chunk_id,
        source_type: c.source_type,
        display_label: c.display_label,
        scholar_id: c.scholar_id,
      })),
      followUps: msg.follow_ups,
    });
  }

  const parent = params.navigation.getParent();
  if (parent) {
    parent.navigate('AmicusTab', {
      screen: 'Thread',
      params: { threadId },
    });
  } else {
    logger.warn('AmicusPeek', 'handoff: no parent navigator; thread saved but no nav');
  }

  return threadId;
}
