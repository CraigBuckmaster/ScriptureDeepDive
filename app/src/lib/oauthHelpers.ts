/**
 * lib/oauthHelpers.ts — Shared OAuth flow for Google and Facebook.
 *
 * Uses expo-auth-session + expo-web-browser to open the OAuth provider
 * in the system browser, then handles the redirect back to the app.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Required for closing the browser after OAuth callback
WebBrowser.maybeCompleteAuthSession();

/**
 * Perform OAuth sign-in with the given provider.
 * Opens the system browser, handles the redirect, and exchanges the code.
 */
export async function signInWithProvider(
  provider: 'google' | 'facebook',
): Promise<{ error?: string }> {
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

  // Open the OAuth URL in the system browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return { error: 'Sign-in was cancelled' };
  }

  // Extract the auth code/tokens from the redirect URL
  const url = new URL(result.url);
  const code = url.searchParams.get('code');

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return { error: exchangeError.message };
  }

  return {};
}
