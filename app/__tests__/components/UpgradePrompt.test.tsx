import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { UpgradePrompt } from '@/components/UpgradePrompt';

describe('UpgradePrompt', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    variant: 'feature' as const,
    featureName: 'Interlinear Hebrew & Greek',
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the feature name', () => {
    const { getByText } = renderWithProviders(
      <UpgradePrompt {...defaultProps} />,
    );
    expect(getByText('Interlinear Hebrew & Greek')).toBeTruthy();
  });

  it('renders the CTA button', () => {
    const { getByText } = renderWithProviders(
      <UpgradePrompt {...defaultProps} />,
    );
    expect(getByText('Unlock with Companion+')).toBeTruthy();
  });

  it('calls onClose when "Not Now" is pressed', () => {
    const { getByText } = renderWithProviders(
      <UpgradePrompt {...defaultProps} />,
    );
    fireEvent.press(getByText('Not Now'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // HWGTB #1555 — copy deck for the four bundle features. Regression guard
  // against the FEATURE_DESCRIPTIONS lookup falling back to the generic
  // "Unlock {name} and other premium study tools." fallback.
  describe('HWGTB feature descriptions', () => {
    it.each([
      ['Extra-Biblical Literature', /1 Enoch, Jubilees, the Apocrypha/],
      ['Canon Comparison', /Protestant, Catholic, Orthodox, and Ethiopian/],
      ['How We Got The Bible', /canon formation and textual transmission/],
      ['Second Temple Context', /Intertestamental literature background/],
    ])('shows the description for "%s"', (featureName, expected) => {
      const { getByText } = renderWithProviders(
        <UpgradePrompt {...defaultProps} featureName={featureName} />,
      );
      expect(getByText(expected)).toBeTruthy();
    });
  });
});
