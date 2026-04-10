import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SubmissionFlowScreen from '@/screens/SubmissionFlowScreen';

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/submission', () => ({
  TypeSelector: () => null,
  SubmissionPreview: () => null,
  TopicProposal: () => null,
}));

jest.mock('@/services/contentModeration', () => ({
  screenSubmission: jest.fn().mockResolvedValue({ passed: true }),
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('SubmissionFlowScreen', () => {
  it('renders the screen header', () => {
    const { getByText } = renderWithProviders(<SubmissionFlowScreen />);
    expect(getByText('Select Type')).toBeTruthy();
  });

  it('renders step indicator', () => {
    const { getByText } = renderWithProviders(<SubmissionFlowScreen />);
    // Step 1 of 5
    expect(getByText(/1/)).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<SubmissionFlowScreen />);
    }).not.toThrow();
  });
});
