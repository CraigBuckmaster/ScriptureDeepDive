const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockSignOut = jest.fn();
const mockGetUser = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

const mockSupabase = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signInWithOtp: mockSignInWithOtp,
    signOut: mockSignOut,
    getUser: mockGetUser,
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
  },
};

const mockIsSupabaseAvailable = jest.fn();
const mockGetSupabase = jest.fn();

jest.mock('@/lib/supabase', () => ({
  getSupabase: (...args: any[]) => mockGetSupabase(...args),
  isSupabaseAvailable: (...args: any[]) => mockIsSupabaseAvailable(...args),
}));

import {
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
  signOut,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
} from '@/services/auth';

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSupabaseAvailable.mockReturnValue(true);
    mockGetSupabase.mockReturnValue(mockSupabase);
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ error: null });
    mockSignInWithOtp.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  describe('signInWithEmail', () => {
    it('returns error when supabase unavailable', async () => {
      mockIsSupabaseAvailable.mockReturnValue(false);

      const result = await signInWithEmail('a@b.com', 'pass');

      expect(result.error).toBe('Auth not available in this environment');
    });

    it('returns error when getSupabase returns null', async () => {
      mockGetSupabase.mockReturnValue(null);

      const result = await signInWithEmail('a@b.com', 'pass');

      expect(result.error).toBe('Auth not available in this environment');
    });

    it('success returns empty object', async () => {
      const result = await signInWithEmail('a@b.com', 'pass');

      expect(result).toEqual({});
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass',
      });
    });

    it('returns supabase error message', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      const result = await signInWithEmail('a@b.com', 'wrong');

      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUpWithEmail', () => {
    it('passes displayName in options.data', async () => {
      await signUpWithEmail('a@b.com', 'pass', 'John');

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass',
        options: { data: { full_name: 'John' } },
      });
    });

    it('works without displayName', async () => {
      await signUpWithEmail('a@b.com', 'pass');

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass',
        options: {},
      });
    });
  });

  describe('signInWithMagicLink', () => {
    it('calls signInWithOtp', async () => {
      const result = await signInWithMagicLink('a@b.com');

      expect(result).toEqual({});
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: 'a@b.com' });
    });
  });

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      const result = await signOut();

      expect(result).toEqual({});
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when unavailable', () => {
      mockIsSupabaseAvailable.mockReturnValue(false);

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentSession', () => {
    it('returns session user on success', async () => {
      const user = { id: 'user-1', email: 'a@b.com' };
      mockGetSession.mockResolvedValue({
        data: { session: { user } },
      });

      const result = await getCurrentSession();

      expect(result).toEqual(user);
    });

    it('returns null when unavailable', async () => {
      mockIsSupabaseAvailable.mockReturnValue(false);

      const result = await getCurrentSession();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('returns subscription on success', () => {
      const callback = jest.fn();
      const unsub = jest.fn();
      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsub } },
      });

      const result = onAuthStateChange(callback);

      expect(result).toEqual({ unsubscribe: unsub });
      expect(mockOnAuthStateChange).toHaveBeenCalledWith(callback);
    });

    it('returns null when unavailable', () => {
      mockIsSupabaseAvailable.mockReturnValue(false);

      const result = onAuthStateChange(jest.fn());

      expect(result).toBeNull();
    });
  });
});
