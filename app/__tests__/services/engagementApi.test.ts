/**
 * __tests__/services/engagementApi.test.ts
 *
 * Tests for the engagement API service: upvotes, star ratings,
 * engagement counts, and flag submission with offline queuing
 * and rate limiting.
 */

// ── Mock dependencies ─────────────────────────────────────────────

const mockGetSupabase = jest.fn();
jest.mock('@/lib/supabase', () => ({
  getSupabase: (...args: any[]) => mockGetSupabase(...args),
}));

const mockGetCurrentSession = jest.fn();
jest.mock('@/services/auth', () => ({
  getCurrentSession: (...args: any[]) => mockGetCurrentSession(...args),
}));

const mockEnqueue = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/syncQueue', () => ({
  enqueue: (...args: any[]) => mockEnqueue(...args),
}));

const mockFlagContentLocally = jest.fn().mockResolvedValue(undefined);
jest.mock('@/db/userMutations', () => ({
  flagContent: (...args: any[]) => mockFlagContentLocally(...args),
}));

const mockUserDbRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({ runAsync: mockUserDbRunAsync }),
}));

import {
  toggleUpvote,
  setStarRating,
  getEngagementCounts,
  submitFlag,
} from '@/services/engagementApi';

// ── Supabase mock builder ─────────────────────────────────────────

function createChainableSupabase(overrides: {
  selectResult?: { data: any; error: any };
  deleteResult?: { error: any };
  insertResult?: { error: any };
  upsertResult?: { error: any };
  rpcResult?: { data: any; error?: any };
  countResult?: { count: number | null; error: any };
  ratingsResult?: { data: any[]; error: any };
} = {}) {
  const {
    selectResult = { data: null, error: null },
    deleteResult = { error: null },
    insertResult = { error: null },
    upsertResult = { error: null },
    rpcResult = { data: 0, error: null },
    countResult = { count: 0, error: null },
    ratingsResult = { data: [], error: null },
  } = overrides;

  const supabase: any = {
    from: jest.fn().mockImplementation((table: string) => {
      return {
        select: jest.fn().mockImplementation((cols?: string, opts?: any) => {
          // Head count query (upvotes count)
          if (opts?.head) {
            return {
              eq: jest.fn().mockResolvedValue(countResult),
            };
          }
          // Ratings select
          if (table === 'star_ratings') {
            return {
              eq: jest.fn().mockResolvedValue(ratingsResult),
            };
          }
          // Regular select (for upvote existence check)
          return {
            match: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue(selectResult),
            }),
          };
        }),
        delete: jest.fn().mockReturnValue({
          match: jest.fn().mockResolvedValue(deleteResult),
        }),
        insert: jest.fn().mockResolvedValue(insertResult),
        upsert: jest.fn().mockResolvedValue(upsertResult),
      };
    }),
    rpc: jest.fn().mockResolvedValue(rpcResult),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  };

  return supabase;
}

// ── Tests ─────────────────────────────────────────────────────────

describe('engagementApi service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── toggleUpvote ────────────────────────────────────────────────

  describe('toggleUpvote', () => {
    it('queues when offline (no supabase)', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await toggleUpvote('topic-1', 'user-1');

      expect(result).toBe(true);
      expect(mockEnqueue).toHaveBeenCalledWith('toggle_upvote', {
        topic_id: 'topic-1',
        user_id: 'user-1',
      });
    });

    it('deletes existing upvote', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        match: jest.fn().mockResolvedValue({ error: null }),
      });
      const supabase = createChainableSupabase({
        selectResult: { data: { id: 'upvote-1' }, error: null },
      });
      // Override the from mock to track delete calls
      const originalFrom = supabase.from;
      supabase.from = jest.fn().mockImplementation((table: string) => {
        const chain = originalFrom(table);
        chain.delete = mockDelete;
        return chain;
      });
      mockGetSupabase.mockReturnValue(supabase);

      const result = await toggleUpvote('topic-1', 'user-1');

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('inserts new upvote when none exists', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      const supabase = createChainableSupabase({
        selectResult: { data: null, error: null },
      });
      const originalFrom = supabase.from;
      supabase.from = jest.fn().mockImplementation((table: string) => {
        const chain = originalFrom(table);
        chain.insert = mockInsert;
        return chain;
      });
      mockGetSupabase.mockReturnValue(supabase);

      const result = await toggleUpvote('topic-1', 'user-1');

      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-1',
        topic_id: 'topic-1',
      });
    });

    it('queues on error', async () => {
      const supabase = createChainableSupabase();
      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          match: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockRejectedValue(new Error('network error')),
          }),
        }),
      }));
      mockGetSupabase.mockReturnValue(supabase);

      const result = await toggleUpvote('topic-1', 'user-1');

      expect(result).toBe(true);
      expect(mockEnqueue).toHaveBeenCalledWith('toggle_upvote', {
        topic_id: 'topic-1',
        user_id: 'user-1',
      });
    });
  });

  // ── setStarRating ───────────────────────────────────────────────

  describe('setStarRating', () => {
    it('queues when offline', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await setStarRating('topic-1', 'user-1', 4);

      expect(result).toBe(true);
      expect(mockEnqueue).toHaveBeenCalledWith('set_star_rating', {
        topic_id: 'topic-1',
        user_id: 'user-1',
        rating: 4,
      });
    });

    it('upserts rating on success', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      const supabase = createChainableSupabase();
      supabase.from = jest.fn().mockReturnValue({ upsert: mockUpsert });
      mockGetSupabase.mockReturnValue(supabase);

      const result = await setStarRating('topic-1', 'user-1', 5);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('star_ratings');
      expect(mockUpsert).toHaveBeenCalledWith(
        { user_id: 'user-1', topic_id: 'topic-1', rating: 5 },
        { onConflict: 'user_id,topic_id' },
      );
    });

    it('queues on error', async () => {
      const supabase = createChainableSupabase();
      supabase.from = jest.fn().mockReturnValue({
        upsert: jest.fn().mockRejectedValue(new Error('fail')),
      });
      mockGetSupabase.mockReturnValue(supabase);

      const result = await setStarRating('topic-1', 'user-1', 3);

      expect(result).toBe(true);
      expect(mockEnqueue).toHaveBeenCalledWith('set_star_rating', {
        topic_id: 'topic-1',
        user_id: 'user-1',
        rating: 3,
      });
    });
  });

  // ── getEngagementCounts ─────────────────────────────────────────

  describe('getEngagementCounts', () => {
    it('returns defaults when offline', async () => {
      mockGetSupabase.mockReturnValue(null);

      const counts = await getEngagementCounts('topic-1');

      expect(counts).toEqual({ upvotes: 0, stars_avg: 0, bookmarks: 0 });
    });

    it('aggregates upvotes and ratings', async () => {
      const supabase: any = {
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'upvotes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ count: 7, error: null }),
              }),
            };
          }
          if (table === 'star_ratings') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [{ rating: 4 }, { rating: 5 }, { rating: 3 }],
                  error: null,
                }),
              }),
            };
          }
          return {};
        }),
      };
      mockGetSupabase.mockReturnValue(supabase);

      const counts = await getEngagementCounts('topic-1');

      expect(counts.upvotes).toBe(7);
      expect(counts.stars_avg).toBe(4); // (4+5+3)/3
      expect(counts.bookmarks).toBe(0);
    });

    it('returns defaults on error', async () => {
      const supabase: any = {
        from: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockRejectedValue(new Error('network')),
          }),
        })),
      };
      mockGetSupabase.mockReturnValue(supabase);

      const counts = await getEngagementCounts('topic-1');

      expect(counts).toEqual({ upvotes: 0, stars_avg: 0, bookmarks: 0 });
    });
  });

  // ── submitFlag ──────────────────────────────────────────────────

  describe('submitFlag', () => {
    it('saves locally first', async () => {
      mockGetSupabase.mockReturnValue(null);
      mockGetCurrentSession.mockResolvedValue(null);

      await submitFlag('content-1', 'topic', 'spam', 'details');

      expect(mockFlagContentLocally).toHaveBeenCalledWith(
        'content-1',
        'topic',
        'spam',
        'details',
      );
    });

    it('queues when offline', async () => {
      mockGetSupabase.mockReturnValue(null);
      mockGetCurrentSession.mockResolvedValue(null);

      const result = await submitFlag('content-1', 'topic', 'spam');

      expect(result).toEqual({ success: true });
      expect(mockEnqueue).toHaveBeenCalledWith('submit_flag', expect.objectContaining({
        content_id: 'content-1',
        content_type: 'topic',
        reason: 'spam',
      }));
    });

    it('queues when not authenticated', async () => {
      mockGetSupabase.mockReturnValue(createChainableSupabase());
      mockGetCurrentSession.mockResolvedValue(null);

      const result = await submitFlag('content-1', 'topic', 'spam');

      expect(result).toEqual({ success: true });
      expect(mockEnqueue).toHaveBeenCalled();
    });

    it('returns rateLimited when count >= 5', async () => {
      const supabase = createChainableSupabase({
        rpcResult: { data: 5 },
      });
      mockGetSupabase.mockReturnValue(supabase);
      mockGetCurrentSession.mockResolvedValue({ id: 'user-1' });

      const result = await submitFlag('content-1', 'topic', 'spam');

      expect(result).toEqual({ success: false, rateLimited: true });
    });

    it('succeeds and marks synced', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      const supabase = createChainableSupabase({
        rpcResult: { data: 2 },
      });
      supabase.from = jest.fn().mockReturnValue({ insert: mockInsert });
      mockGetSupabase.mockReturnValue(supabase);
      mockGetCurrentSession.mockResolvedValue({ id: 'user-1' });

      const result = await submitFlag('content-1', 'topic', 'spam', 'some details');

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'user-1',
        content_id: 'content-1',
        content_type: 'topic',
        reason: 'spam',
        details: 'some details',
      }));
      // Should mark as synced in local DB
      expect(mockUserDbRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE flagged_content SET synced = 1'),
        ['content-1', 'topic'],
      );
    });

    it('queues on server error (non-rate-limit)', async () => {
      const supabase = createChainableSupabase({
        rpcResult: { data: 0 },
      });
      supabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'server error', code: '50000' },
        }),
      });
      mockGetSupabase.mockReturnValue(supabase);
      mockGetCurrentSession.mockResolvedValue({ id: 'user-1' });

      const result = await submitFlag('content-1', 'topic', 'spam');

      expect(result).toEqual({ success: true });
      expect(mockEnqueue).toHaveBeenCalledWith('submit_flag', expect.objectContaining({
        content_id: 'content-1',
      }));
    });

    it('returns rateLimited on 42501 error code', async () => {
      const supabase = createChainableSupabase({
        rpcResult: { data: 0 },
      });
      supabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'permission denied', code: '42501' },
        }),
      });
      mockGetSupabase.mockReturnValue(supabase);
      mockGetCurrentSession.mockResolvedValue({ id: 'user-1' });

      const result = await submitFlag('content-1', 'topic', 'spam');

      expect(result).toEqual({ success: false, rateLimited: true });
    });
  });
});
