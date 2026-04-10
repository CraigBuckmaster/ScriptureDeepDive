import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ThreadBrowseScreen from '@/screens/ThreadBrowseScreen';

jest.mock('@/hooks/useThreads', () => ({
  useThreads: jest.fn().mockReturnValue({ threads: [], isLoading: false }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));

describe('ThreadBrowseScreen', () => {
  it('renders the screen header', () => {
    const { getByText } = renderWithProviders(<ThreadBrowseScreen />);
    expect(getByText('Threads')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ThreadBrowseScreen />);
    }).not.toThrow();
  });
});
