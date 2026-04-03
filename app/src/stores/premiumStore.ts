/**
 * stores/premiumStore.ts — Subscription state management.
 *
 * Tracks whether the user has an active Companion+ subscription.
 * Hydrated from SQLite on app start, updated when purchases complete
 * or are restored via RevenueCat.
 *
 * During development (before RevenueCat is configured), the store
 * can be toggled manually via __devSetPremium for testing gates.
 */

import { create } from 'zustand';
import { getPreference, setPreference } from '../db/user';
import { logger } from '../utils/logger';

export type PurchaseType = 'monthly' | 'annual' | 'lifetime' | null;

interface PremiumState {
  /** Whether the user currently has an active subscription or lifetime purchase. */
  isPremium: boolean;
  /** Which plan the user purchased. Null if not premium. */
  purchaseType: PurchaseType;
  /** ISO date when the subscription expires. Null for lifetime or non-premium. */
  expiresAt: string | null;
  /** Whether the store has finished loading from persistence. */
  isHydrated: boolean;

  /** Load premium status from SQLite on app start. */
  hydrate: () => Promise<void>;
  /** Called by purchases service when a purchase completes or is restored. */
  setPremiumStatus: (isPremium: boolean, purchaseType: PurchaseType, expiresAt: string | null) => void;
  /** Clear premium status (e.g. on subscription expiry or cancellation). */
  clearPremium: () => void;
  /** Dev-only: toggle premium for testing gate wiring. */
  __devSetPremium: (enabled: boolean) => void;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  purchaseType: null,
  expiresAt: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const [status, type, expires] = await Promise.all([
        getPreference('premium_status'),
        getPreference('premium_purchase_type'),
        getPreference('premium_expires_at'),
      ]);

      const isPremium = status === '1';
      const purchaseType = (type as PurchaseType) ?? null;
      const expiresAt = expires ?? null;

      // Check if non-lifetime subscription has expired
      if (isPremium && purchaseType !== 'lifetime' && expiresAt) {
        const expiry = new Date(expiresAt);
        if (expiry < new Date()) {
          // Subscription expired — clear premium locally.
          // RevenueCat will confirm on next sync.
          set({ isPremium: false, purchaseType: null, expiresAt: null, isHydrated: true });
          setPreference('premium_status', '0').catch(() => {});
          return;
        }
      }

      set({ isPremium, purchaseType, expiresAt, isHydrated: true });
    } catch (err) {
      logger.error('premiumStore', 'Failed to hydrate premium status', err);
      set({ isHydrated: true });
    }
  },

  setPremiumStatus: (isPremium, purchaseType, expiresAt) => {
    set({ isPremium, purchaseType, expiresAt });
    setPreference('premium_status', isPremium ? '1' : '0').catch(() => {});
    setPreference('premium_purchase_type', purchaseType ?? '').catch(() => {});
    setPreference('premium_expires_at', expiresAt ?? '').catch(() => {});
  },

  clearPremium: () => {
    set({ isPremium: false, purchaseType: null, expiresAt: null });
    setPreference('premium_status', '0').catch(() => {});
    setPreference('premium_purchase_type', '').catch(() => {});
    setPreference('premium_expires_at', '').catch(() => {});
  },

  __devSetPremium: (enabled) => {
    set({
      isPremium: enabled,
      purchaseType: enabled ? 'lifetime' : null,
      expiresAt: null,
    });
    setPreference('premium_status', enabled ? '1' : '0').catch(() => {});
  },
}));
