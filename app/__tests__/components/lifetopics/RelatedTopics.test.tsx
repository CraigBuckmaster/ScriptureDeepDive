import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import RelatedTopics from '@/components/lifetopics/RelatedTopics';

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const RN = require('react-native');
    return <RN.Text>{label}</RN.Text>;
  },
}));

describe('RelatedTopics', () => {
  const topics = [
    { id: 'forgiveness', title: 'Forgiveness' },
    { id: 'grace', title: 'Grace' },
  ] as any[];

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<RelatedTopics topics={topics} onPress={jest.fn()} />);
    }).not.toThrow();
  });

  it('returns null with empty topics', () => {
    const { toJSON } = renderWithProviders(
      <RelatedTopics topics={[]} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows topic labels', () => {
    const { getByText } = renderWithProviders(
      <RelatedTopics topics={topics} onPress={jest.fn()} />,
    );
    expect(getByText('Forgiveness')).toBeTruthy();
    expect(getByText('Grace')).toBeTruthy();
  });
});
