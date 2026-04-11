/**
 * Tests for PrayerPromptCard component.
 */
import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PrayerPromptCard } from '@/components/PrayerPromptCard';

describe('PrayerPromptCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the Reflect & Pray title', () => {
    const { getByText } = renderWithProviders(
      <PrayerPromptCard prompt="Thank God for His creation." />,
    );
    expect(getByText('Reflect & Pray')).toBeTruthy();
  });

  it('renders the prompt text', () => {
    const { getByText } = renderWithProviders(
      <PrayerPromptCard prompt="Thank God for His creation." />,
    );
    expect(getByText('Thank God for His creation.')).toBeTruthy();
  });

  it('renders different prompt text', () => {
    const { getByText } = renderWithProviders(
      <PrayerPromptCard prompt="Consider how this passage applies to your life." />,
    );
    expect(getByText('Consider how this passage applies to your life.')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<PrayerPromptCard prompt="Test prompt" />);
    }).not.toThrow();
  });
});
