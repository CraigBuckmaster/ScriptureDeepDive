import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import InputBar from '@/components/amicus/InputBar';

describe('InputBar', () => {
  it('disables send button when text is empty', () => {
    const onSend = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <InputBar isStreaming={false} onSend={onSend} onAbort={() => undefined} />,
    );
    const send = getByLabelText('Send');
    fireEvent.press(send);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends the typed text when send is pressed', () => {
    const onSend = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <InputBar isStreaming={false} onSend={onSend} onAbort={() => undefined} />,
    );
    fireEvent.changeText(getByLabelText('Message Amicus'), 'What is grace?');
    fireEvent.press(getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledWith('What is grace?');
  });

  it('shows Stop button while streaming and invokes abort', () => {
    const onAbort = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <InputBar isStreaming={true} onSend={() => undefined} onAbort={onAbort} />,
    );
    fireEvent.press(getByLabelText('Stop streaming'));
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  it('enforces 2000-char cap', () => {
    const onSend = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <InputBar isStreaming={false} onSend={onSend} onAbort={() => undefined} />,
    );
    const huge = 'x'.repeat(3000);
    fireEvent.changeText(getByLabelText('Message Amicus'), huge);
    fireEvent.press(getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledTimes(1);
    const arg = onSend.mock.calls[0]?.[0] as string;
    expect(arg.length).toBeLessThanOrEqual(2000);
  });
});
