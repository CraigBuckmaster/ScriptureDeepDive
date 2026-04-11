import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import LensBrowseScreen from '@/screens/LensBrowseScreen';

jest.mock('@/hooks/useAsyncData', () => ({
  useAsyncData: jest.fn().mockReturnValue({ data: [], loading: false }),
}));

jest.mock('@/db/content/hermeneutics', () => ({
  getAllLenses: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('LensBrowseScreen', () => {
  it('renders the screen header', () => {
    const { getByText } = renderWithProviders(<LensBrowseScreen />);
    expect(getByText('Hermeneutic Lenses')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<LensBrowseScreen />);
    }).not.toThrow();
  });
});
