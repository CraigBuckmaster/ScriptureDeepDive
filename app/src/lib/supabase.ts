/**
 * lib/supabase.ts — Supabase client singleton.
 *
 * Initializes the Supabase client with AsyncStorage for session persistence
 * and PKCE flow for OAuth. The anon key is safe to embed — it only grants
 * access to public tables and auth endpoints.
 *
 * Configure SUPABASE_URL and SUPABASE_ANON_KEY before first use.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
