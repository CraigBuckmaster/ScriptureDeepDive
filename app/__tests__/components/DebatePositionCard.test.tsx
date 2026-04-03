import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DebatePositionCard } from '@/components/DebatePositionCard';

jest.mock('lucide-react-native', () => ({
  ChevronDown: () => null,
  ChevronUp: () => null,
}));

const samplePosition = {
  id: 'pos-1',
  label: 'Literal Days',
  tradition_family: 'evangelical',
  argument: 'The days of creation are literal 24-hour periods.',
  proponents: 'Henry Morris, Ken Ham',
  strengths: 'Plain reading of the text',
  weaknesses: 'Scientific evidence challenges this view',
  key_verses: ['Gen 1:5', 'Ex 20:11'],
  scholar_ids: ['morris'],
};

describe('DebatePositionCard', () => {
  it('renders position label', () => {
    const { getByText } = renderWithProviders(
      <DebatePositionCard position={samplePosition} />,
    );
    expect(getByText('Literal Days')).toBeTruthy();
  });

  it('renders tradition family text', () => {
    const { getByText } = renderWithProviders(
      <DebatePositionCard position={samplePosition} />,
    );
    expect(getByText(/evangelical/i)).toBeTruthy();
  });

  it('renders argument text', () => {
    const { getByText } = renderWithProviders(
      <DebatePositionCard position={samplePosition} />,
    );
    expect(getByText('The days of creation are literal 24-hour periods.')).toBeTruthy();
  });

  it('shows proponents text', () => {
    const { getByText } = renderWithProviders(
      <DebatePositionCard position={samplePosition} />,
    );
    expect(getByText(/Henry Morris, Ken Ham/)).toBeTruthy();
  });

  it('renders strengths and weaknesses when expanded', () => {
    const { getByText } = renderWithProviders(
      <DebatePositionCard position={samplePosition} defaultExpanded />,
    );
    expect(getByText(/Plain reading of the text/)).toBeTruthy();
    expect(getByText(/Scientific evidence challenges this view/)).toBeTruthy();
  });

  it('shows key verses when expanded', () => {
    const { getByText } = renderWithProviders(
      <DebatePositionCard position={samplePosition} defaultExpanded />,
    );
    expect(getByText('Gen 1:5')).toBeTruthy();
    expect(getByText('Ex 20:11')).toBeTruthy();
  });

  it('calls onVersePress when verse chip is pressed', () => {
    const mockVersePress = jest.fn();
    const { getByText } = renderWithProviders(
      <DebatePositionCard
        position={samplePosition}
        defaultExpanded
        onVersePress={mockVersePress}
      />,
    );
    fireEvent.press(getByText('Gen 1:5'));
    expect(mockVersePress).toHaveBeenCalledWith('Gen 1:5');
  });
});
