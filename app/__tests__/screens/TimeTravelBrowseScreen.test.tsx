import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import TimeTravelBrowseScreen from '@/screens/TimeTravelBrowseScreen';

jest.mock('@/hooks/useInterpretations', () => ({
  useInterpretationEras: jest.fn().mockReturnValue({ data: [], loading: false }),
}));

jest.mock('@/hooks/useAsyncData', () => ({
  useAsyncData: jest.fn().mockReturnValue({ data: [], loading: false }),
}));

jest.mock('@/db/content/interpretations', () => ({
  getInterpretationsByEra: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/BrowseScreenTemplate', () => ({
  BrowseScreenTemplate: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/interpretations/EraCard', () => ({
  EraCard: () => null,
}));

jest.mock('@/components/interpretations/InterpretationCard', () => ({
  InterpretationCard: () => null,
}));

jest.mock('@/components/interpretations/EraTimeline', () => ({
  EraTimeline: () => null,
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('TimeTravelBrowseScreen', () => {
  it('renders the screen title', () => {
    const { getByText } = renderWithProviders(<TimeTravelBrowseScreen />);
    expect(getByText('Time-Travel Reader')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<TimeTravelBrowseScreen />);
    }).not.toThrow();
  });
});
