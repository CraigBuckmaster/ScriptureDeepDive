import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import TopicListItem from '@/components/lifetopics/TopicListItem';

describe('TopicListItem', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders title text', () => {
    const { getByText } = renderWithProviders(
      <TopicListItem title="Dealing with Grief" onPress={mockOnPress} />,
    );
    expect(getByText('Dealing with Grief')).toBeTruthy();
  });

  it('renders subtitle and category when provided', () => {
    const { getByText } = renderWithProviders(
      <TopicListItem
        title="Forgiveness"
        subtitle="How to forgive others"
        categoryName="Relationships"
        onPress={mockOnPress}
      />,
    );
    expect(getByText('How to forgive others')).toBeTruthy();
    expect(getByText('Relationships')).toBeTruthy();
  });
});
