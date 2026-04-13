import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';

jest.mock('@/db/content', () => ({
  getLifeTopicCategories: jest.fn(),
}));

import { LifeTopicGrid, pickTopCategories } from '@/components/explore/LifeTopicGrid';
import type { LifeTopicCategory } from '@/types';
const { getLifeTopicCategories } = require('@/db/content');

const CATS: LifeTopicCategory[] = [
  { id: 'mental', name: 'Mental Health', display_order: 1 },
  { id: 'relation', name: 'Relationships', display_order: 2 },
  { id: 'identity', name: 'Identity', display_order: 3 },
  { id: 'struggle', name: 'Struggles', display_order: 4 },
  { id: 'modern', name: 'Modern Life', display_order: 5 },
];

describe('LifeTopicGrid', () => {
  it('renders up to 4 categories sorted by display_order', () => {
    const { getByText, queryByText } = renderWithProviders(
      <LifeTopicGrid onCategoryPress={jest.fn()} categories={CATS} />,
    );
    expect(getByText('Mental Health')).toBeTruthy();
    expect(getByText('Relationships')).toBeTruthy();
    expect(getByText('Identity')).toBeTruthy();
    expect(getByText('Struggles')).toBeTruthy();
    expect(queryByText('Modern Life')).toBeNull();
  });

  it('shows topic counts when provided', () => {
    const { getByText } = renderWithProviders(
      <LifeTopicGrid
        onCategoryPress={jest.fn()}
        categories={CATS}
        topicCounts={{ mental: 5, relation: 1 }}
      />,
    );
    expect(getByText('5 topics')).toBeTruthy();
    expect(getByText('1 topic')).toBeTruthy();
  });

  it('calls onCategoryPress with the category id', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <LifeTopicGrid onCategoryPress={onPress} categories={CATS} />,
    );
    fireEvent.press(getByText('Relationships'));
    expect(onPress).toHaveBeenCalledWith('relation');
  });

  it('returns null for empty categories', () => {
    const { queryByText } = renderWithProviders(
      <LifeTopicGrid onCategoryPress={jest.fn()} categories={[]} />,
    );
    expect(queryByText('Mental Health')).toBeNull();
  });

  it('fetches categories from the DB when no override is provided', async () => {
    (getLifeTopicCategories as jest.Mock).mockResolvedValueOnce([
      { id: 'foo', name: 'Foo Category', display_order: 1 },
    ]);
    const { findByText } = renderWithProviders(<LifeTopicGrid onCategoryPress={jest.fn()} />);
    expect(await findByText('Foo Category')).toBeTruthy();
  });
});

describe('pickTopCategories', () => {
  it('returns up to n sorted by display_order', () => {
    const input = [
      { id: 'c', name: 'C', display_order: 3 },
      { id: 'a', name: 'A', display_order: 1 },
      { id: 'b', name: 'B', display_order: 2 },
    ];
    const out = pickTopCategories(input, 2);
    expect(out.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('defaults to 4 when n is omitted', () => {
    const input = [1, 2, 3, 4, 5, 6].map((i) => ({
      id: `c${i}`,
      name: `C${i}`,
      display_order: i,
    }));
    expect(pickTopCategories(input)).toHaveLength(4);
  });
});
