import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import SubmissionCard from '@/components/lifetopics/SubmissionCard';

describe('SubmissionCard', () => {
  const mockOnPress = jest.fn();

  it('renders title and author', () => {
    const { getByText } = renderWithProviders(
      <SubmissionCard
        title="My Insight"
        authorName="John Doe"
        excerpt="Some excerpt text"
        upvoteCount={5}
        starAvg={4.2}
        onPress={mockOnPress}
      />,
    );
    expect(getByText('My Insight')).toBeTruthy();
    expect(getByText('by John Doe')).toBeTruthy();
  });

  it('shows upvote count and star average', () => {
    const { getByText } = renderWithProviders(
      <SubmissionCard
        title="Title"
        authorName="Author"
        excerpt="Text"
        upvoteCount={12}
        starAvg={3.5}
        onPress={mockOnPress}
      />,
    );
    expect(getByText('12')).toBeTruthy();
    expect(getByText('3.5')).toBeTruthy();
  });
});
