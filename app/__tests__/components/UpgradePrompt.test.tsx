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
});
