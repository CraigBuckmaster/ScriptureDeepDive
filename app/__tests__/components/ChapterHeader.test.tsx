/**
 * ChapterHeader.test.tsx — Tests for the chapter header component.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ChapterHeader } from '@/components/ChapterHeader';
import type { Chapter } from '@/types';

const baseChapter: Chapter = {
  id: 'ch-1',
  book_id: 'gen',
  chapter_num: 1,
  title: 'Creation',
  subtitle: 'The seven days',
  timeline_link_event: null,
  timeline_link_text: null,
  map_story_link_id: null,
  map_story_link_text: null,
  coaching_json: null,
};

describe('ChapterHeader', () => {
  it('renders title and subtitle', () => {
    const { getByText } = renderWithProviders(
      <ChapterHeader chapter={baseChapter} noteCount={0} onNotesPress={jest.fn()} />,
    );
    expect(getByText('Creation')).toBeTruthy();
    expect(getByText('The seven days')).toBeTruthy();
  });

  it('renders timeline link pill when timeline_link_text is provided', () => {
    const chapter: Chapter = { ...baseChapter, timeline_link_text: 'Day 1 Event' };
    const onTimelinePress = jest.fn();
    const { getByText } = renderWithProviders(
      <ChapterHeader chapter={chapter} noteCount={0} onNotesPress={jest.fn()} onTimelinePress={onTimelinePress} />,
    );
    const pill = getByText('Day 1 Event');
    expect(pill).toBeTruthy();
    fireEvent.press(pill);
    expect(onTimelinePress).toHaveBeenCalled();
  });

  it('renders map link pill when map_story_link_text is provided', () => {
    const chapter: Chapter = { ...baseChapter, map_story_link_text: 'Eden Region' };
    const onMapPress = jest.fn();
    const { getByText } = renderWithProviders(
      <ChapterHeader chapter={chapter} noteCount={0} onNotesPress={jest.fn()} onMapPress={onMapPress} />,
    );
    const pill = getByText('Eden Region');
    expect(pill).toBeTruthy();
    fireEvent.press(pill);
    expect(onMapPress).toHaveBeenCalled();
  });

  it('falls back to "Chapter N" when title is null', () => {
    const chapter: Chapter = { ...baseChapter, title: null };
    const { getByText } = renderWithProviders(
      <ChapterHeader chapter={chapter} noteCount={0} onNotesPress={jest.fn()} />,
    );
    expect(getByText('Chapter 1')).toBeTruthy();
  });
});
