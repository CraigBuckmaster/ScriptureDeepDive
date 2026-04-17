import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import AssistantMessageBubble from '@/components/amicus/AssistantMessageBubble';
import type { AmicusCitation } from '@/types';

const citations: AmicusCitation[] = [
  {
    chunk_id: 'section_panel:romans-9-s1-calvin',
    source_type: 'section_panel',
    display_label: 'Calvin · Romans 9',
    scholar_id: 'calvin',
  },
];

describe('AssistantMessageBubble', () => {
  it('renders interleaved prose and citation pills', () => {
    const content =
      'Calvin [CITE:section_panel:romans-9-s1-calvin] emphasizes election.';
    const { getByText, getByLabelText } = renderWithProviders(
      <AssistantMessageBubble
        content={content}
        citations={citations}
        isStreaming={false}
      />,
    );
    expect(getByText(/emphasizes election/)).toBeTruthy();
    expect(getByLabelText('Open source: Calvin · Romans 9')).toBeTruthy();
  });

  it('forwards citation taps with the full citation object', () => {
    const onCitationPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AssistantMessageBubble
        content="See [CITE:section_panel:romans-9-s1-calvin]"
        citations={citations}
        isStreaming={false}
        onCitationPress={onCitationPress}
      />,
    );
    fireEvent.press(getByLabelText('Open source: Calvin · Romans 9'));
    expect(onCitationPress).toHaveBeenCalledWith(citations[0]);
  });

  it('renders without the streaming dot when not streaming', () => {
    const { queryByLabelText } = renderWithProviders(
      <AssistantMessageBubble
        content="plain"
        citations={[]}
        isStreaming={false}
      />,
    );
    expect(queryByLabelText('Amicus is responding')).toBeNull();
  });
});
