/**
 * stores/settingsStore.ts — Persistent user preferences.
 *
 * Hydrated from SQLite user_preferences table on app start.
 * Changes are written back to SQLite immediately.
 *
 * NOTE: Setter functions (setTranslation, setReadingScale, etc.) update
 * Zustand state synchronously then persist to SQLite in the background.
 * Callers intentionally fire-and-forget — the UI reflects the new value
 * instantly while the DB write completes asynchronously. If persistence
 * fails, the preference reverts on next app launch (acceptable trade-off
 * vs. blocking the UI on every settings change).
 */

import { create } from 'zustand';
import { deletePreference, getPreference, setPreference } from '../db/user';
import { TRANSLATION_MAP } from '../db/translationRegistry';
import { clampReadingScale, READING_SCALE_DEFAULT } from '../theme/scale';
import { logger } from '../utils/logger';

type ThemePreference = 'dark' | 'sepia' | 'light' | 'system';

const VALID_THEMES: ThemePreference[] = ['dark', 'sepia', 'light', 'system'];

interface SettingsState {
  translation: string;
  readingScale: number;
  vhlEnabled: boolean;
  bookListMode: string;
  studyCoachEnabled: boolean;
  theme: ThemePreference;
  ttsVoice: string;
  comparisonTranslation: string | null;
  redLetterEnabled: boolean;
  focusMode: boolean;
  amicusEnabled: boolean;
  gettingStartedDone: Set<string>;
  isHydrated: boolean;

  setTranslation: (t: string) => void;
  setReadingScale: (n: number) => void;
  setVhlEnabled: (v: boolean) => void;
  setBookListMode: (m: string) => void;
  setStudyCoachEnabled: (v: boolean) => void;
  setTheme: (t: ThemePreference) => void;
  setTtsVoice: (v: string) => void;
  setComparisonTranslation: (t: string | null) => void;
  setRedLetterEnabled: (v: boolean) => void;
  setAmicusEnabled: (v: boolean) => void;
  toggleFocusMode: () => void;
  markGettingStartedDone: (key: string) => void;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  translation: 'kjv',
  readingScale: READING_SCALE_DEFAULT,
  vhlEnabled: false,
  bookListMode: 'canonical',
  studyCoachEnabled: true,
  theme: 'dark' as ThemePreference,
  ttsVoice: '',
  comparisonTranslation: null,
  redLetterEnabled: true,
  focusMode: false,
  amicusEnabled: true,
  gettingStartedDone: new Set<string>(),
  isHydrated: false,

  setTranslation: (t) => {
    set({ translation: t });
    setPreference('translation', t).catch((err) => { logger.warn('settingsStore', 'Failed to persist translation', err); });
  },

  setReadingScale: (n) => {
    const clamped = clampReadingScale(n);
    set({ readingScale: clamped });
    setPreference('readingScale', String(clamped)).catch((err) => { logger.warn('settingsStore', 'Failed to persist readingScale', err); });
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

  setAmicusEnabled: (v) => {
    set({ amicusEnabled: v });
    setPreference('amicusEnabled', v ? '1' : '0').catch((err) => { logger.warn('settingsStore', 'Failed to persist amicusEnabled', err); });
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
      const legacyFontSize = await getPreference('fontSize');
      const rs = await getPreference('readingScale');
      const v = await getPreference('vhlEnabled');
      const blm = await getPreference('bookListMode');
      const sc = await getPreference('studyCoachEnabled');
      const th = await getPreference('theme');
      const voice = await getPreference('ttsVoice');
      const comp = await getPreference('comparisonTranslation');
      const rl = await getPreference('redLetterEnabled');
      const fm = await getPreference('focusMode');
      const amicus = await getPreference('amicusEnabled');
      const gs = await getPreference('getting_started');

      let gsDone = new Set<string>();
      if (gs) {
        try {
          gsDone = new Set(JSON.parse(gs));
        } catch {
          // Malformed preference — fall back to an empty set.
        }
      }

      // readingScale: prefer stored value; else one-time migration from
      // the legacy `fontSize` (px) preference by dividing by the 16 px
      // baseline. Either way, drop the legacy key afterwards — no other
      // code reads it now that PR 2 migrated every reading surface to
      // useTypography().
      let readingScale = READING_SCALE_DEFAULT;
      if (rs !== null && rs !== undefined && rs !== '') {
        readingScale = clampReadingScale(parseFloat(rs));
      } else if (legacyFontSize !== null && legacyFontSize !== undefined && legacyFontSize !== '') {
        const px = parseFloat(legacyFontSize);
        if (Number.isFinite(px)) {
          readingScale = clampReadingScale(px / 16);
          setPreference('readingScale', String(readingScale)).catch((err) => {
            logger.warn('settingsStore', 'Failed to persist migrated readingScale', err);
          });
        }
      }
      if (legacyFontSize !== null && legacyFontSize !== undefined) {
        deletePreference('fontSize').catch((err) => {
          logger.warn('settingsStore', 'Failed to delete legacy fontSize preference', err);
        });
      }

      set({
        translation: (t && TRANSLATION_MAP.has(t) ? t : 'kjv'),
        readingScale,
        vhlEnabled: v === '1',
        bookListMode: blm === 'canonical' ? 'canonical' : 'thematic',
        studyCoachEnabled: sc !== '0',
        theme: (VALID_THEMES.includes(th as ThemePreference) ? th : 'dark') as ThemePreference,
        ttsVoice: voice ?? '',
        comparisonTranslation: (comp && TRANSLATION_MAP.has(comp)) ? comp : null,
        redLetterEnabled: rl !== '0',
        focusMode: fm === '1',
        amicusEnabled: amicus !== '0',
        gettingStartedDone: gsDone,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
