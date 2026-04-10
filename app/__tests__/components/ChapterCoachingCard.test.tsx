import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ChapterCoachingCard } from '@/components/ChapterCoachingCard';

describe('ChapterCoachingCard', () => {
  const fullCoaching = {
    questions: ['What is the significance of creation?', 'Why does God rest on day 7?'],
    observations: ['The text uses parallel structure.', 'Light is created before the sun.'],
    reflections: ['Consider how creation reveals God\'s character.'],
    cross_refs: ['Psalm 104:1-5', 'John 1:1-3'],
  };

  const emptyCoaching = {
    questions: [],
    observations: [],
    reflections: [],
    cross_refs: [],
  };

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ChapterCoachingCard coaching={fullCoaching} />);
    }).not.toThrow();
  });

  it('returns null when no content', () => {
    const { toJSON } = renderWithProviders(
      <ChapterCoachingCard coaching={emptyCoaching} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows Study Guide header', () => {
    const { getByText } = renderWithProviders(
      <ChapterCoachingCard coaching={fullCoaching} />,
    );
    expect(getByText('Study Guide')).toBeTruthy();
  });

  it('is collapsed initially', () => {
    const { queryByText } = renderWithProviders(
      <ChapterCoachingCard coaching={fullCoaching} />,
    );
    // Questions should not be visible when collapsed
    expect(queryByText('STUDY QUESTIONS')).toBeNull();
  });

  it('expands on header press to show content', () => {
    const { getByLabelText, getByText } = renderWithProviders(
      <ChapterCoachingCard coaching={fullCoaching} />,
    );

    fireEvent.press(getByLabelText(/Study Guide/));

    expect(getByText('KEY OBSERVATIONS')).toBeTruthy();
    expect(getByText('STUDY QUESTIONS')).toBeTruthy();
    expect(getByText('REFLECTIONS')).toBeTruthy();
  });

  it('shows cross references when expanded with onRefPress', () => {
    const onRefPress = jest.fn();
    const { getByLabelText, getByText } = renderWithProviders(
      <ChapterCoachingCard coaching={fullCoaching} onRefPress={onRefPress} />,
    );

    fireEvent.press(getByLabelText(/Study Guide/));
    expect(getByText('EXPLORE FURTHER')).toBeTruthy();
    expect(getByText('Psalm 104:1-5')).toBeTruthy();
  });
});
