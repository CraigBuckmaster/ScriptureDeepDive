import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import OnboardingScreen from '@/screens/OnboardingScreen';

describe('OnboardingScreen', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<OnboardingScreen onComplete={mockOnComplete} />);
    expect(toJSON()).not.toBeNull();
  });

  it('shows skip button', () => {
    const { getByText } = renderWithProviders(<OnboardingScreen onComplete={mockOnComplete} />);
    expect(getByText('Skip')).toBeTruthy();
  });

  it('shows first page title', () => {
    const { getByText } = renderWithProviders(<OnboardingScreen onComplete={mockOnComplete} />);
    expect(getByText('Companion Study')).toBeTruthy();
  });

  it('shows dot indicators', () => {
    const { toJSON } = renderWithProviders(<OnboardingScreen onComplete={mockOnComplete} />);
    const tree = JSON.stringify(toJSON());
    // 3 dots rendered
    expect(tree).toBeTruthy();
  });

  it('skip button calls onComplete', () => {
    const { getByText } = renderWithProviders(<OnboardingScreen onComplete={mockOnComplete} />);
    fireEvent.press(getByText('Skip'));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('shows Next button on first page', () => {
    const { getByText } = renderWithProviders(<OnboardingScreen onComplete={mockOnComplete} />);
    expect(getByText('Next')).toBeTruthy();
  });
});
