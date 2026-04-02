/**
 * lib/oauthHelpers.ts — Shared OAuth flow for Google and Facebook.
 *
 * Uses expo-auth-session + expo-web-browser to open the OAuth provider
 * in the system browser, then handles the redirect back to the app.
 *
 * All native module imports are deferred to function call time so
 * this module can be safely imported in Expo Go.
 */

import { getSupabase } from './supabase';

/**
 * Perform OAuth sign-in with the given provider.
 * Opens the system browser, handles the redirect, and exchanges the code.
 */
export async function signInWithProvider(
  provider: 'google' | 'facebook',
): Promise<{ error?: string }> {
  // Dynamic imports — these require native modules not available in Expo Go
  const AuthSession = require('expo-auth-session');
  const WebBrowser = require('expo-web-browser');

  const supabase = getSupabase();
  const redirectTo = AuthSession.makeRedirectUri({ scheme: 'scripture' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { error: error?.message ?? 'Failed to start sign-in' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return { error: 'Sign-in was cancelled' };
  }

  const url = new URL(result.url);
  const code = url.searchParams.get('code');

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return { error: exchangeError.message };
  }

  return {};
}
