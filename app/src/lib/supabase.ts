/**
 * lib/supabase.ts — Lazy-initialized Supabase client singleton.
 *
 * IMPORTANT: This module must NOT import @supabase/supabase-js or
 * AsyncStorage at the top level. These packages load native modules
 * (expo-crypto, AsyncStorage) that crash in Expo Go. All imports
 * are deferred to the first actual auth action via dynamic require().
 */

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

let _client: any = null;
let _available: boolean | null = null;

/**
 * Check if Supabase native modules are available in this environment.
 * Returns false in Expo Go where AsyncStorage native module is null.
 */
export function isSupabaseAvailable(): boolean {
  if (_available !== null) return _available;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // The JS module loads fine, but the native module may be null
    // Try a no-op operation to detect if the native bridge works
    if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
      _available = false;
      return false;
    }
    _available = true;
    return true;
  } catch {
    _available = false;
    return false;
  }
}

/**
 * Get the Supabase client, creating it on first call.
 * Returns null if native modules aren't available (Expo Go).
 */
export function getSupabase(): any | null {
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
    _available = false;
    return null;
  }
}
