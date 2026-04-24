/**
 * hooks/usePeekConversation.ts — Ephemeral conversation state for the
 * Amicus FAB peek (#1463).
 *
 * Messages live in hook memory only — they never touch user.db unless the
 * user promotes them via the "Continue in Amicus tab →" CTA (#1464). On
 * peek dismissal the state is discarded.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { AmicusError } from '@/services/amicus';
import { getAmicusAuthToken } from '@/services/amicus/authToken';
import { streamChat } from '@/services/amicus/chat';
import type { ChapterRef } from '@/services/amicus/types';
import type { AmicusCitation, AmicusDraftMessage } from '@/types';
import { logger } from '@/utils/logger';

export interface PeekMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: AmicusCitation[];
  follow_ups?: string[];
  isStreaming?: boolean;
}

export interface UsePeekConversationResult {
  messages: PeekMessage[];
  isStreaming: boolean;
  /** A "turn" = one completed user → assistant round. */
  turnCount: number;
  error: AmicusError | null;
  send: (text: string, chapterRef?: ChapterRef | null) => Promise<void>;
  reset: () => void;
  abort: () => void;
  snapshotForPromotion: () => AmicusDraftMessage[];
  clearError: () => void;
}

export interface UsePeekConversationOptions {
  getAuthToken?: () => string | null | Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export function usePeekConversation(
  opts: UsePeekConversationOptions = {},
): UsePeekConversationResult {
  const [messages, setMessages] = useState<PeekMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<AmicusError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const turnCount = useMemo(
    () => messages.filter((m) => m.role === 'assistant' && !m.isStreaming).length,
    [messages],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const send = useCallback(
    async (text: string, chapterRef?: ChapterRef | null): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const authToken =
        (await opts.getAuthToken?.()) ?? (await getAmicusAuthToken());
      if (!authToken) {
        logger.warn('AmicusPeek', 'no auth token — peek send aborted');
        return;
      }

      // Snapshot history before we append — matches the order the server
      // expects (oldest → newest).
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const userMsg: PeekMessage = { role: 'user', content: trimmed };
      const assistantMsg: PeekMessage = {
        role: 'assistant',
        content: '',
        citations: [],
        follow_ups: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      let streamed = '';
      const citations: AmicusCitation[] = [];

      await streamChat({
        threadId: 'peek-ephemeral',
        userQuery: trimmed,
        conversationHistory: history,
        currentChapterRef: chapterRef ?? null,
        authToken,
        signal: controller.signal,
        fetchImpl: opts.fetchImpl,
        onDelta: (token) => {
          streamed += token;
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: streamed };
            }
            return next;
          });
        },
        onCitation: (pill) => {
          citations.push({
            chunk_id: pill.chunk_id,
            source_type: pill.source_type,
            display_label: pill.display_label,
            scholar_id: pill.scholar_id,
          });
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, citations: [...citations] };
            }
            return next;
          });
        },
        onGapSignal: (gap) => {
          logger.info('AmicusPeek', `gap_signal: ${JSON.stringify(gap)}`);
        },
        onComplete: (final) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = {
                ...last,
                content: final.prose,
                citations: final.citations.map((c) => ({
                  chunk_id: c.chunk_id,
                  source_type: c.source_type,
                  display_label: c.display_label,
                  scholar_id: c.scholar_id,
                })),
                follow_ups: final.follow_ups,
                isStreaming: false,
              };
            }
            return next;
          });
          setIsStreaming(false);
        },
        onError: (err) => {
          setError(err);
          setMessages((prev) => prev.filter((m) => !m.isStreaming));
          setIsStreaming(false);
        },
      });
    },
    [messages, isStreaming, opts],
  );

  const snapshotForPromotion = useCallback(
    (): AmicusDraftMessage[] =>
      messages.map((m) => ({
        role: m.role,
        content: m.content,
        citations: m.citations,
        follow_ups: m.follow_ups,
      })),
    [messages],
  );

  return useMemo(
    () => ({
      messages,
      isStreaming,
      turnCount,
      error,
      send,
      reset,
      abort,
      snapshotForPromotion,
      clearError,
    }),
    [messages, isStreaming, turnCount, error, send, reset, abort, snapshotForPromotion, clearError],
  );
}
