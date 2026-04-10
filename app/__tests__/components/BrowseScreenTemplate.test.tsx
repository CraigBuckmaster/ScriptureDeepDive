import React from 'react';
import { Text } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { BrowseScreenTemplate } from '@/components/BrowseScreenTemplate';

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/SearchInput', () => ({
  SearchInput: () => null,
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => null,
}));

describe('BrowseScreenTemplate', () => {
  it('renders loading state', () => {
    const result = renderWithProviders(
      <BrowseScreenTemplate
        title="Test Browse"
        loading={true}
        data={[]}
        renderItem={() => <Text>item</Text>}
        keyExtractor={(_, i) => String(i)}
      />,
    );
    expect(result.getByText('Test Browse')).toBeTruthy();
  });

  it('renders empty state when no data', () => {
    const { getByText } = renderWithProviders(
      <BrowseScreenTemplate
        title="Browse Items"
        loading={false}
        data={[]}
        renderItem={() => <Text>item</Text>}
        keyExtractor={(_, i) => String(i)}
        emptyMessage="Nothing here"
      />,
    );
    expect(getByText('Nothing here')).toBeTruthy();
  });
});
