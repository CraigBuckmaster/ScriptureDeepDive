import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import PeekMiniConversation, {
  PEEK_HANDOFF_THRESHOLD,
} from '@/components/amicus/PeekMiniConversation';
import { AmicusError } from '@/services/amicus';
import type { PeekMessage } from '@/hooks/usePeekConversation';

const NOOP = () => undefined;

function makeTurns(n: number): PeekMessage[] {
  const out: PeekMessage[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ role: 'user', content: `user ${i}` });
    out.push({
      role: 'assistant',
      content: `answer ${i}`,
      citations: [],
      follow_ups: [],
      isStreaming: false,
    });
  }
  return out;
}

describe('PeekMiniConversation', () => {
  it('renders user + assistant bubbles', () => {
    const { getByText } = renderWithProviders(
      <PeekMiniConversation
        messages={makeTurns(1)}
        isStreaming={false}
        turnCount={1}
        error={null}
        onDismissError={NOOP}
        onFollowUp={NOOP}
        onContinueInTab={NOOP}
      />,
    );
    expect(getByText('user 0')).toBeTruthy();
    expect(getByText(/answer 0/)).toBeTruthy();
  });

  it('hides the handoff CTA before the threshold is reached', () => {
    const { queryByLabelText } = renderWithProviders(
      <PeekMiniConversation
        messages={makeTurns(PEEK_HANDOFF_THRESHOLD - 1)}
        isStreaming={false}
        turnCount={PEEK_HANDOFF_THRESHOLD - 1}
        error={null}
        onDismissError={NOOP}
        onFollowUp={NOOP}
        onContinueInTab={NOOP}
      />,
    );
    expect(queryByLabelText('Continue in Amicus tab')).toBeNull();
  });

  it('shows the handoff CTA once the turn threshold is met and fires onContinueInTab', () => {
    const onContinueInTab = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PeekMiniConversation
        messages={makeTurns(PEEK_HANDOFF_THRESHOLD)}
        isStreaming={false}
        turnCount={PEEK_HANDOFF_THRESHOLD}
        error={null}
        onDismissError={NOOP}
        onFollowUp={NOOP}
        onContinueInTab={onContinueInTab}
      />,
    );
    const cta = getByLabelText('Continue in Amicus tab');
    fireEvent.press(cta);
    expect(onContinueInTab).toHaveBeenCalled();
  });

  it('shows "Saving…" and disables the CTA when handoff is in progress', () => {
    const onContinueInTab = jest.fn();
    const { getByLabelText, getByText } = renderWithProviders(
      <PeekMiniConversation
        messages={makeTurns(PEEK_HANDOFF_THRESHOLD)}
        isStreaming={false}
        turnCount={PEEK_HANDOFF_THRESHOLD}
        error={null}
        onDismissError={NOOP}
        onFollowUp={NOOP}
        onContinueInTab={onContinueInTab}
        handoffInProgress
      />,
    );
    expect(getByText(/Saving/)).toBeTruthy();
    fireEvent.press(getByLabelText('Continue in Amicus tab'));
    expect(onContinueInTab).not.toHaveBeenCalled();
  });

  it('renders follow-up chips after the final assistant message and forwards taps', () => {
    const msgs = makeTurns(1);
    msgs[1] = { ...msgs[1]!, follow_ups: ['Ask more about Calvin'] };
    const onFollowUp = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PeekMiniConversation
        messages={msgs}
        isStreaming={false}
        turnCount={1}
        error={null}
        onDismissError={NOOP}
        onFollowUp={onFollowUp}
        onContinueInTab={NOOP}
      />,
    );
    fireEvent.press(getByLabelText('Ask: Ask more about Calvin'));
    expect(onFollowUp).toHaveBeenCalledWith('Ask more about Calvin');
  });

  it('does not render follow-up chips while streaming', () => {
    const msgs = makeTurns(1);
    msgs[1] = { ...msgs[1]!, follow_ups: ['x'], isStreaming: true };
    const { queryByLabelText } = renderWithProviders(
      <PeekMiniConversation
        messages={msgs}
        isStreaming={true}
        turnCount={0}
        error={null}
        onDismissError={NOOP}
        onFollowUp={NOOP}
        onContinueInTab={NOOP}
      />,
    );
    expect(queryByLabelText('Ask: x')).toBeNull();
  });

  it('renders an error banner that calls onDismissError on press', () => {
    const onDismissError = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PeekMiniConversation
        messages={[]}
        isStreaming={false}
        turnCount={0}
        error={new AmicusError('OFFLINE', 'no net')}
        onDismissError={onDismissError}
        onFollowUp={NOOP}
        onContinueInTab={NOOP}
      />,
    );
    fireEvent.press(getByLabelText(/Amicus needs a connection.*dismiss/));
    expect(onDismissError).toHaveBeenCalled();
  });
});
