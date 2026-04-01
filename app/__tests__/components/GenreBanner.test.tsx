import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GenreBanner } from '@/components/GenreBanner';

describe('GenreBanner', () => {
  it('renders genre label', () => {
    const { getByText } = render(
      <GenreBanner genreLabel="Narrative" genreGuidance="Focus on the story arc." />,
    );
    expect(getByText(/narrative/i)).toBeTruthy();
  });

  it('renders genre guidance', () => {
    const { getByText } = render(
      <GenreBanner genreLabel="Narrative" genreGuidance="Focus on the story arc." />,
    );
    expect(getByText('Focus on the story arc.')).toBeTruthy();
  });

  it('can be dismissed', () => {
    const { getByText, queryByText } = render(
      <GenreBanner genreLabel="Narrative" genreGuidance="Focus on the story arc." />,
    );
    fireEvent.press(getByText('✕'));
    expect(queryByText('Focus on the story arc.')).toBeNull();
  });
});
