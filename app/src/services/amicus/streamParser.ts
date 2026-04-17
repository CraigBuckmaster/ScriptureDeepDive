/**
 * services/amicus/streamParser.ts — Pure helpers for parsing the streamed
 * Amicus chat response.
 *
 * The server emits Anthropic-style SSE lines (`data: {...}`). We accumulate
 * the assistant's text, then extract:
 *   - the prose (stripped of the trailing `{"gap": ...}` envelope)
 *   - inline citation markers `[CITE:source_type:source_id]` or `[chunk_id]`
 *   - the optional gap_signal envelope
 *   - an optional follow_ups envelope (two-JSON tail: follow_ups then gap)
 */

export type ChunkSourceType =
  | 'section_panel'
  | 'chapter_panel'
  | 'word_study'
  | 'lexicon_entry'
  | 'debate_topic'
  | 'cross_ref_thread_note'
  | 'journey_stop'
  | 'meta_faq';

export interface CitationPillData {
  chunk_id: string;
  source_type: ChunkSourceType;
  source_id: string;
  display_label: string;
  scholar_id?: string;
}

export interface GapSignal {
  gap: boolean;
  gap_type?: 'content' | 'translation' | 'out_of_scope';
  topic?: string;
}

export type ProseNode =
  | { type: 'text'; text: string }
  | { type: 'citation'; pill: CitationPillData };

export interface ParsedResponse {
  prose: string;          // with citations stripped to `[chunk_id]` markers
  nodes: ProseNode[];     // interleaved text + citation nodes
  citations: CitationPillData[];
  follow_ups: string[];
  gap_signal: GapSignal | null;
}

const CITE_RE = /\[CITE:([a-z_]+):([A-Za-z0-9._-]+)]|\[([a-z_]+:[A-Za-z0-9._-]+)]/g;

const VALID_SOURCE_TYPES: readonly ChunkSourceType[] = [
  'section_panel',
  'chapter_panel',
  'word_study',
  'lexicon_entry',
  'debate_topic',
  'cross_ref_thread_note',
  'journey_stop',
  'meta_faq',
];

/**
 * Incrementally consume an SSE-formatted chunk and return the newly-added
 * assistant text (if any). Caller maintains the accumulated buffer.
 *
 * Each SSE line looks like `data: {"type":"content_block_delta",...}`.
 */
export function extractDeltaText(sseChunk: string): string {
  let out = '';
  for (const line of sseChunk.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      const ev = JSON.parse(payload) as {
        type?: string;
        delta?: { text?: string };
      };
      if (ev.type === 'content_block_delta' && typeof ev.delta?.text === 'string') {
        out += ev.delta.text;
      }
    } catch {
      /* non-JSON — ignore */
    }
  }
  return out;
}

/**
 * Parse the accumulated assistant text into prose nodes + citations +
 * follow-ups + gap signal. Idempotent and pure.
 */
export function parseAssistantMessage(accumulated: string): ParsedResponse {
  // Strip trailing JSON envelopes (two max: gap_signal, follow_ups).
  let body = accumulated.trim();
  let gapSignal: GapSignal | null = null;
  let followUps: string[] = [];

  for (let i = 0; i < 2; i++) {
    const trail = extractTrailingJson(body);
    if (!trail) break;
    body = trail.remaining;
    const gap = parseGapCandidate(trail.json);
    if (gap) {
      gapSignal = gap;
      continue;
    }
    const fus = parseFollowUpsCandidate(trail.json);
    if (fus) {
      followUps = fus;
      continue;
    }
    // Neither — push it back as prose and stop so we don't swallow text.
    body = trail.remaining + trail.json;
    break;
  }

  const nodes: ProseNode[] = [];
  const citations: CitationPillData[] = [];
  const seen = new Set<string>();

  let cursor = 0;
  for (const match of body.matchAll(CITE_RE)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      nodes.push({ type: 'text', text: body.slice(cursor, start) });
    }
    const [, typeA, idA, whole] = match;
    let source_type: string;
    let source_id: string;
    if (typeA && idA) {
      source_type = typeA;
      source_id = idA;
    } else if (whole) {
      const idx = whole.indexOf(':');
      source_type = whole.slice(0, idx);
      source_id = whole.slice(idx + 1);
    } else {
      cursor = start + match[0].length;
      continue;
    }
    if (!isValidSourceType(source_type)) {
      // Preserve the literal if the source type is unknown.
      nodes.push({ type: 'text', text: match[0] });
      cursor = start + match[0].length;
      continue;
    }
    const chunkId = `${source_type}:${source_id}`;
    const pill: CitationPillData = {
      chunk_id: chunkId,
      source_type,
      source_id,
      display_label: defaultDisplayLabel(source_type, source_id),
      scholar_id: deriveScholarId(source_type, source_id),
    };
    nodes.push({ type: 'citation', pill });
    if (!seen.has(chunkId)) {
      citations.push(pill);
      seen.add(chunkId);
    }
    cursor = start + match[0].length;
  }
  if (cursor < body.length) {
    nodes.push({ type: 'text', text: body.slice(cursor) });
  }

  // Normalised prose for persistence: the original text with CITE markers
  // collapsed to canonical `[chunk_id]` form.
  const prose = nodes
    .map((n) => (n.type === 'text' ? n.text : `[${n.pill.chunk_id}]`))
    .join('')
    .trim();

  return { prose, nodes, citations, follow_ups: followUps, gap_signal: gapSignal };
}

// ── JSON envelope extraction ──────────────────────────────────────────

interface Trail {
  remaining: string;
  json: string;
}

/** Pull the last top-level `{...}` JSON literal off the end of the string. */
function extractTrailingJson(text: string): Trail | null {
  const trimmed = text.trimEnd();
  if (!trimmed.endsWith('}')) return null;
  let depth = 0;
  let start = -1;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const c = trimmed[i];
    if (c === '}') depth++;
    else if (c === '{') {
      depth--;
      if (depth === 0) {
        start = i;
        break;
      }
    }
  }
  if (start < 0) return null;
  return {
    remaining: trimmed.slice(0, start).trimEnd(),
    json: trimmed.slice(start),
  };
}

function parseGapCandidate(jsonText: string): GapSignal | null {
  try {
    const obj = JSON.parse(jsonText) as Record<string, unknown>;
    if (typeof obj.gap !== 'boolean') return null;
    const out: GapSignal = { gap: obj.gap };
    if (
      typeof obj.gap_type === 'string' &&
      ['content', 'translation', 'out_of_scope'].includes(obj.gap_type)
    ) {
      out.gap_type = obj.gap_type as GapSignal['gap_type'];
    }
    if (typeof obj.topic === 'string') out.topic = obj.topic;
    return out;
  } catch {
    return null;
  }
}

function parseFollowUpsCandidate(jsonText: string): string[] | null {
  try {
    const obj = JSON.parse(jsonText) as { follow_ups?: unknown };
    if (!Array.isArray(obj.follow_ups)) return null;
    const strings = obj.follow_ups.filter((x): x is string => typeof x === 'string');
    return strings.slice(0, 3);
  } catch {
    return null;
  }
}

// ── Display helpers ──────────────────────────────────────────────────

function isValidSourceType(t: string): t is ChunkSourceType {
  return (VALID_SOURCE_TYPES as readonly string[]).includes(t);
}

function defaultDisplayLabel(sourceType: string, sourceId: string): string {
  // Best-effort — the real display_label can be looked up later in
  // citation rendering. For text-only tests this keeps the pill useful.
  if (sourceType === 'section_panel') {
    // "romans-9-s1-calvin" → "Calvin · Romans 9"
    const m = /^([a-z0-9_]+)-(\d+)-s(\d+)-([a-z0-9]+)$/.exec(sourceId);
    if (m) {
      const book = m[1]!.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${capitalize(m[4]!)} · ${book} ${m[2]}`;
    }
  }
  if (sourceType === 'chapter_panel') {
    const m = /^([a-z0-9_]+)-(\d+)-([a-z0-9]+)$/.exec(sourceId);
    if (m) {
      const book = m[1]!.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${book} ${m[2]} · ${capitalize(m[3]!)}`;
    }
  }
  if (sourceType === 'word_study') return `Word study · ${sourceId}`;
  if (sourceType === 'lexicon_entry') return `Lexicon · ${sourceId}`;
  if (sourceType === 'debate_topic') return `Debate · ${sourceId}`;
  if (sourceType === 'meta_faq') return `Background · ${sourceId}`;
  if (sourceType === 'journey_stop') return `Journey · ${sourceId}`;
  if (sourceType === 'cross_ref_thread_note') return `Cross-ref · ${sourceId}`;
  return `${sourceType}:${sourceId}`;
}

function deriveScholarId(sourceType: string, sourceId: string): string | undefined {
  if (sourceType !== 'section_panel') return undefined;
  const m = /-s\d+-([a-z0-9]+)$/.exec(sourceId);
  return m ? m[1] : undefined;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
