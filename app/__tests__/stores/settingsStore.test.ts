import { useSettingsStore } from '@/stores/settingsStore';

// Mock the user DB preference functions
jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

const { getPreference, setPreference } = require('@/db/user');

describe('settingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({
      translation: 'kjv',
      fontSize: 16,
      readingScale: 1.0,
      vhlEnabled: true,
      bookListMode: 'canonical',
      studyCoachEnabled: true,
      theme: 'dark',
      isHydrated: false,
    });
  });

  it('starts with default state', () => {
    const state = useSettingsStore.getState();
    expect(state.translation).toBe('kjv');
    expect(state.fontSize).toBe(16);
    expect(state.theme).toBe('dark');
    expect(state.isHydrated).toBe(false);
  });

  describe('setTranslation', () => {
    it('updates translation and persists', async () => {
      await useSettingsStore.getState().setTranslation('asv');
      expect(useSettingsStore.getState().translation).toBe('asv');
      expect(setPreference).toHaveBeenCalledWith('translation', 'asv');
    });
  });

  describe('setFontSize', () => {
    it('sets font size', async () => {
      await useSettingsStore.getState().setFontSize(20);
      expect(useSettingsStore.getState().fontSize).toBe(20);
    });

    it('clamps to minimum of 12', async () => {
      await useSettingsStore.getState().setFontSize(8);
      expect(useSettingsStore.getState().fontSize).toBe(12);
    });

    it('clamps to maximum of 24', async () => {
      await useSettingsStore.getState().setFontSize(30);
      expect(useSettingsStore.getState().fontSize).toBe(24);
    });
  });

  describe('setVhlEnabled', () => {
    it('persists as "1" or "0"', async () => {
      await useSettingsStore.getState().setVhlEnabled(false);
      expect(useSettingsStore.getState().vhlEnabled).toBe(false);
      expect(setPreference).toHaveBeenCalledWith('vhlEnabled', '0');

      await useSettingsStore.getState().setVhlEnabled(true);
      expect(setPreference).toHaveBeenCalledWith('vhlEnabled', '1');
    });
  });

  describe('setTheme', () => {
    it('sets theme', async () => {
      await useSettingsStore.getState().setTheme('sepia');
      expect(useSettingsStore.getState().theme).toBe('sepia');
      expect(setPreference).toHaveBeenCalledWith('theme', 'sepia');
    });
  });

  describe('hydrate', () => {
    it('loads values from preferences', async () => {
      getPreference.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          translation: 'asv',
          fontSize: '18',
          vhlEnabled: '1',
          bookListMode: 'canonical',
          studyCoachEnabled: '0',
          theme: 'sepia',
        };
        return Promise.resolve(map[key] ?? null);
      });

      await useSettingsStore.getState().hydrate();
      const state = useSettingsStore.getState();
      expect(state.translation).toBe('asv');
      expect(state.fontSize).toBe(18);
      expect(state.vhlEnabled).toBe(true);
      expect(state.studyCoachEnabled).toBe(false);
      expect(state.theme).toBe('sepia');
      expect(state.isHydrated).toBe(true);
    });

    it('falls back to defaults for invalid values', async () => {
      getPreference.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          translation: 'bad',
          fontSize: 'NaN',
          theme: 'neon',
        };
        return Promise.resolve(map[key] ?? null);
      });

      await useSettingsStore.getState().hydrate();
      const state = useSettingsStore.getState();
      expect(state.translation).toBe('kjv');
      expect(state.fontSize).toBe(16);
      expect(state.theme).toBe('dark');
    });

    it('sets isHydrated true even on error', async () => {
      getPreference.mockRejectedValue(new Error('db fail'));
      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().isHydrated).toBe(true);
    });

    it('hydrates ttsVoice, comparisonTranslation, redLetterEnabled, focusMode', async () => {
      getPreference.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          ttsVoice: 'en-US-voice-1',
          comparisonTranslation: 'asv',
          redLetterEnabled: '0',
          focusMode: '1',
        };
        return Promise.resolve(map[key] ?? null);
      });

      await useSettingsStore.getState().hydrate();
      const state = useSettingsStore.getState();
      expect(state.ttsVoice).toBe('en-US-voice-1');
      expect(state.comparisonTranslation).toBe('asv');
      expect(state.redLetterEnabled).toBe(false);
      expect(state.focusMode).toBe(true);
    });

    it('hydrates gettingStartedDone from JSON', async () => {
      getPreference.mockImplementation((key: string) => {
        if (key === 'getting_started') return Promise.resolve('["task1","task2"]');
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().hydrate();
      const state = useSettingsStore.getState();
      expect(state.gettingStartedDone.has('task1')).toBe(true);
      expect(state.gettingStartedDone.has('task2')).toBe(true);
    });

    it('handles invalid getting_started JSON gracefully', async () => {
      getPreference.mockImplementation((key: string) => {
        if (key === 'getting_started') return Promise.resolve('NOT JSON');
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().hydrate();
      const state = useSettingsStore.getState();
      expect(state.gettingStartedDone.size).toBe(0);
    });

    it('defaults bookListMode to thematic for non-canonical values', async () => {
      getPreference.mockImplementation((key: string) => {
        if (key === 'bookListMode') return Promise.resolve('other');
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().bookListMode).toBe('thematic');
    });

    it('rejects invalid comparison translation', async () => {
      getPreference.mockImplementation((key: string) => {
        if (key === 'comparisonTranslation') return Promise.resolve('invalid_translation');
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().comparisonTranslation).toBeNull();
    });
  });

  describe('setBookListMode', () => {
    it('sets mode and persists', async () => {
      await useSettingsStore.getState().setBookListMode('thematic');
      expect(useSettingsStore.getState().bookListMode).toBe('thematic');
      expect(setPreference).toHaveBeenCalledWith('bookListMode', 'thematic');
    });
  });

  describe('setStudyCoachEnabled', () => {
    it('persists as boolean string', async () => {
      await useSettingsStore.getState().setStudyCoachEnabled(false);
      expect(useSettingsStore.getState().studyCoachEnabled).toBe(false);
      expect(setPreference).toHaveBeenCalledWith('studyCoachEnabled', '0');
    });
  });

  describe('setTtsVoice', () => {
    it('sets voice and persists', async () => {
      await useSettingsStore.getState().setTtsVoice('en-US-voice-2');
      expect(useSettingsStore.getState().ttsVoice).toBe('en-US-voice-2');
      expect(setPreference).toHaveBeenCalledWith('ttsVoice', 'en-US-voice-2');
    });
  });

  describe('setRedLetterEnabled', () => {
    it('persists as "1" or "0"', async () => {
      await useSettingsStore.getState().setRedLetterEnabled(false);
      expect(useSettingsStore.getState().redLetterEnabled).toBe(false);
      expect(setPreference).toHaveBeenCalledWith('redLetterEnabled', '0');
    });
  });

  describe('toggleFocusMode', () => {
    it('toggles focusMode and persists', () => {
      useSettingsStore.setState({ focusMode: false });
      useSettingsStore.getState().toggleFocusMode();
      expect(useSettingsStore.getState().focusMode).toBe(true);
      expect(setPreference).toHaveBeenCalledWith('focusMode', '1');

      useSettingsStore.getState().toggleFocusMode();
      expect(useSettingsStore.getState().focusMode).toBe(false);
      expect(setPreference).toHaveBeenCalledWith('focusMode', '0');
    });
  });

  describe('markGettingStartedDone', () => {
    it('adds key to the set and persists', () => {
      useSettingsStore.setState({ gettingStartedDone: new Set<string>() });
      useSettingsStore.getState().markGettingStartedDone('task1');
      expect(useSettingsStore.getState().gettingStartedDone.has('task1')).toBe(true);
      expect(setPreference).toHaveBeenCalledWith(
        'getting_started',
        expect.stringContaining('task1'),
      );
    });

    it('does not duplicate existing keys', () => {
      useSettingsStore.setState({ gettingStartedDone: new Set(['task1']) });
      useSettingsStore.getState().markGettingStartedDone('task1');
      // setPreference should NOT be called since key already exists
      expect(setPreference).not.toHaveBeenCalled();
    });
  });

  describe('setReadingScale', () => {
    it('clamps below minimum of 0.85', () => {
      useSettingsStore.getState().setReadingScale(0.5);
      expect(useSettingsStore.getState().readingScale).toBe(0.85);
      expect(setPreference).toHaveBeenCalledWith('readingScale', '0.85');
    });

    it('clamps above maximum of 1.60', () => {
      useSettingsStore.getState().setReadingScale(2.5);
      expect(useSettingsStore.getState().readingScale).toBe(1.60);
      expect(setPreference).toHaveBeenCalledWith('readingScale', '1.6');
    });

    it('accepts values inside the range', () => {
      useSettingsStore.getState().setReadingScale(1.25);
      expect(useSettingsStore.getState().readingScale).toBe(1.25);
      expect(setPreference).toHaveBeenCalledWith('readingScale', '1.25');
    });

    it('falls back to default on non-finite input', () => {
      useSettingsStore.getState().setReadingScale(Number.NaN);
      expect(useSettingsStore.getState().readingScale).toBe(1.0);
    });
  });

  describe('hydrate readingScale', () => {
    it('migrates legacy fontSize=20 to readingScale ≈ 1.25 and persists', async () => {
      getPreference.mockImplementation((key: string) => {
        if (key === 'fontSize') return Promise.resolve('20');
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().readingScale).toBeCloseTo(1.25, 5);
      expect(setPreference).toHaveBeenCalledWith('readingScale', '1.25');
    });

    it('prefers stored readingScale over legacy fontSize', async () => {
      getPreference.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          readingScale: '1.4',
          fontSize: '20', // would map to 1.25 if migration ran
        };
        return Promise.resolve(map[key] ?? null);
      });

      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().readingScale).toBeCloseTo(1.4, 5);
      // No migration write should happen when readingScale is already stored.
      expect(setPreference).not.toHaveBeenCalledWith('readingScale', expect.any(String));
    });

    it('defaults readingScale to 1.0 when both keys are missing', async () => {
      getPreference.mockResolvedValue(null);
      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().readingScale).toBe(1.0);
      expect(setPreference).not.toHaveBeenCalledWith('readingScale', expect.any(String));
    });

    it('clamps migrated legacy fontSize that would exceed the reading-scale cap', async () => {
      // fontSize=24 → 24/16 = 1.5, within range
      getPreference.mockImplementation((key: string) => {
        if (key === 'fontSize') return Promise.resolve('24');
        return Promise.resolve(null);
      });
      await useSettingsStore.getState().hydrate();
      expect(useSettingsStore.getState().readingScale).toBeCloseTo(1.5, 5);
    });
  });

  describe('setComparisonTranslation', () => {
    it('sets and persists comparison translation', () => {
      useSettingsStore.getState().setComparisonTranslation('asv');
      expect(useSettingsStore.getState().comparisonTranslation).toBe('asv');
      expect(setPreference).toHaveBeenCalledWith('comparisonTranslation', 'asv');
    });

    it('clears with null and persists empty string', () => {
      useSettingsStore.getState().setComparisonTranslation(null);
      expect(useSettingsStore.getState().comparisonTranslation).toBeNull();
      expect(setPreference).toHaveBeenCalledWith('comparisonTranslation', '');
    });
  });
});
