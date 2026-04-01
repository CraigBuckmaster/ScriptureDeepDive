import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { StoryPicker } from '@/components/map/StoryPicker';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { MapStory } from '@/types';

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
});
