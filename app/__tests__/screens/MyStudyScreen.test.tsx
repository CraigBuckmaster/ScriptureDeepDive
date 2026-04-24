import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import MyStudyScreen from '@/screens/MyStudyScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockLaunchAmicusStudyThread = jest.fn().mockResolvedValue(undefined);
const mockResolveQuestion = jest.fn().mockResolvedValue(undefined);
const mockCompleteItem = jest.fn().mockResolvedValue(undefined);
const mockShowUpgrade = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      getParent: jest.fn(() => ({ navigate: mockNavigate })),
    }),
  };
});

jest.mock('@/hooks', () => ({
  usePremium: () => ({
    isPremium: true,
    upgradeRequest: null,
    showUpgrade: mockShowUpgrade,
    dismissUpgrade: jest.fn(),
  }),
  useReviewQueue: () => ({
    dueItems: [],
    allItems: [],
    concepts: [],
    activeSessions: [
      {
        id: 7,
        chapter_id: 'genesis_1',
        status: 'active',
        current_step: 'observe',
        started_at: '2026-04-24T00:00:00Z',
        completed_at: null,
        updated_at: '2026-04-24T00:00:00Z',
      },
    ],
    openQuestions: [
      {
        id: 9,
        session_id: 7,
        chapter_id: 'genesis_1',
        question_text: 'Why is the structure repeated?',
        status: 'open',
        created_at: '2026-04-24T00:00:00Z',
        resolved_at: null,
        updated_at: '2026-04-24T00:00:00Z',
      },
    ],
    recentTakeaways: [
      {
        session_id: 7,
        chapter_id: 'genesis_1',
        takeaway: 'Creation unfolds in ordered stages.',
        updated_at: '2026-04-24T00:00:00Z',
      },
    ],
    nextAction: null,
    completeItem: mockCompleteItem,
    resolveQuestion: mockResolveQuestion,
  }),
}));

jest.mock('@/services/amicus', () => ({
  launchAmicusStudyThread: (...args: unknown[]) => mockLaunchAmicusStudyThread(...args),
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (Component: React.ComponentType) => Component,
}));

describe('MyStudyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('launches Amicus from active sessions, open questions, and takeaways', async () => {
    const { getAllByText } = renderWithProviders(<MyStudyScreen />);

    fireEvent.press(getAllByText('Discuss')[0]!);
    fireEvent.press(getAllByText('Discuss')[1]!);
    fireEvent.press(getAllByText('Refine')[0]!);

    expect(mockLaunchAmicusStudyThread).toHaveBeenCalledTimes(3);
    expect(mockLaunchAmicusStudyThread.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        chapterId: 'genesis_1',
        sessionId: 7,
        guidedStudyStep: 'observe',
      }),
    );
    expect(mockLaunchAmicusStudyThread.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        openQuestionId: 9,
        openQuestionText: 'Why is the structure repeated?',
      }),
    );
    expect(mockLaunchAmicusStudyThread.mock.calls[2]?.[1]).toEqual(
      expect.objectContaining({
        takeaway: 'Creation unfolds in ordered stages.',
      }),
    );
  });
});
