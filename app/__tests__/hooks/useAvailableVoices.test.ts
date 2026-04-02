import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetAvailableVoicesAsync = jest.fn();

jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: (...args: any[]) => mockGetAvailableVoicesAsync(...args),
}));

// Must unmock the hook itself since jest.setup.js mocks it globally
jest.unmock('@/hooks/useAvailableVoices');

import { useAvailableVoices } from '@/hooks/useAvailableVoices';

describe('useAvailableVoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailableVoicesAsync.mockResolvedValue([]);
  });

  it('starts with an empty array', () => {
    const { result } = renderHook(() => useAvailableVoices());
    expect(result.current).toEqual([]);
  });

  it('loads English voices from device', async () => {
    mockGetAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'voice-1', name: 'Samantha', language: 'en-US' },
      { identifier: 'voice-2', name: 'Daniel', language: 'en-GB' },
    ]);

    const { result } = renderHook(() => useAvailableVoices());

    await waitFor(() => {
      expect(result.current).toHaveLength(2);
    });

    expect(result.current[0].name).toBe('Daniel');
    expect(result.current[1].name).toBe('Samantha');
  });

  it('filters out non-English voices', async () => {
    mockGetAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'voice-1', name: 'Samantha', language: 'en-US' },
      { identifier: 'voice-2', name: 'Marie', language: 'fr-FR' },
      { identifier: 'voice-3', name: 'Hans', language: 'de-DE' },
    ]);

    const { result } = renderHook(() => useAvailableVoices());

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });

    expect(result.current[0].name).toBe('Samantha');
  });

  it('sorts recommended voices first, then alphabetical', async () => {
    mockGetAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'com.apple.voice.basic.en-US.Zoe', name: 'Zoe', language: 'en-US' },
      { identifier: 'com.apple.voice.enhanced.en-US.Aaron', name: 'Aaron', language: 'en-US' },
      { identifier: 'com.apple.voice.basic.en-US.Alex', name: 'Alex', language: 'en-US' },
      { identifier: 'com.apple.voice.enhanced.en-US.Nathan', name: 'Nathan', language: 'en-US' },
    ]);

    const { result } = renderHook(() => useAvailableVoices());

    await waitFor(() => {
      expect(result.current).toHaveLength(4);
    });

    // Recommended voices (Aaron, Nathan) should come first
    expect(result.current[0].name).toBe('Aaron');
    expect(result.current[1].name).toBe('Nathan');
    // Then alphabetical
    expect(result.current[2].name).toBe('Alex');
    expect(result.current[3].name).toBe('Zoe');
  });
});
