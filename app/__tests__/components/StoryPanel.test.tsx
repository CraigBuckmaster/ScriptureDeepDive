import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { StoryPanel } from '@/components/map/StoryPanel';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { MapStory, Place } from '@/types';

beforeEach(() => jest.clearAllMocks());

const places: Place[] = [
  {
    id: 'jerusalem',
    ancient_name: 'Jerusalem',
    modern_name: 'Yerushalayim',
    latitude: 31.77,
    longitude: 35.23,
    type: 'city',
    priority: 1,
    label_dir: 'n',
  },
  {
    id: 'bethlehem',
    ancient_name: 'Bethlehem',
    modern_name: 'Beit Lehem',
    latitude: 31.7,
    longitude: 35.2,
    type: 'city',
    priority: 1,
    label_dir: 'n',
  },
];

const story: MapStory = {
  id: 's1',
  era: 'patriarchs',
  name: 'The Exodus',
  scripture_ref: 'Exodus 12-14',
  chapter_link: 'exodus-12',
  summary: 'The departure from Egypt.',
  places_json: JSON.stringify(['jerusalem', 'bethlehem']),
  regions_json: null,
  paths_json: null,
};

const defaultProps = {
  story,
  places,
  showModern: false,
  onPlaceTap: jest.fn(),
  onChapterPress: jest.fn(),
  onClose: jest.fn(),
};

describe('StoryPanel', () => {
  it('renders the story name and summary', () => {
    const { getByText } = renderWithProviders(
      <StoryPanel {...defaultProps} />,
    );
    expect(getByText('The Exodus')).toBeTruthy();
    expect(getByText('The departure from Egypt.')).toBeTruthy();
  });

  it('renders the scripture reference', () => {
    const { getByText } = renderWithProviders(
      <StoryPanel {...defaultProps} />,
    );
    expect(getByText('Exodus 12-14')).toBeTruthy();
  });

  it('renders key place chips with ancient names', () => {
    const { getByText } = renderWithProviders(
      <StoryPanel {...defaultProps} />,
    );
    expect(getByText('Jerusalem')).toBeTruthy();
    expect(getByText('Bethlehem')).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <StoryPanel {...defaultProps} onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close panel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onChapterPress when the chapter link is tapped', () => {
    const onChapterPress = jest.fn();
    const { getByText } = renderWithProviders(
      <StoryPanel {...defaultProps} onChapterPress={onChapterPress} />,
    );
    fireEvent.press(getByText('Read in Companion Study →'));
    expect(onChapterPress).toHaveBeenCalledTimes(1);
  });
});
