/**
 * lib/supabase.ts — Supabase client singleton (stub until configured).
 *
 * The Supabase packages (@supabase/supabase-js, AsyncStorage) require
 * native modules that are NOT available in Expo Go. They must be
 * installed and configured when building a development/production build.
 *
 * To activate auth:
 *   1. Create a Supabase project at supabase.com
 *   2. npm install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage
 *   3. Set SUPABASE_URL and SUPABASE_ANON_KEY below
 *   4. Build a dev client: npx expo run:ios (or eas build)
 *   5. Set CONFIGURED = true
 */

// ── Configuration ──────────────────────────────────────────────
const CONFIGURED = !!process.env.SUPABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
// ───────────────────────────────────────────────────────────────

// TODO(phase-14): Replace with actual SupabaseClient from @supabase/supabase-js
export type SupabaseClient = Record<string, unknown>;

let _client: SupabaseClient | null = null;

/**
 * Check if Supabase is configured and native modules are available.
 */
export function isSupabaseAvailable(): boolean {
  if (!CONFIGURED) return false;
  try {
    require('@supabase/supabase-js');
    require('@react-native-async-storage/async-storage');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the Supabase client. Returns null if not configured or
 * native modules are unavailable.
 */
export function getSupabase(): SupabaseClient | null {
  if (!CONFIGURED) return null;
  if (_client) return _client;
  if (!isSupabaseAvailable()) return null;

  try {
    require('react-native-url-polyfill/auto');
    const { createClient } = require('@supabase/supabase-js');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
    return _client;
  } catch {
    return null;
  }
}
