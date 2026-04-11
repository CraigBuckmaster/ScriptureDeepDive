/**
 * Tests for lib/oauthHelpers — signInWithProvider.
 */

// Override the global jest.mock from jest.setup.js for this file
jest.unmock('@/lib/oauthHelpers');

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn().mockReturnValue('scripture://auth/callback'),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'success', url: 'scripture://auth/callback?code=test_code' }),
}));

const mockSignInWithOAuth = jest.fn().mockResolvedValue({
  data: { url: 'https://accounts.google.com/o/oauth2/auth?...' },
  error: null,
});

const mockExchangeCodeForSession = jest.fn().mockResolvedValue({ error: null });

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn().mockReturnValue({
    auth: {
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
      exchangeCodeForSession: (...args: any[]) => mockExchangeCodeForSession(...args),
    },
  }),
}));

import { signInWithProvider } from '@/lib/oauthHelpers';

describe('signInWithProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth?...' },
      error: null,
    });
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it('returns empty object on successful sign-in', async () => {
    const result = await signInWithProvider('google');
    expect(result).toEqual({});
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code');
  });

  it('returns error when supabase is not available', async () => {
    const { getSupabase } = require('@/lib/supabase');
    getSupabase.mockReturnValueOnce(null);

    const result = await signInWithProvider('google');
    expect(result).toEqual({ error: 'Auth not available in this environment' });
  });

  it('returns error when OAuth initiation fails', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { url: null },
      error: { message: 'OAuth error' },
    });

    const result = await signInWithProvider('google');
    expect(result).toEqual({ error: 'OAuth error' });
  });

  it('returns error when browser session is cancelled', async () => {
    const WebBrowser = require('expo-web-browser');
    WebBrowser.openAuthSessionAsync.mockResolvedValueOnce({ type: 'cancel' });

    const result = await signInWithProvider('facebook');
    expect(result).toEqual({ error: 'Sign-in was cancelled' });
  });

  it('returns error when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      error: { message: 'Exchange failed' },
    });

    const result = await signInWithProvider('google');
    expect(result).toEqual({ error: 'Exchange failed' });
  });

  it('returns error when no URL and no explicit error', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { url: null },
      error: null,
    });

    const result = await signInWithProvider('google');
    expect(result).toEqual({ error: 'Failed to start sign-in' });
  });
});
