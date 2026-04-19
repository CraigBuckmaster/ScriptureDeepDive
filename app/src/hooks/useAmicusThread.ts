/**
 * hooks/useAmicusThread.ts — Per-thread state + streaming handle.
 *
 * Loads message history from user.db on mount, exposes sendMessage which
 * orchestrates retrieval + stream + persistence + optimistic UI updates.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AmicusError } from '@/services/amicus';
import { streamChat } from '@/services/amicus/chat';
import { appendAmicusMessage, incrementAmicusUsage } from '@/db/userMutations';
import { listAmicusMessages } from '@/db/userQueries';
import type { AmicusCitation, AmicusMessage } from '@/types';
import { logger } from '@/utils/logger';

export interface UseAmicusThreadResult {
  messages: AmicusMessage[];
  isStreaming: boolean;
  error: AmicusError | null;
  sendMessage: (text: string, authToken: string) => Promise<void>;
  abortStream: () => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

function uuid(prefix: string): string {
  const r = Math.random().toString(16).slice(2, 10);
  const t = Date.now().toString(16);
  return `${prefix}-${t}-${r}`;
}

export function useAmicusThread(threadId: string): UseAmicusThreadResult {
  const [messages, setMessages] = useState<AmicusMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<AmicusError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const rows = await listAmicusMessages(threadId);
      setMessages(rows);
    } catch (err) {
      logger.error('Amicus', 'refresh messages failed', err);
    }
  }, [threadId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    void refresh();
    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  const sendMessage = useCallback(
    async (text: string, authToken: string): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (isStreaming) return;

      const userMsgId = uuid('m');
      const assistantMsgId = uuid('m');
      const nowIso = new Date().toISOString();

      // Optimistic user bubble
      const optimisticUser: AmicusMessage = {
        message_id: userMsgId,
        thread_id: threadId,
        role: 'user',
        content: trimmed,
        citations: [],
        follow_ups: [],
        created_at: nowIso,
      };
      // Optimistic assistant shell (fills in via onDelta)
      const optimisticAssistant: AmicusMessage = {
        message_id: assistantMsgId,
        thread_id: threadId,
        role: 'assistant',
        content: '',
        citations: [],
        follow_ups: [],
        created_at: nowIso,
      };
      setMessages((prev) => [...prev, optimisticUser, optimisticAssistant]);
      setIsStreaming(true);
      setError(null);

      // Persist the user message immediately (survives app kill mid-stream).
      try {
        await appendAmicusMessage({
          messageId: userMsgId,
          threadId,
          role: 'user',
          content: trimmed,
        });
        await incrementAmicusUsage();
      } catch (err) {
        logger.error('Amicus', 'persist user message failed', err);
      }

      const controller = new AbortController();
      abortRef.current = controller;

      let streamed = '';
      const streamedCitations: AmicusCitation[] = [];
      await streamChat({
        threadId,
        userQuery: trimmed,
        conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        authToken,
        signal: controller.signal,
        currentChapterRef: null,
        onDelta: (token) => {
          streamed += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.message_id === assistantMsgId ? { ...m, content: streamed } : m,
            ),
          );
        },
        onCitation: (pill) => {
          const mapped: AmicusCitation = {
            chunk_id: pill.chunk_id,
            source_type: pill.source_type,
            display_label: pill.display_label,
            scholar_id: pill.scholar_id,
          };
          streamedCitations.push(mapped);
          setMessages((prev) =>
            prev.map((m) =>
              m.message_id === assistantMsgId
                ? { ...m, citations: [...streamedCitations] }
                : m,
            ),
          );
        },
        onGapSignal: (gap) => {
          logger.info('Amicus', `gap_signal: ${JSON.stringify(gap)}`);
        },
        onComplete: async (final) => {
          const finalCitations: AmicusCitation[] = final.citations.map((c) => ({
            chunk_id: c.chunk_id,
            source_type: c.source_type,
            display_label: c.display_label,
            scholar_id: c.scholar_id,
          }));
          setMessages((prev) =>
            prev.map((m) =>
              m.message_id === assistantMsgId
                ? {
                    ...m,
                    content: final.prose,
                    citations: finalCitations,
                    follow_ups: final.follow_ups,
                  }
                : m,
            ),
          );
          try {
            await appendAmicusMessage({
              messageId: assistantMsgId,
              threadId,
              role: 'assistant',
              content: final.prose,
              citations: finalCitations,
              followUps: final.follow_ups,
            });
          } catch (err) {
            logger.error('Amicus', 'persist assistant failed', err);
          }
          setIsStreaming(false);
        },
        onError: (err) => {
          setError(err);
          setMessages((prev) => prev.filter((m) => m.message_id !== assistantMsgId));
          setIsStreaming(false);
        },
      });
    },
    [threadId, isStreaming, messages],
  );

  const abortStream = useCallback((): void => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      messages,
      isStreaming,
      error,
      sendMessage,
      abortStream,
      refresh,
      clearError,
    }),
    [messages, isStreaming, error, sendMessage, abortStream, refresh, clearError],
  );
}
