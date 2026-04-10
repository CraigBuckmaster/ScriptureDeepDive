/**
 * stores/authStore.ts — Authentication state (Supabase).
 *
 * Auth is optional — the app works fully without signing in.
 * Premium features require sign-in (gate checked elsewhere).
 *
 * IMPORTANT: This file must NOT import @supabase/supabase-js,
 * AsyncStorage, expo-crypto, expo-auth-session, or expo-web-browser
 * at the top level. These native modules crash Expo Go. All access
 * is deferred to function bodies via ../lib/supabase (which also
 * uses dynamic require).
 */

import { create } from 'zustand';
import { upsertAuthProfile, clearAuthProfile } from '../db/user';
import { logger } from '../utils/logger';
import { Sentry, DSN } from '../lib/sentry';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithFacebook: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

/** Lazy-load supabase helpers (avoids top-level native module imports). */
function getAuth() {
  const { getSupabase, isSupabaseAvailable } = require('../lib/supabase');
  return { getSupabase, isSupabaseAvailable };
}

/** Module-scoped subscription reference to prevent leaks on hot reload. */
let authSub: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const { getSupabase, isSupabaseAvailable } = getAuth();
      if (!isSupabaseAvailable()) {
        logger.info('authStore', 'Supabase not available (Expo Go) — skipping auth hydration');
        return;
      }

      const supabase = getSupabase();
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        syncProfile(session.user);
      }

      authSub?.unsubscribe();
      const { data } = supabase.auth.onAuthStateChange((_event: string, newSession: any) => {
        set({ user: newSession?.user ?? null });
        if (newSession?.user) syncProfile(newSession.user);
      });
      authSub = data.subscription;
    } catch (err) {
      logger.warn('authStore', 'Failed to hydrate auth session', err);
    } finally {
      set({ isHydrated: true });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const supabase = getAuth().getSupabase();
      if (!supabase) return { error: 'Auth not available in this environment' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const supabase = getAuth().getSupabase();
      if (!supabase) return { error: 'Auth not available in this environment' };
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    const { isSupabaseAvailable } = getAuth();
    if (!isSupabaseAvailable()) return { error: 'Sign-in requires a development build. It is not available in Expo Go.' };
    set({ isLoading: true });
    try {
      const { signInWithProvider } = require('../lib/oauthHelpers');
      return await signInWithProvider('google');
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithFacebook: async () => {
    const { isSupabaseAvailable } = getAuth();
    if (!isSupabaseAvailable()) return { error: 'Sign-in requires a development build. It is not available in Expo Go.' };
    set({ isLoading: true });
    try {
      const { signInWithProvider } = require('../lib/oauthHelpers');
      return await signInWithProvider('facebook');
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const supabase = getAuth().getSupabase();
      if (supabase) await supabase.auth.signOut();
      await clearAuthProfile();
      if (DSN) Sentry.setUser(null);
      set({ user: null });
    } catch (err) {
      logger.error('authStore', 'Sign out failed', err);
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      const supabase = getAuth().getSupabase();
      if (!supabase) return { error: 'Auth not available in this environment' };
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },
}));

/** Sync Supabase user info to local SQLite profile + Sentry context. */
async function syncProfile(user: AuthUser) {
  if (DSN) Sentry.setUser({ id: user.id });
  try {
    await upsertAuthProfile(
      user.id,
      user.email ?? '',
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
      user.user_metadata?.avatar_url ?? '',
      user.app_metadata?.provider ?? 'email',
    );
  } catch (err) {
    logger.warn('authStore', 'Failed to sync profile to local DB', err);
  }
}
