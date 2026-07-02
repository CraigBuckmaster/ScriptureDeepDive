/**
 * #1836 — Saved indicator. Must appear only after a persist (tick
 * bump), never at rest, and render statically under reduced motion.
 */
import React from 'react';
import { act, render } from '@testing-library/react-native';

const mockUseReducedMotion = jest.fn().mockReturnValue(false);
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

import { SavedIndicator } from '@/components/guidedStudy/SavedIndicator';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseReducedMotion.mockReturnValue(false);
});

describe('SavedIndicator (#1836)', () => {
  it('renders nothing before any save (tick 0) — never optimistic', () => {
    const { toJSON } = render(<SavedIndicator savedTick={0} />);
    expect(toJSON()).toBeNull();
  });

  it('shows "Saved" when the tick bumps after a successful persist', () => {
    const { queryByText, rerender, getByText } = render(<SavedIndicator savedTick={0} />);
    expect(queryByText('Saved')).toBeNull();

    rerender(<SavedIndicator savedTick={1} />);
    expect(getByText('Saved')).toBeTruthy();
  });

  it('under reduced motion: shows statically, then hides after the hold', () => {
    jest.useFakeTimers();
    mockUseReducedMotion.mockReturnValue(true);
    const { rerender, getByText, queryByText } = render(<SavedIndicator savedTick={0} />);

    rerender(<SavedIndicator savedTick={1} />);
    expect(getByText('Saved')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(queryByText('Saved')).toBeNull();
    jest.useRealTimers();
  });

  it('re-shows on every subsequent tick', () => {
    jest.useFakeTimers();
    mockUseReducedMotion.mockReturnValue(true);
    const { rerender, getByText, queryByText } = render(<SavedIndicator savedTick={1} />);
    // Initial state with tick already 1: still hidden (no transition seen).
    expect(queryByText('Saved')).toBeNull();

    rerender(<SavedIndicator savedTick={2} />);
    expect(getByText('Saved')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(queryByText('Saved')).toBeNull();

    rerender(<SavedIndicator savedTick={3} />);
    expect(getByText('Saved')).toBeTruthy();
    jest.useRealTimers();
  });
});
