/**
 * TimelinePanel.test.tsx — Tests for the timeline event cards panel.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TimelinePanel } from '@/components/panels/TimelinePanel';
import type { TimelineEventEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const events: TimelineEventEntry[] = [
  { date: '~1446 BC', name: 'The Exodus', text: 'Israel leaves Egypt.', current: true },
  { date: '~1406 BC', name: 'Conquest of Canaan', text: 'Joshua leads Israel into the promised land.' },
];

describe('TimelinePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<TimelinePanel events={events} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders event names and dates', () => {
    const { getByText } = renderWithProviders(<TimelinePanel events={events} />);
    expect(getByText('The Exodus')).toBeTruthy();
    expect(getByText('~1446 BC')).toBeTruthy();
    expect(getByText('Conquest of Canaan')).toBeTruthy();
  });

  it('pressing an event name calls onEventPress', () => {
    const onEventPress = jest.fn();
    const { getByText } = renderWithProviders(
      <TimelinePanel events={events} onEventPress={onEventPress} />,
    );
    fireEvent.press(getByText('The Exodus'));
    expect(onEventPress).toHaveBeenCalledWith('The Exodus');
  });

  it('renders with empty events without crashing', () => {
    const { toJSON } = renderWithProviders(<TimelinePanel events={[]} />);
    expect(toJSON()).toBeTruthy();
  });
});
