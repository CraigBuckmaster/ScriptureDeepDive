/**
 * Tests for services/amicus/chat.ts — streamChat orchestrator.
 *
 * Stubs the profile, retrieve, and fetch dependencies so the streaming
 * pipeline can be exercised offline.
 */
import { streamChat } from '../chat';
import { AmicusError } from '../index';

jest.mock('@/services/amicus/profile/generator', () => ({
  generateProfile: jest.fn().mockResolvedValue({
    prose: 'Test profile',
    preferred_scholars: [],
    preferred_traditions: [],
    generated_at: 'now',
    raw_signals_hash: 'x',
  }),
}));

jest.mock('@/services/amicus', () => {
  const actual = jest.requireActual('@/services/amicus');
  return {
    ...actual,
    retrieve: jest.fn().mockResolvedValue({
      chunks: [
        {
          chunk_id: 'section_panel:romans-9-s1-calvin',
          source_type: 'section_panel',
          source_id: 'romans-9-s1-calvin',
          text: 'Calvin text',
          score: 0.9,
          metadata: {},
        },
      ],
      embedMs: 10,
      searchMs: 5,
      rerankMs: 1,
    }),
  };
});

function sseResponse(sseLines: string[]): Response {
  const body = sseLines.map((l) => `data: ${l}\n`).join('') + 'data: [DONE]\n';
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

describe('streamChat', () => {
  it('emits onDelta, onCitation, onComplete for a happy path', async () => {
    const events: string[] = [];
    const onDelta = jest.fn((t: string) => events.push(`delta:${t}`));
    const onCitation = jest.fn((p: unknown) =>
      events.push(`cite:${(p as { chunk_id: string }).chunk_id}`),
    );
    const onComplete = jest.fn();
    const onError = jest.fn();

    const fetchImpl = jest.fn(async () =>
      sseResponse([
        JSON.stringify({
          type: 'content_block_delta',
          delta: { text: 'Calvin ' },
        }),
        JSON.stringify({
          type: 'content_block_delta',
          delta: { text: '[CITE:section_panel:romans-9-s1-calvin] ' },
        }),
        JSON.stringify({
          type: 'content_block_delta',
          delta: { text: 'on election.' },
        }),
      ]),
    ) as unknown as typeof fetch;

    await streamChat({
      threadId: 't1',
      userQuery: 'Romans 9?',
      conversationHistory: [],
      authToken: 'tok',
      signal: new AbortController().signal,
      onDelta,
      onCitation,
      onGapSignal: () => undefined,
      onComplete,
      onError,
      fetchImpl,
    });

    expect(onDelta).toHaveBeenCalled();
    expect(onCitation).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('surfaces PROXY_UNAUTHORIZED on 401/402', async () => {
    const onError = jest.fn();
    const fetchImpl = jest.fn(async () =>
      new Response('unauthorized', { status: 402 }),
    ) as unknown as typeof fetch;

    await streamChat({
      threadId: 't1',
      userQuery: 'q',
      conversationHistory: [],
      authToken: 'tok',
      signal: new AbortController().signal,
      onDelta: () => undefined,
      onCitation: () => undefined,
      onGapSignal: () => undefined,
      onComplete: () => undefined,
      onError,
      fetchImpl,
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const err = onError.mock.calls[0]?.[0] as AmicusError;
    expect(err.code).toBe('PROXY_UNAUTHORIZED');
  });

  it('surfaces EMBED_FAILED on 429 rate limit', async () => {
    const onError = jest.fn();
    const fetchImpl = jest.fn(async () =>
      new Response('rate limit', { status: 429 }),
    ) as unknown as typeof fetch;

    await streamChat({
      threadId: 't1',
      userQuery: 'q',
      conversationHistory: [],
      authToken: 'tok',
      signal: new AbortController().signal,
      onDelta: () => undefined,
      onCitation: () => undefined,
      onGapSignal: () => undefined,
      onComplete: () => undefined,
      onError,
      fetchImpl,
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('surfaces OFFLINE when network throws', async () => {
    const onError = jest.fn();
    const fetchImpl = jest.fn(async () => {
      throw new Error('network failure');
    }) as unknown as typeof fetch;

    await streamChat({
      threadId: 't1',
      userQuery: 'q',
      conversationHistory: [],
      authToken: 'tok',
      signal: new AbortController().signal,
      onDelta: () => undefined,
      onCitation: () => undefined,
      onGapSignal: () => undefined,
      onComplete: () => undefined,
      onError,
      fetchImpl,
    });

    const err = onError.mock.calls[0]?.[0] as AmicusError;
    expect(err.code).toBe('OFFLINE');
  });

  it('fires onGapSignal when the response has a trailing gap envelope', async () => {
    const onGapSignal = jest.fn();
    const fetchImpl = jest.fn(async () =>
      sseResponse([
        JSON.stringify({
          type: 'content_block_delta',
          delta: { text: "I don't have corpus on that.\n" },
        }),
        JSON.stringify({
          type: 'content_block_delta',
          delta: { text: '{"gap": true, "gap_type": "content"}' },
        }),
      ]),
    ) as unknown as typeof fetch;

    await streamChat({
      threadId: 't1',
      userQuery: 'q',
      conversationHistory: [],
      authToken: 'tok',
      signal: new AbortController().signal,
      onDelta: () => undefined,
      onCitation: () => undefined,
      onGapSignal,
      onComplete: () => undefined,
      onError: () => undefined,
      fetchImpl,
    });

    expect(onGapSignal).toHaveBeenCalledTimes(1);
    expect(onGapSignal.mock.calls[0]?.[0]).toMatchObject({ gap: true });
  });
});
