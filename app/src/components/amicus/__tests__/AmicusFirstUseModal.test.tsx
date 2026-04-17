import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import AmicusFirstUseModal from '@/components/amicus/AmicusFirstUseModal';

describe('AmicusFirstUseModal', () => {
  it('renders all required disclosure copy when visible', () => {
    const { getByText } = renderWithProviders(
      <AmicusFirstUseModal
        visible
        onAccept={() => undefined}
        onDecline={() => undefined}
      />,
    );
    expect(getByText('Meet Amicus')).toBeTruthy();
    expect(getByText('What stays on your device')).toBeTruthy();
    expect(
      getByText(/What gets sent to our AI provider when you ask a question/),
    ).toBeTruthy();
    expect(getByText(/zero-retention commitment/)).toBeTruthy();
  });

  it('invokes onAccept on primary button tap', () => {
    const onAccept = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AmicusFirstUseModal
        visible
        onAccept={onAccept}
        onDecline={() => undefined}
      />,
    );
    fireEvent.press(getByLabelText("I understand, let's begin"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('invokes onDecline on "Not now" tap', () => {
    const onDecline = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AmicusFirstUseModal
        visible
        onAccept={() => undefined}
        onDecline={onDecline}
      />,
    );
    fireEvent.press(getByLabelText('Not now'));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <AmicusFirstUseModal
        visible={false}
        onAccept={() => undefined}
        onDecline={() => undefined}
      />,
    );
    // Modal component may not render content to the tree when visible=false.
    expect(queryByText('Meet Amicus')).toBeNull();
  });
});
