import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { StoryPicker, placeCount } from '@/components/map/StoryPicker';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { MapStory, Place } from '@/types';

beforeEach(() => jest.clearAllMocks());

const stories: MapStory[] = [
  {
    id: 's1',
    era: 'patriarchs',
    name: 'Abraham Journey',
    scripture_ref: null,
    chapter_link: null,
    summary: '',
    places_json: null,
    regions_json: null,
    paths_json: null,
  },
  {
    id: 's2',
    era: 'exodus',
    name: 'The Exodus',
    scripture_ref: null,
    chapter_link: null,
    summary: '',
    places_json: null,
    regions_json: null,
    paths_json: null,
  },
];

describe('StoryPicker', () => {
  it('renders all story options', () => {
    const { getByText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={jest.fn()} />,
    );
    expect(getByText('Abraham Journey')).toBeTruthy();
    expect(getByText('The Exodus')).toBeTruthy();
  });

  it('shows empty state when no stories are provided', () => {
    const { getByText } = renderWithProviders(
      <StoryPicker stories={[]} activeStoryId={null} onSelect={jest.fn()} />,
    );
    expect(getByText('No stories for this era')).toBeTruthy();
  });

  it('calls onSelect with the story id when a story is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={onSelect} />,
    );
    fireEvent.press(getByText('Abraham Journey'));
    expect(onSelect).toHaveBeenCalledWith('s1');
  });

  it('triggers haptic feedback on press', () => {
    const { lightImpact } = require('@/utils/haptics');
    const { getByText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={jest.fn()} />,
    );
    fireEvent.press(getByText('The Exodus'));
    expect(lightImpact).toHaveBeenCalled();
  });

  it('visually distinguishes the active story', () => {
    const { getByText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId="s1" onSelect={jest.fn()} />,
    );
    const activeChip = getByText('Abraham Journey');
    expect(activeChip).toBeTruthy();
    expect(getByText('The Exodus')).toBeTruthy();
  });

  it('exposes a "Browse all stories" toggle', () => {
    const { getByLabelText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={jest.fn()} />,
    );
    expect(getByLabelText('Browse all stories')).toBeTruthy();
  });

  it('expands into the grid when the browse toggle is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={jest.fn()} />,
    );
    fireEvent.press(getByLabelText('Browse all stories'));
    // Grid renders an "Open story ..." labelled card for each story.
    expect(getByLabelText(/Open story Abraham Journey/)).toBeTruthy();
    expect(getByLabelText(/Open story The Exodus/)).toBeTruthy();
  });

  it('collapses back to the strip when the close toggle is pressed', () => {
    const { getByLabelText, queryByLabelText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={jest.fn()} />,
    );
    fireEvent.press(getByLabelText('Browse all stories'));
    expect(getByLabelText(/Open story Abraham Journey/)).toBeTruthy();
    fireEvent.press(getByLabelText('Collapse story browser'));
    expect(queryByLabelText(/Open story Abraham Journey/)).toBeNull();
  });

  it('selecting a story from the grid bubbles the id and collapses', () => {
    const onSelect = jest.fn();
    const { getByLabelText, queryByLabelText } = renderWithProviders(
      <StoryPicker stories={stories} activeStoryId={null} onSelect={onSelect} />,
    );
    fireEvent.press(getByLabelText('Browse all stories'));
    fireEvent.press(getByLabelText(/Open story The Exodus/));
    expect(onSelect).toHaveBeenCalledWith('s2');
    // Grid closed → no more "Open story" label.
    expect(queryByLabelText(/Open story Abraham Journey/)).toBeNull();
  });

  it('shows place counts in the grid when places are provided', () => {
    const places: Place[] = [
      {
        id: 'jerusalem', ancient_name: 'Jerusalem', modern_name: null,
        latitude: 0, longitude: 0, type: 'city', priority: 1, label_dir: 'n',
      },
    ];
    const enriched: MapStory[] = [
      { ...stories[0], places_json: '["jerusalem","bethlehem"]' },
      { ...stories[1], places_json: '["jerusalem"]' },
    ];
    const { getByLabelText, getByText } = renderWithProviders(
      <StoryPicker
        stories={enriched}
        activeStoryId={null}
        onSelect={jest.fn()}
        places={places}
      />,
    );
    fireEvent.press(getByLabelText('Browse all stories'));
    expect(getByText('2 places')).toBeTruthy();
    expect(getByText('1 place')).toBeTruthy();
  });
});

describe('placeCount', () => {
  function story(places_json: string | null): MapStory {
    return {
      id: 'x', era: 'patriarchs', name: 'X', scripture_ref: null,
      chapter_link: null, summary: '', places_json,
      regions_json: null, paths_json: null,
    };
  }

  it('returns 0 for null/empty/malformed JSON', () => {
    expect(placeCount(story(null))).toBe(0);
    expect(placeCount(story('not-json'))).toBe(0);
    expect(placeCount(story(''))).toBe(0);
  });

  it('returns the array length', () => {
    expect(placeCount(story('["a","b","c"]'))).toBe(3);
  });
});
