/**
 * services/auth.ts — Service layer wrapping Supabase auth operations.
 *
 * Every function checks `isSupabaseAvailable()` first and returns an
 * error result if Supabase is not configured or native modules are
 * unavailable (e.g. in Expo Go).
 *
 * All Supabase imports are deferred to avoid top-level native module
 * imports that crash Expo Go.
 */

function getAuth() {
  const { getSupabase, isSupabaseAvailable } = require('../lib/supabase');
  return { getSupabase, isSupabaseAvailable } as {
    getSupabase: () => import('../lib/supabase').SupabaseClient | null;
    isSupabaseAvailable: () => boolean;
  };
}

const NOT_AVAILABLE_ERROR = 'Auth not available in this environment';

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return { error: NOT_AVAILABLE_ERROR };
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_AVAILABLE_ERROR };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return {};
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<{ error?: string }> {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return { error: NOT_AVAILABLE_ERROR };
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_AVAILABLE_ERROR };

  const options: Record<string, unknown> = {};
  if (displayName) {
    options.data = { full_name: displayName };
  }

  const { error } = await supabase.auth.signUp({ email, password, options });
  if (error) return { error: error.message };
  return {};
}

export async function signInWithMagicLink(
  email: string,
): Promise<{ error?: string }> {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return { error: NOT_AVAILABLE_ERROR };
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_AVAILABLE_ERROR };

  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) return { error: error.message };
  return {};
}

export async function signOut(): Promise<{ error?: string }> {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return { error: NOT_AVAILABLE_ERROR };
  const supabase = getSupabase();
  if (!supabase) return { error: NOT_AVAILABLE_ERROR };

  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return {};
}

export function getCurrentUser(): unknown | null {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  // getSession() is async but getUser() returns cached data synchronously
  // via supabase-js internals. We return the user from the current session.
  return supabase.auth.getUser?.()?.then?.((r: unknown) => {
    const result = r as { data?: { user?: unknown } };
    return result?.data?.user ?? null;
  }) ?? null;
}

export async function getCurrentSession(): Promise<unknown | null> {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

export function onAuthStateChange(
  callback: (event: string, session: unknown) => void,
): { unsubscribe: () => void } | null {
  const { getSupabase, isSupabaseAvailable } = getAuth();
  if (!isSupabaseAvailable()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = supabase.auth.onAuthStateChange(callback);
  return data?.subscription ?? null;
}
