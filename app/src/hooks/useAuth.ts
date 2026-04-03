/**
 * hooks/useAuth.ts — Convenience hook wrapping authStore + auth service.
 *
 * Provides a unified API for components to access auth state and actions.
 */

import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import * as authService from '../services/auth';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeSignIn = useAuthStore((s) => s.signInWithEmail);
  const storeSignUp = useAuthStore((s) => s.signUpWithEmail);
  const storeSignOut = useAuthStore((s) => s.signOut);

  const signIn = useCallback(
    (email: string, password: string) => storeSignIn(email, password),
    [storeSignIn],
  );

  const signUp = useCallback(
    (email: string, password: string, displayName?: string) => {
      // If displayName is provided, use the service layer which supports it
      if (displayName) {
        return authService.signUpWithEmail(email, password, displayName);
      }
      return storeSignUp(email, password);
    },
    [storeSignUp],
  );

  const signOut = useCallback(() => storeSignOut(), [storeSignOut]);

  const signInWithMagicLink = useCallback(
    (email: string) => authService.signInWithMagicLink(email),
    [],
  );

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
  };
}
