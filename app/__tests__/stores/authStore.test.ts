const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignOut = jest.fn();

const mockGetSupabase = jest.fn();
const mockIsSupabaseAvailable = jest.fn();

jest.mock('@/lib/supabase', () => ({
  getSupabase: (...args: any[]) => mockGetSupabase(...args),
  isSupabaseAvailable: (...args: any[]) => mockIsSupabaseAvailable(...args),
}));

jest.mock('@/lib/oauthHelpers', () => ({
  signInWithProvider: jest.fn().mockResolvedValue({}),
}));

const mockUpsertAuthProfile = jest.fn();
const mockClearAuthProfile = jest.fn();

jest.mock('@/db/user', () => ({
  upsertAuthProfile: (...args: any[]) => mockUpsertAuthProfile(...args),
  clearAuthProfile: (...args: any[]) => mockClearAuthProfile(...args),
}));

import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset zustand store
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isHydrated: false,
    });

    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    mockSignOut.mockResolvedValue({ error: null });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
      },
    });
    mockIsSupabaseAvailable.mockReturnValue(true);
    mockUpsertAuthProfile.mockResolvedValue(undefined);
    mockClearAuthProfile.mockResolvedValue(undefined);
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isHydrated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('hydrate skips when supabase is not available', async () => {
    mockIsSupabaseAvailable.mockReturnValue(false);

    await useAuthStore.getState().hydrate();

    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it('hydrate sets isHydrated to true after completion', async () => {
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('hydrate sets user from existing session', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', user_metadata: {}, app_metadata: {} };
    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('signOut clears user and auth profile', async () => {
    useAuthStore.setState({ user: { id: 'user-123' } });

    await useAuthStore.getState().signOut();

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockClearAuthProfile).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('signOut sets isLoading false even on error', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'));

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('hydrate subscribes to auth state changes and updates user on SIGNED_IN', async () => {
    const mockUser = { id: 'user-456', email: 'new@example.com', user_metadata: {}, app_metadata: {} };
    let authCallback: Function | null = null;
    mockOnAuthStateChange.mockImplementation((cb: Function) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    await useAuthStore.getState().hydrate();

    expect(authCallback).not.toBeNull();

    // Simulate SIGNED_IN event
    authCallback!('SIGNED_IN', { user: mockUser });

    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('hydrate sets isHydrated true even when hydrate throws', async () => {
    mockGetSupabase.mockImplementation(() => {
      throw new Error('Supabase init failed');
    });

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('signInWithEmail delegates to supabase and returns empty on success', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithPassword: mockSignIn,
        signOut: mockSignOut,
      },
    });

    const result = await useAuthStore.getState().signInWithEmail('test@test.com', 'password123');

    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    expect(result).toEqual({});
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signInWithEmail returns error message on failure', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithPassword: mockSignIn,
        signOut: mockSignOut,
      },
    });

    const result = await useAuthStore.getState().signInWithEmail('bad@test.com', 'wrong');

    expect(result).toEqual({ error: 'Invalid credentials' });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signInWithEmail returns error when supabase is not available', async () => {
    mockGetSupabase.mockReturnValue(null);

    const result = await useAuthStore.getState().signInWithEmail('test@test.com', 'pass');

    expect(result).toEqual({ error: 'Auth not available in this environment' });
  });

  it('auth state change with null session clears user', async () => {
    let authCallback: Function | null = null;
    mockOnAuthStateChange.mockImplementation((cb: Function) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    useAuthStore.setState({ user: { id: 'existing-user' } });
    await useAuthStore.getState().hydrate();

    // Simulate sign out event
    authCallback!('SIGNED_OUT', null);

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('signUpWithEmail delegates to supabase and returns empty on success', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: null });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signUp: mockSignUp,
        signOut: mockSignOut,
      },
    });

    const result = await useAuthStore.getState().signUpWithEmail('test@test.com', 'password123');
    expect(mockSignUp).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    expect(result).toEqual({});
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signUpWithEmail returns error message on failure', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: { message: 'Email taken' } });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signUp: mockSignUp,
        signOut: mockSignOut,
      },
    });

    const result = await useAuthStore.getState().signUpWithEmail('taken@test.com', 'pass');
    expect(result).toEqual({ error: 'Email taken' });
  });

  it('signUpWithEmail returns error when supabase not available', async () => {
    mockGetSupabase.mockReturnValue(null);
    const result = await useAuthStore.getState().signUpWithEmail('test@test.com', 'pass');
    expect(result).toEqual({ error: 'Auth not available in this environment' });
  });

  it('signInWithGoogle returns error when supabase not available', async () => {
    mockIsSupabaseAvailable.mockReturnValue(false);
    const result = await useAuthStore.getState().signInWithGoogle();
    expect(result).toEqual({ error: expect.stringContaining('development build') });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signInWithGoogle delegates to oauthHelpers when available', async () => {
    mockIsSupabaseAvailable.mockReturnValue(true);
    const { signInWithProvider } = require('@/lib/oauthHelpers');
    signInWithProvider.mockResolvedValue({});

    const result = await useAuthStore.getState().signInWithGoogle();
    expect(signInWithProvider).toHaveBeenCalledWith('google');
    expect(result).toEqual({});
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signInWithFacebook returns error when supabase not available', async () => {
    mockIsSupabaseAvailable.mockReturnValue(false);
    const result = await useAuthStore.getState().signInWithFacebook();
    expect(result).toEqual({ error: expect.stringContaining('development build') });
  });

  it('signInWithFacebook delegates to oauthHelpers', async () => {
    mockIsSupabaseAvailable.mockReturnValue(true);
    const { signInWithProvider } = require('@/lib/oauthHelpers');
    signInWithProvider.mockResolvedValue({});

    const result = await useAuthStore.getState().signInWithFacebook();
    expect(signInWithProvider).toHaveBeenCalledWith('facebook');
    expect(result).toEqual({});
  });

  it('resetPassword delegates to supabase and returns empty on success', async () => {
    const mockResetPw = jest.fn().mockResolvedValue({ error: null });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
        resetPasswordForEmail: mockResetPw,
      },
    });

    const result = await useAuthStore.getState().resetPassword('test@test.com');
    expect(mockResetPw).toHaveBeenCalledWith('test@test.com');
    expect(result).toEqual({});
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('resetPassword returns error message on failure', async () => {
    const mockResetPw = jest.fn().mockResolvedValue({ error: { message: 'Rate limited' } });
    mockGetSupabase.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
        resetPasswordForEmail: mockResetPw,
      },
    });

    const result = await useAuthStore.getState().resetPassword('test@test.com');
    expect(result).toEqual({ error: 'Rate limited' });
  });

  it('resetPassword returns error when supabase not available', async () => {
    mockGetSupabase.mockReturnValue(null);
    const result = await useAuthStore.getState().resetPassword('test@test.com');
    expect(result).toEqual({ error: 'Auth not available in this environment' });
  });

  it('hydrate returns early when getSupabase returns null', async () => {
    mockIsSupabaseAvailable.mockReturnValue(true);
    mockGetSupabase.mockReturnValue(null);

    await useAuthStore.getState().hydrate();
    expect(mockGetSession).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('hydrate syncs profile on existing session', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User', avatar_url: 'http://avatar.url' },
      app_metadata: { provider: 'google' },
    };
    mockGetSession.mockResolvedValue({ data: { session: { user: mockUser } } });

    await useAuthStore.getState().hydrate();
    expect(mockUpsertAuthProfile).toHaveBeenCalledWith(
      'user-123',
      'test@example.com',
      'Test User',
      'http://avatar.url',
      'google',
    );
  });

  it('signOut handles missing supabase gracefully', async () => {
    mockGetSupabase.mockReturnValue(null);
    await useAuthStore.getState().signOut();
    expect(mockClearAuthProfile).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('auth state change callback syncs profile when user signs in', async () => {
    const mockUser = {
      id: 'user-789',
      email: 'newuser@example.com',
      user_metadata: { name: 'New User' },
      app_metadata: { provider: 'email' },
    };
    let authCallback: Function | null = null;
    mockOnAuthStateChange.mockImplementation((cb: Function) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    await useAuthStore.getState().hydrate();
    expect(authCallback).not.toBeNull();

    // Simulate sign-in event
    authCallback!('SIGNED_IN', { user: mockUser });

    // syncProfile should have been called
    await new Promise((r) => setTimeout(r, 10));
    expect(mockUpsertAuthProfile).toHaveBeenCalledWith(
      'user-789',
      'newuser@example.com',
      'New User',
      '',
      'email',
    );
  });

  it('hydrate syncs profile with fallback fields when metadata is sparse', async () => {
    const mockUser = {
      id: 'user-sparse',
      email: undefined,
      user_metadata: {},
      app_metadata: {},
    };
    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    await useAuthStore.getState().hydrate();

    // Should use fallback empty strings
    expect(mockUpsertAuthProfile).toHaveBeenCalledWith(
      'user-sparse',
      '',
      '',
      '',
      'email',
    );
  });

  it('hydrate handles upsertAuthProfile failure gracefully', async () => {
    const mockUser = {
      id: 'user-err',
      email: 'err@test.com',
      user_metadata: {},
      app_metadata: {},
    };
    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });
    mockUpsertAuthProfile.mockRejectedValueOnce(new Error('DB error'));

    await useAuthStore.getState().hydrate();
    // Should not crash - user is still set
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('hydrate unsubscribes previous auth subscription', async () => {
    const unsub1 = jest.fn();
    const unsub2 = jest.fn();
    mockOnAuthStateChange
      .mockReturnValueOnce({ data: { subscription: { unsubscribe: unsub1 } } })
      .mockReturnValueOnce({ data: { subscription: { unsubscribe: unsub2 } } });

    await useAuthStore.getState().hydrate();
    // Reset hydrated state to allow second hydrate
    useAuthStore.setState({ isHydrated: false });
    await useAuthStore.getState().hydrate();

    // First subscription should have been unsubscribed before second hydrate
    expect(unsub1).toHaveBeenCalled();
  });
});
