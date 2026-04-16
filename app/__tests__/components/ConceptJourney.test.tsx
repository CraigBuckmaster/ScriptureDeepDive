import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ConceptJourney, { type JourneyStop } from '@/components/ConceptJourney';

const makeStops = (): JourneyStop[] => [
  {
    ref: 'Gen 3:15',
    book: 'Genesis',
    chapter: 3,
    label: 'Protoevangelium',
    development: 'First hint of a coming deliverer.',
    what_changes: 'Introduces the seed promise.',
  },
  {
    ref: 'Isa 53:5',
    book: 'Isaiah',
    chapter: 53,
    label: 'Suffering Servant',
    development: 'The deliverer will suffer.',
    what_changes: 'Adds vicarious atonement.',
  },
];

describe('ConceptJourney', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <ConceptJourney stops={makeStops()} onNavigate={jest.fn()} />,
    );
    expect(getByText('Gen 3:15')).toBeTruthy();
  });

  it('returns null when stops is empty', () => {
    const { toJSON } = renderWithProviders(
      <ConceptJourney stops={[]} onNavigate={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders all stops with labels and development text', () => {
    const { getByText } = renderWithProviders(
      <ConceptJourney stops={makeStops()} onNavigate={jest.fn()} />,
    );
    expect(getByText('Protoevangelium')).toBeTruthy();
    expect(getByText('Suffering Servant')).toBeTruthy();
    expect(getByText('Introduces the seed promise.')).toBeTruthy();
  });

  it('calls onNavigate with book, chapter, and verseNum when a card is pressed', () => {
    const onNavigate = jest.fn();
    const { getByText } = renderWithProviders(
      <ConceptJourney stops={makeStops()} onNavigate={onNavigate} />,
    );
    fireEvent.press(getByText('Protoevangelium'));
    expect(onNavigate).toHaveBeenCalledWith('Genesis', 3, 15);
  });
});
