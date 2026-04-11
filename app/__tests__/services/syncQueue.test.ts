const mockRunAsync = jest.fn();
const mockGetFirstAsync = jest.fn();
const mockGetAllAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    runAsync: mockRunAsync,
    getFirstAsync: mockGetFirstAsync,
    getAllAsync: mockGetAllAsync,
  }),
}));

const mockSupabaseFrom = jest.fn();
const mockSupabaseFunctions = { invoke: jest.fn() };

const mockSupabase = {
  from: mockSupabaseFrom,
  functions: mockSupabaseFunctions,
};

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => mockSupabase),
  isSupabaseAvailable: jest.fn(() => true),
}));

import { enqueue, getPendingCount, flushQueue } from '@/services/syncQueue';
import { getSupabase } from '@/lib/supabase';

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  chain.insert = jest.fn().mockResolvedValue(result);
  chain.upsert = jest.fn().mockResolvedValue(result);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.match = jest.fn().mockResolvedValue(result);
  return chain;
}

describe('syncQueue service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunAsync.mockResolvedValue({ changes: 0 });
    mockGetFirstAsync.mockResolvedValue({ count: 0 });
    mockGetAllAsync.mockResolvedValue([]);
    (getSupabase as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('enqueue', () => {
    it('inserts into sync_queue with JSON.stringify payload', async () => {
      const payload = { user_id: 'u1', topic_id: 't1' };
      await enqueue('toggle_upvote', payload);

      expect(mockRunAsync).toHaveBeenCalledWith(
        'INSERT INTO sync_queue (operation, payload_json) VALUES (?, ?)',
        ['toggle_upvote', JSON.stringify(payload)],
      );
    });

    it('catches db error without throwing', async () => {
      mockRunAsync.mockRejectedValue(new Error('DB write failed'));

      await expect(enqueue('submit_flag', { reason: 'spam' })).resolves.toBeUndefined();
    });
  });

  describe('getPendingCount', () => {
    it('returns count from query', async () => {
      mockGetFirstAsync.mockResolvedValue({ count: 7 });

      const result = await getPendingCount();

      expect(result).toBe(7);
    });

    it('returns 0 on error', async () => {
      mockGetFirstAsync.mockRejectedValue(new Error('DB read failed'));

      const result = await getPendingCount();

      expect(result).toBe(0);
    });
  });

  describe('flushQueue', () => {
    it('returns 0 when supabase is null', async () => {
      (getSupabase as jest.Mock).mockReturnValue(null);

      const result = await flushQueue();

      expect(result).toBe(0);
    });

    it('processes entries and deletes successful ones', async () => {
      const chain = makeChain({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      mockGetAllAsync.mockResolvedValue([
        { id: 1, operation: 'submit_flag', payload_json: JSON.stringify({ user_id: 'u1', content_id: 'c1', content_type: 'topic', reason: 'spam' }), created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      const result = await flushQueue();

      expect(result).toBe(1);
      expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM sync_queue WHERE id = ?', [1]);
    });

    it('increments attempts and records error for failed ones', async () => {
      const chain = makeChain({ error: { message: 'Server error' } });
      mockSupabaseFrom.mockReturnValue(chain);

      mockGetAllAsync.mockResolvedValue([
        { id: 2, operation: 'submit_flag', payload_json: JSON.stringify({ user_id: 'u1', content_id: 'c1', content_type: 'topic', reason: 'spam' }), created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      const result = await flushQueue();

      expect(result).toBe(0);
      expect(mockRunAsync).toHaveBeenCalledWith(
        'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
        ['Server rejected', 2],
      );
    });

    it('handles submit_flag operation (insert into content_flags)', async () => {
      const chain = makeChain({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const payload = { user_id: 'u1', content_id: 'c1', content_type: 'topic', reason: 'spam', details: 'bad' };
      mockGetAllAsync.mockResolvedValue([
        { id: 3, operation: 'submit_flag', payload_json: JSON.stringify(payload), created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      await flushQueue();

      expect(mockSupabaseFrom).toHaveBeenCalledWith('content_flags');
      expect(chain.insert).toHaveBeenCalledWith({
        user_id: 'u1',
        content_id: 'c1',
        content_type: 'topic',
        reason: 'spam',
        details: 'bad',
      });
    });

    it('handles toggle_upvote with remove=true (delete)', async () => {
      const chain = makeChain({ error: null });
      chain.delete = jest.fn().mockReturnValue(chain);
      chain.match = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const payload = { user_id: 'u1', topic_id: 't1', remove: true };
      mockGetAllAsync.mockResolvedValue([
        { id: 4, operation: 'toggle_upvote', payload_json: JSON.stringify(payload), created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      await flushQueue();

      expect(mockSupabaseFrom).toHaveBeenCalledWith('upvotes');
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.match).toHaveBeenCalledWith({ user_id: 'u1', topic_id: 't1' });
    });

    it('handles toggle_upvote without remove (upsert)', async () => {
      const chain = makeChain({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const payload = { user_id: 'u1', topic_id: 't1' };
      mockGetAllAsync.mockResolvedValue([
        { id: 5, operation: 'toggle_upvote', payload_json: JSON.stringify(payload), created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      await flushQueue();

      expect(mockSupabaseFrom).toHaveBeenCalledWith('upvotes');
      expect(chain.upsert).toHaveBeenCalledWith(
        { user_id: 'u1', topic_id: 't1' },
        { onConflict: 'user_id,topic_id' },
      );
    });

    it('handles set_star_rating (upsert)', async () => {
      const chain = makeChain({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const payload = { user_id: 'u1', topic_id: 't1', rating: 4 };
      mockGetAllAsync.mockResolvedValue([
        { id: 6, operation: 'set_star_rating', payload_json: JSON.stringify(payload), created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      await flushQueue();

      expect(mockSupabaseFrom).toHaveBeenCalledWith('star_ratings');
      expect(chain.upsert).toHaveBeenCalledWith(
        { user_id: 'u1', topic_id: 't1', rating: 4 },
        { onConflict: 'user_id,topic_id' },
      );
    });

    it('returns false for unknown operation', async () => {
      mockGetAllAsync.mockResolvedValue([
        { id: 7, operation: 'unknown_op' as any, payload_json: '{}', created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      const result = await flushQueue();

      expect(result).toBe(0);
      expect(mockRunAsync).toHaveBeenCalledWith(
        'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
        ['Server rejected', 7],
      );
    });

    it('catches JSON parse error', async () => {
      mockGetAllAsync.mockResolvedValue([
        { id: 8, operation: 'submit_flag', payload_json: '{invalid json', created_at: '2026-01-01', attempts: 0, last_error: null },
      ]);

      const result = await flushQueue();

      expect(result).toBe(0);
      expect(mockRunAsync).toHaveBeenCalledWith(
        'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
        [expect.any(String), 8],
      );
    });

    it('handles empty queue', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      const result = await flushQueue();

      expect(result).toBe(0);
    });
  });
});
