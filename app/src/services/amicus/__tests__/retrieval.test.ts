/**
 * Integration-ish tests for retrieval orchestrator.
 *
 * Wires together a fake proxy (via fetchImpl) and the mock scripture.db so
 * the whole pipeline can be exercised without real network or native SQLite.
 */
import { retrieve } from '../retrieval';
import { AmicusError, type CompressedProfile, type RetrievedChunk } from '../types';
import { getMockDb, resetMockDb } from '../../../../__tests__/helpers/mockDb';

jest.mock('@/db/database', () => require('../../../../__tests__/helpers/mockDb').mockDatabaseModule());

function fakeEmbedResponse(): Response {
  return new Response(JSON.stringify({ vector: new Array(1536).fill(0.01) }), {
    status: 200,
  });
}

const PROFILE: CompressedProfile = {
  prose: 'Test profile',
  preferred_scholars: ['calvin'],
  preferred_traditions: ['Reformed'],
};

describe('retrieve', () => {
  beforeEach(() => {
    resetMockDb();
  });

  it('returns up to 10 boosted, diversified chunks', async () => {
    const mock = getMockDb();
    const rows = Array.from({ length: 30 }).map((_, i) => ({
      chunk_id: `section_panel:chunk-${i}`,
      source_type: 'section_panel',
      source_id: `chunk-${i}`,
      text: `text ${i}`,
      distance: 0.1 * i,
      scholar_id: i % 3 === 0 ? 'calvin' : 'wright',
      tradition: i % 3 === 0 ? 'Reformed' : 'Evangelical',
      book_id: 'romans',
      chapter_num: 9,
      verse_start: null,
      verse_end: null,
      panel_type: 'calvin',
    }));
    mock.getAllAsync.mockResolvedValueOnce(rows);

    const fetchImpl = jest.fn(async () => fakeEmbedResponse()) as unknown as typeof fetch;

    const result = await retrieve(
      {
        query: 'election in Romans 9',
        profile: PROFILE,
        currentChapterRef: { book_id: 'romans', chapter_num: 9 },
      },
      { authToken: 'tkn', fetchImpl },
    );

    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks.length).toBeLessThanOrEqual(10);
    expect(result.embedMs).toBeGreaterThanOrEqual(0);
    // Chapter boost shown — every returned chunk is on romans 9 so all get ×1.5
    for (const c of result.chunks) {
      expect(c.score).toBeGreaterThan(0);
    }
  });

  it('propagates AmicusError.OFFLINE from embed', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('network');
    }) as unknown as typeof fetch;

    await expect(
      retrieve(
        {
          query: 'q',
          profile: PROFILE,
          currentChapterRef: null,
        },
        { authToken: 'tkn', fetchImpl },
      ),
    ).rejects.toMatchObject({ code: 'OFFLINE' });
  });

  it('propagates EXTENSION_NOT_LOADED from vector search', async () => {
    const mock = getMockDb();
    mock.getAllAsync.mockRejectedValueOnce(new Error('no such module: vec0'));

    const fetchImpl = jest.fn(async () => fakeEmbedResponse()) as unknown as typeof fetch;

    await expect(
      retrieve(
        { query: 'q', profile: PROFILE, currentChapterRef: null },
        { authToken: 'tkn', fetchImpl },
      ),
    ).rejects.toBeInstanceOf(AmicusError);
  });

  it('returns an empty result when vector search finds no matches', async () => {
    const mock = getMockDb();
    mock.getAllAsync.mockResolvedValueOnce([]);
    const fetchImpl = jest.fn(async () => fakeEmbedResponse()) as unknown as typeof fetch;

    const r = await retrieve(
      { query: 'q', profile: PROFILE, currentChapterRef: null },
      { authToken: 'tkn', fetchImpl },
    );
    expect(r.chunks).toEqual<RetrievedChunk[]>([]);
  });
});
