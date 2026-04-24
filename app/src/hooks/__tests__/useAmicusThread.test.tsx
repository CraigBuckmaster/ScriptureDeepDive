import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import type { streamChat as streamChatFn } from '@/services/amicus/chat';
import { useAmicusThread } from '@/hooks/useAmicusThread';

type StreamChatParams = Parameters<typeof streamChatFn>[0];

const mockListAmicusMessages = jest.fn(async (_threadId: string) => []);
const mockAppendAmicusMessage = jest.fn(async (_args: unknown) => undefined);
const mockIncrementAmicusUsage = jest.fn(async () => undefined);

let lastStreamParams: StreamChatParams | null = null;
const mockStreamChat = jest.fn(async (params: StreamChatParams) => {
  lastStreamParams = params;
});

jest.mock('@/db/userQueries', () => ({
  listAmicusMessages: (threadId: string) => mockListAmicusMessages(threadId),
}));

jest.mock('@/db/userMutations', () => ({
  appendAmicusMessage: (args: unknown) => mockAppendAmicusMessage(args),
  incrementAmicusUsage: () => mockIncrementAmicusUsage(),
}));

jest.mock('@/services/amicus/chat', () => ({
  streamChat: (params: StreamChatParams) => mockStreamChat(params),
}));

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useAmicusThread>) => void }) {
  const api = useAmicusThread('thread-ctx-test', {
    context: {
      entryPoint: 'thread',
      routeContext: {
        kind: 'chapter',
        bookId: 'john',
        chapterNum: 3,
      },
      chapterRef: {
        book_id: 'john',
        chapter_num: 3,
      },
      sessionId: null,
      guidedStudyStep: null,
      openQuestionId: null,
      openQuestionText: null,
      takeaway: null,
      keyConnection: null,
    },
  });

  React.useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return <Text>{api.messages.length}</Text>;
}

function mount(): Promise<{
  api: () => ReturnType<typeof useAmicusThread>;
}> {
  let latest: ReturnType<typeof useAmicusThread> | null = null;
  render(<Harness onReady={(api) => (latest = api)} />);
  return Promise.resolve({ api: () => latest! });
}

describe('useAmicusThread', () => {
  beforeEach(() => {
    mockListAmicusMessages.mockClear();
    mockAppendAmicusMessage.mockClear();
    mockIncrementAmicusUsage.mockClear();
    mockStreamChat.mockClear();
    lastStreamParams = null;
  });

  it('passes the shared chapter context into streamChat', async () => {
    const { api } = await mount();

    await act(async () => {
      await api().sendMessage('What is born again?', 'token-123');
    });

    expect(mockStreamChat).toHaveBeenCalledTimes(1);
    expect(lastStreamParams?.currentChapterRef).toEqual({
      book_id: 'john',
      chapter_num: 3,
    });
  });
});
