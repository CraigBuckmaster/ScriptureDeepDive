import React from 'react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import UserMessageBubble from '@/components/amicus/UserMessageBubble';

describe('UserMessageBubble', () => {
  it('renders its content', () => {
    const { getByText } = renderWithProviders(
      <UserMessageBubble content="Tell me about hesed" />,
    );
    expect(getByText('Tell me about hesed')).toBeTruthy();
  });
});
