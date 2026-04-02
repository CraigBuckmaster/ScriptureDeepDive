/**
 * lib/supabase.ts — Lazy-initialized Supabase client singleton.
 *
 * The client is NOT created at import time because expo-crypto and
 * AsyncStorage require native modules that are unavailable in Expo Go.
 * Instead, getSupabase() creates the client on first call — which only
 * happens when the user actually interacts with auth features.
 *
 * Configure SUPABASE_URL and SUPABASE_ANON_KEY before first use.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

let _client: SupabaseClient | null = null;

/**
 * Get the Supabase client, creating it on first call.
 * Deferred so that native modules (AsyncStorage, expo-crypto)
 * are only loaded when auth is actually used.
 */
export function getSupabase(): SupabaseClient {
  if (!_client) {
    // Dynamic require to avoid loading native modules at import time
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
  }
  return _client;
}

/**
 * Check if the Supabase client can be created in this environment.
 * Returns false in Expo Go where native modules aren't available.
 *
 * We test the actual native module, not just the JS wrapper — the JS
 * import succeeds in Expo Go but the underlying native module is null,
 * which causes AsyncStorage operations to throw at runtime.
 */
export function isSupabaseAvailable(): boolean {
  try {
    const { NativeModules } = require('react-native');
    // AsyncStorage's native module name varies by version
    return !!(
      NativeModules.RNCAsyncStorage ||
      NativeModules.AsyncStorageModule ||
      NativeModules.AsyncSQLiteDBStorage
    );
  } catch {
    return false;
  }
}
