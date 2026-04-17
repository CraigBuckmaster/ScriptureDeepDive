import { act, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { getMockDb, resetMockDb } from '../../../../__tests__/helpers/mockDb';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import AmicusPeekSheet from '@/components/amicus/AmicusPeekSheet';

jest.mock('@/db/database', () =>
  require('../../../../__tests__/helpers/mockDb').mockDatabaseModule(),
);

type StreamChatParams = Parameters<
  typeof import('@/services/amicus/chat').streamChat
>[0];
let lastStreamParams: StreamChatParams | null = null;
const mockStreamChat = jest.fn(async (params: StreamChatParams) => {
  lastStreamParams = params;
});
jest.mock('@/services/amicus/chat', () => ({
  streamChat: (p: StreamChatParams) => mockStreamChat(p),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigationState: () => ({ routes: [{ name: 'HomeMain' }], index: 0 }),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const BottomSheet = ({ children }: { children: React.ReactNode }) => (
    <View accessibilityLabel="bottom-sheet">{children}</View>
  );
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetView: View,
    BottomSheetBackdrop: View,
  };
});

beforeEach(() => {
  resetMockDb();
  mockStreamChat.mockClear();
  lastStreamParams = null;
  process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN = 'tok';
});

async function completeTurn(prose: string): Promise<void> {
  await act(async () => {
    lastStreamParams!.onComplete({
      prose,
      nodes: [{ type: 'text', text: prose }],
      citations: [],
      follow_ups: [],
      gap_signal: null,
    });
  });
}

type GetByLabelText = ReturnType<typeof renderWithProviders>['getByLabelText'];

async function sendFromInput(
  getByLabelText: GetByLabelText,
  text: string,
): Promise<void> {
  await act(async () => {
    fireEvent.changeText(getByLabelText('Message Amicus from peek'), text);
  });
  await act(async () => {
    fireEvent.press(getByLabelText('Send'));
  });
}

describe('AmicusPeekSheet', () => {
  it('renders chips from the precached_prompts table', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'Why does Paul use this metaphor',
          seed_query: 'Explain the metaphor.',
          expected_source_types: ['chapter_panel'],
        },
      ]),
    });
    const { findByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'chapter', bookId: 'romans', chapterNum: 9 }}
      />,
    );
    expect(
      await findByLabelText('Ask: Why does Paul use this metaphor'),
    ).toBeTruthy();
  });

  it('fires onChipTap with the seed_query when a chip is pressed', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'What does chesed mean in the Psalms',
          seed_query: 'Explain hesed in the Psalms.',
          expected_source_types: ['word_study'],
        },
      ]),
    });
    const onChipTap = jest.fn();
    const { findByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'chapter', bookId: 'psalms', chapterNum: 23 }}
        onChipTap={onChipTap}
      />,
    );
    fireEvent.press(
      await findByLabelText('Ask: What does chesed mean in the Psalms'),
    );
    expect(onChipTap).toHaveBeenCalledWith('Explain hesed in the Psalms.');
  });

  it('calls onSend with trimmed free text', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const onSend = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'none' }}
        onSend={onSend}
      />,
    );
    fireEvent.changeText(getByLabelText('Message Amicus from peek'), '  what is grace?  ');
    fireEvent.press(getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledWith('what is grace?');
  });

  it('starts a mini-conversation when a chip is tapped and streams the reply', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'Explain hesed',
          seed_query: 'What is hesed?',
          expected_source_types: ['word_study'],
        },
      ]),
    });
    const { findByLabelText, findByText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'chapter', bookId: 'psalms', chapterNum: 23 }}
      />,
    );
    fireEvent.press(await findByLabelText('Ask: Explain hesed'));
    expect(mockStreamChat).toHaveBeenCalled();
    expect(lastStreamParams!.userQuery).toBe('What is hesed?');
    expect(lastStreamParams!.currentChapterRef).toEqual({
      book_id: 'psalms',
      chapter_num: 23,
    });
    await act(async () => {
      lastStreamParams!.onDelta('Hesed is ');
      lastStreamParams!.onDelta('covenant love.');
    });
    expect(await findByText(/covenant love/)).toBeTruthy();
  });

  it('invokes onContinueInTab with a snapshot and closes the peek on success', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'Explain hesed',
          seed_query: 'What is hesed?',
          expected_source_types: ['word_study'],
        },
      ]),
    });
    const onContinueInTab = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    const { findByLabelText, getByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={onClose}
        contextOverride={{ kind: 'chapter', bookId: 'psalms', chapterNum: 23 }}
        onContinueInTab={onContinueInTab}
      />,
    );
    // Ramp up to three completed turns so the CTA appears.
    fireEvent.press(await findByLabelText('Ask: Explain hesed'));
    await completeTurn('answer 0');
    await sendFromInput(getByLabelText, 'follow up 1');
    await completeTurn('answer 1');
    await sendFromInput(getByLabelText, 'follow up 2');
    await completeTurn('answer 2');
    const cta = await findByLabelText('Continue in Amicus tab');
    await act(async () => {
      fireEvent.press(cta);
    });
    expect(onContinueInTab).toHaveBeenCalledTimes(1);
    const snapshot = onContinueInTab.mock.calls[0]![0];
    expect(Array.isArray(snapshot)).toBe(true);
    expect(snapshot.every((m: { isStreaming?: boolean }) => !m.isStreaming)).toBe(true);
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the peek open and surfaces an error banner when the handoff fails', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'Explain hesed',
          seed_query: 'What is hesed?',
          expected_source_types: ['word_study'],
        },
      ]),
    });
    const onContinueInTab = jest
      .fn()
      .mockRejectedValue(new Error('disk full'));
    const onClose = jest.fn();
    const { findByLabelText, findByText, getByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={onClose}
        contextOverride={{ kind: 'chapter', bookId: 'psalms', chapterNum: 23 }}
        onContinueInTab={onContinueInTab}
      />,
    );
    fireEvent.press(await findByLabelText('Ask: Explain hesed'));
    await completeTurn('answer 0');
    await sendFromInput(getByLabelText, 'follow up 1');
    await completeTurn('answer 1');
    await sendFromInput(getByLabelText, 'follow up 2');
    await completeTurn('answer 2');
    const cta = await findByLabelText('Continue in Amicus tab');
    await act(async () => {
      fireEvent.press(cta);
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(await findByText(/Couldn't save conversation/)).toBeTruthy();
  });

  it('ignores double-taps while handoff is in progress', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'Explain hesed',
          seed_query: 'What is hesed?',
          expected_source_types: ['word_study'],
        },
      ]),
    });
    let release!: () => void;
    const pending = new Promise<void>((r) => {
      release = r;
    });
    const onContinueInTab = jest.fn().mockReturnValue(pending);
    const { findByLabelText, getByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'chapter', bookId: 'psalms', chapterNum: 23 }}
        onContinueInTab={onContinueInTab}
      />,
    );
    fireEvent.press(await findByLabelText('Ask: Explain hesed'));
    await completeTurn('a0');
    await sendFromInput(getByLabelText, 'follow up 1');
    await completeTurn('a1');
    await sendFromInput(getByLabelText, 'follow up 2');
    await completeTurn('a2');
    const cta = await findByLabelText('Continue in Amicus tab');
    fireEvent.press(cta);
    fireEvent.press(cta);
    fireEvent.press(cta);
    expect(onContinueInTab).toHaveBeenCalledTimes(1);
    await act(async () => {
      release();
      await pending;
    });
  });

  it('returns nothing when isOpen is false', () => {
    const { toJSON } = renderWithProviders(
      <AmicusPeekSheet
        isOpen={false}
        onClose={() => undefined}
        contextOverride={{ kind: 'none' }}
      />,
    );
    expect(toJSON()).toBeNull();
  });
});
