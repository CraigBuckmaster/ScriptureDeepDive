import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  captureResponseSample,
  DEFAULT_SAMPLE_RATE,
  scrubBody,
  scrubQuery,
} from '../src/responseSampling';
import type { ChatRequest, Env } from '../src/types';

function makeChat(): ChatRequest {
  return {
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
}

function makeD1(): { binds: unknown[][]; env: Env } {
  const binds: unknown[][] = [];
  const stmt = {
    bind(...args: unknown[]) {
      return {
        run: async () => {
          binds.push(args);
        },
      };
    },
  };
  const env = {
    VERSION: '1',
    RATE_LIMITS: {} as unknown as Env['RATE_LIMITS'],
    CORPUS_GAPS: {
      prepare: () => stmt,
    } as unknown as Env['CORPUS_GAPS'],
  };
  return { binds, env };
}

describe('scrubQuery / scrubBody', () => {
  it('redacts emails and phone numbers', () => {
    const q = 'contact foo@example.com or +1 (555) 123-4567 please';
    expect(scrubQuery(q)).toBe('contact [email] or [phone] please');
  });
  it('clamps length', () => {
    const big = 'a'.repeat(3000);
    expect(scrubQuery(big).length).toBe(2000);
    expect(scrubBody(big).length).toBe(3000);
  });
});

describe('captureResponseSample', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T00:00:00Z'));
  });

  it('skips writing when the random roll exceeds the sample rate', async () => {
    const { binds, env } = makeD1();
    const out = await captureResponseSample({
      chat: makeChat(),
      responseText: 'x',
      citations: [],
      citedChunkIds: [],
      modelTier: 'haiku',
      latencyMs: 10,
      reason: 'random_1pct',
      receiptHash: 'hash-x',
      env,
      rand: () => 0.99,
    });
    expect(out).toBeNull();
    expect(binds).toHaveLength(0);
  });

  it('always writes gap_signal + user_feedback samples regardless of rand', async () => {
    const { binds, env } = makeD1();
    await captureResponseSample({
      chat: makeChat(),
      responseText: 'x',
      citations: [],
      citedChunkIds: [],
      modelTier: 'haiku',
      latencyMs: 10,
      reason: 'gap_signal',
      receiptHash: 'hash-x',
      env,
      rand: () => 0.99,
      makeId: () => 'id-1',
    });
    await captureResponseSample({
      chat: makeChat(),
      responseText: 'x',
      citations: [],
      citedChunkIds: [],
      modelTier: 'haiku',
      latencyMs: 10,
      reason: 'user_feedback',
      receiptHash: 'hash-x',
      env,
      rand: () => 0.99,
      makeId: () => 'id-2',
    });
    expect(binds).toHaveLength(2);
    expect(binds[0]![0]).toBe('id-1');
    expect(binds[1]![0]).toBe('id-2');
  });

  it('writes a scrubbed sample row when random_1pct wins', async () => {
    const { binds, env } = makeD1();
    const out = await captureResponseSample({
      chat: makeChat(),
      responseText: 'Hesed means covenant faithfulness — email me at foo@example.com',
      citations: [
        {
          chunk_id: 'word_study:hesed',
          source_type: 'word_study',
          display_label: 'hesed',
        },
      ],
      citedChunkIds: ['word_study:hesed'],
      modelTier: 'haiku',
      latencyMs: 42,
      reason: 'random_1pct',
      receiptHash: 'hash-y',
      env,
      rand: () => 0.001,   // < DEFAULT_SAMPLE_RATE
      makeId: () => 'id-3',
    });
    expect(out).toBe('id-3');
    expect(binds).toHaveLength(1);
    const row = binds[0]!;
    expect(row[0]).toBe('id-3');                         // sample_id
    expect(row[2]).toBe('What does hesed mean?');        // scrubbed query
    expect(row[7]).toContain('[email]');                 // scrubbed body
    expect(row[11]).toBe('random_1pct');                 // sample_reason
  });

  it('returns null when no D1 binding is configured', async () => {
    const env = { VERSION: '1', RATE_LIMITS: {} as Env['RATE_LIMITS'] } as Env;
    const out = await captureResponseSample({
      chat: makeChat(),
      responseText: 'x',
      citations: [],
      citedChunkIds: [],
      modelTier: 'haiku',
      latencyMs: 10,
      reason: 'random_1pct',
      receiptHash: 'h',
      env,
      rand: () => 0,
    });
    expect(out).toBeNull();
  });

  it('default sample rate is 1%', () => {
    expect(DEFAULT_SAMPLE_RATE).toBeCloseTo(0.01);
  });
});
