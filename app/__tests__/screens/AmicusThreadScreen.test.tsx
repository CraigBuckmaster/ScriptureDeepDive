import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AmicusThreadScreen from '@/screens/AmicusThreadScreen';
import { ThemeProvider } from '@/theme';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockGetAmicusThread = jest.fn();
const mockGetAmicusThreadContext = jest.fn();
const mockGetLinkedQuestion = jest.fn();
const mockResolveQuestion = jest.fn().mockResolvedValue(undefined);
const mockReopenQuestion = jest.fn().mockResolvedValue(undefined);
const mockUpsertSummary = jest.fn().mockResolvedValue(undefined);

let mockRouteParams: {
  threadId: string;
  initialQuery?: string;
  seedChapterRef?: string;
  seedGuidedContext?: object;
} = { threadId: 't-study', seedChapterRef: 'genesis/1' };

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      getParent: jest.fn(() => ({ navigate: mockNavigate })),
    }),
    useRoute: () => ({ params: mockRouteParams }),
  };
});

jest.mock('@/db/userQueries', () => ({
  getAmicusThread: (...args: unknown[]) => mockGetAmicusThread(...args),
  getAmicusThreadContext: (...args: unknown[]) => mockGetAmicusThreadContext(...args),
  getLinkedGuidedStudyQuestionForThread: (...args: unknown[]) => mockGetLinkedQuestion(...args),
}));

jest.mock('@/db/userMutations', () => ({
  reopenGuidedStudyQuestion: (...args: unknown[]) => mockReopenQuestion(...args),
  resolveGuidedStudyQuestion: (...args: unknown[]) => mockResolveQuestion(...args),
  updateThreadTitle: jest.fn().mockResolvedValue(undefined),
  upsertAmicusThreadSummary: (...args: unknown[]) => mockUpsertSummary(...args),
}));

jest.mock('@/hooks/useAmicusThread', () => ({
  useAmicusThread: () => ({
    messages: [],
    isStreaming: false,
    error: null,
    sendMessage: jest.fn(),
    abortStream: jest.fn(),
    refresh: jest.fn(),
    clearError: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAmicusAccess', () => ({
  useAmicusAccess: () => ({
    reason: 'ok',
    entitlement: 'premium',
  }),
}));

jest.mock('@/services/amicus/authToken', () => ({
  getAmicusAuthToken: jest.fn().mockResolvedValue('token'),
}));

jest.mock('@/services/amicus/consent', () => ({
  useAmicusConsent: () => ({
    requestAmicusConsent: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('@/contexts/AmicusFabContext', () => ({
  useSuppressAmicusFab: jest.fn(),
}));

jest.mock('@/components/amicus/MessageList', () => {
  const { View } = require('react-native');
  return function MockMessageList() {
    return <View accessibilityLabel="message-list" />;
  };
});

jest.mock('@/components/amicus/InputBar', () => {
  const { View } = require('react-native');
  return function MockInputBar() {
    return <View accessibilityLabel="input-bar" />;
  };
});

jest.mock('@/components/amicus/MetaFaqModal', () => {
  const { View } = require('react-native');
  return function MockMetaFaqModal() {
    return <View accessibilityLabel="meta-faq-modal" />;
  };
});

jest.mock('@/components/amicus/StudyActionRow', () => {
  const { View } = require('react-native');
  return function MockStudyActionRow() {
    return <View accessibilityLabel="study-action-row" />;
  };
});

jest.mock('@/components/amicus/CapExceededBanner', () => {
  const { View } = require('react-native');
  return function MockCapExceededBanner() {
    return <View accessibilityLabel="cap-banner" />;
  };
});

function renderScreen() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <AmicusThreadScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('AmicusThreadScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { threadId: 't-study', seedChapterRef: 'genesis/1' };
    mockGetAmicusThread.mockResolvedValue({
      thread_id: 't-study',
      title: 'Genesis 1 — Why is the structure repeated?',
      chapter_ref: 'genesis/1',
      pinned: false,
      summary_text: 'Investigating: Why is the structure repeated?',
      last_user_intent: 'Investigate question',
      guided_step: 'synthesize',
      open_question_id: 7,
      guided_question_status: 'open',
      takeaway: null,
      key_connection: null,
      created_at: 'x',
      last_message_at: 'x',
    });
    mockGetAmicusThreadContext.mockResolvedValue({
      thread_id: 't-study',
      entry_point: 'guided_study',
      guided_session_id: 3,
      guided_step: 'synthesize',
      open_question_id: 7,
      takeaway: null,
      key_connection: null,
      created_at: 'x',
      updated_at: 'x',
    });
    mockGetLinkedQuestion.mockResolvedValue({
      id: 7,
      session_id: 3,
      chapter_id: 'genesis_1',
      question_text: 'Why is the structure repeated?',
      status: 'open',
      created_at: 'x',
      resolved_at: null,
      updated_at: 'x',
    });
  });

  it('resolves a linked question and refreshes the thread summary', async () => {
    const { findByText, getByLabelText } = renderScreen();

    expect(await findByText('Open Question')).toBeTruthy();
    fireEvent.press(getByLabelText('Mark question resolved'));

    await waitFor(() => expect(mockResolveQuestion).toHaveBeenCalledWith(7));
    await waitFor(() =>
      expect(mockUpsertSummary).toHaveBeenCalledWith({
        threadId: 't-study',
        summaryText: 'Resolved question in Genesis 1.',
        lastUserIntent: 'Resolved question',
      }),
    );
    expect(await findByText('Reopen')).toBeTruthy();
  });

  it('reopens a resolved linked question and restores investigation summary', async () => {
    mockGetLinkedQuestion.mockResolvedValueOnce({
      id: 7,
      session_id: 3,
      chapter_id: 'genesis_1',
      question_text: 'Why is the structure repeated?',
      status: 'resolved',
      created_at: 'x',
      resolved_at: 'x',
      updated_at: 'x',
    });

    const { findByText, getByLabelText } = renderScreen();

    expect(await findByText('Open Question')).toBeTruthy();
    fireEvent.press(getByLabelText('Reopen question'));

    await waitFor(() => expect(mockReopenQuestion).toHaveBeenCalledWith(7));
    await waitFor(() =>
      expect(mockUpsertSummary).toHaveBeenCalledWith({
        threadId: 't-study',
        summaryText: 'Investigating: Why is the structure repeated?',
        lastUserIntent: 'Investigate question',
      }),
    );
    expect(await findByText('Resolve')).toBeTruthy();
  });
});
