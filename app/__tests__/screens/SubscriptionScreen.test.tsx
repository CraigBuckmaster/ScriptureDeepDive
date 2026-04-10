import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SubscriptionScreen from '@/screens/SubscriptionScreen';

jest.mock('@/stores/premiumStore', () => ({
  usePremiumStore: jest.fn((selector) =>
    selector({
      isPremium: false,
      purchaseType: null,
    }),
  ),
}));

jest.mock('@/services/purchases', () => ({
  PLANS: [
    { id: 'monthly', name: 'Monthly', price: '$4.99' },
    { id: 'annual', name: 'Annual', price: '$29.99' },
    { id: 'lifetime', name: 'Lifetime', price: '$79.99' },
  ],
  purchasePlan: jest.fn().mockResolvedValue(false),
  restorePurchases: jest.fn().mockResolvedValue(false),
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

describe('SubscriptionScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<SubscriptionScreen />);
    }).not.toThrow();
  });

  it('renders the Companion+ hero title', () => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('Companion+')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('Every Perspective. Every Tool.')).toBeTruthy();
  });
});
