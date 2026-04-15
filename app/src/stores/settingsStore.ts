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
  focusMode: boolean;
  gettingStartedDone: Set<string>;
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
  toggleFocusMode: () => void;
  markGettingStartedDone: (key: string) => void;
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
  focusMode: false,
  gettingStartedDone: new Set<string>(),
  isHydrated: false,

  setTranslation: (t) => {
    set({ translation: t });
    setPreference('translation', t).catch((err) => { logger.warn('settingsStore', 'Failed to persist translation', err); });
  },

  setFontSize: (s) => {
    const clamped = Math.min(24, Math.max(12, s));
    set({ fontSize: clamped });
    setPreference('fontSize', String(clamped)).catch((err) => { logger.warn('settingsStore', 'Failed to persist fontSize', err); });
  },

  setVhlEnabled: (v) => {
    set({ vhlEnabled: v });
    setPreference('vhlEnabled', v ? '1' : '0').catch((err) => { logger.warn('settingsStore', 'Failed to persist vhlEnabled', err); });
  },

  setBookListMode: (m) => {
    set({ bookListMode: m });
    setPreference('bookListMode', m).catch((err) => { logger.warn('settingsStore', 'Failed to persist bookListMode', err); });
  },

  setStudyCoachEnabled: (v) => {
    set({ studyCoachEnabled: v });
    setPreference('studyCoachEnabled', v ? '1' : '0').catch((err) => { logger.warn('settingsStore', 'Failed to persist studyCoachEnabled', err); });
  },

  setTheme: (t) => {
    set({ theme: t });
    setPreference('theme', t).catch((err) => { logger.warn('settingsStore', 'Failed to persist theme', err); });
  },

  setTtsVoice: (v) => {
    set({ ttsVoice: v });
    setPreference('ttsVoice', v).catch((err) => { logger.warn('settingsStore', 'Failed to persist ttsVoice', err); });
  },

  setRedLetterEnabled: (v) => {
    set({ redLetterEnabled: v });
    setPreference('redLetterEnabled', v ? '1' : '0').catch((err) => { logger.warn('settingsStore', 'Failed to persist redLetterEnabled', err); });
  },

  toggleFocusMode: () => {
    const next = !useSettingsStore.getState().focusMode;
    set({ focusMode: next });
    setPreference('focusMode', next ? '1' : '0').catch((err) => { logger.warn('settingsStore', 'Failed to persist focusMode', err); });
  },

  markGettingStartedDone: (key: string) => {
    const current = useSettingsStore.getState().gettingStartedDone;
    if (current.has(key)) return;
    const next = new Set(current);
    next.add(key);
    set({ gettingStartedDone: next });
    setPreference('getting_started', JSON.stringify([...next])).catch((err) => { logger.warn('settingsStore', 'Failed to persist getting_started', err); });
  },

  setComparisonTranslation: (t) => {
    set({ comparisonTranslation: t });
    setPreference('comparisonTranslation', t ?? '').catch((err) => { logger.warn('settingsStore', 'Failed to persist comparisonTranslation', err); });
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
      const fm = await getPreference('focusMode');
      const gs = await getPreference('getting_started');

      let gsDone = new Set<string>();
      if (gs) {
        try {
          gsDone = new Set(JSON.parse(gs));
        } catch {
          // Malformed preference — fall back to an empty set.
        }
      }

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
        focusMode: fm === '1',
        gettingStartedDone: gsDone,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
