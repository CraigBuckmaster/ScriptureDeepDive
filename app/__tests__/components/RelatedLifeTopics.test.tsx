import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import RelatedLifeTopics from '@/components/RelatedLifeTopics';

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const RN = require('react-native');
    return <RN.Text>{label}</RN.Text>;
  },
}));

describe('RelatedLifeTopics', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<RelatedLifeTopics />);
    }).not.toThrow();
  });

  it('returns null when no JSON provided', () => {
    const { toJSON } = renderWithProviders(<RelatedLifeTopics />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when JSON is null', () => {
    const { toJSON } = renderWithProviders(
      <RelatedLifeTopics relatedLifeTopicsJson={null} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for empty array JSON', () => {
    const { toJSON } = renderWithProviders(
      <RelatedLifeTopics relatedLifeTopicsJson="[]" />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const { toJSON } = renderWithProviders(
      <RelatedLifeTopics relatedLifeTopicsJson="not json" />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders topics from valid JSON', () => {
    const json = JSON.stringify([
      { topic_id: 'forgiveness', title: 'Forgiveness' },
      { topic_id: 'grace', title: 'Grace' },
    ]);
    const { getByText } = renderWithProviders(
      <RelatedLifeTopics relatedLifeTopicsJson={json} />,
    );
    expect(getByText('Forgiveness')).toBeTruthy();
    expect(getByText('Grace')).toBeTruthy();
  });

  it('shows Related Topics heading', () => {
    const json = JSON.stringify([{ topic_id: 'faith', title: 'Faith' }]);
    const { getByText } = renderWithProviders(
      <RelatedLifeTopics relatedLifeTopicsJson={json} />,
    );
    expect(getByText('Related Topics')).toBeTruthy();
  });

  it('filters out invalid items', () => {
    const json = JSON.stringify([
      { topic_id: 'valid', title: 'Valid Topic' },
      { topic_id: 123, title: 'Invalid ID' },
      null,
      { title: 'Missing ID' },
    ]);
    const { getByText, queryByText } = renderWithProviders(
      <RelatedLifeTopics relatedLifeTopicsJson={json} />,
    );
    expect(getByText('Valid Topic')).toBeTruthy();
    expect(queryByText('Invalid ID')).toBeNull();
  });
});
