/**
 * stores/settingsStore.ts — Persistent user preferences.
 *
 * Hydrated from SQLite user_preferences table on app start.
 * Changes are written back to SQLite immediately.
 */

import { create } from 'zustand';
import { getPreference, setPreference } from '../db/user';

interface SettingsState {
  translation: string;
  fontSize: number;
  vhlEnabled: boolean;
  isHydrated: boolean;

  setTranslation: (t: string) => void;
  setFontSize: (s: number) => void;
  setVhlEnabled: (v: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  translation: 'niv',
  fontSize: 16,
  vhlEnabled: true,
  isHydrated: false,

  setTranslation: async (t) => {
    set({ translation: t });
    await setPreference('translation', t);
  },

  setFontSize: async (s) => {
    const clamped = Math.min(24, Math.max(12, s));
    set({ fontSize: clamped });
    await setPreference('fontSize', String(clamped));
  },

  setVhlEnabled: async (v) => {
    set({ vhlEnabled: v });
    await setPreference('vhlEnabled', v ? '1' : '0');
  },

  hydrate: async () => {
    try {
      const t = await getPreference('translation');
      const f = await getPreference('fontSize');
      const v = await getPreference('vhlEnabled');

      set({
        translation: (t === 'esv' ? 'esv' : 'niv'),
        fontSize: f ? Math.min(24, Math.max(12, parseInt(f, 10) || 16)) : 16,
        vhlEnabled: v !== '0',
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
