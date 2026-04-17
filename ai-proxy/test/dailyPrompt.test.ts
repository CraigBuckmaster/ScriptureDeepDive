import { describe, it, expect } from 'vitest';
import {
  buildUserMessage,
  cachedUntilFor,
  DAILY_PROMPT_MODEL,
  DAILY_PROMPT_SYSTEM,
  generateDailyPrompt,
  parseModelPayload,
  validateDailyPromptRequest,
} from '../src/dailyPrompt';

const baseReq = {
  profile_summary: 'Reformed-leaning; recent focus on covenant themes.',
  last_5_chapters: [
    'jeremiah:29',
    'jeremiah:30',
    'jeremiah:31',
    'romans:9',
    'romans:10',
  ],
  client_date: '2026-04-17',
};

describe('validateDailyPromptRequest', () => {
  it('accepts a well-formed body', () => {
    expect(validateDailyPromptRequest(baseReq)).toEqual(baseReq);
  });

  it('rejects non-object inputs', () => {
    expect(validateDailyPromptRequest(null)).toBeNull();
    expect(validateDailyPromptRequest('x')).toBeNull();
    expect(validateDailyPromptRequest(42)).toBeNull();
  });

  it('rejects missing or mistyped fields', () => {
    expect(
      validateDailyPromptRequest({ ...baseReq, profile_summary: 7 }),
    ).toBeNull();
    expect(
      validateDailyPromptRequest({ ...baseReq, last_5_chapters: 'jeremiah:29' }),
    ).toBeNull();
    expect(
      validateDailyPromptRequest({ ...baseReq, last_5_chapters: [1, 2, 3] }),
    ).toBeNull();
  });

  it('rejects non-ISO client_date values', () => {
    expect(
      validateDailyPromptRequest({ ...baseReq, client_date: '04/17/2026' }),
    ).toBeNull();
    expect(
      validateDailyPromptRequest({ ...baseReq, client_date: '2026-4-17' }),
    ).toBeNull();
  });

  it('accepts empty chapter history (new users)', () => {
    const body = { ...baseReq, last_5_chapters: [] };
    expect(validateDailyPromptRequest(body)).toEqual(body);
  });
});

describe('buildUserMessage', () => {
  it('includes the date, chapters, and profile', () => {
    const msg = buildUserMessage(baseReq);
    expect(msg).toContain('2026-04-17');
    expect(msg).toContain('jeremiah:29');
    expect(msg).toContain('covenant themes');
  });

  it('falls back to (none yet) when no chapters are supplied', () => {
    expect(buildUserMessage({ ...baseReq, last_5_chapters: [] })).toContain(
      '(none yet)',
    );
  });

  it('falls back to (no profile yet) when the profile string is blank', () => {
    expect(buildUserMessage({ ...baseReq, profile_summary: '   ' })).toContain(
      '(no profile yet)',
    );
  });
});

describe('cachedUntilFor', () => {
  it('returns the start of the following UTC day', () => {
    expect(cachedUntilFor('2026-04-17')).toBe('2026-04-18T00:00:00.000Z');
  });
});

describe('parseModelPayload', () => {
  it('parses a bare JSON object', () => {
    const parsed = parseModelPayload(
      '{"prompt_text":"Amicus noticed…","seed_query":"What did Jeremiah say?"}',
    );
    expect(parsed).toEqual({
      prompt_text: 'Amicus noticed…',
      seed_query: 'What did Jeremiah say?',
    });
  });

  it('strips surrounding code fences', () => {
    const parsed = parseModelPayload(
      '```json\n{"prompt_text":"x","seed_query":"y"}\n```',
    );
    expect(parsed?.prompt_text).toBe('x');
  });

  it('returns null for non-JSON responses', () => {
    expect(parseModelPayload('Amicus noticed that...')).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    expect(parseModelPayload('{"prompt_text":"x"}')).toBeNull();
    expect(parseModelPayload('{"seed_query":"x"}')).toBeNull();
    expect(parseModelPayload('{"prompt_text":"","seed_query":"x"}')).toBeNull();
  });
});

describe('generateDailyPrompt', () => {
  function mockFetch(payload: unknown, opts: { status?: number } = {}) {
    return (async () =>
      new Response(JSON.stringify(payload), {
        status: opts.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      })) as unknown as typeof fetch;
  }

  it('calls Anthropic with the cached system block and returns the parsed payload', async () => {
    let captured: Request | null = null;
    const fetchImpl = (async (input: RequestInfo, init?: RequestInit) => {
      captured = new Request(input as string, init);
      return new Response(
        JSON.stringify({
          content: [
            {
              type: 'text',
              text: '{"prompt_text":"Amicus noticed Jeremiah is weighing on you — want to trace the covenant thread?","seed_query":"What is the covenant arc in Jeremiah 29-31?"}',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as unknown as typeof fetch;

    const result = await generateDailyPrompt({
      req: baseReq,
      apiKey: 'key',
      fetchImpl,
    });

    expect(result.prompt_text).toMatch(/covenant thread/);
    expect(result.seed_query).toMatch(/covenant arc/);
    expect(result.cached_until).toBe('2026-04-18T00:00:00.000Z');

    expect(captured!.headers.get('x-api-key')).toBe('key');
    expect(captured!.headers.get('anthropic-no-retention')).toBe('true');
    const body = JSON.parse(await captured!.text()) as {
      model: string;
      system: Array<{ text: string; cache_control?: { type: string } }>;
    };
    expect(body.model).toBe(DAILY_PROMPT_MODEL);
    expect(body.system[0]!.text).toBe(DAILY_PROMPT_SYSTEM);
    expect(body.system[0]!.cache_control?.type).toBe('ephemeral');
  });

  it('throws when Anthropic returns a non-2xx', async () => {
    await expect(
      generateDailyPrompt({
        req: baseReq,
        apiKey: 'key',
        fetchImpl: mockFetch({}, { status: 500 }),
      }),
    ).rejects.toThrow(/anthropic_error_500/);
  });

  it('throws when the response body is empty', async () => {
    await expect(
      generateDailyPrompt({
        req: baseReq,
        apiKey: 'key',
        fetchImpl: mockFetch({ content: [] }),
      }),
    ).rejects.toThrow(/anthropic_empty_response/);
  });

  it('throws when the model returns unparseable JSON', async () => {
    await expect(
      generateDailyPrompt({
        req: baseReq,
        apiKey: 'key',
        fetchImpl: mockFetch({ content: [{ type: 'text', text: 'not json' }] }),
      }),
    ).rejects.toThrow(/anthropic_bad_shape/);
  });
});
