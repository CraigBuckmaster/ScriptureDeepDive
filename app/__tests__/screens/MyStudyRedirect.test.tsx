/**
 * #1836 — MyStudy → Study hub redirect behind the study_hub flag.
 * Flag on: thin redirect (pop first — no loop), renders nothing.
 * Flag off: the screen renders exactly as before.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);
const mockParentNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      canGoBack: mockCanGoBack,
      getParent: () => ({ navigate: mockParentNavigate }),
    }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

const mockIsFlagEnabled = jest.fn().mockReturnValue(false);
jest.mock('@/config/featureFlags', () => ({
  isFlagEnabled: (...args: unknown[]) => mockIsFlagEnabled(...args),
}));

jest.mock('@/hooks', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: true,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
  useReviewQueue: jest.fn().mockReturnValue({
    dueItems: [],
    allItems: [],
    concepts: [],
    activeSessions: [],
    openQuestions: [],
    recentTakeaways: [],
    nextAction: null,
    completeItem: jest.fn(),
    resolveQuestion: jest.fn(),
  }),
}));

import MyStudyScreen from '@/screens/MyStudyScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack.mockReturnValue(true);
});

describe('MyStudyScreen redirect (#1836)', () => {
  it('flag off: renders the screen normally, no redirect', () => {
    mockIsFlagEnabled.mockReturnValue(false);
    const { getByText } = render(<MyStudyScreen />);
    expect(getByText('My Study')).toBeTruthy();
    expect(mockParentNavigate).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('flag on: renders nothing, pops itself, then jumps to the Study hub (no loop)', async () => {
    mockIsFlagEnabled.mockReturnValue(true);
    const { toJSON } = render(<MyStudyScreen />);
    expect(toJSON()).toBeNull();
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalledTimes(1);
      expect(mockParentNavigate).toHaveBeenCalledWith('ExploreTab', { screen: 'StudyHub' });
    });
    // Pop happens before the cross-tab jump so More never re-lands here.
    expect(mockGoBack.mock.invocationCallOrder[0]).toBeLessThan(
      mockParentNavigate.mock.invocationCallOrder[0],
    );
  });

  it('flag on with an empty stack: skips the pop but still redirects', async () => {
    mockIsFlagEnabled.mockReturnValue(true);
    mockCanGoBack.mockReturnValue(false);
    render(<MyStudyScreen />);
    await waitFor(() =>
      expect(mockParentNavigate).toHaveBeenCalledWith('ExploreTab', { screen: 'StudyHub' }),
    );
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
