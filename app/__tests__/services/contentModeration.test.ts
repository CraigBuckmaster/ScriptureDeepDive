const mockInvoke = jest.fn();

const mockSupabase = {
  functions: { invoke: mockInvoke },
};

const mockGetSupabase = jest.fn();

jest.mock('@/lib/supabase', () => ({
  getSupabase: (...args: any[]) => mockGetSupabase(...args),
  isSupabaseAvailable: jest.fn(() => true),
}));

import { screenSubmission } from '@/services/contentModeration';

describe('contentModeration service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue(mockSupabase);
  });

  describe('screenSubmission', () => {
    const submission = {
      title: 'Test Title',
      body: 'Test body content',
      verses: ['John 3:16'],
    };

    it('returns review decision when supabase null (offline)', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await screenSubmission(submission);

      expect(result).toEqual({
        decision: 'review',
        confidence: 0,
        reason: 'Offline',
      });
    });

    it('returns data from successful invocation', async () => {
      const screeningResult = {
        decision: 'approve',
        confidence: 0.95,
        reason: 'Content looks good',
      };
      mockInvoke.mockResolvedValue({ data: screeningResult });

      const result = await screenSubmission(submission);

      expect(result).toEqual(screeningResult);
      expect(mockInvoke).toHaveBeenCalledWith('screen-submission', {
        body: submission,
      });
    });

    it('returns review with "Screening unavailable" on error', async () => {
      mockInvoke.mockRejectedValue(new Error('Function not found'));

      const result = await screenSubmission(submission);

      expect(result).toEqual({
        decision: 'review',
        confidence: 0,
        reason: 'Screening unavailable',
      });
    });
  });
});
