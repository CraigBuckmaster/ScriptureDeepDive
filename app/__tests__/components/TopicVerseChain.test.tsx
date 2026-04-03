import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TopicVerseChain } from '@/components/TopicVerseChain';

const mockVerses = [
  { ref: 'Psalm 103:12', text: 'As far as the east is from the west...', note: 'Distance metaphor' },
  { ref: 'Isaiah 1:18', text: 'Though your sins are like scarlet...', note: 'Color transformation' },
  { ref: '1 John 1:9', text: 'If we confess our sins...' },
];

describe('TopicVerseChain', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <TopicVerseChain verses={mockVerses} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('displays all verse references', () => {
    const { getByText } = renderWithProviders(
      <TopicVerseChain verses={mockVerses} />,
    );
    expect(getByText('Psalm 103:12')).toBeTruthy();
    expect(getByText('Isaiah 1:18')).toBeTruthy();
    expect(getByText('1 John 1:9')).toBeTruthy();
  });

  it('displays verse text', () => {
    const { getByText } = renderWithProviders(
      <TopicVerseChain verses={mockVerses} />,
    );
    expect(getByText(/As far as the east/)).toBeTruthy();
  });

  it('displays annotations when present', () => {
    const { getByText } = renderWithProviders(
      <TopicVerseChain verses={mockVerses} />,
    );
    expect(getByText('Distance metaphor')).toBeTruthy();
    expect(getByText('Color transformation')).toBeTruthy();
  });

  it('fires onVersePress when reference is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <TopicVerseChain verses={mockVerses} onVersePress={onPress} />,
    );
    fireEvent.press(getByText('Psalm 103:12'));
    expect(onPress).toHaveBeenCalledWith('Psalm 103:12');
  });

  it('handles empty verses array', () => {
    const { toJSON } = renderWithProviders(
      <TopicVerseChain verses={[]} />,
    );
    expect(toJSON()).toBeNull();
  });
});
