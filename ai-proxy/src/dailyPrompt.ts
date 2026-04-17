/**
 * dailyPrompt.ts — "Amicus noticed..." proactive prompt generator (#1465).
 *
 * One non-streaming Haiku call per user per day. The system prompt is
 * identical for every user, so it benefits from Anthropic prompt caching —
 * the user-specific signals (profile, recent chapters, client date) stay in
 * the user message so the system block is a stable cache key.
 */
import type { Env } from './types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
export const DAILY_PROMPT_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 180;

export const DAILY_PROMPT_SYSTEM = `You are Amicus, a scholarly study partner for the Companion Study Bible app.

Generate a brief "Amicus noticed..." proactive study prompt for this user based on their recent reading pattern. It should reference something specific they have been studying and suggest a direction they have not explored yet.

Rules:
- Length: exactly 2 sentences, max ~280 characters of prose.
- Warm tone, never preachy or moralizing.
- End the prose with a question the user can tap to explore.
- Respond ONLY with a single JSON object on a single line (no code fences, no commentary) with the shape:
  {"prompt_text": "...", "seed_query": "..."}
- prompt_text is the two-sentence prose shown on the home card.
- seed_query is the question sent into a fresh Amicus thread when the user taps the card — it should re-state the question in first-person ("What does...", "How do...") so the AI can answer it directly.`;

export interface DailyPromptRequest {
  profile_summary: string;
  last_5_chapters: string[];
  client_date: string; // YYYY-MM-DD
}

export interface DailyPromptResponse {
  prompt_text: string;
  seed_query: string;
  cached_until: string;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDailyPromptRequest(
  body: unknown,
): DailyPromptRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.profile_summary !== 'string') return null;
  if (!Array.isArray(b.last_5_chapters)) return null;
  if (!b.last_5_chapters.every((x) => typeof x === 'string')) return null;
  if (typeof b.client_date !== 'string' || !ISO_DATE_RE.test(b.client_date)) {
    return null;
  }
  return {
    profile_summary: b.profile_summary,
    last_5_chapters: b.last_5_chapters as string[],
    client_date: b.client_date,
  };
}

export function buildUserMessage(req: DailyPromptRequest): string {
  const chapters =
    req.last_5_chapters.length > 0
      ? req.last_5_chapters.join(', ')
      : '(none yet)';
  const profile = req.profile_summary.trim() || '(no profile yet)';
  return `Today: ${req.client_date}
Recent chapters: ${chapters}
User profile: ${profile}`;
}

function cachedUntilFor(clientDate: string): string {
  // 24h past the start of the user's local date → ISO string in UTC.
  const parsed = new Date(`${clientDate}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
}

interface AnthropicMessagesResponse {
  content?: Array<{ type: string; text?: string }>;
}

export interface GenerateArgs {
  req: DailyPromptRequest;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

/**
 * Calls Anthropic and returns a parsed DailyPromptResponse, or throws for
 * any upstream failure. Callers map thrown errors to HTTP responses.
 */
export async function generateDailyPrompt(
  args: GenerateArgs,
): Promise<DailyPromptResponse> {
  const fetchImpl = args.fetchImpl ?? fetch;

  const body = {
    model: DAILY_PROMPT_MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text' as const,
        text: DAILY_PROMPT_SYSTEM,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    messages: [
      { role: 'user' as const, content: buildUserMessage(args.req) },
    ],
  };

  const upstream = await fetchImpl(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': args.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-no-retention': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    throw new Error(`anthropic_error_${upstream.status}`);
  }

  const payload = (await upstream.json()) as AnthropicMessagesResponse;
  const text = payload.content
    ?.filter((c) => c.type === 'text' && typeof c.text === 'string')
    .map((c) => c.text as string)
    .join('')
    .trim();
  if (!text) throw new Error('anthropic_empty_response');

  const parsed = parseModelPayload(text);
  if (!parsed) throw new Error('anthropic_bad_shape');

  return {
    prompt_text: parsed.prompt_text,
    seed_query: parsed.seed_query,
    cached_until: cachedUntilFor(args.req.client_date),
  };
}

/**
 * Accepts either a bare JSON object or one wrapped in a ```json ... ``` fence
 * (models occasionally add fences despite instructions).
 */
export function parseModelPayload(
  raw: string,
): { prompt_text: string; seed_query: string } | null {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  let obj: unknown;
  try {
    obj = JSON.parse(stripped);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.prompt_text !== 'string' || o.prompt_text.length === 0) {
    return null;
  }
  if (typeof o.seed_query !== 'string' || o.seed_query.length === 0) {
    return null;
  }
  return { prompt_text: o.prompt_text, seed_query: o.seed_query };
}

// Exported for tests that want to assert the cached_until computation.
export { cachedUntilFor };

// Re-export types for index.ts to avoid `import type` churn.
export type { Env };
