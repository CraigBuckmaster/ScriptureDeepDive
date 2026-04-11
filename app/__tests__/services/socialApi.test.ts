const mockSupabaseFrom = jest.fn();

const mockSupabase = {
  from: mockSupabaseFrom,
};

const mockGetSupabase = jest.fn();

jest.mock('@/lib/supabase', () => ({
  getSupabase: (...args: any[]) => mockGetSupabase(...args),
  isSupabaseAvailable: jest.fn(() => true),
}));

import {
  followTarget,
  unfollowTarget,
  getFollowing,
  getFollowers,
} from '@/services/socialApi';

function makeChain(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const chain: Record<string, jest.Mock> = {};
  chain.upsert = jest.fn().mockResolvedValue(result);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.match = jest.fn().mockResolvedValue(result);
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockResolvedValue(result);
  return chain;
}

describe('socialApi service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue(mockSupabase);
  });

  describe('followTarget', () => {
    it('returns false when offline (no supabase)', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await followTarget('t1', 'topic', 'u1');

      expect(result).toBe(false);
    });

    it('returns true on success (no error)', async () => {
      const chain = makeChain({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await followTarget('t1', 'topic', 'u1');

      expect(result).toBe(true);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('follows');
      expect(chain.upsert).toHaveBeenCalledWith(
        { user_id: 'u1', target_id: 't1', target_type: 'topic' },
        { onConflict: 'user_id,target_id,target_type' },
      );
    });

    it('returns false on error', async () => {
      const chain = makeChain({ error: { message: 'DB error' } });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await followTarget('t1', 'topic', 'u1');

      expect(result).toBe(false);
    });
  });

  describe('unfollowTarget', () => {
    it('returns false when offline', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await unfollowTarget('t1', 'topic', 'u1');

      expect(result).toBe(false);
    });

    it('returns true on success', async () => {
      const chain = makeChain({ error: null });
      chain.delete = jest.fn().mockReturnValue(chain);
      chain.match = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await unfollowTarget('t1', 'topic', 'u1');

      expect(result).toBe(true);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('follows');
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.match).toHaveBeenCalledWith({
        user_id: 'u1',
        target_id: 't1',
        target_type: 'topic',
      });
    });
  });

  describe('getFollowing', () => {
    it('returns empty array when offline', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await getFollowing('u1');

      expect(result).toEqual([]);
    });

    it('maps data to FollowRecord', async () => {
      const chain = makeChain({
        data: [
          { target_id: 't1', target_type: 'topic', created_at: '2026-01-01' },
          { target_id: 'u2', target_type: 'user', created_at: '2026-01-02' },
        ],
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getFollowing('u1');

      expect(result).toEqual([
        { target_id: 't1', target_type: 'topic', followed_at: '2026-01-01' },
        { target_id: 'u2', target_type: 'user', followed_at: '2026-01-02' },
      ]);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('follows');
      expect(chain.select).toHaveBeenCalledWith('target_id, target_type, created_at');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
    });

    it('returns empty on error', async () => {
      const chain = makeChain({ data: null, error: { message: 'fail' } });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getFollowing('u1');

      expect(result).toEqual([]);
    });
  });

  describe('getFollowers', () => {
    it('returns 0 when offline', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await getFollowers('t1');

      expect(result).toBe(0);
    });

    it('returns count on success', async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockResolvedValue({ count: 42, error: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getFollowers('t1');

      expect(result).toBe(42);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('follows');
      expect(chain.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(chain.eq).toHaveBeenCalledWith('target_id', 't1');
    });

    it('returns 0 on error', async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockResolvedValue({ count: null, error: { message: 'fail' } });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getFollowers('t1');

      expect(result).toBe(0);
    });
  });
});
