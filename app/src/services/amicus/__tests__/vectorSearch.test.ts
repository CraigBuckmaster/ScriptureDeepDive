/**
 * Tests for vectorSearch pure helpers (packVector, distanceToSimilarity) and
 * for the searchByVector error path when sqlite-vec isn't loaded. The full
 * SQL path is covered in the integration smoke test (#1453).
 */
import { distanceToSimilarity, packVector, searchByVector } from '../vectorSearch';
import { AmicusError } from '../types';
import { getMockDb, resetMockDb } from '../../../../__tests__/helpers/mockDb';

jest.mock('@/db/database', () => require('../../../../__tests__/helpers/mockDb').mockDatabaseModule());

describe('packVector', () => {
  it('produces 4 bytes per float, little-endian', () => {
    const blob = packVector([1.0, 0.5]);
    expect(blob.byteLength).toBe(8);
    const view = new DataView(blob.buffer);
    expect(view.getFloat32(0, true)).toBeCloseTo(1.0);
    expect(view.getFloat32(4, true)).toBeCloseTo(0.5);
  });

  it('handles 1536-dim vectors', () => {
    const v = new Array(1536).fill(0.01);
    const blob = packVector(v);
    expect(blob.byteLength).toBe(1536 * 4);
  });
});

describe('distanceToSimilarity', () => {
  it('is 1 at distance 0', () => {
    expect(distanceToSimilarity(0)).toBe(1);
  });
  it('monotonically decreases with distance', () => {
    expect(distanceToSimilarity(1)).toBeGreaterThan(distanceToSimilarity(2));
    expect(distanceToSimilarity(10)).toBeGreaterThan(distanceToSimilarity(100));
  });
  it('clamps invalid input to 0', () => {
    expect(distanceToSimilarity(-1)).toBe(0);
    expect(distanceToSimilarity(Number.NaN)).toBe(0);
  });
});

describe('searchByVector', () => {
  beforeEach(() => {
    resetMockDb();
  });

  it('maps rows into RetrievedChunk shape', async () => {
    const mock = getMockDb();
    mock.getAllAsync.mockResolvedValueOnce([
      {
        chunk_id: 'section_panel:romans-9-s1-calvin',
        source_type: 'section_panel',
        source_id: 'romans-9-s1-calvin',
        text: 'Calvin on election',
        distance: 0.2,
        scholar_id: 'calvin',
        tradition: 'Reformed',
        book_id: 'romans',
        chapter_num: 9,
        verse_start: 1,
        verse_end: 29,
        panel_type: 'calvin',
      },
    ]);

    const chunks = await searchByVector([0, 0, 0]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.chunk_id).toBe('section_panel:romans-9-s1-calvin');
    expect(chunks[0]!.score).toBeGreaterThan(0);
    expect(chunks[0]!.metadata.scholar_id).toBe('calvin');
  });

  it('throws EXTENSION_NOT_LOADED when sqlite-vec is missing', async () => {
    const mock = getMockDb();
    mock.getAllAsync.mockRejectedValueOnce(new Error('no such module: vec0'));
    await expect(searchByVector([0, 0])).rejects.toBeInstanceOf(AmicusError);
    try {
      await searchByVector([0, 0]);
    } catch (err) {
      expect((err as AmicusError).code).toBe('EXTENSION_NOT_LOADED');
    }
  });

  it('returns [] when the vec0 table is empty', async () => {
    const mock = getMockDb();
    mock.getAllAsync.mockResolvedValueOnce([]);
    expect(await searchByVector([0, 0])).toEqual([]);
  });
});
