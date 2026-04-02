/**
 * stores/authStore.ts — Authentication state (Supabase).
 *
 * Auth is optional — the app works fully without signing in.
 * Premium features require sign-in (gate checked elsewhere).
 *
 * All Supabase/native module access is deferred to function call time
 * so the store can be imported safely in Expo Go (where native modules
 * like AsyncStorage and expo-crypto are unavailable).
 */

import { create } from 'zustand';
import { getSupabase, isSupabaseAvailable } from '../lib/supabase';
import { signInWithProvider } from '../lib/oauthHelpers';
import { upsertAuthProfile, clearAuthProfile } from '../db/user';
import { logger } from '../utils/logger';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      if (!isSupabaseAvailable()) {
        logger.info('authStore', 'Supabase not available (Expo Go) — skipping auth hydration');
        return;
      }

      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        syncProfile(session.user);
      }

      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ user: newSession?.user ?? null });
        if (newSession?.user) syncProfile(newSession.user);
      });
    } catch (err) {
      logger.warn('authStore', 'Failed to hydrate auth session', err);
    } finally {
      set({ isHydrated: true });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await getSupabase().auth.signUp({ email, password });
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      return await signInWithProvider('google');
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithFacebook: async () => {
    set({ isLoading: true });
    try {
      return await signInWithProvider('facebook');
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await getSupabase().auth.signOut();
      await clearAuthProfile();
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
      const { error } = await getSupabase().auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },
}));

/** Sync Supabase user info to local SQLite profile. */
async function syncProfile(user: AuthUser) {
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
