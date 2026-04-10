import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ArchaeologyBrowseScreen from '@/screens/ArchaeologyBrowseScreen';

jest.mock('@/hooks/useArchaeology', () => ({
  useArchaeologyBrowse: jest.fn().mockReturnValue({ data: [], loading: false }),
  useArchaeologySearch: jest.fn().mockReturnValue({
    search: '',
    setSearch: jest.fn(),
    results: [],
    searching: false,
  }),
}));

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

jest.mock('@/components/ArchaeologyCard', () => ({
  ArchaeologyCard: () => null,
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('ArchaeologyBrowseScreen', () => {
  it('renders the screen title', () => {
    const { getByText } = renderWithProviders(<ArchaeologyBrowseScreen />);
    expect(getByText('Archaeological Evidence')).toBeTruthy();
  });

  it('shows empty message when no discoveries', () => {
    const { getByText } = renderWithProviders(<ArchaeologyBrowseScreen />);
    expect(getByText('No archaeological discoveries available')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ArchaeologyBrowseScreen />);
    }).not.toThrow();
  });
});
