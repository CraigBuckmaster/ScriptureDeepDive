import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import GrammarBrowseScreen from '@/screens/GrammarBrowseScreen';

jest.mock('@/db/content/grammar', () => ({
  getGrammarArticles: jest.fn().mockResolvedValue([]),
  searchGrammarArticles: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/SearchInput', () => ({ SearchInput: () => null }));
jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('GrammarBrowseScreen', () => {
  it('renders the screen title', () => {
    const { getByText } = renderWithProviders(<GrammarBrowseScreen />);
    expect(getByText('Grammar Reference')).toBeTruthy();
  });

  it('renders language tabs', () => {
    const { getByText } = renderWithProviders(<GrammarBrowseScreen />);
    expect(getByText('Greek')).toBeTruthy();
    expect(getByText('Hebrew')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<GrammarBrowseScreen />);
    }).not.toThrow();
  });
});
