import { renderHook, act } from '@testing-library/react-native';
import * as Speech from 'expo-speech';

// expo-speech is already mocked in jest.setup.js
import { useTTS } from '@/hooks/useTTS';

const mockVerses = [
  { verse_num: 1, text: 'In the beginning God created the heavens and the earth.' },
  { verse_num: 2, text: 'And the earth was without form, and void.' },
  { verse_num: 3, text: 'And God said, Let there be light.' },
] as any[];

describe('useTTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentVerse).toBe(0);
    expect(result.current.speed).toBe(1.0);
  });

  it('play sets isPlaying to true', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);
    expect(Speech.speak).toHaveBeenCalled();
  });

  it('pause sets isPlaying to false and stops speech', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    act(() => {
      result.current.play();
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(Speech.stop).toHaveBeenCalled();
  });

  it('stop resets to verse 0 and stops playing', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    act(() => {
      result.current.play();
    });
    act(() => {
      result.current.stop();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentVerse).toBe(0);
    expect(Speech.stop).toHaveBeenCalled();
  });

  it('skipNext increments currentVerse', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    act(() => {
      result.current.skipNext();
    });
    expect(result.current.currentVerse).toBe(1);
    expect(Speech.speak).toHaveBeenCalled();
  });

  it('skipNext does not exceed bounds', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    // Skip to last verse
    act(() => { result.current.skipNext(); });
    act(() => { result.current.skipNext(); });
    act(() => { result.current.skipNext(); });
    // Should stay at last valid index (2)
    expect(result.current.currentVerse).toBe(2);
  });

  it('skipPrev decrements currentVerse but not below 0', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    // Start at 0, skipPrev should stay at 0
    act(() => {
      result.current.skipPrev();
    });
    expect(result.current.currentVerse).toBe(0);
  });

  it('setSpeed updates the speed value', () => {
    const { result } = renderHook(() => useTTS(mockVerses));
    act(() => {
      result.current.setSpeed(1.5);
    });
    expect(result.current.speed).toBe(1.5);
  });

  it('handles empty verses array', () => {
    const { result } = renderHook(() => useTTS([]));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentVerse).toBe(0);
    // play with empty verses should not throw
    act(() => {
      result.current.play();
    });
    // Should immediately stop since index >= length
    expect(result.current.isPlaying).toBe(false);
  });
});
