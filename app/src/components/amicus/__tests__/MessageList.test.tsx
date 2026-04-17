import React from 'react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import MessageList from '@/components/amicus/MessageList';
import type { AmicusMessage } from '@/types';

function mkMessage(partial: Partial<AmicusMessage>): AmicusMessage {
  return {
    message_id: 'm1',
    thread_id: 't1',
    role: 'user',
    content: '',
    citations: [],
    follow_ups: [],
    created_at: '2026-04-17',
    ...partial,
  };
}

describe('MessageList', () => {
  it('renders the empty-state prompt when there are no messages', () => {
    const { getByText } = renderWithProviders(
      <MessageList messages={[]} isStreaming={false} />,
    );
    expect(getByText('Ask Amicus anything.')).toBeTruthy();
  });

  it('renders user and assistant bubbles', () => {
    const messages = [
      mkMessage({ message_id: 'u1', role: 'user', content: 'What is hesed?' }),
      mkMessage({
        message_id: 'a1',
        role: 'assistant',
        content: 'Hesed is covenant faithfulness.',
      }),
    ];
    const { getByText } = renderWithProviders(
      <MessageList messages={messages} isStreaming={false} />,
    );
    expect(getByText('What is hesed?')).toBeTruthy();
    expect(getByText(/covenant faithfulness/)).toBeTruthy();
  });

  it('renders follow-up chips when the last assistant message has them', () => {
    const onFollowUp = jest.fn();
    const messages = [
      mkMessage({
        message_id: 'a1',
        role: 'assistant',
        content: 'Answer.',
        follow_ups: ['Ask me more'],
      }),
    ];
    const { getByLabelText } = renderWithProviders(
      <MessageList messages={messages} isStreaming={false} onFollowUp={onFollowUp} />,
    );
    expect(getByLabelText('Ask: Ask me more')).toBeTruthy();
  });

  it('hides follow-ups while streaming', () => {
    const messages = [
      mkMessage({
        message_id: 'a1',
        role: 'assistant',
        content: 'Streaming…',
        follow_ups: ['one'],
      }),
    ];
    const { queryByLabelText } = renderWithProviders(
      <MessageList messages={messages} isStreaming={true} onFollowUp={() => undefined} />,
    );
    expect(queryByLabelText('Ask: one')).toBeNull();
  });
});
