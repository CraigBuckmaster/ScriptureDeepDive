/**
 * stores/settingsStore.ts — Persistent user preferences.
 *
 * Hydrated from SQLite user_preferences table on app start.
 * Changes are written back to SQLite immediately.
 *
 * NOTE: Setter functions (setTranslation, setFontSize, etc.) update
 * Zustand state synchronously then persist to SQLite in the background.
 * Callers intentionally fire-and-forget — the UI reflects the new value
 * instantly while the DB write completes asynchronously. If persistence
 * fails, the preference reverts on next app launch (acceptable trade-off
 * vs. blocking the UI on every settings change).
 */

import { create } from 'zustand';
import { getPreference, setPreference } from '../db/user';
import { TRANSLATION_MAP } from '../db/translationRegistry';
import { logger } from '../utils/logger';

type ThemePreference = 'dark' | 'sepia' | 'light' | 'system';

const VALID_THEMES: ThemePreference[] = ['dark', 'sepia', 'light', 'system'];

interface SettingsState {
  translation: string;
  fontSize: number;
  vhlEnabled: boolean;
  bookListMode: string;
  studyCoachEnabled: boolean;
  theme: ThemePreference;
  ttsVoice: string;
  comparisonTranslation: string | null;
  redLetterEnabled: boolean;
  isHydrated: boolean;

  setTranslation: (t: string) => void;
  setFontSize: (s: number) => void;
  setVhlEnabled: (v: boolean) => void;
  setBookListMode: (m: string) => void;
  setStudyCoachEnabled: (v: boolean) => void;
  setTheme: (t: ThemePreference) => void;
  setTtsVoice: (v: string) => void;
  setComparisonTranslation: (t: string | null) => void;
  setRedLetterEnabled: (v: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  translation: 'kjv',
  fontSize: 16,
  vhlEnabled: false,
  bookListMode: 'canonical',
  studyCoachEnabled: true,
  theme: 'dark' as ThemePreference,
  ttsVoice: '',
  comparisonTranslation: null,
  redLetterEnabled: true,
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

  setBookListMode: async (m) => {
    set({ bookListMode: m });
    await setPreference('bookListMode', m);
  },

  setStudyCoachEnabled: async (v) => {
    set({ studyCoachEnabled: v });
    await setPreference('studyCoachEnabled', v ? '1' : '0');
  },

  setTheme: async (t) => {
    set({ theme: t });
    await setPreference('theme', t);
  },

  setTtsVoice: async (v) => {
    set({ ttsVoice: v });
    await setPreference('ttsVoice', v);
  },

  setRedLetterEnabled: async (v) => {
    set({ redLetterEnabled: v });
    await setPreference('redLetterEnabled', v ? '1' : '0');
  },

  setComparisonTranslation: async (t) => {
    set({ comparisonTranslation: t });
    await setPreference('comparisonTranslation', t ?? '');
  },

  hydrate: async () => {
    try {
      const t = await getPreference('translation');
      const f = await getPreference('fontSize');
      const v = await getPreference('vhlEnabled');
      const blm = await getPreference('bookListMode');
      const sc = await getPreference('studyCoachEnabled');
      const th = await getPreference('theme');
      const voice = await getPreference('ttsVoice');
      const comp = await getPreference('comparisonTranslation');
      const rl = await getPreference('redLetterEnabled');

      set({
        translation: (t && TRANSLATION_MAP.has(t) ? t : 'kjv'),
        fontSize: f ? Math.min(24, Math.max(12, parseInt(f, 10) || 16)) : 16,
        vhlEnabled: v === '1',
        bookListMode: blm === 'canonical' ? 'canonical' : 'thematic',
        studyCoachEnabled: sc !== '0',
        theme: (VALID_THEMES.includes(th as ThemePreference) ? th : 'dark') as ThemePreference,
        ttsVoice: voice ?? '',
        comparisonTranslation: (comp && TRANSLATION_MAP.has(comp)) ? comp : null,
        redLetterEnabled: rl !== '0',
        isHydrated: true,
      });
    } catch (err) {
      set({ isHydrated: true });
    }
  },
}));
