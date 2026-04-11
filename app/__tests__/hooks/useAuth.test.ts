/**
 * Hook tests for useAuth.
 */
import { renderHook, act } from '@testing-library/react-native';

const mockSignInWithEmail = jest.fn();
const mockSignUpWithEmail = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: any) => any) => {
    const state = {
      user: null,
      isLoading: false,
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: mockSignUpWithEmail,
      signOut: mockSignOut,
    };
    return selector(state);
  },
}));

jest.mock('@/services/auth', () => ({
  signUpWithEmail: jest.fn(),
  signInWithMagicLink: jest.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

beforeEach(() => jest.clearAllMocks());

describe('useAuth', () => {
  it('returns user as null when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns isLoading from store', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });

  it('provides signIn function that calls store', () => {
    const { result } = renderHook(() => useAuth());
    act(() => { result.current.signIn('a@b.com', 'pass'); });
    expect(mockSignInWithEmail).toHaveBeenCalledWith('a@b.com', 'pass');
  });

  it('provides signOut function', () => {
    const { result } = renderHook(() => useAuth());
    act(() => { result.current.signOut(); });
    expect(mockSignOut).toHaveBeenCalled();
  });
});
