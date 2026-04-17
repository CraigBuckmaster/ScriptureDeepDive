/**
 * anthropic.ts — Streaming Claude client.
 *
 * We do not trust the client's model_tier hint when the user has the
 * `partner_plus` entitlement: heavy users always get Sonnet. Zero-retention
 * is enforced server-side via the `anthropic-no-retention: true` header.
 */
import type { ChatRequest, Entitlement } from './types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
export const SONNET_MODEL = 'claude-opus-4-7';

export function chooseModel(req: ChatRequest, entitlement: Entitlement): string {
  if (entitlement === 'partner_plus') return SONNET_MODEL;
  return req.model_tier === 'sonnet' ? SONNET_MODEL : HAIKU_MODEL;
}

const SYSTEM_PROMPT_TEMPLATE = `You are Amicus, a scholarly study partner for the Companion Study Bible app.
You draw exclusively on the curated corpus provided in <retrieved_chunks>. Do
not invent citations or scholar attributions beyond what the chunks supply.

When the chunks do not contain enough relevant material to answer the user's
question, say so plainly and end your message with a single-line JSON envelope:
  {"gap": true, "gap_type": "content"|"translation"|"out_of_scope", "topic": "<short summary>"}

When you do have material to answer, end your message with:
  {"gap": false}

The user's compressed study profile is supplied in <profile>. Respect their
tradition(s), reading history, and current focus, but never invent user facts.

Current chapter context: {{CURRENT_CHAPTER_REF}}
`;

export function buildSystemPrompt(req: ChatRequest): string {
  const base = SYSTEM_PROMPT_TEMPLATE.replace(
    '{{CURRENT_CHAPTER_REF}}',
    req.current_chapter_ref ?? 'none',
  );
  const chunks = req.retrieved_chunks
    .map(
      (c) =>
        `[${c.chunk_id}] (${c.source_type})\n${c.text}`,
    )
    .join('\n\n---\n\n');
  const profile = req.profile_summary?.trim() || '(no profile)';
  return `${base}
<profile>
${profile}
</profile>

<retrieved_chunks>
${chunks}
</retrieved_chunks>
`;
}

/** Convert the proxy's conversation_history into Anthropic's messages array. */
export function buildMessages(req: ChatRequest): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history = req.conversation_history ?? [];
  return [...history, { role: 'user' as const, content: req.query }];
}

export interface StreamArgs {
  req: ChatRequest;
  entitlement: Entitlement;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

/**
 * Open a streaming Anthropic request. Returns the upstream Response so the
 * caller can pipe the body straight through to the client.
 */
export async function streamChat({
  req,
  entitlement,
  apiKey,
  fetchImpl = fetch,
}: StreamArgs): Promise<Response> {
  const body = {
    model: chooseModel(req, entitlement),
    system: buildSystemPrompt(req),
    messages: buildMessages(req),
    max_tokens: 1024,
    stream: true,
  };

  return fetchImpl(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-no-retention': 'true',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  });
}
