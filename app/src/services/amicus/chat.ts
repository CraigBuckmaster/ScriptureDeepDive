/**
 * services/amicus/chat.ts — End-to-end streaming chat orchestrator.
 *
 * Sequence per user message:
 *   1. (skipped in this card — persistence via #1457 hook handles
 *      optimistic user insert at the caller)
 *   2. generateProfile() — compressed profile from #1452
 *   3. retrieve() — chunks + re-rank via #1451
 *   4. POST /ai/chat with SSE — stream back prose + citations + envelopes
 *   5. onDelta / onCitation / onGapSignal / onComplete callbacks fire live
 *   6. onError surfaces typed AmicusError for banners
 */
import {
  extractDeltaText,
  parseAssistantMessage,
  type CitationPillData,
  type GapSignal,
  type ParsedResponse,
} from './streamParser';
import { logger } from '@/utils/logger';
import { AmicusError, retrieve } from '@/services/amicus';
import { generateProfile } from '@/services/amicus/profile/generator';

const CHAT_URL_DEFAULT = (
  process.env.EXPO_PUBLIC_AMICUS_PROXY_URL ?? 'https://ai.contentcompanionstudy.com'
).replace(/\/$/, '') + '/ai/chat';

export interface StreamChatParams {
  threadId: string;
  userQuery: string;
  currentChapterRef?: { book_id: string; chapter_num: number } | null;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  authToken: string;
  signal: AbortSignal;
  onDelta: (token: string) => void;
  onCitation: (pill: CitationPillData) => void;
  onGapSignal: (gap: GapSignal) => void;
  onComplete: (final: ParsedResponse) => void;
  onError: (err: AmicusError) => void;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  chatUrl?: string;
}

export async function streamChat(params: StreamChatParams): Promise<void> {
  const fetchImpl = params.fetchImpl ?? fetch;
  const chatUrl = params.chatUrl ?? CHAT_URL_DEFAULT;

  try {
    const profile = await generateProfile(false);

    const retrieved = await retrieve(
      {
        query: params.userQuery,
        profile,
        currentChapterRef: params.currentChapterRef ?? null,
      },
      { authToken: params.authToken, fetchImpl },
    );

    const body = {
      query: params.userQuery,
      retrieved_chunks: retrieved.chunks.map((c) => ({
        chunk_id: c.chunk_id,
        source_type: c.source_type,
        text: c.text,
        metadata: c.metadata,
      })),
      profile_summary: profile.prose,
      current_chapter_ref: params.currentChapterRef
        ? `${params.currentChapterRef.book_id}/${params.currentChapterRef.chapter_num}`
        : null,
      model_tier: 'sonnet',
      conversation_history: params.conversationHistory,
    };

    const response = await fetchImpl(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.authToken}`,
      },
      body: JSON.stringify(body),
      signal: params.signal,
    });

    if (response.status === 401 || response.status === 402) {
      params.onError(new AmicusError('PROXY_UNAUTHORIZED', `proxy ${response.status}`));
      return;
    }
    if (response.status === 429) {
      params.onError(new AmicusError('EMBED_FAILED', 'rate_limit_exceeded'));
      return;
    }
    if (!response.ok || !response.body) {
      params.onError(new AmicusError('EMBED_FAILED', `proxy ${response.status}`));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    const seenCitations = new Set<string>();

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const delta = extractDeltaText(chunk);
      if (delta) {
        accumulated += delta;
        params.onDelta(delta);
        // Parse after each delta so live citation events fire as soon as a
        // marker closes. Parse is cheap for short accumulations.
        const parsed = parseAssistantMessage(accumulated);
        for (const pill of parsed.citations) {
          if (seenCitations.has(pill.chunk_id)) continue;
          seenCitations.add(pill.chunk_id);
          params.onCitation(pill);
        }
      }
    }

    const final = parseAssistantMessage(accumulated);
    if (final.gap_signal) params.onGapSignal(final.gap_signal);
    params.onComplete(final);
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      logger.info('Amicus', 'stream aborted');
      return;
    }
    if (err instanceof AmicusError) {
      params.onError(err);
      return;
    }
    logger.error('Amicus', 'stream failed', err);
    params.onError(new AmicusError('OFFLINE', (err as Error).message ?? 'network'));
  }
}
