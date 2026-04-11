import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import CategoryCard from '@/components/lifetopics/CategoryCard';

describe('CategoryCard', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(
        <CategoryCard name="Relationships" topicCount={5} onPress={jest.fn()} />,
      );
    }).not.toThrow();
  });

  it('shows category name', () => {
    const { getByText } = renderWithProviders(
      <CategoryCard name="Faith" topicCount={3} onPress={jest.fn()} />,
    );
    expect(getByText('Faith')).toBeTruthy();
  });

  it('shows topic count with plural', () => {
    const { getByText } = renderWithProviders(
      <CategoryCard name="Faith" topicCount={5} onPress={jest.fn()} />,
    );
    expect(getByText('5 topics')).toBeTruthy();
  });

  it('shows topic count singular for 1', () => {
    const { getByText } = renderWithProviders(
      <CategoryCard name="Prayer" topicCount={1} onPress={jest.fn()} />,
    );
    expect(getByText('1 topic')).toBeTruthy();
  });

  it('shows icon when provided', () => {
    const { getByText } = renderWithProviders(
      <CategoryCard name="Love" icon="❤️" topicCount={2} onPress={jest.fn()} />,
    );
    expect(getByText('❤️')).toBeTruthy();
  });
});
