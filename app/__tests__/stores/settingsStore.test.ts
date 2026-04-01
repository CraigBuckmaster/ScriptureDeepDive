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
  });
});
