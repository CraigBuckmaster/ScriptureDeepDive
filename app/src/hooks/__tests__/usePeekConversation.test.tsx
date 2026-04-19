/**
 * Tests for usePeekConversation — ephemeral peek-sheet chat state.
 *
 * streamChat is stubbed so the hook is exercised without network I/O.
 */
import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { AmicusError } from '@/services/amicus';
import type { streamChat as streamChatFn } from '@/services/amicus/chat';
import { usePeekConversation } from '@/hooks/usePeekConversation';

type StreamChatParams = Parameters<typeof streamChatFn>[0];

let lastStreamParams: StreamChatParams | null = null;
const mockStreamChat = jest.fn(async (params: StreamChatParams) => {
  lastStreamParams = params;
});

jest.mock('@/services/amicus/chat', () => ({
  streamChat: (p: StreamChatParams) => mockStreamChat(p),
}));

function Harness({
  onReady,
}: {
  onReady: (api: ReturnType<typeof usePeekConversation>) => void;
}) {
  const api = usePeekConversation({ getAuthToken: () => 'tok' });
  React.useEffect(() => {
    onReady(api);
  }, [api, onReady]);
  return <Text>{api.messages.length}</Text>;
}

function mount(): Promise<{
  api: () => ReturnType<typeof usePeekConversation>;
}> {
  let latest: ReturnType<typeof usePeekConversation> | null = null;
  render(<Harness onReady={(a) => (latest = a)} />);
  return Promise.resolve({ api: () => latest! });
}

describe('usePeekConversation', () => {
  beforeEach(() => {
    mockStreamChat.mockClear();
    lastStreamParams = null;
  });

  it('no-ops if text is empty', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('   ');
    });
    expect(mockStreamChat).not.toHaveBeenCalled();
    expect(api().messages).toHaveLength(0);
  });

  it('appends user + streaming assistant message when send() is called', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('what is grace?', { book_id: 'romans', chapter_num: 5 });
    });
    expect(mockStreamChat).toHaveBeenCalledTimes(1);
    expect(lastStreamParams?.userQuery).toBe('what is grace?');
    expect(lastStreamParams?.currentChapterRef).toEqual({
      book_id: 'romans',
      chapter_num: 5,
    });
    const msgs = api().messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[0]!.role).toBe('user');
    expect(msgs[0]!.content).toBe('what is grace?');
    expect(msgs[1]!.role).toBe('assistant');
    expect(msgs[1]!.isStreaming).toBe(true);
  });

  it('updates assistant content on onDelta and completes on onComplete', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('hi');
    });
    await act(async () => {
      lastStreamParams!.onDelta('Hello');
      lastStreamParams!.onDelta(' world.');
    });
    expect(api().messages[1]!.content).toBe('Hello world.');

    await act(async () => {
      lastStreamParams!.onComplete({
        prose: 'Hello world.',
        nodes: [{ type: 'text', text: 'Hello world.' }],
        citations: [
          {
            chunk_id: 'c1',
            source_type: 'section_panel',
            source_id: 'c1',
            display_label: 'Calvin',
            scholar_id: 'calvin',
          },
        ],
        follow_ups: ['Tell me more'],
        gap_signal: null,
      });
    });

    const last = api().messages[1]!;
    expect(last.content).toBe('Hello world.');
    expect(last.isStreaming).toBe(false);
    expect(last.citations).toHaveLength(1);
    expect(last.citations![0]!.chunk_id).toBe('c1');
    expect(last.follow_ups).toEqual(['Tell me more']);
    expect(api().isStreaming).toBe(false);
    expect(api().turnCount).toBe(1);
  });

  it('drops the streaming placeholder on onError and surfaces the error', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('hi');
    });
    await act(async () => {
      lastStreamParams!.onError(new AmicusError('OFFLINE', 'no net'));
    });
    expect(api().messages).toHaveLength(1);
    expect(api().messages[0]!.role).toBe('user');
    expect(api().error?.code).toBe('OFFLINE');
    expect(api().isStreaming).toBe(false);
  });

  it('clearError resets the error without dropping messages', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('hi');
    });
    await act(async () => {
      lastStreamParams!.onError(new AmicusError('OFFLINE', 'x'));
    });
    expect(api().error).not.toBeNull();
    await act(async () => {
      api().clearError();
    });
    expect(api().error).toBeNull();
  });

  it('reset clears messages and aborts any in-flight stream', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('hi');
    });
    expect(api().messages).toHaveLength(2);
    await act(async () => {
      api().reset();
    });
    expect(api().messages).toHaveLength(0);
    expect(api().isStreaming).toBe(false);
    expect(lastStreamParams!.signal.aborted).toBe(true);
  });

  it('snapshotForPromotion returns messages with isStreaming flags cleared', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('hi');
    });
    const snap = api().snapshotForPromotion();
    expect(snap).toHaveLength(2);
    for (const m of snap) {
      expect(m.isStreaming).toBe(false);
    }
  });

  it('sends prior conversation_history on subsequent sends', async () => {
    const { api } = await mount();
    await act(async () => {
      await api().send('first');
    });
    await act(async () => {
      lastStreamParams!.onComplete({
        prose: 'answer 1',
        nodes: [{ type: 'text', text: 'answer 1' }],
        citations: [],
        follow_ups: [],
        gap_signal: null,
      });
    });
    await act(async () => {
      await api().send('second');
    });
    expect(lastStreamParams!.conversationHistory).toEqual([
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'answer 1' },
    ]);
  });
});
