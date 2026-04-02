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
});
