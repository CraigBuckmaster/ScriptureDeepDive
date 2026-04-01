/**
 * stores/authStore.ts — Authentication state (Supabase).
 *
 * Auth is optional — the app works fully without signing in.
 * Premium features require sign-in (gate checked elsewhere).
 *
 * Follows the same Zustand pattern as settingsStore.ts.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { signInWithProvider } from '../lib/oauthHelpers';
import { upsertAuthProfile, clearAuthProfile } from '../db/user';
import { logger } from '../utils/logger';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, session });
        syncProfile(session.user);
      }

      // Listen for auth state changes (token refresh, sign-out, etc.)
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ user: newSession?.user ?? null, session: newSession });
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
      const { error } = await supabase.auth.signUp({ email, password });
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
      await supabase.auth.signOut();
      await clearAuthProfile();
      set({ user: null, session: null });
    } catch (err) {
      logger.error('authStore', 'Sign out failed', err);
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } finally {
      set({ isLoading: false });
    }
  },
}));

/** Sync Supabase user info to local SQLite profile. */
async function syncProfile(user: User) {
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
