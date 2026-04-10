const mockSupabaseFrom = jest.fn();

const mockSupabase = {
  from: mockSupabaseFrom,
};

const mockGetSupabase = jest.fn();

jest.mock('@/lib/supabase', () => ({
  getSupabase: (...args: any[]) => mockGetSupabase(...args),
  isSupabaseAvailable: jest.fn(() => true),
}));

import { calculateTrustLevel, getUserTrustScore, TRUST_LABELS } from '@/services/trustLevel';

function makeSelectChain(result: { data: unknown; error?: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(result);
  return chain;
}

describe('trustLevel service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue(mockSupabase);
  });

  describe('calculateTrustLevel', () => {
    it('returns 2 for score>=200, age>=60, flags=0', () => {
      expect(calculateTrustLevel(200, 60, 0)).toBe(2);
      expect(calculateTrustLevel(300, 90, 0)).toBe(2);
    });

    it('returns 1 for score>=100, age>=30, flags=0', () => {
      expect(calculateTrustLevel(100, 30, 0)).toBe(1);
      expect(calculateTrustLevel(150, 45, 0)).toBe(1);
    });

    it('returns 0 by default', () => {
      expect(calculateTrustLevel(50, 10, 0)).toBe(0);
    });

    it('returns 0 when flags > 0 despite high score', () => {
      expect(calculateTrustLevel(300, 90, 1)).toBe(0);
      expect(calculateTrustLevel(200, 60, 2)).toBe(0);
    });

    it('returns 0 when age too low despite high score', () => {
      expect(calculateTrustLevel(300, 29, 0)).toBe(0);
      expect(calculateTrustLevel(200, 10, 0)).toBe(0);
    });
  });

  describe('getUserTrustScore', () => {
    it('returns level 0 when supabase null', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await getUserTrustScore('user-1');

      expect(result).toEqual({ level: 0, score: 0, label: TRUST_LABELS[0] });
    });

    it('returns level 0 when no data', async () => {
      const chain = makeSelectChain({ data: null });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getUserTrustScore('user-1');

      expect(result).toEqual({ level: 0, score: 0, label: TRUST_LABELS[0] });
    });

    it('calculates level from data', async () => {
      const chain = makeSelectChain({
        data: { score: 250, account_age_days: 90, recent_flags: 0 },
      });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getUserTrustScore('user-1');

      expect(result).toEqual({ level: 2, score: 250, label: 'Verified' });
      expect(mockSupabaseFrom).toHaveBeenCalledWith('user_trust_scores');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('returns level 0 on error', async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.single = jest.fn().mockRejectedValue(new Error('Network error'));
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getUserTrustScore('user-1');

      expect(result).toEqual({ level: 0, score: 0, label: TRUST_LABELS[0] });
    });
  });
});
