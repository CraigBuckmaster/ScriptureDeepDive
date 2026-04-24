import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import AmicusThreadListScreen from '@/screens/AmicusThreadListScreen';

const mockUseAmicusThreads = jest.fn();
const mockUseAmicusAccess = jest.fn();

jest.mock('@/hooks/useAmicusThreads', () => ({
  useAmicusThreads: () => mockUseAmicusThreads(),
}));

jest.mock('@/hooks/useAmicusAccess', () => ({
  useAmicusAccess: () => mockUseAmicusAccess(),
}));

jest.mock('@/contexts/AmicusFabContext', () => ({
  useSuppressAmicusFab: jest.fn(),
}));

describe('AmicusThreadListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAmicusAccess.mockReturnValue({
      reason: 'ok',
      entitlement: 'premium',
    });
    mockUseAmicusThreads.mockReturnValue({
      isLoading: false,
      refresh: jest.fn().mockResolvedValue(undefined),
      actions: {
        pin: jest.fn().mockResolvedValue(undefined),
        unpin: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
        rename: jest.fn().mockResolvedValue(undefined),
      },
      threads: [
        {
          thread_id: 't-genesis',
          title: 'Genesis study',
          chapter_ref: 'genesis/1',
          pinned: true,
          summary_text: null,
          last_user_intent: 'Explain this chapter',
          guided_step: 'synthesize',
          open_question_id: 7,
          guided_question_status: 'open',
          takeaway: null,
          key_connection: null,
          created_at: '2026-04-20T00:00:00.000Z',
          last_message_at: '2026-04-20T00:00:00.000Z',
        },
        {
          thread_id: 't-romans',
          title: 'Romans question',
          chapter_ref: 'romans/9',
          pinned: false,
          summary_text: 'What does Romans 9 say about mercy?',
          last_user_intent: 'Investigate question',
          guided_step: 'explore',
          open_question_id: 11,
          guided_question_status: 'resolved',
          takeaway: null,
          key_connection: null,
          created_at: '2026-04-19T00:00:00.000Z',
          last_message_at: '2026-04-19T00:00:00.000Z',
        },
        {
          thread_id: 't-john',
          title: 'John notes',
          chapter_ref: 'john/1',
          pinned: false,
          summary_text: null,
          last_user_intent: 'Explain this chapter',
          guided_step: null,
          open_question_id: null,
          guided_question_status: null,
          takeaway: null,
          key_connection: null,
          created_at: '2026-04-18T00:00:00.000Z',
          last_message_at: '2026-04-18T00:00:00.000Z',
        },
      ],
    });
  });

  it('shows thread context and fallback study copy in the list', () => {
    const { getAllByText, getByText } = renderWithProviders(<AmicusThreadListScreen />);

    expect(getByText('1 pinned · 1 study · 1 recent')).toBeTruthy();
    expect(getByText('Pinned')).toBeTruthy();
    expect(getByText('Study')).toBeTruthy();
    expect(getByText('Recent')).toBeTruthy();
    expect(getByText('Genesis 1')).toBeTruthy();
    expect(getByText('Synthesize')).toBeTruthy();
    expect(getByText('Open question')).toBeTruthy();
    expect(getAllByText('Explain this chapter')).toHaveLength(2);
    expect(getByText('Continue investigating this open question.')).toBeTruthy();
    expect(getByText('What does Romans 9 say about mercy?')).toBeTruthy();
    expect(getByText('Resolved question')).toBeTruthy();
  });

  it('shows the richer empty state when no threads exist', () => {
    mockUseAmicusThreads.mockReturnValueOnce({
      isLoading: false,
      refresh: jest.fn().mockResolvedValue(undefined),
      actions: {
        pin: jest.fn().mockResolvedValue(undefined),
        unpin: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
        rename: jest.fn().mockResolvedValue(undefined),
      },
      threads: [],
    });

    const { getByText } = renderWithProviders(<AmicusThreadListScreen />);

    expect(getByText('Your study conversations')).toBeTruthy();
    expect(
      getByText('Start from a chapter, save a question, or open a fresh study thread.'),
    ).toBeTruthy();
  });
});
