import { describe, it, expect } from 'vitest';
import {
  HAIKU_MODEL,
  SONNET_MODEL,
  buildMessages,
  buildSystemPrompt,
  chooseModel,
  streamChat,
} from '../src/anthropic';
import type { ChatRequest } from '../src/types';

const baseReq: ChatRequest = {
  query: 'What does hesed mean?',
  retrieved_chunks: [
    {
      chunk_id: 'word_study:hesed',
      source_type: 'word_study',
      text: 'hesed — covenant faithfulness',
      metadata: {},
    },
  ],
  profile_summary: 'Studies often in Psalms.',
  current_chapter_ref: 'psalms/23',
  model_tier: 'haiku',
  conversation_history: [],
};

describe('chooseModel', () => {
  it('uses Haiku for premium + haiku hint', () => {
    expect(chooseModel(baseReq, 'premium')).toBe(HAIKU_MODEL);
  });
  it('uses Sonnet for premium + sonnet hint', () => {
    expect(chooseModel({ ...baseReq, model_tier: 'sonnet' }, 'premium')).toBe(
      SONNET_MODEL,
    );
  });
  it('always uses Sonnet for partner_plus, overriding client hint', () => {
    expect(chooseModel(baseReq, 'partner_plus')).toBe(SONNET_MODEL);
    expect(chooseModel({ ...baseReq, model_tier: 'sonnet' }, 'partner_plus')).toBe(
      SONNET_MODEL,
    );
  });
});

describe('buildSystemPrompt', () => {
  it('embeds chunk ids and source types', () => {
    const prompt = buildSystemPrompt(baseReq);
    expect(prompt).toContain('word_study:hesed');
    expect(prompt).toContain('word_study');
    expect(prompt).toContain('covenant faithfulness');
  });

  it('injects current chapter ref', () => {
    expect(buildSystemPrompt(baseReq)).toContain('psalms/23');
    expect(buildSystemPrompt({ ...baseReq, current_chapter_ref: null })).toContain('none');
  });

  it('includes profile summary when provided', () => {
    expect(buildSystemPrompt(baseReq)).toContain('Studies often in Psalms');
    expect(buildSystemPrompt({ ...baseReq, profile_summary: '' })).toContain('(no profile)');
  });
});

describe('buildMessages', () => {
  it('appends the user query as the final message', () => {
    const msgs = buildMessages(baseReq);
    expect(msgs[msgs.length - 1]?.role).toBe('user');
    expect(msgs[msgs.length - 1]?.content).toBe(baseReq.query);
  });

  it('preserves conversation_history order', () => {
    const hist: ChatRequest['conversation_history'] = [
      { role: 'user', content: 'Earlier question' },
      { role: 'assistant', content: 'Earlier answer' },
    ];
    const msgs = buildMessages({ ...baseReq, conversation_history: hist });
    expect(msgs).toHaveLength(3);
    expect(msgs[0]).toEqual(hist[0]);
    expect(msgs[1]).toEqual(hist[1]);
    expect(msgs[2]?.content).toBe(baseReq.query);
  });
});

describe('streamChat', () => {
  it('sets the zero-retention header on the outbound request', async () => {
    let captured: Request | null = null;
    const fakeFetch = (async (input: RequestInfo, init?: RequestInit) => {
      captured = new Request(input as string, init);
      return new Response('ok', { status: 200 });
    }) as typeof fetch;

    await streamChat({
      req: baseReq,
      entitlement: 'premium',
      apiKey: 'sk-test',
      fetchImpl: fakeFetch,
    });
    expect(captured).not.toBeNull();
    expect(captured!.headers.get('anthropic-no-retention')).toBe('true');
    expect(captured!.headers.get('x-api-key')).toBe('sk-test');
    expect(captured!.headers.get('anthropic-version')).toBe('2023-06-01');
  });

  it('includes model + system + messages in the body', async () => {
    let bodyText = '';
    const fakeFetch = (async (_url: RequestInfo, init?: RequestInit) => {
      bodyText = (init?.body as string) ?? '';
      return new Response('ok', { status: 200 });
    }) as typeof fetch;

    await streamChat({
      req: { ...baseReq, model_tier: 'sonnet' },
      entitlement: 'premium',
      apiKey: 'sk-test',
      fetchImpl: fakeFetch,
    });
    const parsed = JSON.parse(bodyText) as {
      model: string;
      system: string;
      messages: Array<{ role: string; content: string }>;
      stream: boolean;
    };
    expect(parsed.model).toBe(SONNET_MODEL);
    expect(parsed.stream).toBe(true);
    expect(parsed.system).toContain('Amicus');
    expect(parsed.messages[parsed.messages.length - 1]?.content).toBe(baseReq.query);
  });
});
